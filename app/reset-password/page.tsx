import Link from 'next/link'
import PasswordForm from '@/components/password-form'

export default function ResetPassword() {
  return <main className="reset-page"><Link href="/login" className="reset-brand"><span>✦</span> IELTS ATLAS</Link><div className="reset-card"><PasswordForm recovery /></div></main>
}
