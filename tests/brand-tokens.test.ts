import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse } from 'yaml'
import {
  agentTokenContext,
  applyInit,
  approveTokens,
  brandRetrieve,
  ensureApprovalSecret,
  generateTokens,
  guestContext,
  InterviewEngine,
  publishTokens,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { RetrievedItem } from '@brand-os/brand-core'
import { compileTokens, tokenDigest } from '@brand-os/design-tokens'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const repo = path.resolve(import.meta.dirname, '..')
const tsx = path.join(repo, 'node_modules/.bin/tsx')
const SLUG = 'token-brand'

function brand(): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-tokens-'))
  writeStarterWorkspace(root)
  // The starter workspace has no token files; use the template's EXAMPLE set as the base.
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  fs.rmSync(path.join(root, 'brand/tokens/generated'), { recursive: true, force: true })
  fs.rmSync(path.join(root, 'brand/tokens/approvals.yaml'), { force: true })
  applyInit(root, { name: 'Token Brand', slug: SLUG, industry: 'education', language: 'en', languages: ['en', 'fa', 'tr'], mascot: false, gamification: false, publish: 'public' })
  return { root, engine: new InterviewEngine(root), proof: ensureApprovalSecret(root) }
}

function approveAnswer(engine: InterviewEngine, proof: string, id: string, value: string): void {
  const recorded = engine.answerQuestion(id, value)
  assert.equal(recorded.kind, 'recorded', recorded.message)
  const result = engine.approvals().approveBatch({ ids: [id] }, proof)
  assert.equal(result.approved, 1, JSON.stringify(result.results))
}

function tokenIds(engine: InterviewEngine, ctx: Parameters<typeof brandRetrieve>[1]): string[] {
  return ((brandRetrieve(engine, ctx, { kind: 'tokens' }).data as { items: RetrievedItem[] }).items ?? []).map((item) => item.id)
}

function generatedFile(root: string, file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(root, 'brand/tokens/generated', file), 'utf8')) as Record<string, unknown>
}

test('a draft color answer produces no token', () => {
  const { root, engine } = brand()
  assert.equal(engine.answerQuestion('brand.color.roles', 'primary #0B2A55').kind, 'recorded')
  const report = generateTokens(root, SLUG)
  assert.equal(report.sources.find((source) => source.question_id === 'brand.color.roles')?.state, 'missing')
  assert.equal(report.tokens.length, 0)
  assert.equal(fs.existsSync(path.join(root, 'brand/tokens/generated/color.tokens.json')), false)
})

test('an approved color yields a draft token that is retrievable only after hash approval and publication', () => {
  const { root, engine, proof } = brand()
  approveAnswer(engine, proof, 'brand.color.roles', 'primary #0B2A55; highlight #FFD166')
  const report = generateTokens(root, SLUG)
  assert.equal(report.ok, true, report.note)
  assert.deepEqual(report.tokens.map((token) => [token.id, token.outcome]), [['color.brand.primary', 'created'], ['color.brand.highlight', 'created']])
  const doc = generatedFile(root, 'color.tokens.json') as { color: { brand: { primary: { $value: { hex: string }; $extensions: { 'brand.os': { status: string; source_fact: string } } } } } }
  assert.equal(doc.color.brand.primary.$value.hex, '#0B2A55')
  assert.equal(doc.color.brand.primary.$extensions['brand.os'].status, 'draft')
  assert.equal(doc.color.brand.primary.$extensions['brand.os'].source_fact, 'brand.color.roles')
  // The generated value overrides the EXAMPLE base value in the compiled set.
  const compiled = compileTokens(root)
  assert.deepEqual(compiled.errors, [])
  assert.equal(compiled.flat['color.brand.primary']?.hex, '#0B2A55')
  assert.equal(compiled.flat['color.brand.primary']?.source, 'generated')

  const agent = agentTokenContext(SLUG, 'agt_test', 'design')
  const guest = guestContext(SLUG)
  assert.ok(!tokenIds(engine, agent).includes('color.brand.primary'), 'draft is not retrievable')
  assert.ok(!tokenIds(engine, guest).includes('color.brand.primary'))

  // A wrong proof changes nothing.
  assert.equal(approveTokens(root, ['color.brand.primary'], 'wrong-proof').proof, 'rejected')
  assert.equal(fs.existsSync(path.join(root, 'brand/tokens/approvals.yaml')), false)

  const approved = approveTokens(root, ['color.brand.primary'], proof)
  assert.equal(approved.ok, true, JSON.stringify(approved))
  assert.ok(tokenIds(engine, agent).includes('color.brand.primary'), 'approved token is internal')
  assert.ok(!tokenIds(engine, guest).includes('color.brand.primary'), 'approval is not publication')
  assert.ok(!tokenIds(engine, agent).includes('color.brand.highlight'), 'unapproved sibling stays a draft')

  assert.equal(publishTokens(root, ['color.brand.highlight'], proof).results[0]?.outcome, 'refused', 'unapproved tokens cannot be published')
  const published = publishTokens(root, ['color.brand.primary'], proof)
  assert.equal(published.ok, true)
  assert.ok(tokenIds(engine, guest).includes('color.brand.primary'))
  const item = (brandRetrieve(engine, guest, { kind: 'tokens', ids: ['color.brand.primary'] }).data as { items: RetrievedItem[] }).items[0]
  assert.equal(item?.value, '#0B2A55')
})

test('font and logo answers become typography and logo draft tokens', () => {
  const { root, engine, proof } = brand()
  approveAnswer(engine, proof, 'brand.type.scale', 'body: Inter, system-ui, sans-serif @ 16px/1.5')
  approveAnswer(engine, proof, 'brand.logo.min_size', 'min-size: 24px; clear-space: 0.5x; min-print: 10mm')
  const report = generateTokens(root, SLUG)
  assert.equal(report.ok, true, report.note)
  const flat = compileTokens(root).flat
  assert.deepEqual(flat['type.fontFamily.body']?.value, ['Inter', 'system-ui', 'sans-serif'])
  assert.deepEqual(flat['type.fontSize.body']?.value, { value: 16, unit: 'px' })
  assert.equal(flat['type.lineHeight.body']?.value, 1.5)
  assert.deepEqual(flat['logo.minSize']?.value, { value: 24, unit: 'px' })
  assert.equal(flat['logo.clearSpace']?.value, 0.5)
  assert.deepEqual(flat['logo.minPrintSize']?.value, { value: 10, unit: 'mm' })
})

test('an existing approved token is not overwritten by a new answer', () => {
  const { root, engine, proof } = brand()
  approveAnswer(engine, proof, 'brand.color.roles', 'primary #0B2A55')
  generateTokens(root, SLUG)
  assert.equal(approveTokens(root, ['color.brand.primary'], proof).ok, true)
  const approvalsBefore = fs.readFileSync(path.join(root, 'brand/tokens/approvals.yaml'), 'utf8')

  // The owner approves a new palette answer through the change flow.
  const change = engine.changeAnswer('brand.color.roles', 'primary #1B3A66; surface #F7F5F2', true)
  assert.notEqual(change.kind, 'error', change.message)
  const batch = engine.approvals().approveBatch({ ids: ['brand.color.roles'] }, proof)
  assert.equal(batch.ok, true, JSON.stringify(batch.results))

  const report = generateTokens(root, SLUG)
  const primary = report.tokens.find((token) => token.id === 'color.brand.primary')
  assert.equal(primary?.outcome, 'refused_approved')
  assert.equal(report.tokens.find((token) => token.id === 'color.brand.surface')?.outcome, 'created')
  assert.equal(compileTokens(root).flat['color.brand.primary']?.hex, '#0B2A55', 'approved value kept')
  assert.equal(fs.readFileSync(path.join(root, 'brand/tokens/approvals.yaml'), 'utf8'), approvalsBefore)

  // An approval on a base id (written by hand) is also respected: the generated value is not emitted.
  const fresh = brand()
  const digest = tokenDigest({ hex: '#123A73', value: null })
  fs.writeFileSync(path.join(fresh.root, 'brand/tokens/approvals.yaml'), `approved:\n  color.brand.primary:\n    approved_by: human\n    value_sha256: ${digest}\n`)
  approveAnswer(fresh.engine, fresh.proof, 'brand.color.roles', 'primary #0B2A55')
  const refused = generateTokens(fresh.root, SLUG)
  assert.equal(refused.tokens[0]?.outcome, 'refused_approved')
  assert.equal(compileTokens(fresh.root).flat['color.brand.primary']?.hex, '#123A73')
})

test('EXAMPLE base tokens cannot be approved with the token command', () => {
  const { root, proof } = brand()
  const result = approveTokens(root, ['color.brand.secondary', 'color.nope'], proof)
  assert.equal(result.ok, false)
  assert.deepEqual(result.results.map((item) => item.outcome), ['refused', 'unknown'])
  assert.equal(fs.existsSync(path.join(root, 'brand/tokens/approvals.yaml')), false)
})

test('a generated palette that fails contrast is reported and cannot be approved', () => {
  const { root, engine, proof } = brand()
  approveAnswer(engine, proof, 'brand.color.roles', 'primary #DDDDDD')
  const report = generateTokens(root, SLUG)
  assert.equal(report.ok, false)
  assert.match(report.note, /Contrast pair/)
  const approval = approveTokens(root, ['color.brand.primary'], proof)
  assert.equal(approval.ok, false)
  assert.ok(approval.errors.length > 0)
})

test('the token CLI refuses argv proofs and agent tokens, and reads the proof from the environment', () => {
  const { root, engine, proof } = brand()
  approveAnswer(engine, proof, 'brand.color.roles', 'primary #0B2A55')
  const base: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && key !== 'BRAND_OS_AGENT_TOKEN' && key !== 'BRAND_OS_APPROVAL_PROOF') base[key] = value
  }
  const cli = (args: string[], env: Record<string, string> = {}) =>
    spawnSync(tsx, [path.join(repo, 'scripts/brand.ts'), ...args], { cwd: root, env: { ...base, ...env }, input: '', encoding: 'utf8', timeout: 60_000 })

  const generated = cli(['tokens:generate', '--json'])
  assert.equal(generated.status, 0, generated.stderr)
  assert.equal((JSON.parse(generated.stdout) as { tokens: Array<{ id: string }> }).tokens[0]?.id, 'color.brand.primary')

  const argv = cli(['tokens:approve', '--ids', 'color.brand.primary', '--proof', proof])
  assert.equal(argv.status, 2)
  assert.ok(!argv.stderr.includes(proof) && !argv.stdout.includes(proof), 'the proof is never echoed')
  const asAgent = cli(['tokens:approve', '--ids', 'color.brand.primary'], { BRAND_OS_AGENT_TOKEN: 'bos_at_x', BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(asAgent.status, 2)
  assert.equal(fs.existsSync(path.join(root, 'brand/tokens/approvals.yaml')), false)

  const ok = cli(['tokens:approve', '--ids', 'color.brand.primary', '--json'], { BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(ok.status, 0, ok.stderr)
  const published = cli(['tokens:publish', '--ids', 'color.brand.primary', '--json'], { BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(published.status, 0, published.stderr)
  const policy = parse(fs.readFileSync(path.join(root, 'brand/publication-policy.yaml'), 'utf8')) as { approved_token_ids: string[]; brand_id: string }
  assert.deepEqual(policy.approved_token_ids, ['color.brand.primary'])
  assert.equal(policy.brand_id, SLUG)
})
