---
title: Mascot Expression & Pose Library
sidebar_position: 7
tags:
  - brand
  - mascot-expression
visibility: public
module_id: mascot-expression
owner: design
status_note: starter
optional_module: mascot
---

# 07 — Mascot Expression & Pose Library

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Map product situations to catalog ids. The 90-state catalog is a proposal list with empty art slots.

## Decision this informs

Which states are in the MVP set and how they are named.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Emotion priority | yes | internal | `brand.mascot.emotion_priority` |
| Situation map | yes | internal | `brand.mascot.situation_map` |
| Intensity scale | yes | internal | `brand.mascot.intensity` |
| Angle priority | yes | internal | `brand.mascot.angles` |
| MVP states | optional | internal | `brand.mascot.mvp` |

## Guidance

Use the ids in brand/mascot. Do not rename a state by inventing a filename.

Intensity, angle, and stage compatibility are fields on every state.

Product UI states and learning contexts can be irrelevant. Mark them not applicable instead of drawing them.

The MVP subset is a production order, not a deletion of the other states.

## Fill-in record

The empty record is `brand/content/07-mascot-expression-pose-library/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/mascot-expression.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

Onboarding success should look up mascot.ui.success and mascot.emotion.joyful, then stop if art is missing.

## Do

- Filter the explorer by status.
- Keep missing previews labeled missing.
- Map one product moment to one primary state id.

## Don't

- Do not generate 90 illustrations to “fill the grid”.
- Do not mark draft states approved.
- Do not use a celebration state for an error.

## Review checklist

- [ ] Catalog validates at 20/20/15/15/10/10.
- [ ] MVP list is 20–30 ids.
- [ ] Each used id exists.

## Dependencies

- `mascot-identity`

## Related drafts

Machine draft: `brand/generated/drafts/mascot-expression.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Update when a new product situation needs a state.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
