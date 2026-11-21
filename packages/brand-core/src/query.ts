import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { FieldQuestion } from './types.js'
import type { InterviewEngine } from './engine.js'
import { compileTokens, tokenDigest } from '@brand-os/design-tokens'
import { inspectAssetForPublication } from '@brand-os/asset-catalog'
import { appendAccessLog, queryFingerprint } from './access-log.js'
import { authorize, guestContext, type AgentProfile, type Audience, type AuthContext, type Role } from './auth.js'
import { rightsBlocker } from './asset-rights.js'
import { moduleEnabled } from './conditions.js'
import type { DocumentSpec } from './documents/model.js'
import { PERSONAL_SPECS } from './documents/personal.js'
import { claimVerification, gatePasses, readEvidence } from './evidence.js'
import { readFacts } from './facts.js'
import { factIsPublic, readPublicationPolicy } from './publication.js'
import { isUsableLifecycle } from './mascot-lifecycle.js'

/**
 * One retrieval path for every reader (guest, profiled agent, local operator), over MCP and `brand:query`.
 * Every item passes `authorize` with its own classification, approval state, publication, and module.
 * Retrieval only ever returns approved items. Drafts are not knowledge.
 */

export const RETRIEVE_KINDS = ['facts', 'tokens', 'mascot', 'mascot_assets', 'mascot_stages', 'component', 'asset', 'social_template', 'status'] as const
export type RetrieveKind = (typeof RETRIEVE_KINDS)[number]

export interface RetrieveRequest {
  kind: RetrieveKind
  /** Module id filter for `facts`, for example `brand-strategy` or `business-marketing`. */
  module?: string
  ids?: string[]
  query?: string
  /** Filters for `kind: 'mascot'`. Every given filter must match. */
  filters?: MascotFilters
}

export interface MascotFilters {
  /** Emotion keyword or catalog emotion id, for example `celebrating`. */
  emotion?: string
  /** Stage id, stage order (`3`), or stage name. */
  stage?: string
  /** Use-case keyword, for example `correct-answer`. Matches `use_cases`, the state slug, surfaces and tags. */
  use_case?: string
  /** Angle id or short name, for example `front` or `mascot.angle.front`. */
  angle?: string
}

export const MASCOT_FILTER_KEYS = ['emotion', 'stage', 'use_case', 'angle'] as const

/** Wrapper-only options. Not reachable from MCP or CLI arguments. */
interface InternalRequest extends RetrieveRequest {
  idPrefix?: string
}

export interface RetrievedItem {
  id: string
  brand_id: string
  module: string | null
  source_path: string
  classification: Audience
  approval_state: string
  publication: 'published' | 'unpublished'
  revision: string | null
  version: number | null
  value: unknown
  withheld: boolean
  reason: string | null
  meta?: Record<string, unknown>
}

export interface ToolResult {
  tool: string
  version: string
  status: string
  source: string
  approved: boolean
  note: string
  data: unknown
  brand_id: string
  principal: { role: Role; profile: AgentProfile | null }
  /** Highest classification among returned values, or null when nothing was returned. */
  classification: Audience | null
  approval_state: string
  /** The item revision for one item, or a fingerprint over all returned item revisions. */
  revision: string | null
  source_path: string
  missing: string[]
}

const VERSION = '0.2.0'
const RANK: Record<Audience, number> = { public: 0, internal: 1, restricted: 2 }
const FACTS_PATH = 'brand/instance/approved-facts.yaml'
const COMPONENTS_PATH = 'brand/content/12-product-ui-system/components.yaml'
const SOCIAL_PATH = 'brand/templates/social-post.md'
const MANIFEST_PATH = 'brand/assets/asset-manifest.yaml'
const CATALOG_PATH = 'brand/mascot/catalog.yaml'
const STAGES_PATH = 'brand/mascot/stages.yaml'

interface Retrieval {
  allow: boolean
  reason: string
  notApplicable?: boolean
  items: RetrievedItem[]
  missing: string[]
  source: string
  extra?: Record<string, unknown>
  /** Plain-language reasons why nothing (or not everything) matched. */
  explanation?: string[]
}

function audienceOf(value: unknown): Audience {
  return value === 'public' || value === 'restricted' ? value : 'internal'
}

function higher(a: Audience, b: Audience | undefined): Audience {
  return b !== undefined && RANK[b] > RANK[a] ? b : a
}

function gate(engine: InterviewEngine, ctx: AuthContext): { allow: boolean; reason: string } {
  const config = engine.config()
  if (ctx.brand_id !== config.brand.slug) return { allow: false, reason: 'cross-brand' }
  if (config.brand.publish_docs !== 'public' && ctx.audience === 'public') {
    return { allow: false, reason: 'private brand does not expose public MCP tools' }
  }
  return { allow: true, reason: 'allowed' }
}

/** Per-item check. Anything not approved is refused before the role rules run. */
function readable(
  ctx: AuthContext,
  brandId: string,
  item: { classification: Audience; status: unknown; published: boolean; module: string },
): { allow: boolean; reason: string } {
  if (item.status !== 'approved') return { allow: false, reason: 'not approved' }
  return authorize(
    ctx,
    { brand_id: brandId, classification: item.classification, status: 'approved', publication: item.published ? 'published' : 'unpublished', module: item.module },
    'read',
  )
}

function readYamlFile<T>(root: string, relative: string, fallback: T): T {
  const file = path.join(root, relative)
  if (!fs.existsSync(file)) return fallback
  return (parse(fs.readFileSync(file, 'utf8')) as T | null) ?? fallback
}

function retrieveFacts(engine: InterviewEngine, ctx: AuthContext, req: InternalRequest): Retrieval {
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const facts = readFacts(root, 'approved', brandId)
  const policy = readPublicationPolicy(root)
  const questions = new Map(engine.questions().map((question) => [question.id, question]))
  const evidence = readEvidence(root)
  const now = new Date()
  const terms = (req.query ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const explicit = req.ids !== undefined
  const items: RetrievedItem[] = []
  const missing: string[] = []
  for (const id of req.ids ?? Object.keys(facts)) {
    if (req.idPrefix && !id.startsWith(req.idPrefix)) continue
    const fact = facts[id]
    const question = questions.get(id)
    const module = question?.module ?? fact?.module ?? null
    if (req.module && module !== req.module) continue
    if (!fact || fact.id !== id || fact.brand_id !== brandId || !module) {
      if (explicit) missing.push(id)
      continue
    }
    // The registry wins if a fact file claims a lower classification than the question that owns it.
    const classification = higher(fact.classification, question ? audienceOf(question.sensitivity) : undefined)
    // The evidence, rights and privacy gate applies to every public reader, here as in factIsPublic.
    const published = fact.publication === 'published' && policy.approved_fact_ids.includes(id) && gatePasses(root, id, fact.value)
    const decision = readable(ctx, brandId, { classification, status: fact.status, published, module })
    const base = {
      id,
      brand_id: brandId,
      module,
      source_path: FACTS_PATH,
      classification,
      approval_state: fact.status,
      publication: published ? ('published' as const) : ('unpublished' as const),
      revision: fact.revision_hash,
      version: fact.version,
    }
    if (!decision.allow) {
      // Public readers learn nothing about what exists. An authenticated agent asking for an approved
      // fact by id or by module is told it is withheld and why, without the value.
      const tellAgent = ctx.audience !== 'public' && fact.status === 'approved' && terms.length === 0
      if (tellAgent) items.push({ ...base, value: null, withheld: true, reason: decision.reason })
      else if (explicit) missing.push(id)
      continue
    }
    if (fact.value === null || fact.value === undefined) {
      if (terms.length > 0) continue
      if (classification === 'restricted') items.push({ ...base, value: null, withheld: true, reason: 'restricted values stay in the private store' })
      else if (explicit) missing.push(id)
      continue
    }
    if (terms.length > 0) {
      const haystack = `${id} ${String(fact.value)}`.toLowerCase()
      if (!terms.every((term) => haystack.includes(term))) continue
    }
    // Personal claims carry their verification label so a reader never mistakes owner testimony for a verified fact.
    const meta = question && id.startsWith('personal.') ? { verification: claimVerification(question, evidence, now) } : undefined
    items.push({ ...base, value: fact.value, withheld: false, reason: null, ...(meta ? { meta } : {}) })
  }
  return { allow: true, reason: 'allowed', items: terms.length > 0 ? items.slice(0, 20) : items, missing, source: FACTS_PATH }
}

function retrieveTokens(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const compiled = compileTokens(root)
  const approved = readYamlFile<{ approved?: Record<string, { value_sha256?: string }> }>(root, 'brand/tokens/approvals.yaml', {}).approved ?? {}
  const policy = readPublicationPolicy(root)
  const items: RetrievedItem[] = []
  for (const [id, token] of Object.entries(compiled.flat)) {
    if (req.ids && !req.ids.includes(id)) continue
    const digest = tokenDigest(token)
    const hashApproved = typeof approved[id]?.value_sha256 === 'string' && approved[id]?.value_sha256 === digest
    const published = policy.approved_token_ids.includes(id)
    const classification: Audience = published ? 'public' : 'internal'
    if (!readable(ctx, brandId, { classification, status: hashApproved ? 'approved' : 'draft', published, module: 'design-tokens' }).allow) continue
    items.push({
      id,
      brand_id: brandId,
      module: 'design-tokens',
      source_path: 'brand/tokens',
      classification,
      approval_state: 'approved',
      publication: published ? 'published' : 'unpublished',
      revision: digest,
      version: null,
      value: token.hex ?? token.value,
      withheld: false,
      reason: null,
      meta: { type: token.type, source: token.source, ...(token.sourceFact ? { source_fact: token.sourceFact } : {}) },
    })
  }
  const missing = (req.ids ?? []).filter((id) => !items.some((item) => item.id === id))
  return { allow: true, reason: 'allowed', items, missing, source: 'brand/tokens' }
}

type Row = Record<string, unknown>

function readableAssets(engine: InterviewEngine, ctx: AuthContext): Row[] {
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const policy = readPublicationPolicy(root)
  const manifest = readYamlFile<{ assets?: Row[] }>(root, MANIFEST_PATH, {})
  return (manifest.assets ?? []).filter((asset) => {
    if (typeof asset.id !== 'string' || typeof asset.checksum_sha256 !== 'string') return false
    // Portraits and other rights-sensitive assets are public only with granted public-use rights.
    const published = policy.approved_asset_ids.includes(asset.id) && rightsBlocker(root, asset) === null
    const module = asset.id.includes('mascot') ? 'mascot-identity' : 'assets'
    if (!readable(ctx, brandId, { classification: audienceOf(asset.visibility), status: asset.status, published, module }).allow) return false
    return inspectAssetForPublication(root, String(asset.path), asset.checksum_sha256).ok
  })
}

function assetItem(engine: InterviewEngine, asset: Row): RetrievedItem {
  const root = engine.workspaceRoot()
  const published = readPublicationPolicy(root).approved_asset_ids.includes(String(asset.id)) && rightsBlocker(root, asset) === null
  return {
    id: String(asset.id),
    brand_id: engine.config().brand.slug,
    module: String(asset.id).includes('mascot') ? 'mascot-identity' : 'assets',
    source_path: MANIFEST_PATH,
    classification: audienceOf(asset.visibility),
    approval_state: 'approved',
    publication: published ? 'published' : 'unpublished',
    revision: String(asset.checksum_sha256),
    version: null,
    value: { id: asset.id, name: asset.name, path: asset.path, checksum_sha256: asset.checksum_sha256, license: asset.license, usage: asset.usage },
    withheld: false,
    reason: null,
    meta: { name: asset.name, status: asset.status, path: asset.path, checksum_sha256: asset.checksum_sha256, present: asset.present },
  }
}

function catalogItem(engine: InterviewEngine, row: Row, source: string, module: string, value: unknown): RetrievedItem {
  const published = readPublicationPolicy(engine.workspaceRoot()).approved_page_ids.includes(String(row.id))
  return {
    id: String(row.id),
    brand_id: engine.config().brand.slug,
    module,
    source_path: source,
    classification: published ? 'public' : 'internal',
    approval_state: 'approved',
    publication: published ? 'published' : 'unpublished',
    revision: typeof row.version === 'string' || typeof row.version === 'number' ? String(row.version) : null,
    version: null,
    value,
    withheld: false,
    reason: null,
  }
}

function pagePublished(engine: InterviewEngine, id: string): boolean {
  return readPublicationPolicy(engine.workspaceRoot()).approved_page_ids.includes(id)
}

function retrieveMascotAssets(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  if (!engine.config().modules.mascot.enabled) return { allow: true, reason: 'not applicable', notApplicable: true, items: [], missing: [], source: CATALOG_PATH }
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const catalog = readYamlFile<{ states?: Row[] }>(root, CATALOG_PATH, {})
  const assets = readableAssets(engine, ctx)
  const assetPaths = new Set(assets.map((asset) => String(asset.path)))
  const items: RetrievedItem[] = []
  for (const state of catalog.states ?? []) {
    const id = String(state.id)
    const published = pagePublished(engine, id)
    const status = isUsableLifecycle(state.status) ? 'approved' : state.status
    if (!readable(ctx, brandId, { classification: published ? 'public' : 'internal', status, published, module: 'mascot-identity' }).allow) continue
    const row = {
      id: state.id,
      name: state.name,
      status: state.status,
      source: CATALOG_PATH,
      source_assets: Array.isArray(state.source_assets) ? state.source_assets.filter((assetPath) => assetPaths.has(String(assetPath))) : [],
      preview: assetPaths.has(String(state.preview)) ? state.preview : null,
    }
    items.push(catalogItem(engine, state, CATALOG_PATH, 'mascot-identity', row))
  }
  for (const asset of assets.filter((item) => String(item.id).includes('mascot'))) {
    const item = assetItem(engine, asset)
    item.value = {
      id: asset.id,
      name: asset.name,
      status: asset.status,
      source: MANIFEST_PATH,
      path: asset.path,
      checksum_sha256: asset.checksum_sha256,
      present: asset.present,
    }
    items.push(item)
  }
  const needle = (req.query ?? '').toLowerCase()
  const filtered = needle ? items.filter((item) => JSON.stringify(item.value).toLowerCase().includes(needle)) : items
  return { allow: true, reason: 'allowed', items: filtered, missing: [], source: CATALOG_PATH }
}

function norm(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')
}

function slugOf(id: string): string {
  return id.split('.').pop() ?? id
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => norm(item)) : []
}

function matchesEmotion(state: Row, wanted: string): boolean {
  const id = String(state.id)
  return (
    norm(state.emotion) === wanted ||
    (state.category === 'emotion' && (slugOf(id) === wanted || norm(state.name) === wanted || norm(id) === wanted)) ||
    strings(state.tags).includes(wanted)
  )
}

function matchesUseCase(state: Row, wanted: string): boolean {
  return (
    strings(state.use_cases).includes(wanted) ||
    (state.category !== 'emotion' && slugOf(String(state.id)) === wanted) ||
    strings(state.applicable_surfaces).includes(wanted) ||
    strings(state.tags).includes(wanted)
  )
}

function describe(filters: MascotFilters): string {
  const parts = MASCOT_FILTER_KEYS.filter((key) => filters[key]).map((key) => `${key}=${filters[key]}`)
  return parts.length ? parts.join(', ') : 'no filters'
}

/**
 * Finds approved mascot artwork by emotion, stage, use case and angle.
 * Returns only artwork whose own lifecycle is approved or published, whose state is approved or published,
 * and whose manifest asset this principal may read (approved, checksummed, safe path, published for guests).
 * Draft, pending, created and reviewed artwork is never returned. When nothing matches, `explanation`
 * says what is missing. Guests get a generic explanation that reveals no unpublished rows.
 */
function retrieveMascot(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  if (!engine.config().modules.mascot.enabled) {
    return { allow: true, reason: 'not applicable', notApplicable: true, items: [], missing: [], source: CATALOG_PATH, explanation: ['The mascot module is disabled for this brand.'] }
  }
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const filters: MascotFilters = req.filters ?? {}
  const wanted = Object.fromEntries(MASCOT_FILTER_KEYS.map((key) => [key, filters[key] ? norm(filters[key]) : ''])) as Record<(typeof MASCOT_FILTER_KEYS)[number], string>
  const label = describe(filters)
  const detailed = ctx.audience !== 'public'
  const explanation: string[] = []
  const done = (items: RetrievedItem[]): Retrieval => ({
    allow: true,
    reason: 'allowed',
    items,
    missing: items.length ? [] : [`mascot: ${label}`],
    source: CATALOG_PATH,
    explanation: items.length ? explanation : detailed ? explanation : ['No published mascot artwork matches these filters.'],
  })

  const stages = readYamlFile<{ stages?: Row[] }>(root, STAGES_PATH, {}).stages ?? []
  let stage: Row | null = null
  if (wanted.stage) {
    stage = stages.find((item) => norm(item.id) === wanted.stage || String(item.order) === wanted.stage || norm(item.name) === wanted.stage || slugOf(norm(item.id)) === wanted.stage) ?? null
    if (!stage) {
      explanation.push(`Stage ${filters.stage} is not configured. Configured stages: ${stages.map((item) => `${String(item.order)} ${String(item.id)}`).join(', ') || 'none'}.`)
      return done([])
    }
  }
  const stageId = stage ? String(stage.id) : null
  const angleId = wanted.angle ? (wanted.angle.startsWith('mascot.angle.') ? wanted.angle : `mascot.angle.${wanted.angle}`) : null

  const catalog = readYamlFile<{ states?: Row[] }>(root, CATALOG_PATH, {}).states ?? []
  let candidates = catalog.filter((state) => state.status !== 'deprecated')
  if (wanted.emotion) {
    candidates = candidates.filter((state) => matchesEmotion(state, wanted.emotion))
    if (candidates.length === 0) {
      explanation.push(`No catalog state matches emotion "${filters.emotion}".`)
      return done([])
    }
  }
  if (wanted.use_case) {
    const before = candidates
    candidates = candidates.filter((state) => matchesUseCase(state, wanted.use_case))
    if (candidates.length === 0) {
      explanation.push(
        wanted.emotion
          ? `${before.map((state) => String(state.id)).join(', ')} match${before.length === 1 ? 'es' : ''} emotion "${filters.emotion}", but none lists use case "${filters.use_case}" in use_cases.`
          : `No catalog state lists use case "${filters.use_case}".`,
      )
      return done([])
    }
  }
  if (stageId) {
    const before = candidates
    candidates = candidates.filter((state) => {
      const compatible = Array.isArray(state.stage_compatibility) ? state.stage_compatibility.map(String) : []
      return compatible.includes('any') || compatible.includes(stageId)
    })
    if (candidates.length === 0) {
      explanation.push(`${before.map((state) => String(state.id)).join(', ')} ${before.length === 1 ? 'is' : 'are'} not compatible with stage ${stageId}.`)
      return done([])
    }
  }

  const policy = readPublicationPolicy(root)
  const assets = new Map(readableAssets(engine, ctx).map((asset) => [String(asset.id), asset]))
  const items: RetrievedItem[] = []
  for (const state of candidates.slice(0, 200)) {
    const id = String(state.id)
    const artwork = Array.isArray(state.artwork) ? (state.artwork as Row[]) : []
    const fits = artwork.filter((art) => (!stageId || art.stage === stageId || art.stage === 'any') && (!angleId || art.angle === angleId))
    if (fits.length === 0) {
      const where = [stageId ? `stage ${stageId}` : '', angleId ? `angle ${angleId}` : ''].filter(Boolean).join(' and ')
      explanation.push(`${id} is ${String(state.status)}; no artwork exists${where ? ` for ${where}` : ''}.`)
      continue
    }
    for (const art of fits) {
      const artId = String(art.id)
      if (!isUsableLifecycle(art.status) || !isUsableLifecycle(state.status)) {
        explanation.push(`${artId} (${id}) is ${String(art.status)}, not approved. Draft art is never returned.`)
        continue
      }
      const asset = assets.get(String(art.asset_id))
      const published = art.status === 'published' && policy.approved_asset_ids.includes(String(art.asset_id))
      const classification: Audience = published ? 'public' : 'internal'
      const decision = readable(ctx, brandId, { classification, status: 'approved', published, module: 'mascot-identity' })
      if (!asset || !decision.allow) {
        explanation.push(`${artId} (${id}) is ${String(art.status)}, but asset ${String(art.asset_id)} is not readable here (not approved in the manifest, file missing or changed, or not published for this reader).`)
        continue
      }
      const preview = art.preview_asset_id ? assets.get(String(art.preview_asset_id)) : undefined
      items.push({
        id: artId,
        brand_id: brandId,
        module: 'mascot-identity',
        source_path: CATALOG_PATH,
        classification,
        approval_state: 'approved',
        publication: published ? 'published' : 'unpublished',
        revision: String(asset.checksum_sha256),
        version: null,
        value: {
          state_id: id,
          name: state.name,
          category: state.category,
          emotion: state.emotion ?? (state.category === 'emotion' ? slugOf(id) : null),
          use_cases: state.use_cases ?? [],
          lifecycle: art.status,
          stage: art.stage,
          stage_order: stage?.order ?? stages.find((item) => item.id === art.stage)?.order ?? null,
          angle: art.angle ?? null,
          intensity: art.intensity ?? state.emotion_intensity ?? null,
          outfit: art.outfit ?? state.outfit ?? null,
          accessories: art.accessories ?? state.accessories ?? [],
          animation_refs: art.animation_refs ?? state.animation_refs ?? [],
          version: art.version,
          license: art.license ?? state.license ?? null,
          asset: { id: asset.id, path: asset.path, checksum_sha256: asset.checksum_sha256 },
          preview: preview ? { id: preview.id, path: preview.path } : null,
          source: CATALOG_PATH,
        },
        withheld: false,
        reason: null,
      })
    }
  }
  return done(items)
}

function retrieveMascotStages(engine: InterviewEngine, ctx: AuthContext): Retrieval {
  if (!engine.config().modules.mascot.enabled) return { allow: true, reason: 'not applicable', notApplicable: true, items: [], missing: [], source: STAGES_PATH }
  const brandId = engine.config().brand.slug
  const doc = readYamlFile<{ stages?: Row[] }>(engine.workspaceRoot(), STAGES_PATH, {})
  const items = (doc.stages ?? [])
    .filter((stage) => {
      const published = pagePublished(engine, String(stage.id))
      return readable(ctx, brandId, { classification: published ? 'public' : 'internal', status: stage.status, published, module: 'mascot-evolution' }).allow
    })
    .map((stage) => catalogItem(engine, stage, STAGES_PATH, 'mascot-evolution', stage))
  return { allow: true, reason: 'allowed', items, missing: [], source: STAGES_PATH }
}

function retrieveComponent(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  const id = req.ids?.[0] ?? req.query ?? ''
  const brandId = engine.config().brand.slug
  const doc = readYamlFile<{ components?: Row[] }>(engine.workspaceRoot(), COMPONENTS_PATH, {})
  const found = (doc.components ?? []).find((component) => component.id === `component.${id}` || component.id === id || component.name === id)
  if (found) {
    const published = pagePublished(engine, String(found.id)) || pagePublished(engine, COMPONENTS_PATH)
    if (readable(ctx, brandId, { classification: published ? 'public' : 'internal', status: found.status, published, module: 'product-ui' }).allow) {
      const item = catalogItem(engine, found, COMPONENTS_PATH, 'product-ui', found)
      if (published) {
        item.classification = 'public'
        item.publication = 'published'
      }
      return { allow: true, reason: 'allowed', items: [item], missing: [], source: COMPONENTS_PATH }
    }
  }
  return { allow: true, reason: 'allowed', items: [], missing: [id], source: COMPONENTS_PATH }
}

function retrieveAsset(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  const ids = req.ids ?? (req.query ? [req.query] : [])
  const assets = readableAssets(engine, ctx).filter((asset) => ids.includes(String(asset.id)))
  const items = assets.map((asset) => assetItem(engine, asset))
  return { allow: true, reason: 'allowed', items, missing: ids.filter((id) => !items.some((item) => item.id === id)), source: MANIFEST_PATH }
}

function retrieveSocialTemplate(engine: InterviewEngine, ctx: AuthContext, req: RetrieveRequest): Retrieval {
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const file = path.join(root, SOCIAL_PATH)
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  const frontmatter = text.match(/^---\s*\n([\s\S]*?)\n---/)
  const metadata = frontmatter ? (parse(frontmatter[1] ?? '') as { status?: string } | null) : null
  const published = pagePublished(engine, SOCIAL_PATH)
  const classification: Audience = published ? 'public' : 'internal'
  const allow = readable(ctx, brandId, { classification, status: metadata?.status, published, module: 'social' }).allow
  if (!allow) return { allow: true, reason: 'allowed', items: [], missing: [req.query ?? 'unspecified'], source: SOCIAL_PATH }
  const item: RetrievedItem = {
    id: SOCIAL_PATH,
    brand_id: brandId,
    module: 'social',
    source_path: SOCIAL_PATH,
    classification,
    approval_state: 'approved',
    publication: published ? 'published' : 'unpublished',
    revision: crypto.createHash('sha256').update(text).digest('hex'),
    version: null,
    value: { source: SOCIAL_PATH, body: text },
    withheld: false,
    reason: null,
  }
  return { allow: true, reason: 'allowed', items: [item], missing: [], source: SOCIAL_PATH }
}

function retrieveStatus(engine: InterviewEngine, ctx: AuthContext): Retrieval {
  const brandId = engine.config().brand.slug
  const release = engine.exportPublic()
  const publicStatus = { brand: release.display_name ?? 'Unpublished', slug: release.brand_id, publishedFactCount: release.facts.length, release: release.release }
  if (ctx.audience === 'public') return { allow: true, reason: 'allowed', items: [], missing: [], source: 'brand/publication-policy.yaml', extra: publicStatus }
  const decision = readable(ctx, brandId, { classification: 'internal', status: 'approved', published: false, module: 'governance' })
  if (!decision.allow) return { allow: false, reason: decision.reason, items: [], missing: [], source: 'brand/publication-policy.yaml' }
  // Counts only. No values, and no ids of facts this principal cannot read.
  const facts = retrieveFacts(engine, ctx, { kind: 'facts' })
  const readableCount = facts.items.filter((item) => !item.withheld).length
  return {
    allow: true,
    reason: 'allowed',
    items: [],
    missing: [],
    source: 'brand/publication-policy.yaml',
    extra: {
      ...publicStatus,
      brand: engine.config().brand.name,
      slug: brandId,
      readableApprovedFactCount: readableCount,
      withheldApprovedFactCount: facts.items.length - readableCount,
    },
  }
}

function retrieve(engine: InterviewEngine, ctx: AuthContext, req: InternalRequest): Retrieval {
  const gated = gate(engine, ctx)
  if (!gated.allow) return { allow: false, reason: gated.reason, items: [], missing: [], source: '' }
  switch (req.kind) {
    case 'facts':
      return retrieveFacts(engine, ctx, req)
    case 'tokens':
      return retrieveTokens(engine, ctx, req)
    case 'mascot':
      return retrieveMascot(engine, ctx, req)
    case 'mascot_assets':
      return retrieveMascotAssets(engine, ctx, req)
    case 'mascot_stages':
      return retrieveMascotStages(engine, ctx)
    case 'component':
      return retrieveComponent(engine, ctx, req)
    case 'asset':
      return retrieveAsset(engine, ctx, req)
    case 'social_template':
      return retrieveSocialTemplate(engine, ctx, req)
    case 'status':
      return retrieveStatus(engine, ctx)
    default:
      return { allow: false, reason: 'unknown retrieval kind', items: [], missing: [], source: '' }
  }
}

function fingerprint(items: RetrievedItem[]): string | null {
  const returned = items.filter((item) => !item.withheld)
  if (returned.length === 0) return null
  if (returned.length === 1) return returned[0]?.revision ?? null
  const basis = returned.map((item) => `${item.id}:${item.revision ?? ''}`).sort().join('\n')
  return `sha256:${crypto.createHash('sha256').update(basis).digest('hex').slice(0, 32)}`
}

interface Shape {
  tool: string
  source: string
  emptyStatus: 'missing' | 'draft'
  note: (retrieval: Retrieval) => string
  data: (retrieval: Retrieval) => unknown
  denied: unknown
}

/** Shared envelope and access logging for `brand_retrieve` and every legacy tool wrapper. */
function run(engine: InterviewEngine, ctxInput: AuthContext | undefined, req: InternalRequest, shape: Shape): ToolResult {
  const ctx = ctxInput ?? guestContext(engine.config().brand.slug)
  const brandId = engine.config().brand.slug
  let retrieval = retrieve(engine, ctx, req)
  const privileged = ctx.role !== 'guest'
  if (privileged || !retrieval.allow) {
    try {
      appendAccessLog(engine.workspaceRoot(), ctx, {
        tool: shape.tool,
        kind: req.kind,
        requested_ids: req.ids ?? [],
        returned_ids: retrieval.items.filter((item) => !item.withheld).map((item) => item.id),
        withheld_ids: retrieval.items.filter((item) => item.withheld).map((item) => item.id),
        query_sha256: queryFingerprint(req.query ?? (req.filters ? JSON.stringify(req.filters) : undefined)),
        decision: retrieval.allow ? 'allow' : 'deny',
        reason: retrieval.reason,
      })
    } catch {
      // Privileged reads are not served without an audit line.
      if (privileged) retrieval = { allow: false, reason: 'access log unavailable', items: [], missing: [], source: retrieval.source }
    }
  }
  const base = {
    tool: shape.tool,
    version: VERSION,
    source: shape.source,
    brand_id: brandId,
    principal: { role: ctx.role, profile: ctx.profile ?? null },
    source_path: shape.source,
  }
  if (!retrieval.allow) {
    return { ...base, status: 'denied', approved: false, note: retrieval.reason, data: shape.denied, classification: null, approval_state: 'denied', revision: null, missing: [] }
  }
  const returned = retrieval.items.filter((item) => !item.withheld)
  const status = retrieval.notApplicable ? 'not_applicable' : returned.length > 0 || retrieval.extra ? 'approved' : shape.emptyStatus
  const classification = returned.reduce<Audience | null>((max, item) => (max === null ? item.classification : higher(max, item.classification)), null)
  return {
    ...base,
    status,
    approved: status === 'approved',
    note: shape.note(retrieval),
    data: shape.data(retrieval),
    classification,
    approval_state: status,
    revision: fingerprint(retrieval.items),
    missing: retrieval.missing,
  }
}

function cleanFilters(input: unknown): MascotFilters | undefined {
  if (typeof input !== 'object' || input === null) return undefined
  const source = input as Record<string, unknown>
  const out: MascotFilters = {}
  for (const key of MASCOT_FILTER_KEYS) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) out[key] = value.trim().slice(0, 100)
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = String(value)
  }
  return Object.keys(out).length ? out : undefined
}

/** The unified retrieval tool. The caller's context comes from the server, never from `request`. */
export function brandRetrieve(engine: InterviewEngine, ctx: AuthContext | undefined, request: RetrieveRequest): ToolResult {
  const kind = RETRIEVE_KINDS.includes(request.kind) ? request.kind : null
  const req: RetrieveRequest = {
    kind: kind ?? ('invalid' as RetrieveKind),
    module: typeof request.module === 'string' ? request.module : undefined,
    ids: Array.isArray(request.ids) ? request.ids.filter((id): id is string => typeof id === 'string').slice(0, 100) : undefined,
    query: typeof request.query === 'string' ? request.query : undefined,
    filters: cleanFilters(request.filters),
  }
  return run(engine, ctx, req, {
    tool: 'brand_retrieve',
    source: kind === 'facts' ? FACTS_PATH : `brand/${kind ?? 'unknown'}`,
    emptyStatus: 'missing',
    note: (retrieval) =>
      retrieval.notApplicable
        ? 'Module is disabled.'
        : req.kind === 'mascot'
          ? 'Approved or published mascot artwork only. Draft art is never returned. See explanation for what is missing.'
          : 'Approved items only. Withheld items carry no value. Missing ids stay missing.',
    data: (retrieval) => ({
      kind: req.kind,
      items: retrieval.items,
      ...(retrieval.extra ? { status: retrieval.extra } : {}),
      ...(retrieval.explanation ? { explanation: retrieval.explanation } : {}),
    }),
    denied: { kind: req.kind, items: [] },
  })
}

export function searchBrandDocs(engine: InterviewEngine, query: string, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'facts', query }, {
    tool: 'search_brand_docs',
    source: FACTS_PATH,
    emptyStatus: 'missing',
    note: () => 'Only facts this principal may read. Guests see published public facts only.',
    data: (retrieval) => ({
      query,
      hits: retrieval.items.map((item) => ({ id: item.id, status: item.approval_state, source: item.source_path, value: item.value, revision: item.revision, audience: item.classification })),
    }),
    denied: { query, hits: [] },
  })
}

export function getBrandTokens(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'tokens' }, {
    tool: 'get_brand_tokens',
    source: 'brand/tokens',
    emptyStatus: 'draft',
    note: () => 'Only hash-approved tokens are returned. Guests also need explicit publication.',
    data: (retrieval) => ({ tokens: retrieval.items.map((item) => ({ id: item.id, type: item.meta?.type, value: item.value, approved: true, source: 'brand/tokens' })) }),
    denied: { tokens: [] },
  })
}

export function getMascotGuidelines(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  const enabled = engine.config().modules.mascot.enabled
  const result = run(engine, ctx, { kind: 'facts', idPrefix: 'brand.mascot.' }, {
    tool: 'get_mascot_guidelines',
    source: 'brand/mascot/mascot.config.yaml',
    emptyStatus: 'draft',
    note: () => (enabled ? 'Approved mascot rules come from approved facts. Catalog art is not implied.' : 'Mascot module is disabled.'),
    data: (retrieval) => ({ enabled, rules: retrieval.items.filter((item) => !item.withheld).map((item) => ({ id: item.id, value: item.value, source: item.source_path })) }),
    denied: { rules: [] },
  })
  if (result.status !== 'denied' && !enabled) return { ...result, status: 'not_applicable', approval_state: 'not_applicable' }
  return result
}

export function listMascotAssets(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'mascot_assets' }, {
    tool: 'list_mascot_assets',
    source: CATALOG_PATH,
    emptyStatus: 'draft',
    note: (retrieval) =>
      retrieval.notApplicable ? 'Mascot module is disabled. Draft catalog rows are not returned.' : 'Approved rows only. include_unapproved does not raise privilege.',
    data: (retrieval) => ({ count: retrieval.items.length, rows: retrieval.items.map((item) => item.value) }),
    denied: { count: 0, rows: [] },
  })
}

export function getDesignComponent(engine: InterviewEngine, id: string, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'component', ids: [id] }, {
    tool: 'get_design_component',
    source: COMPONENTS_PATH,
    emptyStatus: 'missing',
    note: (retrieval) => (retrieval.items.length ? 'Approved component this principal may read.' : `No readable approved component named ${id}.`),
    data: (retrieval) => retrieval.items[0]?.value ?? { id, found: false },
    denied: { id, found: false },
  })
}

export function getSocialTemplate(engine: InterviewEngine, channel: string, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'social_template', query: channel }, {
    tool: 'get_social_template',
    source: SOCIAL_PATH,
    emptyStatus: 'draft',
    note: (retrieval) => (retrieval.items.length ? 'Approved social template body.' : `No approved ${channel} template. The starter brief exists and is still a draft.`),
    data: (retrieval) => ({ channel, templates: retrieval.items.map((item) => item.value) }),
    denied: { channel, templates: [] },
  })
}

function factTool(engine: InterviewEngine, tool: string, ids: string[], ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'facts', ids }, {
    tool,
    source: FACTS_PATH,
    emptyStatus: 'missing',
    note: () => 'Missing fields stay missing. Withheld fields carry no value.',
    data: (retrieval) => ({
      facts: ids.map((id) => {
        const item = retrieval.items.find((candidate) => candidate.id === id)
        if (!item) return { id, value: null, missing: true }
        if (item.withheld) return { id, value: null, withheld: true, reason: item.reason, classification: item.classification }
        return { id, value: String(item.value), revision: item.revision, version: item.version, classification: item.classification }
      }),
    }),
    denied: { facts: [] },
  })
}

export function getBrandOverview(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_brand_overview', ['business.identity.trade_name', 'brand.strategy.purpose', 'business.offer.value_proposition'], ctx)
}

export function getBrandGuidelines(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_brand_guidelines', ['brand.personality.traits', 'brand.verbal.tagline', 'brand.verbal.voice'], ctx)
}

export function getLogoRules(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_logo_rules', ['brand.logo.primary', 'brand.logo.clearspace'], ctx)
}

export function getMascotProfile(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  if (!engine.config().modules.mascot.enabled) {
    const result = factTool(engine, 'get_mascot_profile', [], ctx)
    if (result.status === 'denied') return result
    return { ...result, status: 'not_applicable', approval_state: 'not_applicable', approved: false, note: 'Mascot module is disabled.', data: { facts: [] } }
  }
  return factTool(engine, 'get_mascot_profile', ['brand.mascot.role', 'brand.mascot.personality'], ctx)
}

export function listMascotStages(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'mascot_stages' }, {
    tool: 'list_mascot_stages',
    source: STAGES_PATH,
    emptyStatus: 'missing',
    note: (retrieval) => (retrieval.notApplicable ? 'Mascot module is disabled.' : 'Unapproved stages are omitted.'),
    data: (retrieval) => ({ stages: retrieval.items.map((item) => item.value) }),
    denied: { stages: [] },
  })
}

export function searchMascotAssets(engine: InterviewEngine, query: string, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'mascot_assets', query }, {
    tool: 'search_mascot_assets',
    source: CATALOG_PATH,
    emptyStatus: 'missing',
    note: (retrieval) => (retrieval.notApplicable ? 'Mascot module is disabled.' : retrieval.items.length ? 'Approved rows only.' : 'No approved mascot asset matched.'),
    data: (retrieval) => ({ rows: retrieval.items.map((item) => item.value) }),
    denied: { rows: [] },
  })
}

export function getAssetMetadata(engine: InterviewEngine, id: string, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'asset', ids: [id] }, {
    tool: 'get_asset_metadata',
    source: MANIFEST_PATH,
    emptyStatus: 'missing',
    note: (retrieval) => (retrieval.items.length ? 'Approved asset this principal may read.' : `No readable approved asset ${id}.`),
    data: (retrieval) => ({ asset: retrieval.items[0]?.value ?? null }),
    denied: { asset: null },
  })
}

export function getMotionGuidelines(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_motion_guidelines', ['brand.motion.easing', 'brand.motion.duration'], ctx)
}

export function getMarketingPlan(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_marketing_plan', ['business.marketing.objective', 'business.marketing.channels', 'business.marketing.budget'], ctx)
}

export function getBusinessPlan(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return factTool(engine, 'get_business_plan', ['business.identity.trade_name', 'business.offer.summary', 'business.customer.primary_segment'], ctx)
}

export function getBrandStatus(engine: InterviewEngine, ctx?: AuthContext): ToolResult {
  return run(engine, ctx, { kind: 'status' }, {
    tool: 'get_brand_status',
    source: 'brand/publication-policy.yaml',
    emptyStatus: 'missing',
    note: (retrieval) =>
      retrieval.extra && 'readableApprovedFactCount' in retrieval.extra
        ? 'Approval counts for this principal. No values.'
        : 'Public release status only. Internal progress is not accessible anonymously.',
    data: (retrieval) => retrieval.extra ?? {},
    denied: {},
  })
}

export function describeQuestion(engine: InterviewEngine, question: FieldQuestion, _ctx?: AuthContext) {
  const facts = readFacts(engine.workspaceRoot(), 'approved', engine.config().brand.slug)
  const fact = facts[question.id]
  const show = factIsPublic(engine.workspaceRoot(), question.id, fact, engine.config().brand.slug)
  return { id: question.id, status: show ? 'approved' : 'withheld', value: show ? fact?.value : null, withheld: !show }
}

export function resolveAgentRequest(engine: InterviewEngine, requestId: 'instagram-carousel' | 'onboarding-mascot') {
  if (requestId === 'instagram-carousel') {
    const tokens = getBrandTokens(engine)
    return {
      request: 'Create an Instagram carousel using approved brand typography',
      steps: ['Read AGENTS.md', 'Open brand/content/16-social-media/overview.md', 'Call get_brand_tokens without include_unapproved', 'Stop if no approved type exists'],
      result: tokens,
      gap: (tokens.data as { tokens: unknown[] }).tokens.length === 0 ? 'No approved typography.' : 'Approved tokens are listed in the result.',
    }
  }
  const assets = listMascotAssets(engine)
  const rows = (assets.data as { rows: Array<{ id?: unknown }> }).rows.filter((row) => ['mascot.ui.success', 'mascot.emotion.joyful', 'mascot.emotion.delighted'].includes(String(row.id)))
  return {
    request: 'Find the approved happy mascot pose for an onboarding success screen',
    steps: ['Confirm mascot module', 'Read catalog YAML ids', 'Do not invent artwork'],
    result: rows,
    gap: rows.length === 0 ? 'Approved artwork is missing.' : 'Approved rows are included.',
    enabled: engine.config().modules.mascot.enabled,
  }
}

export const DRAFT_RULES = [
  'This is a draft operation. It has no authority to approve, publish, or write brand facts.',
  'Use only the facts returned here. Do not add degrees, clients, awards, numbers, testimonials or outcomes.',
  'A fact labelled owner_stated or unverified must not be presented as independently verified.',
  'Missing facts stay missing: say what is missing instead of inventing a replacement.',
  'Never include private contact details, home location, family or health information.',
  'Return the draft to the owner. Only the owner approves it, with the approval proof, in a trusted local shell.',
]

/**
 * Approved personal facts for one deliverable, read through the same authorized retrieval path as
 * every other tool, packaged for a drafting agent. The result is always `draft`: it carries no
 * approval or publication authority, and missing or unreadable facts are listed instead of guessed.
 */
export function draftPersonalContent(engine: InterviewEngine, deliverable: string, ctx?: AuthContext, sectionId?: string): ToolResult {
  const spec = (PERSONAL_SPECS as Record<string, DocumentSpec | undefined>)[deliverable]
  const ids = spec ? [...new Set(spec.sections.filter((section) => !sectionId || section.id === sectionId).flatMap((section) => section.questions))] : []
  const config = engine.config()
  const result = run(engine, ctx, { kind: 'facts', ids }, {
    tool: 'draft_personal_content',
    source: FACTS_PATH,
    emptyStatus: 'missing',
    note: () => 'Draft operation. Approved facts this caller may read; everything else is listed as missing.',
    data: (retrieval) => ({
      operation: 'draft',
      authority: 'none',
      deliverable,
      rules: DRAFT_RULES,
      sections: (spec?.sections ?? [])
        .filter((section) => !sectionId || section.id === sectionId)
        .map((section) => ({
          id: section.id,
          title: section.title,
          words: section.words ?? null,
          facts: section.questions
            .map((id) => retrieval.items.find((item) => item.id === id && !item.withheld))
            .filter((item): item is RetrievedItem => Boolean(item))
            .map((item) => ({ id: item.id, value: item.value, verification: (item.meta?.verification as string | undefined) ?? 'not_required', revision: item.revision })),
        })),
      missing: ids.filter((id) => !retrieval.items.some((item) => item.id === id && !item.withheld)),
    }),
    denied: { operation: 'draft', authority: 'none', deliverable, sections: [], missing: ids },
  })
  if (result.status === 'denied') return result
  if (!spec || (sectionId && !spec.sections.some((section) => section.id === sectionId))) {
    return { ...result, status: 'missing', approved: false, approval_state: 'missing', note: `Unknown deliverable or section. Use one of: ${Object.keys(PERSONAL_SPECS).join(', ')}.` }
  }
  if (!moduleEnabled({ optional: 'personal', facet: spec.requires?.facet }, config)) {
    return { ...result, status: 'not_applicable', approved: false, approval_state: 'not_applicable', note: 'The personal module or the facet for this deliverable is turned off.', data: { operation: 'draft', authority: 'none', deliverable, sections: [], missing: [] } }
  }
  // Always a draft: reading approved facts never turns the composed text into an approved one.
  return { ...result, status: 'draft', approved: false, approval_state: 'draft' }
}
