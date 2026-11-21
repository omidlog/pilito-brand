/**
 * Auto-escaping HTML templates. Every interpolated value is escaped unless it is already `SafeHtml`
 * produced by this module. Repository content (names, facts, commit titles, PR titles) is therefore
 * always rendered as text, never as markup.
 */
export class SafeHtml {
  constructor(readonly value: string) {}

  toString(): string {
    return this.value
  }
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"'`]/g, (char) => ESCAPES[char] ?? char)
}

type Value = SafeHtml | string | number | boolean | null | undefined | Value[]

function render(value: Value): string {
  if (value === null || value === undefined || value === false) return ''
  if (Array.isArray(value)) return value.map(render).join('')
  if (value instanceof SafeHtml) return value.value
  return escapeHtml(value)
}

export function html(strings: TemplateStringsArray, ...values: Value[]): SafeHtml {
  let out = strings[0] ?? ''
  for (let index = 0; index < values.length; index += 1) out += render(values[index] as Value) + (strings[index + 1] ?? '')
  return new SafeHtml(out)
}

/** Only for markup this codebase wrote itself (icons). Never pass repository content here. */
export function trusted(markup: string): SafeHtml {
  return new SafeHtml(markup)
}

export function join(items: SafeHtml[], separator = ''): SafeHtml {
  return new SafeHtml(items.map((item) => item.value).join(separator))
}

/** `#rgb`, `#rrggbb` or `#rrggbbaa` only. Anything else is not used in an attribute. */
export function safeHex(value: unknown): string | null {
  return typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim()) ? value.trim() : null
}

/** Links that leave Studio must be plain https GitHub URLs. */
export function safeGitHubUrl(value: unknown): string | null {
  return typeof value === 'string' && /^https:\/\/github\.com\/[A-Za-z0-9._/-]+$/.test(value) ? value : null
}
