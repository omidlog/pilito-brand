# ADR 0001 — Stack

## Status

Accepted for 0.1.0.

## Choice

Node 22, TypeScript 5.9, Docusaurus 3.10, Ajv 8, and the `yaml` package. The interview planner is deterministic. No hosted model is required for status, validation, or the next question.

## Why

The portal needs search, light and dark themes, and locale direction. Docusaurus provides those. `@easyops-cn/docusaurus-search-local` indexes at build time so the template does not need Algolia keys. Persian and Turkish locales set direction; the default build includes them. Search stemming is English-only in this version, which is recorded as a limit.

## Trade-off

A docs framework is heavier than a static generator we would write ourselves. It keeps navigation, search, and RTL in a maintained project. The content stays plain Markdown in `brand/`, and `scripts/prepare-docs.ts` copies the visible subset into the app.
