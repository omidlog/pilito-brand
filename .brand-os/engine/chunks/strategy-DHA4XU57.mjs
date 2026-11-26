import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readOwnerProof
} from "./chunk-EU3MMEEN.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  proposalFromSeoDraft
} from "./chunk-RFT54P4C.mjs";
import "./chunk-D3U2JFTZ.mjs";
import "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import {
  approveRevision,
  evaluate,
  listRecords,
  proposeRevision,
  readRecord,
  readRevision,
  rejectRevision,
  reviewRevision,
  summarize,
  withdrawRevision
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  KnowledgeError,
  StrategyError,
  openWorkspace,
  validateRevisionNumber
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/strategy.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
var HELP = `brand:strategy <command> [options]

  propose --id <strategy-id> --file <proposal.json>    store a new draft revision (facts and research notes pinned)
  propose --id <strategy-id> --from-seo <draft.json> [--out <proposal.json>]
                                                       turn a brand:seo plan draft into a proposal file to edit;
                                                       with --store it is stored as a draft right away
  list                                                 every strategy with stored and effective status
  show --id <id> [--revision <n>]                      one revision (default: the approved one, else the latest)
  review --id <id> --revision <n>                      field diff against the revision it supersedes, sources,
                                                       blockers and the exact approve command
  approve --id <id> --revision <n> --expect-sha <sha256>
                                                       owner proof: BRAND_OS_APPROVAL_PROOF or hidden prompt
  reject --id <id> --revision <n>                      decline a draft (kept for audit, never served)
  withdraw --id <id> --revision <n> --reason <text>    owner proof; no older revision is restored

Add --json for machine-readable output. Refused while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...rest] = process.argv.slice(2);
var root = process.cwd();
var OPTIONS = {
  json: { type: "boolean", default: false },
  id: { type: "string" },
  file: { type: "string" },
  "from-seo": { type: "string" },
  out: { type: "string" },
  store: { type: "boolean", default: false },
  revision: { type: "string" },
  "expect-sha": { type: "string" },
  reason: { type: "string" }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function need(values2, key) {
  const value = values2[key];
  if (!value) usage(`--${key} is required.`);
  return value;
}
function print(values2, data, text) {
  console.log(values2.json ? JSON.stringify(data, null, 2) : text());
}
function readJsonFile(file, label) {
  const full = path.resolve(file);
  const stat = fs.lstatSync(full, { throwIfNoEntry: false });
  if (!stat?.isFile()) throw new StrategyError("invalid_input", `The ${label} path is not a readable regular file.`);
  if (stat.size > 1024 * 1024) throw new StrategyError("invalid_input", `The ${label} file is larger than 1 MiB.`);
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    throw new StrategyError("invalid_input", `The ${label} file is not valid JSON.`);
  }
}
async function ownerProof() {
  return readOwnerProof({ prompt: "Owner approval proof (input hidden): " });
}
function show(value) {
  const out = typeof value === "string" ? value : JSON.stringify(value);
  return out.length > 160 ? `${out.slice(0, 159)}\u2026` : out;
}
function reviewText(report) {
  const lines = [
    `Review ${report.strategy_id} revision ${report.revision} (${report.state})`,
    `  content sha256 ${report.content_sha256}`,
    `  ${report.base ? `diff against approved revision ${report.base.revision}` : "first revision: every field is new"}`,
    `  valid ${report.dates.valid_from.slice(0, 10)} to ${report.dates.valid_until.slice(0, 10)}, review due ${report.dates.review_due_at.slice(0, 10)}`,
    `  agent kinds: ${report.impact.agent_kinds.join(", ") || "none"}; ${report.impact.recommendations} recommendation(s); restricted (never sent): ${report.impact.restricted_fields.join(", ") || "none"}`,
    "",
    "Changes:",
    ...report.diff.map((item) => `  ${item.change === "added" ? "+" : item.change === "removed" ? "-" : "~"} ${item.path}: ${item.change === "changed" ? `${show(item.before)} -> ${show(item.after)}` : show(item.change === "added" ? item.after : item.before)}`),
    "",
    "Sources:",
    ...report.refs.facts.map((ref) => `  fact ${ref.id} @ ${ref.revision} [${ref.state}]`),
    ...report.refs.evidence.map((ref) => `  ${ref.ref} [${ref.state}]`)
  ];
  if (report.blockers.length) lines.push("", "Cannot be approved:", ...report.blockers.map((item) => `  ! ${item}`));
  else lines.push("", `Approve with: ${report.approve_with}`);
  lines.push(...report.notice.map((item) => `  note: ${item}`));
  return lines.join("\n");
}
function summaryText(items) {
  if (!items.length) return "No strategies yet. Propose one with brand:strategy propose.";
  return items.map(
    (item) => [
      `${item.strategy_id} (${item.type})  ${item.title ?? ""}`,
      `  approved revision: ${item.current ?? "none"}`,
      ...item.revisions.map((rev) => `  r${rev.revision}  ${rev.state.padEnd(10)} effective ${rev.effective.padEnd(16)} ${rev.content_sha256.slice(0, 12)}${rev.reasons.length ? `  ${rev.reasons.join(" ")}` : ""}`)
    ].join("\n")
  ).join("\n\n");
}
async function run(ws, values2) {
  switch (command) {
    case "propose": {
      const id = need(values2, "id");
      if (values2.file && values2["from-seo"]) usage("Use --file or --from-seo, not both.");
      if (values2["from-seo"]) {
        const imported = proposalFromSeoDraft(ws, readJsonFile(values2["from-seo"], "--from-seo"));
        if (values2.out) {
          const out = path.resolve(values2.out);
          if (fs.existsSync(out)) throw new StrategyError("exists", "The --out file exists. Choose a new path; nothing was overwritten.");
          fs.writeFileSync(out, `${JSON.stringify(imported.proposal, null, 2)}
`, { mode: 384, flag: "wx" });
        }
        if (!values2.store) {
          print(
            values2,
            { ok: true, stored: false, proposal: imported.proposal, critic: imported.critic.verdict, notes: imported.notes },
            () => [values2.out ? `Proposal written to ${values2.out}. Edit it, then: brand:strategy propose --id ${id} --file ${values2.out}` : JSON.stringify(imported.proposal, null, 2), ...imported.notes.map((item) => `note: ${item}`)].join("\n")
          );
          return;
        }
        const result2 = proposeRevision(ws, { strategy_id: id, proposal: imported.proposal });
        print(values2, { ok: true, stored: true, strategy_id: id, revision: result2.revision.revision, content_sha256: result2.revision.content_sha256, path: result2.path, notes: imported.notes }, () => `Stored draft ${id} revision ${result2.revision.revision} (${result2.path}). Review it: brand:strategy review --id ${id} --revision ${result2.revision.revision}`);
        return;
      }
      if (!values2.file) usage("--file or --from-seo is required.");
      const result = proposeRevision(ws, { strategy_id: id, proposal: readJsonFile(values2.file, "--file") });
      print(
        values2,
        { ok: true, strategy_id: id, revision: result.revision.revision, supersedes_revision: result.revision.supersedes_revision, content_sha256: result.revision.content_sha256, path: result.path },
        () => `Stored draft ${id} revision ${result.revision.revision}${result.revision.supersedes_revision ? ` (would supersede ${result.revision.supersedes_revision})` : ""}. Agents cannot see it. Review: brand:strategy review --id ${id} --revision ${result.revision.revision}`
      );
      return;
    }
    case "list": {
      const items = listRecords(ws).map((record) => summarize(ws, record));
      print(values2, { ok: true, strategies: items }, () => summaryText(items));
      return;
    }
    case "show": {
      const record = readRecord(ws, need(values2, "id"));
      const approved = record.revisions.find((item) => item.state === "approved");
      const number = values2.revision ? validateRevisionNumber(values2.revision) : approved?.revision ?? Math.max(...record.revisions.map((item) => item.revision));
      const revision = readRevision(ws, record.strategy_id, number);
      const entry = record.revisions.find((item) => item.revision === number);
      const result = evaluate(ws, record, entry, ws.now());
      print(
        values2,
        { ok: true, state: entry.state, effective: result.status, reasons: result.reasons, revision },
        () => [`${record.strategy_id} revision ${number}: ${entry.state}, effective ${result.status}`, ...result.reasons.map((item) => `  ${item}`), JSON.stringify(revision.content, null, 2)].join("\n")
      );
      return;
    }
    case "review": {
      const report = reviewRevision(ws, { strategy_id: need(values2, "id"), revision: validateRevisionNumber(need(values2, "revision")) });
      print(values2, { ok: true, review: report }, () => reviewText(report));
      if (report.blockers.length) process.exitCode = 3;
      return;
    }
    case "approve": {
      const proof = await ownerProof();
      const result = approveRevision(ws, { strategy_id: need(values2, "id"), revision: validateRevisionNumber(need(values2, "revision")), expected_sha256: need(values2, "expect-sha"), proof });
      print(
        values2,
        { ok: true, approved: result.approved, superseded: result.superseded?.revision ?? null },
        () => `Approved ${result.record.strategy_id} revision ${result.approved.revision}${result.superseded ? `; revision ${result.superseded.revision} is now superseded` : ""}. This authorizes no ad, spend, publication or website change.`
      );
      return;
    }
    case "reject": {
      const entry = rejectRevision(ws, { strategy_id: need(values2, "id"), revision: validateRevisionNumber(need(values2, "revision")) });
      print(values2, { ok: true, entry }, () => `Rejected revision ${entry.revision}. It stays on disk for audit and is never served.`);
      return;
    }
    case "withdraw": {
      const proof = await ownerProof();
      const entry = withdrawRevision(ws, { strategy_id: need(values2, "id"), revision: validateRevisionNumber(need(values2, "revision")), reason: need(values2, "reason"), proof });
      print(values2, { ok: true, entry }, () => `Withdrew revision ${entry.revision}. Agents now get no current revision for this strategy until you approve a new one.`);
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
if (!command || command === "help" || command === "--help") {
  console.log(HELP);
  process.exit(command ? 0 : 2);
}
var values;
try {
  values = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true }).values;
} catch (error) {
  usage(error.message);
}
try {
  await run(openWorkspace(root), values);
} catch (error) {
  if (error instanceof StrategyError || error instanceof KnowledgeError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing was approved or published.`);
  process.exit(1);
}
