import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { templateConfig } from './config.js'
import { allModules, allQuestions } from './content/index.js'
import { STARTER_PROFILES } from './content/profiles.js'
import { buildMascotCatalog, CANONICAL_ANGLES, catalogCounts, CORE_MOTIONS, EXAMPLE_STAGES } from './content/mascot-catalog.js'
import { renderIntroduction, renderModulePage, renderRecord } from './content/render.js'
import { emptySession, InterviewEngine } from './engine.js'
import { exists, readYaml, writeText, writeYaml } from './fsutil.js'
import type { BrandConfig, FieldQuestion } from './types.js'

const WORDMARK = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160" role="img" aria-label="EXAMPLE wordmark placeholder">
  <title>EXAMPLE wordmark placeholder</title>
  <rect width="640" height="160" fill="#F7F5F2"/>
  <rect x="24" y="24" width="112" height="112" rx="12" fill="#123A73"/>
  <text x="160" y="88" font-family="Georgia, serif" font-size="42" fill="#1A1C1E">EXAMPLE</text>
  <text x="160" y="118" font-family="sans-serif" font-size="14" fill="#3E4A44">DRAFT placeholder — not an approved logo</text>
</svg>
`

const ICON = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="EXAMPLE icon placeholder">
  <title>EXAMPLE icon placeholder</title>
  <rect width="128" height="128" rx="16" fill="#123A73"/>
  <circle cx="64" cy="64" r="28" fill="#F7F5F2"/>
</svg>
`

const MASCOT_FRAME = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" aria-label="Empty mascot frame">
  <title>No approved mascot art</title>
  <rect width="640" height="640" fill="#F7F5F2"/>
  <rect x="32" y="32" width="576" height="576" fill="none" stroke="#123A73" stroke-width="4" stroke-dasharray="12 8"/>
  <text x="320" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#1A1C1E">EXAMPLE frame</text>
  <text x="320" y="348" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#3E4A44">No approved mascot art</text>
</svg>
`

function putText(file: string, text: string): void {
  if (!exists(file)) writeText(file, text)
}

function putYaml(file: string, data: unknown): void {
  if (!exists(file)) writeYaml(file, data)
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function bankName(question: FieldQuestion): string {
  if (question.id.startsWith('brand.mascot.')) return 'mascot.yaml'
  if (question.id.startsWith('brand.gamification.')) return 'gamification.yaml'
  if (question.module.startsWith('business')) return 'business.yaml'
  if (question.module.startsWith('personal')) return 'personal.yaml'
  return 'brand.yaml'
}

function doc(title: string, body: string, extras: Record<string, string> = {}): string {
  const front = ['---', `title: ${JSON.stringify(title)}`, 'visibility: public', ...Object.entries(extras).map(([key, value]) => `${key}: ${value}`), '---', '']
  return `${front.join('\n')}\n${body.trim()}\n`
}

export function writeStarterWorkspace(root: string): void {
  if (!exists(path.join(root, 'brand', 'brand.config.yaml'))) {
    putYaml(path.join(root, 'brand', 'brand.config.yaml'), templateConfig())
  }
  const questions = allQuestions()
  const banks = new Map<string, FieldQuestion[]>()
  for (const question of questions) {
    const name = bankName(question)
    banks.set(name, [...(banks.get(name) ?? []), question])
  }
  for (const [name, group] of banks) {
    putYaml(path.join(root, 'brand', 'interview', 'question-bank', name), { schema_version: 1, questions: group })
  }
  putYaml(path.join(root, 'brand', 'interview', 'field-registry.yaml'), {
    schema_version: 1,
    fields: questions.map((question) => ({
      id: question.field_path,
      module: question.module,
      field_path: question.field_path,
      label: question.label,
      required: question.required,
      weight: question.weight,
      sensitivity: question.sensitivity,
      question_ids: [question.id],
      documents: question.related_outputs,
      validator: question.completion_rule,
      related_ids: question.related_ids,
    })),
  })
  const edges = questions.flatMap((question) => [
    ...question.depends_on.map((dependency) => ({ from: dependency, to: question.id, relation: 'prerequisite' })),
    ...question.related_ids.map((related) => ({ from: question.id, to: related, relation: 'related' })),
  ])
  putYaml(path.join(root, 'brand', 'interview', 'knowledge-graph.yaml'), { schema_version: 1, edges })
  for (const profile of STARTER_PROFILES) putYaml(path.join(root, 'brand', 'interview', 'profiles', `${profile.id}.yaml`), profile)

  for (const module of allModules()) {
    putText(path.join(root, module.dir, 'overview.md'), renderModulePage(module, questions))
    putText(path.join(root, module.dir, 'record.yaml'), renderRecord(module))
  }
  putText(path.join(root, 'brand/content/00-start/introduction.md'), renderIntroduction())
  writeUseCases(root)
  writeTemplates(root)
  writeMascot(root)
  writeAssets(root)
  writeComponents(root)
  ensureInstance(root)
  writeManifest(root)
  putText(
    path.join(root, 'brand/restricted/CANARY.md'),
    '# Restricted collection policy\n\nDo not commit confidential answers. Restricted values belong in the gitignored encrypted store at brand/.private. This file intentionally contains no canary secret.\n',
  )
  putText(
    path.join(root, 'brand/restricted/README.md'),
    '# Restricted collection\n\nInterview answers marked restricted are written here. Do not copy this directory into a public documentation build, a search index, or an AI connector response.\n\nReal financial records, identifiers, and board materials do not belong in Git at all. Link the system of record instead.\n',
  )
  const draftDir = path.join(root, 'brand/generated/drafts')
  const hasDrafts = exists(draftDir) && fs.readdirSync(draftDir).some((name) => name.endsWith('.md'))
  if (!hasDrafts) new InterviewEngine(root).rebuildDrafts()
}

function ensureInstance(root: string): void {
  const ledger = path.join(root, 'brand/interview/answer-ledger.yaml')
  if (!exists(ledger)) putYaml(ledger, { schema_version: 1, records: [] })
  const session = path.join(root, 'brand/interview/session-state.yaml')
  if (!exists(session)) putYaml(session, emptySession('en'))
  for (const [file, body] of [
    ['brand/interview/contradictions.yaml', { schema_version: 1, derived: true, items: [] }],
    ['brand/interview/evidence-index.yaml', { schema_version: 1, items: [] }],
    ['brand/instance/draft-facts.yaml', { schema_version: 1, facts: {} }],
    ['brand/instance/approved-facts.yaml', { schema_version: 1, facts: {} }],
    ['brand/restricted/facts.yaml', { schema_version: 1, facts: {} }],
  ] as const) {
    if (!exists(path.join(root, file))) putYaml(path.join(root, file), body)
  }
}

function writeMascot(root: string): void {
  const catalog = buildMascotCatalog()
  const counts = catalogCounts(catalog)
  putYaml(path.join(root, 'brand/mascot/mascot.config.yaml'), {
    schema_version: 1,
    status: 'draft',
    artwork: 'none',
    note: 'Catalog slots are proposals. The six stages are an EXAMPLE CONFIGURATION, not a universal rule.',
    counts,
    total: catalog.length,
    mvp: catalog.filter((state) => state.mvp).map((state) => state.id),
  })
  putYaml(path.join(root, 'brand/mascot/catalog.yaml'), { schema_version: 1, states: catalog })
  const byCategory = (category: string) => catalog.filter((state) => state.category === category)
  putYaml(path.join(root, 'brand/mascot/expressions.yaml'), { schema_version: 1, states: byCategory('emotion') })
  putYaml(path.join(root, 'brand/mascot/poses.yaml'), { schema_version: 1, states: byCategory('action') })
  putYaml(path.join(root, 'brand/mascot/ui-states.yaml'), { schema_version: 1, states: byCategory('ui') })
  putYaml(path.join(root, 'brand/mascot/learning-contexts.yaml'), { schema_version: 1, states: byCategory('learning') })
  putYaml(path.join(root, 'brand/mascot/prop-interactions.yaml'), { schema_version: 1, states: byCategory('prop') })
  putYaml(path.join(root, 'brand/mascot/campaigns.yaml'), { schema_version: 1, states: byCategory('seasonal') })
  putYaml(path.join(root, 'brand/mascot/stages.yaml'), {
    schema_version: 1,
    label: 'EXAMPLE CONFIGURATION — not a universal brand rule',
    stages: EXAMPLE_STAGES,
  })
  putYaml(path.join(root, 'brand/mascot/angles.yaml'), { schema_version: 1, angles: CANONICAL_ANGLES })
  putYaml(path.join(root, 'brand/mascot/motions.yaml'), { schema_version: 1, motions: CORE_MOTIONS })
}

function writeAssets(root: string): void {
  const files: Array<{ relative: string; body: string }> = [
    { relative: 'brand/assets/logo/example-wordmark.svg', body: WORDMARK },
    { relative: 'brand/assets/icons/example-mark.svg', body: ICON },
    { relative: 'brand/assets/mascot/placeholder-frame.svg', body: MASCOT_FRAME },
  ]
  for (const file of files) putText(path.join(root, file.relative), file.body)
  for (const dir of ['brand/assets/illustrations', 'brand/assets/motion', 'brand/assets/audio', 'brand/assets/photography', 'brand/assets/mascot/turnaround']) {
    putText(path.join(root, dir, 'README.md'), 'This folder is intentionally empty. Add approved masters here or store them outside Git and record a checksummed URL in the manifest.\n')
  }
  putText(
    path.join(root, 'brand/assets/README.md'),
    '# Assets\n\nSource files and exports are different. Large video, 3D, and print masters should use Git LFS or `assets.bucket_url`, with a checksum in `asset-manifest.yaml`.\n\nThe SVG files in this template are EXAMPLE placeholders so links and checksums are real. They are not a logo or a character.\n\nApproved assets must set `present: true` and match `checksum_sha256`. Missing assets stay `present: false`.\n',
  )
  const present = files.map((file) => ({
    id: `asset.${file.relative.replace('brand/assets/', '').replace(/[/.]/g, '.')}`,
    path: file.relative,
    checksum: sha256(file.body),
  }))
  putYaml(path.join(root, 'brand/assets/asset-manifest.yaml'), {
    schema_version: 1,
    assets: [
      {
        id: 'asset.logo.example-wordmark',
        name: 'EXAMPLE wordmark placeholder',
        status: 'draft',
        owner: 'design',
        version: '0.1.0',
        visibility: 'public',
        license: 'EXAMPLE-ONLY — not a real brand license',
        attribution: 'Original placeholder geometry created for this template.',
        usage: 'Demonstrates the manifest and the gallery. Do not ship as a logo.',
        restrictions: 'Not an approved mark. No trademark is claimed.',
        path: 'brand/assets/logo/example-wordmark.svg',
        present: true,
        checksum_sha256: sha256(WORDMARK),
        mime: 'image/svg+xml',
        preview: 'brand/assets/logo/example-wordmark.svg',
        tags: ['logo', 'example', 'draft'],
      },
      {
        id: 'asset.icon.example-mark',
        name: 'EXAMPLE icon placeholder',
        status: 'draft',
        owner: 'design',
        version: '0.1.0',
        visibility: 'public',
        license: 'EXAMPLE-ONLY — not a real brand license',
        attribution: 'Original placeholder geometry created for this template.',
        usage: 'Demonstrates an icon download.',
        restrictions: 'Not an approved icon.',
        path: 'brand/assets/icons/example-mark.svg',
        present: true,
        checksum_sha256: sha256(ICON),
        mime: 'image/svg+xml',
        preview: 'brand/assets/icons/example-mark.svg',
        tags: ['icon', 'example', 'draft'],
      },
      {
        id: 'asset.mascot.placeholder-frame',
        name: 'Empty mascot frame',
        status: 'draft',
        owner: 'design',
        version: '0.1.0',
        visibility: 'public',
        license: 'EXAMPLE-ONLY',
        attribution: 'Template placeholder. No character is depicted.',
        usage: 'Shows an honest empty slot in the gallery.',
        restrictions: 'Do not treat this frame as character art.',
        path: 'brand/assets/mascot/placeholder-frame.svg',
        present: true,
        checksum_sha256: sha256(MASCOT_FRAME),
        mime: 'image/svg+xml',
        preview: 'brand/assets/mascot/placeholder-frame.svg',
        tags: ['mascot', 'placeholder', 'draft'],
      },
      {
        id: 'asset.mascot.turnaround',
        name: 'Canonical turnaround',
        status: 'not_started',
        owner: 'design',
        version: '0.1.0',
        visibility: 'internal',
        license: 'TBD',
        attribution: null,
        usage: 'Model sheet. Not created.',
        restrictions: 'Do not invent artwork to fill this id.',
        path: 'brand/assets/mascot/turnaround/canonical.png',
        present: false,
        checksum_sha256: null,
        mime: 'image/png',
        preview: null,
        missing_reason: 'No approved artwork. The placeholder frame is a different asset.',
        tags: ['mascot', 'missing'],
      },
    ],
  })
  void present
}

function writeComponents(root: string): void {
  putYaml(path.join(root, 'brand/content/12-product-ui-system/components.yaml'), {
    schema_version: 1,
    status: 'draft',
    note: 'Starter index. Not an approved production component library.',
    components: ['button', 'text-field', 'dialog', 'card', 'navigation', 'feedback', 'chart'].map((id) => ({
      id: `component.${id}`,
      name: id,
      status: 'draft',
      states: ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'error'],
      tokens: ['color.brand.primary', 'space.2', 'radius.md', 'type.body'],
      figma: null,
    })),
  })
}

function writeUseCases(root: string): void {
  const dir = path.join(root, 'brand/content/use-cases')
  putText(
    path.join(dir, 'instagram-carousel.md'),
    doc(
      'Use case: Instagram carousel',
      `## Request

“Create an Instagram carousel using approved brand typography.”

## Retrieval

1. Read \`AGENTS.md\`. Approved records outrank drafts.
2. Read \`brand/content/16-social-media/overview.md\`.
3. Read \`brand/tokens/typography.tokens.json\` and check that the status is still draft.
4. Call \`get_brand_tokens\` without \`include_unapproved\`.

## Result in this template

There is no approved typeface and no approved carousel template. Stop. Do not present the EXAMPLE font stack as the brand’s type.

## When assets are missing

Say what is missing, name the question ids \`brand.type.license\` and \`brand.social.templates\`, and wait. Do not draw stand-in brand content.`,
      { sidebar_position: '2', tags: '\n  - use-case' },
    ),
  )
  putText(
    path.join(dir, 'onboarding-mascot.md'),
    doc(
      'Use case: onboarding mascot',
      `## Request

“Find the approved happy mascot pose for an onboarding success screen.”

## Retrieval

1. Check \`brand.mascot.enabled\`.
2. Look up \`mascot.ui.success\`, then \`mascot.emotion.joyful\` and \`mascot.emotion.delighted\`.
3. Read \`source_assets\`, \`preview\`, and \`status\`.

## Result in this template

The rows exist as draft proposals. \`source_assets\` is empty and \`preview\` is null. The gallery shows the empty frame, which is not the character.

Do not generate a character to fill the request.`,
      { sidebar_position: '3', optional_module: 'mascot' },
    ),
  )
  putText(
    path.join(dir, 'website-screen.md'),
    doc(
      'Use case: website screen',
      `## Request

Design a website screen that respects brand rules.

## Retrieval

1. Read product public status before showing a feature.
2. Use color and type tokens by id. Do not copy a hex into the page if the token is unapproved; label the sample EXAMPLE.
3. Check contrast pairs in the token report.
4. Keep focus visible and do not use color as the only status.

## Result in this template

The documentation theme uses the EXAMPLE palette so the portal has a real theme. That theme is not a customer product UI and not an approved brand.`,
      { sidebar_position: '4' },
    ),
  )
  putText(
    path.join(dir, 'motion-clip.md'),
    doc(
      'Use case: motion clip',
      `## Request

Make a short motion clip.

## Retrieval

1. Read motion principles and the reduced-motion answer.
2. Use duration tokens rather than a one-off timing.
3. If the clip needs a character, use a motion brief id from \`brand/mascot/motions.yaml\` and stop when the fallback still is missing.

## Result in this template

Durations are EXAMPLE drafts. There is no approved logo sting and no character render. A reduced-motion still is required before any loop ships.`,
      { sidebar_position: '5' },
    ),
  )
  putText(
    path.join(dir, 'campaign-handoff.md'),
    doc(
      'Use case: campaign handoff',
      `## Request

Hand a campaign to design.

## Retrieval

1. Open the campaign brief template.
2. Quote \`business.customer.primary_segment\`, \`business.offer.value_proposition\`, \`business.sales.pricing\`, and \`business.product.public_status\` by id.
3. If any of those are unknown, write unknown in the brief. Do not invent a price or an availability claim.

## Result in this template

The brief can be created. It will be full of TBD until the interview records those fields.`,
      { sidebar_position: '6' },
    ),
  )
}

function writeTemplates(root: string): void {
  const briefs: Array<{ file: string; title: string; optional?: string; ask: string }> = [
    { file: 'intake.md', title: 'Brand intake', ask: 'Capture name, sector, offer, audience, and mascot yes/no. Prefer the interview over filling this whole brief at once.' },
    { file: 'logo-brief.md', title: 'Logo brief', ask: 'Variants, clear space, minimum size, misuse, and where the master will live. No artwork is attached in the template.' },
    { file: 'mascot-concept.md', title: 'Mascot concept brief', optional: 'mascot', ask: 'Role, personality, anatomy rules, forbidden distortions. Do not attach generated character art.' },
    { file: 'expression-request.md', title: 'Expression and pose request', optional: 'mascot', ask: 'Request one catalog id. Include surface, stage, and angle. Reject the request if the id does not exist.' },
    { file: 'stage-request.md', title: 'Progression stage request', optional: 'mascot', ask: 'Stage count and continuity. The six-stage story is an example configuration.' },
    { file: 'ui-component.md', title: 'UI component request', ask: 'Name, states, token ids, accessibility notes, and the Figma id if one exists.' },
    { file: 'illustration.md', title: 'Illustration request', ask: 'Scene goal, complexity, character yes/no, and unacceptable treatments.' },
    { file: 'social-post.md', title: 'Social post request', ask: 'Channel, pillar, CTA, and the availability claim id. No unapproved type.' },
    { file: 'print.md', title: 'Print and merchandise request', ask: 'Object, quantity intent, color spec source, and bleed TBD until a printer confirms it.' },
    { file: 'motion.md', title: 'Video and motion request', ask: 'Duration intent, audio yes/no, reduced-motion still, and deliverable format.' },
    { file: 'campaign.md', title: 'Campaign and landing page request', ask: 'Objective, audience id, offer id, price id, and product status. Unknown stays unknown.' },
    { file: 'brand-change.md', title: 'Brand change proposal', ask: 'Current approved value, proposed value, impacted ids, and the approver. Do not edit the approved record in place.' },
  ]
  for (const brief of briefs) {
    const extras: Record<string, string> = {}
    if (brief.optional) extras.optional_module = brief.optional
    putText(
      path.join(root, 'brand/templates', brief.file),
      doc(
        brief.title,
        `## Lifecycle

\`not_started → draft → in_review → approved → deprecated\`

A casual prompt does not move a record to approved. Approval records the actor.

## What to capture

${brief.ask}

## Fields

- Requester: TBD
- Date: TBD
- Canonical ids referenced: TBD
- Status: draft
- Visibility: internal

## Approval

Name the person who may approve. If this changes an approved logo, character, price, or public claim, show the diff first.
`,
        extras,
      ),
    )
  }
}

function writeManifest(root: string): void {
  const configPath = path.join(root, 'brand', 'brand.config.yaml')
  const config = exists(configPath) ? readYaml<BrandConfig>(configPath) : templateConfig()
  putText(path.join(root, 'brand/brand-manifest.json'), JSON.stringify({
    schema_version: 1,
    name: config.brand.name,
    slug: config.brand.slug,
    status: 'draft',
    note: 'Index of template documents. EXAMPLE values are not approved brand facts.',
    documents: allModules().map((module) => ({
      id: module.id,
      title: module.title,
      path: `${module.dir}/overview.md`,
      draft: module.draftPath,
      optional: module.optional ?? null,
    })),
    tokens: [
      'brand/tokens/color.tokens.json',
      'brand/tokens/typography.tokens.json',
      'brand/tokens/space.tokens.json',
      'brand/tokens/radius.tokens.json',
      'brand/tokens/motion.tokens.json',
      'brand/tokens/elevation.tokens.json',
    ],
    question_bank: 'brand/interview/question-bank',
    field_registry: 'brand/interview/field-registry.yaml',
    assets: 'brand/assets/asset-manifest.yaml',
    mascot_catalog: 'brand/mascot/catalog.yaml',
  }, null, 2))
}
