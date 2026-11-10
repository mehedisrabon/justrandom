import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title:'IELTS Atlas | Mock Test Tracker',description:'Personal IELTS Academic practice analytics and Cambridge test checklist' }
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
