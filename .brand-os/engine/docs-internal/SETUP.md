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

**Do not keep the repository in a cloud-synced folder** (Google Drive, iCloud Drive "Desktop & Documents", Dropbox,
OneDrive). The sync uploads `brand/.private`, including the approval secret, and Google Drive for Desktop hard-links
files while it uploads, which Brand OS refuses to read (`has more than one hard link`). Clone into a local folder such as
`~/Code`. `brand:doctor` reports a `cloud_sync` failure when it detects a synced folder. To recover:

```bash
mv ~/Documents/acme ~/Code/acme && cd ~/Code/acme
npm run brand:doctor -- --fix-links               # replace hard-linked files with independent copies
npm run brand:doctor -- --rotate-approval-secret  # the old secret was uploaded: make a new one (needs the current proof)
```

To see and approve everything pending at once: `npm run brand:pending`, then the one command it prints
(`npm run brand:approve -- --all-pending`). See `docs-internal/GOVERNANCE.md`.
