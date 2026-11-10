'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuth } from '@/lib/data-server'
import { QUESTION_TYPES, SKILLS, estimateBand, type Skill } from '@/lib/data'

function intField(form: FormData, name: string, min: number, max: number, optional = false): number | null {
 const raw = String(form.get(name) ?? '').trim()
 if (raw === '' && optional) return null
 if (!/^\d+$/.test(raw)) throw new Error(`Invalid ${name}`)
 const n = Number(raw)
 if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`Invalid ${name}`)
 return n
}

export async function createPractice(_prev: {error:string;success:boolean}, form: FormData) {
 try {
  const { supabase, user } = await getAuth()
  const book_number = intField(form,'book_number',1,21)!
  const test_number = intField(form,'test_number',1,4)!
  const skill = String(form.get('skill') ?? '') as Skill
  if (!SKILLS.includes(skill)) throw new Error('Choose a skill')
  const attempted_on = String(form.get('attempted_on') ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(attempted_on) || Number.isNaN(new Date(attempted_on).getTime())) throw new Error('Choose a valid date')
  const duration_minutes = intField(form,'duration_minutes',1,240,true)
  const notes = String(form.get('notes') ?? '').trim()
  if(notes.length > 2000) throw new Error('Notes are too long')
  const isRaw = skill === 'Listening' || skill === 'Reading'
  const correct = isRaw ? intField(form,'correct',0,40) : null
  const total = isRaw ? 40 : null
  const rawBand = String(form.get('band') ?? '').trim()
  const submittedBand = !isRaw && rawBand !== '' ? Number(rawBand) : null
  if (!isRaw && (submittedBand === null || !Number.isFinite(submittedBand) || submittedBand < 0 || submittedBand > 9 || !Number.isInteger(submittedBand*2))) throw new Error('Band must be from 0 to 9, in 0.5 steps')
  const band = isRaw ? estimateBand(skill, correct!) : submittedBand
  const breakdowns: Array<{user_id:string;category:string;label:string;correct:number;total:number}> = []
  const add = (category:string,label:string,key:string) => {
   const c = intField(form,`c_${key}`,0,40,true)
   const t = intField(form,`t_${key}`,1,40,true)
   if(c===null && t===null) return
   if(c===null || t===null || c>t) throw new Error(`Check ${label} scores`)
   breakdowns.push({user_id:user.id,category,label,correct:c,total:t})
  }
  if(skill === 'Reading') for(let i=1;i<=3;i++)add('Passage',`Passage ${i}`,`passage${i}`)
  if(skill === 'Listening') for(let i=1;i<=4;i++)add('Section',`Section ${i}`,`section${i}`)
  if(isRaw) QUESTION_TYPES.forEach((label,i)=> add('Question Type',label,`qt${i}`))
  const subScores = breakdowns.filter(x=>x.category==='Passage'||x.category==='Section')
  if(subScores.length) {
   if(subScores.reduce((a,b)=>a+b.correct,0)>correct!) throw new Error('Section/passage correct answers exceed your total score')
   if(subScores.reduce((a,b)=>a+b.total,0)>40) throw new Error('Section/passage question totals exceed 40')
  }
  const {data:session,error} = await supabase.from('practice_sessions').insert({user_id:user.id,book_number,test_number,skill,attempted_on,duration_minutes,notes,correct,total,band}).select('id').single()
  if(error || !session) throw new Error(error?.message ?? 'Unable to save')
  if(breakdowns.length) {
   const {error:detailError} = await supabase.from('practice_breakdowns').insert(breakdowns.map(b=>({...b,session_id:session.id})))
   if(detailError) {
    await supabase.from('practice_sessions').delete().eq('id',session.id).eq('user_id',user.id)
    throw new Error(detailError.message)
   }
  }
  revalidatePath('/dashboard'); revalidatePath('/cambridge'); revalidatePath('/analytics');revalidatePath('/practice')
  return {error:'',success:true}
 }catch(e){return {error:e instanceof Error?e.message:'Could not save practice',success:false}}
}
export async function deletePractice(form: FormData) {
 const id = String(form.get('id')??'')
 if(!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Invalid ID')
 const {supabase,user}=await getAuth()
 const {error}=await supabase.from('practice_sessions').delete().eq('id',id).eq('user_id',user.id)
 if(error)throw new Error(error.message)
 revalidatePath('/dashboard');revalidatePath('/cambridge');revalidatePath('/analytics');revalidatePath('/practice')
 redirect('/practice')
}
export async function logOut() {
 const {supabase}=await getAuth()
 await supabase.auth.signOut()
 redirect('/login')
}
