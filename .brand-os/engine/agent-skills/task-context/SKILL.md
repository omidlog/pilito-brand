# Task context

## Goal
Before drafting anything for this brand, read the approved context for that one task in one call, instead of asking
the owner to explain the brand again. Guide: `docs-internal/TASK_CONTEXT.md`.

## Scope
One visual, a batch of social posts, a website, a product screen, an ad concept, an identity brief or a personal page.
The pack is context only. It produces no deliverable and authorizes nothing.

## Tools
MCP `task_context` (local stdio server, `npm run mcp:serve`). Without MCP:
`npm run brand:query -- --tool task_context --task-type <type> [--channel …] [--count …] [--locale en|fa|tr]`, or
`--request "<the owner's sentence>"`.

## Required inputs
An owner-issued agent token of this brand in the MCP server's environment (`BRAND_OS_AGENT_TOKEN`). Never in a tool
argument, a prompt, a file you write or a log. And either `task_type` (`visual_design`, `social_batch`,
`website_design`, `product_ui`, `paid_campaign_brief`, `brand_identity`, `personal_content`) or the owner's request
sentence as `request`.

## Process
1. Call `task_context` once, at the start of the task. Pass the owner's sentence as `request`, or `task_type` if you
   already know it. Add `channel`, `deliverable_count` and `locale` only if the owner said them.
2. `denied`: you have no token for this brand, or it is another brand's. Say so and ask the owner to issue one
   (`npm run brand:agent-token -- issue --profile <profile>`). Do not look in `brand/.private` and do not answer from
   memory.
3. `need_task_type`: ask the owner which task it is, offering `candidates` if there are any. Do not guess.
4. `readiness: blocked`: stop and hand the owner the question ids in `missing[]`.
   `partial`: work from what is there and name every gap. `ready`: the context is complete for this task. It does not
   mean a renderer, an asset file or a reviewed design exists.
5. Apply `guardrails` as written. Quote approved sentences unchanged; never translate one that has no approved
   translation. Cite `source_id` and `source_revision` for every fact you use, and keep the pack's
   `digests.context_sha256` with your draft.
6. Do not call it again for the same task unless the owner changes the task or approves something new. For an exact
   mascot pose use `brand_retrieve` with `kind: mascot`; for approved calendar slots use `content_calendar` and
   `content_brief` with a pin.
7. Before you use an asset id from the pack (or a mascot pose) as a visual reference, check it once with `visual_dna`
   (`docs-internal/VISUAL_DNA.md`). Use only `approved` references; name `missing`, `withheld` and `changed` ones to
   the owner. `model_use` is not permission to send a file to any model, and you never receive file bytes over MCP.
8. Before you produce files, call `production_readiness` once with the same task inputs (add `required_assets: ["logo"]`
   only when the owner said the logo is a must). `not_ready`: name each blocker (check, rule owner, input) to the owner
   and do not work around it; a task with no renderer gets a brief, not an invented artifact. `ready` only means no
   deterministic blocker: the draft still goes to a person for review (`docs-internal/BRAND_RUNTIME.md`).

## Deliverable
Your draft, the pack digest, the source ids and revisions you used, and the list of what is still missing, by question
id.

## Incorrect
- Filling a `missing[]` id with a plausible value, or substituting a similar colour, asset, claim or mascot state.
- Treating `readiness: ready` as "the posts are done", or ten on-demand posts as an approved calendar week.
- Treating `production_ready: ready` as approval, a quality verdict or permission to publish.
- Publishing, scheduling, spending or deploying because the pack was `ready`. `authorizes` is always empty.
- Asking the owner to paste the brand voice when the pack already has it.

## Example
Input: "۱۰ پست اینستاگرام برای برند بساز" → `task_context { request: "…", locale: "fa" }`.
Output: `social_batch`, `deliverable_count: 10`, `channel: instagram`, `readiness: partial`, and `missing` names, for
example, `brand.social.exports`. The agent drafts ten captions from approved voice and claims, cites each source revision, and
says that the export sizes are still an open question for the owner.
