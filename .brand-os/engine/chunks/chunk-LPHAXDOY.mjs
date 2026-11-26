import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  CREATIVE_LIMITS,
  CreativeError,
  PREFERENCE_ID,
  PROJECT_ID,
  VARIANT_ID,
  assertOwnerProcess2 as assertOwnerProcess,
  preferenceDigest,
  readPreference,
  scopeLabel,
  validatePreferenceId
} from "./chunk-ZYAYDNGS.mjs";
import {
  knowledgeRef,
  safetyBlocksSharing,
  safetyReport,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/creative/share.ts
import fs from "node:fs";
import path from "node:path";
var SHARED_DECISIONS_DIR = "brand/creative/shared";
var SHARED_DECISION_FILE = /^cp_[0-9a-f-]{36}\.json$/;
var PROVENANCE = /^knowledge:kn_[a-z0-9][a-z0-9-]{2,63}@[0-9a-f]{64}$/;
function decisionFrom(pref, now) {
  if (pref.state === "draft") throw new CreativeError("refused", `${pref.preference_id} is a draft. Only an approved or superseded decision can be shared.`);
  if (!pref.approval || pref.approval.digest !== preferenceDigest(pref)) throw new CreativeError("refused", `${pref.preference_id} does not match its approval record. It is not shared.`);
  const blocked = safetyBlocksSharing(safetyReport(`${pref.statement}
${pref.context ?? ""}`));
  if (blocked.length) throw new CreativeError("refused", `The statement or context looks like it contains ${blocked.join("; ")}. Nothing was shared.`);
  return {
    schema_version: 1,
    kind: "creative_decision",
    decision_id: pref.preference_id,
    brand_slug: pref.brand_slug,
    project_id: pref.project_id,
    statement: pref.statement,
    context: pref.context,
    scope: { level: pref.scope.level, label: scopeLabel(pref.scope) },
    state: pref.state,
    approved_at: pref.approval.approved_at,
    supersedes: pref.supersedes,
    superseded_by: pref.superseded_by,
    superseded_at: pref.superseded_at,
    sources: pref.sources.map((ref) => knowledgeRef(ref.id, ref.revision)),
    counterexamples: pref.counterexamples,
    shared_at: now
  };
}
function shareDecision(ws, input) {
  assertOwnerProcess();
  const pref = readPreference(ws, validatePreferenceId(input.preference_id));
  const now = ws.now().toISOString();
  const decision = decisionFrom(pref, now);
  const fileOf = (id) => `${SHARED_DECISIONS_DIR}/${id}.json`;
  const abs = (rel) => path.join(ws.root, ...rel.split("/"));
  const refresh = [];
  if (pref.supersedes && fs.existsSync(abs(fileOf(pref.supersedes)))) {
    const old = readPreference(ws, pref.supersedes);
    if (old.state === "superseded") refresh.push(decisionFrom(old, now));
  }
  if (!input.dryRun) {
    for (const item of [decision, ...refresh]) writeVaultFile(ws, abs(fileOf(item.decision_id)), `${JSON.stringify(item, null, 2)}
`, false);
  }
  return { path: fileOf(pref.preference_id), decision, written: !input.dryRun, refreshed: refresh.map((item) => fileOf(item.decision_id)) };
}
var STUDIO_CREATIVE_LIMITS = { maxItems: 300, maxFileBytes: 64 * 1024 };
var ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
function str(value, max) {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}
function nullableIso(value) {
  return value === null || typeof value === "string" && ISO.test(value);
}
function nullablePref(value) {
  return value === null || typeof value === "string" && PREFERENCE_ID.test(value);
}
function validSharedDecision(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const doc = value;
  const scope = doc.scope;
  return doc.schema_version === 1 && doc.kind === "creative_decision" && typeof doc.decision_id === "string" && PREFERENCE_ID.test(doc.decision_id) && typeof doc.brand_slug === "string" && typeof doc.project_id === "string" && PROJECT_ID.test(doc.project_id) && str(doc.statement, CREATIVE_LIMITS.maxStatementChars) && (doc.context === null || str(doc.context, CREATIVE_LIMITS.maxContextChars)) && !!scope && typeof scope === "object" && (scope.level === "project" || scope.level === "series") && str(scope.label, 120) && (doc.state === "approved" || doc.state === "superseded") && typeof doc.approved_at === "string" && ISO.test(doc.approved_at) && nullablePref(doc.supersedes) && nullablePref(doc.superseded_by) && nullableIso(doc.superseded_at) && Array.isArray(doc.sources) && doc.sources.length <= CREATIVE_LIMITS.maxSources && doc.sources.every((item) => typeof item === "string" && PROVENANCE.test(item)) && Array.isArray(doc.counterexamples) && doc.counterexamples.length <= CREATIVE_LIMITS.maxCounterexamples && doc.counterexamples.every(
    (item) => !!item && typeof item === "object" && typeof item.project_id === "string" && PROJECT_ID.test(item.project_id) && typeof item.variant_id === "string" && VARIANT_ID.test(item.variant_id)
  ) && typeof doc.shared_at === "string" && ISO.test(doc.shared_at);
}
function buildStudioCreative(root, brandSlug) {
  const dir = path.join(root, ...SHARED_DECISIONS_DIR.split("/"));
  const out = { items: [], withheld: [], total: 0 };
  let stat;
  try {
    stat = fs.lstatSync(dir);
  } catch {
    return out;
  }
  if (!stat.isDirectory()) return out;
  for (const name of fs.readdirSync(dir).sort()) {
    const rel = `${SHARED_DECISIONS_DIR}/${name}`;
    const file = path.join(dir, name);
    const entry = fs.lstatSync(file);
    if (entry.isSymbolicLink()) {
      out.withheld.push({ path: rel, reason: "symlink" });
      continue;
    }
    if (!SHARED_DECISION_FILE.test(name) || !entry.isFile()) {
      out.withheld.push({ path: rel, reason: "unexpected_file" });
      continue;
    }
    if (entry.size > STUDIO_CREATIVE_LIMITS.maxFileBytes) {
      out.withheld.push({ path: rel, reason: "unreadable" });
      continue;
    }
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      out.withheld.push({ path: rel, reason: "unreadable" });
      continue;
    }
    if (!validSharedDecision(doc)) {
      out.withheld.push({ path: rel, reason: "invalid_record" });
      continue;
    }
    if (doc.brand_slug !== brandSlug) {
      out.withheld.push({ path: rel, reason: "wrong_brand" });
      continue;
    }
    if (`${doc.decision_id}.json` !== name) {
      out.withheld.push({ path: rel, reason: "filename_mismatch" });
      continue;
    }
    if (safetyBlocksSharing(safetyReport(`${doc.statement}
${doc.context ?? ""}
${doc.scope.label}`)).length) {
      out.withheld.push({ path: rel, reason: "unsafe_text" });
      continue;
    }
    out.items.push({
      schema_version: 1,
      kind: "creative_decision",
      decision_id: doc.decision_id,
      brand_slug: doc.brand_slug,
      project_id: doc.project_id,
      statement: doc.statement,
      context: doc.context,
      scope: { level: doc.scope.level, label: doc.scope.label },
      state: doc.state,
      approved_at: doc.approved_at,
      supersedes: doc.supersedes,
      superseded_by: doc.superseded_by,
      superseded_at: doc.superseded_at,
      sources: [...doc.sources],
      counterexamples: doc.counterexamples.map((item) => ({ project_id: item.project_id, variant_id: item.variant_id })),
      shared_at: doc.shared_at
    });
  }
  out.total = out.items.length;
  out.items.sort((a, b) => a.state === b.state ? b.approved_at.localeCompare(a.approved_at) : a.state === "approved" ? -1 : 1);
  out.items = out.items.slice(0, STUDIO_CREATIVE_LIMITS.maxItems);
  return out;
}

export {
  shareDecision,
  buildStudioCreative
};
