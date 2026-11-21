import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { AuthContext } from './auth.js'

/**
 * Append-only access log at `brand/.private/access-log.jsonl` (mode 0600, gitignored).
 * It records who asked, which tool, which ids, and the decision. It never records values,
 * and a free-text query is stored only as a short sha256 prefix.
 */

export interface AccessLogEntry {
  at: string
  principal: string
  role: string
  profile: string | null
  brand_id: string
  tool: string
  kind: string | null
  requested_ids: string[]
  returned_ids: string[]
  withheld_ids: string[]
  query_sha256: string | null
  decision: 'allow' | 'deny'
  reason: string
}

export function accessLogPath(root: string): string {
  return path.join(root, 'brand', '.private', 'access-log.jsonl')
}

const ID_PATTERN = /^[A-Za-z0-9._:/-]{1,200}$/

/** Ids come from tool arguments too, so anything that does not look like an id is dropped. */
function safeIds(ids: readonly string[]): string[] {
  return ids.filter((id) => ID_PATTERN.test(id)).slice(0, 200)
}

export function queryFingerprint(query: string | undefined): string | null {
  if (!query) return null
  return crypto.createHash('sha256').update(query, 'utf8').digest('hex').slice(0, 16)
}

export function appendAccessLog(
  root: string,
  ctx: AuthContext,
  entry: Omit<AccessLogEntry, 'at' | 'principal' | 'role' | 'profile' | 'brand_id'>,
  now = new Date(),
): void {
  const line: AccessLogEntry = {
    at: now.toISOString(),
    principal: ctx.principal_id,
    role: ctx.role,
    profile: ctx.profile ?? null,
    brand_id: ctx.brand_id,
    tool: entry.tool,
    kind: entry.kind,
    requested_ids: safeIds(entry.requested_ids),
    returned_ids: safeIds(entry.returned_ids),
    withheld_ids: safeIds(entry.withheld_ids),
    query_sha256: entry.query_sha256,
    decision: entry.decision,
    reason: entry.reason.slice(0, 200),
  }
  const file = accessLogPath(root)
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  // O_APPEND keeps earlier lines intact; a single small write is not interleaved with other appenders.
  const fd = fs.openSync(file, 'a', 0o600)
  try {
    fs.writeSync(fd, `${JSON.stringify(line)}\n`)
    fs.fsyncSync(fd)
  } finally {
    fs.closeSync(fd)
  }
}

export function readAccessLog(root: string): AccessLogEntry[] {
  const file = accessLogPath(root)
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AccessLogEntry)
}
