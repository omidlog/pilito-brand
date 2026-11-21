import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { applyInit, buildDashboard, ensureApprovalSecret, InterviewEngine, PUBLIC_DASHBOARD_NOTE, writeStarterWorkspace } from '@brand-os/brand-core'
import type { InternalDashboard } from '@brand-os/brand-core'
import { prepareDocs } from '../scripts/prepare-docs.js'
import { scanPublicTree } from '../scripts/scan-public.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const repo = path.resolve(import.meta.dirname, '..')

function brand(publish: 'public' | 'private'): { root: string; engine: InterviewEngine } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-dashboard-'))
  writeStarterWorkspace(root)
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  applyInit(root, { name: 'Dash Brand', slug: 'dash-brand', industry: 'education', language: 'en', languages: ['en'], mascot: false, gamification: false, publish })
  const engine = new InterviewEngine(root)
  // A draft, an approved fact with a pending change, a restricted draft, and a name contradiction.
  engine.answerQuestion('brand.strategy.vision', 'DASH-DRAFT-VISION')
  engine.answerQuestion('brand.strategy.purpose', 'DASH-APPROVED-PURPOSE')
  engine.approvals().approveBatch({ ids: ['brand.strategy.purpose'] }, ensureApprovalSecret(root))
  engine.requestChange('brand.strategy.purpose', 'DASH-PROPOSED-PURPOSE')
  engine.answerQuestion('business.finance.costs', 'DASH-RESTRICTED-CANARY')
  engine.answerQuestion('business.identity.trade_name', 'Dash Brand')
  engine.answerQuestion('brand.identity.public_name_override', 'Dashing')
  return { root, engine }
}

test('the internal dashboard lists coverage, the review queue and contradictions without restricted values', () => {
  const { engine } = brand('private')
  const dashboard = buildDashboard(engine, 'internal') as InternalDashboard
  assert.equal(dashboard.available, true)
  assert.equal(dashboard.brand_id, 'dash-brand')
  assert.ok(dashboard.coverage.required > 0)
  assert.ok(dashboard.modules.some((module) => module.id === 'brand-strategy' && module.pending_review >= 2))
  assert.equal(dashboard.modules.some((module) => module.id === 'mascot-identity'), false, 'disabled modules are not listed')
  const queue = new Map(dashboard.review_queue.items.map((item) => [item.question_id, item]))
  assert.equal(queue.get('brand.strategy.vision')?.draft_value, 'DASH-DRAFT-VISION')
  assert.equal(queue.get('brand.strategy.purpose')?.state, 'change_pending')
  assert.equal(queue.get('brand.strategy.purpose')?.approved_value, 'DASH-APPROVED-PURPOSE')
  assert.equal(queue.get('business.finance.costs')?.withheld, true)
  assert.equal(queue.get('business.finance.costs')?.draft_value, null)
  assert.equal(JSON.stringify(dashboard).includes('DASH-RESTRICTED-CANARY'), false)
  assert.ok(dashboard.contradictions.some((item) => item.fields.includes('brand.identity.public_name_override')))
  assert.ok(dashboard.next.length > 0)
})

test('the public dashboard is a stub with no brand data, in the API and in the docs build', () => {
  const { root, engine } = brand('public')
  assert.deepEqual(buildDashboard(engine, 'public'), { schema_version: 1, audience: 'public', available: false, note: PUBLIC_DASHBOARD_NOTE })
  assert.equal(buildDashboard(engine, 'restricted').available, false)
  prepareDocs(root, { audience: 'public', rootIndex: false })
  const docs = path.join(root, 'apps/docs')
  const data = fs.readFileSync(path.join(docs, 'src/data/dashboard.json'), 'utf8')
  assert.equal(JSON.parse(data).available, false)
  for (const canary of ['DASH-DRAFT-VISION', 'DASH-PROPOSED-PURPOSE', 'DASH-RESTRICTED-CANARY', 'Dashing']) assert.equal(data.includes(canary), false, canary)
  assert.deepEqual(scanPublicTree(docs), [])
  prepareDocs(root, { audience: 'internal', rootIndex: false })
  const internal = JSON.parse(fs.readFileSync(path.join(docs, 'src/data/dashboard.json'), 'utf8')) as InternalDashboard
  assert.equal(internal.available, true)
  assert.ok(internal.review_queue.items.length > 0)
})

test('a private brand gets its dashboard only from an internal build; the public build is refused', () => {
  const { root } = brand('private')
  assert.throws(() => prepareDocs(root, { audience: 'public', rootIndex: false }), /private/)
  prepareDocs(root, { audience: 'internal', rootIndex: false })
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'apps/docs/src/data/dashboard.json'), 'utf8')).available, true)
  // The docs navbar links the dashboard only when the build is internal.
  const config = fs.readFileSync(path.join(repo, 'apps/docs/docusaurus.config.ts'), 'utf8')
  assert.match(config, /features\.audience === 'internal' \? \[\{ to: '\/dashboard'/)
})
