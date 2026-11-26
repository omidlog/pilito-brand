---
title: Goals, KPIs, Analytics & Reviews
sidebar_position: 11
tags:
  - business
  - business-goals
visibility: public
module_id: business-goals
owner: leadership
status_note: starter
---

# BO-11 — Goals, KPIs, Analytics & Reviews

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** leadership.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Define objectives, metric meanings, and review cadence. Live actuals stay in the source system. This module stores definitions, targets the owner sets, and links.

## Decision this informs

What “good” means, and which number is a target rather than an actual.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Annual objective | yes | internal | `business.goals.annual` |
| Quarterly focus | optional | internal | `business.goals.quarter` |
| North star definition | optional | internal | `business.goals.north_star` |
| Metric sources | yes | internal | `business.goals.sources` |
| Review cadence | yes | internal | `business.goals.cadence` |
| Plan versus actual | yes | internal | `business.goals.plan_vs_actual` |
| Objectives (OKR) | optional | internal | `business.goals.objectives` |
| Key results (OKR) | optional | internal | `business.goals.key_results` |
| Next milestone | canonical reference | internal | `business.plan.milestone` |

## Guidance

A metric registry row needs id, definition, unit, formula, timezone, source, freshness, and caveats.

Targets, forecasts, and actuals are different fields. Never title an actual with a stale snapshot date hidden in prose.

Weekly and quarterly reviews can be templates until the first real review.

North-star language is optional. Do not crown a metric you cannot collect.

## Inputs

- Milestone
- Marketing objective
- Activation definition

## Artifacts

- Objective
- Metric registry starter
- Review cadence

## Acceptance

- Readers can tell targets from actuals.

## Fill-in record

The empty record is `brand/business-os/11-goals-kpis-reports/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-goals.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: the only objective is “learn whether the segment is real.” There is no numeric KPI.

## Do

- Name the source system for every metric you intend to use.
- Keep the planning year explicit.
- Allow a brand to have no numeric goal yet.

## Don't

- Do not paste dashboard screenshots as if they were current next year.
- Do not invent baselines.
- Do not duplicate finance actuals here.

## Review checklist

- [ ] Plan versus actual is defined.
- [ ] Each proposed KPI has a source or is marked not collectable yet.

## Dependencies

- `business-company`

## Related drafts

Machine draft: `brand/generated/drafts/business-goals.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Objectives yearly or on stage change. Definitions when the formula changes.

## Metrics

- Metrics with sources
- Metrics missing sources


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
