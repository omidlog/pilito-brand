---
title: Customer Experience, Success & Support
sidebar_position: 5
tags:
  - business
  - business-customer
visibility: public
module_id: business-customer
owner: support
status_note: starter
---

# BO-05 — Customer Experience, Success & Support

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** support.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Define the service journey, support voice, and feedback loops. Voice points at the canonical tone instead of inventing a second personality.

## Decision this informs

How people are onboarded, helped, and heard.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Onboarding outcome | yes | internal | `business.cx.onboarding` |
| Support channels | yes | internal | `business.cx.channels` |
| Response commitment | yes | internal | `business.cx.sla` |
| Feedback metric | yes | internal | `business.cx.feedback_metric` |
| Cancellation stance | optional | internal | `business.cx.churn` |
| Case-study permission | yes | internal | `business.cx.case_study` |
| Public status | canonical reference | internal | `business.product.public_status` |

## Guidance

Map support templates to verbal-identity tone. Do not write a conflicting support persona.

SLAs are optional. A missing SLA is better than a fabricated response time.

Case studies need explicit permission. Do not draft them from private tickets.

Store satisfaction metrics as definitions until a real survey exists.

## Inputs

- Tone of voice
- Public product status

## Artifacts

- Channel playbook
- Response principles
- Feedback definition

## Acceptance

- Support copy can be reviewed against the verbal module.

## Fill-in record

The empty record is `brand/business-os/05-customer-experience/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-customer.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: support is a shared inbox on weekdays, with no SLA. The help center does not exist yet.

## Do

- Name channels you will actually staff.
- Separate severity from tone.
- Keep cancellation language honest.

## Don't

- Do not promise 24/7 support you cannot deliver.
- Do not paste ticket transcripts into the docs site.
- Do not claim an NPS score.

## Review checklist

- [ ] Support channels are listed or explicitly none.
- [ ] Feedback metric is a definition, not a fake score.
- [ ] Case-study permission rule exists.

## Dependencies

- `verbal-identity`
- `business-product`

## Related drafts

Machine draft: `brand/generated/drafts/business-customer.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when channels or staffing change.

## Metrics

- Defined feedback metric
- Open escalations policy


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
