import crypto from 'node:crypto'

/** RFC 6238 time-based one-time passwords (SHA-1, 6 digits, 30-second step), the format authenticator apps use. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of clean) {
    const index = ALPHABET.indexOf(char)
    if (index < 0) throw new Error('Invalid base32 secret.')
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

export function base32Encode(bytes: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function totpAt(secret: string, timeMs: number, step = 30): string {
  const counter = Math.floor(timeMs / 1000 / step)
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(message).digest()
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return code.toString().padStart(6, '0')
}

/** Accepts the current step and one step either side for clock drift. Rejects a code already used in its step. */
export class TotpVerifier {
  private readonly used = new Map<string, number>()

  constructor(private readonly secret: string) {}

  verify(code: string, nowMs: number): boolean {
    if (!/^\d{6}$/.test(code)) return false
    for (const drift of [0, -1, 1]) {
      const at = nowMs + drift * 30_000
      const expected = totpAt(this.secret, at)
      if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))) {
        const stepId = `${Math.floor(at / 30_000)}:${code}`
        if (this.used.has(stepId)) return false
        this.used.set(stepId, nowMs)
        for (const [key, seen] of this.used) if (nowMs - seen > 120_000) this.used.delete(key)
        return true
      }
    }
    return false
  }
}
