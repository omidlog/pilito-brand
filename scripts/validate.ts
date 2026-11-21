import { validateRepo } from '@brand-os/brand-core'

const report = validateRepo(process.cwd())
for (const warning of report.warnings) console.warn(`warning: ${warning}`)
if (!report.ok) {
  console.error(report.errors.join('\n'))
  process.exit(1)
}
console.log(`Validation passed with ${report.warnings.length} warning(s).`)
