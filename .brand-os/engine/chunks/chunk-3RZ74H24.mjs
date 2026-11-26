import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  BILLING_COMMITMENTS,
  BILLING_PERIODS,
  COMPETITIVE_LIMITS,
  COMPETITIVE_SCHEMA_VERSION,
  COMPETITOR_ID,
  CompetitiveError,
  DIMENSION_LABELS,
  GEOGRAPHIES,
  MEMO_HEADINGS,
  MEMO_TITLES,
  PROMOTIONS,
  RELATIONSHIPS,
  SEO_NAME_STATUS,
  TAX_INCLUSIONS,
  assertOwnerProcess,
  buildLandscape,
  competitiveDir,
  fill2 as fill,
  locked,
  oneOf,
  rateLabel,
  readCandidate,
  readJson,
  refState,
  resolveEvidence,
  scanCandidates,
  sourceClass,
  validateCompetitorId,
  validateDomain,
  writeJson
} from "./chunk-ZYAYDNGS.mjs";
import {
  DEFAULT_STALENESS_DAYS,
  evidenceFor,
  hostOf,
  loadEvidence
} from "./chunk-5OMKZSIF.mjs";
import {
  safetyBlocksSharing,
  safetyReport,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/competitive/render.ts
var RATE_TERMS = {
  standard_rate: "standard_rate",
  promotional: "PROMOTIONAL",
  promotion_unknown: "promotion_unknown",
  monthly_rate_billed_annually: "monthly_rate_billed_annually",
  terms_unknown: "terms_unknown"
};
function renderMemo(memo) {
  const lang = memo.lang;
  const h = (key, vars = {}) => fill(MEMO_HEADINGS[key][lang], vars);
  const dim = (d) => DIMENSION_LABELS[d][lang];
  const lines = [`${MEMO_TITLES[memo.kind][lang]} \u2014 ${memo.brand_slug}${memo.market ? ` (${memo.market})` : ""}`, h("preamble", { state: memo.context.state }), ""];
  lines.push(h("owner_inputs"), ...memo.owner_inputs.map((f) => `  - ${f.fact_id}: ${f.state === "approved" ? `${h("approved")} @${f.revision}` : h("missing")}`), "");
  if (memo.kind === "visual_landscape_assessment") {
    lines.push(h("visual", { state: memo.visual_comparison }), h("intake", { logo: memo.intake.choice.logo_presence, intent: memo.intake.choice.identity_intent }), "");
  }
  if (memo.kind === "seo_competitor_supplement") {
    lines.push(h("owner_named"));
    for (const n of memo.owner_named) lines.push(`  - ${n.name}: ${n.status}; ${n.competitor_id ? fill(SEO_NAME_STATUS.matched_candidate[lang], { id: n.competitor_id }) : SEO_NAME_STATUS.not_in_index[lang]}`);
    lines.push(h("search_evidence", { rankings: memo.search_evidence.rankings, gaps: memo.search_evidence.keyword_gaps }), "");
  }
  if (memo.kind === "pricing_benchmark_memo") {
    lines.push(h("price_table", { state: memo.prices.comparison, reason: memo.prices.reasons.length ? ` \u2014 ${memo.prices.reasons.join(", ")}` : "" }));
    for (const r of memo.prices.rows) {
      lines.push(`  - ${r.competitor_name} ${r.offer_name}: ${r.amount} ${r.currency} [${RATE_TERMS[r.rate_label]}; period ${r.billing_period}; commitment ${r.billing_commitment}; tax ${r.tax_inclusion}] ${r.market}, ${r.observed_at.slice(0, 10)}, ${r.status} ${r.ref}`);
    }
    lines.push("");
  }
  if (memo.observations.length) {
    lines.push(h("observations"));
    for (const o of memo.observations) lines.push(`  - ${o.competitor_name} \xB7 ${dim(o.dimension)} \xB7 ${o.statement_kind}: ${o.label} \u2014 ${o.cell}, ${o.source_class ?? "?"}, ${o.observed_at.slice(0, 10)} ${o.ref} ${o.claim_key}`);
    lines.push("");
  }
  if (memo.unresolved.length) {
    lines.push(h("unresolved"), ...memo.unresolved.map((u) => `  - ${u.competitor_name} \xB7 ${dim(u.dimension)}: ${u.cell} (${u.ref_state}) ${u.ref}`), "");
  }
  if (memo.warnings.length) lines.push(h("warnings"), ...memo.warnings.map((w) => `  ! ${w.text}`), "");
  if (memo.alternatives.length) {
    lines.push(h("alternatives"));
    for (const a of memo.alternatives) {
      lines.push(`  - [${a.id}] ${a.title}`, `      ${h("trade_off")}: ${a.trade_off}`);
      if (a.depends_on.length) lines.push(`      ${h("depends_on")}: ${a.depends_on.join(", ")}`);
    }
    lines.push("");
  }
  lines.push(h("not_known"), ...memo.not_known.map((n) => `  - ${n.text}`), "");
  if (memo.next_research.length) lines.push(h("next_research"), ...memo.next_research.map((s) => `  - ${s.text}`), "");
  lines.push(h("proposed_edits"), ...memo.proposed_edits.map((e) => `  - ${e.text}`), "");
  lines.push(h("never"), ...memo.prohibited_inferences.map((p) => `  - ${p.text}`));
  if (memo.source_refs.length) lines.push("", h("sources"), ...memo.source_refs.map((ref) => `  - ${ref}`));
  return lines.join("\n");
}

// packages/brand-core/src/competitive/positioning.ts
import crypto from "node:crypto";
import path from "node:path";
var AXES_RECORD_PATH = "brand/.private/competitive/axes.json";
var POSITIONS_RECORD_PATH = "brand/.private/competitive/positions.json";
var AXIS_KEYS = ["x", "y"];
var POSITION_BANDS = ["low", "lower_mid", "mid", "upper_mid", "high"];
var PLACEMENT_STATES = ["evidenced", "stale", "conflicting", "needs_review", "unknown"];
var OWN_SUBJECT = "own";
var POSITION_STALE_DAYS = DEFAULT_STALENESS_DAYS.market_observation;
var POSITIONING_LANGS = ["en", "fa", "tr"];
var POSITIONING_LIMITS = { maxAxisLabelChars: 60, maxPoleChars: 40, maxRationaleChars: 400, maxPositions: 800, maxSourcesPerPlacement: 6 };
var AXIS_ID = /^[a-z][a-z0-9_]{1,39}$/;
var POSITION_ID = /^pos_[0-9a-f-]{36}$/;
function unsafe(text2) {
  return safetyBlocksSharing({ ...safetyReport(text2), restricted_passages: 0 });
}
function oneLine(value, max, field, required) {
  if (value === void 0 || value === null || value === "") {
    if (required) throw new CompetitiveError("invalid_input", `${field} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new CompetitiveError("invalid_input", `${field} must be text.`);
  const clean = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!clean) {
    if (required) throw new CompetitiveError("invalid_input", `${field} is required.`);
    return null;
  }
  if ([...clean].some((ch) => ch.charCodeAt(0) < 32)) throw new CompetitiveError("invalid_input", `${field} must be a single line.`);
  if (clean.length > max) throw new CompetitiveError("invalid_input", `${field} is longer than ${max} characters. Keep axis names short.`);
  const blocked = unsafe(clean);
  if (blocked.length) throw new CompetitiveError("refused", `${field} looks like it contains ${blocked.join("; ")}.`);
  return clean;
}
function localized(value, max, field) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const extra = Object.keys(raw).filter((key) => !POSITIONING_LANGS.includes(key));
  if (extra.length) throw new CompetitiveError("invalid_input", `${field} has unknown languages: ${extra.join(", ")}. Use en, fa, tr.`);
  return { en: oneLine(raw.en, max, `${field} (en)`, true), fa: oneLine(raw.fa, max, `${field} (fa)`, false), tr: oneLine(raw.tr, max, `${field} (tr)`, false) };
}
function axisDefinition(value, key) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CompetitiveError("invalid_input", `Axis ${key} is required.`);
  const raw = value;
  const extra = Object.keys(raw).filter((k) => !["axis_id", "label", "low", "high", "rationale"].includes(k));
  if (extra.length) throw new CompetitiveError("invalid_input", `Axis ${key} has unknown fields: ${extra.join(", ")}.`);
  if (typeof raw.axis_id !== "string" || !AXIS_ID.test(raw.axis_id)) throw new CompetitiveError("invalid_input", `Axis ${key} needs an axis_id such as price_level (lowercase letters, digits, underscores).`);
  const def = {
    axis_id: raw.axis_id,
    label: localized(raw.label, POSITIONING_LIMITS.maxAxisLabelChars, `Axis ${key} label`),
    low: localized(raw.low, POSITIONING_LIMITS.maxPoleChars, `Axis ${key} low pole`),
    high: localized(raw.high, POSITIONING_LIMITS.maxPoleChars, `Axis ${key} high pole`),
    rationale: oneLine(raw.rationale, POSITIONING_LIMITS.maxRationaleChars, `Axis ${key} rationale`, false)
  };
  if (def.low.en.toLowerCase() === def.high.en.toLowerCase()) throw new CompetitiveError("invalid_input", `Axis ${key}: the low and high poles need different names.`);
  return def;
}
function validateAxes(input) {
  const x = axisDefinition(input.x, "x");
  const y = axisDefinition(input.y, "y");
  if (x.axis_id === y.axis_id) throw new CompetitiveError("invalid_input", "The two axes need different axis_id values.");
  if (x.label.en.toLowerCase() === y.label.en.toLowerCase()) throw new CompetitiveError("invalid_input", "The two axes need different labels.");
  return { x, y };
}
function checkAxesRecord(doc) {
  const keys = Object.keys(doc).sort().join(",");
  if (keys !== ["brand_slug", "kind", "schema_version", "updated_at", "x", "y"].join(",")) throw new CompetitiveError("invalid_record", `${path.basename(AXES_RECORD_PATH)} has unexpected fields.`);
  if (doc.schema_version !== COMPETITIVE_SCHEMA_VERSION || typeof doc.updated_at !== "string") throw new CompetitiveError("invalid_record", `${path.basename(AXES_RECORD_PATH)} has an unknown schema version.`);
  try {
    validateAxes({ x: doc.x, y: doc.y });
  } catch (error) {
    if (error instanceof CompetitiveError) throw new CompetitiveError("invalid_record", `${path.basename(AXES_RECORD_PATH)} is not valid: ${error.message}`);
    throw error;
  }
  return doc;
}
function axesFile(ws) {
  return path.join(competitiveDir(ws, "root"), "axes.json");
}
function positionsFile(ws) {
  return path.join(competitiveDir(ws, "root"), "positions.json");
}
function readAxes(ws) {
  assertOwnerProcess();
  const doc = readJson(ws, axesFile(ws), "competitive_axes");
  return doc ? checkAxesRecord(doc) : null;
}
function setAxes(ws, input) {
  assertOwnerProcess();
  const axes = validateAxes(input);
  const doc = { schema_version: COMPETITIVE_SCHEMA_VERSION, kind: "competitive_axes", brand_slug: ws.brandSlug, x: axes.x, y: axes.y, updated_at: ws.now().toISOString() };
  locked(ws, "competitive-axes", () => writeJson(ws, axesFile(ws), doc));
  return doc;
}
function checkPositions(doc) {
  const bad = (why) => new CompetitiveError("invalid_record", `${path.basename(POSITIONS_RECORD_PATH)} is not valid: ${why}.`);
  if (doc.schema_version !== COMPETITIVE_SCHEMA_VERSION || !Array.isArray(doc.positions)) throw bad("unknown schema");
  if (doc.positions.length > POSITIONING_LIMITS.maxPositions) throw bad("too many positions");
  for (const p of doc.positions) {
    if (!p || typeof p !== "object" || typeof p.position_id !== "string" || !POSITION_ID.test(p.position_id)) throw bad("a position id is malformed");
    if (p.subject !== OWN_SUBJECT && (typeof p.subject !== "string" || !/^cmp_[0-9a-f-]{36}$/.test(p.subject))) throw bad(`${p.position_id} has an unknown subject`);
    if (typeof p.axis_id !== "string" || !AXIS_ID.test(p.axis_id)) throw bad(`${p.position_id} has a malformed axis id`);
    if (!POSITION_BANDS.includes(p.band)) throw bad(`${p.position_id} has an unknown band`);
    const e = p.evidence;
    if (!e || typeof e.note_id !== "string" || typeof e.revision !== "string" || typeof e.claim_key !== "string" || typeof e.observed_at !== "string") throw bad(`${p.position_id} has no evidence`);
  }
  return doc;
}
function readPositions(ws) {
  assertOwnerProcess();
  const doc = readJson(ws, positionsFile(ws), "competitive_positions");
  return doc ? checkPositions(doc).positions : [];
}
function writePositions(ws, positions) {
  const doc = { schema_version: COMPETITIVE_SCHEMA_VERSION, kind: "competitive_positions", brand_slug: ws.brandSlug, positions, updated_at: ws.now().toISOString() };
  writeJson(ws, positionsFile(ws), doc);
}
function addPosition(ws, input) {
  assertOwnerProcess();
  const axes = readAxes(ws);
  if (!axes) throw new CompetitiveError("refused", "Choose the two axes first: npm run brand:competitive -- axes set \u2026");
  const axisIds = [axes.x.axis_id, axes.y.axis_id];
  if (!axisIds.includes(input.axis_id)) throw new CompetitiveError("invalid_input", `axis must be one of your axes: ${axisIds.join(", ")}.`);
  const band = oneOf(input.band, POSITION_BANDS, "band");
  const subject = input.subject === OWN_SUBJECT ? OWN_SUBJECT : validateCompetitorId(input.subject);
  if (subject !== OWN_SUBJECT) readCandidate(ws, subject);
  const resolved = resolveEvidence(ws, input.note, input.claim_key);
  return locked(ws, "competitive-positions", () => {
    const positions = readPositions(ws);
    const same = positions.find((p) => p.subject === subject && p.axis_id === input.axis_id && p.band === band && p.evidence.note_id === resolved.ref.note_id && p.evidence.claim_key === resolved.ref.claim_key && p.evidence.revision === resolved.ref.revision);
    if (same) return { position: same, outcome: "existing" };
    if (positions.length >= POSITIONING_LIMITS.maxPositions) throw new CompetitiveError("refused", `At most ${POSITIONING_LIMITS.maxPositions} positions per brand.`);
    const position = { position_id: `pos_${crypto.randomUUID()}`, subject, axis_id: input.axis_id, band, evidence: resolved.ref, recorded_at: ws.now().toISOString() };
    writePositions(ws, [...positions, position]);
    return { position, outcome: "recorded" };
  });
}
function removePosition(ws, positionId) {
  assertOwnerProcess();
  if (typeof positionId !== "string" || !POSITION_ID.test(positionId)) throw new CompetitiveError("invalid_input", "A position id looks like pos_<uuid>.");
  return locked(ws, "competitive-positions", () => {
    const positions = readPositions(ws);
    const found = positions.find((p) => p.position_id === positionId);
    if (!found) throw new CompetitiveError("not_found", `No position ${positionId} in this brand.`);
    writePositions(
      ws,
      positions.filter((p) => p.position_id !== positionId)
    );
    return found;
  });
}
var PUBLIC_WEB = /* @__PURE__ */ new Set(["competitor_own_page", "platform_documentation", "independent_reporting", "analyst_inference"]);
function dayOf(iso) {
  const day = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "0000-00-00";
}
function viewPositions(evidence, positions, domains, publicHost2) {
  return positions.map((p) => {
    const { state: ref, item } = refState(evidence, p.evidence);
    const contradicted = evidenceFor(evidence, p.evidence.claim_key).contradicting.length > 0;
    const state = ref !== "current" && ref !== "stale" ? "needs_review" : contradicted ? "conflicting" : ref === "stale" ? "stale" : "current";
    const cls = item ? sourceClass(item, p.subject === OWN_SUBJECT ? null : domains.get(p.subject) ?? null) : null;
    return {
      position_id: p.position_id,
      subject: p.subject,
      axis_id: p.axis_id,
      band: p.band,
      ref: `knowledge:${p.evidence.note_id}@${p.evidence.revision}`,
      claim_key: p.evidence.claim_key,
      observed_on: dayOf(p.evidence.observed_at),
      state,
      source: { source_class: cls, host: cls && PUBLIC_WEB.has(cls) ? publicHost2(p.evidence.note_id) : null, observed_on: dayOf(p.evidence.observed_at) }
    };
  });
}
function placementOf(views) {
  const usable = views.filter((v) => v.state !== "needs_review");
  if (!usable.length) return { state: views.length ? "needs_review" : "unknown", bands: [], sources: [] };
  const bands = POSITION_BANDS.filter((band) => usable.some((v) => v.band === band));
  const state = bands.length > 1 || usable.some((v) => v.state === "conflicting") ? "conflicting" : usable.every((v) => v.state === "stale") ? "stale" : "evidenced";
  const sources = /* @__PURE__ */ new Map();
  for (const v of [...usable].sort((a, b) => b.observed_on.localeCompare(a.observed_on) || a.position_id.localeCompare(b.position_id))) {
    const key = `${v.source.source_class ?? "-"}|${v.source.host ?? "-"}|${v.source.observed_on}`;
    if (sources.size < POSITIONING_LIMITS.maxSourcesPerPlacement) sources.set(key, v.source);
  }
  return { state, bands, sources: [...sources.values()] };
}
function positioningLandscape(ws, opts) {
  assertOwnerProcess();
  const axes = readAxes(ws);
  const positions = readPositions(ws);
  if (!axes) return { axes, views: [], retired: positions.length };
  const ids = /* @__PURE__ */ new Set([axes.x.axis_id, axes.y.axis_id]);
  const current = positions.filter((p) => ids.has(p.axis_id));
  const evidence = opts.evidence ?? loadEvidence(ws, { now: opts.now ?? ws.now() });
  return { axes, views: viewPositions(evidence, current, opts.domains, opts.publicHost), retired: positions.length - current.length };
}

// packages/brand-core/src/competitive/share.ts
import fs from "node:fs";
import path2 from "node:path";
var SHARED_LANDSCAPE_SCHEMA = "brand-os.competitive-shared-landscape/1";
var SHARED_LANDSCAPE_DIR = "brand/competitive/shared";
var SHARED_LANDSCAPE_PATH = `${SHARED_LANDSCAPE_DIR}/landscape.json`;
var SHARED_CRITERIA = ["offer", "audience", "geography", "public_price", "public_message", "visual_language", "observable_channels"];
var SHARED_CELL_STATES = ["observed", "unverified", "historical", "conflicting", "needs_review", "unknown"];
var SHARED_PRICE_STATES = ["observed", "unverified", "historical", "conflicting"];
var SOURCE_CLASSES = ["competitor_own_page", "platform_documentation", "independent_reporting", "analyst_inference", "owner_statement", "first_party_data"];
var RATE_LABELS = ["standard_rate", "promotional", "promotion_unknown", "monthly_rate_billed_annually", "terms_unknown"];
var SHARED_ASSESSMENTS = ["owner_reviewed", "needs_refresh"];
var PUBLIC_WEB_SOURCES = /* @__PURE__ */ new Set(["competitor_own_page", "platform_documentation", "independent_reporting", "analyst_inference"]);
var SHARED_LIMITS = { maxLabelsPerCell: 3, maxSourcesPerCell: 6, maxPrices: 400, maxFileBytes: 512 * 1024 };
function normalize(text2) {
  return text2.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
var QUOTE_MATCH_CHARS = 20;
function quoteIndex(evidence) {
  const out = [];
  for (const item of evidence.items) for (const excerpt of item.source.excerpts) out.push(normalize(excerpt.quote));
  return out;
}
function matchesQuote(text2, quotes) {
  const norm = normalize(text2);
  if (!norm) return false;
  return quotes.some((quote) => norm.length >= QUOTE_MATCH_CHARS && quote.includes(norm) || quote.length >= QUOTE_MATCH_CHARS && norm.includes(quote));
}
function unsafeText(text2) {
  return safetyBlocksSharing(safetyReport(text2)).length > 0;
}
var DAY = /^\d{4}-\d{2}-\d{2}$/;
function dayOf2(iso) {
  const day = iso.slice(0, 10);
  return DAY.test(day) ? day : "0000-00-00";
}
function publicHost(evidence, view) {
  if (!view.source_class || !PUBLIC_WEB_SOURCES.has(view.source_class)) return null;
  const item = evidence.items.find((candidate) => candidate.note.id === view.evidence.note_id);
  if (!item) return null;
  try {
    return validateDomain(hostOf(item.source.final_url || item.source.url));
  } catch {
    return null;
  }
}
function sourceOf(evidence, view) {
  return { source_class: view.source_class, host: publicHost(evidence, view), observed_on: dayOf2(view.evidence.observed_at) };
}
function sourceKey(source) {
  return `${source.source_class ?? "-"}|${source.host ?? "-"}|${source.observed_on}`;
}
var CELL_ORDER = ["conflicting", "observed", "unverified", "historical", "needs_review"];
function gateText(gate, text2) {
  if (!text2) return null;
  if (matchesQuote(text2, gate.quotes) || unsafeText(text2)) {
    gate.withheld += 1;
    return null;
  }
  return text2;
}
function cellFor(criterion, candidate, evidence, gate) {
  const views = candidate.observations.filter((view) => view.dimension === criterion && view.statement_kind === "observed_claim" && view.cell !== "hypothesis" && view.cell !== "unknown");
  const state = CELL_ORDER.find((s) => views.some((view) => view.cell === s)) ?? "unknown";
  if (state === "unknown" || state === "needs_review") return { criterion, state, labels: [], sources: [] };
  const shown = views.filter((view) => view.cell !== "needs_review").sort((a, b) => b.evidence.observed_at.localeCompare(a.evidence.observed_at) || a.observation_id.localeCompare(b.observation_id));
  const labels = [];
  for (const view of shown) {
    if (labels.length >= SHARED_LIMITS.maxLabelsPerCell) break;
    const label = gateText(gate, view.label);
    if (label && !labels.includes(label)) labels.push(label);
  }
  const sources = /* @__PURE__ */ new Map();
  for (const view of shown) {
    const source = sourceOf(evidence, view);
    if (sources.size < SHARED_LIMITS.maxSourcesPerCell) sources.set(sourceKey(source), source);
  }
  return { criterion, state, labels, sources: [...sources.values()] };
}
function compareText(a, b) {
  return a.localeCompare(b, "en", { sensitivity: "base" }) || (a < b ? -1 : a > b ? 1 : 0);
}
function buildSharedLandscape(ws, opts) {
  assertOwnerProcess();
  const now = opts.now ?? ws.now();
  const day = /* @__PURE__ */ new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  const landscape = buildLandscape(ws, { capability: opts.capability, now: day, lang: "en" });
  const evidence = loadEvidence(ws, { now: day });
  const gate = { quotes: quoteIndex(evidence), withheld: 0 };
  const notShared = { candidates: 0, disputed: 0, archived: 0 };
  const competitors = [];
  const prices = [];
  for (const candidate of landscape.candidates) {
    if (candidate.status !== "owner_reviewed") {
      if (candidate.status === "candidate") notShared.candidates += 1;
      else if (candidate.status === "disputed") notShared.disputed += 1;
      else notShared.archived += 1;
      continue;
    }
    if (unsafeText(candidate.display_name)) throw new CompetitiveError("refused", `A competitor name looks like it contains private data (${candidate.competitor_id}). Nothing was shared.`);
    competitors.push({
      competitor_id: candidate.competitor_id,
      display_name: candidate.display_name,
      relationship: [...candidate.relationship],
      geographic_relevance: [...candidate.geographic_relevance],
      markets: [...candidate.markets],
      official_domain: candidate.domain_state === "verified" ? candidate.official_domain : null,
      assessment: candidate.assessment === "needs_refresh" ? "needs_refresh" : "owner_reviewed",
      cells: SHARED_CRITERIA.map((criterion) => cellFor(criterion, candidate, evidence, gate))
    });
    for (const view of candidate.observations) {
      if (!view.price || view.statement_kind !== "observed_claim") continue;
      if (!SHARED_PRICE_STATES.includes(view.cell)) continue;
      const offer = gateText(gate, view.price.offer_name);
      if (!offer) continue;
      prices.push({
        competitor_id: candidate.competitor_id,
        offer_name: offer,
        amount: view.price.amount,
        currency: view.price.currency,
        market: view.price.market,
        billing_period: view.price.billing_period,
        billing_commitment: view.price.billing_commitment,
        tax_inclusion: view.price.tax_inclusion,
        promotion: view.price.promotion,
        feature_scope: gateText(gate, view.price.feature_scope),
        rate_label: rateLabel(view.price),
        state: view.cell,
        source: sourceOf(evidence, view)
      });
    }
  }
  competitors.sort((a, b) => compareText(a.display_name, b.display_name) || compareText(a.competitor_id, b.competitor_id));
  const nameOf = new Map(competitors.map((c) => [c.competitor_id, c.display_name]));
  prices.sort((a, b) => compareText(a.currency, b.currency) || compareText(nameOf.get(a.competitor_id), nameOf.get(b.competitor_id)) || compareText(a.offer_name, b.offer_name) || compareText(a.market, b.market) || compareText(a.source.observed_on, b.source.observed_on));
  const positioning = sharedPositioning(ws, evidence, day, competitors, gate);
  const placements = positioning ? [positioning.own, ...positioning.competitors].flatMap((p) => [...p.x.sources, ...p.y.sources]) : [];
  const days = [...competitors.flatMap((c) => c.cells.flatMap((cell) => cell.sources.map((s) => s.observed_on))), ...prices.map((p) => p.source.observed_on), ...placements.map((s) => s.observed_on)].sort();
  const doc = {
    schema: SHARED_LANDSCAPE_SCHEMA,
    schema_version: 1,
    kind: "competitive_shared_landscape",
    brand_slug: ws.brandSlug,
    as_of: days.length ? days[days.length - 1] : null,
    criteria: [...SHARED_CRITERIA],
    competitors,
    prices: { rows: prices.slice(0, SHARED_LIMITS.maxPrices), ranked: false, currency_conversion: "none" },
    not_shared: notShared,
    withheld_text: gate.withheld,
    authorizes: []
  };
  if (positioning) doc.positioning = positioning;
  return doc;
}
function hostOfNote(evidence, noteId) {
  const item = evidence.items.find((candidate) => candidate.note.id === noteId);
  if (!item) return null;
  try {
    return validateDomain(hostOf(item.source.final_url || item.source.url));
  } catch {
    return null;
  }
}
function sharedAxis(axis, gate) {
  const check = (label) => {
    for (const text2 of [label.en, label.fa, label.tr]) {
      if (text2 && (matchesQuote(text2, gate.quotes) || unsafeText(text2))) throw new CompetitiveError("refused", "An axis label looks like a source quote or private data. Nothing was shared; edit the axes and run share again.");
    }
    return { en: label.en, fa: label.fa, tr: label.tr };
  };
  return { label: check(axis.label), low: check(axis.low), high: check(axis.high) };
}
function sharedPositioning(ws, evidence, day, competitors, gate) {
  const domains = new Map(scanCandidates(ws).records.map((r) => [r.competitor_id, r.domain_claim]));
  const { axes, views } = positioningLandscape(ws, { now: day, domains, publicHost: (noteId) => hostOfNote(evidence, noteId), evidence });
  if (!axes) return null;
  const place = (subject, axisId) => {
    const p = placementOf(views.filter((v) => v.subject === subject && v.axis_id === axisId));
    return { state: p.state, bands: [...p.bands], sources: p.sources.map((s) => ({ source_class: s.source_class, host: s.host, observed_on: s.observed_on })) };
  };
  const both = (subject) => ({ x: place(subject, axes.x.axis_id), y: place(subject, axes.y.axis_id) });
  return {
    axes: { x: sharedAxis(axes.x, gate), y: sharedAxis(axes.y, gate) },
    bands: [...POSITION_BANDS],
    stale_after_days: POSITION_STALE_DAYS,
    own: both(OWN_SUBJECT),
    competitors: competitors.map((c) => ({ competitor_id: c.competitor_id, ...both(c.competitor_id) }))
  };
}
function serializeSharedLandscape(doc) {
  return `${JSON.stringify(doc, null, 2)}
`;
}
function shareLandscape(ws, input) {
  assertOwnerProcess();
  const landscape = buildSharedLandscape(ws, { capability: input.capability, now: input.now });
  const text2 = serializeSharedLandscape(landscape);
  if (!validSharedLandscape(JSON.parse(text2))) throw new CompetitiveError("invalid_record", "The shared landscape did not pass its own shape check. Nothing was written.");
  const file = path2.join(ws.root, ...SHARED_LANDSCAPE_PATH.split("/"));
  let previous = null;
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new CompetitiveError("unsafe_path", `${SHARED_LANDSCAPE_PATH} is not a regular file. Nothing was written.`);
    previous = fs.readFileSync(file, "utf8");
  } catch (error) {
    if (error instanceof CompetitiveError) throw error;
    previous = null;
  }
  const changed = previous !== text2;
  if (changed && !input.dryRun) writeVaultFile(ws, file, text2, false);
  return { path: SHARED_LANDSCAPE_PATH, landscape, written: changed && !input.dryRun, changed };
}
var ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
var MARKET = /^(?:[A-Z]{2}|GLOBAL)$/;
var CURRENCY = /^[A-Z]{3}$/;
var SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
function isObj(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function exactKeys(value, keys) {
  const own = Object.keys(value);
  return own.length === keys.length && own.every((key) => keys.includes(key));
}
var KEYS = {
  root: ["schema", "schema_version", "kind", "brand_slug", "as_of", "criteria", "competitors", "prices", "not_shared", "withheld_text", "authorizes"],
  competitor: ["competitor_id", "display_name", "relationship", "geographic_relevance", "markets", "official_domain", "assessment", "cells"],
  cell: ["criterion", "state", "labels", "sources"],
  source: ["source_class", "host", "observed_on"],
  prices: ["rows", "ranked", "currency_conversion"],
  price: ["competitor_id", "offer_name", "amount", "currency", "market", "billing_period", "billing_commitment", "tax_inclusion", "promotion", "feature_scope", "rate_label", "state", "source"],
  not_shared: ["candidates", "disputed", "archived"],
  positioning: ["axes", "bands", "stale_after_days", "own", "competitors"],
  axes: ["x", "y"],
  axis: ["label", "low", "high"],
  localized: ["en", "fa", "tr"],
  pair: ["x", "y"],
  placed: ["competitor_id", "x", "y"],
  placement: ["state", "bands", "sources"]
};
function text(value, max) {
  return typeof value === "string" && value.length > 0 && value.length <= max && ![...value].some((ch) => ch.charCodeAt(0) < 32);
}
function enumList(value, allowed) {
  return Array.isArray(value) && value.length <= allowed.length && value.every((item) => allowed.includes(item));
}
function count(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 1e5;
}
function validHost(value) {
  if (typeof value !== "string") return false;
  try {
    return validateDomain(value) === value;
  } catch {
    return false;
  }
}
function validSource(value) {
  if (!isObj(value) || !exactKeys(value, KEYS.source)) return false;
  if (!(value.source_class === null || SOURCE_CLASSES.includes(value.source_class))) return false;
  if (value.host !== null && !validHost(value.host)) return false;
  return typeof value.observed_on === "string" && ISO_DAY.test(value.observed_on);
}
function validCell(value, criterion) {
  return isObj(value) && exactKeys(value, KEYS.cell) && value.criterion === criterion && SHARED_CELL_STATES.includes(value.state) && Array.isArray(value.labels) && value.labels.length <= SHARED_LIMITS.maxLabelsPerCell && value.labels.every((label) => text(label, COMPETITIVE_LIMITS.maxLabelChars)) && Array.isArray(value.sources) && value.sources.length <= SHARED_LIMITS.maxSourcesPerCell && value.sources.every(validSource);
}
function validCompetitor(value) {
  return isObj(value) && exactKeys(value, KEYS.competitor) && typeof value.competitor_id === "string" && COMPETITOR_ID.test(value.competitor_id) && text(value.display_name, COMPETITIVE_LIMITS.maxNameChars) && enumList(value.relationship, RELATIONSHIPS) && enumList(value.geographic_relevance, GEOGRAPHIES) && Array.isArray(value.markets) && value.markets.length <= COMPETITIVE_LIMITS.maxMarkets && value.markets.every((m) => typeof m === "string" && MARKET.test(m)) && (value.official_domain === null || validHost(value.official_domain)) && SHARED_ASSESSMENTS.includes(value.assessment) && Array.isArray(value.cells) && value.cells.length === SHARED_CRITERIA.length && value.cells.every((cell, index) => validCell(cell, SHARED_CRITERIA[index]));
}
function validPrice(value, ids) {
  return isObj(value) && exactKeys(value, KEYS.price) && typeof value.competitor_id === "string" && ids.has(value.competitor_id) && text(value.offer_name, COMPETITIVE_LIMITS.maxOfferChars) && typeof value.amount === "number" && Number.isFinite(value.amount) && value.amount >= 0 && value.amount <= 1e12 && typeof value.currency === "string" && CURRENCY.test(value.currency) && typeof value.market === "string" && MARKET.test(value.market) && value.market !== "GLOBAL" && BILLING_PERIODS.includes(value.billing_period) && BILLING_COMMITMENTS.includes(value.billing_commitment) && TAX_INCLUSIONS.includes(value.tax_inclusion) && PROMOTIONS.includes(value.promotion) && (value.feature_scope === null || text(value.feature_scope, COMPETITIVE_LIMITS.maxScopeChars)) && RATE_LABELS.includes(value.rate_label) && SHARED_PRICE_STATES.includes(value.state) && validSource(value.source);
}
function validLocalized(value, max) {
  return isObj(value) && exactKeys(value, KEYS.localized) && text(value.en, max) && (value.fa === null || text(value.fa, max)) && (value.tr === null || text(value.tr, max));
}
function validAxis(value) {
  return isObj(value) && exactKeys(value, KEYS.axis) && validLocalized(value.label, POSITIONING_LIMITS.maxAxisLabelChars) && validLocalized(value.low, POSITIONING_LIMITS.maxPoleChars) && validLocalized(value.high, POSITIONING_LIMITS.maxPoleChars);
}
function validPlacement(value) {
  if (!isObj(value) || !exactKeys(value, KEYS.placement)) return false;
  if (!PLACEMENT_STATES.includes(value.state)) return false;
  const bands = value.bands;
  if (!Array.isArray(bands) || !bands.every((b) => POSITION_BANDS.includes(b))) return false;
  const order = bands.map((b) => POSITION_BANDS.indexOf(b));
  if (!order.every((n, i) => i === 0 || n > order[i - 1])) return false;
  const sources = value.sources;
  if (!Array.isArray(sources) || sources.length > POSITIONING_LIMITS.maxSourcesPerPlacement || !sources.every(validSource)) return false;
  if (value.state === "unknown" || value.state === "needs_review") return bands.length === 0 && sources.length === 0;
  if (value.state === "conflicting") return bands.length >= 1 && sources.length >= 1;
  return bands.length === 1 && sources.length >= 1;
}
function validPair(value, keys) {
  return isObj(value) && exactKeys(value, keys) && validPlacement(value.x) && validPlacement(value.y);
}
function validPositioning(value, ids) {
  if (!isObj(value) || !exactKeys(value, KEYS.positioning)) return false;
  const axes = value.axes;
  if (!isObj(axes) || !exactKeys(axes, KEYS.axes) || !validAxis(axes.x) || !validAxis(axes.y)) return false;
  if (!Array.isArray(value.bands) || value.bands.length !== POSITION_BANDS.length || !value.bands.every((b, i) => b === POSITION_BANDS[i])) return false;
  if (!(typeof value.stale_after_days === "number" && Number.isInteger(value.stale_after_days) && value.stale_after_days > 0 && value.stale_after_days <= 3650)) return false;
  if (!validPair(value.own, KEYS.pair)) return false;
  const list = value.competitors;
  if (!Array.isArray(list) || list.length > ids.size) return false;
  const seen = /* @__PURE__ */ new Set();
  for (const entry of list) {
    if (!isObj(entry) || !validPair(entry, KEYS.placed) || typeof entry.competitor_id !== "string" || !ids.has(entry.competitor_id) || seen.has(entry.competitor_id)) return false;
    seen.add(entry.competitor_id);
  }
  return true;
}
function validSharedLandscape(value) {
  if (!isObj(value)) return false;
  const hasPositioning = Object.prototype.hasOwnProperty.call(value, "positioning");
  const prices = value.prices;
  const notShared = value.not_shared;
  if (!(exactKeys(value, hasPositioning ? [...KEYS.root, "positioning"] : KEYS.root) && value.schema === SHARED_LANDSCAPE_SCHEMA && value.schema_version === 1 && value.kind === "competitive_shared_landscape" && typeof value.brand_slug === "string" && SLUG.test(value.brand_slug) && (value.as_of === null || typeof value.as_of === "string" && ISO_DAY.test(value.as_of)) && Array.isArray(value.criteria) && value.criteria.length === SHARED_CRITERIA.length && value.criteria.every((c, i) => c === SHARED_CRITERIA[i]) && Array.isArray(value.competitors) && value.competitors.length <= COMPETITIVE_LIMITS.maxCandidates && value.competitors.every(validCompetitor) && isObj(prices) && exactKeys(prices, KEYS.prices) && prices.ranked === false && prices.currency_conversion === "none" && Array.isArray(prices.rows) && prices.rows.length <= SHARED_LIMITS.maxPrices && isObj(notShared) && exactKeys(notShared, KEYS.not_shared) && count(notShared.candidates) && count(notShared.disputed) && count(notShared.archived) && count(value.withheld_text) && Array.isArray(value.authorizes) && value.authorizes.length === 0)) {
    return false;
  }
  const ids = new Set(value.competitors.map((c) => c.competitor_id));
  if (ids.size !== value.competitors.length) return false;
  if (hasPositioning && !validPositioning(value.positioning, ids)) return false;
  return prices.rows.every((row) => validPrice(row, ids));
}
function readSharedLandscape(root, brandSlug) {
  const file = path2.join(root, ...SHARED_LANDSCAPE_PATH.split("/"));
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch {
    return { state: "not_shared" };
  }
  if (stat.isSymbolicLink()) return { state: "withheld", reason: "symlink" };
  if (!stat.isFile() || stat.size > SHARED_LIMITS.maxFileBytes) return { state: "withheld", reason: "unreadable" };
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { state: "withheld", reason: "unreadable" };
  }
  if (!validSharedLandscape(doc)) return { state: "withheld", reason: "invalid_record" };
  if (doc.brand_slug !== brandSlug) return { state: "withheld", reason: "wrong_brand" };
  const copySource = (s) => ({ source_class: s.source_class, host: s.host, observed_on: s.observed_on });
  const landscape = {
    schema: SHARED_LANDSCAPE_SCHEMA,
    schema_version: 1,
    kind: "competitive_shared_landscape",
    brand_slug: doc.brand_slug,
    as_of: doc.as_of,
    criteria: [...SHARED_CRITERIA],
    competitors: doc.competitors.map((c) => ({
      competitor_id: c.competitor_id,
      display_name: c.display_name,
      relationship: [...c.relationship],
      geographic_relevance: [...c.geographic_relevance],
      markets: [...c.markets],
      official_domain: c.official_domain,
      assessment: c.assessment,
      cells: c.cells.map((cell) => ({ criterion: cell.criterion, state: cell.state, labels: [...cell.labels], sources: cell.sources.map(copySource) }))
    })),
    prices: {
      rows: doc.prices.rows.map((p) => ({
        competitor_id: p.competitor_id,
        offer_name: p.offer_name,
        amount: p.amount,
        currency: p.currency,
        market: p.market,
        billing_period: p.billing_period,
        billing_commitment: p.billing_commitment,
        tax_inclusion: p.tax_inclusion,
        promotion: p.promotion,
        feature_scope: p.feature_scope,
        rate_label: p.rate_label,
        state: p.state,
        source: copySource(p.source)
      })),
      ranked: false,
      currency_conversion: "none"
    },
    not_shared: { candidates: doc.not_shared.candidates, disputed: doc.not_shared.disputed, archived: doc.not_shared.archived },
    withheld_text: doc.withheld_text,
    authorizes: []
  };
  if (doc.positioning) {
    const pos = doc.positioning;
    const loc = (l) => ({ en: l.en, fa: l.fa, tr: l.tr });
    const axis = (a) => ({ label: loc(a.label), low: loc(a.low), high: loc(a.high) });
    const placed = (p) => ({ state: p.state, bands: [...p.bands], sources: p.sources.map(copySource) });
    landscape.positioning = {
      axes: { x: axis(pos.axes.x), y: axis(pos.axes.y) },
      bands: [...POSITION_BANDS],
      stale_after_days: pos.stale_after_days,
      own: { x: placed(pos.own.x), y: placed(pos.own.y) },
      competitors: pos.competitors.map((c) => ({ competitor_id: c.competitor_id, x: placed(c.x), y: placed(c.y) }))
    };
  }
  const axisTexts = landscape.positioning ? [landscape.positioning.axes.x, landscape.positioning.axes.y].flatMap((a) => [a.label, a.low, a.high]).flatMap((l) => [l.en, l.fa ?? "", l.tr ?? ""]) : [];
  const texts = [...axisTexts, ...landscape.competitors.flatMap((c) => [c.display_name, ...c.cells.flatMap((cell) => cell.labels)]), ...landscape.prices.rows.flatMap((p) => [p.offer_name, p.feature_scope ?? ""])];
  if (texts.some((t) => t && unsafeText(t))) return { state: "withheld", reason: "unsafe_text" };
  return { state: "shared", landscape };
}

export {
  renderMemo,
  AXIS_KEYS,
  POSITION_BANDS,
  OWN_SUBJECT,
  POSITION_STALE_DAYS,
  validateAxes,
  readAxes,
  setAxes,
  addPosition,
  removePosition,
  placementOf,
  positioningLandscape,
  SHARED_LANDSCAPE_SCHEMA,
  SHARED_CRITERIA,
  shareLandscape,
  readSharedLandscape
};
