# Interview map

Source of truth: `packages/brand-core/src/seo/interview.ts` (`SEO_QUESTIONS`). Each question has en/fa/tr prompts, why it matters, the decision it informs, its dependencies and its skip rule.

- `seo.presence.web` and `seo.presence.app` decide the archetype: app_only, website, website_and_app, or undetermined (blocked).
- With no website, these are skipped with a reason: `seo.web.*`, `seo.data.search_console`, `seo.geo.crawler_policy`. `seo.app.web_openness` is asked instead.
- With an app, `seo.app.store_status` is asked (prelaunch leads to no claims before release).
- With more than one language on a site, `seo.web.locale_structure` is asked.
- `seo.geo.interest = no` skips `seo.geo.crawler_policy` and drops the GEO section.
- Budget, revenue and credentials are never asked.
