import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readOwnerProof
} from "./chunk-EU3MMEEN.mjs";
import {
  backlinks,
  confirmVisibility,
  detectVisibility,
  knowledgeDoctor,
  listNotes,
  migrateNotes,
  relatedNotes,
  searchNotes,
  shareNote,
  similarNotes,
  summarize,
  unshareNote
} from "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  KnowledgeError,
  appendNote,
  approvalProofMatches,
  archiveNote,
  captureNote,
  editNote,
  findNote,
  noteHistory,
  noteProvenance,
  openWorkspace,
  parseLinkArg,
  proposeFromNote,
  recoverNote,
  restoreNote,
  scanScope,
  staleProposalIssues
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/knowledge.ts
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { stdin as input } from "node:process";
var HELP = `brand:knowledge <command> [options]

  capture   --title <t> [--text <t> | --file <path|->] [--lang fa] [--tags a,b] [--kind idea] [--question-ids id,\u2026]
            [--link kn_\u2026[:supports]] [--source-kind owner_note|meeting|agent_capture|research|imported_text] [--source-ref <ref>]
            [--classification restricted]
  list      [--status inbox,triaged] [--kind idea] [--tag a,b] [--lang fa] [--since 2026-11-01] [--until \u2026]
            [--scope local|shared|all|restricted] [--question <id>] [--include-archived] [--limit 20] [--offset 0]
  show      --id kn_\u2026 [--scope restricted]
  search    --query "<words>" [filters as for list] [--with-facts]
  similar   --id kn_\u2026            possible duplicates (suggestions only)
  backlinks --id kn_\u2026            links in and out, linked question ids
  related   --id kn_\u2026            links plus notes sharing question ids or tags
  edit      --id kn_\u2026 --expected-revision <sha256> and one of:
              --text <t> | --file <path|->        replace the body
              --replace <old> --with <new>        replace one exact, unique passage
              --insert-after <anchor> --text <t>  (or --insert-before)
            and/or --title --kind --status --lang --tags --add-tag --remove-tag --question-ids --link --source-ref
  append    --id kn_\u2026 (--text <t> | --file <path|->) [--idempotency-key <k>] [--expected-revision <sha256>]
  archive   --id kn_\u2026 [--expected-revision <sha256>]      reversible
  restore   --id kn_\u2026 [--expected-revision <sha256>]
  history   --id kn_\u2026            saved snapshots (local recovery)
  recover   --id kn_\u2026 --revision <sha256-prefix> --expected-revision <current sha256>
  share     --id kn_\u2026 --dry-run   then: --expected-revision <sha256> [--confirm-private owner/repo]
  unshare   --id kn_\u2026 --expected-revision <sha256>
  propose   --id kn_\u2026 [--file items.json] [--apply --expected-revision <sha256>]   drafts only, never approval
  provenance --id kn_\u2026           proposals that cite this note, and whether they are stale
  doctor    diagnostics without note text
  migrate   [--apply]            fill missing metadata (idempotent)

Add --json for machine-readable output. Restricted notes (--scope restricted, --classification restricted) need
BRAND_OS_DATA_KEY and the owner's approval proof (BRAND_OS_APPROVAL_PROOF or a hidden prompt) and are refused
while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...rest] = process.argv.slice(2);
var root = process.cwd();
var OPTIONS = {
  json: { type: "boolean", default: false },
  id: { type: "string" },
  title: { type: "string" },
  text: { type: "string" },
  file: { type: "string" },
  lang: { type: "string" },
  tags: { type: "string" },
  tag: { type: "string" },
  "add-tag": { type: "string", multiple: true },
  "remove-tag": { type: "string", multiple: true },
  kind: { type: "string" },
  status: { type: "string" },
  "question-ids": { type: "string" },
  question: { type: "string" },
  link: { type: "string", multiple: true },
  "source-kind": { type: "string" },
  "source-ref": { type: "string" },
  classification: { type: "string" },
  scope: { type: "string" },
  since: { type: "string" },
  until: { type: "string" },
  "include-archived": { type: "boolean", default: false },
  limit: { type: "string" },
  offset: { type: "string" },
  query: { type: "string" },
  "with-facts": { type: "boolean", default: false },
  "expected-revision": { type: "string" },
  replace: { type: "string" },
  with: { type: "string" },
  "insert-after": { type: "string" },
  "insert-before": { type: "string" },
  "idempotency-key": { type: "string" },
  revision: { type: "string" },
  "dry-run": { type: "boolean", default: false },
  "confirm-private": { type: "string" },
  apply: { type: "boolean", default: false }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function list(value) {
  if (value === void 0) return void 0;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function need(values2, key) {
  const value = values2[key];
  if (!value) usage(`--${key} is required.`);
  return value;
}
async function readAllStdin() {
  const chunks = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
async function content(values2, opts) {
  if (values2.text !== void 0 && values2.file !== void 0) usage("Use --text or --file, not both.");
  if (values2.text !== void 0) return values2.text;
  if (values2.file === "-") return readAllStdin();
  if (values2.file !== void 0) {
    const file = path.resolve(values2.file);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat?.isFile()) throw new KnowledgeError("invalid_input", "The --file path is not a readable file.");
    if (stat.size > 1024 * 1024) throw new KnowledgeError("too_large", "The --file is larger than 1 MiB.");
    return fs.readFileSync(file, "utf8");
  }
  if (opts.required) usage("Give the text with --text, --file <path>, or --file - (stdin).");
  return void 0;
}
function filtersFrom(values2) {
  const scope = values2.scope;
  if (scope !== void 0 && !["local", "shared", "all", "restricted"].includes(scope)) usage("--scope must be local, shared, all or restricted.");
  return {
    status: list(values2.status),
    kind: list(values2.kind),
    tags: list(values2.tag ?? values2.tags),
    language: values2.lang,
    since: values2.since,
    until: values2.until,
    scope: scope === "restricted" ? void 0 : scope,
    question_id: values2.question,
    include_archived: values2["include-archived"]
  };
}
function paging(values2) {
  return { limit: values2.limit ? Number(values2.limit) : void 0, offset: values2.offset ? Number(values2.offset) : void 0 };
}
async function requireOwnerForRestricted() {
  if (process.env[AGENT_TOKEN_ENV]) {
    throw new KnowledgeError("refused", `Restricted notes are owner-only. Refusing while ${AGENT_TOKEN_ENV} is set.`);
  }
  const proof = await readOwnerProof({ prompt: "Approval proof for restricted notes (input hidden): ", stdin: false });
  if (!approvalProofMatches(root, proof)) {
    throw new KnowledgeError("refused", "Restricted notes need the owner approval proof (BRAND_OS_APPROVAL_PROOF or the hidden prompt). Nothing was read or written.");
  }
}
function print(values2, data, text) {
  console.log(values2.json ? JSON.stringify(data, null, 2) : text());
}
function line(item) {
  return `${item.id}  ${item.status.padEnd(8)} ${item.kind.padEnd(14)} ${item.scope.padEnd(10)} ${item.title}${item.tags.length ? `  [${item.tags.join(", ")}]` : ""}`;
}
function setOp(values2) {
  const op = { op: "set" };
  if (values2.title !== void 0) op.title = values2.title;
  if (values2.kind !== void 0) op.kind = values2.kind;
  if (values2.status !== void 0) op.status = values2.status;
  if (values2.lang !== void 0) op.language = values2.lang || null;
  if (values2.tags !== void 0) op.tags = list(values2.tags) ?? [];
  if (values2["add-tag"]) op.add_tags = values2["add-tag"];
  if (values2["remove-tag"]) op.remove_tags = values2["remove-tag"];
  if (values2["question-ids"] !== void 0) op.question_ids = list(values2["question-ids"]) ?? [];
  if (values2.link) op.add_links = values2.link.map(parseLinkArg);
  if (values2["source-ref"] !== void 0) op.source_ref = values2["source-ref"] || null;
  return Object.keys(op).length > 1 ? op : null;
}
async function run(ws, values2) {
  const restricted = values2.scope === "restricted";
  if (restricted || values2.classification === "restricted") await requireOwnerForRestricted();
  switch (command) {
    case "capture": {
      const body = await content(values2, { required: !values2.title }) ?? "";
      const result = captureNote(ws, {
        title: values2.title,
        body,
        kind: values2.kind,
        language: values2.lang,
        tags: list(values2.tags),
        links: values2.link?.map(parseLinkArg),
        question_ids: list(values2["question-ids"]),
        source: { kind: values2["source-kind"], ref: values2["source-ref"] },
        classification: values2.classification === "restricted" ? "restricted" : values2.classification === void 0 ? void 0 : values2.classification,
        status: values2.status
      });
      const duplicates = result.scope === "restricted" ? [] : similarNotes(ws, result.id);
      print(
        values2,
        { ok: true, ...result, possible_duplicates: duplicates, approval_state: "unapproved_idea" },
        () => [
          `Captured ${result.id} (${result.scope}) at ${result.path}`,
          `Revision ${result.revision}`,
          ...duplicates.map((item) => `Possible duplicate: ${item.id}  ${item.title} (${Math.round(item.similarity * 100)}%)`),
          result.scope === "local" ? "Local and untracked. Nothing is in Git. Share it later with: brand:knowledge share --id \u2026 --dry-run" : "Encrypted. Never shared, searched or sent to an agent.",
          "This is an unapproved idea, not a brand fact."
        ].join("\n")
      );
      return;
    }
    case "list": {
      if (restricted) {
        const scan = scanScope(ws, "restricted", { decrypt: true });
        const items = scan.notes.map(summarize);
        print(values2, { ok: true, scope: "restricted", items, problems: scan.problems.length }, () => items.length ? items.map(line).join("\n") : "No restricted notes.");
        return;
      }
      const result = listNotes(ws, filtersFrom(values2), paging(values2));
      print(
        values2,
        { ok: true, ...result },
        () => [
          ...result.items.length ? result.items.map(line) : ["No notes match."],
          ...result.next_offset !== null ? [`\u2026 ${result.total - result.next_offset} more (--offset ${result.next_offset})`] : [],
          ...result.problems ? [`${result.problems} file(s) could not be read. Run brand:knowledge doctor.`] : []
        ].join("\n")
      );
      return;
    }
    case "show": {
      const loaded = findNote(ws, need(values2, "id"), { includeRestricted: restricted });
      const links = loaded.scope === "restricted" ? null : backlinks(ws, loaded.id);
      const extras = loaded.scope === "restricted" ? {} : { provenance: noteProvenance(new InterviewEngine(root), loaded.id, loaded.revision) };
      const data = { ok: true, ...summarize(loaded), meta: loaded.note.meta, body: loaded.note.body, issues: loaded.note.issues, links, ...extras };
      print(
        values2,
        data,
        () => [
          `# ${loaded.note.meta.title}`,
          `${loaded.id} \xB7 ${loaded.scope} \xB7 ${loaded.note.meta.status} \xB7 ${loaded.note.meta.kind}${loaded.note.meta.language ? ` \xB7 ${loaded.note.meta.language}` : ""}`,
          `UNVERIFIED IDEA \xB7 NOT AN APPROVED BRAND FACT`,
          `Revision ${loaded.revision}`,
          loaded.note.meta.tags.length ? `Tags: ${loaded.note.meta.tags.join(", ")}` : "",
          loaded.note.meta.question_ids.length ? `Questions: ${loaded.note.meta.question_ids.join(", ")}` : "",
          links && (links.inbound.length || links.outbound.length) ? `Links: ${links.outbound.length} out, ${links.inbound.length} in` : "",
          "",
          loaded.note.body
        ].filter((item, index) => item !== "" || index === 8).join("\n")
      );
      return;
    }
    case "search": {
      const query = values2.query ?? "";
      if (restricted) throw new KnowledgeError("refused", "Restricted notes are never searched or snippeted.");
      const result = searchNotes(ws, query, filtersFrom(values2), paging(values2));
      const facts = values2["with-facts"] ? await approvedFacts(query) : void 0;
      print(
        values2,
        { ok: true, ...result, ...facts ? { approved_facts: facts } : {} },
        () => [
          ...result.items.length ? result.items.flatMap((hit) => [`${line(hit)}  (score ${hit.score})`, ...hit.snippet ? [`    \u201C${hit.snippet}\u201D`] : []]) : ["No notes match."],
          ...facts ? ["", `Approved facts (${facts.status}):`, ...facts.items.map((item) => `  ${item.id}: ${JSON.stringify(item.value)}`)] : [],
          "",
          result.notice
        ].join("\n")
      );
      return;
    }
    case "similar": {
      const items = similarNotes(ws, need(values2, "id"));
      print(values2, { ok: true, items, notice: "Suggestions only. Nothing is merged." }, () => items.length ? items.map((item) => `${item.id}  ${Math.round(item.similarity * 100)}%  ${item.title}`).join("\n") : "No likely duplicates.");
      return;
    }
    case "backlinks":
    case "related": {
      const id = need(values2, "id");
      const result = command === "related" ? relatedNotes(ws, id) : backlinks(ws, id);
      const view = (link) => `  ${link.relationship.padEnd(11)} ${link.id}${link.exists ? `  ${link.title ?? "(not visible)"}` : "  (missing)"}`;
      print(
        values2,
        { ok: true, ...result },
        () => [
          `Outbound (${result.outbound.length}):`,
          ...result.outbound.map(view),
          `Inbound (${result.inbound.length}):`,
          ...result.inbound.map(view),
          `Questions: ${result.question_ids.join(", ") || "none"}`,
          ..."related" in result ? ["Related:", ...result.related.map((item) => `  ${item.id}  ${item.title}`)] : []
        ].join("\n")
      );
      return;
    }
    case "edit": {
      const id = need(values2, "id");
      const ops = [];
      const meta = setOp(values2);
      if (meta) ops.push(meta);
      if (values2["insert-after"] !== void 0 || values2["insert-before"] !== void 0) {
        const text = await content(values2, { required: true });
        if (values2["insert-after"] !== void 0) ops.push({ op: "insert_after", anchor: values2["insert-after"], text });
        else ops.push({ op: "insert_before", anchor: values2["insert-before"], text });
      } else if (values2.replace !== void 0) {
        if (values2.with === void 0) usage("--replace needs --with.");
        ops.push({ op: "replace", find: values2.replace, replace: values2.with });
      } else {
        const body = await content(values2, { required: false });
        if (body !== void 0) ops.push({ op: "replace_body", body });
      }
      if (ops.length === 0) usage("Nothing to change.");
      const result = editNote(ws, id, { expectedRevision: need(values2, "expected-revision"), ops, includeRestricted: restricted });
      print(values2, { ok: true, ...result }, () => result.changed ? `Updated ${id}. Revision ${result.revision} (was ${result.previous_revision}).` : `No change to ${id}.`);
      return;
    }
    case "append": {
      const result = appendNote(ws, need(values2, "id"), { text: await content(values2, { required: true }), idempotencyKey: values2["idempotency-key"], expectedRevision: values2["expected-revision"], includeRestricted: restricted });
      print(values2, { ok: true, ...result }, () => result.duplicate ? `Already appended with this idempotency key. Nothing changed. Revision ${result.revision}.` : `Appended. Revision ${result.revision}.`);
      return;
    }
    case "archive":
    case "restore": {
      const id = need(values2, "id");
      const fn = command === "archive" ? archiveNote : restoreNote;
      const result = fn(ws, id, { expectedRevision: values2["expected-revision"], includeRestricted: restricted });
      const provenance = restricted ? [] : noteProvenance(new InterviewEngine(root), id, null);
      const extras = command === "archive" && provenance.length ? { stale_proposals: provenance } : {};
      print(
        values2,
        { ok: true, ...result, ...extras },
        () => [
          result.changed ? `${command === "archive" ? "Archived" : "Restored"} ${id}. Revision ${result.revision}.` : `${id} was already ${command === "archive" ? "archived" : "not archived"}.`,
          command === "archive" ? "Reversible with brand:knowledge restore. Approved facts that cite this note are not changed." : "",
          ...(extras.stale_proposals ?? []).map((item) => `Review: proposals from intake ${item.batch_id} cite this note.`)
        ].filter(Boolean).join("\n")
      );
      return;
    }
    case "history": {
      const id = need(values2, "id");
      findNote(ws, id, { includeRestricted: restricted });
      const items = noteHistory(ws, id);
      print(values2, { ok: true, id, items: items.map(({ revision, saved_at }) => ({ revision, saved_at })) }, () => items.length ? items.map((item) => `${item.saved_at}  ${item.revision}`).join("\n") : "No snapshots yet.");
      return;
    }
    case "recover": {
      const result = recoverNote(ws, need(values2, "id"), { revision: need(values2, "revision"), expectedRevision: need(values2, "expected-revision"), includeRestricted: restricted });
      print(values2, { ok: true, ...result }, () => `Recovered. Revision ${result.revision}. The replaced text was saved as a snapshot.`);
      return;
    }
    case "share": {
      const id = need(values2, "id");
      const visibility = confirmVisibility(detectVisibility(root), values2["confirm-private"]);
      const result = shareNote(ws, id, { visibility, dryRun: values2["dry-run"], expectedRevision: values2["expected-revision"] });
      print(
        values2,
        result,
        () => [
          `${result.dry_run ? "Dry run: " : ""}${result.from} \u2192 ${result.to}`,
          `Repository: ${result.visibility.state} (${result.visibility.detail})`,
          ...result.blocked.length ? ["Refused:", ...result.blocked.map((item) => `  - ${item}`)] : [],
          ...result.ok && result.dry_run ? ["--- content that would become tracked ---", result.content, "--- end ---"] : [],
          ...result.warnings.map((item) => `Note: ${item}`),
          ...result.next_steps.map((item) => `\u2192 ${item}`)
        ].join("\n")
      );
      if (!result.ok) process.exit(1);
      return;
    }
    case "unshare": {
      const result = unshareNote(ws, need(values2, "id"), { expectedRevision: need(values2, "expected-revision") });
      print(values2, { ok: true, ...result }, () => `${result.path}
${result.warning}`);
      return;
    }
    case "doctor": {
      const engine = new InterviewEngine(root);
      const report = knowledgeDoctor(ws, () => staleProposalIssues(engine, ws));
      print(
        values2,
        report,
        () => [
          `Knowledge (${report.brand_slug}): ${report.notes.local} local, ${report.notes.shared} shared, ${report.notes.restricted} restricted${report.notes.restricted_locked ? " (not checked: no key)" : ""}`,
          ...report.issues.map((issue) => `${issue.severity.toUpperCase().padEnd(7)} ${issue.code}${issue.path ? ` ${issue.path}` : ""}${issue.id && !issue.path ? ` ${issue.id}` : ""}: ${issue.message}`),
          report.ok ? "OK" : "Problems found."
        ].join("\n")
      );
      if (!report.ok) process.exit(1);
      return;
    }
    case "propose": {
      if (restricted) throw new KnowledgeError("refused", "Restricted notes never become proposals.");
      if (values2.apply && process.env[AGENT_TOKEN_ENV]) throw new KnowledgeError("refused", `Storing drafts from a note is a local owner action. Refusing while ${AGENT_TOKEN_ENV} is set.`);
      let items;
      const raw = await content(values2, { required: false });
      if (raw !== void 0) {
        try {
          items = JSON.parse(raw);
        } catch {
          throw new KnowledgeError("invalid_input", "The proposal items file is not valid JSON. Nothing was stored.");
        }
      }
      const result = proposeFromNote(new InterviewEngine(root), ws, need(values2, "id"), { items, apply: values2.apply, expectedRevision: values2["expected-revision"] });
      print(
        values2,
        result,
        () => [
          `${result.dry_run ? "Preview (dry run, nothing stored)" : `Stored as drafts (intake ${result.report?.batch_id})`} for ${result.note.id} @ ${result.note.revision.slice(0, 12)}`,
          `Source: ${result.source_ref} (${result.authority === "owner_words" ? "owner\u2019s words" : "third-party, not owner authority"})`,
          `Candidate questions: ${result.candidates.map((item) => item.question_id).join(", ") || "none"}`,
          ...result.refused_links.map((item) => `Refused link ${item.question_id}: ${item.reason}`),
          ...result.report ? result.report.results.map((item) => `  ${item.outcome.padEnd(15)} ${item.question_id ?? `#${item.index}`}${item.state ? ` [${item.state}]` : ""}  ${item.reason}`) : [],
          ...(result.report?.conflicts ?? []).map((item) => `  Ask: ${item.ask}`),
          ...result.tracked_quotations.map((item) => `  Would copy into ${item.files.join(" + ")}: ${item.question_id} \u201C${item.quotation}\u201D`),
          ...result.warnings.map((item) => `Warning: ${item}`),
          ...result.next_steps.map((item) => `\u2192 ${item}`),
          "Nothing was approved or published."
        ].join("\n")
      );
      return;
    }
    case "provenance": {
      const id = need(values2, "id");
      let revision = null;
      try {
        revision = findNote(ws, id).revision;
      } catch (error) {
        if (!(error instanceof KnowledgeError) || error.code !== "not_found") throw error;
      }
      const items = noteProvenance(new InterviewEngine(root), id, revision);
      print(
        values2,
        { ok: true, id, current_revision: revision, items },
        () => items.length ? items.map((item) => `${item.batch_id}  ${item.received_at}  ${item.stale ? "STALE (note edited since)" : "current"}  ${item.results.map((r) => `${r.question_id}:${r.outcome}`).join(", ")}`).join("\n") : "No proposals cite this note."
      );
      return;
    }
    case "migrate": {
      const result = migrateNotes(ws, { apply: values2.apply });
      print(
        values2,
        { ok: true, ...result },
        () => [`${result.apply ? "Migrated" : "Would migrate"} ${result.changed.length} note(s); ${result.unchanged} already current.`, ...result.changed.map((file) => `  ${file}`), result.apply ? "" : "Re-run with --apply to write."].filter(Boolean).join("\n")
      );
      return;
    }
    default: {
      usage(command ? `Unknown command ${command}.` : "No command given.");
    }
  }
}
async function approvedFacts(query) {
  const core = await import("./src-PR77K5MS.mjs");
  const engine = new core.InterviewEngine(root);
  const ctx = core.resolveAgentContext(root, engine.config().brand.slug, process.env[core.AGENT_TOKEN_ENV]);
  const result = core.searchBrandDocs(engine, query, ctx);
  const hits = result.data?.hits ?? [];
  const items = hits.map((item) => ({ id: item.id, value: item.value, approval_state: item.status, source_type: "approved_fact" }));
  return { status: result.status, items };
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
  if (error instanceof KnowledgeError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing was shared or published. Run brand:knowledge doctor.`);
  process.exit(1);
}
