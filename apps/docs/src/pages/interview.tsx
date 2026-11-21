import Layout from '@theme/Layout'
import status from '../data/status.json'
import { asNext } from '../data/records'

export default function InterviewPage(): React.ReactElement {
  return (
    <Layout title="Interview progress" description="Interview coverage without restricted answers.">
      <main className="container" style={{ padding: '2rem 0 3rem' }}>
        <h1>Interview progress</h1>
        <p>
          Run <code>npm run brand:interview</code> in the repository. This page lists the next questions and the coverage numbers. It does not print restricted answers. Unknown stays unknown.
        </p>
        <p>
          Coverage {Math.round(status.coverage * 100)}% · Approval {Math.round(status.approval * 100)}% · Unanswered required fields {status.requiredUnanswered}
        </p>
        <ol>
          {asNext(status).map((question) => (
            <li key={question.id}>
              <code>{question.id}</code> ({question.priority}) — {question.prompt}
            </li>
          ))}
        </ol>
        <h2>Resume</h2>
        <p>
          <code>npm run brand:resume</code> reads <code>brand/interview/session-state.yaml</code>. Closing the terminal does not lose the ledger.
        </p>
      </main>
    </Layout>
  )
}
