import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Session, Breakdown } from '@/lib/data'

export async function getAuth() {
 const supabase = await createClient()
 const { data: { user }, error } = await supabase.auth.getUser()
 if (error || !user) redirect('/login')
 return { supabase, user }
}
export async function getData() {
 const { supabase, user } = await getAuth()
 const [s, b] = await Promise.all([
  supabase.from('practice_sessions').select('*').eq('user_id',user.id).order('attempted_on',{ascending:false}).order('created_at',{ascending:false}).limit(1000),
  supabase.from('practice_breakdowns').select('*').eq('user_id',user.id).limit(10000),
 ])
 if (s.error) throw new Error(s.error.message)
 if (b.error) throw new Error(b.error.message)
 return { sessions: (s.data ?? []) as Session[], breakdowns: (b.data ?? []) as Breakdown[], user }
}
