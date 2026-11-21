import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { CanonicalFact } from './facts.js'
import { readFacts, writeFacts } from './facts.js'
import { readYaml, writeYaml } from './fsutil.js'
import { privateDataRefusal } from './personal-privacy.js'
import type { FieldQuestion, PublicationRequirement } from './types.js'

/**
 * Evidence & rights register (Personal Brand OS).
 *
 * `brand/interview/evidence-register.yaml` is Git-tracked and holds references only: what a source
 * is, which claim it supports, and its review state. Contents are never fetched or copied. Two kinds:
 * - verification: supports a factual claim (a degree, a talk, a result).
 * - permission: a right to publish (a client's consent for a case study, a photographer's licence).
 *
 * Rules:
 * - Anyone (including an agent) may record evidence. It starts `pending`.
 * - Only the owner, with the approval proof, marks it `verified` or `rejected`.
 * - Owner testimony is recorded and shown as owner-stated. It never counts as independent verification.
 * - Withdrawing evidence needs no proof (it only restricts) and unpublishes every claim whose
 *   publication gate no longer passes.
 * - A `review_due` date in the past makes the evidence stale: it stops counting until re-verified.
 */

export const EVIDENCE_KINDS = ['verification', 'permission'] as const
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number]
export const EVIDENCE_SOURCES = ['owner_testimony', 'document', 'public_record', 'third_party', 'link'] as const
export type EvidenceSource = (typeof EVIDENCE_SOURCES)[number]
export const EVIDENCE_STATUSES = ['pending', 'verified', 'rejected', 'withdrawn'] as const
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export interface EvidenceItem {
  id: string
  claim_id: string
  kind: EvidenceKind
  source_type: EvidenceSource
  /** A URL or a plain description of where the source is held. Never the content itself. */
  reference: string
  /** Optional short quotation from the source. */
  quote: string | null
  note: string | null
  /** For permissions: who granted it (a role or organization, not contact details). */
  granted_by: string | null
  /** For permissions: `public` allows public release; `internal` does not. */
  scope: 'public' | 'internal' | null
  status: EvidenceStatus
  recorded_at: string
  recorded_by: string
  verified_at: string | null
  verified_by: string | null
  review_due: string | null
  status_reason: string | null
}

export interface EvidenceFile {
  schema_version: 1
  note: string
  items: EvidenceItem[]
}

export type ClaimVerification = 'verified' | 'owner_stated' | 'unverified' | 'not_required'

export const EVIDENCE_LIMITS = { reference: 500, quote: 400, note: 400, grantedBy: 120 } as const
const NOTE = 'References only. Contents are not fetched or stored. Status changes to verified or rejected need the owner approval proof.'

export function evidencePath(root: string): string {
  return path.join(root, 'brand', 'interview', 'evidence-register.yaml')
}

export function readEvidence(root: string): EvidenceItem[] {
  const file = evidencePath(root)
  if (!fs.existsSync(file)) return []
  const doc = readYaml<Partial<EvidenceFile> | null>(file)
  if (!doc || !Array.isArray(doc.items)) throw new Error('Invalid evidence register: expected items')
  return doc.items
}

function writeEvidence(root: string, items: EvidenceItem[]): void {
  writeYaml(evidencePath(root), { schema_version: 1, note: NOTE, items } satisfies EvidenceFile)
}

function day(now: Date): string {
  return now.toISOString().slice(0, 10)
}

/** True when the evidence counts today: verified and not past its review date. */
export function isCurrent(item: EvidenceItem, now: Date): boolean {
  return item.status === 'verified' && (!item.review_due || item.review_due >= day(now))
}

export interface AddEvidenceInput {
  claim_id: string
  kind: EvidenceKind
  source_type: EvidenceSource
  reference: string
  quote?: string | null
  note?: string | null
  granted_by?: string | null
  scope?: 'public' | 'internal' | null
  review_due?: string | null
  recorded_by?: string
}

/** Record a source for a claim. It starts pending; nothing becomes verified here. */
export function addEvidence(root: string, questions: FieldQuestion[], input: AddEvidenceInput, now = new Date()): EvidenceItem {
  const question = questions.find((item) => item.id === input.claim_id)
  if (!question) throw new Error(`Unknown claim ${input.claim_id}. Use a question id.`)
  if (question.sensitivity === 'restricted') throw new Error('Restricted claims do not take evidence in the Git-tracked register.')
  if (!(EVIDENCE_KINDS as readonly string[]).includes(input.kind)) throw new Error(`Kind must be one of ${EVIDENCE_KINDS.join(', ')}.`)
  if (!(EVIDENCE_SOURCES as readonly string[]).includes(input.source_type)) throw new Error(`Source must be one of ${EVIDENCE_SOURCES.join(', ')}.`)
  const reference = input.reference.trim()
  if (!reference || reference.length > EVIDENCE_LIMITS.reference) throw new Error(`Reference must be 1 to ${EVIDENCE_LIMITS.reference} characters.`)
  const quote = input.quote?.trim() || null
  const note = input.note?.trim() || null
  const grantedBy = input.granted_by?.trim() || null
  if (quote && quote.length > EVIDENCE_LIMITS.quote) throw new Error(`Quote must be at most ${EVIDENCE_LIMITS.quote} characters.`)
  if (note && note.length > EVIDENCE_LIMITS.note) throw new Error(`Note must be at most ${EVIDENCE_LIMITS.note} characters.`)
  if (grantedBy && grantedBy.length > EVIDENCE_LIMITS.grantedBy) throw new Error(`Granted by must be at most ${EVIDENCE_LIMITS.grantedBy} characters.`)
  if (input.review_due && !/^\d{4}-\d{2}-\d{2}$/.test(input.review_due)) throw new Error('Review date must be YYYY-MM-DD.')
  if (input.kind === 'permission' && !input.scope) throw new Error('A permission needs a scope: public or internal.')
  // The register is tracked in Git: the same privacy rules as personal answers apply.
  for (const text of [reference, quote, note, grantedBy]) {
    const refusal = text ? privateDataRefusal({ id: input.claim_id, contact_field: false }, text) : null
    if (refusal) throw new Error(refusal.replace('Nothing was saved.', 'Nothing was recorded.'))
  }
  const items = readEvidence(root)
  const item: EvidenceItem = {
    id: `ev-${String(items.length + 1).padStart(4, '0')}`,
    claim_id: input.claim_id,
    kind: input.kind,
    source_type: input.source_type,
    reference,
    quote,
    note,
    granted_by: grantedBy,
    scope: input.kind === 'permission' ? (input.scope ?? null) : null,
    status: 'pending',
    recorded_at: now.toISOString(),
    recorded_by: input.recorded_by ?? 'owner',
    verified_at: null,
    verified_by: null,
    review_due: input.review_due ?? null,
    status_reason: null,
  }
  writeEvidence(root, [...items, item])
  return item
}

/** Owner review. The caller has already checked the approval proof. */
export function reviewEvidence(root: string, id: string, decision: 'verified' | 'rejected', actor: string, now = new Date(), reason: string | null = null): EvidenceItem {
  const items = readEvidence(root)
  const item = items.find((entry) => entry.id === id)
  if (!item) throw new Error(`No evidence ${id}.`)
  if (item.status === 'withdrawn') throw new Error(`${id} was withdrawn. Record a new item instead.`)
  item.status = decision
  item.verified_at = now.toISOString()
  item.verified_by = actor
  item.status_reason = reason
  writeEvidence(root, items)
  return item
}

/** Withdraw evidence (for example a client revoked consent). Needs no proof: it only restricts. */
export function withdrawEvidence(root: string, id: string, reason: string, now = new Date()): EvidenceItem {
  const items = readEvidence(root)
  const item = items.find((entry) => entry.id === id)
  if (!item) throw new Error(`No evidence ${id}.`)
  item.status = 'withdrawn'
  item.status_reason = reason.trim().slice(0, EVIDENCE_LIMITS.note) || 'Withdrawn.'
  item.verified_at = item.verified_at ?? null
  item.verified_by = item.verified_by ?? null
  item.status_reason = `${item.status_reason} (${now.toISOString().slice(0, 10)})`
  writeEvidence(root, items)
  return item
}

/** Current evidence for a claim, split by what it can prove. */
export function evidenceFor(claimId: string, items: EvidenceItem[], now: Date) {
  const mine = items.filter((item) => item.claim_id === claimId)
  return {
    all: mine,
    independent: mine.filter((item) => item.kind === 'verification' && item.source_type !== 'owner_testimony' && isCurrent(item, now)),
    testimony: mine.filter((item) => item.kind === 'verification' && item.source_type === 'owner_testimony' && item.status !== 'withdrawn' && item.status !== 'rejected'),
    permissions: mine.filter((item) => item.kind === 'permission' && item.scope === 'public' && isCurrent(item, now)),
  }
}

/** How a claim is labelled wherever it is shown. Owner testimony is never shown as verified. */
export function claimVerification(question: Pick<FieldQuestion, 'id' | 'publication_requires'>, items: EvidenceItem[], now: Date): ClaimVerification {
  const found = evidenceFor(question.id, items, now)
  if (found.independent.length) return 'verified'
  if (!question.publication_requires?.includes('verified_evidence')) return found.testimony.length ? 'owner_stated' : 'not_required'
  return found.testimony.length ? 'owner_stated' : 'unverified'
}

/** Reasons a claim cannot be published today, beyond approval and classification. Empty means none. */
export function publicationBlockers(question: Pick<FieldQuestion, 'id' | 'publication_requires' | 'contact_field'>, value: unknown, items: EvidenceItem[], now: Date): string[] {
  const blockers: string[] = []
  const found = evidenceFor(question.id, items, now)
  const requires: PublicationRequirement[] = question.publication_requires ?? []
  if (requires.includes('verified_evidence') && found.independent.length === 0) {
    blockers.push(
      found.testimony.length
        ? 'Only owner testimony supports this claim. Publication needs an independent source verified with brand:evidence verify.'
        : 'No verified, current evidence. Record a source with brand:evidence add and verify it.',
    )
  }
  if (requires.includes('rights_permission') && found.permissions.length === 0) {
    blockers.push('No verified, current public-use permission. Record it with brand:evidence add --kind permission --scope public and verify it.')
  }
  if (question.id.startsWith('personal.') && value !== null && value !== undefined) {
    const refusal = privateDataRefusal(question, value)
    if (refusal) blockers.push('The value looks like it contains private personal data. It cannot be published.')
  }
  return blockers
}

/** Publication requirements by question id, read from the workspace question bank. */
type Requirement = Pick<FieldQuestion, 'id' | 'publication_requires' | 'contact_field'>
const requirementCache = new Map<string, { key: string; value: Map<string, Requirement> }>()

export function requirementsFrom(root: string): Map<string, Requirement> {
  const dir = path.join(root, 'brand', 'interview', 'question-bank')
  const out = new Map<string, Requirement>()
  if (!fs.existsSync(dir)) return out
  const names = fs.readdirSync(dir).filter((entry) => entry.endsWith('.yaml')).sort()
  // Re-read only when a bank file changed, so the public build can call this per fact.
  const key = names.map((name) => {
    const stat = fs.statSync(path.join(dir, name))
    return `${name}:${stat.size}:${stat.mtimeMs}`
  }).join('|')
  const cached = requirementCache.get(dir)
  if (cached?.key === key) return cached.value
  requirementCache.set(dir, { key, value: out })
  for (const name of names) {
    const doc = parse(fs.readFileSync(path.join(dir, name), 'utf8')) as { questions?: FieldQuestion[] } | null
    for (const question of doc?.questions ?? []) {
      if (question.id.startsWith('personal.') || question.publication_requires?.length) {
        out.set(question.id, { id: question.id, publication_requires: question.publication_requires, contact_field: question.contact_field })
      }
    }
  }
  return out
}

/** Gate used by every public projection. Facts without personal or publication requirements always pass. */
export function gatePasses(root: string, id: string, value: unknown, now = new Date()): boolean {
  const question = requirementsFrom(root).get(id)
  if (!question) return true
  return publicationBlockers(question, value, readEvidence(root), now).length === 0
}

/**
 * Unpublish every published fact whose gate fails now (after a withdrawal, a rejection or an expired
 * review date). Restricting needs no proof. Returns the ids that were unpublished.
 */
export function unpublishBlocked(root: string, brandId: string, now = new Date()): string[] {
  const facts = readFacts(root, 'approved', brandId)
  const items = readEvidence(root)
  const requirements = requirementsFrom(root)
  const removed: string[] = []
  for (const [id, fact] of Object.entries(facts) as Array<[string, CanonicalFact]>) {
    const question = requirements.get(id)
    if (!question || fact.publication !== 'published') continue
    if (publicationBlockers(question, fact.value, items, now).length > 0) {
      fact.publication = 'unpublished'
      removed.push(id)
    }
  }
  const policyFile = path.join(root, 'brand', 'publication-policy.yaml')
  const policy = fs.existsSync(policyFile) ? readYaml<Record<string, unknown>>(policyFile) : null
  const listed = Array.isArray(policy?.approved_fact_ids) ? (policy.approved_fact_ids as string[]) : []
  const stale = listed.filter((id) => {
    const question = requirements.get(id)
    return question !== undefined && !removed.includes(id) && publicationBlockers(question, facts[id]?.value, items, now).length > 0
  })
  removed.push(...stale)
  if (removed.length) {
    writeFacts(root, 'approved', facts)
    if (policy) {
      policy.approved_fact_ids = listed.filter((id) => !removed.includes(id))
      writeYaml(policyFile, policy)
    }
  }
  return removed
}
