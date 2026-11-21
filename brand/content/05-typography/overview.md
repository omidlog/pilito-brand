---
title: Typography
sidebar_position: 5
tags:
  - brand
  - typography
visibility: public
module_id: typography
owner: design
status_note: starter
---

# 05 — Typography

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Choose families, licenses, scales, and multilingual behavior. Starter tokens name EXAMPLE families and system fallbacks. No commercial font is bundled.

## Decision this informs

Which type is allowed to ship, and under what license.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Type intent | yes | internal | `brand.type.intent` |
| License status | yes | internal | `brand.type.license` |
| Type roles and scale | yes | internal | `brand.type.scale` |
| RTL and locales | yes | internal | `brand.type.rtl` |
| Fallback policy | yes | internal | `brand.type.fallback` |
| Localization | canonical reference | internal | `brand.verbal.localization` |
| Third-party content | canonical reference | internal | `business.legal.third_party` |

## Guidance

Record the license and the fallback stack before a family is called approved.

RTL, Arabic/Persian shaping, and Turkish dotted I are requirements, not afterthoughts, when those languages are official.

A scale (display, headline, body, caption) can be chosen before the final family.

Do not self-host a font file you do not have rights to.

## Fill-in record

The empty record is `brand/content/05-typography/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/typography.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

Tokens list “EXAMPLE Sans” falling back to system UI fonts. That stack is a placeholder.

## Do

- Keep license status next to the family name.
- Define a fallback that covers the languages you approved.
- Use tokens for size and line height.

## Don't

- Do not download a random webfont into the repo.
- Do not claim a family is free without a source.
- Do not use display type for legal text.

## Review checklist

- [ ] License is TBD or cited.
- [ ] RTL behavior is decided or not applicable.
- [ ] Scale roles exist.

## Dependencies

- `verbal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/typography.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a language or a license changes.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
