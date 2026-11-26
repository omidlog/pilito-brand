# Figma

Figma is a design workspace, not the source of truth. Approved tokens and component ids in Git win.

## Link a file

Set `design.figma.file_url`, `file_key`, and `library_url` in `brand/brand.config.yaml` when you have them. Leave them null until then. Do not put a Figma token in Git. `FIGMA_ACCESS_TOKEN` belongs in the environment.

## Drift

`npm run tokens:build` rewrites `brand/tokens/figma-variables.snapshot.json` from the DTCG paths. The compiler reports an alias cycle. A live Figma API read is not implemented. Compare an exported variable list to that snapshot before changing tokens. Do not write back to Figma from this repo.
