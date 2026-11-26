# AI connectors

Nothing here grants a model access to a private repository.

Step-by-step owner guide (en, fa, tr) for connecting one agent: [AGENT_ONBOARDING.md](AGENT_ONBOARDING.md).

## Claude Code and Codex

Open the cloned repository in a session that is allowed to read it. Point the agent at `AGENTS.md` and `CLAUDE.md`. Skills are in `agent-skills/`.

## ChatGPT or other hosted chats

They do not see this repo unless you connect an app or paste a file. Pasting restricted drafts publishes them to that product. Do not paste `brand/restricted/`. For a safe export, use the pack below.

## Chat products without MCP (ChatGPT, Grok, Claude Projects)

A hosted chat product cannot start the local MCP server. The owner exports a small, read-only pack instead and uploads
it as project knowledge:

```sh
npm run brand:pack -- --profile content-read            # or marketing, design, internal-read
npm run brand:pack -- --profile content-read --lang fa --out ~/Desktop/brand-pack --json
```

- It writes `00-README.md`, `01-instructions.md` (paste it into the project instructions), `02-brand.md` (approved
  facts by section: identity, voice, audience, positioning, offers, with fact ids), `03-content-strategy.md`,
  `04-calendar.md` (approved current weeks and one brief per slot) `05-creative-preferences.md` and `06-social-style-kit.md` (approved styles only). Strategy,
  calendar and preferences are filled for `content-read` only; other profiles get facts.
- It is built from the readers a token of that profile uses (`brand_retrieve`, the served content strategy view,
  `content_calendar`, pinned `content_brief`), with an in-process context of that profile logged as
  `owner-export:pack`. Drafts, restricted values and Knowledge note text are excluded by construction, and a final scan
  refuses to write if a restricted fact id or value, the approval secret (or a string of its shape) or an agent token
  appears.
- Default `--out` is `brand/.private/exports/pack-<profile>-<date>/` (git-ignored). An `--out` inside the repository
  that git does not ignore is refused. Files are `0600`. Refused while `BRAND_OS_AGENT_TOKEN` is set.
- **Uploading shares it.** The product and everyone with access to that project get a copy. The pack is a snapshot:
  export again after every approval and replace the files. It authorizes nothing.
- `01-instructions.md` tells the assistant to use only these facts, cite fact ids, never invent claims, prices or
  metrics, respect banned claims and voice don'ts, use fixed structures for a reel script, carousel, post, story and
  LinkedIn post, never claim permission to publish, and end each deliverable with a feedback block the owner can paste
  into `npm run brand:content -- feedback`.

## Claude Desktop / Cowork via local MCP

Claude Desktop (and Cowork) can start the local stdio server, so it reads live, approved context instead of a pack.
Issue a token (below), then add a server entry to the app's MCP configuration (`claude_desktop_config.json`). In a
data-only brand repository the engine is committed at `.brand-os/engine/brand-os.mjs`; its MCP command is `mcp`:

```json
{
  "mcpServers": {
    "brand-os": {
      "command": "node",
      "args": ["/path/to/brand/.brand-os/engine/brand-os.mjs", "mcp"],
      "cwd": "/path/to/brand",
      "env": { "BRAND_OS_AGENT_TOKEN": "<paste token>" }
    }
  }
}
```

The server serves the brand in its working directory. If the app does not honour `cwd`, use
`"command": "sh", "args": ["-c", "cd /path/to/brand && exec node .brand-os/engine/brand-os.mjs mcp"]`. In this template
monorepo the same server is `npm run -s mcp:serve`:
`{ "command": "npm", "args": ["--prefix", "/path/to/brand-os-template", "run", "-s", "mcp:serve"], "env": { "BRAND_OS_AGENT_TOKEN": "<paste token>" } }`.
Keep the token in this config only, never in a prompt or a committed file.

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
| `knowledge-read` | approved facts in every module, plus the read-only `knowledge_*` tools over shared notes (`brand/knowledge/shared`), labelled unapproved ideas. Never local or restricted notes. Issue with `brand:agent-token issue --profile knowledge-read`. |
| `creative-read` | approved facts as `design`, plus the read-only `creative_context` tool: owner-approved scoped creative preferences and the owner's cited reasons for selected, rejected and partly kept variants (`docs-internal/CREATIVE_LEARNING.md`). Drafts and superseded preferences are only counted. Verbatim feedback is quoted only from shared notes; local note text is withheld. Issue with `brand:agent-token issue --profile creative-read`. |
| `strategy-seo-read` / `strategy-ads-read` | approved facts as `marketing`, plus the read-only `strategy_list` and `strategy_get` tools: the owner-approved, currently valid revision of SEO (or paid-media) strategies, with content, approval and source digests. Drafts are only counted; the restricted budget and notes are withheld; a stale pin is refused. Reading grants no permission to run ads, spend or publish (`docs-internal/STRATEGY_FEED.md`). |
| `content-read` | approved facts as `marketing`, plus approved `content` strategies through `strategy_list` / `strategy_get`, and the `content_calendar` and `content_brief` tools: owner-approved calendar weeks that are current now and one brief per slot (voice, claims, audience, resolved message, channel plan, cited competitive angle, owner-approved creative preference statements with their scope, and `learnings`: ids and owner-reported metrics of recent slots of the same channel and format). Never Knowledge note text and never draft preferences. Drafts and weeks that need review are only counted; restricted facts are withheld; a stale pin is refused. Its one write is `content_report`: a produced / published observation with an https URL, which changes no week, strategy or fact and grants no permission to publish (`docs-internal/CONTENT_BRIDGE.md`; connecting a bot: `docs-internal/CONTENT_AGENT_INTEGRATION.md`). |

**Widening of `content-read` (content feedback loop):** a brief now carries the owner-approved statement (at most 200
characters) and scope of each applicable creative preference, not only its id, and owner-reported metrics (numbers,
labelled `owner_reported` / `not_verified`) in `learnings` and in calendar `reports[]`. It still never carries note
text, drafts, superseded preferences or the reasons behind a preference; those stay with `creative_context`
(`creative-read`).

Restricted fields (finance figures, budgets, partner shares, board details) come back as `value: null, withheld: true` for every profile. Agents can never approve or publish. The only write any agent has is a `content-read` report, stored as an observation.

### Tools

`brand_retrieve` is the unified tool:

- `{ "kind": "facts", "module": "brand-strategy" }`
- `{ "kind": "facts", "ids": ["brand.strategy.purpose"] }`
- `{ "kind": "facts", "query": "tagline" }`
- `{ "kind": "mascot", "filters": { "emotion": "celebrating", "stage": "3", "use_case": "correct-answer", "angle": "front" } }` finds approved mascot artwork. Every given filter must match. `stage` takes a stage id, its order, or its name. Only artwork whose own lifecycle is `approved` or `published`, with an approved, checksummed manifest asset, is returned. When nothing matches, `data.explanation` says what is missing (no state for that emotion, no artwork for that stage, artwork still `reviewed`, asset not readable). Guests get a generic explanation. A disabled mascot module returns `not_applicable`.
- `{ "kind": "tokens" | "mascot_assets" | "mascot_stages" | "component" | "asset" | "social_template" | "status" }`

Every result has `brand_id`, `classification`, `approval_state`, `revision`, `source_path`, and `missing`. Every item has its id, source path, module, approval state, classification, revision, and value, or a withheld or missing marker.

`task_context` returns one read-only pack of approved context for one task (`task_type` or the owner's `request`); see the next section and `docs-internal/TASK_CONTEXT.md`.

`visual_dna` checks visual references before they are used: asset ids, a mascot request (emotion, stage, use case, angle) and, for a `creative-read` token, creative-memory variants. Each comes back `approved`, `withheld`, `missing` or `changed`, with checksum, usage rights and the effective `model_use`. Metadata only, never file bytes; a missing pose stays missing. See `docs-internal/VISUAL_DNA.md`.

`production_readiness` answers whether production can start for a task, separately from the pack's context `readiness`: the same inputs as `task_context` plus `required_assets` (`logo`). Each check names its rule owner, input, verdict and whether it blocks; only objective rules block (pack digest, no renderer or unsupported format, missing approved copy, a banned claim, a required logo that is missing, changed or withheld). `ready` is not approval; taste stays `needs_human_review`. Metadata only. See `docs-internal/BRAND_RUNTIME.md` § Production readiness.

The older named tools (`search_brand_docs`, `get_brand_tokens`, `get_brand_overview`, `get_business_plan`, and the rest) use the same retrieval path and the same identity.

`brand:query` takes the same token from the environment:

```sh
BRAND_OS_AGENT_TOKEN=… npm run brand:query -- --tool brand_retrieve --kind facts --module brand-strategy
BRAND_OS_AGENT_TOKEN=… npm run brand:query -- --tool brand_retrieve --kind mascot --emotion celebrating --stage 3 --use-case correct-answer
```

### Task context in a new Claude Code session

One call gives a new session the approved context for one task, so the owner does not explain the brand again.

1. The owner issues a token for the profile the work needs (`design` for visuals and UI, `content-read` for posts,
   `strategy-ads-read` for an ad brief), in a trusted local shell:
   `npm run brand:agent-token -- issue --profile design --label "claude-code design"`.
2. The owner registers the local server in Claude Code with the token in the server's environment, not in the prompt
   or a committed file. For example in the user-scoped Claude Code MCP settings, or with
   `claude mcp add brand-os --env BRAND_OS_AGENT_TOKEN=<paste token> -- npm run -s mcp:serve`, run from the brand
   repository. Do not put the token in a checked-in `.mcp.json`.
3. In the new session, open the brand repository and ask for the work ("Make ten Instagram posts for this brand").
   The agent follows `AGENTS.md` and `agent-skills/task-context/SKILL.md`: it calls `task_context` once, works from
   the pack, cites `source_id` / `source_revision`, and asks the owner only for the question ids in `missing[]`.

Without a token the tool answers `denied`; the agent should ask for one, never search for it. The server is local
stdio; there is no hosted API and no new profile. One token is one profile: issue a second token for a second agent
rather than widening one. Reading a pack authorizes no publishing, scheduling, spending or deploying.

### Access log

Every call by a token, and every denial, appends one line to `brand/.private/access-log.jsonl`. A line holds the principal, tool, ids, and decision. It never holds values or query text.

Design and limits: `docs-internal/adr/0003-agent-access.md`.

## llms.txt

`llms.txt` and `llms-full.txt` are generated from the public docs copy. They are not an access token and not a substitute for the source files.

## Notion

Use Notion for briefs and tasks if you want. Do not keep a second copy of approved brand rules there. The Git records remain canonical.
