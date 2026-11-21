import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { GitHubClient } from '../../apps/studio/src/github/client.js'
import { ProvisioningService } from '../../apps/studio/src/provision.js'
import { Registry, type ProvisionRequest } from '../../apps/studio/src/registry.js'
import { SyncService } from '../../apps/studio/src/sync.js'
import { FakeGitHub, templateTree } from './fake-github.js'

process.env.BRAND_OS_DATA_KEY ??= crypto.randomBytes(32).toString('base64')

/** Tokens are fake strings. Distinct values let tests prove which capability each call used. */
export const READ_TOKEN = 'fake-read-token-0000000000000000000000'
export const PROVISION_TOKEN = 'fake-provision-token-111111111111111111'
export const TEMPLATE = { owner: 'omidlog', repo: 'brand-os-template' }
export const OWNER = 'brand-owner'

const noSleep = async (): Promise<void> => undefined

export interface Harness {
  dataDir: string
  github: FakeGitHub
  registry: Registry
  provisioning: ProvisioningService
  sync: SyncService
  readClient: GitHubClient
  provisionClient: GitHubClient
}

export function harness(options: { ttlMs?: number; now?: () => Date } = {}): Harness {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-data-'))
  const github = new FakeGitHub()
  github.addRepo(TEMPLATE.owner, TEMPLATE.repo, templateTree(), { private: false, is_template: true })
  const registry = new Registry(dataDir)
  const readClient = new GitHubClient({ token: READ_TOKEN, fetch: github.fetch, sleep: noSleep })
  const provisionClient = new GitHubClient({ token: PROVISION_TOKEN, fetch: github.fetch, sleep: noSleep })
  const sync = new SyncService({ registry, github: readClient, dataDir, ttlMs: options.ttlMs ?? 300_000, now: options.now })
  const provisioning = new ProvisioningService({
    registry,
    github: provisionClient,
    templateOwner: TEMPLATE.owner,
    templateRepo: TEMPLATE.repo,
    allowedOwners: [OWNER],
    workDir: dataDir,
    sleep: noSleep,
    onReady: (slug) => void sync.refresh(slug),
  })
  return { dataDir, github, registry, provisioning, sync, readClient, provisionClient }
}

export function request(overrides: Partial<ProvisionRequest> = {}): ProvisionRequest {
  return {
    name: 'Acme Learning',
    slug: 'acme-learning',
    profile: 'business',
    facets: [],
    default_locale: 'en',
    locales: ['en'],
    mascot: false,
    gamification: false,
    owner: OWNER,
    repo: 'acme-learning-brand',
    ...overrides,
  }
}

export async function provisioned(h: Harness, overrides: Partial<ProvisionRequest> = {}): Promise<ProvisionRequest> {
  const req = request(overrides)
  const started = h.provisioning.start(req, 'owner')
  if (!started.ok) throw new Error(`start failed: ${started.code}`)
  await h.provisioning.settled(req.slug)
  await h.sync.settled()
  const state = h.registry.get(req.slug)?.provisioning?.state
  if (state !== 'ready') throw new Error(`provisioning ended ${state}: ${JSON.stringify(h.registry.get(req.slug)?.provisioning?.error)}`)
  return req
}
