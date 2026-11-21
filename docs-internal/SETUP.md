# Setup

Requirements: Node.js 22 or newer.

```bash
npm install
npm run tokens:build
npm run prepare:docs
npm run lint
npm run typecheck
npm run validate
npm run test
npm run build
```

Local preview with internal audience (draft values visible, restricted values still hidden):

```bash
npm run docs:start
```

The site listens on port 3000. Public build:

```bash
npm run docs:build
```

Copy `.env.example` to `.env` only for local overrides. Do not commit `.env`. Scripts do not load it automatically.

`BRAND_OS_DATA_KEY` (32 random bytes, base64) is required for restricted answers and backups:

```bash
export BRAND_OS_DATA_KEY="$(node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))")"
```

Keep a copy in a secret manager. Without it, existing restricted answers and backups cannot be decrypted.

Check the environment without printing any secret:

```bash
npm run brand:doctor                              # human-readable, exit 1 on a hard failure
npm run brand:doctor -- --json                    # machine-readable
npm run brand:doctor -- --create-approval-secret  # create brand/.private/approval-secret (0600) if absent
```
