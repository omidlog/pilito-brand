# Hosted remote MCP: design note (not built)

Status: **not built.** Owner decision required, then a **new security review** before any code. Fixes pack GAP-11.

Today an agent reaches a brand only through the local stdio server (`npm run -s mcp:serve`) with a token in its own
environment ([AGENT_ONBOARDING.md](AGENT_ONBOARDING.md), [AI_CONNECTORS.md](AI_CONNECTORS.md)). Nothing listens on a
network port, and Brand Studio stays read-only. This note lists what a hosted (remote, HTTP) MCP endpoint would need so
that a chat product without a local checkout could connect. It changes no behaviour.

## Why it is not a small change

The local model relies on facts that stop being true once the server is online:

- **The machine is the boundary.** `brand/.private/` (token hashes, access log, approval secret, encrypted store) sits
  next to the server and is protected by file mode `0600`. A hosted server needs a secret store and an operator who is
  not the owner.
- **Identity is fixed at process start.** The stdio server resolves `BRAND_OS_AGENT_TOKEN` once; revocation applies on
  restart. A long-running hosted server must check revocation per request.
- **One process, one brand, one profile.** A hosted endpoint serves many clients and possibly many brands; cross-brand
  isolation moves from "different folder" to code and storage.

## What a hosted remote MCP would need (minimum)

1. **Transport and auth**: MCP Streamable HTTP over TLS only; OAuth 2.1 with PKCE (the MCP authorization spec), short-lived
   access tokens bound to one brand and one existing profile; no static bearer token in URLs; no new, wider profile.
2. **Owner consent**: issuing, listing and revoking remain owner-only and need the approval proof or an equivalent owner
   login with a second factor; an agent can never grant itself access.
3. **Per-request checks**: revocation, expiry and brand binding checked on every call, not at start; fail closed.
4. **Same retrieval path**: reuse `resolveAgentContext`, `authorize` and the existing tools unchanged; no tool takes a
   role, token or audience argument; restricted values stay `withheld`; `authorizes: []` stays.
5. **Data location**: decide where the checkout lives (owner's host vs. a service), who can read `brand/.private`, and
   how `BRAND_OS_DATA_KEY` is held (KMS or not at all); restricted data should not leave the owner's machine by default.
6. **Network safety**: rate limits, request size limits, CORS and Origin checks, DNS-rebinding protection, no file paths
   in responses to remote clients.
7. **Audit**: the access log kept per request, without values or query text, readable by the owner only.
8. **Studio unchanged**: Studio stays a read-only viewer; a hosted MCP is a separate service, not a Studio write path.
9. **Tests**: guest, wrong brand, revoked, expired, wrong profile, replayed token and forged-argument cases over HTTP,
   plus a fresh-agent test like `tests/fresh-agent-setup.test.ts`.

## Decision needed (owner)

Whether a hosted connection is wanted at all, for which chat product, and whether restricted data may ever be served
remotely. Until then the supported path is the local stdio guide.
