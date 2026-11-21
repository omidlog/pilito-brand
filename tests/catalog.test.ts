import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildMascotCatalog, CANONICAL_ANGLES, catalogCounts, CORE_MOTIONS, EXAMPLE_STAGES } from '@brand-os/brand-core'

test('mascot catalog has the required inventory', () => {
  const states = buildMascotCatalog()
  const counts = catalogCounts(states)
  assert.equal(states.length, 90)
  assert.deepEqual(counts, { emotion: 20, action: 20, ui: 15, learning: 15, prop: 10, seasonal: 10 })
  assert.equal(new Set(states.map((state) => state.id)).size, 90)
  const mvp = states.filter((state) => state.mvp)
  assert.ok(mvp.length >= 20 && mvp.length <= 30)
  assert.equal(EXAMPLE_STAGES.length, 6)
  assert.equal(CANONICAL_ANGLES.length, 8)
  assert.equal(CORE_MOTIONS.length, 15)
  assert.ok(states.every((state) => state.preview === null && state.source_assets.length === 0 && state.status === 'defined'))
})
