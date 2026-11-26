# Connect an AI agent to your brand (owner guide)

Other languages: [فارسی](AGENT_ONBOARDING.fa.md) · [Türkçe](AGENT_ONBOARDING.tr.md)

This guide is for the brand owner. You do not need to know how to program. You copy each command into a terminal, in
order. At the end, an AI agent (for example Claude Code) can **read** your approved brand facts, and nothing more.
You can switch it off at any time.

The Brand OS commands below are tested automatically (`tests/fresh-agent-setup.test.ts`); the `claude mcp` and `read -rs`
steps are Claude Code and shell commands and are not run by the test. The technical reference is
[AI_CONNECTORS.md](AI_CONNECTORS.md).

## What you get, and what you do not

- The agent reads only **approved** facts, and only the part of the brand its "profile" allows.
- The agent **cannot** approve, publish, change facts, create keys, or see restricted values (money, budgets, private notes).
- Everything runs on your own computer. There is no website login and no cloud server. Brand Studio stays a read-only
  viewer; it cannot create keys or connect agents.
- A hosted (online) connection is not built. See [AGENT_ONBOARDING_HOSTED.md](AGENT_ONBOARDING_HOSTED.md).

## Words used here

- **Terminal**: the window where you type commands (macOS: Terminal; Linux: Terminal; Windows: WSL or Git Bash).
- **Brand folder**: the folder of your brand repository on your computer.
- **Approval secret**: a private password file at `brand/.private/approval-secret`. It proves that *you*, the owner, are acting. Never share it.
- **Agent token**: a key for one agent. It starts with `bos_at_`. It is shown once. Treat it like a password.
- **Profile**: what the token may read, for example `design` (brand look and voice) or `content-read` (posts and content plans).

## Before you start (once)

1. Node.js 22 or newer and Claude Code are installed.
2. Open a terminal **in your brand folder** and install the tools:

   ```sh
   npm install
   ```

## Step 1. Create your approval secret (once)

```sh
npm run -s brand:doctor -- --create-approval-secret
```

You should see `Approval secret is at brand/.private/approval-secret`. The secret itself is never printed. If the file
already exists, it is kept. The doctor may list other things to fix; for this guide only the approval secret matters.

## Step 2. Create a token for one agent

Choose the smallest profile that fits the job. Most visual work uses `design`; posts use `content-read`.

```sh
npm run -s brand:agent-token -- issue --profile design --label "claude-code design" < brand/.private/approval-secret
```

The `< brand/.private/approval-secret` part hands your secret to the command without you typing it or showing it.
The last line printed is the token (`bos_at_…`). Copy it now: it is shown only once. Do not paste it into a chat,
an email, a prompt, or any file in the repository.

## Step 3. Connect the agent (Claude Code)

Run these three lines in the brand folder. The first line waits for you to paste the token; nothing appears while
you paste. Press Enter.

```sh
read -rs BOS_TOKEN
claude mcp add brand-os --scope local -e BRAND_OS_AGENT_TOKEN="$BOS_TOKEN" -- npm run -s mcp:serve
unset BOS_TOKEN
```

This saves the token in Claude Code's own settings for this folder only (`--scope local`). It is not written into the
repository. Never put the token in a checked-in `.mcp.json`.

## Step 4. Check that it works

Quick check in the terminal (optional), again pasting the token when asked:

```sh
read -rs BOS_TOKEN
BRAND_OS_AGENT_TOKEN="$BOS_TOKEN" npm run -s brand:query -- --tool get_brand_status
unset BOS_TOKEN
```

You should see `"status": "approved"`. Then check in Claude Code:

1. Run `claude mcp list`. `brand-os` should be listed as connected.
2. Start Claude Code in the brand folder and ask: *"Use the brand-os tool get_brand_status and tell me the result."*
3. Ask for real work, for example *"Make ten Instagram posts for this brand."* The agent should call `task_context`
   once and ask you only about missing facts.

If the agent says `denied`, it was started without the token: repeat Step 3 and restart Claude Code.

## Step 5. What the agent is not allowed to do (and how to see it)

- It cannot approve or publish: `brand:approve` and `brand:publish` refuse to run while an agent token is set.
- It cannot create, list or revoke tokens: those commands need your approval secret.
- It cannot read outside its profile; restricted values come back as `withheld`.

One honest limit: an agent that may run any shell command on your computer could open `brand/.private/` itself.
Do not allow the agent to read that folder or run `brand:agent-token`, `brand:approve` or `brand:publish`. When Claude
Code asks for permission to do that, say no.

## Step 6. Switch the agent off (revoke)

See your tokens:

```sh
npm run -s brand:agent-token -- list < brand/.private/approval-secret
```

Revoke one by its id (it starts with `agt_`):

```sh
npm run -s brand:agent-token -- revoke --id agt_… < brand/.private/approval-secret
claude mcp remove brand-os --scope local
```

Then close and restart Claude Code. A revoked token stops working the next time the server starts; it never falls
back to a weaker guest mode, it simply refuses to start.

If a token may have leaked (you pasted it somewhere), revoke it right away and issue a new one.

## Other apps: Claude Desktop, Cowork, ChatGPT, Grok, Claude Projects

- **Claude Desktop or Cowork** can start the same local server. Add a `brand-os` entry with the token in its `env`
  (example in [AI_CONNECTORS.md](AI_CONNECTORS.md#claude-desktop--cowork-via-local-mcp)): in a brand repository
  `node /path/to/brand/.brand-os/engine/brand-os.mjs mcp`, in the template `npm run -s mcp:serve`.
- **ChatGPT, Grok or Claude.ai Projects** cannot start it. Export a read-only pack and upload its files as project
  knowledge: `npm run brand:pack -- --profile content-read`. It holds approved context only, uploading shares it with
  that product, and it goes stale: export again after you approve anything.

## Good habits

- One token per agent and per job. A second agent gets a second token; do not widen one.
- Pick the smallest profile. The full profile list is in [AI_CONNECTORS.md](AI_CONNECTORS.md#profiles).
- Revoke tokens you no longer use (`list` shows `active` or `revoked`).
- Every agent read is logged in `brand/.private/access-log.jsonl`, without the values.

## When something goes wrong

| You see | What it means | What to do |
|---|---|---|
| `Approval proof rejected` | The secret did not match, or you are in the wrong folder. | Open the terminal in the brand folder and repeat the command. |
| `… was revoked. Refusing to start.` or `… does not match an issued token` | The token was revoked or mistyped. | Issue a new token (Step 2) and connect again (Step 3). |
| `denied` in every answer | The server started without a token. | Repeat Step 3, then restart Claude Code. |
| `refuses to run while BRAND_OS_AGENT_TOKEN is set` | You ran an owner command in a shell that holds an agent token. | Open a new terminal and run it again. |
| `has more than one hard link` or `appears to be synced by Google Drive` | The brand folder is inside a cloud-synced folder, which uploads your approval secret. | Move the folder (for example to `~/Code`), run `npm run brand:doctor -- --fix-links`, then `npm run brand:doctor -- --rotate-approval-secret`. |

Many things to approve? `npm run brand:pending` lists them in plain words and prints the one command that approves them
all with one proof. An agent never runs it for you.
