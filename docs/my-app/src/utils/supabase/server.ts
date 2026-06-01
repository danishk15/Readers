import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const CLASSIC_BOOKS = [
  { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.images', is_premium: false },
  { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.images', is_premium: false },
  { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.images', is_premium: true },
  { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.images', is_premium: false },
  { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.images', is_premium: true }
];

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
  }

  // Generic interceptor for both demo and normal sessions
  const originalFrom = client.from.bind(client)
  client.from = (relation: string) => {
    if (relation === 'books') {
      let eqId: string | null = null
      const chain = {
        select: () => chain,
        eq: (column: string, value: any) => {
          if (column === 'id') eqId = value
          return chain
        },
        order: () => chain,
        single: async () => {
          if (eqId && eqId.startsWith('classic-')) {
            const book = CLASSIC_BOOKS.find(b => b.id === eqId)
            if (book) return { data: book, error: null }
          }
          return originalFrom(relation).select('*').eq('id', eqId).single()
        },
        then: async (resolve: any, reject: any) => {
          try {
            if (eqId && eqId.startsWith('classic-')) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqId)
              if (book) return resolve({ data: book, error: null })
            }
            let realQuery = originalFrom(relation).select('*')
            if (eqId) realQuery = realQuery.eq('id', eqId)
            const res = await realQuery
            return resolve(res)
          } catch (e) {
            return reject ? reject(e) : resolve({ data: [], error: e })
          }
        }
      }
      return chain as any
    }

    if (isDemo && relation === 'users') {
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

  return client
}
