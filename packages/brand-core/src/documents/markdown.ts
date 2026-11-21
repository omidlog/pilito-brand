import type { StructuredValue } from '../structured.js'
import type { DocumentItem, DocumentModel, ItemTag } from './model.js'

const TAG_LABEL: Record<ItemTag, string> = {
  approved: 'Approved',
  assumption: 'Assumption',
  recommendation: 'Recommendation',
  missing: 'Missing',
}

const VERIFICATION_LABEL = { verified: 'Verified', owner_stated: 'Owner-stated', unverified: 'Unverified' } as const

function escape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '\\|')
}

function structuredLines(value: StructuredValue): string[] {
  switch (value.type) {
    case 'color':
      return ['| Role | Hex |', '| --- | --- |', ...value.colors.map((color) => `| ${color.role} | \`${color.hex}\` |`)]
    case 'font':
      return [
        '| Role | Family | Fallback | Size |',
        '| --- | --- | --- | --- |',
        ...value.fonts.map((font) => `| ${font.role} | ${escape(font.family)} | ${escape(font.fallback.join(', '))} | ${font.size_px === null ? '—' : `${font.size_px}px${font.line_height === null ? '' : ` / ${font.line_height}`}`} |`),
      ]
    case 'logo_spec':
      return [
        `- Minimum size: ${value.logo.min_size_px}px`,
        `- Clear space: ${value.logo.clear_space.value}${value.logo.clear_space.unit === 'x' ? '× the mark height' : 'px'}`,
        ...(value.logo.min_print_mm === null ? [] : [`- Minimum print size: ${value.logo.min_print_mm}mm`]),
      ]
    case 'voice_pairs':
      return ['| Do | Don’t |', '| --- | --- |', ...value.pairs.map((pair) => `| ${escape(pair.do)} | ${escape(pair.dont)} |`)]
    case 'relationships':
      return [
        '| Relation | Organization | From | To | Ownership |',
        '| --- | --- | --- | --- | --- |',
        ...value.relationships.map((entry) => `| ${entry.relation} | ${escape(entry.organization)} | ${entry.from} | ${entry.to} | ${entry.ownership === 'unstated' ? 'not stated (no ownership claim)' : entry.ownership} |`),
      ]
  }
}

function itemLines(item: DocumentItem): string[] {
  const verification = item.verification && item.verification !== 'not_required' ? ` · ${VERIFICATION_LABEL[item.verification]}` : ''
  const lines = [`### ${escape(item.label)}`, '', `**${TAG_LABEL[item.tag]}**${verification}${item.note ? ` — ${escape(item.note)}` : ''}`, '']
  if (item.withheld) lines.push('Value withheld.', '')
  else if (item.structured) lines.push(...structuredLines(item.structured), '')
  else if (item.value !== null) lines.push(escape(String(item.value)), '')
  lines.push(`Sources: ${item.source_ids.map((id) => `\`${id}\``).join(', ')}${item.version === null ? '' : ` · version ${item.version}`}`, '')
  return lines
}

/** Markdown edition of a document model. Every item shows its tag and its sources. */
export function renderDocumentMarkdown(model: DocumentModel): string {
  const lines = [
    `# ${escape(model.title)}`,
    '',
    `> ${model.note}`,
    '',
    `Brand: \`${model.brand_id}\` · audience: ${model.audience} · ${model.counts.approved} approved, ${model.counts.assumption} assumptions, ${model.counts.recommendation} recommendations, ${model.counts.missing} missing.`,
    '',
  ]
  for (const section of model.sections) {
    lines.push(`## ${escape(section.title)}`, '', `${escape(section.purpose)} Status: ${section.status}.`, '')
    if (section.length) lines.push(`> Length: ${escape(section.length.note)}`, '')
    for (const item of section.items) lines.push(...itemLines(item))
  }
  return `${lines.join('\n').trimEnd()}\n`
}
