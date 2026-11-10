'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { ArrowRight, BookOpen, LockKeyhole } from 'lucide-react'
export default function LoginForm(){
 const [mode,setMode]=useState<'login'|'signup'>('login')
 const [email,setEmail]=useState('');const [password,setPassword]=useState('')
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('')
 const router=useRouter();const params=useSearchParams()
 const next=params.get('next');const destination=next?.startsWith('/')&&!next.startsWith('//')?next:'/dashboard'
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('')
  const supabase=createClient()
  if(mode==='login'){
   const {error}=await supabase.auth.signInWithPassword({email,password})
   if(error)setError(error.message);else{router.push(destination);router.refresh()}
  }else{
   if(password.length<12){setError('Use at least 12 characters for your password.');setBusy(false);return}
   const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/callback`}})
   if(error)setError(error.message)
   else if(data.session){router.push('/dashboard');router.refresh()}
   else setMessage('Check your inbox for a confirmation link. Confirm your email before logging in.')
  }
  setBusy(false)
 }
 return <div className="auth-form-wrap"><div className="auth-mini-icon"><LockKeyhole size={24}/></div><span className="eyebrow">WELCOME TO IELTS ATLAS</span><h2>{mode==='login'?'Welcome back.':'Start your journey.'}</h2><p className="muted">{mode==='login'?'Sign in to continue your IELTS Academic progress.':'Create a free account to keep your practice history safe.'}</p>
 <form className="auth-form" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={mode==='signup'?12:1} autoComplete={mode==='signup'?'new-password':'current-password'} required placeholder="Enter your password"/></label>
 {error&&<p className="alert error" role="alert">{error}</p>}{message&&<p className="alert ok" role="status">{message}</p>}
 <button className="btn btn-primary full" type="submit" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign in':'Create account'} <ArrowRight size={18}/></button></form>
 <div className="switch-auth">{mode==='login'?"Don't have an account?":"Already have an account?"} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?'Sign up':'Sign in'}</button></div>
 <div className="auth-security"><BookOpen size={15}/> Your Cambridge practice records are private to your account.</div>
 </div>
}
