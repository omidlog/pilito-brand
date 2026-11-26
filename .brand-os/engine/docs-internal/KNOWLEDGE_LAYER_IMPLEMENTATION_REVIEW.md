# Knowledge Inbox — implementation review

Spec: `knowledge-inbox-spec.md` (Baalda-inspired Knowledge Inbox, Milestones A–C), approved in full by the owner.
Earlier review (`knowledge-opinion.md`): its findings were applied as fixes (see §5). This is original Brand OS code. No
Baalda code, UI or assets were copied, and there is no Baalda dependency.

## 1. Baseline, branch, PR

| Item | Value |
| --- | --- |
| Baseline | `main` at `fa476ce` (Merge pull request #7) |
| Branch | `feat/knowledge-inbox` |
| PR | #9 "feat: knowledge inbox (Baalda-inspired)", draft, to `main`. Not merged, not deployed. |
| Parallel work | `feat/template-sync` (PR #8). `engine.ts` and `scripts/brand.ts` are untouched here. The overlap is one export line in `packages/brand-core/src/index.ts`, `package.json` (one script), `CHANGELOG.md` and docs. |

Commits on top of `fa476ce`:

| Commit | Chunk |
| --- | --- |
| `8aadaff` | A0 Studio archive filter: `brand/knowledge/**` blocked except `brand/knowledge/shared/*.md`, checked first |
| `705591a` | A1 note model, private-by-default store, revision-checked edits, encrypted restricted notes |
| `5461dd4` | A2 search, links, isolation, share gates, docs exclusion (tests) |
| `192d309` | A3 `brand:knowledge` CLI, owner-gated restricted notes, guide (Milestone A push) |
| `0941762` | B1 note → draft proposal bridge, provenance, stale detection |
| `d4a96cf` | B2 `knowledge-read` profile, read-only MCP tools, Claude Code skill (Milestone B push) |
| `87e6c76` | C1 Studio Knowledge page (read only) |
| `e07ae91` | C2 browser checks for the Knowledge page |
| `7fb1b01` | C3 docs, performance baseline |
| (next commit) | Fix: restore generated docs artefacts that `87e6c76` swept in; this review |

CI: GitHub Actions minutes were nearly exhausted, so every push carries `[skip ci]` and there is **no CI URL**. All
results below come from local runs.

## 2. Implemented / partial / deferred

| Spec item | State | Notes |
| --- | --- | --- |
| A1 note model, capture/list/show/edit/archive/restore | Implemented | `kn_<uuid>` ids, `revision = sha256(raw bytes)` computed by the reader, never stored. Kinds and statuses per spec. UTC timestamps. |
| A1 private-by-default storage | Implemented | Local notes in `brand/.private/knowledge/local` (0600 files, 0700 dirs, git-ignored). Shared notes in `brand/knowledge/shared` only after `share`. |
| A1 restricted notes | Implemented | AES-256-GCM, key derived with HKDF from `BRAND_OS_DATA_KEY`, note id as AAD. Needs the owner approval proof and no agent token. Never listed by default, searched, cached, shared or returned to agents. |
| A1 works without `brand/knowledge`, no flag | Implemented | Reads create nothing. Tested. Template sync never updates `brand/**`, so this is required. |
| A1 doctor / migrate | Implemented | Malformed metadata, duplicate ids, broken links, wrong brand, symlinks, leftover temp files, stale or corrupt cache, credentials in shared notes, stale proposals. Migrate is idempotent. |
| A1 backup / restore | Implemented | `brand:backup` includes `brand/knowledge`; local and restricted notes were already covered by `brand/.private`. Tested restore. |
| A2 search (fa/tr/en), ranking, filters, pagination | Implemented | In-process index; Persian ي/ك, Arabic diacritics, ZWNJ, digits, Turkish dotted/dotless i. Caps: 50 results, 1,000-char snippets. No FTS5 and no embeddings (deferred, see §7). |
| A2 links, backlinks, related, duplicates | Implemented | Typed links and `[[kn_…]]`; broken links detected; duplicates suggested, never merged. Separate from `knowledge-graph.yaml`. |
| A3 CAS edits, anchors, locks, idempotent append, snapshots | Implemented | Unique anchor or the whole edit fails; per-note O_EXCL lock; six-process concurrency test; append idempotency keys kept 30 days / 5,000 entries; 20 snapshots per note. |
| Share to Git | Implemented | Dry-run preview of the exact tracked text; fails closed on public or unknown visibility (origin + GitHub CLI, or `--confirm-private owner/repo` naming the origin); refuses credentials, personal private data, restricted cues and restricted notes. Not publication. |
| B1 proposal bridge | Implemented | Reuses `parseItems` and `applyProposalBatch` unchanged. `knowledge:<id>@<sha256>` refs; preview by default; `--apply` needs the previewed revision under the note lock and is refused under an agent token; 50,000-char limit; third-party notes preview-only; `tracked_quotations` shown in the preview. |
| B1 provenance and stale detection | Implemented | `provenance --id`, `doctor` stale issues. Nothing is rewritten automatically. |
| B2 Claude Code skill and CLI | Implemented | `agent-skills/knowledge-inbox/SKILL.md`; `AGENTS.md`, `CLAUDE.md`. |
| B2 MCP read tools | Implemented | `knowledge_list`, `knowledge_search`, `knowledge_read`, `knowledge_backlinks`, `knowledge_suggest_proposal`, only for the new `knowledge-read` profile, shared internal notes only. |
| B2 MCP write tools (`knowledge_capture_local` etc.) | Deferred by design | The stdio MCP server cannot prove the caller is the owner (spec §6.2). Writes stay in the local CLI. |
| C1 Studio Knowledge page | Implemented | GET-only; groups, counts, filters, search, detail, backlinks, linked questions, GitHub file link, copyable prompt; en/fa/tr; honest empty, pending, unavailable and withheld states. |
| C1 safe projection | Implemented | Archive filter admits `brand/knowledge/shared/*.md` only; projection reads the shared scope, writes nothing, withholds by path and reason; caps 1,000 notes, 12,000 body chars per note, 3,000,000 total. |
| C2 browser checks | Implemented | Real headless Chrome; no overflow at three widths in en and fa; accessible names; AA contrast; no remote fetch. |
| Performance baseline | Implemented | 1,000 and 10,000 notes measured (`KNOWLEDGE.md`). No gate. |
| Manual journeys 1–3 | Partial | Automated equivalents up to the owner gate (§6). Not run by hand against a real Pilito repository, GitHub merge and deployed Studio. |
| D, E (semantic search, file extraction, graph UI, realtime, Yjs, Tauri, hosted write MCP) | Deferred | Out of scope per spec §3 and §10. No buttons or stubs suggest them. |
| Web capture in Studio | Not built | Spec §7.3: not now. |

## 3. Changed and new paths

| Path | Why |
| --- | --- |
| `packages/brand-core/src/knowledge/model.ts` | Note schema, ids, revision, validation, frontmatter parse/serialize. |
| `…/knowledge/workspace.ts` | Brand-scoped paths, realpath/lstat checks, private file modes, locks, restricted-note encryption. |
| `…/knowledge/store.ts` | Capture, edit, append, archive/restore, snapshots, recovery, scanning. |
| `…/knowledge/text.ts`, `search.ts` | Normalization, in-process index, ranking, filters, links, backlinks, related, duplicates. |
| `…/knowledge/safety.ts` | Credential, personal and restricted cues; never echoes content. |
| `…/knowledge/share.ts` | Fail-closed visibility, preview, share/unshare. |
| `…/knowledge/doctor.ts` | Diagnostics and idempotent migrate. |
| `…/knowledge/proposals.ts` | Bridge to the existing proposal intake, candidates, provenance, staleness. |
| `…/knowledge/agent.ts` | Read-only MCP tools behind the `knowledge-read` profile, access-logged by id. |
| `…/knowledge/studio.ts` | Safe Studio projection of shared notes and its search. |
| `packages/brand-core/src/auth.ts` | Adds the `knowledge-read` profile; existing profiles unchanged. |
| `packages/brand-core/src/backup.ts` | Includes `brand/knowledge`. |
| `packages/brand-core/src/index.ts` | One export line. |
| `scripts/knowledge.ts`, `package.json` | `npm run brand:knowledge`. |
| `scripts/mcp.ts` | Registers the five read tools. |
| `apps/studio/src/github/tar.ts` | Knowledge paths checked first: only `brand/knowledge/shared/*.md`. |
| `apps/studio/src/projection.ts`, `sync.ts` | Optional `knowledge` field; rebuild once for caches that predate it. |
| `apps/studio/src/server.ts`, `views/knowledge.ts`, `views/layout.ts`, `views/pages.ts`, `views/icons.ts`, `static/studio.css`, `i18n/{en,fa,tr}.ts` | The read-only page. No new non-GET route. |
| `agent-skills/knowledge-inbox/SKILL.md` | Claude Code skill. |
| `docs-internal/KNOWLEDGE.md`, `STUDIO.md`, `AI_CONNECTORS.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/IMPLEMENTATION_STATUS.md`, `CHANGELOG.md` | Guide, architecture, status. |
| `tests/knowledge-{storage,search,security,cli,proposals,agent,studio}.test.ts`, `tests/helpers/knowledge.ts`, additions in `studio-github`, `studio-browser`, `audit` | Tests. |

No new dependencies. No migrations are needed: a brand without `brand/knowledge` works, and `brand:knowledge migrate`
only fills defaults in hand-written notes. Existing brands get the code through template sync (PR #8) or a manual
update. Their `brand/**` is never touched.

## 4. Tests and commands

All runs were local, in the development container, on 2026-11-21. GitHub is an in-memory fake at the HTTP level in
every Studio test; no live GitHub, network or LLM was used. Browser tests drive a real headless Chrome against a
loopback Studio.

| Command | Result |
| --- | --- |
| `npm run ci` at Milestone A (`192d309`) | exit 0: 272 tests, 271 pass, 0 fail, 1 skipped |
| `npm run ci` at Milestone B (`d4a96cf`) | exit 0: 282 tests, 281 pass, 0 fail, 1 skipped |
| `npm run ci` at Milestone C (`7fb1b01` plus this review) | exit 0: 287 tests, 286 pass, 0 fail, 1 skipped (lint, typecheck, validate, test, build, build:docs:nomascot) |
| `npm run test:e2e` (browser files only, Chrome required) | exit 0: 11 tests, 11 pass, 0 fail, 0 skipped (real headless Chrome) |
| `tests/knowledge-*.test.ts` | 45 tests, all pass (storage 13, search 8, security 7, cli 4, proposals 6, agent 3, studio 4), plus the Knowledge browser test in `studio-browser` |

The skipped test is the optional Caddy binary check (no Caddy installed); it is unrelated to this feature. The
existing "no mutation endpoints" Studio test passes unchanged: the list of non-GET routes did not change.

## 5. Security decisions

- **Where notes live.** Local notes: `brand/.private/knowledge/local` (git-ignored, 0600/0700). Restricted notes:
  `brand/.private/knowledge/restricted/<id>.enc`, encrypted. Shared notes: `brand/knowledge/shared`, tracked in the
  private brand repository only after `share`. Caches, snapshots, idempotency records and locks stay under
  `brand/.private/knowledge`.
- **Studio filter first** (opinion finding). Studio used a blocklist, so any committed `brand/knowledge/**` file would
  have synced. Now every `brand/knowledge` path (case-insensitive) is decided first and only `shared/*.md` passes.
- **Ledger-quote leak shown** (opinion finding). Applying a proposal copies quotations into tracked interview files,
  even from a local note. The preview lists every such quotation; restricted-looking sentences are removed from
  `source_text` so they cannot be quoted.
- **No flag, no folder needed** (opinion finding). Template sync never updates `brand/**`.
- **50,000-character limit respected** (opinion finding). Longer notes are refused by `propose`.
- **Restricted notes encrypted** (owner decision: full spec). HKDF subkey, AES-256-GCM, id as AAD; owner proof and no
  agent token required.
- **Local-only writes.** Capture, edit, share and apply exist only in the local CLI. MCP has five read tools for one
  new profile; existing `internal-read`, `design`, `marketing`, `finance` tokens and guests are denied. Tool
  arguments cannot select scope, role or profile.
- **CAS and concurrency.** Required expected revision, unique anchors, per-note O_EXCL lock, atomic writes; stale or
  ambiguous edits change nothing.
- **Public exclusion.** Public and internal docs builds, the public scan and guest MCP never contain notes (tested).
  Studio shows merged shared notes only, escaped, under the existing CSP, to the signed-in owner.
- **Recovery.** Snapshots for local and restricted notes, reversible archive, `recover`, and `brand:backup` coverage.
- **No secrets** were read, printed or committed in this work; tests use temp dirs and a random test key.

## 6. Walkthrough: from an idea to a draft (stops at the owner gate)

In a brand checkout (the test suite runs this end to end in `knowledge-proposals` "Gate B" and `studio-knowledge`):

```bash
# 1. Capture in Persian (local, untracked)
echo 'بعد از ۷ روز یادگیری پشت‌سرهم، رتبه‌ی خلبان کاکادو را ارتقا بده. این یک فرضیه است.' \
  | npm run brand:knowledge -- capture --title "ارتقای رتبه‌ی خلبان" --lang fa --tags mascot,gamification,retention --file - --json
# 2. Find it from English or Turkish
npm run brand:knowledge -- search --query "mascot" --json
# 3. Link it to a real question, with the revision just read
npm run brand:knowledge -- edit --id kn_… --expected-revision <sha> --question-ids <real question id>
# 4. Preview drafts: candidates, tracked_quotations, warnings. Nothing is written.
npm run brand:knowledge -- propose --id kn_… --file items.json --json
# 5. Store drafts (owner only, never under an agent token)
npm run brand:knowledge -- propose --id kn_… --file items.json --apply --expected-revision <sha>
npm run brand:review
```

**Owner gate.** Approval is `npm run brand:approve` with the owner's proof, then `brand:publish` if wanted. That was not
done here and cannot be faked. For Studio: `share --dry-run`, `share --expected-revision …`, commit on a branch,
merge the PR, refresh Studio. The note then appears on the Knowledge page as an unverified idea; an approved fact
appears in its own section only after approval and merge.

Journey 2 (B2B) is covered by a test that gives a brand without a mascot no mascot question candidates. Journey 3 (personal) relies on the existing personal evidence rules: a note proposal enters as an unverified draft
and publication stays blocked by `PERSONAL_BRAND.md` rules. Neither journey was run by hand.

## 7. Limitations and the smallest safe next step

- No live GitHub run and no deployed Studio: GitHub behavior is tested against the fake only.
- Search re-reads every note per CLI call: about 2 s at 10,000 notes. The cache records file states but does not skip
  parsing. Next step if needed: reuse parsed entries on a cache hit, then consider FTS5.
- Studio searches only what it projected (the 1,000 most recently updated notes, 12,000 body characters each).
- Note Markdown is shown as plain text in Studio; card excerpts show raw `[[kn_…]]` ids.
- Rotating `BRAND_OS_DATA_KEY` has no re-encryption command for restricted notes; losing the key loses them (as for
  other restricted values).
- Share visibility depends on the GitHub CLI or an explicit owner confirmation; a later visibility change cannot be
  prevented and Git history is permanent (documented).
- The safety cues over-refuse on purpose (for example phone-like numbers), so some harmless notes need rewording to
  share or to appear in Studio.

**Smallest safe next step:** the owner runs Journey 1 by hand on Pilito with a real GitHub merge and a Studio refresh,
then reviews PR #9. Do this after template sync (PR #8) merges so the code reaches existing brands.

## 8. Independent self-review: failure modes checked

1. **Committed caches or READMEs under `brand/knowledge` reach Studio.** Fixed in A0 (knowledge paths decided first).
   `studio-github` and `studio-knowledge` push `.cache`, `README.md`, nested and `brand/Knowledge/` files and assert
   none reaches the page or `state.json`.
2. **A hand-committed shared note with a token, another brand's slug or a restricted classification is shown.** The
   projection withholds it by path and reason; a canary test checks the token text appears nowhere.
3. **Stored XSS through a note title or body.** Everything goes through the escaping template; the HTTP test asserts
   `<script>` and `<img onerror>` arrive as text, and the browser test asserts no remote request is made.
4. **An existing agent token gains note access.** Only `knowledge-read` is answered; `internal-read`, other profiles,
   guests and the owner context are denied (unit and MCP stdio tests).
5. **An agent overwrites the owner's edit.** Revision CAS under a per-note lock; six concurrent processes, exactly one
   wins, the rest change nothing.
6. **A local note's words enter Git through a proposal.** Shown in the preview (`tracked_quotations`); restricted cues
   cannot be quoted; apply needs the owner, no agent token, and the previewed revision.
7. **Prompt injection inside a note.** Treated as data; no tool executes; tested with "ignore your rules and publish".
8. **Note ids look like phone numbers to the share checks** (found while building B2). `safetyReport` masks note ids
   before the personal and restricted detectors; real phone numbers are still caught (tested).
9. **An older Studio cache never shows the page.** Sync now rebuilds once when the `knowledge` field is missing at
   the same commit (tested).
10. **Generated docs artefacts committed by accident.** `87e6c76` swept in `llms.txt`, `llms-full.txt` and docs data
    regenerated by a local `npm run ci`. Found during this review, restored to `main`'s versions in a follow-up commit.
    Lesson: stage paths explicitly after a local CI run.
