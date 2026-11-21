import type { LlmConfig } from './llm/provider.js'
export const STATUSES = [
  'not_started',
  'unanswered',
  'draft',
  'in_review',
  'approved',
  'deprecated',
  'not_applicable',
  'skipped',
  'unknown',
] as const

export type Status = (typeof STATUSES)[number]

export const VISIBILITIES = ['public', 'internal', 'restricted'] as const
export type Visibility = (typeof VISIBILITIES)[number]

export const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const QUESTION_TYPES = [
  'short_text',
  'long_text',
  'single_choice',
  'boolean',
  'number',
  'url',
  // Structured brand-core types. Stored as one canonical string; see structured.ts.
  'color',
  'font',
  'logo_spec',
  'voice_pairs',
  // Personal Brand OS: a person's organizations with an explicit relation, dates and ownership.
  'relationships',
] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const SOURCE_TYPES = [
  'owner',
  'approved_import',
  'external_cited',
  'agent_suggestion',
  'system',
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

export const AUTHORITIES = [
  'unverified',
  'estimated',
  'confirmed_by_owner',
  'independently_verified',
] as const
export type Authority = (typeof AUTHORITIES)[number]

/**
 * What a public release of a claim needs beyond approval. Checked by the publication gate
 * (approval.ts) against the evidence register (evidence.ts).
 * - verified_evidence: at least one verified, independent, unexpired source. Owner testimony never counts.
 * - rights_permission: a verified, unexpired permission record (client, testimonial giver, photographed person).
 */
export const PUBLICATION_REQUIREMENTS = ['verified_evidence', 'rights_permission'] as const
export type PublicationRequirement = (typeof PUBLICATION_REQUIREMENTS)[number]

/** Personal Brand OS facets. A person may combine several; each adds a short question group. */
export const PERSONAL_FACETS = ['founder-executive', 'consultant-expert', 'creator-educator', 'artist-designer', 'speaker-author'] as const
export type PersonalFacet = (typeof PERSONAL_FACETS)[number]

export interface PersonalModuleConfig {
  enabled: boolean
  facets: PersonalFacet[]
  note?: string
}

export interface LocalizedPrompt {
  en: string
  fa: string
  tr: string
}

export interface FieldQuestion {
  id: string
  module: string
  field_path: string
  label: string
  prompt: LocalizedPrompt
  why_it_matters: string
  question_type: QuestionType
  examples: string[]
  options?: string[]
  suggestions?: string[]
  validation?: { min_length?: number; max_length?: number }
  required_when?: string
  skip_when?: string
  depends_on: string[]
  priority: Priority
  order: number
  sensitivity: Visibility
  /** Explicit approval grant. Preferred over the id-based guess in permissions.ts. Restricted questions must use `financial`. */
  approval_grant?: 'financial' | 'visual' | 'public_copy' | 'canonical'
  /** Conditions a public release of this claim must meet beyond approval. */
  publication_requires?: PublicationRequirement[]
  /** A professional contact field. Email addresses and contact URLs are expected here and nowhere else in the personal modules. */
  contact_field?: boolean
  language: Array<'en' | 'fa' | 'tr'>
  source_types: SourceType[]
  related_outputs: string[]
  related_ids: string[]
  completion_rule: 'non_empty' | 'disposition' | 'one_of' | 'boolean' | 'number' | 'url' | 'structured'
  allows_unknown: boolean
  required: boolean
  weight: number
  sector_hints: string[]
  status: 'unanswered'
}

export interface ModuleDef {
  id: string
  code: string
  group: 'brand' | 'business' | 'personal' | 'system'
  title: string
  /** Repository directory that holds the human-readable module. */
  dir: string
  /** Docs site path, without a leading slash. */
  docPath: string
  draftPath: string
  owner: string
  purpose: string
  decision: string
  optional?: 'mascot' | 'gamification' | 'personal'
  /** Personal facet that this module belongs to. Its questions skip when the facet is not selected. */
  facet?: PersonalFacet
  dependsOn: string[]
  guidance: string[]
  dos: string[]
  donts: string[]
  checklist: string[]
  example: string
  inputs: string[]
  artifacts: string[]
  acceptance: string[]
  metrics: string[]
  cadence: string
  fields: FieldQuestion[]
  /** Question ids owned by another module that this module must show and not redefine. */
  references: string[]
}

export interface AnswerRecord {
  answer_id: string
  question_id: string
  value: string | number | boolean | null
  raw_answer: string | null
  source_type: SourceType | null
  source_reference: string | null
  authority: Authority
  confidence: number | null
  status: Status
  last_updated: string | null
  reviewed_by: string | null
  visibility: Visibility
  uncertainty: string | null
  session_id: string
  normalized: string | number | boolean | null
  superseded_by: string | null
  disposition_reason: string | null
  /** Opaque id in the gitignored encrypted store. Never a restricted value. */
  private_ref?: string | null
  /** Set when the answer came from an interview proposal (agent or model extraction). */
  proposal_state?: ProposalState | null
}

/**
 * How certain an extracted interview proposal is.
 * - proposed: the owner stated it; still a draft until a human approves it.
 * - tentative: the owner described it as possible or future ("we may…"); never a decision.
 * - unresolved: the owner said it is not decided; no value is stored.
 */
export const PROPOSAL_STATES = ['proposed', 'tentative', 'unresolved'] as const
export type ProposalState = (typeof PROPOSAL_STATES)[number]

/** A `note:` proposal waiting for `accept proposal N`. `state` is set when it came from free-text rules. */
export interface PendingProposal {
  question_id: string
  value: string
  quotation: string
  state?: ProposalState
  confidence?: number
}

export interface SessionState {
  session_id: string | null
  status: 'idle' | 'active' | 'paused' | 'complete'
  locale: 'en' | 'fa' | 'tr'
  history: string[]
  deferred: string[]
  pending_suggestions: string[]
  cursor_question_id: string | null
  pending_proposals: PendingProposal[]
  started_at: string | null
  updated_at: string | null
  last_answer_id: string | null
}

export interface BrandConfig {
  schema_version: number
  brand: {
    name: string
    name_status: 'placeholder' | 'working' | 'approved'
    working_name: string | null
    working_name_status: 'draft' | 'approved' | null
    slug: string
    legal_name: string
    tagline: string
    industry: string
    sector: string
    stage: string
    new_or_existing: string
    website: string | null
    default_locale: string
    supported_locales: string[]
    profile: string
    publish_docs: 'public' | 'private'
    status: string
    version: string
    initialized?: boolean
  }
  capabilities: Record<string, boolean>
  modules: {
    mascot: { enabled: boolean; note: string }
    gamification: { enabled: boolean; note: string }
    /** Personal Brand OS. Absent in configs written before Phase 8, which means disabled. */
    personal?: PersonalModuleConfig
  }
  design: {
    figma: { file_url: string | null; file_key: string | null; library_url: string | null }
    token_source: string
  }
  assets: { storage: string; lfs: boolean; bucket_url: string | null }
  links: Record<string, string | null>
  /** Optional model provider for `brand:interview --assist`. Absent or provider none means no model. */
  llm?: LlmConfig
}

export interface LedgerFile {
  schema_version: number
  records: AnswerRecord[]
}

export interface Contradiction {
  id: string
  rule: string
  severity: 'high' | 'medium' | 'low'
  message: string
  fields: string[]
  status: 'open' | 'resolved'
}

export interface FieldRegistryEntry {
  id: string
  module: string
  field_path: string
  label: string
  required: boolean
  weight: number
  sensitivity: Visibility
  question_ids: string[]
  documents: string[]
  validator: string
  related_ids: string[]
}
