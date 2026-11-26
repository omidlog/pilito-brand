---
title: Governance & Asset Library
sidebar_position: 20
tags:
  - brand
  - governance
visibility: public
module_id: governance
owner: brand
status_note: starter
---

# 20 — Governance & Asset Library

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** brand.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Ownership, approvals, versioning, and the asset manifest. This is how a draft becomes a rule and how a file becomes findable.

## Decision this informs

Who may approve, deprecate, and publish.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Brand approver | yes | internal | `brand.gov.approver` |
| Versioning | yes | internal | `brand.gov.versioning` |
| Deprecation | yes | internal | `brand.gov.deprecation` |
| Content license | yes | internal | `brand.gov.license` |
| AI provenance | yes | internal | `brand.gov.ai` |
| Maintenance cadence | yes | internal | `brand.gov.cadence` |
| Decision rights | canonical reference | internal | `business.ops.decisions` |
| Decision rule | canonical reference | internal | `brand.strategy.decision_rule` |

## Guidance

The lifecycle is not_started, draft, in_review, approved, deprecated.

Approved visual and verbal rules change only through a proposed diff and a named approver.

The manifest stores license, visibility, checksum, and presence. Missing stays missing.

AI suggestions remain suggestions until a human approves them. Record that provenance.

## Fill-in record

The empty record is `brand/content/20-governance-assets/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/governance.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

The EXAMPLE wordmark is draft, public, and checksummed. The canonical mascot turnaround is absent on purpose.

## Do

- Use stable asset ids.
- Keep a change log.
- Filter public builds.

## Don't

- Do not approve a missing file.
- Do not commit secrets.
- Do not let an agent rewrite an approved rule in place.

## Review checklist

- [ ] Approver matches operations decision rights.
- [ ] Manifest validates.
- [ ] Deprecation path is written.

## Dependencies

- `business-operations`
- `brand-strategy`

## Related drafts

Machine draft: `brand/generated/drafts/governance.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review the library on the cadence the owner sets. Default in the template is “when a rule changes”.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
