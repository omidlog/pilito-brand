# Implementation status

Updated for 0.2.0 (2026-11-20). “Fixed” or “Done” means a test or a build exercises the behavior. “Partial” means a real subset works and the gap is named. The final review with scores is `docs-internal/CLAUDE_FINAL_REVIEW.md`.

## Audit findings

| ID | Status | Note |
| --- | --- | --- |
| P0-1 | Fixed | Restricted values are encrypted under gitignored `brand/.private`. Ledger and docs store an opaque id only. |
| P0-2 | Fixed | `materialize` creates missing files and does not overwrite existing catalogs, assets, or module pages. |
| P0-3 | Fixed | Approved, audience-visible facts are written to `published/claims` during docs prepare, with approver and source id. |
| P0-4 | Fixed | MCP uses `@modelcontextprotocol/sdk` stdio. A client test lists tools, calls them, and sends Persian text. |
| P1-1 | Partial | Free-form answers become quoted draft proposals (`note:`, `brand:propose`, `brand:interview --assist`) and are never approved. An Anthropic adapter exists but is off unless configured with a key, and its live behavior is not tested (tests use a mock and a stubbed fetch). A browser interview UI is not built. |
| P1-2 | Fixed | Token, mascot, component, social, and search tools read the brand files and approved records. |
| P1-3 | Fixed | `--actor owner` cannot approve. Approval requires the human proof in `brand/.private/approval-secret`. |
| P1-4 | Partial | `upgradeCore` / `brand:migrate` bump `brand/engine.lock`, migrate fact files and mascot statuses, and leave answers, approved facts, config and module prose byte-identical (Journey B). Pulling new template files into an existing brand repository is manual; the engine is not published to npm. |
| P1-5 | Fixed | `brand:init` writes the brand name and slug into `brand-manifest.json`. |
| P1-6 | Fixed | Stage validation checks unique ids and contiguous order. Six stages are only the example file. |
| P1-7 | Fixed | A disabled mascot omits module docs and emits an empty catalog JSON, so state ids are not in the data bundle. |
| P1-8 | Partial | Portal color, type, and radius read DTCG variables. Alias cycles are reported. Draft and approved tokens are separated in the tool, not by a second compiler pipeline. |
| P1-9 | Partial | `renderBusinessArtifacts` fills plan, marketing, PRD, roadmap, sales, support, finance, and OKR pages from the ledger and leaves unknowns unknown. They are not full models. |
| P1-10 | Fixed | Public builds copy only approved public assets inside `brand/assets`. The asset schema and path boundary are checked. |
| P1-11 | Fixed | A public prepare throws when `publish_docs` is private. The EXAMPLE template is public because it has no confidential facts. `brand:init` defaults to private. |
| P2-1 | Partial | English is the base language; fa (RTL) and tr are optional locales. Interview prompts, the Brand Book page and the dashboard page are translated. Module body copy is still English in the fa and tr builds. `docs-internal/LOCALIZATION.md` describes the approval path. |
| P2-2 | Fixed | Five more skills: strategist, logo, mascot animator, marketing creative, brand QA. |
| P2-3 | Partial | The docs site still has one token-backed button plus the component registry. There is no product component package or Figma node map. |
| P2-4 | Partial | The gallery can preview a published SVG. Unapproved files are not given download links. |
| P2-5 | Partial | Snapshot file is still local. There is no Figma API client. |
| P2-6 | Not fixed | `import existing:` records a URL and does not fetch it, to avoid turning the tool into an open web client. |
| P2-7 | Partial | Name, availability, and placeholder contradictions exist. There is no general schema rule language. |
| P2-8 | Fixed | Audit tests cover canaries, materialize, publishing, approval proof, upgrade, retrieval, alias cycles, MCP, and hidden mascot data. |
| P2-9 | Partial | Search reads approved facts and, when asked, draft markdown. There are no embeddings. |
| P2-10 | Partial | Reset backs up the ledger under `brand/.private/backups`. There is no multi-user lock service or retention policy beyond gitignore. |

## v0.2 (phases 1–7)

Findings and the invariant checklist are in `docs-internal/CLAUDE_INDEPENDENT_AUDIT.md`.

| ID | Status | Note |
| --- | --- | --- |
| G1 | Fixed | Writes go through `fsutil.writeAtomic` (temp file, fsync, rename). Test: `tests/onboarding.test.ts`. |
| G2 | Fixed | Re-approval is refused. Versions are monotonic. Test: `tests/onboarding.test.ts`. |
| G7 | Fixed | Restore validates all paths before writing. Test: `tests/onboarding.test.ts`. |
| G8 | Fixed | `brand:doctor --create-approval-secret`. Test: `tests/doctor.test.ts`. |
| Persian routing | Fixed | Only `note:` starts capture. Test: `tests/onboarding.test.ts`. |
| G11 | Fixed | Owner-issued agent tokens (hashed, brand-bound, four read-only profiles) are resolved once at startup by `mcp:serve` and `brand:query`. Both use one retrieval path, `brandRetrieve`. There is an access log without values. Restricted values stay withheld from every agent. Test: `tests/agent-access.test.ts`. Design: `docs-internal/adr/0003-agent-access.md`. |
| G3 | Fixed | `brand:approve`, `brand:publish`, and `brand:agent-token` read the proof from `BRAND_OS_APPROVAL_PROOF`, piped stdin, or a hidden prompt. `--proof` on argv is refused without echoing it. Approve and publish also refuse to run while `BRAND_OS_AGENT_TOKEN` is set. Test: `tests/approval-batch.test.ts`. |
| G5 | Fixed | `brand:publish --ids|--module [--unpublish]` is wired to the approval service. Only approved public-classified facts with a value are published; the allowlist in `publication-policy.yaml` is written atomically. Approving a replacement for a published fact withdraws its publication until it is published again. Test: `tests/approval-batch.test.ts`. |
| G6 | Fixed | Optional `approval_grant` on questions is preferred over the id guess. Restricted questions always need `financial`, and `brand:validate` fails when a restricted question declares anything else. Test: `tests/approval-batch.test.ts`. |
| Batch review | Done | `brand:review --module|--ids [--json]` shows drafts and pending changes against the approved revision with impact. `brand:approve --module|--ids` approves with one proof and reports every item. Approval logic lives in `packages/brand-core/src/approval.ts`; the engine delegates to it. A change to an approved fact is a pending proposal and the approved revision stays canonical until that proposal is approved against its version. |
| Agent interview | Done | `brand:interview --question <any id> --json`, `brand:next --json`, and `brand:propose --file` (zod-validated batch, verbatim quotations, drafts only, restricted and unknown ids refused, conflicts recorded in `brand/interview/intake-log.yaml`). Skill: `agent-skills/brand-interviewer/SKILL.md`. Test: `tests/interview-ai.test.ts`. |
| LLM adapter | Done (mock-tested) | `packages/brand-core/src/llm/` has providers `none`, `mock` and `anthropic`. The adapter has a timeout, input and output limits, and a request budget. Owner text is fenced as data. Restricted-looking passages are withheld before any provider. Restricted data is never sent; `allow_restricted_to_provider` is rejected by validation. Output is schema-validated. `--assist` falls back to deterministic rules. No test calls the network. |
| Founder-core profile | Done | `brand/interview/profiles/founder-core.yaml` (40 ids, no restricted ones) is selected with `brand.profile`. Owner decision: review the list. |
| Deterministic extraction | Partial | Keyword cues per locale (en base; fa and tr) cover offer, audience, B2B, pricing, and tentative, undecided, and correction markers. Everything else needs a model or an agent. |
| Structured brand core | Done | Question types `color`, `font`, `logo_spec`, `voice_pairs` validated in `normalizeAnswer` (`packages/brand-core/src/structured.ts`) and the question schema. Founder-core uses them. Test: `tests/structured-answers.test.ts`. |
| Generated tokens | Done | `brand:tokens:generate` writes drafts from approved facts only and never overwrites an approved id. `brand:tokens:approve` / `brand:tokens:publish` gate retrieval by hash and publication. Test: `tests/brand-tokens.test.ts`. |
| Brand Book and plans | Done (3 documents) | Typed sections with approved / assumption / recommendation / missing tags and source ids for the Brand Book, business plan summary and marketing plan; `brand:document`; `/brand-book` docs page with swatches, specimens and voice pairs, English UI with fa/tr locale data. Public build carries no internal items. The other ~30 modules keep the generic compiled page. Test: `tests/brand-book.test.ts`. |
| Finance library | Done | `packages/brand-core/src/finance.ts`: gross profit, gross margin %, CAC, churn, retention, margin-adjusted LTV, LTV:CAC, MRR, ARR, net burn, runway, break-even and month-by-month scenario projection. Results are `ok` (unit, period, basis, formula, inputs used), `missing` (named inputs), `invalid` (validation or mixed periods) or `undefined` (zero churn, zero revenue, no burn). Basis is the weakest of the inputs. `brand:finance --input` reads files outside the repo or gitignored `restricted:<name>` files only and writes nothing. No live billing/CRM adapters yet. Test: `tests/finance.test.ts`. |
| Mascot lifecycle and finder | Done | `status` on catalog rows and artwork variants is `defined → pending → created → reviewed → approved → published` (+ `deprecated`). Optional stage, angle, intensity, outfit, accessories, use cases, animation refs, version and license fields. `brand:validate` enforces artwork, manifest asset, stage, angle and license rules; `brand:migrate` converts legacy statuses (no artwork → `defined`) keeping comments. `brandRetrieve` `kind: 'mascot'` filters by emotion, stage, use case and angle, returns only approved/published art with a readable asset, and explains what is missing; disabled module is `not_applicable`. The template ships 90 `defined` slots and no art. Gallery UI polish is deferred. Test: `tests/mascot.test.ts`. |
| Journeys A/B/C | Done | `tests/journeys.test.ts`, 7 tests in temporary brand copies with the mock provider. A: education app with mascot (English-first CLI init, labelled localized fa interview turn, tr locale case, review, batch approval, mascot art, documents, tokens, publication, agent retrieval, guest isolation, change and regeneration). B: B2B without mascot (branching, documents, finance, retrieval, privacy, upgrade). C: security and failure scenarios. |
| Internal dashboard | Done | `buildDashboard` (`packages/brand-core/src/dashboard.ts`) and `/dashboard` page: coverage per module, review queue, open contradictions and intake conflicts, restricted values withheld. Public builds get a stub with no brand data; the publish_docs check still refuses public builds of private brands. Test: `tests/dashboard.test.ts`. |
| Backup scope | Fixed | Backups include `brand/migrations.yaml` and `brand/engine.lock`. Test: `tests/remediation-regression.test.ts`. |
| Restricted facts in documents | Fixed | An approved restricted fact is tagged approved and withheld, not missing. Test: `tests/remediation-regression.test.ts`. |
| Language rule | Done | English base for CLI, docs, question text, examples and defaults; `brand:init --languages` defaults to `en`; fa and tr are locale data. Persian/RTL and Turkish input, extraction, storage and retrieval are tested (`tests/interview-ai.test.ts`, `tests/structured-answers.test.ts`, `tests/journeys.test.ts`). |
| G4, G9 | Documented limit | Single shared proof, readable by any process running as the owner. |

## Phase 8: Personal Brand OS

Branch `feat/phase-8-personal-brand-os`. Entry gate: `docs-internal/POST_V02_PREFLIGHT.md`. Review, acceptance evidence and gaps: `docs-internal/PHASE_8_PERSONAL_BRAND_REVIEW.md`. Guide: `docs-internal/PERSONAL_BRAND.md`.

| Item | Status | Note |
| --- | --- | --- |
| Personal module and facets | Done | `modules.personal { enabled, facets }`; absent means off, so v0.2 brands are unchanged. Facets `founder-executive`, `consultant-expert`, `creator-educator`, `artist-designer`, `speaker-author` combine through the condition engine. Test: `tests/personal-brand.test.ts`. |
| `personal-brand` profile | Done | Exclusive: company, SaaS and mascot questions are not applicable, not missing. `founder-core` still scores the whole bank. |
| Question bank | Done | 8 core and 5 facet modules, 71 questions, en/fa/tr prompts as locale data, generated and drift-checked like the other banks. Module guidance text is English. |
| Person vs organization | Done | `relationships` answer type with explicit relation, dates and ownership (default `unstated`). Canonical reference table validated by `brand:validate`. |
| Privacy guard | Done (heuristic) | Home address, personal phone, birth date, government id and family details refused on every personal write path and in the evidence register. Not a legal compliance certification. |
| Evidence and rights | Done | `brand/interview/evidence-register.yaml`; owner-only verification; owner testimony never counts as verified; `publication_requires` enforced at publish time and again at read time (publication, MCP, public docs). Withdrawal unpublishes; `brand:retract` removes a claim. Portrait and case-study assets need granted public rights. Test: `tests/personal-evidence.test.ts`. |
| Agent profiles | Done | Career history, evidence and privacy boundaries are `internal-read` only. |
| Deliverables | Done (CLI/JSON) | Ten documents on the shared model with verification labels and bio length reports. No designed portal page for them yet. Test: `tests/personal-documents.test.ts`. |
| Draft operation | Done | `draft_personal_content` MCP tool and `brand:query` handler; always `draft`, no authority. |
| Migration | Done | `brand:migrate` adds the bank, profile, registry entries and config block additively and idempotently. |
| End-to-end | Done | Journey D in `tests/journeys.test.ts`: founder+consultant brand through the real CLI, evidence, publication, documents, docs builds, retrieval, withdrawal, backup, restore, migrate. |
| Studio (Phase 9) | See below | Studio shows personal brands read-only and does not edit them. |

## Phase 9: Read-only Brand OS Studio

Branch `feat/phase-9-read-only-studio`, stacked on Phase 8. Guide, architecture and security model: `docs-internal/STUDIO.md`. Phase 8 Personal Brand OS remains supported; Studio displays it and does not edit it.

| Item | Status | Note |
| --- | --- | --- |
| Product contract | Done | One Studio, routes `/brands/<slug>`. Viewer plus repository provisioner. No chat, AI, interview UI, edit or approval controls, uploads, Git actions, token issuance or terminal. The complete non-GET route list is pinned by a test. |
| Owner authentication | Done | scrypt password, TOTP (required beyond loopback), login nonce, rate limits, server-side sessions with HttpOnly SameSite=Strict cookies, CSRF and Origin on every authenticated POST, strict CSP and security headers. One owner account; sessions are in memory. |
| Repository provisioning | Done | The single write: private repository from the template, core `applyInit` on a temporary checkout, one fast-forward commit, privacy verification, duplicate and concurrency refusal, retries, partial-create cleanup or a recorded cleanup-required state, resume after restart. Separate provisioning credential scoped to allowlisted destinations and the configured template. |
| Read path | Done | Merged default branch only, safe tar extraction of `brand/` without `.private` or `restricted`, projection from the brand-core functions, credential guard, cached SHA and times, stale and failed states that keep the last good commit, slug and repository-id checks against cross-brand content. |
| Refresh | Done | Manual refresh, refresh on view after the TTL, signed push webhook with replay protection. |
| Screens | Done | My brands, New brand wizard, provisioning status, Overview, Brand Book, Design System, Assets & Mascot, Business OS, Personal Brand (only when enabled), History & Review (open PRs labelled non-canonical), GitHub & Claude Code handoff, Account & GitHub. |
| Design and accessibility | Done | `studio.*` design variables, light and dark, responsive (1440/1024/390 px checked in a browser), skip link, focus ring, keyboard drawer, labelled fields, status as text plus icon. |
| Localization | Done | en, fa (RTL, layout mirroring verified in a browser) and tr catalogs with identical keys and placeholders. Brand content inside documents stays in the language the repository holds. |
| Server CLI | Done | `npm run studio:hash-password`, `npm run studio -- totp-secret\|session-secret\|brands\|register\|unregister`. Registering an existing repository is server-side only. No automated tests for the CLI wrapper itself; it calls the tested registry, hashing and GitHub client. |
| Tests | Done | 48 Studio tests in five files with an in-memory GitHub (no network, no real repositories). `tests/studio-browser.test.ts` drives headless Chrome inside `npm test` when Chrome is installed and skips otherwise; `npm run test:e2e` requires it. |
| VPS deployment | Not started | Phase 10: reverse proxy, TLS, process supervision, DNS for `studio.omidataei.com`. Nothing is deployed. |
| Live GitHub | Not verified | All GitHub behavior is tested against a fake at the HTTP level. A first real run against GitHub (token permissions, template generation timing) is still owed. |

## Commands that this remediation expects to pass

`npm run lint`, `npm run typecheck`, `npm run validate`, `npm run test`, `npm run build`, and `npm run build:docs:nomascot`.

## Second remediation contract

`docs-internal/REMEDIATION_TRACEABILITY.md` is the ticket record. Public export is a new allowlist. Approved facts stay approved when someone passes `confirm=true`. `include_unapproved` does not grant access. A private brand cannot be built as public. Asset publication rejects symlinks, traversal, active SVG, and checksum mismatches. Backup, restore, migrate, and reset are separate commands. Journeys A, B, and C have automated end-to-end tests (see above).

`authorize()` gates submit, approval, publication, reveal, export, and the MCP tools. `include_unapproved` is not an MCP parameter. Backups and restricted values use `BRAND_OS_DATA_KEY` and fail closed when it is absent. Fact files migrate to canonical schema 2. Each module compiles a cited page that leaves missing sections missing. Figma import returns `not_configured` without credentials and does not overwrite tokens.

Still external: SSO and hosted or remote MCP authentication (the `resolveAgentContext` seam is documented in ADR 0003), a hosted LLM, live Figma, and npm publishing. The approval proof remains a local file. Only the Brand Book, business plan and marketing plan have designed renderers; other modules are compiled field pages. fa/tr text other than prompts, page UI strings and the marked draft guidance paragraphs stays English. A CI matrix (Node 22/24, macOS), CSP headers, key rotation tooling and a link checker are not configured.

## Remaining security limits

- Restricted answers and backups are encrypted with `BRAND_OS_DATA_KEY`, read from the environment only. The key is not written into the working tree, so copying `brand/.private` copies ciphertext without the key. Losing the key makes those files unreadable. There is no key rotation tooling and it is not a KMS.
- The approval proof is a local shared secret, not SSO. Anyone who can read `approval-secret` can approve.
- `brand:init --reset` rewrites the ledger after copying it into the private backup. It does not rewrite mascot catalogs or module prose.
- A public build of a brand with `publish_docs: public` publishes approved public facts. Restricted values stay out. Internal facts stay out of the public audience.
