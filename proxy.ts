import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(changes) {
          changes.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          changes.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  // Validates access claims and refreshes expired sessions as needed.
  const { data } = await supabase.auth.getClaims()
  const authenticated = !!data?.claims
  if (!authenticated && ['/dashboard', '/practice', '/cambridge', '/analytics'].some(p => request.nextUrl.pathname.startsWith(p))) {
    const url = request.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return response
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
