import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import { ensureApprovalSecret, formatDoctor, runDoctor, writeStarterWorkspace } from '@brand-os/brand-core'

const repo = path.resolve(import.meta.dirname, '..')

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-doctor-'))
  writeStarterWorkspace(root)
  return root
}

// brand:doctor --------------------------------------------------------------------------------

function doctorRoot(): string {
  const root = fixture()
  fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules/\n.env\nbrand/.private/\n')
  fs.writeFileSync(path.join(root, 'brand/publication-policy.yaml'), stringify({ schema_version: 1, brand_id: 'example-brand', approved_fact_ids: [] }))
  return root
}

function check(report: ReturnType<typeof runDoctor>, id: string) {
  const found = report.checks.find((item) => item.id === id)
  assert.ok(found, `missing check ${id}`)
  return found
}

test('doctor passes a healthy workspace and reports values only by presence', () => {
  const root = doctorRoot()
  const secret = ensureApprovalSecret(root)
  const key = crypto.randomBytes(32).toString('base64')
  const report = runDoctor(root, { env: { BRAND_OS_DATA_KEY: key }, nodeVersion: '22.11.0', platform: 'linux' })
  assert.equal(report.ok, true, formatDoctor(report))
  for (const item of report.checks) assert.notEqual(item.status, 'fail', item.message)
  const text = `${formatDoctor(report)}\n${JSON.stringify(report)}`
  assert.equal(text.includes(key), false)
  assert.equal(text.includes(secret), false)
})

test('doctor fails on a missing key and a short key without printing it', () => {
  const root = doctorRoot()
  ensureApprovalSecret(root)
  const missing = runDoctor(root, { env: {}, nodeVersion: '22.0.0', platform: 'linux' })
  assert.equal(missing.ok, false)
  assert.equal(check(missing, 'data_key').status, 'fail')
  assert.match(check(missing, 'data_key').message, /not set/)

  const shortKey = crypto.randomBytes(16).toString('base64')
  const short = runDoctor(root, { env: { BRAND_OS_DATA_KEY: shortKey }, nodeVersion: '22.0.0', platform: 'linux' })
  assert.equal(short.ok, false)
  assert.match(check(short, 'data_key').message, /16 bytes, not 32/)
  assert.equal(`${formatDoctor(short)}${JSON.stringify(short)}`.includes(shortKey), false)

  const garbage = 'not base64 at all!'
  const invalid = runDoctor(root, { env: { BRAND_OS_DATA_KEY: garbage }, nodeVersion: '22.0.0', platform: 'linux' })
  assert.match(check(invalid, 'data_key').message, /not valid base64/)
  assert.equal(`${formatDoctor(invalid)}${JSON.stringify(invalid)}`.includes(garbage), false)
})

test('doctor fails on a mismatched publication brand id, an old Node, and a loose secret mode', () => {
  const root = doctorRoot()
  const env = { BRAND_OS_DATA_KEY: crypto.randomBytes(32).toString('base64') }
  const policyFile = path.join(root, 'brand/publication-policy.yaml')
  const policy = parse(fs.readFileSync(policyFile, 'utf8')) as Record<string, unknown>
  policy.brand_id = 'someone-else'
  fs.writeFileSync(policyFile, stringify(policy))
  const report = runDoctor(root, { env, nodeVersion: '20.11.0', platform: 'linux' })
  assert.equal(report.ok, false)
  assert.equal(check(report, 'publication_policy').status, 'fail')
  assert.match(check(report, 'publication_policy').message, /someone-else/)
  assert.equal(check(report, 'node').status, 'fail')
  assert.equal(check(report, 'approval_secret').status, 'warn')

  ensureApprovalSecret(root)
  fs.chmodSync(path.join(root, 'brand/.private/approval-secret'), 0o644)
  const loose = runDoctor(root, { env, nodeVersion: '22.0.0', platform: 'linux' })
  assert.equal(check(loose, 'approval_secret').status, 'fail')
  assert.match(check(loose, 'approval_secret').message, /0644/)
})

test('doctor flags a config that does not parse and a .env that is not ignored', () => {
  const root = fixture()
  fs.writeFileSync(path.join(root, 'brand/brand.config.yaml'), 'brand: [unclosed\n')
  const report = runDoctor(root, { env: {}, nodeVersion: '22.0.0', platform: 'linux' })
  assert.equal(check(report, 'config').status, 'fail')
  assert.notEqual(check(report, 'env_ignored').status, 'pass')
})

test('brand:doctor CLI exits non-zero on failure, emits JSON, and never prints the key', () => {
  const root = doctorRoot()
  const shortKey = crypto.randomBytes(8).toString('base64')
  const run = (env: NodeJS.ProcessEnv, args: string[]) =>
    spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), path.join(repo, 'scripts/brand.ts'), 'doctor', ...args], {
      cwd: root,
      env: { PATH: process.env.PATH, ...env },
      encoding: 'utf8',
    })
  const bad = run({ BRAND_OS_DATA_KEY: shortKey }, ['--json'])
  assert.equal(bad.status, 1, bad.stderr)
  const parsed = JSON.parse(bad.stdout) as { ok: boolean; checks: Array<{ id: string; status: string }> }
  assert.equal(parsed.ok, false)
  assert.equal(parsed.checks.find((item) => item.id === 'data_key')?.status, 'fail')
  assert.equal(`${bad.stdout}${bad.stderr}`.includes(shortKey), false)

  const goodKey = crypto.randomBytes(32).toString('base64')
  const good = run({ BRAND_OS_DATA_KEY: goodKey }, ['--create-approval-secret'])
  assert.equal(good.status, 0, `${good.stdout}${good.stderr}`)
  const secret = fs.readFileSync(path.join(root, 'brand/.private/approval-secret'), 'utf8').trim()
  assert.ok(secret.length > 0)
  if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(root, 'brand/.private/approval-secret')).mode & 0o777, 0o600)
  assert.equal(`${good.stdout}${good.stderr}`.includes(goodKey), false)
  assert.equal(`${good.stdout}${good.stderr}`.includes(secret), false)
})
