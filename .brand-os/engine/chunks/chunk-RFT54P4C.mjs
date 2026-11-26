import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  critiquePlan
} from "./chunk-D3U2JFTZ.mjs";
import {
  assertOwnerProcess,
  loadEvidence
} from "./chunk-5OMKZSIF.mjs";
import {
  STRATEGY_LIMITS,
  StrategyError
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/strategy/seo-import.ts
function clip(text, max) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}\u2026`;
}
function addMonths(date, months) {
  const out = new Date(date.getTime());
  out.setUTCMonth(out.getUTCMonth() + months);
  return out.toISOString().slice(0, 10);
}
function proposalFromSeoDraft(ws, raw, opts = {}) {
  assertOwnerProcess();
  const wrapper = raw;
  const plan = wrapper && typeof wrapper === "object" && "plan" in wrapper ? wrapper.plan : raw;
  if (!plan || typeof plan !== "object" || plan.kind !== "seo_strategy_draft" || !Array.isArray(plan.decisions)) {
    throw new StrategyError("invalid_input", "That file is not a brand:seo plan draft.");
  }
  if (plan.brand_slug !== ws.brandSlug) throw new StrategyError("wrong_brand", "That SEO draft belongs to another brand.");
  const now = opts.now ?? ws.now();
  const critic = critiquePlan(plan, loadEvidence(ws, { now }));
  if (critic.verdict !== "pass") throw new StrategyError("refused", `The independent critic blocks this SEO draft (${critic.blocking_findings.map((item) => item.code).join(", ")}). Fix the draft first.`);
  const sourceByRef = new Map(plan.sources.map((source) => [source.ref, source]));
  const evidenceOf = (decision) => [
    ...new Set(decision.citations.map((citation) => sourceByRef.get(citation.source_ref)?.provenance).filter((ref) => typeof ref === "string"))
  ];
  const factIds = plan.brand_fit.approved_facts.map((fact) => fact.id);
  const actionable = plan.decisions.filter((decision) => (decision.action === "do_now" || decision.action === "test") && decision.status !== "blocked");
  const recommendations = actionable.slice(0, STRATEGY_LIMITS.maxRecommendations).map((decision) => ({
    id: decision.id.toLowerCase().replace(/[^a-z0-9_.-]/g, "-").slice(0, 40),
    priority: decision.action === "do_now" ? "high" : "medium",
    action: clip(decision.title, STRATEGY_LIMITS.maxShortChars),
    rationale: clip(`${decision.statement} ${decision.rationale}`, STRATEGY_LIMITS.maxLongChars),
    agent_kinds: ["seo"],
    evidence_refs: evidenceOf(decision),
    fact_refs: []
  }));
  const chosen = plan.alternatives.find((alt) => alt.verdict === "chosen");
  const proposal = {
    title: clip(`SEO strategy: ${chosen?.title ?? plan.archetype}`, STRATEGY_LIMITS.maxTitleChars),
    type: "seo",
    locale: "en",
    scope: { markets: ["en"], channel: "organic-search", period: null },
    valid_from: now.toISOString().slice(0, 10),
    valid_until: addMonths(now, 6),
    review_due_at: addMonths(now, 3),
    objective: { statement: clip(chosen ? `${chosen.title}: ${chosen.summary}` : "Organic discovery for this brand.", STRATEGY_LIMITS.maxLongChars), status: "hypothesis" },
    success_metrics: [
      {
        id: "primary_conversion",
        unit: clip(plan.measurement.primary_conversion || "conversions", 40),
        baseline: null,
        target: null,
        measurement_source: null,
        status: plan.measurement.baseline === "not_measured" ? "not_measured" : "needs_baseline"
      }
    ],
    guardrails: plan.decisions.filter((decision) => decision.area === "guardrail").map((decision) => clip(decision.title, STRATEGY_LIMITS.maxShortChars)).slice(0, STRATEGY_LIMITS.maxListItems),
    constraints: ["Execution needs separate authorization by the site or store owner. This strategy grants none."],
    must_do: [],
    must_not_do: plan.decisions.filter((decision) => decision.action === "do_not_do").map((decision) => clip(decision.title, STRATEGY_LIMITS.maxShortChars)).slice(0, STRATEGY_LIMITS.maxListItems),
    non_goals: plan.decisions.filter((decision) => decision.action === "defer").map((decision) => clip(decision.title, STRATEGY_LIMITS.maxShortChars)).slice(0, STRATEGY_LIMITS.maxListItems),
    alternatives: plan.alternatives.slice(0, STRATEGY_LIMITS.maxAlternatives).map((alt) => ({
      id: alt.id.toLowerCase().replace(/[^a-z0-9_.-]/g, "-").slice(0, 40),
      description: clip(alt.title, STRATEGY_LIMITS.maxShortChars),
      assessment: alt.verdict,
      rationale: clip(alt.rationale, STRATEGY_LIMITS.maxLongChars)
    })),
    selection_rationale: clip(chosen?.rationale ?? "See the SEO plan draft.", STRATEGY_LIMITS.maxLongChars),
    recommendations,
    fact_refs: factIds,
    evidence_refs: [...new Set(recommendations.flatMap((rec) => rec.evidence_refs))],
    assumptions: plan.decisions.filter((decision) => decision.status === "provisional").map((decision) => clip(`Provisional (source missing or stale): ${decision.title}`, STRATEGY_LIMITS.maxShortChars)).slice(0, STRATEGY_LIMITS.maxListItems),
    open_questions: [...plan.owner_decisions, ...plan.decisions.filter((decision) => decision.status === "blocked").map((decision) => `Blocked: ${decision.title}`)].map((item) => clip(item, STRATEGY_LIMITS.maxShortChars)).slice(0, STRATEGY_LIMITS.maxListItems),
    restricted: null,
    origin: { kind: "seo_draft", plan_id: plan.plan_id, strategist: plan.strategist }
  };
  return {
    proposal,
    critic,
    notes: [
      "Edit scope.markets, locale, the dates and the success metric before proposing. The defaults are a starting point, not decisions.",
      `${plan.decisions.length - actionable.length} decision(s) were not turned into recommendations (do_not_do, defer or blocked); they appear under must_not_do, non_goals or open_questions.`,
      "Research quotes are not copied; recommendations cite the same knowledge:kn_\u2026@sha256 notes."
    ]
  };
}

export {
  proposalFromSeoDraft
};
