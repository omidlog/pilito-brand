---
title: Privacy, Contact & Governance
sidebar_position: 8
tags:
  - personal
  - personal-boundaries
visibility: public
module_id: personal-boundaries
owner: person
status_note: starter
optional_module: personal
---

# P-08 — Privacy, Contact & Governance

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

What stays private, how people may contact the person professionally, and who reviews drafts.

## Decision this informs

What an agent may never publish or use.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Private topics | yes | internal | `personal.privacy.boundaries` |
| Never-publish details | yes | internal | `personal.privacy.never_publish` |
| Public professional contact | yes | public | `personal.contact.public_channels` |
| Draft reviewer | yes | internal | `personal.governance.reviewer` |
| Public availability | optional | public | `personal.privacy.availability` |

## Guidance

Brand OS does not collect a home address, personal phone, birth date, government id or family details. Answers that contain them are refused.

Public contact means professional channels only: a booking link, a work email or a contact form.

These boundaries are internal and readable only by the owner and `internal-read` agents.

This is a privacy design, not a legal compliance certification. Jurisdiction-specific obligations (for example GDPR or KVKK) need a dedicated legal review.

## Fill-in record

The empty record is `brand/personal/08-boundaries/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-boundaries.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: never publish family, health or home location. Illustration only.

## Do

- List private topics explicitly.
- Use a contact form or booking link instead of a phone number.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.

## Review checklist

- [ ] Private topics recorded.
- [ ] Never-publish list recorded.
- [ ] Public contact is professional only.

## Dependencies

- None. This module can start from the interview.

## Related drafts

Machine draft: `brand/generated/drafts/personal-boundaries.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review whenever something private was nearly published.

## Metrics

- None defined yet.

