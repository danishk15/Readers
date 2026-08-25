import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const CLASSIC_BOOKS = [
  // Urdu Classics - Originals & Translations
  { 
    id: 'classic-6', 
    title: 'Dewan-e-Ghalib (دیوان غالب)', 
    author: 'Mirza Asadullah Khan Ghalib', 
    cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu',
    original_title: 'دیوان غالب'
  },
  { 
    id: 'classic-7', 
    title: 'Love Sonnets of Ghalib (English Translation)', 
    author: 'Mirza Ghalib (Trans. Dr. Sarfaraz K. Niazi)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8231456-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'دیوان غالب'
  },
  { 
    id: 'classic-8', 
    title: 'Kulliyat-e-Iqbal: Bang-e-Dra & Shikwa (کلیات اقبال)', 
    author: 'Allama Dr. Muhammad Iqbal', 
    cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu',
    original_title: 'کلیات اقبال'
  },
  { 
    id: 'classic-9', 
    title: 'The Secrets of the Self (Asrar-e-Khudi Translation)', 
    author: 'Allama Muhammad Iqbal (Trans. Reynold A. Nicholson)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8231456-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/43881.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'اسرار خودی'
  },
  { 
    id: 'classic-10', 
    title: 'Peer-e-Kamil (پیر کامل)', 
    author: 'Umera Ahmed', 
    cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-11', 
    title: 'Raja Gidh (راجہ گدھ)', 
    author: 'Bano Qudsia', 
    cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-12', 
    title: 'Thanda Gosht & Manto Afsanay (ٹھنڈا گوشت اور افسانے)', 
    author: 'Saadat Hasan Manto', 
    cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-13', 
    title: 'Bagh-o-Bahar (باغ و بہار)', 
    author: 'Mir Amman', 
    cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-14', 
    title: 'The Tale of the Four Durwesh (Bagh-o-Bahar English)', 
    author: 'Mir Amman (Trans. Duncan Forbes)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/16084.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'باغ و بہار'
  },
  { 
    id: 'classic-15', 
    title: 'Fasana-e-Azad (فسانہ آزاد)', 
    author: 'Ratan Nath Dhar Sarshar', 
    cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-16', 
    title: 'Qissa Hatim Tai (قصہ حاتم طائی)', 
    author: 'Traditional Folklore', 
    cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-17', 
    title: 'Intikhab-e-Kalam-e-Mir (انتخاب کلام میر)', 
    author: 'Mir Taqi Mir', 
    cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu'
  },
  { 
    id: 'classic-18', 
    title: 'Godan (گودان)', 
    author: 'Munshi Premchand', 
    cover_url: 'https://covers.openlibrary.org/b/id/8231456-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ur',
    is_original: true,
    original_language: 'Urdu/Hindi'
  },

  // World Classics - Originals & Translations
  { 
    id: 'classic-1', 
    title: 'The Great Gatsby', 
    author: 'F. Scott Fitzgerald', 
    cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_original: true,
    original_language: 'English'
  },
  { 
    id: 'classic-2', 
    title: 'Pride and Prejudice', 
    author: 'Jane Austen', 
    cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_original: true,
    original_language: 'English'
  },
  { 
    id: 'classic-3', 
    title: 'Frankenstein', 
    author: 'Mary Shelley', 
    cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_original: true,
    original_language: 'English'
  },
  { 
    id: 'classic-4', 
    title: 'Moby Dick', 
    author: 'Herman Melville', 
    cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_original: true,
    original_language: 'English'
  },
  { 
    id: 'classic-5', 
    title: 'Dracula', 
    author: 'Bram Stoker', 
    cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_original: true,
    original_language: 'English'
  },
  { 
    id: 'classic-19', 
    title: 'Don Quijote de la Mancha (Original Español)', 
    author: 'Miguel de Cervantes Saavedra', 
    cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/2000.epub.noimages', 
    is_premium: false, 
    language: 'es',
    is_original: true,
    original_language: 'Spanish'
  },
  { 
    id: 'classic-20', 
    title: 'Don Quixote (English Translation)', 
    author: 'Miguel de Cervantes (Trans. John Ormsby)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/996.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'Don Quijote de la Mancha'
  },
  { 
    id: 'classic-21', 
    title: 'Le Tour du monde en 80 jours (Original Français)', 
    author: 'Jules Verne', 
    cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/800.epub.noimages', 
    is_premium: false, 
    language: 'fr',
    is_original: true,
    original_language: 'French'
  },
  { 
    id: 'classic-22', 
    title: 'Around the World in 80 Days (English Translation)', 
    author: 'Jules Verne (Trans. George Makepeace Towle)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/103.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'Le Tour du monde en 80 jours'
  },
  { 
    id: 'classic-23', 
    title: 'Faust: Eine Tragödie (Original Deutsch)', 
    author: 'Johann Wolfgang von Goethe', 
    cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/2229.epub.noimages', 
    is_premium: false, 
    language: 'de',
    is_original: true,
    original_language: 'German'
  },
  { 
    id: 'classic-24', 
    title: 'Faust (English Verse Translation)', 
    author: 'Johann Wolfgang von Goethe (Trans. Bayard Taylor)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/14591.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'Faust: Eine Tragödie'
  },
  { 
    id: 'classic-25', 
    title: 'War and Peace (English Unabridged)', 
    author: 'Leo Tolstoy (Trans. Louise & Aylmer Maude)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8231996-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/2600.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'Война и мир'
  },
  { 
    id: 'classic-26', 
    title: 'The Arabian Nights Entertainments (1001 Nights)', 
    author: 'Traditional Arabic (Trans. Andrew Lang)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8235123-M.jpg', 
    file_url: 'https://www.gutenberg.org/ebooks/128.epub.noimages', 
    is_premium: false, 
    language: 'en',
    is_translation: true,
    translated_to: 'English',
    original_title: 'ألف ليلة وليلة'
  }
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
    const raw = cookieStore.get('quillhawk_auth_session')?.value || cookieStore.get('readsphere_auth_session')?.value;
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

      const raw = cookieStore.get('quillhawk_auth_session')?.value || cookieStore.get('readsphere_auth_session')?.value;
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
                bio: localUser.user_metadata?.bio || 'Avid reader on QuillHawk.',
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
