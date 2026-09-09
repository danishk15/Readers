import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let user: any = null

  // 1. Check local session cookie first for instant/fallback session validation
  const localSessionCookie =
    request.cookies.get('quillhawk_auth_session')?.value ||
    request.cookies.get('readsphere_auth_session')?.value

  if (localSessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(localSessionCookie))
      if (parsed?.user?.id) {
        user = parsed.user
      }
    } catch {
      // Invalid cookie JSON format
    }
  }

  // 2. If no user from cookie, verify with Supabase SSR server client
  if (!user) {
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

      const { data: { user: verifiedUser } } = await supabase.auth.getUser()
      if (verifiedUser) {
        user = verifiedUser
      }
    } catch (err) {
      console.error('Middleware auth verification error:', err)
    }
  }

  const { pathname } = request.nextUrl

  // Define all protected user routes
  const isProtectedRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/communities') ||
    pathname.startsWith('/competition') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/publish') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/reader') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/admin')

  // Check authentication for protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('message', 'Please sign in to continue.')
    // Safely save relative next redirect
    if (pathname !== '/dashboard') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }

  // If user is already authenticated and visits /login or /signup, redirect to dashboard or next
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const nextParam = request.nextUrl.searchParams.get('next')
    const destination =
      nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = destination
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Admin route security guard
  if (pathname.startsWith('/admin') && user) {
    const userRole = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role || 'user'
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'unauthorized_admin')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

