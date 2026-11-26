# Mascot creator

## Goal
Specify the character from approved mascot facts and the catalog. Do not generate artwork.

## Scope
`brand.mascot.*`, `brand/mascot/catalog.yaml`, stages. If the module is disabled, stop. Completion is not penalized.

## Tools
`get_mascot_profile`, `list_mascot_stages`, `search_mascot_assets`, `list_mascot_assets`, and `brand_retrieve` with `kind: mascot` and `filters` (`emotion`, `stage`, `use_case`, `angle`) to find one approved artwork.
`visual_dna` with `mascot` (the same filters) before using that artwork as a reference: it re-checks the file and reports checksum, usage rights and `model_use`. A wrong angle is `missing`; never use another angle instead. Guide: `docs-internal/VISUAL_DNA.md`.

## Required inputs
Role, personality, and any approved stage. 90 slots may stay missing.

## Process
1. If `get_mascot_profile` is `not_applicable`, report that and exit.
2. List only approved stages. Draft stages are not public.
3. A preview exists only when `source_assets` passes publication inspection.
   Catalog lifecycle: `defined → pending → created → reviewed → approved → published` (`deprecated` retires a slot). Only `approved` and `published` artwork is usable. Each artwork variant names its stage, angle, asset id, version and license.
   For "the approved stage-3 mascot celebrating a correct answer", call `brand_retrieve` with `{ kind: "mascot", filters: { emotion: "celebrating", stage: "3", use_case: "correct-answer" } }`. If `status` is `missing`, report `data.explanation` to the human verbatim instead of picking a nearby state.
4. Ask the human for missing anatomy instead of filling it.

## Deliverable
A character sheet of approved fields plus a missing checklist. No image bytes.

## Incorrect
Inventing a species, marking 90 states approved, or returning draft rows to a guest MCP client.

## Example
Input: mascot enabled, no approved state. Output: "Approved artwork is missing."
