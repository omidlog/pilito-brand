# Final review: Brand OS 0.2.0

Branch `feat/brand-os-v0.2`, compared with `main` at `8b3d3b0` (0.1.0). This review was written by Claude Code at the end of the seven-phase plan. `CLAUDE_INDEPENDENT_AUDIT.md` (Phase 1) has the starting audit and the verdicts on the brief's recommendations.

The brief defines success this way: *an owner can create a new brand, naturally interview with an AI assistant, approve accurate information, obtain structured Brand OS and Business OS documentation, and let authorized agents retrieve that knowledge securely and reliably.* In 0.2.0, every step of that sentence works locally and is covered by an automated end-to-end journey. Two steps are only partly there: the "natural" interview without a configured model, and the breadth of the documentation. Both are described below.

Status vocabulary used here:

- **Implemented and tested:** working code with an entry point and automated tests.
- **Partially implemented:** a real subset works, and the gap is named.
- **Not configured:** code exists but needs an owner credential or setting. It is off by default.
- **Not implemented:** no code.
- **Out of scope:** deliberately left out of this release, with the reason given.

---

## 1. What changed and why

| Phase | Change | Why | Status |
|---|---|---|---|
| 1 | The audit document. Atomic writes (`fsutil.writeAtomic`). Re-approval refused and versions kept monotonic. Restore checks every path before it writes anything. Persian answers longer than 12 characters are recorded instead of being swallowed. `brand:doctor`. `BRAND_OS_DATA_KEY` added to `.env.example`. | These were confirmed integrity bugs (G1, G2, G7) and onboarding gaps (G8). The Persian routing bug lost real answers. | Implemented and tested |
| 2 | Owner-issued agent tokens with four read-only profiles. The tokens are hashed, bound to one brand and resolved once at startup. `brand_retrieve` is one retrieval path shared by MCP and `brand:query`, and there is an access log that records no values. | On the default private brand, every agent was denied. That is the product's main promise (G11). | Implemented and tested |
| 3 | `approval.ts` was extracted. Batch `brand:review` and `brand:approve` take one proof. Stale and competing proposals are refused. `brand:publish` is a separate step. The proof is accepted only from the environment, stdin or a prompt, and a proof on argv is refused. Questions can declare an explicit `approval_grant`. | Approving one question at a time was too slow. The proof leaked through argv (G3). Publishing had no CLI (G5). The approval grant was guessed from the id (G6). | Implemented and tested |
| 4 | JSON agent mode for the interview: `brand:next`, `--question <any id>` and `brand:propose`. A zod-validated proposal intake with verbatim provenance. An LLM adapter with `none`, `mock` and `anthropic` providers. Restricted text is redacted before any provider sees it. The `founder-core` profile has 40 questions. Persian keyword capture became en/fa/tr locale data. | The interview was a rigid questionnaire and an agent could not drive it (Priority B). | Implemented and tested with the mock. Anthropic is *not configured* |
| 5 | Structured `color`, `font`, `logo_spec` and `voice_pairs` answers. Draft DTCG tokens are generated from approved answers, then approved by hash and published. The Brand Book, business-plan summary and marketing plan share one section model, with approved, assumption, recommendation and missing tags and source ids. There is a `brand:document` command and a `/brand-book` page. | Outputs used to be field dumps. Tokens were not connected to the answers (Priority C, F). | Implemented and tested for 3 documents |
| 6 | A finance library and `brand:finance`. Every result is typed with unit, period, basis and formula, or is explicitly missing. Mascot lifecycle states, artwork variants, `brand:migrate`, and the `kind: mascot` finder. | The brief requires that no number is invented (Priority D). Mascot art must be findable and governed (Priority E). | Implemented and tested |
| 7 | Journeys A, B and C rebuilt end to end. The internal review dashboard. Two fixes found by the journeys (below). An English-first language sweep. A step in the GitHub workflow that compiles the internal docs build. README, CHANGELOG, status, and this review. | The brief's §13 and §16 require them. | Implemented and tested |

The journeys turned up two bugs, which Phase 7 fixed with regression tests in `tests/remediation-regression.test.ts`:

1. **Backups left out `brand/migrations.yaml` and `brand/engine.lock`.** Restoring a backup could not undo a migration that had been written halfway, and the next `brand:migrate` kept failing.
2. **Documents showed an approved restricted fact as "missing".** Its value is `null` and is held through `private_ref`. It is now shown as approved and withheld, and the value is still never displayed.

**Language rule.** English is the base language for the CLI, docs, question text, examples and defaults. `brand:init --languages` now defaults to `en`, and Persian (fa, RTL) and Turkish (tr) are opt-in locale data. Persian and Turkish input, extraction, storage, retrieval and RTL rendering are covered by tests: `interview-ai`, `structured-answers`, `journeys` (a labelled fa case and a tr case), and `brand-book` (the locale tables and RTL markup).

## 2. What was not implemented, and why that is appropriate

| Item | Status | Reason |
|---|---|---|
| SSO and hosted or remote MCP authentication | Out of scope | Needs external identity infrastructure. `resolveAgentContext` is the seam for it (ADR 0003). |
| Per-person approval identity (signed approvals, CODEOWNERS) | Not implemented, owner decision | 0.2.0 keeps one shared proof as single-owner security. Any process running as the owner can read it (G4, G9). |
| Browser interview UI and a write-capable local server | Out of scope | It would add a new authenticated write surface. The CLI plus a coding agent covers the workflow without one. |
| Live Figma sync, light and dark modes, component specs, design and code drift | Not implemented | Large scope with no credentials available. The fixture-only Figma import remains. |
| Designed renderers for the other ~30 modules, and PDF export | Partially implemented | The section model is proven on 3 documents first. The other modules keep the generic cited page. |
| npm publishing of `@brand-os/core` | Not implemented, owner decision | Needs decisions on the registry and the license model. |
| Embedding search, a SQLite ledger, multi-editor locking | Out of scope | Not needed for single-owner local use. Atomic writes cover crash safety. |
| CSP headers, key rotation tooling, a CI matrix (Node 22/24, macOS), a link checker | Not implemented | P2 hardening, listed in `docs/IMPLEMENTATION_STATUS.md`. |
| Translated fa and tr body copy, deeper gamification, a worked mascot example with art | Not implemented | This is content work, not engine work. No art is auto-generated. |
| Live billing and CRM adapters for finance | Not implemented | Finance reads owner-supplied files only. No credentials. |
| Sending restricted data to any model provider | Refused by design | Owner default. Validation rejects any setting that would allow it. |

## 3. Tests that were actually run

All of the following ran on Linux with Node 24.22.1 in this workspace. The GitHub workflow pins Node 22, and that workflow was not run as part of this work.

- `npm run ci`: lint, typecheck (root and docs), validate, **131 tests in 19 files, 131 passing and 0 failing**, the tokens build, the public docs build (en, fa, tr) and the no-mascot public build. It was run before every Phase 7 commit and once more on the final tree.
- The internal docs build, `npx tsx scripts/prepare-docs.ts --audience internal && npm run build -w @brand-os/docs`. It succeeded for en, fa (`dir="rtl"`) and tr. `/dashboard` renders the review queue and coverage from real data.
- `npx tsx scripts/scan-public.ts apps/docs/build` passed on the public build.
- Journey results in `tests/journeys.test.ts` (7 tests, all passing):
  - **A, education app with mascot.** The CLI init produces English defaults and an English first prompt. The labelled localized Persian turn extracts three facts, gives the verbatim RTL quotation and a follow-up in Persian, and invents no price. After that come: the review queue, the dashboard, a batch approval where a wrong proof writes nothing, mascot art registration and the stage-3 finder, the Brand Book, the business and marketing plans, tokens, publication of the trade name only, the public build scan, internal-agent retrieval, guest isolation, and a change → approve (v2) → regenerate cycle. A separate **tr** case covers Turkish prompts, extraction, and the dotted and dotless i.
  - **B, B2B SaaS without mascot.** 40 interview steps never reach a mascot or gamification question. Covered: the business and marketing documents, finance metrics (the `forecast` basis, LTV missing when there is no churn data), the `restricted:<name>` input path and the refusal of tracked files, scoped retrieval, a `finance` token that cannot read restricted values, guests denied on a private brand, and an upgrade that leaves the ledger, the facts, the config and owner prose byte-identical.
  - **C, security and failure scenarios.** Unauthorized reads with a guest, a forged token and a revoked token. Unauthorized approval with a wrong proof, a marketing role, the CLI under an agent token, and a proof on argv. Cross-brand tokens. No draft or restricted leakage. Token drift. An active SVG and a checksum mismatch. A stale competing proposal. An interrupted migration and torn temp files. Backup corruption from a flipped byte, a forged tag and a missing file. Malformed and timed-out model output. A prompt-injection batch. A missing `ANTHROPIC_API_KEY`, with no request attempted. A non-verbatim extraction.

## 4. What remains unverified

- **The live Anthropic provider.** Only the mock and a stubbed `fetch` are tested. Prompt quality, latency and refusals against the real API are unknown.
- **The GitHub Actions run.** The workflow, including the new internal-build step, has not run on GitHub during this work. Neither have the GitHub Pages deploy or `deploy-docs.yml`.
- **Other environments.** No CI matrix exists. Node 22 runs only in the workflow, and macOS and Windows were not tried.
- **The docs UI.** There are no browser tests of the pages beyond a successful static build and string checks.
- **The MCP server with real clients.** It is tested over stdio with the SDK client. It has not been tried with Claude Desktop or other MCP hosts.
- **Long sessions.** There are no tests with thousands of ledger records, so performance at that scale is unknown.
- **Leak detection.** `scan-public` checks for canaries, private file names and raw tokens. It cannot prove that nothing private leaked in general (G10).

## 5. External credentials and services required

| Need | Required for | Without it |
|---|---|---|
| `BRAND_OS_DATA_KEY` (32 bytes, base64) | Restricted answers, backups and restore | Those operations fail closed. Everything else works. |
| `brand/.private/approval-secret` (`brand:doctor -- --create-approval-secret`) | Approve, publish, token issue and revoke | Those commands refuse. |
| `BRAND_OS_AGENT_TOKEN` (issued by the owner) | Agent access to a private brand | Agents run as guest and are denied on private brands. |
| `ANTHROPIC_API_KEY` with `llm.provider: anthropic` | Model-assisted reading of free-form answers | Deterministic keyword rules, or the agent's own reading through `brand:propose`. |
| GitHub Pages (`vars.DOCS_PAGES`) | Public docs hosting | A local build only. |

No credential is stored in the repository, in test fixtures or in logs.

## 6. Security verification summary

- **Deny by default.** Guests read published public facts only. A private brand denies guests and refuses a public build.
- **Agents are read-only.** Their tokens are hashed, bound to one brand, and resolved once at startup. An unknown token fails closed. Restricted values come back withheld for every profile, including `finance`. Drafts are never returned. The access log records ids, never values.
- **Approval and publication.** Both need the proof from the environment, stdin or a prompt, never from argv. A wrong proof writes nothing. Both are refused while an agent token is set. Stale proposals are refused. Publication accepts only approved, public-classified facts.
- **Restricted data.** It is encrypted with an environment-only key and never appears in approved-facts, documents, the dashboard, retrieval output or model requests. Sentences that look restricted are redacted before any provider sees them.
- **Model output.** It is treated as untrusted data. It is schema-validated, and quotations must appear verbatim in the source. Unknown, restricted and not-applicable ids are rejected. A model can only create drafts.
- **Files on disk.** Writes are atomic. Restore validates every path before writing anything. Backups are authenticated encryption (AES-GCM) with a checksum, and they now include the migration history.
- **Public build.** It carries only approved and published facts, and approved assets that pass the checksum check and contain no scripts. Tokens appear only when published and hash-approved. The dashboard is a stub. The canary scan runs in CI.

**Known limits:**

- A single shared proof that any process running as the owner can read (G4, G9).
- No key rotation.
- No CSP headers on the static site.
- Revoking a token takes effect only when the server restarts.

## 7. Architectural risks that remain

1. **`engine.ts` is still about 1,080 lines.** Approval moved out, but the interview, the ledger and impact logic are still together. A future split should follow the approval-service pattern.
2. **YAML files are the database.** This is fine for one owner and one process. Concurrent writers can lose updates, because atomic writes prevent torn files but not races.
3. **Locales are a closed union** (`'en' | 'fa' | 'tr'`). Adding a locale touches the type, the lexicon, the i18n tables and the question banks. `detectLocale` maps every Arabic-script text to `fa`, which will be wrong if Arabic (`ar`) is added.
4. **Deterministic extraction is keyword-based.** Without a model, the "natural" interview depends on the coding agent reading the answer. The rules handle offer, audience, B2B, pricing and uncertainty cues only.
5. **Template upgrades are migrations, not merges.** `brand:migrate` upgrades the data safely, but pulling new template code into an existing brand repository is a manual Git merge.
6. **Documents and docs pages come from two projections:** the section model and the compiled module pages. They can drift apart in presentation, though not in governance, because both read approved facts only.

## 8. Independent scores (0–10, with evidence)

None of these is a 10. A 7 means the area is solid for local, single-owner use, with named gaps.

| Area | Score | Evidence and what keeps it from scoring higher |
|---|---|---|
| Architecture | 7 | One core package. One retrieval path for MCP and the CLI. An extracted approval service. Typed document and finance models. The rest of `engine.ts` is still monolithic, YAML is the store, and locales are a closed union. |
| Brand OS completeness | 6 | 20 modules, a large question bank, structured core answers, generated tokens, and a cited Brand Book. Only 3 documents have designed renderers. Visual identity assets are placeholders. Module prose is generic. |
| Business OS completeness | 5 | 12 modules, business-plan and marketing-plan renderers, and a correct finance library. The other business documents are generic cited pages. There are no CRM or billing integrations and no operational reporting beyond finance metrics. |
| AI interview | 6 | Agent-driven JSON mode, validated proposals with provenance, conflicts and follow-ups, en/fa/tr input, and a mock and an Anthropic adapter. Without a model the extraction is shallow, the live provider is untested, and there is no browser UI. |
| Document generation | 6 | One section model with approved, assumption, recommendation and missing tags, source ids, restricted values withheld, and an internal or public projection. Three documents, Markdown and JSON only, no PDF. |
| Mascot system | 6 | Lifecycle, artwork variants, validation, migration, and a stage, emotion, use-case and angle finder that explains what is missing. No art ships, and the gallery UI is basic. |
| Design system | 4 | DTCG tokens, contrast and alias checks, and tokens generated from answers with hash approval. No themes or modes, no component specs, and no live Figma. |
| AI retrieval | 7 | Scoped profiles, fail-closed resolution, withheld restricted values, an access log, and an MCP stdio test with the real SDK. Retrieval is local only, has no semantic search, and revocation needs a server restart. |
| Security | 7 | Deny by default, encryption, atomic writes, the proof kept off argv, prompt-injection and provenance controls, the canary scan, and a security journey. The shared local proof (G9), the lack of key rotation and CSP, and canary-only scanning keep it at 7. |
| Testing | 7 | 131 tests, including three end-to-end journeys, CLI subprocess tests, an MCP client test, and regression tests for every confirmed bug. No CI matrix, no browser tests, no live-provider test, and no coverage measurement. |
| Production readiness | 5 | Reliable as a local single-owner tool with docs, a doctor command and backups. No hosted deployment with authentication, no multi-user support, no npm package, and the GitHub workflow is unverified for this branch. |
| Multi-brand reusability | 6 | A template plus `brand:init`, tokens bound to one brand, refusal of cross-brand access, and data-only migrations that leave content untouched. Upgrading template code is a manual merge, and the core is not packaged. |

## 9. Deliverables checklist (brief §16)

| # | Deliverable | Where |
|---|---|---|
| 1 | Independent architectural audit | `docs-internal/CLAUDE_INDEPENDENT_AUDIT.md` |
| 2 | Prioritized implementation plan | Audit §9 and the phase table above |
| 3 | Working code changes | Commits on `feat/brand-os-v0.2` (`git log main..HEAD`) |
| 4 | Added or updated tests | 19 test files, 131 tests |
| 5 | Updated documentation | `README.md`, `CHANGELOG.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs-internal/*` |
| 6 | Architecture decisions | `docs-internal/adr/0003-agent-access.md` (0001 and 0002 unchanged) |
| 7 | Working CI evidence | §3 above (local `npm run ci`; the GitHub run is pending) |
| 8 | End-to-end journey results | §3 above, `tests/journeys.test.ts` |
| 9 | Migration documentation | `CHANGELOG.md` "Breaking changes"; `brand:migrate` for mascot statuses |
| 10 | Security verification summary | §6 above |
| 11 | Remaining limitations | §2, §4 and §7 above |
| 12 | Pull request | A draft description has been prepared. Opening the PR is the owner's action. |

## 10. Owner decisions still open

1. The license. It stays MIT and was not modified. Moving to source-available or open-core is the owner's call.
2. The README hero line. "Approved brand truth for every AI tool" is used as a working line.
3. Whether to use Anthropic as the one real provider. Restricted data is never sent to any provider.
4. Confirming the four agent profiles. `finance` cannot read restricted values by default.
5. Per-person approval identity, versus keeping the shared proof.
6. npm publishing of the core, and to which registry.
7. Reviewing the 40 founder-core question ids.
