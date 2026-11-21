import fs from 'node:fs'
import type http from 'node:http'
import type https from 'node:https'
import os from 'node:os'
import path from 'node:path'

/**
 * Cleanup for tests: temporary directories, servers and teardown that always runs to the end.
 *
 * `tempDir()` creates a directory under the OS temp dir and remembers it. Tests may remove it
 * themselves (`removeTempDir`); anything left is removed when the test process exits, including
 * after a failed assertion or a forced exit (`--test-force-exit`). Nothing a test creates should
 * outlive the run.
 */
const created = new Set<string>()
let hooked = false

export function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  created.add(dir)
  if (!hooked) {
    hooked = true
    process.once('exit', removeAllTempDirs)
  }
  return dir
}

/** Removes a directory; retries while a just-stopped process finishes writing; never throws. */
export function removeTempDir(dir: string): void {
  created.delete(dir)
  try {
    // A test may have made it read-only to provoke an error; restore access so it can be removed.
    if (fs.existsSync(dir)) fs.chmodSync(dir, 0o700)
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  } catch (error) {
    process.emitWarning(`could not remove ${dir}: ${(error as Error).message}`)
  }
}

export function removeAllTempDirs(): void {
  for (const dir of [...created]) removeTempDir(dir)
}

/**
 * Closes an HTTP(S) server without waiting on keep-alive or in-flight connections, which would
 * otherwise hold `server.close()` (and the test process) open indefinitely.
 */
export async function closeServer(server: http.Server | https.Server): Promise<void> {
  if (!server.listening) return
  const closed = new Promise<void>((resolve) => server.close(() => resolve()))
  server.closeAllConnections()
  await closed
}

/**
 * Runs every teardown step even when an earlier one fails, then reports the failures. A throwing
 * first step must never leave a later server listening: that keeps the test process alive forever.
 */
export async function teardown(...steps: Array<(() => unknown) | undefined>): Promise<void> {
  const errors: unknown[] = []
  for (const step of steps) {
    try {
      await step?.()
    } catch (error) {
      errors.push(error)
    }
  }
  if (errors.length === 1) throw errors[0]
  if (errors.length > 1) throw new AggregateError(errors, 'teardown failed')
}
