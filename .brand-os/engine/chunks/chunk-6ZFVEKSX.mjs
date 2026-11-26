import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  brandPackageScripts
} from "./chunk-YKITUD2J.mjs";
import {
  writeAtomic
} from "./chunk-HOCT4QOE.mjs";

// scripts/engine/scaffold.ts
import fs from "node:fs";
import path from "node:path";
var ENGINE_DIR = ".brand-os/engine";
var BRAND_WORKFLOW = ".github/workflows/brand.yml";
var BRAND_CHECK_JOB = "brand-check";
var GITIGNORE = [
  "node_modules/",
  "brand/.private/",
  "brand/restricted/facts.yaml",
  "brand/restricted/drafts/",
  "brand/restricted/finance/",
  "brand/generated/artifacts/",
  "brand/exports/",
  "dist/",
  ".env"
];
var BRAND_WORKFLOW_TEXT = `# Brand check: validates this brand's own data with the engine committed in ${ENGINE_DIR}.
# Engine tests run once, in the template, before an engine release; a brand never runs them.
# Written by the Brand OS engine; an engine update rewrites it.
name: brand-check

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

concurrency:
  group: brand-check-\${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  ${BRAND_CHECK_JOB}:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: brand check
        run: node ${ENGINE_DIR}/brand-os.mjs check
`;
function agentSource(name) {
  const engineDir = process.env.BRAND_OS_ENGINE_ASSETS ? path.dirname(process.env.BRAND_OS_ENGINE_ASSETS) : null;
  if (engineDir && fs.existsSync(path.join(engineDir, "agents", name))) return path.join(engineDir, "agents", name);
  return path.resolve(import.meta.dirname, "..", "..", name);
}
function brandAgentText(text, version) {
  const rewritten = text.replace(/(^|[\s`(])docs-internal\//g, `$1${ENGINE_DIR}/docs-internal/`).replace(/(^|[\s`(])agent-skills\//g, `$1${ENGINE_DIR}/agent-skills/`).replace(/(^|[\s`(])examples\//g, `$1${ENGINE_DIR}/examples/`);
  return `<!-- Written by the Brand OS engine ${version}; an engine update rewrites this file. Brand-specific notes go in brand/AGENTS.local.md. -->
${rewritten}`;
}
function write(root, relative, text, written) {
  const file = path.join(root, relative);
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === text) return;
  writeAtomic(file, text);
  written.push(relative);
}
function scaffoldBrand(root, options = {}) {
  const written = [];
  const version = options.version ?? process.env.BRAND_OS_ENGINE_VERSION ?? "development";
  const pkgFile = path.join(root, "package.json");
  const current = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, "utf8")) : null;
  const templateCopy = !current || "workspaces" in current;
  const pkg = templateCopy ? {
    name: `${options.slug ?? path.basename(root)}-brand`.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    private: true,
    type: "module",
    description: "Brand OS brand repository: brand data in brand/, the engine in .brand-os/engine.",
    engines: { node: ">=22" }
  } : { ...current };
  pkg.scripts = { ...templateCopy ? {} : current?.scripts ?? {}, ...brandPackageScripts() };
  write(root, "package.json", `${JSON.stringify(pkg, null, 2)}
`, written);
  write(root, BRAND_WORKFLOW, BRAND_WORKFLOW_TEXT, written);
  for (const name of ["AGENTS.md", "CLAUDE.md"]) {
    const source = agentSource(name);
    if (fs.existsSync(source)) write(root, name, brandAgentText(fs.readFileSync(source, "utf8"), version), written);
  }
  const ignoreFile = path.join(root, ".gitignore");
  const ignore = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, "utf8") : "";
  const lines = new Set(ignore.split("\n").map((line) => line.trim()));
  const missing = GITIGNORE.filter((line) => !lines.has(line));
  if (missing.length) write(root, ".gitignore", `${ignore}${ignore && !ignore.endsWith("\n") ? "\n" : ""}${missing.join("\n")}
`, written);
  return { written };
}

export {
  ENGINE_DIR,
  scaffoldBrand
};
