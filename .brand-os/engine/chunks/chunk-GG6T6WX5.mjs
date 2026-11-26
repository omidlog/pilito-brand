import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  ASSET_ID_PATTERN,
  MAX_ASSET_IDS,
  VisualDnaError,
  readVerifiedAsset,
  resolveVisualDna,
  runVisualDnaTool
} from "./chunk-P266KQFD.mjs";
import {
  POSITIONING_READINESS,
  POSITIONING_READINESS_CONTROLS,
  SYNTHETIC_DEMO_BANNER,
  assess
} from "./chunk-PBBSGXWH.mjs";
import {
  CoachError,
  coachAnalyze
} from "./chunk-UFA2RPL2.mjs";
import {
  TASK_CONTEXT_SCHEMA,
  TASK_CONTEXT_TOOL,
  TASK_LOCALES,
  buildTaskContext,
  runTaskContextTool,
  taskContextAccess,
  verifyPack
} from "./chunk-4QCLP6RD.mjs";
import {
  writeStarterWorkspace
} from "./chunk-Z4VEC43P.mjs";
import {
  buildContentStrategy,
  claimConflicts,
  splitItems
} from "./chunk-ZYAYDNGS.mjs";
import {
  approveRevision,
  proposeRevision
} from "./chunk-5OMKZSIF.mjs";
import {
  contrastRatio
} from "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  agentTokenContext,
  allQuestions,
  appendAccessLog,
  canonicalJson,
  ensureApprovalSecret,
  openWorkspace,
  operatorContext,
  parseStructured,
  readFacts,
  sha256Hex
} from "./chunk-HOCT4QOE.mjs";
import {
  normalizeSvg
} from "./chunk-CONY5BIZ.mjs";
import {
  checkSvg,
  effectiveModelUse,
  svgPublicationIssues
} from "./chunk-QXBDJJNV.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// packages/brand-core/src/runtime/model.ts
var RUNTIME_POST_SCHEMA = "brand-os/runtime-post-manifest/v1";
var RUNTIME_BATCH_SCHEMA = "brand-os/runtime-batch/v1";
var RUNTIME_RENDERER = "brand-os-svg-post-renderer";
var RUNTIME_RENDERER_VERSION = "1.1.0";
var POST_FORMAT = { id: "instagram-portrait-1080x1350", width: 1080, height: 1350, media_type: "image/svg+xml" };
var SOCIAL_BATCH_COUNT = 10;
var RUNTIME_PERMISSIONS = {
  publish: false,
  schedule: false,
  spend: false,
  deploy: false,
  approve: false
};
var RuntimeError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
};

// packages/brand-core/src/runtime/pack.ts
import fs from "node:fs";
import path from "node:path";
var MAX_PACK_BYTES = 2e6;
var SECTION_NAMES = ["identity", "strategy", "creative", "production"];
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function assertPackShape(value) {
  const fail = (what) => {
    throw new RuntimeError("invalid_pack", `Not a ${TASK_CONTEXT_SCHEMA} pack: ${what}.`);
  };
  if (!isObject(value)) fail("not a JSON object");
  const pack = value;
  if (pack.schema !== TASK_CONTEXT_SCHEMA) fail(`schema is not ${TASK_CONTEXT_SCHEMA}`);
  if (typeof pack.brand_id !== "string" || pack.brand_id.length === 0) fail("brand_id is missing");
  if (!isObject(pack.task) || typeof pack.task.type !== "string" || typeof pack.task.deliverable_count !== "number" || typeof pack.task.locale !== "string") fail("task is incomplete");
  if (!isObject(pack.sections) || !SECTION_NAMES.every((name) => Array.isArray(pack.sections[name]))) fail("sections are incomplete");
  for (const name of SECTION_NAMES) {
    for (const item of pack.sections[name]) if (!isObject(item) || typeof item.key !== "string" || typeof item.state !== "string") fail(`an item in ${name} is malformed`);
  }
  if (!Array.isArray(pack.sources) || !pack.sources.every((source) => isObject(source) && typeof source.id === "string")) fail("sources are malformed");
  if (!Array.isArray(pack.missing)) fail("missing is not a list");
  if (!isObject(pack.digests) || typeof pack.digests.context_sha256 !== "string") fail("the digest is missing");
  if (!Array.isArray(pack.authorizes) || !isObject(pack.permissions)) fail("authorizes/permissions are missing");
}
function readPackFile(file) {
  const full = path.resolve(file);
  let stat;
  try {
    stat = fs.lstatSync(full);
  } catch {
    throw new RuntimeError("invalid_pack", "The pack file does not exist.");
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new RuntimeError("invalid_pack", "The pack path must be a regular file, not a link or a directory.");
  if (stat.size > MAX_PACK_BYTES) throw new RuntimeError("invalid_pack", `The pack file is larger than ${MAX_PACK_BYTES} bytes; a task_context pack is never that large.`);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    throw new RuntimeError("invalid_pack", "The pack file is not valid JSON.");
  }
  if (isObject(parsed) && parsed.tool === TASK_CONTEXT_TOOL) {
    if (parsed.status !== "ok") throw new RuntimeError("invalid_pack", `The task_context result has status ${String(parsed.status)}, not ok: there is no pack to render.`);
    if (!Array.isArray(parsed.authorizes) || parsed.authorizes.length !== 0) throw new RuntimeError("invalid_pack", "A task_context result never authorizes anything.");
    assertPackShape(parsed.data);
    if (parsed.brand_id !== parsed.data.brand_id) throw new RuntimeError("invalid_pack", "The task_context result and its pack name different brands.");
    return parsed.data;
  }
  assertPackShape(parsed);
  return parsed;
}
function openOwnerWorkspace(root, pack) {
  if (process.env[AGENT_TOKEN_ENV]) throw new RuntimeError("refused", `The owner workspace is read by the owner process only. Refusing while ${AGENT_TOKEN_ENV} is set.`);
  const full = path.resolve(root);
  if (!fs.existsSync(path.join(full, "brand", "brand.config.yaml"))) throw new RuntimeError("refused", "The workspace has no brand/brand.config.yaml.");
  const engine = new InterviewEngine(full);
  const slug = engine.config().brand.slug;
  if (slug !== pack.brand_id) throw new RuntimeError("refused", "The workspace is a different brand than the pack (brand slug and pack brand_id differ).");
  return engine;
}
function packSourceDrift(engine, pack) {
  const bank = new Set(allQuestions().map((question) => question.id));
  const facts = readFacts(engine.workspaceRoot(), "approved", pack.brand_id);
  const drift = [];
  for (const source of pack.sources) {
    if (!bank.has(source.id) || source.status !== "approved") continue;
    const fact = facts[source.id];
    if (!fact || fact.status !== "approved") drift.push(`${source.id}:no_longer_approved`);
    else if (fact.revision_hash !== source.revision) drift.push(`${source.id}:revision_changed`);
  }
  return drift.sort();
}

// packages/brand-core/src/runtime/production-i18n.ts
var PRODUCTION_TEXT = {
  en: {
    notice: [
      "Production readiness is a separate view. It does not change the task_context readiness, which is about context only.",
      "Only objective, deterministic rules block: a wrong digest or checksum, blocked usage rights, a banned claim, a missing renderer or format, a missing required logo, an unsafe file.",
      "Visual taste, visual similarity and persuasion are not tested here. A person reviews every draft. There is no score.",
      "It authorizes nothing: no publication, schedule, spend, deployment, approval or upload. No asset bytes are given to an agent."
    ],
    meaning: {
      ready: "No deterministic blocker was found. This is not approval and not a quality verdict: human review is still required.",
      not_ready: "At least one deterministic rule blocks production. The blockers name the rule, its owner and the input."
    },
    states: { ready: "ready", not_ready: "not ready" },
    verdicts: { pass: "pass", warn: "warn", fail: "fail", not_tested: "not tested", needs_human_review: "needs human review" },
    checks: {
      "context.pack_integrity": "Context pack digest",
      "context.readiness": "Context readiness (task_context)",
      "context.staleness": "Context freshness",
      "context.source_drift": "Cited facts unchanged since the pack was built",
      "renderer.available": "Verified renderer for this task",
      "output.format": "Supported output format and count",
      "plan.copy": "Approved copy and palette for every deliverable",
      "copy.claims": "Banned claims in the copy",
      "asset.reference": "Asset reference (Visual DNA)",
      "asset.required_logo": "Required logo",
      "artifact.checks": "Artifact checks",
      "artifact.pack_pin": "Artifacts pinned to this pack",
      "artifact.file_sha256": "Artifact file checksums",
      "artifact.svg_safety": "Artifact SVG safety (re-checked on the bytes)",
      "artifact.required_logo": "Required logo in every artifact",
      "svg.allowlist": "SVG allowlist",
      "svg.publication_gate": "SVG publication gate",
      "svg.normalized": "SVG already normalized",
      "post.format": "Post format",
      "post.headline_fit": "Headline fit",
      "post.signoff_fit": "Sign-off fit",
      "color.contrast": "Colour contrast",
      "pack.digest": "Pack digest (batch)",
      "pack.staleness": "Pack freshness (batch)",
      "set.count": "Deliverable count",
      "set.distinct_files": "Distinct files",
      "set.distinct_messages": "Distinct messages",
      "set.layout_variety": "Layout variety",
      "coach.advice": "Strategic Coach advice",
      "review.visual_taste": "Visual taste and similarity",
      "review.semantic": "Persuasion and meaning"
    },
    labels: { production: "production", stage: "stage", context: "context", renderer: "renderer", blocks: "blocks", owner: "owner", input: "input", none: "none", human_review: "Human review required. Nothing was approved, published, scheduled, spent or deployed; authorizes: [].", not_ready_exit: "The drafts were written, but production is not ready: exit code 3. See production-readiness.json." }
  },
  fa: {
    notice: [
      "\u0622\u0645\u0627\u062F\u06AF\u06CC \u062A\u0648\u0644\u06CC\u062F \u06CC\u06A9 \u0646\u0645\u0627\u06CC \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u0627\u0633\u062A \u0648 \u0645\u0639\u0646\u0627\u06CC readiness \u062F\u0631 task_context \u0631\u0627\u060C \u06A9\u0647 \u0641\u0642\u0637 \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u06A9\u0627\u0646\u062A\u06A9\u0633\u062A \u0627\u0633\u062A\u060C \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
      "\u0641\u0642\u0637 \u0642\u0627\u0639\u062F\u0647\u200C\u0647\u0627\u06CC \u0639\u06CC\u0646\u06CC \u0648 \u0642\u0637\u0639\u06CC \u062C\u0644\u0648\u06CC \u06A9\u0627\u0631 \u0631\u0627 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u0646\u062F: digest \u06CC\u0627 checksum \u0646\u0627\u062F\u0631\u0633\u062A\u060C \u062D\u0642 \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0645\u0633\u062F\u0648\u062F\u060C \u0627\u062F\u0639\u0627\u06CC \u0645\u0645\u0646\u0648\u0639\u060C \u0646\u0628\u0648\u062F\u0650 renderer \u06CC\u0627 \u0642\u0627\u0644\u0628\u060C \u0646\u0628\u0648\u062F\u0650 \u0644\u0648\u06AF\u0648\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC\u060C \u0641\u0627\u06CC\u0644 \u0646\u0627\u0627\u0645\u0646.",
      "\u0633\u0644\u06CC\u0642\u0647\u0654 \u0628\u0635\u0631\u06CC\u060C \u0634\u0628\u0627\u0647\u062A \u0628\u0635\u0631\u06CC \u0648 \u0642\u062F\u0631\u062A \u0627\u0642\u0646\u0627\u0639 \u0627\u06CC\u0646\u062C\u0627 \u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u0647\u0631 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0631\u0627 \u06CC\u06A9 \u0627\u0646\u0633\u0627\u0646 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0647\u06CC\u0686 \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u062F\u0631 \u06A9\u0627\u0631 \u0646\u06CC\u0633\u062A.",
      "\u0627\u06CC\u0646 \u062E\u0631\u0648\u062C\u06CC \u0647\u06CC\u0686 \u0645\u062C\u0648\u0632\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F: \u0646\u0647 \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u0646\u0647 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0646\u0647 \u0647\u0632\u06CC\u0646\u0647\u060C \u0646\u0647 \u0627\u0633\u062A\u0642\u0631\u0627\u0631\u060C \u0646\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0648 \u0646\u0647 \u0622\u067E\u0644\u0648\u062F. \u0647\u06CC\u0686 \u0628\u0627\u06CC\u062A\u06CC \u0627\u0632 asset \u0628\u0647 agent \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F."
    ],
    meaning: {
      ready: "\u0647\u06CC\u0686 \u0645\u0627\u0646\u0639 \u0642\u0637\u0639\u06CC\u200C\u0627\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F. \u0627\u06CC\u0646 \u0628\u0647 \u0645\u0639\u0646\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F \u06CC\u0627 \u06A9\u06CC\u0641\u06CC\u062A \u0646\u06CC\u0633\u062A: \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0627\u0646\u0633\u0627\u0646\u06CC \u0647\u0645\u0686\u0646\u0627\u0646 \u0644\u0627\u0632\u0645 \u0627\u0633\u062A.",
      not_ready: "\u062F\u0633\u062A\u200C\u06A9\u0645 \u06CC\u06A9 \u0642\u0627\u0639\u062F\u0647\u0654 \u0642\u0637\u0639\u06CC \u062C\u0644\u0648\u06CC \u062A\u0648\u0644\u06CC\u062F \u0631\u0627 \u06AF\u0631\u0641\u062A\u0647 \u0627\u0633\u062A. \u0647\u0631 \u0645\u0627\u0646\u0639\u060C \u0642\u0627\u0639\u062F\u0647\u060C \u0645\u0627\u0644\u06A9 \u0622\u0646 \u0648 \u0648\u0631\u0648\u062F\u06CC \u0631\u0627 \u0646\u0627\u0645 \u0645\u06CC\u200C\u0628\u0631\u062F."
    },
    states: { ready: "\u0622\u0645\u0627\u062F\u0647", not_ready: "\u0622\u0645\u0627\u062F\u0647 \u0646\u06CC\u0633\u062A" },
    verdicts: { pass: "\u0642\u0628\u0648\u0644", warn: "\u0647\u0634\u062F\u0627\u0631", fail: "\u0631\u062F", not_tested: "\u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F", needs_human_review: "\u0646\u06CC\u0627\u0632\u0645\u0646\u062F \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0627\u0646\u0633\u0627\u0646\u06CC" },
    checks: {
      "context.pack_integrity": "digest \u0628\u0633\u062A\u0647\u0654 \u06A9\u0627\u0646\u062A\u06A9\u0633\u062A",
      "context.readiness": "\u0622\u0645\u0627\u062F\u06AF\u06CC \u06A9\u0627\u0646\u062A\u06A9\u0633\u062A (task_context)",
      "context.staleness": "\u0628\u0647\u200C\u0631\u0648\u0632 \u0628\u0648\u062F\u0646 \u06A9\u0627\u0646\u062A\u06A9\u0633\u062A",
      "context.source_drift": "fact\u0647\u0627\u06CC \u0627\u0633\u062A\u0646\u0627\u062F\u0634\u062F\u0647 \u0627\u0632 \u0632\u0645\u0627\u0646 \u0633\u0627\u062E\u062A \u0628\u0633\u062A\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F\u0647\u200C\u0627\u0646\u062F",
      "renderer.available": "renderer \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u06A9\u0627\u0631",
      "output.format": "\u0642\u0627\u0644\u0628 \u0648 \u062A\u0639\u062F\u0627\u062F \u062E\u0631\u0648\u062C\u06CC\u0650 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC\u200C\u0634\u062F\u0647",
      "plan.copy": "\u0645\u062A\u0646 \u0648 \u067E\u0627\u0644\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0647\u0645\u0647\u0654 \u062E\u0631\u0648\u062C\u06CC\u200C\u0647\u0627",
      "copy.claims": "\u0627\u062F\u0639\u0627\u0647\u0627\u06CC \u0645\u0645\u0646\u0648\u0639 \u062F\u0631 \u0645\u062A\u0646",
      "asset.reference": "\u0645\u0631\u062C\u0639 asset (Visual DNA)",
      "asset.required_logo": "\u0644\u0648\u06AF\u0648\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC",
      "artifact.checks": "\u0628\u0631\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC \u062E\u0631\u0648\u062C\u06CC",
      "artifact.pack_pin": "\u0633\u0646\u062C\u0627\u0642 \u0628\u0648\u062F\u0646 \u062E\u0631\u0648\u062C\u06CC\u200C\u0647\u0627 \u0628\u0647 \u0647\u0645\u06CC\u0646 \u0628\u0633\u062A\u0647",
      "artifact.file_sha256": "checksum \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u062E\u0631\u0648\u062C\u06CC",
      "artifact.svg_safety": "\u0627\u06CC\u0645\u0646\u06CC SVG \u062E\u0631\u0648\u062C\u06CC (\u062F\u0648\u0628\u0627\u0631\u0647 \u0631\u0648\u06CC \u062E\u0648\u062F \u0628\u0627\u06CC\u062A\u200C\u0647\u0627)",
      "artifact.required_logo": "\u0644\u0648\u06AF\u0648\u06CC \u0627\u0644\u0632\u0627\u0645\u06CC \u062F\u0631 \u0647\u0645\u0647\u0654 \u062E\u0631\u0648\u062C\u06CC\u200C\u0647\u0627",
      "svg.allowlist": "\u0641\u0647\u0631\u0633\u062A \u0645\u062C\u0627\u0632 SVG",
      "svg.publication_gate": "\u062F\u0631\u0648\u0627\u0632\u0647\u0654 \u0627\u0646\u062A\u0634\u0627\u0631 SVG",
      "svg.normalized": "\u0646\u0631\u0645\u0627\u0644\u200C\u0633\u0627\u0632\u06CC SVG",
      "post.format": "\u0642\u0627\u0644\u0628 \u067E\u0633\u062A",
      "post.headline_fit": "\u062C\u0627 \u0634\u062F\u0646 \u062A\u06CC\u062A\u0631",
      "post.signoff_fit": "\u062C\u0627 \u0634\u062F\u0646 \u0627\u0645\u0636\u0627",
      "color.contrast": "\u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u0631\u0646\u06AF",
      "pack.digest": "digest \u0628\u0633\u062A\u0647 (\u062F\u0633\u062A\u0647)",
      "pack.staleness": "\u0628\u0647\u200C\u0631\u0648\u0632 \u0628\u0648\u062F\u0646 \u0628\u0633\u062A\u0647 (\u062F\u0633\u062A\u0647)",
      "set.count": "\u062A\u0639\u062F\u0627\u062F \u062E\u0631\u0648\u062C\u06CC",
      "set.distinct_files": "\u06CC\u06A9\u062A\u0627 \u0628\u0648\u062F\u0646 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627",
      "set.distinct_messages": "\u06CC\u06A9\u062A\u0627 \u0628\u0648\u062F\u0646 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627",
      "set.layout_variety": "\u062A\u0646\u0648\u0639 \u0686\u06CC\u062F\u0645\u0627\u0646",
      "coach.advice": "\u062A\u0648\u0635\u06CC\u0647\u0654 Strategic Coach",
      "review.visual_taste": "\u0633\u0644\u06CC\u0642\u0647 \u0648 \u0634\u0628\u0627\u0647\u062A \u0628\u0635\u0631\u06CC",
      "review.semantic": "\u0627\u0642\u0646\u0627\u0639 \u0648 \u0645\u0639\u0646\u0627"
    },
    labels: { production: "\u062A\u0648\u0644\u06CC\u062F", stage: "\u0645\u0631\u062D\u0644\u0647", context: "\u06A9\u0627\u0646\u062A\u06A9\u0633\u062A", renderer: "renderer", blocks: "\u0645\u0627\u0646\u0639", owner: "\u0645\u0627\u0644\u06A9", input: "\u0648\u0631\u0648\u062F\u06CC", none: "\u0647\u06CC\u0686", human_review: "\u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0627\u0646\u0633\u0627\u0646\u06CC \u0644\u0627\u0632\u0645 \u0627\u0633\u062A. \u0647\u06CC\u0686 \u0686\u06CC\u0632\u06CC \u062A\u0623\u06CC\u06CC\u062F\u060C \u0645\u0646\u062A\u0634\u0631\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0647\u0632\u06CC\u0646\u0647 \u06CC\u0627 \u0645\u0633\u062A\u0642\u0631 \u0646\u0634\u062F\u061B authorizes: [].", not_ready_exit: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0646\u062F\u060C \u0627\u0645\u0627 \u062A\u0648\u0644\u06CC\u062F \u0622\u0645\u0627\u062F\u0647 \u0646\u06CC\u0633\u062A: \u06A9\u062F \u062E\u0631\u0648\u062C \u06F3 (exit 3). production-readiness.json \u0631\u0627 \u0628\u0628\u06CC\u0646\u06CC\u062F." }
  },
  tr: {
    notice: [
      "\xDCretime haz\u0131rl\u0131k ayr\u0131 bir g\xF6r\xFCn\xFCmd\xFCr. Yaln\u0131zca ba\u011Flamla ilgili olan task_context readiness alan\u0131n\u0131n anlam\u0131n\u0131 de\u011Fi\u015Ftirmez.",
      "Yaln\u0131zca nesnel, belirlenimci kurallar engeller: yanl\u0131\u015F \xF6zet veya sa\u011Flama toplam\u0131, engelli kullan\u0131m haklar\u0131, yasakl\u0131 iddia, eksik olu\u015Fturucu veya bi\xE7im, eksik zorunlu logo, g\xFCvensiz dosya.",
      "G\xF6rsel be\u011Feni, g\xF6rsel benzerlik ve ikna g\xFCc\xFC burada test edilmez. Her tasla\u011F\u0131 bir insan inceler. Puan yoktur.",
      "Hi\xE7bir \u015Feye yetki vermez: yay\u0131n, zamanlama, harcama, da\u011F\u0131t\u0131m, onay veya y\xFCkleme yok. Bir ajana varl\u0131k bayt\u0131 verilmez."
    ],
    meaning: {
      ready: "Belirlenimci bir engel bulunmad\u0131. Bu bir onay veya kalite yarg\u0131s\u0131 de\u011Fildir: insan incelemesi yine gereklidir.",
      not_ready: "En az bir belirlenimci kural \xFCretimi engelliyor. Engeller kural\u0131, sahibini ve girdiyi adland\u0131r\u0131r."
    },
    states: { ready: "haz\u0131r", not_ready: "haz\u0131r de\u011Fil" },
    verdicts: { pass: "ge\xE7ti", warn: "uyar\u0131", fail: "ba\u015Far\u0131s\u0131z", not_tested: "test edilmedi", needs_human_review: "insan incelemesi gerekli" },
    checks: {
      "context.pack_integrity": "Ba\u011Flam paketi \xF6zeti",
      "context.readiness": "Ba\u011Flam haz\u0131rl\u0131\u011F\u0131 (task_context)",
      "context.staleness": "Ba\u011Flam g\xFCncelli\u011Fi",
      "context.source_drift": "At\u0131f yap\u0131lan bilgiler paket olu\u015Fturuldu\u011Fundan beri de\u011Fi\u015Fmedi",
      "renderer.available": "Bu g\xF6rev i\xE7in do\u011Frulanm\u0131\u015F olu\u015Fturucu",
      "output.format": "Desteklenen \xE7\u0131kt\u0131 bi\xE7imi ve say\u0131s\u0131",
      "plan.copy": "Her \xE7\u0131kt\u0131 i\xE7in onayl\u0131 metin ve palet",
      "copy.claims": "Metindeki yasakl\u0131 iddialar",
      "asset.reference": "Varl\u0131k referans\u0131 (Visual DNA)",
      "asset.required_logo": "Zorunlu logo",
      "artifact.checks": "\xC7\u0131kt\u0131 kontrolleri",
      "artifact.pack_pin": "\xC7\u0131kt\u0131lar\u0131n bu pakete sabitlenmesi",
      "artifact.file_sha256": "\xC7\u0131kt\u0131 dosyas\u0131 sa\u011Flama toplamlar\u0131",
      "artifact.svg_safety": "\xC7\u0131kt\u0131 SVG g\xFCvenli\u011Fi (baytlar \xFCzerinde yeniden)",
      "artifact.required_logo": "Her \xE7\u0131kt\u0131da zorunlu logo",
      "svg.allowlist": "SVG izin listesi",
      "svg.publication_gate": "SVG yay\u0131n kap\u0131s\u0131",
      "svg.normalized": "SVG normalle\u015Ftirilmi\u015F",
      "post.format": "G\xF6nderi bi\xE7imi",
      "post.headline_fit": "Ba\u015Fl\u0131\u011F\u0131n s\u0131\u011Fmas\u0131",
      "post.signoff_fit": "\u0130mzan\u0131n s\u0131\u011Fmas\u0131",
      "color.contrast": "Renk kontrast\u0131",
      "pack.digest": "Paket \xF6zeti (toplu)",
      "pack.staleness": "Paket g\xFCncelli\u011Fi (toplu)",
      "set.count": "\xC7\u0131kt\u0131 say\u0131s\u0131",
      "set.distinct_files": "Farkl\u0131 dosyalar",
      "set.distinct_messages": "Farkl\u0131 mesajlar",
      "set.layout_variety": "Yerle\u015Fim \xE7e\u015Fitlili\u011Fi",
      "coach.advice": "Strategic Coach tavsiyesi",
      "review.visual_taste": "G\xF6rsel be\u011Feni ve benzerlik",
      "review.semantic": "\u0130kna ve anlam"
    },
    labels: { production: "\xFCretim", stage: "a\u015Fama", context: "ba\u011Flam", renderer: "olu\u015Fturucu", blocks: "engeller", owner: "sahip", input: "girdi", none: "yok", human_review: "\u0130nsan incelemesi gerekli. Hi\xE7bir \u015Fey onaylanmad\u0131, yay\u0131nlanmad\u0131, zamanlanmad\u0131, harcanmad\u0131 veya da\u011F\u0131t\u0131lmad\u0131; authorizes: [].", not_ready_exit: "Taslaklar yaz\u0131ld\u0131, ancak \xFCretim haz\u0131r de\u011Fil: \xE7\u0131k\u0131\u015F kodu 3. production-readiness.json dosyas\u0131na bak\u0131n." }
  }
};
function productionText(locale) {
  return PRODUCTION_TEXT[locale] ?? PRODUCTION_TEXT.en;
}

// packages/brand-core/src/runtime/production.ts
import { createHash } from "node:crypto";
import fs2 from "node:fs";
import path2 from "node:path";

// packages/brand-core/src/runtime/gate.ts
function check(check_id, layer, result, evidence) {
  return { check_id, layer, method: "deterministic", result, evidence: evidence.slice(0, 20) };
}
function bannedRules(pack) {
  const items = Object.values(pack.sections).flat();
  const banned = items.filter((item) => item.key === "banned_claims" && item.state === "approved" && typeof item.value === "string" && item.source_id !== "business.marketing.availability_claim").flatMap((item) => splitItems(String(item.value)).map((text) => ({ text: text.trim(), source: item.source_id }))).filter((rule) => rule.text.length > 0);
  const availability = items.find((item) => item.source_id === "business.marketing.availability_claim" && item.state === "approved");
  return { banned, availability: typeof availability?.value === "string" ? availability.value.trim() : null };
}
function copyClaimConflicts(pack, post) {
  const rules = bannedRules(pack);
  const texts = [
    ["message", post.message],
    ["cta", post.cta],
    ["brand_name", post.brand_name]
  ];
  return { rules, conflicts: texts.flatMap(([field, value]) => claimConflicts(field, value, rules.banned, rules.availability)) };
}
function postChecks(pack, plan, post, rendered) {
  const out = [];
  const svg = rendered.svg;
  const structural = checkSvg(svg);
  out.push(
    check(
      "svg.allowlist",
      "asset-catalog.svg-check",
      !structural.ok ? "fail" : structural.warnings.length > 0 ? "warn" : "pass",
      [...structural.issues.map((issue) => `issue:${issue.code}`), ...[...new Set(structural.warnings.map((warning) => `warning:${warning.code}`))]]
    )
  );
  const publication = svgPublicationIssues(svg);
  out.push(check("svg.publication_gate", "asset-catalog.publication", publication.length === 0 ? "pass" : "fail", publication.map((issue) => `issue:${issue.code}`)));
  const normalized = normalizeSvg(svg);
  out.push(
    check(
      "svg.normalized",
      "asset-catalog.normalize",
      normalized.ok && !normalized.changed ? "pass" : normalized.ok ? "warn" : "fail",
      [normalized.ok ? `changed:${normalized.changed}` : `refused:${normalized.reason}`]
    )
  );
  const size = /^<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"[^>]*\bviewBox="0 0 (\d+) (\d+)"/.exec(svg);
  const dims = size ? size.slice(1).map(Number) : [];
  out.push(
    check(
      "post.format",
      "runtime.manifest",
      dims.length === 4 && dims[0] === POST_FORMAT.width && dims[1] === POST_FORMAT.height && dims[2] === POST_FORMAT.width && dims[3] === POST_FORMAT.height ? "pass" : "fail",
      [`format:${POST_FORMAT.id}`, `declared:${dims.join("x") || "none"}`]
    )
  );
  const approvedSize = plan.type.slots.headline.size_source === "approved";
  out.push(
    check(
      "post.headline_fit",
      "runtime.manifest",
      !rendered.headline.fits || approvedSize && rendered.headline.reduced ? "warn" : "pass",
      [`size:${rendered.headline.size}`, `start:${rendered.headline.start}`, `start_source:${plan.type.slots.headline.size_source}`, `lines:${rendered.headline.lines}`, "method:estimated_advance_width"]
    )
  );
  if (post.brand_name) out.push(check("post.signoff_fit", "runtime.manifest", rendered.signoff.fits ? "pass" : "warn", [`lines:${rendered.signoff.lines}`, "method:estimated_advance_width"]));
  const { rules, conflicts } = copyClaimConflicts(pack, post);
  out.push(
    check(
      "copy.claims",
      "content-bridge.claims",
      rules.banned.length === 0 && rules.availability === null ? "not_tested" : conflicts.length > 0 ? "fail" : "pass",
      conflicts.length > 0 ? conflicts.map((conflict) => `${conflict.kind}:${conflict.field}:${conflict.source}`) : [`rules:${rules.banned.length}`, `availability:${rules.availability ?? "none"}`]
    )
  );
  const hex = (role) => plan.palette.roles.find((entry) => entry.role === role).hex;
  const ratios = rendered.pairs.map((pair) => ({ pair, ratio: Math.round(contrastRatio(hex(pair.foreground), hex(pair.background)) * 100) / 100 }));
  const contrastResult = ratios.some(({ pair, ratio }) => ratio < (pair.text === "large" ? 3 : 4.5)) ? "fail" : ratios.some(({ ratio }) => ratio < 4.5) ? "warn" : "pass";
  out.push(check("color.contrast", "design-tokens.contrast", contrastResult, [...new Set(ratios.map(({ pair, ratio }) => `${pair.foreground}/${pair.background}:${ratio}:${pair.text}`)), "reference:w3c.wcag-2.2:informed_by"]));
  return out;
}
function setChecks(pack, posts) {
  const shas = new Set(posts.map((entry) => entry.sha256));
  const messages = new Set(posts.map((entry) => entry.post.message.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim()));
  const layouts = new Set(posts.map((entry) => entry.post.layout));
  return [
    check("pack.digest", "task-context.pack", verifyPack(pack) ? "pass" : "fail", [`context_sha256:${pack.digests.context_sha256 ?? "none"}`]),
    check("pack.staleness", "task-context.pack", pack.staleness === "current" ? "pass" : "warn", [`staleness:${pack.staleness}`, `readiness:${pack.readiness}`]),
    check("set.count", "runtime.manifest", posts.length === SOCIAL_BATCH_COUNT ? "pass" : "fail", [`posts:${posts.length}`, `requested:${SOCIAL_BATCH_COUNT}`]),
    check("set.distinct_files", "runtime.manifest", shas.size === posts.length ? "pass" : "fail", [`distinct_sha256:${shas.size}`]),
    check("set.distinct_messages", "runtime.manifest", messages.size === posts.length ? "pass" : "fail", [`distinct_messages:${messages.size}`]),
    check("set.layout_variety", "runtime.manifest", layouts.size >= Math.min(5, posts.length) ? "pass" : "warn", [`layouts:${layouts.size}`])
  ];
}
function coachLayer(source, questionIds, now) {
  if (!source) return { layer: "coach", called: false, skipped_reason: "not_requested", results: [], notes: [] };
  const results = [];
  try {
    for (const id of questionIds) {
      const result = coachAnalyze(source, { mode: "quality_review", questionId: id, now });
      results.push({ mode: result.mode, question_id: id, status: result.status, codes: result.findings.map((finding) => finding.code), context_digest: result.analysis_scope.context_digest });
    }
    const consistency = coachAnalyze(source, { mode: "consistency_review", now });
    results.push({ mode: consistency.mode, question_id: null, status: consistency.status, codes: consistency.findings.map((finding) => finding.code), context_digest: consistency.analysis_scope.context_digest });
  } catch (error) {
    if (error instanceof CoachError) return { layer: "coach", called: true, skipped_reason: error.code, results, notes: ["The coach refused; its refusal is reported unchanged."] };
    throw error;
  }
  return { layer: "coach", called: true, skipped_reason: null, results, notes: ["authority: derived_advice; authorizes: []", "Coach statuses describe the approved answers behind the copy, not the artwork."] };
}
function assuranceLayer(pack, brandId, asOf, demo) {
  const sources = new Map(pack.sources.filter((source) => source.status === "approved").map((source) => [source.id, source]));
  const controls = POSITIONING_READINESS_CONTROLS.map((control) => {
    const facts = control.required_question_ids.map((id) => {
      const found = sources.get(id);
      return found ? { ref: { id, revision: found.revision ?? "unknown" }, state: "current", presence: "approved", classification: found.classification } : { ref: { id, revision: "absent" }, state: "missing", presence: "absent", classification: "internal" };
    });
    return { control_id: control.control_id, facts, evidence: [], conflicts: [], review: null, maturity: null };
  });
  const input = {
    brand_id: brandId,
    method_id: POSITIONING_READINESS.method_id,
    subject: { entity_kind: "company", sells: "unknown", stage: "unknown", runs_paid_media: "unknown" },
    audience: "internal",
    as_of: asOf,
    controls,
    demo
  };
  const result = assess(input);
  return {
    layer: "assurance",
    called: true,
    skipped_reason: null,
    results: [
      {
        method_id: result.method_id,
        claim_level: result.claim_level,
        completeness: result.completeness.state,
        evidence_quality: result.evidence_quality,
        limitations: result.limitations,
        source_snapshot_digest: result.source_snapshot_digest,
        controls: result.control_results.map((control) => ({ control_id: control.control_id, status: control.status, reason_codes: control.reason_codes }))
      }
    ],
    notes: ["Internal assessment of the context pack, not of the artwork. Not a certification or a compliance claim.", "Subject fields the pack does not state are unknown, so applicability may stay unknown."]
  };
}

// packages/brand-core/src/runtime/type.ts
var CANVAS_SCALE = 2;
var GENERIC = /* @__PURE__ */ new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "math", "emoji"]);
var DEFAULT_STACKS = {
  ltr: ["Inter", "Noto Sans", "Helvetica Neue", "Arial", "sans-serif"],
  rtl: ["Vazirmatn", "Noto Sans Arabic", "Tahoma", "sans-serif"]
};
var SLOT_ROLES = {
  headline: ["display", "headline", "heading", "h1", "title", "hero"],
  label: ["label", "eyebrow", "overline", "caption", "subtitle", "small"],
  body: ["body", "text", "paragraph", "base", "copy"]
};
var DEFAULTS = {
  headline: { size: 96, line_height: 1.22, weight: 700 },
  label: { size: 34, line_height: 1.3, weight: 600 },
  body: { size: 36, line_height: 1.28, weight: 600 }
};
function approvedItems(pack, key) {
  return Object.values(pack.sections).flat().filter((item) => item.key === key && item.state === "approved" && item.source_id !== null);
}
function weightTokens(pack) {
  const out = /* @__PURE__ */ new Map();
  for (const item of approvedItems(pack, "tokens")) {
    const token = item.value ?? {};
    const match = typeof token.id === "string" ? /^type\.fontWeight\.([A-Za-z][A-Za-z0-9_-]*)$/.exec(token.id) : null;
    const weight = typeof token.value === "number" ? token.value : Number(token.value);
    if (!match || token.type !== "fontWeight" || !Number.isInteger(weight) || weight < 100 || weight > 900) continue;
    out.set(match[1].toLowerCase(), { weight, source: { key: item.key, source_id: item.source_id, source_revision: item.source_revision } });
  }
  return out;
}
function quoteFamily(family) {
  return GENERIC.has(family.toLowerCase()) || /^[A-Za-z][A-Za-z0-9-]*$/.test(family) ? family : `'${family}'`;
}
function fontFamilyValue(stack) {
  return stack.map(quoteFamily).join(", ");
}
function typeSpecOf(pack, direction) {
  const item = approvedItems(pack, "type_rules").find((entry) => entry.source_id === "brand.type.scale" && typeof entry.value === "string");
  const parsed = item ? parseStructured("font", item.value) : null;
  const fonts = parsed?.type === "font" ? parsed.fonts : [];
  const weights = weightTokens(pack);
  const usedWeights = [];
  const byName = (names) => names.map((name) => fonts.find((font) => font.role.toLowerCase() === name)).find(Boolean);
  const slot = (name) => {
    const fallbackOrder = name === "body" ? ["body"] : [name, "body"];
    const font = fallbackOrder.map((candidate) => byName(SLOT_ROLES[candidate])).find(Boolean) ?? fonts[0];
    const base = DEFAULTS[name];
    if (!font) {
      return { role: null, family_stack: DEFAULT_STACKS[direction], appended_generic: false, size_px: base.size, line_height: base.line_height, weight: base.weight, family_source: "renderer_default", size_source: "renderer_default", line_height_source: "renderer_default", weight_source: "renderer_default" };
    }
    const approvedStack = [font.family, ...font.fallback];
    const hasGeneric = approvedStack.some((family) => GENERIC.has(family.toLowerCase()));
    const token = weights.get(font.role.toLowerCase());
    if (token && !usedWeights.some((entry) => entry.source_id === token.source.source_id)) usedWeights.push(token.source);
    return {
      role: font.role,
      family_stack: hasGeneric ? approvedStack : [...approvedStack, "sans-serif"],
      appended_generic: !hasGeneric,
      size_px: font.size_px === null ? base.size : Math.round(font.size_px * CANVAS_SCALE),
      line_height: font.line_height ?? base.line_height,
      weight: token?.weight ?? base.weight,
      family_source: "approved",
      size_source: font.size_px === null ? "renderer_default" : "approved",
      line_height_source: font.line_height === null ? "renderer_default" : "approved",
      weight_source: token ? "approved_token" : "renderer_default"
    };
  };
  const slots = { headline: slot("headline"), label: slot("label"), body: slot("body") };
  return {
    applied: fonts.length > 0,
    canvas_scale: CANVAS_SCALE,
    source: fonts.length > 0 && item ? { key: item.key, source_id: item.source_id, source_revision: item.source_revision } : null,
    weight_sources: usedWeights.sort((a, b) => a.source_id.localeCompare(b.source_id)),
    slots
  };
}

// packages/brand-core/src/runtime/plan.ts
var LAYOUTS = ["statement", "band", "frame", "split", "quote"];
var ANGLE_SOURCES = [
  { angle: "promise", key: "positioning", source_id: "brand.strategy.promise" },
  { angle: "value_proposition", key: "value_proposition", source_id: "business.offer.value_proposition" },
  { angle: "audience", key: "audience" },
  { angle: "pillar", key: "pillars", split: true },
  { angle: "differentiation", key: "positioning", source_id: "brand.strategy.differentiation" },
  { angle: "offer", key: "offer" },
  { angle: "purpose", key: "purpose" },
  { angle: "tagline", key: "value_proposition", source_id: "brand.verbal.tagline" }
];
function approved(pack, key) {
  return Object.values(pack.sections).flat().filter((item) => item.key === key && item.state === "approved" && typeof item.value === "string" && item.source_id !== null);
}
function used(item) {
  return { key: item.key, source_id: item.source_id, source_revision: item.source_revision };
}
function paletteOf(pack) {
  const item = approved(pack, "color_roles")[0];
  if (!item) return { roles: [], source: null };
  const parsed = parseStructured("color", item.value);
  if (!parsed || parsed.type !== "color") return { roles: [], source: used(item) };
  return { roles: parsed.colors.map((color) => ({ role: color.role, hex: color.hex.toUpperCase() })), source: used(item) };
}
var luminance = (hex) => contrastRatio(hex, "#000000");
function pairings(palette) {
  const roles = palette.roles;
  if (roles.length < 2) return [];
  const byRole = (name) => roles.find((entry) => entry.role.toLowerCase() === name.toLowerCase())?.role;
  const sorted = [...roles].sort((a, b) => luminance(a.hex) - luminance(b.hex) || a.role.localeCompare(b.role));
  const dark = byRole("primary") ?? sorted[0].role;
  const light = byRole("surface") ?? byRole("onPrimary") ?? sorted[sorted.length - 1].role;
  const onDark = byRole("onPrimary") ?? sorted[sorted.length - 1].role;
  const ink = byRole("ink") ?? sorted[0].role;
  const accent = byRole("accent") ?? roles.find((entry) => ![dark, light, onDark, ink].includes(entry.role))?.role ?? onDark;
  return [
    { background: dark, foreground: onDark, accent },
    { background: light, foreground: ink, accent: byRole("accent") ?? dark }
  ];
}
function scriptDirection(text) {
  for (const char of text) {
    if (/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/u.test(char)) return "rtl";
    if (new RegExp("\\p{L}", "u").test(char)) return "ltr";
  }
  return null;
}
function planSocialBatch(pack) {
  const locale = pack.task.locale;
  const palette = paletteOf(pack);
  const blockers = [];
  const candidates = [];
  const seen = /* @__PURE__ */ new Set();
  for (const spec of ANGLE_SOURCES) {
    for (const entry of approved(pack, spec.key).filter((candidate) => !spec.source_id || candidate.source_id === spec.source_id)) {
      const texts = spec.split ? splitItems(String(entry.value)) : [String(entry.value)];
      for (const text of texts) {
        const message = text.trim();
        if (!message || seen.has(message)) continue;
        seen.add(message);
        candidates.push({ angle: spec.angle, message, source: used(entry), item: spec.split === true && texts.length > 1 });
      }
    }
  }
  const scripts = candidates.map((candidate) => scriptDirection(candidate.message)).filter((dir) => dir !== null);
  const rtlCount = scripts.filter((dir) => dir === "rtl").length;
  const direction = scripts.length === 0 ? locale === "fa" ? "rtl" : "ltr" : rtlCount * 2 >= scripts.length ? "rtl" : "ltr";
  const brand = approved(pack, "brand_name")[0] ?? null;
  const cta = approved(pack, "cta")[0] ?? null;
  const pairs = pairings(palette);
  if (pairs.length === 0) blockers.push({ code: "palette_missing", detail: "brand.color.roles is not approved in this pack, or has fewer than two roles. No colour is invented." });
  if (candidates.length < SOCIAL_BATCH_COUNT) {
    blockers.push({ code: "insufficient_approved_messages", detail: `${candidates.length} distinct approved messages in the pack; ${SOCIAL_BATCH_COUNT} are needed. Nothing is padded or repeated.` });
  }
  const posts = blockers.length > 0 ? [] : candidates.slice(0, SOCIAL_BATCH_COUNT).map((candidate, offset) => {
    const index = offset + 1;
    return {
      index,
      post_id: `post-${String(index).padStart(2, "0")}`,
      angle: candidate.angle,
      layout: LAYOUTS[offset % LAYOUTS.length],
      message: candidate.message,
      message_source: candidate.source,
      message_is_item: candidate.item,
      brand_name: brand ? String(brand.value) : null,
      brand_source: brand ? used(brand) : null,
      cta: cta ? String(cta.value) : null,
      cta_source: cta ? used(cta) : null,
      // Alternate the two pairings in a 2-2-1 rhythm so neighbours differ and the set still reads as one.
      colors: pairs[Math.floor(offset / 2) % 2 === 0 ? offset % 2 : (offset + 1) % 2]
    };
  });
  return { locale, direction, palette, type: typeSpecOf(pack, direction), posts, available_messages: candidates.length, blockers };
}

// packages/brand-core/src/runtime/production.ts
var PRODUCTION_READINESS_SCHEMA = "brand-os/production-readiness/v1";
var PRODUCTION_READINESS_TOOL = "production_readiness";
var REQUIRABLE_ASSETS = ["logo"];
var RENDERERS = Object.freeze([
  {
    task_type: "social_batch",
    name: RUNTIME_RENDERER,
    version: RUNTIME_RENDERER_VERSION,
    output_formats: ["svg", POST_FORMAT.id],
    formats: [POST_FORMAT],
    channels: ["instagram"],
    deliverable_count: SOCIAL_BATCH_COUNT,
    model: null,
    network: false
  }
]);
var HARD_RUNTIME_CHECKS = /* @__PURE__ */ new Set(["svg.allowlist", "svg.publication_gate", "post.format", "copy.claims", "pack.digest", "set.count"]);
var short = (sha) => sha ? sha.slice(0, 12) : "none";
var hashOf = (content) => createHash("sha256").update(content).digest("hex");
function packAssets(pack) {
  const out = [];
  for (const item of Object.values(pack.sections).flat()) {
    if (!item.key.startsWith("assets.") || item.state !== "approved") continue;
    const value = item.value ?? {};
    const id = String(value.id ?? item.source_id ?? "");
    if (!id || out.some((entry) => entry.id === id)) continue;
    out.push({ id, role: item.key.slice("assets.".length), pinned: typeof value.checksum_sha256 === "string" ? value.checksum_sha256 : null, model_use: effectiveModelUse(value) });
  }
  return out;
}
function packAssetIds(pack) {
  return packAssets(pack).map((asset) => asset.id).filter((id) => ASSET_ID_PATTERN.test(id));
}
function assetVerdicts(pack, references, required) {
  return packAssets(pack).map((asset) => {
    const isRequired = required.includes(asset.role);
    const ref = references?.find((entry) => entry.via === "asset" && entry.asset_id === asset.id);
    if (!references || !ref) {
      return { asset_id: asset.id, role: asset.role, required: isRequired, state: "not_tested", reason: "not_resolved", pinned_sha256: asset.pinned, current_sha256: null, model_use: asset.model_use, delivery: "none" };
    }
    const current = ref.asset?.checksum_sha256 ?? null;
    const stalePin = ref.state === "approved" && current !== asset.pinned;
    return {
      asset_id: asset.id,
      role: asset.role,
      required: isRequired,
      state: stalePin ? "changed" : ref.state,
      reason: stalePin ? "pack_pin_differs" : ref.reason,
      pinned_sha256: asset.pinned,
      current_sha256: current,
      model_use: ref.model_use,
      delivery: ref.delivery
    };
  });
}
function productionReadiness(input) {
  const { pack, batch } = input;
  const locale = input.locale ?? pack.task.locale;
  const text = productionText(locale);
  const required = [...new Set(input.required_assets ?? [])].filter((entry) => REQUIRABLE_ASSETS.includes(entry)).sort();
  const checks = [];
  const add = (check_id, rule_owner, inputLabel, verdict, hard, evidence, blocksOverride) => {
    const blocks = blocksOverride ?? (hard && verdict === "fail");
    checks.push({ check_id, rule_owner, input: inputLabel, verdict, hard, blocks, evidence: evidence.slice(0, 20), label: text.checks[check_id] ?? check_id });
  };
  const packSha = pack.digests?.context_sha256 ?? null;
  const packInput = `pack:${short(packSha)}`;
  const verified = verifyPack(pack);
  add("context.pack_integrity", "task-context.pack", packInput, verified ? "pass" : "fail", true, [`context_sha256:${packSha ?? "none"}`, `verified:${verified}`]);
  const blockingMissing = pack.missing.filter((entry) => entry.blocking).map((entry) => entry.id);
  add("context.readiness", "task-context.pack", packInput, pack.readiness === "blocked" ? "fail" : pack.readiness === "partial" ? "warn" : "pass", true, [`readiness:${pack.readiness}`, ...blockingMissing.map((id) => `blocking_missing:${id}`)]);
  add("context.staleness", "task-context.pack", packInput, pack.staleness === "current" ? "pass" : "warn", false, [`staleness:${pack.staleness}`]);
  if (Array.isArray(input.source_drift)) {
    const drift = input.source_drift;
    add("context.source_drift", "task-context.pack", packInput, drift.length > 0 ? "fail" : "pass", true, drift.length > 0 ? ["code:stale_pack_sources", ...drift] : [`sources_compared:${pack.sources.length}`]);
  }
  const renderer = RENDERERS.find((spec) => spec.task_type === pack.task.type) ?? null;
  add("renderer.available", "runtime.renderers", `task_type:${pack.task.type}`, renderer ? "pass" : "fail", true, renderer ? [`renderer:${renderer.name}@${renderer.version}`, "model:none", "network:none"] : [`task_type:${pack.task.type}`, "deliverable:brief_only"]);
  if (renderer) {
    const problems = [];
    if (pack.task.deliverable_count !== renderer.deliverable_count) problems.push(`count:${pack.task.deliverable_count}!=${renderer.deliverable_count}`);
    if (pack.task.output_format !== null && !renderer.output_formats.includes(pack.task.output_format)) problems.push(`output_format:${pack.task.output_format}`);
    if (pack.task.channel !== null && !renderer.channels.includes(pack.task.channel)) problems.push(`channel:${pack.task.channel}`);
    add("output.format", "runtime.renderers", `format:${renderer.formats.map((format) => format.id).join(",")}`, problems.length > 0 ? "fail" : "pass", true, problems.length > 0 ? problems : [`format:${POST_FORMAT.id}`, `count:${renderer.deliverable_count}`]);
  } else {
    add("output.format", "runtime.renderers", `output_format:${pack.task.output_format ?? "none"}`, "not_tested", true, ["no_renderer"]);
  }
  const rendersHere = renderer !== null && verified && !checks.some((check2) => check2.check_id === "output.format" && check2.verdict === "fail");
  const plan = rendersHere ? planSocialBatch(pack) : null;
  const rules = bannedRules(pack);
  if (!batch) {
    if (plan) {
      add("plan.copy", "runtime.plan", packInput, plan.blockers.length > 0 ? "fail" : "pass", true, plan.blockers.length > 0 ? plan.blockers.map((blocker) => `blocker:${blocker.code}`) : [`messages:${plan.available_messages}`, `posts:${plan.posts.length}`]);
      const conflicts = plan.posts.flatMap((post) => copyClaimConflicts(pack, post).conflicts.map((conflict) => `${post.post_id}:${conflict.kind}:${conflict.field}:${conflict.source}`));
      const untested = rules.banned.length === 0 && rules.availability === null;
      add("copy.claims", "content-bridge.claims", `posts:${plan.posts.length}`, plan.posts.length === 0 || untested ? "not_tested" : conflicts.length > 0 ? "fail" : "pass", true, conflicts.length > 0 ? conflicts : [`rules:${rules.banned.length}`, `availability:${rules.availability ?? "none"}`]);
    } else {
      add("plan.copy", "runtime.plan", packInput, "not_tested", true, [renderer ? "pack_not_renderable" : "no_renderer"]);
      add("copy.claims", "content-bridge.claims", packInput, "not_tested", true, [renderer ? "pack_not_renderable" : "no_renderer"]);
    }
  }
  const assets = assetVerdicts(pack, input.references, required);
  for (const asset of assets) {
    const verdict = asset.state === "not_tested" ? "not_tested" : asset.state === "approved" ? "pass" : "fail";
    add("asset.reference", "visual-dna.resolver", `asset:${asset.asset_id}`, verdict, false, [`role:${asset.role}`, `state:${asset.state}`, ...asset.reason ? [`reason:${asset.reason}`] : [], `pinned:${short(asset.pinned_sha256)}`, `current:${short(asset.current_sha256)}`, `required:${asset.required}`]);
  }
  if (required.includes("logo")) {
    const logos = assets.filter((asset) => asset.role === "logo");
    const usable = logos.find((asset) => asset.state === "approved" && input.references?.find((ref) => ref.via === "asset" && ref.asset_id === asset.asset_id)?.asset?.path.toLowerCase().endsWith(".svg"));
    if (usable) add("asset.required_logo", "owner.task_input", `asset:${usable.asset_id}`, "pass", true, ["required:logo", `asset:${usable.asset_id}`]);
    else if (logos.length === 0) add("asset.required_logo", "owner.task_input", "role:logo", "fail", true, ["required:logo", "code:missing_required_logo"]);
    else if (logos.every((asset) => asset.state === "not_tested")) add("asset.required_logo", "owner.task_input", "role:logo", "not_tested", true, ["required:logo", "code:required_logo_not_verified", "resolver:not_run"], true);
    else add("asset.required_logo", "owner.task_input", "role:logo", "fail", true, ["required:logo", "code:required_logo_unusable", ...logos.map((asset) => `${asset.asset_id}:${asset.state}:${asset.reason ?? "not_svg"}`)]);
  }
  if (batch) artifactChecks(add, pack, batch, required);
  else add("artifact.checks", "runtime.manifest", "artifacts:none", "not_tested", false, ["no_artifact_yet"]);
  add("review.visual_taste", "human", "artifacts", "needs_human_review", false, ["method:none", "score:none"]);
  add("review.semantic", "human", "copy", "not_tested", false, ["method:none", "score:none"]);
  const blockers = checks.filter((check2) => check2.blocks).map((check2) => ({ check_id: check2.check_id, rule_owner: check2.rule_owner, input: check2.input, code: blockerCode(check2) }));
  const state = blockers.length > 0 ? "not_ready" : "ready";
  const stage = batch ? "artifact" : "pre_render";
  return {
    schema: PRODUCTION_READINESS_SCHEMA,
    tool: PRODUCTION_READINESS_TOOL,
    status: "ok",
    brand_id: pack.brand_id,
    locale,
    direction: locale === "fa" ? "rtl" : "ltr",
    stage,
    production_ready: state,
    meaning: text.meaning[state],
    notice: [...text.notice],
    task: { type: pack.task.type, channel: pack.task.channel, deliverable_count: pack.task.deliverable_count, output_format: pack.task.output_format, required_assets: required },
    context: { readiness: pack.readiness, staleness: pack.staleness, pack_sha256: packSha, pack_verified: verified, missing: pack.missing.map((entry) => entry.id), blocking_missing: blockingMissing },
    asset_delivery: { status: input.references ? "verified" : "not_tested", resolver: "visual_dna", transport: "metadata_only", references: assets },
    renderer: renderer ? { status: "available", name: renderer.name, version: renderer.version, formats: renderer.formats.map((format) => format.id), model: null, network: false } : { status: "missing", name: null, version: null, formats: [], model: null, network: false },
    critical_constraints: { required_assets: required, banned_claim_rules: rules.banned.length, availability_rule: rules.availability !== null },
    review: { visual_taste: "needs_human_review", visual_similarity: "not_tested", semantic: "not_tested", human_review_required: true },
    checks,
    blockers,
    digest: sha256Hex(canonicalJson({ pack: packSha, stage, checks: checks.map((check2) => [check2.check_id, check2.input, check2.verdict, check2.blocks]) })),
    human_review_required: true,
    authorizes: [],
    permissions: RUNTIME_PERMISSIONS
  };
}
function blockerCode(check2) {
  const code = check2.evidence.find((entry) => entry.startsWith("code:"));
  if (code) return code.slice("code:".length);
  return `${check2.check_id}:${check2.verdict}`;
}
var RESULT_VERDICT = (result, hard) => result === "fail" ? hard ? "fail" : "needs_human_review" : result;
function artifactChecks(add, pack, batch, required) {
  const { summary, manifests, files } = batch;
  const packSha = pack.digests?.context_sha256 ?? null;
  const posts = `posts:${manifests.length}`;
  const unpinned = manifests.filter((manifest) => manifest.context.pack_sha256 !== packSha).map((manifest) => manifest.post_id);
  if (summary.context.pack_sha256 !== packSha) unpinned.unshift("batch-summary");
  add("artifact.pack_pin", "task-context.pack", `pack:${short(packSha)}`, unpinned.length > 0 ? "fail" : "pass", true, unpinned.length > 0 ? unpinned.map((id) => `not_pinned:${id}`) : [`posts:${manifests.length}`, `pack:${short(packSha)}`]);
  const listed = summary.posts.map((post) => post.post_id).join(",") === manifests.map((manifest) => manifest.post_id).join(",");
  const wrong = listed ? [] : ["summary_manifest_mismatch"];
  const unsafe = [];
  for (const manifest of manifests) {
    const content = files.get(manifest.file);
    if (content === void 0) {
      wrong.push(`missing:${manifest.post_id}`);
      continue;
    }
    const summaryEntry = summary.posts.find((post) => post.post_id === manifest.post_id);
    const actual = hashOf(content);
    if (actual !== manifest.sha256 || summaryEntry?.sha256 !== manifest.sha256) wrong.push(`sha256:${manifest.post_id}`);
    const svg = typeof content === "string" ? content : content.toString("utf8");
    const structural = checkSvg(svg);
    if (!structural.ok) unsafe.push(...structural.issues.map((issue) => `${manifest.post_id}:${issue.code}`));
    unsafe.push(...svgPublicationIssues(svg).map((issue) => `${manifest.post_id}:${issue.code}`));
  }
  const batchSha = sha256Hex(canonicalJson(manifests.map((manifest) => ({ post_id: manifest.post_id, sha256: manifest.sha256 }))));
  if (batchSha !== summary.batch_sha256) wrong.push("batch_sha256");
  add("artifact.file_sha256", "runtime.manifest", posts, wrong.length > 0 ? "fail" : "pass", true, wrong.length > 0 ? wrong : [`batch_sha256:${short(summary.batch_sha256)}`]);
  add("artifact.svg_safety", "asset-catalog.publication", posts, unsafe.length > 0 ? "fail" : "pass", true, unsafe.length > 0 ? [...new Set(unsafe)] : ["issues:0"]);
  if (required.includes("logo")) {
    const without = manifests.filter((manifest) => !manifest.assets.some((asset) => asset.embedded)).map((manifest) => manifest.post_id);
    add("artifact.required_logo", "owner.task_input", posts, without.length > 0 || manifests.length === 0 ? "fail" : "pass", true, without.length > 0 ? ["code:missing_required_logo", ...without.map((id) => `no_logo:${id}`)] : manifests.length === 0 ? ["code:missing_required_logo", "posts:0"] : ["required:logo", `embedded:${manifests.length}`]);
  }
  const byId = /* @__PURE__ */ new Map();
  for (const manifest of manifests) {
    for (const check2 of manifest.checks) {
      const entry = byId.get(check2.check_id) ?? { layer: check2.layer, results: [], failed: [] };
      entry.results.push(check2.result);
      if (check2.result === "fail" || check2.result === "warn") entry.failed.push(`${manifest.post_id}:${check2.result}`);
      byId.set(check2.check_id, entry);
    }
  }
  const worst = (results) => results.includes("fail") ? "fail" : results.includes("warn") ? "warn" : results.length > 0 && results.every((result) => result === "not_tested") ? "not_tested" : "pass";
  for (const [id, entry] of byId) {
    const hard = HARD_RUNTIME_CHECKS.has(id);
    add(id, entry.layer, posts, RESULT_VERDICT(worst(entry.results), hard), hard, entry.failed.length > 0 ? entry.failed : [`results:${entry.results.length}`]);
  }
  for (const check2 of summary.set_checks) {
    const hard = HARD_RUNTIME_CHECKS.has(check2.check_id);
    add(check2.check_id, check2.layer, "batch", RESULT_VERDICT(check2.result, hard), hard, check2.evidence);
  }
  add("plan.copy", "runtime.plan", "batch", summary.blockers.length > 0 ? "fail" : "pass", true, summary.blockers.length > 0 ? summary.blockers.map((blocker) => `blocker:${blocker.code}`) : [`status:${summary.status}`]);
  const coach = summary.layers.find((layer) => layer.layer === "coach");
  add("coach.advice", "strategic-coach", coach?.called ? `questions:${coach.results.length}` : "not_called", !coach?.called ? "not_tested" : summary.warnings.length > 0 ? "warn" : "pass", false, coach?.called ? summary.warnings.map((warning) => `${warning.question_id ?? "brand"}:${warning.status}`) : [`skipped:${coach?.skipped_reason ?? "not_requested"}`]);
}
var MAX_BATCH_FILE_BYTES = 5e6;
var BATCH_PATH = /^posts\/post-\d{2}\.(svg|manifest\.json)$/;
function readInside(root, relative) {
  if (relative !== "batch-summary.json" && !BATCH_PATH.test(relative)) throw new RuntimeError("invalid_batch", `Unexpected file name in the batch: ${relative.slice(0, 80)}`);
  const full = path2.resolve(root, relative);
  if (!full.startsWith(`${root}${path2.sep}`)) throw new RuntimeError("invalid_batch", "A batch file points outside the batch directory.");
  let stat;
  try {
    stat = fs2.lstatSync(full);
  } catch {
    throw new RuntimeError("invalid_batch", `A batch file is missing: ${relative}`);
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new RuntimeError("invalid_batch", `A batch file must be a regular file, not a link: ${relative}`);
  if (stat.size > MAX_BATCH_FILE_BYTES) throw new RuntimeError("invalid_batch", `A batch file is larger than ${MAX_BATCH_FILE_BYTES} bytes: ${relative}`);
  return fs2.readFileSync(full);
}
function readBatchDir(dir) {
  const target = path2.resolve(dir);
  if (!fs2.existsSync(target) || fs2.lstatSync(target).isSymbolicLink() || !fs2.statSync(target).isDirectory()) throw new RuntimeError("invalid_batch", "The batch path must be a real directory.");
  const root = fs2.realpathSync(target);
  const json = (relative) => {
    try {
      return JSON.parse(readInside(root, relative).toString("utf8"));
    } catch (error) {
      if (error instanceof RuntimeError) throw error;
      throw new RuntimeError("invalid_batch", `${relative} is not valid JSON.`);
    }
  };
  const summary = json("batch-summary.json");
  if (!summary || typeof summary !== "object" || !Array.isArray(summary.posts) || !summary.context || !Array.isArray(summary.set_checks) || !Array.isArray(summary.layers)) throw new RuntimeError("invalid_batch", "batch-summary.json is not a runtime batch summary.");
  if (summary.posts.length > SOCIAL_BATCH_COUNT * 5) throw new RuntimeError("invalid_batch", "The batch lists too many posts.");
  const manifests = [];
  const files = /* @__PURE__ */ new Map();
  for (const post of summary.posts) {
    const manifest = json(String(post.manifest));
    if (!manifest || typeof manifest !== "object" || manifest.post_id !== post.post_id || !Array.isArray(manifest.checks) || !Array.isArray(manifest.assets) || !manifest.context) throw new RuntimeError("invalid_batch", `${String(post.manifest)} is not this post's manifest.`);
    manifests.push(manifest);
    files.set(manifest.file, readInside(root, String(manifest.file)));
  }
  return { summary, manifests, files };
}

// packages/brand-core/src/runtime/run.ts
import fs3 from "node:fs";
import path3 from "node:path";

// packages/brand-core/src/runtime/render.ts
var W = POST_FORMAT.width;
var H = POST_FORMAT.height;
var MARGIN = 96;
var POST_LABELS = {
  en: {
    promise: "Our promise",
    differentiation: "What sets us apart",
    value_proposition: "Why it matters",
    tagline: "In one line",
    audience: "Made for",
    offer: "The offer",
    purpose: "Why we exist",
    pillar: "Theme",
    draft: "DRAFT \xB7 not approved \xB7 not for publication",
    demo: "SYNTHETIC DEMO \u2014 NOT A REAL BRAND"
  },
  fa: {
    promise: "\u0642\u0648\u0644 \u0645\u0627",
    differentiation: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0645\u0627 \u0631\u0627 \u0645\u062A\u0641\u0627\u0648\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F",
    value_proposition: "\u0686\u0631\u0627 \u0645\u0647\u0645 \u0627\u0633\u062A",
    tagline: "\u062F\u0631 \u06CC\u06A9 \u062C\u0645\u0644\u0647",
    audience: "\u0628\u0631\u0627\u06CC",
    offer: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F",
    purpose: "\u0686\u0631\u0627 \u0647\u0633\u062A\u06CC\u0645",
    pillar: "\u0645\u062D\u0648\u0631",
    draft: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \xB7 \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647 \xB7 \u0628\u0631\u0627\u06CC \u0627\u0646\u062A\u0634\u0627\u0631 \u0646\u06CC\u0633\u062A",
    demo: "\u0646\u0645\u0648\u0646\u0647\u0654 \u0645\u0635\u0646\u0648\u0639\u06CC \u2014 \u0628\u0631\u0646\u062F \u0648\u0627\u0642\u0639\u06CC \u0646\u06CC\u0633\u062A"
  },
  tr: {
    promise: "S\xF6z\xFCm\xFCz",
    differentiation: "Bizi farkl\u0131 k\u0131lan",
    value_proposition: "Neden \xF6nemli",
    tagline: "Tek c\xFCmleyle",
    audience: "Kimin i\xE7in",
    offer: "Teklif",
    purpose: "Neden var\u0131z",
    pillar: "Tema",
    draft: "TASLAK \xB7 onaylanmad\u0131 \xB7 yay\u0131n i\xE7in de\u011Fil",
    demo: "SENTET\u0130K DEMO \u2014 GER\xC7EK B\u0130R MARKA DE\u011E\u0130L"
  }
};
var PERSIAN_DIGITS = "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9";
function localDigits(value, locale) {
  return locale === "fa" ? value.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]) : value;
}
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function wrapText(text, fontSize, width, maxLines) {
  const perLine = Math.max(4, Math.floor(width / (fontSize * 0.56)));
  const words = text.split(/\s+/u).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if ([...next].length <= perLine || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  const tooLong = lines.some((line) => [...line].length > perLine);
  return { lines, fits: lines.length <= maxLines && !tooLong };
}
var HEADLINE_LADDER = [96, 84, 72, 64, 56, 48];
var HEADLINE_MIN = 44;
function fitHeadline(text, width, maxLines, start = 96) {
  const sizes = [start, ...HEADLINE_LADDER.filter((size2) => size2 < start)];
  for (const size2 of sizes) {
    const wrapped = wrapText(text, size2, width, maxLines);
    if (wrapped.fits) return { size: size2, ...wrapped, reduced: size2 !== start };
  }
  const size = Math.min(start, HEADLINE_MIN);
  return { size, ...wrapText(text, size, width, maxLines), reduced: size !== start };
}
function logoMarkup(assetId, svg) {
  const open = /<svg\b[^>]*>/i.exec(svg);
  const close = svg.lastIndexOf("</svg>");
  if (!open || close < 0) return null;
  const viewBox = /\bviewBox\s*=\s*"([-\d.\s,]+)"/.exec(open[0])?.[1]?.trim();
  if (!viewBox || viewBox.split(/[\s,]+/).length !== 4) return null;
  const inner = svg.slice(open.index + open[0].length, close).trim();
  return { asset_id: assetId, viewBox, inner };
}
function hexOf(palette, role) {
  return palette.roles.find((entry) => entry.role === role).hex;
}
function bidi(line) {
  return scriptDirection(line) === "rtl" ? `\u202B${line}\u202C` : line;
}
function textBlock(lines, x, y, size, lineHeight, attrs) {
  return lines.map((line, i) => `<text x="${x}" y="${y + i * lineHeight}" font-size="${size}" ${attrs}>${escapeXml(bidi(line))}</text>`).join("\n    ");
}
function renderPost(plan, post, opts) {
  const { palette, locale, direction } = plan;
  const labels = POST_LABELS[locale];
  const bg = hexOf(palette, post.colors.background);
  const fg = hexOf(palette, post.colors.foreground);
  const accent = hexOf(palette, post.colors.accent);
  const rtl = direction === "rtl";
  const startX = rtl ? W - MARGIN : MARGIN;
  const { headline: headType, label: labelType, body: bodyType } = plan.type.slots;
  const family = (stack) => `font-family="${escapeXml(fontFamilyValue(stack))}"`;
  const attrs = (stack, anchor = "start") => `${family(stack)} text-anchor="${anchor}" fill="${fg}"`;
  const lead = rtl ? "end" : "start";
  const pairs = [{ foreground: post.colors.foreground, background: post.colors.background, text: "large" }];
  const body = [];
  const deco = [];
  const contentWidth = W - 2 * MARGIN;
  let headlineTop = 420;
  let headlineWidth = contentWidth;
  switch (post.layout) {
    case "statement":
      deco.push(`<rect x="${rtl ? W - MARGIN - 160 : MARGIN}" y="236" width="160" height="16" fill="${accent}"/>`);
      break;
    case "band":
      deco.push(`<rect x="0" y="0" width="${W}" height="260" fill="${accent}" opacity="0.18"/>`);
      deco.push(`<rect x="0" y="260" width="${W}" height="8" fill="${accent}"/>`);
      headlineTop = 470;
      break;
    case "frame":
      deco.push(`<rect x="40" y="40" width="${W - 80}" height="${H - 120}" fill="none" stroke="${accent}" stroke-width="6"/>`);
      headlineTop = 460;
      headlineWidth = contentWidth - 40;
      break;
    case "split":
      deco.push(`<rect x="${rtl ? W - 24 : 0}" y="0" width="24" height="${H}" fill="${accent}"/>`);
      deco.push(`<circle cx="${rtl ? 0 : W}" cy="${H / 2 - 80}" r="170" fill="${accent}" opacity="0.22"/>`);
      headlineTop = 440;
      break;
    case "quote":
      deco.push(`<path d="M${rtl ? W - MARGIN - 120 : MARGIN} 200 h120 v40 h-80 v80 h-40 z" fill="${accent}"/>`);
      headlineTop = 480;
      break;
  }
  const headline = fitHeadline(post.message, headlineWidth, 6, headType.size_px);
  const lineHeight = Math.round(headline.size * headType.line_height);
  body.push(`<text x="${startX}" y="${headlineTop - 110}" font-size="${labelType.size_px}" font-weight="${labelType.weight}" letter-spacing="${rtl ? 0 : 2}" ${attrs(labelType.family_stack, lead)} fill-opacity="0.85">${escapeXml(bidi(labels[post.angle]))}</text>`);
  body.push(textBlock(headline.lines, startX, headlineTop, headline.size, lineHeight, `font-weight="${headType.weight}" ${attrs(headType.family_stack, lead)}`));
  const footerY = H - 210;
  deco.push(`<rect x="${MARGIN}" y="${footerY - 70}" width="${contentWidth}" height="2" fill="${fg}" opacity="0.35"/>`);
  let ctaLines = 0;
  if (post.cta) {
    const cta = wrapText(post.cta, bodyType.size_px, contentWidth - 180, 2);
    ctaLines = cta.lines.length;
    body.push(textBlock(cta.lines, startX, footerY, bodyType.size_px, Math.round(bodyType.size_px * bodyType.line_height), `font-weight="${bodyType.weight}" ${attrs(bodyType.family_stack, lead)}`));
    pairs.push({ foreground: post.colors.foreground, background: post.colors.background, text: "body" });
  }
  let signoff = { lines: 0, fits: true };
  if (post.brand_name) {
    const size = Math.min(bodyType.size_px, 36);
    const step = Math.round(size * 1.25);
    const wrapped = wrapText(post.brand_name, size, contentWidth - 200, ctaLines >= 2 ? 1 : 2);
    signoff = { lines: wrapped.lines.length, fits: wrapped.fits };
    const top = H - 110 - step * (wrapped.lines.length - 1);
    body.push(textBlock(wrapped.lines, startX, top, size, step, `font-weight="${headType.weight}" ${attrs(bodyType.family_stack, lead)}`));
  }
  const counter = localDigits(`${String(post.index).padStart(2, "0")}/${SOCIAL_BATCH_COUNT}`, locale);
  body.push(`<text x="${rtl ? MARGIN : W - MARGIN}" y="${H - 110}" font-size="28" ${attrs(labelType.family_stack, rtl ? "start" : "end")} fill-opacity="0.8">${escapeXml(counter)}</text>`);
  const logo = opts.logo ? `<svg x="${rtl ? MARGIN : W - MARGIN - 120}" y="${MARGIN}" width="120" height="120" viewBox="${escapeXml(opts.logo.viewBox)}">${opts.logo.inner}</svg>` : "";
  const stamp = [labels.draft, ...opts.demo ? [labels.demo] : []].join(" \xB7 ");
  body.push(`<text x="${W / 2}" y="${H - 44}" font-size="22" ${attrs(labelType.family_stack, "middle")} fill-opacity="0.7">${escapeXml(bidi(stamp))}</text>`);
  const title = `${labels[post.angle]} \u2014 ${post.post_id}`;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xml:lang="${locale}" role="img" aria-labelledby="t d">`,
    `  <title id="t">${escapeXml(title)}</title>`,
    `  <desc id="d">${escapeXml(post.message)}</desc>`,
    `  <rect width="${W}" height="${H}" fill="${bg}"/>`,
    `  <g>`,
    `    ${deco.join("\n    ")}`,
    `  </g>`,
    ...logo ? [`  ${logo}`] : [],
    `  <g>`,
    `    ${body.join("\n    ")}`,
    `  </g>`,
    `</svg>`,
    ""
  ].join("\n");
  return { svg, pairs, headline: { size: headline.size, start: headType.size_px, lines: headline.lines.length, fits: headline.fits, reduced: headline.reduced }, signoff };
}

// packages/brand-core/src/runtime/run.ts
var tally = (checks) => ({
  pass: checks.filter((entry) => entry.result === "pass").length,
  warn: checks.filter((entry) => entry.result === "warn").length,
  fail: checks.filter((entry) => entry.result === "fail").length,
  not_tested: checks.filter((entry) => entry.result === "not_tested").length
});
function loadApprovedLogo(root, pack) {
  const items = Object.values(pack.sections).flat().filter((item) => item.key === "assets.logo" && item.state === "approved");
  const considered = [];
  const logoIds = items.map((item) => String((item.value ?? {}).id ?? item.source_id)).filter((id) => ASSET_ID_PATTERN.test(id));
  const assetIds = [.../* @__PURE__ */ new Set([...logoIds, ...packAssetIds(pack)])].slice(0, MAX_ASSET_IDS);
  if (items.length === 0 && assetIds.length === 0) return { logo: null, considered, references: [] };
  const ownerLocal = !process.env[AGENT_TOKEN_ENV];
  const engine = ownerLocal ? new InterviewEngine(root) : null;
  const sameBrand = engine !== null && engine.config().brand.slug === pack.brand_id;
  const ctx = sameBrand ? operatorContext(pack.brand_id) : null;
  const references = engine && ctx ? resolveVisualDna(engine, ctx, { asset_ids: assetIds }).references : [];
  let logo = null;
  for (const item of items) {
    const value = item.value ?? {};
    const assetId = String(value.id ?? item.source_id);
    const pinned = typeof value.checksum_sha256 === "string" ? value.checksum_sha256 : null;
    const base = { asset_id: assetId, source_revision: item.source_revision, checksum_sha256: pinned, model_use: effectiveModelUse(value), sent_to_model: false };
    const skip = (reason) => {
      considered.push({ ...base, embedded: false, not_embedded_reason: reason });
    };
    if (logo) {
      skip("one_logo_per_post");
      continue;
    }
    if (!ASSET_ID_PATTERN.test(assetId)) {
      skip("visual_dna:invalid:asset_id");
      continue;
    }
    if (!engine || !ctx) {
      skip(ownerLocal ? "visual_dna:other_brand" : "visual_dna:owner_only");
      continue;
    }
    const ref = references.find((entry) => entry.asset_id === assetId);
    if (!ref) {
      skip("visual_dna:missing:not_found");
      continue;
    }
    if (ref.state !== "approved" || !ref.asset) {
      skip(`visual_dna:${ref.state}:${ref.reason ?? "unknown"}`);
      continue;
    }
    if (!pinned || ref.asset.checksum_sha256 !== pinned) {
      skip("visual_dna:changed:pack_pin_differs");
      continue;
    }
    if (!ref.asset.path.toLowerCase().endsWith(".svg")) {
      skip("not_svg");
      continue;
    }
    let delivered;
    try {
      delivered = readVerifiedAsset(engine, ctx, assetId, "renderer");
    } catch (error) {
      if (error instanceof VisualDnaError) {
        skip(`visual_dna_read:${error.code}`);
        continue;
      }
      throw error;
    }
    if (delivered.sha256 !== pinned) {
      skip("visual_dna:changed:pack_pin_differs");
      continue;
    }
    logo = { asset_id: assetId, source_revision: item.source_revision, checksum_sha256: pinned, model_use: ref.model_use, svg: delivered.bytes.toString("utf8") };
    considered.push({ ...base, model_use: ref.model_use, embedded: true, not_embedded_reason: null });
  }
  return { logo, considered, references };
}
function coachWarnings(layer) {
  if (layer.layer !== "coach" || !layer.called) return [];
  return layer.results.filter((entry) => entry.status !== "ready").map((entry) => ({
    layer: "coach",
    question_id: typeof entry.question_id === "string" ? entry.question_id : null,
    status: String(entry.status),
    codes: Array.isArray(entry.codes) ? entry.codes.map(String) : [],
    blocks: false
  }));
}
function dedupeSources(sources) {
  const out = [];
  for (const source of sources) if (source && !out.some((entry) => entry.source_id === source.source_id)) out.push(source);
  return out;
}
function runSocialBatch(pack, opts) {
  if (pack?.schema !== TASK_CONTEXT_SCHEMA) throw new RuntimeError("invalid_pack", `Expected a ${TASK_CONTEXT_SCHEMA} pack.`);
  assertPackShape(pack);
  if (!verifyPack(pack)) throw new RuntimeError("invalid_pack", "The pack digest does not verify: it changed after task_context built it. Build a new pack.");
  if (pack.task.type !== "social_batch") throw new RuntimeError("wrong_task", `This runtime slice renders social_batch packs only (got ${pack.task.type}).`);
  if (pack.task.deliverable_count !== SOCIAL_BATCH_COUNT) throw new RuntimeError("wrong_task", `This slice renders exactly ${SOCIAL_BATCH_COUNT} posts (the pack asks for ${pack.task.deliverable_count}).`);
  if (pack.authorizes.length !== 0 || Object.values(pack.permissions).some(Boolean)) throw new RuntimeError("invalid_pack", "A pack never authorizes anything.");
  const plan = planSocialBatch(pack);
  if (opts.final && plan.posts.length > 0 && !plan.type.applied) {
    throw new RuntimeError("refused", "Final export outlines the approved type, and this pack has no approved brand.type.scale. Drafts (without --final) still render.");
  }
  const finalFamilies = [...new Set(Object.values(plan.type.slots).map((slot) => slot.family_stack[0]))].sort();
  const exportInfo = opts.final ? opts.final.report() : { mode: "draft", text: "live", outliner: null, fonts: [] };
  const typography = (headline) => ({
    applied: plan.type.applied,
    canvas_scale: plan.type.canvas_scale,
    slots: plan.type.slots,
    headline: { start_px: headline.start, drawn_px: headline.size, reduced_to_fit: headline.reduced }
  });
  const packSha = pack.digests.context_sha256;
  const embedded = opts.logo ? logoMarkup(opts.logo.asset_id, opts.logo.svg) : null;
  const logoAssets = [
    ...opts.logo ? [{ asset_id: opts.logo.asset_id, source_revision: opts.logo.source_revision, checksum_sha256: opts.logo.checksum_sha256, model_use: opts.logo.model_use, sent_to_model: false, embedded: embedded !== null, not_embedded_reason: embedded ? null : "no_viewbox" }] : [],
    ...(opts.logoConsidered ?? []).filter((asset) => !asset.embedded && asset.asset_id !== opts.logo?.asset_id).map((asset) => ({ ...asset, embedded: false, sent_to_model: false }))
  ];
  const files = /* @__PURE__ */ new Map();
  const manifests = [];
  for (const post of plan.posts) {
    const draft = renderPost(plan, post, { demo: opts.demo, logo: embedded });
    const rendered = opts.final ? { ...draft, svg: opts.final.outline(draft.svg, finalFamilies) } : draft;
    const sha256 = sha256Hex(rendered.svg);
    const file = `posts/${post.post_id}.svg`;
    const manifest = {
      schema: RUNTIME_POST_SCHEMA,
      post_id: post.post_id,
      index: post.index,
      brand_id: pack.brand_id,
      demo: opts.demo,
      state: "draft",
      locale: plan.locale,
      direction: plan.direction,
      angle: post.angle,
      layout: post.layout,
      format: POST_FORMAT,
      file,
      sha256,
      bytes: Buffer.byteLength(rendered.svg, "utf8"),
      renderer: { name: RUNTIME_RENDERER, version: RUNTIME_RENDERER_VERSION, model: null, network: false },
      context: { pack_schema: pack.schema, pack_sha256: packSha, task_type: "social_batch" },
      sources: dedupeSources([post.message_source, post.brand_source, post.cta_source, plan.palette.source, plan.type.source, ...plan.type.weight_sources]),
      assets: logoAssets,
      typography: typography(rendered.headline),
      export: exportInfo,
      checks: postChecks(pack, plan, post, rendered),
      human_review_required: true,
      authorizes: [],
      permissions: RUNTIME_PERMISSIONS
    };
    files.set(file, rendered.svg);
    files.set(`posts/${post.post_id}.manifest.json`, `${JSON.stringify(manifest, null, 2)}
`);
    manifests.push(manifest);
  }
  const usedQuestionIds = [...new Set(manifests.flatMap((manifest) => manifest.sources.map((source) => source.source_id)))].filter((id) => /^[a-z]+\.[a-z_]+\.[a-z_]+$/.test(id)).sort();
  const blockers = [...plan.blockers];
  const set = setChecks(
    pack,
    manifests.map((manifest, i) => ({ post: plan.posts[i], sha256: manifest.sha256 }))
  );
  const layers = [coachLayer(opts.coach ?? null, usedQuestionIds, opts.now), assuranceLayer(pack, pack.brand_id, opts.now, opts.demo)];
  const warnings = coachWarnings(layers[0]);
  const batchSha = sha256Hex(canonicalJson(manifests.map((manifest) => ({ post_id: manifest.post_id, sha256: manifest.sha256 }))));
  const summary = {
    schema: RUNTIME_BATCH_SCHEMA,
    job_id: `social-batch-${packSha.slice(0, 12)}`,
    brand_id: pack.brand_id,
    demo: opts.demo,
    demo_banner: opts.demo ? opts.demoBanner ?? null : null,
    task: { type: "social_batch", channel: "instagram", locale: plan.locale, requested_count: pack.task.deliverable_count },
    status: blockers.length > 0 || manifests.length !== SOCIAL_BATCH_COUNT ? "blocked" : "drafted",
    blockers,
    warnings,
    context: {
      origin: opts.origin ?? (opts.demo ? "demo" : "pack_file"),
      pack_schema: pack.schema,
      pack_sha256: packSha,
      pack_readiness: pack.readiness,
      pack_staleness: pack.staleness,
      pack_verified: true,
      missing: pack.missing.map((entry) => entry.id)
    },
    posts: manifests.map((manifest) => ({
      post_id: manifest.post_id,
      file: manifest.file,
      manifest: `posts/${manifest.post_id}.manifest.json`,
      sha256: manifest.sha256,
      angle: manifest.angle,
      layout: manifest.layout,
      checks: tally(manifest.checks)
    })),
    set_checks: set,
    layers,
    advisory: {
      visual_review: "not_tested",
      semantic_review: "not_tested",
      note: "No model reviewed these drafts. Taste, clarity and brand feel need a person; nothing here is a quality score."
    },
    batch_sha256: batchSha,
    human_review_required: true,
    authorizes: [],
    permissions: RUNTIME_PERMISSIONS
  };
  files.set("batch-summary.json", `${JSON.stringify(summary, null, 2)}
`);
  return { files, summary, manifests };
}
function writeBatch(outDir, result) {
  const target = path3.resolve(outDir);
  const insideBrand = (dir) => dir.split(path3.sep).includes("brand");
  const refuseBrand = () => {
    throw new RuntimeError("unsafe_output", "The output directory may not be inside a brand/ folder.");
  };
  if (insideBrand(target)) refuseBrand();
  const lstat = (file) => {
    try {
      return fs3.lstatSync(file);
    } catch {
      return null;
    }
  };
  const stat = lstat(target);
  if (stat) {
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new RuntimeError("unsafe_output", "The output path must be a real directory.");
    if (fs3.readdirSync(target).length > 0) throw new RuntimeError("unsafe_output", "The output directory must be empty. Nothing was overwritten.");
  }
  let existing = target;
  while (!lstat(existing) && path3.dirname(existing) !== existing) existing = path3.dirname(existing);
  let realExisting;
  try {
    realExisting = fs3.realpathSync(existing);
  } catch {
    throw new RuntimeError("unsafe_output", "The output path goes through a broken link.");
  }
  if (insideBrand(path3.join(realExisting, path3.relative(existing, target)))) refuseBrand();
  fs3.mkdirSync(target, { recursive: true });
  const real = fs3.realpathSync(target);
  if (insideBrand(real)) refuseBrand();
  const written = [];
  for (const [relative, text] of [...result.files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const full = path3.resolve(real, relative);
    if (!full.startsWith(`${real}${path3.sep}`)) throw new RuntimeError("unsafe_output", `Refusing to write outside the output directory: ${relative}`);
    fs3.mkdirSync(path3.dirname(full), { recursive: true });
    fs3.writeFileSync(full, text, { flag: "wx" });
    written.push(relative);
  }
  return written;
}

// packages/brand-core/src/runtime/demo.ts
var import_yaml = __toESM(require_dist(), 1);
import { createHash as createHash2 } from "node:crypto";
import fs4 from "node:fs";
import os from "node:os";
import path4 from "node:path";
var DEMO_BRAND_SLUG = "synthetic-demo-social";
var DEMO_BANNER = SYNTHETIC_DEMO_BANNER;
var DEMO_NOW = /* @__PURE__ */ new Date("2026-11-23T00:00:00.000Z");
var DEMO_FACTS = [
  ["business.identity.trade_name", "\u0644\u0648\u0645\u0648 \u06A9\u0627\u0631\u062A (\u0646\u0645\u0648\u0646\u0647\u0654 \u0645\u0635\u0646\u0648\u0639\u06CC)"],
  ["business.identity.sector", "education"],
  ["brand.strategy.purpose", "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0631\u0648\u0632\u0627\u0646\u0647 \u0631\u0627 \u06A9\u0648\u062A\u0627\u0647 \u0648 \u0634\u062F\u0646\u06CC \u06A9\u0646\u06CC\u0645."],
  ["brand.strategy.promise", "\u0647\u0631 \u0631\u0648\u0632 \u067E\u0646\u062C \u062F\u0642\u06CC\u0642\u0647\u060C \u06CC\u06A9 \u0642\u062F\u0645 \u062C\u0644\u0648\u062A\u0631."],
  ["brand.strategy.differentiation", "\u0645\u0631\u0648\u0631 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0645\u0646\u062D\u0646\u06CC \u0641\u0631\u0627\u0645\u0648\u0634\u06CC\u060C \u0646\u0647 \u062A\u06A9\u0631\u0627\u0631 \u06A9\u0648\u0631."],
  ["business.offer.value_proposition", "\u06A9\u0627\u0631\u062A\u200C\u0647\u0627 \u062F\u0631\u0633\u062A \u0648\u0642\u062A\u06CC \u0628\u0631\u0645\u06CC\u200C\u06AF\u0631\u062F\u0646\u062F \u06A9\u0647 \u062F\u0631 \u062D\u0627\u0644 \u0641\u0631\u0627\u0645\u0648\u0634\u200C\u0634\u062F\u0646\u200C\u0627\u0646\u062F."],
  ["brand.verbal.tagline", "\u06A9\u0645\u060C \u0648\u0644\u06CC \u0647\u0631 \u0631\u0648\u0632."],
  ["business.customer.primary_segment", "\u062F\u0627\u0646\u0634\u062C\u0648\u0647\u0627 \u0648 \u0634\u0627\u063A\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0641\u0642\u0637 \u0686\u0646\u062F \u062F\u0642\u06CC\u0642\u0647 \u0648\u0642\u062A \u0622\u0632\u0627\u062F \u062F\u0627\u0631\u0646\u062F"],
  ["business.offer.summary", "\u062F\u0648 \u0647\u0641\u062A\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0627\u0632 \u0647\u0645\u0647\u0654 \u062F\u0633\u062A\u0647\u200C\u0647\u0627"],
  ["business.marketing.pillars", "\u0639\u0627\u062F\u062A \u06A9\u0648\u0686\u06A9 \u0631\u0648\u0632\u0627\u0646\u0647\u061B \u0639\u0644\u0645 \u0645\u0631\u0648\u0631 \u0641\u0627\u0635\u0644\u0647\u200C\u062F\u0627\u0631\u061B \u062F\u0627\u0633\u062A\u0627\u0646 \u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u0647\u200C\u0647\u0627"],
  ["business.marketing.channels", "Instagram"],
  ["business.marketing.objective", "\u0622\u0632\u0645\u0648\u062F\u0646 \u0627\u06CC\u0646\u200C\u06A9\u0647 \u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u0622\u0645\u0648\u0632\u0634\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0628\u0647 \u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0645\u0646\u062C\u0631 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F (\u0641\u0631\u0636\u06CC\u0647)."],
  ["business.market.geography", "\u0628\u0627\u0632\u0627\u0631 \u0641\u0631\u0636\u06CC \u0641\u0627\u0631\u0633\u06CC\u200C\u0632\u0628\u0627\u0646"],
  ["brand.social.cta", "\u0644\u06CC\u0646\u06A9 \u0628\u06CC\u0648 \u0631\u0627 \u0628\u0632\u0646 \u0648 \u0627\u0648\u0644\u06CC\u0646 \u062F\u0633\u062A\u0647\u200C\u0627\u062A \u0631\u0627 \u0628\u0633\u0627\u0632"],
  ["brand.verbal.voice", "\u06AF\u0631\u0645\u060C \u06A9\u0648\u062A\u0627\u0647 \u0648 \u0628\u06CC\u200C\u0627\u062F\u0639\u0627"],
  ["brand.verbal.forbidden", "\u062A\u0636\u0645\u06CC\u0646 \u0645\u0648\u0641\u0642\u06CC\u062A\u061B \u0628\u0647\u062A\u0631\u06CC\u0646 \u0627\u067E \u0627\u06CC\u0631\u0627\u0646\u061B \u06CC\u06A9\u200C\u0634\u0628\u0647 \u0645\u0633\u0644\u0637 \u0634\u0648"],
  ["business.marketing.availability_claim", "do-not-claim"],
  ["brand.color.roles", "primary #1B2A4A; onPrimary #FFFFFF; surface #F6F1E7; ink #14171F; accent #F2B705"],
  ["brand.type.scale", "display: Vazirmatn, Tahoma, sans-serif @ 44px/1.25; label: Vazirmatn, Tahoma, sans-serif @ 16px/1.3; body: Vazirmatn, Tahoma, sans-serif @ 18px/1.4"]
];
var DEMO_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <title>Synthetic demo mark (not a real logo)</title>
  <rect x="14" y="30" width="72" height="56" rx="10" fill="#F2B705"/>
  <rect x="26" y="22" width="72" height="56" rx="10" fill="#FFFFFF" opacity="0.9"/>
  <rect x="38" y="14" width="72" height="56" rx="10" fill="#1B2A4A" stroke="#FFFFFF" stroke-width="4"/>
  <path d="M58 42 h32 M58 54 h20" stroke="#F2B705" stroke-width="6" stroke-linecap="round"/>
</svg>
`;
var DEMO_LOGO_ID = "logo.synthetic-demo-mark";
function createDemoBrand() {
  if (process.env[AGENT_TOKEN_ENV]) throw new RuntimeError("refused", `The synthetic demo is built by the owner process. Refusing while ${AGENT_TOKEN_ENV} is set.`);
  if (!process.env.BRAND_OS_DATA_KEY) {
    process.env.BRAND_OS_DATA_KEY = createHash2("sha256").update(`${DEMO_BANNER}:data-key`).digest("base64");
  }
  const root = fs4.mkdtempSync(path4.join(os.tmpdir(), "brand-os-runtime-demo-"));
  const cleanup = () => fs4.rmSync(root, { recursive: true, force: true });
  try {
    writeStarterWorkspace(root);
    const configFile = path4.join(root, "brand", "brand.config.yaml");
    const config = import_yaml.default.parse(fs4.readFileSync(configFile, "utf8"));
    config.brand.slug = DEMO_BRAND_SLUG;
    config.brand.name = "SYNTHETIC DEMO social brand";
    fs4.writeFileSync(configFile, import_yaml.default.stringify(config));
    const engine = new InterviewEngine(root);
    const proof = ensureApprovalSecret(root);
    for (const [id, value] of DEMO_FACTS) {
      const changed = engine.changeAnswer(id, value);
      if (changed.kind !== "recorded") throw new RuntimeError("refused", `demo fact ${id} was not recorded (${changed.kind})`);
      const approved2 = engine.approve(id, "owner", proof);
      if (approved2.kind !== "recorded") throw new RuntimeError("refused", `demo fact ${id} was not approved (${approved2.kind})`);
    }
    const logoPath = "brand/assets/logo/synthetic-demo-mark.svg";
    fs4.mkdirSync(path4.join(root, path4.dirname(logoPath)), { recursive: true });
    fs4.writeFileSync(path4.join(root, logoPath), DEMO_LOGO_SVG);
    const sha = createHash2("sha256").update(DEMO_LOGO_SVG).digest("hex");
    const manifestFile = path4.join(root, "brand", "assets", "asset-manifest.yaml");
    const manifest = fs4.existsSync(manifestFile) ? import_yaml.default.parse(fs4.readFileSync(manifestFile, "utf8")) ?? {} : {};
    manifest.schema_version = manifest.schema_version ?? 1;
    manifest.assets = [
      ...manifest.assets ?? [],
      { id: DEMO_LOGO_ID, name: "Synthetic demo mark", status: "approved", path: logoPath, present: true, visibility: "internal", license: "Owned by the synthetic demo brand (fixture, not a real licence)", checksum_sha256: sha, approved_sha256: sha, approved_by: "owner", approved_at: DEMO_NOW.toISOString() }
    ];
    fs4.writeFileSync(manifestFile, import_yaml.default.stringify(manifest));
    const ws = openWorkspace(root, { now: () => DEMO_NOW });
    const draft = buildContentStrategy(ws, {
      lang: "fa",
      channels: ["instagram"],
      cadence: { instagram: { per: "week", target: 3 } },
      formats: { instagram: ["post"] },
      languages: ["fa"]
    });
    const revision = proposeRevision(ws, { strategy_id: "content-demo", proposal: { ...draft.proposal, content_strategy: draft.block } }).revision;
    approveRevision(ws, { strategy_id: "content-demo", revision: revision.revision, expected_sha256: revision.content_sha256, proof });
    return { root, engine, ctx: agentTokenContext(DEMO_BRAND_SLUG, "agt_synthetic_demo_content", "content-read"), cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}
function demoPack(demo, locale = "fa") {
  const result = buildTaskContext(demo.engine, demo.ctx, { task_type: "social_batch", deliverable_count: 10, channel: "instagram", locale, output_format: "svg" });
  if (result.status !== "ok" || !result.data) throw new RuntimeError("invalid_pack", `task_context returned ${result.status}: ${result.reason ?? ""}`);
  return result.data;
}

// packages/brand-core/src/runtime/outline.ts
import { createHash as createHash3 } from "node:crypto";
import fs5 from "node:fs";
import { createRequire } from "node:module";
import path5 from "node:path";
var MAX_FONT_BYTES = 4e7;
var u16 = (b, o) => b.readUInt16BE(o);
var u32 = (b, o) => b.readUInt32BE(o);
function tables(buf, offset) {
  const out = /* @__PURE__ */ new Map();
  const count = u16(buf, offset + 4);
  for (let i = 0; i < count; i++) {
    const rec = offset + 12 + i * 16;
    out.set(buf.toString("latin1", rec, rec + 4), { offset: u32(buf, rec + 8), length: u32(buf, rec + 12) });
  }
  return out;
}
function familyNames(buf, table) {
  const base = table.offset;
  const count = u16(buf, base + 2);
  const strings = base + u16(buf, base + 4);
  const names = /* @__PURE__ */ new Set();
  for (let i = 0; i < count; i++) {
    const rec = base + 6 + i * 12;
    const [platform, , , nameId, length, offset] = [u16(buf, rec), u16(buf, rec + 2), u16(buf, rec + 4), u16(buf, rec + 6), u16(buf, rec + 8), u16(buf, rec + 10)];
    if (nameId !== 1 && nameId !== 16) continue;
    const raw = buf.subarray(strings + offset, strings + offset + length);
    let text = "";
    if (platform === 3 || platform === 0) {
      for (let j = 0; j + 1 < raw.length; j += 2) text += String.fromCharCode(raw.readUInt16BE(j));
    } else if (platform === 1) text = raw.toString("latin1");
    if (text.trim()) names.add(text.trim());
  }
  return [...names];
}
function cmapLookup(buf, table) {
  const base = table.offset;
  const count = u16(buf, base + 2);
  const subtables = [];
  for (let i = 0; i < count; i++) {
    const rec = base + 4 + i * 8;
    const platform = u16(buf, rec);
    const encoding = u16(buf, rec + 2);
    if (platform === 3 && encoding !== 1 && encoding !== 10) continue;
    const offset = base + u32(buf, rec + 4);
    subtables.push({ format: u16(buf, offset), offset });
  }
  const f12 = subtables.find((entry) => entry.format === 12);
  if (f12) {
    const groups = u32(buf, f12.offset + 12);
    const ranges = [];
    for (let i = 0; i < groups; i++) {
      const g = f12.offset + 16 + i * 12;
      ranges.push([u32(buf, g), u32(buf, g + 4), u32(buf, g + 8)]);
    }
    return (cp) => ranges.some(([start, end, glyph]) => cp >= start && cp <= end && glyph + (cp - start) !== 0);
  }
  const f4 = subtables.find((entry) => entry.format === 4);
  if (!f4) return () => false;
  const o = f4.offset;
  const segX2 = u16(buf, o + 6);
  const ends = o + 14;
  const starts = ends + segX2 + 2;
  const deltas = starts + segX2;
  const rangeOffsets = deltas + segX2;
  return (cp) => {
    if (cp > 65535) return false;
    for (let i = 0; i < segX2 / 2; i++) {
      const end = u16(buf, ends + i * 2);
      if (cp > end) continue;
      const start = u16(buf, starts + i * 2);
      if (cp < start) return false;
      const delta = buf.readInt16BE(deltas + i * 2);
      const rangeOffset = u16(buf, rangeOffsets + i * 2);
      if (rangeOffset === 0) return (cp + delta & 65535) !== 0;
      const glyphAt = rangeOffsets + i * 2 + rangeOffset + (cp - start) * 2;
      if (glyphAt + 2 > buf.length) return false;
      const glyph = u16(buf, glyphAt);
      return glyph !== 0 && (glyph + delta & 65535) !== 0;
    }
    return false;
  };
}
function readFontFile(file) {
  const full = path5.resolve(file);
  let stat;
  try {
    stat = fs5.lstatSync(full);
  } catch {
    throw new RuntimeError("invalid_font", `Font file ${path5.basename(full)} does not exist.`);
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new RuntimeError("invalid_font", "A font path must be a regular file, not a link or a directory.");
  if (stat.size > MAX_FONT_BYTES || stat.size < 12) throw new RuntimeError("invalid_font", `${path5.basename(full)} is not a usable font file size.`);
  const buf = fs5.readFileSync(full);
  const magic = buf.toString("latin1", 0, 4);
  if (magic === "wOFF" || magic === "wOF2") throw new RuntimeError("invalid_font", `${path5.basename(full)} is WOFF/WOFF2; final export needs the TTF or OTF file.`);
  const offsets = magic === "ttcf" ? Array.from({ length: u32(buf, 8) }, (_, i) => u32(buf, 12 + i * 4)) : magic === "OTTO" || magic === "true" || u32(buf, 0) === 65536 ? [0] : null;
  if (!offsets) throw new RuntimeError("invalid_font", `${path5.basename(full)} is not a TrueType/OpenType font.`);
  const families = /* @__PURE__ */ new Set();
  const lookups = [];
  try {
    for (const offset of offsets) {
      const dir = tables(buf, offset);
      const name = dir.get("name");
      const cmap = dir.get("cmap");
      if (name) for (const family of familyNames(buf, name)) families.add(family);
      if (cmap) lookups.push(cmapLookup(buf, cmap));
    }
  } catch {
    throw new RuntimeError("invalid_font", `${path5.basename(full)} could not be parsed as a font.`);
  }
  if (families.size === 0 || lookups.length === 0) throw new RuntimeError("invalid_font", `${path5.basename(full)} has no family name or no character map.`);
  return {
    file_name: path5.basename(full),
    sha256: createHash3("sha256").update(buf).digest("hex"),
    families: [...families].sort(),
    covers: (cp) => lookups.some((lookup) => lookup(cp))
  };
}
function drawnCodepoints(svg) {
  const out = /* @__PURE__ */ new Set();
  for (const match of svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)) {
    const text = match[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
    for (const char of text) {
      const cp = char.codePointAt(0);
      if (/\s/u.test(char) || cp >= 8203 && cp <= 8207 || cp >= 8234 && cp <= 8238 || cp >= 8294 && cp <= 8297) continue;
      out.add(cp);
    }
  }
  return [...out].sort((a, b) => a - b);
}
var hexCp = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
async function createOutliner(files) {
  if (files.length === 0) throw new RuntimeError("invalid_font", "Final export needs at least one --font-file (TTF/OTF of the approved family).");
  const fonts = files.map(readFontFile);
  const paths = files.map((file) => path5.resolve(file));
  const { Resvg } = await import("@resvg/resvg-js");
  const version = String(createRequire(import.meta.url)("@resvg/resvg-js/package.json").version);
  const supplied = new Set(fonts.flatMap((font) => font.families.map((family) => family.toLowerCase())));
  return {
    engine: { name: "resvg-js", version },
    fonts,
    outline(svg, families) {
      const absent = families.filter((family) => !supplied.has(family.toLowerCase()));
      if (absent.length > 0) throw new RuntimeError("invalid_font", `The approved family ${absent.join(", ")} is not in the supplied font files (${fonts.map((font) => font.families.join("/")).join("; ")}). Nothing is substituted.`);
      const missing = drawnCodepoints(svg).filter((cp) => !fonts.some((font) => font.covers(cp)));
      if (missing.length > 0) throw new RuntimeError("invalid_font", `The supplied fonts have no glyph for ${missing.slice(0, 12).map(hexCp).join(" ")}${missing.length > 12 ? " \u2026" : ""}. Nothing is substituted.`);
      const open = /^<svg\b[^>]*>/.exec(svg)[0];
      const title = /<title id="t">[^<]*<\/title>/.exec(svg)?.[0] ?? "";
      const desc = /<desc id="d">[^<]*<\/desc>/.exec(svg)?.[0] ?? "";
      const flat = new Resvg(svg, { font: { loadSystemFonts: false, fontFiles: paths, defaultFontFamily: families[0] ?? "" } }).toString();
      const inner = flat.replace(/^\s*<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/^\s*<defs\/>\s*/, "").trim();
      if (/<text\b/.test(inner)) throw new RuntimeError("invalid_font", "The outliner left live text in the export.");
      return [open, ...title ? [`  ${title}`] : [], ...desc ? [`  ${desc}`] : [], `  ${inner.split("\n").map((line) => line.trim()).filter(Boolean).join("\n  ")}`, "</svg>", ""].join("\n");
    },
    report() {
      return { mode: "final", text: "outlined", outliner: { name: "resvg-js", version }, fonts: fonts.map((font) => ({ file_name: font.file_name, sha256: font.sha256, families: font.families })) };
    }
  };
}

// packages/brand-core/src/runtime/production-agent.ts
function parseRequiredAssets(value) {
  if (value === void 0 || value === null) return [];
  if (!Array.isArray(value) || value.length > REQUIRABLE_ASSETS.length) return null;
  if (!value.every((entry) => REQUIRABLE_ASSETS.includes(entry))) return null;
  return [...new Set(value)];
}
function runProductionReadinessTool(engine, ctx, input = {}) {
  const brandId = engine.config().brand.slug;
  const root = engine.workspaceRoot();
  const log = (decision, reason, requested = [], returned = []) => {
    try {
      appendAccessLog(root, ctx, { tool: PRODUCTION_READINESS_TOOL, kind: "task", requested_ids: requested, returned_ids: returned, withheld_ids: [], query_sha256: null, decision, reason });
      return true;
    } catch {
      return false;
    }
  };
  const refuse = (status, reason, extra = {}) => ({ tool: PRODUCTION_READINESS_TOOL, status, brand_id: brandId, reason, ...extra, data: null, authorizes: [] });
  const access = taskContextAccess(ctx, brandId);
  if (!access.allow) {
    log("deny", access.reason);
    return refuse("denied", access.reason);
  }
  const { required_assets: requiredInput, ...taskInput } = input;
  const required = parseRequiredAssets(requiredInput);
  if (required === null) {
    log("deny", "invalid");
    return refuse("invalid", `required_assets is a list of: ${REQUIRABLE_ASSETS.join(", ")}.`);
  }
  const built = runTaskContextTool(engine, ctx, taskInput, { taskTypeHint: "task_type" });
  if (built.status === "need_task_type") {
    log("deny", "need_task_type");
    return refuse("need_task_type", built.reason, { candidates: built.candidates });
  }
  if (built.status !== "ok" || !built.data) {
    log("deny", built.status);
    return refuse(built.status === "ok" ? "invalid" : built.status, built.reason ?? built.status);
  }
  const pack = built.data;
  const locale = TASK_LOCALES.includes(taskInput.locale) ? taskInput.locale : pack.task.locale;
  const ids = packAssetIds(pack).slice(0, MAX_ASSET_IDS);
  let references = null;
  if (ids.length > 0) {
    const dna = runVisualDnaTool(engine, ctx, { asset_ids: ids, locale });
    references = dna.status === "ok" ? dna.references : null;
  } else references = [];
  const data = productionReadiness({ pack, locale, required_assets: required, references });
  if (!log("allow", `production:${data.production_ready}`, [pack.task.type], data.blockers.map((blocker) => blocker.check_id))) {
    return refuse("denied", "access log unavailable");
  }
  return { tool: PRODUCTION_READINESS_TOOL, status: "ok", brand_id: brandId, data, authorizes: [] };
}

export {
  RuntimeError,
  readPackFile,
  openOwnerWorkspace,
  packSourceDrift,
  productionText,
  REQUIRABLE_ASSETS,
  packAssetIds,
  productionReadiness,
  readBatchDir,
  loadApprovedLogo,
  runSocialBatch,
  writeBatch,
  DEMO_BANNER,
  DEMO_NOW,
  createDemoBrand,
  demoPack,
  createOutliner,
  parseRequiredAssets,
  runProductionReadinessTool
};
