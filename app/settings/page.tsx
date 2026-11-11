import AppShell from '@/components/app-shell'
import PasswordForm from '@/components/password-form'
import { getAuth } from '@/lib/data-server'
export const dynamic = 'force-dynamic'

export default async function Settings() {
  const { user } = await getAuth()
  return <AppShell email={user.email ?? 'Account'}><div className="page-header"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Account settings.</h1><p>Manage how you sign in and keep your account secure.</p></div></div><div className="settings-grid"><section className="panel account-card"><div className="account-avatar">{(user.email ?? 'A').slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">SIGNED IN AS</span><h2>{user.email ?? 'Your account'}</h2><p className="muted">Your practice history is saved to this account.</p></div></section><PasswordForm /></div></AppShell>
}
