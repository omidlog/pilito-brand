# Output contract

Typed draft: `packages/brand-core/src/seo/model.ts` (`SeoStrategy`). Markdown: `render.ts`.

- `state: draft`, `approval: null`, `authorizes: []`, always.
- `research.status`: `researched` (at least one fresh usable source) or `research_unavailable`. `label`: `evidence_backed` only when no decision is provisional or blocked.
- Each decision has an action (`do_now`, `test`, `defer`, `do_not_do`), the claim keys it `requires`, citations `[S#]`, `missing_claims`, a status, a confidence, `decided_at` and a review trigger.
- Platform statements appear only as `> “verbatim quote” — Publisher, retrieved YYYY-MM-DD, page says “…” [S#]` lines. The Sources table gives the URL, retrieval date, the page's own date, type, trust, freshness and `knowledge:kn_…@sha256`.
- The evidence-gap checklist always includes `no_keyword_data`, plus missing, stale or conflicting sources, unanswered or unknown answers, the baseline, unverified competitors and unrealistic goals.
