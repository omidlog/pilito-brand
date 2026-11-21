export { templateConfig } from './config.js'
export { allModules, allQuestions, moduleById } from './content/index.js'
export { buildMascotCatalog, CANONICAL_ANGLES, CORE_MOTIONS, EXAMPLE_STAGES, catalogCounts } from './content/mascot-catalog.js'
export { InterviewEngine, applyInit, dispositionFor, emptySession, assertSlug, upgradeCore, syncManifest, personalInit } from './engine.js'
export { completenessScope, listProfiles, loadProfile, profileErrors, UNIVERSAL_PROFILE } from './profiles.js'
export { PERSONAL_BRAND, PERSONAL_SHARED_QUESTIONS, STARTER_PROFILES } from './content/profiles.js'
export { canonicalReferenceErrors, ensureStarterProfiles, migratePersonal, PERSONAL_CANONICAL_REFERENCES } from './personal.js'
export type { CanonicalReference } from './personal.js'
export {
  addEvidence,
  claimVerification,
  EVIDENCE_KINDS,
  EVIDENCE_SOURCES,
  EVIDENCE_STATUSES,
  evidenceFor,
  evidencePath,
  gatePasses,
  publicationBlockers,
  readEvidence,
  unpublishBlocked,
} from './evidence.js'
export type { AddEvidenceInput, ClaimVerification, EvidenceItem, EvidenceKind, EvidenceSource, EvidenceStatus } from './evidence.js'
export { RIGHTS_SUBJECTS, rightsBlocker, rightsSubject } from './asset-rights.js'
export type { RightsSubject } from './asset-rights.js'
export { moduleEnabled, personalConfig } from './conditions.js'
export { PRIVATE_CUES, privateDataFindings, privateDataRefusal } from './personal-privacy.js'
export type { PrivateDataFinding, PrivateDataKind } from './personal-privacy.js'
export { OWNERSHIP_STATES, RELATION_TYPES } from './structured.js'
export type { OwnershipState, RelationshipEntry, RelationType } from './structured.js'
export type { InterviewProfile } from './profiles.js'
export {
  applyProposalBatch,
  INTAKE_LIMITS,
  intakeLogPath,
  ModelOutputSchema,
  openConflicts,
  openFollowUps,
  parseItems,
  parseProposalBatch,
  ProposalItemSchema,
  quotationIsVerbatim,
  readIntakeLog,
  SOURCE_KINDS,
} from './proposal-intake.js'
export type { DroppedItem, IntakeConflict, IntakeItemResult, IntakeOrigin, IntakeOutcome, IntakeReport, ParseResult, ProposalBatch, ProposalItem } from './proposal-intake.js'
export { nextReport } from './interview-next.js'
export { assistTurn, buildPrompt, extractionCatalog, parseModelOutput, redactRestricted, resolveProvider, WITHHELD } from './llm/extract.js'
export type { AssistResult } from './llm/extract.js'
export { AnthropicProvider, ANTHROPIC_DEFAULT_MODEL, ANTHROPIC_ENDPOINT } from './llm/anthropic.js'
export { MockProvider } from './llm/mock.js'
export { completeWithLimits, DEFAULT_LIMITS, limitsFrom, LLM_PROVIDERS, llmConfigErrors, llmConfigOf, LlmError, RequestBudget } from './llm/provider.js'
export type { CatalogQuestion, CompletionRequest, LlmConfig, LlmErrorKind, LlmLimits, ModelProvider } from './llm/provider.js'
export { clauses, detectLocale, extractByRules } from './llm/rules.js'
export type { NextQuestion, NextReport } from './interview-next.js'
export { backupBrand, migrateBrand, resetInterviewState, restoreBrand, RESET_CONFIRMATION } from './backup.js'
export { writeAtomic } from './fsutil.js'
export { authorize, agentContext, agentTokenContext, AGENT_PROFILES, guestContext, isAgentProfile, operatorContext, verifiedHumanContext } from './auth.js'
export type { AgentProfile, AuthContext, Audience, Role } from './auth.js'
export {
  AGENT_TOKEN_ENV,
  AgentTokenError,
  agentTokenPath,
  issueAgentToken,
  listAgentTokens,
  resolveAgentContext,
  revokeAgentToken,
} from './agent-tokens.js'
export type { AgentTokenSummary } from './agent-tokens.js'
export { accessLogPath, appendAccessLog, readAccessLog } from './access-log.js'
export type { AccessLogEntry } from './access-log.js'
export { approvalProofMatches } from './private-store.js'
export { compileModulePages } from './compile-docs.js'
export { readPublicationPolicy, factIsPublic, assetIsPublic, pageIsPublic } from './publication.js'
export { readFacts, writeFacts, migrateFactFiles } from './facts.js'
export { importFigmaVariables } from './figma.js'
export { allocateBudget, financeScenario } from './artifacts.js'
export { ensureApprovalSecret } from './private-store.js'
export { formatDoctor, runDoctor, MIN_NODE_MAJOR } from './doctor.js'
export type { DoctorCheck, DoctorReport, DoctorStatus } from './doctor.js'
export { renderBusinessArtifacts } from './artifacts.js'
export type { InitInput, StepResult, ImpactReport } from './engine.js'
export { writeStarterWorkspace } from './materialize.js'
export { completeness, latestAnswers } from './completeness.js'
export { findContradictions } from './contradictions.js'
export { buildDashboard, PUBLIC_DASHBOARD_NOTE } from './dashboard.js'
export type { Dashboard, DashboardContradiction, DashboardModule, DashboardReviewItem, InternalDashboard, PublicDashboardStub } from './dashboard.js'
export { approvalGrantErrors, APPROVAL_GRANTS, canApprove, isApprovalGrant, permissionFor } from './permissions.js'
export type { ApprovalGrant } from './permissions.js'
export { ApprovalService, readProposals } from './approval.js'
export type {
  ApprovalStep,
  BatchItemResult,
  BatchOutcome,
  BatchResult,
  ChangeProposal,
  PublishOutcome,
  PublishResult,
  ReviewItem,
  ReviewQueue,
  Selection,
} from './approval.js'
export {
  brandRetrieve,
  RETRIEVE_KINDS,
  getAssetMetadata,
  getBrandGuidelines,
  getBrandOverview,
  getBrandStatus,
  getBrandTokens,
  getBusinessPlan,
  getDesignComponent,
  getLogoRules,
  getMarketingPlan,
  getMascotGuidelines,
  getMascotProfile,
  getMotionGuidelines,
  getSocialTemplate,
  listMascotAssets,
  listMascotStages,
  resolveAgentRequest,
  searchBrandDocs,
  searchMascotAssets,
} from './query.js'
export type { MascotFilters, RetrieveKind, RetrieveRequest, RetrievedItem, ToolResult } from './query.js'
export { DRAFT_RULES, draftPersonalContent, MASCOT_FILTER_KEYS } from './query.js'
export { asciiDigits, isStructuredType, normalizeStructured, parseStructured, STRUCTURED_FORMATS, STRUCTURED_TYPES, structuredFor } from './structured.js'
export type { ColorEntry, FontEntry, LogoSpec, StructuredType, StructuredValue, VoicePair } from './structured.js'
export { BOOLEAN_WORDS, booleanWord } from './i18n.js'
export { approveTokens, generateTokens, publishTokens, readTokenApprovals, TOKEN_SOURCES } from './token-generate.js'
export type { GeneratedTokenResult, TokenGenerateReport, TokenOutcome, TokenReviewOutcome, TokenReviewResult } from './token-generate.js'
export {
  BRAND_BOOK,
  buildBrandBook,
  buildBusinessPlan,
  buildDocument,
  buildMarketingPlan,
  buildNamedDocument,
  BUSINESS_PLAN,
  DOCUMENT_KINDS,
  ITEM_TAGS,
  MARKETING_PLAN,
  renderDocumentMarkdown,
  buildEvidenceRegister,
  buildPersonalDocument,
  lengthReport,
  PERSONAL_DOCUMENT_KINDS,
  PERSONAL_SPECS,
} from './documents/index.js'
export type { DocumentAudience, DocumentItem, DocumentKind, DocumentModel, DocumentSection, DocumentSpec, ItemTag, LengthReport, PersonalDocumentKind, SectionSpec } from './documents/index.js'
export { evaluateCondition } from './conditions.js'
export { validateRepo } from './validate-repo.js'
export { PERSONAL_FACETS, PROPOSAL_STATES, PUBLICATION_REQUIREMENTS } from './types.js'
export type { BrandConfig, FieldQuestion, ModuleDef, AnswerRecord, PersonalFacet, PersonalModuleConfig, ProposalState, PublicationRequirement } from './types.js'
export {
  arr,
  breakEven,
  cac,
  churnRate,
  computeFinance,
  FINANCE_BASES,
  FINANCE_INPUTS,
  FINANCE_METRICS,
  FINANCE_PERIODS,
  FinanceInputError,
  formatFinanceReport,
  grossMarginPct,
  grossProfit,
  ltv,
  ltvToCac,
  mrr,
  netBurn,
  parseFinanceInputs,
  projectScenario,
  retentionRate,
  runway,
} from './finance.js'
export type { FinanceBasis, FinanceInputs, FinancePeriod, FinanceReport, FinanceResult, FinanceScenario, ScenarioResult } from './finance.js'
export { FinanceInputPathError, resolveFinanceInputPath, RESTRICTED_FINANCE_DIR, runFinanceFile } from './finance-input.js'
export { isMascotLifecycle, MASCOT_LIFECYCLE, migrateMascotCatalog, validateMascotLifecycle } from './mascot-lifecycle.js'
export type { MascotArtwork, MascotLifecycle, MascotMigration } from './mascot-lifecycle.js'
