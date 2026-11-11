'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Chrome, LockKeyhole, Mail } from 'lucide-react'

type Mode = 'login' | 'forgot'

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next')
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '')

  function clearNotices() { setError(''); setMessage('') }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    clearNotices()
    const supabase = createClient()

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
      })
      if (error) setError(error.message)
      else setMessage('If an account exists for this email, a password reset link is on its way.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push(destination); router.refresh() }
    }
    setBusy(false)
  }

  async function googleSignIn() {
    setBusy(true)
    clearNotices()
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(destination)}` },
    })
    if (error) {
      setError(error.message.toLowerCase().includes('provider is not enabled')
        ? 'Google sign-in is not enabled for this Supabase project. Enable Google in Authentication → Providers, then try again.'
        : error.message)
      setBusy(false)
    }
  }

  return <div className="auth-form-wrap">
    <div className="auth-mini-icon"><LockKeyhole size={24} /></div>
    <span className="eyebrow">{mode === 'login' ? 'WELCOME TO IELTS ATLAS' : 'ACCOUNT RECOVERY'}</span>
    <h2>{mode === 'login' ? 'Welcome back.' : 'Reset your password.'}</h2>
    <p className="muted">{mode === 'login' ? 'Sign in to continue your IELTS Academic progress.' : 'Enter your email and we’ll send you a secure reset link.'}</p>
    {mode === 'login' && <button className="google-button" type="button" onClick={googleSignIn} disabled={busy}><Chrome size={18} /> Continue with Google</button>}
    {mode === 'login' && <div className="auth-divider"><span>or sign in with email</span></div>}
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com" /></label>
      {mode === 'login' && <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required placeholder="Enter your password" /></label>}
      {error && <p className="alert error" role="alert">{error}</p>}
      {message && <p className="alert ok recovery-message" role="status"><CheckCircle2 size={17} />{message}</p>}
      <button className="btn btn-primary full" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Send reset link'} {mode === 'login' ? <ArrowRight size={18} /> : <Mail size={17} />}</button>
    </form>
    {mode === 'login'
      ? <button className="forgot-link" type="button" onClick={() => { setMode('forgot'); clearNotices() }}>Forgot password?</button>
      : <button className="back-to-login" type="button" onClick={() => { setMode('login'); clearNotices() }}><ArrowLeft size={15} /> Back to sign in</button>}
    <div className="auth-security"><BookOpen size={15} /> Your Cambridge practice records are private to your account.</div>
  </div>
}
