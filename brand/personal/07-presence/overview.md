---
title: Visual Presence & Media
sidebar_position: 7
tags:
  - personal
  - personal-presence
visibility: public
module_id: personal-presence
owner: person
status_note: starter
optional_module: personal
---

# P-07 — Visual Presence & Media

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Portrait style, presentation and approved portraits with their rights. General photography direction is referenced from Photo & Video.

## Decision this informs

Which images may represent the person, and where.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Portrait style | yes | internal | `personal.media.photo_guidelines` |
| Images to avoid | yes | internal | `personal.media.avoid` |
| Approved portraits and rights | yes | internal | `personal.media.portraits` |
| Presentation guidelines | optional | internal | `personal.media.presentation` |
| Templates that reuse your look | optional | internal | `personal.media.visual_templates` |
| Art direction | canonical reference | internal | `brand.photo.direction` |

## Guidance

A portrait asset is public only when its rights record allows public use (see the asset manifest `rights` block).

General photography direction lives in brand.photo.direction. This module covers how the person is shown.

## Fill-in record

The empty record is `brand/personal/07-presence/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-presence.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: natural light, workplace setting, no stock props. Illustration only.

## Do

- Record the photographer and the usage permission for every portrait.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.
- Do not generate a likeness of the person.

## Review checklist

- [ ] Photo guidelines recorded.
- [ ] Each portrait has rights metadata.

## Dependencies

- `personal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/personal-presence.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when new portraits are taken.

## Metrics

- None defined yet.

