import crypto from 'node:crypto'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { verifyPassword } from './auth/password.js'
import { RateLimiter } from './auth/rate-limit.js'
import { loginCsrfToken, safeEqual, SessionStore, type Session } from './auth/session.js'
import { TotpVerifier } from './auth/totp.js'
import type { StudioConfig } from './config.js'
import type { GitHubClient } from './github/client.js'
import { GitHubError } from './github/client.js'
import { DeliveryLog, parsePush, verifyWebhookSignature } from './github/webhook.js'
import {
  BodyTooLarge,
  first,
  parseCookies,
  parseForm,
  readBody,
  redirect,
  safeLocalPath,
  securityHeaders,
  sendHtml,
  sendJson,
  serializeCookie,
} from './http.js'
import { i18n, isLocale, type I18n, type Locale, type MessageKey } from './i18n/index.js'
import { validateRequest, type ProvisioningService } from './provision.js'
import type { BrandRecord, Registry } from './registry.js'
import { brandIsReady, type SyncService } from './sync.js'
import type { SafeHtml } from './views/html.js'
import type { BrandView, ViewContext } from './views/layout.js'
import * as pages from './views/pages.js'

/**
 * The Studio HTTP application.
 *
 * Read-only by construction: the route table below is the complete list of endpoints. The only
 * non-GET routes are sign-in, sign-out, the owner-only provisioning pair (create, retry), the cache
 * refresh, and the signed GitHub webhook. None of them writes brand facts, documents, assets or
 * commits to an existing brand repository. Every brand route resolves the slug through the
 * server-side registry, so a forged slug cannot select a repository.
 */
export interface StudioDeps {
  config: StudioConfig
  registry: Registry
  sync: SyncService
  provisioning: ProvisioningService
  readClient: GitHubClient
  provisionClient: GitHubClient
  now?: () => number
  log?: (line: string) => void
}

type Handler = (ctx: RequestContext, match: RegExpMatchArray) => Promise<void> | void

interface Route {
  method: 'GET' | 'POST'
  pattern: RegExp
  auth: 'none' | 'session'
  /** Why this route may change state. Required for every non-GET route. */
  writes?: string
  handle: Handler
}

interface RequestContext {
  req: IncomingMessage
  res: ServerResponse
  url: URL
  locale: Locale
  i: I18n
  session: Session | null
  sessionId: string | null
  form: Record<string, string | string[]>
  raw: Buffer
}

const STATIC_DIR = path.resolve(import.meta.dirname, '..', 'static')
const STATIC_FILES: Record<string, string> = {
  'studio.css': 'text/css; charset=utf-8',
  'studio.js': 'text/javascript; charset=utf-8',
  'favicon.svg': 'image/svg+xml',
}
const BRAND_SECTIONS = ['brand-book', 'design', 'assets', 'business', 'personal', 'history', 'handoff'] as const

export interface RouteInfo {
  method: string
  pattern: string
  auth: string
  writes: string | null
}

export function createStudio(deps: StudioDeps): {
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>
  sessions: SessionStore
  routes: RouteInfo[]
} {
  const { config, registry, sync, provisioning } = deps
  const now = deps.now ?? Date.now
  const log = deps.log ?? (() => undefined)
  const sessions = new SessionStore(config.sessionTtlMs, config.idleTtlMs, now)
  const totp = config.ownerTotpSecret ? new TotpVerifier(config.ownerTotpSecret) : null
  const loginLimiter = new RateLimiter(5, 15 * 60_000, now)
  const globalLoginLimiter = new RateLimiter(30, 15 * 60_000, now)
  const provisionLimiter = new RateLimiter(10, 60 * 60_000, now)
  const refreshLimiter = new RateLimiter(1, 5_000, now)
  const testLimiter = new RateLimiter(5, 60_000, now)
  const deliveries = new DeliveryLog()
  const autoRefreshAt = new Map<string, number>()
  let templateCheck: { at: number; state: 'ok' | 'missing' | 'unknown' } | null = null
  const sessionCookie = config.secureCookies ? '__Host-studio_session' : 'studio_session'
  const loginCookie = config.secureCookies ? '__Host-studio_login' : 'studio_login'
  const langCookie = 'studio_lang'

  function clientIp(req: IncomingMessage): string {
    if (config.trustProxy) {
      const forwarded = req.headers['x-forwarded-for']
      const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
      const hop = value?.split(',')[0]?.trim()
      if (hop) return hop
    }
    return req.socket.remoteAddress ?? 'unknown'
  }

  function sameOrigin(req: IncomingMessage): boolean {
    const origin = req.headers.origin
    if (typeof origin === 'string') return origin === config.publicOrigin
    const site = req.headers['sec-fetch-site']
    if (typeof site === 'string') return site === 'same-origin' || site === 'none'
    return true
  }

  function view(ctx: RequestContext): ViewContext {
    return {
      i: ctx.i,
      path: ctx.url.pathname,
      csrf: ctx.session?.csrf ?? null,
      login: ctx.session?.login ?? null,
      brands: ctx.session ? registry.list().sort((a, b) => a.display_name.localeCompare(b.display_name)) : [],
      now: now(),
    }
  }

  function render(ctx: RequestContext, status: number, page: SafeHtml): void {
    sendHtml(ctx.res, status, page.value)
  }

  function notFound(ctx: RequestContext): void {
    render(ctx, 404, pages.errorPage(view(ctx), 'notFound'))
  }

  function brandRecord(ctx: RequestContext, slug: string): BrandRecord | null {
    const record = registry.get(slug)
    if (!record) notFound(ctx)
    return record
  }

  async function brandView(ctx: RequestContext, record: BrandRecord): Promise<BrandView> {
    let cached = sync.get(record.slug)
    if (cached.status.state === 'never' && !sync.isRefreshing(record.slug)) {
      // First view: read GitHub now, but never hang the page for long.
      cached = await Promise.race([sync.refresh(record.slug), new Promise<typeof cached>((resolve) => setTimeout(() => resolve(sync.get(record.slug)), 25_000))])
    } else if (sync.isStale(record.slug, cached.status) && !sync.isRefreshing(record.slug)) {
      const last = autoRefreshAt.get(record.slug) ?? 0
      if (now() - last > 30_000) {
        autoRefreshAt.set(record.slug, now())
        void sync.refresh(record.slug).catch(() => undefined)
      }
    }
    return { record, cached, stale: sync.isStale(record.slug, cached.status), refreshing: sync.isRefreshing(record.slug) }
  }

  /* ------------------------------------------------------------ handlers */

  const health: Handler = (ctx) => {
    ctx.res.statusCode = 200
    ctx.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    ctx.res.setHeader('Cache-Control', 'no-store')
    ctx.res.end('ok\n')
  }

  const staticFile: Handler = (ctx, match) => {
    const name = match[1] ?? ''
    const type = STATIC_FILES[name]
    if (!type) return notFound(ctx)
    ctx.res.statusCode = 200
    ctx.res.setHeader('Content-Type', type)
    ctx.res.setHeader('Cache-Control', 'public, max-age=300')
    ctx.res.end(fs.readFileSync(path.join(STATIC_DIR, name)))
  }

  function showLogin(ctx: RequestContext, options: { error?: string; status?: number; login?: string } = {}): void {
    const nonce = crypto.randomBytes(24).toString('base64url')
    ctx.res.setHeader('Set-Cookie', serializeCookie(loginCookie, nonce, { secure: config.secureCookies, maxAgeSeconds: 900 }))
    const next = safeLocalPath(ctx.url.searchParams.get('next') ?? first(ctx.form.next), '/brands')
    const notice = ctx.url.searchParams.get('signed_out') === '1' ? ctx.i.t('login.signedOut') : undefined
    render(ctx, options.status ?? 200, pages.loginPage(view(ctx), { csrf: loginCsrfToken(config.sessionSecret, nonce), totp: totp !== null, notice, error: options.error, next, login: options.login }))
  }

  const loginForm: Handler = (ctx) => {
    if (ctx.session) return redirect(ctx.res, '/brands')
    showLogin(ctx)
  }

  const login: Handler = (ctx) => {
    const ip = clientIp(ctx.req)
    if (loginLimiter.blocked(ip) || globalLoginLimiter.blocked('all')) {
      return showLogin(ctx, { error: ctx.i.t('login.rateLimited', { minutes: 15 }), status: 429 })
    }
    const nonce = parseCookies(ctx.req.headers.cookie)[loginCookie]
    if (!nonce || !safeEqual(first(ctx.form._csrf), loginCsrfToken(config.sessionSecret, nonce)) || !sameOrigin(ctx.req)) {
      return showLogin(ctx, { error: ctx.i.t('login.expired'), status: 403 })
    }
    const submitted = first(ctx.form.login).trim()
    const loginOk = safeEqual(submitted, config.ownerLogin)
    // Always run the password check so timing does not reveal whether the login name matched.
    const passwordOk = verifyPassword(first(ctx.form.password), config.ownerPasswordHash)
    const totpOk = totp ? totp.verify(first(ctx.form.totp).trim(), now()) : true
    if (!(loginOk && passwordOk && totpOk)) {
      loginLimiter.take(ip)
      globalLoginLimiter.take('all')
      log(`login failed from ${ip}`)
      return showLogin(ctx, { error: ctx.i.t('login.failed'), status: 401, login: submitted.slice(0, 64) })
    }
    loginLimiter.reset(ip)
    if (ctx.sessionId) sessions.destroy(ctx.sessionId)
    const created = sessions.create(config.ownerLogin)
    ctx.res.setHeader('Set-Cookie', [
      serializeCookie(sessionCookie, created.id, { secure: config.secureCookies, maxAgeSeconds: Math.floor(config.sessionTtlMs / 1000) }),
      serializeCookie(loginCookie, '', { secure: config.secureCookies, maxAgeSeconds: 0 }),
    ])
    log('login ok')
    redirect(ctx.res, safeLocalPath(first(ctx.form.next), '/brands'))
  }

  const logout: Handler = (ctx) => {
    sessions.destroy(ctx.sessionId ?? undefined)
    ctx.res.setHeader('Set-Cookie', serializeCookie(sessionCookie, '', { secure: config.secureCookies, maxAgeSeconds: 0 }))
    redirect(ctx.res, '/login?signed_out=1')
  }

  const home: Handler = (ctx) => redirect(ctx.res, '/brands', 302)

  const brands: Handler = (ctx) => {
    const synced = new Map<string, { sha: string | null; at: string | null }>()
    for (const record of registry.list()) {
      const status = sync.get(record.slug).status
      synced.set(record.slug, { sha: status.sha, at: status.committed_at ?? status.synced_at })
    }
    render(ctx, 200, pages.brandsPage(view(ctx), { canCreate: provisioning.configured, synced }))
  }

  async function checkTemplate(): Promise<'ok' | 'missing' | 'unknown'> {
    if (!provisioning.configured) return 'unknown'
    if (templateCheck && now() - templateCheck.at < 60_000) return templateCheck.state
    let state: 'ok' | 'missing' | 'unknown'
    try {
      const repo = await deps.provisionClient.getRepo(config.github.templateOwner, config.github.templateRepo)
      state = repo?.is_template ? 'ok' : 'missing'
    } catch {
      state = 'unknown'
    }
    templateCheck = { at: now(), state }
    return state
  }

  async function wizard(ctx: RequestContext, status: number, values: pages.WizardState['values'], errors: Record<string, string>, formError?: string): Promise<void> {
    render(
      ctx,
      status,
      pages.wizardPage(view(ctx), {
        values,
        errors,
        formError,
        owners: provisioning.allowedOwners,
        template: `${config.github.templateOwner}/${config.github.templateRepo}`,
        templateState: await checkTemplate(),
        configured: provisioning.configured,
      }),
    )
  }

  const newBrandForm: Handler = async (ctx) => {
    await wizard(ctx, 200, { profile: 'business', default_locale: 'en', locales: ['en'], owner: provisioning.allowedOwners[0] }, {})
  }

  const createBrand: Handler = async (ctx) => {
    const form = ctx.form
    const values: pages.WizardState['values'] = {
      name: first(form.name),
      slug: first(form.slug),
      profile: first(form.profile),
      facets: ([] as string[]).concat(form.facets ?? []),
      default_locale: first(form.default_locale),
      locales: ([] as string[]).concat(form.locales ?? []),
      mascot: first(form.mascot) === 'on',
      gamification: first(form.gamification) === 'on',
      owner: first(form.owner),
      repo: first(form.repo),
    }
    if (!provisioning.configured) return wizard(ctx, 409, values, {}, ctx.i.t('wizard.error.not_configured'))
    const { request, errors } = validateRequest(values as Record<string, unknown>, provisioning.allowedOwners)
    if (!request) {
      const messages = Object.fromEntries(Object.entries(errors).map(([field, code]) => [field, ctx.i.t(`wizard.error.${code}` as MessageKey)]))
      return wizard(ctx, 422, values, messages)
    }
    if (!provisionLimiter.take('owner').ok) return wizard(ctx, 429, values, {}, ctx.i.t('wizard.error.rate_limited'))
    const started = provisioning.start(request, ctx.session?.login ?? 'owner')
    if (!started.ok) return wizard(ctx, 409, values, {}, ctx.i.t(`wizard.error.${started.code === 'duplicate' || started.code === 'busy' || started.code === 'not_configured' ? started.code : 'duplicate'}` as MessageKey))
    log(`provisioning started for ${request.slug}`)
    redirect(ctx.res, `/brands/${request.slug}/provisioning`)
  }

  const provisioningStatus: Handler = (ctx, match) => {
    const record = brandRecord(ctx, match[1] ?? '')
    if (!record) return
    if (!record.provisioning) return redirect(ctx.res, `/brands/${record.slug}`)
    render(ctx, 200, pages.provisioningPage(view(ctx), record))
  }

  const provisioningJson: Handler = (ctx, match) => {
    const record = registry.get(match[1] ?? '')
    if (!record?.provisioning) return sendJson(ctx.res, 404, { error: 'not_found' })
    const p = record.provisioning
    sendJson(ctx.res, 200, { state: p.state, attempts: p.attempts, steps: p.steps, error: p.error, cleanup: p.cleanup })
  }

  const retryProvisioning: Handler = (ctx, match) => {
    const record = brandRecord(ctx, match[1] ?? '')
    if (!record) return
    if (!provisionLimiter.take('owner').ok) return redirect(ctx.res, `/brands/${record.slug}/provisioning`)
    provisioning.retry(record.slug)
    redirect(ctx.res, `/brands/${record.slug}/provisioning`)
  }

  const refresh: Handler = async (ctx, match) => {
    const record = brandRecord(ctx, match[1] ?? '')
    if (!record) return
    const back = safeLocalPath(first(ctx.form.return), `/brands/${record.slug}`)
    const target = back === `/brands/${record.slug}` || back.startsWith(`/brands/${record.slug}/`) ? back : `/brands/${record.slug}`
    if (!brandIsReady(record)) return redirect(ctx.res, `/brands/${record.slug}/provisioning`)
    if (!refreshLimiter.take(record.slug).ok) return redirect(ctx.res, `${target}?sync=too-soon`)
    const result = await Promise.race([sync.refresh(record.slug), new Promise<null>((resolve) => setTimeout(() => resolve(null), 30_000))])
    const ok = result !== null && result.status.last_error === null
    redirect(ctx.res, `${target}?sync=${ok ? 'synced' : 'failed'}`)
  }

  const assetFile: Handler = (ctx, match) => {
    const record = brandRecord(ctx, match[1] ?? '')
    if (!record) return
    const file = sync.previewFile(record.slug, match[2] ?? '')
    if (!file) return notFound(ctx)
    ctx.res.statusCode = 200
    ctx.res.setHeader('Content-Type', file.mime)
    ctx.res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
    ctx.res.setHeader('Content-Disposition', 'inline; filename="asset"')
    ctx.res.setHeader('Cache-Control', 'private, max-age=300')
    ctx.res.end(fs.readFileSync(file.file))
  }

  const brandPage: Handler = async (ctx, match) => {
    const record = brandRecord(ctx, match[1] ?? '')
    if (!record) return
    if (!brandIsReady(record)) return redirect(ctx.res, `/brands/${record.slug}/provisioning`, 302)
    const section = (match[2] ?? 'overview') as (typeof BRAND_SECTIONS)[number] | 'overview'
    const brand = await brandView(ctx, record)
    const flash = ctx.url.searchParams.get('sync')
    const flashValue = flash === 'synced' || flash === 'failed' || flash === 'too-soon' ? flash : null
    const doc = ctx.url.searchParams.get('doc')
    const v = view(ctx)
    switch (section) {
      case 'overview':
        return render(ctx, 200, pages.overviewPage(v, brand, flashValue))
      case 'brand-book':
        return render(ctx, 200, pages.brandBookPage(v, brand, flashValue))
      case 'design':
        return render(ctx, 200, pages.designPage(v, brand, flashValue))
      case 'assets':
        return render(ctx, 200, pages.assetsPage(v, brand, flashValue))
      case 'business':
        return render(ctx, 200, pages.businessPage(v, brand, doc, flashValue))
      case 'personal':
        // The section exists only when the Personal Brand OS module is enabled in the repository.
        if (!brand.cached.projection?.personal) return notFound(ctx)
        return render(ctx, 200, pages.personalPage(v, brand, doc, flashValue))
      case 'history':
        return render(ctx, 200, pages.historyPage(v, brand, flashValue))
      case 'handoff':
        return render(ctx, 200, pages.handoffPage(v, brand, flashValue))
    }
  }

  const account: Handler = async (ctx) => {
    let test: pages.AccountState['test'] = null
    if (ctx.url.searchParams.get('test') === '1' && testLimiter.take('owner').ok) {
      test = { read: null, provision: null, error: null }
      try {
        if (deps.readClient.configured) test.read = (await deps.readClient.viewer()).login
        if (deps.provisionClient.configured) test.provision = (await deps.provisionClient.viewer()).login
        if (!deps.readClient.configured && !deps.provisionClient.configured) test.error = ctx.i.t('common.notConfigured')
      } catch (error) {
        test.error = error instanceof GitHubError ? error.message : 'GitHub could not be reached.'
      }
    }
    const session = ctx.session!
    render(
      ctx,
      200,
      pages.accountPage(view(ctx), {
        mfa: totp !== null,
        sessionEndsAt: new Date(session.createdAt + config.sessionTtlMs).toISOString(),
        readConfigured: deps.readClient.configured,
        provisionConfigured: provisioning.configured,
        template: `${config.github.templateOwner}/${config.github.templateRepo}`,
        allowedOwners: config.github.allowedOwners,
        webhookConfigured: config.github.webhookSecret !== null,
        test,
      }),
    )
  }

  const webhook: Handler = (ctx) => {
    if (!verifyWebhookSignature(config.github.webhookSecret, ctx.raw, ctx.req.headers['x-hub-signature-256'] as string | undefined)) {
      log('webhook signature rejected')
      return sendJson(ctx.res, 401, { error: 'invalid_signature' })
    }
    const delivery = ctx.req.headers['x-github-delivery'] as string | undefined
    if (!deliveries.firstTime(delivery)) return sendJson(ctx.res, 200, { status: 'duplicate' })
    const event = ctx.req.headers['x-github-event']
    if (event === 'ping') return sendJson(ctx.res, 200, { status: 'pong' })
    if (event !== 'push') return sendJson(ctx.res, 202, { status: 'ignored' })
    let body: unknown
    try {
      body = JSON.parse(ctx.raw.toString('utf8'))
    } catch {
      return sendJson(ctx.res, 400, { error: 'invalid_json' })
    }
    const push = parsePush(body)
    if (!push) return sendJson(ctx.res, 400, { error: 'invalid_push' })
    const record = registry.byRepository(push.repositoryId, push.fullName)
    if (!record || !brandIsReady(record) || push.ref !== `refs/heads/${record.repo.default_branch}`) return sendJson(ctx.res, 202, { status: 'ignored' })
    // The payload is only a hint. Studio fetches the branch itself with its own read access.
    sync.markDirty(record.slug)
    void sync.refresh(record.slug).catch(() => undefined)
    log(`webhook push for ${record.slug}`)
    sendJson(ctx.res, 202, { status: 'refreshing' })
  }

  const SLUG = '([a-z0-9]+(?:-[a-z0-9]+)*)'
  const routes: Route[] = [
    { method: 'GET', pattern: /^\/healthz$/, auth: 'none', handle: health },
    { method: 'GET', pattern: /^\/static\/([a-z0-9.-]+)$/, auth: 'none', handle: staticFile },
    { method: 'GET', pattern: /^\/login$/, auth: 'none', handle: loginForm },
    { method: 'POST', pattern: /^\/login$/, auth: 'none', writes: 'creates an owner session', handle: login },
    { method: 'POST', pattern: /^\/logout$/, auth: 'session', writes: 'ends the owner session', handle: logout },
    { method: 'POST', pattern: /^\/webhooks\/github$/, auth: 'none', writes: 'marks a brand cache stale (signed GitHub push only)', handle: webhook },
    { method: 'GET', pattern: /^\/$/, auth: 'session', handle: home },
    { method: 'GET', pattern: /^\/account$/, auth: 'session', handle: account },
    { method: 'GET', pattern: /^\/brands$/, auth: 'session', handle: brands },
    { method: 'GET', pattern: /^\/brands\/new$/, auth: 'session', handle: newBrandForm },
    { method: 'POST', pattern: /^\/brands\/new$/, auth: 'session', writes: 'provisions one new private brand repository (the single GitHub write)', handle: createBrand },
    { method: 'GET', pattern: new RegExp(`^/brands/${SLUG}/provisioning$`), auth: 'session', handle: provisioningStatus },
    { method: 'GET', pattern: new RegExp(`^/brands/${SLUG}/provisioning\\.json$`), auth: 'session', handle: provisioningJson },
    { method: 'POST', pattern: new RegExp(`^/brands/${SLUG}/provisioning/retry$`), auth: 'session', writes: 'retries a failed provisioning of a new repository', handle: retryProvisioning },
    { method: 'POST', pattern: new RegExp(`^/brands/${SLUG}/refresh$`), auth: 'session', writes: 'refreshes the Studio read cache from GitHub', handle: refresh },
    { method: 'GET', pattern: new RegExp(`^/brands/${SLUG}/assets/file/([0-9a-f]{64})$`), auth: 'session', handle: assetFile },
    { method: 'GET', pattern: new RegExp(`^/brands/${SLUG}(?:/(${BRAND_SECTIONS.join('|')}))?$`), auth: 'session', handle: brandPage },
  ]

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    securityHeaders(res, config.secureCookies)
    let url: URL
    try {
      url = new URL(req.url ?? '/', 'http://studio.invalid')
    } catch {
      res.statusCode = 400
      res.end()
      return
    }
    const cookies = parseCookies(req.headers.cookie)
    const method = req.method === 'HEAD' ? 'GET' : (req.method ?? 'GET')
    const lang = url.searchParams.get('lang')
    if (method === 'GET' && isLocale(lang)) {
      res.setHeader('Set-Cookie', serializeCookie(langCookie, lang, { secure: config.secureCookies, maxAgeSeconds: 365 * 86400 }))
      url.searchParams.delete('lang')
      const rest = url.searchParams.toString()
      return redirect(res, `${url.pathname}${rest ? `?${rest}` : ''}`, 302)
    }
    const locale: Locale = isLocale(cookies[langCookie]) ? (cookies[langCookie] as Locale) : 'en'
    const sessionId = cookies[sessionCookie] ?? null
    const session = sessions.get(sessionId ?? undefined)
    const ctx: RequestContext = { req, res, url, locale, i: i18n(locale), session, sessionId: session ? sessionId : null, form: {}, raw: Buffer.alloc(0) }
    const candidates = routes.filter((route) => route.pattern.test(url.pathname))
    const route = candidates.find((item) => item.method === method)
    try {
      if (!route) {
        if (candidates.length) {
          res.setHeader('Allow', [...new Set(candidates.map((item) => item.method))].join(', '))
          if (!session) return sendJson(res, 405, { error: 'method_not_allowed' })
          return render(ctx, 405, pages.errorPage(view(ctx), 'method'))
        }
        if (!session) return redirect(res, '/login', 302)
        return notFound(ctx)
      }
      if (route.auth === 'session' && !session) {
        // Guests learn nothing, not even whether a brand slug exists.
        if (method === 'GET' && !url.pathname.endsWith('.json')) return redirect(res, `/login?next=${encodeURIComponent(url.pathname)}`, 302)
        return sendJson(res, 401, { error: 'authentication_required' })
      }
      if (method === 'POST') {
        const isWebhook = route.handle === webhook
        try {
          ctx.raw = await readBody(req, isWebhook ? 1024 * 1024 : 32 * 1024)
        } catch (error) {
          if (error instanceof BodyTooLarge) return sendJson(res, 413, { error: 'too_large' })
          throw error
        }
        if (!isWebhook) {
          const type = req.headers['content-type'] ?? ''
          if (!type.startsWith('application/x-www-form-urlencoded')) return sendJson(res, 415, { error: 'unsupported_media_type' })
          ctx.form = parseForm(ctx.raw)
        }
        if (route.auth === 'session') {
          if (!sameOrigin(req) || !safeEqual(first(ctx.form._csrf), session!.csrf)) return render(ctx, 403, pages.errorPage(view(ctx), 'forbidden'))
        }
      }
      await route.handle(ctx, url.pathname.match(route.pattern)!)
    } catch (error) {
      log(`error on ${method} ${url.pathname}: ${error instanceof Error ? error.message : 'unknown'}`)
      if (!res.headersSent) {
        if (session) render(ctx, 500, pages.errorPage(view(ctx), 'server'))
        else sendJson(res, 500, { error: 'server_error' })
      } else res.end()
    }
  }

  return {
    handle,
    sessions,
    routes: routes.map((route) => ({ method: route.method, pattern: route.pattern.source, auth: route.auth, writes: route.writes ?? null })),
  }
}
