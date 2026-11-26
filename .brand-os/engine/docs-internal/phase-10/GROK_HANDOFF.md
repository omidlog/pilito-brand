# Grok handoff: launch Brand OS Studio at studio.omidataei.com

**From:** Claude Code (Phase 10 prep). **To:** Grok Bot (launch operator). **Status of this document:** a tested application package and a launch plan. **Nothing has been deployed.** No VPS, DNS, Caddy or GitHub change was made by Claude, and no real repository was created.

Read first: `ARCHITECTURE.md`, `DEPLOYMENT_CONTRACT.md`, `SECURITY_REVIEW.md`, `OPERATIONS.md`. The generic runbook is `DEPLOY.md`. This file is the first launch, with the exact sequence, stop points and report.

## 1. What you deploy

- **Immutable version:** the head commit of the reviewed Phase 10 pull request (branch `feat/phase-10-prep`, stacked on Phase 9 PR #4). Take the full SHA from the PR **after** the owner has approved it for deployment. Do not deploy an unreviewed commit, a branch name or `main` by assumption. Below, `<SHA>` is that full SHA and `<TAG>` is its first 12 characters.
- **Artifact:** the image is built on the VPS from that commit with `infra/production/Dockerfile` (base pinned by digest). The image is `brand-os-studio:<TAG>`, with label `org.opencontainers.image.revision=<SHA>`.
- **Verified before handoff** (in Claude's environment, on this branch):
  - `npm run ci` passes (lint, typecheck, validate, all tests, docs builds).
  - The production bundle runs exactly as in the container and passes `smoke-test.sh`.
  - A real Caddy 2.11.2 validates the site block without warnings. The bundle served behind that Caddy passes the smoke test.
  - Real-browser tests behind TLS cover Secure `__Host-` cookies, CSRF from same-site and cross-site origins, CORS and framing blocks, and the foreign-Host refusal.
- **Not verified before handoff:**
  - The Docker image build itself (no Docker in Claude's environment). `.github/workflows/studio-image.yml` covers it on the PR. **Check that this workflow is green on `<SHA>` before you start.**
  - Real GitHub. All GitHub behavior is tested against an in-memory fake.

Expected behavior after launch: owner sign-in (password + TOTP); an empty brand list until the owner creates a brand; New Brand creates one private repository from the template; read-only brand pages; copy repository URL and starter prompt. No chat, AI, editing, approval or publish controls, uploads or Git actions. If anything else appears, or the app is missing, **BLOCK**.

## 2. Stop points: ask the owner, do not proceed alone

| # | Needs explicit owner action or approval |
| --- | --- |
| S1 | Deploy approval for `<SHA>`, and the green `studio-image` workflow on that commit |
| S2 | GitHub decisions (section 6): destination account or organization, token type, scopes. The owner creates tokens and enters them on the server. Without a read token Studio can only show an empty list, so you must report "provisioning blocked". |
| S3 | Owner bootstrap: the owner types their password and confirms the authenticator (step 6) |
| S4 | The change to the shared `/root/financebot/Caddyfile` (step 9) |
| S5 | Creating a live **test** brand repository (step 12) |
| S6 | The separate Claude Code edit → merge → Refresh check (step 12) |

Never paste or ask for passwords, TOTP keys, tokens or the brand approval secret in a chat, issue or log. Never run `docker compose down -v`, delete backups, touch other apps' files, change DNS records (the A record already exists), or pre-create Pilito, Fiko or personal brands.

## 3. Exact launch sequence

Run as root on the VPS. Stop at the first unexpected result and report it.

**Step 1: preflight (read-only).**

```bash
docker version --format '{{.Server.Version}}'; docker compose version          # 29.x, v5.x
ip -4 addr | grep -w 172.18.0.1
ss -ltn | grep -q '172.18.0.1:8083' && echo "8083 BUSY - STOP" || echo "8083 free"
docker ps --format '{{.Names}}\t{{.Status}}' | grep financebot-caddy-1
free -m; df -h /
dig +short studio.omidataei.com @1.1.1.1                                        # 217.65.145.161
```

**Step 2: baseline of the other sites** (repeat after step 10 and compare).

```bash
for h in xfiv.com trade.xfiv.com client.xfiv.com fundupclub.com api.pilito.com ofai.net; do
  printf '%-18s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done | tee /root/brand-os-studio-baseline-$(date -u +%Y%m%d).txt
```

**Step 3: layout and source** (S1 done).

```bash
install -d -m 0755 /opt/brand-os-studio
install -d -m 0700 /opt/brand-os-studio/secrets /opt/brand-os-studio/backups
install -d -m 0700 -o 1000 -g 1000 /opt/brand-os-studio/data
cd /opt/brand-os-studio
git clone https://github.com/omidlog/brand-os-template.git src     # private: use your authorized access
git -C src checkout --detach <SHA>
test "$(git -C src rev-parse HEAD)" = "<SHA>" && git -C src status --porcelain | wc -l   # 0
cp src/infra/production/docker-compose.yml ./docker-compose.yml
install -m 0600 src/infra/production/.env.example ./.env
```

**Step 4: settings** (S2). Edit `/opt/brand-os-studio/.env` on the server:

- `STUDIO_IMAGE_TAG=<TAG>` and `STUDIO_BUILD_REVISION=<SHA>`.
- Keep `STUDIO_PUBLIC_ORIGIN=https://studio.omidataei.com`.
- The owner enters `STUDIO_GITHUB_READ_TOKEN`, and, if approved, `STUDIO_GITHUB_PROVISION_TOKEN` and `STUDIO_ALLOWED_OWNERS`, directly on the server.
- Optional webhook: `sed -i "s/^STUDIO_GITHUB_WEBHOOK_SECRET=.*/STUDIO_GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 32)/" .env` (`sed -i` is fine here: `.env` is not bind-mounted).

**Step 5: build.**

```bash
docker compose build
docker image inspect -f '{{.Config.User}} {{index .Config.Labels "org.opencontainers.image.revision"}}' brand-os-studio:<TAG>
# expect: node <SHA>
```

**Step 6: owner bootstrap** (S3, with the owner at the keyboard over SSH, or the owner runs it themselves).

```bash
cd /opt/brand-os-studio && chown 1000:1000 secrets
docker run --rm -it --network none --user 1000:1000 -v "$PWD/secrets:/out" \
  brand-os-studio:<TAG> node dist/cli.mjs bootstrap-owner --login <owner-login> --out /out/owner.env
chown -R root:root secrets && chmod 0700 secrets && chmod 0600 secrets/owner.env
```

The owner chooses the password (12+ characters, typed twice). The authenticator key and URI appear only on that terminal; the owner adds them to their app and types the current code. Nothing is written unless the code is valid. If the owner prefers, they run `npm run studio -- bootstrap-owner --login <owner-login> --out owner.env` in their own checkout and copy the file to `secrets/owner.env` (mode 0600). You never see the password or the key.

**Step 7: validate, start, upstream smoke.**

```bash
docker compose run --rm --no-deps studio node dist/cli.mjs check-config      # "Configuration OK."
docker compose up -d
for i in $(seq 1 30); do [ "$(docker inspect -f '{{.State.Health.Status}}' brand-os-studio-studio-1)" = healthy ] && break; sleep 2; done
docker compose ps
docker compose logs --tail 20 studio            # "listening on http://0.0.0.0:4100 ...", "build revision <SHA>"
ss -ltnp | grep 8083                            # 172.18.0.1:8083 only
src/infra/production/smoke-test.sh --base http://172.18.0.1:8083 --host studio.omidataei.com --expect-https
# expect: "Summary: N passed, 0 failed"
```

**Step 8: first backup.**

```bash
src/infra/production/backup.sh
```

**Step 9: edge Caddy** (S4: back up, append, validate, reload).

```bash
CF=/root/financebot/Caddyfile
BK="$CF.bak-$(date -u +%Y%m%dT%H%M%SZ)"; cp -a "$CF" "$BK"; echo "backup: $BK"
grep -q 'studio.omidataei.com' "$CF" && echo "ALREADY PRESENT - STOP" || {
  printf '\n' >> "$CF"; cat /opt/brand-os-studio/src/infra/production/Caddyfile.studio >> "$CF"; }
docker exec financebot-caddy-1 grep -c 'studio.omidataei.com' /etc/caddy/Caddyfile     # >= 1
docker exec financebot-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
# Only if "Valid configuration":
docker exec financebot-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
# If invalid: cp "$BK" "$CF"; validate again; STOP and report.
```

The Caddyfile is a single-file bind mount. Change it only with `>>` or `cp`, never with `sed -i`, `mv` or an editor that replaces the file.

**Step 10: TLS, public smoke, other sites.**

```bash
sleep 20; docker logs --since 5m financebot-caddy-1 2>&1 | grep -i 'studio.omidataei.com' | tail -5
curl -sS https://studio.omidataei.com/healthz                                  # ok
echo | openssl s_client -connect studio.omidataei.com:443 -servername studio.omidataei.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates                                # Let's Encrypt, valid dates
/opt/brand-os-studio/src/infra/production/smoke-test.sh --http-redirect         # 0 failed
for h in xfiv.com trade.xfiv.com client.xfiv.com fundupclub.com api.pilito.com ofai.net; do
  printf '%-18s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done | diff /root/brand-os-studio-baseline-$(date -u +%Y%m%d).txt - && echo "other sites unchanged"
```

**Step 11: backup cron and restore drill.**

```bash
cat > /etc/cron.d/brand-os-studio-backup <<'EOF'
17 3 * * * root /opt/brand-os-studio/src/infra/production/backup.sh --keep 14 >> /var/log/brand-os-studio-backup.log 2>&1
EOF
chmod 0644 /etc/cron.d/brand-os-studio-backup
A="$(ls -1t /opt/brand-os-studio/backups/studio-data-*.tar.gz | head -n1)"
D="$(mktemp -d)/data"
/opt/brand-os-studio/src/infra/production/restore.sh "$A" "$D" && chown -R 1000:1000 "$D"
docker run --rm --network none -v "$D:/data" brand-os-studio:<TAG> node dist/cli.mjs brands   # same list as live
rm -rf "$(dirname "$D")"
```

**Step 12: authenticated checks with the owner** (S5 and S6). Mark each item only when you have personally verified it.

- [ ] The owner signs in on desktop and on iPhone, then signs out. A second sign-in works.
- [ ] Anonymous `/brands/*`, `/api/*`, `/static/*.json` and asset URLs show nothing (the smoke test covers the anonymous part).
- [ ] An empty brand list shows the empty state. No invented brands or numbers.
- [ ] Account & GitHub shows MFA on, which credentials are configured (never their values), and "Test connection" names the expected GitHub account(s).
- [ ] With the owner's explicit go (S5): New Brand creates one **private** test repository (for example slug `studio-launch-test`). Check `gh api repos/<owner>/<repo> --jq '.private,.is_template'` gives `true false`. The initial files contain no `.env`, keys or approval secret. The slug is correct, and retrying or double-submitting does not create a second repository.
- [ ] Copy repository URL and Copy starter prompt work on desktop and iPhone. Without GitHub authorization, the URL alone does not open the private repository.
- [ ] (S6) In a separate authorized Claude Code session, the owner makes a harmless reviewed change in the test repository and merges it. Refresh in Studio shows the new short SHA and sync time.
- [ ] No editable forms, chat, approval or publish buttons, or upload anywhere.
- [ ] Changing the URL slug or repository yields 404 or the sign-in page, never another brand.
- [ ] `docker compose restart studio`: the brand is still listed after sign-in (sessions are in memory, so the owner signs in again).
- [ ] Optional webhook (if configured): a GitHub push webhook to `https://studio.omidataei.com/webhooks/github`, `application/json`, push events only. Its recent deliveries show `202`.

The test repository stays until the owner decides. Studio never deletes a ready repository.

## 4. Rollback

- **App problem, proxy fine:** set `.env` `STUDIO_IMAGE_TAG` and `STUDIO_BUILD_REVISION` to the previous reviewed commit (if any), `git -C src checkout --detach <previous SHA>`, then `docker compose up -d --no-build`.
- **Take Studio off the Internet:** `cp "$BK" /root/financebot/Caddyfile` (the backup from step 9; `cp` keeps the inode), then validate and reload as in step 9, then re-run the other-sites check from step 10. Then `cd /opt/brand-os-studio && docker compose down` (never `-v`). If the Caddyfile changed for other reasons after step 9, remove only the `studio.omidataei.com { ... }` block instead of restoring the whole backup.
- **Data problem:** see `DEPLOY.md` section C.
- After any rollback, report `ROLLED BACK` with the reason.

## 5. Report template (send to the owner)

```text
Status: LIVE / BLOCKED / ROLLED BACK
URL: https://studio.omidataei.com
App commit/tag and deployment strategy: <SHA> / brand-os-studio:<TAG>, Docker Compose at /opt/brand-os-studio, behind financebot-caddy-1
VPS and reverse-proxy status (no secrets):
DNS changes for studio subdomain only: none (A record pre-existing)
TLS certificate/renewal: issuer, notAfter; Caddy automatic renewal
Authentication method and secure owner enrollment: password + TOTP via bootstrap-owner (owner-run)
GitHub connection and allowed permission scopes (no tokens):
Brand repo provisioning: verified / blocked / mocked-only
Read-only viewing and refresh: verified / blocked
Separate Claude Code edit -> Git -> Studio refresh: verified / not tested
Last health check:
Backup schedule + last isolated restore:
Security checks passed/failed: smoke-test upstream N/0, public N/0, manual list
Other VPS applications checked: baseline diff result
Rollback path: Caddyfile backup <path>; previous image <tag or none>
Outstanding issues or owner action required:
```

## 6. Open owner decisions

1. **GitHub destination and token type** (blocks New Brand). The template `omidlog/brand-os-template` is **private**. Options:
   - (a) A dedicated GitHub organization for brand repositories (recommended). Move or copy the template into it, or use a token type that can read the personal template and create in the org. Scope the tokens or a GitHub App to that org.
   - (b) The personal `omidlog` account. Simplest, but the provisioning credential will probably hold administration rights over all of that account's repositories.
   
   GitHub's exact fine-grained token rules for template generation could not be checked from the build environment. Confirm them while creating the tokens, and prove them with the S5 test repository. See `ARCHITECTURE.md`, "GitHub permission model".
2. **Webhook or polling only.** Polling (5-minute TTL plus Refresh) works without any GitHub configuration.
3. **External uptime monitoring** of `https://studio.omidataei.com/healthz` (none exists on the VPS today).
4. **Off-host backup copy.** Backups are on the same VPS. Copying them elsewhere is an owner choice.
5. **The test repository** created at S5: keep it, archive it, or delete it (owner action on GitHub).
6. Unrelated to Studio but seen in discovery: `ufw` is inactive and tradeplatform's nginx listens on `0.0.0.0:8080`. Owner decision; do not change it as part of this launch.
