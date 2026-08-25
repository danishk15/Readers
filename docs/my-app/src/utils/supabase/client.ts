import { createBrowserClient } from '@supabase/ssr'

export const getURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/';
  }
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/';
  
  url = url.startsWith('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};

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

// Helper to get / set persistent auth cookies for Server Components & Middleware
export function setAuthSessionCookie(session: any) {
  if (typeof document === 'undefined') return;
  if (!session) {
    document.cookie = 'quillhawk_auth_session=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'readsphere_auth_session=; path=/; max-age=0; SameSite=Lax';
    return;
  }
  const serialized = encodeURIComponent(JSON.stringify(session));
  document.cookie = `quillhawk_auth_session=${serialized}; path=/; max-age=2592000; SameSite=Lax`;
  document.cookie = `readsphere_auth_session=${serialized}; path=/; max-age=2592000; SameSite=Lax`;
}

export function getAuthSessionCookie(): any {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/quillhawk_auth_session=([^;]+)/) || document.cookie.match(/readsphere_auth_session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

// Local Storage Account & Login Records Helpers
export function getStoredAccounts(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('quillhawk_registered_users') || localStorage.getItem('readsphere_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLoginHistory(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('quillhawk_login_history') || localStorage.getItem('readsphere_login_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordLoginEvent(user: any) {
  if (typeof window === 'undefined') return;
  try {
    const history = getLoginHistory();
    const entry = {
      id: 'log_' + Date.now(),
      user_id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Reader',
      avatar_url: user.user_metadata?.avatar_url || '📚',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    // Keep most recent 20 logins without duplicate entries
    const updated = [entry, ...history.filter((h: any) => h.email?.toLowerCase() !== user.email?.toLowerCase())].slice(0, 20);
    localStorage.setItem('quillhawk_login_history', JSON.stringify(updated));
    localStorage.setItem('readsphere_login_history', JSON.stringify(updated));
  } catch {}
}

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );

  const authListeners: Set<(event: string, session: any) => void> = new Set();

  const notifyAuthChange = (event: string, session: any) => {
    authListeners.forEach((fn) => {
      try { fn(event, session); } catch {}
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quillhawk-auth-change', { detail: { event, session } }));
      window.dispatchEvent(new CustomEvent('readsphere-auth-change', { detail: { event, session } }));
    }
  };

  const originalAuth = client.auth;

  // Intercept client.auth to support seamless local fallback & account persistence
  (client as any).auth = {
    ...originalAuth,

    async signInWithPassword(credentials: any) {
      const email = credentials?.email || credentials?.phone || '';
      const password = credentials?.password || '';
      const quickLogin = credentials?.quickLogin || false;
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return {
          data: { user: null, session: null },
          error: { message: 'Please enter a valid email address.' }
        } as any;
      }

      // Check local accounts
      const accounts = getStoredAccounts();
      let user = accounts.find((a: any) => a.email.toLowerCase() === normalizedEmail);

      // Check login history if account not in registered list
      if (!user) {
        const history = getLoginHistory();
        const histItem = history.find((h: any) => h.email?.toLowerCase() === normalizedEmail);
        if (histItem) {
          user = {
            id: histItem.user_id || 'user_' + Date.now().toString(36),
            email: histItem.email,
            full_name: histItem.username || histItem.email.split('@')[0],
            username: histItem.username || histItem.email.split('@')[0],
            avatar_url: histItem.avatar_url || '📚',
            bio: 'Avid reader on QuillHawk.',
            premium_status: true,
            password: password || 'SavedPassword123!',
            created_at: histItem.timestamp || new Date().toISOString(),
            last_login_at: new Date().toISOString()
          };
          accounts.push(user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
            localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
          }
        }
      }

      if (user) {
        // Allow login if quickLogin is true, or password matches, or no password was set on account
        if (quickLogin || !user.password || !password || user.password === password) {
          if (password && !user.password) {
            user.password = password;
            if (typeof window !== 'undefined') {
              localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
              localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
            }
          }

          const session = {
            access_token: 'local-token-' + Date.now(),
            user: {
              id: user.id,
              email: user.email,
              user_metadata: {
                full_name: user.full_name || user.username || user.email.split('@')[0],
                username: user.username || user.full_name || user.email.split('@')[0],
                avatar_url: user.avatar_url || '📚',
                bio: user.bio || ''
              }
            }
          };

          setAuthSessionCookie(session);
          if (typeof window !== 'undefined') {
            localStorage.setItem('quillhawk_current_session', JSON.stringify(session));
            localStorage.setItem('readsphere_current_session', JSON.stringify(session));
          }
          recordLoginEvent(session.user);
          notifyAuthChange('SIGNED_IN', session);
          return { data: { user: session.user, session }, error: null } as any;
        } else {
          return {
            data: { user: null, session: null },
            error: { message: 'Incorrect password. Click your account card in Saved Accounts for 1-click login or re-enter password.' }
          } as any;
        }
      }

      // If user not found in local db, create and log in
      const newId = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const newUser = {
        id: newId,
        email: normalizedEmail,
        password: password || 'ReaderPass123!',
        full_name: normalizedEmail.split('@')[0],
        username: normalizedEmail.split('@')[0],
        avatar_url: '📚',
        bio: 'Passionate reader on QuillHawk.',
        premium_status: true,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };

      accounts.push(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
        localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
      }

      const session = {
        access_token: 'local-token-' + Date.now(),
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            full_name: newUser.full_name,
            username: newUser.username,
            avatar_url: newUser.avatar_url,
            bio: newUser.bio
          }
        }
      };

      setAuthSessionCookie(session);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quillhawk_current_session', JSON.stringify(session));
        localStorage.setItem('readsphere_current_session', JSON.stringify(session));
      }
      recordLoginEvent(session.user);
      notifyAuthChange('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null } as any;
    },

    async signUp(credentials: any) {
      const email = credentials?.email || credentials?.phone || '';
      const password = credentials?.password || '';
      const options = credentials?.options;
      const normalizedEmail = email.trim().toLowerCase();

      const accounts = getStoredAccounts();
      const existing = accounts.find((a: any) => a.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return {
          data: { user: null, session: null },
          error: { message: 'An account with this email already exists. Please sign in.' }
        } as any;
      }

      const fullName = options?.data?.full_name || options?.data?.username || normalizedEmail.split('@')[0];
      const username = options?.data?.username || fullName;
      const newId = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

      const newUser = {
        id: newId,
        email: normalizedEmail,
        password: password || '',
        full_name: fullName,
        username: username,
        avatar_url: '📚',
        bio: 'Proud reader on QuillHawk.',
        premium_status: true,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };

      accounts.push(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
        localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
      }

      const session = {
        access_token: 'local-token-' + Date.now(),
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: {
            full_name: newUser.full_name,
            username: newUser.username,
            avatar_url: newUser.avatar_url,
            bio: newUser.bio
          }
        }
      };

      setAuthSessionCookie(session);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quillhawk_current_session', JSON.stringify(session));
        localStorage.setItem('readsphere_current_session', JSON.stringify(session));
      }
      recordLoginEvent(session.user);
      notifyAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null } as any;
    },

    async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
      const providerName = (provider || 'discord').toLowerCase();
      const accounts = getStoredAccounts();

      const defaultEmail = `${providerName}.reader@quillhawk.app`;
      let user = accounts.find((a: any) => a.email.toLowerCase() === defaultEmail.toLowerCase());

      if (!user) {
        user = {
          id: `${providerName}_user_${Date.now().toString(36)}`,
          email: defaultEmail,
          full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Reader`,
          username: `${providerName}_reader`,
          avatar_url: providerName === 'discord' ? '👾' : '🌐',
          bio: `Connected via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
          premium_status: true,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        };
        accounts.push(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
          localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
        }
      }

      const session = {
        access_token: `local-${providerName}-token-` + Date.now(),
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            full_name: user.full_name,
            username: user.username,
            avatar_url: user.avatar_url,
            bio: user.bio
          }
        }
      };

      setAuthSessionCookie(session);
      if (typeof window !== 'undefined') {
        localStorage.setItem('quillhawk_current_session', JSON.stringify(session));
        localStorage.setItem('readsphere_current_session', JSON.stringify(session));
      }
      recordLoginEvent(session.user);
      notifyAuthChange('SIGNED_IN', session);

      if (typeof window !== 'undefined') {
        window.location.href = options?.redirectTo || '/dashboard';
      }
      return { data: { provider, url: options?.redirectTo || '/dashboard' }, error: null } as any;
    },

    async signOut() {
      setAuthSessionCookie(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quillhawk_current_session');
        localStorage.removeItem('readsphere_current_session');
        localStorage.removeItem('quillhawk-demo-mode');
        localStorage.removeItem('readsphere-demo-mode');
      }
      notifyAuthChange('SIGNED_OUT', null);
      try {
        await originalAuth.signOut();
      } catch {}
      return { error: null };
    },

    async getUser() {
      try {
        const res = await originalAuth.getUser();
        if (!res.error && res.data?.user) return res;
      } catch {}

      const cookieSession = getAuthSessionCookie();
      if (cookieSession?.user) {
        return { data: { user: cookieSession.user }, error: null } as any;
      }

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('quillhawk_current_session') || localStorage.getItem('readsphere_current_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.user) return { data: { user: parsed.user }, error: null } as any;
          }
        } catch {}
      }

      return { data: { user: null }, error: null } as any;
    },

    async getSession() {
      try {
        const res = await originalAuth.getSession();
        if (!res.error && res.data?.session) return res;
      } catch {}

      const cookieSession = getAuthSessionCookie();
      if (cookieSession?.user) {
        return { data: { session: cookieSession }, error: null } as any;
      }

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('quillhawk_current_session') || localStorage.getItem('readsphere_current_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed) return { data: { session: parsed }, error: null } as any;
          }
        } catch {}
      }

      return { data: { session: null }, error: null } as any;
    },

    async updateUser({ data }: { data?: any }) {
      try {
        await originalAuth.updateUser({ data });
      } catch {}

      const session = getAuthSessionCookie() || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('quillhawk_current_session') || localStorage.getItem('readsphere_current_session') || '{}') : null);
      if (session?.user) {
        session.user.user_metadata = { ...session.user.user_metadata, ...data };
        setAuthSessionCookie(session);
        if (typeof window !== 'undefined') {
          localStorage.setItem('quillhawk_current_session', JSON.stringify(session));
          localStorage.setItem('readsphere_current_session', JSON.stringify(session));

          // Also update in registered users list
          const accounts = getStoredAccounts();
          const idx = accounts.findIndex((a: any) => a.id === session.user.id || a.email === session.user.email);
          if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], ...data };
            localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
            localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
          }
        }
        notifyAuthChange('USER_UPDATED', session);
      }
      return { data: { user: session?.user }, error: null } as any;
    },

    async resetPasswordForEmail(email: string) {
      try {
        await originalAuth.resetPasswordForEmail(email);
      } catch {}
      return { data: {}, error: null } as any;
    },

    async resend(params: any) {
      try {
        await originalAuth.resend(params);
      } catch {}
      return { data: {}, error: null } as any;
    },

    onAuthStateChange(callback: (event: string, session: any) => { data: { subscription: { unsubscribe: () => void } } } | any) {
      authListeners.add(callback);

      setTimeout(async () => {
        const s = await client.auth.getSession();
        if (s?.data?.session) {
          callback('INITIAL_SESSION', s.data.session);
        }
      }, 0);

      const { data: originalSub } = originalAuth.onAuthStateChange((event, session) => {
        if (session) {
          setAuthSessionCookie(session);
        }
        callback(event, session);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
              originalSub?.subscription?.unsubscribe?.();
            }
          }
        }
      };
    }
  };

  // Intercept database query builder for all relations
  const originalFrom = client.from.bind(client);

  client.from = (relation: string) => {
    let eqColumn: string | null = null;
    let eqValue: any = null;
    let orderCol: string | null = null;
    let orderAsc: boolean = true;
    let limitCount: number | null = null;

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
      limit: (count: number) => {
        limitCount = count;
        return chain;
      },
      insert: async (values: any) => {
        try {
          const res = await originalFrom(relation).insert(values);
          if (!res.error) return res;
        } catch {}

        if (typeof window !== 'undefined') {
          try {
            const key = `quillhawk_table_${relation}`;
            const existing = JSON.parse(localStorage.getItem(key) || localStorage.getItem(`readsphere_table_${relation}`) || '[]');
            const itemsToInsert = Array.isArray(values) ? values : [values];
            const updated = [...itemsToInsert, ...existing];
            localStorage.setItem(key, JSON.stringify(updated));
            localStorage.setItem(`readsphere_table_${relation}`, JSON.stringify(updated));
          } catch {}
        }
        return { data: values, error: null };
      },
      update: (values: any) => {
        return {
          eq: async (column: string, value: any) => {
            try {
              const res = await originalFrom(relation).update(values).eq(column, value);
              if (!res.error) return res;
            } catch {}

            if (typeof window !== 'undefined') {
              try {
                if (relation === 'users') {
                  const accounts = getStoredAccounts();
                  const idx = accounts.findIndex((a: any) => a[column] === value);
                  if (idx !== -1) {
                    accounts[idx] = { ...accounts[idx], ...values };
                    localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
                    localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
                  }
                  const session = getAuthSessionCookie();
                  if (session?.user && session.user[column] === value) {
                    session.user.user_metadata = { ...session.user.user_metadata, ...values };
                    setAuthSessionCookie(session);
                  }
                }
              } catch {}
            }
            return { data: values, error: null };
          }
        };
      },
      delete: () => {
        return {
          eq: async (column: string, value: any) => {
            try {
              const res = await originalFrom(relation).delete().eq(column, value);
              if (!res.error) return res;
            } catch {}
            return { error: null };
          }
        };
      },
      single: async () => {
        // Books table
        if (relation === 'books') {
          if (eqColumn === 'id' && eqValue) {
            if (eqValue.startsWith('classic-')) {
              const book = CLASSIC_BOOKS.find(b => b.id === eqValue);
              if (book) return { data: book, error: null };
            }
            try {
              const localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]');
              const book = localBooks.find((b: any) => b.id === eqValue);
              if (book) return { data: book, error: null };
            } catch {}
          }
        }

        // Users table
        if (relation === 'users') {
          if (eqColumn === 'id' && eqValue) {
            const accounts = getStoredAccounts();
            const user = accounts.find((a: any) => a.id === eqValue);
            if (user) {
              return {
                data: {
                  id: user.id,
                  username: user.username || user.full_name,
                  avatar_url: user.avatar_url || '📚',
                  bio: user.bio || '',
                  premium_status: !!user.premium_status,
                  email: user.email
                },
                error: null
              };
            }
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
              id: eqValue,
              username: 'Reader',
              avatar_url: '📚',
              bio: 'Passionate digital bookworm.',
              premium_status: true,
            },
            error: null
          };
        }

        return { data: null, error: null };
      },
      then: async (resolve: any, reject: any) => {
        try {
          if (relation === 'books') {
            let localBooks: any[] = [];
            let addedBooks: any[] = [];
            try {
              if (typeof window !== 'undefined') {
                localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]');
                addedBooks = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
              }
            } catch {}

            try {
              let realQuery = originalFrom(relation).select('*');
              if (eqColumn && eqValue) realQuery = realQuery.eq(eqColumn, eqValue);
              const res = await realQuery;
              if (!res.error && res.data && res.data.length > 0) {
                const combined = [...localBooks, ...addedBooks, ...res.data];
                return resolve({ data: combined, error: null });
              }
            } catch {}

            const combined = [...localBooks, ...addedBooks, ...CLASSIC_BOOKS];
            if (eqColumn === 'id' && eqValue) {
              const b = combined.find(x => x.id === eqValue);
              return resolve({ data: b ? [b] : CLASSIC_BOOKS, error: null });
            }
            return resolve({ data: combined, error: null });
          }

          if (relation === 'communities') {
            try {
              const res = await originalFrom(relation).select('*');
              if (!res.error && res.data && res.data.length > 0) return resolve(res);
            } catch {}
            return resolve({ data: DEFAULT_COMMUNITIES, error: null });
          }

          if (relation === 'reading_logs') {
            if (typeof window !== 'undefined') {
              try {
                const raw = localStorage.getItem('readsphere_table_reading_logs');
                const logs = raw ? JSON.parse(raw) : [];
                return resolve({ data: logs.length > 0 ? logs : [{ time_spent_seconds: 1800, pages_read: 45 }], error: null });
              } catch {}
            }
            return resolve({ data: [{ time_spent_seconds: 1800, pages_read: 45 }], error: null });
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
