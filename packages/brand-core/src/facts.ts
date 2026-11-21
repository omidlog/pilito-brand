import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { readYaml, writeYaml } from './fsutil.js'

export interface CanonicalFact {
  id: string
  brand_id: string
  module: string
  value: unknown
  value_type: string
  status: string
  classification: 'public' | 'internal' | 'restricted'
  publication: 'unpublished' | 'published'
  source: {
    kind: string
    answer_ids: string[]
    reference_ids: string[]
    citation_paths: string[]
    observed_at: string | null
  }
  confidence: number | null
  assumptions: string[]
  owner: string | null
  reviewer_id: string | null
  approved_at: string | null
  version: number
  revision_hash: string | null
  review_due: string | null
  related_ids: string[]
  private_ref: string | null
}

interface FactFile {
  schema_version: number
  facts: Record<string, CanonicalFact>
}

function factPath(root: string, kind: 'approved' | 'draft'): string {
  return path.join(root, 'brand', 'instance', kind === 'approved' ? 'approved-facts.yaml' : 'draft-facts.yaml')
}

function classificationOf(raw: Record<string, unknown>): CanonicalFact['classification'] {
  const value = String(raw.classification ?? raw.visibility ?? 'internal')
  if (value === 'public' || value === 'restricted') return value
  return 'internal'
}

export function normalizeFact(id: string, raw: Record<string, unknown>, brandId: string): CanonicalFact {
  if (raw.classification && raw.source && raw.id) return raw as unknown as CanonicalFact
  const value = raw.value ?? null
  return {
    id,
    brand_id: String(raw.brand_id ?? brandId),
    module: String(raw.module ?? id.split('.')[0] ?? 'brand'),
    value,
    value_type: String(raw.value_type ?? 'text'),
    status: String(raw.status ?? 'draft'),
    classification: classificationOf(raw),
    publication: raw.publication === 'published' ? 'published' : 'unpublished',
    source: {
      kind: 'interview',
      answer_ids: raw.answer_id ? [String(raw.answer_id)] : [],
      reference_ids: [],
      citation_paths: ['brand/instance/approved-facts.yaml'],
      observed_at: raw.updated ? String(raw.updated) : null,
    },
    confidence: null,
    assumptions: [],
    owner: null,
    reviewer_id: raw.approved_by ? String(raw.approved_by) : null,
    approved_at: raw.status === 'approved' && raw.updated ? String(raw.updated) : null,
    version: typeof raw.version === 'number' ? raw.version : 1,
    revision_hash: crypto.createHash('sha256').update(`${id}:${JSON.stringify(value)}`).digest('hex'),
    review_due: null,
    related_ids: [],
    private_ref: raw.private_ref ? String(raw.private_ref) : null,
  }
}

export function readFacts(root: string, kind: 'approved' | 'draft', brandId: string): Record<string, CanonicalFact> {
  const file = factPath(root, kind)
  if (!fs.existsSync(file)) return {}
  const doc = readYaml<{ schema_version?: number; facts?: Record<string, Record<string, unknown>> }>(file)
  const facts: Record<string, CanonicalFact> = {}
  for (const [id, raw] of Object.entries(doc.facts ?? {})) facts[id] = normalizeFact(id, raw, brandId)
  return facts
}

export function writeFacts(root: string, kind: 'approved' | 'draft', facts: Record<string, CanonicalFact>): void {
  const body: FactFile = { schema_version: 2, facts }
  writeYaml(factPath(root, kind), body)
}

export function migrateFactFiles(root: string, brandId: string): { changed: string[]; schema: 2 } {
  const changed: string[] = []
  for (const kind of ['approved', 'draft'] as const) {
    const file = factPath(root, kind)
    if (!fs.existsSync(file)) continue
    const before = fs.readFileSync(file, 'utf8')
    const doc = readYaml<{ schema_version?: number; facts?: Record<string, Record<string, unknown>> }>(file)
    if (doc.schema_version === 2 && before.includes('classification:')) continue
    const facts: Record<string, CanonicalFact> = {}
    for (const [id, raw] of Object.entries(doc.facts ?? {})) facts[id] = normalizeFact(id, raw ?? {}, brandId)
    writeFacts(root, kind, facts)
    if (fs.readFileSync(file, 'utf8') !== before) changed.push(file)
  }
  return { changed, schema: 2 }
}
