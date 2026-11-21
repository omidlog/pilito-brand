# Agent request examples

These are the expected retrievals for the template as it ships. Both stop before fabricating an approval.

## Instagram carousel

Utterance: “Create an Instagram carousel using approved brand typography.”

1. Read `AGENTS.md`.
2. Read `brand/content/16-social-media/overview.md`.
3. Read `brand/tokens/typography.tokens.json` and note `status` is not approved.
4. Call `get_brand_tokens` without `include_unapproved`.
5. Stop. The EXAMPLE font stack is not the brand’s type. Ask `brand.type.license` and `brand.social.templates`.

## Onboarding mascot

Utterance: “Find the approved happy mascot pose for an onboarding success screen.”

1. Read `brand.config.yaml` `modules.mascot.enabled`.
2. Look up `mascot.ui.success`, then `mascot.emotion.joyful` and `mascot.emotion.delighted` in `brand/mascot/catalog.yaml`.
3. Read `source_assets`, `preview`, and `status`.
4. Stop when they are empty or draft. The placeholder frame in `brand/assets/mascot/placeholder-frame.svg` is not the character.
