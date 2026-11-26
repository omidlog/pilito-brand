# Phase 10 security review: Studio behind the shared Caddy

Scope: the Phase 9 Studio (`apps/studio`) as it will run on the VPS: one container published on `172.18.0.1:8083`, behind the existing edge Caddy (`financebot-caddy-1`) that terminates TLS for `studio.omidataei.com`. This review was done on branch `feat/phase-10-prep`. Nothing was deployed.

## Entry gate: what Phase 9 already provided

The Phase 9 Studio is already read-only by construction. There is no write-capable UI to remove. The complete non-GET route list is pinned by `tests/studio-server.test.ts` ("no mutation endpoints"):

| Non-GET route | Effect |
| --- | --- |
| `POST /login`, `POST /logout` | Owner session |
| `POST /brands/new`, `POST /brands/<slug>/provisioning/retry` | Create one new private repository (the only GitHub write) |
| `POST /brands/<slug>/refresh` | Re-read GitHub into the read cache |
| `POST /webhooks/github` | Mark a cache stale (HMAC-signed pushes only) |

Phase 10 adds no route.

## Review findings and changes

| Area | Phase 9 state | Finding behind a proxy | Phase 10 change | Test |
| --- | --- | --- | --- | --- |
| Client IP for rate limits | Leftmost `X-Forwarded-For` hop when `STUDIO_TRUST_PROXY=1` | The leftmost entry is client-controlled. An attacker could rotate it to dodge the per-IP login limit. | Use the **rightmost** hop (the one the single trusted proxy appends). Caddy's default replaces any client value anyway. This was verified with a real Caddy 2.11.2. | `studio-hardening`: forged left hop stays blocked |
| Host header | Not checked | DNS rebinding or a stray virtual host could reach Studio under a foreign name. | Beyond loopback, answer only for the public hostname (port ignored). Any other name gets `421`. `/healthz` is exempt for the container check. | `studio-hardening`, `studio-browser-production` |
| Health | `/healthz` always `200 ok` | It could not detect a broken data volume. | `503 unavailable` when the data dir is not writable. The response reveals nothing else. | `studio-hardening` |
| Keep-alive | Node default (5 s) | A proxy that reuses an upstream connection Node already closed gives sporadic 502s. | `keepAliveTimeout` 65 s. Caddy upstream `keepalive 30s`. Header size is capped at 16 KiB. | `studio-hardening`, `studio-deploy` |
| Cookies behind TLS | `Secure` and `__Host-` derived from the https public origin, not from request headers | Correct: TLS terminates at Caddy and the hop to Studio is plain HTTP. | None. Verified in a real browser behind TLS. | `studio-browser-production` |
| CSRF | Token plus `Origin` on every authenticated POST. Login uses an HMAC nonce. | `SameSite=Strict` does **not** protect against sibling subdomains of `omidataei.com`, which are same-site. | None needed: a real-browser test shows the same-site forged post is refused by CSRF/Origin (403). The cross-site post arrives without the cookie (401). | `studio-browser-production` |
| Owner bootstrap | Three separate commands printing secrets to stdout | Easy to mishandle on a server. | `studio bootstrap-owner` writes one 0600 env file. Enrollment details go to stderr only, the password is asked twice, and the first TOTP code is verified on a terminal. `studio check-config` validates the environment without printing values. | `studio-cli` |
| Compression | n/a | Compressing HTML that carries CSRF tokens enables BREACH-style attacks. | The Caddy snippet compresses `/static/*` only. | `studio-deploy` |
| Proxy headers | n/a | A proxy CSP would break the sandboxing CSP on asset previews. | Caddy sets HSTS, nosniff, DENY, Referrer-Policy and X-Robots-Tag, and removes `Server`. It never sets CSP. | `studio-deploy` |
| Registry consistency | The server keeps the registry in memory | `studio register` next to the live server was invisible to it until restart, and the server's next save, such as a new brand, overwrote it (lost mapping). | The registry reloads whenever the file changed on disk (atomic writes replace the inode). | `studio-hardening`: fails on the old code |
| Image and container | n/a | | Digest-pinned base, non-root `node` user, npm removed, read-only root filesystem, `cap_drop: ALL`, `no-new-privileges`, memory, CPU and PID limits. Only `172.18.0.1:8083` is published. | `studio-deploy`, CI workflow |

### Unchanged and re-checked

- **Sessions:** 32-byte random ids are stored as SHA-256 server-side, with absolute (12 h) and idle (60 min) expiry. Sessions are destroyed on sign-out and replaced at sign-in. Expiry is now unit-tested with a fake clock.
- **TOTP:** RFC 6238 with ±1 step drift. A code is refused if it was already used in its step.
- **Rate limits:** 5 failed sign-ins per 15 min per client IP, and 30 per 15 min globally. Provisioning is limited to 10 per hour and refresh to 1 per 5 s per brand.
- **Password:** scrypt (N=2^15, r=8, p=1), the input length is bounded, and the hash is never logged.
- **Responses:** CSP `default-src 'none'` with no inline script or style. The browser tests confirm enforcement.
- **Guests:** every guest gets the same redirect or 401 for real and invented slugs.
- **GitHub:** separate read and provisioning credentials. The provisioning credential is used only by the wizard and only for allowlisted owners and the configured template.
- **Repository content:** tar extraction is allowlisted under `brand/`, and `.private`, `restricted`, links and traversal are refused. A credential guard runs on projections.
- **Logs:** config errors name variables, never values. A test checks that no owner secret appears in the server log.

## Known limitations (accepted for a single-owner service)

- **Global sign-in limit can lock the owner out.** Anyone who sends 30 failed sign-ins in 15 minutes blocks every new sign-in for 15 minutes. Existing sessions keep working. Restarting the container clears the in-memory counters. If this is ever abused, add a Caddy-level allowlist or a second factor at the proxy.
- **Sessions are in memory**, so a restart or upgrade signs the owner out. That is the safe failure.
- **Any process on the host's Docker networks can reach `172.18.0.1:8083` directly** and could forge `X-Forwarded-For`. That only affects which per-IP bucket it lands in. The global limit, CSRF, TOTP and the Host check still apply. This is the same trust level as every other app on this VPS.
- **Caddy adds `Via: 1.1 Caddy`** to proxied responses. It contains no version, so we accept it.
- **The webhook delivery de-duplication is in memory.** A replayed signed delivery after a restart only triggers a harmless refresh.
- **The provisioning credential is powerful.** See "GitHub permission model" in `ARCHITECTURE.md` and the open owner decisions in `GROK_HANDOFF.md`.

## Not tested here

- The Docker image build and the container itself. Docker is not available in this environment. `.github/workflows/studio-image.yml` builds the image, runs the unmodified Compose file on a recreated `172.18.0.1` gateway, runs the smoke test and does a restore drill. It runs on the PR.
- Real GitHub. All GitHub behavior is tested against an in-memory fake at the HTTP level. No real repository was created. Token permission combinations, template generation timing and the private template (see `ARCHITECTURE.md`) are first verified live during launch, with an owner-authorized test repository.
- The real VPS, DNS and Let's Encrypt issuance. These belong to the launch operator (`GROK_HANDOFF.md`).
