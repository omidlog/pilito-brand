import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { writeStarterWorkspace } from '@brand-os/brand-core'
import { prepareDocs } from '../scripts/prepare-docs.js'

test('public prepare hides the mascot module and the restricted canary', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-docs-'))
  writeStarterWorkspace(root)
  fs.cpSync(path.join(path.resolve(import.meta.dirname, '..'), 'brand/tokens'), path.join(root, 'brand/tokens'), { recursive: true })
  const result = prepareDocs(root, { audience: 'public', mascot: false, gamification: false, rootIndex: false })
  assert.ok(result.excluded.some((url) => url.includes('mascot-identity')))
  const docs = path.join(root, 'apps', 'docs', 'docs')
  const stack: string[] = [docs]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) break
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else {
        const text = fs.readFileSync(full, 'utf8')
        assert.equal(text.includes('RESTRICTED_CANARY_DO_NOT_PUBLISH'), false)
      }
    }
  }
  assert.equal(fs.existsSync(path.join(docs, 'brand/06-mascot-identity/overview.md')), false)
})
