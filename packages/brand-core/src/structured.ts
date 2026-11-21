import type { FieldQuestion, QuestionType } from './types.js'

/**
 * Structured answer types for the brand core: color, font, logo_spec and voice_pairs.
 *
 * The ledger stores scalar values, so a structured answer is stored as one canonical string.
 * `normalizeStructured` validates the owner's text and returns that canonical form. `parseStructured`
 * turns a stored canonical value back into typed data for token generation and the Brand Book.
 * Parsing the canonical form again yields the same canonical form, so the value is stable.
 *
 * Input accepts any language for free text (voice pairs), Arabic-script separators (؛ ،) and
 * Persian or Arabic-Indic digits. Identifiers that become token ids (color and font roles) must
 * be ASCII.
 */

export const STRUCTURED_TYPES = ['color', 'font', 'logo_spec', 'voice_pairs', 'relationships'] as const
export type StructuredType = (typeof STRUCTURED_TYPES)[number]

export interface ColorEntry {
  role: string
  hex: string
}

export interface FontEntry {
  role: string
  family: string
  fallback: string[]
  size_px: number | null
  line_height: number | null
}

export interface LogoSpec {
  min_size_px: number
  clear_space: { value: number; unit: 'px' | 'x' }
  min_print_mm: number | null
}

export interface VoicePair {
  do: string
  dont: string
}

/** How a person is connected to an organization. Founding or working somewhere never implies ownership. */
export const RELATION_TYPES = ['founded', 'co-founded', 'employed', 'contracted', 'advised', 'consulted', 'collaborated', 'board', 'invested', 'volunteered', 'studied', 'taught'] as const
export type RelationType = (typeof RELATION_TYPES)[number]
/** Ownership is its own explicit statement. `unstated` is the default and means "no ownership claim". */
export const OWNERSHIP_STATES = ['owner', 'co-owner', 'not-owner', 'unstated'] as const
export type OwnershipState = (typeof OWNERSHIP_STATES)[number]

export interface RelationshipEntry {
  relation: RelationType
  organization: string
  from: string
  to: string
  ownership: OwnershipState
}

export type StructuredValue =
  | { type: 'color'; colors: ColorEntry[] }
  | { type: 'font'; fonts: FontEntry[] }
  | { type: 'logo_spec'; logo: LogoSpec }
  | { type: 'voice_pairs'; pairs: VoicePair[] }
  | { type: 'relationships'; relationships: RelationshipEntry[] }

type Normalized = { ok: true; value: string } | { ok: false; message: string }

export const STRUCTURED_LIMITS = { colors: 24, fonts: 8, pairs: 12, pairText: 200, family: 64, relationships: 30, organization: 120 } as const

export const STRUCTURED_FORMATS: Record<StructuredType, string> = {
  color: 'role #RRGGBB, separated by ; or new lines. Example: primary #123A73; surface #FFFFFF',
  font: 'role: Family, fallback… [@ size px[/line height]], one role per line or ;. Example: body: Inter, system-ui, sans-serif @ 16px/1.5',
  logo_spec: 'min-size: <px>; clear-space: <px or multiple of the mark height>. Example: min-size: 24px; clear-space: 0.5x',
  voice_pairs: 'do | don\'t, one pair per line or ;. Example: Say what happened and what to do next | Blame the user',
  relationships:
    'relation | organization | from | to [| ownership], one per line or ;. Relation: founded, co-founded, employed, contracted, advised, consulted, collaborated, board, invested, volunteered, studied, taught. Dates: YYYY or YYYY-MM; to may be present; either may be unknown. Ownership: owner, co-owner, not-owner or unstated (the default). Example: co-founded | Example Studio | 2019 | present | not-owner',
}

export function isStructuredType(type: QuestionType | string): type is StructuredType {
  return (STRUCTURED_TYPES as readonly string[]).includes(type)
}

const ROLE = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII; Arabic decimal separator to a dot. */
export function asciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/٫/g, '.')
}

function entries(value: string, separators: RegExp): string[] {
  return value
    .split(separators)
    .map((part) => part.trim())
    .filter(Boolean)
}

function fail(type: StructuredType, message: string): Normalized {
  return { ok: false, message: `${message} Format: ${STRUCTURED_FORMATS[type]}. Or answer unknown or skip.` }
}

function normalizeColor(raw: string): Normalized {
  const items = entries(raw, /[;,،؛\n]+/)
  if (items.length === 0) return fail('color', 'No color entries found.')
  if (items.length > STRUCTURED_LIMITS.colors) return fail('color', `At most ${STRUCTURED_LIMITS.colors} color roles.`)
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const match = item.match(/^([^\s:=#]+)\s*[:=]?\s*#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
    if (!match) return fail('color', `“${item}” is not a role and a hex value.`)
    const role = match[1] ?? ''
    if (!ROLE.test(role)) return fail('color', `Role “${role}” must start with a Latin letter and use letters, digits, - or _ (it becomes a token id).`)
    if (seen.has(role.toLowerCase())) return fail('color', `Role “${role}” is listed twice.`)
    seen.add(role.toLowerCase())
    let hex = (match[2] ?? '').toUpperCase()
    if (hex.length === 3) hex = hex.split('').map((digit) => digit + digit).join('')
    out.push(`${role} #${hex}`)
  }
  return { ok: true, value: out.join('; ') }
}

function cleanFamily(name: string): string {
  return name.trim().replace(/^["'“”]+|["'“”]+$/g, '').trim()
}

function normalizeFont(raw: string): Normalized {
  const items = entries(asciiDigits(raw), /[;؛\n]+/)
  if (items.length === 0) return fail('font', 'No font roles found.')
  if (items.length > STRUCTURED_LIMITS.fonts) return fail('font', `At most ${STRUCTURED_LIMITS.fonts} font roles.`)
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const colon = item.indexOf(':')
    if (colon === -1) return fail('font', `“${item}” needs a role before a colon.`)
    const role = item.slice(0, colon).trim()
    if (!ROLE.test(role)) return fail('font', `Role “${role}” must start with a Latin letter and use letters, digits, - or _ (it becomes a token id).`)
    if (seen.has(role.toLowerCase())) return fail('font', `Role “${role}” is listed twice.`)
    seen.add(role.toLowerCase())
    const [stackPart, scalePart, extra] = item.slice(colon + 1).split('@')
    if (extra !== undefined) return fail('font', `“${item}” has more than one @.`)
    const stack = (stackPart ?? '').split(/[,،]/).map(cleanFamily).filter(Boolean)
    if (stack.length < 2) return fail('font', `Role “${role}” needs a family and at least one fallback.`)
    for (const family of stack) {
      if (family.length > STRUCTURED_LIMITS.family || /[{}<>;"\\]/.test(family)) return fail('font', `“${family}” is not a usable family name.`)
    }
    let scale = ''
    if (scalePart !== undefined) {
      const match = scalePart.trim().match(/^(\d+(?:\.\d+)?)\s*px(?:\s*\/\s*(\d+(?:\.\d+)?))?$/i)
      if (!match) return fail('font', `Scale “${scalePart.trim()}” must look like 16px or 16px/1.5.`)
      const size = Number(match[1])
      const lineHeight = match[2] === undefined ? null : Number(match[2])
      if (size < 6 || size > 400) return fail('font', `Size ${size}px is outside 6–400px.`)
      if (lineHeight !== null && (lineHeight < 0.8 || lineHeight > 3)) return fail('font', `Line height ${lineHeight} is outside 0.8–3.`)
      scale = ` @ ${size}px${lineHeight === null ? '' : `/${lineHeight}`}`
    }
    out.push(`${role}: ${stack.join(', ')}${scale}`)
  }
  return { ok: true, value: out.join('; ') }
}

const LOGO_KEYS: Record<string, 'min' | 'clear' | 'print'> = {
  min: 'min',
  'min-size': 'min',
  'minimum-size': 'min',
  minimum: 'min',
  clear: 'clear',
  'clear-space': 'clear',
  'min-print': 'print',
  'min-size-print': 'print',
  print: 'print',
}

function normalizeLogo(raw: string): Normalized {
  const items = entries(asciiDigits(raw), /[;,،؛\n]+/)
  const found: Partial<Record<'min' | 'clear' | 'print', string>> = {}
  for (const item of items) {
    const match = item.match(/^([A-Za-z -]+?)\s*[:=]\s*(.+)$/)
    const key = match ? LOGO_KEYS[(match[1] ?? '').trim().toLowerCase().replace(/\s+/g, '-')] : undefined
    if (!match || !key) return fail('logo_spec', `“${item}” is not one of min-size, clear-space, min-print.`)
    if (found[key] !== undefined) return fail('logo_spec', `${key} is given twice.`)
    found[key] = (match[2] ?? '').trim()
  }
  if (found.min === undefined || found.clear === undefined) return fail('logo_spec', 'Both min-size and clear-space are required.')
  const min = found.min.match(/^(\d+(?:\.\d+)?)\s*px$/i)
  if (!min || Number(min[1]) <= 0 || Number(min[1]) > 2000) return fail('logo_spec', `min-size “${found.min}” must be a positive px value.`)
  const clear = found.clear.match(/^(\d+(?:\.\d+)?)\s*(px|x)$/i)
  if (!clear || Number(clear[1]) <= 0) return fail('logo_spec', `clear-space “${found.clear}” must be a positive px value or a multiple such as 0.5x.`)
  const clearUnit = (clear[2] ?? '').toLowerCase()
  if (clearUnit === 'x' && Number(clear[1]) > 4) return fail('logo_spec', 'clear-space as a multiple must be at most 4x.')
  let print = ''
  if (found.print !== undefined) {
    const mm = found.print.match(/^(\d+(?:\.\d+)?)\s*mm$/i)
    if (!mm || Number(mm[1]) <= 0) return fail('logo_spec', `min-print “${found.print}” must be a positive mm value.`)
    print = `; min-print: ${Number(mm[1])}mm`
  }
  return { ok: true, value: `min-size: ${Number(min[1])}px; clear-space: ${Number(clear[1])}${clearUnit}${print}` }
}

function normalizeVoice(raw: string): Normalized {
  const items = entries(raw, /[;؛\n]+/)
  if (items.length === 0) return fail('voice_pairs', 'No do/don’t pairs found.')
  if (items.length > STRUCTURED_LIMITS.pairs) return fail('voice_pairs', `At most ${STRUCTURED_LIMITS.pairs} pairs.`)
  const out: string[] = []
  for (const item of items) {
    const sides = item.split('|')
    if (sides.length !== 2) return fail('voice_pairs', `“${item}” needs exactly one | between the do and the don’t.`)
    const doText = (sides[0] ?? '').trim().replace(/^do\s*:\s*/i, '').trim()
    const dontText = (sides[1] ?? '').trim().replace(/^(don['’]?t|do not)\s*:\s*/i, '').trim()
    if (!doText || !dontText) return fail('voice_pairs', `“${item}” needs text on both sides of |.`)
    if (doText.length > STRUCTURED_LIMITS.pairText || dontText.length > STRUCTURED_LIMITS.pairText) {
      return fail('voice_pairs', `Each side is at most ${STRUCTURED_LIMITS.pairText} characters.`)
    }
    out.push(`do: ${doText} | don't: ${dontText}`)
  }
  return { ok: true, value: out.join('; ') }
}

const PERIOD = /^(?:\d{4}(?:-(?:0[1-9]|1[0-2]))?|unknown)$/

function normalizeRelationships(raw: string): Normalized {
  const items = entries(raw, /[;؛\n]+/)
  if (items.length === 0) return fail('relationships', 'No relationships found.')
  if (items.length > STRUCTURED_LIMITS.relationships) return fail('relationships', `At most ${STRUCTURED_LIMITS.relationships} relationships.`)
  const out: string[] = []
  for (const item of items) {
    const parts = item.split('|').map((part) => part.trim())
    if (parts.length < 4 || parts.length > 5) return fail('relationships', `“${item}” needs relation | organization | from | to, and optionally | ownership.`)
    const relation = (parts[0] ?? '').toLowerCase()
    if (!(RELATION_TYPES as readonly string[]).includes(relation)) {
      return fail('relationships', `“${parts[0]}” is not a relation. Use one of ${RELATION_TYPES.join(', ')}.`)
    }
    const organization = (parts[1] ?? '').replace(/\s+/g, ' ')
    if (!organization || organization.length > STRUCTURED_LIMITS.organization) {
      return fail('relationships', `The organization in “${item}” must be 1 to ${STRUCTURED_LIMITS.organization} characters.`)
    }
    const from = asciiDigits(parts[2] ?? '').toLowerCase()
    const to = asciiDigits(parts[3] ?? '').toLowerCase()
    if (!PERIOD.test(from)) return fail('relationships', `Start “${parts[2]}” must be YYYY, YYYY-MM or unknown.`)
    if (to !== 'present' && !PERIOD.test(to)) return fail('relationships', `End “${parts[3]}” must be YYYY, YYYY-MM, present or unknown.`)
    if (from !== 'unknown' && /^\d/.test(to) && to.slice(0, 7) < from.slice(0, 7)) return fail('relationships', `“${item}” ends before it starts.`)
    const ownership = (parts[4] ?? 'unstated').toLowerCase().replace(/^ownership\s*:\s*/, '')
    if (!(OWNERSHIP_STATES as readonly string[]).includes(ownership)) {
      return fail('relationships', `Ownership “${parts[4]}” must be one of ${OWNERSHIP_STATES.join(', ')}.`)
    }
    out.push(`${relation} | ${organization} | ${from} | ${to} | ownership: ${ownership}`)
  }
  return { ok: true, value: out.join('; ') }
}

/** Validate an owner's answer for a structured question and return its canonical stored form. */
export function normalizeStructured(type: StructuredType, raw: string): Normalized {
  const value = raw.trim()
  if (!value) return { ok: false, message: 'Empty answer. Use unknown or skip.' }
  switch (type) {
    case 'color':
      return normalizeColor(value)
    case 'font':
      return normalizeFont(value)
    case 'logo_spec':
      return normalizeLogo(value)
    case 'voice_pairs':
      return normalizeVoice(value)
    case 'relationships':
      return normalizeRelationships(value)
  }
}

/** Typed data from a stored value. Returns null when the value is absent or not valid for the type. */
export function parseStructured(type: StructuredType, value: unknown): StructuredValue | null {
  if (typeof value !== 'string') return null
  const normalized = normalizeStructured(type, value)
  if (!normalized.ok) return null
  const canonical = normalized.value
  switch (type) {
    case 'color':
      return {
        type,
        colors: canonical.split('; ').map((entry) => {
          const [role, hex] = entry.split(' ')
          return { role: role ?? '', hex: hex ?? '' }
        }),
      }
    case 'font':
      return {
        type,
        fonts: canonical.split('; ').map((entry) => {
          const colon = entry.indexOf(':')
          const [stack, scale] = entry.slice(colon + 1).split(' @ ')
          const families = (stack ?? '').split(', ').map((family) => family.trim())
          const match = scale?.match(/^(\d+(?:\.\d+)?)px(?:\/(\d+(?:\.\d+)?))?$/)
          return {
            role: entry.slice(0, colon),
            family: families[0] ?? '',
            fallback: families.slice(1),
            size_px: match ? Number(match[1]) : null,
            line_height: match?.[2] === undefined ? null : Number(match[2]),
          }
        }),
      }
    case 'logo_spec': {
      const parts = Object.fromEntries(canonical.split('; ').map((part) => part.split(': ') as [string, string]))
      const clear = String(parts['clear-space']).match(/^([\d.]+)(px|x)$/)
      return {
        type,
        logo: {
          min_size_px: Number.parseFloat(String(parts['min-size'])),
          clear_space: { value: Number(clear?.[1]), unit: clear?.[2] === 'x' ? 'x' : 'px' },
          min_print_mm: parts['min-print'] === undefined ? null : Number.parseFloat(parts['min-print']),
        },
      }
    }
    case 'voice_pairs':
      return {
        type,
        pairs: canonical.split('; ').map((entry) => {
          const [doSide, dontSide] = entry.split(' | ')
          return { do: (doSide ?? '').replace(/^do: /, ''), dont: (dontSide ?? '').replace(/^don't: /, '') }
        }),
      }
    case 'relationships':
      return {
        type,
        relationships: canonical.split('; ').map((entry) => {
          const [relation, organization, from, to, ownership] = entry.split(' | ')
          return {
            relation: relation as RelationType,
            organization: organization ?? '',
            from: from ?? 'unknown',
            to: to ?? 'unknown',
            ownership: (ownership ?? 'ownership: unstated').replace(/^ownership: /, '') as OwnershipState,
          }
        }),
      }
  }
}

/** Structured data for a question's stored value, or null for non-structured questions. */
export function structuredFor(question: FieldQuestion, value: unknown): StructuredValue | null {
  return isStructuredType(question.question_type) ? parseStructured(question.question_type, value) : null
}
