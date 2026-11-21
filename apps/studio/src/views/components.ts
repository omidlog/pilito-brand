import type { DocumentItem, DocumentModel, DocumentSection, ItemTag, StructuredValue } from '@brand-os/brand-core'
import type { I18n, MessageKey } from '../i18n/index.js'
import { escapeHtml, html, join, safeHex, type SafeHtml } from './html.js'
import { icon, type IconName } from './icons.js'

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

/** Status is always text plus icon plus color, never color alone. */
export function badge(text: string, tone: Tone = 'neutral', iconName?: IconName, title?: string): SafeHtml {
  return html`<span class="badge badge-${tone}" ${title ? html`title="${title}"` : ''}>${iconName ? icon(iconName) : ''}<span>${text}</span></span>`
}

const TAG_TONE: Record<ItemTag, { tone: Tone; icon: IconName }> = {
  approved: { tone: 'success', icon: 'checkCircle' },
  assumption: { tone: 'warning', icon: 'clock' },
  recommendation: { tone: 'info', icon: 'sparkle' },
  missing: { tone: 'neutral', icon: 'circle' },
}

export function tagBadge(i: I18n, tag: ItemTag): SafeHtml {
  const meta = TAG_TONE[tag]
  return badge(i.t(`doc.tag.${tag}` as MessageKey), meta.tone, meta.icon, i.t(`doc.tagHint.${tag}` as MessageKey))
}

export function verificationBadge(i: I18n, value: DocumentItem['verification']): SafeHtml {
  if (!value) return html``
  const tone: Tone = value === 'verified' ? 'success' : value === 'owner_stated' ? 'accent' : value === 'unverified' ? 'warning' : 'neutral'
  const name: IconName = value === 'verified' ? 'shield' : value === 'unverified' ? 'alert' : 'user'
  return badge(i.t(`doc.verification.${value}` as MessageKey), tone, name)
}

export function pageHeader(input: { title: string; subtitle?: string; eyebrow?: SafeHtml | string; actions?: SafeHtml; meta?: SafeHtml }): SafeHtml {
  return html`<header class="page-header">
    <div class="page-header-text">
      ${input.eyebrow ? html`<div class="eyebrow">${input.eyebrow}</div>` : ''}
      <h1 class="page-title" dir="auto">${input.title}</h1>
      ${input.subtitle ? html`<p class="page-subtitle">${input.subtitle}</p>` : ''}
      ${input.meta ? html`<div class="page-meta">${input.meta}</div>` : ''}
    </div>
    ${input.actions ? html`<div class="page-actions">${input.actions}</div>` : ''}
  </header>`
}

export function banner(input: { tone: Tone; title?: string; body: SafeHtml | string; actions?: SafeHtml; live?: boolean; id?: string }): SafeHtml {
  const name: IconName = input.tone === 'success' ? 'checkCircle' : input.tone === 'danger' ? 'error' : input.tone === 'warning' ? 'alert' : 'info'
  const role = input.live ? (input.tone === 'danger' ? 'alert' : 'status') : null
  return html`<div class="banner banner-${input.tone}" ${role ? html`role="${role}"` : ''} ${input.id ? html`id="${input.id}"` : ''}>
    ${icon(name, 'banner-icon')}
    <div class="banner-body">
      ${input.title ? html`<p class="banner-title">${input.title}</p>` : ''}
      <div class="banner-text">${input.body}</div>
      ${input.actions ? html`<div class="banner-actions">${input.actions}</div>` : ''}
    </div>
  </div>`
}

export function emptyState(input: { icon: IconName; title: string; body: string; action?: SafeHtml }): SafeHtml {
  return html`<div class="empty-state">
    <div class="empty-icon">${icon(input.icon)}</div>
    <h2 class="empty-title">${input.title}</h2>
    <p class="empty-body">${input.body}</p>
    ${input.action ?? ''}
  </div>`
}

/** A horizontal ratio bar drawn in SVG (no inline styles, so the strict CSP holds). */
export function ratioBar(ratio: number, label: string, tone: 'accent' | 'success' = 'accent'): SafeHtml {
  const pct = Math.max(0, Math.min(100, Math.round((Number.isFinite(ratio) ? ratio : 0) * 100)))
  return html`<svg class="ratio-bar ratio-${tone}" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="${label}"><rect class="ratio-track" width="100" height="6" rx="3"/><rect class="ratio-fill" width="${pct}" height="6" rx="3"/></svg>`
}

export function statCard(input: { label: string; value: string; hint: string; ratio?: number; tone?: 'accent' | 'success' }): SafeHtml {
  return html`<div class="stat-card">
    <p class="stat-label">${input.label}</p>
    <p class="stat-value">${input.value}</p>
    ${input.ratio !== undefined ? ratioBar(input.ratio, `${input.label}: ${input.value}`, input.tone) : ''}
    <p class="stat-hint">${input.hint}</p>
  </div>`
}

export function code(value: string, className = ''): SafeHtml {
  return html`<code class="mono ${className}" dir="ltr">${value}</code>`
}

export function shortSha(sha: string | null): string {
  return sha ? sha.slice(0, 7) : '—'
}

export function copyBlock(input: { id: string; label: string; text: string; buttonLabel: string; multiline?: boolean; i: I18n }): SafeHtml {
  return html`<div class="copy-block">
    <div class="copy-head">
      <label class="field-label" for="${input.id}">${input.label}</label>
      <button type="button" class="btn btn-secondary btn-sm" data-copy-target="${input.id}" data-copied="${input.i.t('common.copied')}" data-copy-failed="${input.i.t('common.copyFailed')}">${icon('copy')}<span>${input.buttonLabel}</span></button>
    </div>
    ${input.multiline
      ? html`<textarea id="${input.id}" class="copy-text mono" dir="ltr" readonly rows="14" spellcheck="false">${input.text}</textarea>`
      : html`<input id="${input.id}" class="copy-text mono" dir="ltr" readonly value="${input.text}" spellcheck="false">`}
  </div>`
}

export function externalLink(href: string, label: SafeHtml | string, i: I18n, className = 'btn btn-secondary'): SafeHtml {
  return html`<a class="${className}" href="${href}" target="_blank" rel="noopener noreferrer">${label}${icon('external')}<span class="visually-hidden">${i.t('common.opensNewTab')}</span></a>`
}

function swatch(hex: string, label: string): SafeHtml {
  return html`<svg class="swatch-chip" role="img" aria-label="${label}"><rect width="100%" height="100%" fill="${hex}"/></svg>`
}

export function colorSwatch(input: { hex: string | null; name: string; meta?: SafeHtml; i: I18n }): SafeHtml {
  const hex = safeHex(input.hex)
  return html`<figure class="swatch">
    ${hex ? swatch(hex, `${input.name} ${hex}`) : html`<span class="swatch-chip swatch-empty" aria-hidden="true"></span>`}
    <figcaption><span class="swatch-name" dir="auto">${input.name}</span><span class="swatch-hex mono" dir="ltr">${hex ?? '—'}</span>${input.meta ?? ''}</figcaption>
  </figure>`
}

/** Font specimen in SVG so the family is a presentation attribute, not an inline style. */
export function fontSpecimen(family: string, fallback: string[], sample: string, label: string): SafeHtml {
  const families = [family, ...fallback].map((name) => name.replace(/["<>&;{}]/g, '')).filter(Boolean).join(', ')
  return html`<svg class="font-specimen" viewBox="0 0 640 72" role="img" aria-label="${label}"><text x="0" y="48" font-family="${families}" font-size="34" class="font-specimen-text">${sample}</text></svg>`
}

function structured(i: I18n, value: StructuredValue): SafeHtml {
  switch (value.type) {
    case 'color':
      return html`<div class="swatch-grid">${value.colors.map((color) => colorSwatch({ hex: color.hex, name: color.role, i }))}</div>`
    case 'font':
      return html`<div class="specimen-list">${value.fonts.map(
        (font) => html`<div class="specimen">
          <div class="specimen-meta"><span class="specimen-role">${font.role}</span><span class="mono" dir="ltr">${font.family}${font.size_px ? ` · ${font.size_px}px` : ''}${font.line_height ? ` / ${font.line_height}` : ''}</span></div>
          ${fontSpecimen(font.family, font.fallback, i.t('design.specimen'), `${font.role}: ${font.family}`)}
        </div>`,
      )}</div>`
    case 'logo_spec':
      return html`<dl class="spec-list">
        <div><dt>min_size_px</dt><dd class="mono" dir="ltr">${value.logo.min_size_px}px</dd></div>
        <div><dt>clear_space</dt><dd class="mono" dir="ltr">${value.logo.clear_space.value}${value.logo.clear_space.unit}</dd></div>
        <div><dt>min_print_mm</dt><dd class="mono" dir="ltr">${value.logo.min_print_mm ?? '—'}</dd></div>
      </dl>`
    case 'voice_pairs':
      return html`<div class="voice-pairs">${value.pairs.map(
        (pair) => html`<div class="voice-pair"><p class="voice-do">${icon('check')}<span class="visually-hidden">${i.t('design.pairDo')}: </span><span dir="auto">${pair.do}</span></p><p class="voice-dont">${icon('close')}<span class="visually-hidden">${i.t('design.pairDont')}: </span><span dir="auto">${pair.dont}</span></p></div>`,
      )}</div>`
    case 'relationships':
      return html`<ul class="relationship-list">${value.relationships.map(
        (rel) => html`<li><span class="badge badge-neutral">${rel.relation}</span> <span dir="auto">${rel.organization}</span> <span class="mono muted" dir="ltr">${rel.from || '?'} – ${rel.to || '…'}</span> <span class="muted">ownership: ${rel.ownership}</span></li>`,
      )}</ul>`
  }
}

export function itemValue(i: I18n, item: DocumentItem): SafeHtml {
  if (item.withheld) return html`<p class="item-withheld">${icon('lock')}<span>${i.t('common.withheld')}</span> <span class="muted">${i.t('common.withheldNote')}</span></p>`
  if (item.structured) return structured(i, item.structured)
  if (item.value === null || item.value === '') return html`<p class="item-missing muted">${item.note ?? i.t('doc.missingValue')}</p>`
  return html`<p class="item-text" dir="auto">${String(item.value)}</p>`
}

function sectionBadge(i: I18n, status: DocumentSection['status']): SafeHtml {
  const tone: Tone = status === 'complete' ? 'success' : status === 'partial' ? 'warning' : 'neutral'
  return badge(i.t(`doc.section.${status}` as MessageKey), tone, status === 'complete' ? 'checkCircle' : status === 'partial' ? 'clock' : 'circle')
}

export function documentItem(i: I18n, item: DocumentItem): SafeHtml {
  return html`<article class="doc-item doc-item-${item.tag}">
    <header class="doc-item-head">
      <h4 class="doc-item-label" dir="auto">${item.label}</h4>
      <div class="doc-item-badges">${tagBadge(i, item.tag)}${verificationBadge(i, item.verification)}</div>
    </header>
    ${itemValue(i, item)}
    ${item.note && item.value !== null && !item.withheld ? html`<p class="doc-item-note muted" dir="auto">${item.note}</p>` : ''}
    <footer class="doc-item-foot">
      ${item.source_ids.length ? html`<span class="muted">${i.t('common.sources')}:</span> ${join(item.source_ids.slice(0, 4).map((id) => code(id, 'source-id')), ' ')}` : ''}
      ${item.version !== null ? html`<span class="muted">${i.t('common.version', { version: item.version })}</span>` : ''}
    </footer>
  </article>`
}

/** Corebook-style reader: chapter index plus editorial sections, each item tagged with status and source. */
export function documentView(i: I18n, model: DocumentModel, idPrefix: string): SafeHtml {
  if (model.sections.length === 0) return emptyState({ icon: 'book', title: model.title, body: i.t('doc.empty') })
  const counts = (['approved', 'assumption', 'recommendation', 'missing'] as const).map(
    (tag) => html`<li>${tagBadge(i, tag)}<span class="count">${i.number(model.counts[tag] ?? 0)}</span></li>`,
  )
  return html`<div class="doc-layout">
    <nav class="doc-toc" aria-label="${i.t('doc.chapters')}">
      <p class="toc-title">${i.t('doc.chapters')}</p>
      <ol>${model.sections.map((section) => html`<li><a href="#${idPrefix}-${section.id}"><span dir="auto">${section.title}</span>${sectionBadge(i, section.status)}</a></li>`)}</ol>
    </nav>
    <div class="doc-body">
      <section class="doc-counts" aria-label="${i.t('doc.counts')}"><ul>${counts}</ul></section>
      ${model.sections.map(
        (section) => html`<section class="doc-section" id="${idPrefix}-${section.id}" aria-labelledby="${idPrefix}-${section.id}-title">
          <header class="doc-section-head">
            <h3 id="${idPrefix}-${section.id}-title" dir="auto">${section.title}</h3>
            ${sectionBadge(i, section.status)}
          </header>
          ${section.purpose ? html`<p class="doc-section-purpose" dir="auto">${section.purpose}</p>` : ''}
          ${section.length ? html`<p class="doc-length muted">${i.t('doc.length', { min: section.length.guideline[0], max: section.length.guideline[1], words: section.length.approved_words })}</p>` : ''}
          <div class="doc-items">${section.items.map((item) => documentItem(i, item))}</div>
        </section>`,
      )}
    </div>
  </div>`
}

export function escapeAttr(value: string): string {
  return escapeHtml(value)
}
