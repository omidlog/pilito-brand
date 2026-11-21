import type { BrandConfig } from './types.js'

export function templateConfig(): BrandConfig {
  return {
    schema_version: 1,
    brand: {
      name: 'EXAMPLE Brand',
      name_status: 'placeholder',
      working_name: null,
      working_name_status: null,
      slug: 'example-brand',
      legal_name: 'TBD',
      tagline: 'TBD',
      industry: 'TBD',
      sector: 'unknown',
      stage: 'unknown',
      new_or_existing: 'unknown',
      website: null,
      default_locale: 'en',
      supported_locales: ['en', 'fa', 'tr'],
      profile: 'universal',
      publish_docs: 'public',
      status: 'draft',
      version: '0.1.0',
      initialized: false,
    },
    capabilities: {
      consumer_app: false,
      b2b_saas: false,
      ecommerce: false,
      services: false,
      marketplace: false,
      physical_product: false,
      nonprofit: false,
      regulated_market: false,
      sales_team: false,
      subscription: false,
    },
    modules: {
      mascot: {
        enabled: true,
        note: 'EXAMPLE configuration so the template can demonstrate the mascot catalog. Set enabled to false for a brand without a character.',
      },
      gamification: {
        enabled: true,
        note: 'EXAMPLE configuration. Disable when the product has no game-like progression.',
      },
      personal: {
        enabled: false,
        facets: [],
        note: 'Personal Brand OS. Turn on for a person-centered brand (brand:init --profile personal-brand). Facets add short question groups.',
      },
    },
    design: {
      figma: { file_url: null, file_key: null, library_url: null },
      token_source: 'brand/tokens',
    },
    assets: {
      storage: 'git-or-external',
      lfs: true,
      bucket_url: null,
    },
    links: {
      task_tracker: null,
      analytics: null,
      finance_system: null,
      support: null,
    },
    llm: {
      provider: 'none',
      model: null,
    },
  }
}
