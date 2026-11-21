import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ensureApprovalSecret, InterviewEngine } from '@brand-os/brand-core'
import { parse, stringify } from 'yaml'
import type { FakeGitHub, Tree } from './fake-github.js'
import { OWNER } from './studio.js'

/** A 1x1 transparent PNG. */
export const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')

/**
 * Simulates the editing loop that happens outside Studio: clone the repository, change it with the
 * core engine (as Claude Code and the owner's trusted CLI would), and merge the result to main.
 */
export function editOutsideStudio(h: { github: FakeGitHub }, repo: string, change: (engine: InterviewEngine, root: string) => void, message = 'feat(brand): owner-approved edit'): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-clone-'))
  const tree = h.github.headTree(OWNER, repo)
  for (const [file, data] of tree) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.writeFileSync(path.join(root, file), data)
  }
  change(new InterviewEngine(root), root)
  const next: Tree = new Map()
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      const rel = path.relative(root, full).split(path.sep).join('/')
      if (rel === 'brand/.private' || rel.startsWith('brand/restricted/drafts')) continue
      if (entry.isDirectory()) walk(full)
      else next.set(rel, fs.readFileSync(full))
    }
  }
  walk(root)
  // Keep the decoys from the template exactly as they were (they were in Git before the edit).
  for (const file of ['brand/.private/approval-secret']) if (tree.has(file)) next.set(file, tree.get(file)!)
  const sha = h.github.pushEdit(OWNER, repo, (current) => {
    current.clear()
    for (const [file, data] of next) current.set(file, data)
  }, message)
  fs.rmSync(root, { recursive: true, force: true })
  return sha
}

export function approve(engine: InterviewEngine, root: string, answers: Record<string, string>): void {
  for (const [id, value] of Object.entries(answers)) engine.answerQuestion(id, value)
  engine.approvals().approveBatch({ ids: Object.keys(answers) }, ensureApprovalSecret(root))
}

export function addApprovedAsset(root: string, asset: { id: string; name: string; file: string; data: Buffer; status?: string }): void {
  const target = path.join(root, asset.file)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, asset.data)
  const manifestFile = path.join(root, 'brand/assets/asset-manifest.yaml')
  const manifest = parse(fs.readFileSync(manifestFile, 'utf8')) as { assets: Array<Record<string, unknown>> }
  manifest.assets.push({
    id: asset.id,
    name: asset.name,
    status: asset.status ?? 'approved',
    owner: 'design',
    version: '1.0.0',
    visibility: 'internal',
    license: 'Owned by the brand',
    usage: 'Product and marketing',
    path: asset.file,
    present: true,
    checksum_sha256: crypto.createHash('sha256').update(asset.data).digest('hex'),
    mime: 'image/png',
    tags: ['logo'],
  })
  fs.writeFileSync(manifestFile, stringify(manifest))
}

