# Task Context Engine — preflight audit and Slice 1 (core + CLI)

Read this before touching `packages/brand-core/src/task-context/`, the `task_context` tool or anything that claims to
assemble brand context for a task. It is two things: the **Step 0 preflight audit** (what already exists, which gate
owns it, which field answers which question) and the **guide to what Slice 1 actually ships**.

The goal is not another brand database. It is one read-only orchestration over the readers that already exist, so that
an authorized agent asked for "ten Instagram posts" or "one visual" can fetch a cited, purpose-specific brief in one
call instead of re-interviewing the owner or inventing the gaps.

- Audited baseline: `main` at `bf30e2d` (2026-11-23, Content Bridge Slice D / PR #27 merged), re-fetched before this work.
- Visual Blueprint P0 (PR #25) was **open** at that moment. See "PR #25 overlap" below.
- Contract: `schemas/task-context.schema.json`, `brand-os/task-context/v1`. The `$id` URL in that file is an
  identifier, not a deployed endpoint; no hosted API exists.

## What this is not

- Not a second store. The pack is built fresh on every call from the canonical readers and keeps nothing.
- Not an approval, and not permission to act: every pack carries `authorizes: []` and
  `permissions {publish: false, schedule: false, spend: false, deploy: false}`.
- Not an interview. Gaps are reported as existing `FieldQuestion` ids, never as new questions and never as guesses.
- Not a new privilege. There is **no new agent profile**. Every source keeps the gate it already had, and the caller's
  own token decides what it gets. A `design` token asking for a paid-media brief gets the brief without the strategy.

## Preflight 1 — reuse matrix (verified in this checkout)

| Pack need | Existing component | Where | Change type |
| --- | --- | --- | --- |
| Approved facts, per-item authorization | `brandRetrieve(kind: 'facts')` → `readable()` → `authorize()` | `packages/brand-core/src/query.ts`, `auth.ts` | **Reuse unchanged** |
| Fact ids per content role (voice, claims, audience, messaging, pillars, channels, offers, CTA, languages, objective) | `CONTENT_SOURCES`, `activeSources`, `isPlaceholderValue`, `splitItems` | `content-bridge/sources.ts` | **Reuse**; task-context selects from this table instead of restating it |
| Hash-approved design tokens | `brandRetrieve(kind: 'tokens')` (EXAMPLE and unapproved hashes never returned) | `query.ts`, `@brand-os/design-tokens` | **Reuse unchanged** |
| Asset metadata, rights, checksum, SVG gate | `brandRetrieve(kind: 'asset')` → `readableAssets` → `rightsBlocker` + `inspectAssetForPublication` | `query.ts`, `asset-rights.ts`, `@brand-os/asset-catalog` | **Reuse**; candidate ids come from the manifest, every id is still gated per item |
| Mascot artwork by emotion / stage / use case / angle | `brandRetrieve(kind: 'mascot')` with `explanation` for what is missing | `query.ts`, `mascot-lifecycle.ts` | **Reuse unchanged** |
| Approved content / SEO / paid-media strategy | `runStrategyTool('strategy_list' \| 'strategy_get')`, `STRATEGY_PROFILES`, `servable()` | `strategy/feed.ts` | **Reuse unchanged** (same ctx, so the profile still decides) |
| Scoped creative preferences and cited reasons | `runCreativeContextTool` | `creative/agent.ts` | **Reuse unchanged** (`creative-read` only) |
| Caller identity | `resolveAgentContext` from `BRAND_OS_AGENT_TOKEN` at process start | `agent-tokens.ts`, `scripts/mcp.ts`, `scripts/brand.ts` | **Reuse unchanged** — no tool argument can set a brand, role, profile or token |
| Audit line without values | `appendAccessLog` | `access-log.ts` | **Reuse**; one extra line per `task_context` call, ids only |
| Deterministic digest over canonical JSON | `canonicalJson`, `sha256Hex` | `strategy/model.ts` | **Reuse** for `digests.context_sha256` |
| Locale detection, Persian/Arabic digits, channel words | `detectLocale`, `asciiDigits`, `detectChannels` | `llm/rules.ts`, `structured.ts`, `content-bridge/sources.ts` | **Reuse** in the classifier |
| Interview question ids for gaps | `allQuestions()` / `fieldRegistryEntry` (engine) | `content/index.ts` | **Reuse**; a test fails if the task map names an id the bank does not have |

Nothing in the list is rebuilt. The new code is a selector, a readiness/gap rule and a renderer.

## Preflight 2 — permission matrix

The caller context is resolved once from the environment. `task_context` passes **that same context** to every reader;
it never constructs a second, wider context, and it never merges results from two principals. This is the one rule that
makes the pack safe, so it is asserted in tests.

| Source | Gate that already exists | `design` | `marketing` | `creative-read` | `content-read` | `strategy-ads-read` | `strategy-seo-read` | `internal-read` | guest / no token |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Approved facts, brand/visual/UI modules | `authorize` + `AGENT_PROFILES[profile].allowsModule` | yes | yes | yes | yes | yes | yes | yes | denied |
| Approved facts, business modules (customer, offer, marketing, sales) | same | **no** | yes | **no** | yes | yes | yes | yes | denied |
| Restricted facts (for example `business.marketing.budget`) | `authorize` (no profile has the `restricted` scope) | never | never | never | never | never | never | never | never |
| Hash-approved tokens | `readable()` | yes | yes | yes | yes | yes | yes | yes | denied |
| Approved assets, mascot artwork | `readable()` + rights + checksum | yes | yes | yes | yes | yes | yes | yes | denied |
| `content` strategy revision | `STRATEGY_PROFILES` | no | no | no | **yes** | no | no | no | denied |
| `paid_media` strategy revision | `STRATEGY_PROFILES` | no | no | no | no | **yes** | no | no | denied |
| `seo` strategy revision | `STRATEGY_PROFILES` | no | no | no | no | no | **yes** | no | denied |
| Creative preferences and cited reasons | `creativeAccess` | no | no | **yes** | no | no | no | no | denied |
| Calendar weeks and per-slot briefs | `contentAccess` | no | no | no | yes | no | no | no | denied |
| `.private` (approval proof, local notes, competitive dossiers, identity briefs, restricted drafts) | never read by any agent path | never | never | never | never | never | never | never | never |

`task_context` itself requires an owner-issued token of this brand with any read profile — the same precedent as the
Strategy Feed and the Content Bridge. A guest, an unprofiled agent and a token of another brand get `denied` with no
metadata. A source the caller may not read becomes a `missing[]` entry with reason `not_authorized` and an owner
instruction; the pack never says what that source contains, or whether it exists.

## Preflight 3 — field coverage

Each pack key resolves to the **first** of its fact ids that is approved and not a placeholder. Everything else is a
gap with the question id to ask. The ids below exist in the question bank (`tests/task-context.test.ts` asserts it).

| Section | Pack key | Fact ids (in order) | Source of the list |
| --- | --- | --- | --- |
| identity | `brand_name` | `business.identity.trade_name`, `brand.identity.public_name_override` | task-context |
| identity | `sector` | `business.identity.sector` | task-context |
| identity | `purpose` | `brand.strategy.purpose` | task-context |
| identity | `values` | `brand.strategy.values` | task-context |
| identity | `positioning` | `brand.strategy.promise`, `brand.strategy.differentiation` | `CONTENT_SOURCES` role `messaging` |
| identity | `value_proposition` | `business.offer.value_proposition`, `brand.verbal.tagline` | `CONTENT_SOURCES` role `messaging` |
| identity | `audience` | `business.customer.primary_segment`, `business.sales.buyer`, `personal.positioning.primary_audience` | role `audience` |
| identity | `offer` | `business.offer.summary`, `brand.campaign.offer_source`, `personal.services.offers` | role `offers` |
| identity | `objective` | `business.marketing.objective`, `personal.goals.outcomes` | role `objective` |
| identity | `voice` | `brand.verbal.voice`, `brand.verbal.voice_pairs`, `brand.personality.traits`, `brand.verbal.name_use`, `personal.content.channel_tone` | role `voice` |
| identity | `person` | `personal.identity.name_forms`, `personal.identity.headline` | task-context (personal module only) |
| strategy | `pillars` | `business.marketing.pillars`, `personal.content.pillars` | role `pillars` |
| strategy | `channels` | `business.marketing.channels`, `brand.social.channels`, `personal.content.channels` | role `channels` |
| strategy | `cta` | `brand.social.cta`, `personal.consulting.cta` | role `cta` |
| strategy | `content_strategy` / `paid_strategy` / `seo_strategy` | Strategy Feed revision + `content_sha256` | `strategy/feed.ts` |
| creative | `color_roles`, `type_scale`, `rtl_rules` | `brand.color.roles`, `brand.type.scale`, `brand.type.rtl` | task-context |
| creative | `logo_rules` | `brand.logo.masters`, `brand.logo.variants`, `brand.logo.clear_space`, `brand.logo.min_size`, `brand.logo.misuse` | task-context |
| creative | `mascot_rules` | `brand.mascot.role`, `brand.mascot.personality`, `brand.mascot.forbidden` | task-context (mascot module only) |
| creative | `motion_rules` | `brand.motion.principles`, `brand.motion.duration`, `brand.motion.reduced` | task-context |
| creative | `tokens`, `assets`, `mascot_artwork`, `creative_preferences` | the readers above, ids and revisions only | `query.ts`, `creative/agent.ts` |
| production | `ui_components`, `ui_states`, `ui_platforms` | `brand.ui.components`, `brand.ui.states`, `brand.ui.platforms` | task-context |
| production | `social_exports`, `social_safe_area` | `brand.social.exports`, `brand.social.safe` | task-context |
| production | `languages` | `brand.verbal.localization`, `brand.social.localization` | role `languages` |
| production | `banned_claims` | `brand.verbal.forbidden`, `business.marketing.availability_claim`, `personal.governance.public_claim_policy` | role `claims` (also copied into `guardrails`) |
| production | `channel`, `deliverable_count`, `output_format`, `locale`, `request_mode` | the caller's request | not a brand fact: item state `owner_stated`, `source_id: null` |

Personal rows count only when `modules.personal.enabled` is true; mascot rows only when `modules.mascot.enabled` is.

## Findings from the audit

1. **Fixed (BUG-01): `get_logo_rules` and `get_motion_guidelines` asked for ids that do not exist.** They requested
   `brand.logo.primary`, `brand.logo.clearspace`, `brand.motion.easing`, so both tools always reported those fields
   missing, even for a brand that answered and approved them. Every named fact tool now reads its ids from
   `NAMED_FACT_TOOL_IDS` in `packages/brand-core/src/query.ts`; logo and motion use the same ids as the `logo_rules`
   and `motion_rules` keys here (`brand.logo.masters|variants|clear_space|min_size|misuse`,
   `brand.motion.principles|duration|reduced`). The response envelope is unchanged; each tool now lists more ids.
   Easing curves and milliseconds are tokens (`get_brand_tokens`), not facts. `tests/named-tool-ids.test.ts` pins
   every id against the question bank and the field registry.
2. **There is no "list the assets I may read" reader.** `brandRetrieve(kind: 'asset')` answers by id only. Task-context
   collects candidate ids from `brand/assets/asset-manifest.yaml` and then asks `brandRetrieve` for them, so the
   authorization, rights, checksum and SVG gates still decide every item and nothing unreadable is disclosed. A
   dedicated list kind would be cleaner and is proposed for a later slice.
3. **Example assets and EXAMPLE tokens are already excluded** by status (`draft`) and by the approval hash, so the
   "no example substituted" rule needs no new code — only a test, which Slice 1 has.
4. **`brand:query` has no owner path.** Like the content and strategy tools, `task_context` needs an owner-issued
   token even when the owner runs it locally. That is consistent, but it means the owner must issue a token to look at
   a pack. Worth an owner decision later; not changed here.
5. **Locale.** `brand:query` already carries `--lang` for the content tools. Task-context takes `--locale` with the
   same `en` / `fa` / `tr` set and keeps approved wording byte-identical in every locale: only labels and gap text are
   localized, and nothing is machine-translated.

## PR #25 overlap

PR #25 (Visual Blueprint P0) touches `apps/studio/**`, `packages/brand-core/src/visual/**`, `scripts/visual-golden.ts`,
`tsconfig.json`, `package.json`, `packages/brand-core/package.json`, `docs/IMPLEMENTATION_STATUS.md` and `CHANGELOG.md`.
Slice 1 touches **no Studio file and no visual file**, and deliberately exports the new module from
`packages/brand-core/src/index.ts` instead of adding a subpath, so it does not edit the two files where PR #25 adds
its own `./visual` lines. The only shared files are the two documentation files, where both changes are additive.

## What Slice 1 ships

`packages/brand-core/src/task-context/`

- `model.ts` — the typed contract, the task enum, the fixed guardrail notice, the digest.
- `sources.ts` — the field map above, built on `CONTENT_SOURCES` where a role already exists.
- `classify.ts` — a deterministic en/fa/tr keyword classifier: task type, deliverable count (Persian/Arabic digits
  included), channel. Weak cues (`design`, `طراحی`, `tasarım`) never decide a type on their own; zero matches or a tie
  returns `need_task_type` instead of a guess. No model is called, and the request text is never logged or echoed into
  the pack.
- `resolve.ts` — the resolver: access gate, per-task selectors over the canonical readers, gaps, guardrails, readiness,
  staleness, digest, access-log line.

CLI (`npm run brand:query -- --tool task_context`) with `--task-type`, `--request` (classifier, CLI only),
`--channel`, `--count`, `--locale`, `--mode`, `--output-format`.

### Readiness

- `blocked` — the caller cannot read even an approved brand name, the task's module is off (for example
  `personal_content` with `modules.personal.enabled: false`), or the request is not a valid task.
- `ready` — every required field for this task resolved to an approved, non-placeholder fact, and every strategy the
  task requires was served.
- `partial` — anything else. A partial pack is still useful: it says what is known, what is missing and which question
  decides it.

`staleness` is `current` when every served strategy is `current`, and `needs_review` when one is `review_due` or an
approved source it cites has changed. `stale_pin` arrives with pinned calendar reads in the next slice.

### Not in Slice 1 (and not pretended)

- No MCP tool in Slice 1. Added afterwards: see "MCP tool (GAP-02)" below.
- No calendar or per-slot brief in the pack (`scope_id`, `content_calendar`, `content_brief` pins): next slice. A
  ten-post request today therefore produces an **on-demand draft brief** and no approved slot — which is the required
  behaviour anyway, since an on-demand request is not an approved calendar week.
- No `task_context_validate`, no Studio view, no LLM classification path. (The skill handoff came with the MCP tool.)
- No deliverable is produced by this code. The pack is context for a drafting agent; it renders nothing.

## MCP tool (GAP-02)

`scripts/mcp.ts` registers one read-only stdio tool, `task_context`. It and the CLI call the same function,
`runTaskContextTool` (`task-context/agent.ts`), which calls `buildTaskContext`. No second retrieval path was added.

- **Identity.** The server resolves `BRAND_OS_AGENT_TOKEN` once at startup (`resolveAgentContext`) and passes that one
  context to every reader. No input names a brand, role, profile, token or audience; unknown keys are stripped by the
  schema. Contexts from different profiles are never combined: a `design` token gets no paid strategy, a
  `strategy-ads-read` token gets no content strategy.
- **Access first.** `taskContextAccess` runs before the request is classified, so a guest, an unprofiled agent or a
  token of another brand gets `denied` (logged) and learns nothing. An unknown, revoked or other-brand token stops the
  server at startup, as for every other tool.
- **Inputs.** `task_type` (enum) or `request` (at most 500 characters, classified in en/fa/tr, then dropped);
  `channel`, `deliverable_count` (1 to 50), `locale` (`en`, `fa`, `tr`), `request_mode`, `output_format`, `scope_id`.
  Explicit inputs win over the classifier. With no `locale`, the pack takes the language the request was written in (a
  Persian request gets `fa`). An unclear request returns `need_task_type` with the tied candidates.
- **No leaks.** The request text is not in the result, the access log or the pack digest. The log line holds ids only.
- **No writes** apart from the normal access-log line. `authorizes` is `[]` and every permission flag is `false`.
- **Readiness is context readiness.** `ready` means the approved context for the task is complete. It does not mean an
  asset file is deliverable, a renderer exists or a human reviewed anything.

Skill: `agent-skills/task-context/SKILL.md`. The social, UI, marketing and brand designer skills call it first, once.
Tests: `tests/task-context-agent.test.ts` (real stdio server: listing, the Persian ten-post request, digest equal to
the core pack, guest, cross-brand, revoked, forged arguments, profile isolation, schema bounds, no request text in the
log).

Setting it up in a new Claude Code session: `docs-internal/AI_CONNECTORS.md`, "Task context in a new Claude Code
session".

## Usage

```bash
# once, as the owner, in a trusted local shell
npm run brand:agent-token -- issue --profile design --label "design agent"

# then, as the agent
export BRAND_OS_AGENT_TOKEN=…
npm run brand:query -- --tool task_context --task-type visual_design --locale en
npm run brand:query -- --tool task_context --request "۱۰ پست اینستاگرام برای محصول بساز" --locale fa
```

Reading a pack authorizes nothing. `authorizes` is always `[]`, every permission flag is `false`, and the owner
remains the only principal who can approve, publish, schedule, spend or deploy.
