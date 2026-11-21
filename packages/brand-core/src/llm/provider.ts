import type { BrandConfig } from '../types.js'
import type { Locale } from '../i18n.js'

/**
 * Model provider adapter. Brand OS works with no provider at all: the deterministic engine stays the
 * source of truth, and model output is only ever an untrusted proposal that passes the same intake
 * as an agent's proposal batch.
 *
 * Providers:
 * - `none` (default): no model. `brand:interview --assist` uses deterministic rules.
 * - `mock`: deterministic, local, no network. For tests and demos.
 * - `anthropic`: HTTP adapter. Active only when brand.config.yaml selects it AND the
 *   ANTHROPIC_API_KEY environment variable is set. Never configured by default.
 *
 * Restricted data is never sent to any provider. There is no setting that changes this.
 */

export const LLM_PROVIDERS = ['none', 'mock', 'anthropic'] as const
export type LlmProviderId = (typeof LLM_PROVIDERS)[number]

export interface LlmConfig {
  provider: LlmProviderId
  /** Model id for the HTTP provider. Null uses the adapter default. */
  model: string | null
  timeout_ms?: number
  max_input_chars?: number
  max_output_tokens?: number
  /** Requests one CLI run may make. */
  max_requests?: number
}

export interface LlmLimits {
  timeoutMs: number
  maxInputChars: number
  maxOutputTokens: number
  maxRequests: number
}

export const DEFAULT_LIMITS: LlmLimits = { timeoutMs: 30_000, maxInputChars: 12_000, maxOutputTokens: 4_000, maxRequests: 5 }

/** Hard ceilings a config cannot raise. */
const CEILINGS: LlmLimits = { timeoutMs: 120_000, maxInputChars: 50_000, maxOutputTokens: 16_000, maxRequests: 50 }

/** One question the model may write to. Restricted questions are never in this list. */
export interface CatalogQuestion {
  id: string
  label: string
  question_type: string
  options: string[] | null
}

export interface CompletionRequest {
  system: string
  /** The user message: instructions plus the owner text, fenced as data. */
  prompt: string
  /** JSON Schema for the response. Providers that support structured output send it. */
  responseSchema: Record<string, unknown>
  maxOutputTokens: number
  signal: AbortSignal
  /**
   * The same task in structured form, for local providers that do not read prompts (the mock). It
   * holds exactly what the prompt holds: the redacted text and the allowed catalog.
   */
  task: { text: string; questions: CatalogQuestion[]; locale: Locale }
}

export interface ModelProvider {
  readonly id: string
  /** True when requests leave this machine. */
  readonly external: boolean
  /** Returns the raw model text. Throws LlmError on failure. */
  complete(request: CompletionRequest): Promise<string>
}

export type LlmErrorKind = 'timeout' | 'budget' | 'input_too_large' | 'http' | 'refusal' | 'malformed' | 'network'

export class LlmError extends Error {
  constructor(
    readonly kind: LlmErrorKind,
    message: string,
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

/** Counts requests across one run so a loop cannot spend without limit. */
export class RequestBudget {
  private used = 0
  constructor(readonly max: number) {}
  take(): void {
    if (this.used >= this.max) throw new LlmError('budget', `Request budget of ${this.max} model call(s) is spent for this run.`)
    this.used += 1
  }
  get spent(): number {
    return this.used
  }
}

export function limitsFrom(config: LlmConfig | undefined): LlmLimits {
  const pick = (value: number | undefined, fallback: number, ceiling: number) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.min(Math.floor(value), ceiling) : fallback
  return {
    timeoutMs: pick(config?.timeout_ms, DEFAULT_LIMITS.timeoutMs, CEILINGS.timeoutMs),
    maxInputChars: pick(config?.max_input_chars, DEFAULT_LIMITS.maxInputChars, CEILINGS.maxInputChars),
    maxOutputTokens: pick(config?.max_output_tokens, DEFAULT_LIMITS.maxOutputTokens, CEILINGS.maxOutputTokens),
    maxRequests: pick(config?.max_requests, DEFAULT_LIMITS.maxRequests, CEILINGS.maxRequests),
  }
}

/** Run one completion under the timeout and request budget. A timeout aborts the request. */
export async function completeWithLimits(
  provider: ModelProvider,
  request: Omit<CompletionRequest, 'signal' | 'maxOutputTokens'>,
  limits: LlmLimits,
  budget: RequestBudget,
): Promise<string> {
  budget.take()
  const controller = new AbortController()
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new LlmError('timeout', `${provider.id} did not answer within ${limits.timeoutMs} ms.`))
    }, limits.timeoutMs)
  })
  try {
    return await Promise.race([provider.complete({ ...request, maxOutputTokens: limits.maxOutputTokens, signal: controller.signal }), timeout])
  } catch (error) {
    if (error instanceof LlmError) throw error
    if (controller.signal.aborted) throw new LlmError('timeout', `${provider.id} did not answer within ${limits.timeoutMs} ms.`)
    throw new LlmError('network', `${provider.id} request failed.`)
  } finally {
    clearTimeout(timer)
  }
}

export function llmConfigOf(config: BrandConfig): LlmConfig {
  const raw = config.llm
  const provider = raw && (LLM_PROVIDERS as readonly string[]).includes(raw.provider) ? raw.provider : 'none'
  return { ...(raw ?? {}), provider, model: raw?.model ?? null }
}

/** Errors in the llm section of brand.config.yaml, for validate and doctor. */
export function llmConfigErrors(config: BrandConfig): string[] {
  const raw = config.llm as unknown
  if (raw === undefined || raw === null) return []
  if (typeof raw !== 'object') return ['brand.config.yaml llm must be a mapping']
  const errors: string[] = []
  const record = raw as Record<string, unknown>
  if (!(LLM_PROVIDERS as readonly string[]).includes(String(record.provider))) {
    errors.push(`brand.config.yaml llm.provider must be one of ${LLM_PROVIDERS.join(', ')}`)
  }
  if (record.model !== undefined && record.model !== null && (typeof record.model !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(record.model))) {
    errors.push('brand.config.yaml llm.model must be null or a model id')
  }
  for (const key of ['timeout_ms', 'max_input_chars', 'max_output_tokens', 'max_requests']) {
    const value = record[key]
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) errors.push(`brand.config.yaml llm.${key} must be a positive number`)
  }
  const allowed = new Set(['provider', 'model', 'timeout_ms', 'max_input_chars', 'max_output_tokens', 'max_requests'])
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      errors.push(
        key === 'allow_restricted_to_provider'
          ? 'brand.config.yaml llm.allow_restricted_to_provider is not supported: restricted data is never sent to a model provider'
          : `brand.config.yaml llm.${key} is not a known setting`,
      )
    }
  }
  return errors
}
