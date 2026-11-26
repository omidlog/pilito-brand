import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  AXIS_KEYS,
  OWN_SUBJECT,
  POSITION_BANDS,
  POSITION_STALE_DAYS,
  addPosition,
  placementOf,
  positioningLandscape,
  readAxes,
  removePosition,
  renderMemo,
  setAxes,
  shareLandscape,
  validateAxes
} from "./chunk-3RZ74H24.mjs";
import "./chunk-45KEDXCJ.mjs";
import "./chunk-F3UDVADT.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-D3U2JFTZ.mjs";
import "./chunk-Z4VEC43P.mjs";
import {
  CompetitiveError,
  DIMENSION_LABELS,
  HEADINGS,
  MEMO_PURPOSES,
  NETWORK_ENV,
  SeoError,
  addCandidate,
  asLang,
  buildCompetitiveMemo,
  buildLandscape,
  classifyCandidate,
  fill2 as fill,
  getCompetitiveContext,
  importSeoNames,
  linkEvidence,
  readCandidate,
  scanCandidates,
  selectAdapter,
  setScope,
  setStatus,
  verifyDomain
} from "./chunk-ZYAYDNGS.mjs";
import {
  ResearchError
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  KnowledgeError,
  openWorkspace
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/competitive.ts
import { parseArgs } from "node:util";
import fs from "node:fs";
var HELP = `brand:competitive <command> [options]

  scope --purposes identity,pricing,\u2026          what the research is for (identity, positioning, marketing,
                                              pricing, seo, expansion); scopes the gap checklist
  add --name <name> [--relationship direct,\u2026] [--geography local|regional|international]
      [--markets TR,US] [--domain rival.com] [--source owner_named|research_lead]
      [--distinct-from <cmp_id> --reason "<why another business>"]
                                              a name becomes an unverified candidate
  classify --id <cmp_id> [--relationship \u2026] [--geography \u2026] [--markets \u2026]
  link --id <cmp_id> --note <kn_id|knowledge:kn_\u2026@sha> --claim <claim_key> --dimension <d> --label "<short>"
       [--kind observed_claim|inference]
       [--offer Pro --amount 12 --currency USD --market US --period month|year|one_time|unknown
        --commitment monthly|annual|none|unknown --tax included|excluded|unknown
        --promotion none_observed|promotional|unknown --feature-scope "<short>"]   (dimension public_price)
  verify-domain --id <cmp_id> --note <kn_\u2026> --claim <claim_key> [--domain rival.com]
                                              a source fetched from the domain verifies it
  status --id <cmp_id> --status candidate|owner_reviewed|disputed|archived [--reason "<why>"]
  list                                        candidates with assessment and domain state
  show --id <cmp_id>                          one candidate with every cited observation
  matrix [--lang en|fa|tr]                    landscape: matrix, prices (never ranked), gaps, limits
  context --purpose <p> [--market TR] [--lang \u2026]
                                              one purpose's projection (identity, positioning, marketing,
                                              pricing, seo, expansion); JSON with --json
  memo --purpose marketing|pricing|seo|identity [--market TR] [--lang en|fa|tr]
                                              a draft read against approved facts; prints, writes nothing
  import-seo-names [--dry-run]                add seo.competitors.named answers as unverified candidates
                                              (owner assumptions; existing names are reported, never merged)
  share [--dry-run]                           write a quote-free, redacted landscape of owner-reviewed
                                              competitors to brand/competitive/shared/landscape.json for
                                              Studio's comparison matrix (you review and commit it)

Positioning map (owner decision D2; you choose the axes, the tool never does):
  axes set --x-id <id> --x-label "<label>" --x-low "<pole>" --x-high "<pole>"
           --y-id <id> --y-label "<label>" --y-low "<pole>" --y-high "<pole>"
           [--x-label-fa \u2026 --x-label-tr \u2026 --x-low-fa \u2026 (any of label/low/high \xD7 fa/tr)]
           [--x-rationale "<why>" --y-rationale "<why>"]      (rationale stays private)
  axes set --file <axes.json>                 the same as JSON: {"x": {axis_id, label: {en, fa, tr}, low, high,
                                              rationale}, "y": {\u2026}}
  axes show                                   your axes (brand/.private/competitive/axes.json)
  axes validate [--file <axes.json>]          check the record (or a draft file) without writing
  position add --subject own|<cmp_id> --axis <axis_id> --band low|lower_mid|mid|upper_mid|high
               --note <kn_id|knowledge:kn_\u2026@sha> --claim <claim_key>
                                              one band on one axis, citing a research note; no numbers
  position remove --position <pos_id>
  positions                                   every position and how its source reads now
  Unknown is never plotted. Sources older than ${POSITION_STALE_DAYS} days are marked stale; disagreeing sources are
  shown as a range, never resolved. share adds the axis labels and placements (no rationale, ids or quotes).

Dimensions: offer, audience, geography, public_price, public_message, visual_language, observable_channels,
strength_hypothesis, weakness_hypothesis (the last two are inferences).
Record sources first: npm run brand:seo -- research capture|replay (topic market_observation).
No network is used here; ${NETWORK_ENV} only changes what the gap list says about research.
Add --json for machine-readable output. Refused while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...args] = process.argv.slice(2);
var sub = command === "axes" || command === "position" ? args[0] : void 0;
var rest = sub !== void 0 ? args.slice(1) : args;
var root = process.cwd();
var OPTIONS = {
  json: { type: "boolean", default: false },
  lang: { type: "string" },
  purposes: { type: "string" },
  name: { type: "string" },
  relationship: { type: "string" },
  geography: { type: "string" },
  markets: { type: "string" },
  domain: { type: "string" },
  source: { type: "string" },
  "distinct-from": { type: "string" },
  reason: { type: "string" },
  id: { type: "string" },
  note: { type: "string" },
  claim: { type: "string" },
  dimension: { type: "string" },
  label: { type: "string" },
  kind: { type: "string" },
  offer: { type: "string" },
  amount: { type: "string" },
  currency: { type: "string" },
  market: { type: "string" },
  period: { type: "string" },
  commitment: { type: "string" },
  tax: { type: "string" },
  promotion: { type: "string" },
  "feature-scope": { type: "string" },
  status: { type: "string" },
  purpose: { type: "string" },
  "dry-run": { type: "boolean", default: false },
  file: { type: "string" },
  subject: { type: "string" },
  axis: { type: "string" },
  band: { type: "string" },
  position: { type: "string" },
  ...axisFlags()
};
function axisFlags() {
  const out = {};
  for (const axis of ["x", "y"]) {
    out[`${axis}-id`] = { type: "string" };
    out[`${axis}-rationale`] = { type: "string" };
    for (const part of ["label", "low", "high"]) for (const lang of ["", "-fa", "-tr"]) out[`${axis}-${part}${lang}`] = { type: "string" };
  }
  return out;
}
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function need(values2, key) {
  const value = values2[key];
  if (typeof value !== "string" || !value) usage(`--${key} is required.`);
  return value;
}
function print(values2, data, text) {
  console.log(values2.json ? JSON.stringify(data, null, 2) : text());
}
function landscapeText(view) {
  const dim = (d) => DIMENSION_LABELS[d][view.lang];
  const h = (key, vars = {}) => fill(HEADINGS[key][view.lang], vars);
  const lines = [
    h("title", { name: view.brand_slug, state: view.state }),
    h("research", { state: `${view.research.adapter} ${view.research.state}`, reason: view.research.reason ? ` \u2014 ${view.research.reason}` : "" }),
    h("scope", { purposes: view.scope.purposes.join(", ") || h("scope_not_set"), fact: view.target_market.fact_id, state: view.target_market.state }),
    ""
  ];
  for (const c of view.candidates) {
    lines.push(`${c.display_name} [${c.competitor_id}] ${c.assessment}; ${c.relationship.join("/") || "?"}; ${c.markets.join(",") || "?"}; ${c.official_domain ?? c.domain_state}`);
    for (const cell of view.matrix.filter((m) => m.competitor_id === c.competitor_id && m.state !== "unknown")) lines.push(`  ${dim(cell.dimension)}: ${cell.state}`);
  }
  if (view.prices.rows.length) {
    lines.push("", h("prices", { state: view.prices.comparison, reason: view.prices.reasons.length ? ` \u2014 ${view.prices.reasons.join(", ")}` : "" }));
    for (const row of view.prices.rows) lines.push(`  ${row.offer_name}: ${row.amount} ${row.currency} ${row.billing_period}/${row.billing_commitment} ${row.market}, ${h("observed_on", { date: row.observed_at.slice(0, 10) })}, ${row.cell}${row.caveats.length ? ` (${row.caveats.join(", ")})` : ""}`);
  }
  if (view.gaps.length) lines.push("", h("gaps"), ...view.gaps.map((g) => `  - ${g.text}`));
  lines.push("", h("never"), ...view.prohibited_inferences.map((p) => `  - ${p.text}`));
  return lines.join("\n");
}
function priceOf(values2) {
  if (values2.amount === void 0 && values2.currency === void 0 && values2.offer === void 0) return null;
  return {
    offer_name: values2.offer,
    amount: values2.amount,
    currency: values2.currency,
    market: values2.market,
    billing_period: values2.period,
    billing_commitment: values2.commitment,
    tax_inclusion: values2.tax,
    promotion: values2.promotion,
    feature_scope: values2["feature-scope"]
  };
}
function axesInput(values2) {
  if (values2.file) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(values2.file, "utf8"));
    } catch {
      usage(`--file ${values2.file} is not readable JSON.`);
    }
    const doc = raw && typeof raw === "object" ? raw : {};
    return { x: doc.x, y: doc.y };
  }
  const v = values2;
  const loc = (axis2, part) => ({ en: v[`${axis2}-${part}`], fa: v[`${axis2}-${part}-fa`] ?? null, tr: v[`${axis2}-${part}-tr`] ?? null });
  const axis = (key) => ({ axis_id: v[`${key}-id`], label: loc(key, "label"), low: loc(key, "low"), high: loc(key, "high"), rationale: v[`${key}-rationale`] ?? null });
  return { x: axis("x"), y: axis("y") };
}
function axesText(axes) {
  return AXIS_KEYS.map((key) => {
    const a = axes[key];
    const langs = (l) => [l.en, l.fa ? `fa: ${l.fa}` : null, l.tr ? `tr: ${l.tr}` : null].filter(Boolean).join(" \xB7 ");
    return `${key.toUpperCase()} ${a.axis_id}: ${langs(a.label)}
   low  ${langs(a.low)}
   high ${langs(a.high)}${a.rationale ? "\n   rationale (private): " + a.rationale : ""}`;
  }).join("\n");
}
function landscape(ws, values2) {
  return buildLandscape(ws, { capability: selectAdapter({}).capability(ws.now()), lang: asLang(values2.lang) });
}
function run(ws, values2) {
  switch (command) {
    case "scope": {
      const scope = setScope(ws, need(values2, "purposes"));
      print(values2, { ok: true, scope }, () => `Scope: ${scope.purposes.join(", ")}. It only scopes the gap checklist.`);
      return;
    }
    case "add": {
      const record = addCandidate(ws, {
        display_name: need(values2, "name"),
        relationship: values2.relationship,
        geography: values2.geography,
        markets: values2.markets,
        domain: values2.domain ?? null,
        source: values2.source,
        distinct_from: values2["distinct-from"] ?? null,
        reason: values2.reason ?? null
      });
      print(values2, { ok: true, candidate: record }, () => `Added ${record.display_name} as ${record.competitor_id}: an unverified candidate. Link research notes with: link --id ${record.competitor_id} \u2026`);
      return;
    }
    case "classify": {
      const record = classifyCandidate(ws, { competitor_id: need(values2, "id"), relationship: values2.relationship, geography: values2.geography, markets: values2.markets });
      print(values2, { ok: true, candidate: record }, () => `${record.display_name}: ${record.relationship.join("/") || "relationship ?"}; ${record.geographic_relevance.join("/") || "geography ?"}; markets ${record.markets.join(",") || "?"}.`);
      return;
    }
    case "link": {
      const out = linkEvidence(ws, { competitor_id: need(values2, "id"), note: need(values2, "note"), claim_key: need(values2, "claim"), dimension: need(values2, "dimension"), statement_kind: values2.kind, label: need(values2, "label"), price: priceOf(values2) });
      print(values2, { ok: true, outcome: out.outcome, observation: out.observation }, () => `${out.outcome === "linked" ? "Linked" : "Already linked"} ${out.observation.observation_id}: ${out.observation.dimension} cites knowledge:${out.observation.evidence.note_id}@${out.observation.evidence.revision} (${out.observation.evidence.claim_key}). No quote was copied.`);
      return;
    }
    case "verify-domain": {
      const record = verifyDomain(ws, { competitor_id: need(values2, "id"), domain: values2.domain ?? null, note: need(values2, "note"), claim_key: need(values2, "claim") });
      print(values2, { ok: true, candidate: record }, () => `${record.display_name}: ${record.domain_claim} is verified while ${record.domain_evidence.note_id} stays current.`);
      return;
    }
    case "status": {
      const record = setStatus(ws, { competitor_id: need(values2, "id"), status: need(values2, "status"), reason: values2.reason ?? null });
      print(values2, { ok: true, candidate: record }, () => `${record.display_name}: ${record.status}. This records assessment progress; it approves nothing.`);
      return;
    }
    case "list": {
      const view = landscape(ws, values2);
      const skipped = scanCandidates(ws).skipped;
      print(
        values2,
        { ok: true, state: view.state, candidates: view.candidates.map(({ observations, ...c }) => ({ ...c, observations: observations.length })), skipped },
        () => view.candidates.length ? view.candidates.map((c) => `${c.competitor_id}  ${c.display_name}  ${c.assessment}  domain ${c.official_domain ?? c.domain_state}  ${c.observations.length} observation(s)`).join("\n") : "No candidates yet."
      );
      return;
    }
    case "show": {
      const id = need(values2, "id");
      readCandidate(ws, id);
      const view = landscape(ws, values2);
      const candidate = view.candidates.find((c) => c.competitor_id === id);
      print(
        values2,
        { ok: true, candidate },
        () => [
          `${candidate.display_name} [${candidate.competitor_id}] ${candidate.assessment}; domain ${candidate.official_domain ?? candidate.domain_state}`,
          ...candidate.observations.map((o) => `  ${o.observation_id} ${o.dimension} ${o.statement_kind}: ${o.label} \u2014 ${o.cell} (${o.ref_state}, ${o.source_class ?? "source unreadable"}) ${o.evidence.ref} ${o.evidence.claim_key}`),
          ...candidate.needs_review.map((n) => `  ! ${n}`)
        ].join("\n")
      );
      return;
    }
    case "matrix": {
      const view = landscape(ws, values2);
      print(values2, { ok: true, landscape: view }, () => landscapeText(view));
      return;
    }
    case "context": {
      const ctx = getCompetitiveContext(ws, need(values2, "purpose"), { capability: selectAdapter({}).capability(ws.now()), lang: asLang(values2.lang), market: values2.market ?? null });
      print(
        values2,
        { ok: true, context: ctx },
        () => [
          `${ctx.purpose} context for ${ctx.brand_slug}${ctx.market ? ` (${ctx.market})` : ""}: ${ctx.state}. Draft input, owner-only; authorizes nothing.`,
          `${ctx.competitors.length} competitor(s), ${ctx.freshness.usable} usable observation(s), ${ctx.freshness.historical} historical, ${ctx.freshness.needs_review} needing review, ${ctx.freshness.conflicting} conflicting; source digest ${ctx.source_digest.slice(0, 12)}`,
          ...ctx.next_research.map((s) => `  - ${s.text}`)
        ].join("\n")
      );
      return;
    }
    case "memo": {
      const purpose = need(values2, "purpose");
      if (!MEMO_PURPOSES.includes(purpose)) usage(`--purpose must be one of ${MEMO_PURPOSES.join(", ")}.`);
      const memo = buildCompetitiveMemo(ws, purpose, { capability: selectAdapter({}).capability(ws.now()), lang: asLang(values2.lang), market: values2.market ?? null });
      print(values2, { ok: true, memo }, () => renderMemo(memo));
      return;
    }
    case "import-seo-names": {
      const out = importSeoNames(ws, { dryRun: values2["dry-run"] });
      print(
        values2,
        { ok: true, dry_run: values2["dry-run"], ...out },
        () => out.interview === "not_answered" ? "seo.competitors.named is not answered (or is unknown). Nothing to import." : [...out.results.map((r) => `${r.outcome.padEnd(10)} ${r.name}${r.competitor_id ? ` ${r.competitor_id}` : ""}${r.reason ? ` \u2014 ${r.reason}` : ""}`), "Imported names are unverified candidates (owner assumptions), not search evidence."].join("\n")
      );
      return;
    }
    case "share": {
      const out = shareLandscape(ws, { capability: selectAdapter({}).capability(ws.now()), dryRun: values2["dry-run"] });
      const doc = out.landscape;
      print(
        values2,
        { ok: true, dry_run: values2["dry-run"], path: out.path, written: out.written, changed: out.changed, landscape: doc },
        () => [
          `${values2["dry-run"] ? "Preview of" : out.written ? "Wrote" : "Unchanged:"} ${out.path}: ${doc.competitors.length} owner-reviewed competitor(s), ${doc.prices.rows.length} public price(s), listed, never ranked or converted.`,
          `Not shared: ${doc.not_shared.candidates} candidate(s), ${doc.not_shared.disputed} disputed, ${doc.not_shared.archived} archived. ${doc.withheld_text} label(s) left out (quote match or safety scan).`,
          "No quotes, note ids, URLs or reasons are in the file. Review the diff, then commit it; Studio shows it after the merge."
        ].join("\n")
      );
      return;
    }
    case "axes": {
      if (sub === "set") {
        const doc = setAxes(ws, axesInput(values2));
        print(values2, { ok: true, axes: doc }, () => `Saved your axes to brand/.private/competitive/axes.json.
${axesText(doc)}
Record positions with: position add --subject \u2026 --axis ${doc.x.axis_id} --band \u2026 --note \u2026 --claim \u2026`);
        return;
      }
      if (sub === "show") {
        const doc = readAxes(ws);
        print(values2, { ok: true, axes: doc }, () => doc ? axesText(doc) : "No axes yet. Choose two with: axes set \u2026");
        return;
      }
      if (sub === "validate") {
        if (values2.file) {
          const axes = validateAxes(axesInput(values2));
          print(values2, { ok: true, valid: true, axes }, () => `${values2.file} is a valid pair of axes. Nothing was written.
${axesText(axes)}`);
        } else {
          const doc = readAxes(ws);
          print(values2, { ok: true, valid: Boolean(doc), axes: doc }, () => doc ? `axes.json is valid.
${axesText(doc)}` : "No axes yet. Choose two with: axes set \u2026");
        }
        return;
      }
      usage("axes needs set, show or validate.");
      return;
    }
    case "position": {
      if (sub === "add") {
        const out = addPosition(ws, { subject: need(values2, "subject"), axis_id: need(values2, "axis"), band: need(values2, "band"), note: need(values2, "note"), claim_key: need(values2, "claim") });
        print(values2, { ok: true, outcome: out.outcome, position: out.position }, () => `${out.outcome === "recorded" ? "Recorded" : "Already recorded"} ${out.position.position_id}: ${out.position.subject} is ${out.position.band} on ${out.position.axis_id}, citing knowledge:${out.position.evidence.note_id}@${out.position.evidence.revision} (${out.position.evidence.claim_key}). No quote was copied.`);
        return;
      }
      if (sub === "remove") {
        const removed = removePosition(ws, need(values2, "position"));
        print(values2, { ok: true, removed }, () => `Removed ${removed.position_id}.`);
        return;
      }
      usage("position needs add or remove.");
      return;
    }
    case "positions": {
      const domains = new Map(scanCandidates(ws).records.map((r) => [r.competitor_id, r.domain_claim]));
      const names = new Map(scanCandidates(ws).records.map((r) => [r.competitor_id, r.display_name]));
      const { axes, views, retired } = positioningLandscape(ws, { domains, publicHost: () => null });
      const subjects = [OWN_SUBJECT, ...new Set(views.map((v) => v.subject).filter((s) => s !== OWN_SUBJECT))];
      print(values2, { ok: true, axes, positions: views, retired }, () => {
        if (!axes) return "No axes yet. Choose two with: axes set \u2026";
        const lines = [`Bands: ${POSITION_BANDS.join(", ")}. Stale after ${POSITION_STALE_DAYS} days.`];
        for (const subject of subjects) {
          const label = subject === OWN_SUBJECT ? "Your brand" : names.get(subject) ?? subject;
          const place = (axisId) => placementOf(views.filter((v) => v.subject === subject && v.axis_id === axisId));
          const x = place(axes.x.axis_id);
          const y = place(axes.y.axis_id);
          lines.push(`${label}: ${axes.x.axis_id} ${x.state}${x.bands.length ? ` (${x.bands.join("\u2013")})` : ""}; ${axes.y.axis_id} ${y.state}${y.bands.length ? ` (${y.bands.join("\u2013")})` : ""}`);
          for (const v of views.filter((item) => item.subject === subject)) lines.push(`  ${v.position_id} ${v.axis_id} ${v.band} \u2014 ${v.state}, ${v.ref} ${v.claim_key} (${v.observed_on})`);
        }
        if (retired) lines.push(`${retired} position(s) cite an axis you no longer use; they are kept and not shown.`);
        return lines.join("\n");
      });
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
if (!command || command === "help" || command === "--help") {
  console.log(HELP);
  process.exit(command ? 0 : 2);
}
var values;
try {
  values = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true }).values;
} catch (error) {
  usage(error.message);
}
try {
  run(openWorkspace(root), values);
} catch (error) {
  if (error instanceof CompetitiveError || error instanceof KnowledgeError || error instanceof ResearchError || error instanceof SeoError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing about the brand was changed.`);
  process.exit(1);
}
