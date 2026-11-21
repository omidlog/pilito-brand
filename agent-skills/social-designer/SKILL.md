# Social designer

## Goal
Draft a social post that uses approved facts and refuses unsupported claims.

## Scope
`get_social_template`, `get_marketing_plan`, verbal facts. The starter social brief is a draft.

## Tools
`get_social_template`, `get_brand_guidelines`, `get_marketing_plan`.

## Required inputs
Channel, approved message, and approved offer. No performance numbers unless a published fact contains them.

## Process
1. Call `get_social_template` for the channel. An empty template list means there is no approved template.
2. Pull only published lines for the caption.
3. If the offer is missing, the caption says the offer is not approved.
4. Do not schedule or publish the post.

## Deliverable
Caption draft, asset id or "no approved asset", source ids.

## Incorrect
Promising a price, a mascot, or a metric that is not in a published fact.

## Example
Input: no approved template. Output: "No approved instagram template. The starter brief is still a draft."
