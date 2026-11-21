export interface FigmaProposal {
  id: string
  proposed_value: string
  source_node: string
}

export interface FigmaImportResult {
  status: 'not_configured' | 'proposal'
  reason: string
  proposals: FigmaProposal[]
  wrote_canonical: false
}

/**
 * Live Figma sync is not configured unless FIGMA_TOKEN and FIGMA_FILE_KEY are set.
 * A fixture import still returns proposals and never writes approved tokens.
 */
export function importFigmaVariables(fixture: { variables?: Array<{ id: string; value: string; node?: string }> } | null, env: NodeJS.ProcessEnv = process.env): FigmaImportResult {
  if (!env.FIGMA_TOKEN || !env.FIGMA_FILE_KEY) {
    return { status: 'not_configured', reason: 'FIGMA_TOKEN and FIGMA_FILE_KEY are absent. No token file was written.', proposals: [], wrote_canonical: false }
  }
  const proposals = (fixture?.variables ?? []).map((variable) => ({
    id: variable.id,
    proposed_value: variable.value,
    source_node: variable.node ?? 'unspecified',
  }))
  return {
    status: 'proposal',
    reason: 'Figma values are proposals. Approved tokens were not overwritten.',
    proposals,
    wrote_canonical: false,
  }
}
