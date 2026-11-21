import fs from 'node:fs'
import path from 'node:path'
import { writeAtomic } from '@brand-os/brand-core'
import type { CommitSummary, GitHubClient, PullSummary } from './github/client.js'
import { GitHubError } from './github/client.js'
import { extractTarGz, studioPathAllowed } from './github/tar.js'
import { buildProjection, ProjectionError, type StudioProjection } from './projection.js'
import type { BrandRecord, Registry } from './registry.js'

/**
 * Fetches the merged default branch of a registered brand repository and caches its safe projection.
 *
 * The canonical Studio view is the last successfully fetched default-branch commit. A failed refresh
 * keeps the previous projection and marks it stale with the error, so the owner never sees a blank page
 * or a silently outdated one. Pull requests are listed as non-canonical metadata only.
 */
export interface SyncStatus {
  state: 'never' | 'ok' | 'error'
  sha: string | null
  committed_at: string | null
  synced_at: string | null
  checked_at: string | null
  attempted_at: string | null
  repo_private: boolean | null
  last_error: { code: string; message: string; at: string } | null
}

export interface History {
  commits: CommitSummary[]
  pulls: PullSummary[]
  error: string | null
}

export interface CachedBrand {
  status: SyncStatus
  projection: StudioProjection | null
  history: History | null
}

interface StateFile extends CachedBrand {
  schema_version: 1
  previews: Record<string, string>
}

export interface SyncDeps {
  registry: Registry
  github: GitHubClient
  dataDir: string
  ttlMs: number
  now?: () => Date
  log?: (line: string) => void
}

const EMPTY: SyncStatus = { state: 'never', sha: null, committed_at: null, synced_at: null, checked_at: null, attempted_at: null, repo_private: null, last_error: null }

export function brandIsReady(record: BrandRecord): boolean {
  return record.provisioning === null || record.provisioning.state === 'ready'
}

export class SyncService {
  private readonly running = new Map<string, Promise<CachedBrand>>()
  private readonly dirty = new Set<string>()
  private readonly now: () => Date

  constructor(private readonly deps: SyncDeps) {
    this.now = deps.now ?? (() => new Date())
    fs.mkdirSync(this.cacheRoot(), { recursive: true, mode: 0o700 })
  }

  private cacheRoot(): string {
    return path.join(this.deps.dataDir, 'cache')
  }

  /** Slugs come from the registry, are validated there, and are checked again here before touching the disk. */
  private dir(slug: string): string {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid slug.')
    return path.join(this.cacheRoot(), slug)
  }

  private readState(slug: string): StateFile | null {
    const file = path.join(this.dir(slug), 'state.json')
    if (!fs.existsSync(file)) return null
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as StateFile
    } catch {
      return null
    }
  }

  get(slug: string): CachedBrand {
    const state = this.readState(slug)
    if (!state) return { status: { ...EMPTY }, projection: null, history: null }
    return { status: state.status, projection: state.projection, history: state.history }
  }

  /** Stale when the last check is older than the TTL, when a refresh failed, or when a webhook said the branch moved. */
  isStale(slug: string, status: SyncStatus): boolean {
    if (status.state === 'never') return true
    if (this.dirty.has(slug)) return true
    if (status.last_error) return true
    if (!status.checked_at) return true
    return this.now().getTime() - Date.parse(status.checked_at) > this.deps.ttlMs
  }

  markDirty(slug: string): void {
    this.dirty.add(slug)
  }

  isRefreshing(slug: string): boolean {
    return this.running.has(slug)
  }

  async settled(): Promise<void> {
    await Promise.allSettled([...this.running.values()])
  }

  /** Path of a cached approved preview file, or null. The key must be one this projection published. */
  previewFile(slug: string, key: string): { file: string; mime: string } | null {
    if (!/^[0-9a-f]{64}$/.test(key)) return null
    const state = this.readState(slug)
    const mime = state?.previews?.[key]
    if (!mime) return null
    const file = path.join(this.dir(slug), 'previews', key)
    return fs.existsSync(file) ? { file, mime } : null
  }

  /** One refresh per slug at a time; concurrent callers share the same promise. */
  refresh(slug: string): Promise<CachedBrand> {
    const current = this.running.get(slug)
    if (current) return current
    const job = this.doRefresh(slug).finally(() => this.running.delete(slug))
    this.running.set(slug, job)
    return job
  }

  private async doRefresh(slug: string): Promise<CachedBrand> {
    const record = this.deps.registry.get(slug)
    if (!record || !brandIsReady(record)) throw new Error('Brand is not ready.')
    const previous = this.readState(slug)
    const at = this.now().toISOString()
    const status: SyncStatus = { ...(previous?.status ?? EMPTY), attempted_at: at }
    const { owner, name, default_branch: branch } = record.repo
    const work = fs.mkdtempSync(path.join(this.deps.dataDir, 'work-sync-'))
    try {
      const repo = await this.deps.github.getRepo(owner, name)
      if (!repo) throw new GitHubError('not_found', 404, 'The repository is not reachable with the Studio read access.')
      if (record.repo.id !== null && repo.id !== record.repo.id) {
        throw new ProjectionError('slug_mismatch', 'The repository at this name is not the one Studio registered. It may have been deleted and recreated.')
      }
      status.repo_private = repo.private
      const head = await this.deps.github.getBranchHead(owner, name, repo.default_branch || branch)
      let projection = previous?.projection ?? null
      let previews = previous?.previews ?? {}
      if (!projection || previous?.status.sha !== head.sha) {
        const archive = await this.deps.github.getTarball(owner, name, head.sha)
        const checkout = path.join(work, 'checkout')
        extractTarGz(archive, { destRoot: checkout, include: studioPathAllowed })
        const built = buildProjection(checkout, slug)
        projection = built.projection
        const previewDir = path.join(this.dir(slug), 'previews')
        fs.rmSync(previewDir, { recursive: true, force: true })
        fs.mkdirSync(previewDir, { recursive: true, mode: 0o700 })
        previews = {}
        for (const preview of built.previews) {
          fs.copyFileSync(preview.source, path.join(previewDir, preview.key))
          previews[preview.key] = preview.mime
        }
        status.synced_at = at
        status.sha = head.sha
        status.committed_at = head.committed_at
      }
      let history: History
      try {
        const [commits, pulls] = await Promise.all([this.deps.github.listCommits(owner, name, repo.default_branch || branch), this.deps.github.listOpenPulls(owner, name)])
        history = { commits, pulls, error: null }
      } catch (error) {
        history = { commits: previous?.history?.commits ?? [], pulls: previous?.history?.pulls ?? [], error: error instanceof GitHubError ? error.message : 'History could not be read.' }
      }
      status.state = 'ok'
      status.checked_at = at
      status.last_error = null
      this.dirty.delete(slug)
      const next: StateFile = { schema_version: 1, status, projection, history, previews }
      fs.mkdirSync(this.dir(slug), { recursive: true, mode: 0o700 })
      writeAtomic(path.join(this.dir(slug), 'state.json'), JSON.stringify(next), { mode: 0o600 })
      return { status, projection, history }
    } catch (error) {
      const code = error instanceof ProjectionError ? error.code : error instanceof GitHubError ? `github_${error.kind}` : 'internal'
      const message = error instanceof ProjectionError || error instanceof GitHubError ? error.message : 'The repository could not be read.'
      status.last_error = { code, message, at }
      status.state = previous?.projection ? 'ok' : 'error'
      // A repository that now belongs to another brand must not keep showing its old projection.
      const keep = code === 'slug_mismatch' ? null : previous
      const next: StateFile = { schema_version: 1, status, projection: keep?.projection ?? null, history: keep?.history ?? null, previews: keep?.previews ?? {} }
      if (code === 'slug_mismatch') {
        status.state = 'error'
        fs.rmSync(path.join(this.dir(slug), 'previews'), { recursive: true, force: true })
      }
      fs.mkdirSync(this.dir(slug), { recursive: true, mode: 0o700 })
      writeAtomic(path.join(this.dir(slug), 'state.json'), JSON.stringify(next), { mode: 0o600 })
      this.deps.log?.(`sync failed for ${slug}: ${code}`)
      return { status, projection: next.projection, history: next.history }
    } finally {
      fs.rmSync(work, { recursive: true, force: true })
    }
  }
}
