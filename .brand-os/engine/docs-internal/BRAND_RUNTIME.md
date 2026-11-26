# Brand Runtime — first vertical slice: ten Instagram posts

Read this before touching `packages/brand-core/src/runtime/` or `scripts/runtime.ts`. Preflight and the wider plan:
`docs-internal/BRAND_RUNTIME_PREFLIGHT.md`.

One real path, end to end: **a `task_context` pack → ten real SVG posts → deterministic checks from the existing
layers → files in a local output directory**. No model, no network, no publishing (`authorizes: []`).

## What it is not

- **Not a third quality system.** The Runtime owns no rule and no quality vocabulary. It calls the layers that already
  own each check and reports their result under the owner's name (`layer`). It prints no score.
- **Not a context store.** Context is one `brand-os/task-context/v1` pack, verified by its digest (`verifyPack`).
- **Not a copywriter.** Every message on a post is an approved pack item, byte for byte. Set-valued facts (pillars)
  are split with the Content Bridge's own `splitItems`; nothing is paraphrased, shortened or translated. Labels around
  the copy ("Our promise", the counter, the draft stamp) are fixed en/fa/tr UI strings.
- **Not a writer of brand data.** `--pack` renders a real brand's approved pack file; it reads that file (and, with
  `--root`, the owner's own checkout of the same brand, read-only) and writes only to an empty `--out`.

## Inputs

| Input | Where the pack comes from | Coach | Logo |
| --- | --- | --- | --- |
| `--demo` | `createDemoBrand()` + `buildTaskContext` for a `content-read` agent, in a temp dir | called | demo logo, through Visual DNA |
| `--pack <file>` | the JSON `brand:query --tool task_context --task-type social_batch --count 10` printed (envelope or bare pack) | not called | none |
| `--pack <file> --root <dir>` | same, plus the owner's checkout of the **same** brand (slug = pack `brand_id`), owner process only | called | approved logo through Visual DNA + pinned checksum |

**The logo goes through the Visual DNA resolver** (owner decision 6 of the Visual DNA slice, built in PR-E):
`loadApprovedLogo` asks `resolveVisualDna` for the pack's logo ids as the local owner process and reads the bytes with
`readVerifiedAsset(…, 'renderer')`, which hashes and gates the very bytes it returns. So the runtime gets the same
verdict `visual_dna` gives (approval for these bytes, rights, licence, size, safe path, no symlink, both SVG gates), and
a file that differs from the checksum the pack pinned is `visual_dna:changed:pack_pin_differs`. A logo that is not
embedded carries its reason code (`visual_dna:<state>:<reason>`, `not_svg`, `visual_dna_read:<code>`) in the post
manifest. The resolver appends its own audit line to `brand/.private/access-log.jsonl` (ids only); nothing else in
`brand/` is written. The resolver runs with its default `use_scope: public`, so the runtime embeds only what public
use allows; a brand's own mark with an empty or `TBD` licence is approved (`own_brand_mark`, Visual DNA policy #44).

A pack file is checked in this order: regular file (no symlink), ≤ 2 MB, valid JSON, a `task_context` envelope must be
`status: ok` with empty `authorizes` and the same `brand_id` as its pack, then the shape guard (`assertPackShape`), then
the same checks the demo goes through in `runSocialBatch`: digest (`verifyPack`), `social_batch`, count 10, empty
`authorizes` and permissions. A tampered, wrong-type or wrong-count file is refused exactly like a demo pack.

## Flow

```
createDemoBrand()  ── temp dir under os.tmpdir(), never this repo's brand/
   │  approved demo facts, one approved demo logo (no model_use ⇒ not_allowed), approved content strategy
   ▼
buildTaskContext(engine, content-read ctx, social_batch, count 10)     ← task-context, unchanged
   ▼
planSocialBatch(pack)   ten distinct angles × five layouts, palette from approved brand.color.roles
   ▼
renderPost()            pure SVG, 1080×1350, live text, draft stamp in the artwork
   ▼
postChecks / setChecks / coachLayer / assuranceLayer   ← existing layers only
   ▼
writeBatch(out)         posts/post-NN.svg, posts/post-NN.manifest.json, batch-summary.json
```

## Who owns each check

| Check | Owner (called, not copied) | Result shape |
| --- | --- | --- |
| `svg.allowlist` | `@brand-os/asset-catalog` `checkSvg` | `warn` for the live-text warning (text stays editable on purpose) |
| `svg.publication_gate` | `@brand-os/asset-catalog` `svgPublicationIssues` (both gates) | pass/fail + issue codes |
| `svg.normalized` | `@brand-os/asset-catalog/normalize` `normalizeSvg` | pass when the normalizer would change nothing |
| `copy.claims` | Content Bridge `claimConflicts` (banned claims + availability rule from the pack) | fail with `banned:<field>:<source>` |
| `color.contrast` | `@brand-os/design-tokens` `contrastRatio`; thresholds informed by WCAG 2.2 (`informed_by` in the assurance registry, no conformance claim) | ratios per drawn pair |
| `pack.digest`, `pack.staleness` | Task Context `verifyPack`, pack `staleness` | pass/warn/fail |
| Coach | `coachAnalyze` — `quality_review` for every fact a post cites, `consistency_review` brand-wide | status + finding codes + context digest; never answer text |
| Assurance | `assess()` over the pack's source states (Positioning Readiness v1) | control statuses + reason codes; `demo_data`, `internal_assessment_only` |
| `post.format`, `post.headline_fit`, `post.signoff_fit`, `set.*` | `runtime.manifest`: integrity of the artifact itself (size, count, distinct files and messages) | facts about the files, not quality verdicts |

Visual and semantic review are `not_tested`: no model looked at anything, and the summary says a person must.

**Coach never blocks** (owner decision). Coach results that are not `ready` are listed in `batch-summary.json`
`warnings[]` (question id, status, finding codes, `blocks: false`) and printed as advice. `status: blocked` comes only
from the plan (too few approved messages, no approved palette); a pack that fails integrity is refused before any post;
a banned claim is a `copy.claims: fail` on the post. Taglines and brand promises are short by design: the Coach itself
exempts `brand.verbal.tagline` and `brand.strategy.promise` from `too_brief_for_output` (`SHORT_BY_DESIGN_IDS`).

## Type

Drafts use the approved `brand.type.scale` from the pack (`type.ts`), parsed with the core `font` structured type:

| Post slot | Approved role names, in order | Fallback |
| --- | --- | --- |
| headline | `display`, `headline`, `heading`, `h1`, `title`, `hero` | body role, then the first role |
| label (eyebrow) | `label`, `eyebrow`, `overline`, `caption`, `subtitle`, `small` | body role, then the first role |
| body (CTA, sign-off) | `body`, `text`, `paragraph`, `base`, `copy` | the first role |

- Family and fallbacks are the approved stack, verbatim; `sans-serif` is appended only when the stack names no generic
  family (`appended_generic: true`).
- Sizes: canvas px = approved CSS px × 2 (`CANVAS_SCALE`; a 1080 px post shows at about 540 CSS px). A role without a
  size keeps the renderer default (`size_source: renderer_default`). An approved headline size that has to shrink to
  fit is drawn smaller and reported as `post.headline_fit: warn`.
- Weights: only from hash-approved `type.fontWeight.<role>` tokens in the pack. The scale has no weight field, so
  otherwise the renderer default is used and labelled `weight_source: renderer_default`.
- Counter and draft stamp use the label family at fixed sizes so the stamp stays legible.
- Without an approved scale every slot is the v1.0 renderer default, labelled. `manifest.typography` records it all,
  and `brand.type.scale` (and any weight token) is cited in `sources[]` with its revision.

## Final export (`--final`)

Drafts keep live, editable text. `--final --font-file <ttf|otf> …` converts every `<text>` to `<path>` (`outline.ts`):

- needs an approved type scale; the **first approved family of every slot** must be among the supplied files' family
  names (`name` table), and **every drawn character** must be in a supplied font's `cmap`. Otherwise `invalid_font`
  and nothing is written. Nothing is substituted.
- resvg (local, already used for previews) shapes the text with only the supplied files (`loadSystemFonts: false`). Same
  pack + same font bytes ⇒ same SVG bytes. The result passes `checkSvg` with no live-text warning, both publication
  gates and the normalizer; `<title>`/`<desc>` are kept.
- `manifest.export` records `mode`, `text: outlined`, the outliner version and each font by **file name and sha256**
  (never a path). No font is embedded or committed.

Limits: WOFF/WOFF2 are refused (resvg reads TTF/OTF/TTC). A variable font is drawn at its default instance, and an
approved weight that the file does not contain is not synthesised. The font licence is the owner's
(`brand.type.license`).

## Outputs

- Direction follows the **script of the approved copy**, not the UI locale: Persian copy is laid out right-to-left even
  with `--locale en`. Each RTL string is wrapped in RLE…PDF (display only); Latin labels are never wrapped.
- `posts/post-NN.svg` — the drafts. Same pack ⇒ same bytes (tested across two independent demo builds).
- `posts/post-NN.manifest.json` — `brand-os/runtime-post-manifest/v1`: sha256, size, renderer (`model: null`,
  `network: false`), pack digest, `sources[]` (`source_id` + `source_revision` from the pack), `assets[]` with
  effective `model_use` and `sent_to_model: false`, `checks[]`.
- `batch-summary.json` — `brand-os/runtime-batch/v1`: status `drafted|blocked`, blockers, pack readiness, set checks,
  Coach and Assurance results, `batch_sha256`.
- `previews/*.png` only with `--png` (resvg, system fonts; previews are not hashed and not deliverables).

The writer refuses a non-empty directory, a symlink (also a dangling one), and any path inside a `brand/` folder, also
when a linked parent directory leads into one (checked on the real path before and after the directory is created);
files are created with `wx`. A logo that is not embedded (changed, unpinned, withheld, owner-only, not SVG) is still
listed in every post manifest's `assets[]` with `embedded: false` and its `not_embedded_reason`.

## Production readiness (fixes pack PR-E)

`productionReadiness()` (`runtime/production.ts`, contract `schemas/production-readiness.schema.json`,
`brand-os/production-readiness/v1`) is a **separate view** over a `task_context` pack. It never changes
`TaskContextPack.readiness`, which stays about context only: a pack can be `ready` while production is `not_ready`
(GAP-05), and the projection copies the pack's `readiness` and `staleness` unchanged into `context`.

`production_ready: ready` means one thing: **no deterministic rule blocks**. It is not an approval, not a quality
verdict, carries no score, and `human_review_required` is always `true`. Each check names its rule owner, the input it
looked at (ids and counts only, never brand text), its verdict (`pass`, `warn`, `fail`, `not_tested`,
`needs_human_review`), whether it is a hard rule and whether it blocks. Only a hard rule can block.

| Check | Rule owner | Blocks when |
| --- | --- | --- |
| `context.pack_integrity` | `task-context.pack` (`verifyPack`) | the digest does not verify (wrong SHA) |
| `context.readiness` | `task-context.pack` | the pack is `blocked` (`partial` is a warning) |
| `context.source_drift` | `task-context.pack` (`packSourceDrift`) | with `--root` only: an approved fact the pack cites changed or is no longer approved since the pack was built (`social-batch` then stops with `stale_pack` before writing); absent without `--root` |
| `renderer.available` | `runtime.renderers` (`RENDERERS`) | no verified renderer for the task: only `social_batch` has one; other tasks are briefs |
| `output.format` | `runtime.renderers` | count, `output_format` or channel the renderer does not produce |
| `plan.copy` | `runtime.plan` (`planSocialBatch` blockers) | too few approved messages or no approved palette |
| `copy.claims` | `content-bridge.claims` (`copyClaimConflicts`, the same guard `postChecks` runs) | a banned claim or availability wording in the copy |
| `asset.reference` | `visual-dna.resolver` | never: optional assets do not block; the verdict (changed, withheld, missing, `pack_pin_differs`) is shown |
| `asset.required_logo` | `owner.task_input` | the owner required a logo (`--require logo` / `required_assets: ["logo"]`) and none is approved, SVG and pinned; also when it could not be verified (`not_tested`, blocks) |
| `artifact.pack_pin`, `artifact.file_sha256` | `task-context.pack`, `runtime.manifest` | a post not pinned to this pack, a file whose bytes differ from its manifest or summary, a wrong `batch_sha256` |
| `artifact.svg_safety` | `asset-catalog.publication` | `checkSvg` or `svgPublicationIssues` fail on the actual bytes |
| `artifact.required_logo` | `owner.task_input` | a required logo is not embedded in every post |
| lifted runtime checks | their own layer | `svg.allowlist`, `svg.publication_gate`, `post.format`, `copy.claims`, `pack.digest`, `set.count` fail (`HARD_RUNTIME_CHECKS`); any other runtime `fail` (contrast, duplicates) becomes `needs_human_review` |
| `coach.advice` | `strategic-coach` | never (advice) |
| `review.visual_taste`, `review.semantic` | `human` | never: `needs_human_review` / `not_tested` |

Before a render the artifact checks are one `artifact.checks: not_tested` line, not a pass. Asset verdicts are Visual DNA
metadata; no asset bytes are given to an agent (owner decision 5). Interfaces:

- **MCP** `production_readiness` (pre-render): the same inputs as `task_context` plus `required_assets`, strict schema.
  It builds the pack with `task_context` and the asset verdicts with `visual_dna` under the **same caller context**
  (each writes its own access-log line), and adds one `production_readiness` line (ids only). Access is the
  `task_context` rule: guests, unprofiled agents and other brands are denied first.
- **CLI** `brand:runtime readiness --pack <file> [--root <dir>] [--batch <dir>] [--require logo] [--locale fa|en|tr]
  [--json]`: `--root` checks the pack's assets through Visual DNA as the owner (owner-local, same brand only);
  `--batch` reads a `social-batch` output directory back (no symlinks, runtime file names only, size-capped) and re-hashes
  the files. Exit 0 when ready, 3 when not ready. Labels in en, fa (RTL) and tr.
- **`social-batch`** also writes `production-readiness.json` (artifact stage) next to `batch-summary.json`, which is
  unchanged. `--require logo` marks the logo required for that run. With `--root` it resolves every approved asset of
  the pack through Visual DNA (logos first), the same ids `readiness --root` resolves. `social-batch` writes the drafts
  and then exits **3 when production is `not_ready`** (0 when `ready`; owner decision 3 below), with one en/fa/tr line
  on stderr (`--json` stdout stays one JSON document). Exit 1 is a refused input (`RuntimeError`), 2 a usage error.
- Asset ids the Visual DNA resolver would refuse (a manifest id with a space or a slash) are not sent to it; that
  asset stays `not_tested` and the verdicts of the other assets are kept.

The file checksums detect a changed or swapped file; they are not a signature. Someone who edits a post, its manifest
and the summary together on the owner's own disk is outside this check.

### Owner decisions (PR-E, 2026-11-24)

1. **Low contrast is review only.** `color.contrast` `fail` becomes `needs_human_review`; it never blocks.
2. **Only the logo can be mandatory for now.** `--require` / `required_assets` accept `logo` and nothing else.
3. **A not-ready batch exits non-zero.** `social-batch` still writes every draft and `production-readiness.json`, then
   exits 3 so scripts and CI notice (`tests/production-readiness.test.ts`).
4. **Incomplete brand data is a warning.** A `partial` pack is `warn` on `context.readiness`; only `blocked` blocks.
5. **Duplicate posts are review only.** `set.distinct_files` and `set.distinct_messages` `fail` become
   `needs_human_review`; they are not in `HARD_RUNTIME_CHECKS`.
6. **No digital signing now.** Artifacts carry SHA-256 checksums, which detect a changed file; they are not a signature.
7. **The access-log line stays in `brand/.private`.** `production_readiness` adds one line, ids only, to
   `brand/.private/access-log.jsonl` (gitignored, mode 0600); nothing is logged elsewhere.

## `model_use` on assets

`schemas/asset.schema.json` has an optional `model_use`: `not_allowed` | `local_only` | `external_allowed`.
`effectiveModelUse()` (`@brand-os/asset-catalog`) reads absent or unknown values as `not_allowed`. `brand_retrieve`
asset values and `task_context` asset items now carry the effective value. Recording a value grants nothing: no code
path in this repository sends an asset to a model.

## Usage

```bash
npm run brand:runtime -- social-batch --demo --out ./tmp/runtime-demo --png
npm run brand:runtime -- social-batch --demo --out ./tmp/runtime-en --locale en --json
# a real brand: the content agent saves the pack with its own token (BRAND_OS_AGENT_TOKEN in its environment) …
npm run -s brand:query -- --tool task_context --task-type social_batch --count 10 --locale fa > /tmp/pack.json
# … and the owner renders it, in a shell without an agent token
npm run brand:runtime -- social-batch --pack /tmp/pack.json --out /tmp/posts            # pack only
npm run brand:runtime -- social-batch --pack /tmp/pack.json --root . --out /tmp/posts   # + Coach and logo (owner)
npm run brand:runtime -- readiness --pack /tmp/pack.json --root . --require logo         # production readiness
npm run brand:runtime -- readiness --pack /tmp/pack.json --batch /tmp/posts --locale fa  # re-check a written batch
npm run brand:runtime -- social-batch --pack /tmp/pack.json --root . --final \
  --font-file ~/fonts/Display.ttf --font-file ~/fonts/Body.ttf --out /tmp/final
```

Owner-local: `--demo` and `--root` are refused while `BRAND_OS_AGENT_TOKEN` is set (the demo builds a workspace, the
Coach and the logo read the owner's checkout). A bare `--pack` reads only the file.

## Tests

`tests/runtime-pack.test.ts` (6): pack file happy path and same bytes twice, tampered / wrong task / wrong count /
authorizing / malformed / non-ok / symlinked / oversized files refused, `--root` same brand + owner only + workspace
byte-for-byte unchanged, Coach warnings never block, CLI parity. `tests/runtime-type.test.ts` (7): approved scale
applied and cited, weight tokens, renderer defaults labelled, reduced headline ⇒ warn, sign-off wraps and is reported,
final refused without fonts / scale / family / glyphs, final outlines everything and is deterministic (skipped with a
reason when DejaVu Sans is not installed), CLI flags. `tests/runtime-social-batch.test.ts` (13) and
`tests/asset-model-use.test.ts` (3): schema validity, SVG checker and
publication gate on every post, determinism across builds, source pins, en/fa/tr copy unchanged, `model_use` default,
checksum-changed logo refused and listed with its reason in every manifest, writes only in the output dir (dangling
links and linked parents into `brand/` refused) and `git status brand/` unchanged, tampered pack / wrong
task / wrong count refused, too few messages or no palette ⇒ `blocked` (no padding), banned claim ⇒ `copy.claims: fail`,
Coach and Assurance called (and the Coach still refuses under an agent token), CLI parity with the library.

`tests/production-readiness.test.ts` (12): the demo pack is ready pre-render and its own readiness is copied unchanged;
missing renderer and format violations block while context stays as built; bad SHA (tampered pack, changed logo file,
stale pin); an asset id the resolver refuses stays `not_tested` without voiding the others, and `social-batch --root`
resolves every pack asset; blocked rights and a missing required logo block while the same optional asset does not; a banned claim
blocks; artifact stage (wrong file checksum, unsafe SVG, missing required logo block; contrast `fail` is
`needs_human_review`); a written batch re-checked on disk, symlinks and stray names refused; the agent entry (same
caller, denied before input, invalid input); real stdio MCP (listed, strict schema, tr labels, guests denied); CLI
(`--root`, exit 3, fa output); `social-batch` with a not-ready batch writes all drafts and exits 3 (text and `--json`,
fa line on stderr, en/tr labels), and exits 0 when ready.

## Open questions (owner)

Decided on 2026-11-23: `--pack` for real brands (built), artifact checks stay in the runtime (not moved to Assurance),
the approved type scale on drafts and outlines only in final export (built), the Coach never blocks and taglines and
promises are exempt from `too_brief_for_output` (built), MCP tool in the next slice.

1. Persian copy and an approved Latin-only type scale: `brand.type.rtl` is not in the `social_batch` recipe, so an RTL
   label or message is set in the Latin stack (the system fallback draws it in drafts; final export refuses). Add
   `rtl_rules` to `social_batch` and use it for RTL lines?
2. Variable fonts in final export are drawn at their default instance (often Thin). Accept static TTFs per weight only,
   or add instance selection?
3. A `content-read` pack has no `business.market.geography`, so Assurance reports PRR-02 as missing for this caller.
4. The logo is embedded as approved, whatever the background; a dark logo on a dark post has no contrast check.
   Pick the logo variant per background from `brand.logo.variants`?
