import type { InterviewEngine } from '../engine.js'
import { buildBrandBook } from './brand-book.js'
import { buildBusinessPlan } from './business-plan.js'
import { buildMarketingPlan } from './marketing-plan.js'
import { PERSONAL_DOCUMENT_KINDS, type DocumentAudience, type DocumentKind, type DocumentModel, type PersonalDocumentKind } from './model.js'
import { buildPersonalDocument } from './personal.js'

export { BRAND_BOOK, buildBrandBook } from './brand-book.js'
export { BUSINESS_PLAN, buildBusinessPlan } from './business-plan.js'
export { MARKETING_PLAN, buildMarketingPlan } from './marketing-plan.js'
export { buildDocument, ITEM_TAGS, itemFor, lengthReport, PERSONAL_DOCUMENT_KINDS } from './model.js'
export { buildEvidenceRegister, buildPersonalDocument, PERSONAL_SPECS } from './personal.js'
export type { DocumentAudience, DocumentItem, DocumentKind, DocumentModel, DocumentSection, DocumentSpec, ItemTag, LengthReport, PersonalDocumentKind, SectionSpec } from './model.js'
export { renderDocumentMarkdown } from './markdown.js'

export const DOCUMENT_KINDS: readonly DocumentKind[] = ['brand-book', 'business-plan', 'marketing-plan', ...PERSONAL_DOCUMENT_KINDS]

export function buildNamedDocument(engine: InterviewEngine, kind: DocumentKind, audience: DocumentAudience): DocumentModel {
  if ((PERSONAL_DOCUMENT_KINDS as readonly string[]).includes(kind)) return buildPersonalDocument(engine, kind as PersonalDocumentKind, audience)
  if (kind === 'brand-book') return buildBrandBook(engine, audience)
  if (kind === 'business-plan') return buildBusinessPlan(engine, audience)
  return buildMarketingPlan(engine, audience)
}
