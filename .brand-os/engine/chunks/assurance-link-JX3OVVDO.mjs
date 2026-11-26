import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  AssuranceBridgeError,
  AssuranceLinkError,
  BRIDGE_TEXT,
  LINK_HELP,
  LINK_TEXT,
  isDay,
  linkEvidence,
  listEvidenceLinks,
  renderLinkList,
  renderLinked,
  unlinkEvidence
} from "./chunk-S43G3BY2.mjs";
import {
  assuranceLang,
  fill
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

// scripts/assurance-link.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var [command, ...rest] = process.argv.slice(2);
var OPTIONS = {
  json: { type: "boolean", default: false },
  lang: { type: "string" },
  "as-of": { type: "string" },
  note: { type: "string" },
  evidence: { type: "string" },
  date: { type: "string" },
  expect: { type: "string" }
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

${LINK_HELP[LANG]}`);
  process.exit(2);
}
if (process.env[AGENT_TOKEN_ENV]) {
  console.error(`refused: ${LINK_TEXT.refused_agent[LANG]}`);
  process.exit(1);
}
if (!command || command === "help" || command === "--help") {
  console.log(LINK_HELP[LANG]);
  process.exit(command ? 0 : 2);
}
var values;
try {
  values = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true }).values;
} catch (error) {
  usage(error.message);
}
function lang() {
  const given = values.lang;
  if (given === void 0) return "en";
  if (given !== "en" && given !== "fa" && given !== "tr") usage(`--lang must be en, fa or tr (given ${given}).`);
  return given;
}
function asOf() {
  const given = values["as-of"];
  if (given === void 0) return /* @__PURE__ */ new Date(`${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}T00:00:00.000Z`);
  if (!isDay(given)) usage("--as-of must be a real calendar date, YYYY-MM-DD.");
  return /* @__PURE__ */ new Date(`${given}T00:00:00.000Z`);
}
function only(allowed) {
  for (const key of Object.keys(values)) {
    if (key === "json" || key === "lang" || allowed.includes(key)) continue;
    if (values[key] === void 0 || values[key] === false) continue;
    usage(`${command} does not take --${key}.`);
  }
}
function common() {
  if (values.note === void 0) usage(`${command} needs --note <kn_\u2026>.`);
  if (values.date !== void 0 && !isDay(values.date)) usage("--date must be a real calendar date, YYYY-MM-DD.");
  const expected = values.expect === void 0 ? void 0 : values.expect === "none" ? null : values.expect;
  return { ...values.date !== void 0 ? { linked_on: values.date } : {}, ...expected !== void 0 ? { expected_revision: expected } : {} };
}
function run() {
  if (!fs.existsSync(path.join(process.cwd(), "brand", "brand.config.yaml"))) throw new AssuranceBridgeError("not_a_brand", BRIDGE_TEXT.not_a_brand.en);
  const root = process.cwd();
  const language = lang();
  switch (command) {
    case "list": {
      only(["as-of"]);
      const result = listEvidenceLinks(root, { asOf: asOf() });
      console.log(values.json ? JSON.stringify(result, null, 2) : renderLinkList(result, language));
      return;
    }
    case "link": {
      only(["note", "evidence", "date", "expect"]);
      const extra = common();
      if (values.evidence === void 0) usage("link needs --evidence <ev-NNNN>.");
      const result = linkEvidence(root, { note_id: values.note, evidence_id: values.evidence, ...extra });
      console.log(values.json ? JSON.stringify({ ok: true, ...result }, null, 2) : renderLinked(result, language));
      return;
    }
    case "unlink": {
      only(["note", "date", "expect"]);
      const extra = common();
      const result = unlinkEvidence(root, { note_id: values.note, ...extra });
      console.log(values.json ? JSON.stringify({ ok: true, ...result }, null, 2) : renderLinked(result, language));
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
function message(error, language) {
  if (error.code === "refused") return LINK_TEXT.refused_agent[language];
  if (error.code === "not_a_brand") return BRIDGE_TEXT.not_a_brand[language];
  if (error.code === "invalid_link") return fill(BRIDGE_TEXT.invalid_link[language], { reason: error.message });
  if (error.code === "invalid_review") return fill(BRIDGE_TEXT.invalid_review[language], { reason: error.message });
  return fill(LINK_TEXT.rejected[language], { reason: error.message });
}
try {
  run();
} catch (error) {
  const language = assuranceLang(values.lang);
  if (error instanceof AssuranceBridgeError || error instanceof AssuranceLinkError) {
    const text = message(error, language);
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: text }, authorizes: [] }, null, 2));
    else console.error(`${error.code}: ${text}`);
    process.exit(1);
  }
  console.error(fill(LINK_TEXT.unexpected[language], { name: error?.name ?? "Error" }));
  process.exit(1);
}
