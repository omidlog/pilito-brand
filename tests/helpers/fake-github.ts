import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { writeStarterWorkspace } from '@brand-os/brand-core'
import type { FetchLike } from '../../apps/studio/src/github/client.js'

/**
 * In-memory GitHub for Studio tests. It implements only the REST endpoints Studio uses, at the HTTP
 * level, so the real client (headers, retries, redirects, error mapping) is exercised. Nothing here
 * opens a socket. Any request to a host other than api.github.com or codeload.github.com throws.
 */
export type Tree = Map<string, Buffer>

interface Commit {
  sha: string
  tree: string
  parent: string | null
  message: string
  date: string
}

interface Repo {
  id: number
  owner: string
  name: string
  private: boolean
  is_template: boolean
  default_branch: string
  head: string | null
  pulls: Array<{ number: number; title: string; head: string; draft: boolean }>
}

export interface Fault {
  method: string
  pattern: RegExp
  status: number
  times: number
  headers?: Record<string, string>
  /** Throw a network error instead of answering. */
  network?: boolean
}

export interface Call {
  method: string
  path: string
  token: string | null
}

function sha(): string {
  return crypto.randomBytes(20).toString('hex')
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

function header(name: string, size: number, type: string): Buffer {
  const block = Buffer.alloc(512)
  block.write(name.slice(0, 100), 0, 'utf8')
  block.write('0000644\0', 100)
  block.write('0000000\0', 108)
  block.write('0000000\0', 116)
  block.write(`${size.toString(8).padStart(11, '0')}\0`, 124)
  block.write(`${Math.floor(Date.now() / 1000).toString(8).padStart(11, '0')}\0`, 136)
  block.write('        ', 148)
  block.write(type, 156)
  block.write('ustar\0', 257)
  block.write('00', 263)
  let sum = 0
  for (const byte of block) sum += byte
  block.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148)
  return block
}

function pad(data: Buffer): Buffer {
  const rest = data.length % 512
  return rest === 0 ? data : Buffer.concat([data, Buffer.alloc(512 - rest)])
}

export interface RawEntry {
  path: string
  data?: Buffer
  type?: '0' | '1' | '2' | '5'
  linkTarget?: string
}

/** Writes a gzip tarball. Long names use a pax header, as GitHub's archives do. */
export function makeTarGz(entries: RawEntry[]): Buffer {
  const parts: Buffer[] = [header('pax_global_header', 52, 'g'), pad(Buffer.from('52 comment=0000000000000000000000000000000000000000\n'))]
  for (const entry of entries) {
    const data = entry.data ?? Buffer.alloc(0)
    const type = entry.type ?? '0'
    if (Buffer.byteLength(entry.path) > 99) {
      const record = ` path=${entry.path}\n`
      let length = record.length + 2
      while (`${length}${record}`.length !== length) length = `${length}${record}`.length
      const pax = Buffer.from(`${length}${record}`)
      parts.push(header('PaxHeader', pax.length, 'x'), pad(pax))
    }
    const block = header(entry.path, type === '0' ? data.length : 0, type)
    if (entry.linkTarget) block.write(entry.linkTarget, 157, 'utf8')
    if (entry.linkTarget) {
      let sum = 0
      block.write('        ', 148)
      for (const byte of block) sum += byte
      block.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148)
    }
    parts.push(block)
    if (type === '0') parts.push(pad(data))
  }
  parts.push(Buffer.alloc(1024))
  return zlib.gzipSync(Buffer.concat(parts))
}

function readTree(root: string, base = root, out: Tree = new Map()): Tree {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) readTree(full, base, out)
    else if (entry.isFile()) out.set(path.relative(base, full).split(path.sep).join('/'), fs.readFileSync(full))
  }
  return out
}

/** The Brand OS starter workspace plus decoys that Studio must never read or copy. */
export function templateTree(): Tree {
  const repo = path.resolve(import.meta.dirname, '..', '..')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-template-'))
  writeStarterWorkspace(root)
  fs.cpSync(path.join(repo, 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  const tree = readTree(root)
  fs.rmSync(root, { recursive: true, force: true })
  tree.set('README.md', Buffer.from('# Brand OS template\n'))
  tree.set('package.json', Buffer.from('{"name":"brand-os-template"}\n'))
  // Decoys: a committed-by-mistake private file and env file must never reach a projection or a commit.
  tree.set('brand/.private/approval-secret', Buffer.from('DECOY-APPROVAL-SECRET-NEVER-READ'))
  tree.set('brand/restricted/facts.yaml', Buffer.from('value: DECOY-RESTRICTED-NEVER-READ\n'))
  tree.set('.env', Buffer.from('STUDIO_GITHUB_READ_TOKEN=DECOY-ENV-NEVER-READ\n'))
  return tree
}

export class FakeGitHub {
  readonly repos = new Map<string, Repo>()
  readonly commits = new Map<string, Commit>()
  readonly trees = new Map<string, Tree>()
  readonly blobs = new Map<string, Buffer>()
  readonly calls: Call[] = []
  readonly faults: Fault[] = []
  /** Number of `commits/<branch>` reads that answer 404 after a template generation (GitHub copies asynchronously). */
  generationDelay = 0
  /** Simulates GitHub ignoring `private: true`. */
  forcePublic = false
  /** Simulates a token without the delete_repo permission. */
  deleteForbidden = false
  /** Answer tarball requests with a redirect to this URL instead of the archive. */
  tarballRedirect: string | null = null
  private nextId = 1000
  private pendingReads = new Map<string, number>()

  addRepo(owner: string, name: string, tree: Tree, options: Partial<Pick<Repo, 'private' | 'is_template' | 'default_branch'>> = {}): Repo {
    const repo: Repo = {
      id: this.nextId++,
      owner,
      name,
      private: options.private ?? true,
      is_template: options.is_template ?? false,
      default_branch: options.default_branch ?? 'main',
      head: null,
      pulls: [],
    }
    this.repos.set(`${owner}/${name}`.toLowerCase(), repo)
    this.commitTree(repo, new Map(tree), 'Initial commit')
    return repo
  }

  repo(owner: string, name: string): Repo | undefined {
    return this.repos.get(`${owner}/${name}`.toLowerCase())
  }

  commitTree(repo: Repo, tree: Tree, message: string): string {
    const treeSha = sha()
    this.trees.set(treeSha, tree)
    const commit: Commit = { sha: sha(), tree: treeSha, parent: repo.head, message, date: new Date().toISOString() }
    this.commits.set(commit.sha, commit)
    repo.head = commit.sha
    return commit.sha
  }

  headTree(owner: string, name: string): Tree {
    const repo = this.repo(owner, name)
    if (!repo?.head) throw new Error('no head')
    const commit = this.commits.get(repo.head)!
    return new Map(this.trees.get(commit.tree)!)
  }

  /** Simulates a merged edit made outside Studio (for example by Claude Code through a PR). */
  pushEdit(owner: string, name: string, edit: (tree: Tree) => void, message = 'feat(brand): edit'): string {
    const repo = this.repo(owner, name)!
    const tree = this.headTree(owner, name)
    edit(tree)
    return this.commitTree(repo, tree, message)
  }

  fail(method: string, pattern: RegExp, status: number, times = 1, extra: Partial<Fault> = {}): void {
    this.faults.push({ method, pattern, status, times, ...extra })
  }

  callsTo(method: string, pattern: RegExp): Call[] {
    return this.calls.filter((call) => call.method === method && pattern.test(call.path))
  }

  readonly fetch: FetchLike = async (input, init = {}) => {
    const url = new URL(input)
    const method = (init.method ?? 'GET').toUpperCase()
    const headers = new Headers(init.headers)
    const auth = headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (url.hostname === 'codeload.github.com') {
      this.calls.push({ method, path: url.pathname, token })
      const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/tar\.gz\/([0-9a-f]{40})$/)
      if (!match) return new Response('not found', { status: 404 })
      return this.archive(match[1]!, match[2]!, match[3]!)
    }
    if (url.hostname !== 'api.github.com') throw new Error(`FakeGitHub refused a request to ${url.hostname}`)
    const route = `${url.pathname}${url.search}`
    this.calls.push({ method, path: route, token })
    const fault = this.faults.find((item) => item.method === method && item.pattern.test(route) && item.times > 0)
    if (fault) {
      fault.times -= 1
      if (fault.network) throw new TypeError('fetch failed')
      return json(fault.status, { message: 'injected failure' }, fault.headers)
    }
    if (!token) return json(401, { message: 'Requires authentication' })
    const body = typeof init.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : {}
    return this.route(method, url, body)
  }

  private archive(owner: string, name: string, commitSha: string): Response {
    const repo = this.repo(owner, name)
    const commit = this.commits.get(commitSha)
    if (!repo || !commit) return json(404, { message: 'Not Found' })
    const tree = this.trees.get(commit.tree)!
    const prefix = `${owner}-${name}-${commitSha.slice(0, 7)}`
    const entries: RawEntry[] = [{ path: `${prefix}/`, type: '5' }]
    for (const [file, data] of [...tree.entries()].sort()) entries.push({ path: `${prefix}/${file}`, data })
    return new Response(new Uint8Array(makeTarGz(entries)), { status: 200, headers: { 'content-type': 'application/x-gzip' } })
  }

  private repoJson(repo: Repo): Record<string, unknown> {
    return {
      id: repo.id,
      name: repo.name,
      full_name: `${repo.owner}/${repo.name}`,
      owner: { login: repo.owner },
      private: repo.private,
      is_template: repo.is_template,
      default_branch: repo.default_branch,
      html_url: `https://github.com/${repo.owner}/${repo.name}`,
    }
  }

  private commitJson(repo: Repo, commit: Commit): Record<string, unknown> {
    return {
      sha: commit.sha,
      html_url: `https://github.com/${repo.owner}/${repo.name}/commit/${commit.sha}`,
      commit: { message: commit.message, tree: { sha: commit.tree }, author: { name: 'Owner', date: commit.date }, committer: { date: commit.date } },
    }
  }

  private route(method: string, url: URL, body: Record<string, unknown>): Response {
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent)
    if (method === 'GET' && parts.length === 1 && parts[0] === 'user') return json(200, { login: 'studio-owner' })
    if (parts[0] !== 'repos' || parts.length < 3) return json(404, { message: 'Not Found' })
    const [, owner = '', name = '', ...rest] = parts
    const repo = this.repo(owner, name)
    const key = `${owner}/${name}`.toLowerCase()
    if (method === 'POST' && rest[0] === 'generate') {
      if (!repo?.is_template) return json(404, { message: 'Not Found' })
      const targetOwner = String(body.owner)
      const targetName = String(body.name)
      if (this.repo(targetOwner, targetName)) return json(422, { message: 'Name already exists on this account' })
      const created = this.addRepo(targetOwner, targetName, this.headTree(owner, name), { private: this.forcePublic ? false : body.private === true })
      this.pendingReads.set(`${targetOwner}/${targetName}`.toLowerCase(), this.generationDelay)
      return json(201, this.repoJson(created))
    }
    if (!repo) return json(404, { message: 'Not Found' })
    if (rest.length === 0) {
      if (method === 'GET') return json(200, this.repoJson(repo))
      if (method === 'DELETE') {
        if (this.deleteForbidden) return json(403, { message: 'Must have admin rights to Repository.' })
        this.repos.delete(key)
        return new Response(null, { status: 204 })
      }
    }
    if (method === 'GET' && rest[0] === 'commits' && rest.length === 2) {
      const pending = this.pendingReads.get(key) ?? 0
      if (pending > 0) {
        this.pendingReads.set(key, pending - 1)
        return json(409, { message: 'Git Repository is empty.' })
      }
      if (rest[1] !== repo.default_branch || !repo.head) return json(404, { message: 'No commit found' })
      return json(200, this.commitJson(repo, this.commits.get(repo.head)!))
    }
    if (method === 'GET' && rest[0] === 'commits' && rest.length === 1) {
      const out: Record<string, unknown>[] = []
      let cursor = repo.head
      while (cursor && out.length < 20) {
        const commit = this.commits.get(cursor)!
        out.push(this.commitJson(repo, commit))
        cursor = commit.parent
      }
      return json(200, out)
    }
    if (method === 'GET' && rest[0] === 'pulls') {
      return json(
        200,
        repo.pulls.map((pull) => ({ number: pull.number, title: pull.title, html_url: `https://github.com/${repo.owner}/${repo.name}/pull/${pull.number}`, head: { ref: pull.head }, draft: pull.draft, updated_at: new Date().toISOString() })),
      )
    }
    if (method === 'GET' && rest[0] === 'tarball' && rest[1]) {
      if (this.tarballRedirect) return new Response(null, { status: 302, headers: { location: this.tarballRedirect.replace('{sha}', rest[1]) } })
      return this.archive(repo.owner, repo.name, rest[1])
    }
    if (method === 'POST' && rest[0] === 'git' && rest[1] === 'blobs') {
      const id = sha()
      this.blobs.set(id, Buffer.from(String(body.content), 'base64'))
      return json(201, { sha: id })
    }
    if (method === 'POST' && rest[0] === 'git' && rest[1] === 'trees') {
      const base = this.trees.get(String(body.base_tree))
      if (!base) return json(422, { message: 'base_tree is invalid' })
      const tree = new Map(base)
      for (const entry of body.tree as Array<{ path: string; sha: string | null }>) {
        if (entry.sha === null) tree.delete(entry.path)
        else {
          const blob = this.blobs.get(entry.sha)
          if (!blob) return json(422, { message: 'blob missing' })
          tree.set(entry.path, blob)
        }
      }
      const id = sha()
      this.trees.set(id, tree)
      return json(201, { sha: id })
    }
    if (method === 'POST' && rest[0] === 'git' && rest[1] === 'commits') {
      const parents = body.parents as string[]
      const commit: Commit = { sha: sha(), tree: String(body.tree), parent: parents[0] ?? null, message: String(body.message), date: new Date().toISOString() }
      if (!this.trees.has(commit.tree)) return json(422, { message: 'tree missing' })
      this.commits.set(commit.sha, commit)
      return json(201, { sha: commit.sha })
    }
    if (method === 'PATCH' && rest[0] === 'git' && rest[1] === 'refs' && rest[2] === 'heads') {
      const commit = this.commits.get(String(body.sha))
      if (!commit) return json(422, { message: 'Object does not exist' })
      if (body.force !== false || commit.parent !== repo.head) return json(422, { message: 'Update is not a fast forward' })
      repo.head = commit.sha
      return json(200, { ref: `refs/heads/${rest.slice(3).join('/')}`, object: { sha: commit.sha } })
    }
    return json(404, { message: 'Not Found' })
  }
}
