import { NextResponse } from 'next/server';
import { stripHtml } from '@/utils/textSanitizer';

export interface UnifiedOnlineBook {
  id: string;
  source: 'Google Books' | 'Open Library' | 'Internet Archive' | 'Gutenberg' | 'Standard Ebooks' | 'Global Catalog';
  isPremium: boolean;
  price?: string;
  readMode: 'epub' | 'archive' | 'google' | 'interactive';
  file_url?: string;
  is_original?: boolean;
  is_translation?: boolean;
  original_language?: string;
  translated_to?: string;
  original_title?: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    imageLinks: {
      thumbnail: string | null;
      smallThumbnail?: string | null;
    } | null;
    infoLink?: string;
    previewLink?: string;
    language?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
  };
  accessInfo?: {
    ia?: string | null;
    epub?: {
      downloadLink: string | null;
    } | null;
  } | null;
}

// 40+ World Languages Mapping (ISO-639-1 & ISO-639-2)
const LANG_MAP: Record<string, { iso1: string; iso2: string; name: string; nativeName: string; isRtl?: boolean }> = {
  'urd': { iso1: 'ur', iso2: 'urd', name: 'Urdu', nativeName: 'اردو', isRtl: true },
  'ara': { iso1: 'ar', iso2: 'ara', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  'per': { iso1: 'fa', iso2: 'per', name: 'Persian', nativeName: 'فارسی', isRtl: true },
  'hin': { iso1: 'hi', iso2: 'hin', name: 'Hindi', nativeName: 'हिन्दी' },
  'eng': { iso1: 'en', iso2: 'eng', name: 'English', nativeName: 'English' },
  'spa': { iso1: 'es', iso2: 'spa', name: 'Spanish', nativeName: 'Español' },
  'fre': { iso1: 'fr', iso2: 'fre', name: 'French', nativeName: 'Français' },
  'ger': { iso1: 'de', iso2: 'ger', name: 'German', nativeName: 'Deutsch' },
  'rus': { iso1: 'ru', iso2: 'rus', name: 'Russian', nativeName: 'Русский' },
  'chi': { iso1: 'zh', iso2: 'chi', name: 'Chinese', nativeName: '中文' },
  'jpn': { iso1: 'ja', iso2: 'jpn', name: 'Japanese', nativeName: '日本語' },
  'por': { iso1: 'pt', iso2: 'por', name: 'Portuguese', nativeName: 'Português' },
  'ita': { iso1: 'it', iso2: 'ita', name: 'Italian', nativeName: 'Italiano' },
  'tur': { iso1: 'tr', iso2: 'tur', name: 'Turkish', nativeName: 'Türkçe' },
  'ben': { iso1: 'bn', iso2: 'ben', name: 'Bengali', nativeName: 'বাংলা' },
  'pan': { iso1: 'pa', iso2: 'pan', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / پنجابی' },
  'tam': { iso1: 'ta', iso2: 'tam', name: 'Tamil', nativeName: 'தமிழ்' },
  'tel': { iso1: 'te', iso2: 'tel', name: 'Telugu', nativeName: 'తెలుగు' },
  'mar': { iso1: 'mr', iso2: 'mar', name: 'Marathi', nativeName: 'मराठी' },
  'kor': { iso1: 'ko', iso2: 'kor', name: 'Korean', nativeName: '한국어' },
  'nld': { iso1: 'nl', iso2: 'dut', name: 'Dutch', nativeName: 'Nederlands' },
  'swe': { iso1: 'sv', iso2: 'swe', name: 'Swedish', nativeName: 'Svenska' },
  'dan': { iso1: 'da', iso2: 'dan', name: 'Danish', nativeName: 'Dansk' },
  'pol': { iso1: 'pl', iso2: 'pol', name: 'Polish', nativeName: 'Polski' },
  'ind': { iso1: 'id', iso2: 'ind', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  'vie': { iso1: 'vi', iso2: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  'gre': { iso1: 'el', iso2: 'gre', name: 'Greek', nativeName: 'Ελληνικά' },
  'heb': { iso1: 'he', iso2: 'heb', name: 'Hebrew', nativeName: 'עברית', isRtl: true },
  'lat': { iso1: 'la', iso2: 'lat', name: 'Latin', nativeName: 'Latina' }
};

// Transliteration and alias expansions for high-precision search
const SEARCH_ALIASES: Record<string, string[]> = {
  'aashadh': ['aashadh ka ek din', 'aashadd ka ek din', 'ashadh ka ek din', 'आषाढ़ का एक दिन', 'mohan rakesh', 'मोहन राकेश'],
  'aashadd': ['aashadh ka ek din', 'aashadd ka ek din', 'ashadh ka ek din', 'आषाढ़ का एक दिन', 'mohan rakesh', 'मोहन राकेश'],
  'ashadh': ['aashadh ka ek din', 'ashadh ka ek din', 'आषाढ़ का एक दिन', 'mohan rakesh', 'मोहन राकेश'],
  'aashadh ka ek din': ['aashadh ka ek din', 'aashadd ka ek din', 'ashadh ka ek din', 'आषाढ़ का एक दिन', 'mohan rakesh', 'मोहन राकेश'],
  'aashadd ka ek din': ['aashadh ka ek din', 'aashadd ka ek din', 'ashadh ka ek din', 'आषाढ़ का एक दिन', 'mohan rakesh', 'मोहन राकेश'],
  'आषाढ़ का एक दिन': ['आषाढ़ का एक दिन', 'Aashadh Ka Ek Din', 'Mohan Rakesh', 'मोहन राकेश'],
  'mohan rakesh': ['mohan rakesh', 'मोहन राकेश', 'आषाढ़ का एक दिन', 'Aashadh Ka Ek Din', 'Lahron Ke Rajhans'],
  'मोहन राकेश': ['मोहन राकेश', 'Mohan Rakesh', 'आषाढ़ का एक दिन', 'Aashadh Ka Ek Din'],
  'ghalib': ['ghalib', 'مرزا غالب', 'دیوان غالب', 'Deewan e Ghalib', 'Mirza Ghalib'],
  'مرزا غالب': ['غالب', 'Mirza Ghalib', 'Deewan e Ghalib', 'Ghalib Ghazals'],
  'دیوان غالب': ['Deewan e Ghalib', 'Diwan Ghalib', 'غالب', 'Mirza Ghalib'],
  'iqbal': ['allama iqbal', 'علامہ اقبال', 'بانگ درا', 'شکوہ', 'Kuliat e Iqbal', 'Bang e Dara', 'Bal e Jibril', 'Zarb e Kaleem'],
  'علامہ اقبال': ['Allama Iqbal', 'Kulliyat e Iqbal', 'Bang e Dara', 'Shikwa', 'Iqbal'],
  'بانگ درا': ['Bang e Dara', 'Bang-i-Dara', 'Allama Iqbal', 'علامہ اقبال'],
  'شکوہ': ['Shikwa', 'Jawabe Shikwa', 'Allama Iqbal', 'علامہ اقبال'],
  'manto': ['manto', 'سعادت حسن منٹو', 'منٹو', 'Saadat Hasan Manto', 'Thanda Gosht', 'Toba Tek Singh'],
  'منٹو': ['Saadat Hasan Manto', 'Thanda Gosht', 'Toba Tek Singh', 'Manto Stories'],
  'peer e kamil': ['peer e kamil', 'پیر کامل', 'Umera Ahmed', 'عمیرہ احمد'],
  'پیر کامل': ['Peer e Kamil', 'Umera Ahmed', 'عمیرہ احمد', 'Aab e Hayat'],
  'raja gidh': ['raja gidh', 'راجہ گدھ', 'Bano Qudsia', 'بانو قدسیہ'],
  'راجہ گدھ': ['Raja Gidh', 'Bano Qudsia', 'بانو قدسیہ'],
  'bano qudsia': ['bano qudsia', 'بانو قدسیہ', 'راجہ گدھ', 'Raja Gidh'],
  'umera ahmed': ['umera ahmed', 'عمیرہ احمد', 'پیر کامل', 'Peer e Kamil', 'Aab e Hayat', 'آب حیات'],
  'aab e hayat': ['aab e hayat', 'آب حیات', 'Umera Ahmed', 'عمیرہ احمد'],
  'آب حیات': ['Aab e Hayat', 'Muhammad Husain Azad', 'Umera Ahmed', 'عمیرہ احمد'],
  'faiz': ['faiz ahmed faiz', 'فیض احمد فیض', 'دست صبا', 'نسخہ ہائے وفا', 'Poems by Faiz'],
  'فیض احمد فیض': ['Faiz Ahmed Faiz', 'Dast e Saba', 'Nuskha Hai Wafa', 'Faiz'],
  'premchand': ['premchand', 'प्रीम चंद', 'मुंशी प्रेमचंद', 'गोदान', 'Godan', 'Nirmala', 'Munshi Premchand', 'Kafan', 'Mansarovar', 'Bazar e Husn'],
  'प्रीम चंद': ['Munshi Premchand', 'Godan', 'Nirmala', 'प्रीम चंद', 'गोदान'],
  'मुंशी प्रेमचंद': ['Munshi Premchand', 'Godan', 'Nirmala', 'गोदान', 'निर्मला', 'कफ़न'],
  'godan': ['godan', 'गोदान', 'Premchand', 'मुंशी प्रेमचंद', 'Munshi Premchand'],
  'गोदान': ['Godan', 'गोदान', 'Premchand', 'मुंशी प्रेमचंद'],
  'nirmala': ['nirmala', 'निर्मला', 'Premchand', 'मुंशी प्रेमचंद'],
  'gunahon ka devta': ['gunahon ka devta', 'गुनाहों का देवता', 'Dharamvir Bharati', 'धर्मवीर भारती'],
  'गुनाहों का देवता': ['Gunahon Ka Devta', 'Dharamvir Bharati', 'धर्मवीर भारती'],
  'madhushala': ['madhushala', 'मधुशाला', 'Harivansh Rai Bachchan', 'हरिवंश राय बच्चन'],
  'मधुशाला': ['Madhushala', 'हरिवंश राय बच्चन', 'Harivansh Rai Bachchan'],
  'rashmirathi': ['rashmirathi', 'रश्मिरथी', 'Ramdhari Singh Dinkar', 'रामधारी सिंह दिनकर'],
  'रश्मिरथी': ['Rashmirathi', 'रामधारी सिंह दिनकर', 'Ramdhari Singh Dinkar'],
  'bagh o bahar': ['bagh o bahar', 'باغ و بہار', 'Mir Amman', 'میر امن', 'Four Dervishes'],
  'باغ و بہار': ['Bagh o Bahar', 'Mir Amman', 'Tale of the Four Darvesh'],
  'fasana e azad': ['fasana e azad', 'فسانہ آزاد', 'Ratan Nath Sarshar'],
  'tilism hoshruba': ['tilism hoshruba', 'طلسم ہوشربا', 'Dastan e Amir Hamza', 'داستان امیر حمزہ'],
  'qissa hatim tai': ['qissa hatim tai', 'قصہ حاتم طائی', 'Hatim Tai'],
  'les miserables': ['les miserables', 'victor hugo', 'les misérables'],
  'don quixote': ['don quixote', 'don quijote', 'cervantes', 'miguel de cervantes'],
  'war and peace': ['war and peace', 'leo tolstoy', 'войna и мир'],
  'faust': ['faust', 'goethe', 'johann wolfgang von goethe'],
  'thousand and one nights': ['thousand and one nights', 'arabian nights', 'ألف ليلة وليلة', 'alf layla wa layla']
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const language = searchParams.get('lang')?.trim() || '';
    const versionType = searchParams.get('version')?.trim() || 'all'; // 'all' | 'original' | 'translation'

    // Default search if completely empty
    const searchQuery = query || (category ? `subject:${category}` : (language === 'urd' ? 'اردو ادب دیوان غالب' : 'bestsellers classic literature'));

    // Language identification
    const targetLang = language && LANG_MAP[language] ? LANG_MAP[language] : null;

    // Check if query matches any known transliteration/alias
    const lowerQuery = searchQuery.toLowerCase().trim();
    let expandedKeywords = [searchQuery];
    for (const [key, aliases] of Object.entries(SEARCH_ALIASES)) {
      if (lowerQuery.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerQuery)) {
        expandedKeywords = Array.from(new Set([...expandedKeywords, ...aliases]));
        break;
      }
    }

    // Run parallel multi-archive requests
    const [iaResults, olResults, gutenbergResults, googleResults] = await Promise.allSettled([
      fetchInternetArchive(searchQuery, expandedKeywords, targetLang?.iso1 || targetLang?.iso2),
      fetchOpenLibrary(searchQuery, category, targetLang?.iso2 || targetLang?.iso1),
      fetchGutenberg(searchQuery, targetLang?.iso1),
      fetchGoogleBooks(searchQuery, category, targetLang?.iso1)
    ]);

    const combined: UnifiedOnlineBook[] = [];

    if (iaResults.status === 'fulfilled' && Array.isArray(iaResults.value)) {
      combined.push(...iaResults.value);
    }
    if (olResults.status === 'fulfilled' && Array.isArray(olResults.value)) {
      combined.push(...olResults.value);
    }
    if (gutenbergResults.status === 'fulfilled' && Array.isArray(gutenbergResults.value)) {
      combined.push(...gutenbergResults.value);
    }
    if (googleResults.status === 'fulfilled' && Array.isArray(googleResults.value)) {
      combined.push(...googleResults.value);
    }

    // Deduplicate books intelligently by title and author
    const seen = new Set<string>();
    let deduplicated: UnifiedOnlineBook[] = [];

    for (const book of combined) {
      const title = (book.volumeInfo?.title || '').trim();
      const author = (book.volumeInfo?.authors?.[0] || '').trim();
      
      // Clean string for keying
      const cleanTitle = title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      const cleanAuthor = author.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      const key = `${cleanTitle}::${cleanAuthor}::${book.volumeInfo?.language || 'en'}`;

      if (!cleanTitle) continue;

      if (!seen.has(key)) {
        seen.add(key);
        // Ensure 100% free access
        book.isPremium = false;
        book.price = undefined;

        // Detect Original vs Translation metadata
        detectTranslationStatus(book, targetLang);

        deduplicated.push(book);
      }
    }

    // Filter by versionType if specified
    if (versionType === 'original') {
      deduplicated = deduplicated.filter(b => b.is_original);
    } else if (versionType === 'translation') {
      deduplicated = deduplicated.filter(b => b.is_translation);
    }

    // Sort to prioritize books with direct EPUB/Archive read links or rich high-res covers
    deduplicated.sort((a, b) => {
      const aScore = (a.file_url ? 4 : 0) + (a.accessInfo?.ia ? 3 : 0) + (a.volumeInfo?.imageLinks?.thumbnail ? 2 : 0) + (a.is_original ? 1 : 0);
      const bScore = (b.file_url ? 4 : 0) + (b.accessInfo?.ia ? 3 : 0) + (b.volumeInfo?.imageLinks?.thumbnail ? 2 : 0) + (b.is_original ? 1 : 0);
      return bScore - aScore;
    });

    return NextResponse.json({
      success: true,
      query: searchQuery,
      language: targetLang ? targetLang.name : 'All Languages',
      count: deduplicated.length,
      books: deduplicated.slice(0, 80)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('Error in universal book search API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to query digital book archives',
      books: []
    }, { status: 500 });
  }
}

// Auto-detect whether a book is an original work or a translation
function detectTranslationStatus(book: UnifiedOnlineBook, targetLang: any) {
  const title = (book.volumeInfo?.title || '').toLowerCase();
  const desc = (book.volumeInfo?.description || '').toLowerCase();
  const lang = (book.volumeInfo?.language || '').toLowerCase();

  const isTranslatedText = 
    title.includes('translated') || 
    title.includes('translation') || 
    title.includes('trans.') || 
    desc.includes('translated from') || 
    desc.includes('english translation') ||
    desc.includes('urdu translation') ||
    title.includes('with urdu translation') ||
    title.includes('with english translation');

  if (isTranslatedText) {
    book.is_translation = true;
    book.is_original = false;
    if (lang.startsWith('en')) {
      book.translated_to = 'English';
    } else if (lang.startsWith('ur')) {
      book.translated_to = 'Urdu';
    }
  } else {
    book.is_original = true;
    book.is_translation = false;
    book.original_language = targetLang ? targetLang.name : (lang.toUpperCase() || 'Original');
  }
}

// 1. Internet Archive Multi-Language & Urdu Texts Fetcher
async function fetchInternetArchive(query: string, aliases: string[], lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    // Unicode-safe sanitization: preserve all language letters, numbers, spaces
    const cleanQ = query.replace(/subject:/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
    if (!cleanQ) return [];

    // Build rich multi-keyword query
    const terms = Array.from(new Set([cleanQ, ...aliases.slice(0, 4)])).map(t => encodeURIComponent(t.trim())).filter(Boolean);
    const subQueries = terms.map(t => `(title:(${t}) OR creator:(${t}) OR description:(${t}))`).join(' OR ');

    let iaQuery = `(${subQueries}) AND mediatype:(texts)`;
    if (lang) {
      iaQuery += ` AND (language:(${lang}) OR language:(${lang === 'ur' ? 'urd' : lang}))`;
    }

    const url = `https://archive.org/advancedsearch.php?q=${iaQuery}&fl[]=identifier,title,creator,description,year,language,downloads,publicdate&sort[]=downloads+desc&rows=35&page=1&output=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.response?.docs || [];

    return docs.map((item: any): UnifiedOnlineBook => {
      const identifier = item.identifier;
      const cover = `https://archive.org/services/img/${identifier}`;
      const epubUrl = `https://archive.org/download/${identifier}/${identifier}.epub`;
      const itemLang = item.language ? (Array.isArray(item.language) ? item.language[0] : item.language) : (lang || 'en');

      return {
        id: `ia-${identifier}`,
        source: 'Internet Archive',
        isPremium: false,
        readMode: 'archive',
        file_url: epubUrl,
        volumeInfo: {
          title: stripHtml(item.title) || 'Archived Literary Work',
          authors: item.creator ? (Array.isArray(item.creator) ? item.creator.map(stripHtml) : [stripHtml(item.creator)]) : ['Author / Scribe'],
          description: stripHtml(item.description) || 'Full-text digitized literary book preserved by Internet Archive global digital repository.',
          imageLinks: { thumbnail: cover },
          infoLink: `https://archive.org/details/${identifier}`,
          previewLink: `https://archive.org/stream/${identifier}`,
          language: itemLang,
          publishedDate: item.year ? String(item.year) : undefined,
        },
        accessInfo: {
          ia: identifier,
          epub: { downloadLink: epubUrl }
        }
      };
    });
  } catch (err) {
    console.warn('Internet Archive search failed:', err);
    return [];
  }
}

// 2. Open Library Worldwide Catalog Fetcher
async function fetchOpenLibrary(query: string, category: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    let q = query.replace(/subject:/g, '').trim();
    let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=30`;
    if (lang) {
      url += `&language=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.slice(0, 30).map((doc: any, idx: number): UnifiedOnlineBook => {
      const coverId = doc.cover_i;
      const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
      const iaId = Array.isArray(doc.ia) && doc.ia.length > 0 ? doc.ia[0] : null;
      const workKey = doc.key ? doc.key.replace('/works/', '') : `ol-${idx}`;
      const docLang = doc.language?.[0] || lang || 'eng';

      return {
        id: `ol-${workKey}`,
        source: 'Open Library',
        isPremium: false,
        readMode: iaId ? 'archive' : 'interactive',
        file_url: iaId ? `https://archive.org/download/${iaId}/${iaId}.epub` : '',
        volumeInfo: {
          title: stripHtml(doc.title) || 'Untitled Literary Work',
          authors: Array.isArray(doc.author_name) && doc.author_name.length > 0 ? doc.author_name.map(stripHtml) : ['Unknown Author'],
          description: stripHtml(doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : String(doc.first_sentence)) : 'A classic literary work archived in the Open Library global catalog.'),
          imageLinks: cover ? { thumbnail: cover } : null,
          infoLink: doc.key ? `https://openlibrary.org${doc.key}` : '#',
          previewLink: doc.key ? `https://openlibrary.org${doc.key}` : '#',
          language: docLang,
          publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          pageCount: doc.number_of_pages_median || undefined,
          categories: doc.subject?.slice(0, 5) || []
        },
        accessInfo: {
          ia: iaId,
          epub: iaId ? { downloadLink: `https://archive.org/download/${iaId}/${iaId}.epub` } : null
        }
      };
    });
  } catch (err) {
    console.warn('Open Library search failed:', err);
    return [];
  }
}

// 3. Project Gutenberg / Gutendex Public Domain Fetcher
async function fetchGutenberg(query: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    const cleanQ = query.replace(/subject:/g, '').trim();
    let url = `https://gutendex.com/books/?search=${encodeURIComponent(cleanQ)}`;
    if (lang) {
      url += `&languages=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];

    return results.slice(0, 25).map((b: any): UnifiedOnlineBook => {
      const epubUrl = b.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${b.id}.epub.noimages`;
      const cover = b.formats?.['image/jpeg'] || null;

      return {
        id: `gutendex-${b.id}`,
        source: 'Gutenberg',
        isPremium: false,
        readMode: 'epub',
        file_url: epubUrl,
        volumeInfo: {
          title: stripHtml(b.title) || 'Classic Literature',
          authors: Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.map((a: any) => stripHtml(a.name)) : ['Classic Author'],
          description: 'Public domain literature edition with full unabridged text hosted by Project Gutenberg.',
          imageLinks: cover ? { thumbnail: cover } : null,
          infoLink: `https://www.gutenberg.org/ebooks/${b.id}`,
          previewLink: `https://www.gutenberg.org/ebooks/${b.id}`,
          language: b.languages?.[0] || 'en',
          categories: b.subjects?.slice(0, 4) || []
        },
        accessInfo: {
          ia: null,
          epub: { downloadLink: epubUrl }
        }
      };
    });
  } catch (err) {
    console.warn('Gutenberg search failed:', err);
    return [];
  }
}

// 4. Google Books API Fetcher with Fallback Resilience
async function fetchGoogleBooks(query: string, category: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    let q = query;
    if (category && !q.includes('subject:')) {
      q = `${q} subject:${category}`;
    }

    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=25&printType=books`;
    if (lang) {
      url += `&langRestrict=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'QuillHawkBooks/2.0' } });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map((item: any): UnifiedOnlineBook => {
      const vol = item.volumeInfo || {};
      const access = item.accessInfo || {};
      const directEpub = access.epub?.downloadLink || access.epub?.acsTokenLink || null;
      const directPdf = access.pdf?.downloadLink || null;
      
      let cover = vol.imageLinks?.extraLarge || 
                  vol.imageLinks?.large || 
                  vol.imageLinks?.medium || 
                  vol.imageLinks?.thumbnail || 
                  vol.imageLinks?.smallThumbnail || null;

      if (cover && cover.startsWith('http:')) {
        cover = cover.replace('http:', 'https:');
      }

      const hasDirectFile = !!(directEpub || directPdf);
      const isEmbeddable = access.embeddable !== false;

      return {
        id: item.id || `google-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        source: 'Google Books',
        isPremium: false,
        readMode: hasDirectFile ? 'epub' : (isEmbeddable ? 'google' : 'interactive'),
        file_url: directEpub || directPdf || '',
        volumeInfo: {
          title: stripHtml(vol.title) || 'Untitled Book',
          authors: Array.isArray(vol.authors) && vol.authors.length > 0 ? vol.authors.map(stripHtml) : ['Unknown Author'],
          description: stripHtml(vol.description) || 'A literary work available in the global digital catalogue.',
          imageLinks: cover ? { thumbnail: cover } : null,
          infoLink: vol.infoLink || `https://books.google.com/books?id=${item.id}`,
          previewLink: vol.previewLink || `https://books.google.com/books?id=${item.id}`,
          language: vol.language || 'en',
          publishedDate: vol.publishedDate,
          pageCount: vol.pageCount,
          categories: vol.categories || []
        },
        accessInfo: {
          ia: null,
          epub: directEpub ? { downloadLink: directEpub } : null
        }
      };
    });
  } catch (err) {
    console.warn('Google Books search failed:', err);
    return [];
  }
}
