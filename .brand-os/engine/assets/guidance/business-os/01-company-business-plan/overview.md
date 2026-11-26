---
title: Company & Business Plan
sidebar_position: 1
tags:
  - business
  - business-company
visibility: public
module_id: business-company
owner: founder
status_note: starter
---

# BO-01 — Company & Business Plan

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** founder.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Hold the canonical description of the business: identity, customer, offer, market, model, and the assumptions behind the plan. Other modules reference these records instead of pasting a second copy.

## Decision this informs

What business this is, who it is for, and which claims are safe to repeat.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| New or existing business | yes | internal | `business.identity.new_or_existing` |
| Trade name | yes | public | `business.identity.trade_name` |
| Legal name | optional | internal | `business.identity.legal_name` |
| Sector | yes | internal | `business.identity.sector` |
| Offer | yes | internal | `business.offer.summary` |
| Operating stage | yes | internal | `business.stage.current` |
| Geography | yes | internal | `business.market.geography` |
| Primary customer | yes | internal | `business.customer.primary_segment` |
| Value proposition | yes | internal | `business.offer.value_proposition` |
| Customer pains | yes | internal | `business.problem.pains` |
| Revenue model | yes | internal | `business.model.revenue` |
| Defensibility | optional | internal | `business.model.defensibility` |
| Next milestone | yes | internal | `business.plan.milestone` |
| Top risks | yes | internal | `business.plan.risks` |

## Guidance

Separate a legal name from the public trade name. If you do not know the legal name, leave it unknown.

Record the estimation method whenever a market size appears. A number without a source, date, and method stays an assumption.

Choose a profile (idea-stage, services, SaaS, marketplace, nonprofit, and so on) so later questions that do not apply can be skipped instead of forced.

Strategy lives here and in Brand Strategy as references. Execution tasks belong in the external tracker named by operations, not as a second task list in Git.

## Inputs

- Owner interview
- Existing deck or site only when the owner supplies a citation

## Artifacts

- One-page snapshot
- Business thesis
- Assumption log
- Risk notes

## Acceptance

- A reader can tell what is confirmed, estimated, and unknown.
- Brand, sales, and marketing link here instead of restating the segment.

## Fill-in record

The empty record is `brand/business-os/01-company-business-plan/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-company.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

A seed-stage education product might say its primary customer is still a hypothesis: independent adult learners, geography unknown, revenue model not chosen. That sentence is an illustration, not a default answer.

## Do

- Cite the owner and the date for every factual claim.
- Keep one primary-segment record and point brand personas at its id.
- Mark idea-stage unknowns as unknown.

## Don't

- Do not invent TAM, revenue, headcount, or founder biographies.
- Do not paste bank details, identification numbers, or customer lists.
- Do not fork a second company strategy inside the brand book.

## Review checklist

- [ ] Trade name and sector have a disposition.
- [ ] Primary customer is either described or explicitly unknown.
- [ ] Value proposition is the single canonical wording.
- [ ] Assumptions are labeled separately from verified facts.

## Dependencies

- None. This module can start from the interview.

## Related drafts

Machine draft: `brand/generated/drafts/business-company.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Revisit at each stage change and at least quarterly.

## Metrics

- Milestone completion
- Assumption burn-down


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
