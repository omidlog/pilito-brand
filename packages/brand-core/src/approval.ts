import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { authorize, verifiedHumanContext, type Audience } from './auth.js'
import { readFacts, writeFacts, type CanonicalFact } from './facts.js'
import { exists, readYaml, writeAtomic, writeYaml } from './fsutil.js'
import { booleanWord, t, type Locale } from './i18n.js'
import { canApprove, permissionFor, type ApprovalGrant } from './permissions.js'
import { approvalProofMatches, PrivateStore } from './private-store.js'
import { publicationBlockers, readEvidence, reviewEvidence as reviewEvidenceRecord, unpublishBlocked, withdrawEvidence as withdrawEvidenceRecord } from './evidence.js'
import { privateDataRefusal } from './personal-privacy.js'
import { readPublicationPolicy } from './publication.js'
import { isStructuredType, normalizeStructured } from './structured.js'
import type { AnswerRecord, Authority, FieldQuestion, ProposalState, SourceType, Status } from './types.js'

/**
 * Approval and publication service.
 *
 * Invariants kept here, in one place:
 * - Every write path checks the human approval proof first. A wrong proof changes nothing.
 * - Approval never publishes. Publication is a separate call that only accepts approved public facts.
 * - An approved fact is never rewritten in place by an edit. A change is a pending proposal, and the
 *   approved revision stays canonical until a human approves that proposal against its version.
 * - Versions are monotonic. A proposal made against an older version is stale and is refused.
 */

export interface AnswerMeta {
  sourceType: SourceType | null
  authority: Authority
  status: Status
  uncertainty: string | null
  confidence?: number | null
  sourceReference?: string | null
  raw?: string | null
  reviewedBy?: string | null
  privateRef?: string | null
  proposalState?: ProposalState | null
}

/** What the interview engine lends the approval service. Built by the engine; never by a client. */
export interface ApprovalHost {
  root: string
  brandId(): string
  locale(): Locale
  questions(): FieldQuestion[]
  question(id: string): FieldQuestion | undefined
  latestAnswers(): Map<string, AnswerRecord>
  supersede(answerId: string): void
  appendAnswer(question: FieldQuestion, value: AnswerRecord['value'], meta: AnswerMeta): AnswerRecord
  afterWrite(question: FieldQuestion, answer: AnswerRecord): void
  onApproved(question: FieldQuestion, answer: AnswerRecord): void
}

export interface ApprovalStep {
  kind: 'recorded' | 'error'
  message: string
  questionId?: string
  status?: Status
  version?: number
  /** Why an error happened, so batch callers never parse messages. */
  code?: 'proof' | 'refused' | 'stale' | 'not_approvable' | 'already_approved' | 'invalid'
}

export interface ChangeProposal {
  id: string
  question_id: string
  expected_version: number
  status: 'pending' | 'approved'
  proposed_value: string | null
  private_ref: string | null
  created_at?: string
}

/** Pick a whole module or an explicit list. Ids may name questions or change proposals (`chg-…`). */
export interface Selection {
  module?: string
  ids?: string[]
}

export interface ReviewItem {
  question_id: string
  module: string
  label: string
  classification: Audience
  required_grant: ApprovalGrant
  state: 'draft' | 'change_pending' | 'approved' | 'unanswered' | 'not_approvable' | 'unknown_id'
  action: 'approve_draft' | 'approve_change' | 'none'
  reason: string
  withheld: boolean
  draft: {
    answer_id: string
    status: Status
    value: AnswerRecord['value']
    authority: Authority
    source_type: SourceType | null
    uncertainty: string | null
    /** proposed | tentative when the draft came from an interview proposal. Tentative drafts are not decisions. */
    proposal_state: ProposalState | null
  } | null
  approved: { value: unknown; version: number; publication: CanonicalFact['publication'] } | null
  changes: Array<{ id: string; proposed_value: string | null; expected_version: number; stale: boolean }>
  impact: { documents: string[]; questions: string[]; published: boolean }
}

export interface ReviewQueue {
  brand_id: string
  selection: Selection
  items: ReviewItem[]
  pending: number
}

export type BatchOutcome = 'approved' | 'skipped' | 'refused' | 'stale' | 'unknown' | 'error'

export interface BatchItemResult {
  id: string
  question_id: string | null
  change_id?: string
  outcome: BatchOutcome
  reason: string
  version?: number
}

export interface BatchResult {
  ok: boolean
  proof: 'accepted' | 'rejected'
  approved: number
  results: BatchItemResult[]
}

export type PublishOutcome = 'published' | 'unpublished' | 'unchanged' | 'refused' | 'unknown'

export interface PublishResult {
  ok: boolean
  proof: 'accepted' | 'rejected'
  changed: number
  results: Array<{ id: string; outcome: PublishOutcome; reason: string }>
}

const NOT_APPROVABLE: Status[] = ['unknown', 'skipped', 'not_applicable', 'unanswered']

export class ApprovalService {
  constructor(private readonly host: ApprovalHost) {}

  private get root(): string {
    return this.host.root
  }

  private now(): string {
    return new Date().toISOString()
  }

  proofMatches(proof: string | undefined): boolean {
    return approvalProofMatches(this.root, proof)
  }

  // ---- change proposals -------------------------------------------------------------------

  /** Record a pending replacement for an approved fact. The approved revision is not touched. */
  requestChange(questionId: string, rawValue: string): { id: string; expected_version: number } {
    const question = this.host.question(questionId)
    if (!question) throw new Error(`Unknown question ${questionId}`)
    const approved = readApprovedMap(this.root)[questionId]
    const version = typeof approved?.version === 'number' ? approved.version : 1
    const id = `chg-${crypto.randomBytes(6).toString('hex')}`
    const proposals = readProposals(this.root)
    const restricted = question.sensitivity === 'restricted'
    proposals.push({
      id,
      question_id: questionId,
      expected_version: version,
      status: 'pending',
      proposed_value: restricted ? null : rawValue,
      private_ref: restricted ? new PrivateStore(this.root).put(questionId, { value: rawValue, raw: rawValue }) : null,
      created_at: this.now(),
    })
    writeProposals(this.root, proposals)
    return { id, expected_version: version }
  }

  pendingChanges(): ChangeProposal[] {
    return readProposals(this.root).filter((item) => item.status === 'pending')
  }

  approveChange(changeId: string, proof: string | undefined, expectedVersion: number, actor = 'owner'): ApprovalStep {
    if (!this.proofMatches(proof)) {
      return { kind: 'error', code: 'proof', message: 'Stale, missing, or forged approval proof was rejected. The approved fact was not changed.' }
    }
    return this.approveChangeVerified(changeId, expectedVersion, actor)
  }

  private approveChangeVerified(changeId: string, expectedVersion: number, actor: string): ApprovalStep {
    const proposals = readProposals(this.root)
    const proposal = proposals.find((item) => item.id === changeId)
    if (!proposal || proposal.status !== 'pending') return { kind: 'error', code: 'invalid', message: 'Proposal not found.' }
    const question = this.host.question(proposal.question_id)
    if (!question) return { kind: 'error', code: 'invalid', message: 'Proposal question is missing.' }
    const refusal = this.reviewerRefusal(question, actor)
    if (refusal) return { kind: 'error', code: 'refused', questionId: question.id, message: refusal }
    const currentFact = readFacts(this.root, 'approved', this.host.brandId())[proposal.question_id]
    if (!currentFact || currentFact.status !== 'approved' || currentFact.version !== expectedVersion || proposal.expected_version !== expectedVersion) {
      return { kind: 'error', code: 'stale', questionId: question.id, message: 'Stale revision. Current approved fact does not match this proposal. No change was made.' }
    }
    const stored = proposal.private_ref ? new PrivateStore(this.root).get(proposal.private_ref) : null
    if (proposal.private_ref && (!stored || stored.questionId !== question.id)) {
      return { kind: 'error', code: 'invalid', questionId: question.id, message: 'Restricted proposal payload is missing or mismatched.' }
    }
    const raw = proposal.private_ref ? String(stored?.raw ?? '') : String(proposal.proposed_value ?? '')
    const normalized = normalizeAnswer(question, raw)
    if (!normalized.ok) return { kind: 'error', code: 'invalid', questionId: question.id, message: normalized.message }
    const value = proposal.private_ref ? null : normalized.value
    const latest = this.host.latestAnswers().get(question.id)
    if (latest) this.host.supersede(latest.answer_id)
    const answer = this.host.appendAnswer(question, value, {
      sourceType: 'owner',
      authority: 'confirmed_by_owner',
      status: 'approved',
      uncertainty: null,
      raw: proposal.private_ref ? null : raw,
      reviewedBy: actor,
      privateRef: proposal.private_ref,
    })
    const version = currentFact.version + 1
    const wasPublished = currentFact.publication === 'published'
    this.writeApprovedFact(question, answer, version)
    // The published revision is gone from canonical facts, so its allowlist grant goes with it.
    // Publishing the replacement is a separate, explicit step.
    if (wasPublished || readPublicationPolicy(this.root).approved_fact_ids.includes(question.id)) this.updatePolicy([], [question.id])
    proposal.status = 'approved'
    writeProposals(this.root, proposals)
    this.host.onApproved(question, answer)
    this.host.afterWrite(question, answer)
    return {
      kind: 'recorded',
      questionId: question.id,
      status: 'approved',
      version,
      message: `Replacement approved as version ${version}. Previous revision remains in the ledger.${wasPublished ? ' It was unpublished; run brand:publish to publish the new revision.' : ''}`,
    }
  }

  // ---- single approval ----------------------------------------------------------------------

  approve(questionId: string, actor: string, proof?: string): ApprovalStep {
    const question = this.host.question(questionId)
    if (!question) return { kind: 'error', code: 'invalid', message: `Unknown question ${questionId}.` }
    if (!this.proofMatches(proof)) {
      return {
        kind: 'error',
        code: 'proof',
        questionId,
        message: 'Approval refused. An actor name is not authentication. Provide the human approval proof from brand/.private/approval-secret.',
      }
    }
    return this.approveVerified(question, actor)
  }

  private reviewerRefusal(question: FieldQuestion, actor: string): string | null {
    const brandId = this.host.brandId()
    const reviewer = verifiedHumanContext(brandId, actor)
    const decision = reviewer
      ? authorize(reviewer, { brand_id: brandId, classification: question.sensitivity as Audience, status: 'draft', publication: 'unpublished' }, 'approve')
      : { allow: false, reason: 'actor is not a verified human role' }
    if (!decision.allow) return `Approval refused. ${decision.reason}.`
    if (!canApprove(actor, question)) return t(this.host.locale(), 'denied', { actor })
    return null
  }

  private approveVerified(question: FieldQuestion, actor: string): ApprovalStep {
    const questionId = question.id
    const locale = this.host.locale()
    const refusal = this.reviewerRefusal(question, actor)
    if (refusal) return { kind: 'error', code: 'refused', questionId, message: refusal }
    const latest = this.host.latestAnswers().get(questionId)
    const previousVersion = readApprovedMap(this.root)[questionId]?.version
    if (latest?.status === 'approved') {
      // Re-approving would rewrite the fact and must never reset its version, because
      // approveChange's stale-revision check depends on it. Changes go through a proposal.
      return {
        kind: 'error',
        code: 'already_approved',
        questionId,
        message: `${questionId} is already approved (version ${typeof previousVersion === 'number' ? previousVersion : 'unknown'}). Nothing was changed. To replace it, propose a change ("change ${questionId}: …") and approve that proposal.`,
      }
    }
    const hasSubstance = Boolean(latest && (latest.value !== null || latest.private_ref))
    if (!latest || !hasSubstance || NOT_APPROVABLE.includes(latest.status)) {
      return { kind: 'error', code: 'not_approvable', questionId, message: t(locale, 'cannotApprove') }
    }
    this.host.supersede(latest.answer_id)
    const answer = this.host.appendAnswer(question, latest.value, {
      sourceType: latest.source_type ?? 'owner',
      authority: latest.authority === 'estimated' ? 'estimated' : 'confirmed_by_owner',
      status: 'approved',
      uncertainty: latest.uncertainty,
      confidence: latest.confidence,
      sourceReference: latest.source_reference,
      raw: latest.raw_answer,
      reviewedBy: actor,
      privateRef: latest.private_ref ?? null,
    })
    // Monotonic: a field that held an approved revision before gets the next version, never 1 again.
    const version = typeof previousVersion === 'number' ? previousVersion + 1 : 1
    this.writeApprovedFact(question, answer, version)
    this.host.onApproved(question, answer)
    this.host.afterWrite(question, answer)
    return { kind: 'recorded', questionId, status: 'approved', version, message: t(locale, 'approved', { actor }) }
  }

  private writeApprovedFact(question: FieldQuestion, answer: AnswerRecord, version: number): void {
    const brandId = this.host.brandId()
    const facts = readFacts(this.root, 'approved', brandId)
    const fact: CanonicalFact = {
      id: question.id,
      brand_id: brandId,
      module: question.module,
      value: question.sensitivity === 'restricted' ? null : answer.value,
      value_type: question.question_type,
      status: 'approved',
      classification: question.sensitivity as Audience,
      // Approval is never publication. Every new revision starts unpublished.
      publication: 'unpublished',
      source: { kind: 'interview', answer_ids: [answer.answer_id], reference_ids: [], citation_paths: ['brand/instance/approved-facts.yaml'], observed_at: answer.last_updated },
      confidence: answer.confidence ?? null,
      assumptions: [],
      owner: null,
      reviewer_id: answer.reviewed_by,
      approved_at: answer.last_updated,
      version,
      revision_hash: `${question.id}:${version}`,
      review_due: null,
      related_ids: question.related_ids,
      private_ref: answer.private_ref ?? null,
    }
    facts[question.id] = fact
    writeFacts(this.root, 'approved', facts)
  }

  // ---- review queue -------------------------------------------------------------------------

  private resolveSelection(selection: Selection): { questions: FieldQuestion[]; changeIds: string[]; unknown: string[]; error?: string } {
    const all = this.host.questions()
    if (selection.module && selection.ids?.length) return { questions: [], changeIds: [], unknown: [], error: 'Choose --module or --ids, not both.' }
    if (selection.module) {
      const questions = all.filter((question) => question.module === selection.module)
      if (questions.length === 0) return { questions: [], changeIds: [], unknown: [], error: `Unknown module ${selection.module}.` }
      return { questions, changeIds: [], unknown: [] }
    }
    if (selection.ids?.length) {
      const byId = new Map(all.map((question) => [question.id, question]))
      const questions: FieldQuestion[] = []
      const changeIds: string[] = []
      const unknown: string[] = []
      const proposals = readProposals(this.root)
      for (const id of [...new Set(selection.ids)]) {
        const question = byId.get(id)
        if (question) questions.push(question)
        else if (id.startsWith('chg-') && proposals.some((item) => item.id === id)) changeIds.push(id)
        else unknown.push(id)
      }
      return { questions, changeIds, unknown }
    }
    return { questions: all, changeIds: [], unknown: [] }
  }

  /** Draft-against-approved diff for a module, an id list, or (with no selection) every pending item. */
  reviewQueue(selection: Selection = {}, options: { includeSettled?: boolean } = {}): ReviewQueue {
    const resolved = this.resolveSelection(selection)
    if (resolved.error) throw new Error(resolved.error)
    const includeSettled = options.includeSettled ?? Boolean(selection.ids?.length)
    const answers = this.host.latestAnswers()
    const approvedFacts = readFacts(this.root, 'approved', this.host.brandId())
    const pending = this.pendingChanges()
    const items: ReviewItem[] = []
    const questions = [...resolved.questions]
    for (const changeId of resolved.changeIds) {
      const proposal = pending.find((item) => item.id === changeId)
      const question = proposal ? this.host.question(proposal.question_id) : undefined
      if (question && !questions.includes(question)) questions.push(question)
    }
    for (const question of questions) {
      const item = this.reviewItem(question, answers.get(question.id), approvedFacts[question.id], pending.filter((change) => change.question_id === question.id))
      if (includeSettled || item.action !== 'none') items.push(item)
    }
    for (const id of resolved.unknown) {
      items.push({
        question_id: id, module: 'unknown', label: id, classification: 'internal', required_grant: 'canonical', state: 'unknown_id',
        action: 'none', reason: 'No question or pending change has this id.', withheld: false, draft: null, approved: null, changes: [],
        impact: { documents: [], questions: [], published: false },
      })
    }
    return { brand_id: this.host.brandId(), selection, items, pending: items.filter((item) => item.action !== 'none').length }
  }

  private reviewItem(question: FieldQuestion, latest: AnswerRecord | undefined, fact: CanonicalFact | undefined, changes: ChangeProposal[]): ReviewItem {
    const withheld = question.sensitivity === 'restricted'
    const approvedVersion = fact?.status === 'approved' ? fact.version : null
    const changeRows = changes.map((change) => ({
      id: change.id,
      proposed_value: withheld ? null : change.proposed_value,
      expected_version: change.expected_version,
      stale: approvedVersion === null || change.expected_version !== approvedVersion,
    }))
    let state: ReviewItem['state']
    let action: ReviewItem['action'] = 'none'
    let reason: string
    if (!latest) {
      state = 'unanswered'
      reason = 'No answer recorded.'
    } else if (latest.status === 'approved') {
      const live = changeRows.filter((change) => !change.stale)
      if (live.length > 0) {
        state = 'change_pending'
        action = 'approve_change'
        reason = live.length > 1 ? `${live.length} competing change proposals. Approve one by its chg- id.` : 'Replacement proposed. The approved revision stays canonical until this is approved.'
      } else {
        state = 'approved'
        reason = changeRows.length ? 'Approved. Only stale proposals remain.' : 'Approved. No pending change.'
      }
    } else if (NOT_APPROVABLE.includes(latest.status) || (latest.value === null && !latest.private_ref)) {
      state = 'not_approvable'
      reason = `Status ${latest.status}. Unknown, skipped, and empty answers cannot become facts.`
    } else {
      state = 'draft'
      action = 'approve_draft'
      reason = fact ? `Draft differs from approved version ${fact.version}.` : 'Draft, never approved.'
    }
    const impactedQuestions = new Set<string>(question.related_ids)
    for (const other of this.host.questions()) {
      if (other.depends_on.includes(question.id) || other.related_ids.includes(question.id)) impactedQuestions.add(other.id)
    }
    return {
      question_id: question.id,
      module: question.module,
      label: question.label,
      classification: question.sensitivity,
      required_grant: permissionFor(question),
      state,
      action,
      reason,
      withheld,
      draft: latest && latest.status !== 'approved'
        ? {
            answer_id: latest.answer_id,
            status: latest.status,
            value: withheld ? null : latest.value,
            authority: latest.authority,
            source_type: latest.source_type,
            uncertainty: latest.uncertainty,
            proposal_state: latest.proposal_state ?? null,
          }
        : null,
      approved: fact?.status === 'approved' ? { value: withheld ? null : fact.value, version: fact.version, publication: fact.publication } : null,
      changes: changeRows,
      impact: { documents: [...question.related_outputs], questions: [...impactedQuestions], published: fact?.publication === 'published' },
    }
  }

  // ---- batch approval -----------------------------------------------------------------------

  /**
   * Approve a module or an id list with one proof. A wrong proof refuses every item and writes
   * nothing. With a valid proof each item is decided on its own and reported; nothing is dropped.
   */
  approveBatch(selection: Selection, proof: string | undefined, actor = 'owner'): BatchResult {
    const resolved = this.resolveSelection(selection)
    if (resolved.error) throw new Error(resolved.error)
    if (!selection.module && !selection.ids?.length) throw new Error('Batch approval needs --module or --ids.')
    const targets = [...resolved.questions.map((question) => question.id), ...resolved.changeIds]
    if (!this.proofMatches(proof)) {
      const reason = 'Approval proof rejected. Nothing was changed.'
      return {
        ok: false,
        proof: 'rejected',
        approved: 0,
        results: [
          ...targets.map((id) => ({ id, question_id: id.startsWith('chg-') ? null : id, outcome: 'refused' as const, reason })),
          ...resolved.unknown.map((id) => ({ id, question_id: null, outcome: 'unknown' as const, reason: 'No question or pending change has this id.' })),
        ],
      }
    }
    const results: BatchItemResult[] = []
    for (const question of resolved.questions) results.push(this.approveQuestionInBatch(question, actor))
    for (const changeId of resolved.changeIds) results.push(this.approveChangeInBatch(changeId, actor))
    for (const id of resolved.unknown) results.push({ id, question_id: null, outcome: 'unknown', reason: 'No question or pending change has this id.' })
    const approved = results.filter((item) => item.outcome === 'approved').length
    const failed = results.some((item) => ['refused', 'stale', 'unknown', 'error'].includes(item.outcome))
    return { ok: !failed, proof: 'accepted', approved, results }
  }

  private approveQuestionInBatch(question: FieldQuestion, actor: string): BatchItemResult {
    const id = question.id
    const latest = this.host.latestAnswers().get(id)
    const changes = this.pendingChanges().filter((change) => change.question_id === id)
    if (latest?.status === 'approved') {
      const version = readFacts(this.root, 'approved', this.host.brandId())[id]?.version
      const live = changes.filter((change) => change.expected_version === version)
      if (live.length === 0) {
        if (changes.length > 0) return { id, question_id: id, outcome: 'stale', reason: `Only stale proposals (made against an older version than ${String(version)}). Nothing was changed.` }
        return { id, question_id: id, outcome: 'skipped', reason: 'Already approved and no change is pending.' }
      }
      if (live.length > 1) {
        return { id, question_id: id, outcome: 'skipped', reason: `${live.length} competing change proposals (${live.map((item) => item.id).join(', ')}). Approve one by its chg- id.` }
      }
      const change = live[0] as ChangeProposal
      return this.toBatchResult(id, this.safely(() => this.approveChangeVerified(change.id, change.expected_version, actor)), change.id)
    }
    if (!latest) return { id, question_id: id, outcome: 'skipped', reason: 'No answer recorded.' }
    if (NOT_APPROVABLE.includes(latest.status) || (latest.value === null && !latest.private_ref)) {
      return { id, question_id: id, outcome: 'skipped', reason: `Status ${latest.status}. Unknown, skipped, and empty answers cannot become facts.` }
    }
    return this.toBatchResult(id, this.safely(() => this.approveVerified(question, actor)))
  }

  private approveChangeInBatch(changeId: string, actor: string): BatchItemResult {
    const proposal = this.pendingChanges().find((item) => item.id === changeId)
    if (!proposal) return { id: changeId, question_id: null, change_id: changeId, outcome: 'skipped', reason: 'Proposal is no longer pending.' }
    const current = readFacts(this.root, 'approved', this.host.brandId())[proposal.question_id]
    if (!current || current.version !== proposal.expected_version) {
      return { id: changeId, question_id: proposal.question_id, change_id: changeId, outcome: 'stale', reason: 'Stale revision. A newer version was approved after this proposal. Nothing was changed.' }
    }
    const step = this.safely(() => this.approveChangeVerified(changeId, proposal.expected_version, actor))
    return { ...this.toBatchResult(changeId, step, changeId), question_id: proposal.question_id }
  }

  private safely(run: () => ApprovalStep): ApprovalStep {
    try {
      return run()
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'Approval failed.' }
    }
  }

  private toBatchResult(id: string, step: ApprovalStep, changeId?: string): BatchItemResult {
    const base = { id, question_id: step.questionId ?? (id.startsWith('chg-') ? null : id), ...(changeId ? { change_id: changeId } : {}) }
    if (step.kind === 'recorded') return { ...base, outcome: 'approved', reason: step.message, version: step.version }
    const outcome: Record<NonNullable<ApprovalStep['code']>, BatchOutcome> = {
      proof: 'refused',
      refused: 'refused',
      stale: 'stale',
      not_approvable: 'skipped',
      already_approved: 'skipped',
      invalid: 'error',
    }
    return { ...base, outcome: step.code ? outcome[step.code] : 'error', reason: step.message }
  }

  // ---- publication --------------------------------------------------------------------------

  publishFact(questionId: string, proof?: string): ApprovalStep {
    const result = this.publish({ ids: [questionId] }, proof)
    const item = result.results[0]
    if (result.proof === 'rejected') return { kind: 'error', message: 'Publication requires the human proof. Visibility public is not publication.' }
    if (!item || (item.outcome !== 'published' && item.outcome !== 'unchanged')) {
      return { kind: 'error', questionId, message: item?.reason ?? 'Only an approved public fact can be published.' }
    }
    return { kind: 'recorded', questionId, status: 'approved', message: 'Fact published to the public projection.' }
  }

  /**
   * Publish (or with `unpublish`, withdraw) approved facts. Only approved, public-classified facts
   * with a value can be published. The allowlist in publication-policy.yaml is written atomically.
   */
  publish(selection: Selection, proof: string | undefined, options: { unpublish?: boolean } = {}): PublishResult {
    if (selection.module && selection.ids?.length) throw new Error('Choose --module or --ids, not both.')
    if (!selection.module && !selection.ids?.length) throw new Error('Publishing needs --module or --ids.')
    const brandId = this.host.brandId()
    const facts = readFacts(this.root, 'approved', brandId)
    const policy = readPublicationPolicy(this.root)
    let ids: string[]
    if (selection.module) {
      const inModule = this.host.questions().filter((question) => question.module === selection.module).map((question) => question.id)
      if (inModule.length === 0) throw new Error(`Unknown module ${selection.module}.`)
      ids = options.unpublish
        ? inModule.filter((id) => facts[id]?.publication === 'published' || policy.approved_fact_ids.includes(id))
        : inModule.filter((id) => facts[id]?.status === 'approved')
    } else {
      ids = [...new Set(selection.ids ?? [])]
    }
    if (!this.proofMatches(proof)) {
      return { ok: false, proof: 'rejected', changed: 0, results: ids.map((id) => ({ id, outcome: 'refused', reason: 'Publication proof rejected. Nothing was changed.' })) }
    }
    const reviewer = verifiedHumanContext(brandId, 'owner')
    if (!reviewer || !authorize(reviewer, { brand_id: brandId, classification: 'public', status: 'approved', publication: 'unpublished' }, 'approve').allow) {
      return { ok: false, proof: 'accepted', changed: 0, results: ids.map((id) => ({ id, outcome: 'refused', reason: 'Publication refused.' })) }
    }
    const results: PublishResult['results'] = []
    const evidence = readEvidence(this.root)
    const add: string[] = []
    const remove: string[] = []
    for (const id of ids) {
      const fact = facts[id]
      const question = this.host.question(id)
      if (options.unpublish) {
        const listed = policy.approved_fact_ids.includes(id)
        if (!fact && !listed) {
          results.push({ id, outcome: 'unknown', reason: 'No approved fact or allowlist entry has this id.' })
          continue
        }
        if (fact?.publication !== 'published' && !listed) {
          results.push({ id, outcome: 'unchanged', reason: 'Not published.' })
          continue
        }
        if (fact) fact.publication = 'unpublished'
        remove.push(id)
        results.push({ id, outcome: 'unpublished', reason: 'Removed from the public projection and the publication allowlist.' })
        continue
      }
      if (!fact && !question) {
        results.push({ id, outcome: 'unknown', reason: 'No question or approved fact has this id.' })
        continue
      }
      if (!fact || fact.status !== 'approved' || fact.brand_id !== brandId) {
        results.push({ id, outcome: 'refused', reason: 'Not approved. Approve it first; approval and publication are separate steps.' })
        continue
      }
      if (fact.classification !== 'public' || (question && question.sensitivity !== 'public')) {
        results.push({ id, outcome: 'refused', reason: `Classification is ${question && question.sensitivity !== 'public' ? question.sensitivity : fact.classification}. Only public-classified facts can be published.` })
        continue
      }
      if (fact.value === null || fact.value === undefined) {
        results.push({ id, outcome: 'refused', reason: 'Approved fact has no value to publish.' })
        continue
      }
      const blockers = question ? publicationBlockers(question, fact.value, evidence, new Date(this.now())) : []
      if (blockers.length) {
        results.push({ id, outcome: 'refused', reason: blockers.join(' ') })
        continue
      }
      if (fact.publication === 'published' && policy.approved_fact_ids.includes(id)) {
        results.push({ id, outcome: 'unchanged', reason: `Already published (version ${fact.version}).` })
        continue
      }
      fact.publication = 'published'
      add.push(id)
      results.push({ id, outcome: 'published', reason: `Version ${fact.version} published to the public projection.` })
    }
    if (add.length || remove.length) {
      writeFacts(this.root, 'approved', facts)
      this.updatePolicy(add, remove)
    }
    const changed = add.length + remove.length
    return { ok: !results.some((item) => item.outcome === 'refused' || item.outcome === 'unknown'), proof: 'accepted', changed, results }
  }

  // ---- evidence and retraction (Personal Brand OS) -----------------------------------------

  /**
   * Owner review of an evidence or permission record. Verified and rejected both need the proof.
   * A rejection can make a published claim fail its gate; such claims are unpublished at once.
   */
  reviewEvidence(id: string, decision: 'verified' | 'rejected', proof: string | undefined, reason: string | null = null, actor = 'owner'): { ok: boolean; message: string; unpublished: string[] } {
    if (!this.proofMatches(proof)) return { ok: false, message: 'Evidence review requires the human proof. Nothing was changed.', unpublished: [] }
    const item = reviewEvidenceRecord(this.root, id, decision, actor, new Date(this.now()), reason)
    const unpublished = unpublishBlocked(this.root, this.host.brandId(), new Date(this.now()))
    const kind = item.source_type === 'owner_testimony' && item.kind === 'verification' ? ' Owner testimony stays owner-stated; it never counts as independent verification.' : ''
    return { ok: true, message: `${id} ${decision} for ${item.claim_id}.${kind}`, unpublished }
  }

  /** Withdraw evidence or a permission. Needs no proof because it only restricts publication. */
  withdrawEvidence(id: string, reason: string): { ok: boolean; message: string; unpublished: string[] } {
    const item = withdrawEvidenceRecord(this.root, id, reason, new Date(this.now()))
    const unpublished = unpublishBlocked(this.root, this.host.brandId(), new Date(this.now()))
    return {
      ok: true,
      message: `${id} withdrawn for ${item.claim_id}.${unpublished.length ? ` Unpublished: ${unpublished.join(', ')}.` : ''}`,
      unpublished,
    }
  }

  /**
   * Retract an approved claim entirely (for example a wrong credential). Needs the proof. The approved
   * fact and its publication grant are removed, the ledger keeps the history with a deprecated record,
   * and drafts and documents that cited it are rebuilt from what remains.
   */
  retract(questionId: string, proof: string | undefined, reason: string): ApprovalStep {
    if (!this.proofMatches(proof)) return { kind: 'error', code: 'proof', questionId, message: 'Retraction requires the human proof. Nothing was changed.' }
    const question = this.host.question(questionId)
    if (!question) return { kind: 'error', code: 'invalid', questionId, message: `Unknown question ${questionId}.` }
    const brandId = this.host.brandId()
    const facts = readFacts(this.root, 'approved', brandId)
    const fact = facts[questionId]
    if (!fact) return { kind: 'error', code: 'not_approvable', questionId, message: `${questionId} has no approved fact to retract.` }
    delete facts[questionId]
    writeFacts(this.root, 'approved', facts)
    this.updatePolicy([], [questionId])
    const latest = this.host.latestAnswers().get(questionId)
    if (latest) this.host.supersede(latest.answer_id)
    const answer = this.host.appendAnswer(question, null, {
      sourceType: 'owner',
      authority: 'unverified',
      status: 'deprecated',
      uncertainty: `Retracted by the owner: ${reason.trim().slice(0, 300) || 'no reason given'}. Version ${fact.version} is kept in the ledger history only.`,
      reviewedBy: 'owner',
    })
    this.host.afterWrite(question, answer)
    return { kind: 'recorded', questionId, status: 'deprecated', message: `Retracted ${questionId} (was version ${fact.version}). It is no longer approved or published. Documents were rebuilt.` }
  }

  private updatePolicy(add: string[], remove: string[]): void {
    const file = path.join(this.root, 'brand', 'publication-policy.yaml')
    const policy = exists(file)
      ? readYaml<Record<string, unknown> & { approved_fact_ids?: string[] }>(file)
      : { schema_version: 1, brand_id: this.host.brandId(), approved_fact_ids: [] as string[] }
    const current = Array.isArray(policy.approved_fact_ids) ? policy.approved_fact_ids : []
    const next = current.filter((id) => !remove.includes(id))
    for (const id of add) if (!next.includes(id)) next.push(id)
    policy.approved_fact_ids = next
    writeYaml(file, policy)
  }
}

// ---- storage helpers ------------------------------------------------------------------------

function proposalFile(root: string): string {
  return path.join(root, 'brand', '.private', 'proposals.json')
}

export function readProposals(root: string): ChangeProposal[] {
  const file = proposalFile(root)
  if (!fs.existsSync(file)) return []
  return (JSON.parse(fs.readFileSync(file, 'utf8')) as { proposals: ChangeProposal[] }).proposals
}

function writeProposals(root: string, proposals: ChangeProposal[]): void {
  fs.mkdirSync(path.dirname(proposalFile(root)), { recursive: true, mode: 0o700 })
  writeAtomic(proposalFile(root), `${JSON.stringify({ proposals })}\n`, { mode: 0o600 })
}

function readApprovedMap(root: string): Record<string, { version?: number; value?: unknown }> {
  const file = path.join(root, 'brand', 'instance', 'approved-facts.yaml')
  if (!fs.existsSync(file)) return {}
  return readYaml<{ facts: Record<string, { version?: number; value?: unknown }> }>(file).facts ?? {}
}

export function isPersonalQuestion(question: Pick<FieldQuestion, 'id'>): boolean {
  return question.id.startsWith('personal.')
}

export function normalizeAnswer(
  question: FieldQuestion,
  rawValue: string,
): { ok: true; value: string | number | boolean } | { ok: false; message: string } {
  const value = rawValue.trim()
  if (!value) return { ok: false, message: 'Empty answer. Use unknown, skip, or decide later.' }
  // Personal Brand OS never stores a home address, personal phone, birth date, government id or family details.
  if (isPersonalQuestion(question)) {
    const refusal = privateDataRefusal(question, value)
    if (refusal) return { ok: false, message: refusal }
  }
  if (question.question_type === 'boolean') {
    const word = booleanWord(value)
    if (word) return { ok: true, value: word }
    return { ok: false, message: 'Answer yes or no. Or say unknown.' }
  }
  if (isStructuredType(question.question_type)) return normalizeStructured(question.question_type, value)
  if (question.question_type === 'single_choice') {
    const match = question.options?.find((option) => option.toLowerCase() === value.toLowerCase())
    if (!match) return { ok: false, message: `Choose one of: ${(question.options ?? []).join(', ')}` }
    return { ok: true, value: match }
  }
  if (question.question_type === 'number') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return { ok: false, message: 'Enter a number, or say unknown.' }
    return { ok: true, value: parsed }
  }
  if (question.question_type === 'url') {
    if (!/^https?:\/\//.test(value)) return { ok: false, message: 'Enter an http(s) URL, or say none is not available for this field — use unknown.' }
    return { ok: true, value }
  }
  if (question.validation?.min_length && value.length < question.validation.min_length) {
    return { ok: false, message: `Answer must be at least ${question.validation.min_length} characters.` }
  }
  return { ok: true, value }
}
