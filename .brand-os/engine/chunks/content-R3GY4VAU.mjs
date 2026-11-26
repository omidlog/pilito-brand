import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readOwnerProof
} from "./chunk-EU3MMEEN.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-RFT54P4C.mjs";
import "./chunk-D3U2JFTZ.mjs";
import {
  AGENT_TEXT,
  BATCH_TEXT,
  METRIC_KEYS,
  batchConflicts,
  listMetrics,
  listObservations,
  parseBatchItem,
  planBatch,
  recordSlotFeedback,
  recordSlotMetrics,
  shareStrategy,
  shareWeek,
  storeBatch
} from "./chunk-BDOF2PHO.mjs";
import "./chunk-Z4VEC43P.mjs";
import {
  CAL_TEXT,
  CLI_TEXT,
  CalendarError,
  MIX_LABELS,
  OBJECTIVE_LABELS,
  PLAYBOOK_TEXT,
  ROLE_LABELS,
  approveWeek,
  approvedWeekEntry,
  brandSettings,
  buildContentStrategy,
  contentCalendar,
  contentLang,
  contentStrategyView,
  fill,
  listWeeks,
  loadWeekRecord,
  parseCadence,
  parseChannels,
  parseFormats,
  planCalendar,
  playbookDocument,
  problemText,
  proposeWeek,
  rejectWeek,
  reviewWeek,
  scanWeeks,
  servedContentViews,
  validateWeekId
} from "./chunk-ZYAYDNGS.mjs";
import {
  proposeRevision
} from "./chunk-5OMKZSIF.mjs";
import {
  shareKitApprovals
} from "./chunk-C5LB7EY5.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-6WOO6B6T.mjs";
import {
  readKit
} from "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  CONTENT_CHANNELS,
  KnowledgeError,
  StrategyError,
  openWorkspace,
  validateRevisionNumber,
  validateStrategyId
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/content.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:content <command> [options]

  strategy [--id content-main] [--channels instagram,linkedin] [--cadence instagram=3/week]
           [--formats instagram=reel+carousel] [--languages en,fa] [--markets tr] [--playbook]
           [--out <proposal.json>] [--store]
                                  propose a content strategy from approved facts, with explicit gaps.
                                  --playbook fills role, formats, cadence, objective, mix and KPI names from
                                  the general-practice channel playbook (explicit --formats/--cadence win).
                                  Without --out or --store nothing is written.
  playbook [--channel instagram]  the general-practice channel playbook (not measured for this brand)
  show [--id <id>]                the approved content strategy with its voice rules, resolved from
                                  approved facts (drafts are never shown)

  plan --from YYYY-MM-DD --weeks N [--channels instagram,newsletter] [--strategy <id>] [--research]
       [--out <weeks.json>] [--store]
                                  draft calendar weeks (Monday to Sunday) from the served content strategy.
                                  Without --out or --store nothing is written.
  batch --channel instagram --format reel --count 10 | --item instagram:reel:10 [--item \u2026]
        [--from YYYY-MM-DD] [--pillar <id>] [--strategy <id>] [--research] [--out <weeks.json>] [--store]
                                  draft N slots per channel and format, dated by the approved cadence from
                                  --from (default: next Monday), grouped into weeks. --store refuses when a
                                  target week already has a stored draft or approved week.
  week propose --file <week.json> store one week (an item of the --out weeks list) as a draft
  week review  --week wk-YYYY-MM-DD --revision <n>
  week approve --week wk-YYYY-MM-DD --revision <n> --expect-sha <sha256>
                                  owner proof: BRAND_OS_APPROVAL_PROOF or hidden prompt
  week reject  --week wk-YYYY-MM-DD --revision <n>
  weeks                           every week and revision with its status
  calendar [--from D] [--to D] [--channel instagram]
                                  approved, current weeks only (drafts are never shown)
  share --week wk-YYYY-MM-DD [--dry-run]
                                  copy an approved week's summary to brand/content-calendar/shared (you commit it)
  share --all [--dry-run]                           approved strategies, current weeks and the style kit summary for Studio, in one step
  share-strategy [--id content-main] [--dry-run]
                                  copy the approved, served content strategy revision (channels, pillars, mix,
                                  KPIs, cadence; no drafts, restricted data or fact values) to
                                  brand/content-strategy/shared/<id>.json for Studio (you commit it)
  reports [--week wk-YYYY-MM-DD]  produced/published reports and owner-reported metrics (observations only)

  feedback --week wk-YYYY-MM-DD --slot s01 --text "<your words>" [--verdict like|change_request|reject]
           [--keep hook,tone] [--avoid length,jargon] [--lang fa]
                                  your feedback on a produced slot: a Knowledge note linked to the slot's creative
                                  project. Prints the brand:creative suggest line that turns it into a preference.
  metrics --week wk-YYYY-MM-DD --slot s01 [--views N] [--reach N] [--likes N] [--comments N] [--shares N]
          [--saves N] [--follows N] [--link-clicks N] [--watch-time-s N] [--completion-rate P]
          [--measured-at YYYY-MM-DD] [--source manual|platform_export]
                                  numbers you read off the platform: stored as an owner_reported, not_verified
                                  observation. Never a fact or a claim.

Review and approve with: npm run brand:strategy -- review / approve (owner proof).
Options: --lang en|fa|tr (default: the brand default locale), --json. Refused while ${AGENT_TOKEN_ENV} is set.`;
var OPTIONS = {
  json: { type: "boolean", default: false },
  lang: { type: "string" },
  id: { type: "string" },
  channels: { type: "string" },
  cadence: { type: "string" },
  formats: { type: "string" },
  languages: { type: "string" },
  markets: { type: "string" },
  out: { type: "string" },
  store: { type: "boolean", default: false },
  from: { type: "string" },
  to: { type: "string" },
  weeks: { type: "string" },
  strategy: { type: "string" },
  research: { type: "boolean", default: false },
  file: { type: "string" },
  week: { type: "string" },
  revision: { type: "string" },
  "expect-sha": { type: "string" },
  channel: { type: "string" },
  "dry-run": { type: "boolean", default: false },
  all: { type: "boolean", default: false },
  playbook: { type: "boolean", default: false },
  format: { type: "string" },
  count: { type: "string" },
  item: { type: "string", multiple: true },
  pillar: { type: "string" },
  slot: { type: "string" },
  text: { type: "string" },
  verdict: { type: "string" },
  keep: { type: "string" },
  avoid: { type: "string" },
  views: { type: "string" },
  reach: { type: "string" },
  likes: { type: "string" },
  comments: { type: "string" },
  shares: { type: "string" },
  saves: { type: "string" },
  follows: { type: "string" },
  "link-clicks": { type: "string" },
  "watch-time-s": { type: "string" },
  "completion-rate": { type: "string" },
  "measured-at": { type: "string" },
  source: { type: "string" }
};
var argv = process.argv.slice(2);
var command = argv[0];
var sub = command === "week" ? argv[1] : void 0;
var rest = argv.slice(command === "week" ? 2 : 1);
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function codes(value, flag) {
  if (!value) return void 0;
  const list2 = value.split(",").map((item) => item.trim()).filter(Boolean);
  for (const item of list2) if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(item)) throw new StrategyError("invalid_input", `${flag} takes language or market codes such as en,fa,tr (got ${item}).`);
  return list2;
}
function draftText(draft, lang) {
  const t = (key) => CLI_TEXT[key][lang];
  const block = draft.block;
  const lines = [t("draft_header"), "", `${t("sources")}:`];
  for (const source of draft.sources) lines.push(`  [${source.state}] ${source.fact_id} (${ROLE_LABELS[source.role][lang]})`);
  lines.push("", `${t("pillars")}: ${block.pillars.map((p) => `${p.id} ${p.name}`).join(" \xB7 ") || "\u2014"}`);
  lines.push(`${t("channels")}:`);
  for (const c of block.channels) {
    lines.push(`  ${c.channel}: ${c.formats.join("+") || t("not_decided")}, ${c.cadence ? `${c.cadence.target}/${c.cadence.per}` : t("not_decided")}`);
    if (c.role) lines.push(`    ${c.role}`);
    if (c.objective) lines.push(`    ${OBJECTIVE_LABELS[c.objective][lang]}${c.mix ? ` \xB7 ${c.mix.map((m) => `${MIX_LABELS[m.type][lang]} ${m.share}%`).join(", ")}` : ""}`);
  }
  if (!block.channels.length) lines.push("  \u2014");
  lines.push("", `${t("gaps")}:`);
  if (!draft.gaps.length) lines.push(`  ${t("no_gaps")}`);
  for (const gap of draft.gaps) lines.push(`  - [${gap.reason}] ${gap.field}: ${gap.text}`);
  lines.push("", `${t("notes")}:`, ...draft.notes.map((note) => `  ${note}`));
  return lines.join("\n");
}
function viewText(view, lang) {
  const t = (key) => CLI_TEXT[key][lang];
  const lines = [
    `${view.strategy_id} r${view.revision} (${view.status}) ${view.digests.content_sha256.slice(0, 12)}`,
    `  ${view.languages.join(", ")} \xB7 ${view.validity.valid_from.slice(0, 10)} \u2192 ${view.validity.valid_until.slice(0, 10)}`,
    "",
    `${t("voice")}:`,
    ...view.voice.sources.map((src) => `  ${src.fact_id}: ${src.value}`),
    ...view.voice.do.map((rule) => `  ${t("do")}: ${rule.text}`),
    ...view.voice.dont.map((rule) => `  ${t("dont")}: ${rule.text}`),
    "",
    `${t("banned")}:`,
    ...view.claims.banned.map((rule) => `  - ${rule.text}`),
    ...view.claims.availability_rule ? [`  - ${view.claims.availability_rule}`] : [],
    "",
    `${t("pillars")}: ${view.pillars.map((p) => p.name).join(" \xB7 ") || "\u2014"}`,
    `${t("channels")}:`,
    ...view.channels.map((c) => `  ${c.channel}: ${c.role ?? t("not_decided")}; ${c.formats.join("+") || t("not_decided")}; ${c.cadence ? `${c.cadence.target}/${c.cadence.per}` : t("not_decided")}; ${c.languages.join(",") || t("all")}`),
    "",
    `${t("gaps")}:`,
    ...view.gaps.length ? view.gaps.map((gap) => `  - ${gap.field}: ${gap.text}`) : [`  ${t("no_gaps")}`],
    "",
    ...view.notice.map((line) => `note: ${line}`)
  ];
  return lines.join("\n");
}
function playbookText(doc, lang) {
  const t = (key) => PLAYBOOK_TEXT[key][lang];
  const lines = [t("header"), ""];
  for (const e of doc.entries) {
    lines.push(`${e.channel}`, `  ${t("role")}: ${e.role}`, `  ${t("formats")}: ${e.formats.join(", ")}`);
    lines.push(`  ${t("cadence")}: ${fill(t("cadence_value"), { min: e.cadence.min, max: e.cadence.max, start: e.cadence.start, per: t(e.cadence.per) })}`);
    lines.push(`  ${t("objective")}: ${e.objective.label}`, `  ${t("mix")}: ${e.mix.map((m) => `${m.label} ${m.share}%`).join(", ")}`, `  ${t("kpis")}: ${e.kpis.map((k) => k.label).join(", ")}`);
    lines.push(`  ${t("windows")}: ${e.posting_windows_note}`, `  ${t("craft")}:`, ...e.craft.map((note) => `    - ${note}`), "");
  }
  lines.push(...doc.notice.map((line) => `note: ${line}`));
  return lines.join("\n");
}
function batchItems(values2) {
  const items = (values2.item ?? []).map(parseBatchItem);
  if (values2.format || values2.count) {
    if (!values2.channel || !values2.format || !values2.count) usage("batch needs --channel, --format and --count together (or --item channel:format:count).");
    items.push(parseBatchItem(`${values2.channel}:${values2.format}:${values2.count}`));
  } else if (values2.channel) usage("batch needs --format and --count with --channel.");
  if (!items.length) usage("batch needs --channel, --format and --count, or --item channel:format:count.");
  return items;
}
function batchText(result, lang) {
  const t = (key) => (BATCH_TEXT[key] ?? CAL_TEXT[key] ?? CLI_TEXT[key])[lang];
  const lines = [fill(t("header"), { id: result.strategy.strategy_id, rev: result.strategy.revision, from: result.from })];
  for (const item of result.items) lines.push(`  ${fill(t("item"), { ...item, first: item.first ?? "\u2014", last: item.last ?? "\u2014" })}`);
  lines.push(...result.notes.map((note) => `${t("notes")}: ${note}`));
  for (const week of result.weeks) {
    const c = week.content;
    lines.push("", `${t("week")} ${c.week_id} (${c.week_start} \u2192 ${c.week_end}): ${c.slots.length}`);
    for (const slot of c.slots) lines.push(slotLine(slot, t));
    for (const gap of week.gaps) lines.push(`  - ${gap}`);
  }
  return lines.join("\n");
}
async function ownerProof() {
  return readOwnerProof({ prompt: "Owner approval proof (input hidden): " });
}
function need(values2, key) {
  const value = values2[key];
  if (!value) usage(`--${key} is required.`);
  return value;
}
function channelOf(value) {
  if (!CONTENT_CHANNELS.includes(value)) throw new StrategyError("invalid_input", `--channel is one of ${CONTENT_CHANNELS.join(", ")}.`);
  return value;
}
function slotLine(slot, t, pillarName) {
  const parts = [`${slot.id} ${slot.date} ${slot.channel}/${slot.format ?? t("not_decided")}`, `${pillarName ?? slot.pillar ?? "\u2014"}`, slot.language];
  const cites = [slot.key_message, slot.offer, slot.cta].filter(Boolean).join(", ");
  if (cites) parts.push(cites);
  if (slot.hook) parts.push(`\u201C${slot.hook}\u201D`);
  if (slot.research) parts.push(`${slot.research.observation_id.slice(0, 11)} (${slot.research.confidence})`);
  return `  ${parts.join(" \xB7 ")}`;
}
function planText(plan, lang) {
  const t = (key) => (CAL_TEXT[key] ?? CLI_TEXT[key])[lang];
  const lines = [fill(t("plan_header"), { id: plan.strategy.strategy_id, rev: plan.strategy.revision }), ...plan.notes.map((note) => `${t("notes")}: ${note}`)];
  for (const week of plan.weeks) {
    const c = week.content;
    lines.push("", `${t("week")} ${c.week_id} (${c.week_start} \u2192 ${c.week_end}): ${c.slots.length || t("no_slots")}`);
    for (const slot of c.slots) lines.push(slotLine(slot, t));
    for (const gap of week.gaps) lines.push(`  - ${gap}`);
  }
  return lines.join("\n");
}
function reviewText(review, lang) {
  const t = (key) => (CAL_TEXT[key] ?? CLI_TEXT[key])[lang];
  return [
    `${review.week_id} r${review.revision} (${review.state}) ${review.content_sha256}`,
    `  supersedes: ${review.supersedes_revision ?? "\u2014"} \xB7 approved now: ${review.current_approved ?? "\u2014"} \xB7 slots: ${review.slots}`,
    "",
    `${t("gaps")}:`,
    ...review.gaps.length ? review.gaps.map((gap) => `  - ${gap.text}`) : [`  ${t("no_gaps")}`],
    "",
    `${t("blockers")}:`,
    ...review.blockers.length ? review.blockers.map((line) => `  - ${line}`) : [`  ${t("no_blockers")}`],
    "",
    ...review.notice.map((line) => `note: ${line}`),
    "",
    review.blockers.length ? "" : review.approve_with
  ].join("\n").trimEnd();
}
function weeksText(list2) {
  if (!list2.length) return "\u2014";
  return list2.map((week) => [`${week.week_id} (approved: ${week.current ?? "\u2014"})`, ...week.revisions.map((r) => `  r${r.revision} ${r.state} \u2192 ${r.status} \xB7 ${r.slots} slots \xB7 ${r.content_sha256.slice(0, 12)}${r.reasons.length ? `
    ${r.reasons.join("\n    ")}` : ""}`)].join("\n")).join("\n");
}
function calendarText(view, lang) {
  const t = (key) => (CAL_TEXT[key] ?? CLI_TEXT[key])[lang];
  const lines = [];
  if (!view.weeks.length) lines.push(t("none_calendar"));
  for (const week of view.weeks) {
    lines.push(`${week.week_id} r${week.revision} (${week.status}) ${week.digests.content_sha256.slice(0, 12)} \xB7 ${week.strategy.strategy_id}@${week.strategy.revision}`);
    for (const slot of week.slots) lines.push(slotLine(slot, t, slot.pillar_name));
    for (const fact of week.facts) lines.push(`    ${fact.fact_id}: ${fact.value}`);
    for (const gap of week.gaps) lines.push(`  - ${gap.text}`);
    lines.push("");
  }
  const withheld = Object.entries(view.withheld).map(([status, n]) => `${status}: ${n}`).join(", ");
  if (withheld) lines.push(`${t("withheld")}: ${withheld}`);
  lines.push(...view.notice.map((line) => `note: ${line}`));
  return lines.join("\n");
}
function metricsLine(metrics) {
  return METRIC_KEYS.filter((key) => metrics[key] !== void 0).map((key) => `${key}=${metrics[key]}${key === "completion_rate" ? "%" : ""}`).join(" ");
}
function reportsText(items, measured, lang) {
  const t = (key) => AGENT_TEXT[key][lang];
  if (!items.length && !measured.length) return t("reports_none");
  const lines = [t("reports_header"), ""];
  for (const item of items) {
    const old = item.current ? "" : ` ${fill(t("reports_old_revision"), { rev: item.week_revision })}`;
    lines.push(`${item.week_id} ${item.slot_id} r${item.week_revision} ${item.status} ${item.url ?? "\u2014"} \xB7 ${item.reported_at} \xB7 ${item.reporter}${old}`);
  }
  if (measured.length) lines.push("", t("metrics_header"));
  for (const item of measured) {
    const old = item.current ? "" : ` ${fill(t("reports_old_revision"), { rev: item.week_revision })}`;
    lines.push(`${item.week_id} ${item.slot_id} r${item.week_revision} ${metricsLine(item.metrics)} \xB7 ${item.measured_at} \xB7 ${item.source} \xB7 owner_reported, not_verified${old}`);
  }
  return lines.join("\n");
}
function metricsFrom(values2) {
  const out = {};
  const flags = { views: "views", reach: "reach", likes: "likes", comments: "comments", shares: "shares", saves: "saves", follows: "follows", link_clicks: "link-clicks", watch_time_s: "watch-time-s", completion_rate: "completion-rate" };
  for (const key of METRIC_KEYS) {
    const raw = values2[flags[key]];
    if (raw === void 0) continue;
    const clean = raw.trim().replace(/%$/, "");
    if (!/^\d+(?:\.\d+)?$/.test(clean)) throw new StrategyError("invalid_input", `--${flags[key]} takes a number (got ${raw.slice(0, 20)}).`);
    out[key] = Number(clean);
  }
  return out;
}
function list(value) {
  return value === void 0 ? void 0 : value.split(",").map((item) => item.trim()).filter(Boolean);
}
function currentRevision(ws, item) {
  try {
    const entry = approvedWeekEntry(loadWeekRecord(ws, item.week_id));
    return entry !== null && entry.revision === item.week_revision && entry.content_sha256 === item.week_content_sha256;
  } catch {
    return false;
  }
}
function reportsOf(ws, week) {
  const ids = week ? [validateWeekId(week)] : scanWeeks(ws).map((record) => record.week_id);
  return {
    reports: listObservations(ws, ids).map((item) => ({ ...item, current: currentRevision(ws, item) })),
    metrics: listMetrics(ws, ids).map((item) => ({ ...item, current: currentRevision(ws, item) }))
  };
}
async function run(ws, values2) {
  const lang = contentLang(values2.lang, contentLang(brandSettings(ws).default_locale.slice(0, 2)));
  if (values2.lang && values2.lang !== lang) usage("--lang is en, fa or tr.");
  const print = (data, text) => console.log(values2.json ? JSON.stringify(data, null, 2) : text());
  switch (command) {
    case "strategy": {
      const id = validateStrategyId(values2.id ?? "content-main");
      const draft = buildContentStrategy(ws, {
        lang,
        channels: values2.channels ? parseChannels(values2.channels) : void 0,
        cadence: values2.cadence ? parseCadence(values2.cadence) : void 0,
        formats: values2.formats ? parseFormats(values2.formats) : void 0,
        playbook: values2.playbook,
        languages: codes(values2.languages, "--languages"),
        markets: codes(values2.markets, "--markets")
      });
      const after = [];
      let stored = null;
      if (values2.out) {
        const out = path.resolve(values2.out);
        if (fs.existsSync(out)) throw new StrategyError("exists", "The --out file exists. Choose a new path; nothing was overwritten.");
        fs.writeFileSync(out, `${JSON.stringify(draft.proposal, null, 2)}
`, { mode: 384, flag: "wx" });
        after.push(fill(CLI_TEXT.written[lang], { list: values2.out, id }));
      }
      if (values2.store) {
        const result = proposeRevision(ws, { strategy_id: id, proposal: draft.proposal });
        stored = { revision: result.revision.revision, content_sha256: result.revision.content_sha256, path: result.path };
        after.push(fill(CLI_TEXT.stored[lang], { id, n: result.revision.revision }));
      }
      if (!values2.out && !values2.store) after.push(CLI_TEXT.store_hint[lang]);
      print({ ok: true, strategy_id: id, stored, gaps: draft.gaps, sources: draft.sources, notes: draft.notes, proposal: draft.proposal }, () => [draftText(draft, lang), "", ...after].join("\n"));
      return;
    }
    case "show": {
      const result = contentStrategyView(ws, { lang, strategy_id: values2.id ? validateStrategyId(values2.id) : void 0 });
      print({ ok: true, ...result }, () => {
        const withheld = Object.entries(result.withheld).map(([status, n]) => `${status}: ${n}`).join(", ");
        const body = result.views.length ? result.views.map((view) => viewText(view, lang)).join("\n\n") : CLI_TEXT.none_approved[lang];
        return withheld ? `${body}
${CLI_TEXT.withheld[lang]}: ${withheld}` : body;
      });
      return;
    }
    case "plan": {
      const weeks = Number(need(values2, "weeks"));
      const plan = planCalendar(ws, {
        lang,
        from: need(values2, "from"),
        weeks,
        strategy_id: values2.strategy ? validateStrategyId(values2.strategy) : void 0,
        channels: values2.channels ? parseChannels(values2.channels) : void 0,
        research: values2.research
      });
      const after = [];
      const stored = [];
      if (values2.out) {
        const out = path.resolve(values2.out);
        if (fs.existsSync(out)) throw new StrategyError("exists", "The --out file exists. Choose a new path; nothing was overwritten.");
        fs.writeFileSync(out, `${JSON.stringify({ weeks: plan.weeks.map((w) => w.content) }, null, 2)}
`, { mode: 384, flag: "wx" });
        after.push(fill(CAL_TEXT.written_plan[lang], { list: values2.out }));
      }
      if (values2.store) {
        for (const week of plan.weeks) {
          const result = proposeWeek(ws, { week: week.content, lang });
          stored.push({ week_id: week.content.week_id, revision: result.revision.revision, content_sha256: result.revision.content_sha256 });
          after.push(fill(CAL_TEXT.stored_week[lang], { id: week.content.week_id, n: result.revision.revision }));
        }
      }
      if (!values2.out && !values2.store) after.push(CAL_TEXT.plan_store_hint[lang]);
      print({ ok: true, stored, ...plan }, () => [planText(plan, lang), "", ...after].join("\n"));
      return;
    }
    case "playbook": {
      const doc = playbookDocument(lang, values2.channel ? channelOf(values2.channel) : void 0);
      print({ ok: true, ...doc }, () => playbookText(doc, lang));
      return;
    }
    case "batch": {
      const result = planBatch(ws, {
        lang,
        items: batchItems(values2),
        from: values2.from,
        pillar: values2.pillar,
        strategy_id: values2.strategy ? validateStrategyId(values2.strategy) : void 0,
        research: values2.research
      });
      const after = [];
      let stored = [];
      if (values2.out) {
        const out = path.resolve(values2.out);
        if (fs.existsSync(out)) throw new StrategyError("exists", "The --out file exists. Choose a new path; nothing was overwritten.");
        fs.writeFileSync(out, `${JSON.stringify({ weeks: result.weeks.map((w) => w.content) }, null, 2)}
`, { mode: 384, flag: "wx" });
        after.push(fill(CAL_TEXT.written_plan[lang], { list: values2.out }));
      }
      if (values2.store) {
        stored = storeBatch(ws, result, lang);
        for (const week of stored) after.push(fill(BATCH_TEXT.stored[lang], { id: week.week_id, n: week.revision }));
      } else {
        const conflicts = batchConflicts(ws, result.weeks.map((w) => w.content.week_id));
        if (conflicts.length) after.push(fill(BATCH_TEXT.conflict_preview[lang], { list: [...new Set(conflicts.map((c) => c.week_id))].join(", ") }));
      }
      if (!values2.out && !values2.store) after.push(BATCH_TEXT.store_hint[lang]);
      print({ ok: true, stored, ...result }, () => [batchText(result, lang), "", ...after].join("\n"));
      return;
    }
    case "week": {
      switch (sub) {
        case "propose": {
          const file = path.resolve(need(values2, "file"));
          let week;
          try {
            week = JSON.parse(fs.readFileSync(file, "utf8"));
          } catch {
            throw new StrategyError("invalid_input", "The --file is not readable JSON.");
          }
          const result = proposeWeek(ws, { week, lang });
          const id = result.revision.week_id;
          print({ ok: true, week_id: id, revision: result.revision.revision, content_sha256: result.revision.content_sha256, path: result.path }, () => fill(CAL_TEXT.stored_week[lang], { id, n: result.revision.revision }));
          return;
        }
        case "review": {
          const review = reviewWeek(ws, { week_id: need(values2, "week"), revision: validateRevisionNumber(Number(need(values2, "revision"))), lang });
          print({ ok: true, review }, () => reviewText(review, lang));
          return;
        }
        case "approve": {
          const proof = await ownerProof();
          const result = approveWeek(ws, { week_id: need(values2, "week"), revision: validateRevisionNumber(Number(need(values2, "revision"))), expected_sha256: need(values2, "expect-sha"), proof, lang });
          print({ ok: true, week_id: result.record.week_id, approved: result.approved.revision, superseded: result.superseded?.revision ?? null }, () => fill(CAL_TEXT.approved_week[lang], { id: result.record.week_id, n: result.approved.revision }));
          return;
        }
        case "reject": {
          const week = need(values2, "week");
          const entry = rejectWeek(ws, { week_id: week, revision: validateRevisionNumber(Number(need(values2, "revision"))) });
          print({ ok: true, week_id: week, rejected: entry.revision }, () => fill(CAL_TEXT.rejected_week[lang], { id: week, n: entry.revision }));
          return;
        }
        default:
          usage(sub ? `Unknown week command ${sub}.` : "week needs propose, review, approve or reject.");
      }
      return;
    }
    case "weeks": {
      const list2 = listWeeks(ws, lang);
      print({ ok: true, weeks: list2 }, () => weeksText(list2));
      return;
    }
    case "calendar": {
      const view = contentCalendar(ws, { lang, from: values2.from, to: values2.to, channel: values2.channel ? channelOf(values2.channel) : void 0 });
      print({ ok: true, ...view }, () => calendarText(view, lang));
      return;
    }
    case "share": {
      if (values2.all) {
        const written = [];
        const skipped = [];
        const attempt = (label, run2) => {
          try {
            const result2 = run2();
            (result2.written ? written : skipped).push(result2.written ? result2.path : `${label} (dry run)`);
          } catch (error) {
            skipped.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
          }
        };
        for (const view of servedContentViews(ws, { lang }).views) attempt(`strategy ${view.strategy_id}`, () => shareStrategy(ws, { strategy_id: view.strategy_id, dryRun: values2["dry-run"] }));
        for (const week of listWeeks(ws, lang)) if (week.current !== null) attempt(`week ${week.week_id}`, () => shareWeek(ws, { week_id: week.week_id, dryRun: values2["dry-run"] }));
        if (readKit(ws.root, ws.brandSlug).state === "ok") attempt("social style kit", () => shareKitApprovals(ws, { dryRun: values2["dry-run"] }));
        print(
          { ok: true, written, skipped, authorizes: [] },
          () => [
            written.length ? `Wrote ${written.length} file(s) for Studio:` : "Nothing approved to share yet.",
            ...written.map((item) => `  ${item}`),
            ...skipped.length ? ["Not shared:", ...skipped.map((item) => `  ${item}`)] : [],
            written.length ? 'Commit and push them (git add brand && git commit -m "Share approved content" && git push), then refresh Studio. Sharing publishes nothing and authorizes nothing.' : ""
          ].filter(Boolean).join("\n")
        );
        return;
      }
      const result = shareWeek(ws, { week_id: need(values2, "week"), dryRun: values2["dry-run"] });
      print({ ok: true, ...result }, () => result.written ? fill(CAL_TEXT.shared_week[lang], { list: result.path }) : `${CAL_TEXT.shared_preview[lang]}
${JSON.stringify(result.week, null, 2)}`);
      return;
    }
    case "share-strategy": {
      const result = shareStrategy(ws, { strategy_id: values2.id ?? "content-main", dryRun: values2["dry-run"] });
      print({ ok: true, ...result, authorizes: [] }, () => result.written ? fill(CAL_TEXT.shared_strategy[lang], { list: result.path }) : `${CAL_TEXT.shared_preview[lang]}
${JSON.stringify(result.strategy, null, 2)}`);
      return;
    }
    case "reports": {
      const items = reportsOf(ws, values2.week);
      print({ ok: true, reports: items.reports, metrics: items.metrics }, () => reportsText(items.reports, items.metrics, lang));
      return;
    }
    case "feedback": {
      const result = recordSlotFeedback(ws, { week_id: need(values2, "week"), slot_id: need(values2, "slot"), text: need(values2, "text"), verdict: values2.verdict, keep: list(values2.keep), avoid: list(values2.avoid), language: values2.lang ?? null });
      print(
        { ok: true, ...result },
        () => [
          fill(AGENT_TEXT.feedback_recorded[lang], { verdict: result.feedback.verdict, week: result.week_id, slot: result.slot_id, note: result.note.id, project: result.project.project_id }),
          `  ${result.project.created ? "new" : "existing"} project ${result.project.project_id} (${result.project.surface}, series ${result.project.series})`,
          "",
          AGENT_TEXT.feedback_next[lang],
          `  ${result.next.suggest}`,
          `  ${result.next.approve}`
        ].join("\n")
      );
      return;
    }
    case "metrics": {
      const item = recordSlotMetrics(ws, { week_id: need(values2, "week"), slot_id: need(values2, "slot"), metrics: metricsFrom(values2), measured_at: values2["measured-at"], source: values2.source });
      print({ ok: true, metrics: item }, () => `${fill(AGENT_TEXT.metrics_recorded[lang], { week: item.week_id, slot: item.slot_id, id: item.metrics_id })}
  ${metricsLine(item.metrics)} \xB7 ${item.measured_at} \xB7 ${item.source}`);
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
  await run(openWorkspace(process.cwd()), values);
} catch (error) {
  if (error instanceof CalendarError) {
    const lang = contentLang(values.lang);
    const lines = error.problems.map((problem) => problemText(problem, lang));
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, problems: error.problems, message: lines.join(" ") } }, null, 2));
    else console.error(`${error.code}:
${lines.map((line) => `  - ${line}`).join("\n")}`);
    process.exit(1);
  }
  if (error instanceof StrategyError || error instanceof KnowledgeError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing was approved or published.`);
  process.exit(1);
}
