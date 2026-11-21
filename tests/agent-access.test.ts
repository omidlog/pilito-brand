import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
  accessLogPath,
  AgentTokenError,
  agentTokenContext,
  agentTokenPath,
  applyInit,
  authorize,
  brandRetrieve,
  ensureApprovalSecret,
  getBrandStatus,
  getBusinessPlan,
  guestContext,
  InterviewEngine,
  issueAgentToken,
  listAgentTokens,
  readAccessLog,
  resolveAgentContext,
  revokeAgentToken,
  searchBrandDocs,
  writeFacts,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { AuthContext, RetrievedItem, RetrieveRequest } from '@brand-os/brand-core'
import { scanPublicTree } from '../scripts/scan-public.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const repo = path.resolve(import.meta.dirname, '..')
const tsx = path.join(repo, 'node_modules/.bin/tsx')

type Classification = 'public' | 'internal' | 'restricted'

function fact(brandId: string, id: string, module: string, value: unknown, classification: Classification, status = 'approved', version = 1) {
  return {
    id,
    brand_id: brandId,
    module,
    value,
    value_type: 'text',
    status,
    classification,
    publication: 'unpublished' as const,
    source: { kind: 'interview', answer_ids: [], reference_ids: [], citation_paths: ['brand/instance/approved-facts.yaml'], observed_at: null },
    confidence: null,
    assumptions: [],
    owner: null,
    reviewer_id: 'owner',
    approved_at: '2026-11-20T00:00:00.000Z',
    version,
    revision_hash: `${id}:${version}`,
    review_due: null,
    related_ids: [],
    private_ref: null,
  }
}

/** A private brand with one approved internal fact per area, a draft canary, and restricted rows. */
function privateBrand(slug = 'private-brand'): { root: string; engine: InterviewEngine } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-agent-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Private Brand', slug, industry: 'education', language: 'en', languages: ['en'], mascot: false, gamification: false, publish: 'private' })
  writeFacts(root, 'approved', {
    'brand.strategy.purpose': fact(slug, 'brand.strategy.purpose', 'brand-strategy', 'INTERNAL-PURPOSE-VALUE', 'internal'),
    'business.offer.summary': fact(slug, 'business.offer.summary', 'business-company', 'INTERNAL-OFFER-VALUE', 'internal'),
    'business.customer.primary_segment': fact(slug, 'business.customer.primary_segment', 'business-customer', 'DRAFT-SEGMENT-CANARY', 'internal', 'draft'),
    'business.finance.runway': fact(slug, 'business.finance.runway', 'business-finance', null, 'restricted'),
    // A hand-edited file that leaks a value and downgrades a restricted question to internal.
    'business.finance.costs': fact(slug, 'business.finance.costs', 'business-finance', 'CANARY-B-RESTRICTED', 'internal'),
  })
  fs.writeFileSync(
    path.join(root, 'brand/instance/draft-facts.yaml'),
    'schema_version: 1\nfacts:\n  brand.strategy.vision:\n    value: DRAFT-VISION-CANARY\n    status: draft\n    visibility: internal\n',
  )
  return { root, engine: new InterviewEngine(root) }
}

function items(result: { data: unknown }): RetrievedItem[] {
  return (result.data as { items: RetrievedItem[] }).items
}

function byId(list: RetrievedItem[], id: string): RetrievedItem | undefined {
  return list.find((item) => item.id === id)
}

function token(root: string, profile: 'internal-read' | 'design' | 'marketing' | 'finance', slug = 'private-brand'): { token: string; id: string; ctx: AuthContext } {
  const issued = issueAgentToken(root, { brandId: slug, profile, label: `${profile} test agent` })
  return { token: issued.token, id: issued.record.id, ctx: resolveAgentContext(root, slug, issued.token) }
}

test('a guest on a private brand is denied by every retrieval path', () => {
  const { root, engine } = privateBrand()
  const guest = guestContext('private-brand')
  for (const kind of ['facts', 'tokens', 'status', 'component', 'asset'] as const) {
    const result = brandRetrieve(engine, guest, { kind, ids: ['brand.strategy.purpose'] })
    assert.equal(result.status, 'denied', kind)
    assert.deepEqual(items(result), [])
  }
  assert.equal(searchBrandDocs(engine, 'INTERNAL').status, 'denied')
  assert.equal(JSON.stringify(getBusinessPlan(engine)).includes('INTERNAL-OFFER-VALUE'), false)
  // Denials are logged, without values.
  const log = readAccessLog(root)
  assert.ok(log.some((entry) => entry.principal === 'anonymous' && entry.decision === 'deny'))
})

test('an internal token reads approved internal facts, never drafts, never restricted values', () => {
  const { root, engine } = privateBrand()
  const { ctx } = token(root, 'internal-read')
  assert.equal(ctx.role, 'agent')
  assert.equal(ctx.audience, 'internal')
  assert.deepEqual(ctx.scopes, ['read'])

  const result = brandRetrieve(engine, ctx, { kind: 'facts' })
  assert.equal(result.status, 'approved')
  assert.equal(result.brand_id, 'private-brand')
  assert.equal(result.classification, 'internal')
  assert.deepEqual(result.principal, { role: 'agent', profile: 'internal-read' })
  const list = items(result)
  const purpose = byId(list, 'brand.strategy.purpose')
  assert.equal(purpose?.value, 'INTERNAL-PURPOSE-VALUE')
  assert.equal(purpose?.classification, 'internal')
  assert.equal(purpose?.approval_state, 'approved')
  assert.equal(purpose?.source_path, 'brand/instance/approved-facts.yaml')
  assert.equal(purpose?.revision, 'brand.strategy.purpose:1')
  assert.equal(purpose?.brand_id, 'private-brand')
  assert.equal(byId(list, 'business.offer.summary')?.value, 'INTERNAL-OFFER-VALUE')

  const text = JSON.stringify(result)
  assert.equal(text.includes('DRAFT-SEGMENT-CANARY'), false, 'draft rows in the approved file are never returned')
  assert.equal(text.includes('DRAFT-VISION-CANARY'), false, 'draft facts are never returned')
  assert.equal(text.includes('CANARY-B-RESTRICTED'), false, 'the registry keeps a downgraded restricted fact restricted')

  for (const id of ['business.finance.runway', 'business.finance.costs']) {
    const row = byId(list, id)
    assert.equal(row?.value, null, id)
    assert.equal(row?.withheld, true, id)
    assert.equal(row?.classification, 'restricted', id)
  }

  const asked = brandRetrieve(engine, ctx, { kind: 'facts', ids: ['brand.strategy.purpose', 'business.customer.primary_segment', 'brand.verbal.tagline'] })
  assert.deepEqual(asked.missing.sort(), ['brand.verbal.tagline', 'business.customer.primary_segment'])
  assert.equal(byId(items(asked), 'brand.strategy.purpose')?.value, 'INTERNAL-PURPOSE-VALUE')

  const legacy = getBusinessPlan(engine, ctx)
  const facts = (legacy.data as { facts: Array<{ id: string; value: unknown; missing?: boolean }> }).facts
  assert.equal(facts.find((row) => row.id === 'business.offer.summary')?.value, 'INTERNAL-OFFER-VALUE')
  assert.equal(facts.find((row) => row.id === 'business.customer.primary_segment')?.missing, true)

  const status = getBrandStatus(engine, ctx)
  assert.equal(status.status, 'approved')
  assert.equal(JSON.stringify(status).includes('INTERNAL-PURPOSE-VALUE'), false, 'status returns counts, not values')
})

test('an owner-approved fact on a private brand reaches an internal agent but not a guest of a public brand', () => {
  for (const publish of ['private', 'public'] as const) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-agent-flow-'))
    writeStarterWorkspace(root)
    applyInit(root, { name: 'Flow Brand', slug: 'flow-brand', industry: 'education', language: 'en', languages: ['en'], mascot: false, gamification: false, publish })
    const engine = new InterviewEngine(root)
    engine.submit('new')
    engine.submit('Flow Brand Internal Name')
    assert.equal(engine.approve('business.identity.trade_name', 'owner', ensureApprovalSecret(root)).kind, 'recorded')
    const { ctx } = token(root, 'internal-read', 'flow-brand')
    const agentView = brandRetrieve(engine, ctx, { kind: 'facts', ids: ['business.identity.trade_name'] })
    assert.equal(byId(items(agentView), 'business.identity.trade_name')?.value, 'Flow Brand Internal Name')
    const guestView = brandRetrieve(engine, guestContext('flow-brand'), { kind: 'facts', ids: ['business.identity.trade_name'] })
    assert.equal(JSON.stringify(guestView).includes('Flow Brand Internal Name'), false, publish)
    assert.equal(guestView.status, publish === 'private' ? 'denied' : 'missing')
    assert.equal(JSON.stringify(searchBrandDocs(engine, 'Flow')).includes('Internal Name'), false)
  }
})

test('profiles are least privilege: design cannot read business modules, finance cannot read brand strategy', () => {
  const { root, engine } = privateBrand()
  const design = token(root, 'design').ctx
  const designView = items(brandRetrieve(engine, design, { kind: 'facts' }))
  assert.equal(byId(designView, 'brand.strategy.purpose')?.value, 'INTERNAL-PURPOSE-VALUE')
  const offer = byId(designView, 'business.offer.summary')
  assert.equal(offer?.value, null)
  assert.equal(offer?.withheld, true)
  assert.match(String(offer?.reason), /profile design does not cover module business-company/)
  assert.equal(JSON.stringify(designView).includes('INTERNAL-OFFER-VALUE'), false)
  assert.equal(JSON.stringify(getBusinessPlan(engine, design)).includes('INTERNAL-OFFER-VALUE'), false)
  assert.deepEqual(items(brandRetrieve(engine, design, { kind: 'facts', module: 'business-company' })).filter((item) => !item.withheld), [])

  const finance = token(root, 'finance').ctx
  const financeView = items(brandRetrieve(engine, finance, { kind: 'facts' }))
  assert.equal(byId(financeView, 'business.offer.summary')?.value, 'INTERNAL-OFFER-VALUE')
  assert.equal(byId(financeView, 'brand.strategy.purpose')?.withheld, true)
  assert.equal(byId(financeView, 'business.finance.runway')?.value, null, 'finance tokens never read restricted values')
  assert.equal(JSON.stringify(financeView).includes('CANARY-B-RESTRICTED'), false)

  const marketing = token(root, 'marketing').ctx
  const marketingView = items(brandRetrieve(engine, marketing, { kind: 'facts' }))
  assert.equal(byId(marketingView, 'business.offer.summary')?.value, 'INTERNAL-OFFER-VALUE')
  assert.equal(byId(marketingView, 'brand.strategy.purpose')?.value, 'INTERNAL-PURPOSE-VALUE')
  assert.equal(byId(marketingView, 'business.finance.runway')?.withheld, true)
})

test('agents can never approve, write, export, or read drafts, whatever their profile', () => {
  const ctx = agentTokenContext('alpha', 'agt_test', 'internal-read')
  const approved = { brand_id: 'alpha', classification: 'internal' as const, status: 'approved', publication: 'unpublished' as const, module: 'brand-strategy' }
  assert.equal(authorize(ctx, approved, 'read').allow, true)
  for (const operation of ['approve', 'write', 'export'] as const) assert.equal(authorize(ctx, approved, operation).allow, false, operation)
  assert.equal(authorize(ctx, { ...approved, status: 'draft' }, 'read').allow, false)
  assert.equal(authorize(ctx, { ...approved, classification: 'restricted' }, 'read').allow, false)
  assert.equal(authorize(ctx, { ...approved, module: undefined }, 'read').allow, false, 'profiled agents fail closed without a module')
  assert.equal(authorize(ctx, { ...approved, brand_id: 'beta' }, 'read').allow, false)
  assert.throws(() => agentTokenContext('alpha', 'agt_test', 'owner' as never))
})

test('unknown, malformed, revoked, and cross-brand tokens fail closed', () => {
  const { root } = privateBrand()
  assert.equal(resolveAgentContext(root, 'private-brand', undefined).role, 'guest')
  assert.throws(() => resolveAgentContext(root, 'private-brand', 'not-a-token'), AgentTokenError)
  assert.throws(() => resolveAgentContext(root, 'private-brand', `bos_at_${crypto.randomBytes(32).toString('base64url')}`), AgentTokenError)

  const issued = token(root, 'internal-read')
  assert.ok(revokeAgentToken(root, issued.id)?.revoked)
  assert.throws(() => resolveAgentContext(root, 'private-brand', issued.token), /revoked/)

  // A token copied with brand/.private into a different brand stays bound to its own brand.
  const other = privateBrand('other-brand')
  const live = token(root, 'internal-read')
  fs.mkdirSync(path.dirname(agentTokenPath(other.root)), { recursive: true })
  fs.copyFileSync(agentTokenPath(root), agentTokenPath(other.root))
  assert.throws(() => resolveAgentContext(other.root, 'other-brand', live.token), /another brand/)
  // A context for one brand is denied by another brand's engine.
  const crossed = brandRetrieve(other.engine, live.ctx, { kind: 'facts' })
  assert.equal(crossed.status, 'denied')
  assert.equal(crossed.note, 'cross-brand')

  // A tampered token file is refused rather than partially trusted.
  fs.writeFileSync(agentTokenPath(other.root), JSON.stringify({ format: 'brand-os-agent-tokens/1', tokens: [{ id: 'x', profile: 'owner' }] }))
  assert.throws(() => resolveAgentContext(other.root, 'other-brand', live.token), /invalid record/)
})

test('tokens are stored hashed with mode 0600, shown once, and listed without hashes', () => {
  const { root } = privateBrand()
  const issued = issueAgentToken(root, { brandId: 'private-brand', profile: 'design', label: 'figma helper' })
  assert.match(issued.token, /^bos_at_[A-Za-z0-9_-]{43}$/)
  const file = agentTokenPath(root)
  const stored = fs.readFileSync(file, 'utf8')
  assert.equal(stored.includes(issued.token), false)
  assert.equal(stored.includes(crypto.createHash('sha256').update(issued.token).digest('hex')), true)
  if (process.platform !== 'win32') assert.equal(fs.statSync(file).mode & 0o777, 0o600)
  const listed = listAgentTokens(root)
  assert.equal(listed.length, 1)
  assert.equal('sha256' in (listed[0] as object), false)
  assert.throws(() => issueAgentToken(root, { brandId: 'private-brand', profile: 'owner' as never, label: 'x' }), /Unknown agent profile/)
})

test('request fields cannot raise privilege', () => {
  const { root, engine } = privateBrand()
  const live = token(root, 'internal-read')
  const forged = { kind: 'facts', role: 'owner', audience: 'restricted', scopes: ['restricted'], token: live.token, include_unapproved: true } as unknown as RetrieveRequest
  const asGuest = brandRetrieve(engine, guestContext('private-brand'), forged)
  assert.equal(asGuest.status, 'denied')
  const design = token(root, 'design').ctx
  const asDesign = brandRetrieve(engine, design, { ...forged, module: 'business-company' } as RetrieveRequest)
  assert.equal(JSON.stringify(asDesign).includes('INTERNAL-OFFER-VALUE'), false)
  assert.equal(JSON.stringify(brandRetrieve(engine, live.ctx, forged)).includes('CANARY-B-RESTRICTED'), false)
  assert.equal(brandRetrieve(engine, live.ctx, { kind: 'owner' as never }).status, 'denied')
})

test('the access log records principal, tool, ids, and decision, never values or query text', () => {
  const { root, engine } = privateBrand()
  const live = token(root, 'internal-read')
  brandRetrieve(engine, live.ctx, { kind: 'facts' })
  searchBrandDocs(engine, 'INTERNAL-PURPOSE', live.ctx)
  brandRetrieve(engine, guestContext('private-brand'), { kind: 'facts' })
  const raw = fs.readFileSync(accessLogPath(root), 'utf8')
  for (const value of ['INTERNAL-PURPOSE-VALUE', 'INTERNAL-OFFER-VALUE', 'CANARY-B-RESTRICTED', 'DRAFT-SEGMENT-CANARY', 'INTERNAL-PURPOSE', live.token]) {
    assert.equal(raw.includes(value), false, value)
  }
  if (process.platform !== 'win32') assert.equal(fs.statSync(accessLogPath(root)).mode & 0o777, 0o600)
  const entries = readAccessLog(root)
  const first = entries[0]
  assert.equal(first?.principal, `agent-token:${live.id}`)
  assert.equal(first?.profile, 'internal-read')
  assert.equal(first?.tool, 'brand_retrieve')
  assert.equal(first?.decision, 'allow')
  assert.ok(first?.returned_ids.includes('brand.strategy.purpose'))
  assert.ok(first?.withheld_ids.includes('business.finance.runway'))
  assert.equal(entries[1]?.tool, 'search_brand_docs')
  assert.match(String(entries[1]?.query_sha256), /^[0-9a-f]{16}$/)
  assert.equal(entries[2]?.decision, 'deny')
})

test('a privileged read is refused when the access log cannot be written', () => {
  const { root, engine } = privateBrand()
  const live = token(root, 'internal-read')
  fs.mkdirSync(accessLogPath(root)) // a directory where the log file should be
  const result = brandRetrieve(engine, live.ctx, { kind: 'facts' })
  assert.equal(result.status, 'denied')
  assert.equal(result.note, 'access log unavailable')
  assert.equal(JSON.stringify(result).includes('INTERNAL-PURPOSE-VALUE'), false)
})

test('the public scan flags token files and raw tokens', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-scan-tokens-'))
  fs.writeFileSync(path.join(dir, 'index.html'), '<p>Agent tokens start with bos_at_ and are shown once.</p>')
  assert.deepEqual(scanPublicTree(dir), [])
  const { root } = privateBrand()
  const issued = issueAgentToken(root, { brandId: 'private-brand', profile: 'design', label: 'leak test' })
  fs.copyFileSync(agentTokenPath(root), path.join(dir, 'agent-tokens.json'))
  fs.writeFileSync(path.join(dir, 'leak.js'), `const t = "${issued.token}"`)
  fs.copyFileSync(agentTokenPath(root), path.join(dir, 'renamed.json'))
  const hits = scanPublicTree(dir)
  assert.ok(hits.some((hit) => hit.includes('agent-tokens.json is a private Brand OS file')))
  assert.ok(hits.some((hit) => hit.includes('leak.js contains an agent token')))
  assert.ok(hits.some((hit) => hit.includes('renamed.json contains brand-os-agent-tokens/1')))
})

function childEnv(extra: Record<string, string>): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && key !== 'BRAND_OS_AGENT_TOKEN' && key !== 'BRAND_OS_APPROVAL_PROOF') env[key] = value
  }
  return { ...env, ...extra }
}

test('the MCP server resolves its token once at startup and ignores token arguments', async () => {
  const { root } = privateBrand()
  const live = token(root, 'internal-read')

  const revoked = token(root, 'design')
  revokeAgentToken(root, revoked.id)
  const refused = spawnSync(tsx, [path.join(repo, 'scripts/mcp.ts')], { cwd: root, env: childEnv({ BRAND_OS_AGENT_TOKEN: revoked.token }), input: '', encoding: 'utf8', timeout: 60_000 })
  assert.equal(refused.status, 1)
  assert.match(refused.stderr, /revoked/)
  assert.equal(refused.stderr.includes(revoked.token), false)

  const connect = async (env: Record<string, string>) => {
    const client = new Client({ name: 'brand-os-agent-test', version: '0.0.1' })
    await client.connect(new StdioClientTransport({ command: tsx, args: [path.join(repo, 'scripts/mcp.ts')], cwd: root, env, stderr: 'pipe' }))
    return client
  }
  const read = (result: unknown) => JSON.parse(((result as { content: Array<{ text: string }> }).content[0]?.text) ?? '{}') as { status: string; data: { items: RetrievedItem[] } }

  const guest = await connect(childEnv({}))
  try {
    const attempt = read(await guest.callTool({ name: 'brand_retrieve', arguments: { kind: 'facts', token: live.token, role: 'owner', audience: 'restricted' } }))
    assert.equal(attempt.status, 'denied')
    assert.equal(JSON.stringify(attempt).includes('INTERNAL-PURPOSE-VALUE'), false)
  } finally {
    await guest.close()
  }

  const agent = await connect(childEnv({ BRAND_OS_AGENT_TOKEN: live.token }))
  try {
    const result = read(await agent.callTool({ name: 'brand_retrieve', arguments: { kind: 'facts', module: 'brand-strategy' } }))
    assert.equal(result.status, 'approved')
    assert.equal(byId(result.data.items, 'brand.strategy.purpose')?.value, 'INTERNAL-PURPOSE-VALUE')
    const restricted = read(await agent.callTool({ name: 'brand_retrieve', arguments: { kind: 'facts', ids: ['business.finance.costs'] } }))
    assert.equal(byId(restricted.data.items, 'business.finance.costs')?.withheld, true)
    assert.equal(JSON.stringify(restricted).includes('CANARY-B-RESTRICTED'), false)
    // Revocation is read at startup: an already running server keeps its context until restart.
    revokeAgentToken(root, live.id)
    const stillRunning = read(await agent.callTool({ name: 'get_brand_status', arguments: {} }))
    assert.equal(stillRunning.status, 'approved')
  } finally {
    await agent.close()
  }
})

test('brand:query uses the same token resolution and agent-token management needs the proof', () => {
  const { root } = privateBrand()
  const run = (args: string[], env: Record<string, string> = {}, input = '') =>
    spawnSync(tsx, [path.join(repo, 'scripts/brand.ts'), ...args], { cwd: root, env: childEnv(env), input, encoding: 'utf8', timeout: 60_000 })

  const denied = run(['agent-token', 'issue', '--profile', 'internal-read', '--label', 'cli'], { BRAND_OS_APPROVAL_PROOF: 'wrong-proof' })
  assert.equal(denied.status, 1)
  assert.equal(fs.existsSync(agentTokenPath(root)), false)
  const onArgv = run(['agent-token', 'issue', '--profile', 'internal-read', '--label', 'cli', '--proof', 'x'])
  assert.notEqual(onArgv.status, 0, '--proof on argv is not accepted')

  const proof = ensureApprovalSecret(root)
  const issued = run(['agent-token', 'issue', '--profile', 'internal-read', '--label', 'cli', '--json'], {}, `${proof}\n`)
  assert.equal(issued.status, 0, issued.stderr)
  const record = JSON.parse(issued.stdout) as { id: string; token: string; profile: string }
  assert.equal(record.profile, 'internal-read')

  const asGuest = run(['query', '--tool', 'brand_retrieve', '--kind', 'facts'])
  assert.equal((JSON.parse(asGuest.stdout) as { status: string }).status, 'denied')
  const asAgent = run(['query', '--tool', 'brand_retrieve', '--kind', 'facts', '--ids', 'brand.strategy.purpose'], { BRAND_OS_AGENT_TOKEN: record.token })
  assert.equal(asAgent.status, 0, asAgent.stderr)
  assert.equal(byId((JSON.parse(asAgent.stdout) as { data: { items: RetrievedItem[] } }).data.items, 'brand.strategy.purpose')?.value, 'INTERNAL-PURPOSE-VALUE')

  const listed = run(['agent-token', 'list', '--json'], { BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(listed.stdout.includes(record.token), false)
  assert.equal(run(['agent-token', 'revoke', '--id', record.id], { BRAND_OS_APPROVAL_PROOF: proof }).status, 0)
  const afterRevoke = run(['query', '--tool', 'brand_retrieve'], { BRAND_OS_AGENT_TOKEN: record.token })
  assert.equal(afterRevoke.status, 1)
  assert.equal(afterRevoke.stdout, '')
  assert.equal(afterRevoke.stderr.includes(record.token), false)
})
