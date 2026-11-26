# Phase 10 deployment contract

What the Studio container needs and guarantees. This file contains names, ports and commands only. It never contains secret values. Step-by-step procedures are in `DEPLOY.md` (any deploy or upgrade) and `GROK_HANDOFF.md` (first launch).

## Identity

| Item | Value |
| --- | --- |
| Public URL | `https://studio.omidataei.com` (one Studio; brands at `/brands/<slug>`) |
| DNS | `A studio.omidataei.com → 217.65.145.161`, Cloudflare DNS-only (already exists; no AAAA) |
| TLS | Existing edge Caddy (`financebot-caddy-1`), automatic Let's Encrypt |
| Install directory | `/opt/brand-os-studio` |
| Compose project | `brand-os-studio` (container `brand-os-studio-studio-1`) |
| Image | `brand-os-studio:<12-char commit SHA>`, built from the reviewed commit, label `org.opencontainers.image.revision=<full SHA>` |
| Base image | `node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54` |

## Ports

| Where | Address | Notes |
| --- | --- | --- |
| Container | `0.0.0.0:4100` | Inside the container network namespace only |
| Host | `172.18.0.1:8083` | Gateway of `financebot_default`; reachable from containers, not from the Internet |
| Public | `443` (and `80` → redirect) | Owned by the edge Caddy; site block `infra/production/Caddyfile.studio` |

Nothing binds `0.0.0.0` on the host. Port `8083` was verified free on 2026-11-21.

## Health

| Check | Contract |
| --- | --- |
| `GET /healthz` | No auth, any Host. `200 ok` = process up and `/data` writable. `503 unavailable` otherwise. Body has no other information. |
| Docker `HEALTHCHECK` | `node -e fetch('http://127.0.0.1:4100/healthz')` every 30 s, timeout 5 s, 3 retries, start period 20 s |
| Startup log | `listening on http://0.0.0.0:4100 (public origin https://studio.omidataei.com)` and `build revision <full SHA>` |
| Smoke test | `infra/production/smoke-test.sh` (anonymous, read-only). It exits 0 only if every check passes. |

## Environment variables

`/opt/brand-os-studio/.env` (template `infra/production/.env.example`, mode 0600, owner root):

| Variable | Required | Meaning |
| --- | --- | --- |
| `STUDIO_IMAGE_TAG` | yes | 12-char short SHA of the reviewed commit. Compose refuses to start without it. |
| `STUDIO_BUILD_REVISION` | yes | Full SHA. Image label and startup log. |
| `STUDIO_PUBLIC_ORIGIN` | yes | `https://studio.omidataei.com`. Used for the Origin/CSRF check, the Host allowlist and Secure `__Host-` cookies. |
| `STUDIO_SESSION_HOURS` | no (12) | Absolute session lifetime, 1–168 |
| `STUDIO_IDLE_MINUTES` | no (60) | Idle timeout, 5–1440 |
| `STUDIO_GITHUB_READ_TOKEN` | for brand pages | Read credential. Without it, brand pages cannot sync. |
| `STUDIO_GITHUB_PROVISION_TOKEN` | for New Brand | Provisioning credential. Without it, the wizard says "not configured". |
| `STUDIO_ALLOWED_OWNERS` | with provision token | Comma-separated GitHub accounts or organizations where repositories may be created |
| `STUDIO_TEMPLATE_REPO` | no (`omidlog/brand-os-template`) | Template repository (`owner/name`, marked as template) |
| `STUDIO_GITHUB_WEBHOOK_SECRET` | no | 20+ characters. Enables `POST /webhooks/github`. |
| `STUDIO_SYNC_TTL_SECONDS` | no (300) | Refresh-on-view age, 15–86400 |

`/opt/brand-os-studio/secrets/owner.env` (written by `studio bootstrap-owner`, mode 0600, values single-quoted):

| Variable | Meaning |
| --- | --- |
| `STUDIO_OWNER_LOGIN` | Owner sign-in name |
| `STUDIO_OWNER_PASSWORD_HASH` | scrypt hash (`scrypt$N$r$p$salt$hash`); the password itself is never stored |
| `STUDIO_OWNER_TOTP_SECRET` | Base32 TOTP key (required beyond loopback) |
| `STUDIO_SESSION_SECRET` | 32 random bytes, base64. Rotating it signs the owner out. |

Fixed in `docker-compose.yml` (these override the env files): `STUDIO_HOST=0.0.0.0`, `STUDIO_PORT=4100`, `STUDIO_DATA_DIR=/data`, `STUDIO_TRUST_PROXY=1`.

Studio exits at start-up when a required value is missing or unsafe: http origin beyond loopback, no TOTP beyond loopback, short session secret, provision token without allowed owners, invalid names. The error names the variable, never the value.

## Files and permissions on the host

| Path | Owner / mode | Content |
| --- | --- | --- |
| `/opt/brand-os-studio/docker-compose.yml` | root 0644 | Copy of `infra/production/docker-compose.yml` from the reviewed commit |
| `/opt/brand-os-studio/.env` | root 0600 | Settings and GitHub credentials |
| `/opt/brand-os-studio/secrets/` | root 0700 | `owner.env` (root 0600) |
| `/opt/brand-os-studio/src/` | root | Git checkout of the reviewed commit (build context) |
| `/opt/brand-os-studio/data/` | 1000:1000 0700 | Studio state (`/data`) |
| `/opt/brand-os-studio/backups/` | root 0700 | `backup.sh` output |
| `/root/financebot/Caddyfile` | unchanged owner | Gets one appended site block. Back it up first. |

## Resource limits

`mem_limit 512m` (no swap), Node heap capped at 320 MiB, `cpus 1.0`, `pids_limit 256`, read-only root filesystem, tmpfs `/tmp` 64 MiB, `cap_drop: ALL`, `no-new-privileges`, `init: true`, json-file logs 10 MiB × 5.

## Commands

All of these run on the host from `/opt/brand-os-studio`. `<tag>` is `STUDIO_IMAGE_TAG`.

| Purpose | Command |
| --- | --- |
| Build | `docker compose build` |
| Owner bootstrap (owner at the keyboard) | `docker run --rm -it --network none --user 1000:1000 -v "$PWD/secrets:/out" brand-os-studio:<tag> node dist/cli.mjs bootstrap-owner --login <login> --out /out/owner.env` |
| Validate configuration | `docker compose run --rm --no-deps studio node dist/cli.mjs check-config` |
| Start / update | `docker compose up -d` |
| Status | `docker compose ps`, `docker inspect -f '{{.State.Health.Status}}' brand-os-studio-studio-1` |
| Logs | `docker compose logs --tail 100 studio` |
| List brands | `docker compose exec studio node dist/cli.mjs brands` |
| Register an existing private brand repo | `docker compose exec studio node dist/cli.mjs register --slug <slug> --repo <owner/name> --name "<Name>" [--profile personal-brand]` |
| Backup | `src/infra/production/backup.sh` |
| Restore (verify first) | `src/infra/production/restore.sh <archive> <empty dir>` |
| Smoke (upstream) | `src/infra/production/smoke-test.sh --base http://172.18.0.1:8083 --host studio.omidataei.com --expect-https` |
| Smoke (public) | `src/infra/production/smoke-test.sh --http-redirect` |

## Upgrade contract

- The registry has `schema_version: 1`. A newer image that changes it must migrate on read and say so in its changelog. The sync cache is disposable: deleting `data/cache` only forces fresh reads from GitHub.
- Upgrades are image swaps: check out the new reviewed commit, set `STUDIO_IMAGE_TAG` and `STUDIO_BUILD_REVISION`, `docker compose build`, `docker compose up -d`. A restart signs the owner out (in-memory sessions).
- Rollback is setting the previous tag and running `docker compose up -d --no-build`. Keep at least the previous image (`docker image ls brand-os-studio`). Do not run `docker image prune -a` without checking.

## Roles and prerequisites

| Role | Does | Never |
| --- | --- | --- |
| Owner | Approves the deploy and the Caddyfile change; runs `bootstrap-owner` (or does it locally and copies the file); creates GitHub tokens and enters them on the server; authorizes the live test repository; merges brand PRs; runs brand approvals with the local CLI | Pastes passwords, TOTP keys, tokens or the approval secret into a chat, issue or log |
| Launch operator (Grok Bot) | VPS layout, build, Compose, Caddy block, TLS check, smoke tests, backup cron, restore drill, report | Changes app code or behavior, creates brands or test repos without owner authorization, edits other apps or DNS records, runs `down -v`, deletes backups |
| Claude Code | Edits brand repositories in separate authorized sessions (`CLAUDE_EDITING_WORKFLOW.md`) | Receives Studio credentials, the approval secret or VPS access |

Secrets prerequisites before go-live: the owner password (chosen by the owner) and an authenticator app; the read token; optionally the provisioning token and allowed owners; optionally the webhook secret (`openssl rand -hex 32` on the server).
