import Layout from '@theme/Layout'
import tokens from '../data/tokens.json'
import { asColors, asContrast } from '../data/records'

function hex(id: string): string {
  return asColors(tokens).find((color) => color.id === id)?.hex ?? 'transparent'
}

export default function TokensPage(): React.ReactElement {
  return (
    <Layout title="Tokens" description="EXAMPLE design tokens and contrast checks.">
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <p className="badge">{tokens.status}</p>
        <h1>Token explorer</h1>
        <p>{tokens.label} Hex values are exported from the DTCG JSON. Do not copy them into a product until the palette is approved.</p>
        {asColors(tokens).length > 0 ? (
          <div className="pair">
            <Preview theme="Light" background={hex('color.light.canvas')} color={hex('color.light.text')} />
            <Preview theme="Dark" background={hex('color.dark.canvas')} color={hex('color.dark.text')} />
          </div>
        ) : <p>No tokens have been approved for public release.</p>}
        <h2>Colors</h2>
        {asColors(tokens).map((color) => (
          <div className="swatch" key={color.id}>
            <i style={{ background: color.hex }} aria-hidden="true" />
            <div>
              <strong>{color.id}</strong>
              <div>
                <code>{color.hex}</code> · {color.theme}
              </div>
              <div>{color.description}</div>
            </div>
          </div>
        ))}
        <h2>Contrast</h2>
        <table>
          <caption>EXAMPLE foreground and background pairs checked against the stated minimum.</caption>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Ratio</th>
              <th>Minimum</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {asContrast(tokens).map((pair) => (
              <tr key={pair.id}>
                <td>{pair.id}</td>
                <td>{pair.ratio.toFixed(2)}</td>
                <td>{pair.min}</td>
                <td>{pair.pass ? 'Pass' : 'Fail'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  )
}

function Preview({ theme, background, color }: { theme: string; background: string; color: string }): React.ReactElement {
  return (
    <div style={{ background, color }}>
      <strong>{theme} preview</strong>
      <p>Body text uses the DTCG token hex values. This sample is not an approved theme until brand/tokens/approvals.yaml says so.</p>
    </div>
  )
}
