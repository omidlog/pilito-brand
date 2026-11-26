# Assurance: methodology registry and assessable controls (Trust v2 PR-A)

This is a pure library: `packages/brand-core/src/assurance/`, exported as `@brand-os/brand-core/assurance`. It defines which methods Brand OS may cite and at which claim level, one original assessable method with typed controls, and a deterministic evaluator that turns frozen inputs into an assessment.

- **It reads no brand file and writes nothing.** The pure library (`@brand-os/brand-core/assurance`) has no command, route, MCP tool, agent scope, approval or store. The owner-local bridge to a real workspace is a separate entry point, `@brand-os/brand-core/assurance/workspace`, used only by `brand:assurance` (see [Owner-local bridge to a real brand](#owner-local-bridge-to-a-real-brand-gap-09)).
- **It is not a certification, a compliance statement or an independent audit.** The only assessable method is our own rubric. No ISO text is reproduced anywhere.
- **It never takes a brand value.** Inputs are ids, revisions, states and classifications. Outputs are ids, revisions, statuses and reason codes.
- **Human text is en / fa / tr** (`assurance/i18n.ts`); the engine speaks stable English codes only.
- **The only demo data is synthetic** (`assurance/fixtures.ts`), `brand_id: synthetic-demo`, stamped `SYNTHETIC DEMO — NOT A REAL BRAND`.

## Reuse map

| Need | Reused | New |
| --- | --- | --- |
| Pinned source references and staleness | `strategy/model.ts` `FactRef`, `EvidenceRef`, `canonicalJson`, `sha256Hex`; `strategy/store.ts` `RefState` (`current` / `changed` / `missing`) | none: the v2 `PinnedRef` schema is not implemented |
| Audiences | `auth.ts` `Audience` (`public` / `internal` / `restricted`) | none |
| Question ids and sensitivity | the question bank (`content/index.ts` `allQuestions`) | none: controls name existing ids only, and a test fails if one disappears |
| Quotes and evidence text | Knowledge research notes | none: a control cites a note by id and revision; the engine never sees its text |
| Framework claim on visual pages | `visual/model.ts` `PermittedClaim`, `BMC_FRAMEWORK` | `bridge.ts`: a mapping and a check, no change to the visual layer |
| Claim ladder, registry, controls, evaluator | — | `claims.ts`, `registry.ts`, `controls.ts`, `assess.ts`, `report.ts` |

## Claim ladder

A method may be cited at the lowest of what it declares, what its rules access allows, what a person verified, and what an attestation supports. Nothing raises a level (`claims.ts` `effectiveClaim`).

| Level | Meaning | Reachable when |
| --- | --- | --- |
| `reference_only` | We named a source. | always |
| `informed_by` | The source shaped our own work. A statement about us, so no edition is printed. | rules access `reference_only` or better |
| `mapped_to` | Selected requirements were mapped, with a scope. | rules `authored` or `licensed`, checked |
| `internally_assessed` | We assessed against rules we authored or licensed. | rules `authored` or `licensed`, checked |
| `externally_reviewed` | A named independent reviewer examined a scope. | an attestation of kind `review`, checked |
| `certified` | An accredited body certified a scope and dates. | an attestation of kind `certificate`, checked |

Cap reasons: `no_attestation`, `edition_unverified`, `source_unverified`, `rules_access`. An entry with `edition: null` or `checked_at: null` is at most `informed_by`, and an unlicensed standard is `reference_only`. A certificate held by someone else can be cited at `certified` once checked, but never makes a standard we hold no rules for assessable (`assessable()`).

The v2 master brief lists `referenced_by` and `externally_assessed`; its own legal taxonomy (doc 09) and schemas use `reference_only` and `externally_reviewed`. This library uses the schema names.

The visual layer (`visual/model.ts`, merged in PR #25) has its own vocabulary, `PermittedClaim`. It is **not** changed here. `assurance/bridge.ts` maps it onto the ladder and `checkFrameworkClaim()` checks that a visual page never claims more than the registry allows:

| `PermittedClaim` | Ladder level |
| --- | --- |
| `informed_by` | `informed_by` |
| `aligned_with` | `mapped_to` |
| `verified_against` | `externally_reviewed` |
| `externally_certified` | `certified` |
| `original_professional_template` | `internally_assessed` |

The Business Model Canvas page claims `informed_by`, and the registry allows `informed_by`. Replacing `PermittedClaim` inside the visual layer is a separate owner decision.

## Methodology registry

`registry.ts`. Template data in code, not under `brand/`, so a brand repository cannot raise its own claim level by editing a file. No edition below was verified against the issuer while writing it, so none is written down.

| `method_id` | Issuer | Kind | Rules access | Declared | Effective today | Edition | Checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `brand-os.positioning-readiness` | Brand OS | `original_method` | `authored` | `internally_assessed` | `internally_assessed` | `1` | 2026-11-23 |
| `w3c.prov-o` | W3C | `web_standard` | `reference_only` | `informed_by` | `informed_by` | — | — |
| `w3c.wcag-2.2` | W3C | `web_standard` | `reference_only` | `informed_by` | `informed_by` | — | — |
| `owasp.asvs` | OWASP Foundation | `professional_framework` | `reference_only` | `informed_by` | `informed_by` | — | — |
| `iso.20671` | ISO | `formal_standard` | `unlicensed` | `reference_only` | `reference_only` | — | — |
| `iso.iec.25010` | ISO/IEC | `formal_standard` | `unlicensed` | `reference_only` | `reference_only` | — | — |
| `strategyzer.bmc` | Alexander Osterwalder / Strategyzer | `professional_framework` | `reference_only` | `informed_by` | `informed_by` | — | — |

Every entry blocks the use `certification`. ISO entries also block `compliance_claim`, `clause_reproduction`, `rule_database` and `llm_training`. To cite an edition or go beyond `informed_by`, a person opens the official source, records the edition, `checked_at` and `checked_by`, and the change is reviewed like code. Nothing in the registry is externally reviewed or certified.

## Control statuses

Ten statuses, not grades on one scale. Renderers show text and shape, never colour alone.

| Status | Meaning | Blocks the completeness ratio |
| --- | --- | --- |
| `applicable_complete` | Every required approved fact is current and the evidence requirement is met. | no |
| `applicable_partial` | Some, not all, required facts are approved and current. | no |
| `applicable_missing` | No required fact is usable, or there is no evidence at all. | no |
| `not_applicable` | The applicability rule excludes the control. Removed from the denominator. | no |
| `applicability_unknown` | Applicability depends on a subject field answered `unknown`. | **yes** |
| `evidence_insufficient` | Evidence exists but is not enough or not independent, or the inputs are withheld from this audience. | no |
| `conflicted` | A recorded contradiction touches the control. Reported, never averaged. | no |
| `needs_review` | A cited source changed, or a judgment control has no valid reviewer judgment. | **yes** |
| `blocked_by_license` | We hold no right to assess against the method. Neither passed nor failed. | **yes** |
| `not_assessed` | Nothing was resolved for the control. | **yes** |

## Evaluation order

`assess()` checks each control in this order and stops at the first match: licence → applicability → input present → audience (restricted inputs withheld: no sources, no next questions, reason `withheld_for_audience`) → changed source (`needs_review`, no reviewer override) → recorded conflict → reviewer judgment (role from a fixed list that excludes agents, written rationale required) → deterministic facts and evidence.

- **Completeness** is `scoreable` only when no control is `applicability_unknown`, `needs_review`, `blocked_by_license` or `not_assessed`. Otherwise `numerator` and `denominator` are `null`, so no renderer can print a ratio.
- **Evidence quality** is categorical (`independently_verified`, `mixed`, `owner_stated`, `insufficient_evidence`, `not_assessed`) with a coverage count, never a percentage.
- **Maturity** is per domain on an original 0–4 ordinal scale (the weakest observed signal) or `unknown` / `not_applicable` / `insufficient_evidence`. `maturity_aggregate` is always `null`.
- **Reproducibility.** The result pins the method edition, `evaluation_rule_version`, a rule digest (registry entry + controls), a source snapshot digest, the audience and the injected clock. The same input gives byte-identical canonical JSON regardless of input order. The gap report adds its renderer version (`brand-os.gap-report-md/1`).

## Coverage matrix: Positioning Readiness v1

Fifteen controls. Twelve apply to a selling company without paid media; paid media or a person brand changes which. Every question id below is a real id in the question bank (`tests/assurance-controls.test.ts`); this table is checked against the code by `tests/assurance-i18n.test.ts`.

| Control | Domain | Applicability rule | Required questions | Related questions | Evidence | Mode | Criticality | Privacy | Maturity signal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRR-01 | audience | `always` | `business.customer.primary_segment` | — | — | deterministic | critical | internal | no |
| PRR-02 | audience | `always` | `business.market.geography` | — | — | deterministic | important | internal | no |
| PRR-03 | audience | `always` | — | `business.customer.primary_segment` | ≥ 1 independent | deterministic | critical | internal | yes |
| PRR-04 | offer | `always` | `business.offer.value_proposition` | — | — | deterministic | critical | internal | no |
| PRR-05 | offer | `always` | `brand.strategy.differentiation` | — | — | deterministic | critical | internal | no |
| PRR-06 | offer | `always` | `brand.strategy.promise` | — | — | deterministic | important | internal | no |
| PRR-07 | offer | `sells_something` | `business.sales.pricing` | — | — | deterministic | important | internal | no |
| PRR-08 | proof | `always` | — | `brand.strategy.differentiation` | ≥ 1 independent | reviewer_judgment | critical | internal | yes |
| PRR-09 | proof | `always` | `brand.verbal.forbidden` | — | — | deterministic | important | internal | no |
| PRR-10 | proof | `always` | `business.marketing.availability_claim` | — | — | deterministic | critical | internal | no |
| PRR-11 | governance | `always` | `brand.strategy.decision_rule` | — | — | deterministic | important | internal | yes |
| PRR-12 | governance | `always` | `brand.strategy.purpose` | — | — | deterministic | supporting | internal | no |
| PRR-13 | measurement | `runs_paid_media` | `business.marketing.objective`, `business.marketing.attribution` | — | — | deterministic | important | internal | yes |
| PRR-14 | measurement | `runs_paid_media` | `business.marketing.budget` | — | — | deterministic | supporting | restricted | no |
| PRR-15 | audience | `person_brand` | `personal.positioning.known_for` | — | — | deterministic | critical | public | no |

PRR-14 exists so the absence of a budget envelope is visible. Its fact is restricted: the result is withheld below the `restricted` audience, and the value is never read by the engine.

## Synthetic fixtures

| Fixture | Subject | What it demonstrates |
| --- | --- | --- |
| `baseline` | selling company, no paid media, `internal` | 8 of 12 complete, 3 excluded; two `applicable_missing`, two `conflicted`; owner-stated evidence only |
| `unknown_scope` | paid media `unknown` | two `applicability_unknown`, completeness `not_scoreable` |
| `changed_source` | one cited fact changed | `needs_review`, completeness `not_scoreable` |
| `restricted` | paid media `yes`, `internal` | PRR-14 withheld (`evidence_insufficient`, `withheld_for_audience`, no sources) |

## Tests

| File | Covers |
| --- | --- |
| `tests/assurance-registry.test.ts` | registry invariants, the ladder never rises, ISO stays a reference, attestations by kind, assessability, the bridge to the visual layer |
| `tests/assurance-controls.test.ts` | control invariants, real question ids, privacy classification ≥ question sensitivity, applicability with `unknown` |
| `tests/assurance-assess.test.ts` | fixture results, determinism and order independence, changed-source invalidation, withheld inputs, a privacy canary, reviewer rules, distinct findings, licence block |
| `tests/assurance-i18n.test.ts` | every emitted code has en/fa/tr text, the gap report in three languages, the demo banner, no ratio when not scoreable, this coverage matrix matches the code |

## Not built here

Evidence lineage over a real workspace (PR-B), any Studio view (PR-D), decision records (PR-E), PDF reports and manifests (PR-F), verification and expert review (PR-G), journeys, connectors and roles (PR-H). The plan and the reasons are in the owner's notes, `trust-v2-audit.md`.

## Owner-local bridge to a real brand (GAP-09)

`packages/brand-core/src/assurance/workspace.ts` (+ `workspace-text.ts`, exported from `assurance/local.ts` as `@brand-os/brand-core/assurance/workspace`) and the command `npm run brand:assurance`. It builds the frozen input `assess()` needs from what the brand has **already approved**, and hands it to the existing evaluator unchanged. Nothing about the evaluation is redone.

```
npm run brand:assurance -- snapshot --as-of 2026-11-23 [--audience internal] [--lang fa] [--json]
npm run brand:assurance -- assess   --as-of 2026-11-23 [--lang tr]
npm run brand:assurance -- snapshot --as-of 2026-11-23 --json > ~/kept/snapshot.json
npm run brand:assurance -- verify   --snapshot ~/kept/snapshot.json      # exit 0 same digest, 3 changed
```

### What it reads, and how

| Input to `assess()` | Source (reused) | Rule |
| --- | --- | --- |
| `ResolvedFact` per required question | `facts.ts` `readFacts(…, 'approved')`, pinned by `revision_hash` | Only `status: approved` of this brand counts. A non-approved answer is `draft` / `unknown` / `not_applicable` from the answer ledger, pinned by answer id; never treated as approved. No answer: `absent`, `missing`. |
| `ResolvedEvidence` | Knowledge Inbox `scanAll(['local','shared'])` | Research notes only (`kind: research`, `internal`, not archived, this brand) whose `question_ids` touch the control. Restricted notes are never decrypted. A note is `owner_stated` unless the owner linked it to a qualifying evidence-register entry (see [Evidence links](#research-notes-linked-to-the-evidence-register-gap-09-follow-up)); then `independent`, but only for a control that names the entry's claim question (an entry verifies one question; for the note's other questions it stays `owner_stated`). |
| `conflicts` | `contradictions.ts` `findContradictions` (pure) | Open contradictions whose fields touch the control, by id only. |
| `review` | owner judgments, `assurance/reviews.ts` (see [Owner review judgments](#owner-review-judgments-gap-09-follow-up)) | The judgment in force on the `--as-of` day, only while its basis is unchanged; otherwise `null` and the control is `needs_review`. |
| `subject.entity_kind` | `brand.profile` | `person` only for the `personal-brand` profile, else `company`. The personal module never changes it (see below). |
| `subject.sells` | approved `business.sales.motion` | `not-applicable` → `no`; `undecided` or unapproved → `unknown`; any other option → `yes`. |
| `subject.stage` | approved `business.stage.current`, else `business.identity.new_or_existing` | Otherwise `unknown`. |
| `subject.runs_paid_media` | approved `business.marketing.paid_media` | The interview question (`undecided` / `yes` / `no`, internal). `yes` / `no` approved → that value (`approved_fact`); `undecided`, a draft or no answer → `unknown`, and the blocking item points at the question. An approved `undecided` is the interview answer too: `unknown` with source `approved_fact`. Deprecated: `--paid-media yes\|no` still works, but only while the question has no approved answer at all (`owner_flag`, a notice on stderr). Any approved answer wins over the flag, `undecided` included (owner decision, 2026-11-24): the flag is ignored, the digest is the same as without it, and stderr says the interview answer is used (en/fa/tr). Bridge version `brand-os.assurance-bridge/4` for this mapping; a snapshot kept with the flag on a brand whose answer is now an approved `undecided` verifies as changed. |

### Company or person (owner decision, 2026-11-23)

A company brand stays a company. `modules.personal.enabled: true` on a `universal` (or any non-`personal-brand`) profile means the founder's own personal brand is tracked in the same repository. The snapshot records it separately as `personal_brand: { enabled, facets, brand_entity_kind, changes_subject: false }`. It is not part of `subject` and not part of the digest, so turning the module on or off never changes a company brand's assessment, and the person-only control (PRR-15) stays not applicable. Only `brand.profile: personal-brand`, where the brand itself is the person, gives `entity_kind: person`. The bridge version is `brand-os.assurance-bridge/2` for this mapping.

### Guarantees

- **Owner-local.** Refused while `BRAND_OS_AGENT_TOKEN` is set, before anything is read. No MCP tool, `brand_retrieve` kind, Studio route or agent profile imports the bridge; a test reads `scripts/mcp.ts` and `apps/studio` to keep it that way.
- **Writes nothing.** (`snapshot`, `assess`, `verify`.) Output goes to stdout. There is no `--out`; the owner redirects it where they want. A kept snapshot file is read as bounded data (regular file, no symlink, ≤ 1 MiB, ids validated), and its other contents are ignored and never echoed.
- **No values.** The snapshot holds ids, revisions, states and closed-vocabulary subject values. Below the `restricted` audience a restricted fact is not pinned at all (`revision: withheld`), and its control lists no open question.
- **Reproducible.** `source_snapshot_digest` is `sourceSnapshotDigest()` of the built input. Same workspace state, same `--as-of` (a UTC day; default today), same audience and statement → byte-identical snapshot and digest. `verify` rebuilds a kept snapshot with its own options; `reproduced: false` names the cited facts and notes that changed or disappeared. When nothing cited changed but something was added (an answer approved since, a new research note, or an owner judgment dated on or before the snapshot's day), the list is empty and the text says so in en / fa / tr (or that the kept file itself was edited).
- **Versioned pins.** `--pin <kept snapshot>` re-checks the kept revisions (`strategy/store.ts` `factState` / `evidenceState`). A changed fact makes its control `needs_review`; a vanished note is `missing`, not silently dropped. A snapshot kept for another brand or method is refused (`invalid_pin`).
- **No score on an incomplete snapshot.** `missing[]` lists every item; `blocking: true` items (an unstated scope field, a judgment nobody has made, a changed source) are exactly what makes `assess()` return `not_scoreable`, with `numerator` / `denominator` null. Tests assert `snapshot.scoreable` always equals the evaluator's verdict. `blocking: false` items are unapproved facts and missing research notes: the evaluator counts them as not complete; the bridge never fills them in.
- **Never a certification.** `claim_level` stays `internally_assessed`, the `internal_assessment_only` limitation is always present, the snapshot carries `disclaimer: internal_assessment_not_certification`, and every rendering prints the disclaimer in en / fa / tr. `authorizes` is always `[]`.

Until the follow-up below, a real brand never got a ratio: PRR-08 needs a person's judgment and there was no place to record one.

Fixed with it: `completenessOf` reported every `needs_review` blocker as `source_changed`; a blocker now carries its own reason (`reviewer_required`, `source_changed`, …). Synthetic fixture results are unchanged.

| Test | Covers |
| --- | --- |
| `tests/assurance-workspace.test.ts` | pinning approved facts, drafts and `unknown` never approved, subject derivation, reproducibility, value canaries in JSON and en/fa/tr text, restricted withholding, research-note selection, changed and vanished pins, conflict before judgment, no certification, agent refusal, no agent surface, read-only, hostile snapshot files, en/fa/tr text |
| `tests/assurance-cli.test.ts` | the real command: usage errors, three languages, byte-identical runs, verify exit codes, agent refusal, symlinked or malformed files, outside a brand, not reachable through `brand:query`, the deprecated `--paid-media` notice on stderr, and the "interview answer is used" notice when the approved answer is `undecided` (en/fa/tr) |
| `tests/assurance-followups.test.ts` | the paid-media question in en/fa/tr and in the committed bank, approved answer as the source, draft or `undecided` stays `unknown`, the deprecated flag never overrides an answer (an approved `undecided` included), old snapshots still verify, a company with the personal module stays a company (same digest on or off, PRR-15 not applicable), only `personal-brand` is a person, new en/fa/tr text |

All fixtures are synthetic temp brands.

## Owner review judgments (GAP-09 follow-up)

Owner decision (2026-11-23): a small owner-only flow to record the human judgments the engine will not make, so a real brand's readiness score can be produced. `packages/brand-core/src/assurance/reviews.ts` (store), `workspace.ts` (`listReviewItems`, `recordReview`, and the bridge reading them) and `npm run brand:assurance-review`.

```
npm run brand:assurance-review -- list   [--as-of 2026-11-23] [--show-notes] [--lang fa] [--json]
npm run brand:assurance-review -- record --control PRR-08 --judgment yes|partly|no --note "short reason" [--date 2026-11-23] [--expect <revision>|none]
npm run brand:assurance -- assess --as-of 2026-11-23      # now gives a ratio when nothing else blocks (paid media from business.marketing.paid_media)
```

**CLI, not Studio.** The fixes pack keeps Studio read-only (`03-ARCHITECTURE-AND-PERMISSIONS.md`, "UI / ownership boundary"; `docs-internal/STUDIO.md`). Studio's only writes are creating a private repository and opening a template-update pull request. A write route there would be a new authenticated write surface. The owner's local CLI has the same access rule as every other owner-only store: it is refused while `BRAND_OS_AGENT_TOKEN` is set. A Studio page can be added later as a separate, security-reviewed change.

| Rule | How |
| --- | --- |
| Which items | Controls of the method with `evaluation_mode: reviewer_judgment` (today PRR-08). Each has a plain question in en / fa / tr (`REVIEW_PROMPT`). `list` shows its state (`needs_judgment`, `judged`, `stale`), the judgment in force, the facts and research notes a judgment made now would be about (ids only) and any open contradiction. |
| Judgment | `yes` → `applicable_complete`, `partly` → `applicable_partial`, `no` → `evidence_insufficient`, the engine's own reviewable statuses. The judgment replaces the control's evidence minimum (the engine's step 7 comes before step 8): `yes` gives `applicable_complete` even when no research note is cited; the `evidence` gap stays listed and evidence quality stays `insufficient_evidence` / `owner_stated`. Role is always `owner`; `agent` is not a reviewer role. A short note (1–500 characters, single line) is required; a note that looks like a credential (Knowledge `credentialFindings`) is refused. The date defaults to today, may not be in the future, and may not be earlier than the previous revision. |
| Storage | `brand/.private/assurance/reviews/<control_id>.json` in the brand workspace (gitignored; excluded from Studio, docs builds, the projection and every agent tool), mode 0600, atomic write, Knowledge lock per control. Append-only revisions: each `revision` is a hash of its content and of the revision it `supersedes`, so an edited, reordered or foreign history is refused (`invalid_record`, `wrong_brand`, `unsafe_path`) and never used or repaired. `--expect` refuses a write if someone recorded since. |
| Basis | Each revision records what it judged: the control's required and related facts by approved revision (`none` if not approved) and the research notes it cites, by revision. When any of them changes, the judgment is `stale`: the bridge passes `review: null` and lists `stale_judgment` (blocking). The owner judges again. |
| Reproducible | The bridge uses the latest revision whose `reviewed_on` is on or before the `--as-of` day. Dates only go forward, so a snapshot as of an earlier day, and `verify` of it, are unchanged by later judgments. A judgment dated the snapshot's own day does change it. `reviewed_on` and the default `--as-of` are UTC days, so east of UTC the local date can be a day ahead and is refused as future until UTC midnight. `reviewer_id` is `owner:<revision>`, so a new judgment changes the digest. |
| Private note | The snapshot's `rationale` is a reference, `assurance-review:<control>@<revision>`; the note text stays in the private file. It is never in a snapshot, report, `--json` record output or log, and `list` shows it only with `--show-notes`. |
| Not changed | Unconfirmed answers still lower the ratio and are not removed. Research notes count as `owner_stated` unless linked to the evidence register (next section). Claim level stays `internally_assessed`; a judgment is not a certification, and `authorizes` stays `[]`. |

| Test | Covers |
| --- | --- |
| `tests/assurance-reviews.test.ts` | score produced after `yes`, status mapping, latest revision wins, stale after a new note or a changed fact, reproducibility as of an earlier day, private 0600 versioned file with chained revisions, only private files written, note never leaves the file, tampered / foreign / symlinked / non-JSON history refused, bad input refused with nothing written, agent token refused for every read and write, no MCP or Studio import, agent role refused, en / fa / tr text |
| `tests/assurance-audit.test.ts` | trust audit fixes: a credential-like note refused with nothing written, `--pin` from another brand or method refused, verify explains a digest change with no changed source in en / fa / tr, Persian text uses «واقعیت» and the Persian comma |
| `tests/assurance-review-cli.test.ts` | the real command: help in three languages, usage errors, list → record → `brand:assurance assess` scoreable, note not echoed, `--show-notes`, `--expect`, not-a-judgment control, agent refusal with nothing written or echoed, tampered history makes `brand:assurance` refuse |

## Research notes linked to the evidence register (GAP-09 follow-up)

A research note is the owner's own writing, so the bridge counted every note as `owner_stated`, and a control that needs independent evidence (PRR-03, PRR-08) could never be met by notes. The evidence register (`evidence.ts`, `brand/interview/evidence-register.yaml`, guide `PERSONAL_BRAND.md` "Evidence and rights") already records sources and lets only the owner, with the approval proof, mark one `verified`. This change lets the owner link a note to a register entry. It reuses the register and its rules; nothing about verification is redone. `packages/brand-core/src/assurance/links.ts` (store), `workspace.ts` (`listEvidenceLinks`, `linkEvidence`, `unlinkEvidence`, and the bridge reading them) and `npm run brand:assurance-link`.

```
npm run brand:evidence -- add --claim business.customer.primary_segment --source third_party --reference "Survey report, held offline"
npm run brand:evidence -- verify --id ev-0001                    # owner proof, as before
npm run brand:assurance-link -- list [--as-of 2026-11-24] [--lang fa] [--json]
npm run brand:assurance-link -- link --note kn_… --evidence ev-0001 [--date 2026-11-24] [--expect <revision>|none]
npm run brand:assurance-link -- unlink --note kn_…
npm run brand:assurance -- assess --as-of 2026-11-24             # the note now counts as independent
```

| Rule | How |
| --- | --- |
| What can be linked | An internal, non-archived research note of this brand (restricted notes are never read), to a register entry of kind `verification`, not `owner_testimony` and not owner-controlled (`owned`, explicit or inferred from the brand's own domains; `PERSONAL_BRAND.md`), whose `claim_id` is one of the note's `question_ids`, and not `withdrawn` or `rejected`. A `pending` entry may be linked; it counts once verified. Anything else is refused (`not_linkable`) and nothing is written. `link` prints the link's state as of today, also when `--date` backdates it. |
| When it counts (`qualifies`) | On the `--as-of` day: the link in force (latest revision with `linked_on` on or before the day, and a `link`, not an `unlink`) names the note's current revision, and the entry is `verified`, verified on or before the day and not past `review_due` (`isCurrent`). Otherwise the state says why: `note_changed`, `entry_missing`, `not_independent`, `claim_mismatch`, `not_verified`, `expired`, `withdrawn`, `rejected`, and the note stays `owner_stated`. |
| Effect | Only `ResolvedEvidence.independence` changes, so the digest changes with it. The snapshot lists `evidence_links: [{ note_id, evidence_id, link_revision, state }]` (not part of the digest). A control that needs independent evidence and has only owner-stated notes lists a non-blocking `independent_evidence` gap. A qualifying link changes PRR-08's judgment basis (`<note revision>+<evidence id>`), so an earlier judgment goes stale and the owner judges again; judgments with no qualifying link are unchanged. |
| Storage | `brand/.private/assurance/evidence-links/<note_id>.json` in the brand workspace (gitignored), mode 0600, atomic write, Knowledge lock per note. Append-only revisions (`link` / `unlink`), each a hash of its content and of the revision it `supersedes`; an edited, reordered, foreign or non-owner history is refused (`invalid_record`, `wrong_brand`) and the bridge then builds nothing (`invalid_link`). Ids, revisions and dates only: no note text, no register reference. |
| Reproducible | A link's date cannot go back before the note's previous link revision or past today, so a snapshot as of an earlier day ignores links dated later. A note's first link can be backdated, and verifying an entry again moves its `verified_at`; both change snapshots as of earlier days, and `verify` names them. `verify` names a link that was added, removed or changed state (`evidence_link`). Snapshots kept before bridge version 3 have no `evidence_links` and still verify. |
| Owner only | Every read and write refuses while `BRAND_OS_AGENT_TOKEN` is set. No MCP tool, Studio route or agent profile reaches it. Agents may still record register evidence with `brand:evidence add` (it starts `pending`); only the owner verifies it and links it. |
| Not changed | Unapproved answers still lower the ratio and are not removed (owner decision). No score while anything blocking is missing. Claim level stays `internally_assessed`; a link is not a certification and `authorizes` stays `[]`. |

| Test | Covers |
| --- | --- |
| `tests/assurance-links.test.ts` | independent only after verification, unapproved answers still lower the score, no score while blocked, note changed / withdrawn / rejected / expired stop counting, unlink history, what may be linked (testimony, permission, other question, withdrawn, rejected, idea and restricted notes refused, nothing written), reproducibility and verify, PRR-08 judgment goes stale, private chained storage and tampering, agent refusal and no agent surface, no note or register text in any output, en / fa / tr text |
| `tests/assurance-link-cli.test.ts` | the real command: help in three languages, usage errors, agent refusal with nothing written, list → link → `brand:assurance assess` independent, unlink, refusal as JSON, no text echoed |

