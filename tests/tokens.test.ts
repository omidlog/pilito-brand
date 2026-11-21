import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileTokens, contrastRatio } from '@brand-os/design-tokens'

test('token compiler emits CSS, TypeScript, and passing contrast pairs', () => {
  const compiled = compileTokens(process.cwd())
  assert.deepEqual(compiled.errors, [])
  assert.match(compiled.css, /--color-brand-primary:\s*#123A73/)
  assert.match(compiled.css, /prefers-reduced-motion/)
  assert.match(compiled.typescript, /tokenStatus = "draft"/)
  assert.ok(compiled.contrast.length >= 8)
  assert.ok(compiled.contrast.every((pair) => pair.pass))
  assert.ok(contrastRatio('#1A1C1E', '#F7F5F2') >= 4.5)
})
