import assert from 'node:assert/strict'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { totpAt } from '../apps/studio/src/auth/totp.js'
import { Browser, findChrome, type Page } from './helpers/browser.js'
import { approve, editOutsideStudio } from './helpers/edits.js'
import { OWNER_LOGIN, OWNER_PASSWORD, startStudio, TOTP_SECRET, type RunningStudio } from './helpers/studio-server.js'
import { OWNER } from './helpers/studio.js'

/**
 * Browser end-to-end tests: a real headless Chrome drives Studio (loopback server, in-memory GitHub,
 * no network). They cover what HTTP-level tests cannot: the progressive-enhancement script, focus and
 * keyboard behavior, CSP enforcement in a real engine, responsive layout and RTL mirroring.
 *
 * Without Chrome they skip with a reason; STUDIO_E2E_REQUIRED=1 turns a missing browser into a failure.
 * STUDIO_E2E_SCREENSHOTS=<dir> saves desktop/tablet/mobile screenshots in English and Persian for review.
 */
const chrome = findChrome()
if (!chrome && process.env.STUDIO_E2E_REQUIRED === '1') throw new Error('STUDIO_E2E_REQUIRED=1 but no Chrome was found (set CHROME_PATH).')
const skip = chrome ? false : 'no Chrome/Chromium found (set CHROME_PATH); browser E2E skipped'
const shots = process.env.STUDIO_E2E_SCREENSHOTS ? path.resolve(process.env.STUDIO_E2E_SCREENSHOTS) : null

let browser: Browser
let s: RunningStudio
let page: Page

before(async () => {
  if (!chrome) return
  browser = await Browser.launch(chrome)
  s = await startStudio()
  page = await browser.newPage()
  await page.viewport(1440, 900)
})

after(async () => {
  if (!chrome) return
  // Close the browser first: its keep-alive connections would otherwise hold the server open.
  page?.close()
  await browser?.close()
  await s?.close()
})

/** Every page must render with no console error, uncaught exception or CSP violation. */
function assertClean(where: string): void {
  assert.deepEqual(page.problems, [], `${where}: browser problems`)
}

async function text(selector: string): Promise<string> {
  return page.eval<string>(`(document.querySelector(${JSON.stringify(selector)})?.textContent ?? '').replace(/\\s+/g, ' ').trim()`)
}

/** No horizontal scrolling: nothing may overflow the viewport width. */
async function assertNoOverflow(where: string): Promise<void> {
  const widths = await page.eval<{ scroll: number; client: number }>(`({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })`)
  assert.ok(widths.scroll <= widths.client + 1, `${where}: horizontal overflow ${widths.scroll} > ${widths.client}`)
}

/** Static accessibility checks run in the rendered DOM. */
async function assertAccessible(where: string): Promise<void> {
  const issues = await page.eval<string[]>(`(() => {
    const issues = []
    const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim() || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('')
    for (const el of document.querySelectorAll('button, a[href]')) if (!name(el) && !el.querySelector('.visually-hidden')) issues.push('unnamed control: ' + el.outerHTML.slice(0, 120))
    for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      const labelled = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      if (!labelled) issues.push('unlabelled field: ' + el.outerHTML.slice(0, 120))
    }
    for (const el of document.querySelectorAll('img')) if (!el.hasAttribute('alt')) issues.push('img without alt: ' + el.outerHTML.slice(0, 120))
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id)
    for (const id of new Set(ids)) if (ids.filter((x) => x === id).length > 1) issues.push('duplicate id: ' + id)
    if (document.querySelectorAll('h1').length !== 1) issues.push('expected exactly one h1, found ' + document.querySelectorAll('h1').length)
    if (!document.documentElement.lang) issues.push('no lang on html')
    if (!document.querySelector('main')) issues.push('no main landmark')
    return issues
  })()`)
  assert.deepEqual(issues, [], `${where}: accessibility issues`)
}

async function capture(name: string): Promise<void> {
  if (!shots) return
  for (const [label, width, height, mobile] of [['desktop', 1440, 900, false], ['tablet', 1024, 768, false], ['mobile', 390, 844, true]] as const) {
    await page.viewport(width, height, mobile)
    await page.screenshot(path.join(shots, `${name}-${label}.png`))
  }
  await page.viewport(1440, 900)
}

test('owner journey in a real browser: sign in, step through the wizard, watch provisioning, copy the starter prompt', { skip }, async () => {
  await page.goto(`${s.url}/brands`)
  assert.match(await page.eval<string>('location.pathname'), /^\/login$/)
  await assertAccessible('login')
  await capture('login')
  await page.type('#login', OWNER_LOGIN)
  await page.type('#password', OWNER_PASSWORD)
  await page.type('#totp', totpAt(TOTP_SECRET, Date.now()))
  await page.navigation(() => page.click('button[type=submit]'))
  assert.equal(await page.eval<string>('location.pathname'), '/brands')
  assert.match(await text('main'), /No brands yet/)
  await assertAccessible('brands (empty)')
  await capture('brands-empty')
  assertClean('sign-in')

  await page.navigation(() => page.click('main a[href="/brands/new"]'))
  // The script turns the form into steps: only the first is visible, with Next/Back navigation.
  await page.waitFor(`!document.querySelector('[data-wizard-nav]').hidden`)
  assert.deepEqual(await page.eval<boolean[]>(`[...document.querySelectorAll('[data-step]')].map((s) => s.hidden)`), [false, true, true, true, true])
  await assertAccessible('wizard')
  await capture('wizard')
  // Next refuses an empty required name, using the browser's own validation.
  await page.click('[data-wizard-next]')
  assert.equal(await page.eval<boolean>(`document.querySelector('[data-step="basics"]').hidden`), false)
  await page.type('#name', 'Acme Learning')
  assert.equal(await page.eval<string>(`document.querySelector('#slug').value`), 'acme-learning', 'the slug follows the name')
  await page.click('[data-wizard-next]')
  assert.equal(await page.eval<boolean>(`document.querySelector('[data-step="profile"]').hidden`), false)
  assert.equal(await page.eval<string>('document.activeElement.name'), 'profile', 'focus moves into the new step')
  await page.click('[data-wizard-next]')
  await page.click('[data-wizard-next]')
  assert.equal(await page.eval<string>(`document.querySelector('#repo').value`), 'acme-learning')
  await page.click('[data-wizard-next]')
  assert.equal(await text('[data-review-field="repo"]'), `${OWNER}/acme-learning`)
  assert.equal(await text('[data-review-field="profile"]'), 'Business or startup')
  assert.equal(await page.eval<boolean>(`document.querySelector('[data-wizard-next]').hidden`), true)
  await page.navigation(() => page.click('[data-submit]'))
  assert.equal(await page.eval<string>('location.pathname'), '/brands/acme-learning/provisioning')
  // Provisioning runs against the in-memory GitHub; the page polls its JSON and reloads when done.
  await s.studio.provisioning.settled()
  await page.waitFor(`document.querySelector('[data-provisioning]')?.getAttribute('data-state') === 'ready'`, 20_000)
  await s.studio.sync.settled()
  assert.match(await text('main'), /The private repository is ready/)
  assert.equal(s.github.repo(OWNER, 'acme-learning')?.private, true)
  await assertAccessible('provisioning')
  await capture('provisioning-ready')

  // Copy buttons put the exact text on the clipboard (or select it) and announce the result.
  await page.click('[data-copy-target]')
  await page.waitFor(`document.querySelector('[data-toast-region] .toast')`)
  assert.match(await text('[data-toast-region]'), /Copied|Press/)
  assertClean('wizard and provisioning')
})

test('every brand page renders cleanly, without overflow, at desktop, tablet and mobile widths', { skip }, async () => {
  editOutsideStudio(s, 'acme-learning', (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Learning should feel possible.' }))
  await s.studio.sync.refresh('acme-learning')
  const pages = ['', '/brand-book', '/design', '/assets', '/business', '/history', '/handoff']
  for (const [width, height, mobile] of [[1440, 900, false], [1024, 768, false], [390, 844, true]] as const) {
    await page.viewport(width, height, mobile)
    for (const section of pages) {
      await page.goto(`${s.url}/brands/acme-learning${section}`)
      await assertNoOverflow(`${section || '/'} @${width}`)
      if (width === 1440) await assertAccessible(section || 'overview')
    }
    for (const other of ['/brands', '/brands/new', '/account']) {
      await page.goto(`${s.url}${other}`)
      await assertNoOverflow(`${other} @${width}`)
    }
  }
  await page.viewport(1440, 900)
  for (const section of pages) {
    await page.goto(`${s.url}/brands/acme-learning${section}`)
    await capture(`brand${section.replace('/', '-') || '-overview'}`)
  }
  for (const other of ['brands', 'account']) {
    await page.goto(`${s.url}/${other}`)
    await capture(other)
  }
  // The canonical commit is visible on every brand page.
  const sha = s.studio.sync.get('acme-learning').status.sha!
  await page.goto(`${s.url}/brands/acme-learning`)
  assert.ok((await text('.topbar')).includes(sha.slice(0, 7)))
  assertClean('brand pages')
})

test('keyboard: skip link first, visible focus, and the mobile drawer opens, traps Escape and returns focus', { skip }, async () => {
  await page.viewport(1440, 900)
  await page.goto(`${s.url}/brands/acme-learning`)
  await page.press('Tab')
  assert.equal(await page.eval<string>('document.activeElement.className'), 'skip-link')
  assert.equal(await page.eval<boolean>(`(() => { const r = document.activeElement.getBoundingClientRect(); return r.width > 0 && r.top >= 0 })()`), true, 'the skip link becomes visible on focus')
  await page.press('Enter')
  assert.equal(await page.eval<string>('document.activeElement.id'), 'main')
  await page.press('Tab')
  const outline = await page.eval<string>(`getComputedStyle(document.activeElement).outlineStyle`)
  assert.notEqual(outline, 'none', 'focused controls show a focus ring')

  await page.viewport(390, 844, true)
  await page.goto(`${s.url}/brands/acme-learning/handoff`)
  const offscreen = await page.eval<boolean>(`(() => { const r = document.getElementById('sidebar').getBoundingClientRect(); return r.right <= 0 || r.left >= innerWidth || getComputedStyle(document.getElementById('sidebar')).visibility === 'hidden' })()`)
  assert.equal(offscreen, true, 'the sidebar is a closed drawer on mobile')
  await page.click('[data-drawer-open]')
  await page.waitFor(`document.getElementById('sidebar').classList.contains('is-open')`)
  assert.equal(await page.eval<string>(`document.querySelector('[data-drawer-open]').getAttribute('aria-expanded')`), 'true')
  assert.equal(await page.eval<boolean>(`document.getElementById('sidebar').contains(document.activeElement)`), true, 'focus moves into the drawer')
  await page.press('Escape')
  await page.waitFor(`!document.getElementById('sidebar').classList.contains('is-open')`)
  assert.equal(await page.eval<boolean>(`document.activeElement.matches('[data-drawer-open]')`), true, 'focus returns to the menu button')
  // The handoff copy actions are reachable and usable on a phone.
  await assertNoOverflow('handoff @390')
  assert.equal(await page.eval<number>(`document.querySelectorAll('[data-copy-target]').length`) >= 2, true)
  await page.viewport(1440, 900)
  assertClean('keyboard')
})

test('Persian mirrors the layout right-to-left while code, SHAs and URLs stay left-to-right; Turkish stays LTR', { skip }, async () => {
  await page.viewport(1440, 900)
  await page.goto(`${s.url}/brands/acme-learning?lang=en`)
  const enSidebar = await page.eval<{ left: number; right: number }>(`(() => { const r = document.getElementById('sidebar').getBoundingClientRect(); return { left: r.left, right: r.right } })()`)
  assert.ok(enSidebar.left < 10, 'English: the sidebar is on the left')

  await page.goto(`${s.url}/brands/acme-learning?lang=fa`)
  assert.equal(await page.eval<string>('document.documentElement.dir'), 'rtl')
  const faSidebar = await page.eval<{ left: number; right: number; width: number }>(`(() => { const r = document.getElementById('sidebar').getBoundingClientRect(); return { left: r.left, right: r.right, width: document.documentElement.clientWidth } })()`)
  assert.ok(faSidebar.right > faSidebar.width - 10, 'Persian: the sidebar is mirrored to the right')
  const directions = await page.eval<string[]>(`[...document.querySelectorAll('.mono, code')].map((el) => getComputedStyle(el).direction)`)
  assert.ok(directions.length > 0 && directions.every((dir) => dir === 'ltr'), 'code stays left-to-right inside RTL')
  const align = await page.eval<string>(`getComputedStyle(document.querySelector('h1')).textAlign`)
  assert.ok(align === 'start' || align === 'right', `headings align to the start (right) in RTL, got ${align}`)
  for (const section of ['', '/brand-book', '/design', '/handoff']) {
    await page.goto(`${s.url}/brands/acme-learning${section}`)
    await assertNoOverflow(`fa ${section || '/'}`)
    await capture(`fa-brand${section.replace('/', '-') || '-overview'}`)
  }
  await page.goto(`${s.url}/brands/new`)
  await capture('fa-wizard')
  await page.viewport(390, 844, true)
  await page.goto(`${s.url}/brands/acme-learning`)
  await page.click('[data-drawer-open]')
  await page.waitFor(`document.getElementById('sidebar').classList.contains('is-open')`)
  const drawer = await page.eval<{ left: number; right: number; width: number }>(`(() => { const r = document.getElementById('sidebar').getBoundingClientRect(); return { left: r.left, right: r.right, width: document.documentElement.clientWidth } })()`)
  assert.ok(drawer.right > drawer.width - 2, 'Persian: the mobile drawer opens from the right')
  await page.press('Escape')

  await page.viewport(1440, 900)
  await page.goto(`${s.url}/brands?lang=tr`)
  assert.equal(await page.eval<string>('document.documentElement.dir'), 'ltr')
  assert.equal(await page.eval<string>('document.documentElement.lang'), 'tr')
  await page.goto(`${s.url}/brands?lang=en`)
  assertClean('locales')
})

test('the browser enforces the CSP: an injected inline script never runs and no page loads a third-party origin', { skip }, async () => {
  const origins = new Set<string>()
  page.on('Network.requestWillBeSent', (params) => origins.add(new URL((params.request as { url: string }).url).origin))
  await page.send('Network.enable')
  for (const pathname of ['/brands', '/brands/acme-learning', '/brands/acme-learning/design', '/brands/acme-learning/assets', '/brands/acme-learning/handoff', '/account']) await page.goto(`${s.url}${pathname}`)
  assert.deepEqual([...origins], [s.url], 'only the Studio origin is contacted')
  // Even if markup were injected, the CSP (script-src 'self', no inline) stops it from executing.
  await page.eval(`(() => { const el = document.createElement('div'); el.innerHTML = '<img src=x onerror="window.__pwned=1">'; document.body.appendChild(el); const sc = document.createElement('script'); sc.textContent = 'window.__pwned2 = 1'; document.body.appendChild(sc) })()`)
  await new Promise((resolve) => setTimeout(resolve, 300))
  assert.equal(await page.eval<unknown>('window.__pwned ?? window.__pwned2 ?? null'), null)
  // Those blocked attempts are exactly the CSP reports we expect; clear them so other checks stay strict.
  assert.ok(page.problems.length > 0 && page.problems.every((problem) => /Content Security Policy|net::ERR|Failed to load/i.test(problem.text)), JSON.stringify(page.problems))
  page.problems.length = 0
  await page.send('Network.disable')
})
