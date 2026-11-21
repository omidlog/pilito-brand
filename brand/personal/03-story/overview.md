---
title: Professional Story
sidebar_position: 3
tags:
  - personal
  - personal-story
visibility: public
module_id: personal-story
owner: person
status_note: starter
optional_module: personal
---

# P-03 — Professional Story

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

The professional story in the person’s own words: origin, turning points, motivation and the milestones they are comfortable sharing.

## Decision this informs

Which parts of the story may be told, and which stay private.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Origin | yes | internal | `personal.story.origin` |
| Turning points | yes | internal | `personal.story.turning_points` |
| Motivation | yes | internal | `personal.story.motivation` |
| Milestone timeline | yes | internal | `personal.story.timeline` |
| Next chapter (aspiration) | optional | internal | `personal.story.next_chapter` |

## Guidance

Professional story only. Family, health and other private history are not collected.

Milestones carry a year. Dates are facts and can be checked.

Aspirations are labeled as aspirations.

## Fill-in record

The empty record is `brand/personal/03-story/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-story.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Started as a teacher, moved into product after building a school tool.” Illustration only.

## Do

- Use the person’s own words.
- Keep milestones dated.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.

## Review checklist

- [ ] Origin recorded or unknown.
- [ ] Turning points recorded or unknown.

## Dependencies

- `personal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/personal-story.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review yearly.

## Metrics

- None defined yet.

