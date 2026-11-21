import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { agentTokenContext, guestContext, isAgentProfile, type AgentProfile, type AuthContext } from './auth.js'
import { writeAtomic } from './fsutil.js'

/**
 * Owner-issued agent tokens.
 *
 * - The raw token is returned once by `issueAgentToken` and never stored. Only its sha256 is kept.
 *   Tokens carry 256 bits of randomness, so a fast hash is enough; there is nothing to brute-force.
 * - Records live in `brand/.private/agent-tokens.json` (mode 0600, gitignored, never published).
 * - A token is bound to one brand id and one fixed profile. It never carries approve, write, or restricted.
 * - Resolution fails closed: an unknown, revoked, malformed, or cross-brand token throws.
 */

export const AGENT_TOKEN_ENV = 'BRAND_OS_AGENT_TOKEN'
const TOKEN_PREFIX = 'bos_at_'
const FILE_FORMAT = 'brand-os-agent-tokens/1'

export interface AgentTokenRecord {
  id: string
  label: string
  profile: AgentProfile
  brand_id: string
  sha256: string
  created_at: string
  revoked: boolean
  revoked_at: string | null
}

export type AgentTokenSummary = Omit<AgentTokenRecord, 'sha256'>

interface TokenFile {
  format: typeof FILE_FORMAT
  tokens: AgentTokenRecord[]
}

export function agentTokenPath(root: string): string {
  return path.join(root, 'brand', '.private', 'agent-tokens.json')
}

function hashToken(token: string): Buffer {
  return crypto.createHash('sha256').update(token, 'utf8').digest()
}

function readTokenFile(root: string): TokenFile {
  const file = agentTokenPath(root)
  if (!fs.existsSync(file)) return { format: FILE_FORMAT, tokens: [] }
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<TokenFile>
  if (parsed.format !== FILE_FORMAT || !Array.isArray(parsed.tokens)) {
    throw new Error('Agent token file has an unknown format. Refusing to use it.')
  }
  for (const record of parsed.tokens) {
    if (
      typeof record?.id !== 'string' ||
      typeof record.brand_id !== 'string' ||
      typeof record.sha256 !== 'string' ||
      !/^[0-9a-f]{64}$/.test(record.sha256) ||
      !isAgentProfile(record.profile) ||
      typeof record.revoked !== 'boolean'
    ) {
      throw new Error('Agent token file has an invalid record. Refusing to use it.')
    }
  }
  return parsed as TokenFile
}

function writeTokenFile(root: string, doc: TokenFile): void {
  const file = agentTokenPath(root)
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  writeAtomic(file, `${JSON.stringify(doc, null, 2)}\n`, { mode: 0o600 })
}

function summary(record: AgentTokenRecord): AgentTokenSummary {
  return {
    id: record.id,
    label: record.label,
    profile: record.profile,
    brand_id: record.brand_id,
    created_at: record.created_at,
    revoked: record.revoked,
    revoked_at: record.revoked_at,
  }
}

/** Creates a token for `brandId`. The returned `token` is the only copy; show it once and discard it. */
export function issueAgentToken(
  root: string,
  input: { brandId: string; profile: AgentProfile; label: string; now?: Date },
): { token: string; record: AgentTokenSummary } {
  if (!isAgentProfile(input.profile)) throw new Error(`Unknown agent profile. Use one of: internal-read, design, marketing, finance.`)
  const label = input.label.trim()
  if (!label || label.length > 80 || /[\r\n]/.test(label)) throw new Error('A token label of 1-80 characters on one line is required.')
  const doc = readTokenFile(root)
  const token = `${TOKEN_PREFIX}${crypto.randomBytes(32).toString('base64url')}`
  const record: AgentTokenRecord = {
    id: `agt_${crypto.randomBytes(6).toString('hex')}`,
    label,
    profile: input.profile,
    brand_id: input.brandId,
    sha256: hashToken(token).toString('hex'),
    created_at: (input.now ?? new Date()).toISOString(),
    revoked: false,
    revoked_at: null,
  }
  doc.tokens.push(record)
  writeTokenFile(root, doc)
  return { token, record: summary(record) }
}

export function listAgentTokens(root: string): AgentTokenSummary[] {
  return readTokenFile(root).tokens.map(summary)
}

export function revokeAgentToken(root: string, id: string, now = new Date()): AgentTokenSummary | null {
  const doc = readTokenFile(root)
  const record = doc.tokens.find((item) => item.id === id)
  if (!record) return null
  if (!record.revoked) {
    record.revoked = true
    record.revoked_at = now.toISOString()
    writeTokenFile(root, doc)
  }
  return summary(record)
}

/** Compares the presented token's hash against every record without stopping early. */
function findRecord(records: AgentTokenRecord[], token: string): AgentTokenRecord | null {
  const presented = hashToken(token)
  let match: AgentTokenRecord | null = null
  for (const record of records) {
    const stored = Buffer.from(record.sha256, 'hex')
    const equal = stored.length === presented.length && crypto.timingSafeEqual(stored, presented)
    if (equal && match === null) match = record
  }
  return match
}

export class AgentTokenError extends Error {}

/**
 * Turns the server's own token (from its environment, never from a tool argument) into a context.
 * No token means guest. Anything else that does not resolve cleanly throws `AgentTokenError`.
 * Error messages never include the token.
 */
export function resolveAgentContext(root: string, brandId: string, token: string | undefined): AuthContext {
  if (token === undefined || token === '') return guestContext(brandId)
  if (!token.startsWith(TOKEN_PREFIX) || token.length < TOKEN_PREFIX.length + 40) {
    throw new AgentTokenError(`${AGENT_TOKEN_ENV} is not a Brand OS agent token. Refusing to start.`)
  }
  let records: AgentTokenRecord[]
  try {
    records = readTokenFile(root).tokens
  } catch (error) {
    throw new AgentTokenError(`Agent token file could not be read: ${(error as Error).message}`)
  }
  const record = findRecord(records, token)
  if (!record) throw new AgentTokenError(`${AGENT_TOKEN_ENV} does not match an issued token for this checkout. Refusing to start.`)
  if (record.revoked) throw new AgentTokenError(`Agent token ${record.id} was revoked. Refusing to start.`)
  if (record.brand_id !== brandId) throw new AgentTokenError(`Agent token ${record.id} belongs to another brand. Refusing to start.`)
  return agentTokenContext(brandId, record.id, record.profile)
}
