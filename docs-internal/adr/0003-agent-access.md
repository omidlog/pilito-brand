# ADR 0003 — Agent access to private brand knowledge

## Status

Accepted for 0.2.0.

## Problem

Before 0.2.0 the MCP server and `brand:query` always ran as a guest, and the guest gate denied every tool on a brand with `publish_docs: private`. The default brand is private, so an agent the owner trusted could not read the approved facts it was meant to work from.

## Decision

### Owner-issued agent tokens

`npm run brand:agent-token -- issue --profile <profile> --label <name>` creates a token. The owner approval proof is required for `issue`, `list`, and `revoke`. The proof comes from `BRAND_OS_APPROVAL_PROOF`, a hidden prompt, or the first line of piped stdin. It is never accepted on the command line.

- The raw token (`bos_at_` plus 32 random bytes, base64url) is printed once and never stored.
- `brand/.private/agent-tokens.json` (mode 0600, gitignored) keeps the sha256 of each token with its id, label, profile, brand id, creation time, and revoked flag. A fast hash is enough because the token has 256 bits of entropy.
- Lookup hashes the presented token and compares it against every record with `timingSafeEqual`, without stopping early.
- A token is bound to one brand id. A token file copied into another brand does not authorize anything there.

### Identity is fixed at startup

`scripts/mcp.ts` reads `BRAND_OS_AGENT_TOKEN` once, removes it from its own environment, and resolves it to a context. That context is used for every call.

- No token: guest.
- Unknown, malformed, revoked, or cross-brand token, or an unreadable or tampered token file: the server refuses to start. It fails closed and does not fall back to guest.
- No tool accepts a role, token, audience, or scope argument. The MCP schemas strip unknown keys. `brandRetrieve` ignores every request field other than `kind`, `module`, `ids`, and `query`.

`brand:query` uses the same resolution and fails the same way.

Revocation takes effect the next time a server starts. Restart running servers after revoking a token.

### Fixed profiles, all read-only

| Profile | Modules |
|---|---|
| `internal-read` | every module |
| `design` | every non-business module (strategy, verbal, visual, product UI, mascot, governance) |
| `marketing` | non-business modules, plus `business-company`, `-customer`, `-product`, `-sales`, `-marketing`, `-growth` |
| `finance` | `business-*` modules and `governance` |

Every profile has audience `internal` and the single scope `read`.

- `authorize()` denies agents `approve`, `write`, and `export` regardless of scopes.
- Agents only receive items whose status is `approved`, at every audience. Publication is required only for the public audience.
- A profiled agent is denied any resource without a module (fail closed).
- No profile carries the `restricted` scope. Restricted values (finance, legal, partner shares) are returned as `value: null, withheld: true`. This applies to `finance` too, as the owner chose. The approved fact file never holds restricted values anyway; they stay encrypted in `brand/.private/store.json`.
- A fact's classification is the higher of the fact file's value and the owning question's `sensitivity`. A hand-edited fact file cannot downgrade a restricted question.

### One retrieval path

`brandRetrieve(engine, ctx, { kind, module?, ids?, query?, filters? })` in `packages/brand-core/src/query.ts` serves `facts`, `tokens`, `mascot` (the artwork finder; `filters` holds emotion, stage, use_case and angle), `mascot_assets`, `mascot_stages`, `component`, `asset`, `social_template`, and `status`. Each item passes `authorize()` with its own classification, approval state, publication, and module.

The 17 original MCP tools are wrappers over that path and keep their data shapes. MCP also registers `brand_retrieve`.

Every result carries `brand_id`, `principal`, `classification`, `approval_state`, `revision`, `source_path`, and `missing[]`. Every item carries its id, source path, brand id, module, classification, approval state, publication, revision, version, and value. Withheld items have no value.

What each reader learns:

- A guest learns nothing about facts it cannot read. Denied ids are reported as missing.
- An authenticated agent that asks by id or by module is told an approved fact is withheld, with the reason (`missing restricted scope`, `profile design does not cover module business-company`).

### Access log

`brand/.private/access-log.jsonl` (append-only, mode 0600) gets one line per call by a non-guest principal, and one per denial. A line records the time, principal, role, profile, brand id, tool, kind, requested, returned, and withheld ids, the decision, and the reason.

- It never records values.
- A free-text query is stored only as a 16-character sha256 prefix.
- If the line cannot be written, a privileged read is refused.

### Public builds

`scripts/scan-public.ts` fails a build that contains:

- a file named `agent-tokens.json`, `access-log.jsonl`, `approval-secret`, or `store.json`
- the token-file format marker
- anything shaped like a raw token

## Rejected

- **An eight-principal identity platform.** It is too much for a single-owner local tool. The four profiles cover the read cases in the brief. Human editor, reviewer, and owner roles are still the proof-gated CLI paths.
- **Tokens as tool arguments.** They would let a client switch identity per call and would end up in client transcripts.
- **Restricted reads over MCP.** These need per-person identity and a decision about which values may leave the machine. Deferred.

## Outstanding (needs external setup)

- **Hosted or remote MCP with SSO.** The seam is `resolveAgentContext(root, brandId, credential)`: a hosted adapter verifies its own credential (OIDC, mTLS) and returns an `AuthContext` with one of the same profiles. Nothing here implements that adapter.
- **Per-person approval identity.** Approval still uses one shared owner proof (audit finding G9).
- **Shell access.** A shell-capable agent on the owner's machine can read `brand/.private`. Tokens limit what MCP and `brand:query` return. They do not sandbox a process that runs as the owner.
