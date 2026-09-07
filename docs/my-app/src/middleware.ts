import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let user = null
  let supabase = null

  try {
    supabase = createServerClient(
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

    // Cryptographically verify session with Supabase auth server
    const { data: { user: verifiedUser } } = await supabase.auth.getUser()
    user = verifiedUser
  } catch (err) {
    console.error('Middleware auth verification error:', err)
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
