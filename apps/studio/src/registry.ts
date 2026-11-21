import fs from 'node:fs'
import path from 'node:path'
import { assertSlug, writeAtomic } from '@brand-os/brand-core'
import { validOwner, validRepoName } from './config.js'

/**
 * The server-side brand-to-repository mapping. This file, not a URL or a query parameter, decides
 * which repository a slug reads. Only the provisioning service and the owner's server CLI add rows.
 */
export type ProvisioningState = 'running' | 'ready' | 'failed'
export type CleanupState = 'not_needed' | 'done' | 'required'
export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

export const PROVISION_STEPS = [
  'validate',
  'check_template',
  'check_destination',
  'create_repository',
  'wait_for_content',
  'initialize',
  'commit',
  'verify',
] as const
export type ProvisionStep = (typeof PROVISION_STEPS)[number]

export interface ProvisionRequest {
  name: string
  slug: string
  profile: 'business' | 'personal-brand'
  facets: string[]
  default_locale: 'en' | 'fa' | 'tr'
  locales: Array<'en' | 'fa' | 'tr'>
  mascot: boolean
  gamification: boolean
  owner: string
  repo: string
}

export interface ProvisioningRecord {
  state: ProvisioningState
  attempts: number
  started_at: string
  finished_at: string | null
  steps: Array<{ id: ProvisionStep; status: StepStatus }>
  error: { code: string; message: string } | null
  cleanup: CleanupState
  request: ProvisionRequest
  initial_commit: string | null
}

export interface BrandRecord {
  slug: string
  display_name: string
  profile: 'business' | 'personal-brand'
  repo: { owner: string; name: string; id: number | null; html_url: string; default_branch: string }
  source: 'provisioned' | 'registered'
  created_at: string
  created_by: string
  provisioning: ProvisioningRecord | null
}

interface RegistryFile {
  schema_version: 1
  brands: BrandRecord[]
}

export class Registry {
  private readonly file: string
  private data: RegistryFile

  constructor(dataDir: string) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 })
    this.file = path.join(dataDir, 'registry.json')
    this.data = this.load()
  }

  private load(): RegistryFile {
    if (!fs.existsSync(this.file)) return { schema_version: 1, brands: [] }
    const raw = JSON.parse(fs.readFileSync(this.file, 'utf8')) as Partial<RegistryFile>
    const brands = Array.isArray(raw.brands) ? raw.brands.filter((brand) => Registry.valid(brand)) : []
    return { schema_version: 1, brands }
  }

  private static valid(brand: BrandRecord): boolean {
    try {
      assertSlug(brand.slug)
    } catch {
      return false
    }
    return validOwner(brand.repo?.owner ?? '') && validRepoName(brand.repo?.name ?? '')
  }

  private save(): void {
    writeAtomic(this.file, `${JSON.stringify(this.data, null, 2)}\n`, { mode: 0o600 })
  }

  list(): BrandRecord[] {
    return this.data.brands.map((brand) => structuredClone(brand))
  }

  /** Exact slug lookup. Anything that is not a valid registered slug returns null. */
  get(slug: string): BrandRecord | null {
    if (typeof slug !== 'string' || slug.length > 100) return null
    const found = this.data.brands.find((brand) => brand.slug === slug)
    return found ? structuredClone(found) : null
  }

  byRepository(id: number, fullName: string): BrandRecord | null {
    const found = this.data.brands.find(
      (brand) => brand.repo.id === id && `${brand.repo.owner}/${brand.repo.name}`.toLowerCase() === fullName.toLowerCase(),
    )
    return found ? structuredClone(found) : null
  }

  byRepoName(owner: string, name: string): BrandRecord | null {
    const found = this.data.brands.find((brand) => brand.repo.owner.toLowerCase() === owner.toLowerCase() && brand.repo.name.toLowerCase() === name.toLowerCase())
    return found ? structuredClone(found) : null
  }

  upsert(record: BrandRecord): void {
    if (!Registry.valid(record)) throw new Error('Refusing to store an invalid brand record.')
    const index = this.data.brands.findIndex((brand) => brand.slug === record.slug)
    if (index === -1) this.data.brands.push(structuredClone(record))
    else this.data.brands[index] = structuredClone(record)
    this.save()
  }

  remove(slug: string): boolean {
    const before = this.data.brands.length
    this.data.brands = this.data.brands.filter((brand) => brand.slug !== slug)
    if (this.data.brands.length === before) return false
    this.save()
    return true
  }
}
