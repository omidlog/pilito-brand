# Research sources and refresh rules

Official starting points (verify at use; they are pointers, not claims):

| Topic (staleness limit) | URL |
| --- | --- |
| search_platform_guidance (180 days) | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| search_platform_guidance (180 days) | https://developers.google.com/search/docs/essentials |
| search_platform_guidance (180 days) | https://developers.google.com/search/docs/essentials/spam-policies |
| ai_search_features (60 days) | https://developers.google.com/search/docs/appearance/ai-features |
| international_search (365 days) | https://developers.google.com/search/docs/specialty/international/localized-versions |
| crawler_controls (90 days) | https://developers.google.com/search/docs/crawling-indexing/robots/intro |
| crawler_controls (90 days) | https://developers.openai.com/api/docs/bots |
| app_store_guidance (180 days) | https://developer.apple.com/app-store/product-page/ |

Not recorded yet (the strategist reports them as missing evidence): Google Play store listing guidance (`google_play.store_listing.metadata`), Google site-move guidance (`google.site_move.redirects`), Bing Webmaster AI performance.

Rules:
- Official hosts: `packages/brand-core/src/research/model.ts` `OFFICIAL_HOSTS`. Any other host is `study`, `observational` or `expert_opinion`.
- Staleness limits are per topic (`DEFAULT_STALENESS_DAYS`) and can be overridden per call. A stale source makes dependent decisions provisional and blocks the critic on cited quotes.
- A changed page is a new note that `supersedes` the old one. History is never overwritten.
- The request used for the recorded fixture is `tests/fixtures/research/seo-official-request.json`.
