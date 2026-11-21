---
title: "Facet: Speaker & Author"
sidebar_position: 5
tags:
  - personal
  - personal-speaker
visibility: public
module_id: personal-speaker
owner: person
status_note: starter
optional_module: personal
personal_facet: speaker-author
---

# PF-05 — Facet: Speaker & Author

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Speaking topics, abstracts, languages, previous talks, stage introduction and publication history for a speaker kit.

## Decision this informs

What an event organizer receives and may repeat.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Speaking topics | yes | public | `personal.speaking.topics` |
| Talk abstracts | yes | public | `personal.speaking.abstracts` |
| Speaking languages | yes | public | `personal.speaking.languages` |
| Previous talks | yes | public | `personal.speaking.prior_talks` |
| Stage introduction | yes | public | `personal.speaking.introduction` |
| Publications | optional | public | `personal.author.publications` |
| Public professional contact | canonical reference | public | `personal.contact.public_channels` |

## Guidance

Booking contact is the public professional contact in personal.contact.public_channels.

Previous talks and publications are listed only with a source link.

Bios for a speaker sheet come from the Professional Bio document, not from new copy.

## Fill-in record

The empty record is `brand/personal/facets/speaker-author/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-speaker.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Talk: Decisions before roadmaps (30 min, English or Turkish).” Illustration only.

## Do

- Keep one abstract per topic.

## Don't

- Do not invent ventures, clients, talks, exhibitions, metrics or press.
- Do not ask a question that the core modules already answered.
- Do not list a talk you did not give.

## Review checklist

- [ ] Topics recorded.
- [ ] Stage introduction recorded.

## Dependencies

- `personal-positioning`

## Related drafts

Machine draft: `brand/generated/drafts/personal-speaker.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Update after every talk or publication.

## Metrics

- None defined yet.

