import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  CONTROL_TEXT,
  DEFAULT_CATALOG,
  POSITIONING_READINESS,
  applicabilityOf,
  assess,
  controlsForMethod,
  fill,
  methodById,
  sourceSnapshotDigest
} from "./chunk-PBBSGXWH.mjs";
import {
  evidenceState,
  factState
} from "./chunk-5OMKZSIF.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  KnowledgeError,
  NOTE_ID,
  canonicalJson,
  credentialFindings,
  dirUsable,
  findContradictions,
  isCurrent,
  isIndependentSource,
  latestAnswers,
  openWorkspace,
  personalConfig,
  readEvidence,
  readFacts,
  safeRead,
  scanAll,
  sha256Hex,
  withLock,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/assurance/reviews.ts
import path from "node:path";
var REVIEW_SCHEMA = "brand-os.assurance-review/1";
var REVIEWS_DIR = "brand/.private/assurance/reviews";
var REVIEW_LIMITS = { maxNoteChars: 500, maxRevisions: 500, maxFileBytes: 512 * 1024 };
var JUDGMENTS = ["yes", "partly", "no"];
var JUDGMENT_STATUS = {
  yes: "applicable_complete",
  partly: "applicable_partial",
  no: "evidence_insufficient"
};
var AssuranceReviewError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AssuranceReviewError";
  }
  code;
};
function assertOwnerReview(env = process.env) {
  if (env[AGENT_TOKEN_ENV]) {
    throw new AssuranceReviewError("refused", `Review judgments are the owner's own. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers them.`);
  }
}
var CONTROL_ID = /^[A-Z]{2,8}-\d{1,4}$/;
var DAY = /^\d{4}-\d{2}-\d{2}$/;
var REVISION = /^rev_[0-9a-f]{24}$/;
function controlFile(ws, controlId) {
  if (!CONTROL_ID.test(controlId)) throw new AssuranceReviewError("invalid_input", "A control id looks like PRR-08.");
  return path.join(ws.root, ...REVIEWS_DIR.split("/"), `${controlId}.json`);
}
function basisDigest(basis) {
  return sha256Hex(canonicalJson(normalBasis(basis)));
}
function normalBasis(basis) {
  return {
    facts: [...basis.facts].map((ref) => ({ id: ref.id, revision: ref.revision })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    evidence: [...basis.evidence].map((ref) => ({ note_id: ref.note_id, revision: ref.revision })).sort((a, b) => a.note_id < b.note_id ? -1 : a.note_id > b.note_id ? 1 : 0)
  };
}
function revisionId(controlId, body) {
  return `rev_${sha256Hex(canonicalJson({ control_id: controlId, ...body })).slice(0, 24)}`;
}
function isDay(value) {
  if (typeof value !== "string" || !DAY.test(value)) return false;
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function cleanNote(value) {
  if (typeof value !== "string") throw new AssuranceReviewError("invalid_input", "A judgment needs a short written note.");
  const note = value.replace(/\s+/g, " ").trim();
  if (!note) throw new AssuranceReviewError("invalid_input", "A judgment needs a short written note.");
  if (/[\u0000-\u001f\u007f]/.test(note)) throw new AssuranceReviewError("invalid_input", "The note has control characters.");
  if ([...note].length > REVIEW_LIMITS.maxNoteChars) throw new AssuranceReviewError("invalid_input", `The note is longer than ${REVIEW_LIMITS.maxNoteChars} characters.`);
  const credentials = credentialFindings(note);
  if (credentials.length > 0) throw new AssuranceReviewError("invalid_input", `The note looks like it contains ${credentials.join(", ")}. A judgment note never holds a secret. Nothing was written.`);
  return note;
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function checkedRevision(controlId, raw, previous) {
  const bad = (why) => new AssuranceReviewError("invalid_record", `The ${controlId} review history is not valid (${why}). It was not used.`);
  if (!isRecord(raw)) throw bad("a revision is not an object");
  const basis = raw.basis;
  if (!isRecord(basis) || !Array.isArray(basis.facts) || !Array.isArray(basis.evidence)) throw bad("a basis is malformed");
  for (const ref of basis.facts) if (!isRecord(ref) || typeof ref.id !== "string" || typeof ref.revision !== "string") throw bad("a basis fact is malformed");
  for (const ref of basis.evidence) if (!isRecord(ref) || typeof ref.note_id !== "string" || typeof ref.revision !== "string") throw bad("a basis note is malformed");
  if (!JUDGMENTS.includes(raw.judgment)) throw bad("unknown judgment");
  if (raw.reviewer_role !== "owner") throw bad("the reviewer is not the owner");
  if (!isDay(raw.reviewed_on) || typeof raw.recorded_at !== "string" || typeof raw.note !== "string" || typeof raw.revision !== "string" || !REVISION.test(raw.revision)) throw bad("a field is malformed");
  if (raw.supersedes !== (previous?.revision ?? null)) throw bad("the chain of revisions is broken");
  if (previous && raw.reviewed_on < previous.reviewed_on) throw bad("dates go backwards");
  const normal = normalBasis(basis);
  const body = {
    supersedes: previous?.revision ?? null,
    judgment: raw.judgment,
    note: raw.note,
    reviewed_on: raw.reviewed_on,
    recorded_at: raw.recorded_at,
    reviewer_role: "owner",
    basis: normal,
    basis_digest: basisDigest(normal)
  };
  if (raw.basis_digest !== body.basis_digest) throw bad("a basis digest does not match");
  if (revisionId(controlId, body) !== raw.revision) throw bad("a revision hash does not match");
  return { revision: raw.revision, ...body };
}
function wrap(run) {
  try {
    return run();
  } catch (error) {
    if (error instanceof KnowledgeError) throw new AssuranceReviewError(error.code === "locked" ? "locked" : "unsafe_path", error.message);
    throw error;
  }
}
function readReviewHistory(ws, controlId) {
  assertOwnerReview();
  const file = controlFile(ws, controlId);
  const raw = wrap(() => dirUsable(ws, path.dirname(file)) ? safeRead(file, REVIEW_LIMITS.maxFileBytes) : null);
  if (!raw) return [];
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new AssuranceReviewError("invalid_record", `The ${controlId} review history is not JSON. It was not used.`);
  }
  if (!isRecord(doc) || doc.kind !== "assurance_review" || doc.schema !== REVIEW_SCHEMA || doc.control_id !== controlId || !Array.isArray(doc.revisions)) {
    throw new AssuranceReviewError("invalid_record", `The ${controlId} review history is not a ${REVIEW_SCHEMA} file. It was not used.`);
  }
  if (doc.brand_slug !== ws.brandSlug) throw new AssuranceReviewError("wrong_brand", `The ${controlId} review history belongs to another brand. It was not used.`);
  if (doc.revisions.length > REVIEW_LIMITS.maxRevisions) throw new AssuranceReviewError("invalid_record", `The ${controlId} review history has too many revisions.`);
  const out = [];
  for (const entry of doc.revisions) out.push(checkedRevision(controlId, entry, out.at(-1) ?? null));
  return out;
}
function reviewAsOf(history, day) {
  for (let index = history.length - 1; index >= 0; index -= 1) if (history[index].reviewed_on <= day) return history[index];
  return null;
}
function appendReview(ws, input) {
  assertOwnerReview();
  if (!JUDGMENTS.includes(input.judgment)) throw new AssuranceReviewError("invalid_input", "The judgment must be yes, partly or no.");
  const note = cleanNote(input.note);
  const now = ws.now();
  const today = now.toISOString().slice(0, 10);
  const reviewedOn = input.reviewed_on ?? today;
  if (!isDay(reviewedOn)) throw new AssuranceReviewError("invalid_input", "The date must be a real calendar day, YYYY-MM-DD.");
  if (reviewedOn > today) throw new AssuranceReviewError("invalid_input", "The date may not be in the future.");
  const file = controlFile(ws, input.control_id);
  const lockName = `assurance-review-${input.control_id.toLowerCase()}`;
  return wrap(
    () => withLock(ws, lockName, () => {
      const history = readReviewHistory(ws, input.control_id);
      const latest = history.at(-1) ?? null;
      if (input.expected_revision !== void 0 && input.expected_revision !== (latest?.revision ?? null)) {
        throw new AssuranceReviewError("invalid_input", "Another judgment was recorded since you looked. List again and retry.");
      }
      if (history.length >= REVIEW_LIMITS.maxRevisions) throw new AssuranceReviewError("invalid_input", "This control has too many recorded revisions.");
      if (latest && reviewedOn < latest.reviewed_on) throw new AssuranceReviewError("invalid_input", `The date may not be earlier than the last judgment (${latest.reviewed_on}).`);
      const basis = normalBasis(input.basis);
      const body = {
        supersedes: latest?.revision ?? null,
        judgment: input.judgment,
        note,
        reviewed_on: reviewedOn,
        recorded_at: now.toISOString(),
        reviewer_role: "owner",
        basis,
        basis_digest: basisDigest(basis)
      };
      const revision = { revision: revisionId(input.control_id, body), ...body };
      const doc = { kind: "assurance_review", schema: REVIEW_SCHEMA, brand_slug: ws.brandSlug, control_id: input.control_id, revisions: [...history, revision] };
      writeVaultFile(ws, file, `${JSON.stringify(doc, null, 2)}
`, true);
      return revision;
    })
  );
}

// packages/brand-core/src/assurance/links.ts
import path2 from "node:path";
var LINK_SCHEMA = "brand-os.assurance-evidence-link/1";
var LINKS_DIR = "brand/.private/assurance/evidence-links";
var LINK_LIMITS = { maxRevisions: 500, maxFileBytes: 256 * 1024 };
var LINK_ACTIONS = ["link", "unlink"];
var EVIDENCE_ID = /^ev-\d{4,6}$/;
var AssuranceLinkError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AssuranceLinkError";
  }
  code;
};
function assertOwnerLink(env = process.env) {
  if (env[AGENT_TOKEN_ENV]) {
    throw new AssuranceLinkError("refused", `Evidence links are the owner's own. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers them.`);
  }
}
var REVISION2 = /^lnk_[0-9a-f]{24}$/;
function noteFile(ws, noteId) {
  if (!NOTE_ID.test(noteId)) throw new AssuranceLinkError("invalid_input", "A research note id looks like kn_\u2026.");
  return path2.join(ws.root, ...LINKS_DIR.split("/"), `${noteId}.json`);
}
function revisionId2(noteId, body) {
  return `lnk_${sha256Hex(canonicalJson({ note_id: noteId, ...body })).slice(0, 24)}`;
}
function isRecord2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function checkedRevision2(noteId, raw, previous) {
  const bad = (why) => new AssuranceLinkError("invalid_record", `The evidence-link history of ${noteId} is not valid (${why}). It was not used.`);
  if (!isRecord2(raw)) throw bad("a revision is not an object");
  if (!LINK_ACTIONS.includes(raw.action)) throw bad("unknown action");
  if (raw.actor_role !== "owner") throw bad("the actor is not the owner");
  if (!isDay(raw.linked_on) || typeof raw.recorded_at !== "string" || typeof raw.revision !== "string" || !REVISION2.test(raw.revision)) throw bad("a field is malformed");
  if (raw.action === "link") {
    if (typeof raw.evidence_id !== "string" || !EVIDENCE_ID.test(raw.evidence_id) || typeof raw.note_revision !== "string" || raw.note_revision.length === 0 || raw.note_revision.length > 200) throw bad("a link is malformed");
  } else if (raw.evidence_id !== null || raw.note_revision !== null) throw bad("an unlink carries a link");
  if (raw.supersedes !== (previous?.revision ?? null)) throw bad("the chain of revisions is broken");
  if (previous && raw.linked_on < previous.linked_on) throw bad("dates go backwards");
  const body = {
    supersedes: previous?.revision ?? null,
    action: raw.action,
    evidence_id: raw.evidence_id,
    note_revision: raw.note_revision,
    linked_on: raw.linked_on,
    recorded_at: raw.recorded_at,
    actor_role: "owner"
  };
  if (revisionId2(noteId, body) !== raw.revision) throw bad("a revision hash does not match");
  return { revision: raw.revision, ...body };
}
function wrap2(run) {
  try {
    return run();
  } catch (error) {
    if (error instanceof KnowledgeError) throw new AssuranceLinkError(error.code === "locked" ? "locked" : "unsafe_path", error.message);
    throw error;
  }
}
function readLinkHistory(ws, noteId) {
  assertOwnerLink();
  const file = noteFile(ws, noteId);
  const raw = wrap2(() => dirUsable(ws, path2.dirname(file)) ? safeRead(file, LINK_LIMITS.maxFileBytes) : null);
  if (!raw) return [];
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new AssuranceLinkError("invalid_record", `The evidence-link history of ${noteId} is not JSON. It was not used.`);
  }
  if (!isRecord2(doc) || doc.kind !== "assurance_evidence_link" || doc.schema !== LINK_SCHEMA || doc.note_id !== noteId || !Array.isArray(doc.revisions)) {
    throw new AssuranceLinkError("invalid_record", `The evidence-link history of ${noteId} is not a ${LINK_SCHEMA} file. It was not used.`);
  }
  if (doc.brand_slug !== ws.brandSlug) throw new AssuranceLinkError("wrong_brand", `The evidence-link history of ${noteId} belongs to another brand. It was not used.`);
  if (doc.revisions.length > LINK_LIMITS.maxRevisions) throw new AssuranceLinkError("invalid_record", `The evidence-link history of ${noteId} has too many revisions.`);
  const out = [];
  for (const entry of doc.revisions) out.push(checkedRevision2(noteId, entry, out.at(-1) ?? null));
  return out;
}
function linkAsOf(history, day) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const revision = history[index];
    if (revision.linked_on <= day) return revision.action === "link" ? revision : null;
  }
  return null;
}
function linkState(link, note, entry, day) {
  if (link.note_revision !== note.revision) return "note_changed";
  if (!entry) return "entry_missing";
  if (!isIndependentSource(entry)) return "not_independent";
  if (!note.question_ids.includes(entry.claim_id)) return "claim_mismatch";
  if (entry.status === "withdrawn") return "withdrawn";
  if (entry.status === "rejected") return "rejected";
  if (entry.status !== "verified" || !entry.verified_at || entry.verified_at.slice(0, 10) > day) return "not_verified";
  if (!isCurrent(entry, /* @__PURE__ */ new Date(`${day}T00:00:00.000Z`))) return "expired";
  return "qualifies";
}
function appendLink(ws, input) {
  assertOwnerLink();
  if (!LINK_ACTIONS.includes(input.action)) throw new AssuranceLinkError("invalid_input", "The action must be link or unlink.");
  if (input.action === "link" && (typeof input.evidence_id !== "string" || !EVIDENCE_ID.test(input.evidence_id) || !input.note_revision)) {
    throw new AssuranceLinkError("invalid_input", "A link needs an evidence id like ev-0001.");
  }
  const now = ws.now();
  const today = now.toISOString().slice(0, 10);
  const linkedOn = input.linked_on ?? today;
  if (!isDay(linkedOn)) throw new AssuranceLinkError("invalid_input", "The date must be a real calendar day, YYYY-MM-DD.");
  if (linkedOn > today) throw new AssuranceLinkError("invalid_input", "The date may not be in the future.");
  const file = noteFile(ws, input.note_id);
  return wrap2(
    () => (
      // Lock names are short; a long note id is hashed into one.
      withLock(ws, `assurance-link-${sha256Hex(input.note_id).slice(0, 24)}`, () => {
        const history = readLinkHistory(ws, input.note_id);
        const latest = history.at(-1) ?? null;
        if (input.expected_revision !== void 0 && input.expected_revision !== (latest?.revision ?? null)) {
          throw new AssuranceLinkError("invalid_input", "Another link was recorded since you looked. List again and retry.");
        }
        if (input.action === "unlink" && latest?.action !== "link") throw new AssuranceLinkError("invalid_input", "This note has no link to remove.");
        if (history.length >= LINK_LIMITS.maxRevisions) throw new AssuranceLinkError("invalid_input", "This note has too many recorded link revisions.");
        if (latest && linkedOn < latest.linked_on) throw new AssuranceLinkError("invalid_input", `The date may not be earlier than the last change (${latest.linked_on}).`);
        const body = {
          supersedes: latest?.revision ?? null,
          action: input.action,
          evidence_id: input.action === "link" ? input.evidence_id : null,
          note_revision: input.action === "link" ? input.note_revision : null,
          linked_on: linkedOn,
          recorded_at: now.toISOString(),
          actor_role: "owner"
        };
        const revision = { revision: revisionId2(input.note_id, body), ...body };
        const doc = { kind: "assurance_evidence_link", schema: LINK_SCHEMA, brand_slug: ws.brandSlug, note_id: input.note_id, revisions: [...history, revision] };
        writeVaultFile(ws, file, `${JSON.stringify(doc, null, 2)}
`, true);
        return revision;
      })
    )
  );
}

// packages/brand-core/src/assurance/workspace.ts
var SNAPSHOT_SCHEMA = "brand-os.assurance-snapshot/1";
var BRIDGE_VERSION = "brand-os.assurance-bridge/4";
var WITHHELD_REVISION = "withheld";
var MAX_SNAPSHOT_BYTES = 1024 * 1024;
var AUDIENCE_RANK = { public: 0, internal: 1, restricted: 2 };
var AssuranceBridgeError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AssuranceBridgeError";
  }
  code;
};
function assertOwnerAssurance(env = process.env) {
  if (env[AGENT_TOKEN_ENV]) {
    throw new AssuranceBridgeError("refused", `Assurance on a real brand is the owner's local review. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers it.`);
  }
}
var MISSING_KINDS = ["subject_field", "fact", "evidence", "independent_evidence", "reviewer_judgment", "stale_judgment", "changed_source"];
var PAID_MEDIA_QUESTION = "business.marketing.paid_media";
function openBrand(root, now) {
  let ws;
  try {
    ws = openWorkspace(root, now ? { now } : {});
  } catch {
    throw new AssuranceBridgeError("not_a_brand", "This folder is not a Brand OS brand (brand/brand.config.yaml is missing or has no slug). Run the command from the brand repository root.");
  }
  const engine = new InterviewEngine(ws.root);
  const config = engine.config();
  const questionList = engine.questions();
  const questions = new Map(questionList.map((question) => [question.id, question]));
  let records = [];
  try {
    records = engine.ledger().records ?? [];
  } catch {
    records = [];
  }
  const answers = latestAnswers(records);
  const mascot = config.modules?.mascot?.enabled === true;
  const gamification = config.modules?.gamification?.enabled === true;
  const contradictions = findContradictions(questionList, answers, mascot, gamification).filter((entry) => entry.status === "open").map((entry) => ({ id: entry.id, fields: [...entry.fields] }));
  const notes = scanAll(ws, ["local", "shared"]).notes.filter((loaded) => {
    const meta = loaded.note.meta;
    return meta.kind === "research" && meta.classification === "internal" && meta.status !== "archived" && meta.brand_slug === ws.brandSlug;
  }).map((loaded) => ({ id: loaded.id, revision: loaded.revision, question_ids: [...loaded.note.meta.question_ids] }));
  let register;
  try {
    register = readEvidence(ws.root);
  } catch {
    throw new AssuranceBridgeError("invalid_link", "The evidence register (brand/interview/evidence-register.yaml) could not be read.");
  }
  const links = /* @__PURE__ */ new Map();
  for (const note of notes) {
    const history = linkHistoryOf(ws, note.id);
    if (history.length > 0) links.set(note.id, history);
  }
  return {
    root: ws.root,
    brandId: ws.brandSlug,
    ws,
    personProfile: config.brand?.profile === "personal-brand",
    personal: { enabled: personalConfig(config).enabled === true, facets: [...personalConfig(config).facets].sort() },
    mascot,
    gamification,
    questions,
    facts: readFacts(ws.root, "approved", ws.brandSlug),
    answers,
    contradictions,
    notes,
    register: new Map(register.map((entry) => [entry.id, entry])),
    links
  };
}
function linkHistoryOf(ws, noteId) {
  try {
    return readLinkHistory(ws, noteId);
  } catch (error) {
    if (error instanceof AssuranceLinkError) {
      if (error.code === "refused") throw new AssuranceBridgeError("refused", error.message);
      throw new AssuranceBridgeError("invalid_link", error.message);
    }
    throw error;
  }
}
function noteLink(w, noteId, day) {
  const note = w.notes.find((entry) => entry.id === noteId);
  const link = note ? linkAsOf(w.links.get(noteId) ?? [], day) : null;
  if (!note || !link) return null;
  return { link, state: linkState(link, note, w.register.get(link.evidence_id), day) };
}
function approvedFact(w, id) {
  const fact = w.facts[id];
  if (!fact || fact.status !== "approved" || fact.brand_id !== w.brandId || !fact.revision_hash) return null;
  return fact;
}
function approvedChoice(w, id) {
  const fact = approvedFact(w, id);
  if (!fact || fact.classification === "restricted") return null;
  return typeof fact.value === "string" ? fact.value : null;
}
function deriveSubject(w, paidMedia) {
  const provenance = [];
  const entity = w.personProfile ? "person" : "company";
  provenance.push({ field: "entity_kind", value: entity, source: "brand_config", question_id: null });
  let sells = "unknown";
  const motion = approvedChoice(w, "business.sales.motion");
  if (motion === "not-applicable") sells = "no";
  else if (motion && motion !== "undecided") sells = "yes";
  provenance.push({ field: "sells", value: sells, source: sells === "unknown" ? "none" : "approved_fact", question_id: sells === "unknown" ? null : "business.sales.motion" });
  let stage = "unknown";
  let stageSource = null;
  const current = approvedChoice(w, "business.stage.current");
  if (current === "established") [stage, stageSource] = ["established", "business.stage.current"];
  else if (current === "idea" || current === "pre-revenue") [stage, stageSource] = ["new", "business.stage.current"];
  else {
    const newOrExisting = approvedChoice(w, "business.identity.new_or_existing");
    if (newOrExisting === "new") [stage, stageSource] = ["new", "business.identity.new_or_existing"];
    else if (newOrExisting === "existing") [stage, stageSource] = ["established", "business.identity.new_or_existing"];
  }
  provenance.push({ field: "stage", value: stage, source: stageSource ? "approved_fact" : "none", question_id: stageSource });
  let runsPaid = "unknown";
  const answered = approvedChoice(w, PAID_MEDIA_QUESTION);
  if (answered === "yes" || answered === "no" || answered === "undecided") {
    runsPaid = answered === "undecided" ? "unknown" : answered;
    provenance.push({ field: "runs_paid_media", value: runsPaid, source: "approved_fact", question_id: PAID_MEDIA_QUESTION });
  } else {
    runsPaid = paidMedia;
    provenance.push({ field: "runs_paid_media", value: runsPaid, source: runsPaid === "unknown" ? "none" : "owner_flag", question_id: null });
  }
  return { subject: { entity_kind: entity, sells, stage, runs_paid_media: runsPaid }, provenance };
}
var SUBJECT_QUESTIONS = {
  entity_kind: { question_ids: [], flag: null },
  sells: { question_ids: ["business.sales.motion"], flag: null },
  stage: { question_ids: ["business.stage.current"], flag: null },
  runs_paid_media: { question_ids: [PAID_MEDIA_QUESTION], flag: null }
};
function presenceOf(answer) {
  if (!answer) return "absent";
  if (answer.status === "unknown") return "unknown";
  if (answer.status === "not_applicable") return "not_applicable";
  if (answer.status === "draft" || answer.status === "in_review" || answer.status === "approved") return "draft";
  return "absent";
}
function classificationOf(w, id, fact) {
  const sensitivity = w.questions.get(id)?.sensitivity;
  if (sensitivity === "restricted" || fact?.classification === "restricted") return "restricted";
  if (fact?.classification === "public" && sensitivity !== "internal") return "public";
  return "internal";
}
function resolveFact(w, id, audience, pins) {
  const fact = approvedFact(w, id);
  const classification = classificationOf(w, id, fact);
  if (classification === "restricted" && AUDIENCE_RANK[audience] < AUDIENCE_RANK.restricted) {
    return { ref: { id, revision: WITHHELD_REVISION }, state: "current", presence: "approved", classification };
  }
  const pinned = pins.get(id);
  if (pinned !== void 0) {
    const state = factState(w.ws, { id, revision: pinned }, w.facts);
    return { ref: { id, revision: pinned }, state, presence: state === "missing" ? presenceOf(w.answers.get(id)) : "approved", classification };
  }
  if (fact) return { ref: { id, revision: fact.revision_hash }, state: "current", presence: "approved", classification };
  const answer = w.answers.get(id);
  const presence = presenceOf(answer);
  if (answer && presence !== "absent") return { ref: { id, revision: `answer:${answer.answer_id}` }, state: "current", presence, classification };
  return { ref: { id, revision: "" }, state: "missing", presence: "absent", classification };
}
function resolveEvidence(w, control, pins, day) {
  if (!control.required_evidence) return [];
  const ids = /* @__PURE__ */ new Set([...control.required_question_ids, ...control.related_question_ids]);
  const pinned = pins.get(control.control_id) ?? /* @__PURE__ */ new Map();
  const out = /* @__PURE__ */ new Map();
  const add = (noteId, revision, isPinned) => {
    const ref = { ref: `knowledge:${noteId}@${revision}`, note_id: noteId, revision };
    const current = w.notes.find((entry) => entry.id === noteId);
    const linked = current && current.revision === revision ? noteLink(w, noteId, day) : null;
    const claim = linked ? w.register.get(linked.link.evidence_id)?.claim_id : void 0;
    const independent = linked?.state === "qualifies" && claim !== void 0 && ids.has(claim);
    out.set(noteId, { ref, state: isPinned ? evidenceState(w.ws, ref) : "current", independence: independent ? "independent" : "owner_stated" });
  };
  for (const note of w.notes.filter((entry) => entry.question_ids.some((id) => ids.has(id)))) add(note.id, pinned.get(note.id) ?? note.revision, pinned.has(note.id));
  for (const [noteId, revision] of pinned) if (!out.has(noteId)) add(noteId, revision, true);
  return [...out.values()].sort((a, b) => a.ref.note_id < b.ref.note_id ? -1 : 1);
}
function controlInput(w, control, audience, factPins, notePins, review, day) {
  const touched = /* @__PURE__ */ new Set([...control.required_question_ids, ...control.related_question_ids]);
  return {
    control_id: control.control_id,
    facts: control.required_question_ids.map((id) => resolveFact(w, id, audience, factPins)),
    evidence: resolveEvidence(w, control, notePins, day),
    conflicts: w.contradictions.filter((entry) => entry.fields.some((field) => touched.has(field))).map((entry) => entry.id).sort(),
    // The owner's current judgment, or null: then a judgment control stays `needs_review` and is blocking.
    review,
    maturity: null
  };
}
function reviewBasisOf(w, control, day) {
  const ids = [.../* @__PURE__ */ new Set([...control.required_question_ids, ...control.related_question_ids])].sort();
  return {
    facts: ids.map((id) => ({ id, revision: approvedFact(w, id)?.revision_hash ?? "none" })),
    // A note that counts as independent through a register link is a different basis from the same note
    // as the owner's own statement: `+<evidence id>` marks it, so linking or losing a link makes a
    // judgment stale. An unlinked note keeps its plain revision, so earlier judgments are unchanged.
    evidence: resolveEvidence(w, control, /* @__PURE__ */ new Map(), day).map((note) => {
      const linked = note.independence === "independent" ? noteLink(w, note.ref.note_id, day) : null;
      return { note_id: note.ref.note_id, revision: linked ? `${note.ref.revision}+${linked.link.evidence_id}` : note.ref.revision };
    })
  };
}
function historyOf(w, controlId) {
  try {
    return readReviewHistory(w.ws, controlId);
  } catch (error) {
    if (error instanceof AssuranceReviewError) {
      if (error.code === "refused") throw new AssuranceBridgeError("refused", error.message);
      throw new AssuranceBridgeError("invalid_review", error.message);
    }
    throw error;
  }
}
function currentJudgment(w, control, day) {
  if (control.evaluation_mode !== "reviewer_judgment") return { state: "needs_judgment", revision: null, history: [], basis: { facts: [], evidence: [] } };
  const history = historyOf(w, control.control_id);
  const basis = reviewBasisOf(w, control, day);
  const revision = reviewAsOf(history, day);
  if (!revision) return { state: "needs_judgment", revision: null, history, basis };
  return { state: revision.basis_digest === basisDigest(basis) ? "judged" : "stale", revision, history, basis };
}
function reviewOf(control, revision) {
  return {
    reviewer_id: `owner:${revision.revision}`,
    reviewer_role: "owner",
    status: JUDGMENT_STATUS[revision.judgment],
    rationale: `assurance-review:${control.control_id}@${revision.revision}`,
    reviewed_at: `${revision.reviewed_on}T00:00:00.000Z`
  };
}
function changedSince(before, now) {
  const key = (basis) => new Map([...basis.facts.map((ref) => [ref.id, ref.revision]), ...basis.evidence.map((ref) => [ref.note_id, ref.revision])]);
  const a = key(before);
  const b = key(now);
  return [.../* @__PURE__ */ new Set([...a.keys(), ...b.keys()])].filter((id) => a.get(id) !== b.get(id)).sort();
}
function listReviewItems(root, options) {
  assertOwnerAssurance();
  if (!(options.asOf instanceof Date) || Number.isNaN(options.asOf.getTime())) throw new AssuranceBridgeError("invalid_input", "as_of must be a valid date.");
  const method = methodById(options.method_id ?? POSITIONING_READINESS.method_id);
  if (!method) throw new AssuranceBridgeError("invalid_input", "No such method in the registry.");
  const w = openBrand(root);
  const day = options.asOf.toISOString().slice(0, 10);
  const items = controlsForMethod(method.method_id, DEFAULT_CATALOG).filter((control) => control.evaluation_mode === "reviewer_judgment").sort((a, b) => a.control_id < b.control_id ? -1 : 1).map((control) => {
    const judged = currentJudgment(w, control, day);
    const touched = /* @__PURE__ */ new Set([...control.required_question_ids, ...control.related_question_ids]);
    return {
      control_id: control.control_id,
      state: judged.state,
      latest: judged.revision ? { revision: judged.revision.revision, judgment: judged.revision.judgment, reviewed_on: judged.revision.reviewed_on, note: options.showNotes ? judged.revision.note : null } : null,
      revisions: judged.history.length,
      basis_now: { facts: judged.basis.facts.map((ref) => ({ id: ref.id, approved: ref.revision !== "none" })), notes: judged.basis.evidence.map((ref) => ref.note_id) },
      changed: judged.state === "stale" && judged.revision ? changedSince(judged.revision.basis, judged.basis) : [],
      conflicts: w.contradictions.filter((entry) => entry.fields.some((field) => touched.has(field))).map((entry) => entry.id).sort()
    };
  });
  return { brand_id: w.brandId, as_of: options.asOf.toISOString(), items, authorizes: [] };
}
function recordReview(root, input, opts = {}) {
  assertOwnerAssurance();
  assertOwnerReview();
  const method = methodById(input.method_id ?? POSITIONING_READINESS.method_id);
  if (!method) throw new AssuranceBridgeError("invalid_input", "No such method in the registry.");
  const control = controlsForMethod(method.method_id, DEFAULT_CATALOG).find((entry) => entry.control_id === input.control_id);
  if (!control || control.evaluation_mode !== "reviewer_judgment") {
    throw new AssuranceReviewError("not_reviewable", `${String(input.control_id)} is not a control that needs a person's judgment. Run list to see which ones do.`);
  }
  const w = openBrand(root, opts.now);
  const revision = appendReview(w.ws, {
    control_id: control.control_id,
    judgment: input.judgment,
    note: input.note,
    ...input.reviewed_on !== void 0 ? { reviewed_on: input.reviewed_on } : {},
    ...input.expected_revision !== void 0 ? { expected_revision: input.expected_revision } : {},
    basis: reviewBasisOf(w, control, w.ws.now().toISOString().slice(0, 10))
  });
  return { control_id: control.control_id, revision, authorizes: [] };
}
function listEvidenceLinks(root, options) {
  assertOwnerAssurance();
  assertOwnerLink();
  if (!(options.asOf instanceof Date) || Number.isNaN(options.asOf.getTime())) throw new AssuranceBridgeError("invalid_input", "as_of must be a valid date.");
  const method = methodById(options.method_id ?? POSITIONING_READINESS.method_id);
  if (!method) throw new AssuranceBridgeError("invalid_input", "No such method in the registry.");
  const w = openBrand(root);
  const day = options.asOf.toISOString().slice(0, 10);
  const controls = controlsForMethod(method.method_id, DEFAULT_CATALOG).filter((control) => control.required_evidence);
  const items = [...w.notes].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map((note) => {
    const linked = noteLink(w, note.id, day);
    return {
      note_id: note.id,
      revision: note.revision,
      question_ids: [...note.question_ids].sort(),
      control_ids: controls.filter((control) => [...control.required_question_ids, ...control.related_question_ids].some((id) => note.question_ids.includes(id))).map((control) => control.control_id).sort(),
      link: linked ? { evidence_id: linked.link.evidence_id, revision: linked.link.revision, linked_on: linked.link.linked_on, state: linked.state } : null,
      revisions: w.links.get(note.id)?.length ?? 0,
      candidates: [...w.register.values()].filter((entry) => entry.kind === "verification" && note.question_ids.includes(entry.claim_id)).map((entry) => ({ evidence_id: entry.id, claim_id: entry.claim_id, status: entry.status, independent_source: isIndependentSource(entry) })).sort((a, b) => a.evidence_id < b.evidence_id ? -1 : 1)
    };
  });
  return { brand_id: w.brandId, as_of: options.asOf.toISOString(), items, authorizes: [] };
}
function linkableNote(w, noteId) {
  const note = w.notes.find((entry) => entry.id === noteId);
  if (!note) throw new AssuranceLinkError("not_linkable", `${noteId} is not an internal, active research note of this brand. Run list to see which notes can be linked.`);
  return note;
}
function linkEvidence(root, input, opts = {}) {
  assertOwnerAssurance();
  assertOwnerLink();
  const w = openBrand(root, opts.now);
  const note = linkableNote(w, input.note_id);
  const entry = typeof input.evidence_id === "string" ? w.register.get(input.evidence_id) : void 0;
  if (!entry) throw new AssuranceLinkError("not_linkable", `No evidence-register entry ${String(input.evidence_id)}. Record one with brand:evidence add.`);
  if (entry.kind !== "verification") throw new AssuranceLinkError("not_linkable", `${entry.id} is a permission, not evidence for a claim.`);
  if (entry.source_type === "owner_testimony") throw new AssuranceLinkError("not_linkable", `${entry.id} is owner testimony. It never counts as independent evidence.`);
  if (entry.owned === true) throw new AssuranceLinkError("not_linkable", `${entry.id} is a source the owner controls (owner-published). It never counts as independent evidence.`);
  if (!note.question_ids.includes(entry.claim_id)) throw new AssuranceLinkError("not_linkable", `${entry.id} supports ${entry.claim_id}, which this note is not about.`);
  if (entry.status === "withdrawn" || entry.status === "rejected") throw new AssuranceLinkError("not_linkable", `${entry.id} was ${entry.status}. Record a new entry instead.`);
  const revision = appendLink(w.ws, {
    note_id: note.id,
    action: "link",
    evidence_id: entry.id,
    note_revision: note.revision,
    ...input.linked_on !== void 0 ? { linked_on: input.linked_on } : {},
    ...input.expected_revision !== void 0 ? { expected_revision: input.expected_revision } : {}
  });
  return { note_id: note.id, revision, state: linkState(revision, note, entry, w.ws.now().toISOString().slice(0, 10)), authorizes: [] };
}
function unlinkEvidence(root, input, opts = {}) {
  assertOwnerAssurance();
  assertOwnerLink();
  const w = openBrand(root, opts.now);
  const revision = appendLink(w.ws, {
    note_id: input.note_id,
    action: "unlink",
    evidence_id: null,
    note_revision: null,
    ...input.linked_on !== void 0 ? { linked_on: input.linked_on } : {},
    ...input.expected_revision !== void 0 ? { expected_revision: input.expected_revision } : {}
  });
  return { note_id: input.note_id, revision, authorizes: [] };
}
function item(kind, blocking, fields) {
  return { kind, blocking, control_id: null, field: null, question_ids: [], presence: null, flag: null, ...fields };
}
function missingOf(controls, inputs, subject, audience, stale) {
  const out = [];
  const unknownFields = /* @__PURE__ */ new Set();
  const byId = new Map(inputs.map((input) => [input.control_id, input]));
  for (const control of controls) {
    const applicability = applicabilityOf(control.applicability, subject);
    if (applicability === "not_applicable") continue;
    if (applicability === "unknown") {
      for (const condition of control.applicability.conditions) if (subject[condition.field] === "unknown") unknownFields.add(condition.field);
      continue;
    }
    const input = byId.get(control.control_id);
    if (!input) continue;
    const restricted = control.privacy_classification === "restricted" || input.facts.some((fact) => fact.classification === "restricted");
    if (restricted && AUDIENCE_RANK[audience] < AUDIENCE_RANK.restricted) continue;
    const changed = [
      ...input.facts.filter((fact) => fact.state === "changed").map((fact) => fact.ref.id),
      ...input.evidence.filter((note) => note.state === "changed").map((note) => note.ref.note_id)
    ];
    if (changed.length > 0) out.push(item("changed_source", true, { control_id: control.control_id, question_ids: input.facts.filter((fact) => fact.state === "changed").map((fact) => fact.ref.id).sort() }));
    for (const fact of input.facts) {
      if (fact.presence === "approved" && fact.state === "current") continue;
      if (fact.state === "changed") continue;
      out.push(item("fact", false, { control_id: control.control_id, question_ids: [fact.ref.id], presence: fact.presence }));
    }
    if (control.required_evidence && !input.evidence.some((note) => note.state === "current")) {
      out.push(item("evidence", false, { control_id: control.control_id, question_ids: [...control.related_question_ids, ...control.required_question_ids].sort() }));
    } else if (control.required_evidence?.independence === "independent" && !input.evidence.some((note) => note.state === "current" && note.independence === "independent")) {
      out.push(item("independent_evidence", false, { control_id: control.control_id, question_ids: [...control.related_question_ids, ...control.required_question_ids].sort() }));
    }
    if (control.evaluation_mode === "reviewer_judgment" && !input.review && changed.length === 0 && input.conflicts.length === 0) {
      out.push(item(stale.has(control.control_id) ? "stale_judgment" : "reviewer_judgment", true, { control_id: control.control_id }));
    }
  }
  for (const field of [...unknownFields].sort()) {
    const where = SUBJECT_QUESTIONS[field];
    out.push(item("subject_field", true, { field, question_ids: where.question_ids, flag: where.flag }));
  }
  const order = (entry) => `${entry.blocking ? 0 : 1}\0${MISSING_KINDS.indexOf(entry.kind)}\0${entry.control_id ?? ""}\0${entry.field ?? ""}\0${entry.question_ids.join(",")}`;
  return out.sort((a, b) => order(a) < order(b) ? -1 : order(a) > order(b) ? 1 : 0);
}
function isApprovedPin(revision) {
  return revision !== "" && revision !== WITHHELD_REVISION && !revision.startsWith("answer:");
}
function pinMaps(pins) {
  const notes = /* @__PURE__ */ new Map();
  for (const ref of pins?.evidence ?? []) {
    const forControl = notes.get(ref.control_id) ?? /* @__PURE__ */ new Map();
    forControl.set(ref.note_id, ref.revision);
    notes.set(ref.control_id, forControl);
  }
  return {
    facts: new Map((pins?.facts ?? []).filter((ref) => isApprovedPin(ref.revision)).map((ref) => [ref.id, ref.revision])),
    notes
  };
}
function buildAssuranceSnapshot(root, options) {
  assertOwnerAssurance();
  if (!(options.asOf instanceof Date) || Number.isNaN(options.asOf.getTime())) throw new AssuranceBridgeError("invalid_input", "as_of must be a valid date.");
  const audience = options.audience ?? "internal";
  if (!(audience in AUDIENCE_RANK)) throw new AssuranceBridgeError("invalid_input", "audience must be public, internal or restricted.");
  const paidMedia = options.paidMedia ?? "unknown";
  if (!["yes", "no", "unknown"].includes(paidMedia)) throw new AssuranceBridgeError("invalid_input", "paid media must be yes, no or unknown.");
  const methodId = options.method_id ?? POSITIONING_READINESS.method_id;
  const method = methodById(methodId);
  if (!method) throw new AssuranceBridgeError("invalid_input", `No method ${methodId} in the registry.`);
  const w = openBrand(root);
  if (options.pins?.brand_id !== void 0 && options.pins.brand_id !== w.brandId) throw new AssuranceBridgeError("invalid_pin", "The snapshot file belongs to a different brand.");
  if (options.pins?.method_id !== void 0 && options.pins.method_id !== method.method_id) throw new AssuranceBridgeError("invalid_pin", "The snapshot file was built for a different method.");
  const { subject, provenance } = deriveSubject(w, paidMedia);
  const controls = [...controlsForMethod(method.method_id, DEFAULT_CATALOG)].sort((a, b) => a.control_id < b.control_id ? -1 : 1);
  const pins = pinMaps(options.pins);
  const day = options.asOf.toISOString().slice(0, 10);
  const stale = /* @__PURE__ */ new Set();
  const inputs = controls.map((control) => {
    const judged = currentJudgment(w, control, day);
    if (judged.state === "stale") stale.add(control.control_id);
    return controlInput(w, control, audience, pins.facts, pins.notes, judged.state === "judged" ? reviewOf(control, judged.revision) : null, day);
  });
  const evidenceLinks = [];
  for (const note of w.notes) {
    const linked = noteLink(w, note.id, day);
    if (linked) evidenceLinks.push({ note_id: note.id, evidence_id: linked.link.evidence_id, link_revision: linked.link.revision, state: linked.state });
  }
  evidenceLinks.sort((a, b) => a.note_id < b.note_id ? -1 : a.note_id > b.note_id ? 1 : 0);
  const input = { brand_id: w.brandId, method_id: method.method_id, subject, audience, as_of: options.asOf, controls: inputs };
  const missing = missingOf(controls, inputs, subject, audience, stale);
  return {
    schema: SNAPSHOT_SCHEMA,
    bridge_version: BRIDGE_VERSION,
    brand_id: w.brandId,
    method_id: method.method_id,
    as_of: options.asOf.toISOString(),
    audience,
    paid_media_statement: paidMedia,
    subject,
    subject_provenance: provenance,
    controls: inputs,
    personal_brand: { enabled: w.personal.enabled, facets: w.personal.facets, brand_entity_kind: subject.entity_kind === "person" ? "person" : "company", changes_subject: false },
    evidence_links: evidenceLinks,
    source_snapshot_digest: sourceSnapshotDigest(input),
    complete: missing.length === 0,
    scoreable: !missing.some((entry) => entry.blocking),
    missing,
    authorizes: [],
    disclaimer: "internal_assessment_not_certification"
  };
}
function snapshotInput(snapshot) {
  return {
    brand_id: snapshot.brand_id,
    method_id: snapshot.method_id,
    subject: snapshot.subject,
    audience: snapshot.audience,
    as_of: new Date(snapshot.as_of),
    controls: snapshot.controls
  };
}
function assessWorkspace(root, options) {
  const snapshot = buildAssuranceSnapshot(root, options);
  return { snapshot, assessment: assess(snapshotInput(snapshot)), authorizes: [] };
}
function isRecord3(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
var PIN_ID = /^[A-Za-z0-9_.:-]{1,200}$/;
function parseSnapshotFile(text) {
  if (text.length > MAX_SNAPSHOT_BYTES) throw new AssuranceBridgeError("invalid_pin", "The snapshot file is too large.");
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AssuranceBridgeError("invalid_pin", "The snapshot file is not JSON.");
  }
  const doc = isRecord3(raw) && isRecord3(raw.snapshot) ? raw.snapshot : raw;
  if (!isRecord3(doc) || doc.schema !== SNAPSHOT_SCHEMA) throw new AssuranceBridgeError("invalid_pin", `The file is not a ${SNAPSHOT_SCHEMA} snapshot.`);
  const asOf = new Date(String(doc.as_of));
  const audience = doc.audience;
  const paid = doc.paid_media_statement;
  if (typeof doc.brand_id !== "string" || typeof doc.method_id !== "string" || typeof doc.source_snapshot_digest !== "string" || Number.isNaN(asOf.getTime())) {
    throw new AssuranceBridgeError("invalid_pin", "The snapshot file is missing its brand, method, digest or date.");
  }
  if (audience !== "public" && audience !== "internal" && audience !== "restricted") throw new AssuranceBridgeError("invalid_pin", "The snapshot file has no valid audience.");
  if (paid !== "yes" && paid !== "no" && paid !== "unknown") throw new AssuranceBridgeError("invalid_pin", "The snapshot file has no valid paid-media statement.");
  if (!Array.isArray(doc.controls)) throw new AssuranceBridgeError("invalid_pin", "The snapshot file has no controls.");
  const facts = [];
  const evidence = [];
  for (const control of doc.controls) {
    if (!isRecord3(control) || typeof control.control_id !== "string" || !PIN_ID.test(control.control_id)) throw new AssuranceBridgeError("invalid_pin", "A control in the snapshot file is malformed.");
    for (const fact of Array.isArray(control.facts) ? control.facts : []) {
      const ref = isRecord3(fact) && isRecord3(fact.ref) ? fact.ref : null;
      if (!ref || typeof ref.id !== "string" || typeof ref.revision !== "string" || !PIN_ID.test(ref.id) || ref.revision.length > 200) throw new AssuranceBridgeError("invalid_pin", "A fact reference in the snapshot file is malformed.");
      facts.push({ id: ref.id, revision: ref.revision });
    }
    for (const note of Array.isArray(control.evidence) ? control.evidence : []) {
      const ref = isRecord3(note) && isRecord3(note.ref) ? note.ref : null;
      if (!ref || typeof ref.note_id !== "string" || typeof ref.revision !== "string" || !PIN_ID.test(ref.note_id) || ref.revision.length > 200) throw new AssuranceBridgeError("invalid_pin", "An evidence reference in the snapshot file is malformed.");
      evidence.push({ ref: `knowledge:${ref.note_id}@${ref.revision}`, note_id: ref.note_id, revision: ref.revision, control_id: control.control_id });
    }
  }
  const links = [];
  for (const link of Array.isArray(doc.evidence_links) ? doc.evidence_links : []) {
    if (!isRecord3(link) || typeof link.note_id !== "string" || !PIN_ID.test(link.note_id) || typeof link.evidence_id !== "string" || !PIN_ID.test(link.evidence_id) || typeof link.link_revision !== "string" || !PIN_ID.test(link.link_revision) || typeof link.state !== "string" || !PIN_ID.test(link.state)) {
      throw new AssuranceBridgeError("invalid_pin", "An evidence link in the snapshot file is malformed.");
    }
    links.push({ note_id: link.note_id, evidence_id: link.evidence_id, link_revision: link.link_revision, state: link.state });
  }
  return { brand_id: doc.brand_id, method_id: doc.method_id, as_of: asOf, audience, paid_media: paid, digest: doc.source_snapshot_digest, pins: { facts, evidence, brand_id: doc.brand_id, method_id: doc.method_id }, links };
}
function verifyAssuranceSnapshot(root, text) {
  assertOwnerAssurance();
  const kept = parseSnapshotFile(text);
  const brand = openWorkspace(root).brandSlug;
  if (kept.brand_id !== brand) throw new AssuranceBridgeError("invalid_pin", "The snapshot file belongs to a different brand.");
  const fresh = buildAssuranceSnapshot(root, { asOf: kept.as_of, audience: kept.audience, paidMedia: kept.paid_media, method_id: kept.method_id });
  const pinned = buildAssuranceSnapshot(root, { asOf: kept.as_of, audience: kept.audience, paidMedia: kept.paid_media, method_id: kept.method_id, pins: kept.pins });
  const changed = /* @__PURE__ */ new Map();
  for (const control of pinned.controls) {
    for (const fact of control.facts) if (fact.state !== "current" && isApprovedPin(fact.ref.revision) && kept.pins.facts.some((ref) => ref.id === fact.ref.id && ref.revision === fact.ref.revision)) changed.set(`fact:${fact.ref.id}`, { kind: "fact", id: fact.ref.id, state: fact.state });
    for (const note of control.evidence) if (note.state !== "current") changed.set(`note:${note.ref.note_id}`, { kind: "research_note", id: note.ref.note_id, state: note.state });
  }
  const nowLinks = new Map(pinned.evidence_links.map((link) => [link.note_id, link]));
  const keptLinks = new Map(kept.links.map((link) => [link.note_id, link]));
  for (const [noteId, link] of keptLinks) {
    const now = nowLinks.get(noteId);
    if (!now) changed.set(`link:${noteId}`, { kind: "evidence_link", id: noteId, state: "missing" });
    else if (now.evidence_id !== link.evidence_id || now.link_revision !== link.link_revision || now.state !== link.state) changed.set(`link:${noteId}`, { kind: "evidence_link", id: noteId, state: "changed" });
  }
  for (const noteId of nowLinks.keys()) if (!keptLinks.has(noteId)) changed.set(`link:${noteId}`, { kind: "evidence_link", id: noteId, state: "changed" });
  return {
    reproduced: fresh.source_snapshot_digest === kept.digest,
    expected_digest: kept.digest,
    actual_digest: fresh.source_snapshot_digest,
    changed: [...changed.values()].sort((a, b) => `${a.kind}:${a.id}` < `${b.kind}:${b.id}` ? -1 : 1),
    snapshot: pinned,
    authorizes: []
  };
}

// packages/brand-core/src/assurance/workspace-text.ts
var BRIDGE_TEXT = {
  title: { en: "Assurance snapshot \u2014 owner-local", fa: "\u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u2014 \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC \u0648 \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9", tr: "G\xFCvence anl\u0131k g\xF6r\xFCnt\xFCs\xFC \u2014 yaln\u0131zca sahibin yerel ortam\u0131" },
  disclaimer: {
    en: "Internal assessment against Brand OS\u2019s own method. It is not a certification, not a compliance statement and not an independent audit.",
    fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC \u0628\u0631 \u067E\u0627\u06CC\u0647\u0654 \u0645\u062A\u062F \u062E\u0648\u062F Brand OS. \u0627\u06CC\u0646 \u06AF\u0648\u0627\u0647\u06CC\u200C\u0646\u0627\u0645\u0647\u060C \u0627\u0638\u0647\u0627\u0631\u0650 \u0627\u0646\u0637\u0628\u0627\u0642 \u06CC\u0627 \u0645\u0645\u06CC\u0632\u06CC \u0645\u0633\u062A\u0642\u0644 \u0646\u06CC\u0633\u062A.",
    tr: "Brand OS\u2019un kendi y\xF6ntemine g\xF6re i\xE7 de\u011Ferlendirme. Bir sertifika, uyumluluk beyan\u0131 veya ba\u011F\u0131ms\u0131z denetim de\u011Fildir."
  },
  brand: { en: "Brand", fa: "\u0628\u0631\u0646\u062F", tr: "Marka" },
  digest: { en: "Snapshot digest", fa: "\u0686\u06A9\u06CC\u062F\u0647\u0654 \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC", tr: "Anl\u0131k g\xF6r\xFCnt\xFC \xF6zeti" },
  bridge: { en: "Bridge version", fa: "\u0646\u0633\u062E\u0647\u0654 \u067E\u0644", tr: "K\xF6pr\xFC s\xFCr\xFCm\xFC" },
  subject: { en: "Subject", fa: "\u0645\u0648\u0636\u0648\u0639 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC", tr: "De\u011Ferlendirilen" },
  reproduce: {
    en: "Re-run with --as-of {as_of} --audience {audience}{paid} on the same workspace to get the same digest.",
    fa: "\u0628\u0631\u0627\u06CC \u06AF\u0631\u0641\u062A\u0646 \u0647\u0645\u06CC\u0646 \u0686\u06A9\u06CC\u062F\u0647\u060C \u0631\u0648\u06CC \u0647\u0645\u06CC\u0646 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631\u06CC \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627 \u200E--as-of {as_of} --audience {audience}{paid}\u200E \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "Ayn\u0131 \xF6zeti almak i\xE7in ayn\u0131 \xE7al\u0131\u015Fma alan\u0131nda --as-of {as_of} --audience {audience}{paid} ile yeniden \xE7al\u0131\u015Ft\u0131r\u0131n."
  },
  paid_media_deprecated: {
    en: "--paid-media is deprecated. Answer the interview question business.marketing.paid_media instead; the flag is used only while that question has no approved answer.",
    fa: "\u200E--paid-media\u200E \u0645\u0646\u0633\u0648\u062E \u0634\u062F\u0647 \u0627\u0633\u062A. \u0628\u0647 \u062C\u0627\u06CC \u0622\u0646 \u0628\u0647 \u067E\u0631\u0633\u0634 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 business.marketing.paid_media \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F\u061B \u0627\u06CC\u0646 \u06AF\u0632\u06CC\u0646\u0647 \u0641\u0642\u0637 \u062A\u0627 \u0648\u0642\u062A\u06CC \u0622\u0646 \u067E\u0631\u0633\u0634 \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u062F \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.",
    tr: "--paid-media kullan\u0131mdan kald\u0131r\u0131ld\u0131. Bunun yerine business.marketing.paid_media g\xF6r\xFC\u015Fme sorusunu yan\u0131tlay\u0131n; bu se\xE7enek yaln\u0131zca o sorunun onayl\u0131 yan\u0131t\u0131 yokken kullan\u0131l\u0131r."
  },
  paid_media_ignored: {
    en: "--paid-media was ignored: the approved answer to business.marketing.paid_media is used.",
    fa: "\u200E--paid-media\u200E \u0646\u0627\u062F\u06CC\u062F\u0647 \u06AF\u0631\u0641\u062A\u0647 \u0634\u062F: \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 business.marketing.paid_media \u0628\u0647 \u06A9\u0627\u0631 \u0631\u0641\u062A.",
    tr: "--paid-media yok say\u0131ld\u0131: business.marketing.paid_media sorusunun onayl\u0131 yan\u0131t\u0131 kullan\u0131ld\u0131."
  },
  paid_media_ignored_undecided: {
    en: '--paid-media was ignored: the approved interview answer to business.marketing.paid_media is "undecided", and that answer is used. Paid media stays unknown until you answer yes or no.',
    fa: "\u200E--paid-media\u200E \u0646\u0627\u062F\u06CC\u062F\u0647 \u06AF\u0631\u0641\u062A\u0647 \u0634\u062F: \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0645\u0635\u0627\u062D\u0628\u0647 \u0628\u0647 business.marketing.paid_media \xAB\u0647\u0646\u0648\u0632 \u062A\u0635\u0645\u06CC\u0645 \u0646\u06AF\u0631\u0641\u062A\u0647\u200C\u0627\u0645\xBB (undecided) \u0627\u0633\u062A \u0648 \u0647\u0645\u0627\u0646 \u067E\u0627\u0633\u062E \u0628\u0647 \u06A9\u0627\u0631 \u0631\u0641\u062A. \u062A\u0627 \u0648\u0642\u062A\u06CC \xAB\u0628\u0644\u0647\xBB \u06CC\u0627 \xAB\u0646\u0647\xBB \u067E\u0627\u0633\u062E \u0646\u062F\u0647\u06CC\u062F\u060C \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    tr: '--paid-media yok say\u0131ld\u0131: business.marketing.paid_media sorusunun onayl\u0131 g\xF6r\xFC\u015Fme yan\u0131t\u0131 "karars\u0131z" (undecided) ve bu yan\u0131t kullan\u0131ld\u0131. Evet ya da hay\u0131r yan\u0131tlayana kadar \xFCcretli medya bilinmiyor olarak kal\u0131r.'
  },
  personal_brand: {
    en: "Personal brand (personal module): tracked separately, facets {facets}. It does not change whether this brand is a company or a person.",
    fa: "\u0628\u0631\u0646\u062F \u0634\u062E\u0635\u06CC (\u0645\u0627\u0698\u0648\u0644 personal): \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0648\u062C\u0647\u200C\u0647\u0627 {facets}. \u0627\u06CC\u0646 \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F \u06A9\u0647 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0634\u0631\u06A9\u062A \u0627\u0633\u062A \u06CC\u0627 \u0634\u062E\u0635.",
    tr: "Ki\u015Fisel marka (personal mod\xFCl\xFC): ayr\u0131 izlenir, y\xF6nler {facets}. Bu markan\u0131n \u015Firket mi ki\u015Fi mi oldu\u011Funu de\u011Fi\u015Ftirmez."
  },
  no_facets: { en: "none", fa: "\u0647\u06CC\u0686", tr: "yok" },
  scoreable: {
    en: "Nothing blocking: the existing evaluator may give a completeness ratio.",
    fa: "\u0647\u06CC\u0686 \u0645\u0627\u0646\u0639\u06CC \u0646\u06CC\u0633\u062A: \u0627\u0631\u0632\u06CC\u0627\u0628 \u0645\u0648\u062C\u0648\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0646\u0633\u0628\u062A \u06A9\u0627\u0645\u0644\u200C\u0628\u0648\u062F\u0646 \u0631\u0627 \u0628\u062F\u0647\u062F.",
    tr: "Engelleyen bir \u015Fey yok: mevcut de\u011Ferlendirici bir taml\u0131k oran\u0131 verebilir."
  },
  not_scoreable: {
    en: "No score. The snapshot is incomplete; these items must be resolved first:",
    fa: "\u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0646\u0627\u0642\u0635 \u0627\u0633\u062A\u061B \u0627\u0648\u0644 \u0627\u06CC\u0646 \u0645\u0648\u0627\u0631\u062F \u0628\u0627\u06CC\u062F \u062D\u0644 \u0634\u0648\u0646\u062F:",
    tr: "Puan yok. Anl\u0131k g\xF6r\xFCnt\xFC eksik; \xF6nce \u015Funlar \xE7\xF6z\xFClmeli:"
  },
  gaps: { en: "Gaps (counted as not complete, never filled in):", fa: "\u06A9\u0645\u0628\u0648\u062F\u0647\u0627 (\u0646\u0627\u06A9\u0627\u0645\u0644 \u0634\u0645\u0631\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0647\u0631\u06AF\u0632 \u067E\u0631 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F):", tr: "Eksikler (tamamlanmam\u0131\u015F say\u0131l\u0131r, asla doldurulmaz):" },
  nothing_missing: { en: "Nothing is missing.", fa: "\u0686\u06CC\u0632\u06CC \u06A9\u0645 \u0646\u06CC\u0633\u062A.", tr: "Eksik bir \u015Fey yok." },
  authorizes: {
    en: "authorizes: [] \u2014 this snapshot approves, publishes, spends and changes nothing.",
    fa: "authorizes: [] \u2014 \u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0647\u06CC\u0686 \u0686\u06CC\u0632\u06CC \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F\u060C \u0645\u0646\u062A\u0634\u0631\u060C \u0647\u0632\u06CC\u0646\u0647 \u06CC\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "authorizes: [] \u2014 bu anl\u0131k g\xF6r\xFCnt\xFC hi\xE7bir \u015Feyi onaylamaz, yay\u0131mlamaz, harcamaz veya de\u011Fi\u015Ftirmez."
  },
  verify_title: { en: "Snapshot verification", fa: "\u0631\u0627\u0633\u062A\u06CC\u200C\u0622\u0632\u0645\u0627\u06CC\u06CC \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC", tr: "Anl\u0131k g\xF6r\xFCnt\xFC do\u011Frulamas\u0131" },
  verify_same: {
    en: "Reproduced: the workspace gives the same digest as the kept snapshot.",
    fa: "\u0628\u0627\u0632\u062A\u0648\u0644\u06CC\u062F \u0634\u062F: \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631\u06CC \u0647\u0645\u0627\u0646 \u0686\u06A9\u06CC\u062F\u0647\u0654 \u062A\u0635\u0648\u06CC\u0631 \u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0647\u200C\u0634\u062F\u0647 \u0631\u0627 \u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "Yeniden \xFCretildi: \xE7al\u0131\u015Fma alan\u0131 saklanan anl\u0131k g\xF6r\xFCnt\xFCyle ayn\u0131 \xF6zeti veriyor."
  },
  verify_diff: {
    en: "Not reproduced: the workspace changed since the snapshot was kept.",
    fa: "\u0628\u0627\u0632\u062A\u0648\u0644\u06CC\u062F \u0646\u0634\u062F: \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631\u06CC \u0627\u0632 \u0632\u0645\u0627\u0646 \u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0646 \u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Yeniden \xFCretilemedi: anl\u0131k g\xF6r\xFCnt\xFC sakland\u0131\u011F\u0131ndan beri \xE7al\u0131\u015Fma alan\u0131 de\u011Fi\u015Fti."
  },
  expected: { en: "Kept digest", fa: "\u0686\u06A9\u06CC\u062F\u0647\u0654 \u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0647", tr: "Saklanan \xF6zet" },
  actual: { en: "Digest now", fa: "\u0686\u06A9\u06CC\u062F\u0647\u0654 \u06A9\u0646\u0648\u0646\u06CC", tr: "\u015Eimdiki \xF6zet" },
  verify_unnamed: {
    en: "No cited source changed. Either something was added since (an answer approved, a research note captured, or an owner judgment recorded for this day), or the kept file was edited.",
    fa: "\u0647\u06CC\u0686 \u0645\u0646\u0628\u0639 \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647\u200C\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. \u06CC\u0627 \u0627\u0632 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0686\u06CC\u0632\u06CC \u0627\u0636\u0627\u0641\u0647 \u0634\u062F\u0647 (\u067E\u0627\u0633\u062E\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647\u060C \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC\u200C\u0627\u06CC \u062B\u0628\u062A \u0634\u062F\u0647\u060C \u06CC\u0627 \u062F\u0627\u0648\u0631\u06CC \u0645\u0627\u0644\u06A9 \u0628\u0631\u0627\u06CC \u0647\u0645\u06CC\u0646 \u0631\u0648\u0632 \u062B\u0628\u062A \u0634\u062F\u0647)\u060C \u06CC\u0627 \u0641\u0627\u06CC\u0644 \u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0647 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "At\u0131f yap\u0131lan hi\xE7bir kaynak de\u011Fi\u015Fmedi. Ya o zamandan beri bir \u015Fey eklendi (bir yan\u0131t onayland\u0131, bir ara\u015Ft\u0131rma notu eklendi veya bu g\xFCn i\xE7in sahibin karar\u0131 kaydedildi) ya da saklanan dosya d\xFCzenlendi."
  },
  changed_refs: { en: "Cited sources that changed:", fa: "\u0645\u0646\u0627\u0628\u0639 \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647\u200C\u0627\u06CC \u06A9\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647\u200C\u0627\u0646\u062F:", tr: "De\u011Fi\u015Fen kaynaklar:" },
  refused_agent: {
    en: "Assurance on a real brand is the owner\u2019s local review. Refusing while BRAND_OS_AGENT_TOKEN is set; no agent profile covers it.",
    fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0631\u0648\u06CC \u0628\u0631\u0646\u062F \u0648\u0627\u0642\u0639\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0645\u062D\u0644\u06CC \u0645\u0627\u0644\u06A9 \u0627\u0633\u062A. \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0647\u06CC\u0686 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0639\u0627\u0645\u0644\u06CC \u0622\u0646 \u0631\u0627 \u067E\u0648\u0634\u0634 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "Ger\xE7ek bir markada g\xFCvence, sahibin yerel incelemesidir. BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir; hi\xE7bir ajan profili bunu kapsamaz."
  },
  not_a_brand: {
    en: "This folder is not a Brand OS brand (brand/brand.config.yaml is missing). Run the command from the brand repository root.",
    fa: "\u0627\u06CC\u0646 \u067E\u0648\u0634\u0647 \u0628\u0631\u0646\u062F Brand OS \u0646\u06CC\u0633\u062A (brand/brand.config.yaml \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F). \u0641\u0631\u0645\u0627\u0646 \u0631\u0627 \u0627\u0632 \u0631\u06CC\u0634\u0647\u0654 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "Bu klas\xF6r bir Brand OS markas\u0131 de\u011Fil (brand/brand.config.yaml yok). Komutu marka deposunun k\xF6k\xFCnden \xE7al\u0131\u015Ft\u0131r\u0131n."
  },
  invalid_pin: {
    en: "The snapshot file could not be used: {reason}",
    fa: "\u0641\u0627\u06CC\u0644 \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0628\u0648\u062F: {reason}",
    tr: "Anl\u0131k g\xF6r\xFCnt\xFC dosyas\u0131 kullan\u0131lamad\u0131: {reason}"
  },
  evidence_links: { en: "Research notes linked to the evidence register:", fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC\u0650 \u067E\u06CC\u0648\u0646\u062F\u062E\u0648\u0631\u062F\u0647 \u0628\u0647 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F:", tr: "Kan\u0131t kayd\u0131na ba\u011Fl\u0131 ara\u015Ft\u0131rma notlar\u0131:" },
  invalid_link: {
    en: "A stored evidence link or the evidence register could not be used, so nothing was built: {reason}",
    fa: "\u06CC\u06A9 \u067E\u06CC\u0648\u0646\u062F \u0634\u0648\u0627\u0647\u062F\u0650 \u0630\u062E\u06CC\u0631\u0647\u200C\u0634\u062F\u0647 \u06CC\u0627 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0628\u0648\u062F\u060C \u067E\u0633 \u0686\u06CC\u0632\u06CC \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F: {reason}",
    tr: "Kay\u0131tl\u0131 bir kan\u0131t ba\u011Flant\u0131s\u0131 veya kan\u0131t kayd\u0131 kullan\u0131lamad\u0131, bu y\xFCzden hi\xE7bir \u015Fey olu\u015Fturulmad\u0131: {reason}"
  },
  invalid_review: {
    en: "A stored review judgment could not be used, so no snapshot was built: {reason}",
    fa: "\u06CC\u06A9 \u062F\u0627\u0648\u0631\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u0650 \u0630\u062E\u06CC\u0631\u0647\u200C\u0634\u062F\u0647 \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0628\u0648\u062F\u060C \u067E\u0633 \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F: {reason}",
    tr: "Kay\u0131tl\u0131 bir inceleme karar\u0131 kullan\u0131lamad\u0131, bu y\xFCzden anl\u0131k g\xF6r\xFCnt\xFC olu\u015Fturulmad\u0131: {reason}"
  },
  unexpected: {
    en: "Unexpected error ({name}). The bridge is read-only, so nothing about the brand changed.",
    fa: "\u062E\u0637\u0627\u06CC \u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC\u200C\u0646\u0634\u062F\u0647 ({name}). \u0627\u06CC\u0646 \u067E\u0644 \u0641\u0642\u0637\u200C\u062E\u0648\u0627\u0646\u062F\u0646\u06CC \u0627\u0633\u062A\u060C \u067E\u0633 \u0686\u06CC\u0632\u06CC \u062F\u0631 \u0628\u0631\u0646\u062F \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F.",
    tr: "Beklenmeyen hata ({name}). K\xF6pr\xFC salt okunurdur, bu y\xFCzden markada hi\xE7bir \u015Fey de\u011Fi\u015Fmedi."
  }
};
var MISSING_KIND_TEXT = {
  subject_field: { en: "Scope not stated", fa: "\u062F\u0627\u0645\u0646\u0647 \u0645\u0634\u062E\u0635 \u0646\u0634\u062F\u0647", tr: "Kapsam belirtilmedi" },
  fact: { en: "No approved fact", fa: "\u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0646\u06CC\u0633\u062A", tr: "Onayl\u0131 bilgi yok" },
  evidence: { en: "No research note", fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u0646\u06CC\u0633\u062A", tr: "Ara\u015Ft\u0131rma notu yok" },
  independent_evidence: {
    en: "Only the owner\u2019s own notes: link one to a verified evidence-register entry (brand:assurance-link)",
    fa: "\u0641\u0642\u0637 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0645\u0627\u0644\u06A9: \u06CC\u06A9\u06CC \u0631\u0627 \u0628\u0647 \u06CC\u06A9 \u0645\u062F\u0631\u06A9 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F (brand:assurance-link)",
    tr: "Yaln\u0131zca sahibin kendi notlar\u0131: birini do\u011Frulanm\u0131\u015F bir kan\u0131t kayd\u0131na ba\u011Flay\u0131n (brand:assurance-link)"
  },
  reviewer_judgment: { en: "A person must judge this control", fa: "\u06CC\u06A9 \u0627\u0646\u0633\u0627\u0646 \u0628\u0627\u06CC\u062F \u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u0631\u0627 \u062F\u0627\u0648\u0631\u06CC \u06A9\u0646\u062F", tr: "Bu kontrol\xFC bir ki\u015Fi de\u011Ferlendirmeli" },
  stale_judgment: {
    en: "The owner\u2019s judgment is out of date: what it was about changed. Judge it again (brand:assurance-review)",
    fa: "\u062F\u0627\u0648\u0631\u06CC \u0645\u0627\u0644\u06A9 \u06A9\u0647\u0646\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A: \u0686\u06CC\u0632\u06CC \u06A9\u0647 \u062F\u0631\u0628\u0627\u0631\u0647\u200C\u0627\u0634 \u0628\u0648\u062F \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647. \u062F\u0648\u0628\u0627\u0631\u0647 \u062F\u0627\u0648\u0631\u06CC \u06A9\u0646\u06CC\u062F (brand:assurance-review)",
    tr: "Sahibin karar\u0131 g\xFCncel de\u011Fil: de\u011Ferlendirdi\u011Fi \u015Fey de\u011Fi\u015Fti. Yeniden de\u011Ferlendirin (brand:assurance-review)"
  },
  changed_source: { en: "A cited source changed", fa: "\u0645\u0646\u0628\u0639 \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647", tr: "At\u0131f yap\u0131lan kaynak de\u011Fi\u015Fti" }
};
var PRESENCE_TEXT = {
  approved: { en: "approved", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "onayl\u0131" },
  draft: { en: "answered, not approved", fa: "\u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0647 \u0634\u062F\u0647\u060C \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647", tr: "yan\u0131tland\u0131, onaylanmad\u0131" },
  unknown: { en: "owner said unknown", fa: "\u0645\u0627\u0644\u06A9 \u06AF\u0641\u062A\u0647 \u0646\u0645\u06CC\u200C\u062F\u0627\u0646\u062F", tr: "sahip bilinmiyor dedi" },
  not_applicable: { en: "owner said not applicable", fa: "\u0645\u0627\u0644\u06A9 \u06AF\u0641\u062A\u0647 \u0645\u0631\u0628\u0648\u0637 \u0646\u06CC\u0633\u062A", tr: "sahip uygulanamaz dedi" },
  absent: { en: "not answered", fa: "\u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0647 \u0646\u0634\u062F\u0647", tr: "yan\u0131tlanmad\u0131" }
};
var SUBJECT_FIELD_TEXT = {
  entity_kind: { en: "Company or person", fa: "\u0634\u0631\u06A9\u062A \u06CC\u0627 \u0634\u062E\u0635", tr: "\u015Eirket veya ki\u015Fi" },
  sells: { en: "Sells something", fa: "\u0686\u06CC\u0632\u06CC \u0645\u06CC\u200C\u0641\u0631\u0648\u0634\u062F", tr: "Bir \u015Fey sat\u0131yor" },
  stage: { en: "Stage", fa: "\u0645\u0631\u062D\u0644\u0647", tr: "A\u015Fama" },
  runs_paid_media: { en: "Runs paid media", fa: "\u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC \u0627\u062C\u0631\u0627 \u0645\u06CC\u200C\u06A9\u0646\u062F", tr: "\xDCcretli medya kullan\u0131yor" }
};
var SUBJECT_SOURCE_TEXT = {
  approved_fact: { en: "from an approved fact", fa: "\u0627\u0632 \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "onayl\u0131 bir bilgiden" },
  brand_config: { en: "from brand.config.yaml", fa: "\u0627\u0632 brand.config.yaml", tr: "brand.config.yaml dosyas\u0131ndan" },
  owner_flag: {
    en: "stated on the command line with the deprecated --paid-media",
    fa: "\u0627\u0639\u0644\u0627\u0645\u200C\u0634\u062F\u0647 \u062F\u0631 \u062E\u0637 \u0641\u0631\u0645\u0627\u0646 \u0628\u0627 \u06AF\u0632\u06CC\u0646\u0647\u0654 \u0645\u0646\u0633\u0648\u062E \u200E--paid-media\u200E",
    tr: "kullan\u0131mdan kald\u0131r\u0131lan --paid-media ile komut sat\u0131r\u0131nda belirtildi"
  },
  none: { en: "not stated", fa: "\u0627\u0639\u0644\u0627\u0645 \u0646\u0634\u062F\u0647", tr: "belirtilmedi" }
};
var BRIDGE_HELP = {
  en: `brand:assurance <command> [options]   owner-local, read-only

  snapshot [--as-of YYYY-MM-DD] [--audience public|internal|restricted]
           [--pin <snapshot.json>] [--lang en|fa|tr] [--json]
                     pin the brand's approved facts, research notes and contradictions for the
                     Positioning Readiness method, and list what is missing
  assess   (same options)
                     the snapshot, then the existing gap report for it
  verify --snapshot <snapshot.json> [--lang en|fa|tr] [--json]
                     rebuild a kept snapshot from the workspace now and say whether the digest is the same

Paid media comes from the interview question business.marketing.paid_media. --paid-media yes|no is
deprecated and used only while that question has no approved answer.
Nothing is written. Print to the terminal and redirect it yourself if you want to keep a snapshot.
No score is given while anything blocking is missing. This is an internal assessment, never a
certification or a compliance statement; authorizes is always empty. Refused while BRAND_OS_AGENT_TOKEN is set.`,
  fa: `brand:assurance <command> [options]   \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC \u0648 \u0641\u0642\u0637\u200C\u062E\u0648\u0627\u0646\u062F\u0646\u06CC\u060C \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9

  snapshot [--as-of YYYY-MM-DD] [--audience public|internal|restricted]
           [--pin <snapshot.json>] [--lang en|fa|tr] [--json]
                     \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0648 \u062A\u0646\u0627\u0642\u0636\u200C\u0647\u0627\u06CC \u0628\u0631\u0646\u062F \u0631\u0627 \u0628\u0631\u0627\u06CC \u0645\u062A\u062F \xAB\u0622\u0645\u0627\u062F\u06AF\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC\xBB
                     \u0633\u0646\u062C\u0627\u0642 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0622\u0646\u0686\u0647 \u06A9\u0645 \u0627\u0633\u062A \u0631\u0627 \u0641\u0647\u0631\u0633\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F
  assess   (\u0647\u0645\u0627\u0646 \u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627)
                     \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0648 \u0633\u067E\u0633 \u06AF\u0632\u0627\u0631\u0634 \u06A9\u0645\u0628\u0648\u062F\u0647\u0627\u06CC \u0645\u0648\u062C\u0648\u062F \u0628\u0631\u0627\u06CC \u0622\u0646
  verify --snapshot <snapshot.json> [--lang en|fa|tr] [--json]
                     \u062A\u0635\u0648\u06CC\u0631 \u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0647 \u0631\u0627 \u0627\u0632 \u0641\u0636\u0627\u06CC \u06A9\u0627\u0631\u06CC \u06A9\u0646\u0648\u0646\u06CC \u062F\u0648\u0628\u0627\u0631\u0647 \u0645\u06CC\u200C\u0633\u0627\u0632\u062F \u0648 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F \u0686\u06A9\u06CC\u062F\u0647 \u0647\u0645\u0627\u0646 \u0627\u0633\u062A \u06CC\u0627 \u0646\u0647

\u0627\u062C\u0631\u0627\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC \u0627\u0632 \u067E\u0631\u0633\u0634 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 business.marketing.paid_media \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u200E--paid-media yes|no\u200E \u0645\u0646\u0633\u0648\u062E \u0627\u0633\u062A
\u0648 \u0641\u0642\u0637 \u062A\u0627 \u0648\u0642\u062A\u06CC \u0622\u0646 \u067E\u0631\u0633\u0634 \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u062F \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.
\u0686\u06CC\u0632\u06CC \u0646\u0648\u0634\u062A\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u062E\u0631\u0648\u062C\u06CC \u062F\u0631 \u062A\u0631\u0645\u06CC\u0646\u0627\u0644 \u0686\u0627\u067E \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0627\u06AF\u0631 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \u0646\u06AF\u0647\u0634 \u062F\u0627\u0631\u06CC\u062F \u062E\u0648\u062F\u062A\u0627\u0646 \u0622\u0646 \u0631\u0627 \u0647\u062F\u0627\u06CC\u062A \u06A9\u0646\u06CC\u062F.
\u062A\u0627 \u0648\u0642\u062A\u06CC \u0645\u0648\u0631\u062F\u06CC \u0645\u0627\u0646\u0639 \u06A9\u0645 \u0627\u0633\u062A\u060C \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u06CC\u0646 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC \u0627\u0633\u062A \u0648 \u0647\u0631\u06AF\u0632 \u06AF\u0648\u0627\u0647\u06CC\u200C\u0646\u0627\u0645\u0647 \u06CC\u0627 \u0627\u0638\u0647\u0627\u0631 \u0627\u0646\u0637\u0628\u0627\u0642 \u0646\u06CC\u0633\u062A\u061B
authorizes \u0647\u0645\u06CC\u0634\u0647 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A. \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.`,
  tr: `brand:assurance <command> [options]   yaln\u0131zca sahibin yerel ortam\u0131, salt okunur

  snapshot [--as-of YYYY-MM-DD] [--audience public|internal|restricted]
           [--pin <snapshot.json>] [--lang en|fa|tr] [--json]
                     markan\u0131n onayl\u0131 bilgilerini, ara\u015Ft\u0131rma notlar\u0131n\u0131 ve \xE7eli\u015Fkilerini Konumland\u0131rma Haz\u0131rl\u0131\u011F\u0131
                     y\xF6ntemi i\xE7in sabitler ve eksikleri listeler
  assess   (ayn\u0131 se\xE7enekler)
                     anl\u0131k g\xF6r\xFCnt\xFC, ard\u0131ndan onun i\xE7in mevcut eksik raporu
  verify --snapshot <snapshot.json> [--lang en|fa|tr] [--json]
                     saklanan bir anl\u0131k g\xF6r\xFCnt\xFCy\xFC \u015Fimdiki \xE7al\u0131\u015Fma alan\u0131ndan yeniden kurar ve \xF6zetin ayn\u0131 olup olmad\u0131\u011F\u0131n\u0131 s\xF6yler

\xDCcretli medya bilgisi business.marketing.paid_media g\xF6r\xFC\u015Fme sorusundan gelir. --paid-media yes|no kullan\u0131mdan
kald\u0131r\u0131ld\u0131 ve yaln\u0131zca o sorunun onayl\u0131 yan\u0131t\u0131 yokken kullan\u0131l\u0131r.
Hi\xE7bir \u015Fey yaz\u0131lmaz. \xC7\u0131kt\u0131 terminale bas\u0131l\u0131r; saklamak isterseniz kendiniz y\xF6nlendirin.
Engelleyen bir eksik varken puan verilmez. Bu bir i\xE7 de\u011Ferlendirmedir; asla sertifika veya uyumluluk beyan\u0131 de\u011Fildir;
authorizes her zaman bo\u015Ftur. BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir.`
};
function comma(lang) {
  return lang === "fa" ? "\u060C " : ", ";
}
function missingLine(entry, lang) {
  const parts = [MISSING_KIND_TEXT[entry.kind][lang]];
  if (entry.control_id) parts.push(entry.control_id);
  if (entry.field) parts.push(SUBJECT_FIELD_TEXT[entry.field][lang]);
  if (entry.question_ids.length > 0) parts.push(entry.question_ids.map((id) => `\`${id}\``).join(comma(lang)));
  if (entry.presence) parts.push(PRESENCE_TEXT[entry.presence][lang]);
  if (entry.flag) parts.push(`\`${entry.flag}\``);
  return `- ${parts.join(" \xB7 ")}`;
}
function renderSnapshotSummary(snapshot, lang) {
  const lines = [`# ${BRIDGE_TEXT.title[lang]}`, "", `> ${BRIDGE_TEXT.disclaimer[lang]}`, ""];
  lines.push(`- ${BRIDGE_TEXT.brand[lang]}: \`${snapshot.brand_id}\``);
  lines.push(`- ${BRIDGE_TEXT.bridge[lang]}: \`${snapshot.bridge_version}\``);
  lines.push(`- ${BRIDGE_TEXT.digest[lang]}: \`${snapshot.source_snapshot_digest}\``);
  const paid = snapshot.paid_media_statement === "unknown" ? "" : ` --paid-media ${snapshot.paid_media_statement}`;
  lines.push(`- ${fill(BRIDGE_TEXT.reproduce[lang], { as_of: snapshot.as_of.slice(0, 10), audience: snapshot.audience, paid })}`);
  lines.push(`- ${BRIDGE_TEXT.subject[lang]}:`);
  for (const entry of snapshot.subject_provenance) {
    lines.push(`  - ${SUBJECT_FIELD_TEXT[entry.field][lang]}: \`${entry.value}\` (${SUBJECT_SOURCE_TEXT[entry.source][lang]}${entry.question_id ? `${comma(lang)}\`${entry.question_id}\`` : ""})`);
  }
  if (snapshot.personal_brand.enabled && snapshot.personal_brand.brand_entity_kind === "company") {
    const facets = snapshot.personal_brand.facets.length > 0 ? snapshot.personal_brand.facets.map((facet) => `\`${facet}\``).join(comma(lang)) : BRIDGE_TEXT.no_facets[lang];
    lines.push(`- ${fill(BRIDGE_TEXT.personal_brand[lang], { facets })}`);
  }
  lines.push("");
  const blocking = snapshot.missing.filter((entry) => entry.blocking);
  const gaps = snapshot.missing.filter((entry) => !entry.blocking);
  if (blocking.length > 0) {
    lines.push(BRIDGE_TEXT.not_scoreable[lang]);
    for (const entry of blocking) lines.push(missingLine(entry, lang));
  } else {
    lines.push(BRIDGE_TEXT.scoreable[lang]);
  }
  lines.push("");
  if (gaps.length > 0) {
    lines.push(BRIDGE_TEXT.gaps[lang]);
    for (const entry of gaps) lines.push(missingLine(entry, lang));
  } else if (blocking.length === 0) {
    lines.push(BRIDGE_TEXT.nothing_missing[lang]);
  }
  const links = snapshot.evidence_links ?? [];
  if (links.length > 0) {
    lines.push("", BRIDGE_TEXT.evidence_links[lang]);
    for (const link of links) lines.push(`- \`${link.note_id}\` \u2192 \`${link.evidence_id}\` \xB7 ${LINK_STATE_TEXT[link.state][lang]}`);
  }
  lines.push("", `- ${BRIDGE_TEXT.authorizes[lang]}`, "");
  return lines.join("\n");
}
function renderVerifyResult(result, lang) {
  const lines = [`# ${BRIDGE_TEXT.verify_title[lang]}`, "", `> ${BRIDGE_TEXT.disclaimer[lang]}`, ""];
  lines.push(result.reproduced ? BRIDGE_TEXT.verify_same[lang] : BRIDGE_TEXT.verify_diff[lang], "");
  lines.push(`- ${BRIDGE_TEXT.expected[lang]}: \`${result.expected_digest}\``);
  lines.push(`- ${BRIDGE_TEXT.actual[lang]}: \`${result.actual_digest}\``);
  if (result.changed.length > 0) {
    lines.push("", BRIDGE_TEXT.changed_refs[lang]);
    for (const ref of result.changed) lines.push(`- \`${ref.kind}:${ref.id}\` (${ref.state})`);
  } else if (!result.reproduced) {
    lines.push("", BRIDGE_TEXT.verify_unnamed[lang]);
  }
  lines.push("", `- ${BRIDGE_TEXT.authorizes[lang]}`, "");
  return lines.join("\n");
}
var JUDGMENT_TEXT = {
  yes: { en: "yes", fa: "\u0628\u0644\u0647", tr: "evet" },
  partly: { en: "partly", fa: "\u062A\u0627 \u062D\u062F\u06CC", tr: "k\u0131smen" },
  no: { en: "no", fa: "\u062E\u06CC\u0631", tr: "hay\u0131r" }
};
var JUDGMENT_STATE_TEXT = {
  needs_judgment: { en: "Needs your judgment", fa: "\u0628\u0647 \u062F\u0627\u0648\u0631\u06CC \u0634\u0645\u0627 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F", tr: "Karar\u0131n\u0131z\u0131 bekliyor" },
  judged: { en: "Judged, still current", fa: "\u062F\u0627\u0648\u0631\u06CC \u0634\u062F\u0647 \u0648 \u0647\u0646\u0648\u0632 \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", tr: "De\u011Ferlendirildi, h\xE2l\xE2 ge\xE7erli" },
  stale: { en: "Judged, but out of date: judge it again", fa: "\u062F\u0627\u0648\u0631\u06CC \u0634\u062F\u0647 \u0627\u0645\u0627 \u06A9\u0647\u0646\u0647 \u0627\u0633\u062A: \u062F\u0648\u0628\u0627\u0631\u0647 \u062F\u0627\u0648\u0631\u06CC \u06A9\u0646\u06CC\u062F", tr: "De\u011Ferlendirildi ama g\xFCncel de\u011Fil: yeniden de\u011Ferlendirin" }
};
var REVIEW_PROMPT = {
  "PRR-08": {
    en: "Is the differentiation claim actually backed by the cited evidence? Answer yes, partly or no, with a short note.",
    fa: "\u0622\u06CC\u0627 \u0627\u062F\u0639\u0627\u06CC \u062A\u0645\u0627\u06CC\u0632 \u0648\u0627\u0642\u0639\u0627\u064B \u0628\u0627 \u0634\u0648\u0627\u0647\u062F \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F\u061F \u0628\u0627 \u0628\u0644\u0647\u060C \u062A\u0627 \u062D\u062F\u06CC \u06CC\u0627 \u062E\u06CC\u0631 \u0648 \u06CC\u06A9 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u06A9\u0648\u062A\u0627\u0647 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F.",
    tr: "Farkl\u0131la\u015Fma iddias\u0131 at\u0131f yap\u0131lan kan\u0131tlarla ger\xE7ekten destekleniyor mu? Evet, k\u0131smen veya hay\u0131r diye ve k\u0131sa bir notla yan\u0131tlay\u0131n."
  }
};
var REVIEW_TEXT = {
  title: { en: "Owner review judgments \u2014 owner-local", fa: "\u062F\u0627\u0648\u0631\u06CC\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0645\u0627\u0644\u06A9 \u2014 \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC", tr: "Sahip inceleme kararlar\u0131 \u2014 yaln\u0131zca yerel" },
  intro: {
    en: "These controls need a person\u2019s judgment. Until each has a current one, the assessment gives no score.",
    fa: "\u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644\u200C\u0647\u0627 \u0628\u0647 \u062F\u0627\u0648\u0631\u06CC \u06CC\u06A9 \u0627\u0646\u0633\u0627\u0646 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u0646\u062F. \u062A\u0627 \u0648\u0642\u062A\u06CC \u0647\u0631 \u06A9\u062F\u0627\u0645 \u062F\u0627\u0648\u0631\u06CC \u0645\u0639\u062A\u0628\u0631 \u0646\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F\u060C \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "Bu kontroller bir ki\u015Finin karar\u0131n\u0131 gerektirir. Her birinin ge\xE7erli bir karar\u0131 olana kadar de\u011Ferlendirme puan vermez."
  },
  none: { en: "No control under this method needs a person\u2019s judgment.", fa: "\u0647\u06CC\u0686 \u06A9\u0646\u062A\u0631\u0644\u06CC \u062F\u0631 \u0627\u06CC\u0646 \u0645\u062A\u062F \u0628\u0647 \u062F\u0627\u0648\u0631\u06CC \u0627\u0646\u0633\u0627\u0646 \u0646\u06CC\u0627\u0632 \u0646\u062F\u0627\u0631\u062F.", tr: "Bu y\xF6ntemde bir ki\u015Finin karar\u0131n\u0131 gerektiren kontrol yok." },
  question: { en: "Question", fa: "\u067E\u0631\u0633\u0634", tr: "Soru" },
  state: { en: "State", fa: "\u0648\u0636\u0639\u06CC\u062A", tr: "Durum" },
  latest: { en: "Judgment in force", fa: "\u062F\u0627\u0648\u0631\u06CC \u062C\u0627\u0631\u06CC", tr: "Ge\xE7erli karar" },
  note: { en: "Your note", fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0634\u0645\u0627", tr: "Notunuz" },
  revisions: { en: "Recorded revisions", fa: "\u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647", tr: "Kay\u0131tl\u0131 s\xFCr\xFCmler" },
  facts_now: { en: "Facts it is about", fa: "\u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u062F\u0631\u0628\u0627\u0631\u0647\u200C\u0634\u0627\u0646 \u0627\u0633\u062A", tr: "\u0130lgili bilgiler" },
  notes_now: { en: "Research notes it is about", fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0645\u0631\u0628\u0648\u0637", tr: "\u0130lgili ara\u015Ft\u0131rma notlar\u0131" },
  no_notes: { en: "none yet (capture one with brand:knowledge)", fa: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 (\u0628\u0627 brand:knowledge \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F)", tr: "hen\xFCz yok (brand:knowledge ile ekleyin)" },
  approved: { en: "approved", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "onayl\u0131" },
  not_approved: { en: "not approved", fa: "\u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647", tr: "onaylanmad\u0131" },
  owner_stated: {
    en: "Research notes count as the owner\u2019s own statements, not independent evidence, unless linked to a verified evidence-register entry (brand:assurance-link).",
    fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9 \u0634\u0645\u0631\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u060C \u0646\u0647 \u0634\u0648\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644\u061B \u0645\u06AF\u0631 \u0627\u06CC\u0646\u06A9\u0647 \u0628\u0647 \u06CC\u06A9 \u0645\u062F\u0631\u06A9 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u067E\u06CC\u0648\u0646\u062F \u062E\u0648\u0631\u062F\u0647 \u0628\u0627\u0634\u0646\u062F (brand:assurance-link).",
    tr: "Ara\u015Ft\u0131rma notlar\u0131, do\u011Frulanm\u0131\u015F bir kan\u0131t kayd\u0131na ba\u011Flanmad\u0131k\xE7a (brand:assurance-link) ba\u011F\u0131ms\u0131z kan\u0131t de\u011Fil, sahibin kendi beyan\u0131 say\u0131l\u0131r."
  },
  changed: { en: "Changed since the judgment", fa: "\u062A\u063A\u06CC\u06CC\u0631\u06A9\u0631\u062F\u0647 \u0627\u0632 \u0632\u0645\u0627\u0646 \u062F\u0627\u0648\u0631\u06CC", tr: "Karardan beri de\u011Fi\u015Fenler" },
  conflicts: {
    en: "Open contradictions (reported before any judgment)",
    fa: "\u062A\u0646\u0627\u0642\u0636\u200C\u0647\u0627\u06CC \u0628\u0627\u0632 (\u067E\u06CC\u0634 \u0627\u0632 \u0647\u0631 \u062F\u0627\u0648\u0631\u06CC \u06AF\u0632\u0627\u0631\u0634 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F)",
    tr: "A\xE7\u0131k \xE7eli\u015Fkiler (her karardan \xF6nce raporlan\u0131r)"
  },
  how: {
    en: 'Record one: npm run brand:assurance-review -- record --control {control} --judgment yes|partly|no --note "\u2026" [--date YYYY-MM-DD]',
    fa: '\u062B\u0628\u062A \u062F\u0627\u0648\u0631\u06CC: \u200Enpm run brand:assurance-review -- record --control {control} --judgment yes|partly|no --note "\u2026" [--date YYYY-MM-DD]\u200E',
    tr: 'Kaydetmek i\xE7in: npm run brand:assurance-review -- record --control {control} --judgment yes|partly|no --note "\u2026" [--date YYYY-MM-DD]'
  },
  recorded: {
    en: "Recorded {control}: {judgment} on {date} (revision {revision}). Run brand:assurance assess to see the result.",
    fa: "\u0628\u0631\u0627\u06CC {control} \u062B\u0628\u062A \u0634\u062F: {judgment} \u062F\u0631 {date} (\u0646\u0633\u062E\u0647\u0654 {revision}). \u0628\u0631\u0627\u06CC \u062F\u06CC\u062F\u0646 \u0646\u062A\u06CC\u062C\u0647 brand:assurance assess \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "{control} kaydedildi: {date} tarihinde {judgment} (s\xFCr\xFCm {revision}). Sonucu g\xF6rmek i\xE7in brand:assurance assess \xE7al\u0131\u015Ft\u0131r\u0131n."
  },
  stored: {
    en: "Stored privately in brand/.private/assurance/reviews/ (gitignored, never read by agents, Studio or docs).",
    fa: "\u0628\u0647\u200C\u0637\u0648\u0631 \u062E\u0635\u0648\u0635\u06CC \u062F\u0631 brand/.private/assurance/reviews/ \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F (\u062F\u0631 git \u0646\u06CC\u0633\u062A \u0648 \u0639\u0627\u0645\u0644\u200C\u0647\u0627\u060C Studio \u0648 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u0646\u062F).",
    tr: "brand/.private/assurance/reviews/ i\xE7inde gizli olarak sakland\u0131 (git d\u0131\u015F\u0131nda; ajanlar, Studio ve belgeler okumaz)."
  },
  refused_agent: {
    en: "Review judgments are the owner\u2019s own. Refusing while BRAND_OS_AGENT_TOKEN is set; no agent profile covers them.",
    fa: "\u062F\u0627\u0648\u0631\u06CC\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0641\u0642\u0637 \u0645\u0627\u0644 \u0645\u0627\u0644\u06A9 \u0627\u0633\u062A. \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0647\u06CC\u0686 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0639\u0627\u0645\u0644\u06CC \u0622\u0646 \u0631\u0627 \u067E\u0648\u0634\u0634 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "\u0130nceleme kararlar\u0131 yaln\u0131zca sahibe aittir. BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir; hi\xE7bir ajan profili bunu kapsamaz."
  },
  rejected: { en: "Not recorded: {reason}", fa: "\u062B\u0628\u062A \u0646\u0634\u062F: {reason}", tr: "Kaydedilmedi: {reason}" },
  unexpected: {
    en: "Unexpected error ({name}). A judgment is written in one atomic step: either it was recorded in full or not at all. Run list to check.",
    fa: "\u062E\u0637\u0627\u06CC \u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC\u200C\u0646\u0634\u062F\u0647 ({name}). \u062F\u0627\u0648\u0631\u06CC \u062F\u0631 \u06CC\u06A9 \u06AF\u0627\u0645 \u0627\u062A\u0645\u06CC \u0646\u0648\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F: \u06CC\u0627 \u06A9\u0627\u0645\u0644 \u062B\u0628\u062A \u0634\u062F\u0647 \u06CC\u0627 \u0627\u0635\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0634\u062F\u0647. \u0628\u0631\u0627\u06CC \u0627\u0637\u0645\u06CC\u0646\u0627\u0646 list \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "Beklenmeyen hata ({name}). Bir karar tek bir atomik ad\u0131mda yaz\u0131l\u0131r: ya tamamen kaydedildi ya da hi\xE7 kaydedilmedi. Kontrol i\xE7in list \xE7al\u0131\u015Ft\u0131r\u0131n."
  }
};
var REVIEW_HELP = {
  en: `brand:assurance-review <command> [options]   owner-local; refused while BRAND_OS_AGENT_TOKEN is set

  list   [--as-of YYYY-MM-DD] [--show-notes] [--lang en|fa|tr] [--json]
                     the controls that need a person's judgment, and where each stands
  record --control <id> --judgment yes|partly|no --note "<short reason>" [--date YYYY-MM-DD]
         [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     record your judgment; it is about the facts and research notes cited now,
                     and goes out of date by itself when any of them changes

Judgments are versioned in brand/.private/assurance/reviews/ (gitignored). A new judgment adds a
revision; nothing is overwritten. The note stays there and never appears in a snapshot.
This is an internal assessment, never a certification or a compliance statement; authorizes is always empty.`,
  fa: `brand:assurance-review <command> [options]   \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9\u061B \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F

  list   [--as-of YYYY-MM-DD] [--show-notes] [--lang en|fa|tr] [--json]
                     \u06A9\u0646\u062A\u0631\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0647 \u062F\u0627\u0648\u0631\u06CC \u0627\u0646\u0633\u0627\u0646 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u0646\u062F \u0648 \u0648\u0636\u0639\u06CC\u062A \u0647\u0631 \u06A9\u062F\u0627\u0645
  record --control <id> --judgment yes|partly|no --note "<\u062F\u0644\u06CC\u0644 \u06A9\u0648\u062A\u0627\u0647>" [--date YYYY-MM-DD]
         [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     \u062F\u0627\u0648\u0631\u06CC \u062E\u0648\u062F \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F\u061B \u062F\u0627\u0648\u0631\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627 \u0648 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC\u0650 \u06A9\u0646\u0648\u0646\u06CC \u0627\u0633\u062A
                     \u0648 \u0628\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0647\u0631 \u06A9\u062F\u0627\u0645 \u062E\u0648\u062F\u0628\u0647\u200C\u062E\u0648\u062F \u06A9\u0647\u0646\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F

\u062F\u0627\u0648\u0631\u06CC\u200C\u0647\u0627 \u0628\u0627 \u0646\u0633\u062E\u0647 \u062F\u0631 brand/.private/assurance/reviews/ \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F (\u0628\u06CC\u0631\u0648\u0646 \u0627\u0632 git). \u0647\u0631 \u062F\u0627\u0648\u0631\u06CC \u062A\u0627\u0632\u0647 \u06CC\u06A9 \u0646\u0633\u062E\u0647
\u0627\u0636\u0627\u0641\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0686\u06CC\u0632\u06CC \u0628\u0627\u0632\u0646\u0648\u06CC\u0633\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0647\u0645\u0627\u0646\u200C\u062C\u0627 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F \u0648 \u0647\u0631\u06AF\u0632 \u062F\u0631 \u062A\u0635\u0648\u06CC\u0631 \u0644\u062D\u0638\u0647\u200C\u0627\u06CC \u0646\u0645\u06CC\u200C\u0622\u06CC\u062F.
\u0627\u06CC\u0646 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC \u0627\u0633\u062A \u0648 \u0647\u0631\u06AF\u0632 \u06AF\u0648\u0627\u0647\u06CC\u200C\u0646\u0627\u0645\u0647 \u06CC\u0627 \u0627\u0638\u0647\u0627\u0631 \u0627\u0646\u0637\u0628\u0627\u0642 \u0646\u06CC\u0633\u062A\u061B authorizes \u0647\u0645\u06CC\u0634\u0647 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A.`,
  tr: `brand:assurance-review <command> [options]   yaln\u0131zca sahibin yerel ortam\u0131; BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir

  list   [--as-of YYYY-MM-DD] [--show-notes] [--lang en|fa|tr] [--json]
                     bir ki\u015Finin karar\u0131n\u0131 gerektiren kontroller ve her birinin durumu
  record --control <id> --judgment yes|partly|no --note "<k\u0131sa gerek\xE7e>" [--date YYYY-MM-DD]
         [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     karar\u0131n\u0131z\u0131 kaydedin; karar \u015Fu an at\u0131f yap\u0131lan bilgiler ve ara\u015Ft\u0131rma notlar\u0131 hakk\u0131ndad\u0131r
                     ve bunlardan biri de\u011Fi\u015Fince kendili\u011Finden g\xFCncelli\u011Fini yitirir

Kararlar brand/.private/assurance/reviews/ i\xE7inde s\xFCr\xFCml\xFC tutulur (git d\u0131\u015F\u0131nda). Yeni karar bir s\xFCr\xFCm
ekler; hi\xE7bir \u015Feyin \xFCzerine yaz\u0131lmaz. Not orada kal\u0131r ve hi\xE7bir anl\u0131k g\xF6r\xFCnt\xFCde g\xF6r\xFCnmez.
Bu bir i\xE7 de\u011Ferlendirmedir; asla sertifika veya uyumluluk beyan\u0131 de\u011Fildir; authorizes her zaman bo\u015Ftur.`
};
function renderReviewList(result, lang) {
  const lines = [`# ${REVIEW_TEXT.title[lang]}`, "", `> ${BRIDGE_TEXT.disclaimer[lang]}`, "", `- ${BRIDGE_TEXT.brand[lang]}: \`${result.brand_id}\``, ""];
  if (result.items.length === 0) {
    lines.push(REVIEW_TEXT.none[lang], "");
    return lines.join("\n");
  }
  lines.push(REVIEW_TEXT.intro[lang], "");
  for (const entry of result.items) {
    const label = CONTROL_TEXT[entry.control_id]?.label[lang] ?? entry.control_id;
    lines.push(`## ${entry.control_id} \u2014 ${label}`, "");
    lines.push(`- ${REVIEW_TEXT.question[lang]}: ${REVIEW_PROMPT[entry.control_id]?.[lang] ?? CONTROL_TEXT[entry.control_id]?.intent[lang] ?? ""}`);
    lines.push(`- ${REVIEW_TEXT.state[lang]}: **${JUDGMENT_STATE_TEXT[entry.state][lang]}**`);
    if (entry.latest) {
      lines.push(`- ${REVIEW_TEXT.latest[lang]}: ${JUDGMENT_TEXT[entry.latest.judgment][lang]} \xB7 ${entry.latest.reviewed_on} \xB7 \`${entry.latest.revision}\``);
      if (entry.latest.note !== null) lines.push(`- ${REVIEW_TEXT.note[lang]}: ${entry.latest.note}`);
    }
    lines.push(`- ${REVIEW_TEXT.revisions[lang]}: ${entry.revisions}`);
    lines.push(`- ${REVIEW_TEXT.facts_now[lang]}: ${entry.basis_now.facts.map((fact) => `\`${fact.id}\` (${fact.approved ? REVIEW_TEXT.approved[lang] : REVIEW_TEXT.not_approved[lang]})`).join(comma(lang)) || "\u2014"}`);
    lines.push(`- ${REVIEW_TEXT.notes_now[lang]}: ${entry.basis_now.notes.map((id) => `\`${id}\``).join(comma(lang)) || REVIEW_TEXT.no_notes[lang]}`);
    if (entry.changed.length > 0) lines.push(`- ${REVIEW_TEXT.changed[lang]}: ${entry.changed.map((id) => `\`${id}\``).join(comma(lang))}`);
    if (entry.conflicts.length > 0) lines.push(`- ${REVIEW_TEXT.conflicts[lang]}: ${entry.conflicts.map((id) => `\`${id}\``).join(comma(lang))}`);
    lines.push(`- ${fill(REVIEW_TEXT.how[lang], { control: entry.control_id })}`, "");
  }
  lines.push(`> ${REVIEW_TEXT.owner_stated[lang]}`, "", `- ${BRIDGE_TEXT.authorizes[lang]}`, "");
  return lines.join("\n");
}
function renderRecorded(result, lang) {
  return [
    fill(REVIEW_TEXT.recorded[lang], {
      control: result.control_id,
      judgment: JUDGMENT_TEXT[result.revision.judgment][lang],
      date: result.revision.reviewed_on,
      revision: result.revision.revision
    }),
    REVIEW_TEXT.stored[lang],
    BRIDGE_TEXT.disclaimer[lang],
    ""
  ].join("\n");
}
var LINK_STATE_TEXT = {
  qualifies: { en: "counts as independent evidence", fa: "\u0634\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u062D\u0633\u0627\u0628 \u0645\u06CC\u200C\u0634\u0648\u062F", tr: "ba\u011F\u0131ms\u0131z kan\u0131t say\u0131l\u0131r" },
  note_changed: {
    en: "does not count: the note changed since it was linked; link it again",
    fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0633 \u0627\u0632 \u067E\u06CC\u0648\u0646\u062F \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647\u061B \u062F\u0648\u0628\u0627\u0631\u0647 \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F",
    tr: "say\u0131lmaz: not ba\u011Fland\u0131ktan sonra de\u011Fi\u015Fti; yeniden ba\u011Flay\u0131n"
  },
  entry_missing: { en: "does not count: the register entry is gone", fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0645\u062F\u0631\u06A9 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u062F\u06CC\u06AF\u0631 \u0646\u06CC\u0633\u062A", tr: "say\u0131lmaz: kay\u0131t art\u0131k yok" },
  not_independent: {
    en: "does not count: owner testimony or a permission is never independent evidence",
    fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9 \u06CC\u0627 \u06CC\u06A9 \u0645\u062C\u0648\u0632 \u0647\u0631\u06AF\u0632 \u0634\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u0646\u06CC\u0633\u062A",
    tr: "say\u0131lmaz: sahibin beyan\u0131 veya bir izin asla ba\u011F\u0131ms\u0131z kan\u0131t de\u011Fildir"
  },
  claim_mismatch: {
    en: "does not count: the entry supports a question this note is not about",
    fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0627\u06CC\u0646 \u0645\u062F\u0631\u06A9 \u067E\u0634\u062A\u0648\u0627\u0646\u0647\u0654 \u067E\u0631\u0633\u0634\u06CC \u0627\u0633\u062A \u06A9\u0647 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0622\u0646 \u0646\u06CC\u0633\u062A",
    tr: "say\u0131lmaz: kay\u0131t bu notun ilgili olmad\u0131\u011F\u0131 bir soruyu destekliyor"
  },
  not_verified: {
    en: "does not count yet: the owner has not verified the entry (brand:evidence verify)",
    fa: "\u0647\u0646\u0648\u0632 \u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0645\u0627\u0644\u06A9 \u0627\u06CC\u0646 \u0645\u062F\u0631\u06A9 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A (brand:evidence verify)",
    tr: "hen\xFCz say\u0131lmaz: sahip kayd\u0131 do\u011Frulamad\u0131 (brand:evidence verify)"
  },
  expired: { en: "does not count: past its review date; add a new entry with a later review date, verify it and link the note to it", fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u062A\u0627\u0631\u06CC\u062E \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0627\u0634 \u06AF\u0630\u0634\u062A\u0647\u061B \u06CC\u06A9 \u0645\u0648\u0631\u062F \u062A\u0627\u0632\u0647 \u0628\u0627 \u062A\u0627\u0631\u06CC\u062E \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u06CC\u0631\u062A\u0631 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F\u060C \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F \u0648 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0631\u0627 \u0628\u0647 \u0622\u0646 \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F", tr: "say\u0131lmaz: inceleme tarihi ge\xE7ti; daha ge\xE7 inceleme tarihli yeni bir kay\u0131t ekleyin, do\u011Frulay\u0131n ve notu ona ba\u011Flay\u0131n" },
  withdrawn: { en: "does not count: the entry was withdrawn", fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0645\u062F\u0631\u06A9 \u067E\u0633 \u06AF\u0631\u0641\u062A\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A", tr: "say\u0131lmaz: kay\u0131t geri \xE7ekildi" },
  rejected: { en: "does not count: the owner rejected the entry", fa: "\u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0645\u0627\u0644\u06A9 \u0627\u06CC\u0646 \u0645\u062F\u0631\u06A9 \u0631\u0627 \u0631\u062F \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A", tr: "say\u0131lmaz: sahip kayd\u0131 reddetti" }
};
var EVIDENCE_STATUS_TEXT = {
  pending: { en: "pending", fa: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F", tr: "onay bekliyor" },
  verified: { en: "verified", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "do\u011Fruland\u0131" },
  rejected: { en: "rejected", fa: "\u0631\u062F\u0634\u062F\u0647", tr: "reddedildi" },
  withdrawn: { en: "withdrawn", fa: "\u067E\u0633\u200C\u06AF\u0631\u0641\u062A\u0647\u200C\u0634\u062F\u0647", tr: "geri \xE7ekildi" }
};
var LINK_TEXT = {
  title: { en: "Evidence links for research notes \u2014 owner-local", fa: "\u067E\u06CC\u0648\u0646\u062F \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0628\u0647 \u0634\u0648\u0627\u0647\u062F \u2014 \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC", tr: "Ara\u015Ft\u0131rma notlar\u0131 i\xE7in kan\u0131t ba\u011Flant\u0131lar\u0131 \u2014 yaln\u0131zca yerel" },
  intro: {
    en: "A research note is your own statement. Link it to a verified entry in the evidence register and the assessment counts it as independent evidence while that entry stays verified and current.",
    fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0634\u0645\u0627\u0633\u062A. \u0622\u0646 \u0631\u0627 \u0628\u0647 \u06CC\u06A9 \u0645\u062F\u0631\u06A9 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F \u062A\u0627 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC\u060C \u062A\u0627 \u0648\u0642\u062A\u06CC \u0622\u0646 \u0645\u062F\u0631\u06A9 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A\u060C \u0622\u0646 \u0631\u0627 \u0634\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u062D\u0633\u0627\u0628 \u06A9\u0646\u062F.",
    tr: "Bir ara\u015Ft\u0131rma notu sizin kendi beyan\u0131n\u0131zd\u0131r. Onu kan\u0131t kayd\u0131ndaki do\u011Frulanm\u0131\u015F bir giri\u015Fe ba\u011Flay\u0131n; o giri\u015F do\u011Frulanm\u0131\u015F ve g\xFCncel kald\u0131k\xE7a de\u011Ferlendirme onu ba\u011F\u0131ms\u0131z kan\u0131t sayar."
  },
  none: { en: "This brand has no internal research notes yet (capture one with brand:knowledge).", fa: "\u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0647\u0646\u0648\u0632 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u062F\u0627\u062E\u0644\u06CC \u0646\u062F\u0627\u0631\u062F (\u0628\u0627 brand:knowledge \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F).", tr: "Bu markan\u0131n hen\xFCz i\xE7 ara\u015Ft\u0131rma notu yok (brand:knowledge ile ekleyin)." },
  questions: { en: "About", fa: "\u062F\u0631\u0628\u0627\u0631\u0647\u0654", tr: "Konu" },
  controls: { en: "Cited by", fa: "\u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647 \u062F\u0631", tr: "At\u0131f yapan" },
  link: { en: "Link in force", fa: "\u067E\u06CC\u0648\u0646\u062F \u062C\u0627\u0631\u06CC", tr: "Ge\xE7erli ba\u011Flant\u0131" },
  no_link: { en: "not linked: counts as your own statement", fa: "\u067E\u06CC\u0648\u0646\u062F \u0646\u062F\u0627\u0631\u062F: \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0634\u0645\u0627 \u062D\u0633\u0627\u0628 \u0645\u06CC\u200C\u0634\u0648\u062F", tr: "ba\u011Fl\u0131 de\u011Fil: sizin beyan\u0131n\u0131z say\u0131l\u0131r" },
  revisions: { en: "Recorded revisions", fa: "\u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647", tr: "Kay\u0131tl\u0131 s\xFCr\xFCmler" },
  candidates: { en: "Register entries for these questions", fa: "\u0645\u062F\u0627\u0631\u06A9 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u067E\u0631\u0633\u0634\u200C\u0647\u0627", tr: "Bu sorular i\xE7in kan\u0131t kay\u0131tlar\u0131" },
  no_candidates: {
    en: "none (record one with brand:evidence add, then verify it)",
    fa: "\u0647\u06CC\u0686 (\u0628\u0627 brand:evidence add \u062B\u0628\u062A \u0648 \u0633\u067E\u0633 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F)",
    tr: "yok (brand:evidence add ile ekleyip do\u011Frulay\u0131n)"
  },
  testimony: { en: "owner testimony, cannot count", fa: "\u06AF\u0641\u062A\u0647\u0654 \u0645\u0627\u0644\u06A9\u060C \u062D\u0633\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F", tr: "sahip beyan\u0131, say\u0131lamaz" },
  how: {
    en: "Link: npm run brand:assurance-link -- link --note {note} --evidence ev-NNNN [--date YYYY-MM-DD]",
    fa: "\u067E\u06CC\u0648\u0646\u062F: \u200Enpm run brand:assurance-link -- link --note {note} --evidence ev-NNNN [--date YYYY-MM-DD]\u200E",
    tr: "Ba\u011Flamak i\xE7in: npm run brand:assurance-link -- link --note {note} --evidence ev-NNNN [--date YYYY-MM-DD]"
  },
  unconfirmed: {
    en: "Unapproved answers still lower the score and are not removed. A link changes only whether a note counts as independent.",
    fa: "\u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647 \u0647\u0645\u0686\u0646\u0627\u0646 \u0627\u0645\u062A\u06CC\u0627\u0632 \u0631\u0627 \u067E\u0627\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u0622\u0648\u0631\u0646\u062F \u0648 \u062D\u0630\u0641 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u067E\u06CC\u0648\u0646\u062F \u0641\u0642\u0637 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F \u06A9\u0647 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0634\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u062D\u0633\u0627\u0628 \u0634\u0648\u062F \u06CC\u0627 \u0646\u0647.",
    tr: "Onaylanmam\u0131\u015F yan\u0131tlar puan\u0131 d\xFC\u015F\xFCrmeye devam eder ve kald\u0131r\u0131lmaz. Bir ba\u011Flant\u0131 yaln\u0131zca notun ba\u011F\u0131ms\u0131z kan\u0131t say\u0131l\u0131p say\u0131lmad\u0131\u011F\u0131n\u0131 de\u011Fi\u015Ftirir."
  },
  linked: {
    en: "Linked {note} to {evidence} on {date} (revision {revision}): {state}.",
    fa: "{note} \u062F\u0631 {date} \u0628\u0647 {evidence} \u067E\u06CC\u0648\u0646\u062F \u062E\u0648\u0631\u062F (\u0646\u0633\u062E\u0647\u0654 {revision}): {state}.",
    tr: "{note}, {date} tarihinde {evidence} kayd\u0131na ba\u011Fland\u0131 (s\xFCr\xFCm {revision}): {state}."
  },
  unlinked: {
    en: "Removed the link of {note} on {date} (revision {revision}). The note counts as your own statement again.",
    fa: "\u067E\u06CC\u0648\u0646\u062F {note} \u062F\u0631 {date} \u0628\u0631\u062F\u0627\u0634\u062A\u0647 \u0634\u062F (\u0646\u0633\u062E\u0647\u0654 {revision}). \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u0648\u0628\u0627\u0631\u0647 \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0634\u0645\u0627 \u062D\u0633\u0627\u0628 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{note} notunun ba\u011Flant\u0131s\u0131 {date} tarihinde kald\u0131r\u0131ld\u0131 (s\xFCr\xFCm {revision}). Not yeniden sizin beyan\u0131n\u0131z say\u0131l\u0131r."
  },
  stored: {
    en: "Stored privately in brand/.private/assurance/evidence-links/ (gitignored, never read by agents, Studio or docs). Run brand:assurance assess to see the result.",
    fa: "\u0628\u0647\u200C\u0637\u0648\u0631 \u062E\u0635\u0648\u0635\u06CC \u062F\u0631 brand/.private/assurance/evidence-links/ \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F (\u062F\u0631 git \u0646\u06CC\u0633\u062A \u0648 \u0639\u0627\u0645\u0644\u200C\u0647\u0627\u060C Studio \u0648 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u0646\u062F). \u0628\u0631\u0627\u06CC \u062F\u06CC\u062F\u0646 \u0646\u062A\u06CC\u062C\u0647 brand:assurance assess \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "brand/.private/assurance/evidence-links/ i\xE7inde gizli olarak sakland\u0131 (git d\u0131\u015F\u0131nda; ajanlar, Studio ve belgeler okumaz). Sonucu g\xF6rmek i\xE7in brand:assurance assess \xE7al\u0131\u015Ft\u0131r\u0131n."
  },
  refused_agent: {
    en: "Evidence links are the owner\u2019s own. Refusing while BRAND_OS_AGENT_TOKEN is set; no agent profile covers them.",
    fa: "\u067E\u06CC\u0648\u0646\u062F\u0647\u0627\u06CC \u0634\u0648\u0627\u0647\u062F \u0641\u0642\u0637 \u0645\u0627\u0644 \u0645\u0627\u0644\u06A9 \u0627\u0633\u062A. \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0647\u06CC\u0686 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0639\u0627\u0645\u0644\u06CC \u0622\u0646 \u0631\u0627 \u067E\u0648\u0634\u0634 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "Kan\u0131t ba\u011Flant\u0131lar\u0131 yaln\u0131zca sahibe aittir. BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir; hi\xE7bir ajan profili bunu kapsamaz."
  },
  rejected: { en: "Not recorded: {reason}", fa: "\u062B\u0628\u062A \u0646\u0634\u062F: {reason}", tr: "Kaydedilmedi: {reason}" },
  unexpected: {
    en: "Unexpected error ({name}). A link is written in one atomic step: either it was recorded in full or not at all. Run list to check.",
    fa: "\u062E\u0637\u0627\u06CC \u067E\u06CC\u0634\u200C\u0628\u06CC\u0646\u06CC\u200C\u0646\u0634\u062F\u0647 ({name}). \u067E\u06CC\u0648\u0646\u062F \u062F\u0631 \u06CC\u06A9 \u06AF\u0627\u0645 \u0627\u062A\u0645\u06CC \u0646\u0648\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F: \u06CC\u0627 \u06A9\u0627\u0645\u0644 \u062B\u0628\u062A \u0634\u062F\u0647 \u06CC\u0627 \u0627\u0635\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0634\u062F\u0647. \u0628\u0631\u0627\u06CC \u0627\u0637\u0645\u06CC\u0646\u0627\u0646 list \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.",
    tr: "Beklenmeyen hata ({name}). Bir ba\u011Flant\u0131 tek bir atomik ad\u0131mda yaz\u0131l\u0131r: ya tamamen kaydedildi ya da hi\xE7 kaydedilmedi. Kontrol i\xE7in list \xE7al\u0131\u015Ft\u0131r\u0131n."
  }
};
var LINK_HELP = {
  en: `brand:assurance-link <command> [options]   owner-local; refused while BRAND_OS_AGENT_TOKEN is set

  list   [--as-of YYYY-MM-DD] [--lang en|fa|tr] [--json]
                     your research notes, their links and the register entries they could link to
  link   --note <kn_\u2026> --evidence <ev-NNNN> [--date YYYY-MM-DD] [--expect <revision>|none]
         [--lang en|fa|tr] [--json]
                     link a note, as it is now, to an evidence-register entry
  unlink --note <kn_\u2026> [--date YYYY-MM-DD] [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     remove the link; the note counts as your own statement again

A linked note counts as independent evidence only while the entry is verified (brand:evidence verify),
not owner testimony, about a question the note is about and not past its review date, and while the
note is unchanged. Links are versioned in brand/.private/assurance/evidence-links/ (gitignored).
This is an internal assessment, never a certification or a compliance statement; authorizes is always empty.`,
  fa: `brand:assurance-link <command> [options]   \u0641\u0642\u0637 \u0645\u062D\u0644\u06CC \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9\u061B \u062A\u0627 \u0648\u0642\u062A\u06CC BRAND_OS_AGENT_TOKEN \u062A\u0646\u0638\u06CC\u0645 \u0627\u0633\u062A \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F

  list   [--as-of YYYY-MM-DD] [--lang en|fa|tr] [--json]
                     \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0634\u0645\u0627\u060C \u067E\u06CC\u0648\u0646\u062F\u0647\u0627\u06CC\u0634\u0627\u0646 \u0648 \u0645\u062F\u0627\u0631\u06A9\u06CC \u0627\u0632 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u06A9\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0628\u0647 \u0622\u0646\u200C\u0647\u0627 \u0648\u0635\u0644 \u0634\u0648\u0646\u062F
  link   --note <kn_\u2026> --evidence <ev-NNNN> [--date YYYY-MM-DD] [--expect <revision>|none]
         [--lang en|fa|tr] [--json]
                     \u06CC\u06A9 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0631\u0627\u060C \u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0627\u06A9\u0646\u0648\u0646 \u0647\u0633\u062A\u060C \u0628\u0647 \u06CC\u06A9 \u0645\u062F\u0631\u06A9 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F
  unlink --note <kn_\u2026> [--date YYYY-MM-DD] [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     \u067E\u06CC\u0648\u0646\u062F \u0631\u0627 \u0628\u0631\u062F\u0627\u0631\u06CC\u062F\u061B \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u0648\u0628\u0627\u0631\u0647 \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0634\u0645\u0627 \u062D\u0633\u0627\u0628 \u0645\u06CC\u200C\u0634\u0648\u062F

\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u06CC\u0648\u0646\u062F\u062E\u0648\u0631\u062F\u0647 \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u0634\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u062D\u0633\u0627\u0628 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u0645\u062F\u0631\u06A9 \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0628\u0627\u0634\u062F (brand:evidence verify)\u060C \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9 \u0646\u0628\u0627\u0634\u062F\u060C
\u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u067E\u0631\u0633\u0634\u06CC \u0628\u0627\u0634\u062F \u06A9\u0647 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0628\u0647 \u0622\u0646 \u0645\u06CC\u200C\u067E\u0631\u062F\u0627\u0632\u062F\u060C \u062A\u0627\u0631\u06CC\u062E \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0627\u0634 \u0646\u06AF\u0630\u0634\u062A\u0647 \u0628\u0627\u0634\u062F \u0648 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F\u0647 \u0628\u0627\u0634\u062F.
\u067E\u06CC\u0648\u0646\u062F\u0647\u0627 \u0628\u0627 \u0646\u0633\u062E\u0647 \u062F\u0631 brand/.private/assurance/evidence-links/ \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F (\u0628\u06CC\u0631\u0648\u0646 \u0627\u0632 git).
\u0627\u06CC\u0646 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC \u0627\u0633\u062A \u0648 \u0647\u0631\u06AF\u0632 \u06AF\u0648\u0627\u0647\u06CC\u200C\u0646\u0627\u0645\u0647 \u06CC\u0627 \u0627\u0638\u0647\u0627\u0631 \u0627\u0646\u0637\u0628\u0627\u0642 \u0646\u06CC\u0633\u062A\u061B authorizes \u0647\u0645\u06CC\u0634\u0647 \u062E\u0627\u0644\u06CC \u0627\u0633\u062A.`,
  tr: `brand:assurance-link <command> [options]   yaln\u0131zca sahibin yerel ortam\u0131; BRAND_OS_AGENT_TOKEN ayarl\u0131yken reddedilir

  list   [--as-of YYYY-MM-DD] [--lang en|fa|tr] [--json]
                     ara\u015Ft\u0131rma notlar\u0131n\u0131z, ba\u011Flant\u0131lar\u0131 ve ba\u011Flanabilecekleri kan\u0131t kay\u0131tlar\u0131
  link   --note <kn_\u2026> --evidence <ev-NNNN> [--date YYYY-MM-DD] [--expect <revision>|none]
         [--lang en|fa|tr] [--json]
                     bir notu, \u015Fimdiki h\xE2liyle, bir kan\u0131t kayd\u0131na ba\u011Flay\u0131n
  unlink --note <kn_\u2026> [--date YYYY-MM-DD] [--expect <revision>|none] [--lang en|fa|tr] [--json]
                     ba\u011Flant\u0131y\u0131 kald\u0131r\u0131n; not yeniden sizin beyan\u0131n\u0131z say\u0131l\u0131r

Ba\u011Fl\u0131 bir not yaln\u0131zca kay\u0131t do\u011Frulanm\u0131\u015Fsa (brand:evidence verify), sahip beyan\u0131 de\u011Filse, notun ilgili oldu\u011Fu
bir soruya aitse, inceleme tarihi ge\xE7memi\u015Fse ve not de\u011Fi\u015Fmemi\u015Fse ba\u011F\u0131ms\u0131z kan\u0131t say\u0131l\u0131r.
Ba\u011Flant\u0131lar brand/.private/assurance/evidence-links/ i\xE7inde s\xFCr\xFCml\xFC tutulur (git d\u0131\u015F\u0131nda).
Bu bir i\xE7 de\u011Ferlendirmedir; asla sertifika veya uyumluluk beyan\u0131 de\u011Fildir; authorizes her zaman bo\u015Ftur.`
};
function renderLinkList(result, lang) {
  const lines = [`# ${LINK_TEXT.title[lang]}`, "", `> ${BRIDGE_TEXT.disclaimer[lang]}`, "", `- ${BRIDGE_TEXT.brand[lang]}: \`${result.brand_id}\``, ""];
  if (result.items.length === 0) {
    lines.push(LINK_TEXT.none[lang], "");
    return lines.join("\n");
  }
  lines.push(LINK_TEXT.intro[lang], "");
  for (const entry of result.items) {
    lines.push(`## \`${entry.note_id}\``, "");
    lines.push(`- ${LINK_TEXT.questions[lang]}: ${entry.question_ids.map((id) => `\`${id}\``).join(comma(lang)) || "\u2014"}`);
    lines.push(`- ${LINK_TEXT.controls[lang]}: ${entry.control_ids.join(comma(lang)) || "\u2014"}`);
    lines.push(`- ${LINK_TEXT.link[lang]}: ${entry.link ? `\`${entry.link.evidence_id}\` \xB7 ${entry.link.linked_on} \xB7 \`${entry.link.revision}\` \xB7 **${LINK_STATE_TEXT[entry.link.state][lang]}**` : LINK_TEXT.no_link[lang]}`);
    lines.push(`- ${LINK_TEXT.revisions[lang]}: ${entry.revisions}`);
    const candidates = entry.candidates.map((candidate) => `\`${candidate.evidence_id}\` (\`${candidate.claim_id}\`${comma(lang)}${EVIDENCE_STATUS_TEXT[candidate.status][lang]}${candidate.independent_source ? "" : `${comma(lang)}${LINK_TEXT.testimony[lang]}`})`);
    lines.push(`- ${LINK_TEXT.candidates[lang]}: ${candidates.join(comma(lang)) || LINK_TEXT.no_candidates[lang]}`);
    lines.push(`- ${fill(LINK_TEXT.how[lang], { note: entry.note_id })}`, "");
  }
  lines.push(`> ${LINK_TEXT.unconfirmed[lang]}`, "", `- ${BRIDGE_TEXT.authorizes[lang]}`, "");
  return lines.join("\n");
}
function renderLinked(result, lang) {
  const head = result.revision.action === "link" ? fill(LINK_TEXT.linked[lang], {
    note: result.note_id,
    evidence: result.revision.evidence_id ?? "",
    date: result.revision.linked_on,
    revision: result.revision.revision,
    state: result.state ? LINK_STATE_TEXT[result.state][lang] : ""
  }) : fill(LINK_TEXT.unlinked[lang], { note: result.note_id, date: result.revision.linked_on, revision: result.revision.revision });
  return [head, LINK_TEXT.stored[lang], BRIDGE_TEXT.disclaimer[lang], ""].join("\n");
}

export {
  AssuranceReviewError,
  isDay,
  AssuranceLinkError,
  MAX_SNAPSHOT_BYTES,
  AssuranceBridgeError,
  listReviewItems,
  recordReview,
  listEvidenceLinks,
  linkEvidence,
  unlinkEvidence,
  buildAssuranceSnapshot,
  assessWorkspace,
  parseSnapshotFile,
  verifyAssuranceSnapshot,
  BRIDGE_TEXT,
  BRIDGE_HELP,
  renderSnapshotSummary,
  renderVerifyResult,
  REVIEW_TEXT,
  REVIEW_HELP,
  renderReviewList,
  renderRecorded,
  LINK_TEXT,
  LINK_HELP,
  renderLinkList,
  renderLinked
};
