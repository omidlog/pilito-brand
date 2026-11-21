---
title: "Facet: Founder & Executive"
sidebar_position: 1
tags:
  - personal
  - personal-founder
visibility: public
module_id: personal-founder
owner: person
status_note: starter
optional_module: personal
personal_facet: founder-executive
---

# PF-01 — Facet: Founder & Executive

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Venture history, founder narrative, leadership topics and investor/press positioning. Business ownership remains an explicit, sourced relationship.

## Decision this informs

How the person is introduced as a founder or executive, and what may be said about their companies.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Ventures and your role | yes | public | `personal.founder.ventures` |
| Founder narrative | yes | internal | `personal.founder.narrative` |
| Sectors you build in | yes | internal | `personal.founder.sectors` |
| Leadership topics | yes | internal | `personal.founder.leadership_topics` |
| Investor and press positioning | yes | internal | `personal.founder.investor_relations` |
| Organizations and relationships | canonical reference | internal | `personal.experience.relationships` |
| Trade name | canonical reference | public | `business.identity.trade_name` |

## Guidance

Each venture appears once in personal.experience.relationships. This module adds the story, not a second list of companies.

The company’s own name, offer and numbers stay in the Business OS (business.identity.trade_name and related ids).

Funding, revenue and ownership statements need verified evidence before public release.

## Fill-in record

The empty record is `brand/personal/facets/founder-executive/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-founder.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Co-founder and product lead of Example Studio (2019–present).” Illustration only.

## Do

- Name your exact role in each venture.

## Don't

- Do not invent ventures, clients, talks, exhibitions, metrics or press.
- Do not ask a question that the core modules already answered.
- Do not imply ownership from a founder or executive title.

## Review checklist

- [ ] Ventures recorded with role.
- [ ] Investor/press policy recorded.

## Dependencies

- `personal-career`

## Related drafts

Machine draft: `brand/generated/drafts/personal-founder.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review at each funding or role change.

## Metrics

- None defined yet.

