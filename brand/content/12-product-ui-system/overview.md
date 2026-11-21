---
title: Product UI Design System
sidebar_position: 12
tags:
  - brand
  - product-ui
visibility: public
module_id: product-ui
owner: design
status_note: starter
---

# 12 — Product UI Design System

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** design.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Foundations, components, states, and handoff. This repo documents the system and binds examples to tokens. It is not a full production component library for your app.

## Decision this informs

Which components exist, which states they need, and what accessibility bar they inherit.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Platforms | yes | internal | `brand.ui.platforms` |
| Component priority | yes | internal | `brand.ui.components` |
| Required states | yes | internal | `brand.ui.states` |
| Onboarding pattern | yes | internal | `brand.ui.onboarding` |
| UI accessibility | yes | internal | `brand.ui.a11y` |
| Handoff | yes | internal | `brand.ui.handoff` |
| Color roles | canonical reference | internal | `brand.color.roles` |
| Microcopy principle | canonical reference | internal | `brand.verbal.microcopy` |
| Accessibility intent | canonical reference | internal | `business.product.accessibility` |
| Onboarding outcome | canonical reference | internal | `business.cx.onboarding` |

## Guidance

Foundations point at DTCG tokens: color, type, space, radius, elevation, motion.

Every interactive component needs default, hover, focus, active, disabled, loading, and error where those states exist.

Patterns (onboarding, empty, success, offline, permissions) reference content rules and, optionally, mascot state ids.

Figma component names should map to the same ids. Drift is a report, not a second source of truth.

## Fill-in record

The empty record is `brand/content/12-product-ui-system/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/product-ui.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

The docs include an EXAMPLE token button. It demonstrates states. It is not your app’s button.

## Do

- Show focus without relying on color alone.
- Write empty and error copy against the voice rules.
- Keep dark mode on the same components.

## Don't

- Do not claim a React kit you have not shipped.
- Do not design a control that product scope excluded.
- Do not remove focus outlines.

## Review checklist

- [ ] Token ids are used in examples.
- [ ] Keyboard behavior is described for each new component.
- [ ] Handoff names match Figma when a file exists.

## Dependencies

- `color-system`
- `typography`
- `layout`

## Related drafts

Machine draft: `brand/generated/drafts/product-ui.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review when a component is added or a token role changes.

## Metrics

- None defined yet.


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
