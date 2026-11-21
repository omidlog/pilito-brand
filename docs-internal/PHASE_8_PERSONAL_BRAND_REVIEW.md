# Phase 8 review: Personal Brand OS

Branch `feat/phase-8-personal-brand-os`, from `main` at `3c98e00` (v0.2.0). Entry gate: `docs-internal/POST_V02_PREFLIGHT.md` (GO for Phase 8). Date: 2026-11-21. Written by Claude Code. Owner review is still required before merge.

User guide: `docs-internal/PERSONAL_BRAND.md`.

## What was built

| Area | Where |
| --- | --- |
| Personal module and facets in config, conditions and docs filters | `types.ts`, `conditions.ts` (`personalConfig`, `moduleEnabled`, `facets has/lacks`), `config.ts` |
| Exclusive `personal-brand` interview profile | `content/profiles.ts`, `profiles.ts` (`exclusive`, `completenessScope`), `completeness.ts` |
| Question bank: 8 core and 5 facet modules, 71 questions, en/fa/tr prompts | `content/personal-core.ts`, `content/personal-facets.ts` → `brand/interview/question-bank/personal.yaml` |
| Structured `relationships` answer type with explicit ownership | `structured.ts`, `documents/markdown.ts`, `schemas/question.schema.json` |
| Privacy guard on every personal write path | `personal-privacy.ts`, `approval.ts` (`normalizeAnswer`), `engine.ts`, `proposal-intake.ts` |
| Canonical person/business references, additive migration | `personal.ts`, `backup.ts` (`migrateBrand`) |
| `brand:init --profile personal-brand --facets … --personal` | `engine.ts` (`personalInit`, `applyInit`), `scripts/brand.ts` |
| Evidence and rights register, publication gate, retraction | `evidence.ts`, `approval.ts` (`publish`, `reviewEvidence`, `withdrawEvidence`, `retract`), `publication.ts`, `query.ts` |
| Asset rights for portraits, case studies, client logos, testimonials | `asset-rights.ts`, `publication.ts` (`assetIsPublic`), `query.ts`, `schemas/asset.schema.json` |
| Agent profile narrowing for personal modules | `auth.ts` |
| Ten deliverables with verification labels and length reports | `documents/model.ts`, `documents/personal.ts`, `documents/markdown.ts` |
| Draft-only MCP tool | `query.ts` (`draftPersonalContent`), `scripts/mcp.ts`, `brand:query --tool draft_personal_content` |
| CLI | `brand:evidence list|add|verify|reject|withdraw|check`, `brand:retract` |

No Studio, web UI, web API or write endpoint was added. `apps/docs` is still a static site.

## Acceptance checklist (§8.8)

| Requirement | Result | Evidence |
| --- | --- | --- |
| Fresh personal-brand initialization preserves the existing corporate profile behavior | Pass | `personal-brand.test.ts`: universal template never asks personal questions and scores them not applicable; SaaS brand keeps its business interview. Journeys A and B unchanged and passing. |
| Founder+consultant interview adapts and stores evidence with stable ids | Pass | `personal-brand.test.ts` facet test; journey D (real CLI) |
| Person-only profile never requires a legal entity, SaaS stack or mascot | Pass | `personal-brand.test.ts`: required counts for business and mascot modules are 0; queue has no `business.*`, `brand.mascot.*`, `brand.ui.*` |
| A founder is not automatically the owner; relationship fields are explicit | Pass | `relationships` type: ownership defaults to `unstated`; `owned` is not a relation; legal name stays `TBD`. `personal-brand.test.ts`, `personal-evidence.test.ts`, journey D |
| Personal and business fact collisions resolved by canonical references | Pass | `PERSONAL_CANONICAL_REFERENCES` validated by `brand:validate`; public name vs trade name test in `personal-brand.test.ts` |
| Financial and private career details absent from public builds and guest MCP | Pass | `personal-evidence.test.ts` (guest sees only the published headline; design/marketing/finance cannot read career or boundaries); journey D canary scan of the public build |
| Unverified education, client results and speaker history cannot be published as verified | Pass | `personal-evidence.test.ts`: no evidence, owner testimony and pending agent evidence are all refused; withdrawal and expiry hide the claim |
| Portrait and case-study rights enforced for public asset publication | Pass | `personal-evidence.test.ts` asset rights and case-study permission tests |
| Two bio variations cite the same approved facts and do not diverge | Pass | `personal-documents.test.ts`: same source ids and values in short and long bios; no padding |
| Existing education app and B2B SaaS journeys still pass | Pass | `tests/journeys.test.ts` A, B, C |
| `brand:init`, `brand:migrate`, backup/restore, docs compilation, search and core upgrade | Pass | Journey D (init via CLI, backup, restore, migrate, public and internal docs builds, `validateRepo` clean); migration test in `personal-brand.test.ts`; search uses the gated retrieval path |
| End-to-end evidence and gaps recorded here | Done | This file |

## Test and build results

`npm run ci` (lint, typecheck root and docs, validate, test, tokens build, public docs build en/fa/tr, no-mascot build): exit 0.

Tests: **157 pass, 0 fail** across 22 files (131 before Phase 8). New: `personal-brand.test.ts` (12), `personal-evidence.test.ts` (7), `personal-documents.test.ts` (6), journey D (1). `audit.test.ts` now expects the `draft_personal_content` MCP tool.

No test touches the network. All personal fixtures are synthetic.

## Decisions to review

1. **Profile ids.** Only `personal-brand` was added. `company` and `product` from the contract are not separate profiles, because `universal` and `founder-core` already cover them and an empty label would widen nothing. Owner decision whether to add them as named subsets.
2. **Agent profile allocation.** `design` and `marketing` get the person-facing modules listed in `PERSONAL_BRAND.md`; career history, evidence and privacy boundaries are `internal-read` only. A marketing agent therefore cannot draft a LinkedIn experience section; use an `internal-read` token for that.
3. **Owner self-certified permissions.** A permission with `source_type: owner_testimony` counts once the owner verifies it. This covers the common case of the owner holding a portrait licence. Verification testimony does not count; permission testimony does.
4. **Privacy guard scope.** It runs on personal questions and the evidence register only, not on company modules, so existing business answers (prices, phone-like ids) behave as before.
5. **Length guidelines** are reported, never enforced or padded.

## Gaps and limits

- **No designed portal page for the personal documents.** They render through `brand:document` (Markdown or JSON) and the compiled module pages in the internal docs build. A designed `/personal-book` page like `/brand-book` is not built. Studio (Phase 9) is expected to render these models read-only.
- **No prose generation.** Documents list facts. Drafting is done by an agent through `draft_personal_content`, then approved by the owner. There is no in-repo LLM bio writer.
- **Privacy guard is heuristic.** It catches common phone, email, birth-date, id, address and family phrasings in en/fa/tr. It can miss an address written without a cue ("12 Main St") or refuse a legitimate long number. It is a guard, not a classifier.
- **No legal compliance claim.** GDPR, KVKK and similar obligations (lawful basis, retention, data-subject requests, consent of third parties in testimonials and photos) need a dedicated legal review.
- **Translation review** relies on separate approval of localized claims (`personal.identity.localized_headline`, `name_forms`). There is no automatic link between a source claim and its translation, so a changed English headline does not flag its translations as stale.
- **No personal contradiction rules.** Dates in `personal.story.timeline` are not cross-checked against `personal.experience.relationships`.
- **Module guidance text** on the personal overview pages is English; prompts are localized in fa and tr.
- **Evidence register concurrency.** One writer at a time, like the rest of the YAML store. Ids are sequential.
- **Review dates** use the local clock in UTC days.

## Phase 9 handoff

Everything a read-only Studio needs for a personal brand is in Git: the config block, bank and profile, ledger and fact files, evidence register, asset manifest with rights, and the document models via `buildPersonalDocument`. Privacy labels are question data, not values derived from `brand/.private`. Studio must not edit, approve, publish, verify evidence or upload assets.
