# Brand QA

## Goal
Check a draft against approved facts, tokens, and publication rules. Report mismatches. Do not fix by inventing, and do not approve.

## Scope
Public projection, asset inspection, token hashes, and the compiled brand book.

## Tools
`search_brand_docs`, `get_brand_tokens`, `get_asset_metadata`, `get_brand_status`.

## Required inputs
The artifact under review and the brand slug. A second brand's facts are out of scope.

## Process
1. Search published facts for every claim in the artifact.
2. A claim with no source id fails.
3. Confirm token values match `value_sha256` when present.
4. Reject paths with `..`, symlinks, or SVG script.
5. Confirm restricted values are absent from the public build.
6. Return a list of failures. A human decides.

## Deliverable
Pass/fail per claim with fact id or "missing".

## Incorrect
Marking a markdown file approved because it exists, or reading another brand's ledger.

## Example
Input: caption says "students" but `business.customer.primary_segment` is unpublished. Output: fail, missing published source.
