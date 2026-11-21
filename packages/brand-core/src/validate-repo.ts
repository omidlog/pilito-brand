import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'
import { validateAssets } from '@brand-os/asset-catalog'
import { compileTokens } from '@brand-os/design-tokens'
import { allQuestions } from './content/index.js'
import { buildMascotCatalog, catalogCounts } from './content/mascot-catalog.js'
import { validateMascotLifecycle } from './mascot-lifecycle.js'
import { evaluateCondition } from './conditions.js'
import { templateConfig } from './config.js'
import { readYaml } from './fsutil.js'
import { approvalGrantErrors } from './permissions.js'
import { canonicalReferenceErrors } from './personal.js'
import { profileErrors, profileExists } from './profiles.js'
import { llmConfigErrors } from './llm/provider.js'
import type { BrandConfig, FieldQuestion } from './types.js'

export interface ValidationReport {
  ok: boolean
  errors: string[]
  warnings: string[]
}

const SECRET_PATTERNS = [/BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/, /ghp_[A-Za-z0-9]{20,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/]

export function validateRepo(root: string): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const questions = loadQuestions(root, errors)
  const starter = safeStarter(errors)
  if (starter) {
    const byId = new Map(questions.map((question) => [question.id, question]))
    for (const question of starter) {
      const stored = byId.get(question.id)
      if (!stored) errors.push(`Question bank is missing starter question ${question.id}`)
      else if (stored.prompt.en !== question.prompt.en) errors.push(`Prompt drift for ${question.id}`)
    }
    const modules = new Set(starter.map((question) => question.module))
    for (const moduleId of modules) {
      const count = starter.filter((question) => question.module === moduleId).length
      if (count < 5) errors.push(`Module ${moduleId} has only ${count} starter questions`)
    }
  }
  validateQuestionFiles(questions, errors)
  validateRegistry(root, questions, errors)
  validateConditions(questions, errors)
  errors.push(...profileErrors(root, questions))
  errors.push(...canonicalReferenceErrors(questions))
  const configFile = path.join(root, 'brand', 'brand.config.yaml')
  if (fs.existsSync(configFile)) {
    const config = readYaml<BrandConfig>(configFile)
    if (!profileExists(root, config.brand?.profile)) {
      warnings.push(`brand.config.yaml brand.profile ${config.brand?.profile} has no file in brand/interview/profiles/, so the full question bank is used`)
    }
    errors.push(...llmConfigErrors(config))
  }
  validateMascot(root, errors)
  errors.push(...validateAssets(root))
  const compiled = compileTokens(root)
  errors.push(...compiled.errors)
  const builtCss = path.join(root, 'packages', 'design-tokens', 'dist', 'tokens.css')
  if (!fs.existsSync(builtCss)) warnings.push('Token CSS has not been written. Run npm run tokens:build before the docs build.')
  else if (fs.readFileSync(builtCss, 'utf8') !== compiled.css) errors.push('packages/design-tokens/dist/tokens.css is stale. Run npm run tokens:build.')
  scanSecrets(root, errors)
  scanCanary(root, errors)
  return { ok: errors.length === 0, errors, warnings }
}

function safeStarter(errors: string[]): FieldQuestion[] | null {
  try {
    return allQuestions()
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return null
  }
}

function loadQuestions(root: string, errors: string[]): FieldQuestion[] {
  const dir = path.join(root, 'brand', 'interview', 'question-bank')
  if (!fs.existsSync(dir)) {
    errors.push('Question bank directory is missing')
    return []
  }
  const ajv = new Ajv({ allErrors: true, strict: false })
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'question.schema.json'), 'utf8')) as object
  const validate = ajv.compile(schema)
  const questions: FieldQuestion[] = []
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith('.yaml'))) {
    const doc = readYaml<{ questions: FieldQuestion[] }>(path.join(dir, name))
    for (const question of doc.questions) {
      if (!(validate(question) as boolean)) errors.push(`${question.id || name}: ${ajv.errorsText(validate.errors)}`)
      questions.push(question)
    }
  }
  const ids = new Set<string>()
  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`Duplicate question id ${question.id}`)
    ids.add(question.id)
  }
  return questions
}

function validateQuestionFiles(questions: FieldQuestion[], errors: string[]): void {
  for (const question of questions) {
    if (question.related_outputs.length === 0) errors.push(`${question.id} has no output document`)
    for (const output of question.related_outputs) {
      if (output.includes('..') || (!output.startsWith('brand/generated/') && !output.startsWith('brand/restricted/'))) {
        errors.push(`${question.id} has an unsafe output path ${output}`)
      }
    }
    errors.push(...approvalGrantErrors(question))
    for (const dependency of question.depends_on) {
      if (!questions.some((item) => item.id === dependency)) errors.push(`${question.id} depends on missing ${dependency}`)
    }
  }
}

function validateRegistry(root: string, questions: FieldQuestion[], errors: string[]): void {
  const file = path.join(root, 'brand', 'interview', 'field-registry.yaml')
  if (!fs.existsSync(file)) {
    errors.push('Field registry is missing')
    return
  }
  const registry = readYaml<{ fields: Array<{ id: string; required: boolean; question_ids: string[]; documents: string[] }> }>(file)
  const questionIds = new Set(questions.map((question) => question.id))
  for (const field of registry.fields) {
    if (!field.question_ids?.length) errors.push(`Field ${field.id} has no question`)
    for (const id of field.question_ids ?? []) {
      if (!questionIds.has(id)) errors.push(`Field ${field.id} points at missing question ${id}`)
    }
    if (field.required && (!field.documents || field.documents.length === 0)) errors.push(`Required field ${field.id} has no document`)
  }
}

function validateConditions(questions: FieldQuestion[], errors: string[]): void {
  const ctx = { config: templateConfig(), answers: new Map() }
  for (const question of questions) {
    for (const expression of [question.required_when, question.skip_when]) {
      if (!expression) continue
      try {
        evaluateCondition(expression, ctx)
      } catch (error) {
        errors.push(`${question.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
}

function validateMascot(root: string, errors: string[]): void {
  const expected = buildMascotCatalog()
  const counts = catalogCounts(expected)
  const expectedCounts: Record<string, number> = { emotion: 20, action: 20, ui: 15, learning: 15, prop: 10, seasonal: 10 }
  for (const [category, count] of Object.entries(expectedCounts)) {
    if (counts[category] !== count) errors.push(`Catalog builder ${category} is ${counts[category] ?? 0}, expected ${count}`)
  }
  if (expected.length !== 90) errors.push(`Catalog builder has ${expected.length} states, expected 90`)
  const file = path.join(root, 'brand', 'mascot', 'catalog.yaml')
  if (!fs.existsSync(file)) {
    errors.push('Mascot catalog file is missing')
    return
  }
  const stored = readYaml<{ states: Array<{ id: string; category: string }> }>(file)
  const ajv = new Ajv({ allErrors: true, strict: false })
  const stateSchema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'mascot-state.schema.json'), 'utf8')) as object
  const validateState = ajv.compile(stateSchema)
  const storedIds = new Set(stored.states.map((state) => state.id))
  for (const state of stored.states) {
    if (!(validateState(state) as boolean)) errors.push(`Mascot state ${state.id}: ${ajv.errorsText(validateState.errors)}`)
  }
  for (const state of expected) {
    if (!storedIds.has(state.id)) errors.push(`Catalog file is missing ${state.id}`)
  }
  if (stored.states.length !== 90) errors.push(`Catalog file has ${stored.states.length} states, expected 90`)
  errors.push(...validateMascotLifecycle(root, stored.states as unknown as Array<Record<string, unknown>>))
  const stages = readYaml<{ stages: Array<{ id?: string; order?: number }> }>(path.join(root, 'brand', 'mascot', 'stages.yaml'))
  const stageIds = stages.stages.map((stage) => stage.id).filter((id): id is string => Boolean(id))
  if (stageIds.length !== stages.stages.length) errors.push('Every mascot stage needs an id')
  if (new Set(stageIds).size !== stageIds.length) errors.push('Mascot stage ids must be unique')
  const orders = stages.stages.map((stage) => stage.order).filter((order): order is number => typeof order === 'number')
  const sorted = [...orders].sort((a, b) => a - b)
  if (orders.length !== stages.stages.length || sorted.some((order, index) => order !== (sorted[0] ?? 1) + index)) {
    errors.push('Mascot stages need a contiguous order starting at their first number')
  }
  if (stages.stages.length < 1) errors.push('At least one mascot stage is required when the file exists')
  const angles = readYaml<{ angles: unknown[] }>(path.join(root, 'brand', 'mascot', 'angles.yaml'))
  if (angles.angles.length !== 8) errors.push('Expected 8 angles')
  const motions = readYaml<{ motions: unknown[] }>(path.join(root, 'brand', 'mascot', 'motions.yaml'))
  if (motions.motions.length !== 15) errors.push(`Expected 15 motions, found ${motions.motions.length}`)
}

function scanSecrets(root: string, errors: string[]): void {
  const skip = new Set(['node_modules', '.git', 'build', 'dist', '.docusaurus'])
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(md|yaml|yml|json|ts|tsx|js|css|svg|txt)$/.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8')
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(text)) errors.push(`Possible secret in ${path.relative(root, full)}`)
        }
      }
    }
  }
  walk(root)
}

function scanCanary(root: string, errors: string[]): void {
  const canary = 'RESTRICTED_CANARY_DO_NOT_PUBLISH'
  const publicRoots = [path.join(root, 'brand', 'content'), path.join(root, 'brand', 'business-os'), path.join(root, 'brand', 'templates')]
  for (const dir of publicRoots) {
    if (!fs.existsSync(dir)) continue
    const walk = (current: string): void => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (fs.readFileSync(full, 'utf8').includes(canary)) errors.push(`Restricted canary leaked into ${path.relative(root, full)}`)
      }
    }
    walk(dir)
  }
}
