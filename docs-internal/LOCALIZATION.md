# Localization

English is the base language. The portal builds `en` by default plus the optional `fa` (right to left) and `tr` locales. Interview prompts are written in English with `fa` and `tr` translations as locale data; a missing translation falls back to English. A brand opts into locales with `brand:init --languages en,fa,tr`. Official brand sentences are not auto-translated.

Approved translations, when a human writes them, belong in `brand/translations/<locale>/<field-id>.md` with `status: approved` and the approver's name. Until that file exists, the English source remains the only official wording and the other locales reuse it for layout. Search stemming is English-only in this version.
