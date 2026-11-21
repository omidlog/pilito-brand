import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { applyInit, InterviewEngine, latestAnswers, loadProfile, normalizeStructured, parseStructured, writeStarterWorkspace } from '@brand-os/brand-core'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

function latest(engine: InterviewEngine, id: string) {
  return latestAnswers(engine.ledger().records).get(id)
}

function workspace(): InterviewEngine {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-structured-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Structured Brand', slug: 'structured-brand', industry: 'education', language: 'en', languages: ['en', 'fa', 'tr'], mascot: false, gamification: false, publish: 'private' })
  return new InterviewEngine(root)
}

test('color answers are validated and stored in canonical form', () => {
  const ok = normalizeStructured('color', 'primary: #123a73, onPrimary #fff\nsurface=#F7F5F2')
  assert.deepEqual(ok, { ok: true, value: 'primary #123A73; onPrimary #FFFFFF; surface #F7F5F2' })
  assert.equal(normalizeStructured('color', 'primary #12345').ok, false)
  assert.equal(normalizeStructured('color', 'primary #123A73; primary #FFFFFF').ok, false)
  // A role becomes a token id, so it must be ASCII. The message says so in English (base language).
  const persianRole = normalizeStructured('color', 'اصلی #123A73')
  assert.equal(persianRole.ok, false)
  assert.match(persianRole.ok ? '' : persianRole.message, /Latin letter/)
  // Arabic-script separators are accepted.
  assert.deepEqual(normalizeStructured('color', 'primary #123A73؛ surface #FFFFFF'), { ok: true, value: 'primary #123A73; surface #FFFFFF' })
  const parsed = parseStructured('color', ok.ok ? ok.value : '')
  assert.deepEqual(parsed, { type: 'color', colors: [{ role: 'primary', hex: '#123A73' }, { role: 'onPrimary', hex: '#FFFFFF' }, { role: 'surface', hex: '#F7F5F2' }] })
})

test('font answers need a fallback and accept an optional scale', () => {
  const ok = normalizeStructured('font', 'body: "Inter", system-ui, sans-serif @ 16px/1.5; display: Georgia, serif @ 40px')
  assert.deepEqual(ok, { ok: true, value: 'body: Inter, system-ui, sans-serif @ 16px/1.5; display: Georgia, serif @ 40px' })
  assert.equal(normalizeStructured('font', 'body: Inter').ok, false, 'a family alone has no fallback')
  assert.equal(normalizeStructured('font', 'body: Inter, sans-serif @ 2px').ok, false)
  assert.equal(normalizeStructured('font', 'body: Inter, sans-serif @ large').ok, false)
  // Persian digits in the scale are read as numbers.
  assert.deepEqual(normalizeStructured('font', 'body: Vazirmatn, Tahoma, sans-serif @ ۱۶px/۱٫۶'), { ok: true, value: 'body: Vazirmatn, Tahoma, sans-serif @ 16px/1.6' })
  const parsed = parseStructured('font', ok.ok ? ok.value : '')
  assert.deepEqual(parsed?.type === 'font' ? parsed.fonts[0] : null, { role: 'body', family: 'Inter', fallback: ['system-ui', 'sans-serif'], size_px: 16, line_height: 1.5 })
})

test('logo specs need a minimum size and a clear space', () => {
  assert.deepEqual(normalizeStructured('logo_spec', 'Min size: 24px, clear-space: 0.5x'), { ok: true, value: 'min-size: 24px; clear-space: 0.5x' })
  assert.deepEqual(normalizeStructured('logo_spec', 'min-size: 32px; clear-space: 16px; min-print: 10mm'), { ok: true, value: 'min-size: 32px; clear-space: 16px; min-print: 10mm' })
  assert.equal(normalizeStructured('logo_spec', 'min-size: 24px').ok, false)
  assert.equal(normalizeStructured('logo_spec', 'min-size: -4px; clear-space: 1x').ok, false)
  assert.equal(normalizeStructured('logo_spec', 'min-size: 24px; clear-space: 9x').ok, false)
  assert.equal(normalizeStructured('logo_spec', 'TBD').ok, false)
  const parsed = parseStructured('logo_spec', 'min-size: 24px; clear-space: 0.5x')
  assert.deepEqual(parsed, { type: 'logo_spec', logo: { min_size_px: 24, clear_space: { value: 0.5, unit: 'x' }, min_print_mm: null } })
})

test('voice pairs keep do and don’t text in any language', () => {
  const ok = normalizeStructured('voice_pairs', 'do: Say what happened | don’t: Blame the user\nبه زبان ساده بنویس | از اصطلاحات فنی استفاده نکن\nKısa yaz | Uzun paragraflar kurma')
  assert.equal(ok.ok, true)
  const parsed = parseStructured('voice_pairs', ok.ok ? ok.value : '')
  assert.deepEqual(parsed, {
    type: 'voice_pairs',
    pairs: [
      { do: 'Say what happened', dont: 'Blame the user' },
      { do: 'به زبان ساده بنویس', dont: 'از اصطلاحات فنی استفاده نکن' },
      { do: 'Kısa yaz', dont: 'Uzun paragraflar kurma' },
    ],
  })
  assert.equal(normalizeStructured('voice_pairs', 'only one side').ok, false)
  assert.equal(normalizeStructured('voice_pairs', 'a | b | c').ok, false)
})

test('structured founder-core questions record canonical drafts and reject invalid input', () => {
  const engine = workspace()
  const profile = loadProfile(engine.workspaceRoot(), 'founder-core')
  for (const id of ['brand.color.roles', 'brand.type.scale', 'brand.logo.min_size', 'brand.verbal.voice_pairs']) {
    assert.ok(profile?.question_ids.includes(id), `${id} is in founder-core`)
  }
  assert.equal(engine.question('brand.color.roles')?.question_type, 'color')
  assert.equal(engine.question('brand.type.scale')?.question_type, 'font')
  assert.equal(engine.question('brand.logo.min_size')?.question_type, 'logo_spec')
  assert.equal(engine.question('brand.verbal.voice_pairs')?.question_type, 'voice_pairs')

  const bad = engine.answerQuestion('brand.color.roles', 'a nice blue')
  assert.equal(bad.kind, 'error')
  assert.match(bad.message, /role #RRGGBB/)
  const good = engine.answerQuestion('brand.color.roles', 'primary #123a73')
  assert.equal(good.kind, 'recorded', good.message)
  assert.equal(latest(engine, 'brand.color.roles')?.value, 'primary #123A73')
  // Dispositions still work on structured questions and store no value.
  const unknown = engine.answerQuestion('brand.logo.min_size', 'unknown')
  assert.equal(unknown.kind, 'recorded')
  assert.equal(latest(engine, 'brand.logo.min_size')?.status, 'unknown')
  assert.equal(latest(engine, 'brand.logo.min_size')?.value, null)
})
