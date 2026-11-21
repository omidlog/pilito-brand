import type { InterviewProfile } from '../profiles.js'
import { personalCoreModules } from './personal-core.js'
import { personalFacetModules } from './personal-facets.js'

/**
 * Starter interview profiles written into new workspaces (brand/interview/profiles/). The YAML file is
 * the editable copy: an owner may change the list there, and brand:validate checks it.
 */
export const FOUNDER_CORE: InterviewProfile & { schema_version: 1 } = {
  schema_version: 1,
  id: 'founder-core',
  title: 'Founder core',
  description:
    'About 40 questions a founder can answer in one sitting: identity, offer, customer, business model, verbal identity, and the visual basics that later generate draft tokens. Set brand.profile to founder-core in brand.config.yaml to use it; set it back to universal for the full question bank. Restricted finance questions are left out on purpose: an interviewing agent must not collect them, and the owner answers them in the interactive interview.',
  question_ids: [
    'business.identity.new_or_existing',
    'business.identity.trade_name',
    'business.identity.sector',
    'business.stage.current',
    'business.market.geography',
    'business.offer.summary',
    'business.customer.primary_segment',
    'business.offer.value_proposition',
    'business.problem.pains',
    'business.product.mvp',
    'business.product.public_status',
    'business.model.revenue',
    'business.sales.motion',
    'business.sales.buyer',
    'business.sales.pricing',
    'business.sales.b2b_packaging',
    'business.marketing.objective',
    'business.marketing.channels',
    'business.plan.milestone',
    'business.finance.currency',
    'brand.personality.traits',
    'brand.strategy.purpose',
    'brand.strategy.values',
    'brand.strategy.differentiation',
    'brand.strategy.promise',
    'brand.verbal.name_use',
    'brand.identity.public_name_override',
    'brand.verbal.tagline',
    'brand.verbal.voice',
    'brand.verbal.forbidden',
    'brand.verbal.localization',
    'brand.verbal.voice_pairs',
    'brand.logo.variants',
    'brand.logo.misuse',
    'brand.logo.min_size',
    'brand.color.roles',
    'brand.color.themes',
    'brand.type.intent',
    'brand.type.scale',
    'brand.mascot.enabled',
    'brand.gamification.enabled',
  ],
}

/**
 * Shared brand questions a personal brand reuses by id instead of redefining: personality, voice,
 * do/don't pairs, forbidden language, translation style, and the visual basics.
 */
export const PERSONAL_SHARED_QUESTIONS = [
  'brand.personality.traits',
  'brand.verbal.voice',
  'brand.verbal.voice_pairs',
  'brand.verbal.forbidden',
  'brand.verbal.localization',
  'brand.photo.direction',
  'brand.color.roles',
  'brand.type.intent',
]

export const PERSONAL_BRAND: InterviewProfile & { schema_version: 1 } = {
  schema_version: 1,
  id: 'personal-brand',
  title: 'Personal brand',
  description:
    'A person-centered brand: identity, positioning, story, experience and credentials, evidence, content, visual presence and privacy, plus the shared voice and visual basics. Facet questions (founder-executive, consultant-expert, creator-educator, artist-designer, speaker-author) apply only for the facets selected in modules.personal.facets. The profile is exclusive: company legal-entity, SaaS, mascot and other Business OS questions count as not applicable, not missing. A person who also runs a business can set brand.profile back to universal and keep modules.personal enabled to work through both.',
  exclusive: true,
  question_ids: [
    ...personalCoreModules.flatMap((module) => module.fields.map((field) => field.id)),
    ...PERSONAL_SHARED_QUESTIONS,
    ...personalFacetModules.flatMap((module) => module.fields.map((field) => field.id)),
  ],
}

export const STARTER_PROFILES = [FOUNDER_CORE, PERSONAL_BRAND]
