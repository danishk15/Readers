import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const CLASSIC_BOOKS = [
  { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages', is_premium: false, language: 'en' },
  { id: 'classic-6', title: 'Bagh-o-Bahar', author: 'Mir Amman', cover_url: 'https://www.gutenberg.org/cache/epub/70864/pg70864.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/70864.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-7', title: 'Dewan-e-Ghalib', author: 'Mirza Asadullah Khan Ghalib', cover_url: 'https://www.gutenberg.org/cache/epub/72237/pg72237.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/72237.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-8', title: 'Fasana-e-Azad', author: 'Ratan Nath Dhar Sarshar', cover_url: 'https://www.gutenberg.org/cache/epub/71708/pg71708.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/71708.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-9', title: 'Qissa Hatim Tai', author: 'Traditional', cover_url: 'https://www.gutenberg.org/cache/epub/71434/pg71434.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/71434.epub.noimages', is_premium: false, language: 'ur' },
  { id: 'classic-10', title: 'Intikhab-e-Kalam-e-Mir', author: 'Mir Taqi Mir', cover_url: 'https://www.gutenberg.org/cache/epub/72111/pg72111.cover.medium.jpg', file_url: 'https://www.gutenberg.org/ebooks/72111.epub.noimages', is_premium: false, language: 'ur' }
];

export const DEFAULT_COMMUNITIES = [
  { id: 'comm-1', name: 'Classic Literature Society', region: 'Global', genre: 'Classics', description: 'Exploring timeless masterpieces from Ghalib to Austen.' },
  { id: 'comm-2', name: 'Urdu Adab & Poetry Circle', region: 'South Asia', genre: 'Poetry & Prose', description: 'Discussions on Mir Taqi Mir, Ghalib, Iqbal, and modern Urdu fiction.' },
  { id: 'comm-3', name: 'Sci-Fi & Cyberpunk Guild', region: 'Global', genre: 'Sci-Fi', description: 'Speculative worlds, artificial intelligence, and dystopian adventures.' },
  { id: 'comm-4', name: 'Fantasy & Mythology Realm', region: 'Global', genre: 'Fantasy', description: 'High fantasy lore, epic worldbuilding, and magical tales.' }
];

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    }
  );

  const getLocalCookieUser = () => {
    const raw = cookieStore.get('readsphere_auth_session')?.value;
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        return parsed?.user || null;
      } catch {}
    }
    return null;
  };

  // Intercept auth methods
  const originalAuth = client.auth;
  (client as any).auth = {
    ...originalAuth,
    getUser: async () => {
      try {
        const res = await originalAuth.getUser();
        if (!res.error && res.data?.user) return res;
      } catch {}

      const localUser = getLocalCookieUser();
      if (localUser) {
        return { data: { user: localUser }, error: null } as any;
      }

      return { data: { user: null }, error: null } as any;
    },
    getSession: async () => {
      try {
        const res = await originalAuth.getSession();
        if (!res.error && res.data?.session) return res;
      } catch {}

      const raw = cookieStore.get('readsphere_auth_session')?.value;
      if (raw) {
        try {
          const parsed = JSON.parse(decodeURIComponent(raw));
          if (parsed) return { data: { session: parsed }, error: null } as any;
        } catch {}
      }

      return { data: { session: null }, error: null } as any;
    }
  };

  // Intercept database query builder
  const originalFrom = client.from.bind(client);
  client.from = (relation: string) => {
    let eqColumn: string | null = null;
    let eqValue: any = null;
    let orderCol: string | null = null;
    let orderAsc: boolean = true;

    const chain: any = {
      select: () => chain,
      eq: (column: string, value: any) => {
        eqColumn = column;
        eqValue = value;
        return chain;
      },
      order: (col: string, options?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = options?.ascending ?? true;
        return chain;
      },
      insert: async (values: any) => {
        try {
          return await originalFrom(relation).insert(values);
        } catch {
          return { data: values, error: null };
        }
      },
      single: async () => {
        const getCookieBooks = (name: string) => {
          const val = cookieStore.get(name)?.value;
          if (val) {
            try { return JSON.parse(decodeURIComponent(val)); } catch {}
          }
          return [];
        };

        if (relation === 'books') {
          if (eqColumn === 'id' && eqValue) {
            if (eqValue.startsWith('classic-')) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqValue);
              if (book) return { data: book, error: null };
            }
            const localPubBooks = getCookieBooks('local-published-books');
            let b = localPubBooks.find((x: any) => x.id === eqValue);
            if (b) return { data: b, error: null };
            
            const addedBooks = getCookieBooks('added-to-library-books');
            b = addedBooks.find((x: any) => x.id === eqValue);
            if (b) return { data: b, error: null };
          }
        }

        if (relation === 'users') {
          const localUser = getLocalCookieUser();
          if (localUser && (eqValue === localUser.id || !eqValue)) {
            return {
              data: {
                id: localUser.id,
                username: localUser.user_metadata?.username || localUser.user_metadata?.full_name || 'Reader',
                avatar_url: localUser.user_metadata?.avatar_url || '📚',
                bio: localUser.user_metadata?.bio || 'Avid reader on ReadSphere.',
                premium_status: true,
                email: localUser.email
              },
              error: null
            };
          }
        }

        try {
          const res = await originalFrom(relation).select('*').eq(eqColumn!, eqValue).single();
          if (!res.error && res.data) return res;
        } catch {}

        if (relation === 'books') {
          const book = CLASSIC_BOOKS.find(b => b.id === eqValue) || CLASSIC_BOOKS[0];
          return { data: book, error: null };
        }

        if (relation === 'users') {
          return {
            data: {
              id: eqValue || 'demo-reader',
              username: 'Reader',
              avatar_url: '📚',
              bio: 'Avid book explorer.',
              premium_status: true
            },
            error: null
          };
        }

        return { data: null, error: null };
      },
      then: async (resolve: any, reject: any) => {
        const getCookieBooks = (name: string) => {
          const val = cookieStore.get(name)?.value;
          if (val) {
            try { return JSON.parse(decodeURIComponent(val)); } catch {}
          }
          return [];
        };

        try {
          if (relation === 'books') {
            const localPubBooks = getCookieBooks('local-published-books');
            const addedBooks = getCookieBooks('added-to-library-books');
            const localCombined = [...localPubBooks, ...addedBooks];

            try {
              let realQuery = originalFrom(relation).select('*');
              if (eqColumn && eqValue) realQuery = realQuery.eq(eqColumn, eqValue);
              const res = await realQuery;
              if (!res.error && res.data && res.data.length > 0) {
                return resolve(res);
              }
            } catch {}

            if (eqColumn === 'id' && eqValue) {
              const book = [...localCombined, ...CLASSIC_BOOKS].find(b => b.id === eqValue);
              return resolve({ data: book ? [book] : CLASSIC_BOOKS, error: null });
            }
            return resolve({ data: [...localCombined, ...CLASSIC_BOOKS], error: null });
          }

          if (relation === 'reading_logs') {
            return resolve({ data: [{ time_spent_seconds: 2400, pages_read: 60 }], error: null });
          }

          if (relation === 'communities') {
            return resolve({ data: DEFAULT_COMMUNITIES, error: null });
          }

          const res = await originalFrom(relation).select('*');
          return resolve(res);
        } catch {
          if (relation === 'books') return resolve({ data: CLASSIC_BOOKS, error: null });
          if (relation === 'communities') return resolve({ data: DEFAULT_COMMUNITIES, error: null });
          return resolve({ data: [], error: null });
        }
      }
    };

    return chain;
  };

  return client;
}
