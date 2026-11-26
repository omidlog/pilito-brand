# Identity audit and logo brief (Identity Slice D)

Core: `packages/brand-core/src/identity/` (`@brand-os/brand-core/identity`). CLI: `npm run brand:identity`. Skill: `agent-skills/logo-identity-strategist/SKILL.md`. Tests: `tests/identity-brief.test.ts`, `tests/identity-cli.test.ts`.

The brief is a **design decision document**, not logo drawing. It is a typed, deterministic draft (`status: draft`, `authorizes: []`) that the owner reviews. It never writes `brand.logo.*`, a brand fact, the asset manifest or a master file.

## Owner workflow

1. **Status.** `brand:identity brief` reads the onboarding hint (`onboarding.identity`, Slice A) and shows it as `intake_hint_unconfirmed`. The owner confirms the path with `brand:identity answer --question identity.path --value create|retain|evolve|rebrand|undecided`. The confirmed path always wins over the hint.
2. **Diagnosis.** `brand:identity next [--lang fa]` gives the next question for the confirmed path (why change, observed problem or preference, success signals, what must not change, recognition evidence, real uses, writing systems, rollout constraints). Questions that do not apply to the path are skipped with a reason. `unknown` is a real answer. `--words "…"` stores the owner's own words as a local Knowledge note (`owner_note`, tag `identity-audit`); the audit keeps only the note id and revision.
3. **Equity preservation matrix.** `brand:identity equity --component <c> --choice preserve|refine|replace|evaluate|unknown [--evidence owner_reported|measured_study|unknown] [--study-note kn_…] [--words "…"]`. Components: `name`, `logo_symbol`, `logo_wordmark`, `colors`, `typography`, `mascot`, `tone`, `tagline`, `imagery`, `other`. `measured_study` is refused without a cited Knowledge note holding the study or its summary. An element listed under "must not change" but marked `refine`/`replace` is flagged as a conflict, never resolved silently.
4. **Concept rounds.** Create a Creative Learning project with `--surface logo` (`brand:creative project …`), add real sketches as variants, record feedback and selection there, then `brand:identity link-creative --project <id>`. The brief lists each variant, its status and the owner's reasons by `knowledge:kn_…@sha256` ref. Selection is `owner_selected_for_this_project`, `approved_mark: false`.
5. **Read and review.** `brand:identity brief [--lang en|fa|tr] [--market TR] [--json]` prints Markdown (or JSON). `brand:identity reviewed` records the brief and source digests the owner read; a later brief shows `changed since` when an answer, fact revision, research source or concept round changed. It approves nothing.
6. **Hand-off.** Real artwork is registered in `brand/assets/asset-manifest.yaml` with license, rights and checksum (`npm run validate`). `brand.logo.*`, name, color and type changes go through `brand:propose` / `brand:knowledge propose`, then `brand:review` and `brand:approve`. `agent-skills/logo-designer` then specifies lockups from the approved master. A qualified person runs the trademark search.

## Brief contents

| Section | Source | Notes |
| --- | --- | --- |
| Status, path, conclusion | audit + intake hint | Conclusions: `create_first_identity`, `retain_improve_usage`, `change_requested`, `owner_decision_required`. Retain is a valid result when nothing is marked for change and the problem is a preference. |
| Problem, canonical inputs | answers + approved facts by id and revision | `brand.strategy.*`, `business.customer.primary_segment`, `business.market.geography`, `brand.personality.traits`. Values are never copied. |
| Existing assets | `brand.logo.*`, color, type, verbal, mascot facts; logo-tagged manifest entries | EXAMPLE placeholders are flagged, never a mark. |
| Equity matrix, migration risks | audit | Evidence level `measured` / `owner_reported_preference` / `unknown`. Not applicable on the create path. |
| Visual landscape | **only** `buildCompetitiveMemo(ws, 'identity')` (Slice C) | `visual_language` observations by ref; `unavailable` without cited visuals; similarity `not_assessed`. No quote is copied. |
| Routes | fixed catalog | Create: wordmark-led, symbol + wordmark, character mark (only if the mascot module is on) or monogram. Existing identity: retain-and-improve-usage, evolve, full rebrand, ordered by the path. Each has why, why not, risks, preserved and changeable elements, attributes (fact ids), red lines and the rubric. |
| Uses and checks | `identity.applications`, `identity.scripts` | Only uses the owner named; until answered, all are listed to confirm. Minimum size is never invented: it cites `brand.logo.min_size` only when an approved master exists. |
| Rubric | fixed | strategic fit, distinctiveness, legibility, versatility, meaningfulness, longevity, feasibility, legal-risk review; success signals mark emphasis; `weights: null`. |
| Decision record | audit + Creative Learning | reviewer `owner`, selected concept, open concerns, next revision, source revisions, last review. |
| Missing, not known, never inferred | all of the above | Path unconfirmed, pending questions, missing facts, no master, visual gap, no concept project, legal search not performed, unknown equity. |

## Storage and privacy

`brand/.private/identity/audit.json` (gitignored, mode 0600 through the Knowledge vault writer, per-record lock, other brands' records refused). It holds closed-vocabulary answers, equity choices with history, the linked creative project id and review marks. No MCP tool, `brand:query` path, Studio page, public projection or docs build reads it. Every function and command refuses while `BRAND_OS_AGENT_TOKEN` is set.

## Reuse map

| Need | Reused | New |
| --- | --- | --- |
| Owner words, studies | Knowledge `captureNote`, `findNote` | none |
| Competitor visuals | Slice C `buildCompetitiveMemo(ws, 'identity')` | none |
| Concept rounds and feedback | Creative Learning (`logo` surface added) | none |
| Approved inputs | `readFacts` by id and revision | none |
| Digests | Strategy Feed `canonicalJson`, `sha256Hex` | none |
| Approval and assets | `brand:propose/review/approve`, asset manifest | none |
| Identity diagnosis | — | `identity_audit` record: answers and equity choices only, no text, no approved value |

The diagnosis questions are a typed record in `identity/model.ts` rather than the interview bank: they are owner-local audit answers, not brand facts, so they must not be materialized into the shared question bank or approval ledger.

## Not built

Logo drawing or generation, trademark clearance, Figma API, Studio view, agent/MCP access, weighted scoring, persisted brief history (the review mark stores digests only).
