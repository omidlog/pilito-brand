import type { Locale } from '../i18n.js'
import type { ProposalState } from '../types.js'
import { FOLLOW_UPS, LEXICON, type Lexicon } from './lexicon.js'

/**
 * Deterministic extraction. It powers the mock provider, the no-provider fallback of
 * `brand:interview --assist`, and the interactive `note:` capture. It reads keyword cues from
 * lexicon.ts for every locale, so mixed-language answers work, and it never invents a value: a value is
 * either a span of the owner's own words or a canonical label for a matched segment word.
 */

export interface RuleProposal {
  question_id: string
  value: string | null
  state: ProposalState
  confidence: number
  /** Verbatim span of the source text. */
  quotation: string
  follow_up?: string
  correction?: boolean
}

export interface RuleOutput {
  proposals: RuleProposal[]
  follow_ups: Array<{ question_id: string | null; text: string }>
  owner_questions: string[]
}

/** Where each topic is stored, in order of preference. The first id the caller allows is used. */
export const TOPIC_TARGETS = {
  offer: ['business.offer.summary'],
  segment: ['business.customer.primary_segment'],
  b2b: ['business.sales.b2b_packaging', 'business.product.roadmap'],
  pricing: ['business.sales.pricing'],
} as const

const LOCALES = Object.keys(LEXICON) as Locale[]
const lexicons = (): Lexicon[] => LOCALES.map((locale) => LEXICON[locale])
const any = (text: string, pick: (lexicon: Lexicon) => RegExp) => lexicons().some((lexicon) => pick(lexicon).test(text))

/** A best guess at the main language of a text, for follow-up wording and provenance only. */
export function detectLocale(text: string): Locale {
  const arabicScript = (text.match(/[؀-ۿ]/g) ?? []).length
  const latin = (text.match(/[A-Za-z]/g) ?? []).length
  if (arabicScript > latin) return 'fa'
  if (/[ğışĞİŞ]/.test(text) || /\b(?:ve|bir|için|ama|henüz|ürün)\b/i.test(text)) return 'tr'
  return 'en'
}

/** Sentences, then clauses. Every returned span is a verbatim substring of the input. */
export function clauses(text: string): string[] {
  const out: string[] = []
  for (const sentence of text.split(/(?<=[.!?؟])\s+|\r?\n+/)) {
    let pieces = [sentence]
    for (const lexicon of lexicons()) {
      pieces = pieces.flatMap((piece) => piece.split(new RegExp(lexicon.clauseBreaks.source, lexicon.clauseBreaks.flags.replace('g', ''))))
    }
    for (const piece of pieces) {
      const trimmed = piece.trim().replace(/[.!?؟]+$/, '').trim()
      if (trimmed.length > 1 && text.includes(trimmed)) out.push(trimmed)
    }
  }
  return out
}

function stripFiller(value: string): string {
  let result = value.trim()
  for (const lexicon of lexicons()) result = result.replace(lexicon.leadingFiller, '').trim()
  return result
}

function stateOf(clause: string): ProposalState {
  if (any(clause, (lexicon) => lexicon.undecided)) return 'unresolved'
  if (any(clause, (lexicon) => lexicon.tentative)) return 'tentative'
  return 'proposed'
}

/**
 * Extract proposals from free text. `allowed` is the set of question ids the caller may write
 * (non-restricted, applicable). Topics whose targets are all disallowed are skipped.
 */
export function extractByRules(text: string, opts: { allowed: Set<string>; locale?: Locale }): RuleOutput {
  const locale = opts.locale ?? detectLocale(text)
  const target = (ids: readonly string[]) => ids.find((id) => opts.allowed.has(id)) ?? null
  const proposals: RuleProposal[] = []
  const used = new Set<string>()
  const add = (proposal: RuleProposal) => {
    if (used.has(proposal.question_id)) return
    used.add(proposal.question_id)
    proposals.push(proposal)
  }
  const correctionText = any(text.trim(), (lexicon) => lexicon.correction)

  for (const clause of clauses(text)) {
    const state = stateOf(clause)
    const correction = correctionText || undefined

    const pricingId = target(TOPIC_TARGETS.pricing)
    if (pricingId && any(clause, (lexicon) => lexicon.pricing)) {
      add({
        question_id: pricingId,
        value: state === 'unresolved' ? null : stripFiller(clause),
        state,
        confidence: state === 'unresolved' ? 0.8 : 0.5,
        quotation: clause,
        ...(state !== 'proposed' ? { follow_up: FOLLOW_UPS.pricing[locale] } : {}),
        correction,
      })
      continue
    }

    const b2bId = target(TOPIC_TARGETS.b2b)
    if (b2bId && any(clause, (lexicon) => lexicon.b2b)) {
      add({
        question_id: b2bId,
        value: state === 'unresolved' ? null : stripFiller(clause),
        state,
        confidence: state === 'proposed' ? 0.6 : 0.5,
        quotation: clause,
        ...(state !== 'proposed' ? { follow_up: FOLLOW_UPS.b2b[locale] } : {}),
        correction,
      })
      continue
    }

    const offerId = target(TOPIC_TARGETS.offer)
    if (offerId) {
      for (const lexicon of lexicons()) {
        const match = clause.match(lexicon.offer)
        const value = match ? (match.slice(1).find((group) => group !== undefined) ?? '').trim() : ''
        if (value) {
          add({ question_id: offerId, value: state === 'unresolved' ? null : value, state, confidence: 0.7, quotation: clause, correction })
          break
        }
      }
    }

    const segmentId = target(TOPIC_TARGETS.segment)
    if (segmentId && any(clause, (lexicon) => lexicon.audienceCue)) {
      const values = [...new Set(lexicons().flatMap((lexicon) => lexicon.segments.filter((item) => item.pattern.test(clause)).map((item) => item.value)))]
      if (values.length > 0) {
        add({
          question_id: segmentId,
          value: state === 'unresolved' ? null : values.join(', '),
          state,
          confidence: state === 'proposed' ? 0.7 : 0.4,
          quotation: clause,
          follow_up: FOLLOW_UPS.segment[locale],
          correction,
        })
      }
    }
  }

  const ownerQuestions = text
    .split(/(?<=[.!?؟])\s+|\r?\n+/)
    .map((part) => part.trim())
    .filter((part) => /[?؟]$/.test(part))
    .slice(0, 10)

  return { proposals, follow_ups: [], owner_questions: ownerQuestions }
}
