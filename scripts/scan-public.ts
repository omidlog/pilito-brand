import fs from 'node:fs'
import path from 'node:path'

const FORBIDDEN = ['RESTRICTED_CANARY_DO_NOT_PUBLISH', 'CANARY-INTERNAL', 'CANARY-SESSION', 'CANARY-B-RESTRICTED', 'secret-figure-99', 'brand-os-agent-tokens/1']
/** Files from brand/.private must never ship, whatever they are renamed into. */
const FORBIDDEN_NAMES = new Set(['agent-tokens.json', 'access-log.jsonl', 'approval-secret', 'store.json'])
/** A raw agent token (prefix plus 43 base64url characters). Prose that only names the prefix does not match. */
const RAW_TOKEN = /bos_at_[A-Za-z0-9_-]{40,}/

export function scanPublicTree(root: string): string[] {
  const hits: string[] = []
  if (!fs.existsSync(root)) return [`missing ${root}`]
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile()) {
        if (FORBIDDEN_NAMES.has(entry.name)) hits.push(`${path.relative(root, full)} is a private Brand OS file`)
        const text = fs.readFileSync(full)
        const asString = text.toString('utf8')
        for (const needle of FORBIDDEN) {
          if (asString.includes(needle)) hits.push(`${path.relative(root, full)} contains ${needle}`)
        }
        if (RAW_TOKEN.test(asString)) hits.push(`${path.relative(root, full)} contains an agent token`)
      }
    }
  }
  walk(root)
  return hits
}

const isEntry = process.argv[1]?.includes('scan-public')
if (isEntry) {
  const target = process.argv[2] ?? 'apps/docs/build'
  const hits = scanPublicTree(path.resolve(target))
  if (hits.length > 0) {
    console.error(hits.join('\n'))
    process.exit(1)
  }
  console.log(`Public scan passed for ${target}.`)
}
