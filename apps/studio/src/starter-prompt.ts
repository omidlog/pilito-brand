/**
 * The Claude Code starter prompt that Studio offers to copy. Studio never calls Claude, never opens a
 * session and never tracks one: this is clipboard text for the owner to paste into their own Claude
 * Code session, which needs its own authorized access to the private repository.
 *
 * Source: the owner's "new session starter" brief. Kept in English (the base language) because it is
 * an instruction to an agent; the surrounding Studio UI is localized.
 */
export function starterPrompt(input: { slug: string; repoUrl: string }): string {
  return `I want to work on my existing Brand OS brand: ${input.slug}.
Its private GitHub repository is: ${input.repoUrl}

If you cannot access this private repository, tell me what GitHub authorization or local clone is needed. A link alone is not permission. Do not guess its contents or fabricate data.

Once you have access:
1. Inspect the current default branch, open PRs and commit SHA.
2. Read AGENTS.md, CLAUDE.md, README.md, brand/brand.config.yaml and relevant Brand OS schemas/docs. Follow the repository's existing setup and governance rules.
3. Explain the current state briefly, then ask me what I want to change or continue our brand interview here in Claude Code.
4. Make brand edits only in this repository through the existing core and validation flows; do not touch other brands.
5. Treat AI inferences as proposals. Never invent company, personal, financial or design facts. Keep approval/publication separate from editing.
6. Never request or copy my approval secret, raw GitHub token, BRAND_OS_DATA_KEY or other credentials into chat. If human authorization is needed, explain the safe owner-local CLI action instead; do not bypass it.
7. Validate changes, show a concise diff, commit to a dedicated branch and open a PR/push only when I authorize that action.
8. Tell me the branch/PR, final commit SHA, and whether the update has actually been merged. Studio displays the merged default branch; it will not treat an unmerged PR as canonical.

My next request is: <DESCRIBE_THE_BRAND_CHANGE_HERE>
`
}

export function cloneCommand(repoUrl: string): string {
  return `git clone ${repoUrl}.git`
}
