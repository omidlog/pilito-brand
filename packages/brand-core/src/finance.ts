/**
 * Pure finance calculations for the Business OS.
 *
 * Rules:
 * - Never invent a number. Every metric either computes from supplied inputs or returns `missing`
 *   with the names of the inputs it needs.
 * - Every computed result carries its unit, period, basis (actual | forecast | hypothetical) and formula.
 * - The basis of a result is the weakest basis among the inputs it used.
 * - Inputs are validated: finite numbers, non-negative counts and amounts, rates within range,
 *   and flow inputs combined in one formula must share a period. Periods are never converted silently.
 * - This module does no I/O. The CLI (`brand:finance`) reads input files from outside tracked directories.
 */

export const FINANCE_BASES = ['actual', 'forecast', 'hypothetical'] as const
export type FinanceBasis = (typeof FINANCE_BASES)[number]

export const FINANCE_PERIODS = ['month', 'quarter', 'year'] as const
export type FinancePeriod = (typeof FINANCE_PERIODS)[number]

const MONTHS_PER: Record<FinancePeriod, number> = { month: 1, quarter: 3, year: 12 }
const BASIS_RANK: Record<FinanceBasis, number> = { actual: 0, forecast: 1, hypothetical: 2 }

type InputKind = 'amount' | 'count' | 'ratio' | 'percent'
type InputTiming = 'flow' | 'stock'

interface InputSpec {
  kind: InputKind
  timing: InputTiming
  description: string
}

/** Every accepted input. Unknown keys are rejected so a typo cannot silently become `missing`. */
export const FINANCE_INPUTS = {
  revenue: { kind: 'amount', timing: 'flow', description: 'Recognized revenue in the period' },
  cogs: { kind: 'amount', timing: 'flow', description: 'Cost of goods sold / cost of revenue in the period' },
  sales_marketing_spend: { kind: 'amount', timing: 'flow', description: 'Fully loaded sales and marketing spend in the period' },
  new_customers: { kind: 'count', timing: 'flow', description: 'Customers acquired in the period' },
  customers_start: { kind: 'count', timing: 'stock', description: 'Paying customers at the start of the period' },
  churned_customers: { kind: 'count', timing: 'flow', description: 'Paying customers lost during the period' },
  active_customers: { kind: 'count', timing: 'stock', description: 'Paying customers at the measurement point' },
  arpa: { kind: 'amount', timing: 'flow', description: 'Average revenue per account per period' },
  gross_margin_pct: { kind: 'percent', timing: 'flow', description: 'Gross margin in percent, if not derived from revenue and cogs' },
  mrr: { kind: 'amount', timing: 'stock', description: 'Monthly recurring revenue at the measurement point' },
  cash_balance: { kind: 'amount', timing: 'stock', description: 'Cash on hand at the measurement point' },
  cash_in: { kind: 'amount', timing: 'flow', description: 'Cash received in the period' },
  cash_out: { kind: 'amount', timing: 'flow', description: 'Cash paid out in the period' },
  fixed_costs: { kind: 'amount', timing: 'flow', description: 'Fixed costs in the period' },
  price_per_unit: { kind: 'amount', timing: 'stock', description: 'Price of one unit sold' },
  variable_cost_per_unit: { kind: 'amount', timing: 'stock', description: 'Variable cost of one unit sold' },
} as const satisfies Record<string, InputSpec>

export type FinanceInputName = keyof typeof FINANCE_INPUTS

export interface FinanceMeasure {
  value: number
  basis: FinanceBasis
  /** Flow inputs are per period. Stock inputs have no period. */
  period: FinancePeriod | null
}

export interface FinanceScenario {
  name: string
  basis: FinanceBasis
  months?: number
  starting_mrr?: number
  monthly_growth_rate?: number
  monthly_churn_rate?: number
  gross_margin_pct?: number
  monthly_fixed_costs?: number
  starting_cash?: number
}

export interface FinanceInputs {
  currency: string
  inputs: Partial<Record<FinanceInputName, FinanceMeasure>>
  scenarios: FinanceScenario[]
}

export interface FinanceMetricBase {
  metric: string
  label: string
  unit: string
  formula: string
}

export interface FinanceOk extends FinanceMetricBase {
  status: 'ok'
  value: number
  period: FinancePeriod | null
  basis: FinanceBasis
  inputs: Record<string, number>
  notes: string[]
}

export interface FinanceMissing extends FinanceMetricBase {
  status: 'missing'
  value: null
  missing: string[]
}

export interface FinanceInvalid extends FinanceMetricBase {
  status: 'invalid'
  value: null
  errors: string[]
}

/** The inputs exist and are valid, but the formula has no finite answer (zero churn, zero revenue, no burn). */
export interface FinanceUndefined extends FinanceMetricBase {
  status: 'undefined'
  value: null
  basis: FinanceBasis
  reason: string
}

export type FinanceResult = FinanceOk | FinanceMissing | FinanceInvalid | FinanceUndefined

export interface ScenarioMonth {
  month: number
  mrr: number
  gross_profit: number
  net_cash_flow: number
  cash: number
}

export interface ScenarioProjectionOk extends FinanceMetricBase {
  status: 'ok'
  name: string
  basis: FinanceBasis
  period: 'month'
  value: null
  series: ScenarioMonth[]
  /** First month whose closing cash is below zero, or null when cash stays non-negative. */
  cash_out_month: number | null
  assumptions: Record<string, number>
  notes: string[]
}

export type ScenarioResult = ScenarioProjectionOk | (FinanceMissing & { name: string }) | (FinanceInvalid & { name: string })

export interface FinanceReport {
  currency: string
  metrics: FinanceResult[]
  scenarios: ScenarioResult[]
  errors: string[]
}

export class FinanceInputError extends Error {
  constructor(public readonly errors: string[]) {
    super(`Invalid finance input: ${errors.join('; ')}`)
    this.name = 'FinanceInputError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBasis(value: unknown): value is FinanceBasis {
  return typeof value === 'string' && (FINANCE_BASES as readonly string[]).includes(value)
}

function isPeriod(value: unknown): value is FinancePeriod {
  return typeof value === 'string' && (FINANCE_PERIODS as readonly string[]).includes(value)
}

function checkValue(name: string, kind: InputKind | 'rate' | 'months', value: number, errors: string[]): void {
  if (!Number.isFinite(value)) {
    errors.push(`${name} must be a finite number`)
    return
  }
  if (kind === 'count') {
    if (value < 0 || !Number.isInteger(value)) errors.push(`${name} must be a non-negative whole number`)
  } else if (kind === 'amount') {
    if (value < 0) errors.push(`${name} must not be negative`)
  } else if (kind === 'ratio' || kind === 'rate') {
    if (value < 0 || value > 1) errors.push(`${name} must be between 0 and 1`)
  } else if (kind === 'percent') {
    if (value > 100) errors.push(`${name} must not exceed 100`)
  } else if (kind === 'months') {
    if (value < 1 || value > 120 || !Number.isInteger(value)) errors.push(`${name} must be a whole number between 1 and 120`)
  }
}

/**
 * Validates and normalizes raw parsed YAML/JSON. Throws `FinanceInputError` listing every problem.
 *
 * Shape:
 *   currency: USD            # ISO 4217 code, required
 *   period: month            # default period for flow inputs
 *   basis: actual            # default basis for inputs
 *   inputs:
 *     revenue: 12000                            # uses the defaults
 *     new_customers: { value: 40, basis: forecast }
 *     cogs: { value: 9000, period: quarter }
 *   scenarios:
 *     - { name: base, basis: forecast, months: 12, starting_mrr: 10000, ... }
 */
export function parseFinanceInputs(raw: unknown): FinanceInputs {
  const errors: string[] = []
  if (!isRecord(raw)) throw new FinanceInputError(['input must be a mapping'])
  const allowedTop = new Set(['schema_version', 'currency', 'period', 'basis', 'inputs', 'scenarios'])
  for (const key of Object.keys(raw)) if (!allowedTop.has(key)) errors.push(`unknown top-level key ${key}`)
  const currency = raw.currency
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) errors.push('currency must be a three-letter ISO 4217 code such as USD')
  const defaultPeriod = raw.period ?? 'month'
  if (!isPeriod(defaultPeriod)) errors.push(`period must be one of ${FINANCE_PERIODS.join(', ')}`)
  const defaultBasis = raw.basis
  if (!isBasis(defaultBasis)) errors.push(`basis is required and must be one of ${FINANCE_BASES.join(', ')}`)
  const inputs: FinanceInputs['inputs'] = {}
  const rawInputs = raw.inputs ?? {}
  if (!isRecord(rawInputs)) errors.push('inputs must be a mapping')
  else {
    for (const [name, entry] of Object.entries(rawInputs)) {
      const spec = (FINANCE_INPUTS as Record<string, InputSpec>)[name]
      if (!spec) {
        errors.push(`unknown input ${name}`)
        continue
      }
      // An explicit null means "known to be unknown" and stays missing. It is never coerced to zero.
      if (entry === null || entry === undefined) continue
      const shaped = isRecord(entry) ? entry : { value: entry }
      for (const key of Object.keys(shaped)) if (!['value', 'basis', 'period'].includes(key)) errors.push(`${name}: unknown field ${key}`)
      if (shaped.value === null || shaped.value === undefined) continue
      if (typeof shaped.value !== 'number') {
        errors.push(`${name} must be a number`)
        continue
      }
      checkValue(name, spec.kind, shaped.value, errors)
      const basis = shaped.basis ?? defaultBasis
      if (!isBasis(basis)) {
        // A missing default basis is already reported once at the top level.
        if (shaped.basis !== undefined) errors.push(`${name}: basis must be one of ${FINANCE_BASES.join(', ')}`)
        continue
      }
      let period: FinancePeriod | null = null
      if (spec.timing === 'flow') {
        const candidate = shaped.period ?? defaultPeriod
        if (!isPeriod(candidate)) {
          errors.push(`${name}: period must be one of ${FINANCE_PERIODS.join(', ')}`)
          continue
        }
        period = candidate
      } else if (shaped.period !== undefined) {
        errors.push(`${name} is a point-in-time value and takes no period`)
        continue
      }
      inputs[name as FinanceInputName] = { value: shaped.value, basis, period }
    }
  }
  const scenarios: FinanceScenario[] = []
  const rawScenarios = raw.scenarios ?? []
  if (!Array.isArray(rawScenarios)) errors.push('scenarios must be a list')
  else {
    const names = new Set<string>()
    rawScenarios.forEach((entry, index) => {
      if (!isRecord(entry)) {
        errors.push(`scenarios[${index}] must be a mapping`)
        return
      }
      const name = entry.name
      if (typeof name !== 'string' || !name.trim()) {
        errors.push(`scenarios[${index}].name is required`)
        return
      }
      if (names.has(name)) errors.push(`scenario ${name} is duplicated`)
      names.add(name)
      const basis = entry.basis ?? 'hypothetical'
      if (!isBasis(basis)) errors.push(`scenario ${name}: basis must be one of ${FINANCE_BASES.join(', ')}`)
      else if (basis === 'actual') errors.push(`scenario ${name}: a projection cannot have basis actual; use forecast or hypothetical`)
      const scenario: FinanceScenario = { name, basis: isBasis(basis) ? basis : 'hypothetical' }
      const numeric: Record<string, 'months' | 'amount' | 'rate' | 'percent'> = {
        months: 'months',
        starting_mrr: 'amount',
        monthly_growth_rate: 'rate',
        monthly_churn_rate: 'rate',
        gross_margin_pct: 'percent',
        monthly_fixed_costs: 'amount',
        starting_cash: 'amount',
      }
      for (const key of Object.keys(entry)) if (key !== 'name' && key !== 'basis' && !(key in numeric)) errors.push(`scenario ${name}: unknown field ${key}`)
      for (const [key, kind] of Object.entries(numeric)) {
        const value = entry[key]
        if (value === undefined || value === null) continue
        if (typeof value !== 'number') {
          errors.push(`scenario ${name}: ${key} must be a number`)
          continue
        }
        checkValue(`scenario ${name}: ${key}`, kind, value, errors)
        ;(scenario as unknown as Record<string, number>)[key] = value
      }
      scenarios.push(scenario)
    })
  }
  if (errors.length > 0) throw new FinanceInputError(errors)
  return { currency: currency as string, inputs, scenarios }
}

function weakest(bases: FinanceBasis[]): FinanceBasis {
  return bases.reduce<FinanceBasis>((worst, basis) => (BASIS_RANK[basis] > BASIS_RANK[worst] ? basis : worst), 'actual')
}

interface Def {
  metric: string
  label: string
  unit: string
  formula: string
}

type Got = { ok: true; values: Record<string, FinanceMeasure> } | { ok: false; result: FinanceMissing | FinanceInvalid }

/** Collects inputs, reporting every missing one at once and refusing flows on different periods. */
function need(data: FinanceInputs, def: Def, names: FinanceInputName[]): Got {
  const missing = names.filter((name) => data.inputs[name] === undefined)
  if (missing.length > 0) return { ok: false, result: { ...def, status: 'missing', value: null, missing } }
  const values = Object.fromEntries(names.map((name) => [name, data.inputs[name] as FinanceMeasure]))
  const flows = names.filter((name) => values[name]?.period !== null)
  const periods = new Set(flows.map((name) => values[name]?.period))
  if (periods.size > 1) {
    const detail = flows.map((name) => `${name} per ${values[name]?.period}`).join(', ')
    return { ok: false, result: { ...def, status: 'invalid', value: null, errors: [`inconsistent periods (${detail}); restate the inputs on one period`] } }
  }
  return { ok: true, values }
}

function periodOf(values: Record<string, FinanceMeasure>): FinancePeriod | null {
  for (const measure of Object.values(values)) if (measure.period) return measure.period
  return null
}

function ok(def: Def, value: number, values: Record<string, FinanceMeasure>, notes: string[] = [], period: FinancePeriod | null = periodOf(values)): FinanceOk {
  return {
    ...def,
    status: 'ok',
    value,
    period,
    basis: weakest(Object.values(values).map((measure) => measure.basis)),
    inputs: Object.fromEntries(Object.entries(values).map(([name, measure]) => [name, measure.value])),
    notes,
  }
}

function undefinedResult(def: Def, values: Record<string, FinanceMeasure>, reason: string): FinanceUndefined {
  return { ...def, status: 'undefined', value: null, basis: weakest(Object.values(values).map((measure) => measure.basis)), reason }
}

function money(currency: string, per?: string): string {
  return per ? `${currency}/${per}` : currency
}

export function grossProfit(data: FinanceInputs): FinanceResult {
  const def = { metric: 'gross_profit', label: 'Gross profit', unit: money(data.currency, 'period'), formula: 'revenue - cogs' }
  const got = need(data, def, ['revenue', 'cogs'])
  if (!got.ok) return got.result
  const { revenue, cogs } = got.values as Record<'revenue' | 'cogs', FinanceMeasure>
  const result = ok(def, revenue.value - cogs.value, got.values)
  result.unit = money(data.currency, result.period ?? 'period')
  if (result.value < 0) result.notes.push('Negative gross profit: cost of revenue exceeds revenue.')
  return result
}

/** Gross margin as a percentage. Derived from revenue and cogs, or taken from `gross_margin_pct`. */
export function grossMarginPct(data: FinanceInputs): FinanceResult {
  const def = { metric: 'gross_margin_pct', label: 'Gross margin', unit: '%', formula: '(revenue - cogs) / revenue * 100' }
  if (data.inputs.revenue === undefined || data.inputs.cogs === undefined) {
    const stated = data.inputs.gross_margin_pct
    if (stated) return ok({ ...def, formula: 'gross_margin_pct (stated input)' }, stated.value, { gross_margin_pct: stated }, ['Taken from the stated input, not derived.'])
  }
  const got = need(data, def, ['revenue', 'cogs'])
  if (!got.ok) {
    if (got.result.status === 'missing') got.result.missing = [...got.result.missing, 'or gross_margin_pct']
    return got.result
  }
  const { revenue, cogs } = got.values as Record<'revenue' | 'cogs', FinanceMeasure>
  if (revenue.value === 0) return undefinedResult(def, got.values, 'revenue is zero, so gross margin has no defined percentage')
  return ok(def, ((revenue.value - cogs.value) / revenue.value) * 100, got.values)
}

export function cac(data: FinanceInputs): FinanceResult {
  const def = { metric: 'cac', label: 'Customer acquisition cost', unit: money(data.currency, 'customer'), formula: 'sales_marketing_spend / new_customers' }
  const got = need(data, def, ['sales_marketing_spend', 'new_customers'])
  if (!got.ok) return got.result
  const { sales_marketing_spend: spend, new_customers: customers } = got.values as Record<'sales_marketing_spend' | 'new_customers', FinanceMeasure>
  if (customers.value === 0) return undefinedResult(def, got.values, 'no new customers in the period, so CAC has no finite value')
  return ok(def, spend.value / customers.value, got.values)
}

export function churnRate(data: FinanceInputs): FinanceResult {
  const def = { metric: 'churn_rate', label: 'Customer churn rate', unit: 'ratio/period', formula: 'churned_customers / customers_start' }
  const got = need(data, def, ['churned_customers', 'customers_start'])
  if (!got.ok) return got.result
  const { churned_customers: churned, customers_start: start } = got.values as Record<'churned_customers' | 'customers_start', FinanceMeasure>
  if (churned.value > start.value) {
    return { ...def, status: 'invalid', value: null, errors: ['churned_customers exceeds customers_start; count churn only from customers present at the start'] }
  }
  if (start.value === 0) return undefinedResult(def, got.values, 'no customers at the start of the period, so churn has no defined rate')
  const result = ok(def, churned.value / start.value, got.values)
  result.unit = `ratio/${result.period ?? 'period'}`
  return result
}

export function retentionRate(data: FinanceInputs): FinanceResult {
  const churn = churnRate(data)
  const def = { metric: 'retention_rate', label: 'Customer retention rate', unit: churn.unit, formula: '1 - churned_customers / customers_start' }
  if (churn.status !== 'ok') return { ...churn, ...def }
  return { ...churn, ...def, value: 1 - churn.value }
}

/** Margin-adjusted LTV: ARPA × gross margin ÷ churn rate, all on the same period. */
export function ltv(data: FinanceInputs): FinanceResult {
  const def = { metric: 'ltv', label: 'Customer lifetime value (gross-margin adjusted)', unit: money(data.currency, 'customer'), formula: 'arpa * (gross_margin_pct / 100) / churn_rate' }
  const margin = grossMarginPct(data)
  const churn = churnRate(data)
  const arpa = data.inputs.arpa
  const missing = [...(arpa ? [] : ['arpa']), ...(margin.status === 'missing' ? margin.missing : []), ...(churn.status === 'missing' ? churn.missing : [])]
  if (missing.length > 0) return { ...def, status: 'missing', value: null, missing }
  const errors = [...(margin.status === 'invalid' ? margin.errors : []), ...(churn.status === 'invalid' ? churn.errors : [])]
  if (errors.length > 0) return { ...def, status: 'invalid', value: null, errors }
  // The inputs actually used: ARPA, whichever margin source grossMarginPct chose, and the churn counts.
  const marginSources: FinanceInputName[] = margin.formula.includes('stated') ? ['gross_margin_pct'] : ['revenue', 'cogs']
  const used: Record<string, FinanceMeasure> = { arpa: arpa as FinanceMeasure }
  for (const name of [...marginSources, 'churned_customers', 'customers_start'] as FinanceInputName[]) {
    const measure = data.inputs[name]
    if (measure) used[name] = measure
  }
  if (margin.status === 'undefined') return undefinedResult(def, used, margin.reason)
  if (churn.status === 'undefined') return undefinedResult(def, used, churn.reason)
  if (margin.status !== 'ok' || churn.status !== 'ok') return { ...def, status: 'invalid', value: null, errors: ['gross margin or churn could not be computed'] }
  const flows = Object.entries(used).filter(([, measure]) => measure.period !== null)
  if (new Set(flows.map(([, measure]) => measure.period)).size > 1) {
    const detail = flows.map(([name, measure]) => `${name} per ${measure.period}`).join(', ')
    return { ...def, status: 'invalid', value: null, errors: [`inconsistent periods (${detail}); ARPA and churn must use one period`] }
  }
  if (churn.value === 0) return undefinedResult(def, used, 'churn rate is zero, so lifetime value is unbounded; supply an observed or assumed churn rate')
  const result = ok(def, ((arpa as FinanceMeasure).value * (margin.value / 100)) / churn.value, used, [
    `Expected lifetime ${(1 / churn.value).toFixed(1)} ${churn.period ?? 'period'}s at the observed churn rate.`,
  ], null)
  return result
}

export function ltvToCac(data: FinanceInputs): FinanceResult {
  const def = { metric: 'ltv_to_cac', label: 'LTV to CAC ratio', unit: 'ratio', formula: 'ltv / cac' }
  const lifetime = ltv(data)
  const acquisition = cac(data)
  const missing = [...(lifetime.status === 'missing' ? lifetime.missing : []), ...(acquisition.status === 'missing' ? acquisition.missing : [])]
  if (missing.length > 0) return { ...def, status: 'missing', value: null, missing: [...new Set(missing)] }
  const errors = [...(lifetime.status === 'invalid' ? lifetime.errors : []), ...(acquisition.status === 'invalid' ? acquisition.errors : [])]
  if (errors.length > 0) return { ...def, status: 'invalid', value: null, errors }
  if (lifetime.status === 'undefined') return { ...def, status: 'undefined', value: null, basis: lifetime.basis, reason: `LTV is undefined: ${lifetime.reason}` }
  if (acquisition.status === 'undefined') return { ...def, status: 'undefined', value: null, basis: acquisition.basis, reason: `CAC is undefined: ${acquisition.reason}` }
  if (lifetime.status !== 'ok' || acquisition.status !== 'ok') return { ...def, status: 'invalid', value: null, errors: ['LTV or CAC could not be computed'] }
  if (acquisition.value === 0) return { ...def, status: 'undefined', value: null, basis: weakest([lifetime.basis, acquisition.basis]), reason: 'CAC is zero' }
  return { ...def, status: 'ok', value: lifetime.value / acquisition.value, period: null, basis: weakest([lifetime.basis, acquisition.basis]), inputs: { ...lifetime.inputs, ...acquisition.inputs }, notes: [] }
}

/** MRR from the stated `mrr`, or from active customers × monthly ARPA. */
export function mrr(data: FinanceInputs): FinanceResult {
  const def = { metric: 'mrr', label: 'Monthly recurring revenue', unit: money(data.currency, 'month'), formula: 'mrr (stated) or active_customers * arpa' }
  const stated = data.inputs.mrr
  if (stated) return ok({ ...def, formula: 'mrr (stated input)' }, stated.value, { mrr: stated }, [], 'month')
  const got = need(data, def, ['active_customers', 'arpa'])
  if (!got.ok) {
    if (got.result.status === 'missing') got.result.missing = ['mrr', `or ${got.result.missing.join(' and ')}`]
    return got.result
  }
  const arpa = got.values.arpa as FinanceMeasure
  if (arpa.period !== 'month') {
    return { ...def, status: 'invalid', value: null, errors: [`arpa is per ${arpa.period}; MRR needs a monthly ARPA or a stated mrr`] }
  }
  return ok({ ...def, formula: 'active_customers * arpa' }, (got.values.active_customers as FinanceMeasure).value * arpa.value, got.values, [], 'month')
}

export function arr(data: FinanceInputs): FinanceResult {
  const monthly = mrr(data)
  const def = { metric: 'arr', label: 'Annual recurring revenue (run rate)', unit: money(data.currency, 'year'), formula: 'mrr * 12' }
  if (monthly.status !== 'ok') return { ...monthly, ...def }
  return { ...monthly, ...def, value: monthly.value * 12, period: 'year', notes: ['Run rate: current MRR × 12, not a forecast of next year.'] }
}

/** Net burn: cash out minus cash in. Negative means the business generated cash. */
export function netBurn(data: FinanceInputs): FinanceResult {
  const def = { metric: 'net_burn', label: 'Net burn', unit: money(data.currency, 'period'), formula: 'cash_out - cash_in' }
  const got = need(data, def, ['cash_out', 'cash_in'])
  if (!got.ok) return got.result
  const value = (got.values.cash_out as FinanceMeasure).value - (got.values.cash_in as FinanceMeasure).value
  const result = ok(def, value, got.values, value < 0 ? ['Negative net burn: cash in exceeded cash out in the period.'] : [])
  result.unit = money(data.currency, result.period ?? 'period')
  return result
}

/** Runway in months: cash balance ÷ net burn, with the burn period converted explicitly to months. */
export function runway(data: FinanceInputs): FinanceResult {
  const def = { metric: 'runway', label: 'Runway', unit: 'months', formula: 'cash_balance / (net_burn / months_per_period)' }
  const burn = netBurn(data)
  const cash = data.inputs.cash_balance
  const missing = [...(cash ? [] : ['cash_balance']), ...(burn.status === 'missing' ? burn.missing : [])]
  if (missing.length > 0) return { ...def, status: 'missing', value: null, missing }
  if (burn.status === 'invalid') return { ...def, status: 'invalid', value: null, errors: burn.errors }
  if (burn.status !== 'ok') return { ...def, status: 'invalid', value: null, errors: ['net burn could not be computed'] }
  const used: Record<string, FinanceMeasure> = { cash_balance: cash as FinanceMeasure, cash_out: data.inputs.cash_out as FinanceMeasure, cash_in: data.inputs.cash_in as FinanceMeasure }
  if (burn.value <= 0) return undefinedResult(def, used, 'net burn is zero or negative, so cash is not running down and runway is not limited by burn')
  const monthlyBurn = burn.value / MONTHS_PER[burn.period ?? 'month']
  return ok(def, (cash as FinanceMeasure).value / monthlyBurn, used, burn.period && burn.period !== 'month' ? [`Burn per ${burn.period} divided by ${MONTHS_PER[burn.period]} to get monthly burn.`] : [], null)
}

/** Break-even volume per period: fixed costs ÷ unit contribution margin. */
export function breakEven(data: FinanceInputs): FinanceResult {
  const def = { metric: 'break_even_units', label: 'Break-even volume', unit: 'units/period', formula: 'fixed_costs / (price_per_unit - variable_cost_per_unit)' }
  const got = need(data, def, ['fixed_costs', 'price_per_unit', 'variable_cost_per_unit'])
  if (!got.ok) return got.result
  const { fixed_costs: fixed, price_per_unit: price, variable_cost_per_unit: variable } = got.values as Record<'fixed_costs' | 'price_per_unit' | 'variable_cost_per_unit', FinanceMeasure>
  const contribution = price.value - variable.value
  if (contribution <= 0) return undefinedResult(def, got.values, 'price does not exceed variable cost per unit, so no volume breaks even')
  const units = fixed.value / contribution
  const result = ok(def, units, got.values, [
    `Round up to ${Math.ceil(units)} whole units; break-even revenue is ${(Math.ceil(units) * price.value).toFixed(2)} ${data.currency}.`,
  ])
  result.unit = `units/${result.period ?? 'period'}`
  return result
}

const SCENARIO_FIELDS = ['months', 'starting_mrr', 'monthly_growth_rate', 'monthly_churn_rate', 'gross_margin_pct', 'monthly_fixed_costs', 'starting_cash'] as const

/**
 * Month-by-month projection from explicit assumptions. Nothing is defaulted: every assumption must be supplied.
 * mrr[m] = mrr[m-1] * (1 + growth - churn); gross_profit = mrr * margin; net_cash_flow = gross_profit - fixed costs.
 */
export function projectScenario(currency: string, scenario: FinanceScenario): ScenarioResult {
  const def = {
    metric: 'scenario_projection',
    label: `Scenario: ${scenario.name}`,
    unit: money(currency, 'month'),
    formula: 'mrr[m] = mrr[m-1] * (1 + monthly_growth_rate - monthly_churn_rate); cash[m] = cash[m-1] + mrr[m] * gross_margin_pct / 100 - monthly_fixed_costs',
  }
  const missing = SCENARIO_FIELDS.filter((field) => scenario[field] === undefined)
  if (missing.length > 0) return { ...def, name: scenario.name, status: 'missing', value: null, missing: [...missing] }
  if (scenario.basis === 'actual') return { ...def, name: scenario.name, status: 'invalid', value: null, errors: ['a projection cannot have basis actual'] }
  const assumptions = Object.fromEntries(SCENARIO_FIELDS.map((field) => [field, scenario[field] as number]))
  const months = assumptions.months as number
  const series: ScenarioMonth[] = []
  let current = assumptions.starting_mrr as number
  let cash = assumptions.starting_cash as number
  let cashOut: number | null = null
  for (let month = 1; month <= months; month += 1) {
    current = current * (1 + (assumptions.monthly_growth_rate as number) - (assumptions.monthly_churn_rate as number))
    const gross = current * ((assumptions.gross_margin_pct as number) / 100)
    const flow = gross - (assumptions.monthly_fixed_costs as number)
    cash += flow
    series.push({ month, mrr: round2(current), gross_profit: round2(gross), net_cash_flow: round2(flow), cash: round2(cash) })
    if (cashOut === null && cash < 0) cashOut = month
  }
  return {
    ...def,
    name: scenario.name,
    status: 'ok',
    basis: scenario.basis,
    period: 'month',
    value: null,
    series,
    cash_out_month: cashOut,
    assumptions,
    notes: [`${scenario.basis === 'forecast' ? 'Forecast' : 'Hypothetical'} projection from the stated assumptions only. Not actual results.`],
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export const FINANCE_METRICS = [grossProfit, grossMarginPct, cac, churnRate, retentionRate, ltv, ltvToCac, mrr, arr, netBurn, runway, breakEven] as const

/** Runs every metric and scenario. Never throws for missing data; invalid input files throw `FinanceInputError` in `parseFinanceInputs`. */
export function computeFinance(data: FinanceInputs): FinanceReport {
  return {
    currency: data.currency,
    metrics: FINANCE_METRICS.map((metric) => metric(data)),
    scenarios: data.scenarios.map((scenario) => projectScenario(data.currency, scenario)),
    errors: [],
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(Math.abs(value) < 1 ? 4 : 2)
}

/** Plain-text report. Every line names its status so a missing value is never read as zero. */
export function formatFinanceReport(report: FinanceReport): string {
  const lines: string[] = [`Currency: ${report.currency}`, '']
  for (const result of report.metrics) {
    if (result.status === 'ok') {
      lines.push(`${result.label}: ${formatNumber(result.value)} ${result.unit} [${result.basis}${result.period ? `, per ${result.period}` : ''}]`)
      lines.push(`  formula: ${result.formula}`)
      for (const note of result.notes) lines.push(`  note: ${note}`)
    } else if (result.status === 'missing') {
      lines.push(`${result.label}: MISSING (needs ${result.missing.join(', ')})`)
    } else if (result.status === 'invalid') {
      lines.push(`${result.label}: INVALID (${result.errors.join('; ')})`)
    } else {
      lines.push(`${result.label}: UNDEFINED [${result.basis}] (${result.reason})`)
    }
  }
  for (const scenario of report.scenarios) {
    lines.push('')
    if (scenario.status === 'ok') {
      lines.push(`${scenario.label} [${scenario.basis}, per month, ${scenario.series.length} months]`)
      const last = scenario.series[scenario.series.length - 1]
      if (last) lines.push(`  month ${last.month}: MRR ${formatNumber(last.mrr)} ${report.currency}, cash ${formatNumber(last.cash)} ${report.currency}`)
      lines.push(`  cash below zero: ${scenario.cash_out_month === null ? 'not within the projection' : `month ${scenario.cash_out_month}`}`)
      for (const note of scenario.notes) lines.push(`  note: ${note}`)
    } else if (scenario.status === 'missing') {
      lines.push(`${scenario.label}: MISSING (needs ${scenario.missing.join(', ')})`)
    } else {
      lines.push(`${scenario.label}: INVALID (${scenario.errors.join('; ')})`)
    }
  }
  return `${lines.join('\n')}\n`
}
