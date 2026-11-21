import fs from 'node:fs'
import path from 'node:path'
import type { StudioConfig } from './config.js'
import { GitHubClient, type FetchLike } from './github/client.js'
import { ProvisioningService } from './provision.js'
import { Registry } from './registry.js'
import { createStudio } from './server.js'
import { SyncService } from './sync.js'

/** Wires the services. Tests pass `fetch` (an in-memory GitHub) and `sleep`; production uses the defaults. */
export function buildStudio(config: StudioConfig, options: { fetch?: FetchLike; sleep?: (ms: number) => Promise<void>; now?: () => number; log?: (line: string) => void } = {}) {
  fs.mkdirSync(config.dataDir, { recursive: true, mode: 0o700 })
  const registry = new Registry(config.dataDir)
  const readClient = new GitHubClient({ token: config.github.readToken, fetch: options.fetch, sleep: options.sleep })
  const provisionClient = new GitHubClient({ token: config.github.provisionToken, fetch: options.fetch, sleep: options.sleep })
  const now = options.now ?? Date.now
  const sync = new SyncService({ registry, github: readClient, dataDir: config.dataDir, ttlMs: config.syncTtlMs, now: () => new Date(now()), log: options.log })
  const workDir = path.join(config.dataDir, 'work')
  fs.mkdirSync(workDir, { recursive: true, mode: 0o700 })
  const provisioning = new ProvisioningService({
    registry,
    github: provisionClient,
    templateOwner: config.github.templateOwner,
    templateRepo: config.github.templateRepo,
    allowedOwners: config.github.provisionToken ? config.github.allowedOwners : [],
    workDir,
    sleep: options.sleep,
    now: () => new Date(now()),
    onReady: (slug) => void sync.refresh(slug).catch(() => undefined),
    log: options.log,
  })
  const studio = createStudio({ config, registry, sync, provisioning, readClient, provisionClient, now, log: options.log })
  return { ...studio, registry, sync, provisioning, readClient, provisionClient }
}
