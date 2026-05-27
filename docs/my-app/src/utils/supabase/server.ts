import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo-session')?.value === 'true'

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  if (isDemo) {
    const mockUser = {
      id: 'demo-guest-id-12345',
      email: 'guest@readsphere.com',
      aud: 'authenticated',
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      user_metadata: {
        username: 'Guest Reader',
      },
      app_metadata: {},
    }

    const mockSession = {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    }

    client.auth.getUser = async () => {
      return { data: { user: mockUser as any }, error: null } as any
    }

    client.auth.getSession = async () => {
      return { data: { session: mockSession as any }, error: null } as any
    }

    // Intercept database query builder for user profiles
    const originalFrom = client.from.bind(client)
    client.from = (relation: string) => {
      if (relation === 'users') {
        const mockResponse = {
          data: {
            id: 'demo-guest-id-12345',
            email: 'guest@readsphere.com',
            username: 'Guest Reader',
            role: 'authenticated',
            premium_status: true,
            created_at: new Date().toISOString()
          },
          error: null
        }
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: async () => mockResponse,
          then: (resolve: any) => Promise.resolve(mockResponse).then(resolve)
        }
        return chain as any
      }
      return originalFrom(relation)
    }
  }

  return client
}
