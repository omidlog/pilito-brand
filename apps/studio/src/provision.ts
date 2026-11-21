import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { applyInit, assertSlug, personalInit } from '@brand-os/brand-core'
import { parse } from 'yaml'
import { validOwner, validRepoName } from './config.js'
import type { GitHubClient, RepoInfo } from './github/client.js'
import { GitHubError } from './github/client.js'
import { extractTarGz, studioPathAllowed } from './github/tar.js'
import { PROVISION_STEPS, type BrandRecord, type CleanupState, type ProvisionRequest, type ProvisionStep, type Registry } from './registry.js'

/**
 * Owner-only provisioning of one new private brand repository. This is Studio's single write path.
 *
 * 1. Validate the request (slug, profile, facets, locales, destination owner allowlist).
 * 2. Check that the template exists and is a template repository.
 * 3. Refuse a destination repository that already exists, unless Studio created it in an earlier attempt.
 * 4. Generate the repository from the template with `private: true`, then verify it really is private.
 * 5. Wait until GitHub has copied the template content.
 * 6. Download the archive, extract only `brand/` (never `.private`), run the core `applyInit` exactly as
 *    `brand:init` does, and compute the changed files. Nothing outside `brand/` can change.
 * 7. Commit those files on top of the template commit and fast-forward the default branch.
 * 8. Verify privacy and the new head, then mark the brand ready.
 *
 * A failure after the repository was created in the same attempt deletes it (partial-create cleanup).
 * If deletion is not permitted, the record says cleanup is required. A retry resumes against a
 * repository whose id Studio recorded, and skips the commit when the brand is already initialized.
 */
export const LOCALES = ['en', 'fa', 'tr'] as const
export type Locale = (typeof LOCALES)[number]

export type ValidationCode =
  | 'name_required'
  | 'name_too_long'
  | 'slug_invalid'
  | 'profile_invalid'
  | 'facet_invalid'
  | 'locale_invalid'
  | 'owner_not_allowed'
  | 'repo_invalid'

export type StartCode = 'not_configured' | 'duplicate' | 'busy' | 'not_failed' | 'unknown_brand'

export interface ProvisionDeps {
  registry: Registry
  github: GitHubClient
  templateOwner: string
  templateRepo: string
  allowedOwners: string[]
  workDir: string
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  onReady?: (slug: string) => void
  log?: (line: string) => void
}

/** Path segments Studio uses itself under /brands/. */
const RESERVED_SLUGS = new Set(['new'])
// eslint-disable-next-line no-control-regex -- refusing control characters is the point
const CONTROL = /[\u0000-\u001f\u007f]/

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  return typeof value === 'string' ? [value] : []
}

function flag(value: unknown): boolean {
  return value === true || value === 'on' || value === 'true' || value === 'yes'
}

export function validateRequest(input: Record<string, unknown>, allowedOwners: string[]): { request: ProvisionRequest | null; errors: Partial<Record<string, ValidationCode>> } {
  const errors: Partial<Record<string, ValidationCode>> = {}
  const name = typeof input.name === 'string' ? input.name.trim().normalize('NFC') : ''
  if (!name || CONTROL.test(name)) errors.name = 'name_required'
  else if ([...name].length > 80) errors.name = 'name_too_long'
  const slug = typeof input.slug === 'string' ? input.slug.trim() : ''
  try {
    assertSlug(slug)
    if (slug.length < 2 || slug.length > 60 || RESERVED_SLUGS.has(slug)) throw new Error('length')
  } catch {
    errors.slug = 'slug_invalid'
  }
  const profile = input.profile === 'personal-brand' ? 'personal-brand' : input.profile === 'business' ? 'business' : null
  if (!profile) errors.profile = 'profile_invalid'
  const facets = [...new Set(strings(input.facets).map((item) => item.trim()).filter(Boolean))]
  if (profile === 'business' && facets.length) errors.facets = 'facet_invalid'
  else {
    try {
      personalInit({ profile: profile === 'personal-brand' ? 'personal-brand' : 'universal', facets })
    } catch {
      errors.facets = 'facet_invalid'
    }
  }
  const defaultLocale = typeof input.default_locale === 'string' ? input.default_locale : 'en'
  const locales = [...new Set([defaultLocale, ...strings(input.locales)])]
  if (!locales.every((locale): locale is Locale => (LOCALES as readonly string[]).includes(locale))) errors.locales = 'locale_invalid'
  const owner = typeof input.owner === 'string' ? input.owner.trim() : ''
  if (!validOwner(owner) || !allowedOwners.some((allowed) => allowed.toLowerCase() === owner.toLowerCase())) errors.owner = 'owner_not_allowed'
  const repo = (typeof input.repo === 'string' && input.repo.trim()) || slug
  if (!validRepoName(repo)) errors.repo = 'repo_invalid'
  if (Object.keys(errors).length) return { request: null, errors }
  return {
    request: {
      name,
      slug,
      profile: profile as ProvisionRequest['profile'],
      facets,
      default_locale: defaultLocale as Locale,
      locales: locales as Locale[],
      mascot: flag(input.mascot),
      gamification: flag(input.gamification),
      owner: allowedOwners.find((allowed) => allowed.toLowerCase() === owner.toLowerCase()) ?? owner,
      repo,
    },
    errors,
  }
}

class StepError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

function hashTree(root: string): Map<string, string> {
  const out = new Map<string, string>()
  const walk = (dir: string): void => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile()) out.set(path.relative(root, full).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'))
    }
  }
  walk(path.join(root, 'brand'))
  return out
}

export interface InitChanges {
  write: Array<{ path: string; content: Buffer }>
  remove: string[]
}

/** Runs the core initializer on an extracted checkout and returns the file changes. */
export function initializeCheckout(root: string, request: ProvisionRequest): InitChanges {
  const before = hashTree(root)
  applyInit(root, {
    name: request.name,
    slug: request.slug,
    industry: 'TBD',
    language: request.default_locale,
    languages: request.locales,
    mascot: request.mascot,
    gamification: request.gamification,
    publish: 'private',
    profile: request.profile === 'personal-brand' ? 'personal-brand' : 'universal',
    personal: request.profile === 'personal-brand',
    facets: request.facets,
  })
  const after = hashTree(root)
  const write: InitChanges['write'] = []
  const remove: string[] = []
  // Local-only output (gitignored restricted drafts, anything under brand/.private) is never committed.
  // Those paths are exactly the ones Studio refuses to read, so the same allowlist decides both.
  for (const [file, digest] of after) {
    if (before.get(file) !== digest && studioPathAllowed(file)) write.push({ path: file, content: fs.readFileSync(path.join(root, file)) })
  }
  for (const file of before.keys()) if (!after.has(file) && studioPathAllowed(file)) remove.push(file)
  return { write, remove }
}

function readConfig(root: string): { slug?: string; initialized?: boolean } | null {
  const file = path.join(root, 'brand', 'brand.config.yaml')
  if (!fs.existsSync(file)) return null
  const config = parse(fs.readFileSync(file, 'utf8')) as { brand?: { slug?: string; initialized?: boolean } } | null
  return config?.brand ?? null
}

export class ProvisioningService {
  private readonly inflight = new Map<string, Promise<void>>()
  private readonly sleep: (ms: number) => Promise<void>
  private readonly now: () => Date

  constructor(private readonly deps: ProvisionDeps) {
    this.sleep = deps.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
    this.now = deps.now ?? (() => new Date())
    this.recoverInterrupted()
  }

  get configured(): boolean {
    return this.deps.github.configured && this.deps.allowedOwners.length > 0
  }

  get allowedOwners(): string[] {
    return [...this.deps.allowedOwners]
  }

  /** A record left `running` by a crash or restart is marked failed so the owner can see and retry it. */
  private recoverInterrupted(): void {
    for (const brand of this.deps.registry.list()) {
      if (brand.provisioning?.state !== 'running') continue
      const created = brand.provisioning.steps.some((step) => step.id === 'create_repository' && step.status === 'done')
      brand.provisioning.state = 'failed'
      brand.provisioning.error = { code: 'interrupted', message: 'Studio stopped while this repository was being created.' }
      brand.provisioning.cleanup = created ? 'required' : 'not_needed'
      brand.provisioning.steps = brand.provisioning.steps.map((step) => (step.status === 'running' ? { ...step, status: 'failed' } : step))
      this.deps.registry.upsert(brand)
    }
  }

  private lockKeys(request: ProvisionRequest): string[] {
    return [`slug:${request.slug}`, `repo:${request.owner.toLowerCase()}/${request.repo.toLowerCase()}`]
  }

  /** Resolves when the job for this slug (if any) finishes. Used by tests and graceful shutdown. */
  async settled(slug?: string): Promise<void> {
    const jobs = slug ? [this.inflight.get(`slug:${slug}`)] : [...this.inflight.values()]
    await Promise.allSettled(jobs.filter(Boolean) as Promise<void>[])
  }

  start(request: ProvisionRequest, actor: string): { ok: true } | { ok: false; code: StartCode } {
    if (!this.configured) return { ok: false, code: 'not_configured' }
    if (this.lockKeys(request).some((key) => this.inflight.has(key))) return { ok: false, code: 'busy' }
    if (this.deps.registry.get(request.slug) || this.deps.registry.byRepoName(request.owner, request.repo)) return { ok: false, code: 'duplicate' }
    const at = this.now().toISOString()
    const record: BrandRecord = {
      slug: request.slug,
      display_name: request.name,
      profile: request.profile,
      repo: { owner: request.owner, name: request.repo, id: null, html_url: '', default_branch: 'main' },
      source: 'provisioned',
      created_at: at,
      created_by: actor,
      provisioning: {
        state: 'running',
        attempts: 1,
        started_at: at,
        finished_at: null,
        steps: PROVISION_STEPS.map((id) => ({ id, status: 'pending' as const })),
        error: null,
        cleanup: 'not_needed',
        request,
        initial_commit: null,
      },
    }
    this.deps.registry.upsert(record)
    this.launch(request)
    return { ok: true }
  }

  retry(slug: string): { ok: true } | { ok: false; code: StartCode } {
    if (!this.configured) return { ok: false, code: 'not_configured' }
    const record = this.deps.registry.get(slug)
    if (!record?.provisioning) return { ok: false, code: 'unknown_brand' }
    if (record.provisioning.state !== 'failed') return { ok: false, code: 'not_failed' }
    const request = record.provisioning.request
    if (this.lockKeys(request).some((key) => this.inflight.has(key))) return { ok: false, code: 'busy' }
    record.provisioning = {
      ...record.provisioning,
      state: 'running',
      attempts: record.provisioning.attempts + 1,
      started_at: this.now().toISOString(),
      finished_at: null,
      error: null,
      steps: PROVISION_STEPS.map((id) => ({ id, status: 'pending' as const })),
    }
    this.deps.registry.upsert(record)
    this.launch(request)
    return { ok: true }
  }

  private launch(request: ProvisionRequest): void {
    const keys = this.lockKeys(request)
    const job = this.run(request).finally(() => {
      for (const key of keys) this.inflight.delete(key)
    })
    for (const key of keys) this.inflight.set(key, job)
  }

  private update(slug: string, change: (record: BrandRecord) => void): BrandRecord {
    const record = this.deps.registry.get(slug)
    if (!record?.provisioning) throw new Error('Provisioning record disappeared.')
    change(record)
    this.deps.registry.upsert(record)
    return record
  }

  private mark(slug: string, step: ProvisionStep, status: 'running' | 'done' | 'failed' | 'skipped'): void {
    this.update(slug, (record) => {
      record.provisioning!.steps = record.provisioning!.steps.map((item) => (item.id === step ? { ...item, status } : item))
    })
  }

  private async step<T>(slug: string, step: ProvisionStep, work: () => Promise<T>): Promise<T> {
    this.mark(slug, step, 'running')
    try {
      const result = await work()
      this.mark(slug, step, 'done')
      return result
    } catch (error) {
      this.mark(slug, step, 'failed')
      throw error
    }
  }

  private async run(request: ProvisionRequest): Promise<void> {
    const { github, templateOwner, templateRepo } = this.deps
    const slug = request.slug
    let createdNow: RepoInfo | null = null
    const work = fs.mkdtempSync(path.join(this.deps.workDir, `provision-${slug}-`))
    try {
      await this.step(slug, 'validate', async () => {
        const { errors } = validateRequest({ ...request }, this.deps.allowedOwners)
        if (Object.keys(errors).length) throw new StepError('invalid_request', 'The request is no longer valid.')
      })
      await this.step(slug, 'check_template', async () => {
        const template = await github.getRepo(templateOwner, templateRepo)
        if (!template) throw new StepError('template_unavailable', 'The Brand OS template repository is not reachable with the provisioning access.')
        if (!template.is_template) throw new StepError('template_unavailable', 'The configured template repository is not marked as a GitHub template.')
      })
      const known = this.deps.registry.get(slug)?.repo.id ?? null
      let repo = await this.step(slug, 'check_destination', async () => {
        const existing = await github.getRepo(request.owner, request.repo)
        if (!existing) return null
        if (known !== null && existing.id === known) return existing
        throw new StepError('destination_exists', 'A repository with this name already exists. Choose another name.')
      })
      if (repo) {
        this.mark(slug, 'create_repository', 'skipped')
      } else {
        repo = await this.step(slug, 'create_repository', async () => {
          let created: RepoInfo
          try {
            created = await github.generateFromTemplate({
              templateOwner,
              templateRepo,
              owner: request.owner,
              name: request.repo,
              description: `Brand OS repository for ${request.name}`,
            })
          } catch (error) {
            if (error instanceof GitHubError && error.kind === 'invalid') {
              throw new StepError('destination_exists', 'GitHub refused the name. It may already exist or be invalid.')
            }
            throw error
          }
          createdNow = created
          this.update(slug, (record) => {
            record.repo = { owner: created.owner || request.owner, name: created.name || request.repo, id: created.id, html_url: created.html_url, default_branch: created.default_branch }
          })
          return created
        })
      }
      if (!repo.private) throw new StepError('not_private', 'GitHub reported the new repository as public. Studio never keeps a public brand repository.')
      const target = repo
      const head = await this.step(slug, 'wait_for_content', async () => {
        for (let attempt = 1; ; attempt += 1) {
          try {
            return await github.getBranchHead(request.owner, target.name || request.repo, target.default_branch)
          } catch (error) {
            const waiting = error instanceof GitHubError && (error.kind === 'not_found' || error.kind === 'conflict')
            if (!waiting || attempt >= 8) throw error
            await this.sleep(Math.min(500 * 2 ** (attempt - 1), 8000))
          }
        }
      })
      const changes = await this.step(slug, 'initialize', async () => {
        const archive = await github.getTarball(request.owner, target.name || request.repo, head.sha)
        const checkout = path.join(work, 'checkout')
        extractTarGz(archive, { destRoot: checkout, include: studioPathAllowed })
        const config = readConfig(checkout)
        if (!config) throw new StepError('template_invalid', 'The template content has no brand/brand.config.yaml.')
        if (config.initialized === true && config.slug === request.slug) return null
        return initializeCheckout(checkout, request)
      })
      let commit = head.sha
      if (!changes) {
        this.mark(slug, 'commit', 'skipped')
      } else {
        commit = await this.step(slug, 'commit', async () => {
          const owner = request.owner
          const name = target.name || request.repo
          const entries = []
          for (const file of changes.write) entries.push({ path: file.path, mode: '100644' as const, type: 'blob' as const, sha: await github.createBlob(owner, name, file.content) })
          for (const file of changes.remove) entries.push({ path: file, mode: '100644' as const, type: 'blob' as const, sha: null })
          const tree = await github.createTree(owner, name, head.tree_sha, entries)
          const sha = await github.createCommit(owner, name, {
            message: `chore(brand): initialize ${request.slug} with Brand OS Studio\n\nInitial configuration from the Studio new-brand wizard. No brand facts are recorded.`,
            tree,
            parent: head.sha,
          })
          await github.fastForward(owner, name, target.default_branch, sha)
          return sha
        })
      }
      await this.step(slug, 'verify', async () => {
        const fresh = await github.getRepo(request.owner, target.name || request.repo)
        if (!fresh?.private) throw new StepError('not_private', 'The repository is not private.')
        const now = await github.getBranchHead(request.owner, target.name || request.repo, target.default_branch)
        if (now.sha !== commit) throw new StepError('verify_failed', 'The default branch moved during creation. Check the repository on GitHub.')
      })
      this.update(slug, (record) => {
        record.provisioning!.state = 'ready'
        record.provisioning!.finished_at = this.now().toISOString()
        record.provisioning!.initial_commit = commit
        record.provisioning!.error = null
      })
      this.deps.log?.(`provisioned ${slug}`)
      this.deps.onReady?.(slug)
    } catch (error) {
      const code = error instanceof StepError ? error.code : error instanceof GitHubError ? `github_${error.kind}` : 'internal'
      const message = error instanceof StepError || error instanceof GitHubError ? error.message : 'Provisioning failed unexpectedly.'
      let cleanup: CleanupState = 'not_needed'
      const created = createdNow as RepoInfo | null
      if (created) {
        try {
          await github.deleteRepo(request.owner, created.name || request.repo)
          cleanup = 'done'
        } catch {
          cleanup = 'required'
        }
      } else if (this.deps.registry.get(slug)?.provisioning?.cleanup === 'required') {
        cleanup = 'required'
      }
      this.update(slug, (record) => {
        record.provisioning!.state = 'failed'
        record.provisioning!.finished_at = this.now().toISOString()
        record.provisioning!.error = { code, message }
        record.provisioning!.cleanup = cleanup
        if (cleanup === 'done') record.repo = { ...record.repo, id: null, html_url: '' }
      })
      this.deps.log?.(`provisioning failed for ${slug}: ${code}`)
    } finally {
      fs.rmSync(work, { recursive: true, force: true })
    }
  }
}
