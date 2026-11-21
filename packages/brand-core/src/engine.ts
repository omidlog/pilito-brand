import fs from 'node:fs'
import path from 'node:path'
import { disabledModule, shouldSkip, type ConditionContext } from './conditions.js'
import { completeness, latestAnswers } from './completeness.js'
import { findContradictions } from './contradictions.js'
import { fieldBlock, renderDraftFile, upsertFieldBlock } from './documents.js'
import { exists, readYaml, writeAtomic, writeYaml } from './fsutil.js'
import { t, normalizeCommand, type Locale } from './i18n.js'
import { ApprovalService, isPersonalQuestion, normalizeAnswer, type AnswerMeta, type ApprovalStep } from './approval.js'
import { exportPublic as projectPublic } from './projection.js'
import { authorize, guestContext, operatorContext, verifiedHumanContext } from './auth.js'
import { backupBrand, migrateBrand } from './backup.js'
import { completenessScope, loadProfile, type InterviewProfile } from './profiles.js'
import { privateDataRefusal } from './personal-privacy.js'
import { personalConfig } from './conditions.js'
import { extractByRules } from './llm/rules.js'
import { approvalProofMatches, PrivateStore } from './private-store.js'
import type {
  AnswerRecord,
  Authority,
  BrandConfig,
  Contradiction,
  FieldQuestion,
  ProposalState,
  LedgerFile,
  PendingProposal,
  PersonalFacet,
  PersonalModuleConfig,
  SessionState,
  SourceType,
  Status,
} from './types.js'
import { PERSONAL_FACETS } from './types.js'
import { templateConfig } from './config.js'
import { ensureStarterProfiles } from './personal.js'

export interface StepResult {
  kind: 'recorded' | 'info' | 'exit' | 'error' | 'impact'
  message: string
  questionId?: string
  status?: Status
  impact?: ImpactReport
}

export interface ImpactReport {
  questionId: string
  previous: { value: AnswerRecord['value']; status: Status } | null
  proposedPreview: string
  requiresConfirmation: boolean
  impactedDocuments: string[]
  impactedQuestions: string[]
  approvalsPreserved: boolean
}

export interface InitInput {
  name: string
  slug: string
  industry: string
  sector?: string
  language: string
  languages: string[]
  website?: string | null
  mascot: boolean
  gamification: boolean
  publish: 'public' | 'private'
  profile?: string
  /** Turn on the Personal Brand OS module. Implied by `profile: personal-brand`. */
  personal?: boolean
  /** Personal facets, for example founder-executive and consultant-expert. Needs the personal module. */
  facets?: string[]
  reset?: boolean
}

/** Personal module settings for brand:init. Throws on an unknown facet or facets without the module. */
export function personalInit(input: Pick<InitInput, 'profile' | 'personal' | 'facets'>): PersonalModuleConfig {
  const enabled = input.personal === true || input.profile === 'personal-brand'
  const facets = [...new Set((input.facets ?? []).map((item) => item.trim()).filter(Boolean))]
  const unknown = facets.filter((facet) => !(PERSONAL_FACETS as readonly string[]).includes(facet))
  if (unknown.length) throw new Error(`Unknown personal facet ${unknown.join(', ')}. Use: ${PERSONAL_FACETS.join(', ')}.`)
  if (facets.length && !enabled) throw new Error('Facets need the personal module. Use --profile personal-brand or --personal true.')
  return { enabled, facets: facets as PersonalFacet[] }
}

function isPersonalBrand(config: BrandConfig): boolean {
  return config.brand.profile === 'personal-brand' && personalConfig(config).enabled
}

const CONFIG_BINDINGS: Array<{ id: string; assign: (config: BrandConfig, value: string) => void }> = [
  {
    id: 'brand.mascot.enabled',
    assign: (config, value) => {
      config.modules.mascot.enabled = value === 'yes'
    },
  },
  {
    id: 'brand.gamification.enabled',
    assign: (config, value) => {
      config.modules.gamification.enabled = value === 'yes'
    },
  },
  {
    id: 'business.identity.sector',
    assign: (config, value) => {
      config.brand.sector = value
    },
  },
  {
    id: 'personal.identity.public_name',
    assign: (config, value) => {
      if (!isPersonalBrand(config)) return
      config.brand.working_name = value
      config.brand.working_name_status = 'draft'
    },
  },
  {
    id: 'business.identity.trade_name',
    assign: (config, value) => {
      // A company trade name never renames a personal brand.
      if (isPersonalBrand(config)) return
      config.brand.working_name = value
      config.brand.working_name_status = 'draft'
    },
  },
  {
    id: 'business.stage.current',
    assign: (config, value) => {
      config.brand.stage = value
    },
  },
  {
    id: 'business.identity.new_or_existing',
    assign: (config, value) => {
      config.brand.new_or_existing = value
    },
  },
]

function priorityRank(question: FieldQuestion, sector: string | null): number {
  const base = { critical: 0, high: 1, medium: 2, low: 3 }[question.priority]
  if (sector && question.sector_hints.includes(sector)) return base - 0.5
  return base
}

export class InterviewEngine {
  private cachedQuestions: FieldQuestion[] | null = null

  constructor(
    private readonly root: string,
    private readonly opts: { now?: () => Date } = {},
  ) {}

  private now(): string {
    return (this.opts.now ?? (() => new Date()))().toISOString()
  }

  private file(...parts: string[]): string {
    return path.join(this.root, ...parts)
  }

  workspaceRoot(): string {
    return this.root
  }

  questions(): FieldQuestion[] {
    if (this.cachedQuestions) return this.cachedQuestions
    const dir = this.file('brand', 'interview', 'question-bank')
    if (!exists(dir)) return []
    const questions: FieldQuestion[] = []
    for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith('.yaml'))) {
      const doc = readYaml<{ questions: FieldQuestion[] }>(path.join(dir, name))
      questions.push(...doc.questions)
    }
    this.cachedQuestions = questions.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    return this.cachedQuestions
  }

  question(id: string): FieldQuestion | undefined {
    return this.questions().find((item) => item.id === id)
  }

  config(): BrandConfig {
    return readYaml<BrandConfig>(this.file('brand', 'brand.config.yaml'))
  }

  private saveConfig(config: BrandConfig): void {
    writeYaml(this.file('brand', 'brand.config.yaml'), config)
  }

  ledger(): LedgerFile {
    return readYaml<LedgerFile>(this.file('brand', 'interview', 'answer-ledger.yaml'))
  }

  session(): SessionState {
    return readYaml<SessionState>(this.file('brand', 'interview', 'session-state.yaml'))
  }

  private saveSession(session: SessionState): void {
    session.updated_at = this.now()
    writeYaml(this.file('brand', 'interview', 'session-state.yaml'), session)
  }

  private context(): ConditionContext {
    return { config: this.config(), answers: latestAnswers(this.ledger().records) }
  }

  private depsSatisfied(question: FieldQuestion, ctx: ConditionContext): boolean {
    const byId = new Map(this.questions().map((item) => [item.id, item]))
    return question.depends_on.every((id) => {
      const dependency = byId.get(id)
      if (dependency && shouldSkip(dependency.skip_when, ctx)) return true
      const answer = ctx.answers.get(id)
      return Boolean(answer && answer.status !== 'unanswered')
    })
  }

  /** The active interview profile from brand.profile, or null when every question is in scope. */
  profile(): InterviewProfile | null {
    return loadProfile(this.root, this.config().brand.profile)
  }

  /**
   * Open questions in asking order. The active profile narrows the set unless `profile` is given:
   * pass `universal` to see the whole bank, or another profile id to preview it.
   */
  eligible(opts: { profile?: string } = {}): FieldQuestion[] {
    const ctx = this.context()
    const sectorAnswer = ctx.answers.get('business.identity.sector')
    const sector = sectorAnswer?.value === null || sectorAnswer?.value === undefined ? null : String(sectorAnswer.value)
    const profile = opts.profile === undefined ? this.profile() : loadProfile(this.root, opts.profile)
    const inProfile = profile ? new Set(profile.question_ids) : null
    return this.questions()
      .filter((question) => {
        if (inProfile && !inProfile.has(question.id)) return false
        if (disabledModule(question.id, ctx) || shouldSkip(question.skip_when, ctx)) return false
        const answer = ctx.answers.get(question.id)
        if (answer && answer.status !== 'unanswered') return false
        return this.depsSatisfied(question, ctx)
      })
      .sort((a, b) => {
        const rank = priorityRank(a, sector) - priorityRank(b, sector)
        if (rank !== 0) return rank
        if (a.order !== b.order) return a.order - b.order
        return a.id.localeCompare(b.id)
      })
  }

  isEligible(id: string): boolean {
    return this.eligible().some((question) => question.id === id)
  }

  current(): FieldQuestion | null {
    const session = this.session()
    if (session.cursor_question_id) {
      return this.question(session.cursor_question_id) ?? null
    }
    const open = this.eligible()
    const deferred = new Set(session.deferred)
    return open.find((question) => !deferred.has(question.id)) ?? open.find((question) => deferred.has(question.id)) ?? null
  }

  queue(limit = 10, opts: { profile?: string } = {}): FieldQuestion[] {
    const session = this.session()
    const deferred = new Set(session.deferred)
    const open = this.eligible(opts)
    const ordered = [...open.filter((question) => !deferred.has(question.id)), ...open.filter((question) => deferred.has(question.id))]
    return ordered.slice(0, limit)
  }

  private ensureSession(): string {
    const session = this.session()
    if (!session.session_id) {
      session.session_id = 'ses-0001'
      session.status = 'active'
      session.started_at = session.started_at ?? this.now()
      this.saveSession(session)
    } else if (session.status === 'idle' || session.status === 'paused') {
      session.status = 'active'
      this.saveSession(session)
    }
    return session.session_id
  }

  promptText(question: FieldQuestion, locale: Locale = this.session().locale): { text: string; fellBack: boolean } {
    const text = question.prompt[locale]
    if (text && text.trim()) return { text, fellBack: false }
    return { text: question.prompt.en, fellBack: locale !== 'en' }
  }

  submit(rawInput: string, actor = 'owner'): StepResult {
    const decision = authorize(operatorContext(this.config().brand.slug), { brand_id: this.config().brand.slug, classification: 'internal', status: 'draft', publication: 'unpublished' }, 'write')
    if (!decision.allow) return { kind: 'error', message: decision.reason }
    const raw = normalizeCommand(rawInput).trim()
    const lower = raw.toLowerCase()
    const session = this.session()
    const locale = session.locale

    if (lower === 'help') return { kind: 'info', message: t(locale, 'commands') }
    if (lower === 'exit' || lower === 'quit') {
      session.status = 'paused'
      this.saveSession(session)
      return { kind: 'exit', message: t(locale, 'exit') }
    }
    const lang = lower.match(/^lang\s+(en|fa|tr)$/)
    if (lang) {
      session.locale = lang[1] as Locale
      this.saveSession(session)
      return { kind: 'info', message: `Locale set to ${session.locale}.` }
    }
    if (lower === 'status') return { kind: 'info', message: this.statusText() }
    if (lower === 'review') return { kind: 'info', message: this.reviewText() }
    if (lower === 'go back' || lower === 'back') return this.goBack()

    const change = raw.match(/^(confirm\s+)?change\s+(\S+)\s*:\s*([\s\S]+)$/i)
    if (change) {
      return this.changeAnswer(change[2] ?? '', (change[3] ?? '').trim(), Boolean(change[1]), actor)
    }
    const approve = raw.match(/^approve\s+(\S+)(?:\s+as\s+(\S+))?$/i)
    if (approve) return this.approve(approve[1] ?? '', approve[2] ?? actor)

    const current = this.current()
    if (!current) return { kind: 'info', message: t(locale, 'noMore') }

    if (lower === 'show examples') {
      return {
        kind: 'info',
        questionId: current.id,
        message: `${t(locale, 'examplesTitle')}\n${current.examples.map((example) => `- ${example}`).join('\n')}`,
      }
    }
    if (lower === 'suggest options') {
      const suggestions = current.suggestions?.length ? current.suggestions : current.examples
      session.pending_suggestions = suggestions
      this.saveSession(session)
      return {
        kind: 'info',
        questionId: current.id,
        message: `${t(locale, 'suggestionsTitle')}\n${suggestions.map((item, index) => `${index + 1}. ${item}`).join('\n')}`,
      }
    }
    // Only an explicit `note:` prefix routes to free-form capture. Any other text, in any script
    // (Persian included), is an answer to the current question and is recorded as one.
    if (lower.startsWith('note:')) return this.captureNaturalLanguage(raw.slice(5))
    const proposal = lower.match(/^accept proposal\s+(\d+)$/)
    if (proposal) return this.acceptProposal(Number(proposal[1]) - 1)
    const accept = lower.match(/^accept\s+(\d+)$/)
    if (accept) {
      const index = Number(accept[1]) - 1
      const suggestion = session.pending_suggestions[index]
      if (!suggestion) return { kind: 'error', message: 'No suggestion with that number. Use suggest options first.' }
      return this.record(current, suggestion, {
        sourceType: 'agent_suggestion',
        authority: 'unverified',
        status: 'draft',
        uncertainty: 'Agent suggestion from the question bank. Not a confirmed fact until a person approves it.',
      })
    }

    const disposition = dispositionFor(raw)
    if (disposition) {
      return this.record(current, null, { sourceType: 'owner', authority: 'unverified', status: disposition.status, uncertainty: disposition.uncertainty, raw })
    }
    if (['decide later', 'later'].includes(lower)) {
      if (!session.deferred.includes(current.id)) session.deferred.push(current.id)
      session.history.push(current.id)
      session.cursor_question_id = null
      this.saveSession(session)
      return { kind: 'info', questionId: current.id, message: t(locale, 'later') }
    }

    const estimate = raw.match(/^estimate\s*:\s*([\s\S]+)$/i)
    if (estimate) {
      return this.recordNormalized(current, estimate[1] ?? '', {
        sourceType: 'owner',
        authority: 'estimated',
        status: 'draft',
        uncertainty: 'Owner described this as an estimate.',
        confidence: 0.4,
        raw,
      })
    }
    const imported = raw.match(/^import\s+(approved|existing)\s*:\s*(\S+)$/i)
    if (imported) {
      const kind = (imported[1] ?? '').toLowerCase()
      const url = imported[2] ?? ''
      if (!/^https?:\/\//.test(url)) return { kind: 'error', message: 'Import needs an http(s) URL. The file was not fetched.' }
      return this.record(current, url, {
        sourceType: kind === 'approved' ? 'approved_import' : 'external_cited',
        authority: 'unverified',
        status: 'draft',
        uncertainty: 'Reference recorded. The contents were not fetched or turned into facts.',
        sourceReference: url,
        raw,
      })
    }

    return this.recordNormalized(current, raw, {
      sourceType: 'owner',
      authority: 'confirmed_by_owner',
      status: 'draft',
      uncertainty: null,
      raw,
    })
  }

  private recordNormalized(
    question: FieldQuestion,
    rawValue: string,
    meta: {
      sourceType: SourceType
      authority: Authority
      status: Status
      uncertainty: string | null
      confidence?: number | null
      sourceReference?: string | null
      raw: string
    },
  ): StepResult {
    const normalized = normalizeAnswer(question, rawValue)
    if (!normalized.ok) return { kind: 'error', questionId: question.id, message: normalized.message }
    return this.record(question, normalized.value, { ...meta, raw: meta.raw })
  }

  private record(
    question: FieldQuestion,
    value: string | number | boolean | null,
    meta: {
      sourceType: SourceType
      authority: Authority
      status: Status
      uncertainty: string | null
      confidence?: number | null
      sourceReference?: string | null
      raw?: string
    },
  ): StepResult {
    const latest = this.context().answers.get(question.id)
    if (latest && latest.status === 'approved') {
      const impact = this.impact(question.id, meta.raw ?? String(value ?? ''))
      return {
        kind: 'impact',
        questionId: question.id,
        impact,
        message: `${t(this.session().locale, 'needConfirm')}\n${formatImpact(impact)}`,
      }
    }
    if (latest) this.supersede(latest.answer_id)
    const answer = this.appendAnswer(question, value, meta)
    this.afterWrite(question, answer)
    const locale = this.session().locale
    const message =
      answer.status === 'unknown'
        ? t(locale, 'unknown')
        : answer.status === 'skipped'
          ? t(locale, 'skipped')
          : answer.status === 'not_applicable'
            ? t(locale, 'irrelevant')
            : t(locale, 'recorded', { status: answer.status })
    return { kind: 'recorded', questionId: question.id, status: answer.status, message }
  }

  changeAnswer(questionId: string, rawValue: string, _confirm = false, _actor = 'owner'): StepResult {
    const write = authorize(operatorContext(this.config().brand.slug), { brand_id: this.config().brand.slug, classification: 'internal', status: 'draft', publication: 'unpublished' }, 'write')
    if (!write.allow) return { kind: 'error', message: write.reason }
    const question = this.question(questionId)
    if (!question) return { kind: 'error', message: `Unknown question ${questionId}.` }
    const latest = this.context().answers.get(questionId)
    const impact = this.impact(questionId, question.sensitivity === 'restricted' ? '[restricted]' : rawValue)
    if (latest?.status === 'approved' && dispositionFor(rawValue)) {
      return {
        kind: 'error',
        questionId,
        message: `${questionId} is approved. A change proposal needs a replacement value, not "${rawValue.trim()}". The approved fact was not changed.`,
      }
    }
    if (latest?.status === 'approved') {
      const proposal = this.requestChange(questionId, rawValue)
      return {
        kind: 'impact',
        questionId,
        impact: { ...impact, approvalsPreserved: true, requiresConfirmation: true },
        message: `Approved fact was not changed. Proposal ${proposal.id} is pending. A human must approve that proposal. confirm=true is not authority.`,
      }
    }
    // `unknown`, `skip` and `n/a` are dispositions, not values. Storing the literal word would turn
    // "I don't know" into a draft answer that reads like a fact.
    const disposition = dispositionFor(rawValue)
    if (disposition) {
      if (latest) this.supersede(latest.answer_id)
      const answer = this.appendAnswer(question, null, {
        sourceType: 'owner',
        authority: 'unverified',
        status: disposition.status,
        uncertainty: disposition.uncertainty,
        raw: rawValue.trim(),
      })
      this.afterWrite(question, answer)
      return { kind: 'recorded', questionId, status: disposition.status, impact, message: `Marked ${disposition.status}. No value was stored.` }
    }
    const normalized = normalizeAnswer(question, rawValue)
    if (!normalized.ok) return { kind: 'error', questionId, message: normalized.message }
    if (latest) this.supersede(latest.answer_id)
    const answer = this.appendAnswer(question, normalized.value, {
      sourceType: 'owner',
      authority: 'confirmed_by_owner',
      status: 'draft',
      uncertainty: null,
      raw: rawValue,
    })
    this.afterWrite(question, answer)
    return { kind: 'recorded', questionId, status: 'draft', impact, message: 'Draft updated. Not approved.' }
  }

  /**
   * Answer any question by id, in any order. This is the entry point an interviewing agent uses.
   * The same commands as the interactive interview apply (unknown, skip, n/a, estimate:). Questions
   * that the current configuration or answers make not applicable are refused rather than recorded.
   */
  answerQuestion(questionId: string, rawInput: string): StepResult {
    const write = authorize(operatorContext(this.config().brand.slug), { brand_id: this.config().brand.slug, classification: 'internal', status: 'draft', publication: 'unpublished' }, 'write')
    if (!write.allow) return { kind: 'error', message: write.reason }
    const question = this.question(questionId)
    if (!question) return { kind: 'error', message: `Unknown question ${questionId}.` }
    const applicability = this.applicability(question)
    if (applicability) return { kind: 'error', questionId, message: applicability }
    const raw = normalizeCommand(rawInput).trim()
    const disposition = dispositionFor(raw)
    if (disposition) {
      return this.record(question, null, { sourceType: 'owner', authority: 'unverified', status: disposition.status, uncertainty: disposition.uncertainty, raw })
    }
    const estimate = raw.match(/^estimate\s*:\s*([\s\S]+)$/i)
    if (estimate) {
      return this.recordNormalized(question, estimate[1] ?? '', {
        sourceType: 'owner',
        authority: 'estimated',
        status: 'draft',
        uncertainty: 'Owner described this as an estimate.',
        confidence: 0.4,
        raw,
      })
    }
    return this.recordNormalized(question, raw, { sourceType: 'owner', authority: 'confirmed_by_owner', status: 'draft', uncertainty: null, raw })
  }

  /** Null when the question applies; otherwise the reason it does not under the current config and answers. */
  applicability(question: FieldQuestion): string | null {
    const ctx = this.context()
    if (disabledModule(question.id, ctx)) return `${question.id} belongs to a module that is turned off in brand.config.yaml.`
    if (shouldSkip(question.skip_when, ctx)) return `${question.id} does not apply to the current answers (${question.skip_when}).`
    return null
  }

  /**
   * Write one validated interview proposal as a draft or an unresolved marker. Callers (the proposal
   * intake) have already refused restricted ids and approved targets; this re-checks both so the
   * engine never lets a proposal become, or replace, an approved fact.
   */
  recordProposal(
    question: FieldQuestion,
    value: AnswerRecord['value'],
    meta: { state: ProposalState; confidence: number; quotation: string; sourceReference: string; uncertainty: string },
  ): AnswerRecord {
    if (question.sensitivity === 'restricted') throw new Error(`Refusing to record a proposal for restricted ${question.id}.`)
    if (isPersonalQuestion(question)) {
      const refusal = privateDataRefusal(question, value) ?? privateDataRefusal(question, meta.quotation)
      if (refusal) throw new Error(refusal)
    }
    const latest = this.context().answers.get(question.id)
    if (latest?.status === 'approved') throw new Error(`Refusing to overwrite approved ${question.id} with a proposal.`)
    if (latest) this.supersede(latest.answer_id)
    const answer = this.appendAnswer(question, meta.state === 'unresolved' ? null : value, {
      sourceType: 'agent_suggestion',
      authority: 'unverified',
      status: meta.state === 'unresolved' ? 'unknown' : 'draft',
      uncertainty: meta.uncertainty,
      confidence: meta.confidence,
      sourceReference: meta.sourceReference,
      raw: meta.quotation,
      proposalState: meta.state,
    })
    this.afterWrite(question, answer)
    return answer
  }

  /** Approval and publication live in approval.ts. The engine lends it narrow access to its ledger. */
  approvals(): ApprovalService {
    return new ApprovalService({
      root: this.root,
      brandId: () => this.config().brand.slug,
      locale: () => this.session().locale,
      questions: () => this.questions(),
      question: (id) => this.question(id),
      latestAnswers: () => this.context().answers,
      supersede: (answerId) => this.supersede(answerId),
      appendAnswer: (question, value, meta) => this.appendAnswer(question, value, meta),
      afterWrite: (question, answer) => this.afterWrite(question, answer),
      onApproved: (question, answer) => this.applyApprovedName(question, answer),
    })
  }

  requestChange(questionId: string, rawValue: string): { id: string; expected_version: number } {
    return this.approvals().requestChange(questionId, rawValue)
  }

  approveChange(changeId: string, proof: string | undefined, expectedVersion: number, actor = 'owner'): StepResult {
    return toStep(this.approvals().approveChange(changeId, proof, expectedVersion, actor))
  }

  approve(questionId: string, actor: string, proof?: string): StepResult {
    return toStep(this.approvals().approve(questionId, actor, proof))
  }

  publishFact(questionId: string, proof?: string): StepResult {
    return toStep(this.approvals().publishFact(questionId, proof))
  }

  private applyApprovedName(question: FieldQuestion, answer: AnswerRecord): void {
    if (typeof answer.value !== 'string') return
    const config = this.config()
    // For a personal brand the person's approved public name is the brand name. A company trade name
    // never overwrites it, and the person's name never becomes a company's legal or trade name.
    const personalBrand = isPersonalBrand(config)
    if (question.id === 'personal.identity.public_name' ? !personalBrand : question.id !== 'business.identity.trade_name' || personalBrand) return
    config.brand.name = answer.value
    config.brand.name_status = 'approved'
    config.brand.working_name = answer.value
    config.brand.working_name_status = 'approved'
    this.saveConfig(config)
  }

  private impact(questionId: string, proposed: string): ImpactReport {
    const question = this.question(questionId)
    const latest = this.context().answers.get(questionId)
    const related = new Set<string>(question?.related_outputs ?? [])
    const impactedQuestions = new Set<string>()
    for (const other of this.questions()) {
      if (other.depends_on.includes(questionId) || other.related_ids.includes(questionId)) impactedQuestions.add(other.id)
    }
    for (const id of question?.related_ids ?? []) impactedQuestions.add(id)
    return {
      questionId,
      previous: latest ? { value: latest.value, status: latest.status } : null,
      proposedPreview: proposed,
      requiresConfirmation: latest?.status === 'approved',
      impactedDocuments: [...related],
      impactedQuestions: [...impactedQuestions],
      approvalsPreserved: latest?.status === 'approved',
    }
  }

  private supersede(answerId: string): void {
    const ledger = this.ledger()
    const record = ledger.records.find((item) => item.answer_id === answerId && !item.superseded_by)
    if (!record) return
    const next = `ans-${String(ledger.records.length + 1).padStart(4, '0')}`
    record.superseded_by = next
    writeYaml(this.file('brand', 'interview', 'answer-ledger.yaml'), ledger)
  }

  private appendAnswer(question: FieldQuestion, value: AnswerRecord['value'], meta: AnswerMeta): AnswerRecord {
    const ledger = this.ledger()
    const sessionId = this.ensureSession()
    let storedValue = value
    let storedRaw = meta.raw ?? (value === null ? null : String(value))
    let privateRef = meta.privateRef ?? null
    if (question.sensitivity === 'restricted') {
      if (storedValue !== null && storedValue !== undefined) {
        privateRef = new PrivateStore(this.root).put(question.id, { value: storedValue, raw: storedRaw })
      }
      storedValue = null
      storedRaw = null
    }
    const answer: AnswerRecord = {
      answer_id: `ans-${String(ledger.records.length + 1).padStart(4, '0')}`,
      question_id: question.id,
      value: storedValue,
      raw_answer: storedRaw,
      source_type: meta.sourceType,
      source_reference: meta.sourceReference ?? null,
      authority: meta.authority,
      confidence: meta.confidence ?? null,
      status: meta.status,
      last_updated: this.now(),
      reviewed_by: meta.reviewedBy ?? null,
      visibility: question.sensitivity,
      uncertainty: meta.uncertainty,
      session_id: sessionId,
      normalized: storedValue,
      superseded_by: null,
      disposition_reason: meta.uncertainty,
      private_ref: privateRef,
      ...(meta.proposalState ? { proposal_state: meta.proposalState } : {}),
    }
    ledger.records.push(answer)
    writeYaml(this.file('brand', 'interview', 'answer-ledger.yaml'), ledger)
    const session = this.session()
    session.last_answer_id = answer.answer_id
    session.cursor_question_id = null
    session.pending_suggestions = []
    session.deferred = session.deferred.filter((id) => id !== question.id)
    session.history.push(question.id)
    session.status = 'active'
    this.saveSession(session)
    return answer
  }

  private afterWrite(question: FieldQuestion, answer: AnswerRecord): void {
    if (answer.value !== null && typeof answer.value !== 'boolean') {
      const binding = CONFIG_BINDINGS.find((item) => item.id === question.id)
      if (binding) {
        const config = this.config()
        binding.assign(config, String(answer.value))
        this.saveConfig(config)
      }
    }
    if (typeof answer.value === 'boolean') {
      const binding = CONFIG_BINDINGS.find((item) => item.id === question.id)
      if (binding) {
        const config = this.config()
        binding.assign(config, answer.value ? 'yes' : 'no')
        this.saveConfig(config)
      }
    }
    if (answer.value !== null && (answer.value === 'yes' || answer.value === 'no')) {
      const binding = CONFIG_BINDINGS.find((item) => item.id === question.id)
      if (binding && question.question_type === 'boolean') {
        const config = this.config()
        binding.assign(config, String(answer.value))
        this.saveConfig(config)
      }
    }
    this.writeFact(question, answer)
    this.writeDocuments(question, answer)
    if (answer.source_reference) this.addEvidence(question, answer)
    this.refreshContradictions()
  }

  private writeFact(question: FieldQuestion, answer: AnswerRecord): void {
    const file = this.file('brand', 'instance', 'draft-facts.yaml')
    const doc = exists(file)
      ? readYaml<{ schema_version: number; facts: Record<string, unknown> }>(file)
      : { schema_version: 1, facts: {} }
    doc.facts[question.id] = {
      value: question.sensitivity === 'restricted' ? '[restricted]' : answer.value,
      stored_in: question.sensitivity === 'restricted' ? 'brand/.private' : 'brand/instance/draft-facts.yaml',
      private_ref: answer.private_ref ?? null,
      status: answer.status,
      visibility: question.sensitivity,
      authority: answer.authority,
      source_type: answer.source_type,
      uncertainty: answer.uncertainty,
      answer_id: answer.answer_id,
      updated: answer.last_updated,
      ...(answer.proposal_state ? { proposal_state: answer.proposal_state } : {}),
    }
    writeYaml(file, doc)
  }

  private writeDocuments(question: FieldQuestion, answer: AnswerRecord): void {
    const targets = question.related_outputs.length ? question.related_outputs : []
    for (const relative of targets) {
      const file = this.resolveOutput(relative)
      upsertFieldBlock(file, question.id, fieldBlock(question, answer, file))
    }
  }

  private addEvidence(question: FieldQuestion, answer: AnswerRecord): void {
    const file = this.file('brand', 'interview', 'evidence-index.yaml')
    const doc = exists(file)
      ? readYaml<{ schema_version: number; items: Array<Record<string, unknown>> }>(file)
      : { schema_version: 1, items: [] }
    doc.items.push({
      answer_id: answer.answer_id,
      question_id: question.id,
      source_reference: answer.source_reference,
      source_type: answer.source_type,
      captured_at: answer.last_updated,
      confidentiality: question.sensitivity,
      review_status: answer.status,
      note: 'Reference only. Contents were not fetched.',
    })
    writeYaml(file, doc)
  }

  private refreshContradictions(): void {
    const config = this.config()
    const items = findContradictions(this.questions(), this.context().answers, config.modules.mascot.enabled, config.modules.gamification.enabled)
    writeYaml(this.file('brand', 'interview', 'contradictions.yaml'), {
      schema_version: 1,
      derived: true,
      scanned_at: this.now(),
      items,
    })
  }

  contradictions(): Contradiction[] {
    const file = this.file('brand', 'interview', 'contradictions.yaml')
    if (!exists(file)) return []
    return readYaml<{ items: Contradiction[] }>(file).items
  }

  private resolveOutput(relative: string): string {
    if (relative.includes('..')) throw new Error(`Unsafe output path: ${relative}`)
    const full = path.resolve(this.root, relative)
    const root = path.resolve(this.root)
    if (full !== root && !full.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe output path: ${relative}`)
    return full
  }

  private goBack(): StepResult {
    const session = this.session()
    const previous = [...session.history].reverse().find((id) => id !== session.cursor_question_id)
    if (!previous) return { kind: 'info', message: 'No earlier question in this session.' }
    session.cursor_question_id = previous
    this.saveSession(session)
    const question = this.question(previous)
    return { kind: 'info', questionId: previous, message: question ? `Back to ${question.id}.` : 'Back.' }
  }

  statusReport() {
    const report = completeness(this.questions(), this.context(), completenessScope(this.profile()))
    const next = this.queue(5).map((question) => ({
      id: question.id,
      priority: question.priority,
      prompt: question.prompt.en,
      module: question.module,
    }))
    return { ...report, next, contradictions: this.contradictions().length, session: this.session() }
  }

  statusText(): string {
    const report = this.statusReport()
    const lines = [
      `Coverage (required fields with a disposition): ${(report.coverage * 100).toFixed(1)}%`,
      `Approval (required fields approved): ${(report.approval * 100).toFixed(1)}%`,
      `Required unanswered: ${report.requiredUnanswered} / ${report.required}`,
      `Open contradictions: ${report.contradictions}`,
      'Next questions:',
      ...report.next.map((item) => `- [${item.priority}] ${item.id}`),
    ]
    return lines.join('\n')
  }

  captureNaturalLanguage(text: string): StepResult {
    const proposals: PendingProposal[] = this.extractProposals(text)
    // Free text in any configured language: the same deterministic rules as `--assist` without a model.
    // Restricted questions and questions that do not apply are never targets.
    const allowed = new Set(this.questions().filter((question) => question.sensitivity !== 'restricted' && this.applicability(question) === null).map((question) => question.id))
    for (const item of extractByRules(text, { allowed }).proposals) {
      if (proposals.some((proposal) => proposal.question_id === item.question_id)) continue
      proposals.push({ question_id: item.question_id, value: item.value ?? '', quotation: item.quotation, state: item.state, confidence: item.confidence })
    }
    if (proposals.length === 0) {
      return {
        kind: 'info',
        message: 'I could not map that note onto a known field. Use one label per line, such as "Trade name: …". Nothing was saved.',
      }
    }
    const session = this.session()
    session.pending_proposals = proposals
    this.saveSession(session)
    const lines = proposals.map((item, index) => `${index + 1}. ${item.question_id}${item.state && item.state !== 'proposed' ? ` [${item.state}]` : ''} ← “${item.quotation}”`)
    return {
      kind: 'info',
      message: `Proposed drafts, not approvals:\n${lines.join('\n')}\nReply "accept proposal 1" to save a draft. A human proof is still required to approve.`,
    }
  }

  extractProposals(text: string): PendingProposal[] {
    const proposals: PendingProposal[] = []
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([^:]{2,80}):\s+(\S[\s\S]*)$/)
      if (!match) continue
      const label = (match[1] ?? '').trim().toLowerCase()
      const value = (match[2] ?? '').trim()
      const question = this.questions().find((item) => item.id.toLowerCase() === label || item.label.toLowerCase() === label)
      if (!question || question.sensitivity === 'restricted') continue
      proposals.push({ question_id: question.id, value, quotation: line.trim() })
    }
    return proposals
  }

  private acceptProposal(index: number): StepResult {
    const session = this.session()
    const proposal = session.pending_proposals?.[index]
    if (!proposal) return { kind: 'error', message: 'No proposal with that number.' }
    const question = this.question(proposal.question_id)
    if (!question) return { kind: 'error', message: 'That proposal no longer matches a question.' }
    if (isPersonalQuestion(question)) {
      const refusal = privateDataRefusal(question, proposal.value) ?? privateDataRefusal(question, proposal.quotation)
      if (refusal) return { kind: 'error', questionId: question.id, message: refusal }
    }
    if (proposal.state) {
      if (question.sensitivity === 'restricted') return { kind: 'error', message: 'Restricted questions are answered directly, not from a note.' }
      if (this.context().answers.get(question.id)?.status === 'approved') {
        return { kind: 'error', questionId: question.id, message: `${question.id} is approved. Use change ${question.id}: <value> to propose a replacement.` }
      }
      const unresolved = proposal.state === 'unresolved'
      const answer = this.recordProposal(question, unresolved ? null : proposal.value, {
        state: proposal.state,
        confidence: proposal.confidence ?? 0.5,
        quotation: proposal.quotation,
        sourceReference: 'note',
        uncertainty:
          proposal.state === 'tentative'
            ? `Tentative: the owner described this as possible, not decided: “${proposal.quotation}”. Not a decision.`
            : unresolved
              ? `Unresolved: the owner said this is not decided yet: “${proposal.quotation}”. No value was invented.`
              : `Extracted from the owner note: ${proposal.quotation}. Not approved.`,
      })
      return { kind: 'recorded', questionId: question.id, status: answer.status, message: `Saved as a ${proposal.state} ${unresolved ? 'marker' : 'draft'}. Quotation kept. Not approved.` }
    }
    const result = this.record(question, proposal.value, {
      sourceType: 'owner',
      authority: 'unverified',
      status: 'draft',
      uncertainty: `Extracted from the owner note: ${proposal.quotation}. Not approved.`,
      raw: proposal.quotation,
    })
    return { ...result, message: `${result.message} Quotation kept. Status remains draft.` }
  }

  revealRestricted(questionId: string, proof?: string): { ok: true; value: unknown } | { ok: false; message: string } {
    if (!approvalProofMatches(this.root, proof)) return { ok: false, message: 'Restricted values require the human approval proof.' }
    const reviewer = verifiedHumanContext(this.config().brand.slug, 'owner')
    if (!reviewer || !authorize(reviewer, { brand_id: this.config().brand.slug, classification: 'restricted', status: 'approved', publication: 'unpublished' }, 'read').allow) {
      return { ok: false, message: 'Restricted read refused.' }
    }
    const answer = this.context().answers.get(questionId)
    if (!answer?.private_ref) return { ok: false, message: 'No restricted value is stored for that question.' }
    const payload = new PrivateStore(this.root).get(answer.private_ref)
    if (!payload) return { ok: false, message: 'The private store has no entry for that id.' }
    return { ok: true, value: payload.value }
  }

  reviewText(_revealRestricted = false): string {
    const allow = false
    const answers = this.context().answers
    const lines = ['# Review', '', 'Drafts are not canonical until approved. Restricted values are withheld unless a local override is set.', '']
    const modules = [...new Set(this.questions().map((question) => question.module))]
    for (const moduleId of modules) {
      const owned = this.questions().filter((question) => question.module === moduleId)
      const relevant = owned.filter((question) => answers.has(question.id))
      if (relevant.length === 0) continue
      lines.push(`## ${moduleId}`, '')
      for (const question of relevant) {
        const answer = answers.get(question.id)
        if (!answer) continue
        const hidden = question.sensitivity === 'restricted' && !allow
        lines.push(`### ${question.label}`)
        lines.push(`- Status: ${answer.status}`)
        lines.push(`- Authority: ${answer.authority}`)
        lines.push(`- Source: ${answer.source_type ?? 'none'}`)
        lines.push(`- Uncertainty: ${answer.uncertainty ?? 'none'}`)
        lines.push(`- Value: ${hidden ? '[restricted withheld]' : answer.value === null ? 'none' : String(answer.value)}`)
        lines.push('')
      }
    }
    const contradictions = this.contradictions()
    lines.push('## Contradictions', '')
    if (contradictions.length === 0) lines.push('None open.')
    for (const item of contradictions) lines.push(`- (${item.severity}) ${item.message}`)
    return lines.join('\n')
  }

  exportPublic(): ReturnType<typeof projectPublic> {
    return projectPublic(this)
  }

  exportSnapshot(mode: 'full' | 'public' | 'internal' = 'public', ctx = guestContext(this.config().brand.slug)): Record<string, unknown> {
    const brandId = this.config().brand.slug
    if (mode === 'public') {
      authorize(ctx, { brand_id: brandId, classification: 'public', status: 'approved', publication: 'published' }, 'export')
      return this.exportPublic() as unknown as Record<string, unknown>
    }
    const decision = authorize(ctx, { brand_id: brandId, classification: 'internal', status: 'approved', publication: 'unpublished' }, 'export')
    if (!decision.allow) return { ...this.exportPublic(), export_denied: true }
    const answers = [...this.context().answers.values()].map((answer) => {
      if (answer.visibility === 'restricted') {
        return { ...answer, value: null, raw_answer: null, normalized: null, redacted: true }
      }
      return answer
    })
    return {
      exported_at: this.now(),
      mode,
      brand_id: this.config().brand.slug,
      answers,
    }
  }

  rebuildDrafts(): void {
    const questions = this.questions()
    const answers = this.context().answers
    const files = new Map<string, FieldQuestion[]>()
    for (const question of questions) {
      for (const output of question.related_outputs) {
        const list = files.get(output) ?? []
        list.push(question)
        files.set(output, list)
      }
    }
    for (const [relative, group] of files) {
      const file = this.resolveOutput(relative)
      const blocks = group.map((question) => ({
        id: question.id,
        inner: fieldBlock(question, answers.get(question.id) ?? null, file),
      }))
      writeAtomic(file, renderDraftFile(file, blocks))
    }
  }
}

const DISPOSITIONS: Array<{ words: string[]; status: Status; uncertainty: string }> = [
  { words: ['unknown', "i don't know", 'idk'], status: 'unknown', uncertainty: 'Owner does not know. No value was invented.' },
  { words: ['skip'], status: 'skipped', uncertainty: 'Owner skipped. Field stays unresolved.' },
  { words: ['not relevant', 'n/a', 'na'], status: 'not_applicable', uncertainty: 'Owner marked this question not applicable.' },
]

/** `unknown`, `skip` and `n/a` (and their fa/tr aliases) mark a disposition. They are never stored as values. */
export function dispositionFor(raw: string): { status: Status; uncertainty: string } | null {
  const lower = normalizeCommand(raw).trim().toLowerCase()
  const match = DISPOSITIONS.find((item) => item.words.includes(lower))
  return match ? { status: match.status, uncertainty: match.uncertainty } : null
}

function toStep(step: ApprovalStep): StepResult {
  return { kind: step.kind, message: step.message, questionId: step.questionId, status: step.status }
}

function formatImpact(impact: ImpactReport): string {
  return [
    `Proposed change to ${impact.questionId}`,
    `Previous status: ${impact.previous?.status ?? 'none'}`,
    `Documents: ${impact.impactedDocuments.join(', ') || 'none'}`,
    `Linked questions: ${impact.impactedQuestions.join(', ') || 'none'}`,
    impact.requiresConfirmation ? 'Confirmation required before the approved value changes.' : 'No approval is held on this field.',
  ].join('\n')
}

export function assertSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Slug "${slug}" must be lowercase letters, numbers, and single hyphens.`)
  }
}

export function applyInit(root: string, input: InitInput): BrandConfig {
  assertSlug(input.slug)
  const engine = new InterviewEngine(root)
  const config = engine.config()
  if (config.brand.initialized && !input.reset) {
    throw new Error('This brand is already initialized. Refusing to wipe interview state. Pass --reset to backup the ledger and reset it.')
  }
  if (input.reset) backupBrand(root)
  config.brand.name = input.name
  config.brand.name_status = 'working'
  config.brand.working_name = input.name
  config.brand.working_name_status = 'draft'
  config.brand.slug = input.slug
  config.brand.industry = input.industry
  config.brand.sector = input.sector ?? 'unknown'
  config.brand.website = input.website ?? null
  config.brand.default_locale = input.language
  config.brand.supported_locales = input.languages
  // A profile without a file in brand/interview/profiles/ is a label only and keeps the full question
  // bank; brand:validate warns about it so a typo does not go unnoticed.
  config.brand.profile = input.profile ?? 'universal'
  config.brand.publish_docs = input.publish
  config.brand.initialized = true
  config.brand.stage = 'unknown'
  config.brand.new_or_existing = 'unknown'
  config.brand.legal_name = 'TBD'
  config.brand.tagline = 'TBD'
  config.modules.mascot.enabled = input.mascot
  config.modules.gamification.enabled = input.gamification
  const personal = personalInit(input)
  config.modules.personal = { ...personal, note: config.modules.personal?.note ?? templateConfig().modules.personal?.note ?? '' }
  ensureStarterProfiles(root)
  writeYaml(path.join(root, 'brand', 'brand.config.yaml'), config)
  writeYaml(path.join(root, 'brand', 'interview', 'session-state.yaml'), emptySession(input.language))
  writeYaml(path.join(root, 'brand', 'interview', 'answer-ledger.yaml'), { schema_version: 1, records: [] })
  writeYaml(path.join(root, 'brand', 'interview', 'contradictions.yaml'), { schema_version: 1, derived: true, items: [] })
  writeYaml(path.join(root, 'brand', 'interview', 'evidence-index.yaml'), { schema_version: 1, items: [] })
  // A new brand never inherits another brand's evidence or permissions.
  fs.rmSync(path.join(root, 'brand', 'interview', 'evidence-register.yaml'), { force: true })
  writeYaml(path.join(root, 'brand', 'interview', 'intake-log.yaml'), { schema_version: 1, batches: [] })
  writeYaml(path.join(root, 'brand', 'instance', 'draft-facts.yaml'), { schema_version: 1, facts: {} })
  writeYaml(path.join(root, 'brand', 'instance', 'approved-facts.yaml'), { schema_version: 1, facts: {} })
  // Never inherit publication grants when initializing a new brand instance.
  writeYaml(path.join(root, 'brand', 'publication-policy.yaml'), {
    schema_version: 1, brand_id: input.slug, status: 'draft', audiences: { public: false },
    approved_fact_ids: [], approved_page_ids: [], approved_asset_ids: [], approved_token_ids: [],
  })
  syncManifest(root, config)
  new InterviewEngine(root).rebuildDrafts()
  return config
}

export function syncManifest(root: string, config: BrandConfig): void {
  const file = path.join(root, 'brand', 'brand-manifest.json')
  const current = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>) : {}
  current.name = config.brand.name
  current.slug = config.brand.slug
  current.publish_docs = config.brand.publish_docs
  current.status = config.brand.status
  writeAtomic(file, `${JSON.stringify(current, null, 2)}\n`)
}

export function upgradeCore(root: string): { version: string; preserved: true } {
  const migrated = migrateBrand(root)
  return { version: migrated.to, preserved: true }
}

export function emptySession(locale: string): SessionState {
  const safe = locale === 'fa' || locale === 'tr' ? locale : 'en'
  return {
    session_id: null,
    status: 'idle',
    locale: safe,
    history: [],
    deferred: [],
    pending_suggestions: [],
    cursor_question_id: null,
    pending_proposals: [],
    started_at: null,
    updated_at: null,
    last_answer_id: null,
  }
}
