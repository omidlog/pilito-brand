import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  compileTokens,
  tokenExplorerData
} from "./chunk-HHMADR62.mjs";
import "./chunk-QDMMEM6P.mjs";

// packages/design-tokens/src/cli.ts
import fs from "node:fs";
import path from "node:path";
var root = process.cwd();
var compiled = compileTokens(root);
if (compiled.errors.length > 0) {
  console.error(compiled.errors.join("\n"));
  process.exit(1);
}
var outDir = path.join(root, "packages", "design-tokens", "dist");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "tokens.css"), compiled.css);
fs.writeFileSync(path.join(outDir, "tokens.ts"), compiled.typescript);
fs.mkdirSync(path.join(root, "apps", "docs", "src", "css"), { recursive: true });
fs.mkdirSync(path.join(root, "apps", "docs", "src", "data"), { recursive: true });
fs.writeFileSync(path.join(root, "apps", "docs", "src", "css", "tokens.css"), compiled.css);
fs.writeFileSync(path.join(root, "apps", "docs", "src", "data", "tokens.json"), `${JSON.stringify(tokenExplorerData(compiled), null, 2)}
`);
var names = Object.keys(compiled.flat).sort();
fs.writeFileSync(
  path.join(root, "brand", "tokens", "figma-variables.snapshot.json"),
  `${JSON.stringify({ status: "EXAMPLE", note: "Local stand-in for a Figma variables export. Not a live Figma connection.", variables: names }, null, 2)}
`
);
console.log(`Wrote ${names.length} tokens and ${compiled.contrast.length} contrast pairs.`);
