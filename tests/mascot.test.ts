import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import {
  applyInit,
  brandRetrieve,
  guestContext,
  InterviewEngine,
  issueAgentToken,
  migrateBrand,
  migrateMascotCatalog,
  resolveAgentContext,
  validateRepo,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { AuthContext, MascotFilters, RetrievedItem } from '@brand-os/brand-core'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

const repo = path.resolve(import.meta.dirname, '..')
const SLUG = 'mascot-brand'
const CELEBRATING = 'mascot.emotion.celebrating'
const ART_ID = 'mascot.emotion.celebrating.explorer.front'
const ASSET_ID = 'asset.mascot.celebrating-explorer-front'
const ASSET_PATH = 'brand/assets/mascot/celebrating-explorer-front.svg'
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><title>fixture</title><rect width="10" height="10" fill="#123A73"/></svg>\n'

type Row = Record<string, unknown>

function brand(mascot = true): { root: string; engine: InterviewEngine } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-mascot-'))
  writeStarterWorkspace(root)
  fs.cpSync(path.join(repo, 'schemas'), path.join(root, 'schemas'), { recursive: true })
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  applyInit(root, { name: 'Mascot Brand', slug: SLUG, industry: 'education', language: 'en', languages: ['en', 'fa', 'tr'], mascot, gamification: false, publish: 'public' })
  return { root, engine: new InterviewEngine(root) }
}

function design(root: string): AuthContext {
  const issued = issueAgentToken(root, { brandId: SLUG, profile: 'design', label: 'mascot test agent' })
  return resolveAgentContext(root, SLUG, issued.token)
}

function readYaml<T>(root: string, relative: string): T {
  return parse(fs.readFileSync(path.join(root, relative), 'utf8')) as T
}

function writeYamlFile(root: string, relative: string, data: unknown): void {
  fs.writeFileSync(path.join(root, relative), stringify(data, { lineWidth: 100 }))
}

function editState(root: string, id: string, edit: (state: Row) => void): void {
  const doc = readYaml<{ schema_version: number; states: Row[] }>(root, 'brand/mascot/catalog.yaml')
  const state = doc.states.find((item) => item.id === id)
  assert.ok(state, id)
  edit(state)
  writeYamlFile(root, 'brand/mascot/catalog.yaml', doc)
}

function editAsset(root: string, edit: (assets: Row[]) => void): void {
  const manifest = readYaml<{ schema_version: number; assets: Row[] }>(root, 'brand/assets/asset-manifest.yaml')
  edit(manifest.assets)
  writeYamlFile(root, 'brand/assets/asset-manifest.yaml', manifest)
}

/** Registers one approved artwork file for stage 3 (example.stage.explorer), front angle, celebrating a correct answer. */
function approvedFixture(root: string, artStatus = 'approved', assetStatus = 'approved'): void {
  fs.writeFileSync(path.join(root, ASSET_PATH), SVG)
  const checksum = crypto.createHash('sha256').update(SVG).digest('hex')
  editAsset(root, (assets) => {
    assets.push({
      id: ASSET_ID,
      name: 'Celebrating, explorer stage, front',
      status: assetStatus,
      path: ASSET_PATH,
      present: true,
      checksum_sha256: checksum,
      visibility: 'internal',
      license: 'Owned by the test brand',
    })
  })
  editState(root, CELEBRATING, (state) => {
    state.status = artStatus
    state.use_cases = ['correct-answer', 'lesson-complete']
    state.artwork = [
      {
        id: ART_ID,
        stage: 'example.stage.explorer',
        angle: 'mascot.angle.front',
        intensity: 'high',
        outfit: 'explorer scarf',
        accessories: ['map'],
        asset_id: ASSET_ID,
        animation_refs: ['mascot.motion.celebrate'],
        status: artStatus,
        version: '1.0.0',
        license: { holder: 'Mascot Brand', terms: 'Owned outright; internal and marketing use' },
      },
    ]
  })
}

function find(engine: InterviewEngine, ctx: AuthContext, filters: MascotFilters) {
  const result = brandRetrieve(engine, ctx, { kind: 'mascot', filters })
  const data = result.data as { items: RetrievedItem[]; explanation?: string[] }
  return { result, items: data.items, explanation: data.explanation ?? [] }
}

const STAGE_THREE_CELEBRATING: MascotFilters = { emotion: 'celebrating', stage: '3', use_case: 'correct answer' }

test('the template catalog ships every state as defined and validates', () => {
  const catalog = readYaml<{ states: Row[] }>(repo, 'brand/mascot/catalog.yaml')
  assert.equal(catalog.states.length, 90)
  assert.ok(catalog.states.every((state) => state.status === 'defined'))
  const { root } = brand()
  assert.deepEqual(validateRepo(root).errors.filter((error) => /mascot/i.test(error)), [])
})

test('stage-3 celebrating returns missing with an explanation when there is no artwork', () => {
  const { root, engine } = brand()
  const ctx = design(root)
  const plain = find(engine, ctx, { emotion: 'celebrating', stage: '3' })
  assert.equal(plain.result.status, 'missing')
  assert.deepEqual(plain.items, [])
  assert.deepEqual(plain.result.missing, ['mascot: emotion=celebrating, stage=3'])
  assert.ok(plain.explanation.includes(`${CELEBRATING} is defined; no artwork exists for stage example.stage.explorer.`), plain.explanation.join('\n'))

  const withUseCase = find(engine, ctx, STAGE_THREE_CELEBRATING)
  assert.equal(withUseCase.result.status, 'missing')
  assert.match(withUseCase.explanation.join('\n'), /matches emotion "celebrating", but none lists use case "correct answer"/)

  const unknownStage = find(engine, ctx, { emotion: 'celebrating', stage: '9' })
  assert.match(unknownStage.explanation.join('\n'), /Stage 9 is not configured/)
  const unknownEmotion = find(engine, ctx, { emotion: 'ecstatic-dragon' })
  assert.match(unknownEmotion.explanation.join('\n'), /No catalog state matches emotion/)
})

test('an approved fixture is found by emotion, stage, use case and angle', () => {
  const { root, engine } = brand()
  approvedFixture(root)
  assert.deepEqual(validateRepo(root).errors.filter((error) => /mascot/i.test(error)), [])
  const ctx = design(root)
  const found = find(engine, ctx, STAGE_THREE_CELEBRATING)
  assert.equal(found.result.status, 'approved')
  assert.equal(found.items.length, 1)
  const item = found.items[0] as RetrievedItem
  assert.equal(item.id, ART_ID)
  assert.equal(item.classification, 'internal')
  assert.equal(item.publication, 'unpublished')
  const value = item.value as Record<string, unknown>
  assert.equal(value.state_id, CELEBRATING)
  assert.equal(value.stage, 'example.stage.explorer')
  assert.equal(value.stage_order, 3)
  assert.equal(value.angle, 'mascot.angle.front')
  assert.equal(value.lifecycle, 'approved')
  assert.deepEqual(value.asset, { id: ASSET_ID, path: ASSET_PATH, checksum_sha256: crypto.createHash('sha256').update(SVG).digest('hex') })
  assert.deepEqual(value.license, { holder: 'Mascot Brand', terms: 'Owned outright; internal and marketing use' })

  // The same art by stage id and angle short name.
  assert.equal(find(engine, ctx, { stage: 'example.stage.explorer', angle: 'front', emotion: 'Celebrating' }).items.length, 1)
  // A different angle or stage is missing, and says why.
  const back = find(engine, ctx, { emotion: 'celebrating', stage: '3', angle: 'back' })
  assert.equal(back.result.status, 'missing')
  assert.match(back.explanation.join('\n'), /no artwork exists for stage example\.stage\.explorer and angle mascot\.angle\.back/)
  assert.equal(find(engine, ctx, { emotion: 'celebrating', stage: '1' }).items.length, 0)

  // Guests never see unpublished art, and their explanation names no catalog rows.
  const guest = find(engine, guestContext(SLUG), STAGE_THREE_CELEBRATING)
  assert.deepEqual(guest.items, [])
  assert.deepEqual(guest.explanation, ['No published mascot artwork matches these filters.'])
})

test('published art reaches guests only when the asset is public and on the allowlist', () => {
  const { root, engine } = brand()
  approvedFixture(root, 'published')
  editAsset(root, (assets) => {
    const asset = assets.find((item) => item.id === ASSET_ID) as Row
    asset.visibility = 'public'
  })
  assert.equal(find(engine, guestContext(SLUG), STAGE_THREE_CELEBRATING).items.length, 0, 'not on the allowlist yet')
  const policy = readYaml<Row>(root, 'brand/publication-policy.yaml')
  policy.approved_asset_ids = [ASSET_ID]
  writeYamlFile(root, 'brand/publication-policy.yaml', policy)
  const guest = find(engine, guestContext(SLUG), STAGE_THREE_CELEBRATING)
  assert.equal(guest.items.length, 1)
  assert.equal(guest.items[0]?.classification, 'public')
  assert.equal(guest.items[0]?.publication, 'published')
  assert.deepEqual(validateRepo(root).errors.filter((error) => /mascot/i.test(error)), [])
})

test('draft art is never returned', () => {
  for (const status of ['pending', 'created', 'reviewed']) {
    const { root, engine } = brand()
    approvedFixture(root, status, 'draft')
    const found = find(engine, design(root), STAGE_THREE_CELEBRATING)
    assert.equal(found.result.status, 'missing', status)
    assert.deepEqual(found.items, [])
    assert.ok(found.explanation.some((line) => line.includes(`is ${status}, not approved`)), found.explanation.join('\n'))
    assert.equal(JSON.stringify(found.result).includes(ASSET_PATH), false)
  }
  // Approved in the catalog but the manifest asset is still a draft: refused by retrieval and by validation.
  const { root, engine } = brand()
  approvedFixture(root, 'approved', 'draft')
  const found = find(engine, design(root), STAGE_THREE_CELEBRATING)
  assert.deepEqual(found.items, [])
  assert.match(found.explanation.join('\n'), /is not readable here/)
  assert.ok(validateRepo(root).errors.some((error) => error.includes(`${ART_ID} is approved but asset ${ASSET_ID} is not approved`)))
  // A changed file no longer matches its checksum and is not returned.
  const { root: changedRoot, engine: changedEngine } = brand()
  approvedFixture(changedRoot)
  fs.writeFileSync(path.join(changedRoot, ASSET_PATH), SVG.replace('#123A73', '#000000'))
  assert.deepEqual(find(changedEngine, design(changedRoot), STAGE_THREE_CELEBRATING).items, [])
})

test('a disabled mascot module is not applicable and returns nothing', () => {
  const { root, engine } = brand(false)
  approvedFixture(root)
  const result = brandRetrieve(engine, design(root), { kind: 'mascot', filters: STAGE_THREE_CELEBRATING })
  assert.equal(result.status, 'not_applicable')
  assert.deepEqual((result.data as { items: unknown[] }).items, [])
  assert.equal(JSON.stringify(result).includes(ASSET_PATH), false)
})

test('the lifecycle validator enforces artwork, assets, stages and licenses', () => {
  const { root } = brand()
  editState(root, CELEBRATING, (state) => {
    state.status = 'approved'
  })
  editState(root, 'mascot.emotion.joyful', (state) => {
    state.status = 'created'
    state.artwork = [{ id: 'art.joyful', stage: 'example.stage.nowhere', asset_id: 'asset.absent', status: 'created', version: '1' }]
  })
  editState(root, 'mascot.emotion.proud', (state) => {
    state.status = 'draft'
  })
  const errors = validateRepo(root).errors
  assert.ok(errors.includes(`Mascot state ${CELEBRATING} is approved but has no artwork entries`), errors.join('\n'))
  assert.ok(errors.includes('Mascot artwork art.joyful names unknown stage example.stage.nowhere'))
  assert.ok(errors.includes('Mascot artwork art.joyful references asset asset.absent, which is not in the asset manifest'))
  assert.ok(errors.includes('Mascot state mascot.emotion.proud uses legacy status draft. Run npm run brand:migrate.'))

  const { root: published } = brand()
  approvedFixture(published, 'published')
  editState(published, CELEBRATING, (state) => {
    delete (state.artwork as Row[])[0]?.license
  })
  assert.ok(validateRepo(published).errors.includes(`Mascot artwork ${ART_ID} is published without license metadata`))
})

test('migration moves legacy statuses to the lifecycle, keeps comments, and is idempotent', () => {
  const { root } = brand()
  const file = path.join(root, 'brand/mascot/catalog.yaml')
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('status: defined', 'status: draft'))
  editState(root, 'mascot.emotion.sad', (state) => {
    state.status = 'approved'
  })
  editState(root, 'mascot.emotion.curious', (state) => {
    state.status = 'in_review'
    state.source_assets = ['brand/assets/mascot/placeholder-frame.svg']
  })
  fs.writeFileSync(file, `# owner comment that must survive\n${fs.readFileSync(file, 'utf8')}`)
  const result = migrateBrand(root)
  assert.equal(result.content_rewritten, false)
  assert.equal(result.mascot.changed.length, 90)
  assert.deepEqual(result.mascot.downgraded, ['mascot.emotion.sad'])
  const states = readYaml<{ states: Row[] }>(root, 'brand/mascot/catalog.yaml').states
  assert.equal(states.find((state) => state.id === 'mascot.emotion.curious')?.status, 'reviewed')
  assert.equal(states.find((state) => state.id === 'mascot.emotion.sad')?.status, 'defined')
  assert.equal(states.filter((state) => state.status === 'defined').length, 89)
  assert.match(fs.readFileSync(file, 'utf8'), /# owner comment that must survive/)
  assert.match(fs.readFileSync(path.join(root, 'brand/migrations.yaml'), 'utf8'), /mascot-lifecycle@/)
  const before = fs.readFileSync(file)
  assert.deepEqual(migrateMascotCatalog(root), { files: [], changed: [], downgraded: [] })
  assert.deepEqual(fs.readFileSync(file), before)
})

test('brand:query finds mascot artwork with filter flags for an agent token', () => {
  const { root } = brand()
  approvedFixture(root)
  const issued = issueAgentToken(root, { brandId: SLUG, profile: 'design', label: 'cli mascot agent' })
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && key !== 'BRAND_OS_AGENT_TOKEN' && key !== 'BRAND_OS_APPROVAL_PROOF') env[key] = value
  }
  env.BRAND_OS_AGENT_TOKEN = issued.token
  const run = spawnSync(
    path.join(repo, 'node_modules/.bin/tsx'),
    [path.join(repo, 'scripts/brand.ts'), 'query', '--tool', 'brand_retrieve', '--kind', 'mascot', '--emotion', 'celebrating', '--stage', '3', '--use-case', 'correct-answer'],
    { cwd: root, env, encoding: 'utf8', timeout: 60_000 },
  )
  assert.equal(run.status, 0, run.stderr)
  const result = JSON.parse(run.stdout) as { status: string; data: { items: RetrievedItem[] } }
  assert.equal(result.status, 'approved')
  assert.deepEqual(result.data.items.map((item) => item.id), [ART_ID])
})
