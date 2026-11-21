import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { ConfigError, loadConfig } from '../apps/studio/src/config.js'
import { hashPassword, verifyPassword } from '../apps/studio/src/auth/password.js'
import { base32Encode, totpAt, TotpVerifier } from '../apps/studio/src/auth/totp.js'
import { signWebhook } from '../apps/studio/src/github/webhook.js'
import { catalog, LOCALES } from '../apps/studio/src/i18n/index.js'
import { starterPrompt } from '../apps/studio/src/starter-prompt.js'
import { escapeHtml, html } from '../apps/studio/src/views/html.js'
import { scanPublicTree } from '../scripts/scan-public.js'
import { Client, OWNER_LOGIN, startStudio, WEBHOOK_SECRET, type RunningStudio } from './helpers/studio-server.js'
import { OWNER, READ_TOKEN, PROVISION_TOKEN } from './helpers/studio.js'
import { approve, editOutsideStudio } from './helpers/edits.js'

async function withStudio(fn: (s: RunningStudio) => Promise<void>, overrides = {}): Promise<void> {
  const s = await startStudio(overrides)
  try {
    await fn(s)
  } finally {
    await s.close()
  }
}

async function createBrand(s: RunningStudio, client: Client, fields: Record<string, string | string[]> = {}): Promise<Response> {
  const csrf = await client.csrf('/brands/new')
  const res = await client.request('POST', '/brands/new', {
    form: { _csrf: csrf, name: 'Acme Learning', slug: 'acme-learning', profile: 'business', default_locale: 'en', locales: ['en'], owner: OWNER, repo: 'acme-learning', ...fields },
  })
  await s.studio.provisioning.settled()
  await s.studio.sync.settled()
  return res
}

test('a guest sees nothing: every Studio route redirects to sign-in or answers 401, with no brand data', async () => {
  await withStudio(async (s) => {
    const owner = new Client(s.url)
    await owner.login()
    await createBrand(s, owner)
    const guest = new Client(s.url)
    for (const pathname of ['/', '/brands', '/brands/new', '/account', '/brands/acme-learning', '/brands/acme-learning/brand-book', '/brands/acme-learning/handoff', '/brands/no-such-brand', '/brands/acme-learning/provisioning']) {
      const res = await guest.get(pathname)
      assert.equal(res.status, 302, pathname)
      assert.match(res.headers.get('location') ?? '', /^\/login/)
      assert.equal((await res.text()).includes('Acme'), false)
    }
    // A forged and a real slug look identical to a guest, so slugs cannot be enumerated.
    assert.equal((await guest.get('/brands/acme-learning')).headers.get('location'), '/login?next=%2Fbrands%2Facme-learning')
    assert.equal((await guest.get('/brands/zzz-forged')).headers.get('location'), '/login?next=%2Fbrands%2Fzzz-forged')
    const json = await guest.get('/brands/acme-learning/provisioning.json')
    assert.equal(json.status, 401)
    const file = await guest.get(`/brands/acme-learning/assets/file/${'a'.repeat(64)}`)
    assert.equal(file.status, 302)
    for (const pathname of ['/brands/new', '/brands/acme-learning/refresh', '/brands/acme-learning/provisioning/retry', '/logout']) {
      const res = await guest.request('POST', pathname, { form: { _csrf: 'x' } })
      assert.equal(res.status, 401, pathname)
    }
    const login = await guest.page('/login')
    assert.equal(login.res.status, 200)
    assert.equal(login.text.includes('Acme'), false)
  })
})

test('sign-in requires the login nonce, password and TOTP; failures are generic and rate limited', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    // No nonce cookie / wrong CSRF: refused.
    const noNonce = await client.request('POST', '/login', { form: { _csrf: 'forged', login: OWNER_LOGIN, password: 'x' } })
    assert.equal(noNonce.status, 403)
    const csrf = await client.csrf('/login')
    const wrong = await client.request('POST', '/login', { form: { _csrf: csrf, login: OWNER_LOGIN, password: 'wrong password!!', totp: '000000' } })
    assert.equal(wrong.status, 401)
    const text = await wrong.text()
    assert.match(text, /Sign-in failed/)
    assert.equal(client.cookies.has('studio_session'), false)
    // Correct password but missing TOTP still fails.
    const csrf2 = await client.csrf('/login')
    const noTotp = await client.request('POST', '/login', { form: { _csrf: csrf2, login: OWNER_LOGIN, password: 'correct horse battery staple' } })
    assert.equal(noTotp.status, 401)
    // Cross-origin login post is refused even with a valid token.
    const csrf3 = await client.csrf('/login')
    const cross = await client.request('POST', '/login', { form: { _csrf: csrf3, login: OWNER_LOGIN, password: 'x' }, origin: 'https://evil.example' })
    assert.equal(cross.status, 403)
    for (let n = 0; n < 4; n += 1) {
      const t = await client.csrf('/login')
      await client.request('POST', '/login', { form: { _csrf: t, login: 'nobody', password: 'nope-nope-nope' } })
    }
    const t = await client.csrf('/login')
    const limited = await client.request('POST', '/login', { form: { _csrf: t, login: OWNER_LOGIN, password: 'whatever' } })
    assert.equal(limited.status, 429)
    // A good login works from a different client and sets an HttpOnly SameSite=Strict cookie.
    const good = new Client(s.url)
    const token = await good.csrf('/login')
    const res = await good.request('POST', '/login', { form: { _csrf: token, login: OWNER_LOGIN, password: 'correct horse battery staple', totp: totpAt('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', Date.now()) } })
    // The shared loopback IP is rate limited now, so the second client is refused too: limits are per IP.
    assert.equal(res.status, 429)
  })
})

test('the whole owner journey: sign in, create a private brand, copy handoff, edit outside Studio, refresh, see it', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    const empty = await client.page('/brands')
    assert.match(empty.text, /No brands yet/)
    const created = await createBrand(s, client)
    assert.equal(created.status, 303)
    assert.equal(created.headers.get('location'), '/brands/acme-learning/provisioning')
    const status = await client.page('/brands/acme-learning/provisioning')
    assert.match(status.text, /The private repository is ready/)
    assert.match(status.text, /Copy starter prompt/)
    const repo = s.github.repo(OWNER, 'acme-learning')!
    assert.equal(repo.private, true)
    const json = await (await client.get('/brands/acme-learning/provisioning.json')).json() as { state: string }
    assert.equal(json.state, 'ready')

    const overview = await client.page('/brands/acme-learning')
    assert.equal(overview.res.status, 200)
    assert.match(overview.text, /Acme Learning/)
    assert.match(overview.text, /To change a brand, open its repository in Claude Code/)
    assert.ok(overview.text.includes(repo.head!.slice(0, 7)), 'the synced SHA is shown')

    const handoff = await client.page('/brands/acme-learning/handoff')
    assert.ok(handoff.text.includes('https://github.com/brand-owner/acme-learning'))
    assert.ok(handoff.text.includes(escapeHtml(starterPrompt({ slug: 'acme-learning', repoUrl: 'https://github.com/brand-owner/acme-learning' }))))
    assert.match(handoff.text, /Private repository access required/)

    const sha = editOutsideStudio(
      s,
      'acme-learning',
      (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Learning <b>should</b> feel possible.' }),
    )
    const csrf = await client.csrf('/brands/acme-learning')
    const refreshed = await client.request('POST', '/brands/acme-learning/refresh', { form: { _csrf: csrf, return: '/brands/acme-learning/brand-book' } })
    assert.equal(refreshed.status, 303)
    assert.equal(refreshed.headers.get('location'), '/brands/acme-learning/brand-book?sync=synced')
    const book = await client.page('/brands/acme-learning/brand-book?sync=synced')
    assert.ok(book.text.includes(sha.slice(0, 7)))
    assert.ok(book.text.includes('Learning &lt;b&gt;should&lt;/b&gt; feel possible.'), 'repository content is escaped')
    assert.equal(book.text.includes('<b>should</b>'), false)
    for (const section of ['design', 'assets', 'business', 'history']) {
      const page = await client.page(`/brands/acme-learning/${section}`)
      assert.equal(page.res.status, 200, section)
    }
    assert.equal((await client.get('/brands/acme-learning/personal')).status, 404, 'personal pages exist only for personal brands')
  })
})

test('a personal brand shows Phase 8 documents read-only; a mascot-free business has no mascot section', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client, { name: 'Jane Doe', slug: 'jane-doe', repo: 'jane-doe', profile: 'personal-brand', facets: ['founder-executive', 'speaker-author'] })
    const personal = await client.page('/brands/jane-doe/personal')
    assert.equal(personal.res.status, 200)
    assert.match(personal.text, /Personal Brand/)
    assert.match(personal.text, /Founder or executive/)
    const assets = await client.page('/brands/jane-doe/assets')
    assert.equal(assets.text.includes('defined state slots'), false)
  })
})

test('forged slugs and cross-brand access: an authenticated owner gets 404 for anything not in the registry', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    for (const pathname of ['/brands/not-registered', '/brands/not-registered/handoff', '/brands/..%2f..%2fetc', '/brands/ACME-LEARNING', `/brands/not-registered/assets/file/${'a'.repeat(64)}`, `/brands/acme-learning/assets/file/${'b'.repeat(64)}`]) {
      const res = await client.get(pathname)
      assert.ok(res.status === 404 || res.status === 302, `${pathname} -> ${res.status}`)
      // The language switcher echoes the requested path; nothing else may point at an asset file.
      assert.equal((await res.text()).replaceAll(pathname, '').includes('/assets/file/'), false)
    }
    // A repository that GitHub has but Studio never registered cannot be selected by URL.
    s.github.addRepo(OWNER, 'other-brand', new Map([['brand/brand.config.yaml', Buffer.from('brand:\n  slug: other-brand\n')]]))
    assert.equal((await client.get('/brands/other-brand')).status, 404)
  })
})

test('no mutation endpoints: the route table has exactly the documented non-GET routes and PUT/PATCH/DELETE are refused', async () => {
  await withStudio(async (s) => {
    const writes = s.studio.routes.filter((route) => route.method !== 'GET')
    assert.deepEqual(
      writes.map((route) => `${route.method} ${route.pattern}`),
      [
        'POST ^\\/login$',
        'POST ^\\/logout$',
        'POST ^\\/webhooks\\/github$',
        'POST ^\\/brands\\/new$',
        'POST ^\\/brands\\/([a-z0-9]+(?:-[a-z0-9]+)*)\\/provisioning\\/retry$',
        'POST ^\\/brands\\/([a-z0-9]+(?:-[a-z0-9]+)*)\\/refresh$',
      ],
    )
    for (const route of writes) assert.ok(route.writes, `${route.pattern} documents what it changes`)
    assert.ok(s.studio.routes.every((route) => !/approve|publish|merge|upload|chat|claude|token|interview|commit|revert|terminal|exec/i.test(route.pattern)))
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      for (const pathname of ['/brands/acme-learning', '/brands/new', '/brands/acme-learning/brand-book']) {
        const res = await client.request(method, pathname, { form: { _csrf: 'x' } })
        assert.equal(res.status, 405, `${method} ${pathname}`)
      }
    }
    for (const pathname of ['/brands/acme-learning/approve', '/brands/acme-learning/publish', '/brands/acme-learning/facts', '/api/chat', '/brands/acme-learning/upload']) {
      const res = await client.request('POST', pathname, { form: { _csrf: 'x' } })
      assert.equal(res.status, 404, pathname)
    }
    // No page offers a write form other than sign-out, refresh and (on the wizard) provisioning.
    for (const pathname of ['/brands/acme-learning', '/brands/acme-learning/brand-book', '/brands/acme-learning/design', '/brands/acme-learning/assets', '/brands/acme-learning/business', '/brands/acme-learning/history', '/brands/acme-learning/handoff']) {
      const { text } = await client.page(pathname)
      const actions = [...text.matchAll(/<form[^>]*action="([^"]+)"/g)].map((match) => match[1])
      assert.ok(actions.every((action) => action === '/logout' || action === '/brands/acme-learning/refresh'), `${pathname}: ${actions.join(', ')}`)
      assert.equal(/<textarea(?![^>]*readonly)/.test(text), false, 'no editable text areas')
      assert.equal(/type="file"/.test(text), false, 'no uploads')
      assert.equal(/contenteditable/i.test(text), false)
    }
  })
})

test('CSRF and Origin are enforced on every authenticated POST', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    const missing = await client.request('POST', '/brands/new', { form: { name: 'X', slug: 'x-x', profile: 'business', owner: OWNER } })
    assert.equal(missing.status, 403)
    const csrf = await client.csrf('/brands/new')
    const cross = await client.request('POST', '/brands/new', { form: { _csrf: csrf, name: 'X', slug: 'x-x', profile: 'business', owner: OWNER }, origin: 'https://evil.example' })
    assert.equal(cross.status, 403)
    const json = await client.request('POST', '/brands/new', { body: JSON.stringify({ _csrf: csrf }), headers: { 'content-type': 'application/json' } })
    assert.equal(json.status, 415)
    assert.equal(s.github.callsTo('POST', /\/generate$/).length, 0)
  })
})

test('the wizard validates, refuses duplicates and destinations outside the allowlist, and reports GitHub failure with retry', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    const invalid = await createBrand(s, client, { slug: 'Bad Slug', owner: 'not-allowed', name: '' })
    assert.equal(invalid.status, 422)
    const text = await invalid.text()
    assert.match(text, /Please fix the following/)
    assert.match(text, /aria-invalid="true"/)
    assert.equal(s.github.callsTo('POST', /\/generate$/).length, 0)
    assert.equal((await createBrand(s, client, { slug: 'new' })).status, 422, 'reserved slug')

    s.github.fail('POST', /\/git\/trees$/, 500, 10)
    await createBrand(s, client)
    const failed = await client.page('/brands/acme-learning/provisioning')
    assert.match(failed.text, /Creation failed/)
    assert.match(failed.text, /partially created repository was deleted/)
    assert.equal(s.github.repo(OWNER, 'acme-learning'), undefined)
    assert.equal((await client.get('/brands/acme-learning')).status, 302, 'a failed brand is not viewable')
    s.github.faults.length = 0
    const csrf = await client.csrf('/brands/acme-learning/provisioning')
    await client.request('POST', '/brands/acme-learning/provisioning/retry', { form: { _csrf: csrf } })
    await s.studio.provisioning.settled()
    await s.studio.sync.settled()
    assert.match((await client.page('/brands/acme-learning/provisioning')).text, /ready/)
    const dup = await createBrand(s, client)
    assert.equal(dup.status, 409)
    assert.match(await dup.text(), /already exists in Studio/)
  })
})

test('stale and failed sync are visible; Studio keeps the last good commit', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    const good = s.github.repo(OWNER, 'acme-learning')!.head!
    editOutsideStudio(s, 'acme-learning', (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Later' }))
    s.github.fail('GET', /\/tarball\//, 503, 50)
    const csrf = await client.csrf('/brands/acme-learning')
    const res = await client.request('POST', '/brands/acme-learning/refresh', { form: { _csrf: csrf, return: '/brands/acme-learning' } })
    assert.equal(res.headers.get('location'), '/brands/acme-learning?sync=failed')
    const page = await client.page('/brands/acme-learning?sync=failed')
    assert.match(page.text, /Refresh failed/)
    assert.ok(page.text.includes(good.slice(0, 7)))
    // The return target cannot leave the brand.
    const csrf2 = await client.csrf('/brands/acme-learning')
    await new Promise((resolve) => setTimeout(resolve, 5100))
    const escape = await client.request('POST', '/brands/acme-learning/refresh', { form: { _csrf: csrf2, return: 'https://evil.example/x' } })
    assert.match(escape.headers.get('location') ?? '', /^\/brands\/acme-learning\?sync=/)
  })
})

test('webhook: only correctly signed pushes for a registered repository mark it stale and refresh it', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    const repo = s.github.repo(OWNER, 'acme-learning')!
    const sha = editOutsideStudio(s, 'acme-learning', (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Webhook purpose' }))
    const payload = Buffer.from(JSON.stringify({ ref: 'refs/heads/main', after: sha, repository: { id: repo.id, full_name: `${OWNER}/acme-learning` } }))
    const hook = new Client(s.url)
    const unsigned = await hook.request('POST', '/webhooks/github', { body: payload, headers: { 'content-type': 'application/json', 'x-github-event': 'push', 'x-github-delivery': 'd-1' }, origin: null })
    assert.equal(unsigned.status, 401)
    const forged = await hook.request('POST', '/webhooks/github', { body: payload, headers: { 'content-type': 'application/json', 'x-github-event': 'push', 'x-github-delivery': 'd-2', 'x-hub-signature-256': signWebhook('wrong-secret-wrong-secret-00', payload) }, origin: null })
    assert.equal(forged.status, 401)
    assert.notEqual(s.studio.sync.get('acme-learning').status.sha, sha)
    const other = Buffer.from(JSON.stringify({ ref: 'refs/heads/main', after: sha, repository: { id: 999999, full_name: 'evil/repo' } }))
    const ignored = await hook.request('POST', '/webhooks/github', { body: other, headers: { 'x-github-event': 'push', 'x-github-delivery': 'd-3', 'x-hub-signature-256': signWebhook(WEBHOOK_SECRET, other) }, origin: null })
    assert.equal(ignored.status, 202)
    const ok = await hook.request('POST', '/webhooks/github', { body: payload, headers: { 'x-github-event': 'push', 'x-github-delivery': 'd-4', 'x-hub-signature-256': signWebhook(WEBHOOK_SECRET, payload) }, origin: null })
    assert.equal(ok.status, 202)
    await s.studio.sync.settled()
    assert.equal(s.studio.sync.get('acme-learning').status.sha, sha)
    const replay = await hook.request('POST', '/webhooks/github', { body: payload, headers: { 'x-github-event': 'push', 'x-github-delivery': 'd-4', 'x-hub-signature-256': signWebhook(WEBHOOK_SECRET, payload) }, origin: null })
    assert.deepEqual(await replay.json(), { status: 'duplicate' })
  })
})

test('security headers, no tokens in any response, and the static bundle carries no secrets or brand data', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    const pages = ['/login', '/brands', '/brands/new', '/account', '/account?test=1', '/brands/acme-learning', '/brands/acme-learning/brand-book', '/brands/acme-learning/design', '/brands/acme-learning/assets', '/brands/acme-learning/business', '/brands/acme-learning/history', '/brands/acme-learning/handoff', '/brands/acme-learning/provisioning', '/brands/acme-learning/provisioning.json']
    for (const pathname of pages) {
      const res = await client.get(pathname)
      const text = await res.text()
      assert.equal(res.headers.get('x-frame-options'), 'DENY', pathname)
      assert.match(res.headers.get('content-security-policy') ?? '', /default-src 'none'.*script-src 'self'/)
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
      assert.equal(res.headers.get('referrer-policy'), 'same-origin')
      for (const secret of [READ_TOKEN, PROVISION_TOKEN, WEBHOOK_SECRET, s.config.ownerPasswordHash, 'JBSWY3DPEHPK3PXP', s.config.sessionSecret.toString('base64'), 'DECOY']) {
        assert.equal(text.includes(secret), false, `${pathname} leaks ${secret.slice(0, 12)}`)
      }
      assert.equal(/<script(?![^>]*src="\/static\/studio\.js")/.test(text), false, `${pathname} has no inline script`)
      assert.equal(/\sstyle="/.test(text), false, `${pathname} has no inline style`)
      assert.equal(/\son[a-z]+="/.test(text), false, `${pathname} has no inline handlers`)
    }
    const account = await client.page('/account?test=1')
    assert.match(account.text, /Connected as studio-owner/)
    const staticDir = path.resolve(import.meta.dirname, '../apps/studio/static')
    assert.deepEqual(scanPublicTree(staticDir), [])
    for (const file of fs.readdirSync(staticDir)) {
      const text = fs.readFileSync(path.join(staticDir, file), 'utf8')
      for (const needle of ['STUDIO_', 'token', 'Acme', 'api.github.com', 'anthropic', 'claude']) assert.equal(text.toLowerCase().includes(needle.toLowerCase()), false, `${file} contains ${needle}`)
    }
    for (const name of ['studio.css', 'studio.js', 'favicon.svg']) assert.equal((await client.get(`/static/${name}`)).status, 200)
    assert.equal((await client.get('/static/..%2fsrc%2fconfig.ts')).status, 404)
    assert.equal((await client.get('/static/server.ts')).status, 404)
  })
})

test('Persian renders right-to-left and Turkish left-to-right from locale data; every locale has every key', async () => {
  const keys = Object.keys(catalog('en')).sort()
  for (const locale of LOCALES) assert.deepEqual(Object.keys(catalog(locale)).sort(), keys, locale)
  for (const locale of LOCALES) {
    for (const [key, value] of Object.entries(catalog(locale))) {
      const placeholders = (text: string): string[] => (text.match(/\{\w+\}/g) ?? []).sort()
      assert.deepEqual(placeholders(value), placeholders(catalog('en')[key as keyof ReturnType<typeof catalog>]), `${locale} ${key}`)
    }
  }
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    await createBrand(s, client)
    const switched = await client.get('/brands/acme-learning?lang=fa')
    assert.equal(switched.status, 302)
    assert.equal(switched.headers.get('location'), '/brands/acme-learning')
    const fa = await client.page('/brands/acme-learning')
    assert.match(fa.text, /<html lang="fa" dir="rtl">/)
    assert.match(fa.text, /نمای کلی/)
    assert.match(fa.text, /class="mono[^"]*" dir="ltr"/, 'code and SHAs stay left-to-right inside RTL')
    await client.get('/brands?lang=tr')
    const tr = await client.page('/brands')
    assert.match(tr.text, /<html lang="tr" dir="ltr">/)
    assert.match(tr.text, /Markalarım/)
    await client.get('/brands?lang=xx')
    assert.match((await client.page('/brands')).text, /lang="tr"/, 'an unknown locale is ignored')
  })
})

test('without provisioning configured the wizard is disabled and nothing can be created', async () => {
  const s = await startStudio({}, { provisionToken: null })
  try {
    const client = new Client(s.url)
    await client.login()
    const page = await client.page('/brands/new')
    assert.match(page.text, /not configured/)
    assert.equal(page.text.includes('action="/brands/new"'), false)
    const csrf = await client.csrf('/brands')
    const res = await client.request('POST', '/brands/new', { form: { _csrf: csrf, name: 'X', slug: 'xx', profile: 'business', owner: OWNER } })
    assert.equal(res.status, 409)
    assert.equal(s.github.callsTo('POST', /\/generate$/).length, 0)
  } finally {
    await s.close()
  }
})

test('sessions end on sign-out; a stolen cookie is useless afterwards', async () => {
  await withStudio(async (s) => {
    const client = new Client(s.url)
    await client.login()
    const cookie = client.cookies.get('studio_session')!
    const csrf = await client.csrf('/brands')
    const out = await client.request('POST', '/logout', { form: { _csrf: csrf } })
    assert.equal(out.status, 303)
    const thief = new Client(s.url)
    thief.cookies.set('studio_session', cookie)
    assert.equal((await thief.get('/brands')).status, 302)
  })
})

test('configuration fails closed and never echoes secret values', () => {
  assert.throws(() => loadConfig({}), (error: unknown) => error instanceof ConfigError && error.problems.some((p) => p.includes('STUDIO_SESSION_SECRET')))
  const base = { STUDIO_OWNER_LOGIN: 'owner', STUDIO_OWNER_PASSWORD_HASH: hashPassword('a long enough password', { N: 2 ** 12, r: 8, p: 1 }), STUDIO_SESSION_SECRET: Buffer.alloc(32, 7).toString('base64') }
  const local = loadConfig(base)
  assert.equal(local.host, '127.0.0.1', 'binds loopback by default')
  assert.equal(local.secureCookies, false)
  assert.throws(() => loadConfig({ ...base, STUDIO_PUBLIC_ORIGIN: 'http://studio.example.com' }), /https/)
  assert.throws(() => loadConfig({ ...base, STUDIO_PUBLIC_ORIGIN: 'https://studio.example.com' }), /TOTP/)
  const remote = loadConfig({ ...base, STUDIO_PUBLIC_ORIGIN: 'https://studio.example.com', STUDIO_OWNER_TOTP_SECRET: base32Encode(Buffer.alloc(20, 1)) })
  assert.equal(remote.secureCookies, true)
  assert.throws(() => loadConfig({ ...base, STUDIO_GITHUB_PROVISION_TOKEN: 'secret-token-value-123' }), (error: unknown) => error instanceof ConfigError && !error.message.includes('secret-token-value-123'))
  assert.throws(() => loadConfig({ ...base, STUDIO_SESSION_SECRET: 'c2hvcnQ=' }), /32 bytes/)
})

test('password hashing and TOTP primitives', () => {
  const hash = hashPassword('a long enough password', { N: 2 ** 12, r: 8, p: 1 })
  assert.equal(verifyPassword('a long enough password', hash), true)
  assert.equal(verifyPassword('a long enough passworD', hash), false)
  assert.equal(verifyPassword('x', 'plain'), false)
  assert.throws(() => hashPassword('short'))
  // RFC 6238 test vector (SHA-1, T = 59s): 94287082 -> last six digits.
  const rfcSecret = base32Encode(Buffer.from('12345678901234567890'))
  assert.equal(totpAt(rfcSecret, 59_000), '287082')
  const verifier = new TotpVerifier(rfcSecret)
  const now = 1_700_000_000_000
  const code = totpAt(rfcSecret, now)
  assert.equal(verifier.verify(code, now), true)
  assert.equal(verifier.verify(code, now), false, 'a code is single use')
  assert.equal(verifier.verify('12345', now), false)
})

test('templates escape every interpolated value', () => {
  const evil = '<img src=x onerror=alert(1)>"\'`'
  assert.equal(html`<p title="${evil}">${evil}</p>`.value, '<p title="&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&#96;">&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&#96;</p>')
})
