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

## Question bank

The bank is `brand/interview/question-bank/personal.yaml`. It is generated from `packages/brand-core/src/content/personal-core.ts` and `personal-facets.ts` like every other bank, so `brand:validate` checks it for prompt drift. Prompts exist in English (base), Persian and Turkish as locale data.

Core modules (always asked when the module is on): identity, positioning, story, experience and credentials, evidence and portfolio, thought leadership and channels, visual presence, privacy and contact. 31 of the 44 core questions are required; the 13 optional ones are asked last. The facets add 27 questions in total (5 or 6 each).

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

- Every personal write path refuses answers that look like they contain that data: interview answers, change proposals, notes, agent proposal batches (value and quotation) and the evidence register. The refusal names the kind of data and never echoes it. The cues are locale data in `packages/brand-core/src/personal-privacy.ts` (en, fa, tr).
- Email addresses are allowed only in the professional contact field, `personal.contact.public_channels`.
- Career relationships, responsibilities, the evidence register and the privacy boundaries are `internal`. They cannot be published. Of the agent profiles, only `internal-read` can read career history, evidence and boundaries. `design` reads identity, presence and the artist facet. `marketing` reads identity, positioning, story, content, presence and the consultant, creator and speaker facets. `finance` reads no personal module.
- The guard is a filter, not a classifier. It errs on the side of refusing. It is not a GDPR, KVKK or other legal compliance certification. Obligations that depend on the jurisdiction (lawful basis, retention, data-subject requests, consent records for people other than the owner) need a dedicated legal review. They are listed as risks in `PHASE_8_PERSONAL_BRAND_REVIEW.md`.
- No personal data is used as a fixture in another brand. Tests use synthetic names (`Alex Example`, `Sample Person`).

## Evidence and rights

`brand/interview/evidence-register.yaml` is tracked in Git. It holds references, never contents.

```bash
npm run brand:evidence -- add --claim personal.credibility.credentials --source public_record \
  --reference "https://registry.example.org/…" [--review-due 2027-06-30]
npm run brand:evidence -- add --claim personal.portfolio.projects --kind permission --scope public \
  --source document --reference "Signed consent, held offline" --granted-by "Client marketing lead"
npm run brand:evidence -- verify --id ev-0001     # owner proof from env, stdin or a hidden prompt
npm run brand:evidence -- withdraw --id ev-0002 --reason "Client revoked consent"
npm run brand:evidence -- check                   # verification state and blockers per claim
npm run brand:retract -- --question personal.credibility.awards --reason "Wrong year"
```

- Anyone, including an agent, may record evidence. It starts `pending`. Only the owner, with the approval proof, marks it `verified` or `rejected`. Both commands refuse to run while `BRAND_OS_AGENT_TOKEN` is set.
- Owner testimony (`--source owner_testimony`) is recorded and shown as owner-stated. It never counts as independent verification.
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

Documents list approved facts. They do not write prose. Each personal item carries a verification label: `verified`, `owner_stated` or `unverified`. The public edition contains only published facts and no evidence ids.

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
