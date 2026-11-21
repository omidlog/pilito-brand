import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { approvalSecretPath } from './private-store.js'

export type DoctorStatus = 'pass' | 'warn' | 'fail'

export interface DoctorCheck {
  id: 'node' | 'data_key' | 'approval_secret' | 'config' | 'publication_policy' | 'env_ignored'
  status: DoctorStatus
  message: string
  hint?: string
}

export interface DoctorReport {
  ok: boolean
  checks: DoctorCheck[]
}

export interface DoctorOptions {
  /** Defaults to process.env. Only presence and decoded length are ever reported. */
  env?: NodeJS.ProcessEnv
  /** Defaults to process.versions.node. */
  nodeVersion?: string
  platform?: NodeJS.Platform
}

export const MIN_NODE_MAJOR = 22
const KEY_HINT = 'Generate one with: node -e "console.log(require(\'node:crypto\').randomBytes(32).toString(\'base64\'))" then export BRAND_OS_DATA_KEY in your shell or secret manager. Scripts do not load .env automatically. Never commit it.'

/**
 * Read-only environment checks for a brand workspace. No check prints a secret: the data key is
 * reported by presence and decoded length, the approval secret by presence and file mode.
 */
export function runDoctor(root: string, options: DoctorOptions = {}): DoctorReport {
  const env = options.env ?? process.env
  const checks: DoctorCheck[] = [
    checkNode(options.nodeVersion ?? process.versions.node),
    checkDataKey(env.BRAND_OS_DATA_KEY),
    checkApprovalSecret(root, options.platform ?? process.platform),
    ...checkConfigAndPolicy(root),
    checkEnvIgnored(root),
  ]
  return { ok: checks.every((check) => check.status !== 'fail'), checks }
}

function checkNode(version: string): DoctorCheck {
  const major = Number(version.replace(/^v/, '').split('.')[0])
  if (!Number.isInteger(major) || major < MIN_NODE_MAJOR) {
    return { id: 'node', status: 'fail', message: `Node ${version} is older than the required ${MIN_NODE_MAJOR}.`, hint: `Install Node ${MIN_NODE_MAJOR} or newer.` }
  }
  return { id: 'node', status: 'pass', message: `Node ${version} meets >=${MIN_NODE_MAJOR}.` }
}

function checkDataKey(raw: string | undefined): DoctorCheck {
  if (!raw) {
    return {
      id: 'data_key',
      status: 'fail',
      message: 'BRAND_OS_DATA_KEY is not set. Restricted answers and backups fail closed without it.',
      hint: KEY_HINT,
    }
  }
  const trimmed = raw.trim()
  const canonical = /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0
  const length = canonical ? Buffer.from(trimmed, 'base64').length : 0
  if (length !== 32) {
    return {
      id: 'data_key',
      status: 'fail',
      message: canonical
        ? `BRAND_OS_DATA_KEY is set but decodes to ${length} bytes, not 32.`
        : 'BRAND_OS_DATA_KEY is set but is not valid base64.',
      hint: KEY_HINT,
    }
  }
  return { id: 'data_key', status: 'pass', message: 'BRAND_OS_DATA_KEY is set and decodes to 32 bytes. The value is not shown.' }
}

function checkApprovalSecret(root: string, platform: NodeJS.Platform): DoctorCheck {
  const file = approvalSecretPath(root)
  const relative = path.relative(root, file)
  let stat: fs.Stats
  try {
    stat = fs.lstatSync(file)
  } catch {
    return {
      id: 'approval_secret',
      status: 'warn',
      message: `${relative} does not exist. Nothing can be approved until it does.`,
      hint: 'Create it with: npm run brand:doctor -- --create-approval-secret',
    }
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    return { id: 'approval_secret', status: 'fail', message: `${relative} is not a regular file.`, hint: 'Replace it with a regular file readable only by the owner.' }
  }
  if (fs.readFileSync(file, 'utf8').trim().length === 0) {
    return { id: 'approval_secret', status: 'fail', message: `${relative} is empty.`, hint: 'Delete it and run: npm run brand:doctor -- --create-approval-secret' }
  }
  if (platform !== 'win32') {
    const mode = stat.mode & 0o777
    if (mode !== 0o600) {
      return {
        id: 'approval_secret',
        status: 'fail',
        message: `${relative} has mode ${mode.toString(8).padStart(4, '0')}, expected 0600.`,
        hint: `chmod 600 ${relative}`,
      }
    }
  }
  return { id: 'approval_secret', status: 'pass', message: `${relative} exists${platform === 'win32' ? '' : ' with mode 0600'}. The value is not shown.` }
}

function checkConfigAndPolicy(root: string): DoctorCheck[] {
  const configFile = path.join(root, 'brand', 'brand.config.yaml')
  let slug: string | null = null
  let config: DoctorCheck
  try {
    const parsed = parse(fs.readFileSync(configFile, 'utf8')) as { brand?: { slug?: unknown } } | null
    if (!parsed || typeof parsed !== 'object' || typeof parsed.brand?.slug !== 'string' || !parsed.brand.slug) {
      config = { id: 'config', status: 'fail', message: 'brand/brand.config.yaml parses but has no brand.slug.' }
    } else {
      slug = parsed.brand.slug
      config = { id: 'config', status: 'pass', message: `brand/brand.config.yaml parses. Brand id: ${slug}.` }
    }
  } catch {
    config = fs.existsSync(configFile)
      ? { id: 'config', status: 'fail', message: 'brand/brand.config.yaml does not parse as YAML.' }
      : { id: 'config', status: 'fail', message: 'brand/brand.config.yaml is missing.', hint: 'Run npm run brand:init.' }
  }

  const policyFile = path.join(root, 'brand', 'publication-policy.yaml')
  let policy: DoctorCheck
  if (!fs.existsSync(policyFile)) {
    policy = { id: 'publication_policy', status: 'warn', message: 'brand/publication-policy.yaml is missing. Nothing will be published.' }
  } else {
    try {
      const parsed = parse(fs.readFileSync(policyFile, 'utf8')) as { brand_id?: unknown } | null
      const brandId = parsed && typeof parsed === 'object' ? parsed.brand_id : undefined
      if (typeof brandId !== 'string') {
        policy = { id: 'publication_policy', status: 'fail', message: 'brand/publication-policy.yaml has no brand_id.' }
      } else if (slug === null) {
        policy = { id: 'publication_policy', status: 'warn', message: 'Cannot compare the publication policy brand_id without a valid config.' }
      } else if (brandId !== slug) {
        policy = {
          id: 'publication_policy',
          status: 'fail',
          message: `publication-policy brand_id "${brandId}" does not match config slug "${slug}". Public builds refuse to run.`,
          hint: 'The policy may have been copied from another brand. Reset its allowlists and set brand_id to this slug.',
        }
      } else {
        policy = { id: 'publication_policy', status: 'pass', message: 'publication-policy brand_id matches the config slug.' }
      }
    } catch {
      policy = { id: 'publication_policy', status: 'fail', message: 'brand/publication-policy.yaml does not parse as YAML.' }
    }
  }
  return [config, policy]
}

function checkEnvIgnored(root: string): DoctorCheck {
  const git = gitAvailable(root)
  if (git) {
    if (gitSucceeds(root, ['ls-files', '--error-unmatch', '.env'])) {
      return { id: 'env_ignored', status: 'fail', message: '.env is tracked by Git.', hint: 'git rm --cached .env, then rotate every secret it held.' }
    }
    if (gitSucceeds(root, ['check-ignore', '-q', '.env'])) return { id: 'env_ignored', status: 'pass', message: '.env is ignored by Git.' }
    return { id: 'env_ignored', status: 'fail', message: '.env is not ignored by Git.', hint: 'Add .env to .gitignore.' }
  }
  const gitignore = path.join(root, '.gitignore')
  const lines = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, 'utf8').split(/\r?\n/).map((line) => line.trim()) : []
  if (lines.some((line) => ['.env', '/.env', '.env*'].includes(line))) {
    return { id: 'env_ignored', status: 'pass', message: '.env is listed in .gitignore (not a Git checkout, so Git was not asked).' }
  }
  return { id: 'env_ignored', status: 'warn', message: 'Not a Git checkout and .gitignore does not list .env.', hint: 'Add .env to .gitignore before you initialize Git.' }
}

function gitAvailable(root: string): boolean {
  return gitSucceeds(root, ['rev-parse', '--is-inside-work-tree'])
}

function gitSucceeds(root: string, args: string[]): boolean {
  try {
    execFileSync('git', args, { cwd: root, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function formatDoctor(report: DoctorReport): string {
  const mark: Record<DoctorStatus, string> = { pass: 'PASS', warn: 'WARN', fail: 'FAIL' }
  const lines = report.checks.flatMap((check) => [`[${mark[check.status]}] ${check.id}: ${check.message}`, ...(check.hint && check.status !== 'pass' ? [`       ${check.hint}`] : [])])
  lines.push(report.ok ? 'Doctor found no hard failures.' : 'Doctor found hard failures. Fix the FAIL lines above.')
  return lines.join('\n')
}
