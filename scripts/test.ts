import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Runs the test suite so that it always ends and leaves nothing behind:
 *
 * - every test gets a deadline (`--test-timeout`) and the runner exits even if a handle stays open
 *   (`--test-force-exit`);
 * - the whole run has a deadline (BRAND_OS_TEST_TIMEOUT_MS, default 15 minutes). When it passes, the
 *   runner and every process it started (Studio servers, Chrome and its helpers) are killed and the
 *   run fails with a clear message instead of hanging a CI job for hours;
 * - TMPDIR points at a fresh directory for the run, removed at the end, so no test can leave a
 *   directory in the system temp dir, whatever it does or however it fails.
 *
 * Suites (a brand repo's CI runs only `brand`; Studio is developed and tested in the template):
 *
 *   tsx scripts/test.ts                  brand suite: every tests/*.test.ts except tests/studio-*
 *   tsx scripts/test.ts --suite studio   Studio server, sync, provisioning and browser tests
 *   tsx scripts/test.ts --suite all      everything (npm run test:full)
 *   tsx scripts/test.ts <files...>       just these files
 */
const PER_TEST_MS = 180_000
const totalMs = Number(process.env.BRAND_OS_TEST_TIMEOUT_MS ?? 15 * 60_000)

const args = process.argv.slice(2)
const suiteArg = args.find((arg) => arg.startsWith('--suite'))
const suite = suiteArg?.includes('=') ? suiteArg.split('=')[1] : suiteArg ? args[args.indexOf(suiteArg) + 1] : 'brand'
if (!['brand', 'studio', 'all'].includes(suite!)) {
  console.error(`[test] unknown suite '${suite}' (brand | studio | all)`)
  process.exit(2)
}
const files = args.filter((arg, i) => !arg.startsWith('--suite') && !(suiteArg === '--suite' && i === args.indexOf(suiteArg) + 1))
if (files.length === 0) {
  for (const name of fs.readdirSync('tests').sort()) {
    if (!name.endsWith('.test.ts')) continue
    const studio = name.startsWith('studio-')
    if (suite === 'all' || (suite === 'studio') === studio) files.push(path.join('tests', name))
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-os-test-'))
const child = spawn(process.execPath, ['--import', 'tsx', '--test', `--test-timeout=${PER_TEST_MS}`, '--test-force-exit', ...files], {
  stdio: 'inherit',
  // Its own process group, so a timeout or Ctrl-C can stop every descendant at once.
  detached: true,
  env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
})

function killGroup(signal: NodeJS.Signals): void {
  try {
    if (child.pid) process.kill(-child.pid, signal)
  } catch {
    // already gone
  }
}

let timedOut = false
const deadline = setTimeout(() => {
  timedOut = true
  console.error(`\n[test] the suite did not finish within ${totalMs / 1000} s; stopping it and every process it started.`)
  killGroup('SIGTERM')
  setTimeout(() => killGroup('SIGKILL'), 5_000).unref()
}, totalMs)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    killGroup(signal)
    setTimeout(() => killGroup('SIGKILL'), 5_000).unref()
  })
}

child.on('exit', (code, signal) => {
  clearTimeout(deadline)
  // Helpers (e.g. Chrome's) may outlive the runner; nothing of this run may keep going.
  killGroup('SIGKILL')
  try {
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  } catch (error) {
    console.error(`[test] could not remove ${tmp}: ${(error as Error).message}`)
  }
  if (timedOut) process.exit(1)
  process.exit(code ?? (signal ? 1 : 0))
})
