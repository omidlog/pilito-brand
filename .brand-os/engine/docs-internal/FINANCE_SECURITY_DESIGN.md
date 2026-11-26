# Finance security design (Visual V3.5, decision D4)

> **Status: PROPOSAL, awaiting owner approval.** This document only proposes a design. Nothing in it is
> built. No code, schema, route, CLI flag, MCP tool or agent profile changes until the owner approves the open
> decisions in [section 10](#10-open-owner-decisions). Until then the current rule stands: restricted finance
> values never reach Studio, agents, docs builds or Git.
>
> Date: 2026-11-24. Source of the work item: Visual P0 audit, finding F8, decision D4 and PR row V3.5
> ("finance security design document only; no implementation until approved").

## 1. Why this exists

The Visual Blueprint asks for finance views (P&L, cash flow, actual vs plan, runway charts). The current security
model deliberately keeps every finance figure out of every reader except the owner's local CLI:

- `business.finance.revenue_figure`, `business.finance.costs`, `business.finance.runway`, the marketing budget
  and partner share terms are `sensitivity: restricted` questions
  (`packages/brand-core/src/content/business-modules.ts`).
- Studio's projection withholds them, and its extractor refuses `brand/.private` and `brand/restricted`
  (`docs-internal/STUDIO.md`, "Reading").
- No agent profile, including `finance`, carries the `restricted` scope (`docs-internal/adr/0003-agent-access.md`).

Decision D4 says: any chart of restricted values needs a **separate owner-only export service and threat model**,
and **Studio's projection stays as it is**. This document is that threat model and the design of that service, so
the owner can approve or reject it before anyone writes code.

## 2. What exists today (reuse map)

The design reuses these pieces. It adds no second store, no second key, no second log and no second permission
model unless a decision in section 10 says so.

| Concern | Existing mechanism | Where |
| --- | --- | --- |
| Encrypted restricted answers | AES-256-GCM, key `BRAND_OS_DATA_KEY` (32 bytes, env only, never in the tree), fails closed without the key | `packages/brand-core/src/private-store.ts`, `brand/.private/store.json` |
| Finance calculations | Pure functions; every result `ok` (unit, period, basis, formula) or `missing` / `invalid` / `undefined`; never an invented number; no I/O | `packages/brand-core/src/finance.ts` |
| Finance inputs | `brand:finance --input` reads a file outside the repository or `restricted:<name>` under `brand/restricted/finance/` (gitignored); writes nothing | `packages/brand-core/src/finance-input.ts` |
| Audiences and authorization | `public` / `internal` / `restricted`; `authorize()` denies agents `approve`, `write`, `export`; classification is the higher of fact file and question | `packages/brand-core/src/auth.ts`, ADR 0003 |
| Approval | Owner proof (`BRAND_OS_APPROVAL_PROOF`, stdin or hidden prompt; never argv); finance and restricted fields need the finance or owner role plus the proof; refused under `BRAND_OS_AGENT_TOKEN` | `AGENTS.md` |
| Access log | `brand/.private/access-log.jsonl`, append-only, 0600, ids only, never values; a privileged read is refused if the line cannot be written | ADR 0003 |
| Studio boundary | Allowlisted extraction, `assertNoSecrets` guard, CSP, owner-only sign-in, GET-only pages | `apps/studio/src/github/tar.ts`, `apps/studio/src/projection.ts` |
| Public build gate | `scripts/scan-public.ts`, publication allowlists | `docs-internal/SECURE_PUBLICATION.md` |
| Controlled share precedent | `brand:competitive share` writes one redacted, allow-listed file that the owner reviews and commits; Studio admits only that file and withholds it whole on any unexpected field (D1) | `docs-internal/COMPETITIVE.md` |
| Backups | `brand:backup` writes one AES-256-GCM `backup.enc` (same key) of brand trees including `brand/.private`; `brand/restricted/finance/` is **not** included | `packages/brand-core/src/backup.ts`, `docs-internal/BACKUP.md` |
| Print profiles | `book_a4_portrait`, `canvas_a3_landscape`, `deck_16_9` | `packages/brand-core/src/visual/print-profiles.ts` |

## 3. What finance data a brand workspace could hold

Each class gets one sensitivity tier. The tier decides storage, readers and redaction below.

| Class | Examples | Tier | Where it lives today |
| --- | --- | --- | --- |
| **F0 Finance metadata** | reporting currency, basis (`actual` / `forecast` / `hypothetical`), finance system name, which metrics are tracked, period, "a value exists" | `internal` | approved facts (`business.finance.currency`, `basis`, `system`) |
| **F1 Qualitative finance narrative** | economics note, scenario names, pricing model description (not amounts) | `internal` | approved facts (`business.finance.economics_note`, `scenarios`) |
| **F2 Public prices** | the brand's own published list prices | `public` once published | approved and published facts (`business.sales.pricing`) |
| **F3 Restricted figures** | revenue, costs, runway, cash balance, burn, margins, CAC, LTV, MRR/ARR, marketing budget, partner share terms | `restricted` | encrypted `brand/.private/store.json`; finance input files under `brand/restricted/finance/` or outside the repo |
| **F4 Computed results** | anything `finance.ts` derives from F3 (ratios, projections, break-even) | `restricted` (inherits the highest input) | not stored; printed to the owner's terminal only |
| **F5 Records that must never enter the workspace** | bank statements, account and card numbers, IBAN, tax ids, payroll, salaries of named people, investor cap table with personal data, credentials for billing/CRM/bank APIs, board minutes | **out of scope** | must stay in the system of record (accounting tool, bank); the workspace links to it at most |

A derived number is never less sensitive than its inputs: a ratio of two restricted figures is restricted, even
though it looks harmless (a runway in months plus a public headcount lets a reader estimate cash).

## 4. Threat model

### Assets

F3 and F4 values; `BRAND_OS_DATA_KEY`; the approval proof; any future export file; the access log (it reveals
*when* finance was read, not what).

### Actors

| Actor | Trust | Today's capability |
| --- | --- | --- |
| Owner at the local CLI | trusted | reads everything with the key and proof |
| Agent with a token (MCP, `brand:query`) | partly trusted, read-only | approved, non-restricted facts of its profile; restricted items come back `withheld` |
| Shell-capable agent running as the owner (e.g. Claude Code in the checkout) | partly trusted | can read any file the owner can, including `brand/.private`; tokens do not sandbox it (ADR 0003, "Outstanding") |
| Studio (server and signed-in browser) | trusted for internal, non-restricted data | sees the merged default branch through the allowlist only |
| Anyone with repository read access | not trusted with finance | sees every tracked file and the whole Git history |
| Recipient of an exported document (accountant, investor) | trusted for that document only | whatever the file contains, forever |
| Third-party AI connectors / chat products | not trusted with finance | whatever is pasted or connected (`docs-internal/AI_CONNECTORS.md`) |

### Trust boundaries

1. Owner machine ↔ Git remote (anything committed is effectively permanent).
2. Owner process ↔ agent process (MCP / token boundary).
3. Brand repository ↔ Studio (allowlisted extraction).
4. Owner machine ↔ export recipient (a file that leaves is out of our control).

### Threats

| # | Threat | Example | Existing control | Gap this design closes |
| --- | --- | --- | --- | --- |
| T1 | Restricted figure committed to Git | a chart PNG or HTML export saved under a tracked path | `.gitignore` for `brand/.private/`, `brand/restricted/finance/`, `brand/exports/`; `scan-public` | no scanner for finance canaries in tracked files; an export path could be chosen inside a tracked folder |
| T2 | Finance reaches Studio | someone adds a "finance summary" file to the Studio allowlist | allowlist, `assertNoSecrets`, projection withholding | needs an explicit "never" test for any finance-shaped file (section 9) |
| T3 | Agent reads finance over MCP | `brand_retrieve --module business-finance` | no profile has `restricted`; values `null, withheld: true` | none for MCP; keep it that way |
| T4 | Shell agent reads the encrypted store or input files | agent runs `cat brand/restricted/finance/q3.json` | key is env-only; store is encrypted | input files under `brand/restricted/finance/` are plaintext; an agent session may inherit `BRAND_OS_DATA_KEY` |
| T5 | Finance in generated drafts, logs, caches or error messages | an exception prints an input value; a draft file holds a figure | access log never records values; drafts mask restricted values for non-reviewers | export service must never put values in logs, errors, file names or temp files outside the export dir |
| T6 | Inference from redacted output | a banded revenue plus public pricing reveals customer count | none (no redacted finance output exists yet) | redaction levels in section 6 and "derived inherits highest input" |
| T7 | Export leaks beyond the intended recipient | investor PDF forwarded | none | imprint with audience, date, digest and "confidential" stamp; no hidden data in the file; owner chooses the profile each time |
| T8 | Fabricated or stale number presented as fact | a forecast drawn like an actual | `finance.ts` basis and `missing` results | charts must draw basis by line style and label every number's period and `as_of` |
| T9 | Key or proof leaks | key pasted into a command line or a report | proof refused on argv; key env-only | export service must refuse to run with the key passed as an argument and never echo it |
| T10 | Tampered export claimed as ours | someone edits figures in an exported file | none | digest in the imprint, recomputable by the owner (`verify`) |
| T11 | Backups leak or lose finance | a backup folder copied to a shared drive; a restore after disk loss | backups are encrypted with the data key and live under `brand/.private/backups/` | finance input files under `brand/restricted/finance/` are not in the backup, so a restore silently loses them (decision FD2) |

Out of scope for this design: a hosted multi-user finance service, live bank / billing / CRM adapters, tax or
statutory reporting, and anything that moves money.

## 5. Where finance data would live and who can read it

### Storage (proposal)

- **F3 values** stay in the existing encrypted store, `brand/.private/store.json` (AES-256-GCM,
  `BRAND_OS_DATA_KEY`). No second store.
- **Finance input files** (period actuals, scenarios) move from plaintext `brand/restricted/finance/<name>.json`
  to an encrypted envelope in the same folder, using the same key and the same AES-256-GCM helper (decision FD2).
  Files outside the repository stay accepted as they are today.
- **F4 results** are never stored. They are recomputed at export time from F3 and the input files.
- **Exports** are written outside the repository by default, or to `brand/exports/` (already gitignored). A path
  inside any other tracked folder is refused.
- **F5 records** are refused: the export service and the input parser accept only the documented
  `FINANCE_INPUTS` keys, so an IBAN or a salary list has no field to land in.

### Readers

| Reader | F0 metadata | F1 narrative | F2 public prices | F3 figures | F4 results | Export files |
| --- | --- | --- | --- | --- | --- | --- |
| Owner, local CLI with key and proof | yes | yes | yes | yes | yes | creates them |
| Agent token, any profile (incl. `finance`) | approved only | approved only | approved only | **never** (`withheld`) | **never** | **never** (`export` denied) |
| Shell agent in the checkout | as files | as files | as files | **must not**: see FD3 | **must not** | **must not** |
| Studio | approved, internal edition | approved, internal edition | approved; public edition only if published | **never** | **never** | **never** |
| Docs build / public site | only if published | only if published | only if published | **never** | **never** | **never** |
| Brand Runtime, `task_context`, Coach, Assurance | as today (approved, non-restricted) | as today | as today | **never** (Assurance already withholds restricted inputs) | **never** | **never** |
| Export recipient | per profile (section 6) | per profile | per profile | per profile | per profile | the one file sent |

"Never" for Studio is unconditional in this proposal. Unlike competitor data (D1), there is **no** finance share
file in Git. Decision FD1 lets the owner change only the narrow presence-only variant, and the recommendation is
to keep it closed.

## 6. Redaction per audience and export profile

### Redaction levels

| Level | What the reader sees | Example (synthetic brand) |
| --- | --- | --- |
| `exact` | the number with unit, period, basis, `as_of` | revenue 41,200 EUR, month, actual, 2026-10-31 |
| `banded` | an owner-defined band, never narrower than the band table allows | revenue 25k–50k EUR / month |
| `ratio_only` | a dimensionless ratio, only if no other shown value lets the reader invert it | gross margin 62 % |
| `trend_only` | direction and line shape without an axis scale | revenue up for three months (unlabelled axis) |
| `presence_only` | "provided" / "missing" / "withheld" | runway: provided |
| `withheld` | the field label and the standard withheld note | runway: withheld |

Rules: a level is chosen per **field**, not per document; derived results use the strictest level of their
inputs; `ratio_only` and `trend_only` are refused when another shown value in the same document would let the
reader recover the absolute number (the export service checks the combination, not each field alone).

### Profiles

| Profile | Audience | F0 | F1 | F2 | F3 / F4 | Delivery |
| --- | --- | --- | --- | --- | --- | --- |
| Studio (internal edition) | owner in browser | approved | approved | approved | `withheld` (unchanged) | existing projection |
| Studio (public edition) | public preview | published only | published only | published only | absent | existing projection |
| `finance_owner_review` | owner only | yes | yes | yes | `exact` | local HTML/PDF, outside the repo |
| `finance_accountant` | named accountant | yes | yes | yes | `exact` for chosen fields, others `withheld` | local PDF, owner sends it |
| `finance_investor_summary` | investor | yes | yes | yes | `banded` / `ratio_only` per owner choice, never `exact` by default | local PDF, owner sends it |
| `brand_book_public` | anyone | published only | published only | published only | absent | existing visual print path |
| Agent (any profile) | agent | approved | approved | approved | `withheld` | MCP (unchanged) |

Every export carries an imprint page: profile, audience, brand slug, `as_of`, the export digest, the
classification ("Confidential — prepared for <audience>"), and the basis legend (actual solid, forecast dashed,
hypothetical dotted, as the Visual Blueprint requires). No hidden layers, metadata fields or embedded source data:
the file contains exactly what is visible.

## 7. The proposed owner-only export service

This is the "separate owner-only export service" D4 asks for. It is a **CLI on the owner's machine**, not a
server, and not part of Studio.

```text
npm run brand:finance -- export --profile <profile> --out <path outside the repo or brand/exports/> [--locale en|fa|tr] [--dry-run]
npm run brand:finance -- verify --file <export>
```

Behaviour (proposal, not built):

1. Refuses to run while `BRAND_OS_AGENT_TOKEN` is set (same rule as approval and Assurance).
2. Requires the owner approval proof (stdin, hidden prompt or `BRAND_OS_APPROVAL_PROOF`; never argv) and
   `BRAND_OS_DATA_KEY`; fails closed without either.
3. Reads F3 from the encrypted store and the chosen input files; computes F4 with `finance.ts`; never invents a
   number (`missing` stays a designed empty state or ghost chart).
4. Applies the profile's redaction table and the inversion check from section 6.
5. Renders locally with the existing visual print path (no network, no third-party chart service, no font CDN;
   Vazirmatn self-hosted for Persian, RTL layout; the canonical chart orientation is kept, not mirrored).
6. Writes one file atomically, mode 0600; refuses tracked paths and symlinks; `--dry-run` prints only the field
   list and levels, never values.
7. Appends one access-log line (section 8).
8. `verify` recomputes the digest and reports `match` / `changed`; it never prints values.

There is no MCP tool, no `brand_retrieve` kind, no Studio route and no agent profile for any of this.

## 8. Audit logging

Reuse `brand/.private/access-log.jsonl` (append-only, 0600). New event kinds, one line each:

| Event | Recorded | Never recorded |
| --- | --- | --- |
| `finance.export` | time, principal (`owner`), profile, audience label, field ids with their redaction level, export digest, output path class (`outside_repo` / `brand_exports`), locale | values, bands, file contents, recipient's name, full output path |
| `finance.export_refused` | time, reason code (`agent_token_present`, `no_key`, `bad_proof`, `tracked_path`, `inversion_risk`) | values, the proof, the key |
| `finance.verify` | time, digest, `match` / `changed` | values |
| `finance.input_read` | time, input name hash (16-char sha256 prefix, as for free-text queries), field ids | values, file names in clear |

If the line cannot be written, the export is refused (same rule as privileged reads today). A future
hash-chained log is decision FD5.

## 9. What must never reach agents or Studio

These are invariants. An implementation PR must add a test for each.

1. No F3 value, F4 result, band, ratio or trend of a restricted figure in the Studio projection, cache, page,
   print view, static bundle or error page, in any edition or locale. Canary values must be absent from every
   byte Studio writes or serves.
2. No finance-shaped file is ever added to Studio's extraction allowlist (no `brand/finance/shared`,
   no `brand/restricted/**`, no `brand/exports/**`).
3. No MCP tool, `brand_retrieve` kind, `task_context` field, Brand Runtime pack, Visual DNA verdict, Coach note or
   Assurance result carries a restricted finance value; agents keep getting `withheld`.
4. No agent profile gains the `restricted` scope or the `export` action.
5. No export, input file or computed value is written to a tracked path, and no value appears in a log, error
   message, file name, commit message, PR body or report.
6. `BRAND_OS_DATA_KEY` and the approval proof are never accepted as arguments, never printed, never written.
7. No F5 record (bank, tax, payroll, card or personal data) is accepted anywhere in the workspace.
8. No network call during export.

## 10. Open owner decisions

Each decision has a recommendation. Nothing is built until the owner answers.

| # | Question | Options | Recommendation |
| --- | --- | --- | --- |
| **FD1** | May Studio ever show anything about restricted finance? | (a) never, as today; (b) presence-only ("runway: provided / missing") through an owner-committed share file like D1; (c) banded values in Studio | **(a) never.** Presence is already shown as "withheld" today. A share file puts finance-derived data into Git history permanently, and Git history cannot be cleaned reliably. |
| **FD2** | Should finance input files under `brand/restricted/finance/` be encrypted at rest (and included in `brand:backup`)? | (a) keep plaintext (gitignored), not backed up; (b) encrypt with the existing key and AES-256-GCM helper, and add the folder to the encrypted backup | **(b) encrypt and back up.** A shell agent or a copied folder otherwise reads them in clear, and today a restore loses them; reuse the existing key, no new crypto. |
| **FD3** | How do we stop a shell-capable agent (Claude Code in the checkout) from reading finance? | (a) documentation only; (b) keep the key out of agent sessions and encrypt inputs (FD2), so files are unreadable without the key; (c) move finance out of the checkout entirely | **(b).** Tokens cannot sandbox a shell, but without the key the files are ciphertext. Document "never start an agent session with `BRAND_OS_DATA_KEY` set". |
| **FD4** | Which export profiles to build first? | owner review, accountant, investor summary | **`finance_owner_review` only** first; accountant and investor later, one PR each, after the owner sees the first output. |
| **FD5** | Is the existing access log enough, or do we need a tamper-evident (hash-chained) finance log? | (a) existing log; (b) hash-chained finance events | **(a) for now.** Single-owner local tool; revisit when more than one person can export. |
| **FD6** | Separate key for finance, or the same `BRAND_OS_DATA_KEY`? | (a) same key; (b) separate `BRAND_OS_FINANCE_KEY` | **(a) same key.** A second key doubles the chance of losing data and adds little for a single owner; revisit with multiple people. |
| **FD7** | May the investor profile ever show exact figures? | (a) never by default, owner opts in per field each time; (b) allow `exact` by default | **(a).** Banded and ratio by default; exact only when the owner names the field for that export. |
| **FD8** | Should exported PDFs be password-protected? | (a) no, rely on the channel; (b) yes, owner-chosen password | **(a) no.** PDF passwords are weak protection and give a false sense of safety; send through an encrypted channel instead and keep the confidentiality stamp. |

## 11. Proposed user-visible strings

Every string a later implementation shows. Persian uses Vazirmatn and RTL. These are proposals; the existing
Studio withheld strings (`common.withheld`, `common.withheldNote`) stay unchanged.

| Key | en | fa | tr |
| --- | --- | --- | --- |
| `finance.export.confidential` | Confidential — prepared for {audience} | محرمانه — تهیه‌شده برای {audience} | Gizli — {audience} için hazırlandı |
| `finance.export.refusedAgent` | Finance export is owner-only. It does not run while an agent token is set. | خروجی مالی فقط برای مالک است و وقتی توکن عامل تنظیم شده باشد اجرا نمی‌شود. | Finans dışa aktarımı yalnızca sahibe aittir. Bir ajan belirteci ayarlıyken çalışmaz. |
| `finance.export.refusedPath` | Choose a folder outside the repository or brand/exports/. | پوشه‌ای بیرون از مخزن یا brand/exports/ انتخاب کنید. | Deponun dışında bir klasör ya da brand/exports/ seçin. |
| `finance.export.inversionRisk` | This combination would reveal a withheld figure. Choose a stricter level. | این ترکیب یک عدد محفوظ را آشکار می‌کند. سطح سخت‌گیرانه‌تری انتخاب کنید. | Bu birleşim gizlenen bir rakamı ortaya çıkarır. Daha sıkı bir düzey seçin. |
| `finance.basis.legend` | Actual: solid line · Forecast: dashed · Hypothetical: dotted | واقعی: خط پر · پیش‌بینی: خط‌چین · فرضی: نقطه‌چین | Gerçekleşen: düz çizgi · Tahmin: kesikli · Varsayımsal: noktalı |
| `finance.presence.provided` | Provided (value withheld) | ثبت شده (مقدار محفوظ) | Girildi (değer gizli) |
| `finance.verify.match` | The file matches its digest. | فایل با چکیدهٔ خود مطابقت دارد. | Dosya özetiyle eşleşiyor. |
| `finance.verify.changed` | The file was changed after export. | فایل پس از خروجی گرفتن تغییر کرده است. | Dosya dışa aktarımdan sonra değiştirilmiş. |

## 12. Tests an implementation must ship

Synthetic demo brand only, with canary values.

- Canary absence: every Studio byte (projection, cache, pages, print, static), every MCP / `brand_retrieve` /
  `task_context` / runtime / Coach / Assurance output, every log line and every error message.
- Refusals: agent token set, no key, wrong proof, proof on argv, tracked output path, symlinked output, inversion
  risk, F5-shaped input keys.
- Redaction: each level per profile; derived results inherit the strictest input level.
- Determinism: same inputs and profile give the same digest; `verify` detects a one-byte change.
- Locales: en/fa/tr output, Persian in Vazirmatn with RTL; basis by line style, not colour only.
- Allowlist pin: Studio's extraction allowlist test fails if any finance path is added.

## 13. Not in this document

Implementation, live accounting / bank / billing adapters, tax and statutory statements (IFRS, IAS), multi-user
finance roles, hosted services, and any change to Studio, MCP or agent profiles. Each needs owner approval of this
proposal first, then its own PR.
