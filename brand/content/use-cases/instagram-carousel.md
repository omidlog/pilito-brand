---
title: "Use case: Instagram carousel"
visibility: public
sidebar_position: 2
tags: 
  - use-case
---

## Request

“Create an Instagram carousel using approved brand typography.”

## Retrieval

1. Read `AGENTS.md`. Approved records outrank drafts.
2. Read `brand/content/16-social-media/overview.md`.
3. Read `brand/tokens/typography.tokens.json` and check that the status is still draft.
4. Call `get_brand_tokens` without `include_unapproved`.

## Result in this template

There is no approved typeface and no approved carousel template. Stop. Do not present the EXAMPLE font stack as the brand’s type.

## When assets are missing

Say what is missing, name the question ids `brand.type.license` and `brand.social.templates`, and wait. Do not draw stand-in brand content.
