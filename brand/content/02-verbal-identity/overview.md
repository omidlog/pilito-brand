---
title: Verbal Identity
sidebar_position: 2
tags:
  - brand
  - verbal-identity
visibility: public
module_id: verbal-identity
owner: brand
status_note: starter
---

# 02 — Verbal Identity

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** brand.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Fix the name, voice, vocabulary, and microcopy rules. Official statements are stored in the language the owner approved. This system does not auto-translate them.

## Decision this informs

Which words are allowed, required, or forbidden.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Name usage | yes | internal | `brand.verbal.name_use` |
| Public name override | yes | internal | `brand.identity.public_name_override` |
| Tagline | optional | internal | `brand.verbal.tagline` |
| Tone of voice | yes | internal | `brand.verbal.voice` |
| Forbidden language | yes | internal | `brand.verbal.forbidden` |
| Localization | yes | internal | `brand.verbal.localization` |
| Microcopy principle | yes | internal | `brand.verbal.microcopy` |
| Voice do and don’t | yes | internal | `brand.verbal.voice_pairs` |
| Trade name | canonical reference | public | `business.identity.trade_name` |
| Personality | canonical reference | internal | `brand.personality.traits` |

## Guidance

Record spelling, pronunciation, and what never to abbreviate.

Taglines are optional. A missing tagline stays missing.

Tone adapts by channel only after the base voice exists.

Keep UI chrome in each configured locale (for example en, fa, tr) separate from approved brand sentences.

## Fill-in record

The empty record is `brand/content/02-verbal-identity/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/verbal-identity.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE forbidden line: “The world’s most loved app.” No evidence, so it is not a template default.

## Do

- Point product microcopy at the same voice.
- List forbidden claims (superlatives, medical or financial promises) explicitly.
- Note localization owners per language.

## Don't

- Do not publish a slogan the owner has not approved.
- Do not machine-translate a legal or brand promise.
- Do not invent a pronunciation that conflicts with the owner.

## Review checklist

- [ ] Name spelling matches the canonical trade name or an approved override.
- [ ] Forbidden language includes unapproved prices and unshipped features.
- [ ] Examples in the docs are labeled EXAMPLE.

## Dependencies

- `brand-strategy`

## Related drafts

Machine draft: `brand/generated/drafts/verbal-identity.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review before any public campaign.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
