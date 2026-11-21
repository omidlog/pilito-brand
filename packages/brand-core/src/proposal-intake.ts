import path from 'node:path'
import { z } from 'zod'
import { isPersonalQuestion, normalizeAnswer } from './approval.js'
import { privateDataRefusal } from './personal-privacy.js'
import { latestAnswers } from './completeness.js'
import { exists, readYaml, writeYaml } from './fsutil.js'
import type { InterviewEngine } from './engine.js'
import { PROPOSAL_STATES, type AnswerRecord, type FieldQuestion, type ProposalState } from './types.js'

/**
 * Interview proposals: what an interviewing agent (Claude Code, another coding agent, or the
 * built-in model adapter) extracted from the owner's own words.
 *
 * Every proposal is untrusted. The intake:
 * - validates the shape with a strict schema (unknown keys such as `status: approved` are refused);
 * - refuses unknown, restricted, and not-applicable question ids;
 * - requires the quotation to appear verbatim in the source text (provenance, no invented quotes);
 * - stores accepted items only as drafts or unresolved markers, never as approved facts;
 * - never overwrites an approved fact (a correction becomes a pending change proposal);
 * - never overwrites a different existing draft unless the item is marked as a correction;
 *   otherwise it records a conflict so the interviewer asks a clarifying question.
 */

export const INTAKE_LIMITS = {
  maxProposals: 40,
  maxValueChars: 2000,
  maxQuotationChars: 1000,
  maxSourceChars: 50_000,
  maxFollowUps: 10,
} as const

const QUESTION_ID = /^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/

export const ProposalItemSchema = z
  .object({
    question_id: z.string().min(3).max(120).regex(QUESTION_ID),
    value: z.union([z.string().max(INTAKE_LIMITS.maxValueChars), z.number().finite(), z.boolean()]).nullable(),
    state: z.enum(PROPOSAL_STATES),
    confidence: z.number().min(0).max(1),
    quotation: z.string().min(1).max(INTAKE_LIMITS.maxQuotationChars),
    source_answer_ref: z.string().max(200).optional(),
    follow_up: z.string().max(500).optional(),
    /** The owner explicitly corrected an earlier answer. Only then may a different draft be replaced. */
    correction: z.boolean().optional(),
  })
  .strict()
  .superRefine((item, ctx) => {
    if (item.state === 'unresolved' && item.value !== null) {
      ctx.addIssue({ code: 'custom', message: 'unresolved proposals must have value null; nothing is decided' })
    }
    if (item.state !== 'unresolved' && (item.value === null || (typeof item.value === 'string' && item.value.trim() === ''))) {
      ctx.addIssue({ code: 'custom', message: `${item.state} proposals need a value; use state unresolved when nothing was said` })
    }
  })

export type ProposalItem = z.infer<typeof ProposalItemSchema>

const FollowUpSchema = z
  .object({
    question_id: z.string().max(120).regex(QUESTION_ID).nullable().optional(),
    text: z.string().min(1).max(500),
  })
  .strict()

export const SOURCE_KINDS = ['interview_turn', 'imported_text', 'owner_note'] as const

const SourceSchema = z
  .object({
    kind: z.enum(SOURCE_KINDS),
    ref: z.string().min(1).max(200),
    language: z.string().max(16).optional(),
  })
  .strict()

/** Top level of a proposal batch. Items are validated one by one so one bad item does not hide the rest. */
const BatchEnvelopeSchema = z
  .object({
    schema_version: z.literal(1),
    source: SourceSchema,
    source_text: z.string().min(1).max(INTAKE_LIMITS.maxSourceChars),
    proposals: z.array(z.unknown()).max(INTAKE_LIMITS.maxProposals),
    follow_ups: z.array(FollowUpSchema).max(INTAKE_LIMITS.maxFollowUps).optional(),
    owner_questions: z.array(z.string().min(1).max(500)).max(INTAKE_LIMITS.maxFollowUps).optional(),
  })
  .strict()

/** The part a model returns. The caller adds source and source_text, so a model cannot forge provenance. */
export const ModelOutputSchema = z
  .object({
    proposals: z.array(z.unknown()).max(INTAKE_LIMITS.maxProposals),
    follow_ups: z.array(FollowUpSchema).max(INTAKE_LIMITS.maxFollowUps).optional(),
    owner_questions: z.array(z.string().min(1).max(500)).max(INTAKE_LIMITS.maxFollowUps).optional(),
  })
  .strict()

export interface ProposalBatch {
  schema_version: 1
  source: z.infer<typeof SourceSchema>
  source_text: string
  proposals: ProposalItem[]
  /** Position of each proposal in the submitted list, so results line up with dropped items. */
  indexes?: number[]
  follow_ups: Array<{ question_id: string | null; text: string }>
  owner_questions: string[]
}

export interface DroppedItem {
  index: number
  question_id: string | null
  reason: string
}

export type ParseResult = { ok: true; batch: ProposalBatch; dropped: DroppedItem[] } | { ok: false; errors: string[] }

function issues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
}

function idOf(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'question_id' in raw) {
    const id = (raw as { question_id: unknown }).question_id
    if (typeof id === 'string' && QUESTION_ID.test(id) && id.length <= 120) return id
  }
  return null
}

/** Validate items one at a time. Invalid items are dropped with a reason; nothing about them is stored. */
export function parseItems(raw: unknown[]): { items: ProposalItem[]; indexes: number[]; dropped: DroppedItem[] } {
  const items: ProposalItem[] = []
  const indexes: number[] = []
  const dropped: DroppedItem[] = []
  raw.forEach((candidate, index) => {
    const parsed = ProposalItemSchema.safeParse(candidate)
    if (parsed.success) {
      items.push(parsed.data)
      indexes.push(index)
    } else dropped.push({ index, question_id: idOf(candidate), reason: `schema: ${issues(parsed.error).join('; ')}` })
  })
  return { items, indexes, dropped }
}

/** Parse a batch an agent wrote (brand:propose --file). */
export function parseProposalBatch(input: unknown): ParseResult {
  const envelope = BatchEnvelopeSchema.safeParse(input)
  if (!envelope.success) return { ok: false, errors: issues(envelope.error) }
  const { items, indexes, dropped } = parseItems(envelope.data.proposals)
  return {
    ok: true,
    dropped,
    batch: {
      schema_version: 1,
      source: envelope.data.source,
      source_text: envelope.data.source_text,
      proposals: items,
      indexes,
      follow_ups: (envelope.data.follow_ups ?? []).map((item) => ({ question_id: item.question_id ?? null, text: item.text })),
      owner_questions: envelope.data.owner_questions ?? [],
    },
  }
}

// ---- applying a batch -------------------------------------------------------------------------

export type IntakeOutcome = 'drafted' | 'unresolved' | 'unchanged' | 'change_proposed' | 'conflict' | 'rejected'

export interface IntakeItemResult {
  index: number
  question_id: string | null
  state: ProposalState | null
  outcome: IntakeOutcome
  reason: string
  answer_id?: string
  change_id?: string
}

export interface IntakeConflict {
  question_id: string
  against_answer_id: string
  existing: { value: AnswerRecord['value']; status: AnswerRecord['status'] }
  proposed: { value: AnswerRecord['value']; state: ProposalState }
  quotation: string
  /** A clarifying question the interviewer should ask the owner. */
  ask: string
}

export interface IntakeReport {
  ok: boolean
  dry_run: boolean
  batch_id: string | null
  origin: IntakeOrigin
  provider: string | null
  source: ProposalBatch['source'] | null
  results: IntakeItemResult[]
  conflicts: IntakeConflict[]
  /** Model or agent text. Suggestions for the interviewer to ask, never instructions to run. */
  follow_ups: Array<{ question_id: string | null; text: string; untrusted: true }>
  owner_questions: Array<{ text: string; untrusted: true }>
  counts: Record<IntakeOutcome, number>
  redactions: number
  notice: string
}

export type IntakeOrigin = 'agent' | 'assist' | 'fallback'

interface IntakeLogBatch {
  id: string
  received_at: string
  origin: IntakeOrigin
  provider: string | null
  source: ProposalBatch['source']
  redactions: number
  results: IntakeItemResult[]
  conflicts: IntakeConflict[]
  follow_ups: Array<{ question_id: string | null; text: string }>
  owner_questions: string[]
}

interface IntakeLog {
  schema_version: 1
  batches: IntakeLogBatch[]
}

export function intakeLogPath(root: string): string {
  return path.join(root, 'brand', 'interview', 'intake-log.yaml')
}

export function readIntakeLog(root: string): IntakeLog {
  const file = intakeLogPath(root)
  if (!exists(file)) return { schema_version: 1, batches: [] }
  const doc = readYaml<Partial<IntakeLog>>(file)
  return { schema_version: 1, batches: Array.isArray(doc.batches) ? doc.batches : [] }
}

/** Whitespace-insensitive, Unicode-normalized containment. Case and wording must match. */
function normalizeForQuote(text: string): string {
  return text.normalize('NFC').replace(/[‌‍]/g, '‌').replace(/\s+/g, ' ').trim()
}

export function quotationIsVerbatim(quotation: string, source: string): boolean {
  const quote = normalizeForQuote(quotation)
  return quote.length > 0 && normalizeForQuote(source).includes(quote)
}

function sameValue(a: AnswerRecord['value'], b: AnswerRecord['value']): boolean {
  if (a === null || b === null) return a === b
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}

function hasValue(answer: AnswerRecord | undefined): answer is AnswerRecord {
  return Boolean(answer && answer.value !== null && answer.value !== undefined && answer.status !== 'unanswered')
}

function uncertaintyFor(state: ProposalState, quotation: string): string {
  if (state === 'tentative') return `Tentative: the owner described this as possible, not decided: “${quotation}”. Not a decision.`
  if (state === 'unresolved') return `Unresolved: the owner said this is not decided yet: “${quotation}”. No value was invented.`
  return `Proposed from the owner's words: “${quotation}”. Draft until a human approves it.`
}

function clarifyingQuestion(question: FieldQuestion, existing: AnswerRecord, proposed: AnswerRecord['value'], state: ProposalState): string {
  const before = existing.value === null ? existing.status : `“${String(existing.value)}”`
  const after = state === 'unresolved' || proposed === null ? 'not decided yet' : `“${String(proposed)}”`
  return `Earlier, ${question.label} was recorded as ${before}. This answer suggests ${after}. Which one is right?`
}

const EMPTY_COUNTS = (): Record<IntakeOutcome, number> => ({ drafted: 0, unresolved: 0, unchanged: 0, change_proposed: 0, conflict: 0, rejected: 0 })

/**
 * Apply a validated batch. Drafts only. Restricted ids are refused before anything is read or written,
 * so a restricted value never reaches the ledger, the intake log, or a change proposal through this path.
 */
export function applyProposalBatch(
  engine: InterviewEngine,
  batch: ProposalBatch,
  opts: { origin: IntakeOrigin; provider?: string | null; dryRun?: boolean; dropped?: DroppedItem[]; redactions?: number; now?: () => Date } = { origin: 'agent' },
): IntakeReport {
  const root = engine.workspaceRoot()
  const dryRun = Boolean(opts.dryRun)
  const log = readIntakeLog(root)
  const batchId = dryRun ? null : `int-${String(log.batches.length + 1).padStart(4, '0')}`
  const results: IntakeItemResult[] = (opts.dropped ?? []).map((item) => ({
    index: item.index,
    question_id: item.question_id,
    state: null,
    outcome: 'rejected',
    reason: item.reason,
  }))
  const conflicts: IntakeConflict[] = []
  const touched = new Set<string>()

  batch.proposals.forEach((item, position) => {
    const index = batch.indexes?.[position] ?? position
    const reject = (reason: string) => results.push({ index, question_id: item.question_id, state: item.state, outcome: 'rejected', reason })
    const question = engine.question(item.question_id)
    if (!question) return reject('unknown question id')
    if (question.sensitivity === 'restricted') {
      return reject('restricted question: the owner answers it in the interactive interview. Agents and model providers never handle restricted values.')
    }
    const notApplicable = engine.applicability(question)
    if (notApplicable) return reject(`not applicable: ${notApplicable}`)
    if (touched.has(question.id)) return reject('duplicate: this batch already has a proposal for this question')
    if (!quotationIsVerbatim(item.quotation, batch.source_text)) {
      return reject('provenance: the quotation does not appear verbatim in the source text')
    }

    if (isPersonalQuestion(question)) {
      const refusal = privateDataRefusal(question, item.quotation)
      if (refusal) return reject(`privacy: ${refusal}`)
    }
    let value: AnswerRecord['value'] = null
    if (item.state !== 'unresolved') {
      const normalized = normalizeAnswer(question, String(item.value))
      if (!normalized.ok) return reject(`invalid value: ${normalized.message}`)
      value = normalized.value
    }
    touched.add(question.id)

    const latest = latestAnswers(engine.ledger().records).get(question.id)
    const correction = item.correction === true

    if (latest?.status === 'approved') {
      if (item.state !== 'unresolved' && sameValue(latest.value, value)) {
        return results.push({ index, question_id: question.id, state: item.state, outcome: 'unchanged', reason: 'matches the approved value' })
      }
      if (correction && item.state === 'proposed') {
        if (dryRun) return results.push({ index, question_id: question.id, state: item.state, outcome: 'change_proposed', reason: 'would open a change proposal (dry run)' })
        const change = engine.requestChange(question.id, String(value))
        return results.push({
          index,
          question_id: question.id,
          state: item.state,
          outcome: 'change_proposed',
          change_id: change.id,
          reason: 'approved fact kept; a change proposal now waits for human approval',
        })
      }
      conflicts.push({
        question_id: question.id,
        against_answer_id: latest.answer_id,
        existing: { value: latest.value, status: latest.status },
        proposed: { value, state: item.state },
        quotation: item.quotation,
        ask: clarifyingQuestion(question, latest, value, item.state),
      })
      return results.push({
        index,
        question_id: question.id,
        state: item.state,
        outcome: 'conflict',
        reason: correction
          ? 'approved facts change only through a proposed replacement value; tentative or unresolved corrections are recorded as a conflict'
          : 'differs from the approved fact; ask the owner, then submit a correction',
      })
    }

    if (latest) {
      const unresolvedAgain = item.state === 'unresolved' && latest.value === null && latest.status === 'unknown'
      const sameDraft = item.state !== 'unresolved' && sameValue(latest.value, value) && (latest.proposal_state ?? 'proposed') === item.state
      if (unresolvedAgain || sameDraft) {
        return results.push({ index, question_id: question.id, state: item.state, outcome: 'unchanged', reason: 'matches the current draft' })
      }
      // A different existing value is only replaced when the owner corrected it. New information may fill
      // a gap the owner left (unknown, skipped) and may firm up a tentative draft into a proposed one.
      const firmingUp = latest.proposal_state === 'tentative' && item.state === 'proposed' && sameValue(latest.value, value)
      if (hasValue(latest) && !correction && !firmingUp) {
        conflicts.push({
          question_id: question.id,
          against_answer_id: latest.answer_id,
          existing: { value: latest.value, status: latest.status },
          proposed: { value, state: item.state },
          quotation: item.quotation,
          ask: clarifyingQuestion(question, latest, value, item.state),
        })
        return results.push({ index, question_id: question.id, state: item.state, outcome: 'conflict', reason: 'differs from the current draft; ask the owner which is right' })
      }
    }

    const outcome: IntakeOutcome = item.state === 'unresolved' ? 'unresolved' : 'drafted'
    if (dryRun) return results.push({ index, question_id: question.id, state: item.state, outcome, reason: 'would be stored (dry run)' })
    const answer = engine.recordProposal(question, value, {
      state: item.state,
      confidence: item.confidence,
      quotation: item.quotation,
      sourceReference: `intake:${batchId}#${index}`,
      uncertainty: uncertaintyFor(item.state, item.quotation),
    })
    results.push({
      index,
      question_id: question.id,
      state: item.state,
      outcome,
      answer_id: answer.answer_id,
      reason: outcome === 'unresolved' ? 'marked unresolved; no value stored' : `stored as a ${item.state} draft; not approved`,
    })
  })

  results.sort((a, b) => a.index - b.index)
  const counts = EMPTY_COUNTS()
  for (const result of results) counts[result.outcome] += 1
  // Follow-ups that point at restricted or unknown ids are dropped; the interviewer must not ask for restricted values.
  const followUps = batch.follow_ups.filter((item) => {
    if (!item.question_id) return true
    const question = engine.question(item.question_id)
    return Boolean(question && question.sensitivity !== 'restricted')
  })
  for (const item of batch.proposals) {
    const question = engine.question(item.question_id)
    if (item.follow_up && question && question.sensitivity !== 'restricted' && !followUps.some((entry) => entry.text === item.follow_up)) {
      followUps.push({ question_id: item.question_id, text: item.follow_up })
    }
  }

  if (!dryRun && batchId) {
    log.batches.push({
      id: batchId,
      received_at: (opts.now ?? (() => new Date()))().toISOString(),
      origin: opts.origin,
      provider: opts.provider ?? null,
      source: batch.source,
      redactions: opts.redactions ?? 0,
      results,
      conflicts,
      follow_ups: followUps,
      owner_questions: batch.owner_questions,
    })
    writeYaml(intakeLogPath(root), log)
  }

  return {
    ok: true,
    dry_run: dryRun,
    batch_id: batchId,
    origin: opts.origin,
    provider: opts.provider ?? null,
    source: batch.source,
    results,
    conflicts,
    follow_ups: followUps.map((item) => ({ ...item, untrusted: true as const })),
    owner_questions: batch.owner_questions.map((text) => ({ text, untrusted: true as const })),
    counts,
    redactions: opts.redactions ?? 0,
    notice: 'Proposals are drafts with provenance. Nothing was approved or published. A human reviews with brand:review and approves with brand:approve.',
  }
}

// ---- derived interview state for brand:next -----------------------------------------------------

/** Conflicts that are still open: the question's latest answer is the one the conflict was raised against. */
export function openConflicts(engine: InterviewEngine): IntakeConflict[] {
  const latest = latestAnswers(engine.ledger().records)
  const open = new Map<string, IntakeConflict>()
  for (const batch of readIntakeLog(engine.workspaceRoot()).batches) {
    for (const conflict of batch.conflicts ?? []) {
      if (latest.get(conflict.question_id)?.answer_id === conflict.against_answer_id) open.set(conflict.question_id, conflict)
      else open.delete(conflict.question_id)
    }
  }
  return [...open.values()]
}

/** Follow-ups whose question is still open, unresolved, or only tentative. */
export function openFollowUps(engine: InterviewEngine): Array<{ question_id: string | null; text: string; batch_id: string; untrusted: true }> {
  const latest = latestAnswers(engine.ledger().records)
  const batches = readIntakeLog(engine.workspaceRoot()).batches
  const lastId = batches.at(-1)?.id
  const seen = new Set<string>()
  const out: Array<{ question_id: string | null; text: string; batch_id: string; untrusted: true }> = []
  for (const batch of [...batches].reverse()) {
    for (const item of batch.follow_ups ?? []) {
      if (seen.has(item.text)) continue
      if (item.question_id) {
        const question = engine.question(item.question_id)
        if (!question || question.sensitivity === 'restricted') continue
        const answer = latest.get(item.question_id)
        const open = !answer || answer.status === 'unanswered' || answer.status === 'unknown' || answer.proposal_state === 'tentative'
        if (!open || answer?.status === 'approved') continue
      } else if (batch.id !== lastId) {
        continue
      }
      seen.add(item.text)
      out.push({ question_id: item.question_id ?? null, text: item.text, batch_id: batch.id, untrusted: true })
    }
  }
  return out
}
