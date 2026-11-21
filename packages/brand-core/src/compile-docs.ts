import { moduleEnabled } from './conditions.js'
import { allModules } from './content/index.js'
import type { InterviewEngine } from './engine.js'
import { readFacts } from './facts.js'
import { factIsPublic } from './publication.js'

export interface CompiledPage {
  dest: string
  url: string
  visibility: 'public' | 'internal'
  text: string
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function compileModulePages(engine: InterviewEngine, audience: 'public' | 'internal'): CompiledPage[] {
  const brandId = engine.config().brand.slug
  const facts = readFacts(engine.workspaceRoot(), 'approved', brandId)
  return allModules()
    .filter((module) => moduleEnabled(module, engine.config()))
    .map((module) => {
      const lines = [
        '---',
        `title: "${module.title}"`,
        `visibility: ${audience}`,
        '---',
        '',
        `# ${module.title}`,
        '',
        'Compiled from canonical approved facts. Missing sections stay missing. Guidance pages are separate.',
        '',
      ]
      let cited = 0
      for (const field of module.fields) {
        const fact = facts[field.id]
        const visible =
          fact &&
          fact.status === 'approved' &&
          fact.classification !== 'restricted' &&
          (audience === 'internal' || factIsPublic(engine.workspaceRoot(), field.id, fact, brandId))
        lines.push(`## ${field.label}`, '')
        if (!visible || fact.value === null || fact.value === undefined) {
          lines.push('Missing — not invented.', '')
          continue
        }
        cited += 1
        lines.push(escapeText(String(fact.value)), '')
        lines.push(`- Source id: \`${fact.id}\``, `- Version: ${fact.version}`, `- Revision: \`${fact.revision_hash ?? ''}\``, `- Status: ${fact.status}`, '')
      }
      lines.push('## Coverage', '', `${cited} cited fields. ${module.fields.length - cited} missing.`, '')
      const group = module.group === 'business' ? 'business-book' : module.group === 'personal' ? 'personal-book' : 'brand-book'
      return {
        dest: `${group}/${module.id}.md`,
        url: `/docs/${group}/${module.id}`,
        visibility: audience,
        text: `${lines.join('\n')}\n`,
      }
    })
}
