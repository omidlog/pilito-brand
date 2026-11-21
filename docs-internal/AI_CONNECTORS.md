# AI connectors

Nothing here grants a model access to a private repository.

## Claude Code and Codex

Open the cloned repository in a session that is allowed to read it. Point the agent at `AGENTS.md` and `CLAUDE.md`. Skills are in `agent-skills/`.

## ChatGPT or other hosted chats

They do not see this repo unless you connect an app or paste a file. Pasting restricted drafts publishes them to that product. Do not paste `brand/restricted/`.

## Local tools

`npm run brand:query` and `npm run mcp:serve` read the checkout. They are not a hosted server. `mcp:serve` uses the MCP stdio transport (`@modelcontextprotocol/sdk`).

### Who the server is

The server decides its identity once, at startup, from `BRAND_OS_AGENT_TOKEN` in its own environment:

- **No token:** guest. On a brand with `publish_docs: public`, a guest gets published public facts only. On a private brand every call returns `denied`.
- **A valid token:** the agent profile the owner chose when issuing it. The agent reads approved items in its profile's modules, published or not.
- **An unknown, revoked, or other-brand token:** the server exits with an error. It does not fall back to guest.

No tool takes a token, role, or audience argument. Arguments like `include_unapproved` are ignored.

### Issuing a token (owner only)

Give the approval proof through the environment or the hidden prompt, never as a flag:

```sh
npm run brand:agent-token -- issue --profile internal-read --label "claude-code laptop"
npm run brand:agent-token -- list
npm run brand:agent-token -- revoke --id agt_…
```

The token is printed once. Store it in your agent host's secret settings, for example the `env` block of an MCP server entry:

```json
{ "command": "npm", "args": ["run", "-s", "mcp:serve"], "env": { "BRAND_OS_AGENT_TOKEN": "<paste token>" } }
```

Revoking a token takes effect when the server restarts.

### Profiles

All profiles are read-only and never get restricted values.

| Profile | Reads |
|---|---|
| `internal-read` | approved facts in every module |
| `design` | brand, visual, product UI, and mascot modules |
| `marketing` | brand modules plus company, customer, product, sales, marketing, and growth |
| `finance` | business modules and governance status |

Restricted fields (finance figures, budgets, partner shares, board details) come back as `value: null, withheld: true` for every profile. Agents can never approve, publish, or write.

### Tools

`brand_retrieve` is the unified tool:

- `{ "kind": "facts", "module": "brand-strategy" }`
- `{ "kind": "facts", "ids": ["brand.strategy.purpose"] }`
- `{ "kind": "facts", "query": "tagline" }`
- `{ "kind": "mascot", "filters": { "emotion": "celebrating", "stage": "3", "use_case": "correct-answer", "angle": "front" } }` finds approved mascot artwork. Every given filter must match. `stage` takes a stage id, its order, or its name. Only artwork whose own lifecycle is `approved` or `published`, with an approved, checksummed manifest asset, is returned. When nothing matches, `data.explanation` says what is missing (no state for that emotion, no artwork for that stage, artwork still `reviewed`, asset not readable). Guests get a generic explanation. A disabled mascot module returns `not_applicable`.
- `{ "kind": "tokens" | "mascot_assets" | "mascot_stages" | "component" | "asset" | "social_template" | "status" }`

Every result has `brand_id`, `classification`, `approval_state`, `revision`, `source_path`, and `missing`. Every item has its id, source path, module, approval state, classification, revision, and value, or a withheld or missing marker.

The older named tools (`search_brand_docs`, `get_brand_tokens`, `get_brand_overview`, `get_business_plan`, and the rest) use the same retrieval path and the same identity.

`brand:query` takes the same token from the environment:

```sh
BRAND_OS_AGENT_TOKEN=… npm run brand:query -- --tool brand_retrieve --kind facts --module brand-strategy
BRAND_OS_AGENT_TOKEN=… npm run brand:query -- --tool brand_retrieve --kind mascot --emotion celebrating --stage 3 --use-case correct-answer
```

### Access log

Every call by a token, and every denial, appends one line to `brand/.private/access-log.jsonl`. A line holds the principal, tool, ids, and decision. It never holds values or query text.

Design and limits: `docs-internal/adr/0003-agent-access.md`.

## llms.txt

`llms.txt` and `llms-full.txt` are generated from the public docs copy. They are not an access token and not a substitute for the source files.

## Notion

Use Notion for briefs and tasks if you want. Do not keep a second copy of approved brand rules there. The Git records remain canonical.
