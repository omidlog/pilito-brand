export type Locale = 'en' | 'fa' | 'tr'

export const UI: Record<Locale, Record<string, string>> = {
  en: {
    banner: 'Brand OS interview. One question at a time. Nothing here is approved until you approve it.',
    why: 'Why this matters',
    example: 'Example (not your brand)',
    commands:
      'Commands: skip · unknown · not relevant · decide later · estimate: … · show examples · suggest options · accept 1 · go back · change <id>: <value> · review · approve <id> · status · import existing: <url> · lang en|fa|tr · help · exit',
    noMore: 'No further eligible questions. Run brand:status for coverage, or brand:review for a recap.',
    recorded: 'Recorded as {status}. This is not an approved rule.',
    unknown: 'Recorded as unknown. No fact was invented.',
    skipped: 'Skipped. The field stays unresolved.',
    later: 'Deferred. I will return to it after the other open questions.',
    irrelevant: 'Marked not applicable. I will not invent a value.',
    exit: 'Session paused. Resume with npm run brand:resume.',
    needConfirm:
      'This answer is already approved. Nothing was changed. Re-run with the change confirmed to withdraw approval and save a new draft.',
    approved: 'Approved by {actor}. The draft is now a canonical claim for this field.',
    cannotApprove: 'Nothing to approve. Unknown, skipped, and empty answers cannot become facts.',
    denied: 'Actor {actor} does not have permission to approve this field.',
    examplesTitle: 'Examples labeled as examples',
    suggestionsTitle: 'Suggestions from the question bank — not facts. Reply accept 1 to store one as an unverified draft.',
    fallback: 'No {locale} prompt is stored. Showing English.',
  },
  fa: {
    banner: 'مصاحبهٔ Brand OS. هر بار یک پرسش. تا وقتی تأیید نکنید، هیچ پاسخی قاعدهٔ رسمی نیست.',
    why: 'چرا این پرسش مهم است',
    example: 'نمونه (برند شما نیست)',
    commands:
      'دستورها: skip · unknown · not relevant · decide later · estimate: … · show examples · suggest options · accept 1 · go back · change <id>: <value> · review · approve <id> · status · lang en|fa|tr · help · exit',
    noMore: 'پرسش واجد شرایط دیگری نمانده است. برای پوشش brand:status و برای جمع‌بندی brand:review را اجرا کنید.',
    recorded: 'با وضعیت {status} ثبت شد. این هنوز قاعدهٔ تأییدشده نیست.',
    unknown: 'ناشناخته ثبت شد. هیچ واقعیتی ساخته نشد.',
    skipped: 'رد شد. این فیلد باز می‌ماند.',
    later: 'به بعد موکول شد. بعد از پرسش‌های باز دیگر برمی‌گردم.',
    irrelevant: 'نامرتبط علامت خورد. مقداری ساخته نمی‌شود.',
    exit: 'نشست متوقف شد. با npm run brand:resume ادامه دهید.',
    needConfirm: 'این پاسخ قبلاً تأیید شده است. چیزی تغییر نکرد.',
    approved: 'توسط {actor} تأیید شد.',
    cannotApprove: 'چیزی برای تأیید نیست.',
    denied: 'نقش {actor} اجازهٔ تأیید این فیلد را ندارد.',
    examplesTitle: 'نمونه‌ها فقط مثال هستند',
    suggestionsTitle: 'پیشنهادها واقعیت نیستند. برای ذخیره به‌صورت پیش‌نویس تأییدنشده، accept 1 را بفرستید.',
    fallback: 'برگردان {locale} موجود نیست. متن انگلیسی نشان داده می‌شود.',
  },
  tr: {
    banner: 'Brand OS görüşmesi. Her seferinde bir soru. Siz onaylamadan hiçbir yanıt resmi kural olmaz.',
    why: 'Bu soru neden önemli',
    example: 'Örnek (sizin markanız değil)',
    commands:
      'Komutlar: skip · unknown · not relevant · decide later · estimate: … · show examples · suggest options · accept 1 · go back · change <id>: <value> · review · approve <id> · status · lang en|fa|tr · help · exit',
    noMore: 'Uygun soru kalmadı. Kapsam için brand:status, özet için brand:review çalıştırın.',
    recorded: '{status} olarak kaydedildi. Bu onaylı bir kural değildir.',
    unknown: 'Bilinmiyor olarak kaydedildi. Bir olgu uydurulmadı.',
    skipped: 'Geçildi. Alan çözümsüz kalır.',
    later: 'Ertelendi. Diğer açık sorulardan sonra döneceğim.',
    irrelevant: 'İlgisiz olarak işaretlendi. Değer uydurulmaz.',
    exit: 'Oturum duraklatıldı. npm run brand:resume ile devam edin.',
    needConfirm: 'Bu yanıt zaten onaylı. Hiçbir şey değişmedi.',
    approved: '{actor} tarafından onaylandı.',
    cannotApprove: 'Onaylanacak bir şey yok.',
    denied: '{actor} bu alanı onaylayamaz.',
    examplesTitle: 'Örnekler yalnızca örnektir',
    suggestionsTitle: 'Öneriler olgu değildir. Doğrulanmamış taslak olarak kaydetmek için accept 1 yazın.',
    fallback: '{locale} çevirisi yok. İngilizce gösteriliyor.',
  },
}

export function t(locale: Locale, key: string, vars?: Record<string, string>): string {
  const table = UI[locale]
  const template = table[key] ?? UI.en[key] ?? key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? '')
}

const COMMAND_ALIASES: Record<string, string> = {
  'نمی‌دانم': 'unknown',
  نمیدانم: 'unknown',
  bilmiyorum: 'unknown',
  'رد کردن': 'skip',
  atla: 'skip',
  'بعداً': 'decide later',
  sonra: 'decide later',
  'نامرتبط': 'not relevant',
  ilgisiz: 'not relevant',
  راهنما: 'help',
  yardım: 'help',
  خروج: 'exit',
  çıkış: 'exit',
  cikis: 'exit',
}

export function normalizeCommand(raw: string): string {
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()
  return COMMAND_ALIASES[trimmed] ?? COMMAND_ALIASES[lower] ?? trimmed
}

/** Yes/no words per locale. English is the base; fa and tr are locale data with equal standing. */
export const BOOLEAN_WORDS: Record<Locale, { yes: string[]; no: string[] }> = {
  en: { yes: ['yes', 'y', 'true'], no: ['no', 'n', 'false'] },
  fa: { yes: ['بله', 'آره'], no: ['خیر', 'نه'] },
  tr: { yes: ['evet'], no: ['hayır', 'hayir'] },
}

/** 'yes' | 'no' for a yes/no word in any supported locale, otherwise null. */
export function booleanWord(raw: string): 'yes' | 'no' | null {
  const token = raw.trim().toLowerCase()
  for (const words of Object.values(BOOLEAN_WORDS)) {
    if (words.yes.includes(token)) return 'yes'
    if (words.no.includes(token)) return 'no'
  }
  return null
}
