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
        let updatePayload: any = null
        const mockUserRegion = typeof window !== 'undefined' ? localStorage.getItem('demo-user-region') || 'South Asia' : 'South Asia'
        const mockUserPremium = typeof window !== 'undefined' ? localStorage.getItem('demo-premium_status') === 'true' : false

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
          update: (payload: any) => {
            updatePayload = payload
            if (typeof window !== 'undefined') {
              if (payload.region) {
                localStorage.setItem('demo-user-region', payload.region)
                document.cookie = "demo-user-region=" + encodeURIComponent(payload.region) + "; path=/; max-age=31536000"
              }
              if (payload.premium_status !== undefined) {
                localStorage.setItem('demo-premium_status', String(payload.premium_status))
                document.cookie = "demo-premium_status=" + String(payload.premium_status) + "; path=/; max-age=31536000"
              }
            }
            return chain
          },
          then: (resolve: any) => {
            if (updatePayload && typeof window !== 'undefined') {
              if (updatePayload.region) mockResponse.data.region = updatePayload.region
              if (updatePayload.premium_status !== undefined) mockResponse.data.premium_status = updatePayload.premium_status
            }
            return Promise.resolve(mockResponse).then(resolve)
          }
        }
        return chain as any
      }

      if (['comments', 'reading_logs', 'messages', 'communities', 'channels', 'competition_entries'].includes(relation)) {
        let selectArgs: any[] = []
        let eqFilters: { column: string; value: any }[] = []
        let orderCol: string = ''
        let updatePayload: any = null

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
              let localItems: any[] = []
              if (typeof window !== 'undefined') {
                if (relation === 'communities') {
                  const items = localStorage.getItem('demo-communities')
                  localItems = items ? JSON.parse(items) : [
                    { id: 'demo-comm-1', name: 'Fantasy Book Club', description: 'Discuss spells, swords, and magical worlds.', owner_id: 'demo-guest-id-12345', region: 'Asia-Pacific', genre: 'Fantasy', created_at: new Date().toISOString() },
                    { id: 'demo-comm-2', name: 'Sci-Fi Explorers', description: 'Deep space exploration and cybernetic futures.', owner_id: 'other-user', region: 'Europe', genre: 'Sci-Fi', created_at: new Date().toISOString() },
                    { id: 'demo-comm-3', name: 'Detective Guild', description: 'Solving mysteries, one chapter at a time.', owner_id: 'other-user', region: 'North America', genre: 'Mystery', created_at: new Date().toISOString() }
                  ]
                } else if (relation === 'channels') {
                  const items = localStorage.getItem('demo-channels')
                  localItems = items ? JSON.parse(items) : [
                    { id: 'demo-chan-1', community_id: 'demo-comm-1', name: 'general', type: 'text', created_at: new Date().toISOString() },
                    { id: 'demo-chan-2', community_id: 'demo-comm-2', name: 'general', type: 'text', created_at: new Date().toISOString() },
                    { id: 'demo-chan-3', community_id: 'demo-comm-3', name: 'general', type: 'text', created_at: new Date().toISOString() }
                  ]
                } else {
                  localItems = JSON.parse(localStorage.getItem(`demo-${relation}`) || '[]')
                }
              }
              
              let matched = localItems
              for (const filter of eqFilters) {
                matched = matched.filter((item: any) => item[filter.column] === filter.value)
              }
              return { data: matched[0] || null, error: matched[0] ? null : { message: 'Item not found' } }
            } catch (e: any) {
              return { data: null, error: e }
            }
          },
          insert: async (payload: any) => {
            try {
              const payloadArray = Array.isArray(payload) ? payload : [payload]
              let items = []
              try {
                if (typeof window !== 'undefined') {
                  const stored = localStorage.getItem(`demo-${relation}`)
                  if (stored) {
                    items = JSON.parse(stored)
                  } else {
                    if (relation === 'communities') {
                      items = [
                        { id: 'demo-comm-1', name: 'Fantasy Book Club', description: 'Discuss spells, swords, and magical worlds.', owner_id: 'demo-guest-id-12345', region: 'Asia-Pacific', genre: 'Fantasy', created_at: new Date().toISOString() },
                        { id: 'demo-comm-2', name: 'Sci-Fi Explorers', description: 'Deep space exploration and cybernetic futures.', owner_id: 'other-user', region: 'Europe', genre: 'Sci-Fi', created_at: new Date().toISOString() },
                        { id: 'demo-comm-3', name: 'Detective Guild', description: 'Solving mysteries, one chapter at a time.', owner_id: 'other-user', region: 'North America', genre: 'Mystery', created_at: new Date().toISOString() }
                      ]
                    } else if (relation === 'channels') {
                      items = [
                        { id: 'demo-chan-1', community_id: 'demo-comm-1', name: 'general', type: 'text', created_at: new Date().toISOString() },
                        { id: 'demo-chan-2', community_id: 'demo-comm-2', name: 'general', type: 'text', created_at: new Date().toISOString() },
                        { id: 'demo-chan-3', community_id: 'demo-comm-3', name: 'general', type: 'text', created_at: new Date().toISOString() }
                      ]
                    }
                  }
                }
              } catch {}

              const newItems = payloadArray.map((item: any) => {
                const prefix = relation === 'comments' ? 'local-comment-' 
                              : relation === 'messages' ? 'local-message-' 
                              : relation === 'communities' ? 'demo-comm-'
                              : relation === 'channels' ? 'demo-chan-'
                              : relation === 'competition_entries' ? 'demo-comp-'
                              : 'local-log-'
                const newItem: any = {
                  id: prefix + Math.random().toString(36).substring(2),
                  created_at: new Date().toISOString(),
                  user_id: item.user_id || 'demo-guest-id-12345',
                  ...item
                }
                if (relation === 'comments') newItem.user_email = 'guest@readsphere.com'
                return newItem
              })

              if (typeof window !== 'undefined') {
                const combinedItems = [...newItems, ...items]
                localStorage.setItem(`demo-${relation}`, JSON.stringify(combinedItems))
                document.cookie = `demo-${relation}=` + encodeURIComponent(JSON.stringify(combinedItems)) + "; path=/; max-age=31536000"
              }
              const mockResult = { data: newItems, error: null }
              return {
                ...mockResult,
                select: () => {
                  return {
                    single: async () => ({ data: newItems[0], error: null })
                  }
                }
              } as any
            } catch (e: any) {
              return { data: null, error: e }
            }
          },
          update: (payload: any) => {
            updatePayload = payload
            return chain
          },
          then: async (resolve: any, reject: any) => {
            try {
              let localItems = []
              try {
                if (typeof window !== 'undefined') {
                  const stored = localStorage.getItem(`demo-${relation}`)
                  if (stored) {
                    localItems = JSON.parse(stored)
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
                }
              } catch {}

              if (updatePayload && typeof window !== 'undefined') {
                localItems = localItems.map((item: any) => {
                  let match = true
                  for (const filter of eqFilters) {
                    if (item[filter.column] !== filter.value) match = false
                  }
                  if (match) {
                    return { ...item, ...updatePayload }
                  }
                  return item
                })
                localStorage.setItem(`demo-${relation}`, JSON.stringify(localItems))
                document.cookie = `demo-${relation}=` + encodeURIComponent(JSON.stringify(localItems)) + "; path=/; max-age=31536000"
              }

              let combined = [...localItems]

              for (const filter of eqFilters) {
                combined = combined.filter((item: any) => item[filter.column] === filter.value)
              }

              if (relation === 'comments') {
                combined = combined.map((c: any) => ({
                  id: c.id,
                  created_at: c.created_at,
                  content: c.content,
                  book_id: c.book_id,
                  users: { email: c.user_email || 'guest@readsphere.com' }
                }))
              } else if (relation === 'messages') {
                combined = combined.map((m: any) => ({
                  id: m.id,
                  created_at: m.created_at,
                  content: m.content,
                  channel_id: m.channel_id,
                  user_id: m.user_id,
                  users: { username: 'Guest Reader', avatar_url: null, email: 'guest@readsphere.com' }
                }))
              } else if (relation === 'competition_entries') {
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

