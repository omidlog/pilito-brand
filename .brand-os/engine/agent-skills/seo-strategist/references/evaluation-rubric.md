# Evaluation rubric

Two independent layers:

1. **Critic** (`seo-critic/1`, `packages/brand-core/src/seo/critic.ts`). It does not import the strategist. It reads the Markdown and the typed plan and re-checks citations against the Knowledge Inbox. Blocking codes: `uncited_policy_claim`, `fabricated_metric`, `latest_claim_without_research`, `guarantee_claim`, `misquoted_source`, `unknown_source_ref`, `stale_citation`, `edited_source`, `assumes_nonexistent_website`, `offline_claims_research`, `missing_evidence_gaps`, `authorizes_action`.
2. **Eval cases** (`evals/cases.yaml`, run by `tests/seo-evals.test.ts`). These are regression cases for spec §6 quality gates (a)–(l). Every case also requires a passing critic.

Known limits: the critic is pattern-based. It catches the listed claim shapes in English prose, not every paraphrase or other-language claim. It is a gate against fabrication, not proof of strategic quality.
