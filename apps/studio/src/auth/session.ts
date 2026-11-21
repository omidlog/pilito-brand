import crypto from 'node:crypto'

/**
 * Server-side sessions. The browser holds only a random id in an HttpOnly, SameSite=Strict cookie.
 * The store keeps the SHA-256 of that id, so a memory dump of the map does not yield usable cookies.
 * Sessions live in memory: a restart signs the owner out, which is the safe failure.
 */
export interface Session {
  login: string
  createdAt: number
  lastSeenAt: number
  csrf: string
}

export class SessionStore {
  private readonly sessions = new Map<string, Session>()

  constructor(
    private readonly ttlMs: number,
    private readonly idleMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  private key(id: string): string {
    return crypto.createHash('sha256').update(id).digest('hex')
  }

  create(login: string): { id: string; session: Session } {
    const id = crypto.randomBytes(32).toString('base64url')
    const at = this.now()
    const session: Session = { login, createdAt: at, lastSeenAt: at, csrf: crypto.randomBytes(24).toString('base64url') }
    this.sessions.set(this.key(id), session)
    this.sweep()
    return { id, session }
  }

  get(id: string | undefined): Session | null {
    if (!id || id.length > 200) return null
    const key = this.key(id)
    const session = this.sessions.get(key)
    if (!session) return null
    const at = this.now()
    if (at - session.createdAt > this.ttlMs || at - session.lastSeenAt > this.idleMs) {
      this.sessions.delete(key)
      return null
    }
    session.lastSeenAt = at
    return session
  }

  destroy(id: string | undefined): void {
    if (id) this.sessions.delete(this.key(id))
  }

  size(): number {
    return this.sessions.size
  }

  private sweep(): void {
    const at = this.now()
    for (const [key, session] of this.sessions) {
      if (at - session.createdAt > this.ttlMs || at - session.lastSeenAt > this.idleMs) this.sessions.delete(key)
    }
  }
}

/** Pre-login CSRF: the login form carries HMAC(secret, nonce) where the nonce is in a short-lived cookie. */
export function loginCsrfToken(secret: Buffer, nonce: string): string {
  return crypto.createHmac('sha256', secret).update(`login:${nonce}`).digest('base64url')
}

export function safeEqual(a: string | undefined, b: string | undefined): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}
