import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import {
  backupBrand,
  ensureApprovalSecret,
  InterviewEngine,
  readFacts,
  restoreBrand,
  writeAtomic,
  writeStarterWorkspace,
} from '@brand-os/brand-core'
import { writeYaml } from '../packages/brand-core/src/fsutil.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-onboarding-'))
  writeStarterWorkspace(root)
  return root
}

function approvedVersion(root: string, id: string): number | undefined {
  return readFacts(root, 'approved', 'example-brand')[id]?.version
}

// --- Persian routing (engine.ts) -------------------------------------------------------------

test('a Persian answer longer than 12 characters is recorded for the current question', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  assert.equal(engine.submit('new').kind, 'recorded')
  assert.equal(engine.current()?.id, 'business.identity.trade_name')
  const name = 'آکادمی یادگیری روشن'
  assert.ok(name.length > 12)
  const result = engine.submit(name)
  assert.equal(result.kind, 'recorded')
  assert.equal(result.questionId, 'business.identity.trade_name')
  const ledger = parse(fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8')) as { records: Array<{ question_id: string; value: unknown }> }
  assert.equal(ledger.records.find((record) => record.question_id === 'business.identity.trade_name')?.value, name)
  assert.equal(engine.session().pending_proposals?.length ?? 0, 0)
  assert.notEqual(engine.current()?.id, 'business.identity.trade_name')
})

test('a long Persian sentence containing a keyword is still an answer, not a hidden note', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  // Before the fix, any Persian text over 12 chars containing "دانشجو" became a proposal and was never recorded.
  const sentence = 'یک اپلیکیشن تمرین برای دانشجو ها و معلم ها'
  // Walk to a long_text question without skipping it.
  engine.submit('new')
  engine.submit('Example Learners')
  engine.submit('education')
  assert.equal(engine.current()?.id, 'business.offer.summary')
  const result = engine.submit(sentence)
  assert.equal(result.kind, 'recorded')
  assert.equal(result.questionId, 'business.offer.summary')
})

test('note: still produces proposals and records nothing', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  engine.submit('new')
  const before = fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8')
  const note = engine.submit('note: مخاطب اصلی دانشجو است و یک ایده B2B بیزنس داریم ولی قیمت هنوز نیست')
  assert.equal(note.kind, 'info')
  assert.match(note.message, /business\.customer\.primary_segment/)
  assert.match(note.message, /not approvals/)
  assert.ok((engine.session().pending_proposals?.length ?? 0) >= 2)
  assert.equal(fs.readFileSync(path.join(root, 'brand/interview/answer-ledger.yaml'), 'utf8'), before)
  assert.equal(engine.current()?.id, 'business.identity.trade_name')
})

// --- Approval versions (engine.ts approve) ----------------------------------------------------

test('re-approving is refused and never resets the approved version to 1', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  const proof = ensureApprovalSecret(root)
  const id = 'business.identity.trade_name'
  engine.submit('new')
  engine.submit('Original Brand')
  assert.equal(engine.approve(id, 'owner', proof).kind, 'recorded')
  assert.equal(approvedVersion(root, id), 1)

  const change = engine.requestChange(id, 'Renamed Brand')
  assert.equal(engine.approveChange(change.id, proof, change.expected_version).kind, 'recorded')
  assert.equal(approvedVersion(root, id), 2)

  const again = engine.approve(id, 'owner', proof)
  assert.equal(again.kind, 'error')
  assert.match(again.message, /already approved \(version 2\)/)
  assert.equal(approvedVersion(root, id), 2)

  // The stale check still works after the refused re-approval: a proposal made against v1 cannot land.
  const stale = engine.approveChange(change.id, proof, 1)
  assert.equal(stale.kind, 'error')
  assert.equal(approvedVersion(root, id), 2)
})

test('approving a draft over a previously approved fact bumps the version', () => {
  const root = fixture()
  const engine = new InterviewEngine(root)
  const proof = ensureApprovalSecret(root)
  const id = 'business.identity.trade_name'
  engine.submit('new')
  engine.submit('Original Brand')
  engine.approve(id, 'owner', proof)
  const change = engine.requestChange(id, 'Second Name')
  engine.approveChange(change.id, proof, change.expected_version)
  assert.equal(approvedVersion(root, id), 2)

  // Ledger drift (for example an older ledger restored on its own): the latest record is a draft
  // while approved-facts still holds version 2. Approval must continue at 3.
  const ledgerFile = path.join(root, 'brand/interview/answer-ledger.yaml')
  const ledger = parse(fs.readFileSync(ledgerFile, 'utf8')) as { records: Array<{ question_id: string; status: string; superseded_by?: string | null }> }
  const latest = ledger.records.filter((record) => record.question_id === id && !record.superseded_by).at(-1)
  assert.ok(latest)
  latest.status = 'draft'
  fs.writeFileSync(ledgerFile, stringify(ledger))

  assert.equal(new InterviewEngine(root).approve(id, 'owner', proof).kind, 'recorded')
  assert.equal(approvedVersion(root, id), 3)
})

// --- Atomic writes (fsutil.ts) -----------------------------------------------------------------

test('writeYaml replaces the file by rename and leaves no temp files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-atomic-'))
  const file = path.join(dir, 'facts.yaml')
  writeYaml(file, { version: 1 })
  const inodeBefore = fs.statSync(file).ino
  writeYaml(file, { version: 2, note: 'x'.repeat(10_000) })
  // An in-place writeFileSync keeps the inode. A temp-file-plus-rename write gives a new one.
  assert.notEqual(fs.statSync(file).ino, inodeBefore)
  assert.deepEqual(parse(fs.readFileSync(file, 'utf8')), { version: 2, note: 'x'.repeat(10_000) })
  assert.deepEqual(fs.readdirSync(dir), ['facts.yaml'])
})

test('a failed atomic write leaves the old file intact and no partial or temp file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-atomic-'))
  const file = path.join(dir, 'approved-facts.yaml')
  writeYaml(file, { facts: { keep: 'old value' } })
  const original = fs.readFileSync(file, 'utf8')
  // A non-empty directory at the target makes the rename step fail after the temp file was written.
  const blocked = path.join(dir, 'blocked')
  fs.mkdirSync(path.join(blocked, 'child'), { recursive: true })
  assert.throws(() => writeAtomic(blocked, 'new contents'))
  assert.equal(fs.readFileSync(file, 'utf8'), original)
  assert.deepEqual(fs.readdirSync(dir).sort(), ['approved-facts.yaml', 'blocked'])
})

test('atomic writes honour an explicit private mode', { skip: process.platform === 'win32' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-atomic-'))
  const file = path.join(dir, 'store.json')
  writeAtomic(file, '{}\n', { mode: 0o600 })
  assert.equal(fs.statSync(file).mode & 0o777, 0o600)
})

// --- Restore validates every path before writing (backup.ts) -----------------------------------

test('restore with one unsafe path writes nothing', () => {
  const root = fixture()
  const saved = backupBrand(root)
  const key = Buffer.from(process.env.BRAND_OS_DATA_KEY ?? '', 'base64')
  const payload = {
    files: [
      { path: 'brand/instance/approved-facts.yaml', data: Buffer.from('schema_version: 2\nfacts: { injected: true }\n').toString('base64') },
      { path: 'brand/instance/../../escape.txt', data: Buffer.from('escaped').toString('base64') },
    ],
  }
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  const evil = path.join(path.dirname(saved.directory), 'evil')
  fs.mkdirSync(evil)
  fs.writeFileSync(path.join(evil, 'backup.enc'), body)
  fs.writeFileSync(
    path.join(evil, 'backup-manifest.json'),
    JSON.stringify({ checksum: crypto.createHash('sha256').update(body).digest('hex'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') }),
  )
  const before = fs.readFileSync(path.join(root, 'brand/instance/approved-facts.yaml'), 'utf8')
  assert.throws(() => restoreBrand(root, evil), /Unsafe backup path/)
  assert.equal(fs.readFileSync(path.join(root, 'brand/instance/approved-facts.yaml'), 'utf8'), before)
  assert.equal(fs.existsSync(path.join(path.dirname(root), 'escape.txt')), false)
})
