---
title: Personal Positioning
sidebar_position: 2
tags:
  - personal
  - personal-positioning
visibility: public
module_id: personal-positioning
owner: person
status_note: starter
optional_module: personal
---

# P-02 — Personal Positioning

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Who the person helps, what they are known for, the outcome they can show, and the offers that exist today.

## Decision this informs

What to say yes to, and what the person should not be presented as.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Known for | yes | public | `personal.positioning.known_for` |
| Primary audience | yes | internal | `personal.positioning.primary_audience` |
| Expertise topics | yes | public | `personal.positioning.expertise` |
| Outcome you help create | yes | internal | `personal.positioning.outcome` |
| Point of view | yes | internal | `personal.positioning.perspective` |
| Offers | yes | internal | `personal.services.offers` |
| Expertise boundaries | optional | internal | `personal.positioning.boundaries` |
| Offer | canonical reference | internal | `business.offer.summary` |

## Guidance

Expertise is a claim. Say which parts you can demonstrate with work.

Offers that exist and ideas for later are different records. Ideas stay labeled as ideas.

If the person sells through a company, the company offer in business.offer.summary stays canonical and is referenced, not restated.

## Fill-in record

The empty record is `brand/personal/02-positioning/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-positioning.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Known for turning messy discovery into a two-week plan, by seed-stage founders.” Illustration only.

## Do

- Name one primary audience.
- Name the limits of your expertise.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.

## Review checklist

- [ ] Primary audience recorded or unknown.
- [ ] Known-for sentence recorded or unknown.
- [ ] Offers separated from ideas.

## Dependencies

- `personal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/personal-positioning.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when the audience or offers change.

## Metrics

- None defined yet.

