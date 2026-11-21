# Governance

## Lifecycle

`not_started → draft → in_review → approved → deprecated`

The interview records `unknown`, `skipped`, and `not_applicable` as dispositions. They are not approvals.

## Who may approve

| Actor | May approve |
| --- | --- |
| owner | canonical, visual, public copy, financial and restricted |
| design | visual modules |
| marketing | public-sensitivity fields |
| finance | financial and restricted fields |
| guest | nothing |

The local CLI defaults the actor to `owner` because the template has one operator. Pass `--actor guest` to see a denial.

## Licenses

The template code is MIT. A brand's own words, marks, and files are not automatically MIT. Set `brand.gov.license` when you know the ownership rule. Until then, treat brand files as all rights reserved by the owner.

## Secrets

No tokens in Git. `.env.example` lists the variable names. The validator rejects private-key blocks and common token prefixes.

## Upgrades

Improve the engine in this template and copy engine changes into a brand repo carefully. Do not replace `brand/instance` or approved records with the template's empty ledger. `npm run materialize` rewrites starter guidance and the question bank. It does not reset an existing ledger. `brand:init --yes` does reset the ledger. Run init only on a new brand.
