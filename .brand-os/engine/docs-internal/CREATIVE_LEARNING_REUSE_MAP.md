# Creative Learning: reuse map (Sprint 0)

Change-control document for the Creative Learning MVP. It says which existing code is reused, which small new types
are added, and which duplicate systems are forbidden. Reviewers: reject any Sprint 1 change that contradicts it.

## Audit baseline (2026-11-21)

| Item | Checked value |
| --- | --- |
| Default branch | `main` @ `fa476ceeaf753984f1e269665335f82cf68b18d8` |
| PR #9 `feat: knowledge inbox (Baalda-inspired)` | **Open, Draft**, head `4748e7f54f418506859066961826688028f70a64`, base `main`, GitHub reports mergeable. Not merged. |
| PR #9 milestones (from its source, not just its description) | A (store, search, share, restricted, doctor), B (`propose`/`provenance` bridge over the existing intake, `knowledge-read` profile, five read-only MCP tools) and C (read-only Studio Knowledge page) are all present in the code at `4748e7f`. The v1.1 spec's "B and C not started" is out of date. |
| PR #8 `feat: template sync (part 1)` | Open, not draft, head `42aef8930c7bea962d7ba1fd8f4e698c1d661efa`. |
| PR #6 Phase 10 prep | Open, head `6ee057dff0d9b62de802fe334a202454174cb403`. Not touched here. |
| PR #9 × PR #8 | `git merge-tree` reports **existing** conflicts in `apps/studio/src/i18n/{en,fa,tr}.ts`, `apps/studio/src/projection.ts`, `packages/brand-core/src/index.ts`, `tests/studio-browser.test.ts`. They are not caused by this work. |
| This branch | `feat/creative-learning`, created at PR #9's head `4748e7f`, clean. |
| Baseline `npm run ci` at `4748e7f` (run locally, Node 24.22.1) | Exit 0. 287 tests: 286 pass, 0 fail, 1 skipped (optional real Caddy binary test, `CADDY_BIN` unset). The run regenerates `llms*.txt` and `apps/docs` data files; they were restored, not committed. |

## Source files read

`docs-internal/KNOWLEDGE.md`; `packages/brand-core/src/knowledge/{model,store,workspace,proposals,agent,index}.ts`;
`scripts/knowledge.ts`; `packages/brand-core/src/{auth,private-store,asset-rights}.ts`; the query entry points in
`packages/brand-core/src/query.ts` (`brandRetrieve`, `searchBrandDocs`); the MCP tool registration in `scripts/mcp.ts`;
`brand/assets/asset-manifest.yaml`; Studio's archive filter (`apps/studio/src/github/tar.ts`); `AGENTS.md`;
`tests/helpers/knowledge.ts`, `tests/knowledge-{cli,security}.test.ts`.

## Map: old module → reused for → new small type → privacy/access → tests

| Existing module (PR #9 / main) | Reused for | New small type | Privacy / access | Tests |
| --- | --- | --- | --- | --- |
| `knowledge/store.ts` `captureNote` | Every piece of owner feedback (verbatim, any language) and every inspiration commentary is a Knowledge note. `brand:creative feedback --text` calls `captureNote`; `--note kn_…` links a note that already exists. | none | Local by default (`brand/.private/knowledge/local`, 0600). Restricted notes cannot be linked. | journey, security |
| `knowledge/model.ts` `revisionOf`, `kn_` ids | Every link is `{ id: kn_…, revision: sha256 }` recorded at link time. | `NoteRef { id, revision }` | ids only | stale-revision test |
| `knowledge/store.ts` `findNote` (local + shared scopes only) | Retrieval reads the **current** note to quote the reason and compares its revision with the recorded one. | none | `findNote` without `includeRestricted` never decrypts; wrong-brand notes are excluded by the store. | no-restricted, cross-brand |
| `knowledge/proposals.ts` `knowledgeRef` | Provenance strings shown in context: `knowledge:kn_…@<sha256>`. | none | — | journey |
| `knowledge/workspace.ts` `openWorkspace`, `ensureDir`, `writeVaultFile`, `safeRead`, `withLock` | Brand slug, symlink-safe private directories, atomic 0600 writes, no-follow reads, per-record lock. | — | Same rules as notes. | security |
| `knowledge/safety.ts` `credentialFindings` | Refuses credential-looking text in the short preference statement/context. | — | — | security |
| `private-store.ts` `approvalProofMatches` + `AGENT_TOKEN_ENV` | The **existing** owner proof (`BRAND_OS_APPROVAL_PROOF` / hidden prompt, never argv) gates approving a scoped preference. Every creative command refuses while `BRAND_OS_AGENT_TOKEN` is set. | — | Owner only. | proof, agent-refusal |
| `auth.ts` `agentTokenContext(…, 'design')` + `query.ts` `brandRetrieve` | Brand rules section of the context: approved internal facts the existing `design` profile may read (no business modules, no restricted values, no drafts). | — | Same reader agents use. | journey (approved fact appears, draft does not) |
| `brand/assets/asset-manifest.yaml` | A variant points at an existing manifest asset id (checksum copied for change detection) or is explicitly `missing`. No file, path or URL is accepted. | `VariantAsset` | Rights stay with the manifest / `asset-rights.ts`. | unsupported-asset test |
| Interview intake (`brand:knowledge propose` → `brand:review` → `brand:approve`) | **Brand-wide** rules. A creative preference cannot be approved at brand scope; the CLI refuses and names this existing route (owner restates the rule as an owner note, `propose`, `approve`). | — | Unchanged. | no-brand-scope test |

### New typed records (derived, links only)

Stored under `brand/.private/creative/` (gitignored by the existing `brand/.private/` rule, excluded from Studio by
`EXCLUDED_PREFIXES`, never read by docs builds). JSON, one file per record, written with the knowledge workspace
helpers.

- `CreativeProject` — `project_id`, `brand_slug`, `title`, `surface` (`reel|post|carousel|story`), `series` tag,
  `language`, `inspirations[] { note: NoteRef, rights: own|licensed|unknown }`, `variants[] { variant_id, asset,
  status: draft|selected|rejected, describe? (≤120 chars) }`, `feedback[] { feedback_id, variant_id, note: NoteRef,
  source_kind, verdict, keep[], avoid[] }`, `selection { variant_id, meaning: 'owner_selected_for_this_project' }`,
  timestamps.
- `CreativePreference` — `preference_id` (`cp_<uuid>`), `brand_slug`, origin `project_id`, `statement` (≤200 chars),
  `context` (≤300 chars), `scope` (`project` | `series` = surface + series), `sources[]: NoteRef` (owner-words notes
  only), `counterexamples[] { project_id, variant_id }`, `state: draft|approved|superseded`, `supersedes`,
  `superseded_by`, `approval { approved_at, digest }`.
- `keep` / `avoid` are a closed aspect vocabulary (`camera_angle`, `lighting`, `text_density`, `tone`, …), not text.

## Why there is no duplicate

- **No second note store.** Feedback text exists only in the Knowledge note file. Creative records contain note ids,
  revisions, enums and owner-written short labels. The acceptance test greps every creative file for each verbatim
  feedback sentence and expects zero hits, and expects each sentence exactly once under the Knowledge folders.
- **No second index.** Retrieval does not search text. It walks the project records' explicit references and calls
  `findNote` by id. Free-text search stays `brand:knowledge search` (feedback notes carry `creative-feedback`,
  `variant-<x>` and `proj-<id>` tags plus `source.ref = creative:<project>/<variant>`, so the existing search finds them).
- **No second approval system.** The proof is the existing approval secret checked by `approvalProofMatches`; the
  agent-token refusal is the existing rule. A preference's approval covers only project/series scope and is recorded
  with a digest of its statement, scope and sources, so a hand edit invalidates it. Anything brand-wide goes through
  the existing interview intake and `brand:approve`. Approved facts and the answer ledger are never written by this
  feature (asserted byte-for-byte in the journey).
- **Stale sources are flagged, never rewritten.** If a cited note's revision changes, its reasons are marked
  `stale` and an approved preference that cites it moves to `needs_review`; approval of a draft with a stale source is
  refused.

## Integration plan (no merge, no deploy)

1. `feat/creative-learning` is stacked on `feat/knowledge-inbox` (PR #9 head `4748e7f`). The draft PR targets
   `feat/knowledge-inbox` so its diff shows only this work. When PR #9 merges, retarget it to `main`.
2. Files touched outside the new ones are kept to: root `package.json` (one script line), `tsconfig.json` and
   `packages/brand-core/package.json` (a `./creative` subpath, so `packages/brand-core/src/index.ts`, a file PR #8 and
   PR #9 already conflict on, is **not** touched), docs (`IMPLEMENTATION_STATUS.md`, `CHANGELOG.md`, `CLAUDE.md`
   skill list). No Studio, MCP, engine, `scripts/brand.ts` or Knowledge source change.
3. Suggested owner order: merge #8, rebase #9 and resolve its six existing conflicts, merge #9, rebase this branch
   (expected trivial), review and merge. Nobody here merges or deploys.
4. If PR #9 is later rejected or rewritten, this branch must not be rebased onto `main` without the Inbox; it would
   be a blocker to report, not something to rebuild.

## Sprint 1 file-change list (planned)

- `packages/brand-core/src/creative/{model,store,context,index}.ts`
- `scripts/creative.ts` (`npm run brand:creative`)
- `tests/creative-journey.test.ts` (Pilito A–E through the real CLI), `tests/creative-security.test.ts`, `tests/studio-creative.test.ts`
- `agent-skills/creative-memory/SKILL.md`, `docs-internal/CREATIVE_LEARNING.md`
- Status, changelog and skill-list lines.

Not in Sprint 1: MCP/agent tools for creative memory, Studio views, sharing creative records to Git, performance
data, SEO/strategy work, any specialist skill.
