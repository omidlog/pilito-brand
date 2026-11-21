# BRAND OS — Unified Master Template & Interview Agent Build Specification

> **Purpose:** Build a production-quality, reusable, AI-ready **Brand OS with an integrated Business OS**: brand identity, brand book, design system, mascot bible, creative assets, business plans, strategy, marketing, product, sales, operations, finance, engineering, governance and an interactive interview agent that progressively fills these documents. This is a **universal template** for future brands, not a populated guide for one company.
>
> **Audience:** An autonomous coding agent (Claude Code, Codex, Cursor, etc.) responsible for implementing the repository, documentation website, schemas, starter documents, validation, and developer experience.
>
> **Language:** Write implementation/code/documentation scaffolds in English. Structure must support multilingual brand content (including RTL languages) later.

## 0. Mission and non-negotiable outcome

Create a complete GitHub **Template Repository** named `brand-os-template`. **Each brand has one Brand OS containing its own Business OS submodule** (not two competing repos). A user should be able to click **Use this template**, name a new private repository for a new brand, run setup, be interviewed intelligently by an agent, progressively fill all business and brand documents, add visual assets, and publish a coherent documentation portal. All essential brand and business rules must be easy for humans to browse **and** discoverable by AI agents through text-based files, structured metadata, and supported connectors.

Do **not** create a fork-based multi-brand model. Each brand gets its own independent repository and content. Keep the reusable website/build engine separable from per-brand content so future improvements can be versioned and upgraded without overwriting a brand's decisions. A fork may be used for contributing to the template itself, not as the normal new-brand workflow.

Deliver **real working files, examples, schemas, scripts, tests, and documentation**, not just a plan or a high-level README. Empty placeholder pages with no instructions are not sufficient. On the other hand, **never invent approved facts** (brand colors, logos, legal claims, exact product details, mascot graphics) for a real brand. Clearly mark sample values as `EXAMPLE`, `DRAFT`, or `TBD`.

## 1. Recommended architecture and technology

- **Canonical source of truth:** Version-controlled Markdown/MDX, JSON, YAML, and source assets in a private GitHub repository.
- **Documentation portal:** Docusaurus with responsive navigation, full-text search, accessible page layout, light/dark color schemes, and a sensible multilingual/RTL strategy. Make the choice replaceable and document any trade-offs.
- **Design tokens:** DTCG-compatible JSON format (consult the current stable Design Tokens Community Group specification). Provide transforms/exporters for CSS variables, TypeScript, and optionally platform targets; never force teams to manually copy color values.
- **Figma:** A linked design workspace and published libraries, not a competing textual source of truth. Explain how to reconcile Figma variables/components with canonical tokens, and how to detect drift.
- **Large assets:** Support Git LFS or an external asset bucket with durable versioned URLs/checksums; define storage and access conventions. Avoid filling Git history with large rendered video and 3D files.
- **AI agents:** Provide `AGENTS.md` (generic/Codex-compatible), `CLAUDE.md` (Claude Code-compatible), agent skill folders, a machine-readable documentation index/manifest, and practical examples of retrieval/usage. Make optional read-only MCP tools a separate adapter, not a mandatory dependency for the first version.
- **Optional Notion:** For ideation, briefs, planning and tasks only. Do not maintain duplicate, manually synchronized copies of approved brand rules.
- **CI:** Lint, typecheck, build, schema validation, broken internal link validation, token validation, asset manifest validation, and examples/tests.
- **Security:** Private-by-default, least-privilege credentials, documented public vs internal publishing, no secrets in Git, and no assumption that ChatGPT can access private content without an authorized connection.

You may refine tool versions/implementation choices based on verified documentation, but preserve these capabilities and document changes in an architecture decision record (ADR).

## 2. System boundaries and content model

Treat the **Brand OS** as **six connected systems**:

1. **Brand Book:** Strategy, voice, identity rules, use cases, governance.
2. **Product Design System:** Tokens, components, accessibility, responsive UX patterns and code handoff.
3. **Mascot Bible:** Character consistency, anatomy, personality, expression/pose library, growth stages, animation and asset rules.
4. **Motion & Content System:** Motion, sound, film, social templates, paid campaigns and content composition.
5. **Brand Asset Library:** Findable source files, previews, renditions, license/ownership information and versioned metadata.
6. **Business OS:** Business planning, research, marketing, product, sales, customer success, operations, finance, engineering, legal, growth, goals and metrics; connected to brand creative work by stable references.

An **Interview & Knowledge Agent** acts across all six systems, asks the owner focused questions, creates structured drafts, captures evidence, detects gaps and contradictions, requests approval, and maintains a progress ledger. It is part of the deliverable, not an optional suggestion.

Separate generic **platform core** from **template content** from **brand instance data**. The mascot and gamification modules must be optional per brand, but fully supported when enabled. Content must have unique identifiers, status and ownership metadata, references, and modification history.

Use a generic schema for content records such as:

```yaml
id: mascot.expression.delighted
name: Delighted
status: draft # not_started | draft | in_review | approved | deprecated
owner: design
version: 0.1.0
last_reviewed: null
applies_to: [mobile, web, social]
source_assets: []
related_rules: []
tags: [mascot, emotion]
notes: "TBD — no approved artwork yet"
```

Provide schemas with validation and documented examples. Different record types may need different fields. Use stable IDs, not filenames as the only identity.

## 3. Full brand coverage — implement all 20 documentation modules

Each module must have: an overview, actionable guidance, fill-in forms/structured fields, examples explicitly identified as examples, Do/Don't patterns, asset links where relevant, review checklist, completion status, and clear links to dependent modules.

### 01 — Brand Strategy
- Purpose, mission, vision, origin story, brand promise.
- Values, positioning, category, differentiation and competitive frame.
- Target audiences, user personas, jobs-to-be-done, use cases.
- Brand personality/archetype and brand experience principles.
- Goals, success criteria and brand decision-making rules.

### 02 — Verbal Identity
- Brand name, spelling, pronunciation and naming conventions.
- Tagline, slogans, messaging hierarchy, elevator pitch.
- Tone of voice, tone adaptation by channel and situation.
- Approved vocabulary, forbidden language, editorial style and localization.
- UX microcopy, error messages, notifications, social captions, ad headlines, scripts.

### 03 — Logo System
- Primary, secondary, horizontal/vertical, icon/wordmark and lockups.
- Logo with/without mascot, monogram and sub-brand extensions.
- Color, reverse, mono, small-size and favicon variants.
- Clear space, minimum size, backgrounds, optical alignment.
- Incorrect usage and downloadable masters/export presets.

### 04 — Color System
- Primary, secondary, neutrals, accents, semantic/status colors.
- Light/dark themes, accessible foreground/background pairs.
- Color roles/tokens, swatches, gradients, charts/data visualization palette.
- Contrast and accessibility requirements; use WCAG guidance.
- Color distribution, Do/Don't and print-color reference strategy.

### 05 — Typography
- Families, licenses, fallback stacks and multilingual support.
- Headline, body, caption, label, display and editorial styles.
- Size scale, line height, tracking, weight, paragraph spacing.
- Web/mobile/print adaptations; responsive rules.
- RTL typography, numbers and localization; misuse examples.

### 06 — Mascot Identity (optional module, fully specified)
- Character story, role in brand, personality traits, behavior rules.
- Character design principles and memorability requirements.
- Canonical model sheet, proportions, anatomy, silhouette.
- Approved palette, markings, costume/props/accessories.
- Consistent linework, textures, shading, lighting, volume and perspective.
- 2D/vector, 2.5D/3D references, front/back/side/three-quarter views.
- Allowed transformations and strictly forbidden distortions.
- Source-of-truth character sheets, rigging, usage and approvals.

### 07 — Mascot Expression & Pose Library
- Facial emotion taxonomy, body action taxonomy and UI situation taxonomy.
- Asset IDs, pose/expression names, intensity, angle, stage, usage and references.
- Mapping of product situations to character reactions.
- Static/vector/transparent outputs and animation references.
- Include the detailed inventory in §4 below.

### 08 — Mascot Evolution / Progression
- Configurable stage count with an example six-stage model.
- Stage-specific silhouette, costume, expression and personality progression.
- Achievement, levels, rewards, badges and upgrade animations.
- Unlock conditions expressed as **placeholders**, not invented game mechanics.
- Continuity rules across stages, asset matrices and animation transitions.

### 09 — Illustration System
- Formal art direction, composition, shape language, outline weight.
- Shading/materials/lighting/perspective and subject treatment.
- Illustration sizes, cropping rules and scene complexity.
- Educational illustrations, backgrounds and supporting characters.
- Character/mascot integration and unacceptable variations.

### 10 — Iconography & Graphic Elements
- UI icons and custom brand icons; grids, strokes, corner geometry.
- Badges, medals, stickers, emojis, patterns, motifs, shapes.
- Visual elements derived from the mascot, if applicable.
- Static and animated icon states and naming/export rules.

### 11 — Layout & Composition
- Web, mobile, print and campaign grids.
- Spacing, safe area, margins, alignment and visual hierarchy.
- Aspect ratios, responsive breakpoints and content density.
- Image/text/mascot composition and minimum legibility rules.

### 12 — Product UI Design System
- Foundations: tokens, sizing, spacing, elevation, radius, color, typography.
- Components: buttons, fields, forms, cards, navigation, dialogs, feedback, charts.
- Component states: default, hover, focus, active, selected, disabled, loading, error.
- UX patterns: onboarding, empty, success, error, offline, permissions, progress.
- App-specific layouts, web patterns, responsive and dark mode examples.
- Accessibility, keyboard/focus, localization and developer handoff.
- Figma-to-code component mapping and adoption guidance.

### 13 — Motion Identity
- Principles, pacing, easing, durations and motion design tokens.
- Logo animation, mascot animation and microinteractions.
- Character rigging/turnaround, loops, transitions and gesture vocabulary.
- Loading/success/failure/progress/celebration states.
- Reduced-motion alternatives, file/performance guidance.
- Deliverable types: Lottie, Rive, CSS, SVG animation, MP4/WebM/GIF as appropriate.

### 14 — Sonic Branding
- Sonic logo, jingles, notification cues and success/error/reward sounds.
- Mascot vocalizations or characteristic SFX when relevant.
- Voiceover and pronunciation/tone instructions.
- Music mood boards, usage rights, loudness and export formats.
- Sound-off fallback and accessibility considerations.

### 15 — Photography & Video Style
- Art direction, framing, lighting, lens/camera angle guidance.
- Color grading and post-production conventions.
- Real footage + illustrated/3D mascot compositing rules.
- Subtitle, lower third, title cards and aspect ratio presets.
- Hook, transition, outro and CTA principles.

### 16 — Social Media System
- Instagram feed, stories, carousel, reels and profile/highlights.
- YouTube videos/shorts/thumbnails/channel art.
- TikTok and other channel variants, where applicable.
- Educational, announcement, feature, testimonial, campaign templates.
- Safe zones, text hierarchy, CTA, mascot placement and localization.
- Export presets and source template index.

### 17 — Marketing & Campaign System
- Campaign strategy briefs and creative concept framework.
- Digital display ads, paid social, landing pages and app store visuals.
- Video ads, motion ads, banners and email design.
- CTA and message hierarchy, A/B variants, campaign naming.
- Seasonal campaigns and co-branding/influencer guidelines.

### 18 — Print, Merchandise & Environment
- Posters, flyers, stationery, stickers, apparel and physical merchandise.
- Packaging, signage, booth/event graphics and environmental applications.
- Print bleed, trim/safe zone, color specification and output checks.
- Mascot usage on physical media; licensing/production notes.

### 19 — Brand Applications
- Realistic worked examples across app, website, social, motion and print.
- Consistency check examples, correct/incorrect usage and edge cases.
- Ready-to-adapt mockup briefs and channel-specific recipes.
- Cross-channel launch campaign exemplar with linked source assets.

### 20 — Governance & Asset Library
- Ownership, approvers, request/feedback/revision process.
- Brand versioning, deprecation, release notes and change log.
- Asset naming, format taxonomy, source vs export separation.
- Copyright, licenses, third-party credits, AI-generation provenance.
- Searchable manifest, asset previews, approved states and usage restrictions.
- QA checklists and maintenance cadence.


## 3A. Integrated BUSINESS OS — implement all 12 modules, not merely summary pages

**Important architecture rule:** Every new brand receives exactly one `brand-os` repository; its `business-os/` subtree is mandatory in the template, with individual modules optionally disabled as "not applicable". Do not create a separate independent Business OS repository or a second copy of overlapping brand strategy. Cross-module documents must reference one canonical record, not paste duplicated values. Branding, business planning, finance, product and marketing are distinct concerns, but they share one search/index/permissions/version system.

Each Business OS topic must have: purpose, decision it informs, inputs required, interview questions, expected artifacts, examples marked as illustrative, acceptance criteria, update frequency, responsible owner, evidence links, dependencies, relevant metrics, validation and approval status. Maintain both human-readable Markdown and machine-readable records where meaningful. Record assumptions separately from verified facts. Numeric calculations must state currency, measurement dates and assumptions.

### BO-01 — Company & Business Plan
- Business identity: legal/trade names, jurisdictions, founding details (only when supplied), founders, roles, ownership, company stage, contacts, operating locations.
- One-page business snapshot, executive summary, business thesis, long-form business plan, business-model canvas and lean canvas.
- Problem, customer pains, solution, value proposition, competitive advantages, substitutes, defensibility, goals and key milestones.
- Industry overview, market research, segmentation, TAM/SAM/SOM (source and estimation method required), competitors and SWOT/PESTEL as applicable.
- Monetization, revenue streams, pricing logic, cost model, partnerships, distribution, operating model, growth assumptions and risk register.
- Management, staffing plans, financial summary, capital requirements, investor-readiness and data room index.
- Explicit modes for idea-stage, pre-revenue, established business, services company, agency, e-commerce, enterprise SaaS, consumer app, marketplace and nonprofit; omit irrelevant questions rather than forcing answers.

### BO-02 — Marketing Strategy & Planning
- Marketing audit and baseline, marketing situation/SWOT, target segments, ICP, user/buyer personas and jobs-to-be-done.
- Positioning and messaging should reference canonical Brand OS and business strategy (do not duplicate).
- Marketing objectives, measurable KPIs and north star alignment; annual/quarterly/monthly plans and assumptions.
- Customer journey, awareness→consideration→conversion→retention→advocacy, funnel metrics and conversion hypotheses.
- Channel selection and playbooks: SEO, ASO, organic social, search/social ads, content, email/lifecycle, community, influencers, affiliates, partnerships, PR, events, referral, local/offline channels.
- Content pillars, editorial calendar, editorial briefs, CTA library, campaign briefs, campaign creative requests, launch plan, experiment plan and creative production handoff.
- Channel budgets, media plans, forecasts, attribution model, UTM taxonomy, reporting schedule, retrospective templates and approval gates.
- Provide SOSTAC-compatible planning fields without claiming it is the only standard; document strategy vs plan vs tactics vs execution vs measurement.

### BO-03 — Product & Service Strategy
- Product/service portfolio, vision, mission, value hypothesis, positioning, users, jobs-to-be-done and usability goals.
- Product discovery, interviews, insights repository, requirements and evidence; consent/permissions for research data.
- PRDs with problem, scope, non-goals, requirements, acceptance criteria, dependencies and analytics events.
- MVP, roadmap (now/next/later and dated versions), feature inventory, backlog link, prioritization (RICE/MoSCoW or configurable), release notes, rollout plans.
- UX journey mapping, onboarding, activation, accessibility, localization, integrations, API requirements and nonfunctional requirements.
- Product metrics, adoption, retention, engagement, experimentation and release decision log.

### BO-04 — Sales & Revenue
- Sales strategy, motions (self-service, product-led, inside sales, enterprise, retail, channel), ICP, territory/segment selection and qualification criteria.
- Lead sources, pipeline stage definitions, qualification (configurable), outreach, discovery, demo, proposal, negotiation, close and handoff.
- Pricing & packaging, discount/approval policy, sales scripts, objection handling, CRM fields, sales assets, competitor battlecards and partner sales playbooks.
- Forecasting, conversion rates, sales cycle, average deal size, quotas, revenue dashboard and churn/renewal/expansion handoff.
- B2C/app alternatives: paywall strategy, trial, upgrade, in-app purchase, subscription lifecycle and conversion optimization.

### BO-05 — Customer Experience, Success & Support
- End-to-end journey and service blueprint, onboarding, adoption, education, help-center structure, FAQ and knowledge-base policies.
- Support voice mapped to canonical brand tone, inbox/channel playbook, response templates, SLAs where applicable, severity, escalation and incident communications.
- Feedback collection, satisfaction surveys, NPS/CSAT/CES, bug/report triage, complaint handling, retention, churn prevention, cancellation and win-back.
- Customer success plans, account health scoring, renewal and advocacy/community loops; privacy-protecting case study approval.

### BO-06 — Operations & Team SOPs
- Organization chart, job ownership, RACI/DRI, delegation, hiring and contractor onboarding, vendor management and procurement.
- SOP inventory: trigger, purpose, prerequisites, step-by-step procedure, handoffs, exceptions, escalation, controls, audit evidence and owner.
- Meeting cadence, working agreements, decision registers, approval matrix, quality assurance, policies, incident management, continuity planning and operating metrics.
- Project management integration; link to actual tasks in external tools rather than maintaining a second task database in Git.

### BO-07 — Finance & Unit Economics
- Financial assumptions, reporting currency, accounting basis and time intervals; budget vs actual, revenue and expense categories.
- Forecast models (income statement/P&L, cash flow, balance sheet where relevant), revenue recognition assumptions, tax/legal dependency notes.
- Pricing economics, gross margin, contribution margin, CAC, LTV, payback, churn, MRR, ARR, ARPU, cohorts, burn and runway as applicable.
- Hiring/campaign/infrastructure cost forecasts, break-even scenarios, optimistic/base/conservative sensitivity models, financing/fundraising scenarios.
- Data dictionary and connector references to authoritative finance systems; **do not store bank statements, personal identifiers or raw sensitive financial records in public docs**.
- Never manufacture financial figures; show `unknown`, `estimate`, date, provenance and confidence. No claim of audit readiness without review.

### BO-08 — Engineering, Data & Security
- Technology strategy, service diagrams, architecture decision records, codebase inventory, stack, API contracts, system boundaries and dependencies.
- Data models, event taxonomy, environments, deployment/CI/CD, testing, infrastructure, monitoring, incidents, backups, recovery targets and reliability plans.
- Secure development, secrets management, IAM/least privilege, access reviews, dependency licensing, privacy-by-design, threat model and data retention.
- Technical debt backlog, engineering roadmap, SLOs as applicable, runbooks and developer onboarding; link to actual code repos and dashboards.

### BO-09 — Legal, IP & Compliance
- Entity/legal overview, trademark search/status, brand asset ownership/licensing, IP and copyright checklist, contract inventory and third-party content use.
- Terms/privacy/cookie notices, data protection obligations by jurisdiction, vendor DPAs, marketing consent, consumer/advertising requirements and retention/access rules.
- Compliance matrix with jurisdiction, rule, applicability assessment, evidence, assigned owner and review date.
- Legal documents are **draft templates only** until qualified counsel has reviewed; never falsely certify compliance.

### BO-10 — Growth & Experimentation
- Growth strategy, north star and input metrics, acquisition/activation/retention/referral/revenue loops and cohort framework.
- Growth backlog, hypothesis statement, expected impact, audience, design, baseline, sample size/power assumptions when appropriate, guardrails, launch/rollback and experiment ownership.
- A/B test report templates, learning log, winning/losing outcomes, replication and resource allocation.
- Do not invent experimental results or statistical significance.

### BO-11 — Goals, KPIs, Analytics & Reviews
- Strategic objectives, annual goals, quarterly OKRs, department KPIs, metric owners, source systems and calculation definitions.
- Metric registry (ID, definition, unit, aggregation, formula, timestamp/timezone, source, freshness, permissions and known caveats).
- Weekly updates, monthly operating reviews, quarterly business reviews, leadership dashboards, decisions/actions and follow-up records.
- Separate live actuals from plans/targets/forecasts. Avoid presenting a stale snapshot as current data.

### BO-12 — Partnerships, Distribution, Risk & Investor Readiness
- Distribution agreements and channels, partner tiers, onboarding, co-marketing, revenue share assumptions and partner performance.
- Risk categories and registers, probability/impact estimates, mitigation, trigger, owner, review cadence and dependency monitoring.
- Pitch deck outline, investor narrative, traction and financial source index, milestone map, diligence checklist, fundraising assumptions and board/investor updates if applicable.
- Only include confidential investor/board documents in explicitly restricted collections.

## 3B. Explicit interfaces between Brand OS and Business OS

Implement canonical linkages and impact checks:

| Canonical business source | Brand/creative downstream consumers | Rules |
| --- | --- | --- |
| Audience segments and ICP | Brand personas, UI, copy, campaigns, mascot contexts | Reference stable IDs; do not create competing personas |
| Positioning & value proposition | Brand strategy, messaging, sales, ads, video | Approved positioning lives in one place |
| Product features & roadmap | UI, onboarding, screenshots, tutorials, launch creative | Show release/version/status; don't market unshipped features as live |
| Price and packaging | Marketing offers, landing pages, ads, sales | No unapproved or stale pricing claims |
| Compliance & geographic scope | Social, copy, campaigns, video, legal | Require relevant checks before publication |
| Marketing campaign brief | Creative templates, motion, mascot usage | Generate creative specs with precise objectives and channels |
| Brand tokens and approved assets | UI, website, videos, social, merchandise | Refer to canonical token/asset IDs |
| KPIs & reports | Annual plans, launch reviews, growth decisions | Freshness and source required |

Define an impact analysis for changed approved facts: when a source record changes, identify linked documents needing review without silently overwriting approvals.

## 4. Mascot Bible — detailed requirements and asset inventory

Build a reusable mascot system that is optional for brands without characters, but comprehensive for mascot-led brands. **Do not generate or assume actual mascot artwork.** Provide a complete inventory, schemas, placeholders, reference frame templates and workflow for importing approved art.

### 4.1 Core character documentation

Provide templates for: character biography, design intent, trait matrix, personality, speaking style, motion personality, canonical proportions, anatomy and appendages, distinctive features, palette/costume rules, expressions, reference turnaround, forbidden anatomy mistakes, model sheets, 2D/3D style alignment and QA checklist.

### 4.2 Suggested production library (90 base states)

Create **90 individually identified state entries** with useful proposed names, descriptions, visual briefs and usage mapping. Distribute them as:

| Category | Target | Examples |
|---|---:|---|
| Emotional expressions | 20 | joyful, delighted, sad, angry, crying, surprised, excited, confused, proud, embarrassed, determined, curious, sleepy, worried, relieved, frustrated, thankful, playful, focused, celebrating |
| Body poses and actions | 20 | standing, waving, greeting, pointing, running, jumping, flying, landing, dancing, thinking, reading, cheering, sitting, stretching, hiding, looking-around, listening, presenting, thumbs-up-equivalent, resting |
| Product UI states | 15 | welcome, onboarding, empty state, loading, offline, success, failure, retry, hint, reminder, notification, level complete, streak, unlock, permission request, maintenance (adjust list to exactly 15) |
| Learning contexts | 15 | flashcard practice, recall, new word, sentence practice, quiz, pronunciation, listening, speaking, writing, review, spaced repetition, hard word, lesson completed, encouragement, progress |
| Prop and element interactions | 10 | book, pencil, headphones, speech bubble, trophy, badge, map, phone, star, ticket |
| Seasonal and campaign variants | 10 | birthday, new year, winter, spring, summer, autumn, launch, anniversary, special event, community milestone |
| **Total** | **90** | Catalog entries, not 90 artificially generated artworks |

The table contains conceptual suggestions; enforce exactly 20+20+15+15+10+10 unique records in the generated manifest, and make category naming configurable for a future brand.

Every state needs at least: `id`, `category`, `name`, `intent`, `emotion_intensity`, `pose`, `face`, `stage_compatibility`, `approved_angles`, `applicable_surfaces`, `animation_possible`, `source_assets`, `preview`, `status`, `do`, `dont`, `tags`, `version`, `owner`.

### 4.3 Stage system

Support arbitrary number of stages. Provide a **six-stage example** suitable for a mascot evolving from an egg to an expert captain, but label it clearly as an EXAMPLE CONFIGURATION, not a universal brand rule:

1. Egg / emergence
2. Hatchling / beginner
3. Young explorer / early learner
4. Trainee / growing competence
5. Skilled pilot / advanced learner
6. Professional captain / mastery

For each stage, provide stage design sheet fields, consistency constraints, evolution rationale, available expressions/poses, costume details, progression visuals and a transition animation brief. Asset references must identify which stage(s) they fit; a brand without progression can configure a single stage.

### 4.4 Angle and animation coverage

- Provide **eight canonical reference angles**: front, back, left profile, right profile, front-left three-quarter, front-right three-quarter, rear-left three-quarter, rear-right three-quarter.
- Provide **10–15 core motion briefs** (at least: idle/breathing, blinking, waving, jump, cheering, sad reaction, confused thinking, walking/running, flying/moving, listening, celebration, level-up, success, failure, loop transition).
- Define animation specs: trigger, duration, easing, repeat mode, entrance/exit, audio cue, reduced-motion variant, fallback still image, performance budget and deliverable formats.
- Define mascot treatments for app icon, avatars, stickers, onboarding, empty states, notifications, badges and promotional artwork.
- Include a starter MVP prioritization of **20–30 most useful states**, while preserving all 90 in the long-term backlog.

## 5. Gamification Visual System (optional but first-class)

Document levels, XP/progress, streaks, milestones, trophies, rewards, unlocks, collectible badges, progression maps, locked/unlocked states, reward animations, mascot stage changes, celebration frequency, user-friendly failure states and anti-manipulative UX constraints. Keep visual rules separate from game/business logic, with a clear mapping between them. Use placeholders rather than inventing game values.

## 6. Agent access and agent-first retrieval

Create or generate the following:

- `AGENTS.md`: instructions for agents operating in this repository; priority of sources, how to search, how to verify status, how to avoid hallucinated brand decisions, how to request approval before changing approved rules.
- `CLAUDE.md`: equivalent Claude Code project instructions that point to canonical shared files instead of duplicating large policies.
- `/agent-skills/brand-designer/SKILL.md`: visual identity creation/verification workflow.
- `/agent-skills/mascot-creator/SKILL.md`: model-sheet-first mascot workflow, stage/pose/expression selection, anatomy QA.
- `/agent-skills/motion-designer/SKILL.md`: animation decisions, timing, accessibility, source deliverables.
- `/agent-skills/ui-designer/SKILL.md`: tokens/components/layout/UX and accessibility.
- `/agent-skills/social-designer/SKILL.md`: channel presets and template usage.
- A `brand-manifest.json` (or equivalent) linking all documents, schemas, approved token sources and assets; an indexed catalog searchable by stable IDs/tags.
- Optional generated `llms.txt` and `llms-full.txt` for public-safe documentation discovery. Do not treat these as authorization or as substitutes for source files; exclude private data.
- A read-only MCP adapter **specification**, with optional implementation if feasible. Expose documented tools like `search_brand_docs`, `get_brand_tokens`, `get_mascot_guidelines`, `list_mascot_assets`, `get_design_component`, `get_social_template` and `get_brand_status`. Each must return version/status/source path and avoid unpublished or unapproved content by default.

Show working examples of agent requests (e.g., “Create an Instagram carousel using approved brand typography” and “Find the approved happy mascot pose for an onboarding success screen”), including expected retrieval sequence and what to do when assets are missing.

**Never claim** that an assistant automatically has access to a private repository, local files, Figma or MCP. Document actual connection/authentication steps and permission limitations for Claude Code, Codex and ChatGPT.

## 7. Starter repository structure

Implement something close to this, refining where helpful:

```text
brand-os-template/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── .env.example
├── .github/
│   ├── workflows/validate.yml
│   ├── workflows/deploy-docs.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── apps/
│   └── docs/                      # Docusaurus documentation portal
├── packages/
│   ├── brand-core/                # reusable schema/utilities
│   ├── design-tokens/             # DTCG input and exports
│   └── asset-catalog/             # index/validator
├── brand/
│   ├── brand.config.yaml          # identity, modules, links, publish policy
│   ├── brand-manifest.json
│   ├── content/
│   │   ├── 01-brand-strategy/
│   │   ├── 02-verbal-identity/
│   │   ├── 03-logo-system/
│   │   ├── 04-color-system/
│   │   ├── 05-typography/
│   │   ├── 06-mascot-identity/
│   │   ├── 07-mascot-expression-pose-library/
│   │   ├── 08-mascot-evolution/
│   │   ├── 09-illustration-system/
│   │   ├── 10-iconography-graphic-elements/
│   │   ├── 11-layout-composition/
│   │   ├── 12-product-ui-system/
│   │   ├── 13-motion-identity/
│   │   ├── 14-sonic-branding/
│   │   ├── 15-photo-video-style/
│   │   ├── 16-social-media/
│   │   ├── 17-marketing-campaigns/
│   │   ├── 18-print-merchandise/
│   │   ├── 19-brand-applications/
│   │   ├── 20-governance-assets/
│   │   └── gamification/
│   ├── business-os/               # 12 canonical business modules
│   │   ├── 01-company-business-plan/
│   │   ├── 02-marketing/
│   │   ├── 03-product-services/
│   │   ├── 04-sales-revenue/
│   │   ├── 05-customer-experience/
│   │   ├── 06-operations-sops/
│   │   ├── 07-finance-unit-economics/
│   │   ├── 08-engineering-security/
│   │   ├── 09-legal-compliance/
│   │   ├── 10-growth-experiments/
│   │   ├── 11-goals-kpis-reports/
│   │   └── 12-partnerships-risk-investors/
│   ├── interview/
│   │   ├── session-state.yaml
│   │   ├── answer-ledger.yaml
│   │   ├── evidence-index.yaml
│   │   ├── contradictions.yaml
│   │   └── question-bank/
│   ├── tokens/
│   │   ├── color.tokens.json
│   │   ├── typography.tokens.json
│   │   ├── space.tokens.json
│   │   ├── radius.tokens.json
│   │   └── motion.tokens.json
│   ├── mascot/
│   │   ├── mascot.config.yaml
│   │   ├── expressions.yaml
│   │   ├── poses.yaml
│   │   ├── ui-states.yaml
│   │   ├── learning-contexts.yaml
│   │   ├── prop-interactions.yaml
│   │   ├── campaigns.yaml
│   │   ├── stages.yaml
│   │   ├── angles.yaml
│   │   └── motions.yaml
│   ├── assets/
│   │   ├── README.md
│   │   ├── asset-manifest.yaml
│   │   ├── logo/
│   │   ├── mascot/
│   │   ├── icons/
│   │   ├── illustrations/
│   │   ├── motion/
│   │   ├── audio/
│   │   └── photography/
│   └── templates/
│       ├── social/
│       ├── video/
│       ├── campaign/
│       ├── print/
│       └── briefs/
├── agent-skills/
│   ├── brand-designer/SKILL.md
│   ├── mascot-creator/SKILL.md
│   ├── ui-designer/SKILL.md
│   ├── motion-designer/SKILL.md
│   └── social-designer/SKILL.md
├── schemas/
├── scripts/
├── examples/
├── tests/
└── docs-internal/
    ├── ARCHITECTURE.md
    ├── SETUP.md
    ├── NEW_BRAND.md
    ├── FIGMA_SYNC.md
    ├── AI_CONNECTORS.md
    ├── DEPLOYMENT.md
    └── GOVERNANCE.md
```

## 8. Documentation portal UX

Make the portal attractive, usable, and content-driven. Include:

- Sidebar navigation grouped by the 20 Brand Identity modules **and** the 12 integrated Business OS modules, with optional mascot/gamification features.
- Overview dashboard with brand name, quick links, module status/completeness and latest updates.
- Full-text search plus facets/tags for assets, states and components.
- Token explorer with swatches, semantic roles, light/dark previews, and accessible contrast indicators.
- Mascot library explorer filterable by emotion, action, stage, angle, platform, status and asset format.
- Reference pose/turnaround gallery; missing image placeholders must be clearly marked.
- Asset gallery with preview, license, approval status, version, source and export download links where available.
- Component index and templates gallery with instructions, not only screenshots.
- Use-case pages showing how a designer creates a post, motion clip, website screen or video while respecting brand rules.
- Clear draft/approved/deprecated indicators, content owner and last-updated data.
- No accidental deployment of internal-only pages or copyrighted source assets to public hosting.
- Useful built-in example content without falsely presenting it as the actual user's brand.

## 9. Templates and authoring workflows

Include reusable structured briefs for:

- New brand onboarding/intake questionnaire.
- Logo and identity brief.
- Mascot concept brief and canonical design approval.
- Mascot expression/pose request.
- Mascot progression stage request.
- Product UI component request.
- Illustration request.
- Social post/carousel/story/reel request.
- Poster, print and merchandise request.
- Video and motion graphics request.
- Ad campaign and landing page request.
- Brand change proposal, review and release checklist.

Make templates useful in Markdown and optionally YAML/JSON. Define a lifecycle: `not_started → draft → in_review → approved → deprecated`, appropriate permissions and approval rules. Show how to avoid overwriting an approved character or logo based on a casual prompt.

## 10. New-brand creation and configuration

Build a guided setup command (`npm run brand:init` or equivalent) which:

1. Requests a new brand name/slug, industry, default language, supported languages, website URL (optional), enabled modules (mascot/gamification), and public/private docs setting.
2. Updates configuration and obvious placeholders, without modifying the template engine.
3. Generates indexes/navigation, creates initial draft content and sample data clearly marked as such.
4. Optionally sets mascot stages (default 1; user may select 6 or another count) and creates the full 90-entry **catalog structure** without requiring artwork upfront.
5. Runs validation and reports missing/unfinished brand information.
6. Documents next steps for Figma linking, asset upload, local preview and private deployment.

Do not rely on manually editing dozens of hardcoded brand names. Enable a brand without a mascot to hide the module while preserving the ability to turn it on later.


## 10A. Critical product: interactive brand/business interview and auto-documentation agent

**Core user story:** The owner creates a repository from the Brand OS GitHub Template. An agent interviews them in small, sensible steps, learns the specific brand/business, creates and maintains every enabled Brand OS and Business OS document, identifies missing information, proposes options, and asks for explicit approval before promoting drafts to official rules. The owner can stop and resume without losing progress. This is a first-class **working feature**, not a static questionnaire.

### Interaction design and questioning rules

1. Ask **one focused question at a time**, or a compact group of tightly related questions only when answering together clearly saves effort. Never dump a 300-question form.
2. Begin with: new/existing business, brand name, sector, product/services, operating stage, geography/markets, target users and whether a mascot exists. Determine required vs optional modules adaptively.
3. Ask the highest-value unanswered question next, based on dependencies, uncertainty, priority, effect on other documents, and user's current objective (e.g., build a launch campaign).
4. Explain briefly **why** a difficult question matters and provide an industry-appropriate example, clearly labeled `example`.
5. Support `I don't know`, `not relevant`, `decide later`, `estimate`, `skip`, `show examples`, `suggest options`, `import existing`, `go back`, and `change earlier answer`.
6. Keep conversational answers in the user's chosen language; preserve canonical terminology and language tags. Support English (en) as the default interface language, with Persian (fa-IR, RTL) and Turkish (tr-TR) as equal optional locales supplied as locale data, where practical, without auto-translating official brand statements unless approved.
7. Use adaptive follow-ups: for an education app, ask learning model, languages, progression and mascot use; for SaaS, ask product tiers, adoption and retention; for agencies, ask service packages and pipeline. Do not assume Pilito/Fiko details belong to every brand.
8. If the answer is vague, ask only the minimum clarification needed; otherwise save as draft with explicit uncertainty, not as an assumed truth.
9. Allow importing web pages, PDFs, existing company decks, Figma links or docs only when supported/authorized; extract with source citations, capture date, confidentiality and review status. External web facts require citation and freshness; never hallucinate evidence.
10. Do not interrogate the user for secrets, bank details, credentials, identification numbers, full customer lists or other sensitive raw data; link secure systems instead.
11. At the end of each logical topic, recap facts, assumptions and unresolved items; ask for review/approval when material and offer the next topic.
12. Interview responses must not directly rewrite canonical approved fields without showing proposed changes and getting permission.

### Interview architecture (implement)

- **Question Bank:** machine-readable question definitions with `id`, `module`, `field_path`, `language`, `prompt`, `why_it_matters`, `question_type`, `examples`, `validation`, `required_when`, `skip_when`, `depends_on`, `priority`, `sensitivity`, `source_types`, `related_outputs` and `completion_rule`.
- **Question Planner:** deterministic prerequisite/eligibility logic (e.g., no mascot questions if not enabled); bounded AI reasoning to select relevant next question; stable fallback order if model is unavailable.
- **Answer Ledger:** append-only audit log with stable answer ID, source (human/import/model suggestion), authored time, session ID, current answer, original text, structured normalization, uncertainty, approval and related fields.
- **Knowledge Graph/Index:** stable references between business concepts, brand rules, audience segments, offers, products, personas, channels, goals, campaigns, and assets. Keep implementation lightweight; JSON/YAML edges are adequate initially.
- **Document Generator:** render/update Markdown docs plus structured YAML/JSON from approved or clearly labeled draft data; preserve human edits where possible; use tracked proposed diffs and conflict checks rather than rewriting entire documents blindly.
- **Contradiction Detector:** report inconsistent brand names, contradictory values (e.g. target regions, prices, brand colors, product status), stale or missing evidence, and documents impacted by a change.
- **Completeness Engine:** calculate per-module and per-document coverage using weighted mandatory fields; distinguish `not_applicable`, `unanswered`, `draft`, `in_review`, `approved`; show **coverage vs approval separately**.
- **Session Manager:** resume after interruption and across devices/runs with a saved session snapshot and transcript/event references; export a portable checkpoint; no reliance on model conversational memory alone.
- **Approval Workflow:** `proposed -> draft -> in_review -> approved -> deprecated` with permission and human approval for canonical claims, visual rules, financial targets, public-facing copy and irreversible changes. Record actor and revision.
- **Source/Claim Provenance:** mark user-provided statements, externally verified facts, estimates, agent-generated options, sample placeholders and unknowns; never silently promote model suggestions to facts.
- **Privacy/Visibility:** every question/answer/doc has `public|internal|restricted`; restricted values must not enter a public build, search index, logs, analytics or AI connector responses without authorization.
- **Agent Invocation:** CLI `brand:interview`, `brand:resume`, `brand:status`, `brand:review`, `brand:validate`, `brand:export`, plus documented chat-agent skills and optional authenticated MCP interface. Do not require a hosted proprietary LLM service for basic local status/validation.

### Sample machine-readable question record

```yaml
id: business.customer.primary_segment
module: business-os/01-company-business-plan
field_path: customer.primary_segment
prompt:
  en: "Who is the primary customer for this business?"
  # Localized prompts (fa, tr) are optional locale data next to the English base text.
  fa: "مشتری اصلی این کسب‌وکار چه کسی است؟"
  tr: "Bu işletmenin birincil müşterisi kimdir?"
why_it_matters: "Positioning, product requirements, marketing and brand messaging depend on this."
question_type: long_text
required_when: "business.stage != 'unknown'"
priority: critical
sensitivity: internal
status: unanswered
allows_unknown: true
examples:
  - "EXAMPLE ONLY: independent language learners aged 18–35"
dependent_outputs:
  - brand/business-os/01-company-business-plan/customer-segments.md
  - brand/content/01-brand-strategy/target-audiences.md
```

### Sample answer/provenance record

```yaml
answer_id: ans-0001
question_id: business.customer.primary_segment
value: null
raw_answer: null
source_type: null # owner | approved_import | external_cited | agent_suggestion
source_reference: null
authority: unverified # unverified | estimated | confirmed_by_owner | independently_verified
confidence: null
status: unanswered
last_updated: null
reviewed_by: null
visibility: internal
```

### Required first-run journey (make actually work)

1. `brand:init` initializes a brand instance and its business submodule; optional modules configured.
2. `brand:interview` asks the owner 5–10 high-priority adaptive questions across company identity, value proposition, audience, offer, market and brand personality, **one at a time**.
3. Each answer is recorded with provenance, linked to canonical fields and materialized into relevant draft documents. Interview progress and unanswered critical fields are visible in the docs portal.
4. User says `skip` or `unknown`: record unresolved status and continue without fabricating.
5. User exits; `brand:resume` continues from next eligible question with no duplicate prompting.
6. User corrects a past answer; show a proposed diff and impact list, preserving approvals until owner confirms.
7. User selects `review`; show one concise, human-readable summary per affected document, highlighting decisions and unsupported assumptions.
8. After explicit approval, relevant documents become approved; site/search/agent lookup can distinguish approved from draft.
9. Export a portable project snapshot and a prioritized next-question queue.
10. Test all steps with a local fixture; avoid claims of cross-app functionality until demonstrated with actual connectors.

### Question coverage and dependency catalog

Provide **at least 5–15 thoughtful starter questions per major module**, with a separate expandable bank for the mascot and the fine-grained brand submodules. Questions must cover all canonical field sets listed in this specification, not just high-level descriptions. Many fields may be derived from one well-answered question; never force arbitrary question counts on the end user. Provide a manifest mapping **each required field -> one or more questions -> target document(s) -> validator**. CI should flag required fields without a path to collection.

### Business/brand intelligence outputs

Generate on request:
- One-page executive summary / brand brief (with unknowns clearly marked).
- Long-form business plan with assumptions, citations, sensitivity and approval state.
- Marketing strategy plus date-scoped execution plan, channels, budget and KPIs.
- Brand identity brief, full Brand Book and voice/messaging rules.
- Mascot character brief, stage map, 90-state catalog slots, approved asset requests and motion briefs.
- Product roadmap and PRD briefs, campaigns, creative requests, sales playbooks, customer support SOPs.
- Approval-ready asset brief and checklist for a human designer or creative agent.
- Investor/pitch outlines only from user-verified numbers and sourceable claims.
- Completeness/gap report and short, prioritized list of next interviews.

## 11. Governance, security and integrity

- Define `internal`, `public`, and `restricted` visibility and enforce published-document filtering.
- Tag provenance of AI-generated suggestions vs human-approved rules.
- Require explicit human review for promotion to `approved` when changing brand-critical canonical visuals/text.
- Record source file/version and traceability for every agent-provided recommendation.
- Define ownership, licenses, attribution, usage rights and expiration where relevant.
- Keep secrets out of the repository; use environment variables and scoped access tokens.
- Include asset integrity checks (path existence, optional checksums, broken links), sensible retention and backups.
- Provide change logs, migrations and a documented template-engine upgrade strategy.

## 11A. Planning cadence and source-of-truth rules

Separate **strategy** (why/positioning; long-horizon) from **plan** (what/when/resources; dated), **execution** (actual tasks; link to task software), and **performance** (measured outcomes; link to analytics). Do not maintain an automatically stale copy of real-time business data in Markdown. Make planned vs actual, forecast vs observed, current vs historical explicit.

For each canonical record use: `id`, `title`, `category`, `type`, `status`, `owner`, `created_at`, `updated_at`, `last_reviewed`, `next_review`, `version`, `visibility`, `locale`, `source_refs`, `confidence`, `assumptions`, `related_ids`, and `approved_by` where appropriate. Validation should permit genuine unknowns while tracking missing coverage.

Provide a brand-neutral starter configuration and capability flags (consumer app, B2B SaaS, e-commerce, services, marketplace, physical product, nonprofit; mascot, gamification, regulated market, sales team, subscription, etc.). Never infer missing legal compliance or financial facts.

## 12. Testing and acceptance criteria

The build is complete only when all of these can be demonstrated:

- [ ] Fresh checkout installs and documentation site builds locally with clear commands.
- [ ] All 20 Brand Identity modules and all 12 Business OS modules have navigable, useful starter content and structured completion fields.
- [ ] Mascot module can be enabled/disabled, and both states build correctly.
- [ ] Exactly **90 proposed mascot state catalog entries** are generated across **20 emotions, 20 actions, 15 UI states, 15 learning contexts, 10 prop interactions and 10 seasonal/campaign variants**.
- [ ] Configurable stages work, with six-stage example and eight reference angles.
- [ ] At least 10–15 distinct canonical animation briefs are present.
- [ ] Gamification module can be enabled/disabled.
- [ ] All content/catalog JSON/YAML validates against schemas.
- [ ] Token transformations generate usable CSS and TypeScript artifacts.
- [ ] A user can search and filter mascot states and inspect provenance/status, and browse business, marketing and product documentation.
- [ ] A user can navigate/download real linked assets; missing assets are shown honestly.
- [ ] Public build excludes internal/restricted data by default.
- [ ] Agent instructions and at least five specialized skill files exist and reference actual files.
- [ ] An agent can resolve an example request by consulting documented stable IDs and approved assets, without fabricating missing approvals.
- [ ] A separate `business-os/` subtree exists **inside each Brand OS**, with all 12 modules reachable and cross-linked to approved brand rules.
- [ ] Each business module contains question-mapped fields, useful templates, provenance and completeness checks.
- [ ] `brand:interview` can ask an adaptive question, store the answer, update draft documents and choose the next question.
- [ ] `brand:resume` persists across a restart; skipped/unknown answers stay unresolved rather than becoming fabricated facts.
- [ ] Change to a previously answered question generates impact analysis and approval-aware diffs.
- [ ] Public builds and any search indexes exclude restricted interview answers and business files by default.
- [ ] Example flows for an education-app-with-mascot **and** a mascot-free B2B business work without hardcoded data.
- [ ] Coverage tests verify required-field-to-question-to-output mapping and detect orphan fields.
- [ ] The `brand:init` workflow creates a new brand with no hidden dependency on a previous brand.
- [ ] CI verifies builds, schemas and links; automated test commands are documented.
- [ ] README includes setup, use-template workflow, content authoring, Figma process, AI connections, deployment and limitations.
- [ ] Provide a changelog and a final execution report listing implemented features, commands run, tests passed/failed, known limitations and follow-up items.

## 13. Implementation phases (execute, do not stop at planning)

**Phase 1 — Foundation:** Initialize workspace, Docusaurus, schemas, configuration, CLI and CI.

**Phase 2 — Content:** Implement all 20 brand modules **and 12 Business OS modules** with starter guidance, fields, examples and governance.

**Phase 3 — Design system:** Implement DTCG token sources, transforms and visual explorers.

**Phase 4 — Mascot system:** Build the full 90-state data catalog, evolution stages, canonical angles, motions, asset manifests and explorer UI.

**Phase 5 — Agent enablement:** Write AGENTS/CLAUDE/skills, machine-readable index and connector guidance; optionally implement a safe read-only MCP service.

**Phase 6 — Interview agent:** Implement conversational intake, answer-to-document updates, citations, cross-module dependency logic, progress tracking, resumability, and human approvals.

**Phase 7 — Quality:** Add template generator, validation, tests, docs, security checks and realistic demos.

If time or budget is constrained, deliver a **working vertical slice** first, then systematically finish the remaining phases. Do not claim unfinished modules are complete. Keep a detailed checklist and include runnable commands.

## 14. What the final agent response must include

1. Repository/file tree and explanation of architecture.
2. Actual implementation and the commands to run locally.
3. Instructions to mark the GitHub repository as a Template Repository.
4. How to create a new independent brand repository and configure it.
5. How the interview agent asks questions, stores answers, generates business/brand documentation, resumes sessions, approves rules, adds assets and populates the mascot system.
6. How to deploy documentation privately/publicly without leaking restricted content.
7. How Claude Code, Codex and ChatGPT may access content **only after appropriate connections and permissions**.
8. Test/validation results, unresolved limitations and suggested next implementation steps.

### Operating instruction to the agent

**Build the repository now, including the interview engine and integrated Business OS.** Use sensible technical defaults and implement tangible artifacts. Ask questions only if an external credential, publishing target or irreversible action truly requires explicit authorization; otherwise use a safe local placeholder. Prefer clear, maintainable architecture over overengineering. Treat the checklist as verifiable requirements, not marketing copy. Never replace requested functionality with static mockups or invented brand decisions.


## 15. Final architectural invariants — MUST PASS

- Brand OS is the **umbrella**. Business OS is **contained within it for every independent brand**; each brand uses its own private-first GitHub Template-derived repo.
- The 20 Brand Identity modules, 12 Business OS modules, optional deep Mascot Bible (90 catalog slots, 6 configurable stages example, 8 angles, 15 motions), optional gamification, site, token system, assets, AI access and interview agent are all in scope.
- The owner can create Brand A or Brand B using the **same template**, answer different questions, and obtain independent data/config/assets without contamination.
- The default experience is conversational interviewing and incremental structured completion. A huge static onboarding form is **not** the primary experience.
- Approved decisions must never be overwritten by unapproved AI hypotheses. Every factual claim is traceable; unknown stays unknown.
- No false acceptance: implement and test actual commands, never present scaffolds, placeholders or simulated integrations as finished functionality.
