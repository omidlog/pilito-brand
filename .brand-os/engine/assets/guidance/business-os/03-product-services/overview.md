---
title: Product & Service Strategy
sidebar_position: 3
tags:
  - business
  - business-product
visibility: public
module_id: business-product
owner: product
status_note: starter
---

# BO-03 — Product & Service Strategy

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** product.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Describe the offer as a product or service system: jobs, scope, non-goals, readiness, and evidence. Research notes stay consented and minimal.

## Decision this informs

What is in scope, what is shipped, and what marketing must not imply.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Portfolio | yes | internal | `business.product.portfolio` |
| Jobs to be done | yes | internal | `business.product.jobs` |
| MVP boundary | yes | internal | `business.product.mvp` |
| Public status | yes | internal | `business.product.public_status` |
| Roadmap horizon | yes | internal | `business.product.roadmap` |
| Accessibility intent | yes | internal | `business.product.accessibility` |
| Activation definition | optional | internal | `business.product.activation` |
| Learning model | optional | internal | `business.product.learning_model` |
| Languages taught | optional | internal | `business.product.learning_languages` |
| Research evidence policy | yes | internal | `business.product.evidence_policy` |
| Offer | canonical reference | internal | `business.offer.summary` |
| Primary customer | canonical reference | internal | `business.customer.primary_segment` |

## Guidance

Write PRD-shaped briefs with problem, scope, non-goals, acceptance criteria, and analytics events. Do not pretend a template brief is an approved PRD.

Roadmaps may use now/next/later without fake dates. Dated commitments need an owner.

Prioritization method (RICE, MoSCoW, or another) is a choice recorded here, not a hidden default.

Store interview evidence as citations and permissions, never as raw personal data.

## Inputs

- Offer summary
- Segment
- Evidence the owner chooses to cite

## Artifacts

- Portfolio note
- MVP boundary
- Public status
- Roadmap now/next/later

## Acceptance

- Design and marketing can see what is live.

## Fill-in record

The empty record is `brand/business-os/03-product-services/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-product.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: public status remains unshipped while a clickable prototype exists. The prototype is not a launch.

## Do

- Link jobs-to-be-done to the primary segment id.
- Keep public status explicit: unshipped, beta, or available.
- Record non-goals so brand creative does not advertise them.

## Don't

- Do not market a roadmap item as a live feature.
- Do not upload research recordings or respondent contact details.
- Do not invent adoption or retention numbers.

## Review checklist

- [ ] Public status is set.
- [ ] MVP boundary is written or explicitly unknown.
- [ ] Accessibility intent is stated without claiming a finished audit.

## Dependencies

- `business-company`

## Related drafts

Machine draft: `brand/generated/drafts/business-product.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Update public status at every release decision.

## Metrics

- Activation definition
- Evidence count


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
