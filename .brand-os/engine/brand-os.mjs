import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  ENGINE_COMMANDS
} from "./chunks/chunk-YKITUD2J.mjs";
import "./chunks/chunk-QDMMEM6P.mjs";

// scripts/engine/entry.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var here = path.dirname(fileURLToPath(import.meta.url));
var assets = path.join(here, "assets");
if (fs.existsSync(assets)) process.env.BRAND_OS_ENGINE_ASSETS ??= assets;
var versionFile = path.join(here, "VERSION");
if (fs.existsSync(versionFile)) process.env.BRAND_OS_ENGINE_VERSION ??= fs.readFileSync(versionFile, "utf8").trim();
var loaders = {
  brand: () => import("./chunks/brand-HS25QTX2.mjs"),
  coach: () => import("./chunks/coach-OGF3B6XX.mjs"),
  knowledge: () => import("./chunks/knowledge-3EGTFQ3O.mjs"),
  creative: () => import("./chunks/creative-3BMY55S4.mjs"),
  seo: () => import("./chunks/seo-VQUSFJAZ.mjs"),
  strategy: () => import("./chunks/strategy-DHA4XU57.mjs"),
  competitive: () => import("./chunks/competitive-3ZOMVCV4.mjs"),
  identity: () => import("./chunks/identity-K7G2CIJ5.mjs"),
  "visual-dna": () => import("./chunks/visual-dna-BFYEQIUD.mjs"),
  content: () => import("./chunks/content-R3GY4VAU.mjs"),
  social: () => import("./chunks/social-DEWYSFUP.mjs"),
  runtime: () => import("./chunks/runtime-LW5TCD2W.mjs"),
  pack: () => import("./chunks/pack-54MSJ7GM.mjs"),
  acceptance: () => import("./chunks/acceptance-3YDDQYAE.mjs"),
  assurance: () => import("./chunks/assurance-6AJXJPL2.mjs"),
  "assurance-review": () => import("./chunks/assurance-review-IWC4OJLE.mjs"),
  "assurance-link": () => import("./chunks/assurance-link-JX3OVVDO.mjs"),
  "export-visual": () => import("./chunks/export-visual-WFKMZL4I.mjs"),
  mcp: () => import("./chunks/mcp-I4Q5EKC4.mjs"),
  validate: () => import("./chunks/validate-HL2ETXFA.mjs"),
  "tokens-build": () => import("./chunks/cli-QWEDZ2KU.mjs"),
  "prepare-docs": () => import("./chunks/prepare-docs-34CPA3VL.mjs"),
  check: () => import("./chunks/check-3HPAEMRY.mjs"),
  scaffold: () => import("./chunks/scaffold-cli-K7ITXUVE.mjs"),
  convert: () => import("./chunks/convert-cli-Z2V7HPPT.mjs")
};
var [command, ...args] = process.argv.slice(2);
if (command === void 0 || command === "help" || command === "--help") {
  console.log(`Brand OS engine ${process.env.BRAND_OS_ENGINE_VERSION ?? "(development)"}
Usage: brand-os <command> [args]
Commands: ${Object.keys(ENGINE_COMMANDS).sort().join(", ")}
In a brand repository use the npm scripts (npm run brand:interview, npm run check \u2026).`);
  process.exit(command === void 0 ? 1 : 0);
}
if (command === "version" || command === "--version") {
  console.log(process.env.BRAND_OS_ENGINE_VERSION ?? "development");
  process.exit(0);
}
var spec = ENGINE_COMMANDS[command];
if (!spec) {
  console.error(`Unknown command ${command}. Run brand-os help for the list.`);
  process.exit(2);
}
var load = loaders[spec.script];
if (!load) throw new Error(`No loader for ${spec.script}`);
process.argv = [process.argv[0] ?? "node", path.join(here, spec.entry ?? spec.script), ...spec.prefix, ...args];
if (spec.entry) process.env.BRAND_OS_ENTRY = spec.entry;
await load();
