# Post-v0.2 preflight (entry gate for phases 8 and 9)

This is the entry-gate record that the Phase 8/9 contract (§0) requires. It was written by Claude Code before any Phase 8 code changed.

| Item | Value |
| --- | --- |
| Date | 2026-11-21 |
| `main` SHA | `3c98e00eb76a6d8a7a23b3d1c1a22a2021c400ad` (merge of PR #2, `feat/brand-os-v0.2`, version 0.2.0) |
| Working branch | `feat/phase-8-personal-brand-os`, created from that SHA with no other commits |
| Runtime used | Node 24.22.1 on Linux (the GitHub workflow pins Node 22) |

## 1. Repository state

- **Pull requests.** `gh pr list --state all`: #1 (`cursor/brand-os-template-5609`) and #2 (`feat/brand-os-v0.2`, phases 1–7) are both **merged**. No pull request is open.
- **Issues.** `gh issue list --state open` returned none.
- **Branches.** `origin/cursor/brand-os-template-5609` and `origin/feat/brand-os-v0.2` have no commits that are not on `main`.
- **Partial Phase 8/9 work.** There is none. No `personal` question bank, profile, document or module exists. There is no `apps/studio`. The only web app is `apps/docs`, a static Docusaurus site. Its interactive controls are client-side previews (a component-state toggle and the mascot search filter). It has no form that writes, no fetch to a write API, and no server. Nothing write-capable had to be removed.

## 2. GitHub Actions

`gh run list --limit 5` (read-only):

| Run | Workflow | Branch | Event | Result |
| --- | --- | --- | --- | --- |
| 44781097089 | validate | `main` | push (merge of PR #2) | success, 6m39s |
| 44780235210 | validate | `feat/brand-os-v0.2` | pull_request | success |
| 44780223153 | validate | `feat/brand-os-v0.2` | push | success |
| 44776046896 | validate | `feat/brand-os-v0.2` | pull_request | success |
| 44776035659 | validate | `feat/brand-os-v0.2` | push | success |

The 0.2.0 final review said the workflow "has not run on GitHub during this work". That is no longer true: the workflow, including the internal-docs compile step, passed on `main` after the merge.

## 3. Local checks on `3c98e00`

| Check | Command | Result |
| --- | --- | --- |
| Full CI | `npm run ci` (lint, typecheck root and docs, validate, test, tokens build, public docs build en/fa/tr, no-mascot public build) | **Exit 0** |
| Validation | `npm run validate` | Passed, 0 warnings |
| Tests | `npm run test` | **131 tests, 131 pass, 0 fail**, 19 files |
| Docs builds | public and no-mascot | Both built for en, fa (`dir="rtl"`) and tr. "Copied 34. Excluded 50." |
| Example journey | `npm run example:education` (temp copy) | Runs. Status report and next questions are printed. |
| Example journey | `npm run example:b2b` (temp copy) | Runs. No mascot questions are asked. |
| Status | `npm run brand:status` on the template | Coverage report with critical business questions first. |
| Doctor | `npm run brand:doctor` on the template | Exit 1 with `[FAIL] data_key` and `[WARN] approval_secret`. This is expected: the template checkout has no `BRAND_OS_DATA_KEY` and no approval secret. Config, publication policy and `.env` ignore checks pass. |

The docs build rewrote the tracked generated files (`apps/docs/generated/features.json`, `apps/docs/src/data/*.json`) and deleted `llms.txt` and `llms-full.txt`. They were restored with `git checkout --`, as the 0.2.0 workflow notes say.

## 4. Prerequisite checklist (§0.3)

| Prerequisite | Evidence | Verdict |
| --- | --- | --- |
| Adaptive AI interview | `brand:next --json`, `brand:interview --question`, `brand:propose`, `--assist` with providers `none`/`mock`/`anthropic` (`packages/brand-core/src/interview-next.ts`, `proposal-intake.ts`, `llm/`). Tests: `interview-ai.test.ts`, journeys A–C. | Works. Anthropic is only tested with a stubbed fetch (known, documented). |
| Professional documents | One section model with approved/assumption/recommendation/missing tags and source ids (`documents/model.ts`). Brand Book, business plan, marketing plan. `brand:document`. Tests: `brand-book.test.ts`. | Works for 3 documents. Other modules use compiled field pages (documented). |
| Brand/design token generation | `brand:tokens:generate|approve|publish`, hash approval (`token-generate.ts`). Tests: `brand-tokens.test.ts`. | Works. |
| Financial features | `finance.ts`, `brand:finance`, typed missing/undefined results. Tests: `finance.test.ts`. | Works. No live billing/CRM adapters (documented). |
| Mascot features | Lifecycle, artwork variants, `brand:migrate`, `kind: mascot` finder. Tests: `mascot.test.ts`. | Works. No art ships (by design). |
| Existing brand journeys | `tests/journeys.test.ts` A (education + mascot), B (B2B SaaS without mascot), C (security). | All pass. |
| Approval, publication, agent access | Proof-gated approval and publication, scoped read-only agent tokens, one retrieval path. Tests: `approval-batch`, `agent-access`, `security-contract`. | Works. |

## 5. Independent architecture review

I read the core rather than the 0.2.0 review. These are the facts that shape Phase 8:

1. **Question banks are generated, then canonical.** `content/*.ts` defines modules and questions. `materialize` writes `brand/interview/question-bank/*.yaml`, the field registry and the knowledge graph only when a file is missing. The engine reads the YAML. `brand:validate` checks the YAML against the TypeScript source (prompt drift, missing starter questions, at least 5 questions per module). A new module must go through the same path, or it would be a second, competing source.
2. **`brand.profile` is an interview subset, not a brand type.** A profile is a YAML list of question ids (`founder-core`). No file means "full bank". The contract's `company`/`product`/`personal-brand` names must fit this mechanism instead of replacing it.
3. **Completeness ignores the profile.** `completeness()` always scores the whole bank, so a narrowed profile still reports company questions as "required unanswered". For a person-only brand that would turn corporate legal-entity and SaaS questions into missing work. Phase 8 needs an opt-in exclusive scope. Changing `founder-core` silently would change existing numbers, so it should stay as it is.
4. **Optional modules are hard-coded prefixes.** `disabledModule()` knows `brand.mascot.` and `brand.gamification.`. The docs build, dashboard and `ModuleDef.optional` follow the same two flags. A personal module should use this same pattern, so the template and every existing `universal` brand keep their behavior, with the personal questions not applicable.
5. **The condition language cannot test a list.** It supports `==`, `!=`, `in` and `not_in` on scalars. Combinable facets need a list membership test in the same engine, not special cases in callers.
6. **Agent profiles allow every non-business module.** `design` and `marketing` would read any new `personal-*` module, including career history. Phase 8 must narrow these profiles explicitly.
7. **Publication checks approval and classification only.** Nothing distinguishes owner testimony from independent verification, and assets have no rights check (`assetIsPublic`). Phase 8's evidence and rights rules need a gate in the same approval service and publication helpers, not in renderers.
8. **One document model.** New personal documents should be section specs on `buildDocument`, extended with a verification marker. A second renderer would drift.
9. **Strengths to keep.** One retrieval path (`brandRetrieve`) for MCP and the CLI. Approval logic in one service. Atomic writes. Restricted values encrypted and never sent to providers. A public build refused for private brands.
10. **Risks carried forward from 0.2.0.** `engine.ts` is still large. YAML is the store, with one writer at a time. Locales are a closed union (`en`/`fa`/`tr`). A single shared approval proof. These do not block Phase 8.

## 6. Open issues relevant to phases 8 and 9

- No open GitHub issues or PRs.
- Known 0.2.0 limits (`docs/IMPLEMENTATION_STATUS.md`): no browser interview UI (by design, and now permanently out of scope for Studio), Anthropic untested live, fa/tr module body copy still English, no CI matrix, no CSP headers.
- The owner amendment of 2026-11-20 (`00_READ_ME_FIRST.md`) makes Studio read-only after repository creation. Phase 8 data must therefore be readable from Git-tracked files without `brand/.private`, and every personal privacy label must be in the tracked data, not computed only from secrets.

## 7. Decision

**GO for Phase 8** (Personal Brand OS) on `feat/phase-8-personal-brand-os`. Phases 1–7 are merged, CI is green on `main` and locally, and the interview, documents, tokens, finance, mascot and journeys all have working, tested implementations.

**Phase 9** (read-only Studio) is a separate run, branch and PR. Phase 8 must not add any Studio code or any web write path.

**Update (Phase 9).** Phase 9 is implemented on `feat/phase-9-read-only-studio`, stacked on Phase 8. It adds `apps/studio` only; Phase 8 code paths are unchanged and Studio reads Phase 8 data from Git-tracked files without `brand/.private`. No write-capable Studio screen was ever built, so none had to be removed. Status: `docs/IMPLEMENTATION_STATUS.md` (Phase 9); guide: `docs-internal/STUDIO.md`.
