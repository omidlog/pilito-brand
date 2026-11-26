import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  AssuranceBridgeError,
  BRIDGE_HELP,
  BRIDGE_TEXT,
  MAX_SNAPSHOT_BYTES,
  assessWorkspace,
  buildAssuranceSnapshot,
  parseSnapshotFile,
  renderSnapshotSummary,
  renderVerifyResult,
  verifyAssuranceSnapshot
} from "./chunk-S43G3BY2.mjs";
import {
  assuranceLang,
  fill,
  renderGapReport
} from "./chunk-PBBSGXWH.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/assurance.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var [command, ...rest] = process.argv.slice(2);
var OPTIONS = {
  json: { type: "boolean", default: false },
  lang: { type: "string" },
  "as-of": { type: "string" },
  audience: { type: "string" },
  "paid-media": { type: "string" },
  pin: { type: "string" },
  snapshot: { type: "string" }
};
function earlyLang(args) {
  const index = args.findIndex((arg) => arg === "--lang" || arg.startsWith("--lang="));
  if (index < 0) return "en";
  const value = args[index].includes("=") ? args[index].split("=")[1] : args[index + 1];
  return assuranceLang(value);
}
var LANG = earlyLang(rest);
function usage(message2) {
  console.error(`${message2}

${BRIDGE_HELP[LANG]}`);
  process.exit(2);
}
function lang(values2) {
  const given = values2.lang;
  if (given === void 0) return "en";
  if (given !== "en" && given !== "fa" && given !== "tr") usage(`--lang must be en, fa or tr (given ${given}).`);
  return given;
}
function asOf(values2) {
  const given = values2["as-of"];
  if (given === void 0) return /* @__PURE__ */ new Date(`${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(given)) usage("--as-of must be a date, YYYY-MM-DD.");
  const date = /* @__PURE__ */ new Date(`${given}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== given) usage("--as-of must be a real calendar date, YYYY-MM-DD.");
  return date;
}
function audience(values2) {
  const given = values2.audience ?? "internal";
  if (given !== "public" && given !== "internal" && given !== "restricted") usage(`--audience must be public, internal or restricted (given ${given}).`);
  return given;
}
function paidMedia(values2) {
  const given = values2["paid-media"] ?? "unknown";
  if (given !== "yes" && given !== "no" && given !== "unknown") usage(`--paid-media must be yes, no or unknown (given ${given}).`);
  return given;
}
function readSnapshotFile(file) {
  const resolved = path.resolve(file);
  let stat;
  try {
    stat = fs.lstatSync(resolved);
  } catch {
    throw new AssuranceBridgeError("invalid_pin", "The snapshot file does not exist.");
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new AssuranceBridgeError("invalid_pin", "The snapshot file must be a regular file, not a symlink or a folder.");
  if (stat.size > MAX_SNAPSHOT_BYTES) throw new AssuranceBridgeError("invalid_pin", "The snapshot file is too large.");
  return fs.readFileSync(resolved, "utf8");
}
function options(values2) {
  const base = { asOf: asOf(values2), audience: audience(values2), paidMedia: paidMedia(values2) };
  if (values2.pin !== void 0) {
    const kept = parseSnapshotFile(readSnapshotFile(values2.pin));
    base.pins = kept.pins;
  }
  return base;
}
function warnDeprecatedPaidMedia(values2, snapshot, language) {
  if (values2["paid-media"] === void 0) return;
  console.error(BRIDGE_TEXT.paid_media_deprecated[language]);
  const entry = snapshot.subject_provenance.find((item) => item.field === "runs_paid_media");
  if (entry?.source !== "approved_fact") return;
  console.error(BRIDGE_TEXT[entry.value === "unknown" ? "paid_media_ignored_undecided" : "paid_media_ignored"][language]);
}
function run(values2) {
  if (process.env[AGENT_TOKEN_ENV]) throw new AssuranceBridgeError("refused", BRIDGE_TEXT.refused_agent.en);
  if (!fs.existsSync(path.join(process.cwd(), "brand", "brand.config.yaml"))) throw new AssuranceBridgeError("not_a_brand", BRIDGE_TEXT.not_a_brand.en);
  const root = process.cwd();
  const language = lang(values2);
  switch (command) {
    case "snapshot": {
      if (values2.snapshot !== void 0) usage("snapshot takes --pin, not --snapshot. Use verify --snapshot to check a kept snapshot.");
      const snapshot = buildAssuranceSnapshot(root, options(values2));
      warnDeprecatedPaidMedia(values2, snapshot, language);
      console.log(values2.json ? JSON.stringify(snapshot, null, 2) : renderSnapshotSummary(snapshot, language));
      return;
    }
    case "assess": {
      if (values2.snapshot !== void 0) usage("assess takes --pin, not --snapshot. Use verify --snapshot to check a kept snapshot.");
      const result = assessWorkspace(root, options(values2));
      warnDeprecatedPaidMedia(values2, result.snapshot, language);
      if (values2.json) console.log(JSON.stringify(result, null, 2));
      else console.log(`${renderSnapshotSummary(result.snapshot, language)}
${renderGapReport(result.assessment, language)}`);
      return;
    }
    case "verify": {
      if (values2.snapshot === void 0) usage("verify needs --snapshot <file>.");
      for (const flag of ["as-of", "audience", "paid-media", "pin"]) {
        if (values2[flag] !== void 0) usage(`verify takes its --${flag} from the kept snapshot; do not pass it.`);
      }
      const result = verifyAssuranceSnapshot(root, readSnapshotFile(values2.snapshot));
      console.log(values2.json ? JSON.stringify(result, null, 2) : renderVerifyResult(result, language));
      process.exitCode = result.reproduced ? 0 : 3;
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
if (!command || command === "help" || command === "--help") {
  console.log(BRIDGE_HELP[LANG]);
  process.exit(command ? 0 : 2);
}
var values;
try {
  values = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true }).values;
} catch (error) {
  usage(error.message);
}
function message(error, language) {
  if (error.code === "refused") return BRIDGE_TEXT.refused_agent[language];
  if (error.code === "not_a_brand") return BRIDGE_TEXT.not_a_brand[language];
  if (error.code === "invalid_pin") return fill(BRIDGE_TEXT.invalid_pin[language], { reason: error.message });
  if (error.code === "invalid_review") return fill(BRIDGE_TEXT.invalid_review[language], { reason: error.message });
  if (error.code === "invalid_link") return fill(BRIDGE_TEXT.invalid_link[language], { reason: error.message });
  return error.message;
}
try {
  run(values);
} catch (error) {
  const language = assuranceLang(values.lang);
  if (error instanceof AssuranceBridgeError) {
    const text = message(error, language);
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: text }, authorizes: [] }, null, 2));
    else console.error(`${error.code}: ${text}`);
    process.exit(1);
  }
  console.error(fill(BRIDGE_TEXT.unexpected[language], { name: error?.name ?? "Error" }));
  process.exit(1);
}
