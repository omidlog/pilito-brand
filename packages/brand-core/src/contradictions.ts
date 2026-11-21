import type { AnswerRecord, Contradiction, FieldQuestion } from './types.js'

function text(answer: AnswerRecord | undefined): string | null {
  if (!answer || answer.value === null || answer.value === undefined) return null
  if (answer.status === 'unknown' || answer.status === 'skipped' || answer.status === 'not_applicable') return null
  return String(answer.value).trim()
}

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function findContradictions(
  questions: FieldQuestion[],
  answers: Map<string, AnswerRecord>,
  mascotEnabled: boolean,
  gamificationEnabled: boolean,
): Contradiction[] {
  const items: Contradiction[] = []
  const trade = text(answers.get('business.identity.trade_name'))
  const override = text(answers.get('brand.identity.public_name_override'))
  if (trade && override && override.toLowerCase() !== 'same' && !sameName(trade, override)) {
    items.push({
      id: 'con-name-divergence',
      rule: 'name-divergence',
      severity: 'medium',
      message: `Trade name "${trade}" and public name "${override}" differ. Keep both only if that split is intentional. Neither value was invented by the template.`,
      fields: ['business.identity.trade_name', 'brand.identity.public_name_override'],
      status: 'open',
    })
  }

  const availability = text(answers.get('business.marketing.availability_claim'))
  const productStatus = text(answers.get('business.product.public_status'))
  if (availability === 'available' && productStatus === 'unshipped') {
    items.push({
      id: 'con-unshipped-claim',
      rule: 'unshipped-marketed-as-available',
      severity: 'high',
      message: 'Marketing availability is "available" while product public status is "unshipped". Public creative must not outrun the product record.',
      fields: ['business.marketing.availability_claim', 'business.product.public_status'],
      status: 'open',
    })
  }

  for (const [id, answer] of answers) {
    if (answer.status !== 'approved' || answer.value === null) continue
    const value = String(answer.value).trim()
    if (/^(tbd|example|example only)$/i.test(value)) {
      items.push({
        id: `con-approved-placeholder-${id}`,
        rule: 'approved-placeholder',
        severity: 'high',
        message: `${id} is approved but the value is still a placeholder (${value}). Withdraw approval or replace the value.`,
        fields: [id],
        status: 'open',
      })
    }
  }

  const byId = new Map(questions.map((question) => [question.id, question]))
  if (!mascotEnabled) {
    for (const [id, answer] of answers) {
      const question = byId.get(id)
      if (!question || question.module === 'mascot-identity' && question.id === 'brand.mascot.enabled') continue
      if (question?.id.startsWith('brand.mascot.') && answer.status === 'approved') {
        items.push({
          id: `con-mascot-approved-while-disabled-${id}`,
          rule: 'module-disabled-with-approval',
          severity: 'high',
          message: `${id} is approved while the mascot module is off. Disablement does not delete history, but approved character rules should be re-checked.`,
          fields: [id, 'brand.mascot.enabled'],
          status: 'open',
        })
      }
    }
  }
  if (!gamificationEnabled) {
    for (const [id, answer] of answers) {
      if (id === 'brand.gamification.enabled') continue
      if (id.startsWith('brand.gamification.') && answer.status === 'approved') {
        items.push({
          id: `con-game-approved-while-disabled-${id}`,
          rule: 'module-disabled-with-approval',
          severity: 'high',
          message: `${id} is approved while gamification is off.`,
          fields: [id, 'brand.gamification.enabled'],
          status: 'open',
        })
      }
    }
  }

  return items
}
