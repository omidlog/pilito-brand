import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
  applyInit,
  ensureApprovalSecret,
  getBrandTokens,
  InterviewEngine,
  listMascotAssets,
  renderBusinessArtifacts,
  searchBrandDocs,
  upgradeCore,
  validateRepo,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import { compileTokens } from '@brand-os/design-tokens'
import { prepareDocs } from '../scripts/prepare-docs.js'
process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

const repo = path.resolve(import.meta.dirname, '..')

function fresh(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-audit-'))
  writeStarterWorkspace(dir)
  fs.cpSync(path.join(repo, 'schemas'), path.join(dir, 'schemas'), { recursive: true })
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(dir, 'brand/tokens'), { recursive: true })
  return dir
}

test('materialize does not overwrite customized brand files', () => {
  const root = fresh()
  const catalog = path.join(root, 'brand/mascot/catalog.yaml')
  const overview = path.join(root, 'brand/content/01-brand-strategy/overview.md')
  const manifest = path.join(root, 'brand/assets/asset-manifest.yaml')
  fs.appendFileSync(catalog, '\n# owner-custom-stage-note\n')
  fs.appendFileSync(overview, '\nOwner guidance sentence.\n')
  fs.appendFileSync(manifest, '\n# owner-asset-note\n')
  const before = [catalog, overview, manifest].map((file) => fs.readFileSync(file))
  writeStarterWorkspace(root)
  writeStarterWorkspace(root)
  const after = [catalog, overview, manifest].map((file) => fs.readFileSync(file))
  assert.deepEqual(after, before)
})

test('restricted canary is absent from tracked files and public artifacts', () => {
  const root = fresh()
  execFileSync('git', ['init'], { cwd: root })
  const sessionPath = path.join(root, 'brand/interview/session-state.yaml')
  fs.writeFileSync(sessionPath, fs.readFileSync(sessionPath, 'utf8').replace('cursor_question_id: null', 'cursor_question_id: business.finance.revenue_figure'))
  const again = new InterviewEngine(root)
  again.submit('CANARY-RESTRICTED-99')
  execFileSync('git', ['add', '-A'], { cwd: root })
  let grep = ''
  try {
    grep = execFileSync('git', ['grep', '-I', '-n', 'CANARY-RESTRICTED-99'], { cwd: root, encoding: 'utf8' })
  } catch {
    grep = ''
  }
  assert.equal(grep, '')
  assert.equal(JSON.stringify(again.exportSnapshot('public')).includes('CANARY-RESTRICTED-99'), false)
  assert.equal(again.revealRestricted('business.finance.revenue_figure').ok, false)
  const proof = ensureApprovalSecret(root)
  const revealed = again.revealRestricted('business.finance.revenue_figure', proof)
  assert.equal(revealed.ok && revealed.value, 'CANARY-RESTRICTED-99')
  prepareDocs(root, { audience: 'public', rootIndex: false })
  const docs = path.join(root, 'apps/docs')
  assert.equal(walk(docs).includes('CANARY-RESTRICTED-99'), false)
})

test('approved public claims are published and a private brand cannot build public docs', () => {
  const root = fresh()
  applyInit(root, {
    name: 'Published Example',
    slug: 'published-example',
    industry: 'education',
    language: 'en',
    languages: ['en'],
    mascot: true,
    gamification: false,
    publish: 'public',
    profile: 'education',
  })
  const engine = new InterviewEngine(root)
  engine.submit('new')
  engine.submit('Published Example')
  const proof = ensureApprovalSecret(root)
  assert.equal(engine.approve('business.identity.trade_name', 'owner', proof).status, 'approved')
  assert.equal(engine.publishFact('business.identity.trade_name', proof).kind, 'recorded')
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'brand/brand-manifest.json'), 'utf8')) as { name: string; slug: string }
  assert.equal(manifest.name, 'Published Example')
  assert.equal(manifest.slug, 'published-example')
  prepareDocs(root, { audience: 'public', rootIndex: false })
  const claims = fs.readFileSync(path.join(root, 'apps/docs/docs/published/claims.md'), 'utf8')
  assert.match(claims, /Published Example/)
  assert.match(claims, /business\.identity\.trade_name/)
  const config = fs.readFileSync(path.join(root, 'brand/brand.config.yaml'), 'utf8').replace('publish_docs: public', 'publish_docs: private')
  fs.writeFileSync(path.join(root, 'brand/brand.config.yaml'), config)
  assert.throws(() => prepareDocs(root, { audience: 'public', rootIndex: false }), /private/)
})

test('free-form note proposes drafts and does not approve them', () => {
  const root = fresh()
  const engine = new InterviewEngine(root)
  const result = engine.submit('note:\nTrade name: Note Example\n')
  assert.match(result.message, /not approvals/i)
  const saved = engine.submit('accept proposal 1')
  assert.equal(saved.status, 'draft')
  assert.equal(engine.approve('business.identity.trade_name', 'owner').kind, 'error')
})

test('upgrade and one-stage mascot configuration keep custom data', () => {
  const root = fresh()
  const overview = path.join(root, 'brand/content/04-color-system/overview.md')
  fs.appendFileSync(overview, '\nCustom color sentence.\n')
  const before = fs.readFileSync(overview)
  upgradeCore(root)
  assert.deepEqual(fs.readFileSync(overview), before)
  assert.match(fs.readFileSync(path.join(root, 'brand/engine.lock'), 'utf8'), /0\.3\.0/)
  const stages = path.join(root, 'brand/mascot/stages.yaml')
  fs.writeFileSync(stages, 'schema_version: 1\nstages:\n  - id: only.stage\n    order: 1\n    name: Single\n    status: draft\n')
  const report = validateRepo(root)
  assert.equal(report.errors.filter((error) => error.includes('6 example')).length, 0)
  assert.equal(report.errors.some((error) => error.includes('stage')), false)
})

test('retrieval reads approved YAML instead of hard-coded placeholders', () => {
  const root = fresh()
  const engine = new InterviewEngine(root)
  const hex = compileTokens(root).flat['color.brand.primary']?.hex
  assert.ok(hex)
  const sha = crypto.createHash('sha256').update(hex).digest('hex')
  fs.writeFileSync(path.join(root, 'brand/tokens/approvals.yaml'), `approved:\n  color.brand.primary:\n    approved_by: human\n    value_sha256: ${sha}\n`)
  fs.writeFileSync(path.join(root, 'brand/publication-policy.yaml'), 'schema_version: 1\nbrand_id: example-brand\napproved_fact_ids: []\napproved_page_ids: [mascot.emotion.joyful]\napproved_asset_ids: []\napproved_token_ids: [color.brand.primary]\n')
  const tokens = getBrandTokens(engine)
  const list = (tokens.data as { tokens: Array<{ id: string; value: string }> }).tokens
  assert.equal(list.length, 1)
  assert.equal(list[0]?.id, 'color.brand.primary')
  assert.match(String(list[0]?.value), /123A73/)
  const catalog = fs.readFileSync(path.join(root, 'brand/mascot/catalog.yaml'), 'utf8').replace('id: mascot.ui.success\n    category: ui\n    name: Success\n    intent:', 'id: mascot.ui.success\n    category: ui\n    name: Success\n    intent:')
  fs.writeFileSync(path.join(root, 'brand/mascot/catalog.yaml'), catalog.replace("status: defined\n    do:", 'status: approved\n    do:').replace('status: defined', 'status: approved'))
  const assets = listMascotAssets(engine)
  assert.ok((assets.data as { rows: unknown[] }).rows.length > 0)
  assert.equal((assets.data as { rows: Array<{ source_assets?: string[] }> }).rows.every((row) => (row.source_assets ?? []).length === 0), true)
  const plan = renderBusinessArtifacts(engine)['business-plan.md']
  assert.match(plan ?? '', /Unknown — not invented/)
  assert.equal((plan ?? '').includes('CANARY'), false)
  const found = searchBrandDocs(engine, 'color.brand.primary')
  assert.equal(JSON.stringify(found).includes('CANARY-RESTRICTED'), false)
})

test('token aliases report cycles', () => {
  const root = fresh()
  fs.writeFileSync(
    path.join(root, 'brand/tokens/color.tokens.json'),
    JSON.stringify({
      color: {
        a: { $type: 'color', $value: '{color.b}' },
        b: { $type: 'color', $value: '{color.a}' },
      },
    }),
  )
  const compiled = compileTokens(root)
  assert.ok(compiled.errors.some((error) => error.includes('cycle')))
})

test('an MCP client can list tools and call them with Unicode', async () => {
  const root = fresh()
  const transport = new StdioClientTransport({
    command: path.join(repo, 'node_modules/.bin/tsx'),
    args: [path.join(repo, 'scripts/mcp.ts')],
    cwd: root,
    stderr: 'pipe',
  })
  const client = new Client({ name: 'brand-os-test', version: '0.0.1' })
  await client.connect(transport)
  try {
    const tools = await client.listTools()
    const names = tools.tools.map((tool) => tool.name).sort()
    assert.deepEqual(names, ['brand_retrieve', 'draft_personal_content', 'get_asset_metadata', 'get_brand_guidelines', 'get_brand_overview', 'get_brand_status', 'get_brand_tokens', 'get_business_plan', 'get_design_component', 'get_logo_rules', 'get_marketing_plan', 'get_mascot_guidelines', 'get_mascot_profile', 'get_motion_guidelines', 'get_social_template', 'list_mascot_assets', 'list_mascot_stages', 'search_brand_docs', 'search_mascot_assets'])
    for (const tool of tools.tools) assert.ok(tool.inputSchema)
    const status = await client.callTool({ name: 'get_brand_status', arguments: {} })
    assert.match(JSON.stringify(status), /Unpublished/)
    assert.equal(JSON.stringify(status).includes('coverage'), false)
    assert.equal(JSON.stringify(status).includes('EXAMPLE Brand'), false)
    const search = await client.callTool({ name: 'search_brand_docs', arguments: { query: 'برند', include_unapproved: true } })
    assert.equal(typeof search, 'object')
    const invalid = await client.callTool({ name: 'get_design_component', arguments: {} })
    assert.equal((invalid as { isError?: boolean }).isError, true)
  } finally {
    await client.close()
  }
})

test('disabled mascot build data does not contain catalog ids', () => {
  const root = fresh()
  prepareDocs(root, { audience: 'public', mascot: false, gamification: false, rootIndex: false })
  const catalog = fs.readFileSync(path.join(root, 'apps/docs/src/data/catalog.json'), 'utf8')
  assert.equal(catalog.includes('mascot.emotion.joyful'), false)
  assert.equal(fs.existsSync(path.join(root, 'apps/docs/docs/brand/06-mascot-identity/overview.md')), false)
})

function walk(dir: string): string {
  if (!fs.existsSync(dir)) return ''
  let text = ''
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) text += walk(full)
    else if (/\.(md|html|json|txt|js|css)$/.test(entry.name)) text += fs.readFileSync(full, 'utf8')
  }
  return text
}

