---
title: Marketing & Campaigns
sidebar_position: 17
tags:
  - brand
  - campaigns
visibility: public
module_id: campaigns
owner: marketing
status_note: starter
---

# 17 — Marketing & Campaigns

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** marketing.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Briefs for campaigns, ads, landing pages, and co-branding. The brief consumes canonical offer, price, and status records.

## Decision this informs

What a campaign is allowed to claim and how it is named.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Brief owner | yes | internal | `brand.campaign.owner` |
| Campaign naming | yes | internal | `brand.campaign.naming` |
| Offer source | yes | internal | `brand.campaign.offer_source` |
| Co-branding | optional | internal | `brand.campaign.cobrand` |
| Seasonal work | optional | internal | `brand.campaign.seasonal` |
| Availability claims | canonical reference | internal | `business.marketing.availability_claim` |
| Pricing summary | canonical reference | internal | `business.sales.pricing` |
| Primary customer | canonical reference | internal | `business.customer.primary_segment` |

## Guidance

A brief names objective, audience id, offer id, channels, and the claim it needs.

Naming conventions stop “final_v7” from becoming the system.

A/B variants are hypotheses until growth records a real result.

Co-branding needs the partner record and a rights note.

## Fill-in record

The empty record is `brand/content/17-marketing-campaigns/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/campaigns.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE brief header: audience TBD, offer TBD, claim do-not-claim, budget unknown.

## Do

- Reference price instead of retyping it.
- Block availability claims that conflict with product status.
- Keep seasonal ideas labeled ideas.

## Don't

- Do not launch from a draft brief.
- Do not invent a competitor claim.
- Do not store ad-account secrets.

## Review checklist

- [ ] Brief template is used.
- [ ] Claims resolve to canonical ids.
- [ ] Naming rule exists or is TBD.

## Dependencies

- `business-marketing`
- `verbal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/campaigns.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

One brief per campaign. Review the system when naming or claims rules change.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
