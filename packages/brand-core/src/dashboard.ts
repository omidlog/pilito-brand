import type { Audience } from './auth.js'
import { moduleEnabled } from './conditions.js'
import { allModules } from './content/index.js'
import type { InterviewEngine } from './engine.js'
import { openConflicts } from './proposal-intake.js'
import type { ReviewItem } from './approval.js'

/**
 * Internal review dashboard: coverage, the review queue and open contradictions.
 *
 * It is built only for the internal audience. A public build gets a stub with `available: false`
 * and no brand data at all, so a public site cannot show drafts, pending changes or contradiction
 * text even if the page is compiled. Restricted values are withheld here as everywhere else.
 */
export interface DashboardModule {
  id: string
  title: string
  group: string
  required: number
  required_unanswered: number
  required_draft: number
  required_approved: number
  coverage: number
  approval: number
  pending_review: number
}

export interface DashboardReviewItem {
  question_id: string
  module: string
  label: string
  state: ReviewItem['state']
  action: ReviewItem['action']
  classification: ReviewItem['classification']
  required_grant: ReviewItem['required_grant']
  withheld: boolean
  draft_value: unknown
  proposal_state: string | null
  approved_value: unknown
  approved_version: number | null
  changes: ReviewItem['changes']
  reason: string
}

export interface DashboardContradiction {
  id: string
  kind: 'rule' | 'intake_conflict'
  severity: 'high' | 'medium' | 'low'
  message: string
  fields: string[]
}

export interface InternalDashboard {
  schema_version: 1
  audience: 'internal'
  available: true
  brand_id: string
  coverage: { coverage: number; approval: number; required: number; required_unanswered: number }
  modules: DashboardModule[]
  review_queue: { pending: number; items: DashboardReviewItem[] }
  contradictions: DashboardContradiction[]
  next: Array<{ id: string; priority: string; prompt: string }>
}

export interface PublicDashboardStub {
  schema_version: 1
  audience: 'public'
  available: false
  note: string
}

export type Dashboard = InternalDashboard | PublicDashboardStub

export const PUBLIC_DASHBOARD_NOTE = 'The review dashboard exists only in the internal build. Run npm run docs:start in the repository.'

export function buildDashboard(engine: InterviewEngine, audience: Audience): Dashboard {
  if (audience !== 'internal') return { schema_version: 1, audience: 'public', available: false, note: PUBLIC_DASHBOARD_NOTE }
  const report = engine.statusReport()
  const queue = engine.approvals().reviewQueue({})
  const pendingByModule = new Map<string, number>()
  for (const item of queue.items) pendingByModule.set(item.module, (pendingByModule.get(item.module) ?? 0) + 1)
  const config = engine.config()
  const modules: DashboardModule[] = allModules()
    .filter((module) => moduleEnabled(module, config))
    .map((module) => {
      const score = report.modules.find((item) => item.module === module.id)
      return {
        id: module.id,
        title: module.title,
        group: module.group,
        required: score?.required ?? 0,
        required_unanswered: score?.requiredUnanswered ?? 0,
        required_draft: score?.requiredDraft ?? 0,
        required_approved: score?.requiredApproved ?? 0,
        coverage: score?.coverage ?? 0,
        approval: score?.approval ?? 0,
        pending_review: pendingByModule.get(module.id) ?? 0,
      }
    })
  const items: DashboardReviewItem[] = queue.items.map((item) => ({
    question_id: item.question_id,
    module: item.module,
    label: item.label,
    state: item.state,
    action: item.action,
    classification: item.classification,
    required_grant: item.required_grant,
    withheld: item.withheld,
    draft_value: item.withheld ? null : item.draft?.value ?? null,
    proposal_state: item.draft?.proposal_state ?? null,
    approved_value: item.withheld ? null : item.approved?.value ?? null,
    approved_version: item.approved?.version ?? null,
    changes: item.changes,
    reason: item.reason,
  }))
  const contradictions: DashboardContradiction[] = engine
    .contradictions()
    .filter((item) => item.status === 'open')
    .map((item) => ({ id: item.id, kind: 'rule', severity: item.severity, message: item.message, fields: item.fields }))
  for (const conflict of openConflicts(engine)) {
    const restricted = engine.question(conflict.question_id)?.sensitivity === 'restricted'
    contradictions.push({
      id: `conflict:${conflict.question_id}`,
      kind: 'intake_conflict',
      severity: 'medium',
      message: restricted
        ? 'A new answer conflicts with the recorded restricted answer. Values are withheld.'
        : `Recorded "${String(conflict.existing.value)}" conflicts with proposed "${String(conflict.proposed.value)}". ${conflict.ask}`,
      fields: [conflict.question_id],
    })
  }
  return {
    schema_version: 1,
    audience: 'internal',
    available: true,
    brand_id: config.brand.slug,
    coverage: { coverage: report.coverage, approval: report.approval, required: report.required, required_unanswered: report.requiredUnanswered },
    modules,
    review_queue: { pending: queue.pending, items },
    contradictions,
    next: report.next.map((item) => ({ id: item.id, priority: item.priority, prompt: item.prompt })),
  }
}
