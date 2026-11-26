---
title: Marketing Strategy & Planning
sidebar_position: 2
tags:
  - business
  - business-marketing
visibility: public
module_id: business-marketing
owner: marketing
status_note: starter
---

# BO-02 — Marketing Strategy & Planning

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** marketing.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Decide how the canonical customer and offer reach the market. This module plans; it does not restate positioning or keep a live analytics warehouse in Markdown.

## Decision this informs

Which channels, messages, and budgets are in the current plan, and which claims are allowed.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Marketing objective | yes | internal | `business.marketing.objective` |
| Channels | yes | internal | `business.marketing.channels` |
| Journey hypothesis | yes | internal | `business.marketing.journey` |
| Content pillars | optional | internal | `business.marketing.pillars` |
| Channel budget | yes | restricted | `business.marketing.budget` |
| Attribution | yes | internal | `business.marketing.attribution` |
| Availability claims | yes | internal | `business.marketing.availability_claim` |
| UTM taxonomy | optional | internal | `business.marketing.utm` |
| Paid media | yes | internal | `business.marketing.paid_media` |
| Customer journey stages | optional | internal | `business.marketing.journey_stages` |
| Primary customer | canonical reference | internal | `business.customer.primary_segment` |
| Value proposition | canonical reference | internal | `business.offer.value_proposition` |
| Geography | canonical reference | internal | `business.market.geography` |

## Guidance

Use SOSTAC as a field set: situation, objectives, strategy, tactics, action, control. It is a planning shape, not the only standard.

Channel playbooks (search, social, email, community, partners, PR, events, offline) stay empty until the channel is selected.

Separate the annual strategy from the dated plan and from execution tasks in the tracker.

Every public availability or price claim must point at the product status and the pricing record.

## Inputs

- Canonical segment
- Offer
- Geography
- Product public status

## Artifacts

- Marketing objectives
- Channel plan
- Claim rules
- Experiment backlog link

## Acceptance

- A campaign brief can be written without inventing a new audience.

## Fill-in record

The empty record is `brand/business-os/02-marketing/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-marketing.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

An EXAMPLE quarterly plan might test one organic channel and zero paid spend until a price exists. The absence of spend is a decision, not a missing number to invent.

## Do

- Reference business.customer.primary_segment and business.offer.value_proposition.
- Date every plan and mark it as a plan, not as measured performance.
- Store UTM rules as a naming convention, not as a dump of campaign URLs.

## Don't

- Do not create a second persona with a different id.
- Do not publish an unshipped feature as available.
- Do not paste ad-account credentials or customer exports.

## Review checklist

- [ ] Objectives name a metric owner and a source system.
- [ ] Channel list matches the current quarter, not a wish list presented as a commitment.
- [ ] Attribution model is either chosen or explicitly undecided.

## Dependencies

- `business-company`
- `brand-strategy`

## Related drafts

Machine draft: `brand/generated/drafts/business-marketing.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Strategy yearly; plan monthly; results only from the analytics system.

## Metrics

- Planned channel
- Claim violations found in review


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
