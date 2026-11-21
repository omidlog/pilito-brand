import type { I18n, MessageKey } from '../i18n/index.js'
import { LOCALES } from '../i18n/index.js'
import type { BrandRecord } from '../registry.js'
import type { CachedBrand } from '../sync.js'
import { badge, code, shortSha } from './components.js'
import { html, type SafeHtml } from './html.js'
import { icon, type IconName } from './icons.js'

export interface ViewContext {
  i: I18n
  /** Current path without query, for active navigation and the language links. */
  path: string
  csrf: string | null
  login: string | null
  brands: BrandRecord[]
  /** Server time, so relative times are stable within one render. */
  now: number
}

export type BrandSection = 'overview' | 'brand-book' | 'design' | 'assets' | 'business' | 'personal' | 'history' | 'handoff'

export interface BrandView {
  record: BrandRecord
  cached: CachedBrand
  stale: boolean
  refreshing: boolean
}

const SECTIONS: Array<{ id: BrandSection; key: MessageKey; icon: IconName; path: string }> = [
  { id: 'overview', key: 'nav.overview', icon: 'overview', path: '' },
  { id: 'brand-book', key: 'nav.brandBook', icon: 'book', path: '/brand-book' },
  { id: 'design', key: 'nav.design', icon: 'palette', path: '/design' },
  { id: 'assets', key: 'nav.assets', icon: 'image', path: '/assets' },
  { id: 'business', key: 'nav.business', icon: 'briefcase', path: '/business' },
  { id: 'personal', key: 'nav.personal', icon: 'user', path: '/personal' },
  { id: 'history', key: 'nav.history', icon: 'history', path: '/history' },
  { id: 'handoff', key: 'nav.handoff', icon: 'handoff', path: '/handoff' },
]

export function brandSections(view: BrandView): typeof SECTIONS {
  const projection = view.cached.projection
  return SECTIONS.filter((section) => {
    if (section.id === 'personal') return projection?.brand.modules.personal === true
    return true
  })
}

function initials(name: string): string {
  const letters = [...name.trim()].filter((char) => /\p{L}|\p{N}/u.test(char))
  return (letters[0] ?? '?').toUpperCase()
}

export function brandAvatar(name: string, className = ''): SafeHtml {
  return html`<span class="brand-avatar ${className}" aria-hidden="true">${initials(name)}</span>`
}

function langLinks(ctx: ViewContext): SafeHtml {
  return html`<nav class="lang-switch" aria-label="${ctx.i.t('lang.label')}">
    ${icon('globe')}
    <ul>${LOCALES.map(
      (locale) => html`<li><a href="${ctx.path}?lang=${locale}" lang="${locale}" hreflang="${locale}" ${locale === ctx.i.locale ? html`aria-current="true"` : ''}>${ctx.i.t(`lang.${locale}` as MessageKey)}</a></li>`,
    )}</ul>
  </nav>`
}

function sidebar(ctx: ViewContext, brand?: { view: BrandView; section: BrandSection }): SafeHtml {
  const { i } = ctx
  const current = brand?.view.record.slug
  const brandsLink = ctx.path === '/brands'
  return html`<aside class="sidebar" id="sidebar" aria-label="${i.t('nav.primary')}">
    <div class="sidebar-head">
      <a class="product" href="/brands">${icon('logo', 'product-mark')}<span class="product-name">${i.t('app.name')}</span></a>
      <button type="button" class="icon-btn sidebar-close" data-drawer-close aria-label="${i.t('nav.closeMenu')}">${icon('close')}</button>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-group">
        <div class="nav-group-head">
          <a class="nav-link ${brandsLink ? 'is-active' : ''}" href="/brands" ${brandsLink ? html`aria-current="page"` : ''}>${icon('layers')}<span>${i.t('nav.myBrands')}</span></a>
          <a class="icon-btn" href="/brands/new" title="${i.t('nav.newBrand')}">${icon('plus')}<span class="visually-hidden">${i.t('nav.newBrand')}</span></a>
        </div>
        <ul class="brand-list">
          ${ctx.brands.map((record) => {
            const active = record.slug === current
            const ready = record.provisioning === null || record.provisioning.state === 'ready'
            const href = ready ? `/brands/${record.slug}` : `/brands/${record.slug}/provisioning`
            return html`<li>
              <a class="brand-link ${active ? 'is-active' : ''}" href="${href}" ${active && brand?.section === 'overview' ? html`aria-current="page"` : ''}>
                ${brandAvatar(record.display_name)}<span class="brand-link-name" dir="auto">${record.display_name}</span>
                ${!ready ? html`<span class="dot dot-${record.provisioning?.state === 'failed' ? 'danger' : 'warning'}" aria-hidden="true"></span>` : ''}
              </a>
              ${active && brand
                ? html`<ul class="section-list" aria-label="${i.t('nav.brandSections', { brand: record.display_name })}">
                    ${brandSections(brand.view).map((section) => {
                      const on = section.id === brand.section
                      return html`<li><a class="nav-link nav-sub ${on ? 'is-active' : ''}" href="/brands/${record.slug}${section.path}" ${on ? html`aria-current="page"` : ''}>${icon(section.icon)}<span>${i.t(section.key)}</span></a></li>`
                    })}
                  </ul>`
                : ''}
            </li>`
          })}
        </ul>
      </div>
    </nav>
    <div class="sidebar-foot">
      <a class="nav-link ${ctx.path === '/account' ? 'is-active' : ''}" href="/account" ${ctx.path === '/account' ? html`aria-current="page"` : ''}>${icon('settings')}<span>${i.t('nav.account')}</span></a>
      ${langLinks(ctx)}
      <div class="sidebar-user">
        <span class="muted user-line">${icon('user')}<span>${i.t('user.signedInAs', { login: ctx.login ?? '' })}</span></span>
        <div class="sidebar-user-actions">
          <button type="button" class="icon-btn" data-theme-toggle aria-label="${i.t('theme.toggle')}" title="${i.t('theme.toggle')}">${icon('moon', 'theme-dark-icon')}${icon('sun', 'theme-light-icon')}</button>
          <form method="post" action="/logout">
            <input type="hidden" name="_csrf" value="${ctx.csrf ?? ''}">
            <button type="submit" class="btn btn-ghost btn-sm">${icon('logout')}<span>${i.t('user.signOut')}</span></button>
          </form>
        </div>
      </div>
    </div>
  </aside>`
}

export function syncPill(ctx: ViewContext, view: BrandView): SafeHtml {
  const { i } = ctx
  const status = view.cached.status
  if (view.refreshing && status.state === 'never') return badge(i.t('sync.checking'), 'info', 'refresh')
  if (status.state === 'never') return badge(i.t('sync.never'), 'neutral', 'circle')
  const tone = status.last_error ? 'danger' : view.stale ? 'warning' : 'success'
  const name: IconName = status.last_error ? 'alert' : view.stale ? 'clock' : 'checkCircle'
  return html`<span class="sync-pill sync-${tone}" title="${i.t('sync.canonical')}">
    ${icon(name)}
    <span class="visually-hidden">${i.t('sync.label')}: </span>
    <span>${i.t('sync.branch', { branch: view.record.repo.default_branch })}</span> ${code(shortSha(status.sha))}
    <span class="sync-time">· ${status.synced_at ? i.t('sync.synced', { time: i.relative(status.checked_at ?? status.synced_at, ctx.now) }) : i.t('sync.never')}</span>
  </span>`
}

export function refreshButton(ctx: ViewContext, view: BrandView): SafeHtml {
  return html`<form method="post" action="/brands/${view.record.slug}/refresh" class="inline-form" data-refresh-form>
    <input type="hidden" name="_csrf" value="${ctx.csrf ?? ''}">
    <input type="hidden" name="return" value="${ctx.path}">
    <button type="submit" class="btn btn-secondary btn-sm" data-busy-label="${ctx.i.t('common.refreshing')}">${icon('refresh')}<span>${ctx.i.t('common.refresh')}</span></button>
  </form>`
}

function topbar(ctx: ViewContext, crumbs: Array<{ label: string; href?: string }>, brand?: { view: BrandView }): SafeHtml {
  const { i } = ctx
  return html`<header class="topbar">
    <button type="button" class="icon-btn menu-btn" data-drawer-open aria-controls="sidebar" aria-expanded="false" aria-label="${i.t('nav.menu')}">${icon('menu')}</button>
    <nav class="breadcrumbs" aria-label="${i.t('nav.breadcrumb')}">
      <ol>${crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1
        return html`<li>${index > 0 ? icon('chevron', 'crumb-sep') : ''}${crumb.href && !last ? html`<a href="${crumb.href}" dir="auto">${crumb.label}</a>` : html`<span dir="auto" ${last ? html`aria-current="page"` : ''}>${crumb.label}</span>`}</li>`
      })}</ol>
    </nav>
    <div class="topbar-actions">
      ${brand ? html`${syncPill(ctx, brand.view)}${refreshButton(ctx, brand.view)}` : ''}
      <span class="readonly-chip" title="${i.t('app.readOnlyNote')}">${icon('lock')}<span>${i.t('app.readOnly')}</span></span>
    </div>
  </header>`
}

function documentShell(ctx: ViewContext, title: string, body: SafeHtml, extraHead: SafeHtml = html``): SafeHtml {
  return html`<!doctype html>
<html lang="${ctx.i.locale}" dir="${ctx.i.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="referrer" content="same-origin">
<meta name="robots" content="noindex, nofollow">
<title>${title} · ${ctx.i.t('app.name')}</title>
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/static/studio.css">
<script src="/static/studio.js" defer></script>
${extraHead}
</head>
${body}
</html>`
}

export function shell(
  ctx: ViewContext,
  input: { title: string; content: SafeHtml; crumbs: Array<{ label: string; href?: string }>; brand?: { view: BrandView; section: BrandSection }; extraHead?: SafeHtml },
): SafeHtml {
  return documentShell(
    ctx,
    input.title,
    html`<body class="app">
<a class="skip-link" href="#main">${ctx.i.t('nav.skip')}</a>
<div class="layout">
  ${sidebar(ctx, input.brand)}
  <div class="drawer-backdrop" data-drawer-close hidden></div>
  <div class="main-col">
    ${topbar(ctx, input.crumbs, input.brand)}
    <main id="main" class="main" tabindex="-1">
      ${input.content}
    </main>
  </div>
</div>
<div class="toast-region" aria-live="polite" aria-atomic="true" data-toast-region></div>
</body>`,
    input.extraHead,
  )
}

/** Minimal centered layout for sign-in and errors seen before a session exists. */
export function plainShell(ctx: ViewContext, title: string, content: SafeHtml): SafeHtml {
  return documentShell(
    ctx,
    title,
    html`<body class="plain">
<a class="skip-link" href="#main">${ctx.i.t('nav.skip')}</a>
<main id="main" class="plain-main" tabindex="-1">
  <div class="plain-brand">${icon('logo', 'product-mark')}<span class="product-name">${ctx.i.t('app.name')}</span></div>
  ${content}
  ${langLinks(ctx)}
</main>
</body>`,
  )
}
