---
title: Mascot Identity
sidebar_position: 6
tags:
  - brand
  - mascot-identity
visibility: public
module_id: mascot-identity
owner: design
status_note: starter
optional_module: mascot
---

# 06 — Mascot Identity

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Optional character system. When disabled, these questions are skipped and the docs hide the module. No artwork is generated here.

## Decision this informs

Whether a character exists and which anatomical rules are canonical.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Mascot | yes | internal | `brand.mascot.enabled` |
| Character role | yes | internal | `brand.mascot.role` |
| Character personality | yes | internal | `brand.mascot.personality` |
| Anatomy rules | yes | internal | `brand.mascot.anatomy` |
| Forbidden distortions | yes | internal | `brand.mascot.forbidden` |
| Character palette | yes | internal | `brand.mascot.palette` |
| Personality | canonical reference | internal | `brand.personality.traits` |

## Guidance

Start with the model sheet and the forbidden list before expressions.

Personality of the character must fit brand.personality.traits or explicitly extend it.

Record proportions as constraints (“hands stay simple”) not as fake measurements of art you do not have.

2D, 2.5D, and 3D alignment is a decision about future production, not a render.

## Fill-in record

The empty record is `brand/content/06-mascot-identity/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/mascot-identity.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE configuration in the template turns the module on so the catalog is visible. A B2B init turns it off.

## Do

- Keep the module optional.
- Write forbidden distortions before style experiments.
- Use stable ids for any later art.

## Don't

- Do not generate a character and call it approved.
- Do not copy a known mascot.
- Do not require a mascot for brands that answered no.

## Review checklist

- [ ] Enabled flag matches config.
- [ ] Anatomy rules exist or the module is off.
- [ ] No source file is marked approved without a checksum.

## Dependencies

- `brand-strategy`

## Related drafts

Machine draft: `brand/generated/drafts/mascot-identity.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review only when the character or the enable flag changes.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
