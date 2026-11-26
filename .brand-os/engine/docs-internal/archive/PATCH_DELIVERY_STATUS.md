# Brand OS hardening patch — 20 November 2026

Baseline: `omidlog/brand-os-template`, branch `cursor/brand-os-template-5609`, HEAD `b98812d94daf68daa9ad4716f1af5c620a5e1c9c`.

## Implemented locally

- Canonical publication allowlists for facts, pages, assets, mascot records and tokens; private-brand public projection denial.
- Public docs source pages are opt-in, with a generated safe introduction; Brand Book and Business Book pages linked in navigation.
- Public token JSON/CSS are rebuilt from explicitly published hash-approved colors, not all draft source values.
- MCP default public tools exclude unpublished facts, draft components, draft mascot states, internal progress, and unapproved assets; metadata is minimized.
- Stale approval proposals are rejected by comparing their expected revision to the *current* approved fact, and proposed values are validated before mutation.
- Resetting/initializing a new brand clears publication grants.
- Migration history is serialized as valid YAML rather than string-appended; repeat migrations are idempotent.
- Backups exclude earlier encrypted backups; restore rejects unsafe relative paths.
- Financial scenario outputs gross profit and gross margin percent separately; runway requires explicit net burn.
- SVG publication checks reject several active, external and embedded content classes. An XML-aware sanitizer is still needed for untrusted production uploads.
- Added/updated regression tests and documented publication limitations.

## Verification

- TypeScript source parses syntactically using the installed TypeScript compiler.
- `git diff --check` passes.
- Source YAML and JSON files parse successfully.
- **CI and runtime tests were not executed**, because complete npm dependencies were not available in the analysis environment. No production readiness claim is made.

## Unresolved blockers for a real 10/10

1. GitHub connection cannot create a branch (HTTP 403 `Resource not accessible by integration`). No changes have been pushed.
2. `npm ci`, lint, typecheck, test suite, and Docusaurus builds must pass on an authorized environment.
3. Authenticated server-side human approval and least-privilege multi-user access are not implemented; file-based policy can be modified by agents with repo write permissions.
4. LLM-powered multilingual interview, comprehensive Business OS/financial model, live Figma sync, production-ready UI component library, and reusable core migration engine still require implementation.
5. Two-brand end-to-end journey and adversarial deployment review are required before production release.

## Apply with Cursor or Git

On the **exact baseline commit** or corresponding branch:

```bash
git switch cursor/brand-os-template-5609
git switch -c fix/brand-os-security-integrity
git apply --check brand-os-security-and-integrity.patch
git apply brand-os-security-and-integrity.patch
npm ci
npm run ci
```

Review all changes, fix any test failures, and open a PR rather than merging without approval. Do not host the internal documentation build publicly or put brand secrets in a public Git repository.
