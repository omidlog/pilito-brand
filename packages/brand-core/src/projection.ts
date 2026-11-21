import crypto from 'node:crypto'
import type { InterviewEngine } from './engine.js'
import { readFacts } from './facts.js'
import { factIsPublic } from './publication.js'

export interface PublicFact {
  id: string
  value: string
  status: 'approved'
  visibility: 'public'
  publication: 'published'
  version: number
  revision_hash: string
  source_id: string
}

export interface PublicBrandProjection {
  schema_version: 1
  brand_id: string
  display_name: string | null
  release: { version: string; content_hash: string }
  facts: PublicFact[]
}

export function exportPublic(engine: InterviewEngine): PublicBrandProjection {
  const facts = publishedFacts(engine)
  const brandId = engine.config().brand.slug
  const display = facts.find((fact) => fact.id === 'business.identity.trade_name')?.value ?? null
  const body = facts.map((fact) => `${fact.id}:${fact.revision_hash}`).join('|')
  return {
    schema_version: 1,
    brand_id: brandId,
    display_name: display,
    release: { version: engine.config().brand.version, content_hash: crypto.createHash('sha256').update(body).digest('hex') },
    facts,
  }
}

export function publishedFacts(engine: InterviewEngine): PublicFact[] {
  if (engine.config().brand.publish_docs !== 'public') return []
  const fileFacts = readFacts(engine.workspaceRoot(), 'approved', engine.config().brand.slug)
  const facts: PublicFact[] = []
  for (const [id, fact] of Object.entries(fileFacts)) {
    if (!factIsPublic(engine.workspaceRoot(), id, fact, engine.config().brand.slug)) continue
    const value = String(fact.value)
    facts.push({
      id,
      value,
      status: 'approved',
      visibility: 'public',
      publication: 'published',
      version: fact.version ?? 1,
      revision_hash: crypto.createHash('sha256').update(`${id}:${value}`).digest('hex'),
      source_id: fact.source.answer_ids[0] ?? id,
    })
  }
  return facts.sort((a, b) => a.id.localeCompare(b.id))
}

