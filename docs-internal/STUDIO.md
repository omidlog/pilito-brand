# Brand OS Studio

Studio (`apps/studio`) is a private, owner-only web app. It has two jobs:

1. **Create** a new brand: one new private GitHub repository from this template, with a safe initial configuration.
2. **Show** each brand: the approved, source-backed state of its merged default branch.

Studio does not edit brands. All ongoing work (interviews, proposals, documents, assets, tokens, commits and pull requests) happens in **Claude Code, inside that brand's own repository**. Approval and publication stay with the owner's trusted local CLI. Phase 8 Personal Brand OS remains fully supported. Studio shows personal brands read-only and does not edit them.

One Studio serves every brand, at routes `/brands/<slug>` (for example `https://studio.omidataei.com/brands/acme`). There are no per-brand subdomains.

## What Studio will never do

There is no chat, no Claude or other AI integration, no interview UI, no fact edit or save form, no approve or publish button, no upload, no commit, push, merge or revert UI, no agent-token issuance and no terminal. A test (`tests/studio-server.test.ts`, "no mutation endpoints") pins the complete list of non-GET routes and fails if one is added.

| Non-GET route | What it changes |
| --- | --- |
| `POST /login`, `POST /logout` | The owner session |
| `POST /brands/new` | Provisions one new private repository (the single GitHub write) |
| `POST /brands/<slug>/provisioning/retry` | Retries a failed provisioning of that new repository |
| `POST /brands/<slug>/refresh` | Re-reads GitHub into Studio's read cache |
| `POST /webhooks/github` | Marks a brand's cache stale (signed push events only) |

`PUT`, `PATCH` and `DELETE` answer 405. Once a repository exists, Studio never writes to it again.

## The owner journey

1. Sign in (password and authenticator code).
2. **New brand**: name, URL slug, profile (business/startup or personal brand with facets), languages, optional mascot and gamification, and the GitHub account or organization to create the repository in. Review, then **Create private repository**.
3. Studio shows each provisioning step live. On success: **Copy repository URL**, **Copy starter prompt**, **View brand**.
4. Open a **new Claude Code session** and paste the starter prompt (or open your local clone). See [Private repository access for Claude Code](#private-repository-access-for-claude-code).
5. Claude Code reads `AGENTS.md`, `CLAUDE.md`, `README.md` and `brand/brand.config.yaml`, interviews you, edits the brand through the core CLI, validates, and prepares a branch and pull request when you ask. You approve facts yourself with the local CLI, never by pasting a secret into chat.
6. Merge the pull request on GitHub.
7. Back in Studio, press **Refresh** (or wait for the webhook). Studio shows the new commit SHA, sync time, sources, documents, tokens and approved assets. Unmerged pull requests are listed as non-canonical on the History page and never shown as brand truth.

## Screens

| Screen | Shows |
| --- | --- |
| My brands | Every registered brand with profile, repository, last synced commit. Create action and empty state. |
| New brand | The five-step wizard (works without JavaScript as one form; the server validates everything). |
| Overview | Coverage and approval, required questions still unanswered, review queue size, coverage by area, next unanswered questions (read-only), recent merged changes, enabled modules. |
| Brand Book | The cited brand book from the core document model: approved, assumption, recommendation and missing items with sources. Restricted values are withheld. |
| Design System | Approved colors, all colors as swatches with draft/example/approved state, type specimens, logo specification, every token with its approval state. No pickers. |
| Assets & Mascot | Asset cards with checksum, license, visibility and approval. Previews only for approved images whose bytes match the manifest checksum and pass the core publication check (active SVG is refused). Mascot states without artwork say so. The mascot section disappears when the module is off. |
| Business OS | Business documents from the core document model. |
| Personal Brand | Only when `modules.personal.enabled` is true: the ten Phase 8 deliverables with verified / owner-stated / unverified labels. |
| History & Review | Latest merged commits, open pull requests (labelled non-canonical), fact review states, open contradictions. |
| GitHub & Claude Code | Repository URL, starter prompt, clone command, "Private repository access required", Open on GitHub. |
| Account & GitHub | MFA state, session expiry, which GitHub credentials are configured (never their values), template, allowed destinations, webhook state, a connection test. |

Every brand page shows the branch, short SHA and sync time in the top bar. Data states are distinct: *not yet synced*, *synced*, *stale* (older than the sync TTL; a background refresh starts), *refresh failed* (the last good commit stays visible with the error), and per item *approved*, *draft*, *example*, *missing* and *withheld*. Missing information is never filled with sample data.

## Architecture

```text
Browser ──HTTPS──> reverse proxy ──> Studio (127.0.0.1:4100, Node)
                                      ├─ server.ts      route table, auth, CSRF, headers
                                      ├─ views/         server-rendered, escaped HTML
                                      ├─ registry.ts    slug -> repository mapping (server-side, data dir)
                                      ├─ sync.ts        merged default branch -> safe projection cache
                                      ├─ projection.ts  core functions at the internal audience + credential guard
                                      ├─ provision.ts   the single write path
                                      └─ github/        REST client, safe tar extraction, webhook verification
```

- **Reading.** For a registered brand, Studio reads the head of the default branch, downloads that commit's archive with the read credential, and extracts only allowlisted files under `brand/` (never `brand/.private`, `brand/restricted`, exports or `.env`; symlinks, links, traversal and oversized archives are refused). It then runs the existing `@brand-os/brand-core` functions (dashboard, document model, token hashes, asset inspection) on that temporary copy and stores only the resulting projection, the SHA and times. A guard refuses any projection that looks like a credential.
- **Source of truth.** Git. Studio's view is the last successfully fetched merged default-branch commit. It never reads local ignored files, so it cannot show `.private` values or decrypted restricted facts; those appear as withheld.
- **Brand selection.** A slug only resolves through the server-side registry. A repository is accepted only if its `brand.slug` matches and its GitHub repository id is the one recorded at registration, so a deleted and recreated repository with the same name, or one whose config claims another slug, is refused.
- **Provisioning.** Template check, duplicate refusal (registry and GitHub), private generation from the template, wait for GitHub to copy it, then the core `applyInit` (the same initializer as `brand:init`) on a temporary checkout and one fast-forward commit with the safe initial config and manifest. A repository GitHub reports as public is deleted and never registered. A failure after creation deletes the partial repository when permitted, or records that cleanup is required; retry resumes. Per-slug and per-repository locks refuse concurrent creates. No approval secret, data key or agent token is ever created in the repository; those are initialized only in an authorized local workspace.
- **Refreshing.** Manual Refresh, refresh on view after the TTL, and an optional GitHub push webhook (HMAC verified in constant time over the raw body, deliveries de-duplicated). The webhook payload is only a hint: Studio fetches the branch itself.

## Security model

- Owner sign-in: scrypt password hash, TOTP (required whenever Studio is reachable beyond loopback), a login nonce, per-IP and global rate limits, generic failure messages.
- Sessions: random ids held server-side, HttpOnly, `SameSite=Strict`, `Secure` and `__Host-` prefix on https, absolute and idle expiry, destroyed on sign-out.
- Every authenticated POST checks the CSRF token and `Origin`. Only form-encoded bodies are accepted.
- Guests receive a redirect or 401 for every route, identical for real and forged slugs, so brands cannot be enumerated.
- Headers: strict CSP (`default-src 'none'`, scripts and styles from self only, no inline script, style or handler), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: same-origin`, COOP/CORP, `noindex`, HSTS on https. The browser tests confirm an injected inline script never runs.
- All repository text is escaped. Asset previews are served only for approved, checksum-matching images that pass the core publication check (symlinks, traversal and active SVG are refused), each with its own sandboxing CSP.
- The browser never receives a GitHub token, raw tree, `.private` value or restricted value. The static bundle (`apps/studio/static`) is plain CSS and a small script with no data; a test scans it for secrets and brand data.
- Two separate GitHub credentials: a read credential for brand repositories and a provisioning credential used only by the wizard and scoped to the allowlisted destinations and the configured template.
- Studio binds to `127.0.0.1` by default. Configuration fails closed and error messages never echo a secret.

## Running Studio locally

```bash
npm run studio:hash-password          # prompts for the owner password, prints a scrypt hash
npm run studio -- session-secret      # prints 32 random bytes (base64)
npm run studio -- totp-secret         # optional on loopback; add it to your authenticator app
cp apps/studio/.env.example .env      # fill in the values; .env is git-ignored
set -a; . ./.env; set +a
npm run studio:start                  # http://127.0.0.1:4100
```

`apps/studio/.env.example` documents every variable. Without a read credential, brand pages cannot sync. Without a provisioning credential and `STUDIO_ALLOWED_OWNERS`, the wizard is shown as not configured and nothing can be created.

### GitHub credentials

Use fine-grained tokens or a GitHub App installation, limited to the accounts and repositories Studio needs:

| Credential | Variable | Permissions |
| --- | --- | --- |
| Read | `STUDIO_GITHUB_READ_TOKEN` | Contents: read, Metadata: read, Pull requests: read, on brand repositories |
| Provision | `STUDIO_GITHUB_PROVISION_TOKEN` | Administration: write (create from template; delete a partial repository), Contents: write, on the allowlisted destination; read access to the template |

The template repository must be marked as a template on GitHub (see README, "Mark this repository as a template"). If the provisioning credential cannot delete repositories, a failed creation is recorded as *cleanup required* and Studio tells you which repository to remove.

### Registering an existing brand repository

Brands created before Studio can be added from the server, not the browser:

```bash
npm run studio -- register --slug acme --repo your-account/acme --name "Acme" [--profile personal-brand]
npm run studio -- brands
npm run studio -- unregister --slug acme   # removes the mapping only; GitHub is not touched
```

The repository must be private and reachable with the read credential, and its `brand.slug` must match.

### Webhook (optional)

Add a repository or organization webhook for push events to `https://<studio-origin>/webhooks/github` with content type `application/json` and the secret in `STUDIO_GITHUB_WEBHOOK_SECRET`.

## Private repository access for Claude Code

A repository URL is not permission. Claude Code can read a private brand repository only if you give it access, for example:

- Clone it yourself (`git clone https://github.com/<owner>/<repo>.git`) and open the folder in Claude Code, or
- authenticate the GitHub CLI (`gh auth login`) or an owner-approved GitHub connection in the environment where Claude Code runs.

The starter prompt tells Claude Code to stop and ask for access rather than guess. Never paste a GitHub token, the approval secret or `BRAND_OS_DATA_KEY` into a chat.

## Template updates

Each brand repository is an independent copy made from the template at creation time. Engine improvements to the template do not flow into existing brand repositories automatically. To upgrade a brand, merge or cherry-pick the template changes into its repository in Claude Code and run `npm run brand:migrate` there, then merge as usual; Studio shows the result after refresh.

## Tests

All GitHub traffic is an in-memory fake at the HTTP level (`tests/helpers/fake-github.ts`), which refuses any non-GitHub host; no test reaches the network or creates a real repository.

- `tests/studio-github.test.ts`: client retries and redaction, tar safety, redirect handling, webhook signatures.
- `tests/studio-provision.test.ts`: creation, personal profile, validation, duplicates, concurrent create, retry, partial-create cleanup, public-repository refusal, missing template, interrupted jobs.
- `tests/studio-sync.test.ts`: merged-branch projection, edits made outside Studio, stale cache, cross-brand refusal, recreated repositories, concurrent refresh, credential guard.
- `tests/studio-server.test.ts`: guest isolation, sign-in, the full owner journey, personal and mascot-free brands, forged slugs, no mutation endpoints, CSRF/Origin, wizard errors and GitHub failure with retry, stale and failed sync, webhooks, headers and static-bundle leaks, locales, sessions, configuration.
- `tests/studio-browser.test.ts`: real headless Chrome over the DevTools protocol (no npm dependency). Owner journey with the progressive wizard and provisioning polling, every page at 1440/1024/390 px without horizontal overflow, static accessibility checks, keyboard (skip link, focus ring, mobile drawer with Escape and focus return), Persian RTL mirroring with LTR code, Turkish LTR, CSP enforcement and no third-party requests. These run inside `npm test` when Chrome is installed (`CHROME_PATH` or the usual paths) and **skip with a message when it is not**. `npm run test:e2e` requires a browser and fails without one. `STUDIO_E2E_SCREENSHOTS=<dir>` saves desktop/tablet/mobile screenshots in English and Persian for visual review.

## Known limits

- One owner account. No SSO or multi-user roles.
- Sessions and rate limits live in memory, so a restart signs the owner out. The registry and sync cache persist in `STUDIO_DATA_DIR`.
- Interview question text and module guidance inside brand documents are English unless the brand repository has localized them; Studio's own interface is fully localized in en, fa and tr.
- Font specimens use a family only if it is installed on the viewing device; Studio loads no font files.
- Deployment to the VPS (reverse proxy, TLS, process supervision, DNS for `studio.omidataei.com`) is Phase 10 and not part of this change.
