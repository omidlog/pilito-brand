import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  AGENT_TOKEN_ENV,
  UNIVERSAL_PROFILE,
  asciiDigits,
  claimVerification,
  disabledModule,
  external_exports,
  findContradictions,
  isOpenAnswer,
  latestAnswers,
  personalConfig,
  readEvidence,
  shouldSkip
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/coach/model.ts
var COACH_ENGINE_VERSION = "coach/1";
var COACH_RULE_VERSION = "coach-rules/6";
var COACH_SCHEMA_VERSION = 1;
var COACH_MODES = ["follow_up", "quality_review", "consistency_review"];
var COACH_STATUSES = ["ready", "needs_clarification", "evidence_missing", "needs_review", "not_applicable", "insufficient_context"];
var COACH_CRITERIA = ["relevance", "specificity", "completeness_for_output", "measurability", "evidence_support", "clarity_coherence"];
var COACH_CONSISTENCY_VERDICTS = ["confirmed_conflict", "potential_tension", "needs_verification"];
var COACH_FINDING_TYPES = ["follow_up", "quality", "consistency"];
var COACH_SEVERITIES = ["info", "advice", "attention"];
var COACH_FINDING_CODES = [
  // quality_review
  "question_not_applicable",
  "answer_missing",
  "answer_disposition",
  "placeholder_value",
  "vague_terms",
  "too_brief_for_output",
  "linked_question_open",
  "missing_measure",
  "evidence_not_verified",
  "evidence_owner_stated_only",
  "field_in_open_conflict",
  "meets_criteria",
  // quality_review, personal facet rubrics (coach/facet-rubrics.ts)
  "facet_ownership_separate",
  "facet_companion_open",
  "facet_claim_undated",
  // follow_up
  "follow_up_canonical",
  "follow_up_clarify",
  "follow_up_none",
  // consistency_review
  "consistency_rule",
  "consistency_tension",
  "consistency_verification",
  "consistency_none"
];
var COACH_SOURCE_KINDS = ["question", "answer", "contradiction", "evidence", "profile", "config"];
var COACH_LIMITS = {
  /** `quality_review` reports at most this many deficits (hard rule: "maximum 2 top deficits"). */
  maxDeficits: 2,
  /** `follow_up` returns 0 or 1 question. Never more. */
  maxFollowUps: 1,
  /** Defence against an enormous ledger: the consistency summary lists at most this many conflicts. */
  maxConsistencyFindings: 20,
  /** Answer text longer than this is truncated before the rules read it (bounded work, no model). */
  maxAnswerChars: 4e3,
  maxReasonChars: 600
};
var CoachError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CoachError";
  }
  code;
};
var COACH_RULE_CHECK_KINDS = ["contradiction", "tension", "verification"];
var COACH_RULE_CHECK_OUTCOMES = ["confirmed_conflict", "potential_tension", "needs_verification", "no_finding", "not_tested"];
var COACH_RULE_CHECK_BASES = ["rule_fired", "rule_silent", "guard_matched", "inputs_open"];
var QUESTION_ID = /^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/;
var SourceRefSchema = external_exports.object({ kind: external_exports.enum(COACH_SOURCE_KINDS), id: external_exports.string().min(1).max(200), revision: external_exports.string().min(1).max(40).optional() }).strict();
var RuleCheckSchema = external_exports.object({
  rule_id: external_exports.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  kind: external_exports.enum(COACH_RULE_CHECK_KINDS),
  outcome: external_exports.enum(COACH_RULE_CHECK_OUTCOMES),
  basis: external_exports.enum(COACH_RULE_CHECK_BASES),
  question_ids: external_exports.array(external_exports.string().regex(QUESTION_ID)).max(100)
}).strict();
var FindingSchema = external_exports.object({
  id: external_exports.string().min(1).max(200),
  type: external_exports.enum(COACH_FINDING_TYPES),
  code: external_exports.enum(COACH_FINDING_CODES),
  status: external_exports.enum(COACH_STATUSES),
  severity: external_exports.enum(COACH_SEVERITIES),
  criterion: external_exports.enum(COACH_CRITERIA).nullable(),
  verdict: external_exports.enum(COACH_CONSISTENCY_VERDICTS).nullable(),
  question_id: external_exports.string().regex(QUESTION_ID).nullable(),
  related_question_ids: external_exports.array(external_exports.string().regex(QUESTION_ID)).max(50),
  canonical_question_id: external_exports.string().regex(QUESTION_ID).nullable(),
  suggested_question: external_exports.string().min(1).max(COACH_LIMITS.maxReasonChars).nullable(),
  missing_dimension: external_exports.enum(COACH_CRITERIA).nullable(),
  improves_outputs: external_exports.array(external_exports.string().min(1).max(200)).max(20),
  reason: external_exports.string().min(1).max(COACH_LIMITS.maxReasonChars),
  improvement: external_exports.string().min(1).max(COACH_LIMITS.maxReasonChars).nullable(),
  requires_change_request: external_exports.boolean(),
  source_refs: external_exports.array(SourceRefSchema).max(50),
  origin: external_exports.enum(["deterministic", "model_suggestion"])
}).strict();
var CoachResultSchema = external_exports.object({
  schema_version: external_exports.literal(COACH_SCHEMA_VERSION),
  kind: external_exports.literal("coach_result"),
  brand_id: external_exports.string().min(1).max(100),
  mode: external_exports.enum(COACH_MODES),
  locale: external_exports.enum(["en", "fa", "tr"]),
  question_id: external_exports.string().regex(QUESTION_ID).nullable(),
  answer_ref: external_exports.object({ answer_id: external_exports.string().min(1).max(40), status: external_exports.string().min(1).max(40), digest: external_exports.string().regex(/^[0-9a-f]{16}$/) }).strict().nullable(),
  analysis_scope: external_exports.object({
    profile: external_exports.string().min(1).max(100),
    questions: external_exports.array(external_exports.string().regex(QUESTION_ID)).max(1e3),
    context_digest: external_exports.string().regex(/^[0-9a-f]{16}$/)
  }).strict(),
  status: external_exports.enum(COACH_STATUSES),
  findings: external_exports.array(FindingSchema).max(COACH_LIMITS.maxConsistencyFindings + COACH_LIMITS.maxDeficits + 1),
  generated_at: external_exports.string().min(20).max(30),
  engine_version: external_exports.string().min(1).max(40),
  rule_version: external_exports.string().min(1).max(40),
  authority: external_exports.literal("derived_advice"),
  authorizes: external_exports.tuple([]),
  source_refs: external_exports.array(SourceRefSchema).max(200),
  notes: external_exports.array(external_exports.string().min(1).max(COACH_LIMITS.maxReasonChars)).max(20),
  rule_checks: external_exports.array(RuleCheckSchema).max(30).optional()
}).strict();
function validateCoachResult(result) {
  const parsed = CoachResultSchema.safeParse(result);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new CoachError("invalid_output", `The coach produced a result that does not match the contract: ${first ? `${first.path.join(".")} ${first.message}` : "unknown field"}.`);
  }
  return parsed.data;
}
function isCoachMode(value) {
  return typeof value === "string" && COACH_MODES.includes(value);
}

// packages/brand-core/src/coach/context.ts
import crypto from "node:crypto";
function assertOwnerProcess() {
  if (process.env[AGENT_TOKEN_ENV]) {
    throw new CoachError("refused", `The strategic coach is the owner's local, advisory analysis. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers it.`);
  }
}
function openCoachContext(source, opts = {}) {
  assertOwnerProcess();
  const config = source.config();
  const questions = source.questions();
  const ledger = source.ledger();
  const session = source.session();
  const profile = source.profile();
  const answers = latestAnswers(ledger.records);
  const last = session.last_answer_id ? ledger.records.find((record) => record.answer_id === session.last_answer_id) : void 0;
  return {
    brandId: config.brand.slug,
    root: source.workspaceRoot(),
    config,
    profileId: profile ? profile.id : config.brand.profile ?? UNIVERSAL_PROFILE,
    questions,
    byId: new Map(questions.map((question) => [question.id, question])),
    answers,
    // The same function the engine uses, called purely. The coach never adds to or re-implements these rules.
    contradictions: findContradictions(questions, answers, config.modules.mascot.enabled, config.modules.gamification.enabled),
    evidence: readEvidence(source.workspaceRoot()),
    scope: profile ? new Set(profile.question_ids) : null,
    eligibleIds: new Set(source.eligible().map((question) => question.id)),
    deferred: new Set(session.deferred),
    lastAnsweredId: last ? last.question_id : null,
    personalFacets: personalConfig(config).facets,
    now: opts.now ?? /* @__PURE__ */ new Date()
  };
}
function coachQuestion(ctx, questionId) {
  const question = ctx.byId.get(questionId);
  if (!question) throw new CoachError("not_found", `Unknown question ${questionId}. The coach only uses canonical question ids from the interview bank.`);
  if (question.sensitivity === "restricted") {
    throw new CoachError("refused", `${questionId} is a restricted question. The coach does not analyse restricted answers, and no value or digest of one is produced.`);
  }
  return question;
}
function notApplicableReason(ctx, question) {
  const conditionCtx = { config: ctx.config, answers: ctx.answers };
  if (disabledModule(question.id, conditionCtx)) return "module_disabled";
  if (shouldSkip(question.skip_when, conditionCtx)) return "skip_condition";
  return null;
}
function isDisposition(answer) {
  return answer?.status === "unknown" || answer?.status === "skipped" || answer?.status === "not_applicable";
}
function liveAnswer(ctx, questionId) {
  const answer = ctx.answers.get(questionId);
  return isOpenAnswer(answer) ? void 0 : answer;
}
function answerText(answer) {
  if (!answer || answer.value === null || answer.value === void 0) return "";
  return asciiDigits(String(answer.value)).trim().slice(0, COACH_LIMITS.maxAnswerChars);
}
function verificationOf(ctx, question) {
  return claimVerification(question, ctx.evidence, ctx.now);
}
function conflictsFor(ctx, questionId) {
  return ctx.contradictions.filter((item) => item.status === "open" && item.fields.includes(questionId));
}
function openLinked(ctx, question) {
  const inScope = (id) => !ctx.scope || ctx.scope.has(id);
  return [...new Set(question.depends_on)].filter((id) => inScope(id) && ctx.byId.has(id) && isOpenAnswer(ctx.answers.get(id))).sort();
}
function sha(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex").slice(0, 16);
}
function answerDigest(answer) {
  return sha([answer.answer_id, answer.status, answer.last_updated ?? "", String(answer.value ?? "")].join("\0"));
}
function contextDigest(ctx, ruleVersion, questionIds) {
  const parts = [ruleVersion, ctx.brandId, ctx.profileId];
  for (const id of [...questionIds].sort()) {
    const answer = ctx.answers.get(id);
    parts.push(`${id}=${answer ? `${answer.answer_id}:${answer.status}:${answerDigest(answer)}` : "open"}`);
  }
  for (const item of ctx.contradictions) parts.push(`con:${item.id}:${item.status}`);
  return sha(parts.join("\n"));
}

// packages/brand-core/src/coach/consistency.ts
function consistencyFindings(ctx, questionId = null) {
  const rank = { high: 0, medium: 1, low: 2 };
  return ctx.contradictions.filter((item) => item.status === "open" && (questionId === null || item.fields.includes(questionId))).sort((a, b) => rank[a.severity] - rank[b.severity] || a.id.localeCompare(b.id)).slice(0, COACH_LIMITS.maxConsistencyFindings).map((contradiction) => ({
    contradiction,
    verdict: "confirmed_conflict",
    relatedIds: [...contradiction.fields].sort(),
    sourceRefs: [
      { kind: "contradiction", id: contradiction.id },
      ...contradiction.fields.filter((id) => ctx.byId.has(id)).map((id) => ({ kind: "question", id }))
    ]
  }));
}
function answeredIds(ctx) {
  return [...ctx.answers.entries()].filter(([id, answer]) => {
    const question = ctx.byId.get(id);
    return question !== void 0 && question.sensitivity !== "restricted" && !isOpenAnswer(answer);
  }).map(([id]) => id).sort();
}

// packages/brand-core/src/coach/i18n.ts
var COACH_TENSION_RULES = ["premium-vs-lowest-price", "availability-held-back"];
var EN = {
  question_not_applicable: {
    reason: "{question} does not apply to this brand right now ({why}; condition: {condition}), so it is not applicable rather than missing.",
    improvement: null
  },
  answer_missing: {
    reason: "{question} has no live answer in the ledger, so there is nothing to assess yet.",
    improvement: "Answer it when you are ready: npm run brand:interview -- --question {question}"
  },
  answer_disposition: {
    reason: "{question} is recorded as {status}. That is an explicit decision of yours, so the coach treats the field as settled and asks nothing further.",
    improvement: null
  },
  placeholder_value: {
    reason: "The stored value for {question} is one of the template placeholders, not a decision of yours.",
    improvement: "Replace it with your own wording, or record unknown so the field is honestly open instead of looking answered."
  },
  vague_terms: {
    reason: "The answer to {question} is short and rests on general wording ({terms}). No document can turn that into a specific claim.",
    improvement: "Name the one case you actually mean: which group, in which situation, with which problem."
  },
  too_brief_for_output: {
    reason: "The answer to {question} has {words} content word(s); below {min} there is not enough for the sections it feeds.",
    improvement: "Add the missing half in one more sentence: what it is, who it is for, and why that matters here."
  },
  linked_question_open: {
    reason: "{question} is answered, but the linked question(s) it builds on are still open: {ids}. The document section stays incomplete until they are settled.",
    improvement: "Answer {ids} next. These are existing interview questions; the coach adds none."
  },
  missing_measure: {
    reason: "{question} asks for a measure, and the stored answer carries no figure, period or unit.",
    improvement: "State the figure you actually have, with its period and unit. If you do not have one, record unknown rather than an estimate that reads like a fact."
  },
  evidence_not_verified: {
    reason: "{question} is a claim that needs verified evidence before public use, and the evidence register holds no current, independent source for it.",
    improvement: "Record a source: npm run brand:evidence -- add --claim {question}. Verifying it stays your step."
  },
  evidence_owner_stated_only: {
    reason: "Only your own testimony supports {question}. That is a valid statement of yours; it is not independent verification, and publication needs the latter.",
    improvement: "Add a source someone outside could check, then verify it: npm run brand:evidence -- add --claim {question}"
  },
  field_in_open_conflict: {
    reason: "{question} appears in {count} open contradiction(s) from the interview rules ({rules}). The coach reports them; it did not create or widen them.",
    improvement: "Decide which field is right, then correct the other through the normal change flow so the diff is visible."
  },
  meets_criteria: {
    reason: "The answer to {question} passes every criterion the coach can check without a model: {criteria}. This is a check on the data, not a judgement of your decision.",
    improvement: null
  },
  facet_ownership_separate: {
    reason: "{question} uses ownership wording. For a {facet} profile a role (founder, lead, adviser) never implies ownership: ownership is a separate statement that needs its own evidence.",
    improvement: "Keep {question} to the role, and record ownership in {canonical} with an explicit ownership state."
  },
  facet_companion_open: {
    reason: "{question} is answered, but for a {facet} profile it can only be used once {canonical} is settled, and that question is still open ({rubric}).",
    improvement: "Answer {canonical} next: npm run brand:interview -- --question {canonical}"
  },
  facet_claim_undated: {
    reason: "{question} is a public track-record claim for a {facet} profile, and the answer gives no year. Undated numbers and history are not published.",
    improvement: "Add the year (and the month for audience numbers) to each item, then record its source: npm run brand:evidence -- add --claim {question}"
  },
  follow_up_canonical: {
    reason: "The gap after {question} is {criterion}, and the interview already owns a question for it: {canonical}. Asking that one keeps a single canonical answer.",
    improvement: "Ask {canonical} next: npm run brand:interview -- --question {canonical}"
  },
  follow_up_clarify: {
    reason: "One clarifying question would make {question} usable for {outputs}. The missing dimension is {criterion}, and no existing question covers it.",
    improvement: "Answer in your own words, or reply skip, unknown or decide later \u2014 the coach will not ask again for this answer."
  },
  follow_up_none: {
    reason: "Nothing to ask about {question}: {why}",
    improvement: null
  },
  consistency_rule: {
    reason: "The interview rule {rule} reports a conflict between {ids}. This is the existing deterministic rule, reported unchanged.",
    improvement: "Settle which field is right with the owner, then correct the other through the change flow."
  },
  consistency_tension: {
    reason: "Rule {rule}: {ids} can both be true, but they often pull in different directions. This is a possible trade-off, not a contradiction, and nothing is wrong unless you decide it is.",
    improvement: "Answer the suggested question in one sentence, or leave it as it is: a deliberate trade-off is a valid decision."
  },
  consistency_verification: {
    reason: "Rule {rule}: {ids} makes a claim that needs a source, and the evidence register holds no current independent source for it. The claim stays unverified; the coach cannot verify anything.",
    improvement: "Record a source and verify it: npm run brand:evidence -- add --claim {ids}. Until then, do not repeat the claim publicly."
  },
  consistency_none: {
    reason: "No contradiction, possible trade-off or unverified claim was found across the {count} answered question(s) the coach read. Rules that could not run are listed as not tested.",
    improvement: null
  }
};
var FA = {
  question_not_applicable: {
    reason: "{question} \u062F\u0631 \u062D\u0627\u0644 \u062D\u0627\u0636\u0631 \u0628\u0647 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0645\u0631\u0628\u0648\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F ({why}\u061B \u0634\u0631\u0637: {condition})\u061B \u067E\u0633 \xAB\u0646\u0627\u0645\u0631\u062A\u0628\u0637\xBB \u0627\u0633\u062A\u060C \u0646\u0647 \xAB\u062C\u0627\u0645\u0627\u0646\u062F\u0647\xBB.",
    improvement: null
  },
  answer_missing: {
    reason: "\u0628\u0631\u0627\u06CC {question} \u0647\u06CC\u0686 \u067E\u0627\u0633\u062E \u0641\u0639\u0627\u0644\u06CC \u062F\u0631 \u062F\u0641\u062A\u0631 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A\u061B \u067E\u0633 \u0647\u0646\u0648\u0632 \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F.",
    improvement: "\u0647\u0631 \u0648\u0642\u062A \u0622\u0645\u0627\u062F\u0647 \u0628\u0648\u062F\u06CC\u062F \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F: npm run brand:interview -- --question {question}"
  },
  answer_disposition: {
    reason: "{question} \u0628\u0627 \u0648\u0636\u0639\u06CC\u062A {status} \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A. \u0627\u06CC\u0646 \u062A\u0635\u0645\u06CC\u0645 \u0635\u0631\u06CC\u062D \u062E\u0648\u062F\u062A\u0627\u0646 \u0627\u0633\u062A\u061B \u067E\u0633 \u0645\u0631\u0628\u06CC \u0627\u06CC\u0646 \u0641\u06CC\u0644\u062F \u0631\u0627 \u0628\u0633\u062A\u0647\u200C\u0634\u062F\u0647 \u0645\u06CC\u200C\u062F\u0627\u0646\u062F \u0648 \u067E\u0631\u0633\u0634 \u062F\u06CC\u06AF\u0631\u06CC \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    improvement: null
  },
  placeholder_value: {
    reason: "\u0645\u0642\u062F\u0627\u0631 \u0630\u062E\u06CC\u0631\u0647\u200C\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC {question} \u06CC\u06A9\u06CC \u0627\u0632 \u062C\u0627\u0646\u06AF\u0647\u062F\u0627\u0631\u0647\u0627\u06CC \u0642\u0627\u0644\u0628 \u0627\u0633\u062A\u060C \u0646\u0647 \u062A\u0635\u0645\u06CC\u0645 \u0634\u0645\u0627.",
    improvement: "\u0622\u0646 \u0631\u0627 \u0628\u0627 \u0648\u0627\u0698\u06AF\u0627\u0646 \u062E\u0648\u062F\u062A\u0627\u0646 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u06A9\u0646\u06CC\u062F\u060C \u06CC\u0627 unknown \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0641\u06CC\u0644\u062F \u0635\u0627\u062F\u0642\u0627\u0646\u0647 \u0628\u0627\u0632 \u0628\u0645\u0627\u0646\u062F \u0648 \u067E\u0627\u0633\u062E\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u0628\u0647 \u0646\u0638\u0631 \u0646\u0631\u0633\u062F."
  },
  vague_terms: {
    reason: "\u067E\u0627\u0633\u062E {question} \u06A9\u0648\u062A\u0627\u0647 \u0627\u0633\u062A \u0648 \u0628\u0631 \u0648\u0627\u0698\u06AF\u0627\u0646 \u0639\u0645\u0648\u0645\u06CC \u062A\u06A9\u06CC\u0647 \u062F\u0627\u0631\u062F ({terms}). \u0647\u06CC\u0686 \u0633\u0646\u062F\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u0632 \u0627\u06CC\u0646 \u0645\u062A\u0646 \u06CC\u06A9 \u0627\u062F\u0639\u0627\u06CC \u0645\u0634\u062E\u0635 \u0628\u0633\u0627\u0632\u062F.",
    improvement: "\u0647\u0645\u0627\u0646 \u06CC\u06A9 \u0645\u0648\u0631\u062F \u0648\u0627\u0642\u0639\u06CC \u0631\u0627 \u0646\u0627\u0645 \u0628\u0628\u0631\u06CC\u062F: \u06A9\u062F\u0627\u0645 \u06AF\u0631\u0648\u0647\u060C \u062F\u0631 \u06A9\u062F\u0627\u0645 \u0645\u0648\u0642\u0639\u06CC\u062A\u060C \u0628\u0627 \u06A9\u062F\u0627\u0645 \u0645\u0633\u0626\u0644\u0647."
  },
  too_brief_for_output: {
    reason: "\u067E\u0627\u0633\u062E {question} {words} \u0648\u0627\u0698\u0647\u0654 \u0645\u062D\u062A\u0648\u0627\u06CC\u06CC \u062F\u0627\u0631\u062F\u061B \u06A9\u0645\u062A\u0631 \u0627\u0632 {min} \u0648\u0627\u0698\u0647 \u0628\u0631\u0627\u06CC \u0628\u062E\u0634\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u0641\u06CC\u0644\u062F \u062A\u063A\u0630\u06CC\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A.",
    improvement: "\u0646\u06CC\u0645\u0647\u0654 \u062C\u0627\u0645\u0627\u0646\u062F\u0647 \u0631\u0627 \u062F\u0631 \u06CC\u06A9 \u062C\u0645\u0644\u0647\u0654 \u062F\u06CC\u06AF\u0631 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F: \u0686\u0647 \u0686\u06CC\u0632\u06CC\u060C \u0628\u0631\u0627\u06CC \u0686\u0647 \u06A9\u0633\u06CC\u060C \u0648 \u0686\u0631\u0627 \u0627\u06CC\u0646\u062C\u0627 \u0645\u0647\u0645 \u0627\u0633\u062A."
  },
  linked_question_open: {
    reason: "{question} \u067E\u0627\u0633\u062E \u062F\u0627\u0631\u062F\u060C \u0627\u0645\u0627 \u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u067E\u06CC\u0648\u0646\u062F\u06CC \u06A9\u0647 \u0628\u0631 \u0622\u0646\u200C\u0647\u0627 \u0628\u0646\u0627 \u0634\u062F\u0647 \u0647\u0646\u0648\u0632 \u0628\u0627\u0632 \u0627\u0633\u062A: {ids}. \u062A\u0627 \u062A\u0639\u06CC\u06CC\u0646\u200C\u062A\u06A9\u0644\u06CC\u0641 \u0622\u0646\u200C\u0647\u0627\u060C \u0628\u062E\u0634 \u0633\u0646\u062F \u0646\u0627\u0642\u0635 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    improvement: "\u062F\u0631 \u06AF\u0627\u0645 \u0628\u0639\u062F \u0628\u0647 {ids} \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F. \u0627\u06CC\u0646\u200C\u0647\u0627 \u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u0645\u0648\u062C\u0648\u062F \u0645\u0635\u0627\u062D\u0628\u0647\u200C\u0627\u0646\u062F\u061B \u0645\u0631\u0628\u06CC \u067E\u0631\u0633\u0634\u06CC \u0646\u0645\u06CC\u200C\u0627\u0641\u0632\u0627\u06CC\u062F."
  },
  missing_measure: {
    reason: "{question} \u06CC\u06A9 \u0633\u0646\u062C\u0647 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F \u0648 \u067E\u0627\u0633\u062E \u0630\u062E\u06CC\u0631\u0647\u200C\u0634\u062F\u0647 \u0647\u06CC\u0686 \u0631\u0642\u0645\u060C \u062F\u0648\u0631\u0647 \u06CC\u0627 \u0648\u0627\u062D\u062F\u06CC \u0646\u062F\u0627\u0631\u062F.",
    improvement: "\u0647\u0645\u0627\u0646 \u0631\u0642\u0645\u06CC \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u0648\u0627\u0642\u0639\u0627\u064B \u062F\u0627\u0631\u06CC\u062F\u060C \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u062F\u0648\u0631\u0647 \u0648 \u0648\u0627\u062D\u062F\u0634. \u0627\u06AF\u0631 \u0631\u0642\u0645\u06CC \u0646\u062F\u0627\u0631\u06CC\u062F\u060C \u0628\u0647\u200C\u062C\u0627\u06CC \u0628\u0631\u0622\u0648\u0631\u062F\u06CC \u06A9\u0647 \u0645\u062B\u0644 \u0648\u0627\u0642\u0639\u06CC\u062A \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C unknown \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F."
  },
  evidence_not_verified: {
    reason: "{question} \u0627\u062F\u0639\u0627\u06CC\u06CC \u0627\u0633\u062A \u06A9\u0647 \u067E\u06CC\u0634 \u0627\u0632 \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC \u0628\u0647 \u0634\u0647\u0648\u062F \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F \u0648 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0647\u0648\u062F \u0647\u06CC\u0686 \u0645\u0646\u0628\u0639 \u0645\u0633\u062A\u0642\u0644 \u0648 \u0645\u0639\u062A\u0628\u0631\u06CC \u0628\u0631\u0627\u06CC \u0622\u0646 \u0646\u06CC\u0633\u062A.",
    improvement: "\u06CC\u06A9 \u0645\u0646\u0628\u0639 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F: npm run brand:evidence -- add --claim {question}. \u062A\u0623\u06CC\u06CC\u062F \u0622\u0646 \u06AF\u0627\u0645 \u062E\u0648\u062F\u062A\u0627\u0646 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F."
  },
  evidence_owner_stated_only: {
    reason: "\u062A\u0646\u0647\u0627 \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F\u062A\u0627\u0646 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646 {question} \u0627\u0633\u062A. \u0627\u06CC\u0646 \u06CC\u06A9 \u0628\u06CC\u0627\u0646 \u0645\u0639\u062A\u0628\u0631 \u0627\u0632 \u0633\u0648\u06CC \u0634\u0645\u0627\u0633\u062A\u060C \u0627\u0645\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0645\u0633\u062A\u0642\u0644 \u0646\u06CC\u0633\u062A \u0648 \u0627\u0646\u062A\u0634\u0627\u0631 \u0628\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0645\u0633\u062A\u0642\u0644 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.",
    improvement: "\u0645\u0646\u0628\u0639\u06CC \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u06A9\u0633\u06CC \u0628\u06CC\u0631\u0648\u0646 \u0627\u0632 \u0633\u0627\u0632\u0645\u0627\u0646 \u0628\u062A\u0648\u0627\u0646\u062F \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u062F\u060C \u0633\u067E\u0633 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F: npm run brand:evidence -- add --claim {question}"
  },
  field_in_open_conflict: {
    reason: "{question} \u062F\u0631 {count} \u062A\u0646\u0627\u0642\u0636 \u0628\u0627\u0632 \u0627\u0632 \u0642\u0648\u0627\u0639\u062F \u0645\u0635\u0627\u062D\u0628\u0647 \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F ({rules}). \u0645\u0631\u0628\u06CC \u0641\u0642\u0637 \u06AF\u0632\u0627\u0631\u0634 \u0645\u06CC\u200C\u062F\u0647\u062F\u061B \u0627\u06CC\u0646 \u062A\u0646\u0627\u0642\u0636\u200C\u0647\u0627 \u0631\u0627 \u0646\u0633\u0627\u062E\u062A\u0647 \u0648 \u0628\u0632\u0631\u06AF\u200C\u062A\u0631 \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A.",
    improvement: "\u062A\u0635\u0645\u06CC\u0645 \u0628\u06AF\u06CC\u0631\u06CC\u062F \u06A9\u062F\u0627\u0645 \u0641\u06CC\u0644\u062F \u062F\u0631\u0633\u062A \u0627\u0633\u062A\u060C \u0633\u067E\u0633 \u062F\u06CC\u06AF\u0631\u06CC \u0631\u0627 \u0627\u0632 \u0645\u0633\u06CC\u0631 \u0639\u0627\u062F\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0627\u0635\u0644\u0627\u062D \u06A9\u0646\u06CC\u062F \u062A\u0627 \u062A\u0641\u0627\u0648\u062A \u062F\u06CC\u062F\u0647 \u0634\u0648\u062F."
  },
  meets_criteria: {
    reason: "\u067E\u0627\u0633\u062E {question} \u0647\u0645\u0647\u0654 \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC\u06CC \u0631\u0627 \u06A9\u0647 \u0645\u0631\u0628\u06CC \u0628\u062F\u0648\u0646 \u0645\u062F\u0644 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0633\u0646\u062C\u062F \u0645\u06CC\u200C\u06AF\u0630\u0631\u0627\u0646\u062F: {criteria}. \u0627\u06CC\u0646 \u0628\u0631\u0631\u0633\u06CC\u0650 \u062F\u0627\u062F\u0647 \u0627\u0633\u062A\u060C \u0646\u0647 \u062F\u0627\u0648\u0631\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u062A\u0635\u0645\u06CC\u0645 \u0634\u0645\u0627.",
    improvement: null
  },
  facet_ownership_separate: {
    reason: "\u062F\u0631 {question} \u0648\u0627\u0698\u06AF\u0627\u0646 \u0645\u0627\u0644\u06A9\u06CC\u062A \u0622\u0645\u062F\u0647 \u0627\u0633\u062A. \u062F\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 {facet}\u060C \u0646\u0642\u0634 (\u0628\u0646\u06CC\u0627\u0646\u200C\u06AF\u0630\u0627\u0631\u060C \u0645\u062F\u06CC\u0631\u060C \u0645\u0634\u0627\u0648\u0631) \u0647\u0631\u06AF\u0632 \u0628\u0647 \u0645\u0639\u0646\u0627\u06CC \u0645\u0627\u0644\u06A9\u06CC\u062A \u0646\u06CC\u0633\u062A\u061B \u0645\u0627\u0644\u06A9\u06CC\u062A \u062C\u0645\u0644\u0647\u0654 \u062C\u062F\u0627\u06AF\u0627\u0646\u0647\u200C\u0627\u06CC \u0627\u0633\u062A \u06A9\u0647 \u0634\u0627\u0647\u062F \u062E\u0648\u062F\u0634 \u0631\u0627 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F.",
    improvement: "{question} \u0631\u0627 \u0641\u0642\u0637 \u0628\u0647 \u0646\u0642\u0634 \u0645\u062D\u062F\u0648\u062F \u06A9\u0646\u06CC\u062F \u0648 \u0645\u0627\u0644\u06A9\u06CC\u062A \u0631\u0627 \u0628\u0627 \u0648\u0636\u0639\u06CC\u062A \u0635\u0631\u06CC\u062D \u062F\u0631 {canonical} \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F."
  },
  facet_companion_open: {
    reason: "{question} \u067E\u0627\u0633\u062E \u062F\u0627\u0631\u062F\u060C \u0627\u0645\u0627 \u062F\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 {facet} \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u0642\u0627\u0628\u0644 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0633\u062A \u06A9\u0647 {canonical} \u0631\u0648\u0634\u0646 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F\u060C \u0648 \u0622\u0646 \u067E\u0631\u0633\u0634 \u0647\u0646\u0648\u0632 \u0628\u0627\u0632 \u0627\u0633\u062A ({rubric}).",
    improvement: "\u062F\u0631 \u06AF\u0627\u0645 \u0628\u0639\u062F \u0628\u0647 {canonical} \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F: npm run brand:interview -- --question {canonical}"
  },
  facet_claim_undated: {
    reason: "{question} \u062F\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 {facet} \u06CC\u06A9 \u0627\u062F\u0639\u0627\u06CC \u0639\u0645\u0648\u0645\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0633\u0627\u0628\u0642\u0647 \u0627\u0633\u062A \u0648 \u067E\u0627\u0633\u062E \u0647\u06CC\u0686 \u0633\u0627\u0644\u06CC \u0646\u062F\u0627\u0631\u062F. \u0639\u062F\u062F \u0648 \u0633\u0627\u0628\u0642\u0647\u0654 \u0628\u062F\u0648\u0646 \u062A\u0627\u0631\u06CC\u062E \u0645\u0646\u062A\u0634\u0631 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    improvement: "\u0628\u0631\u0627\u06CC \u0647\u0631 \u0645\u0648\u0631\u062F \u0633\u0627\u0644 (\u0648 \u0628\u0631\u0627\u06CC \u0622\u0645\u0627\u0631 \u0645\u062E\u0627\u0637\u0628\u060C \u0645\u0627\u0647) \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u0648 \u0645\u0646\u0628\u0639\u0634 \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F: npm run brand:evidence -- add --claim {question}"
  },
  follow_up_canonical: {
    reason: "\u0634\u06A9\u0627\u0641\u0650 \u0628\u0639\u062F \u0627\u0632 {question} \xAB{criterion}\xBB \u0627\u0633\u062A \u0648 \u0645\u0635\u0627\u062D\u0628\u0647 \u0627\u0632 \u0642\u0628\u0644 \u067E\u0631\u0633\u0634\u06CC \u0628\u0631\u0627\u06CC \u0622\u0646 \u062F\u0627\u0631\u062F: {canonical}. \u067E\u0631\u0633\u06CC\u062F\u0646 \u0647\u0645\u0627\u0646\u060C \u06CC\u06A9 \u067E\u0627\u0633\u062E \u0645\u0631\u062C\u0639 \u0631\u0627 \u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    improvement: "\u062F\u0631 \u06AF\u0627\u0645 \u0628\u0639\u062F {canonical} \u0631\u0627 \u0628\u067E\u0631\u0633\u06CC\u062F: npm run brand:interview -- --question {canonical}"
  },
  follow_up_clarify: {
    reason: "\u06CC\u06A9 \u067E\u0631\u0633\u0634 \u0631\u0648\u0634\u0646\u200C\u06A9\u0646\u0646\u062F\u0647 {question} \u0631\u0627 \u0628\u0631\u0627\u06CC {outputs} \u0642\u0627\u0628\u0644\u200C\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0628\u064F\u0639\u062F \u062C\u0627\u0645\u0627\u0646\u062F\u0647 \xAB{criterion}\xBB \u0627\u0633\u062A \u0648 \u0647\u06CC\u0686 \u067E\u0631\u0633\u0634 \u0645\u0648\u062C\u0648\u062F\u06CC \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u067E\u0648\u0634\u0627\u0646\u062F.",
    improvement: "\u0628\u0627 \u0648\u0627\u0698\u06AF\u0627\u0646 \u062E\u0648\u062F\u062A\u0627\u0646 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F\u060C \u06CC\u0627 skip\u060C unknown \u06CC\u0627 decide later \u0628\u06AF\u0648\u06CC\u06CC\u062F \u2014 \u0645\u0631\u0628\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u067E\u0627\u0633\u062E \u062F\u0648\u0628\u0627\u0631\u0647 \u0646\u0645\u06CC\u200C\u067E\u0631\u0633\u062F."
  },
  follow_up_none: {
    reason: "\u062F\u0631\u0628\u0627\u0631\u0647\u0654 {question} \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u067E\u0631\u0633\u06CC\u062F\u0646 \u0646\u06CC\u0633\u062A: {why}",
    improvement: null
  },
  consistency_rule: {
    reason: "\u0642\u0627\u0639\u062F\u0647\u0654 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 {rule} \u06CC\u06A9 \u062A\u0646\u0627\u0642\u0636 \u0645\u06CC\u0627\u0646 {ids} \u06AF\u0632\u0627\u0631\u0634 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0627\u06CC\u0646 \u0647\u0645\u0627\u0646 \u0642\u0627\u0639\u062F\u0647\u0654 \u0642\u0637\u0639\u06CC\u0650 \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A \u06A9\u0647 \u0628\u06CC\u200C\u062A\u063A\u06CC\u06CC\u0631 \u0628\u0627\u0632\u06AF\u0648 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    improvement: "\u0628\u0627 \u0645\u0627\u0644\u06A9 \u0631\u0648\u0634\u0646 \u06A9\u0646\u06CC\u062F \u06A9\u062F\u0627\u0645 \u0641\u06CC\u0644\u062F \u062F\u0631\u0633\u062A \u0627\u0633\u062A\u060C \u0633\u067E\u0633 \u062F\u06CC\u06AF\u0631\u06CC \u0631\u0627 \u0627\u0632 \u0645\u0633\u06CC\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u0635\u0644\u0627\u062D \u06A9\u0646\u06CC\u062F."
  },
  consistency_tension: {
    reason: "\u0642\u0627\u0639\u062F\u0647\u0654 {rule}: {ids} \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0647\u0645\u200C\u0632\u0645\u0627\u0646 \u062F\u0631\u0633\u062A \u0628\u0627\u0634\u0646\u062F\u060C \u0627\u0645\u0627 \u0627\u063A\u0644\u0628 \u062F\u0631 \u062F\u0648 \u062C\u0647\u062A \u0645\u062E\u062A\u0644\u0641 \u0645\u06CC\u200C\u06A9\u0634\u0646\u062F. \u0627\u06CC\u0646 \u06CC\u06A9 \u0628\u062F\u0647\u200C\u0628\u0633\u062A\u0627\u0646 \u0627\u062D\u062A\u0645\u0627\u0644\u06CC \u0627\u0633\u062A\u060C \u0646\u0647 \u062A\u0646\u0627\u0642\u0636\u060C \u0648 \u062A\u0627 \u0634\u0645\u0627 \u062A\u0635\u0645\u06CC\u0645 \u0646\u06AF\u06CC\u0631\u06CC\u062F \u0686\u06CC\u0632\u06CC \u0646\u0627\u062F\u0631\u0633\u062A \u0646\u06CC\u0633\u062A.",
    improvement: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u062F\u0631 \u06CC\u06A9 \u062C\u0645\u0644\u0647 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F\u060C \u06CC\u0627 \u0647\u0645\u06CC\u0646\u200C\u0637\u0648\u0631 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F \u0628\u0645\u0627\u0646\u062F: \u0628\u062F\u0647\u200C\u0628\u0633\u062A\u0627\u0646\u0650 \u0622\u06AF\u0627\u0647\u0627\u0646\u0647 \u06CC\u06A9 \u062A\u0635\u0645\u06CC\u0645 \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A."
  },
  consistency_verification: {
    reason: "\u0642\u0627\u0639\u062F\u0647\u0654 {rule}: {ids} \u0627\u062F\u0639\u0627\u06CC\u06CC \u062F\u0627\u0631\u062F \u06A9\u0647 \u0645\u0646\u0628\u0639 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F\u060C \u0648 \u062F\u0631 \u062F\u0641\u062A\u0631 \u0634\u0648\u0627\u0647\u062F \u0647\u06CC\u0686 \u0645\u0646\u0628\u0639 \u0645\u0633\u062A\u0642\u0644 \u0648 \u0628\u0647\u200C\u0631\u0648\u0632\u06CC \u0628\u0631\u0627\u06CC \u0622\u0646 \u0646\u06CC\u0633\u062A. \u0627\u06CC\u0646 \u0627\u062F\u0639\u0627 \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F\u061B \u0645\u0631\u0628\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0686\u06CC\u0632\u06CC \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u062F.",
    improvement: "\u06CC\u06A9 \u0645\u0646\u0628\u0639 \u062B\u0628\u062A \u0648 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F: npm run brand:evidence -- add --claim {ids}. \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0646 \u0627\u062F\u0639\u0627 \u0631\u0627 \u062F\u0631 \u0645\u062A\u0646 \u0639\u0645\u0648\u0645\u06CC \u062A\u06A9\u0631\u0627\u0631 \u0646\u06A9\u0646\u06CC\u062F."
  },
  consistency_none: {
    reason: "\u062F\u0631 {count} \u067E\u0631\u0633\u0634\u0650 \u067E\u0627\u0633\u062E\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647\u200C\u0627\u06CC \u06A9\u0647 \u0645\u0631\u0628\u06CC \u062E\u0648\u0627\u0646\u062F\u060C \u0647\u06CC\u0686 \u062A\u0646\u0627\u0642\u0636\u060C \u0628\u062F\u0647\u200C\u0628\u0633\u062A\u0627\u0646 \u0627\u062D\u062A\u0645\u0627\u0644\u06CC \u06CC\u0627 \u0627\u062F\u0639\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647\u200C\u0627\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F. \u0642\u0627\u0639\u062F\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0646\u062A\u0648\u0627\u0646\u0633\u062A\u0646\u062F \u0627\u062C\u0631\u0627 \u0634\u0648\u0646\u062F \xAB\u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F\xBB \u0641\u0647\u0631\u0633\u062A \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    improvement: null
  }
};
var TR = {
  question_not_applicable: {
    reason: "{question} \u015Fu anda bu marka i\xE7in ge\xE7erli de\u011Fil ({why}; ko\u015Ful: {condition}); yani eksik de\u011Fil, uygulanamaz.",
    improvement: null
  },
  answer_missing: {
    reason: "{question} i\xE7in defterde canl\u0131 bir yan\u0131t yok; bu y\xFCzden de\u011Ferlendirilecek bir \u015Fey de yok.",
    improvement: "Haz\u0131r oldu\u011Funuzda yan\u0131tlay\u0131n: npm run brand:interview -- --question {question}"
  },
  answer_disposition: {
    reason: "{question} {status} olarak kay\u0131tl\u0131. Bu sizin a\xE7\u0131k karar\u0131n\u0131z; ko\xE7 alan\u0131 kapanm\u0131\u015F sayar ve ba\u015Fka soru sormaz.",
    improvement: null
  },
  placeholder_value: {
    reason: "{question} i\xE7in saklanan de\u011Fer \u015Fablonun yer tutucular\u0131ndan biri, sizin karar\u0131n\u0131z de\u011Fil.",
    improvement: "Kendi s\xF6zlerinizle de\u011Fi\u015Ftirin ya da unknown kaydedin; b\xF6ylece alan yan\u0131tlanm\u0131\u015F g\xF6r\xFCnmek yerine d\xFCr\xFCst\xE7e a\xE7\u0131k kal\u0131r."
  },
  vague_terms: {
    reason: "{question} yan\u0131t\u0131 k\u0131sa ve genel ifadelere dayan\u0131yor ({terms}). Hi\xE7bir belge bundan belirli bir iddia \xFCretemez.",
    improvement: "Ger\xE7ekte kastetti\u011Finiz tek durumu adland\u0131r\u0131n: hangi grup, hangi durumda, hangi sorunla."
  },
  too_brief_for_output: {
    reason: "{question} yan\u0131t\u0131nda {words} i\xE7erik s\xF6zc\xFC\u011F\xFC var; {min} s\xF6zc\xFC\u011F\xFCn alt\u0131nda, besledi\u011Fi b\xF6l\xFCmler i\xE7in yeterli de\u011Fil.",
    improvement: "Eksik yar\u0131y\u0131 bir c\xFCmle daha ile ekleyin: nedir, kim i\xE7in, ve burada neden \xF6nemli."
  },
  linked_question_open: {
    reason: "{question} yan\u0131tland\u0131, ama dayand\u0131\u011F\u0131 ba\u011Flant\u0131l\u0131 soru(lar) h\xE2l\xE2 a\xE7\u0131k: {ids}. Bunlar \xE7\xF6z\xFClmedik\xE7e belge b\xF6l\xFCm\xFC eksik kal\u0131r.",
    improvement: "S\u0131rada {ids} var. Bunlar g\xF6r\xFC\u015Fmenin mevcut sorular\u0131; ko\xE7 yeni soru eklemez."
  },
  missing_measure: {
    reason: "{question} bir \xF6l\xE7\xFC istiyor ve saklanan yan\u0131tta say\u0131, d\xF6nem ya da birim yok.",
    improvement: "Ger\xE7ekten sahip oldu\u011Funuz say\u0131y\u0131 d\xF6nemi ve birimiyle yaz\u0131n. Say\u0131 yoksa, olgu gibi okunan bir tahmin yerine unknown kaydedin."
  },
  evidence_not_verified: {
    reason: "{question} kamuya a\xE7\u0131k kullan\u0131mdan \xF6nce do\u011Frulanm\u0131\u015F kan\u0131t gerektiren bir iddia ve kan\u0131t defterinde g\xFCncel, ba\u011F\u0131ms\u0131z bir kaynak yok.",
    improvement: "Bir kaynak kaydedin: npm run brand:evidence -- add --claim {question}. Do\u011Frulama sizin ad\u0131m\u0131n\u0131z olarak kal\u0131r."
  },
  evidence_owner_stated_only: {
    reason: "{question} yaln\u0131zca kendi beyan\u0131n\u0131za dayan\u0131yor. Bu sizin ge\xE7erli ifadenizdir; ba\u011F\u0131ms\u0131z do\u011Frulama de\u011Fildir ve yay\u0131n bunu gerektirir.",
    improvement: "D\u0131\u015Far\u0131dan birinin kontrol edebilece\u011Fi bir kaynak ekleyin, sonra do\u011Frulay\u0131n: npm run brand:evidence -- add --claim {question}"
  },
  field_in_open_conflict: {
    reason: "{question}, g\xF6r\xFC\u015Fme kurallar\u0131ndan gelen {count} a\xE7\u0131k \xE7eli\u015Fkide g\xF6r\xFCn\xFCyor ({rules}). Ko\xE7 yaln\u0131zca bildirir; bu \xE7eli\u015Fkileri ne yaratt\u0131 ne b\xFCy\xFCtt\xFC.",
    improvement: "Hangi alan\u0131n do\u011Fru oldu\u011Funa karar verin, sonra di\u011Ferini normal de\u011Fi\u015Fiklik ak\u0131\u015F\u0131yla d\xFCzeltin ki fark g\xF6r\xFCn\xFCr olsun."
  },
  meets_criteria: {
    reason: "{question} yan\u0131t\u0131, ko\xE7un modelsiz denetleyebildi\u011Fi t\xFCm \xF6l\xE7\xFCtleri ge\xE7iyor: {criteria}. Bu veriye dair bir denetim, karar\u0131n\u0131za dair bir yarg\u0131 de\u011Fil.",
    improvement: null
  },
  facet_ownership_separate: {
    reason: "{question} sahiplik ifadesi i\xE7eriyor. {facet} profilinde bir rol (kurucu, y\xF6netici, dan\u0131\u015Fman) asla sahiplik anlam\u0131na gelmez; sahiplik kendi kan\u0131t\u0131n\u0131 gerektiren ayr\u0131 bir ifadedir.",
    improvement: "{question} alan\u0131n\u0131 yaln\u0131zca role ay\u0131r\u0131n; sahipli\u011Fi a\xE7\u0131k bir sahiplik durumuyla {canonical} i\xE7inde kaydedin."
  },
  facet_companion_open: {
    reason: "{question} yan\u0131tlanm\u0131\u015F, ancak {facet} profilinde ancak {canonical} netle\u015Fti\u011Finde kullan\u0131labilir ve o soru h\xE2l\xE2 a\xE7\u0131k ({rubric}).",
    improvement: "S\u0131radaki soru {canonical}: npm run brand:interview -- --question {canonical}"
  },
  facet_claim_undated: {
    reason: "{question}, {facet} profili i\xE7in kamuya a\xE7\u0131k bir ge\xE7mi\u015F iddias\u0131d\u0131r ve yan\u0131tta y\u0131l yok. Tarihsiz say\u0131lar ve ge\xE7mi\u015F yay\u0131mlanmaz.",
    improvement: "Her maddeye y\u0131l\u0131 (kitle say\u0131lar\u0131 i\xE7in ay\u0131 da) ekleyin ve kayna\u011F\u0131n\u0131 kaydedin: npm run brand:evidence -- add --claim {question}"
  },
  follow_up_canonical: {
    reason: "{question} sonras\u0131ndaki bo\u015Fluk \xAB{criterion}\xBB ve g\xF6r\xFC\u015Fmede bunun i\xE7in zaten bir soru var: {canonical}. Onu sormak tek bir asli yan\u0131t\u0131 korur.",
    improvement: "S\u0131rada {canonical} olsun: npm run brand:interview -- --question {canonical}"
  },
  follow_up_clarify: {
    reason: "Tek bir a\xE7\u0131klay\u0131c\u0131 soru {question} yan\u0131t\u0131n\u0131 {outputs} i\xE7in kullan\u0131labilir k\u0131lar. Eksik boyut \xAB{criterion}\xBB ve mevcut hi\xE7bir soru onu kapsam\u0131yor.",
    improvement: "Kendi s\xF6zlerinizle yan\u0131tlay\u0131n ya da skip, unknown veya decide later deyin \u2014 ko\xE7 bu yan\u0131t i\xE7in bir daha sormaz."
  },
  follow_up_none: {
    reason: "{question} hakk\u0131nda sorulacak bir \u015Fey yok: {why}",
    improvement: null
  },
  consistency_rule: {
    reason: "G\xF6r\xFC\u015Fme kural\u0131 {rule}, {ids} aras\u0131nda bir \xE7eli\u015Fki bildiriyor. Bu, mevcut belirlenimci kural\u0131n oldu\u011Fu gibi aktar\u0131lmas\u0131d\u0131r.",
    improvement: "Hangi alan\u0131n do\u011Fru oldu\u011Funu sahiple netle\u015Ftirin, sonra di\u011Ferini de\u011Fi\u015Fiklik ak\u0131\u015F\u0131yla d\xFCzeltin."
  },
  consistency_tension: {
    reason: "{rule} kural\u0131: {ids} ayn\u0131 anda do\u011Fru olabilir, ancak \xE7o\u011Fu zaman farkl\u0131 y\xF6nlere \xE7eker. Bu bir \xE7eli\u015Fki de\u011Fil, olas\u0131 bir \xF6d\xFCnle\u015Fimdir; siz \xF6yle karar vermedik\xE7e yanl\u0131\u015F bir \u015Fey yok.",
    improvement: "\xD6nerilen soruyu tek c\xFCmleyle yan\u0131tlay\u0131n ya da oldu\u011Fu gibi b\u0131rak\u0131n: bilin\xE7li bir \xF6d\xFCnle\u015Fim ge\xE7erli bir karard\u0131r."
  },
  consistency_verification: {
    reason: "{rule} kural\u0131: {ids} kaynak gerektiren bir iddia i\xE7eriyor ve kan\u0131t kayd\u0131nda bunun i\xE7in g\xFCncel, ba\u011F\u0131ms\u0131z bir kaynak yok. \u0130ddia do\u011Frulanmam\u0131\u015F kal\u0131r; ko\xE7 hi\xE7bir \u015Feyi do\u011Frulayamaz.",
    improvement: "Bir kaynak kaydedip do\u011Frulay\u0131n: npm run brand:evidence -- add --claim {ids}. O zamana kadar iddiay\u0131 kamuya a\xE7\u0131k metinde tekrarlamay\u0131n."
  },
  consistency_none: {
    reason: "Ko\xE7un okudu\u011Fu {count} yan\u0131tlanm\u0131\u015F soruda \xE7eli\u015Fki, olas\u0131 \xF6d\xFCnle\u015Fim ya da do\u011Frulanmam\u0131\u015F iddia bulunmad\u0131. \xC7al\u0131\u015Ft\u0131r\u0131lamayan kurallar test edilmedi olarak listelenir.",
    improvement: null
  }
};
var COACH_TEXT = { en: EN, fa: FA, tr: TR };
var CLARIFY_QUESTIONS = {
  en: {
    relevance: "Setting the placeholder aside: in one sentence, what is your actual answer here?",
    specificity: "Can you name one concrete example (a situation, a piece of work or a result) that shows what you mean?",
    completeness_for_output: "What would you add so this can be used without anyone guessing the rest?",
    measurability: "What figure do you actually have for this, and over what period?",
    evidence_support: "Which public source, such as a registry, a publication or a client's own page, could someone else check for this claim?",
    clarity_coherence: "Of the two statements that disagree, which one should stand, and why?"
  },
  fa: {
    relevance: "\u062C\u0627\u0646\u06AF\u0647\u062F\u0627\u0631 \u0631\u0627 \u06A9\u0646\u0627\u0631 \u0628\u06AF\u0630\u0627\u0631\u06CC\u0645: \u062F\u0631 \u06CC\u06A9 \u062C\u0645\u0644\u0647\u060C \u067E\u0627\u0633\u062E \u0648\u0627\u0642\u0639\u06CC \u0634\u0645\u0627 \u0627\u06CC\u0646\u062C\u0627 \u0686\u06CC\u0633\u062A\u061F",
    specificity: "\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u06CC\u06A9 \u0646\u0645\u0648\u0646\u0647\u0654 \u0645\u0634\u062E\u0635 \u0628\u06CC\u0627\u0648\u0631\u06CC\u062F\u060C \u0645\u062B\u0644\u0627\u064B \u06CC\u06A9 \u0645\u0648\u0642\u0639\u06CC\u062A\u060C \u06CC\u06A9 \u06A9\u0627\u0631 \u06CC\u0627 \u06CC\u06A9 \u0646\u062A\u06CC\u062C\u0647\u060C \u06A9\u0647 \u0645\u0646\u0638\u0648\u0631\u062A\u0627\u0646 \u0631\u0627 \u0646\u0634\u0627\u0646 \u062F\u0647\u062F\u061F",
    completeness_for_output: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0627\u0636\u0627\u0641\u0647 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F \u062A\u0627 \u0628\u062A\u0648\u0627\u0646 \u0627\u06CC\u0646 \u0631\u0627 \u0628\u062F\u0648\u0646 \u062D\u062F\u0633\u200C\u0632\u062F\u0646 \u0628\u0642\u06CC\u0647\u200C\u0627\u0634 \u0628\u0647 \u06A9\u0627\u0631 \u0628\u0631\u062F\u061F",
    measurability: "\u0648\u0627\u0642\u0639\u0627\u064B \u0686\u0647 \u0631\u0642\u0645\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u062F\u0627\u0631\u06CC\u062F \u0648 \u062F\u0631 \u0686\u0647 \u062F\u0648\u0631\u0647\u200C\u0627\u06CC\u061F",
    evidence_support: "\u06A9\u0633 \u062F\u06CC\u06AF\u0631\u06CC \u0627\u06CC\u0646 \u0627\u062F\u0639\u0627 \u0631\u0627 \u0627\u0632 \u06A9\u062F\u0627\u0645 \u0645\u0646\u0628\u0639 \u0639\u0645\u0648\u0645\u06CC \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u062F\u061F \u0645\u062B\u0644\u0627\u064B \u06CC\u06A9 \u062B\u0628\u062A \u0631\u0633\u0645\u06CC\u060C \u06CC\u06A9 \u0646\u0634\u0631\u06CC\u0647 \u06CC\u0627 \u0635\u0641\u062D\u0647\u0654 \u062E\u0648\u062F \u0645\u0634\u062A\u0631\u06CC.",
    clarity_coherence: "\u0627\u0632 \u0622\u0646 \u062F\u0648 \u06AF\u0632\u0627\u0631\u0647 \u06A9\u0647 \u0628\u0627 \u0647\u0645 \u0646\u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u0646\u062F\u060C \u06A9\u062F\u0627\u0645 \u0628\u0627\u06CC\u062F \u0628\u0645\u0627\u0646\u062F \u0648 \u0686\u0631\u0627\u061F"
  },
  tr: {
    relevance: "Yer tutucuyu bir yana b\u0131rakal\u0131m: tek c\xFCmleyle, buradaki ger\xE7ek yan\u0131t\u0131n\u0131z nedir?",
    specificity: "Ne demek istedi\u011Finizi g\xF6steren somut bir \xF6rnek verebilir misiniz: bir durum, bir i\u015F ya da bir sonu\xE7?",
    completeness_for_output: "Geri kalan\u0131 kimse tahmin etmeden kullan\u0131labilsin diye ne eklerdiniz?",
    measurability: "Bunun i\xE7in ger\xE7ekte hangi say\u0131ya sahipsiniz ve hangi d\xF6nem i\xE7in?",
    evidence_support: "Bu iddiay\u0131 ba\u015Fka biri hangi kamuya a\xE7\u0131k kaynaktan kontrol edebilir? \xD6rne\u011Fin bir sicil kayd\u0131, bir yay\u0131n ya da m\xFC\u015Fterinin kendi sayfas\u0131.",
    clarity_coherence: "Birbiriyle \xE7eli\u015Fen iki ifadeden hangisi kalmal\u0131 ve neden?"
  }
};
var AUDIENCE_ID = /(?:^|[._])(?:audience|segment|segments|customer|buyer|target_clients|persona|personas|icp|pains)(?:$|[._])/;
var BOUNDARIES_ID = /(?:^|[._])(?:boundaries|never_publish|avoid|forbidden|misuse|unacceptable|guardrail|confidentiality|public_claim_policy)(?:$|[._])/;
function questionFamily(questionId) {
  if (BOUNDARIES_ID.test(questionId)) return "boundaries";
  if (AUDIENCE_ID.test(questionId)) return "audience";
  return "general";
}
var CLARIFY_FAMILY_QUESTIONS = {
  en: {
    audience: { specificity: "Which single group or situation do you mean, and what is their main problem?" },
    boundaries: { specificity: "Which specific topics, requests or uses are off-limits, and what should happen when someone asks for one?" }
  },
  fa: {
    audience: { specificity: "\u06A9\u062F\u0627\u0645 \u06CC\u06A9 \u06AF\u0631\u0648\u0647 \u06CC\u0627 \u0645\u0648\u0642\u0639\u06CC\u062A \u0631\u0627 \u062F\u0631 \u0646\u0638\u0631 \u062F\u0627\u0631\u06CC\u062F \u0648 \u0645\u0633\u0626\u0644\u0647\u0654 \u0627\u0635\u0644\u06CC\u200C\u0634\u0627\u0646 \u0686\u06CC\u0633\u062A\u061F" },
    boundaries: { specificity: "\u062F\u0642\u06CC\u0642\u0627\u064B \u06A9\u062F\u0627\u0645 \u0645\u0648\u0636\u0648\u0639\u200C\u0647\u0627\u060C \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627 \u06CC\u0627 \u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627 \u062E\u0627\u0631\u062C \u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u0647\u200C\u0627\u0646\u062F \u0648 \u0648\u0642\u062A\u06CC \u06A9\u0633\u06CC \u06CC\u06A9\u06CC \u0627\u0632 \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u0628\u062E\u0648\u0627\u0647\u062F \u0686\u0647 \u0628\u0627\u06CC\u062F \u06A9\u0631\u062F\u061F" }
  },
  tr: {
    audience: { specificity: "Hangi tek grubu ya da durumu kastediyorsunuz ve ana sorunlar\u0131 nedir?" },
    boundaries: { specificity: "Tam olarak hangi konular, talepler ya da kullan\u0131mlar kapsam d\u0131\u015F\u0131nda ve biri bunlardan birini istedi\u011Finde ne yap\u0131lmal\u0131?" }
  }
};
function clarifyQuestion(locale, criterion, questionId) {
  const family = questionFamily(questionId);
  const override = family === "general" ? void 0 : CLARIFY_FAMILY_QUESTIONS[locale][family][criterion];
  return override ?? CLARIFY_QUESTIONS[locale][criterion];
}
var CRITERION_NAMES = {
  en: {
    relevance: "relevance",
    specificity: "specificity",
    completeness_for_output: "completeness for the documents it feeds",
    measurability: "measurability",
    evidence_support: "evidence support",
    clarity_coherence: "clarity and internal coherence"
  },
  fa: {
    relevance: "\u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u067E\u0631\u0633\u0634",
    specificity: "\u0645\u0634\u062E\u0635\u200C\u0628\u0648\u062F\u0646",
    completeness_for_output: "\u06A9\u0627\u0645\u0644\u200C\u0628\u0648\u062F\u0646 \u0628\u0631\u0627\u06CC \u0627\u0633\u0646\u0627\u062F\u06CC \u06A9\u0647 \u062A\u063A\u0630\u06CC\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F",
    measurability: "\u0642\u0627\u0628\u0644\u200C\u0633\u0646\u062C\u0634\u200C\u0628\u0648\u062F\u0646",
    evidence_support: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0634\u0647\u0648\u062F",
    clarity_coherence: "\u0631\u0648\u0634\u0646\u06CC \u0648 \u0633\u0627\u0632\u06AF\u0627\u0631\u06CC \u062F\u0631\u0648\u0646\u06CC"
  },
  tr: {
    relevance: "soruyla ilgililik",
    specificity: "belirlilik",
    completeness_for_output: "besledi\u011Fi belgeler i\xE7in b\xFCt\xFCnl\xFCk",
    measurability: "\xF6l\xE7\xFClebilirlik",
    evidence_support: "kan\u0131t deste\u011Fi",
    clarity_coherence: "a\xE7\u0131kl\u0131k ve i\xE7 tutarl\u0131l\u0131k"
  }
};
var STATUS_NAMES = {
  en: {
    ready: "ready",
    needs_clarification: "needs clarification",
    evidence_missing: "evidence missing",
    needs_review: "needs review",
    not_applicable: "not applicable",
    insufficient_context: "insufficient context"
  },
  fa: {
    ready: "\u0622\u0645\u0627\u062F\u0647",
    needs_clarification: "\u0646\u06CC\u0627\u0632\u0645\u0646\u062F \u0631\u0648\u0634\u0646\u200C\u0633\u0627\u0632\u06CC",
    evidence_missing: "\u0634\u0647\u0648\u062F \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A",
    needs_review: "\u0646\u06CC\u0627\u0632\u0645\u0646\u062F \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC",
    not_applicable: "\u0646\u0627\u0645\u0631\u062A\u0628\u0637",
    insufficient_context: "\u0632\u0645\u06CC\u0646\u0647\u0654 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A"
  },
  tr: {
    ready: "haz\u0131r",
    needs_clarification: "a\xE7\u0131klama gerekiyor",
    evidence_missing: "kan\u0131t eksik",
    needs_review: "inceleme gerekiyor",
    not_applicable: "uygulanamaz",
    insufficient_context: "ba\u011Flam yetersiz"
  }
};
var NO_FOLLOW_UP_TEXT = {
  en: {
    question_inapplicable: "the question does not apply to this brand under its current configuration and answers.",
    answer_settled: "you recorded an explicit decision (unknown, skip or not relevant), and the coach never reopens one.",
    answer_open: "the question has no live answer yet, so a follow-up would come before the question itself.",
    quality_ready: "the answer passes every criterion the coach can check, so one more question would only add fatigue.",
    already_deferred: 'the question that would close the gap is on your "decide later" list, which the coach treats as a decline.'
  },
  fa: {
    question_inapplicable: "\u0627\u06CC\u0646 \u067E\u0631\u0633\u0634 \u0628\u0627 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0645\u0631\u062A\u0628\u0637 \u0646\u06CC\u0633\u062A.",
    answer_settled: "\u0634\u0645\u0627 \u062A\u0635\u0645\u06CC\u0645 \u0635\u0631\u06CC\u062D\u06CC \u062B\u0628\u062A \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F (unknown\u060C skip \u06CC\u0627 \u0646\u0627\u0645\u0631\u062A\u0628\u0637) \u0648 \u0645\u0631\u0628\u06CC \u0647\u0631\u06AF\u0632 \u0622\u0646 \u0631\u0627 \u0628\u0627\u0632\u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    answer_open: "\u0627\u06CC\u0646 \u067E\u0631\u0633\u0634 \u0647\u0646\u0648\u0632 \u067E\u0627\u0633\u062E \u0641\u0639\u0627\u0644\u06CC \u0646\u062F\u0627\u0631\u062F\u061B \u067E\u0633 \u067E\u0631\u0633\u0634 \u062A\u06A9\u0645\u06CC\u0644\u06CC \u067E\u06CC\u0634 \u0627\u0632 \u062E\u0648\u062F\u0650 \u067E\u0631\u0633\u0634 \u0645\u06CC\u200C\u0622\u0645\u062F.",
    quality_ready: "\u067E\u0627\u0633\u062E \u0647\u0645\u0647\u0654 \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC \u0642\u0627\u0628\u0644\u200C\u0633\u0646\u062C\u0634 \u0645\u0631\u0628\u06CC \u0631\u0627 \u0645\u06CC\u200C\u06AF\u0630\u0631\u0627\u0646\u062F\u061B \u06CC\u06A9 \u067E\u0631\u0633\u0634 \u0628\u06CC\u0634\u062A\u0631 \u0641\u0642\u0637 \u062E\u0633\u062A\u06AF\u06CC \u0645\u06CC\u200C\u0627\u0641\u0632\u0627\u06CC\u062F.",
    already_deferred: "\u067E\u0631\u0633\u0634\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u0634\u06A9\u0627\u0641 \u0631\u0627 \u0645\u06CC\u200C\u0628\u0633\u062A \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \xAB\u0628\u0639\u062F\u0627\u064B \u062A\u0635\u0645\u06CC\u0645 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u0645\xBB \u0634\u0645\u0627\u0633\u062A \u0648 \u0645\u0631\u0628\u06CC \u0622\u0646 \u0631\u0627 \u0627\u0646\u0635\u0631\u0627\u0641 \u0645\u06CC\u200C\u062F\u0627\u0646\u062F."
  },
  tr: {
    question_inapplicable: "soru, bu markan\u0131n mevcut yap\u0131land\u0131rmas\u0131 ve yan\u0131tlar\u0131yla ge\xE7erli de\u011Fil.",
    answer_settled: "a\xE7\u0131k bir karar kaydettiniz (unknown, skip ya da ilgisiz) ve ko\xE7 bunu asla yeniden a\xE7maz.",
    answer_open: "sorunun hen\xFCz canl\u0131 bir yan\u0131t\u0131 yok; ek soru, sorunun kendisinden \xF6nce gelmi\u015F olurdu.",
    quality_ready: "yan\u0131t ko\xE7un denetleyebildi\u011Fi t\xFCm \xF6l\xE7\xFCtleri ge\xE7iyor; bir soru daha yaln\u0131zca yorgunluk katard\u0131.",
    already_deferred: "bo\u015Flu\u011Fu kapatacak soru \xABsonra karar ver\xBB listenizde ve ko\xE7 bunu bir ret sayar."
  }
};
var TENSION_QUESTIONS = {
  en: {
    "premium-vs-lowest-price": "Is the low price a deliberate entry or launch offer for a premium brand, or is the brand moving towards a value position? Which one should the documents say?",
    "availability-held-back": "The product is recorded as available, but public wording may not say so yet. Is this a deliberate staged or quiet launch, and until when?"
  },
  fa: {
    "premium-vs-lowest-price": "\u0622\u06CC\u0627 \u0642\u06CC\u0645\u062A \u067E\u0627\u06CC\u06CC\u0646 \u06CC\u06A9 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0648\u0631\u0648\u062F\u06CC \u06CC\u0627 \u0627\u0641\u062A\u062A\u0627\u062D\u06CC\u0647\u0654 \u0622\u06AF\u0627\u0647\u0627\u0646\u0647 \u0628\u0631\u0627\u06CC \u06CC\u06A9 \u0628\u0631\u0646\u062F \u0645\u0645\u062A\u0627\u0632 \u0627\u0633\u062A\u060C \u06CC\u0627 \u0628\u0631\u0646\u062F \u0628\u0647 \u0633\u0645\u062A \u062C\u0627\u06CC\u06AF\u0627\u0647 \xAB\u0628\u0647\u200C\u0635\u0631\u0641\u0647\xBB \u0645\u06CC\u200C\u0631\u0648\u062F\u061F \u0627\u0633\u0646\u0627\u062F \u06A9\u062F\u0627\u0645 \u0631\u0627 \u0628\u06AF\u0648\u06CC\u0646\u062F\u061F",
    "availability-held-back": "\u0645\u062D\u0635\u0648\u0644 \xAB\u062F\u0631 \u062F\u0633\u062A\u0631\u0633\xBB \u062B\u0628\u062A \u0634\u062F\u0647\u060C \u0627\u0645\u0627 \u0645\u062A\u0646 \u0639\u0645\u0648\u0645\u06CC \u0647\u0646\u0648\u0632 \u0627\u062C\u0627\u0632\u0647 \u0646\u062F\u0627\u0631\u062F \u0627\u06CC\u0646 \u0631\u0627 \u0628\u06AF\u0648\u06CC\u062F. \u0622\u06CC\u0627 \u0627\u06CC\u0646 \u06CC\u06A9 \u0639\u0631\u0636\u0647\u0654 \u0645\u0631\u062D\u0644\u0647\u200C\u0627\u06CC \u06CC\u0627 \u0628\u06CC\u200C\u0633\u0631\u0648\u0635\u062F\u0627\u06CC \u0622\u06AF\u0627\u0647\u0627\u0646\u0647 \u0627\u0633\u062A\u060C \u0648 \u062A\u0627 \u0686\u0647 \u0632\u0645\u0627\u0646\u06CC\u061F"
  },
  tr: {
    "premium-vs-lowest-price": "D\xFC\u015F\xFCk fiyat, premium bir marka i\xE7in bilin\xE7li bir giri\u015F ya da lansman teklifi mi, yoksa marka uygun fiyat konumuna m\u0131 kay\u0131yor? Belgeler hangisini s\xF6ylemeli?",
    "availability-held-back": "\xDCr\xFCn mevcut olarak kay\u0131tl\u0131, ancak kamuya a\xE7\u0131k metin bunu hen\xFCz s\xF6yleyemiyor. Bu bilin\xE7li, a\u015Famal\u0131 ya da sessiz bir lansman m\u0131 ve ne zamana kadar?"
  }
};
var RULE_OUTCOME_NAMES = {
  en: {
    confirmed_conflict: "confirmed conflict",
    potential_tension: "possible trade-off (a question, not an error)",
    needs_verification: "needs a verified source",
    no_finding: "checked, nothing found",
    not_tested: "not tested (an input is still open)"
  },
  fa: {
    confirmed_conflict: "\u062A\u0646\u0627\u0642\u0636 \u0642\u0637\u0639\u06CC",
    potential_tension: "\u0628\u062F\u0647\u200C\u0628\u0633\u062A\u0627\u0646 \u0627\u062D\u062A\u0645\u0627\u0644\u06CC (\u06CC\u06A9 \u067E\u0631\u0633\u0634\u060C \u0646\u0647 \u062E\u0637\u0627)",
    needs_verification: "\u0628\u0647 \u0645\u0646\u0628\u0639 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F",
    no_finding: "\u0628\u0631\u0631\u0633\u06CC \u0634\u062F\u060C \u0686\u06CC\u0632\u06CC \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F",
    not_tested: "\u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F (\u06CC\u06A9\u06CC \u0627\u0632 \u0648\u0631\u0648\u062F\u06CC\u200C\u0647\u0627 \u0647\u0646\u0648\u0632 \u0628\u0627\u0632 \u0627\u0633\u062A)"
  },
  tr: {
    confirmed_conflict: "kesin \xE7eli\u015Fki",
    potential_tension: "olas\u0131 \xF6d\xFCnle\u015Fim (bir soru, hata de\u011Fil)",
    needs_verification: "do\u011Frulanm\u0131\u015F kaynak gerekiyor",
    no_finding: "denetlendi, bulgu yok",
    not_tested: "test edilmedi (bir girdi h\xE2l\xE2 a\xE7\u0131k)"
  }
};
var COACH_UI = {
  en: {
    title: "Strategic coach",
    advisory: "Advisory only. Nothing here is a brand fact, an approval or a change. The coach wrote nothing.",
    mode: "Mode",
    question: "Question",
    status: "Status",
    findings: "Findings",
    none: "No findings.",
    ask: "Suggested question",
    useExisting: "Use the existing question",
    improvement: "Next step",
    improves: "Improves",
    sources: "Read",
    noModel: "No model was called. Every finding is deterministic.",
    changeFlow: "This field is approved. Changing it needs the human change flow, not the coach.",
    momentTitle: "Coach (optional, nothing was changed)",
    momentAsk: "Worth one more sentence",
    momentAfterHint: 'Add detail with "change {question}: \u2026", or just continue. This note will not come back for this answer.',
    momentAnswerFirst: "answer the existing question first:",
    momentApproveTitle: "Coach notes before you approve (advisory; nothing is blocked):",
    momentMore: "{count} more: npm run brand:coach -- analyze --mode quality_review --question <id>",
    momentApproveFoot: "Approving is your decision. The coach changed nothing and authorizes nothing.",
    theInterview: "the interview",
    nextNoAnswer: "Answer a question first (npm run brand:interview), or name one: npm run brand:coach -- analyze --mode follow_up --question <id>",
    module_disabled: "its module is turned off",
    skip_condition: "an earlier answer makes it unnecessary",
    ruleChecks: "Rules checked",
    ruleGuard: "a recognised exception applied"
  },
  fa: {
    title: "\u0645\u0631\u0628\u06CC \u0631\u0627\u0647\u0628\u0631\u062F\u06CC",
    advisory: "\u0641\u0642\u0637 \u0645\u0634\u0648\u0631\u062A\u06CC. \u0647\u06CC\u0686\u200C\u0686\u06CC\u0632\u0650 \u0627\u06CC\u0646\u062C\u0627 \u0648\u0627\u0642\u0639\u06CC\u062A \u0628\u0631\u0646\u062F\u060C \u062A\u0623\u06CC\u06CC\u062F \u06CC\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06CC\u0633\u062A. \u0645\u0631\u0628\u06CC \u0686\u06CC\u0632\u06CC \u0646\u0646\u0648\u0634\u062A.",
    mode: "\u062D\u0627\u0644\u062A",
    question: "\u067E\u0631\u0633\u0634",
    status: "\u0648\u0636\u0639\u06CC\u062A",
    findings: "\u06CC\u0627\u0641\u062A\u0647\u200C\u0647\u0627",
    none: "\u06CC\u0627\u0641\u062A\u0647\u200C\u0627\u06CC \u0646\u06CC\u0633\u062A.",
    ask: "\u067E\u0631\u0633\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
    useExisting: "\u0627\u0632 \u067E\u0631\u0633\u0634 \u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F",
    improvement: "\u06AF\u0627\u0645 \u0628\u0639\u062F",
    improves: "\u0628\u0647\u0628\u0648\u062F \u0645\u06CC\u200C\u062F\u0647\u062F",
    sources: "\u062E\u0648\u0627\u0646\u062F\u0647\u200C\u0634\u062F\u0647",
    noModel: "\u0647\u06CC\u0686 \u0645\u062F\u0644\u06CC \u0641\u0631\u0627\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F. \u0647\u0645\u0647\u0654 \u06CC\u0627\u0641\u062A\u0647\u200C\u0647\u0627 \u0642\u0637\u0639\u06CC\u200C\u0627\u0646\u062F.",
    changeFlow: "\u0627\u06CC\u0646 \u0641\u06CC\u0644\u062F \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0627\u0633\u062A. \u062A\u063A\u06CC\u06CC\u0631\u0634 \u0628\u0647 \u0645\u0633\u06CC\u0631 \u0627\u0646\u0633\u0627\u0646\u06CC\u0650 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F\u060C \u0646\u0647 \u0628\u0647 \u0645\u0631\u0628\u06CC.",
    momentTitle: "\u0645\u0631\u0628\u06CC (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC\u060C \u0686\u06CC\u0632\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F)",
    momentAsk: "\u06CC\u06A9 \u062C\u0645\u0644\u0647\u0654 \u062F\u06CC\u06AF\u0631 \u0627\u0631\u0632\u0634\u0634 \u0631\u0627 \u062F\u0627\u0631\u062F",
    momentAfterHint: "\u0628\u0627 \xABchange {question}: \u2026\xBB \u062C\u0632\u0626\u06CC\u0627\u062A \u0628\u06CC\u0641\u0632\u0627\u06CC\u06CC\u062F \u06CC\u0627 \u0647\u0645\u06CC\u0646\u200C\u0637\u0648\u0631 \u0627\u062F\u0627\u0645\u0647 \u062F\u0647\u06CC\u062F. \u0627\u06CC\u0646 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u067E\u0627\u0633\u062E \u062F\u0648\u0628\u0627\u0631\u0647 \u0646\u0645\u06CC\u200C\u0622\u06CC\u062F.",
    momentAnswerFirst: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0645\u0648\u062C\u0648\u062F \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F:",
    momentApproveTitle: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u0645\u0631\u0628\u06CC \u067E\u06CC\u0634 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F (\u0645\u0634\u0648\u0631\u062A\u06CC\u061B \u0686\u06CC\u0632\u06CC \u0645\u0633\u062F\u0648\u062F \u0646\u0645\u06CC\u200C\u0634\u0648\u062F):",
    momentMore: "{count} \u0645\u0648\u0631\u062F \u062F\u06CC\u06AF\u0631: npm run brand:coach -- analyze --mode quality_review --question <id>",
    momentApproveFoot: "\u062A\u0623\u06CC\u06CC\u062F \u062A\u0635\u0645\u06CC\u0645 \u0634\u0645\u0627\u0633\u062A. \u0645\u0631\u0628\u06CC \u0686\u06CC\u0632\u06CC \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u062F\u0627\u062F \u0648 \u0627\u062C\u0627\u0632\u0647\u0654 \u0647\u06CC\u0686 \u06A9\u0627\u0631\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    theInterview: "\u0645\u0635\u0627\u062D\u0628\u0647",
    nextNoAnswer: "\u0627\u0648\u0644 \u0628\u0647 \u06CC\u06A9 \u067E\u0631\u0633\u0634 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F (npm run brand:interview)\u060C \u06CC\u0627 \u067E\u0631\u0633\u0634\u06CC \u0631\u0627 \u0646\u0627\u0645 \u0628\u0628\u0631\u06CC\u062F: npm run brand:coach -- analyze --mode follow_up --question <id>",
    module_disabled: "\u0645\u0627\u0698\u0648\u0644 \u0622\u0646 \u062E\u0627\u0645\u0648\u0634 \u0627\u0633\u062A",
    skip_condition: "\u06CC\u06A9 \u067E\u0627\u0633\u062E \u0642\u0628\u0644\u06CC \u0622\u0646 \u0631\u0627 \u063A\u06CC\u0631\u0644\u0627\u0632\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A",
    ruleChecks: "\u0642\u0627\u0639\u062F\u0647\u200C\u0647\u0627\u06CC \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647",
    ruleGuard: "\u06CC\u06A9 \u0627\u0633\u062A\u062B\u0646\u0627\u06CC \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0627\u0639\u0645\u0627\u0644 \u0634\u062F"
  },
  tr: {
    title: "Stratejik ko\xE7",
    advisory: "Yaln\u0131zca tavsiye. Buradaki hi\xE7bir \u015Fey marka olgusu, onay ya da de\u011Fi\u015Fiklik de\u011Fildir. Ko\xE7 hi\xE7bir \u015Fey yazmad\u0131.",
    mode: "Kip",
    question: "Soru",
    status: "Durum",
    findings: "Bulgular",
    none: "Bulgu yok.",
    ask: "\xD6nerilen soru",
    useExisting: "Mevcut soruyu kullan\u0131n",
    improvement: "Sonraki ad\u0131m",
    improves: "\u0130yile\u015Ftirdi\u011Fi",
    sources: "Okunan",
    noModel: "Hi\xE7bir model \xE7a\u011Fr\u0131lmad\u0131. T\xFCm bulgular belirlenimcidir.",
    changeFlow: "Bu alan onayl\u0131. De\u011Fi\u015Ftirmek ko\xE7u de\u011Fil, insan de\u011Fi\u015Fiklik ak\u0131\u015F\u0131n\u0131 gerektirir.",
    momentTitle: "Ko\xE7 (iste\u011Fe ba\u011Fl\u0131, hi\xE7bir \u015Fey de\u011Fi\u015Fmedi)",
    momentAsk: "Bir c\xFCmle daha de\u011Fer",
    momentAfterHint: 'Ayr\u0131nt\u0131 eklemek i\xE7in "change {question}: \u2026" yaz\u0131n ya da devam edin. Bu not bu yan\u0131t i\xE7in bir daha gelmez.',
    momentAnswerFirst: "mevcut soruyu yan\u0131tlay\u0131n:",
    momentApproveTitle: "Onaylamadan \xF6nce ko\xE7 notlar\u0131 (tavsiye; hi\xE7bir \u015Fey engellenmez):",
    momentMore: "{count} tane daha: npm run brand:coach -- analyze --mode quality_review --question <id>",
    momentApproveFoot: "Onaylamak sizin karar\u0131n\u0131z. Ko\xE7 hi\xE7bir \u015Feyi de\u011Fi\u015Ftirmedi ve hi\xE7bir \u015Feye yetki vermez.",
    theInterview: "g\xF6r\xFC\u015Fme",
    nextNoAnswer: "\xD6nce bir soruyu yan\u0131tlay\u0131n (npm run brand:interview) ya da bir soru belirtin: npm run brand:coach -- analyze --mode follow_up --question <id>",
    module_disabled: "mod\xFCl\xFC kapal\u0131",
    skip_condition: "\xF6nceki bir yan\u0131t onu gereksiz k\u0131l\u0131yor",
    ruleChecks: "Denetlenen kurallar",
    ruleGuard: "tan\u0131nm\u0131\u015F bir istisna uyguland\u0131"
  }
};
function coachUi(locale, key) {
  return COACH_UI[locale][key] ?? COACH_UI.en[key] ?? key;
}
function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_match, name) => vars[name] ?? `{${name}}`);
}
function coachText(locale, code, vars = {}) {
  const phrase = COACH_TEXT[locale][code] ?? COACH_TEXT.en[code];
  return { reason: fill(phrase.reason, vars), improvement: phrase.improvement === null ? null : fill(phrase.improvement, vars) };
}

// packages/brand-core/src/coach/lexicon.ts
var VAGUE_MARKERS = {
  en: [
    "everyone",
    "anyone",
    "everybody",
    "all businesses",
    "all companies",
    "any business",
    "high quality",
    "best quality",
    "best in class",
    "world class",
    "world-class",
    "cutting edge",
    "cutting-edge",
    "state of the art",
    "innovative",
    "synergy",
    "various",
    "and more",
    "etc",
    "etc.",
    "many things",
    "a lot of things",
    "stuff",
    "things like that",
    "something like that",
    "good price",
    "great service"
  ],
  fa: [
    "\u0647\u0645\u0647",
    "\u0647\u0645\u0647 \u0627\u0641\u0631\u0627\u062F",
    "\u0647\u0631 \u06A9\u0633\u06CC",
    "\u0647\u0631\u06A9\u0633\u06CC",
    "\u0647\u0645\u0647 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627",
    "\u0647\u0645\u0647 \u0634\u0631\u06A9\u062A\u200C\u0647\u0627",
    "\u0628\u0627\u06A9\u06CC\u0641\u06CC\u062A",
    "\u0628\u0627 \u06A9\u06CC\u0641\u06CC\u062A \u0628\u0627\u0644\u0627",
    "\u0628\u0647\u062A\u0631\u06CC\u0646 \u06A9\u06CC\u0641\u06CC\u062A",
    "\u0628\u0647\u062A\u0631\u06CC\u0646 \u062F\u0631 \u0628\u0627\u0632\u0627\u0631",
    "\u062F\u0631 \u0633\u0637\u062D \u062C\u0647\u0627\u0646\u06CC",
    "\u0646\u0648\u0622\u0648\u0631\u0627\u0646\u0647",
    "\u0648 \u063A\u06CC\u0631\u0647",
    "\u0648 \u0645\u0648\u0627\u0631\u062F \u0645\u0634\u0627\u0628\u0647",
    "\u0686\u06CC\u0632\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641",
    "\u062E\u06CC\u0644\u06CC \u0686\u06CC\u0632\u0647\u0627",
    "\u0642\u06CC\u0645\u062A \u062E\u0648\u0628",
    "\u062E\u062F\u0645\u0627\u062A \u062E\u0648\u0628"
  ],
  tr: [
    "herkes",
    "her i\u015Fletme",
    "t\xFCm i\u015Fletmeler",
    "t\xFCm \u015Firketler",
    "kaliteli",
    "y\xFCksek kaliteli",
    "en iyi kalite",
    "d\xFCnya standartlar\u0131nda",
    "yenilik\xE7i",
    "ve benzeri",
    "vb",
    "vb.",
    "\xE7e\u015Fitli \u015Feyler",
    "bir s\xFCr\xFC \u015Fey",
    "iyi fiyat",
    "iyi hizmet"
  ]
};
var PLACEHOLDER = /^(tbd|to be decided|todo|n\/?a|none|-+|\.+|\?+|example|example only)$/i;
var EXAMPLE_PREFIX = /^(example only|example|نمونه|örnek)\s*[:：-]/i;
var MEASURE_ID = /\.(objective|objectives|metric|metrics|kpi|kpis|okr|okrs|target|targets|baseline|budget|price|pricing|runway)$/;
var QUALITY_THRESHOLDS = {
  /** Content words below which a long_text answer cannot fill a document section. */
  longTextWords: 8,
  /** Content words below which a short_text answer says almost nothing. */
  shortTextWords: 2,
  /** A vague marker counts as a deficit only while the answer is this short or shorter. */
  vagueWordGate: 25
};
function normalizeForMatch(text) {
  return asciiDigits(text).normalize("NFKC").toLocaleLowerCase("en").replace(/[يى]/g, "\u06CC").replace(/ك/g, "\u06A9").replace(/[‌ـ]/g, "").replace(/̇/g, "");
}
function containsTerm(text, term) {
  const haystack = normalizeForMatch(text);
  const needle = normalizeForMatch(term);
  if (!needle) return false;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    const before = index === 0 ? "" : haystack[index - 1] ?? "";
    const after = haystack[index + needle.length] ?? "";
    if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) return true;
    index = haystack.indexOf(needle, index + 1);
  }
  return false;
}
function vagueMarkersIn(text) {
  const found = /* @__PURE__ */ new Set();
  for (const terms of Object.values(VAGUE_MARKERS)) {
    for (const term of terms) if (containsTerm(text, term)) found.add(term);
  }
  return [...found].sort();
}
function contentWordCount(text) {
  return text.split(/\s+/).map((token) => token.replace(/[\p{P}\p{S}]/gu, "")).filter((token) => token.length > 0).length;
}
function isPlaceholderValue(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return PLACEHOLDER.test(trimmed) || EXAMPLE_PREFIX.test(trimmed);
}
function expectsMeasure(question) {
  return question.question_type === "number" || MEASURE_ID.test(question.id);
}
function hasDigit(text) {
  return /\d/.test(asciiDigits(text));
}
var SHORT_BY_DESIGN_IDS = /* @__PURE__ */ new Set(["brand.verbal.tagline", "brand.strategy.promise"]);
function minWordsFor(question) {
  if (SHORT_BY_DESIGN_IDS.has(question.id)) return 1;
  if (question.question_type === "long_text") return QUALITY_THRESHOLDS.longTextWords;
  if (question.question_type === "short_text") return QUALITY_THRESHOLDS.shortTextWords;
  return 1;
}
function isFreeText(question) {
  return question.question_type === "long_text" || question.question_type === "short_text";
}

// packages/brand-core/src/coach/quality.ts
var CRITERION_PRIORITY = ["relevance", "evidence_support", "clarity_coherence", "specificity", "completeness_for_output", "measurability"];
var STATUS_PRIORITY = ["insufficient_context", "not_applicable", "needs_review", "evidence_missing", "needs_clarification", "ready"];
function criterionList(locale, criteria) {
  return criteria.map((criterion) => CRITERION_NAMES[locale][criterion]).join(", ");
}
function assessAnswer(ctx, question, locale = "en") {
  const answer = liveAnswer(ctx, question.id);
  const ref = [{ kind: "question", id: question.id }];
  const answerRef = () => answer ? [...ref, { kind: "answer", id: answer.answer_id, revision: answer.answer_id }] : ref;
  const inapplicable = notApplicableReason(ctx, question);
  if (inapplicable) {
    return {
      question,
      answer,
      status: "not_applicable",
      findings: [
        {
          code: "question_not_applicable",
          criterion: null,
          status: "not_applicable",
          vars: { question: question.id, why: coachUi(locale, inapplicable), condition: question.skip_when ?? "\u2014" },
          relatedIds: [],
          sourceRefs: [...ref, { kind: "config", id: inapplicable }]
        }
      ],
      checked: [],
      settled: true,
      approved: answer?.status === "approved"
    };
  }
  if (!answer) {
    return {
      question,
      answer: void 0,
      status: "insufficient_context",
      findings: [{ code: "answer_missing", criterion: null, status: "insufficient_context", vars: { question: question.id }, relatedIds: [], sourceRefs: ref }],
      checked: [],
      settled: true,
      approved: false
    };
  }
  if (isDisposition(ctx.answers.get(question.id))) {
    return {
      question,
      answer,
      status: "not_applicable",
      findings: [{ code: "answer_disposition", criterion: null, status: "not_applicable", vars: { question: question.id, status: answer.status }, relatedIds: [], sourceRefs: answerRef() }],
      checked: [],
      settled: true,
      approved: answer.status === "approved"
    };
  }
  const text = answerText(answer);
  const findings = [];
  const checked = [];
  checked.push("relevance");
  if (isPlaceholderValue(text)) {
    findings.push({ code: "placeholder_value", criterion: "relevance", status: "needs_review", vars: { question: question.id }, relatedIds: [], sourceRefs: answerRef() });
  }
  if (question.publication_requires?.includes("verified_evidence")) {
    checked.push("evidence_support");
    const verification = verificationOf(ctx, question);
    if (verification === "unverified") {
      findings.push({ code: "evidence_not_verified", criterion: "evidence_support", status: "evidence_missing", vars: { question: question.id }, relatedIds: [], sourceRefs: [...answerRef(), { kind: "evidence", id: question.id }] });
    } else if (verification === "owner_stated" || verification === "owner_published") {
      findings.push({ code: "evidence_owner_stated_only", criterion: "evidence_support", status: "evidence_missing", vars: { question: question.id }, relatedIds: [], sourceRefs: [...answerRef(), { kind: "evidence", id: question.id }] });
    }
  }
  checked.push("clarity_coherence");
  const conflicts = conflictsFor(ctx, question.id);
  if (conflicts.length > 0) {
    findings.push({
      code: "field_in_open_conflict",
      criterion: "clarity_coherence",
      status: "needs_review",
      vars: { question: question.id, count: String(conflicts.length), rules: conflicts.map((item) => item.rule).join(", ") },
      relatedIds: [...new Set(conflicts.flatMap((item) => item.fields))].filter((id) => id !== question.id).sort(),
      sourceRefs: [...answerRef(), ...conflicts.map((item) => ({ kind: "contradiction", id: item.id }))]
    });
  }
  if (isFreeText(question)) {
    checked.push("specificity");
    const words = contentWordCount(text);
    const min = minWordsFor(question);
    if (words < min) {
      findings.push({ code: "too_brief_for_output", criterion: "specificity", status: "needs_clarification", vars: { question: question.id, words: String(words), min: String(min) }, relatedIds: [], sourceRefs: answerRef() });
    } else {
      const markers = vagueMarkersIn(text);
      if (markers.length > 0 && words <= QUALITY_THRESHOLDS.vagueWordGate) {
        findings.push({ code: "vague_terms", criterion: "specificity", status: "needs_clarification", vars: { question: question.id, terms: markers.join(", ") }, relatedIds: [], sourceRefs: answerRef() });
      }
    }
  }
  const linked = openLinked(ctx, question);
  if (question.depends_on.length > 0) checked.push("completeness_for_output");
  if (linked.length > 0) {
    findings.push({
      code: "linked_question_open",
      criterion: "completeness_for_output",
      status: "needs_clarification",
      vars: { question: question.id, ids: linked.join(", ") },
      relatedIds: linked,
      sourceRefs: [...answerRef(), ...linked.map((id) => ({ kind: "question", id }))]
    });
  }
  if (expectsMeasure(question)) {
    checked.push("measurability");
    if (!hasDigit(text)) {
      findings.push({ code: "missing_measure", criterion: "measurability", status: "needs_clarification", vars: { question: question.id }, relatedIds: [], sourceRefs: answerRef() });
    }
  }
  findings.sort((a, b) => {
    const rank = (criterion) => criterion === null ? -1 : CRITERION_PRIORITY.indexOf(criterion);
    return rank(a.criterion) - rank(b.criterion);
  });
  if (findings.length === 0) {
    findings.push({
      code: "meets_criteria",
      criterion: null,
      status: "ready",
      vars: { question: question.id, criteria: criterionList(locale, checked) },
      relatedIds: [],
      sourceRefs: answerRef()
    });
  }
  const status = STATUS_PRIORITY.find((candidate) => findings.some((finding) => finding.status === candidate)) ?? "ready";
  return { question, answer, status, findings, checked, settled: false, approved: answer.status === "approved" };
}
function topFindings(assessment) {
  if (assessment.settled || assessment.status === "ready") return assessment.findings.slice(0, 1);
  return assessment.findings.filter((finding) => finding.status !== "ready").slice(0, COACH_LIMITS.maxDeficits);
}
function topDeficit(assessment) {
  if (assessment.settled) return null;
  return assessment.findings.find((finding) => finding.status !== "ready" && finding.criterion !== null) ?? null;
}

// packages/brand-core/src/coach/follow-up.ts
var PRIORITY_BAND = { critical: 0, high: 1, medium: 2, low: 3 };
function canonicalCandidates(ctx, question, deficit) {
  const askable = new Map(ctx.questions.filter((item) => item.sensitivity !== "restricted").map((item) => [item.id, item]));
  const inScope = (id) => !ctx.scope || ctx.scope.has(id);
  const usable = (id) => {
    if (id === question.id) return null;
    const candidate = askable.get(id);
    if (!candidate || !inScope(id) || !ctx.eligibleIds.has(id)) return null;
    if (liveAnswer(ctx, id) || isDisposition(ctx.answers.get(id))) return null;
    return candidate;
  };
  return sort(deficit.relatedIds.map(usable).filter((item) => item !== null));
}
function sort(questions) {
  return [...questions].sort((a, b) => PRIORITY_BAND[a.priority] - PRIORITY_BAND[b.priority] || a.order - b.order || a.id.localeCompare(b.id));
}
function chooseFollowUp(ctx, question, locale = "en") {
  const assessment = assessAnswer(ctx, question, locale);
  const base2 = { criterion: null, canonicalId: null, deficit: null, assessment };
  if (assessment.findings[0]?.code === "question_not_applicable") return { ...base2, kind: "none", noneReason: "question_inapplicable" };
  if (!assessment.answer) return { ...base2, kind: "none", noneReason: "answer_open" };
  if (assessment.settled) return { ...base2, kind: "none", noneReason: "answer_settled" };
  const deficit = topDeficit(assessment);
  if (!deficit || deficit.criterion === null) return { ...base2, kind: "none", noneReason: "quality_ready" };
  const candidates = canonicalCandidates(ctx, question, deficit);
  const first = candidates.find((candidate) => !ctx.deferred.has(candidate.id));
  if (first) return { kind: "canonical", criterion: deficit.criterion, canonicalId: first.id, noneReason: null, deficit, assessment };
  if (candidates.length > 0) return { ...base2, kind: "none", noneReason: "already_deferred", deficit, criterion: deficit.criterion };
  return { kind: "clarify", criterion: deficit.criterion, canonicalId: null, noneReason: null, deficit, assessment };
}

// packages/brand-core/src/coach/facet-rubrics.ts
var OWNERSHIP_MARKERS = [
  "owner",
  "co-owner",
  "owns",
  "ownership",
  "majority owner",
  "stake",
  "equity stake",
  "equity holder",
  "shareholder",
  "\u0645\u0627\u0644\u06A9",
  "\u0645\u0627\u0644\u06A9\u06CC\u062A",
  "\u0633\u0647\u0627\u0645",
  "\u0633\u0647\u0627\u0645\u062F\u0627\u0631",
  "sahibi",
  "sahiplik",
  "hisse",
  "hissedar",
  "pay sahibi"
];
var ROLE_TITLES_WITH_OWNER = ["product owner", "process owner", "owner of the roadmap", "\u0645\u0627\u0644\u06A9 \u0645\u062D\u0635\u0648\u0644", "\xFCr\xFCn sahibi"];
var NONE_ANSWER = /^(none|no|nothing yet|not yet|n\/a|هیچ|هیچی|ندارم|هنوز نه|yok|henüz yok)\.?$/i;
var YEAR = /(?<!\d)(?:19|20|13|14)\d{2}(?!\d)/g;
var COUNT_NOUNS = [
  "subscriber",
  "follower",
  "member",
  "reader",
  "viewer",
  "views",
  "listener",
  "download",
  "student",
  "attendee",
  "people",
  "sign-up",
  "signup",
  "\u0646\u0641\u0631",
  "\u0645\u0634\u062A\u0631\u06A9",
  "\u062F\u0646\u0628\u0627\u0644\u200C\u06A9\u0646\u0646\u062F\u0647",
  "\u062F\u0646\u0628\u0627\u0644 \u06A9\u0646\u0646\u062F\u0647",
  "\u0639\u0636\u0648",
  "\u0628\u0627\u0632\u062F\u06CC\u062F",
  "\u062E\u0648\u0627\u0646\u0646\u062F\u0647",
  "\u062F\u0627\u0646\u0634\u062C\u0648",
  "\u0634\u0627\u06AF\u0631\u062F",
  "abone",
  "takip\xE7i",
  "\xFCye",
  "ki\u015Fi",
  "okuyucu",
  "izlenme",
  "g\xF6r\xFCnt\xFClenme",
  "\xF6\u011Frenci",
  "indirme"
];
var COUNT_ALT = COUNT_NOUNS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
var COUNT_AFTER = new RegExp(`^\\s*\\+?\\s*(?:(?:active|paid|monthly|total|new)\\s+)?(?:${COUNT_ALT})`, "iu");
var COUNT_BEFORE = new RegExp(`(?:^|[^\\p{L}])(?:${COUNT_ALT})[\\p{L}\\p{M}\\u200c]*\\s*[:=\uFF1A]?\\s*$`, "iu");
function hasYear(text) {
  const folded = asciiDigits(text);
  for (const match of folded.matchAll(YEAR)) {
    const start = match.index;
    const end = start + match[0].length;
    if (COUNT_AFTER.test(folded.slice(end)) || COUNT_BEFORE.test(folded.slice(0, start))) continue;
    return true;
  }
  return false;
}
function stripRoleTitles(text) {
  let out = text;
  for (const title of ROLE_TITLES_WITH_OWNER) out = out.replace(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu"), " ");
  return out;
}
function companionOpen(ctx, id) {
  if (!ctx.byId.has(id) || ctx.deferred.has(id)) return false;
  return isOpenAnswer(ctx.answers.get(id));
}
function undated(text) {
  if (NONE_ANSWER.test(text.trim()) || contentWordCount(text) === 0) return false;
  return !hasYear(text);
}
var RUBRICS = [
  {
    // Founder / executive: role versus ownership.
    id: "founder-role-not-ownership",
    facet: "founder-executive",
    questions: ["personal.founder.ventures", "personal.experience.roles"],
    code: "facet_ownership_separate",
    criterion: "evidence_support",
    status: "evidence_missing",
    canonical: "personal.experience.relationships",
    fires: (_ctx, text) => {
      const plain = stripRoleTitles(text);
      return OWNERSHIP_MARKERS.some((term) => containsTerm(plain, term));
    }
  },
  {
    // Consultant / expert: client confidentiality and permission to name.
    id: "consultant-client-permission",
    facet: "consultant-expert",
    questions: ["personal.consulting.engagements", "personal.consulting.methodology", "personal.experience.highlights", "personal.reputation.testimonials"],
    code: "facet_companion_open",
    criterion: "completeness_for_output",
    status: "needs_clarification",
    canonical: "personal.consulting.confidentiality",
    fires: (ctx) => companionOpen(ctx, "personal.consulting.confidentiality")
  },
  {
    // Creator / educator: audience claims carry a date (the source is the evidence register's job).
    id: "creator-dated-audience-claim",
    facet: "creator-educator",
    questions: ["personal.creator.metrics"],
    code: "facet_claim_undated",
    criterion: "evidence_support",
    status: "needs_clarification",
    canonical: null,
    fires: (_ctx, text) => undated(text)
  },
  {
    // Creator / educator: sponsorship categories need the disclosure rule next to them.
    id: "creator-sponsorship-disclosure",
    facet: "creator-educator",
    questions: ["personal.creator.sponsorship"],
    code: "facet_companion_open",
    criterion: "completeness_for_output",
    status: "needs_clarification",
    canonical: "personal.creator.disclosure",
    fires: (ctx) => companionOpen(ctx, "personal.creator.disclosure")
  },
  {
    // Artist / designer: portfolio ownership and usage rights.
    id: "artist-portfolio-rights",
    facet: "artist-designer",
    questions: ["personal.artist.portfolio_taxonomy", "personal.artist.exhibitions"],
    code: "facet_companion_open",
    criterion: "completeness_for_output",
    status: "needs_clarification",
    canonical: "personal.artist.usage_rights",
    fires: (ctx) => companionOpen(ctx, "personal.artist.usage_rights")
  },
  {
    // Speaker / author: talks and publications carry a year (the source is the evidence register's job).
    id: "speaker-dated-history",
    facet: "speaker-author",
    questions: ["personal.speaking.prior_talks", "personal.author.publications"],
    code: "facet_claim_undated",
    criterion: "evidence_support",
    status: "needs_clarification",
    canonical: null,
    fires: (_ctx, text) => undated(text)
  }
];
var CRITERION_PRIORITY2 = ["relevance", "evidence_support", "clarity_coherence", "specificity", "completeness_for_output", "measurability"];
var STATUS_PRIORITY2 = ["insufficient_context", "not_applicable", "needs_review", "evidence_missing", "needs_clarification", "ready"];
function applyFacetRubrics(ctx, assessment) {
  if (assessment.settled || !assessment.answer) return { assessment, applied: [] };
  if (!personalConfig(ctx.config).enabled) return { assessment, applied: [] };
  const question = assessment.question;
  const rubrics = RUBRICS.filter((rubric) => rubric.questions.includes(question.id) && ctx.personalFacets.includes(rubric.facet));
  if (rubrics.length === 0) return { assessment, applied: [] };
  const text = answerText(assessment.answer);
  const answerRefs = [
    { kind: "question", id: question.id },
    { kind: "answer", id: assessment.answer.answer_id, revision: assessment.answer.answer_id }
  ];
  const added = [];
  const verified = verificationOf(ctx, question) === "verified";
  for (const rubric of rubrics) {
    if (rubric.criterion === "evidence_support" && verified) continue;
    if (!rubric.fires(ctx, text)) continue;
    const canonical = rubric.canonical && ctx.byId.has(rubric.canonical) ? rubric.canonical : null;
    added.push({
      code: rubric.code,
      criterion: rubric.criterion,
      status: rubric.status,
      vars: { question: question.id, facet: rubric.facet, rubric: rubric.id, canonical: canonical ?? "" },
      relatedIds: canonical ? [canonical] : [],
      sourceRefs: [...answerRefs, ...canonical ? [{ kind: "question", id: canonical }] : [], { kind: "config", id: `facet:${rubric.facet}` }],
      canonicalId: canonical ?? void 0
    });
  }
  const checked = [.../* @__PURE__ */ new Set([...assessment.checked, ...rubrics.map((rubric) => rubric.criterion)])];
  const applied = rubrics.map((rubric) => rubric.id);
  if (added.length === 0) return { assessment: { ...assessment, checked }, applied };
  const findings = [...assessment.findings.filter((finding) => finding.status !== "ready"), ...added].sort((a, b) => {
    const rank = (criterion) => criterion === null ? -1 : CRITERION_PRIORITY2.indexOf(criterion);
    return rank(a.criterion) - rank(b.criterion);
  });
  const status = STATUS_PRIORITY2.find((candidate) => findings.some((finding) => finding.status === candidate)) ?? "ready";
  return { assessment: { ...assessment, findings, checked, status }, applied };
}

// packages/brand-core/src/coach/rules.ts
var PREMIUM_MARKERS = [
  "premium",
  "luxury",
  "luxurious",
  "high-end",
  "high end",
  "upscale",
  "exclusive",
  "boutique",
  "\u0644\u0648\u06A9\u0633",
  "\u067E\u0631\u06CC\u0645\u06CC\u0648\u0645",
  "\u0645\u0645\u062A\u0627\u0632",
  "\u0627\u0639\u06CC\u0627\u0646\u06CC",
  "\u0627\u0646\u062D\u0635\u0627\u0631\u06CC",
  "l\xFCks",
  "se\xE7kin",
  "\xFCst segment",
  "ayr\u0131cal\u0131kl\u0131"
];
var LOWEST_PRICE_MARKERS = [
  "cheapest",
  "cheap",
  "lowest price",
  "lowest prices",
  "rock-bottom",
  "rock bottom",
  "bargain",
  "\u0627\u0631\u0632\u0627\u0646\u200C\u062A\u0631\u06CC\u0646",
  "\u0627\u0631\u0632\u0627\u0646\u062A\u0631\u06CC\u0646",
  "\u0627\u0631\u0632\u0627\u0646",
  "\u0627\u0631\u0632\u0648\u0646",
  "\u06A9\u0645\u062A\u0631\u06CC\u0646 \u0642\u06CC\u0645\u062A",
  "\u067E\u0627\u06CC\u06CC\u0646\u200C\u062A\u0631\u06CC\u0646 \u0642\u06CC\u0645\u062A",
  "en ucuz",
  "ucuz",
  "en d\xFC\u015F\xFCk fiyat",
  "en d\xFC\u015F\xFCk fiyatlar"
];
var PRICE_TIER_GUARDS = [
  "entry",
  "entry-level",
  "entry level",
  "starter",
  "intro",
  "introductory",
  "launch offer",
  "launch price",
  "first month",
  "trial",
  "tier",
  "tiers",
  "plan",
  "plans",
  "student",
  "students",
  "nonprofit",
  "non-profit",
  "\u067E\u0644\u0646",
  "\u0637\u0631\u062D \u067E\u0627\u06CC\u0647",
  "\u0648\u0631\u0648\u062F\u06CC",
  "\u0622\u0632\u0645\u0627\u06CC\u0634\u06CC",
  "\u0645\u0627\u0647 \u0627\u0648\u0644",
  "\u062F\u0627\u0646\u0634\u062C\u0648\u06CC\u06CC",
  "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0627\u0641\u062A\u062A\u0627\u062D\u06CC\u0647",
  "giri\u015F",
  "ba\u015Flang\u0131\xE7",
  "deneme",
  "ilk ay",
  "\xF6\u011Frenci",
  "paket",
  "lansman"
];
var SENSITIVE_CLAIM_MARKERS = [
  "guaranteed",
  "guarantee",
  "certified",
  "accredited",
  "clinically proven",
  "scientifically proven",
  "proven results",
  "number one",
  "number 1",
  "no. 1",
  "#1",
  "award-winning",
  "award winning",
  "market leader",
  "\u062A\u0636\u0645\u06CC\u0646\u06CC",
  "\u062A\u0636\u0645\u06CC\u0646",
  "\u06AF\u0648\u0627\u0647\u06CC\u200C\u0634\u062F\u0647",
  "\u062F\u0627\u0631\u0627\u06CC \u06AF\u0648\u0627\u0647\u06CC",
  "\u0634\u0645\u0627\u0631\u0647 \u06CC\u06A9",
  "\u0631\u062A\u0628\u0647 \u0627\u0648\u0644",
  "\u0628\u0631\u0646\u062F\u0647 \u062C\u0627\u06CC\u0632\u0647",
  "\u0627\u062B\u0628\u0627\u062A\u200C\u0634\u062F\u0647",
  "\u0627\u062B\u0628\u0627\u062A \u0639\u0644\u0645\u06CC",
  "garantili",
  "garanti",
  "sertifikal\u0131",
  "akredite",
  "bir numara",
  "\xF6d\xFCll\xFC",
  "klinik olarak kan\u0131tlanm\u0131\u015F",
  "bilimsel olarak kan\u0131tlanm\u0131\u015F",
  "pazar lideri"
];
var NEGATIONS = ["not", "no", "never", "without", "don't", "dont", "\u0646\u0647", "\u0647\u0631\u06AF\u0632", "\u0628\u062F\u0648\u0646", "asla", "de\u011Fil", "yok", "olmadan"];
var NEGATION_WINDOW_WORDS = 3;
var NEGATION_STEMS_AFTER = ["de\u011Fil", "degil", "\u0646\u06CC\u0633\u062A"].map((word) => normalizeForMatch(word));
var CLAIM_LIST_FIELDS = /* @__PURE__ */ new Set([
  "brand.verbal.forbidden",
  "personal.governance.public_claim_policy",
  "business.marketing.availability_claim",
  // Lists of what never to show or publish (audit O-2): a marker there names something to avoid.
  "brand.mascot.forbidden",
  "personal.media.avoid",
  "personal.privacy.never_publish"
]);
function markersIn(text, markers) {
  return markers.filter((term) => containsTerm(text, term));
}
function liveText(ctx, id) {
  const question = ctx.byId.get(id);
  if (!question || question.sensitivity === "restricted") return null;
  if (notApplicableReason(ctx, question) !== null) return null;
  const answer = liveAnswer(ctx, id);
  if (!answer || isDisposition(answer)) return null;
  const text = answerText(answer);
  return text ? text : null;
}
function assertedTerm(text, term) {
  const words = normalizeForMatch(text).split(/\s+/).map((word) => word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")).filter(Boolean);
  const needle = normalizeForMatch(term).split(/\s+/).filter(Boolean);
  if (needle.length === 0) return false;
  const stripped = needle.map((word) => word.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ""));
  if (stripped.some((word, k) => word !== needle[k])) return containsTerm(text, term);
  const negations = new Set(NEGATIONS.map((word) => normalizeForMatch(word)));
  const negated = (word) => negations.has(word) || word.startsWith("\u0646\u0645\u06CC");
  for (let i = 0; i + stripped.length <= words.length; i++) {
    if (!stripped.every((word, k) => words[i + k] === word)) continue;
    const before = words.slice(Math.max(0, i - NEGATION_WINDOW_WORDS), i);
    const after = words[i + stripped.length] ?? "";
    if (!before.some(negated) && !NEGATION_STEMS_AFTER.some((stem) => after.startsWith(stem))) return true;
  }
  return false;
}
function refs(ids) {
  return ids.map((id) => ({ kind: "question", id }));
}
var POSITIONING_IDS = ["brand.strategy.differentiation", "brand.strategy.promise", "business.offer.value_proposition"];
var PRICING_ID = "business.sales.pricing";
function premiumVsLowestPrice(ctx) {
  const rule = "premium-vs-lowest-price";
  const positioning = POSITIONING_IDS.map((id) => [id, liveText(ctx, id)]).filter((entry) => entry[1] !== null);
  const pricing = liveText(ctx, PRICING_ID);
  if (positioning.length === 0 || pricing === null) {
    const open = [...positioning.length === 0 ? POSITIONING_IDS : [], ...pricing === null ? [PRICING_ID] : []];
    return { check: { rule_id: rule, kind: "tension", outcome: "not_tested", basis: "inputs_open", question_ids: [...open].sort() }, findings: [] };
  }
  const read = [...positioning.map(([id]) => id), PRICING_ID].sort();
  const premium = positioning.filter(([, text]) => markersIn(text, PREMIUM_MARKERS).length > 0).map(([id]) => id);
  const lowest = LOWEST_PRICE_MARKERS.some((term) => assertedTerm(pricing, term));
  if (premium.length === 0 || !lowest) return { check: { rule_id: rule, kind: "tension", outcome: "no_finding", basis: "rule_silent", question_ids: read }, findings: [] };
  if (markersIn(pricing, PRICE_TIER_GUARDS).length > 0) return { check: { rule_id: rule, kind: "tension", outcome: "no_finding", basis: "guard_matched", question_ids: read }, findings: [] };
  const related = [...premium, PRICING_ID].sort();
  return {
    check: { rule_id: rule, kind: "tension", outcome: "potential_tension", basis: "rule_fired", question_ids: related },
    findings: [{ rule, verdict: "potential_tension", relatedIds: related, sourceRefs: refs(related) }]
  };
}
var STATUS_ID = "business.product.public_status";
var AVAILABILITY_ID = "business.marketing.availability_claim";
function availabilityHeldBack(ctx) {
  const rule = "availability-held-back";
  const status = liveText(ctx, STATUS_ID);
  const claim = liveText(ctx, AVAILABILITY_ID);
  const read = [AVAILABILITY_ID, STATUS_ID];
  if (status === null || claim === null) {
    return { check: { rule_id: rule, kind: "tension", outcome: "not_tested", basis: "inputs_open", question_ids: read.filter((id) => liveText(ctx, id) === null) }, findings: [] };
  }
  if (status !== "available" || claim !== "coming-soon" && claim !== "do-not-claim") {
    return { check: { rule_id: rule, kind: "tension", outcome: "no_finding", basis: "rule_silent", question_ids: read }, findings: [] };
  }
  return {
    check: { rule_id: rule, kind: "tension", outcome: "potential_tension", basis: "rule_fired", question_ids: read },
    findings: [{ rule, verdict: "potential_tension", relatedIds: read, sourceRefs: refs(read) }]
  };
}
function requiresEvidence(question) {
  return question.publication_requires?.includes("verified_evidence") === true;
}
function evidenceClaimUnverified(ctx) {
  const rule = "evidence-claim-unverified";
  const inputs = ctx.questions.filter((question) => requiresEvidence(question) && liveText(ctx, question.id) !== null);
  if (inputs.length === 0) return { check: { rule_id: rule, kind: "verification", outcome: "not_tested", basis: "inputs_open", question_ids: [] }, findings: [] };
  const findings = [];
  for (const question of [...inputs].sort((a, b) => a.id.localeCompare(b.id))) {
    if (verificationOf(ctx, question) === "verified") continue;
    findings.push({ rule, verdict: "needs_verification", relatedIds: [question.id], sourceRefs: [{ kind: "question", id: question.id }, { kind: "evidence", id: question.id }] });
  }
  const ids = inputs.map((question) => question.id).sort();
  if (findings.length === 0) return { check: { rule_id: rule, kind: "verification", outcome: "no_finding", basis: "rule_silent", question_ids: ids }, findings };
  return { check: { rule_id: rule, kind: "verification", outcome: "needs_verification", basis: "rule_fired", question_ids: findings.map((item) => item.relatedIds[0]) }, findings };
}
function sensitiveClaimWording(ctx) {
  const rule = "sensitive-claim-wording";
  const candidates = ctx.questions.filter((question) => isFreeText(question) && !requiresEvidence(question) && !CLAIM_LIST_FIELDS.has(question.id) && liveText(ctx, question.id) !== null);
  if (candidates.length === 0) return { check: { rule_id: rule, kind: "verification", outcome: "not_tested", basis: "inputs_open", question_ids: [] }, findings: [] };
  const findings = [];
  let guarded = false;
  for (const question of [...candidates].sort((a, b) => a.id.localeCompare(b.id))) {
    const text = liveText(ctx, question.id);
    const mentioned = markersIn(text, SENSITIVE_CLAIM_MARKERS);
    if (mentioned.length === 0) continue;
    if (!mentioned.some((term) => assertedTerm(text, term))) {
      guarded = true;
      continue;
    }
    if (verificationOf(ctx, question) === "verified") continue;
    findings.push({ rule, verdict: "needs_verification", relatedIds: [question.id], sourceRefs: [{ kind: "question", id: question.id }, { kind: "evidence", id: question.id }] });
  }
  if (findings.length > 0) return { check: { rule_id: rule, kind: "verification", outcome: "needs_verification", basis: "rule_fired", question_ids: findings.map((item) => item.relatedIds[0]) }, findings };
  return { check: { rule_id: rule, kind: "verification", outcome: "no_finding", basis: guarded ? "guard_matched" : "rule_silent", question_ids: [] }, findings };
}
var CONTRADICTION_RULE_INPUTS = {
  "name-divergence": ["business.identity.trade_name", "brand.identity.public_name_override"],
  "unshipped-marketed-as-available": [AVAILABILITY_ID, STATUS_ID],
  "approved-placeholder": [],
  "module-disabled-with-approval": []
};
function contradictionChecks(ctx) {
  return Object.entries(CONTRADICTION_RULE_INPUTS).map(([rule, inputs]) => {
    const hits = ctx.contradictions.filter((item) => item.status === "open" && item.rule === rule);
    if (hits.length > 0) {
      return { rule_id: rule, kind: "contradiction", outcome: "confirmed_conflict", basis: "rule_fired", question_ids: [...new Set(hits.flatMap((item) => item.fields))].sort() };
    }
    const open = inputs.filter((id) => liveText(ctx, id) === null);
    if (open.length > 0) return { rule_id: rule, kind: "contradiction", outcome: "not_tested", basis: "inputs_open", question_ids: [...open].sort() };
    return { rule_id: rule, kind: "contradiction", outcome: "no_finding", basis: "rule_silent", question_ids: [...inputs].sort() };
  });
}
function registryReview(ctx) {
  const outputs = [premiumVsLowestPrice(ctx), availabilityHeldBack(ctx), evidenceClaimUnverified(ctx), sensitiveClaimWording(ctx)];
  const rank = { needs_verification: 0, potential_tension: 1 };
  const findings = outputs.flatMap((output) => output.findings).sort((a, b) => rank[a.verdict] - rank[b.verdict] || a.rule.localeCompare(b.rule) || a.relatedIds.join().localeCompare(b.relatedIds.join()));
  return { findings, checks: [...contradictionChecks(ctx), ...outputs.map((output) => output.check)] };
}

// packages/brand-core/src/coach/analyze.ts
var SEVERITY = {
  ready: "info",
  not_applicable: "info",
  insufficient_context: "info",
  needs_clarification: "advice",
  evidence_missing: "attention",
  needs_review: "attention"
};
var NO_MODEL_NOTE = "no_model_called: every finding in this result is deterministic";
var ADVISORY_NOTE = "advisory_only: this result changes no answer, fact, approval, strategy, calendar or asset";
var REGISTRY_NOTE = "rules_registry: confirmed_conflict comes only from findContradictions; potential_tension and needs_verification come only from the registered rules in coach/rules.ts. A tension outside those rules is not tested, so silence does not mean there is none; see rule_checks";
function findingId(mode, questionId, answerId, code) {
  return [mode, questionId ?? "brand", answerId ?? "none", code].join(":");
}
function outputsOf(question) {
  return [...new Set(question.related_outputs)].sort();
}
function fromQualityFinding(mode, assessment, finding, locale) {
  const text = coachText(locale, finding.code, finding.vars);
  const outputs = outputsOf(assessment.question);
  return {
    id: findingId(mode, assessment.question.id, assessment.answer?.answer_id ?? null, finding.code),
    type: "quality",
    code: finding.code,
    status: finding.status,
    severity: SEVERITY[finding.status],
    criterion: finding.criterion,
    verdict: null,
    question_id: assessment.question.id,
    related_question_ids: finding.relatedIds,
    canonical_question_id: finding.canonicalId ?? null,
    suggested_question: null,
    missing_dimension: finding.criterion,
    improves_outputs: outputs,
    reason: text.reason,
    improvement: text.improvement,
    // An approved fact is not automatically a good answer, but changing one is a human step, never the coach's.
    requires_change_request: assessment.approved && finding.status !== "ready" && finding.status !== "not_applicable",
    source_refs: finding.sourceRefs,
    origin: "deterministic"
  };
}
function shell(ctx, mode, locale, ids) {
  const questionIds = [...new Set(ids)].sort();
  return {
    schema_version: COACH_SCHEMA_VERSION,
    kind: "coach_result",
    brand_id: ctx.brandId,
    mode,
    locale,
    analysis_scope: { profile: ctx.profileId, questions: questionIds, context_digest: contextDigest(ctx, COACH_RULE_VERSION, questionIds) },
    generated_at: ctx.now.toISOString(),
    engine_version: COACH_ENGINE_VERSION,
    rule_version: COACH_RULE_VERSION,
    authority: "derived_advice",
    authorizes: []
  };
}
function dedupeRefs(refs2) {
  const seen = /* @__PURE__ */ new Map();
  for (const ref of refs2) seen.set(`${ref.kind}:${ref.id}:${ref.revision ?? ""}`, ref);
  return [...seen.values()];
}
function qualityReview(ctx, questionId, opts = {}) {
  const locale = opts.locale ?? "en";
  const question = coachQuestion(ctx, questionId);
  const { assessment, applied } = applyFacetRubrics(ctx, assessAnswer(ctx, question, locale));
  const reported = topFindings(assessment);
  const findings = reported.map((finding) => fromQualityFinding("quality_review", assessment, finding, locale));
  const notes = [NO_MODEL_NOTE, ADVISORY_NOTE];
  if (assessment.checked.length > 0) notes.push(`criteria_checked: ${assessment.checked.join(", ")}`);
  if (applied.length > 0) notes.push(`facet_rubrics_checked: ${applied.join(", ")}`);
  if (assessment.approved) notes.push("approved_fact: a change needs brand:interview change, brand:review and brand:approve");
  return validateCoachResult({
    ...shell(ctx, "quality_review", locale, [questionId, ...findings.flatMap((finding) => finding.related_question_ids)]),
    question_id: questionId,
    answer_ref: assessment.answer ? { answer_id: assessment.answer.answer_id, status: assessment.answer.status, digest: answerDigest(assessment.answer) } : null,
    status: assessment.status,
    findings,
    source_refs: dedupeRefs([{ kind: "profile", id: ctx.profileId }, ...findings.flatMap((finding) => finding.source_refs)]),
    notes
  });
}
function followUpReview(ctx, questionId, opts = {}) {
  const locale = opts.locale ?? "en";
  const question = coachQuestion(ctx, questionId);
  const choice = chooseFollowUp(ctx, question, locale);
  const answer = choice.assessment.answer;
  const outputs = outputsOf(question);
  const criterionName = choice.criterion ? CRITERION_NAMES[locale][choice.criterion] : "";
  const baseRefs = [{ kind: "question", id: question.id }, ...answer ? [{ kind: "answer", id: answer.answer_id, revision: answer.answer_id }] : []];
  let finding;
  if (choice.kind === "canonical" && choice.canonicalId) {
    const text = coachText(locale, "follow_up_canonical", { question: question.id, criterion: criterionName, canonical: choice.canonicalId });
    finding = {
      id: findingId("follow_up", question.id, answer?.answer_id ?? null, "follow_up_canonical"),
      type: "follow_up",
      code: "follow_up_canonical",
      status: choice.assessment.status,
      severity: "advice",
      criterion: choice.criterion,
      verdict: null,
      question_id: question.id,
      related_question_ids: [choice.canonicalId],
      canonical_question_id: choice.canonicalId,
      // Deliberately null: the canonical question owns its own prompt in all three locales.
      suggested_question: null,
      missing_dimension: choice.criterion,
      improves_outputs: outputs,
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: false,
      source_refs: dedupeRefs([...baseRefs, { kind: "question", id: choice.canonicalId }, ...choice.deficit?.sourceRefs ?? []]),
      origin: "deterministic"
    };
  } else if (choice.kind === "clarify" && choice.criterion) {
    const text = coachText(locale, "follow_up_clarify", { question: question.id, criterion: criterionName, outputs: outputs.join(", ") || question.module });
    finding = {
      id: findingId("follow_up", question.id, answer?.answer_id ?? null, "follow_up_clarify"),
      type: "follow_up",
      code: "follow_up_clarify",
      status: choice.assessment.status,
      severity: "advice",
      criterion: choice.criterion,
      verdict: null,
      question_id: question.id,
      related_question_ids: [],
      canonical_question_id: null,
      suggested_question: clarifyQuestion(locale, choice.criterion, question.id),
      missing_dimension: choice.criterion,
      improves_outputs: outputs,
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: choice.assessment.approved,
      source_refs: dedupeRefs([...baseRefs, ...choice.deficit?.sourceRefs ?? []]),
      origin: "deterministic"
    };
  } else {
    const why = NO_FOLLOW_UP_TEXT[locale][choice.noneReason ?? "quality_ready"];
    const text = coachText(locale, "follow_up_none", { question: question.id, why });
    finding = {
      id: findingId("follow_up", question.id, answer?.answer_id ?? null, "follow_up_none"),
      type: "follow_up",
      code: "follow_up_none",
      status: choice.assessment.status,
      severity: "info",
      criterion: null,
      verdict: null,
      question_id: question.id,
      related_question_ids: [],
      canonical_question_id: null,
      suggested_question: null,
      missing_dimension: null,
      improves_outputs: outputs,
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: false,
      source_refs: baseRefs,
      origin: "deterministic"
    };
  }
  return validateCoachResult({
    ...shell(ctx, "follow_up", locale, [question.id, ...finding.related_question_ids]),
    question_id: question.id,
    answer_ref: answer ? { answer_id: answer.answer_id, status: answer.status, digest: answerDigest(answer) } : null,
    status: choice.assessment.status,
    findings: [finding],
    source_refs: dedupeRefs([{ kind: "profile", id: ctx.profileId }, ...finding.source_refs]),
    notes: [NO_MODEL_NOTE, ADVISORY_NOTE, `at_most_one_follow_up: ${choice.kind}`]
  });
}
function capRegistry(list, budget) {
  if (list.length <= budget) return list;
  const kept = list.slice(0, budget);
  const tension = list.find((item) => item.verdict === "potential_tension");
  if (budget > 1 && tension && !kept.includes(tension)) kept[budget - 1] = tension;
  return kept;
}
function consistencyReview(ctx, questionId, opts = {}) {
  const locale = opts.locale ?? "en";
  const question = questionId === null ? null : coachQuestion(ctx, questionId);
  const items = consistencyFindings(ctx, question?.id ?? null);
  const answered = answeredIds(ctx);
  const registry = registryReview(ctx);
  const registryItems = capRegistry(
    question === null ? registry.findings : registry.findings.filter((item) => item.relatedIds.includes(question.id)),
    Math.max(0, COACH_LIMITS.maxConsistencyFindings - items.length)
  );
  const findings = items.map((item) => {
    const text = coachText(locale, "consistency_rule", { rule: item.contradiction.rule, ids: item.relatedIds.join(", ") });
    return {
      id: findingId("consistency_review", question?.id ?? null, null, `consistency_rule:${item.contradiction.id}`),
      type: "consistency",
      code: "consistency_rule",
      status: "needs_review",
      severity: "attention",
      criterion: "clarity_coherence",
      verdict: item.verdict,
      question_id: question?.id ?? null,
      related_question_ids: item.relatedIds.filter((id) => ctx.byId.has(id)),
      canonical_question_id: null,
      suggested_question: null,
      missing_dimension: null,
      improves_outputs: [],
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: item.relatedIds.some((id) => ctx.answers.get(id)?.status === "approved"),
      source_refs: item.sourceRefs,
      origin: "deterministic"
    };
  });
  for (const item of registryItems) {
    const ids = item.relatedIds.join(", ");
    const tension = item.verdict === "potential_tension";
    const code = tension ? "consistency_tension" : "consistency_verification";
    const text = coachText(locale, code, { rule: item.rule, ids });
    const asks = tension && COACH_TENSION_RULES.includes(item.rule) ? TENSION_QUESTIONS[locale][item.rule] : null;
    findings.push({
      id: findingId("consistency_review", question?.id ?? null, null, `${code}:${item.rule}:${ids.replace(/, /g, "+")}`),
      type: "consistency",
      code,
      status: tension ? "needs_clarification" : "evidence_missing",
      severity: tension ? "advice" : "attention",
      criterion: tension ? "clarity_coherence" : "evidence_support",
      verdict: item.verdict,
      question_id: question?.id ?? null,
      related_question_ids: item.relatedIds.filter((id) => ctx.byId.has(id)),
      canonical_question_id: null,
      suggested_question: asks,
      missing_dimension: tension ? "clarity_coherence" : "evidence_support",
      improves_outputs: [],
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: item.relatedIds.some((id) => ctx.answers.get(id)?.status === "approved"),
      source_refs: item.sourceRefs,
      origin: "deterministic"
    });
  }
  let status = findings.some((finding) => finding.verdict === "confirmed_conflict") ? "needs_review" : findings.some((finding) => finding.verdict === "needs_verification") ? "evidence_missing" : "needs_clarification";
  if (findings.length === 0) {
    status = answered.length === 0 ? "insufficient_context" : "ready";
    const text = coachText(locale, "consistency_none", { count: String(answered.length) });
    findings.push({
      id: findingId("consistency_review", question?.id ?? null, null, "consistency_none"),
      type: "consistency",
      code: "consistency_none",
      status,
      severity: "info",
      criterion: "clarity_coherence",
      verdict: null,
      question_id: question?.id ?? null,
      related_question_ids: [],
      canonical_question_id: null,
      suggested_question: null,
      missing_dimension: null,
      improves_outputs: [],
      reason: text.reason,
      improvement: text.improvement,
      requires_change_request: false,
      source_refs: [{ kind: "profile", id: ctx.profileId }],
      origin: "deterministic"
    });
  }
  return validateCoachResult({
    ...shell(ctx, "consistency_review", locale, question === null ? answered : [question.id, ...items.flatMap((item) => item.relatedIds), ...registryItems.flatMap((item) => item.relatedIds)]),
    question_id: question?.id ?? null,
    answer_ref: null,
    status,
    findings,
    source_refs: dedupeRefs([{ kind: "profile", id: ctx.profileId }, ...findings.flatMap((finding) => finding.source_refs)]),
    notes: [NO_MODEL_NOTE, ADVISORY_NOTE, REGISTRY_NOTE, "rules_source: findContradictions (packages/brand-core/src/contradictions.ts), reported unchanged"],
    // Scoped: the checks that name this question, plus brand-wide checks (no ids), which read it too.
    rule_checks: question === null ? registry.checks : registry.checks.filter((check) => check.question_ids.length === 0 || check.question_ids.includes(question.id))
  });
}
function coachAnalyze(source, input) {
  const ctx = openCoachContext(source, { now: input.now });
  if (input.mode === "consistency_review") return consistencyReview(ctx, input.questionId ?? null, input);
  const questionId = input.questionId ?? null;
  if (!questionId) throw new CoachError("invalid_input", `${input.mode} needs a question id: pass --question <id>. Canonical ids come from brand/interview/field-registry.yaml or npm run brand:next.`);
  return input.mode === "quality_review" ? qualityReview(ctx, questionId, input) : followUpReview(ctx, questionId, input);
}
function coachNext(source, opts = {}) {
  const ctx = openCoachContext(source, { now: opts.now });
  const locale = opts.locale ?? "en";
  const lastId = ctx.lastAnsweredId;
  const question = lastId ? ctx.byId.get(lastId) : void 0;
  if (!question || question.sensitivity === "restricted") {
    const text = { reason: coachText(locale, "answer_missing", { question: coachUi(locale, "theInterview") }).reason, improvement: coachUi(locale, "nextNoAnswer") };
    return validateCoachResult({
      ...shell(ctx, "follow_up", locale, []),
      question_id: null,
      answer_ref: null,
      status: "insufficient_context",
      findings: [
        {
          id: findingId("follow_up", null, null, "answer_missing"),
          type: "follow_up",
          code: "answer_missing",
          status: "insufficient_context",
          severity: "info",
          criterion: null,
          verdict: null,
          question_id: null,
          related_question_ids: [],
          canonical_question_id: null,
          suggested_question: null,
          missing_dimension: null,
          improves_outputs: [],
          reason: text.reason,
          improvement: text.improvement,
          requires_change_request: false,
          source_refs: [{ kind: "profile", id: ctx.profileId }],
          origin: "deterministic"
        }
      ],
      source_refs: [{ kind: "profile", id: ctx.profileId }],
      notes: [NO_MODEL_NOTE, ADVISORY_NOTE, "no_recent_answer: answer a question first, or pass --question <id>"]
    });
  }
  return followUpReview(ctx, question.id, opts);
}

// packages/brand-core/src/coach/render.ts
function line(label, value) {
  return `${label}: ${value}`;
}
function renderFinding(finding, locale, index) {
  const out = [];
  const status = STATUS_NAMES[locale][finding.status];
  out.push(`${index}. [${finding.code}] ${status}${finding.criterion ? ` \u2014 ${CRITERION_NAMES[locale][finding.criterion]}` : ""}`);
  out.push(`   ${finding.reason}`);
  if (finding.canonical_question_id) out.push(`   ${coachUi(locale, "useExisting")}: ${finding.canonical_question_id}`);
  if (finding.suggested_question) out.push(`   ${coachUi(locale, "ask")}: ${finding.suggested_question}`);
  if (finding.improvement) out.push(`   ${coachUi(locale, "improvement")}: ${finding.improvement}`);
  if (finding.improves_outputs.length > 0) out.push(`   ${coachUi(locale, "improves")}: ${finding.improves_outputs.join(", ")}`);
  if (finding.requires_change_request) out.push(`   ${coachUi(locale, "changeFlow")}`);
  if (finding.source_refs.length > 0) out.push(`   ${coachUi(locale, "sources")}: ${finding.source_refs.map((ref) => `${ref.kind}:${ref.id}`).join(", ")}`);
  return out;
}
function renderCoachResult(result) {
  const locale = result.locale;
  const out = [
    `${coachUi(locale, "title")} \u2014 ${result.brand_id}`,
    coachUi(locale, "advisory"),
    "",
    line(coachUi(locale, "mode"), result.mode),
    line(coachUi(locale, "question"), result.question_id ?? "\u2014"),
    line(coachUi(locale, "status"), STATUS_NAMES[locale][result.status]),
    "",
    `${coachUi(locale, "findings")}:`
  ];
  if (result.findings.length === 0) out.push(coachUi(locale, "none"));
  result.findings.forEach((finding, index) => out.push(...renderFinding(finding, locale, index + 1)));
  if (result.rule_checks && result.rule_checks.length > 0) {
    out.push("", `${coachUi(locale, "ruleChecks")}:`);
    for (const check of result.rule_checks) {
      const guard = check.basis === "guard_matched" ? ` (${coachUi(locale, "ruleGuard")})` : "";
      const ids = check.question_ids.length > 0 ? ` \u2014 ${check.question_ids.join(", ")}` : "";
      out.push(`- ${check.rule_id}: ${RULE_OUTCOME_NAMES[locale][check.outcome]}${guard}${ids}`);
    }
  }
  out.push("", coachUi(locale, "noModel"), `engine ${result.engine_version} \xB7 rules ${result.rule_version} \xB7 authorizes: []`);
  return out.join("\n");
}

// packages/brand-core/src/coach/moments.ts
var COACH_STRATEGIC_NAMESPACES = [
  "brand.strategy",
  "brand.personality",
  "business.customer",
  "business.problem",
  "business.offer",
  "business.model",
  "business.market",
  "business.plan",
  "business.goals",
  "business.growth",
  "business.sales",
  "business.marketing",
  "business.product",
  "business.finance",
  "personal.positioning",
  "personal.services",
  "personal.story",
  "personal.goals"
];
function isStrategicQuestionId(id) {
  return COACH_STRATEGIC_NAMESPACES.some((ns) => id.startsWith(`${ns}.`));
}
var COACH_AUTO_ENV = "BRAND_OS_COACH";
function coachAutoEnabled(env = process.env) {
  const value = env[COACH_AUTO_ENV]?.trim().toLowerCase();
  return !(value === "off" || value === "0" || value === "false" || value === "no");
}
function coachWorthiness(question) {
  if (question.sensitivity === "restricted") return "restricted";
  if (!isFreeText(question) && !expectsMeasure(question)) return "factual_type";
  const evidenceClaim = (question.publication_requires ?? []).includes("verified_evidence");
  if (!evidenceClaim && !isStrategicQuestionId(question.id)) return "not_strategic";
  return null;
}
function valueRevisions(source, questionId) {
  return source.ledger().records.filter((record) => record.question_id === questionId && record.value !== null && record.value !== void 0 && !isDisposition(record)).length;
}
function noteFor(ctx, question, locale) {
  const choice = chooseFollowUp(ctx, question, locale);
  if (choice.kind === "none") {
    const silence = {
      question_inapplicable: "not_applicable",
      answer_open: "unanswered",
      answer_settled: "disposition",
      quality_ready: "ready",
      already_deferred: "declined_gap"
    };
    return { note: null, silence: silence[choice.noneReason ?? "quality_ready"] };
  }
  const finding = followUpReview(ctx, question.id, { locale, now: ctx.now }).findings[0];
  if (!finding || !finding.criterion || finding.code === "follow_up_none") return { note: null, silence: "ready" };
  return {
    silence: null,
    note: {
      question_id: question.id,
      status: finding.status,
      criterion: finding.criterion,
      canonical_question_id: finding.canonical_question_id,
      suggested_question: finding.suggested_question,
      requires_change_request: finding.requires_change_request
    }
  };
}
function base(moment, locale) {
  return { kind: "coach_moment", moment, locale, rule_version: COACH_RULE_VERSION, authority: "derived_advice", authorizes: [] };
}
function gate(env) {
  if (!coachAutoEnabled(env)) return "disabled";
  if (env[AGENT_TOKEN_ENV]) return "agent_token";
  return null;
}
function coachAfterAnswer(source, questionId, opts = {}) {
  const locale = opts.locale ?? "en";
  const silent = (silence) => ({ ...base("after_answer", locale), shown: false, silence, note: null });
  const closed = gate(opts.env ?? process.env);
  if (closed) return silent(closed);
  try {
    const question = source.question(questionId);
    if (!question) return silent("unknown_question");
    const unworthy = coachWorthiness(question);
    if (unworthy) return silent(unworthy);
    if (source.session().deferred.includes(questionId)) return silent("deferred");
    if (valueRevisions(source, questionId) > 1) return silent("already_coached");
    const ctx = openCoachContext(source, { now: opts.now });
    const { note, silence } = noteFor(ctx, question, locale);
    return note ? { ...base("after_answer", locale), shown: true, silence: null, note } : silent(silence ?? "ready");
  } catch (error) {
    return silent(error instanceof CoachError && error.code === "refused" ? "agent_token" : "unavailable");
  }
}
function coachBeforeApproval(source, input, opts = {}) {
  const locale = opts.locale ?? "en";
  const limit = Math.max(0, opts.limit ?? 3);
  const result = { ...base(opts.moment ?? "before_approval", locale), moment: opts.moment ?? "before_approval", notes: [], more: 0, checked: 0, silent: {} };
  const ids = [...new Set(input.draftIds)];
  const changes = [...new Set(input.changeIds ?? [])].filter((id) => !ids.includes(id));
  const count = (reason, n = 1) => {
    if (n > 0) result.silent[reason] = (result.silent[reason] ?? 0) + n;
  };
  result.checked = ids.length + changes.length;
  count("change_pending", changes.length);
  const closed = gate(opts.env ?? process.env);
  if (closed) {
    count(closed, ids.length);
    return result;
  }
  let ctx;
  try {
    ctx = openCoachContext(source, { now: opts.now });
  } catch (error) {
    count(error instanceof CoachError && error.code === "refused" ? "agent_token" : "unavailable", ids.length);
    return result;
  }
  for (const id of ids) {
    try {
      const question = ctx.byId.get(id);
      if (!question) {
        count("unknown_question");
        continue;
      }
      const unworthy = coachWorthiness(question);
      if (unworthy) {
        count(unworthy);
        continue;
      }
      const { note, silence } = noteFor(ctx, question, locale);
      if (!note) count(silence ?? "ready");
      else if (result.notes.length < limit) result.notes.push(note);
      else result.more += 1;
    } catch {
      count("unavailable");
    }
  }
  return result;
}
function nextStep(note, locale) {
  if (note.canonical_question_id) return `${coachUi(locale, "momentAnswerFirst")} ${note.canonical_question_id}`;
  return clarifyQuestion(locale, note.criterion, note.question_id);
}
function renderAfterAnswer(result) {
  if (!result.shown || !result.note) return "";
  const { locale, note } = result;
  const lines = [
    `${coachUi(locale, "momentTitle")} \u2014 ${note.question_id}: ${CRITERION_NAMES[locale][note.criterion]}`,
    `  ${note.canonical_question_id ? coachUi(locale, "useExisting") : coachUi(locale, "momentAsk")}: ${note.canonical_question_id ?? clarifyQuestion(locale, note.criterion, note.question_id)}`,
    `  ${note.requires_change_request ? coachUi(locale, "changeFlow") : coachUi(locale, "momentAfterHint").replace("{question}", note.question_id)}`
  ];
  return lines.join("\n");
}
function renderBeforeApproval(result) {
  if (result.notes.length === 0) return "";
  const { locale } = result;
  const lines = [coachUi(locale, "momentApproveTitle")];
  for (const note of result.notes) lines.push(`- ${note.question_id} (${CRITERION_NAMES[locale][note.criterion]}): ${nextStep(note, locale)}`);
  if (result.more > 0) lines.push(coachUi(locale, "momentMore").replace("{count}", String(result.more)));
  lines.push(coachUi(locale, "momentApproveFoot"));
  return lines.join("\n");
}
function coachNoteText(note, locale) {
  return { criterion: CRITERION_NAMES[locale][note.criterion], next: nextStep(note, locale) };
}

export {
  COACH_MODES,
  CoachError,
  isCoachMode,
  coachAnalyze,
  coachNext,
  renderCoachResult,
  coachAfterAnswer,
  coachBeforeApproval,
  renderAfterAnswer,
  renderBeforeApproval,
  coachNoteText
};
