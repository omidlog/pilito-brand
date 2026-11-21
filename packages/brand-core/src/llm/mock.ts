import { extractByRules } from './rules.js'
import { LlmError, type CompletionRequest, type ModelProvider } from './provider.js'

/**
 * Deterministic local provider. No network. By default it answers with the rule extractor, so the
 * same answer always yields the same proposals. Tests pass `respond` to script malformed output,
 * injected fields or slow answers.
 */
export class MockProvider implements ModelProvider {
  readonly id = 'mock'
  readonly external = false
  /** Every request this provider received, for tests that check what was sent. */
  readonly requests: CompletionRequest[] = []

  constructor(private readonly opts: { respond?: (request: CompletionRequest) => string | Promise<string>; delayMs?: number } = {}) {}

  async complete(request: CompletionRequest): Promise<string> {
    this.requests.push(request)
    if (this.opts.delayMs) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, this.opts.delayMs)
        request.signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new LlmError('timeout', 'mock request aborted'))
        })
      })
    }
    if (this.opts.respond) return this.opts.respond(request)
    const allowed = new Set(request.task.questions.map((question) => question.id))
    return JSON.stringify(extractByRules(request.task.text, { allowed, locale: request.task.locale }))
  }
}
