---
title: Operations & Team SOPs
sidebar_position: 6
tags:
  - business
  - business-operations
visibility: public
module_id: business-operations
owner: operations
status_note: starter
---

# BO-06 — Operations & Team SOPs

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** operations.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Record who decides, which procedures exist, and where live tasks live. Git holds the SOP, not a shadow task database.

## Decision this informs

Ownership, handoffs, and the system of record for work.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Roles | yes | internal | `business.ops.roles` |
| Decision rights | yes | internal | `business.ops.decisions` |
| First SOP | yes | internal | `business.ops.sop` |
| Vendors | optional | internal | `business.ops.vendors` |
| Meeting cadence | optional | internal | `business.ops.cadence` |
| Task tracker | optional | internal | `business.ops.tracker` |

## Guidance

Each SOP names trigger, purpose, prerequisites, steps, exceptions, escalation, evidence, and owner.

RACI or DRI is enough. Do not draw a fictional org chart for a one-person project.

Link the task tracker. Do not copy tickets into Markdown.

Vendor records should name the role of the vendor, not bank details.

## Inputs

- Owners named in other modules

## Artifacts

- Decision rights
- SOP index
- Tracker link

## Acceptance

- A change request has a human owner.

## Fill-in record

The empty record is `brand/business-os/06-operations-sops/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-operations.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: one founder is the DRI for brand and product. There is no staff plan and no invented org chart.

## Do

- Name a single accountable owner per decision class.
- Keep meeting notes as decisions, not transcripts.
- Write the continuity plan as a pointer if the real plan is private.

## Don't

- Do not invent employees.
- Do not store payroll or home addresses.
- Do not maintain two task lists.

## Review checklist

- [ ] Decision rights for brand approval match the governance module.
- [ ] Task tracker link is a URL or an explicit none.
- [ ] At least the brand-change SOP is identified.

## Dependencies

- `business-company`

## Related drafts

Machine draft: `brand/generated/drafts/business-operations.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Update when roles change.

## Metrics

- SOPs with owners
- Decisions without an owner


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
