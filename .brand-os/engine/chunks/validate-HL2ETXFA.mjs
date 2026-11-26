import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  validateRepo
} from "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/validate.ts
var report = validateRepo(process.cwd());
for (const warning of report.warnings) console.warn(`warning: ${warning}`);
if (!report.ok) {
  console.error(report.errors.join("\n"));
  process.exit(1);
}
console.log(`Validation passed with ${report.warnings.length} warning(s).`);
