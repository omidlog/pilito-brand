import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse } from 'yaml'
import { applyInit, backupBrand, buildBusinessPlan, ensureApprovalSecret, readFacts, restoreBrand, getBrandStatus, getDesignComponent, getBrandTokens, InterviewEngine, migrateBrand, readPublicationPolicy, searchBrandDocs, writeStarterWorkspace } from '@brand-os/brand-core'
import { inspectAssetForPublication } from '@brand-os/asset-catalog'
import { prepareDocs } from '../scripts/prepare-docs.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-remediation-'))
  writeStarterWorkspace(root)
  fs.cpSync(path.join(path.resolve(import.meta.dirname, '..'), 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  return root
}

test('public MCP never returns draft components, private metrics or token values', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  const component = getDesignComponent(engine, 'button')
  assert.equal(component.approved, false)
  assert.equal((component.data as { found: boolean }).found, false)
  assert.equal(JSON.stringify(getBrandStatus(engine)).includes('requiredUnanswered'), false)
  assert.deepEqual((getBrandTokens(engine).data as { tokens: unknown[] }).tokens, [])
})

test('public publication is opt-in, including facts, pages, and assets', () => {
  const root = fixture()
  applyInit(root, { name: 'Example 2', slug: 'example-two', industry: 'software', language: 'en', languages: ['en'], mascot: true, gamification: false, publish: 'public' })
  const engine = new InterviewEngine(root)
  engine.submit('new')
  engine.submit('Example 2')
  const proof = ensureApprovalSecret(root)
  engine.approve('business.identity.trade_name', 'owner', proof)
  assert.deepEqual((searchBrandDocs(engine, 'Example 2').data as { hits: unknown[] }).hits, [])
  engine.publishFact('business.identity.trade_name', proof)
  assert.equal(engine.exportPublic().facts[0]?.value, 'Example 2')
  const policy = readPublicationPolicy(root)
  assert.equal(policy.approved_page_ids.length, 0)
  assert.equal(policy.approved_asset_ids.length, 0)
  prepareDocs(root, { audience: 'public' })
  const assets = JSON.parse(fs.readFileSync(path.join(root, 'apps/docs/src/data/assets.json'), 'utf8')) as { assets: unknown[] }
  assert.deepEqual(assets.assets, [])
  const tokens = JSON.parse(fs.readFileSync(path.join(root, 'apps/docs/src/data/tokens.json'), 'utf8')) as { colors: unknown[] }
  assert.deepEqual(tokens.colors, [])
  const intro = fs.readFileSync(path.join(root, 'apps/docs/docs/start/introduction.md'), 'utf8')
  assert.equal(intro.includes('Example 2'), false)
})

test('two approved changes cannot reuse the same previous revision', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  engine.submit('new')
  engine.submit('Original Brand')
  const proof = ensureApprovalSecret(root)
  assert.equal(engine.approve('business.identity.trade_name', 'owner', proof).kind, 'recorded')
  const first = engine.requestChange('business.identity.trade_name', 'Replacement A')
  const second = engine.requestChange('business.identity.trade_name', 'Replacement B')
  assert.equal(engine.approveChange(first.id, proof, first.expected_version).kind, 'recorded')
  assert.equal(engine.approveChange(second.id, proof, second.expected_version).kind, 'error')
  assert.equal(engine.exportPublic().facts.length, 0)
})

test('migration log stays parseable and backups never contain earlier backups', () => {
  const root = fixture()
  migrateBrand(root)
  migrateBrand(root)
  const log = parse(fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8')) as { applied: Array<{ id: string }> }
  assert.equal(Array.isArray(log.applied), true)
  assert.equal(log.applied.length, 1) // repeated migrations must be idempotent
  const a = backupBrand(root)
  const b = backupBrand(root, path.join(root, 'brand/.private/backups/second'))
  assert.equal(a.files.some((f) => f.includes('/backups/')), false)
  assert.equal(b.files.some((f) => f.includes('/backups/')), false)
  assert.equal(b.files.length, a.files.length)
})

test('unsafe SVG variants are rejected even without script elements', () => {
  const root = fixture()
  for (const [name, svg] of Object.entries({
    embedded: '<svg><foreignObject><body onload="alert(1)"/></foreignObject></svg>',
    event: '<svg><rect onpointerenter="alert(1)"/></svg>',
    link: '<svg><a xlink:href="javascript:alert(1)"><rect/></a></svg>',
    entity: '<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>',
  })) {
    const file = path.join(root, `brand/assets/icons/${name}.svg`)
    fs.writeFileSync(file, svg)
    assert.equal(inspectAssetForPublication(root, `brand/assets/icons/${name}.svg`).ok, false)
  }
})

test('a backup includes migration history, so a restore undoes a half-written migration', () => {
  const root = fixture()
  migrateBrand(root)
  const saved = backupBrand(root)
  const history = fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8')
  const lock = fs.readFileSync(path.join(root, 'brand/engine.lock'), 'utf8')
  assert.ok(saved.files.includes('brand/migrations.yaml'))
  assert.ok(saved.files.includes('brand/engine.lock'))
  fs.writeFileSync(path.join(root, 'brand/migrations.yaml'), 'schema_version: 1\napplied: {truncated\n')
  fs.writeFileSync(path.join(root, 'brand/engine.lock'), '{')
  assert.throws(() => migrateBrand(root))
  restoreBrand(root, saved.directory)
  assert.equal(fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8'), history)
  assert.equal(fs.readFileSync(path.join(root, 'brand/engine.lock'), 'utf8'), lock)
  assert.doesNotThrow(() => migrateBrand(root))
})

test('an approved restricted fact is shown as approved and withheld in documents, not as missing', () => {
  const root = fixture()
  applyInit(root, { name: 'Withheld', slug: 'withheld-brand', industry: 'software', language: 'en', languages: ['en'], mascot: false, gamification: false, publish: 'private' })
  const engine = new InterviewEngine(root)
  assert.equal(engine.answerQuestion('business.finance.costs', 'RESTRICTED-DOC-CANARY').kind, 'recorded')
  const result = engine.approvals().approveBatch({ ids: ['business.finance.costs'] }, ensureApprovalSecret(root))
  assert.equal(result.approved, 1)
  assert.equal(readFacts(root, 'approved', 'withheld-brand')['business.finance.costs']?.value, null)
  const plan = buildBusinessPlan(engine, 'internal')
  const costs = plan.sections.flatMap((section) => section.items).find((item) => item.id === 'business.finance.costs')
  assert.equal(costs?.tag, 'approved')
  assert.equal(costs?.withheld, true)
  assert.equal(costs?.value, null)
  assert.equal(JSON.stringify(plan).includes('RESTRICTED-DOC-CANARY'), false)
  const publicPlan = buildBusinessPlan(engine, 'public')
  assert.equal(publicPlan.sections.flatMap((section) => section.items).find((item) => item.id === 'business.finance.costs')?.tag, 'missing')
})
