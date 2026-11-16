import { getData } from '@/lib/data-server'
import AppShell from '@/components/app-shell'
import PracticeWorkspace from '@/components/practice-workspace'

export const dynamic = 'force-dynamic'

export default async function Practice() {
  const { sessions, breakdowns, user } = await getData()
  return (
    <AppShell email={user.email ?? 'Account'}>
      <div className="page-header">
        <div>
          <span className="eyebrow">PRACTICE WORKSPACE</span>
          <h1>Keep the momentum.</h1>
          <p>Log your mocks, record your mistakes, and watch your learning compound.</p>
        </div>
      </div>
      <PracticeWorkspace sessions={sessions} breakdowns={breakdowns} />
    </AppShell>
  )
}
