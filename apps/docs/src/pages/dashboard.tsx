import Layout from '@theme/Layout'
import { translate } from '@docusaurus/Translate'
import data from '../data/dashboard.json'
import { asDashboard, type DashboardReviewItem } from '../data/records'

// Internal-only review dashboard. The public build receives a stub with no brand data, so this page
// can only show the notice below there. UI strings are English by default; fa and tr come from
// apps/docs/i18n/<locale>/code.json.
const T = {
  title: translate({ id: 'dashboard.title', message: 'Review dashboard' }),
  description: translate({ id: 'dashboard.description', message: 'Coverage, review queue and contradictions for the internal build.' }),
  internalOnly: translate({ id: 'dashboard.internalOnly', message: 'The review dashboard exists only in the internal build. Run npm run docs:start in the repository.' }),
  coverage: translate({ id: 'dashboard.coverage', message: 'Coverage' }),
  approval: translate({ id: 'dashboard.approval', message: 'Approval' }),
  requiredUnanswered: translate({ id: 'dashboard.requiredUnanswered', message: 'Required unanswered' }),
  modules: translate({ id: 'dashboard.modules', message: 'Modules' }),
  module: translate({ id: 'dashboard.module', message: 'Module' }),
  pending: translate({ id: 'dashboard.pending', message: 'Pending review' }),
  queue: translate({ id: 'dashboard.queue', message: 'Review queue' }),
  queueEmpty: translate({ id: 'dashboard.queueEmpty', message: 'Nothing is waiting for review.' }),
  queueHint: translate({ id: 'dashboard.queueHint', message: 'Approve with npm run brand:approve -- --module <id> or --ids <id,…>. The proof is read from BRAND_OS_APPROVAL_PROOF or a prompt, never from argv.' }),
  withheld: translate({ id: 'dashboard.withheld', message: 'Restricted value withheld' }),
  draft: translate({ id: 'dashboard.draft', message: 'Draft' }),
  approved: translate({ id: 'dashboard.approved', message: 'Approved' }),
  contradictions: translate({ id: 'dashboard.contradictions', message: 'Contradictions' }),
  contradictionsEmpty: translate({ id: 'dashboard.contradictionsEmpty', message: 'No open contradictions.' }),
  next: translate({ id: 'dashboard.next', message: 'Next questions' }),
}

const pct = (value: number) => `${Math.round(value * 100)}%`
const show = (value: unknown) => (value === null || value === undefined ? '—' : typeof value === 'string' ? value : JSON.stringify(value))

function QueueRow({ item }: { item: DashboardReviewItem }): React.ReactElement {
  return (
    <tr>
      <td>
        <code>{item.question_id}</code>
        <br />
        <small>{item.label}</small>
      </td>
      <td>{item.state}</td>
      <td>{item.withheld ? <em>{T.withheld}</em> : <bdi>{show(item.draft_value ?? item.changes.find((change) => !change.stale)?.proposed_value)}</bdi>}</td>
      <td>{item.withheld ? <em>{T.withheld}</em> : <bdi>{show(item.approved_value)}</bdi>}</td>
      <td>
        <small>{item.reason}</small>
      </td>
    </tr>
  )
}

export default function DashboardPage(): React.ReactElement {
  const dashboard = asDashboard(data)
  if (!dashboard.available) {
    return (
      <Layout title={T.title} description={T.description}>
        <main className="container" style={{ padding: '2rem 0 3rem' }}>
          <h1>{T.title}</h1>
          <p>{T.internalOnly}</p>
        </main>
      </Layout>
    )
  }
  return (
    <Layout title={T.title} description={T.description}>
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <h1>{T.title}</h1>
        <p>
          {T.coverage} {pct(dashboard.coverage.coverage)} · {T.approval} {pct(dashboard.coverage.approval)} · {T.requiredUnanswered}{' '}
          {dashboard.coverage.required_unanswered} / {dashboard.coverage.required}
        </p>
        <h2>{T.queue} ({dashboard.review_queue.pending})</h2>
        <p>{T.queueHint}</p>
        {dashboard.review_queue.items.length === 0 ? (
          <p>{T.queueEmpty}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>State</th>
                <th>{T.draft}</th>
                <th>{T.approved}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {dashboard.review_queue.items.map((item) => (
                <QueueRow key={item.question_id} item={item} />
              ))}
            </tbody>
          </table>
        )}
        <h2>{T.contradictions} ({dashboard.contradictions.length})</h2>
        {dashboard.contradictions.length === 0 ? (
          <p>{T.contradictionsEmpty}</p>
        ) : (
          <ul>
            {dashboard.contradictions.map((item) => (
              <li key={item.id}>
                <strong>{item.severity}</strong> <code>{item.fields.join(', ')}</code> — <bdi>{item.message}</bdi>
              </li>
            ))}
          </ul>
        )}
        <h2>{T.modules}</h2>
        <table>
          <thead>
            <tr>
              <th>{T.module}</th>
              <th>{T.coverage}</th>
              <th>{T.approval}</th>
              <th>{T.requiredUnanswered}</th>
              <th>{T.pending}</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.modules.map((module) => (
              <tr key={module.id}>
                <td>{module.title}</td>
                <td>{pct(module.coverage)}</td>
                <td>{pct(module.approval)}</td>
                <td>{module.required_unanswered}</td>
                <td>{module.pending_review}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>{T.next}</h2>
        <ol>
          {dashboard.next.map((item) => (
            <li key={item.id}>
              <code>{item.id}</code> ({item.priority}) — {item.prompt}
            </li>
          ))}
        </ol>
      </main>
    </Layout>
  )
}
