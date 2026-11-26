---
title: Sales & Revenue
sidebar_position: 4
tags:
  - business
  - business-sales
visibility: public
module_id: business-sales
owner: sales
status_note: starter
---

# BO-04 — Sales & Revenue

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** sales.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Describe how revenue is asked for and closed: motion, qualification, pricing, and handoff. Consumer paywalls and enterprise pipelines are both valid; neither is assumed.

## Decision this informs

What may be promised, discounted, and forecast.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Sales motion | yes | internal | `business.sales.motion` |
| Buyer versus user | yes | internal | `business.sales.buyer` |
| Pricing summary | yes | internal | `business.sales.pricing` |
| Discount policy | optional | internal | `business.sales.discount` |
| Pipeline stages | yes | internal | `business.sales.stages` |
| Cycle assumption | optional | internal | `business.sales.cycle` |
| B2B packaging | optional | internal | `business.sales.b2b_packaging` |
| Consumer purchase path | optional | internal | `business.sales.consumer_path` |
| Revenue model | canonical reference | internal | `business.model.revenue` |
| Primary customer | canonical reference | internal | `business.customer.primary_segment` |

## Guidance

Pick a motion: self-serve, product-led, inside sales, enterprise, retail, channel, or not applicable.

Pricing is canonical here. Marketing offers reference it and must not invent a second price.

Forecasts need a date, a method, and a confidence label. A blank forecast stays blank.

B2C questions cover trial, upgrade, and subscription only when that model is chosen.

## Inputs

- Revenue model
- Offer
- Segment

## Artifacts

- Motion note
- Pricing record
- Discount rule
- Stage definitions

## Acceptance

- A seller cannot quote a number that is not in the pricing record.

## Fill-in record

The empty record is `brand/business-os/04-sales-revenue/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-sales.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: motion is undecided, so there is no quota and no script. The honest sales asset is a one-paragraph offer.

## Do

- Keep discount authority explicit.
- Point battlecards at canonical competitor notes the owner actually supplied.
- Separate pipeline stages you use from stages you might use later.

## Don't

- Do not invent conversion rates, quotas, or average deal size.
- Do not store customer lists or signed contracts with personal data.
- Do not publish a price that finance has not seen when a price exists.

## Review checklist

- [ ] Motion is chosen or not applicable.
- [ ] Pricing record is unknown, estimated, or confirmed — never implied.
- [ ] Public pages are not allowed to outrun this record.

## Dependencies

- `business-company`
- `business-product`

## Related drafts

Machine draft: `brand/generated/drafts/business-sales.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review pricing whenever the offer or market changes.

## Metrics

- Stage definitions exist
- Unapproved price mentions


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
