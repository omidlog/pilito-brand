import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  approveAspects,
  listAspectProposals
} from "./chunk-3UUYBU2Z.mjs";
import {
  PENDING_KINDS,
  approveAllPending,
  approveTokens,
  dryRunReport,
  planAllPending,
  readTokenApprovals
} from "./chunk-6K2U6D7O.mjs";
import {
  approvePreference,
  approveWeek,
  aspectProposalDigest,
  listPreferences,
  loadWeekRevision,
  preferenceDigest,
  reviewWeek,
  scanWeeks,
  sourceStatus
} from "./chunk-ZYAYDNGS.mjs";
import {
  approveRevision,
  loadRevision,
  reviewRevision,
  scanRecords
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-MHQ2KNS6.mjs";
import {
  SURFACES,
  approveKit,
  readKit,
  reviewKit
} from "./chunk-AQ6QTRSP.mjs";
import {
  compileTokens,
  tokenDigest
} from "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  approvalProofMatches,
  openWorkspace
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// packages/brand-core/src/pending/index.ts
var EXTRA_KINDS = ["strategy", "week", "design_token", "social_style", "creative_preference", "aspect_proposal"];
var ALL_KINDS = [...PENDING_KINDS, ...EXTRA_KINDS];
var LOOK_FIRST_KINDS = ["strategy", "week"];
var KIND_ALIASES = {
  fact: "fact",
  facts: "fact",
  change: "change",
  changes: "change",
  evidence: "evidence",
  asset: "asset",
  assets: "asset",
  strategy: "strategy",
  strategies: "strategy",
  week: "week",
  weeks: "week",
  calendar: "week",
  social: "social_style",
  social_style: "social_style",
  style: "social_style",
  styles: "social_style",
  creative: "creative_preference",
  creative_preference: "creative_preference",
  preference: "creative_preference",
  preferences: "creative_preference",
  aspect: "aspect_proposal",
  aspects: "aspect_proposal",
  aspect_proposal: "aspect_proposal",
  token: "design_token",
  tokens: "design_token",
  design_token: "design_token"
};
function parseOnlyKinds(value) {
  if (value === void 0) return void 0;
  const kinds = value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const out = [];
  for (const name of kinds) {
    const kind = KIND_ALIASES[name];
    if (!kind) throw new Error(`--only does not know "${name}". Use: fact, change, evidence, asset, strategy, week, token, social, creative, aspect.`);
    if (!out.includes(kind)) out.push(kind);
  }
  if (out.length === 0) throw new Error("--only needs at least one kind.");
  return out;
}
var fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
var EXTRA_TITLES = {
  strategy: { en: "Strategies (read these first)", fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC\u200C\u0647\u0627 (\u0627\u0648\u0644 \u0627\u06CC\u0646\u200C\u0647\u0627 \u0631\u0627 \u0628\u062E\u0648\u0627\u0646\u06CC\u062F)", tr: "Stratejiler (\xF6nce bunlar\u0131 okuyun)" },
  week: { en: "Content calendar weeks (read these first)", fa: "\u0647\u0641\u062A\u0647\u200C\u0647\u0627\u06CC \u062A\u0642\u0648\u06CC\u0645 \u0645\u062D\u062A\u0648\u0627 (\u0627\u0648\u0644 \u0627\u06CC\u0646\u200C\u0647\u0627 \u0631\u0627 \u0628\u062E\u0648\u0627\u0646\u06CC\u062F)", tr: "\u0130\xE7erik takvimi haftalar\u0131 (\xF6nce bunlar\u0131 okuyun)" },
  design_token: { en: "Design tokens generated from approved answers", fa: "\u062A\u0648\u06A9\u0646\u200C\u0647\u0627\u06CC \u0637\u0631\u0627\u062D\u06CC \u0633\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0627\u0632 \u062C\u0648\u0627\u0628\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "Onayl\u0131 yan\u0131tlardan \xFCretilen tasar\u0131m tokenlar\u0131" },
  social_style: { en: "Social style kit, per format", fa: "\u06A9\u06CC\u062A \u0633\u0628\u06A9 \u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC\u060C \u0628\u0631\u0627\u06CC \u0647\u0631 \u0642\u0627\u0644\u0628", tr: "Sosyal stil kiti, bi\xE7im ba\u015F\u0131na" },
  creative_preference: { en: "Creative preferences (project scope)", fa: "\u062A\u0631\u062C\u06CC\u062D\u0627\u062A \u062E\u0644\u0627\u0642\u0627\u0646\u0647 (\u062F\u0631 \u0633\u0637\u062D \u067E\u0631\u0648\u0698\u0647)", tr: "Yarat\u0131c\u0131 tercihler (proje kapsam\u0131)" },
  aspect_proposal: { en: "Feedback aspects (keep / avoid)", fa: "\u062C\u0646\u0628\u0647\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u062E\u0648\u0631\u062F (\u0646\u06AF\u0647\u200C\u062F\u0627\u0631 / \u067E\u0631\u0647\u06CC\u0632)", tr: "Geri bildirim y\xF6nleri (koru / ka\xE7\u0131n)" }
};
var T = {
  strategy: {
    en: '{type} strategy "{title}", revision {rev} ({base}), {recs} recommendation(s), valid until {until}.',
    fa: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC {type} \xAB{title}\xBB\u060C \u0646\u0633\u062E\u0647\u0654 {rev} ({base})\u060C {recs} \u062A\u0648\u0635\u06CC\u0647\u060C \u0645\u0639\u062A\u0628\u0631 \u062A\u0627 {until}.",
    tr: '{type} stratejisi "{title}", revizyon {rev} ({base}), {recs} \xF6neri, {until} tarihine kadar ge\xE7erli.'
  },
  replaces: { en: "replaces revision {n}", fa: "\u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0646\u0633\u062E\u0647\u0654 {n}", tr: "{n}. revizyonun yerine" },
  first: { en: "first revision", fa: "\u0646\u062E\u0633\u062A\u06CC\u0646 \u0646\u0633\u062E\u0647", tr: "ilk revizyon" },
  week: {
    en: "Week {start} to {end}, revision {rev}: {slots} slot(s) on {channels}, {gaps} open gap(s).",
    fa: "\u0647\u0641\u062A\u0647\u0654 {start} \u062A\u0627 {end}\u060C \u0646\u0633\u062E\u0647\u0654 {rev}: {slots} \u0627\u0633\u0644\u0627\u062A \u062F\u0631 {channels}\u060C {gaps} \u062C\u0627\u06CC \u062E\u0627\u0644\u06CC \u0628\u0627\u0632.",
    tr: "{start} \u2013 {end} haftas\u0131, revizyon {rev}: {channels} \xFCzerinde {slots} yuva, {gaps} a\xE7\u0131k bo\u015Fluk."
  },
  social: {
    en: "{count} style(s) for {surface}: {names}.",
    fa: "{count} \u0633\u0628\u06A9 \u0628\u0631\u0627\u06CC {surface}: {names}.",
    tr: "{surface} i\xE7in {count} stil: {names}."
  },
  socialInvalid: { en: " Includes a style edited after approval.", fa: " \u0634\u0627\u0645\u0644 \u0633\u0628\u06A9\u06CC \u0627\u0633\u062A \u06A9\u0647 \u067E\u0633 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F\u0647.", tr: " Onaydan sonra d\xFCzenlenmi\u015F bir stil i\xE7eriyor." },
  creative: {
    en: '"{statement}" for project {project}. Approved at project scope (for a series use brand:creative approve --scope series).',
    fa: "\xAB{statement}\xBB \u0628\u0631\u0627\u06CC \u067E\u0631\u0648\u0698\u0647\u0654 {project}. \u062F\u0631 \u0633\u0637\u062D \u067E\u0631\u0648\u0698\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0645\u06CC\u200C\u0634\u0648\u062F (\u0628\u0631\u0627\u06CC \u06CC\u06A9 \u0633\u0631\u06CC \u0627\u0632 brand:creative approve --scope series \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F).",
    tr: '{project} projesi i\xE7in "{statement}". Proje kapsam\u0131nda onaylan\u0131r (bir seri i\xE7in brand:creative approve --scope series kullan\u0131n).'
  },
  token: {
    en: "{id} = {value} (from {source}).",
    fa: "{id} = {value} (\u0627\u0632 {source}).",
    tr: "{id} = {value} ({source} kayna\u011F\u0131ndan)."
  },
  tokenChanged: {
    en: "Already approved with a different value. Remove the old approval in a reviewed edit first (brand/tokens/approvals.yaml).",
    fa: "\u0642\u0628\u0644\u0627\u064B \u0628\u0627 \u0645\u0642\u062F\u0627\u0631 \u062F\u06CC\u06AF\u0631\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u0633\u062A. \u0627\u0648\u0644 \u062A\u0623\u06CC\u06CC\u062F \u0642\u0628\u0644\u06CC \u0631\u0627 \u062F\u0631 \u06CC\u06A9 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647 \u0628\u0631\u062F\u0627\u0631\u06CC\u062F (brand/tokens/approvals.yaml).",
    tr: "Farkl\u0131 bir de\u011Ferle zaten onayl\u0131. \xD6nce eski onay\u0131 incelenmi\u015F bir d\xFCzenlemeyle kald\u0131r\u0131n (brand/tokens/approvals.yaml)."
  },
  aspect: {
    en: "Keep: {keep}. Avoid: {avoid}. From feedback {feedback} on project {project} (machine suggestion; unclear sides are not applied).",
    fa: "\u0646\u06AF\u0647\u200C\u062F\u0627\u0631: {keep}. \u067E\u0631\u0647\u06CC\u0632: {avoid}. \u0627\u0632 \u0628\u0627\u0632\u062E\u0648\u0631\u062F {feedback} \u062F\u0631 \u067E\u0631\u0648\u0698\u0647\u0654 {project} (\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u0627\u0634\u06CC\u0646\u06CC\u061B \u062C\u0646\u0628\u0647\u200C\u0647\u0627\u06CC \u0646\u0627\u0645\u0634\u062E\u0635 \u0627\u0639\u0645\u0627\u0644 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F).",
    tr: "Koru: {keep}. Ka\xE7\u0131n: {avoid}. {project} projesindeki {feedback} geri bildiriminden (makine \xF6nerisi; belirsiz y\xF6nler uygulanmaz)."
  },
  none: { en: "none", fa: "\u0647\u06CC\u0686", tr: "yok" },
  allUnclear: {
    en: "Every suggestion is unclear. Choose sides with brand:creative aspects approve --id {id} --only aspect:keep|avoid.",
    fa: "\u0647\u0645\u0647\u0654 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0647\u0627 \u0646\u0627\u0645\u0634\u062E\u0635\u200C\u0627\u0646\u062F. \u0633\u0645\u062A \u0631\u0627 \u0628\u0627 brand:creative aspects approve --id {id} --only aspect:keep|avoid \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.",
    tr: "\xD6nerilerin hepsi belirsiz. Y\xF6nleri brand:creative aspects approve --id {id} --only aspect:keep|avoid ile se\xE7in."
  },
  excluded: { en: "Excluded with --exclude.", fa: "\u0628\u0627 --exclude \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F.", tr: "--exclude ile hari\xE7 tutuldu." },
  approveReason: {
    en: "Approving passes the reviewed digest to the kind's own approve command. It authorizes no post, publication, schedule, ad or spend.",
    fa: "\u062A\u0623\u06CC\u06CC\u062F\u060C \u0647\u0645\u0627\u0646 \u0686\u06A9\u06CC\u062F\u0647\u0654 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0634\u062F\u0647 \u0631\u0627 \u0628\u0647 \u0641\u0631\u0645\u0627\u0646 \u062A\u0623\u06CC\u06CC\u062F \u0647\u0645\u06CC\u0646 \u0646\u0648\u0639 \u0645\u06CC\u200C\u062F\u0647\u062F. \u0647\u06CC\u0686 \u067E\u0633\u062A\u060C \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u062A\u0628\u0644\u06CC\u063A \u06CC\u0627 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "Onay, incelenen \xF6zeti bu t\xFCr\xFCn kendi onay komutuna verir. Hi\xE7bir g\xF6nderiye, yay\u0131na, zamanlamaya, reklama veya harcamaya izin vermez."
  }
};
var short = (text, max = 90) => text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
function message(error) {
  return error instanceof Error ? error.message : String(error);
}
function strategyEntries(ws, lang) {
  const out = [];
  for (const record of scanRecords(ws)) {
    const newest = record.revisions.reduce((max, item) => Math.max(max, item.revision), 0);
    const entry = record.revisions.find((item) => item.revision === newest);
    if (!entry || entry.state !== "draft") continue;
    const review_with = `npm run brand:strategy -- review --id ${record.strategy_id} --revision ${entry.revision}`;
    const base = { kind: "strategy", id: record.strategy_id, revision: entry.revision, digest: entry.content_sha256, review_with, look_first: true };
    try {
      const review = reviewRevision(ws, { strategy_id: record.strategy_id, revision: entry.revision });
      const content = loadRevision(ws, record.strategy_id, entry.revision, entry).content;
      const summary = fill(T.strategy[lang], {
        type: record.type,
        title: short(content.title, 70),
        rev: entry.revision,
        base: review.supersedes_revision === null ? T.first[lang] : fill(T.replaces[lang], { n: review.supersedes_revision }),
        recs: review.impact.recommendations,
        until: review.dates.valid_until.slice(0, 10)
      });
      out.push({ ...base, digest: review.content_sha256, summary, decision: review.blockers.length ? "skip" : "approve", reason: review.blockers.length ? review.blockers.join(" ") : T.approveReason[lang] });
    } catch (error) {
      out.push({ ...base, summary: `${record.strategy_id} r${entry.revision}`, decision: "skip", reason: message(error) });
    }
  }
  return out;
}
function weekEntries(ws, lang) {
  const out = [];
  for (const record of scanWeeks(ws)) {
    const newest = record.revisions.reduce((max, item) => Math.max(max, item.revision), 0);
    const entry = record.revisions.find((item) => item.revision === newest);
    if (!entry || entry.state !== "draft") continue;
    const review_with = `npm run brand:content -- week review --week ${record.week_id} --revision ${entry.revision}`;
    const base = { kind: "week", id: record.week_id, revision: entry.revision, digest: entry.content_sha256, review_with, look_first: true };
    try {
      const review = reviewWeek(ws, { week_id: record.week_id, revision: entry.revision, lang });
      const content = loadWeekRevision(ws, record.week_id, entry.revision, entry).content;
      const channels = [...new Set(content.slots.map((slot) => slot.channel))].join(", ") || T.none[lang];
      const summary = fill(T.week[lang], { start: content.week_start, end: content.week_end, rev: entry.revision, slots: review.slots, channels, gaps: review.gaps.length });
      out.push({ ...base, digest: review.content_sha256, summary, decision: review.blockers.length ? "skip" : "approve", reason: review.blockers.length ? review.blockers.join(" ") : T.approveReason[lang] });
    } catch (error) {
      out.push({ ...base, summary: `${record.week_id} r${entry.revision}`, decision: "skip", reason: message(error) });
    }
  }
  return out;
}
function socialEntries(ws, lang) {
  const read = readKit(ws.root, ws.brandSlug);
  if (read.state === "missing") return [];
  if (read.state === "invalid") {
    return [{ kind: "social_style", id: "style-kit", revision: null, digest: "", decision: "skip", summary: "brand/social/style-kit.yaml", reason: read.error, review_with: "npm run brand:social -- kit review --surface <surface>", look_first: false }];
  }
  const out = [];
  for (const surface of SURFACES) {
    if (!read.kit.styles.some((style) => style.surface === surface)) continue;
    const review_with = `npm run brand:social -- kit review --surface ${surface}`;
    try {
      const review = reviewKit(ws, { surface });
      if (!review.expect_sha) continue;
      const styles = read.kit.styles.filter((style) => review.approvable.includes(style.id));
      const names = styles.map((style) => style.name[lang] ?? style.name.en).join(", ");
      const invalid = review.items.some((item) => review.approvable.includes(item.style_id) && item.status === "invalid_approval");
      const summary = fill(T.social[lang], { count: styles.length, surface, names: short(names, 120) }) + (invalid ? T.socialInvalid[lang] : "");
      const blocked = review.safety_problems.length > 0;
      out.push({
        kind: "social_style",
        id: surface,
        revision: null,
        digest: review.expect_sha,
        decision: blocked ? "skip" : "approve",
        summary,
        reason: blocked ? `The kit holds text that looks like ${review.safety_problems.join(", ")}. Remove it first.` : T.approveReason[lang],
        review_with,
        look_first: false,
        styles: review.approvable
      });
    } catch (error) {
      out.push({ kind: "social_style", id: surface, revision: null, digest: "", decision: "skip", summary: surface, reason: message(error), review_with, look_first: false });
    }
  }
  return out;
}
function creativeEntries(ws, lang) {
  const out = [];
  for (const pref of listPreferences(ws)) {
    if (pref.state !== "draft") continue;
    const stale = pref.sources.map((ref) => ({ ref, status: sourceStatus(ws, ref) })).filter((item) => !item.status.current);
    out.push({
      kind: "creative_preference",
      id: pref.preference_id,
      revision: null,
      digest: preferenceDigest(pref),
      decision: stale.length ? "skip" : "approve",
      summary: fill(T.creative[lang], { statement: short(pref.statement, 80), project: pref.project_id }),
      reason: stale.length ? `Source ${stale.map((item) => `${item.ref.id} is ${item.status.state}`).join(", ")} since it was suggested. Suggest it again.` : T.approveReason[lang],
      review_with: `npm run brand:creative -- preferences`,
      look_first: false
    });
  }
  return out;
}
function aspectEntries(ws, lang) {
  const out = [];
  for (const proposal of listAspectProposals(ws, { state: "pending" })) {
    const keep = proposal.suggestions.filter((item) => item.side === "keep").map((item) => item.aspect);
    const avoid = proposal.suggestions.filter((item) => item.side === "avoid").map((item) => item.aspect);
    const note = sourceStatus(ws, proposal.note);
    const clear = keep.length + avoid.length > 0;
    out.push({
      kind: "aspect_proposal",
      id: proposal.proposal_id,
      revision: null,
      digest: aspectProposalDigest(proposal),
      decision: clear && note.current ? "approve" : "skip",
      summary: fill(T.aspect[lang], { keep: keep.join(", ") || T.none[lang], avoid: avoid.join(", ") || T.none[lang], feedback: proposal.feedback_id, project: proposal.project_id }),
      reason: !note.current ? `Note ${proposal.note.id} is ${note.state} since these aspects were suggested. Run aspects suggest again.` : !clear ? fill(T.allUnclear[lang], { id: proposal.proposal_id }) : T.approveReason[lang],
      review_with: `npm run brand:creative -- aspects list --project ${proposal.project_id} --state pending`,
      look_first: false
    });
  }
  return out;
}
function tokenEntries(ws, lang) {
  const compiled = compileTokens(ws.root);
  if (compiled.errors.length) return [];
  const approved = readTokenApprovals(ws.root);
  const out = [];
  for (const [id, token] of Object.entries(compiled.flat).sort(([a], [b]) => a.localeCompare(b))) {
    if (token.source !== "generated") continue;
    const digest = tokenDigest(token);
    const prior = approved[id];
    if (prior?.value_sha256 === digest) continue;
    const value = typeof token.value === "string" ? token.value : JSON.stringify(token.value);
    out.push({
      kind: "design_token",
      id,
      revision: null,
      digest,
      decision: prior ? "skip" : "approve",
      summary: fill(T.token[lang], { id, value: short(value, 60), source: token.sourceFact ?? "generated" }),
      reason: prior ? T.tokenChanged[lang] : T.approveReason[lang],
      review_with: "npm run brand:tokens:generate",
      look_first: false
    });
  }
  return out;
}
var COLLECTORS = {
  strategy: strategyEntries,
  week: weekEntries,
  design_token: tokenEntries,
  social_style: socialEntries,
  creative_preference: creativeEntries,
  aspect_proposal: aspectEntries
};
function assertOwner() {
  if (process.env[AGENT_TOKEN_ENV]) throw new Error(`Pending approvals are the owner's. Refusing while ${AGENT_TOKEN_ENV} is set. Nothing was read or changed.`);
}
function planEverything(approvals, root, options = {}) {
  assertOwner();
  const lang = options.lang ?? "en";
  const exclude = new Set((options.exclude ?? []).map((id) => id.trim()).filter(Boolean));
  const base = planAllPending(approvals, root, { exclude: [...exclude], actor: options.actor });
  const only = options.only && options.only.length ? options.only : null;
  const ws = openWorkspace(root, options.now ? { now: options.now } : {});
  const matched = new Set([...exclude].filter((id) => !base.unmatched_excludes.includes(id)));
  const extras = [];
  for (const kind of EXTRA_KINDS) {
    if (only && !only.includes(kind)) continue;
    for (const entry of COLLECTORS[kind](ws, lang)) {
      if (exclude.has(entry.id)) {
        matched.add(entry.id);
        extras.push({ ...entry, decision: "skip", reason: T.excluded[lang] });
      } else extras.push(entry);
    }
  }
  const baseEntries = only ? base.entries.filter((entry) => only.includes(entry.kind)) : base.entries;
  return { base: { entries: baseEntries, unmatched_excludes: [] }, extras, only, unmatched_excludes: [...exclude].filter((id) => !matched.has(id)), lang };
}
var STALE_CODES = /* @__PURE__ */ new Set(["stale", "stale_revision", "stale_source", "stale_pin"]);
function outcomeOfError(error) {
  const code = error?.code;
  return { outcome: typeof code === "string" && STALE_CODES.has(code) ? "stale" : "refused", reason: message(error) };
}
function approveExtra(ws, entry, proof, lang) {
  let fresh;
  try {
    fresh = COLLECTORS[entry.kind](ws, lang).find((item) => item.id === entry.id);
  } catch (error) {
    return outcomeOfError(error);
  }
  if (!fresh || fresh.revision !== entry.revision || fresh.digest !== entry.digest) {
    return { outcome: "stale", reason: "Changed since it was planned (a new revision or different content). Nothing was approved; review it again." };
  }
  if (fresh.decision !== "approve") return { outcome: "stale", reason: `No longer approvable: ${fresh.reason}` };
  try {
    switch (entry.kind) {
      case "strategy": {
        const done = approveRevision(ws, { strategy_id: entry.id, revision: entry.revision, expected_sha256: entry.digest, proof });
        return { outcome: "approved", reason: `Approved revision ${done.approved.revision}${done.superseded ? `; revision ${done.superseded.revision} is superseded` : ""}. Nothing was published or spent.` };
      }
      case "week": {
        const done = approveWeek(ws, { week_id: entry.id, revision: entry.revision, expected_sha256: entry.digest, proof, lang });
        return { outcome: "approved", reason: `Approved revision ${done.approved.revision}${done.superseded ? `; revision ${done.superseded.revision} is superseded` : ""}. Nothing was posted or scheduled.` };
      }
      case "design_token": {
        const done = approveTokens(ws.root, [entry.id], proof);
        const item = done.results[0];
        if (!done.ok || !item || item.outcome !== "approved" && item.outcome !== "unchanged") return { outcome: "refused", reason: item?.reason ?? done.errors.join("; ") };
        return { outcome: "approved", reason: "Value hash recorded. Not published." };
      }
      case "social_style": {
        const done = approveKit(ws, { surface: entry.id, expected_sha256: entry.digest, proof });
        return { outcome: "approved", reason: `Approved ${done.approved.map((item) => item.style_id).join(", ")}. Design guidance only; it authorizes no post.` };
      }
      case "creative_preference": {
        const done = approvePreference(ws, { preference_id: entry.id, proof, expected_digest: entry.digest });
        return { outcome: "approved", reason: `Approved for project ${done.approved.project_id}${done.superseded ? `; ${done.superseded.preference_id} is superseded` : ""}.` };
      }
      case "aspect_proposal": {
        const done = approveAspects(ws, { proposal_id: entry.id, proof, expected_digest: entry.digest });
        return { outcome: "approved", reason: `Applied ${done.proposal.applied.map((item) => `${item.aspect}:${item.side}`).join(", ")} to feedback ${done.feedback.feedback_id}.` };
      }
    }
  } catch (error) {
    return outcomeOfError(error);
  }
}
function extraItem(entry, outcome, reason) {
  return { kind: entry.kind, id: entry.id, question_id: null, outcome, reason, revision: entry.revision, digest: entry.digest, summary: entry.summary };
}
function approveEverything(approvals, root, plan, proof, actor = "owner", options = {}) {
  assertOwner();
  const counts = { approved: 0, skipped: 0, refused: 0, stale: 0 };
  const approvable = plan.base.entries.some((entry) => entry.decision === "approve") || plan.extras.some((entry) => entry.decision === "approve");
  const finish = (results, proofState) => {
    for (const item of results) counts[item.outcome] += 1;
    return { mode: "approve", dry_run: false, ok: proofState !== "rejected" && counts.refused === 0, proof: proofState, approved: counts.approved, counts, results, unmatched_excludes: plan.unmatched_excludes };
  };
  const skipped = (entry) => extraItem(entry, entry.decision === "approve" ? "refused" : "skipped", entry.reason);
  if (!approvable) {
    const base2 = approveAllPending(approvals, root, plan.base, void 0, actor);
    return finish([...base2.results, ...plan.extras.map(skipped)], "not_needed");
  }
  if (!approvalProofMatches(root, proof)) {
    const refused = (kind, id, question_id) => ({ kind, id, question_id, outcome: "refused", reason: "Approval proof rejected. Nothing was changed." });
    return finish([...plan.base.entries.map((entry) => refused(entry.kind, entry.id, entry.question_id)), ...plan.extras.map((entry) => ({ ...refused(entry.kind, entry.id, null), revision: entry.revision, digest: entry.digest, summary: entry.summary }))], "rejected");
  }
  const base = approveAllPending(approvals, root, plan.base, proof, actor);
  const ws = openWorkspace(root, options.now ? { now: options.now } : {});
  const extras = plan.extras.map((entry) => {
    if (entry.decision !== "approve") return extraItem(entry, "skipped", entry.reason);
    const done = approveExtra(ws, entry, proof, plan.lang);
    return extraItem(entry, done.outcome, done.reason);
  });
  return finish([...base.results, ...extras], "accepted");
}
function approveCommand(plan, exclude = []) {
  const parts = ["npm run brand:approve -- --all-pending"];
  if (plan.only) parts.push(`--only ${plan.only.join(",")}`);
  if (exclude.length) parts.push(`--exclude ${exclude.join(",")}`);
  return parts.join(" ");
}
function everythingDryRun(plan, exclude = []) {
  const base = dryRunReport(plan.base.entries, []);
  const extras = plan.extras.map((entry) => ({
    kind: entry.kind,
    id: entry.id,
    question_id: null,
    decision: entry.decision === "approve" ? "would_approve" : "would_skip",
    because: entry.decision === "approve" ? null : "skipped",
    reason: entry.reason,
    revision: entry.revision,
    digest: entry.digest,
    summary: entry.summary,
    review_with: entry.review_with,
    look_first: entry.look_first
  }));
  const items = [...base.items, ...extras];
  const count = items.filter((item) => item.decision === "would_approve").length;
  const notice = `DRY RUN: ${count} item${count === 1 ? "" : "s"} would be approved. Nothing was changed.`;
  return { ...base, notice, would_approve: count, would_skip: items.length - count, items, unmatched_excludes: plan.unmatched_excludes, approve_with: approveCommand(plan, exclude) };
}
var BASE_TITLES = { fact: "Facts", change: "Change proposals", evidence: "Evidence awaiting verification", asset: "Draft assets" };
function title(kind, lang) {
  return PENDING_KINDS.includes(kind) ? BASE_TITLES[kind] : EXTRA_TITLES[kind][lang];
}
function groupedLines(items, lang, line) {
  const lines = [];
  for (const kind of ALL_KINDS) {
    const rows = items.filter((item) => item.kind === kind);
    if (rows.length === 0) continue;
    lines.push("", `${title(kind, lang)} (${rows.length})`, ...rows.flatMap(line));
  }
  return lines;
}
function formatEverythingDryRun(report, lang = "en") {
  const lines = [report.notice, "This is a preview: not the review queue and not an approval result. No proof was read."];
  if (report.items.length === 0) lines.push("", "Nothing is pending.");
  lines.push(
    ...groupedLines(report.items, lang, (item) => {
      const head = `  ${(item.decision === "would_approve" ? "would approve" : `would skip${item.because === "stale" ? " (stale)" : item.because === "refused" ? " (refused)" : ""}`).padEnd(24)} ${item.id}`;
      if (item.summary === void 0) return [`${head}  ${item.reason}`];
      return [`${head}${item.revision ? ` r${item.revision}` : ""}  ${item.summary}`, ...item.decision === "would_approve" ? [] : [`      ${item.reason}`], ...item.look_first && item.review_with ? [`      ${item.review_with}`] : []];
    })
  );
  if (report.unmatched_excludes.length) lines.push("", `--exclude matched nothing pending: ${report.unmatched_excludes.join(", ")}`);
  lines.push("", `${report.notice} Run the same command without --dry-run to approve.`);
  return lines.join("\n");
}
function formatEverything(result, lang = "en") {
  const lines = result.proof === "rejected" ? ["APPROVAL REFUSED: proof rejected. Nothing was changed."] : result.proof === "not_needed" ? ["NOTHING TO APPROVE: no proof was read and nothing was changed."] : [`APPROVAL RESULT: ${result.counts.approved} approved, ${result.counts.skipped} skipped, ${result.counts.refused} refused, ${result.counts.stale} stale. Nothing was published.`];
  if (result.results.length === 0) lines.push("", "Nothing is pending.");
  lines.push(...groupedLines(result.results, lang, (item) => [`  ${item.outcome.padEnd(9)} ${item.id}${item.revision ? ` r${item.revision}` : ""}  ${item.reason}`]));
  if (result.unmatched_excludes.length) lines.push("", `--exclude matched nothing pending: ${result.unmatched_excludes.join(", ")}`);
  return lines.join("\n");
}
var PLAIN = {
  nothing: { en: "Nothing is waiting for your approval.", fa: "\u0686\u06CC\u0632\u06CC \u0645\u0646\u062A\u0638\u0631 \u062A\u0623\u06CC\u06CC\u062F \u0634\u0645\u0627 \u0646\u06CC\u0633\u062A.", tr: "Onay\u0131n\u0131z\u0131 bekleyen bir \u015Fey yok." },
  head: { en: "{n} item(s) are waiting for your approval.", fa: "{n} \u0645\u0648\u0631\u062F \u0645\u0646\u062A\u0638\u0631 \u062A\u0623\u06CC\u06CC\u062F \u0634\u0645\u0627\u0633\u062A.", tr: "Onay\u0131n\u0131z\u0131 bekleyen {n} \xF6\u011Fe var." },
  waiting: { en: "needs your approval", fa: "\u0645\u0646\u062A\u0638\u0631 \u062A\u0623\u06CC\u06CC\u062F", tr: "onay bekliyor" },
  blocked: { en: "cannot be approved yet", fa: "\u0647\u0646\u0648\u0632 \u0642\u0627\u0628\u0644 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06CC\u0633\u062A", tr: "hen\xFCz onaylanamaz" },
  readFirst: { en: "Read strategies and weeks in full first:", fa: "\u0627\u0648\u0644 \u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC\u200C\u0647\u0627 \u0648 \u0647\u0641\u062A\u0647\u200C\u0647\u0627 \u0631\u0627 \u06A9\u0627\u0645\u0644 \u0628\u062E\u0648\u0627\u0646\u06CC\u062F:", tr: "\xD6nce stratejileri ve haftalar\u0131 tam okuyun:" },
  one: { en: 'Approve all of the items marked "needs your approval" with one proof:', fa: "\u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \xAB\u0645\u0646\u062A\u0638\u0631 \u062A\u0623\u06CC\u06CC\u062F\xBB \u0631\u0627 \u0628\u0627 \u06CC\u06A9 \u0628\u0627\u0631 \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0631\u0645\u0632 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F:", tr: '"Onay bekliyor" olanlar\u0131n hepsini tek bir kan\u0131tla onaylay\u0131n:' },
  narrow: { en: "Only some kinds? Add --only strategy,week (or token, social, creative, aspect, fact, change, evidence, asset). Leave one out with --exclude <id>.", fa: "\u0641\u0642\u0637 \u0628\u0639\u0636\u06CC \u0627\u0646\u0648\u0627\u0639\u061F --only strategy,week (\u06CC\u0627 token\u060C social\u060C creative\u060C aspect\u060C fact\u060C change\u060C evidence\u060C asset) \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F. \u06CC\u06A9 \u0645\u0648\u0631\u062F \u0631\u0627 \u0628\u0627 --exclude <id> \u06A9\u0646\u0627\u0631 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.", tr: "Yaln\u0131zca baz\u0131 t\xFCrler mi? --only strategy,week (veya token, social, creative, aspect, fact, change, evidence, asset) ekleyin. Birini --exclude <id> ile d\u0131\u015Far\u0131da b\u0131rak\u0131n." },
  safe: { en: "Nothing was changed. Approving publishes nothing and authorizes no post, schedule or spend.", fa: "\u0686\u06CC\u0632\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0646\u06A9\u0631\u062F. \u062A\u0623\u06CC\u06CC\u062F \u0686\u06CC\u0632\u06CC \u0631\u0627 \u0645\u0646\u062A\u0634\u0631 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0647\u06CC\u0686 \u067E\u0633\u062A\u060C \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Hi\xE7bir \u015Fey de\u011Fi\u015Fmedi. Onay hi\xE7bir \u015Fey yay\u0131mlamaz; g\xF6nderiye, zamanlamaya veya harcamaya izin vermez." }
};
function formatPending(report, lang = "en") {
  const ready = report.items.filter((item) => item.decision === "would_approve");
  if (report.items.length === 0) return PLAIN.nothing[lang];
  const lines = [fill(PLAIN.head[lang], { n: ready.length })];
  const shared = /* @__PURE__ */ new Map();
  for (const item of report.items) if (item.decision === "would_skip" && item.summary === void 0) shared.set(`${item.kind}\0${item.reason}`, (shared.get(`${item.kind}\0${item.reason}`) ?? 0) + 1);
  const folded = /* @__PURE__ */ new Set();
  lines.push(
    ...groupedLines(report.items, lang, (item) => {
      const key = `${item.kind}\0${item.reason}`;
      if (item.decision === "would_skip" && item.summary === void 0 && (shared.get(key) ?? 0) > 1) {
        if (folded.has(key)) return [];
        folded.add(key);
        return [`  - ${shared.get(key)} \xD7 (${PLAIN.blocked[lang]}): ${item.reason}`];
      }
      const state = item.decision === "would_approve" ? PLAIN.waiting[lang] : PLAIN.blocked[lang];
      const what = item.summary ?? item.reason;
      return [`  - ${item.id}${item.revision ? ` r${item.revision}` : ""} (${state}): ${what}`, ...item.decision === "would_approve" || item.summary === void 0 ? [] : [`      ${item.reason}`]];
    })
  );
  const firsts = report.items.filter((item) => item.decision === "would_approve" && item.look_first && item.review_with);
  if (firsts.length) lines.push("", PLAIN.readFirst[lang], ...firsts.map((item) => `  ${item.review_with}`));
  if (ready.length) lines.push("", PLAIN.one[lang], `  ${report.approve_with}`, "", PLAIN.narrow[lang]);
  lines.push("", PLAIN.safe[lang]);
  return lines.join("\n");
}
export {
  ALL_KINDS,
  EXTRA_KINDS,
  EXTRA_TITLES,
  LOOK_FIRST_KINDS,
  approveCommand,
  approveEverything,
  everythingDryRun,
  formatEverything,
  formatEverythingDryRun,
  formatPending,
  parseOnlyKinds,
  planEverything
};
