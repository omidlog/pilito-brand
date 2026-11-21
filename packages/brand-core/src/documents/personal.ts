import { moduleEnabled } from '../conditions.js'
import type { InterviewEngine } from '../engine.js'
import { claimVerification, evidenceFor, publicationBlockers, readEvidence } from '../evidence.js'
import { readFacts } from '../facts.js'
import { buildDocument, type DocumentAudience, type DocumentItem, type DocumentModel, type DocumentSection, type DocumentSpec, type ItemTag, type PersonalDocumentKind } from './model.js'

/**
 * Personal Brand OS deliverables. Each is a section spec on the shared document model, so every item
 * keeps its tag (approved / assumption / recommendation / missing), its source ids and, for personal
 * claims, its verification label. Nothing here writes prose: documents list approved facts and say
 * what is missing. A drafting agent composes text from them through `draft_personal_content`.
 */

const IDENTITY = ['personal.identity.public_name', 'personal.identity.headline']
const SHORT_BIO = [...IDENTITY, 'personal.positioning.known_for']
const MEDIUM_BIO = [...SHORT_BIO, 'personal.identity.roles', 'personal.positioning.expertise', 'personal.positioning.outcome', 'personal.experience.highlights']
const LONG_BIO = [...MEDIUM_BIO, 'personal.story.origin', 'personal.story.turning_points', 'personal.positioning.perspective', 'personal.credibility.credentials', 'personal.credibility.awards']

export const PERSONAL_BRAND_BOOK: DocumentSpec = {
  kind: 'personal-brand-book',
  title: 'Personal Brand Book',
  requires: { personal: true },
  sections: [
    { id: 'identity', title: 'Identity', purpose: 'How the person is named and introduced.', questions: [...IDENTITY, 'personal.identity.name_forms', 'personal.identity.localized_headline', 'personal.identity.roles', 'personal.identity.service_scope'], guidance: true },
    { id: 'positioning', title: 'Positioning', purpose: 'What the person is known for, by whom, and the limits of their expertise.', questions: ['personal.positioning.known_for', 'personal.positioning.primary_audience', 'personal.positioning.expertise', 'personal.positioning.outcome', 'personal.positioning.perspective', 'personal.positioning.boundaries'], guidance: true },
    { id: 'story', title: 'Story', purpose: 'The professional story in the person’s own words.', questions: ['personal.story.origin', 'personal.story.turning_points', 'personal.story.motivation', 'personal.story.timeline', 'personal.story.next_chapter'] },
    { id: 'voice', title: 'Tone and voice', purpose: 'Personality, voice, do and don’t pairs, banned language and translation style, shared with the brand.', questions: ['brand.personality.traits', 'brand.verbal.voice', 'brand.verbal.voice_pairs', 'brand.verbal.forbidden', 'brand.verbal.localization', 'personal.content.channel_tone'] },
    { id: 'look', title: 'Look', purpose: 'Portrait style, presentation, images to avoid, and the visual basics.', questions: ['personal.media.photo_guidelines', 'personal.media.avoid', 'personal.media.presentation', 'brand.photo.direction', 'brand.color.roles', 'brand.type.intent'], guidance: true },
    { id: 'content', title: 'Audience and content pillars', purpose: 'What the person talks about, where, and why.', questions: ['personal.content.pillars', 'personal.content.channels', 'personal.goals.outcomes'] },
    { id: 'ethics', title: 'Ethics and claims', purpose: 'Which claims need a source, what must be disclosed, and what stays private.', questions: ['personal.governance.public_claim_policy', 'personal.reputation.conflicts', 'personal.privacy.boundaries', 'personal.privacy.never_publish'], guidance: true },
  ],
}

export const PROFESSIONAL_BIO: DocumentSpec = {
  kind: 'professional-bio',
  title: 'Professional Bio',
  requires: { personal: true },
  sections: [
    { id: 'short', title: 'Short bio', purpose: 'Profile lines and event listings. Guideline 50–70 words.', questions: SHORT_BIO, words: [50, 70] },
    { id: 'medium', title: 'Medium bio', purpose: 'About pages and introductions. Guideline 120–170 words.', questions: MEDIUM_BIO, words: [120, 170] },
    { id: 'long', title: 'Long bio', purpose: 'Press, books and long introductions. Guideline 250–350 words.', questions: LONG_BIO, words: [250, 350] },
  ],
}

export const LINKEDIN_PACK: DocumentSpec = {
  kind: 'linkedin-pack',
  title: 'LinkedIn Pack',
  requires: { personal: true },
  sections: [
    { id: 'headline', title: 'Headline options', purpose: 'Approved headline and its localized forms. Options stay proposals until approved.', questions: ['personal.identity.headline', 'personal.identity.localized_headline', 'personal.positioning.known_for'] },
    { id: 'about', title: 'About summary', purpose: 'Facts the About section may use.', questions: ['personal.positioning.known_for', 'personal.positioning.perspective', 'personal.story.origin', 'personal.positioning.outcome', 'personal.services.offers'] },
    { id: 'featured', title: 'Featured content strategy', purpose: 'What to pin, from pillars and shareable work.', questions: ['personal.content.pillars', 'personal.portfolio.projects', 'personal.speaking.prior_talks', 'personal.author.publications'] },
    { id: 'experience', title: 'Experience entries', purpose: 'Organizations with the exact relation and dates, and what the person did there.', questions: ['personal.experience.relationships', 'personal.experience.roles', 'personal.experience.highlights', 'personal.credibility.credentials'] },
  ],
}

export const WEBSITE_PACK: DocumentSpec = {
  kind: 'website-pack',
  title: 'Website Content Pack',
  requires: { personal: true },
  sections: [
    { id: 'hero', title: 'Hero', purpose: 'Name, headline and the one-sentence position.', questions: SHORT_BIO },
    { id: 'about', title: 'About', purpose: 'Story and motivation.', questions: ['personal.story.origin', 'personal.story.turning_points', 'personal.story.motivation'] },
    { id: 'expertise', title: 'Expertise', purpose: 'Topics, point of view and boundaries.', questions: ['personal.positioning.expertise', 'personal.positioning.perspective', 'personal.positioning.boundaries'] },
    { id: 'work', title: 'Work', purpose: 'Shareable projects and demonstrable results, each with its evidence state.', questions: ['personal.portfolio.projects', 'personal.experience.highlights', 'personal.artist.exhibitions'] },
    { id: 'services', title: 'Services', purpose: 'Offers that exist today, and how they are delivered. No invented prices.', questions: ['personal.services.offers', 'personal.consulting.engagements', 'personal.consulting.pricing_policy'] },
    { id: 'proof', title: 'Social proof', purpose: 'Testimonials with permission, credentials and awards with evidence.', questions: ['personal.reputation.testimonials', 'personal.credibility.credentials', 'personal.credibility.awards'] },
    { id: 'contact', title: 'Contact', purpose: 'Professional contact and availability only.', questions: ['personal.contact.public_channels', 'personal.privacy.availability', 'personal.consulting.cta'] },
    { id: 'metadata', title: 'Metadata', purpose: 'Name forms and service scope for titles and descriptions.', questions: ['personal.identity.name_forms', 'personal.identity.service_scope', 'personal.identity.roles'] },
  ],
}

export const MEDIA_KIT: DocumentSpec = {
  kind: 'media-kit',
  title: 'Media Kit',
  requires: { personal: true },
  sections: [
    { id: 'bio', title: 'Approved bio', purpose: 'Name, headline and position, as approved.', questions: SHORT_BIO, words: [50, 70] },
    { id: 'headshot', title: 'Headshot and usage rights', purpose: 'Approved portraits and their rights. An asset without granted public rights is never released.', questions: ['personal.media.portraits', 'personal.media.photo_guidelines'] },
    { id: 'highlights', title: 'Press-safe highlights', purpose: 'Only claims with evidence may be quoted as fact.', questions: ['personal.experience.highlights', 'personal.credibility.credentials', 'personal.credibility.awards', 'personal.founder.ventures'] },
    { id: 'topics', title: 'Topics', purpose: 'What the person can comment on.', questions: ['personal.positioning.expertise', 'personal.speaking.topics', 'personal.content.pillars'] },
    { id: 'metrics', title: 'Audience metrics', purpose: 'Only dated, sourced numbers.', questions: ['personal.creator.metrics'] },
    { id: 'contact', title: 'Media contact', purpose: 'Professional contact only.', questions: ['personal.contact.public_channels'] },
  ],
}

export const SPEAKER_KIT: DocumentSpec = {
  kind: 'speaker-kit',
  title: 'Speaker Kit',
  requires: { personal: true, facet: 'speaker-author' },
  sections: [
    { id: 'introduction', title: 'Stage introduction', purpose: 'What a host reads aloud.', questions: ['personal.speaking.introduction', 'personal.identity.public_name', 'personal.identity.headline'], words: [30, 60] },
    { id: 'topics', title: 'Topics and abstracts', purpose: 'Talks the person offers.', questions: ['personal.speaking.topics', 'personal.speaking.abstracts', 'personal.speaking.languages'] },
    { id: 'history', title: 'Previous talks and publications', purpose: 'Each with a source.', questions: ['personal.speaking.prior_talks', 'personal.author.publications'] },
    { id: 'bio', title: 'Bios', purpose: 'Reused from the Professional Bio facts, not rewritten.', questions: SHORT_BIO },
    { id: 'assets', title: 'Assets and permissions', purpose: 'Portraits and the rights to use them.', questions: ['personal.media.portraits'] },
    { id: 'booking', title: 'Booking contact', purpose: 'Professional contact only.', questions: ['personal.contact.public_channels', 'personal.privacy.availability'] },
  ],
}

export const CONTENT_STRATEGY: DocumentSpec = {
  kind: 'content-strategy',
  title: 'Content Strategy',
  requires: { personal: true },
  sections: [
    { id: 'audience', title: 'Audience', purpose: 'Who the content is for.', questions: ['personal.positioning.primary_audience', 'personal.creator.audience_segments'] },
    { id: 'pillars', title: 'Pillars to channels', purpose: 'Pillars, channels and how tone varies per channel.', questions: ['personal.content.pillars', 'personal.content.channels', 'personal.content.channel_tone'], guidance: true },
    { id: 'voice', title: 'Voice', purpose: 'Shared voice and banned language.', questions: ['brand.verbal.voice', 'brand.verbal.voice_pairs', 'brand.verbal.forbidden'] },
    { id: 'formats', title: 'Formats and schedule', purpose: 'Series and formats the person can sustain.', questions: ['personal.creator.series'] },
    { id: 'cta', title: 'Calls to action', purpose: 'Where readers go next.', questions: ['personal.consulting.cta', 'personal.contact.public_channels'] },
    { id: 'disclosure', title: 'Disclosure', purpose: 'Sponsorships, affiliations and conflicts.', questions: ['personal.creator.disclosure', 'personal.creator.sponsorship', 'personal.reputation.conflicts'] },
    { id: 'measurement', title: 'Measurement plan', purpose: 'The outcome that matters and how it is measured.', questions: ['personal.goals.outcomes', 'personal.goals.kpis'] },
  ],
}

export const PORTFOLIO_PACK: DocumentSpec = {
  kind: 'portfolio-pack',
  title: 'Portfolio & Case Study Pack',
  requires: { personal: true },
  sections: [
    { id: 'projects', title: 'Projects and case studies', purpose: 'Exact role, dates, result type, source and permission for each.', questions: ['personal.portfolio.projects', 'personal.experience.highlights'] },
    { id: 'taxonomy', title: 'Taxonomy and practice', purpose: 'How work is grouped and described.', questions: ['personal.artist.portfolio_taxonomy', 'personal.artist.practice', 'personal.artist.aesthetic'] },
    { id: 'exhibitions', title: 'Exhibitions and collaborations', purpose: 'Each with a source.', questions: ['personal.artist.exhibitions'] },
    { id: 'rights', title: 'Rights and credits', purpose: 'Usage rights, credits and confidentiality.', questions: ['personal.artist.usage_rights', 'personal.consulting.confidentiality', 'personal.reputation.testimonials'] },
  ],
}

export const SERVICES_PACK: DocumentSpec = {
  kind: 'services-pack',
  title: 'Services & Offer Pack',
  requires: { personal: true },
  sections: [
    { id: 'offers', title: 'Offers', purpose: 'Offers that exist, kept apart from ideas.', questions: ['personal.services.offers', 'personal.consulting.engagements'] },
    { id: 'clients', title: 'Target clients', purpose: 'Who is a fit and who is not.', questions: ['personal.consulting.target_clients', 'personal.positioning.primary_audience'] },
    { id: 'method', title: 'Method', purpose: 'How the work is done.', questions: ['personal.consulting.methodology', 'personal.positioning.outcome'] },
    { id: 'boundaries', title: 'Boundaries', purpose: 'Confidentiality, ethics and expertise limits. No promised performance.', questions: ['personal.consulting.confidentiality', 'personal.positioning.boundaries'] },
    { id: 'pricing', title: 'Pricing policy', purpose: 'Whether prices are published. No amounts are invented.', questions: ['personal.consulting.pricing_policy'] },
    { id: 'proof', title: 'Proof', purpose: 'Evidence-backed results and permitted testimonials.', questions: ['personal.experience.highlights', 'personal.portfolio.projects', 'personal.reputation.testimonials'] },
    { id: 'inquiry', title: 'Inquiry', purpose: 'One next step.', questions: ['personal.consulting.cta', 'personal.contact.public_channels'] },
  ],
}

export const PERSONAL_SPECS: Record<Exclude<PersonalDocumentKind, 'evidence-register'>, DocumentSpec> = {
  'personal-brand-book': PERSONAL_BRAND_BOOK,
  'professional-bio': PROFESSIONAL_BIO,
  'linkedin-pack': LINKEDIN_PACK,
  'website-pack': WEBSITE_PACK,
  'media-kit': MEDIA_KIT,
  'speaker-kit': SPEAKER_KIT,
  'content-strategy': CONTENT_STRATEGY,
  'portfolio-pack': PORTFOLIO_PACK,
  'services-pack': SERVICES_PACK,
}

function emptyModel(engine: InterviewEngine, kind: PersonalDocumentKind, title: string, audience: DocumentAudience, note: string): DocumentModel {
  return { schema_version: 1, kind, title, brand_id: engine.config().brand.slug, audience, note, counts: { approved: 0, assumption: 0, recommendation: 0, missing: 0 }, sections: [] }
}

/** Why a personal document does not apply to this brand, or null. */
function notApplicable(engine: InterviewEngine, spec: DocumentSpec): string | null {
  const config = engine.config()
  if (!moduleEnabled({ optional: 'personal' }, config)) return 'Not applicable: the personal module is turned off in brand.config.yaml.'
  if (spec.requires?.facet && !moduleEnabled({ optional: 'personal', facet: spec.requires.facet }, config)) {
    return `Not applicable: the ${spec.requires.facet} facet is not selected in modules.personal.facets.`
  }
  return null
}

/**
 * A personal document. Sections whose questions all belong to unselected facets are dropped, so a
 * consultant-only brand never sees an empty exhibitions section.
 */
export function buildPersonalDocument(engine: InterviewEngine, kind: PersonalDocumentKind, audience: DocumentAudience): DocumentModel {
  if (kind === 'evidence-register') return buildEvidenceRegister(engine, audience)
  const spec = PERSONAL_SPECS[kind]
  const reason = notApplicable(engine, spec)
  if (reason) return emptyModel(engine, kind, spec.title, audience, reason)
  const applicable = new Set(engine.questions().filter((question) => engine.applicability(question) === null).map((question) => question.id))
  const sections = spec.sections
    .map((section) => ({ ...section, questions: section.questions.filter((id) => applicable.has(id)) }))
    .filter((section) => section.questions.length > 0)
  const model = buildDocument(engine, { ...spec, sections }, audience)
  return {
    ...model,
    note: `${model.note} Personal claims show whether they are verified, owner-stated or unverified. Nothing was written for the person; drafts are composed from approved facts only.`,
  }
}

/**
 * Reputation & Evidence Register: every claim that needs evidence or permission, its sources, their
 * status, and whether it is eligible for public release today. Internal only: the public edition is
 * empty because sources and permissions are not public material.
 */
export function buildEvidenceRegister(engine: InterviewEngine, audience: DocumentAudience): DocumentModel {
  const title = 'Reputation & Evidence Register'
  if (!moduleEnabled({ optional: 'personal' }, engine.config())) {
    return emptyModel(engine, 'evidence-register', title, audience, 'Not applicable: the personal module is turned off in brand.config.yaml.')
  }
  if (audience === 'public') {
    return emptyModel(engine, 'evidence-register', title, audience, 'Internal only. Sources, permissions and their status are not published.')
  }
  const root = engine.workspaceRoot()
  const brandId = engine.config().brand.slug
  const facts = readFacts(root, 'approved', brandId)
  const evidence = readEvidence(root)
  const now = new Date()
  const claims = engine.questions().filter((question) => question.publication_requires?.length && engine.applicability(question) === null)
  const sections: DocumentSection[] = claims.map((question) => {
    const fact = facts[question.id]
    const found = evidenceFor(question.id, evidence, now)
    const blockers = publicationBlockers(question, fact?.value ?? null, evidence, now)
    const verification = claimVerification(question, evidence, now)
    const claim: DocumentItem = {
      id: question.id,
      label: question.label,
      tag: fact?.status === 'approved' ? 'approved' : 'missing',
      kind: 'text',
      value: fact?.status === 'approved' && fact.value !== null && fact.value !== undefined ? String(fact.value) : null,
      structured: null,
      source_ids: [question.id, ...(fact ? fact.source.answer_ids : []), ...found.all.map((item) => `evidence:${item.id}`)],
      version: fact?.version ?? null,
      withheld: false,
      note: [
        `Requires: ${(question.publication_requires ?? []).join(', ')}.`,
        `Verification: ${verification}.`,
        fact?.status === 'approved' ? null : 'Claim not approved.',
        blockers.length ? `Not eligible for public release: ${blockers.join(' ')}` : 'Eligible for public release once approved and published.',
        fact?.publication === 'published' ? 'Currently published.' : null,
      ].filter(Boolean).join(' '),
      verification,
    }
    const sources: DocumentItem[] = found.all.map((item) => ({
      id: item.id,
      label: `${item.kind === 'permission' ? 'Permission' : 'Source'} ${item.id} (${item.source_type})`,
      tag: (item.status === 'verified' ? 'approved' : 'assumption') as ItemTag,
      kind: 'text',
      value: item.reference,
      structured: null,
      source_ids: [item.id, item.claim_id],
      version: null,
      withheld: false,
      note: [
        `Status: ${item.status}${item.status_reason ? ` (${item.status_reason})` : ''}.`,
        item.kind === 'permission' ? `Scope: ${item.scope ?? 'none'}${item.granted_by ? `, granted by ${item.granted_by}` : ''}.` : null,
        item.source_type === 'owner_testimony' ? 'Owner testimony: never counts as independent verification.' : null,
        item.review_due ? `Re-verify by ${item.review_due}.` : null,
        'Remove with brand:evidence withdraw; dependent public claims are unpublished at once.',
      ].filter(Boolean).join(' '),
      verification: null,
    }))
    const items = [claim, ...sources]
    const status: DocumentSection['status'] = blockers.length === 0 && fact?.status === 'approved' ? 'complete' : found.all.length || fact ? 'partial' : 'missing'
    return { id: question.id, title: question.label, purpose: `Evidence for ${question.id}.`, status, items }
  })
  const counts: Record<ItemTag, number> = { approved: 0, assumption: 0, recommendation: 0, missing: 0 }
  for (const section of sections) for (const item of section.items) counts[item.tag] += 1
  return {
    schema_version: 1,
    kind: 'evidence-register',
    title,
    brand_id: brandId,
    audience,
    note: 'Internal edition. One section per claim that needs evidence or permission. Sources are references; contents were not fetched.',
    counts,
    sections,
  }
}
