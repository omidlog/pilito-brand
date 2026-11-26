import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  CLAIM_KEY,
  RESEARCH_LIMITS,
  ResearchError,
  assertOwnerProcess,
  assertOwnerProcess2,
  evidenceFor,
  evidenceState,
  factState,
  hostOf,
  htmlToText,
  loadEvidence,
  normalizeForQuote,
  readApprovalSecret,
  requireProof,
  scanRecords,
  servable,
  sha256,
  validateExcerpt,
  validateSource,
  validateUrl
} from "./chunk-5OMKZSIF.mjs";
import {
  AGENT_TOKEN_ENV,
  CHANNEL_KPI_METRICS,
  CHANNEL_OBJECTIVES,
  CONTENT_CHANNELS,
  CONTENT_FORMATS,
  CONTENT_MIX_TYPES,
  CONTENT_SOURCE_ROLES,
  FACT_ID,
  ITEM_ID,
  KnowledgeError,
  LOCALE,
  NOTE_ID,
  STRATEGY_LIMITS,
  StrategyError,
  approvalProofMatches,
  approvalSeal,
  canonicalJson,
  captureNote,
  dirUsable,
  ensureDir,
  findNote,
  knowledgeRef,
  newApprovalEventId,
  parseKnowledgeRef,
  parseProposal,
  parseStructured,
  readFacts,
  readIdentityIntake,
  readYaml,
  safeRead,
  safetyBlocksSharing,
  safetyReport,
  sha256Hex,
  sourceDigest,
  text,
  validateRevisionNumber,
  validateSha,
  validateStrategyId,
  withLock,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// packages/brand-core/src/competitive/model.ts
import crypto from "node:crypto";
var COMPETITIVE_SCHEMA_VERSION = 1;
var LANDSCAPE_SCHEMA = "brand-os.competitive-landscape/1";
var RELATIONSHIPS = ["direct", "indirect", "substitute", "aspirational_benchmark"];
var GEOGRAPHIES = ["local", "regional", "international"];
var CANDIDATE_SOURCES = ["owner_named", "research_lead", "seo_interview"];
var STORED_STATUSES = ["candidate", "owner_reviewed", "disputed", "archived"];
var DIMENSIONS = ["offer", "audience", "geography", "public_price", "public_message", "visual_language", "observable_channels", "strength_hypothesis", "weakness_hypothesis"];
var PURPOSES = ["identity", "positioning", "marketing", "pricing", "seo", "expansion"];
var STATEMENT_KINDS = ["observed_claim", "inference"];
var BILLING_PERIODS = ["month", "year", "one_time", "unknown"];
var BILLING_COMMITMENTS = ["monthly", "annual", "none", "unknown"];
var TAX_INCLUSIONS = ["included", "excluded", "unknown"];
var PROMOTIONS = ["none_observed", "promotional", "unknown"];
var PURPOSE_DIMENSIONS = {
  identity: ["visual_language", "public_message"],
  positioning: ["offer", "audience", "public_message", "strength_hypothesis", "weakness_hypothesis"],
  marketing: ["public_message", "observable_channels", "audience"],
  pricing: ["public_price", "offer"],
  seo: ["public_message"],
  expansion: ["geography", "offer"]
};
var COMPETITOR_ID = /^cmp_[0-9a-f-]{36}$/;
var OBSERVATION_ID = /^ob_[0-9a-f-]{36}$/;
var MARKET = /^(?:[A-Z]{2}|GLOBAL)$/;
var CURRENCY = /^[A-Z]{3}$/;
var COMPETITIVE_LIMITS = {
  maxNameChars: 80,
  maxLabelChars: 200,
  maxReasonChars: 200,
  maxOfferChars: 80,
  maxScopeChars: 120,
  maxMarkets: 20,
  maxObservations: 100,
  maxCandidates: 200,
  maxDomainChars: 253,
  maxFileBytes: 512 * 1024
};
var CompetitiveError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CompetitiveError";
  }
  code;
};
function newCompetitorId() {
  return `cmp_${crypto.randomUUID()}`;
}
function newObservationId() {
  return `ob_${crypto.randomUUID()}`;
}
function oneOf(value, allowed, field) {
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw new CompetitiveError("invalid_input", `${field} must be one of ${allowed.join(", ")}.`);
}
function listOf(value, allowed, field) {
  if (value === void 0 || value === null || value === "") return [];
  const items = typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;
  if (!Array.isArray(items)) throw new CompetitiveError("invalid_input", `${field} must be a list.`);
  const out = [];
  for (const item of items) {
    const v = oneOf(item, allowed, field);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}
function validateCompetitorId(value) {
  if (typeof value !== "string" || !COMPETITOR_ID.test(value)) throw new CompetitiveError("invalid_input", "A competitor id looks like cmp_<uuid>.");
  return value;
}
function validateClaimKey(value) {
  if (typeof value !== "string" || !CLAIM_KEY.test(value)) throw new CompetitiveError("invalid_input", "claim_key must be a dotted id such as rival.pricing.pro_monthly.");
  return value;
}
function shortText(value, max, field, required = true) {
  if (value === void 0 || value === null || value === "") {
    if (required) throw new CompetitiveError("invalid_input", `${field} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new CompetitiveError("invalid_input", `${field} must be text.`);
  const clean = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!clean) {
    if (required) throw new CompetitiveError("invalid_input", `${field} is required.`);
    return null;
  }
  if (clean.length > max) throw new CompetitiveError("invalid_input", `${field} is longer than ${max} characters. Keep source text in a Knowledge research note and cite it.`);
  return clean;
}
function validateMarkets(value) {
  const items = value === void 0 || value === null || value === "" ? [] : typeof value === "string" ? value.split(",").map((item) => item.trim()) : value;
  if (!Array.isArray(items)) throw new CompetitiveError("invalid_input", "Markets must be a list.");
  const out = [];
  for (const item of items) {
    const code = typeof item === "string" ? item.trim().toUpperCase() : "";
    if (!MARKET.test(code)) throw new CompetitiveError("invalid_input", "A market is a two-letter country code (TR, IR, DE) or GLOBAL.");
    if (!out.includes(code)) out.push(code);
  }
  if (out.length > COMPETITIVE_LIMITS.maxMarkets) throw new CompetitiveError("invalid_input", `At most ${COMPETITIVE_LIMITS.maxMarkets} markets.`);
  return out.sort();
}
function nameKey(name) {
  return name.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}
var BLOCKED_HOST_SUFFIXES = [".local", ".localhost", ".internal", ".lan", ".home", ".corp", ".test", ".invalid", ".example", ".onion"];
function validateDomain(value) {
  if (typeof value !== "string") throw new CompetitiveError("invalid_input", "A domain must be text.");
  const domain = value.trim().toLowerCase().replace(/\.$/, "");
  if (!domain || domain.length > COMPETITIVE_LIMITS.maxDomainChars) throw new CompetitiveError("invalid_input", "A domain is required.");
  if (/[/:@?#\s\\]/.test(domain)) throw new CompetitiveError("invalid_input", "Give a bare domain such as rival.com, not a URL.");
  if (/^\d+(?:\.\d+){3}$/.test(domain) || domain.includes("[")) throw new CompetitiveError("invalid_input", "An IP address is not a competitor domain.");
  const labels = domain.split(".");
  if (labels.length < 2 || !labels.every((label) => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(label)) || !/^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(labels[labels.length - 1])) {
    throw new CompetitiveError("invalid_input", "That is not a public domain name.");
  }
  if (domain === "localhost" || BLOCKED_HOST_SUFFIXES.some((suffix) => `.${domain}`.endsWith(suffix))) throw new CompetitiveError("invalid_input", "Local and private-use domains are refused.");
  return domain;
}
function hostMatchesDomain(host, domain) {
  const h = host.toLowerCase();
  return h === domain || h.endsWith(`.${domain}`);
}
var DIGITS = { "\u06F0": "0", "\u06F1": "1", "\u06F2": "2", "\u06F3": "3", "\u06F4": "4", "\u06F5": "5", "\u06F6": "6", "\u06F7": "7", "\u06F8": "8", "\u06F9": "9", "\u0660": "0", "\u0661": "1", "\u0662": "2", "\u0663": "3", "\u0664": "4", "\u0665": "5", "\u0666": "6", "\u0667": "7", "\u0668": "8", "\u0669": "9", "\u066C": ",", "\u066B": "." };
function asciiDigits(text2) {
  return text2.normalize("NFKC").replace(/[۰-۹٠-٩٬٫]/g, (ch) => DIGITS[ch] ?? ch);
}
function numbersIn(text2) {
  const out = /* @__PURE__ */ new Set();
  const ascii = asciiDigits(text2);
  for (const match of ascii.matchAll(/\d+/g)) out.add(Number(match[0]));
  for (const match of ascii.matchAll(/\d+(?:[.,\s]\d+)*/g)) {
    const token = match[0].replace(/\s/g, "");
    const dotDecimal = Number(token.replace(/,/g, ""));
    const commaDecimal = Number(token.replace(/\./g, "").replace(",", "."));
    const plain = Number(token.replace(/[.,]/g, ""));
    for (const n of [dotDecimal, commaDecimal, plain]) if (Number.isFinite(n)) out.add(n);
  }
  return [...out];
}
var CURRENCY_CUES = {
  USD: /\$|\busd\b|us\s?\$/i,
  EUR: /€|\beur\b|\beuro/i,
  GBP: /£|\bgbp\b/i,
  TRY: /₺|\btry\b|\btl\b|türk lirası/i,
  IRR: /\birr\b|ریال|rial/i,
  AED: /\baed\b|درهم|dirham/i
};
var PERIOD_CUES = {
  month: /month|\/\s?mo\b|\bmo\b|\bmonthly|\baylık|\bay\b|\/\s?ay\b|ماه/i,
  year: /year|\/\s?yr\b|annual|\byıl|yearly|سال/i,
  one_time: /one[-\s]?time|lifetime|once|tek seferlik|ömür boyu|یک\s?بار/i
};
var TAX_CUE = /\btax|\bvat\b|\bkdv\b|vergi|مالیات|ارزش افزوده/i;
var PROMOTION_CUE = /discount|%\s?off|\boff\b|\bsave\b|\bsale\b|promo|limited|first (?:month|year)|introductory|\bintro\b|launch offer|indirim|kampanya|fırsat|تخفیف|حراج|ویژه/i;
function priceSupport(price, quote) {
  const problems = [];
  const text2 = asciiDigits(quote);
  if (!numbersIn(text2).some((n) => Math.abs(n - price.amount) < 1e-9)) problems.push(`the amount ${price.amount} does not appear in the quote`);
  const currencyCue = CURRENCY_CUES[price.currency];
  if (!(currencyCue ? currencyCue.test(text2) : new RegExp(`\\b${price.currency}\\b`, "i").test(text2))) problems.push(`the currency ${price.currency} is not shown in the quote`);
  if (price.billing_period !== "unknown" && !PERIOD_CUES[price.billing_period].test(text2)) problems.push(`the quote does not state a ${price.billing_period} period; use unknown`);
  if (price.billing_commitment === "annual" && !PERIOD_CUES.year.test(text2)) problems.push("the quote does not state an annual commitment; use unknown");
  if (price.billing_commitment === "monthly" && !PERIOD_CUES.month.test(text2)) problems.push("the quote does not state a monthly commitment; use unknown");
  if (price.tax_inclusion !== "unknown" && !TAX_CUE.test(text2)) problems.push("the quote says nothing about tax; use unknown");
  if (price.promotion === "none_observed" && PROMOTION_CUE.test(text2)) problems.push("the quote reads like a promotion; record promotion as promotional or unknown");
  return { ok: problems.length === 0, problems };
}
function validatePrice(raw) {
  const amount = typeof raw.amount === "number" ? raw.amount : typeof raw.amount === "string" && raw.amount.trim() !== "" ? Number(raw.amount) : NaN;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e12) throw new CompetitiveError("invalid_input", "amount must be a number as shown on the page. Unknown is not zero: leave the price out instead.");
  const currency = typeof raw.currency === "string" ? raw.currency.trim().toUpperCase() : "";
  if (!CURRENCY.test(currency)) throw new CompetitiveError("invalid_input", "currency must be a three-letter code such as USD, EUR or TRY. Prices are never converted.");
  const markets = validateMarkets(raw.market);
  if (markets.length !== 1 || markets[0] === "GLOBAL") throw new CompetitiveError("invalid_input", "A price needs the one country market it was observed for (TR, US\u2026).");
  return {
    offer_name: shortText(raw.offer_name, COMPETITIVE_LIMITS.maxOfferChars, "offer_name"),
    amount,
    currency,
    billing_period: oneOf(raw.billing_period ?? "unknown", BILLING_PERIODS, "billing_period"),
    billing_commitment: oneOf(raw.billing_commitment ?? "unknown", BILLING_COMMITMENTS, "billing_commitment"),
    market: markets[0],
    tax_inclusion: oneOf(raw.tax_inclusion ?? "unknown", TAX_INCLUSIONS, "tax_inclusion"),
    promotion: oneOf(raw.promotion ?? "unknown", PROMOTIONS, "promotion"),
    feature_scope: shortText(raw.feature_scope, COMPETITIVE_LIMITS.maxScopeChars, "feature_scope", false)
  };
}
function priceCaveats(price) {
  const out = [];
  if (price.billing_period === "unknown") out.push("billing_period_unknown");
  if (price.billing_commitment === "unknown") out.push("billing_commitment_unknown");
  if (price.billing_commitment === "annual" && price.billing_period === "month") out.push("monthly_rate_billed_annually");
  if (price.tax_inclusion === "unknown") out.push("tax_unknown");
  if (price.promotion !== "none_observed") out.push(price.promotion === "promotional" ? "promotional_price" : "promotion_unknown");
  if (!price.feature_scope) out.push("feature_scope_unknown");
  return out;
}

// packages/brand-core/src/content-bridge/calendar-model.ts
var CALENDAR_SCHEMA_VERSION = 1;
var CALENDAR_DIR = "brand/.private/content/calendar";
var WEEK_APPROVAL_DOMAIN = "brand-os/content-week-approval/v1";
var WEEK_ID = /^wk-(\d{4}-\d{2}-\d{2})$/;
var DATE = /^\d{4}-\d{2}-\d{2}$/;
var SLOT_ID = /^s\d{2,3}$/;
var RESEARCH_REF = /^knowledge:kn_[a-z0-9][a-z0-9-]{2,63}@[0-9a-f]{64}$/;
var CALENDAR_LIMITS = { maxWeeks: 12, maxSlots: 120, maxGaps: 60, maxHookChars: 200, maxAngleChars: 280, maxNoteChars: 280, maxFileBytes: 512 * 1024, maxRevisions: 200 };
var SLOT_STATES = ["idea", "planned", "skipped"];
var CALENDAR_GAP_REASONS = ["cadence_not_decided", "formats_not_decided", "no_pillars", "no_key_message", "channel_not_in_strategy", "no_source", "no_research"];
var CONFIDENCE = ["high", "medium", "low"];
function parseDate(value, field) {
  if (typeof value !== "string" || !DATE.test(value)) throw new StrategyError("invalid_input", `${field} must be a date like 2026-12-07.`);
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new StrategyError("invalid_input", `${field} is not a real date (${value}).`);
  return date;
}
function isoDate(date) {
  return date.toISOString().slice(0, 10);
}
function addDays(date, days) {
  return new Date(date.getTime() + days * 864e5);
}
function mondayOf(date) {
  return addDays(date, -((date.getUTCDay() + 6) % 7));
}
function weekIdOf(monday) {
  return `wk-${isoDate(monday)}`;
}
function validateWeekId(value) {
  const match = typeof value === "string" ? WEEK_ID.exec(value) : null;
  if (!match) throw new StrategyError("invalid_input", "A week id is wk-YYYY-MM-DD, the Monday the week starts (for example wk-2026-12-07).");
  const date = parseDate(match[1], "week id");
  if (date.getUTCDay() !== 1) throw new StrategyError("invalid_input", `${String(value)} does not start on a Monday.`);
  return value;
}
function weekContentDigest(rev) {
  return sha256Hex(canonicalJson({ kind: "content_week", week_id: rev.week_id, brand_slug: rev.brand_slug, revision: rev.revision, supersedes_revision: rev.supersedes_revision, content: rev.content }));
}
function weekApprovalDigest(input) {
  return sha256Hex(canonicalJson({ kind: "content_week_approval", ...input }));
}
function objectOf(value, field, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new StrategyError("invalid_input", `${field} must be an object.`);
  const o = value;
  for (const key of Object.keys(o)) if (!keys.includes(key)) throw new StrategyError("invalid_input", `${field} has an unknown key ${key}.`);
  return o;
}
function listOf2(value, field, max) {
  if (value === void 0 || value === null) return [];
  if (!Array.isArray(value)) throw new StrategyError("invalid_input", `${field} must be a list.`);
  if (value.length > max) throw new StrategyError("invalid_input", `${field} has more than ${max} items.`);
  return value;
}
function oneOf2(value, allowed, field) {
  if (typeof value !== "string" || !allowed.includes(value)) throw new StrategyError("invalid_input", `${field} must be one of ${allowed.join(", ")}.`);
  return value;
}
function matching(value, pattern, field) {
  if (typeof value !== "string" || !pattern.test(value)) throw new StrategyError("invalid_input", `${field} is not valid.`);
  return value;
}
function nullableFact(value, field) {
  return value === null || value === void 0 ? null : matching(value, FACT_ID, field);
}
function optionalText(value, field, max) {
  if (value === null || value === void 0 || value === "") return null;
  return text(value, field, max);
}
function parseResearch(value, field) {
  if (value === null || value === void 0) return null;
  const r = objectOf(value, field, ["observation_id", "ref", "competitor_id", "dimension", "confidence", "basis"]);
  return {
    observation_id: matching(r.observation_id, OBSERVATION_ID, `${field}.observation_id`),
    ref: matching(r.ref, RESEARCH_REF, `${field}.ref`),
    competitor_id: matching(r.competitor_id, COMPETITOR_ID, `${field}.competitor_id`),
    dimension: matching(r.dimension, /^[a-z_]{2,40}$/, `${field}.dimension`),
    confidence: oneOf2(r.confidence, CONFIDENCE, `${field}.confidence`),
    basis: matching(r.basis, /^[a-z_]{2,40}$/, `${field}.basis`)
  };
}
function parseWeekContent(raw) {
  const w = objectOf(raw, "week", ["schema", "week_id", "week_start", "week_end", "strategy", "languages", "slots", "gaps", "fact_refs", "research_refs"]);
  if (w.schema !== 1) throw new StrategyError("invalid_input", "week.schema must be 1.");
  const weekId = validateWeekId(w.week_id);
  const start = isoDate(parseDate(w.week_start, "week.week_start"));
  const end = isoDate(parseDate(w.week_end, "week.week_end"));
  if (`wk-${start}` !== weekId || isoDate(addDays(parseDate(start, "week_start"), 6)) !== end) throw new StrategyError("invalid_input", "week_start and week_end must be the Monday and Sunday of week_id.");
  const s = objectOf(w.strategy, "week.strategy", ["strategy_id", "revision", "content_sha256"]);
  const strategy = { strategy_id: validateStrategyId(s.strategy_id), revision: validateRevisionNumber(s.revision), content_sha256: validateSha(s.content_sha256, "week.strategy.content_sha256") };
  const languages = listOf2(w.languages, "week.languages", 10).map((item, i) => matching(item, LOCALE, `week.languages[${i}]`));
  if (!languages.length) throw new StrategyError("invalid_input", "week.languages needs at least one language.");
  const ids = /* @__PURE__ */ new Set();
  const slots = listOf2(w.slots, "week.slots", CALENDAR_LIMITS.maxSlots).map((item, i) => {
    const f = `week.slots[${i}]`;
    const o = objectOf(item, f, ["id", "date", "channel", "format", "pillar", "language", "objective", "key_message", "offer", "cta", "hook", "angle", "notes", "research", "status", "fact_refs"]);
    const id = matching(o.id, SLOT_ID, `${f}.id`);
    if (ids.has(id)) throw new StrategyError("invalid_input", `week.slots has ${id} twice.`);
    ids.add(id);
    const date = isoDate(parseDate(o.date, `${f}.date`));
    if (date < start || date > end) throw new StrategyError("invalid_input", `${f}.date ${date} is outside ${weekId}.`);
    const language = matching(o.language, LOCALE, `${f}.language`);
    if (!languages.includes(language)) throw new StrategyError("invalid_input", `${f}.language ${language} is not in week.languages.`);
    return {
      id,
      date,
      channel: oneOf2(o.channel, CONTENT_CHANNELS, `${f}.channel`),
      format: o.format === null || o.format === void 0 ? null : oneOf2(o.format, CONTENT_FORMATS, `${f}.format`),
      pillar: o.pillar === null || o.pillar === void 0 ? null : matching(o.pillar, ITEM_ID, `${f}.pillar`),
      language,
      objective: [...new Set(listOf2(o.objective, `${f}.objective`, 10).map((id2, j) => matching(id2, FACT_ID, `${f}.objective[${j}]`)))],
      key_message: nullableFact(o.key_message, `${f}.key_message`),
      offer: nullableFact(o.offer, `${f}.offer`),
      cta: nullableFact(o.cta, `${f}.cta`),
      hook: optionalText(o.hook, `${f}.hook`, CALENDAR_LIMITS.maxHookChars),
      angle: optionalText(o.angle, `${f}.angle`, CALENDAR_LIMITS.maxAngleChars),
      notes: optionalText(o.notes, `${f}.notes`, CALENDAR_LIMITS.maxNoteChars),
      research: parseResearch(o.research, `${f}.research`),
      status: oneOf2(o.status, SLOT_STATES, `${f}.status`),
      fact_refs: [...new Set(listOf2(o.fact_refs, `${f}.fact_refs`, 30).map((id2, j) => matching(id2, FACT_ID, `${f}.fact_refs[${j}]`)))]
    };
  });
  const gaps = listOf2(w.gaps, "week.gaps", CALENDAR_LIMITS.maxGaps).map((item, i) => {
    const g = objectOf(item, `week.gaps[${i}]`, ["channel", "reason"]);
    return { channel: g.channel === null || g.channel === void 0 ? null : oneOf2(g.channel, CONTENT_CHANNELS, `week.gaps[${i}].channel`), reason: oneOf2(g.reason, CALENDAR_GAP_REASONS, `week.gaps[${i}].reason`) };
  });
  const factRefs = listOf2(w.fact_refs, "week.fact_refs", 60).map((item, i) => {
    const r = objectOf(item, `week.fact_refs[${i}]`, ["id", "revision"]);
    return { id: matching(r.id, FACT_ID, `week.fact_refs[${i}].id`), revision: matching(r.revision, /^[A-Za-z0-9_.:-]{1,200}$/, `week.fact_refs[${i}].revision`) };
  });
  const researchRefs = [...new Set(listOf2(w.research_refs, "week.research_refs", 60).map((item, i) => matching(item, RESEARCH_REF, `week.research_refs[${i}]`)))];
  return { schema: 1, week_id: weekId, week_start: start, week_end: end, strategy, languages, slots, gaps, fact_refs: factRefs, research_refs: researchRefs };
}
function slotFactIds(slot) {
  return [.../* @__PURE__ */ new Set([...slot.fact_refs, ...slot.objective, ...[slot.key_message, slot.offer, slot.cta].filter((id) => id !== null)])];
}

// packages/brand-core/src/content-bridge/claims.ts
function normalizeClaimText(value) {
  const lower = value.normalize("NFKC").replace(/İ/g, "i").replace(/I/g, "i").toLowerCase().replace(/\u200c|\u200d|\u0640/g, "").replace(/[ي]/g, "\u06CC").replace(/[ك]/g, "\u06A9");
  return ` ${lower.replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim()} `;
}
function words(normalized) {
  return normalized.trim().split(" ").filter((word) => [...word].length >= 4);
}
function containsClaim(textValue, banned) {
  const t = normalizeClaimText(textValue);
  const b = normalizeClaimText(banned);
  if (b.trim().length < 2) return false;
  if (t.includes(b)) return true;
  const significant = words(b);
  return significant.length >= 2 && significant.every((word) => t.includes(` ${word} `));
}
var AVAILABLE_NOW = ["available now", "available today", "now available", "out now", "in stock", "buy now", "order now", "shop now", "download now", "\u0647\u0645 \u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633", "\u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633", "\u0627\u0644\u0627\u0646 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633", "\u0645\u0648\u062C\u0648\u062F \u0627\u0633\u062A", "\u0647\u0645\u06CC\u0646 \u062D\u0627\u0644\u0627 \u0628\u062E\u0631\u06CC\u062F", "\u015Fimdi mevcut", "\u015Fimdi sat\u0131\u015Fta", "hemen sat\u0131n al", "stokta", "\u015Fimdi indir"];
var ANY_AVAILABILITY = [...AVAILABLE_NOW, "available", "launched", "pre order", "preorder", "\u062F\u0631 \u062F\u0633\u062A\u0631\u0633", "\u0645\u0648\u062C\u0648\u062F", "\u067E\u06CC\u0634 \u062E\u0631\u06CC\u062F", "mevcut", "sat\u0131\u015Fta", "\xF6n sipari\u015F"];
function availabilityConflict(textValue, rule) {
  if (!rule || rule === "available") return null;
  const t = normalizeClaimText(textValue);
  const list2 = rule === "coming-soon" ? AVAILABLE_NOW : ANY_AVAILABILITY;
  return list2.find((phrase) => t.includes(normalizeClaimText(phrase))) ?? null;
}
function claimConflicts(field, value, banned, availability) {
  if (!value) return [];
  const out = [];
  for (const rule of banned) if (containsClaim(value, rule.text)) out.push({ kind: "banned", rule: rule.text, source: rule.source, field });
  const hit = availabilityConflict(value, availability);
  if (hit) out.push({ kind: "availability", rule: availability, source: "business.marketing.availability_claim", field });
  return out;
}

// packages/brand-core/src/content-bridge/calendar-i18n.ts
var CAL_TEXT = {
  // planner
  plan_several: {
    en: "Several content strategies are served ({list}). Choose one with --strategy <id>.",
    fa: "\u0686\u0646\u062F \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627 \u0627\u0631\u0627\u0626\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F ({list}). \u06CC\u06A9\u06CC \u0631\u0627 \u0628\u0627 --strategy <id> \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.",
    tr: "Birden fazla i\xE7erik stratejisi sunuluyor ({list}). --strategy <id> ile birini se\xE7in."
  },
  plan_aligned: {
    en: "Weeks run Monday to Sunday: {from} was moved to the Monday {monday}.",
    fa: "\u0647\u0641\u062A\u0647\u200C\u0647\u0627 \u0627\u0632 \u062F\u0648\u0634\u0646\u0628\u0647 \u062A\u0627 \u06CC\u06A9\u0634\u0646\u0628\u0647\u200C\u0627\u0646\u062F: {from} \u0628\u0647 \u062F\u0648\u0634\u0646\u0628\u0647\u0654 {monday} \u0645\u0646\u062A\u0642\u0644 \u0634\u062F.",
    tr: "Haftalar pazartesiden pazara s\xFCrer: {from}, {monday} pazartesisine al\u0131nd\u0131."
  },
  plan_research: {
    en: "{n} competitive observations were cited as research angles, each with its confidence. Their text stays in the research notes.",
    fa: "{n} \u0645\u0634\u0627\u0647\u062F\u0647\u0654 \u0631\u0642\u0627\u0628\u062A\u06CC \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0632\u0627\u0648\u06CC\u0647\u0654 \u067E\u0698\u0648\u0647\u0634\u06CC\u060C \u0647\u0631 \u06A9\u062F\u0627\u0645 \u0628\u0627 \u0645\u06CC\u0632\u0627\u0646 \u0627\u0637\u0645\u06CC\u0646\u0627\u0646\u0634\u060C \u0627\u0631\u062C\u0627\u0639 \u062F\u0627\u062F\u0647 \u0634\u062F. \u0645\u062A\u0646 \u0622\u0646\u200C\u0647\u0627 \u062F\u0631 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    tr: "{n} rakip g\xF6zlemi, her biri g\xFCven d\xFCzeyiyle birlikte ara\u015Ft\u0131rma a\xE7\u0131s\u0131 olarak at\u0131f yap\u0131ld\u0131. Metinleri ara\u015Ft\u0131rma notlar\u0131nda kal\u0131r."
  },
  // gaps
  cal_gap_cadence_not_decided: {
    en: "{channel}: cadence is not decided in the approved strategy, so no slots were planned. Set it in a new strategy revision.",
    fa: "{channel}: \u062A\u0646\u0627\u0648\u0628 \u0627\u0646\u062A\u0634\u0627\u0631 \u062F\u0631 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647\u060C \u067E\u0633 \u0647\u06CC\u0686 \u062C\u0627\u06CC\u06AF\u0627\u0647\u06CC \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0646\u0634\u062F. \u0622\u0646 \u0631\u0627 \u062F\u0631 \u0646\u0633\u062E\u0647\u0654 \u062A\u0627\u0632\u0647\u0654 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646\u06CC\u062F.",
    tr: "{channel}: onayl\u0131 stratejide yay\u0131n s\u0131kl\u0131\u011F\u0131 belirlenmedi, bu y\xFCzden hi\xE7 yer planlanmad\u0131. Yeni bir strateji s\xFCr\xFCm\xFCnde belirleyin."
  },
  cal_gap_formats_not_decided: {
    en: "{channel}: no formats are decided, so slots have no format. The owner or writer chooses one before producing.",
    fa: "{channel}: \u0647\u06CC\u0686 \u0642\u0627\u0644\u0628\u06CC \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647\u060C \u067E\u0633 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0642\u0627\u0644\u0628 \u0646\u062F\u0627\u0631\u0646\u062F. \u0645\u0627\u0644\u06A9 \u06CC\u0627 \u0646\u0648\u06CC\u0633\u0646\u062F\u0647 \u067E\u06CC\u0634 \u0627\u0632 \u062A\u0648\u0644\u06CC\u062F \u06CC\u06A9\u06CC \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "{channel}: hi\xE7bir format belirlenmedi, bu y\xFCzden yerlerin format\u0131 yok. Sahip veya yazar \xFCretimden \xF6nce birini se\xE7er."
  },
  cal_gap_no_pillars: {
    en: "{channel}: the strategy has no pillars, so slots have no pillar.",
    fa: "{channel}: \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0633\u062A\u0648\u0646 \u0645\u062D\u062A\u0648\u0627\u06CC\u06CC \u0646\u062F\u0627\u0631\u062F\u060C \u067E\u0633 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0633\u062A\u0648\u0646 \u0646\u062F\u0627\u0631\u0646\u062F.",
    tr: "{channel}: stratejinin i\xE7erik s\xFCtunu yok, bu y\xFCzden yerlerin s\xFCtunu yok."
  },
  cal_gap_no_key_message: {
    en: "No approved messaging or offer fact is cited by the strategy, so slots have no key message.",
    fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u067E\u06CC\u0627\u0645 \u06CC\u0627 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0627\u0631\u062C\u0627\u0639 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u067E\u0633 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u067E\u06CC\u0627\u0645 \u0627\u0635\u0644\u06CC \u0646\u062F\u0627\u0631\u0646\u062F.",
    tr: "Strateji onayl\u0131 bir mesaj veya teklif bilgisine at\u0131f yapm\u0131yor, bu y\xFCzden yerlerin ana mesaj\u0131 yok."
  },
  cal_gap_channel_not_in_strategy: {
    en: "{channel} is not a channel of the approved strategy. Nothing was planned for it.",
    fa: "{channel} \u06A9\u0627\u0646\u0627\u0644\u06CC \u0627\u0632 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A. \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC\u0634 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0646\u0634\u062F.",
    tr: "{channel} onayl\u0131 stratejinin bir kanal\u0131 de\u011Fil. Onun i\xE7in hi\xE7bir \u015Fey planlanmad\u0131."
  },
  cal_gap_no_source: {
    en: "{channel}: some slots would cite no approved fact, so they were left out.",
    fa: "{channel}: \u0628\u0631\u062E\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0628\u0647 \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0631\u062C\u0627\u0639 \u0646\u0645\u06CC\u200C\u062F\u0627\u062F\u0646\u062F\u060C \u067E\u0633 \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F\u0646\u062F.",
    tr: "{channel}: baz\u0131 yerler hi\xE7bir onayl\u0131 bilgiye at\u0131f yapmayacakt\u0131, bu y\xFCzden d\u0131\u015Far\u0131da b\u0131rak\u0131ld\u0131."
  },
  cal_gap_no_research: {
    en: "Research angles were asked for, but no usable competitive observation exists. Record sources with brand:competitive.",
    fa: "\u0632\u0627\u0648\u06CC\u0647\u0654 \u067E\u0698\u0648\u0647\u0634\u06CC \u062E\u0648\u0627\u0633\u062A\u0647 \u0634\u062F\u060C \u0627\u0645\u0627 \u0647\u06CC\u0686 \u0645\u0634\u0627\u0647\u062F\u0647\u0654 \u0631\u0642\u0627\u0628\u062A\u06CC \u0642\u0627\u0628\u0644\u200C\u0627\u0633\u062A\u0641\u0627\u062F\u0647\u200C\u0627\u06CC \u0646\u06CC\u0633\u062A. \u0645\u0646\u0627\u0628\u0639 \u0631\u0627 \u0628\u0627 brand:competitive \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F.",
    tr: "Ara\u015Ft\u0131rma a\xE7\u0131lar\u0131 istendi ama kullan\u0131labilir bir rakip g\xF6zlemi yok. Kaynaklar\u0131 brand:competitive ile kaydedin."
  },
  // blockers
  cal_block_strategy_not_served: {
    en: "Content strategy {id}@{rev} is not served now (draft, needs review, expired or withdrawn). Approve a strategy, then plan again.",
    fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627\u06CC {id}@{rev} \u0627\u06A9\u0646\u0648\u0646 \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u0646\u06CC\u0627\u0632\u0645\u0646\u062F \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u060C \u0645\u0646\u0642\u0636\u06CC \u06CC\u0627 \u067E\u0633\u200C\u06AF\u0631\u0641\u062A\u0647). \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F \u0648 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u06A9\u0646\u06CC\u062F.",
    tr: "{id}@{rev} i\xE7erik stratejisi \u015Fu anda sunulmuyor (taslak, inceleme gerekli, s\xFCresi dolmu\u015F veya geri \xE7ekilmi\u015F). Bir stratejiyi onaylay\u0131n, sonra yeniden planlay\u0131n."
  },
  cal_block_strategy_changed: {
    en: "The week was planned from {id}@{rev}, but revision {now} is served now. Plan the week again.",
    fa: "\u0627\u06CC\u0646 \u0647\u0641\u062A\u0647 \u0627\u0632 {id}@{rev} \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0634\u062F\u060C \u0627\u0645\u0627 \u0627\u06A9\u0646\u0648\u0646 \u0646\u0633\u062E\u0647\u0654 {now} \u0627\u0631\u0627\u0626\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u0641\u062A\u0647 \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u06A9\u0646\u06CC\u062F.",
    tr: "Hafta {id}@{rev} s\xFCr\xFCm\xFCnden planland\u0131, ama \u015Fimdi {now} s\xFCr\xFCm\xFC sunuluyor. Haftay\u0131 yeniden planlay\u0131n."
  },
  cal_block_fact_restricted: {
    en: "Fact {fact} is restricted and is never cited by the calendar.",
    fa: "\u0648\u0627\u0642\u0639\u06CC\u062A {fact} \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0627\u0633\u062A \u0648 \u062A\u0642\u0648\u06CC\u0645 \u0647\u0631\u06AF\u0632 \u0628\u0647 \u0622\u0646 \u0627\u0631\u062C\u0627\u0639 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "{fact} bilgisi k\u0131s\u0131tl\u0131d\u0131r ve takvim ona asla at\u0131f yapmaz."
  },
  cal_block_fact_changed: {
    en: "Fact {fact} is {state} since the week was planned.",
    fa: "\u0648\u0627\u0642\u0639\u06CC\u062A {fact} \u0627\u0632 \u0632\u0645\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0627\u06CC\u0646 \u0647\u0641\u062A\u0647 {state} \u0627\u0633\u062A.",
    tr: "{fact} bilgisi hafta planland\u0131\u011F\u0131ndan beri {state} durumunda."
  },
  cal_block_research_changed: {
    en: "Research source {ref} is {state} since it was cited.",
    fa: "\u0645\u0646\u0628\u0639 \u067E\u0698\u0648\u0647\u0634\u06CC {ref} \u0627\u0632 \u0632\u0645\u0627\u0646 \u0627\u0631\u062C\u0627\u0639 {state} \u0627\u0633\u062A.",
    tr: "{ref} ara\u015Ft\u0131rma kayna\u011F\u0131 at\u0131f yap\u0131ld\u0131\u011F\u0131ndan beri {state} durumunda."
  },
  cal_block_language_not_in_strategy: {
    en: "Slot {slot}: language {lang} is not a language of the strategy for this channel.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot}: \u0632\u0628\u0627\u0646 {lang} \u0627\u0632 \u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u06A9\u0627\u0646\u0627\u0644 \u0646\u06CC\u0633\u062A.",
    tr: "{slot} yeri: {lang} dili bu kanal i\xE7in stratejinin dillerinden biri de\u011Fil."
  },
  cal_block_slot_no_source: {
    en: "Slot {slot} cites no approved fact. Every slot serves an approved fact.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0628\u0647 \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0631\u062C\u0627\u0639 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F. \u0647\u0631 \u062C\u0627\u06CC\u06AF\u0627\u0647 \u0628\u0627\u06CC\u062F \u062F\u0631 \u062E\u062F\u0645\u062A \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0627\u0634\u062F.",
    tr: "{slot} yeri hi\xE7bir onayl\u0131 bilgiye at\u0131f yapm\u0131yor. Her yer onayl\u0131 bir bilgiye hizmet eder."
  },
  cal_block_fact_not_pinned: {
    en: "Slot {slot} cites {fact}, which is not pinned in the week fact_refs.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0628\u0647 {fact} \u0627\u0631\u062C\u0627\u0639 \u0645\u06CC\u200C\u062F\u0647\u062F \u06A9\u0647 \u062F\u0631 fact_refs \u0647\u0641\u062A\u0647 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "{slot} yeri {fact} bilgisine at\u0131f yap\u0131yor, ama bu haftan\u0131n fact_refs listesinde sabitlenmemi\u015F."
  },
  cal_block_fact_not_in_strategy: {
    en: "Slot {slot} cites {fact}, which the approved content strategy does not cite.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0628\u0647 {fact} \u0627\u0631\u062C\u0627\u0639 \u0645\u06CC\u200C\u062F\u0647\u062F \u06A9\u0647 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0647 \u0622\u0646 \u0627\u0631\u062C\u0627\u0639 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
    tr: "{slot} yeri {fact} bilgisine at\u0131f yap\u0131yor, ama onayl\u0131 i\xE7erik stratejisi buna at\u0131f yapm\u0131yor."
  },
  cal_block_research_not_pinned: {
    en: "Slot {slot} cites a research source that is not in the week research_refs.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0628\u0647 \u0645\u0646\u0628\u0639 \u067E\u0698\u0648\u0647\u0634\u06CC\u200C\u0627\u06CC \u0627\u0631\u062C\u0627\u0639 \u0645\u06CC\u200C\u062F\u0647\u062F \u06A9\u0647 \u062F\u0631 research_refs \u0647\u0641\u062A\u0647 \u0646\u06CC\u0633\u062A.",
    tr: "{slot} yeri, haftan\u0131n research_refs listesinde olmayan bir ara\u015Ft\u0131rma kayna\u011F\u0131na at\u0131f yap\u0131yor."
  },
  cal_block_channel_not_in_strategy: {
    en: "Slot {slot}: {channel} is not a channel of the approved strategy.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot}: {channel} \u06A9\u0627\u0646\u0627\u0644\u06CC \u0627\u0632 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A.",
    tr: "{slot} yeri: {channel} onayl\u0131 stratejinin bir kanal\u0131 de\u011Fil."
  },
  cal_block_format_not_in_channel: {
    en: "Slot {slot}: format {format} is not approved for {channel}.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot}: \u0642\u0627\u0644\u0628 {format} \u0628\u0631\u0627\u06CC {channel} \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "{slot} yeri: {format} format\u0131 {channel} i\xE7in onayl\u0131 de\u011Fil."
  },
  cal_block_pillar_unknown: {
    en: "Slot {slot}: pillar {pillar} is not a pillar of the approved strategy.",
    fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 {slot}: \u0633\u062A\u0648\u0646 {pillar} \u0627\u0632 \u0633\u062A\u0648\u0646\u200C\u0647\u0627\u06CC \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A.",
    tr: "{slot} yeri: {pillar} s\xFCtunu onayl\u0131 stratejinin bir s\xFCtunu de\u011Fil."
  },
  cal_block_banned_claim: {
    en: 'Slot {slot} {field} contradicts the banned claim "{rule}". Rewrite it.',
    fa: "{field} \u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0628\u0627 \u0627\u062F\u0639\u0627\u06CC \u0645\u0645\u0646\u0648\u0639 \xAB{rule}\xBB \u062F\u0631 \u062A\u0636\u0627\u062F \u0627\u0633\u062A. \u0622\u0646 \u0631\u0627 \u0628\u0627\u0632\u0646\u0648\u06CC\u0633\u06CC \u06A9\u0646\u06CC\u062F.",
    tr: '{slot} yerinin {field} alan\u0131 "{rule}" yasak iddias\u0131yla \xE7eli\u015Fiyor. Yeniden yaz\u0131n.'
  },
  cal_block_availability_claim: {
    en: "Slot {slot} {field} states availability, but the approved availability rule is {rule}. Rewrite it.",
    fa: "{field} \u062C\u0627\u06CC\u06AF\u0627\u0647 {slot} \u0627\u0632 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0628\u0648\u062F\u0646 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F\u060C \u0627\u0645\u0627 \u0642\u0627\u0639\u062F\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062F\u0633\u062A\u0631\u0633\u06CC {rule} \u0627\u0633\u062A. \u0622\u0646 \u0631\u0627 \u0628\u0627\u0632\u0646\u0648\u06CC\u0633\u06CC \u06A9\u0646\u06CC\u062F.",
    tr: "{slot} yerinin {field} alan\u0131 bulunurluk belirtiyor, ama onayl\u0131 bulunurluk kural\u0131 {rule}. Yeniden yaz\u0131n."
  },
  cal_block_integrity: {
    en: "{week} does not verify (edited after it was written or approved). It is not served.",
    fa: "{week} \u0627\u0639\u062A\u0628\u0627\u0631\u0633\u0646\u062C\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F (\u067E\u0633 \u0627\u0632 \u0646\u0648\u0634\u062A\u0646 \u06CC\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F\u0647). \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{week} do\u011Frulanam\u0131yor (yaz\u0131ld\u0131ktan veya onayland\u0131ktan sonra d\xFCzenlenmi\u015F). Sunulmuyor."
  },
  cal_block_not_draft: {
    en: "Revision {rev} is {state}. Only a draft can be approved or rejected.",
    fa: "\u0646\u0633\u062E\u0647\u0654 {rev} \u062F\u0631 \u0648\u0636\u0639\u06CC\u062A {state} \u0627\u0633\u062A. \u0641\u0642\u0637 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0631\u0627 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u062A\u0623\u06CC\u06CC\u062F \u06CC\u0627 \u0631\u062F \u06A9\u0631\u062F.",
    tr: "{rev} s\xFCr\xFCm\xFC {state} durumunda. Yaln\u0131zca taslak onaylanabilir veya reddedilebilir."
  },
  cal_block_approved_changed: {
    en: "The approved revision of this week changed since the draft (was {was}, now {now}). Plan or propose again.",
    fa: "\u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0627\u06CC\u0646 \u0647\u0641\u062A\u0647 \u067E\u0633 \u0627\u0632 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F (\u0642\u0628\u0644\u0627\u064B {was}\u060C \u0627\u06A9\u0646\u0648\u0646 {now}). \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u06CC\u0627 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u06A9\u0646\u06CC\u062F.",
    tr: "Bu haftan\u0131n onayl\u0131 s\xFCr\xFCm\xFC taslaktan sonra de\u011Fi\u015Fti (\xF6nce {was}, \u015Fimdi {now}). Yeniden planlay\u0131n veya \xF6nerin."
  },
  cal_block_week_past: {
    en: "{week} is over. A past week cannot be approved.",
    fa: "{week} \u062A\u0645\u0627\u0645 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0647\u0641\u062A\u0647\u0654 \u06AF\u0630\u0634\u062A\u0647 \u0631\u0627 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0631\u062F.",
    tr: "{week} sona erdi. Ge\xE7mi\u015F bir hafta onaylanamaz."
  },
  cal_block_share_not_approved: {
    en: "{week} has no approved revision. Approve it before sharing.",
    fa: "{week} \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0646\u062F\u0627\u0631\u062F. \u067E\u06CC\u0634 \u0627\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC \u0622\u0646 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
    tr: "{week} i\xE7in onayl\u0131 bir s\xFCr\xFCm yok. Payla\u015Fmadan \xF6nce onaylay\u0131n."
  },
  cal_block_share_not_current: {
    en: "{week} is {status}, not current. Only a current approved week is shared.",
    fa: "{week} \u062F\u0631 \u0648\u0636\u0639\u06CC\u062A {status} \u0627\u0633\u062A\u060C \u0646\u0647 \u062C\u0627\u0631\u06CC. \u0641\u0642\u0637 \u0647\u0641\u062A\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062C\u0627\u0631\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{week} {status} durumunda, g\xFCncel de\u011Fil. Yaln\u0131zca g\xFCncel onayl\u0131 bir hafta payla\u015F\u0131l\u0131r."
  },
  // CLI
  plan_header: { en: "Draft calendar (not stored) from {id}@{rev}", fa: "\u062A\u0642\u0648\u06CC\u0645 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 (\u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F\u0647) \u0627\u0632 {id}@{rev}", tr: "{id}@{rev} kaynakl\u0131 taslak takvim (kaydedilmedi)" },
  week: { en: "Week", fa: "\u0647\u0641\u062A\u0647", tr: "Hafta" },
  no_slots: { en: "no slots", fa: "\u0628\u062F\u0648\u0646 \u062C\u0627\u06CC\u06AF\u0627\u0647", tr: "yer yok" },
  stored_week: {
    en: "Stored draft {id} revision {n}. Agents and the calendar view cannot see it. Review: npm run brand:content -- week review --week {id} --revision {n}",
    fa: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 {id} \u0646\u0633\u062E\u0647\u0654 {n} \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F. \u0639\u0627\u0645\u0644\u200C\u0647\u0627 \u0648 \u0646\u0645\u0627\u06CC \u062A\u0642\u0648\u06CC\u0645 \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u0628\u06CC\u0646\u0646\u062F. \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC: npm run brand:content -- week review --week {id} --revision {n}",
    tr: "{id} tasla\u011F\u0131, s\xFCr\xFCm {n} kaydedildi. Ajanlar ve takvim g\xF6r\xFCn\xFCm\xFC onu g\xF6remez. \u0130nceleme: npm run brand:content -- week review --week {id} --revision {n}"
  },
  written_plan: {
    en: "Weeks written to {list}. Edit hooks, angles or status, then: npm run brand:content -- week propose --file <week.json> (one week per file, from the weeks list).",
    fa: "\u0647\u0641\u062A\u0647\u200C\u0647\u0627 \u062F\u0631 {list} \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0646\u062F. \u0642\u0644\u0627\u0628\u060C \u0632\u0627\u0648\u06CC\u0647 \u06CC\u0627 \u0648\u0636\u0639\u06CC\u062A \u0631\u0627 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0646\u06CC\u062F\u060C \u0633\u067E\u0633: npm run brand:content -- week propose --file <week.json> (\u0647\u0631 \u0641\u0627\u06CC\u0644 \u06CC\u06A9 \u0647\u0641\u062A\u0647 \u0627\u0632 \u0641\u0647\u0631\u0633\u062A weeks).",
    tr: "Haftalar {list} dosyas\u0131na yaz\u0131ld\u0131. Kanca, a\xE7\u0131 veya durumu d\xFCzenleyin, sonra: npm run brand:content -- week propose --file <week.json> (dosya ba\u015F\u0131na bir hafta, weeks listesinden)."
  },
  plan_store_hint: {
    en: "Nothing was stored. Add --out <file> to edit first, or --store to store each week as a draft now.",
    fa: "\u0686\u06CC\u0632\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F. \u0628\u0631\u0627\u06CC \u0648\u06CC\u0631\u0627\u06CC\u0634\u060C --out <file> \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u06CC\u0627 \u0628\u0627 --store \u0647\u0631 \u0647\u0641\u062A\u0647 \u0631\u0627 \u0647\u0645\u06CC\u0646 \u062D\u0627\u0644\u0627 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0630\u062E\u06CC\u0631\u0647 \u06A9\u0646\u06CC\u062F.",
    tr: "Hi\xE7bir \u015Fey kaydedilmedi. \xD6nce d\xFCzenlemek i\xE7in --out <file> ekleyin veya her haftay\u0131 \u015Fimdi taslak olarak kaydetmek i\xE7in --store kullan\u0131n."
  },
  approved_week: {
    en: "Approved {id} revision {n}. It authorizes no post, schedule, publication, ad or spend.",
    fa: "{id} \u0646\u0633\u062E\u0647\u0654 {n} \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F. \u0647\u06CC\u0686 \u0627\u0631\u0633\u0627\u0644\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u062A\u0628\u0644\u06CC\u063A \u06CC\u0627 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "{id} s\xFCr\xFCm {n} onayland\u0131. Hi\xE7bir payla\u015F\u0131m, zamanlama, yay\u0131n, reklam veya harcamaya izin vermez."
  },
  rejected_week: { en: "Rejected {id} revision {n}. It stays on disk and is never served.", fa: "{id} \u0646\u0633\u062E\u0647\u0654 {n} \u0631\u062F \u0634\u062F. \u0631\u0648\u06CC \u062F\u06CC\u0633\u06A9 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F \u0648 \u0647\u0631\u06AF\u0632 \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "{id} s\xFCr\xFCm {n} reddedildi. Diskte kal\u0131r ve asla sunulmaz." },
  none_calendar: { en: "No approved calendar week is served in this range.", fa: "\u062F\u0631 \u0627\u06CC\u0646 \u0628\u0627\u0632\u0647 \u0647\u06CC\u0686 \u0647\u0641\u062A\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0632 \u062A\u0642\u0648\u06CC\u0645 \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "Bu aral\u0131kta sunulan onayl\u0131 bir takvim haftas\u0131 yok." },
  blockers: { en: "Blockers", fa: "\u0645\u0648\u0627\u0646\u0639", tr: "Engeller" },
  no_blockers: { en: "No blockers.", fa: "\u0645\u0627\u0646\u0639\u06CC \u0646\u06CC\u0633\u062A.", tr: "Engel yok." },
  shared_week: {
    en: "Wrote {list}. Commit and merge it to show this week in Studio. Studio shows it as of this approval; brand:content calendar stays the current truth.",
    fa: "{list} \u0646\u0648\u0634\u062A\u0647 \u0634\u062F. \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0627\u06CC\u0646 \u0647\u0641\u062A\u0647 \u062F\u0631 Studio \u0622\u0646 \u0631\u0627 \u06A9\u0627\u0645\u06CC\u062A \u0648 \u0627\u062F\u063A\u0627\u0645 \u06A9\u0646\u06CC\u062F. Studio \u0622\u0646 \u0631\u0627 \u0645\u0637\u0627\u0628\u0642 \u0647\u0645\u06CC\u0646 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F\u061B brand:content calendar \u0647\u0645\u0686\u0646\u0627\u0646 \u0645\u0646\u0628\u0639 \u0641\u0639\u0644\u06CC \u0627\u0633\u062A.",
    tr: "{list} yaz\u0131ld\u0131. Bu haftay\u0131 Studio\u2019da g\xF6stermek i\xE7in commit edip birle\u015Ftirin. Studio onu bu onay itibar\u0131yla g\xF6sterir; g\xFCncel do\u011Fru brand:content calendar olarak kal\u0131r."
  },
  shared_strategy: {
    en: "Wrote {list}. Commit and merge it to show this approved content strategy revision in Studio. It authorizes nothing; brand:content show stays the current truth.",
    fa: "{list} \u0646\u0648\u0634\u062A\u0647 \u0634\u062F. \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0631\u0627\u0647\u0628\u0631\u062F \u0645\u062D\u062A\u0648\u0627 \u062F\u0631 Studio \u0622\u0646 \u0631\u0627 \u06A9\u0627\u0645\u06CC\u062A \u0648 \u0627\u062F\u063A\u0627\u0645 \u06A9\u0646\u06CC\u062F. \u0627\u06CC\u0646 \u0641\u0627\u06CC\u0644 \u0645\u062C\u0648\u0632 \u0647\u06CC\u0686 \u06A9\u0627\u0631\u06CC \u0646\u06CC\u0633\u062A\u061B brand:content show \u0647\u0645\u0686\u0646\u0627\u0646 \u0645\u0646\u0628\u0639 \u0641\u0639\u0644\u06CC \u0627\u0633\u062A.",
    tr: "{list} yaz\u0131ld\u0131. Bu onayl\u0131 i\xE7erik stratejisi s\xFCr\xFCm\xFCn\xFC Studio\u2019da g\xF6stermek i\xE7in commit edip birle\u015Ftirin. Hi\xE7bir \u015Feye yetki vermez; g\xFCncel do\u011Fru brand:content show olarak kal\u0131r."
  },
  shared_preview: { en: "Preview only (--dry-run). Nothing was written.", fa: "\u0641\u0642\u0637 \u067E\u06CC\u0634\u200C\u0646\u0645\u0627\u06CC\u0634 (--dry-run). \u0686\u06CC\u0632\u06CC \u0646\u0648\u0634\u062A\u0647 \u0646\u0634\u062F.", tr: "Yaln\u0131zca \xF6nizleme (--dry-run). Hi\xE7bir \u015Fey yaz\u0131lmad\u0131." }
};
var CAL_NOTICE = {
  en: [
    "Owner view of approved calendar weeks. Drafts are never shown; they are counted under withheld.",
    "Slots cite approved facts by id; the values are read now. Hooks and angles are owner text, checked against the banned claims.",
    "An approved week authorizes no post, schedule, publication, ad or spend (authorizes: [])."
  ],
  fa: [
    "\u0646\u0645\u0627\u06CC \u0645\u0627\u0644\u06A9 \u0627\u0632 \u0647\u0641\u062A\u0647\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062A\u0642\u0648\u06CC\u0645. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0647\u0631\u06AF\u0632 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0641\u0642\u0637 \u0632\u06CC\u0631 withheld \u0634\u0645\u0631\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    "\u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0628\u0627 \u0634\u0646\u0627\u0633\u0647 \u0628\u0647 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0627\u0631\u062C\u0627\u0639 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F \u0648 \u0645\u0642\u062F\u0627\u0631\u0647\u0627 \u0647\u0645\u06CC\u0646 \u062D\u0627\u0644\u0627 \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u0642\u0644\u0627\u0628\u200C\u0647\u0627 \u0648 \u0632\u0627\u0648\u06CC\u0647\u200C\u0647\u0627 \u0645\u062A\u0646 \u0645\u0627\u0644\u06A9\u200C\u0627\u0646\u062F \u0648 \u0628\u0627 \u0627\u062F\u0639\u0627\u0647\u0627\u06CC \u0645\u0645\u0646\u0648\u0639 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    "\u0647\u0641\u062A\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0647\u06CC\u0686 \u0627\u0631\u0633\u0627\u0644\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u062A\u0628\u0644\u06CC\u063A \u06CC\u0627 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F (authorizes: [])."
  ],
  tr: [
    "Onayl\u0131 takvim haftalar\u0131n\u0131n sahip g\xF6r\xFCn\xFCm\xFC. Taslaklar asla g\xF6sterilmez; withheld alt\u0131nda say\u0131l\u0131r.",
    "Yerler onayl\u0131 bilgilere kimlikle at\u0131f yapar; de\u011Ferler \u015Fimdi okunur. Kancalar ve a\xE7\u0131lar sahip metnidir ve yasak iddialara kar\u015F\u0131 denetlenir.",
    "Onayl\u0131 bir hafta hi\xE7bir payla\u015F\u0131m, zamanlama, yay\u0131n, reklam veya harcamaya izin vermez (authorizes: [])."
  ]
};

// packages/brand-core/src/content-bridge/i18n.ts
var CONTENT_LANGS = ["en", "fa", "tr"];
function contentLang(value, fallback = "en") {
  return typeof value === "string" && CONTENT_LANGS.includes(value) ? value : fallback;
}
function fill(text2, vars = {}) {
  return text2.replace(/\{(\w+)\}/g, (_, key) => vars[key] === void 0 ? `{${key}}` : String(vars[key]));
}
var ROLE_LABELS = {
  voice: { en: "voice", fa: "\u0644\u062D\u0646", tr: "ses tonu" },
  claims: { en: "claims and forbidden language", fa: "\u0627\u062F\u0639\u0627\u0647\u0627 \u0648 \u0632\u0628\u0627\u0646 \u0645\u0645\u0646\u0648\u0639", tr: "iddialar ve yasak dil" },
  audience: { en: "audience", fa: "\u0645\u062E\u0627\u0637\u0628", tr: "hedef kitle" },
  messaging: { en: "messaging", fa: "\u067E\u06CC\u0627\u0645\u200C\u0647\u0627", tr: "mesajlar" },
  pillars: { en: "content pillars", fa: "\u0633\u062A\u0648\u0646\u200C\u0647\u0627\u06CC \u0645\u062D\u062A\u0648\u0627", tr: "i\xE7erik s\xFCtunlar\u0131" },
  channels: { en: "channels", fa: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627", tr: "kanallar" },
  offers: { en: "offers", fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0647\u0627", tr: "teklifler" },
  cta: { en: "calls to action", fa: "\u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645", tr: "eylem \xE7a\u011Fr\u0131lar\u0131" },
  languages: { en: "content languages", fa: "\u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC \u0645\u062D\u062A\u0648\u0627", tr: "i\xE7erik dilleri" },
  objective: { en: "marketing objective", fa: "\u0647\u062F\u0641 \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC", tr: "pazarlama hedefi" }
};
var CHANNEL_PARTS = {
  role: { en: "role", fa: "\u0646\u0642\u0634", tr: "rol\xFC" },
  formats: { en: "formats", fa: "\u0642\u0627\u0644\u0628\u200C\u0647\u0627", tr: "formatlar\u0131" },
  cadence: { en: "cadence", fa: "\u062A\u0646\u0627\u0648\u0628 \u0627\u0646\u062A\u0634\u0627\u0631", tr: "yay\u0131n s\u0131kl\u0131\u011F\u0131" }
};
var PROPOSAL_TEXT = {
  title: { en: "Content strategy", fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627", tr: "\u0130\xE7erik stratejisi" },
  objective: {
    en: "Plan content that serves the approved facts cited here, in the approved voice, on the channels the owner names.",
    fa: "\u0645\u062D\u062A\u0648\u0627\u06CC\u06CC \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0634\u0648\u062F \u06A9\u0647 \u062F\u0631 \u062E\u062F\u0645\u062A \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0627\u0631\u062C\u0627\u0639\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 \u0627\u06CC\u0646\u062C\u0627 \u0628\u0627\u0634\u062F\u060C \u0628\u0627 \u0644\u062D\u0646 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u062F\u0631 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0646\u0627\u0645 \u0645\u06CC\u200C\u0628\u0631\u062F.",
    tr: "Burada at\u0131f yap\u0131lan onayl\u0131 bilgilere hizmet eden i\xE7erik, onayl\u0131 ses tonuyla ve sahibin belirledi\u011Fi kanallarda planlan\u0131r."
  },
  rationale: {
    en: "Derived from approved facts by brand:content strategy. The owner sets channel roles, formats and cadence before approving.",
    fa: "\u0628\u0627 brand:content strategy \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0633\u0627\u062E\u062A\u0647 \u0634\u062F. \u0645\u0627\u0644\u06A9 \u067E\u06CC\u0634 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F\u060C \u0646\u0642\u0634\u060C \u0642\u0627\u0644\u0628 \u0648 \u062A\u0646\u0627\u0648\u0628 \u0647\u0631 \u06A9\u0627\u0646\u0627\u0644 \u0631\u0627 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "brand:content strategy ile onayl\u0131 bilgilerden t\xFCretildi. Sahip, onaylamadan \xF6nce kanal rollerini, formatlar\u0131 ve s\u0131kl\u0131\u011F\u0131 belirler."
  },
  guardrail_facts: {
    en: "Say only what approved facts support; a claim that is not an approved fact is not made.",
    fa: "\u0641\u0642\u0637 \u0686\u06CC\u0632\u06CC \u06AF\u0641\u062A\u0647 \u0634\u0648\u062F \u06A9\u0647 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061B \u0627\u062F\u0639\u0627\u06CC\u06CC \u06A9\u0647 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A\u060C \u0645\u0637\u0631\u062D \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Yaln\u0131zca onayl\u0131 bilgilerin destekledi\u011Fi s\xF6ylenir; onayl\u0131 bilgi olmayan bir iddia yap\u0131lmaz."
  },
  guardrail_voice: {
    en: "Voice comes from the cited voice facts. An agent does not invent a tone, slogan or claim.",
    fa: "\u0644\u062D\u0646 \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u0644\u062D\u0646\u0650 \u0627\u0631\u062C\u0627\u0639\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u0645\u06CC\u200C\u0622\u06CC\u062F. \u0639\u0627\u0645\u0644 \u0647\u0648\u0634\u0645\u0646\u062F \u0644\u062D\u0646\u060C \u0634\u0639\u0627\u0631 \u06CC\u0627 \u0627\u062F\u0639\u0627\u06CC\u06CC \u0646\u0645\u06CC\u200C\u0633\u0627\u0632\u062F.",
    tr: "Ses tonu, at\u0131f yap\u0131lan ses bilgilerine dayan\u0131r. Bir ajan ton, slogan veya iddia uydurmaz."
  },
  non_goal_publish: {
    en: "Posting, scheduling or publishing on any network",
    fa: "\u0627\u0631\u0633\u0627\u0644\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627 \u0627\u0646\u062A\u0634\u0627\u0631 \u062F\u0631 \u0647\u0631 \u0634\u0628\u06A9\u0647\u200C\u0627\u06CC",
    tr: "Herhangi bir a\u011Fda payla\u015F\u0131m, zamanlama veya yay\u0131n"
  },
  non_goal_ads: {
    en: "Ad spend or paid promotion",
    fa: "\u0647\u0632\u06CC\u0646\u0647\u0654 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u06CC\u0627 \u062A\u0628\u0644\u06CC\u063A \u067E\u0648\u0644\u06CC",
    tr: "Reklam harcamas\u0131 veya \xFCcretli tan\u0131t\u0131m"
  }
};
var GAP_TEXT = {
  not_approved: {
    en: "No approved fact covers {role}. Answer {facts}, then approve it (brand:review, brand:approve).",
    fa: "\u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC {role} \u0631\u0627 \u067E\u0648\u0634\u0634 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F. \u0628\u0647 {facts} \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u0633\u067E\u0633 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F (brand:review\u060C brand:approve).",
    tr: "{role} i\xE7in onayl\u0131 bir bilgi yok. {facts} sorusunu yan\u0131tlay\u0131n, sonra onaylay\u0131n (brand:review, brand:approve)."
  },
  placeholder: {
    en: "The approved fact for {role} says it is not decided yet ({facts}). Nothing is assumed in its place.",
    fa: "\u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC {role} \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F \u0647\u0646\u0648\u0632 \u062A\u0635\u0645\u06CC\u0645\u06CC \u06AF\u0631\u0641\u062A\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A ({facts}). \u0686\u06CC\u0632\u06CC \u0628\u0647 \u062C\u0627\u06CC \u0622\u0646 \u0641\u0631\u0636 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{role} i\xE7in onayl\u0131 bilgi hen\xFCz karar verilmedi\u011Fini s\xF6yl\xFCyor ({facts}). Yerine hi\xE7bir \u015Fey varsay\u0131lmaz."
  },
  channel_role: {
    en: "Write what {channel} is for (role) in the proposal file before approving.",
    fa: "\u067E\u06CC\u0634 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F\u060C \u062F\u0631 \u0641\u0627\u06CC\u0644 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F {channel} \u0628\u0631\u0627\u06CC \u0686\u06CC\u0633\u062A (\u0646\u0642\u0634).",
    tr: "Onaylamadan \xF6nce \xF6neri dosyas\u0131na {channel} kanal\u0131n\u0131n ne i\xE7in oldu\u011Funu (rol) yaz\u0131n."
  },
  channel_formats: {
    en: "Choose the formats for {channel} (--formats or the proposal file).",
    fa: "\u0642\u0627\u0644\u0628\u200C\u0647\u0627\u06CC {channel} \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F (--formats \u06CC\u0627 \u0641\u0627\u06CC\u0644 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F).",
    tr: "{channel} i\xE7in formatlar\u0131 se\xE7in (--formats veya \xF6neri dosyas\u0131)."
  },
  channel_cadence: {
    en: "Decide how often {channel} posts (--cadence or the proposal file). It stays unknown until then.",
    fa: "\u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646\u06CC\u062F {channel} \u0647\u0631 \u0686\u0646\u062F \u0648\u0642\u062A \u06CC\u06A9 \u0628\u0627\u0631 \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u062F (--cadence \u06CC\u0627 \u0641\u0627\u06CC\u0644 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F). \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0646\u0627\u0645\u0634\u062E\u0635 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    tr: "{channel} kanal\u0131n\u0131n ne s\u0131kl\u0131kla payla\u015F\u0131m yapaca\u011F\u0131na karar verin (--cadence veya \xF6neri dosyas\u0131). O zamana kadar bilinmiyor kal\u0131r."
  },
  pillars_unnamed: {
    en: "The approved pillars ({facts}) could not be split into short names. Name the pillars in the proposal file.",
    fa: "\u0633\u062A\u0648\u0646\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 ({facts}) \u0628\u0647 \u0646\u0627\u0645\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u062A\u0642\u0633\u06CC\u0645 \u0646\u0634\u062F\u0646\u062F. \u0646\u0627\u0645 \u0633\u062A\u0648\u0646\u200C\u0647\u0627 \u0631\u0627 \u062F\u0631 \u0641\u0627\u06CC\u0644 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F.",
    tr: "Onayl\u0131 s\xFCtunlar ({facts}) k\u0131sa adlara b\xF6l\xFCnemedi. S\xFCtunlar\u0131 \xF6neri dosyas\u0131nda adland\u0131r\u0131n."
  },
  channels_none: {
    en: "No channel was named. Name channels with --channels, or approve {facts} with the channels you use.",
    fa: "\u0647\u06CC\u0686 \u06A9\u0627\u0646\u0627\u0644\u06CC \u0646\u0627\u0645 \u0628\u0631\u062F\u0647 \u0646\u0634\u062F. \u0628\u0627 --channels \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0631\u0627 \u0646\u0627\u0645 \u0628\u0628\u0631\u06CC\u062F \u06CC\u0627 {facts} \u0631\u0627 \u0628\u0627 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
    tr: "Hi\xE7 kanal belirtilmedi. Kanallar\u0131 --channels ile belirtin veya kulland\u0131\u011F\u0131n\u0131z kanallarla {facts} bilgisini onaylay\u0131n."
  }
};
var NOTES = {
  channels_detected: {
    en: 'Channels {list} were read from the wording of the approved channel facts. Check them; clauses with "no" or "not" were skipped.',
    fa: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC {list} \u0627\u0632 \u0645\u062A\u0646 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u06A9\u0627\u0646\u0627\u0644 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0646\u062F. \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u0627\u0646 \u06A9\u0646\u06CC\u062F\u061B \u0639\u0628\u0627\u0631\u062A\u200C\u0647\u0627\u06CC \u062F\u0627\u0631\u0627\u06CC \xAB\u0646\u0647\xBB \u06CC\u0627 \xAB\u0628\u062F\u0648\u0646\xBB \u0646\u0627\u062F\u06CC\u062F\u0647 \u06AF\u0631\u0641\u062A\u0647 \u0634\u062F\u0646\u062F.",
    tr: '{list} kanallar\u0131 onayl\u0131 kanal bilgilerinin metninden okundu. Kontrol edin; "hay\u0131r" veya "de\u011Fil" i\xE7eren ifadeler atland\u0131.'
  },
  channel_not_in_facts: {
    en: "{channel} is your choice; no approved channel fact mentions it, so it cites no fact.",
    fa: "{channel} \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u0645\u0627\u0633\u062A\u061B \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u06A9\u0627\u0646\u0627\u0644\u06CC \u0628\u0647 \u0622\u0646 \u0627\u0634\u0627\u0631\u0647 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u067E\u0633 \u0628\u0647 \u0648\u0627\u0642\u0639\u06CC\u062A\u06CC \u0627\u0631\u062C\u0627\u0639 \u0646\u062F\u0627\u0631\u062F.",
    tr: "{channel} sizin se\xE7iminiz; onayl\u0131 hi\xE7bir kanal bilgisi ondan s\xF6z etmiyor, bu y\xFCzden bir bilgiye at\u0131f yapm\u0131yor."
  },
  languages_default: {
    en: "Content languages default to the brand default locale ({lang}). Set them with --languages.",
    fa: "\u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC \u0645\u062D\u062A\u0648\u0627 \u0628\u0647\u200C\u0637\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0632\u0628\u0627\u0646 \u0627\u0635\u0644\u06CC \u0628\u0631\u0646\u062F ({lang}) \u0627\u0633\u062A. \u0628\u0627 --languages \u062A\u0639\u06CC\u06CC\u0646\u0634\u0627\u0646 \u06A9\u0646\u06CC\u062F.",
    tr: "\u0130\xE7erik dilleri varsay\u0131lan olarak markan\u0131n varsay\u0131lan dilidir ({lang}). --languages ile belirleyin."
  },
  pillar_skipped: {
    en: "A part of {id} was longer than a pillar name or was refused by the safety check; it was left out.",
    fa: "\u0628\u062E\u0634\u06CC \u0627\u0632 {id} \u0628\u0644\u0646\u062F\u062A\u0631 \u0627\u0632 \u0646\u0627\u0645 \u06CC\u06A9 \u0633\u062A\u0648\u0646 \u0628\u0648\u062F \u06CC\u0627 \u0628\u0631\u0631\u0633\u06CC \u0627\u06CC\u0645\u0646\u06CC \u0622\u0646 \u0631\u0627 \u0631\u062F \u06A9\u0631\u062F\u061B \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F.",
    tr: "{id} bilgisinin bir b\xF6l\xFCm\xFC s\xFCtun ad\u0131 i\xE7in fazla uzundu veya g\xFCvenlik denetiminden ge\xE7medi; d\u0131\u015Far\u0131da b\u0131rak\u0131ld\u0131."
  },
  strategies_pinned: {
    en: "Pinned the approved strategies served now: {list}. If one is replaced, this content strategy needs review.",
    fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0641\u0639\u0644\u06CC \u067E\u06CC\u0646 \u0634\u062F\u0646\u062F: {list}. \u0627\u06AF\u0631 \u06CC\u06A9\u06CC \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0634\u0648\u062F\u060C \u0627\u06CC\u0646 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u0627\u0631\u062F.",
    tr: "\u015Eu anda sunulan onayl\u0131 stratejiler sabitlendi: {list}. Biri de\u011Fi\u015Firse bu i\xE7erik stratejisinin g\xF6zden ge\xE7irilmesi gerekir."
  },
  voice_not_copied: {
    en: "Voice, audience, messaging and claims are cited by fact id and resolved at read time. Nothing was rewritten or invented.",
    fa: "\u0644\u062D\u0646\u060C \u0645\u062E\u0627\u0637\u0628\u060C \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0648 \u0627\u062F\u0639\u0627\u0647\u0627 \u0628\u0627 \u0634\u0646\u0627\u0633\u0647\u0654 \u0648\u0627\u0642\u0639\u06CC\u062A \u0627\u0631\u062C\u0627\u0639 \u062F\u0627\u062F\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F \u0648 \u0647\u0646\u06AF\u0627\u0645 \u062E\u0648\u0627\u0646\u062F\u0646 \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627 \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u0686\u06CC\u0632\u06CC \u0628\u0627\u0632\u0646\u0648\u06CC\u0633\u06CC \u06CC\u0627 \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F.",
    tr: "Ses tonu, hedef kitle, mesajlar ve iddialar bilgi kimli\u011Fiyle at\u0131f yap\u0131l\u0131r ve okuma an\u0131nda \xE7\xF6z\xFCl\xFCr. Hi\xE7bir \u015Fey yeniden yaz\u0131lmad\u0131 veya uydurulmad\u0131."
  }
};
var AVAILABILITY_RULES = {
  "do-not-claim": {
    en: "Do not say or imply that the product is available.",
    fa: "\u0646\u06AF\u0648\u06CC\u06CC\u062F \u0648 \u0627\u0644\u0642\u0627 \u0646\u06A9\u0646\u06CC\u062F \u06A9\u0647 \u0645\u062D\u0635\u0648\u0644 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0627\u0633\u062A.",
    tr: "\xDCr\xFCn\xFCn mevcut oldu\u011Funu s\xF6ylemeyin veya ima etmeyin."
  },
  "coming-soon": {
    en: 'At most say "coming soon". Never say "available now".',
    fa: "\u062D\u062F\u0627\u06A9\u062B\u0631 \u0628\u06AF\u0648\u06CC\u06CC\u062F \xAB\u0628\u0647\u200C\u0632\u0648\u062F\u06CC\xBB. \u0647\u0631\u06AF\u0632 \u0646\u06AF\u0648\u06CC\u06CC\u062F \xAB\u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0627\u0633\u062A\xBB.",
    tr: 'En fazla "yak\u0131nda" deyin. Asla "\u015Fimdi mevcut" demeyin.'
  },
  available: {
    en: "Availability may be stated as approved.",
    fa: "\u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0628\u0648\u062F\u0646 \u0631\u0627 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0628\u06CC\u0627\u0646 \u06A9\u0631\u062F.",
    tr: "Bulunurluk onayland\u0131\u011F\u0131 \u015Fekilde belirtilebilir."
  }
};
var VIEW_NOTICE = {
  en: [
    "Owner view of the approved content strategy. Drafts are never shown; a draft is counted under withheld.",
    "Voice, audience, messaging and claims are the approved facts, resolved now at the cited revisions.",
    "It authorizes no post, schedule, publication, ad or spend (authorizes: [])."
  ],
  fa: [
    "\u0646\u0645\u0627\u06CC \u0645\u0627\u0644\u06A9 \u0627\u0632 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0647\u0631\u06AF\u0632 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0641\u0642\u0637 \u0632\u06CC\u0631 withheld \u0634\u0645\u0631\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    "\u0644\u062D\u0646\u060C \u0645\u062E\u0627\u0637\u0628\u060C \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0648 \u0627\u062F\u0639\u0627\u0647\u0627 \u0647\u0645\u0627\u0646 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u0646\u062F \u06A9\u0647 \u0627\u06A9\u0646\u0648\u0646 \u062F\u0631 \u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u0627\u0631\u062C\u0627\u0639\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    "\u0647\u06CC\u0686 \u0627\u0631\u0633\u0627\u0644\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u062A\u0628\u0644\u06CC\u063A \u06CC\u0627 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F (authorizes: [])."
  ],
  tr: [
    "Onayl\u0131 i\xE7erik stratejisinin sahip g\xF6r\xFCn\xFCm\xFC. Taslaklar asla g\xF6sterilmez; taslak withheld alt\u0131nda say\u0131l\u0131r.",
    "Ses tonu, hedef kitle, mesajlar ve iddialar, at\u0131f yap\u0131lan s\xFCr\xFCmlerde \u015Fimdi \xE7\xF6z\xFClen onayl\u0131 bilgilerdir.",
    "Hi\xE7bir payla\u015F\u0131m, zamanlama, yay\u0131n, reklam veya harcamaya izin vermez (authorizes: [])."
  ]
};
var CLI_TEXT = {
  draft_header: { en: "Content strategy proposal (draft, not stored)", fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627 (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F\u0647)", tr: "\u0130\xE7erik stratejisi \xF6nerisi (taslak, kaydedilmedi)" },
  sources: { en: "Sources", fa: "\u0645\u0646\u0627\u0628\u0639", tr: "Kaynaklar" },
  gaps: { en: "Gaps (nothing is assumed in their place)", fa: "\u06A9\u0645\u0628\u0648\u062F\u0647\u0627 (\u0686\u06CC\u0632\u06CC \u0628\u0647 \u062C\u0627\u06CC \u0622\u0646\u200C\u0647\u0627 \u0641\u0631\u0636 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F)", tr: "Eksikler (yerlerine hi\xE7bir \u015Fey varsay\u0131lmaz)" },
  no_gaps: { en: "No gaps.", fa: "\u06A9\u0645\u0628\u0648\u062F\u06CC \u0646\u06CC\u0633\u062A.", tr: "Eksik yok." },
  pillars: { en: "Pillars", fa: "\u0633\u062A\u0648\u0646\u200C\u0647\u0627", tr: "S\xFCtunlar" },
  channels: { en: "Channels", fa: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627", tr: "Kanallar" },
  notes: { en: "Notes", fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627", tr: "Notlar" },
  written: {
    en: "Proposal written to {list}. Edit it, then: npm run brand:strategy -- propose --id {id} --file {list}",
    fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u062F\u0631 {list} \u0646\u0648\u0634\u062A\u0647 \u0634\u062F. \u0648\u06CC\u0631\u0627\u06CC\u0634\u0634 \u06A9\u0646\u06CC\u062F\u060C \u0633\u067E\u0633: npm run brand:strategy -- propose --id {id} --file {list}",
    tr: "\xD6neri {list} dosyas\u0131na yaz\u0131ld\u0131. D\xFCzenleyin, sonra: npm run brand:strategy -- propose --id {id} --file {list}"
  },
  stored: {
    en: "Stored draft {id} revision {n}. Agents and the content view cannot see it. Review: npm run brand:strategy -- review --id {id} --revision {n}",
    fa: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 {id} \u0646\u0633\u062E\u0647\u0654 {n} \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F. \u0639\u0627\u0645\u0644\u200C\u0647\u0627 \u0648 \u0646\u0645\u0627\u06CC \u0645\u062D\u062A\u0648\u0627 \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u0628\u06CC\u0646\u0646\u062F. \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC: npm run brand:strategy -- review --id {id} --revision {n}",
    tr: "{id} tasla\u011F\u0131, s\xFCr\xFCm {n} kaydedildi. Ajanlar ve i\xE7erik g\xF6r\xFCn\xFCm\xFC onu g\xF6remez. \u0130nceleme: npm run brand:strategy -- review --id {id} --revision {n}"
  },
  store_hint: {
    en: "Nothing was stored. Add --out <file> to edit it first, or --store to store it as a draft now.",
    fa: "\u0686\u06CC\u0632\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F. \u0628\u0631\u0627\u06CC \u0648\u06CC\u0631\u0627\u06CC\u0634\u060C --out <file> \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u06CC\u0627 \u0628\u0627 --store \u0647\u0645\u06CC\u0646 \u062D\u0627\u0644\u0627 \u0622\u0646 \u0631\u0627 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0630\u062E\u06CC\u0631\u0647 \u06A9\u0646\u06CC\u062F.",
    tr: "Hi\xE7bir \u015Fey kaydedilmedi. \xD6nce d\xFCzenlemek i\xE7in --out <file> ekleyin veya \u015Fimdi taslak olarak kaydetmek i\xE7in --store kullan\u0131n."
  },
  none_approved: {
    en: "No approved content strategy is served now.",
    fa: "\u062F\u0631 \u062D\u0627\u0644 \u062D\u0627\u0636\u0631 \u0647\u06CC\u0686 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "\u015Eu anda sunulan onayl\u0131 bir i\xE7erik stratejisi yok."
  },
  withheld: { en: "Not shown", fa: "\u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0634\u062F\u0647", tr: "G\xF6sterilmeyen" },
  voice: { en: "Voice", fa: "\u0644\u062D\u0646", tr: "Ses tonu" },
  do: { en: "Do", fa: "\u0627\u0646\u062C\u0627\u0645 \u0628\u062F\u0647", tr: "Yap" },
  dont: { en: "Don\u2019t", fa: "\u0627\u0646\u062C\u0627\u0645 \u0646\u062F\u0647", tr: "Yapma" },
  banned: { en: "Never claim or say", fa: "\u0647\u0631\u06AF\u0632 \u0627\u062F\u0639\u0627 \u0646\u06A9\u0646\u06CC\u062F \u06CC\u0627 \u0646\u06AF\u0648\u06CC\u06CC\u062F", tr: "Asla iddia etmeyin veya s\xF6ylemeyin" },
  not_decided: { en: "not decided", fa: "\u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647", tr: "karar verilmedi" },
  all: { en: "all", fa: "\u0647\u0645\u0647", tr: "t\xFCm\xFC" }
};

// packages/brand-core/src/competitive/i18n.ts
var COMPETITIVE_LANGS = ["en", "fa", "tr"];
var DIMENSION_LABELS = {
  offer: { en: "offer", fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0648 \u0645\u062D\u0635\u0648\u0644", tr: "teklif" },
  audience: { en: "audience", fa: "\u0645\u062E\u0627\u0637\u0628", tr: "hedef kitle" },
  geography: { en: "geography", fa: "\u062C\u063A\u0631\u0627\u0641\u06CC\u0627", tr: "co\u011Frafya" },
  public_price: { en: "public price", fa: "\u0642\u06CC\u0645\u062A \u0639\u0645\u0648\u0645\u06CC", tr: "a\xE7\u0131k fiyat" },
  public_message: { en: "public message", fa: "\u067E\u06CC\u0627\u0645 \u0639\u0645\u0648\u0645\u06CC", tr: "a\xE7\u0131k mesaj" },
  visual_language: { en: "visual language", fa: "\u0632\u0628\u0627\u0646 \u0628\u0635\u0631\u06CC", tr: "g\xF6rsel dil" },
  observable_channels: { en: "observable channels", fa: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC \u0642\u0627\u0628\u0644 \u0645\u0634\u0627\u0647\u062F\u0647", tr: "g\xF6zlemlenebilir kanallar" },
  strength_hypothesis: { en: "strength (hypothesis)", fa: "\u0646\u0642\u0637\u0647\u0654 \u0642\u0648\u062A (\u0641\u0631\u0636\u06CC\u0647)", tr: "g\xFC\xE7l\xFC y\xF6n (hipotez)" },
  weakness_hypothesis: { en: "weakness (hypothesis)", fa: "\u0646\u0642\u0637\u0647\u0654 \u0636\u0639\u0641 (\u0641\u0631\u0636\u06CC\u0647)", tr: "zay\u0131f y\xF6n (hipotez)" }
};
var GAP_TEXT2 = {
  research_unavailable: {
    en: "Research cannot run here ({reason}). Add source URLs you trust, or record sources later; nothing is filled in meanwhile.",
    fa: "\u067E\u0698\u0648\u0647\u0634 \u0627\u06CC\u0646\u062C\u0627 \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F ({reason}). \u0646\u0634\u0627\u0646\u06CC \u0645\u0646\u0627\u0628\u0639\u06CC \u0631\u0627 \u06A9\u0647 \u0628\u0647 \u0622\u0646\u200C\u0647\u0627 \u0627\u0639\u062A\u0645\u0627\u062F \u062F\u0627\u0631\u06CC\u062F \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u06CC\u0627 \u0628\u0639\u062F\u0627\u064B \u0645\u0646\u0628\u0639 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F\u061B \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0686\u06CC\u0632\u06CC \u062D\u062F\u0633 \u0632\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Ara\u015Ft\u0131rma burada \xE7al\u0131\u015Fam\u0131yor ({reason}). G\xFCvendi\u011Finiz kaynak adreslerini ekleyin ya da kaynaklar\u0131 sonra kaydedin; bu arada hi\xE7bir \u015Fey tahminle doldurulmaz."
  },
  scope_not_set: {
    en: "Say what this research is for (identity, positioning, marketing, pricing, seo, expansion) so only the useful gaps are listed.",
    fa: "\u0628\u06AF\u0648\u06CC\u06CC\u062F \u0627\u06CC\u0646 \u067E\u0698\u0648\u0647\u0634 \u0628\u0631\u0627\u06CC \u0686\u06CC\u0633\u062A (\u0647\u0648\u06CC\u062A\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC\u060C \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC\u060C \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC\u060C \u0633\u0626\u0648\u060C \u06AF\u0633\u062A\u0631\u0634) \u062A\u0627 \u0641\u0642\u0637 \u0634\u06A9\u0627\u0641\u200C\u0647\u0627\u06CC \u0645\u0641\u06CC\u062F \u0641\u0647\u0631\u0633\u062A \u0634\u0648\u0646\u062F.",
    tr: "Bu ara\u015Ft\u0131rman\u0131n ne i\xE7in oldu\u011Funu s\xF6yleyin (kimlik, konumland\u0131rma, pazarlama, fiyatland\u0131rma, SEO, geni\u015Fleme); b\xF6ylece yaln\u0131zca i\u015Fe yarar eksikler listelenir."
  },
  target_market_unapproved: {
    en: "The target market (business.market.geography) is not approved yet. Local, regional and international are judged against it; answer it in the interview first.",
    fa: "\u0628\u0627\u0632\u0627\u0631 \u0647\u062F\u0641 (business.market.geography) \u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0645\u062D\u0644\u06CC\u060C \u0645\u0646\u0637\u0642\u0647\u200C\u0627\u06CC \u0648 \u0628\u06CC\u0646\u200C\u0627\u0644\u0645\u0644\u0644\u06CC \u0646\u0633\u0628\u062A \u0628\u0647 \u0622\u0646 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0627\u0628\u062A\u062F\u0627 \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647 \u0628\u0647 \u0622\u0646 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F.",
    tr: "Hedef pazar (business.market.geography) hen\xFCz onaylanmad\u0131. Yerel, b\xF6lgesel ve uluslararas\u0131 bu pazara g\xF6re de\u011Ferlendirilir; \xF6nce g\xF6r\xFC\u015Fmede yan\u0131tlay\u0131n."
  },
  no_candidates: {
    en: "No candidates yet. Who do buyers compare you with? Who solves the same job differently? Names only; each starts as an unverified candidate.",
    fa: "\u0647\u0646\u0648\u0632 \u0646\u0627\u0645\u0632\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u062E\u0631\u06CC\u062F\u0627\u0631\u0627\u0646 \u0634\u0645\u0627 \u0631\u0627 \u0628\u0627 \u0686\u0647 \u06A9\u0633\u0627\u0646\u06CC \u0645\u0642\u0627\u06CC\u0633\u0647 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061F \u0686\u0647 \u06A9\u0633\u06CC \u0647\u0645\u06CC\u0646 \u0646\u06CC\u0627\u0632 \u0631\u0627 \u0628\u0647 \u0631\u0648\u0634 \u062F\u06CC\u06AF\u0631\u06CC \u0628\u0631\u0622\u0648\u0631\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F \u0641\u0642\u0637 \u0646\u0627\u0645\u061B \u0647\u0631 \u0646\u0627\u0645 \u0627\u0628\u062A\u062F\u0627 \u06CC\u06A9 \u0646\u0627\u0645\u0632\u062F \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Hen\xFCz aday yok. Al\u0131c\u0131lar sizi kimlerle kar\u015F\u0131la\u015Ft\u0131r\u0131yor? Ayn\u0131 i\u015Fi ba\u015Fka yoldan kim \xE7\xF6z\xFCyor? Yaln\u0131zca adlar; her biri do\u011Frulanmam\u0131\u015F bir aday olarak ba\u015Flar."
  },
  relationship_unknown: {
    en: "{name}: is this a direct competitor, an indirect one, a substitute, or a reference brand you admire?",
    fa: "{name}: \u0627\u06CC\u0646 \u0631\u0642\u06CC\u0628 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0627\u0633\u062A\u060C \u063A\u06CC\u0631\u0645\u0633\u062A\u0642\u06CC\u0645\u060C \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646\u060C \u06CC\u0627 \u0628\u0631\u0646\u062F\u06CC \u0645\u0631\u062C\u0639 \u06A9\u0647 \u0622\u0646 \u0631\u0627 \u062A\u062D\u0633\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F\u061F",
    tr: "{name}: do\u011Frudan rakip mi, dolayl\u0131 rakip mi, ikame mi, yoksa \xF6rnek ald\u0131\u011F\u0131n\u0131z bir marka m\u0131?"
  },
  identity_unverified: {
    en: "{name}: the official website is not verified. Record a source fetched from its domain, then verify the domain.",
    fa: "{name}: \u0648\u0628\u200C\u0633\u0627\u06CC\u062A \u0631\u0633\u0645\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0645\u0646\u0628\u0639\u06CC \u0631\u0627 \u06A9\u0647 \u0627\u0632 \u062F\u0627\u0645\u0646\u0647\u0654 \u0622\u0646 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F\u0647 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F \u0648 \u0633\u067E\u0633 \u062F\u0627\u0645\u0646\u0647 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
    tr: "{name}: resmi web sitesi do\u011Frulanmad\u0131. Alan ad\u0131ndan al\u0131nm\u0131\u015F bir kaynak kaydedin, sonra alan ad\u0131n\u0131 do\u011Frulay\u0131n."
  },
  dimension_unknown: {
    en: "{name}: {dimension} is unknown. A dated source is needed; it stays unknown until then.",
    fa: "{name}: {dimension} \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0627\u0633\u062A. \u06CC\u06A9 \u0645\u0646\u0628\u0639 \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631 \u0644\u0627\u0632\u0645 \u0627\u0633\u062A\u061B \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    tr: "{name}: {dimension} bilinmiyor. Tarihli bir kaynak gerekiyor; o zamana kadar bilinmiyor olarak kal\u0131r."
  },
  evidence_needs_review: {
    en: "{name}: the source {note} for {dimension} {reason}. It is not used as current until re-checked.",
    fa: "{name}: \u0645\u0646\u0628\u0639 {note} \u0628\u0631\u0627\u06CC {dimension} {reason}. \u062A\u0627 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u0648\u0628\u0627\u0631\u0647\u060C \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u062F\u0627\u062F\u0647\u0654 \u0641\u0639\u0644\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{name}: {dimension} i\xE7in {note} kayna\u011F\u0131 {reason}. Yeniden kontrol edilene kadar g\xFCncel say\u0131lmaz."
  },
  evidence_conflicting: {
    en: "{name}: sources disagree about {dimension}. Both are kept; decide after reading them.",
    fa: "{name}: \u0645\u0646\u0627\u0628\u0639 \u062F\u0631\u0628\u0627\u0631\u0647\u0654 {dimension} \u0628\u0627 \u0647\u0645 \u0627\u062E\u062A\u0644\u0627\u0641 \u062F\u0627\u0631\u0646\u062F. \u0647\u0631 \u062F\u0648 \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u067E\u0633 \u0627\u0632 \u062E\u0648\u0627\u0646\u062F\u0646 \u0622\u0646\u200C\u0647\u0627 \u062A\u0635\u0645\u06CC\u0645 \u0628\u06AF\u06CC\u0631\u06CC\u062F.",
    tr: "{name}: kaynaklar {dimension} konusunda \xE7eli\u015Fiyor. \u0130kisi de saklan\u0131r; okuduktan sonra karar verin."
  },
  same_name_other_market: {
    en: "{name}: another candidate has the same name in a different market. They are kept apart; confirm they are different businesses.",
    fa: "{name}: \u0646\u0627\u0645\u0632\u062F \u062F\u06CC\u06AF\u0631\u06CC \u0628\u0627 \u0647\u0645\u06CC\u0646 \u0646\u0627\u0645 \u062F\u0631 \u0628\u0627\u0632\u0627\u0631 \u062F\u06CC\u06AF\u0631\u06CC \u0647\u0633\u062A. \u062C\u062F\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u062F\u0648 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0645\u062A\u0641\u0627\u0648\u062A\u200C\u0627\u0646\u062F.",
    tr: "{name}: ba\u015Fka bir pazarda ayn\u0131 adl\u0131 bir aday var. Ayr\u0131 tutulurlar; farkl\u0131 i\u015Fletmeler olduklar\u0131n\u0131 do\u011Frulay\u0131n."
  },
  prices_not_comparable: {
    en: "The recorded prices are not comparable as they stand ({reason}). They are listed, not ranked, and never converted between currencies.",
    fa: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u062F\u0631 \u0648\u0636\u0639 \u0641\u0639\u0644\u06CC \u0642\u0627\u0628\u0644 \u0645\u0642\u0627\u06CC\u0633\u0647 \u0646\u06CC\u0633\u062A\u0646\u062F ({reason}). \u0641\u0642\u0637 \u0641\u0647\u0631\u0633\u062A \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u060C \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0647\u0631\u06AF\u0632 \u0628\u06CC\u0646 \u0627\u0631\u0632\u0647\u0627 \u062A\u0628\u062F\u06CC\u0644 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    tr: "Kaydedilen fiyatlar bu haliyle kar\u015F\u0131la\u015Ft\u0131r\u0131lamaz ({reason}). S\u0131ralanmaz, yaln\u0131zca listelenir ve para birimleri aras\u0131nda asla \xE7evrilmez."
  },
  seo_needs_search_evidence: {
    en: "For SEO, competitor names are not search evidence. Rankings and keyword gaps stay unverified without search data.",
    fa: "\u0628\u0631\u0627\u06CC \u0633\u0626\u0648\u060C \u0646\u0627\u0645 \u0631\u0642\u0628\u0627 \u0634\u0648\u0627\u0647\u062F \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0646\u06CC\u0633\u062A. \u0631\u062A\u0628\u0647\u200C\u0647\u0627 \u0648 \u0634\u06A9\u0627\u0641\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u0648\u0627\u0698\u0647 \u0628\u062F\u0648\u0646 \u062F\u0627\u062F\u0647\u0654 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647 \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F.",
    tr: "SEO i\xE7in rakip adlar\u0131 arama kan\u0131t\u0131 de\u011Fildir. S\u0131ralamalar ve anahtar kelime bo\u015Fluklar\u0131 arama verisi olmadan do\u011Frulanmam\u0131\u015F kal\u0131r."
  }
};
var REVIEW_REASONS = {
  stale: { en: "is older than its freshness limit (history, not current)", fa: "\u0627\u0632 \u0645\u062D\u062F\u0648\u062F\u0647\u0654 \u062A\u0627\u0632\u06AF\u06CC\u200C\u0627\u0634 \u0642\u062F\u06CC\u0645\u06CC\u200C\u062A\u0631 \u0627\u0633\u062A (\u0633\u0627\u0628\u0642\u0647 \u0627\u0633\u062A\u060C \u0646\u0647 \u062F\u0627\u062F\u0647\u0654 \u0641\u0639\u0644\u06CC)", tr: "tazelik s\u0131n\u0131r\u0131ndan eski (ge\xE7mi\u015F kay\u0131t, g\xFCncel de\u011Fil)" },
  changed: { en: "was edited after it was cited", fa: "\u067E\u0633 \u0627\u0632 \u0627\u0633\u062A\u0646\u0627\u062F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F\u0647 \u0627\u0633\u062A", tr: "al\u0131nt\u0131land\u0131ktan sonra d\xFCzenlendi" },
  superseded: { en: "was replaced by a newer capture", fa: "\u0628\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0627\u0632\u0647\u200C\u062A\u0631\u06CC \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0634\u062F\u0647 \u0627\u0633\u062A", tr: "daha yeni bir kay\u0131tla de\u011Fi\u015Ftirildi" },
  archived: { en: "was archived", fa: "\u0628\u0627\u06CC\u06AF\u0627\u0646\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A", tr: "ar\u015Fivlendi" },
  missing: { en: "can no longer be read", fa: "\u062F\u06CC\u06AF\u0631 \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F", tr: "art\u0131k okunam\u0131yor" },
  claim_missing: { en: "no longer holds the cited claim", fa: "\u062F\u06CC\u06AF\u0631 \u0627\u062F\u0639\u0627\u06CC \u0627\u0633\u062A\u0646\u0627\u062F\u0634\u062F\u0647 \u0631\u0627 \u0646\u062F\u0627\u0631\u062F", tr: "al\u0131nt\u0131lanan iddiay\u0131 art\u0131k i\xE7ermiyor" }
};
var PROHIBITED_TEXT = {
  ad_performance: {
    en: "No ad spend, reach, conversions, ROAS, CAC or campaign effectiveness from visible ads or pages.",
    fa: "\u0647\u06CC\u0686 \u0628\u0631\u062F\u0627\u0634\u062A\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0647\u0632\u06CC\u0646\u0647\u0654 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u060C \u062F\u0633\u062A\u0631\u0633\u06CC\u060C \u062A\u0628\u062F\u06CC\u0644\u060C ROAS\u060C CAC \u06CC\u0627 \u0627\u062B\u0631\u0628\u062E\u0634\u06CC \u06A9\u0645\u067E\u06CC\u0646 \u0627\u0632 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u06CC\u0627 \u0635\u0641\u062D\u0647\u200C\u0647\u0627\u06CC \u0642\u0627\u0628\u0644 \u0645\u0634\u0627\u0647\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "G\xF6r\xFCn\xFCr reklamlardan ya da sayfalardan reklam harcamas\u0131, eri\u015Fim, d\xF6n\xFC\u015F\xFCm, ROAS, CAC veya kampanya etkinli\u011Fi \xE7\u0131kar\u0131lmaz."
  },
  private_commercials: {
    en: "No private discounts, revenue, market share or traffic from a public price page.",
    fa: "\u0647\u06CC\u0686 \u0628\u0631\u062F\u0627\u0634\u062A\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u062A\u062E\u0641\u06CC\u0641 \u062E\u0635\u0648\u0635\u06CC\u060C \u062F\u0631\u0622\u0645\u062F\u060C \u0633\u0647\u0645 \u0628\u0627\u0632\u0627\u0631 \u06CC\u0627 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0627\u0632 \u0635\u0641\u062D\u0647\u0654 \u0642\u06CC\u0645\u062A \u0639\u0645\u0648\u0645\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "A\xE7\u0131k bir fiyat sayfas\u0131ndan \xF6zel indirim, gelir, pazar pay\u0131 veya trafik \xE7\u0131kar\u0131lmaz."
  },
  search_rankings: {
    en: "No search rankings or keyword gaps from a list of names.",
    fa: "\u0647\u06CC\u0686 \u0631\u062A\u0628\u0647\u0654 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u06CC\u0627 \u0634\u06A9\u0627\u0641 \u06A9\u0644\u06CC\u062F\u0648\u0627\u0698\u0647\u200C\u0627\u06CC \u0627\u0632 \u06CC\u06A9 \u0641\u0647\u0631\u0633\u062A \u0646\u0627\u0645 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Bir ad listesinden arama s\u0131ralamas\u0131 veya anahtar kelime bo\u015Flu\u011Fu \xE7\u0131kar\u0131lmaz."
  },
  legal_clearance: {
    en: "No trademark clearance, originality or legal-safety claim from a visual comparison.",
    fa: "\u0647\u06CC\u0686 \u0627\u062F\u0639\u0627\u06CC \u062B\u0628\u062A \u0639\u0644\u0627\u0645\u062A \u062A\u062C\u0627\u0631\u06CC\u060C \u0627\u0635\u0627\u0644\u062A \u06CC\u0627 \u0627\u06CC\u0645\u0646\u06CC \u062D\u0642\u0648\u0642\u06CC \u0627\u0632 \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u0635\u0631\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "G\xF6rsel bir kar\u015F\u0131la\u015Ft\u0131rmadan marka tescili, \xF6zg\xFCnl\xFCk veya hukuki g\xFCvenlik iddias\u0131 \xE7\u0131kar\u0131lmaz."
  },
  brand_decision: {
    en: "A competitor observation never sets this brand\u2019s price, positioning, channels or logo; the owner decides through the existing approval flow.",
    fa: "\u0645\u0634\u0627\u0647\u062F\u0647\u0654 \u06CC\u06A9 \u0631\u0642\u06CC\u0628 \u0647\u0631\u06AF\u0632 \u0642\u06CC\u0645\u062A\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647\u060C \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u06CC\u0627 \u0644\u0648\u06AF\u0648\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0631\u0627 \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0645\u0627\u0644\u06A9 \u0627\u0632 \u0631\u0627\u0647 \u0641\u0631\u0627\u06CC\u0646\u062F \u062A\u0623\u06CC\u06CC\u062F \u0645\u0648\u062C\u0648\u062F \u062A\u0635\u0645\u06CC\u0645 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.",
    tr: "Bir rakip g\xF6zlemi bu markan\u0131n fiyat\u0131n\u0131, konumunu, kanallar\u0131n\u0131 veya logosunu asla belirlemez; sahibi mevcut onay ak\u0131\u015F\u0131yla karar verir."
  },
  currency_conversion: {
    en: "No currency conversion or tax calculation without a dated, cited rate and method.",
    fa: "\u0647\u06CC\u0686 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632 \u06CC\u0627 \u0645\u062D\u0627\u0633\u0628\u0647\u0654 \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC \u0628\u062F\u0648\u0646 \u0646\u0631\u062E \u0648 \u0631\u0648\u0634 \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631 \u0648 \u0645\u0633\u062A\u0646\u062F \u0627\u0646\u062C\u0627\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Tarihli ve kaynakl\u0131 bir kur ve y\xF6ntem olmadan d\xF6viz \xE7evirisi veya vergi hesab\u0131 yap\u0131lmaz."
  },
  price_coordination: {
    en: "No price matching or coordination with competitors. This brand sets its prices independently.",
    fa: "\u0647\u06CC\u0686 \u062A\u0637\u0628\u06CC\u0642 \u06CC\u0627 \u0647\u0645\u0627\u0647\u0646\u06AF\u06CC \u0642\u06CC\u0645\u062A \u0628\u0627 \u0631\u0642\u0628\u0627 \u0627\u0646\u062C\u0627\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC\u0634 \u0631\u0627 \u0645\u0633\u062A\u0642\u0644 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "Rakiplerle fiyat e\u015Fleme veya fiyat koordinasyonu yap\u0131lmaz. Bu marka fiyatlar\u0131n\u0131 ba\u011F\u0131ms\u0131z belirler."
  }
};
function asLang(value) {
  return typeof value === "string" && COMPETITIVE_LANGS.includes(value) ? value : "en";
}
function fill2(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}
var HEADINGS = {
  title: { en: "Competitive landscape for {name} ({state}). Draft, owner-only; authorizes nothing.", fa: "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0631\u0642\u0627\u0628\u062A\u06CC {name} ({state}). \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u0641\u0642\u0637 \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9\u061B \u0647\u06CC\u0686 \u0645\u062C\u0648\u0632\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.", tr: "{name} i\xE7in rekabet g\xF6r\xFCn\xFCm\xFC ({state}). Taslak, yaln\u0131zca sahibine \xF6zel; hi\xE7bir \u015Feye yetki vermez." },
  research: { en: "Research: {state}{reason}", fa: "\u067E\u0698\u0648\u0647\u0634: {state}{reason}", tr: "Ara\u015Ft\u0131rma: {state}{reason}" },
  scope: { en: "Scope: {purposes}. Target market fact {fact}: {state}.", fa: "\u062F\u0627\u0645\u0646\u0647: {purposes}. \u0648\u0627\u0642\u0639\u06CC\u062A \u0628\u0627\u0632\u0627\u0631 \u0647\u062F\u0641 {fact}: {state}.", tr: "Kapsam: {purposes}. Hedef pazar bilgisi {fact}: {state}." },
  scope_not_set: { en: "not set", fa: "\u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647", tr: "belirlenmedi" },
  prices: { en: "Public prices (listed, not ranked; no currency conversion): {state}{reason}", fa: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0639\u0645\u0648\u0645\u06CC (\u0641\u0647\u0631\u0633\u062A\u200C\u0634\u062F\u0647\u060C \u0628\u062F\u0648\u0646 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC\u061B \u0628\u062F\u0648\u0646 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632): {state}{reason}", tr: "A\xE7\u0131k fiyatlar (listelenir, s\u0131ralanmaz; d\xF6viz \xE7evirisi yok): {state}{reason}" },
  gaps: { en: "Gaps:", fa: "\u0634\u06A9\u0627\u0641\u200C\u0647\u0627:", tr: "Eksikler:" },
  never: { en: "Never inferred:", fa: "\u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F:", tr: "Asla \xE7\u0131kar\u0131lmaz:" },
  observed_on: { en: "observed {date}", fa: "\u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 {date}", tr: "{date} tarihinde g\xF6zlemlendi" }
};

// packages/brand-core/src/competitive/store.ts
import fs from "node:fs";
import path from "node:path";
var COMPETITIVE_DIRS = {
  root: "brand/.private/competitive",
  candidates: "brand/.private/competitive/candidates"
};
var COMPETITIVE_TOPIC = "market_observation";
function competitiveDir(ws, key) {
  return path.join(ws.root, ...COMPETITIVE_DIRS[key].split("/"));
}
function scopeFile(ws) {
  return path.join(competitiveDir(ws, "root"), "scope.json");
}
function candidateFile(ws, id) {
  return path.join(competitiveDir(ws, "candidates"), `${validateCompetitorId(id)}.json`);
}
function assertOwnerProcess3() {
  if (process.env[AGENT_TOKEN_ENV]) {
    throw new CompetitiveError("refused", `Competitor dossiers are the owner's local drafts. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers them.`);
  }
}
function usable(ws, dir) {
  try {
    return dirUsable(ws, dir);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CompetitiveError("unsafe_path", error.message);
    throw error;
  }
}
function readJson(ws, file2, kind) {
  if (!usable(ws, path.dirname(file2))) return null;
  let raw;
  try {
    raw = safeRead(file2, COMPETITIVE_LIMITS.maxFileBytes);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CompetitiveError("unsafe_path", error.message);
    throw error;
  }
  if (!raw) return null;
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new CompetitiveError("invalid_record", `${path.basename(file2)} is not valid JSON.`);
  }
  if (!doc || typeof doc !== "object" || doc.kind !== kind) throw new CompetitiveError("invalid_record", `${path.basename(file2)} is not a ${kind} record.`);
  if (doc.brand_slug !== ws.brandSlug) throw new CompetitiveError("wrong_brand", `${path.basename(file2)} belongs to another brand. It is not read.`);
  return doc;
}
function writeJson(ws, file2, doc) {
  try {
    writeVaultFile(ws, file2, `${JSON.stringify(doc, null, 2)}
`, true);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CompetitiveError("unsafe_path", error.message);
    throw error;
  }
}
function locked(ws, name, run) {
  try {
    return withLock(ws, name, run);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CompetitiveError(error.code === "unsafe_path" ? "unsafe_path" : "refused", error.message);
    throw error;
  }
}
function readCandidate(ws, id) {
  assertOwnerProcess3();
  const doc = readJson(ws, candidateFile(ws, id), "competitive_candidate");
  if (!doc) throw new CompetitiveError("not_found", `No competitor ${id} in this brand.`);
  if (doc.competitor_id !== id) throw new CompetitiveError("invalid_record", `The file for ${id} carries another competitor id.`);
  return doc;
}
function scanCandidates(ws) {
  assertOwnerProcess3();
  const folder = competitiveDir(ws, "candidates");
  const out = { records: [], skipped: [] };
  if (!usable(ws, folder)) return out;
  for (const name of fs.readdirSync(folder).sort()) {
    const match = /^(cmp_[0-9a-f-]{36})\.json$/.exec(name);
    if (!match) continue;
    try {
      out.records.push(readCandidate(ws, match[1]));
    } catch (error) {
      if (!(error instanceof CompetitiveError)) throw error;
      out.skipped.push({ file: name, reason: error.code });
    }
  }
  out.records.sort((a, b) => a.display_name.localeCompare(b.display_name) || a.competitor_id.localeCompare(b.competitor_id));
  return out;
}
function readScope(ws) {
  assertOwnerProcess3();
  return readJson(ws, scopeFile(ws), "competitive_scope");
}
function setScope(ws, purposes) {
  assertOwnerProcess3();
  const list2 = listOf(purposes, PURPOSES, "purposes");
  if (!list2.length) throw new CompetitiveError("invalid_input", `Name at least one purpose: ${PURPOSES.join(", ")}.`);
  const doc = { schema_version: COMPETITIVE_SCHEMA_VERSION, kind: "competitive_scope", brand_slug: ws.brandSlug, purposes: [...list2].sort(), updated_at: ws.now().toISOString() };
  locked(ws, "competitive-scope", () => writeJson(ws, scopeFile(ws), doc));
  return doc;
}
function marketsOverlap(a, b) {
  if (!a.length || !b.length || a.includes("GLOBAL") || b.includes("GLOBAL")) return true;
  return a.some((market) => b.includes(market));
}
function addCandidate(ws, input) {
  assertOwnerProcess3();
  const display = shortText(input.display_name, COMPETITIVE_LIMITS.maxNameChars, "Name");
  const key = nameKey(display);
  if (!key) throw new CompetitiveError("invalid_input", "A name needs at least one letter or digit.");
  const blocked = safetyBlocksSharing({ ...safetyReport(display), restricted_passages: 0 });
  if (blocked.length) throw new CompetitiveError("refused", `The name looks like it contains ${blocked.join("; ")}.`);
  const markets = validateMarkets(input.markets);
  const relationship = listOf(input.relationship, RELATIONSHIPS, "relationship");
  const geography = listOf(input.geography, GEOGRAPHIES, "geography");
  const domain = input.domain ? validateDomain(input.domain) : null;
  const source = oneOf(input.source ?? "owner_named", CANDIDATE_SOURCES, "source");
  return locked(ws, "competitive-index", () => {
    const existing = scanCandidates(ws).records;
    if (existing.length >= COMPETITIVE_LIMITS.maxCandidates) throw new CompetitiveError("refused", `At most ${COMPETITIVE_LIMITS.maxCandidates} candidates per brand.`);
    const sameName = existing.filter((record2) => record2.name_key === key);
    const distinct = [];
    if (sameName.length) {
      const other = input.distinct_from ? validateCompetitorId(input.distinct_from) : null;
      const reason = shortText(input.reason, COMPETITIVE_LIMITS.maxReasonChars, "reason", false);
      const named = sameName.find((record2) => record2.competitor_id === other);
      if (!named || !reason || sameName.length > 1) {
        throw new CompetitiveError("duplicate_candidate", `A candidate with this name exists (${sameName.map((record2) => record2.competitor_id).join(", ")}). Use it, or pass --distinct-from <id> --reason "<why this is another business>".`);
      }
      if (marketsOverlap(named.markets, markets)) {
        throw new CompetitiveError("duplicate_candidate", `${named.competitor_id} has the same name and an overlapping or unknown market. Two records for one business are refused; give disjoint markets for both or use the existing record.`);
      }
      distinct.push({ competitor_id: named.competitor_id, reason });
    }
    const now = ws.now().toISOString();
    const record = {
      schema_version: COMPETITIVE_SCHEMA_VERSION,
      kind: "competitive_candidate",
      competitor_id: newCompetitorId(),
      brand_slug: ws.brandSlug,
      display_name: display,
      name_key: key,
      relationship,
      geographic_relevance: geography,
      markets,
      source,
      status: "candidate",
      status_reason: null,
      domain_claim: domain,
      domain_evidence: null,
      distinct_from: distinct,
      observations: [],
      created_at: now,
      updated_at: now
    };
    writeJson(ws, candidateFile(ws, record.competitor_id), record);
    return record;
  });
}
function updateCandidate(ws, id, change) {
  validateCompetitorId(id);
  return locked(ws, `competitive-${id.slice(4, 40)}`, () => {
    const record = readCandidate(ws, id);
    change(record);
    record.updated_at = ws.now().toISOString();
    writeJson(ws, candidateFile(ws, id), record);
    return record;
  });
}
function setStatus(ws, input) {
  assertOwnerProcess3();
  const status = oneOf(input.status, STORED_STATUSES, "status");
  const reason = shortText(input.reason, COMPETITIVE_LIMITS.maxReasonChars, "reason", false);
  if ((status === "disputed" || status === "archived") && !reason) throw new CompetitiveError("invalid_input", `${status} needs --reason (for example why this business is excluded).`);
  return updateCandidate(ws, input.competitor_id, (record) => {
    record.status = status;
    record.status_reason = reason;
  });
}
function classifyCandidate(ws, input) {
  assertOwnerProcess3();
  const relationship = input.relationship === void 0 ? null : listOf(input.relationship, RELATIONSHIPS, "relationship");
  const geography = input.geography === void 0 ? null : listOf(input.geography, GEOGRAPHIES, "geography");
  const markets = input.markets === void 0 ? null : validateMarkets(input.markets);
  return updateCandidate(ws, input.competitor_id, (record) => {
    if (relationship) record.relationship = relationship;
    if (geography) record.geographic_relevance = geography;
    if (markets) record.markets = markets;
  });
}
function resolveEvidence(ws, input, claimKey, evidence = loadEvidence(ws)) {
  const pinned = typeof input === "string" ? parseKnowledgeRef(input) : null;
  const id = pinned ? pinned.id : input;
  if (typeof id !== "string" || !NOTE_ID.test(id)) throw new CompetitiveError("invalid_input", "Cite a research note as kn_<id> or knowledge:kn_<id>@<sha256>.");
  const key = validateClaimKey(claimKey);
  const item = evidence.items.find((candidate) => candidate.note.id === id);
  if (!item) throw new CompetitiveError("refused", `${id} is not a research note of this brand. Record the source first (npm run brand:seo -- research capture, topic ${COMPETITIVE_TOPIC}); restricted and ordinary notes are never cited.`);
  if (item.source.topic !== COMPETITIVE_TOPIC) throw new CompetitiveError("refused", `${id} is a ${item.source.topic} source. Competitor evidence is recorded with topic ${COMPETITIVE_TOPIC}.`);
  if (item.archived) throw new CompetitiveError("stale_source", `${id} is archived. Cite a current source.`);
  if (item.superseded_by) throw new CompetitiveError("stale_source", `${id} was superseded by ${item.superseded_by}. Cite the newer note.`);
  if (pinned && pinned.revision !== item.note.revision) throw new CompetitiveError("stale_source", `${id} changed since ${input} was read. Re-read it and cite the current revision.`);
  const excerpt = item.source.excerpts.find((candidate) => candidate.claim_key === key && candidate.stance === "supports");
  if (!excerpt) throw new CompetitiveError("unsupported_claim", `${id} has no supporting excerpt for ${key}. Nothing is recorded without a quote that says it.`);
  return { ref: { note_id: item.note.id, revision: item.note.revision, claim_key: key, observed_at: item.source.retrieved_at }, item, excerpt };
}
function linkEvidence(ws, input) {
  assertOwnerProcess3();
  const dimension = oneOf(input.dimension, DIMENSIONS, "dimension");
  const kind = oneOf(input.statement_kind ?? "observed_claim", STATEMENT_KINDS, "statement_kind");
  if ((dimension === "strength_hypothesis" || dimension === "weakness_hypothesis") && kind !== "inference") {
    throw new CompetitiveError("invalid_input", `${dimension} is a hypothesis: record it with statement_kind inference.`);
  }
  const label = shortText(input.label, COMPETITIVE_LIMITS.maxLabelChars, "label");
  const blocked = safetyBlocksSharing({ ...safetyReport(label), restricted_passages: 0 });
  if (blocked.length) throw new CompetitiveError("refused", `The label looks like it contains ${blocked.join("; ")}.`);
  const resolved = resolveEvidence(ws, input.note, input.claim_key);
  let price = null;
  if (dimension === "public_price") {
    if (!input.price) throw new CompetitiveError("invalid_input", "A public_price observation needs the price terms (amount, currency, market, period\u2026).");
    if (kind !== "observed_claim") throw new CompetitiveError("invalid_input", "A price is an observed claim, never an inference.");
    price = validatePrice(input.price);
    const support = priceSupport(price, resolved.excerpt.quote);
    if (!support.ok) throw new CompetitiveError("unsupported_claim", `The cited quote does not support this price: ${support.problems.join("; ")}. Nothing was recorded.`);
  } else if (input.price) {
    throw new CompetitiveError("invalid_input", "Price terms belong to a public_price observation only.");
  }
  let outcome = "linked";
  let observation = null;
  const record = updateCandidate(ws, input.competitor_id, (current) => {
    const same = current.observations.find((item) => item.dimension === dimension && item.evidence.note_id === resolved.ref.note_id && item.evidence.claim_key === resolved.ref.claim_key && item.evidence.revision === resolved.ref.revision);
    if (same) {
      outcome = "existing";
      observation = same;
      return;
    }
    if (current.observations.length >= COMPETITIVE_LIMITS.maxObservations) throw new CompetitiveError("refused", `At most ${COMPETITIVE_LIMITS.maxObservations} observations per competitor.`);
    observation = { observation_id: newObservationId(), dimension, statement_kind: kind, label, evidence: resolved.ref, price, recorded_at: ws.now().toISOString() };
    current.observations.push(observation);
  });
  return { record, observation, outcome };
}
function verifyDomain(ws, input) {
  assertOwnerProcess3();
  const id = validateCompetitorId(input.competitor_id);
  const current = readCandidate(ws, id);
  const domain = input.domain ? validateDomain(input.domain) : current.domain_claim;
  if (!domain) throw new CompetitiveError("invalid_input", "Give --domain: the bare domain this business uses.");
  const resolved = resolveEvidence(ws, input.note, input.claim_key);
  const hosts = [hostOf(resolved.item.source.url), hostOf(resolved.item.source.final_url)];
  if (!hosts.every((host) => hostMatchesDomain(host, domain))) throw new CompetitiveError("unsupported_claim", `${resolved.ref.note_id} was not fetched from ${domain}. A domain is verified only by a source retrieved from it.`);
  const clash = scanCandidates(ws).records.find((record) => record.competitor_id !== id && record.domain_claim === domain && record.status !== "archived");
  if (clash) throw new CompetitiveError("duplicate_candidate", `${clash.competitor_id} (${clash.display_name}) already claims ${domain}. Archive one record; they are never merged automatically.`);
  return updateCandidate(ws, id, (record) => {
    record.domain_claim = domain;
    record.domain_evidence = resolved.ref;
  });
}

// packages/brand-core/src/competitive/landscape.ts
var TARGET_MARKET_FACT = "business.market.geography";
function refState(evidence, ref) {
  const item = evidence.items.find((candidate) => candidate.note.id === ref.note_id) ?? null;
  if (!item) return { state: "missing", item };
  if (item.archived) return { state: "archived", item };
  if (item.superseded_by) return { state: "superseded", item };
  if (item.note.revision !== ref.revision) return { state: "changed", item };
  if (!item.source.excerpts.some((excerpt) => excerpt.claim_key === ref.claim_key && excerpt.stance === "supports")) return { state: "claim_missing", item };
  if (item.staleness.state === "stale") return { state: "stale", item };
  return { state: "current", item };
}
function sourceClass(item, domain) {
  const type = item.source.source_type;
  if (type === "owner_testimony") return "owner_statement";
  if (type === "first_party_data") return "first_party_data";
  if (type === "official_policy" || type === "official_product_docs") return "platform_documentation";
  if (domain && hostMatchesDomain(hostOf(item.source.final_url), domain)) return "competitor_own_page";
  if (type === "expert_opinion") return "analyst_inference";
  return "independent_reporting";
}
function priceConflicts(observations, usable2) {
  const out = /* @__PURE__ */ new Set();
  const priced = observations.filter((item) => item.price && usable2.has(item.observation_id));
  for (const a of priced) {
    for (const b of priced) {
      if (a === b) continue;
      const pa = a.price;
      const pb = b.price;
      const sameTerms = pa.offer_name.toLowerCase() === pb.offer_name.toLowerCase() && pa.market === pb.market && pa.currency === pb.currency && pa.billing_period === pb.billing_period && pa.billing_commitment === pb.billing_commitment;
      if (sameTerms && pa.amount !== pb.amount) out.add(a.observation_id);
    }
  }
  return out;
}
function viewObservations(record, evidence) {
  const states = new Map(record.observations.map((item) => [item.observation_id, refState(evidence, item.evidence)]));
  const usable2 = new Set(record.observations.filter((item) => states.get(item.observation_id).state === "current").map((item) => item.observation_id));
  const priceClash = priceConflicts(record.observations, usable2);
  return record.observations.map((item) => {
    const { state, item: source } = states.get(item.observation_id);
    const claim = evidenceFor(evidence, item.evidence.claim_key);
    const conflict = claim.contradicting.length > 0 || priceClash.has(item.observation_id);
    let cell;
    if (state !== "current" && state !== "stale") cell = "needs_review";
    else if (conflict) cell = "conflicting";
    else if (state === "stale") cell = "historical";
    else if (item.statement_kind === "inference") cell = "hypothesis";
    else if (!source.source.quotes_verified || !source.source.content_sha256) cell = "unverified";
    else cell = "observed";
    return {
      observation_id: item.observation_id,
      dimension: item.dimension,
      statement_kind: item.statement_kind,
      label: item.label,
      evidence: { ...item.evidence, ref: knowledgeRef(item.evidence.note_id, item.evidence.revision) },
      ref_state: state,
      source_class: source ? sourceClass(source, record.domain_claim) : null,
      trust: source ? source.trust.level : null,
      conflict,
      cell,
      verified: cell === "observed",
      price: item.price ? { ...item.price, caveats: priceCaveats(item.price) } : null
    };
  });
}
function domainState(record, evidence) {
  if (!record.domain_claim) return "not_claimed";
  if (!record.domain_evidence) return "unverified";
  const { state, item } = refState(evidence, record.domain_evidence);
  if (state !== "current" && state !== "stale" || !item) return "needs_review";
  const hosts = [hostOf(item.source.url), hostOf(item.source.final_url)];
  return hosts.every((host) => hostMatchesDomain(host, record.domain_claim)) ? "verified" : "needs_review";
}
var CELL_RANK = ["conflicting", "observed", "hypothesis", "unverified", "historical", "needs_review"];
function cellOf(views) {
  if (!views.length) return "unknown";
  for (const state of CELL_RANK) if (views.some((view) => view.cell === state)) return state;
  return "unknown";
}
function assessmentOf(record, views) {
  if (record.status === "archived" || record.status === "disputed") return record.status;
  if (views.some((view) => view.cell === "needs_review" || view.cell === "historical")) return "needs_refresh";
  if (record.status === "owner_reviewed") return "owner_reviewed";
  return views.length ? "researched" : "candidate";
}
function priceComparison(rows) {
  const current = rows.filter((row) => row.cell === "observed" || row.cell === "unverified");
  if (rows.length === 0) return { comparison: "none", reasons: [] };
  if (rows.length === 1) return { comparison: "single", reasons: [] };
  const reasons = /* @__PURE__ */ new Set();
  if (current.length < rows.length) reasons.add("some_prices_not_current");
  const distinct = (pick2) => new Set(rows.map(pick2)).size > 1;
  if (distinct((row) => row.currency)) reasons.add("different_currencies");
  if (distinct((row) => row.market)) reasons.add("different_markets");
  if (distinct((row) => row.billing_period)) reasons.add("different_billing_periods");
  if (distinct((row) => row.billing_commitment)) reasons.add("different_commitments");
  for (const row of rows) for (const caveat of row.caveats) reasons.add(caveat);
  return reasons.size ? { comparison: "not_comparable", reasons: [...reasons].sort() } : { comparison: "terms_match", reasons: [] };
}
function buildLandscape(ws, opts) {
  const now = opts.now ?? ws.now();
  const lang = opts.lang ?? "en";
  const t = (code, vars = {}) => fill2(GAP_TEXT2[code][lang], vars);
  const dim = (d) => DIMENSION_LABELS[d][lang];
  const scan = scanCandidates(ws);
  const evidence = loadEvidence(ws, { now });
  const scope = readScope(ws);
  const purposes = scope?.purposes ?? [];
  const dimensions = purposes.length ? DIMENSIONS.filter((d) => purposes.some((p) => PURPOSE_DIMENSIONS[p].includes(d))) : [...DIMENSIONS];
  const fact = readFacts(ws.root, "approved", ws.brandSlug)[TARGET_MARKET_FACT];
  const targetApproved = Boolean(fact && fact.status === "approved" && fact.revision_hash);
  const gaps = [];
  const gap = (code, vars = {}, competitor = null, dimension = null) => gaps.push({ code, competitor_id: competitor, dimension, text: t(code, vars) });
  if (opts.capability.state !== "available") gap("research_unavailable", { reason: opts.capability.reason ?? "unavailable" });
  if (!scope) gap("scope_not_set");
  if (!targetApproved) gap("target_market_unapproved");
  if (purposes.includes("seo")) gap("seo_needs_search_evidence");
  const candidates = [];
  const matrix = [];
  const priceRows = [];
  const active = scan.records.filter((record) => record.status !== "archived");
  if (!active.length) gap("no_candidates");
  for (const record of scan.records) {
    const views = viewObservations(record, evidence);
    const domain = domainState(record, evidence);
    const needs = [];
    const vars = { name: record.display_name };
    const isActive = record.status !== "archived";
    if (isActive && !record.relationship.length) {
      gap("relationship_unknown", vars, record.competitor_id);
      needs.push(t("relationship_unknown", vars));
    }
    if (isActive && domain !== "verified") {
      gap("identity_unverified", vars, record.competitor_id);
      needs.push(t("identity_unverified", vars));
    }
    if (isActive && record.distinct_from.length) needs.push(t("same_name_other_market", vars));
    for (const view of views) {
      if (!isActive) break;
      if (view.cell === "needs_review" || view.cell === "historical") {
        const text2 = t("evidence_needs_review", { ...vars, dimension: dim(view.dimension), note: view.evidence.note_id, reason: REVIEW_REASONS[view.ref_state][lang] });
        gaps.push({ code: "evidence_needs_review", competitor_id: record.competitor_id, dimension: view.dimension, text: text2 });
        needs.push(text2);
      }
    }
    for (const d of DIMENSIONS) {
      const inDim = views.filter((view) => view.dimension === d);
      const state2 = cellOf(inDim);
      matrix.push({ competitor_id: record.competitor_id, dimension: d, state: state2, observation_ids: inDim.map((view) => view.observation_id) });
      if (!isActive) continue;
      if (state2 === "conflicting") {
        const text2 = t("evidence_conflicting", { ...vars, dimension: dim(d) });
        gaps.push({ code: "evidence_conflicting", competitor_id: record.competitor_id, dimension: d, text: text2 });
        needs.push(text2);
      }
      if (state2 === "unknown" && dimensions.includes(d)) gap("dimension_unknown", { ...vars, dimension: dim(d) }, record.competitor_id, d);
    }
    if (isActive) {
      for (const view of views) {
        if (!view.price) continue;
        const { caveats, ...price } = view.price;
        priceRows.push({
          competitor_id: record.competitor_id,
          observation_id: view.observation_id,
          offer_name: price.offer_name,
          amount: price.amount,
          currency: price.currency,
          market: price.market,
          billing_period: price.billing_period,
          billing_commitment: price.billing_commitment,
          tax_inclusion: price.tax_inclusion,
          promotion: price.promotion,
          observed_at: view.evidence.observed_at,
          cell: view.cell,
          caveats: view.cell === "historical" ? [...caveats, "historical"] : caveats
        });
      }
    }
    candidates.push({
      competitor_id: record.competitor_id,
      display_name: record.display_name,
      relationship: record.relationship,
      geographic_relevance: record.geographic_relevance,
      markets: record.markets,
      source: record.source,
      status: record.status,
      status_reason: record.status_reason,
      assessment: assessmentOf(record, views),
      official_domain: domain === "verified" ? record.domain_claim : null,
      domain_state: domain,
      observations: views,
      needs_review: needs
    });
  }
  const prices = priceComparison(priceRows);
  if (prices.comparison === "not_comparable") gap("prices_not_comparable", { reason: prices.reasons.join(", ") });
  const usable2 = candidates.filter((c) => c.status !== "archived").flatMap((c) => c.observations).filter((v) => v.cell === "observed" || v.cell === "unverified" || v.cell === "hypothesis");
  const unknownInScope = gaps.some((g) => g.code === "dimension_unknown");
  const state = !active.length ? "no_candidates" : !usable2.length ? "candidate_only" : unknownInScope ? "evidence_insufficient" : "evidence_available";
  return {
    schema: LANDSCAPE_SCHEMA,
    brand_slug: ws.brandSlug,
    generated_at: now.toISOString(),
    lang,
    research: { adapter: opts.capability.adapter, state: opts.capability.state, mode: opts.capability.mode, reason: opts.capability.reason },
    scope: { purposes, dimensions, set: Boolean(scope) },
    target_market: { fact_id: TARGET_MARKET_FACT, state: targetApproved ? "approved" : "missing", revision: targetApproved ? fact.revision_hash : null },
    state,
    candidates,
    matrix,
    prices: { rows: priceRows, comparison: prices.comparison, reasons: prices.reasons, ranked: false, currency_conversion: "none" },
    gaps,
    prohibited_inferences: Object.entries(PROHIBITED_TEXT).map(([code, text2]) => ({ code, text: text2[lang] })),
    skipped_files: scan.skipped.length,
    authorizes: []
  };
}

// packages/brand-core/src/competitive/context.ts
var CONTEXT_SCHEMA = "brand-os.competitive-context/1";
var USABLE_CELLS = ["observed", "unverified", "hypothesis"];
var PURPOSE_PROHIBITED = {
  identity: ["legal_clearance", "brand_decision"],
  positioning: ["ad_performance", "brand_decision"],
  marketing: ["ad_performance", "private_commercials", "brand_decision"],
  pricing: ["private_commercials", "currency_conversion", "price_coordination", "brand_decision"],
  seo: ["search_rankings", "ad_performance", "brand_decision"],
  expansion: ["private_commercials", "brand_decision"]
};
var STEP_OF = {
  dimension_unknown: "record_source",
  evidence_needs_review: "refresh_source",
  evidence_conflicting: "resolve_conflict",
  identity_unverified: "verify_domain",
  relationship_unknown: "classify",
  research_unavailable: "enable_research",
  target_market_unapproved: "approve_target_market",
  no_candidates: "add_candidates",
  seo_needs_search_evidence: "search_evidence"
};
var RECOMPUTED = /* @__PURE__ */ new Set(["dimension_unknown", "prices_not_comparable", "scope_not_set", "seo_needs_search_evidence", "no_candidates"]);
function marketMatch(markets, market) {
  if (!market) return "unfiltered";
  if (!markets.length) return "unknown";
  if (markets.includes(market)) return "listed";
  if (markets.includes("GLOBAL")) return "global";
  return null;
}
function getCompetitiveContext(ws, purpose, opts) {
  const chosen = oneOf(purpose, PURPOSES, "purpose");
  let market = null;
  if (opts.market) {
    const markets = validateMarkets(opts.market);
    if (markets.length !== 1) throw new CompetitiveError("invalid_input", "Give one market (TR, US\u2026) or GLOBAL.");
    market = markets[0];
  }
  const view = buildLandscape(ws, opts);
  const lang = view.lang;
  const dimensions = PURPOSE_DIMENSIONS[chosen];
  const t = (code, vars = {}) => fill2(GAP_TEXT2[code][lang], vars);
  const competitors = [];
  const observations = [];
  let excluded = 0;
  for (const c of view.candidates) {
    const match = c.status === "archived" ? null : marketMatch(c.markets, market);
    if (!match) {
      excluded += 1;
      continue;
    }
    const mine = c.observations.filter((o) => dimensions.includes(o.dimension) && (!market || !o.price || o.price.market === market));
    competitors.push({
      competitor_id: c.competitor_id,
      display_name: c.display_name,
      relationship: c.relationship,
      geographic_relevance: c.geographic_relevance,
      markets: c.markets,
      source: c.source,
      assessment: c.assessment,
      official_domain: c.official_domain,
      domain_state: c.domain_state,
      market_match: match,
      observation_ids: mine.map((o) => o.observation_id)
    });
    for (const o of mine) {
      observations.push({
        competitor_id: c.competitor_id,
        competitor_name: c.display_name,
        observation_id: o.observation_id,
        dimension: o.dimension,
        statement_kind: o.statement_kind,
        label: o.label,
        ref: o.evidence.ref,
        note_id: o.evidence.note_id,
        revision: o.evidence.revision,
        claim_key: o.evidence.claim_key,
        observed_at: o.evidence.observed_at,
        ref_state: o.ref_state,
        source_class: o.source_class,
        trust: o.trust,
        cell: o.cell,
        verified: o.verified,
        conflict: o.conflict,
        usable: USABLE_CELLS.includes(o.cell),
        price: o.price
      });
    }
  }
  const included = new Set(competitors.map((c) => c.competitor_id));
  const gaps = view.gaps.filter((g) => !RECOMPUTED.has(g.code) && (!g.competitor_id || included.has(g.competitor_id)) && (!g.dimension || dimensions.includes(g.dimension)));
  if (!competitors.length) gaps.push({ code: "no_candidates", competitor_id: null, dimension: null, text: t("no_candidates") });
  if (chosen === "seo") gaps.push({ code: "seo_needs_search_evidence", competitor_id: null, dimension: null, text: t("seo_needs_search_evidence") });
  const conflicts = [];
  for (const c of competitors) {
    for (const d of dimensions) {
      const cell = view.matrix.find((m) => m.competitor_id === c.competitor_id && m.dimension === d);
      const inDim = observations.filter((o) => o.competitor_id === c.competitor_id && o.dimension === d);
      if (!inDim.length) gaps.push({ code: "dimension_unknown", competitor_id: c.competitor_id, dimension: d, text: t("dimension_unknown", { name: c.display_name, dimension: DIMENSION_LABELS[d][lang] }) });
      if (cell?.state === "conflicting") conflicts.push({ competitor_id: c.competitor_id, dimension: d, observation_ids: inDim.filter((o) => o.conflict).map((o) => o.observation_id) });
    }
  }
  let prices = null;
  if (dimensions.includes("public_price")) {
    const rows = view.prices.rows.filter((row) => included.has(row.competitor_id) && (!market || row.market === market));
    const comparison = priceComparison(rows);
    prices = { rows, comparison: comparison.comparison, reasons: comparison.reasons, ranked: false, currency_conversion: "none" };
    if (comparison.comparison === "not_comparable") gaps.push({ code: "prices_not_comparable", competitor_id: null, dimension: "public_price", text: t("prices_not_comparable", { reason: comparison.reasons.join(", ") }) });
  }
  const usable2 = observations.filter((o) => o.usable);
  const state = !competitors.length ? "missing" : !usable2.length ? "candidate_only" : gaps.some((g) => g.code === "dimension_unknown") ? "evidence_insufficient" : "evidence_available";
  const dates = observations.map((o) => o.observed_at).sort();
  const source_refs = [...new Set(observations.map((o) => o.ref))].sort();
  const source_digest = sha256Hex(
    canonicalJson({
      purpose: chosen,
      market,
      target: view.target_market.revision,
      refs: observations.map((o) => [o.observation_id, o.ref, o.claim_key, o.ref_state, o.cell]).sort()
    })
  );
  return {
    schema: CONTEXT_SCHEMA,
    brand_slug: view.brand_slug,
    generated_at: view.generated_at,
    lang,
    purpose: chosen,
    dimensions,
    market,
    research: view.research,
    target_market: view.target_market,
    state,
    competitors,
    observations,
    conflicts,
    freshness: {
      usable: usable2.length,
      historical: observations.filter((o) => o.cell === "historical").length,
      needs_review: observations.filter((o) => o.cell === "needs_review").length,
      conflicting: observations.filter((o) => o.cell === "conflicting").length,
      oldest_observed_at: dates[0] ?? null,
      newest_observed_at: dates[dates.length - 1] ?? null
    },
    prices,
    gaps,
    next_research: gaps.filter((g) => STEP_OF[g.code]).map((g) => ({ code: STEP_OF[g.code], competitor_id: g.competitor_id, dimension: g.dimension, text: g.text })),
    source_refs,
    source_digest,
    prohibited_inferences: PURPOSE_PROHIBITED[chosen].map((code) => ({ code, text: PROHIBITED_TEXT[code][lang] })),
    excluded_candidates: excluded,
    authorizes: []
  };
}

// packages/brand-core/src/seo/interview.ts
var UNKNOWN = "unknown";
var web = (a) => single(a["seo.presence.web"]);
var app = (a) => single(a["seo.presence.app"]);
var hasWeb = (a) => web(a) !== void 0 && web(a) !== "none";
var hasApp = (a) => app(a) !== void 0 && app(a) !== "none";
function single(value) {
  return Array.isArray(value) ? value[0] : value;
}
function list(value) {
  if (value === void 0) return [];
  return (Array.isArray(value) ? value : [value]).filter((item) => item !== UNKNOWN);
}
var always = () => null;
var needsWeb = (a) => web(a) === void 0 ? "Waiting for seo.presence.web." : hasWeb(a) ? null : "The brand has no website, so there is no site to configure.";
var SEO_QUESTIONS = [
  {
    id: "seo.presence.web",
    stage: "presence",
    prompt: {
      en: "What website does the brand have today: none, a single landing page, a content site, a web app, or a shop?",
      fa: "\u0628\u0631\u0646\u062F \u0627\u0645\u0631\u0648\u0632 \u0686\u0647 \u0648\u0628\u200C\u0633\u0627\u06CC\u062A\u06CC \u062F\u0627\u0631\u062F: \u0647\u06CC\u0686\u060C \u06CC\u06A9 \u0635\u0641\u062D\u0647\u0654 \u0641\u0631\u0648\u062F\u060C \u0633\u0627\u06CC\u062A \u0645\u062D\u062A\u0648\u0627\u06CC\u06CC\u060C \u0648\u0628\u200C\u0627\u067E \u06CC\u0627 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u061F",
      tr: "Markan\u0131n bug\xFCn hangi web sitesi var: hi\xE7, tek bir a\xE7\u0131l\u0131\u015F sayfas\u0131, i\xE7erik sitesi, web uygulamas\u0131 ya da ma\u011Faza?"
    },
    why_it_matters: "Web search strategy for a brand without a site is a different strategy, not a smaller one.",
    decision_informed: "Which strategy archetype applies (app-only, site-led, or both).",
    choices: ["none", "landing_page", "content_site", "web_app", "ecommerce"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: "The live URL, if any.",
    priority: 1
  },
  {
    id: "seo.presence.app",
    stage: "presence",
    prompt: {
      en: "Is there a mobile app, and on which stores?",
      fa: "\u0622\u06CC\u0627 \u0627\u067E \u0645\u0648\u0628\u0627\u06CC\u0644 \u062F\u0627\u0631\u06CC\u062F \u0648 \u062F\u0631 \u06A9\u062F\u0627\u0645 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u200C\u0647\u0627\u061F",
      tr: "Bir mobil uygulama var m\u0131, hangi ma\u011Fazalarda?"
    },
    why_it_matters: "Store search (ASO) and web search are different systems with different levers.",
    decision_informed: "Whether store listings are the primary search surface.",
    choices: ["none", "ios", "android", "ios_android"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: "Store listing URLs.",
    priority: 2
  },
  {
    id: "seo.business.model",
    stage: "market",
    prompt: { en: "Who buys: consumers, businesses, or both?", fa: "\u0686\u0647 \u06A9\u0633\u06CC \u0645\u06CC\u200C\u062E\u0631\u062F: \u0645\u0635\u0631\u0641\u200C\u06A9\u0646\u0646\u062F\u0647\u060C \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u06CC\u0627 \u0647\u0631 \u062F\u0648\u061F", tr: "Kim sat\u0131n al\u0131yor: t\xFCketiciler, i\u015Fletmeler ya da her ikisi?" },
    why_it_matters: "B2B search is fewer, higher-intent queries across a buying committee; B2C is volume and immediacy.",
    decision_informed: "Search intent model and which pages carry the strategy.",
    choices: ["b2c", "b2b", "both"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 3
  },
  {
    id: "seo.goal.primary",
    stage: "market",
    prompt: { en: "What should search bring first: installs, sign-ups, leads, sales, or awareness?", fa: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0627\u0648\u0644 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0628\u0627\u06CC\u062F \u0628\u06CC\u0627\u0648\u0631\u062F: \u0646\u0635\u0628\u060C \u062B\u0628\u062A\u200C\u0646\u0627\u0645\u060C \u0633\u0631\u0646\u062E \u0641\u0631\u0648\u0634\u060C \u0641\u0631\u0648\u0634 \u06CC\u0627 \u0622\u06AF\u0627\u0647\u06CC\u061F", tr: "Arama \xF6nce ne getirmeli: y\xFCkleme, kay\u0131t, potansiyel m\xFC\u015Fteri, sat\u0131\u015F ya da bilinirlik?" },
    why_it_matters: "The conversion defines which pages matter and what is measured.",
    decision_informed: "Primary objective and leading indicators.",
    choices: ["app_installs", "signups", "leads", "sales", "awareness"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: "Current conversion definition.",
    priority: 4
  },
  {
    id: "seo.goal.timeframe",
    stage: "market",
    prompt: { en: "By when do you expect search to matter for that goal?", fa: "\u0627\u0646\u062A\u0638\u0627\u0631 \u062F\u0627\u0631\u06CC\u062F \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u062A\u0627 \u0686\u0647 \u0632\u0645\u0627\u0646\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0647\u062F\u0641 \u0627\u062B\u0631 \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F\u061F", tr: "Araman\u0131n bu hedef i\xE7in ne zamana kadar etkili olmas\u0131n\u0131 bekliyorsunuz?" },
    why_it_matters: "Organic search is slow to show effects; an unrealistic horizon must be named, not accepted silently.",
    decision_informed: "Whether the goal is feasible and what to do meanwhile.",
    choices: ["under_3_months", "3_to_12_months", "over_12_months"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 5
  },
  {
    id: "seo.market.locales",
    stage: "market",
    prompt: { en: "Which languages must people be able to find you in? (codes such as en, fa, tr)", fa: "\u0645\u0631\u062F\u0645 \u0628\u0627\u06CC\u062F \u0628\u0647 \u0686\u0647 \u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC\u06CC \u0628\u062A\u0648\u0627\u0646\u0646\u062F \u0634\u0645\u0627 \u0631\u0627 \u067E\u06CC\u062F\u0627 \u06A9\u0646\u0646\u062F\u061F (\u06A9\u062F\u0647\u0627\u06CC\u06CC \u0645\u0627\u0646\u0646\u062F en\u060C fa\u060C tr)", tr: "\u0130nsanlar sizi hangi dillerde bulabilmeli? (en, fa, tr gibi kodlar)" },
    why_it_matters: "Each language is its own search market with its own queries and competitors.",
    decision_informed: "Locale scope and, with a site, its structure.",
    choices: null,
    multi: true,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 6
  },
  {
    id: "seo.web.locale_structure",
    stage: "presence",
    prompt: { en: "How are (or will) the language versions of the site be organised?", fa: "\u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u0632\u0628\u0627\u0646\u06CC \u0633\u0627\u06CC\u062A \u0686\u06AF\u0648\u0646\u0647 \u0633\u0627\u0632\u0645\u0627\u0646\u200C\u062F\u0647\u06CC \u0634\u062F\u0647\u200C\u0627\u0646\u062F (\u06CC\u0627 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F)\u061F", tr: "Sitenin dil s\xFCr\xFCmleri nas\u0131l d\xFCzenleniyor (ya da d\xFCzenlenecek)?" },
    why_it_matters: "Localized versions must be declared consistently; changing structure later is a migration.",
    decision_informed: "International setup.",
    choices: ["single_language", "subdirectories", "subdomains", "country_domains", "undecided"],
    multi: false,
    depends_on: ["seo.presence.web", "seo.market.locales"],
    skip: (a) => needsWeb(a) ?? (list(a["seo.market.locales"]).length > 1 ? null : "Only one language is in scope."),
    evidence_needed: "Current URL pattern per language.",
    priority: 7
  },
  {
    id: "seo.web.maturity",
    stage: "presence",
    prompt: { en: "Is the site new, established, or about to move domain or platform?", fa: "\u0633\u0627\u06CC\u062A \u062A\u0627\u0632\u0647 \u0627\u0633\u062A\u060C \u062C\u0627\u0627\u0641\u062A\u0627\u062F\u0647 \u0627\u0633\u062A\u060C \u06CC\u0627 \u062F\u0631 \u0622\u0633\u062A\u0627\u0646\u0647\u0654 \u0627\u0646\u062A\u0642\u0627\u0644 \u062F\u0627\u0645\u0646\u0647 \u06CC\u0627 \u067E\u0644\u062A\u0641\u0631\u0645\u061F", tr: "Site yeni mi, oturmu\u015F mu, yoksa alan ad\u0131 ya da platform de\u011Fi\u015Fikli\u011Fi mi yakla\u015F\u0131yor?" },
    why_it_matters: "A migration is the riskiest SEO event; a new site has no history to protect.",
    decision_informed: "Whether migration safety comes before everything else.",
    choices: ["new", "established", "migrating"],
    multi: false,
    depends_on: ["seo.presence.web"],
    skip: needsWeb,
    evidence_needed: null,
    priority: 8
  },
  {
    id: "seo.web.control",
    stage: "resources",
    prompt: { en: "Can the team change titles, page text, redirects and robots rules on the site?", fa: "\u0622\u06CC\u0627 \u062A\u06CC\u0645 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0639\u0646\u0648\u0627\u0646\u200C\u0647\u0627\u060C \u0645\u062A\u0646 \u0635\u0641\u062D\u0647\u060C \u0631\u06CC\u062F\u0627\u06CC\u0631\u06A9\u062A\u200C\u0647\u0627 \u0648 \u0642\u0648\u0627\u0646\u06CC\u0646 robots \u0633\u0627\u06CC\u062A \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0647\u062F\u061F", tr: "Ekip sitede ba\u015Fl\u0131klar\u0131, sayfa metnini, y\xF6nlendirmeleri ve robots kurallar\u0131n\u0131 de\u011Fi\u015Ftirebilir mi?" },
    why_it_matters: "A plan that needs changes nobody can make is not a plan.",
    decision_informed: "Which technical actions are feasible now.",
    choices: ["full", "cms_limited", "none"],
    multi: false,
    depends_on: ["seo.presence.web"],
    skip: needsWeb,
    evidence_needed: null,
    priority: 9
  },
  {
    id: "seo.data.search_console",
    stage: "measurement",
    prompt: { en: "Is the site verified in a search engine console (for example Google Search Console)? Do not paste any credentials.", fa: "\u0622\u06CC\u0627 \u0633\u0627\u06CC\u062A \u062F\u0631 \u06A9\u0646\u0633\u0648\u0644 \u0645\u0648\u062A\u0648\u0631 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 (\u0645\u062B\u0644\u0627\u064B Google Search Console) \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u0633\u062A\u061F \u0647\u06CC\u0686 \u0631\u0645\u0632 \u06CC\u0627 \u06A9\u0644\u06CC\u062F\u06CC \u0648\u0627\u0631\u062F \u0646\u06A9\u0646\u06CC\u062F.", tr: "Site bir arama motoru konsolunda (\xF6rne\u011Fin Google Search Console) do\u011Fruland\u0131 m\u0131? Hi\xE7bir kimlik bilgisi yap\u0131\u015Ft\u0131rmay\u0131n." },
    why_it_matters: "Without it there is no baseline: every search number in a plan would be invented.",
    decision_informed: "Measurement plan and baseline.",
    choices: ["verified", "not_set_up"],
    multi: false,
    depends_on: ["seo.presence.web"],
    skip: needsWeb,
    evidence_needed: "An owner-made export, if verified.",
    priority: 10
  },
  {
    id: "seo.data.analytics",
    stage: "measurement",
    prompt: { en: "Is there any analytics that records the conversion?", fa: "\u0622\u06CC\u0627 \u0627\u0628\u0632\u0627\u0631 \u062A\u062D\u0644\u06CC\u0644\u06CC \u0647\u0633\u062A \u06A9\u0647 \u062A\u0628\u062F\u06CC\u0644 \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u062F\u061F", tr: "D\xF6n\xFC\u015F\xFCm\xFC kaydeden bir analitik var m\u0131?" },
    why_it_matters: "Search impressions are not outcomes; the conversion must be measurable.",
    decision_informed: "Whether outcomes can be attributed at all.",
    choices: ["available", "none"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 11
  },
  {
    id: "seo.content.capacity",
    stage: "resources",
    prompt: { en: "How much new, useful content can the team really publish: none, a little (about two pieces a month), a steady flow, or a lot?", fa: "\u062A\u06CC\u0645 \u0648\u0627\u0642\u0639\u0627\u064B \u0686\u0642\u062F\u0631 \u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0627\u0632\u0647 \u0648 \u0645\u0641\u06CC\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u062F: \u0647\u06CC\u0686\u060C \u06A9\u0645 (\u062D\u062F\u0648\u062F \u062F\u0648 \u0645\u0637\u0644\u0628 \u062F\u0631 \u0645\u0627\u0647)\u060C \u0645\u0646\u0638\u0645 \u06CC\u0627 \u0632\u06CC\u0627\u062F\u061F", tr: "Ekip ger\xE7ekte ne kadar yeni ve yararl\u0131 i\xE7erik yay\u0131nlayabilir: hi\xE7, az (ayda yakla\u015F\u0131k iki), d\xFCzenli ya da \xE7ok?" },
    why_it_matters: "Content-led strategies fail without production capacity.",
    decision_informed: "Whether a content programme is feasible.",
    choices: ["none", "low", "medium", "high"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 12
  },
  {
    id: "seo.content.firsthand",
    stage: "resources",
    prompt: { en: "Does the brand have first-hand material others cannot copy: its own data, or real expertise?", fa: "\u0622\u06CC\u0627 \u0628\u0631\u0646\u062F \u0645\u0637\u0627\u0644\u0628 \u062F\u0633\u062A\u200C\u0627\u0648\u0644\u06CC \u062F\u0627\u0631\u062F \u06A9\u0647 \u062F\u06CC\u06AF\u0631\u0627\u0646 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u06A9\u067E\u06CC \u06A9\u0646\u0646\u062F: \u062F\u0627\u062F\u0647\u0654 \u062E\u0648\u062F\u0634 \u06CC\u0627 \u062A\u062E\u0635\u0635 \u0648\u0627\u0642\u0639\u06CC\u061F", tr: "Markan\u0131n ba\u015Fkalar\u0131n\u0131n kopyalayamayaca\u011F\u0131 birinci elden malzemesi var m\u0131: kendi verisi ya da ger\xE7ek uzmanl\u0131k?" },
    why_it_matters: "Differentiated, people-first material is what a content strategy can stand on.",
    decision_informed: "Content differentiation and answer-worthiness.",
    choices: ["original_data", "expertise", "none"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: "Examples of the material.",
    priority: 13
  },
  {
    id: "seo.competitors.named",
    stage: "market",
    prompt: { en: "Which competitors or substitutes do people choose instead of you? Names only.", fa: "\u0645\u0631\u062F\u0645 \u0628\u0647\u200C\u062C\u0627\u06CC \u0634\u0645\u0627 \u06A9\u062F\u0627\u0645 \u0631\u0642\u0628\u0627 \u06CC\u0627 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646\u200C\u0647\u0627 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061F \u0641\u0642\u0637 \u0646\u0627\u0645.", tr: "\u0130nsanlar sizin yerinize hangi rakipleri ya da alternatifleri se\xE7iyor? Yaln\u0131zca adlar." },
    why_it_matters: "Competitors are assumptions until their search presence is checked; names alone are not rankings.",
    decision_informed: "Competitor assumptions to verify.",
    choices: null,
    multi: true,
    depends_on: [],
    skip: always,
    evidence_needed: "A dated check of their search presence, if any.",
    priority: 14
  },
  {
    id: "seo.app.store_status",
    stage: "presence",
    prompt: { en: "Is the app live in the store, or not yet released?", fa: "\u0627\u067E \u062F\u0631 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0645\u0646\u062A\u0634\u0631 \u0634\u062F\u0647 \u06CC\u0627 \u0647\u0646\u0648\u0632 \u0646\u0647\u061F", tr: "Uygulama ma\u011Fazada yay\u0131nda m\u0131, yoksa hen\xFCz \xE7\u0131kmad\u0131 m\u0131?" },
    why_it_matters: "An unreleased product cannot be promised in search results or listings.",
    decision_informed: "What can be claimed and when.",
    choices: ["live", "prelaunch"],
    multi: false,
    depends_on: ["seo.presence.app"],
    skip: (a) => app(a) === void 0 ? "Waiting for seo.presence.app." : hasApp(a) ? null : "There is no app.",
    evidence_needed: "Store listing URL.",
    priority: 15
  },
  {
    id: "seo.app.web_openness",
    stage: "presence",
    prompt: { en: "Would you build a small official website if search evidence supported it?", fa: "\u0627\u06AF\u0631 \u0634\u0648\u0627\u0647\u062F \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u06A9\u0646\u062F\u060C \u06CC\u06A9 \u0648\u0628\u200C\u0633\u0627\u06CC\u062A \u0631\u0633\u0645\u06CC \u06A9\u0648\u0686\u06A9 \u0645\u06CC\u200C\u0633\u0627\u0632\u06CC\u062F\u061F", tr: "Arama kan\u0131tlar\u0131 desteklerse k\xFC\xE7\xFCk bir resmi web sitesi kurar m\u0131s\u0131n\u0131z?" },
    why_it_matters: "Without a site, web search can only reach the brand through store pages and third parties.",
    decision_informed: "Whether a minimal official site is an option.",
    choices: ["yes", "no", "later"],
    multi: false,
    depends_on: ["seo.presence.web", "seo.presence.app"],
    skip: (a) => web(a) === void 0 ? "Waiting for seo.presence.web." : web(a) !== "none" ? "The brand already has a website." : null,
    evidence_needed: null,
    priority: 16
  },
  {
    id: "seo.geo.interest",
    stage: "discovery",
    prompt: { en: "Does being found through AI answer engines (AI search features, chat assistants) matter for this brand?", fa: "\u0622\u06CC\u0627 \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u062F\u0631 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0645\u0648\u062A\u0648\u0631\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (\u0642\u0627\u0628\u0644\u06CC\u062A\u200C\u0647\u0627\u06CC \u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC\u060C \u062F\u0633\u062A\u06CC\u0627\u0631\u0647\u0627\u06CC \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648) \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0645\u0647\u0645 \u0627\u0633\u062A\u061F", tr: "Yapay zek\xE2 yan\u0131t motorlar\u0131nda (yapay zek\xE2 arama \xF6zellikleri, sohbet asistanlar\u0131) bulunmak bu marka i\xE7in \xF6nemli mi?" },
    why_it_matters: "GEO work is only worth it where people ask assistants about this category.",
    decision_informed: "Whether the plan includes an AI-discovery section.",
    choices: ["yes", "no", "unsure"],
    multi: false,
    depends_on: [],
    skip: always,
    evidence_needed: null,
    priority: 17
  },
  {
    id: "seo.geo.crawler_policy",
    stage: "discovery",
    prompt: { en: "What should AI crawlers be allowed to do with the site: search and training, search only, nothing, or undecided?", fa: "\u062E\u0632\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0627\u062C\u0627\u0632\u0647\u0654 \u0686\u0647 \u06A9\u0627\u0631\u06CC \u0628\u0627 \u0633\u0627\u06CC\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u0646\u062F: \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0648 \u0622\u0645\u0648\u0632\u0634\u060C \u0641\u0642\u0637 \u062C\u0633\u062A\u200C\u0648\u062C\u0648\u060C \u0647\u06CC\u0686\u060C \u06CC\u0627 \u0647\u0646\u0648\u0632 \u062A\u0635\u0645\u06CC\u0645 \u0646\u06AF\u0631\u0641\u062A\u0647\u200C\u0627\u06CC\u062F\u061F", tr: "Yapay zek\xE2 taray\u0131c\u0131lar\u0131 siteyle ne yapabilsin: arama ve e\u011Fitim, yaln\u0131zca arama, hi\xE7bir \u015Fey ya da karar verilmedi?" },
    why_it_matters: "Search visibility and model training are separate permissions; the owner decides, not the strategist.",
    decision_informed: "Crawler access policy.",
    choices: ["allow_search_and_training", "allow_search_block_training", "block_all", "undecided"],
    multi: false,
    depends_on: ["seo.presence.web", "seo.geo.interest"],
    skip: (a) => needsWeb(a) ?? (single(a["seo.geo.interest"]) === "no" ? "AI discovery is out of scope." : null),
    evidence_needed: null,
    priority: 18
  }
];
var QUESTION_IDS = SEO_QUESTIONS.map((question) => question.id);
function questionById(id) {
  return SEO_QUESTIONS.find((question) => question.id === id);
}
var LOCALE2 = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/;
var NAME = /^[\p{L}\p{N}][\p{L}\p{N} .&'’-]{0,79}$/u;
var SeoError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "SeoError";
  }
  code;
};
function validateAnswer(id, value) {
  const question = questionById(id);
  if (!question) throw new SeoError("not_found", `No SEO question ${String(id).slice(0, 80)}.`);
  if (value === UNKNOWN || Array.isArray(value) && value.length === 1 && value[0] === UNKNOWN) return UNKNOWN;
  if (question.multi) {
    const items = (Array.isArray(value) ? value : String(value ?? "").split(",")).map((item) => String(item).trim()).filter(Boolean);
    if (items.length === 0 || items.length > 10) throw new SeoError("invalid_input", `${id} takes 1 to 10 items.`);
    const pattern = id === "seo.market.locales" ? LOCALE2 : NAME;
    for (const item of items) if (!pattern.test(item)) throw new SeoError("invalid_input", `"${item.slice(0, 80)}" is not a valid item for ${id}.`);
    return [...new Set(items)];
  }
  if (typeof value !== "string" || !question.choices?.includes(value)) throw new SeoError("invalid_input", `${id} must be one of ${[...question.choices ?? [], UNKNOWN].join(", ")}.`);
  return value;
}
var INTERVIEW_NOTICE = 'One question at a time. "unknown" is a real answer and is never filled in. Budget is not asked: spend is restricted owner input and an organic search plan does not need it.';
function interviewState(answers) {
  const pending = [];
  const answered = [];
  const unknown = [];
  const skipped = [];
  for (const question of [...SEO_QUESTIONS].sort((a, b) => a.priority - b.priority)) {
    const reason = question.skip(answers);
    if (reason) {
      skipped.push({ id: question.id, reason });
      continue;
    }
    const value = answers[question.id];
    if (value === void 0) pending.push(question);
    else {
      answered.push(question.id);
      if (value === UNKNOWN) unknown.push(question.id);
    }
  }
  const first = pending[0];
  return {
    next: first ? { id: first.id, stage: first.stage, prompt: first.prompt, why_asked: first.why_it_matters, decision_informed: first.decision_informed, choices: first.choices, multi: first.multi } : null,
    pending: pending.map((question) => question.id),
    answered,
    unknown,
    skipped,
    complete: pending.length === 0 && !skipped.some((item) => item.reason.startsWith("Waiting")),
    notice: INTERVIEW_NOTICE
  };
}

// packages/brand-core/src/seo/answers.ts
import path2 from "node:path";
var SEO_DIR = "brand/.private/strategy/seo";
var INTERVIEW_FILE = `${SEO_DIR}/interview.json`;
function file(ws) {
  return path2.join(ws.root, ...INTERVIEW_FILE.split("/"));
}
function readInterview(ws) {
  assertOwnerProcess2();
  const target = file(ws);
  const empty = { schema_version: 1, kind: "seo_interview", brand_slug: ws.brandSlug, answers: {}, updated_at: ws.now().toISOString() };
  if (!dirUsable(ws, path2.dirname(target))) return empty;
  let raw;
  try {
    raw = safeRead(target, 1024 * 1024);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new SeoError("refused", error.message);
    throw error;
  }
  if (!raw) return empty;
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new SeoError("invalid_record", "interview.json is not valid JSON.");
  }
  if (doc?.kind !== "seo_interview" || typeof doc.answers !== "object") throw new SeoError("invalid_record", "interview.json is not an SEO interview record.");
  if (doc.brand_slug !== ws.brandSlug) throw new SeoError("wrong_brand", "interview.json belongs to another brand. It is not read.");
  return doc;
}
function answersOf(record) {
  const out = {};
  for (const [id, entry] of Object.entries(record.answers)) {
    try {
      out[id] = validateAnswer(id, entry.value);
    } catch {
    }
  }
  return out;
}
function recordAnswer(ws, input) {
  assertOwnerProcess2();
  const value = validateAnswer(input.question_id, input.value);
  let note = null;
  if (input.words !== void 0 && input.words.trim()) {
    try {
      const captured = captureNote(ws, {
        title: `SEO interview: ${input.question_id}`,
        body: input.words,
        kind: "meeting",
        language: input.language ?? null,
        tags: ["seo-interview"],
        source: { kind: "owner_note", ref: `seo-interview:${input.question_id}` }
      });
      note = { id: captured.id, revision: captured.revision };
    } catch (error) {
      if (error instanceof KnowledgeError) throw new SeoError(error.code === "refused" ? "refused" : "invalid_input", error.message);
      throw error;
    }
  }
  return withLock(ws, "seo-interview", () => {
    const record = readInterview(ws);
    const now = ws.now().toISOString();
    const previous = record.answers[input.question_id];
    const entry = {
      value,
      note,
      answered_at: now,
      history: previous ? [...previous.history, { value: previous.value, note: previous.note, answered_at: previous.answered_at }].slice(-20) : []
    };
    record.answers[input.question_id] = entry;
    record.updated_at = now;
    ensureDir(ws, path2.dirname(file(ws)));
    writeVaultFile(ws, file(ws), `${JSON.stringify(record, null, 2)}
`, true);
    return { entry, changed_from: previous ? previous.value : null };
  });
}

// packages/brand-core/src/competitive/seo-bridge.ts
function seoNamedCompetitors(ws) {
  const value = answersOf(readInterview(ws))["seo.competitors.named"];
  if (!value || value === UNKNOWN) return [];
  return Array.isArray(value) ? value : [value];
}
function importSeoNames(ws, opts = {}) {
  assertOwnerProcess3();
  const names = seoNamedCompetitors(ws);
  if (!names.length) return { results: [], interview: "not_answered" };
  const results = [];
  const seen = /* @__PURE__ */ new Map();
  for (const record of scanCandidates(ws).records) if (!seen.has(record.name_key)) seen.set(record.name_key, record.competitor_id);
  for (const name of names) {
    const key = nameKey(name);
    if (seen.has(key)) {
      results.push({ name, outcome: "exists", competitor_id: seen.get(key) ?? null, reason: null });
      continue;
    }
    if (opts.dryRun) {
      seen.set(key, null);
      results.push({ name, outcome: "would_add", competitor_id: null, reason: null });
      continue;
    }
    try {
      const record = addCandidate(ws, { display_name: name, source: "seo_interview" });
      seen.set(key, record.competitor_id);
      results.push({ name, outcome: "added", competitor_id: record.competitor_id, reason: null });
    } catch (error) {
      if (!(error instanceof CompetitiveError)) throw error;
      results.push({ name, outcome: "refused", competitor_id: null, reason: `${error.code}: ${error.message}` });
    }
  }
  return { results, interview: "read" };
}

// packages/brand-core/src/competitive/memos.ts
import fs2 from "node:fs";
import path3 from "node:path";

// packages/brand-core/src/competitive/memo-i18n.ts
var MEMO_TITLES = {
  marketing_opportunity_memo: { en: "Marketing opportunity assessment (draft)", fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0641\u0631\u0635\u062A\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633)", tr: "Pazarlama f\u0131rsat\u0131 de\u011Ferlendirmesi (taslak)" },
  pricing_benchmark_memo: { en: "Pricing benchmark and options (draft)", fa: "\u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0642\u06CC\u0645\u062A \u0648 \u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633)", tr: "Fiyat kar\u015F\u0131la\u015Ft\u0131rmas\u0131 ve se\xE7enekler (taslak)" },
  seo_competitor_supplement: { en: "SEO competitor supplement, cited (draft)", fa: "\u067E\u06CC\u0648\u0633\u062A \u0631\u0642\u0628\u0627 \u0628\u0631\u0627\u06CC \u0633\u0626\u0648\u060C \u0628\u0627 \u0627\u0633\u062A\u0646\u0627\u062F (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633)", tr: "SEO rakip eki, kaynakl\u0131 (taslak)" },
  visual_landscape_assessment: { en: "Visual landscape assessment (draft)", fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0628\u0635\u0631\u06CC (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633)", tr: "G\xF6rsel g\xF6r\xFCn\xFCm de\u011Ferlendirmesi (taslak)" }
};
var MEMO_HEADINGS = {
  preamble: {
    en: "Draft for the owner. It changes no brand fact, price, plan or asset and authorizes nothing. Context: {state}.",
    fa: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9. \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u0628\u0631\u0646\u062F\u060C \u0642\u06CC\u0645\u062A\u060C \u0628\u0631\u0646\u0627\u0645\u0647 \u06CC\u0627 \u062F\u0627\u0631\u0627\u06CC\u06CC \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F \u0648 \u0645\u062C\u0648\u0632 \u0647\u06CC\u0686 \u06A9\u0627\u0631\u06CC \u0646\u06CC\u0633\u062A. \u0648\u0636\u0639\u06CC\u062A \u0632\u0645\u06CC\u0646\u0647: {state}.",
    tr: "Sahibi i\xE7in taslak. Hi\xE7bir marka bilgisini, fiyat\u0131, plan\u0131 veya varl\u0131\u011F\u0131 de\u011Fi\u015Ftirmez ve hi\xE7bir \u015Feye yetki vermez. Ba\u011Flam: {state}."
  },
  owner_inputs: { en: "Owner decisions this draft is read against (cited by id and revision):", fa: "\u062A\u0635\u0645\u06CC\u0645\u200C\u0647\u0627\u06CC \u0645\u0627\u0644\u06A9 \u06A9\u0647 \u0627\u06CC\u0646 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0628\u0627 \u0622\u0646\u200C\u0647\u0627 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F (\u0628\u0627 \u0634\u0646\u0627\u0633\u0647 \u0648 \u0646\u0633\u062E\u0647):", tr: "Bu tasla\u011F\u0131n dayand\u0131\u011F\u0131 sahip kararlar\u0131 (kimlik ve s\xFCr\xFCmle):" },
  observations: { en: "Cited observations:", fa: "\u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0647\u0627\u06CC \u0645\u0633\u062A\u0646\u062F:", tr: "Kaynakl\u0131 g\xF6zlemler:" },
  unresolved: { en: "Unresolved (conflicting, stale or changed; not used as current):", fa: "\u062D\u0644\u200C\u0646\u0634\u062F\u0647 (\u0645\u062A\u0646\u0627\u0642\u0636\u060C \u0642\u062F\u06CC\u0645\u06CC \u06CC\u0627 \u062A\u063A\u06CC\u06CC\u0631\u06A9\u0631\u062F\u0647\u061B \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u062F\u0627\u062F\u0647\u0654 \u0641\u0639\u0644\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F):", tr: "\xC7\xF6z\xFClmemi\u015F (\xE7eli\u015Fkili, eski veya de\u011Fi\u015Fmi\u015F; g\xFCncel say\u0131lmaz):" },
  alternatives: { en: "Alternatives (hypotheses for the owner to weigh):", fa: "\u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627 (\u0641\u0631\u0636\u06CC\u0647\u200C\u0647\u0627\u06CC\u06CC \u0628\u0631\u0627\u06CC \u0633\u0646\u062C\u0634 \u0645\u0627\u0644\u06A9):", tr: "Se\xE7enekler (sahibinin tartaca\u011F\u0131 hipotezler):" },
  price_table: { en: "Public prices (as advertised; listed, not ranked; no currency conversion): {state}{reason}", fa: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0639\u0645\u0648\u0645\u06CC (\u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0627\u0639\u0644\u0627\u0645 \u0634\u062F\u0647\u061B \u0641\u0647\u0631\u0633\u062A\u200C\u0634\u062F\u0647\u060C \u0628\u062F\u0648\u0646 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC\u061B \u0628\u062F\u0648\u0646 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632): {state}{reason}", tr: "A\xE7\u0131k fiyatlar (ilan edildi\u011Fi gibi; listelenir, s\u0131ralanmaz; d\xF6viz \xE7evirisi yok): {state}{reason}" },
  warnings: { en: "Warnings:", fa: "\u0647\u0634\u062F\u0627\u0631\u0647\u0627:", tr: "Uyar\u0131lar:" },
  owner_named: { en: "Names from the SEO interview (owner assumptions, not search evidence):", fa: "\u0646\u0627\u0645\u200C\u0647\u0627 \u0627\u0632 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u0633\u0626\u0648 (\u0641\u0631\u0636\u200C\u0647\u0627\u06CC \u0645\u0627\u0644\u06A9\u060C \u0646\u0647 \u0634\u0648\u0627\u0647\u062F \u062C\u0633\u062A\u200C\u0648\u062C\u0648):", tr: "SEO g\xF6r\xFC\u015Fmesinden adlar (sahibin varsay\u0131mlar\u0131, arama kan\u0131t\u0131 de\u011Fil):" },
  search_evidence: { en: "Search evidence: rankings {rankings}; keyword gaps {gaps}.", fa: "\u0634\u0648\u0627\u0647\u062F \u062C\u0633\u062A\u200C\u0648\u062C\u0648: \u0631\u062A\u0628\u0647\u200C\u0647\u0627 {rankings}\u061B \u0634\u06A9\u0627\u0641\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u0648\u0627\u0698\u0647 {gaps}.", tr: "Arama kan\u0131t\u0131: s\u0131ralamalar {rankings}; anahtar kelime bo\u015Fluklar\u0131 {gaps}." },
  visual: { en: "Visual comparison: {state}.", fa: "\u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u0635\u0631\u06CC: {state}.", tr: "G\xF6rsel kar\u015F\u0131la\u015Ft\u0131rma: {state}." },
  intake: { en: "Identity intake hint (unapproved): logo {logo}, intent {intent}.", fa: "\u0627\u0634\u0627\u0631\u0647\u0654 \u0648\u0631\u0648\u062F\u06CC \u0647\u0648\u06CC\u062A (\u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647): \u0644\u0648\u06AF\u0648 {logo}\u060C \u0642\u0635\u062F {intent}.", tr: "Kimlik giri\u015Fi ipucu (onays\u0131z): logo {logo}, niyet {intent}." },
  not_known: { en: "Not known (never inferred here):", fa: "\u0646\u0627\u0645\u0639\u0644\u0648\u0645 (\u0627\u06CC\u0646\u062C\u0627 \u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F):", tr: "Bilinmiyor (burada asla \xE7\u0131kar\u0131lmaz):" },
  proposed_edits: { en: "If the owner wants a change:", fa: "\u0627\u06AF\u0631 \u0645\u0627\u0644\u06A9 \u062A\u063A\u06CC\u06CC\u0631\u06CC \u0628\u062E\u0648\u0627\u0647\u062F:", tr: "Sahibi bir de\u011Fi\u015Fiklik isterse:" },
  next_research: { en: "Next research:", fa: "\u067E\u0698\u0648\u0647\u0634 \u0628\u0639\u062F\u06CC:", tr: "Sonraki ara\u015Ft\u0131rma:" },
  never: { en: "Never inferred:", fa: "\u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F:", tr: "Asla \xE7\u0131kar\u0131lmaz:" },
  sources: { en: "Sources (Knowledge research notes):", fa: "\u0645\u0646\u0627\u0628\u0639 (\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u062F\u0627\u0646\u0634):", tr: "Kaynaklar (Bilgi ara\u015Ft\u0131rma notlar\u0131):" },
  trade_off: { en: "trade-off", fa: "\u0628\u062F\u0647\u200C\u0628\u0633\u062A\u0627\u0646", tr: "\xF6d\xFCnle\u015Fim" },
  depends_on: { en: "depends on", fa: "\u0648\u0627\u0628\u0633\u062A\u0647 \u0628\u0647", tr: "ba\u011Fl\u0131 oldu\u011Fu" },
  approved: { en: "approved", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "onayl\u0131" },
  missing: { en: "not approved yet", fa: "\u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647", tr: "hen\xFCz onaylanmad\u0131" }
};
var NOT_KNOWN = {
  ad_spend: { en: "Competitors\u2019 ad spend and budgets.", fa: "\u0647\u0632\u06CC\u0646\u0647 \u0648 \u0628\u0648\u062F\u062C\u0647\u0654 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u0631\u0642\u0628\u0627.", tr: "Rakiplerin reklam harcamas\u0131 ve b\xFCt\xE7eleri." },
  conversion: { en: "Conversion rates, ROAS and CPA.", fa: "\u0646\u0631\u062E \u062A\u0628\u062F\u06CC\u0644\u060C ROAS \u0648 CPA.", tr: "D\xF6n\xFC\u015F\xFCm oranlar\u0131, ROAS ve CPA." },
  revenue: { en: "Revenue, market share and traffic.", fa: "\u062F\u0631\u0622\u0645\u062F\u060C \u0633\u0647\u0645 \u0628\u0627\u0632\u0627\u0631 \u0648 \u062A\u0631\u0627\u0641\u06CC\u06A9.", tr: "Gelir, pazar pay\u0131 ve trafik." },
  targeting: { en: "Who their ads actually target.", fa: "\u0627\u06CC\u0646\u06A9\u0647 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u0634\u0627\u0646 \u0648\u0627\u0642\u0639\u0627\u064B \u0686\u0647 \u06A9\u0633\u0627\u0646\u06CC \u0631\u0627 \u0647\u062F\u0641 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.", tr: "Reklamlar\u0131n\u0131n ger\xE7ekte kimi hedefledi\u011Fi." },
  effectiveness: { en: "Whether any observed message or channel actually works.", fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0622\u06CC\u0627 \u067E\u06CC\u0627\u0645 \u06CC\u0627 \u06A9\u0627\u0646\u0627\u0644 \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647 \u0648\u0627\u0642\u0639\u0627\u064B \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "G\xF6zlemlenen bir mesaj\u0131n veya kanal\u0131n ger\xE7ekten i\u015Fe yaray\u0131p yaramad\u0131\u011F\u0131." },
  price_paid: { en: "What customers actually pay (private discounts, negotiated deals).", fa: "\u0622\u0646\u0686\u0647 \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u0648\u0627\u0642\u0639\u0627\u064B \u0645\u06CC\u200C\u067E\u0631\u062F\u0627\u0632\u0646\u062F (\u062A\u062E\u0641\u06CC\u0641\u200C\u0647\u0627\u06CC \u062E\u0635\u0648\u0635\u06CC\u060C \u0642\u0631\u0627\u0631\u062F\u0627\u062F\u0647\u0627\u06CC \u0645\u0630\u0627\u06A9\u0631\u0647\u200C\u0634\u062F\u0647).", tr: "M\xFC\u015Fterilerin ger\xE7ekte ne \xF6dedi\u011Fi (\xF6zel indirimler, pazarl\u0131kl\u0131 anla\u015Fmalar)." },
  costs: { en: "Competitors\u2019 costs and margins.", fa: "\u0647\u0632\u06CC\u0646\u0647\u200C\u0647\u0627 \u0648 \u062D\u0627\u0634\u06CC\u0647\u0654 \u0633\u0648\u062F \u0631\u0642\u0628\u0627.", tr: "Rakiplerin maliyetleri ve marjlar\u0131." },
  willingness_to_pay: { en: "Our buyers\u2019 willingness to pay (needs customer evidence).", fa: "\u062A\u0645\u0627\u06CC\u0644 \u062E\u0631\u06CC\u062F\u0627\u0631\u0627\u0646 \u0645\u0627 \u0628\u0647 \u067E\u0631\u062F\u0627\u062E\u062A (\u0628\u0647 \u0634\u0648\u0627\u0647\u062F \u0645\u0634\u062A\u0631\u06CC \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F).", tr: "Al\u0131c\u0131lar\u0131m\u0131z\u0131n \xF6deme iste\u011Fi (m\xFC\u015Fteri kan\u0131t\u0131 gerekir)." },
  fx_tax: { en: "Cross-currency or tax-inclusive comparison (no dated, cited rate and method).", fa: "\u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u06CC\u0646 \u0627\u0631\u0632\u0647\u0627 \u06CC\u0627 \u0628\u0627 \u0627\u062D\u062A\u0633\u0627\u0628 \u0645\u0627\u0644\u06CC\u0627\u062A (\u0646\u0631\u062E \u0648 \u0631\u0648\u0634 \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631 \u0648 \u0645\u0633\u062A\u0646\u062F \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F).", tr: "Para birimleri aras\u0131 veya vergi dahil kar\u015F\u0131la\u015Ft\u0131rma (tarihli, kaynakl\u0131 kur ve y\xF6ntem yok)." },
  rankings: { en: "Search rankings and positions.", fa: "\u0631\u062A\u0628\u0647\u200C\u0647\u0627 \u0648 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC \u062C\u0633\u062A\u200C\u0648\u062C\u0648.", tr: "Arama s\u0131ralamalar\u0131 ve konumlar." },
  keyword_gaps: { en: "Keyword gaps and search volume.", fa: "\u0634\u06A9\u0627\u0641\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u0648\u0627\u0698\u0647 \u0648 \u062D\u062C\u0645 \u062C\u0633\u062A\u200C\u0648\u062C\u0648.", tr: "Anahtar kelime bo\u015Fluklar\u0131 ve arama hacmi." },
  ai_visibility: { en: "Visibility in AI answers (GEO); nothing is guaranteed.", fa: "\u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u062F\u0631 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (GEO)\u061B \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u062A\u0636\u0645\u06CC\u0646\u200C\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A.", tr: "Yapay zek\xE2 yan\u0131tlar\u0131ndaki g\xF6r\xFCn\xFCrl\xFCk (GEO); hi\xE7bir \u015Fey garanti de\u011Fildir." },
  legal_clearance: { en: "Trademark clearance and legal originality (needs qualified review).", fa: "\u062B\u0628\u062A \u0639\u0644\u0627\u0645\u062A \u062A\u062C\u0627\u0631\u06CC \u0648 \u0627\u0635\u0627\u0644\u062A \u062D\u0642\u0648\u0642\u06CC (\u0628\u0647 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0648\u0627\u062C\u062F \u0634\u0631\u0627\u06CC\u0637 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F).", tr: "Marka tescili ve hukuki \xF6zg\xFCnl\xFCk (yetkin bir incelemeye ihtiya\xE7 var)." },
  recognition: { en: "Measured recognition of the current identity (owner-reported unless a study is supplied).", fa: "\u0645\u06CC\u0632\u0627\u0646 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0633\u0646\u062C\u06CC\u062F\u0647\u200C\u0634\u062F\u0647\u0654 \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC (\u06AF\u0632\u0627\u0631\u0634 \u0645\u0627\u0644\u06A9\u060C \u0645\u06AF\u0631 \u0627\u06CC\u0646\u06A9\u0647 \u0645\u0637\u0627\u0644\u0639\u0647\u200C\u0627\u06CC \u0627\u0631\u0627\u0626\u0647 \u0634\u0648\u062F).", tr: "Mevcut kimli\u011Fin \xF6l\xE7\xFClm\xFC\u015F tan\u0131n\u0131rl\u0131\u011F\u0131 (bir \xE7al\u0131\u015Fma sunulmad\u0131k\xE7a sahibin beyan\u0131)." },
  artwork: { en: "Any competitor artwork, palette or motif not cited in a source.", fa: "\u0647\u0631 \u0627\u062B\u0631 \u0647\u0646\u0631\u06CC\u060C \u067E\u0627\u0644\u062A \u06CC\u0627 \u0646\u0642\u0634\u200C\u0645\u0627\u06CC\u0647\u0654 \u0631\u0642\u06CC\u0628 \u06A9\u0647 \u062F\u0631 \u0645\u0646\u0628\u0639\u06CC \u0645\u0633\u062A\u0646\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.", tr: "Bir kaynakta al\u0131nt\u0131lanmam\u0131\u015F rakip g\xF6rseli, paleti veya motifi." },
  aesthetics: { en: "Which design is more beautiful; this is not graded.", fa: "\u0627\u06CC\u0646\u06A9\u0647 \u06A9\u062F\u0627\u0645 \u0637\u0631\u0627\u062D\u06CC \u0632\u06CC\u0628\u0627\u062A\u0631 \u0627\u0633\u062A\u061B \u0627\u06CC\u0646 \u0627\u0645\u062A\u06CC\u0627\u0632\u062F\u0647\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "Hangi tasar\u0131m\u0131n daha g\xFCzel oldu\u011Fu; bu puanlanmaz." }
};
var ALTERNATIVES = {
  differentiate: {
    title: { en: "Lead with a message the cited competitors do not claim", fa: "\u0628\u0627 \u067E\u06CC\u0627\u0645\u06CC \u067E\u06CC\u0634 \u0628\u0631\u0648\u06CC\u062F \u06A9\u0647 \u0631\u0642\u0628\u0627\u06CC \u0645\u0633\u062A\u0646\u062F\u0634\u062F\u0647 \u0627\u062F\u0639\u0627 \u0646\u0645\u06CC\u200C\u06A9\u0646\u0646\u062F", tr: "Kaynakl\u0131 rakiplerin iddia etmedi\u011Fi bir mesajla \xF6ne \xE7\u0131k\u0131n" },
    trade_off: { en: "Distinct, but the message is untested and needs proof; it may address a smaller need.", fa: "\u0645\u062A\u0645\u0627\u06CC\u0632 \u0627\u0633\u062A\u060C \u0627\u0645\u0627 \u067E\u06CC\u0627\u0645 \u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F\u0647 \u0648 \u0628\u0647 \u0627\u062B\u0628\u0627\u062A \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F\u061B \u0634\u0627\u06CC\u062F \u0646\u06CC\u0627\u0632 \u06A9\u0648\u0686\u06A9\u200C\u062A\u0631\u06CC \u0631\u0627 \u067E\u0648\u0634\u0634 \u062F\u0647\u062F.", tr: "Farkl\u0131d\u0131r ama mesaj denenmemi\u015Ftir ve kan\u0131t ister; daha k\xFC\xE7\xFCk bir ihtiyaca hitap edebilir." }
  },
  match_with_proof: {
    title: { en: "Answer the buyer question the cited competitors answer, with proof", fa: "\u0628\u0647 \u0647\u0645\u0627\u0646 \u067E\u0631\u0633\u0634 \u062E\u0631\u06CC\u062F\u0627\u0631 \u06A9\u0647 \u0631\u0642\u0628\u0627\u06CC \u0645\u0633\u062A\u0646\u062F\u0634\u062F\u0647 \u067E\u0627\u0633\u062E \u0645\u06CC\u200C\u062F\u0647\u0646\u062F\u060C \u0628\u0627 \u0627\u062B\u0628\u0627\u062A \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F", tr: "Kaynakl\u0131 rakiplerin yan\u0131tlad\u0131\u011F\u0131 al\u0131c\u0131 sorusunu kan\u0131tla yan\u0131tlay\u0131n" },
    trade_off: { en: "Meets an expectation buyers already have, but competes head-on where competitors are established.", fa: "\u0627\u0646\u062A\u0638\u0627\u0631\u06CC \u0631\u0627 \u06A9\u0647 \u062E\u0631\u06CC\u062F\u0627\u0631\u0627\u0646 \u0627\u0632 \u0642\u0628\u0644 \u062F\u0627\u0631\u0646\u062F \u0628\u0631\u0622\u0648\u0631\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u0645\u0627 \u062F\u0631 \u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0631\u0642\u0628\u0627 \u062C\u0627\u0627\u0641\u062A\u0627\u062F\u0647\u200C\u0627\u0646\u062F \u0631\u0648\u062F\u0631\u0631\u0648 \u0631\u0642\u0627\u0628\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Al\u0131c\u0131lar\u0131n zaten sahip oldu\u011Fu bir beklentiyi kar\u015F\u0131lar ama rakiplerin yerle\u015Fik oldu\u011Fu yerde do\u011Frudan rekabet eder." }
  },
  channel_test: {
    title: { en: "Test a channel where no competitor use was observed", fa: "\u06A9\u0627\u0646\u0627\u0644\u06CC \u0631\u0627 \u0628\u06CC\u0627\u0632\u0645\u0627\u06CC\u06CC\u062F \u06A9\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0631\u0642\u0628\u0627 \u062F\u0631 \u0622\u0646 \u0645\u0634\u0627\u0647\u062F\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A", tr: "Rakip kullan\u0131m\u0131 g\xF6zlemlenmeyen bir kanal\u0131 deneyin" },
    trade_off: { en: "Less crowded, but not observing a competitor there is not proof of an opportunity.", fa: "\u0634\u0644\u0648\u063A\u06CC \u06A9\u0645\u062A\u0631\u06CC \u062F\u0627\u0631\u062F\u060C \u0627\u0645\u0627 \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0646\u06A9\u0631\u062F\u0646 \u0631\u0642\u06CC\u0628 \u062F\u0631 \u0622\u0646\u062C\u0627 \u062F\u0644\u06CC\u0644 \u0648\u062C\u0648\u062F \u0641\u0631\u0635\u062A \u0646\u06CC\u0633\u062A.", tr: "Daha az kalabal\u0131kt\u0131r ama orada rakip g\xF6zlemlememek bir f\u0131rsat\u0131n kan\u0131t\u0131 de\u011Fildir." }
  },
  gather_evidence: {
    title: { en: "Hold changes and close the listed research gaps first", fa: "\u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0631\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F \u0648 \u0627\u0628\u062A\u062F\u0627 \u0634\u06A9\u0627\u0641\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0641\u0647\u0631\u0633\u062A\u200C\u0634\u062F\u0647 \u0631\u0627 \u0628\u0628\u0646\u062F\u06CC\u062F", tr: "De\u011Fi\u015Fiklikleri bekletin ve \xF6nce listelenen ara\u015Ft\u0131rma eksiklerini kapat\u0131n" },
    trade_off: { en: "Slower, but avoids building on unknowns.", fa: "\u06A9\u0646\u062F\u062A\u0631 \u0627\u0633\u062A\u060C \u0627\u0645\u0627 \u0627\u0632 \u0628\u0646\u0627 \u06A9\u0631\u062F\u0646 \u0631\u0648\u06CC \u0646\u0627\u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0647\u0627 \u062C\u0644\u0648\u06AF\u06CC\u0631\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Daha yava\u015Ft\u0131r ama bilinmeyenler \xFCzerine kurmaktan ka\xE7\u0131n\u0131r." }
  },
  value_based: {
    title: { en: "Value-based pricing", fa: "\u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u0628\u0631 \u067E\u0627\u06CC\u0647\u0654 \u0627\u0631\u0632\u0634", tr: "De\u011Fere dayal\u0131 fiyatland\u0131rma" },
    trade_off: { en: "Ties price to the value buyers get, but needs evidence of that value and of willingness to pay.", fa: "\u0642\u06CC\u0645\u062A \u0631\u0627 \u0628\u0647 \u0627\u0631\u0632\u0634\u06CC \u06A9\u0647 \u062E\u0631\u06CC\u062F\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F \u067E\u06CC\u0648\u0646\u062F \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0627\u0645\u0627 \u0628\u0647 \u0634\u0648\u0627\u0647\u062F \u0622\u0646 \u0627\u0631\u0632\u0634 \u0648 \u062A\u0645\u0627\u06CC\u0644 \u0628\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.", tr: "Fiyat\u0131 al\u0131c\u0131n\u0131n elde etti\u011Fi de\u011Fere ba\u011Flar ama bu de\u011Ferin ve \xF6deme iste\u011Finin kan\u0131t\u0131n\u0131 ister." }
  },
  tiered: {
    title: { en: "Tiered plans", fa: "\u0637\u0631\u062D\u200C\u0647\u0627\u06CC \u0686\u0646\u062F\u0633\u0637\u062D\u06CC", tr: "Kademeli planlar" },
    trade_off: { en: "Serves different segments, but adds complexity and needs clear feature boundaries.", fa: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641 \u0631\u0627 \u067E\u0648\u0634\u0634 \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0627\u0645\u0627 \u067E\u06CC\u0686\u06CC\u062F\u06AF\u06CC \u0645\u06CC\u200C\u0627\u0641\u0632\u0627\u06CC\u062F \u0648 \u0628\u0647 \u0645\u0631\u0632 \u0631\u0648\u0634\u0646 \u0648\u06CC\u0698\u06AF\u06CC\u200C\u0647\u0627 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.", tr: "Farkl\u0131 segmentlere hizmet eder ama karma\u015F\u0131kl\u0131k ekler ve net \xF6zellik s\u0131n\u0131rlar\u0131 ister." }
  },
  premium: {
    title: { en: "Premium position", fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 \u0645\u0645\u062A\u0627\u0632", tr: "Premium konum" },
    trade_off: { en: "Signals quality and protects margin, but needs proof buyers accept it and shrinks the reachable market.", fa: "\u0646\u0634\u0627\u0646\u0647\u0654 \u06A9\u06CC\u0641\u06CC\u062A \u0627\u0633\u062A \u0648 \u062D\u0627\u0634\u06CC\u0647\u0654 \u0633\u0648\u062F \u0631\u0627 \u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u0645\u0627 \u0628\u0647 \u0627\u062B\u0628\u0627\u062A \u067E\u0630\u06CC\u0631\u0634 \u062E\u0631\u06CC\u062F\u0627\u0631\u0627\u0646 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F \u0648 \u0628\u0627\u0632\u0627\u0631 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0631\u0627 \u06A9\u0648\u0686\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Kalite i\u015Fareti verir ve marj\u0131 korur ama al\u0131c\u0131lar\u0131n kabul etti\u011Fine dair kan\u0131t ister ve eri\u015Filebilir pazar\u0131 daralt\u0131r." }
  },
  entry_level: {
    title: { en: "Entry-level offer", fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0633\u0637\u062D \u0648\u0631\u0648\u062F\u06CC", tr: "Giri\u015F seviyesi teklif" },
    trade_off: { en: "Lowers the barrier to try, but depends on costs and an upgrade path; a low price is hard to raise later.", fa: "\u0645\u0627\u0646\u0639 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0631\u062F\u0646 \u0631\u0627 \u06A9\u0645 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u0645\u0627 \u0628\u0647 \u0647\u0632\u06CC\u0646\u0647\u200C\u0647\u0627 \u0648 \u0645\u0633\u06CC\u0631 \u0627\u0631\u062A\u0642\u0627 \u0648\u0627\u0628\u0633\u062A\u0647 \u0627\u0633\u062A\u061B \u0642\u06CC\u0645\u062A \u067E\u0627\u06CC\u06CC\u0646 \u0631\u0627 \u0628\u0639\u062F\u0627\u064B \u0633\u062E\u062A \u0645\u06CC\u200C\u0634\u0648\u062F \u0628\u0627\u0644\u0627 \u0628\u0631\u062F.", tr: "Denemenin \xF6n\xFCndeki engeli d\xFC\u015F\xFCr\xFCr ama maliyetlere ve bir y\xFCkseltme yoluna ba\u011Fl\u0131d\u0131r; d\xFC\u015F\xFCk bir fiyat\u0131 sonra y\xFCkseltmek zordur." }
  },
  retain_improve_guidelines: {
    title: { en: "Retain the current identity and improve its usage guidelines", fa: "\u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u0631\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F \u0648 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0622\u0646 \u0631\u0627 \u0628\u0647\u062A\u0631 \u06A9\u0646\u06CC\u062F", tr: "Mevcut kimli\u011Fi koruyun ve kullan\u0131m k\u0131lavuzunu iyile\u015Ftirin" },
    trade_off: { en: "Keeps whatever recognition exists at low cost; right when the audit finds no confusing similarity and the identity serves its uses.", fa: "\u0647\u0631 \u0645\u06CC\u0632\u0627\u0646 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646\u06CC \u0631\u0627 \u06A9\u0647 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F \u0628\u0627 \u0647\u0632\u06CC\u0646\u0647\u0654 \u06A9\u0645 \u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0648\u0642\u062A\u06CC \u062F\u0631\u0633\u062A \u0627\u0633\u062A \u06A9\u0647 \u0645\u0645\u06CC\u0632\u06CC \u0634\u0628\u0627\u0647\u062A \u06AF\u0645\u0631\u0627\u0647\u200C\u06A9\u0646\u0646\u062F\u0647\u200C\u0627\u06CC \u0646\u06CC\u0627\u0628\u062F \u0648 \u0647\u0648\u06CC\u062A \u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627\u06CC\u0634 \u0631\u0627 \u067E\u0648\u0634\u0634 \u062F\u0647\u062F.", tr: "Var olan tan\u0131n\u0131rl\u0131\u011F\u0131 d\xFC\u015F\xFCk maliyetle korur; denetim kafa kar\u0131\u015Ft\u0131r\u0131c\u0131 bir benzerlik bulmad\u0131\u011F\u0131nda ve kimlik kullan\u0131mlar\u0131na hizmet etti\u011Finde do\u011Frudur." }
  },
  evolve: {
    title: { en: "Evolve: refine the identity and keep its recognizable cues", fa: "\u062A\u06A9\u0627\u0645\u0644: \u0647\u0648\u06CC\u062A \u0631\u0627 \u067E\u0627\u0644\u0627\u06CC\u0634 \u06A9\u0646\u06CC\u062F \u0648 \u0646\u0634\u0627\u0646\u0647\u200C\u0647\u0627\u06CC \u0622\u0634\u0646\u0627\u06CC \u0622\u0646 \u0631\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F", tr: "Evrim: kimli\u011Fi inceltin ve tan\u0131nan ipu\xE7lar\u0131n\u0131 koruyun" },
    trade_off: { en: "Fixes specific problems with less recognition risk; needs a clear list of what to preserve.", fa: "\u0645\u0634\u06A9\u0644\u0627\u062A \u0645\u0634\u062E\u0635 \u0631\u0627 \u0628\u0627 \u0631\u06CC\u0633\u06A9 \u06A9\u0645\u062A\u0631 \u0628\u0631\u0627\u06CC \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0631\u0641\u0639 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0628\u0647 \u0641\u0647\u0631\u0633\u062A \u0631\u0648\u0634\u0646\u06CC \u0627\u0632 \u0622\u0646\u0686\u0647 \u0628\u0627\u06CC\u062F \u062D\u0641\u0638 \u0634\u0648\u062F \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.", tr: "Belirli sorunlar\u0131 daha az tan\u0131n\u0131rl\u0131k riskiyle \xE7\xF6zer; neyin korunaca\u011F\u0131na dair net bir liste ister." }
  },
  rebrand: {
    title: { en: "Broad rebrand", fa: "\u0628\u0627\u0632\u0628\u0631\u0646\u062F\u0633\u0627\u0632\u06CC \u06AF\u0633\u062A\u0631\u062F\u0647", tr: "Kapsaml\u0131 yeniden markalama" },
    trade_off: { en: "Only with a stated reason (new market, repositioning, a failing identity, a legal issue); highest cost and recognition risk.", fa: "\u0641\u0642\u0637 \u0628\u0627 \u062F\u0644\u06CC\u0644\u06CC \u0631\u0648\u0634\u0646 (\u0628\u0627\u0632\u0627\u0631 \u062C\u062F\u06CC\u062F\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u062F\u0648\u0628\u0627\u0631\u0647\u060C \u0647\u0648\u06CC\u062A \u0646\u0627\u06A9\u0627\u0631\u0622\u0645\u062F\u060C \u0645\u0634\u06A9\u0644 \u062D\u0642\u0648\u0642\u06CC)\u061B \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0647\u0632\u06CC\u0646\u0647 \u0648 \u0631\u06CC\u0633\u06A9 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646.", tr: "Yaln\u0131zca belirtilmi\u015F bir nedenle (yeni pazar, yeniden konumland\u0131rma, i\u015Flemeyen kimlik, hukuki sorun); en y\xFCksek maliyet ve tan\u0131n\u0131rl\u0131k riski." }
  },
  create: {
    title: { en: "Create a first identity", fa: "\u0633\u0627\u062E\u062A \u0646\u062E\u0633\u062A\u06CC\u0646 \u0647\u0648\u06CC\u062A", tr: "\u0130lk kimli\u011Fi olu\u015Fturun" },
    trade_off: { en: "No existing recognition to lose; competitor conventions show what to avoid copying, not what to copy.", fa: "\u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646\u06CC \u0628\u0631\u0627\u06CC \u0627\u0632 \u062F\u0633\u062A \u062F\u0627\u062F\u0646 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F\u061B \u0642\u0631\u0627\u0631\u062F\u0627\u062F\u0647\u0627\u06CC \u0631\u0642\u0628\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F \u0627\u0632 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0646\u0628\u0627\u06CC\u062F \u062A\u0642\u0644\u06CC\u062F \u06A9\u0631\u062F\u060C \u0646\u0647 \u0627\u0632 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0628\u0627\u06CC\u062F \u062A\u0642\u0644\u06CC\u062F \u06A9\u0631\u062F.", tr: "Kaybedilecek bir tan\u0131n\u0131rl\u0131k yoktur; rakip al\u0131\u015Fkanl\u0131klar\u0131 neyin kopyalanaca\u011F\u0131n\u0131 de\u011Fil, neyin kopyalanmamas\u0131 gerekti\u011Fini g\xF6sterir." }
  }
};
var DEPENDENCIES = {
  costs: { en: "our costs", fa: "\u0647\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u0645\u0627", tr: "maliyetlerimiz" },
  willingness_to_pay: { en: "willingness to pay", fa: "\u062A\u0645\u0627\u06CC\u0644 \u0628\u0647 \u067E\u0631\u062F\u0627\u062E\u062A", tr: "\xF6deme iste\u011Fi" },
  customer_evidence: { en: "customer evidence", fa: "\u0634\u0648\u0627\u0647\u062F \u0645\u0634\u062A\u0631\u06CC", tr: "m\xFC\u015Fteri kan\u0131t\u0131" },
  business_model: { en: "business model", fa: "\u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631", tr: "i\u015F modeli" }
};
var WARNINGS = {
  no_current_price: {
    en: "No current competitor price is recorded for this scope. Nothing here is a priced recommendation.",
    fa: "\u0647\u06CC\u0686 \u0642\u06CC\u0645\u062A \u0641\u0639\u0644\u06CC \u0627\u0632 \u0631\u0642\u0628\u0627 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u062F\u0627\u0645\u0646\u0647 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0647\u06CC\u0686\u200C\u0686\u06CC\u0632 \u0627\u06CC\u0646\u062C\u0627 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0642\u06CC\u0645\u062A \u0646\u06CC\u0633\u062A.",
    tr: "Bu kapsam i\xE7in g\xFCncel bir rakip fiyat\u0131 kaydedilmedi. Buradaki hi\xE7bir \u015Fey fiyatl\u0131 bir \xF6neri de\u011Fildir."
  },
  historical_price: {
    en: "{name} {offer} was observed {date} and is historical. Refresh it before treating it as a current market price.",
    fa: "{name} {offer} \u062F\u0631 {date} \u0645\u0634\u0627\u0647\u062F\u0647 \u0634\u062F\u0647 \u0648 \u0642\u062F\u06CC\u0645\u06CC \u0627\u0633\u062A. \u067E\u06CC\u0634 \u0627\u0632 \u0627\u06CC\u0646\u06A9\u0647 \u0622\u0646 \u0631\u0627 \u0642\u06CC\u0645\u062A \u0641\u0639\u0644\u06CC \u0628\u0627\u0632\u0627\u0631 \u0628\u062F\u0627\u0646\u06CC\u062F\u060C \u062A\u0627\u0632\u0647\u200C\u0627\u0634 \u06A9\u0646\u06CC\u062F.",
    tr: "{name} {offer} {date} tarihinde g\xF6zlemlendi ve ge\xE7mi\u015F kay\u0131tt\u0131r. G\xFCncel piyasa fiyat\u0131 saymadan \xF6nce yenileyin."
  },
  promotional_price: {
    en: "{name} {offer} is a promotional price, not a standard rate.",
    fa: "{name} {offer} \u0642\u06CC\u0645\u062A \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u06CC \u0627\u0633\u062A\u060C \u0646\u0647 \u0646\u0631\u062E \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F.",
    tr: "{name} {offer} bir kampanya fiyat\u0131d\u0131r, standart \xFCcret de\u011Fildir."
  },
  promotion_unknown: {
    en: "{name} {offer}: whether this is a promotion is unknown; do not read it as a standard rate.",
    fa: "{name} {offer}: \u0645\u0639\u0644\u0648\u0645 \u0646\u06CC\u0633\u062A \u0627\u06CC\u0646 \u0642\u06CC\u0645\u062A \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u06CC \u0627\u0633\u062A \u06CC\u0627 \u0646\u0647\u061B \u0622\u0646 \u0631\u0627 \u0646\u0631\u062E \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0646\u062F\u0627\u0646\u06CC\u062F.",
    tr: "{name} {offer}: bunun bir kampanya olup olmad\u0131\u011F\u0131 bilinmiyor; standart \xFCcret olarak okumay\u0131n."
  },
  monthly_rate_billed_annually: {
    en: "{name} {offer} is a monthly rate billed annually, not a month-to-month price.",
    fa: "{name} {offer} \u0646\u0631\u062E \u0645\u0627\u0647\u0627\u0646\u0647\u200C\u0627\u06CC \u0627\u0633\u062A \u06A9\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0646\u0647 \u0642\u06CC\u0645\u062A \u0645\u0627\u0647\u200C\u0628\u0647\u200C\u0645\u0627\u0647.",
    tr: "{name} {offer} y\u0131ll\u0131k faturalanan ayl\u0131k bir \xFCcrettir, aydan aya fiyat de\u011Fildir."
  },
  price_needs_review: {
    en: "{name} {offer}: its source changed, was replaced or can no longer be read. It is not used until re-checked.",
    fa: "{name} {offer}: \u0645\u0646\u0628\u0639 \u0622\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647\u060C \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0634\u062F\u0647 \u06CC\u0627 \u062F\u06CC\u06AF\u0631 \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u062A\u0627 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{name} {offer}: kayna\u011F\u0131 de\u011Fi\u015Fti, yenisiyle de\u011Fi\u015Ftirildi veya art\u0131k okunam\u0131yor. Yeniden kontrol edilene kadar kullan\u0131lmaz."
  },
  price_conflicting: {
    en: "{name} {offer}: sources disagree about this price. Both are kept; neither is used as current.",
    fa: "{name} {offer}: \u0645\u0646\u0627\u0628\u0639 \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0627\u06CC\u0646 \u0642\u06CC\u0645\u062A \u0627\u062E\u062A\u0644\u0627\u0641 \u062F\u0627\u0631\u0646\u062F. \u0647\u0631 \u062F\u0648 \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u062F\u0627\u062F\u0647\u0654 \u0641\u0639\u0644\u06CC \u0634\u0645\u0631\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "{name} {offer}: kaynaklar bu fiyat konusunda \xE7eli\u015Fiyor. \u0130kisi de saklan\u0131r; hi\xE7biri g\xFCncel say\u0131lmaz."
  },
  visual_unavailable: {
    en: "No current cited visual observation exists. Visual comparison is unavailable; no palette, motif or similarity is assumed.",
    fa: "\u0647\u06CC\u0686 \u0645\u0634\u0627\u0647\u062F\u0647\u0654 \u0628\u0635\u0631\u06CC \u0645\u0633\u062A\u0646\u062F \u0648 \u0641\u0639\u0644\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F. \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u0635\u0631\u06CC \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A\u061B \u0647\u06CC\u0686 \u067E\u0627\u0644\u062A\u060C \u0646\u0642\u0634\u200C\u0645\u0627\u06CC\u0647 \u06CC\u0627 \u0634\u0628\u0627\u0647\u062A\u06CC \u0641\u0631\u0636 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "G\xFCncel, kaynakl\u0131 bir g\xF6rsel g\xF6zlem yok. G\xF6rsel kar\u015F\u0131la\u015Ft\u0131rma yap\u0131lam\u0131yor; hi\xE7bir palet, motif veya benzerlik varsay\u0131lmaz."
  },
  similarity_not_assessed: {
    en: "Similarity to competitor marks is not assessed here. A visual comparison is a risk signal, never legal clearance.",
    fa: "\u0634\u0628\u0627\u0647\u062A \u0628\u0647 \u0646\u0634\u0627\u0646\u200C\u0647\u0627\u06CC \u0631\u0642\u0628\u0627 \u0627\u06CC\u0646\u062C\u0627 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u0635\u0631\u06CC \u0641\u0642\u0637 \u0646\u0634\u0627\u0646\u0647\u0654 \u0631\u06CC\u0633\u06A9 \u0627\u0633\u062A\u060C \u0647\u0631\u06AF\u0632 \u062A\u0623\u06CC\u06CC\u062F \u062D\u0642\u0648\u0642\u06CC \u0646\u06CC\u0633\u062A.",
    tr: "Rakip i\u015Faretlerine benzerlik burada de\u011Ferlendirilmez. G\xF6rsel kar\u015F\u0131la\u015Ft\u0131rma bir risk i\u015Faretidir, asla hukuki onay de\u011Fildir."
  },
  seo_interview_unreadable: {
    en: "The SEO interview record could not be read; owner-named competitors are not shown.",
    fa: "\u0631\u06A9\u0648\u0631\u062F \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u0633\u0626\u0648 \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u061B \u0631\u0642\u0628\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0646\u0627\u0645 \u0628\u0631\u062F\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    tr: "SEO g\xF6r\xFC\u015Fme kayd\u0131 okunamad\u0131; sahibin adland\u0131rd\u0131\u011F\u0131 rakipler g\xF6sterilmiyor."
  }
};
var PROPOSE_EDIT = {
  en: "{field}: propose the change with brand:knowledge propose, then brand:review and brand:approve. This draft writes nothing.",
  fa: "{field}: \u062A\u063A\u06CC\u06CC\u0631 \u0631\u0627 \u0628\u0627 brand:knowledge propose \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u062F\u0647\u06CC\u062F\u060C \u0633\u067E\u0633 brand:review \u0648 brand:approve. \u0627\u06CC\u0646 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0686\u06CC\u0632\u06CC \u0646\u0645\u06CC\u200C\u0646\u0648\u06CC\u0633\u062F.",
  tr: "{field}: de\u011Fi\u015Fikli\u011Fi brand:knowledge propose ile \xF6nerin, ard\u0131ndan brand:review ve brand:approve. Bu taslak hi\xE7bir \u015Fey yazmaz."
};
var SEO_NAME_STATUS = {
  matched_candidate: { en: "in the competitor index as {id}", fa: "\u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u0631\u0642\u0628\u0627 \u0628\u0627 \u0634\u0646\u0627\u0633\u0647\u0654 {id}", tr: "rakip dizininde {id} olarak" },
  not_in_index: { en: "not in the competitor index (brand:competitive import-seo-names adds it as a candidate)", fa: "\u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u0631\u0642\u0628\u0627 \u0646\u06CC\u0633\u062A (brand:competitive import-seo-names \u0622\u0646 \u0631\u0627 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0646\u0627\u0645\u0632\u062F \u0627\u0636\u0627\u0641\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F)", tr: "rakip dizininde yok (brand:competitive import-seo-names onu aday olarak ekler)" }
};

// packages/brand-core/src/competitive/memos.ts
var MEMO_SCHEMA = "brand-os.competitive-memo/1";
var MEMO_PURPOSES = ["marketing", "pricing", "seo", "identity"];
var MEMO_FACTS = {
  marketing: ["business.marketing.objective", "business.marketing.channels", "business.marketing.pillars", "business.customer.primary_segment", "brand.strategy.differentiation", "business.marketing.availability_claim"],
  pricing: ["business.sales.pricing", "business.model.revenue", "business.offer.value_proposition", "business.market.geography"],
  seo: ["business.market.geography", "brand.strategy.differentiation"],
  identity: ["brand.strategy.differentiation", "business.customer.primary_segment", "brand.logo.variants", "brand.logo.masters"]
};
var EDITABLE = {
  marketing: ["business.marketing.channels", "business.marketing.pillars", "brand.strategy.differentiation"],
  pricing: ["business.sales.pricing"],
  seo: ["seo.competitors.named"],
  identity: ["brand.logo.*"]
};
var NOT_KNOWN_BY = {
  marketing: ["ad_spend", "conversion", "revenue", "targeting", "effectiveness"],
  pricing: ["price_paid", "costs", "revenue", "willingness_to_pay", "fx_tax"],
  seo: ["rankings", "keyword_gaps", "ai_visibility", "revenue"],
  identity: ["legal_clearance", "recognition", "artwork", "aesthetics"]
};
var KIND_OF = {
  marketing: "marketing_opportunity_memo",
  pricing: "pricing_benchmark_memo",
  seo: "seo_competitor_supplement",
  identity: "visual_landscape_assessment"
};
function cite(ws, ids) {
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  return ids.map((id) => {
    const fact = facts[id];
    const approved = Boolean(fact && fact.status === "approved" && fact.revision_hash);
    return { fact_id: id, state: approved ? "approved" : "missing", revision: approved ? fact.revision_hash : null };
  });
}
function alternative(id, lang, depends_on, cites) {
  const entry = ALTERNATIVES[id];
  return { id, title: entry.title[lang], trade_off: entry.trade_off[lang], status: "hypothesis", depends_on, cites };
}
function base(ws, purpose, ctx) {
  const lang = ctx.lang;
  return {
    schema: MEMO_SCHEMA,
    kind: KIND_OF[purpose],
    status: "draft",
    brand_slug: ctx.brand_slug,
    generated_at: ctx.generated_at,
    lang,
    purpose,
    market: ctx.market,
    context: { state: ctx.state, source_digest: ctx.source_digest, research_state: ctx.research.state },
    owner_inputs: cite(ws, MEMO_FACTS[purpose]),
    observations: ctx.observations.filter((o) => o.usable),
    unresolved: ctx.observations.filter((o) => !o.usable).map((o) => ({ competitor_id: o.competitor_id, competitor_name: o.competitor_name, observation_id: o.observation_id, dimension: o.dimension, cell: o.cell, ref_state: o.ref_state, ref: o.ref })),
    alternatives: [],
    warnings: [],
    not_known: NOT_KNOWN_BY[purpose].map((code) => ({ code, text: NOT_KNOWN[code][lang] })),
    proposed_edits: EDITABLE[purpose].map((field) => ({ field, text: fill2(PROPOSE_EDIT[lang], { field }) })),
    gaps: ctx.gaps,
    next_research: ctx.next_research,
    source_refs: ctx.source_refs,
    prohibited_inferences: ctx.prohibited_inferences,
    authorizes: []
  };
}
function marketingMemo(ws, ctx) {
  const memo = base(ws, "marketing", ctx);
  const lang = ctx.lang;
  const messages = memo.observations.filter((o) => o.dimension === "public_message" || o.dimension === "audience").map((o) => o.observation_id);
  const channels = memo.observations.filter((o) => o.dimension === "observable_channels").map((o) => o.observation_id);
  memo.alternatives.push(alternative("differentiate", lang, ["brand.strategy.differentiation", "business.marketing.objective"], messages));
  memo.alternatives.push(alternative("match_with_proof", lang, ["business.customer.primary_segment", "business.marketing.availability_claim"], messages));
  if (channels.length) memo.alternatives.push(alternative("channel_test", lang, ["business.marketing.channels", "business.marketing.objective"], channels));
  if (ctx.state !== "evidence_available") memo.alternatives.push(alternative("gather_evidence", lang, [], []));
  return { ...memo, kind: "marketing_opportunity_memo" };
}
function rateLabel(row) {
  if (row.promotion === "promotional") return "promotional";
  if (row.promotion === "unknown") return "promotion_unknown";
  if (row.billing_commitment === "annual" && row.billing_period === "month") return "monthly_rate_billed_annually";
  if (row.billing_period === "unknown" || row.billing_commitment === "unknown") return "terms_unknown";
  return "standard_rate";
}
function rowStatus(row) {
  if (row.cell === "historical") return "historical";
  if (row.cell === "conflicting") return "conflicting";
  if (row.cell === "needs_review") return "needs_review";
  return "current";
}
function pricingMemo(ws, ctx) {
  const memo = base(ws, "pricing", ctx);
  const lang = ctx.lang;
  const byId = new Map(ctx.observations.map((o) => [o.observation_id, o]));
  const rows = (ctx.prices?.rows ?? []).map((row) => {
    const o = byId.get(row.observation_id);
    return { ...row, competitor_name: o?.competitor_name ?? row.competitor_id, ref: o?.ref ?? "", source_class: o?.source_class ?? null, feature_scope: o?.price?.feature_scope ?? null, price_kind: "publicly_advertised", rate_label: rateLabel(row), status: rowStatus(row), business_model: "unknown" };
  });
  const warn = (code, row) => memo.warnings.push({ code, observation_id: row?.observation_id ?? null, text: fill2(WARNINGS[code][lang], row ? { name: row.competitor_name, offer: row.offer_name, date: row.observed_at.slice(0, 10) } : {}) });
  if (!rows.some((row) => row.status === "current")) warn("no_current_price", null);
  for (const row of rows) {
    if (row.status === "historical") warn("historical_price", row);
    if (row.status === "needs_review") warn("price_needs_review", row);
    if (row.status === "conflicting") warn("price_conflicting", row);
    if (row.rate_label === "promotional") warn("promotional_price", row);
    if (row.rate_label === "promotion_unknown") warn("promotion_unknown", row);
    if (row.billing_commitment === "annual" && row.billing_period === "month") warn("monthly_rate_billed_annually", row);
  }
  const current = rows.filter((row) => row.status === "current").map((row) => row.observation_id);
  const deps = ["costs", "willingness_to_pay", "customer_evidence", "business_model"].map((d) => DEPENDENCIES[d][lang]);
  for (const id of ["value_based", "tiered", "premium", "entry_level"]) memo.alternatives.push(alternative(id, lang, deps, current));
  if (ctx.state !== "evidence_available") memo.alternatives.push(alternative("gather_evidence", lang, [], []));
  return {
    ...memo,
    kind: "pricing_benchmark_memo",
    prices: { rows, comparison: ctx.prices?.comparison ?? "none", reasons: ctx.prices?.reasons ?? [], ranked: false, currency_conversion: "none", priced_recommendation: false }
  };
}
function seoMemo(ws, ctx) {
  const memo = base(ws, "seo", ctx);
  let names = [];
  let state = "read";
  try {
    names = seoNamedCompetitors(ws);
    if (!names.length) state = "not_answered";
  } catch {
    state = "unreadable";
    memo.warnings.push({ code: "seo_interview_unreadable", observation_id: null, text: WARNINGS.seo_interview_unreadable[ctx.lang] });
  }
  const index = new Map(ctx.competitors.map((c) => [nameKey(c.display_name), c.competitor_id]));
  const owner_named = names.map((name) => ({ name, status: "unverified_owner_assumption", competitor_id: index.get(nameKey(name)) ?? null }));
  return { ...memo, kind: "seo_competitor_supplement", owner_named, search_evidence: { rankings: "unverified", keyword_gaps: "unverified" }, seo_interview: state };
}
function readIntake(ws) {
  const file2 = path3.join(ws.root, "brand", "brand.config.yaml");
  try {
    return readIdentityIntake(fs2.existsSync(file2) ? readYaml(file2) : null);
  } catch {
    return readIdentityIntake(null);
  }
}
function identityMemo(ws, ctx, intake) {
  const memo = base(ws, "identity", ctx);
  const lang = ctx.lang;
  const visual = memo.observations.filter((o) => o.dimension === "visual_language").map((o) => o.observation_id);
  const available = visual.length > 0;
  if (!available) memo.warnings.push({ code: "visual_unavailable", observation_id: null, text: WARNINGS.visual_unavailable[lang] });
  memo.warnings.push({ code: "similarity_not_assessed", observation_id: null, text: WARNINGS.similarity_not_assessed[lang] });
  const presence = intake.choice.logo_presence;
  const routes = presence === "absent" ? ["create"] : presence === "unknown" ? ["create", "retain_improve_guidelines", "evolve", "rebrand"] : ["retain_improve_guidelines", "evolve", "rebrand"];
  for (const id of routes) memo.alternatives.push(alternative(id, lang, ["brand.strategy.differentiation"], visual));
  if (ctx.state !== "evidence_available") memo.alternatives.push(alternative("gather_evidence", lang, [], []));
  return {
    ...memo,
    kind: "visual_landscape_assessment",
    visual_comparison: available ? "available" : "unavailable",
    similarity: "not_assessed",
    intake: { state: intake.state, choice: intake.choice, authority: "unapproved_owner_intake" }
  };
}
function buildCompetitiveMemo(ws, purpose, opts) {
  const p = oneOf(purpose, MEMO_PURPOSES, "purpose");
  const ctx = getCompetitiveContext(ws, p, opts);
  if (p === "marketing") return marketingMemo(ws, ctx);
  if (p === "pricing") return pricingMemo(ws, ctx);
  if (p === "seo") return seoMemo(ws, ctx);
  return identityMemo(ws, ctx, opts.identityIntake ?? readIntake(ws));
}

// packages/brand-core/src/research/adapters.ts
var NETWORK_ENV = "BRAND_OS_RESEARCH_NETWORK";
var UNAVAILABLE_REASON = `No research adapter is available: live retrieval is off (set ${NETWORK_ENV}=on to allow it) and no recorded research bundle was given.`;
function unavailableAdapter(reason = UNAVAILABLE_REASON) {
  return {
    id: "none",
    capability: (now = /* @__PURE__ */ new Date()) => ({ adapter: "none", state: "unavailable", mode: "none", network: false, reason, checked_at: now.toISOString() }),
    retrieve: async (request) => ({ ok: false, state: "research_unavailable", url: request.url, reason })
  };
}
function pageLastUpdated(text2) {
  const match = /Last updated:?\s+(\d{4}-\d{2}-\d{2}(?:\s+UTC)?)/i.exec(text2);
  return match ? `Last updated ${match[1]}` : null;
}
function pageTitle(html) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match) return null;
  const title = normalizeForQuote(htmlToText(match[1]));
  return title ? title.slice(0, RESEARCH_LIMITS.maxTitleChars) : null;
}
function liveAdapter(opts = {}) {
  const enabled = opts.enabled ?? process.env[NETWORK_ENV] === "on";
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const tool = opts.tool ?? "brand-os live https fetch";
  return {
    id: "live",
    capability: (now = /* @__PURE__ */ new Date()) => enabled ? { adapter: "live", state: "available", mode: "live", network: true, reason: null, checked_at: now.toISOString() } : { adapter: "live", state: "unavailable", mode: "none", network: false, reason: `Live retrieval is off. Set ${NETWORK_ENV}=on to allow HTTPS fetches.`, checked_at: now.toISOString() },
    async retrieve(request, now = /* @__PURE__ */ new Date()) {
      const url = validateUrl(request.url);
      if (!enabled) return { ok: false, state: "research_unavailable", url, reason: `Live retrieval is off. Set ${NETWORK_ENV}=on to allow HTTPS fetches.` };
      const excerpts = request.excerpts.map(validateExcerpt);
      let bytes;
      let finalUrl;
      let contentType;
      try {
        const response = await fetchImpl(url, { signal: AbortSignal.timeout(RESEARCH_LIMITS.fetchTimeoutMs), redirect: "follow", headers: { accept: "text/html,text/plain", "accept-language": request.language ?? "en" } });
        if (!response.ok) return { ok: false, state: "fetch_failed", url, reason: `HTTP ${response.status}` };
        finalUrl = validateUrl(response.url || url, "final_url");
        contentType = response.headers.get("content-type") ?? "";
        if (!/^text\/(html|plain)\b/i.test(contentType)) return { ok: false, state: "fetch_failed", url, reason: `Unsupported content type ${contentType.slice(0, 60) || "none"}.` };
        const declared = Number(response.headers.get("content-length") ?? "0");
        if (declared > RESEARCH_LIMITS.maxPageBytes) return { ok: false, state: "fetch_failed", url, reason: "The page is larger than the research limit." };
        bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > RESEARCH_LIMITS.maxPageBytes) return { ok: false, state: "fetch_failed", url, reason: "The page is larger than the research limit." };
      } catch (error) {
        if (error instanceof ResearchError) return { ok: false, state: "fetch_failed", url, reason: error.message };
        return { ok: false, state: "fetch_failed", url, reason: error instanceof Error ? error.name : "fetch error" };
      }
      const html = bytes.toString("utf8");
      const text2 = /html/i.test(contentType) ? htmlToText(html) : html;
      const haystack = normalizeForQuote(text2);
      const missing = excerpts.filter((excerpt) => !haystack.includes(normalizeForQuote(excerpt.quote)));
      if (missing.length) return { ok: false, state: "quote_not_found", url, reason: `${missing.length} quote(s) are not on the fetched page (${missing.map((item) => item.claim_key).join(", ")}). Nothing was recorded.` };
      const source = validateSource({
        url,
        final_url: finalUrl,
        publisher: request.publisher,
        title: /html/i.test(contentType) ? pageTitle(html) : null,
        source_type: request.source_type,
        tier: request.tier,
        topic: request.topic,
        language: request.language ?? null,
        retrieved_at: now.toISOString(),
        page_last_updated: pageLastUpdated(normalizeForQuote(text2)),
        published_at: null,
        tool,
        adapter: "live",
        query: request.query ?? null,
        content_sha256: sha256(bytes),
        quotes_verified: true,
        excerpts
      });
      return { ok: true, source };
    }
  };
}
var BUNDLE_SCHEMA = "brand-os.research-bundle/1";
function parseBundle(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ResearchError("invalid_bundle", "A research bundle must be a JSON object.");
  const doc = raw;
  if (doc.schema !== BUNDLE_SCHEMA) throw new ResearchError("invalid_bundle", `A research bundle needs "schema": "${BUNDLE_SCHEMA}".`);
  if (typeof doc.recorded_with !== "string" || !doc.recorded_with.trim() || doc.recorded_with.length > 160) throw new ResearchError("invalid_bundle", "recorded_with must name the recording tool.");
  if (typeof doc.recorded_at !== "string" || Number.isNaN(Date.parse(doc.recorded_at))) throw new ResearchError("invalid_bundle", "recorded_at must be an ISO date.");
  if (!Array.isArray(doc.sources) || doc.sources.length === 0 || doc.sources.length > 100) throw new ResearchError("invalid_bundle", "sources must list 1 to 100 recorded sources.");
  const sources = doc.sources.map((item, index) => {
    try {
      return validateSource(item);
    } catch (error) {
      throw new ResearchError("invalid_bundle", `sources[${index}]: ${error instanceof Error ? error.message : "invalid"}`);
    }
  });
  for (const source of sources) {
    if (Date.parse(source.retrieved_at) > Date.parse(doc.recorded_at)) throw new ResearchError("invalid_bundle", `${source.url} claims a retrieval after the bundle was recorded.`);
  }
  return { schema: BUNDLE_SCHEMA, recorded_with: doc.recorded_with.trim(), recorded_at: new Date(doc.recorded_at).toISOString(), note: typeof doc.note === "string" ? doc.note.slice(0, 500) : null, sources };
}
function replayAdapter(bundle) {
  return {
    id: "replay",
    capability: (now = /* @__PURE__ */ new Date()) => ({ adapter: "replay", state: "available", mode: "replay", network: false, reason: `Replaying ${bundle.sources.length} source(s) recorded ${bundle.recorded_at.slice(0, 10)} with ${bundle.recorded_with}.`, checked_at: now.toISOString() }),
    async retrieve(request) {
      const url = validateUrl(request.url);
      const source = bundle.sources.find((item) => item.url === url);
      if (!source) return { ok: false, state: "not_recorded", url, reason: "This URL is not in the recorded bundle. Nothing is invented for it." };
      return { ok: true, source: { ...source, adapter: "replay", tool: source.tool } };
    }
  };
}
async function replayAll(bundle, now) {
  const adapter = replayAdapter(bundle);
  const out = [];
  for (const source of bundle.sources) {
    out.push(await adapter.retrieve({ url: source.url, publisher: source.publisher, source_type: source.source_type, tier: source.tier, topic: source.topic, excerpts: source.excerpts }, now));
  }
  return out;
}
function selectAdapter(opts = {}) {
  if (opts.bundle) return replayAdapter(opts.bundle);
  const env = opts.env ?? process.env;
  if (env[NETWORK_ENV] === "on") return liveAdapter({ enabled: true, fetchImpl: opts.fetchImpl });
  return unavailableAdapter();
}
function parseRequests(raw) {
  const list2 = raw?.requests;
  if (!Array.isArray(list2) || list2.length === 0 || list2.length > 100) throw new ResearchError("invalid_input", 'A request file needs "requests": a list of 1 to 100 sources to retrieve.');
  return list2.map((item, index) => {
    if (!item || typeof item !== "object") throw new ResearchError("invalid_input", `requests[${index}] must be an object.`);
    const req = item;
    if (!Array.isArray(req.excerpts) || req.excerpts.length === 0) throw new ResearchError("invalid_input", `requests[${index}] needs excerpts to verify.`);
    return {
      url: validateUrl(req.url),
      publisher: String(req.publisher ?? ""),
      source_type: req.source_type,
      tier: req.tier,
      topic: req.topic,
      language: typeof req.language === "string" ? req.language : null,
      query: typeof req.query === "string" ? req.query : null,
      excerpts: req.excerpts.map(validateExcerpt)
    };
  });
}
async function retrieveAll(adapter, requests, now) {
  const out = [];
  for (const request of requests) out.push(await adapter.retrieve(request, now));
  return out;
}
function toBundle(sources, recordedWith, now, note = null) {
  return parseBundle({ schema: BUNDLE_SCHEMA, recorded_with: recordedWith, recorded_at: now.toISOString(), note, sources });
}

// packages/brand-core/src/content-bridge/channel-playbook.ts
var CONTENT_PLAYBOOK_SCHEMA = "brand-os/content-playbook/v1";
var mix = (shares) => CONTENT_MIX_TYPES.filter((type) => shares[type]).map((type) => ({ type, share: shares[type] }));
var ENTRIES = [
  {
    channel: "instagram",
    basis: "general_practice",
    role: {
      en: "Discovery and trust: short videos to reach new people, carousels and stories to keep followers close.",
      fa: "\u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0648 \u0627\u0639\u062A\u0645\u0627\u062F\u0633\u0627\u0632\u06CC: \u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0628\u0631\u0627\u06CC \u0631\u0633\u06CC\u062F\u0646 \u0628\u0647 \u0622\u062F\u0645\u200C\u0647\u0627\u06CC \u062A\u0627\u0632\u0647\u060C \u06A9\u0631\u0648\u0633\u0644 \u0648 \u0627\u0633\u062A\u0648\u0631\u06CC \u0628\u0631\u0627\u06CC \u0646\u0632\u062F\u06CC\u06A9 \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0646 \u062F\u0646\u0628\u0627\u0644\u200C\u06A9\u0646\u0646\u062F\u0647\u200C\u0647\u0627.",
      tr: "Ke\u015Ffedilme ve g\xFCven: yeni insanlara ula\u015Fmak i\xE7in k\u0131sa videolar, takip\xE7ileri yak\u0131n tutmak i\xE7in karuseller ve hik\xE2yeler."
    },
    formats: ["reel", "carousel", "story", "post"],
    cadence: { per: "week", min: 3, max: 5, start: 3 },
    objective: "awareness",
    mix: mix({ educate: 40, inspire: 20, connect: 20, promote: 10, entertain: 10 }),
    kpis: [
      { metric: "reach", per: "post" },
      { metric: "saves", per: "post" },
      { metric: "shares", per: "post" },
      { metric: "follows", per: "week" },
      { metric: "profile_visits", per: "week" }
    ],
    posting_windows_note: {
      en: "Weekday evenings and lunch breaks in your audience's time zone are a common start; move to what your own Insights show after about a month.",
      fa: "\u0639\u0635\u0631\u0647\u0627\u06CC \u0631\u0648\u0632\u0647\u0627\u06CC \u06A9\u0627\u0631\u06CC \u0648 \u0648\u0642\u062A \u0646\u0627\u0647\u0627\u0631\u060C \u0628\u0647 \u0648\u0642\u062A \u0645\u062D\u0644\u06CC \u0645\u062E\u0627\u0637\u0628\u060C \u0634\u0631\u0648\u0639 \u0631\u0627\u06CC\u062C\u06CC \u0627\u0633\u062A\u061B \u0628\u0639\u062F \u0627\u0632 \u062D\u062F\u0648\u062F \u06CC\u06A9 \u0645\u0627\u0647 \u0628\u0631 \u0627\u0633\u0627\u0633 Insights \u062E\u0648\u062F\u062A\u0627\u0646 \u062C\u0627\u0628\u0647\u200C\u062C\u0627 \u06A9\u0646\u06CC\u062F.",
      tr: "Hedef kitlenizin saat diliminde hafta i\xE7i ak\u015Famlar\u0131 ve \xF6\u011Fle aralar\u0131 yayg\u0131n bir ba\u015Flang\u0131\xE7t\u0131r; yakla\u015F\u0131k bir ay sonra kendi Insights verilerinize g\xF6re kayd\u0131r\u0131n."
    },
    craft: [
      {
        en: "Reels are the main reach format: put the hook in the first 3 seconds, before any logo or intro.",
        fa: "\u0631\u06CC\u0644\u0632 \u0627\u0635\u0644\u06CC\u200C\u062A\u0631\u06CC\u0646 \u0642\u0627\u0644\u0628 \u0628\u0631\u0627\u06CC \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0627\u0633\u062A: \u0642\u0644\u0627\u0628 \u0631\u0627 \u062F\u0631 \u06F3 \u062B\u0627\u0646\u06CC\u0647\u0654 \u0627\u0648\u0644 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F\u060C \u0642\u0628\u0644 \u0627\u0632 \u0647\u0631 \u0644\u0648\u06AF\u0648 \u06CC\u0627 \u0645\u0642\u062F\u0645\u0647\u200C\u0627\u06CC.",
        tr: "Reels eri\u015Fimin ana format\u0131d\u0131r: kancay\u0131 ilk 3 saniyeye, her t\xFCrl\xFC logo ya da giri\u015Ften \xF6nce koyun."
      },
      {
        en: "Carousels earn saves: one idea per slide, a clear first slide, a recap or checklist near the end.",
        fa: "\u06A9\u0631\u0648\u0633\u0644 \u0630\u062E\u06CC\u0631\u0647 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F: \u0647\u0631 \u0627\u0633\u0644\u0627\u06CC\u062F \u06CC\u06A9 \u0627\u06CC\u062F\u0647\u060C \u0627\u0633\u0644\u0627\u06CC\u062F \u0627\u0648\u0644 \u0631\u0648\u0634\u0646 \u0648 \u06AF\u0648\u06CC\u0627\u060C \u0648 \u06CC\u06A9 \u062C\u0645\u0639\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627 \u0686\u06A9\u200C\u0644\u06CC\u0633\u062A \u0646\u0632\u062F\u06CC\u06A9 \u0627\u0646\u062A\u0647\u0627\u06CC \u0622\u0646.",
        tr: "Karuseller kaydedilme getirir: her slaytta tek fikir, net bir ilk slayt, sona do\u011Fru bir \xF6zet ya da kontrol listesi."
      },
      {
        en: "Keep captions on in videos; many people watch without sound.",
        fa: "\u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u0648\u06CC\u062F\u06CC\u0648\u0647\u0627 \u0631\u0627 \u0631\u0648\u0634\u0646 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u061B \u062E\u06CC\u0644\u06CC\u200C\u0647\u0627 \u0628\u06CC\u200C\u0635\u062F\u0627 \u062A\u0645\u0627\u0634\u0627 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
        tr: "Videolarda altyaz\u0131y\u0131 a\xE7\u0131k tutun; bir\xE7ok ki\u015Fi sesi kapal\u0131 izler."
      },
      {
        en: "Use stories for day-to-day connection (polls, questions, behind the scenes); they keep existing followers close.",
        fa: "\u0627\u0632 \u0627\u0633\u062A\u0648\u0631\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0631\u0648\u0632\u0645\u0631\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F (\u0646\u0638\u0631\u0633\u0646\u062C\u06CC\u060C \u0633\u0624\u0627\u0644\u060C \u067E\u0634\u062A\u200C\u0635\u062D\u0646\u0647)\u061B \u062F\u0646\u0628\u0627\u0644\u200C\u06A9\u0646\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u0631\u0627 \u0646\u0632\u062F\u06CC\u06A9 \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F.",
        tr: "Hik\xE2yeleri g\xFCnl\xFCk ba\u011F i\xE7in kullan\u0131n (anketler, sorular, kamera arkas\u0131); mevcut takip\xE7ileri yak\u0131n tutar."
      },
      {
        en: "Put the key point in the first line of the caption; the rest is hidden behind \u201Cmore\u201D.",
        fa: "\u0646\u06A9\u062A\u0647\u0654 \u0627\u0635\u0644\u06CC \u0631\u0627 \u062F\u0631 \u062E\u0637 \u0627\u0648\u0644 \u06A9\u067E\u0634\u0646 \u0628\u06CC\u0627\u0648\u0631\u06CC\u062F\u061B \u0628\u0642\u06CC\u0647 \u067E\u0634\u062A \xAB\u0628\u06CC\u0634\u062A\u0631\xBB \u067E\u0646\u0647\u0627\u0646 \u0645\u06CC\u200C\u0634\u0648\u062F.",
        tr: "Ana noktay\u0131 a\xE7\u0131klaman\u0131n ilk sat\u0131r\u0131na koyun; gerisi \u201Cdevam\u0131\u201D arkas\u0131nda kal\u0131r."
      },
      {
        en: "Three to five relevant hashtags work better than a long list.",
        fa: "\u0633\u0647 \u062A\u0627 \u067E\u0646\u062C \u0647\u0634\u062A\u06AF \u0645\u0631\u062A\u0628\u0637 \u0628\u0647\u062A\u0631 \u0627\u0632 \u06CC\u06A9 \u0641\u0647\u0631\u0633\u062A \u0628\u0644\u0646\u062F \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u062F\u0647\u062F.",
        tr: "\xDC\xE7 ila be\u015F ilgili etiket, uzun bir listeden daha iyi i\u015Fler."
      }
    ]
  },
  {
    channel: "linkedin",
    basis: "general_practice",
    role: {
      en: "Professional authority: share expertise, lessons and proof with peers, partners and buyers.",
      fa: "\u0627\u0639\u062A\u0628\u0627\u0631 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC: \u062A\u062E\u0635\u0635\u060C \u062F\u0631\u0633\u200C\u0622\u0645\u0648\u062E\u062A\u0647\u200C\u0647\u0627 \u0648 \u0634\u0648\u0627\u0647\u062F \u0631\u0627 \u0628\u0627 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646\u060C \u0634\u0631\u06A9\u0627 \u0648 \u062E\u0631\u06CC\u062F\u0627\u0631\u0627\u0646 \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
      tr: "Profesyonel otorite: uzmanl\u0131\u011F\u0131, dersleri ve kan\u0131tlar\u0131 meslekta\u015Flar, ortaklar ve al\u0131c\u0131larla payla\u015F\u0131n."
    },
    formats: ["post", "carousel", "article", "video"],
    cadence: { per: "week", min: 2, max: 5, start: 3 },
    objective: "authority",
    mix: mix({ educate: 45, inspire: 15, connect: 25, promote: 15 }),
    kpis: [
      { metric: "reach", per: "post" },
      { metric: "comments", per: "post" },
      { metric: "profile_visits", per: "week" },
      { metric: "follows", per: "week" },
      { metric: "leads", per: "month" }
    ],
    posting_windows_note: {
      en: "Mornings on your audience's working days, in their time zone, are a common start; adjust after a month of your own analytics.",
      fa: "\u0635\u0628\u062D \u0631\u0648\u0632\u0647\u0627\u06CC \u06A9\u0627\u0631\u06CC \u0645\u062E\u0627\u0637\u0628 (\u0628\u0627 \u062A\u0642\u0648\u06CC\u0645 \u06A9\u0627\u0631\u06CC \u0648 \u0648\u0642\u062A \u0645\u062D\u0644\u06CC \u062E\u0648\u062F\u0634) \u0634\u0631\u0648\u0639 \u0631\u0627\u06CC\u062C\u06CC \u0627\u0633\u062A\u061B \u0628\u0639\u062F \u0627\u0632 \u06CC\u06A9 \u0645\u0627\u0647 \u0628\u0627 \u0622\u0645\u0627\u0631 \u062E\u0648\u062F\u062A\u0627\u0646 \u062A\u0646\u0638\u06CC\u0645\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Hedef kitlenizin \xE7al\u0131\u015Fma g\xFCnlerinde, kendi saat diliminde sabah saatleri yayg\u0131n bir ba\u015Flang\u0131\xE7t\u0131r; bir ayl\u0131k kendi analiti\u011Finizle ayarlay\u0131n."
    },
    craft: [
      {
        en: "Text posts and document (PDF carousel) posts are the core formats; native video works when a real person is on camera.",
        fa: "\u067E\u0633\u062A \u0645\u062A\u0646\u06CC \u0648 \u067E\u0633\u062A \u0633\u0646\u062F\u06CC (\u06A9\u0631\u0648\u0633\u0644 PDF) \u0642\u0627\u0644\u0628\u200C\u0647\u0627\u06CC \u0627\u0635\u0644\u06CC\u200C\u0627\u0646\u062F\u061B \u0648\u06CC\u062F\u06CC\u0648\u06CC \u0628\u0648\u0645\u06CC \u0648\u0642\u062A\u06CC \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u062F\u0647\u062F \u06A9\u0647 \u06CC\u06A9 \u0622\u062F\u0645 \u0648\u0627\u0642\u0639\u06CC \u062C\u0644\u0648\u06CC \u062F\u0648\u0631\u0628\u06CC\u0646 \u0628\u0627\u0634\u062F.",
        tr: "Metin g\xF6nderileri ve belge (PDF karusel) g\xF6nderileri temel formatlard\u0131r; yerel video, kamerada ger\xE7ek biri oldu\u011Funda i\u015Fe yarar."
      },
      {
        en: "The first two lines show before \u201Csee more\u201D: put the hook and the promise of the post there.",
        fa: "\u062F\u0648 \u062E\u0637 \u0627\u0648\u0644 \u0642\u0628\u0644 \u0627\u0632 \xAB\u0628\u06CC\u0634\u062A\u0631 \u0628\u0628\u06CC\u0646\u06CC\u062F\xBB \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F: \u0642\u0644\u0627\u0628 \u0648 \u0648\u0639\u062F\u0647\u0654 \u067E\u0633\u062A \u0631\u0627 \u0647\u0645\u0627\u0646\u200C\u062C\u0627 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
        tr: "\u0130lk iki sat\u0131r \u201Cdaha fazlas\u0131n\u0131 g\xF6r\u201Dden \xF6nce g\xF6r\xFCn\xFCr: kancay\u0131 ve g\xF6nderinin vaadini oraya koyun."
      },
      {
        en: "Keep external links out of the post body; if you need one, put it in the first comment.",
        fa: "\u0644\u06CC\u0646\u06A9 \u0628\u06CC\u0631\u0648\u0646\u06CC \u0631\u0627 \u062F\u0631 \u0645\u062A\u0646 \u067E\u0633\u062A \u0646\u06AF\u0630\u0627\u0631\u06CC\u062F\u061B \u0627\u06AF\u0631 \u0644\u0627\u0632\u0645 \u0627\u0633\u062A\u060C \u0622\u0646 \u0631\u0627 \u062F\u0631 \u0627\u0648\u0644\u06CC\u0646 \u06A9\u0627\u0645\u0646\u062A \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
        tr: "D\u0131\u015F ba\u011Flant\u0131lar\u0131 g\xF6nderi metnine koymay\u0131n; gerekirse ilk yoruma koyun."
      },
      {
        en: "Short paragraphs and white space; one idea per post.",
        fa: "\u067E\u0627\u0631\u0627\u06AF\u0631\u0627\u0641\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0648 \u0641\u0627\u0635\u0644\u0647\u0654 \u06A9\u0627\u0641\u06CC \u0628\u06CC\u0646 \u062E\u0637\u0648\u0637\u061B \u0647\u0631 \u067E\u0633\u062A \u06CC\u06A9 \u0627\u06CC\u062F\u0647.",
        tr: "K\u0131sa paragraflar ve bo\u015Fluk; her g\xF6nderide tek fikir."
      },
      {
        en: "Reply to comments in the first hour; conversation is what spreads a post.",
        fa: "\u062F\u0631 \u0633\u0627\u0639\u062A \u0627\u0648\u0644 \u0628\u0647 \u06A9\u0627\u0645\u0646\u062A\u200C\u0647\u0627 \u062C\u0648\u0627\u0628 \u062F\u0647\u06CC\u062F\u061B \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u0633\u062A \u06A9\u0647 \u067E\u0633\u062A \u0631\u0627 \u067E\u062E\u0634 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
        tr: "\u0130lk saatte yorumlara yan\u0131t verin; g\xF6nderiyi yayan \u015Fey sohbettir."
      },
      {
        en: "Personal profiles usually reach further than company pages; decide who posts.",
        fa: "\u067E\u0631\u0648\u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0634\u062E\u0635\u06CC \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0627\u0632 \u0635\u0641\u062D\u0647\u0654 \u0634\u0631\u06A9\u062A \u0628\u06CC\u0634\u062A\u0631 \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0645\u0634\u062E\u0635 \u06A9\u0646\u06CC\u062F \u0686\u0647 \u06A9\u0633\u06CC \u067E\u0633\u062A \u0645\u06CC\u200C\u06AF\u0630\u0627\u0631\u062F.",
        tr: "Ki\u015Fisel profiller genellikle \u015Firket sayfalar\u0131ndan daha geni\u015F kitleye ula\u015F\u0131r; kimin payla\u015Faca\u011F\u0131na karar verin."
      }
    ]
  },
  {
    channel: "x",
    basis: "general_practice",
    role: {
      en: "Conversation and timely takes: short points, threads and replies in your field.",
      fa: "\u06AF\u0641\u062A\u200C\u0648\u06AF\u0648 \u0648 \u0648\u0627\u06A9\u0646\u0634 \u0628\u0647\u200C\u0645\u0648\u0642\u0639: \u0646\u06A9\u062A\u0647\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647\u060C \u0631\u0634\u062A\u0647\u200C\u067E\u0633\u062A \u0648 \u067E\u0627\u0633\u062E\u200C\u06AF\u0648\u06CC\u06CC \u062F\u0631 \u062D\u0648\u0632\u0647\u0654 \u06A9\u0627\u0631\u06CC\u200C\u062A\u0627\u0646.",
      tr: "Sohbet ve g\xFCncel yorumlar: alan\u0131n\u0131zda k\u0131sa fikirler, flood'lar ve yan\u0131tlar."
    },
    formats: ["post", "thread", "short_video"],
    cadence: { per: "week", min: 5, max: 21, start: 7 },
    objective: "engagement",
    mix: mix({ educate: 35, connect: 35, promote: 15, entertain: 15 }),
    kpis: [
      { metric: "replies", per: "post" },
      { metric: "reach", per: "post" },
      { metric: "profile_visits", per: "week" },
      { metric: "follows", per: "week" }
    ],
    posting_windows_note: {
      en: "Posting every day matters more than the hour; check when replies come in and post around that time.",
      fa: "\u067E\u0633\u062A \u0631\u0648\u0632\u0627\u0646\u0647 \u0645\u0647\u0645\u200C\u062A\u0631 \u0627\u0632 \u0633\u0627\u0639\u062A \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0633\u062A\u061B \u0628\u0628\u06CC\u0646\u06CC\u062F \u067E\u0627\u0633\u062E\u200C\u0647\u0627 \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u06A9\u06CC \u0645\u06CC\u200C\u0622\u06CC\u0646\u062F \u0648 \u062D\u0648\u0644 \u0647\u0645\u0627\u0646 \u0632\u0645\u0627\u0646 \u067E\u0633\u062A \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
      tr: "Her g\xFCn payla\u015Fmak saatten daha \xF6nemlidir; yan\u0131tlar\u0131n ne zaman geldi\u011Fine bak\u0131n ve o saatlerin \xE7evresinde payla\u015F\u0131n."
    },
    craft: [
      {
        en: "Lead with the point; the first line has to work on its own in the feed.",
        fa: "\u0628\u0627 \u0627\u0635\u0644 \u062D\u0631\u0641 \u0634\u0631\u0648\u0639 \u06A9\u0646\u06CC\u062F\u061B \u062E\u0637 \u0627\u0648\u0644 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0641\u06CC\u062F \u0628\u0647\u200C\u062A\u0646\u0647\u0627\u06CC\u06CC \u06A9\u0627\u0631 \u06A9\u0646\u062F.",
        tr: "As\u0131l fikirle ba\u015Flay\u0131n; ilk sat\u0131r ak\u0131\u015Fta tek ba\u015F\u0131na i\u015Fe yaramal\u0131."
      },
      {
        en: "Threads: a strong first post that promises the payoff, one idea per post, a recap and next step at the end.",
        fa: "\u0631\u0634\u062A\u0647\u200C\u067E\u0633\u062A: \u067E\u0633\u062A \u0627\u0648\u0644 \u0642\u0648\u06CC \u06A9\u0647 \u0646\u062A\u06CC\u062C\u0647 \u0631\u0627 \u0648\u0639\u062F\u0647 \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0647\u0631 \u067E\u0633\u062A \u06CC\u06A9 \u0627\u06CC\u062F\u0647\u060C \u0648 \u062F\u0631 \u067E\u0627\u06CC\u0627\u0646 \u062C\u0645\u0639\u200C\u0628\u0646\u062F\u06CC \u0648 \u0642\u062F\u0645 \u0628\u0639\u062F\u06CC.",
        tr: "Flood'lar: kazanc\u0131 vaat eden g\xFC\xE7l\xFC bir ilk g\xF6nderi, her g\xF6nderide tek fikir, sonda \xF6zet ve sonraki ad\u0131m."
      },
      {
        en: "Replies to others in your field build reach as much as your own posts.",
        fa: "\u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0646 \u0628\u0647 \u062F\u06CC\u06AF\u0631\u0627\u0646 \u062F\u0631 \u062D\u0648\u0632\u0647\u0654 \u06A9\u0627\u0631\u06CC\u200C\u062A\u0627\u0646 \u0628\u0647 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u062E\u0648\u062F\u062A\u0627\u0646 \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0645\u06CC\u200C\u0622\u0648\u0631\u062F.",
        tr: "Alan\u0131n\u0131zdaki ba\u015Fkalar\u0131na verdi\u011Finiz yan\u0131tlar, kendi g\xF6nderileriniz kadar eri\u015Fim kazand\u0131r\u0131r."
      },
      {
        en: "Links in the main post often reach fewer people; test putting them in a reply.",
        fa: "\u0644\u06CC\u0646\u06A9 \u062F\u0631 \u067E\u0633\u062A \u0627\u0635\u0644\u06CC \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u06A9\u0645\u062A\u0631 \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u06AF\u0630\u0627\u0634\u062A\u0646\u0634 \u062F\u0631 \u067E\u0627\u0633\u062E \u0631\u0627 \u0627\u0645\u062A\u062D\u0627\u0646 \u06A9\u0646\u06CC\u062F.",
        tr: "Ana g\xF6nderideki ba\u011Flant\u0131lar genellikle daha az ki\u015Fiye ula\u015F\u0131r; yan\u0131tta payla\u015Fmay\u0131 deneyin."
      },
      {
        en: "One or two hashtags at most, or none.",
        fa: "\u062D\u062F\u0627\u06A9\u062B\u0631 \u06CC\u06A9\u06CC \u062F\u0648 \u0647\u0634\u062A\u06AF\u060C \u06CC\u0627 \u0647\u06CC\u0686.",
        tr: "En fazla bir iki etiket ya da hi\xE7."
      }
    ]
  },
  {
    channel: "tiktok",
    basis: "general_practice",
    role: {
      en: "Reach through entertainment and quick lessons: native, lo-fi short videos that feel made for the feed.",
      fa: "\u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0628\u0627 \u0633\u0631\u06AF\u0631\u0645\u06CC \u0648 \u0622\u0645\u0648\u0632\u0634\u200C\u0647\u0627\u06CC \u0633\u0631\u06CC\u0639: \u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647\u060C \u062E\u0648\u062F\u0645\u0627\u0646\u06CC \u0648 \u0628\u06CC\u200C\u062A\u06A9\u0644\u0641 \u06A9\u0647 \u062D\u0633 \u06A9\u0646\u0646\u062F \u0628\u0631\u0627\u06CC \u0647\u0645\u06CC\u0646 \u0641\u06CC\u062F \u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
      tr: "E\u011Flence ve h\u0131zl\u0131 derslerle eri\u015Fim: ak\u0131\u015F i\xE7in yap\u0131lm\u0131\u015F gibi hissettiren do\u011Fal, sade k\u0131sa videolar."
    },
    formats: ["short_video", "live"],
    cadence: { per: "week", min: 3, max: 7, start: 4 },
    objective: "awareness",
    mix: mix({ educate: 35, inspire: 15, connect: 10, promote: 5, entertain: 35 }),
    kpis: [
      { metric: "watch_time", per: "post" },
      { metric: "completion_rate", per: "post" },
      { metric: "shares", per: "post" },
      { metric: "follows", per: "week" }
    ],
    posting_windows_note: {
      en: "Evenings and weekends are a common start; a steady rhythm matters more than the exact hour.",
      fa: "\u0639\u0635\u0631\u0647\u0627 \u0648 \u0622\u062E\u0631 \u0647\u0641\u062A\u0647 \u0634\u0631\u0648\u0639 \u0631\u0627\u06CC\u062C\u06CC \u0627\u0633\u062A\u061B \u0646\u0638\u0645 \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0632 \u0633\u0627\u0639\u062A \u062F\u0642\u06CC\u0642 \u0645\u0647\u0645\u200C\u062A\u0631 \u0627\u0633\u062A.",
      tr: "Ak\u015Famlar ve hafta sonlar\u0131 yayg\u0131n bir ba\u015Flang\u0131\xE7t\u0131r; d\xFCzenli bir ritim tam saatten daha \xF6nemlidir."
    },
    craft: [
      {
        en: "The first 1\u20132 seconds decide the view: start mid-action or with the payoff, never with an intro.",
        fa: "\u06CC\u06A9\u06CC \u062F\u0648 \u062B\u0627\u0646\u06CC\u0647\u0654 \u0627\u0648\u0644 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648\u06CC\u062F\u06CC\u0648 \u062F\u06CC\u062F\u0647 \u0634\u0648\u062F \u06CC\u0627 \u0646\u0647: \u0627\u0632 \u0648\u0633\u0637 \u0645\u0627\u062C\u0631\u0627 \u06CC\u0627 \u0628\u0627 \u0646\u062A\u06CC\u062C\u0647 \u0634\u0631\u0648\u0639 \u06A9\u0646\u06CC\u062F\u060C \u0647\u0631\u06AF\u0632 \u0628\u0627 \u0645\u0639\u0631\u0641\u06CC.",
        tr: "\u0130lk 1\u20132 saniye izlenmeyi belirler: aksiyonun ortas\u0131ndan ya da sonu\xE7la ba\u015Flay\u0131n, asla giri\u015Fle de\u011Fil."
      },
      {
        en: "Completion drives distribution: cut every pause, keep most videos short, loop the ending into the start where it fits.",
        fa: "\u062A\u0645\u0627\u0634\u0627\u06CC \u06A9\u0627\u0645\u0644 \u0648\u06CC\u062F\u06CC\u0648\u060C \u067E\u062E\u0634 \u0622\u0646 \u0631\u0627 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F: \u0647\u0631 \u0645\u06A9\u062B\u06CC \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u06CC\u062F\u060C \u0628\u06CC\u0634\u062A\u0631 \u0648\u06CC\u062F\u06CC\u0648\u0647\u0627 \u0631\u0627 \u06A9\u0648\u062A\u0627\u0647 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F \u0648 \u0627\u06AF\u0631 \u062C\u0627 \u062F\u0627\u0631\u062F \u067E\u0627\u06CC\u0627\u0646 \u0631\u0627 \u0628\u0647 \u0634\u0631\u0648\u0639 \u0648\u0635\u0644 \u06A9\u0646\u06CC\u062F.",
        tr: "Sonuna kadar izlenme da\u011F\u0131t\u0131m\u0131 belirler: her duraklamay\u0131 kesin, \xE7o\u011Fu videoyu k\u0131sa tutun, uygunsa sonu ba\u015Fa ba\u011Flay\u0131n."
      },
      {
        en: "Native beats polished: talk to the camera, use on-screen text and captions.",
        fa: "\u0637\u0628\u06CC\u0639\u06CC \u0628\u0648\u062F\u0646 \u0627\u0632 \u0635\u06CC\u0642\u0644\u200C\u062E\u0648\u0631\u062F\u06AF\u06CC \u0628\u0647\u062A\u0631 \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u062F\u0647\u062F: \u0631\u0648 \u0628\u0647 \u062F\u0648\u0631\u0628\u06CC\u0646 \u062D\u0631\u0641 \u0628\u0632\u0646\u06CC\u062F \u0648 \u0627\u0632 \u0645\u062A\u0646 \u0631\u0648\u06CC \u062A\u0635\u0648\u06CC\u0631 \u0648 \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F.",
        tr: "Do\u011Fal olan cilal\u0131 olandan iyidir: kameraya konu\u015Fun, ekran yaz\u0131s\u0131 ve altyaz\u0131 kullan\u0131n."
      },
      {
        en: "Use trends and sounds only when they fit the brand's voice; never borrow a claim from a trend.",
        fa: "\u0627\u0632 \u062A\u0631\u0646\u062F\u0647\u0627 \u0648 \u0635\u062F\u0627\u0647\u0627 \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u0628\u0627 \u0644\u062D\u0646 \u0628\u0631\u0646\u062F \u062C\u0648\u0631 \u0628\u0627\u0634\u0646\u062F\u061B \u0647\u06CC\u0686 \u0627\u062F\u0639\u0627\u06CC\u06CC \u0631\u0627 \u0627\u0632 \u06CC\u06A9 \u062A\u0631\u0646\u062F \u0642\u0631\u0636 \u0646\u06AF\u06CC\u0631\u06CC\u062F.",
        tr: "Trendleri ve sesleri yaln\u0131zca markan\u0131n ses tonuna uydu\u011Funda kullan\u0131n; bir trendden asla iddia \xF6d\xFCn\xE7 almay\u0131n."
      },
      {
        en: "Answer comments with video replies; they become your next ideas.",
        fa: "\u0628\u0647 \u06A9\u0627\u0645\u0646\u062A\u200C\u0647\u0627 \u0628\u0627 \u0648\u06CC\u062F\u06CC\u0648 \u062C\u0648\u0627\u0628 \u062F\u0647\u06CC\u062F\u061B \u0647\u0645\u06CC\u0646\u200C\u0647\u0627 \u0627\u06CC\u062F\u0647\u200C\u0647\u0627\u06CC \u0628\u0639\u062F\u06CC\u200C\u062A\u0627\u0646 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
        tr: "Yorumlara video yan\u0131tla kar\u015F\u0131l\u0131k verin; bunlar sonraki fikirleriniz olur."
      }
    ]
  },
  {
    channel: "youtube",
    basis: "general_practice",
    role: {
      en: "Depth and search: longer videos people find when they look for answers, with Shorts to be discovered.",
      fa: "\u0639\u0645\u0642 \u0648 \u062C\u0633\u062A\u200C\u0648\u062C\u0648: \u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u0628\u0644\u0646\u062F\u062A\u0631\u06CC \u06A9\u0647 \u0645\u0631\u062F\u0645 \u0648\u0642\u062A\u06CC \u062F\u0646\u0628\u0627\u0644 \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u06AF\u0631\u062F\u0646\u062F \u067E\u06CC\u062F\u0627 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u060C \u0628\u0647\u200C\u0647\u0645\u0631\u0627\u0647 Shorts \u0628\u0631\u0627\u06CC \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646.",
      tr: "Derinlik ve arama: insanlar\u0131n cevap ararken buldu\u011Fu daha uzun videolar ve ke\u015Ffedilmek i\xE7in Shorts."
    },
    formats: ["video", "short_video", "live"],
    cadence: { per: "week", min: 1, max: 3, start: 1 },
    objective: "authority",
    mix: mix({ educate: 55, inspire: 15, connect: 5, promote: 10, entertain: 15 }),
    kpis: [
      { metric: "watch_time", per: "post" },
      { metric: "completion_rate", per: "post" },
      { metric: "subscribers", per: "month" },
      { metric: "link_clicks", per: "month" }
    ],
    posting_windows_note: {
      en: "Publish on a steady day and time so subscribers learn when to expect you; search traffic depends less on timing.",
      fa: "\u062F\u0631 \u0631\u0648\u0632 \u0648 \u0633\u0627\u0639\u062A \u062B\u0627\u0628\u062A\u06CC \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627 \u0628\u062F\u0627\u0646\u0646\u062F \u06A9\u06CC \u0645\u0646\u062A\u0638\u0631 \u0628\u0627\u0634\u0646\u062F\u061B \u0628\u0627\u0632\u062F\u06CC\u062F\u06CC \u06A9\u0647 \u0627\u0632 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0645\u06CC\u200C\u0622\u06CC\u062F \u06A9\u0645\u062A\u0631 \u0628\u0647 \u0632\u0645\u0627\u0646 \u0648\u0627\u0628\u0633\u062A\u0647 \u0627\u0633\u062A.",
      tr: "Aboneler ne zaman bekleyeceklerini \xF6\u011Frensin diye sabit bir g\xFCn ve saatte yay\u0131nlay\u0131n; arama trafi\u011Fi zamanlamaya daha az ba\u011Fl\u0131d\u0131r."
    },
    craft: [
      {
        en: "Title and thumbnail are one promise; the first 30 seconds must deliver on it.",
        fa: "\u0639\u0646\u0648\u0627\u0646 \u0648 \u062A\u0635\u0648\u06CC\u0631 \u0628\u0646\u062F\u0627\u0646\u06AF\u0634\u062A\u06CC \u06CC\u06A9 \u0648\u0639\u062F\u0647\u200C\u0627\u0646\u062F\u061B \u06F3\u06F0 \u062B\u0627\u0646\u06CC\u0647\u0654 \u0627\u0648\u0644 \u0628\u0627\u06CC\u062F \u0647\u0645\u0627\u0646 \u0648\u0639\u062F\u0647 \u0631\u0627 \u0628\u0631\u0622\u0648\u0631\u062F\u0647 \u06A9\u0646\u062F.",
        tr: "Ba\u015Fl\u0131k ve k\xFC\xE7\xFCk resim tek bir vaattir; ilk 30 saniye bu vaadi yerine getirmeli."
      },
      {
        en: "Write titles around what people search for, in the language they search in.",
        fa: "\u0639\u0646\u0648\u0627\u0646 \u0631\u0627 \u062D\u0648\u0644 \u0686\u06CC\u0632\u06CC \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u0645\u0631\u062F\u0645 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u060C \u0628\u0647 \u0647\u0645\u0627\u0646 \u0632\u0628\u0627\u0646\u06CC \u06A9\u0647 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
        tr: "Ba\u015Fl\u0131klar\u0131 insanlar\u0131n arad\u0131\u011F\u0131 \u015Feye g\xF6re, arad\u0131klar\u0131 dilde yaz\u0131n."
      },
      {
        en: "Structure long videos in chapters and add chapter markers to the description.",
        fa: "\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u0628\u0644\u0646\u062F \u0631\u0627 \u0641\u0635\u0644\u200C\u0628\u0646\u062F\u06CC \u06A9\u0646\u06CC\u062F \u0648 \u0646\u0634\u0627\u0646\u06AF\u0631 \u0641\u0635\u0644\u200C\u0647\u0627 \u0631\u0627 \u062F\u0631 \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
        tr: "Uzun videolar\u0131 b\xF6l\xFCmlere ay\u0131r\u0131n ve a\xE7\u0131klamaya b\xF6l\xFCm i\u015Faretleri ekleyin."
      },
      {
        en: "Shorts bring new viewers; point them to a related long video.",
        fa: "Shorts \u0628\u06CC\u0646\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u062A\u0627\u0632\u0647 \u0645\u06CC\u200C\u0622\u0648\u0631\u062F\u061B \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u0628\u0647 \u06CC\u06A9 \u0648\u06CC\u062F\u06CC\u0648\u06CC \u0628\u0644\u0646\u062F \u0645\u0631\u062A\u0628\u0637 \u0647\u062F\u0627\u06CC\u062A \u06A9\u0646\u06CC\u062F.",
        tr: "Shorts yeni izleyiciler getirir; onlar\u0131 ilgili uzun bir videoya y\xF6nlendirin."
      },
      {
        en: "Add accurate captions; they help viewers and search.",
        fa: "\u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u062F\u0642\u06CC\u0642 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F\u061B \u0647\u0645 \u0628\u0647 \u0628\u06CC\u0646\u0646\u062F\u0647 \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0647\u0645 \u0628\u0647 \u062C\u0633\u062A\u200C\u0648\u062C\u0648.",
        tr: "Do\u011Fru altyaz\u0131 ekleyin; hem izleyicilere hem aramaya yard\u0131mc\u0131 olur."
      }
    ]
  },
  {
    channel: "threads",
    basis: "general_practice",
    role: {
      en: "Casual conversation: quick thoughts, questions and replies that show the people behind the brand.",
      fa: "\u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u06CC \u062E\u0648\u062F\u0645\u0627\u0646\u06CC: \u0641\u06A9\u0631\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647\u060C \u0633\u0624\u0627\u0644\u200C\u0647\u0627 \u0648 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0622\u062F\u0645\u200C\u0647\u0627\u06CC \u067E\u0634\u062A \u0628\u0631\u0646\u062F \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F.",
      tr: "Samimi sohbet: markan\u0131n arkas\u0131ndaki insanlar\u0131 g\xF6steren k\u0131sa d\xFC\u015F\xFCnceler, sorular ve yan\u0131tlar."
    },
    formats: ["post", "thread"],
    cadence: { per: "week", min: 3, max: 10, start: 5 },
    objective: "engagement",
    mix: mix({ educate: 30, connect: 40, promote: 10, entertain: 20 }),
    kpis: [
      { metric: "replies", per: "post" },
      { metric: "reach", per: "post" },
      { metric: "follows", per: "week" }
    ],
    posting_windows_note: {
      en: "Start from your Instagram audience's active hours; the two audiences overlap.",
      fa: "\u0628\u0631\u0627\u06CC \u0634\u0631\u0648\u0639\u060C \u0633\u0627\u0639\u062A\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644 \u0645\u062E\u0627\u0637\u0628\u0627\u0646 \u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645\u062A\u0627\u0646 \u0631\u0627 \u0645\u0628\u0646\u0627 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F\u061B \u0627\u06CC\u0646 \u062F\u0648 \u0645\u062E\u0627\u0637\u0628 \u0647\u0645\u200C\u067E\u0648\u0634\u0627\u0646\u06CC \u062F\u0627\u0631\u0646\u062F.",
      tr: "Ba\u015Flang\u0131\xE7ta Instagram kitlenizin aktif saatlerini esas al\u0131n; iki kitle \xF6rt\xFC\u015F\xFCr."
    },
    craft: [
      {
        en: "Write the way you talk; questions and opinions get replies.",
        fa: "\u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u062D\u0631\u0641 \u0645\u06CC\u200C\u0632\u0646\u06CC\u062F\u061B \u0633\u0624\u0627\u0644 \u0648 \u0646\u0638\u0631 \u0634\u062E\u0635\u06CC \u067E\u0627\u0633\u062E \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.",
        tr: "Konu\u015Ftu\u011Funuz gibi yaz\u0131n; sorular ve g\xF6r\xFC\u015Fler yan\u0131t al\u0131r."
      },
      {
        en: "Reply to every early comment; the replies are the reach.",
        fa: "\u0628\u0647 \u0647\u0645\u0647\u0654 \u06A9\u0627\u0645\u0646\u062A\u200C\u0647\u0627\u06CC \u0627\u0648\u0644\u06CC\u0647 \u062C\u0648\u0627\u0628 \u062F\u0647\u06CC\u062F\u061B \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0627\u0632 \u0647\u0645\u06CC\u0646 \u067E\u0627\u0633\u062E\u200C\u0647\u0627 \u0645\u06CC\u200C\u0622\u06CC\u062F.",
        tr: "Her erken yoruma yan\u0131t verin; eri\u015Fim bu yan\u0131tlardan gelir."
      },
      {
        en: "Keep promotion light; this is not a link channel.",
        fa: "\u062A\u0628\u0644\u06CC\u063A \u0631\u0627 \u0633\u0628\u06A9 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u061B \u0627\u06CC\u0646 \u06A9\u0627\u0646\u0627\u0644\u06CC \u0628\u0631\u0627\u06CC \u0644\u06CC\u0646\u06A9 \u062F\u0627\u062F\u0646 \u0646\u06CC\u0633\u062A.",
        tr: "Tan\u0131t\u0131m\u0131 hafif tutun; buras\u0131 bir ba\u011Flant\u0131 kanal\u0131 de\u011Fil."
      },
      {
        en: "Reuse a strong caption or carousel idea as a short text post, rewritten for this feed.",
        fa: "\u06CC\u06A9 \u06A9\u067E\u0634\u0646 \u06CC\u0627 \u0627\u06CC\u062F\u0647\u0654 \u06A9\u0631\u0648\u0633\u0644 \u0645\u0648\u0641\u0642 \u0631\u0627 \u0628\u0647 \u0634\u06A9\u0644 \u06CC\u06A9 \u067E\u0633\u062A \u0645\u062A\u0646\u06CC \u06A9\u0648\u062A\u0627\u0647\u060C \u0628\u0627\u0632\u0646\u0648\u06CC\u0633\u06CC\u200C\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0641\u06CC\u062F\u060C \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F.",
        tr: "G\xFC\xE7l\xFC bir a\xE7\u0131klamay\u0131 ya da karusel fikrini, bu ak\u0131\u015F i\xE7in yeniden yaz\u0131lm\u0131\u015F k\u0131sa bir metin g\xF6nderisi olarak kullan\u0131n."
      }
    ]
  },
  {
    channel: "telegram",
    basis: "general_practice",
    role: {
      en: "A direct line to the community: updates, useful posts and announcements that land straight in subscribers' chats.",
      fa: "\u062E\u0637 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0627 \u062C\u0627\u0645\u0639\u0647\u0654 \u0645\u062E\u0627\u0637\u0628\u0627\u0646: \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC\u200C\u0647\u0627\u060C \u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u0648 \u0627\u0637\u0644\u0627\u0639\u06CC\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0647 \u0635\u0641\u062D\u0647\u0654 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u06CC \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627 \u0645\u06CC\u200C\u0631\u0633\u062F.",
      tr: "Toplulu\u011Fa do\u011Frudan hat: abonelerin sohbetlerine do\u011Frudan d\xFC\u015Fen g\xFCncellemeler, faydal\u0131 g\xF6nderiler ve duyurular."
    },
    formats: ["post", "video", "live"],
    cadence: { per: "week", min: 3, max: 7, start: 4 },
    objective: "retention",
    mix: mix({ educate: 40, inspire: 15, connect: 25, promote: 20 }),
    kpis: [
      { metric: "reach", per: "post" },
      { metric: "shares", per: "post" },
      { metric: "link_clicks", per: "post" },
      { metric: "subscribers", per: "month" }
    ],
    posting_windows_note: {
      en: "Avoid late-night posts that notify sleeping subscribers; send minor updates silently.",
      fa: "\u0627\u0632 \u067E\u0633\u062A\u200C\u06AF\u0630\u0627\u0634\u062A\u0646 \u0646\u06CC\u0645\u0647\u200C\u0634\u0628 \u067E\u0631\u0647\u06CC\u0632 \u06A9\u0646\u06CC\u062F \u0686\u0648\u0646 \u0628\u0631\u0627\u06CC \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627\u06CC \u062E\u0648\u0627\u0628 \u0627\u0639\u0644\u0627\u0646 \u0645\u06CC\u200C\u0641\u0631\u0633\u062A\u062F\u061B \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC\u200C\u0647\u0627\u06CC \u062C\u0632\u0626\u06CC \u0631\u0627 \u0628\u06CC\u200C\u0635\u062F\u0627 \u0628\u0641\u0631\u0633\u062A\u06CC\u062F.",
      tr: "Uyuyan abonelere bildirim giden gece ge\xE7 saat g\xF6nderilerinden ka\xE7\u0131n\u0131n; k\xFC\xE7\xFCk g\xFCncellemeleri sessiz g\xF6nderin."
    },
    craft: [
      {
        en: "Every post is a notification: post less and make each one worth it.",
        fa: "\u0647\u0631 \u067E\u0633\u062A \u06CC\u06A9 \u0627\u0639\u0644\u0627\u0646 \u0627\u0633\u062A: \u06A9\u0645\u062A\u0631 \u067E\u0633\u062A \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F \u0648 \u0647\u0631 \u06A9\u062F\u0627\u0645 \u0631\u0627 \u0627\u0631\u0632\u0634\u0645\u0646\u062F \u06A9\u0646\u06CC\u062F.",
        tr: "Her g\xF6nderi bir bildirimdir: daha az payla\u015F\u0131n ve her birini de\u011Ferli k\u0131l\u0131n."
      },
      {
        en: "A bold first line as the headline, short paragraphs, one link at most.",
        fa: "\u062E\u0637 \u0627\u0648\u0644 \u0631\u0627 \u067E\u0631\u0631\u0646\u06AF \u0648 \u0645\u062B\u0644 \u062A\u06CC\u062A\u0631 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F\u061B \u067E\u0627\u0631\u0627\u06AF\u0631\u0627\u0641\u200C\u0647\u0627 \u06A9\u0648\u062A\u0627\u0647 \u0648 \u062D\u062F\u0627\u06A9\u062B\u0631 \u06CC\u06A9 \u0644\u06CC\u0646\u06A9.",
        tr: "\u0130lk sat\u0131r ba\u015Fl\u0131k gibi kal\u0131n, k\u0131sa paragraflar, en fazla bir ba\u011Flant\u0131."
      },
      {
        en: "Use polls and a linked discussion group to hear from subscribers.",
        fa: "\u0628\u0627 \u0646\u0638\u0631\u0633\u0646\u062C\u06CC \u0648 \u06AF\u0631\u0648\u0647 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u06CC \u0645\u062A\u0635\u0644 \u0628\u0647 \u06A9\u0627\u0646\u0627\u0644\u060C \u0635\u062F\u0627\u06CC \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627 \u0631\u0627 \u0628\u0634\u0646\u0648\u06CC\u062F.",
        tr: "Abonelerin sesini duymak i\xE7in anketleri ve ba\u011Fl\u0131 tart\u0131\u015Fma grubunu kullan\u0131n."
      },
      {
        en: "Pin the post new subscribers should read first.",
        fa: "\u067E\u0633\u062A\u06CC \u0631\u0627 \u06A9\u0647 \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627\u06CC \u062A\u0627\u0632\u0647 \u0628\u0627\u06CC\u062F \u0627\u0648\u0644 \u0628\u062E\u0648\u0627\u0646\u0646\u062F \u0633\u0646\u062C\u0627\u0642 \u06A9\u0646\u06CC\u062F.",
        tr: "Yeni abonelerin \xF6nce okumas\u0131 gereken g\xF6nderiyi sabitleyin."
      }
    ]
  },
  {
    channel: "facebook",
    basis: "general_practice",
    role: {
      en: "Community and local reach: groups, events and posts for an audience that already knows you.",
      fa: "\u062C\u0627\u0645\u0639\u0647 \u0648 \u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062D\u0644\u06CC: \u06AF\u0631\u0648\u0647\u200C\u0647\u0627\u060C \u0631\u0648\u06CC\u062F\u0627\u062F\u0647\u0627 \u0648 \u067E\u0633\u062A\u200C\u0647\u0627\u06CC\u06CC \u0628\u0631\u0627\u06CC \u0645\u062E\u0627\u0637\u0628\u06CC \u06A9\u0647 \u0627\u0632 \u0642\u0628\u0644 \u0634\u0645\u0627 \u0631\u0627 \u0645\u06CC\u200C\u0634\u0646\u0627\u0633\u062F.",
      tr: "Topluluk ve yerel eri\u015Fim: sizi zaten tan\u0131yan bir kitle i\xE7in gruplar, etkinlikler ve g\xF6nderiler."
    },
    formats: ["post", "video", "reel", "live", "story"],
    cadence: { per: "week", min: 3, max: 5, start: 3 },
    objective: "community",
    mix: mix({ educate: 30, connect: 35, promote: 15, entertain: 20 }),
    kpis: [
      { metric: "reach", per: "post" },
      { metric: "comments", per: "post" },
      { metric: "shares", per: "post" },
      { metric: "link_clicks", per: "post" }
    ],
    posting_windows_note: {
      en: "Weekday midday and early evening in your audience's time zone are a common start.",
      fa: "\u0638\u0647\u0631 \u0648 \u0627\u0648\u0627\u06CC\u0644 \u0639\u0635\u0631\u0650 \u0631\u0648\u0632\u0647\u0627\u06CC \u06A9\u0627\u0631\u06CC\u060C \u0628\u0647 \u0648\u0642\u062A \u0645\u062D\u0644\u06CC \u0645\u062E\u0627\u0637\u0628\u060C \u0634\u0631\u0648\u0639 \u0631\u0627\u06CC\u062C\u06CC \u0627\u0633\u062A.",
      tr: "Hedef kitlenizin saat diliminde hafta i\xE7i \xF6\u011Fle ve ak\u015Fam\xFCst\xFC saatleri yayg\u0131n bir ba\u015Flang\u0131\xE7t\u0131r."
    },
    craft: [
      {
        en: "Questions and local or community stories start conversations.",
        fa: "\u0633\u0624\u0627\u0644\u200C\u0647\u0627 \u0648 \u0631\u0648\u0627\u06CC\u062A\u200C\u0647\u0627\u06CC \u0645\u062D\u0644\u06CC \u06CC\u0627 \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 \u062C\u0627\u0645\u0639\u0647\u0654 \u0645\u062E\u0627\u0637\u0628\u0627\u0646\u060C \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648 \u0631\u0627\u0647 \u0645\u06CC\u200C\u0627\u0646\u062F\u0627\u0632\u0646\u062F.",
        tr: "Sorular ve yerel ya da topluluk hik\xE2yeleri sohbet ba\u015Flat\u0131r."
      },
      {
        en: "Reels and native video usually reach further than link posts.",
        fa: "\u0631\u06CC\u0644\u0632 \u0648 \u0648\u06CC\u062F\u06CC\u0648\u06CC \u0628\u0648\u0645\u06CC \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0627\u0632 \u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u0644\u06CC\u0646\u06A9\u200C\u062F\u0627\u0631 \u0628\u06CC\u0634\u062A\u0631 \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
        tr: "Reels ve yerel video genellikle ba\u011Flant\u0131l\u0131 g\xF6nderilerden daha fazla ki\u015Fiye ula\u015F\u0131r."
      },
      {
        en: "Lives and events suit launches, Q&As and workshops.",
        fa: "\u0644\u0627\u06CC\u0648 \u0648 \u0631\u0648\u06CC\u062F\u0627\u062F \u0628\u0631\u0627\u06CC \u0645\u0639\u0631\u0641\u06CC \u0645\u062D\u0635\u0648\u0644\u060C \u067E\u0631\u0633\u0634 \u0648 \u067E\u0627\u0633\u062E \u0648 \u06A9\u0627\u0631\u06AF\u0627\u0647 \u0645\u0646\u0627\u0633\u0628 \u0627\u0633\u062A.",
        tr: "Canl\u0131 yay\u0131nlar ve etkinlikler lansmanlar, soru-cevaplar ve at\xF6lyeler i\xE7in uygundur."
      },
      {
        en: "Reply to comments and messages quickly; groups grow with an active host.",
        fa: "\u0628\u0647 \u06A9\u0627\u0645\u0646\u062A\u200C\u0647\u0627 \u0648 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0633\u0631\u06CC\u0639 \u062C\u0648\u0627\u0628 \u062F\u0647\u06CC\u062F\u061B \u06AF\u0631\u0648\u0647\u200C\u0647\u0627 \u0628\u0627 \u0645\u06CC\u0632\u0628\u0627\u0646 \u0641\u0639\u0627\u0644 \u0631\u0634\u062F \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
        tr: "Yorumlara ve mesajlara h\u0131zl\u0131 yan\u0131t verin; gruplar aktif bir ev sahibiyle b\xFCy\xFCr."
      }
    ]
  },
  {
    channel: "pinterest",
    basis: "general_practice",
    role: {
      en: "Visual search: evergreen pins that people save and that keep sending visitors to your site for months.",
      fa: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u062A\u0635\u0648\u06CC\u0631\u06CC: \u067E\u06CC\u0646\u200C\u0647\u0627\u06CC \u0645\u0627\u0646\u062F\u06AF\u0627\u0631\u06CC \u06A9\u0647 \u0645\u0631\u062F\u0645 \u0630\u062E\u06CC\u0631\u0647 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F \u0648 \u0645\u0627\u0647\u200C\u0647\u0627 \u0628\u0627\u0632\u062F\u06CC\u062F\u06A9\u0646\u0646\u062F\u0647 \u0628\u0647 \u0633\u0627\u06CC\u062A \u0634\u0645\u0627 \u0645\u06CC\u200C\u0641\u0631\u0633\u062A\u0646\u062F.",
      tr: "G\xF6rsel arama: insanlar\u0131n kaydetti\u011Fi ve aylarca sitenize ziyaret\xE7i g\xF6ndermeye devam eden kal\u0131c\u0131 pinler."
    },
    formats: ["post", "short_video"],
    cadence: { per: "week", min: 5, max: 15, start: 7 },
    objective: "awareness",
    mix: mix({ educate: 50, inspire: 40, promote: 10 }),
    kpis: [
      { metric: "saves", per: "post" },
      { metric: "link_clicks", per: "post" },
      { metric: "reach", per: "post" }
    ],
    posting_windows_note: {
      en: "Timing matters little because pins are found through search; publish steadily and plan seasonal topics weeks ahead.",
      fa: "\u0632\u0645\u0627\u0646 \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0647\u0645\u06CC\u062A \u0686\u0646\u062F\u0627\u0646\u06CC \u0646\u062F\u0627\u0631\u062F \u0686\u0648\u0646 \u067E\u06CC\u0646\u200C\u0647\u0627 \u0627\u0632 \u0631\u0627\u0647 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u067E\u06CC\u062F\u0627 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0645\u0646\u0638\u0645 \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u06CC\u062F \u0648 \u0645\u0648\u0636\u0648\u0639\u0627\u062A \u0641\u0635\u0644\u06CC \u0631\u0627 \u0686\u0646\u062F \u0647\u0641\u062A\u0647 \u0632\u0648\u062F\u062A\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u06A9\u0646\u06CC\u062F.",
      tr: "Pinler arama yoluyla bulundu\u011Fu i\xE7in zamanlama pek \xF6nemli de\u011Fildir; d\xFCzenli yay\u0131nlay\u0131n ve sezonluk konular\u0131 haftalar \xF6nceden planlay\u0131n."
    },
    craft: [
      {
        en: "Vertical images (2:3) with a short text overlay that says what the pin is about.",
        fa: "\u062A\u0635\u0648\u06CC\u0631 \u0639\u0645\u0648\u062F\u06CC (\u06F2:\u06F3) \u0628\u0627 \u06CC\u06A9 \u0645\u062A\u0646 \u06A9\u0648\u062A\u0627\u0647 \u0631\u0648\u06CC \u062A\u0635\u0648\u06CC\u0631 \u06A9\u0647 \u0628\u06AF\u0648\u06CC\u062F \u067E\u06CC\u0646 \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0686\u06CC\u0633\u062A.",
        tr: "Pinin ne hakk\u0131nda oldu\u011Funu s\xF6yleyen k\u0131sa bir metin katman\u0131yla dikey g\xF6rseller (2:3)."
      },
      {
        en: "Titles and descriptions use the words people search for.",
        fa: "\u0639\u0646\u0648\u0627\u0646 \u0648 \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0631\u0627 \u0628\u0627 \u06A9\u0644\u0645\u0627\u062A\u06CC \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u0645\u0631\u062F\u0645 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
        tr: "Ba\u015Fl\u0131klar ve a\xE7\u0131klamalar insanlar\u0131n arad\u0131\u011F\u0131 kelimeleri kullan\u0131r."
      },
      {
        en: "Every pin links to a relevant page, never a generic home page.",
        fa: "\u0647\u0631 \u067E\u06CC\u0646 \u0628\u0647 \u06CC\u06A9 \u0635\u0641\u062D\u0647\u0654 \u0645\u0631\u062A\u0628\u0637 \u0644\u06CC\u0646\u06A9 \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0646\u0647 \u0628\u0647 \u0635\u0641\u062D\u0647\u0654 \u0627\u0635\u0644\u06CC \u06A9\u0644\u06CC \u0633\u0627\u06CC\u062A.",
        tr: "Her pin ilgili bir sayfaya ba\u011Flan\u0131r, asla genel bir ana sayfaya de\u011Fil."
      },
      {
        en: "Organise pins on boards named after topics people search for.",
        fa: "\u067E\u06CC\u0646\u200C\u0647\u0627 \u0631\u0627 \u062F\u0631 \u0628\u0631\u062F\u0647\u0627\u06CC\u06CC \u0645\u0631\u062A\u0628 \u06A9\u0646\u06CC\u062F \u06A9\u0647 \u0646\u0627\u0645\u0634\u0627\u0646 \u0647\u0645\u0627\u0646 \u0645\u0648\u0636\u0648\u0639\u0627\u062A\u06CC \u0627\u0633\u062A \u06A9\u0647 \u0645\u0631\u062F\u0645 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
        tr: "Pinleri insanlar\u0131n arad\u0131\u011F\u0131 konular\u0131n ad\u0131n\u0131 ta\u015F\u0131yan panolarda d\xFCzenleyin."
      }
    ]
  },
  {
    channel: "newsletter",
    basis: "general_practice",
    role: {
      en: "An owned relationship: a regular, useful email to people who asked for it, where offers can be made directly.",
      fa: "\u0631\u0627\u0628\u0637\u0647\u200C\u0627\u06CC \u06A9\u0647 \u0645\u0627\u0644 \u062E\u0648\u062F \u0628\u0631\u0646\u062F \u0627\u0633\u062A: \u0627\u06CC\u0645\u06CC\u0644\u06CC \u0645\u0646\u0638\u0645 \u0648 \u0645\u0641\u06CC\u062F \u0628\u0631\u0627\u06CC \u06A9\u0633\u0627\u0646\u06CC \u06A9\u0647 \u062E\u0648\u062F\u0634\u0627\u0646 \u062E\u0648\u0627\u0633\u062A\u0647\u200C\u0627\u0646\u062F\u060C \u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0631\u0627 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0645\u0637\u0631\u062D \u06A9\u0631\u062F.",
      tr: "Markaya ait bir ili\u015Fki: isteyen ki\u015Filere d\xFCzenli, faydal\u0131 bir e-posta; teklifler do\u011Frudan burada sunulabilir."
    },
    formats: ["email"],
    cadence: { per: "week", min: 1, max: 2, start: 1 },
    objective: "retention",
    mix: mix({ educate: 50, inspire: 10, connect: 20, promote: 20 }),
    kpis: [
      { metric: "subscribers", per: "month" },
      { metric: "link_clicks", per: "post" },
      { metric: "replies", per: "post" }
    ],
    posting_windows_note: {
      en: "Send on the same day each week; test morning against evening for your own list.",
      fa: "\u0647\u0631 \u0647\u0641\u062A\u0647 \u062F\u0631 \u06CC\u06A9 \u0631\u0648\u0632 \u062B\u0627\u0628\u062A \u0628\u0641\u0631\u0633\u062A\u06CC\u062F\u061B \u0635\u0628\u062D \u0648 \u0639\u0635\u0631 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0645\u0634\u062A\u0631\u06A9\u200C\u0647\u0627\u06CC \u062E\u0648\u062F\u062A\u0627\u0646 \u0622\u0632\u0645\u0627\u06CC\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Her hafta ayn\u0131 g\xFCn g\xF6nderin; kendi listeniz i\xE7in sabah\u0131 ak\u015Famla kar\u015F\u0131la\u015Ft\u0131rarak test edin."
    },
    craft: [
      {
        en: "The subject line and preview text are the hook; say what the reader gets.",
        fa: "\u0639\u0646\u0648\u0627\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0648 \u0645\u062A\u0646 \u067E\u06CC\u0634\u200C\u0646\u0645\u0627\u06CC\u0634\u060C \u0642\u0644\u0627\u0628 \u0634\u0645\u0627 \u0647\u0633\u062A\u0646\u062F\u061B \u0628\u06AF\u0648\u06CC\u06CC\u062F \u062E\u0648\u0627\u0646\u0646\u062F\u0647 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0628\u0647 \u062F\u0633\u062A \u0645\u06CC\u200C\u0622\u0648\u0631\u062F.",
        tr: "Konu sat\u0131r\u0131 ve \xF6nizleme metni kancad\u0131r; okurun ne kazanaca\u011F\u0131n\u0131 s\xF6yleyin."
      },
      {
        en: "One main idea and one main call to action per issue.",
        fa: "\u062F\u0631 \u0647\u0631 \u0634\u0645\u0627\u0631\u0647 \u06CC\u06A9 \u0627\u06CC\u062F\u0647\u0654 \u0627\u0635\u0644\u06CC \u0648 \u06CC\u06A9 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645 \u0627\u0635\u0644\u06CC.",
        tr: "Her say\u0131da tek ana fikir ve tek ana eylem \xE7a\u011Fr\u0131s\u0131."
      },
      {
        en: "Write to one person and ask for replies; replies help deliverability and give you ideas.",
        fa: "\u0637\u0648\u0631\u06CC \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u06A9\u0647 \u0627\u0646\u06AF\u0627\u0631 \u0628\u0631\u0627\u06CC \u06CC\u06A9 \u0646\u0641\u0631 \u0645\u06CC\u200C\u0646\u0648\u06CC\u0633\u06CC\u062F \u0648 \u0627\u0632 \u062E\u0648\u0627\u0646\u0646\u062F\u0647 \u0628\u062E\u0648\u0627\u0647\u06CC\u062F \u062C\u0648\u0627\u0628 \u0628\u062F\u0647\u062F\u061B \u062C\u0648\u0627\u0628\u200C\u0647\u0627 \u0647\u0645 \u0628\u0647 \u0631\u0633\u06CC\u062F\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F \u0647\u0645 \u0627\u06CC\u062F\u0647 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F.",
        tr: "Tek bir ki\u015Fiye yazar gibi yaz\u0131n ve yan\u0131t isteyin; yan\u0131tlar hem ula\u015F\u0131labilirli\u011Fe yard\u0131m eder hem fikir verir."
      },
      {
        en: "Keep a consistent format so readers know what to expect.",
        fa: "\u0642\u0627\u0644\u0628 \u062B\u0627\u0628\u062A\u06CC \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u06CC\u062F \u062A\u0627 \u062E\u0648\u0627\u0646\u0646\u062F\u0647 \u0628\u062F\u0627\u0646\u062F \u0686\u0647 \u0627\u0646\u062A\u0638\u0627\u0631\u06CC \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F.",
        tr: "Okurlar\u0131n ne bekleyece\u011Fini bilmesi i\xE7in tutarl\u0131 bir format kullan\u0131n."
      }
    ]
  },
  {
    channel: "blog",
    basis: "general_practice",
    role: {
      en: "Search and depth: articles that answer your audience's questions and that other channels can link to.",
      fa: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u0648 \u0639\u0645\u0642: \u0645\u0642\u0627\u0644\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0647 \u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u0645\u062E\u0627\u0637\u0628 \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F \u0648 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0628\u0647 \u0622\u0646\u200C\u0647\u0627 \u0644\u06CC\u0646\u06A9 \u0628\u062F\u0647\u0646\u062F.",
      tr: "Arama ve derinlik: hedef kitlenizin sorular\u0131n\u0131 yan\u0131tlayan ve di\u011Fer kanallar\u0131n ba\u011Flant\u0131 verebilece\u011Fi makaleler."
    },
    formats: ["article"],
    cadence: { per: "month", min: 2, max: 8, start: 4 },
    objective: "authority",
    mix: mix({ educate: 70, inspire: 10, promote: 20 }),
    kpis: [
      { metric: "reach", per: "post" },
      { metric: "link_clicks", per: "post" },
      { metric: "leads", per: "month" }
    ],
    posting_windows_note: {
      en: "Timing matters little because search traffic builds over months; publish on a steady rhythm.",
      fa: "\u0632\u0645\u0627\u0646 \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0647\u0645\u06CC\u062A \u0686\u0646\u062F\u0627\u0646\u06CC \u0646\u062F\u0627\u0631\u062F \u0686\u0648\u0646 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u062C\u0633\u062A\u200C\u0648\u062C\u0648 \u062F\u0631 \u0637\u0648\u0644 \u0645\u0627\u0647\u200C\u0647\u0627 \u0634\u06A9\u0644 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F\u061B \u0628\u0627 \u0631\u06CC\u062A\u0645\u06CC \u062B\u0627\u0628\u062A \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u06CC\u062F.",
      tr: "Arama trafi\u011Fi aylar i\xE7inde olu\u015Ftu\u011Fu i\xE7in zamanlama pek \xF6nemli de\u011Fildir; d\xFCzenli bir ritimle yay\u0131nlay\u0131n."
    },
    craft: [
      {
        en: "One question per article: answer it early, then explain.",
        fa: "\u0647\u0631 \u0645\u0642\u0627\u0644\u0647 \u06CC\u06A9 \u067E\u0631\u0633\u0634: \u062C\u0648\u0627\u0628 \u0631\u0627 \u0632\u0648\u062F \u0628\u062F\u0647\u06CC\u062F \u0648 \u0628\u0639\u062F \u062A\u0648\u0636\u06CC\u062D \u062F\u0647\u06CC\u062F.",
        tr: "Her makalede tek soru: cevab\u0131 erken verin, sonra a\xE7\u0131klay\u0131n."
      },
      {
        en: "Headings that read like the questions people ask.",
        fa: "\u062A\u06CC\u062A\u0631\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0634\u0628\u06CC\u0647 \u0647\u0645\u0627\u0646 \u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC\u06CC \u0628\u0627\u0634\u0646\u062F \u06A9\u0647 \u0645\u0631\u062F\u0645 \u0645\u06CC\u200C\u067E\u0631\u0633\u0646\u062F.",
        tr: "\u0130nsanlar\u0131n sordu\u011Fu sorular gibi okunan ara ba\u015Fl\u0131klar."
      },
      {
        en: "Back every claim with an approved fact or a cited source.",
        fa: "\u0647\u0631 \u0627\u062F\u0639\u0627 \u0631\u0627 \u0628\u0627 \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u06CC\u0627 \u0645\u0646\u0628\u0639\u06CC \u06A9\u0647 \u0628\u0647 \u0622\u0646 \u0627\u0631\u062C\u0627\u0639 \u062F\u0627\u062F\u0647\u200C\u0627\u06CC\u062F \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u06A9\u0646\u06CC\u062F.",
        tr: "Her iddiay\u0131 onayl\u0131 bir bilgiyle ya da at\u0131f yap\u0131lan bir kaynakla destekleyin."
      },
      {
        en: "Link related articles to each other and turn each article into a few social posts.",
        fa: "\u0645\u0642\u0627\u0644\u0647\u200C\u0647\u0627\u06CC \u0645\u0631\u062A\u0628\u0637 \u0631\u0627 \u0628\u0647 \u0647\u0645 \u0644\u06CC\u0646\u06A9 \u062F\u0647\u06CC\u062F \u0648 \u0647\u0631 \u0645\u0642\u0627\u0644\u0647 \u0631\u0627 \u0628\u0647 \u0686\u0646\u062F \u067E\u0633\u062A \u0634\u0628\u06A9\u0647\u0654 \u0627\u062C\u062A\u0645\u0627\u0639\u06CC \u062A\u0628\u062F\u06CC\u0644 \u06A9\u0646\u06CC\u062F.",
        tr: "\u0130lgili makaleleri birbirine ba\u011Flay\u0131n ve her makaleyi birka\xE7 sosyal medya g\xF6nderisine d\xF6n\xFC\u015Ft\xFCr\xFCn."
      }
    ]
  }
];
var CHANNEL_PLAYBOOK = Object.fromEntries(ENTRIES.map((entry) => [entry.channel, entry]));
function playbookFor(channel) {
  return CHANNEL_PLAYBOOK[channel] ?? null;
}
var PLAYBOOK_NOTICE = {
  en: [
    "General practice for this kind of channel, not measured for this brand. Every value is a starting point the owner reviews and replaces with what the brand\u2019s own results show.",
    "It is not a brand fact: voice, claims and audience come only from approved facts. KPIs name what to watch; targets are the owner\u2019s.",
    "It authorizes nothing: no post, schedule, publication or spend."
  ],
  fa: [
    "\u0627\u06CC\u0646\u200C\u0647\u0627 \u0631\u0648\u0627\u0644 \u0631\u0627\u06CC\u062C \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0646\u0648\u0639 \u06A9\u0627\u0646\u0627\u0644 \u0627\u0633\u062A \u0648 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0646\u0634\u062F\u0647. \u0647\u0631 \u0645\u0642\u062F\u0627\u0631 \u0641\u0642\u0637 \u0646\u0642\u0637\u0647\u0654 \u0634\u0631\u0648\u0639\u06CC \u0627\u0633\u062A \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0628\u0631\u0631\u0633\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0648\u0642\u062A\u06CC \u0646\u062A\u0627\u06CC\u062C \u062E\u0648\u062F \u0628\u0631\u0646\u062F \u0622\u0645\u062F\u060C \u0628\u0627 \u0622\u0646\u200C\u0647\u0627 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    "\u0627\u06CC\u0646 \u0648\u0627\u0642\u0639\u06CC\u062A\u0650 \u0628\u0631\u0646\u062F \u0646\u06CC\u0633\u062A: \u0644\u062D\u0646\u060C \u0627\u062F\u0639\u0627\u0647\u0627 \u0648 \u0645\u062E\u0627\u0637\u0628 \u0641\u0642\u0637 \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0645\u06CC\u200C\u0622\u06CC\u0646\u062F. \u0634\u0627\u062E\u0635\u200C\u0647\u0627 \u0641\u0642\u0637 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u0646\u062F \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0631\u0627 \u0632\u06CC\u0631 \u0646\u0638\u0631 \u0628\u06AF\u06CC\u0631\u06CC\u062F\u061B \u0647\u062F\u0641 \u0639\u062F\u062F\u06CC \u0631\u0627 \u0645\u0627\u0644\u06A9 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    "\u0647\u06CC\u0686 \u0645\u062C\u0648\u0632\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F: \u0646\u0647 \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u0646\u0647 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0646\u0647 \u0647\u0632\u06CC\u0646\u0647."
  ],
  tr: [
    "Bu t\xFCr bir kanal i\xE7in genel uygulamad\u0131r; bu marka i\xE7in \xF6l\xE7\xFClmemi\u015Ftir. Her de\u011Fer, sahibin g\xF6zden ge\xE7irdi\u011Fi ve markan\u0131n kendi sonu\xE7lar\u0131yla de\u011Fi\u015Ftirdi\u011Fi bir ba\u015Flang\u0131\xE7 noktas\u0131d\u0131r.",
    "Marka bilgisi de\u011Fildir: ses tonu, iddialar ve hedef kitle yaln\u0131zca onayl\u0131 bilgilerden gelir. KPI\u2019lar neyin izlenece\u011Fini s\xF6yler; hedefler sahibindir.",
    "Hi\xE7bir \u015Feye yetki vermez: g\xF6nderi, zamanlama, yay\u0131n veya harcama yok."
  ]
};
var OBJECTIVE_LABELS = {
  awareness: { en: "awareness", fa: "\u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646", tr: "bilinirlik" },
  engagement: { en: "engagement", fa: "\u062A\u0639\u0627\u0645\u0644", tr: "etkile\u015Fim" },
  community: { en: "community", fa: "\u062C\u0627\u0645\u0639\u0647\u200C\u0633\u0627\u0632\u06CC", tr: "topluluk" },
  leads: { en: "leads", fa: "\u062C\u0630\u0628 \u0645\u0634\u062A\u0631\u06CC \u0628\u0627\u0644\u0642\u0648\u0647", tr: "potansiyel m\xFC\u015Fteri" },
  sales: { en: "sales", fa: "\u0641\u0631\u0648\u0634", tr: "sat\u0131\u015F" },
  authority: { en: "authority", fa: "\u0627\u0639\u062A\u0628\u0627\u0631 \u0648 \u0645\u0631\u062C\u0639\u06CC\u062A", tr: "otorite" },
  retention: { en: "retention", fa: "\u062D\u0641\u0638 \u0645\u062E\u0627\u0637\u0628", tr: "elde tutma" }
};
var MIX_LABELS = {
  educate: { en: "educate", fa: "\u0622\u0645\u0648\u0632\u0634", tr: "e\u011Fitmek" },
  inspire: { en: "inspire", fa: "\u0627\u0644\u0647\u0627\u0645\u200C\u0628\u062E\u0634\u06CC", tr: "ilham vermek" },
  connect: { en: "connect", fa: "\u0627\u0631\u062A\u0628\u0627\u0637", tr: "ba\u011F kurmak" },
  promote: { en: "promote", fa: "\u0645\u0639\u0631\u0641\u06CC \u0648 \u0641\u0631\u0648\u0634", tr: "tan\u0131tmak" },
  entertain: { en: "entertain", fa: "\u0633\u0631\u06AF\u0631\u0645\u06CC", tr: "e\u011Flendirmek" }
};
var KPI_LABELS = {
  reach: { en: "reach", fa: "\u062F\u0633\u062A\u0631\u0633\u06CC", tr: "eri\u015Fim" },
  saves: { en: "saves", fa: "\u0630\u062E\u06CC\u0631\u0647", tr: "kaydetme" },
  shares: { en: "shares", fa: "\u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC", tr: "payla\u015F\u0131m" },
  comments: { en: "comments", fa: "\u06A9\u0627\u0645\u0646\u062A", tr: "yorum" },
  follows: { en: "new followers", fa: "\u062F\u0646\u0628\u0627\u0644\u200C\u06A9\u0646\u0646\u062F\u0647\u0654 \u062A\u0627\u0632\u0647", tr: "yeni takip\xE7i" },
  profile_visits: { en: "profile visits", fa: "\u0628\u0627\u0632\u062F\u06CC\u062F \u067E\u0631\u0648\u0641\u0627\u06CC\u0644", tr: "profil ziyareti" },
  link_clicks: { en: "link clicks", fa: "\u06A9\u0644\u06CC\u06A9 \u0631\u0648\u06CC \u0644\u06CC\u0646\u06A9", tr: "ba\u011Flant\u0131 t\u0131klamas\u0131" },
  leads: { en: "leads", fa: "\u0633\u0631\u0646\u062E \u0641\u0631\u0648\u0634", tr: "potansiyel m\xFC\u015Fteri" },
  watch_time: { en: "watch time", fa: "\u0632\u0645\u0627\u0646 \u062A\u0645\u0627\u0634\u0627", tr: "izlenme s\xFCresi" },
  completion_rate: { en: "completion rate", fa: "\u0646\u0631\u062E \u062A\u0645\u0627\u0634\u0627\u06CC \u06A9\u0627\u0645\u0644", tr: "tamamlanma oran\u0131" },
  replies: { en: "replies", fa: "\u067E\u0627\u0633\u062E", tr: "yan\u0131t" },
  subscribers: { en: "subscribers", fa: "\u0645\u0634\u062A\u0631\u06A9", tr: "abone" }
};
var PERIOD_LABELS = {
  post: { en: "per post", fa: "\u062F\u0631 \u0647\u0631 \u067E\u0633\u062A", tr: "g\xF6nderi ba\u015F\u0131na" },
  week: { en: "per week", fa: "\u062F\u0631 \u0647\u0641\u062A\u0647", tr: "haftal\u0131k" },
  month: { en: "per month", fa: "\u062F\u0631 \u0645\u0627\u0647", tr: "ayl\u0131k" }
};
var PLAYBOOK_TEXT = {
  header: { en: "Channel playbook (general practice, not measured for this brand)", fa: "\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 (\u0631\u0648\u0627\u0644 \u0631\u0627\u06CC\u062C\u060C \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0646\u0634\u062F\u0647)", tr: "Kanal rehberi (genel uygulama, bu marka i\xE7in \xF6l\xE7\xFClmedi)" },
  role: { en: "Role", fa: "\u0646\u0642\u0634", tr: "Rol" },
  formats: { en: "Formats", fa: "\u0642\u0627\u0644\u0628\u200C\u0647\u0627", tr: "Formatlar" },
  cadence: { en: "Cadence", fa: "\u062A\u0646\u0627\u0648\u0628 \u0627\u0646\u062A\u0634\u0627\u0631", tr: "S\u0131kl\u0131k" },
  cadence_value: { en: "{min}\u2013{max} per {per}, start at {start}", fa: "{min} \u062A\u0627 {max} \u062F\u0631 {per}\u060C \u0634\u0631\u0648\u0639 \u0628\u0627 {start}", tr: "{per} ba\u015F\u0131na {min}\u2013{max}, {start} ile ba\u015Flay\u0131n" },
  objective: { en: "Objective", fa: "\u0647\u062F\u0641", tr: "Hedef" },
  mix: { en: "Mix", fa: "\u062A\u0631\u06A9\u06CC\u0628 \u0645\u062D\u062A\u0648\u0627", tr: "\u0130\xE7erik kar\u0131\u015F\u0131m\u0131" },
  kpis: { en: "Watch", fa: "\u0634\u0627\u062E\u0635\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0627\u06CC\u062F \u0632\u06CC\u0631 \u0646\u0638\u0631 \u0628\u06AF\u06CC\u0631\u06CC\u062F", tr: "\u0130zlenecekler" },
  windows: { en: "Posting windows", fa: "\u0632\u0645\u0627\u0646 \u0627\u0646\u062A\u0634\u0627\u0631", tr: "Payla\u015F\u0131m saatleri" },
  craft: { en: "Craft notes", fa: "\u0646\u06A9\u062A\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u0631\u0627\u06CC\u06CC", tr: "Uygulama notlar\u0131" },
  week: { en: "week", fa: "\u0647\u0641\u062A\u0647", tr: "hafta" },
  month: { en: "month", fa: "\u0645\u0627\u0647", tr: "ay" },
  no_entry: {
    en: "The playbook has no entry for {channel}. Channels with an entry: {list}.",
    fa: "\u0631\u0627\u0647\u0646\u0645\u0627 \u0628\u0631\u0627\u06CC {channel} \u0645\u0648\u0631\u062F\u06CC \u0646\u062F\u0627\u0631\u062F. \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0648\u0631\u062F \u062F\u0627\u0631\u0646\u062F: {list}.",
    tr: "Rehberde {channel} i\xE7in bir kay\u0131t yok. Kayd\u0131 olan kanallar: {list}."
  }
};
function localizeEntry(entry, lang) {
  return {
    channel: entry.channel,
    basis: entry.basis,
    role: entry.role[lang],
    formats: [...entry.formats],
    cadence: { ...entry.cadence },
    objective: { id: entry.objective, label: OBJECTIVE_LABELS[entry.objective][lang] },
    mix: entry.mix.map((m) => ({ ...m, label: MIX_LABELS[m.type][lang] })),
    kpis: entry.kpis.map((k) => ({ metric: k.metric, per: k.per, target: null, label: `${KPI_LABELS[k.metric][lang]} (${PERIOD_LABELS[k.per][lang]})` })),
    posting_windows_note: entry.posting_windows_note[lang],
    craft: entry.craft.map((note) => note[lang])
  };
}
function playbookDocument(lang, channel) {
  let entries = ENTRIES;
  if (channel) {
    const entry = playbookFor(channel);
    if (!entry) throw new StrategyError("not_found", PLAYBOOK_TEXT.no_entry[lang].replace("{channel}", channel).replace("{list}", ENTRIES.map((e) => e.channel).join(", ")));
    entries = [entry];
  }
  return { schema: CONTENT_PLAYBOOK_SCHEMA, kind: "content_playbook", basis: "general_practice", lang, entries: entries.map((entry) => localizeEntry(entry, lang)), authorizes: [], notice: PLAYBOOK_NOTICE[lang] };
}
function playbookProblems() {
  const out = [];
  for (const entry of ENTRIES) {
    const total = entry.mix.reduce((sum, m) => sum + m.share, 0);
    if (total !== 100) out.push(`${entry.channel}: mix sums to ${total}`);
    if (!CHANNEL_OBJECTIVES.includes(entry.objective)) out.push(`${entry.channel}: objective`);
    for (const k of entry.kpis) if (!CHANNEL_KPI_METRICS.includes(k.metric)) out.push(`${entry.channel}: kpi ${k.metric}`);
    if (entry.craft.length < 3 || entry.craft.length > 6) out.push(`${entry.channel}: ${entry.craft.length} craft notes`);
    if (entry.cadence.start < entry.cadence.min || entry.cadence.start > entry.cadence.max) out.push(`${entry.channel}: cadence start`);
    if (entry.kpis.length > 6) out.push(`${entry.channel}: too many kpis`);
  }
  return out;
}

// packages/brand-core/src/content-bridge/sources.ts
import fs3 from "node:fs";
import path4 from "node:path";
var CONTENT_SOURCES = [
  { id: "brand.verbal.voice", role: "voice" },
  { id: "brand.verbal.voice_pairs", role: "voice" },
  { id: "brand.personality.traits", role: "voice" },
  { id: "brand.verbal.name_use", role: "voice" },
  { id: "personal.content.channel_tone", role: "voice", personal: true },
  { id: "brand.verbal.forbidden", role: "claims" },
  { id: "business.marketing.availability_claim", role: "claims" },
  { id: "personal.governance.public_claim_policy", role: "claims", personal: true },
  { id: "business.customer.primary_segment", role: "audience" },
  { id: "business.sales.buyer", role: "audience" },
  { id: "personal.positioning.primary_audience", role: "audience", personal: true },
  { id: "brand.strategy.promise", role: "messaging" },
  { id: "brand.strategy.differentiation", role: "messaging" },
  { id: "business.offer.value_proposition", role: "messaging" },
  { id: "brand.verbal.tagline", role: "messaging" },
  { id: "personal.positioning.known_for", role: "messaging", personal: true },
  { id: "business.marketing.pillars", role: "pillars" },
  { id: "personal.content.pillars", role: "pillars", personal: true },
  { id: "business.marketing.channels", role: "channels" },
  { id: "brand.social.channels", role: "channels" },
  { id: "personal.content.channels", role: "channels", personal: true },
  { id: "business.offer.summary", role: "offers" },
  { id: "brand.campaign.offer_source", role: "offers" },
  { id: "personal.services.offers", role: "offers", personal: true },
  { id: "brand.social.cta", role: "cta" },
  { id: "personal.consulting.cta", role: "cta", personal: true },
  { id: "brand.verbal.localization", role: "languages" },
  { id: "brand.social.localization", role: "languages" },
  { id: "business.marketing.objective", role: "objective" },
  { id: "personal.goals.outcomes", role: "objective", personal: true }
];
function brandSettings(ws) {
  try {
    const file2 = path4.join(ws.root, "brand", "brand.config.yaml");
    const config = fs3.existsSync(file2) ? readYaml(file2) : null;
    const locale = config?.brand?.default_locale;
    return { personal: config?.modules?.personal?.enabled === true, default_locale: typeof locale === "string" && /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(locale) ? locale : "en" };
  } catch {
    return { personal: false, default_locale: "en" };
  }
}
function activeSources(settings) {
  return CONTENT_SOURCES.filter((source) => !source.personal || settings.personal);
}
var PLACEHOLDER_WORD = /\b(?:TBD|TODO|EXAMPLE|PLACEHOLDER|LOREM)\b/i;
var PLACEHOLDER_HEADS = /* @__PURE__ */ new Set(["none", "none yet", "unknown", "undecided", "not decided", "not yet", "n/a", "na", "\u0646\u0627\u0645\u0634\u062E\u0635", "\u0647\u06CC\u0686", "\u0646\u062F\u0627\u0631\u062F", "\u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647", "yok", "bilinmiyor", "belirsiz", "hen\xFCz yok"]);
function isPlaceholderValue(value) {
  if (value === null || value === void 0) return true;
  const textValue = (typeof value === "string" ? value : JSON.stringify(value)).normalize("NFC").trim();
  if (!textValue) return true;
  if (PLACEHOLDER_WORD.test(textValue)) return true;
  const words2 = textValue.toLowerCase().split(/[\s.,;:!?،؛—–-]+/u).filter(Boolean);
  return PLACEHOLDER_HEADS.has(words2.slice(0, 2).join(" ")) || PLACEHOLDER_HEADS.has(words2[0] ?? "");
}
function sourceState(fact, brandSlug) {
  if (!fact || fact.status !== "approved" || fact.brand_id !== brandSlug || !fact.revision_hash) return "missing";
  if (fact.classification === "restricted") return "restricted";
  return isPlaceholderValue(fact.value) ? "placeholder" : "approved";
}
function readSources(ws, settings = brandSettings(ws), facts = readFacts(ws.root, "approved", ws.brandSlug)) {
  return activeSources(settings).map((source) => {
    const fact = facts[source.id];
    const state = sourceState(fact, ws.brandSlug);
    return { fact_id: source.id, role: source.role, state, revision: state === "approved" || state === "placeholder" ? fact.revision_hash : null };
  });
}
function roleGaps(reports) {
  const out = [];
  for (const role of CONTENT_SOURCE_ROLES) {
    const mine = reports.filter((r) => r.role === role && r.state !== "restricted");
    if (mine.some((r) => r.state === "approved")) continue;
    const placeholders = mine.filter((r) => r.state === "placeholder");
    out.push(placeholders.length ? { role, reason: "placeholder", fact_ids: placeholders.map((r) => r.fact_id) } : { role, reason: "not_approved", fact_ids: mine.map((r) => r.fact_id) });
  }
  return out;
}
function splitItems(value) {
  let parts = value.split(/\r?\n|[;؛•·|]/u);
  if (parts.length === 1) {
    const commas = value.split(/[,،]/u);
    if (commas.length > 1 && commas.every((part) => part.trim().length <= 40)) parts = commas;
  }
  return parts.map(
    (part) => part.replace(/^\s*(?:[-*–]|\d+[.)])\s*/u, "").trim().replace(/[.。]$/u, "").trim()
  ).filter(Boolean);
}
var CHANNEL_WORDS = [
  ["instagram", /instagram|\binsta\b|اینستاگرام|اینستا/iu],
  ["x", /twitter|\bx\.com\b|\bX\b|توییتر|توئیتر/u],
  ["x", /\btwitter\b/i],
  ["linkedin", /linked\s?in|لینکدین|لینکداین/iu],
  ["facebook", /facebook|فیسبوک|فیس‌بوک/iu],
  ["tiktok", /tik\s?tok|تیک\s?‌?تاک/iu],
  ["youtube", /you\s?tube|یوتیوب|یوتوب/iu],
  ["threads", /\bThreads\b|threads\.net/u],
  ["telegram", /telegram|تلگرام/iu],
  ["pinterest", /pinterest|پینترست/iu],
  ["newsletter", /newsletter|\be-?mail\b|خبرنامه|ایمیل|bülten|e-?posta/iu],
  ["blog", /\bblog|وبلاگ|بلاگ/iu],
  ["podcast", /podcast|پادکست/iu],
  ["website", /\bweb\s?site\b|وب‌?سایت|وبسایت|web sitesi/iu]
];
var NEGATION = /\b(?:no|not|without|never|don'?t|doesn'?t|isn'?t|aren'?t|except|stopped|paused|later|maybe|değil|yok|hayır|olmadan|asla)\b|(?:^|\s)(?:نه|بدون|هرگز|نمی|نیست|فعلا|فعلاً)/iu;
function detectChannels(value) {
  const found = [];
  for (const clause of value.split(/[.;،؛,\n]|\bbut\b|\bama\b|\bfakat\b|\sولی\s|\sاما\s/iu)) {
    if (!clause.trim() || NEGATION.test(clause)) continue;
    for (const [channel, pattern] of CHANNEL_WORDS) if (pattern.test(clause) && !found.includes(channel)) found.push(channel);
  }
  return found;
}

// packages/brand-core/src/content-bridge/propose.ts
function gapText(gap, lang) {
  const facts = gap.fact_ids.join(", ") || "\u2014";
  const channel = /^channels\[([a-z]+)\]\.(role|formats|cadence)$/.exec(gap.field);
  if (channel) return fill(GAP_TEXT[`channel_${channel[2]}`][lang], { channel: channel[1], part: CHANNEL_PARTS[channel[2]][lang] });
  if (gap.field === "pillars" && gap.reason === "owner_decision") return fill(GAP_TEXT.pillars_unnamed[lang], { facts });
  if (gap.field === "channels" && gap.reason === "owner_decision") return fill(GAP_TEXT.channels_none[lang], { facts });
  const role = ROLE_LABELS[gap.field]?.[lang] ?? gap.field;
  return fill(GAP_TEXT[gap.reason][lang], { role, facts });
}
function describeGap(gap, lang) {
  return gapText(gap, lang);
}
function day(date, plus) {
  return new Date(date.getTime() + plus * 864e5).toISOString().slice(0, 10);
}
function pillarsFrom(reports, values, notes, lang) {
  const pillars = [];
  for (const report of reports.filter((r) => r.role === "pillars" && r.state === "approved")) {
    const value = values[report.fact_id];
    if (typeof value !== "string") continue;
    let skipped = false;
    for (const item of splitItems(value)) {
      if (pillars.length >= STRATEGY_LIMITS.maxPillars) break;
      let name;
      try {
        name = text(item, "pillar", 80);
      } catch (error) {
        if (!(error instanceof StrategyError)) throw error;
        skipped = true;
        continue;
      }
      if (pillars.some((p) => p.name.toLowerCase() === name.toLowerCase())) continue;
      pillars.push({ id: `p${pillars.length + 1}`, name, fact_refs: [report.fact_id] });
    }
    if (skipped) notes.push(fill(NOTES.pillar_skipped[lang], { id: report.fact_id }));
  }
  return pillars;
}
function servedStrategies(ws) {
  const out = [];
  const now = ws.now();
  for (const record of scanRecords(ws)) {
    if (record.type === "content") continue;
    const found = servable(ws, record, now);
    if (found.entry) out.push({ strategy_id: record.strategy_id, revision: found.entry.revision, content_sha256: found.entry.content_sha256 });
  }
  return out;
}
function buildContentStrategy(ws, opts) {
  assertOwnerProcess();
  const lang = opts.lang;
  const settings = brandSettings(ws);
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  const reports = readSources(ws, settings, facts);
  const values = Object.fromEntries(reports.filter((r) => r.state === "approved").map((r) => [r.fact_id, facts[r.fact_id].value]));
  const notes = [];
  const gaps = roleGaps(reports).map((gap) => ({ field: gap.role, reason: gap.reason, fact_ids: gap.fact_ids }));
  const sources = Object.fromEntries(CONTENT_SOURCE_ROLES.map((role) => [role, reports.filter((r) => r.role === role && r.state === "approved").map((r) => r.fact_id)]));
  const pillars = pillarsFrom(reports, values, notes, lang);
  if (!pillars.length && sources.pillars.length) gaps.push({ field: "pillars", reason: "owner_decision", fact_ids: sources.pillars });
  const channelFacts = reports.filter((r) => r.role === "channels" && r.state === "approved");
  const mentions = /* @__PURE__ */ new Map();
  for (const report of channelFacts) {
    const value = values[report.fact_id];
    if (typeof value !== "string") continue;
    for (const channel of detectChannels(value)) mentions.set(channel, [...mentions.get(channel) ?? [], report.fact_id]);
  }
  const detected = CONTENT_CHANNELS.filter((channel) => mentions.has(channel));
  const chosen = opts.channels?.length ? [...new Set(opts.channels)] : detected;
  if (!opts.channels?.length && detected.length) notes.push(fill(NOTES.channels_detected[lang], { list: detected.join(", ") }));
  if (!chosen.length) gaps.push({ field: "channels", reason: "owner_decision", fact_ids: reports.filter((r) => r.role === "channels" && r.state !== "restricted").map((r) => r.fact_id) });
  const fromPlaybook = [];
  const channels = chosen.map((channel) => {
    const refs = mentions.get(channel) ?? [];
    if (opts.channels?.length && !refs.length) notes.push(fill(NOTES.channel_not_in_facts[lang], { channel }));
    const entry = opts.playbook ? playbookFor(channel) : null;
    if (opts.playbook && !entry) notes.push(fill(PLAYBOOK_NOTES.none[lang], { channel }));
    const formats = [...new Set(opts.formats?.[channel] ?? entry?.formats ?? [])];
    const cadence = opts.cadence?.[channel] ?? (entry ? { per: entry.cadence.per, target: entry.cadence.start } : null);
    const role = entry ? entry.role[lang] : null;
    if (!role) gaps.push({ field: `channels[${channel}].role`, reason: "owner_decision", fact_ids: [] });
    if (!formats.length) gaps.push({ field: `channels[${channel}].formats`, reason: "owner_decision", fact_ids: [] });
    if (!cadence) gaps.push({ field: `channels[${channel}].cadence`, reason: "owner_decision", fact_ids: [] });
    const plan = { channel, role, formats, cadence, languages: [], pillars: [], fact_refs: refs };
    if (entry) {
      const filled = ["role", ...opts.formats?.[channel] ? [] : ["formats"], ...opts.cadence?.[channel] ? [] : ["cadence"], "objective", "mix", "kpis"];
      notes.push(fill(PLAYBOOK_NOTES.filled[lang], { channel, list: filled.join(", ") }));
      fromPlaybook.push(channel);
      plan.objective = entry.objective;
      plan.mix = entry.mix.map((m) => ({ ...m }));
      plan.kpis = entry.kpis.map((k) => ({ metric: k.metric, target: null, per: k.per }));
    }
    return plan;
  });
  const languages = opts.languages?.length ? [...new Set(opts.languages)] : [settings.default_locale];
  if (!opts.languages?.length) notes.push(fill(NOTES.languages_default[lang], { lang: settings.default_locale }));
  const strategyRefs = servedStrategies(ws);
  if (strategyRefs.length) notes.push(fill(NOTES.strategies_pinned[lang], { list: strategyRefs.map((r) => `${r.strategy_id}@${r.revision}`).join(", ") }));
  notes.push(NOTES.voice_not_copied[lang]);
  const block = {
    schema: 1,
    languages,
    pillars,
    channels,
    sources,
    voice_rules: { do: [], dont: [] },
    vocabulary: { prefer: [], avoid: [] },
    banned_claims: [],
    cta_rules: [],
    strategy_refs: strategyRefs,
    gaps: gaps.slice(0, STRATEGY_LIMITS.maxGaps)
  };
  const factIds = [.../* @__PURE__ */ new Set([...Object.values(sources).flat(), ...pillars.flatMap((p) => p.fact_refs), ...channels.flatMap((c) => c.fact_refs)])];
  const now = ws.now();
  const proposal = {
    title: PROPOSAL_TEXT.title[lang],
    type: "content",
    locale: lang,
    scope: { markets: opts.markets?.length ? opts.markets : [settings.default_locale], channel: "content", period: null },
    valid_from: day(now, 0),
    valid_until: day(now, opts.valid_days ?? 180),
    review_due_at: day(now, opts.review_days ?? 90),
    objective: { statement: PROPOSAL_TEXT.objective[lang], status: "hypothesis" },
    success_metrics: [],
    guardrails: [PROPOSAL_TEXT.guardrail_facts[lang], PROPOSAL_TEXT.guardrail_voice[lang]],
    constraints: [],
    must_do: [],
    must_not_do: [],
    non_goals: [PROPOSAL_TEXT.non_goal_publish[lang], PROPOSAL_TEXT.non_goal_ads[lang]],
    alternatives: [],
    selection_rationale: PROPOSAL_TEXT.rationale[lang],
    recommendations: [],
    fact_refs: factIds,
    evidence_refs: [],
    assumptions: fromPlaybook.length ? [fill(PLAYBOOK_NOTES.assumption[lang], { list: fromPlaybook.join(", ") })] : [],
    open_questions: [],
    restricted: null,
    origin: { kind: "manual" },
    content_strategy: block
  };
  parseProposal(proposal);
  return { proposal, block, sources: reports, gaps: block.gaps.map((gap) => ({ ...gap, text: gapText(gap, lang) })), detected_channels: detected, notes };
}
var PLAYBOOK_NOTES = {
  filled: {
    en: "{channel}: {list} come from the general-practice channel playbook, not from this brand\u2019s results. Review them before approving.",
    fa: "{channel}: {list} \u0627\u0632 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 (\u0631\u0648\u0627\u0644 \u0631\u0627\u06CC\u062C) \u0622\u0645\u062F\u0647\u060C \u0646\u0647 \u0627\u0632 \u0646\u062A\u0627\u06CC\u062C \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F. \u067E\u06CC\u0634 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u0627\u0646 \u06A9\u0646\u06CC\u062F.",
    tr: "{channel}: {list} genel uygulama kanal rehberinden geliyor, bu markan\u0131n sonu\xE7lar\u0131ndan de\u011Fil. Onaylamadan \xF6nce g\xF6zden ge\xE7irin."
  },
  none: {
    en: "{channel}: the channel playbook has no entry; its role, formats and cadence stay owner decisions.",
    fa: "{channel}: \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u06A9\u0627\u0646\u0627\u0644 \u0645\u0648\u0631\u062F\u06CC \u0646\u062F\u0627\u0631\u062F\u061B \u0646\u0642\u0634\u060C \u0642\u0627\u0644\u0628\u200C\u0647\u0627 \u0648 \u062A\u0646\u0627\u0648\u0628 \u0622\u0646 \u0631\u0627 \u0645\u0627\u0644\u06A9 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "{channel}: kanal rehberinde kay\u0131t yok; rol\xFC, formatlar\u0131 ve s\u0131kl\u0131\u011F\u0131 sahibin karar\u0131 olarak kal\u0131r."
  },
  assumption: {
    en: "Channel plans for {list} start from the general-practice playbook, not from measured results of this brand.",
    fa: "\u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC {list} \u0627\u0632 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u0631\u0648\u0627\u0644 \u0631\u0627\u06CC\u062C \u0634\u0631\u0648\u0639 \u0634\u062F\u0647\u060C \u0646\u0647 \u0627\u0632 \u0646\u062A\u0627\u06CC\u062C \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC\u200C\u0634\u062F\u0647\u0654 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F.",
    tr: "{list} kanal planlar\u0131 bu markan\u0131n \xF6l\xE7\xFClm\xFC\u015F sonu\xE7lar\u0131ndan de\u011Fil, genel uygulama rehberinden ba\u015Flar."
  }
};
function parseCadence(value) {
  const out = {};
  for (const part of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const match = /^([a-z]+)=(\d{1,2})\/(week|month)$/.exec(part);
    if (!match || !CONTENT_CHANNELS.includes(match[1])) throw new StrategyError("invalid_input", `--cadence takes channel=n/week or channel=n/month, for example instagram=3/week (got ${part}).`);
    const target = Number(match[2]);
    if (target < 1 || target > STRATEGY_LIMITS.maxCadence) throw new StrategyError("invalid_input", `--cadence target must be 1 to ${STRATEGY_LIMITS.maxCadence}.`);
    out[match[1]] = { per: match[3], target };
  }
  return out;
}
function parseFormats(value) {
  const out = {};
  for (const part of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const [channel, list2] = part.split("=");
    const formats = (list2 ?? "").split("+").filter(Boolean);
    if (!channel || !CONTENT_CHANNELS.includes(channel) || !formats.length || !formats.every((f) => CONTENT_FORMATS.includes(f))) {
      throw new StrategyError("invalid_input", `--formats takes channel=format+format, formats ${CONTENT_FORMATS.join(", ")} (got ${part}).`);
    }
    out[channel] = formats;
  }
  return out;
}
function parseChannels(value) {
  const list2 = value.split(",").map((item) => item.trim()).filter(Boolean);
  for (const item of list2) if (!CONTENT_CHANNELS.includes(item)) throw new StrategyError("invalid_input", `Unknown channel ${item}. Channels: ${CONTENT_CHANNELS.join(", ")}.`);
  return list2;
}

// packages/brand-core/src/content-bridge/projection.ts
var CONTENT_VIEW_SCHEMA = "brand-os/content-strategy-view/v1";
function valueText(fact) {
  return typeof fact.value === "string" ? fact.value : JSON.stringify(fact.value);
}
function resolve(facts, ids, brandSlug) {
  const out = [];
  for (const id of ids) {
    const fact = facts[id];
    if (!fact || fact.status !== "approved" || fact.brand_id !== brandSlug || !fact.revision_hash || fact.classification === "restricted") continue;
    out.push({ fact_id: id, revision: fact.revision_hash, value: valueText(fact) });
  }
  return out;
}
function buildView(input) {
  const block = input.content.content_strategy;
  const pick2 = (role) => resolve(input.facts, block.sources[role], input.brandId);
  const voice = pick2("voice");
  const claims = pick2("claims");
  const cta = pick2("cta");
  const doRules = [];
  const dontRules = [];
  for (const source of voice) {
    const parsed = parseStructured("voice_pairs", source.value);
    if (parsed?.type !== "voice_pairs") continue;
    for (const pair of parsed.pairs) {
      doRules.push({ text: pair.do, source: source.fact_id });
      dontRules.push({ text: pair.dont, source: source.fact_id });
    }
  }
  for (const item of block.voice_rules.do) doRules.push({ text: item, source: "strategy" });
  for (const item of block.voice_rules.dont) dontRules.push({ text: item, source: "strategy" });
  const banned = [];
  let availability = null;
  for (const source of claims) {
    if (source.fact_id === "business.marketing.availability_claim") {
      availability = source.value;
      continue;
    }
    if (source.fact_id === "brand.verbal.forbidden") for (const item of splitItems(source.value)) banned.push({ text: item, source: source.fact_id });
  }
  for (const item of block.banned_claims) banned.push({ text: item, source: "strategy" });
  const doc = {
    schema: CONTENT_VIEW_SCHEMA,
    kind: "content_strategy_view",
    brand_id: input.brandId,
    strategy_id: input.strategyId,
    revision: input.revision,
    status: input.status,
    status_reasons: input.reasons,
    digests: { content_sha256: input.content_sha256, approval_digest: input.approval.digest, source_sha256: sourceDigest(input.content) },
    approval: { approved_at: input.approval.approved_at, event_id: input.approval.event_id, actor: "owner" },
    supersedes_revision: input.supersedes_revision,
    validity: { valid_from: input.content.valid_from, valid_until: input.content.valid_until, review_due_at: input.content.review_due_at },
    languages: block.languages,
    pillars: block.pillars,
    channels: block.channels,
    voice: { sources: voice, do: doRules, dont: dontRules, vocabulary: block.vocabulary },
    claims: { sources: claims, banned, availability, availability_rule: availability ? AVAILABILITY_RULES[availability]?.[input.lang] ?? null : null },
    cta: { sources: cta, rules: block.cta_rules.map((item) => ({ text: item, source: "strategy" })) },
    audience: pick2("audience"),
    messaging: pick2("messaging"),
    offers: pick2("offers"),
    objective: pick2("objective"),
    language_sources: pick2("languages"),
    strategy_refs: block.strategy_refs,
    gaps: block.gaps.map((gap) => ({ ...gap, text: describeGap(gap, input.lang) })),
    authorizes: [],
    publication_permission: false,
    notice: VIEW_NOTICE[input.lang]
  };
  return { ...doc, digests: { ...doc.digests, view_sha256: sha256Hex(canonicalJson(doc)) } };
}
function contentStrategyView(ws, opts) {
  assertOwnerProcess();
  return servedContentViews(ws, opts);
}
function servedContentViews(ws, opts) {
  const now = opts.now ?? ws.now();
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  const views = [];
  const withheld = {};
  for (const record of scanRecords(ws)) {
    if (record.type !== "content" || opts.strategy_id && record.strategy_id !== opts.strategy_id) continue;
    const found = servable(ws, record, now);
    const drafts = record.revisions.filter((item) => item.state === "draft").length;
    if (drafts) withheld.draft = (withheld.draft ?? 0) + drafts;
    if (!found.entry || !found.result?.revision || !found.entry.approval || !found.result.revision.content.content_strategy) {
      const status = found.status;
      if (status !== "draft") withheld[status] = (withheld[status] ?? 0) + 1;
      continue;
    }
    const revision = found.result.revision;
    views.push(
      buildView({
        brandId: ws.brandSlug,
        strategyId: record.strategy_id,
        revision: revision.revision,
        status: found.result.status,
        reasons: found.result.reasons,
        content_sha256: found.entry.content_sha256,
        supersedes_revision: revision.supersedes_revision,
        approval: found.entry.approval,
        content: revision.content,
        facts,
        lang: opts.lang
      })
    );
  }
  return { views, withheld };
}

// packages/brand-core/src/content-bridge/planner.ts
var MONDAY_EPOCH = Date.UTC(1970, 0, 5);
function weekIndex(monday) {
  return Math.round((monday.getTime() - MONDAY_EPOCH) / (7 * 864e5));
}
function pick(list2, index) {
  return list2.length ? list2[(index % list2.length + list2.length) % list2.length] : null;
}
function servedStrategy(ws, lang, strategyId, now) {
  const { views } = contentStrategyView(ws, { lang, strategy_id: strategyId, now });
  if (!views.length) throw new StrategyError("refused", CLI_TEXT.none_approved[lang]);
  if (views.length > 1) throw new StrategyError("invalid_input", fill(CAL_TEXT.plan_several[lang], { list: views.map((v) => v.strategy_id).join(", ") }));
  return views[0];
}
function confidenceOf(obs) {
  if (obs.cell === "observed") return obs.verified ? "high" : "medium";
  return "low";
}
function researchAngles(ws, lang, now) {
  const memo = buildCompetitiveMemo(ws, "marketing", { capability: selectAdapter({ env: {} }).capability(now), lang, now });
  return memo.observations.filter((obs) => obs.usable && !obs.conflict).sort((a, b) => a.observation_id.localeCompare(b.observation_id)).map((obs) => ({ observation_id: obs.observation_id, ref: obs.ref, competitor_id: obs.competitor_id, dimension: obs.dimension, confidence: confidenceOf(obs), basis: obs.cell }));
}
function slotDates(monday, cadence) {
  const out = [];
  if (cadence.per === "week") {
    const base2 = weekIndex(monday) * cadence.target;
    for (let i = 0; i < cadence.target; i++) out.push({ date: isoDate(addDays(monday, Math.floor(i * 7 / cadence.target))), seq: base2 + i });
    return out;
  }
  for (let d = 0; d < 7; d++) {
    const day2 = addDays(monday, d);
    const year = day2.getUTCFullYear();
    const month = day2.getUTCMonth();
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    for (let k = 0; k < cadence.target; k++) {
      if (Math.floor(k * days / cadence.target) + 1 === day2.getUTCDate()) out.push({ date: isoDate(day2), seq: (year * 12 + month) * cadence.target + k });
    }
  }
  return out;
}
function gapText2(gap, lang) {
  return fill(CAL_TEXT[`cal_gap_${gap.reason}`][lang], { channel: gap.channel ?? "\u2014" });
}
function planWeek(view, monday, opts) {
  const gaps = [];
  const slots = [];
  const keyPool = [...view.messaging.map((s) => ({ id: s.fact_id, offer: false })), ...view.offers.map((s) => ({ id: s.fact_id, offer: true }))];
  const ctas = view.cta.sources.map((s) => s.fact_id);
  const objective = view.objective.map((s) => s.fact_id);
  const channels = opts.channels ?? view.channels.map((c) => c.channel);
  for (const name of channels) {
    if (!view.channels.some((c) => c.channel === name)) gaps.push({ channel: name, reason: "channel_not_in_strategy" });
  }
  view.channels.forEach((channel, order) => {
    if (!channels.includes(channel.channel)) return;
    if (!channel.cadence) {
      gaps.push({ channel: channel.channel, reason: "cadence_not_decided" });
      return;
    }
    if (!channel.formats.length) gaps.push({ channel: channel.channel, reason: "formats_not_decided" });
    const pillarIds = channel.pillars.length ? channel.pillars : view.pillars.map((p) => p.id);
    if (!pillarIds.length) gaps.push({ channel: channel.channel, reason: "no_pillars" });
    const langs = channel.languages.length ? channel.languages : view.languages;
    let skipped = false;
    for (const { date, seq } of slotDates(monday, channel.cadence)) {
      const pillar = pick(pillarIds, seq);
      const key = pick(keyPool, seq);
      const cta = pick(ctas, seq);
      const pillarFacts = view.pillars.find((p) => p.id === pillar)?.fact_refs ?? [];
      const factRefs2 = [.../* @__PURE__ */ new Set([...pillarFacts, ...channel.fact_refs])];
      const cited = [...factRefs2, ...objective, ...key ? [key.id] : [], ...cta ? [cta] : []];
      if (!cited.length) {
        skipped = true;
        continue;
      }
      slots.push({
        order,
        date,
        channel: channel.channel,
        format: pick(channel.formats, seq),
        pillar,
        language: pick(langs, seq),
        objective,
        key_message: key && !key.offer ? key.id : null,
        offer: key && key.offer ? key.id : null,
        cta,
        hook: null,
        angle: null,
        notes: null,
        research: opts.research?.length ? pick(opts.research, seq) : null,
        status: "planned",
        fact_refs: factRefs2
      });
    }
    if (skipped) gaps.push({ channel: channel.channel, reason: "no_source" });
  });
  if (slots.length && !keyPool.length) gaps.push({ channel: null, reason: "no_key_message" });
  if (opts.research && !opts.research.length) gaps.push({ channel: null, reason: "no_research" });
  slots.sort((a, b) => a.date === b.date ? a.order - b.order : a.date.localeCompare(b.date));
  if (slots.length > CALENDAR_LIMITS.maxSlots) throw new StrategyError("invalid_input", `A week would have ${slots.length} slots; at most ${CALENDAR_LIMITS.maxSlots}. Lower the cadence.`);
  const finished = slots.map(({ order: _order, ...slot }, i) => {
    void _order;
    return { id: `s${String(i + 1).padStart(2, "0")}`, ...slot };
  });
  const ids = [...new Set(finished.flatMap((slot) => [...slot.fact_refs, ...slot.objective, ...[slot.key_message, slot.offer, slot.cta].filter((id) => id !== null)]))].sort();
  const factRefs = ids.map((id) => {
    const revision = opts.revisions[id];
    if (!revision) throw new StrategyError("stale_source", `Fact ${id} is no longer approved. The content strategy needs review before planning.`);
    return { id, revision };
  });
  return {
    schema: 1,
    week_id: weekIdOf(monday),
    week_start: isoDate(monday),
    week_end: isoDate(addDays(monday, 6)),
    strategy: { strategy_id: view.strategy_id, revision: view.revision, content_sha256: view.digests.content_sha256 },
    languages: view.languages,
    slots: finished,
    gaps,
    fact_refs: factRefs,
    research_refs: [...new Set(finished.map((slot) => slot.research?.ref).filter((ref) => !!ref))].sort()
  };
}
function planCalendar(ws, opts) {
  const now = opts.now ?? ws.now();
  if (!Number.isInteger(opts.weeks) || opts.weeks < 1 || opts.weeks > CALENDAR_LIMITS.maxWeeks) throw new StrategyError("invalid_input", `--weeks must be 1 to ${CALENDAR_LIMITS.maxWeeks}.`);
  const from = parseDate(opts.from, "--from");
  const monday = mondayOf(from);
  const view = servedStrategy(ws, opts.lang, opts.strategy_id, now);
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  const revisions = {};
  for (const [id, fact] of Object.entries(facts)) if (fact.status === "approved" && fact.revision_hash && fact.classification !== "restricted") revisions[id] = fact.revision_hash;
  const research = opts.research ? researchAngles(ws, opts.lang, now) : null;
  const notes = [];
  if (isoDate(monday) !== opts.from) notes.push(fill(CAL_TEXT.plan_aligned[opts.lang], { from: opts.from, monday: isoDate(monday) }));
  if (research?.length) notes.push(fill(CAL_TEXT.plan_research[opts.lang], { n: research.length }));
  const weeks = [];
  for (let w = 0; w < opts.weeks; w++) {
    const content = planWeek(view, addDays(monday, 7 * w), { channels: opts.channels, research, revisions });
    weeks.push({ content, gaps: content.gaps.map((gap) => gapText2(gap, opts.lang)) });
  }
  return { strategy: { strategy_id: view.strategy_id, revision: view.revision, content_sha256: view.digests.content_sha256, status: view.status }, weeks, notes };
}

// packages/brand-core/src/content-bridge/calendar-store.ts
import fs4 from "node:fs";
import path5 from "node:path";
function problemText(problem, lang) {
  const entry = CAL_TEXT[`cal_block_${problem.code}`];
  return entry ? fill(entry[lang], problem.vars) : problem.code;
}
var CalendarError = class extends StrategyError {
  constructor(code, problems) {
    super(code, problems.map((problem) => problemText(problem, "en")).join(" "));
    this.problems = problems;
  }
  problems;
};
function calendarRoot(ws) {
  return path5.join(ws.root, ...CALENDAR_DIR.split("/"));
}
function weekDir(ws, id) {
  return path5.join(calendarRoot(ws), validateWeekId(id));
}
function recordFile(ws, id) {
  return path5.join(weekDir(ws, id), "record.json");
}
function revisionFile(ws, id, revision) {
  return path5.join(weekDir(ws, id), `r${String(validateRevisionNumber(revision)).padStart(4, "0")}.json`);
}
function readJson2(ws, file2, kind) {
  if (!dirUsable(ws, calendarRoot(ws)) || !dirUsable(ws, path5.dirname(file2))) return null;
  let raw;
  try {
    raw = safeRead(file2, CALENDAR_LIMITS.maxFileBytes);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new StrategyError("unsafe_path", error.message);
    throw error;
  }
  if (!raw) return null;
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new StrategyError("invalid_record", `${path5.basename(file2)} is not valid JSON.`);
  }
  if (!doc || typeof doc !== "object" || doc.kind !== kind) throw new StrategyError("invalid_record", `${path5.basename(file2)} is not a ${kind}.`);
  if (doc.brand_slug !== ws.brandSlug) throw new StrategyError("wrong_brand", `${path5.basename(file2)} belongs to another brand. It is not read.`);
  return doc;
}
function writeJson2(ws, file2, doc) {
  ensureDir(ws, path5.dirname(file2));
  writeVaultFile(ws, file2, `${JSON.stringify(doc, null, 2)}
`, true);
}
function loadWeekRecord(ws, id) {
  const doc = readJson2(ws, recordFile(ws, id), "content_week_record");
  if (!doc) throw new StrategyError("not_found", `No calendar week ${id} in this brand.`);
  if (doc.week_id !== id || !Array.isArray(doc.revisions)) throw new StrategyError("invalid_record", `The record for ${id} is malformed or carries another id.`);
  return doc;
}
function entryOf(record, revision) {
  const entry = record.revisions.find((item) => item.revision === revision);
  if (!entry) throw new StrategyError("not_found", `No revision ${revision} of ${record.week_id}.`);
  return entry;
}
function approvedWeekEntry(record) {
  const approved = record.revisions.filter((item) => item.state === "approved");
  if (approved.length > 1) throw new StrategyError("integrity_failed", `${record.week_id} has ${approved.length} approved revisions. None is served.`);
  return approved[0] ?? null;
}
function loadWeekRevision(ws, id, revision, entry) {
  const doc = readJson2(ws, revisionFile(ws, id, revision), "content_week_revision");
  if (!doc) throw new StrategyError("not_found", `No revision ${revision} of ${id}.`);
  if (doc.week_id !== id || doc.revision !== revision || !doc.content || typeof doc.content !== "object") throw new StrategyError("integrity_failed", `Revision ${revision} of ${id} carries another id or number.`);
  const digest = weekContentDigest(doc);
  if (digest !== doc.content_sha256 || entry && entry.content_sha256 !== digest) throw new StrategyError("integrity_failed", `Revision ${revision} of ${id} changed after it was proposed (content hash mismatch). It is not served.`);
  return doc;
}
function scanWeeks(ws) {
  const folder = calendarRoot(ws);
  if (!dirUsable(ws, folder)) return [];
  const out = [];
  for (const name of fs4.readdirSync(folder).sort()) {
    try {
      validateWeekId(name);
      out.push(loadWeekRecord(ws, name));
    } catch (error) {
      if (!(error instanceof StrategyError)) throw error;
    }
  }
  return out;
}
function strategyFacts(view) {
  const ids = /* @__PURE__ */ new Set();
  for (const p of view.pillars) for (const id of p.fact_refs) ids.add(id);
  for (const c of view.channels) for (const id of c.fact_refs) ids.add(id);
  const lists = [view.voice.sources, view.claims.sources, view.cta.sources, view.audience, view.messaging, view.offers, view.objective, view.language_sources];
  for (const list2 of lists) for (const s of list2) ids.add(s.fact_id);
  return ids;
}
function pinnedView(ws, content, now, lang) {
  return servedContentViews(ws, { lang, strategy_id: content.strategy.strategy_id, now }).views[0] ?? null;
}
function weekProblems(ws, content, now, lang = "en") {
  const problems = [];
  const pin = content.strategy;
  const view = pinnedView(ws, content, now, lang);
  if (!view) problems.push({ code: "strategy_not_served", vars: { id: pin.strategy_id, rev: pin.revision } });
  else if (view.revision !== pin.revision || view.digests.content_sha256 !== pin.content_sha256) problems.push({ code: "strategy_changed", vars: { id: pin.strategy_id, rev: pin.revision, now: view.revision } });
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  for (const ref of content.fact_refs) {
    if (facts[ref.id]?.classification === "restricted") problems.push({ code: "fact_restricted", vars: { fact: ref.id } });
    const state = factState(ws, ref, facts);
    if (state !== "current") problems.push({ code: "fact_changed", vars: { fact: ref.id, state } });
  }
  for (const ref of content.research_refs) {
    const parsed = parseKnowledgeRef(ref);
    const state = parsed ? evidenceState(ws, { ref, note_id: parsed.id, revision: parsed.revision }) : "missing";
    if (state !== "current") problems.push({ code: "research_changed", vars: { ref, state } });
  }
  const pinned = new Set(content.fact_refs.map((ref) => ref.id));
  const cited = view && view.revision === pin.revision ? strategyFacts(view) : null;
  for (const lang2 of content.languages) if (view && !view.languages.includes(lang2)) problems.push({ code: "language_not_in_strategy", vars: { slot: "\u2014", lang: lang2 } });
  for (const slot of content.slots) {
    const ids = slotFactIds(slot);
    if (!ids.length) problems.push({ code: "slot_no_source", vars: { slot: slot.id } });
    for (const id of ids) {
      if (!pinned.has(id)) problems.push({ code: "fact_not_pinned", vars: { slot: slot.id, fact: id } });
      else if (cited && !cited.has(id)) problems.push({ code: "fact_not_in_strategy", vars: { slot: slot.id, fact: id } });
    }
    if (slot.research && !content.research_refs.includes(slot.research.ref)) problems.push({ code: "research_not_pinned", vars: { slot: slot.id } });
    if (view) {
      const channel = view.channels.find((c) => c.channel === slot.channel);
      if (!channel) problems.push({ code: "channel_not_in_strategy", vars: { slot: slot.id, channel: slot.channel } });
      else {
        if (slot.format !== null && !channel.formats.includes(slot.format)) problems.push({ code: "format_not_in_channel", vars: { slot: slot.id, format: slot.format, channel: slot.channel } });
        const langs = channel.languages.length ? channel.languages : view.languages;
        if (!langs.includes(slot.language)) problems.push({ code: "language_not_in_strategy", vars: { slot: slot.id, lang: slot.language } });
      }
      if (slot.pillar !== null && !view.pillars.some((p) => p.id === slot.pillar)) problems.push({ code: "pillar_unknown", vars: { slot: slot.id, pillar: slot.pillar } });
      for (const [field, value] of [["hook", slot.hook], ["angle", slot.angle], ["notes", slot.notes]]) {
        for (const conflict of claimConflicts(field, value, view.claims.banned, view.claims.availability)) {
          problems.push({ code: conflict.kind === "banned" ? "banned_claim" : "availability_claim", vars: { slot: slot.id, field, rule: conflict.rule } });
        }
      }
    }
  }
  return { problems, view };
}
function proposeWeek(ws, input) {
  assertOwnerProcess();
  const content = parseWeekContent(input.week);
  const { problems } = weekProblems(ws, content, ws.now(), input.lang ?? "en");
  if (problems.length) throw new CalendarError("refused", problems);
  const id = content.week_id;
  const now = ws.now().toISOString();
  return withLock(ws, `content-week-${id}`, () => {
    let record;
    try {
      record = loadWeekRecord(ws, id);
    } catch (error) {
      if (!(error instanceof StrategyError) || error.code !== "not_found") throw error;
      record = { schema_version: CALENDAR_SCHEMA_VERSION, kind: "content_week_record", week_id: id, brand_slug: ws.brandSlug, created_at: now, updated_at: now, revisions: [] };
    }
    if (record.revisions.length >= CALENDAR_LIMITS.maxRevisions) throw new StrategyError("invalid_input", `At most ${CALENDAR_LIMITS.maxRevisions} revisions per week.`);
    const number = record.revisions.reduce((max, item) => Math.max(max, item.revision), 0) + 1;
    const approved = approvedWeekEntry(record);
    const base2 = { week_id: id, brand_slug: ws.brandSlug, revision: number, supersedes_revision: approved?.revision ?? null, content };
    const revision = { schema_version: CALENDAR_SCHEMA_VERSION, kind: "content_week_revision", ...base2, content_sha256: weekContentDigest(base2), created_at: now };
    const file2 = revisionFile(ws, id, number);
    if (fs4.existsSync(file2)) throw new StrategyError("exists", `Revision file ${path5.basename(file2)} already exists. Revisions are never overwritten.`);
    writeJson2(ws, file2, revision);
    record.revisions.push({ revision: number, content_sha256: revision.content_sha256, state: "draft", created_at: now, approval: null, superseded_by: null, superseded_at: null, rejected_at: null, withdrawn: null });
    record.updated_at = now;
    writeJson2(ws, recordFile(ws, id), record);
    return { record, revision, path: path5.relative(ws.root, file2).split(path5.sep).join("/") };
  });
}
function approvalVerifies(ws, record, entry) {
  const secret = readApprovalSecret(ws);
  return secret !== null && weekSealVerifies(record, entry, secret);
}
function weekSealVerifies(record, entry, secret) {
  const approval = entry.approval;
  if (!approval || typeof approval.digest !== "string" || typeof approval.seal !== "string") return false;
  const digest = weekApprovalDigest({ week_id: record.week_id, brand_slug: record.brand_slug, revision: entry.revision, content_sha256: entry.content_sha256, event_id: approval.event_id, approved_at: approval.approved_at });
  if (digest !== approval.digest) return false;
  return approvalSeal(secret, digest, WEEK_APPROVAL_DOMAIN) === approval.seal;
}
function evaluateWeek(ws, record, entry, now, lang = "en") {
  let revision;
  try {
    revision = loadWeekRevision(ws, record.week_id, entry.revision, entry);
  } catch (error) {
    if (error instanceof StrategyError) return { status: "integrity_failed", problems: [{ code: "integrity", vars: { week: record.week_id } }], revision: null, view: null };
    throw error;
  }
  if (entry.state !== "approved") return { status: entry.state === "withdrawn" ? "superseded" : entry.state, problems: [], revision, view: null };
  if (!approvalVerifies(ws, record, entry)) return { status: "integrity_failed", problems: [{ code: "integrity", vars: { week: record.week_id } }], revision, view: null };
  const { problems, view } = weekProblems(ws, revision.content, now, lang);
  return { status: problems.length ? "needs_review" : "current", problems, revision, view };
}
function reviewWeek(ws, input) {
  assertOwnerProcess();
  const lang = input.lang ?? "en";
  const record = loadWeekRecord(ws, validateWeekId(input.week_id));
  const entry = entryOf(record, validateRevisionNumber(input.revision));
  const revision = loadWeekRevision(ws, record.week_id, entry.revision, entry);
  const current = approvedWeekEntry(record);
  const problems = blockersFor(ws, record, entry, revision, current);
  problems.push(...weekProblems(ws, revision.content, ws.now(), lang).problems);
  return {
    week_id: record.week_id,
    revision: entry.revision,
    state: entry.state,
    content_sha256: entry.content_sha256,
    supersedes_revision: revision.supersedes_revision,
    current_approved: current?.revision ?? null,
    slots: revision.content.slots.length,
    gaps: revision.content.gaps.map((gap) => ({ ...gap, text: gapText2(gap, lang) })),
    blockers: problems.map((problem) => problemText(problem, lang)),
    approve_with: `npm run brand:content -- week approve --week ${record.week_id} --revision ${entry.revision} --expect-sha ${entry.content_sha256}`,
    notice: CAL_NOTICE[lang]
  };
}
function blockersFor(ws, record, entry, revision, current) {
  const out = [];
  if (entry.state !== "draft") out.push({ code: "not_draft", vars: { rev: entry.revision, state: entry.state } });
  if ((current?.revision ?? null) !== revision.supersedes_revision) out.push({ code: "approved_changed", vars: { was: revision.supersedes_revision ?? "\u2014", now: current?.revision ?? "\u2014" } });
  if (revision.content.week_end < isoDate(ws.now())) out.push({ code: "week_past", vars: { week: record.week_id } });
  return out;
}
function approveWeek(ws, input) {
  assertOwnerProcess();
  const id = validateWeekId(input.week_id);
  const number = validateRevisionNumber(input.revision);
  const expected = validateSha(input.expected_sha256, "--expect-sha");
  const secret = requireProof(ws, input.proof);
  return withLock(ws, `content-week-${id}`, () => {
    const record = loadWeekRecord(ws, id);
    const entry = entryOf(record, number);
    const revision = loadWeekRevision(ws, id, number, entry);
    if (revision.content_sha256 !== expected) throw new StrategyError("stale_revision", `Revision ${number} hashes to ${revision.content_sha256}, not the ${expected} you reviewed. Review it again. Nothing was approved.`);
    const current = approvedWeekEntry(record);
    const problems = [...blockersFor(ws, record, entry, revision, current), ...weekProblems(ws, revision.content, ws.now(), input.lang ?? "en").problems];
    if (problems.length) throw new CalendarError("refused", problems);
    const now = ws.now().toISOString();
    const eventId = newApprovalEventId();
    const digest = weekApprovalDigest({ week_id: id, brand_slug: record.brand_slug, revision: number, content_sha256: revision.content_sha256, event_id: eventId, approved_at: now });
    entry.state = "approved";
    entry.approval = { event_id: eventId, approved_at: now, actor: "owner", digest, seal: approvalSeal(secret, digest, WEEK_APPROVAL_DOMAIN) };
    if (current) {
      current.state = "superseded";
      current.superseded_by = number;
      current.superseded_at = now;
    }
    record.updated_at = now;
    writeJson2(ws, recordFile(ws, id), record);
    return { record, approved: entry, superseded: current };
  });
}
function rejectWeek(ws, input) {
  assertOwnerProcess();
  const id = validateWeekId(input.week_id);
  const number = validateRevisionNumber(input.revision);
  return withLock(ws, `content-week-${id}`, () => {
    const record = loadWeekRecord(ws, id);
    const entry = entryOf(record, number);
    if (entry.state !== "draft") throw new CalendarError("refused", [{ code: "not_draft", vars: { rev: number, state: entry.state } }]);
    const now = ws.now().toISOString();
    entry.state = "rejected";
    entry.rejected_at = now;
    record.updated_at = now;
    writeJson2(ws, recordFile(ws, id), record);
    return entry;
  });
}
function listWeeks(ws, lang = "en", now = ws.now()) {
  assertOwnerProcess();
  return scanWeeks(ws).map((record) => {
    let current = null;
    try {
      current = approvedWeekEntry(record)?.revision ?? null;
    } catch {
      current = null;
    }
    return {
      week_id: record.week_id,
      current,
      revisions: [...record.revisions].sort((a, b) => a.revision - b.revision).map((entry) => {
        const result = evaluateWeek(ws, record, entry, now, lang);
        return { revision: entry.revision, state: entry.state, status: result.status, content_sha256: entry.content_sha256, slots: result.revision?.content.slots.length ?? 0, reasons: result.problems.map((p) => problemText(p, lang)) };
      })
    };
  });
}
var CALENDAR_VIEW_SCHEMA = "brand-os/content-calendar/v1";
function valueText2(fact) {
  return typeof fact.value === "string" ? fact.value : JSON.stringify(fact.value);
}
function contentCalendar(ws, opts) {
  assertOwnerProcess();
  return buildCalendar(ws, opts);
}
function buildCalendar(ws, opts) {
  const now = opts.now ?? ws.now();
  const from = opts.from ? isoDate(parseDate(opts.from, "--from")) : null;
  const to = opts.to ? isoDate(parseDate(opts.to, "--to")) : null;
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  const weeks = [];
  const withheld = {};
  const count = (status) => withheld[status] = (withheld[status] ?? 0) + 1;
  for (const record of scanWeeks(ws)) {
    const start = record.week_id.slice(3);
    if (to && start > to) continue;
    for (const entry2 of record.revisions) if (entry2.state === "draft") count("draft");
    let entry;
    try {
      entry = approvedWeekEntry(record);
    } catch {
      count("integrity_failed");
      continue;
    }
    if (!entry) continue;
    const result = evaluateWeek(ws, record, entry, now, opts.lang);
    const revision = result.revision;
    if (result.status !== "current" || !revision || !entry.approval) {
      count(result.status);
      continue;
    }
    const c = revision.content;
    if (from && c.week_end < from) continue;
    const pillars = new Map((result.view?.pillars ?? []).map((p) => [p.id, p.name]));
    const slots = c.slots.filter((slot) => (!opts.channel || slot.channel === opts.channel) && (!from || slot.date >= from) && (!to || slot.date <= to)).map((slot) => ({ ...slot, status: slot.status === "planned" ? "approved" : slot.status, pillar_name: slot.pillar ? pillars.get(slot.pillar) ?? null : null }));
    const ids = new Set(slots.flatMap(slotFactIds));
    const resolved = [];
    for (const ref of c.fact_refs) {
      const fact = facts[ref.id];
      if (!ids.has(ref.id) || !fact || fact.classification === "restricted") continue;
      resolved.push({ fact_id: ref.id, revision: ref.revision, value: valueText2(fact) });
    }
    weeks.push({
      week_id: c.week_id,
      week_start: c.week_start,
      week_end: c.week_end,
      revision: revision.revision,
      status: "current",
      digests: { content_sha256: revision.content_sha256, approval_digest: entry.approval.digest },
      approval: { approved_at: entry.approval.approved_at, event_id: entry.approval.event_id, actor: "owner" },
      strategy: c.strategy,
      languages: c.languages,
      slots,
      gaps: c.gaps.filter((gap) => !opts.channel || gap.channel === null || gap.channel === opts.channel).map((gap) => ({ ...gap, text: gapText2(gap, opts.lang) })),
      facts: resolved
    });
  }
  const doc = { schema: CALENDAR_VIEW_SCHEMA, kind: "content_calendar", brand_id: ws.brandSlug, range: { from, to }, channel: opts.channel ?? null, weeks, withheld, authorizes: [], publication_permission: false, notice: CAL_NOTICE[opts.lang] };
  return { ...doc, digests: { view_sha256: sha256Hex(canonicalJson(doc)) } };
}

// packages/brand-core/src/creative/model.ts
import crypto2 from "node:crypto";
var CREATIVE_SCHEMA_VERSION = 1;
var SURFACES = ["reel", "post", "carousel", "story", "logo", "caption", "script", "thread", "article"];
var VERDICTS = ["like", "reject", "change_request", "observation"];
var FEEDBACK_SOURCE_KINDS = ["owner_note", "agent_capture", "meeting"];
var INSPIRATION_RIGHTS = ["own", "licensed", "unknown"];
var ASPECTS = [
  "camera_angle",
  "lighting",
  "text_density",
  "tone",
  "typography",
  "layout",
  "color",
  "mascot_pose",
  "mascot_anatomy",
  "hook",
  "cta",
  "duration",
  "pacing",
  "music",
  // Copy aspects (content feedback). Appended: the earlier ids and their meaning are unchanged. `hook`, `tone`,
  // `cta` and `pacing` above already cover copy too.
  "length",
  "humour",
  "clarity",
  "jargon",
  "structure",
  "hashtags",
  "caption",
  "script_delivery"
];
var PREFERENCE_SCOPES = ["project", "series"];
var CREATIVE_LIMITS = {
  maxTitleChars: 120,
  maxDescribeChars: 120,
  maxStatementChars: 200,
  maxContextChars: 300,
  maxVariants: 26,
  maxFeedback: 500,
  maxInspirations: 20,
  maxSources: 20,
  maxCounterexamples: 10,
  maxAspectProposalsPerRun: 100,
  /** Characters of a note body quoted into a retrieval reason. */
  maxQuoteChars: 500
};
var PROJECT_ID = /^[a-z0-9][a-z0-9-]{2,39}$/;
var VARIANT_ID = /^[A-Z][A-Z0-9]{0,7}$/;
var SERIES_ID = /^[a-z0-9][a-z0-9-]{1,39}$/;
var PREFERENCE_ID = /^cp_[0-9a-f-]{36}$/;
var ASPECT_PROPOSAL_ID = /^ap_[0-9a-f-]{36}$/;
var FEEDBACK_ID = /^fb_[0-9a-f-]{36}$/;
var ASSET_ID = /^[a-z0-9][a-z0-9_.-]{1,119}$/;
var ASPECT_SIDES = ["keep", "avoid"];
var CreativeError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "CreativeError";
  }
  code;
};
function newPreferenceId() {
  return `cp_${crypto2.randomUUID()}`;
}
function newAspectProposalId() {
  return `ap_${crypto2.randomUUID()}`;
}
function validateAspectProposalId(value) {
  if (typeof value !== "string" || !ASPECT_PROPOSAL_ID.test(value)) throw new CreativeError("invalid_input", "An aspect proposal id looks like ap_<uuid>.");
  return value;
}
function validateFeedbackId(value) {
  if (typeof value !== "string" || !FEEDBACK_ID.test(value)) throw new CreativeError("invalid_input", "A feedback id looks like fb_<uuid>.");
  return value;
}
function newFeedbackId() {
  return `fb_${crypto2.randomUUID()}`;
}
function oneOf3(value, allowed, field) {
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw new CreativeError("invalid_input", `${field} must be one of ${allowed.join(", ")}.`);
}
function validateProjectId(value) {
  if (typeof value !== "string" || !PROJECT_ID.test(value)) throw new CreativeError("invalid_input", "A project id is 3\u201340 lowercase letters, digits and hyphens (for example pilito-reel-001).");
  return value;
}
function validateVariantId(value) {
  if (typeof value !== "string" || !VARIANT_ID.test(value)) throw new CreativeError("invalid_input", "A variant id is an uppercase letter, optionally followed by up to 7 letters or digits (A, B, F2).");
  return value;
}
function validateSeries(value) {
  if (typeof value !== "string" || !SERIES_ID.test(value)) throw new CreativeError("invalid_input", "A series is 2\u201340 lowercase letters, digits and hyphens (for example onboarding).");
  return value;
}
function validatePreferenceId(value) {
  if (typeof value !== "string" || !PREFERENCE_ID.test(value)) throw new CreativeError("invalid_input", "A preference id looks like cp_<uuid>.");
  return value;
}
function validateAssetId(value) {
  if (typeof value !== "string" || !ASSET_ID.test(value) || value.includes("..")) {
    throw new CreativeError("invalid_input", "An asset is an id from brand/assets/asset-manifest.yaml or the word missing. File paths and URLs are not accepted.");
  }
  return value;
}
var asSurface = (value) => oneOf3(value, SURFACES, "Surface");
var asVerdict = (value) => oneOf3(value, VERDICTS, "Verdict");
var asFeedbackSourceKind = (value) => oneOf3(value, FEEDBACK_SOURCE_KINDS, "Feedback source kind");
var asRights = (value) => oneOf3(value, INSPIRATION_RIGHTS, "Inspiration rights");
var asScopeLevel = (value) => oneOf3(value, PREFERENCE_SCOPES, "Scope");
function asAspects(values) {
  if (values === void 0 || values === null) return [];
  if (!Array.isArray(values)) throw new CreativeError("invalid_input", "Aspects must be a list.");
  const out = [];
  for (const value of values) {
    const aspect = oneOf3(value, ASPECTS, "Aspect");
    if (!out.includes(aspect)) out.push(aspect);
  }
  return out;
}
function shortText2(value, max, field) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value !== "string") throw new CreativeError("invalid_input", `${field} must be text.`);
  const clean = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  if (clean.length > max) throw new CreativeError("invalid_input", `${field} is longer than ${max} characters. Keep the full wording in a Knowledge note and cite it.`);
  return clean;
}
function preferenceDigest(pref) {
  const canonical = JSON.stringify([pref.preference_id, pref.brand_slug, pref.statement, pref.scope, pref.sources.map((ref) => [ref.id, ref.revision]), pref.supersedes]);
  return crypto2.createHash("sha256").update(canonical).digest("hex");
}
function aspectProposalDigest(proposal) {
  const canonical = JSON.stringify([proposal.proposal_id, proposal.brand_slug, proposal.project_id, proposal.feedback_id, [proposal.note.id, proposal.note.revision], proposal.suggestions.map((item) => [item.aspect, item.side]), proposal.state]);
  return crypto2.createHash("sha256").update(canonical).digest("hex");
}
function scopeLabel(scope) {
  return scope.level === "project" ? `project ${scope.project_id}` : `series ${scope.series} (${scope.surface})`;
}

// packages/brand-core/src/creative/store.ts
var import_yaml = __toESM(require_dist(), 1);
import fs5 from "node:fs";
import path6 from "node:path";
var CREATIVE_DIRS = {
  root: "brand/.private/creative",
  projects: "brand/.private/creative/projects",
  preferences: "brand/.private/creative/preferences",
  aspects: "brand/.private/creative/aspect-proposals"
};
function creativeDir(ws, key) {
  return path6.join(ws.root, ...CREATIVE_DIRS[key].split("/"));
}
function assertOwnerProcess4() {
  if (process.env[AGENT_TOKEN_ENV]) {
    throw new CreativeError("refused", `Creative memory is the owner's local data. Refusing while ${AGENT_TOKEN_ENV} is set; no agent profile covers it.`);
  }
}
function readRecord(ws, file2, kind) {
  if (!dirUsable(ws, path6.dirname(file2))) return null;
  let raw;
  try {
    raw = safeRead(file2, 2 * 1024 * 1024);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CreativeError("unsafe_path", error.message);
    throw error;
  }
  if (!raw) return null;
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new CreativeError("invalid_record", `${path6.basename(file2)} is not valid JSON.`);
  }
  if (!doc || typeof doc !== "object" || doc.kind !== kind) throw new CreativeError("invalid_record", `${path6.basename(file2)} is not a ${kind} record.`);
  if (doc.brand_slug !== ws.brandSlug) throw new CreativeError("wrong_brand", `${path6.basename(file2)} belongs to another brand. It is not read.`);
  return doc;
}
function writeRecord(ws, file2, doc) {
  ensureDir(ws, path6.dirname(file2));
  writeVaultFile(ws, file2, `${JSON.stringify(doc, null, 2)}
`, true);
}
function projectFile(ws, id) {
  return path6.join(creativeDir(ws, "projects"), `${validateProjectId(id)}.json`);
}
function preferenceFile(ws, id) {
  return path6.join(creativeDir(ws, "preferences"), `${validatePreferenceId(id)}.json`);
}
function readProject(ws, id) {
  assertOwnerProcess4();
  return loadProject(ws, id);
}
function loadProject(ws, id) {
  const doc = readRecord(ws, projectFile(ws, id), "creative_project");
  if (!doc) throw new CreativeError("not_found", `No creative project ${id} in this brand.`);
  if (doc.project_id !== id) throw new CreativeError("invalid_record", `The file for ${id} carries another project id.`);
  return doc;
}
function listProjects(ws) {
  assertOwnerProcess4();
  return scanProjects(ws);
}
function scanProjects(ws) {
  const folder = creativeDir(ws, "projects");
  if (!dirUsable(ws, folder)) return [];
  const out = [];
  for (const name of fs5.readdirSync(folder).sort()) {
    const match = /^([a-z0-9][a-z0-9-]{2,39})\.json$/.exec(name);
    if (!match) continue;
    try {
      out.push(loadProject(ws, match[1]));
    } catch (error) {
      if (!(error instanceof CreativeError)) throw error;
    }
  }
  return out;
}
function readPreference(ws, id) {
  assertOwnerProcess4();
  return loadPreference(ws, id);
}
function loadPreference(ws, id) {
  const doc = readRecord(ws, preferenceFile(ws, id), "creative_preference");
  if (!doc) throw new CreativeError("not_found", `No creative preference ${id} in this brand.`);
  if (doc.preference_id !== id) throw new CreativeError("invalid_record", `The file for ${id} carries another preference id.`);
  return doc;
}
function listPreferences(ws) {
  assertOwnerProcess4();
  return scanPreferences(ws);
}
function scanPreferences(ws) {
  const folder = creativeDir(ws, "preferences");
  if (!dirUsable(ws, folder)) return [];
  const out = [];
  for (const name of fs5.readdirSync(folder).sort()) {
    const match = /^(cp_[0-9a-f-]{36})\.json$/.exec(name);
    if (!match) continue;
    try {
      out.push(loadPreference(ws, match[1]));
    } catch (error) {
      if (!(error instanceof CreativeError)) throw error;
    }
  }
  return out.sort((a, b) => a.created_at.localeCompare(b.created_at));
}
function lockName(projectId) {
  return `creative-${projectId}`;
}
function updateProject(ws, id, change) {
  return withLock(ws, lockName(validateProjectId(id)), () => {
    const project = readProject(ws, id);
    change(project);
    project.updated_at = ws.now().toISOString();
    writeRecord(ws, projectFile(ws, id), project);
    return project;
  });
}
function linkableNote(ws, id) {
  let loaded;
  try {
    loaded = findNote(ws, id);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new CreativeError(error.code === "not_found" || error.code === "invalid_id" ? "not_found" : "refused", `Knowledge note ${typeof id === "string" ? id.slice(0, 80) : ""}: ${error.message}`);
    throw error;
  }
  if (loaded.note.meta.classification !== "internal") throw new CreativeError("refused", "Restricted notes are never linked to creative projects.");
  return loaded;
}
function refOf(loaded) {
  return { id: loaded.id, revision: loaded.revision };
}
function createProject(ws, input) {
  assertOwnerProcess4();
  const id = validateProjectId(input.project_id);
  const title = shortText2(input.title, CREATIVE_LIMITS.maxTitleChars, "Title");
  if (!title) throw new CreativeError("invalid_input", "A project needs a title.");
  const surface = asSurface(input.surface);
  const series = validateSeries(input.series);
  const language = input.language ? /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(input.language) ? input.language : null : null;
  if (input.language && !language) throw new CreativeError("invalid_input", "Language must be a code such as en, fa or tr.");
  const inspirations = (input.inspirations ?? []).map((item) => ({ note: refOf(linkableNote(ws, item.note_id)), rights: asRights(item.rights ?? "unknown") }));
  if (inspirations.length > CREATIVE_LIMITS.maxInspirations) throw new CreativeError("invalid_input", `At most ${CREATIVE_LIMITS.maxInspirations} inspirations.`);
  const now = ws.now().toISOString();
  const project = {
    schema_version: CREATIVE_SCHEMA_VERSION,
    kind: "creative_project",
    project_id: id,
    brand_slug: ws.brandSlug,
    title,
    surface,
    series,
    language,
    inspirations,
    variants: [],
    feedback: [],
    selection: null,
    created_at: now,
    updated_at: now
  };
  return withLock(ws, lockName(id), () => {
    if (readRecord(ws, projectFile(ws, id), "creative_project")) throw new CreativeError("exists", `Project ${id} already exists.`);
    writeRecord(ws, projectFile(ws, id), project);
    return project;
  });
}
function resolveAsset(root, asset) {
  if (asset === "missing") return { state: "missing" };
  const id = validateAssetId(asset);
  const file2 = path6.join(root, "brand", "assets", "asset-manifest.yaml");
  let rows = [];
  try {
    rows = ((0, import_yaml.parse)(fs5.readFileSync(file2, "utf8"))?.assets ?? []).filter((row2) => row2 && typeof row2 === "object");
  } catch {
    rows = [];
  }
  const row = rows.find((item) => item.id === id);
  if (!row) throw new CreativeError("invalid_input", `Asset ${id} is not in brand/assets/asset-manifest.yaml. Register the real file there first, or use --asset missing.`);
  return { state: "manifest", asset_id: id, checksum_sha256: typeof row.checksum_sha256 === "string" ? row.checksum_sha256 : null, present: row.present === true };
}
function addVariant(ws, input) {
  assertOwnerProcess4();
  const variantId = validateVariantId(input.variant_id);
  const asset = resolveAsset(ws.root, input.asset);
  const describe = shortText2(input.describe, CREATIVE_LIMITS.maxDescribeChars, "Description");
  let added = null;
  updateProject(ws, input.project_id, (project) => {
    if (project.variants.some((item) => item.variant_id === variantId)) throw new CreativeError("exists", `Variant ${variantId} already exists in ${project.project_id}. Variants are never overwritten; add a new id.`);
    if (project.variants.length >= CREATIVE_LIMITS.maxVariants) throw new CreativeError("invalid_input", `At most ${CREATIVE_LIMITS.maxVariants} variants.`);
    added = { variant_id: variantId, status: "draft", asset, describe, created_at: ws.now().toISOString() };
    project.variants.push(added);
  });
  return added;
}
function recordFeedback(ws, input) {
  assertOwnerProcess4();
  const projectId = validateProjectId(input.project_id);
  const variantId = validateVariantId(input.variant_id);
  const verdict = asVerdict(input.verdict ?? "observation");
  const keep = asAspects(input.keep);
  const avoid = asAspects(input.avoid);
  if (keep.some((aspect) => avoid.includes(aspect))) throw new CreativeError("invalid_input", "An aspect cannot be both keep and avoid in one feedback.");
  if (input.text === void 0 === (input.note_id === void 0)) throw new CreativeError("invalid_input", "Give the owner\u2019s words with --text/--file, or link an existing note with --note (not both).");
  const project = readProject(ws, projectId);
  if (!project.variants.some((item) => item.variant_id === variantId)) throw new CreativeError("not_found", `No variant ${variantId} in ${projectId}.`);
  if (verdict === "reject" && project.selection?.variant_id === variantId) throw new CreativeError("refused", `${variantId} is the selected variant. Select another variant first, then reject this one.`);
  let note;
  let sourceKind;
  if (input.text !== void 0) {
    sourceKind = asFeedbackSourceKind(input.source_kind ?? "owner_note");
    if (!input.text.trim()) throw new CreativeError("invalid_input", "The feedback text is empty.");
    try {
      const captured = captureNote(ws, {
        title: `Creative feedback: ${projectId} variant ${variantId}`,
        body: input.text,
        kind: "general",
        language: input.language ?? project.language,
        tags: ["creative-feedback", `proj-${projectId}`, `variant-${variantId.toLowerCase()}`],
        source: { kind: sourceKind, ref: `creative:${projectId}/${variantId}` }
      });
      note = { id: captured.id, revision: captured.revision, path: captured.path, scope: captured.scope, captured: true };
    } catch (error) {
      if (error instanceof KnowledgeError) throw new CreativeError(error.code === "refused" ? "refused" : "invalid_input", error.message);
      throw error;
    }
  } else {
    const loaded = linkableNote(ws, input.note_id);
    const kind = loaded.note.meta.source.kind;
    if (!FEEDBACK_SOURCE_KINDS.includes(kind)) {
      throw new CreativeError("refused", `Note ${loaded.id} is ${kind} (third-party material), not the owner's words. Link it as an inspiration instead.`);
    }
    if (input.source_kind !== void 0 && input.source_kind !== kind) throw new CreativeError("invalid_input", `Note ${loaded.id} has source kind ${kind}; --source-kind cannot change it.`);
    sourceKind = kind;
    note = { id: loaded.id, revision: loaded.revision, path: loaded.path, scope: loaded.scope, captured: false };
  }
  const event = {
    feedback_id: newFeedbackId(),
    variant_id: variantId,
    note: { id: note.id, revision: note.revision },
    source_kind: sourceKind,
    verdict,
    keep,
    avoid,
    recorded_at: ws.now().toISOString()
  };
  let status = "draft";
  updateProject(ws, projectId, (current) => {
    if (current.feedback.length >= CREATIVE_LIMITS.maxFeedback) throw new CreativeError("invalid_input", `At most ${CREATIVE_LIMITS.maxFeedback} feedback events per project.`);
    current.feedback.push(event);
    const variant = current.variants.find((item) => item.variant_id === variantId);
    if (verdict === "reject") variant.status = "rejected";
    status = variant.status;
  });
  return { feedback: event, note, variant_status: status };
}
function selectVariant(ws, input) {
  assertOwnerProcess4();
  const variantId = validateVariantId(input.variant_id);
  return updateProject(ws, input.project_id, (project) => {
    const variant = project.variants.find((item) => item.variant_id === variantId);
    if (!variant) throw new CreativeError("not_found", `No variant ${variantId} in ${project.project_id}.`);
    for (const item of project.variants) if (item.status === "selected") item.status = "draft";
    variant.status = "selected";
    project.selection = { variant_id: variantId, meaning: "owner_selected_for_this_project", selected_at: ws.now().toISOString() };
  });
}
function checkSafeLabel(text2, field) {
  const blocked = safetyBlocksSharing(safetyReport(text2));
  if (blocked.length) throw new CreativeError("refused", `${field} looks like it contains ${blocked.join("; ")}. Nothing was written.`);
}
function suggestPreference(ws, input) {
  assertOwnerProcess4();
  const project = readProject(ws, validateProjectId(input.project_id));
  const statement = shortText2(input.statement, CREATIVE_LIMITS.maxStatementChars, "Statement");
  if (!statement) throw new CreativeError("invalid_input", "A preference needs a short statement.");
  const context = shortText2(input.context, CREATIVE_LIMITS.maxContextChars, "Context");
  checkSafeLabel(`${statement}
${context ?? ""}`, "The statement or context");
  const ids = [...new Set(input.sources ?? [])];
  if (ids.length === 0) throw new CreativeError("invalid_input", "A preference needs at least one source note (--source kn_\u2026).");
  if (ids.length > CREATIVE_LIMITS.maxSources) throw new CreativeError("invalid_input", `At most ${CREATIVE_LIMITS.maxSources} sources.`);
  const sources = ids.map((id) => {
    const loaded = linkableNote(ws, id);
    if (!FEEDBACK_SOURCE_KINDS.includes(loaded.note.meta.source.kind)) throw new CreativeError("refused", `Note ${loaded.id} is third-party material. A preference must rest on the owner's words.`);
    if (loaded.note.meta.status === "archived") throw new CreativeError("refused", `Note ${loaded.id} is archived. Restore it or cite another note.`);
    return refOf(loaded);
  });
  const counterexamples = (input.counterexamples ?? []).map((item) => {
    const pid = validateProjectId(item.project_id ?? project.project_id);
    const vid = validateVariantId(item.variant_id);
    const owner = pid === project.project_id ? project : readProject(ws, pid);
    if (!owner.variants.some((variant) => variant.variant_id === vid)) throw new CreativeError("not_found", `No variant ${vid} in ${pid}.`);
    return { project_id: pid, variant_id: vid };
  });
  if (counterexamples.length > CREATIVE_LIMITS.maxCounterexamples) throw new CreativeError("invalid_input", `At most ${CREATIVE_LIMITS.maxCounterexamples} counterexamples.`);
  let supersedes = null;
  if (input.supersedes) {
    const old = readPreference(ws, validatePreferenceId(input.supersedes));
    if (old.state !== "approved") throw new CreativeError("refused", `${old.preference_id} is ${old.state}; only an approved preference can be superseded.`);
    supersedes = old.preference_id;
  }
  const now = ws.now().toISOString();
  const pref = {
    schema_version: CREATIVE_SCHEMA_VERSION,
    kind: "creative_preference",
    preference_id: newPreferenceId(),
    brand_slug: ws.brandSlug,
    project_id: project.project_id,
    statement,
    context,
    scope: { level: "project", project_id: project.project_id },
    sources,
    counterexamples,
    state: "draft",
    supersedes,
    superseded_by: null,
    superseded_at: null,
    approval: null,
    created_at: now,
    updated_at: now
  };
  writeRecord(ws, preferenceFile(ws, pref.preference_id), pref);
  return pref;
}
function sourceStatus(ws, ref) {
  let loaded;
  try {
    loaded = findNote(ws, ref.id);
  } catch (error) {
    if (error instanceof KnowledgeError) return { current: false, state: "missing", loaded: null };
    throw error;
  }
  if (loaded.note.meta.classification !== "internal") return { current: false, state: "missing", loaded: null };
  if (loaded.note.meta.status === "archived") return { current: false, state: "archived", loaded };
  return loaded.revision === ref.revision ? { current: true, state: "current", loaded } : { current: false, state: "stale", loaded };
}
var BRAND_SCOPE_ROUTE = "A brand-wide rule is a brand fact. Creative preferences stop at project or series scope. To make it brand-wide, capture the rule in your own words as a Knowledge note, run brand:knowledge propose (drafts only), then brand:review and brand:approve.";
function approvePreference(ws, input) {
  assertOwnerProcess4();
  if (input.scope === "brand") throw new CreativeError("refused", BRAND_SCOPE_ROUTE);
  const level = asScopeLevel(input.scope ?? "project");
  if (!approvalProofMatches(ws.root, input.proof)) throw new CreativeError("proof", "Approval refused: missing or wrong owner approval proof. Nothing was changed.");
  const id = validatePreferenceId(input.preference_id);
  return withLock(ws, "creative-preferences", () => {
    const pref = readPreference(ws, id);
    if (pref.state !== "draft") throw new CreativeError("refused", `${id} is ${pref.state}. Only a draft can be approved.`);
    if (input.expected_digest !== void 0 && preferenceDigest(pref) !== input.expected_digest) throw new CreativeError("stale", `${id} changed since it was shown for approval. Review it again. Nothing was approved.`);
    for (const ref of pref.sources) {
      const status = sourceStatus(ws, ref);
      if (!status.current) throw new CreativeError("stale_source", `Source ${ref.id} is ${status.state} since this preference was suggested. Review it and suggest again. Nothing was approved.`);
    }
    const project = readProject(ws, pref.project_id);
    const scope = level === "series" ? { level: "series", surface: project.surface, series: project.series } : { level: "project", project_id: project.project_id };
    let old = null;
    if (pref.supersedes) {
      old = readPreference(ws, pref.supersedes);
      if (old.state !== "approved") throw new CreativeError("refused", `${old.preference_id} is ${old.state}; it cannot be superseded now.`);
    }
    const now = ws.now().toISOString();
    pref.scope = scope;
    pref.state = "approved";
    pref.approval = { approved_at: now, digest: preferenceDigest(pref), actor: "owner" };
    pref.updated_at = now;
    writeRecord(ws, preferenceFile(ws, pref.preference_id), pref);
    if (old) {
      old.state = "superseded";
      old.superseded_by = pref.preference_id;
      old.superseded_at = now;
      old.updated_at = now;
      writeRecord(ws, preferenceFile(ws, old.preference_id), old);
    }
    return { approved: pref, superseded: old };
  });
}

export {
  COMPETITIVE_SCHEMA_VERSION,
  RELATIONSHIPS,
  GEOGRAPHIES,
  BILLING_PERIODS,
  BILLING_COMMITMENTS,
  TAX_INCLUSIONS,
  PROMOTIONS,
  COMPETITOR_ID,
  COMPETITIVE_LIMITS,
  CompetitiveError,
  oneOf,
  validateCompetitorId,
  validateDomain,
  CALENDAR_SCHEMA_VERSION,
  CALENDAR_DIR,
  WEEK_APPROVAL_DOMAIN,
  WEEK_ID,
  CALENDAR_LIMITS,
  SLOT_STATES,
  CALENDAR_GAP_REASONS,
  CONFIDENCE,
  parseDate,
  isoDate,
  addDays,
  mondayOf,
  weekIdOf,
  validateWeekId,
  weekContentDigest,
  weekApprovalDigest,
  parseWeekContent,
  slotFactIds,
  normalizeClaimText,
  containsClaim,
  availabilityConflict,
  claimConflicts,
  CAL_TEXT,
  CAL_NOTICE,
  CONTENT_LANGS,
  contentLang,
  fill,
  ROLE_LABELS,
  CHANNEL_PARTS,
  PROPOSAL_TEXT,
  GAP_TEXT,
  NOTES,
  AVAILABILITY_RULES,
  VIEW_NOTICE,
  CLI_TEXT,
  DIMENSION_LABELS,
  asLang,
  fill2,
  HEADINGS,
  competitiveDir,
  assertOwnerProcess3 as assertOwnerProcess,
  readJson,
  writeJson,
  locked,
  readCandidate,
  scanCandidates,
  setScope,
  addCandidate,
  setStatus,
  classifyCandidate,
  resolveEvidence,
  linkEvidence,
  verifyDomain,
  refState,
  sourceClass,
  buildLandscape,
  getCompetitiveContext,
  MEMO_TITLES,
  MEMO_HEADINGS,
  SEO_NAME_STATUS,
  UNKNOWN,
  single,
  list,
  SeoError,
  interviewState,
  SEO_DIR,
  readInterview,
  answersOf,
  recordAnswer,
  importSeoNames,
  MEMO_PURPOSES,
  rateLabel,
  buildCompetitiveMemo,
  NETWORK_ENV,
  unavailableAdapter,
  parseBundle,
  replayAll,
  selectAdapter,
  parseRequests,
  retrieveAll,
  toBundle,
  CONTENT_PLAYBOOK_SCHEMA,
  CHANNEL_PLAYBOOK,
  playbookFor,
  PLAYBOOK_NOTICE,
  OBJECTIVE_LABELS,
  MIX_LABELS,
  KPI_LABELS,
  PERIOD_LABELS,
  PLAYBOOK_TEXT,
  localizeEntry,
  playbookDocument,
  playbookProblems,
  CONTENT_SOURCES,
  brandSettings,
  activeSources,
  isPlaceholderValue,
  sourceState,
  readSources,
  roleGaps,
  splitItems,
  detectChannels,
  describeGap,
  buildContentStrategy,
  parseCadence,
  parseFormats,
  parseChannels,
  CONTENT_VIEW_SCHEMA,
  buildView,
  contentStrategyView,
  servedContentViews,
  servedStrategy,
  researchAngles,
  gapText2 as gapText,
  planWeek,
  planCalendar,
  problemText,
  CalendarError,
  loadWeekRecord,
  approvedWeekEntry,
  loadWeekRevision,
  scanWeeks,
  weekProblems,
  proposeWeek,
  weekSealVerifies,
  evaluateWeek,
  reviewWeek,
  approveWeek,
  rejectWeek,
  listWeeks,
  CALENDAR_VIEW_SCHEMA,
  contentCalendar,
  buildCalendar,
  CREATIVE_SCHEMA_VERSION,
  SURFACES,
  CREATIVE_LIMITS,
  PROJECT_ID,
  VARIANT_ID,
  SERIES_ID,
  PREFERENCE_ID,
  ASPECT_SIDES,
  CreativeError,
  newAspectProposalId,
  validateAspectProposalId,
  validateFeedbackId,
  validateProjectId,
  validateSeries,
  validatePreferenceId,
  asSurface,
  preferenceDigest,
  aspectProposalDigest,
  scopeLabel,
  creativeDir,
  assertOwnerProcess4 as assertOwnerProcess2,
  readRecord,
  writeRecord,
  readProject,
  loadProject,
  listProjects,
  scanProjects,
  readPreference,
  listPreferences,
  scanPreferences,
  updateProject,
  createProject,
  resolveAsset,
  addVariant,
  recordFeedback,
  selectVariant,
  suggestPreference,
  sourceStatus,
  approvePreference
};
