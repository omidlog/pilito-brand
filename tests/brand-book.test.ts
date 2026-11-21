import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  applyInit,
  buildBrandBook,
  buildBusinessPlan,
  buildMarketingPlan,
  ensureApprovalSecret,
  InterviewEngine,
  renderDocumentMarkdown,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { DocumentItem, DocumentModel } from '@brand-os/brand-core'
import { prepareDocs } from '../scripts/prepare-docs.js'
import { scanPublicTree } from '../scripts/scan-public.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const repo = path.resolve(import.meta.dirname, '..')
const SLUG = 'book-brand'

function brand(): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-book-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Book Brand', slug: SLUG, industry: 'education', language: 'en', languages: ['en', 'fa', 'tr'], mascot: false, gamification: false, publish: 'public' })
  return { root, engine: new InterviewEngine(root), proof: ensureApprovalSecret(root) }
}

function answer(engine: InterviewEngine, id: string, value: string): void {
  const result = engine.answerQuestion(id, value)
  assert.equal(result.kind, 'recorded', result.message)
}

function approve(engine: InterviewEngine, proof: string, ids: string[]): void {
  const result = engine.approvals().approveBatch({ ids }, proof)
  assert.equal(result.approved, ids.length, JSON.stringify(result.results))
}

function items(model: DocumentModel): DocumentItem[] {
  return model.sections.flatMap((section) => section.items)
}

function item(model: DocumentModel, id: string): DocumentItem | undefined {
  return items(model).find((entry) => entry.id === id)
}

test('a fresh brand book lists every section and shows missing sections as missing', () => {
  const { engine } = brand()
  for (const audience of ['internal', 'public'] as const) {
    const book = buildBrandBook(engine, audience)
    assert.deepEqual(book.sections.map((section) => section.id), ['overview', 'strategy', 'verbal', 'color', 'type', 'logo', 'governance'])
    for (const section of book.sections) {
      assert.equal(section.status, 'missing', `${audience} ${section.id}`)
      for (const entry of section.items.filter((candidate) => candidate.tag !== 'recommendation')) {
        assert.equal(entry.tag, 'missing')
        assert.equal(entry.value, null, 'nothing is invented')
        assert.ok(entry.source_ids.includes(entry.id))
      }
    }
    assert.equal(book.counts.approved, 0)
  }
  const markdown = renderDocumentMarkdown(buildBrandBook(engine, 'internal'))
  assert.match(markdown, /## Color\n\n.*Status: missing\./)
  assert.match(markdown, /### Color roles\n\n\*\*Missing\*\* — Not answered yet\./)
})

test('items are tagged approved, assumption, recommendation or missing, with source ids', () => {
  const { engine, proof } = brand()
  answer(engine, 'brand.color.roles', 'primary #0B2A55; surface #F7F5F2')
  answer(engine, 'brand.verbal.voice_pairs', 'Say what happened | Blame the user\nبه زبان ساده بنویس | از اصطلاحات فنی استفاده نکن')
  approve(engine, proof, ['brand.color.roles', 'brand.verbal.voice_pairs'])
  answer(engine, 'brand.strategy.purpose', 'Help every learner keep going.')
  answer(engine, 'brand.color.contrast', 'unknown')
  // An agent proposal is a recommendation until a human approves it.
  const question = engine.question('brand.strategy.values')
  assert.ok(question)
  engine.recordProposal(question, 'Clarity, patience', { state: 'proposed', confidence: 0.6, quotation: 'clarity and patience', sourceReference: 'test', uncertainty: 'Agent proposal.' })

  const book = buildBrandBook(engine, 'internal')
  const color = item(book, 'brand.color.roles')
  assert.equal(color?.tag, 'approved')
  assert.equal(color?.version, 1)
  assert.deepEqual(color?.structured, { type: 'color', colors: [{ role: 'primary', hex: '#0B2A55' }, { role: 'surface', hex: '#F7F5F2' }] })
  assert.ok(color?.source_ids.some((id) => id.startsWith('revision:')))
  const voice = item(book, 'brand.verbal.voice_pairs')
  assert.equal(voice?.structured?.type, 'voice_pairs')
  assert.equal(voice?.structured?.type === 'voice_pairs' ? voice.structured.pairs[1]?.do : null, 'به زبان ساده بنویس')

  assert.equal(item(book, 'brand.strategy.purpose')?.tag, 'assumption')
  assert.equal(item(book, 'brand.color.contrast')?.tag, 'missing')
  assert.match(item(book, 'brand.color.contrast')?.note ?? '', /unknown/)
  const values = item(book, 'brand.strategy.values')
  assert.equal(values?.tag, 'recommendation')
  assert.match(values?.note ?? '', /Agent suggestion/)

  const recommendations = items(book).filter((entry) => entry.tag === 'recommendation')
  assert.ok(recommendations.some((entry) => entry.id.startsWith('template:')), 'template guidance is included internally')
  for (const entry of items(book)) {
    if (entry.id.startsWith('template:')) assert.equal(entry.tag, 'recommendation', 'template guidance is never labelled approved')
    if (entry.tag === 'approved') assert.ok(!entry.id.startsWith('template:') && engine.question(entry.id), 'approved items are facts')
  }
  assert.equal(book.sections.find((section) => section.id === 'color')?.status, 'partial')
  const markdown = renderDocumentMarkdown(book)
  assert.match(markdown, /\| primary \| `#0B2A55` \|/)
  assert.match(markdown, /\| Say what happened \| Blame the user \|/)
  assert.match(markdown, /\*\*Recommendation\*\* — Agent suggestion/)
})

test('business and marketing plans share the model and withhold restricted values', () => {
  const { engine, proof } = brand()
  answer(engine, 'business.offer.summary', 'A flashcard app for students.')
  approve(engine, proof, ['business.offer.summary'])
  const plan = buildBusinessPlan(engine, 'internal')
  assert.equal(plan.kind, 'business-plan')
  assert.equal(item(plan, 'business.offer.summary')?.tag, 'approved')
  for (const id of ['business.finance.revenue_figure', 'business.finance.costs', 'business.finance.runway']) {
    const entry = item(plan, id)
    assert.ok(entry, id)
    assert.equal(entry.value, null)
  }
  const marketing = buildMarketingPlan(engine, 'internal')
  assert.equal(marketing.kind, 'marketing-plan')
  assert.equal(item(marketing, 'business.marketing.budget')?.value, null)
  assert.deepEqual(Object.keys(marketing.counts), ['approved', 'assumption', 'recommendation', 'missing'])
  // Public editions carry no drafts and no recommendations.
  for (const model of [buildBusinessPlan(engine, 'public'), buildMarketingPlan(engine, 'public')]) {
    assert.ok(items(model).every((entry) => entry.tag === 'missing' || entry.tag === 'approved'))
  }
})

test('the public brand book build contains no internal brand-book items', () => {
  const { root, engine, proof } = brand()
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  answer(engine, 'business.identity.trade_name', 'Book Brand')
  answer(engine, 'brand.strategy.purpose', 'CANARY-INTERNAL approved internal purpose')
  answer(engine, 'brand.color.roles', 'primary #0B2A55')
  approve(engine, proof, ['business.identity.trade_name', 'brand.strategy.purpose', 'brand.color.roles'])
  assert.equal(engine.publishFact('business.identity.trade_name', proof).kind, 'recorded')
  answer(engine, 'brand.strategy.vision', 'CANARY-INTERNAL draft vision')

  const internal = buildBrandBook(engine, 'internal')
  assert.match(JSON.stringify(internal), /CANARY-INTERNAL/, 'the internal edition does carry internal items')

  prepareDocs(root, { audience: 'public', rootIndex: false })
  const data = JSON.parse(fs.readFileSync(path.join(root, 'apps/docs/src/data/brand-book.json'), 'utf8')) as DocumentModel
  assert.equal(data.audience, 'public')
  assert.equal(item(data, 'business.identity.trade_name')?.tag, 'approved')
  assert.equal(item(data, 'business.identity.trade_name')?.value, 'Book Brand')
  for (const entry of items(data)) {
    assert.ok(entry.tag === 'approved' || entry.tag === 'missing', `${entry.id} is ${entry.tag}`)
    if (entry.tag === 'missing') assert.equal(entry.value, null)
  }
  assert.equal(item(data, 'brand.color.roles')?.tag, 'missing', 'approved but unpublished is missing in public')
  assert.equal(item(data, 'brand.color.roles')?.structured, null)
  assert.deepEqual(scanPublicTree(path.join(root, 'apps/docs')), [])
  assert.ok(!fs.readFileSync(path.join(root, 'apps/docs/src/data/brand-book.json'), 'utf8').includes('#0B2A55'))
})

test('brand book and dashboard UI strings are English by default with matching fa and tr locale data', () => {
  const page = fs.readFileSync(path.join(repo, 'apps/docs/src/pages/brand-book.tsx'), 'utf8')
  const ids = [...page.matchAll(/id: '(brandBook\.[^']+)'/g)].map((match) => match[1]).sort()
  assert.ok(ids.length > 20)
  // The internal dashboard page uses the same locale tables.
  const dashboard = fs.readFileSync(path.join(repo, 'apps/docs/src/pages/dashboard.tsx'), 'utf8')
  const dashboardIds = [...dashboard.matchAll(/id: '(dashboard\.[^']+)'/g)].map((match) => match[1])
  assert.ok(dashboardIds.length > 10)
  assert.match(dashboard, /<bdi>/, 'dashboard values are isolated for RTL')
  const all = [...ids, ...dashboardIds].sort()
  for (const locale of ['fa', 'tr']) {
    const table = JSON.parse(fs.readFileSync(path.join(repo, `apps/docs/i18n/${locale}/code.json`), 'utf8')) as Record<string, { message: string }>
    assert.deepEqual(Object.keys(table).sort(), all, `${locale} translates every brand book and dashboard string`)
    assert.ok(Object.values(table).every((entry) => entry.message.trim().length > 0))
  }
  // RTL safety: the page and its styles use logical directions and isolate user text.
  const css = fs.readFileSync(path.join(repo, 'apps/docs/src/css/custom.css'), 'utf8')
  const bookCss = css.slice(css.indexOf('/* Brand Book.'))
  assert.ok(!/(margin|padding|border)-(left|right)|text-align:\s*(left|right)/.test(bookCss), 'no physical left/right in brand book styles')
  assert.match(page, /dir="auto"/)
  assert.match(page, /<code dir="ltr">\{color\.hex\}<\/code>|<code dir="ltr">/)
})
