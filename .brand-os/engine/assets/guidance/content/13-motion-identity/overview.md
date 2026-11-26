---
title: Motion Identity
sidebar_position: 13
tags:
  - brand
  - motion
visibility: public
module_id: motion
owner: design
status_note: starter
---

# 13 — Motion Identity

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Timing, easing, and the rules for logo, interface, and optional character motion. Tokens hold durations. Reduced motion is mandatory.

## Decision this informs

How things move, and when they must not.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Motion principles | yes | internal | `brand.motion.principles` |
| Duration feel | yes | internal | `brand.motion.duration` |
| Reduced motion | yes | internal | `brand.motion.reduced` |
| Logo motion | optional | internal | `brand.motion.logo` |
| Deliverable formats | yes | internal | `brand.motion.formats` |

## Guidance

Principles should be short enough to review a prototype against.

Durations and easings live in motion tokens. Do not hard-code a second scale in slides.

Character rigs, if any, reference mascot motion briefs.

Deliverables (Lottie, Rive, CSS, SVG, video) are choices with performance budgets.

## Fill-in record

The empty record is `brand/content/13-motion-identity/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/motion.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE durations: 120, 200, 320, and 480 ms. They are draft tokens.

## Do

- Provide a reduced-motion alternative for every required motion.
- Keep celebration rare.
- Document autoplay and sound separately.

## Don't

- Do not ship looping video of missing mascot art.
- Do not use vestibular-heavy motion as a brand signature by default.
- Do not claim a Lottie file you have not exported.

## Review checklist

- [ ] Token durations exist.
- [ ] Reduced motion is specified.
- [ ] Performance budget is a number or TBD.

## Dependencies

- `brand-strategy`
- `product-ui`

## Related drafts

Machine draft: `brand/generated/drafts/motion.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a new motion surface ships.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
