---
title: Iconography & Graphic Elements
sidebar_position: 10
tags:
  - brand
  - iconography
visibility: public
module_id: iconography
owner: design
status_note: starter
---

# 10 — Iconography & Graphic Elements

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Rules for UI icons, brand marks, badges, patterns, and export names.

## Decision this informs

How a symbol is drawn, named, and exported.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Icon grid | yes | internal | `brand.icons.grid` |
| Stroke and corners | yes | internal | `brand.icons.stroke` |
| Metaphors | yes | internal | `brand.icons.metaphor` |
| Badges | optional | internal | `brand.icons.badges` |
| Naming and export | yes | internal | `brand.icons.naming` |

## Guidance

Pick a grid and a stroke model before drawing a set.

Badges and stickers are not the same component as a 24px UI icon.

If motifs come from a mascot, reference the mascot id and degrade gracefully when the mascot is off.

Animated icons need a reduced-motion still.

## Fill-in record

The empty record is `brand/content/10-iconography-graphic-elements/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/iconography.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE icon: brand/assets/icons/example-mark.svg is a geometric placeholder.

## Do

- Name files from the id, not from a campaign joke.
- Keep corner radius consistent with the radius tokens.
- Document optical corrections.

## Don't

- Do not mix filled and stroked sets without a rule.
- Do not use the logo as a bullet icon.
- Do not ship trademarked emoji as brand assets.

## Review checklist

- [ ] Grid is stated or TBD.
- [ ] Naming pattern exists.
- [ ] UI icons meet contrast on both themes.

## Dependencies

- `logo-system`
- `color-system`

## Related drafts

Machine draft: `brand/generated/drafts/iconography.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when the component library adds an icon.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
