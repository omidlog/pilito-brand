import { en } from './en.js'
import { fa } from './fa.js'
import { tr } from './tr.js'

export type MessageKey = keyof typeof en
export type Messages = Record<MessageKey, string>
export const LOCALES = ['en', 'fa', 'tr'] as const
export type Locale = (typeof LOCALES)[number]

const CATALOG: Record<Locale, Messages> = { en, fa, tr }
const DIRECTION: Record<Locale, 'ltr' | 'rtl'> = { en: 'ltr', fa: 'rtl', tr: 'ltr' }

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export interface I18n {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  number: (value: number) => string
  percent: (ratio: number) => string
  dateTime: (iso: string | null) => string
  relative: (iso: string | null, now?: number) => string
}

export function catalog(locale: Locale): Messages {
  return CATALOG[locale]
}

export function i18n(locale: Locale): I18n {
  const messages = CATALOG[locale]
  const numbers = new Intl.NumberFormat(locale)
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return {
    locale,
    dir: DIRECTION[locale],
    t: (key, vars) => {
      const template = messages[key] ?? en[key] ?? key
      if (!vars) return template
      return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match))
    },
    number: (value) => numbers.format(value),
    percent: (ratio) => percent.format(Number.isFinite(ratio) ? ratio : 0),
    dateTime: (iso) => {
      if (!iso) return '—'
      const at = Date.parse(iso)
      return Number.isNaN(at) ? '—' : dates.format(at)
    },
    relative: (iso, now = Date.now()) => {
      if (!iso) return '—'
      const at = Date.parse(iso)
      if (Number.isNaN(at)) return '—'
      const seconds = Math.round((at - now) / 1000)
      const abs = Math.abs(seconds)
      if (abs < 45) return relative.format(0, 'second')
      if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
      if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour')
      return relative.format(Math.round(seconds / 86_400), 'day')
    },
  }
}
