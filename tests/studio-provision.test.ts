import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse } from 'yaml'
import { ProvisioningService, validateRequest } from '../apps/studio/src/provision.js'
import { harness, OWNER, provisioned, PROVISION_TOKEN, READ_TOKEN, request, TEMPLATE } from './helpers/studio.js'

function config(tree: Map<string, Buffer>): { brand: Record<string, unknown>; modules: Record<string, Record<string, unknown>> } {
  return parse(tree.get('brand/brand.config.yaml')!.toString('utf8'))
}

test('provisioning creates one private repository from the template and commits the core brand:init result', async () => {
  const h = harness()
  const req = await provisioned(h)
  const repo = h.github.repo(OWNER, req.repo)!
  assert.equal(repo.private, true)
  const generate = h.github.callsTo('POST', /\/generate$/)
  assert.equal(generate.length, 1)
  const tree = h.github.headTree(OWNER, req.repo)
  const cfg = config(tree)
  assert.equal(cfg.brand.slug, 'acme-learning')
  assert.equal(cfg.brand.name, 'Acme Learning')
  assert.equal(cfg.brand.initialized, true)
  assert.equal(cfg.brand.publish_docs, 'private', 'a new brand is private by default, as brand:init does')
  assert.equal(cfg.brand.profile, 'universal')
  assert.equal(cfg.modules.mascot!.enabled, false)
  assert.equal(JSON.parse(tree.get('brand/brand-manifest.json')!.toString()).slug, 'acme-learning')
  assert.deepEqual(parse(tree.get('brand/instance/approved-facts.yaml')!.toString()).facts, {}, 'no brand facts are invented')
  // Exactly one commit on top of the template commit, touching brand/ only.
  const record = h.registry.get(req.slug)!
  assert.equal(record.provisioning?.state, 'ready')
  assert.equal(record.repo.id, repo.id)
  assert.match(record.repo.html_url, /^https:\/\/github\.com\/brand-owner\/acme-learning-brand$/)
  const template = h.github.headTree(TEMPLATE.owner, TEMPLATE.repo)
  for (const [file, data] of tree) {
    if (!file.startsWith('brand/')) assert.deepEqual(data, template.get(file), `${file} outside brand/ is untouched`)
  }
  // The decoys that GitHub copied from the template were never read, rewritten or re-committed.
  assert.deepEqual(tree.get('brand/.private/approval-secret'), template.get('brand/.private/approval-secret'))
  const blobs = [...h.github.blobs.values()].map((blob) => blob.toString('utf8')).join('\n')
  assert.equal(blobs.includes('DECOY'), false)
  for (const file of new Set([...tree.keys(), ...template.keys()])) {
    if (file.startsWith('brand/restricted/') || file.startsWith('brand/.private/')) assert.deepEqual(tree.get(file), template.get(file), `${file} is never written by Studio`)
  }
  // Capabilities stay separate: provisioning used only the provisioning token, and never the read token.
  const provisionCalls = h.github.calls.filter((call) => call.method !== 'GET' || /generate|git\//.test(call.path))
  assert.ok(provisionCalls.every((call) => call.token === PROVISION_TOKEN || call.token === null))
  assert.ok(h.github.calls.some((call) => call.token === READ_TOKEN), 'the initial sync used the read token')
})

test('a personal brand gets the personal-brand profile and facets through the same core initializer', async () => {
  const h = harness()
  const req = await provisioned(h, { slug: 'jane-doe', name: 'Jane Doe', repo: 'jane-doe', profile: 'personal-brand', facets: ['founder-executive', 'consultant-expert'], locales: ['en', 'fa', 'tr'], default_locale: 'en' })
  const cfg = config(h.github.headTree(OWNER, req.repo))
  assert.equal(cfg.brand.profile, 'personal-brand')
  assert.equal(cfg.modules.personal!.enabled, true)
  assert.deepEqual(cfg.modules.personal!.facets, ['founder-executive', 'consultant-expert'])
  assert.deepEqual(cfg.brand.supported_locales, ['en', 'fa', 'tr'])
})

test('request validation refuses bad slugs, unknown facets, locales and destinations outside the allowlist', () => {
  const ok = validateRequest({ name: 'Acme', slug: 'acme', profile: 'business', owner: OWNER, default_locale: 'en', locales: ['en', 'fa'] }, [OWNER])
  assert.ok(ok.request)
  assert.equal(ok.request?.repo, 'acme')
  const bad = validateRequest(
    { name: '', slug: '../etc', profile: 'company', owner: 'someone-else', default_locale: 'de', locales: ['de'], facets: ['astronaut'], repo: '../x' },
    [OWNER],
  )
  assert.equal(bad.request, null)
  assert.deepEqual(Object.keys(bad.errors).sort(), ['facets', 'locales', 'name', 'owner', 'profile', 'repo', 'slug'])
  assert.equal(validateRequest({ name: 'A', slug: 'a-b', profile: 'business', owner: OWNER, facets: ['founder-executive'] }, [OWNER]).errors.facets, 'facet_invalid')
  assert.equal(validateRequest({ name: 'x'.repeat(81), slug: 'ab', profile: 'business', owner: OWNER }, [OWNER]).errors.name, 'name_too_long')
})

test('duplicate names: an existing GitHub repository or registered slug is refused without touching it', async () => {
  const h = harness()
  h.github.addRepo(OWNER, 'taken', new Map([['README.md', Buffer.from('someone else')]]))
  assert.ok(h.provisioning.start(request({ slug: 'taken-brand', repo: 'taken' }), 'owner').ok)
  await h.provisioning.settled()
  const record = h.registry.get('taken-brand')!
  assert.equal(record.provisioning?.state, 'failed')
  assert.equal(record.provisioning?.error?.code, 'destination_exists')
  assert.equal(record.provisioning?.cleanup, 'not_needed')
  assert.ok(h.github.repo(OWNER, 'taken'), 'the existing repository is never deleted')
  assert.equal(h.github.callsTo('POST', /\/generate$/).length, 0)
  assert.equal(h.github.callsTo('DELETE', /./).length, 0)

  await provisioned(h, { slug: 'unique-brand', repo: 'unique-brand' })
  assert.deepEqual(h.provisioning.start(request({ slug: 'unique-brand', repo: 'other-name' }), 'owner'), { ok: false, code: 'duplicate' })
  assert.deepEqual(h.provisioning.start(request({ slug: 'other-slug', repo: 'unique-brand' }), 'owner'), { ok: false, code: 'duplicate' })
})

test('concurrent create: a second request for the same slug or repository is refused while the first runs', async () => {
  const h = harness()
  const first = h.provisioning.start(request(), 'owner')
  const sameSlug = h.provisioning.start(request({ repo: 'another-repo' }), 'owner')
  const sameRepo = h.provisioning.start(request({ slug: 'another-slug' }), 'owner')
  assert.deepEqual(first, { ok: true })
  assert.equal(sameSlug.ok, false)
  assert.equal(sameRepo.ok, false)
  await h.provisioning.settled()
  assert.equal(h.github.callsTo('POST', /\/generate$/).length, 1)
  assert.equal(h.registry.list().length, 1)
})

test('transient GitHub failures are retried with backoff; GitHub copying the template asynchronously is awaited', async () => {
  const h = harness()
  h.github.fail('GET', /\/repos\/omidlog\/brand-os-template$/, 502, 2)
  h.github.fail('POST', /\/git\/blobs$/, 503, 1, { network: true })
  h.github.fail('POST', /\/git\/trees$/, 429, 1, { headers: { 'retry-after': '1' } })
  h.github.generationDelay = 3
  await provisioned(h)
  assert.equal(h.github.repo(OWNER, 'acme-learning-brand')?.private, true)
})

test('partial-create cleanup: a failure after the repository exists deletes it, and a retry then succeeds', async () => {
  const h = harness()
  h.github.fail('PATCH', /\/git\/refs\/heads\/main$/, 500, 10)
  assert.ok(h.provisioning.start(request(), 'owner').ok)
  await h.provisioning.settled()
  let record = h.registry.get('acme-learning')!
  assert.equal(record.provisioning?.state, 'failed')
  assert.equal(record.provisioning?.error?.code, 'github_transient')
  assert.equal(record.provisioning?.cleanup, 'done')
  assert.equal(h.github.repo(OWNER, 'acme-learning-brand'), undefined, 'the half-created repository was deleted')
  assert.equal(record.provisioning?.steps.find((step) => step.id === 'commit')?.status, 'failed')

  h.github.faults.length = 0
  assert.deepEqual(h.provisioning.retry('acme-learning'), { ok: true })
  await h.provisioning.settled()
  record = h.registry.get('acme-learning')!
  assert.equal(record.provisioning?.state, 'ready')
  assert.equal(record.provisioning?.attempts, 2)
  assert.deepEqual(h.provisioning.retry('acme-learning'), { ok: false, code: 'not_failed' })
})

test('when cleanup is not permitted the record says so, and a retry resumes the repository Studio created', async () => {
  const h = harness()
  h.github.deleteForbidden = true
  h.github.fail('POST', /\/git\/commits$/, 500, 10)
  h.provisioning.start(request(), 'owner')
  await h.provisioning.settled()
  const failed = h.registry.get('acme-learning')!
  assert.equal(failed.provisioning?.cleanup, 'required')
  assert.ok(h.github.repo(OWNER, 'acme-learning-brand'))
  h.github.faults.length = 0
  h.provisioning.retry('acme-learning')
  await h.provisioning.settled()
  const done = h.registry.get('acme-learning')!
  assert.equal(done.provisioning?.state, 'ready')
  assert.equal(done.provisioning?.steps.find((step) => step.id === 'create_repository')?.status, 'skipped')
  assert.equal(h.github.callsTo('POST', /\/generate$/).length, 1, 'the repository was generated once')
})

test('a repository that GitHub reports as public is deleted at once and never registered as ready', async () => {
  const h = harness()
  h.github.forcePublic = true
  h.provisioning.start(request(), 'owner')
  await h.provisioning.settled()
  const record = h.registry.get('acme-learning')!
  assert.equal(record.provisioning?.state, 'failed')
  assert.equal(record.provisioning?.error?.code, 'not_private')
  assert.equal(h.github.repo(OWNER, 'acme-learning-brand'), undefined)
  assert.equal(h.github.callsTo('POST', /\/git\//).length, 0, 'nothing was committed to a public repository')
})

test('a missing or non-template template fails before anything is created', async () => {
  const h = harness()
  h.github.repo(TEMPLATE.owner, TEMPLATE.repo)!.is_template = false
  h.provisioning.start(request(), 'owner')
  await h.provisioning.settled()
  assert.equal(h.registry.get('acme-learning')?.provisioning?.error?.code, 'template_unavailable')
  assert.equal(h.github.callsTo('POST', /\/generate$/).length, 0)
})

test('without a provisioning token or allowlist, provisioning is not configured', () => {
  const h = harness()
  const service = new ProvisioningService({ registry: h.registry, github: h.readClient, templateOwner: 'a', templateRepo: 'b', allowedOwners: [], workDir: h.dataDir })
  assert.equal(service.configured, false)
  assert.deepEqual(service.start(request(), 'owner'), { ok: false, code: 'not_configured' })
})

test('a job interrupted by a restart is marked failed with cleanup required when the repository was created', () => {
  const h = harness()
  const req = request()
  h.registry.upsert({
    slug: req.slug,
    display_name: req.name,
    profile: 'business',
    repo: { owner: OWNER, name: req.repo, id: 5, html_url: '', default_branch: 'main' },
    source: 'provisioned',
    created_at: new Date().toISOString(),
    created_by: 'owner',
    provisioning: {
      state: 'running',
      attempts: 1,
      started_at: new Date().toISOString(),
      finished_at: null,
      steps: [
        { id: 'create_repository', status: 'done' },
        { id: 'initialize', status: 'running' },
      ],
      error: null,
      cleanup: 'not_needed',
      request: req,
      initial_commit: null,
    },
  })
  new ProvisioningService({ registry: h.registry, github: h.provisionClient, templateOwner: 'a', templateRepo: 'b', allowedOwners: [OWNER], workDir: h.dataDir })
  const record = h.registry.get(req.slug)!
  assert.equal(record.provisioning?.state, 'failed')
  assert.equal(record.provisioning?.error?.code, 'interrupted')
  assert.equal(record.provisioning?.cleanup, 'required')
})
