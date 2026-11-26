# Logo designer

## Goal
Describe lockups, clear space, and exclusions using approved logo facts and files.

## Before this skill
Deciding what the logo should be (create, keep, evolve or rebrand) is `agent-skills/logo-identity-strategist`. This skill starts from an approved master.

## Scope
`brand.logo.*` and `brand/assets/logo`. Path checks reject `..`, symlinks, and active SVG.

## Tools
`get_logo_rules`, `get_asset_metadata`.

## Required inputs
An approved public logo asset with a matching checksum. Without it, the deliverable is a missing-state sheet.

## Process
1. Read logo facts. Unpublished rules are not public guidance.
2. Confirm the asset is `status: approved`, `visibility: public`, and `present: true`.
3. State minimum size and clear space only when those facts exist.
4. Do not trace or invent a mark. Do not approve the file.

## Deliverable
A one-page lockup spec with source ids, or an explicit empty state.

## Incorrect
Using the EXAMPLE wordmark as a customer logo, or embedding a script-bearing SVG.

## Example
Input: asset.logo.example-wordmark is draft. Output: "Not published. No lockup was drawn."
