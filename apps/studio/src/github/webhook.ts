import crypto from 'node:crypto'

/** Verifies `X-Hub-Signature-256` (HMAC-SHA256 over the raw body) in constant time. */
export function verifyWebhookSignature(secret: string | null, rawBody: Buffer, header: string | undefined): boolean {
  if (!secret || typeof header !== 'string' || !header.startsWith('sha256=')) return false
  const given = Buffer.from(header.slice('sha256='.length), 'hex')
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest()
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

export function signWebhook(secret: string, rawBody: Buffer): string {
  return `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
}

export interface PushEvent {
  repositoryId: number
  fullName: string
  ref: string
  after: string
}

export function parsePush(body: unknown): PushEvent | null {
  if (typeof body !== 'object' || body === null) return null
  const raw = body as Record<string, unknown>
  const repo = raw.repository as Record<string, unknown> | undefined
  if (!repo || typeof raw.ref !== 'string' || typeof raw.after !== 'string') return null
  const id = Number(repo.id)
  if (!Number.isInteger(id) || typeof repo.full_name !== 'string') return null
  return { repositoryId: id, fullName: repo.full_name.slice(0, 200), ref: raw.ref.slice(0, 250), after: raw.after.slice(0, 40) }
}

/** Remembers recent delivery ids so a replayed delivery is ignored. */
export class DeliveryLog {
  private readonly seen = new Map<string, number>()

  constructor(private readonly max = 1000) {}

  firstTime(id: string | undefined): boolean {
    if (!id || id.length > 100) return false
    if (this.seen.has(id)) return false
    this.seen.set(id, Date.now())
    if (this.seen.size > this.max) {
      const oldest = this.seen.keys().next().value
      if (oldest !== undefined) this.seen.delete(oldest)
    }
    return true
  }
}
