'use client'
import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPractice } from '@/app/actions'
import { QUESTION_TYPES, SKILLS, type Skill } from '@/lib/data'
import { Save, Info } from 'lucide-react'
const initial={error:'',success:false}
export default function PracticeForm(){
 const [state,action,pending]=useActionState(createPractice,initial)
 const [skill,setSkill]=useState<Skill>('Listening')
 const [detail,setDetail]=useState(false)
 const router=useRouter()
 useEffect(()=>{if(state.success){router.refresh();router.push('/dashboard')}},[state.success,router])
 const isRaw=skill==='Listening'||skill==='Reading'
 return <form className="practice-form panel" action={action}><div className="section-title"><span className="eyebrow">NEW PRACTICE ENTRY</span><h2>Record a mock test</h2><p>Save your practice once; the Cambridge checklist updates automatically.</p></div>
 <div className="form-grid"><label>Cambridge Book<select name="book_number" defaultValue="21" required>{Array.from({length:21},(_,i)=>21-i).map(n=><option key={n} value={n}>Cambridge IELTS {n}</option>)}</select></label><label>Test number<select name="test_number" defaultValue="1">{[1,2,3,4].map(n=><option key={n} value={n}>Test {n}</option>)}</select></label><label>Skill<select name="skill" value={skill} onChange={e=>setSkill(e.target.value as Skill)}>{SKILLS.map(s=><option key={s}>{s}</option>)}</select></label><label>Practice date<input type="date" name="attempted_on" defaultValue={new Date().toLocaleDateString('en-CA')} required/></label>
 {isRaw?<label>Correct answers / 40<input type="number" name="correct" min="0" max="40" placeholder="e.g. 32" required/></label>:<label>Your assessed band<input type="number" name="band" min="0" max="9" step="0.5" placeholder="e.g. 6.5" required/></label>}
 <label>Time spent (minutes)<input type="number" name="duration_minutes" min="1" max="240" placeholder="Optional"/></label></div>
 <label className="block-label">Notes / mistakes to review<textarea name="notes" rows={3} maxLength={2000} placeholder="Which questions were difficult? What will you review next?"/></label>
 {isRaw&&<><button type="button" className="detail-toggle" onClick={()=>setDetail(!detail)}>{detail?'− Hide':'＋ Add'} detailed score breakdown <span>(optional)</span></button>{detail&&<div className="detail-area"><div className="detail-title">{skill==='Reading'?'Reading passages':'Listening sections'}</div><p className="tiny-muted">Enter the correct count and the actual number of questions in each part.</p><div className="detail-grid">{Array.from({length:skill==='Reading'?3:4},(_,i)=>{const key=`${skill==='Reading'?'passage':'section'}${i+1}`;return <div className="detail-entry" key={key}><b>{skill==='Reading'?'Passage':'Section'} {i+1}</b><div><input aria-label={`${key} correct`} name={`c_${key}`} min={0} max={40} type="number" placeholder="Correct"/><input aria-label={`${key} total`} name={`t_${key}`} min={1} max={40} type="number" placeholder="Total"/></div></div>})}</div><div className="detail-title space-top">Question-type performance</div><p className="tiny-muted">Enter only the question types you encountered. The list covers common Academic Reading and Listening formats.</p><div className="question-grid">{QUESTION_TYPES.map((q,i)=><div className="question-row" key={q}><span>{q}</span><input aria-label={`${q} correct`} name={`c_qt${i}`} type="number" min={0} max={40} placeholder="✓"/><input aria-label={`${q} total`} name={`t_qt${i}`} type="number" min={1} max={40} placeholder="Total"/></div>)}</div></div>}</>}
 <div className="form-footer"><div className="form-note"><Info size={16}/> Band estimates for Listening and Academic Reading are approximate.</div><button disabled={pending} className="btn btn-primary" type="submit"><Save size={17}/>{pending?'Saving...':'Save practice'}</button></div>{state.error&&<p className="alert error" role="alert">{state.error}</p>}</form>
}
