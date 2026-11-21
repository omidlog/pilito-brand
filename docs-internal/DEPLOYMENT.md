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

Brand OS Studio (`apps/studio`) is a Node server, not a static site. Run it behind a TLS reverse proxy on a server you control, bound to `127.0.0.1`, with `STUDIO_PUBLIC_ORIGIN` set to its https origin and TOTP configured. Never host it on a public static host and never deploy the internal docs build in its place. The VPS deployment package (process supervision, proxy, DNS) is a separate phase and not included yet. Configuration: `apps/studio/.env.example`; guide: `docs-internal/STUDIO.md`.
