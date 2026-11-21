---
title: Gamification
sidebar_position: 50
tags:
  - system
  - gamification
visibility: public
module_id: gamification
owner: product
status_note: starter
optional_module: gamification
---

# G — Gamification

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** product.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Optional visual rules for progress, streaks, rewards, and failure. Game logic and economy live in the product, not in this visual system. Values are placeholders.

## Decision this informs

Whether game-like visuals exist and which ethics constraints they carry.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Gamification | yes | internal | `brand.gamification.enabled` |
| Progress model | yes | internal | `brand.gamification.model` |
| Streak policy | yes | internal | `brand.gamification.streaks` |
| Reward ethics | yes | internal | `brand.gamification.ethics` |
| Failure tone | yes | internal | `brand.gamification.failure` |
| Character link | yes | internal | `brand.gamification.mascot_link` |
| Unlock placeholder | canonical reference | internal | `brand.mascot.unlocks` |
| Experience principles | canonical reference | internal | `brand.strategy.experience` |

## Guidance

Separate the visual state (locked, unlocked, celebrated) from the mechanic (XP, streak length).

Do not put numbers in the brand book that product has not defined.

Failure states must not humiliate. That is a brand rule, not a game-balance note.

If a mascot stage changes with progress, reference mascot unlock placeholders.

## Fill-in record

The empty record is `brand/content/gamification/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/gamification.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: streaks may exist later. No length, forgiveness rule, or reward is defined.

## Do

- Keep celebration infrequent.
- Design the muted and reduced-motion versions.
- Label every economy value as a placeholder.

## Don't

- Do not invent XP, drop rates, or streak penalties.
- Do not use loss aversion as the voice.
- Do not require gamification for a brand that turned it off.

## Review checklist

- [ ] Enable flag is explicit.
- [ ] Ethics constraint is written.
- [ ] No numeric economy is presented as real.

## Dependencies

- `product-ui`

## Related drafts

Machine draft: `brand/generated/drafts/gamification.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when product changes the progression model.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
