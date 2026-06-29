import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const CLASSIC_BOOKS = [
  { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages', is_premium: true, language: 'en' },
  { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages', is_premium: true, language: 'en' },
  { id: 'classic-6', title: 'Bagh-o-Bahar', author: 'Mir Amman', cover_url: 'https://www.gutenberg.org/cache/epub/70864/pg70864.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/70864.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-7', title: 'Dewan-e-Ghalib', author: 'Mirza Asadullah Khan Ghalib', cover_url: 'https://www.gutenberg.org/cache/epub/72237/pg72237.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/72237.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-8', title: 'Fasana-e-Azad', author: 'Ratan Nath Dhar Sarshar', cover_url: 'https://www.gutenberg.org/cache/epub/71708/pg71708.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/71708.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-9', title: 'Qissa Hatim Tai', author: 'Traditional', cover_url: 'https://www.gutenberg.org/cache/epub/71434/pg71434.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/71434.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-10', title: 'Intikhab-e-Kalam-e-Mir', author: 'Mir Taqi Mir', cover_url: 'https://www.gutenberg.org/cache/epub/72111/pg72111.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/72111.epub.noimages', is_premium: false, language: 'ur' }
];

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
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

  // Generic interceptor for local classic books
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
        insert: (values: any) => {
          return originalFrom(relation).insert(values);
        },
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

    return originalFrom(relation)
  }

  return client
}
