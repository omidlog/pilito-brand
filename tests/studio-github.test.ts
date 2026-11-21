import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { GitHubClient, GitHubError } from '../apps/studio/src/github/client.js'
import { extractTarGz, repoRelative, studioPathAllowed } from '../apps/studio/src/github/tar.js'
import { DeliveryLog, parsePush, signWebhook, verifyWebhookSignature } from '../apps/studio/src/github/webhook.js'
import { FakeGitHub, makeTarGz } from './helpers/fake-github.js'

const TOKEN = 'fake-token-should-never-appear-in-errors-123456'
const noSleep = async (): Promise<void> => undefined

function tmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tar-'))
}

test('tar extraction keeps only allowlisted regular files and refuses traversal, symlinks and private paths', () => {
  const archive = makeTarGz([
    { path: 'o-r-abc/', type: '5' },
    { path: 'o-r-abc/brand/brand.config.yaml', data: Buffer.from('brand: {}\n') },
    { path: `o-r-abc/brand/content/${'deep/'.repeat(30)}page.md`, data: Buffer.from('long path via pax') },
    { path: 'o-r-abc/brand/.private/approval-secret', data: Buffer.from('SECRET') },
    { path: 'o-r-abc/brand/restricted/facts.yaml', data: Buffer.from('RESTRICTED') },
    { path: 'o-r-abc/brand/.env', data: Buffer.from('ENV') },
    { path: 'o-r-abc/brand/../../escape.txt', data: Buffer.from('ESCAPE') },
    { path: 'o-r-abc/brand/link', type: '2', linkTarget: '/etc/passwd' },
    { path: 'o-r-abc/brand/hard', type: '1', linkTarget: 'o-r-abc/brand/brand.config.yaml' },
    { path: 'o-r-abc/apps/studio/src/main.ts', data: Buffer.from('outside brand/') },
  ])
  const dest = tmp()
  const report = extractTarGz(archive, { destRoot: dest, include: studioPathAllowed })
  assert.deepEqual(report.files.sort(), ['brand/brand.config.yaml', `brand/content/${'deep/'.repeat(30)}page.md`].sort())
  assert.ok(report.skipped.some((item) => item.reason === 'symlink'))
  assert.ok(report.skipped.some((item) => item.reason === 'hard link'))
  assert.ok(report.skipped.some((item) => item.reason === 'unsafe path'))
  assert.equal(fs.existsSync(path.join(dest, 'brand/link')), false)
  assert.equal(fs.existsSync(path.join(dest, 'brand/.private')), false)
  assert.equal(fs.existsSync(path.join(path.dirname(dest), 'escape.txt')), false)
  assert.equal(repoRelative('/abs/path'), null)
  assert.equal(repoRelative('p/a\\b'), null)
})

test('tar extraction stops a decompression bomb and an oversized file', () => {
  const big = makeTarGz([{ path: 'o-r-a/brand/big.bin', data: Buffer.alloc(2 * 1024 * 1024) }])
  const report = extractTarGz(big, { destRoot: tmp(), include: studioPathAllowed, maxFileBytes: 1024 * 1024 })
  assert.deepEqual(report.skipped, [{ path: 'brand/big.bin', reason: 'file too large' }])
  assert.throws(() => extractTarGz(big, { destRoot: tmp(), include: studioPathAllowed, maxTotalBytes: 1024 }), /larger than Studio accepts|too large/)
  assert.throws(() => extractTarGz(Buffer.from('not gzip'), { destRoot: tmp(), include: studioPathAllowed }), /decompressed/)
})

test('the client retries transient errors, not client errors, and never puts the token in an error', async () => {
  const github = new FakeGitHub()
  github.addRepo('o', 'r', new Map([['brand/a', Buffer.from('a')]]))
  const client = new GitHubClient({ token: TOKEN, fetch: github.fetch, sleep: noSleep })
  github.fail('GET', /\/repos\/o\/r$/, 500, 2)
  assert.equal((await client.getRepo('o', 'r'))?.name, 'r')
  assert.equal(github.callsTo('GET', /\/repos\/o\/r$/).length, 3)

  github.fail('GET', /\/repos\/o\/r$/, 403, 1)
  await assert.rejects(client.getRepo('o', 'r'), (error: unknown) => error instanceof GitHubError && error.kind === 'forbidden' && !error.message.includes(TOKEN))
  assert.equal(github.callsTo('GET', /\/repos\/o\/r$/).length, 4, '403 without rate-limit headers is not retried')

  github.fail('GET', /\/repos\/o\/r$/, 503, 10)
  await assert.rejects(client.getRepo('o', 'r'), (error: unknown) => error instanceof GitHubError && error.kind === 'transient' && !String(error.stack).includes(TOKEN))
  github.faults.length = 0

  github.fail('GET', /\/user$/, 0, 4, { network: true })
  await assert.rejects(client.viewer(), (error: unknown) => error instanceof GitHubError && error.kind === 'transient')
  assert.equal(await client.getRepo('o', 'missing'), null)

  const anonymous = new GitHubClient({ token: null, fetch: github.fetch })
  assert.equal(anonymous.configured, false)
  await assert.rejects(anonymous.getRepo('o', 'r'), /not configured/)
})

test('tarball redirects are followed only to codeload.github.com and without the Studio token', async () => {
  const github = new FakeGitHub()
  const repo = github.addRepo('o', 'r', new Map([['brand/a', Buffer.from('a')]]))
  const client = new GitHubClient({ token: TOKEN, fetch: github.fetch, sleep: noSleep })
  github.tarballRedirect = 'https://codeload.github.com/o/r/tar.gz/{sha}'
  const archive = await client.getTarball('o', 'r', repo.head!)
  assert.ok(archive.length > 0)
  const codeload = github.calls.filter((call) => call.path.includes('/tar.gz/'))
  assert.equal(codeload.length, 1)
  assert.equal(codeload[0]?.token, null, 'the token is not forwarded to the archive host')
  github.tarballRedirect = 'https://evil.example.com/{sha}'
  await assert.rejects(client.getTarball('o', 'r', repo.head!), /unexpected host/)
  await assert.rejects(client.getTarball('o', 'r', 'not-a-sha'), /Invalid commit/)
})

test('the fake GitHub refuses any host other than GitHub, so a test cannot reach the network by accident', async () => {
  const github = new FakeGitHub()
  await assert.rejects(github.fetch('https://example.com/'), /refused/)
})

test('webhook signatures are verified in constant time over the raw body; replays are ignored', () => {
  const secret = 'webhook-secret-for-tests-0001'
  const body = Buffer.from(JSON.stringify({ ref: 'refs/heads/main', after: 'a'.repeat(40), repository: { id: 7, full_name: 'o/r' } }))
  const signature = signWebhook(secret, body)
  assert.equal(verifyWebhookSignature(secret, body, signature), true)
  assert.equal(verifyWebhookSignature(secret, Buffer.concat([body, Buffer.from(' ')]), signature), false)
  assert.equal(verifyWebhookSignature('another-secret-entirely-000', body, signature), false)
  assert.equal(verifyWebhookSignature(null, body, signature), false, 'no secret configured means every delivery is refused')
  assert.equal(verifyWebhookSignature(secret, body, undefined), false)
  assert.equal(verifyWebhookSignature(secret, body, 'sha1=abc'), false)
  assert.deepEqual(parsePush(JSON.parse(body.toString())), { repositoryId: 7, fullName: 'o/r', ref: 'refs/heads/main', after: 'a'.repeat(40) })
  assert.equal(parsePush({ ref: 1 }), null)
  const log = new DeliveryLog(2)
  assert.equal(log.firstTime('d1'), true)
  assert.equal(log.firstTime('d1'), false)
  assert.equal(log.firstTime(undefined), false)
})
