# Strategy records and the Strategy Feed (Spec Sprint 3)

This feature adds one typed strategy record whose revisions the owner approves by hand. Local execution agents (SEO, Ads) can read the approved revision through the existing `brand:query` and stdio MCP gates, and they can only read it.

- **Approving a strategy authorizes nothing.** It does not allow an ad, a spend, a bid, a budget change, a publication, a post or a website change. Every feed response says so in `authorizes: []` and in its permission flags, which are all `false`.
- **Not built:** a CMO agent or Strategy Critic product, campaign-metrics learning, ad execution, other specialists, Studio strategy views, and a remote MCP or API gateway.

## Reuse map

| Existing module | Reused for | New small type | Privacy / access | Tests |
| --- | --- | --- | --- | --- |
| `facts.ts` `readFacts` (approved, `revision_hash`) | `fact_refs`: approved canonical facts pinned to their revision hash. A strategy cannot cite an unapproved fact. | `FactRef` | Ids and hashes only. Values are not copied. | `strategy-store` |
| Knowledge `findNote` and the sha256 revision, `knowledgeRef` | `evidence_refs`: research notes as `knowledge:kn_…@sha256`. The note body is never copied. | `EvidenceRef` | Only internal `research` notes of this brand. Restricted notes are never cited. | `strategy-store`, `strategy-seo-import` |
| `knowledge/workspace.ts` (`withLock`, `writeVaultFile`, `safeRead`, `dirUsable`) | Atomic 0600 writes under `brand/.private/strategy/records/`. Reads do not follow symlinks. | `StrategyRecord` (index), `StrategyRevision` (immutable) | Gitignored. Not in Git, Studio or builds. | `strategy-store` |
| `private-store.ts` approval proof and secret | Owner approval and withdrawal. The approval is sealed with an HMAC keyed by the approval secret. | `StrategyApproval` | Refused under `BRAND_OS_AGENT_TOKEN`. | `strategy-store`, `strategy-cli` |
| `knowledge/safety.ts` | Proposal text is refused if it contains credentials, personal data, or a budget or amount outside the `restricted` block. | none | — | `strategy-store` |
| Sprint 2 `seo/critic.ts`, `SeoStrategy` draft | `propose --from-seo` turns a draft into a proposal after the critic passes again. It keeps the citations and leaves out the quotes. | none | Same brand only. | `strategy-seo-import` |
| `agent-tokens.ts`, `auth.ts`, `access-log.ts` | Two new fixed profiles. The token is resolved once from the server environment, as for every tool. Each call writes one access-log line. | `strategy-seo-read`, `strategy-ads-read` | Read-only, internal audience, no restricted scope. | `strategy-feed` |
| `scripts/mcp.ts`, `brand:query` | The tools `strategy_list` and `strategy_get`. | `StrategyFeedDocument` | Arguments cannot choose a brand, role, profile or state. | `strategy-feed`, `audit` |

This adds no second note store, approval system, token system or MCP server.

## Data model (`packages/brand-core/src/strategy/`)

- **`StrategyRevision`** (`r0001.json`, and so on): written once and never edited.
  - It stores the content the owner reviews: title, type (`seo` or `paid_media`), locale, scope (markets, channel, period) and the dates `valid_from`, `valid_until` and `review_due_at`.
  - It also stores the objective (a hypothesis or a decision); success metrics, where an unknown baseline or target is `null` and never a guess; guardrails, constraints, must do, must not do and non-goals; alternatives with the one chosen, and the selection rationale; and recommendations, each with `agent_kinds` and cited refs.
  - Finally: `fact_refs`, `evidence_refs`, assumptions, open questions, an owner-only `restricted` block (budget and notes), and the origin (`manual` or `seo_draft`).
  - `content_sha256` is the sha256 of the canonical JSON. Recommendations may cite only refs that the strategy itself cites.
- **`StrategyRecord`** (`record.json`): the small mutable index. It lists each revision with its state (`draft`, `approved`, `rejected`, `superseded` or `withdrawn`), its content hash and its approval. At most one revision is approved.
- **Effective status** is computed on every read, in this order:
  1. `integrity_failed`: the bytes, the index hash, or the approval digest or seal do not match.
  2. `not_yet_valid` or `expired`.
  3. `needs_review`: a cited fact or note changed after approval.
  4. `review_due`: still valid, but past the review date.
  5. `current`.

  Only `current` and `review_due` are ever served.

## Owner workflow

```bash
npm run brand:strategy -- propose --id seo-discovery --file proposal.json      # draft r1; agents cannot see it
npm run brand:strategy -- propose --id seo-discovery --from-seo brand/.private/strategy/seo/drafts/<plan>.json --out proposal.json
npm run brand:strategy -- review  --id seo-discovery --revision 1              # diff, sources, blockers, exact approve command
BRAND_OS_APPROVAL_PROOF=… npm run brand:strategy -- approve --id seo-discovery --revision 1 --expect-sha <sha256>
npm run brand:strategy -- propose --id seo-discovery --file proposal-v2.json   # draft r2 (would supersede r1); r1 stays served
npm run brand:strategy -- review  --id seo-discovery --revision 2              # field diff against r1
npm run brand:strategy -- reject  --id seo-discovery --revision 2              # or approve it: r1 becomes superseded
BRAND_OS_APPROVAL_PROOF=… npm run brand:strategy -- withdraw --id seo-discovery --revision 1 --reason "…"
npm run brand:strategy -- list                                                 # stored and effective status of every revision
```

### Rules for approval and withdrawal

- `approve` needs the owner proof. It also needs `--expect-sha` to equal the hash the owner reviewed, which guards against a change between review and approval.
- `approve` is refused when:
  - a cited fact or note changed since the proposal,
  - `valid_until` has passed, or
  - a different revision was approved after this draft was proposed.
- Withdrawal never restores an older revision. Agents get nothing for that strategy until the owner approves a new revision.

## Agent feed

Issue a token with `npm run brand:agent-token -- issue --profile strategy-seo-read --label "seo agent"` (or `strategy-ads-read`), then run `npm run mcp:serve` with `BRAND_OS_AGENT_TOKEN` set. The profile decides which strategy type the agent reads:

| Profile | Strategy type | Recommendations included |
| --- | --- | --- |
| `strategy-seo-read` | `seo` | those whose `agent_kinds` includes `seo` |
| `strategy-ads-read` | `paid_media` | those whose `agent_kinds` includes `ads` |
| `content-read` | `content` | those whose `agent_kinds` includes `content` (Content Bridge Slice C) |

All three profiles read facts as the `marketing` profile does.

The two tools are also available through the CLI:

- `strategy_list`: approved, servable strategies with the `revision`, `content_sha256` and `approval_digest` to pin. Strategies that are not served appear only as counts by status, for example `{ "draft": 1 }`.
- `strategy_get {strategy_id, pin?: {revision?, content_sha256?}}`: one slice as `brand-os/strategy-feed/v1` JSON.
- CLI equivalent: `npm run brand:query -- --tool strategy_get --id <id> [--pin-revision n --pin-sha <sha>]`.

What `strategy_get` returns:

- **Digests:**
  - `content_sha256`: the approved bytes.
  - `approval_digest`: the approval event.
  - `source_sha256`: the cited fact hashes and note refs.
  - `feed_sha256`: this document. `verifyFeedDocument` recomputes it.

  Two reads of the same revision are byte-identical.
- **`redacted`:** `restricted.budget` and `restricted.notes` (never sent), the recommendations meant for the other agent kind, and `alternatives` (shown to the owner only).
- **`missing`:** for example `success_metrics[x].baseline`. An unknown value stays unknown.
- **`stale_pin`:** a pin that does not match the revision served now gets this status with no content. The reply gives the pinned state (`superseded`, `withdrawn`, `expired`, `needs_review`, or `unknown` for a draft or a revision that does not exist) and the current `{revision, content_sha256}` or `null`. An agent should stop, and should not act on the pinned revision.
- **Refusals:**
  - `denied`: guests, other profiles, the owner process context, a token of another brand.
  - `not_found`: another strategy type, a record of another brand, a corrupt or tampered record, no servable revision.
  - `invalid`: malformed arguments.

## Gate (spec §13 Sprint 3) and its tests

| Gate item | Test |
| --- | --- |
| Approved v1 is consumable by a local mock SEO agent and a mock Ads agent | `strategy-feed`, "over stdio MCP and brand:query": mock agents list, pin, read, verify the digest, plan tasks, re-check the pin |
| v2 is proposed but not visible until the owner approves it | `strategy-feed`, "v1 approved is served…": a v2 canary never appears; v1 is served; after approval v2 is served and the v1 pin is `stale_pin` |
| No drafts | the same test (a draft pin is `unknown`), plus list counts only |
| No cross-brand reads | `strategy-feed`: a copied record in another brand, a token of another brand, a forged `brand_id` argument |
| Restricted budget never leaks | budget and notes canaries checked in every response and in the access log |
| Tamper and stale sources | edited bytes, a draft forced to approved, an edited cited note, expiry |
| Owner proof, hash-bound approval, diff | `strategy-store`, `strategy-cli` |

## Content strategies (Content Bridge Slice A)

A third type, `content`, uses this same store and approval flow with one extra typed block, `content_strategy`. Only the `content-read` profile reads it through `strategy_list` and `strategy_get` (the feed document does not include the block; a content agent gets voice, claims and audience per slot from `content_brief`). The owner reads it with `brand:content show`. A content strategy may pin approved SEO or paid-media revisions; if one is replaced, the content strategy turns `needs_review`. See `docs-internal/CONTENT_BRIDGE.md`.

## Limits

- The feed is local stdio and CLI only. A remote gateway needs its own threat model (spec backlog 4).
- Token records are read when the server starts, so revocation takes effect on restart, as for every profile.
- `--from-seo` maps strategist decisions mechanically. The owner should edit the scope, dates and metric before proposing.
- There is no Studio view of strategies yet (backlog 3), and there is no metrics-based revision proposal (backlog 2).
