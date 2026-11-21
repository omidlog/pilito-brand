import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse } from 'yaml'
import {
  allQuestions,
  applyInit,
  applyProposalBatch,
  canonicalReferenceErrors,
  ensureApprovalSecret,
  evaluateCondition,
  InterviewEngine,
  latestAnswers,
  migrateBrand,
  moduleEnabled,
  normalizeStructured,
  parseProposalBatch,
  parseStructured,
  PERSONAL_BRAND,
  personalInit,
  privateDataFindings,
  profileErrors,
  templateConfig,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { BrandConfig, InitInput } from '@brand-os/brand-core'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

function brand(extra: Partial<InitInput> = {}): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-personal-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Alex Example', slug: 'alex-example', industry: 'consulting', language: 'en', languages: ['en', 'fa', 'tr'], mascot: false, gamification: false, publish: 'private', ...extra })
  return { root, engine: new InterviewEngine(root), proof: ensureApprovalSecret(root) }
}

function answer(engine: InterviewEngine, id: string, value: string): void {
  const result = engine.answerQuestion(id, value)
  assert.equal(result.kind, 'recorded', result.message)
}

function queueIds(engine: InterviewEngine, limit = 500): string[] {
  return engine.queue(limit).map((question) => question.id)
}

test('the personal question bank has 8 core and 5 facet modules with stable prefixed ids and three locales', () => {
  const personal = allQuestions().filter((question) => question.module.startsWith('personal'))
  const modules = new Set(personal.map((question) => question.module))
  assert.equal(modules.size, 13)
  for (const question of personal) {
    assert.match(question.id, /^personal\.[a-z_]+\.[a-z_]+$/)
    for (const locale of ['en', 'fa', 'tr'] as const) assert.ok(question.prompt[locale].trim(), `${question.id} ${locale}`)
    assert.ok(question.related_outputs.every((output) => output.startsWith('brand/generated/drafts/personal-')))
  }
  const core = personal.filter((question) => !question.skip_when)
  const requiredCore = core.filter((question) => question.required)
  assert.ok(requiredCore.length >= 25 && requiredCore.length <= 35, `core required questions: ${requiredCore.length}`)
  // No personal question restates a shared voice or company question: those are referenced by id.
  assert.ok(!personal.some((question) => /voice|trade_name|legal_name/.test(question.id)))
})

test('a fresh universal template behaves as before: personal questions are not applicable and never asked', () => {
  const { engine } = brand()
  assert.equal(engine.config().modules.personal?.enabled, false)
  assert.ok(!queueIds(engine).some((id) => id.startsWith('personal.')))
  const personalScore = engine.statusReport().modules.filter((item) => item.module.startsWith('personal'))
  assert.ok(personalScore.every((item) => item.required === 0))
  const refused = engine.answerQuestion('personal.identity.public_name', 'Alex Example')
  assert.equal(refused.kind, 'error')
  assert.match(refused.message, /turned off/)
})

test('a person-only profile never requires a legal entity, SaaS stack or mascot, and asks the person core', () => {
  const { engine } = brand({ profile: 'personal-brand' })
  const config = engine.config()
  assert.equal(config.brand.profile, 'personal-brand')
  assert.deepEqual(config.modules.personal?.facets, [])
  const queue = queueIds(engine)
  assert.ok(queue.includes('personal.identity.public_name'))
  assert.ok(queue.includes('brand.verbal.voice') === false, 'voice waits for its dependency, personality')
  assert.ok(queue.includes('brand.personality.traits'))
  assert.ok(!queue.some((id) => id.startsWith('business.') || id.startsWith('brand.mascot.') || id.startsWith('brand.ui.')))
  assert.ok(!queue.some((id) => id.startsWith('personal.founder.') || id.startsWith('personal.consulting.')), 'no facet selected')
  const report = engine.statusReport()
  for (const module of report.modules.filter((item) => item.module.startsWith('business') || item.module.startsWith('mascot'))) {
    assert.equal(module.required, 0, `${module.module} counts as not applicable`)
  }
  assert.ok(report.required > 25 && report.required < 45, `required ${report.required}`)
})

test('facets combine through the condition engine: founder+consultant, consultant-only, creator+speaker', () => {
  const both = brand({ profile: 'personal-brand', facets: ['founder-executive', 'consultant-expert'] }).engine
  answer(both, 'personal.experience.relationships', 'co-founded | Example Studio | 2019 | present')
  const q1 = queueIds(both)
  assert.ok(q1.includes('personal.founder.ventures'))
  assert.ok(q1.includes('personal.consulting.methodology'))
  assert.ok(!q1.some((id) => id.startsWith('personal.creator.') || id.startsWith('personal.speaking.')))

  const consultant = brand({ profile: 'personal-brand', facets: ['consultant-expert'] }).engine
  const q2 = queueIds(consultant)
  assert.ok(q2.includes('personal.consulting.pricing_policy'))
  assert.ok(!q2.some((id) => id.startsWith('personal.founder.')))
  assert.match(consultant.answerQuestion('personal.founder.narrative', 'x').message, /does not apply/)

  const creatorSpeaker = brand({ profile: 'personal-brand', facets: ['creator-educator', 'speaker-author'] }).engine
  const q3 = queueIds(creatorSpeaker)
  assert.ok(q3.includes('personal.creator.series') && q3.includes('personal.speaking.topics'))
  assert.ok(!q3.some((id) => id.startsWith('personal.consulting.') || id.startsWith('personal.artist.')))

  // The condition language rejects an unknown facet instead of silently skipping.
  const config = templateConfig()
  assert.throws(() => evaluateCondition('config.modules.personal.facets has astronaut', { config, answers: new Map() }), /Unknown personal facet/)
})

test('a standard SaaS brand with no personal facet keeps its business interview', () => {
  const { engine } = brand({ industry: 'software' })
  const queue = queueIds(engine)
  assert.ok(queue.some((id) => id.startsWith('business.')))
  assert.ok(!queue.some((id) => id.startsWith('personal.')))
})

test('brand:init validates facets and the personal flag', () => {
  assert.throws(() => personalInit({ profile: 'universal', facets: ['consultant-expert'] }), /need the personal module/)
  assert.throws(() => personalInit({ profile: 'personal-brand', facets: ['astronaut'] }), /Unknown personal facet/)
  assert.deepEqual(personalInit({ profile: 'universal', personal: true, facets: ['speaker-author', 'speaker-author'] }), { enabled: true, facets: ['speaker-author'] })
})

test('a person plus business brand can use the universal profile with the personal module on', () => {
  const { engine } = brand({ personal: true, facets: ['founder-executive'] })
  const queue = queueIds(engine)
  assert.ok(queue.some((id) => id.startsWith('business.')))
  assert.ok(queue.some((id) => id.startsWith('personal.')))
})

test('relationships are explicit: founding or working somewhere never becomes ownership', () => {
  const ok = normalizeStructured('relationships', 'Co-Founded | Example Studio | ۲۰۱۹ | present\nemployed | Example Corp | 2016-03 | 2019-01 | ownership: not-owner')
  assert.deepEqual(ok, { ok: true, value: 'co-founded | Example Studio | 2019 | present | ownership: unstated; employed | Example Corp | 2016-03 | 2019-01 | ownership: not-owner' })
  const parsed = parseStructured('relationships', ok.ok ? ok.value : '')
  assert.equal(parsed?.type, 'relationships')
  if (parsed?.type === 'relationships') {
    assert.equal(parsed.relationships[0]?.ownership, 'unstated')
    assert.equal(parsed.relationships[0]?.relation, 'co-founded')
  }
  assert.equal(normalizeStructured('relationships', 'owned | Example | 2019 | present').ok, false, 'owning is not a relation')
  assert.equal(normalizeStructured('relationships', 'employed | Example | 2020 | 2018').ok, false, 'ends before it starts')
  assert.equal(normalizeStructured('relationships', 'employed | Example | last year | present').ok, false)

  const { engine } = brand({ profile: 'personal-brand', facets: ['founder-executive'] })
  answer(engine, 'personal.experience.relationships', 'founded | Example Studio | 2019 | present')
  const stored = latestAnswers(engine.ledger().records).get('personal.experience.relationships')
  assert.match(String(stored?.value), /ownership: unstated/)
  assert.equal(stored?.status, 'draft', 'evidence is stored as a draft with a stable id, never approved')
  assert.equal(engine.config().brand.legal_name, 'TBD', 'the person did not become a company')
})

test('private personal data is refused at every write path and the refusal never echoes it', () => {
  const { engine } = brand({ profile: 'personal-brand' })
  const phone = engine.answerQuestion('personal.story.origin', 'Call me on +90 532 000 11 22 any time')
  assert.equal(phone.kind, 'error')
  assert.match(phone.message, /phone number/)
  assert.ok(!phone.message.includes('532'))
  for (const text of ['My home address is 12 Example Street', 'Date of birth: 1990-01-01', 'my kids are in school there', 'Passport number X1234', 'کد ملی من ثبت شده است', 'Ev adresim burada', 'reach me at alex@example.com']) {
    assert.equal(engine.answerQuestion('personal.story.turning_points', text).kind, 'error', text)
  }
  // Years, ranges and URLs are not phone numbers; a work email is fine in the contact field.
  answer(engine, 'personal.story.timeline', '2016 first product role; 2019–2021 lead; 2021-06 independent practice')
  answer(engine, 'personal.contact.public_channels', 'work@example.com and https://example.com/contact')
  assert.deepEqual(privateDataFindings('Booked 2019 - present, https://example.com/12345678'), [])

  // Agent proposals: the intake rejects a quotation with private data.
  const source = 'I grew up nearby; my home address is 4 Example Road. I help founders decide.'
  const parsed = parseProposalBatch({
    schema_version: 1,
    source: { kind: 'interview_turn', ref: 'turn-1' },
    source_text: source,
    proposals: [{ question_id: 'personal.story.origin', value: 'Grew up nearby', quotation: 'my home address is 4 Example Road', state: 'proposed', confidence: 0.8 }],
  })
  assert.ok(parsed.ok)
  const report = applyProposalBatch(engine, parsed.batch, { origin: 'agent', dropped: parsed.dropped })
  assert.equal(report.results[0]?.outcome, 'rejected')
  assert.match(report.results[0]?.reason ?? '', /privacy/)
})

test('the personal brand name comes from the approved public name, and a company trade name never renames it', () => {
  const { engine, proof } = brand({ profile: 'personal-brand', personal: true })
  answer(engine, 'personal.identity.public_name', 'Alex Q. Example')
  assert.equal(engine.config().brand.working_name, 'Alex Q. Example')
  const result = engine.approvals().approveBatch({ ids: ['personal.identity.public_name'] }, proof)
  assert.equal(result.approved, 1, JSON.stringify(result.results))
  assert.equal(engine.config().brand.name, 'Alex Q. Example')
  answer(engine, 'business.identity.trade_name', 'Example Studio')
  assert.equal(engine.config().brand.working_name, 'Alex Q. Example')
})

test('brand:migrate upgrades a pre-Phase-8 repository additively without resetting interview state', () => {
  const { root, engine } = brand()
  answer(engine, 'business.identity.trade_name', 'Northwind')
  // Simulate a v0.2 checkout: no personal bank, profile, config block or registry entries.
  fs.rmSync(path.join(root, 'brand/interview/question-bank/personal.yaml'))
  fs.rmSync(path.join(root, 'brand/interview/profiles/personal-brand.yaml'))
  const configFile = path.join(root, 'brand/brand.config.yaml')
  const legacy = fs.readFileSync(configFile, 'utf8').replace(/^ {2}personal:\n(?: {4}.*\n)+/m, '')
  assert.equal((parse(legacy) as BrandConfig).modules.personal, undefined)
  fs.writeFileSync(configFile, `# owner comment kept\n${legacy}`)
  const registryFile = path.join(root, 'brand/interview/field-registry.yaml')
  const registry = parse(fs.readFileSync(registryFile, 'utf8')) as { fields: Array<{ module: string }> }
  registry.fields = registry.fields.filter((field) => !field.module.startsWith('personal'))
  fs.writeFileSync(registryFile, JSON.stringify(registry))
  const ledgerBefore = fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8')
  const fresh = new InterviewEngine(root)
  assert.equal(fresh.config().modules.personal, undefined)
  assert.ok(!queueIds(fresh).some((id) => id.startsWith('personal.')), 'a legacy config means personal is off')

  migrateBrand(root)
  const after = new InterviewEngine(root)
  assert.equal(after.config().modules.personal?.enabled, false)
  assert.ok(fs.readFileSync(configFile, 'utf8').startsWith('# owner comment kept'))
  assert.ok(fs.existsSync(path.join(root, 'brand/interview/question-bank/personal.yaml')))
  assert.ok(fs.existsSync(path.join(root, 'brand/interview/profiles/personal-brand.yaml')))
  assert.equal(fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8'), ledgerBefore)
  assert.equal(latestAnswers(after.ledger().records).get('business.identity.trade_name')?.value, 'Northwind')
  const log = parse(fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8')) as { applied: Array<{ id: string }> }
  assert.ok(log.applied.some((entry) => entry.id.startsWith('personal-brand@')))
  // Idempotent: a second run touches nothing new.
  const second = log.applied.length
  migrateBrand(root)
  const again = parse(fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8')) as { applied: Array<{ id: string }> }
  assert.equal(again.applied.length, second)
  assert.deepEqual(profileErrors(root, new InterviewEngine(root).questions()), [])
  assert.deepEqual(canonicalReferenceErrors(new InterviewEngine(root).questions()), [])
})

test('module visibility follows the personal flag and facets', () => {
  const config = templateConfig()
  assert.equal(moduleEnabled({ optional: 'personal' }, config), false)
  config.modules.personal = { enabled: true, facets: ['speaker-author'] }
  assert.equal(moduleEnabled({ optional: 'personal' }, config), true)
  assert.equal(moduleEnabled({ optional: 'personal', facet: 'speaker-author' }, config), true)
  assert.equal(moduleEnabled({ optional: 'personal', facet: 'artist-designer' }, config), false)
  assert.ok(PERSONAL_BRAND.exclusive)
})
