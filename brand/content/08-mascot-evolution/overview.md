---
title: Mascot Evolution
sidebar_position: 8
tags:
  - brand
  - mascot-evolution
visibility: public
module_id: mascot-evolution
owner: design
status_note: starter
optional_module: mascot
---

# 08 — Mascot Evolution

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Configure how many stages exist. The six-stage egg-to-captain sequence is an EXAMPLE configuration, not a universal rule.

## Decision this informs

How many stages exist and what continuity must survive a stage change.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Stage count | yes | internal | `brand.mascot.stage_count` |
| Stage story | yes | internal | `brand.mascot.stage_story` |
| Continuity | yes | internal | `brand.mascot.continuity` |
| Unlock placeholder | yes | internal | `brand.mascot.unlocks` |
| Transition | optional | internal | `brand.mascot.transition` |

## Guidance

A brand may use one stage. That is the default for a static character.

Unlock conditions are placeholders until product defines real rules.

Stage art references list compatible state ids. Missing files stay missing.

Transitions need a reduced-motion alternative.

## Fill-in record

The empty record is `brand/content/08-mascot-evolution/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/mascot-evolution.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE stages: egg, hatchling, explorer, trainee, pilot, captain. Replace or delete when you choose a count.

## Do

- Label the six-stage story as EXAMPLE.
- Keep silhouette continuity explicit.
- Separate visual stage from game level.

## Don't

- Do not invent XP costs.
- Do not force six stages onto a B2B brand.
- Do not discard earlier-stage recognition cues.

## Review checklist

- [ ] Stage count is configured.
- [ ] Example stages are labeled example.
- [ ] Unlock copy says placeholder.

## Dependencies

- `mascot-identity`

## Related drafts

Machine draft: `brand/generated/drafts/mascot-evolution.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when progression rules change.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
