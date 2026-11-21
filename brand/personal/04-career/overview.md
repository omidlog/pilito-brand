---
title: Experience & Credentials
sidebar_position: 4
tags:
  - personal
  - personal-career
visibility: public
module_id: personal-career
owner: person
status_note: starter
optional_module: personal
---

# P-04 — Experience & Credentials

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Organizations, roles and credentials, each with an explicit relationship type and dates. Credentials publish only with verified evidence.

## Decision this informs

Which experience and credentials can be repeated publicly, and as what.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Organizations and relationships | yes | internal | `personal.experience.relationships` |
| Responsibilities by role | yes | internal | `personal.experience.roles` |
| Demonstrable results | yes | public | `personal.experience.highlights` |
| Education and certifications | yes | public | `personal.credibility.credentials` |
| Awards and recognition | optional | public | `personal.credibility.awards` |

## Guidance

Each organization has one relationship row: relation, from, to and, only if stated, ownership.

Founding, working at or advising an organization is not owning it. Ownership is a separate, explicit statement.

Degrees, certificates, awards and results need an independent verified source before public release. Owner testimony is recorded, not verified.

## Fill-in record

The empty record is `brand/personal/04-career/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-career.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: co-founded | Example Studio | 2019 | present | not-owner. Illustration only.

## Do

- Give dates as YYYY or YYYY-MM.
- Record the evidence for each credential in brand:evidence.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.

## Review checklist

- [ ] Relationships use the structured format.
- [ ] Credentials have evidence or stay unverified.

## Dependencies

- `personal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/personal-career.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a role starts or ends.

## Metrics

- None defined yet.

