import path from 'node:path'

/**
 * Studio runtime configuration, read from the environment once at startup.
 *
 * Studio refuses to start when a required value is missing or unsafe. Error messages name the
 * variable and the problem, never the value, so a misconfigured secret is not echoed into logs.
 */
export interface GitHubSettings {
  /** Token for read-only access to brand repositories (contents and metadata read). */
  readToken: string | null
  /** Separate token used only by the provisioning service (repository creation and the initial commit). */
  provisionToken: string | null
  templateOwner: string
  templateRepo: string
  /** Accounts or organizations where Studio may create brand repositories. */
  allowedOwners: string[]
  /** Shared secret for the GitHub push webhook. Without it the webhook endpoint refuses every delivery. */
  webhookSecret: string | null
}

export interface StudioConfig {
  host: string
  port: number
  /** Origin the browser uses, for example https://studio.omidataei.com. Used for the Origin check and cookie flags. */
  publicOrigin: string
  dataDir: string
  ownerLogin: string
  ownerPasswordHash: string
  ownerTotpSecret: string | null
  sessionSecret: Buffer
  sessionTtlMs: number
  idleTtlMs: number
  syncTtlMs: number
  secureCookies: boolean
  /** Trust the first X-Forwarded-For hop (only behind the single reverse proxy on the same host). */
  trustProxy: boolean
  github: GitHubSettings
}

export class ConfigError extends Error {
  constructor(readonly problems: string[]) {
    super(`Studio configuration is invalid:\n- ${problems.join('\n- ')}`)
  }
}

const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/
const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost'])

export function isLoopback(host: string): boolean {
  return LOOPBACK.has(host)
}

export function validOwner(value: string): boolean {
  return OWNER_RE.test(value)
}

export function validRepoName(value: string): boolean {
  return REPO_RE.test(value) && value !== '.' && value !== '..' && !value.endsWith('.git')
}

function intIn(env: NodeJS.ProcessEnv, name: string, fallback: number, min: number, max: number, problems: string[]): number {
  const raw = env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < min || value > max) {
    problems.push(`${name} must be an integer between ${min} and ${max}.`)
    return fallback
  }
  return value
}

function optional(env: NodeJS.ProcessEnv, name: string): string | null {
  const value = env[name]?.trim()
  return value ? value : null
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): StudioConfig {
  const problems: string[] = []
  const host = optional(env, 'STUDIO_HOST') ?? '127.0.0.1'
  const port = intIn(env, 'STUDIO_PORT', 4100, 1, 65535, problems)
  const publicOrigin = (optional(env, 'STUDIO_PUBLIC_ORIGIN') ?? `http://127.0.0.1:${port}`).replace(/\/+$/, '')
  let originUrl: URL | null = null
  try {
    originUrl = new URL(publicOrigin)
    if (originUrl.pathname !== '/' || originUrl.search || originUrl.hash) problems.push('STUDIO_PUBLIC_ORIGIN must be an origin without a path.')
  } catch {
    problems.push('STUDIO_PUBLIC_ORIGIN must be a URL such as https://studio.example.com.')
  }
  const remote = !isLoopback(host) || (originUrl !== null && !isLoopback(originUrl.hostname))
  if (originUrl && remote && originUrl.protocol !== 'https:') problems.push('STUDIO_PUBLIC_ORIGIN must use https when Studio is reachable beyond loopback.')

  const ownerLogin = optional(env, 'STUDIO_OWNER_LOGIN') ?? ''
  if (!/^[A-Za-z0-9._@-]{1,64}$/.test(ownerLogin)) problems.push('STUDIO_OWNER_LOGIN is required (letters, digits, . _ @ -, up to 64 characters).')
  const ownerPasswordHash = optional(env, 'STUDIO_OWNER_PASSWORD_HASH') ?? ''
  if (!ownerPasswordHash.startsWith('scrypt$')) problems.push('STUDIO_OWNER_PASSWORD_HASH is required. Create it with npm run studio:hash-password.')
  const ownerTotpSecret = optional(env, 'STUDIO_OWNER_TOTP_SECRET')
  if (ownerTotpSecret && !/^[A-Z2-7]{16,}=*$/.test(ownerTotpSecret.toUpperCase())) problems.push('STUDIO_OWNER_TOTP_SECRET must be base32 (at least 16 characters).')
  if (!ownerTotpSecret && remote) problems.push('STUDIO_OWNER_TOTP_SECRET is required when Studio is reachable beyond loopback (owner MFA).')

  const rawSecret = optional(env, 'STUDIO_SESSION_SECRET')
  let sessionSecret = Buffer.alloc(0)
  if (!rawSecret) problems.push('STUDIO_SESSION_SECRET is required (32 random bytes, base64).')
  else {
    sessionSecret = Buffer.from(rawSecret, 'base64')
    if (sessionSecret.length < 32) problems.push('STUDIO_SESSION_SECRET must decode to at least 32 bytes.')
  }

  const dataDir = path.resolve(optional(env, 'STUDIO_DATA_DIR') ?? '.studio-data')

  const template = optional(env, 'STUDIO_TEMPLATE_REPO') ?? 'omidlog/brand-os-template'
  const [templateOwner = '', templateRepo = '', ...rest] = template.split('/')
  if (rest.length || !validOwner(templateOwner) || !validRepoName(templateRepo)) problems.push('STUDIO_TEMPLATE_REPO must be owner/name.')
  const allowedOwners = (optional(env, 'STUDIO_ALLOWED_OWNERS') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  for (const owner of allowedOwners) if (!validOwner(owner)) problems.push('STUDIO_ALLOWED_OWNERS contains an invalid account name.')

  const readToken = optional(env, 'STUDIO_GITHUB_READ_TOKEN')
  const provisionToken = optional(env, 'STUDIO_GITHUB_PROVISION_TOKEN')
  if (provisionToken && allowedOwners.length === 0) problems.push('STUDIO_ALLOWED_OWNERS is required when STUDIO_GITHUB_PROVISION_TOKEN is set.')
  const webhookSecret = optional(env, 'STUDIO_GITHUB_WEBHOOK_SECRET')
  if (webhookSecret && webhookSecret.length < 20) problems.push('STUDIO_GITHUB_WEBHOOK_SECRET must be at least 20 characters.')

  const sessionHours = intIn(env, 'STUDIO_SESSION_HOURS', 12, 1, 168, problems)
  const idleMinutes = intIn(env, 'STUDIO_IDLE_MINUTES', 60, 5, 1440, problems)
  const syncSeconds = intIn(env, 'STUDIO_SYNC_TTL_SECONDS', 300, 15, 86400, problems)

  if (problems.length) throw new ConfigError(problems)
  return {
    host,
    port,
    publicOrigin,
    dataDir,
    ownerLogin,
    ownerPasswordHash,
    ownerTotpSecret: ownerTotpSecret ? ownerTotpSecret.toUpperCase() : null,
    sessionSecret,
    sessionTtlMs: sessionHours * 3600_000,
    idleTtlMs: idleMinutes * 60_000,
    syncTtlMs: syncSeconds * 1000,
    secureCookies: originUrl?.protocol === 'https:',
    trustProxy: env.STUDIO_TRUST_PROXY === '1' || env.STUDIO_TRUST_PROXY === 'true',
    github: { readToken, provisionToken, templateOwner, templateRepo, allowedOwners, webhookSecret },
  }
}
