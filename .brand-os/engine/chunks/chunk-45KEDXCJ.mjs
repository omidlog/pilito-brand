import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  critiquePlan
} from "./chunk-D3U2JFTZ.mjs";
import {
  brandRetrieve
} from "./chunk-Z4VEC43P.mjs";
import {
  SEO_DIR,
  SeoError,
  UNKNOWN,
  answersOf,
  interviewState,
  list,
  readInterview,
  single
} from "./chunk-ZYAYDNGS.mjs";
import {
  assertOwnerProcess2 as assertOwnerProcess,
  evidenceFor,
  loadEvidence
} from "./chunk-5OMKZSIF.mjs";
import {
  agentTokenContext,
  ensureDir,
  knowledgeRef,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/seo/service.ts
import path from "node:path";

// packages/brand-core/src/seo/strategist.ts
import crypto from "node:crypto";

// packages/brand-core/src/seo/model.ts
var SEO_STRATEGY_SCHEMA_VERSION = 1;
var STRATEGIST_VERSION = "seo-strategist/1";

// packages/brand-core/src/seo/render.ts
var ACTION_LABEL = { do_now: "Do now", test: "Test", defer: "Later / waiting", do_not_do: "Do not do" };
var STATUS_LABEL = {
  cited: "cited: rests on the quoted current sources",
  brand_reasoned: "reasoned from the owner\u2019s answers (no platform statement involved)",
  provisional: "PROVISIONAL: a required source is missing, stale or contradicted",
  blocked: "BLOCKED: waiting for an owner answer"
};
function escapeMd(text) {
  return text.replace(/[\\`*_[\]<>|#]/g, (ch) => `\\${ch}`);
}
function day(iso) {
  return iso.slice(0, 10);
}
function value(v) {
  return escapeMd(Array.isArray(v) ? v.join(", ") : v);
}
function renderPlan(plan) {
  const lines = [];
  const researched = plan.research.status === "researched";
  lines.push(`# SEO strategy draft \u2014 ${escapeMd(plan.brand_slug)}`);
  lines.push("");
  lines.push(`- Plan: \`${plan.plan_id}\` (${plan.strategist}), created ${day(plan.created_at)}`);
  lines.push(`- State: DRAFT for owner review. Not approved. It authorizes no website change, publication or spend.`);
  lines.push(`- Label: ${plan.label === "provisional" ? "PROVISIONAL" : "evidence-backed"}; confidence ${plan.confidence.overall}`);
  lines.push(`- Research: ${researched ? `researched (${plan.research.fresh_sources} fresh source(s), adapter ${plan.research.adapter.adapter}/${plan.research.adapter.mode})` : "research_unavailable"}`);
  lines.push(`- Archetype: ${plan.archetype.replace(/_/g, " ")}`);
  lines.push("");
  if (!researched) {
    lines.push("> **research_unavailable.** No source was checked for this plan. It asserts no search engine or store guidance, no keyword volume and no position. Every decision that depends on platform guidance is provisional until checked.");
    lines.push(`> Reason: ${escapeMd(plan.research.adapter.reason ?? "no research adapter")}`);
    lines.push("");
  }
  lines.push("## Confidence");
  lines.push("");
  for (const reason of plan.confidence.reasons) lines.push(`- ${escapeMd(reason)}`);
  lines.push("");
  lines.push("## Situation and brand fit");
  lines.push("");
  for (const observation of plan.brand_fit.observations) lines.push(`- ${escapeMd(observation)}`);
  lines.push("");
  lines.push("Owner answers used (interview record; verbatim words stay in the Knowledge Inbox):");
  lines.push("");
  for (const input of plan.brand_fit.inputs) lines.push(`- \`${input.question_id}\`: ${value(input.value)}${input.owner_words ? ` (words: \`${input.owner_words}\`)` : ""}`);
  if (plan.brand_fit.approved_facts.length) {
    lines.push("");
    lines.push(`Approved brand facts read as context: ${plan.brand_fit.approved_facts.map((fact) => `\`${fact.id}\``).join(", ")}.`);
  }
  if (plan.competitor_assumptions.length) {
    lines.push("");
    lines.push(`Competitor assumptions (owner-named, unverified, positions not checked): ${plan.competitor_assumptions.map((item) => escapeMd(item.name)).join(", ")}.`);
  }
  lines.push("");
  lines.push("## Alternatives considered");
  lines.push("");
  if (plan.alternatives.length === 0) lines.push("None yet: the website/app presence is unknown.");
  else {
    lines.push("| Option | Verdict | Evidence | Feasibility | Time to signal | Brand fit | Risk | Why |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const alt of plan.alternatives) {
      const c = alt.criteria;
      lines.push(`| ${escapeMd(alt.title)} | ${alt.verdict} | ${c.evidence_strength} | ${c.feasibility} | ${c.time_to_signal} | ${c.brand_fit} | ${c.risk} | ${escapeMd(alt.rationale)} |`);
    }
    lines.push("");
    lines.push("Criteria are qualitative levels from a declared rubric, not scores or forecasts.");
  }
  lines.push("");
  lines.push("## Decisions");
  lines.push("");
  const sourceByRef = new Map(plan.sources.map((source) => [source.ref, source]));
  let n = 0;
  for (const action of ["do_now", "test", "defer", "do_not_do"]) {
    const group = plan.decisions.filter((decision) => decision.action === action);
    if (!group.length) continue;
    lines.push(`### ${ACTION_LABEL[action]}`);
    lines.push("");
    for (const decision of group) {
      n += 1;
      lines.push(`#### D${n}. ${escapeMd(decision.title)} (\`${decision.id}\`)`);
      lines.push("");
      lines.push(escapeMd(decision.statement));
      lines.push("");
      lines.push(`Why: ${escapeMd(decision.rationale)}`);
      lines.push("");
      for (const citation of decision.citations) {
        const source = sourceByRef.get(citation.source_ref);
        const quote = source?.quotes.find((item) => item.claim_key === citation.claim_key)?.quote;
        if (!source || !quote) continue;
        const stated = source.page_last_updated ? `, page says \u201C${source.page_last_updated}\u201D` : ", page states no date";
        lines.push(`> \u201C${quote}\u201D \u2014 ${source.publisher}, retrieved ${day(source.retrieved_at)}${stated} [${source.ref}]`);
        lines.push("");
      }
      if (decision.missing_claims.length) {
        lines.push(`Missing or stale evidence: ${decision.missing_claims.map((key) => `\`${key}\``).join(", ")}.`);
        lines.push("");
      }
      lines.push(`Status: ${STATUS_LABEL[decision.status]}. Confidence: ${decision.confidence}. Decided: ${day(decision.decided_at)}. Review when: ${escapeMd(decision.review_trigger)}`);
      if (decision.owner_decision) lines.push(`Owner decision needed: ${escapeMd(decision.owner_decision)}`);
      lines.push("");
    }
  }
  if (n === 0) {
    lines.push("No decisions: answer `seo.presence.web` and `seo.presence.app` first.");
    lines.push("");
  }
  lines.push("## AI discovery (GEO)");
  lines.push("");
  lines.push(`${plan.geo.included ? "Included." : "Not included."} ${escapeMd(plan.geo.reason)} No AI citation or mention is promised.`);
  lines.push("");
  lines.push("## Measurement");
  lines.push("");
  lines.push(`- Primary conversion: ${escapeMd(plan.measurement.primary_conversion)}`);
  lines.push(`- Baseline: ${plan.measurement.baseline}`);
  for (const indicator of plan.measurement.leading_indicators) lines.push(`- Leading indicator: ${escapeMd(indicator)}`);
  for (const note of plan.measurement.notes) lines.push(`- ${escapeMd(note)}`);
  lines.push("");
  if (plan.owner_decisions.length) {
    lines.push("## Owner decisions required");
    lines.push("");
    for (const item of plan.owner_decisions) lines.push(`- [ ] ${escapeMd(item)}`);
    lines.push("");
  }
  lines.push("## Evidence-gap checklist");
  lines.push("");
  for (const gap of plan.evidence_gaps) lines.push(`- [ ] **${gap.kind}** \u2014 \`${gap.item.slice(0, 160)}\`: ${escapeMd(gap.why)} Close it: ${escapeMd(gap.how_to_close)}`);
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  if (plan.sources.length === 0) {
    lines.push("No source is cited.");
    if (plan.starting_points.length) {
      lines.push("");
      lines.push("Official starting points to check (not retrieved; pointers only, no claim is drawn from them):");
      lines.push("");
      for (const url of plan.starting_points) lines.push(`- <${url}>`);
    }
  } else {
    lines.push("| Ref | Publisher | Page | Retrieved | Page date | Type | Trust | Freshness | Knowledge note |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const source of plan.sources) {
      lines.push(
        `| ${source.ref} | ${escapeMd(source.publisher)} | <${source.url}> | ${day(source.retrieved_at)} | ${escapeMd(source.page_last_updated ?? "none stated")} | ${source.source_type} | ${source.trust.level} (${source.trust.supports.replace(/_/g, " ")}) | ${source.staleness.state}, ${source.staleness.age_days}/${source.staleness.max_age_days} days | \`${source.provenance}\` |`
      );
    }
    lines.push("");
    lines.push("Official documentation states what a platform says; it is not evidence that a tactic works for this brand.");
  }
  lines.push("");
  return lines.join("\n");
}

// packages/brand-core/src/seo/strategist.ts
var OFFICIAL_STARTING_POINTS = [
  "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  "https://developers.google.com/search/docs/essentials",
  "https://developers.google.com/search/docs/essentials/spam-policies",
  "https://developers.google.com/search/docs/appearance/ai-features",
  "https://developers.google.com/search/docs/specialty/international/localized-versions",
  "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
  "https://developers.openai.com/api/docs/bots",
  "https://developer.apple.com/app-store/product-page/"
];
function archetypeOf(a) {
  const web = single(a["seo.presence.web"]);
  const app = single(a["seo.presence.app"]);
  if (!web || web === UNKNOWN) return "undetermined";
  if (web === "none") return app && app !== "none" && app !== UNKNOWN ? "app_only" : "undetermined";
  return app && app !== "none" && app !== UNKNOWN ? "website_and_app" : "website";
}
var has = (a, id, ...values) => values.includes(single(a[id]) ?? "");
var hasSite = (c) => c.archetype === "website" || c.archetype === "website_and_app";
var iosApp = (c) => c.app === "ios" || c.app === "ios_android";
var androidApp = (c) => c.app === "android" || c.app === "ios_android";
function decisionDrafts(c) {
  const a = c.a;
  const out = [];
  const b2b = has(a, "seo.business.model", "b2b", "both");
  out.push({
    id: "guard.no-guarantees",
    title: "Refuse guaranteed outcomes",
    action: "do_not_do",
    statement: "Do not buy, promise or report guaranteed positions, traffic or AI citations.",
    rationale: "No vendor controls a search engine\u2019s results; a plan built on a promised position cannot be evaluated honestly.",
    requires: ["google.seo.no_guaranteed_ranking"],
    review_trigger: "Any vendor proposal that promises a position.",
    area: "guardrail",
    owner_decision: null
  });
  if (has(a, "seo.goal.timeframe", "under_3_months")) {
    out.push({
      id: "guard.timeframe",
      title: "Do not rely on search for the next three months",
      action: "defer",
      statement: "Keep search work going, but meet the under-three-month goal with channels that respond faster; judge search on a longer horizon.",
      rationale: "The owner expects results within three months; organic search effects are slow and uneven, so the goal and the channel do not match.",
      requires: ["google.seo.changes_take_time"],
      review_trigger: "The goal date changes.",
      area: "guardrail",
      owner_decision: "Accept a longer horizon for search, or move the three-month goal to another channel."
    });
  }
  if (hasSite(c)) {
    const control = single(a["seo.web.control"]);
    out.push({
      id: "site.eligibility",
      title: "Make the pages that matter findable",
      action: control === "none" ? "defer" : "do_now",
      statement: "List the pages that carry the primary goal and confirm each one can be crawled, indexed and shown with a snippet; use noindex only on purpose, never robots rules, to keep a page out.",
      rationale: control === "none" ? "Nobody can change the site today, so this waits until someone can." : "Everything else is wasted if the pages that carry the goal cannot be found.",
      requires: ["google.essentials.technical_minimum", "google.robots.not_for_deindexing", "google.robots.noindex_to_exclude"],
      review_trigger: "Any template, platform or URL change.",
      area: "foundation",
      owner_decision: control === "none" ? "Give someone the ability to change titles, text and robots rules, or accept that site work waits." : null,
      blocked_by: control === void 0 || control === UNKNOWN ? ["seo.web.control"] : void 0
    });
    if (has(a, "seo.web.maturity", "migrating")) {
      out.push({
        id: "site.migration",
        title: "Protect the move before anything else",
        action: "do_now",
        statement: "Map every old URL to its new URL and keep the redirect map under review before and after the move; pause other site changes during it.",
        rationale: "The owner says a domain or platform move is coming: it can undo every other improvement if URLs break.",
        requires: ["google.site_move.redirects"],
        review_trigger: "The move date is set.",
        area: "foundation",
        owner_decision: null
      });
    }
    out.push({
      id: "site.intent-pages",
      title: b2b ? "Core pages for each buying question" : "Core pages for each task people search for",
      action: "do_now",
      statement: b2b ? "Write one strong page per buying question the committee asks (problem, approach, comparison with substitutes, proof, pricing model if public) instead of many thin pages." : "Write one strong page per task or question your audience brings, each ending in the primary conversion, instead of many thin pages.",
      rationale: `The primary goal is ${single(a["seo.goal.primary"]) ?? "not yet stated"}; a few intent-matched pages are measurable and within a small team\u2019s reach.`,
      requires: [],
      review_trigger: "The offer or the audience changes.",
      area: "content",
      owner_decision: null,
      blocked_by: a["seo.goal.primary"] === void 0 || a["seo.goal.primary"] === UNKNOWN ? ["seo.goal.primary"] : void 0
    });
    out.push({
      id: "site.no-scaled-pages",
      title: "No mass-generated pages",
      action: "do_not_do",
      statement: "Do not generate large numbers of near-duplicate pages to target keyword variations.",
      rationale: "It adds risk and no first-hand value; the team\u2019s time is better spent on the core pages.",
      requires: ["google.spam.scaled_content_abuse"],
      review_trigger: "A proposal to generate pages automatically.",
      area: "guardrail",
      owner_decision: null
    });
    const capacity = single(a["seo.content.capacity"]);
    const firsthand = single(a["seo.content.firsthand"]);
    if ((capacity === "medium" || capacity === "high") && (firsthand === "original_data" || firsthand === "expertise")) {
      out.push({
        id: "site.firsthand-content",
        title: "A first-hand content series",
        action: "test",
        statement: `Publish a regular series built on the brand\u2019s ${firsthand === "original_data" ? "own data" : "real expertise"}, one topic cluster at a time, and keep it only if it earns impressions and conversions after a fair period.`,
        rationale: "The owner reports both production capacity and material others cannot copy.",
        requires: [],
        review_trigger: "Capacity drops, or a cluster shows no impressions after its review period.",
        area: "content",
        owner_decision: null
      });
    }
    if (c.locales.length > 1) {
      const structure = single(a["seo.web.locale_structure"]);
      out.push({
        id: "site.locales",
        title: `Declare the ${c.locales.join(", ")} versions consistently`,
        action: structure === "undecided" || structure === void 0 || structure === UNKNOWN ? "defer" : "do_now",
        statement: structure && structure !== "undecided" && structure !== UNKNOWN ? `Keep the ${structure.replace(/_/g, " ")} structure and connect each page to its language versions with hreflang; treat each language as its own market with its own queries.` : "Choose one URL structure for the language versions before building more pages, then connect each page to its versions with hreflang.",
        rationale: "Several languages are in scope; each is a separate search market, and changing structure later is a migration.",
        requires: ["google.international.hreflang_variations", "google.international.language_detection"],
        review_trigger: "A language is added or removed.",
        area: "international",
        owner_decision: structure === "undecided" || structure === void 0 || structure === UNKNOWN ? "Choose the URL structure for language versions." : null
      });
    }
  }
  if (c.archetype === "app_only") {
    out.push({
      id: "app.store-first",
      title: "Store listings are the search surface",
      action: "do_now",
      statement: `Treat the ${[iosApp(c) ? "App Store" : null, androidApp(c) ? "Google Play" : null].filter(Boolean).join(" and ")} listing${iosApp(c) && androidApp(c) ? "s" : ""} as the brand\u2019s primary search surface. Store-metadata work belongs to an ASO specialist, which Brand OS does not have yet; this plan only frames it.`,
      rationale: "There is no website, so people searching for the brand land on store pages or third parties.",
      requires: [...iosApp(c) ? ["apple.app_store.keywords_limit", "apple.app_store.name_limit"] : [], ...androidApp(c) ? ["google_play.store_listing.metadata"] : []],
      review_trigger: "A website is created, or a store changes its listing fields.",
      area: "store",
      owner_decision: null
    });
    if (iosApp(c)) {
      out.push({
        id: "app.promo-text",
        title: "Keep promotional text for people, not keywords",
        action: "do_not_do",
        statement: "Do not stuff keywords into the App Store promotional text; use it for timely messages.",
        rationale: "Wasted characters there buy nothing for search and cost clarity for people.",
        requires: ["apple.app_store.promo_text_not_ranking"],
        review_trigger: "A store listing review.",
        area: "store",
        owner_decision: null
      });
    }
    out.push({
      id: "app.no-site-work",
      title: "No site-level technical work",
      action: "do_not_do",
      statement: "Do not plan sitemaps, hreflang, robots rules or page-speed work: there is no website to apply them to.",
      rationale: "The owner answered that the brand has no website.",
      requires: [],
      review_trigger: "A website is created.",
      area: "guardrail",
      owner_decision: null
    });
    const openness = single(a["seo.app.web_openness"]);
    out.push({
      id: "app.minimal-site",
      title: "A minimal official website",
      action: openness === "yes" ? "test" : openness === "no" ? "do_not_do" : "defer",
      statement: openness === "no" ? "Do not build a website now; the owner does not want one. Revisit if branded searches land on third parties." : "Build one small official page per language that names the product, links to the store listings and states only released features, so web searches for the brand reach an official source.",
      rationale: openness === "yes" ? "The owner is open to a small site, and without one the brand has no page of its own in web results." : openness === "no" ? "The owner declined a website." : "The owner has not decided whether a website is wanted.",
      requires: openness === "no" ? [] : ["google.essentials.technical_minimum"],
      review_trigger: "The owner decides about a website.",
      area: "foundation",
      owner_decision: openness === "yes" || openness === "no" ? null : "Decide whether a minimal official website is wanted.",
      blocked_by: openness === void 0 ? ["seo.app.web_openness"] : void 0
    });
    if (has(a, "seo.app.store_status", "prelaunch")) {
      out.push({
        id: "app.prelaunch-claims",
        title: "No claims before release",
        action: "do_not_do",
        statement: "Do not describe features or availability in any search-facing text until the app is released.",
        rationale: "The owner says the app is not released yet; promising it would be a false claim.",
        requires: [],
        review_trigger: "The release date.",
        area: "guardrail",
        owner_decision: null
      });
    }
  }
  if (c.archetype === "website_and_app") {
    out.push({
      id: "app.handoff",
      title: "Hand store search to an ASO specialist",
      action: "defer",
      statement: "Keep store-listing search out of this web plan; Brand OS has no ASO specialist yet, so store work is listed as an open item, not planned here.",
      rationale: "Store search and web search are different systems.",
      requires: [],
      review_trigger: "An ASO specialist is available.",
      area: "store",
      owner_decision: null
    });
  }
  if (c.geo) {
    if (hasSite(c)) {
      out.push({
        id: "geo.same-fundamentals",
        title: "AI search features ride on the same work",
        action: "do_not_do",
        statement: "Do not buy special \u201CAI optimization\u201D files, markup or services; the site work above is the AI-discovery work.",
        rationale: "The owner wants to be found through AI answers; the plan spends nothing on unverified hacks.",
        requires: ["google.ai_features.no_special_optimization", "google.ai_features.no_special_files", "google.ai_features.supporting_link_eligibility"],
        review_trigger: "The cited guidance is past its staleness limit, or a vendor proposes AI-specific files.",
        area: "geo",
        owner_decision: null
      });
      const policy = single(a["seo.geo.crawler_policy"]);
      const decided = policy && policy !== "undecided" && policy !== UNKNOWN;
      out.push({
        id: "geo.crawler-policy",
        title: "Decide AI crawler access on purpose",
        action: decided ? "do_now" : "defer",
        statement: decided ? {
          allow_search_and_training: "Allow both the search crawler and the training crawler of each AI provider you care about, and write the choice down.",
          allow_search_block_training: "Allow AI search crawlers (such as OAI-SearchBot) and disallow training crawlers (such as GPTBot) in robots rules, and write the choice down.",
          block_all: "Disallow AI crawlers in robots rules, knowing this also removes the site from those assistants\u2019 search answers, and write the choice down."
        }[policy] : "Choose, per AI provider, whether its search crawler and its training crawler may read the site; they are separate settings.",
        rationale: "Search visibility in assistants and use of content for training are separate choices that belong to the owner.",
        requires: ["openai.crawlers.independent_settings", ...policy === "block_all" ? ["openai.crawlers.searchbot_opt_out"] : []],
        review_trigger: "A new AI crawler is documented, or the owner changes their mind.",
        area: "geo",
        owner_decision: decided ? null : "Decide AI crawler access (search, training, both or neither)."
      });
      out.push({
        id: "geo.observe",
        title: "Observe AI visibility, do not assume it",
        action: "test",
        statement: "Watch AI-feature appearances inside the overall search data, and record assistant answers that mention the brand as dated, manual observations; draw no conclusion from a handful.",
        rationale: "There is no direct, complete measurement of AI answers; dated observations keep claims honest.",
        requires: ["google.ai_features.reported_in_search_console"],
        review_trigger: "Quarterly.",
        area: "geo",
        owner_decision: null
      });
    } else if (c.archetype === "app_only") {
      out.push({
        id: "geo.entity-consistency",
        title: "One consistent description of the product",
        action: "test",
        statement: "Use the same product name, one-line description and category on every store listing and official profile, then record how assistants describe the brand as dated observations.",
        rationale: "A hypothesis, not a platform statement: with no website, assistants can only learn about the brand from these pages and third parties.",
        requires: [],
        review_trigger: "A website is created.",
        area: "geo",
        owner_decision: null
      });
    }
  }
  out.push({
    id: "measure.baseline",
    title: "Record a baseline before judging anything",
    action: "do_now",
    statement: hasSite(c) && has(a, "seo.data.search_console", "verified") ? "Export the current search performance from the console you already use, date it, and keep it as the baseline every later change is compared with." : hasSite(c) ? "Verify the site in a search engine console (the owner does this; Brand OS never asks for credentials), then wait for data before judging any change." : "Record current store listing views and installs from the store consoles you already use, dated, as the baseline; there is no web baseline without a website.",
    rationale: "Without a baseline every result would be a guess; this plan reports performance as not measured.",
    requires: [],
    review_trigger: "Before any review of results.",
    area: "measurement",
    owner_decision: null
  });
  return out;
}
function alternativesFor(c) {
  const a = c.a;
  const capacity = single(a["seo.content.capacity"]);
  const firsthand = single(a["seo.content.firsthand"]);
  const canWrite = capacity === "medium" || capacity === "high";
  const hasMaterial = firsthand === "original_data" || firsthand === "expertise";
  if (c.archetype === "app_only") {
    const openness = single(a["seo.app.web_openness"]);
    return [
      {
        id: "alt.store-first",
        title: "Store listings first, web later",
        summary: "Put search effort into the store listings (with an ASO specialist) and keep web search out of scope for now.",
        criteria: { evidence_strength: "medium", feasibility: "high", time_to_signal: "weeks", brand_fit: "high", risk: "low" },
        verdict: "chosen",
        rationale: "The product lives in the stores and there is no website; this is where people already find it."
      },
      {
        id: "alt.minimal-site",
        title: "Minimal official website now",
        summary: "One small page per language naming the product and linking to the stores.",
        criteria: { evidence_strength: "medium", feasibility: openness === "no" ? "low" : "high", time_to_signal: "months", brand_fit: "medium", risk: "low" },
        verdict: openness === "yes" ? "secondary" : openness === "no" ? "rejected" : "deferred",
        rationale: openness === "yes" ? "Cheap, and gives web searches an official destination." : openness === "no" ? "The owner does not want a website." : "Waits for the owner\u2019s decision about a website."
      },
      {
        id: "alt.content-site",
        title: "A content website for non-branded web search",
        summary: "Build a site and publish articles to attract people searching for the problem the app solves.",
        criteria: { evidence_strength: "low", feasibility: canWrite && hasMaterial ? "medium" : "low", time_to_signal: "long", brand_fit: hasMaterial ? "medium" : "low", risk: "medium" },
        verdict: canWrite && hasMaterial && openness === "yes" ? "deferred" : "rejected",
        rationale: canWrite && hasMaterial && openness === "yes" ? "Possible later, once the store listings work and the small site exists." : "Needs a website, steady production and first-hand material that are not in place today."
      }
    ];
  }
  if (c.archetype === "undetermined") return [];
  const control = single(a["seo.web.control"]);
  return [
    {
      id: "alt.foundation",
      title: "Findable foundation and a few strong core pages",
      summary: "Make the pages that carry the goal findable, then improve a small set of intent-matched pages.",
      criteria: { evidence_strength: "medium", feasibility: control === "none" ? "low" : "high", time_to_signal: "months", brand_fit: "high", risk: "low" },
      verdict: control === "none" ? "deferred" : "chosen",
      rationale: control === "none" ? "Nobody can change the site yet." : "Smallest effort that every other option depends on."
    },
    {
      id: "alt.content",
      title: "First-hand content programme",
      summary: "A regular series built on the brand\u2019s own data or expertise.",
      criteria: { evidence_strength: "low", feasibility: canWrite ? "medium" : "low", time_to_signal: "long", brand_fit: hasMaterial ? "high" : "low", risk: "medium" },
      verdict: canWrite && hasMaterial ? control === "none" ? "chosen" : "secondary" : "deferred",
      rationale: canWrite && hasMaterial ? "Capacity and material exist; run it as a test after the foundation." : "Needs production capacity and first-hand material the owner did not report."
    },
    {
      id: "alt.scaled",
      title: "Generated pages for every keyword variation",
      summary: "Produce many templated pages quickly.",
      criteria: { evidence_strength: "low", feasibility: "high", time_to_signal: "weeks", brand_fit: "low", risk: "high" },
      verdict: "rejected",
      rationale: "High risk and no first-hand value; see the guardrail decision."
    }
  ];
}
function planId(input) {
  const digest = crypto.createHash("sha256").update(JSON.stringify([input.brand_slug, input.answers, input.evidence.items.map((item) => item.provenance), input.now.toISOString()])).digest("hex");
  return `seo_${input.now.toISOString().slice(0, 10).replace(/-/g, "")}_${digest.slice(0, 12)}`;
}
function buildStrategy(input) {
  const a = input.answers;
  const archetype = archetypeOf(a);
  const geoInterest = single(a["seo.geo.interest"]);
  const usable = input.evidence.items.filter((item) => item.usable);
  const fresh = usable.filter((item) => item.staleness.state === "fresh");
  const researched = fresh.length > 0;
  const decidedAt = input.now.toISOString();
  const geoEvidence = ["google.ai_features.no_special_optimization", "openai.crawlers.independent_settings"].some((key) => {
    const best = evidenceFor(input.evidence, key).best;
    return best && best.item.staleness.state === "fresh";
  });
  let geoReason;
  let geo = false;
  if (geoInterest === "no") geoReason = "The owner said AI discovery does not matter for this brand.";
  else if (geoInterest === void 0 || geoInterest === UNKNOWN) geoReason = "Not asked yet or unknown; AI discovery is left out until the owner answers seo.geo.interest.";
  else if (archetype === "app_only") {
    geo = true;
    geoReason = "Included as a hypothesis about consistent product descriptions only; with no website there is no crawler or page setting to decide.";
  } else if (!geoEvidence) geoReason = "Left out: no current source about AI search features or AI crawlers was available, and this plan makes no claims about them without one.";
  else {
    geo = true;
    geoReason = "Included because the owner cares about AI discovery and current official sources were recorded.";
  }
  const ctx = { a, web: single(a["seo.presence.web"]), app: single(a["seo.presence.app"]), archetype, locales: list(a["seo.market.locales"]), geo };
  const sources = [];
  const conflicts = /* @__PURE__ */ new Set();
  const gaps = [];
  const cite = (item, claimKey, quote) => {
    let source = sources.find((entry) => entry.provenance === item.provenance);
    if (!source) {
      source = {
        ref: `S${sources.length + 1}`,
        provenance: item.provenance,
        note_id: item.note.id,
        revision: item.note.revision,
        url: item.source.url,
        publisher: item.source.publisher,
        title: item.source.title,
        source_type: item.source.source_type,
        retrieved_at: item.source.retrieved_at,
        page_last_updated: item.source.page_last_updated,
        trust: item.trust,
        staleness: item.staleness,
        quotes: []
      };
      sources.push(source);
    }
    if (!source.quotes.some((entry) => entry.claim_key === claimKey)) source.quotes.push({ claim_key: claimKey, quote });
    return source.ref;
  };
  const decisions = [];
  if (archetype !== "undetermined") {
    for (const draft of decisionDrafts(ctx)) {
      const citations = [];
      const missing = [];
      let conflicted = false;
      for (const key of draft.requires) {
        const claim = evidenceFor(input.evidence, key);
        if (claim.conflict) {
          conflicted = true;
          conflicts.add(key);
        }
        if (!claim.best) {
          missing.push(key);
          continue;
        }
        if (claim.best.item.staleness.state === "stale") {
          missing.push(key);
          if (!gaps.some((gap) => gap.kind === "stale_source" && gap.item === claim.best.item.source.url)) {
            gaps.push({ kind: "stale_source", item: claim.best.item.source.url, why: `Retrieved ${claim.best.item.source.retrieved_at.slice(0, 10)}, older than the ${claim.best.item.staleness.max_age_days}-day limit for ${claim.best.item.staleness.topic}.`, how_to_close: "Re-capture the page with brand:seo research capture." });
          }
          continue;
        }
        citations.push({ source_ref: cite(claim.best.item, key, claim.best.excerpt.quote), claim_key: key });
      }
      for (const key of missing) {
        if (evidenceFor(input.evidence, key).best || gaps.some((gap) => gap.kind === "missing_source" && gap.item === key)) continue;
        gaps.push({ kind: "missing_source", item: key, why: `Decision "${draft.title}" depends on it.`, how_to_close: "Record a current official source for it (brand:seo research capture), then re-run the plan." });
      }
      const blocked = (draft.blocked_by ?? []).length > 0;
      const status = blocked ? "blocked" : missing.length > 0 || conflicted ? "provisional" : draft.requires.length > 0 ? "cited" : "brand_reasoned";
      const confidence = status === "cited" ? "high" : status === "brand_reasoned" ? "medium" : "low";
      decisions.push({
        id: draft.id,
        title: draft.title,
        action: draft.action,
        statement: draft.statement,
        rationale: draft.rationale,
        requires: draft.requires,
        citations,
        missing_claims: missing,
        status,
        confidence,
        decided_at: decidedAt,
        review_trigger: draft.review_trigger,
        area: draft.area,
        owner_decision: conflicted ? `${draft.owner_decision ? `${draft.owner_decision} ` : ""}Sources disagree on ${draft.requires.filter((key) => conflicts.has(key)).join(", ")}: review both before relying on this.` : draft.owner_decision
      });
    }
  }
  for (const key of conflicts) gaps.push({ kind: "conflicting_sources", item: key, why: "Recorded sources disagree.", how_to_close: "Read both sources; prefer the platform\u2019s own current documentation and record why." });
  const state = interviewState(a);
  for (const id of state.pending) gaps.push({ kind: "unanswered_question", item: id, why: "Not answered yet.", how_to_close: `Answer it: brand:seo answer --question ${id} --value \u2026` });
  for (const id of state.unknown) gaps.push({ kind: "unknown_answer", item: id, why: "The owner answered unknown; nothing was assumed.", how_to_close: "Answer it when known." });
  if (!researched) {
    gaps.unshift({ kind: "research_unavailable", item: input.capability.adapter, why: input.capability.reason ?? "No current source was available.", how_to_close: "Record current official sources (live retrieval or a recorded bundle), then re-run the plan." });
  }
  gaps.push({ kind: "no_keyword_data", item: "keyword research", why: "No keyword tool or search-volume data was used. Topics in this plan are hypotheses; no volumes are stated.", how_to_close: "Use the owner\u2019s own console data or a keyword tool the owner chooses, and cite the export with its date." });
  if (!(archetype !== "app_only" && has(a, "seo.data.search_console", "verified"))) {
    gaps.push({ kind: "no_baseline", item: "search performance baseline", why: "There is no search performance data in Brand OS: performance is not_measured.", how_to_close: "Export a dated baseline from the console the owner already uses." });
  }
  const competitors = list(a["seo.competitors.named"]);
  if (competitors.length) gaps.push({ kind: "unverified_competitors", item: competitors.join(", "), why: "Named by the owner; their search presence and positions were not checked.", how_to_close: "Record a dated observation of each competitor\u2019s search presence as a research note." });
  if (has(a, "seo.goal.timeframe", "under_3_months")) gaps.push({ kind: "unrealistic_goal", item: "seo.goal.timeframe", why: "An under-three-month expectation for organic search.", how_to_close: "Owner decision: longer horizon or a faster channel." });
  const reasons = [];
  let overall;
  if (archetype === "undetermined") {
    overall = "blocked";
    reasons.push("The website/app presence is not known, so no archetype can be chosen.");
  } else if (!researched) {
    overall = "low";
    reasons.push("research_unavailable: no current source was checked.");
  } else if (decisions.some((decision) => decision.status === "provisional" || decision.status === "blocked")) {
    overall = "medium";
    reasons.push(`${decisions.filter((decision) => decision.status === "provisional" || decision.status === "blocked").length} decision(s) are provisional or blocked.`);
  } else overall = "high";
  if (state.pending.length + state.unknown.length > 0) {
    reasons.push(`${state.pending.length} unanswered and ${state.unknown.length} unknown interview answer(s).`);
    if (overall === "high") overall = "medium";
  }
  reasons.push("No performance data: every outcome is not_measured.");
  const label = researched && archetype !== "undetermined" && !decisions.some((decision) => decision.status === "provisional" || decision.status === "blocked") ? "evidence_backed" : "provisional";
  const observations = [];
  if (archetype === "app_only") observations.push("App-only brand: web search can reach it only through store pages and third parties.");
  if (archetype === "website" || archetype === "website_and_app") observations.push(`Website brand (${ctx.web?.replace(/_/g, " ")}): its own pages are the search surface.`);
  if (has(a, "seo.business.model", "b2b", "both")) observations.push("B2B buyers: fewer, higher-intent questions across a buying committee.");
  if (ctx.locales.length > 1) observations.push(`${ctx.locales.length} languages in scope: each is a separate search market.`);
  if (single(a["seo.content.capacity"]) === "none" || single(a["seo.content.capacity"]) === "low") observations.push("Little content capacity: the plan avoids content-volume strategies.");
  const goal = single(a["seo.goal.primary"]);
  const measurement = {
    primary_conversion: goal && goal !== UNKNOWN ? goal : "not stated",
    leading_indicators: archetype === "app_only" ? ["Store listing views and installs, from the store consoles (owner export)", "Branded web searches landing on official pages (only once a site exists)"] : ["Impressions and clicks for the core pages, from the search console (owner export)", `Conversions (${goal ?? "not stated"}) from those pages, from analytics`],
    baseline: archetype !== "app_only" && has(a, "seo.data.search_console", "verified") ? "available_to_owner" : "not_measured",
    notes: [has(a, "seo.data.analytics", "none") ? "No analytics records the conversion yet: outcomes cannot be attributed." : "Outcomes are reported only from owner-supplied, dated exports.", "No number in this plan is a measurement."]
  };
  const ownerDecisions = decisions.map((decision) => decision.owner_decision).filter((item) => Boolean(item));
  const plan = {
    schema_version: SEO_STRATEGY_SCHEMA_VERSION,
    kind: "seo_strategy_draft",
    strategist: STRATEGIST_VERSION,
    plan_id: planId(input),
    brand_slug: input.brand_slug,
    created_at: decidedAt,
    state: "draft",
    approval: null,
    authorizes: [],
    research: {
      status: researched ? "researched" : "research_unavailable",
      adapter: input.capability,
      usable_sources: usable.length,
      fresh_sources: fresh.length,
      stale_sources: usable.length - fresh.length,
      conflicts: [...conflicts]
    },
    label,
    confidence: { overall, reasons },
    archetype,
    brand_fit: {
      inputs: Object.entries(a).filter((entry) => entry[1] !== void 0).map(([question_id, value2]) => ({ question_id, value: value2, owner_words: input.answer_notes?.[question_id] ?? null })),
      approved_facts: input.approved_facts ?? [],
      observations
    },
    competitor_assumptions: competitors.map((name) => ({ name, status: "unverified_owner_assumption" })),
    alternatives: alternativesFor(ctx),
    decisions,
    geo: { included: geo, reason: geoReason },
    measurement,
    owner_decisions: ownerDecisions,
    evidence_gaps: gaps,
    sources,
    starting_points: researched ? [] : OFFICIAL_STARTING_POINTS,
    markdown: ""
  };
  plan.markdown = renderPlan(plan);
  return plan;
}

// packages/brand-core/src/seo/service.ts
var SEO_CONTEXT_FACTS = ["business.market.geography", "business.marketing.objective", "business.marketing.channels", "brand.ui.platforms", "business.marketing.availability_claim"];
function approvedContextFacts(ws, engine) {
  if (engine.config().brand.slug !== ws.brandSlug) throw new SeoError("wrong_brand", "The engine and the workspace are different brands.");
  const ctx = { ...agentTokenContext(ws.brandSlug, "seo-strategist", "marketing"), principal_id: "local-process:seo-strategist" };
  const facts = brandRetrieve(engine, ctx, { kind: "facts" });
  const items = facts.data?.items ?? [];
  return items.filter((item) => !item.withheld && item.approval_state === "approved" && SEO_CONTEXT_FACTS.includes(item.id)).map((item) => ({ id: item.id, revision: item.revision }));
}
function draftSeoStrategy(ws, engine, opts) {
  assertOwnerProcess();
  const now = opts.now ?? ws.now();
  const record = readInterview(ws);
  const answerNotes = {};
  for (const [id, entry] of Object.entries(record.answers)) answerNotes[id] = entry.note ? knowledgeRef(entry.note.id, entry.note.revision) : null;
  const evidence = loadEvidence(ws, { now });
  const plan = buildStrategy({
    brand_slug: ws.brandSlug,
    answers: answersOf(record),
    answer_notes: answerNotes,
    evidence,
    capability: opts.adapter.capability(now),
    approved_facts: engine ? approvedContextFacts(ws, engine) : [],
    now
  });
  const critic = critiquePlan(plan, evidence);
  let saved = null;
  if (opts.save !== false) {
    const dir = path.join(ws.root, ...SEO_DIR.split("/"), "drafts");
    ensureDir(ws, dir);
    const json = path.join(dir, `${plan.plan_id}.json`);
    const markdown = path.join(dir, `${plan.plan_id}.md`);
    writeVaultFile(ws, json, `${JSON.stringify({ plan, critic }, null, 2)}
`, true);
    writeVaultFile(ws, markdown, plan.markdown, true);
    saved = { json: path.relative(ws.root, json).split(path.sep).join("/"), markdown: path.relative(ws.root, markdown).split(path.sep).join("/") };
  }
  return { plan, critic, saved };
}

export {
  draftSeoStrategy
};
