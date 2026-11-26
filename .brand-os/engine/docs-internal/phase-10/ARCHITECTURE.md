# Phase 10 architecture: read-only Studio on the shared VPS

Product model (owner decision, `00_READ_ME_FIRST`): Studio **creates** one private GitHub repository per brand and then **reads** each brand's merged default branch. Claude Code, in a separate session with its own authorized checkout, does all editing. Studio has no chat, AI, editing, approval, publication, upload, Git write (beyond creating a new repository) or command execution. Product and screen details: `docs-internal/STUDIO.md`.

## Delta from Phase 9

| | Phase 9 (done) | Phase 10 prep (this branch) |
| --- | --- | --- |
| App | Read-only Studio, provisioning, sync, webhook, en/fa/tr, 48 tests | Proxy hardening (rightmost XFF, Host allowlist, health readiness, keep-alive), `bootstrap-owner`, `check-config` |
| Build | `tsx` from source | `npm run studio:build`: one esbuild bundle per entry point (server, CLI) |
| Runtime | Local `127.0.0.1:4100` | Container: non-root, read-only root filesystem, `/data` volume, published only on `172.18.0.1:8083` |
| Proxy | n/a | Site block for the existing edge Caddy (no second proxy, no Traefik) |
| Ops | n/a | Smoke test, backup, restore drill, CI image workflow, runbooks |

### No-go items (explicitly not built)

In-Studio chat, AI or Claude integration; interview UI; fact, document or asset editing or upload; approve and publish controls; commit, push, merge or revert UI; agent-token issuance; terminal or command execution; generic GitHub API proxy; fetching arbitrary URLs; per-brand subdomains; public static export of the internal Docusaurus build; Vercel; a second reverse proxy; Traefik.

## Topology on the VPS (verified facts, 2026-11-21)

```text
Owner browser (desktop / iPhone)
   │ HTTPS 443 (HTTP 80 is redirected to HTTPS by Caddy, 308)
   ▼
financebot-caddy-1  (caddy:2-alpine 2.11.2, owns host 80/443, /root/financebot/Caddyfile,
   │                 automatic Let's Encrypt; network financebot_default 172.18.0.0/16)
   │ site block studio.omidataei.com → reverse_proxy 172.18.0.1:8083   (plain HTTP, Host kept,
   │                                                                     X-Forwarded-For set)
   ▼
172.18.0.1:8083 (docker-published, gateway address only; not 0.0.0.0)
   ▼
brand-os-studio-studio-1  (/opt/brand-os-studio, image brand-os-studio:<commit>)
   node /app/dist/main.mjs on 0.0.0.0:4100 inside the container, user node (uid 1000)
   ├── /data            bind mount ./data  (registry, sync cache)          persistent
   ├── /tmp             tmpfs 64 MiB                                        ephemeral
   └── / (read-only)    image: dist/main.mjs, dist/cli.mjs, static/
   │
   │ HTTPS to api.github.com and codeload.github.com only (no other egress needed)
   ▼
GitHub: omidlog/brand-os-template (private, marked template)  +  one private repo per brand
   ▲
   │ git clone / push / PR, with its own GitHub authorization (never Studio's tokens)
Claude Code (separate computer or session): interview, edit, validate, commit, PR.
The owner merges on GitHub. Studio refreshes on Refresh, on view after the TTL, or via signed webhook.
```

Other apps on the host (financebot, fundup, tradeplatform, pilito) are untouched. The only shared change is appending one site block to the edge Caddyfile.

## Service boundaries (source)

```text
apps/studio/src/
  main.ts          process: config → services → listener; SIGTERM drains provisioning and sync
  listen.ts        HTTP server timeouts suited to one reverse proxy
  config.ts        environment → typed config; fails closed; never echoes values
  server.ts        route table (complete list), auth, CSRF/Origin, Host allowlist, headers
  auth/            scrypt password, TOTP, server-side sessions, fixed-window rate limits
  views/           server-rendered, escaped HTML; static CSS and JS only (no data)
  registry.ts      slug → repository mapping (data dir; the only selector of a repository)
  sync.ts          merged default branch → safe projection cache (read credential)
  projection.ts    brand-core functions at the internal audience + credential guard
  provision.ts     the single write: create private repo from template + one initial commit
  github/          REST client (redaction, retries), safe tar extraction, webhook HMAC
  cli.ts           owner server commands: bootstrap-owner, check-config, register, brands, ...
```

## Source of truth

```text
GitHub default branch of brand repo (canonical, merged)
        │ read credential: GET repo, GET branch head, GET tarball of that SHA
        ▼
temporary checkout under /data/work-sync-*  (only allowlisted brand/ files; .private, restricted,
        │                                   links, traversal refused; deleted after use)
        ▼
brand-core: dashboard, document model, token hashes, asset inspection (internal audience)
        │ credential guard refuses anything that looks like a secret
        ▼
/data/cache/<slug>/state.json + previews/<sha256>   (projection, SHA, times, last error)
        ▼
authenticated, escaped HTML views
```

Studio keeps no shadow brand ledger. Unmerged pull requests are listed only as non-canonical history. Ignored local files (`brand/.private`, decrypted restricted facts) never exist on the server, so they appear as withheld.

## Storage (`/opt/brand-os-studio/data` → `/data`, uid 1000, mode 0700)

| Path | Content | Backed up |
| --- | --- | --- |
| `registry.json` | Slug → repository mapping (owner, name, GitHub id, default branch), provisioning records | Yes |
| `cache/<slug>/state.json` | Last projection, SHA, sync times, last error | Yes (rebuildable from GitHub) |
| `cache/<slug>/previews/` | Approved, checksum-verified preview images | Yes (rebuildable) |
| `work/`, `work-sync-*` | Temporary checkouts during provisioning or sync | No |

Sessions, rate-limit counters and webhook delivery ids are in memory by design.

## Access control

- Every route except `/healthz`, `/static/*`, `/login` and the signed webhook requires a server-side session. Guests get the same redirect or 401 for real and invented slugs.
- Brand routes resolve the slug only through the registry. A repository is accepted only if its GitHub id matches the registered one and its `brand.slug` matches.
- Authenticated POSTs need the session CSRF token and a same-origin `Origin`. Only form bodies are accepted.
- Beyond loopback, only the public hostname is served (`421` otherwise).
- The browser never receives a token, raw tree, `.private` value or restricted value.

## GitHub permission model

There are two credentials, so the powerful one is used as little as possible:

| Variable | Used by | Needs (expected; confirm live, see below) |
| --- | --- | --- |
| `STUDIO_GITHUB_READ_TOKEN` | sync, Account "Test connection", `studio register` | Read access to every brand repository: Contents read, Metadata read, Pull requests read |
| `STUDIO_GITHUB_PROVISION_TOKEN` | New Brand wizard only | Read access to the template; create a repository in the allowlisted owner (Administration write); write the one initial commit (Contents write); optionally delete a failed partial repository (Administration write) |

Studio limits what the provisioning credential can be used for: only `STUDIO_ALLOWED_OWNERS` destinations, only the configured template, refusal of existing names, privacy verification after creation (a public result is deleted and never registered), and per-slug locks. Studio cannot limit what a stolen token could do elsewhere, so the token itself must be scoped.

**Verified fact:** `omidlog/brand-os-template` is **private** and marked as a template (read via `gh repo view`, 2026-11-21). The provisioning credential must therefore be able to read a private repository in the `omidlog` account.

**Not verified in this session:** GitHub's current documentation was not reachable from the build environment. These points must be confirmed during launch with the owner-authorized test repository:

1. Which token type works for "create a repository using a template" from a private template: a fine-grained PAT, a GitHub App installation token, or a classic PAT.
2. Whether a fine-grained PAT limited to "Only select repositories" can create new repositories, or needs "All repositories" for its resource owner. If it needs "All repositories", that grant also covers every existing repository of that owner.
3. Whether one fine-grained PAT can read a template in a personal account and create in an organization. Fine-grained PATs are understood to have a single resource owner.

**Recommendation (owner decision, see `GROK_HANDOFF.md`):** keep brand repositories, and ideally a copy of the template, under a dedicated GitHub organization used only for brands. Then scope both tokens (or one GitHub App installation) to that organization. That keeps unrelated repositories (for example Pilito) out of the provisioning credential's reach. If the owner instead creates brands in the personal `omidlog` account, the provisioning credential will probably have administration rights on every repository in that account. That must be an explicit, informed choice.

## Refresh: webhook and polling

- **Polling:** a brand page older than `STUDIO_SYNC_TTL_SECONDS` (default 300) starts a background refresh. The page shows the last good commit and a stale badge.
- **Manual:** the Refresh button reads the branch head and returns synced, failed or too-soon (1 per 5 s per brand).
- **Webhook (optional):** a push to the default branch, with a valid `X-Hub-Signature-256` (HMAC-SHA256, constant-time compare, 1 MiB cap), marks the cache dirty. Studio then fetches the branch itself. The payload is only a hint, and duplicate delivery ids are ignored.

## Failure behavior

| Failure | Behavior |
| --- | --- |
| GitHub unreachable or token revoked | The last good projection stays visible with "refresh failed" and the error. Nothing is written. |
| Repository deleted or recreated under the same name | Refused (the GitHub id differs). The brand shows an error. |
| Provisioning fails midway | The partial repository is deleted if permitted. Otherwise it is recorded as *cleanup required*, and retry resumes. |
| Data dir not writable | `/healthz` → 503, Docker marks the container unhealthy, and `restart: unless-stopped` does not mask it (the health state is visible). |
| Container restart | Registry and cache persist. The owner signs in again. |
| Missing or unsafe configuration | The process exits at start-up with variable names (never values). Docker restarts it and the logs show why. |
