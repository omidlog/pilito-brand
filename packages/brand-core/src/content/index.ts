import { brandModules } from './brand-modules.js'
import { businessModules } from './business-modules.js'
import { personalCoreModules } from './personal-core.js'
import { personalFacetModules } from './personal-facets.js'
import type { FieldQuestion, ModuleDef } from '../types.js'

export function allModules(): ModuleDef[] {
  return [...brandModules, ...businessModules, ...personalCoreModules, ...personalFacetModules]
}

export function allQuestions(): FieldQuestion[] {
  const questions = allModules().flatMap((module) => module.fields)
  const seen = new Set<string>()
  const duplicates: string[] = []
  for (const question of questions) {
    if (seen.has(question.id)) duplicates.push(question.id)
    seen.add(question.id)
  }
  if (duplicates.length > 0) {
    throw new Error(`Duplicate question ids: ${duplicates.join(', ')}`)
  }
  return questions
}

export function moduleById(id: string): ModuleDef | undefined {
  return allModules().find((module) => module.id === id)
}

export function questionsForDraft(draftPath: string): FieldQuestion[] {
  return allQuestions().filter((question) => question.related_outputs.includes(draftPath))
}
