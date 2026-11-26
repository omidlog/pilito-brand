---
title: Brand Applications
sidebar_position: 19
tags:
  - brand
  - applications
visibility: public
module_id: applications
owner: brand
status_note: starter
---

# 19 — Brand Applications

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** brand.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Worked examples that show how to apply the system. Examples stay labeled EXAMPLE until a real campaign exists.

## Decision this informs

Which surfaces are reference implementations.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Reference surfaces | yes | internal | `brand.applications.surfaces` |
| Launch exemplar | yes | internal | `brand.applications.launch` |
| Consistency bar | yes | internal | `brand.applications.consistency` |
| Application reviewer | yes | internal | `brand.applications.reviewer` |
| Edge cases | yes | internal | `brand.applications.edges` |

## Guidance

Each application names the token ids, copy rules, and asset ids it used.

Correct and incorrect examples must be obvious and must not use unapproved art as if it were correct.

A cross-channel launch exemplar waits until offer, status, and type are approved.

Edge cases (no logo yet, no mascot, RTL, reduced motion) are part of the examples.

## Fill-in record

The empty record is `brand/content/19-brand-applications/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/applications.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

The use-case pages walk through a carousel and a mascot lookup and stop at the approval gap.

## Do

- Show the retrieval steps.
- Prefer a gap over a fake mock.
- Link the brief template.

## Don't

- Do not present the docs theme as a customer product UI.
- Do not hide EXAMPLE labels.
- Do not composite a character you do not have.

## Review checklist

- [ ] Every example lists sources.
- [ ] Missing assets are visible.
- [ ] Incorrect use is described.

## Dependencies

- `product-ui`
- `social`
- `campaigns`

## Related drafts

Machine draft: `brand/generated/drafts/applications.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Add an application when a real surface ships.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
