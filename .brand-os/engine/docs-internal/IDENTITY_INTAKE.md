# Identity intake (Identity Slice A)

The new-brand wizard and `brand:init` can record three answers about the brand's visual identity:

| Field | Values | Notes |
| --- | --- | --- |
| `logo_presence` | `absent`, `present`, `in_progress`, `unknown` | `in_progress` does not mean an approved logo exists. |
| `identity_intent` | `create`, `retain`, `evolve`, `rebrand`, `undecided` | Wizard labels: create new / keep / refine / rebrand / undecided. |
| `change_depth` | `logo_evolution`, `visual_refresh`, `strategic_rebrand`, `undecided`, or `null` | Only for `evolve` and `rebrand`; otherwise `null`. |

These answers are **an unapproved owner hint**. They route later work, such as the strategy interview and the logo or rebrand brief (Identity Slices C and D, not built yet; the Slice B competitor index is in `docs-internal/COMPETITIVE.md`). They are not a brand fact, a trademark statement, a publication grant or permission to change `brand.logo.*`, the name, the strategy or an approved asset. The existing logo system and asset manifest stay canonical.

## Where it is stored

It is stored as the optional `onboarding.identity` block of `brand/brand.config.yaml`:

```yaml
onboarding:
  identity:
    schema_version: 1
    source: studio_owner_wizard   # or brand_init
    authority: unapproved_owner_intake
    logo_presence: present
    identity_intent: evolve
    change_depth: visual_refresh
    recorded_at: 2026-11-22T00:00:00.000Z
```

- **Why the config file:**
  - `brand/**` is brand-owned in `.brand-os/sync.json`, so a template update never touches the block.
  - The Studio initializer already commits this file.
  - It sits next to the existing `brand.new_or_existing` hint.
- **No other copies.** It is never written to `approved-facts.yaml`, `draft-facts.yaml`, the answer ledger, the publication policy or the asset manifest.
- **Older brands.** A config without the block reads as `not_recorded`, with `unknown` / `undecided` / `null`. The reader never infers `absent` or `create`.
- **Hand edits.** A hand-edited or contradictory block reads as `invalid` and falls back to the same defaults. `brand:validate` prints a warning.

## Rules (core: `packages/brand-core/src/identity-intake.ts`)

`validateIdentityChoice` refuses contradictions instead of guessing:

| Input | Error |
| --- | --- |
| `absent` + `retain` | `retain_without_logo` |
| `present` + `create` (choose keep, refine or rebrand) | `create_with_logo` |
| `absent` + depth `logo_evolution` | `logo_evolution_without_logo` |
| a depth with `create`, `retain` or `undecided` | `change_depth_not_applicable` |
| a value outside the lists | `*_invalid` |

`evolve` or `rebrand` without a depth reads as `undecided`. Nothing is written when validation fails.

## Entry points

- **Studio wizard (Profile step).** The three questions appear under "Logo and identity", in en, fa and tr, with a note that the market is explored after setup. The step asks nothing about competitors.
  - Without JavaScript every field is visible. With JavaScript the depth group shows only for refine or rebrand, and hiding it clears its answer.
  - The server clears a depth that does not apply, so a stale hidden value never overrides the intent. It refuses the contradictions with a 422 and a field error.
  - The answers appear on the review step and are prefilled by **Edit and retry**. They travel in `ProvisionRequest.identity`, which is optional: older registry records initialize exactly as before and write no block.
- **`brand:init`.** It takes `--logo-presence`, `--identity-intent` and `--change-depth`. Without these flags nothing new is written, so `brand:init` behaves as before. A re-init without them keeps a recorded intake.
- **Existing brands.** They can answer later through the interview (Slice D). The wizard is not the only entry point.

## Who can read it

The block lives in the brand repository's private config file, and only the owner's local tools read that file.

- No MCP or `brand:query` tool returns it.
- `get_brand_status`, the dashboard, the public projection, public docs, Studio brand pages and Studio's sync cache do not contain it.
- Studio's own registry, in the owner-only data directory, keeps the request so that a retry can resume.

`tests/identity-intake.test.ts` and `tests/studio-identity-intake.test.ts` cover this.

## Reuse map

The base is `main` at 51f575b.

| Concern | Existing owner | Slice A |
| --- | --- | --- |
| Brand config and init | `types.ts` `BrandConfig`, `engine.ts` `applyInit`, `scripts/brand.ts init` | One optional `onboarding.identity` block and one optional `InitInput.identity`. No new file and no new store. |
| Approval and publication | `brand:review` / `brand:approve` / `brand:publish`, `publication-policy.yaml` | Untouched. The intake is never a fact or a grant. |
| Studio provisioning | `provision.ts` `validateRequest` / `initializeCheckout`, `registry.ts` `ProvisionRequest` | One optional request field, validated by the core rules. No new route and no new GitHub write. The route list test is unchanged. |
| Localization | `apps/studio/src/i18n/{en,fa,tr}.ts` | New `wizard.identity*`, `wizard.logoPresence*`, `wizard.identityIntent*`, `wizard.changeDepth*` and error keys. The key-parity test passes. |
| Template sync | `.brand-os/sync.json` (`brand/**` is brand-owned) | No migration is needed. A test pins that `brand/brand.config.yaml` is skipped. |
| Knowledge, research, creative, SEO, Strategy Feed | `knowledge/`, `research/`, `creative/`, `seo/`, `strategy/` | Not touched in Slice A. Slices B and C reuse the Knowledge research notes (`knowledge:kn_…@sha256`), the research adapters (`market_observation`) and the Strategy Feed's ref-pinning and `needs_review` patterns. They add no second store. |
