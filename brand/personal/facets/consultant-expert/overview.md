---
title: "Facet: Consultant, Expert & Mentor"
sidebar_position: 2
tags:
  - personal
  - personal-consultant
visibility: public
module_id: personal-consultant
owner: person
status_note: starter
optional_module: personal
personal_facet: consultant-expert
---

# PF-02 — Facet: Consultant, Expert & Mentor

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Methodology, engagement formats, target clients, pricing publication policy, confidentiality and the inquiry call to action.

## Decision this informs

How engagements are described and sold without invented prices or promised performance.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Methodology | yes | internal | `personal.consulting.methodology` |
| Engagement formats | yes | internal | `personal.consulting.engagements` |
| Target clients | yes | internal | `personal.consulting.target_clients` |
| Pricing publication policy | yes | internal | `personal.consulting.pricing_policy` |
| Confidentiality and ethics | yes | internal | `personal.consulting.confidentiality` |
| Inquiry call to action | optional | public | `personal.consulting.cta` |
| Offers | canonical reference | internal | `personal.services.offers` |
| Shareable projects and case studies | canonical reference | public | `personal.portfolio.projects` |

## Guidance

Offers are recorded once in personal.services.offers. This module describes how they are delivered.

Outcomes with clients need evidence and permission (personal.portfolio.projects).

Pricing policy says whether prices are published. Prices themselves are not collected here.

## Fill-in record

The empty record is `brand/personal/facets/consultant-expert/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-consultant.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Two-week discovery sprint, remote, fixed scope.” Illustration only.

## Do

- State confidentiality rules before naming any client.

## Don't

- Do not invent ventures, clients, talks, exhibitions, metrics or press.
- Do not ask a question that the core modules already answered.
- Do not promise performance or results.

## Review checklist

- [ ] Methodology recorded.
- [ ] Pricing publication policy recorded.
- [ ] Confidentiality rules recorded.

## Dependencies

- `personal-positioning`

## Related drafts

Machine draft: `brand/generated/drafts/personal-consultant.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when an offer changes.

## Metrics

- None defined yet.

