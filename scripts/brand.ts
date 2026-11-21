import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { parseArgs } from 'node:util'
import { stdin as input, stdout as output } from 'node:process'
import { applyInit, backupBrand, InterviewEngine, migrateBrand, RESET_CONFIRMATION, resetInterviewState, restoreBrand } from '@brand-os/brand-core'
import type { BatchResult, IntakeReport, NextReport, ReviewQueue, Selection } from '@brand-os/brand-core'

const [command, ...rest] = process.argv.slice(2)
const root = process.cwd()
const engine = new InterviewEngine(root)

if (command === 'init') {
  const { values } = parseArgs({
    args: rest,
    options: {
      name: { type: 'string' },
      slug: { type: 'string' },
      industry: { type: 'string', default: 'TBD' },
      sector: { type: 'string' },
      language: { type: 'string', default: 'en' },
      languages: { type: 'string', default: 'en' },
      website: { type: 'string' },
      mascot: { type: 'string', default: 'false' },
      gamification: { type: 'string', default: 'false' },
      publish: { type: 'string', default: 'private' },
      profile: { type: 'string', default: 'universal' },
      personal: { type: 'string' },
      facets: { type: 'string' },
      yes: { type: 'boolean', default: false },
      reset: { type: 'boolean', default: false },
    },
  })
  if (!values.name || !values.slug) {
    console.error('brand:init needs --name and --slug. Example: npm run brand:init -- --name "Northwind" --slug northwind --yes')
    process.exit(1)
  }
  if (!values.yes) {
    console.error('Refusing to reset interview state without --yes.')
    process.exit(1)
  }
  const config = applyInit(root, {
    name: values.name,
    slug: values.slug,
    industry: values.industry ?? 'TBD',
    sector: values.sector,
    language: values.language ?? 'en',
    languages: (values.languages ?? 'en').split(',').map((item) => item.trim()),
    website: values.website ?? null,
    mascot: values.mascot === 'true',
    gamification: values.gamification === 'true',
    publish: values.publish === 'public' ? 'public' : 'private',
    profile: values.profile,
    personal: values.personal === undefined ? undefined : values.personal === 'true',
    facets: values.facets ? values.facets.split(',').map((item) => item.trim()).filter(Boolean) : [],
    reset: values.reset === true,
  })
  const personal = config.modules.personal
  console.log(`Initialized ${config.brand.name} (${config.brand.slug}). Profile ${config.brand.profile}. Mascot ${config.modules.mascot.enabled ? 'on' : 'off'}. Personal ${personal?.enabled ? `on${personal.facets.length ? ` (${personal.facets.join(', ')})` : ''}` : 'off'}.`)
  console.log(engine.statusText())
} else if (command === 'interview' || command === 'resume') {
  const { values } = parseArgs({
    args: rest,
    options: {
      batch: { type: 'string' },
      question: { type: 'string' },
      answer: { type: 'string' },
      json: { type: 'boolean', default: false },
      assist: { type: 'boolean', default: false },
      text: { type: 'string' },
      file: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  })
  if (values.assist) {
    // Free-text turn: a configured model (or deterministic rules) proposes drafts. Nothing is approved.
    const { assistTurn, resolveProvider } = await import('@brand-os/brand-core')
    let text: string
    if (values.text !== undefined) text = values.text
    else if (values.file) text = values.file === '-' ? await readAllStdin() : fs.readFileSync(path.resolve(values.file), 'utf8')
    else if (input.isTTY) {
      const rl = readline.createInterface({ input, output })
      text = await rl.question('Tell me about the business in your own words (one paragraph):\n> ')
      rl.close()
    } else text = await readAllStdin()
    const resolved = resolveProvider(engine)
    const result = await assistTurn(engine, text, {
      provider: resolved.provider,
      reason: resolved.reason,
      limits: resolved.limits,
      dryRun: values['dry-run'],
      source: { kind: values.file && values.file !== '-' ? 'imported_text' : 'interview_turn', ref: values.file && values.file !== '-' ? path.basename(values.file) : 'assist' },
    })
    if (values.json) {
      console.log(JSON.stringify({ ok: result.mode !== 'refused', mode: result.mode, provider: result.provider, reason: result.reason, provider_error: result.provider_error, report: result.report }, null, 2))
    } else {
      console.log(`${result.mode === 'model' ? 'Model' : result.mode === 'fallback' ? 'Deterministic rules' : 'Refused'}: ${result.reason}`)
      if (result.report) console.log(formatIntake(result.report))
    }
    if (result.mode === 'refused') process.exit(1)
  } else if (values.batch) {
    const answers = JSON.parse(fs.readFileSync(path.resolve(values.batch), 'utf8')) as Record<string, string>
    let steps = 0
    while (steps < 500) {
      const current = engine.current()
      if (!current) break
      const raw = answers[current.id]
      if (raw === undefined) break
      const result = engine.submit(raw)
      console.log(`\n${current.id}\n${result.message}`)
      if (result.kind === 'error' || result.kind === 'exit') break
      steps += 1
    }
    console.log(`\n${engine.statusText()}`)
  } else if (values.question !== undefined || values.answer !== undefined) {
    // Agent mode: answer any question by id, in any order. Same commands as the interactive interview.
    if (!values.question || values.answer === undefined) {
      console.error('Usage: brand:interview --question <id> --answer "<text | unknown | skip | n/a | estimate: …>" [--json]')
      process.exit(2)
    }
    const { dispositionFor, nextReport } = await import('@brand-os/brand-core')
    const question = engine.question(values.question)
    if (question?.sensitivity === 'restricted' && !dispositionFor(values.answer)) {
      // Restricted values must not travel through argv (shell history, process list) or an agent's context.
      const message = `${values.question} is restricted. Answer it yourself in the interactive interview (npm run brand:interview). Nothing was recorded.`
      if (values.json) console.log(JSON.stringify({ ok: false, kind: 'error', question_id: values.question, message }, null, 2))
      else console.error(message)
      process.exit(1)
    }
    const result = engine.answerQuestion(values.question, values.answer)
    const ok = result.kind === 'recorded'
    if (values.json) {
      const upcoming = nextReport(engine, { limit: 3 })
      console.log(
        JSON.stringify(
          {
            ok,
            kind: result.kind,
            question_id: result.questionId ?? values.question,
            status: result.status ?? null,
            message: result.message,
            impact: result.impact ?? null,
            next: upcoming.next.map((item) => ({ id: item.id, prompt: item.prompt, reasons: item.reasons })),
            conflicts: upcoming.conflicts.length,
          },
          null,
          2,
        ),
      )
    } else {
      console.log(result.message)
    }
    if (!ok) process.exit(1)
  } else {
    await interactive()
  }
} else if (command === 'next') {
  const { values } = parseArgs({
    args: rest,
    options: {
      json: { type: 'boolean', default: false },
      limit: { type: 'string', default: '5' },
      profile: { type: 'string' },
      locale: { type: 'string' },
    },
  })
  const { nextReport } = await import('@brand-os/brand-core')
  const locale = values.locale === 'fa' || values.locale === 'tr' || values.locale === 'en' ? values.locale : undefined
  const report = nextReport(engine, { limit: Number.parseInt(values.limit ?? '5', 10) || 5, profile: values.profile, locale })
  if (values.json) console.log(JSON.stringify(report, null, 2))
  else console.log(formatNext(report))
} else if (command === 'propose') {
  const { values } = parseArgs({
    args: rest,
    options: {
      file: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  })
  if (!values.file) {
    console.error('Usage: brand:propose --file <batch.json | -> [--dry-run] [--json]')
    console.error('Stores schema-valid proposals as drafts with provenance. It never approves or publishes.')
    process.exit(2)
  }
  const { applyProposalBatch, parseProposalBatch } = await import('@brand-os/brand-core')
  let parsedJson: unknown
  try {
    const text = values.file === '-' ? await readAllStdin() : fs.readFileSync(path.resolve(values.file), 'utf8')
    parsedJson = JSON.parse(text)
  } catch (error) {
    console.error(`Could not read a JSON proposal batch: ${error instanceof SyntaxError ? 'invalid JSON' : 'file not readable'}. Nothing was stored.`)
    process.exit(2)
  }
  const parsed = parseProposalBatch(parsedJson)
  if (!parsed.ok) {
    if (values.json) console.log(JSON.stringify({ ok: false, errors: parsed.errors }, null, 2))
    else console.error(`Proposal batch rejected. Nothing was stored.\n${parsed.errors.map((line) => `- ${line}`).join('\n')}`)
    process.exit(1)
  }
  const report = applyProposalBatch(engine, parsed.batch, { origin: 'agent', dryRun: values['dry-run'], dropped: parsed.dropped })
  console.log(values.json ? JSON.stringify(report, null, 2) : formatIntake(report))
} else if (command === 'status') {
  console.log(engine.statusText())
} else if (command === 'review') {
  const { values } = parseArgs({
    args: rest,
    options: {
      module: { type: 'string' },
      ids: { type: 'string' },
      all: { type: 'boolean', default: false },
      full: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  })
  if (values.full) {
    console.log(engine.reviewText(false))
  } else {
    const queue = withSelectionErrors(() => engine.approvals().reviewQueue(selectionFrom(values), { includeSettled: values.all || Boolean(values.ids) }))
    console.log(values.json ? JSON.stringify(queue, null, 2) : formatQueue(queue))
  }
} else if (command === 'validate') {
  const { validateRepo } = await import('@brand-os/brand-core')
  const report = validateRepo(root)
  if (!report.ok) {
    console.error(report.errors.join('\n'))
    process.exit(1)
  }
  console.log('Brand validation passed.')
} else if (command === 'export') {
  const { values } = parseArgs({ args: rest, options: { public: { type: 'boolean', default: false } } })
  const snapshot = engine.exportSnapshot(values.public ? 'public' : 'full')
  const dir = path.join(root, 'brand', 'exports')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, values.public ? 'public-snapshot.json' : 'latest-snapshot.json')
  fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`Wrote ${path.relative(root, file)}. Full snapshots can contain restricted answers and are gitignored.`)
} else if (command === 'evidence') {
  // Evidence & rights register for personal claims. add/list/withdraw are open; verify/reject need the owner proof.
  const [action, ...args] = rest
  const { values } = parseArgs({
    args,
    options: {
      claim: { type: 'string' },
      kind: { type: 'string', default: 'verification' },
      source: { type: 'string' },
      reference: { type: 'string' },
      quote: { type: 'string' },
      note: { type: 'string' },
      'granted-by': { type: 'string' },
      scope: { type: 'string' },
      'review-due': { type: 'string' },
      id: { type: 'string' },
      reason: { type: 'string' },
      json: { type: 'boolean', default: false },
      proof: { type: 'string' },
    },
  })
  if (values.proof !== undefined) {
    console.error('--proof is not accepted on the command line. Nothing was changed.')
    process.exit(2)
  }
  const { addEvidence, readEvidence, claimVerification, publicationBlockers } = await import('@brand-os/brand-core')
  try {
    if (action === 'add') {
      if (!values.claim || !values.source || !values.reference) {
        console.error('Usage: brand:evidence add --claim <question id> --source owner_testimony|document|public_record|third_party|link --reference <url or where it is held> [--kind verification|permission] [--scope public|internal] [--granted-by <role or organization>] [--quote <text>] [--note <text>] [--review-due YYYY-MM-DD]')
        process.exit(2)
      }
      const item = addEvidence(root, engine.questions(), {
        claim_id: values.claim,
        kind: values.kind as 'verification' | 'permission',
        source_type: values.source as 'owner_testimony',
        reference: values.reference,
        quote: values.quote ?? null,
        note: values.note ?? null,
        granted_by: values['granted-by'] ?? null,
        scope: (values.scope as 'public' | 'internal' | undefined) ?? null,
        review_due: values['review-due'] ?? null,
        recorded_by: process.env.BRAND_OS_AGENT_TOKEN ? 'agent' : 'owner',
      })
      console.log(values.json ? JSON.stringify(item, null, 2) : `Recorded ${item.id} for ${item.claim_id} as pending. The owner verifies it with brand:evidence verify --id ${item.id}.`)
    } else if (action === 'verify' || action === 'reject') {
      if (!values.id) {
        console.error(`Usage: brand:evidence ${action} --id ev-0001 [--reason <text>]. The proof is read from BRAND_OS_APPROVAL_PROOF, piped stdin, or a hidden prompt.`)
        process.exit(2)
      }
      if (process.env.BRAND_OS_AGENT_TOKEN) {
        console.error('Evidence review is a human action. Run it from a shell without an agent token.')
        process.exit(2)
      }
      const result = engine.approvals().reviewEvidence(values.id, action === 'verify' ? 'verified' : 'rejected', await readApprovalProof(), values.reason ?? null)
      console.log(result.message + (result.unpublished.length ? ` Unpublished: ${result.unpublished.join(', ')}.` : ''))
      if (!result.ok) process.exit(1)
    } else if (action === 'withdraw') {
      if (!values.id || !values.reason) {
        console.error('Usage: brand:evidence withdraw --id ev-0001 --reason <why>')
        process.exit(2)
      }
      const result = engine.approvals().withdrawEvidence(values.id, values.reason)
      engine.rebuildDrafts()
      console.log(result.message)
    } else if (action === 'list' || action === undefined) {
      const items = readEvidence(root).filter((item) => !values.claim || item.claim_id === values.claim)
      if (values.json) console.log(JSON.stringify(items, null, 2))
      else if (items.length === 0) console.log('No evidence recorded.')
      else for (const item of items) console.log(`${item.id} ${item.status.padEnd(9)} ${item.kind.padEnd(12)} ${item.source_type.padEnd(15)} ${item.claim_id} — ${item.reference}${item.review_due ? ` (review by ${item.review_due})` : ''}`)
    } else if (action === 'check') {
      const now = new Date()
      const items = readEvidence(root)
      const claims = engine.questions().filter((question) => question.publication_requires?.length && (!values.claim || question.id === values.claim))
      for (const question of claims) {
        const blockers = publicationBlockers(question, null, items, now)
        console.log(`${question.id}: ${claimVerification(question, items, now)}${blockers.length ? ` — blocked: ${blockers.join(' ')}` : ' — eligible after approval'}`)
      }
    } else {
      console.error('Usage: brand:evidence list|add|verify|reject|withdraw|check')
      process.exit(2)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
} else if (command === 'retract') {
  const { values } = parseArgs({ args: rest, options: { question: { type: 'string' }, reason: { type: 'string' }, proof: { type: 'string' } } })
  if (values.proof !== undefined) {
    console.error('--proof is not accepted on the command line. Nothing was changed.')
    process.exit(2)
  }
  if (!values.question || !values.reason) {
    console.error('Usage: brand:retract --question <id> --reason <why>. Removes an approved claim, unpublishes it and rebuilds drafts. Needs the owner proof.')
    process.exit(2)
  }
  if (process.env.BRAND_OS_AGENT_TOKEN) {
    console.error('Retraction is a human action. Run it from a shell without an agent token.')
    process.exit(2)
  }
  const step = engine.approvals().retract(values.question, await readApprovalProof(), values.reason)
  console.log(step.message)
  if (step.kind === 'error') process.exit(1)
} else if (command === 'approve' || command === 'publish') {
  const { values } = parseArgs({
    args: rest,
    options: {
      module: { type: 'string' },
      ids: { type: 'string' },
      question: { type: 'string' },
      actor: { type: 'string', default: 'owner' },
      unpublish: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      // Declared only so it can be refused without echoing its value.
      proof: { type: 'string' },
    },
  })
  if (values.proof !== undefined) {
    console.error(`--proof is not accepted: a secret on the command line leaks into shell history and the process list. Nothing was changed.`)
    console.error('Set BRAND_OS_APPROVAL_PROOF for this one command, pipe the proof on stdin, or type it at the hidden prompt.')
    process.exit(2)
  }
  if (process.env.BRAND_OS_AGENT_TOKEN) {
    console.error(`brand:${command} refuses to run while BRAND_OS_AGENT_TOKEN is set. Approval and publication are human actions; run them from a shell without an agent token.`)
    process.exit(2)
  }
  if (command === 'publish' && values.question) {
    console.error('brand:publish takes --ids or --module.')
    process.exit(2)
  }
  const ids = [values.ids, values.question].filter(Boolean).join(',')
  const selection = selectionFrom({ module: values.module, ids: ids || undefined })
  if (!selection.module && !selection.ids?.length) {
    console.error(
      command === 'approve'
        ? 'Usage: brand:approve --module <id> | --ids <id,chg-…> [--actor owner] [--dry-run] [--json]'
        : 'Usage: brand:publish --module <id> | --ids <id,…> [--unpublish] [--dry-run] [--json]',
    )
    console.error('The approval proof is read from BRAND_OS_APPROVAL_PROOF, piped stdin, or a hidden prompt. Never from argv.')
    process.exit(2)
  }
  const approvals = engine.approvals()
  if (command === 'approve') {
    const queue = withSelectionErrors(() => approvals.reviewQueue(selection, { includeSettled: Boolean(selection.ids) }))
    if (values['dry-run']) {
      console.log(values.json ? JSON.stringify(queue, null, 2) : formatQueue(queue))
      process.exit(0)
    }
    if (!values.json) console.error(`About to approve ${queue.pending} item(s) as ${values.actor ?? 'owner'}. Approval does not publish.`)
    const proof = await readApprovalProof()
    const result = withSelectionErrors(() => approvals.approveBatch(selection, proof, values.actor ?? 'owner'))
    console.log(values.json ? JSON.stringify(result, null, 2) : formatBatch(result))
    if (!result.ok) process.exit(1)
  } else {
    if (values['dry-run']) {
      const queue = withSelectionErrors(() => approvals.reviewQueue(selection, { includeSettled: true }))
      console.log(values.json ? JSON.stringify(queue, null, 2) : formatQueue(queue))
      process.exit(0)
    }
    const proof = await readApprovalProof()
    const result = withSelectionErrors(() => approvals.publish(selection, proof, { unpublish: values.unpublish }))
    if (values.json) console.log(JSON.stringify(result, null, 2))
    else {
      for (const item of result.results) console.log(`${item.outcome.padEnd(11)} ${item.id}  ${item.reason}`)
      console.log(result.proof === 'rejected' ? 'Proof rejected. Nothing was changed.' : `${result.changed} change(s) written to the publication allowlist.`)
    }
    if (!result.ok) process.exit(1)
  }
} else if (command === 'query') {
  const { values } = parseArgs({
    args: rest,
    options: {
      tool: { type: 'string' },
      query: { type: 'string', default: '' },
      kind: { type: 'string' },
      module: { type: 'string' },
      ids: { type: 'string' },
      emotion: { type: 'string' },
      stage: { type: 'string' },
      'use-case': { type: 'string' },
      angle: { type: 'string' },
      section: { type: 'string' },
      'include-unapproved': { type: 'boolean', default: false },
    },
  })
  if (values['include-unapproved']) {
    console.error('--include-unapproved is ignored. It grants nothing: drafts, EXAMPLE tokens, and internal facts are never returned by this flag.')
  }
  const core = await import('@brand-os/brand-core')
  // Same resolution as the MCP server: the token comes from the environment, never from argv.
  let ctx
  try {
    ctx = core.resolveAgentContext(root, engine.config().brand.slug, process.env[core.AGENT_TOKEN_ENV])
  } catch (error) {
    console.error(error instanceof core.AgentTokenError ? error.message : 'Agent token resolution failed.')
    process.exit(1)
  }
  const tool = values.tool ?? 'get_brand_status'
  const q = values.query ?? ''
  const handlers: Record<string, () => unknown> = {
    brand_retrieve: () => {
      const kind = values.kind ?? 'facts'
      if (!(core.RETRIEVE_KINDS as readonly string[]).includes(kind)) {
        console.error(`--kind must be one of: ${core.RETRIEVE_KINDS.join(', ')}`)
        process.exit(1)
      }
      return core.brandRetrieve(engine, ctx, {
        kind: kind as (typeof core.RETRIEVE_KINDS)[number],
        module: values.module,
        ids: values.ids ? values.ids.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
        query: q || undefined,
        filters: { emotion: values.emotion, stage: values.stage, use_case: values['use-case'], angle: values.angle },
      })
    },
    search_brand_docs: () => core.searchBrandDocs(engine, q, ctx),
    get_brand_tokens: () => core.getBrandTokens(engine, ctx),
    list_mascot_assets: () => core.listMascotAssets(engine, ctx),
    list_mascot_stages: () => core.listMascotStages(engine, ctx),
    search_mascot_assets: () => core.searchMascotAssets(engine, q, ctx),
    get_design_component: () => core.getDesignComponent(engine, q || 'button', ctx),
    get_social_template: () => core.getSocialTemplate(engine, q || 'unspecified', ctx),
    get_asset_metadata: () => core.getAssetMetadata(engine, q, ctx),
    get_brand_overview: () => core.getBrandOverview(engine, ctx),
    get_brand_guidelines: () => core.getBrandGuidelines(engine, ctx),
    get_logo_rules: () => core.getLogoRules(engine, ctx),
    get_mascot_guidelines: () => core.getMascotGuidelines(engine, ctx),
    get_mascot_profile: () => core.getMascotProfile(engine, ctx),
    get_motion_guidelines: () => core.getMotionGuidelines(engine, ctx),
    get_marketing_plan: () => core.getMarketingPlan(engine, ctx),
    get_business_plan: () => core.getBusinessPlan(engine, ctx),
    get_brand_status: () => core.getBrandStatus(engine, ctx),
    draft_personal_content: () => core.draftPersonalContent(engine, q || 'professional-bio', ctx, values.section),
  }
  const handler = handlers[tool]
  if (!handler) {
    console.error(`Unknown tool ${tool}. Tools: ${Object.keys(handlers).sort().join(', ')}`)
    process.exit(1)
  }
  console.log(JSON.stringify(handler(), null, 2))
} else if (command === 'agent-token') {
  const [action, ...tokenArgs] = rest
  const { values } = parseArgs({
    args: tokenArgs,
    options: { profile: { type: 'string' }, label: { type: 'string' }, id: { type: 'string' }, json: { type: 'boolean', default: false } },
  })
  const core = await import('@brand-os/brand-core')
  if (!['issue', 'list', 'revoke'].includes(action ?? '')) {
    console.error('Usage: brand:agent-token issue --profile <internal-read|design|marketing|finance> --label <name> | list | revoke --id <agt_…>')
    console.error('The approval proof is read from BRAND_OS_APPROVAL_PROOF or a hidden prompt. It is never accepted on the command line.')
    process.exit(1)
  }
  const proof = await readApprovalProof()
  if (!core.approvalProofMatches(root, proof)) {
    console.error('Approval proof rejected. Agent tokens are managed by the owner only. Nothing was changed.')
    process.exit(1)
  }
  if (action === 'issue') {
    if (!core.isAgentProfile(values.profile)) {
      console.error(`--profile must be one of: ${Object.keys(core.AGENT_PROFILES).join(', ')}`)
      process.exit(1)
    }
    const issued = core.issueAgentToken(root, { brandId: engine.config().brand.slug, profile: values.profile, label: values.label ?? '' })
    if (values.json) {
      console.log(JSON.stringify({ ...issued.record, token: issued.token }, null, 2))
    } else {
      console.log(`Issued ${issued.record.id} (${issued.record.profile}) for ${issued.record.brand_id}.`)
      console.log('Token (shown once, store it in your agent host as BRAND_OS_AGENT_TOKEN; only its hash is kept):')
      console.log(issued.token)
    }
  } else if (action === 'list') {
    const tokens = core.listAgentTokens(root)
    if (values.json) console.log(JSON.stringify(tokens, null, 2))
    else if (tokens.length === 0) console.log('No agent tokens issued.')
    else for (const item of tokens) console.log(`${item.id}  ${item.profile.padEnd(13)} ${item.revoked ? 'revoked ' : 'active  '} ${item.created_at}  ${item.label}`)
  } else {
    if (!values.id) {
      console.error('Need --id <agt_…>.')
      process.exit(1)
    }
    const revoked = core.revokeAgentToken(root, values.id)
    if (!revoked) {
      console.error(`No token ${values.id}.`)
      process.exit(1)
    }
    console.log(`Revoked ${revoked.id}. Restart any MCP server that was started with it.`)
  }
} else if (command === 'doctor') {
  const { values } = parseArgs({
    args: rest,
    options: { json: { type: 'boolean', default: false }, 'create-approval-secret': { type: 'boolean', default: false } },
  })
  const { ensureApprovalSecret, formatDoctor, runDoctor } = await import('@brand-os/brand-core')
  if (values['create-approval-secret']) {
    // Creates the file only when absent. The value is never printed; read it locally when you approve.
    ensureApprovalSecret(root)
    if (!values.json) console.log('Approval secret is at brand/.private/approval-secret (mode 0600). Its value is not printed.')
  }
  const report = runDoctor(root)
  console.log(values.json ? JSON.stringify(report, null, 2) : formatDoctor(report))
  if (!report.ok) process.exit(1)
} else if (command === 'document') {
  const { values } = parseArgs({
    args: rest,
    options: {
      type: { type: 'string', default: 'brand-book' },
      audience: { type: 'string', default: 'internal' },
      json: { type: 'boolean', default: false },
    },
  })
  const { buildNamedDocument, DOCUMENT_KINDS, renderDocumentMarkdown } = await import('@brand-os/brand-core')
  const kind = DOCUMENT_KINDS.find((item) => item === values.type)
  if (!kind || (values.audience !== 'internal' && values.audience !== 'public')) {
    console.error(`Usage: brand:document --type ${DOCUMENT_KINDS.join('|')} [--audience internal|public] [--json]`)
    process.exit(2)
  }
  if (values.audience === 'internal' && process.env.BRAND_OS_AGENT_TOKEN) {
    // The internal edition includes drafts. Agents read approved knowledge through brand_retrieve instead.
    console.error('The internal edition includes drafts and is for the owner. With an agent token, use --audience public or brand:query.')
    process.exit(2)
  }
  const model = buildNamedDocument(engine, kind, values.audience)
  console.log(values.json ? JSON.stringify(model, null, 2) : renderDocumentMarkdown(model))
} else if (command === 'tokens:generate') {
  const { values } = parseArgs({ args: rest, options: { json: { type: 'boolean', default: false }, 'dry-run': { type: 'boolean', default: false } } })
  const { generateTokens } = await import('@brand-os/brand-core')
  const report = generateTokens(root, engine.config().brand.slug, { dryRun: values['dry-run'] })
  if (values.json) console.log(JSON.stringify(report, null, 2))
  else {
    for (const source of report.sources) console.log(`${source.state.padEnd(12)} ${source.question_id}`)
    for (const token of report.tokens) console.log(`${token.outcome.padEnd(16)} ${token.id}  ${token.reason}`)
    console.log(report.files.length ? `Wrote ${report.files.join(', ')}` : report.dry_run ? 'Dry run. Nothing was written.' : 'No token files changed.')
    console.log(report.note)
  }
  if (!report.ok) process.exit(1)
} else if (command === 'tokens:approve' || command === 'tokens:publish') {
  const { values } = parseArgs({
    args: rest,
    options: {
      ids: { type: 'string' },
      actor: { type: 'string', default: 'owner' },
      unpublish: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      // Declared only so it can be refused without echoing its value.
      proof: { type: 'string' },
    },
  })
  if (values.proof !== undefined) {
    console.error('--proof is not accepted: a secret on the command line leaks into shell history and the process list. Nothing was changed.')
    process.exit(2)
  }
  if (process.env.BRAND_OS_AGENT_TOKEN) {
    console.error(`brand:${command} refuses to run while BRAND_OS_AGENT_TOKEN is set. Token approval and publication are human actions.`)
    process.exit(2)
  }
  const ids = (values.ids ?? '').split(',').map((id) => id.trim()).filter(Boolean)
  if (ids.length === 0) {
    console.error(`Usage: brand:${command} --ids <token.id,…>${command === 'tokens:publish' ? ' [--unpublish]' : ' [--actor owner]'} [--json]`)
    console.error('The approval proof is read from BRAND_OS_APPROVAL_PROOF, piped stdin, or a hidden prompt. Never from argv.')
    process.exit(2)
  }
  const { approveTokens, publishTokens } = await import('@brand-os/brand-core')
  const proof = await readApprovalProof()
  const result = command === 'tokens:approve' ? approveTokens(root, ids, proof, values.actor ?? 'owner') : publishTokens(root, ids, proof, { unpublish: values.unpublish })
  if (values.json) console.log(JSON.stringify(result, null, 2))
  else {
    if (result.proof === 'rejected') console.log('Proof rejected. Nothing was changed.')
    for (const error of result.errors) console.error(error)
    for (const item of result.results) console.log(`${item.outcome.padEnd(11)} ${item.id}  ${item.reason}`)
  }
  if (!result.ok) process.exit(1)
} else if (command === 'finance') {
  const { values } = parseArgs({ args: rest, options: { input: { type: 'string' }, json: { type: 'boolean', default: false } } })
  if (!values.input) {
    console.error('Usage: brand:finance --input <file outside the repository | restricted:<name>> [--json]')
    console.error('Inputs inside the checkout must be gitignored and untracked, for example brand/restricted/finance/<name>.yaml.')
    process.exit(2)
  }
  const { FinanceInputError, FinanceInputPathError, formatFinanceReport, runFinanceFile } = await import('@brand-os/brand-core')
  try {
    // Results are printed locally only. Nothing is written to the repository or sent to a model provider.
    const report = runFinanceFile(root, values.input)
    console.log(values.json ? JSON.stringify(report, null, 2) : formatFinanceReport(report))
  } catch (error) {
    if (error instanceof FinanceInputError) {
      console.error('Finance input is invalid:')
      for (const message of error.errors) console.error(`  - ${message}`)
    } else if (error instanceof FinanceInputPathError) console.error(error.message)
    else throw error
    process.exit(1)
  }
} else if (command === 'backup') {
  const saved = backupBrand(root)
  console.log(`Backed up ${saved.files.length} files to ${path.relative(root, saved.directory)}`)
} else if (command === 'restore') {
  const { values } = parseArgs({ args: rest, options: { from: { type: 'string' } } })
  if (!values.from) {
    console.error('Need --from <backup-directory>.')
    process.exit(1)
  }
  const restored = restoreBrand(root, path.resolve(values.from))
  console.log(`Restored ${restored.restored.length} files.`)
} else if (command === 'migrate') {
  const migrated = migrateBrand(root)
  console.log(`Migrated ${migrated.from} -> ${migrated.to}. Fact values and module prose were not rewritten.`)
  if (migrated.mascot.changed.length > 0) console.log(`Mascot lifecycle: ${migrated.mascot.changed.length} catalog states moved to the lifecycle enum (${migrated.mascot.files.join(', ')}).`)
  if (migrated.mascot.downgraded.length > 0) console.log(`These states claimed approved without artwork and are now defined: ${migrated.mascot.downgraded.join(', ')}`)
} else if (command === 'reset') {
  const { values } = parseArgs({ args: rest, options: { confirm: { type: 'string' } } })
  if (values.confirm !== RESET_CONFIRMATION) {
    console.error(`Refusing reset. Pass --confirm "${RESET_CONFIRMATION}"`)
    process.exit(1)
  }
  const result = resetInterviewState(root, values.confirm)
  console.log(`Interview state cleared. Backup: ${path.relative(root, result.backup)}`)
} else {
  console.log(`Commands: init, interview, resume, next, propose, status, review, validate, export, approve, publish, document, tokens:generate, tokens:approve, tokens:publish, query, agent-token, doctor, finance, backup, restore, migrate, reset`)
  process.exit(command ? 1 : 0)
}

function selectionFrom(values: { module?: string; ids?: string }): Selection {
  const ids = values.ids ? values.ids.split(',').map((id) => id.trim()).filter(Boolean) : undefined
  return { ...(values.module ? { module: values.module } : {}), ...(ids?.length ? { ids } : {}) }
}

function withSelectionErrors<T>(run: () => T): T {
  try {
    return run()
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Request failed.')
    process.exit(2)
  }
}

function show(value: unknown, withheld: boolean): string {
  if (withheld) return '[restricted withheld]'
  if (value === null || value === undefined) return 'none'
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function formatQueue(queue: ReviewQueue): string {
  const lines = [`# Review queue (${queue.brand_id})`, '', `${queue.pending} item(s) need a decision. Approval does not publish.`, '']
  for (const item of queue.items) {
    lines.push(`## ${item.question_id} [${item.state}] ${item.classification}, needs ${item.required_grant}`)
    lines.push(`- ${item.reason}`)
    if (item.approved) lines.push(`- Approved v${item.approved.version} (${item.approved.publication}): ${show(item.approved.value, item.withheld)}`)
    if (item.draft) {
      const state = item.draft.proposal_state ? `, ${item.draft.proposal_state} proposal` : ''
      lines.push(`- Draft ${item.draft.answer_id} (${item.draft.status}, ${item.draft.authority}${state}): ${show(item.draft.value, item.withheld)}`)
      if (item.draft.proposal_state === 'tentative') lines.push('- Tentative: the owner described this as possible, not decided. Approve only if it is now a decision.')
    }
    for (const change of item.changes) {
      lines.push(`- Change ${change.id} against v${change.expected_version}${change.stale ? ' (stale)' : ''}: ${show(change.proposed_value, item.withheld)}`)
    }
    if (item.impact.documents.length) lines.push(`- Documents: ${item.impact.documents.join(', ')}`)
    if (item.impact.questions.length) lines.push(`- Linked questions: ${item.impact.questions.join(', ')}`)
    if (item.impact.published) lines.push('- Currently published. An approved replacement is unpublished until you run brand:publish again.')
    lines.push('')
  }
  return lines.join('\n')
}

function formatIntake(report: IntakeReport): string {
  const lines = [`${report.dry_run ? 'Dry run' : `Intake ${report.batch_id}`} (${report.origin}${report.provider ? `, ${report.provider}` : ''})`]
  for (const item of report.results) {
    lines.push(`${item.outcome.padEnd(15)} ${item.question_id ?? `#${item.index}`}${item.state ? ` [${item.state}]` : ''}  ${item.reason}`)
  }
  for (const conflict of report.conflicts) lines.push(`Ask: ${conflict.ask}`)
  for (const item of report.follow_ups) lines.push(`Follow-up${item.question_id ? ` (${item.question_id})` : ''}: ${item.text}`)
  for (const item of report.owner_questions) lines.push(`Owner asked: ${item.text}`)
  if (report.redactions > 0) lines.push(`${report.redactions} passage(s) were withheld from the model as possible restricted data.`)
  lines.push(report.notice)
  return lines.join('\n')
}

function formatNext(report: NextReport): string {
  const lines = [`# Next (${report.brand_id}, profile ${report.profile.id}: ${report.profile.answered}/${report.profile.total} answered)`, '']
  for (const conflict of report.conflicts) lines.push(`Conflict on ${conflict.question_id}: ${conflict.ask}`)
  for (const item of report.follow_ups) lines.push(`Follow-up${item.question_id ? ` (${item.question_id})` : ''}: ${item.text}`)
  for (const item of report.next) {
    lines.push(`- [${item.priority}] ${item.id}: ${item.prompt}`)
    lines.push(`  why now: ${item.reasons.join('; ')}`)
  }
  if (report.tentative.length) lines.push('', `Tentative: ${report.tentative.map((item) => item.question_id).join(', ')}`)
  if (report.unresolved.length) lines.push(`Unresolved: ${report.unresolved.map((item) => item.question_id).join(', ')}`)
  if (report.owner_only.length) lines.push(`Owner-only (restricted): ${report.owner_only.map((item) => item.question_id).join(', ')}`)
  lines.push('', ...report.suggested_actions.map((action) => `→ ${action}`))
  return lines.join('\n')
}

async function readAllStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of input) chunks.push(Buffer.from(chunk as Buffer))
  return Buffer.concat(chunks).toString('utf8')
}

function formatBatch(result: BatchResult): string {
  const lines = result.results.map((item) => `${item.outcome.padEnd(9)} ${item.id}${item.version ? ` v${item.version}` : ''}  ${item.reason}`)
  lines.push(result.proof === 'rejected' ? 'Proof rejected. Nothing was changed.' : `${result.approved} approved. Nothing was published.`)
  return lines.join('\n')
}

async function interactive(): Promise<void> {
  const rl = readline.createInterface({ input, output })
  console.log('Brand OS interview. Type help for commands. exit pauses the session.')
  try {
    while (true) {
      const question = engine.current()
      if (!question) {
        console.log(engine.statusText())
        break
      }
      const locale = engine.session().locale
      const prompt = engine.promptText(question, locale)
      console.log(`\n${question.id} [${question.priority}]`)
      if (prompt.fellBack) console.log(`No ${locale} prompt stored. Showing English.`)
      console.log(prompt.text)
      console.log(`Why: ${question.why_it_matters}`)
      if (question.options) console.log(`Options: ${question.options.join(', ')}`)
      const raw = await rl.question('> ')
      const result = engine.submit(raw)
      console.log(result.message)
      if (result.kind === 'exit') break
    }
  } finally {
    rl.close()
  }
}

/** Owner proof from the environment, a hidden TTY prompt, or the first line of piped stdin. Never argv. */
async function readApprovalProof(): Promise<string | undefined> {
  const fromEnv = process.env.BRAND_OS_APPROVAL_PROOF
  if (fromEnv) return fromEnv.trim()
  if (!input.isTTY) {
    const chunks: Buffer[] = []
    for await (const chunk of input) chunks.push(Buffer.from(chunk as Buffer))
    return Buffer.concat(chunks).toString('utf8').split(/\r?\n/)[0]?.trim() || undefined
  }
  const { Writable } = await import('node:stream')
  let muted = false
  const sink = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) output.write(chunk, encoding)
      callback()
    },
  })
  const rl = readline.createInterface({ input, output: sink, terminal: true })
  try {
    const pending = rl.question('Approval proof (input hidden): ')
    muted = true
    const answer = await pending
    output.write('\n')
    return answer.trim() || undefined
  } finally {
    rl.close()
  }
}
