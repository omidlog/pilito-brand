import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import "./chunk-WYMAWFWM.mjs";
import {
  DEMO_BANNER,
  DEMO_NOW,
  RuntimeError,
  createDemoBrand,
  createOutliner,
  demoPack,
  loadApprovedLogo,
  openOwnerWorkspace,
  packAssetIds,
  packSourceDrift,
  parseRequiredAssets,
  productionReadiness,
  productionText,
  readBatchDir,
  readPackFile,
  runSocialBatch,
  writeBatch
} from "./chunk-GG6T6WX5.mjs";
import {
  MAX_ASSET_IDS,
  runVisualDnaTool
} from "./chunk-P266KQFD.mjs";
import "./chunk-PBBSGXWH.mjs";
import "./chunk-UFA2RPL2.mjs";
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
  operatorContext
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-CONY5BIZ.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/runtime.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:runtime social-batch (--demo | --pack <file> [--root <dir>]) --out <empty dir>
                           [--final --font-file <ttf|otf>...] [--locale fa|en|tr] [--require logo] [--png] [--json]
brand:runtime readiness --pack <file> [--root <dir>] [--batch <dir>] [--require logo] [--locale fa|en|tr] [--json]

  --demo     use the SYNTHETIC DEMO brand (temp workspace, removed afterwards)
  --pack     a real brand's social_batch pack file: the output of
             brand:query --tool task_context --task-type social_batch --count 10 [--locale fa]
             verified like the demo pack; the pack's own task locale is used
  --root     with --pack only, owner-local: the owner's checkout of the same brand. Enables the Coach and the
             approved logo (publication gate + checksum), and refuses a stale pack (a cited approved fact
             changed since the pack was built). Read-only; refused under an agent token
  --as-of    with --pack: ISO date for the Coach and the assessment (default: now)
  --final    final export: convert text to outlines (drafts keep live, editable text). Needs an approved
             brand.type.scale and --font-file for every approved first family; nothing is substituted
  --font-file  repeatable, with --final: a local TTF/OTF of an approved family (recorded by name + sha256)
  --out      an empty or new directory outside any brand/ folder; nothing is written anywhere else
  --locale   with --demo: labels and direction (default fa). Approved copy is never translated.
  --png      also write PNG previews to <out>/previews (resvg; previews are not deliverables and not hashed)
  --require  repeatable, owner task input: an asset this task must carry (logo). A required logo that is
             missing, changed, withheld or unverifiable makes production not_ready. Optional assets never block
  --json     print the batch summary (social-batch) or the projection (readiness) as JSON

social-batch  exit 0 when production is ready; exit 3 when it is not_ready (the drafts are still written).

readiness   production readiness of a pack (separate from the pack's own context readiness). --root checks the
            pack's assets through Visual DNA as the owner; --batch re-checks a social-batch output directory on its
            bytes. --locale sets the labels (default: the pack's locale). Exit 0 ready, 3 not_ready.

Every output is a draft for human review: authorizes is always empty.`;
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
async function previews(out, result) {
  try {
    const { Resvg } = await import("@resvg/resvg-js");
    fs.mkdirSync(path.join(out, "previews"), { recursive: true });
    for (const manifest of result.manifests) {
      const svg = result.files.get(manifest.file);
      const png = new Resvg(svg, { fitTo: { mode: "width", value: 1080 }, font: { loadSystemFonts: true } }).render().asPng();
      fs.writeFileSync(path.join(out, "previews", `${manifest.post_id}.png`), png, { flag: "wx" });
    }
    return `previews: ${result.manifests.length} PNG files in ${path.join(out, "previews")} (system fonts; not hashed)`;
  } catch (error) {
    return `previews: unavailable (${error instanceof Error ? error.message.slice(0, 120) : "unknown error"})`;
  }
}
async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "help") {
    console.log(HELP);
    return;
  }
  if (command === "readiness") return readiness(rest);
  if (command !== "social-batch") usage(`Unknown command "${command}".`);
  let values;
  try {
    values = parseArgs({
      args: rest,
      options: { demo: { type: "boolean", default: false }, pack: { type: "string" }, root: { type: "string" }, "as-of": { type: "string" }, final: { type: "boolean", default: false }, "font-file": { type: "string", multiple: true }, out: { type: "string" }, locale: { type: "string" }, require: { type: "string", multiple: true }, png: { type: "boolean", default: false }, json: { type: "boolean", default: false } },
      allowPositionals: false,
      strict: true
    }).values;
  } catch (error) {
    usage(error instanceof Error ? error.message : String(error));
  }
  if (values.demo === Boolean(values.pack)) usage("Pass exactly one of --demo (the SYNTHETIC DEMO brand) or --pack <file> (a real brand's task_context pack).");
  if (!values.out) usage("--out <dir> is required.");
  if (values.demo && (values.root || values["as-of"])) usage("--root and --as-of apply to --pack only.");
  if (values.pack && values.locale) usage("--locale applies to --demo only: a pack carries its own task locale (brand:query --locale).");
  const locale = values.locale ?? "fa";
  if (locale !== "fa" && locale !== "en" && locale !== "tr") usage(`--locale must be fa, en or tr (given ${locale}).`);
  if (!values.final && values["font-file"]?.length) usage("--font-file applies to --final only.");
  const required = requiredOf(values.require);
  const out = path.resolve(values.out);
  const final = values.final ? await createOutliner(values["font-file"] ?? []) : null;
  let result;
  let production;
  if (values.demo) {
    const demo = createDemoBrand();
    try {
      const pack = demoPack(demo, locale);
      const { logo, considered, references } = loadApprovedLogo(demo.root, pack);
      result = runSocialBatch(pack, { demo: true, demoBanner: DEMO_BANNER, logo, logoConsidered: considered, coach: demo.engine, now: DEMO_NOW, origin: "demo", final });
      production = productionReadiness({ pack, required_assets: required, references, batch: result });
    } finally {
      demo.cleanup();
    }
  } else {
    const now = values["as-of"] ? new Date(values["as-of"]) : /* @__PURE__ */ new Date();
    if (Number.isNaN(now.getTime())) usage("--as-of must be an ISO date.");
    const pack = readPackFile(values.pack);
    const engine = values.root ? openOwnerWorkspace(values.root, pack) : null;
    const drift = engine ? packSourceDrift(engine, pack) : null;
    if (drift && drift.length > 0) throw new RuntimeError("stale_pack", `The pack is stale: ${drift.length} cited approved fact(s) changed since it was built (${drift.join(", ")}). Rebuild it with brand:query --tool task_context. Nothing was written.`);
    const loaded = engine ? loadApprovedLogo(engine.workspaceRoot(), pack) : null;
    result = runSocialBatch(pack, { demo: false, logo: loaded?.logo ?? null, logoConsidered: loaded?.considered ?? null, coach: engine, now, origin: "pack_file", final });
    production = productionReadiness({ pack, required_assets: required, references: loaded ? loaded.references : null, batch: result, source_drift: drift });
  }
  result.files.set("production-readiness.json", `${JSON.stringify(production, null, 2)}
`);
  const written = writeBatch(out, result);
  const note = values.png ? await previews(out, result) : null;
  if (production.production_ready !== "ready") {
    process.exitCode = 3;
    console.error(productionText(production.locale).labels.not_ready_exit);
  }
  if (values.json) {
    console.log(JSON.stringify(result.summary, null, 2));
    return;
  }
  const s = result.summary;
  if (s.demo) console.log(`${DEMO_BANNER}`);
  console.log(`status: ${s.status}  posts: ${s.posts.length}  pack: ${s.context.pack_sha256.slice(0, 12)} (${s.context.origin}, ${s.context.pack_readiness}, ${s.context.pack_staleness})`);
  console.log(`export: ${result.manifests[0]?.export.mode ?? (final ? "final" : "draft")} (${final ? "text outlined with the supplied fonts" : "live, editable text"})`);
  for (const blocker of s.blockers) console.log(`  blocked: ${blocker.code}`);
  for (const post of s.posts) console.log(`  ${post.post_id}  ${post.angle.padEnd(17)} ${post.layout.padEnd(9)} pass ${post.checks.pass}  warn ${post.checks.warn}  fail ${post.checks.fail}  ${post.sha256.slice(0, 12)}`);
  for (const check of s.set_checks) console.log(`  set ${check.check_id.padEnd(24)} ${check.result}`);
  for (const layer of s.layers) console.log(`  layer ${layer.layer}: ${layer.called ? "called" : `not called (${layer.skipped_reason})`}, ${layer.results.length} result(s)`);
  for (const warning of s.warnings) console.log(`  warn coach ${warning.question_id ?? "brand"}: ${warning.status} (${warning.codes.join(", ")}) \u2014 advice, does not block`);
  console.log(`production: ${production.production_ready} (${production.blockers.length} blocker(s); see production-readiness.json)`);
  for (const blocker of production.blockers) console.log(`  blocked by ${blocker.check_id} [${blocker.rule_owner}] ${blocker.input}: ${blocker.code}`);
  console.log(`files: ${written.length} written to ${out}`);
  if (note) console.log(note);
  console.log("Drafts for human review. Nothing was published, scheduled, spent, deployed or approved; authorizes: [].");
}
function requiredOf(values) {
  const required = parseRequiredAssets(values ?? []);
  if (required === null) usage("--require takes: logo.");
  return required;
}
function readiness(args) {
  let values;
  try {
    values = parseArgs({
      args,
      options: { pack: { type: "string" }, root: { type: "string" }, batch: { type: "string" }, require: { type: "string", multiple: true }, locale: { type: "string" }, json: { type: "boolean", default: false } },
      allowPositionals: false,
      strict: true
    }).values;
  } catch (error) {
    usage(error instanceof Error ? error.message : String(error));
  }
  if (!values.pack) usage("readiness needs --pack <file> (the output of brand:query --tool task_context).");
  if (values.locale && values.locale !== "fa" && values.locale !== "en" && values.locale !== "tr") usage(`--locale must be fa, en or tr (given ${values.locale}).`);
  const required = requiredOf(values.require);
  const pack = readPackFile(values.pack);
  let references = null;
  let drift = null;
  if (values.root) {
    const engine = openOwnerWorkspace(values.root, pack);
    drift = packSourceDrift(engine, pack);
    const ids = packAssetIds(pack).slice(0, MAX_ASSET_IDS);
    const dna = ids.length > 0 ? runVisualDnaTool(engine, operatorContext(pack.brand_id), { asset_ids: ids }) : null;
    references = dna === null ? [] : dna.status === "ok" ? dna.references : null;
  }
  const batch = values.batch ? readBatchDir(values.batch) : null;
  const locale = values.locale ?? pack.task.locale;
  const result = productionReadiness({ pack, locale, required_assets: required, references, batch, source_drift: drift });
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else {
    const t = productionText(locale);
    console.log(`${t.labels.production}: ${t.states[result.production_ready]} (${result.production_ready})  ${t.labels.stage}: ${result.stage}  ${t.labels.context}: ${result.context.readiness}  ${t.labels.renderer}: ${result.renderer.name ?? t.labels.none}`);
    console.log(result.meaning);
    for (const check of result.checks) {
      console.log(`  [${t.verdicts[check.verdict]}]${check.blocks ? ` ${t.labels.blocks}` : ""} ${check.label} \u2014 ${t.labels.owner}: ${check.rule_owner}; ${t.labels.input}: ${check.input}`);
    }
    console.log(t.labels.human_review);
  }
  process.exitCode = result.production_ready === "ready" ? 0 : 3;
}
main().catch((error) => {
  if (error instanceof RuntimeError) {
    console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  throw error;
});
