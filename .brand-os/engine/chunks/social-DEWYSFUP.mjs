import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readOwnerProof
} from "./chunk-EU3MMEEN.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import {
  SHARED_SOCIAL_APPROVALS_FILE,
  shareKitApprovals
} from "./chunk-C5LB7EY5.mjs";
import {
  previewFiles,
  repoTokenLookup,
  ruleText,
  socialKitText
} from "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-6WOO6B6T.mjs";
import {
  SOCIAL_KIT_FILE,
  SOCIAL_LANGS,
  SURFACES,
  SURFACE_SPECS,
  SocialKitError,
  approveKit,
  evaluateKit,
  initKit,
  localize,
  readKit,
  rejectKit,
  reviewKit,
  zoneRect
} from "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  openWorkspace
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/social.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:social kit <command> [options]   (owner only; all take --json and --lang en|fa|tr)

  kit init [--surfaces post,story,\u2026] [--styles 1-4] [--force]
      Write the starter draft kit to ${SOCIAL_KIT_FILE}. Refuses an existing file unless --force;
      --force replaces draft styles only (approved and rejected styles are always kept).
  kit show [--surface <s>]
      Every style with its effective status (draft, approved, rejected, invalid approval).
  kit review --style <id> | --surface <s>
      The digest to approve (--expect-sha) and the exact approve command.
  kit approve --style <id> | --surface <s> --expect-sha <sha256>
      Owner approval (proof from BRAND_OS_APPROVAL_PROOF, piped stdin, Keychain or a hidden prompt).
  kit reject --style <id> | --surface <s>
      Decline styles. They stay in the file and are never served.
  kit preview [--surface <s>] --out <dir>
      Deterministic SVG wireframes per style and one index.html contact sheet per surface. Fonts show the
      brand family for the --lang (display-fa for fa when it exists), labelled draft or template EXAMPLE
      until the font token is approved.
  kit share [--dry-run]
      Write ${SHARED_SOCIAL_APPROVALS_FILE}: which styles are approved here, with their digest and
      approval time (no seals or secrets), so Studio can show them. You commit and merge it.

Surfaces: ${SURFACES.join(", ")}.
Nothing here publishes, schedules or approves a post. Approval of a style is design guidance only.`;
var OPTIONS = {
  surfaces: { type: "string" },
  surface: { type: "string" },
  styles: { type: "string" },
  style: { type: "string" },
  "expect-sha": { type: "string" },
  out: { type: "string" },
  force: { type: "boolean", default: false },
  "dry-run": { type: "boolean", default: false },
  json: { type: "boolean", default: false },
  lang: { type: "string" }
};
var [group, command, ...rest] = process.argv.slice(2);
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function langOf(value) {
  if (value === void 0) return "en";
  if (!SOCIAL_LANGS.includes(value)) usage("--lang is en, fa or tr.");
  return value;
}
function surfaceOf(value) {
  if (value === void 0) return void 0;
  if (!SURFACES.includes(value)) usage(`--surface is one of ${SURFACES.join(", ")}.`);
  return value;
}
function surfacesOf(value) {
  if (value === void 0) return void 0;
  const list = value.split(",").map((item) => item.trim()).filter(Boolean);
  for (const item of list) surfaceOf(item);
  if (list.length === 0) usage("--surfaces lists one or more surfaces.");
  return list;
}
function showText(states, lang, surface) {
  const t = socialKitText(lang);
  const lines = [`${t.labels.kit} \u2014 ${SOCIAL_KIT_FILE}`];
  for (const current of SURFACES.filter((item) => !surface || item === surface)) {
    const mine = states.filter((state) => state.style.surface === current);
    if (mine.length === 0) continue;
    const spec = SURFACE_SPECS[current];
    lines.push("", `${t.surfaces[current]} (${spec.canvases.map((canvas) => `${canvas.width}\xD7${canvas.height}`).join(", ")})`);
    for (const state of mine) {
      const style = state.style;
      lines.push(`  [${t.statuses[state.status]}] ${style.id} \u2014 ${localize(style.name, lang)}  sha ${state.digest.slice(0, 12)}`);
      lines.push(`    ${t.labels.intent}: ${localize(style.intent.use_when, lang)}`);
      lines.push(`    ${t.labels.variation}: ${localize(style.variation, lang)}`);
      lines.push(`    ${t.labels.layers}: ${style.layers.map((layer) => {
        const r = zoneRect(layer.zone);
        return `${t.roles[layer.role]}@${r.x},${r.y},${r.w}\xD7${r.h}`;
      }).join(" \xB7 ")}`);
      lines.push(`    ${t.labels.do}: ${style.do.map((item) => ruleText(item, lang)).join(" ") || t.labels.none}`);
      lines.push(`    ${t.labels.dont}: ${style.dont.map((item) => ruleText(item, lang)).join(" ") || t.labels.none}`);
      lines.push(`    ${t.labels.references}: ${style.reference_assets === "missing" ? "missing" : style.reference_assets.join(", ")}`);
    }
  }
  return lines.join("\n");
}
function reviewText(review, lang) {
  const t = socialKitText(lang);
  const lines = review.items.map((item) => `  [${t.statuses[item.status]}] ${item.style_id}  ${item.digest}${item.invalid_reason ? `  (${item.invalid_reason})` : ""}`);
  if (review.safety_problems.length) lines.push(`  ! ${review.safety_problems.join(", ")}`);
  lines.push(`${t.labels.digest}: ${review.expect_sha ?? t.labels.none}`);
  if (review.approve_with) lines.push(`${t.labels.approve_with}: ${review.approve_with}`);
  return lines.join("\n");
}
async function main() {
  if (!group || group === "help" || group === "--help") {
    console.log(HELP);
    return;
  }
  if (group !== "kit") usage(`Unknown command ${group}.`);
  const { values } = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true });
  const lang = langOf(values.lang);
  const t = socialKitText(lang);
  const print = (data, text) => console.log(values.json ? JSON.stringify(data, null, 2) : text());
  if (process.env[AGENT_TOKEN_ENV]) {
    throw new SocialKitError("refused", `The social style kit is the owner's to edit, review and approve. Refusing while ${AGENT_TOKEN_ENV} is set. Agents read approved styles with npm run brand:query -- --tool social_style_kit.`);
  }
  const engine = new InterviewEngine(process.cwd());
  const ws = openWorkspace(engine.workspaceRoot());
  switch (command) {
    case "init": {
      const styles = values.styles === void 0 ? void 0 : Number(values.styles);
      const result = initKit(ws, { surfaces: surfacesOf(values.surfaces), styles, force: values.force, personal: engine.config().modules.personal?.enabled === true, mascot: engine.config().modules.mascot?.enabled === true });
      print({ ok: true, ...result }, () => `${t.labels.init_done}
${t.labels.wrote}: ${result.path} (${result.written.length} drafts${result.kept.length ? `, kept ${result.kept.join(", ")}` : ""})`);
      return;
    }
    case "show": {
      const surface = surfaceOf(values.surface);
      const read = readKit(ws.root, ws.brandSlug);
      if (read.state === "missing") {
        print({ ok: true, kit_state: "missing", styles: [] }, () => t.labels.missing_kit);
        return;
      }
      if (read.state === "invalid") throw new SocialKitError("invalid_kit", read.error);
      const states = evaluateKit(ws.root, read.kit).filter((state) => !surface || state.style.surface === surface);
      print(
        { ok: true, kit_state: "ok", family: read.kit.family, styles: states.map((state) => ({ ...state.style, effective_status: state.status, digest: state.digest, invalid_reason: state.invalid_reason })) },
        () => showText(states, lang, surface)
      );
      return;
    }
    case "review": {
      const review = reviewKit(ws, { style_id: values.style, surface: values.surface });
      print({ ok: true, ...review }, () => reviewText(review, lang));
      return;
    }
    case "approve": {
      if (!values.style && !values.surface) usage("kit approve needs --style <id> or --surface <s>.");
      const proof = await readOwnerProof({ prompt: "Owner approval proof (input hidden): " });
      const result = approveKit(ws, { style_id: values.style, surface: values.surface, expected_sha256: values["expect-sha"], proof });
      print({ ok: true, ...result }, () => `${t.labels.approved}: ${result.approved.map((item) => item.style_id).join(", ")}`);
      return;
    }
    case "reject": {
      const result = rejectKit(ws, { style_id: values.style, surface: values.surface });
      print({ ok: true, ...result }, () => `${t.labels.rejected}: ${result.rejected.join(", ")}`);
      return;
    }
    case "preview": {
      if (!values.out) usage("kit preview needs --out <dir>.");
      const surface = surfaceOf(values.surface);
      const read = readKit(ws.root, ws.brandSlug);
      if (read.state === "missing") throw new SocialKitError("not_found", t.labels.missing_kit);
      if (read.state === "invalid") throw new SocialKitError("invalid_kit", read.error);
      const files = previewFiles(read.kit, evaluateKit(ws.root, read.kit), repoTokenLookup(ws.root), { surface, lang });
      const out = path.resolve(values.out);
      for (const file of files) {
        const target = path.join(out, ...file.path.split("/"));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, file.contents);
      }
      print({ ok: true, out, files: files.map((file) => file.path) }, () => `${t.labels.preview_done}
${files.filter((file) => file.path.endsWith("index.html")).map((file) => `  ${path.join(out, file.path)}`).join("\n")}`);
      return;
    }
    case "share": {
      const result = shareKitApprovals(ws, { dryRun: values["dry-run"] });
      print(
        { ok: true, ...result, authorizes: [] },
        () => result.written ? `${t.labels.shared}: ${result.path} (${result.summary.styles.length})` : `${t.labels.share_preview}.
${JSON.stringify(result.summary, null, 2)}`
      );
      return;
    }
    default:
      usage(`Unknown kit command ${command ?? ""}.`);
  }
}
main().catch((error) => {
  if (error instanceof SocialKitError) {
    if (process.argv.includes("--json")) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message }, authorizes: [] }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  if (error instanceof Error && "code" in error && typeof error.code === "string" && error.code.startsWith("ERR_PARSE_ARGS")) usage(error.message);
  throw error;
});
