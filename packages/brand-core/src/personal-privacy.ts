import { asciiDigits } from './structured.js'
import type { FieldQuestion } from './types.js'

/**
 * Privacy guard for Personal Brand OS.
 *
 * Brand OS does not collect highly personal data by default: no home address, personal phone,
 * birth date, government id or family details. This module recognises the common shapes of that
 * data so that
 * - personal-module answers and proposals that contain it are refused before they reach Git, and
 * - no fact that contains it can be published, whatever module it is in.
 *
 * It is a guard, not a classifier. It errs on the side of refusing, and a refusal names the kind of
 * data, never the matched text. It is not a legal compliance check (see docs-internal/PERSONAL_BRAND.md).
 */

export type PrivateDataKind = 'phone' | 'email' | 'birth_date' | 'government_id' | 'home_address' | 'family'

export interface PrivateDataFinding {
  kind: PrivateDataKind
  message: string
}

/**
 * Locale data: phrases that introduce private details. English is the base; fa and tr are equal
 * optional locales. Matching is case-insensitive on a normalized copy of the text.
 */
export const PRIVATE_CUES: Record<'en' | 'fa' | 'tr', Partial<Record<Exclude<PrivateDataKind, 'phone' | 'email'>, string[]>>> = {
  en: {
    birth_date: ['date of birth', 'born on', 'birthday is', 'dob:'],
    government_id: ['passport number', 'passport no', 'national id', 'social security', 'ssn', 'id card number', 'tax id number'],
    home_address: ['home address', 'my address is', 'i live at', 'residential address'],
    family: ['my wife', 'my husband', 'my children', 'my kids', 'my son', 'my daughter'],
  },
  fa: {
    birth_date: ['تاریخ تولد', 'متولد'],
    government_id: ['کد ملی', 'شماره ملی', 'شماره پاسپورت', 'شماره گذرنامه'],
    home_address: ['آدرس منزل', 'نشانی منزل', 'آدرس خانه'],
    family: ['همسرم', 'فرزندانم', 'بچه‌هایم', 'پسرم', 'دخترم'],
  },
  tr: {
    birth_date: ['doğum tarihi', 'doğum tarihim', 'doğdum'],
    government_id: ['tc kimlik', 't.c. kimlik', 'kimlik numarası', 'pasaport numarası'],
    home_address: ['ev adresi', 'ev adresim', 'ikamet adresi'],
    family: ['eşim', 'çocuklarım', 'oğlum', 'kızım'],
  },
}

const MESSAGES: Record<PrivateDataKind, string> = {
  phone: 'a phone number',
  email: 'an email address outside a professional contact field',
  birth_date: 'a birth date',
  government_id: 'a government or tax identifier',
  home_address: 'a home address',
  family: 'family details',
}

const EMAIL = /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i
// Seven or more digits, optionally with a leading + and spaces, dots, dashes or brackets between them.
const PHONE = /(?:\+|00)?\d(?:[\s().-]*\d){6,}/
// A year range or a single date is not a phone number; strip ISO-like dates and years first.
const DATES = /\b\d{4}-\d{2}(?:-\d{2})?\b|\b(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present)\b|\b(?:19|20)\d{2}\b/gi

function normalize(text: string): string {
  // ZWNJ is optional in Persian typing, so it is ignored on both sides of a match.
  return asciiDigits(text).normalize('NFKC').toLocaleLowerCase('en').replace(/\u200c/g, '')
}

/** Every kind of private data the text appears to contain. `allowEmail` is for professional contact fields. */
export function privateDataFindings(text: string, options: { allowEmail?: boolean } = {}): PrivateDataFinding[] {
  const lower = normalize(text)
  const found = new Set<PrivateDataKind>()
  const withoutEmails = lower.replace(new RegExp(EMAIL.source, 'gi'), ' ')
  const withoutUrls = withoutEmails.replace(/https?:\/\/\S+/gi, ' ')
  if (PHONE.test(withoutUrls.replace(DATES, ' '))) found.add('phone')
  if (!options.allowEmail && EMAIL.test(lower)) found.add('email')
  for (const cues of Object.values(PRIVATE_CUES)) {
    for (const [kind, phrases] of Object.entries(cues) as Array<[Exclude<PrivateDataKind, 'phone' | 'email'>, string[]]>) {
      if (phrases.some((phrase) => containsPhrase(lower, phrase))) found.add(kind)
    }
  }
  return [...found].map((kind) => ({ kind, message: MESSAGES[kind] }))
}

function containsPhrase(text: string, phrase: string): boolean {
  const needle = normalize(phrase)
  let index = text.indexOf(needle)
  while (index !== -1) {
    const before = index === 0 ? '' : text[index - 1] ?? ''
    const after = text[index + needle.length] ?? ''
    // Whole-phrase match: a cue inside a longer word (for example "ssn" in "lessn") does not count.
    if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) return true
    index = text.indexOf(needle, index + 1)
  }
  return false
}

/** Plain-language refusal, or null when nothing private was found. Never echoes the matched text. */
export function privateDataRefusal(question: Pick<FieldQuestion, 'id' | 'contact_field'>, value: unknown): string | null {
  if (value === null || value === undefined) return null
  const findings = privateDataFindings(String(value), { allowEmail: question.contact_field === true })
  if (findings.length === 0) return null
  return `${question.id} looks like it contains ${findings.map((item) => item.message).join(', ')}. Brand OS does not store or publish private personal data by default. Use a professional contact link instead, or leave it out. Nothing was saved.`
}
