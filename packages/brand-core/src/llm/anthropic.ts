import { LlmError, type CompletionRequest, type ModelProvider } from './provider.js'

export const ANTHROPIC_DEFAULT_MODEL = 'claude-opus-5-5'
export const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2026-10-21'
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  json(): Promise<unknown>
}>

interface MessagesResponse {
  stop_reason?: string | null
  content?: Array<{ type?: string; text?: string }>
}

/**
 * Anthropic Messages API over fetch. No SDK dependency. Built only by resolveProvider, which requires
 * both `llm.provider: anthropic` in brand.config.yaml and ANTHROPIC_API_KEY in the environment.
 * The key is held in memory for the request header and is never logged or written.
 *
 * The response is constrained with a JSON schema (structured output) and validated again locally.
 * When the default model is used, the API's server-side refusal fallback is enabled.
 */
export class AnthropicProvider implements ModelProvider {
  readonly id: string
  readonly external = true
  private readonly apiKey: string
  private readonly model: string
  private readonly fetchImpl: FetchLike

  constructor(opts: { apiKey: string; model?: string | null; fetch?: FetchLike }) {
    if (!opts.apiKey) throw new Error('AnthropicProvider needs an API key from the environment.')
    this.apiKey = opts.apiKey
    this.model = opts.model || ANTHROPIC_DEFAULT_MODEL
    this.id = `anthropic:${this.model}`
    this.fetchImpl = opts.fetch ?? (globalThis.fetch as unknown as FetchLike)
  }

  /** The request body, without credentials. Exposed for tests. */
  body(request: CompletionRequest): Record<string, unknown> {
    return {
      model: this.model,
      max_tokens: request.maxOutputTokens,
      system: request.system,
      messages: [{ role: 'user', content: request.prompt }],
      output_config: { format: { type: 'json_schema', schema: request.responseSchema } },
      ...(this.model === ANTHROPIC_DEFAULT_MODEL ? { fallbacks: 'default' } : {}),
    }
  }

  async complete(request: CompletionRequest): Promise<string> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': API_VERSION,
    }
    if (this.model === ANTHROPIC_DEFAULT_MODEL) headers['anthropic-beta'] = FALLBACK_BETA
    let response: Awaited<ReturnType<FetchLike>>
    try {
      response = await this.fetchImpl(ANTHROPIC_ENDPOINT, { method: 'POST', headers, body: JSON.stringify(this.body(request)), signal: request.signal })
    } catch {
      if (request.signal.aborted) throw new LlmError('timeout', 'Anthropic request was aborted after the timeout.')
      throw new LlmError('network', 'Anthropic request failed before a response arrived.')
    }
    if (!response.ok) {
      const kind = response.status === 429 || response.status >= 500 ? 'retryable' : 'request rejected'
      throw new LlmError('http', `Anthropic returned HTTP ${response.status} (${kind}).`)
    }
    let json: MessagesResponse
    try {
      json = (await response.json()) as MessagesResponse
    } catch {
      throw new LlmError('malformed', 'Anthropic response was not JSON.')
    }
    if (json.stop_reason === 'refusal') throw new LlmError('refusal', 'The model declined this request.')
    if (json.stop_reason === 'max_tokens') throw new LlmError('malformed', 'The model output was cut off at max_tokens.')
    const text = (json.content ?? [])
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text)
      .join('')
    if (!text) throw new LlmError('malformed', 'Anthropic response had no text content.')
    return text
  }
}
