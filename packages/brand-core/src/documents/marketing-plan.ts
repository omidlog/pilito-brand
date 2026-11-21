import type { InterviewEngine } from '../engine.js'
import { buildDocument, type DocumentAudience, type DocumentModel, type DocumentSpec } from './model.js'

/** Marketing plan on the same section model. Budgets are restricted and never shown. */
export const MARKETING_PLAN: DocumentSpec = {
  kind: 'marketing-plan',
  title: 'Marketing plan',
  sections: [
    {
      id: 'objectives',
      title: 'Objectives',
      purpose: 'What marketing must achieve and the metric that proves it.',
      questions: ['business.marketing.objective', 'business.goals.north_star'],
      guidance: true,
    },
    {
      id: 'audience',
      title: 'Audience and journey',
      purpose: 'Who is reached, who buys, and the path from first contact to value.',
      questions: ['business.customer.primary_segment', 'business.sales.buyer', 'business.marketing.journey'],
    },
    {
      id: 'messaging',
      title: 'Positioning and messaging',
      purpose: 'Differentiation, promise, content pillars and the voice to use.',
      questions: ['brand.strategy.differentiation', 'brand.strategy.promise', 'business.marketing.pillars', 'brand.verbal.voice_pairs'],
    },
    {
      id: 'channels',
      title: 'Channels',
      purpose: 'Where the brand shows up.',
      questions: ['business.marketing.channels', 'brand.social.channels'],
    },
    {
      id: 'measurement',
      title: 'Budget and measurement',
      purpose: 'Budget (restricted), attribution and tracking conventions.',
      questions: ['business.marketing.budget', 'business.marketing.attribution', 'business.marketing.utm'],
      guidance: true,
    },
    {
      id: 'guardrails',
      title: 'Claims guardrails',
      purpose: 'What campaigns may claim and what they must never say.',
      questions: ['business.marketing.availability_claim', 'brand.verbal.forbidden', 'brand.campaign.offer_source'],
    },
  ],
}

export function buildMarketingPlan(engine: InterviewEngine, audience: DocumentAudience): DocumentModel {
  return buildDocument(engine, MARKETING_PLAN, audience)
}
