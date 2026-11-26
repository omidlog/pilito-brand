import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  shareDecision
} from "./chunk-LPHAXDOY.mjs";
import {
  readOwnerProof
} from "./chunk-EU3MMEEN.mjs";
import "./chunk-4QCLP6RD.mjs";
import {
  approveAspects,
  listAspectProposals,
  parseAspectChoices,
  rejectAspects,
  suggestAspects
} from "./chunk-3UUYBU2Z.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  creativeContext
} from "./chunk-Z4VEC43P.mjs";
import {
  CreativeError,
  addVariant,
  approvePreference,
  assertOwnerProcess2 as assertOwnerProcess,
  createProject,
  listPreferences,
  listProjects,
  readProject,
  recordFeedback,
  selectVariant,
  suggestPreference
} from "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
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

// scripts/creative.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { stdin as input } from "node:process";
var HELP = `brand:creative <command> [options]

  project   --id <project> --title <t> --surface reel|post|carousel|story|logo|caption|script|thread|article
            --series <name> [--lang fa]
            [--inspiration kn_\u2026[:own|licensed|unknown]]\u2026
  variant   --project <project> --variant <A> --asset <manifest-asset-id|missing> [--describe <short label>]
  feedback  --project <project> --variant <A> (--text <owner words> | --file <path|-> | --note kn_\u2026)
            [--verdict like|reject|change_request|observation] [--keep aspect,\u2026] [--avoid aspect,\u2026]
            [--source-kind owner_note|agent_capture|meeting] [--lang fa]
  select    --project <project> --variant <E>      the owner's choice for this project only
  suggest   --project <project> --statement <short rule> --source kn_\u2026 [--source kn_\u2026] [--context <short>]
            [--counterexample B | --counterexample other-project/B]\u2026 [--supersedes cp_\u2026]     draft only
  approve   --id cp_\u2026 [--scope project|series]    owner proof: BRAND_OS_APPROVAL_PROOF or hidden prompt
  preferences                                       every preference with its state
  share     --id cp_\u2026 [--dry-run]   copy an approved decision's summary to brand/creative/shared (you commit it)
  show      --project <project>
  list
  context   (--project <project> | --surface reel --series <name>)   next-session context with provenance

  aspects suggest --project <project> [--feedback fb_\u2026]   keep/avoid aspects suggested from the note text (pending)
  aspects list    [--project <project>] [--state pending|approved|rejected]
  aspects approve --id ap_\u2026 [--only aspect[:keep|avoid],\u2026]   owner proof; applies to the feedback event
  aspects reject  --id ap_\u2026                                  nothing is applied
  Suggestions never apply on their own: retrieval and agents ignore them until the owner approves.

Aspects: camera_angle, lighting, text_density, tone, typography, layout, color, mascot_pose, mascot_anatomy, hook,
cta, duration, pacing, music, length, humour, clarity, jargon, structure, hashtags, caption, script_delivery. Add --json for machine-readable output. Refused while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...argv] = process.argv.slice(2);
var sub = command === "aspects" ? argv[0] : void 0;
var rest = command === "aspects" ? argv.slice(1) : argv;
var root = process.cwd();
var OPTIONS = {
  json: { type: "boolean", default: false },
  id: { type: "string" },
  project: { type: "string" },
  variant: { type: "string" },
  title: { type: "string" },
  surface: { type: "string" },
  series: { type: "string" },
  lang: { type: "string" },
  inspiration: { type: "string", multiple: true },
  asset: { type: "string" },
  describe: { type: "string" },
  text: { type: "string" },
  file: { type: "string" },
  note: { type: "string" },
  verdict: { type: "string" },
  keep: { type: "string" },
  avoid: { type: "string" },
  "source-kind": { type: "string" },
  statement: { type: "string" },
  context: { type: "string" },
  source: { type: "string", multiple: true },
  counterexample: { type: "string", multiple: true },
  supersedes: { type: "string" },
  scope: { type: "string" },
  feedback: { type: "string" },
  only: { type: "string" },
  state: { type: "string" },
  "dry-run": { type: "boolean", default: false }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function need(values2, key) {
  const value = values2[key];
  if (!value) usage(`--${key} is required.`);
  return value;
}
function list(value) {
  if (value === void 0) return void 0;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
async function feedbackText(values2) {
  if (values2.text !== void 0 && values2.file !== void 0) usage("Use --text or --file, not both.");
  if (values2.text !== void 0) return values2.text;
  if (values2.file === "-") {
    const chunks = [];
    for await (const chunk of input) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf8");
  }
  if (values2.file !== void 0) {
    const file = path.resolve(values2.file);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat?.isFile()) throw new CreativeError("invalid_input", "The --file path is not a readable file.");
    if (stat.size > 1024 * 1024) throw new CreativeError("invalid_input", "The --file is larger than 1 MiB.");
    return fs.readFileSync(file, "utf8");
  }
  return void 0;
}
async function ownerProof() {
  return readOwnerProof({ prompt: "Owner approval proof (input hidden): " });
}
function print(values2, data, text) {
  console.log(values2.json ? JSON.stringify(data, null, 2) : text());
}
function contextText(ctx) {
  const lines = [];
  const target = ctx.target.project_id ? `project ${ctx.target.project_id}` : "new work";
  lines.push(`Creative context for ${ctx.brand_slug}: ${target} (${ctx.target.surface}, series ${ctx.target.series})`);
  lines.push(...ctx.notice.map((item) => `  ! ${item}`));
  lines.push("", `Brand rules (approved facts, design profile): ${ctx.brand_rules.items.length}`);
  for (const item of ctx.brand_rules.items) lines.push(`  ${item.id} = ${JSON.stringify(item.value)}  [rev ${item.revision ?? "-"}]`);
  lines.push("", `Applied preferences: ${ctx.preferences.applied.length}`);
  for (const pref of ctx.preferences.applied) lines.push(`  ${pref.preference_id}  ${pref.statement}  (${pref.label})`, ...pref.sources.map((s) => `    source ${s.provenance} [${s.source_state}]`));
  if (ctx.preferences.not_applied.length) {
    lines.push("", "Not applied (drafts, superseded, needing review):");
    for (const pref of ctx.preferences.not_applied) lines.push(`  ${pref.preference_id}  ${pref.state.toUpperCase()}  ${pref.statement}  \u2014 ${pref.label}`);
  }
  lines.push("", `References: ${ctx.references.length}`);
  for (const ref of ctx.references) {
    lines.push(`  ${ref.project_id}/${ref.variant_id}  ${ref.role}  asset: ${ref.asset.state}${ref.asset.asset_id ? ` ${ref.asset.asset_id}` : ""}`);
    for (const reason of ref.reasons) {
      const aspects = [...reason.keep.map((a) => `+${a}`), ...reason.avoid.map((a) => `-${a}`)].join(" ");
      lines.push(`    ${reason.verdict} ${aspects}  ${reason.provenance} [${reason.source_state}]`);
      if (reason.quote) lines.push(`      \u201C${reason.quote}\u201D`);
    }
  }
  if (ctx.inspirations.length) {
    lines.push("", "Inspirations:");
    for (const item of ctx.inspirations) lines.push(`  ${item.provenance} [${item.source_state}] rights ${item.rights} \u2192 ${item.reuse}`);
  }
  lines.push("", `Performance: ${ctx.performance}. Authorizes: nothing.`);
  return lines.join("\n");
}
function parseCounterexample(value) {
  const slash = value.indexOf("/");
  return slash === -1 ? { variant_id: value } : { project_id: value.slice(0, slash), variant_id: value.slice(slash + 1) };
}
async function run(ws, values2) {
  assertOwnerProcess();
  switch (command) {
    case "project": {
      const inspirations = (values2.inspiration ?? []).map((item) => {
        const [noteId, rights] = item.split(":");
        return { note_id: noteId ?? "", rights };
      });
      const project = createProject(ws, { project_id: need(values2, "id"), title: need(values2, "title"), surface: need(values2, "surface"), series: need(values2, "series"), language: values2.lang ?? null, inspirations });
      print(values2, { ok: true, project }, () => `Created project ${project.project_id} (${project.surface}, series ${project.series}) for ${project.brand_slug}.`);
      return;
    }
    case "variant": {
      const variant = addVariant(ws, { project_id: need(values2, "project"), variant_id: need(values2, "variant"), asset: need(values2, "asset"), describe: values2.describe });
      print(values2, { ok: true, variant }, () => `Added variant ${variant.variant_id} (asset: ${variant.asset.state === "missing" ? "missing" : variant.asset.asset_id}).`);
      return;
    }
    case "feedback": {
      const text = await feedbackText(values2);
      const result = recordFeedback(ws, {
        project_id: need(values2, "project"),
        variant_id: need(values2, "variant"),
        text,
        note_id: values2.note,
        language: values2.lang,
        source_kind: values2["source-kind"],
        verdict: values2.verdict,
        keep: list(values2.keep),
        avoid: list(values2.avoid)
      });
      print(
        values2,
        { ok: true, ...result },
        () => `Recorded ${result.feedback.verdict} on ${result.feedback.variant_id}: ${result.note.captured ? "new" : "linked"} ${result.note.scope} note ${result.note.id}@${result.note.revision.slice(0, 12)} (${result.note.path}).`
      );
      return;
    }
    case "select": {
      const project = selectVariant(ws, { project_id: need(values2, "project"), variant_id: need(values2, "variant") });
      print(values2, { ok: true, selection: project.selection }, () => `${project.selection.variant_id} is the owner's choice for ${project.project_id}. Not published, not approved brand-wide, not a performance result.`);
      return;
    }
    case "suggest": {
      const pref = suggestPreference(ws, {
        project_id: need(values2, "project"),
        statement: need(values2, "statement"),
        context: values2.context,
        sources: values2.source ?? [],
        counterexamples: (values2.counterexample ?? []).map(parseCounterexample),
        supersedes: values2.supersedes
      });
      print(
        values2,
        { ok: true, preference: pref },
        () => `Draft ${pref.preference_id} (project ${pref.project_id}): ${pref.statement}
Unverified until the owner runs: npm run brand:creative -- approve --id ${pref.preference_id}${pref.supersedes ? `
Will supersede ${pref.supersedes} on approval.` : ""}`
      );
      return;
    }
    case "approve": {
      const proof = await ownerProof();
      const result = approvePreference(ws, { preference_id: need(values2, "id"), proof, scope: values2.scope });
      print(
        values2,
        { ok: true, approved: result.approved, superseded: result.superseded },
        () => [`Approved ${result.approved.preference_id} for ${result.approved.scope.level === "project" ? `project ${result.approved.scope.project_id}` : `series ${result.approved.scope.series} (${result.approved.scope.surface})`}.`, result.superseded ? `Superseded ${result.superseded.preference_id} (kept on disk for audit).` : ""].filter(Boolean).join("\n")
      );
      return;
    }
    case "share": {
      const result = shareDecision(ws, { preference_id: need(values2, "id"), dryRun: values2["dry-run"] });
      print(
        values2,
        { ok: true, ...result },
        () => [
          `${result.written ? "Wrote" : "Would write"} ${result.path}:`,
          `  ${result.decision.state}  ${result.decision.statement}  (${result.decision.scope.label})`,
          `  sources ${result.decision.sources.join(", ")}`,
          ...result.refreshed.map((rel) => `${result.written ? "Refreshed" : "Would refresh"} ${rel} (superseded).`),
          "Only this summary is shared: no note text. Nothing was committed. Review it, commit it on a branch and merge the pull request; Studio shows it after a refresh."
        ].join("\n")
      );
      return;
    }
    case "preferences": {
      const items = listPreferences(ws);
      print(values2, { ok: true, items }, () => items.length ? items.map((p) => `${p.preference_id}  ${p.state.padEnd(10)} ${p.statement}${p.superseded_by ? `  \u2192 superseded by ${p.superseded_by}` : ""}${p.supersedes ? `  (supersedes ${p.supersedes})` : ""}`).join("\n") : "No preferences.");
      return;
    }
    case "show": {
      const project = readProject(ws, need(values2, "project"));
      print(
        values2,
        { ok: true, project },
        () => [
          `${project.project_id}  ${project.title}  (${project.surface}, series ${project.series})`,
          ...project.variants.map((v) => `  ${v.variant_id}  ${v.status.padEnd(8)} asset ${v.asset.state === "missing" ? "missing" : v.asset.asset_id}${v.describe ? `  ${v.describe}` : ""}`),
          ...project.feedback.map((f) => `  feedback ${f.variant_id} ${f.verdict} knowledge:${f.note.id}@${f.note.revision.slice(0, 12)}`),
          project.selection ? `  selected: ${project.selection.variant_id} (owner's choice for this project)` : "  selected: none"
        ].join("\n")
      );
      return;
    }
    case "list": {
      const items = listProjects(ws).map((p) => ({ project_id: p.project_id, title: p.title, surface: p.surface, series: p.series, variants: p.variants.length, selected: p.selection?.variant_id ?? null }));
      print(values2, { ok: true, items }, () => items.length ? items.map((p) => `${p.project_id}  ${p.surface}/${p.series}  ${p.variants} variants  selected ${p.selected ?? "-"}  ${p.title}`).join("\n") : "No creative projects.");
      return;
    }
    case "context": {
      const ctx = creativeContext(ws, new InterviewEngine(root), { project_id: values2.project, surface: values2.surface, series: values2.series });
      print(values2, { ok: true, context: ctx }, () => contextText(ctx));
      return;
    }
    case "aspects": {
      await runAspects(ws, values2);
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
async function runAspects(ws, values2) {
  switch (sub) {
    case "suggest": {
      const result = suggestAspects(ws, { project_id: need(values2, "project"), feedback_id: values2.feedback });
      print(
        values2,
        { ok: true, ...result },
        () => [
          ...result.created.map((p) => `Pending ${p.proposal_id}  ${p.variant_id}  ${p.suggestions.map((s) => `${s.side === "keep" ? "+" : s.side === "avoid" ? "-" : "?"}${s.aspect} (\u201C${s.cue}\u201D)`).join(" ")}`),
          ...result.skipped.map((item) => `Skipped ${item.feedback_id}: ${item.reason}`),
          result.created.length ? "Machine suggestions, unverified. Nothing is applied until the owner runs: npm run brand:creative -- aspects approve --id ap_\u2026" : "No new suggestions."
        ].join("\n")
      );
      return;
    }
    case "list": {
      const items = listAspectProposals(ws, { project_id: values2.project, state: values2.state });
      print(
        values2,
        { ok: true, items },
        () => items.length ? items.map((p) => `${p.proposal_id}  ${p.state.padEnd(8)} ${p.project_id}/${p.variant_id}  ${p.suggestions.map((s) => `${s.side === "keep" ? "+" : s.side === "avoid" ? "-" : "?"}${s.aspect}`).join(" ")}${p.applied.length ? `  applied ${p.applied.map((a) => `${a.aspect}:${a.side}`).join(",")}` : ""}`).join("\n") : "No aspect proposals."
      );
      return;
    }
    case "approve": {
      const proof = await ownerProof();
      const result = approveAspects(ws, { proposal_id: need(values2, "id"), proof, only: values2.only ? parseAspectChoices(values2.only) : void 0 });
      print(values2, { ok: true, ...result }, () => `Approved ${result.proposal.proposal_id}: ${result.proposal.applied.map((a) => `${a.aspect}:${a.side}`).join(", ")} on ${result.proposal.project_id}/${result.proposal.variant_id} (feedback ${result.feedback.feedback_id}).`);
      return;
    }
    case "reject": {
      const proposal = rejectAspects(ws, { proposal_id: need(values2, "id") });
      print(values2, { ok: true, proposal }, () => `Rejected ${proposal.proposal_id}. Nothing was applied.`);
      return;
    }
    default:
      usage(sub ? `Unknown aspects command ${sub}.` : "aspects needs suggest, list, approve or reject.");
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
  await run(openWorkspace(root), values);
} catch (error) {
  if (error instanceof CreativeError || error instanceof KnowledgeError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing was published. Run brand:knowledge doctor.`);
  process.exit(1);
}
