# Backup, restore, migrate, reset

Set `BRAND_OS_DATA_KEY` to 32 bytes of base64 before encrypting restricted answers or backups. The key is not written into the working tree. Backup and restricted storage fail closed when it is missing. The approval proof remains a local file in `brand/.private/approval-secret`. This is not SSO.

`brand:migrate` rewrites fact files to canonical schema 2. Values are preserved. Catalogs and assets are not rewritten.

- `npm run brand:backup` copies brand-owned trees into `brand/.private/backups/<stamp>/`, keeping relative paths. A non-empty destination is refused.
- `npm run brand:restore -- --from <backup-dir>` checks the manifest checksum, then writes each file through a temp file and rename.
- `npm run brand:migrate` records the engine version in `brand/engine.lock` and `brand/migrations.yaml`. It does not rewrite facts, catalogs, or assets. Running it twice is safe.
- `npm run brand:reset -- --confirm "I understand this deletes interview state"` takes a backup first, then clears the ledger, session, and fact projections. Guides, tokens, and assets stay.

An interrupted write leaves the previous file in place because the temp file is renamed only after fsync.
