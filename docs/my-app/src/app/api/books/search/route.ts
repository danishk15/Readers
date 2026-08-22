import { NextResponse } from 'next/server';

export interface UnifiedOnlineBook {
  id: string;
  source: 'Google Books' | 'Open Library' | 'Internet Archive' | 'Gutenberg' | 'Standard Ebooks' | 'Global Catalog';
  isPremium: boolean;
  price?: string;
  readMode: 'epub' | 'archive' | 'google' | 'interactive';
  file_url?: string;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const language = searchParams.get('lang')?.trim() || '';

    // If query and category are completely empty, provide a curated default search
    const searchQuery = query || (category ? `subject:${category}` : 'bestsellers classic literature');

    // Language codes mapping
    const langMap: Record<string, { iso1: string; iso2: string }> = {
      'eng': { iso1: 'en', iso2: 'eng' },
      'ara': { iso1: 'ar', iso2: 'ara' },
      'per': { iso1: 'fa', iso2: 'per' },
      'hin': { iso1: 'hi', iso2: 'hin' },
      'urd': { iso1: 'ur', iso2: 'urd' },
      'spa': { iso1: 'es', iso2: 'spa' },
      'fre': { iso1: 'fr', iso2: 'fre' },
      'ger': { iso1: 'de', iso2: 'ger' },
      'jpn': { iso1: 'ja', iso2: 'jpn' },
      'chi': { iso1: 'zh', iso2: 'chi' },
      'rus': { iso1: 'ru', iso2: 'rus' },
      'por': { iso1: 'pt', iso2: 'por' },
      'ita': { iso1: 'it', iso2: 'ita' },
      'tur': { iso1: 'tr', iso2: 'tur' },
      'dan': { iso1: 'da', iso2: 'dan' },
      'swe': { iso1: 'sv', iso2: 'swe' },
      'nld': { iso1: 'nl', iso2: 'dut' },
      'kor': { iso1: 'ko', iso2: 'kor' }
    };

    const targetLang = language && langMap[language] ? langMap[language] : null;

    // Run parallel multi-source requests with timeouts
    const [googleResults, openLibraryResults, internetArchiveResults, gutenbergResults] = await Promise.allSettled([
      fetchGoogleBooks(searchQuery, category, targetLang?.iso1),
      fetchOpenLibrary(searchQuery, category, targetLang?.iso2),
      fetchInternetArchive(searchQuery, targetLang?.iso1),
      fetchGutenberg(searchQuery, targetLang?.iso1)
    ]);

    const combined: UnifiedOnlineBook[] = [];

    if (googleResults.status === 'fulfilled' && Array.isArray(googleResults.value)) {
      combined.push(...googleResults.value);
    }
    if (openLibraryResults.status === 'fulfilled' && Array.isArray(openLibraryResults.value)) {
      combined.push(...openLibraryResults.value);
    }
    if (internetArchiveResults.status === 'fulfilled' && Array.isArray(internetArchiveResults.value)) {
      combined.push(...internetArchiveResults.value);
    }
    if (gutenbergResults.status === 'fulfilled' && Array.isArray(gutenbergResults.value)) {
      combined.push(...gutenbergResults.value);
    }

    // Deduplicate by clean lowercase title and author
    const seen = new Set<string>();
    const deduplicated: UnifiedOnlineBook[] = [];

    for (const book of combined) {
      const cleanTitle = (book.volumeInfo?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanAuthor = (book.volumeInfo?.authors?.[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${cleanTitle}::${cleanAuthor}`;

      if (!cleanTitle) continue;

      if (!seen.has(key)) {
        seen.add(key);
        // Ensure every single book is 100% free and ready to read
        book.isPremium = false;
        book.price = undefined;
        deduplicated.push(book);
      }
    }

    // Sort to prioritize books with direct EPUB/Archive read links or rich high-res covers
    deduplicated.sort((a, b) => {
      const aScore = (a.file_url ? 3 : 0) + (a.accessInfo?.ia ? 2 : 0) + (a.volumeInfo?.imageLinks?.thumbnail ? 1 : 0);
      const bScore = (b.file_url ? 3 : 0) + (b.accessInfo?.ia ? 2 : 0) + (b.volumeInfo?.imageLinks?.thumbnail ? 1 : 0);
      return bScore - aScore;
    });

    return NextResponse.json({
      success: true,
      query: searchQuery,
      count: deduplicated.length,
      books: deduplicated.slice(0, 60)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('Error in unified book search API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to query digital book archives',
      books: []
    }, { status: 500 });
  }
}

// 1. Google Books Fetcher
async function fetchGoogleBooks(query: string, category: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    let q = query;
    if (category && !q.includes('subject:')) {
      q = `${q} subject:${category}`;
    }

    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=30&printType=books`;
    if (lang) {
      url += `&langRestrict=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
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
          title: vol.title || 'Untitled Book',
          authors: Array.isArray(vol.authors) && vol.authors.length > 0 ? vol.authors : ['Unknown Author'],
          description: vol.description || 'A literary work available in the global digital catalogue.',
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

// 2. Open Library Fetcher
async function fetchOpenLibrary(query: string, category: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    let q = query.replace(/subject:/g, '').trim();
    let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=30`;
    if (lang) {
      url += `&language=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.slice(0, 25).map((doc: any, idx: number): UnifiedOnlineBook => {
      const coverId = doc.cover_i;
      const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
      const iaId = Array.isArray(doc.ia) && doc.ia.length > 0 ? doc.ia[0] : null;
      const workKey = doc.key ? doc.key.replace('/works/', '') : `ol-${idx}`;

      return {
        id: `ol-${workKey}`,
        source: 'Open Library',
        isPremium: false,
        readMode: iaId ? 'archive' : 'interactive',
        file_url: iaId ? `https://archive.org/download/${iaId}/${iaId}.epub` : '',
        volumeInfo: {
          title: doc.title || 'Untitled Work',
          authors: Array.isArray(doc.author_name) && doc.author_name.length > 0 ? doc.author_name : ['Unknown Author'],
          description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : String(doc.first_sentence)) : 'A classic literary work archived in the Open Library public repository.',
          imageLinks: cover ? { thumbnail: cover } : null,
          infoLink: doc.key ? `https://openlibrary.org${doc.key}` : '#',
          previewLink: doc.key ? `https://openlibrary.org${doc.key}` : '#',
          language: doc.language?.[0] || 'eng',
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

// 3. Internet Archive Direct Texts API Fetcher
async function fetchInternetArchive(query: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    const cleanQ = query.replace(/subject:/g, '').replace(/[^\w\s]/gi, ' ').trim();
    if (!cleanQ) return [];

    let iaQuery = `(title:(${encodeURIComponent(cleanQ)}) OR description:(${encodeURIComponent(cleanQ)})) AND mediatype:(texts) AND format:(EPUB OR "Item Image")`;
    if (lang) {
      iaQuery += ` AND language:(${lang})`;
    }

    const url = `https://archive.org/advancedsearch.php?q=${iaQuery}&fl[]=identifier,title,creator,description,year,language,downloads,publicdate&sort[]=downloads+desc&rows=20&page=1&output=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.response?.docs || [];

    return docs.map((item: any): UnifiedOnlineBook => {
      const identifier = item.identifier;
      const cover = `https://archive.org/services/img/${identifier}`;
      const epubUrl = `https://archive.org/download/${identifier}/${identifier}.epub`;

      return {
        id: `ia-${identifier}`,
        source: 'Internet Archive',
        isPremium: false,
        readMode: 'archive',
        file_url: epubUrl,
        volumeInfo: {
          title: item.title || 'Archived Literary Work',
          authors: item.creator ? (Array.isArray(item.creator) ? item.creator : [item.creator]) : ['Historic Author'],
          description: item.description || 'Full-text digitized literary book preserved by Internet Archive.',
          imageLinks: { thumbnail: cover },
          infoLink: `https://archive.org/details/${identifier}`,
          previewLink: `https://archive.org/stream/${identifier}`,
          language: item.language || 'eng',
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

// 4. Project Gutenberg / Gutendex Fetcher
async function fetchGutenberg(query: string, lang?: string): Promise<UnifiedOnlineBook[]> {
  try {
    const cleanQ = query.replace(/subject:/g, '').trim();
    let url = `https://gutendex.com/books/?search=${encodeURIComponent(cleanQ)}`;
    if (lang) {
      url += `&languages=${lang}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];

    return results.slice(0, 20).map((b: any): UnifiedOnlineBook => {
      const epubUrl = b.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${b.id}.epub.noimages`;
      const cover = b.formats?.['image/jpeg'] || null;

      return {
        id: `gutendex-${b.id}`,
        source: 'Gutenberg',
        isPremium: false,
        readMode: 'epub',
        file_url: epubUrl,
        volumeInfo: {
          title: b.title || 'Classic Literature',
          authors: Array.isArray(b.authors) && b.authors.length > 0 ? b.authors.map((a: any) => a.name) : ['Classic Author'],
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
