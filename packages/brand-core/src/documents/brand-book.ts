import type { InterviewEngine } from '../engine.js'
import { buildDocument, type DocumentAudience, type DocumentModel, type DocumentSpec } from './model.js'

/** Brand Book: overview, strategy, verbal, color, type, logo, governance. */
export const BRAND_BOOK: DocumentSpec = {
  kind: 'brand-book',
  title: 'Brand Book',
  sections: [
    {
      id: 'overview',
      title: 'Brand overview',
      purpose: 'What the brand is called, what it offers, and who it is for.',
      questions: ['business.identity.trade_name', 'brand.identity.public_name_override', 'brand.verbal.tagline', 'business.offer.summary', 'business.customer.primary_segment'],
    },
    {
      id: 'strategy',
      title: 'Strategy',
      purpose: 'Purpose, vision, values, differentiation and the promise the brand keeps.',
      questions: ['brand.strategy.purpose', 'brand.strategy.vision', 'brand.strategy.values', 'brand.strategy.differentiation', 'brand.strategy.promise', 'brand.personality.traits', 'brand.strategy.decision_rule'],
      guidance: true,
    },
    {
      id: 'verbal',
      title: 'Verbal identity',
      purpose: 'How the brand writes: name use, voice, do and don’t pairs, and forbidden language.',
      questions: ['brand.verbal.name_use', 'brand.verbal.voice', 'brand.verbal.voice_pairs', 'brand.verbal.forbidden', 'brand.verbal.microcopy', 'brand.verbal.localization'],
      guidance: true,
    },
    {
      id: 'color',
      title: 'Color',
      purpose: 'Color roles with their values, themes, semantic meaning and the contrast bar.',
      questions: ['brand.color.roles', 'brand.color.themes', 'brand.color.semantics', 'brand.color.contrast'],
      guidance: true,
    },
    {
      id: 'type',
      title: 'Typography',
      purpose: 'Type roles, families with fallbacks, licensing and writing-system support.',
      questions: ['brand.type.intent', 'brand.type.scale', 'brand.type.fallback', 'brand.type.license', 'brand.type.rtl'],
      guidance: true,
    },
    {
      id: 'logo',
      title: 'Logo',
      purpose: 'Variants, minimum size, clear space and misuse.',
      questions: ['brand.logo.variants', 'brand.logo.min_size', 'brand.logo.clear_space', 'brand.logo.misuse', 'brand.logo.masters'],
      guidance: true,
    },
    {
      id: 'governance',
      title: 'Governance',
      purpose: 'Who approves brand changes, how versions and deprecations work, and the rules for AI use.',
      questions: ['brand.gov.approver', 'brand.gov.versioning', 'brand.gov.deprecation', 'brand.gov.license', 'brand.gov.ai', 'brand.gov.cadence'],
      guidance: true,
    },
  ],
}

export function buildBrandBook(engine: InterviewEngine, audience: DocumentAudience): DocumentModel {
  return buildDocument(engine, BRAND_BOOK, audience)
}
