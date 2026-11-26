# Pilot and workflow acceptance (fixes pack PR-F)

`npm run brand:acceptance` runs the four journeys of the fixes pack end to end and records what actually happened. It
is the reproducible half of the pilot: the same harness runs in CI on a **synthetic** fixture and, owner-local, on a
real brand checkout. A live Claude session is the other half (§ 4); the harness never pretends to be one.

## 1. What it runs

The harness behaves like an agent that follows `agent-skills/task-context/SKILL.md`, and like the owner who renders
the drafts. It uses only existing paths:

- the real stdio MCP server (`scripts/mcp.ts`), started once per journey with a short-lived token for one profile in
  the **server's environment** (never in a tool argument): `task_context`, `visual_dna`, `production_readiness`,
  `get_logo_rules`, `get_motion_guidelines`;
- the real CLIs as child processes: `brand:runtime social-batch --pack … --root …`, `brand:runtime readiness`,
  `brand:visual-dna read … --for external_provider`.

| Journey | Case id | Profile | FIX cases | What it proves | Honest end state |
| --- | --- | --- | --- | --- | --- |
| 2 one visual | `single_visual` | `design` | FIX-01, 03, 05, 06 | canonical logo/motion ids, approved-only values; approved reference with checksum, rights and `model_use`; a missing pose stays missing; no provider export when `model_use` is not `external_allowed`; one changed byte → `changed` | `blocked`: there is no image renderer |
| 1 ten Instagram posts | `ten_instagram_posts` | `content-read` | FIX-02, 04, 05, 06 | the owner's Persian sentence → `social_batch` × 10; guest, revoked and other-brand tokens refused; fa/en/tr approved values identical; 10 SVG + 10 manifests pinned and cited; Persian copy RTL; no `brand/` writes, no publication; the gate re-checks the bytes; a banned claim fails; tampered pack, unsafe output paths and a brand changed after planning are refused | `produced` (drafts for human review) |
| 3 website brief | `website_brief` | `marketing` | FIX-07 | pack gaps are existing question ids (CTA state shown); fa/en/tr identical; no deployment claim | `brief_only`; the drafted sitemap is `NOT_TESTED` |
| 4 paid-ad brief | `paid_ad_brief` | `strategy-ads-read` | FIX-08 | the paid strategy only under the ads profile (design → `withheld / not_authorized`); no restricted value reaches any reply; nothing authorizes spend or publication | `brief_only` |

Every check is **PASS**, **FAIL** or **NOT_TESTED** with evidence made of ids, counts, codes, exit codes and checksums.
A case is PASS only when all of its checks passed; one FAIL makes it FAIL; anything else is NOT_TESTED. A check that
throws is a FAIL, never a pass. Things that cannot be tested in a brand (no Persian copy, no approved paid strategy,
nothing restricted to leak) say so as NOT_TESTED. Report contract: `schemas/acceptance-report.schema.json`
(`brand-os/acceptance-report/v1`).

Metrics per case (pilot metrics of `04-E2E-ACCEPTANCE-AND-PILOT`, without private text): tool calls, owner questions
(distinct existing question ids in the pack's `missing[]`: what a fresh session still has to ask), other gaps, files,
seconds. No quality score exists and none is invented.

## 2. Safety of the harness itself

- **Never writes the given checkout.** It copies `brand/` into a temporary snapshot, issues tokens there, runs
  everything against the snapshot and deletes it. The checkout's `brand/` is hashed before and after
  (`workspace.root_unchanged`); a run that changed it is a FAIL (exit 4) whatever its cases say. Mutations for negative tests (a changed asset byte, a changed approved fact via the
  owner change-request flow) happen on further copies.
- **Owner-local.** Refused while `BRAND_OS_AGENT_TOKEN` is set. Children never inherit an agent token or an approval
  proof from the caller's shell. Knowledge GitHub sync is off.
- **No model, no network.** Nothing is published, scheduled, spent, deployed or approved; `authorizes: []`.
- **Report hygiene.** The report and the printed summary carry no brand sentence, token or path. Every reply is
  scanned for issued tokens, `.private` secrets and restricted values (`no_secrets`, `paid.no_budget_leak`).
- `--out` must be new or empty and outside any `brand/` folder, checked on the real path (a linked parent folder
  cannot lead into `brand/`) before anything is created; it receives the drafted posts, the pack the posts
  were rendered from, and `acceptance-report.json`. **On a real brand these are private files**: keep them local.

## 3. Running it

```bash
# CI / anyone: synthetic fixture only (temp directory, removed afterwards)
npm run brand:acceptance -- --demo --out /tmp/acceptance-demo [--lang fa|en|tr] [--json]

# Owner-local pilot on a real checkout (read only; never commit the output)
npm run brand:acceptance -- --root ../my-brand --out /tmp/acceptance-my-brand --lang fa
```

Exit 0 when nothing failed, 4 when a case failed or the checkout changed, 2 on a usage error, 1 when the run could not start or stopped. The synthetic run is
pinned in `tests/acceptance-harness.test.ts` (three cases PASS; the website brief stays NOT_TESTED because no brief
renderer exists).

## 4. Setup guide: from nothing to ten posts in a fresh Claude Code session

This is the path the harness exercises, written for the owner. Every step is local.

1. **Have an approved brand.** Run the interview (`npm run brand:interview`) and approve facts
   (`npm run brand:approve`). Check what an agent would see: `npm run brand:status`. Only approved facts reach an agent.
2. **Run the acceptance harness once** on your checkout (§ 3). Read the owner questions it lists per journey: those are
   the existing question ids a session would ask you about. Answer and approve the ones you want; run it again.
3. **Issue one token per profile you need**, in a trusted local shell (posts: `content-read`; visuals and UI:
   `design`; a website brief: `marketing`; an ad brief: `strategy-ads-read`):
   `npm run brand:agent-token -- issue --profile content-read --label "claude-code posts"`.
4. **Register the local MCP server** in Claude Code with the token in the server's environment, from the brand
   repository: `claude mcp add brand-os --env BRAND_OS_AGENT_TOKEN=<paste token> -- npm run -s mcp:serve`. Never put
   the token in a prompt, a tool argument or a committed `.mcp.json`. See `docs-internal/AI_CONNECTORS.md`.
5. **Open a new session** in the brand repository and ask, in your language: "۱۰ پست اینستاگرام برای برند بساز".
   The agent calls `task_context` once (skill `task-context`), then `production_readiness`, and asks you only for the
   question ids in `missing[]`.
6. **Render the drafts yourself.** The agent saves the pack it got, with its own token in its environment
   (`npm run -s brand:query -- --tool task_context --task-type social_batch --count 10 --locale fa > pack.json`;
   `-s` keeps npm's header out of the JSON, and without a token the query is refused). Then, in your shell without
   an agent token: `npm run brand:runtime -- social-batch --pack pack.json --root . --out ../posts-draft`. With `--root` a pack that is
   older than an approved fact it cites is refused (`stale_pack`): build the pack again.
7. **Check and review**: `npm run brand:runtime -- readiness --pack pack.json --root . --batch ../posts-draft`.
   `ready` only means no deterministic rule blocks. Look at every draft yourself; taste is `needs_human_review`.
8. **Publishing is yours.** Nothing in Brand OS posts, schedules, spends or deploys.

What does **not** exist yet, so expect a brief or a block: image/mascot rendering, website building, ad assets and
ad-account access. A `blocked` or `brief_only` result is a correct, safe answer, not a production success.

## 5. Not covered (by construction)

Listed in every report under `not_covered`: a live model session (prompts, extra questions it might still ask), visual
taste and similarity, semantic persuasion, renderers that do not exist, and the owner's change requests after review.
These belong in the owner's pilot notes, not in CI.

## 6. Stale packs (fix found by this harness)

Changing the brand between planning and generation must rebuild or stop (`04-E2E`, FIX-05). Before PR-F,
`brand:runtime social-batch --pack … --root …` rendered a pack whose cited approved fact had since changed, and
`readiness` said `ready`. Now, with `--root` only, `packSourceDrift` compares each approved fact source of the pack with
the current approved revision: `readiness` adds the blocking check `context.source_drift`
(`code:stale_pack_sources`) and `social-batch` stops with `stale_pack` before anything is written. Without `--root`
nothing is compared and the projection is unchanged. Asset drift was already covered by the pinned checksum
(`pack_pin_differs`).
