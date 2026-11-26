# Publishing a Brand OS safely

Public builds are **deny-by-default**. An approval status is not a grant to publish.

## Policy

`brand/publication-policy.yaml` declares separate allowlists:

- `approved_fact_ids` — only facts with approved status, public classification, and published status are eligible.
- `approved_page_ids` — only expressly listed source pages and published UI/mascot catalog IDs appear in the public site/tool responses.
- `approved_asset_ids` — only approved/public assets listed here and matching the SHA-256 of the bytes on disk may be published.
- `approved_token_ids` — only tokens listed here with a value-matching approval hash are exported to the public explorer/CSS.

`brand_id` must match `brand/brand.config.yaml`. Initializing a new brand clears all allowlists.

**Important:** The policy file is not an authenticated server-side authorization boundary. A GitHub write-capable agent could modify it. Use branch protection, CODEOWNERS with human approval, and isolated deployment identities. Do not grant untrusted agents permission to merge or push to production branches. A truly multi-user hosted system needs server-side authenticated role checks and audit logs.

## Build behavior

- Private brands produce no public fact projection and public MCP calls are denied.
- **Each real brand instance must be a private repository** unless its entire tracked history has been reviewed and cleared for publication. Public docs filtering does not hide Git history.
- `npm run docs:build` invokes a public projection. Starter pages not allowlisted are excluded; generated pages show approved claims or explicit missing states.
- `npm run docs:start` is an **internal** preview and is not intended for public hosting.
- Public `tokens.json` and `tokens.css` are generated only from allowed, approved, hash-matching color tokens; the internal design token source is unchanged.
- Never upload the entire repository, raw interview ledger, `brand/.private`, or an internal Docusaurus build to a public host.
- SVGs must pass two gates: the XML allowlist in `packages/asset-catalog/src/svg-check.ts` (namespace-aware elements, no event handlers, styles or external references; `url(#id)`/`href="#id"` only to the right kind of element in the same file) and the older text-level regex gate. Run `npm run brand:assets -- check` to see why a file is refused. `npm run brand:assets -- normalize <id>` fixes editor exports whose only problems are simple CSS, comments, metadata or editor data; SVGO is used only to rewrite, never as the security gate, and the original stays in `brand/assets-src/`, which is never published. Both gates still apply to every file, including uploads you do not trust.
- Run the public build, scanner and adversarial integration tests in CI, then inspect the complete output artifact before deployment.

## Studio

Brand OS Studio (`docs-internal/STUDIO.md`) is not a publication channel. It renders internal projections server-side, only to the signed-in owner, and never serves a static build of private brand data. It cannot approve or publish. Publication still goes through `brand/publication-policy.yaml` and the CLI.

## Not production-complete yet

This patch hardens source projection and local tooling. It does **not** implement authenticated multi-tenant remote MCP, true human-only publication approvals, full financial modeling, LLM conversational interviews, or live Figma integration. Those still need implementation and dedicated integration/security reviews.
