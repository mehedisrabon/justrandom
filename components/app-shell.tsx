'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, ChartNoAxesCombined, CirclePlus, LogOut, Sparkles, Settings2 } from 'lucide-react'
import { logOut } from '@/app/actions'
export default function AppShell({children,email}:{children:React.ReactNode,email:string}){
 const pathname=usePathname()
 const items=[{href:'/dashboard',label:'Overview',icon:LayoutDashboard},{href:'/practice',label:'Practice log',icon:CirclePlus},{href:'/cambridge',label:'Cambridge library',icon:BookOpen},{href:'/analytics',label:'Analytics',icon:ChartNoAxesCombined},{href:'/settings',label:'Settings',icon:Settings2}]
 return <div className="app-layout"><aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-symbol">✦</span><span>IELTS <b>ATLAS</b><small>ACADEMIC TRACKER</small></span></Link><div className="nav-heading">WORKSPACE</div><nav className="sidebar-nav">{items.map(it=><Link key={it.href} href={it.href} aria-current={pathname===it.href?'page':undefined}><it.icon size={18}/>{it.label}</Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={19}/><b>Small steps. Big bands.</b><p>Make every practice test count.</p></div><div className="profile-line"><span className="avatar">{email.slice(0,1).toUpperCase()}</span><span title={email} className="profile-email">{email}</span></div><form action={logOut}><button className="logout" type="submit"><LogOut size={16}/> Sign out</button></form></div></aside><div className="main-wrap"><header className="topbar"><span>IELTS ACADEMIC / PRACTICE HUB</span><Link href="/practice" className="btn btn-primary btn-small"><CirclePlus size={15}/> Log practice</Link></header><main className="main-content">{children}</main></div></div>
}
