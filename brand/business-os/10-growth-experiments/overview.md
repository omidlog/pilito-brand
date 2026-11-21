---
title: Growth & Experimentation
sidebar_position: 10
tags:
  - business
  - business-growth
visibility: public
module_id: business-growth
owner: growth
status_note: starter
---

# BO-10 — Growth & Experimentation

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** growth.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Keep a hypothesis backlog and the rules for learning. Results are recorded only after an experiment runs.

## Decision this informs

Which bets are hypotheses, and how a result becomes a decision.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Growth loops | yes | internal | `business.growth.loops` |
| First hypothesis | optional | internal | `business.growth.hypothesis` |
| Guardrails | yes | internal | `business.growth.guardrail` |
| Experiment owner | yes | internal | `business.growth.owner` |
| Results policy | yes | internal | `business.growth.results_policy` |
| Replication rule | optional | internal | `business.growth.replication` |
| Activation definition | canonical reference | internal | `business.product.activation` |
| Marketing objective | canonical reference | internal | `business.marketing.objective` |

## Guidance

Write hypotheses with audience, change, expected signal, and guardrail.

Sample size and power are optional fields. Leave them blank instead of faking significance.

Loops (acquisition, activation, retention, referral, revenue) reference canonical metrics.

A winning variant is not a brand rule until the owner approves the change.

## Inputs

- Activation definition
- Marketing objective

## Artifacts

- Hypothesis backlog
- Guardrail list
- Learning policy

## Acceptance

- No experiment result appears without a run date supplied by the owner.

## Fill-in record

The empty record is `brand/business-os/10-growth-experiments/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-growth.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE backlog item: “If the first screen states the job-to-be-done, more people finish it.” No result exists.

## Do

- Separate the backlog from the learning log.
- Name an owner for each live experiment.
- Record losers.

## Don't

- Do not invent lift, p-values, or cohort charts.
- Do not let an experiment overwrite approved copy without the approval flow.
- Do not run dark patterns as “growth”.

## Review checklist

- [ ] The results policy forbids fabricated outcomes.
- [ ] Guardrails include trust and accessibility, not only conversion.

## Dependencies

- `business-marketing`
- `business-product`

## Related drafts

Machine draft: `brand/generated/drafts/business-growth.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Add hypotheses any time. Promote learnings only after review.

## Metrics

- Open hypotheses
- Decisions from real runs


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
