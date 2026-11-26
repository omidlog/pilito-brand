---
title: Social Media
sidebar_position: 16
tags:
  - brand
  - social
visibility: public
module_id: social
owner: marketing
status_note: starter
---

# 16 — Social Media

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** marketing.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Channel presets, safe zones, and templates that inherit canonical copy and type. No channel is active until marketing says it is.

## Decision this informs

Which templates exist and what they may say.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Social channels | yes | internal | `brand.social.channels` |
| Safe zones | yes | internal | `brand.social.safe` |
| CTA style | yes | internal | `brand.social.cta` |
| Template priority | yes | internal | `brand.social.templates` |
| Post localization | yes | internal | `brand.social.localization` |
| Export presets | optional | internal | `brand.social.exports` |
| Channels | canonical reference | internal | `business.marketing.channels` |
| Content pillars | canonical reference | internal | `business.marketing.pillars` |
| Type intent | canonical reference | internal | `brand.type.intent` |

## Guidance

List real channels only. A blank Instagram preset is better than a fake content calendar.

Safe zones and export sizes are filled when a template file exists.

CTAs use the verbal rules and the availability claim.

Localization of a post is a separate approval, not an automatic translation.

## Fill-in record

The empty record is `brand/content/16-social-media/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/social.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

An agent asked to design an Instagram carousel must read typography tokens, see they are EXAMPLE, and refuse to call them approved.

## Do

- Point at pillar ids.
- Keep source files distinct from exports.
- Show the mascot only through a catalog id.

## Don't

- Do not schedule posts from this repo.
- Do not invent engagement stats.
- Do not use unapproved type.

## Review checklist

- [ ] Channels match the marketing plan.
- [ ] Templates link to asset ids or say missing.
- [ ] Claims match product status.

## Dependencies

- `verbal-identity`
- `layout`
- `business-marketing`

## Related drafts

Machine draft: `brand/generated/drafts/social.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a channel is added or a template is approved.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
