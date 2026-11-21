import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { rightsBlocker, type RightsAsset } from './asset-rights.js'
import { gatePasses } from './evidence.js'
import type { CanonicalFact } from './facts.js'

/** Publication requires an explicit human-maintained allowlist; approval is not publication. */
export interface PublicationPolicy {
  approved_fact_ids: string[]
  approved_page_ids: string[]
  approved_asset_ids: string[]
  approved_token_ids: string[]
}

export function readPublicationPolicy(root: string): PublicationPolicy {
  const file = path.join(root, 'brand', 'publication-policy.yaml')
  const empty: PublicationPolicy = { approved_fact_ids: [], approved_page_ids: [], approved_asset_ids: [], approved_token_ids: [] }
  if (!fs.existsSync(file)) return empty
  const parsed = parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown> | null
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid publication policy: expected mapping')
  const brandConfigFile = path.join(root, 'brand', 'brand.config.yaml')
  if (fs.existsSync(brandConfigFile)) {
    const config = parse(fs.readFileSync(brandConfigFile, 'utf8')) as { brand?: { slug?: string } } | null
    if (typeof parsed.brand_id !== 'string' || parsed.brand_id !== config?.brand?.slug) {
      throw new Error('Publication policy belongs to another brand. Public release refused.')
    }
  }
  const list = (key: keyof PublicationPolicy): string[] => {
    const value = parsed[key]
    if (value === undefined) return []
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      throw new Error(`Invalid publication policy: ${key} must be a list of identifiers`)
    }
    return value as string[]
  }
  return {
    approved_fact_ids: list('approved_fact_ids'),
    approved_page_ids: list('approved_page_ids'),
    approved_asset_ids: list('approved_asset_ids'),
    approved_token_ids: list('approved_token_ids'),
  }
}

export function factIsPublic(root: string, id: string, fact: CanonicalFact | undefined, brandId: string): boolean {
  if (!fact || fact.id !== id || fact.brand_id !== brandId) return false
  // gatePasses re-checks evidence, rights and privacy at read time, so a withdrawn permission or an
  // expired review date hides a claim even if the allowlist was not updated yet.
  return fact.status === 'approved' && fact.classification === 'public' && fact.publication === 'published' &&
    fact.value !== null && fact.value !== undefined && readPublicationPolicy(root).approved_fact_ids.includes(id) &&
    gatePasses(root, id, fact.value)
}

export function assetIsPublic(root: string, asset: { id?: unknown; status?: unknown; visibility?: unknown } & RightsAsset): boolean {
  // Portraits, case-study images, client logos and testimonials also need granted public-use rights.
  return typeof asset.id === 'string' && asset.status === 'approved' && asset.visibility === 'public' &&
    readPublicationPolicy(root).approved_asset_ids.includes(asset.id) && rightsBlocker(root, asset) === null
}

export function pageIsPublic(root: string, page: string): boolean {
  return readPublicationPolicy(root).approved_page_ids.includes(page)
}
