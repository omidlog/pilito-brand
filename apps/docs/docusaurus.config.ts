import fs from 'node:fs'
import path from 'node:path'
import type { Config } from '@docusaurus/types'
import type { ThemeConfig } from '@docusaurus/preset-classic'

interface Features {
  mascot: boolean
  gamification: boolean
  audience: string
  brandName: string
  nameStatus: string
}

const featuresPath = path.join(__dirname, 'generated', 'features.json')
const features: Features = fs.existsSync(featuresPath)
  ? (JSON.parse(fs.readFileSync(featuresPath, 'utf8')) as Features)
  : {
      mascot: true,
      gamification: true,
      audience: 'public',
      brandName: 'EXAMPLE Brand',
      nameStatus: 'placeholder',
    }

const config: Config = {
  title: features.brandName,
  tagline: 'Brand OS template — EXAMPLE values are not approved',
  favicon: 'img/favicon.svg',
  url: process.env.BRAND_OS_SITE_URL || 'http://localhost:3000',
  baseUrl: '/',
  organizationName: 'brand-os',
  projectName: 'brand-os-template',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fa', 'tr'],
    localeConfigs: {
      en: { label: 'English', direction: 'ltr', htmlLang: 'en' },
      fa: { label: 'فارسی', direction: 'rtl', htmlLang: 'fa-IR' },
      tr: { label: 'Türkçe', direction: 'ltr', htmlLang: 'tr-TR' },
    },
  },
  markdown: { format: 'detect' },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/docs',
          sidebarPath: './sidebars.js',
          numberPrefixParser: false,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      },
    ],
  ],
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        indexBlog: false,
        docsRouteBasePath: '/docs',
        explicitSearchResultPath: true,
      },
    ],
  ],
  themeConfig: {
    colorMode: { respectPrefersColorScheme: true },
    announcementBar: {
      id: 'example-template',
      content: 'Template shell. Values marked EXAMPLE, DRAFT, or TBD are not approved brand facts.',
      isCloseable: false,
    },
    navbar: {
      title: features.brandName,
      items: [
        { to: '/docs/start/introduction', label: 'Docs', position: 'left' },
        { to: '/brand-book', label: 'Brand Book', position: 'left' },
        { to: '/tokens', label: 'Tokens', position: 'left' },
        ...(features.mascot ? [{ to: '/mascot', label: 'Mascot', position: 'left' as const }] : []),
        { to: '/assets', label: 'Assets', position: 'left' },
        { to: '/components', label: 'Components', position: 'left' },
        { to: '/interview', label: 'Interview', position: 'left' },
        // The review dashboard has data only in the internal build (see scripts/prepare-docs.ts).
        ...(features.audience === 'internal' ? [{ to: '/dashboard', label: 'Dashboard', position: 'left' as const }] : []),
        { type: 'localeDropdown', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `${features.brandName} · name status ${features.nameStatus} · audience ${features.audience}. Legal and financial pages are drafts until a qualified person reviews them.`,
    },
  } satisfies ThemeConfig,
}

export default config
