---
title: Logo System
sidebar_position: 3
tags:
  - brand
  - logo-system
visibility: public
module_id: logo-system
owner: design
status_note: starter
---

# 03 — Logo System

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Specify logo variants, clear space, minimum sizes, and misuse once artwork exists. The template ships a labeled placeholder, not a logo.

## Decision this informs

Which master files are approved and how they may be placed.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Variants needed | yes | internal | `brand.logo.variants` |
| Clear space | yes | internal | `brand.logo.clear_space` |
| Minimum size and clear space | optional | internal | `brand.logo.min_size` |
| Misuse rules | yes | internal | `brand.logo.misuse` |
| Master location | yes | internal | `brand.logo.masters` |
| Trademark status | canonical reference | internal | `business.legal.trademark` |
| Name usage | canonical reference | internal | `brand.verbal.name_use` |

## Guidance

List the variants you need (primary, secondary, stacked, wordmark, icon, mascot lockup) without drawing them.

Clear space and minimum size stay TBD until a master exists.

Incorrect-use examples should describe the failure (“do not recolor an unapproved master”) rather than fake a competitor comparison.

Point downloads at asset ids. If the file is missing, the gallery must say so.

## Fill-in record

The empty record is `brand/content/03-logo-system/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/logo-system.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

The file brand/assets/logo/example-wordmark.svg is an EXAMPLE frame so the pipeline has a real file. It is not a brand mark.

## Do

- Keep placeholder SVGs marked EXAMPLE.
- Separate source files from exports.
- Record the background rules you actually need.

## Don't

- Do not trace someone else’s mark.
- Do not mark the placeholder approved.
- Do not add a ® unless the legal module says the mark is registered.

## Review checklist

- [ ] Asset id exists for every claimed master.
- [ ] Approved status is false while files are placeholders.
- [ ] Clear space is TBD or measured.

## Dependencies

- `verbal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/logo-system.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when the name or an approved master changes.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
