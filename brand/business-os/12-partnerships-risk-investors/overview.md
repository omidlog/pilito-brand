---
title: Partnerships, Distribution, Risk & Investor Readiness
sidebar_position: 12
tags:
  - business
  - business-partnerships
visibility: public
module_id: business-partnerships
owner: leadership
status_note: starter
---

# BO-12 — Partnerships, Distribution, Risk & Investor Readiness

**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.
**Owner role:** leadership.
**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.

## Purpose

Cover distribution partners, the risk register, and investor narrative only from verified claims. Confidential board material stays in a restricted collection, usually outside this repo.

## Decision this informs

Which external relationships and risks are real, and what an outsider may be told.

## How to complete this module

1. Run `npm run brand:interview`. The agent asks one eligible question at a time.
2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.
3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.
4. Add real files to the asset manifest when you have them. Missing files stay missing.

## Canonical fields

| Field | Required | Sensitivity | Question |
| --- | --- | --- | --- |
| Partners | yes | internal | `business.partners.channels` |
| Revenue share | optional | restricted | `business.partners.share` |
| Risk review | yes | internal | `business.partners.risk_process` |
| External narrative | yes | internal | `business.partners.narrative` |
| Diligence index | optional | internal | `business.partners.diligence` |
| Board documents | optional | restricted | `business.partners.board_home` |
| Top risks | canonical reference | internal | `business.plan.risks` |
| Next milestone | canonical reference | internal | `business.plan.milestone` |
| Value proposition | canonical reference | internal | `business.offer.value_proposition` |

## Guidance

Partner tiers and revenue-share notes are assumptions until a signed term is cited.

Risks need a probability/impact label the owner believes, plus an owner and a review date. Unknown probability stays unknown.

Pitch outlines pull from approved or clearly estimated fields. They do not create new traction numbers.

Diligence indexes link to sources. They do not embed the data room.

## Inputs

- Offer
- Milestone
- Risks
- Finance unknowns

## Artifacts

- Partner note
- Risk register
- Pitch outline rules
- Diligence index

## Acceptance

- A pitch cannot show a number that finance marked unknown.

## Fill-in record

The empty record is `brand/business-os/12-partnerships-risk-investors/record.yaml`. Live answers are stored in `brand/instance/` and the generated draft `brand/generated/drafts/business-partnerships.md`, so editing this overview does not approve a fact.

## Worked example

> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.

EXAMPLE: there are no partners, no round, and no data room. The narrative is “pre-evidence”.

## Do

- Keep investor documents restricted.
- Reuse the canonical milestone and offer.
- Name distribution channels you actually have.

## Don't

- Do not invent traction, logos of customers, or a round size.
- Do not commit board decks with personal data.
- Do not treat a partner conversation as a signed channel.

## Review checklist

- [ ] Narrative uses only sourced claims.
- [ ] Risks link to the company risk note.
- [ ] Restricted board location is a system name, not the files.

## Dependencies

- `business-company`
- `business-finance`
- `business-legal`

## Related drafts

Machine draft: `brand/generated/drafts/business-partnerships.md`

## Completion

Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.

## Update cadence

Review before any external fundraising conversation.

## Metrics

- Open risks
- Unsourced pitch claims


## Machine translation draft (fa)

> status: draft machine-translation. Not an approved brand fact.

این صفحه راهنمای قالب است، نه تصمیم تأییدشدهٔ برند. مصاحبه را با `npm run brand:interview` شروع کنید. پاسخ‌ها پیش‌نویس می‌مانند تا یک انسان با رمز تأیید (`BRAND_OS_APPROVAL_PROOF`) آن‌ها را تأیید کند. فیلدهای نامشخص را خالی بگذارید و حدس نزنید.

## Machine translation draft (tr)

> status: draft machine-translation. Not an approved brand fact.

Bu sayfa şablon rehberidir, onaylanmış bir marka kararı değildir. Görüşmeyi `npm run brand:interview` ile başlatın. Yanıtlar, bir insan onay kanıtıyla (`BRAND_OS_APPROVAL_PROOF`) onaylayana kadar taslak kalır. Bilinmeyen alanları boş bırakın; tahmin etmeyin.
