---
title: Photography & Video
sidebar_position: 15
tags:
  - brand
  - photo-video
visibility: public
module_id: photo-video
owner: design
status_note: starter
---

# 15 — Photography & Video

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Art direction for lens, light, grade, and the way live footage meets illustration or a mascot.

## Decision this informs

What real footage is allowed to look like.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Art direction | yes | internal | `brand.photo.direction` |
| Lighting and lens | optional | internal | `brand.photo.lighting` |
| Grade | yes | internal | `brand.photo.grade` |
| Compositing | yes | internal | `brand.photo.compositing` |
| Subtitles and titles | yes | internal | `brand.photo.subtitles` |

## Guidance

Describe framing and light without mandating a camera you do not own.

Color grade should reference roles, not an unnamed LUT file.

Compositing rules apply only if mascot or illustration is allowed in footage.

Subtitles, lower thirds, and aspect ratios are presets waiting for real templates.

## Fill-in record

The empty record is `brand/content/15-photo-video-style/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/photo-video.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: no photography has been commissioned. The folder is empty on purpose.

## Do

- Get consent for recognizable people.
- Keep end cards honest about product status.
- Provide a silent cut.

## Don't

- Do not use customer footage without permission.
- Do not fake a product UI in a video.
- Do not store raw camera masters in Git. Use LFS or a bucket.

## Review checklist

- [ ] Consent rule exists.
- [ ] Grade is described or TBD.
- [ ] Large files are not committed as ordinary Git objects.

## Dependencies

- `color-system`
- `verbal-identity`

## Related drafts

Machine draft: `brand/generated/drafts/photo-video.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review before a shoot or a paid video.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
