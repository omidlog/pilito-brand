import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { parse } from 'yaml'
import { allModules, factIsPublic, moduleEnabled, buildBrandBook, buildDashboard, compileModulePages, InterviewEngine, readFacts, assetIsPublic, pageIsPublic, readPublicationPolicy } from '@brand-os/brand-core'
import { compileTokens, tokenDigest } from '@brand-os/design-tokens'
import type { BrandConfig, PersonalFacet } from '@brand-os/brand-core'
import { assetPathIsSafe, inspectAssetForPublication } from '@brand-os/asset-catalog'

export interface PrepareOptions {
  audience?: 'public' | 'internal'
  mascot?: boolean
  gamification?: boolean
  rootIndex?: boolean
}

interface DocFile {
  source: string
  dest: string
  url: string
  text: string
  optional?: string
  facet?: string
  visibility: string
}

interface PrepareContext {
  root: string
  audience: 'public' | 'internal'
  mascot: boolean
  gamification: boolean
  writeRootIndex: boolean
  engine: InterviewEngine
  config: BrandConfig
}

export function prepareDocs(root: string, options: PrepareOptions = {}): { copied: number; excluded: string[] } {
  const engine = new InterviewEngine(root)
  const config = engine.config()
  const requested = options.audience ?? (config.brand.publish_docs === 'public' ? 'public' : 'internal')
  if (requested === 'public' && config.brand.publish_docs !== 'public') {
    throw new Error('Refusing a public docs build because brand.publish_docs is private. There is no environment override.')
  }
  const ctx: PrepareContext = {
    root,
    audience: requested,
    mascot: options.mascot ?? config.modules.mascot.enabled,
    gamification: options.gamification ?? config.modules.gamification.enabled,
    writeRootIndex: options.rootIndex ?? true,
    engine,
    config,
  }
  for (const relative of ['apps/docs/docs', 'apps/docs/build', 'apps/docs/static/brand-assets']) {
    fs.rmSync(path.join(root, relative), { recursive: true, force: true })
  }
  for (const relative of [
    'apps/docs/src/data/status.json',
    'apps/docs/src/data/catalog.json',
    'apps/docs/src/data/assets.json',
    'apps/docs/src/data/brand-book.json',
    'apps/docs/src/data/dashboard.json',
    'apps/docs/static/llms.txt',
    'apps/docs/static/llms-full.txt',
    'llms.txt',
    'llms-full.txt',
  ]) {
    fs.rmSync(path.join(root, relative), { force: true })
  }
  const docsRoot = path.join(root, 'apps', 'docs', 'docs')
  fs.mkdirSync(docsRoot, { recursive: true })
  const docs: DocFile[] = []
  for (const page of compileModulePages(engine, requested)) {
    docs.push({ source: 'canonical', dest: page.dest, url: page.url, text: page.text, visibility: page.visibility })
  }
  if (requested === 'public') {
    docs.push({
      source: 'canonical', dest: 'start/introduction.md', url: '/docs/start/introduction', visibility: 'public',
      text: '---\ntitle: Brand OS\nvisibility: public\n---\n\n# Brand OS\n\nPublished brand facts are listed in the approved module pages. Any unapproved field remains missing.\n',
    })
  }
  collect(ctx, path.join(root, 'brand', 'content'), docs)
  collect(ctx, path.join(root, 'brand', 'business-os'), docs)
  collect(ctx, path.join(root, 'brand', 'personal'), docs)
  collect(ctx, path.join(root, 'brand', 'templates'), docs)
  const excluded = new Set<string>()
  for (const doc of docs) {
    if (doc.optional === 'mascot' && !ctx.mascot) excluded.add(doc.url)
    if (doc.optional === 'gamification' && !ctx.gamification) excluded.add(doc.url)
    // Personal pages follow modules.personal, and a facet page also needs its facet.
    if (doc.optional === 'personal' && !moduleEnabled({ optional: 'personal', facet: doc.facet as PersonalFacet | undefined }, ctx.config)) excluded.add(doc.url)
    if (doc.visibility === 'restricted') excluded.add(doc.url)
    if (ctx.audience === 'public' && doc.visibility === 'internal') excluded.add(doc.url)
    if (ctx.audience === 'public' && doc.source !== 'canonical' && !pageIsPublic(ctx.root, doc.source) && !pageIsPublic(ctx.root, doc.dest)) excluded.add(doc.url)
  }
  for (const doc of docs) {
    if (excluded.has(doc.url)) continue
    const rewritten = doc.text.replace(/\[([^\]]+)\]\((\/docs\/[^)\s]+)\)/g, (full, label: string, url: string) => {
      const bare = url.split('#')[0] ?? url
      return excluded.has(bare) ? `${label} (module disabled for this build)` : full
    })
    const target = path.join(docsRoot, doc.dest)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, rewritten)
  }
  const included = docs.filter((doc) => !excluded.has(doc.url))
  writeSidebars(ctx, included)
  if (ctx.audience === 'public') writePublicTokens(ctx)
  writeData(ctx)
  writePublished(ctx)
  writeIndexes(ctx, included)
  copyAssets(ctx)
  if (ctx.audience === 'public') {
    const release = ctx.engine.exportPublic()
    fs.mkdirSync(path.join(ctx.root, 'apps', 'docs', 'static'), { recursive: true })
    fs.writeFileSync(path.join(ctx.root, 'apps', 'docs', 'static', 'release-manifest.json'), `${JSON.stringify(release, null, 2)}\n`)
  }
  return { copied: included.length, excluded: [...excluded] }
}

function collect(ctx: PrepareContext, dir: string, into: DocFile[]): void {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collect(ctx, full, into)
    else if (entry.name.endsWith('.md')) {
      const relative = path.relative(ctx.root, full).split(path.sep).join('/')
      const dest = destination(relative)
      if (!dest) continue
      // Public introduction is generated from safe canonical text above, never copied from a draft source.
      if (ctx.audience === 'public' && relative === 'brand/content/00-start/introduction.md') continue
      const text = fs.readFileSync(full, 'utf8')
      const meta = frontmatter(text)
      into.push({
        source: relative,
        dest,
        url: `/docs/${dest.replace(/\.md$/, '')}`,
        text,
        optional: meta.optional_module,
        facet: meta.personal_facet,
        visibility: meta.visibility ?? 'internal',
      })
    }
  }
}

function destination(relative: string): string | null {
  if (relative === 'brand/content/00-start/introduction.md') return 'start/introduction.md'
  if (relative.startsWith('brand/content/use-cases/')) return relative.slice('brand/content/'.length)
  if (relative.startsWith('brand/content/gamification/')) return relative.slice('brand/content/'.length)
  if (relative.startsWith('brand/content/')) return `brand/${relative.slice('brand/content/'.length)}`
  if (relative.startsWith('brand/business-os/')) return `business/${relative.slice('brand/business-os/'.length)}`
  if (relative.startsWith('brand/templates/')) return `templates/${relative.slice('brand/templates/'.length)}`
  if (relative.startsWith('brand/personal/')) return `personal/${relative.slice('brand/personal/'.length)}`
  return null
}

function frontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  const data: Record<string, string> = {}
  if (!match?.[1]) return data
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':')
    if (index === -1) continue
    data[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^"|"$/g, '')
  }
  return data
}

function writeSidebars(ctx: PrepareContext, included: DocFile[]): void {
  const items = (prefix: string) =>
    included
      .filter((doc) => doc.dest.startsWith(prefix) && (doc.dest.endsWith('/overview.md') || doc.dest.endsWith('.md')))
      .map((doc) => doc.dest.replace(/\.md$/, ''))
      .sort()
  const useCases = included.filter((doc) => doc.dest.startsWith('use-cases/')).map((doc) => doc.dest.replace(/\.md$/, '')).sort()
  const templates = included.filter((doc) => doc.dest.startsWith('templates/')).map((doc) => doc.dest.replace(/\.md$/, '')).sort()
  const categories = [
    'start/introduction',
    category('Brand Identity', items('brand/')),
    category('Business OS', items('business/')),
    category('Approved Brand Book', items('brand-book/')),
    category('Approved Business Book', items('business-book/')),
    category('Personal Brand', items('personal/')),
    category('Approved Personal Book', items('personal-book/')),
    ctx.gamification ? category('Gamification', items('gamification/')) : null,
    category('Use cases', useCases),
    category('Templates', templates),
  ].filter((item) => item && !(typeof item === 'object' && 'items' in item && item.items.length === 0))
  fs.writeFileSync(
    path.join(ctx.root, 'apps', 'docs', 'sidebars.js'),
    `const sidebars = {\n  main: ${JSON.stringify(categories, null, 2)}\n}\nexport default sidebars\n`,
  )
}

function category(label: string, items: string[]) {
  return { type: 'category', label, items }
}

/** Rebuild public token artifacts from an explicit publication allowlist.
 * Merely running tokens:build does not make draft palette values public. */
function writePublicTokens(ctx: PrepareContext): void {
  const compiled = compileTokens(ctx.root)
  if (compiled.errors.length) throw new Error(`Invalid tokens: ${compiled.errors.join('; ')}`)
  const approvalsPath = path.join(ctx.root, 'brand', 'tokens', 'approvals.yaml')
  const approvalsDoc = fs.existsSync(approvalsPath)
    ? (parse(fs.readFileSync(approvalsPath, 'utf8')) as { approved?: Record<string, { value_sha256?: string }> })
    : { approved: {} }
  const approvals = approvalsDoc?.approved ?? {}
  const allowed = new Set(readPublicationPolicy(ctx.root).approved_token_ids)
  const colors = Object.entries(compiled.flat).filter(([id, token]) => {
    if (!allowed.has(id) || token.type !== 'color' || !token.hex) return false
    const hash = approvals[id]?.value_sha256
    return typeof hash === 'string' && hash === tokenDigest(token)
  }).map(([id, token]) => ({ id, hex: token.hex!, description: token.description ?? '', theme: token.theme ?? 'both' }))
  const ids = new Set(colors.map((color) => color.id))
  const contrast = compiled.contrast.filter((pair) => ids.has(pair.fg) && ids.has(pair.bg))
  const css = `:root {\n${colors.map((color) => `  --${color.id.replace(/\./g, '-')}: ${color.hex};`).join('\n')}\n}\n`
  const cssFile = path.join(ctx.root, 'apps', 'docs', 'src', 'css', 'tokens.css')
  const jsonFile = path.join(ctx.root, 'apps', 'docs', 'src', 'data', 'tokens.json')
  fs.mkdirSync(path.dirname(cssFile), { recursive: true })
  fs.mkdirSync(path.dirname(jsonFile), { recursive: true })
  fs.writeFileSync(cssFile, css)
  fs.writeFileSync(jsonFile, `${JSON.stringify({
    status: colors.length ? 'published' : 'unpublished',
    label: colors.length ? 'Approved and published design tokens' : 'No published tokens yet',
    colors,
    contrast,
  }, null, 2)}\n`)
}

function manifestAssetsForPreview(root: string, assetPath: string): Array<Record<string, unknown>> {
  const file = path.join(root, 'brand', 'assets', 'asset-manifest.yaml')
  const manifest = parse(fs.readFileSync(file, 'utf8')) as { assets?: Array<Record<string, unknown>> }
  return (manifest.assets ?? []).filter((asset) => asset.path === assetPath)
}

function writeData(ctx: PrepareContext): void {
  const report = ctx.engine.statusReport()
  const brand = ctx.config.brand
  const projection = ctx.audience === 'public' ? ctx.engine.exportPublic() : null
  const status = {
    audience: ctx.audience,
    brandName: projection ? projection.display_name ?? 'Unpublished' : brand.working_name || brand.name,
    nameStatus: projection ? (projection.display_name ? 'published' : 'unpublished') : brand.working_name ? brand.working_name_status ?? 'draft' : brand.name_status,
    placeholderName: projection ? null : brand.name,
    coverage: projection ? 0 : report.coverage,
    approval: projection ? 0 : report.approval,
    required: projection ? 0 : report.required,
    requiredUnanswered: projection ? 0 : report.requiredUnanswered,
    contradictions: projection ? 0 : report.contradictions,
    modules: allModules()
      .filter((module) => (module.optional === 'mascot' ? ctx.mascot : true))
      .filter((module) => (module.optional === 'gamification' ? ctx.gamification : true))
      .filter((module) => (module.optional === 'personal' ? moduleEnabled(module, ctx.config) : true))
      .map((module) => {
        const score = report.modules.find((item) => item.module === module.id)
        return {
          id: module.id,
          title: module.title,
          code: module.code,
          group: module.group,
          href: projection ? `/docs/${module.group === 'business' ? 'business-book' : module.group === 'personal' ? 'personal-book' : 'brand-book'}/${module.id}` : `/docs/${module.docPath}`,
          coverage: projection ? 0 : score?.coverage ?? 0,
          approval: projection ? 0 : score?.approval ?? 0,
          requiredUnanswered: projection ? 0 : score?.requiredUnanswered ?? 0,
        }
      }),
    next: projection ? [] : report.next.map((item) => ({ id: item.id, priority: item.priority, prompt: item.prompt })),
    release: projection?.release ?? null,
  }
  const catalogDoc = parse(fs.readFileSync(path.join(ctx.root, 'brand', 'mascot', 'catalog.yaml'), 'utf8')) as {
    states: Array<Record<string, unknown>>
  }
  const catalog = (ctx.mascot ? catalogDoc.states : [])
    .filter((state) => ctx.audience !== 'public' || ((state.status === 'approved' || state.status === 'published') && pageIsPublic(ctx.root, String(state.id))))
    .map((state) => {
      const sources = Array.isArray(state.source_assets) ? state.source_assets.filter((item): item is string => typeof item === 'string') : []
      const preview = sources.find((assetPath) => {
        const related = manifestAssetsForPreview(ctx.root, assetPath)
        return ctx.audience !== 'public'
          ? inspectAssetForPublication(ctx.root, assetPath).ok
          : related.some((asset) => assetIsPublic(ctx.root, asset) && typeof asset.checksum_sha256 === 'string' && inspectAssetForPublication(ctx.root, assetPath, asset.checksum_sha256).ok)
      }) ?? null
      return {
        id: state.id,
        name: state.name,
        category: state.category,
        intent: state.intent,
        emotion_intensity: state.emotion_intensity,
        status: state.status,
        mvp: state.mvp,
        tags: state.tags,
        preview: preview ? `/brand-assets/${preview.replace(/^brand\/assets\//, '')}` : null,
        source_assets: preview ? [preview] : [],
      }
    })
  const manifest = parse(fs.readFileSync(path.join(ctx.root, 'brand', 'assets', 'asset-manifest.yaml'), 'utf8')) as {
    assets: Array<Record<string, unknown>>
  }
  const assets = manifest.assets.filter((asset) => {
    const visibility = String(asset.visibility ?? 'internal')
    if (visibility === 'restricted') return false
    if (visibility === 'internal' && ctx.audience === 'public') return false
    if (ctx.audience === 'public' && !assetIsPublic(ctx.root, asset)) return false
    if (ctx.audience === 'public' && (typeof asset.checksum_sha256 !== 'string' || !inspectAssetForPublication(ctx.root, String(asset.path), asset.checksum_sha256).ok)) return false
    return true
  }).map((asset) => ({
    ...(ctx.audience === 'public' ? { id: asset.id, name: asset.name, path: asset.path, checksum_sha256: asset.checksum_sha256, status: asset.status, visibility: asset.visibility } : asset),
    downloadable: asset.present === true && assetIsPublic(ctx.root, asset) && assetPathIsSafe(ctx.root, String(asset.path)),
  }))
  const dataDir = path.join(ctx.root, 'apps', 'docs', 'src', 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'status.json'), `${JSON.stringify(status, null, 2)}\n`)
  fs.writeFileSync(path.join(dataDir, 'catalog.json'), `${JSON.stringify({ states: catalog, enabled: ctx.mascot }, null, 2)}\n`)
  fs.writeFileSync(path.join(dataDir, 'assets.json'), `${JSON.stringify({ assets }, null, 2)}\n`)
  // Audience projection: a public build only ever receives approved+published items and missing placeholders.
  fs.writeFileSync(path.join(dataDir, 'brand-book.json'), `${JSON.stringify(buildBrandBook(ctx.engine, ctx.audience), null, 2)}\n`)
  // The review dashboard is internal-only. ctx.audience can only be 'internal' after the
  // publish_docs check in prepareDocs; a public build writes a stub with no brand data.
  fs.writeFileSync(path.join(dataDir, 'dashboard.json'), `${JSON.stringify(buildDashboard(ctx.engine, ctx.audience), null, 2)}\n`)
  fs.mkdirSync(path.join(ctx.root, 'apps', 'docs', 'generated'), { recursive: true })
  fs.writeFileSync(
    path.join(ctx.root, 'apps', 'docs', 'generated', 'features.json'),
    `${JSON.stringify({ mascot: ctx.mascot, gamification: ctx.gamification, audience: ctx.audience, brandName: status.brandName, nameStatus: status.nameStatus }, null, 2)}\n`,
  )
}

function writeIndexes(ctx: PrepareContext, included: DocFile[]): void {
  const site = process.env.BRAND_OS_SITE_URL || 'http://localhost:3000'
  const lines = ['# Brand OS', '', '> EXAMPLE template documentation. Not an approved brand. Not an authorization to private data.', '']
  const full: string[] = [...lines]
  for (const doc of included) {
    const title = frontmatter(doc.text).title ?? doc.dest
    lines.push(`- [${title}](${site}${doc.url})`)
    full.push(`## ${title}`, '', doc.text, '')
  }
  const staticDir = path.join(ctx.root, 'apps', 'docs', 'static')
  fs.mkdirSync(staticDir, { recursive: true })
  fs.writeFileSync(path.join(staticDir, 'llms.txt'), `${lines.join('\n')}\n`)
  fs.writeFileSync(path.join(staticDir, 'llms-full.txt'), `${full.join('\n')}\n`)
  if (ctx.writeRootIndex && ctx.audience === 'public' && ctx.mascot && ctx.gamification) {
    fs.writeFileSync(path.join(ctx.root, 'llms.txt'), `${lines.join('\n')}\n`)
    fs.writeFileSync(path.join(ctx.root, 'llms-full.txt'), `${full.join('\n')}\n`)
  }
}

function escapePublished(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function writePublished(ctx: PrepareContext): void {
  const facts = readFacts(ctx.root, 'approved', ctx.config.brand.slug) as unknown as Record<string, Record<string, unknown>>
  const lines = ['---', 'title: "Published claims"', 'visibility: public', 'sidebar_position: 0', '---', '', '# Published claims', '', 'Only approved facts for this audience are listed. Restricted values are never published. Unapproved interview answers stay in the ledger.', '']
  const policyFile = path.join(ctx.root, 'brand', 'publication-policy.yaml')
  const allowed = new Set<string>()
  if (fs.existsSync(policyFile)) {
    const policy = parse(fs.readFileSync(policyFile, 'utf8')) as { approved_fact_ids?: string[] }
    for (const id of policy.approved_fact_ids ?? []) allowed.add(id)
  }
  const visible = Object.entries(facts).filter(([id, fact]) => {
    const classification = String(fact.classification ?? fact.visibility ?? 'internal')
    if (fact.status !== 'approved' || classification === 'restricted') return false
    if (ctx.audience === 'public' && !allowed.has(id)) return false
    if (ctx.audience === 'public' && (classification !== 'public' || fact.publication !== 'published')) return false
    // Same gate as every other public reader: evidence, rights and privacy for personal claims.
    if (ctx.audience === 'public' && !factIsPublic(ctx.root, id, facts[id] as never, ctx.config.brand.slug)) return false
    return true
  })
  if (visible.length === 0) lines.push('No approved claims for this audience yet.')
  for (const [id, fact] of visible) {
    lines.push(`## ${id}`, '', escapePublished(String(fact.value ?? 'TBD')), '', `- Status: approved`, `- Source id: \`${String(fact.answer_id ?? id)}\``, '')
  }
  const target = path.join(ctx.root, 'apps', 'docs', 'docs', 'published', 'claims.md')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${lines.join('\n')}\n`)
  const sidebarFile = path.join(ctx.root, 'apps', 'docs', 'sidebars.js')
  if (fs.existsSync(sidebarFile)) {
    const text = fs.readFileSync(sidebarFile, 'utf8')
    if (!text.includes('published/claims')) {
      fs.writeFileSync(sidebarFile, text.replace('main: [', 'main: [\n    "published/claims",'))
    }
  }
}

function copyAssets(ctx: PrepareContext): void {
  const manifest = parse(fs.readFileSync(path.join(ctx.root, 'brand', 'assets', 'asset-manifest.yaml'), 'utf8')) as {
    assets: Array<{ path: string; present: boolean; visibility: string; status?: string }>
  }
  const targetRoot = path.join(ctx.root, 'apps', 'docs', 'static', 'brand-assets')
  fs.rmSync(targetRoot, { recursive: true, force: true })
  for (const asset of manifest.assets) {
    const checksum = (asset as { checksum_sha256?: unknown }).checksum_sha256
    if (!asset.present || !assetIsPublic(ctx.root, asset) || typeof checksum !== 'string') continue
    const inspected = inspectAssetForPublication(ctx.root, asset.path, checksum)
    if (!inspected.ok) continue
    const relative = asset.path.replace(/^brand\/assets\//, '')
    const target = path.join(targetRoot, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(inspected.realPath, target)
  }
}

const isEntry = process.argv[1]?.includes('prepare-docs')
if (isEntry) {
  const { values } = parseArgs({
    options: {
      audience: { type: 'string', default: process.env.DOCS_AUDIENCE === 'internal' ? 'internal' : 'public' },
      mascot: { type: 'string' },
      gamification: { type: 'string' },
      'root-index': { type: 'boolean', default: true },
    },
  })
  const result = prepareDocs(process.cwd(), {
    audience: values.audience === 'internal' ? 'internal' : 'public',
    mascot: values.mascot === undefined ? undefined : values.mascot === 'true',
    gamification: values.gamification === undefined ? undefined : values.gamification === 'true',
    rootIndex: values.mascot === 'false' || values.gamification === 'false' ? false : values['root-index'],
  })
  console.log(`Prepared docs. Copied ${result.copied}. Excluded ${result.excluded.length}.`)
}
