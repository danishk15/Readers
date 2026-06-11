import { createBrowserClient } from '@supabase/ssr'

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};

export const CLASSIC_BOOKS = [
  { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.images', is_premium: false },
  { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.images', is_premium: false },
  { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.images', is_premium: true },
  { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.images', is_premium: false },
  { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.images', is_premium: true }
];

export function createClient() {
  const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true')

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    client.auth.onAuthStateChange = (callback) => {
      // Invoke callback immediately with signed in event and mock session
      setTimeout(() => {
        callback('SIGNED_IN', mockSession as any)
      }, 0)
      return {
        data: {
          subscription: {
            id: 'mock-subscription-id',
            callback: callback as any,
            unsubscribe: () => {}
          }
        }
      } as any
    }
  }

  // Intercept database query builder for both demo and normal mode
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
          if (eqId && eqId.startsWith('local-pub-')) {
            try {
              const localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]')
              const book = localBooks.find((b: any) => b.id === eqId)
              if (book) return { data: book, error: null }
            } catch {}
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
          try {
            if (eqId && eqId.startsWith('classic-')) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqId)
              if (book) return resolve({ data: book, error: null })
            }
            if (eqId && eqId.startsWith('local-pub-')) {
              try {
                const localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]')
                const book = localBooks.find((b: any) => b.id === eqId)
                if (book) return resolve({ data: book, error: null })
              } catch {}
            }

            if (isDemo) {
              let localBooks: any[] = []
              try {
                localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]')
              } catch {}
              const allBooks = [...localBooks, ...CLASSIC_BOOKS]
              if (eqId) {
                const book = allBooks.find(b => b.id === eqId)
                return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
              }
              return resolve({ data: allBooks, error: null })
            }

            let realQuery = originalFrom(relation).select('*')
            if (eqId) realQuery = realQuery.eq('id', eqId)
            const res = await realQuery

            let localBooks: any[] = []
            try {
              if (typeof window !== 'undefined') {
                localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]')
              }
            } catch {}

            let dbBooks = res.data || []
            if (res.error || dbBooks.length === 0) {
              dbBooks = CLASSIC_BOOKS
            }

            const combined = [...localBooks, ...dbBooks]
            if (eqId) {
              const book = combined.find(b => b.id === eqId)
              return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
            }
            return resolve({ data: combined, error: null })
          } catch (e) {
            let localBooks: any[] = []
            try {
              if (typeof window !== 'undefined') {
                localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]')
              }
            } catch {}
            if (eqId) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqId)
              return resolve({ data: book || null, error: book ? null : { message: 'Book not found' } })
            }
            return resolve({ data: [...localBooks, ...CLASSIC_BOOKS], error: null })
          }
        }
      }
      return chain as any
    }

    if (isDemo) {
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

      if (['comments', 'reading_logs', 'messages'].includes(relation)) {
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
            try {
              let realQuery = originalFrom(relation).select(selectArgs.join(','))
              for (const filter of eqFilters) {
                realQuery = realQuery.eq(filter.column, filter.value)
              }
              const res = await realQuery.single()
              return res
            } catch (e) {
              return { data: null, error: e }
            }
          },
          insert: async (payload: any) => {
            try {
              const payloadArray = Array.isArray(payload) ? payload : [payload]
              let items = []
              try {
                items = JSON.parse(localStorage.getItem(`demo-${relation}`) || '[]')
              } catch {}

              const newItems = payloadArray.map((item: any) => {
                const idField = relation === 'comments' ? 'local-comment-' : relation === 'messages' ? 'local-message-' : 'local-log-'
                const newItem: any = {
                  id: idField + Math.random().toString(36).substring(2),
                  created_at: new Date().toISOString(),
                  user_id: item.user_id || 'demo-guest-id-12345',
                  ...item
                }
                if (relation === 'comments') newItem.user_email = 'guest@readsphere.com'
                return newItem
              })

              localStorage.setItem(`demo-${relation}`, JSON.stringify([...newItems, ...items]))
              return { data: newItems, error: null }
            } catch (e: any) {
              return { data: null, error: e }
            }
          },
          then: async (resolve: any, reject: any) => {
            try {
              let realQuery = originalFrom(relation).select(selectArgs.join(','))
              for (const filter of eqFilters) {
                realQuery = realQuery.eq(filter.column, filter.value)
              }
              if (orderCol) {
                realQuery = realQuery.order(orderCol, { ascending: true })
              }
              const realRes = await realQuery

              let localItems = []
              try {
                localItems = JSON.parse(localStorage.getItem(`demo-${relation}`) || '[]')
              } catch {}

              let combined = [...(realRes.data || [])]
              if (relation === 'comments') {
                const bookFilter = eqFilters.find(f => f.column === 'book_id')?.value
                const filteredLocal = localItems
                  .filter((c: any) => c.book_id === bookFilter)
                  .map((c: any) => ({
                    id: c.id,
                    created_at: c.created_at,
                    content: c.content,
                    users: { email: c.user_email || 'guest@readsphere.com' }
                  }))
                combined = [...filteredLocal, ...combined]
              } else if (relation === 'reading_logs') {
                const userFilter = eqFilters.find(f => f.column === 'user_id')?.value
                const filteredLocal = localItems.filter((log: any) => log.user_id === userFilter)
                combined = [...combined, ...filteredLocal]
              } else if (relation === 'messages') {
                const channelFilter = eqFilters.find(f => f.column === 'channel_id')?.value
                const filteredLocal = localItems
                  .filter((m: any) => m.channel_id === channelFilter)
                  .map((m: any) => ({
                    id: m.id,
                    created_at: m.created_at,
                    content: m.content,
                    users: { username: 'Guest Reader', avatar_url: null, email: 'guest@readsphere.com' }
                  }))
                combined = [...combined, ...filteredLocal]
              }

              return resolve({ data: combined, error: null })
            } catch (e) {
              return reject ? reject(e) : resolve({ data: [], error: e })
            }
          }
        }
        return chain as any
      }
    }

    return originalFrom(relation)
  }

  return client
}

