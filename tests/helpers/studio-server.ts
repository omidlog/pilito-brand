import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { buildStudio } from '../../apps/studio/src/app.js'
import { hashPassword } from '../../apps/studio/src/auth/password.js'
import { totpAt } from '../../apps/studio/src/auth/totp.js'
import type { StudioConfig } from '../../apps/studio/src/config.js'
import { FakeGitHub, templateTree } from './fake-github.js'
import { OWNER, PROVISION_TOKEN, READ_TOKEN, TEMPLATE } from './studio.js'

export const OWNER_LOGIN = 'owner'
export const OWNER_PASSWORD = 'correct horse battery staple'
export const TOTP_SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'
export const WEBHOOK_SECRET = 'test-webhook-secret-0123456789'
export const SESSION_SECRET = crypto.randomBytes(32)
// Cheap scrypt parameters for tests only; production uses the defaults.
const PASSWORD_HASH = hashPassword(OWNER_PASSWORD, { N: 2 ** 12, r: 8, p: 1 })

export interface RunningStudio {
  url: string
  origin: string
  github: FakeGitHub
  studio: ReturnType<typeof buildStudio>
  config: StudioConfig
  close: () => Promise<void>
}

export async function startStudio(overrides: Partial<StudioConfig> = {}, githubOverrides: Partial<StudioConfig['github']> = {}): Promise<RunningStudio> {
  const github = new FakeGitHub()
  github.addRepo(TEMPLATE.owner, TEMPLATE.repo, templateTree(), { private: false, is_template: true })
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-server-'))
  const server = http.createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port
  const origin = `http://127.0.0.1:${port}`
  const config: StudioConfig = {
    host: '127.0.0.1',
    port,
    publicOrigin: origin,
    dataDir,
    ownerLogin: OWNER_LOGIN,
    ownerPasswordHash: PASSWORD_HASH,
    ownerTotpSecret: TOTP_SECRET,
    sessionSecret: SESSION_SECRET,
    sessionTtlMs: 3600_000,
    idleTtlMs: 1800_000,
    syncTtlMs: 300_000,
    secureCookies: false,
    trustProxy: false,
    ...overrides,
    github: {
      readToken: READ_TOKEN,
      provisionToken: PROVISION_TOKEN,
      templateOwner: TEMPLATE.owner,
      templateRepo: TEMPLATE.repo,
      allowedOwners: [OWNER],
      webhookSecret: WEBHOOK_SECRET,
      ...githubOverrides,
    },
  }
  const studio = buildStudio(config, { fetch: github.fetch, sleep: async () => undefined })
  server.on('request', (req, res) => void studio.handle(req, res))
  return {
    url: origin,
    origin,
    github,
    studio,
    config,
    close: async () => {
      await studio.provisioning.settled()
      await studio.sync.settled()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    },
  }
}

/** Accepted TOTP windows: each login in a test uses the next one so replay protection does not refuse it. */
const DRIFTS = [0, 30_000, -30_000]
let loginCount = 0

/** A tiny browser: cookie jar, manual redirects, Origin header on POST. */
export class Client {
  cookies = new Map<string, string>()

  constructor(readonly base: string) {}

  private cookieHeader(): string {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  }

  private store(res: Response): void {
    for (const line of res.headers.getSetCookie()) {
      const [pair = ''] = line.split(';')
      const index = pair.indexOf('=')
      const name = pair.slice(0, index)
      const value = pair.slice(index + 1)
      if (/Max-Age=0/i.test(line) || value === '') this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }

  async request(method: string, pathname: string, options: { form?: Record<string, string | string[]>; headers?: Record<string, string>; body?: string | Buffer; origin?: string | null } = {}): Promise<Response> {
    const headers: Record<string, string> = { ...(options.headers ?? {}) }
    if (this.cookies.size) headers.cookie = this.cookieHeader()
    let body: string | Buffer | undefined = options.body
    if (options.form) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(options.form)) for (const item of [value].flat()) params.append(key, item)
      body = params.toString()
      headers['content-type'] = 'application/x-www-form-urlencoded'
    }
    if (method !== 'GET' && options.origin !== null) headers.origin = options.origin ?? this.base
    const res = await fetch(`${this.base}${pathname}`, { method, headers, body: typeof body === 'string' || body === undefined ? body : new Uint8Array(body), redirect: 'manual' })
    this.store(res)
    return res
  }

  get(pathname: string): Promise<Response> {
    return this.request('GET', pathname)
  }

  async page(pathname: string): Promise<{ res: Response; text: string }> {
    const res = await this.get(pathname)
    return { res, text: await res.text() }
  }

  async csrf(pathname: string): Promise<string> {
    const { text } = await this.page(pathname)
    const match = text.match(/name="_csrf" value="([^"]+)"/)
    if (!match) throw new Error(`no csrf on ${pathname}`)
    return match[1]!
  }

  async login(): Promise<void> {
    const token = await this.csrf('/login')
    // Each login uses a fresh TOTP step so replay protection does not reject repeated logins in one test.
    loginCount += 1
    const code = totpAt(TOTP_SECRET, Date.now() + DRIFTS[loginCount % 3]!)
    const res = await this.request('POST', '/login', { form: { _csrf: token, login: OWNER_LOGIN, password: OWNER_PASSWORD, totp: code, next: '/brands' } })
    if (res.status !== 303) throw new Error(`login failed: ${res.status} ${await res.text()}`)
  }
}
