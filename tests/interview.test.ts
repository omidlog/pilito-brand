import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { applyInit, ensureApprovalSecret, getBrandStatus, getBrandTokens, InterviewEngine, listMascotAssets, resolveAgentRequest, writeStarterWorkspace } from '@brand-os/brand-core'
process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

function workspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-'))
  writeStarterWorkspace(dir)
  return dir
}

const opening = [
  ['business.identity.new_or_existing', 'new'],
  ['business.identity.trade_name', 'Example Learners'],
  ['business.identity.sector', 'education'],
  ['business.offer.summary', 'A practice app. EXAMPLE only.'],
  ['business.stage.current', 'idea'],
  ['business.market.geography', 'unknown'],
  ['business.customer.primary_segment', 'unknown'],
  ['brand.mascot.enabled', 'yes'],
  ['business.offer.value_proposition', 'unknown'],
  ['brand.personality.traits', 'Calm and specific. EXAMPLE traits, not a real brand.'],
] as const

test('interview records answers, drafts, resume, approval, and impact', () => {
  const root = workspace()
  const engine = new InterviewEngine(root)
  for (const [id, raw] of opening) {
    assert.equal(engine.current()?.id, id)
    const result = engine.submit(raw)
    assert.equal(result.kind, 'recorded')
  }
  const resumed = new InterviewEngine(root)
  assert.notEqual(resumed.current()?.id, 'business.identity.trade_name')
  assert.equal(resumed.session().history.includes('business.identity.trade_name'), true)
  const draft = fs.readFileSync(path.join(root, 'brand/generated/drafts/business-company.md'), 'utf8')
  assert.match(draft, /Example Learners/)
  assert.match(draft, /Unknown — not provided/)
  assert.doesNotMatch(draft, /Northwind/)

  const proof = ensureApprovalSecret(root)
  assert.equal(engine.approve('brand.personality.traits', 'owner').kind, 'error')
  const approved = engine.approve('brand.personality.traits', 'owner', proof)
  assert.equal(approved.status, 'approved')
  const blocked = engine.changeAnswer('brand.personality.traits', 'A different personality', false)
  assert.equal(blocked.kind, 'impact')
  assert.match(fs.readFileSync(path.join(root, 'brand/instance/approved-facts.yaml'), 'utf8'), /Calm and specific/)
  const changed = engine.changeAnswer('brand.personality.traits', 'A different personality', true, 'owner')
  assert.equal(changed.kind, 'impact')
  assert.match(fs.readFileSync(path.join(root, 'brand/instance/approved-facts.yaml'), 'utf8'), /Calm and specific/)
  assert.equal(engine.approve('brand.personality.traits', 'guest', proof).kind, 'error')

  assert.equal(engine.isEligible('business.product.learning_model'), true)
  assert.equal(engine.isEligible('brand.mascot.role'), true)
  const note = path.join(root, 'brand/generated/drafts/brand-strategy.md')
  fs.appendFileSync(note, '\nHuman note stays.\n')
  engine.submit('skip')
  assert.match(fs.readFileSync(note, 'utf8'), /Human note stays/)
})

test('unknown does not invent a name and b2b skips mascot questions', () => {
  const root = workspace()
  applyInit(root, {
    name: 'Example Systems',
    slug: 'example-systems',
    industry: 'software',
    sector: 'b2b-saas',
    language: 'en',
    languages: ['en', 'fa', 'tr'],
    mascot: false,
    gamification: false,
    publish: 'private',
    profile: 'b2b-saas',
  })
  const engine = new InterviewEngine(root)
  const answers: Record<string, string> = {
    'business.identity.new_or_existing': 'existing',
    'business.identity.trade_name': 'unknown',
    'business.identity.sector': 'b2b-saas',
    'business.offer.summary': 'unknown',
    'business.stage.current': 'established',
    'business.market.geography': 'unknown',
    'business.customer.primary_segment': 'skip',
  }
  for (const [id, raw] of Object.entries(answers)) {
    assert.equal(engine.current()?.id, id, `expected ${id} but got ${engine.current()?.id}`)
    engine.submit(raw)
  }
  assert.equal(engine.isEligible('brand.mascot.enabled'), false)
  const draft = fs.readFileSync(path.join(root, 'brand/generated/drafts/business-company.md'), 'utf8')
  assert.match(draft, /Unknown — not provided/)
  assert.equal(engine.isEligible('brand.mascot.role'), false)
  assert.equal(engine.isEligible('business.product.learning_model'), false)
  assert.equal(engine.isEligible('business.sales.b2b_packaging'), true)
  assert.equal(engine.config().modules.mascot.enabled, false)
})

test('restricted finance answers stay out of review and public files', () => {
  const root = workspace()
  const sessionPath = path.join(root, 'brand/interview/session-state.yaml')
  const session = fs.readFileSync(sessionPath, 'utf8').replace('cursor_question_id: null', 'cursor_question_id: business.finance.revenue_figure')
  fs.writeFileSync(sessionPath, session)
  const engine = new InterviewEngine(root)
  assert.equal(engine.current()?.id, 'business.finance.revenue_figure')
  engine.submit('secret-figure-99')
  const review = engine.reviewText(false)
  assert.doesNotMatch(review, /secret-figure-99/)
  const generated = fs.readFileSync(path.join(root, 'brand/generated/drafts/business-finance.md'), 'utf8')
  assert.doesNotMatch(generated, /secret-figure-99/)
  const ledger = fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8')
  assert.doesNotMatch(ledger, /secret-figure-99/)
  const proof = ensureApprovalSecret(root)
  const revealed = engine.revealRestricted('business.finance.revenue_figure', proof)
  assert.equal(revealed.ok, true)
  if (revealed.ok) assert.equal(revealed.value, 'secret-figure-99')
  assert.equal(engine.revealRestricted('business.finance.revenue_figure').ok, false)
  const exported = JSON.stringify(engine.exportSnapshot('public'))
  assert.doesNotMatch(exported, /secret-figure-99/)
  assert.doesNotMatch(exported, /RESTRICTED_CANARY_DO_NOT_PUBLISH/)
})

test('agent tools do not invent approvals', () => {
  const root = workspace()
  const engine = new InterviewEngine(root)
  const tokens = getBrandTokens(engine)
  assert.equal(tokens.approved, false)
  assert.deepEqual((tokens.data as { tokens: unknown[] }).tokens, [])
  const mascots = listMascotAssets(engine)
  assert.equal((mascots.data as { count: number }).count, 0)
  const status = getBrandStatus(engine)
  const statusData = status.data as { brand: string; publishedFactCount: number }
  assert.equal(statusData.brand, 'Unpublished')
  assert.equal(statusData.publishedFactCount, 0)
  assert.equal(JSON.stringify(status).includes('coverage'), false)
  const resolution = resolveAgentRequest(engine, 'onboarding-mascot')
  assert.match(resolution.gap, /missing/i)
  const carousel = resolveAgentRequest(engine, 'instagram-carousel')
  assert.match(carousel.gap, /No approved typography/)
})

test('two inits do not share ledger state', () => {
  const first = workspace()
  const second = workspace()
  applyInit(first, {
    name: 'Alpha Example',
    slug: 'alpha-example',
    industry: 'education',
    language: 'en',
    languages: ['en'],
    mascot: true,
    gamification: true,
    publish: 'private',
  })
  new InterviewEngine(first).submit('new')
  applyInit(second, {
    name: 'Beta Example',
    slug: 'beta-example',
    industry: 'software',
    language: 'fa',
    languages: ['fa', 'en'],
    mascot: false,
    gamification: false,
    publish: 'private',
  })
  const alpha = new InterviewEngine(first)
  const beta = new InterviewEngine(second)
  assert.equal(alpha.config().brand.slug, 'alpha-example')
  assert.equal(beta.config().brand.slug, 'beta-example')
  assert.equal(beta.ledger().records.length, 0)
  assert.equal(beta.config().modules.mascot.enabled, false)
  assert.equal(alpha.ledger().records.length, 1)
})
