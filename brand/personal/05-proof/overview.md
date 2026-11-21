---
title: Evidence, Portfolio & Reputation
sidebar_position: 5
tags:
  - personal
  - personal-proof
visibility: public
module_id: personal-proof
owner: person
status_note: starter
optional_module: personal
---

# P-05 — Evidence, Portfolio & Reputation

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

The sources behind claims, the portfolio that may be shown, testimonials with permission, and the public claim policy.

## Decision this informs

Which claims and projects are eligible for public release.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Evidence sources | yes | internal | `personal.credibility.evidence` |
| Shareable projects and case studies | yes | public | `personal.portfolio.projects` |
| Testimonials | optional | public | `personal.reputation.testimonials` |
| Conflicts of interest | yes | internal | `personal.reputation.conflicts` |
| Public claim policy | yes | internal | `personal.governance.public_claim_policy` |

## Guidance

The evidence register (brand:evidence) lists each source, what it proves, its status and when it must be re-checked.

A case study, testimonial or client logo needs a recorded permission. No permission blocks public release.

Owner testimony is labeled as owner-stated. It is never shown as independently verified.

## Fill-in record

The empty record is `brand/personal/05-proof/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-proof.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: “Conference talk 2023 — recording link — verifies speaking history.” Illustration only.

## Do

- Record permissions with the person or client who gave them.
- Set a re-verification date for time-sensitive claims.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.
- Do not write a testimonial for someone.

## Review checklist

- [ ] Evidence list exists or is unknown.
- [ ] Public claim policy recorded.

## Dependencies

- `personal-career`

## Related drafts

Machine draft: `brand/generated/drafts/personal-proof.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Re-verify dated claims before each public release.

## Metrics

- None defined yet.

