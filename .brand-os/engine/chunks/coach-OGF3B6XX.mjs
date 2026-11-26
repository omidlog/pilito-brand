import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  COACH_MODES,
  CoachError,
  coachAnalyze,
  coachNext,
  isCoachMode,
  renderCoachResult
} from "./chunk-UFA2RPL2.mjs";
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
  AGENT_TOKEN_ENV,
  InterviewEngine
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/coach.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:coach <command> [options]

  analyze --mode follow_up|quality_review|consistency_review [--question <id>] [--lang en|fa|tr] [--json]
                                   advice for one question (follow_up, quality_review) or for the brand
                                   (consistency_review, which takes --question only to narrow it)
  next [--lang en|fa|tr] [--json]  coach the question you answered last in this session

Modes:
  follow_up           0 or 1 clarifying question. When an existing canonical question covers the gap it
                      prints that id instead of writing a new question. unknown, skip, not relevant and
                      decide later are never reopened.
  quality_review      an explainable status (ready, needs_clarification, evidence_missing, needs_review,
                      not_applicable, insufficient_context) with at most two named deficits. No score.
  consistency_review  confirmed_conflict (the interview's own contradiction rules, unchanged),
                      potential_tension (a trade-off worth one question, from a few narrow rules),
                      needs_verification (a claim with no verified source) and, per rule, not_tested
                      when an input is still open. No score, no percentage.

Everything is advisory: authorizes is always empty. Changing an answer stays brand:interview, brand:review
and brand:approve. Nothing is cached or written. Refused while ${AGENT_TOKEN_ENV} is set; restricted
questions are refused with no value and no digest.`;
var [command, ...rest] = process.argv.slice(2);
var OPTIONS = {
  json: { type: "boolean", default: false },
  mode: { type: "string" },
  question: { type: "string" },
  lang: { type: "string" }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function lang(values2) {
  const given = values2.lang;
  if (given === void 0) return "en";
  if (given !== "en" && given !== "fa" && given !== "tr") usage(`--lang must be en, fa or tr (given ${given}).`);
  return given;
}
function print(values2, result) {
  console.log(values2.json ? JSON.stringify(result, null, 2) : renderCoachResult(result));
}
function run(values2) {
  if (!fs.existsSync(path.join(process.cwd(), "brand", "brand.config.yaml"))) {
    throw new CoachError("invalid_input", "This folder is not a Brand OS brand (brand/brand.config.yaml is missing). Run the command from the brand repository root.");
  }
  const engine = new InterviewEngine(process.cwd());
  switch (command) {
    case "analyze": {
      const mode = values2.mode;
      if (!isCoachMode(mode)) usage(`--mode must be one of ${COACH_MODES.join(", ")}${mode ? ` (given ${mode})` : ""}.`);
      print(values2, coachAnalyze(engine, { mode, questionId: values2.question ?? null, locale: lang(values2) }));
      return;
    }
    case "next": {
      if (values2.mode !== void 0) usage("next has no --mode: it runs follow_up on your last answer. Use analyze --mode for the other modes.");
      print(values2, coachNext(engine, { locale: lang(values2) }));
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
  run(values);
} catch (error) {
  if (error instanceof CoachError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). The coach is read-only, so nothing about the brand changed.`);
  process.exit(1);
}
