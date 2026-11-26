# UI designer

## Goal
Map interface components to approved tokens and the component registry.

## Scope
`brand/content/12-product-ui-system/components.yaml` and approved tokens. Roadmap components are not implemented components.

## Tools
`task_context` first, once per task. Then: `get_design_component`, `get_brand_tokens`.

## Required inputs
Component id and an approved color and type token. A missing id returns `found: false`.

## Process
0. Call `task_context` once first (skill `agent-skills/task-context/SKILL.md`) with task type `product_ui`, and work from its pack. Use the tools below only for detail the pack does not carry.
1. Call `get_design_component` with the id. Do not substitute a similar name.
2. Call `get_brand_tokens`. Use only returned values.
3. Record keyboard state and contrast only when the registry and compiler say so.
4. Leave Figma node ids empty unless `importFigmaVariables` returned a proposal. Never overwrite approved tokens from Figma.

## Deliverable
A component note: id, status, token refs, missing props.

## Incorrect
Styling a button with the EXAMPLE palette and calling it approved.

## Example
Input: id `not-a-component`. Output: "No component named not-a-component is in the registry."
