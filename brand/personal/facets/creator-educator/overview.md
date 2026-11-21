---
title: "Facet: Creator & Educator"
sidebar_position: 3
tags:
  - personal
  - personal-creator
visibility: public
module_id: personal-creator
owner: person
status_note: starter
optional_module: personal
personal_facet: creator-educator
---

# PF-03 — Facet: Creator & Educator

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Content series, audience segments, sponsorship categories, disclosure rules and dated, sourced audience metrics for a media kit.

## Decision this informs

What goes in the media kit and which sponsorships fit.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Content series | yes | internal | `personal.creator.series` |
| Audience segments | yes | internal | `personal.creator.audience_segments` |
| Audience metrics (dated, sourced) | yes | public | `personal.creator.metrics` |
| Sponsorship categories | yes | internal | `personal.creator.sponsorship` |
| Disclosure rules | yes | internal | `personal.creator.disclosure` |
| Content pillars | canonical reference | internal | `personal.content.pillars` |
| Channels and their goals | canonical reference | internal | `personal.content.channels` |

## Guidance

Pillars and channels are recorded once in Thought Leadership & Channels. Series sit on top of them.

Audience metrics are published only with a date and a verified source.

Disclosure of sponsorship follows the rules of each platform and jurisdiction; record yours explicitly.

## Fill-in record

The empty record is `brand/personal/facets/creator-educator/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-creator.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Weekly short video series on pricing basics.” Illustration only.

## Do

- Date every metric.

## Don't

- Do not invent ventures, clients, talks, exhibitions, metrics or press.
- Do not ask a question that the core modules already answered.
- Do not round metrics up.

## Review checklist

- [ ] Series recorded.
- [ ] Disclosure rules recorded.

## Dependencies

- `personal-content`

## Related drafts

Machine draft: `brand/generated/drafts/personal-creator.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Refresh metrics before every media kit.

## Metrics

- None defined yet.

