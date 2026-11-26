import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  scaffoldBrand
} from "./chunk-6ZFVEKSX.mjs";
import "./chunk-YKITUD2J.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  writeStarterWorkspace
} from "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  applyInit,
  cloudSyncAdvice,
  detectCloudSync,
  ensureApprovalSecret
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/engine/scaffold-cli.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var { values } = parseArgs({
  options: {
    new: { type: "boolean", default: false },
    name: { type: "string" },
    slug: { type: "string" },
    industry: { type: "string", default: "TBD" },
    profile: { type: "string" },
    facets: { type: "string" },
    languages: { type: "string", default: "en" },
    publish: { type: "string", default: "private" },
    json: { type: "boolean", default: false }
  }
});
var root = process.cwd();
if (values.new) {
  if (!values.name || !values.slug) {
    console.error('Usage: brand-os scaffold --new --name "Brand" --slug brand [--profile personal-brand] [--languages en,fa]');
    process.exit(2);
  }
  if (fs.existsSync(path.join(root, "brand", "brand.config.yaml"))) {
    console.error("brand/brand.config.yaml already exists. Refusing to create a new brand here.");
    process.exit(2);
  }
  writeStarterWorkspace(root);
  const languages = values.languages.split(",").map((item) => item.trim()).filter(Boolean);
  applyInit(root, {
    name: values.name,
    slug: values.slug,
    industry: values.industry,
    language: languages[0] ?? "en",
    languages,
    mascot: false,
    gamification: false,
    publish: values.publish === "public" ? "public" : "private",
    ...values.profile ? { profile: values.profile } : {},
    ...values.facets ? { facets: values.facets.split(",").map((item) => item.trim()).filter(Boolean) } : {}
  });
}
if (values.new) {
  const synced = detectCloudSync(root);
  if (synced) console.error(`WARNING: ${cloudSyncAdvice(synced, root)}`);
  else {
    ensureApprovalSecret(root);
  }
}
var result = scaffoldBrand(root, { slug: values.slug });
console.log(values.json ? JSON.stringify(result, null, 2) : result.written.length ? `Wrote ${result.written.join(", ")}.` : "Engine-owned root files are current.");
if (values.new && !values.json) {
  console.log(
    [
      "",
      "Next steps:",
      fs.existsSync(path.join(root, "brand", ".private", "approval-secret")) ? "  1. Keep the approval secret in the Keychain (macOS): npm run brand:doctor -- --store-proof-keychain" : "  1. Move this folder out of the synced folder, then: npm run brand:doctor -- --create-approval-secret",
      "  2. Answer the interview:              npm run brand:next",
      "  3. See and approve what is waiting:   npm run brand:pending, then npm run brand:approve -- --all-pending",
      "  4. Commit and push brand/ (brand/.private stays on this computer)."
    ].join("\n")
  );
}
