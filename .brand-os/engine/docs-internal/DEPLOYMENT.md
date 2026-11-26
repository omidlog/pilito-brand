# Deployment

## Public

```bash
DOCS_AUDIENCE=public npm run docs:build
```

This omits internal and restricted documents. The default `npm run build` does this. Persian (`build/fa`) is RTL. Turkish is `build/tr`.

## Private

```bash
npm run docs:start
```

or prepare with `--audience internal` and build. Internal drafts can appear. Restricted values still do not.

## GitHub

`.github/workflows/deploy-docs.yml` is manual. It uploads a build artifact. GitHub Pages runs only if the repository variable `DOCS_PAGES` is `true` and the audience is public. Leave that variable unset until you intend to publish. A private repository can still leak if Pages is public. Prefer an internal host for internal audience builds.

Do not deploy `brand/restricted/`, `brand/interview/answer-ledger.yaml`, or `brand/exports/`.

## Studio

Brand OS Studio (`apps/studio`) is a Node server, not a static site. Run it behind a TLS reverse proxy on a server you control, reachable only by that proxy, with `STUDIO_PUBLIC_ORIGIN` set to its https origin and TOTP configured. Never host it on a public static host and never deploy the internal docs build in its place.

The production package for the owner's VPS is `infra/production` (Dockerfile, Compose publishing only `172.18.0.1:8083`, the site block for the existing edge Caddy, `.env.example`, smoke test, backup and restore). Runbooks and the launch handoff are in `docs-internal/phase-10/` (`DEPLOY.md`, `GROK_HANDOFF.md`, `OPERATIONS.md`, `DEPLOYMENT_CONTRACT.md`, `ARCHITECTURE.md`, `SECURITY_REVIEW.md`, `CLAUDE_EDITING_WORKFLOW.md`). Nothing is deployed by this repository. Guide: `docs-internal/STUDIO.md`.
