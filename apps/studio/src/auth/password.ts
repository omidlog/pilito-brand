import crypto from 'node:crypto'

/**
 * Owner password hashing with scrypt. Format: `scrypt$N$r$p$saltB64$hashB64`.
 * The plain password is never stored, logged or accepted on argv.
 */
const KEY_LENGTH = 64
const DEFAULT = { N: 2 ** 15, r: 8, p: 1 }

function derive(password: string, salt: Buffer, N: number, r: number, p: number): Buffer {
  return crypto.scryptSync(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r, p, maxmem: 256 * N * r })
}

export function hashPassword(password: string, params = DEFAULT): string {
  if (password.length < 12) throw new Error('Use a password of at least 12 characters.')
  const salt = crypto.randomBytes(16)
  const hash = derive(password, salt, params.N, params.r, params.p)
  return ['scrypt', params.N, params.r, params.p, salt.toString('base64'), hash.toString('base64')].join('$')
}

export function verifyPassword(password: string, encoded: string): boolean {
  const parts = encoded.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [N, r, p] = parts.slice(1, 4).map(Number)
  if (!N || !r || !p || N > 2 ** 20 || r > 32 || p > 16) return false
  const salt = Buffer.from(parts[4] ?? '', 'base64')
  const expected = Buffer.from(parts[5] ?? '', 'base64')
  if (salt.length < 8 || expected.length !== KEY_LENGTH) return false
  // Bound the input so a huge body cannot make scrypt the bottleneck.
  if (password.length === 0 || password.length > 1024) return false
  const actual = derive(password, salt, N, r, p)
  return crypto.timingSafeEqual(actual, expected)
}
