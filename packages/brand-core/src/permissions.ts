import type { FieldQuestion } from './types.js'

export type ApprovalGrant = 'financial' | 'visual' | 'public_copy' | 'canonical'

export const APPROVAL_GRANTS: readonly ApprovalGrant[] = ['financial', 'visual', 'public_copy', 'canonical']

const GRANTS: Record<string, ApprovalGrant[]> = {
  owner: ['financial', 'visual', 'public_copy', 'canonical'],
  design: ['visual'],
  finance: ['financial'],
  marketing: ['public_copy'],
  guest: [],
}

export function isApprovalGrant(value: unknown): value is ApprovalGrant {
  return typeof value === 'string' && (APPROVAL_GRANTS as readonly string[]).includes(value)
}

/**
 * The grant a reviewer needs to approve this question. An explicit `approval_grant` in the question
 * bank wins over the id-based guess. Restricted questions always need `financial`, even when the bank
 * says otherwise: validation reports that mismatch, and this function fails safe instead of widening.
 */
export function permissionFor(question: FieldQuestion): ApprovalGrant {
  if (question.sensitivity === 'restricted') return 'financial'
  if (question.approval_grant !== undefined) {
    if (isApprovalGrant(question.approval_grant)) return question.approval_grant
    // Unknown grant value: require the narrowest owner-only path rather than guessing.
    return 'financial'
  }
  return guessedPermission(question)
}

function guessedPermission(question: FieldQuestion): ApprovalGrant {
  if (
    question.id.includes('finance') ||
    question.id.includes('pricing') ||
    question.id.includes('budget') ||
    question.id.includes('.share')
  ) {
    return 'financial'
  }
  const visualModules = new Set([
    'logo-system',
    'color-system',
    'typography',
    'mascot-identity',
    'mascot-expression',
    'mascot-evolution',
    'illustration',
    'iconography',
    'motion',
    'photo-video',
    'layout',
  ])
  if (visualModules.has(question.module)) return 'visual'
  if (question.sensitivity === 'public') return 'public_copy'
  return 'canonical'
}

/** Validation messages for an explicit grant. Empty when the question is consistent. */
export function approvalGrantErrors(question: FieldQuestion): string[] {
  if (question.approval_grant === undefined) return []
  if (!isApprovalGrant(question.approval_grant)) return [`${question.id} has unknown approval_grant ${String(question.approval_grant)}`]
  if (question.sensitivity === 'restricted' && question.approval_grant !== 'financial') {
    return [`${question.id} is restricted and must use approval_grant financial, not ${question.approval_grant}`]
  }
  return []
}

export function canApprove(actor: string, question: FieldQuestion): boolean {
  return (GRANTS[actor] ?? []).includes(permissionFor(question))
}
