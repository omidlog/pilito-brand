---
title: "Use case: onboarding mascot"
visibility: public
sidebar_position: 3
optional_module: mascot
---

## Request

“Find the approved happy mascot pose for an onboarding success screen.”

## Retrieval

1. Check `brand.mascot.enabled`.
2. Look up `mascot.ui.success`, then `mascot.emotion.joyful` and `mascot.emotion.delighted`.
3. Read `source_assets`, `preview`, and `status`.

## Result in this template

The rows exist as draft proposals. `source_assets` is empty and `preview` is null. The gallery shows the empty frame, which is not the character.

Do not generate a character to fill the request.
