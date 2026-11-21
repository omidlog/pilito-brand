import fs from 'node:fs'
import path from 'node:path'
import type { AnswerRecord, FieldQuestion } from './types.js'
import { writeText } from './fsutil.js'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function fieldBlock(question: FieldQuestion, answer: AnswerRecord | null, file: string): string {
  const restrictedFile = file.includes(`${path.sep}restricted${path.sep}`) || file.includes('/restricted/')
  const withhold = question.sensitivity === 'restricted' && !restrictedFile
  const status = answer?.status ?? 'unanswered'
  const lines = [
    `### ${question.label}`,
    '',
    `- Question: \`${question.id}\``,
    `- Field: \`${question.field_path}\``,
    `- Status: ${status}`,
    `- Visibility: ${question.sensitivity}`,
    `- Authority: ${answer?.authority ?? 'unverified'}`,
    `- Source: ${answer?.source_type ?? 'none'}`,
    `- Uncertainty: ${answer?.uncertainty ?? 'none'}`,
    `- Updated: ${answer?.last_updated ?? 'n/a'}`,
    `- Answer id: ${answer?.answer_id ?? 'n/a'}`,
    '',
    'Value:',
    '',
  ]
  if (question.sensitivity === 'restricted') {
    lines.push(answer?.private_ref ? `Withheld. Opaque id ${answer.private_ref}. The value is not stored in Git.` : 'TBD')
  } else if (!answer || answer.value === null || answer.value === undefined) {
    lines.push(status === 'unknown' ? 'Unknown — not provided. Nothing was invented.' : 'TBD')
  } else if (withhold) {
    lines.push('Withheld (restricted). The value is not stored in Git.')
  } else {
    lines.push(String(answer.value))
  }
  if (answer?.status === 'approved') {
    lines.push('', `Approved by: ${answer.reviewed_by ?? 'unknown'}`)
  }
  if (answer?.source_type === 'agent_suggestion') {
    lines.push('', 'Origin: agent suggestion. This is not an owner-authored fact unless the status is approved.')
  }
  if (answer?.authority === 'estimated') {
    lines.push('', 'This value is an estimate, even if the wording has been accepted.')
  }
  return lines.join('\n')
}

export function upsertFieldBlock(file: string, questionId: string, inner: string): void {
  const start = `<!-- field:${questionId} start -->`
  const end = `<!-- field:${questionId} end -->`
  const wrapped = `${start}\n${inner}\n${end}`
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : draftHeader(file)
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`)
  const next = pattern.test(current) ? current.replace(pattern, wrapped) : `${current.trimEnd()}\n\n${wrapped}\n`
  writeText(file, next)
}

export function draftHeader(file: string): string {
  const restricted = file.includes('/restricted/')
  return [
    '---',
    'title: Interview draft',
    `visibility: ${restricted ? 'restricted' : 'internal'}`,
    'generated: true',
    '---',
    '',
    '# Interview draft',
    '',
    '> DRAFT. Generated from the answer ledger. Not an approved brand rule.',
    '> Human notes outside the field markers are kept until `brand:init` rebuilds this file.',
    '> Restricted values are withheld from non-restricted files.',
    '',
  ].join('\n')
}

export function renderDraftFile(file: string, blocks: Array<{ id: string; inner: string }>): string {
  const parts = [draftHeader(file).trimEnd()]
  for (const block of blocks) {
    parts.push(`<!-- field:${block.id} start -->\n${block.inner}\n<!-- field:${block.id} end -->`)
  }
  return `${parts.join('\n\n')}\n`
}
