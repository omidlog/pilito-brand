import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  ENGINE_DIR,
  scaffoldBrand
} from "./chunk-6ZFVEKSX.mjs";
import "./chunk-YKITUD2J.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  templatePages
} from "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import {
  TOKEN_FILES,
  tokenBaseDir
} from "./chunk-HHMADR62.mjs";
import {
  STARTER_PROFILES,
  classifyPath,
  parseSyncManifest,
  readSyncManifest,
  readTemplateRecord,
  writeAtomic
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// scripts/engine/convert-cli.ts
import { parseArgs } from "node:util";

// scripts/engine/convert.ts
var import_yaml = __toESM(require_dist(), 1);
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// .brand-os/sync.json
var sync_default = {
  schema_version: 1,
  template: {
    repository: "omidlog/brand-os-template"
  },
  record: "brand/template-version.json",
  note: "Ordered rules; the first matching rule decides. core = owned by the template and replaced by an update. brand = owned by the brand and never touched. merge = merged line by line; a conflict is reported, never forced. A path no rule matches is treated as brand.",
  rules: [
    { kind: "brand", paths: ["brand/**"] },
    {
      kind: "brand",
      paths: [
        "apps/docs/src/data/*.json",
        "apps/docs/src/css/tokens.css",
        "apps/docs/generated/**",
        "apps/docs/static/llms.txt",
        "apps/docs/static/llms-full.txt",
        "apps/docs/static/release-manifest.json",
        "llms.txt",
        "llms-full.txt"
      ]
    },
    {
      kind: "merge",
      paths: ["package.json", "package-lock.json", ".gitignore", "README.md", "AGENTS.md", "CLAUDE.md", "CHANGELOG.md"]
    },
    {
      kind: "core",
      paths: [
        ".brand-os/**",
        ".github/**",
        "agent-skills/**",
        "apps/**",
        "docs/**",
        "docs-internal/**",
        "examples/**",
        "infra/**",
        "packages/**",
        "schemas/**",
        "scripts/**",
        "tests/**",
        ".dockerignore",
        ".env.example",
        ".gitattributes",
        "LICENSE",
        "eslint.config.js",
        "tsconfig.json"
      ]
    }
  ]
};

// scripts/engine/convert.ts
var LEGACY_DEFINITIONS = /^brand\/interview\/(question-bank\/[^/]+\.yaml|field-registry\.yaml|knowledge-graph\.yaml)$/;
var DOCS_OUTPUTS = /^(llms\.txt|llms-full\.txt|apps\/.*)$/;
var TEMPLATE_ROOT_FILES = /* @__PURE__ */ new Set(["package.json", "package-lock.json", "CHANGELOG.md", "README.md", "AGENTS.md", "CLAUDE.md"]);
var BRAND_DATA_GUARD = /^brand\/(instance|interview\/(answer-ledger|session-state|contradictions|evidence-|intake-log)|assets\/|tokens\/(generated|approvals)|knowledge|strategy|content-strategy\/|content-calendar\/|social\/|creative\/|competitive\/|\.private|restricted\/facts)/;
function trackedFiles(root2) {
  return execFileSync("git", ["ls-files", "-z"], { cwd: root2, encoding: "utf8" }).split("\0").filter(Boolean);
}
function templateBlobs(options, relative, cache) {
  const known = cache.get(relative);
  if (known) return known;
  const blobs = /* @__PURE__ */ new Set();
  if (options.templateDir) {
    try {
      const raw = execFileSync("git", ["-C", options.templateDir, "log", "--all", "--format=", "--raw", "--no-abbrev", "--", relative], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      for (const line of raw.split("\n")) {
        const parts = line.split(/\s+/);
        if (parts[3] && /^[0-9a-f]{40}$/.test(parts[3])) blobs.add(parts[3]);
      }
    } catch {
    }
  }
  cache.set(relative, blobs);
  return blobs;
}
function blobId(text) {
  return execFileSync("git", ["hash-object", "--stdin"], { input: text, encoding: "utf8" }).trim();
}
function convertBrand(root2, options = {}) {
  const report2 = { deleted: [], kept_edits: [], overrides: [], notes: [], scaffolded: [] };
  if (!fs.existsSync(path.join(root2, "brand", "brand.config.yaml"))) throw new Error("Not a Brand OS brand repository: brand/brand.config.yaml is missing.");
  const manifest = readSyncManifest(root2) ?? parseSyncManifest(JSON.stringify(sync_default));
  const pages = templatePages();
  const remove = (relative) => {
    if (BRAND_DATA_GUARD.test(relative)) throw new Error(`convert refused to delete brand data: ${relative}`);
    report2.deleted.push(relative);
    if (!options.dryRun) fs.rmSync(path.join(root2, relative), { force: true });
  };
  const blobCache = /* @__PURE__ */ new Map();
  const unchanged = (relative, own, engine) => own === engine || templateBlobs(options, relative, blobCache).has(blobId(own));
  for (const relative of trackedFiles(root2)) {
    if (relative.startsWith(`${ENGINE_DIR}/`)) continue;
    const own = fs.existsSync(path.join(root2, relative)) ? fs.readFileSync(path.join(root2, relative), "utf8") : null;
    if (own === null) continue;
    if (relative.startsWith("brand/")) {
      if (LEGACY_DEFINITIONS.test(relative)) remove(relative);
      else if (pages.has(relative)) {
        if (unchanged(relative, own, pages.get(relative) ?? null)) remove(relative);
        else report2.kept_edits.push(relative);
      } else if (/^brand\/tokens\/[^/]+\.json$/.test(relative)) {
        const name = path.basename(relative);
        if (TOKEN_FILES.includes(name) || name === "contrast-pairs.json") {
          const engine = fs.readFileSync(path.join(tokenBaseDir(), name), "utf8");
          if (unchanged(relative, own, engine)) remove(relative);
          else report2.kept_edits.push(relative);
        }
      }
      continue;
    }
    if (TEMPLATE_ROOT_FILES.has(relative) || DOCS_OUTPUTS.test(relative)) {
      remove(relative);
      continue;
    }
    const kind = classifyPath(manifest, relative).kind;
    if (kind === "core" || kind === "merge") {
      if (relative === ".gitignore") continue;
      remove(relative);
    }
  }
  const profilesDir = path.join(root2, "brand", "interview", "profiles");
  if (fs.existsSync(profilesDir)) {
    for (const name of fs.readdirSync(profilesDir).filter((entry) => entry.endsWith(".yaml"))) {
      const id = name.slice(0, -".yaml".length);
      const relative = `brand/interview/profiles/${name}`;
      const doc = (0, import_yaml.parse)(fs.readFileSync(path.join(profilesDir, name), "utf8")) ?? {};
      const ids = Array.isArray(doc.question_ids) ? doc.question_ids : [];
      const starter = STARTER_PROFILES.find((profile) => profile.id === id);
      let override;
      if (!starter) override = { id, title: doc.title ?? id, description: doc.description ?? "", exclusive: doc.exclusive === true, question_ids: ids };
      else {
        const add = ids.filter((questionId) => !starter.question_ids.includes(questionId));
        const missing = starter.question_ids.filter((questionId) => !ids.includes(questionId));
        if (missing.length) report2.notes.push(`${id}: the engine profile also asks ${missing.join(", ")}. If the brand removed them on purpose, list them under remove: in brand/overrides/profiles/${id}.yaml.`);
        override = add.length || (doc.exclusive ?? false) !== (starter.exclusive ?? false) ? { id, add, ...(doc.exclusive ?? false) !== (starter.exclusive ?? false) ? { exclusive: doc.exclusive === true } : {} } : null;
      }
      if (override) {
        const target = `brand/overrides/profiles/${name}`;
        report2.overrides.push(target);
        if (!options.dryRun) writeAtomic(path.join(root2, target), (0, import_yaml.stringify)(override));
      }
      remove(relative);
    }
  }
  if (!options.dryRun) {
    removeEmptyDirs(root2);
    const readme = path.join(root2, "README.md");
    if (!fs.existsSync(readme)) {
      const slug = path.basename(root2);
      writeAtomic(readme, `# ${slug}

Brand OS brand repository. Brand data lives in \`brand/\`; the engine in \`${ENGINE_DIR}/\` is written by engine updates.

Run \`npm run brand:next\` to see what to answer next, and \`npm run check\` to validate the brand.
`);
    }
    report2.scaffolded = scaffoldBrand(root2).written;
  }
  return report2;
}
function removeEmptyDirs(root2) {
  const walk = (dir) => {
    let empty = true;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        empty = false;
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (walk(full)) fs.rmdirSync(full);
        else empty = false;
      } else empty = false;
    }
    return empty;
  };
  walk(root2);
}

// scripts/engine/convert-cli.ts
var { values } = parseArgs({
  options: {
    "template-dir": { type: "string" },
    from: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    json: { type: "boolean", default: false }
  }
});
var root = process.cwd();
var fromCommit = values.from ?? readTemplateRecord(root)?.commit ?? null;
var report = convertBrand(root, { templateDir: values["template-dir"], fromCommit, dryRun: values["dry-run"] });
if (values.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${values["dry-run"] ? "DRY RUN: would remove" : "Removed"} ${report.deleted.length} template file(s).`);
  if (report.kept_edits.length) console.log(`Kept ${report.kept_edits.length} edited page(s) or token file(s) as brand overrides:
  ${report.kept_edits.join("\n  ")}`);
  if (report.overrides.length) console.log(`Profile overrides: ${report.overrides.join(", ")}`);
  for (const note of report.notes) console.log(`note: ${note}`);
  if (report.scaffolded.length) console.log(`Wrote ${report.scaffolded.join(", ")}.`);
}
