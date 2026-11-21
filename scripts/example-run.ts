import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { applyInit, InterviewEngine, writeStarterWorkspace } from '@brand-os/brand-core'

const profile = process.argv[2] === 'b2b-saas' ? 'b2b-saas' : 'education-app'
const fixture = path.join(process.cwd(), 'examples', profile, 'answers.json')
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-'))
writeStarterWorkspace(dir)
applyInit(dir, {
  name: profile === 'b2b-saas' ? 'Example B2B' : 'Example Learners',
  slug: profile === 'b2b-saas' ? 'example-b2b' : 'example-learners',
  industry: profile,
  sector: profile === 'b2b-saas' ? 'b2b-saas' : 'education',
  language: 'en',
  languages: ['en', 'fa', 'tr'],
  mascot: profile !== 'b2b-saas',
  gamification: profile !== 'b2b-saas',
  publish: 'private',
  profile,
})
const engine = new InterviewEngine(dir)
const answers = JSON.parse(fs.readFileSync(fixture, 'utf8')) as Record<string, string>
let guard = 0
while (guard < 500) {
  const current = engine.current()
  if (!current || answers[current.id] === undefined) break
  engine.submit(answers[current.id] ?? '')
  guard += 1
}
console.log(engine.statusText())
console.log(`Workspace: ${dir}`)
