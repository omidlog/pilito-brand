import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { allQuestions } from './content/index.js'
import { STARTER_PROFILES } from './content/profiles.js'
import { readYaml, writeAtomic, writeYaml } from './fsutil.js'
import type { FieldQuestion } from './types.js'

/**
 * Personal Brand OS: canonical references between person facts and business/brand facts, and the
 * additive migration that brings a pre-Phase-8 brand repository up to date without changing any
 * answer, fact, or module prose.
 */

export interface CanonicalReference {
  concept: string
  /** The one authoritative question id for this concept. */
  canonical: string
  /** Ids that must reference `canonical` instead of storing a second value. */
  referenced_by: string[]
  rule: string
}

/**
 * One authoritative fact per statement. A personal brand reuses the shared voice and visual questions
 * by id, and keeps the person and the company as separate entities connected by an explicit
 * relationship. These references are validated (every id must exist) and shown in the docs.
 */
export const PERSONAL_CANONICAL_REFERENCES: CanonicalReference[] = [
  {
    concept: 'Person name vs company name',
    canonical: 'personal.identity.public_name',
    referenced_by: ['business.identity.trade_name'],
    rule: 'The person’s public name and a company’s trade name are different entities. Neither is copied into the other. For a personal-brand profile the approved public name becomes brand.name; a company trade name never renames a personal brand.',
  },
  {
    concept: 'Person-to-organization relationship',
    canonical: 'personal.experience.relationships',
    referenced_by: ['personal.experience.roles', 'personal.founder.ventures'],
    rule: 'Each organization has one relationship row with relation, dates and an explicit ownership state. Founding, working at or advising never implies ownership; ownership is "unstated" unless the person states it.',
  },
  {
    concept: 'Offers',
    canonical: 'personal.services.offers',
    referenced_by: ['business.offer.summary', 'personal.consulting.engagements'],
    rule: 'The person’s own offers live in personal.services.offers. When the person sells through a company, business.offer.summary is canonical for the company offer and personal documents reference it.',
  },
  {
    concept: 'Voice',
    canonical: 'brand.verbal.voice',
    referenced_by: ['personal.content.channel_tone'],
    rule: 'One voice. Channel tone records variations of brand.verbal.voice, not a second voice.',
  },
  {
    concept: 'Forbidden language',
    canonical: 'brand.verbal.forbidden',
    referenced_by: ['personal.governance.public_claim_policy'],
    rule: 'Banned words live in brand.verbal.forbidden. The public claim policy lists claims that need a source, not words.',
  },
  {
    concept: 'Translation style',
    canonical: 'brand.verbal.localization',
    referenced_by: ['personal.identity.localized_headline', 'personal.identity.name_forms'],
    rule: 'Translation rules live in brand.verbal.localization. Localized headlines and name forms are separate claims that are approved one by one, never auto-approved.',
  },
  {
    concept: 'Photography',
    canonical: 'brand.photo.direction',
    referenced_by: ['personal.media.photo_guidelines'],
    rule: 'brand.photo.direction covers all photography. personal.media.photo_guidelines covers only how the person is portrayed.',
  },
  {
    concept: 'Booking and inquiry contact',
    canonical: 'personal.contact.public_channels',
    referenced_by: ['personal.consulting.cta'],
    rule: 'The public professional contact is recorded once. Calls to action point at it.',
  },
]

/** Validation: every id in the reference table exists in the question bank. */
export function canonicalReferenceErrors(questions: FieldQuestion[]): string[] {
  const ids = new Set(questions.map((question) => question.id))
  const errors: string[] = []
  for (const reference of PERSONAL_CANONICAL_REFERENCES) {
    for (const id of [reference.canonical, ...reference.referenced_by]) {
      if (!ids.has(id)) errors.push(`Canonical reference "${reference.concept}" points at missing question ${id}`)
    }
  }
  return errors
}

/** Write any starter interview profile file that is missing. Existing (possibly edited) files are kept. */
export function ensureStarterProfiles(root: string): string[] {
  const written: string[] = []
  for (const profile of STARTER_PROFILES) {
    const file = path.join(root, 'brand', 'interview', 'profiles', `${profile.id}.yaml`)
    if (fs.existsSync(file)) continue
    writeYaml(file, profile)
    written.push(path.relative(root, file).split(path.sep).join('/'))
  }
  return written
}

/**
 * Additive Personal Brand OS migration. Adds the personal question bank, the personal-brand profile,
 * the matching field-registry and knowledge-graph entries, and `modules.personal: { enabled: false }`
 * to brand.config.yaml when they are missing. It never edits an existing question, answer or fact,
 * so an upgraded `universal` brand behaves exactly as before.
 */
export function migratePersonal(root: string): string[] {
  const touched: string[] = []
  const rel = (file: string): string => path.relative(root, file).split(path.sep).join('/')
  const personal = allQuestions().filter((question) => question.module.startsWith('personal'))

  const bankDir = path.join(root, 'brand', 'interview', 'question-bank')
  if (fs.existsSync(bankDir)) {
    const bank = path.join(bankDir, 'personal.yaml')
    const existing = new Set<string>()
    for (const name of fs.readdirSync(bankDir).filter((entry) => entry.endsWith('.yaml'))) {
      for (const question of readYaml<{ questions?: FieldQuestion[] }>(path.join(bankDir, name)).questions ?? []) existing.add(question.id)
    }
    if (!fs.existsSync(bank) && !personal.some((question) => existing.has(question.id))) {
      writeYaml(bank, { schema_version: 1, questions: personal })
      touched.push(rel(bank))
    }
  }

  const registryFile = path.join(root, 'brand', 'interview', 'field-registry.yaml')
  if (fs.existsSync(registryFile)) {
    const registry = readYaml<{ schema_version?: number; fields?: Array<{ id: string }> }>(registryFile)
    const fields = registry.fields ?? []
    const known = new Set(fields.map((field) => field.id))
    const added = personal.filter((question) => !known.has(question.field_path))
    if (added.length) {
      registry.fields = [...fields, ...added.map(registryEntry)]
      writeYaml(registryFile, registry)
      touched.push(rel(registryFile))
    }
  }

  const graphFile = path.join(root, 'brand', 'interview', 'knowledge-graph.yaml')
  if (fs.existsSync(graphFile)) {
    const graph = readYaml<{ schema_version?: number; edges?: Array<{ from: string; to: string; relation: string }> }>(graphFile)
    const edges = graph.edges ?? []
    const key = (edge: { from: string; to: string; relation: string }) => `${edge.from}>${edge.to}>${edge.relation}`
    const known = new Set(edges.map(key))
    const added = personalEdges(personal).filter((edge) => !known.has(key(edge)))
    if (added.length) {
      graph.edges = [...edges, ...added]
      writeYaml(graphFile, graph)
      touched.push(rel(graphFile))
    }
  }

  touched.push(...ensureStarterProfiles(root))

  const configFile = path.join(root, 'brand', 'brand.config.yaml')
  if (fs.existsSync(configFile)) {
    const text = fs.readFileSync(configFile, 'utf8')
    const config = parse(text) as { modules?: Record<string, unknown> } | null
    if (config && typeof config === 'object' && config.modules && typeof config.modules === 'object' && !('personal' in config.modules)) {
      // Appended as text so comments and key order in the owner's config are preserved.
      const block = [
        '  personal:',
        '    enabled: false',
        '    facets: []',
        '    note: Personal Brand OS. Turn on for a person-centered brand (brand:init --profile personal-brand).',
      ].join('\n')
      const next = insertIntoModules(text, block)
      if (next !== text && (parse(next) as { modules?: Record<string, unknown> }).modules?.personal) {
        writeAtomic(configFile, next)
        touched.push(rel(configFile))
      }
    }
  }
  return touched
}

/** Insert a block at the end of the top-level `modules:` mapping, keeping everything else byte-for-byte. */
function insertIntoModules(text: string, block: string): string {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => /^modules:\s*$/.test(line))
  if (start === -1) return text
  let end = start + 1
  while (end < lines.length && (lines[end] === '' || /^\s/.test(lines[end] ?? '') || (lines[end] ?? '').startsWith('#'))) end += 1
  while (end > start + 1 && (lines[end - 1] ?? '').trim() === '') end -= 1
  return [...lines.slice(0, end), block, ...lines.slice(end)].join('\n')
}

export function registryEntry(question: FieldQuestion) {
  return {
    id: question.field_path,
    module: question.module,
    field_path: question.field_path,
    label: question.label,
    required: question.required,
    weight: question.weight,
    sensitivity: question.sensitivity,
    question_ids: [question.id],
    documents: question.related_outputs,
    validator: question.completion_rule,
    related_ids: question.related_ids,
  }
}

export function personalEdges(questions: FieldQuestion[]) {
  return questions.flatMap((question) => [
    ...question.depends_on.map((dependency) => ({ from: dependency, to: question.id, relation: 'prerequisite' })),
    ...question.related_ids.map((related) => ({ from: question.id, to: related, relation: 'related' })),
  ])
}
