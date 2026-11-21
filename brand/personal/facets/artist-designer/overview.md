---
title: "Facet: Artist & Designer"
sidebar_position: 4
tags:
  - personal
  - personal-artist
visibility: public
module_id: personal-artist
owner: person
status_note: starter
optional_module: personal
personal_facet: artist-designer
---

# PF-04 — Facet: Artist & Designer

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Practice and philosophy, aesthetic vocabulary, portfolio taxonomy, exhibitions and the usage rights for work and credits.

## Decision this informs

How work is shown, credited and licensed.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Practice and philosophy | yes | internal | `personal.artist.practice` |
| Aesthetic vocabulary | yes | internal | `personal.artist.aesthetic` |
| Portfolio taxonomy | yes | internal | `personal.artist.portfolio_taxonomy` |
| Exhibitions and publications | yes | public | `personal.artist.exhibitions` |
| Usage rights and credits | yes | internal | `personal.artist.usage_rights` |
| Shareable projects and case studies | canonical reference | public | `personal.portfolio.projects` |

## Guidance

Every portfolio piece needs a credit line and a rights record before public release.

Collaborators are credited by role; their names need their permission.

## Fill-in record

The empty record is `brand/personal/facets/artist-designer/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-artist.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Editorial illustration, identity systems, exhibitions.” Illustration only.

## Do

- Group work by a taxonomy that a client understands.

## Don't

- Do not invent ventures, clients, talks, exhibitions, metrics or press.
- Do not ask a question that the core modules already answered.
- Do not show client work without a recorded permission.

## Review checklist

- [ ] Practice recorded.
- [ ] Usage rights policy recorded.

## Dependencies

- `personal-proof`

## Related drafts

Machine draft: `brand/generated/drafts/personal-artist.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a piece is added to the portfolio.

## Metrics

- None defined yet.

