import { disabledModule, evaluateCondition, shouldSkip, type ConditionContext } from './conditions.js'
import type { AnswerRecord, FieldQuestion } from './types.js'

export interface ModuleScore {
  module: string
  required: number
  requiredUnanswered: number
  requiredApproved: number
  requiredDraft: number
  requiredUnresolved: number
  optionalOpen: number
  notApplicable: number
  coverage: number
  approval: number
}

export interface CompletenessReport {
  required: number
  requiredUnanswered: number
  requiredApproved: number
  coverage: number
  approval: number
  modules: ModuleScore[]
}

function ratio(part: number, whole: number): number {
  if (whole === 0) return 1
  return part / whole
}

/**
 * Coverage and approval over required questions. `scope`, when given, is an exclusive interview
 * profile: questions outside it count as not applicable rather than missing.
 */
export function completeness(questions: FieldQuestion[], ctx: ConditionContext, scope: Set<string> | null = null): CompletenessReport {
  const byModule = new Map<string, ModuleScore>()
  const ensure = (module: string): ModuleScore => {
    const existing = byModule.get(module)
    if (existing) return existing
    const created: ModuleScore = {
      module,
      required: 0,
      requiredUnanswered: 0,
      requiredApproved: 0,
      requiredDraft: 0,
      requiredUnresolved: 0,
      optionalOpen: 0,
      notApplicable: 0,
      coverage: 0,
      approval: 0,
    }
    byModule.set(module, created)
    return created
  }

  for (const question of questions) {
    const score = ensure(question.module)
    if ((scope && !scope.has(question.id)) || disabledModule(question.id, ctx) || shouldSkip(question.skip_when, ctx)) {
      score.notApplicable += 1
      continue
    }
    const mandatory = question.required && evaluateCondition(question.required_when, ctx)
    const answer = ctx.answers.get(question.id)
    const open = !answer || answer.status === 'unanswered'
    if (!mandatory) {
      if (open) score.optionalOpen += 1
      continue
    }
    score.required += 1
    if (open) score.requiredUnanswered += 1
    else if (answer.status === 'approved') score.requiredApproved += 1
    else if (answer.status === 'draft' || answer.status === 'in_review') score.requiredDraft += 1
    else if (answer.status === 'unknown' || answer.status === 'skipped' || answer.status === 'not_applicable') {
      score.requiredUnresolved += 1
    }
  }

  const modules = [...byModule.values()].map((score) => ({
    ...score,
    coverage: ratio(score.required - score.requiredUnanswered, score.required),
    approval: ratio(score.requiredApproved, score.required),
  }))
  const required = modules.reduce((sum, score) => sum + score.required, 0)
  const requiredUnanswered = modules.reduce((sum, score) => sum + score.requiredUnanswered, 0)
  const requiredApproved = modules.reduce((sum, score) => sum + score.requiredApproved, 0)
  return {
    required,
    requiredUnanswered,
    requiredApproved,
    coverage: ratio(required - requiredUnanswered, required),
    approval: ratio(requiredApproved, required),
    modules,
  }
}

export function latestAnswers(records: AnswerRecord[]): Map<string, AnswerRecord> {
  const map = new Map<string, AnswerRecord>()
  for (const record of records) {
    if (record.superseded_by) continue
    map.set(record.question_id, record)
  }
  return map
}
