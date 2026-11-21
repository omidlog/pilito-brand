import fs from 'node:fs'
import path from 'node:path'
import {
  buildDashboard,
  buildNamedDocument,
  InterviewEngine,
  PERSONAL_DOCUMENT_KINDS,
  readFacts,
  readPublicationPolicy,
  rightsBlocker,
} from '@brand-os/brand-core'
import type { DashboardContradiction, DashboardModule, DocumentKind, DocumentModel, InternalDashboard } from '@brand-os/brand-core'
import { inspectAssetForPublication } from '@brand-os/asset-catalog'
import { compileTokens, tokenDigest } from '@brand-os/design-tokens'
import { parse } from 'yaml'

/**
 * The safe, read-only view of one brand repository at one commit.
 *
 * It is built on the server from an extracted checkout of `brand/` (never `brand/.private`) with the
 * existing core functions at the `internal` audience: the dashboard, the shared document model, token
 * approval hashes and asset publication checks. Restricted values are withheld by those functions and
 * are not in Git in the first place. Drafts are labelled as drafts and never shown as approved facts.
 */
export const PREVIEW_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export interface ProjectionToken {
  id: string
  type: string
  value: string
  state: 'approved' | 'draft'
  published: boolean
  source: 'base' | 'generated'
  source_fact: string | null
  example: boolean
}

export interface ProjectionAsset {
  id: string
  name: string
  kind: string
  status: string
  visibility: string
  license: string | null
  usage: string | null
  restrictions: string | null
  approved: boolean
  published: boolean
  /** Key of the cached preview file (its SHA-256). Null when there is no approved, safe, readable file. */
  preview_key: string | null
  mime: string | null
  unavailable_reason: 'not_approved' | 'not_present' | 'unsafe' | 'checksum' | 'unsupported_type' | null
}

export interface StudioProjection {
  schema_version: 1
  brand: {
    name: string
    name_status: string
    slug: string
    profile: string
    kind: 'business' | 'personal-brand'
    industry: string
    default_locale: string
    supported_locales: string[]
    publish_docs: string
    status: string
    initialized: boolean
    modules: { mascot: boolean; gamification: boolean; personal: boolean; facets: string[] }
  }
  overview: {
    coverage: number
    approval: number
    required: number
    required_unanswered: number
    pending_review: number
    approved_facts: number
    restricted_withheld: number
    contradictions: number
    groups: Array<{ group: string; required: number; required_approved: number; required_unanswered: number; pending_review: number }>
    next: Array<{ id: string; priority: string; prompt: string }>
  }
  modules: DashboardModule[]
  review: Array<{ question_id: string; module: string; label: string; state: string; withheld: boolean; draft_value: string | null; approved_value: string | null; approved_version: number | null; reason: string }>
  contradictions: DashboardContradiction[]
  documents: Partial<Record<DocumentKind, DocumentModel>>
  tokens: { items: ProjectionToken[]; approved: number; draft: number; errors: number }
  assets: ProjectionAsset[]
  mascot: null | {
    states: number
    by_status: Record<string, number>
    by_category: Record<string, number>
    artwork_ready: number
    stages: Array<{ id: string; name: string; status: string }>
  }
  personal: null | { facets: string[]; documents: DocumentKind[] }
}

export class ProjectionError extends Error {
  constructor(
    readonly code: 'not_brand_os' | 'slug_mismatch' | 'unsafe_projection',
    message: string,
  ) {
    super(message)
  }
}

function display(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > 2000 ? `${text.slice(0, 2000)}…` : text
}

function readYaml<T>(root: string, relative: string, fallback: T): T {
  const file = path.join(root, relative)
  if (!fs.existsSync(file)) return fallback
  try {
    return (parse(fs.readFileSync(file, 'utf8')) as T | null) ?? fallback
  } catch {
    return fallback
  }
}

const SECRET_PATTERNS = [/bos_at_[A-Za-z0-9_-]{20,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/]

/** Last line of defence: a projection that looks like it carries a credential is refused, not served. */
export function assertNoSecrets(value: unknown): void {
  const text = JSON.stringify(value)
  if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) throw new ProjectionError('unsafe_projection', 'The repository content looks like it contains a credential. Studio refused to display it.')
}

export interface PreviewFile {
  key: string
  source: string
  mime: string
}

export function buildProjection(root: string, expectedSlug: string): { projection: StudioProjection; previews: PreviewFile[] } {
  if (!fs.existsSync(path.join(root, 'brand', 'brand.config.yaml'))) throw new ProjectionError('not_brand_os', 'The repository has no brand/brand.config.yaml.')
  const engine = new InterviewEngine(root)
  const config = engine.config()
  if (config.brand.slug !== expectedSlug) {
    throw new ProjectionError('slug_mismatch', 'The repository belongs to a different brand slug than the one registered in Studio. Nothing was displayed.')
  }
  const dashboard = buildDashboard(engine, 'internal') as InternalDashboard
  const personal = config.modules.personal?.enabled === true
  const facets = personal ? [...(config.modules.personal?.facets ?? [])] : []

  const documents: StudioProjection['documents'] = {}
  for (const kind of ['brand-book', 'business-plan', 'marketing-plan'] as const) documents[kind] = buildNamedDocument(engine, kind, 'internal')
  const personalDocs: DocumentKind[] = []
  if (personal) {
    for (const kind of PERSONAL_DOCUMENT_KINDS) {
      const model = buildNamedDocument(engine, kind, 'internal')
      if (model.sections.length > 0) {
        documents[kind] = model
        personalDocs.push(kind)
      }
    }
  }

  const approvedFacts = readFacts(root, 'approved', config.brand.slug)
  const questions = new Map(engine.questions().map((question) => [question.id, question]))
  let restrictedWithheld = 0
  let approvedCount = 0
  for (const [id, fact] of Object.entries(approvedFacts)) {
    if (fact.status !== 'approved') continue
    approvedCount += 1
    if (fact.classification === 'restricted' || questions.get(id)?.sensitivity === 'restricted') restrictedWithheld += 1
  }

  const groups = new Map<string, StudioProjection['overview']['groups'][number]>()
  for (const module of dashboard.modules) {
    const entry = groups.get(module.group) ?? { group: module.group, required: 0, required_approved: 0, required_unanswered: 0, pending_review: 0 }
    entry.required += module.required
    entry.required_approved += module.required_approved
    entry.required_unanswered += module.required_unanswered
    entry.pending_review += module.pending_review
    groups.set(module.group, entry)
  }

  // Tokens: hash-approved tokens are approved; everything else is a draft, and template examples say so.
  const compiled = compileTokens(root)
  const approvals = readYaml<{ approved?: Record<string, { value_sha256?: string }> }>(root, 'brand/tokens/approvals.yaml', {}).approved ?? {}
  const policy = readPublicationPolicy(root)
  const tokens: ProjectionToken[] = Object.entries(compiled.flat).map(([id, token]) => {
    const approved = approvals[id]?.value_sha256 === tokenDigest(token)
    const value = token.hex ?? (typeof token.value === 'string' || typeof token.value === 'number' ? String(token.value) : JSON.stringify(token.value))
    return {
      id,
      type: token.type,
      value: value.slice(0, 300),
      state: approved ? 'approved' : 'draft',
      published: approved && policy.approved_token_ids.includes(id),
      source: token.source,
      source_fact: token.sourceFact ?? null,
      example: token.source === 'base' && !approved,
    }
  })

  // Assets: only approved files that pass the core publication inspection get a preview.
  const manifest = readYaml<{ assets?: Array<Record<string, unknown>> }>(root, 'brand/assets/asset-manifest.yaml', {})
  const previews: PreviewFile[] = []
  const assets: ProjectionAsset[] = (manifest.assets ?? []).slice(0, 2000).flatMap((asset) => {
    if (typeof asset.id !== 'string' || typeof asset.path !== 'string') return []
    const status = typeof asset.status === 'string' ? asset.status : 'unknown'
    const approved = status === 'approved' || status === 'published'
    const published = approved && policy.approved_asset_ids.includes(asset.id) && rightsBlocker(root, asset) === null
    const ext = path.extname(asset.path).toLowerCase()
    const mime = PREVIEW_MIME[ext] ?? null
    let preview_key: string | null = null
    let unavailable_reason: ProjectionAsset['unavailable_reason'] = null
    const checksum = typeof asset.checksum_sha256 === 'string' && /^[0-9a-f]{64}$/.test(asset.checksum_sha256) ? asset.checksum_sha256 : null
    if (!approved) unavailable_reason = 'not_approved'
    else if (!mime) unavailable_reason = 'unsupported_type'
    else if (!checksum) unavailable_reason = 'checksum'
    else {
      const inspected = inspectAssetForPublication(root, asset.path, checksum)
      if (inspected.ok) {
        preview_key = checksum
        previews.push({ key: checksum, source: inspected.realPath, mime })
      } else unavailable_reason = inspected.reason === 'missing' ? 'not_present' : inspected.reason === 'checksum' ? 'checksum' : 'unsafe'
    }
    const tags = Array.isArray(asset.tags) ? asset.tags.filter((tag): tag is string => typeof tag === 'string') : []
    const kind = asset.path.split('/')[2] ?? tags[0] ?? 'asset'
    return [
      {
        id: asset.id.slice(0, 200),
        name: (typeof asset.name === 'string' ? asset.name : asset.id).slice(0, 200),
        kind: kind.slice(0, 50),
        status,
        visibility: typeof asset.visibility === 'string' ? asset.visibility : 'internal',
        license: display(asset.license),
        usage: display(asset.usage),
        restrictions: display(asset.restrictions),
        approved,
        published,
        preview_key,
        mime: preview_key ? mime : null,
        unavailable_reason,
      },
    ]
  })

  let mascot: StudioProjection['mascot'] = null
  if (config.modules.mascot.enabled) {
    const catalog = readYaml<{ states?: Array<Record<string, unknown>> }>(root, 'brand/mascot/catalog.yaml', {})
    const stages = readYaml<{ stages?: Array<Record<string, unknown>> }>(root, 'brand/mascot/stages.yaml', {})
    const byStatus: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    let ready = 0
    for (const state of catalog.states ?? []) {
      const status = typeof state.status === 'string' ? state.status : 'defined'
      byStatus[status] = (byStatus[status] ?? 0) + 1
      const category = typeof state.category === 'string' ? state.category : 'other'
      byCategory[category] = (byCategory[category] ?? 0) + 1
      if ((status === 'approved' || status === 'published') && Array.isArray(state.source_assets) && state.source_assets.length > 0) ready += 1
    }
    mascot = {
      states: (catalog.states ?? []).length,
      by_status: byStatus,
      by_category: byCategory,
      artwork_ready: ready,
      stages: (stages.stages ?? []).slice(0, 50).map((stage) => ({ id: String(stage.id).slice(0, 100), name: String(stage.name ?? stage.id).slice(0, 100), status: String(stage.status ?? 'draft') })),
    }
  }

  const projection: StudioProjection = {
    schema_version: 1,
    brand: {
      name: config.brand.name,
      name_status: String(config.brand.name_status ?? 'unknown'),
      slug: config.brand.slug,
      profile: config.brand.profile ?? 'universal',
      kind: personal || config.brand.profile === 'personal-brand' ? 'personal-brand' : 'business',
      industry: String(config.brand.industry ?? 'TBD'),
      default_locale: config.brand.default_locale,
      supported_locales: [...config.brand.supported_locales],
      publish_docs: config.brand.publish_docs,
      status: String(config.brand.status ?? 'draft'),
      initialized: config.brand.initialized === true,
      modules: { mascot: config.modules.mascot.enabled, gamification: config.modules.gamification.enabled, personal, facets },
    },
    overview: {
      coverage: dashboard.coverage.coverage,
      approval: dashboard.coverage.approval,
      required: dashboard.coverage.required,
      required_unanswered: dashboard.coverage.required_unanswered,
      pending_review: dashboard.review_queue.pending,
      approved_facts: approvedCount,
      restricted_withheld: restrictedWithheld,
      contradictions: dashboard.contradictions.length,
      groups: [...groups.values()],
      next: dashboard.next.slice(0, 8),
    },
    modules: dashboard.modules,
    review: dashboard.review_queue.items.slice(0, 300).map((item) => ({
      question_id: item.question_id,
      module: item.module,
      label: item.label,
      state: item.state,
      withheld: item.withheld,
      draft_value: item.withheld ? null : display(item.draft_value),
      approved_value: item.withheld ? null : display(item.approved_value),
      approved_version: item.approved_version,
      reason: item.reason,
    })),
    contradictions: dashboard.contradictions.slice(0, 100),
    documents,
    tokens: { items: tokens, approved: tokens.filter((token) => token.state === 'approved').length, draft: tokens.filter((token) => token.state === 'draft').length, errors: compiled.errors.length },
    assets,
    mascot,
    personal: personal ? { facets, documents: personalDocs } : null,
  }
  assertNoSecrets(projection)
  return { projection, previews }
}
