import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  fontAliasSources
} from "./chunk-MHQ2KNS6.mjs";
import {
  SEMANTIC_COLOR_SLOTS,
  SEMANTIC_MAP_QUESTION,
  SEMANTIC_SLOTS,
  brandRoleTokenId,
  parseSemanticMap,
  semanticAnswerText,
  suggestSemanticMap
} from "./chunk-AQ6QTRSP.mjs";
import {
  GENERATED_TOKEN_DIR,
  compileTokens,
  tokenDigest
} from "./chunk-HHMADR62.mjs";
import {
  approvalProofMatches,
  parseStructured,
  readEvidence,
  readFacts,
  writeAtomic,
  writeYaml
} from "./chunk-HOCT4QOE.mjs";
import {
  assetPathIsSafe,
  patchManifestAsset,
  svgPublicationIssues
} from "./chunk-QXBDJJNV.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// packages/brand-core/src/asset-approval.ts
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
var import_yaml = __toESM(require_dist(), 1);
function approveAssets(root, ids, proof, actor = "owner", now = () => /* @__PURE__ */ new Date()) {
  const result = { ok: false, proof: "rejected", changed: 0, results: [] };
  if (!approvalProofMatches(root, proof)) return result;
  result.proof = "accepted";
  const manifestFile = path.join(root, "brand", "assets", "asset-manifest.yaml");
  for (const id of ids) {
    const manifest = (0, import_yaml.parse)(fs.readFileSync(manifestFile, "utf8"));
    const asset = (manifest.assets ?? []).find((item) => item.id === id);
    if (!asset) {
      result.results.push({ id, outcome: "unknown", reason: "No asset with this id." });
      continue;
    }
    const assetPath = typeof asset.path === "string" ? asset.path : "";
    const full = path.join(root, assetPath);
    if (asset.present !== true || !assetPathIsSafe(root, assetPath) || !fs.existsSync(full) || fs.lstatSync(full).isSymbolicLink()) {
      result.results.push({ id, outcome: "refused", reason: "The file is not present in brand/assets. A missing asset cannot be approved." });
      continue;
    }
    const bytes = fs.readFileSync(full);
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (typeof asset.checksum_sha256 !== "string" || asset.checksum_sha256 !== sha) {
      result.results.push({ id, outcome: "refused", reason: "checksum_sha256 in the manifest does not match the file. Fix the manifest in a reviewed edit first." });
      continue;
    }
    if (assetPath.toLowerCase().endsWith(".svg")) {
      const issues = svgPublicationIssues(bytes.toString("utf8"));
      if (issues.length > 0) {
        const fixable = issues.every((issue) => issue.fixable);
        result.results.push({ id, outcome: "refused", reason: `The SVG fails the check (${issues[0].code}). ${fixable ? `Run npm run brand:assets -- normalize ${id} first.` : "Fix the source file and export it again."}` });
        continue;
      }
    }
    const status = typeof asset.status === "string" ? asset.status : "draft";
    if ((status === "approved" || status === "published") && asset.approved_sha256 === sha) {
      result.results.push({ id, outcome: "unchanged", reason: "Already approved with these bytes.", sha256: sha });
      continue;
    }
    patchManifestAsset(root, id, {
      status: status === "published" ? "published" : "approved",
      approved_by: actor,
      approved_at: now().toISOString(),
      approved_sha256: sha,
      approval_carried_from: void 0,
      approval_reset: void 0
    });
    result.results.push({ id, outcome: "approved", reason: "Approved these exact bytes. Not published.", sha256: sha });
    result.changed += 1;
  }
  result.ok = result.results.every((item) => item.outcome === "approved" || item.outcome === "unchanged");
  return result;
}

// packages/brand-core/src/approve-all.ts
var import_yaml2 = __toESM(require_dist(), 1);
import fs2 from "node:fs";
import path2 from "node:path";
var PENDING_KINDS = ["fact", "change", "evidence", "asset"];
var ASSET_PENDING = /* @__PURE__ */ new Set(["draft", "in_review"]);
function isTemplateExample(asset) {
  const tags = Array.isArray(asset.tags) ? asset.tags.map(String) : [];
  const license = typeof asset.license === "string" ? asset.license : "";
  const name = typeof asset.name === "string" ? asset.name : "";
  return tags.includes("example") || tags.includes("placeholder") || /^EXAMPLE/i.test(license) || /^EXAMPLE\b/.test(name);
}
function assetEntries(root) {
  const file = path2.join(root, "brand", "assets", "asset-manifest.yaml");
  if (!fs2.existsSync(file)) return [];
  const manifest = (0, import_yaml2.parse)(fs2.readFileSync(file, "utf8"));
  const entries = [];
  for (const asset of manifest?.assets ?? []) {
    const id = typeof asset.id === "string" ? asset.id : null;
    const status = typeof asset.status === "string" ? asset.status : "draft";
    if (!id || !ASSET_PENDING.has(status)) continue;
    if (asset.present !== true) continue;
    if (isTemplateExample(asset)) {
      entries.push({ kind: "asset", id, question_id: null, decision: "skip", reason: "Template example or placeholder. Never approved in bulk; approve it by id with brand:assets approve only if it is really yours." });
      continue;
    }
    entries.push({ kind: "asset", id, question_id: null, decision: "approve", reason: "Draft asset. Approval records these exact bytes after the checksum and SVG checks pass." });
  }
  return entries;
}
function evidenceEntries(root) {
  return readEvidence(root).filter((item) => item.status === "pending").map((item) => ({
    kind: "evidence",
    id: item.id,
    question_id: item.claim_id,
    decision: "approve",
    reason: `Pending ${item.kind} (${item.source_type}) for ${item.claim_id}. Verifying marks it verified; it does not publish.`
  }));
}
function planAllPending(approvals, root, options = {}) {
  const entries = [...approvals.approvalPlan({}, { actor: options.actor, skipTentative: true }), ...evidenceEntries(root), ...assetEntries(root)];
  const exclude = new Set((options.exclude ?? []).map((id) => id.trim()).filter(Boolean));
  const matched = /* @__PURE__ */ new Set();
  const planned = entries.map((entry) => {
    if (!exclude.has(entry.id)) return entry;
    matched.add(entry.id);
    return { ...entry, decision: "skip", reason: "Excluded with --exclude." };
  });
  planned.sort((a, b) => PENDING_KINDS.indexOf(a.kind) - PENDING_KINDS.indexOf(b.kind));
  return { entries: planned, unmatched_excludes: [...exclude].filter((id) => !matched.has(id)) };
}
function outcomeOf(decision) {
  return decision === "stale" ? "stale" : decision === "refuse" ? "refused" : "skipped";
}
function fromBatch(item) {
  if (!item) return { outcome: "refused", reason: "No result was reported for this item." };
  if (item.outcome === "approved") return { outcome: "approved", reason: item.reason };
  if (item.outcome === "stale") return { outcome: "stale", reason: item.reason };
  if (item.outcome === "skipped") return { outcome: "skipped", reason: item.reason };
  return { outcome: "refused", reason: item.reason };
}
function approveAllPending(approvals, root, plan, proof, actor = "owner") {
  const counts = { approved: 0, skipped: 0, refused: 0, stale: 0 };
  const finish = (results2, proofState) => {
    for (const item of results2) counts[item.outcome] += 1;
    return {
      mode: "approve",
      dry_run: false,
      ok: proofState !== "rejected" && counts.refused === 0,
      proof: proofState,
      approved: counts.approved,
      counts,
      results: results2,
      unmatched_excludes: plan.unmatched_excludes
    };
  };
  const unchanged = (entry) => ({ kind: entry.kind, id: entry.id, question_id: entry.question_id, outcome: entry.decision === "approve" ? "refused" : outcomeOf(entry.decision), reason: entry.reason });
  if (!plan.entries.some((entry) => entry.decision === "approve")) return finish(plan.entries.map(unchanged), "not_needed");
  if (!approvalProofMatches(root, proof)) {
    return finish(
      plan.entries.map((entry) => ({ kind: entry.kind, id: entry.id, question_id: entry.question_id, outcome: "refused", reason: "Approval proof rejected. Nothing was changed." })),
      "rejected"
    );
  }
  const byId = /* @__PURE__ */ new Map();
  const factIds = plan.entries.filter((entry) => entry.decision === "approve" && (entry.kind === "fact" || entry.kind === "change")).map((entry) => entry.id);
  if (factIds.length > 0) {
    const batch = approvals.approveBatch({ ids: factIds }, proof, actor);
    for (const id of factIds) byId.set(`fact:${id}`, fromBatch(batch.results.find((item) => item.id === id)));
  }
  for (const entry of plan.entries.filter((item) => item.decision === "approve" && item.kind === "evidence")) {
    try {
      const reviewed = approvals.reviewEvidence(entry.id, "verified", proof, null, actor);
      byId.set(`evidence:${entry.id}`, { outcome: reviewed.ok ? "approved" : "refused", reason: reviewed.message + (reviewed.unpublished.length ? ` Unpublished: ${reviewed.unpublished.join(", ")}.` : "") });
    } catch (error) {
      byId.set(`evidence:${entry.id}`, { outcome: "refused", reason: error instanceof Error ? error.message : "Evidence review failed." });
    }
  }
  const assetIds = plan.entries.filter((entry) => entry.decision === "approve" && entry.kind === "asset").map((entry) => entry.id);
  if (assetIds.length > 0) {
    const assets = approveAssets(root, assetIds, proof, actor);
    for (const id of assetIds) {
      const item = assets.results.find((result) => result.id === id);
      byId.set(`asset:${id}`, !item ? { outcome: "refused", reason: "No result was reported for this asset." } : item.outcome === "approved" ? { outcome: "approved", reason: item.reason } : item.outcome === "unchanged" ? { outcome: "skipped", reason: item.reason } : { outcome: "refused", reason: item.reason });
    }
  }
  const results = plan.entries.map((entry) => {
    const base = { kind: entry.kind, id: entry.id, question_id: entry.question_id };
    if (entry.decision !== "approve") return { ...base, outcome: outcomeOf(entry.decision), reason: entry.reason };
    const done = byId.get(`${entry.kind === "change" ? "fact" : entry.kind}:${entry.id}`);
    return { ...base, ...done ?? { outcome: "refused", reason: "No result was reported for this item." } };
  });
  return finish(results, "accepted");
}
function dryRunNotice(count) {
  return `DRY RUN: ${count} item${count === 1 ? "" : "s"} would be approved. Nothing was changed.`;
}
function dryRunReport(entries, unmatchedExcludes = []) {
  const items = entries.map((entry) => ({
    kind: entry.kind,
    id: entry.id,
    question_id: entry.question_id,
    decision: entry.decision === "approve" ? "would_approve" : "would_skip",
    because: entry.decision === "approve" ? null : entry.decision === "stale" ? "stale" : entry.decision === "refuse" ? "refused" : "skipped",
    reason: entry.reason
  }));
  const count = items.filter((item) => item.decision === "would_approve").length;
  return { mode: "dry_run", dry_run: true, nothing_changed: true, notice: dryRunNotice(count), would_approve: count, would_skip: items.length - count, items, unmatched_excludes: unmatchedExcludes };
}
var KIND_TITLES = { fact: "Facts", change: "Change proposals", evidence: "Evidence awaiting verification", asset: "Draft assets" };
function grouped(items, line) {
  const lines = [];
  for (const kind of PENDING_KINDS) {
    const rows = items.filter((item) => item.kind === kind);
    if (rows.length === 0) continue;
    lines.push("", `${KIND_TITLES[kind]} (${rows.length})`, ...rows.map(line));
  }
  return lines;
}
function formatDryRun(report) {
  const lines = [report.notice, "This is a preview: not the review queue and not an approval result. No proof was read."];
  if (report.items.length === 0) lines.push("", "Nothing is pending.");
  lines.push(...grouped(report.items, (item) => `  ${(item.decision === "would_approve" ? "would approve" : `would skip${item.because === "stale" ? " (stale)" : item.because === "refused" ? " (refused)" : ""}`).padEnd(24)} ${item.id}  ${item.reason}`));
  if (report.unmatched_excludes.length) lines.push("", `--exclude matched nothing pending: ${report.unmatched_excludes.join(", ")}`);
  lines.push("", `${report.notice} Run the same command without --dry-run to approve.`);
  return lines.join("\n");
}
function formatAllPending(result) {
  const lines = result.proof === "rejected" ? ["APPROVAL REFUSED: proof rejected. Nothing was changed."] : result.proof === "not_needed" ? ["NOTHING TO APPROVE: no proof was read and nothing was changed."] : [`APPROVAL RESULT: ${result.counts.approved} approved, ${result.counts.skipped} skipped, ${result.counts.refused} refused, ${result.counts.stale} stale. Nothing was published.`];
  if (result.results.length === 0) lines.push("", "Nothing is pending.");
  lines.push(...grouped(result.results, (item) => `  ${item.outcome.padEnd(9)} ${item.id}  ${item.reason}`));
  if (result.unmatched_excludes.length) lines.push("", `--exclude matched nothing pending: ${result.unmatched_excludes.join(", ")}`);
  return lines.join("\n");
}

// packages/brand-core/src/token-generate.ts
var import_yaml3 = __toESM(require_dist(), 1);
import fs3 from "node:fs";
import path3 from "node:path";
var TOKEN_SOURCES = [
  { question_id: "brand.color.roles", type: "color", file: "color.tokens.json" },
  { question_id: "brand.type.scale", type: "font", file: "typography.tokens.json" },
  { question_id: "brand.logo.min_size", type: "logo_spec", file: "logo.tokens.json" }
];
var TOKEN_SOURCE_QUESTIONS = [...TOKEN_SOURCES.map((source) => source.question_id), SEMANTIC_MAP_QUESTION];
function tokenNextStep(approvedQuestionIds) {
  const touched = [...new Set([...approvedQuestionIds].filter((id) => typeof id === "string" && TOKEN_SOURCE_QUESTIONS.includes(id)))];
  if (touched.length === 0) return null;
  return `Next step: ${touched.join(", ")} ${touched.length === 1 ? "is" : "are"} approved. Run \`npm run brand:tokens:generate\` to turn these into draft tokens. Generated tokens stay drafts until the owner approves them with brand:tokens:approve.`;
}
var APPROVALS_PATH = path3.join("brand", "tokens", "approvals.yaml");
function readTokenApprovals(root) {
  const file = path3.join(root, APPROVALS_PATH);
  if (!fs3.existsSync(file)) return {};
  const doc = (0, import_yaml3.parse)(fs3.readFileSync(file, "utf8"));
  return doc?.approved ?? {};
}
function brandDefaultLocale(root) {
  try {
    const file = path3.join(root, "brand", "brand.config.yaml");
    if (!fs3.existsSync(file)) return null;
    const doc = (0, import_yaml3.parse)(fs3.readFileSync(file, "utf8"));
    const locale = doc?.brand?.default_locale;
    return typeof locale === "string" && /^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})?$/.test(locale) ? locale : null;
  } catch {
    return null;
  }
}
function draftsFrom(question_id, type, file, fact, defaultLocale = null) {
  const parsed = parseStructured(type, fact.value);
  if (!parsed) return null;
  const base = { file, fact };
  if (parsed.type === "color") {
    return parsed.colors.map((color) => ({
      ...base,
      id: brandRoleTokenId(color.role),
      type: "color",
      value: { colorSpace: "srgb", hex: color.hex },
      description: `Draft from approved ${question_id} (owner role ${color.role}).`
    }));
  }
  if (parsed.type === "font") {
    const aliases = fontAliasSources(parsed.fonts.map((font) => font.role), defaultLocale).flatMap((source) => {
      const font = parsed.fonts.find((item) => item.role === source.role);
      if (!font) return [];
      const why = source.reason === "default_locale" ? `the default locale ${defaultLocale}` : source.reason === "synonym" ? "the same role" : "the first listed role";
      return [{ ...base, id: `type.fontFamily.${source.alias}`, type: "fontFamily", value: [font.family, ...font.fallback], description: `Draft alias of type.fontFamily.${font.role} (${why}) from approved ${question_id}.`, alias_of: `type.fontFamily.${font.role}` }];
    });
    const own = parsed.fonts.flatMap((font) => [
      { ...base, id: `type.fontFamily.${font.role}`, type: "fontFamily", value: [font.family, ...font.fallback], description: `Draft from approved ${question_id} (${font.role}).` },
      ...font.size_px === null ? [] : [{ ...base, id: `type.fontSize.${font.role}`, type: "dimension", value: { value: font.size_px, unit: "px" }, description: `Draft size from approved ${question_id}.` }],
      ...font.line_height === null ? [] : [{ ...base, id: `type.lineHeight.${font.role}`, type: "number", value: font.line_height, description: `Draft line height from approved ${question_id}.` }]
    ]);
    return [...own, ...aliases];
  }
  if (parsed.type === "logo_spec") {
    const logo = parsed.logo;
    return [
      { ...base, id: "logo.minSize", type: "dimension", value: { value: logo.min_size_px, unit: "px" }, description: `Draft minimum on-screen size from approved ${question_id}.` },
      logo.clear_space.unit === "px" ? { ...base, id: "logo.clearSpace", type: "dimension", value: { value: logo.clear_space.value, unit: "px" }, description: `Draft clear space from approved ${question_id}.` } : { ...base, id: "logo.clearSpace", type: "number", value: logo.clear_space.value, description: `Draft clear space as a multiple of the mark height, from approved ${question_id}.` },
      ...logo.min_print_mm === null ? [] : [{ ...base, id: "logo.minPrintSize", type: "dimension", value: { value: logo.min_print_mm, unit: "mm" }, description: `Draft minimum print size from approved ${question_id}.` }]
    ];
  }
  return null;
}
function setPath(doc, id, node) {
  const parts = id.split(".");
  let cursor = doc;
  for (const part of parts.slice(0, -1)) {
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1] ?? id] = node;
}
function getPath(doc, id) {
  let cursor = doc;
  for (const part of id.split(".")) {
    if (!cursor || typeof cursor !== "object") return void 0;
    cursor = cursor[part];
  }
  return cursor && typeof cursor === "object" && "$value" in cursor ? cursor : void 0;
}
function leafIds(doc, prefix = []) {
  if (!doc) return [];
  if (doc.$value !== void 0) return [prefix.join(".")];
  return Object.entries(doc).filter(([key, value]) => !key.startsWith("$") && value && typeof value === "object").flatMap(([key, value]) => leafIds(value, [...prefix, key]));
}
function readGenerated(root, file) {
  const full = path3.join(root, GENERATED_TOKEN_DIR, file);
  return fs3.existsSync(full) ? JSON.parse(fs3.readFileSync(full, "utf8")) : void 0;
}
function sourceState(fact) {
  if (!fact || fact.value === null || fact.value === void 0) return "missing";
  if (fact.status !== "approved") return "not_approved";
  if (fact.classification === "restricted") return "restricted";
  return "used";
}
function semanticDrafts(facts, roles) {
  const fact = facts[SEMANTIC_MAP_QUESTION];
  let state = sourceState(fact);
  const report = {
    question_id: SEMANTIC_MAP_QUESTION,
    state,
    applied: [],
    kept_template: [],
    problems: [],
    suggestions: [],
    suggested_answer: null,
    template_examples: [],
    answer_command: null
  };
  const drafts = [];
  if (!roles || roles.length === 0) {
    report.state = state === "used" ? "no_roles" : state;
    if (state === "used") report.problems.push("brand.color.roles is not approved, so no role can be mapped.");
    report.template_examples = SEMANTIC_SLOTS.map((slot) => SEMANTIC_COLOR_SLOTS[slot]);
    return { drafts, report };
  }
  if (state === "used" && fact) {
    const parsed = parseSemanticMap(String(fact.value), roles);
    report.applied = parsed.assignments;
    report.kept_template = parsed.unmapped;
    report.problems = parsed.problems;
    if (parsed.assignments.length === 0 && parsed.unmapped.length === 0) state = "invalid";
    for (const item of parsed.assignments) {
      drafts.push({
        id: item.token_id,
        file: "color.tokens.json",
        type: "color",
        value: { colorSpace: "srgb", hex: item.hex },
        description: `Draft from approved ${SEMANTIC_MAP_QUESTION}: ${item.slot} is the owner role ${item.role}.`,
        fact
      });
    }
  }
  report.state = state;
  const decided = /* @__PURE__ */ new Set([...report.applied.map((item) => item.slot), ...report.kept_template]);
  report.suggestions = suggestSemanticMap(roles, decided);
  if (report.suggestions.length > 0) {
    const answer = semanticAnswerText([...report.applied, ...report.kept_template.map((slot) => ({ slot, role: "none" })), ...report.suggestions]);
    report.suggested_answer = answer;
    report.answer_command = `npm run brand:interview -- --question ${SEMANTIC_MAP_QUESTION} --answer "${answer}"`;
  }
  report.template_examples = SEMANTIC_SLOTS.filter((slot) => !report.applied.some((item) => item.slot === slot)).map((slot) => SEMANTIC_COLOR_SLOTS[slot]);
  return { drafts, report };
}
function generateTokens(root, brandId, options = {}) {
  const facts = readFacts(root, "approved", brandId);
  const approvals = readTokenApprovals(root);
  const defaultLocale = brandDefaultLocale(root);
  const byFile = /* @__PURE__ */ new Map();
  const group = (file) => {
    if (!byFile.has(file)) byFile.set(file, { sources: [], drafts: [] });
    return byFile.get(file);
  };
  const sources = [];
  let roles = null;
  for (const source of TOKEN_SOURCES) {
    const fact = facts[source.question_id];
    let state = sourceState(fact);
    const entry = group(source.file);
    entry.sources.push(source.question_id);
    if (state === "used" && fact) {
      const made = draftsFrom(source.question_id, source.type, source.file, fact, defaultLocale);
      if (made === null) state = "invalid";
      else entry.drafts.push(...made);
      if (source.type === "color") {
        const parsed = parseStructured("color", fact.value);
        roles = parsed?.type === "color" ? parsed.colors : null;
      }
    }
    sources.push({ question_id: source.question_id, state, version: fact?.version ?? null });
  }
  const semantic = semanticDrafts(facts, roles);
  group("color.tokens.json").sources.push(SEMANTIC_MAP_QUESTION);
  group("color.tokens.json").drafts.push(...semantic.drafts);
  sources.push({ question_id: SEMANTIC_MAP_QUESTION, state: semantic.report.state === "no_roles" ? "invalid" : semantic.report.state, version: facts[SEMANTIC_MAP_QUESTION]?.version ?? null });
  const report = {
    ok: true,
    dry_run: options.dryRun === true,
    files: [],
    tokens: [],
    sources,
    semantic: semantic.report,
    note: "Generated tokens are drafts. Approve them with npm run brand:approve -- --all-pending (or brand:tokens:approve by id) and publish them with brand:tokens:publish before any agent or public build can read them."
  };
  const docs = /* @__PURE__ */ new Map();
  for (const [file, { sources: fileSources, drafts }] of byFile) {
    const old = readGenerated(root, file);
    const doc = {
      $description: `DRAFT tokens generated from approved ${fileSources.join(", ")}. Not approved tokens until brand/tokens/approvals.yaml holds a matching hash.`
    };
    const produced = /* @__PURE__ */ new Set();
    for (const draft of drafts) {
      const sourceFact = draft.fact.id;
      produced.add(draft.id);
      const node = {
        $type: draft.type,
        $value: draft.value,
        $description: draft.description,
        $extensions: { "brand.os": { status: "draft", generated: true, source_fact: sourceFact, source_version: draft.fact.version, ...draft.alias_of ? { alias_of: draft.alias_of } : {} } }
      };
      const prior = getPath(old, draft.id);
      const approval = approvals[draft.id];
      if (approval) {
        const same = typeof approval.value_sha256 === "string" && approval.value_sha256 === tokenDigest({ value: draft.value, hex: draft.type === "color" ? draft.value.hex : void 0 });
        if (same) {
          setPath(doc, draft.id, prior ?? node);
          report.tokens.push({ id: draft.id, outcome: "unchanged", source_fact: sourceFact, reason: "Already approved with this value." });
        } else {
          if (prior) setPath(doc, draft.id, prior);
          report.tokens.push({ id: draft.id, outcome: "refused_approved", source_fact: sourceFact, reason: "This token id is already approved. It was not overwritten; change it through a reviewed token edit." });
        }
        continue;
      }
      const outcome = !prior ? "created" : JSON.stringify(prior.$value) === JSON.stringify(node.$value) ? "unchanged" : "updated";
      setPath(doc, draft.id, node);
      report.tokens.push({ id: draft.id, outcome, source_fact: sourceFact, reason: "Draft. Needs token approval and publication." });
    }
    for (const id of leafIds(old)) {
      if (produced.has(id)) continue;
      const prior = getPath(old, id);
      const sourceFact = prior?.$extensions?.["brand.os"]?.source_fact ?? fileSources[0] ?? "generated";
      if (approvals[id] && prior) {
        setPath(doc, id, prior);
        report.tokens.push({ id, outcome: "refused_approved", source_fact: sourceFact, reason: "The source answer no longer yields this id, but it is approved, so it was kept." });
      } else {
        report.tokens.push({ id, outcome: "removed", source_fact: sourceFact, reason: "The approved answer no longer yields this draft token." });
      }
    }
    docs.set(file, doc);
  }
  if (semantic.report.suggestions.length > 0 && roles) {
    report.note += ` Template color ids (${semantic.report.template_examples.slice(0, 4).join(", ")}${semantic.report.template_examples.length > 4 ? " \u2026" : ""}) stay template examples until the owner answers ${SEMANTIC_MAP_QUESTION}. A suggested mapping is printed; it was not applied.`;
  }
  if (!report.dry_run) {
    const dir = path3.join(root, GENERATED_TOKEN_DIR);
    for (const [file, doc] of docs) {
      const full = path3.join(dir, file);
      const empty = leafIds(doc).length === 0;
      if (empty) {
        if (fs3.existsSync(full)) {
          fs3.rmSync(full);
          report.files.push(path3.join(GENERATED_TOKEN_DIR, file));
        }
        continue;
      }
      const text = `${JSON.stringify(doc, null, 2)}
`;
      if (fs3.existsSync(full) && fs3.readFileSync(full, "utf8") === text) continue;
      fs3.mkdirSync(dir, { recursive: true });
      writeAtomic(full, text);
      report.files.push(path3.join(GENERATED_TOKEN_DIR, file));
    }
    const compiled = compileTokens(root);
    if (compiled.errors.length > 0) {
      report.ok = false;
      report.note = `Generated tokens were written, but the token set has errors: ${compiled.errors.join("; ")}. Fix the answer (for example a contrast failure) before approving.`;
    }
  }
  return report;
}
function approveTokens(root, ids, proof, actor = "owner") {
  const result = { ok: false, proof: "rejected", changed: 0, results: [], errors: [] };
  if (!approvalProofMatches(root, proof)) return result;
  result.proof = "accepted";
  const compiled = compileTokens(root);
  if (compiled.errors.length > 0) {
    result.errors = compiled.errors;
    result.results = ids.map((id) => ({ id, outcome: "refused", reason: "The token set has errors. Nothing was approved." }));
    return result;
  }
  const approvals = readTokenApprovals(root);
  const next = { ...approvals };
  for (const id of ids) {
    const token = compiled.flat[id];
    if (!token) {
      result.results.push({ id, outcome: "unknown", reason: "No such token." });
      continue;
    }
    if (token.source !== "generated") {
      result.results.push({ id, outcome: "refused", reason: "Base token files are EXAMPLE values. Generate tokens from approved answers first (brand:tokens:generate)." });
      continue;
    }
    const digest = tokenDigest(token);
    if (approvals[id]?.value_sha256 === digest) {
      result.results.push({ id, outcome: "unchanged", reason: "Already approved with this value." });
      continue;
    }
    if (approvals[id]) {
      result.results.push({ id, outcome: "refused", reason: "Already approved with a different value. Remove the old approval in a reviewed edit first." });
      continue;
    }
    next[id] = { approved_by: actor, approved_at: (/* @__PURE__ */ new Date()).toISOString(), value_sha256: digest, source: token.sourceFact ?? "generated" };
    result.results.push({ id, outcome: "approved", reason: "Value hash recorded. Not published." });
    result.changed += 1;
  }
  if (result.changed > 0) writeYaml(path3.join(root, APPROVALS_PATH), { schema_version: 1, approved: next });
  result.ok = result.results.every((item) => item.outcome === "approved" || item.outcome === "unchanged");
  return result;
}
function publishTokens(root, ids, proof, options = {}) {
  const result = { ok: false, proof: "rejected", changed: 0, results: [], errors: [] };
  if (!approvalProofMatches(root, proof)) return result;
  result.proof = "accepted";
  const policyFile = path3.join(root, "brand", "publication-policy.yaml");
  const policy = (fs3.existsSync(policyFile) ? (0, import_yaml3.parse)(fs3.readFileSync(policyFile, "utf8")) : null) ?? {};
  const current = Array.isArray(policy.approved_token_ids) ? policy.approved_token_ids : [];
  const next = [...current];
  const compiled = compileTokens(root);
  const approvals = readTokenApprovals(root);
  for (const id of ids) {
    if (options.unpublish) {
      if (!next.includes(id)) result.results.push({ id, outcome: "unchanged", reason: "Not published." });
      else {
        next.splice(next.indexOf(id), 1);
        result.results.push({ id, outcome: "unpublished", reason: "Removed from approved_token_ids." });
        result.changed += 1;
      }
      continue;
    }
    const token = compiled.flat[id];
    if (!token) {
      result.results.push({ id, outcome: "unknown", reason: "No such token." });
      continue;
    }
    if (approvals[id]?.value_sha256 !== tokenDigest(token)) {
      result.results.push({ id, outcome: "refused", reason: "Not hash-approved with its current value. Approve it first." });
      continue;
    }
    if (next.includes(id)) {
      result.results.push({ id, outcome: "unchanged", reason: "Already published." });
      continue;
    }
    next.push(id);
    result.results.push({ id, outcome: "published", reason: "Added to approved_token_ids." });
    result.changed += 1;
  }
  if (result.changed > 0) writeYaml(policyFile, { ...policy, approved_token_ids: next });
  result.ok = result.results.every((item) => item.outcome !== "refused" && item.outcome !== "unknown");
  return result;
}

export {
  approveAssets,
  PENDING_KINDS,
  planAllPending,
  approveAllPending,
  dryRunNotice,
  dryRunReport,
  formatDryRun,
  formatAllPending,
  TOKEN_SOURCES,
  TOKEN_SOURCE_QUESTIONS,
  tokenNextStep,
  readTokenApprovals,
  generateTokens,
  approveTokens,
  publishTokens
};
