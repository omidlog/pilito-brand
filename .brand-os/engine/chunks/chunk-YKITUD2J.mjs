import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);

// scripts/engine/commands.ts
var BRAND_SUBCOMMANDS = [
  "init",
  "interview",
  "resume",
  "next",
  "propose",
  "status",
  "review",
  "export",
  "approve",
  "pending",
  "publish",
  "document",
  "tokens:generate",
  "tokens:approve",
  "tokens:publish",
  "assets",
  "query",
  "agent-token",
  "doctor",
  "finance",
  "backup",
  "restore",
  "migrate",
  "evidence",
  "retract",
  "reset"
];
var OWN_SCRIPTS = [
  "coach",
  "knowledge",
  "creative",
  "seo",
  "strategy",
  "competitive",
  "identity",
  "visual-dna",
  "content",
  "social",
  "runtime",
  "acceptance",
  "assurance",
  "assurance-review",
  "assurance-link",
  "pack"
];
var ENGINE_COMMANDS = {
  ...Object.fromEntries(BRAND_SUBCOMMANDS.map((sub) => [sub, { script: "brand", prefix: [sub], npm: `brand:${sub}` }])),
  // brand:validate (the brand CLI's validate) and validate (the repository check) are different commands.
  "brand-validate": { script: "brand", prefix: ["validate"], npm: "brand:validate" },
  ...Object.fromEntries(OWN_SCRIPTS.map((name) => [name, { script: name, prefix: [], npm: `brand:${name}` }])),
  "export-visual": { script: "export-visual", prefix: [], npm: "brand:export-visual", entry: "export-visual" },
  share: { script: "content", prefix: ["share", "--all"], npm: "brand:share" },
  mcp: { script: "mcp", prefix: [], npm: "mcp:serve" },
  validate: { script: "validate", prefix: [], npm: "validate" },
  // The docs portal is built from the template (its Docusaurus app); a data-only brand gets no script for these yet.
  "tokens:build": { script: "tokens-build", prefix: [], npm: null },
  "prepare-docs": { script: "prepare-docs", prefix: [], npm: null, entry: "prepare-docs" },
  check: { script: "check", prefix: [], npm: "check" },
  scaffold: { script: "scaffold", prefix: [], npm: "brand-os:scaffold" },
  convert: { script: "convert", prefix: [], npm: null }
};
function brandPackageScripts(engineFile = ".brand-os/engine/brand-os.mjs") {
  const scripts = {};
  for (const [command, spec] of Object.entries(ENGINE_COMMANDS)) if (spec.npm) scripts[spec.npm] = `node ${engineFile} ${command}`;
  return Object.fromEntries(Object.entries(scripts).sort(([a], [b]) => a.localeCompare(b)));
}

export {
  ENGINE_COMMANDS,
  brandPackageScripts
};
