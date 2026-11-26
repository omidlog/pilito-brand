# SEO strategist (Spec Sprint 2)

One research-backed specialist: organic search, with AI discovery (GEO) where the owner wants it and current evidence supports it. It produces a **draft** plan for owner review, checked by an independent critic. It approves nothing, edits no website, publishes nothing and spends nothing. Approval and agent hand-off are a separate step: `brand:strategy propose --from-seo` (see `docs-internal/STRATEGY_FEED.md`).

Not built: ASO, paid, social, content, CRM or B2B specialists, a CMO agent or Strategy Critic product, campaign-metrics learning, and Studio views. The skill is `agent-skills/seo-strategist/SKILL.md`.

## Reuse map: one knowledge substrate

| Existing module | Reused for | New small type | Privacy / access | Tests |
| --- | --- | --- | --- | --- |
| `knowledge/store.ts` `captureNote`, `scanAll`, `findNote` | Each retrieved source becomes one local research note (`kind: research`, `source.kind: research`, `source.ref: <url>`, tag `research-source`). The owner's interview words become a local `meeting` note. | `ResearchSource` provenance block inside the note body (`research-record` YAML) | Local scope (gitignored), never restricted. Credentials and personal data are refused. | `research-adapter`, `seo-strategist` |
| Knowledge sha256 revision, `knowledgeRef` | A plan cites `knowledge:kn_…@sha256`. The critic re-reads the note: if it was edited, the citation is `edited_source`. | none | — | `seo-strategist` (edited note) |
| Knowledge `links` (`supersedes`) | A changed page is a new note that supersedes the old one. Identical content is deduplicated. | none | History is kept. | `research-adapter` |
| `knowledge/workspace.ts` (`withLock`, `writeVaultFile`, `safeRead`, `ensureDir`) | Interview record and drafts under `brand/.private/strategy/seo/` (0600, no symlinks). | `InterviewRecord` (values and note refs only), `SeoStrategy` draft | Owner process only. Refused under `BRAND_OS_AGENT_TOKEN`. | `seo-strategist` |
| `query.ts` `brandRetrieve` with the `marketing` profile | Approved context facts (ids and revisions) listed in the plan. | none | The profile never returns restricted values such as budget. | — |

There is no second note store, search index, raw-research database or approval system. Raw quotes live in exactly one Knowledge note each (asserted in tests). Local drafts are derived, rebuildable files in the gitignored folder.

## Research adapter contract (`packages/brand-core/src/research/`)

- `capability()` returns the adapter, `available` or `unavailable` with a reason, the mode (`live`, `replay` or `none`), whether it uses the network, and when it was checked.
- `retrieve()` returns either a source or a typed failure (`research_unavailable`, `fetch_failed`, `quote_not_found`, `not_recorded`). It never returns an invented source.
- A source records the URL and final URL, publisher, title, `source_type` (spec §5.1 evidence kinds) and tier (primary or secondary). Official labels are allowed only on official documentation hosts. It also records topic, language, `retrieved_at` (the real fetch time; a replay keeps the original), the page's own stated date (`page_last_updated`, verbatim, never guessed), tool, adapter, query, the `content_sha256` of the fetched bytes, `quotes_verified`, and bounded verbatim excerpts. Each excerpt has a claim key, a short claim label and a stance (supports, contradicts or context).
- Trust is computed: official docs are high trust as *platform statements*, not as measured effect. Unverified quotes cap trust at medium. Opinions and observations are hypotheses.
- Staleness is per topic: AI search features 60 days, crawler controls 90, platform guidance and app stores 180, international search 365. The limits can be overridden per call.
- Adapters:
  - `none` is the default.
  - `live` is opt-in with `BRAND_OS_RESEARCH_NETWORK=on`. It fetches over HTTPS with `accept-language`, has a size and time limit, refuses http downgrades, and checks every quote on the visible page text, refusing the whole source if one is missing. The page is data, never instructions.
  - `replay` uses a recorded bundle: no network, original dates kept.

## Demo (exact commands)

```bash
npm run brand:seo -- research status                       # unavailable: no network permission, no bundle
npm run brand:seo -- questions                             # one question, why it is asked, what it informs
npm run brand:seo -- answer --question seo.presence.web --value none --words "…owner's words…" --lang tr
npm run brand:seo -- answer --question seo.presence.app --value ios
# … until `questions` says complete (unknown is a valid answer)
npm run brand:seo -- plan                                  # research_unavailable, provisional, critic PASS
npm run brand:seo -- research replay --bundle tests/fixtures/research/seo-official-2026-11-22.json
#   or, with the owner's permission for network access:
BRAND_OS_RESEARCH_NETWORK=on npm run brand:seo -- research capture --request tests/fixtures/research/seo-official-request.json
npm run brand:seo -- research list                         # trust, freshness, kn_…@sha256
npm run brand:seo -- plan                                  # cited, dated decisions + evidence gaps + critic
npm run brand:seo -- critique --plan brand/.private/strategy/seo/drafts/<plan_id>.json
```

Exit codes: 0 ok, 1 error, 2 usage, 3 research unavailable for `capture`, 4 some sources failed in `capture`, 5 critic blocked.

## The recorded case

`tests/fixtures/research/seo-official-2026-11-22.json` was produced on 2026-11-22 by `research capture` with the live adapter. It holds 8 official pages: the Google SEO Starter Guide, Search Essentials, Spam Policies, AI features, Localized Versions, the robots.txt intro, OpenAI crawlers, and the Apple product page. Every quote was found on the fetched page, and each source has its fetch time, the page's stated "Last updated" date (where shown) and the hash of the bytes. Tests replay it with a fixed clock. The first capture attempt showed why the checks matter: without `accept-language`, the documentation host served German and Arabic pages, and the adapter refused them instead of storing unverified quotes.

## Limits

- The decision catalog is deterministic and hand-written (`seo/strategist.ts`). It covers app-only, website, website plus app, B2B/B2C, languages, migration, timeframe and GEO. Anything else is not planned rather than improvised.
- There is no keyword tool, competitor crawl, Search Console connector or performance data. These appear in the gap checklist every time.
- The critic is pattern-based on English prose. It catches the claim shapes it was written for (see `agent-skills/seo-strategist/references/evaluation-rubric.md`), not every paraphrase.
- Google Play and site-move guidance are not recorded, so the decisions that need them stay provisional.
