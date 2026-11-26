import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readTokenApprovalDigests,
  tokenLookup,
  tokenSnapshot
} from "./chunk-3KXXRRZE.mjs";
import {
  SOCIAL_KIT_FILE,
  SURFACES,
  SocialKitError,
  assertOwnerProcess,
  evaluateKit,
  kitSafetyProblems,
  readKit,
  styleDigest
} from "./chunk-AQ6QTRSP.mjs";
import {
  compileTokens
} from "./chunk-HHMADR62.mjs";
import {
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/social-kit/share.ts
import fs from "node:fs";
import path from "node:path";
var SHARED_SOCIAL_APPROVALS_FILE = "brand/social/shared/approvals.json";
function shareKitApprovals(ws, input) {
  assertOwnerProcess();
  const read = readKit(ws.root, ws.brandSlug);
  if (read.state === "missing") throw new SocialKitError("not_found", `${SOCIAL_KIT_FILE} does not exist. Nothing was shared.`);
  if (read.state === "invalid") throw new SocialKitError("invalid_kit", `${read.error} Nothing was shared.`);
  const problems = kitSafetyProblems(read.kit);
  if (problems.length) throw new SocialKitError("unsafe", `The kit holds text that looks like ${problems.join(", ")}. Nothing was shared.`);
  const styles = evaluateKit(ws.root, read.kit).filter((state) => state.status === "approved" && state.style.approval).map((state) => ({ style_id: state.style.id, digest: state.digest, approved_at: state.style.approval.approved_at })).sort((a, b) => a.style_id < b.style_id ? -1 : 1);
  const summary = { schema_version: 1, kind: "social_style_approvals_summary", brand_slug: ws.brandSlug, styles, shared_at: ws.now().toISOString() };
  if (!input.dryRun) writeVaultFile(ws, path.join(ws.root, ...SHARED_SOCIAL_APPROVALS_FILE.split("/")), `${JSON.stringify(summary, null, 2)}
`, false);
  return { path: SHARED_SOCIAL_APPROVALS_FILE, summary, written: !input.dryRun };
}
var STUDIO_SOCIAL_LIMITS = { maxFileBytes: 256 * 1024, maxStyles: SURFACES.length * 12 };
var ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
var STYLE_ID = /^(post|carousel|story|reel|reel_cover|thumbnail|linkedin_post|linkedin_document)\.[a-z0-9][a-z0-9-]{1,39}$/;
function validSharedApprovals(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const d = value;
  if (Object.keys(d).some((key) => !["schema_version", "kind", "brand_slug", "styles", "shared_at"].includes(key))) return false;
  return d.schema_version === 1 && d.kind === "social_style_approvals_summary" && typeof d.brand_slug === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(d.brand_slug) && typeof d.shared_at === "string" && ISO.test(d.shared_at) && Array.isArray(d.styles) && d.styles.length <= STUDIO_SOCIAL_LIMITS.maxStyles && d.styles.every((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const s = item;
    return Object.keys(s).every((key) => ["style_id", "digest", "approved_at"].includes(key)) && typeof s.style_id === "string" && STYLE_ID.test(s.style_id) && typeof s.digest === "string" && /^[0-9a-f]{64}$/.test(s.digest) && typeof s.approved_at === "string" && !Number.isNaN(Date.parse(s.approved_at));
  });
}
function readShared(root, brandSlug, withheld) {
  const file = path.join(root, ...SHARED_SOCIAL_APPROVALS_FILE.split("/"));
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch {
    return null;
  }
  const rel = SHARED_SOCIAL_APPROVALS_FILE;
  if (stat.isSymbolicLink()) {
    withheld.push({ path: rel, reason: "symlink" });
    return null;
  }
  if (!stat.isFile() || stat.size > STUDIO_SOCIAL_LIMITS.maxFileBytes) {
    withheld.push({ path: rel, reason: "unreadable" });
    return null;
  }
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    withheld.push({ path: rel, reason: "unreadable" });
    return null;
  }
  if (!validSharedApprovals(doc)) {
    withheld.push({ path: rel, reason: "invalid_record" });
    return null;
  }
  if (doc.brand_slug !== brandSlug) {
    withheld.push({ path: rel, reason: "wrong_brand" });
    return null;
  }
  return { schema_version: 1, kind: doc.kind, brand_slug: doc.brand_slug, styles: doc.styles.map((s) => ({ style_id: s.style_id, digest: s.digest, approved_at: s.approved_at })), shared_at: doc.shared_at };
}
var emptyCounts = () => ({ approved: 0, not_verified: 0, draft: 0, rejected: 0 });
function buildStudioSocialKit(root, brandSlug) {
  const withheld = [];
  const shared = readShared(root, brandSlug, withheld);
  const read = readKit(root, brandSlug);
  const base = { family: null, styles: [], tokens: null, shared: shared ? { shared_at: shared.shared_at, count: shared.styles.length } : null, withheld, counts: emptyCounts() };
  if (read.state === "missing") return shared || withheld.length ? { ...base, state: "missing" } : null;
  if (read.state === "invalid") return { ...base, state: "invalid" };
  const kit = read.kit;
  if (kitSafetyProblems(kit).length) return { ...base, state: "unsafe" };
  const listed = new Map((shared?.styles ?? []).map((item) => [item.style_id, item]));
  const counts = emptyCounts();
  const styles = kit.styles.map((style) => {
    const digest = styleDigest(kit.brand_slug, kit.family, style);
    let status = style.status === "approved" ? "not_verified" : style.status;
    let reason = null;
    if (style.status === "approved") {
      const entry = listed.get(style.id);
      if (!style.approval || style.approval.digest !== digest) reason = "edited_after_approval";
      else if (!entry || entry.digest !== digest) reason = "not_shared";
      else status = "approved";
    }
    counts[status] += 1;
    return { style, status, reason, digest, approved_at: status === "approved" ? style.approval?.approved_at ?? null : null };
  });
  const tokens = tokenSnapshot(kit, tokenLookup(compileTokens(root).flat, readTokenApprovalDigests(root)));
  const order = (surface) => SURFACES.indexOf(surface);
  styles.sort((a, b) => order(a.style.surface) - order(b.style.surface));
  return { ...base, state: "ok", family: kit.family, styles, tokens, counts };
}

export {
  SHARED_SOCIAL_APPROVALS_FILE,
  shareKitApprovals,
  STUDIO_SOCIAL_LIMITS,
  validSharedApprovals,
  buildStudioSocialKit
};
