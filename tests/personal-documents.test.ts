import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  addEvidence,
  agentTokenContext,
  allQuestions,
  applyInit,
  buildNamedDocument,
  DOCUMENT_KINDS,
  draftPersonalContent,
  ensureApprovalSecret,
  guestContext,
  InterviewEngine,
  PERSONAL_DOCUMENT_KINDS,
  PERSONAL_SPECS,
  renderDocumentMarkdown,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { DocumentItem, DocumentModel, InitInput } from '@brand-os/brand-core'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const SLUG = 'alex-example'

function brand(extra: Partial<InitInput> = {}): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-personal-docs-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Alex Example', slug: SLUG, industry: 'consulting', language: 'en', languages: ['en', 'fa', 'tr'], mascot: false, gamification: false, publish: 'public', profile: 'personal-brand', ...extra })
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

test('every personal document spec points at real question ids, and all ten deliverables exist', () => {
  const ids = new Set(allQuestions().map((question) => question.id))
  assert.equal(PERSONAL_DOCUMENT_KINDS.length, 10)
  for (const kind of PERSONAL_DOCUMENT_KINDS) assert.ok(DOCUMENT_KINDS.includes(kind))
  for (const [kind, spec] of Object.entries(PERSONAL_SPECS)) {
    for (const section of spec.sections) for (const id of section.questions) assert.ok(ids.has(id), `${kind}/${section.id}: ${id}`)
  }
})

test('two bio lengths cite the same approved facts with identical values and never pad', () => {
  const { engine, proof } = brand()
  answer(engine, 'personal.identity.public_name', 'Alex Example')
  answer(engine, 'personal.identity.headline', 'Product strategy advisor for early-stage teams')
  answer(engine, 'personal.positioning.known_for', 'Known for practical product discovery, by seed-stage founders.')
  approve(engine, proof, ['personal.identity.public_name', 'personal.identity.headline', 'personal.positioning.known_for'])
  const bio = buildNamedDocument(engine, 'professional-bio', 'internal')
  const short = bio.sections.find((section) => section.id === 'short')
  const long = bio.sections.find((section) => section.id === 'long')
  assert.ok(short && long)
  for (const id of ['personal.identity.headline', 'personal.positioning.known_for']) {
    const a: DocumentItem | undefined = short.items.find((item) => item.id === id)
    const b: DocumentItem | undefined = long.items.find((item) => item.id === id)
    assert.equal(a?.tag, 'approved')
    assert.deepEqual(a?.source_ids, b?.source_ids, 'same fact, same answer id, same revision')
    assert.equal(a?.value, b?.value)
  }
  assert.equal(short.length?.state, 'below')
  assert.match(short.length?.note ?? '', /not padded/)
  assert.ok((short.length?.approved_words ?? 0) < 50)
  // Everything else in the long bio is missing, not invented.
  assert.ok(long.items.filter((item) => item.tag === 'missing').length >= 5)
  assert.match(renderDocumentMarkdown(bio), /Length: Approved material is \d+ words/)
})

test('documents label owner-stated, unverified and verified personal claims and separate drafts from facts', () => {
  const { engine, proof, root } = brand({ facets: ['speaker-author'] })
  answer(engine, 'personal.credibility.credentials', 'Certificate in Example Studies, 2018')
  answer(engine, 'personal.speaking.prior_talks', 'Example Conf 2023')
  answer(engine, 'personal.experience.highlights', 'Led the onboarding redesign')
  approve(engine, proof, ['personal.credibility.credentials', 'personal.speaking.prior_talks'])
  const testimony = addEvidence(root, engine.questions(), { claim_id: 'personal.credibility.credentials', kind: 'verification', source_type: 'owner_testimony', reference: 'Owner statement' })
  engine.approvals().reviewEvidence(testimony.id, 'verified', proof)
  const link = addEvidence(root, engine.questions(), { claim_id: 'personal.speaking.prior_talks', kind: 'verification', source_type: 'link', reference: 'https://conf.example.org/2023' })
  engine.approvals().reviewEvidence(link.id, 'verified', proof)

  const kit = buildNamedDocument(engine, 'media-kit', 'internal')
  const byId = new Map(items(kit).map((item) => [item.id, item]))
  assert.equal(byId.get('personal.credibility.credentials')?.verification, 'owner_stated')
  assert.match(byId.get('personal.credibility.credentials')?.note ?? '', /Owner-stated/)
  assert.equal(byId.get('personal.experience.highlights')?.tag, 'assumption', 'a draft stays an assumption')
  const speaker = buildNamedDocument(engine, 'speaker-kit', 'internal')
  const talk = items(speaker).find((item) => item.id === 'personal.speaking.prior_talks')
  assert.equal(talk?.verification, 'verified')
  assert.ok(talk?.source_ids.includes(`evidence:${link.id}`))
  assert.match(renderDocumentMarkdown(speaker), /Approved\*\* · Verified/)

  // The public edition shows nothing that is not published, and no evidence ids.
  const publicKit = buildNamedDocument(engine, 'media-kit', 'public')
  assert.equal(publicKit.counts.approved, 0)
  assert.ok(items(publicKit).every((item) => !item.source_ids.some((id) => id.startsWith('evidence:'))))
})

test('the evidence register lists claims, sources, status and eligibility, internal only', () => {
  const { engine, proof, root } = brand()
  answer(engine, 'personal.portfolio.projects', 'Example redesign, 2022, lead designer')
  approve(engine, proof, ['personal.portfolio.projects'])
  const source = addEvidence(root, engine.questions(), { claim_id: 'personal.portfolio.projects', kind: 'verification', source_type: 'link', reference: 'https://example.org/case', review_due: '2099-01-01' })
  engine.approvals().reviewEvidence(source.id, 'verified', proof)
  const register = buildNamedDocument(engine, 'evidence-register', 'internal')
  const section = register.sections.find((entry) => entry.id === 'personal.portfolio.projects')
  assert.ok(section)
  assert.match(section.items[0]?.note ?? '', /Not eligible for public release: .*permission/)
  assert.equal(section.items[1]?.id, source.id)
  assert.match(section.items[1]?.note ?? '', /Re-verify by 2099-01-01/)
  assert.equal(buildNamedDocument(engine, 'evidence-register', 'public').sections.length, 0)
})

test('facet documents are not applicable without their facet, and facet sections drop out', () => {
  const { engine } = brand({ facets: ['consultant-expert'] })
  const speaker = buildNamedDocument(engine, 'speaker-kit', 'internal')
  assert.equal(speaker.sections.length, 0)
  assert.match(speaker.note, /speaker-author facet is not selected/)
  const portfolio = buildNamedDocument(engine, 'portfolio-pack', 'internal')
  assert.ok(!portfolio.sections.some((section) => section.id === 'exhibitions'), 'artist-only section is dropped')
  const services = buildNamedDocument(engine, 'services-pack', 'internal')
  assert.ok(services.sections.some((section) => section.id === 'pricing'))

  const universal = brand({ profile: 'universal' }).engine
  assert.match(buildNamedDocument(universal, 'personal-brand-book', 'internal').note, /personal module is turned off/)
  // Existing documents are untouched.
  assert.ok(buildNamedDocument(universal, 'brand-book', 'internal').sections.length > 0)
})

test('draft_personal_content returns approved facts only, is always a draft, and respects the caller', () => {
  const { engine, proof } = brand()
  answer(engine, 'personal.identity.public_name', 'Alex Example')
  answer(engine, 'personal.identity.headline', 'Product strategy advisor')
  answer(engine, 'personal.positioning.known_for', 'Draft position, not approved')
  answer(engine, 'personal.experience.relationships', 'advised | Example Labs | 2022 | present')
  approve(engine, proof, ['personal.identity.public_name', 'personal.identity.headline', 'personal.experience.relationships'])

  const marketing = draftPersonalContent(engine, 'linkedin-pack', agentTokenContext(SLUG, 'tok-m', 'marketing'))
  assert.equal(marketing.status, 'draft')
  assert.equal(marketing.approved, false)
  const data = marketing.data as { authority: string; sections: Array<{ facts: Array<{ id: string; value: unknown }> }>; missing: string[]; rules: string[] }
  assert.equal(data.authority, 'none')
  const facts = data.sections.flatMap((section) => section.facts)
  assert.ok(facts.some((fact) => fact.id === 'personal.identity.headline'))
  assert.ok(!facts.some((fact) => fact.id === 'personal.positioning.known_for'), 'drafts are not knowledge')
  assert.ok(!facts.some((fact) => fact.id === 'personal.experience.relationships'), 'marketing cannot read career history')
  assert.ok(data.missing.includes('personal.positioning.known_for'))
  assert.ok(data.rules.some((rule) => /no authority/.test(rule)))

  const internal = draftPersonalContent(engine, 'linkedin-pack', agentTokenContext(SLUG, 'tok-i', 'internal-read'), 'experience')
  const experience = (internal.data as { sections: Array<{ id: string; facts: Array<{ id: string }> }> }).sections
  assert.deepEqual(experience.map((section) => section.id), ['experience'])
  assert.ok(experience[0]?.facts.some((fact) => fact.id === 'personal.experience.relationships'))

  // Guests on a public brand see nothing unpublished; an unknown deliverable is missing, not guessed.
  const guest = draftPersonalContent(engine, 'professional-bio', guestContext(SLUG), 'short')
  assert.deepEqual((guest.data as { sections: Array<{ facts: unknown[] }> }).sections[0]?.facts, [])
  assert.equal(draftPersonalContent(engine, 'press-release', agentTokenContext(SLUG, 'tok-i', 'internal-read')).status, 'missing')
})
