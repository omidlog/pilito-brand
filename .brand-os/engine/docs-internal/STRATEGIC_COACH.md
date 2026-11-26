# Strategic Coach & Answer Assurance

> Status: **PR 1 — read-only deterministic core and the Coach UX moments, plus PR 2 rules (fixes pack GAP-08).**
> Three modes work without a model, and the coach speaks on its own at three moments (see
> [Rollout and automatic moments](#rollout-and-automatic-moments)), including a read-only Studio Overview card.
> `consistency_review` separates `confirmed_conflict`, `potential_tension`, `needs_verification` and `not_tested`;
> `quality_review` adds six personal facet rubrics. The optional provider and any richer panel are not built
> (see [What is not built yet](#what-is-not-built-yet)).

The coach is a thin advisory layer **on top of** the existing Brand OS interview. It reads what is already
there and says what it notices. It is not a chatbot, not a second interview, and not a source of truth.

```
engine questions (allQuestions) ─────┐
brand/interview/answer-ledger.yaml ───┤
brand/interview/session-state.yaml ───┤      read only
profiles + brand/overrides/profiles ─┼───►  packages/brand-core/src/coach/  ───►  CoachResult
brand/interview/evidence-register.yaml┤      (pure functions, no I/O writes)       authority: derived_advice
contradictions.ts findContradictions ─┘                                            authorizes: []
                                                                                        │
                                                        npm run brand:coach  ◄──────────┘
                                                        (prints; stores nothing)
```

## Hard rules

1. **Derived and advisory only.** `authority` is always `derived_advice` and `authorizes` is always `[]`.
   The coach never edits an answer, a fact, a config value, a strategy, an asset, a calendar, an approval
   or a publication. There are no silent writes, no auto-approve and no auto-correct. Twelve tests
   snapshot the whole brand directory and assert it is byte-for-byte unchanged after an analysis.
2. **One interview engine.** `InterviewEngine` owns the questions, the ledger and the approval gates. The
   coach uses canonical question ids and the engine's own eligibility, skip, dependency and disposition
   rules. There is no second question bank, no second approval path and no second knowledge store.
3. **Deterministic rules are the baseline.** Nothing in this version calls a model. A finding's `origin`
   is `deterministic`; `model_suggestion` is reserved and unused.
4. **No owner words leave the analysis.** Finding text is assembled from closed vocabularies, question
   ids, the coach's own lexicon terms and document paths. The owner's answer is never quoted, echoed,
   summarised or paraphrased. A canary planted in an answer must not appear in any output, and a test
   checks exactly that.
5. **Restricted questions are refused, not redacted.** `brand:coach` on a restricted question exits
   non-zero with `refused`. No value, no digest, no length and no hint of one is produced.
6. **Owner-local.** Every mode is denied while `BRAND_OS_AGENT_TOKEN` is set, and no MCP tool or
   `brand_retrieve` kind exposes the coach. Agent access needs a separate narrow access review.
7. **No numbers that pretend to be measurements.** No score, no percentage, no confidence. `severity` is
   `info` / `advice` / `attention`, and that is a routing hint, not a measurement.
8. **`unknown`, `skip`, `not relevant` and `decide later` are real answers.** The coach never turns one
   into required re-questioning.

## The three modes

All three are callable independently: `npm run brand:coach -- analyze --mode <mode>`.

### `follow_up` — Smart Follow-up

Returns **0 or 1** clarifying question for one answered question.

- It first runs the same rubric as `quality_review`. No deficit means **no question** — a `ready` answer is
  left alone, because the cheapest coaching is silence.
- If an **existing canonical question** closes that exact gap, the coach returns its id in
  `canonical_question_id` and leaves `suggested_question` null. It never writes a second version of a
  question the interview already owns. "Exact" means the deficit itself names the id: today that is a
  declared prerequisite (`depends_on`) that is still open. The other fields of an open contradiction are
  considered too, but they are by definition already answered, so in practice that gap falls through to a
  clarifying question about which of the two statements should stand.
- If the gap is **inside the answer** (it is vague, it carries no figure, it has no evidence), no other
  question can close it, so the coach asks its own single clarifying question from
  `clarifyQuestion` — one per criterion and question family, in en, fa and tr. The family comes from the question
  id (`questionFamily`): `audience` (segments, buyers, target clients, pains), `boundaries` (boundaries, things to
  avoid or never publish, misuse, guardrails) or `general`. Only `specificity` differs by family, so a boundaries
  answer is asked which topics are off-limits, never which group it serves; every other criterion is worded for any
  question, and `evidence_support` names no company, so it fits a person too (coach-rules/6, BOS-08).
- **Decline.** `decide later` on the target question is a decline: the coach reports
  `follow_up_none` with reason `already_deferred` and does not re-dress the same gap as a new question.
  `skip` / `unknown` / `not relevant` on the target is equally final.
- **At most one per answer.** The chooser is a pure function of (question, answer revision), so re-running
  returns the same single suggestion rather than a new one, and answering the question changes the
  revision, which closes it. That is why no new storage and no dedupe table were needed.

### `quality_review` — Answer Quality Review

Returns an **explainable status** and at most **two** named deficits, each with the criterion it assessed
and one concrete next step. It judges the data, never the person.

| Criterion | When it applies | What fires | Status |
| --- | --- | --- | --- |
| `relevance` | always | the stored value is a template placeholder (`TBD`, `EXAMPLE: …`, `—`) | `needs_review` |
| `evidence_support` | the question declares `publication_requires: verified_evidence` | `claimVerification` says `unverified` or `owner_stated`. A verified, current, independent source in the evidence register silences it, and also silences the facet rubrics' `evidence_support` findings for that claim | `evidence_missing` |
| `clarity_coherence` | always | the field is named by an open contradiction from `findContradictions` | `needs_review` |
| `specificity` | `short_text`, `long_text` | fewer content words than the type's minimum (8 / 2; 1 for facts short by design — `brand.verbal.tagline`, `brand.strategy.promise`, `SHORT_BY_DESIGN_IDS`), or a vague lexicon term in an answer of ≤25 content words | `needs_clarification` |
| `completeness_for_output` | the question declares `depends_on` | a declared prerequisite is still open | `needs_clarification` |
| `measurability` | `number` type, or an id ending in `objective(s)`, `metric(s)`, `kpi(s)`, `okr(s)`, `target(s)`, `baseline`, `budget`, `price`, `pricing`, `runway` | the answer carries no digit (Persian and Arabic digits count) | `needs_clarification` |

Short-circuits, checked in this order:

1. the question does not apply under the current config or answers → `not_applicable`
   (`question_not_applicable`), never "missing";
2. no live answer → `insufficient_context` (`answer_missing`);
3. an explicit disposition → `not_applicable` (`answer_disposition`), with no deficits and nothing to do.

Otherwise the status is the worst of the findings, in the order `needs_review` → `evidence_missing` →
`needs_clarification` → `ready`. A `ready` answer reports `meets_criteria` and lists the criteria that
actually applied, so "ready" never reads as more than it is: a check on the data, not a verdict on the
decision.

**An approved fact is not automatically a good answer.** When a deficit lands on an approved answer the
finding sets `requires_change_request: true` and the result notes that changing it needs
`brand:interview` change → `brand:review` → `brand:approve`. The coach proposes nothing.

### `consistency_review` — Strategic Consistency

With no `--question` it reviews the whole brand; with one it narrows to that field's conflicts.

`findContradictions` in `packages/brand-core/src/contradictions.ts` stays the only implementation of the
logical contradiction rules, and the coach reports what it returns, by id, unchanged. That is how "existing
deterministic contradictions remain identical" holds by construction rather than by comparison. On top of it,
a narrow registry in `packages/brand-core/src/coach/rules.ts` (PR 2, fixes pack GAP-08) adds two other
verdicts. The verdicts never carry a number: no score, no percentage, no confidence.

| Verdict | Comes from | Means | Finding |
| --- | --- | --- | --- |
| `confirmed_conflict` | `findContradictions` only | two records cannot both be true | `consistency_rule`, `needs_review`, `attention` |
| `needs_verification` | registry: `evidence-claim-unverified`, `sensitive-claim-wording` | a claim that needs a source has no current independent one | `consistency_verification`, `evidence_missing`, `attention` |
| `potential_tension` | registry: `premium-vs-lowest-price`, `availability-held-back` | both can be true, but they often pull apart; the coach asks one question | `consistency_tension`, `needs_clarification`, `advice`, with `suggested_question` |
| `not_tested` | every rule, in `rule_checks` | an input is open, so the rule could not run | no finding; listed in `rule_checks` and printed |

The result status is the worst verdict present: `needs_review` → `evidence_missing` → `needs_clarification`.

**The registry rules.** Each declares its fields, its exact condition and its guards, and has positive and
negative tests in `tests/coach-rules.test.ts`. Matching is whole-phrase, case-insensitive and NFKC-normalised
across en/fa/tr, with the lexicon in `rules.ts`. No rule reads a question that does not apply under the current
config (module off, skip condition): it is `not_applicable` there too, as in `quality_review`. The cheap-price markers
use the same negation guard as `sensitive-claim-wording` ("we are never cheap", «ارزان نیستیم», "ucuz değil").

| Rule | Fields | Fires when | Stays silent when (guard) |
| --- | --- | --- | --- |
| `premium-vs-lowest-price` | `brand.strategy.differentiation`, `brand.strategy.promise`, `business.offer.value_proposition`; `business.sales.pricing` | a positioning answer uses a premium word (premium, luxury, high-end, لوکس, ممتاز, lüks, seçkin, …) **and** the pricing answer calls the price cheapest / cheap / lowest / bargain (ارزان‌ترین, en ucuz, …) | the pricing answer names an entry tier, plan, starter, trial, launch offer, first month, student or nonprofit price (پلن, ورودی, ماه اول, giriş, başlangıç, paket, …). A plain figure never fires, and neither does "affordable": the coach cannot know what is cheap in a given market |
| `availability-held-back` | `business.product.public_status`, `business.marketing.availability_claim` | the product is `available` while marketing may say only `coming-soon` or nothing (`do-not-claim`): a staged launch is allowed, so it is a question | any other pair. The reverse (`available` claim, `unshipped` product) is the existing confirmed conflict and is not re-implemented |
| `evidence-claim-unverified` | every answered question with `publication_requires: verified_evidence` | `claimVerification` is `unverified` or `owner_stated` | an independent source has been verified with `brand:evidence`. Owner testimony alone never settles it |
| `sensitive-claim-wording` | every other answered, non-restricted free-text question, except `brand.verbal.forbidden`, `personal.governance.public_claim_policy`, `business.marketing.availability_claim`, `brand.mascot.forbidden`, `personal.media.avoid` and `personal.privacy.never_publish` (they list words or things to leave out) | the answer asserts a guarantee, certification, accreditation, "number one", award or proof (تضمینی, گواهی‌شده, garantili, sertifikalı, …) and the field has no verified independent source | the term is negated in the three words before it ("we never promise guaranteed results", هرگز, بدون, نمی…) or followed by Turkish `değil` or Persian `نیست` (with personal endings) |

**Sensitive claims stay unverified.** The coach reads the evidence register through `claimVerification` and
never writes to it: a test adds a pending source and asserts the brand is byte-for-byte unchanged, and only
the owner's `reviewEvidence(…, 'verified', proof)` on an independent source silences the finding.

**No false conflict for a legitimate trade-off.** `tests/coach-core.test.ts` still pins twelve tense but
legitimate records (premium next to an entry price, two markets, dated figures, dispositions, an honest
`do-not-claim` on an unshipped product) as producing nothing. `tests/coach-rules.test.ts` adds eight pricing and
market cases in en, fa and tr — a plain entry figure, "affordable" premium, two markets with two prices, a cheap
student entry plan, a launch offer, a Persian cheap entry plan, a Turkish cheapest starter package, cheap
pricing without a premium claim — and asserts no conflict **and** no tension for each. A tension never becomes
`field_in_open_conflict` in `quality_review`; that criterion still reads `findContradictions` only.

**`rule_checks`.** A `consistency_review` result carries one entry per rule (the four adapted
`findContradictions` rules first): `outcome` (`confirmed_conflict`, `potential_tension`, `needs_verification`,
`no_finding`, `not_tested`), `basis` (`rule_fired`, `rule_silent`, `guard_matched`, `inputs_open`) and the
question ids involved. A review scoped to one question keeps the checks that name it and the brand-wide checks
(no question ids), which read it too. The printed result lists them under "Rules checked" in the result's locale, so silence
from a rule that could not run is never read as "consistent". A tension outside the registered rules is not
assessed; the result's `notes` says so.

An empty brand is `insufficient_context`, not "consistent".

## Reading a result

Shape: [`schemas/coach-result.schema.json`](../schemas/coach-result.schema.json). The authoritative
validator is the Zod schema in `packages/brand-core/src/coach/model.ts`; a test checks real results against
both, so the published document and the code cannot drift.

| Field | Meaning |
| --- | --- |
| `mode`, `locale`, `question_id` | what was asked for. `question_id` is null for a brand-wide consistency review |
| `answer_ref` | the exact ledger revision analysed: `answer_id`, its status, and a 16-hex digest |
| `analysis_scope.questions` | the question ids the rules read |
| `analysis_scope.context_digest` | a digest over the rule version, the brand, the profile and every question id with its answer revision. **Equal digests mean equal results**, so stale advice is recognisable |
| `status` | one of `ready`, `needs_clarification`, `evidence_missing`, `needs_review`, `not_applicable`, `insufficient_context` |
| `findings[].code` | a closed-vocabulary code with en/fa/tr text. A code the i18n table does not cover fails a test |
| `findings[].criterion` / `missing_dimension` | which rubric criterion, in the coach's vocabulary |
| `findings[].canonical_question_id` | an existing question to ask instead of a new one |
| `findings[].suggested_question` | the one clarifying question, localized, when no existing question fits |
| `findings[].improves_outputs` | the document paths this answer feeds (`related_outputs`), so the advice names what it improves |
| `findings[].requires_change_request` | acting on this means changing an approved fact, which is a human step |
| `findings[].source_refs` | what was read, as `kind:id` only — question, answer revision, contradiction, evidence register, profile, config |
| `authority`, `authorizes` | always `derived_advice` and `[]` |
| `notes` | how it ran: `no_model_called`, `advisory_only`, which criteria applied, and what this version does not assess |

**Nothing is stored.** Everything is computed on demand; there is no cache file and no coach directory.
The two digests exist so that a later cache, or a read-only projection, can be keyed on
`brand / question / answer revision / context digest / mode / rule version` and expire by itself when a
fact changes. `COACH_RULE_VERSION` is bumped whenever a rule changes its verdict for the same input.

## CLI

```
npm run brand:coach -- analyze --mode quality_review --question business.customer.primary_segment
npm run brand:coach -- analyze --mode follow_up --question business.customer.primary_segment --lang fa
npm run brand:coach -- analyze --mode consistency_review --json
npm run brand:coach -- next                 # coach the question you answered last in this session
```

Real output from a SYNTHETIC DEMO brand whose segment answer reads
*"Small businesses and really everyone who needs high quality."*:

```
Strategic coach — example-brand
Advisory only. Nothing here is a brand fact, an approval or a change. The coach wrote nothing.

Mode: follow_up
Question: business.customer.primary_segment
Status: needs clarification

Findings:
1. [follow_up_clarify] needs clarification — specificity
   One clarifying question would make business.customer.primary_segment usable for
   brand/generated/drafts/brand-strategy.md, brand/generated/drafts/business-company.md,
   brand/generated/drafts/business-marketing.md. The missing dimension is specificity, and no existing
   question covers it.
   Suggested question: Which single group or situation do you mean, and what is their main problem?
   Next step: Answer in your own words, or reply skip, unknown or decide later — the coach will not ask
   again for this answer.
   Improves: brand/generated/drafts/brand-strategy.md, brand/generated/drafts/business-company.md,
   brand/generated/drafts/business-marketing.md
   Read: question:business.customer.primary_segment, answer:ans-0002

No model was called. Every finding is deterministic.
engine coach/1 · rules coach-rules/6 · authorizes: []
```

(Line-wrapped here for the page; the command prints each field on one line.)

Exit codes: `0` success, `1` a refusal or a bad id (`refused`, `not_found`, `invalid_input`,
`invalid_output`; with `--json` the body is `{ ok: false, error: { code, message } }`), `2` a usage error.
An unexpected error prints its name only — never a message that could carry a path or a value.

### Rollout and automatic moments

The coach no longer waits to be called. `docs-internal/COACH_UX_DECISION.md` records the decision:
`brand:interview` (after a recorded answer), `brand:approve` (before the proof prompt) and the Studio Overview
call it through `coach/moments.ts`, which filters for important questions (strategic namespaces or evidence
claims, free text or a measure, never restricted), shows at most one note per answer and only on its first
revision, never blocks, and stays silent otherwise with a closed-vocabulary reason. It is **on by default**;
`BRAND_OS_COACH=off` silences the automatic moments for one shell (an environment switch rather than a config
field, so the brand config holds no tool preferences). The MCP server and `brand:next` still do not call it.

## Boundaries with the neighbouring systems

| System | Owns | The coach does not |
| --- | --- | --- |
| `InterviewEngine`, `approval.ts` | questions, answers, dispositions, approval, publication | ask a question of its own that duplicates a canonical one; write, approve or publish anything |
| `contradictions.ts` | the deterministic contradiction rules | re-implement, extend or weaken them in this version |
| `evidence.ts` | evidence, verification, rights | verify, reject, withdraw or invent a source |
| Strategy Feed (`docs-internal/STRATEGY_FEED.md`) | owner-approved strategy revisions | produce or alter a strategy record; an advisory finding is not a strategy |
| Knowledge Inbox (`docs-internal/KNOWLEDGE.md`) | the owner's unstructured notes | create a note; coach output is computed, not captured |
| Creative Learning (`docs-internal/CREATIVE_LEARNING.md`) | design feedback and scoped preferences | record a preference; the coach reads nothing from it yet |
| Studio (`docs-internal/STUDIO.md`) | the read-only viewer | add a route, a form, a chat or a model call (the Overview coach card is a projection field built during sync) |

**Trust v2 (parallel work).** A separate branch is building the global trust / assurance model: a
framework and claim registry, a typed assessable **control** model, evidence lineage, maturity and an
auditor view. That work owns the words *control*, *assessment*, *maturity* and *evidence lineage*. The
coach deliberately keeps its own `Coach*` vocabulary, defines no control or framework type, and resolves
evidence only through the existing `claimVerification`. Where the two meet:

- `quality_review`'s `evidence_missing` and Trust v2's evidence assurance read the same register. If Trust
  v2 lands a richer lineage resolver, the coach should call it rather than grow one.
- Trust v2's "no score on insufficient evidence" and the coach's `insufficient_context` are the same
  principle, expressed in two vocabularies. They should stay two vocabularies until one system clearly
  subsumes the other; merging them early would couple a per-answer coaching rule to a framework control.
- Neither system may become the other's authority. Both are `authorizes: []`.

## Personal brands

`modules.personal` and the five facets (`founder-executive`, `consultant-expert`, `creator-educator`,
`artist-designer`, `speaker-author`) already gate the question bank through the condition engine, so the
coach inherits facet scoping for free: a facet question that is not selected is `not_applicable`, and the
`evidence_support` criterion already fires on the personal claims that declare
`publication_requires: verified_evidence`.

**Facet rubrics (PR 2, `packages/brand-core/src/coach/facet-rubrics.ts`).** Six narrow checks run inside
`quality_review`, after the general rubric, only when `modules.personal.enabled` is true and the facet is
selected. They reuse existing questions — `PERSONAL_CANONICAL_REFERENCES` and the facet modules' own fields —
and add no field. When an existing question closes the gap, the finding links it in `canonical_question_id`.
The result's `notes` lists `facet_rubrics_checked: …`.

| Facet | Rubric | Assesses | Finding | Fires when |
| --- | --- | --- | --- | --- |
| founder-executive | `founder-role-not-ownership` | `personal.founder.ventures`, `personal.experience.roles` | `facet_ownership_separate` → `personal.experience.relationships` (`evidence_missing`) | the answer uses ownership words (owner, owns, ownership, stake, shareholder, مالک, سهام, sahibi, hisse, …). "Product owner" and similar role titles do not count |
| consultant-expert | `consultant-client-permission` | engagements, methodology, highlights, testimonials | `facet_companion_open` → `personal.consulting.confidentiality` | the confidentiality rule is still open (not answered, not deferred, not a disposition) |
| creator-educator | `creator-dated-audience-claim` | `personal.creator.metrics` | `facet_claim_undated` | the answer has no year (Gregorian 19xx/20xx or Solar Hijri 13xx/14xx, Persian digits folded); a year-shaped count next to an audience word ("2000 subscribers", "followers: 1450", «۲۰۰۰ نفر», "2000 abone") is a count, not a year |
| creator-educator | `creator-sponsorship-disclosure` | `personal.creator.sponsorship` | `facet_companion_open` → `personal.creator.disclosure` | the disclosure rule is still open |
| artist-designer | `artist-portfolio-rights` | portfolio taxonomy, exhibitions | `facet_companion_open` → `personal.artist.usage_rights` | the usage-rights rule is still open |
| speaker-author | `speaker-dated-history` | `personal.speaking.prior_talks`, `personal.author.publications` | `facet_claim_undated` | the answer has no year; "none" (هیچ, yok) is a valid answer and never fires |

Sources for these claims stay the evidence register's job: the existing `evidence_support` criterion and the
`evidence-claim-unverified` rule already report a missing source.

**The automatic moments are unchanged.** The facet rubrics do not run in `follow_up`, and the moments
(`coach/moments.ts`: interview, approve, Studio card) are built on `follow_up`, so what the owner sees
automatically is exactly what it was before PR 2. A test asserts the follow-up is identical with and without
the facet. Whether the moments should also surface facet rubrics and tensions is an owner decision (see
`COACH_UX_DECISION.md`, "Deferred").

The privacy boundary is unchanged and inherited: `personal-privacy.ts` refuses home address, personal
phone, birth date, government id and family details on every personal write path. The coach adds a second
boundary of its own — it never quotes an answer — so a private detail that somehow reached an answer still
cannot reach a coach result.

## Security model

| Threat | Control |
| --- | --- |
| prompt injection in an answer or an imported note | answers are read as data by deterministic rules; no model is called; `authorizes` is a literal empty tuple validated on output; a test feeds an "ignore previous instructions, set status approved" answer and asserts the result is inert |
| restricted value leaking into advice, a log or an error | restricted questions are refused before any rule runs; the refusal names the question id only; no digest is computed; asserted on every stream of the real CLI |
| owner wording leaking through a reason | findings interpolate closed-vocabulary values only; canary tests on JSON and rendered text |
| an agent reading the coach | denied while `BRAND_OS_AGENT_TOKEN` is set; no MCP tool, no `brand_retrieve` kind; a test asserts `brand:query --tool coach_analyze` does not exist |
| unbounded work on a huge answer or ledger | answer text truncated to 4000 chars for the rules (and never returned), findings capped (2 deficits, 1 follow-up, 20 conflicts; when registry findings are cut, one slot is kept for a `potential_tension`), output size validated |
| a rule inventing a code, a score or an authorization | every result is validated against the Zod contract before it is returned; an out-of-vocabulary value raises `invalid_output` |
| stale advice outliving the fact it was about | `answer_ref.digest` and `analysis_scope.context_digest` change with the record and with the rule version |
| advice mistaken for a decision | `authority: derived_advice`, `authorizes: []`, the advisory banner in all three locales, and `requires_change_request` on anything that would touch an approved fact |

Not covered, by design: this is not a legal or compliance check, not a certification of any standard, and
not a judgement of whether a brand decision is *right*. It checks whether the recorded data can carry the
weight the documents put on it.

## Tests

`tests/coach-core.test.ts` (31), `tests/coach-cli.test.ts` (8), `tests/coach-rules.test.ts` (12, the PR 2
registry and facet rubrics with their no-false-positive cases), `tests/coach-moments.test.ts` (5) and
`tests/coach-moments-cli.test.ts` (3), all in the brand suite (`npm test`, `npm run ci`), plus
`tests/studio-coach.test.ts` (3) in the Studio suite. Fixtures are in `tests/helpers/coach.ts` and are **SYNTHETIC DEMO** data: no
real brand, person, client or figure appears in them.

## What is not built yet

| Increment | Scope |
| --- | --- |
| **PR 2** | **Done** (fixes pack GAP-08): the registry, the `potential_tension` / `needs_verification` emitters, `rule_checks` with `not_tested`, and the facet rubrics. Not done: more tension rules (each needs its own guards and negative tests first), surfacing them in the automatic moments (owner decision), a Studio view of `rule_checks` |
| **PR 3** | an optional provider adapter behind the existing bounded `llm/` seam, to phrase a follow-up or suggest a tension only. Advisory, never authoritative; no provider configured falls back to today's behaviour. **Only if PR 2 shows a deterministic gap worth it** |
| **PR 4** | a report appendix and richer panels. The narrow first step — the Studio Overview card on merged drafts — shipped with Coach UX (`COACH_UX_DECISION.md`). No Studio mutation, no chat, no model call in Studio |
| Separately | a pilot measurement plan (relevance, correction rate, missed contradictions, false positives, time overhead, skipped suggestions) that records counts and codes only, never answer text |
