import { useState } from 'react'
import Layout from '@theme/Layout'

const states = ['default', 'focus', 'disabled', 'loading', 'error'] as const

export default function ComponentsPage(): React.ReactElement {
  const [state, setState] = useState<(typeof states)[number]>('default')
  return (
    <Layout title="Components" description="Starter component notes bound to EXAMPLE tokens.">
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <h1>Component index</h1>
        <p>
          Buttons, fields, dialogs, cards, navigation, feedback, and charts are named in <code>components.yaml</code>. This page shows one EXAMPLE button bound to tokens. It is not your product’s component.
        </p>
        <div className="filters">
          {states.map((item) => (
            <button key={item} type="button" className="token-button" aria-pressed={state === item} onClick={() => setState(item)} disabled={item === 'disabled' && state === 'disabled'}>
              {item}
            </button>
          ))}
        </div>
        <p>
          Current sample state: <strong>{state}</strong>
          {state === 'error' ? ' — say what failed and what to do next. Do not invent a brand error voice.' : ''}
          {state === 'loading' ? ' — show progress without relying on motion alone.' : ''}
        </p>
        <button type="button" className="token-button" disabled={state === 'disabled'} aria-busy={state === 'loading'}>
          {state === 'loading' ? 'Working' : 'EXAMPLE action'}
        </button>
        <h2>Required states</h2>
        <ul>
          <li>Default, hover, focus-visible, active, disabled, loading, and error where the control can fail.</li>
          <li>Focus is visible without color as the only signal.</li>
          <li>Figma component names should match the ids. No Figma file is linked yet.</li>
        </ul>
      </main>
    </Layout>
  )
}
