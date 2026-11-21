import { PERSONAL_FACETS, type AnswerRecord, type BrandConfig, type PersonalFacet, type PersonalModuleConfig } from './types.js'

export interface ConditionContext {
  config: BrandConfig
  answers: Map<string, AnswerRecord>
}

function answerValue(ctx: ConditionContext, id: string): string | null {
  const record = ctx.answers.get(id)
  if (!record || record.value === null || record.value === undefined) return null
  return String(record.value)
}

/**
 * The personal module as configured. Configs written before Phase 8 have no `modules.personal`;
 * that means disabled, so an upgraded `universal` brand behaves exactly as before.
 */
export function personalConfig(config: BrandConfig): PersonalModuleConfig {
  const raw = config.modules?.personal
  if (!raw || typeof raw !== 'object') return { enabled: false, facets: [] }
  const facets = Array.isArray(raw.facets) ? raw.facets.filter((facet): facet is PersonalFacet => (PERSONAL_FACETS as readonly string[]).includes(facet)) : []
  return { enabled: raw.enabled === true, facets }
}

/**
 * Whether an optional module is on for this config. One rule for the dashboard, the compiled pages
 * and the docs build: mascot and gamification follow their flags; personal modules need the personal
 * module, and a facet module also needs its facet.
 */
export function moduleEnabled(module: { optional?: string; facet?: PersonalFacet }, config: BrandConfig): boolean {
  if (module.optional === 'mascot') return config.modules.mascot.enabled
  if (module.optional === 'gamification') return config.modules.gamification.enabled
  if (module.optional === 'personal') {
    const personal = personalConfig(config)
    return personal.enabled && (!module.facet || personal.facets.includes(module.facet))
  }
  return true
}

function configValue(config: BrandConfig, path: string): string | null {
  if (path === 'config.modules.mascot') return String(config.modules.mascot.enabled)
  if (path === 'config.modules.personal') return String(personalConfig(config).enabled)
  if (path === 'config.brand.profile') return config.brand.profile ?? 'universal'
  if (path === 'config.modules.gamification') return String(config.modules.gamification.enabled)
  if (path.startsWith('config.capabilities.')) {
    const key = path.slice('config.capabilities.'.length)
    const value = config.capabilities[key]
    return value === undefined ? null : String(value)
  }
  if (path === 'config.brand.sector') return config.brand.sector
  return null
}

/**
 * Tiny predicate language used by question eligibility.
 * Supported forms:
 * - always | never
 * - config.modules.mascot == true|false
 * - config.modules.gamification == true|false
 * - config.capabilities.<flag> == true|false
 * - config.modules.personal == true|false
 * - config.brand.profile == <profile-id>
 * - config.modules.personal.facets has|lacks <facet>
 * - answers[<question-id>] == value
 * - answers[<question-id>] != value
 * - answers[<question-id>] in a,b
 * - answers[<question-id>] not_in a,b
 * Missing answers make comparisons false.
 */
export function disabledModule(questionId: string, ctx: ConditionContext): boolean {
  if (!ctx.config.modules.mascot.enabled && questionId.startsWith('brand.mascot.')) return true
  if (!ctx.config.modules.gamification.enabled && questionId.startsWith('brand.gamification.')) return true
  if (questionId.startsWith('personal.') && !personalConfig(ctx.config).enabled) return true
  return false
}

export function evaluateCondition(expression: string | undefined, ctx: ConditionContext): boolean {
  if (!expression || expression.trim() === '' || expression.trim() === 'always') return true
  const expr = expression.trim()
  if (expr === 'never') return false

  const facet = expr.match(/^config\.modules\.personal\.facets\s+(has|lacks)\s+([a-z-]+)$/)
  if (facet) {
    const name = facet[2] ?? ''
    if (!(PERSONAL_FACETS as readonly string[]).includes(name)) throw new Error(`Unknown personal facet in condition: ${name}`)
    const selected = personalConfig(ctx.config).facets.includes(name as PersonalFacet)
    return facet[1] === 'has' ? selected : !selected
  }

  const cmp = expr.match(/^([\w.]+)\s*(==|!=)\s*(.+)$/)
  if (cmp) {
    const left = cmp[1] ?? ''
    const op = cmp[2] ?? '=='
    const right = (cmp[3] ?? '').trim()
    const actual = configValue(ctx.config, left)
    if (actual === null) return false
    return op === '==' ? actual === right : actual !== right
  }

  const answerCmp = expr.match(/^answers\[([^\]]+)\]\s*(==|!=|in|not_in)\s*(.+)$/)
  if (answerCmp) {
    const id = answerCmp[1] ?? ''
    const op = answerCmp[2] ?? '=='
    const right = (answerCmp[3] ?? '').trim()
    const actual = answerValue(ctx, id)
    if (op === '==') return actual === right
    if (op === '!=') return actual !== null && actual !== right
    const options = right.split(',').map((part) => part.trim())
    if (actual === null) return false
    if (op === 'in') return options.includes(actual)
    return !options.includes(actual)
  }

  throw new Error(`Unsupported condition: ${expression}`)
}

export function shouldSkip(expression: string | undefined, ctx: ConditionContext): boolean {
  if (!expression) return false
  return evaluateCondition(expression, ctx)
}
