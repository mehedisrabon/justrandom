'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { CheckCircle2, LockKeyhole } from 'lucide-react'

export default function PasswordForm({ recovery = false }: { recovery?: boolean }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password.length < 12) { setError('Use at least 12 characters for your password.'); return }
    if (password !== confirm) { setError('Your passwords do not match.'); return }
    setBusy(true)
    const { error } = await createClient().auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setSuccess(true)
      if (recovery) setTimeout(() => { router.replace('/dashboard'); router.refresh() }, 1400)
    }
    setBusy(false)
  }

  return <section className={`panel password-panel${recovery ? ' recovery-password-panel' : ''}`}>
    {success ? <div className="password-success"><span className="success-mark"><CheckCircle2 size={23} /></span><div><h2>Password updated</h2><p>{recovery ? 'Your password is saved. Taking you to your workspace…' : 'Your new password is ready to use next time you sign in.'}</p></div></div> : <>
      <div className="panel-heading"><div><span className="eyebrow">{recovery ? 'SECURE YOUR ACCOUNT' : 'SIGN-IN SECURITY'}</span><h2>{recovery ? 'Choose a new password' : 'Change your password'}</h2></div><span className="password-icon"><LockKeyhole size={20} /></span></div>
      <p className="muted password-help">Use at least 12 characters. A unique passphrase is easier to remember and harder to guess.</p>
      <form className="password-form" onSubmit={submit}>
        <label>New password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={12} required placeholder="At least 12 characters" /></label>
        <label>Confirm new password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" minLength={12} required placeholder="Enter it again" /></label>
        {error && <p className="alert error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : recovery ? 'Set new password' : 'Update password'}</button>
      </form>
    </>}
  </section>
}
