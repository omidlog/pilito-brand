import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Ajv from 'ajv'
import { parse } from 'yaml'

export interface AssetRecord {
  id: string
  name: string
  status: string
  path: string
  present: boolean
  checksum_sha256?: string | null
  visibility?: string
  missing_reason?: string
}

export interface AssetManifest {
  schema_version: number
  assets: AssetRecord[]
}

export function inspectAssetForPublication(
  repoRoot: string,
  assetPath: string,
  expectedHash?: string | null,
): { ok: true; realPath: string } | { ok: false; reason: string } {
  let decoded = assetPath
  try {
    decoded = decodeURIComponent(assetPath)
  } catch {
    return { ok: false, reason: 'path' }
  }
  if (!decoded || decoded.includes('\0') || decoded.includes('..') || path.isAbsolute(decoded) || /^[a-z]+:/i.test(decoded)) {
    return { ok: false, reason: 'path' }
  }
  if (!assetPathIsSafe(repoRoot, assetPath)) return { ok: false, reason: 'path' }
  const full = path.resolve(repoRoot, assetPath)
  if (!fs.existsSync(full)) return { ok: false, reason: 'missing' }
  if (fs.lstatSync(full).isSymbolicLink()) return { ok: false, reason: 'symlink' }
  const realPath = fs.realpathSync(full)
  const assetsRoot = fs.realpathSync(path.resolve(repoRoot, 'brand', 'assets'))
  if (realPath !== assetsRoot && !realPath.startsWith(`${assetsRoot}${path.sep}`)) return { ok: false, reason: 'escape' }
  const bytes = fs.readFileSync(realPath)
  if (expectedHash && createHash('sha256').update(bytes).digest('hex') !== expectedHash) return { ok: false, reason: 'checksum' }
  if (realPath.toLowerCase().endsWith('.svg')) {
    // Fail closed on active SVG/HTML/XML features. Production deployments should
    // additionally sanitize SVGs with a maintained XML-aware sanitizer at ingest.
    const svg = bytes.toString('utf8')
    if (!/^\s*(?:<\?xml\s+[^>]*>\s*)?<svg[\s>]/i.test(svg) || !/<\/svg>\s*$/i.test(svg) ||
        /<!|<\?|<\s*\/?\s*(?:script|foreignobject|iframe|object|embed|image|use|a|animate|set|style|audio|video|feimage)\b/i.test(svg) ||
        /\b(?:on[a-z]+|href|xlink:href|src|style)\s*=/i.test(svg) ||
        /(?:javascript|data|vbscript)\s*:/i.test(svg) ||
        /url\s*\(|@import|expression\s*\(/i.test(svg)) {
      return { ok: false, reason: 'active-svg' }
    }
  }
  return { ok: true, realPath }
}

export function assetPathIsSafe(repoRoot: string, assetPath: string): boolean {
  if (!assetPath || assetPath.includes('..') || path.isAbsolute(assetPath)) return false
  const full = path.resolve(repoRoot, assetPath)
  const root = path.resolve(repoRoot, 'brand', 'assets')
  return full === root || full.startsWith(`${root}${path.sep}`)
}

export function validateAssets(repoRoot: string): string[] {
  const errors: string[] = []
  const file = path.join(repoRoot, 'brand', 'assets', 'asset-manifest.yaml')
  const manifest = parse(fs.readFileSync(file, 'utf8')) as AssetManifest
  const schemaPath = path.join(repoRoot, 'schemas', 'asset.schema.json')
  const validate = fs.existsSync(schemaPath) ? new Ajv({ allErrors: true, strict: false }).compile(JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as object) : null
  const ids = new Set<string>()
  for (const asset of manifest.assets) {
    if (validate && !(validate(asset) as boolean)) errors.push(`${asset.id} failed the asset schema`)
    if (!assetPathIsSafe(repoRoot, asset.path)) errors.push(`${asset.id} has an unsafe path`)
    if (ids.has(asset.id)) errors.push(`Duplicate asset id ${asset.id}`)
    ids.add(asset.id)
    const full = path.join(repoRoot, asset.path)
    if (asset.present) {
      if (!fs.existsSync(full)) errors.push(`${asset.id} is present but ${asset.path} is missing`)
      else if (asset.checksum_sha256) {
        const actual = createHash('sha256').update(fs.readFileSync(full)).digest('hex')
        if (actual !== asset.checksum_sha256) errors.push(`${asset.id} checksum mismatch`)
      }
    } else if (asset.status === 'approved') {
      errors.push(`${asset.id} cannot be approved while present is false`)
    } else if (!asset.missing_reason) {
      errors.push(`${asset.id} is missing without missing_reason`)
    }
  }
  return errors
}
