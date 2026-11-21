import { operatorContext } from './auth.js'
import type { InterviewEngine } from './engine.js'

function valueOf(engine: InterviewEngine, id: string): string {
  const fact = engine.exportSnapshot('internal', operatorContext(engine.config().brand.slug)).answers as Array<{ question_id: string; value: unknown; status: string; visibility: string }>
  const found = fact.find((item) => item.question_id === id)
  if (!found || found.value === null || found.value === undefined || found.visibility === 'restricted') {
    return 'Unknown — not invented.'
  }
  return `${String(found.value)} _(status: ${found.status})_`
}

/** Period-aligned revenue and direct COGS only. Runway needs separately supplied net burn. */
export function financeScenario(input: { revenue: number | null; cost: number | null; cash: number | null; net_burn?: number | null }): {
  status: 'computed' | 'blocked_missing_inputs'
  gross_profit: number | null
  gross_margin_pct: number | null
  runway_months: number | null
} {
  if (input.revenue === null || input.cost === null || !Number.isFinite(input.revenue) || !Number.isFinite(input.cost) || input.revenue < 0 || input.cost < 0) {
    return { status: 'blocked_missing_inputs', gross_profit: null, gross_margin_pct: null, runway_months: null }
  }
  const round = (value: number) => Math.round(value * 100) / 100
  const grossProfit = round(input.revenue - input.cost)
  const margin = input.revenue > 0 ? round((grossProfit / input.revenue) * 100) : null
  const burn = input.net_burn
  const runway = input.cash !== null && input.cash >= 0 && burn !== undefined && burn !== null && Number.isFinite(burn) && burn > 0
    ? round(input.cash / burn)
    : null
  return { status: 'computed', gross_profit: grossProfit, gross_margin_pct: margin, runway_months: runway }
}

export function allocateBudget(
  total: number | null,
  weights: Record<string, number>,
): { status: 'computed' | 'missing'; lines: Array<{ name: string; amount: number | null }>; sum: number | null } {
  const names = Object.keys(weights)
  if (total === null || !Number.isFinite(total)) {
    return { status: 'missing', lines: names.map((name) => ({ name, amount: null })), sum: null }
  }
  const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  if (weightSum <= 0) return { status: 'missing', lines: names.map((name) => ({ name, amount: null })), sum: null }
  const lines = Object.entries(weights).map(([name, weight]) => ({ name, amount: Math.round((total * weight * 100) / weightSum) / 100 }))
  const raw = lines.reduce((sum, line) => sum + (line.amount ?? 0), 0)
  const last = lines[lines.length - 1]
  if (last && last.amount !== null) last.amount = Math.round((last.amount + (total - raw)) * 100) / 100
  return { status: 'computed', lines, sum: total }
}

export function renderBusinessArtifacts(engine: InterviewEngine): Record<string, string> {
  const stamp = new Date().toISOString().slice(0, 10)
  const header = (title: string) => `# ${title}\n\nGenerated ${stamp} from the interview ledger. Unknowns stay unknown. Nothing here is approved unless the cited field status says approved.\n`
  return {
    'business-plan.md': `${header('Business plan')}\n## Identity\n\n- Trade name: ${valueOf(engine, 'business.identity.trade_name')}\n- Sector: ${valueOf(engine, 'business.identity.sector')}\n- Stage: ${valueOf(engine, 'business.stage.current')}\n\n## Customer and offer\n\n- Primary customer: ${valueOf(engine, 'business.customer.primary_segment')}\n- Offer: ${valueOf(engine, 'business.offer.summary')}\n- Value proposition: ${valueOf(engine, 'business.offer.value_proposition')}\n\n## Assumptions\n\nMarket size, revenue, and headcount are unknown unless the owner supplied them. This document is not a financial model.\n`,
    'marketing-strategy.md': `${header('Marketing strategy')}\n- Objective: ${valueOf(engine, 'business.marketing.objective')}\n- Channels: ${valueOf(engine, 'business.marketing.channels')}\n- Availability claim: ${valueOf(engine, 'business.marketing.availability_claim')}\n\nStrategy is separate from a dated execution plan. No performance numbers are copied here.\n`,
    'marketing-plan.md': `${header('Marketing plan')}\nPlan date: ${stamp}. This is a plan, not measured performance.\n\n- Objective: ${valueOf(engine, 'business.marketing.objective')}\n- Budget: withheld if restricted, otherwise ${valueOf(engine, 'business.marketing.budget')}\n`,
    'prd.md': `${header('Product brief')}\n- Portfolio: ${valueOf(engine, 'business.product.portfolio')}\n- Jobs: ${valueOf(engine, 'business.product.jobs')}\n- MVP boundary: ${valueOf(engine, 'business.product.mvp')}\n- Public status: ${valueOf(engine, 'business.product.public_status')}\n- Non-goals stay inside the MVP answer.\n`,
    'roadmap.md': `${header('Roadmap')}\n${valueOf(engine, 'business.product.roadmap')}\n\nDates are included only when the owner committed to them.\n`,
    'sales-playbook.md': `${header('Sales playbook')}\n- Motion: ${valueOf(engine, 'business.sales.motion')}\n- Pricing record: ${valueOf(engine, 'business.sales.pricing')}\n- Buyer: ${valueOf(engine, 'business.sales.buyer')}\n\nDo not quote a price that this record does not contain.\n`,
    'support-sop.md': `${header('Customer support SOP')}\n- Channels: ${valueOf(engine, 'business.cx.channels')}\n- Response commitment: ${valueOf(engine, 'business.cx.sla')}\n- Voice follows the verbal identity record, which is not copied here unless answered.\n`,
    'financial-assumptions.md': `${header('Financial assumptions')}\n- Reporting currency: ${valueOf(engine, 'business.finance.currency')}\n- Accounting basis: ${valueOf(engine, 'business.finance.basis')}\n- Revenue figure: withheld. Restricted actuals are not written into this artifact.\n- This is not an audit and contains no invented runway.\n`,
    'okr-report.md': `${header('Goals')}\n- Annual objective: ${valueOf(engine, 'business.goals.annual')}\n- North star: ${valueOf(engine, 'business.goals.north_star')}\n- Sources: ${valueOf(engine, 'business.goals.sources')}\n\nTargets, forecasts, and actuals are different. No live dashboard is embedded.\n`,
  }
}
