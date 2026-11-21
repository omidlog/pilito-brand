import type { Locale } from '../i18n.js'

/**
 * Locale data for the deterministic extractor (the mock provider and the `note:` capture).
 *
 * English is the base. Persian (fa) and Turkish (tr) are equal, optional locales. Every rule runs for
 * every locale on every answer, so a mixed-language answer ("our audience is دانشجو ها …") still
 * matches. Adding a locale means adding an entry here; the extractor has no language-specific code.
 *
 * These are keyword cues, not understanding. They exist so the interview works with no model
 * configured and so tests are deterministic. A configured model provider does the real reading.
 */
export interface Lexicon {
  /** Clause boundaries inside a sentence ("…, but …"). The separator itself is not part of either clause. */
  clauseBreaks: RegExp
  /** "We may…", "in the future": the clause describes a possibility, not a decision. */
  tentative: RegExp
  /** "Not decided yet": nothing is decided; no value may be stored. */
  undecided: RegExp
  /** "Actually…", "correction:": the owner corrects an earlier answer. */
  correction: RegExp
  /** The clause describes the product or offer. Group 1 is the description. */
  offer: RegExp
  /** Words that make a segment word a statement about the audience ("we target …", "for …"). */
  audienceCue: RegExp
  /** Segment words mapped to an English canonical value. */
  segments: Array<{ pattern: RegExp; value: string }>
  /** Business-to-business expansion. */
  b2b: RegExp
  /** Pricing is the topic of the clause. */
  pricing: RegExp
  /** Leading filler removed from extracted values ("but", "initially"). */
  leadingFiller: RegExp
}

export const LEXICON: Record<Locale, Lexicon> = {
  en: {
    clauseBreaks: /\s*[;,]?\s+\b(?:but|however|although|though|while|whereas)\b\s+|\s*;\s*/i,
    tentative: /\b(?:may|might|maybe|perhaps|possibly|considering|thinking about|in the future|someday|eventually|could|potentially|later on)\b/i,
    undecided: /\b(?:not (?:yet )?decided|undecided|not sure|unsure|haven't decided|have not decided|tbd|not (?:yet )?(?:set|final|clear)|no idea yet|still open)\b/i,
    correction: /^(?:actually|correction|i meant|to correct)\b|\bactually,/i,
    offer: /^(?:initially,?\s+)?(?:our|the) (?:product|app|service|platform|company|business) is\s+(.+)$|^we (?:are building|build|make|offer|sell|run)\s+(.+)$/i,
    audienceCue: /\b(?:target(?:ing|s)?|audience|customers?|users?|aimed at|serv(?:e|ing)|for)\b/i,
    segments: [
      { pattern: /\bstudents?\b/i, value: 'students' },
      { pattern: /\bteachers?\b/i, value: 'teachers' },
      { pattern: /\bparents\b/i, value: 'parents' },
      { pattern: /\bdevelopers?\b/i, value: 'developers' },
      { pattern: /\bsmall businesses\b/i, value: 'small businesses' },
      { pattern: /\bfreelancers?\b/i, value: 'freelancers' },
    ],
    b2b: /\bB2B\b|\bfor (?:companies|businesses|teams|enterprises)\b|\benterprise (?:plan|package|tier)s?\b/i,
    pricing: /\bpric(?:e|es|ing)\b/i,
    leadingFiller: /^(?:and|but|so|also|initially|currently|right now)[,\s]+/i,
  },
  fa: {
    clauseBreaks: /\s*[؛;،,]?\s*(?:ولی|اما|ولیکن|هرچند)\s+|\s+و\s+(?=یک\s|ما\s)|\s*[؛;]\s*/,
    tentative: /شاید|ممکن است|احتمالا|احتمالاً|در آینده|ایده/,
    undecided: /هنوز|مشخص نیست|معلوم نیست|تصمیم نگرفته|نمی‌?دانیم/,
    correction: /^(?:اصلاح|در واقع|منظورم)/,
    offer: /^(?:محصول ما|اپ ما|اپلیکیشن ما|کسب‌?و‌?کار ما)\s+(.+?)(?:\s+(?:است|هست))?$/,
    audienceCue: /مخاطب|مشتری|کاربر|برای/,
    segments: [
      { pattern: /دانشجو/, value: 'students' },
      { pattern: /دانش‌?آموز/, value: 'school students' },
      { pattern: /معلم/, value: 'teachers' },
      { pattern: /والدین/, value: 'parents' },
      { pattern: /برنامه‌?نویس/, value: 'developers' },
    ],
    b2b: /B2B|بیزنس|بی‌?تو‌?بی|برای شرکت/i,
    pricing: /قیمت/,
    leadingFiller: /^(?:و|ولی|اما)\s+/,
  },
  tr: {
    clauseBreaks: /\s*[;,]?\s+\b(?:ama|fakat|ancak|lakin)\b\s+|\s*;\s*/i,
    tentative: /\b(?:belki|ileride|gelecekte|düşünüyoruz|olabilir|muhtemelen)\b/i,
    undecided: /henüz (?:belli değil|karar verilmedi|net değil)|karar vermedik|belli değil|bilmiyoruz/i,
    correction: /^(?:aslında|düzeltme)\b/i,
    offer: /^(?:ürünümüz|uygulamamız|şirketimiz)\s+(.+?)(?:dır|dir|dur|dür|tır|tir|tur|tür)?$/i,
    audienceCue: /hedef|kitle|müşteri|kullanıcı|için/i,
    segments: [
      { pattern: /öğrenci/i, value: 'students' },
      { pattern: /öğretmen/i, value: 'teachers' },
      { pattern: /\bveliler?\b/i, value: 'parents' },
      { pattern: /geliştirici/i, value: 'developers' },
    ],
    b2b: /\bB2B\b|şirketler(?:e|için)?|kurumsal/i,
    pricing: /fiyat/i,
    leadingFiller: /^(?:ve|ama|fakat)\s+/i,
  },
}

/** Follow-up questions in each locale. English is the base; a missing locale falls back to English. */
export const FOLLOW_UPS: Record<'pricing' | 'b2b' | 'segment' | 'offer', Record<Locale, string>> = {
  pricing: {
    en: 'Pricing is not decided yet. Which pricing model or price range are you considering?',
    fa: 'قیمت‌گذاری هنوز مشخص نیست. چه مدل یا بازهٔ قیمتی را در نظر دارید؟',
    tr: 'Fiyatlandırma henüz belli değil. Hangi fiyat modelini veya aralığını düşünüyorsunuz?',
  },
  b2b: {
    en: 'B2B is described as possible, not decided. What would have to be true before you offer it?',
    fa: 'B2B فعلاً یک احتمال است، نه تصمیم. چه شرطی باید برقرار شود تا آن را ارائه کنید؟',
    tr: 'B2B şimdilik bir olasılık, karar değil. Sunmadan önce neyin gerçekleşmesi gerekir?',
  },
  segment: {
    en: 'Who exactly in this group buys first, and what job are they trying to get done?',
    fa: 'دقیقاً چه کسی در این گروه اول خرید می‌کند و چه کاری را می‌خواهد انجام دهد؟',
    tr: 'Bu gruptan ilk kim satın alır ve hangi işi halletmeye çalışır?',
  },
  offer: {
    en: 'What makes this product different from the closest alternative?',
    fa: 'چه چیزی این محصول را از نزدیک‌ترین جایگزین متمایز می‌کند؟',
    tr: 'Bu ürünü en yakın alternatiften ayıran nedir?',
  },
}

/**
 * Passages that look like restricted data (finance, credentials, personal identifiers). They are
 * withheld before any text reaches a model provider, whatever the provider. Restricted answers are
 * collected only in the interactive interview and stored encrypted.
 */
export const RESTRICTED_CUES: Record<Locale, RegExp> = {
  en: /\b(?:revenue|turnover|profit|loss(?:es)?|salar(?:y|ies)|payroll|runway|burn(?: rate)?|cash (?:balance|on hand)|bank|iban|swift|account number|card number|credit card|tax (?:id|number)|ssn|social security|passport|valuation|cap table|investors?|funding round|password|api key|secret|private key)\b/i,
  fa: /درآمد|سود|زیان|حقوق|دستمزد|حساب بانکی|بانک|شبا|شماره کارت|کارت بانکی|کد ملی|رمز|گذرواژه|ارزش‌?گذاری|سرمایه‌?گذار|بودجه نقد/,
  tr: /(?<!\p{L})(?:gelir\p{L}*|ciro\p{L}*|kâr\p{L}*|zarar\p{L}*|maaş\p{L}*|bordro|banka|iban|hesap numarası|kart numarası|kredi kartı|vergi numarası|tc kimlik|şifre|parola|değerleme|yatırımcı\p{L}*)(?!\p{L})/iu,
}

/** Long digit runs (card, account, phone or id numbers) are withheld too. */
export const LONG_NUMBER = /\d[\d\s-]{9,}\d/
