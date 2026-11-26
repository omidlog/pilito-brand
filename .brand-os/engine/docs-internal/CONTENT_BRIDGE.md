# Content Bridge: approved voice and strategy for content agents

The Content Bridge gives every content or publishing agent (Instagram, X, LinkedIn, a newsletter writer, a Creative
Director) one source for the brand: its approved voice, audience, messaging, pillars, offers and approved strategy. It is
built in four slices, one PR each:

| Slice | What | State |
| --- | --- | --- |
| A | `content` strategy type, `brand:content strategy` proposer, voice rules projection | done |
| B | Calendar planner and per-week owner approval, read-only Studio page | done |
| C | `content_calendar` / `content_brief` / `content_report` agent tools through the existing gates | done |
| D | `content-planner` skill, integration guide for external bots, CLI journey demo | done |

Brand OS plans and governs. It never posts, schedules or publishes, and approving a content strategy authorizes nothing
(`authorizes: []`).

## Preflight reuse map (against main `9861920`)

Every structure below names what it reuses and why it is not a parallel source of truth.

| Existing module | Reused for | New small type | Why it is not a second truth | Tests |
| --- | --- | --- | --- | --- |
| `facts.ts` `readFacts` (approved, `revision_hash`, `classification`) | Voice, audience, messaging, pillars, channels, offers, CTA, claims and language facts. The proposer reads them; the projection resolves their approved value at read time. | none | Fact values stay in `approved-facts.yaml`. A strategy stores fact ids pinned to `revision_hash`, never a copy of the voice. A changed fact turns the strategy `needs_review`. Restricted facts are refused. | `content-strategy` |
| `content/*-modules.ts` question bank | The fixed source catalog (which fact ids feed which role). | `CONTENT_SOURCES` (ids only) | It names existing question ids; no question is added or copied. | `content-strategy` |
| `structured.ts` `parseStructured('voice_pairs')` | Do/don't pairs in the projection. | none | Parsed from the approved fact on every read. | `content-strategy` |
| `strategy/` `StrategyRecord` / `StrategyRevision`, `proposeRevision`, `reviewRevision`, `approveRevision`, `evaluate` (Sprint 3) | The content strategy **is** a strategy record of a new type, `content`, with one optional typed block, `content_strategy`. | `ContentStrategyBlock` | Same store (`brand/.private/strategy/records/`), same immutable revisions, same hash-bound owner approval with HMAC seal, same `needs_review` / `expired` / `integrity_failed` checks, same `brand:strategy review/approve/reject/withdraw`. No new store and no new approval path. | `content-strategy`, existing `strategy-*` |
| Strategy Feed (`feed.ts`) | Untouched for agents in Slice A: no profile reads `content`, so every agent gets nothing. Slice C adds a profile and tools through the same `strategyAccess` / access-log pattern. | none | Same gate; the projection reuses the feed's `servable` rule (only `current` / `review_due`). | existing `strategy-feed` |
| Approved SEO / paid-media strategies | A content strategy may pin them (`strategy_refs: {strategy_id, revision, content_sha256}`). | `StrategyRef` | Pins, like fact refs. If the cited strategy is replaced or stops being served, the content strategy turns `needs_review`. | `content-strategy` |
| Knowledge Inbox (`kn_…@sha256`) | `evidence_refs` of the strategy, unchanged. | none | Notes are never copied. | existing |
| `documents/marketing-plan.ts` | Same fact selection for messaging, channels and guardrails. | none | The marketing plan is a rendered document; the content strategy is the approved, pinned decision layer that cites the same facts. | — |
| `competitive/` `buildCompetitiveMemo(ws, 'marketing')` (Identity Slice C) | Not used in Slice A. Slice B/C cite its observation ids for the per-slot "competitive angle". | none | Quotes stay in Knowledge research notes; the memo is a projection. | Slice B/C |
| `creative/` approved scoped preferences, `creativeContext` | Not used in Slice A. Slice C adds applicable approved preferences to a content brief by id. | none | Preferences stay in Creative Learning. | Slice C |
| `auth.ts`, `agent-tokens.ts`, `access-log.ts`, stdio MCP, `brand:query` | Not used in Slice A (owner-only CLI). Slice C reuses them. | none | — | Slice C |
| `identity/i18n.ts` pattern | en/fa/tr catalogs for generated proposal text, gap messages and projection labels. | `content-bridge/i18n.ts` | Text catalog only. | `content-strategy` |
| Template sync / migrations | Nothing to migrate: the new type and block are optional; old revisions hash the same (an absent key is not hashed). `brand/**` stays brand-owned. | none | — | existing `template-sync`, `strategy-store` |

Not reused, on purpose: `business.marketing.budget` and other `restricted` facts. They are never cited by a content
strategy and never projected.

## Layers (one truth per layer)

1. **Approved facts** hold the voice, audience, messaging, pillars, channels and claims.
2. **Content strategy** (Slice A) holds the decisions facts do not: which pillars, the role, formats and cadence of each
   channel, content languages, owner-written extra rules, and explicit gaps. It cites facts; it does not restate them.
3. **Content calendar** (Slice B) pins the approved content strategy revision and the facts its slots cite.
4. **Content brief** (Slice C) is a read-only projection of 1–3 for one slot.
5. **Reports** (Slice C) are produced / published observations next to the calendar. They never change 1–4.

## Slice A: the content strategy record

### Data model

A content strategy is a `StrategyRevision` with `type: "content"` and a `content_strategy` block
(`packages/brand-core/src/strategy/model.ts`, `parseContentStrategy`):

| Field | Meaning |
| --- | --- |
| `languages` | Content languages (locale codes). Default: the brand default locale. |
| `pillars[]` | `{id, name, fact_refs}`. Each pillar must cite at least one approved fact. |
| `channels[]` | `{channel, role, formats, cadence, languages, pillars, fact_refs}`. `role` and `cadence` are `null` until the owner decides; `formats` from `reel, carousel, post, thread, story, article, email, short_video, video, live`. Optional, absent when not set: `objective`, `audience`, `mix`, `kpis`, `posting_windows`, `rules` (see "Channel playbook, batch and deliverables"). |
| `sources` | Approved fact ids per role: `voice, claims, audience, messaging, pillars, channels, offers, cta, languages, objective`. Values are never copied. |
| `voice_rules`, `vocabulary`, `banned_claims`, `cta_rules` | Owner-written additions. The proposer leaves them empty. |
| `strategy_refs[]` | Pinned approved SEO / paid-media revisions `{strategy_id, revision, content_sha256}`. |
| `gaps[]` | `{field, reason, fact_ids}`, reason `not_approved`, `placeholder` or `owner_decision`. Kept in the approved revision. |

Rules enforced on `propose`:
- Every fact id in the block must be in the revision's `fact_refs` (pinned to `revision_hash`).
- Restricted facts are refused (`business.marketing.budget` and anything classified `restricted`).
- A cited strategy must be the revision served now; only SEO and paid-media strategies can be cited.
- Unknown keys are refused at every level; text goes through the same safety check as every strategy (no money, credentials, personal data or placeholders).

Status at read time is the Sprint 3 evaluation plus one check: a cited strategy that is replaced or no longer served
makes the content strategy `needs_review`, like a changed fact.

### Proposer (`brand:content strategy`)

`buildContentStrategy` (`packages/brand-core/src/content-bridge/propose.ts`) reads the fixed source catalog
(`sources.ts`, `CONTENT_SOURCES`; personal-brand facts only when `modules.personal.enabled`):

- A role with no approved fact is a `not_approved` gap naming the questions to answer. A fact whose approved value says
  `TBD`, `none`, `unknown`, `نامشخص` or `henüz yok` is a `placeholder` gap. Nothing is assumed in its place.
- Pillar names are split from the approved pillars fact (lines, `;`, bullets, short comma lists) and cite it. If it
  cannot be split into short names, the owner names them (`owner_decision`).
- Channels: `--channels` if given; otherwise channels named in affirmative clauses of approved channel facts. A clause
  with a negation ("not TikTok", "no paid social", "YouTube later", "بدون", "değil") is skipped. A note says which
  channels were detected.
- Every channel gets `owner_decision` gaps for role, and for formats and cadence unless `--formats` / `--cadence` give
  them. Cadence is never guessed.
- Currently served SEO and paid-media strategies are pinned.
- The generated title, objective, rationale, guardrails and non-goals are fixed process text in en/fa/tr. They say
  how the strategy works, never how the brand sounds.

It writes nothing. `--out` writes the proposal file (never overwrites), `--store` stores it as a draft through
`proposeRevision`.

### Voice rules projection (`brand:content show`)

`contentStrategyView` (`projection.ts`) returns `brand-os/content-strategy-view/v1` for every content strategy whose
approved revision is servable now (the Strategy Feed's `servable` rule: `current` or `review_due`):

- `voice.sources`, `audience`, `messaging`, `offers`, `objective`, `language_sources`: the approved fact values, read now.
  A served strategy has every cited fact at its pinned revision, so this is exactly what the owner approved.
- `voice.do` / `voice.dont`: from `brand.verbal.voice_pairs` plus owner-written rules, each with its source.
- `claims.banned`: split from `brand.verbal.forbidden` plus owner-written claims; `claims.availability_rule` from
  `business.marketing.availability_claim` (en/fa/tr).
- `gaps` with en/fa/tr text, `digests.view_sha256` (deterministic), `authorizes: []`, `publication_permission: false`.
- Drafts, rejected, superseded, withdrawn and stale revisions are only counted under `withheld`.

It is owner-only in Slice A (refused under `BRAND_OS_AGENT_TOKEN`). Slice C exposes it to content agents through the
existing token profiles, MCP tools and access log.

### Owner workflow

```bash
npm run brand:content -- strategy                          # gap report, nothing written
npm run brand:content -- strategy --channels instagram,linkedin \
  --cadence instagram=3/week --formats instagram=reel+carousel --out content.json
# edit content.json: channel roles, extra rules, pillar names
npm run brand:strategy -- propose --id content-main --file content.json
npm run brand:strategy -- review  --id content-main --revision 1
BRAND_OS_APPROVAL_PROOF=… npm run brand:strategy -- approve --id content-main --revision 1 --expect-sha <sha256>
npm run brand:content -- show [--lang fa|tr]
```

### Tests

| Behaviour | Test |
| --- | --- |
| Missing facts become explicit gaps (en/fa/tr); nothing written; no voice invented | `content-strategy` "missing facts…" |
| Placeholder facts are gaps; restricted facts never cited; budget canary absent | `content-strategy` "placeholder facts…" |
| Pillars from the fact, negated channels skipped, voice cited not copied | `content-strategy` "approved facts become cited sources…" |
| Approved v1 visible, draft v2 invisible until approved, then v2 served; changed fact → `needs_review` | `content-strategy` "approved v1 is visible…" |
| No agent profile reads `content`; block only on `content`; old hashes unchanged | `content-strategy` "no agent reads…" |
| Pinned SEO strategy replaced → `needs_review`; stale pin refused | `content-strategy` "a cited SEO strategy…" |
| CLI journey with proof-gated approval through `brand:strategy` | `content-cli` |

### Limits (Slice A)

- No calendar, no per-slot brief and no agent read path yet (Slices B and C).
- Channel detection reads wording; the owner checks the detected list before approving.
- Approved fact text is shown as written; the projection does not translate it. Gap and rule text is en/fa/tr.

## Slice B preflight reuse map (against main `06ac484`)

Written before any Slice B code. The calendar adds one small store (per-week records), because no existing store
holds dated slots. Everything else is reused.

| Existing module | Reused for | New small type | Why it is not a second truth |
| --- | --- | --- | --- |
| `content-bridge/projection.ts` `contentStrategyView` (Slice A) | The planner's only input: the served content strategy (pillars, channels, cadence, formats, languages, source fact ids, banned claims, availability rule). | none | The planner never reads facts or drafts on its own. It pins the served revision (`strategy_id`, `revision`, `content_sha256`). |
| `strategy/feed.ts` `servable`, `strategy/store.ts` `factState`, `evidenceState`, `assertOwnerProcess` | Week status at read time: the pinned strategy must still be the one served, every cited fact at its `revision_hash`, every research ref at its revision. | none | Same rules as strategies: a change makes the week `needs_review`, never silently re-pointed. |
| `strategy/model.ts` `canonicalJson`, `sha256Hex`, `approvalSeal`, `newApprovalEventId`, `RevisionEntry`, `StrategyApproval`; `store.ts` `requireProof` | Week revisions are immutable and hashed; approval is owner proof + `--expect-sha` + HMAC seal keyed by the same approval secret. | `ContentWeekRecord`, `ContentWeekRevision` (same entry and approval shapes) | No new approval scheme. The seal gets its own domain string so a week approval can never verify as a strategy approval. |
| Knowledge `withLock`, `writeVaultFile`, `safeRead`, `dirUsable`, `ensureDir` | Atomic 0600 writes under `brand/.private/content/calendar/<week_id>/` and a per-week lock. | none | Same private, git-ignored area as strategies; never in Studio, docs builds or exports. |
| `competitive/memos.ts` `buildCompetitiveMemo(ws, 'marketing')` (Identity Slice C) | Optional research angles (`--research`): observation id, its `knowledge:kn_…@sha256` ref and a confidence label from the cell state. | `SlotResearch` | Quotes stay in Knowledge research notes; a slot cites the observation, never its text. |
| `creative/share.ts` (`brand:creative share`, `buildStudioCreative`) | Studio pattern: the owner explicitly shares a derived summary of an approved week to a tracked file; Studio reads only that file from the merged commit, strictly validated. | `SharedContentWeek` | The shared file is a derived copy with ids and dates, labelled as of `shared_at`; the private week record stays the truth. |
| `apps/studio` tar allowlist, projection, sync, brand sections, views, i18n | Read-only "Content calendar" page. | `StudioCalendarProjection` | No new non-GET route. |
| `content-bridge/i18n.ts` | en/fa/tr for gaps, CLI lines, notices and conflict messages. | more catalog keys | Text only. |
| Template sync / migrations | Nothing to migrate: new folders only, `brand/**` stays brand-owned. | none | — |

Not reused, on purpose: `brand:strategy` records for weeks. A week is not a strategy (no agent profile, validity
window or recommendations), and putting weeks in the strategy store would make them visible to the Strategy Feed scan.

## Slice B: the content calendar

### Data model

A week (`wk-YYYY-MM-DD`, Monday to Sunday) is a small record with immutable, hashed revisions under
`brand/.private/content/calendar/<week_id>/` (`packages/brand-core/src/content-bridge/calendar-model.ts`). A revision
pins the content strategy it was planned from (`strategy_id`, `revision`, `content_sha256`) and the `revision_hash` of
every fact a slot cites. A slot holds `date, channel, format, pillar, language, objective, key_message, offer, cta,
hook, angle, notes, research, status (idea | planned | skipped), fact_refs`. Fact text is never copied.
`produced` / `published` are Slice C (agent observations).

### Planner (`brand:content plan`)

- Its only input is the served content strategy view; drafts are never planned from.
- Deterministic and offline. Rotation of formats, pillars, languages and key messages is indexed by date.
- Cadence `n/week` or `n/month` is respected; a `null` cadence gives no slots and a `cadence_not_decided` gap. A
  requested channel not in the strategy is a `channel_not_in_strategy` gap. A slot that would cite nothing is dropped
  (`no_source` gap): every slot cites at least one approved fact.
- The planner writes no hook or angle, so it cannot write a banned claim. Owner-written slot text is checked against
  the banned claims and the availability rule (`claims.ts`) on `week propose` and again on `week approve`.
- `--research` adds an optional angle per slot from `buildCompetitiveMemo(ws, 'marketing')`: the observation id, its
  Knowledge ref and a confidence label (high / medium / low). Never its quote.

### Approval and status

`week review` shows the revision and its hash; `week approve --expect-sha` needs the owner proof and seals the
approval with the approval secret under its own domain (`brand-os/content-week-approval/v1`), so a week approval can
never verify as a strategy approval. `calendar` shows approved, current weeks only. A newer strategy revision, a
changed cited fact or research note puts an approved week in `needs_review`; a tampered revision or seal makes it
`integrity_failed`. Neither is served.

### Studio

`brand:content share --week wk-… [--dry-run]` writes a derived summary of one approved, current week to
`brand/content-calendar/shared/wk-YYYY-MM-DD.json` (ids, dates, pillar names, hook and angle, observation ids; no fact
values, notes or quotes). The owner commits and merges it. Studio's read-only "Content calendar" page shows only those
files from the merged commit (`buildStudioCalendar`); malformed, other-brand, misnamed, symlinked or secret-looking
files are withheld with a reason. No approve button, no write route.

`npm run brand:share` (`brand:content -- share --all`) shares everything approved in one step: each served content strategy, each current week and the style kit summary (`brand/social/shared/approvals.json`). Commit and push what it writes.

`brand:content share-strategy [--id content-main] [--dry-run]` does the same for the content strategy: it writes the
approved revision the Strategy Feed serves now (`current` or `review_due`) to
`brand/content-strategy/shared/<id>.json` (`shareStrategy`, `content-bridge/strategy-share.ts`). The file holds the
revision number, its `content_sha256` (which revision this is), `approved_at`, the status at share time, validity,
languages, pillars (id, name, cited fact ids), every channel's role, objective, audience, formats, cadence, languages,
pillars, cited fact ids, mix, KPI targets, posting windows and rules, and the open gaps. Never a draft revision, the
restricted block, a resolved fact value (voice, offers, claims), research or notes; text that looks like a credential
is refused. Owner only (refused under an agent token). Studio's read-only "Content strategy" page
(`/brands/<slug>/market/content-strategy`) shows only those files from the merged commit (`buildStudioStrategy`):
per-channel cards, the mix as one bar, KPI targets labelled as the owner's targets. Unexpected fields, another brand's
slug, a misnamed file, a symlink or secret-looking text withhold the whole file with a reason. The page is listed only
when there is a file; the current status stays `brand:content show`.

### Owner workflow

```bash
npm run brand:content -- plan --from 2026-11-23 --weeks 2                 # preview, nothing written
npm run brand:content -- plan --from 2026-11-23 --weeks 2 --out weeks.json # edit hooks / angles, then
npm run brand:content -- week propose --file week.json                     # one item of weeks.json
# or: plan … --store  to store every planned week as a draft as is
npm run brand:content -- week review  --week wk-2026-11-23 --revision 1
BRAND_OS_APPROVAL_PROOF=… npm run brand:content -- week approve --week wk-2026-11-23 --revision 1 --expect-sha <sha256>
npm run brand:content -- calendar [--channel instagram] [--lang fa|tr]
npm run brand:content -- share --week wk-2026-11-23 --dry-run
npm run brand:content -- share-strategy --id content-main --dry-run      # then without --dry-run, commit, merge
```

### Tests

| Behaviour | Test |
| --- | --- |
| Cadence respected, every slot cites a source, pillars and languages rotate, nothing written | `content-calendar` "the planner respects cadence…" |
| Per-week approval; draft week and draft v2 invisible until approved | `content-calendar` "a week is approved by the owner…" |
| Tampered week or approval not served | `content-calendar` "tampering…" |
| No slot contradicts a banned claim or the availability rule (en/fa/tr) | `content-calendar` "no slot may contradict…" |
| New strategy revision or changed fact → `needs_review` | `content-calendar` "a new strategy revision…" |
| Research angles cite observations with confidence, never text | `content-calendar` "optional research angles…" |
| Owner-only | `content-calendar` "the calendar is owner-only" |
| CLI journey: plan, store, proof-gated approve, calendar, banned hook refused, share | `content-calendar-cli` |
| Studio path filter, projection withholding, read-only page in en/fa/tr, old-cache rebuild | `studio-calendar` |
| `share-strategy`: approved revision only, no drafts / restricted / fact values, owner only; Studio filter, withholding, page in en/fa | `studio-content-strategy`, `content-calendar-cli` |

### Limits (Slice B)

- No agent read path yet: no token profile reads weeks (Slice C).
- Slot status stops at `idea | planned | skipped`; `produced` / `published` come from agent observations in Slice C.
- The Studio page shows a week as of `shared_at`; the current status is the CLI `calendar`.
- Fact text and pillar names are shown as written; gap, notice and CLI text is en/fa/tr.

## Slice C preflight reuse map (against main `f956681`)

Written before any Slice C code. Slice C adds one token profile, three tools and one small observation file per week.
Everything else is reused.

| Existing module | Reused for | New small type | Why it is not a second truth |
| --- | --- | --- | --- |
| `auth.ts` profiles, `agent-tokens.ts`, `resolveAgentContext` | One new fixed profile, `content-read` (facts as `marketing`). Issued by the owner with `brand:agent-token issue --profile content-read`. | `'content-read'` | Same token store, hashing, revocation and fail-closed startup. Existing tokens keep their profile, so none gains calendar access. |
| `strategy/feed.ts` `strategyAccess`, `STRATEGY_PROFILES`, `cleanPin`, `StaleInfo` | The gate: `content-read` maps to the agent kind `content`. `contentAccess` is `strategyAccess` narrowed to that kind. The pin check and the `stale_pin` shape are the Strategy Feed's. | none | No new gate. The same profile also reads approved `content` strategies through `strategy_list` / `strategy_get`. |
| `access-log.ts` `appendAccessLog` | One line per call, allowed or not, `kind: "content"`, ids only (week, slot, observation id). URLs and text are never logged. | none | Same log file and rules. |
| `content-bridge/calendar-store.ts` `buildCalendar`, `evaluateWeek`, `approvedWeekEntry`, `loadWeekRecord` (Slice B) | `content_calendar` is the Slice B calendar view, plus the latest report per slot. A brief reads one slot of a week whose status is `current`. | `AgentCalendarDocument` | The owner's `contentCalendar` and the agent tool run the same code. The owner-process check moved to thin wrappers (`contentCalendar`, `contentStrategyView`) so both paths share one served rule. |
| `content-bridge/projection.ts` `servedContentViews` (Slice A) | Voice sources and do / don't, banned claims, availability rule, audience, CTA rules and channel plan in a brief. | `ContentBriefDocument` | Resolved from approved facts at the pinned revision on every read. Restricted facts are never resolved. |
| `competitive/` observation ids already in the slot (`SlotResearch`, Slice B) | The brief's `competitive_angle`: observation id, `knowledge:kn_…@sha256` ref, confidence. | none | Quotes stay in Knowledge research notes. |
| `creative/` `scanPreferences`, `preferenceView` | Approved series preferences whose surface is the slot's format, by id. Read them with `creative_context` (a `creative-read` token). | none | Preferences stay in Creative Learning; the brief lists ids only. |
| Knowledge `withLock`, `writeVaultFile`, `safeRead`, `dirUsable`; `knowledge/safety.ts` `credentialFindings` | The observation file `brand/.private/content/observations/<week_id>.json` (0600, git-ignored, per-week lock); refusing URLs that carry a credential. | `ContentObservation` | Reports are observations, not decisions: they pin the week revision and hash they were made against and change no week, strategy or fact. Not Knowledge notes, because notes are the owner's unapproved ideas and an agent must not add to the owner's inbox. Not Creative feedback, because that store is about design variants. |
| stdio MCP (`scripts/mcp.ts`), `brand:query` (`scripts/brand.ts`) | `content_calendar`, `content_brief`, `content_report` in MCP; `content_calendar`, `content_brief` in `brand:query`. | none | Same caller resolution from the server's environment; no tool takes a role, profile or brand argument. |
| `content-bridge/i18n.ts` pattern | en/fa/tr notices, refusal reasons, report messages and CLI lines. | `agent-i18n.ts` | Text only. |
| Template sync / migrations | Nothing to migrate: a new profile name and a new private folder. Old tokens and old brand repositories are unaffected. | none | — |

## Slice C: agent consumption

### Who can read

Only an owner-issued token with the `content-read` profile, of this brand. Guests, the owner process context, tokens
without a profile and every other profile (including `marketing`, `creative-read` and the strategy profiles) get
`denied`. A token of another brand is `denied` (`cross-brand`). Arguments such as `brand_id`, `profile` or
`include_drafts` are ignored or refused; nothing in a call widens access.

### Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `content_calendar` | `from?`, `to?` (YYYY-MM-DD, at most 120 days), `channel?`, `lang?` (en, fa, tr) | Schema `brand-os/content-feed/v1`. Approved weeks whose status is `current`, each with `revision`, `digests.content_sha256`, `digests.approval_digest`, slots, resolved cited facts (never restricted), gaps and `reports` (latest per slot). Drafts, `needs_review`, `integrity_failed` weeks: counted under `withheld` only. `digests.view_sha256` (the Slice B view) and `digests.feed_sha256` (this document). |
| `content_brief` | `week_id`, `slot_id`, `pin? {revision, content_sha256}`, `lang?` | Schema `brand-os/content-brief/v1`. Slot (date, channel, format, language, `direction`, pillar, hook, angle, notes), channel plan, resolved objective / key message / offer / CTA, CTA rules, audience, voice sources and do / don't / vocabulary, banned claims and availability rule, `must_include`, `must_avoid`, `competitive_angle`, `creative.preferences` (ids), the latest `report`, `sources`, `redacted`, `missing`. `digests.brief_sha256`. |
| `content_report` | `week_id`, `slot_id`, `pin {revision, content_sha256}` (required), `status` (`produced` or `published`), `url?` (required for `published`), `lang?` | Schema `brand-os/content-report/v1`. The stored observation (`cob_…`), or the earlier one when the same report was already made (`duplicate: true`). |

Every document carries `authorizes: []` and `publication_permission: false` (calendar and brief also
`schedule_permission` and `spend_permission`), and a notice that its text is data, not instructions.

### Pins and stale weeks

Pin the week `revision` and `content_sha256` from the calendar. When the owner approves a newer revision of the week,
a brief or report with the old pin gets `stale_pin`, `pinned_state: superseded`, the current pin and no content. A
week that needs review (a cited fact, research note or the strategy changed) serves nothing: `not_found` without a
pin, `stale_pin` with `pinned_state: needs_review` and `current: null` with one. A pin to a draft or rejected
revision is reported as `unknown` and reveals nothing about it.

### Reports

A report is an observation. It is stored in `brand/.private/content/observations/<week_id>.json` and pins the week
revision and hash it was made against. It never edits the week revision, its hash, the strategy or a fact, and nothing
reads reports to change strategy. The URL must be `https://`, at most 500 characters, on a public domain name (no
localhost, bare names or IP addresses), and must not carry a user name, password or access token. Brand OS never
opens it. A skipped slot cannot be reported. After the owner approves a new revision of the week, earlier reports stay
on file but are not shown on the new revision. The owner reads them with `brand:content reports`.

### Agent workflow

```bash
npm run brand:agent-token -- issue --profile content-read --label "instagram agent"   # owner, proof needed
# In the agent host: BRAND_OS_AGENT_TOKEN=<token> npm run mcp:serve (stdio MCP), then
#   content_calendar {channel: "instagram"}                      → weeks with revision + content_sha256
#   content_brief {week_id, slot_id, pin}                        → one slot's brief
#   content_report {week_id, slot_id, pin, status: "published", url}
# The same reads without MCP:
BRAND_OS_AGENT_TOKEN=<token> npm run brand:query -- --tool content_calendar --channel instagram
BRAND_OS_AGENT_TOKEN=<token> npm run brand:query -- --tool content_brief --week wk-2026-11-23 --slot s01 --pin-revision 1 --pin-sha <sha256>
npm run brand:content -- reports [--week wk-2026-11-23]                               # owner
```

### Tests

| Behaviour | Test |
| --- | --- |
| Approved current week only; draft week counted; stable, self-verifying JSON; filters; en/fa/tr; bad arguments; every other profile, guest, owner context, unprofiled and cross-brand denied and logged; forged arguments; content strategy via `strategy_list` | `content-agent` "gate: a content-read agent sees only…" |
| Brief contents: voice, claims, audience, resolved message, channel plan, competitive angle (no quote), creative preference ids (no drafts), RTL, restricted fact redacted with a canary | `content-agent` "a brief carries…" |
| Stale pins (draft, superseded, hash-only), `needs_review` week withheld | `content-agent` "stale pins are refused…" |
| A record edited to two approved revisions serves nothing; a pin reports `integrity_failed` | `content-agent` "a week record edited…" |
| Reports: observation fields, duplicate, URL refusals, pin required, draft and stale weeks refused, skipped slot, week files unchanged, 0600 file, access log without URL, owner-only listing | `content-agent` "reports…" |
| Mock Instagram agent over stdio MCP and `brand:query`; marketing token and guest denied; access log | `content-agent` "gate over stdio MCP and brand:query…" |
| `brand:content reports` en/fa/tr, `--json`, older revision label, refused under an agent token | `content-agent` "brand:content reports…" |
| MCP tool list | `audit` |

### Limits (Slice C)

- Reports are not verified: Brand OS never opens the URL, so a report says what the agent claims. The owner sees who
  reported what with `brand:content reports`.
- No results or metrics are collected, and reports never change strategy (out of scope for the brief).
- The Studio page does not show reports. Revoking a token takes effect when the MCP server restarts, as for every
  profile.
- `content_report` is MCP only; `brand:query` stays read-only.

## Slice D: skill and integration guide

Slice D adds no runtime code path. It documents the existing one and tests that the documents stay true.

| Item | Where | Reuses |
| --- | --- | --- |
| Agent skill: the owner's flow (propose and review only, never approve) and the content agent loop (calendar → pinned brief → report, stop on `stale_pin` / `not_found`) | `agent-skills/content-planner/SKILL.md` | The commands and tools above; the Strategy Feed rule that agents never approve or pass a guessed `--expect-sha`. |
| Integration guide for an external bot (any stdio MCP client, or `brand:query` without MCP): token issue and revocation, the result envelope, the three schemas, digest verification (with a Python recipe checked against real output), `authorizes: []` and the permission flags, en/fa/tr | `docs-internal/CONTENT_AGENT_INTEGRATION.md` | `AI_CONNECTORS.md` token model; no new profile, tool or field. |
| CLI journey demo with real output | `CONTENT_AGENT_INTEGRATION.md` section 8 | Captured from `tests/content-journey.test.ts` (`CONTENT_JOURNEY_TRANSCRIPT=<file>`). |
| Doc test: every `npm run` command, `brand:query --tool`, MCP tool and schema id named in the skill and guide exists; neither shows `--proof` or a token | `tests/content-journey.test.ts` | The `audit`-style tool list check. |
| Journey test: owner strategy and week approval through the real CLIs (proof refused without it), token issue through the CLI, agent reads through `brand:query`, report over stdio MCP, owner `reports` in en/fa/tr, revocation refused at next start, guest denied, access log without URLs | `tests/content-journey.test.ts` | Slices A–C code, unchanged. |

One text fix: the `brand:strategy review` note for a `content` strategy said no agent reads content strategies. Since
Slice C, `content-read` agents do (through `strategy_list` / `strategy_get`); the note now says so.

## Channel playbook, batch and deliverables

Three additions for "make 10 reels, 10 Instagram posts, stories, LinkedIn posts and camera scripts I read myself".
None adds a store, an approval path, a token profile or a tool: they reuse Slices A–C.

| Existing module | Reused for | New small type | Why it is not a second truth |
| --- | --- | --- | --- |
| `strategy/model.ts` `parseContentStrategy` | Optional channel fields, parsed strictly like the rest of the block. | `ChannelMixShare`, `ChannelKpi` | They live in the approved content strategy revision. Unset fields are absent, not `null` or `[]`, so old revisions hash the same. |
| `content-bridge/propose.ts` `buildContentStrategy` | `--playbook` copies playbook suggestions into the proposal. | none | Still a proposal; the owner reviews and approves it with `brand:strategy`. |
| `content-bridge/planner.ts` `planWeek` | `batch` runs the planner on the served strategy narrowed to the requested channels and formats. | `BatchItem` | Same slot shape, rotation, pins and checks (`proposeWeek` / `weekProblems`); weeks are approved one by one as before. |
| `content-bridge/agent.ts` `buildBrief` | `deliverable` per slot; `channel_plan` carries the optional fields when set. | `DeliverableSpec` | A deterministic function of format, channel and language. It writes no copy; `brief_sha256` covers it. |

### Optional channel fields

| Field | Values |
| --- | --- |
| `objective` | `awareness, engagement, community, leads, sales, authority, retention` |
| `audience` | Short owner text (≤ 200). Who this channel reaches; the audience facts stay the truth. |
| `mix` | `[{type, share}]`, `type` from `educate, inspire, connect, promote, entertain`, whole percentages summing to 100. |
| `kpis` | Up to 6 `{metric, target, per}`: `metric` from `reach, saves, shares, comments, follows, profile_visits, link_clicks, leads, watch_time, completion_rate, replies, subscribers`; `target` a number or `null`; `per` `post`, `week` or `month`. A target is the owner's target, never a measured result. |
| `posting_windows` | Up to 7 short texts such as `tue 19:00-21:00`. |
| `rules` | Up to 10 owner-written rules (≤ 200 characters each). |

Text fields pass the same safety check as every strategy text (no money amounts, credentials, personal data or
placeholders).

### Channel playbook

`packages/brand-core/src/content-bridge/channel-playbook.ts` holds general practice for Instagram, LinkedIn, X, TikTok,
YouTube, Threads, Telegram, Facebook, Pinterest, newsletter and blog, in en/fa/tr: a suggested role, formats, a cadence
range with a starting point, an objective, a mix, KPIs to watch (no targets), a posting-window note and 3–6 craft notes.
Every entry is `basis: general_practice` and the document says it is not measured for this brand. It cites no fact and
holds no voice, claim, audience or number about the brand. Website, podcast and other have no entry.

- `brand:content playbook [--channel x] [--lang fa|tr] [--json]` prints it (`brand-os/content-playbook/v1`,
  `authorizes: []`).
- `brand:content strategy --playbook` fills role, formats, starting cadence, objective, mix and KPI names for channels
  with an entry. `--formats` and `--cadence` win. Those fields are no longer `owner_decision` gaps; instead a note per
  channel names the values that came from the playbook, and one `assumptions` line in the proposal says the channel plans
  start from general practice. A channel without an entry keeps its gaps.

### Batch (`brand:content batch`)

`--channel instagram --format reel --count 10`, or several `--item channel:format:count`, `--from YYYY-MM-DD` (default:
the next Monday), `--pillar <id>`, `--research`, `--out`, `--store`, `--lang`.

- Slots are dated by the channel's approved cadence from `--from`, grouped into Monday–Sunday weeks, and built by
  `planWeek`, so they have the same rotation, pins and checks as `plan`. Several items on one channel share its cadence:
  their formats take turns (reel, post, reel, …), never stacked on one day.
- Refused: a channel the served strategy lacks, a channel without cadence, a format the channel does not use, a pillar
  the strategy (or the channel) does not carry, more than 50 per item or 10 items. A batch never widens the strategy.
- When the cadence cannot fit the count in 26 weeks, the result says how many were planned.
- `--store` stores each week as a draft through `proposeWeek`. If any target week already has a draft or approved
  revision, nothing is stored and the message names the weeks; edit them with `week propose` or reject the draft.
  Approval stays `week approve`, one week at a time.

### Deliverable specs (`deliverable` in a brief)

`packages/brand-core/src/content-bridge/deliverables.ts`, chosen by the slot format:

| Format | Spec |
| --- | --- |
| `reel`, `short_video`, `video`, `live` | `script`: production options `talking_head`, `voiceover`, `text_on_screen`; parts hook (0–3 s), setup, 3–5 beats (line, on-screen text, b-roll), payoff, CTA, caption; captions on; duration range per format and channel; a read-aloud word budget from about 2.5 (en), 2.2 (fa) and 1.9 (tr) words per second in the slot language; delivery notes (pace, eye-line, one sentence per line). |
| `carousel` | Slide count (5–10, LinkedIn 6–12), roles hook, value, recap, CTA; words per slide; caption first line and hashtag range. |
| `post` | Visual headline (≤ 8 words), caption structure (first line, body, CTA, hashtags), per-channel hashtag range. |
| `story` | 3–7 frames: opening, context, exactly one interaction (poll, question, quiz or link), closing. |
| `thread`, `article`, `email` | Structure and length (posts or words). |

Every spec is `general_practice`, carries rules (fill from this brief only, missing stays missing, write in the slot
language) and a `template` whose values are all `null`. Labels and guidance follow the brief `lang`.

### Tests

| Behaviour | Test |
| --- | --- |
| Old revision hashes unchanged (fixture digest from main); unset fields absent | `content-playbook` "an approved revision written before…" |
| Strict parse of the optional fields | `content-playbook` "the optional channel fields parse strictly" |
| Playbook en/fa/tr, general practice, no targets | `content-playbook` "the playbook is general practice…" |
| `--playbook` fills, explicit values win, notes and assumption | `content-playbook` "strategy --playbook fills…" |
| Batch dating, interleaving, refusals, store refused into stored weeks | `content-playbook` "batch: …" |
| Deliverable specs and the brief | `content-playbook` "briefs carry a deliverable spec…" |
| CLI journey | `content-playbook` "CLI: …" |
## Content feedback loop

The owner says what worked and what did not on a produced slot, and later briefs follow it once the owner approves a
rule. Nothing new decides anything: feedback reuses Creative Learning, metrics reuse the observation file.

| Existing module | Reused for | Why it is not a second truth |
| --- | --- | --- |
| Knowledge `captureNote` | The feedback words: one `owner_note` note, tags `content-feedback`, `slot-<week>-<slot>`, `proj-<project>`, `source.ref = content:<week>/<slot>`. | The words live only in the note. |
| Creative Learning (`createProject`, `addVariant`, `recordFeedback`, `suggestPreference`, `approvePreference`) | One project per slot, `content-<week>-<slot>`: surface from the slot format (`reel`, `carousel`, `post`, `story`, `thread`; `email`/`article` → `article`; `short_video` → `reel`; `video`/`live` → `script`), series = the slot's style id when it has one, else its channel (`channel-x` for X). Variant `A`, asset `missing`. | The project stores the note id + revision, verdict and closed-vocabulary aspects. A rule exists only after `brand:creative suggest` and the owner's `approve` (proof). |
| `observations.ts` | Owner-reported metrics in the same per-week file, a separate `metrics` list. | Labelled `owner_reported` / `not_verified`; pinned to the approved week revision; changes no week, strategy or fact. |
| `content_brief` (`agent.ts`) | `creative.preferences[]` with statements; `learnings[]`. | Only approved, currently valid preferences; numbers and ids only. |

```bash
npm run brand:content -- feedback --week wk-2026-11-23 --slot s01 --text "Caption too long, hook weak" --verdict change_request --keep tone --avoid length,hook
# prints: npm run brand:creative -- suggest --project content-wk-2026-11-23-s01 --statement '…' --source kn_…
npm run brand:creative -- suggest --project content-wk-2026-11-23-s01 --statement "Keep reel captions under 120 characters" --source kn_…
BRAND_OS_APPROVAL_PROOF=… npm run brand:creative -- approve --id cp_… --scope series
npm run brand:content -- metrics --week wk-2026-11-23 --slot s01 --views 1200 --likes 80 --completion-rate 42 [--measured-at 2026-11-25] [--source manual|platform_export]
npm run brand:content -- reports
```

- Feedback and metrics need an approved week revision and a slot in it; a skipped slot has no metrics. Both refuse while
  `BRAND_OS_AGENT_TOKEN` is set.
- Copy aspects were appended to the closed vocabulary (`length`, `humour`, `clarity`, `jargon`, `structure`,
  `hashtags`, `caption`, `script_delivery`; `hook`, `tone`, `cta`, `pacing` already existed) with fa/en/tr lexicon
  entries, and surfaces `caption`, `script`, `thread`, `article`. Existing ids and their meaning are unchanged.
- Metrics: counts are whole numbers, `watch_time_s` seconds, `completion_rate` a percent (0–100); `measured_at` not in
  the future. They are never fetched from a platform.
- A brief's `learnings[]`: up to 5 other slots of the same channel and format, latest metrics each, newest first. A
  content agent uses them to choose an approach, never as a claim.
- Tests: `tests/content-feedback.test.ts`.
