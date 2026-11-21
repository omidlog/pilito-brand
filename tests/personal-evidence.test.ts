import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import {
  addEvidence,
  agentTokenContext,
  applyInit,
  assetIsPublic,
  brandRetrieve,
  ensureApprovalSecret,
  factIsPublic,
  guestContext,
  InterviewEngine,
  latestAnswers,
  readEvidence,
  readFacts,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { InitInput } from '@brand-os/brand-core'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const SLUG = 'alex-example'

function brand(extra: Partial<InitInput> = {}): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-evidence-'))
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

function publish(engine: InterviewEngine, proof: string, id: string) {
  return engine.approvals().publish({ ids: [id] }, proof).results[0]
}

function guestValue(engine: InterviewEngine, id: string): unknown {
  const result = brandRetrieve(engine, guestContext(SLUG), { kind: 'facts', ids: [id] })
  const items = (result.data as { items: Array<{ id: string; value: unknown; withheld: boolean }> }).items
  return items.find((item) => item.id === id && !item.withheld)?.value
}

test('unverified education and owner testimony cannot be published as verified claims', () => {
  const { engine, proof, root } = brand()
  answer(engine, 'personal.credibility.credentials', 'Certificate in Example Studies, Example Institute, 2018')
  approve(engine, proof, ['personal.credibility.credentials'])

  const bare = publish(engine, proof, 'personal.credibility.credentials')
  assert.equal(bare?.outcome, 'refused')
  assert.match(bare?.reason ?? '', /No verified, current evidence/)

  const testimony = addEvidence(root, engine.questions(), { claim_id: 'personal.credibility.credentials', kind: 'verification', source_type: 'owner_testimony', reference: 'Owner statement in interview session 1' })
  assert.equal(testimony.status, 'pending')
  assert.equal(engine.approvals().reviewEvidence(testimony.id, 'verified', proof).ok, true)
  const stillRefused = publish(engine, proof, 'personal.credibility.credentials')
  assert.equal(stillRefused?.outcome, 'refused')
  assert.match(stillRefused?.reason ?? '', /Only owner testimony/)

  const registry = addEvidence(root, engine.questions(), { claim_id: 'personal.credibility.credentials', kind: 'verification', source_type: 'public_record', reference: 'https://registry.example.org/certificates/abc', recorded_by: 'agent' })
  // An agent can record evidence, but cannot verify it: verification needs the human proof.
  assert.equal(engine.approvals().reviewEvidence(registry.id, 'verified', 'wrong-proof').ok, false)
  assert.equal(readEvidence(root).find((item) => item.id === registry.id)?.status, 'pending')
  assert.equal(publish(engine, proof, 'personal.credibility.credentials')?.outcome, 'refused')

  engine.approvals().reviewEvidence(registry.id, 'verified', proof)
  assert.equal(publish(engine, proof, 'personal.credibility.credentials')?.outcome, 'published')
  assert.match(String(guestValue(engine, 'personal.credibility.credentials')), /Example Institute/)
  const internal = brandRetrieve(engine, agentTokenContext(SLUG, 'tok-1', 'internal-read'), { kind: 'facts', ids: ['personal.credibility.credentials'] })
  const item = (internal.data as { items: Array<{ meta?: { verification?: string } }> }).items[0]
  assert.equal(item?.meta?.verification, 'verified')

  // Withdrawing the source unpublishes the claim at once, everywhere.
  const withdrawn = engine.approvals().withdrawEvidence(registry.id, 'Registry entry removed')
  assert.deepEqual(withdrawn.unpublished, ['personal.credibility.credentials'])
  assert.equal(guestValue(engine, 'personal.credibility.credentials'), undefined)
  const fact = readFacts(root, 'approved', SLUG)['personal.credibility.credentials']
  assert.equal(fact?.publication, 'unpublished')
  assert.equal(fact?.status, 'approved', 'withdrawing evidence does not unapprove the owner’s claim')
})

test('expired evidence stops counting even if nobody updated the allowlist', () => {
  const { engine, proof, root } = brand({ facets: ['speaker-author'] })
  answer(engine, 'personal.speaking.prior_talks', 'Example Conf 2023')
  approve(engine, proof, ['personal.speaking.prior_talks'])
  const item = addEvidence(root, engine.questions(), { claim_id: 'personal.speaking.prior_talks', kind: 'verification', source_type: 'link', reference: 'https://conf.example.org/2023/talks', review_due: '2099-01-01' })
  engine.approvals().reviewEvidence(item.id, 'verified', proof)
  assert.equal(publish(engine, proof, 'personal.speaking.prior_talks')?.outcome, 'published')
  const fact = readFacts(root, 'approved', SLUG)['personal.speaking.prior_talks']
  assert.equal(factIsPublic(root, 'personal.speaking.prior_talks', fact, SLUG), true)
  // Hand-edit the review date into the past: the read-time gate hides the claim.
  const file = path.join(root, 'brand/interview/evidence-register.yaml')
  const doc = parse(fs.readFileSync(file, 'utf8')) as { items: Array<{ review_due: string }> }
  doc.items[0]!.review_due = '2020-01-01'
  fs.writeFileSync(file, stringify(doc))
  assert.equal(factIsPublic(root, 'personal.speaking.prior_talks', fact, SLUG), false)
  assert.equal(guestValue(engine, 'personal.speaking.prior_talks'), undefined)
})

test('case studies and testimonials need a verified public permission as well as evidence', () => {
  const { engine, proof, root } = brand()
  answer(engine, 'personal.portfolio.projects', 'Example onboarding redesign, 2022, lead designer, qualitative result')
  approve(engine, proof, ['personal.portfolio.projects'])
  const source = addEvidence(root, engine.questions(), { claim_id: 'personal.portfolio.projects', kind: 'verification', source_type: 'link', reference: 'https://example.org/case-study' })
  engine.approvals().reviewEvidence(source.id, 'verified', proof)
  const noRights = publish(engine, proof, 'personal.portfolio.projects')
  assert.equal(noRights?.outcome, 'refused')
  assert.match(noRights?.reason ?? '', /permission/)
  assert.throws(() => addEvidence(root, engine.questions(), { claim_id: 'personal.portfolio.projects', kind: 'permission', source_type: 'document', reference: 'Signed consent held offline' }), /scope/)
  const internalOnly = addEvidence(root, engine.questions(), { claim_id: 'personal.portfolio.projects', kind: 'permission', source_type: 'document', reference: 'Consent email from the client, held offline', scope: 'internal', granted_by: 'Client marketing lead' })
  engine.approvals().reviewEvidence(internalOnly.id, 'verified', proof)
  assert.equal(publish(engine, proof, 'personal.portfolio.projects')?.outcome, 'refused', 'internal-only permission does not allow public release')
  const publicConsent = addEvidence(root, engine.questions(), { claim_id: 'personal.portfolio.projects', kind: 'permission', source_type: 'document', reference: 'Signed public-use consent, held offline', scope: 'public', granted_by: 'Client marketing lead' })
  engine.approvals().reviewEvidence(publicConsent.id, 'verified', proof)
  assert.equal(publish(engine, proof, 'personal.portfolio.projects')?.outcome, 'published')
  // The client revokes consent: the case study leaves every public surface.
  engine.approvals().withdrawEvidence(publicConsent.id, 'Client revoked consent')
  assert.equal(guestValue(engine, 'personal.portfolio.projects'), undefined)
})

test('the evidence register refuses private data, unknown claims and restricted claims', () => {
  const { engine, root } = brand()
  assert.throws(() => addEvidence(root, engine.questions(), { claim_id: 'personal.credibility.credentials', kind: 'verification', source_type: 'document', reference: 'Passport number scan in my drawer' }), /government/)
  assert.throws(() => addEvidence(root, engine.questions(), { claim_id: 'personal.nope', kind: 'verification', source_type: 'link', reference: 'https://example.org' }), /Unknown claim/)
  const restricted = engine.questions().find((question) => question.sensitivity === 'restricted')
  assert.ok(restricted)
  assert.throws(() => addEvidence(root, engine.questions(), { claim_id: restricted.id, kind: 'verification', source_type: 'link', reference: 'https://example.org' }), /Restricted/)
  assert.equal(readEvidence(root).length, 0)
})

test('private career details and boundaries never reach guests, design or marketing agents', () => {
  const { engine, proof } = brand({ facets: ['founder-executive'] })
  answer(engine, 'personal.identity.headline', 'Product strategy advisor')
  answer(engine, 'personal.experience.relationships', 'co-founded | Example Studio | 2019 | present')
  answer(engine, 'personal.privacy.boundaries', 'Health and home location')
  approve(engine, proof, ['personal.identity.headline', 'personal.experience.relationships', 'personal.privacy.boundaries'])
  assert.equal(publish(engine, proof, 'personal.experience.relationships')?.outcome, 'refused', 'internal career records cannot be published')
  assert.equal(publish(engine, proof, 'personal.identity.headline')?.outcome, 'published')

  assert.equal(guestValue(engine, 'personal.identity.headline'), 'Product strategy advisor')
  assert.equal(guestValue(engine, 'personal.experience.relationships'), undefined)
  const guestAll = brandRetrieve(engine, guestContext(SLUG), { kind: 'facts' })
  assert.deepEqual((guestAll.data as { items: Array<{ id: string }> }).items.map((item) => item.id), ['personal.identity.headline'])

  const read = (profile: 'design' | 'marketing' | 'finance' | 'internal-read', id: string) => {
    const result = brandRetrieve(engine, agentTokenContext(SLUG, `tok-${profile}`, profile), { kind: 'facts', ids: [id] })
    return (result.data as { items: Array<{ id: string; value: unknown; withheld: boolean }> }).items.find((item) => item.id === id)
  }
  for (const profile of ['design', 'marketing', 'finance'] as const) {
    assert.notEqual(read(profile, 'personal.experience.relationships')?.withheld, false, `${profile} must not read career history`)
    assert.notEqual(read(profile, 'personal.privacy.boundaries')?.withheld, false, `${profile} must not read privacy boundaries`)
  }
  assert.equal(read('marketing', 'personal.identity.headline')?.value, 'Product strategy advisor')
  assert.notEqual(read('finance', 'personal.identity.headline')?.withheld, false)
  // "What is their verified relationship to Example Studio?" — internal-read answers with the explicit row.
  const relation = read('internal-read', 'personal.experience.relationships')
  assert.match(String(relation?.value), /co-founded \| Example Studio \| 2019 \| present \| ownership: unstated/)
})

test('portrait and case-study assets need granted public rights before public release', () => {
  const { root } = brand()
  const policyFile = path.join(root, 'brand/publication-policy.yaml')
  const policy = parse(fs.readFileSync(policyFile, 'utf8')) as Record<string, unknown>
  policy.approved_asset_ids = ['asset.photo.headshot', 'asset.logo.mark']
  fs.writeFileSync(policyFile, stringify(policy))
  const base = { id: 'asset.photo.headshot', status: 'approved', visibility: 'public', subject: 'portrait' }
  assert.equal(assetIsPublic(root, base), false, 'no rights record')
  assert.equal(assetIsPublic(root, { ...base, rights: { status: 'pending', scope: 'public', holder: 'Example Photographer' } }), false)
  assert.equal(assetIsPublic(root, { ...base, rights: { status: 'granted', scope: 'internal', holder: 'Example Photographer' } }), false)
  assert.equal(assetIsPublic(root, { ...base, rights: { status: 'granted', scope: 'public', holder: 'Example Photographer', expires: '2020-01-01' } }), false)
  assert.equal(assetIsPublic(root, { ...base, rights: { status: 'granted', scope: 'public', holder: 'Example Photographer', evidence_id: 'ev-0009' } }), false, 'unknown permission id')
  assert.equal(assetIsPublic(root, { ...base, rights: { status: 'granted', scope: 'public', holder: 'Example Photographer', expires: '2099-12-31' } }), true)
  // Tags count as a subject too, and ordinary brand assets are unaffected.
  assert.equal(assetIsPublic(root, { id: 'asset.photo.headshot', status: 'approved', visibility: 'public', tags: ['case-study'] }), false)
  assert.equal(assetIsPublic(root, { id: 'asset.logo.mark', status: 'approved', visibility: 'public', tags: ['logo'] }), true)
})

test('retracting a claim removes it from facts, publication and drafts but keeps ledger history', () => {
  const { engine, proof, root } = brand()
  answer(engine, 'personal.identity.headline', 'Award-winning product strategist')
  approve(engine, proof, ['personal.identity.headline'])
  assert.equal(publish(engine, proof, 'personal.identity.headline')?.outcome, 'published')
  assert.equal(engine.approvals().retract('personal.identity.headline', 'nope', 'wrong').kind, 'error')
  const step = engine.approvals().retract('personal.identity.headline', proof, 'The award claim was wrong')
  assert.equal(step.kind, 'recorded', step.message)
  assert.equal(readFacts(root, 'approved', SLUG)['personal.identity.headline'], undefined)
  assert.equal(guestValue(engine, 'personal.identity.headline'), undefined)
  const policy = parse(fs.readFileSync(path.join(root, 'brand/publication-policy.yaml'), 'utf8')) as { approved_fact_ids: string[] }
  assert.ok(!policy.approved_fact_ids.includes('personal.identity.headline'))
  const draft = fs.readFileSync(path.join(root, 'brand/generated/drafts/personal-identity.md'), 'utf8')
  assert.ok(!draft.includes('Award-winning'), 'derived drafts no longer carry the retracted value')
  assert.equal(latestAnswers(engine.ledger().records).get('personal.identity.headline')?.status, 'deprecated')
  assert.ok(engine.ledger().records.some((record) => record.value === 'Award-winning product strategist'), 'history is kept')
})
