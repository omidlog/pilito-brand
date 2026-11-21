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
  brandRetrieve,
  canApprove,
  ensureApprovalSecret,
  InterviewEngine,
  permissionFor,
  readFacts,
  readProposals,
  validateRepo,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import type { FieldQuestion, RetrievedItem } from '@brand-os/brand-core'
import { writeYaml } from '../packages/brand-core/src/fsutil.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')
const repo = path.resolve(import.meta.dirname, '..')
const tsx = path.join(repo, 'node_modules/.bin/tsx')
const SLUG = 'batch-brand'

const PURPOSE = 'brand.strategy.purpose'
const VISION = 'brand.strategy.vision'
const TRADE_NAME = 'business.identity.trade_name'
const LEGAL_NAME = 'business.identity.legal_name'
const COSTS = 'business.finance.costs'

function brand(publish: 'public' | 'private' = 'public'): { root: string; engine: InterviewEngine; proof: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-batch-'))
  writeStarterWorkspace(root)
  applyInit(root, { name: 'Batch Brand', slug: SLUG, industry: 'education', language: 'en', languages: ['en'], mascot: false, gamification: false, publish })
  return { root, engine: new InterviewEngine(root), proof: ensureApprovalSecret(root) }
}

function draft(engine: InterviewEngine, id: string, value: string): void {
  const result = engine.changeAnswer(id, value)
  assert.equal(result.kind, 'recorded', result.message)
}

/** Hash of every file under brand/ so a refused call can be shown to write nothing at all. */
function snapshot(root: string): string {
  const hash = crypto.createHash('sha256')
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else hash.update(`${path.relative(root, full)}\0`).update(fs.readFileSync(full))
    }
  }
  walk(path.join(root, 'brand'))
  return hash.digest('hex')
}

function approved(root: string, id: string) {
  return readFacts(root, 'approved', SLUG)[id]
}

function policyIds(root: string): string[] {
  return (parse(fs.readFileSync(path.join(root, 'brand/publication-policy.yaml'), 'utf8')) as { approved_fact_ids: string[] }).approved_fact_ids
}

function cli(root: string, args: string[], env: Record<string, string> = {}, input = '') {
  const base: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && key !== 'BRAND_OS_AGENT_TOKEN' && key !== 'BRAND_OS_APPROVAL_PROOF') base[key] = value
  }
  return spawnSync(tsx, [path.join(repo, 'scripts/brand.ts'), ...args], { cwd: root, env: { ...base, ...env }, input, encoding: 'utf8', timeout: 60_000 })
}

// --- review queue --------------------------------------------------------------------------

test('the review queue diffs drafts against approved revisions and withholds restricted values', () => {
  const { engine, proof } = brand()
  draft(engine, PURPOSE, 'Help every learner practise a little each day.')
  draft(engine, VISION, 'A world where revision feels like play.')
  draft(engine, COSTS, 'RESTRICTED-COSTS-CANARY')
  assert.equal(engine.approve(PURPOSE, 'owner', proof).kind, 'recorded')
  engine.requestChange(PURPOSE, 'Help every learner remember what matters.')

  const queue = engine.approvals().reviewQueue({ module: 'brand-strategy' })
  assert.deepEqual(queue.items.map((item) => item.question_id).sort(), [PURPOSE, VISION].sort())
  const purpose = queue.items.find((item) => item.question_id === PURPOSE)
  assert.equal(purpose?.state, 'change_pending')
  assert.equal(purpose?.action, 'approve_change')
  assert.equal(purpose?.approved?.value, 'Help every learner practise a little each day.')
  assert.equal(purpose?.changes[0]?.proposed_value, 'Help every learner remember what matters.')
  assert.equal(purpose?.changes[0]?.stale, false)
  const vision = queue.items.find((item) => item.question_id === VISION)
  assert.equal(vision?.state, 'draft')
  assert.equal(vision?.approved, null)
  assert.ok(Array.isArray(vision?.impact.documents) && vision.impact.documents.length > 0)

  const finance = engine.approvals().reviewQueue({ module: 'business-finance' })
  const costs = finance.items.find((item) => item.question_id === COSTS)
  assert.equal(costs?.withheld, true)
  assert.equal(costs?.required_grant, 'financial')
  assert.equal(JSON.stringify(finance).includes('RESTRICTED-COSTS-CANARY'), false)

  assert.throws(() => engine.approvals().reviewQueue({ module: 'no-such-module' }), /Unknown module/)
})

// --- batch approval ------------------------------------------------------------------------

test('a batch approval with a wrong or missing proof changes nothing at all', () => {
  const { root, engine } = brand()
  draft(engine, PURPOSE, 'Help every learner practise a little each day.')
  draft(engine, VISION, 'A world where revision feels like play.')
  const before = snapshot(root)
  for (const proof of ['wrong-proof', undefined, '']) {
    const result = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
    assert.equal(result.ok, false)
    assert.equal(result.proof, 'rejected')
    assert.equal(result.approved, 0)
    assert.ok(result.results.length > 0)
    assert.ok(result.results.every((item) => item.outcome === 'refused'))
  }
  assert.equal(snapshot(root), before, 'no file under brand/ changed')
  assert.equal(approved(root, PURPOSE), undefined)
})

test('a module batch approves drafts and reports every skipped item instead of dropping it', () => {
  const { root, engine, proof } = brand()
  draft(engine, PURPOSE, 'Help every learner practise a little each day.')
  draft(engine, VISION, 'A world where revision feels like play.')

  const result = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
  assert.equal(result.proof, 'accepted')
  assert.equal(result.approved, 2)
  const outcome = (id: string) => result.results.find((item) => item.id === id)
  assert.equal(outcome(PURPOSE)?.outcome, 'approved')
  assert.equal(outcome(PURPOSE)?.version, 1)
  assert.equal(outcome(VISION)?.outcome, 'approved')
  // Every question in the module is reported, approved or not.
  const moduleIds = engine.questions().filter((question) => question.module === 'brand-strategy').map((question) => question.id)
  assert.deepEqual(result.results.map((item) => item.id).sort(), moduleIds.sort())
  assert.ok(result.results.filter((item) => item.outcome === 'skipped').every((item) => item.reason.length > 0))
  assert.equal(approved(root, PURPOSE)?.status, 'approved')
  assert.equal(approved(root, PURPOSE)?.publication, 'unpublished')

  // Running it again is safe: approved items are skipped, never re-versioned.
  const again = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
  assert.equal(again.approved, 0)
  assert.equal(again.results.find((item) => item.id === PURPOSE)?.outcome, 'skipped')
  assert.equal(approved(root, PURPOSE)?.version, 1)
})

test('an id batch reports unknown ids, unanswered ids, and role refusals per item', () => {
  const { root, engine, proof } = brand()
  draft(engine, PURPOSE, 'Help every learner practise a little each day.')
  draft(engine, COSTS, 'Hosting and two contractors.')
  const result = engine.approvals().approveBatch({ ids: [PURPOSE, COSTS, VISION, 'no.such.question'] }, proof, 'marketing')
  const outcome = (id: string) => result.results.find((item) => item.id === id)?.outcome
  assert.equal(outcome('no.such.question'), 'unknown')
  assert.equal(outcome(VISION), 'skipped')
  // Marketing may approve public copy only: internal strategy and restricted finance are refused.
  assert.equal(outcome(PURPOSE), 'refused')
  assert.equal(outcome(COSTS), 'refused')
  assert.equal(result.ok, false)
  assert.equal(approved(root, PURPOSE), undefined)

  const owner = engine.approvals().approveBatch({ ids: [COSTS] }, proof, 'owner')
  assert.equal(owner.results[0]?.outcome, 'approved')
  assert.equal(approved(root, COSTS)?.value, null, 'restricted values never enter approved-facts.yaml')
  assert.throws(() => engine.approvals().approveBatch({}, proof), /--module or --ids/)
  assert.throws(() => engine.approvals().approveBatch({ module: 'brand-strategy', ids: [PURPOSE] }, proof), /not both/)
})

// --- changing an approved fact -------------------------------------------------------------

test('a change keeps the approved revision canonical until the replacement is approved', () => {
  const { root, engine, proof } = brand('private')
  draft(engine, PURPOSE, 'Original approved purpose.')
  engine.approve(PURPOSE, 'owner', proof)
  const agent = agentTokenContext(SLUG, 'agt_test', 'internal-read')
  const read = () => (brandRetrieve(engine, agent, { kind: 'facts', ids: [PURPOSE] }).data as { items: RetrievedItem[] }).items[0]?.value

  const changed = engine.submit(`change ${PURPOSE}: Replacement purpose.`)
  assert.equal(changed.kind, 'impact')
  assert.equal(approved(root, PURPOSE)?.value, 'Original approved purpose.')
  assert.equal(approved(root, PURPOSE)?.version, 1)
  assert.equal(read(), 'Original approved purpose.', 'agents keep reading the approved revision while a change is pending')
  assert.equal(readProposals(root).filter((item) => item.status === 'pending').length, 1)

  const result = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
  assert.equal(result.results.find((item) => item.id === PURPOSE)?.outcome, 'approved')
  assert.equal(approved(root, PURPOSE)?.value, 'Replacement purpose.')
  assert.equal(approved(root, PURPOSE)?.version, 2)
  assert.equal(read(), 'Replacement purpose.')
})

test('a stale proposal is rejected after a newer approval, in a batch and by change id', () => {
  const { root, engine, proof } = brand()
  draft(engine, PURPOSE, 'Version one purpose.')
  engine.approve(PURPOSE, 'owner', proof)
  const first = engine.requestChange(PURPOSE, 'Version two purpose.')
  const second = engine.requestChange(PURPOSE, 'Competing purpose.')

  // Two live proposals for one field are not guessed between.
  const ambiguous = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
  assert.equal(ambiguous.results.find((item) => item.id === PURPOSE)?.outcome, 'skipped')
  assert.match(ambiguous.results.find((item) => item.id === PURPOSE)?.reason ?? '', /competing/)
  assert.equal(approved(root, PURPOSE)?.version, 1)

  const picked = engine.approvals().approveBatch({ ids: [first.id] }, proof)
  assert.equal(picked.results[0]?.outcome, 'approved')
  assert.equal(picked.results[0]?.question_id, PURPOSE)
  assert.equal(approved(root, PURPOSE)?.version, 2)

  const stale = engine.approvals().approveBatch({ ids: [second.id] }, proof)
  assert.equal(stale.results[0]?.outcome, 'stale')
  assert.equal(approved(root, PURPOSE)?.value, 'Version two purpose.')
  const byModule = engine.approvals().approveBatch({ module: 'brand-strategy' }, proof)
  assert.equal(byModule.results.find((item) => item.id === PURPOSE)?.outcome, 'stale')
  assert.equal(engine.approvals().reviewQueue({ ids: [PURPOSE] }).items[0]?.changes.find((item) => item.id === second.id)?.stale, true)
  assert.equal(engine.approveChange(second.id, proof, second.expected_version).kind, 'error')
  assert.equal(approved(root, PURPOSE)?.version, 2)
})

// --- publication ---------------------------------------------------------------------------

test('approval does not imply publication, and only approved public facts can be published', () => {
  const { root, engine, proof } = brand()
  draft(engine, TRADE_NAME, 'Batch Learners')
  draft(engine, LEGAL_NAME, 'Batch Learners Internal Ltd')
  draft(engine, VISION, 'Draft-only vision.')
  engine.approvals().approveBatch({ ids: [TRADE_NAME, LEGAL_NAME] }, proof)
  assert.equal(approved(root, TRADE_NAME)?.publication, 'unpublished')
  assert.deepEqual(policyIds(root), [])
  assert.equal(engine.exportPublic().facts.length, 0)

  const before = snapshot(root)
  const forged = engine.approvals().publish({ ids: [TRADE_NAME] }, 'wrong-proof')
  assert.equal(forged.proof, 'rejected')
  assert.equal(snapshot(root), before)

  const result = engine.approvals().publish({ ids: [TRADE_NAME, LEGAL_NAME, VISION, 'no.such.fact'] }, proof)
  const outcome = (id: string) => result.results.find((item) => item.id === id)
  assert.equal(outcome(TRADE_NAME)?.outcome, 'published')
  assert.equal(outcome(LEGAL_NAME)?.outcome, 'refused', 'publishing an internal fact is refused')
  assert.match(outcome(LEGAL_NAME)?.reason ?? '', /internal/)
  assert.equal(outcome(VISION)?.outcome, 'refused', 'a draft cannot be published')
  assert.equal(outcome('no.such.fact')?.outcome, 'unknown')
  assert.deepEqual(policyIds(root), [TRADE_NAME])
  assert.equal(approved(root, LEGAL_NAME)?.publication, 'unpublished')
  const projection = engine.exportPublic()
  assert.deepEqual(projection.facts.map((fact) => fact.id), [TRADE_NAME])
  assert.equal(JSON.stringify(projection).includes('Internal Ltd'), false)

  // A hand-edited fact that claims to be public is still refused when the question bank says internal.
  const facts = readFacts(root, 'approved', SLUG)
  const legal = facts[LEGAL_NAME]
  assert.ok(legal)
  legal.classification = 'public'
  writeYaml(path.join(root, 'brand/instance/approved-facts.yaml'), { schema_version: 2, facts })
  assert.equal(engine.approvals().publish({ ids: [LEGAL_NAME] }, proof).results[0]?.outcome, 'refused')
})

test('unpublish removes a fact from the public projection and the allowlist', () => {
  const { root, engine, proof } = brand()
  draft(engine, TRADE_NAME, 'Batch Learners')
  engine.approve(TRADE_NAME, 'owner', proof)
  engine.approvals().publish({ module: 'business-company' }, proof)
  assert.equal(engine.exportPublic().facts.some((fact) => fact.id === TRADE_NAME), true)

  const result = engine.approvals().publish({ ids: [TRADE_NAME] }, proof, { unpublish: true })
  assert.equal(result.results[0]?.outcome, 'unpublished')
  assert.equal(engine.exportPublic().facts.length, 0)
  assert.deepEqual(policyIds(root), [])
  assert.equal(approved(root, TRADE_NAME)?.status, 'approved', 'unpublishing keeps the approval')
  assert.equal(engine.approvals().publish({ ids: [TRADE_NAME] }, proof, { unpublish: true }).results[0]?.outcome, 'unchanged')
})

test('approving a replacement for a published fact withdraws publication until it is republished', () => {
  const { root, engine, proof } = brand()
  draft(engine, TRADE_NAME, 'Batch Learners')
  engine.approve(TRADE_NAME, 'owner', proof)
  engine.publishFact(TRADE_NAME, proof)
  const change = engine.requestChange(TRADE_NAME, 'Batch Academy')
  assert.equal(engine.exportPublic().facts[0]?.value, 'Batch Learners', 'the published revision stays public while the change is pending')

  assert.equal(engine.approveChange(change.id, proof, change.expected_version).kind, 'recorded')
  assert.equal(approved(root, TRADE_NAME)?.version, 2)
  assert.equal(engine.exportPublic().facts.length, 0, 'the new revision is not public until published')
  assert.deepEqual(policyIds(root), [])
  engine.approvals().publish({ ids: [TRADE_NAME] }, proof)
  assert.equal(engine.exportPublic().facts[0]?.value, 'Batch Academy')
})

// --- approval_grant ------------------------------------------------------------------------

test('an explicit approval_grant wins over the id guess and restricted questions stay financial', () => {
  const { root, engine } = brand()
  const vision = engine.question(VISION) as FieldQuestion
  assert.equal(permissionFor(vision), 'canonical')
  assert.equal(permissionFor({ ...vision, approval_grant: 'visual' }), 'visual')
  assert.equal(canApprove('design', { ...vision, approval_grant: 'visual' }), true)
  assert.equal(canApprove('design', vision), false)
  // The id-based guess would call this financial; the explicit grant is preferred.
  const pricingLike = { ...vision, id: 'brand.pricing.tone', approval_grant: 'public_copy' as const }
  assert.equal(permissionFor(pricingLike), 'public_copy')
  // Restricted always needs financial, whatever the bank says.
  const costs = engine.question(COSTS) as FieldQuestion
  assert.equal(permissionFor({ ...costs, approval_grant: 'visual' }), 'financial')

  fs.cpSync(path.join(repo, 'schemas'), path.join(root, 'schemas'), { recursive: true })
  const bank = path.join(root, 'brand/interview/question-bank/business.yaml')
  const doc = parse(fs.readFileSync(bank, 'utf8')) as { questions: Array<Record<string, unknown>> }
  const target = doc.questions.find((question) => question.id === COSTS)
  assert.ok(target)
  target.approval_grant = 'visual'
  writeYaml(bank, doc)
  const report = validateRepo(root)
  assert.ok(report.errors.some((error) => error.includes(COSTS) && error.includes('approval_grant financial')), report.errors.join('\n'))
  target.approval_grant = 'financial'
  writeYaml(bank, doc)
  assert.equal(validateRepo(root).errors.some((error) => error.includes('approval_grant')), false)
})

// --- CLI (Journey C: unauthorized approval) ------------------------------------------------

test('Journey C: brand:approve and brand:publish refuse argv proofs, agents, and wrong proofs', () => {
  const { root, engine, proof } = brand()
  draft(engine, TRADE_NAME, 'Batch Learners')
  draft(engine, PURPOSE, 'Help every learner practise a little each day.')
  const before = snapshot(root)

  const onArgv = cli(root, ['approve', '--ids', TRADE_NAME, '--proof', proof])
  assert.equal(onArgv.status, 2)
  assert.match(onArgv.stderr, /--proof is not accepted/)
  assert.equal(`${onArgv.stdout}${onArgv.stderr}`.includes(proof), false, 'the proof is never echoed')
  const publishArgv = cli(root, ['publish', `--proof=${proof}`, '--ids', TRADE_NAME])
  assert.equal(publishArgv.status, 2)

  const asAgent = cli(root, ['approve', '--ids', TRADE_NAME], { BRAND_OS_AGENT_TOKEN: 'bos_agent_anything', BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(asAgent.status, 2)
  assert.match(asAgent.stderr, /BRAND_OS_AGENT_TOKEN/)

  const wrong = cli(root, ['approve', '--module', 'business-company', '--json'], { BRAND_OS_APPROVAL_PROOF: 'not-the-proof' })
  assert.equal(wrong.status, 1)
  assert.equal((JSON.parse(wrong.stdout) as { proof: string }).proof, 'rejected')
  const noProof = cli(root, ['approve', '--ids', TRADE_NAME], {}, '')
  assert.equal(noProof.status, 1)
  assert.equal(snapshot(root), before, 'refused CLI calls wrote nothing')

  const dry = cli(root, ['approve', '--module', 'business-company', '--dry-run', '--json'])
  assert.equal(dry.status, 0, dry.stderr)
  assert.ok((JSON.parse(dry.stdout) as { items: Array<{ question_id: string }> }).items.some((item) => item.question_id === TRADE_NAME))
  assert.equal(snapshot(root), before, 'a dry run writes nothing')

  // The real path: proof from the environment for approval, from piped stdin for publication.
  const ok = cli(root, ['approve', '--ids', `${TRADE_NAME},${PURPOSE}`, '--json'], { BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(ok.status, 0, ok.stderr)
  assert.equal((JSON.parse(ok.stdout) as { approved: number }).approved, 2)
  assert.deepEqual(policyIds(root), [], 'approval does not publish')

  const review = cli(root, ['review', '--ids', TRADE_NAME, '--json'])
  assert.equal((JSON.parse(review.stdout) as { items: Array<{ state: string }> }).items[0]?.state, 'approved')

  const internal = cli(root, ['publish', '--ids', PURPOSE, '--json'], {}, `${proof}\n`)
  assert.equal(internal.status, 1)
  assert.equal((JSON.parse(internal.stdout) as { results: Array<{ outcome: string }> }).results[0]?.outcome, 'refused')
  const published = cli(root, ['publish', '--ids', TRADE_NAME], {}, `${proof}\n`)
  assert.equal(published.status, 0, published.stderr)
  assert.deepEqual(policyIds(root), [TRADE_NAME])
  const unpublished = cli(root, ['publish', '--ids', TRADE_NAME, '--unpublish'], { BRAND_OS_APPROVAL_PROOF: proof })
  assert.equal(unpublished.status, 0, unpublished.stderr)
  assert.deepEqual(policyIds(root), [])
})
