import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  ASPECT_SIDES,
  CREATIVE_LIMITS,
  CREATIVE_SCHEMA_VERSION,
  CreativeError,
  aspectProposalDigest,
  assertOwnerProcess2 as assertOwnerProcess,
  creativeDir,
  newAspectProposalId,
  readProject,
  readRecord,
  sourceStatus,
  updateProject,
  validateAspectProposalId,
  validateFeedbackId,
  validateProjectId,
  writeRecord
} from "./chunk-ZYAYDNGS.mjs";
import {
  approvalProofMatches,
  dirUsable,
  withLock
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/creative/aspects.ts
import fs from "node:fs";
import path from "node:path";
var ASPECT_METHOD = "lexicon-v1";
var LEXICON = {
  camera_angle: ["camera angle", "camera", "angle", "framing", "shot", "\u0632\u0627\u0648\u06CC\u0647 \u062F\u0648\u0631\u0628\u06CC\u0646", "\u0632\u0627\u0648\u06CC\u0647", "\u062F\u0648\u0631\u0628\u06CC\u0646", "\u06A9\u0627\u062F\u0631", "kamera a\xE7\u0131s\u0131", "kamera", "a\xE7\u0131", "kadraj"],
  lighting: ["lighting", "light", "shadow", "\u0646\u0648\u0631\u067E\u0631\u062F\u0627\u0632\u06CC", "\u0646\u0648\u0631", "\u0633\u0627\u06CC\u0647", "\u0131\u015F\u0131k", "ayd\u0131nlatma", "g\xF6lge"],
  text_density: [["too much text", "avoid"], "text", "copy", "words", "caption", "\u0645\u062A\u0646", "\u0646\u0648\u0634\u062A\u0647", "\u06A9\u0644\u0645\u0627\u062A", "metin", "yaz\u0131"],
  tone: [["childish", "avoid"], "tone", "serious", "playful", "corporate", ["\u0628\u0686\u06AF\u0627\u0646\u0647", "avoid"], ["\u06A9\u0648\u062F\u06A9\u0627\u0646\u0647", "avoid"], "\u0644\u062D\u0646", "\u062C\u062F\u06CC", "\u0631\u0633\u0645\u06CC", ["\xE7ocuksu", "avoid"], "ton", "ciddi", "resmi"],
  typography: ["font", "typography", "typeface", "lettering", "\u0641\u0648\u0646\u062A", "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC", "yaz\u0131 tipi", "tipografi"],
  layout: ["layout", "composition", ["cluttered", "avoid"], ["busy", "avoid"], "\u0686\u06CC\u062F\u0645\u0627\u0646", "\u062A\u0631\u06A9\u06CC\u0628 \u0628\u0646\u062F\u06CC", ["\u0634\u0644\u0648\u063A", "avoid"], "d\xFCzen", "kompozisyon", ["kalabal\u0131k", "avoid"]],
  color: ["color", "colour", "palette", "\u0631\u0646\u06AF", "renk"],
  mascot_pose: ["pose", "posture", "\u0698\u0633\u062A", "\u062D\u0627\u0644\u062A \u0628\u062F\u0646", "poz", "duru\u015F"],
  mascot_anatomy: ["anatomy", "proportions", "wings", "beak", "\u0622\u0646\u0627\u062A\u0648\u0645\u06CC", "\u062A\u0646\u0627\u0633\u0628", "anatomi", "kanat", "gaga"],
  hook: ["hook", "opening", "first second", "intro", "\u0634\u0631\u0648\u0639", "\u062B\u0627\u0646\u06CC\u0647 \u0627\u0648\u0644", "a\xE7\u0131l\u0131\u015F", "kanca", "giri\u015F"],
  cta: ["cta", "call to action", "button", "\u062F\u06A9\u0645\u0647", "\u0641\u0631\u0627\u062E\u0648\u0627\u0646", "buton", "eylem \xE7a\u011Fr\u0131s\u0131"],
  duration: [["too long", "avoid"], ["too short", "avoid"], "duration", "length", "\u0645\u062F\u062A", ["\u0637\u0648\u0644\u0627\u0646\u06CC", "avoid"], "s\xFCre", ["\xE7ok uzun", "avoid"]],
  pacing: ["pacing", "pace", "rhythm", "\u0631\u06CC\u062A\u0645", "\u0633\u0631\u0639\u062A", "tempo", "ritim"],
  music: ["music", "song", "soundtrack", "audio", "\u0645\u0648\u0633\u06CC\u0642\u06CC", "\u0622\u0647\u0646\u06AF", "m\xFCzik", "\u015Fark\u0131"],
  // Copy aspects. Their terms are new words or longer phrases only, so text that matched before still matches the
  // same aspect (a longer phrase wins: "caption too long" is length, not text_density + duration).
  length: [["caption too long", "avoid"], ["script too long", "avoid"], ["too wordy", "avoid"], ["wordy", "avoid"], "word count", "shorter", ["\u06A9\u067E\u0634\u0646 \u0637\u0648\u0644\u0627\u0646\u06CC", "avoid"], ["\u0645\u062A\u0646 \u0637\u0648\u0644\u0627\u0646\u06CC", "avoid"], "\u06A9\u0648\u062A\u0627\u0647 \u062A\u0631", "\u062A\u0639\u062F\u0627\u062F \u06A9\u0644\u0645\u0627\u062A", ["metin \xE7ok uzun", "avoid"], ["uzun metin", "avoid"], "daha k\u0131sa", "kelime say\u0131s\u0131"],
  humour: ["humour", "humor", "funny", "joke", "witty", "\u0634\u0648\u062E\u06CC", "\u0634\u0648\u062E", "\u0637\u0646\u0632", "\u062E\u0646\u062F\u0647 \u062F\u0627\u0631", "mizah", "komik", "espri", "e\u011Flenceli"],
  clarity: ["clarity", "clear", ["unclear", "avoid"], ["confusing", "avoid"], ["vague", "avoid"], "\u0648\u0627\u0636\u062D", "\u0634\u0641\u0627\u0641", ["\u0645\u0628\u0647\u0645", "avoid"], ["\u06AF\u0646\u06AF", "avoid"], "anla\u015F\u0131l\u0131r", ["kar\u0131\u015F\u0131k", "avoid"], ["belirsiz", "avoid"]],
  jargon: ["jargon", "technical terms", "buzzword", "\u0627\u0635\u0637\u0644\u0627\u062D\u0627\u062A \u062A\u062E\u0635\u0635\u06CC", "\u0627\u0635\u0637\u0644\u0627\u062D", "\u0698\u0627\u0631\u06AF\u0648\u0646", "teknik terim"],
  structure: ["structure", "outline", "flow", "\u0633\u0627\u062E\u062A\u0627\u0631", "\u062A\u0631\u062A\u06CC\u0628", "ak\u0131\u015F", "s\u0131ralama"],
  hashtags: ["hashtag", "\u0647\u0634\u062A\u06AF", "etiket"],
  caption: ["\u06A9\u067E\u0634\u0646", "a\xE7\u0131klama metni"],
  script_delivery: ["script", "voiceover", "voice over", "narration", "delivery", "\u0627\u0633\u06A9\u0631\u06CC\u067E\u062A", "\u06AF\u0648\u06CC\u0646\u062F\u06AF\u06CC", "\u0635\u062F\u0627\u06AF\u0630\u0627\u0631\u06CC", "\u0645\u062A\u0646 \u0648\u06CC\u062F\u06CC\u0648", "senaryo", "seslendirme", "anlat\u0131m"]
};
var NEGATIVE = ["too", "not", "bad", "ugly", "wrong", "hate", "dislike", "less", "remove", "avoid", "boring", "weak", "\u0632\u06CC\u0627\u062F", "\u0628\u062F", "\u0632\u0634\u062A", "\u0646\u06CC\u0633\u062A", "\u06A9\u0645 \u06A9\u0646", "\u062D\u0630\u0641", "\u0627\u0634\u062A\u0628\u0627\u0647", "\u0636\u0639\u06CC\u0641", "\u062E\u0633\u062A\u0647 \u06A9\u0646\u0646\u062F\u0647", "\u062F\u0648\u0633\u062A \u0646\u062F\u0627\u0631\u0645", "\u0646\u0645\u06CC", "fazla", "k\xF6t\xFC", "de\u011Fil", "be\u011Fenmedim", "sevmedim", "kald\u0131r", "yanl\u0131\u015F", "zay\u0131f", "s\u0131k\u0131c\u0131"];
var POSITIVE = ["good", "great", "love", "like", "nice", "right", "perfect", "keep", "better", "beautiful", "works", "\u062E\u0648\u0628", "\u0639\u0627\u0644\u06CC", "\u062F\u0648\u0633\u062A \u062F\u0627\u0631\u0645", "\u0642\u0634\u0646\u06AF", "\u0632\u06CC\u0628\u0627", "\u062F\u0631\u0633\u062A", "\u0646\u06AF\u0647 \u062F\u0627\u0631", "\u0628\u0647\u062A\u0631", "iyi", "g\xFCzel", "harika", "be\u011Fendim", "sevdim", "do\u011Fru", "m\xFCkemmel", "kals\u0131n"];
function normalizeForAspects(text) {
  return text.normalize("NFC").replace(/[ً-ْ]/g, "").replace(/‌/g, " ").replace(/ي/g, "\u06CC").replace(/ك/g, "\u06A9").replace(/İ/g, "i").toLowerCase().replace(/ı/g, "i").replace(/\s+/g, " ").trim();
}
var CLAUSE_SPLIT = /[.!?؟،,;؛\n]+|\s(?:but|however|although|ولی|اما|ama|fakat|ancak|lakin)\s/;
function findTerm(clause, term, wholeWord = false) {
  let from = 0;
  for (; ; ) {
    const at = clause.indexOf(term, from);
    if (at === -1) return -1;
    const startOk = at === 0 || /[\s\p{P}]/u.test(clause[at - 1]);
    const after = clause[at + term.length];
    const endOk = !wholeWord || after === void 0 || /[\s\p{P}]/u.test(after);
    if (startOk && endOk) return at;
    from = at + 1;
  }
}
var WHOLE_WORD_CUES = /* @__PURE__ */ new Set(["too", "not", "less", "like", "keep", "right", "bad", "good", "nice", "iyi"]);
var cueIn = (clause, cue) => findTerm(clause, cue, WHOLE_WORD_CUES.has(cue)) !== -1;
var TERMS = Object.entries(LEXICON).flatMap(([aspect, terms]) => terms.map((entry) => typeof entry === "string" ? { aspect, term: entry, side: null } : { aspect, term: entry[0], side: entry[1] })).map((item) => ({ ...item, cue: item.term, term: normalizeForAspects(item.term) })).sort((a, b) => b.term.length - a.term.length);
var NEG = NEGATIVE.map(normalizeForAspects);
var POS = POSITIVE.map(normalizeForAspects);
function deriveAspects(text, existing = { keep: [], avoid: [] }) {
  const found = /* @__PURE__ */ new Map();
  for (const raw of normalizeForAspects(text).split(CLAUSE_SPLIT)) {
    let clause = raw.trim();
    if (!clause) continue;
    const hits = [];
    for (const entry of TERMS) {
      const at = findTerm(clause, entry.term);
      if (at === -1) continue;
      hits.push(entry);
      clause = `${clause.slice(0, at)}${" ".repeat(entry.term.length)}${clause.slice(at + entry.term.length)}`;
    }
    if (!hits.length) continue;
    const negative = NEG.some((cue) => cueIn(clause, cue)) || /n't\b/.test(clause);
    const positive = POS.some((cue) => cueIn(clause, cue));
    const clauseSide = negative ? "avoid" : positive ? "keep" : "unclear";
    for (const hit of hits) {
      const side = hit.side ?? clauseSide;
      const prior = found.get(hit.aspect);
      if (!prior) found.set(hit.aspect, { aspect: hit.aspect, side, cue: hit.cue });
      else if (prior.side === "unclear" && side !== "unclear") found.set(hit.aspect, { aspect: hit.aspect, side, cue: hit.cue });
      else if (prior.side !== side && side !== "unclear") found.set(hit.aspect, { ...prior, side: "unclear" });
    }
  }
  return [...found.values()].filter((item) => !existing.keep.includes(item.aspect) && !existing.avoid.includes(item.aspect)).sort((a, b) => a.aspect.localeCompare(b.aspect));
}
function proposalFile(ws, id) {
  return path.join(creativeDir(ws, "aspects"), `${validateAspectProposalId(id)}.json`);
}
function readAspectProposal(ws, id) {
  assertOwnerProcess();
  const doc = readRecord(ws, proposalFile(ws, id), "creative_aspect_proposal");
  if (!doc) throw new CreativeError("not_found", `No aspect proposal ${id} in this brand.`);
  if (doc.proposal_id !== id) throw new CreativeError("invalid_record", `The file for ${id} carries another proposal id.`);
  return doc;
}
function listAspectProposals(ws, filter = {}) {
  assertOwnerProcess();
  const folder = creativeDir(ws, "aspects");
  if (!dirUsable(ws, folder)) return [];
  const out = [];
  for (const name of fs.readdirSync(folder).sort()) {
    const match = /^(ap_[0-9a-f-]{36})\.json$/.exec(name);
    if (!match) continue;
    try {
      out.push(readAspectProposal(ws, match[1]));
    } catch (error) {
      if (!(error instanceof CreativeError)) throw error;
    }
  }
  return out.filter((item) => (filter.project_id ? item.project_id === filter.project_id : true) && (filter.state ? item.state === filter.state : true)).sort((a, b) => a.created_at.localeCompare(b.created_at));
}
function suggestAspects(ws, input) {
  assertOwnerProcess();
  const project = readProject(ws, validateProjectId(input.project_id));
  let events = project.feedback;
  if (input.feedback_id !== void 0) {
    const id = validateFeedbackId(input.feedback_id);
    events = project.feedback.filter((event) => event.feedback_id === id);
    if (!events.length) throw new CreativeError("not_found", `No feedback ${id} in ${project.project_id}.`);
  }
  const pending = listAspectProposals(ws, { project_id: project.project_id, state: "pending" });
  const result = { created: [], skipped: [] };
  return withLock(ws, "creative-aspects", () => {
    for (const event of events.slice(0, CREATIVE_LIMITS.maxAspectProposalsPerRun)) {
      const status = sourceStatus(ws, event.note);
      if (!status.loaded || status.state === "archived" || status.state === "missing") {
        result.skipped.push({ feedback_id: event.feedback_id, reason: "note_unavailable" });
        continue;
      }
      if (pending.some((item) => item.feedback_id === event.feedback_id && item.note.revision === status.loaded.revision)) {
        result.skipped.push({ feedback_id: event.feedback_id, reason: "pending_exists" });
        continue;
      }
      const suggestions = deriveAspects(status.loaded.note.body, event);
      if (!suggestions.length) {
        result.skipped.push({ feedback_id: event.feedback_id, reason: "no_suggestion" });
        continue;
      }
      const now = ws.now().toISOString();
      const proposal = {
        schema_version: CREATIVE_SCHEMA_VERSION,
        kind: "creative_aspect_proposal",
        proposal_id: newAspectProposalId(),
        brand_slug: ws.brandSlug,
        project_id: project.project_id,
        feedback_id: event.feedback_id,
        variant_id: event.variant_id,
        // The revision read now: approval is refused if the note changes before the owner decides.
        note: { id: status.loaded.id, revision: status.loaded.revision },
        method: ASPECT_METHOD,
        label: "machine_suggestion_unverified",
        suggestions,
        state: "pending",
        applied: [],
        decided_at: null,
        created_at: now
      };
      writeRecord(ws, proposalFile(ws, proposal.proposal_id), proposal);
      result.created.push(proposal);
    }
    return result;
  });
}
function parseAspectChoices(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
    const [aspect, side] = item.split(":");
    return { aspect: aspect ?? "", side: side ?? null };
  });
}
function approveAspects(ws, input) {
  assertOwnerProcess();
  const id = validateAspectProposalId(input.proposal_id);
  if (!approvalProofMatches(ws.root, input.proof)) throw new CreativeError("proof", "Approval refused: missing or wrong owner approval proof. Nothing was changed.");
  return withLock(ws, "creative-aspects", () => {
    const proposal = readAspectProposal(ws, id);
    if (proposal.state !== "pending") throw new CreativeError("refused", `${id} is ${proposal.state}. Only a pending proposal can be approved.`);
    if (input.expected_digest !== void 0 && aspectProposalDigest(proposal) !== input.expected_digest) throw new CreativeError("stale", `${id} changed since it was shown for approval. Review it again. Nothing was applied.`);
    const status = sourceStatus(ws, proposal.note);
    if (!status.current) throw new CreativeError("stale_source", `Note ${proposal.note.id} is ${status.state} since these aspects were suggested. Run aspects suggest again. Nothing was applied.`);
    let chosen;
    if (input.only && input.only.length) {
      chosen = input.only.map((choice) => {
        const suggestion = proposal.suggestions.find((item) => item.aspect === choice.aspect);
        if (!suggestion) throw new CreativeError("invalid_input", `${choice.aspect} is not one of this proposal's suggestions.`);
        const side = choice.side ?? suggestion.side;
        if (!ASPECT_SIDES.includes(side)) throw new CreativeError("invalid_input", `Choose keep or avoid for ${choice.aspect} (for example ${choice.aspect}:keep).`);
        return { aspect: suggestion.aspect, side };
      });
    } else {
      chosen = proposal.suggestions.filter((item) => item.side !== "unclear").map((item) => ({ aspect: item.aspect, side: item.side }));
    }
    if (!chosen.length) throw new CreativeError("invalid_input", "Nothing to apply: every suggestion is unclear. Name the side with --only aspect:keep|avoid, or reject the proposal.");
    let feedback = null;
    updateProject(ws, proposal.project_id, (project) => {
      const event = project.feedback.find((item) => item.feedback_id === proposal.feedback_id);
      if (!event) throw new CreativeError("not_found", `Feedback ${proposal.feedback_id} is no longer in ${proposal.project_id}.`);
      for (const item of chosen) {
        const other = item.side === "keep" ? event.avoid : event.keep;
        if (other.includes(item.aspect)) throw new CreativeError("refused", `${item.aspect} is already ${item.side === "keep" ? "avoid" : "keep"} on this feedback. Nothing was applied.`);
      }
      for (const item of chosen) {
        const list = item.side === "keep" ? event.keep : event.avoid;
        if (!list.includes(item.aspect)) list.push(item.aspect);
      }
      event.aspect_proposals = [...event.aspect_proposals ?? [], proposal.proposal_id];
      feedback = event;
    });
    proposal.state = "approved";
    proposal.applied = chosen;
    proposal.decided_at = ws.now().toISOString();
    writeRecord(ws, proposalFile(ws, proposal.proposal_id), proposal);
    return { proposal, feedback };
  });
}
function rejectAspects(ws, input) {
  assertOwnerProcess();
  const id = validateAspectProposalId(input.proposal_id);
  return withLock(ws, "creative-aspects", () => {
    const proposal = readAspectProposal(ws, id);
    if (proposal.state !== "pending") throw new CreativeError("refused", `${id} is ${proposal.state}. Only a pending proposal can be rejected.`);
    proposal.state = "rejected";
    proposal.decided_at = ws.now().toISOString();
    writeRecord(ws, proposalFile(ws, proposal.proposal_id), proposal);
    return proposal;
  });
}

export {
  listAspectProposals,
  suggestAspects,
  parseAspectChoices,
  approveAspects,
  rejectAspects
};
