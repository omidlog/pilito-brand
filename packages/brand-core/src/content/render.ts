import type { FieldQuestion, ModuleDef } from '../types.js'

export function renderModulePage(module: ModuleDef, questions: FieldQuestion[]): string {
  const owned = module.fields
  const referenced = module.references
    .map((id) => questions.find((question) => question.id === id))
    .filter((question): question is FieldQuestion => Boolean(question))
  const position = Number.parseInt(module.code.replace(/\D/g, ''), 10)
  const sidebar = Number.isFinite(position) ? position : 50
  const lines: string[] = [
    '---',
    `title: ${yamlString(module.title)}`,
    `sidebar_position: ${sidebar || 50}`,
    'tags:',
    `  - ${module.group}`,
    `  - ${module.id}`,
    'visibility: public',
    `module_id: ${module.id}`,
    `owner: ${module.owner}`,
    'status_note: starter',
  ]
  if (module.optional) lines.push(`optional_module: ${module.optional}`)
  if (module.facet) lines.push(`personal_facet: ${module.facet}`)
  lines.push(
    '---',
    '',
    `# ${module.code} — ${module.title}`,
    '',
    '**Answer status in a fresh template:** not started. Guidance on this page is reusable. It is not an approved brand decision.',
    `**Owner role:** ${module.owner}.`,
    '**Visibility of this guidance:** public. Interview answers default to internal, and some finance or partner fields are restricted.',
    '',
    '## Purpose',
    '',
    module.purpose,
    '',
    '## Decision this informs',
    '',
    module.decision,
    '',
    '## How to complete this module',
    '',
    '1. Run `npm run brand:interview`. The agent asks one eligible question at a time.',
    '2. Read the draft it writes under `brand/generated/drafts/` or, for restricted answers, `brand/restricted/drafts/`.',
    '3. Review with `npm run brand:review -- --module <id>`, then approve only what you mean: `npm run brand:approve -- --module <id>` or `-- --ids <id,…>`. The proof is read from `BRAND_OS_APPROVAL_PROOF` or a hidden prompt, never from the command line. Approval does not publish; `npm run brand:publish -- --ids <id>` is a separate step.',
    '4. Add real files to the asset manifest when you have them. Missing files stay missing.',
    '',
    '## Canonical fields',
    '',
    '| Field | Required | Sensitivity | Question |',
    '| --- | --- | --- | --- |',
  )
  for (const field of [...owned, ...referenced]) {
    const where = referenced.includes(field) ? 'canonical reference' : field.required ? 'yes' : 'optional'
    lines.push(`| ${field.label} | ${where} | ${field.sensitivity} | \`${field.id}\` |`)
  }
  lines.push('', '## Guidance', '')
  for (const paragraph of module.guidance) lines.push(paragraph, '')
  if (module.inputs.length) {
    lines.push('## Inputs', '')
    for (const item of module.inputs) lines.push(`- ${item}`)
    lines.push('')
  }
  if (module.artifacts.length) {
    lines.push('## Artifacts', '')
    for (const item of module.artifacts) lines.push(`- ${item}`)
    lines.push('')
  }
  if (module.acceptance.length) {
    lines.push('## Acceptance', '')
    for (const item of module.acceptance) lines.push(`- ${item}`)
    lines.push('')
  }
  lines.push(
    '## Fill-in record',
    '',
    `The empty record is \`${module.dir}/record.yaml\`. Live answers are stored in \`brand/instance/\` and the generated draft \`${module.draftPath}\`, so editing this overview does not approve a fact.`,
    '',
    '## Worked example',
    '',
    '> EXAMPLE — illustrative only. Not this brand’s position, offer, price, legal status, or artwork.',
    '',
    module.example,
    '',
    '## Do',
    '',
  )
  for (const item of module.dos) lines.push(`- ${item}`)
  lines.push('', '## Don\'t', '')
  for (const item of module.donts) lines.push(`- ${item}`)
  lines.push('', '## Review checklist', '')
  for (const item of module.checklist) lines.push(`- [ ] ${item}`)
  lines.push('', '## Dependencies', '')
  if (module.dependsOn.length === 0) lines.push('- None. This module can start from the interview.')
  for (const id of module.dependsOn) lines.push(`- \`${id}\``)
  lines.push(
    '',
    '## Related drafts',
    '',
    `Machine draft: \`${module.draftPath}\``,
    '',
    '## Completion',
    '',
    'Coverage counts required fields that have any honest disposition, including unknown. Approval counts only fields a permitted person has approved. `npm run brand:status` prints both. Unanswered is not approved.',
    '',
    '## Update cadence',
    '',
    module.cadence,
    '',
    '## Metrics',
    '',
    ...(module.metrics.length ? module.metrics.map((item) => `- ${item}`) : ['- None defined yet.']),
    '',
  )
  return `${lines.join('\n')}\n`
}

function yamlString(value: string): string {
  if (/[:#]/.test(value)) return JSON.stringify(value)
  return value
}

export function renderRecord(module: ModuleDef): string {
  const fields = module.fields
    .map(
      (field) =>
        `  ${field.id}:\n    label: ${JSON.stringify(field.label)}\n    value: null\n    status: unanswered\n    sensitivity: ${field.sensitivity}\n    notes: "TBD — no approved brand facts in the template"`,
    )
    .join('\n')
  return [
    `id: ${module.id}`,
    `name: ${JSON.stringify(module.title)}`,
    'status: not_started',
    `owner: ${module.owner}`,
    'version: 0.1.0',
    'last_reviewed: null',
    'next_review: null',
    'visibility: internal',
    'locale: und',
    'confidence: unknown',
    'assumptions: []',
    'source_refs: []',
    `related_ids: [${module.dependsOn.join(', ')}]`,
    'approved_by: null',
    'category: ' + module.group,
    'type: module-record',
    'fields:',
    fields,
    '',
  ].join('\n')
}

export function renderIntroduction(): string {
  return `---
title: Start here
sidebar_position: 0
tags:
  - start
visibility: public
module_id: start
owner: brand
---

# Brand OS

This portal is a **template**. The name “EXAMPLE Brand”, the colors, and the type stacks are pipeline samples. They are not an approved identity.

## What lives here

The Brand OS is the umbrella. The Business OS sits inside it, in \`brand/business-os\`. One brand, one private repository. A mascot and gamification can be turned off without deleting the template support for them.

## Status versus approval

A field can be unanswered, unknown, skipped, not applicable, draft, in review, or approved. Coverage is not approval. The dashboard prints both.

## Interview

Run \`npm run brand:interview\`. The agent asks one question, stores your answer with provenance, and updates a draft. It does not promote that draft to a rule unless you approve it.

Say \`unknown\`, \`skip\`, \`not relevant\`, or \`decide later\` when you do not have a fact. The agent must not fill the gap with a plausible brand.

## Restricted data

Finance figures, revenue-share notes, and board locations are restricted. They are kept out of the public documentation build, the public search index, and the default agent tools.
`
}
