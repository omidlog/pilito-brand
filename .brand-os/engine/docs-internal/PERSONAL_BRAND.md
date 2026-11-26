# Personal Brand OS

Personal Brand OS lets one Brand OS repository describe a person: a founder, consultant, creator, designer, speaker or author. It uses the same engine as company and product brands. It is not a second interview, a second ledger or a second approval flow.

A person is not a company. A person may still run a company, sell services or lead a team. Brand OS keeps the person and the organization as separate records and connects them with an explicit relationship.

## Turn it on

```bash
# Person-only brand. Company, SaaS and mascot questions count as not applicable.
npm run brand:init -- --name "Your Name" --slug your-name --profile personal-brand \
  --facets founder-executive,consultant-expert --publish private --yes

# Person plus business: the whole bank, with the personal modules turned on.
npm run brand:init -- --name "Your Name" --slug your-name --personal true --facets speaker-author --yes
```

`brand:init` writes this block into `brand/brand.config.yaml`:

```yaml
modules:
  personal:
    enabled: true
    facets: [founder-executive, consultant-expert]
```

You can edit the facet list later. The interview, documents and docs build follow it. An unknown facet fails validation and `brand:init`.

| Setting | Interview | Completeness |
| --- | --- | --- |
| `brand.profile: universal`, personal off (the default and every v0.2 repository) | Unchanged. Personal questions are never asked. | Personal questions are not applicable. |
| `brand.profile: personal-brand` | The personal core, the selected facets and the shared voice and visual questions. | Exclusive. Company legal entity, SaaS, mascot and other Business OS questions are not applicable, not missing. They can still be answered by id. |
| `brand.profile: universal`, personal on | The whole bank, including personal and the selected facets. | Everything counts. |

Purpose, vision, values and promise apply to a person too: the `personal-brand` profile asks `brand.strategy.purpose`, `brand.strategy.vision`, `brand.strategy.values` and `brand.strategy.promise` (BOS-15). The engine ships the profile, so every brand gets the four ids with the engine; a brand that changed the profile keeps its change in `brand/overrides/profiles/personal-brand.yaml` (`add` / `remove`). An older brand with a full copy in `brand/interview/profiles/` keeps it until `brand:convert`, and `npm run brand:migrate` still adds the four ids to that copy.

## Frameworks for a personal brand (decision, BOS-15)

Owner decision, settled: for a `personal-brand` profile with a business facet (`founder-executive` or `consultant-expert`), the Business Model Canvas, the business plan, the marketing plan and the Strategy lab (SWOT / TOWS, Value Proposition Canvas, customer journey, SOSTAC, OKR) describe **the person's own practice**. They are built from approved personal answers wherever a mapping exists. Ventures in `personal.experience.relationships` (a company the person founded or advises) stay relationships; they are never the canvas subject.

One rule decides what applies, in `packages/brand-core/src/applicability.ts` (`brandApplicability`), and `brand:next`, `brand:status` / completeness, the framework documents, the visual builders and every Studio framework and counter use it:

- A question **applies** when it is in the completeness scope of the active profile (an exclusive profile lists it), its module is on and its `skip_when` does not hold (`questionApplies`). That is the set `brand:next` asks and `open` counts.
- A framework question that does not apply is **mapped** when a personal answer describes the same thing. The framework then shows the personal answer under its own id (for example `personal.positioning.primary_audience`), with its own approval, verification label and visibility, and names the framework question it stands for (`stands_for`). Nothing is copied into a `business.*` or `brand.*` field.
- Otherwise it is **not applicable to this profile**. Studio says so; it is never "missing" and never counted as open. A module or chapter with no applicable question shows "Not applicable", not "100 %".
- An answer already recorded on a question outside the profile (it can be answered by id) is shown as itself.

Invariant: if Studio shows a framework item as missing, it is a question of the active profile that `brand:next` asks (once its own dependencies are answered) and `open` counts it.

| Framework question | Personal answer shown | Rows |
| --- | --- | --- |
| `brand.identity.public_name_override` | `personal.identity.public_name` | every personal profile |
| `brand.verbal.tagline` | `personal.identity.headline` | every personal profile |
| `brand.verbal.name_use` | `personal.identity.name_forms` | every personal profile |
| `brand.strategy.differentiation` | `personal.positioning.perspective` | every personal profile |
| `brand.gov.approver` | `personal.governance.reviewer` | every personal profile |
| `business.customer.primary_segment` | `personal.positioning.primary_audience` | business facet |
| `business.model.segments`, `business.sales.buyer` | `personal.consulting.target_clients` | business facet (consultant answers only when that facet is on) |
| `business.offer.value_proposition`, `business.fit.creators` | `personal.positioning.outcome` | business facet |
| `business.offer.summary`, `business.model.revenue` | `personal.services.offers` + `personal.consulting.engagements` | business facet |
| `business.fit.products` | `personal.services.offers` | business facet |
| `business.sales.pricing` | `personal.consulting.pricing_policy` (the policy; never an amount) | business facet |
| `business.model.key_activities` | `personal.consulting.methodology` | business facet |
| `business.marketing.channels`, `brand.social.channels` | `personal.content.channels` | business facet |
| `business.marketing.pillars` | `personal.content.pillars` | business facet |
| `business.marketing.objective`, `business.goals.annual` | `personal.goals.outcomes` | business facet |
| `business.goals.north_star`, `business.goals.key_results` | `personal.goals.kpis` | business facet |

The table is `PERSONAL_FRAMEWORK_SOURCES`. Everything else in the frameworks (company trade name, stage, product, finance, risks, key partners and resources, cost structure, customer relationships, SWOT, journey stages, the measurement section) is not applicable to a personal profile. Without a business facet the frameworks do not apply at all (Studio shows the canvas and plans as not used for this profile); the Brand Book still maps the `every personal profile` rows.

**A full plan for a venture.** `brand:next` and `brand:status` say this for a personal profile: set `brand.profile: universal` and keep `modules.personal` enabled (the whole bank is asked, and the `business.*` questions describe the venture), or give the venture its own Brand OS repository. One repository has one `business.*` namespace, so it describes one business.

## Question bank

The personal questions are defined in `packages/brand-core/src/content/personal-core.ts` and `personal-facets.ts` and read from the engine at run time, like every other question; a brand repository stores no copy, so a reworded prompt reaches every brand with the next engine update. Prompts exist in English (base), Persian and Turkish as locale data.

Core modules (always asked when the module is on): identity, positioning, story, experience and credentials, evidence and portfolio, thought leadership and channels, visual presence, privacy and contact. 31 of the 47 core questions are required; the 16 optional ones are asked last (the offer ladder, client case studies and the collaboration policy are among them). The facets add 27 questions in total (5 or 6 each). The profile also asks four shared brand questions every brand gets: signature stories (`brand.verbal.stories`), formats and cadence per channel (`brand.social.cadence`), the online presence audit (`brand.presence.audit`) and community (`brand.community.strategy`).

**The person's practice (founder-executive or consultant-expert).** With a business facet the profile also asks 13 business questions as they are (`PERSONAL_PRACTICE_QUESTIONS`: partners, customer relationships and the first session, key resources, cost categories, risks, SWOT and TOWS, and the customer journey), so the canvas, the business and marketing plans, SWOT/TOWS and the journey map are filled for the practice instead of showing those parts as not applicable. Without a business facet they are not asked. The collaboration policy is skipped with the creator-educator facet, which asks its own sponsorship and disclosure questions.

Facet modules (asked only for selected facets, through the condition `config.modules.personal.facets lacks <facet>`):

| Facet | Module | Covers |
| --- | --- | --- |
| `founder-executive` | `personal-founder` | Ventures and exact role, founder narrative, sectors, leadership topics, investor and press positioning |
| `consultant-expert` | `personal-consultant` | Methodology, engagement formats, target clients, pricing publication policy, confidentiality, inquiry CTA |
| `creator-educator` | `personal-creator` | Series, audience segments, dated and sourced metrics, sponsorship, disclosure |
| `artist-designer` | `personal-artist` | Practice, aesthetic vocabulary, portfolio taxonomy, exhibitions, usage rights |
| `speaker-author` | `personal-speaker` | Topics, abstracts, languages, prior talks, stage introduction, publications |

Ids are stable and prefixed: `personal.<area>.<field>`, for example `personal.identity.headline`.

## One fact per statement

`PERSONAL_CANONICAL_REFERENCES` in `packages/brand-core/src/personal.ts` is the reference table. `brand:validate` fails if any id in it is missing.

- The person's name is `personal.identity.public_name`. A company's name is `business.identity.trade_name`. Neither is copied into the other. For a `personal-brand` profile, the approved public name becomes `brand.name`, and a company trade name never renames the brand.
- Every organization appears once in `personal.experience.relationships` with a relation (`founded`, `co-founded`, `employed`, `advised`, and so on), dates, and an ownership state. Ownership defaults to `unstated`, which means no ownership claim. Founding or working somewhere never makes the person an owner.
- Voice, do/don't pairs, banned language, translation style, color roles and type intent are the shared `brand.*` questions. A personal brand reuses them by id.
- The person's own offers are `personal.services.offers`. When the person sells through a company, `business.offer.summary` stays canonical for the company offer.

## Privacy

Brand OS does not collect a home address, personal phone, birth date, government id or family details for a personal brand.

- Every personal write path refuses answers that look like they contain that data: interview answers, change proposals, notes, agent proposal batches (value and quotation) and the evidence register. The refusal names the kind of data, the kind of pattern that triggered it (a digit run, a name@domain pattern, a cue phrase, a category name followed by a value) and where it starts (line and word), and never echoes the value. The cues and category names are locale data in `packages/brand-core/src/personal-privacy.ts` (en, fa, tr).
- A social profile URL (`https://www.tiktok.com/@handle`, Medium, YouTube, Threads, Mastodon) and a bare `@handle` are not email addresses.
- The `personal.privacy.*` questions exist to list categories of data, so there a category name alone ("date of birth", «تاریخ تولد», "doğum tarihi") is allowed. A category name followed by a value in the same clause (a digit, or `:` and text) is still refused, and so is every phrase that states a value ("born on", "my address is", «همسرم», "eşim"). Everywhere else a category name is refused as before.
- Email addresses are allowed only in the professional contact field, `personal.contact.public_channels`.
- Career relationships, responsibilities, the evidence register and the privacy boundaries are `internal`. They cannot be published. Of the agent profiles, only `internal-read` can read career history, evidence and boundaries. `design` reads identity, presence and the artist facet. `marketing` reads identity, positioning, story, content, presence and the consultant, creator and speaker facets. `finance` reads no personal module.
- The guard is a filter, not a classifier. It errs on the side of refusing. It is not a GDPR, KVKK or other legal compliance certification. Obligations that depend on the jurisdiction (lawful basis, retention, data-subject requests, consent records for people other than the owner) need a dedicated legal review. They are listed as risks in `archive/PHASE_8_PERSONAL_BRAND_REVIEW.md`.
- No personal data is used as a fixture in another brand. Tests use synthetic names (`Alex Example`, `Sample Person`).

## Evidence and rights

`brand/interview/evidence-register.yaml` is tracked in Git. It holds references, never contents.

```bash
npm run brand:evidence -- add --claim personal.credibility.credentials --source public_record \
  --reference "https://registry.example.org/…" [--review-due 2027-06-30]
npm run brand:evidence -- add --claim personal.portfolio.projects --kind permission --scope public \
  --source document --reference "Signed consent, held offline" --granted-by "Client marketing lead"
npm run brand:evidence -- add --claim personal.positioning.known_for --source link \
  --reference "https://your-site.example/about" --owned   # the owner's own site or company: owner-published
npm run brand:evidence -- verify --id ev-0001     # owner proof from env, stdin or a hidden prompt
npm run brand:evidence -- verify --id ev-0002,ev-0003   # several ids, one proof; each id is reported
npm run brand:evidence -- withdraw --id ev-0002 --reason "Client revoked consent"
npm run brand:evidence -- check                   # verification state and blockers per claim
npm run brand:retract -- --question personal.credibility.awards --reason "Wrong year"
```

- Anyone, including an agent, may record evidence. It starts `pending`. Only the owner, with the approval proof, marks it `verified` or `rejected`. Both commands refuse to run while `BRAND_OS_AGENT_TOKEN` is set.
- Owner testimony (`--source owner_testimony`) is recorded and shown as owner-stated. It never counts as independent verification.
- A source the owner controls (their own website or profile, a venture they founded or own) carries `owned: true` and is shown as **Owner-published**. It never counts as independent verification. `brand:evidence add --owned` sets it; it is also inferred, on add and on every read, from the brand's own domains: approved `personal.contact.public_channels` (including a work-email domain), `personal.content.channels`, `personal.consulting.cta`, `personal.founder.ventures`, and `personal.experience.relationships` entries that are `founded`/`co-founded` or `owner`/`co-owner` and name a domain. Shared platforms (LinkedIn, YouTube, Medium, …) match only the owner's own profile path; public mail providers never count. Inference only ever marks a source as owned. Registers written before the flag need no migration: entries without `owned` are inferred on read and never rewritten. Mark an owner-controlled source the domains cannot reveal (a company brochure) by recording a new entry with `--owned` and withdrawing the old one.
- Labels: `verified` (only independent, current sources), `partly_verified` (an independent source plus an owner-stated or owner-published part, named by evidence id in internal documents), `owner_published`, `owner_stated`, `unverified`, `not_required`. One independent item never makes a mixed field `verified`. Publication still needs at least one independent source; a partly verified claim can be published, and drafts must present its owner part as the owner's statement.
- Verifying evidence that is already verified (or rejecting a rejected one) prints "already verified" and writes nothing, so re-running leaves Git clean.
- A question can declare `publication_requires`:
  - `verified_evidence`: credentials, awards, demonstrable results, case studies, ventures, prior talks, publications, exhibitions and creator metrics. Publication needs at least one verified, current, independent source.
  - `rights_permission`: case studies, testimonials and portraits. Publication needs a verified, current permission with `scope: public`.
- The gate runs in `brand:publish` and again at read time in `factIsPublic`, MCP retrieval and the public docs list. A withdrawn source, a rejected source or a past `review_due` date hides the claim immediately, even if the allowlist was not updated.
- Withdrawing evidence needs no proof because it only restricts. It unpublishes every claim that no longer passes.
- `brand:retract` removes an approved claim and its publication grant, records a `deprecated` answer (history stays in the ledger) and rebuilds the drafts that cited it. It needs the proof.

Assets that show a person or someone else's work are rights-sensitive: `subject: portrait | person | case_study | client_logo | testimonial` in the asset manifest, or the tags `portrait`, `headshot`, `case-study`, `client-logo`, `testimonial`. Such an asset is public only with:

```yaml
rights:
  status: granted          # granted | pending | revoked | none
  scope: public            # public | internal
  holder: Example Photographer
  expires: 2027-12-31      # optional
  evidence_id: ev-0004     # optional; must then be a verified, current public permission
```

## Documents

`npm run brand:document -- --type <kind> [--audience internal|public] [--json]`

| Kind | Notes |
| --- | --- |
| `personal-brand-book` | Identity, positioning, story, voice, look, audience and pillars, ethics and claims |
| `professional-bio` | Short (50–70 words), medium (120–170) and long (250–350). Each section reports the approved word count against the guideline and is never padded. All three cite the same facts. |
| `linkedin-pack` | Headline options, About material, featured strategy, experience entries |
| `website-pack` | Hero, about, expertise, work, services, social proof, contact, metadata |
| `media-kit` | Approved bio, headshot and rights, press-safe highlights, topics, dated metrics, contact |
| `speaker-kit` | Only with the `speaker-author` facet |
| `content-strategy` | Audience, pillar-to-channel mapping, voice, formats, CTA, disclosure, measurement |
| `portfolio-pack` | Projects with role, dates, result type, evidence and permission state; facet sections drop out |
| `services-pack` | Offers vs ideas, clients, method, boundaries, pricing policy (no amounts), proof, inquiry |
| `evidence-register` | Every claim that needs evidence or permission, its sources, status, eligibility and re-verification date. Internal only; the public edition is empty. |

Each personal item carries a verification label: `verified`, `partly_verified`, `owner_published`, `owner_stated` or `unverified`. The public edition contains only published facts and no evidence ids.

**Composed drafts (BOS-19).** Every section of the nine pack documents (not the evidence register) also carries one composed draft paragraph per language edition (`drafts`, labelled "Draft for owner approval"), with the approved facts kept below as its Sources. Composition is deterministic templating in `packages/brand-core/src/documents/compose.ts`, never a model call:

- Only approved facts the edition may show are used, verbatim. Drafts, gaps, withheld values and structured answers (lists, relationships) never enter the paragraph.
- A fact goes into the edition of the language it is written in, read from its script (Arabic script is fa; Latin with ğ, ş, ı or İ is tr; other Latin is en; both scripts in similar measure is mixed). URLs and e-mail addresses do not count.
- A fact in another language is used only through an approved translation: the language-labelled forms in `personal.identity.localized_headline` (for the headline) or `personal.identity.name_forms` (for the name), written `fa: … tr: …` (the labels `فارسی:`, `ترکی:`, `English:` and `Türkçe:` work too). Otherwise it is listed as untranslated and left out of that edition. Nothing is machine-translated. The public name stands in every edition unless an approved form for that language exists.
- The only added words are neutral connectors defined per locale (`DRAFT_CONNECTORS`, such as "Known for:" / «شناخته‌شده به‌عنوان:» / "Bilinen yönü:") and the dash between name and headline.
- Editions are the brand's supported locales among en, fa and tr, the default locale first. Word counts (`length`) count the composed draft of the first edition (`basis: composed_draft`); every draft also carries its own count.
- `brand:document` prints the drafts above a "Sources" heading; Studio's Personal Brand page shows one edition at a time (`?locale=fa|en|tr`); `draft_personal_content` returns the same drafts in each section's `composed`, read through the caller's gate. The owner still approves the final text through the interview.

## Agents and drafting

`draft_personal_content` (MCP) and `npm run brand:query -- --tool draft_personal_content --query professional-bio --section short` return the approved facts the caller may read for one deliverable, their verification labels, the missing ids and the drafting rules. The result is always `draft` with `authority: none`. It cannot approve, publish or write. The owner approves the finished text through the normal interview and approval flow.

Example questions and the call that answers them:

| Question | Call |
| --- | --- |
| Approved English short bio | `draft_personal_content` with `deliverable: professional-bio`, `section: short` |
| Verified relationship to Company A | `brand_retrieve` `kind: facts`, `ids: [personal.experience.relationships]` with an `internal-read` token |
| Topics the person can speak about publicly | `brand_retrieve` `ids: [personal.speaking.topics]` |
| Approved visual styles and portraits | `brand_retrieve` `module: personal-presence`, then `kind: asset` for portrait ids. A portrait without public rights is missing, never a guessed URL. |
| A LinkedIn draft from approved facts only | `draft_personal_content` with `deliverable: linkedin-pack` |

## Upgrading a v0.2 repository

`npm run brand:migrate` adds, only when missing: the personal question bank, the `personal-brand` profile, the matching field-registry and knowledge-graph entries, and `modules.personal: { enabled: false, facets: [] }` in `brand.config.yaml` (inserted as text, so comments and key order are kept). It does not touch answers, facts or module prose. Running it twice changes nothing. A config without `modules.personal` is treated as disabled, so an upgraded `universal` brand behaves exactly as before.

## Studio (Phase 9) readiness

Everything Studio needs to show a personal brand read-only is in Git: the config block, the question bank and profile, the answer ledger and fact files, the evidence register, and the asset manifest with rights. Privacy labels are question data (`sensitivity`, `publication_requires`, `contact_field`), not values computed from `brand/.private`. Studio must not edit any of it. Claude Code does all editing in the brand's own repository.
