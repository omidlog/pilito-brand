# Coach UX decision: when the Strategic Coach speaks on its own

> Status: **decided and implemented on `feat/coach-ux`.** Owner input is weighed below; the open owner choices are
> listed at the end. The Coach's contract (`docs-internal/STRATEGIC_COACH.md`) is unchanged: read-only, advisory,
> `authorizes: []`, no model call, never quotes an answer, restricted questions never analysed, refused under an
> agent token, en/fa/tr with fa right to left.

## The problem

Until now the Coach ran only when the owner typed `npm run brand:coach …` (plus a warn-only report inside the
Brand Runtime ten-post path). The owner put it plainly: *"I don't know when I should use the Coach."* A tool you
must remember to call, at a moment you must recognise yourself, is in practice a tool that is never called. The
person who most needs the advice — someone who just gave a vague answer and is about to approve it — is exactly
the person who does not know it is vague.

So the question is not "how do we explain the Coach better" but **"which moments that already happen should
carry the Coach's advice, and in which of those moments must it stay silent?"**

## What the owner asked for (input, not spec)

- Help most **right after important strategic answers** and **before approving facts**.
- Stay **quiet** on trivial or factual answers, on *decide later*, on restricted questions.
- **Never nag or repeat**, **never score**, **never block** saving, approving or publishing.

## Options considered

| # | Option | Why not (or why) |
| --- | --- | --- |
| A | Better docs and a `help` entry | Still requires remembering. Does not address the problem. Rejected. |
| B | Run the Coach on **every** answer and print everything | 277 questions, most of them `long_text`/`high`: the owner would see advice on a trade name or a font. Noise teaches people to ignore a tool. Rejected. |
| C | A new **Coach step in the engine** (`InterviewEngine.submit` returns advice) | Couples the read-only coach into the single write path; every caller (batch import, proposals, tests) would inherit it. The engine must stay the one owner of answers. Rejected. |
| D | A **blocking gate** before approve (refuse to approve a `needs_clarification` draft) | The owner explicitly said never block, and the Coach contract says it authorizes nothing — a gate would make advice an authority. Rejected. |
| E | **Studio chat / "Ask the coach" button** | Studio rules forbid chat, AI and new mutation routes; a button is still "remember to press it". Rejected. |
| F | A **config flag, default off** (`capabilities.coach_follow_up`) | Default-off recreates the original problem: the owner would have to know the flag exists. Rejected as the default; kept as an **off switch** (below). |
| G | **Moment-based, filtered, non-blocking hooks** in the commands the owner already runs, plus a passive Studio card | Chosen. Details below. |

## Decision

The Coach appears **at three moments the owner already goes through**, filtered by one shared policy, and
otherwise stays silent. It is never a step you have to take and never a step that can stop you.

### The shared policy (one pure function, `coach/moments.ts`)

A question is **coach-worthy** only if all of these hold:

1. it is not restricted (restricted questions are not even analysed — silence, not a refusal message, because
   nobody asked);
2. it takes free text (`short_text`, `long_text`) **or** asks for a measure (`number`, or an id that names an
   objective, KPI, target, price, budget, runway …) — single choices, booleans, colours, fonts and logo specs are
   factual and never coached;
3. it is **strategic**: its id lives in one of the strategy namespaces — `brand.strategy`, `brand.personality`,
   `business.customer|problem|offer|model|market|plan|goals|growth|sales|marketing|product|finance`,
   `personal.positioning|services|story|goals` (`COACH_STRATEGIC_NAMESPACES`) — **or** it declares
   `publication_requires: verified_evidence` (a public claim that needs a source, wherever it lives). Namespaces,
   not modules, because the bank files e.g. `business.customer.primary_segment` under the `business-company`
   module.

Then, for that question, the existing Coach rules decide whether there is anything to say. A `ready` answer gets
**silence** — the cheapest coaching is none.

Every silent outcome carries a closed-vocabulary reason (`not_strategic`, `factual_type`, `restricted`,
`unknown_question`, `not_applicable`, `disposition`, `deferred`, `unanswered`, `already_coached`, `ready`,
`declined_gap`, `change_pending`, `agent_token`, `disabled`, `unavailable`; the list is
`COACH_SILENCE_REASONS`), so tests and the JSON output can show *why* it was quiet.

### When it is ON

| Moment | Trigger | What appears | Limit |
| --- | --- | --- | --- |
| **1. Right after an answer** | `brand:interview` (interactive) and the agent mode `brand:interview --question … --answer … [--json]`, immediately after the engine reports `recorded` | At most **one** short note: the missing dimension and either an existing question id to answer next, or one clarifying question. Plus how to add detail (`change <id>: …`) or simply continue. In `--json`, a `coach` object the interviewing agent can relay. | Only on the **first** answer revision of that question. Re-answering (including after the Coach's own question) never triggers it again, so there is no loop and no nagging. |
| **2. Before approving** | `brand:approve` (and its `--dry-run` preview), after the queue is read and **before** the proof prompt | "Coach notes before you approve": up to **three** drafts in this batch that have a deficit, one line each (question id, missing dimension, the one next step), then "N more: `npm run brand:coach -- analyze --mode quality_review --question <id>`". A closing line says approval is not blocked. | Drafts only, coach-worthy only, once per approve run. Printed on stderr in text mode so it never mixes with `--json` output. |
| **3. Studio Overview** | Every Studio sync of the merged default branch (no route, no button) | A read-only card "Before you approve: coach notes" listing up to five merged drafts with a deficit, in en/fa/tr, with the command to run in Claude Code. The card **does not render at all** when there is nothing to say. | Computed in the projection like the other cards; no new route; no owner words (canary-tested). |
| 4. Brand Runtime (unchanged) | `brand:runtime` ten-post path | The existing warn-only `coach` layer in the run report. | Unchanged. |

### When it is OFF (silent by design)

- The answer was `unknown`, `skip`, `not relevant`, or the question was put on *decide later* (no record is
  written for a deferral, so nothing fires; a later answer to a deferred question is treated normally).
- The question is restricted, factual (choice, boolean, colour, font, logo spec) or not strategic.
- The answer meets every criterion the Coach checks (`ready`).
- The gap would be closed by a question the owner deferred (`declined_gap`): a deferral is a decline.
- The question has been answered before (second and later revisions): **never repeat**.
- A pending **change proposal** (the Coach reads the ledger revision, not the proposed text, so it would be
  advising on the wrong value; it stays silent rather than mislead).
- Batch imports (`--batch`), `--assist`, `brand:propose`: bulk intake is not a conversational moment. The
  before-approval note covers those drafts at the moment they matter.
- `brand:review`: it is reading, not deciding. The note appears **once**, at the decision (`brand:approve`), not
  in both commands.
- `BRAND_OS_AGENT_TOKEN` is set (the Coach is owner-local; reported as `agent_token` in JSON).
- `BRAND_OS_COACH=off` (also `0`, `false`, `no`): the owner's off switch for the automatic moments in one shell.
  `npm run brand:coach` keeps working on demand.

### Why on by default

Option F shows why: a default-off helper is the problem we are solving. The automatic moments are safe to have
on because they cannot write, cannot block, cannot repeat and cost one short note at most per answer. The
`STRATEGIC_COACH.md` rollout note asked the owner to choose between "on by default" and a capability flag; this
decision picks on-by-default with an environment off switch and lists it below for the owner to confirm.

### Never blocks

Every automatic call is wrapped: an error inside the Coach becomes silence with reason `unavailable`, never a
failed save, approve or sync. The host command's exit code and output contract are unchanged (the agent-mode JSON
gains one additive `coach` key; the approve JSON is untouched).

## Guarantees kept (and how they are tested)

| Guarantee | How it holds for the automatic moments |
| --- | --- |
| Read-only, `authorizes: []` | The moment functions take the same read-only `CoachSource`; each moment result carries `authority: derived_advice` and `authorizes: []`; tests snapshot the brand and assert it is unchanged. |
| No model call | Moments call the existing deterministic `followUpReview` / `qualityReview` only. |
| Never quotes the owner | Notes are built from question ids, criterion names and the closed clarifying questions. Canary tests on the interview output, the approve output and the Studio projection. |
| Restricted refused | A restricted question is filtered before any rule runs; no value, digest or length. Tested with a restricted canary. |
| Denied under agent token | `agent_token` silence; tested. |
| No score | Statuses and criteria only. |
| en/fa/tr, fa RTL | New UI strings live in `COACH_UI` (covered by `coachI18nErrors`) and Studio's catalogs; Studio renders fa right to left. Screenshots en+fa in `docs/screenshots/coach-ux/`. |

### Changes to existing statements (justified)

- `STRATEGIC_COACH.md` said "PR 1 needs no config flag … there is no hook in `brand:interview` or Studio". That
  is now false by design: the hooks exist, and the off switch is `BRAND_OS_COACH=off` rather than a config field,
  because a per-shell switch needs no schema change, no migration and no approval, and keeps the brand config
  free of tool preferences.
- PR 4 in that guide planned a Studio projection "after the visual foundation and a security gate". The card
  here is the narrow version of that: a projection field like Knowledge or Calendar, GET only, no route, no
  chat, no model, built from the merged branch Studio already reads, and its output contains only ids and closed
  vocabulary. The privacy review is the canary test plus the restricted filter.

## Deferred

- `brand:next` / `brand:status` summaries ("3 drafts have a coach note") — useful but a second place for the
  same note; revisit after the owner has used the three moments.
- Advising on **pending change proposals** (needs the Coach to read the proposed text through the change flow).
- PR 2 rule work (potential tensions, personal facet rubrics) now exists (fixes pack GAP-08) but is **not** wired
  into the moments: the moments are built on `follow_up`, which the facet rubrics and the consistency registry do
  not touch, so the automatic notes are unchanged. Whether they should surface is an owner decision, taken together
  with the questions below.
- A Studio History & Review page column, and a docs `/dashboard` panel.
- Any per-brand persistent "dismiss" state. Not needed: the first-revision rule already prevents repeats without
  storage.

## For the owner to decide

1. **On by default** with `BRAND_OS_COACH=off` as the switch — or would you rather have it opt-in?
2. **The strategic namespace list** (`COACH_STRATEGIC_NAMESPACES`). It decides what "important" means. Add or remove
   namespaces if the Coach is too quiet or too talkative.
3. **Caps**: one note per answer, three per approve run, five on the Studio card.
4. Whether **`brand:review`** should also show the notes (today: only `brand:approve`, so you see each note once).
