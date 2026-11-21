import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { assertNoSecrets, buildProjection } from '../apps/studio/src/projection.js'
import { addApprovedAsset, approve, editOutsideStudio, PNG } from './helpers/edits.js'
import { harness, OWNER, provisioned } from './helpers/studio.js'

test('refresh reads the merged default branch, records its SHA, and builds a safe projection', async () => {
  const h = harness()
  const req = await provisioned(h)
  const cached = h.sync.get(req.slug)
  assert.equal(cached.status.state, 'ok')
  assert.equal(cached.status.sha, h.github.repo(OWNER, req.repo)!.head)
  assert.equal(cached.status.repo_private, true)
  assert.ok(cached.status.synced_at)
  const projection = cached.projection!
  assert.equal(projection.brand.slug, 'acme-learning')
  assert.equal(projection.brand.kind, 'business')
  assert.equal(projection.brand.modules.mascot, false)
  assert.equal(projection.mascot, null, 'a disabled mascot module has no projection at all')
  assert.equal(projection.overview.approved_facts, 0)
  assert.ok(projection.overview.required > 0)
  assert.ok(projection.documents['brand-book'])
  assert.equal(projection.personal, null)
  assert.ok(projection.tokens.items.length > 0)
  assert.ok(projection.tokens.items.every((token) => token.state === 'draft'), 'template tokens are drafts until hash-approved')
  assert.ok(cached.history!.commits.length >= 2)
  const text = JSON.stringify(cached)
  for (const decoy of ['DECOY-APPROVAL-SECRET', 'DECOY-RESTRICTED', 'DECOY-ENV']) assert.equal(text.includes(decoy), false, decoy)
})

test('an edit merged outside Studio appears after refresh with its new SHA, sources and approved assets', async () => {
  const h = harness()
  const req = await provisioned(h)
  const before = h.sync.get(req.slug).status.sha
  const sha = editOutsideStudio(h, req.repo, (engine, root) => {
    approve(engine, root, { 'brand.strategy.purpose': 'Make learning feel possible every day.' })
    engine.answerQuestion('brand.strategy.vision', 'A DRAFT VISION NOT YET APPROVED')
    engine.answerQuestion('business.finance.costs', 'RESTRICTED-CANARY-COSTS-42')
    addApprovedAsset(root, { id: 'asset.logo.primary', name: 'Primary logo', file: 'brand/assets/logo/primary.png', data: PNG })
    addApprovedAsset(root, { id: 'asset.logo.draft', name: 'Draft logo', file: 'brand/assets/logo/draft.png', data: PNG, status: 'draft' })
  })
  // Before refresh Studio still shows the old commit: the cache is canonical until a successful fetch.
  assert.equal(h.sync.get(req.slug).status.sha, before)
  const after = await h.sync.refresh(req.slug)
  assert.equal(after.status.sha, sha)
  assert.notEqual(sha, before)
  const projection = after.projection!
  assert.equal(projection.overview.approved_facts, 1)
  const book = projection.documents['brand-book']!
  const items = book.sections.flatMap((section) => section.items)
  const purpose = items.find((item) => item.id === 'brand.strategy.purpose')
  assert.equal(purpose?.tag, 'approved')
  assert.equal(purpose?.value, 'Make learning feel possible every day.')
  assert.ok(purpose?.source_ids.length)
  const vision = items.find((item) => item.id === 'brand.strategy.vision')
  assert.notEqual(vision?.tag, 'approved', 'a draft is never shown as an approved fact')
  const review = projection.review.find((item) => item.question_id === 'brand.strategy.vision')
  assert.equal(review?.state, 'draft')
  const restricted = projection.review.find((item) => item.question_id === 'business.finance.costs')
  assert.equal(restricted?.withheld ?? true, true)
  assert.equal(JSON.stringify(after).includes('RESTRICTED-CANARY-COSTS-42'), false, 'restricted values never reach Studio')
  const primary = projection.assets.find((asset) => asset.id === 'asset.logo.primary')!
  assert.equal(primary.approved, true)
  assert.match(primary.preview_key ?? '', /^[0-9a-f]{64}$/)
  assert.ok(h.sync.previewFile(req.slug, primary.preview_key!))
  const draft = projection.assets.find((asset) => asset.id === 'asset.logo.draft')!
  assert.equal(draft.preview_key, null)
  assert.equal(draft.unavailable_reason, 'not_approved')
  assert.equal(h.sync.previewFile(req.slug, 'f'.repeat(64)), null)
  assert.equal(h.sync.previewFile(req.slug, '../state.json'), null)
  assert.equal(after.history!.commits[0]?.sha, sha)
})

test('stale cache: a failed refresh keeps the last good projection and reports the error and staleness', async () => {
  let clock = Date.parse('2026-11-21T10:00:00Z')
  const h = harness({ ttlMs: 60_000, now: () => new Date(clock) })
  const req = await provisioned(h)
  const good = h.sync.get(req.slug)
  assert.equal(h.sync.isStale(req.slug, good.status), false)
  clock += 120_000
  assert.equal(h.sync.isStale(req.slug, h.sync.get(req.slug).status), true, 'older than the TTL is stale')
  editOutsideStudio(h, req.repo, (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Newer purpose' }))
  h.github.fail('GET', /\/tarball\//, 502, 10)
  const failed = await h.sync.refresh(req.slug)
  assert.equal(failed.status.sha, good.status.sha, 'the last good commit is still shown')
  assert.equal(failed.status.last_error?.code, 'github_transient')
  assert.equal(failed.projection?.overview.approved_facts, 0)
  assert.equal(h.sync.isStale(req.slug, failed.status), true)
  h.github.faults.length = 0
  const recovered = await h.sync.refresh(req.slug)
  assert.equal(recovered.status.last_error, null)
  assert.equal(recovered.projection?.overview.approved_facts, 1)
})

test('cross-brand: a repository whose config claims another slug is refused, and its old projection is dropped', async () => {
  const h = harness()
  const a = await provisioned(h, { slug: 'brand-a', repo: 'brand-a', name: 'Brand A' })
  await provisioned(h, { slug: 'brand-b', repo: 'brand-b', name: 'Brand B' })
  assert.equal(h.sync.get('brand-a').projection?.brand.name, 'Brand A')
  // Someone points brand-a's repository at brand-b's content.
  h.github.pushEdit(OWNER, a.repo, (tree) => {
    const b = h.github.headTree(OWNER, 'brand-b')
    tree.clear()
    for (const [file, data] of b) tree.set(file, data)
  })
  const result = await h.sync.refresh('brand-a')
  assert.equal(result.status.state, 'error')
  assert.equal(result.status.last_error?.code, 'slug_mismatch')
  assert.equal(result.projection, null)
  assert.equal(JSON.stringify(h.sync.get('brand-a')).includes('Brand B'), false)
})

test('a deleted and recreated repository with the same name is not trusted', async () => {
  const h = harness()
  const req = await provisioned(h)
  const tree = h.github.headTree(OWNER, req.repo)
  h.github.repos.delete(`${OWNER}/${req.repo}`.toLowerCase())
  h.github.addRepo(OWNER, req.repo, tree)
  const result = await h.sync.refresh(req.slug)
  assert.equal(result.status.last_error?.code, 'slug_mismatch')
  assert.equal(result.projection, null)
})

test('concurrent refreshes share one fetch', async () => {
  const h = harness()
  const req = await provisioned(h)
  editOutsideStudio(h, req.repo, (engine, root) => approve(engine, root, { 'brand.strategy.purpose': 'Shared' }))
  const tarballsBefore = h.github.callsTo('GET', /\/tarball\//).length
  const [one, two] = await Promise.all([h.sync.refresh(req.slug), h.sync.refresh(req.slug)])
  assert.equal(one.status.sha, two.status.sha)
  assert.equal(h.github.callsTo('GET', /\/tarball\//).length - tarballsBefore, 1)
})

test('projection guard refuses content that looks like a credential', () => {
  assert.throws(() => assertNoSecrets({ note: `token bos_at_${'a'.repeat(43)}` }), /credential/)
  assert.throws(() => assertNoSecrets({ note: `ghp_${'a'.repeat(36)}` }), /credential/)
  assert.doesNotThrow(() => assertNoSecrets({ note: 'Agent tokens start with bos_at_ and are never shown.' }))
})

test('a projection of a non Brand OS checkout is refused', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-empty-'))
  assert.throws(() => buildProjection(root, 'x'), /brand\.config\.yaml/)
})
