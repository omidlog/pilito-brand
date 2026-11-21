import fs from 'node:fs'
import path from 'node:path'
import { compileTokens, tokenExplorerData } from './compile.js'

const root = process.cwd()
const compiled = compileTokens(root)
if (compiled.errors.length > 0) {
  console.error(compiled.errors.join('\n'))
  process.exit(1)
}
const outDir = path.join(root, 'packages', 'design-tokens', 'dist')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'tokens.css'), compiled.css)
fs.writeFileSync(path.join(outDir, 'tokens.ts'), compiled.typescript)
fs.mkdirSync(path.join(root, 'apps', 'docs', 'src', 'css'), { recursive: true })
fs.mkdirSync(path.join(root, 'apps', 'docs', 'src', 'data'), { recursive: true })
fs.writeFileSync(path.join(root, 'apps', 'docs', 'src', 'css', 'tokens.css'), compiled.css)
fs.writeFileSync(path.join(root, 'apps', 'docs', 'src', 'data', 'tokens.json'), `${JSON.stringify(tokenExplorerData(compiled), null, 2)}\n`)
const names = Object.keys(compiled.flat).sort()
fs.writeFileSync(
  path.join(root, 'brand', 'tokens', 'figma-variables.snapshot.json'),
  `${JSON.stringify({ status: 'EXAMPLE', note: 'Local stand-in for a Figma variables export. Not a live Figma connection.', variables: names }, null, 2)}\n`,
)
console.log(`Wrote ${names.length} tokens and ${compiled.contrast.length} contrast pairs.`)
