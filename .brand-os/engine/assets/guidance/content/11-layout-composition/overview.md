---
title: Layout & Composition
sidebar_position: 11
tags:
  - brand
  - layout
visibility: public
module_id: layout
owner: design
status_note: starter
---

# 11 — Layout & Composition

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Grids, spacing, breakpoints, and hierarchy for web, mobile, print, and campaigns.

## Decision this informs

How dense a surface may be and what must stay legible.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Grids | yes | internal | `brand.layout.grid` |
| Density | yes | internal | `brand.layout.density` |
| Breakpoints | yes | internal | `brand.layout.breakpoints` |
| Hierarchy | yes | internal | `brand.layout.hierarchy` |
| Character zone | optional | internal | `brand.layout.mascot_zone` |

## Guidance

Spacing should reference space tokens, not one-off pixel nudges in a slide.

Breakpoints are product decisions. The docs site uses its own responsive layout and does not pretend to be the product.

Print safe areas are not CSS padding.

If a mascot appears, define a minimum size and a quiet zone.

## Fill-in record

The empty record is `brand/content/11-layout-composition/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/layout.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE space scale in tokens: 4, 8, 12, 16, 24, 32, 48, 64. Replace when you approve a scale.

## Do

- Name the grid per surface.
- State hierarchy: one primary action.
- Keep aspect ratios with the template that uses them.

## Don't

- Do not center everything by default and call it a system.
- Do not place text below the contrast bar.
- Do not invent device frames as requirements.

## Review checklist

- [ ] Spacing points at tokens.
- [ ] Breakpoints are chosen or inherited as TBD.
- [ ] Print and screen are distinguished.

## Dependencies

- `typography`
- `color-system`

## Related drafts

Machine draft: `brand/generated/drafts/layout.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a new surface (print, watch, billboard) is added.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
