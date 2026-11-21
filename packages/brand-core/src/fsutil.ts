import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'

export function readYaml<T>(file: string): T {
  return parse(fs.readFileSync(file, 'utf8')) as T
}

/**
 * Crash-safe write: the bytes go to a temp file in the same directory, are fsynced, and then
 * renamed over the target. A reader sees either the old file or the new file, never a partial one.
 * The temp file is removed if any step fails. `mode` applies to the new file (for example 0o600).
 */
export function writeAtomic(file: string, contents: string | Buffer, options: { mode?: number } = {}): void {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(tmp, 'wx', options.mode ?? 0o644)
    fs.writeFileSync(fd, contents)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    if (options.mode !== undefined) fs.chmodSync(tmp, options.mode)
    fs.renameSync(tmp, file)
  } catch (error) {
    if (fd !== null) fs.closeSync(fd)
    fs.rmSync(tmp, { force: true })
    throw error
  }
  syncDirectory(dir)
}

/** Best effort: persist the rename itself. Some platforms (Windows) cannot open a directory. */
function syncDirectory(dir: string): void {
  let fd: number | null = null
  try {
    fd = fs.openSync(dir, 'r')
    fs.fsyncSync(fd)
  } catch {
    // Directory fsync is not supported everywhere. The file contents were already fsynced.
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function withNewline(text: string): string {
  return text.endsWith('\n') ? text : `${text}\n`
}

export function writeYaml(file: string, data: unknown): void {
  writeAtomic(file, withNewline(stringify(data, { lineWidth: 100 })))
}

export function writeText(file: string, text: string): void {
  writeAtomic(file, withNewline(text))
}

export function readText(file: string): string {
  return fs.readFileSync(file, 'utf8')
}

export function exists(file: string): boolean {
  return fs.existsSync(file)
}
