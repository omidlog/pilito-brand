import { isCurrent, readEvidence } from './evidence.js'

/**
 * Usage rights for assets that show a person or someone else's work: portraits, case-study images,
 * client logos and testimonial cards. Such an asset is never public without a granted, public-scope,
 * unexpired `rights` record in the asset manifest. If the record names an evidence id, that permission
 * must also be verified and current in the evidence register.
 *
 * Other assets (the template's own placeholders, a logo the brand owns) are unaffected.
 */

export const RIGHTS_SUBJECTS = ['portrait', 'person', 'case_study', 'client_logo', 'testimonial'] as const
export type RightsSubject = (typeof RIGHTS_SUBJECTS)[number]

export interface AssetRights {
  status?: unknown
  scope?: unknown
  holder?: unknown
  expires?: unknown
  evidence_id?: unknown
}

export interface RightsAsset {
  id?: unknown
  subject?: unknown
  tags?: unknown
  rights?: AssetRights | null
}

const TAG_SUBJECTS: Record<string, RightsSubject> = {
  portrait: 'portrait',
  headshot: 'portrait',
  'case-study': 'case_study',
  'client-logo': 'client_logo',
  testimonial: 'testimonial',
}

/** The rights-sensitive subject of an asset, from `subject` or its tags, or null. */
export function rightsSubject(asset: RightsAsset): RightsSubject | null {
  if (typeof asset.subject === 'string' && (RIGHTS_SUBJECTS as readonly string[]).includes(asset.subject)) return asset.subject as RightsSubject
  if (Array.isArray(asset.tags)) {
    for (const tag of asset.tags) if (typeof tag === 'string' && TAG_SUBJECTS[tag]) return TAG_SUBJECTS[tag] ?? null
  }
  return null
}

/** Why a rights-sensitive asset cannot be public, or null when rights allow it (or are not needed). */
export function rightsBlocker(root: string, asset: RightsAsset, now = new Date()): string | null {
  const subject = rightsSubject(asset)
  if (!subject) return null
  const rights = asset.rights
  if (!rights || typeof rights !== 'object') return `${subject} asset has no rights record`
  if (rights.status !== 'granted') return `${subject} rights are ${typeof rights.status === 'string' ? rights.status : 'not granted'}`
  if (rights.scope !== 'public') return `${subject} rights do not cover public use`
  if (typeof rights.holder !== 'string' || !rights.holder.trim()) return `${subject} rights name no holder`
  if (rights.expires !== undefined && rights.expires !== null) {
    if (typeof rights.expires !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rights.expires)) return `${subject} rights expiry must be YYYY-MM-DD`
    if (rights.expires < now.toISOString().slice(0, 10)) return `${subject} rights expired on ${rights.expires}`
  }
  if (rights.evidence_id !== undefined && rights.evidence_id !== null) {
    const item = readEvidence(root).find((entry) => entry.id === rights.evidence_id)
    if (!item || item.kind !== 'permission' || item.scope !== 'public' || !isCurrent(item, now)) return `${subject} permission ${String(rights.evidence_id)} is not verified and current`
  }
  return null
}
