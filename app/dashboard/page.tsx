import { getData } from '@/lib/data-server'
import Link from 'next/link'
import AppShell from '@/components/app-shell'
import Stat from '@/components/stat'
import { TrendChart, SkillChart } from '@/components/charts'
import { pct, SKILLS } from '@/lib/data'
import { BookOpen, ChartNoAxesCombined, CircleCheck, Target, ArrowUpRight } from 'lucide-react'
export const dynamic='force-dynamic'
export default async function Dashboard(){
 const {sessions,user}=await getData();const done=new Set(sessions.map(s=>`${s.book_number}/${s.test_number}/${s.skill}`));
 const averages=SKILLS.map(skill=>{const arr=sessions.filter(s=>s.skill===skill&&s.band!==null);return {name:skill,band:arr.length?Math.round(arr.reduce((n,s)=>n+Number(s.band),0)/arr.length*10)/10:0,count:arr.length}})
 const trend=sessions.slice(0,28).reverse().map((s,i)=>({name:`${s.book_number}.${s.test_number}`, [s.skill]:Number(s.band??0),order:i}))
 const overall=sessions.length?(sessions.reduce((n,s)=>n+Number(s.band??0),0)/sessions.length).toFixed(1):'—'
 return <AppShell email={user.email??'Account'}><div className="page-header"><div><span className="eyebrow">YOUR LEARNING OVERVIEW</span><h1>Every test is progress.</h1><p>Track what you have achieved and what deserves your attention next.</p></div><Link className="btn btn-outline" href="/cambridge">View Cambridge library <ArrowUpRight size={16}/></Link></div>
 <div className="stats-grid"><Stat label="Practice attempts" value={sessions.length} detail="All your mock attempts" icon={<BookOpen size={18}/>}/><Stat label="Skill tests completed" value={done.size} detail="Out of 336 skill tests" icon={<CircleCheck size={18}/>}/><Stat label="Completion" value={`${pct(done.size,336)}%`} detail={`${336-done.size} remaining`} icon={<Target size={18}/>}/><Stat label="Average practice band" value={overall} detail="Across recorded attempts" icon={<ChartNoAxesCombined size={18}/>}/></div>
 <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE OVER TIME</span><h2>Band progression</h2></div></div><TrendChart data={trend}/></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">SKILL SNAPSHOT</span><h2>Average bands</h2></div></div><SkillChart data={averages.filter(x=>x.count>0)}/></section></div>
 <div className="dashboard-grid bottom-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CAMBRIDGE LIBRARY</span><h2>Books 1–21</h2></div><Link href="/cambridge" className="text-link">See all books →</Link></div><p className="muted">Each book contains four tests, with Listening, Reading, Writing, and Speaking tracked separately.</p><div className="progress-track"><span style={{width:`${pct(done.size,336)}%`}}/></div><div className="progress-label"><b>{done.size} completed</b><span>{336-done.size} remaining</span></div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Latest practice</h2></div><Link href="/practice" className="text-link">View log →</Link></div>{sessions.length?<div className="recent-list">{sessions.slice(0,4).map(s=><div className="recent-item" key={s.id}><span className="recent-book">{s.book_number}</span><div><b>Cambridge {s.book_number} · Test {s.test_number}</b><small>{s.skill} · {s.attempted_on}</small></div><span className="band-pill">{s.band?.toFixed(1)}</span></div>)}</div>:<p className="empty-inline small-empty">No practice attempts yet. Your journey begins with one test.</p>}</section></div>
 </AppShell>
}
