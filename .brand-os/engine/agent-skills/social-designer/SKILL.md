# Social designer

## Goal
Draft a social post that uses approved facts, follows one approved style from the social style kit, and refuses
unsupported claims.

## Scope
`task_context`, `social_style_kit`, `creative_context`, `get_social_template`, `get_marketing_plan`, verbal facts. The
starter social brief is a draft. Guide for the kit: `docs-internal/SOCIAL_STYLE_KIT.md`.

## Tools
`task_context` first, once per task. Then `social_style_kit` for the surface. Then, only for detail the pack does not
carry: `creative_context` (creative-read token), `get_social_template`, `get_brand_guidelines`, `get_marketing_plan`,
`get_brand_tokens`, `visual_dna`.

## Required inputs
Channel, format, approved message, and approved offer. No performance numbers unless a published fact contains them.

## Process
0. Call `task_context` once first (skill `agent-skills/task-context/SKILL.md`) with task type `social_batch`, and work
   from its pack. Its `social_styles` items name the approved styles for the channel.
1. Call `social_style_kit` with the surface (post, carousel, story, reel, reel_cover, thumbnail, linkedin_post,
   linkedin_document). Use only the styles it lists; `withheld` drafts do not exist for you.
2. Pick the slot's style. When the content brief names one, use it. Otherwise rotate through the approved siblings in
   order (slot 1 → first style, slot 2 → second …) so consecutive posts do not repeat a layout, and match the style's
   `use_when` and `content_types` to the slot.
3. Build the design layer by layer, back to front: each layer's zone (% of the canvas), its colour and font token ids
   (resolve with `get_brand_tokens`; an unapproved token stays unapproved), `max_words` / `max_lines`, and the
   style's `do` / `dont`. Keep text and the logo inside the safe zones.
4. Never invent a new style or mix two. If none fits, say so and describe a proposed style for the owner to add as a
   draft (`npm run brand:social -- kit …` is the owner's command, not yours).
5. If you hold a `creative-read` token, call `creative_context` for the surface and apply approved preferences and the
   owner's cited reasons; they refine the chosen style, they do not replace it.
6. Pull only published lines for the caption. If the offer is missing, the caption says the offer is not approved.
7. `reference_assets: missing` and a missing logo, portrait or mascot pose stay missing: check ids with `visual_dna`,
   never draw or borrow a substitute.
8. Do not schedule or publish the post.

## Deliverable
Caption draft, the style id and its approval digest, asset id or "no approved asset", source ids.

## Incorrect
Promising a price, a mascot, or a metric that is not in a published fact. Using a draft style, a raw hex colour, or a
layout that is not in the kit.

## Example
Input: no approved style for `story`. Output: "No approved story style in the social style kit. The owner can review
the drafts with `npm run brand:social -- kit review --surface story`."
