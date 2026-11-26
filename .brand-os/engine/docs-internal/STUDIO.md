# Brand OS Studio

Studio (`apps/studio`) is a private, owner-only web app. It has three jobs:

1. **Create** a new brand: one new private GitHub repository from this template, with a safe initial configuration.
2. **Show** each brand: the approved, source-backed state of its merged default branch.
3. **Offer engine updates**: compare each brand's `.brand-os/engine/VERSION` with the template's newest `engine-v…` release, and start the template's `engine-release` workflow for one brand (**Update this brand**) or all (**Update all brands**). The workflow opens the pull requests (`docs/engine-updates.md`); Studio never merges.

Studio does not edit brands. All ongoing work (interviews, proposals, documents, assets, tokens, commits and pull requests) happens in **Claude Code, inside that brand's own repository**. Approval and publication stay with the owner's trusted local CLI. Phase 8 Personal Brand OS remains fully supported. Studio shows personal brands read-only and does not edit them.

One Studio serves every brand, at routes `/brands/<slug>` (for example `https://studio.omidataei.com/brands/acme`). There are no per-brand subdomains.

## What Studio will never do

There is no chat, no Claude or other AI integration, no interview UI, no fact edit or save form, no approve or publish button, no upload, no commit, push, merge or revert UI (an engine update pull request is opened by the template's workflow and merged on GitHub, by a person or by GitHub auto-merge for a brand that opted in), no agent-token issuance and no terminal. A test (`tests/studio-server.test.ts`, "no mutation endpoints") pins the complete list of non-GET routes and fails if one is added.

| Non-GET route | What it changes |
| --- | --- |
| `POST /login`, `POST /logout` | The owner session |
| `POST /brands/new` | Provisions one new private repository (the first GitHub write) |
| `POST /brands/<slug>/provisioning/retry` | Retries a failed provisioning of that new repository |
| `POST /brands/<slug>/provisioning/discard` | Removes a failed attempt from Studio's own registry. Never calls GitHub |
| `POST /brands/<slug>/refresh` | Re-reads GitHub into Studio's read cache |
| `POST /brands/<slug>/template-update` | **Update this brand**, Studio's second GitHub write: starts the template's `engine-release` workflow for this brand (`workflow_dispatch`). Studio writes nothing to the brand repository and never merges |
| `POST /brands/update-all` | **Update all brands**: the same workflow for every brand with the topic `brand-os-brand` |
| `POST /webhooks/github` | Marks a brand's cache stale (signed push events only) |

`PUT`, `PATCH` and `DELETE` answer 405. Once a repository exists, Studio writes nothing more to it except, right after provisioning, the topic `brand-os-brand`. Engine updates are opened by the template's workflow, which also runs after every green release on its own; `STUDIO_TEMPLATE_CHECK_MINUTES` and `STUDIO_TEMPLATE_AUTO_PR` are no longer used.

## The owner journey

1. Sign in (password and authenticator code).
2. **New brand**: name, URL slug, profile (business/startup or personal brand with facets), optional logo and identity questions (logo today, intent, change depth; an unapproved hint written to `onboarding.identity`, see `docs-internal/IDENTITY_INTAKE.md`), languages, optional mascot and gamification, and the GitHub account or organization to create the repository in. Review, then **Create private repository**.
   Before anything is created, the wizard checks that `owner/name` is free (one read-only GET with the provisioning credential, only for allowlisted owners). If it is taken, the wizard says so in a polite live region and offers `<slug>-brand` (then `-2`, `-3` …) as a button. Without JavaScript the server runs the same check on submit and shows the suggestion as a field error.
3. Studio shows each provisioning step live. On success: **Copy repository URL**, **Copy starter prompt**, **View brand**. On failure: **Retry** (same answers), **Edit and retry** (the wizard prefilled with the previous answers; change the repository name, account or slug, and the failed attempt is replaced) and **Discard this attempt** (after a confirmation page, removes only Studio's record; nothing on GitHub is changed or deleted, and a repository that still needs cleanup is named so you can remove it yourself).
4. Open a **new Claude Code session** and paste the starter prompt (or open your local clone). See [Private repository access for Claude Code](#private-repository-access-for-claude-code).
5. Claude Code reads `AGENTS.md`, `CLAUDE.md`, `README.md` and `brand/brand.config.yaml`, interviews you, edits the brand through the core CLI, validates, and prepares a branch and pull request when you ask. You approve facts yourself with the local CLI, never by pasting a secret into chat.
6. Merge the pull request on GitHub.
7. Back in Studio, press **Refresh** (or wait for the webhook). Studio shows the new commit SHA, sync time, sources, documents, tokens and approved assets. Unmerged pull requests are never shown as brand truth: the overview says how many changes wait in open pull requests (counts only, labelled "Unmerged, not canonical"), and the History page lists them as non-canonical.

## Screens

| Screen | Shows |
| --- | --- |
| My brands | Every registered brand with profile, repository, last synced commit, and **Updates available** / **Update PR open** badges. Create action and empty state. |
| New brand | The five-step wizard (works without JavaScript as one form; the server validates everything). |
| Command Center (Overview before V4.1) | The 30-second strip and coverage mini-map first (see "Command Center and Publishing gallery" below), then coverage and approval; template updates (state, recorded and latest template commit, **Open update PR** or a link to the open update pull request), coverage and approval, required questions still unanswered, review queue size, coverage by area, next unanswered questions (read-only), a **Before you approve: coach notes** card (Strategic Coach notes on merged strategic drafts with a gap; question ids and closed-vocabulary text only, en/fa/tr, `authorizes: []`, hidden when there is nothing to say; `docs-internal/COACH_UX_DECISION.md`), recent merged changes, enabled modules. |
| Brand Book | `/brands/<slug>/brand/book` (V2.4): an editorial chapter reader over the core `brand-book` document model. A book opener with contents, then one chapter per section (number, title, lead, counts), approved values as prose, do/don't pairs as a spread, the V2.1 colour, type and logo plates as specimens, and a version footer (approved version, commit, date). Drafts are labelled *Draft, not approved* (a draft-tagged logo master keeps its tag); nothing is called published. Gaps say *Still to answer*. Restricted values are withheld. Technical ids (question and source ids) only appear under **Source ids**. Links to the Visual identity chapter (`/brand/book/visual-identity`) and its print view. |
| Design System | Approved colors, all colors as swatches with draft/example/approved state, type specimens, logo specification, every token with its approval state. No pickers. With approved color roles, template example colors move into a collapsed "Template examples (not your brand)" section; the page says when the roles are not tokens yet (`npm run brand:tokens:generate`) and when template slots still wait for `brand.color.semantic_map` (BOS-17). |
| Assets & Mascot | Asset cards with checksum, license, visibility and approval. Previews for approved images whose bytes match the manifest checksum and pass the core publication check (active SVG is refused). Draft (not yet approved) images get an owner-only preview after the same check, with a dashed frame, a visible "Draft, not approved" flag (en/fa/tr, placed at the inline start so it mirrors in RTL) and alt text that says so; a wrong checksum still refuses it, and a draft without a checksum is keyed by its content hash. Rejected, retired or revoked files get no preview. A draft preview never makes an asset approved or published: public docs still publish approved assets only. A refused SVG shows the specific problem and line and, when the core normalizer can fix it, the command to run in the brand repository (`npm run brand:assets -- normalize <id>`). There is no fix button. Mascot states without artwork say so. The mascot section disappears when the module is off. Real assets come first (published, then approved, then drafts), template examples last; an EXAMPLE placeholder is hidden once an approved real asset of the same kind exists, and the mascot placeholders, empty mascot slots and the mascot filter are hidden while the mascot module is off (a real mascot file stays); the page says how many were hidden and why (BOS-12). An approved asset that is not in the publication policy carries a *Not published · internal preview* badge (BOS-16). |
| Business plan, Marketing plan | `/brands/<slug>/strategy/business-plan` and `/brands/<slug>/market/marketing-plan` (V2.4; before: Business OS with `?doc=`): business module coverage and the document from the core document model (`documentView`, which also serves personal documents). A module, section or chapter with no question that applies to the brand's profile shows "Not applicable to this profile", never 100 % or missing; the rule is `brandApplicability` in core, the same one `brand:next` uses (BOS-15). |
| Publishing gallery | `/brands/<slug>/governance/documents` (V4.1): document types × export profiles (`public`, `investor`, `internal`) with readiness and counts only, links to the print views that exist. See "Command Center and Publishing gallery" below. |
| Business Model Canvas | `/brands/<slug>/strategy/business-model` (before V2.4: `/visual`): the nine-zone business model canvas from the same approved facts and drafts as the documents (Visual Blueprint P0, `docs-internal/VISUAL.md`). Drafts are labelled, restricted values withheld, gaps named with the question to answer. `/strategy/business-model/print` is the A3-landscape print view of the same document (save as PDF from the browser); `?edition=public` leaves drafts out. GET only. Hidden for personal brands without the founder or consultant facet; with one, it describes the person's own practice from personal answers (BOS-15, `docs-internal/PERSONAL_BRAND.md`). |
| Personal Brand | Only when `modules.personal.enabled` is true: the ten Phase 8 deliverables with verified / owner-stated / unverified labels. Each section leads with its composed "Draft for owner approval" in one language edition (`?locale=fa|en|tr`, read-only), the untranslated facts named, and the fact cards below as Sources (BOS-19, `docs-internal/PERSONAL_BRAND.md`). |
| Knowledge | Only when the merged commit has shared notes (`brand/knowledge/shared/*.md`): unverified ideas with filters, search, detail, backlinks and linked questions. Labelled *Not an approved brand fact*. Local and restricted notes never reach Studio. See `docs-internal/KNOWLEDGE.md`. |
| Competitor analysis (comparison matrix) | `/brands/<slug>/market/competitors` (V2.2; before V2.4: `/visual/competitors`): owner-reviewed competitors from `brand/competitive/shared/landscape.json` (written by `brand:competitive share`, committed by the owner) against the own-brand row from approved facts, with numbered source footnotes and a price strip grouped by currency (never ranked or converted). Designed empty state until a file is shared; a file with any unexpected field, another brand's slug or secret-looking text is withheld whole. Nothing else under `brand/competitive/` reaches Studio. `/print` is the print view (A4 landscape matrix). Internal edition only; GET only. See `docs-internal/COMPETITIVE.md`. |
| Creative decisions | Only when the merged commit has shared decisions (`brand/creative/shared/cp_<uuid>.json`, written by `brand:creative share`): owner-approved creative preferences with scope, approval date, supersession links, source note ids and counterexamples; superseded ones under history. Labelled not brand-wide and not a performance result. No note text, drafts, projects or feedback (everything else under `brand/creative/` and `brand/.private/` is filtered out). Malformed, other-brand, symlinked or secret-looking files are withheld with a reason. See `docs-internal/CREATIVE_LEARNING.md`. |
| Content calendar | Only when the merged commit has shared weeks (`brand/content-calendar/shared/wk-YYYY-MM-DD.json`, written by `brand:content share`): owner-approved calendar weeks with dates, channels, formats, pillar names, languages, cited fact ids, hook and angle, research observation ids with confidence, and gaps. Labelled as authorizing nothing; the current status stays in the CLI. No drafts or week records (`brand/.private/` and everything else under `brand/content-calendar/` are filtered out). Malformed, other-brand, misnamed, symlinked or secret-looking files are withheld with a reason. See `docs-internal/CONTENT_BRIDGE.md`. |
| Content strategy | Only when the merged commit has a shared strategy (`brand/content-strategy/shared/<id>.json`, written by `brand:content share-strategy`): the approved revision with its number and content digest, approval and share times, validity, languages, pillars, and per channel role, objective, audience, formats, cadence, the content mix as one bar, KPI targets (the owner's targets, never results), posting windows, rules and cited fact ids; open gaps. Labelled as authorizing nothing. No drafts, restricted block or fact values. Malformed, other-brand, misnamed, symlinked or secret-looking files are withheld with a reason. See `docs-internal/CONTENT_BRIDGE.md`. |
| Social style kit | Only when the merged commit has `brand/social/style-kit.yaml` or `brand/social/shared/approvals.json` (written by `brand:social kit share`). Per surface, each sibling style as the core preview wireframe (`styleSvg`, inline), with its status, layers, do / don't, digest, and fonts for the page language (labelled draft token or template EXAMPLE until approved). A style is **approved** only when its content digest matches the shared summary; an approved style edited after approval, or not in the summary, shows as **not verified**. No seals: `brand/.private/social` is never read, and nothing else under `brand/social/` is extracted. See `docs-internal/SOCIAL_STYLE_KIT.md`. |
| History & Review | Latest merged commits, open pull requests (labelled non-canonical), fact review states, open contradictions. |
| GitHub & Claude Code | Repository URL, starter prompt, clone command, "Private repository access required", Open on GitHub. |
| Account & GitHub | MFA state, session expiry, which GitHub credentials are configured (never their values), template, allowed destinations, webhook state (with setup steps while none is configured), the default-branch poll interval, a connection test. |

Every brand page shows the branch, short SHA and sync time in the top bar. Data states are distinct: *not yet synced*, *synced*, *stale* (older than the sync TTL; a background refresh starts), *refresh failed* (the last good commit stays visible with the error), and per item *approved*, *draft*, *example*, *missing* and *withheld*. Missing information is never filled with sample data.

### Navigation and routes (Visual V2.4)

The brand sidebar is grouped by the reader's question, with standard page names. A page appears only when it applies (same rules as before); a group with nothing to show is left out.

| Group | Pages (stable path under `/brands/<slug>`) |
| --- | --- |
| Command | Command Center (`/`; called Overview before V4.1), Coach notes (an anchor to the Command Center card, only when it has notes) |
| Strategy Lab | Business Model Canvas (`/strategy/business-model`, `/print`), Business plan (`/strategy/business-plan`) |
| Brand Studio | Brand Book (`/brand/book`; Visual identity chapter `/brand/book/visual-identity`, `/print`), Design System (`/brand/design-system`), Assets & Mascot (`/brand/assets`), Creative decisions (`/brand/creative-decisions`), Personal Brand (`/brand/personal`) |
| Market & Content | Marketing plan (`/market/marketing-plan`), Competitor analysis (`/market/competitors`, `/print`), Content strategy (`/market/content-strategy`), Content calendar (`/market/content-calendar`), Social style kit (`/market/social-style-kit`), Knowledge (`/market/knowledge`) |
| Publishing & Governance | Publishing gallery (`/governance/documents`, V4.1), History & Review (`/governance/history`), GitHub & Claude Code (`/governance/github`) |

The old flat paths (`/brand-book`, `/design`, `/assets`, `/business[?doc=]`, `/personal`, `/knowledge`, `/creative`, `/calendar`, `/history`, `/handoff`, `/visual`, `/visual/print`, `/visual/identity[/print]`, `/visual/competitors[/print]`, `/visual/mascot[/print]`) answer **301** to the stable path for one release, keeping the query (`/business?doc=marketing-plan` goes to `/market/marketing-plan`). They are GET-only session routes like every brand page: a guest is sent to `/login?next=<old path>`, and an unregistered slug gets the same 404 as any other brand route. The asset preview route (`/brands/<slug>/assets/file/<sha256>`) is unchanged. Group labels are in en/fa/tr. `tests/studio-server.test.ts` pins every redirect.

## Look and feel

Studio wears the omidataei.com identity, taken from that site's design system: monochrome surfaces with near-black ink, lime (`#d5fe00`) as the only signal colour (active page bar, eyebrows, current wizard step, empty states), a violet focus ring, Rajdhani display over Inter body text, pill buttons with the site's padding/gap hover morph, and 16px cards. The chrome follows the site's admin: an always-dark sidebar with the blueprint grid, a lime glow and the Omid Ataei logo, and a split sign-in page. Dark mode uses the site's footer palette.

- Tokens live in `apps/studio/static/studio.css` as `--studio-*` variables. Brand colours still appear only inside specimens.
- Fonts are self-hosted WOFF2 subsets in `apps/studio/static/fonts` (Inter, Rajdhani, Vazirmatn for Persian; SIL OFL, see `OFL.txt`). The site's Persian display face (Shams) is licensed to omidataei.com only and is not copied.
- Static files (CSS, script, icons, fonts) are read once into memory by `apps/studio/src/static-assets.ts` and served with an ETag, so a revalidation is a body-less `304`. Pages link CSS and JS as `/static/<name>?v=<content hash>`; only a matching hash is cached for a year (`immutable`). Plain names and old hashes get five minutes, fonts a week. A restart (every deploy) reloads the files; the CSP is unchanged.
- The logo (`logo-omid-ataei-white.svg`) and the lime key favicon are copies of the site's assets; update them here if the site changes.
- Layout uses logical properties for RTL; motion respects `prefers-reduced-motion`; a browser test checks WCAG AA text contrast on the main pages in light and dark.

## Architecture

```text
Browser ──HTTPS──> reverse proxy ──> Studio (127.0.0.1:4100 locally; container behind Caddy on the VPS)
                                      ├─ server.ts      route table and dispatcher: auth gate, CSRF, headers
                                      ├─ routes/        handlers: context (shared helpers), guards (client IP, Host
                                      │                 allowlist, same origin), auth, account, brands,
                                      │                 provisioning, system (healthz, static, webhook)
                                      ├─ views/         server-rendered, escaped HTML
                                      ├─ registry.ts    slug -> repository mapping (server-side, data dir)
                                      ├─ sync.ts        merged default branch -> safe projection cache
                                      ├─ projection.ts  core functions at the internal audience + credential guard
                                      ├─ provision.ts   write 1: create a repository
                                      ├─ template-update.ts  write 2: update branch + pull request (never merges)
                                      └─ github/        REST client, safe tar extraction, webhook verification
```

- **Reading.** For a registered brand, Studio reads the head of the default branch, downloads that commit's archive with the read credential, and extracts only allowlisted files under `brand/` (never `brand/.private`, `brand/restricted`, exports or `.env`; under `brand/knowledge` only `shared/*.md`, checked first; under `brand/content-calendar`, `brand/content-strategy`, `brand/creative` and `brand/competitive` only their owner-shared files; under `brand/social` only `style-kit.yaml` and `shared/approvals.json`; symlinks, links, traversal and oversized archives are refused). It then runs the existing `@brand-os/brand-core` functions (dashboard, document model, token hashes, asset inspection) on that temporary copy and stores only the resulting projection, the SHA and times. A guard refuses any projection that looks like a credential.
- **Source of truth.** Git. Studio's view is the last successfully fetched merged default-branch commit. It never reads local ignored files, so it cannot show `.private` values or decrypted restricted facts; those appear as withheld.
- **Brand selection.** A slug only resolves through the server-side registry. A repository is accepted only if its `brand.slug` matches and its GitHub repository id is the one recorded at registration, so a deleted and recreated repository with the same name, or one whose config claims another slug, is refused.
- **Provisioning.** Template check, duplicate refusal (registry and GitHub), private generation from the template, wait for GitHub to copy it, then the core `applyInit` (the same initializer as `brand:init`) on a temporary checkout and one fast-forward commit with the safe initial config and manifest. A repository GitHub reports as public is deleted and never registered. A failure after creation deletes the partial repository when permitted, or records that cleanup is required; retry resumes. Per-slug and per-repository locks refuse concurrent creates. No approval secret, data key or agent token is ever created in the repository; those are initialized only in an authorized local workspace.
- **Refreshing.** Manual Refresh, refresh on view after the TTL, a background poll of each brand's default-branch head (below), and an optional GitHub push webhook (HMAC verified in constant time over the raw body, deliveries de-duplicated). The webhook payload is only a hint: Studio fetches the branch itself. `/healthz` never waits for a sync or for GitHub.
- **Default-branch poll (BOS-11).** `apps/studio/src/head-poll.ts`, started by `main.ts` only. Every `STUDIO_HEAD_POLL_SECONDS` (default `180`; `0` off; otherwise 60 to 3600) it makes one GET per ready, already synced brand (`git/ref/heads/<default branch>`, read credential) and compares the commit with the sync cache. A moved head marks the brand dirty and starts the normal read-only refresh, so a merge shows up within that time without Refresh or a webhook. One pass at a time on an `unref`'d timer; a rate limit ends the pass and waits at least 15 minutes, other failures double the wait up to an hour.
- **Open pull requests (BOS-02).** During each sync Studio reads the open pull requests and, for each one that is new or whose `updated_at` changed, its file list (`GET /repos/{owner}/{repo}/pulls/{n}/files`, at most 3 pages of 100). It counts records touched in `brand/interview/answer-ledger.yaml` (facts), `brand/interview/evidence-register.yaml` and `evidence-index.yaml` (evidence) and `brand/assets/asset-manifest.yaml` (assets), plus every other changed file. Only the counts are cached in `state.json` with the history; no value, file name or diff line is stored or sent to the browser. A diff GitHub leaves out, or a list longer than 300 files, makes the counts a minimum. After a GitHub error or rate limit, no further file list is read in that sync and those counts show as unknown. The overview shows "N changes are waiting in open pull requests" with a link to each pull request; every other brand page shows one compact line. Both say "Unmerged, not canonical". There is no branch preview.
- **Display name (BOS-20).** Every surface (sidebar switcher, brand list, breadcrumbs, page titles, headers) shows the synced `brand.name` once the merged `brand.config.yaml` has `name_status: approved`. Before that (no sync yet, or a name not yet approved) it shows the name recorded at registration. The registry file is not rewritten.
- **Mixed-script text (BOS-21).** Owner-written values are rendered in `dir="auto"` elements. When a value mixes right-to-left and Latin script, the shared template helper (`views/html.ts`) sets the element's direction from most of its words, marks it `data-bidi="mixed"`, and wraps each run of the other script (file names, URLs, product names) in `<bdi class="bidi-run">`; CSS isolates both (`unicode-bidi: isolate`). A Persian value therefore stays right-to-left and right-aligned inside the English interface, with parentheses and file names in order. Values in one script keep plain `dir="auto"`.

## Security model

- Owner sign-in: scrypt password hash, TOTP (required whenever Studio is reachable beyond loopback), a login nonce, per-IP and global rate limits, generic failure messages. Each authenticator code works once; signing in again with a code that was already used says so and asks you to wait for a new code (the attempt still counts against the rate limit). Behind the proxy (`STUDIO_TRUST_PROXY=1`) the client IP is the rightmost `X-Forwarded-For` entry, the one the proxy appended.
- Beyond loopback, Studio answers only for the hostname of `STUDIO_PUBLIC_ORIGIN` (`421` otherwise). `/healthz` is exempt and returns `503` when the data directory is not writable.
- Sessions: random ids held server-side, HttpOnly, `SameSite=Strict`, `Secure` and `__Host-` prefix on https, absolute and idle expiry, destroyed on sign-out.
- Every authenticated POST checks the CSRF token and `Origin`. Only form-encoded bodies are accepted.
- Guests receive a redirect or 401 for every route, identical for real and forged slugs, so brands cannot be enumerated.
- Headers: strict CSP (`default-src 'none'`, scripts and styles from self only, no inline script, style or handler), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: same-origin`, COOP/CORP, `noindex`, HSTS on https. The browser tests confirm an injected inline script never runs.
- All repository text is escaped. Asset previews are served only for approved or draft images that pass the core publication check (symlinks, traversal and active SVG are refused; a manifest checksum must match when present, and is required for approved files), always as `<img>`, each with its own sandboxing CSP.
- The browser never receives a GitHub token, raw tree, `.private` value or restricted value. The static bundle (`apps/studio/static`) is plain CSS and a small script with no data; a test scans it for secrets and brand data.
- Two separate GitHub credentials: a read credential for brand repositories and a provisioning credential used only by the wizard and scoped to the allowlisted destinations and the configured template.
- Studio binds to `127.0.0.1` by default. Configuration fails closed and error messages never echo a secret.

## Running Studio locally

```bash
cp apps/studio/.env.example .env      # fill in the non-owner values; .env is git-ignored
npm run studio -- bootstrap-owner --login <you> --out owner.env   # password, TOTP key, session secret (mode 0600)
set -a; . ./.env; . ./owner.env; set +a
npm run studio -- check-config        # validates like the server; prints settings, never values
npm run studio:start                  # http://127.0.0.1:4100
```

The single-purpose commands `npm run studio:hash-password`, `npm run studio -- session-secret` and `npm run studio -- totp-secret` still exist. `apps/studio/.env.example` documents every variable for local use. The production layout (container, Caddy, `/opt/brand-os-studio`) is in `docs-internal/phase-10/`. Without a read credential, brand pages cannot sync. Without a provisioning credential and `STUDIO_ALLOWED_OWNERS`, the wizard is shown as not configured and nothing can be created.

### GitHub credentials

Use fine-grained tokens or a GitHub App installation, limited to the accounts and repositories Studio needs:

| Credential | Variable | Permissions |
| --- | --- | --- |
| Read | `STUDIO_GITHUB_READ_TOKEN` | Contents: read, Metadata: read, Pull requests: read, on brand repositories |
| Provision | `STUDIO_GITHUB_PROVISION_TOKEN` | Administration: write (create from template, set the brand-os-brand topic, delete a partial repository) and Contents: write on the allowlisted destination; on the template: read access and **Actions: write** (start the engine-release workflow) |

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

Add a repository or organization webhook for push events to `https://<studio-origin>/webhooks/github` with content type `application/json` and the secret in `STUDIO_GITHUB_WEBHOOK_SECRET`. While no secret is configured, the Account page shows these steps (payload URL, content type, events, where the secret goes; never a value). Without a webhook, the default-branch poll (`STUDIO_HEAD_POLL_SECONDS`) still shows a merge within a few minutes.

### What a restart clears (in-memory state)

Studio runs as one process and keeps its security state in that process's memory, not on disk. Every restart (a deploy, a crash, a host reboot) clears it:

| State | Where | Effect of a restart |
| --- | --- | --- |
| Owner sessions | `apps/studio/src/auth/session.ts` | The owner is signed out and signs in again with password and authenticator code. Absolute expiry (`STUDIO_SESSION_HOURS`, default 12) and idle expiry (`STUDIO_IDLE_MINUTES`, default 60) only apply within one process lifetime. |
| Rate limits | `apps/studio/src/auth/rate-limit.ts`, created in `routes/auth.ts` (sign-in), `routes/provisioning.ts` (provisioning, name check), `routes/brands.ts` (refresh, update PR) and `routes/account.ts` (connection test) | Counters start from zero: failed sign-ins (5 per IP and 30 overall per 15 minutes), provisioning (10 per hour), refresh (once per 5 seconds per brand), the name check (60 per minute), update PRs (6 per 10 minutes) and the account connection test (5 per minute). A restart therefore also lifts an active sign-in lockout. |
| Used authenticator codes | `TotpVerifier` in `apps/studio/src/auth/totp.ts` | The "each code works once" record is lost. A code seen just before a restart could be accepted once more inside its 30-second step (plus one step of drift) after the restart, still only together with the password. |
| Webhook delivery ids | `DeliveryLog` in `apps/studio/src/github/webhook.ts` | A recent delivery could be processed again. That only queues one more read-only refresh. |

The brand registry, the sync cache and provisioning records are files in `STUDIO_DATA_DIR` and survive restarts.

What this means for an operator:

- Run exactly one Studio process per data directory. Two processes (or a load balancer over several) would each keep separate sessions and separate rate limits, which multiplies the sign-in attempts allowed.
- Do not restart Studio in a loop, for example from a health check that restarts on every failure: each restart resets the sign-in limits. Use a supervisor with back-off.
- After a restart, everyone signs in again. That is expected, not a fault.
- Persisting sessions and limits (for example in a small file or database in `STUDIO_DATA_DIR`) is a possible later change; it is not built.

## Private repository access for Claude Code

A repository URL is not permission. Claude Code can read a private brand repository only if you give it access, for example:

- Clone it yourself (`git clone https://github.com/<owner>/<repo>.git`) and open the folder in Claude Code, or
- authenticate the GitHub CLI (`gh auth login`) or an owner-approved GitHub connection in the environment where Claude Code runs.

The starter prompt tells Claude Code to stop and ask for access rather than guess. Never paste a GitHub token, the approval secret or `BRAND_OS_DATA_KEY` into a chat.

## Template updates

Each brand repository is an independent copy made from the template. When Studio creates a brand it records the template head commit in `brand/template-version.json`; the sync projection reads that record.

- **Updates available.** Studio reads the template's default-branch head with GET requests (provisioning credential, which can read the private template), caches it for 10 minutes and compares it with each brand's record. The brand list never waits for GitHub (it uses the cached head and refreshes it in the background); the Overview waits at most 3 seconds. Errors keep the last known head and back off (2 minutes, 15 after a rate limit); the state then shows *Template not checked* and nothing else breaks. States: *Updates available*, *Template up to date*, *No template record* (run `template:update --base` once in Claude Code), *Template not checked*, and *Update PR open* when an open pull request from a `template-update/` branch is in the brand's history.
- **Open update PR** (`POST /brands/<slug>/template-update`, owner session with MFA, CSRF token and same Origin, rate limited, recorded in `STUDIO_DATA_DIR/audit.jsonl`). Studio downloads the template archives at the recorded and latest commits and the brand's default-branch archive, and runs the core `planChanges` (the same logic as `npm run template:update`). Only core and merge-carefully paths are extracted from the brand archive; brand-owned paths are classified and skipped before any brand content is read. Template migrations new since the brand's commit (`.brand-os/migrations/`, JSON data, core paths only, refused otherwise) run on top of that plan and are listed in the pull request body. It writes the result as one commit on a new branch `template-update/<sha>` through the Git Data API and opens a pull request that lists changed files and files that need a person. The only `brand/` file it changes is `brand/template-version.json`.
- **Idempotent.** An open pull request from a `template-update/` branch is linked instead of opening another; a branch left by an earlier attempt is reused, never moved; concurrent requests for one brand are refused as busy.
- **Never**: pushing to the default branch, merging, force-moving a branch, writing to a public repository or to a repository outside `STUDIO_ALLOWED_OWNERS`.

The provisioning credential therefore also needs **Pull requests: write** on the allowlisted destinations (Contents: write is already required). Without it, the button reports that the pull request could not be opened. See `docs/template-sync.md`.

### Periodic template check

`apps/studio/src/template-update-job.ts` runs in the background, started by `main.ts` (never by tests or CLI commands):

| Variable | Default | Meaning |
| --- | --- | --- |
| `STUDIO_TEMPLATE_CHECK_MINUTES` | `360` | Minutes between runs, ±10 % jitter. `0` turns the job off; otherwise at least 15. The first run is within about 5 minutes of start. |
| `STUDIO_TEMPLATE_AUTO_PR` | `0` | `0`: check only; the result feeds **Updates available** and the owner opens pull requests by hand. `1`: also open an update pull request for each brand that is behind. |

- Each run reads the template head once through the cached update service (GET only) and compares it with every ready brand's recorded commit from the sync cache, re-reading a brand whose cache is stale (read credential, GET only).
- **At most one open update pull request per brand.** A brand whose history already shows an open `template-update/` pull request is only linked. Otherwise the job calls the same `openUpdatePull` as the button, which looks for an open update pull request on GitHub first and links it instead of opening another; a branch left by an earlier attempt is reused. It never writes the default branch and never merges.
- Only brands in `STUDIO_ALLOWED_OWNERS` can get a pull request; others are reported as `not_allowed`.
- Errors double the wait (up to a day); a rate limit waits at least an hour and ends the run early. A successful run resets the wait.
- One run at a time, one brand after another, on an `unref`'d timer: page requests never wait for it. On `SIGTERM`/`SIGINT` the timer is cancelled and a run in progress stops after the brand it is on.
- Audit: each run appends `{"action":"template_update_check","actor":"periodic-job",...}` with counts (brands, available, opened, linked, failed) to `STUDIO_DATA_DIR/audit.jsonl`; each pull request it opens is a `template_update_pull` entry with the actor `periodic-job`.
- Without a provisioning credential the job does not start.

### Command Center and Publishing gallery (Visual V4.1)

- **Command Center** (`/brands/<slug>`, R4): a 30-second strip leads the page: decisions needed (drafts awaiting approval, linking to History & Review), review due (approved facts past their review date), contradictions, and exports ready (from the gallery). Below it, a coverage mini-map per framework (Brand Book chapters, the nine canvas zones in canonical order, Visual identity blocks, Mascot atlas, Business and Marketing plans): one square per zone, block or section, its state said in words beside the row, never by colour alone. The older panels follow; the template update panel moved below the coverage table.
- **Publishing gallery** (`/governance/documents`): document types × export profiles (`public`, `investor`, `internal`). For a brand with `modules.personal.enabled` it also lists the personal documents that apply (BOS-19): the outward packs have public and internal cells, the content strategy and evidence register are internal only, and no personal document has an investor edition. Their export is the local command `npm run brand:document -- --type <kind> --audience public|internal`, shown as text. They count in the Command Center's "Exports ready". Each cell shows its readiness (ready, partly ready, nothing to show yet, not used by this brand, not for this audience), counts of shown values, open gaps and values hidden for that audience, and a link to the print view where one exists today. The full Brand Book (public and internal) shows its local export command as text instead, `npm run brand:export-visual -- --doc brand-book --edition public|internal` (owner decision 2026-11-24); Studio never runs it. Investor has no Brand Book edition, so that cell still reads "Print layout not built yet". Counts are measured at sync time on the redacted output each profile would receive (`buildPublishingGallery`, `packages/brand-core/src/visual/publishing.ts`). The gallery carries no values. It never creates, renders or sends a file.
- **Audience redaction** (core, `redactVisualDocument` / `redactDocumentModel`): a restricted value never appears in any profile; finance values, values that cite a `.private` source, unapproved values, unknown question ids and draft marks (every badge) never reach `public` or `investor`. A published logo master that still carries a `draft` tag is drawn in both, without any mark; an unpublished draft-tagged master and draft-tagged mascot artwork are drawn in neither (investor follows public, owner decision 2026-11-24). Competitor analysis is internal only; business and marketing plans are never public, and the Business Report (the business plan as a book) is internal only: no public or investor edition is built (owner decision 2026-11-24). Every public visual edition Studio serves goes through the public profile; the builders are a fixed point of it (`tests/visual-publishing.test.ts`).

## Tests

All GitHub traffic is an in-memory fake at the HTTP level (`tests/helpers/fake-github.ts`), which refuses any non-GitHub host; no test reaches the network or creates a real repository.

- `tests/studio-publishing.test.ts`: Command Center strip and mini-map, the 7 × 3 gallery, blocked cells, no values in the gallery, public prints without restricted, finance or draft data or draft marks, GET-only, guest and forged-slug handling, fa (RTL, Persian digits) and tr.
- `tests/studio-github.test.ts`: client retries and redaction, tar safety, redirect handling, webhook signatures.
- `tests/studio-provision.test.ts`: creation, personal profile, validation, duplicates, concurrent create, retry, partial-create cleanup, public-repository refusal, missing template, interrupted jobs.
- `tests/studio-static.test.ts`: in-memory static files, ETag and `304`, versioned CSS/JS links and the cache policy.
- `tests/studio-sync.test.ts`: merged-branch projection, edits made outside Studio, stale cache, cross-brand refusal, recreated repositories, concurrent refresh, credential guard.
- `tests/studio-server.test.ts`: guest isolation, sign-in, the full owner journey, personal and mascot-free brands, forged slugs, no mutation endpoints, CSRF/Origin, wizard errors and GitHub failure with retry, stale and failed sync, webhooks, headers and static-bundle leaks, locales, sessions, configuration.
- `tests/studio-hardening.test.ts`: behind-the-proxy behavior (Secure `__Host-` cookies, HSTS, downgraded Origin, Host allowlist, forged `X-Forwarded-For`), health readiness, session idle and absolute expiry, listener limits.
- `tests/studio-cli.test.ts`: `bootstrap-owner` (0600 file, verifiable hash, no overwrite, no argv password, enrollment on stderr only) and `check-config` (no secret values printed).
- `tests/studio-deploy.test.ts`: the Phase 10 package (Dockerfile, Compose, Caddy block, env template, scripts), the production bundle passing `smoke-test.sh`, the smoke test failing on a leaky server, the backup and restore drill. Set `CADDY_BIN` to also validate the Caddy block with a real Caddy.
- `tests/studio-browser-production.test.ts`: headless Chrome over HTTPS through a TLS proxy. Covers Secure HttpOnly `__Host-` cookies, CSRF from same-site and cross-site origins, CORS and framing blocks, and a foreign Host.
- `tests/studio-template-update-job.test.ts`: the periodic check with fake timers: check-only default, one pull request per brand with the flag on, linking an open one, refused accounts, jitter, back-off and rate limits, clean stop, configuration.
- `tests/studio-template-update.test.ts`: the update check (cache, rate-limit back-off), the update pull request (core files only, brand files byte-identical, default branch unmoved, conflicts reported, audit), idempotency, branch reuse, busy and refused brands, and the route (guest, CSRF, Origin, flash, en/fa/tr).
- `tests/studio-pending-sync.test.ts`: open pull requests as counts (record counting, paginated GET-only file lists, caching, rate limits, overview card and compact line in en/fa/tr without branch content), the default-branch poll and its configuration, `/healthz` while GitHub fails, the webhook guide, approved display names on every surface, and mixed fa/en markup.
- `tests/studio-browser.test.ts`: real headless Chrome over the DevTools protocol (no npm dependency). Owner journey with the progressive wizard and provisioning polling, every page at 1440/1024/390 px without horizontal overflow, static accessibility checks, keyboard (skip link, focus ring, mobile drawer with Escape and focus return), Persian RTL mirroring with LTR code, Turkish LTR, the self-hosted fonts and logo, AA text contrast in light and dark, CSP enforcement and no third-party requests, the template update indicator and **Open update PR** (accessible, RTL, no overflow), and a mixed fa/en value (parentheses, a file name, a URL) in logical order in the en and fa UI. These are part of the Studio suite (`npm run test:studio`, `npm run test:full`, `npm run ci`), not of `npm test`, which is the brand suite. They run when Chrome is installed (`CHROME_PATH` or the usual paths) and **skip with a message when it is not**. In CI they run only in the template repository (the `studio` job of `validate.yml`, on `ubuntu-latest`, which ships Google Chrome; no Playwright); brand repositories never run the Studio or browser suite. `npm run test:e2e` requires a browser and fails without one. `STUDIO_E2E_SCREENSHOTS=<dir>` saves desktop/tablet/mobile screenshots in English and Persian for visual review.
- `tests/studio-content-strategy.test.ts`: `brand:content share-strategy` (approved revision only; no drafts, restricted block or fact values; owner only), the path filter, withholding by reason, the read-only page hidden without data and shown in en/fa, and the old-cache rebuild.
- `tests/studio-social-kit.test.ts`: `brand:social kit share` (no seals or secrets; owner only), approval only with a matching shared digest, a hand edit shown as not verified, a foreign or extended summary withheld, the read-only page with inline wireframes and per-language fonts in en/fa, and no seal or secret in the page or the cache.

## Known limits

- One owner account. No SSO or multi-user roles.
- Sessions and rate limits live in memory, so a restart signs the owner out. The registry and sync cache persist in `STUDIO_DATA_DIR`.
- Interview question text and module guidance inside brand documents are English unless the brand repository has localized them; Studio's own interface is fully localized in en, fa and tr.
- Font specimens use a family only if it is installed on the viewing device; Studio never loads a brand's font files (it self-hosts only its own interface fonts).
- The VPS deployment package (image, Compose, Caddy block, runbooks, Grok handoff) is in `infra/production` and `docs-internal/phase-10/`. It has not been deployed; the live launch is a separate operator step.
