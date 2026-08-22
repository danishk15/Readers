import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check local session cookie first for instant verification
  const localSessionCookie = request.cookies.get('quillhawk_auth_session')?.value || request.cookies.get('readsphere_auth_session')?.value
  let isAuthenticated = false

  if (localSessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(localSessionCookie))
      if (parsed?.user?.id) {
        isAuthenticated = true
      }
    } catch {}
  }

  // If not authenticated via local cookie, check Supabase SSR client
  if (!isAuthenticated) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        isAuthenticated = true
      }
    } catch {}
  }

  const { pathname } = request.nextUrl

  // Protected routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/communities') ||
    pathname.startsWith('/competition') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/publish')

  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('message', 'Please sign in to access your library.')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
