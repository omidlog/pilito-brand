import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  draftSeoStrategy
} from "./chunk-45KEDXCJ.mjs";
import "./chunk-F3UDVADT.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  critiquePlan
} from "./chunk-D3U2JFTZ.mjs";
import "./chunk-Z4VEC43P.mjs";
import {
  NETWORK_ENV,
  SeoError,
  answersOf,
  interviewState,
  parseBundle,
  parseRequests,
  readInterview,
  recordAnswer,
  replayAll,
  retrieveAll,
  selectAdapter,
  toBundle,
  unavailableAdapter
} from "./chunk-ZYAYDNGS.mjs";
import {
  ResearchError,
  loadEvidence,
  recordSource
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  KnowledgeError,
  openWorkspace
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/seo.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:seo <command> [options]

  research status [--bundle <file>]           can research run now? (live, replay or unavailable, with the reason)
  research capture --request <file> [--bundle-out <file>]
                                              live HTTPS retrieval (needs ${NETWORK_ENV}=on); every quote is checked
                                              on the fetched page; sources become Knowledge research notes
  research replay --bundle <file>             record a previously recorded bundle (original dates kept, no network)
  research list                               recorded sources with trust and freshness
  questions [--lang en|fa|tr]                 the next interview question, with why it is asked
  answer --question <id> --value <v> [--words <owner's verbatim words>] [--lang fa]
                                              unknown is a valid value; words become a Knowledge note
  plan [--bundle <file>] [--no-save]          draft plan + independent critic (draft only, never approved)
  critique --plan <draft.json>                re-run the critic on a saved draft against today's research notes

Add --json for machine-readable output. Refused while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...rest] = process.argv.slice(2);
var root = process.cwd();
var OPTIONS = {
  json: { type: "boolean", default: false },
  bundle: { type: "string" },
  request: { type: "string" },
  "bundle-out": { type: "string" },
  question: { type: "string" },
  value: { type: "string" },
  words: { type: "string" },
  lang: { type: "string" },
  plan: { type: "string" },
  "no-save": { type: "boolean", default: false }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function print(values, data, text) {
  console.log(values.json ? JSON.stringify(data, null, 2) : text());
}
function readJsonFile(file, label) {
  const full = path.resolve(file);
  const stat = fs.statSync(full, { throwIfNoEntry: false });
  if (!stat?.isFile()) throw new ResearchError("invalid_input", `The ${label} path is not a readable file.`);
  if (stat.size > 4 * 1024 * 1024) throw new ResearchError("invalid_input", `The ${label} file is larger than 4 MiB.`);
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    throw new ResearchError("invalid_input", `The ${label} file is not valid JSON.`);
  }
}
function bundleOf(values) {
  return values.bundle ? parseBundle(readJsonFile(values.bundle, "--bundle")) : null;
}
async function replayAndRecord(ws, bundle) {
  return recordEach(ws, await replayAll(bundle));
}
function recordEach(ws, outcomes) {
  return outcomes.map((outcome) => {
    if (!outcome.ok) return { url: outcome.url, outcome: outcome.state, reason: outcome.reason };
    try {
      return { url: outcome.source.url, ...recordSource(ws, outcome.source) };
    } catch (error) {
      if (error instanceof ResearchError) return { url: outcome.source.url, outcome: error.code, reason: error.message };
      throw error;
    }
  });
}
function criticText(report) {
  return [
    `Critic (${report.rubric_version}): ${report.verdict === "pass" ? "PASS" : "BLOCKED"}`,
    ...report.passes.map((item) => `  ok    ${item}`),
    ...report.blocking_findings.map((item) => `  BLOCK ${item.code}${item.line ? ` (line ${item.line})` : ""}: ${item.message} \u2014 ${item.excerpt}`),
    ...report.warnings.map((item) => `  warn  ${item.code}: ${item.message}`),
    ...report.owner_decisions_required.map((item) => `  owner ${item}`)
  ].join("\n");
}
async function run(ws, values, args) {
  switch (command) {
    case "research": {
      const sub = args[0];
      if (sub === "status") {
        const adapter = selectAdapter({ bundle: bundleOf(values) });
        const capability = adapter.capability(ws.now());
        const evidence = loadEvidence(ws);
        const summary = { usable: evidence.items.filter((item) => item.usable).length, fresh: evidence.items.filter((item) => item.usable && item.staleness.state === "fresh").length };
        print(values, { ok: true, capability, evidence: summary }, () => `${capability.adapter}: ${capability.state} (${capability.mode})${capability.reason ? ` \u2014 ${capability.reason}` : ""}
Recorded sources: ${summary.usable} usable, ${summary.fresh} fresh.`);
        return;
      }
      if (sub === "capture") {
        if (!values.request) usage("--request is required.");
        const requests = parseRequests(readJsonFile(values.request, "--request"));
        const adapter = selectAdapter({});
        const capability = adapter.capability(ws.now());
        if (capability.state !== "available" || adapter.id !== "live") {
          print(values, { ok: false, research: "research_unavailable", capability }, () => `research_unavailable: ${capability.reason}`);
          process.exitCode = 3;
          return;
        }
        const outcomes = await retrieveAll(adapter, requests);
        const results = recordEach(ws, outcomes);
        const sources = outcomes.flatMap((outcome) => outcome.ok ? [outcome.source] : []);
        if (values["bundle-out"] && sources.length) {
          fs.writeFileSync(path.resolve(values["bundle-out"]), `${JSON.stringify(toBundle(sources, `brand:seo research capture (${capability.adapter})`, ws.now()), null, 2)}
`);
        }
        print(values, { ok: true, results }, () => results.map((item) => `${item.outcome.padEnd(20)} ${item.url}${"reason" in item ? `  ${item.reason}` : ""}`).join("\n"));
        if (results.some((item) => "reason" in item)) process.exitCode = 4;
        return;
      }
      if (sub === "replay") {
        const bundle = bundleOf(values);
        if (!bundle) usage("--bundle is required.");
        const results = await replayAndRecord(ws, bundle);
        print(values, { ok: true, recorded_with: bundle.recorded_with, recorded_at: bundle.recorded_at, results }, () => results.map((item) => `${item.outcome.padEnd(20)} ${item.url}`).join("\n"));
        return;
      }
      if (sub === "list") {
        const evidence = loadEvidence(ws);
        const items = evidence.items.map((item) => ({
          provenance: item.provenance,
          url: item.source.url,
          publisher: item.source.publisher,
          source_type: item.source.source_type,
          tier: item.source.tier,
          retrieved_at: item.source.retrieved_at,
          page_last_updated: item.source.page_last_updated,
          adapter: item.source.adapter,
          trust: item.trust,
          staleness: item.staleness,
          usable: item.usable,
          superseded_by: item.superseded_by,
          claims: item.source.excerpts.map((excerpt) => excerpt.claim_key)
        }));
        print(
          values,
          { ok: true, items, problems: evidence.problems },
          () => items.length ? items.map((item) => `${item.usable ? "" : "[history] "}${item.publisher}  ${item.url}
  retrieved ${item.retrieved_at.slice(0, 10)} (${item.staleness.state}, ${item.staleness.age_days}/${item.staleness.max_age_days} d), ${item.source_type}/${item.tier}, trust ${item.trust.level}
  ${item.provenance}`).join("\n") : "No research sources recorded. research_unavailable until some are."
        );
        return;
      }
      usage("research needs status, capture, replay or list.");
      return;
    }
    case "questions": {
      const state = interviewState(answersOf(readInterview(ws)));
      const lang = values.lang === "fa" || values.lang === "tr" ? values.lang : "en";
      print(
        values,
        { ok: true, state },
        () => state.next ? [`${state.next.id} (${state.next.stage})`, `  ${state.next.prompt[lang]}`, `  Why: ${state.next.why_asked}`, `  Informs: ${state.next.decision_informed}`, `  Answer with: ${state.next.choices ? [...state.next.choices, "unknown"].join(" | ") : "a comma-separated list, or unknown"}`, `${state.pending.length - 1} more after this; ${state.skipped.length} skipped as not applicable.`, state.notice].join("\n") : `Interview complete for now (${state.answered.length} answered, ${state.unknown.length} unknown). Run brand:seo plan.`
      );
      return;
    }
    case "answer": {
      if (!values.question || values.value === void 0) usage("--question and --value are required.");
      const result = recordAnswer(ws, { question_id: values.question, value: values.value, words: values.words, language: values.lang ?? null });
      const state = interviewState(answersOf(readInterview(ws)));
      print(values, { ok: true, ...result, next: state.next?.id ?? null }, () => `Recorded ${values.question} = ${Array.isArray(result.entry.value) ? result.entry.value.join(", ") : result.entry.value}${result.changed_from ? ` (was ${String(result.changed_from)})` : ""}${result.entry.note ? `, words in knowledge:${result.entry.note.id}` : ""}. Next: ${state.next?.id ?? "none"}`);
      return;
    }
    case "plan": {
      const bundle = bundleOf(values);
      if (bundle) await replayAndRecord(ws, bundle);
      const adapter = bundle ? selectAdapter({ bundle }) : process.env[NETWORK_ENV] === "on" ? selectAdapter({}) : unavailableAdapter();
      const result = draftSeoStrategy(ws, new InterviewEngine(root), { adapter, save: !values["no-save"] });
      print(values, { ok: true, plan: result.plan, critic: result.critic, saved: result.saved }, () => `${result.plan.markdown}
---
${criticText(result.critic)}${result.saved ? `

Saved: ${result.saved.markdown} and ${result.saved.json} (local, gitignored)` : ""}`);
      if (result.critic.verdict !== "pass") process.exitCode = 5;
      return;
    }
    case "critique": {
      if (!values.plan) usage("--plan is required.");
      const doc = readJsonFile(values.plan, "--plan");
      const plan = doc.plan ?? doc;
      if (plan?.kind !== "seo_strategy_draft" || typeof plan.markdown !== "string") throw new SeoError("invalid_input", "The --plan file is not an SEO strategy draft.");
      if (plan.brand_slug !== ws.brandSlug) throw new SeoError("wrong_brand", "The draft belongs to another brand.");
      const report = critiquePlan(plan, loadEvidence(ws));
      print(values, { ok: true, critic: report }, () => criticText(report));
      if (report.verdict !== "pass") process.exitCode = 5;
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
var parsed;
try {
  parsed = parseArgs({ args: rest, options: OPTIONS, allowPositionals: true, strict: true });
} catch (error) {
  usage(error.message);
}
if (command !== "research" && parsed.positionals.length) usage(`Unexpected argument ${parsed.positionals[0]}.`);
try {
  await run(openWorkspace(root), parsed.values, parsed.positionals);
} catch (error) {
  if (error instanceof SeoError || error instanceof ResearchError || error instanceof KnowledgeError) {
    if (parsed.values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing was published.`);
  process.exit(1);
}
