# Editing a brand with Claude Code (outside Studio)

Studio creates brand repositories and shows their merged state. **All editing happens in Claude Code, in the brand's own private repository.** Studio never opens, embeds or calls Claude, and Claude never receives Studio's credentials.

```text
Studio: New Brand → private repo created → Copy repository URL / Copy starter prompt
   │
Owner: authorizes GitHub access for Claude Code (clone or GitHub CLI/connector)
   │
Claude Code (new session, brand repo): read state → interview → edit → validate → branch → PR
   │
Owner: runs approvals locally (own terminal) → reviews and merges the PR on GitHub
   │
Studio: Refresh (or webhook / TTL) → shows the merged commit SHA and the new state
```

## 1. Give Claude Code access to the private repository

A repository URL is a location, not permission. Choose one of these:

- **Local clone (simplest):** `git clone https://github.com/<owner>/<repo>.git` (Studio's handoff page shows this command). Then open that folder in Claude Code.
- **GitHub CLI:** `gh auth login` in the environment where Claude Code runs. Claude Code can then clone and push with your authorization.
- **An owner-approved GitHub connector** in the Claude product you use.

Never paste a GitHub token, Studio's tokens, the brand approval secret or `BRAND_OS_DATA_KEY` into a chat. If Claude Code cannot reach the repository, it should say what access is missing and stop. It must not guess the contents.

## 2. Start the session

Paste Studio's **starter prompt** (Brand → GitHub & Claude Code → Copy starter prompt) into a new Claude Code session. It tells Claude Code to:

1. Inspect the default branch, open PRs and the current commit SHA.
2. Read `AGENTS.md`, `CLAUDE.md`, `README.md` and `brand/brand.config.yaml`, and follow the repository's rules.
3. Summarize the current state and ask what to change, or continue the interview.
4. Edit only this repository, through the core CLI and validation (`npm run brand:*`).
5. Treat inferences as proposals and never invent facts.
6. Never ask for or copy secrets. Explain owner-local commands instead.
7. Validate, show a diff, and commit to a branch or open a PR only when you authorize it.
8. Report the branch or PR, the final SHA, and whether it is merged.

## 3. First-time setup in a new brand repository (owner, own terminal)

A repository created by Studio contains only safe initial files. It has no `.env`, keys, approval secret or agent tokens. In **your own** clone, once:

```bash
npm ci
npm run brand:doctor -- --create-approval-secret   # stored in brand/.private/ (git-ignored); never commit or share it
npm run brand:doctor                               # checks the setup without printing secret values
```

If restricted facts will be used, keep `BRAND_OS_DATA_KEY` in your shell or secret manager. Scripts do not load `.env`, and Claude Code must not be given the key.

## 4. Edit, validate, propose

Claude Code works through the existing flows: `brand:interview`, `brand:next`, `brand:propose`, `brand:document`, `brand:tokens:generate`, and the asset registry and evidence commands. It runs `npm run brand:validate` and `npm run ci` before proposing a commit. Changes go to a dedicated branch and a pull request when you say so.

## 5. Approval and publication stay with you

Approving facts and publishing them are owner actions with a proof that only you hold:

```bash
npm run brand:approve -- --module <id> --dry-run   # see the queue (no proof needed)
npm run brand:approve -- --module <id>             # proof from BRAND_OS_APPROVAL_PROOF, piped stdin or a hidden prompt
npm run brand:publish -- --ids <id,...>            # approved public facts only; approval never publishes
```

Run these in your own terminal, not through Claude Code. `--proof` on the command line is refused, and approve/publish refuse to run while `BRAND_OS_AGENT_TOKEN` is set. Claude Code may tell you which command to run and continue after you have run it. It must not read `brand/.private`, ask for the proof, or work around the gate. **A GitHub PR approval or merge is not a Brand OS fact approval.** Both are needed for approved facts to show as approved in Studio.

## 6. Merge, then refresh Studio

1. Review the PR on GitHub and merge it into the default branch.
2. In Studio, open the brand and press **Refresh**, or wait for the webhook or the 5-minute refresh-on-view.
3. Check the top bar: the short SHA and sync time should match the merge commit. Unmerged PRs appear on History & Review as non-canonical and are never shown as brand truth.

If Refresh reports a failure, Studio keeps showing the last good commit. Common causes: the read token cannot see the repository, the repository was recreated (its GitHub id changed), or `brand.slug` in the repository no longer matches the Studio slug.

## 7. Engine updates

Each brand repository is an independent copy of the template at creation time. To take later template improvements, merge or cherry-pick them in Claude Code, run `npm run brand:migrate`, validate, open a PR and merge. Studio shows the result after refresh.
