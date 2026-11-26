---
title: Color System
sidebar_position: 4
tags:
  - brand
  - color-system
visibility: public
module_id: color-system
owner: design
status_note: starter
---

# 04 — Color System

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Define color roles, themes, and contrast requirements. Hex values live in DTCG tokens. The starter palette is EXAMPLE data for the pipeline, not an approved brand palette.

## Decision this informs

Which roles exist and what contrast bar they must meet.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Color roles | yes | internal | `brand.color.roles` |
| Semantic color mapping | optional | internal | `brand.color.semantic_map` |
| Themes | yes | internal | `brand.color.themes` |
| Semantic colors | yes | internal | `brand.color.semantics` |
| Contrast target | yes | internal | `brand.color.contrast` |
| Print color | optional | internal | `brand.color.print` |

## Guidance

Talk about roles (primary, surface, danger) before picking hues.

Do not let an interview answer overwrite token JSON without a review of contrast.

Light and dark themes are both first-class if you ship a product UI.

Print color (coated/uncoated, spot versus process) stays a strategy note until a printer spec exists.

## Fill-in record

The empty record is `brand/content/04-color-system/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/color-system.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

The repo includes an accessible EXAMPLE blue (#123A73) so the docs theme and tests have a real value. Replace it after approval.

## Do

- Keep EXAMPLE tokens marked draft.
- Pair foreground and background explicitly.
- Use the token exporter instead of copying hex into Markdown.

## Don't

- Do not approve a palette that fails the stated contrast bar.
- Do not invent a cultural color meaning.
- Do not use color as the only status signal.

## Review checklist

- [ ] Contrast target is chosen.
- [ ] Token status is draft until approval.
- [ ] Semantic colors are roles, not moods.

## Dependencies

- `brand-strategy`

## Related drafts

Machine draft: `brand/generated/drafts/color-system.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a theme or a semantic role changes.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
