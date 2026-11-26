---
title: Legal, IP & Compliance
sidebar_position: 9
tags:
  - business
  - business-legal
visibility: public
module_id: business-legal
owner: legal
status_note: starter
---

# BO-09 — Legal, IP & Compliance

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** legal.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Track entity, trademark, privacy, and content-rights questions as an intake. Documents here are drafts until qualified counsel reviews them. Nothing in this template certifies compliance.

## Decision this informs

Which legal questions are open, and which public claims must wait.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Entity status | yes | internal | `business.legal.entity` |
| Trademark status | yes | internal | `business.legal.trademark` |
| Privacy scope | yes | internal | `business.legal.privacy` |
| Marketing consent | yes | internal | `business.legal.consent` |
| Third-party content | yes | internal | `business.legal.third_party` |
| Counsel review | yes | internal | `business.legal.counsel` |
| Geography | canonical reference | internal | `business.market.geography` |
| Trade name | canonical reference | public | `business.identity.trade_name` |

## Guidance

Jurisdiction follows the geography record. Do not add regions silently.

Trademark status is a fact only when a search or filing is cited.

Privacy, cookies, and marketing consent are jurisdiction-specific. Record the question and the owner, not a fake policy.

Third-party type, music, and models need a license note before use.

## Inputs

- Geography
- Data classes
- Brand name

## Artifacts

- Open legal questions
- Draft status labels
- Rights log

## Acceptance

- Public build cannot show a fake “compliant” badge.

## Fill-in record

The empty record is `brand/business-os/09-legal-compliance/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-legal.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: no entity, no trademark search, no privacy policy. Public launch is blocked on those gaps.

## Do

- Label every policy draft as unreviewed.
- Keep a compliance matrix with applicability unknown where it is unknown.
- Point counsel reviews at a date and a person.

## Don't

- Do not present this module as legal advice.
- Do not claim a trademark is clear without a cited search.
- Do not store government identification numbers.

## Review checklist

- [ ] Counsel-review flag is honest.
- [ ] Trademark status is not implied.
- [ ] Geography links back to the canonical market field.

## Dependencies

- `business-company`

## Related drafts

Machine draft: `brand/generated/drafts/business-legal.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review before any public launch and when geography changes.

## Metrics

- Open legal blockers


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
