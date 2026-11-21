# Brand OS template

Approved brand truth for every AI tool. *(Working positioning. The final hero line is an owner decision.)*

A private-first GitHub template for one brand and the business system inside it. An owner interviews (alone or with a coding agent), approves facts in batches, generates cited documents and design tokens from those facts, and lets scoped agents read only what was approved. The docs, tokens, and interview engine are reusable. The answers are not. Nothing in this repository is an approved brand.

Brand OS is English-first. Persian (fa, right to left) and Turkish (tr) are equal, optional locales. See [Languages and locales](#languages-and-locales).

Brand OS Studio (`apps/studio`) is an optional private, read-only web viewer for all your brands that can also create a new private brand repository from this template. Editing always happens in Claude Code inside the brand's repository. See [Studio](#studio).

## Quickstart (new brand)

Use **Use this template** to create a new private repository, clone it, then:

```bash
npm install
# Restricted answers and backups are encrypted with this key. Store it in your secret manager.
export BRAND_OS_DATA_KEY="$(node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))")"
npm run brand:init -- --name "Your brand" --slug your-brand --industry "TBD" --mascot false --gamification false --publish private --yes
npm run brand:doctor -- --create-approval-secret   # creates brand/.private/approval-secret, never printed
npm run brand:interview                            # one question at a time, in English
npm run brand:review                               # drafts and pending changes against approved facts
npm run brand:approve -- --module brand-strategy   # one proof for the batch, from env or a hidden prompt
npm run brand:document -- --type brand-book        # cited Brand Book from approved facts
npm run docs:start                                 # internal preview with the review dashboard
```

For a person rather than a company, use `--profile personal-brand` and pick facets: `--facets founder-executive,consultant-expert` (also `creator-educator`, `artist-designer`, `speaker-author`). See [Personal brands](#personal-brands).

`brand:init` defaults to `--language en --languages en` and `--publish private`. Add locales with `--languages en,fa,tr` (see below). Scripts do not load `.env`; keep `BRAND_OS_DATA_KEY` in your shell or secret manager. Run `npm run brand:doctor` whenever something looks wrong; it never prints secret values.

## Commands

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

| Command | What it does |
| --- | --- |
| `npm run docs:start` | Local preview, internal audience, port 3000. Includes the `/dashboard` review page (coverage, review queue, contradictions). |
| `npm run docs:build` | Public docs build (English by default, plus the `fa` (RTL) and `tr` locale builds) |
| `npm run build:docs:nomascot` | Public build with mascot and gamification hidden |
| `npm run brand:init -- --name "Name" --slug name --yes` | Set identity and reset the interview |
| `npm run brand:interview` | Ask one question at a time |
| `npm run brand:resume` | Continue the saved session |
| `npm run brand:next -- [--json] [--profile <id>]` | Next questions with reasons, open conflicts, follow-ups, tentative and unresolved answers, and restricted questions that only the owner answers |
| `npm run brand:interview -- --question <id> --answer "…" [--json]` | Answer any question in any order. This is the agent mode. Restricted questions are refused here. |
| `npm run brand:propose -- --file <batch.json \| -> [--dry-run] [--json]` | Store a schema-validated batch of extracted proposals as drafts with quotations. It never approves. It rejects unknown and restricted ids, and quotations that are not in the source text. |
| `npm run brand:interview -- --assist --file <text \| -> [--json]` | Read a free-form answer and propose drafts. It uses the model set in `llm` in `brand.config.yaml` (off by default), or deterministic rules if none is set. Restricted passages are withheld first. |
| `npm run brand:status` | Coverage and approval, separately |
| `npm run brand:review -- [--module <id> \| --ids <id,…>] [--json]` | Review queue: each draft or pending change against the approved revision, with impacted documents and questions. Restricted values are withheld. `--full` prints the older ledger recap. |
| `npm run brand:approve -- --module <id>` or `-- --ids <id,chg-…>` | Approve a whole module or a list of question ids and change ids with one proof. Every item is reported (`approved`, `skipped`, `refused`, `stale`, `unknown`); nothing is dropped silently. A wrong proof changes nothing. `--dry-run` shows the queue without a proof. The proof is read from `BRAND_OS_APPROVAL_PROOF`, piped stdin, or a hidden prompt; `--proof` on the command line is refused. Create the secret once with `npm run brand:doctor -- --create-approval-secret`. It lives in `brand/.private/approval-secret` and is not committed. |
| `npm run brand:publish -- --ids <id,…>` or `-- --module <id>` | Add approved, public-classified facts to the publication allowlist. Approval never publishes. Internal and restricted facts are refused. `--unpublish` withdraws them. Same proof rules as approve. |
| `npm run brand:document -- --type brand-book\|business-plan\|marketing-plan [--audience internal\|public] [--json]` | Render a cited document. Every item is tagged approved, assumption, recommendation, or missing, with source ids. Restricted values are withheld. The internal edition is refused while `BRAND_OS_AGENT_TOKEN` is set. |
| `npm run brand:init -- … --profile personal-brand --facets a,b` | Person-centered brand. `--personal true` turns the personal modules on with the full bank (person plus business). |
| `npm run brand:document -- --type personal-brand-book\|professional-bio\|linkedin-pack\|website-pack\|media-kit\|speaker-kit\|content-strategy\|portfolio-pack\|services-pack\|evidence-register` | Personal deliverables. Personal claims are labelled verified, owner-stated or unverified. Bio sections report their word count against the guideline and are never padded. |
| `npm run brand:evidence -- list\|add\|verify\|reject\|withdraw\|check` | Evidence and permission register for personal claims (`brand/interview/evidence-register.yaml`, references only). `verify` and `reject` need the owner proof; `withdraw` does not and unpublishes dependent claims. |
| `npm run brand:retract -- --question <id> --reason "…"` | Remove an approved claim and its publication, keep ledger history, rebuild drafts. Needs the owner proof. |
| `npm run brand:tokens:generate -- [--dry-run] [--json]` | Turn approved color, type-scale and logo-size answers into draft tokens in `brand/tokens/generated/`. Never overwrites an approved token id. |
| `npm run brand:tokens:approve -- --ids <token.id,…>` | Record the value hash of generated tokens in `brand/tokens/approvals.yaml`. EXAMPLE base tokens are refused. Same proof rules as approve. |
| `npm run brand:tokens:publish -- --ids <token.id,…> [--unpublish]` | Add hash-approved tokens to `approved_token_ids`. Same proof rules as approve. |
| `npm run brand:doctor` | Check Node, `BRAND_OS_DATA_KEY`, the approval secret, the config and publication policy, and that `.env` is ignored. Never prints secret values. `--json` for machines. Exits non-zero on a hard failure. |
| `npm run brand:finance -- --input <file outside the repo \| restricted:<name>> [--json]` | Compute CAC, margin-adjusted LTV, churn and retention, MRR/ARR, gross profit and margin, net burn, runway, break-even and scenario projections. Every result carries unit, period, basis (actual, forecast, hypothetical) and formula; missing inputs give `MISSING`, never a guess. Input files inside the checkout are refused unless gitignored and untracked (`brand/restricted/finance/`). Format: `examples/finance/inputs.example.yaml`. Output is printed only. |
| `npm run brand:agent-token -- issue --profile <internal-read\|design\|marketing\|finance> --label <name>` | Issue a read-only agent token (printed once, stored hashed). `list` and `revoke --id <agt_…>` manage them. Same proof rules as approve. |
| `npm run brand:query -- --kind facts [--module <id>]` | Local retrieval with the identity from `BRAND_OS_AGENT_TOKEN` (guest without it). |
| `npm run mcp:serve` | Local MCP stdio server with the same retrieval path (`brand_retrieve`, the draft-only `draft_personal_content`, and 17 thin tools). |
| `npm run brand:backup`, `brand:restore`, `brand:migrate` | Encrypted backup of brand state (including migration history), validated restore, and idempotent migration. |
| `npm run brand:export` | Gitignored snapshot. `--public` redacts non-public answers |
| `npm run brand:validate` | Schema, catalog, token, and asset checks |
| `npm run example:education` | Education-app fixture in a temp directory |
| `npm run example:b2b` | Mascot-free B2B fixture in a temp directory |
| `npm run studio:start` | Start the private read-only Studio on `127.0.0.1:4100` (configuration from the environment, see `apps/studio/.env.example`). |
| `npm run studio:hash-password`, `npm run studio -- totp-secret\|session-secret\|brands\|register\|unregister` | Owner server commands for Studio: password hash, secrets, and registering an existing private brand repository. |
| `npm run test:e2e` | Studio browser tests in headless Chrome (they also run inside `npm test` when Chrome is installed, and skip otherwise). |

Details: `docs-internal/SETUP.md`.

## Mark this repository as a template

GitHub → **Settings** → **General** → check **Template repository**. This checkout is already private and marked as a template. Leave it that way. Do not put secrets in it.

## Create a brand repository

Use **Use this template**, not a fork. Forks are for contributing to the template. Follow the [Quickstart](#quickstart-new-brand). `--mascot false` hides the mascot docs and skips those questions; the catalog stays in the repo. See `docs-internal/NEW_BRAND.md`.

## Interview

The interview asks one question, explains why it matters, and shows an example labeled as an example. Answers are stored in `brand/interview/answer-ledger.yaml` with source, authority, and visibility. `unknown` and `skip` stay unresolved; nothing is invented. `npm run brand:resume` uses the session file, not the model's memory.

A coding agent can drive the interview instead: `brand:next --json` picks the next questions, `brand:interview --question <id> --answer … --json` answers any question, and `brand:propose --file` stores schema-validated proposals with verbatim quotations as drafts. `brand:interview --assist` reads a free-form answer with the configured model (`llm.provider`: `none` by default, `mock`, or `anthropic` with `ANTHROPIC_API_KEY`) or deterministic rules. Restricted data is never sent to a model provider. See `agent-skills/brand-interviewer/SKILL.md`.

Restricted finance and partner fields are encrypted under `brand/.private/` and are omitted from the public site, the public export, documents, the dashboard and every agent response.

## Change and approval workflow

Nothing an interview, an agent or a model writes is approved. Approval and publication are separate, deliberate steps by the owner.

1. **Draft.** Answers and proposals are drafts (`proposed`, `tentative` or `unresolved`).
2. **Review.** `npm run brand:review -- --module <id>` (or `--ids …`, `--json`) shows each draft or pending change next to the approved revision, with the documents and questions it affects. The internal docs build shows the same queue at `/dashboard`.
3. **Approve.** `npm run brand:approve -- --module <id>` or `-- --ids <id,chg-…>` approves a batch with one proof. The proof is read from `BRAND_OS_APPROVAL_PROOF`, piped stdin, or a hidden prompt; `--proof` on the command line is refused. A wrong proof writes nothing. Every item is reported as `approved`, `skipped`, `refused`, `stale` or `unknown`. `--dry-run` shows the queue without a proof. Approve and publish refuse to run while `BRAND_OS_AGENT_TOKEN` is set.
4. **Publish.** `npm run brand:publish -- --ids <id,…>` adds approved, public-classified facts to the publication allowlist. Internal and restricted facts are refused. `--unpublish` withdraws them.
5. **Change an approved fact.** `change <id>: <new value>` in the interview (or `brand:propose` with a correction) creates a pending change proposal against the current version. The approved revision stays canonical, and agents keep reading it, until the change is approved by its `chg-` id. A proposal made against an older version is refused as `stale`. An approved replacement of a published fact is unpublished until published again.
6. **Regenerate.** `brand:document`, `brand:tokens:generate` and the docs build read approved facts, so they pick up the new revision. Tokens generated from approved answers are drafts until `brand:tokens:approve` (value hash) and `brand:tokens:publish`; an approved token id is never overwritten.

## Agent access

Agents read the brand through `npm run mcp:serve` or `npm run brand:query`. Identity is decided once at startup from `BRAND_OS_AGENT_TOKEN`:

- No token: guest. Published public facts only; a private brand denies every call.
- A valid token: the owner-chosen profile (`internal-read`, `design`, `marketing`, `finance`). Approved items in that profile's modules, published or not. Drafts are never returned.
- An unknown, revoked or other-brand token: the server exits. It never falls back to guest.

Issue a token with `npm run brand:agent-token -- issue --profile internal-read --label "laptop agent"`. It is printed once and stored hashed in `brand/.private/agent-tokens.json` (gitignored). Every profile is read-only, and restricted values come back as `withheld` for every profile, including `finance`. Reads are logged to `brand/.private/access-log.jsonl` without values. See `docs-internal/AI_CONNECTORS.md` and `docs-internal/adr/0003-agent-access.md`.

## Personal brands

A person is not a company, and a person may still run one. `--profile personal-brand` asks about the person: identity, positioning, story, experience and credentials, evidence and portfolio, content, visual presence, and privacy. Facets add short groups for founders, consultants, creators, artists and speakers, and they combine. Company legal-entity, SaaS and mascot questions count as not applicable, not missing.

- Every organization is one relationship row with a relation, dates and an ownership state that defaults to `unstated`. Founding or working somewhere never makes the person an owner.
- Home addresses, personal phone numbers, birth dates, government ids and family details are refused on every write path.
- Credentials, results, case studies, prior talks and similar claims need a verified, independent source before `brand:publish` accepts them. Case studies, testimonials and portraits also need a public-use permission. Owner testimony is shown as owner-stated, never as verified.
- `draft_personal_content` gives an agent the approved facts for one deliverable. It is always a draft with no authority to approve or publish.

Guide: `docs-internal/PERSONAL_BRAND.md`. Existing `universal` brands are unchanged; `npm run brand:migrate` adds the personal bank with the module off.

## Languages and locales

English is the base language for the product, CLI, docs, interview question text, examples and defaults. Persian (`fa`, right to left) and Turkish (`tr`) are equal, optional locales supplied as locale data:

- Interview prompts: each question has an English prompt plus `fa` and `tr` translations in the question bank. Switch with `lang fa`, `lang tr` or `lang en` during the interview. A missing translation falls back to English.
- Answers: free text in any of the three languages, or mixed, is recorded as written. Persian and Arabic-Indic digits and Arabic-script separators are accepted in structured answers. The deterministic extractor reads all three through locale keyword data (`packages/brand-core/src/llm/lexicon.ts`).
- Docs portal: `defaultLocale` is `en`; the `fa` (RTL) and `tr` builds use `apps/docs/i18n/<locale>/`. Brand Book and dashboard styles use logical properties and isolate user text for RTL.
- Enabling locales for a brand: `npm run brand:init -- … --languages en,fa,tr`. A new locale needs its locale data (question-bank prompts, `i18n.ts` tables, lexicon entries, `apps/docs/i18n/<locale>/`) and an entry in the `Locale` type; no interview or approval logic is language-specific.

Official brand sentences are never auto-translated. See `docs-internal/LOCALIZATION.md`.

## Docs

`npm run build` prepares a public site only when `publish_docs` is `public`. The EXAMPLE template is public because it holds no confidential facts. `brand:init` defaults to private, and a public build of a private brand stops. The public site carries approved and published facts only; the `/dashboard` page there is a stub with no brand data. `npm run docs:start` is the internal preview with drafts, the internal Brand Book and the review dashboard; do not deploy it. `build/fa` is right to left. Search is local and currently English-only. Restricted values stay in `brand/.private` and are omitted from every build. `npx tsx scripts/scan-public.ts apps/docs/build` checks a built site for canaries, private files and raw tokens. See `docs-internal/DEPLOYMENT.md`.

## Tokens and assets

Answer the structured color, type-scale and logo-size questions, approve them, then run `npm run brand:tokens:generate`. Generated drafts in `brand/tokens/generated/` override the EXAMPLE base values with the same id and stay drafts until `brand:tokens:approve` and `brand:tokens:publish`. You can still edit `brand/tokens/*.json` by hand, then `npm run tokens:build`. Outputs are CSS variables and TypeScript. The palette is EXAMPLE and the contrast pairs in the template pass WCAG AA for the listed combinations. The SVG files under `brand/assets` are placeholders. The mascot turnaround is missing on purpose.

## Studio

One private Studio shows every brand at `/brands/<slug>` and creates new ones. It is a viewer plus a repository provisioner, not an editor:

1. Sign in (password and authenticator code), choose **New brand**, and enter name, slug, profile (business or personal brand), languages, optional mascot and gamification, and the GitHub destination. Studio creates one **private** repository from this template with the same initializer as `brand:init`, and shows progress, errors and retry.
2. Copy the repository URL or the **Claude Code starter prompt** and open a new Claude Code session. Claude Code needs its own GitHub access to the private repository (a clone or an authorized GitHub connection); a link is not permission.
3. Edit in Claude Code, approve facts yourself with the local CLI, and merge the pull request.
4. Refresh Studio: it shows the merged default branch with its commit SHA and sync time, cited documents, tokens, approved assets, history and open pull requests (labelled non-canonical).

Studio has no chat, no AI, no edit or approval controls, no uploads and no Git actions. Its only GitHub write is creating a new repository. Phase 8 personal brands are shown read-only. Setup, GitHub permissions, security model and tests: `docs-internal/STUDIO.md`. Deployment to a server is a separate step and not part of this template yet.

## Agent instructions

`AGENTS.md`, `CLAUDE.md`, and `agent-skills/` describe how to read this repo without inventing facts. `npm run brand:query` and `npm run mcp:serve` are local. They are not a hosted connection.

## Status

`docs/IMPLEMENTATION_STATUS.md` lists what is implemented, partial, and not started. `CHANGELOG.md` lists the 0.2.0 changes, including breaking ones.
