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

## One review, one approval

`npm run brand:pending [-- --lang fa|tr] [--only …]` lists everything waiting for the owner in plain words and ends
with the one command that approves it. It reads only and needs no proof.

`npm run brand:approve -- --all-pending` approves, with one proof read, every pending:

- fact, change proposal, evidence item and draft asset (unchanged behaviour and output);
- strategy draft revision (SEO, paid media, content), when it is the newest revision of its strategy;
- content calendar week draft, when it is the newest revision of its week;
- social style kit style, grouped per surface (draft or edited after approval);
- creative preference draft (approved at project scope; a series scope still needs `brand:creative approve --scope series`);
- pending aspect proposal (only suggestions with a clear side are applied).

For each item the plan computes the digest the kind's own review shows (`brand:strategy review`, `brand:content week
review`, `brand:social kit review --surface`; creative records use their record digest) and approval hands exactly that
digest to the kind's existing approve function, which keeps every rule of its own. An item that changed between the
plan and the approval (a newer revision, different content, a new blocker) is reported `stale` and is not approved.
Strategies and weeks are always listed with their own review command, because the owner usually reads them in full;
`--only strategy,week` (or `social`, `creative`, `aspect`, `fact`, `change`, `evidence`, `asset`) narrows a run and
`--exclude <id>` leaves one item out. `--dry-run`, `--json` and `--lang en|fa|tr` work as before. Both commands refuse
under `BRAND_OS_AGENT_TOKEN`, and the proof is never accepted on the command line. Approving authorizes no post,
publication, schedule, ad or spend.

## Approval proof, approval secret and rotation

The approval proof is the content of `brand/.private/approval-secret`: the proof equals the secret. Commands read it
from `BRAND_OS_APPROVAL_PROOF`, piped stdin, the macOS Keychain (`brand:doctor --store-proof-keychain`) or a hidden
prompt, never from argv, and compare it with the file. The secret also keys an HMAC seal on three kinds of records:
strategy approvals (`brand/.private/strategy/records/*/record.json`), content calendar week approvals
(`brand/.private/content/calendar/*/record.json`) and social style kit approvals (`brand/.private/social/approvals.json`).
Facts, evidence, assets, tokens, creative preferences and aspect proposals only compare the proof. Agent tokens are
stored as a plain SHA-256 of the token, not keyed by the secret; restricted answers are encrypted with
`BRAND_OS_DATA_KEY`, not with the secret.

If the secret leaked (for example it was uploaded by a cloud drive), rotate it:

```bash
npm run brand:doctor -- --rotate-approval-secret < brand/.private/approval-secret   # or env, Keychain, prompt
```

It needs the CURRENT proof, verifies every existing seal under the old secret, writes a new secret, re-seals exactly
the seals that verified and lists the ones that did not (they stay invalid). Every changed file is staged next to its
target and swapped in with the secret last; if a step fails, the swapped files are restored and the old proof still
works. A stored Keychain entry is replaced and the new proof is not printed; otherwise the new proof is printed once on
stderr with how to store it. An audit line without secret material goes to `brand/.private/approval-secret-rotations.jsonl`.
Agent tokens stay valid after rotation (they are not keyed by the secret); revoke and reissue a token only if the token
itself may have leaked. Do not run approvals while rotating.

## Cloud-synced folders

Keep a brand repository outside Google Drive, iCloud Drive, Dropbox and OneDrive. A synced folder uploads
`brand/.private` (the approval secret and sealed approvals), and Google Drive for Desktop hard-links files into
`.tmp.driveupload` while it uploads, so Brand OS refuses to read them (`unsafe_path: … has more than one hard link`); the
message now names the likely provider and the fix. `brand:doctor` has a `cloud_sync` check (fail when `brand/.private`
exists inside a synced folder), `brand:init` and `brand-os scaffold --new` warn. Recovery: move the repository (for
example `mv ~/Documents/acme ~/Code/acme`), run `npm run brand:doctor -- --fix-links` (replaces hard-linked working-tree
files, `.git` and `node_modules` excluded, with independent copies, same mode), then rotate the approval secret.
Detection is by path and markers; "appears to be" means likely, not certain.
