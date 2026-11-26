# Independent architecture audit (Brand OS v0.2)

Author: Claude Code, working on branch `feat/brand-os-v0.2`.
Baseline: `8b3d3b0` (`main`). At baseline, `npm run ci` passed with 37 tests.
Inputs: the owner's brief, an earlier review, and a direct reading of the source, schemas, tests and workflows.
Line numbers refer to the baseline unless a row says otherwise.

This document records what was verified in code. Where it disagrees with the brief or the earlier review, it says so and gives the reason.

## 1. Architecture assessment

The repository is a template monorepo (npm workspaces, Node ≥ 22):

- `packages/brand-core`: the interview engine, ledger, facts, approval, publication, projection, backup, query tools. About 3.6k lines. `engine.ts` alone is 1,170 lines.
- `packages/design-tokens`: DTCG compile, CSS/TS export, alias-cycle and contrast checks.
- `packages/asset-catalog`: asset publication inspection (symlink, traversal, active SVG, checksum).
- `apps/docs`: a Docusaurus portal (en, fa RTL, tr) fed by `scripts/prepare-docs.ts`.
- `brand/`: the brand instance. It holds config, 205 interview questions, the ledger, draft and approved facts, 20 brand modules plus 12 Business OS modules, a 90-state mascot catalog, tokens and the publication policy.
- `scripts/`: the CLI (`brand.ts`), the MCP server (`mcp.ts`), docs preparation, and a public canary scan.

The data model is sound:

- Each answer is appended to a ledger.
- Draft and approved facts are kept in separate canonical files.
- Approval needs a human proof.
- Publication is a separate, deny-by-default allowlist (`publication-policy.yaml`).
- The public projection is built from that allowlist, not by filtering out what is private.
- Restricted values live encrypted in `brand/.private` and only an opaque `private_ref` appears in tracked files.

Where it falls short is the product's headline promise:

- Agents cannot reach the brand they are meant to serve.
- The interview is a rigid one-question CLI.
- Approval works one question at a time.
- Documents are field dumps.

## 2. Strengths worth preserving

- **Single gate for reads and writes.** `authorize()` (`auth.ts:51`) is called from submit, change, approve, publish, export and every query tool.
- **Allowlist publication.** `projection.ts:25` `exportPublic` and `publication.ts:43` `factIsPublic` require `approved` + `published` + `public` + policy membership. A brand id mismatch throws (`publication.ts:23`).
- **A private brand cannot be built as public** (`prepare-docs.ts:41`). There is no env override.
- **Approval proof.** An actor string alone is rejected. The proof comparison is constant-time over sha256 (`private-store.ts:84`).
- **Stale change protection.** `approveChange` checks `expected_version` against the current approved version (`engine.ts:493`).
- **Token approval is hash-bound.** A changed hex drops the token from retrieval (`query.ts:61-67`).
- **Encrypted backups.** AES-GCM, a checksum, no nested backups, and an env-only key (`backup.ts`, `private-store.ts:16`).
- **Asset inspection.** Symlink, `..`, encoded traversal, absolute path, active SVG and checksum mismatch are rejected (`asset-catalog/src/index.ts:23`).
- **Honest missing data.** `unknown`, `skip`, `not relevant` and `decide later` are stored as real answers. Compiled pages leave missing sections missing.

None of these should be rewritten. The v0.2 work extends them.

## 3. Verified deficiencies (product)

| Area | Evidence | Effect |
| --- | --- | --- |
| Agent access | `scripts/mcp.ts:27` hard-wires `guestContext`. `query.ts:31` `guard()` denies guest/agent/public on any private brand. `auth.ts:62` limits `agent` to published public facts. | On the default private brand (`brand:init --publish private`), every MCP tool and `brand:query` returns `denied`. There is no path for an internal agent. |
| Interview drive | `scripts/brand.ts:80` `--question` only answers the *current* question. NL capture is a `Label: value` regex (`engine.ts:877-891`). | A coding agent cannot run the interview, and free text mostly maps to nothing. |
| Persian routing | `engine.ts:291`: any Persian text over 12 characters that is not a command goes to NL capture. | **Bug.** A Persian answer to the current question was turned into a proposal list and never recorded. Fixed in this phase. |
| Approval UX | `brand:approve` takes one `--question`. `publishFact` (`engine.ts:741`) has no CLI. | Owners approve field by field and cannot publish without writing code. |
| Documents | `compile-docs.ts`, `documents.ts`: field lists per module. | There is no brand book, business plan or marketing plan a person would hand to someone. |
| Finance | Only `artifacts.ts` `allocateBudget`/`financeScenario`. No CAC, LTV, churn, runway or break-even. | Priority D has no engine. |
| Onboarding | `.env.example` did not mention `BRAND_OS_DATA_KEY`. No command created `brand/.private/approval-secret`, although README says it "is created". | A new owner could not encrypt restricted answers or approve anything without reading source. Fixed in this phase (see §5 G8). |
| Docs drift | `docs/IMPLEMENTATION_STATUS.md:49` said the key sits next to the ciphertext. `private-store.ts:16` reads it from env only. `CHANGELOG.md:12` said "five skills"; there are 10. `AGENTS.md:20` described `--include-unapproved` as unlocking EXAMPLE values; the flag was parsed and ignored. | Agents and owners got wrong instructions. Fixed in this phase. |

## 4. Security findings

Scope: `auth.ts`, `permissions.ts`, `publication.ts`, `projection.ts`, `facts.ts`, `engine.ts`, `backup.ts`, `query.ts`, `asset-catalog/src/index.ts`, `prepare-docs.ts`, `scan-public.ts`, `mcp.ts`.

| ID | Finding | Evidence | Severity | Status |
| --- | --- | --- | --- | --- |
| G1 | Writes were not atomic. The earlier review said they were; only `backup.ts` had an atomic helper. Approved facts, the ledger, the publication policy, the private store and drafts were written with a plain `writeFileSync`. A crash could leave a truncated YAML file. | `fsutil.ts:9-17`, `private-store.ts:62`, `documents.ts:58`, `engine.ts:996,1147` | High (integrity) | **Fixed in Phase 1.** `fsutil.writeAtomic` writes a temp file, fsyncs it, renames it, then fsyncs the directory. It cleans up on failure and takes an optional mode. Every helper and private write uses it. Tests: `tests/onboarding.test.ts`. |
| G2 | `approve()` always wrote `version: 1`. Re-approving an approved field reset the version that `approveChange`'s stale check depends on, so an old proposal against v1 could land again. | `engine.ts:558`, `engine.ts:493` | High (governance) | **Fixed in Phase 1.** Re-approving an approved field is refused and routed to the change-proposal flow. Otherwise the version is the previous approved version + 1. Tests: `tests/onboarding.test.ts`. |
| G3 | The approval proof is passed on argv (`--proof`). It is visible in shell history and `ps`. | `scripts/brand.ts:111` | Medium | Fixed in Phase 3. The proof comes from `BRAND_OS_APPROVAL_PROOF`, piped stdin, or a hidden prompt. `--proof` is refused rather than deprecated (owner decision). |
| G4 | Roles are self-asserted once the shared proof matches. Anyone holding the proof can approve as `owner` or `finance`. | `auth.ts:37` `verifiedHumanContext` | Medium | Accepted for now, as single-owner security. Per-person identity is an owner decision (§10). |
| G5 | `publishFact` has no CLI entry point. | `engine.ts:741` | Low (UX) | Fixed in Phase 3: `brand:publish --ids|--module [--unpublish]`. |
| G6 | `permissionFor` guesses the approval grant from substrings of the question id (`finance`, `pricing`, `budget`, `.share`). A new id can land in the wrong grant. | `permissions.ts:13-21` | Medium | Fixed in Phase 3: optional `approval_grant` is preferred; restricted questions must map to `financial`. |
| G7 | `restoreBrand` checked each path inside the write loop. A backup with one unsafe entry after valid ones left a half-restored tree. | `backup.ts:86-93` | Medium (integrity) | **Fixed in Phase 1.** All paths are validated by segment before any write. Test: `restore with one unsafe path writes nothing`. |
| G8 | No command created the approval secret. | `private-store.ts:70` `ensureApprovalSecret` had no caller outside tests | Low (onboarding) | **Fixed in Phase 1.** `npm run brand:doctor -- --create-approval-secret` creates it with mode 0600 and never prints it. |
| G9 | Any local process running as the owner can read `brand/.private/approval-secret`, including a coding agent with shell access. "Agents cannot approve" holds for MCP and the query tools only. It does not hold for an agent that can run `cat`. | `private-store.ts:66` | Medium | Documented limit. Mitigations are owner decisions: keep the proof outside the repo (env or keychain, Phase 3 makes this possible), or require per-person signing. |
| G10 | `scan-public.ts` checks for a fixed list of five canary strings. It catches regressions in the projection, but it is not proof that nothing private leaked. | `scan-public.ts:4` | Info | Kept, and described as a canary only. Phase 2 extends it to the token file. |
| G11 | The MCP server and `brand:query` cannot tell principals apart. The only identity is guest. | `scripts/mcp.ts:27` | High (product) | Phase 2: scoped agent tokens resolved once at startup. |

What this is: **local single-owner security**. The working tree, `brand/.private` and the env key are protected only by the operating-system account. Production multi-user security needs per-person identity, a server-side session, audit signing and key management. None of those exist yet and none are claimed.

## 5. Invariant checklist (brief §10)

Legend:

- **verified**: read in code.
- **test-covered**: a named test fails if it breaks.
- **gap**: not true, or not tested.

| # | Invariant | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Draft information is never accidentally published | verified, test-covered | `factIsPublic` requires `approved`+`published`+policy membership. Test: `public publication is opt-in, including facts, pages, and assets`. |
| 2 | Internal information never appears in guest results | verified, test-covered | `guard()` and `authorize()`. Tests: `guest cannot read an internal canary by passing include_unapproved`, `public MCP never returns draft components, private metrics or token values`. |
| 3 | Restricted data never appears in public builds | verified, test-covered (canary) | Restricted values are stored as `private_ref` only. Tests: `restricted canary is absent from tracked files and public artifacts`, `public prepare hides the mascot module and the restricted canary`. Coverage is canary-based (G10). |
| 4 | Public facts require explicit publication authorization | verified, test-covered | `publishFact` needs the proof. Test: `public publication is opt-in…`. |
| 5 | Public assets require explicit publication authorization | verified, test-covered | `assetIsPublic` plus the policy `approved_asset_ids`. Same test. |
| 6 | Published token values match approved revisions | verified, test-covered | `query.ts:61-67` hash compare. Test: `an approved token hash does not survive a changed value`. |
| 7 | Approval is not equivalent to publication | verified, test-covered | `writeApprovedFact` always writes `publication: 'unpublished'`. Test: `two approved changes cannot reuse the same previous revision` asserts an empty public export after approval. |
| 8 | Agents cannot approve their own proposals | verified for MCP and query tools; **gap** for shell agents | `authorize()` denies `approve` to agent and guest. A shell-capable agent can read the proof file (G9). |
| 9 | Stale approval proposals cannot overwrite newer revisions | verified, test-covered, **fixed** | It was broken by re-approval resetting the version (G2). Tests: `two approved changes cannot reuse…`, `re-approving is refused and never resets the approved version to 1`. |
| 10 | Brand instances cannot read each other's protected data | verified, test-covered | `authorize` denies on `brand_id` mismatch. Policy brand id check. Test: `authorization matrix denies guests, agents, and other brands`. |
| 11 | Backups do not recursively contain older backups | verified, test-covered | `backup.ts` filter. Test: `migration log stays parseable and backups never contain earlier backups`. |
| 12 | Restore validates integrity and paths | verified, test-covered, **fixed** | Checksum plus GCM tag. Paths are now validated before any write (G7). Tests: `backup refuses overwrite…`, `restore with one unsafe path writes nothing`. |
| 13 | Migration preserves approved data and remains repeatable | verified, test-covered | Tests: `fact migration rewrites schema 1 without changing the value`, `migration log stays parseable…` (idempotent). |
| 14 | Invalid or malicious asset files are rejected | verified, test-covered | Tests: `symlink, traversal, and active SVG are rejected`, `unsafe SVG variants are rejected even without script elements`, `checksum mismatch is rejected…`. SVG checking is pattern-based, not a full sanitizer. |
| 15 | Source maps and generated artifacts are included in security checks | verified, test-covered (canary) | `scanPublicTree` walks every file in the build. Test: `public scan catches a canary in a source map…`. |

Hardening items from the brief:

| Item | Status |
| --- | --- |
| SVG sanitization | Reject-list inspection, no sanitizer. Keep rejecting rather than sanitizing. |
| CSP | None. Deferred (P2). |
| Path traversal, symlinks | Checked for assets and restore. |
| File type detection | Extension-based plus SVG content checks. |
| Asset integrity hashes | Present. |
| Concurrent writes | No locking. Single-owner local use; atomic writes cover crash safety, not two writers. |
| Atomic writes | Fixed (G1). |
| Audit logging | The ledger records answers. There is no access log; Phase 2 adds one that never stores values. |
| Secret management | Env key plus local proof file. See G3, G9. |
| Key rotation | None. Deferred. |
| Backup/restore testing | Present. Extended in this phase. |
| Public artifact scanning | Canary only (G10). |
| Dependency vulnerabilities | No `npm audit` gate in CI. Deferred (P2). |

## 6. Missing product workflows

1. An internal agent reading approved internal facts for a private brand (Phase 2).
2. An agent conducting the interview: answer any question id, JSON output, a validated proposal intake (Phase 4).
3. Batch review, batch approve and publish/unpublish from the CLI (Phase 3).
4. Structured core answers (color, font, logo spec, voice) becoming draft tokens and a cited brand book (Phase 5).
5. Finance calculations that return `missing` instead of inventing numbers (Phase 6).
6. Mascot lookup by stage, emotion and use, returning approved art or an explicit missing list (Phase 6).
7. Environment self-check for new owners. Done here: `brand:doctor`.

## 7. Proposed architecture

Keep the deterministic engine as the source of truth. Add narrow layers around it:

- **Identity:**
  - Owner-issued local agent tokens, stored as hashes in `brand/.private/`.
  - Resolved once at server start from `BRAND_OS_AGENT_TOKEN`, then mapped to a fixed profile (`internal-read`, `design`, `marketing`, `finance`).
  - Tokens never carry `approve`, `write` or `restricted`.
  - No tool accepts a role or token argument.
- **Retrieval:** one `brandRetrieve(engine, ctx, request)` code path. It returns an envelope with `brand_id`, classification, approval state, revision, source path and `missing[]`. The existing 17 tools become thin wrappers. An append-only access log records ids and decisions, never values.
- **Governance:**
  - An `approval.ts` service is extracted from `engine.ts`.
  - Batch approve and publish take one proof per batch, read from env or a prompt.
  - An explicit `approval_grant` replaces the substring guess.
- **Interview:**
  - The coding agent is the interviewer.
  - Model output is an untrusted, schema-validated `ProposalBatch` stored as drafts.
  - A provider adapter has a deterministic mock and one HTTP provider that is off unless configured.
  - Restricted fields are never sent to a provider.
- **Documents:** a typed section model (`approved | assumption | recommendation | missing`, with source ids) for the brand book, business plan and marketing plan only.

## 8. Recommendations rejected or modified

| Brief priority | Verdict | Reason |
| --- | --- | --- |
| A Internal AI access | Accept the need; modify the design | An 8-principal identity platform is too heavy for a single-owner local tool. Scoped local agent tokens plus one retrieval path solve the actual gap. SSO gets an interface and docs only. |
| B Intelligent interview | Modify | The coding agent drives it through JSON CLI commands and validated proposals. The built-in LLM adapter is optional, mock-tested and off by default. The deterministic engine stays authoritative. |
| C Document generation | Modify (narrow) | Typed renderers for three documents first. The other ~30 modules keep the generic renderer. No PDF yet. |
| D Finance | Accept, as a pure library | Typed results with basis and formula, or explicit `missing`. Inputs stay outside Git or in restricted storage. |
| E Mascot | Partially accept | The catalog already has 90 states. Add a lifecycle enum, optional fields and a finder. Gallery polish is deferred. |
| F Design system / Figma | Defer most | Tokens, contrast checks and the fixture Figma import already exist. Only tokens from structured answers are taken on (Phase 5). |
| G Security audit | Accept | This document. The confirmed bugs G1, G2, G7 and G8 are fixed in this phase. G3, G5, G6 and G11 are planned. |
| H Multi-brand / upgrade | Accept doctor + upgrade test; defer npm publishing | Publishing is an owner decision on registry and license. |
| I Portal UX | Modify | A brand-book page and an internal status dashboard. The browser interview UI is deferred: it needs a write-capable local server with auth. |
| J Journeys | Accept | Built up per phase, then assembled as A/B/C with the mock provider. |

Earlier review P0s:

- **Accepted:** authenticated internal MCP, the agent interview skill, batch approve/publish, structured core to tokens, `BRAND_OS_DATA_KEY` in `.env.example`, `brand:doctor`, the outdated security note, the Persian routing bug, the skill count, the founder-core profile, and an explicit `approval_grant`.
- **Modified:** "split `engine.ts`". Only the approval service is extracted (Phase 3), not a big-bang refactor.
- **Rejected:** the earlier review's claim that writes were already atomic. They were not (G1).

## 9. Prioritized execution plan

| Phase | Scope | Key tests |
| --- | --- | --- |
| 1 (this) | This audit. G1, G2, G7, G8 and the Persian routing fix. Doc corrections. `BRAND_OS_DATA_KEY` in `.env.example`. `brand:doctor`. | `tests/onboarding.test.ts`, `tests/doctor.test.ts` |
| 2 | Agent tokens, `brandRetrieve`, access log, MCP and `brand:query` resolve identity at startup. | `tests/agent-access.test.ts` |
| 3 | `approval.ts`, `brand:review --module`, batch `brand:approve`, `brand:publish`/`--unpublish`, proof from env or prompt, `approval_grant`. | `tests/approval-batch.test.ts` |
| 4 | Any-question JSON interview, `brand:next`, `brand:propose`, LLM adapter with mock, founder-core profile, interviewer skill. | `tests/interview-ai.test.ts` |
| 5 | Structured question types, draft token generation, brand book plus business and marketing plan renderers, brand-book page. | token and brand-book tests |
| 6 | `finance.ts` plus `brand:finance`, mascot lifecycle and finder. | finance table, mascot finder tests |
| 7 | Journeys A/B/C, internal dashboard, final review, README, changelog. | `tests/journeys.test.ts` |

## 10. Risks and assumptions

**Assumptions**

- Single owner, local machine, trusted OS account. Restricted data is never sent to an external model provider.
- Agent tokens with the `finance` profile cannot read restricted values by default.
- The approval secret stays a single shared secret for now. From Phase 3 it is read from env or a prompt, never from argv.
- Anthropic may become the one real LLM provider. It stays disabled unless configured, and tests never touch the network.
- The license stays MIT. Changing it is the owner's decision and is not part of this work.

**Risks**

- **G9** means a shell-capable agent can approve. This is documented, not solved. Any change needs an owner decision on where the proof lives.
- Restricted data becomes permanently unreadable if `BRAND_OS_DATA_KEY` is lost. There is no rotation or escrow tooling.
- There is no locking for concurrent writers. Atomic writes prevent torn files but not lost updates from two simultaneous processes.
- Canary scans can miss a leak that uses a value not on the canary list (G10).
- `engine.ts` stays large. Extracting only what each phase touches limits risk but leaves debt.

**Owner decisions needed**

1. License (stays MIT unless the owner decides otherwise).
2. Hero outcome for the README.
3. LLM provider choice and whether restricted data may ever be sent. The default is never.
4. The four agent token profiles, and whether `finance` may read restricted values over MCP. The default is no.
5. Per-person approval identity, or keep the shared proof.
6. npm publishing of the core.
7. Review of the ~40 founder-core question ids (Phase 4).
