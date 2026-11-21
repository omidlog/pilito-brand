import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  arr,
  breakEven,
  cac,
  churnRate,
  computeFinance,
  FinanceInputError,
  FinanceInputPathError,
  formatFinanceReport,
  grossMarginPct,
  grossProfit,
  ltv,
  ltvToCac,
  mrr,
  netBurn,
  parseFinanceInputs,
  projectScenario,
  resolveFinanceInputPath,
  retentionRate,
  runway,
} from '@brand-os/brand-core'
import type { FinanceInputs, FinanceResult } from '@brand-os/brand-core'

const repoRoot = path.resolve(import.meta.dirname, '..')

function data(inputs: Record<string, unknown>, extra: Record<string, unknown> = {}): FinanceInputs {
  return parseFinanceInputs({ currency: 'USD', period: 'month', basis: 'actual', inputs, ...extra })
}

function value(result: FinanceResult): number {
  assert.equal(result.status, 'ok', JSON.stringify(result))
  return (result as { value: number }).value
}

const FULL = {
  revenue: 20000,
  cogs: 5000,
  sales_marketing_spend: 8000,
  new_customers: 40,
  customers_start: 200,
  churned_customers: 10,
  active_customers: 230,
  arpa: 100,
  cash_balance: 120000,
  cash_in: 20000,
  cash_out: 30000,
  fixed_costs: 9000,
  price_per_unit: 50,
  variable_cost_per_unit: 20,
}

test('finance formulas compute the documented values with units, period, basis and formula', () => {
  const input = data(FULL)
  const table: Array<[FinanceResult, number, string]> = [
    [grossProfit(input), 15000, 'USD/month'],
    [grossMarginPct(input), 75, '%'],
    [cac(input), 200, 'USD/customer'],
    [churnRate(input), 0.05, 'ratio/month'],
    [retentionRate(input), 0.95, 'ratio/month'],
    // Margin-adjusted: 100 * 0.75 / 0.05
    [ltv(input), 1500, 'USD/customer'],
    [ltvToCac(input), 7.5, 'ratio'],
    [mrr(input), 23000, 'USD/month'],
    [arr(input), 276000, 'USD/year'],
    [netBurn(input), 10000, 'USD/month'],
    [runway(input), 12, 'months'],
    [breakEven(input), 300, 'units/month'],
  ]
  for (const [result, expected, unit] of table) {
    assert.ok(Math.abs(value(result) - expected) < 1e-9, `${result.metric}: ${value(result)} != ${expected}`)
    assert.equal(result.unit, unit, result.metric)
    assert.ok(result.formula.length > 0, `${result.metric} has a formula`)
    assert.equal((result as { basis: string }).basis, 'actual')
  }
  assert.equal((grossProfit(input) as { period: string }).period, 'month')
  assert.deepEqual((cac(input) as { inputs: Record<string, number> }).inputs, { sales_marketing_spend: 8000, new_customers: 40 })
})

test('missing inputs produce missing results that name the inputs, never a number', () => {
  const empty = data({})
  for (const metric of [grossProfit, grossMarginPct, cac, churnRate, retentionRate, ltv, ltvToCac, mrr, arr, netBurn, runway, breakEven]) {
    const result = metric(empty)
    assert.equal(result.status, 'missing', result.metric)
    assert.equal(result.value, null)
    assert.ok((result as { missing: string[] }).missing.length > 0, result.metric)
  }
  assert.deepEqual((cac(data({ sales_marketing_spend: 100 })) as { missing: string[] }).missing, ['new_customers'])
  assert.deepEqual((runway(data({ cash_in: 1, cash_out: 2 })) as { missing: string[] }).missing, ['cash_balance'])
  // An explicit null is "unknown", not zero.
  assert.equal(cac(data({ sales_marketing_spend: 100, new_customers: null })).status, 'missing')
  const report = formatFinanceReport(computeFinance(empty))
  assert.match(report, /Customer acquisition cost: MISSING \(needs sales_marketing_spend, new_customers\)/)
})

test('zero churn, zero revenue, no burn and no contribution are undefined, not infinite', () => {
  const zeroChurn = data({ ...FULL, churned_customers: 0 })
  assert.equal(churnRate(zeroChurn).status, 'ok')
  assert.equal(value(churnRate(zeroChurn)), 0)
  assert.equal(value(retentionRate(zeroChurn)), 1)
  const lifetime = ltv(zeroChurn)
  assert.equal(lifetime.status, 'undefined')
  assert.match((lifetime as { reason: string }).reason, /churn rate is zero/)
  assert.equal(ltvToCac(zeroChurn).status, 'undefined')

  const zeroRevenue = data({ ...FULL, revenue: 0, cogs: 0 })
  assert.equal(value(grossProfit(zeroRevenue)), 0)
  assert.equal(grossMarginPct(zeroRevenue).status, 'undefined')

  assert.equal(cac(data({ ...FULL, new_customers: 0 })).status, 'undefined')
  assert.equal(churnRate(data({ ...FULL, customers_start: 0, churned_customers: 0 })).status, 'undefined')

  const cashPositive = data({ ...FULL, cash_in: 40000 })
  assert.equal(value(netBurn(cashPositive)), -10000)
  assert.equal(runway(cashPositive).status, 'undefined')

  assert.equal(breakEven(data({ ...FULL, price_per_unit: 20 })).status, 'undefined')
  const negativeMargin = grossProfit(data({ ...FULL, cogs: 25000 }))
  assert.equal(value(negativeMargin), -5000)
  assert.ok((negativeMargin as { notes: string[] }).notes.some((note) => /Negative gross profit/.test(note)))
})

test('the result basis is the weakest basis among the inputs used', () => {
  const mixed = data({ ...FULL, new_customers: { value: 40, basis: 'forecast' }, arpa: { value: 100, basis: 'hypothetical' } })
  assert.equal((grossProfit(mixed) as { basis: string }).basis, 'actual')
  assert.equal((cac(mixed) as { basis: string }).basis, 'forecast')
  assert.equal((ltv(mixed) as { basis: string }).basis, 'hypothetical')
  assert.equal((ltvToCac(mixed) as { basis: string }).basis, 'hypothetical')
  const forecast = parseFinanceInputs({ currency: 'EUR', basis: 'forecast', inputs: { revenue: 10, cogs: 4 } })
  const result = grossProfit(forecast)
  assert.equal((result as { basis: string }).basis, 'forecast')
  assert.equal(result.unit, 'EUR/month')
})

test('periods are checked, never converted silently, except the explicit runway conversion', () => {
  const mixed = data({ ...FULL, cogs: { value: 15000, period: 'quarter' } })
  const result = grossProfit(mixed)
  assert.equal(result.status, 'invalid')
  assert.match((result as { errors: string[] }).errors[0] ?? '', /inconsistent periods/)
  assert.equal(ltv(data({ ...FULL, arpa: { value: 1200, period: 'year' } })).status, 'invalid')
  assert.equal(mrr(data({ active_customers: 10, arpa: { value: 1200, period: 'year' } })).status, 'invalid')
  const quarterly = parseFinanceInputs({ currency: 'USD', period: 'quarter', basis: 'actual', inputs: { cash_balance: 90000, cash_in: 0, cash_out: 30000 } })
  assert.equal(value(runway(quarterly)), 9)
})

test('input validation rejects negative counts, bad rates, unknown keys and missing basis', () => {
  const cases: Array<[Record<string, unknown>, RegExp]> = [
    [{ currency: 'USD', basis: 'actual', inputs: { new_customers: -1 } }, /new_customers must be a non-negative whole number/],
    [{ currency: 'USD', basis: 'actual', inputs: { new_customers: 2.5 } }, /whole number/],
    [{ currency: 'USD', basis: 'actual', inputs: { revenue: -10 } }, /revenue must not be negative/],
    [{ currency: 'USD', basis: 'actual', inputs: { revenue: 'lots' } }, /revenue must be a number/],
    [{ currency: 'USD', basis: 'actual', inputs: { gross_margin_pct: 140 } }, /must not exceed 100/],
    [{ currency: 'USD', basis: 'actual', inputs: { revnue: 10 } }, /unknown input revnue/],
    [{ currency: 'USD', inputs: {} }, /basis is required/],
    [{ currency: 'dollars', basis: 'actual' }, /currency/],
    [{ currency: 'USD', basis: 'actual', inputs: { mrr: { value: 10, period: 'month' } } }, /point-in-time/],
    [{ currency: 'USD', basis: 'actual', scenarios: [{ name: 'x', basis: 'actual' }] }, /cannot have basis actual/],
    [{ currency: 'USD', basis: 'actual', scenarios: [{ name: 'x', monthly_churn_rate: 2 }] }, /between 0 and 1/],
    [{ currency: 'USD', basis: 'actual', inputs: { revenue: Number.POSITIVE_INFINITY } }, /finite/],
  ]
  for (const [raw, pattern] of cases) {
    assert.throws(() => parseFinanceInputs(raw), (error: unknown) => error instanceof FinanceInputError && error.errors.some((message) => pattern.test(message)), String(pattern))
  }
  assert.equal(churnRate(data({ customers_start: 5, churned_customers: 6 })).status, 'invalid')
})

test('scenario projection is labelled, uses only stated assumptions, and finds the cash-out month', () => {
  const scenario = {
    name: 'base',
    basis: 'forecast' as const,
    months: 6,
    starting_mrr: 10000,
    monthly_growth_rate: 0.1,
    monthly_churn_rate: 0.02,
    gross_margin_pct: 80,
    monthly_fixed_costs: 20000,
    starting_cash: 50000,
  }
  const result = projectScenario('USD', scenario)
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.basis, 'forecast')
  assert.equal(result.period, 'month')
  assert.equal(result.series.length, 6)
  assert.equal(result.series[0]?.mrr, 10800)
  assert.equal(result.series[0]?.gross_profit, 8640)
  assert.equal(result.series[0]?.cash, 38640)
  assert.equal(result.series[4]?.cash, 687.43)
  assert.equal(result.cash_out_month, 6)
  const partial = projectScenario('USD', { name: 'thin', basis: 'hypothetical', starting_mrr: 1 })
  assert.equal(partial.status, 'missing')
  assert.ok(partial.status === 'missing' && partial.missing.includes('monthly_churn_rate'))
  const parsed = parseFinanceInputs({ currency: 'USD', basis: 'actual', scenarios: [{ name: 'upside', months: 2 }] })
  assert.equal(parsed.scenarios[0]?.basis, 'hypothetical', 'scenarios default to hypothetical, never actual')
})

function tempRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-finance-'))
  execFileSync('git', ['init', '-q'], { cwd: dir })
  fs.writeFileSync(path.join(dir, '.gitignore'), 'brand/restricted/finance/\n')
  fs.mkdirSync(path.join(dir, 'brand', 'restricted', 'finance'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'brand', 'business-os'), { recursive: true })
  return dir
}

const SAMPLE = 'currency: USD\nbasis: actual\ninputs:\n  revenue: 100\n  cogs: 40\n'

test('finance input paths inside tracked directories are refused', () => {
  const repo = tempRepo()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-finance-outside-'))
  try {
    fs.writeFileSync(path.join(outside, 'q3.yaml'), SAMPLE)
    assert.equal(resolveFinanceInputPath(repo, path.join(outside, 'q3.yaml')), fs.realpathSync(path.join(outside, 'q3.yaml')))

    fs.writeFileSync(path.join(repo, 'brand', 'restricted', 'finance', 'q3.yaml'), SAMPLE)
    assert.ok(resolveFinanceInputPath(repo, 'restricted:q3').endsWith(path.join('finance', 'q3.yaml')))

    const untrackedButNotIgnored = path.join(repo, 'brand', 'business-os', 'numbers.yaml')
    fs.writeFileSync(untrackedButNotIgnored, SAMPLE)
    assert.throws(() => resolveFinanceInputPath(repo, untrackedButNotIgnored), FinanceInputPathError)

    // Tracked even though the directory is ignored: still refused.
    const forced = path.join(repo, 'brand', 'restricted', 'finance', 'forced.yaml')
    fs.writeFileSync(forced, SAMPLE)
    execFileSync('git', ['add', '-f', forced], { cwd: repo })
    assert.throws(() => resolveFinanceInputPath(repo, forced), /gitignored and untracked/)

    // A symlink from outside pointing into a tracked directory resolves to the real path and is refused.
    const link = path.join(outside, 'link.yaml')
    fs.symlinkSync(untrackedButNotIgnored, link)
    assert.throws(() => resolveFinanceInputPath(repo, link), FinanceInputPathError)

    assert.throws(() => resolveFinanceInputPath(repo, 'restricted:../../x'), /plain file name/)
    assert.throws(() => resolveFinanceInputPath(repo, path.join(outside, 'absent.yaml')), /not found/)
  } finally {
    fs.rmSync(repo, { recursive: true, force: true })
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('brand:finance prints labelled results for an outside file and refuses a tracked file', () => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-finance-cli-'))
  try {
    const file = path.join(outside, 'inputs.yaml')
    fs.writeFileSync(file, `${SAMPLE}  sales_marketing_spend: 500\n`)
    const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'scripts/brand.ts', 'finance', ...args], { cwd: repoRoot, encoding: 'utf8' })
    const ok = run(['--input', file])
    assert.equal(ok.status, 0, ok.stderr)
    assert.match(ok.stdout, /Gross profit: 60 USD\/month \[actual, per month\]/)
    assert.match(ok.stdout, /Customer acquisition cost: MISSING \(needs new_customers\)/)
    const json = run(['--input', file, '--json'])
    assert.equal(json.status, 0, json.stderr)
    const report = JSON.parse(json.stdout) as { metrics: Array<{ metric: string; status: string }> }
    assert.equal(report.metrics.find((metric) => metric.metric === 'gross_margin_pct')?.status, 'ok')
    const tracked = run(['--input', 'brand/brand.config.yaml'])
    assert.equal(tracked.status, 1)
    assert.match(tracked.stderr, /must be gitignored and untracked/)
    fs.writeFileSync(file, 'currency: USD\ninputs:\n  new_customers: -3\n')
    const invalid = run(['--input', file])
    assert.equal(invalid.status, 1)
    assert.match(invalid.stderr, /basis is required/)
    assert.match(invalid.stderr, /new_customers must be a non-negative whole number/)
  } finally {
    fs.rmSync(outside, { recursive: true, force: true })
  }
})
