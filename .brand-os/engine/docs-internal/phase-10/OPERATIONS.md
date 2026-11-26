# Operations: Brand OS Studio on the VPS

Day-2 procedures. Install, upgrade and rollback commands are in `DEPLOY.md`. Names and paths are in `DEPLOYMENT_CONTRACT.md`. All commands run as root in `/opt/brand-os-studio` unless noted.

## Daily signals

| Signal | Command | Healthy |
| --- | --- | --- |
| Container health | `docker inspect -f '{{.State.Health.Status}}' brand-os-studio-studio-1` | `healthy` |
| Public health | `curl -sS https://studio.omidataei.com/healthz` | `ok` |
| Recent errors | `docker compose logs --since 24h studio \| grep -E 'error\|failed\|rejected'` | Few or none. Repeated `login failed from <ip>` means someone is guessing. |
| Restarts | `docker inspect -f '{{.RestartCount}}' brand-os-studio-studio-1` | Stable |
| Memory | `docker stats --no-stream brand-os-studio-studio-1` | Well under 512 MiB |
| Backups | `tail -3 /var/log/brand-os-studio-backup.log; ls -1t backups \| head -3` | One archive per night |
| Certificate | `echo \| openssl s_client -connect studio.omidataei.com:443 -servername studio.omidataei.com 2>/dev/null \| openssl x509 -noout -enddate` | More than 20 days left (Caddy renews at about 30) |

Studio logs one line per notable event: sign-in ok or failed with the client IP, provisioning start, webhook pushes, refresh errors and start-up settings. It never logs secrets, tokens or brand content. Docker rotates logs at 10 MiB × 5.

For external monitoring (owner decision), point any HTTPS uptime checker at `https://studio.omidataei.com/healthz` and expect status 200 with body `ok`.

## Backup

- **What:** `data/` (registry = slug → repository mapping and provisioning records, plus the sync cache and previews). Transient `work*` directories are skipped.
- **When:** nightly via `/etc/cron.d/brand-os-studio-backup`, 14 kept, in `backups/` (mode 0700, archives 0600 with `.sha256`).
- **Not included, on purpose:** `.env` and `secrets/owner.env`. The owner keeps the GitHub tokens and the password in their password manager. `owner.env` can be recreated with `bootstrap-owner`, and tokens can be re-issued on GitHub. Brand content is in the brand repositories on GitHub, which have their own continuity (GitHub's own durability, plus optional mirrors chosen by the owner).
- **Off-host copy:** owner decision. For example, copy `backups/` to another host with `rsync` over SSH, or encrypt it with `age` before sending it anywhere.

## Restore drill (do after install, then monthly and after registry-touching upgrades)

```bash
A="$(ls -1t /opt/brand-os-studio/backups/studio-data-*.tar.gz | head -n1)"
D="$(mktemp -d)/data"
/opt/brand-os-studio/src/infra/production/restore.sh "$A" "$D"   # checksum ok, registry ok: N brand(s)
chown -R 1000:1000 "$D"
TAG="$(grep '^STUDIO_IMAGE_TAG=' /opt/brand-os-studio/.env | cut -d= -f2)"
docker run --rm --network none -v "$D:/data" "brand-os-studio:$TAG" node dist/cli.mjs brands
docker compose -f /opt/brand-os-studio/docker-compose.yml exec studio node dist/cli.mjs brands   # compare
rm -rf "$(dirname "$D")"
```

`restore.sh` refuses a non-empty target, a checksum mismatch, absolute or `..` paths, links and device files.

### Real restore

```bash
docker compose stop studio
mv data "data.before-restore-$(date -u +%Y%m%dT%H%M%SZ)"
src/infra/production/restore.sh backups/<archive>.tar.gz data
chown -R 1000:1000 data && chmod 0700 data
docker compose up -d && src/infra/production/smoke-test.sh --base http://172.18.0.1:8083 --host studio.omidataei.com --expect-https
```

The sync cache refreshes from GitHub on the next view. Brands created after the backup are missing from the registry, but their repositories still exist on GitHub. Re-add them with `register` (below).

## Registering and unregistering brands (server-side only)

```bash
docker compose exec studio node dist/cli.mjs brands
docker compose exec studio node dist/cli.mjs register --slug <slug> --repo <owner/name> --name "<Name>" [--profile personal-brand]
docker compose exec studio node dist/cli.mjs unregister --slug <slug>       # removes the mapping only; GitHub untouched
```

`register` refuses public repositories and repositories the read token cannot see. On first view, the repository's `brand.slug` must match.

## Credential rotation

| Credential | When | How | Effect |
| --- | --- | --- | --- |
| Owner password | Suspected exposure, or periodically | Owner runs `bootstrap-owner --force` (step 6 of `GROK_HANDOFF.md`, with `--force`), then `docker compose up -d` | Rotates password hash, TOTP key and session secret together. The owner re-enrolls the authenticator, and all sessions end. |
| Session secret only | Suspected session theft | See the snippet below the table, then `docker compose up -d` | All sessions end. Note that any restart already ends sessions. |
| GitHub read token | Expiry (set one), or exposure | Create the new token, put it in `.env`, `docker compose up -d`, Account → Test connection, then revoke the old token on GitHub | Sync continues from the cached state in the meantime |
| GitHub provision token | Expiry, exposure, or after a burst of brand creation | Same as above. Consider removing it from `.env` entirely when no new brands are planned (the wizard then says "not configured"). | No effect on existing brands |
| Webhook secret | Exposure | New `openssl rand -hex 32` in `.env` and in the GitHub webhook settings, then `docker compose up -d` | Unsigned or old-signature deliveries get 401. Polling still works. |

Rotate only the session secret (the new value goes straight into the file and is never displayed):

```bash
NEW="$(docker run --rm --network none brand-os-studio:<tag> node dist/cli.mjs session-secret)"
sed -i "s|^STUDIO_SESSION_SECRET=.*|STUDIO_SESSION_SECRET='$NEW'|" secrets/owner.env && unset NEW
docker compose up -d
```

Give tokens an expiry on GitHub and put the renewal date in the owner's calendar.

## Security checks (monthly, or after any change)

```bash
src/infra/production/smoke-test.sh --http-redirect                                    # public
src/infra/production/smoke-test.sh --base http://172.18.0.1:8083 --host studio.omidataei.com --expect-https
ss -ltnp | grep -E ':8083|:4100'                                                      # only 172.18.0.1:8083
docker inspect -f '{{.Config.User}} {{.HostConfig.ReadonlyRootfs}} {{.HostConfig.Memory}}' brand-os-studio-studio-1   # node true 536870912
ls -ld .env secrets secrets/owner.env data backups                                    # 600 / 700 / 600 / 700 (1000) / 700
```

Review GitHub's security log for the token owner, and the destination's audit log, for unexpected repository creation or deletion.

## Incident response

| Situation | Immediate action | Then |
| --- | --- | --- |
| GitHub token exposed | Revoke it on GitHub now | Issue a new one (rotation table), check the GitHub audit log for repositories created or deleted, report to the owner |
| Owner password or TOTP exposed | `bootstrap-owner --force` with the owner, then `docker compose up -d` | Review `login ok` and `login failed` lines in the logs |
| Owner locked out by the global sign-in limit (30 failures in 15 min) | `docker compose restart studio` clears the in-memory counters | Check the logs for the source IPs. Consider a Caddy-level block (`@blocked remote_ip ...` → `abort`) for persistent abuse. |
| Unexpected brand or repository | `docker compose exec studio node dist/cli.mjs brands`, and check the GitHub audit log | `unregister` if the mapping is wrong. The owner decides about the GitHub repository. |
| Studio misbehaving or suspected compromise | Take it off the Internet: `DEPLOY.md` section D (restore the Caddy block backup, reload), `docker compose stop studio` | Keep `data/` and the logs for analysis, rotate every credential, redeploy a reviewed commit |
| Certificate not renewing | `docker logs financebot-caddy-1 \| grep -i studio.omidataei.com` | Check that the DNS A record is still DNS-only and points at the VPS, and that ports 80/443 are reachable |
| Edge Caddy reload broke other sites | Restore the Caddyfile backup with `cp`, then validate and reload | Report. Never leave other sites degraded to keep Studio up. |

## What operations must never do

Run `docker compose down -v`; delete `data/` or `backups/`; edit brand facts or repositories on behalf of Studio (Studio is read-only after creation); give Claude Code or anyone else Studio's tokens; expose port 8083 or 4100 publicly; serve the Docusaurus build from this host as a replacement.
