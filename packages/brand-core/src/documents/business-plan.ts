import type { InterviewEngine } from '../engine.js'
import { buildDocument, type DocumentAudience, type DocumentModel, type DocumentSpec } from './model.js'

/**
 * Business plan summary. Financial figures are restricted answers: an internal edition shows that
 * they are approved or drafted, never the value. No market size or result is ever filled in.
 */
export const BUSINESS_PLAN: DocumentSpec = {
  kind: 'business-plan',
  title: 'Business plan summary',
  sections: [
    {
      id: 'executive-summary',
      title: 'Executive summary',
      purpose: 'The business, its offer, its stage and the next milestone.',
      questions: ['business.identity.trade_name', 'business.offer.summary', 'business.offer.value_proposition', 'business.stage.current', 'business.plan.milestone'],
    },
    {
      id: 'customer-problem',
      title: 'Customer and problem',
      purpose: 'Who the customer is, where, and which pains the offer addresses.',
      questions: ['business.customer.primary_segment', 'business.problem.pains', 'business.market.geography'],
      guidance: true,
    },
    {
      id: 'business-model',
      title: 'Business model',
      purpose: 'How the business earns money, sells, prices and defends its position.',
      questions: ['business.model.revenue', 'business.sales.motion', 'business.sales.pricing', 'business.model.defensibility'],
      guidance: true,
    },
    {
      id: 'product',
      title: 'Product',
      purpose: 'What ships first, its public status and the roadmap.',
      questions: ['business.product.mvp', 'business.product.public_status', 'business.product.roadmap'],
    },
    {
      id: 'financials',
      title: 'Financial plan',
      purpose: 'Currency, basis and the restricted figures. Figures are withheld from documents.',
      questions: ['business.finance.currency', 'business.finance.basis', 'business.finance.revenue_figure', 'business.finance.costs', 'business.finance.runway'],
      guidance: true,
    },
    {
      id: 'goals',
      title: 'Goals and KPIs',
      purpose: 'Annual and quarterly goals and the north-star metric.',
      questions: ['business.goals.annual', 'business.goals.quarter', 'business.goals.north_star'],
    },
    {
      id: 'risks',
      title: 'Risks and dependencies',
      purpose: 'Known risks and how they are reviewed.',
      questions: ['business.plan.risks', 'business.partners.risk_process'],
    },
  ],
}

export function buildBusinessPlan(engine: InterviewEngine, audience: DocumentAudience): DocumentModel {
  return buildDocument(engine, BUSINESS_PLAN, audience)
}
