# Competitive landscape (Identity Slice B)

A per-brand competitor **index** that strategy work can cite. It is not a notebook, a price database or an approval path. Every third-party excerpt lives exactly once, in a Knowledge research note. The index holds ids, owner-set classifications, short labels and references to those notes.

Core: `packages/brand-core/src/competitive/` (`@brand-os/brand-core/competitive`). CLI: `npm run brand:competitive`. Tests: `tests/competitive.test.ts`, `tests/competitive-cli.test.ts`.

## Owner workflow

1. **Record sources** with the existing research CLI. Use topic `market_observation`, one verbatim excerpt per claim, and a dotted `claim_key`:
   - `npm run brand:seo -- research capture --request req.json` (live HTTPS; needs `BRAND_OS_RESEARCH_NETWORK=on`; every quote is checked on the fetched page), or
   - `npm run brand:seo -- research replay --bundle bundle.json` (no network; original dates kept).

   Each source becomes one Knowledge research note. A re-capture of a changed page supersedes the old note; history is kept.
2. **Scope** what the research is for: `brand:competitive scope --purposes identity,pricing`. Purposes: `identity`, `positioning`, `marketing`, `pricing`, `seo`, `expansion`. The scope only narrows the gap checklist.
3. **Add candidates**: `brand:competitive add --name "WordFlight" --relationship direct --geography international --markets US --domain wordflight-app.com`. A name is a `candidate`. A typed domain is a claim, not an official domain.
4. **Cite evidence**: `brand:competitive link --id cmp_… --note knowledge:kn_…@<sha> --claim wordflight.pricing.pro --dimension public_price --label "Pro on own pricing page" --offer Pro --amount 12 --currency USD --market US --period month --commitment annual --tax excluded --promotion none_observed`.
5. **Verify the domain**: `brand:competitive verify-domain --id cmp_… --note kn_… --claim …`, using a source that was fetched from that domain.
6. **Read**: `brand:competitive matrix [--lang en|fa|tr] [--json]`, `list`, `show --id cmp_…`.
7. **Record progress or exclusions**: `brand:competitive status --id cmp_… --status owner_reviewed|disputed|archived --reason "…"`.

Every command is refused while `BRAND_OS_AGENT_TOKEN` is set. None of them uses the network.

## Records

`brand/.private/competitive/` (gitignored, mode 0600, atomic writes, per-record lock, no symlinks, other brands' files skipped):

- `scope.json`: `{kind: competitive_scope, purposes[]}`.
- `candidates/cmp_<uuid>.json`, with these fields:
  - `display_name`; `name_key`, used only to warn about duplicates;
  - `relationship[]` (`direct | indirect | substitute | aspirational_benchmark`);
  - `geographic_relevance[]` (`local | regional | international`, relative to the approved `business.market.geography`);
  - `markets[]` (ISO alpha-2 or `GLOBAL`), `source`, `status`, `status_reason`;
  - `domain_claim`, `domain_evidence`, `distinct_from[]`;
  - `observations[]`.
- An observation has these fields:
  - `dimension`;
  - `statement_kind` (`observed_claim | inference`);
  - a label of at most 200 characters;
  - `evidence: {note_id, revision, claim_key, observed_at}`. `observed_at` is copied from the note's `retrieved_at`.
  - For `public_price` only: price terms such as amount, currency, period, commitment, market, tax, promotion and feature scope.

**Stored status** is `candidate | owner_reviewed | disputed | archived`. **Assessment** is computed on read: `candidate | researched | owner_reviewed | needs_refresh | disputed | archived`. It describes how complete the assessment is. It is not the owner's acceptance of each observation.

## Rules the code enforces

| Rule | Where |
| --- | --- |
| **A cited note must:** be a research note of this brand with topic `market_observation`, not archived and not superseded; match a pinned revision if one is given; and hold a supporting excerpt for the `claim_key`. Ordinary, restricted and other-brand notes are refused. | `store.ts resolveEvidence` |
| **A public price must be supported by the quote.** The amount must appear in it (Persian and Arabic digits, both decimal conventions). The currency must be named or shown by its sign. A stated period, commitment or tax basis needs a cue in the quote; otherwise use `unknown`. Quote text that reads like a promotion cannot be recorded as `none_observed`. | `model.ts priceSupport` |
| **Hypotheses stay hypotheses.** `strength_hypothesis` and `weakness_hypothesis` must be inferences. A price is never an inference. | `linkEvidence` |
| **Same-name candidates are handled carefully.** A second candidate with the same normalized name is refused unless the owner names the existing one and gives a reason, and their markets are disjoint (an unknown market counts as overlapping). Two records claiming one domain are refused. Records are never merged automatically. | `addCandidate`, `verifyDomain` |
| **A domain is "official" only while verified.** The source fetched from it must stay current; this is re-checked on every read. | `landscape.ts domainState` |
| **Domains are names, never fetched.** URLs, paths, IP addresses, localhost and private-use suffixes are refused. | `validateDomain` |

## Reading the landscape

`buildLandscape(ws, {capability, lang, now})` is pure and deterministic for the same records, notes, clock and capability. It writes nothing and fetches nothing.

- **Ref state.** It reuses the research store (`loadEvidence`, `evidenceFor`) and the Strategy Feed's ref vocabulary. The states are `current | stale | changed | superseded | archived | missing | claim_missing`.
- **Cell state:**
  - `observed`: current, fresh, quotes verified, no conflict;
  - `unverified`: the quotes were not checked against fetched bytes;
  - `hypothesis`;
  - `historical`: stale, so it is history and not current;
  - `conflicting`: a contradicting excerpt with the same claim key, or two current prices for the same offer and terms that disagree; both are kept;
  - `needs_review`;
  - `unknown`.
- **Prices** are listed by competitor name, never ranked (`ranked: false`) and never converted (`currency_conversion: 'none'`). Their comparability is `none | single | not_comparable | terms_match`, with reasons such as `different_currencies`, `tax_unknown`, `promotional_price`, `monthly_rate_billed_annually` and `historical`.
- **Source class** says who is speaking, relative to the competitor: `competitor_own_page | platform_documentation | independent_reporting | analyst_inference | owner_statement | first_party_data`. A company's own page supports only what it claims.
- **Gaps** are an en/fa/tr checklist:
  - research unavailable (with the adapter's reason);
  - scope not set;
  - target market not approved;
  - no candidates;
  - relationship unknown;
  - identity unverified;
  - a dimension unknown within the scope;
  - evidence needing review;
  - conflicts;
  - prices not comparable;
  - SEO needs search evidence.
- **Overall state:** `no_candidates | candidate_only | evidence_insufficient | evidence_available`. An empty matrix never implies that there are no competitors.
- **`prohibited_inferences`** lists, in en/fa/tr, what the landscape never supports:
  - ad performance;
  - private commercial terms;
  - search rankings;
  - legal clearance;
  - brand decisions;
  - currency conversion.
- `authorizes` is always `[]`. The target market is cited by fact id and revision. Its value is not copied.

## Privacy

- Owner-only, local and gitignored.
- No MCP tool, `brand:query` path, Studio page, public projection or docs build reads `brand/.private/competitive`. Studio reads only the redacted file the owner shares (see "Share path"). `tests/audit.test.ts` pins the MCP tool list.
- A `knowledge-read` or any other agent token is refused by the owner-process check.

## Reuse map

The base is `main` at 8bd44db.

| Concern | Existing owner | Slice B |
| --- | --- | --- |
| Third-party excerpts, provenance, revisions, archive, supersession | Knowledge Inbox research notes via `research/store.ts recordSource` | Reused as the only quote store. The index stores `{note_id, revision, claim_key, observed_at}`. |
| Retrieval and capability (`live | replay | unavailable`) | `research/adapters.ts`, `brand:seo research` | Reused unchanged. `matrix` reports `selectAdapter().capability()` and never fetches. |
| Trust, staleness by topic, conflicts | `research/model.ts trustOf / stalenessOf`, `research/store.ts loadEvidence / evidenceFor` | Reused. The `market_observation` limit (90 days) drives `historical`. |
| Changed-source handling | Strategy Feed `evidenceState` (`current | changed | missing` → `needs_review`) | Same vocabulary, made finer (stale, superseded, archived, claim_missing). |
| Safe files, locks, 0600, symlinks | `knowledge/workspace.ts` | Reused (`safeRead`, `writeVaultFile`, `withLock`, `dirUsable`). |
| Target market, pricing, positioning, channels, logo | Approved facts and the existing approval flow | Read only (`business.market.geography` by id and revision). Never written. |
| SEO competitor names | `seo.competitors.named` (owner assumptions) | Untouched in Slice B. Slice C reads it for the SEO supplement and imports it only on the owner's `import-seo-names` command. |

**What is new:** the `competitive_candidate` and `competitive_scope` records, and the read-time landscape. They hold no excerpt and no approved value, so they are not a second source of truth.

## Using the landscape (Identity Slice C)

Code: `competitive/context.ts`, `memos.ts`, `memo-i18n.ts`, `render.ts`, `seo-bridge.ts`. Tests: `tests/competitive-context.test.ts` and the second journey in `tests/competitive-cli.test.ts`.

**One projection.** `getCompetitiveContext(ws, purpose, {capability, market, lang, now})` calls `buildLandscape` and keeps only:

- the purpose's dimensions (`PURPOSE_DIMENSIONS`);
- candidates in the requested market. A `GLOBAL` or unknown market stays in and is marked as such. Archived and out-of-market candidates are counted, not listed.

It returns:

- the cited observations, each with its ref, ref state, cell and source class, plus `usable` (observed, unverified or hypothesis);
- conflicts and freshness counts;
- prices for pricing work, re-checked for comparability on the filtered rows;
- purpose gaps and `next_research` steps;
- `source_refs` and a `source_digest`, which changes when any cited source changes state;
- the prohibited inferences for that purpose (`PURPOSE_PROHIBITED`; pricing adds `price_coordination`);
- `authorizes: []`.

Its state is `missing`, `candidate_only`, `evidence_insufficient` or `evidence_available`, never an empty list that reads as "no competitors". It runs only in the owner's process.

**Four drafts** (`buildCompetitiveMemo`, `brand:competitive memo --purpose …`). Each reads the same context and cites the owner's approved decisions (`MEMO_FACTS`) by id and revision without copying the value. `business.marketing.budget` is never read. Every draft has:

- `observations` (usable only) and `unresolved` (conflicting, historical, needs_review), which are shown and never used as current;
- `alternatives`, all with status `hypothesis`, with trade-offs and dependencies;
- `not_known`;
- `proposed_edits`, which point to `brand:knowledge propose` → `brand:review` → `brand:approve`;
- `status: draft` and `authorizes: []`.

| Draft | Specific behaviour |
| --- | --- |
| Marketing opportunity memo | Alternatives: differentiate, match with proof, and a channel test when channel use is observed. Never infers spend, conversion, ROAS/CPA, revenue, targeting or effectiveness. |
| Pricing benchmark memo | Rows are `publicly_advertised`. Each has a `rate_label` (`standard_rate`, `promotional`, `promotion_unknown`, `monthly_rate_billed_annually`, `terms_unknown`), a status (`current`, `historical`, `needs_review`, `conflicting`) and `business_model: unknown`. Rows are never ranked or converted. Value-based, tiered, premium and entry-level are options without a number. `priced_recommendation` is always false, and a missing or stale price gives a warning. |
| SEO cited supplement | `seo.competitors.named` stays `unverified_owner_assumption`, matched to competitor ids by normalized name. Rankings and keyword gaps are `unverified`. The SEO interview, drafts and `SeoStrategy` schema are untouched. |
| Visual landscape assessment | Without a current cited visual observation, `visual_comparison: unavailable`, and no palette or motif is assumed. `similarity: not_assessed`, and legal clearance is never claimed. Routes follow the unapproved intake hint: create when there is no logo; retain-and-improve-guidelines, evolve or rebrand when one exists; all four when unknown. |

**SEO bridge.** `brand:competitive import-seo-names [--dry-run]` runs only on command. Each new interview name becomes a `candidate` with source `seo_interview` and no domain, market or evidence. A name that matches an existing candidate is reported and never merged. An `unknown` answer imports nothing.

**Reuse.** The landscape, research store, ref states and price checks are those of Slice B. The digest uses the Strategy Feed's `canonicalJson`/`sha256Hex`. Facts come from `readFacts`, SEO answers from `seo/answers.ts`, and the intake from `readIdentityIntake`. Drafts are printed, not stored, so there is no new record type.

## Share path (Visual V2.2, owner decision D1)

`npm run brand:competitive -- share [--dry-run]` is the only way competitor data leaves `brand/.private/competitive`. It writes one tracked file, `brand/competitive/shared/landscape.json`. The owner reviews the diff, commits it and merges it. Studio shows it on the read-only "Competitor comparison matrix" page (`/brands/<slug>/market/competitors`) after the merge. Studio never writes it. Code: `competitive/share.ts`. Tests: `tests/competitive-share.test.ts`.

**What is shared** (an allow-list, rebuilt field by field):

- Only competitors with stored status `owner_reviewed`. Candidates, disputed and archived records are counted (`not_shared`), never named.
- Per competitor: id, display name, relationship, geographic relevance, markets, and the domain only while a current source verifies it. Assessment is `owner_reviewed` or `needs_refresh`.
- Per comparison criterion (`offer`, `audience`, `geography`, `public_price`, `public_message`, `visual_language`, `observable_channels`): the cell state (`observed | unverified | historical | conflicting | needs_review | unknown`), at most three short recorder labels, and source labels: who is speaking (source class), the public host for web sources, and the date the source was read.
- Public prices as recorded: offer, amount, currency, market, period, commitment, tax, promotion, feature scope, a rate label and a state. `ranked: false`, `currency_conversion: 'none'`. Rows are grouped by currency, then by competitor name; the amount is never a sort key. A price whose source needs review is left out.

**What is never shared:** quotes or excerpts; Knowledge note ids, revisions and claim keys; URLs and paths; status reasons; claimed but unverified domains; same-name reasons; gap texts; scope; the target-market fact; the research adapter state; hypotheses (`strength_hypothesis`, `weakness_hypothesis` and any `inference`); hosts of owner-testimony or first-party sources. A label or feature scope that contains a recorded quote (normalized, 20 characters or more) or that the Knowledge safety scan flags is dropped and counted in `withheld_text`. A competitor name the scan flags stops the share.

**Determinism.** No run time is stored. `as_of` is the latest source date, and freshness is judged per day, so re-running gives the same bytes and an unchanged file is not rewritten. A competitor that is no longer owner-reviewed disappears on the next run. Refused under an agent token; a symlink at the target is refused.

**Studio** (`readSharedLandscape`) admits only that exact path (tar allowlist). It checks the exact key set at every level, so any extra field, a ranked price list, a URL as a host, another brand's file, a symlink or secret-looking text withholds the whole file. The projection still passes `assertNoSecrets`.

**Freshness after sharing.** The file freezes each state on the day of the share. When Studio builds the page later, a cell or price shared as current reads `historical`, and a map placement shared as `evidenced` reads `stale`, once its newest source is more than 90 days old (counted from the shared day, plus one day). States only go down; run `share` again to refresh them.

**Privacy note.** Competitor names and the shared labels become visible to everyone with read access to the brand repository.

## Positioning map (Visual V2.3, owner decision D2)

**Axes are the owner's.** `brand/.private/competitive/axes.json` holds exactly two axes, `x` and `y`. Each has an `axis_id` (owner-chosen, stable; positions cite it), a `label`, a `low` pole and a `high` pole (English required, Persian and Turkish when the owner writes them; never machine-translated) and an optional private `rationale`. The tool never suggests, ranks or invents an axis.

```bash
npm run brand:competitive -- axes set --x-id guidance --x-label "Guidance" --x-low "Self-paced" --x-high "Live teacher" \
  --y-id price_level --y-label "Price level" --y-low "Budget" --y-high "Premium"
npm run brand:competitive -- axes set --file axes.json      # the same as JSON, with fa/tr labels and rationale
npm run brand:competitive -- axes validate [--file axes.json]
npm run brand:competitive -- axes show
```

**Positions are cited bands.** `position add --subject own|<cmp_id> --axis <axis_id> --band low|lower_mid|mid|upper_mid|high --note <knowledge note> --claim <claim key>` records the owner's qualitative reading of one market observation. There is no number field. `positions` shows each (subject, axis) and how its sources read today; `position remove --position <pos_id>` removes one.

**States, judged at read time:** `evidenced` (a current source, all sources agree), `stale` (only sources older than 90 days, the research threshold for market observations; still drawn, marked), `conflicting` (sources disagree; the recorded bands are drawn as a range, never resolved), `needs_review` (every source changed or was retired; not drawn), `unknown` (nothing recorded; not drawn). A subject is plotted only when both axes are evidenced, stale or conflicting. Everyone else is listed in the map's "Not placed" margin.

**Share.** `brand:competitive share` adds a `positioning` section when axes exist: axis labels and poles, the band list, the stale threshold, and for the own brand and each shared competitor, per axis, the state, the bands and source labels (class, public host for web sources, date). Never shared: rationale, axis ids, position ids, note ids, revisions, claim keys, quotes, positions of non-reviewed competitors. Axis labels pass the same safety scan as other shared text; a label that matches a recorded quote is refused. Studio's strict reader withholds the whole file if the section has any extra field.

**Studio.** The map is plate 03 on the competitor comparison page and has its own A4 portrait print page. The vertical axis always runs low to high, bottom to top. The horizontal axis follows the reading direction: in English and Turkish it runs low to high, left to right; in Persian it is mirrored, low on the right and high on the left, the vertical axis sits on the right where the two low ends meet, and the axis arrow points left. Points, conflict ranges, poles and the arrow are mirrored together on screen and in print. The key, the notes and the footnote numbers are unchanged, and bands in the key still read low to high (for example "Lower-mid – Mid"). All text is HTML around the SVG, so Persian reads right to left in Vazirmatn. Competitor ids appear only in the details disclosure. Screenshots: `docs/screenshots/positioning-map-fa-*.png`.

**Owner decisions (2026-11-23).**

1. Stale threshold: 90 days, the research threshold for market observations. Kept as is.
2. Own-brand position: kept as is. The own brand is plotted on the same terms as a competitor. It needs one recorded source per axis, and the owner's own statement (source class `owner_statement` in a Knowledge research note) counts as a source.
3. Persian mirrors the horizontal axis, as described under Studio above. English and Turkish stay left to right.

No open questions remain for this slice.

## Not in this slice

- An interview question such as "who do buyers compare us with". The gap checklist asks it, and the CLI records the answers as candidates.
- The rebrand audit and logo brief (Slice D).
- Agent access, and Studio views other than the shared comparison matrix (V2.2).
- Live discovery or search.
