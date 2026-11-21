import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { computeFinance, parseFinanceInputs, type FinanceReport } from './finance.js'

/** Gitignored home for finance input files kept inside the checkout. Referenced as `restricted:<name>`. */
export const RESTRICTED_FINANCE_DIR = 'brand/restricted/finance'
const MAX_BYTES = 1_000_000

export class FinanceInputPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FinanceInputPathError'
  }
}

function gitSucceeds(root: string, args: string[]): boolean {
  try {
    execFileSync('git', args, { cwd: root, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function inside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

/**
 * Resolves `--input` to a real file path that is safe to read finance data from.
 *
 * Accepted: a file outside the repository, or `restricted:<name>` (a file under `brand/restricted/finance/`).
 * Any file inside the repository must be ignored by Git and untracked. When Git cannot answer, files inside
 * the repository are refused. Financial records never belong in tracked directories.
 */
export function resolveFinanceInputPath(root: string, input: string): string {
  if (!input) throw new FinanceInputPathError('Need --input <file outside the repository> or restricted:<name>.')
  let candidate: string
  if (input.startsWith('restricted:')) {
    const name = input.slice('restricted:'.length)
    if (!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(name) || name.includes('..')) throw new FinanceInputPathError('restricted:<name> takes a plain file name such as restricted:q3-actuals')
    const base = path.join(root, RESTRICTED_FINANCE_DIR, name)
    candidate = ['', '.yaml', '.yml', '.json'].map((ext) => `${base}${ext}`).find((file) => fs.existsSync(file)) ?? `${base}.yaml`
  } else {
    candidate = path.resolve(input)
  }
  if (!fs.existsSync(candidate)) throw new FinanceInputPathError(`Finance input not found: ${input}`)
  const real = fs.realpathSync(candidate)
  if (!fs.statSync(real).isFile()) throw new FinanceInputPathError('Finance input must be a regular file.')
  const repo = fs.realpathSync(root)
  if (inside(repo, real)) {
    const relative = path.relative(repo, real)
    const gitKnown = gitSucceeds(repo, ['rev-parse', '--is-inside-work-tree'])
    const tracked = gitKnown && gitSucceeds(repo, ['ls-files', '--error-unmatch', '--', relative])
    const ignored = gitKnown && gitSucceeds(repo, ['check-ignore', '-q', '--no-index', '--', relative])
    if (!gitKnown || tracked || !ignored) {
      throw new FinanceInputPathError(
        `Refusing ${relative}: finance inputs inside the repository must be gitignored and untracked. Keep the file outside the checkout or under ${RESTRICTED_FINANCE_DIR}/ (gitignored).`,
      )
    }
  }
  if (fs.statSync(real).size > MAX_BYTES) throw new FinanceInputPathError('Finance input is larger than 1 MB.')
  return real
}

/** Reads, validates and computes. Throws `FinanceInputPathError` or `FinanceInputError` without echoing file contents. */
export function runFinanceFile(root: string, input: string): FinanceReport {
  const file = resolveFinanceInputPath(root, input)
  let raw: unknown
  try {
    raw = parse(fs.readFileSync(file, 'utf8'))
  } catch {
    throw new FinanceInputPathError('Finance input is not valid YAML or JSON.')
  }
  return computeFinance(parseFinanceInputs(raw))
}
