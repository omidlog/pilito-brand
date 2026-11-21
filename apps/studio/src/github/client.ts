/**
 * Minimal GitHub REST client for Studio.
 *
 * - Talks only to api.github.com, and follows a tarball redirect only to codeload.github.com.
 * - Tokens go in the Authorization header and nowhere else. Errors never include a token, a response
 *   body or a URL with a query string.
 * - Transient failures (network, 5xx, 429, secondary rate limits) are retried a bounded number of times
 *   with exponential backoff. Client errors are not retried.
 * - `fetch` and `sleep` are injected so tests run against an in-memory fake and never reach the network.
 */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export type GitHubErrorKind = 'not_found' | 'unauthorized' | 'forbidden' | 'conflict' | 'invalid' | 'rate_limited' | 'transient' | 'too_large'

export class GitHubError extends Error {
  constructor(
    readonly kind: GitHubErrorKind,
    readonly status: number,
    message: string,
  ) {
    super(message)
  }

  get retryable(): boolean {
    return this.kind === 'transient' || this.kind === 'rate_limited'
  }
}

export interface RepoInfo {
  id: number
  owner: string
  name: string
  full_name: string
  private: boolean
  is_template: boolean
  default_branch: string
  html_url: string
}

export interface BranchHead {
  sha: string
  tree_sha: string
  committed_at: string | null
}

export interface CommitSummary {
  sha: string
  title: string
  author: string | null
  date: string | null
  html_url: string
}

export interface PullSummary {
  number: number
  title: string
  html_url: string
  head_ref: string
  draft: boolean
  updated_at: string | null
}

export interface TreeEntry {
  path: string
  mode: '100644'
  type: 'blob'
  sha: string | null
}

export interface GitHubOptions {
  token: string | null
  fetch?: FetchLike
  sleep?: (ms: number) => Promise<void>
  maxAttempts?: number
  baseDelayMs?: number
  maxTarballBytes?: number
}

export const GITHUB_API = 'https://api.github.com'
const CODELOAD_HOST = 'codeload.github.com'
const SHA_RE = /^[0-9a-f]{40}$/
const BRANCH_RE = /^[A-Za-z0-9._/-]{1,200}$/

function text(value: unknown, max = 300): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function githubUrl(value: unknown): string {
  const url = text(value, 500)
  return url.startsWith('https://github.com/') ? url : ''
}

function toRepo(raw: Record<string, unknown>): RepoInfo {
  const owner = (raw.owner as Record<string, unknown> | undefined)?.login
  return {
    id: Number(raw.id),
    owner: text(owner, 100),
    name: text(raw.name, 100),
    full_name: text(raw.full_name, 200),
    private: raw.private === true,
    is_template: raw.is_template === true,
    default_branch: BRANCH_RE.test(text(raw.default_branch)) ? text(raw.default_branch) : 'main',
    html_url: githubUrl(raw.html_url),
  }
}

function classify(status: number, retryAfter: number | null): GitHubErrorKind {
  if (status === 404) return 'not_found'
  if (status === 401) return 'unauthorized'
  if (status === 403 || status === 429) return retryAfter !== null || status === 429 ? 'rate_limited' : 'forbidden'
  if (status === 409) return 'conflict'
  if (status === 422 || status === 400) return 'invalid'
  if (status >= 500) return 'transient'
  return 'invalid'
}

function seg(value: string): string {
  return encodeURIComponent(value)
}

export class GitHubClient {
  private readonly fetchImpl: FetchLike
  private readonly sleep: (ms: number) => Promise<void>
  private readonly maxAttempts: number
  private readonly baseDelayMs: number
  private readonly maxTarballBytes: number

  constructor(private readonly options: GitHubOptions) {
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init))
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
    this.maxAttempts = options.maxAttempts ?? 4
    this.baseDelayMs = options.baseDelayMs ?? 400
    this.maxTarballBytes = options.maxTarballBytes ?? 60 * 1024 * 1024
  }

  get configured(): boolean {
    return this.options.token !== null
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    if (!this.options.token) throw new GitHubError('unauthorized', 0, 'GitHub access is not configured.')
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${this.options.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'brand-os-studio',
      ...extra,
    }
  }

  /** One request with retries. `label` names the operation in errors instead of the URL. */
  private async request(method: string, apiPath: string, label: string, body?: unknown, init: RequestInit = {}): Promise<Response> {
    let lastError: GitHubError | null = null
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      let response: Response
      try {
        response = await this.fetchImpl(`${GITHUB_API}${apiPath}`, {
          method,
          headers: this.headers(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          body: body === undefined ? undefined : JSON.stringify(body),
          redirect: 'manual',
          signal: AbortSignal.timeout(30_000),
          ...init,
        })
      } catch (error) {
        if (error instanceof GitHubError) throw error
        lastError = new GitHubError('transient', 0, `${label}: GitHub could not be reached.`)
        if (attempt < this.maxAttempts) await this.sleep(this.baseDelayMs * 2 ** (attempt - 1))
        continue
      }
      if (response.status < 400) return response
      const retryAfterHeader = response.headers.get('retry-after')
      const retryAfter = retryAfterHeader !== null && /^\d+$/.test(retryAfterHeader) ? Number(retryAfterHeader) : null
      const remaining = response.headers.get('x-ratelimit-remaining')
      const kind = classify(response.status, retryAfter ?? (remaining === '0' ? 60 : null))
      await response.body?.cancel().catch(() => undefined)
      lastError = new GitHubError(kind, response.status, `${label}: GitHub answered ${response.status}.`)
      if (!lastError.retryable || attempt === this.maxAttempts) throw lastError
      const wait = Math.min(retryAfter !== null ? retryAfter * 1000 : this.baseDelayMs * 2 ** (attempt - 1), 30_000)
      await this.sleep(wait)
    }
    throw lastError ?? new GitHubError('transient', 0, `${label}: GitHub request failed.`)
  }

  private async json<T>(method: string, apiPath: string, label: string, body?: unknown): Promise<T> {
    const response = await this.request(method, apiPath, label, body)
    try {
      return (await response.json()) as T
    } catch {
      throw new GitHubError('transient', response.status, `${label}: GitHub returned an unreadable response.`)
    }
  }

  async viewer(): Promise<{ login: string }> {
    const raw = await this.json<Record<string, unknown>>('GET', '/user', 'Connection test')
    return { login: text(raw.login, 100) }
  }

  /** Returns null for a repository that does not exist or that this token cannot see. */
  async getRepo(owner: string, repo: string): Promise<RepoInfo | null> {
    try {
      return toRepo(await this.json<Record<string, unknown>>('GET', `/repos/${seg(owner)}/${seg(repo)}`, 'Read repository'))
    } catch (error) {
      if (error instanceof GitHubError && error.kind === 'not_found') return null
      throw error
    }
  }

  /** Creates a repository from a template. Always private; the caller verifies the result. */
  async generateFromTemplate(input: { templateOwner: string; templateRepo: string; owner: string; name: string; description: string }): Promise<RepoInfo> {
    const raw = await this.json<Record<string, unknown>>(
      'POST',
      `/repos/${seg(input.templateOwner)}/${seg(input.templateRepo)}/generate`,
      'Create repository from template',
      { owner: input.owner, name: input.name, description: input.description.slice(0, 300), private: true, include_all_branches: false },
    )
    return toRepo(raw)
  }

  async getBranchHead(owner: string, repo: string, branch: string): Promise<BranchHead> {
    if (!BRANCH_RE.test(branch)) throw new GitHubError('invalid', 0, 'Invalid branch name.')
    const raw = await this.json<Record<string, unknown>>('GET', `/repos/${seg(owner)}/${seg(repo)}/commits/${seg(branch)}`, 'Read default branch')
    const sha = text(raw.sha, 40)
    const commit = raw.commit as Record<string, unknown> | undefined
    const tree = text((commit?.tree as Record<string, unknown> | undefined)?.sha, 40)
    if (!SHA_RE.test(sha) || !SHA_RE.test(tree)) throw new GitHubError('invalid', 0, 'Read default branch: unexpected commit format.')
    const committer = commit?.committer as Record<string, unknown> | undefined
    return { sha, tree_sha: tree, committed_at: text(committer?.date, 40) || null }
  }

  /** Downloads the repository archive at an exact commit. */
  async getTarball(owner: string, repo: string, sha: string): Promise<Buffer> {
    if (!SHA_RE.test(sha)) throw new GitHubError('invalid', 0, 'Invalid commit id.')
    let response = await this.request('GET', `/repos/${seg(owner)}/${seg(repo)}/tarball/${sha}`, 'Download repository archive')
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location') ?? ''
      let target: URL
      try {
        target = new URL(location)
      } catch {
        throw new GitHubError('invalid', response.status, 'Download repository archive: invalid redirect.')
      }
      if (target.protocol !== 'https:' || target.hostname !== CODELOAD_HOST) {
        throw new GitHubError('invalid', response.status, 'Download repository archive: redirect to an unexpected host was refused.')
      }
      try {
        // The signed codeload URL carries its own short-lived grant; the Studio token is not sent there.
        response = await this.fetchImpl(target.toString(), { redirect: 'error', signal: AbortSignal.timeout(60_000) })
      } catch {
        throw new GitHubError('transient', 0, 'Download repository archive: GitHub could not be reached.')
      }
      if (!response.ok) throw new GitHubError(classify(response.status, null), response.status, `Download repository archive: GitHub answered ${response.status}.`)
    }
    const declared = Number(response.headers.get('content-length') ?? '0')
    if (declared > this.maxTarballBytes) throw new GitHubError('too_large', response.status, 'Repository archive is larger than Studio accepts.')
    const reader = response.body?.getReader()
    if (!reader) return Buffer.alloc(0)
    const chunks: Buffer[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > this.maxTarballBytes) {
        await reader.cancel()
        throw new GitHubError('too_large', response.status, 'Repository archive is larger than Studio accepts.')
      }
      chunks.push(Buffer.from(value))
    }
    return Buffer.concat(chunks)
  }

  async createBlob(owner: string, repo: string, content: Buffer): Promise<string> {
    const raw = await this.json<Record<string, unknown>>('POST', `/repos/${seg(owner)}/${seg(repo)}/git/blobs`, 'Create file content', {
      content: content.toString('base64'),
      encoding: 'base64',
    })
    const sha = text(raw.sha, 40)
    if (!SHA_RE.test(sha)) throw new GitHubError('invalid', 0, 'Create file content: unexpected response.')
    return sha
  }

  async createTree(owner: string, repo: string, baseTree: string, entries: TreeEntry[]): Promise<string> {
    const raw = await this.json<Record<string, unknown>>('POST', `/repos/${seg(owner)}/${seg(repo)}/git/trees`, 'Create tree', { base_tree: baseTree, tree: entries })
    const sha = text(raw.sha, 40)
    if (!SHA_RE.test(sha)) throw new GitHubError('invalid', 0, 'Create tree: unexpected response.')
    return sha
  }

  async createCommit(owner: string, repo: string, input: { message: string; tree: string; parent: string }): Promise<string> {
    const raw = await this.json<Record<string, unknown>>('POST', `/repos/${seg(owner)}/${seg(repo)}/git/commits`, 'Create commit', {
      message: input.message,
      tree: input.tree,
      parents: [input.parent],
    })
    const sha = text(raw.sha, 40)
    if (!SHA_RE.test(sha)) throw new GitHubError('invalid', 0, 'Create commit: unexpected response.')
    return sha
  }

  /** Fast-forward only. A concurrent push makes this fail instead of being overwritten. */
  async fastForward(owner: string, repo: string, branch: string, sha: string): Promise<void> {
    if (!BRANCH_RE.test(branch)) throw new GitHubError('invalid', 0, 'Invalid branch name.')
    await this.json('PATCH', `/repos/${seg(owner)}/${seg(repo)}/git/refs/heads/${branch.split('/').map(seg).join('/')}`, 'Update branch', { sha, force: false })
  }

  async deleteRepo(owner: string, repo: string): Promise<void> {
    await this.request('DELETE', `/repos/${seg(owner)}/${seg(repo)}`, 'Delete partially created repository')
  }

  async listCommits(owner: string, repo: string, branch: string, limit = 20): Promise<CommitSummary[]> {
    const raw = await this.json<Array<Record<string, unknown>>>('GET', `/repos/${seg(owner)}/${seg(repo)}/commits?sha=${seg(branch)}&per_page=${limit}`, 'Read history')
    return (Array.isArray(raw) ? raw : []).slice(0, limit).flatMap((item) => {
      const sha = text(item.sha, 40)
      if (!SHA_RE.test(sha)) return []
      const commit = item.commit as Record<string, unknown> | undefined
      const author = commit?.author as Record<string, unknown> | undefined
      return [{ sha, title: text(commit?.message, 2000).split('\n')[0]?.slice(0, 200) ?? '', author: text(author?.name, 100) || null, date: text(author?.date, 40) || null, html_url: githubUrl(item.html_url) }]
    })
  }

  async listOpenPulls(owner: string, repo: string, limit = 20): Promise<PullSummary[]> {
    const raw = await this.json<Array<Record<string, unknown>>>('GET', `/repos/${seg(owner)}/${seg(repo)}/pulls?state=open&per_page=${limit}`, 'Read pull requests')
    return (Array.isArray(raw) ? raw : []).slice(0, limit).map((item) => ({
      number: Number(item.number) || 0,
      title: text(item.title, 200),
      html_url: githubUrl(item.html_url),
      head_ref: text((item.head as Record<string, unknown> | undefined)?.ref, 200),
      draft: item.draft === true,
      updated_at: text(item.updated_at, 40) || null,
    }))
  }
}
