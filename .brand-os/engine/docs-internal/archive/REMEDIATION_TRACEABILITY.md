# Remediation traceability

Contract: `BRAND_OS_REMEDIATION_2.md`. Baseline before this pass: `cd4ead5`. Paths were re-read from the current tree. Contract line numbers were not used as edit anchors.

Deviation kept from the previous audit: restricted values stay encrypted in gitignored `brand/.private`, materialize stays create-only, approval still requires the local human proof, and MCP still uses the official SDK. This pass does not undo those fixes.

A ticket is **fixed** only when the named test passed in this workspace. **partial** means the tested slice works and the named gap remains. Nothing here is marked fixed from a scaffold alone.

| ID | Severity | Current location | Test | Status | Commit | Proof |
| --- | --- | --- | --- | --- | --- | --- |
| P0-01 | BLOCKER | `packages/brand-core/src/projection.ts` `exportPublic` | `tests/security-contract.test.ts` | partial | 153b954 | Public export is a new allowlist of published public facts. An unpublished approved name is absent. `exportSnapshot('internal')` still returns owner answer records. |
| P0-02 | BLOCKER | `engine.ts` `changeAnswer`, `approveChange`, `publishFact` | `tests/security-contract.test.ts`, `tests/interview.test.ts` | partial | 153b954 | `confirm=true` and `--actor owner` do not withdraw or approve. Stale `expected_version` is rejected. Reviewer id is the local proof, not SSO. |
| P0-03 | BLOCKER | `auth.ts` `authorize`, `query.ts`, `scripts/mcp.ts`, `engine.ts` | `tests/security-contract.test.ts`, `tests/audit.test.ts` | partial | 06a2c5f | `authorize` runs on submit, change, approve, publish, reveal, export, and every MCP tool. MCP schemas no longer accept `include_unapproved`. SSO is not configured. |
| P0-04 | BLOCKER | `scripts/prepare-docs.ts`, `scripts/scan-public.ts`, `.github/workflows/validate.yml` | `tests/security-contract.test.ts` | partial | 06a2c5f | CI scans `apps/docs/build`, including source maps, after the public and no-mascot builds. A planted canary in a `.map` file fails the scanner. |
| P0-05 | BLOCKER | `packages/asset-catalog/src/index.ts` `inspectAssetForPublication` | `tests/security-contract.test.ts` | partial | 153b954 | Symlink, `..`, encoded `..`, absolute path, active SVG, and checksum mismatch are rejected. No browser execution test of a copied SVG. |
| P0-06 | BLOCKER | `packages/brand-core/src/backup.ts`, `private-store.ts` | `tests/security-contract.test.ts` | partial | 06a2c5f | Backups are AES-GCM ciphertext. Missing `BRAND_OS_DATA_KEY` throws. Fact migration rewrites schema 1 to schema 2 and keeps the value. There is no OS keychain on this runner; the key is env-only. |
| P1-01 | CORE | `packages/brand-core/src/facts.ts` | `tests/security-contract.test.ts` | partial | 06a2c5f | Approved and draft facts are written as canonical schema 2. Old files migrate without changing values. Market-specific copy and effective dates are not modeled. |
| P1-02 | CORE | `compile-docs.ts`, `prepare-docs.ts` | `tests/security-contract.test.ts` | partial | 06a2c5f | Each module compiles a page that cites published facts and marks the rest missing. Guides stay separate. PDF export is not implemented. |
| P1-03 | CORE | `engine.ts` `extractPersianCandidates` | `tests/journeys.test.ts` | partial | 153b954 | One Persian note proposes student, tentative B2B, and unknown price as drafts. No hosted model and no browser interview UI. |
| P1-04 | CORE | `artifacts.ts` `allocateBudget`, `financeScenario` | `tests/journeys.test.ts` | partial | 06a2c5f | Budget totals sum. Missing revenue blocks margin and runway. Documents are still shorter than a full business plan. |
| P1-05 | CORE | `prepare-docs.ts` catalog preview | `tests/audit.test.ts` | partial | 153b954 | A preview is set only when `source_assets` points at a file that passes publication inspection. The template has no approved stage-3 artwork. |
| P1-06 | CORE | `query.ts` token hash | `tests/security-contract.test.ts` | partial | 153b954 | A changed hex drops the token from retrieval. Example CSS is still the labeled draft theme. |
| P1-07 | CORE | `scripts/mcp.ts`, `query.ts` | `tests/audit.test.ts` | partial | 06a2c5f | The MCP registry now includes the contract tool names. Guest context is the only MCP principal. Remote MCP is not deployed. |
| P1-08 | CORE | `backup.ts` `migrateBrand` | `tests/journeys.test.ts` | partial | 153b954 | Two temp brands are exercised. The core is not an npm release. |
| P1-09 | CORE | `tests/journeys.test.ts`, `tests/security-contract.test.ts` | local `npm test` and `npm run docs:build` | partial | 153b954 | 28 tests passed locally and the en/fa/tr docs build succeeded. CI for this commit is not recorded yet. |
| P2-01 | POLISH | `packages/brand-core/src/figma.ts` | `tests/security-contract.test.ts` | partial | 06a2c5f | Missing `FIGMA_TOKEN` or `FIGMA_FILE_KEY` returns `not_configured` and writes nothing. A fixture token returns proposals and does not overwrite approved tokens. Live Figma is not called. |
| P2-02 | POLISH | `agent-skills/*/SKILL.md` | review | partial | 06a2c5f | Ten skills now state scope, tools, missing-data behavior, and that approval needs a human proof. They are not executed as a separate agent runtime. |
| P2-03 | POLISH | module `overview.md` files | content review | partial | 06a2c5f | Each overview has a fa and tr guidance paragraph marked draft machine-translation. The rest of the article body stays English. |
| P2-04 | POLISH | `apps/docs/src/pages/index.tsx` | docs build | partial | 06a2c5f | The home page separates the public portal from the internal brand-manager view. It is the same route, switched by build audience. |
| P2-05 | POLISH | `deploy-docs.yml` | workflow review | partial | 153b954 | An internal audience is no longer uploaded as an Actions artifact. There is no hosted private site. |

## Deviations

- `getMascotGuidelines` no longer treats a client boolean as true. Published public mascot facts are the only rows.
- Disabled mascot and gamification modules are removed from the interview queue and from completion scoring.
- `upgradeCore` calls `migrateBrand`, writes engine `0.3.0`, and rewrites fact files to canonical schema 2 without changing values.
- Restricted storage and backups require `BRAND_OS_DATA_KEY`. The key is not stored in the repo.
- SSO, a hosted LLM, live Figma, and npm publishing stay unconfigured. Their code paths fail closed.
