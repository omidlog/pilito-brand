import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      'apps/docs/build/**',
      'apps/docs/.docusaurus/**',
      'apps/docs/docs/**',
      '**/dist/**',
      'brand/exports/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/studio/static/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', location: 'readonly', fetch: 'readonly', matchMedia: 'readonly', setTimeout: 'readonly' },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)
