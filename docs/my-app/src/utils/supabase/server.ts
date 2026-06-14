import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const CLASSIC_BOOKS = [
  { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages', is_premium: true, language: 'en' },
  { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages', is_premium: true, language: 'en' }
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
          const getCookieBooks = (name: string) => {
            const val = cookieStore.get(name)?.value
            if (val) {
              try { return JSON.parse(decodeURIComponent(val)) } catch {}
            }
            return []
          }

          if (eqId) {
            if (eqId.startsWith('classic-')) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqId)
              if (book) return { data: book, error: null }
            }
            const localPubBooks = getCookieBooks('local-published-books')
            let b = localPubBooks.find((x: any) => x.id === eqId)
            if (b) return { data: b, error: null }
            
            const addedBooks = getCookieBooks('added-to-library-books')
            b = addedBooks.find((x: any) => x.id === eqId)
            if (b) return { data: b, error: null }
          }
          if (isDemo) {
            const book = CLASSIC_BOOKS.find(b => b.id === eqId)
            return { data: book || null, error: book ? null : { message: 'Book not found' } }
          }
          try {
            const res = await originalFrom(relation).select('*').eq('id', eqId).single()
            if (res.error || !res.data) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqId)
              if (book) return { data: book, error: null }
            }
            return res
          } catch {
            const book = CLASSIC_BOOKS.find(b => b.id === eqId)
            return { data: book || null, error: book ? null : { message: 'Book not found' } }
          }
        },
        then: async (resolve: any, reject: any) => {
          const getCookieBooks = (name: string) => {
            const val = cookieStore.get(name)?.value
            if (val) {
              try { return JSON.parse(decodeURIComponent(val)) } catch {}
            }
            return []
          }

          try {
            if (eqId) {
              if (eqId.startsWith('classic-')) {
                const book = CLASSIC_BOOKS.find(b => b.id === eqId)
                if (book) return resolve({ data: book, error: null })
              }
              const localPubBooks = getCookieBooks('local-published-books')
              let b = localPubBooks.find((x: any) => x.id === eqId)
              if (b) return resolve({ data: b, error: null })

              const addedBooks = getCookieBooks('added-to-library-books')
              b = addedBooks.find((x: any) => x.id === eqId)
              if (b) return resolve({ data: b, error: null })
            }

            const localPubBooks = getCookieBooks('local-published-books')
            const addedBooks = getCookieBooks('added-to-library-books')
            const localCombined = [...localPubBooks, ...addedBooks]

            if (isDemo) {
              if (eqId) {
                const book = [...localCombined, ...CLASSIC_BOOKS].find(b => b.id === eqId)
                return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
              }
              return resolve({ data: [...localCombined, ...CLASSIC_BOOKS], error: null })
            }
            let realQuery = originalFrom(relation).select('*')
            if (eqId) realQuery = realQuery.eq('id', eqId)
            const res = await realQuery
            if (res.error || !res.data || res.data.length === 0) {
              if (eqId) {
                const book = [...localCombined, ...CLASSIC_BOOKS].find(b => b.id === eqId)
                return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
              }
              return resolve({ data: [...localCombined, ...CLASSIC_BOOKS], error: null })
            }
            return resolve(res)
          } catch (e) {
            const localPubBooks = getCookieBooks('local-published-books')
            const addedBooks = getCookieBooks('added-to-library-books')
            if (eqId) {
              const book = [...localPubBooks, ...addedBooks, ...CLASSIC_BOOKS].find(b => b.id === eqId)
              return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
            }
            return resolve({ data: [...localPubBooks, ...addedBooks, ...CLASSIC_BOOKS], error: null })
          }
        }
      }
      return chain as any
    }

    if (isDemo) {
      if (relation === 'users') {
        const mockUserRegion = cookieStore.get('demo-user-region')?.value || 'South Asia'
        const mockUserPremium = cookieStore.get('demo-premium_status')?.value === 'true'

        const mockResponse = {
          data: {
            id: 'demo-guest-id-12345',
            email: 'guest@readsphere.com',
            username: 'Guest Reader',
            role: 'authenticated',
            region: mockUserRegion,
            premium_status: mockUserPremium,
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

      if (['comments', 'reading_logs', 'messages', 'communities', 'channels', 'competition_entries'].includes(relation)) {
        let selectArgs: any[] = []
        let eqFilters: { column: string; value: any }[] = []
        let orderCol: string = ''

        const chain = {
          select: (...args: any[]) => {
            selectArgs = args
            return chain
          },
          eq: (column: string, value: any) => {
            eqFilters.push({ column, value })
            return chain
          },
          order: (col: string, options: any) => {
            orderCol = col
            return chain
          },
          single: async () => {
            let localItems: any[] = []
            const stored = cookieStore.get(`demo-${relation}`)?.value
            if (stored) {
              try { localItems = JSON.parse(decodeURIComponent(stored)) } catch {}
            } else {
              if (relation === 'communities') {
                localItems = [
                  { id: 'demo-comm-1', name: 'Fantasy Book Club', description: 'Discuss spells, swords, and magical worlds.', owner_id: 'demo-guest-id-12345', region: 'Asia-Pacific', genre: 'Fantasy', created_at: new Date().toISOString() },
                  { id: 'demo-comm-2', name: 'Sci-Fi Explorers', description: 'Deep space exploration and cybernetic futures.', owner_id: 'other-user', region: 'Europe', genre: 'Sci-Fi', created_at: new Date().toISOString() },
                  { id: 'demo-comm-3', name: 'Detective Guild', description: 'Solving mysteries, one chapter at a time.', owner_id: 'other-user', region: 'North America', region_name: 'North America', genre: 'Mystery', created_at: new Date().toISOString() }
                ]
              } else if (relation === 'channels') {
                localItems = [
                  { id: 'demo-chan-1', community_id: 'demo-comm-1', name: 'general', type: 'text', created_at: new Date().toISOString() },
                  { id: 'demo-chan-2', community_id: 'demo-comm-2', name: 'general', type: 'text', created_at: new Date().toISOString() },
                  { id: 'demo-chan-3', community_id: 'demo-comm-3', name: 'general', type: 'text', created_at: new Date().toISOString() }
                ]
              }
            }

            let matched = localItems
            for (const filter of eqFilters) {
              matched = matched.filter((item: any) => item[filter.column] === filter.value)
            }
            return { data: matched[0] || null, error: matched[0] ? null : { message: 'Item not found' } }
          },
          then: async (resolve: any, reject: any) => {
            let localItems: any[] = []
            const stored = cookieStore.get(`demo-${relation}`)?.value
            if (stored) {
              try { localItems = JSON.parse(decodeURIComponent(stored)) } catch {}
            } else {
              if (relation === 'communities') {
                localItems = [
                  { id: 'demo-comm-1', name: 'Fantasy Book Club', description: 'Discuss spells, swords, and magical worlds.', owner_id: 'demo-guest-id-12345', region: 'Asia-Pacific', genre: 'Fantasy', created_at: new Date().toISOString() },
                  { id: 'demo-comm-2', name: 'Sci-Fi Explorers', description: 'Deep space exploration and cybernetic futures.', owner_id: 'other-user', region: 'Europe', genre: 'Sci-Fi', created_at: new Date().toISOString() },
                  { id: 'demo-comm-3', name: 'Detective Guild', description: 'Solving mysteries, one chapter at a time.', owner_id: 'other-user', region: 'North America', genre: 'Mystery', created_at: new Date().toISOString() }
                ]
              } else if (relation === 'channels') {
                localItems = [
                  { id: 'demo-chan-1', community_id: 'demo-comm-1', name: 'general', type: 'text', created_at: new Date().toISOString() },
                  { id: 'demo-chan-2', community_id: 'demo-comm-2', name: 'general', type: 'text', created_at: new Date().toISOString() },
                  { id: 'demo-chan-3', community_id: 'demo-comm-3', name: 'general', type: 'text', created_at: new Date().toISOString() }
                ]
              }
            }

            let combined = [...localItems]
            for (const filter of eqFilters) {
              combined = combined.filter((item: any) => item[filter.column] === filter.value)
            }

            if (relation === 'competition_entries') {
              const regionFilter = eqFilters.find(f => f.column === 'region')?.value || 'South Asia'
              const monthFilter = eqFilters.find(f => f.column === 'month')?.value || '2026-06'
              
              const mockCompetitors = [
                { id: 'comp-mock-1', user_id: 'demo-mock-user-1', region: regionFilter, month: monthFilter, selected_books: JSON.stringify([{title: 'The Great Gatsby', author: 'F. Scott Fitzgerald'}]), total_reading_time: 15600, created_at: new Date().toISOString(), users: { username: 'Aarav Sharma', email: 'aarav@readsphere.com' } },
                { id: 'comp-mock-2', user_id: 'demo-mock-user-2', region: regionFilter, month: monthFilter, selected_books: JSON.stringify([{title: 'Pride and Prejudice', author: 'Jane Austen'}]), total_reading_time: 10800, created_at: new Date().toISOString(), users: { username: 'Zoya Khan', email: 'zoya@readsphere.com' } },
                { id: 'comp-mock-3', user_id: 'demo-mock-user-3', region: regionFilter, month: monthFilter, selected_books: JSON.stringify([{title: 'Dracula', author: 'Bram Stoker'}]), total_reading_time: 21600, created_at: new Date().toISOString(), users: { username: 'Dev Patel', email: 'dev@readsphere.com' } }
              ]

              const mappedCombined = combined.map((item: any) => ({
                ...item,
                users: { username: 'Guest Reader (You)', email: 'guest@readsphere.com' }
              }))

              combined = [...mappedCombined, ...mockCompetitors]
            }

            if (orderCol) {
              const ascending = true
              combined.sort((a, b) => {
                if (a[orderCol] < b[orderCol]) return ascending ? -1 : 1
                if (a[orderCol] > b[orderCol]) return ascending ? 1 : -1
                return 0
              })
            }

            return resolve({ data: combined, error: null })
          }
        }
        return chain as any
      }
    }

    return originalFrom(relation)
  }

  return client
}
