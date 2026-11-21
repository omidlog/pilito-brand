/** Fixed-window counters. Small, in-memory, and enough for a single-owner service behind one reverse proxy. */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records one hit and reports whether the caller is still within the limit. */
  take(key: string): { ok: boolean; retryAfterSeconds: number } {
    const at = this.now()
    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= at) {
      this.hits.set(key, { count: 1, resetAt: at + this.windowMs })
      if (this.hits.size > 10_000) this.prune(at)
      return { ok: true, retryAfterSeconds: 0 }
    }
    entry.count += 1
    if (entry.count > this.limit) return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - at) / 1000) }
    return { ok: true, retryAfterSeconds: 0 }
  }

  /** Checks without recording a hit. */
  blocked(key: string): boolean {
    const entry = this.hits.get(key)
    return entry !== undefined && entry.resetAt > this.now() && entry.count >= this.limit
  }

  reset(key: string): void {
    this.hits.delete(key)
  }

  private prune(at: number): void {
    for (const [key, entry] of this.hits) if (entry.resetAt <= at) this.hits.delete(key)
  }
}
