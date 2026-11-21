---
title: Thought Leadership & Channels
sidebar_position: 6
tags:
  - personal
  - personal-content
visibility: public
module_id: personal-content
owner: person
status_note: starter
optional_module: personal
---

# P-06 — Thought Leadership & Channels

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** person.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Content pillars, channels and the outcome that matters. Voice and forbidden language are referenced from Verbal Identity, not duplicated.

## Decision this informs

What to publish, where, and how success is measured.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Content pillars | yes | internal | `personal.content.pillars` |
| Channels and their goals | yes | internal | `personal.content.channels` |
| Channel tone differences | optional | internal | `personal.content.channel_tone` |
| Outcome that matters | yes | internal | `personal.goals.outcomes` |
| Measurement | optional | internal | `personal.goals.kpis` |
| Tone of voice | canonical reference | internal | `brand.verbal.voice` |
| Voice do and don’t | canonical reference | internal | `brand.verbal.voice_pairs` |
| Forbidden language | canonical reference | internal | `brand.verbal.forbidden` |

## Guidance

Voice lives in brand.verbal.voice, do/don’t pairs in brand.verbal.voice_pairs and banned language in brand.verbal.forbidden. This module references them.

Audience numbers carry a date and a source, or they are not used.

Follower count is rarely the outcome. Name the outcome.

## Fill-in record

The empty record is `brand/personal/06-content/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/personal-content.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: pillars discovery, pricing, team habits; LinkedIn for clients, newsletter for depth. Illustration only.

## Do

- Map each pillar to at least one channel.
- Keep platform-specific tone differences explicit.

## Don't

- Do not invent degrees, clients, awards, revenue, seniority or quantified outcomes.
- Do not collect a home address, personal phone, birth date, government id or family details.
- Do not treat working at or founding an organization as owning it.
- Do not report audience metrics without a date and source.

## Review checklist

- [ ] Three pillars or unknown.
- [ ] Channels with a goal each.
- [ ] Outcome named.

## Dependencies

- `personal-positioning`

## Related drafts

Machine draft: `brand/generated/drafts/personal-content.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review quarterly.

## Metrics

- None defined yet.

