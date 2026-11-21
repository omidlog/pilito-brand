import Layout from '@theme/Layout'
import { translate } from '@docusaurus/Translate'
import book from '../data/brand-book.json'
import { asBrandBook, type BookItem, type BookStructured, type ItemTag } from '../data/records'

// UI strings are English by default. fa and tr come from apps/docs/i18n/<locale>/code.json.
const TAGS: Record<ItemTag, string> = {
  approved: translate({ id: 'brandBook.tag.approved', message: 'Approved' }),
  assumption: translate({ id: 'brandBook.tag.assumption', message: 'Assumption' }),
  recommendation: translate({ id: 'brandBook.tag.recommendation', message: 'Recommendation' }),
  missing: translate({ id: 'brandBook.tag.missing', message: 'Missing' }),
}

const STATUS: Record<string, string> = {
  complete: translate({ id: 'brandBook.status.complete', message: 'Complete' }),
  partial: translate({ id: 'brandBook.status.partial', message: 'Partial' }),
  missing: translate({ id: 'brandBook.status.missing', message: 'Missing' }),
}

const SECTIONS: Record<string, string> = {
  overview: translate({ id: 'brandBook.section.overview', message: 'Brand overview' }),
  strategy: translate({ id: 'brandBook.section.strategy', message: 'Strategy' }),
  verbal: translate({ id: 'brandBook.section.verbal', message: 'Verbal identity' }),
  color: translate({ id: 'brandBook.section.color', message: 'Color' }),
  type: translate({ id: 'brandBook.section.type', message: 'Typography' }),
  logo: translate({ id: 'brandBook.section.logo', message: 'Logo' }),
  governance: translate({ id: 'brandBook.section.governance', message: 'Governance' }),
}

const SPECIMEN = translate({ id: 'brandBook.specimen', message: 'The quick brown fox jumps over the lazy dog. 0123456789' })

/** Black or white label text for a swatch, whichever reads better. */
function labelColor(hex: string): string {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const channel = (shift: number) => {
    const c = ((value >> shift) & 255) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
  return luminance > 0.179 ? '#000000' : '#FFFFFF'
}

function familyStack(family: string, fallback: string[]): string {
  return [family, ...fallback].map((name) => (/^[a-z-]+$/.test(name) ? name : `"${name}"`)).join(', ')
}

function Structured({ value }: { value: BookStructured }): React.ReactElement {
  if (value.type === 'color') {
    return (
      <ul className="bb-swatches">
        {value.colors.map((color) => (
          <li key={color.role} className="bb-swatch" style={{ background: color.hex, color: labelColor(color.hex) }}>
            <strong dir="ltr">{color.role}</strong>
            <code dir="ltr">{color.hex}</code>
          </li>
        ))}
      </ul>
    )
  }
  if (value.type === 'font') {
    return (
      <div className="bb-specimens">
        {value.fonts.map((font) => (
          <figure key={font.role} className="bb-specimen">
            <p dir="auto" style={{ fontFamily: familyStack(font.family, font.fallback), fontSize: font.size_px ? `${font.size_px}px` : undefined, lineHeight: font.line_height ?? undefined }}>
              {SPECIMEN}
            </p>
            <figcaption>
              <strong dir="ltr">{font.role}</strong> · <span dir="ltr">{familyStack(font.family, font.fallback)}</span>
              {font.size_px ? <span dir="ltr"> · {font.size_px}px{font.line_height ? ` / ${font.line_height}` : ''}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    )
  }
  if (value.type === 'logo_spec') {
    return (
      <dl className="bb-logo">
        <dt>{translate({ id: 'brandBook.logo.minSize', message: 'Minimum size' })}</dt>
        <dd dir="ltr">{value.logo.min_size_px}px</dd>
        <dt>{translate({ id: 'brandBook.logo.clearSpace', message: 'Clear space' })}</dt>
        <dd dir="ltr">
          {value.logo.clear_space.value}
          {value.logo.clear_space.unit === 'x' ? '× ' : 'px'}
          {value.logo.clear_space.unit === 'x' ? translate({ id: 'brandBook.logo.markHeight', message: 'mark height' }) : null}
        </dd>
        {value.logo.min_print_mm !== null ? (
          <>
            <dt>{translate({ id: 'brandBook.logo.minPrint', message: 'Minimum print size' })}</dt>
            <dd dir="ltr">{value.logo.min_print_mm}mm</dd>
          </>
        ) : null}
      </dl>
    )
  }
  return (
    <table className="bb-voice">
      <thead>
        <tr>
          <th>{translate({ id: 'brandBook.voice.do', message: 'Do' })}</th>
          <th>{translate({ id: 'brandBook.voice.dont', message: 'Don’t' })}</th>
        </tr>
      </thead>
      <tbody>
        {value.pairs.map((pair, index) => (
          <tr key={index}>
            <td dir="auto">{pair.do}</td>
            <td dir="auto">{pair.dont}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Item({ item }: { item: BookItem }): React.ReactElement {
  return (
    <article className={`bb-item bb-item--${item.tag}`}>
      <header>
        <h3 dir="auto">{item.label}</h3>
        <span className={`bb-tag bb-tag--${item.tag}`}>{TAGS[item.tag]}</span>
      </header>
      {item.withheld ? (
        <p>{translate({ id: 'brandBook.withheld', message: 'Value withheld.' })}</p>
      ) : item.structured ? (
        <Structured value={item.structured} />
      ) : item.value !== null ? (
        <p dir="auto" className="bb-value">{String(item.value)}</p>
      ) : null}
      {item.note ? <p className="bb-note" dir="auto">{item.note}</p> : null}
      <p className="bb-sources">
        {translate({ id: 'brandBook.sources', message: 'Sources' })}:{' '}
        {item.source_ids.map((id) => (
          <code key={id} dir="ltr">
            {id}
          </code>
        ))}
      </p>
    </article>
  )
}

export default function BrandBookPage(): React.ReactElement {
  const model = asBrandBook(book)
  const title = translate({ id: 'brandBook.title', message: 'Brand Book' })
  return (
    <Layout title={title} description={translate({ id: 'brandBook.description', message: 'Approved brand facts with their sources. Missing sections stay missing.' })}>
      <main className="container bb" style={{ padding: '2rem 0 3rem' }}>
        <p className="badge">{model.audience}</p>
        <h1>{title}</h1>
        <p>
          {model.audience === 'public'
            ? translate({ id: 'brandBook.intro.public', message: 'Only approved and published facts are shown. Everything else is listed as missing. Nothing is invented.' })
            : translate({ id: 'brandBook.intro.internal', message: 'Internal edition. Approved facts are canonical. Assumptions and recommendations are not decisions. Missing items stay missing.' })}
        </p>
        <ul className="bb-legend">
          {(Object.keys(TAGS) as ItemTag[]).map((tag) => (
            <li key={tag}>
              <span className={`bb-tag bb-tag--${tag}`}>{TAGS[tag]}</span> {model.counts[tag]}
            </li>
          ))}
        </ul>
        {model.sections.map((section) => (
          <section key={section.id} id={section.id} className="bb-section">
            <h2>
              {SECTIONS[section.id] ?? section.title} <span className={`bb-status bb-status--${section.status}`}>{STATUS[section.status] ?? section.status}</span>
            </h2>
            <p>{section.purpose}</p>
            {section.items.map((item) => (
              <Item key={item.id} item={item} />
            ))}
          </section>
        ))}
      </main>
    </Layout>
  )
}
