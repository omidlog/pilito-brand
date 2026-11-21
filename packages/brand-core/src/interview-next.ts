import { latestAnswers } from './completeness.js'
import type { InterviewEngine } from './engine.js'
import type { Locale } from './i18n.js'
import { openConflicts, openFollowUps, type IntakeConflict } from './proposal-intake.js'
import { loadProfile, UNIVERSAL_PROFILE } from './profiles.js'
import type { FieldQuestion, ProposalState } from './types.js'

export interface NextQuestion {
  id: string
  module: string
  label: string
  priority: FieldQuestion['priority']
  question_type: FieldQuestion['question_type']
  prompt: string
  prompt_locale: Locale
  why_it_matters: string
  options: string[] | null
  examples: string[]
  /** Why this question is suggested now. */
  reasons: string[]
  deferred: boolean
}

export interface NextReport {
  brand_id: string
  profile: { id: string; title: string; total: number; open: number; answered: number }
  locale: Locale
  /** Ask these first: two answers disagree and only the owner can say which is right. */
  conflicts: IntakeConflict[]
  /** Clarifying questions suggested by earlier proposals. Untrusted model or agent text. */
  follow_ups: Array<{ question_id: string | null; text: string; batch_id: string; untrusted: true }>
  next: NextQuestion[]
  tentative: Array<{ question_id: string; value: unknown; quotation: string | null }>
  unresolved: Array<{ question_id: string; reason: string | null }>
  /** Open restricted questions. The owner answers them in the interactive interview; an agent never asks for them. */
  owner_only: Array<{ question_id: string; label: string }>
  /** Derived rule contradictions from contradictions.yaml. */
  contradictions: Array<{ id: string; severity: string; message: string; fields: string[] }>
  drafts_awaiting_review: number
  suggested_actions: string[]
}

function reasonsFor(engine: InterviewEngine, question: FieldQuestion, sector: string | null, recent: Set<string>): string[] {
  const reasons: string[] = []
  if (question.priority === 'critical') reasons.push('critical: other answers and documents depend on it')
  else reasons.push(`${question.priority} priority`)
  if (question.required) reasons.push('required for document completeness')
  if (sector && question.sector_hints.includes(sector)) reasons.push(`relevant to the ${sector} sector`)
  const unlocks = engine.questions().filter((other) => other.depends_on.includes(question.id)).length
  if (unlocks > 0) reasons.push(`unlocks ${unlocks} follow-up question${unlocks === 1 ? '' : 's'}`)
  const linked = [...question.depends_on, ...question.related_ids].filter((id) => recent.has(id))
  if (linked.length > 0) reasons.push(`follows from your recent answer to ${linked.join(', ')}`)
  if (question.related_outputs.length > 0) reasons.push(`feeds ${question.related_outputs.length} document${question.related_outputs.length === 1 ? '' : 's'}`)
  return reasons
}

/**
 * What an interviewing agent should do next. Restricted questions are listed as owner-only and never
 * returned as askable questions, so their values do not pass through an agent or model.
 */
export function nextReport(engine: InterviewEngine, opts: { limit?: number; profile?: string; locale?: Locale } = {}): NextReport {
  const limit = Math.max(1, Math.min(opts.limit ?? 5, 50))
  const config = engine.config()
  const session = engine.session()
  const locale = opts.locale ?? session.locale
  const profileId = opts.profile ?? config.brand.profile ?? UNIVERSAL_PROFILE
  const profile = loadProfile(engine.workspaceRoot(), profileId)
  const scope = profile ? new Set(profile.question_ids) : null
  const answers = latestAnswers(engine.ledger().records)
  const sectorValue = answers.get('business.identity.sector')?.value
  const sector = sectorValue === null || sectorValue === undefined ? null : String(sectorValue)
  const recent = new Set(session.history.slice(-5))
  const deferred = new Set(session.deferred)

  const open = engine.queue(500, { profile: profile ? profile.id : UNIVERSAL_PROFILE })
  const askable = open.filter((question) => question.sensitivity !== 'restricted')
  // Questions linked to what the owner just said come first within the same priority band.
  const rank = (question: FieldQuestion) => ([...question.depends_on, ...question.related_ids].some((id) => recent.has(id)) ? 0 : 1)
  const ordered = askable
    .map((question, position) => ({ question, position }))
    .sort((a, b) => {
      const band = { critical: 0, high: 1, medium: 2, low: 3 }
      const byPriority = band[a.question.priority] - band[b.question.priority]
      if (byPriority !== 0) return byPriority
      if (deferred.has(a.question.id) !== deferred.has(b.question.id)) return deferred.has(a.question.id) ? 1 : -1
      return rank(a.question) - rank(b.question) || a.position - b.position
    })
    .map((entry) => entry.question)

  const next = ordered.slice(0, limit).map((question) => {
    const prompt = engine.promptText(question, locale)
    return {
      id: question.id,
      module: question.module,
      label: question.label,
      priority: question.priority,
      question_type: question.question_type,
      prompt: prompt.text,
      prompt_locale: prompt.fellBack ? ('en' as Locale) : locale,
      why_it_matters: question.why_it_matters,
      options: question.options ?? null,
      examples: question.examples,
      reasons: reasonsFor(engine, question, sector, recent),
      deferred: deferred.has(question.id),
    }
  })

  const inScope = (id: string) => !scope || scope.has(id)
  const tentative: NextReport['tentative'] = []
  const unresolved: NextReport['unresolved'] = []
  let drafts = 0
  for (const [id, answer] of answers) {
    const question = engine.question(id)
    if (!question || question.sensitivity === 'restricted') continue
    if (answer.status === 'draft') drafts += 1
    if (!inScope(id)) continue
    const state = answer.proposal_state as ProposalState | null | undefined
    if (state === 'tentative' && answer.status === 'draft') tentative.push({ question_id: id, value: answer.value, quotation: answer.raw_answer })
    if (answer.status === 'unknown') unresolved.push({ question_id: id, reason: answer.uncertainty })
  }

  const ownerOnly = open
    .filter((question) => question.sensitivity === 'restricted')
    .map((question) => ({ question_id: question.id, label: question.label }))
  const conflicts = openConflicts(engine)
  const followUps = openFollowUps(engine)
  const contradictions = engine.contradictions().map((item) => ({ id: item.id, severity: item.severity, message: item.message, fields: item.fields }))
  const total = profile ? profile.question_ids.length : engine.questions().length
  const answered = (profile ? profile.question_ids : engine.questions().map((question) => question.id)).filter((id) => {
    const answer = answers.get(id)
    return Boolean(answer && answer.status !== 'unanswered')
  }).length

  const actions: string[] = []
  if (conflicts.length > 0) actions.push(`Ask the owner to settle ${conflicts.length} conflicting answer(s), then submit a proposal with "correction": true or answer with brand:interview --question.`)
  if (contradictions.length > 0) actions.push(`Review ${contradictions.length} rule contradiction(s) listed under contradictions.`)
  if (followUps.length > 0) actions.push(`Ask ${followUps.length} follow-up question(s) about tentative or unresolved answers.`)
  if (next.length > 0) actions.push(`Ask the next question: ${next[0]?.id}.`)
  if (ownerOnly.length > 0) actions.push(`Tell the owner that ${ownerOnly.length} restricted question(s) need them in the interactive interview (npm run brand:interview). Do not ask for those values in chat.`)
  if (drafts > 0) actions.push(`${drafts} draft(s) wait for human review: npm run brand:review. Only a human with the approval proof can approve.`)
  if (next.length === 0 && conflicts.length === 0 && followUps.length === 0) {
    actions.push(profile ? `The ${profile.id} profile has no open questions. Set brand.profile to universal for the full bank.` : 'No open questions.')
  }

  return {
    brand_id: config.brand.slug,
    profile: { id: profile ? profile.id : UNIVERSAL_PROFILE, title: profile ? profile.title : 'Universal', total, open: open.length, answered },
    locale,
    conflicts,
    follow_ups: followUps,
    next,
    tentative,
    unresolved,
    owner_only: ownerOnly,
    contradictions,
    drafts_awaiting_review: drafts,
    suggested_actions: actions,
  }
}
