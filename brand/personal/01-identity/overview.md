---
title: Personal Identity
sidebar_position: 1
tags:
  - personal
  - personal-identity
visibility: public
module_id: personal-identity
owner: person
status_note: starter
optional_module: personal
---

# P-01 — Personal Identity

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Hold how the person is named and introduced in public: name forms, headline, roles and service scope. This is the person, not a company.

## Decision this informs

Which name and headline every bio, profile and introduction uses.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Public name | yes | public | `personal.identity.public_name` |
| Professional headline | yes | public | `personal.identity.headline` |
| Roles, specialties and industries | yes | public | `personal.identity.roles` |
| Other approved name forms | optional | public | `personal.identity.name_forms` |
| Localized headline | optional | public | `personal.identity.localized_headline` |
| Geographic service scope | optional | public | `personal.identity.service_scope` |
| Pronouns (optional) | optional | public | `personal.identity.pronouns` |
| Localization | canonical reference | internal | `brand.verbal.localization` |

## Guidance

The public name is the person’s; a company trade name lives in business.identity.trade_name and is never copied here.

Pronouns are optional and only recorded when the person volunteers them.

Service scope is a region or "remote". A home address is never collected.

## Fill-in record

The empty record is `brand/personal/01-identity/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-identity.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Alex Example — product strategy advisor for early-stage teams.” An illustration only.

## Do

- Record every approved name form once, including transliterations.
- Keep the headline short enough for a profile line.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.

## Review checklist

- [ ] Public name has a disposition.
- [ ] Headline has a disposition.
- [ ] No private location data is stored.

## Dependencies

- None. This module can start from the interview.

## Related drafts

Machine draft: `brand/generated/drafts/personal-identity.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when the role or headline changes.

## Metrics

- None defined yet.

