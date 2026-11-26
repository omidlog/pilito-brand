# Visual DNA reference resolver

Read this before touching `packages/brand-core/src/visual-dna`, the `visual_dna` MCP tool or `brand:visual-dna`.

Visual DNA answers one question for an agent or the owner: **may this visual reference be used, and on what terms?**
It is fixes pack PR-C (GAP-03). It is a read-only projection, not a store. There is no `brand/visual-dna/` folder and
no second visual memory: every call re-reads the existing owners of visual truth under the caller's own context.

| Source | Owner | How Visual DNA reads it |
| --- | --- | --- |
| Logos, icons, photos, mascot files | `brand/assets/asset-manifest.yaml` | `brand_retrieve kind: asset` (approval, audience, profile module, publication, safe path, no symlink, checksum, both SVG gates) |
| Mascot artwork by emotion, stage, use case, angle | `brand/mascot/catalog.yaml` | `brand_retrieve kind: mascot` (approved art only, with its explanation when nothing matches) |
| Selected, rejected and partly kept variants | Creative Learning | `creative_context` (creative-read only; drafts withheld; note text stays there) |
| Model and provider rights | `model_use` on the manifest record | `effectiveModelUse` (absent or unknown = `not_allowed`) |

## What it returns

`schemas/visual-dna.schema.json` (`brand-os/visual-dna/v1`). One entry per requested reference:

| `state` | Meaning | `reason` |
| --- | --- | --- |
| `approved` | Readable here, file verified now. Carries path, media type, size, checksum, licence and `license_basis`, usage, restrictions, rights subject, `model_use` and `provider_gate`. `delivery: metadata_only`. | — |
| `withheld` | Approved, but not usable by this caller or not safe to use. | `not_authorized`, `rights`, `license_missing`, `unsafe_file`, `too_large` |
| `missing` | Not there for this caller. Nothing is substituted. | `not_found`, `not_approved`*, `not_present`*, `no_artwork`, `creative_asset_missing` |
| `changed` | The bytes are not the approved bytes. | `checksum_mismatch`, `approved_bytes_differ`, `creative_record_changed` |

\* Only the owner process sees `not_approved` and `not_present`. An agent gets `not_found` for a draft and for an
unknown id alike, so it never learns that a draft exists (the same rule `brand_retrieve` applies to facts).

Manifest status `approved` and `published` both count as approved (`published` is approved and released). Every
other status (`draft`, `review`, `retired`, ...) is `missing`. A `published` asset goes through every check below.

Checks added on top of `brand_retrieve`, never fewer:

- `approved_sha256` must equal the manifest checksum: an approval for other bytes is `changed`.
- The file must be at most 20 MiB (`too_large`).
- A rights-sensitive subject (portrait, person, case study, client logo, testimonial) needs a granted, current rights
  record that covers the requested `use_scope` (`rightsBlocker`), or it is `withheld / rights`. See below.
- A licence must be recorded; empty, `TBD`, `todo`, `unknown`, `none` or `n/a` is `withheld / license_missing`,
  except for the brand's own mark (see below).
- A creative variant whose asset changed after it was recorded is `changed`, never silently re-pointed.
- The manifest `preview` field is never read or returned. Only the asset's own verified path is.

### Owner policy (2026-11-23)

**The brand's own marks need no licence record.** An asset is the brand's own mark when its id is `asset.logo.*`,
`asset.wordmark.*`, `asset.logomark.*` or `asset.brand-mark.*`, or it is tagged `logo`, `wordmark`, `logomark`,
`brand-mark` or `brandmark`. With an empty or placeholder licence it is still `approved`, with
`rights.license_basis: own_brand_mark` and `rights.license` exactly as recorded (null or `TBD`, never invented). It is
**not** an own mark, and still needs a recorded licence, when it has a rights-sensitive subject (`client_logo`, for
example) or a `third-party`, `partner`, `client-logo`, `stock` or `licensed` tag. Tag a partner's or supplier's logo
accordingly. Icons, photos, illustrations and mascot art are not marks and always need a recorded licence. A recorded
licence gives `license_basis: recorded`. The exemption skips only the licence check: approval, bytes, size, safe path
and SVG checks all still apply.

**`use_scope`: where the reference will be used.** `public` (the default) or `internal`, on the MCP input, the CLI
(`--use-scope`) and owner `read`. Rights with `scope: internal` (and an internal-scope evidence permission) cover a
portrait or other rights-sensitive subject for `internal` use. `public` use still needs `scope: public`; without it the
reference is `withheld / rights`. Public-scope rights cover both. The result echoes `use_scope`; a verdict holds only
for the scope it was asked for, and an `internal` verdict is not permission to publish. A public-audience context is
always checked for `public`. Publication gates (`brand_retrieve` publication flag, the docs build, Studio) still ask
for public use and are unchanged.

A mascot request that matches no approved artwork (wrong angle, wrong stage, no art yet) returns one
`mascot:request` reference with `missing / no_artwork` and the finder's own explanation. The front view is never
offered for a back-view request.

Every result has `authorizes: []`, all permission flags false (`publish`, `schedule`, `spend`, `deploy`, `approve`,
`upload`), `sent_to_model: false` on every reference, and a `digest` over the references to pin what was used.

## `model_use` is a rights signal, not permission

`provider_gate` says what the recorded value forbids:

| `model_use` | `local_model` | `external_provider` |
| --- | --- | --- |
| absent / `not_allowed` | `blocked` | `blocked` |
| `local_only` | `not_blocked_by_record` | `blocked` |
| `external_allowed` | `not_blocked_by_record` | `not_blocked_by_record` |

`not_blocked_by_record` is not a licence to upload. Consent, copyright, the provider's terms and an explicit
owner-directed export still decide. No code path here sends a file to any model or provider. Note that a hosted
assistant (including a cloud Claude session) is an external provider.

## Who can call it

| Caller | `visual_dna` | Creative references | Bytes |
| --- | --- | --- | --- |
| Guest, unprofiled agent, other brand | `denied` | — | never |
| Any owner-issued agent token of this brand | yes; the profile's module rules apply per asset (`finance` reads no assets; restricted assets are withheld from every agent) | `creative-read` only; others get `creative.status: not_authorized` | never |
| Owner process (`brand:visual-dna` without a token) | yes, with finer reasons | `not_authorized` (creative memory is read with `brand:creative`) | `read`, one asset at a time |

One caller is one context: the creative part is read with the same token, never with a second one. One
`visual_dna` access-log line per call (ids only), plus the lines of `brand_retrieve` and `creative_context`, which
log themselves. A privileged read is not served when its log line cannot be written.

## Commands

MCP (stdio, metadata only; the input schema is strict, so a forged `role`, `brand_id` or `include_bytes` is an error):

```json
{ "asset_ids": ["asset.logo.primary"], "mascot": { "emotion": "celebrating", "angle": "front" }, "locale": "fa" }
{ "asset_ids": ["asset.photo.founder"], "use_scope": "internal" }
{ "creative": { "project_id": "launch-posts-1" } }
```

CLI:

```sh
npm run brand:visual-dna -- resolve --ids asset.logo.primary --emotion celebrating --angle front [--use-scope internal] [--lang fa] [--json]
npm run brand:visual-dna -- read asset.logo.primary --for renderer [--use-scope internal] [--stdout | --json]
```

`resolve` runs as the agent token in the environment, exactly as the MCP server would, or as the owner without one.

`read` is owner-only and refused while `BRAND_OS_AGENT_TOKEN` is set. It resolves the asset exactly as above (it
must be `approved`), checks the stated use against `model_use` (`renderer` is not a model; `local_model` needs
`local_only` or `external_allowed`; `external_provider` needs `external_allowed`), opens the file without following
symlinks, checks its size, reads it once, and hashes and SVG-checks those same bytes before returning them. It prints
the verdict, or with `--stdout` the verified bytes (the verdict goes to stderr). It writes no file and mints no URL.
`upload_authorized` is always false.

## For agents

Call `task_context` first (it lists approved asset ids by role), then `visual_dna` with the ids and the mascot pose
you need. Use only `approved` references. Name every `missing`, `withheld` and `changed` reference to the owner and
stop there for that reference: do not draw, generate, trace or borrow a replacement, and do not describe an unseen
asset as if you had seen it.

## Not in this slice

- No byte transport over MCP and no export directory. A network-safe delivery contract needs its own security review.
- No production-readiness verdict (PR-E). Visual DNA does not render anything, and `brand:runtime` (including `--pack`)
  still reads its logo through its own `loadApprovedLogo` gate; using Visual DNA there is later work.
- Canonical mascot view sets (front / three-quarter / profile as one approved set) are not modelled; each angle is
  its own catalog artwork, and the owner registers and approves it.
- Fonts are out of scope; Visual DNA covers files in the asset manifest.
- The 20 MiB limit is unchanged (owner decision 2026-11-23).
- `published` counts as approved in `brand_retrieve kind: asset` and Visual DNA. The docs-build publication check
  (`assetIsPublic`) and the mascot catalog validator still require manifest status `approved`; aligning them is
  separate work.
