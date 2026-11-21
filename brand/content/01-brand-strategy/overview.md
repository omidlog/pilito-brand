---
title: Brand Strategy
sidebar_position: 1
tags:
  - brand
  - brand-strategy
visibility: public
module_id: brand-strategy
owner: brand
status_note: starter
---

# 01 — Brand Strategy

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** brand.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Explain why the brand exists, who it serves, and how decisions are made. Audience, offer, and value proposition are referenced from the Business OS so the brand book cannot drift.

## Decision this informs

Which brand choices are allowed when a tactic is tempting but off-strategy.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Personality | yes | internal | `brand.personality.traits` |
| Purpose | yes | internal | `brand.strategy.purpose` |
| Vision | optional | internal | `brand.strategy.vision` |
| Values | yes | internal | `brand.strategy.values` |
| Differentiation | yes | internal | `brand.strategy.differentiation` |
| Brand promise | yes | internal | `brand.strategy.promise` |
| Decision rule | yes | internal | `brand.strategy.decision_rule` |
| Experience principles | yes | internal | `brand.strategy.experience` |
| Trade name | canonical reference | public | `business.identity.trade_name` |
| Primary customer | canonical reference | internal | `business.customer.primary_segment` |
| Value proposition | canonical reference | internal | `business.offer.value_proposition` |
| Geography | canonical reference | internal | `business.market.geography` |
| Jobs to be done | canonical reference | internal | `business.product.jobs` |

## Guidance

Purpose, mission, vision, and promise are different sentences. Leave any of them unknown rather than paraphrasing the value proposition three times.

Personality is a working draft until approved. Archetype labels are optional tools, not a diagnosis.

Decision rules should be specific enough that a designer can say no.

Experience principles govern product, support, and marketing together.

## Inputs

- Trade name
- Segment
- Value proposition
- Geography

## Artifacts

- Purpose draft
- Personality draft
- Decision rule

## Acceptance

- A campaign brief can point at one strategy record.

## Fill-in record

The empty record is `brand/content/01-brand-strategy/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/brand-strategy.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE decision rule: “Do not show a feature that product.public_status does not allow.” The example is a rule shape, not this brand’s strategy.

## Do

- Link the primary segment instead of writing a second persona.
- Record the jobs-to-be-done reference next to any journey claim.
- Date the strategy and name an owner.

## Don't

- Do not invent an origin story.
- Do not claim a competitive ranking you have not sourced.
- Do not treat a mood adjective as an approved visual rule.

## Review checklist

- [ ] Canonical value proposition is referenced, not rewritten.
- [ ] Decision rule exists or is explicitly deferred.
- [ ] Personality draft is labeled draft.

## Dependencies

- `business-company`

## Related drafts

Machine draft: `brand/generated/drafts/brand-strategy.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when the segment, offer, or stage changes.

## Metrics

- Open strategy fields
- Approved decision rules


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
