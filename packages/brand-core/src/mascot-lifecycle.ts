import fs from 'node:fs'
import path from 'node:path'
import { isMap, isSeq, parse, parseDocument } from 'yaml'
import { writeAtomic } from './fsutil.js'

/**
 * Mascot artwork lifecycle. A catalog row and each of its artwork variants carry one of these states.
 *
 * defined   – the state slot is described; no artwork exists.
 * pending   – artwork is commissioned or in progress; no file yet.
 * created   – a file exists and is registered in the asset manifest.
 * reviewed  – the file was reviewed; not yet approved.
 * approved  – an owner approved the artwork for internal use.
 * published – approved and cleared for public use (guests still need the asset on the publication allowlist).
 * deprecated – retired; never returned.
 */
export const MASCOT_LIFECYCLE = ['defined', 'pending', 'created', 'reviewed', 'approved', 'published', 'deprecated'] as const
export type MascotLifecycle = (typeof MASCOT_LIFECYCLE)[number]

/** Lifecycle states that count as usable artwork. Everything else is never returned by retrieval. */
export const MASCOT_USABLE: readonly MascotLifecycle[] = ['approved', 'published']
const NEEDS_ARTWORK: readonly MascotLifecycle[] = ['created', 'reviewed', 'approved', 'published']
const RANK: Record<MascotLifecycle, number> = { defined: 0, pending: 1, created: 2, reviewed: 3, approved: 4, published: 5, deprecated: -1 }

/** Pre-0.2 values and how they migrate. `draft` and `approved` depend on whether artwork exists. */
const LEGACY = new Set(['not_started', 'draft', 'in_review'])

export function isMascotLifecycle(value: unknown): value is MascotLifecycle {
  return typeof value === 'string' && (MASCOT_LIFECYCLE as readonly string[]).includes(value)
}

export function isUsableLifecycle(value: unknown): boolean {
  return value === 'approved' || value === 'published'
}

type Row = Record<string, unknown>

export interface MascotArtwork {
  id: string
  stage: string
  asset_id: string
  status: MascotLifecycle
  version: string
  angle?: string
  intensity?: string
  outfit?: string
  accessories?: string[]
  preview_asset_id?: string
  animation_refs?: string[]
  license?: { holder: string; terms: string; source?: string; attribution?: string }
}

function artworkOf(state: Row): Row[] {
  return Array.isArray(state.artwork) ? state.artwork.filter((item): item is Row => typeof item === 'object' && item !== null) : []
}

function hasArtwork(state: Row): boolean {
  return artworkOf(state).length > 0 || (Array.isArray(state.source_assets) && state.source_assets.length > 0) || (typeof state.preview === 'string' && state.preview.length > 0)
}

/** The lifecycle a legacy status maps to. Without artwork every legacy state becomes `defined`. */
export function migratedLifecycle(state: Row): MascotLifecycle | null {
  const status = state.status
  if (isMascotLifecycle(status) && !(status === 'approved' && !hasArtwork(state))) return null
  if (status === 'deprecated') return null
  if (!hasArtwork(state)) return 'defined'
  if (status === 'not_started' || status === 'draft') return 'created'
  if (status === 'in_review') return 'reviewed'
  return null
}

export interface MascotMigration {
  files: string[]
  changed: string[]
  /** Rows that claimed `approved` with no artwork attached. They are now `defined`. */
  downgraded: string[]
}

const CATALOG_FILES = ['catalog.yaml', 'expressions.yaml', 'poses.yaml', 'ui-states.yaml', 'learning-contexts.yaml', 'prop-interactions.yaml', 'campaigns.yaml']

/**
 * Rewrites legacy mascot statuses to the lifecycle enum, in place, keeping comments and anchors.
 * Idempotent: a second run changes nothing. Only the `status` field of a row is touched.
 */
export function migrateMascotCatalog(root: string): MascotMigration {
  const result: MascotMigration = { files: [], changed: [], downgraded: [] }
  for (const name of CATALOG_FILES) {
    const file = path.join(root, 'brand', 'mascot', name)
    if (!fs.existsSync(file)) continue
    const doc = parseDocument(fs.readFileSync(file, 'utf8'))
    const states = doc.get('states')
    if (!isSeq(states)) continue
    let touched = false
    for (const node of states.items) {
      if (!isMap(node)) continue
      const state = node.toJSON() as Row
      const next = migratedLifecycle(state)
      if (!next) continue
      if (state.status === 'approved') result.downgraded.push(String(state.id))
      node.set('status', next)
      touched = true
      if (name === 'catalog.yaml') result.changed.push(String(state.id))
    }
    if (touched) {
      writeAtomic(file, doc.toString({ lineWidth: 100 }))
      result.files.push(`brand/mascot/${name}`)
    }
  }
  return result
}

function readYaml<T>(file: string): T | null {
  return fs.existsSync(file) ? ((parse(fs.readFileSync(file, 'utf8')) as T | null) ?? null) : null
}

/**
 * Lifecycle rules for the catalog, on top of the JSON schema:
 * - legacy statuses must be migrated;
 * - a row at created or later needs artwork, and its status cannot run ahead of its best artwork;
 * - artwork ids are unique, stages and angles exist, and the asset is registered in the manifest;
 * - created or later artwork needs a present file; approved artwork needs an approved, checksummed asset;
 * - published artwork needs license metadata.
 */
export function validateMascotLifecycle(root: string, states: Row[]): string[] {
  const errors: string[] = []
  const stages = readYaml<{ stages?: Row[] }>(path.join(root, 'brand', 'mascot', 'stages.yaml'))?.stages ?? []
  const stageIds = new Set(stages.map((stage) => String(stage.id)))
  const angles = readYaml<{ angles?: Row[] }>(path.join(root, 'brand', 'mascot', 'angles.yaml'))?.angles ?? []
  const angleIds = new Set(angles.map((angle) => String(angle.id)))
  const manifest = readYaml<{ assets?: Row[] }>(path.join(root, 'brand', 'assets', 'asset-manifest.yaml'))?.assets ?? []
  const assets = new Map(manifest.map((asset) => [String(asset.id), asset]))
  const artworkIds = new Set<string>()
  for (const state of states) {
    const id = String(state.id)
    const status = state.status
    if (typeof status === 'string' && LEGACY.has(status)) {
      errors.push(`Mascot state ${id} uses legacy status ${status}. Run npm run brand:migrate.`)
      continue
    }
    if (!isMascotLifecycle(status)) continue // the JSON schema reports it
    const artwork = artworkOf(state)
    if (NEEDS_ARTWORK.includes(status) && artwork.length === 0) errors.push(`Mascot state ${id} is ${status} but has no artwork entries`)
    const best = artwork.reduce((max, item) => (isMascotLifecycle(item.status) ? Math.max(max, RANK[item.status]) : max), -1)
    if (status !== 'deprecated' && artwork.length > 0 && RANK[status] > best) errors.push(`Mascot state ${id} is ${status} but no artwork has reached ${status}`)
    const compatible = Array.isArray(state.stage_compatibility) ? state.stage_compatibility.map(String) : []
    for (const item of artwork) {
      const artId = String(item.id)
      if (artworkIds.has(artId)) errors.push(`Duplicate mascot artwork id ${artId}`)
      artworkIds.add(artId)
      const stage = String(item.stage)
      if (stage !== 'any' && !stageIds.has(stage)) errors.push(`Mascot artwork ${artId} names unknown stage ${stage}`)
      if (stage !== 'any' && !compatible.includes('any') && !compatible.includes(stage)) errors.push(`Mascot artwork ${artId} is for stage ${stage}, which ${id} does not list in stage_compatibility`)
      if (item.angle !== undefined && !angleIds.has(String(item.angle))) errors.push(`Mascot artwork ${artId} names unknown angle ${String(item.angle)}`)
      const artStatus = item.status
      if (!isMascotLifecycle(artStatus)) continue
      const asset = assets.get(String(item.asset_id))
      if (!asset) {
        errors.push(`Mascot artwork ${artId} references asset ${String(item.asset_id)}, which is not in the asset manifest`)
        continue
      }
      if (NEEDS_ARTWORK.includes(artStatus) && asset.present !== true) errors.push(`Mascot artwork ${artId} is ${artStatus} but asset ${String(asset.id)} is not present`)
      if (isUsableLifecycle(artStatus) && (asset.status !== 'approved' || typeof asset.checksum_sha256 !== 'string')) {
        errors.push(`Mascot artwork ${artId} is ${artStatus} but asset ${String(asset.id)} is not approved with a checksum`)
      }
      if (artStatus === 'published' && !(typeof item.license === 'object' && item.license !== null)) errors.push(`Mascot artwork ${artId} is published without license metadata`)
      if (item.preview_asset_id !== undefined && !assets.has(String(item.preview_asset_id))) errors.push(`Mascot artwork ${artId} preview ${String(item.preview_asset_id)} is not in the asset manifest`)
    }
  }
  return errors
}
