---
title: Print, Merchandise & Environment
sidebar_position: 18
tags:
  - brand
  - print
visibility: public
module_id: print
owner: design
status_note: starter
---

# 18 — Print, Merchandise & Environment

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Physical applications: print specs, merchandise, packaging, and environments. Most brands should leave this not applicable until a real object exists.

## Decision this informs

Whether physical production is in scope and which specs are known.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Physical scope | yes | internal | `brand.print.scope` |
| Print specification | optional | internal | `brand.print.color` |
| Bleed and safe area | optional | internal | `brand.print.bleed` |
| Merchandise rules | optional | internal | `brand.print.merch` |
| Production notes | optional | internal | `brand.print.vendor` |

## Guidance

Bleed, trim, and safe area are printer specs. Do not copy a generic 3mm and call it approved.

Merchandise licensing is a legal question as well as a visual one.

Environmental graphics need viewing distance rules.

Mascot-on-product shots require the mascot module and a production note.

## Fill-in record

The empty record is `brand/content/18-print-merchandise/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/print.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: print is out of scope. No bleed value is approved.

## Do

- Say not applicable.
- Keep vendor contacts out of public docs.
- Separate dielines from marketing mockups.

## Don't

- Do not order merch from the EXAMPLE wordmark.
- Do not invent Pantone codes.
- Do not store supplier bank details.

## Review checklist

- [ ] Scope is in or out.
- [ ] Color spec points at the color module.
- [ ] No physical file is marked print-ready without a check.

## Dependencies

- `logo-system`
- `color-system`

## Related drafts

Machine draft: `brand/generated/drafts/print.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review before any print spend.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
