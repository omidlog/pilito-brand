import type { DocumentKind } from '@brand-os/brand-core'
import type { MessageKey } from '../i18n/index.js'
import type { ProjectionAsset, ProjectionToken, StudioProjection } from '../projection.js'
import type { BrandRecord, ProvisionRequest } from '../registry.js'
import { cloneCommand, starterPrompt } from '../starter-prompt.js'
import {
  badge,
  banner,
  code,
  colorSwatch,
  copyBlock,
  documentItem,
  documentView,
  emptyState,
  externalLink,
  fontSpecimen,
  pageHeader,
  ratioBar,
  shortSha,
  statCard,
  type Tone,
} from './components.js'
import { html, join, safeGitHubUrl, safeHex, type SafeHtml } from './html.js'
import { icon, type IconName } from './icons.js'
import { brandAvatar, plainShell, refreshButton, shell, type BrandSection, type BrandView, type ViewContext } from './layout.js'

/* ---------------------------------------------------------------- sign in */

export function loginPage(ctx: ViewContext, input: { csrf: string; totp: boolean; error?: string; notice?: string; next: string; login?: string }): SafeHtml {
  const { i } = ctx
  return plainShell(
    ctx,
    i.t('login.title'),
    html`<section class="auth-card" aria-labelledby="login-title">
      <h1 id="login-title" class="auth-title">${i.t('login.title')}</h1>
      <p class="auth-subtitle">${i.t('login.subtitle')}</p>
      ${input.error ? banner({ tone: 'danger', body: input.error, live: true }) : ''}
      ${input.notice ? banner({ tone: 'info', body: input.notice, live: true }) : ''}
      <form method="post" action="/login" class="form" novalidate>
        <input type="hidden" name="_csrf" value="${input.csrf}">
        <input type="hidden" name="next" value="${input.next}">
        <div class="field">
          <label class="field-label" for="login">${i.t('login.login')}</label>
          <input class="input" id="login" name="login" autocomplete="username" required dir="ltr" value="${input.login ?? ''}" autofocus>
        </div>
        <div class="field">
          <label class="field-label" for="password">${i.t('login.password')}</label>
          <input class="input" id="password" name="password" type="password" autocomplete="current-password" required dir="ltr">
        </div>
        ${input.totp
          ? html`<div class="field">
              <label class="field-label" for="totp">${i.t('login.totp')}</label>
              <input class="input input-code" id="totp" name="totp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required dir="ltr" aria-describedby="totp-hint">
              <p class="field-hint" id="totp-hint">${i.t('login.totpHint')}</p>
            </div>`
          : ''}
        <button type="submit" class="btn btn-primary btn-block">${i.t('login.submit')}</button>
      </form>
      <p class="auth-foot muted">${icon('lock')} ${i.t('login.footer')}</p>
    </section>`,
  )
}

/* ---------------------------------------------------------------- errors */

export function errorPage(ctx: ViewContext, kind: 'notFound' | 'forbidden' | 'server' | 'method'): SafeHtml {
  const { i } = ctx
  const title = i.t(`error.${kind}Title` as MessageKey)
  const body = emptyState({
    icon: kind === 'notFound' ? 'info' : 'alert',
    title,
    body: i.t(`error.${kind}Body` as MessageKey),
    action: ctx.login ? html`<a class="btn btn-secondary" href="/brands">${i.t('error.backHome')}</a>` : html`<a class="btn btn-secondary" href="/login">${i.t('login.submit')}</a>`,
  })
  if (!ctx.login) return plainShell(ctx, title, html`<section class="auth-card">${body}</section>`)
  return shell(ctx, { title, content: body, crumbs: [{ label: i.t('nav.myBrands'), href: '/brands' }, { label: title }] })
}

/* ---------------------------------------------------------------- brands */

function stateBadge(ctx: ViewContext, record: BrandRecord): SafeHtml {
  const state = record.provisioning?.state ?? 'ready'
  if (state === 'ready') return badge(ctx.i.t('brands.stateReady'), 'success', 'checkCircle')
  if (state === 'running') return badge(ctx.i.t('brands.stateRunning'), 'info', 'clock')
  return badge(ctx.i.t('brands.stateFailed'), 'danger', 'alert')
}

function profileBadge(ctx: ViewContext, profile: 'business' | 'personal-brand'): SafeHtml {
  return profile === 'personal-brand' ? badge(ctx.i.t('brands.profilePersonal'), 'accent', 'user') : badge(ctx.i.t('brands.profileBusiness'), 'neutral', 'briefcase')
}

export function brandsPage(ctx: ViewContext, input: { canCreate: boolean; synced: Map<string, { sha: string | null; at: string | null }> }): SafeHtml {
  const { i } = ctx
  const newButton = input.canCreate ? html`<a class="btn btn-primary" href="/brands/new">${icon('plus')}<span>${i.t('nav.newBrand')}</span></a>` : ''
  const content = ctx.brands.length
    ? html`<ul class="brand-grid" role="list">${ctx.brands.map((record) => {
        const ready = record.provisioning === null || record.provisioning.state === 'ready'
        const href = ready ? `/brands/${record.slug}` : `/brands/${record.slug}/provisioning`
        const sync = input.synced.get(record.slug)
        return html`<li class="brand-card">
          <a class="brand-card-link" href="${href}">
            <div class="brand-card-head">${brandAvatar(record.display_name, 'brand-avatar-lg')}<div><h2 class="brand-card-title" dir="auto">${record.display_name}</h2><p class="brand-card-slug mono" dir="ltr">/brands/${record.slug}</p></div></div>
            <div class="brand-card-badges">${profileBadge(ctx, record.profile)}${stateBadge(ctx, record)}</div>
            <dl class="brand-card-meta">
              <div><dt>${i.t('brands.repository')}</dt><dd class="mono" dir="ltr">${record.repo.owner}/${record.repo.name}</dd></div>
              <div><dt>${i.t('brands.lastCommit')}</dt><dd>${sync?.sha ? html`${code(shortSha(sync.sha))} <span class="muted">${i.relative(sync.at, ctx.now)}</span>` : html`<span class="muted">${i.t('sync.never')}</span>`}</dd></div>
            </dl>
          </a>
        </li>`
      })}</ul>`
    : emptyState({ icon: 'layers', title: i.t('brands.emptyTitle'), body: input.canCreate ? i.t('brands.emptyBody') : i.t('brands.notConfigured'), action: newButton || undefined })
  return shell(ctx, {
    title: i.t('brands.title'),
    crumbs: [{ label: i.t('nav.myBrands') }],
    content: html`${pageHeader({ title: i.t('brands.title'), subtitle: i.t('brands.subtitle'), actions: ctx.brands.length ? newButton || undefined : undefined })}
      ${!input.canCreate && ctx.brands.length ? banner({ tone: 'info', body: i.t('brands.notConfigured') }) : ''}
      ${content}`,
  })
}

/* ---------------------------------------------------------------- new brand wizard */

export interface WizardState {
  values: Partial<Record<keyof ProvisionRequest, unknown>>
  errors: Partial<Record<string, string>>
  formError?: string
  owners: string[]
  template: string
  templateState: 'ok' | 'missing' | 'unknown'
  configured: boolean
}

const FACETS = ['founder-executive', 'consultant-expert', 'creator-educator', 'artist-designer', 'speaker-author'] as const

export function wizardPage(ctx: ViewContext, state: WizardState): SafeHtml {
  const { i } = ctx
  const v = state.values
  const err = (field: string): SafeHtml => (state.errors[field] ? html`<p class="field-error" id="${field}-error">${icon('alert')}<span>${state.errors[field]}</span></p>` : html``)
  const invalid = (field: string): SafeHtml => (state.errors[field] ? html`aria-invalid="true" aria-describedby="${field}-error ${field}-hint"` : html`aria-describedby="${field}-hint"`)
  const profile = v.profile === 'personal-brand' ? 'personal-brand' : 'business'
  const locales = Array.isArray(v.locales) ? (v.locales as string[]) : []
  const facets = Array.isArray(v.facets) ? (v.facets as string[]) : []
  const defaultLocale = typeof v.default_locale === 'string' ? v.default_locale : 'en'
  const steps: Array<{ id: string; key: MessageKey }> = [
    { id: 'basics', key: 'wizard.stepBasics' },
    { id: 'profile', key: 'wizard.stepProfile' },
    { id: 'languages', key: 'wizard.stepLanguages' },
    { id: 'repository', key: 'wizard.stepRepository' },
    { id: 'review', key: 'wizard.stepReview' },
  ]
  const errorList = Object.entries(state.errors)
  const templateNote =
    state.templateState === 'ok'
      ? badge(i.t('wizard.templateOk'), 'success', 'checkCircle')
      : state.templateState === 'missing'
        ? badge(i.t('wizard.templateMissing'), 'danger', 'alert')
        : badge(i.t('wizard.templateUnknown'), 'warning', 'clock')
  const form = html`<form method="post" action="/brands/new" class="wizard" data-wizard novalidate>
    <input type="hidden" name="_csrf" value="${ctx.csrf ?? ''}">
    <ol class="stepper" aria-label="${i.t('wizard.stepsLabel')}">
      ${steps.map((step, index) => html`<li class="stepper-item" data-step-indicator="${step.id}"><span class="stepper-num" aria-hidden="true">${i.number(index + 1)}</span><span class="stepper-label">${i.t(step.key)}</span></li>`)}
    </ol>
    <fieldset class="wizard-step" data-step="basics">
      <legend class="step-title"><span class="step-count">${i.t('wizard.step', { n: i.number(1), total: i.number(5) })}</span>${i.t('wizard.stepBasics')}</legend>
      <div class="field">
        <label class="field-label" for="name">${i.t('wizard.name')}</label>
        <input class="input" id="name" name="name" required maxlength="80" dir="auto" value="${String(v.name ?? '')}" ${invalid('name')} data-slug-source>
        <p class="field-hint" id="name-hint">${i.t('wizard.nameHint')}</p>${err('name')}
      </div>
      <div class="field">
        <label class="field-label" for="slug">${i.t('wizard.slug')}</label>
        <div class="input-affix"><span class="affix mono" dir="ltr">/brands/</span><input class="input mono" id="slug" name="slug" required maxlength="60" pattern="[a-z0-9]+(-[a-z0-9]+)*" dir="ltr" value="${String(v.slug ?? '')}" ${invalid('slug')} data-slug-target></div>
        <p class="field-hint" id="slug-hint">${i.t('wizard.slugHint')}</p>${err('slug')}
      </div>
    </fieldset>
    <fieldset class="wizard-step" data-step="profile">
      <legend class="step-title"><span class="step-count">${i.t('wizard.step', { n: i.number(2), total: i.number(5) })}</span>${i.t('wizard.profile')}</legend>
      <div class="choice-grid" role="radiogroup" aria-describedby="profile-hint">
        <label class="choice-card"><input type="radio" name="profile" value="business" ${profile === 'business' ? 'checked' : ''} data-profile-choice><span class="choice-icon">${icon('briefcase')}</span><span class="choice-title">${i.t('wizard.profileBusiness')}</span><span class="choice-hint">${i.t('wizard.profileBusinessHint')}</span></label>
        <label class="choice-card"><input type="radio" name="profile" value="personal-brand" ${profile === 'personal-brand' ? 'checked' : ''} data-profile-choice><span class="choice-icon">${icon('user')}</span><span class="choice-title">${i.t('wizard.profilePersonal')}</span><span class="choice-hint">${i.t('wizard.profilePersonalHint')}</span></label>
      </div>
      <p class="visually-hidden" id="profile-hint">${i.t('wizard.profile')}</p>${err('profile')}
      <fieldset class="subfield" data-facets ${profile === 'business' ? html`data-collapsed="true"` : ''}>
        <legend class="field-label">${i.t('wizard.facets')}</legend>
        <p class="field-hint" id="facets-hint">${i.t('wizard.facetsHint')}</p>
        <div class="check-grid">${FACETS.map((facet) => html`<label class="check"><input type="checkbox" name="facets" value="${facet}" ${facets.includes(facet) ? 'checked' : ''}><span>${i.t(`wizard.facet.${facet}` as MessageKey)}</span></label>`)}</div>
        ${err('facets')}
      </fieldset>
    </fieldset>
    <fieldset class="wizard-step" data-step="languages">
      <legend class="step-title"><span class="step-count">${i.t('wizard.step', { n: i.number(3), total: i.number(5) })}</span>${i.t('wizard.stepLanguages')}</legend>
      <div class="field">
        <label class="field-label" for="default_locale">${i.t('wizard.defaultLocale')}</label>
        <select class="input select" id="default_locale" name="default_locale" aria-describedby="locales-hint">
          ${(['en', 'fa', 'tr'] as const).map((locale) => html`<option value="${locale}" ${defaultLocale === locale ? 'selected' : ''} lang="${locale}">${i.t(`lang.${locale}` as MessageKey)}</option>`)}
        </select>
      </div>
      <fieldset class="subfield">
        <legend class="field-label">${i.t('wizard.locales')}</legend>
        <p class="field-hint" id="locales-hint">${i.t('wizard.localesHint')}</p>
        <div class="check-grid">${(['en', 'fa', 'tr'] as const).map((locale) => html`<label class="check"><input type="checkbox" name="locales" value="${locale}" ${locales.includes(locale) ? 'checked' : ''}><span lang="${locale}">${i.t(`lang.${locale}` as MessageKey)}</span></label>`)}</div>
        ${err('locales')}
      </fieldset>
      <fieldset class="subfield">
        <legend class="field-label">${i.t('wizard.modules')}</legend>
        <label class="toggle"><input type="checkbox" name="mascot" value="on" ${v.mascot === true ? 'checked' : ''} aria-describedby="mascot-hint"><span class="toggle-track" aria-hidden="true"></span><span><span class="toggle-title">${i.t('wizard.mascot')}</span><span class="field-hint" id="mascot-hint">${i.t('wizard.mascotHint')}</span></span></label>
        <label class="toggle"><input type="checkbox" name="gamification" value="on" ${v.gamification === true ? 'checked' : ''} aria-describedby="gamification-hint"><span class="toggle-track" aria-hidden="true"></span><span><span class="toggle-title">${i.t('wizard.gamification')}</span><span class="field-hint" id="gamification-hint">${i.t('wizard.gamificationHint')}</span></span></label>
      </fieldset>
    </fieldset>
    <fieldset class="wizard-step" data-step="repository">
      <legend class="step-title"><span class="step-count">${i.t('wizard.step', { n: i.number(4), total: i.number(5) })}</span>${i.t('wizard.stepRepository')}</legend>
      <div class="field">
        <label class="field-label" for="owner">${i.t('wizard.owner')}</label>
        <select class="input select mono" id="owner" name="owner" dir="ltr" ${invalid('owner')}>
          ${state.owners.map((owner) => html`<option value="${owner}" ${v.owner === owner ? 'selected' : ''}>${owner}</option>`)}
        </select>
        <p class="field-hint" id="owner-hint">${i.t('wizard.ownerHint')}</p>${err('owner')}
      </div>
      <div class="field">
        <label class="field-label" for="repo">${i.t('wizard.repo')}</label>
        <input class="input mono" id="repo" name="repo" maxlength="100" dir="ltr" value="${String(v.repo ?? '')}" ${invalid('repo')} data-repo-target>
        <p class="field-hint" id="repo-hint">${i.t('wizard.repoHint')}</p>${err('repo')}
      </div>
      <div class="field">
        <span class="field-label">${i.t('wizard.template')}</span>
        <p>${code(state.template)} ${templateNote}</p>
      </div>
    </fieldset>
    <fieldset class="wizard-step" data-step="review">
      <legend class="step-title"><span class="step-count">${i.t('wizard.step', { n: i.number(5), total: i.number(5) })}</span>${i.t('wizard.reviewTitle')}</legend>
      <dl class="review-list" data-review>
        <div><dt>${i.t('wizard.name')}</dt><dd data-review-field="name" dir="auto">${String(v.name ?? '')}</dd></div>
        <div><dt>${i.t('wizard.slug')}</dt><dd data-review-field="slug" class="mono" dir="ltr">${String(v.slug ?? '')}</dd></div>
        <div><dt>${i.t('wizard.profile')}</dt><dd data-review-field="profile"></dd></div>
        <div><dt>${i.t('wizard.defaultLocale')}</dt><dd data-review-field="default_locale"></dd></div>
        <div><dt>${i.t('wizard.repo')}</dt><dd data-review-field="repo" class="mono" dir="ltr"></dd></div>
      </dl>
      ${banner({ tone: 'info', title: i.t('wizard.reviewTitle'), body: i.t('wizard.reviewBody') })}
      <button type="submit" class="btn btn-primary btn-lg" data-submit>${icon('lock')}<span>${i.t('wizard.submit')}</span></button>
    </fieldset>
    <div class="wizard-nav" data-wizard-nav hidden>
      <button type="button" class="btn btn-secondary" data-wizard-back>${icon('chevron', 'icon-back')}<span>${i.t('common.back')}</span></button>
      <span class="wizard-progress muted" data-wizard-progress aria-live="polite"></span>
      <button type="button" class="btn btn-primary" data-wizard-next><span>${i.t('common.next')}</span>${icon('chevron')}</button>
    </div>
  </form>`
  return shell(ctx, {
    title: i.t('wizard.title'),
    crumbs: [{ label: i.t('nav.myBrands'), href: '/brands' }, { label: i.t('nav.newBrand') }],
    content: html`${pageHeader({ title: i.t('wizard.title'), subtitle: i.t('wizard.subtitle') })}
      ${!state.configured ? banner({ tone: 'warning', body: i.t('wizard.notConfigured') }) : ''}
      ${state.formError ? banner({ tone: 'danger', body: state.formError, live: true }) : ''}
      ${errorList.length
        ? html`<div class="error-summary" role="alert" tabindex="-1" data-error-summary><p class="banner-title">${i.t('wizard.errorsTitle')}</p><ul>${errorList.map(([field, message]) => html`<li><a href="#${field === 'facets' ? 'name' : field}">${message}</a></li>`)}</ul></div>`
        : ''}
      ${state.configured ? form : ''}`,
  })
}

/* ---------------------------------------------------------------- provisioning status */

const STEP_ICON: Record<string, { icon: IconName; tone: Tone }> = {
  pending: { icon: 'circle', tone: 'neutral' },
  running: { icon: 'clock', tone: 'info' },
  done: { icon: 'checkCircle', tone: 'success' },
  failed: { icon: 'error', tone: 'danger' },
  skipped: { icon: 'skip', tone: 'neutral' },
}

export function provisioningPage(ctx: ViewContext, record: BrandRecord): SafeHtml {
  const { i } = ctx
  const p = record.provisioning!
  const repoUrl = safeGitHubUrl(record.repo.html_url)
  const stateBanner =
    p.state === 'running'
      ? banner({ tone: 'info', body: html`<span class="spinner" aria-hidden="true"></span> ${i.t('provision.running')}`, live: true })
      : p.state === 'ready'
        ? banner({ tone: 'success', body: i.t('provision.ready'), live: true })
        : banner({
            tone: 'danger',
            title: i.t('provision.failed'),
            body: html`<p dir="auto">${p.error?.message ?? ''}</p>${p.cleanup === 'done' ? html`<p>${i.t('provision.cleanupDone')}</p>` : p.cleanup === 'required' ? html`<p>${i.t('provision.cleanupRequired')}</p>` : ''}`,
            live: true,
            actions: html`<form method="post" action="/brands/${record.slug}/provisioning/retry"><input type="hidden" name="_csrf" value="${ctx.csrf ?? ''}"><button class="btn btn-primary btn-sm" type="submit">${icon('refresh')}<span>${i.t('provision.retry')}</span></button></form>`,
          })
  const steps = html`<ol class="timeline" aria-label="${i.t('provision.stepsLabel')}">
    ${p.steps.map((step) => {
      const meta = STEP_ICON[step.status] ?? STEP_ICON.pending!
      return html`<li class="timeline-item timeline-${step.status}">
        <span class="timeline-icon tone-${meta.tone}">${step.status === 'running' ? html`<span class="spinner" aria-hidden="true"></span>` : icon(meta.icon)}</span>
        <span class="timeline-label">${i.t(`provision.step.${step.id}` as MessageKey)}</span>
        <span class="timeline-status muted">${i.t(`provision.status.${step.status}` as MessageKey)}</span>
      </li>`
    })}
  </ol>`
  const ready =
    p.state === 'ready' && repoUrl
      ? html`<section class="card" aria-labelledby="next-title">
          <h2 class="card-title" id="next-title">${i.t('provision.nextTitle')}</h2>
          <p class="muted">${i.t('provision.nextBody')}</p>
          ${copyBlock({ id: 'repo-url', label: i.t('handoff.repoUrl'), text: repoUrl, buttonLabel: i.t('handoff.copyUrl'), i })}
          ${copyBlock({ id: 'starter-prompt', label: i.t('handoff.prompt'), text: starterPrompt({ slug: record.slug, repoUrl }), buttonLabel: i.t('handoff.copyPrompt'), multiline: true, i })}
          ${banner({ tone: 'warning', title: i.t('handoff.accessTitle'), body: i.t('handoff.accessBody') })}
          <div class="button-row"><a class="btn btn-primary" href="/brands/${record.slug}">${i.t('provision.viewBrand')}</a>${externalLink(repoUrl, i.t('common.openOnGitHub'), i)}</div>
        </section>`
      : ''
  const titleKey: MessageKey = p.state === 'ready' ? 'provision.titleReady' : p.state === 'failed' ? 'provision.titleFailed' : 'provision.title'
  const title = i.t(titleKey, { brand: record.display_name })
  return shell(ctx, {
    title,
    crumbs: [{ label: i.t('nav.myBrands'), href: '/brands' }, { label: record.display_name }],
    extraHead: p.state === 'running' ? html`<noscript><meta http-equiv="refresh" content="3"></noscript>` : html``,
    content: html`<div data-provisioning="${record.slug}" data-state="${p.state}">
      ${pageHeader({ title, eyebrow: html`${code(`${record.repo.owner}/${record.repo.name}`)} · ${i.t('provision.attempts', { n: i.number(p.attempts) })}` })}
      ${stateBanner}
      <div class="two-col">
        <section class="card">${steps}</section>
        ${ready}
      </div>
    </div>`,
  })
}

/* ---------------------------------------------------------------- brand pages */

function syncBanners(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const s = view.cached.status
  const out: SafeHtml[] = []
  if (flash === 'synced') out.push(banner({ tone: 'success', body: i.t('sync.done', { sha: shortSha(s.sha) }), live: true }))
  if (flash === 'failed') out.push(banner({ tone: 'danger', body: i.t('sync.failed'), live: true }))
  if (flash === 'too-soon') out.push(banner({ tone: 'info', body: i.t('sync.tooSoon'), live: true }))
  if (s.last_error && flash !== 'failed') {
    out.push(
      view.cached.projection
        ? banner({ tone: 'warning', title: i.t('sync.errorTitle'), body: i.t('sync.errorBody', { sha: shortSha(s.sha), reason: s.last_error.message }) })
        : banner({ tone: 'danger', title: i.t('sync.errorTitle'), body: i.t('sync.errorNoData', { reason: s.last_error.message }), actions: refreshButton(ctx, view) }),
    )
  } else if (view.stale && view.cached.projection && !flash) {
    out.push(banner({ tone: 'neutral' as Tone, body: html`${view.refreshing ? html`<span class="spinner" aria-hidden="true"></span> ${i.t('sync.checking')} ` : ''}${i.t('sync.staleBody', { sha: shortSha(s.sha), time: i.dateTime(s.synced_at) })}` }))
  }
  if (s.repo_private === false) out.push(banner({ tone: 'danger', title: i.t('sync.public'), body: i.t('sync.publicWarning') }))
  return join(out)
}

function brandShell(ctx: ViewContext, view: BrandView, section: BrandSection, title: string, body: SafeHtml, flash: string | null): SafeHtml {
  const { i } = ctx
  const crumbs: Array<{ label: string; href?: string }> = [{ label: i.t('nav.myBrands'), href: '/brands' }, { label: view.record.display_name, href: `/brands/${view.record.slug}` }]
  if (section !== 'overview') crumbs.push({ label: title })
  const content = view.cached.projection
    ? body
    : emptyState({ icon: view.refreshing ? 'refresh' : 'alert', title: view.cached.status.last_error ? i.t('sync.errorTitle') : i.t('sync.never'), body: view.cached.status.last_error?.message ?? i.t('sync.checking'), action: refreshButton(ctx, view) })
  return shell(ctx, { title: `${title} · ${view.record.display_name}`, crumbs, brand: { view, section }, content: html`${syncBanners(ctx, view, flash)}${content}` })
}

function brandHeader(ctx: ViewContext, view: BrandView, title: string, subtitle: string): SafeHtml {
  const p = view.cached.projection!
  const { i } = ctx
  return pageHeader({
    eyebrow: html`${brandAvatar(p.brand.name)} <span dir="auto">${p.brand.name}</span>`,
    title,
    subtitle,
    meta: html`${profileBadge(ctx, p.brand.kind)}${view.cached.status.repo_private ? badge(i.t('sync.private'), 'neutral', 'lock') : ''}${code(`${view.record.repo.owner}/${view.record.repo.name}`)}`,
  })
}

const GROUP_KEYS: Record<string, MessageKey> = { brand: 'overview.group.brand', business: 'overview.group.business', personal: 'overview.group.personal', governance: 'overview.group.governance' }

export function overviewPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  if (!p) return brandShell(ctx, view, 'overview', i.t('overview.title'), html``, flash)
  const o = p.overview
  const priority = (value: string): SafeHtml => {
    const tone: Tone = value === 'critical' ? 'danger' : value === 'high' ? 'warning' : 'neutral'
    const key = `overview.priority.${value}` as MessageKey
    return badge(i.t(key), tone)
  }
  const commits = view.cached.history?.commits.slice(0, 4) ?? []
  const body = html`
    <header class="brand-hero">
      <div class="brand-hero-id">${brandAvatar(p.brand.name, 'brand-avatar-xl')}<div>
        <h1 class="page-title" dir="auto">${p.brand.name}</h1>
        <div class="page-meta">${profileBadge(ctx, p.brand.kind)}${view.cached.status.repo_private ? badge(i.t('sync.private'), 'neutral', 'lock') : ''}${code(`${view.record.repo.owner}/${view.record.repo.name}`)}</div>
      </div></div>
      <a class="btn btn-secondary" href="/brands/${view.record.slug}/handoff">${icon('handoff')}<span>${i.t('nav.handoff')}</span></a>
    </header>
    ${banner({ tone: 'info', body: html`${i.t('app.readOnlyNote')} <a href="/brands/${view.record.slug}/handoff">${i.t('nav.handoff')}</a>` })}
    ${!p.brand.initialized ? banner({ tone: 'warning', body: i.t('overview.notInitialized') }) : ''}
    <section class="stat-grid" aria-label="${i.t('overview.title')}">
      ${statCard({ label: i.t('overview.coverage'), value: i.percent(o.coverage), hint: i.t('overview.coverageHint'), ratio: o.coverage })}
      ${statCard({ label: i.t('overview.approval'), value: i.percent(o.approval), hint: i.t('overview.approvalHint'), ratio: o.approval, tone: 'success' })}
      ${statCard({ label: i.t('overview.unanswered'), value: i.t('common.of', { done: i.number(o.required_unanswered), total: i.number(o.required) }), hint: i.t('overview.unansweredHint') })}
      ${statCard({ label: i.t('overview.pending'), value: i.number(o.pending_review), hint: i.t('overview.pendingHint') })}
    </section>
    <div class="facts-strip">
      ${badge(i.t('overview.approvedFacts', { count: i.number(o.approved_facts) }), 'success', 'checkCircle')}
      ${o.restricted_withheld ? badge(i.t('overview.withheld', { count: i.number(o.restricted_withheld) }), 'neutral', 'lock') : ''}
      ${o.contradictions ? html`<a href="/brands/${view.record.slug}/history#contradictions">${badge(i.t('overview.contradictions', { count: i.number(o.contradictions) }), 'warning', 'alert')}</a>` : ''}
    </div>
    <div class="two-col">
      <section class="card" aria-labelledby="groups-title">
        <h2 class="card-title" id="groups-title">${i.t('overview.groups')}</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th scope="col">${i.t('overview.group')}</th><th scope="col">${i.t('overview.requiredApproved')}</th><th scope="col">${i.t('overview.requiredUnanswered')}</th><th scope="col">${i.t('overview.pending')}</th></tr></thead>
          <tbody>${o.groups.map(
            (group) => html`<tr>
              <th scope="row">${GROUP_KEYS[group.group] ? i.t(GROUP_KEYS[group.group]!) : group.group}</th>
              <td><div class="cell-bar">${ratioBar(group.required ? group.required_approved / group.required : 0, `${group.required_approved}/${group.required}`, 'success')}<span>${i.t('common.of', { done: i.number(group.required_approved), total: i.number(group.required) })}</span></div></td>
              <td>${i.number(group.required_unanswered)}</td>
              <td>${i.number(group.pending_review)}</td>
            </tr>`,
          )}</tbody>
        </table></div>
      </section>
      <section class="card" aria-labelledby="next-title">
        <h2 class="card-title" id="next-title">${i.t('overview.next')}</h2>
        <p class="card-hint muted">${i.t('overview.nextHint')}</p>
        ${o.next.length
          ? html`<ol class="question-list">${o.next.map((item) => html`<li><div class="question-head">${priority(item.priority)}${code(item.id, 'muted')}</div><p dir="auto">${item.prompt}</p></li>`)}</ol>`
          : html`<p class="muted">${i.t('overview.nextEmpty')}</p>`}
      </section>
    </div>
    <section class="card" aria-labelledby="recent-title">
      <div class="card-head"><h2 class="card-title" id="recent-title">${i.t('overview.recent')}</h2><a href="/brands/${view.record.slug}/history" class="link-sm">${i.t('nav.history')}</a></div>
      ${commits.length ? commitList(ctx, commits) : html`<p class="muted">${i.t('overview.recentEmpty')}</p>`}
      <p class="muted small">${icon('info')} ${i.t('sync.canonical')}</p>
    </section>
    <section class="card" aria-label="${i.t('overview.modules')}">
      <dl class="meta-grid">
        <div><dt>${i.t('overview.profile')}</dt><dd class="mono" dir="ltr">${p.brand.profile}</dd></div>
        <div><dt>${i.t('overview.locales')}</dt><dd>${join(p.brand.supported_locales.map((locale) => badge(locale, locale === p.brand.default_locale ? 'accent' : 'neutral')))}</dd></div>
        <div><dt>${i.t('wizard.mascot')}</dt><dd>${p.brand.modules.mascot ? i.t('common.enabled') : i.t('common.disabled')}</dd></div>
        <div><dt>${i.t('wizard.gamification')}</dt><dd>${p.brand.modules.gamification ? i.t('common.enabled') : i.t('common.disabled')}</dd></div>
        <div><dt>${i.t('nav.personal')}</dt><dd>${p.brand.modules.personal ? i.t('common.enabled') : i.t('common.disabled')}</dd></div>
      </dl>
    </section>`
  return brandShell(ctx, view, 'overview', i.t('overview.title'), body, flash)
}

function commitList(ctx: ViewContext, commits: NonNullable<BrandView['cached']['history']>['commits']): SafeHtml {
  const { i } = ctx
  return html`<ol class="commit-list">${commits.map((commit) => {
    const url = safeGitHubUrl(commit.html_url)
    return html`<li class="commit">
      ${icon('git', 'commit-icon')}
      <div class="commit-body"><p class="commit-title" dir="auto">${commit.title || '—'}</p><p class="commit-meta muted"><span dir="auto">${commit.author ?? ''}</span> · <time datetime="${commit.date ?? ''}">${i.dateTime(commit.date)}</time></p></div>
      ${url ? html`<a class="commit-sha mono" dir="ltr" href="${url}" target="_blank" rel="noopener noreferrer">${shortSha(commit.sha)}<span class="visually-hidden"> ${i.t('common.opensNewTab')}</span></a>` : code(shortSha(commit.sha))}
    </li>`
  })}</ol>`
}

export function brandBookPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  const doc = p?.documents['brand-book']
  return brandShell(ctx, view, 'brand-book', i.t('book.title'), p ? html`${brandHeader(ctx, view, i.t('book.title'), i.t('book.subtitle'))}${doc ? documentView(i, doc, 'book') : ''}` : html``, flash)
}

function tokenState(ctx: ViewContext, token: ProjectionToken): SafeHtml {
  const { i } = ctx
  if (token.state === 'approved') return badge(i.t('design.state.approved'), 'success', 'checkCircle')
  if (token.example) return badge(i.t('design.state.example'), 'neutral', 'sparkle')
  return badge(i.t('design.state.draft'), 'warning', 'clock')
}

export function designPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  if (!p) return brandShell(ctx, view, 'design', i.t('design.title'), html``, flash)
  const items = p.documents['brand-book']?.sections.flatMap((section) => section.items) ?? []
  const colors = items.filter((item) => item.structured?.type === 'color' && item.tag === 'approved')
  const fonts = items.filter((item) => item.structured?.type === 'font' && item.tag === 'approved')
  const logos = items.filter((item) => item.structured?.type === 'logo_spec' && item.tag === 'approved')
  const colorTokens = p.tokens.items.filter((token) => token.type === 'color')
  const groups = new Map<string, ProjectionToken[]>()
  for (const token of p.tokens.items) {
    const group = token.id.split('.')[0] ?? token.type
    groups.set(group, [...(groups.get(group) ?? []), token])
  }
  const dimension = p.tokens.items.filter((token) => token.type === 'dimension' && /^-?\d+(\.\d+)?px$/.test(token.value)).slice(0, 16)
  const body = html`${brandHeader(ctx, view, i.t('design.title'), i.t('design.subtitle'))}
    <section class="card" aria-labelledby="brand-colors">
      <h2 class="card-title" id="brand-colors">${i.t('design.brandColors')}</h2>
      ${colors.length ? join(colors.map((item) => documentItem(i, item))) : html`<p class="muted">${i.t('design.brandColorsEmpty')}</p>`}
    </section>
    <section class="card" aria-labelledby="token-colors">
      <div class="card-head"><h2 class="card-title" id="token-colors">${i.t('design.colors')}</h2><span class="muted">${i.t('design.tokenCount', { approved: i.number(colorTokens.filter((token) => token.state === 'approved').length), draft: i.number(colorTokens.filter((token) => token.state === 'draft').length) })}</span></div>
      ${colorTokens.length
        ? html`<div class="swatch-grid swatch-grid-lg">${colorTokens.map((token) => colorSwatch({ hex: safeHex(token.value), name: token.id, meta: tokenState(ctx, token), i }))}</div>`
        : html`<p class="muted">${i.t('design.colorsEmpty')}</p>`}
    </section>
    <div class="two-col">
      <section class="card" aria-labelledby="type-title">
        <h2 class="card-title" id="type-title">${i.t('design.typography')}</h2>
        ${fonts.length ? join(fonts.map((item) => documentItem(i, item))) : html`<p class="muted">${i.t('design.typographyEmpty')}</p>${fontSpecimen('system-ui', ['sans-serif'], i.t('design.specimen'), 'system-ui')}`}
        <p class="muted small">${icon('info')} ${i.t('design.fontNote')}</p>
      </section>
      <section class="card" aria-labelledby="logo-title">
        <h2 class="card-title" id="logo-title">${i.t('design.logo')}</h2>
        ${logos.length ? join(logos.map((item) => documentItem(i, item))) : html`<p class="muted">${i.t('design.logoEmpty')}</p>`}
      </section>
    </div>
    ${dimension.length
      ? html`<section class="card" aria-labelledby="space-title"><h2 class="card-title" id="space-title">${i.t('design.spacing')}</h2>
          <ul class="space-list">${dimension.map((token) => {
            const px = Math.min(240, Math.max(1, Math.round(parseFloat(token.value))))
            return html`<li><span class="mono" dir="ltr">${token.id}</span><svg class="space-bar" viewBox="0 0 240 10" preserveAspectRatio="xMinYMid meet" role="img" aria-label="${token.value}"><rect width="${px}" height="10" rx="2"/></svg><span class="mono muted" dir="ltr">${token.value}</span>${tokenState(ctx, token)}</li>`
          })}</ul></section>`
      : ''}
    <section class="card" aria-labelledby="tokens-title">
      <div class="card-head"><h2 class="card-title" id="tokens-title">${i.t('design.tokens')}</h2><span class="muted">${i.t('design.tokenCount', { approved: i.number(p.tokens.approved), draft: i.number(p.tokens.draft) })}</span></div>
      ${[...groups.entries()].map(
        ([group, tokens]) => html`<details class="disclosure"><summary><span class="mono" dir="ltr">${group}</span> <span class="muted">${i.number(tokens.length)}</span></summary>
          <div class="table-wrap"><table class="table table-compact"><thead><tr><th scope="col">${i.t('design.token')}</th><th scope="col">${i.t('design.type')}</th><th scope="col">${i.t('common.value')}</th><th scope="col">${i.t('common.status')}</th></tr></thead>
          <tbody>${tokens.map((token) => html`<tr><td class="mono" dir="ltr">${token.id}</td><td>${token.type}</td><td class="mono" dir="ltr">${token.value}</td><td>${tokenState(ctx, token)}${token.published ? badge(i.t('design.published'), 'accent') : ''}</td></tr>`)}</tbody></table></div>
        </details>`,
      )}
    </section>`
  return brandShell(ctx, view, 'design', i.t('design.title'), body, flash)
}

function assetCard(ctx: ViewContext, slug: string, asset: ProjectionAsset): SafeHtml {
  const { i } = ctx
  const status = asset.published ? badge(i.t('assets.status.published'), 'accent', 'globe') : asset.approved ? badge(i.t('assets.status.approved'), 'success', 'checkCircle') : badge(i.t('assets.status.draft'), 'warning', 'clock')
  return html`<li class="asset-card" data-kind="${asset.kind}">
    <div class="asset-preview">${asset.preview_key
      ? html`<img src="/brands/${slug}/assets/file/${asset.preview_key}" alt="${asset.name}" loading="lazy" decoding="async">`
      : html`<div class="asset-placeholder">${icon('image')}<span>${i.t('assets.noPreview')}</span><span class="muted small">${asset.unavailable_reason ? i.t(`assets.reason.${asset.unavailable_reason}` as MessageKey) : ''}</span></div>`}</div>
    <div class="asset-body">
      <h3 class="asset-name" dir="auto">${asset.name}</h3>
      <div class="asset-badges">${status}${badge(asset.kind, 'neutral')}</div>
      <dl class="asset-meta">
        <div><dt>${i.t('assets.visibility')}</dt><dd>${asset.visibility}</dd></div>
        ${asset.license ? html`<div><dt>${i.t('assets.license')}</dt><dd dir="auto">${asset.license}</dd></div>` : ''}
        ${asset.usage ? html`<div><dt>${i.t('assets.usage')}</dt><dd dir="auto">${asset.usage}</dd></div>` : ''}
      </dl>
      ${code(asset.id, 'muted small')}
    </div>
  </li>`
}

function countTable(ctx: ViewContext, title: string, counts: Record<string, number>): SafeHtml {
  return html`<div><h3 class="subhead">${title}</h3><ul class="count-list">${Object.entries(counts).map(([key, count]) => html`<li><span class="mono" dir="ltr">${key}</span><span>${ctx.i.number(count)}</span></li>`)}</ul></div>`
}

export function assetsPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  if (!p) return brandShell(ctx, view, 'assets', i.t('assets.title'), html``, flash)
  const kinds = [...new Set(p.assets.map((asset) => asset.kind))].sort()
  const body = html`${brandHeader(ctx, view, i.t('assets.title'), i.t('assets.subtitle'))}
    ${p.assets.length
      ? html`<div class="filter-bar" data-asset-filter hidden role="group" aria-label="${i.t('assets.filter')}">
          <button type="button" class="chip" aria-pressed="true" data-filter="*">${i.t('common.all')}</button>
          ${kinds.map((kind) => html`<button type="button" class="chip" aria-pressed="false" data-filter="${kind}">${kind}</button>`)}
        </div>
        <ul class="asset-grid" role="list">${p.assets.map((asset) => assetCard(ctx, view.record.slug, asset))}</ul>`
      : emptyState({ icon: 'image', title: i.t('assets.empty'), body: i.t('assets.subtitle') })}
    ${p.mascot
      ? html`<section class="card" aria-labelledby="mascot-title">
          <h2 class="card-title" id="mascot-title">${i.t('assets.mascot')}</h2>
          <div class="facts-strip">${badge(i.t('assets.mascotStates', { count: i.number(p.mascot.states) }), 'neutral', 'layers')}${badge(i.t('assets.mascotReady', { count: i.number(p.mascot.artwork_ready) }), p.mascot.artwork_ready ? 'success' : 'neutral', 'image')}</div>
          <p class="muted">${i.t('assets.mascotHonest')}</p>
          <div class="three-col">
            ${countTable(ctx, i.t('assets.mascotByStatus'), p.mascot.by_status)}
            ${countTable(ctx, i.t('assets.mascotByCategory'), p.mascot.by_category)}
            <div><h3 class="subhead">${i.t('assets.stages')}</h3><ol class="count-list">${p.mascot.stages.map((stage) => html`<li><span dir="auto">${stage.name}</span>${badge(stage.status, stage.status === 'approved' ? 'success' : 'warning')}</li>`)}</ol></div>
          </div>
        </section>`
      : ''}`
  return brandShell(ctx, view, 'assets', i.t('assets.title'), body, flash)
}

function docPicker(ctx: ViewContext, base: string, kinds: DocumentKind[], current: DocumentKind, titles: Partial<Record<DocumentKind, string>>): SafeHtml {
  return html`<nav class="tabs" aria-label="${ctx.i.t('doc.pick')}"><ul>${kinds.map(
    (kind) => html`<li><a class="tab ${kind === current ? 'is-active' : ''}" href="${base}?doc=${kind}" ${kind === current ? html`aria-current="page"` : ''} dir="auto">${titles[kind] ?? kind}</a></li>`,
  )}</ul></nav>`
}

export function businessPage(ctx: ViewContext, view: BrandView, doc: string | null, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  if (!p) return brandShell(ctx, view, 'business', i.t('business.title'), html``, flash)
  const kinds: DocumentKind[] = ['business-plan', 'marketing-plan']
  const current = kinds.includes(doc as DocumentKind) ? (doc as DocumentKind) : 'business-plan'
  const titles = Object.fromEntries(kinds.map((kind) => [kind, p.documents[kind]?.title ?? kind])) as Partial<Record<DocumentKind, string>>
  const modules = p.modules.filter((module) => module.group === 'business')
  const body = html`${brandHeader(ctx, view, i.t('business.title'), i.t('business.subtitle'))}
    <section class="card" aria-labelledby="modules-title">
      <h2 class="card-title" id="modules-title">${i.t('business.modules')}</h2>
      ${modules.length
        ? html`<div class="table-wrap"><table class="table">
            <thead><tr><th scope="col">${i.t('common.module')}</th><th scope="col">${i.t('overview.coverage')}</th><th scope="col">${i.t('overview.approval')}</th><th scope="col">${i.t('overview.requiredUnanswered')}</th><th scope="col">${i.t('overview.pending')}</th></tr></thead>
            <tbody>${modules.map((module) => html`<tr><th scope="row" dir="auto">${module.title}</th><td><div class="cell-bar">${ratioBar(module.coverage, i.percent(module.coverage))}<span>${i.percent(module.coverage)}</span></div></td><td>${i.percent(module.approval)}</td><td>${i.number(module.required_unanswered)}</td><td>${i.number(module.pending_review)}</td></tr>`)}</tbody>
          </table></div>`
        : html`<p class="muted">${i.t('business.empty')}</p>`}
    </section>
    ${docPicker(ctx, `/brands/${view.record.slug}/business`, kinds, current, titles)}
    ${p.documents[current] ? documentView(i, p.documents[current]!, current) : ''}`
  return brandShell(ctx, view, 'business', i.t('business.title'), body, flash)
}

export function personalPage(ctx: ViewContext, view: BrandView, doc: string | null, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection!
  const personal = p.personal!
  const kinds = personal.documents
  const current = kinds.includes(doc as DocumentKind) ? (doc as DocumentKind) : (kinds[0] ?? 'personal-brand-book')
  const titles = Object.fromEntries(kinds.map((kind) => [kind, p.documents[kind]?.title ?? kind])) as Partial<Record<DocumentKind, string>>
  const body = html`${brandHeader(ctx, view, i.t('personal.title'), i.t('personal.subtitle'))}
    <div class="facts-strip"><span class="muted">${i.t('personal.facets')}:</span> ${personal.facets.length ? join(personal.facets.map((facet) => badge(i.t(`wizard.facet.${facet}` as MessageKey), 'accent', 'user'))) : html`<span class="muted">${i.t('personal.noFacets')}</span>`}</div>
    ${kinds.length ? html`${docPicker(ctx, `/brands/${view.record.slug}/personal`, kinds, current, titles)}${p.documents[current] ? documentView(i, p.documents[current]!, current) : ''}` : emptyState({ icon: 'user', title: i.t('personal.title'), body: i.t('doc.empty') })}`
  return brandShell(ctx, view, 'personal', i.t('personal.title'), body, flash)
}

export function historyPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const p = view.cached.projection
  if (!p) return brandShell(ctx, view, 'history', i.t('history.title'), html``, flash)
  const history = view.cached.history
  const stateTone = (state: string): Tone => (state === 'approved' ? 'success' : state === 'change_pending' ? 'info' : 'warning')
  const stateKey = (state: string): string => {
    const key = `history.state.${state}` as MessageKey
    return ['draft', 'change_pending', 'approved'].includes(state) ? i.t(key) : state
  }
  const body = html`${brandHeader(ctx, view, i.t('history.title'), i.t('history.subtitle'))}
    ${history?.error ? banner({ tone: 'warning', body: i.t('history.historyError', { reason: history.error }) }) : ''}
    <div class="two-col">
      <section class="card" aria-labelledby="commits-title">
        <h2 class="card-title" id="commits-title">${i.t('history.commits')}</h2>
        <p class="muted small">${i.t('sync.canonical')}</p>
        ${history?.commits.length ? commitList(ctx, history.commits) : html`<p class="muted">${i.t('history.commitsEmpty')}</p>`}
      </section>
      <section class="card" aria-labelledby="pulls-title">
        <h2 class="card-title" id="pulls-title">${i.t('history.pulls')}</h2>
        ${banner({ tone: 'warning', body: i.t('history.pullsNote') })}
        ${history?.pulls.length
          ? html`<ul class="pull-list">${history.pulls.map((pull) => {
              const url = safeGitHubUrl(pull.html_url)
              return html`<li class="pull">${icon('pr', 'commit-icon')}<div class="commit-body"><p class="commit-title" dir="auto">${url ? html`<a href="${url}" target="_blank" rel="noopener noreferrer">#${pull.number} ${pull.title}<span class="visually-hidden"> ${i.t('common.opensNewTab')}</span></a>` : html`#${pull.number} ${pull.title}`}</p><p class="commit-meta muted">${code(pull.head_ref)} · ${i.relative(pull.updated_at, ctx.now)}</p></div><div class="pull-badges">${badge(i.t('history.noncanonical'), 'warning', 'alert')}${pull.draft ? badge(i.t('history.draftPr'), 'neutral') : ''}</div></li>`
            })}</ul>`
          : html`<p class="muted">${i.t('history.pullsEmpty')}</p>`}
      </section>
    </div>
    <section class="card" aria-labelledby="review-title">
      <h2 class="card-title" id="review-title">${i.t('history.review')}</h2>
      <p class="muted">${i.t('history.reviewHint')}</p>
      ${p.review.length
        ? html`<div class="table-wrap"><table class="table">
            <thead><tr><th scope="col">${i.t('common.question')}</th><th scope="col">${i.t('common.status')}</th><th scope="col">${i.t('history.draftValue')}</th><th scope="col">${i.t('history.approvedValue')}</th></tr></thead>
            <tbody>${p.review.map(
              (item) => html`<tr>
                <th scope="row"><span dir="auto">${item.label}</span><br>${code(item.question_id, 'muted small')}</th>
                <td>${badge(stateKey(item.state), stateTone(item.state))}</td>
                <td>${item.withheld ? html`${icon('lock')} ${i.t('common.withheld')}` : item.draft_value !== null ? html`<span class="draft-value" dir="auto">${item.draft_value}</span>` : '—'}</td>
                <td>${item.withheld ? html`${icon('lock')} ${i.t('common.withheld')}` : item.approved_value !== null ? html`<span dir="auto">${item.approved_value}</span> ${item.approved_version !== null ? html`<span class="muted small">${i.t('common.version', { version: item.approved_version })}</span>` : ''}` : '—'}</td>
              </tr>`,
            )}</tbody>
          </table></div>`
        : html`<p class="muted">${i.t('history.reviewEmpty')}</p>`}
    </section>
    ${p.contradictions.length
      ? html`<section class="card" id="contradictions" aria-labelledby="contradictions-title"><h2 class="card-title" id="contradictions-title">${i.t('history.contradictions')}</h2>
          <ul class="contradiction-list">${p.contradictions.map((item) => html`<li>${badge(item.severity, item.severity === 'high' ? 'danger' : 'warning', 'alert')} <span dir="auto">${item.message}</span> ${join(item.fields.map((field) => code(field, 'muted small')), ' ')}</li>`)}</ul></section>`
      : ''}`
  return brandShell(ctx, view, 'history', i.t('history.title'), body, flash)
}

export function handoffPage(ctx: ViewContext, view: BrandView, flash: string | null): SafeHtml {
  const { i } = ctx
  const repoUrl = safeGitHubUrl(view.record.repo.html_url) ?? `https://github.com/${view.record.repo.owner}/${view.record.repo.name}`
  const loop = (['handoff.loop1', 'handoff.loop2', 'handoff.loop3', 'handoff.loop4', 'handoff.loop5'] as const).map((key) => html`<li>${i.t(key)}</li>`)
  const body = html`${pageHeader({ eyebrow: html`${brandAvatar(view.record.display_name)} <span dir="auto">${view.record.display_name}</span>`, title: i.t('handoff.title'), subtitle: i.t('handoff.subtitle') })}
    ${banner({ tone: 'warning', title: i.t('handoff.accessTitle'), body: i.t('handoff.accessBody') })}
    <div class="two-col two-col-wide">
      <section class="card" aria-labelledby="handoff-copy">
        <h2 class="visually-hidden" id="handoff-copy">${i.t('handoff.title')}</h2>
        ${copyBlock({ id: 'repo-url', label: i.t('handoff.repoUrl'), text: repoUrl, buttonLabel: i.t('handoff.copyUrl'), i })}
        <div class="button-row">${externalLink(repoUrl, i.t('common.openOnGitHub'), i)}</div>
        ${copyBlock({ id: 'starter-prompt', label: i.t('handoff.prompt'), text: starterPrompt({ slug: view.record.slug, repoUrl }), buttonLabel: i.t('handoff.copyPrompt'), multiline: true, i })}
        <p class="field-hint">${i.t('handoff.promptHint')}</p>
      </section>
      <div class="stack">
        <section class="card" aria-labelledby="clone-title">
          <h2 class="card-title" id="clone-title">${icon('terminal')} ${i.t('handoff.cloneTitle')}</h2>
          <p class="muted">${i.t('handoff.cloneBody')}</p>
          ${copyBlock({ id: 'clone-cmd', label: 'git clone', text: cloneCommand(repoUrl), buttonLabel: i.t('common.copy'), i })}
        </section>
        <section class="card" aria-labelledby="loop-title">
          <h2 class="card-title" id="loop-title">${i.t('handoff.loopTitle')}</h2>
          <ol class="steps-list">${loop}</ol>
        </section>
      </div>
    </div>`
  return brandShell(ctx, view, 'handoff', i.t('handoff.title'), body, flash)
}

/* ---------------------------------------------------------------- account */

export interface AccountState {
  mfa: boolean
  sessionEndsAt: string
  readConfigured: boolean
  provisionConfigured: boolean
  template: string
  allowedOwners: string[]
  webhookConfigured: boolean
  test: { read: string | null; provision: string | null; error: string | null } | null
}

export function accountPage(ctx: ViewContext, state: AccountState): SafeHtml {
  const { i } = ctx
  const yesNo = (on: boolean): SafeHtml => (on ? badge(i.t('common.configured'), 'success', 'checkCircle') : badge(i.t('common.notConfigured'), 'neutral', 'circle'))
  const body = html`${pageHeader({ title: i.t('account.title'), subtitle: i.t('account.subtitle') })}
    <div class="two-col">
      <section class="card" aria-labelledby="session-title">
        <h2 class="card-title" id="session-title">${i.t('account.session')}</h2>
        <dl class="meta-list">
          <div><dt>${i.t('login.login')}</dt><dd class="mono" dir="ltr">${ctx.login ?? ''}</dd></div>
          <div><dt>${i.t('account.mfa')}</dt><dd>${state.mfa ? badge(i.t('account.mfaOn'), 'success', 'shield') : badge(i.t('account.mfaOff'), 'warning', 'alert')}</dd></div>
          <div><dt>${i.t('common.status')}</dt><dd>${i.t('account.expires', { time: i.dateTime(state.sessionEndsAt) })}</dd></div>
        </dl>
      </section>
      <section class="card" aria-labelledby="github-title">
        <h2 class="card-title" id="github-title">${i.t('account.github')}</h2>
        <dl class="meta-list">
          <div><dt>${i.t('account.readAccess')}</dt><dd>${yesNo(state.readConfigured)}</dd></div>
          <div><dt>${i.t('account.provisionAccess')}</dt><dd>${yesNo(state.provisionConfigured)}</dd></div>
          <div><dt>${i.t('account.template')}</dt><dd>${code(state.template)}</dd></div>
          <div><dt>${i.t('account.allowedOwners')}</dt><dd>${state.allowedOwners.length ? join(state.allowedOwners.map((owner) => code(owner)), ' ') : '—'}</dd></div>
          <div><dt>${i.t('account.webhook')}</dt><dd>${yesNo(state.webhookConfigured)}</dd></div>
        </dl>
        <p class="muted small">${icon('shield')} ${i.t('account.capabilities')}</p>
        ${state.test
          ? state.test.error
            ? banner({ tone: 'danger', body: i.t('account.testFailed', { reason: state.test.error }), live: true })
            : banner({ tone: 'success', body: i.t('account.testOk', { login: [state.test.read, state.test.provision].filter(Boolean).join(', ') }), live: true })
          : ''}
        <a class="btn btn-secondary" href="/account?test=1">${icon('refresh')}<span>${i.t('account.test')}</span></a>
      </section>
    </div>`
  return shell(ctx, { title: i.t('account.title'), crumbs: [{ label: i.t('nav.account') }], content: body })
}

export type { StudioProjection }
