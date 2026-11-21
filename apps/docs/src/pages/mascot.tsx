import { useMemo, useState } from 'react'
import Layout from '@theme/Layout'
import catalog from '../data/catalog.json'
import { asStates } from '../data/records'

const categories = ['all', 'emotion', 'action', 'ui', 'learning', 'prop', 'seasonal'] as const

export default function MascotPage(): React.ReactElement {
  const [category, setCategory] = useState<(typeof categories)[number]>('all')
  const [query, setQuery] = useState('')
  const [mvpOnly, setMvpOnly] = useState(false)
  const rows = useMemo(
    () =>
      asStates(catalog).filter((state) => {
        if (category !== 'all' && state.category !== category) return false
        if (mvpOnly && !state.mvp) return false
        const haystack = `${state.id} ${state.name} ${state.intent}`.toLowerCase()
        return haystack.includes(query.trim().toLowerCase())
      }),
    [category, mvpOnly, query],
  )
  return (
    <Layout title="Mascot catalog" description="Draft mascot state catalog. No approved artwork.">
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <p className="badge">lifecycle: defined → pending → created → reviewed → approved → published</p>
        <h1>Mascot library</h1>
        {catalog.enabled ? (
          <p>90 proposed states. Previews are empty on purpose. The frame in the asset gallery is not a character.</p>
        ) : (
          <p>The mascot module is off for this build. The catalog remains in the repository and can be turned back on.</p>
        )}
        <div className="filters">
          <label>
            Search
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={mvpOnly} onChange={(event) => setMvpOnly(event.target.checked)} /> MVP only
          </label>
        </div>
        <p>
          Showing {rows.length} of {asStates(catalog).length}. A preview is shown only when an approved file is attached.
        </p>
        <table>
          <caption>Mascot states filtered by the controls above.</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((state) => (
              <tr key={state.id}>
                <td>
                  <code>{state.id}</code>
                </td>
                <td>{state.name}</td>
                <td>{state.category}</td>
                <td>{`${String(state.status ?? 'defined')} · ${state.mvp ? 'MVP' : 'backlog'}`}</td>
                <td>No approved artwork</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  )
}
