import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { writeAtomic } from './fsutil.js'

interface StoreFile {
  version: 1
  entries: Record<string, { iv: string; tag: string; data: string }>
}

/**
 * Restricted answers are encrypted with BRAND_OS_DATA_KEY (32 raw bytes, base64).
 * The key is not written into the working tree. Copying `brand/.private` does not include it.
 * Operations fail closed when the env key is absent or the wrong length.
 */
export function dataKey(): Buffer {
  const env = process.env.BRAND_OS_DATA_KEY
  if (!env) throw new Error('BRAND_OS_DATA_KEY is required. Refusing to encrypt or decrypt without an env key.')
  const raw = Buffer.from(env, 'base64')
  if (raw.length !== 32) throw new Error('BRAND_OS_DATA_KEY must decode to 32 bytes.')
  return raw
}
export class PrivateStore {
  constructor(private readonly root: string) {}

  private dir(): string {
    return path.join(this.root, 'brand', '.private')
  }

  put(questionId: string, payload: { value: unknown; raw: string | null }): string {
    const id = `priv-${crypto.randomBytes(8).toString('hex')}`
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key(), iv)
    const plain = Buffer.from(JSON.stringify({ questionId, value: payload.value, raw: payload.raw }), 'utf8')
    const data = Buffer.concat([cipher.update(plain), cipher.final()])
    const doc = this.read()
    doc.entries[id] = { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }
    this.write(doc)
    return id
  }

  get(id: string): { questionId: string; value: unknown; raw: string | null } | null {
    const entry = this.read().entries[id]
    if (!entry) return null
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key(), Buffer.from(entry.iv, 'base64'))
    decipher.setAuthTag(Buffer.from(entry.tag, 'base64'))
    const plain = Buffer.concat([decipher.update(Buffer.from(entry.data, 'base64')), decipher.final()])
    return JSON.parse(plain.toString('utf8')) as { questionId: string; value: unknown; raw: string | null }
  }

  private key(): Buffer {
    return dataKey()
  }

  private read(): StoreFile {
    const file = path.join(this.dir(), 'store.json')
    if (!fs.existsSync(file)) return { version: 1, entries: {} }
    return JSON.parse(fs.readFileSync(file, 'utf8')) as StoreFile
  }

  private write(doc: StoreFile): void {
    fs.mkdirSync(this.dir(), { recursive: true, mode: 0o700 })
    writeAtomic(path.join(this.dir(), 'store.json'), `${JSON.stringify(doc)}\n`, { mode: 0o600 })
  }
}

export function approvalSecretPath(root: string): string {
  return path.join(root, 'brand', '.private', 'approval-secret')
}

export function ensureApprovalSecret(root: string): string {
  const file = approvalSecretPath(root)
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  if (!fs.existsSync(file)) fs.writeFileSync(file, `${crypto.randomBytes(24).toString('hex')}\n`, { mode: 0o600 })
  return fs.readFileSync(file, 'utf8').trim()
}

export function approvalProofMatches(root: string, proof: string | undefined): boolean {
  if (!proof) return false
  const file = approvalSecretPath(root)
  if (!fs.existsSync(file)) return false
  const expected = fs.readFileSync(file, 'utf8').trim()
  const a = crypto.createHash('sha256').update(proof).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}
