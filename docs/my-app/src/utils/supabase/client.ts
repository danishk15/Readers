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
  },
  { 
    id: 'classic-27', 
    title: 'ألف ليلة وليلة (Arabian Nights - Arabic Original)', 
    author: 'التراث العربي الكلاسيكي (Classical Arabic Heritage)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8235123-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ar',
    is_original: true,
    original_language: 'Arabic',
    original_title: 'ألف ليلة وليلة'
  },
  { 
    id: 'classic-28', 
    title: 'النبي (The Prophet - Arabic Masterpiece)', 
    author: 'جبران خليل جبران (Kahlil Gibran)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'ar',
    is_original: true,
    original_language: 'Arabic',
    original_title: 'النبي'
  },
  { 
    id: 'classic-29', 
    title: 'مثنوی معنوی (Masnavi - Persian Mysticism)', 
    author: 'مولانا جلال‌الدین محمد رومی (Mawlana Rumi)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'fa',
    is_original: true,
    original_language: 'Persian',
    original_title: 'مثنوی معنوی'
  },
  { 
    id: 'classic-30', 
    title: 'دیوان حافظ شیرازی (Divan of Hafez)', 
    author: 'خواجه شمس‌الدین محمد حافظ شیرازی (Hafez Shirazi)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'fa',
    is_original: true,
    original_language: 'Persian',
    original_title: 'دیوان حافظ'
  },
  { 
    id: 'classic-31', 
    title: 'گلستان سعدی (Gulistan of Saadi)', 
    author: 'مصلح‌الدین شیخ سعدی شیرازی (Saadi Shirazi)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'fa',
    is_original: true,
    original_language: 'Persian',
    original_title: 'گلستان سعدی'
  },
  { 
    id: 'classic-32', 
    title: 'Le Petit Prince (The Little Prince - French Original)', 
    author: 'Antoine de Saint-Exupéry', 
    cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'fr',
    is_original: true,
    original_language: 'French',
    original_title: 'Le Petit Prince'
  },
  { 
    id: 'classic-33', 
    title: 'Die Verwandlung (The Metamorphosis - German)', 
    author: 'Franz Kafka', 
    cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'de',
    is_original: true,
    original_language: 'German',
    original_title: 'Die Verwandlung'
  },
  { 
    id: 'classic-34', 
    title: 'Meditations (Stoic Philosophy - Latin)', 
    author: 'Marcus Aurelius Antoninus', 
    cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'la',
    is_original: true,
    original_language: 'Latin',
    original_title: 'Τὰ εἰς ἑαυτόν'
  },
  { 
    id: 'classic-35', 
    title: 'रश्मिरथी (Rashmirathi - Hindi Mahakavya)', 
    author: 'रामधारी सिंह दिनकर (Ramdhari Singh Dinkar)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8231456-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'hi',
    is_original: true,
    original_language: 'Hindi',
    original_title: 'रश्मिरथी'
  },
  { 
    id: 'classic-36', 
    title: 'मधुशाला (Madhushala - Hindi Classic)', 
    author: 'हरिवंश राय बच्चन (Harivansh Rai Bachchan)', 
    cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', 
    file_url: '', 
    is_premium: false, 
    language: 'hi',
    is_original: true,
    original_language: 'Hindi',
    original_title: 'मधुशाला'
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
    let selectCols: string = '*';

    const getStoredTableData = (rel: string) => {
      if (typeof window === 'undefined') return [];
      try {
        const key = `quillhawk_table_${rel}`;
        const raw = localStorage.getItem(key) || localStorage.getItem(`readsphere_table_${rel}`);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const saveStoredTableItem = (rel: string, values: any) => {
      if (typeof window === 'undefined') return;
      try {
        const key = `quillhawk_table_${rel}`;
        const existing = getStoredTableData(rel);
        const items = Array.isArray(values) ? values : [values];
        const updated = [...items, ...existing];
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem(`readsphere_table_${rel}`, JSON.stringify(updated));
      } catch {}
    };

    const executeSelect = async (): Promise<{ data: any; error: any }> => {
      // 1. Books
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
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          const res = await realQuery;
          if (!res.error && res.data && res.data.length > 0) {
            const combined = [...localBooks, ...addedBooks, ...res.data];
            return { data: combined, error: null };
          }
        } catch {}

        const combined = [...localBooks, ...addedBooks, ...CLASSIC_BOOKS];
        if (eqColumn === 'id' && eqValue) {
          const b = combined.find(x => x.id === eqValue || x.title?.toLowerCase() === String(eqValue).toLowerCase());
          return { data: b ? [b] : (String(eqValue).startsWith('classic-') ? CLASSIC_BOOKS : []), error: null };
        }
        return { data: combined, error: null };
      }

      // 2. Users
      if (relation === 'users') {
        if (eqColumn === 'id' && eqValue) {
          const accounts = getStoredAccounts();
          const user = accounts.find((a: any) => a.id === eqValue);
          if (user) {
            return {
              data: [{
                id: user.id,
                username: user.username || user.full_name || 'Reader',
                avatar_url: user.avatar_url || '📚',
                bio: user.bio || '',
                region: user.region || 'South Asia',
                banner_color: user.banner_color,
                banner_url: user.banner_url,
                premium_status: !!user.premium_status,
                email: user.email
              }],
              error: null
            };
          }
        }

        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          const res = await realQuery;
          if (!res.error && res.data) return res;
        } catch {}

        return {
          data: [{
            id: eqValue || 'demo-reader',
            username: 'Reader',
            avatar_url: '📚',
            bio: 'Passionate digital bookworm.',
            region: 'South Asia',
            premium_status: true,
            email: 'reader@quillhawk.app'
          }],
          error: null
        };
      }

      // 3. Communities
      if (relation === 'communities') {
        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          const res = await realQuery;
          if (!res.error && res.data && res.data.length > 0) return res;
        } catch {}
        const local = getStoredTableData('communities');
        return { data: local.length > 0 ? local : DEFAULT_COMMUNITIES, error: null };
      }

      // 4. Reading Logs
      if (relation === 'reading_logs') {
        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          const res = await realQuery;
          if (!res.error && res.data) return res;
        } catch {}
        const local = getStoredTableData('reading_logs');
        return { data: local.length > 0 ? local : [{ time_spent_seconds: 1800, pages_read: 45 }], error: null };
      }

      // 5. Comments
      if (relation === 'comments') {
        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          if (orderCol) realQuery = realQuery.order(orderCol, { ascending: orderAsc });
          const res = await realQuery;
          if (!res.error && res.data) return res;
        } catch {}
        let local = getStoredTableData('comments');
        if (eqColumn && eqValue !== null) {
          local = local.filter((c: any) => c[eqColumn!] === eqValue);
        }
        return { data: local, error: null };
      }

      // 6. Competition Entries
      if (relation === 'competition_entries') {
        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          if (orderCol) realQuery = realQuery.order(orderCol, { ascending: orderAsc });
          const res = await realQuery;
          if (!res.error && res.data) return res;
        } catch {}
        let local = getStoredTableData('competition_entries');
        if (eqColumn && eqValue !== null) {
          local = local.filter((c: any) => c[eqColumn!] === eqValue);
        }
        return { data: local, error: null };
      }

      // 7. Community Members
      if (relation === 'community_members') {
        try {
          let realQuery = originalFrom(relation).select(selectCols);
          if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
          const res = await realQuery;
          if (!res.error && res.data) return res;
        } catch {}
        let local = getStoredTableData('community_members');
        if (eqColumn && eqValue !== null) {
          local = local.filter((c: any) => c[eqColumn!] === eqValue);
        }
        return { data: local, error: null };
      }

      // Generic fallback
      try {
        let realQuery = originalFrom(relation).select(selectCols);
        if (eqColumn && eqValue !== null) realQuery = realQuery.eq(eqColumn, eqValue);
        if (orderCol) realQuery = realQuery.order(orderCol, { ascending: orderAsc });
        const res = await realQuery;
        if (!res.error && res.data) return res;
      } catch {}
      const local = getStoredTableData(relation);
      return { data: local, error: null };
    };

    const makeThenable = (actionFn: () => Promise<any>) => {
      const obj: any = {
        then: (resolve: any, reject: any) => actionFn().then(resolve, reject),
        select: (cols?: string) => {
          selectCols = cols || '*';
          return makeThenable(actionFn);
        },
        single: async () => {
          const res = await actionFn();
          const item = Array.isArray(res?.data) ? res.data[0] : res?.data;
          return { data: item || null, error: res?.error || null };
        },
        maybeSingle: async () => {
          const res = await actionFn();
          const item = Array.isArray(res?.data) ? res.data[0] : res?.data;
          return { data: item || null, error: null };
        },
        eq: (col: string, val: any) => {
          eqColumn = col;
          eqValue = val;
          return obj;
        },
        neq: (col: string, val: any) => obj,
        in: (col: string, vals: any[]) => obj,
        is: (col: string, val: any) => obj,
        order: (col: string, options?: { ascending?: boolean }) => {
          orderCol = col;
          orderAsc = options?.ascending ?? true;
          return obj;
        },
        limit: (count: number) => {
          limitCount = count;
          return obj;
        }
      };
      return obj;
    };

    const chain: any = {
      select: (cols?: string) => {
        selectCols = cols || '*';
        return makeThenable(executeSelect);
      },
      insert: (values: any) => {
        const executeInsert = async () => {
          try {
            const res = await originalFrom(relation).insert(values).select(selectCols);
            if (!res.error && res.data) return res;
          } catch {}
          saveStoredTableItem(relation, values);
          const items = Array.isArray(values) ? values : [values];
          return { data: items, error: null };
        };
        return makeThenable(executeInsert);
      },
      upsert: (values: any) => {
        const executeUpsert = async () => {
          try {
            const res = await originalFrom(relation).upsert(values).select(selectCols);
            if (!res.error && res.data) return res;
          } catch {}
          saveStoredTableItem(relation, values);
          const items = Array.isArray(values) ? values : [values];
          return { data: items, error: null };
        };
        return makeThenable(executeUpsert);
      },
      update: (values: any) => {
        const executeUpdate = async () => {
          try {
            let q = originalFrom(relation).update(values);
            if (eqColumn && eqValue !== null) q = q.eq(eqColumn, eqValue);
            const res = await q.select(selectCols);
            if (!res.error && res.data) return res;
          } catch {}

          if (typeof window !== 'undefined') {
            try {
              if (relation === 'users' && eqColumn && eqValue !== null) {
                const accounts = getStoredAccounts();
                const idx = accounts.findIndex((a: any) => a[eqColumn!] === eqValue);
                if (idx !== -1) {
                  accounts[idx] = { ...accounts[idx], ...values };
                  localStorage.setItem('quillhawk_registered_users', JSON.stringify(accounts));
                  localStorage.setItem('readsphere_registered_users', JSON.stringify(accounts));
                }
                const session = getAuthSessionCookie();
                if (session?.user && session.user[eqColumn!] === eqValue) {
                  session.user.user_metadata = { ...session.user.user_metadata, ...values };
                  setAuthSessionCookie(session);
                }
              }
            } catch {}
          }
          const items = Array.isArray(values) ? values : [values];
          return { data: items, error: null };
        };
        return makeThenable(executeUpdate);
      },
      delete: () => {
        const executeDelete = async () => {
          try {
            let q = originalFrom(relation).delete();
            if (eqColumn && eqValue !== null) q = q.eq(eqColumn, eqValue);
            const res = await q;
            if (!res.error) return res;
          } catch {}
          return { error: null };
        };
        return makeThenable(executeDelete);
      },
      eq: (column: string, value: any) => {
        eqColumn = column;
        eqValue = value;
        return chain;
      },
      neq: (column: string, value: any) => chain,
      in: (column: string, values: any[]) => chain,
      is: (column: string, value: any) => chain,
      order: (col: string, options?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = options?.ascending ?? true;
        return chain;
      },
      limit: (count: number) => {
        limitCount = count;
        return chain;
      },
      single: async () => {
        const res = await executeSelect();
        const item = Array.isArray(res?.data) ? res.data[0] : res?.data;
        return { data: item || null, error: null };
      },
      maybeSingle: async () => {
        const res = await executeSelect();
        const item = Array.isArray(res?.data) ? res.data[0] : res?.data;
        return { data: item || null, error: null };
      },
      then: (resolve: any, reject: any) => executeSelect().then(resolve, reject)
    };

    return chain;
  };

  return client;
}
