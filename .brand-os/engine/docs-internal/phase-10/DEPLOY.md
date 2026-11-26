# Deploy runbook: Brand OS Studio on the VPS

The general procedure for installing, upgrading, rolling back and removing Studio. The first launch, with its stop points and report, is `GROK_HANDOFF.md`. Names, ports and variables are in `DEPLOYMENT_CONTRACT.md`.

All commands run as root on the VPS unless noted. Never print `.env` or `owner.env`, and never paste their contents anywhere.

## A. Fresh install

### A1. Preflight (read-only)

```bash
docker version --format '{{.Server.Version}}'; docker compose version
ip -4 addr | grep -w 172.18.0.1                       # the proxy gateway exists
ss -ltn | grep -w '172.18.0.1:8083' && echo "8083 BUSY - stop" || echo "8083 free"
docker ps --format '{{.Names}} {{.Status}}' | grep financebot-caddy-1
free -m; df -h /
dig +short studio.omidataei.com @1.1.1.1              # 217.65.145.161
```

### A2. Layout and source

```bash
install -d -m 0755 /opt/brand-os-studio
install -d -m 0700 /opt/brand-os-studio/secrets /opt/brand-os-studio/backups
install -d -m 0700 -o 1000 -g 1000 /opt/brand-os-studio/data
cd /opt/brand-os-studio
# The template repository is private: clone with the operator's authorized access (deploy key or gh auth).
git clone https://github.com/omidlog/brand-os-template.git src
git -C src checkout --detach <REVIEWED_FULL_SHA>
git -C src rev-parse HEAD                              # must equal <REVIEWED_FULL_SHA>
git -C src status --porcelain                          # must be empty
cp src/infra/production/docker-compose.yml ./docker-compose.yml
install -m 0600 src/infra/production/.env.example ./.env
```

Edit `.env` with `sudoedit` or `nano` on the server. Set `STUDIO_IMAGE_TAG` to the first 12 characters of the SHA and `STUDIO_BUILD_REVISION` to the full SHA. The owner enters the GitHub tokens directly on the server. They are never sent through a chat.

### A3. Build

```bash
docker compose build
docker image inspect -f '{{.Config.User}} {{index .Config.Labels "org.opencontainers.image.revision"}}' brand-os-studio:<tag>
# expect: node <REVIEWED_FULL_SHA>
```

### A4. Owner bootstrap (the owner types the password and confirms the authenticator code)

```bash
chown 1000:1000 secrets
docker run --rm -it --network none --user 1000:1000 -v "$PWD/secrets:/out" \
  brand-os-studio:<tag> node dist/cli.mjs bootstrap-owner --login <owner-login> --out /out/owner.env
chown -R root:root secrets && chmod 0700 secrets && chmod 0600 secrets/owner.env
```

The command asks for the password twice and shows the authenticator key and `otpauth://` URI on that terminal only. It then asks for the current 6-digit code and writes nothing unless the code is valid. `--network none` keeps the container offline.

Alternative: the owner runs `npm run studio -- bootstrap-owner --login <owner-login> --out owner.env` in their own checkout and copies the file to `/opt/brand-os-studio/secrets/owner.env` with `scp`, mode 0600.

### A5. Validate and start

```bash
docker compose run --rm --no-deps studio node dist/cli.mjs check-config   # "Configuration OK."
docker compose up -d
for i in $(seq 1 30); do [ "$(docker inspect -f '{{.State.Health.Status}}' brand-os-studio-studio-1)" = healthy ] && break; sleep 2; done
docker compose ps
docker compose logs --tail 20 studio                   # "listening on ..." and "build revision <SHA>"
ss -ltnp | grep 8083                                   # only 172.18.0.1:8083
src/infra/production/smoke-test.sh --base http://172.18.0.1:8083 --host studio.omidataei.com --expect-https
```

### A6. Edge Caddy (shared production file: back up, append, validate, reload)

```bash
CF=/root/financebot/Caddyfile
BK="$CF.bak-$(date -u +%Y%m%dT%H%M%SZ)"
cp -a "$CF" "$BK"
grep -q 'studio.omidataei.com' "$CF" && echo "ALREADY PRESENT - stop and inspect" || {
  printf '\n' >> "$CF"
  cat /opt/brand-os-studio/src/infra/production/Caddyfile.studio >> "$CF"
}
docker exec financebot-caddy-1 grep -c 'studio.omidataei.com' /etc/caddy/Caddyfile   # the container sees it
docker exec financebot-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec financebot-caddy-1 caddy reload   --config /etc/caddy/Caddyfile --adapter caddyfile
```

If validation fails, restore and stop: `cp "$BK" "$CF"`, then validate again.

The Caddyfile is a single-file bind mount. Change it only with `>>` or `cp` (same inode). `sed -i`, `mv` or editors that replace the file leave the container reading the old copy.

### A7. TLS and public checks

```bash
sleep 20; docker logs --since 5m financebot-caddy-1 2>&1 | grep -i 'studio.omidataei.com' | tail -5
curl -sS https://studio.omidataei.com/healthz          # ok
echo | openssl s_client -connect studio.omidataei.com:443 -servername studio.omidataei.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates
src/infra/production/smoke-test.sh --http-redirect
```

Then re-check every other hostname on the edge proxy (see `GROK_HANDOFF.md` step 2 for the baseline).

### A8. Backups

```bash
cat > /etc/cron.d/brand-os-studio-backup <<'EOF'
# Brand OS Studio operational state (registry, cache). Secrets are not included.
17 3 * * * root /opt/brand-os-studio/src/infra/production/backup.sh --keep 14 >> /var/log/brand-os-studio-backup.log 2>&1
EOF
chmod 0644 /etc/cron.d/brand-os-studio-backup
/opt/brand-os-studio/src/infra/production/backup.sh    # first backup now
```

Do the restore drill in `OPERATIONS.md` once now and after every upgrade that touches the registry.

## B. Upgrade to a new reviewed commit

```bash
cd /opt/brand-os-studio
src/infra/production/backup.sh
git -C src fetch origin && git -C src checkout --detach <NEW_FULL_SHA>
git -C src rev-parse HEAD
diff -u docker-compose.yml src/infra/production/docker-compose.yml   # adopt reviewed changes deliberately
# edit .env: STUDIO_IMAGE_TAG=<new 12-char>, STUDIO_BUILD_REVISION=<new full SHA>
docker compose build && docker compose up -d
# wait for healthy, then run the upstream and public smoke tests (A5, A7)
```

If the reviewed change touches `infra/production/Caddyfile.studio`, repeat the backup → edit → validate → reload sequence for the Studio block only.

## C. Rollback

App only (previous image still present):

```bash
cd /opt/brand-os-studio
docker image ls brand-os-studio                         # find the previous tag
# edit .env: STUDIO_IMAGE_TAG=<previous tag>, STUDIO_BUILD_REVISION=<previous full SHA>
git -C src checkout --detach <PREVIOUS_FULL_SHA>         # keep scripts and compose in step
docker compose up -d --no-build
```

If an upgrade damaged the data: `docker compose stop`, then `mv data data.broken-<date>`, then `install -d -m 0700 -o 1000 -g 1000 data-restore`, then `restore.sh <archive> data-restore`, then `chown -R 1000:1000 data-restore && mv data-restore data`, then `docker compose up -d`.

## D. Remove Studio from the proxy (incident or uninstall)

```bash
cp /root/financebot/Caddyfile.bak-<timestamp> /root/financebot/Caddyfile      # cp keeps the inode
docker exec financebot-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec financebot-caddy-1 caddy reload   --config /etc/caddy/Caddyfile --adapter caddyfile
cd /opt/brand-os-studio && docker compose down          # never `down -v`; data/ and backups/ stay
```

Restoring the backup also removes any edit made to the Caddyfile after it was taken. If others changed the file since, delete only the `studio.omidataei.com { ... }` block instead, by writing a corrected copy and `cp`-ing it over. Re-check the other sites afterwards. The DNS record stays unless the owner decides otherwise.

## Never

`docker compose down -v`; deleting `data/` or `backups/`; `docker system prune -a` without checking which images are needed for rollback; editing other apps' Compose files; publishing Studio on `0.0.0.0`; deploying the Docusaurus build; pasting secrets into chat.
