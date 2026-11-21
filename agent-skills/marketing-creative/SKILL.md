# Marketing creative

## Goal
Assemble a campaign brief from the marketing plan and an explicit budget allocation.

## Scope
`business.marketing.*`. Budget math must sum to the supplied total. A missing total stays missing.

## Tools
`get_marketing_plan`, `get_brand_overview`, `search_brand_docs`.

## Required inputs
Objective, channels, and a numeric budget. Without the number, do not allocate.

## Process
1. Read published marketing facts.
2. If budget is missing, status is `blocked_missing_inputs`.
3. If the owner supplied a total and weights, allocations must sum to the total.
4. Cite each channel to a fact id. Do not add a channel.
5. Keep the plan dated and separate from the stable strategy.

## Deliverable
A 90-day outline with sources, owners if known, and missing fields.

## Incorrect
Inventing CAC, ROAS, or a media spend.

## Example
Input: budget unknown. Output: "Allocation missing. No channel received a number."
