# Brand Runtime + Visual DNA — PR 0 preflight

Read this before adding `visual_dna`, `runtime_prepare`, `runtime_check` or anything that assembles brand context,
visual references or quality reports for an agent. It is an audit, not a feature: **this PR ships no production code.**

- Audited baseline: `main` at `5aec92e` (2026-11-23, Visual Blueprint P0 / PR #25 merged), fetched fresh for this work.
- Open PRs at audit time: #28 Trust v2 PR-A (`feat/trust-v2-pr-a`), #29 Task Context Engine Slice 1
  (`feat/task-context-p0`, CI green, mergeable, not reviewed), #30 Strategic Coach PR 1 (`feat/coach-pr-1`).
  A local, unpushed branch `feat/visual-v1-v2` (Visual V1.1: renderer registry, framework registry) also exists.
- Spec: the owner's Runtime DNA v1 package (owner notes, not in this repository).

## Stop gate result

| Gate | State | Consequence |
| --- | --- | --- |
| Task Context Engine (`task_context`) on `main` | **Missing.** No `task_context` / `task-context` symbol, schema, test or doc on `main`. Implemented in open PR #29. | **Stop after PR 0.** PR 1 (Visual DNA) and PR 2 (Runtime) must consume PR #29's resolver, pin vocabulary and permission rule, not re-create them. Building them now would mean either a duplicate context path or code written against an unmerged API. |
| Visual PR #25 | Merged (`5aec92e`). | `VisualDocument` is on `main`. Runtime must reuse it for any visual artifact, not fork it. |
| Further visual work (`feat/visual-v1-v2`) | Local, not pushed, not a PR. | Still treat `apps/studio/**` and `packages/brand-core/src/visual/**` as reserved for the visual track. |
| Strategic Coach (#30), Trust v2 (#28) | Open. | Both carry "quality" vocabulary (`coach/quality.ts`, `assurance/*`). Quality Gate (PR 3) must be reconciled with whichever merges first. |

## 1. Reuse matrix — existing capability → canonical source → consumer → authorization → missing piece

| Capability | Canonical source (code) | Current consumer | Authorization | Missing for Runtime / Visual DNA | Owner decision | Tests that pin it | Target files (later PR) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Approved facts | `brand/instance/approved-facts.yaml` → `brandRetrieve(kind:'facts')` (`query.ts`) | MCP, `brand:query`, creative context, content briefs | `authorize()` + `AGENT_PROFILES[profile].allowsModule` (`auth.ts`); restricted never | Purpose-specific assembly → **PR #29 `task_context`** | none | `agent-access.test.ts`, PR #29 `task-context.test.ts` | none (reuse) |
| Hash-approved tokens | `brand/tokens/` + approvals → `brandRetrieve(kind:'tokens')` | MCP `get_brand_tokens` | `readable()`; EXAMPLE / unapproved hash never returned | none | none | `tokens.test.ts`, `brand-tokens.test.ts` | none (reuse) |
| Asset register | `brand/assets/asset-manifest.yaml` → `readableAssets`, `assetItem`, `brandRetrieve(kind:'asset')` | MCP `get_asset_metadata`, `brand_retrieve` | `readable()` + `rightsBlocker` (`asset-rights.ts`) + `assetIsPublic` (`publication.ts`) + SVG inspection (`@brand-os/asset-catalog`) | (a) **no list-readable-assets reader** (PR #29 finding 2); (b) **no byte delivery to an agent** — only `path` + `checksum_sha256`; (c) no "provider/model upload allowed" field | Should a `model_use` rights field be added to the manifest? Default proposed: absent ⇒ not allowed for external providers. | `svg-assets.test.ts`, `agent-access.test.ts` | PR 1: read-only projection in `packages/brand-core/src/visual-dna/` |
| Mascot artwork by emotion/stage/use/angle | `brand/mascot/catalog.yaml` + manifest → `brandRetrieve(kind:'mascot')` with `explanation` | MCP | `readable()`; disabled module ⇒ `not applicable` | reference **set** (front / ¾ / profile) is not modelled; only per-state rows | Which views count as canonical? Owner approves, never generated. | `mascot.test.ts` | PR 1 (read only); no catalog schema change before owner decision |
| Creative Learning (selected / rejected / partial-keep variants, scoped preferences, cited reasons) | `brand/.private/creative` + Knowledge notes → `creative/context.ts`, `runCreativeContextTool` (`creative/agent.ts`) | MCP `creative_context` | `creative-read` profile only; drafts withheld; local note text withheld; access-logged | `ReferenceItem.asset` gives `state` + `asset_id` only; no checksum re-verification against the current file, no delivery mode, no rights state | none — Visual DNA is a projection of this, **no second memory** | `creative-agent.test.ts`, `creative-security.test.ts` | PR 1 consumes `buildCreativeContext` output unchanged |
| Strategy (content / SEO / paid) | `strategy/store.ts` → `runStrategyTool` (`strategy/feed.ts`) | MCP `strategy_list/get` | `STRATEGY_PROFILES`; one strategy kind per profile; restricted block withheld; stale pin refused | none | none | `strategy-feed.test.ts` | none (reuse via PR #29) |
| Content calendar / briefs | `content-bridge/*` → `runContentTool` | MCP `content_calendar/brief/report` | `content-read` only | "ten posts" ≠ ten calendar slots; Runtime must never create slots or approvals | none | `content-agent.test.ts`, `content-journey.test.ts` | none |
| Visual semantic layer | `packages/brand-core/src/visual/` (`VisualDocument`, BMC) | Studio `/visual` | built through `documents/model.ts` `itemFor` | Not a reference resolver. **Name collision risk:** Visual DNA must live in its own folder (`visual-dna/`), not in `visual/` | none | `visual-bmc.test.ts`, `studio-visual*.test.ts` | none in PR 1 |
| Caller identity | `resolveAgentContext` from `BRAND_OS_AGENT_TOKEN` at process start (`agent-tokens.ts`, `scripts/mcp.ts`, `scripts/brand.ts`) | MCP, `brand:query` | fixed once; no tool argument can set brand, role, profile or token | none | No new profile is proposed. Visual DNA uses `creative-read` (facts as `design`, assets, creative context). | `agent-access.test.ts` | none |
| Access log | `appendAccessLog` (`access-log.ts`) | every agent tool | ids only, no values | none | none | `agent-access.test.ts` | reuse: one line per `visual_dna` call |
| Brand QA guidance | `agent-skills/brand-qa/SKILL.md` | agents (prose) | n/a | deterministic checker code | none | none | PR 3 extends this skill; no parallel QA skill |
| Answer quality (proposed) | PR #30 `coach/quality.ts`, PR #28 `assurance/*` | not on `main` | n/a | — | Which one owns "quality" vocabulary? | — | PR 3 waits for this |

Nothing above is rebuilt. Visual DNA (PR 1) is a selector + checksum/rights/delivery verdict over `creative_context`
and `brandRetrieve(kind:'asset')`, run under **the same caller context**.

## 2. Permission matrix for the planned tools

Per-source, never unioned. The Runtime and Visual DNA pass the caller's own `AuthContext` to every reader and never
build a second, wider one (PR #29 asserts the same rule for `task_context`).

| Planned tool / data | `design` | `marketing` | `creative-read` | `content-read` | `strategy-ads-read` | `strategy-seo-read` | `internal-read` | guest / other brand |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `visual_dna` — approved asset metadata | yes | yes | yes | yes | yes | yes | yes | denied, no metadata |
| `visual_dna` — Creative Learning references and preferences | `not_authorized` | `not_authorized` | **yes** | `not_authorized` | `not_authorized` | `not_authorized` | `not_authorized` | denied |
| `visual_dna` — asset bytes (`delivery: usable`) | **never over MCP in v1** (see §4) | never | never | never | never | never | never | never |
| `runtime_prepare` (PR 2) — paid strategy slice | no | no | no | no | yes | no | no | denied |
| any path under `brand/.private` | never | never | never | never | never | never | never | never |
| restricted facts (budgets, finance) | never | never | never | never | never | never | never | never |

Every plan, pack and report carries `authorizes: []` and `publish/schedule/spend/deploy/approve: false`.

## 3. Task recipe matrix (user request → recipe → readers → minimal grants → missing → delivery → risk → tests)

| User request | Recipe (PR 2) | Current readers | Minimal grant | Exact missing source today | Asset delivery mode today | Main risk | Tests required |
| --- | --- | --- | --- | --- | --- | --- | --- |
| "Design ten Instagram posts" | `social_set` | `task_context` (PR #29) → facts, tokens, assets; `creative_context`; optionally `content_brief` when slots exist | `creative-read` for visual refs; `content-read` for slot briefs (two tokens, two separate calls — never merged into one principal) | No renderer in repo; no set-diversity check; no byte delivery | `metadata_only` | Treating ten posts as ten approved slots; auto-calendar | ten-item count, cohesion + diversity (advisory), no slot created, `blocked_missing_renderer` when no tool |
| "Build a website" | `website_draft` | `task_context` → facts (`marketing`), tokens, logo assets | `marketing` | No sitemap/page questions; no local site builder; nav/CTA may be unanswered | `metadata_only` (logo path + checksum) | Guessing value proposition or CTA | build + a11y + RTL on a local draft; no deploy path exists |
| "Paid ad creative" | `ad_concepts` | `strategy_get` (paid) + `task_context` | `strategy-ads-read` | Paid strategy may not be approved; no channel-size registry | `metadata_only` | Inferred ROAS/CAC; allocation; launch | stale pin refused, restricted budget absent, no spend field |
| "Mascot / single visual" | `mascot_visual` | `brandRetrieve(kind:'mascot')`, `creative_context` | `creative-read` | Canonical view set (front / ¾ / profile) not modelled | `metadata_only`, or `missing` with exact filter explanation | Substituting another state; claiming pixel-identical likeness | absent pose ⇒ `missing`, disabled module ⇒ not applicable, wrong checksum ⇒ `changed` |

## 4. Byte delivery — decision for PR 1

The spec allows `usable` only when "authorized asset bytes are deliverable through an existing verified path".
**No such path exists for agents today**: `brandRetrieve` returns metadata (`path`, `checksum_sha256`), MCP is stdio text,
and Studio is owner-only and read-only. Therefore PR 1 should:

1. Compute delivery verdicts deterministically: `missing` (not in manifest, `present: false`, file absent, or checksum
   mismatch ⇒ `changed`), `withheld` (caller not authorized, or `rightsBlocker` fires), `metadata_only` (authorized,
   present, checksum verified, no transport).
2. Offer `usable` only to the **owner CLI** for a caller-chosen reference id, reading bytes from the manifest path after
   path, symlink, checksum and SVG-script checks, returning sha256 + media type + size. No file is written; no URL is minted.
3. Leave an owner-local, time-limited export directory to a later, separately approved PR.

## 5. File-touch / conflict map

| File or area | #28 Trust | #29 Task Context | #30 Coach | `feat/visual-v1-v2` (local) | Runtime PR 0 | Runtime PR 1 (planned) | Runtime PR 2–4 (planned) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `docs-internal/BRAND_RUNTIME_PREFLIGHT.md` | | | | | **new** | update | update |
| `AGENTS.md`, `CLAUDE.md` | CLAUDE | both | both | | — | one line each, after #29 merges | PR 4 |
| `CHANGELOG.md`, `docs/IMPLEMENTATION_STATUS.md` | both | both | both | | — (deliberately untouched: 3 open PRs edit the top of both) | append section | append section |
| `packages/brand-core/src/index.ts` | | yes | | | — | yes (export) — rebase on #29 | yes |
| `packages/brand-core/package.json` (exports) | yes | | yes | | — | yes (`./visual-dna` subpath) | — |
| `tsconfig.json` (paths) | yes | | yes | | — | yes | — |
| `scripts/brand.ts` | | yes | | | — | yes (CLI verb) — rebase on #29 | PR 2 |
| `scripts/mcp.ts` | | | | | — | yes (`visual_dna`) | PR 2 (`runtime_prepare`) |
| `scripts/help.ts`, `package.json` | | | both | | — | maybe | maybe |
| `schemas/README.md` | | yes | yes | | — | yes (`visual-dna.schema.json`) | yes |
| `packages/brand-core/src/visual/**` | | | | yes | — | **no** | **no** |
| `packages/brand-core/src/validate-repo.ts` | | | | yes | — | no | no |
| `apps/studio/**` | | | | yes | — | **no** | PR 5 only, after visual track settles |
| `agent-skills/brand-qa`, `creative-memory`, `social-designer`, `mascot-creator` | | | | | — | `creative-memory` note | PR 3/4 |
| `packages/brand-core/src/visual-dna/**`, `tests/visual-dna*.test.ts` | | | | | — | **new** | — |
| `packages/brand-core/src/runtime/**`, `tests/runtime*.test.ts` | | | | | — | — | **new** |

All three open PRs and the planned Runtime PRs append to `index.ts`, `package.json` exports, `tsconfig.json`,
`CHANGELOG.md` and `IMPLEMENTATION_STATUS.md`. These are append-only conflicts, resolved by rebase; no migration is needed
and every planned schema is new (no change to an existing schema).

## 6. CI baseline

Command from the current `package.json`: `npm run ci`
(`lint && typecheck && validate && test:full && build && build:docs:nomascot`), run on `5aec92e` in this worktree.
The actual result is recorded in the PR description and in the owner report; it is not restated here so this file
does not go stale.

## 7. Audit findings worth an owner decision

1. **Task Context PR #29 is the prerequisite.** Review and merge (or reject) it before any Runtime code. Its own
   findings: `get_logo_rules` / `get_motion_guidelines` asked for ids the question bank does not have (fixed, BUG-01,
   see `docs-internal/TASK_CONTEXT.md` finding 1), and there is no "list readable assets" reader (still open).
2. **No model/provider-use right exists on assets.** Proposed default: absent ⇒ not allowed to leave the machine.
3. **Mascot reference sets are not modelled.** Do not invent canonical views; the owner must register and approve them.
4. **Two open PRs define "quality" differently** (Coach answer quality, Trust controls). Pick one vocabulary before
   Quality Gate PR 3, or the Runtime will be the third.
5. **There is no renderer in the repository.** Journeys A–D can return honest briefs and `blocked_missing_renderer`
   until an image / layout / site tool is actually present in the session; none may be marked complete without a real artifact.
