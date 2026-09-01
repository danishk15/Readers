import { NextResponse } from 'next/server';
import { AUTHENTIC_BOOK_REGISTRY, getAuthenticBookChapters, AuthenticBookChapter } from '@/utils/authenticBookContent';
import { stripHtml } from '@/utils/textSanitizer';

// In-memory LRU cache for fetched & parsed book chapters
const contentCache = new Map<string, { chapters: AuthenticBookChapter[]; title: string; author: string; language?: string }>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim() || '';
    const title = stripHtml(searchParams.get('title')?.trim() || '');
    const author = stripHtml(searchParams.get('author')?.trim() || '');
    const fileUrl = searchParams.get('file_url')?.trim() || '';
    const iaId = searchParams.get('iaId')?.trim() || '';
    const description = stripHtml(searchParams.get('description')?.trim() || '');

    const cacheKey = `${id}::${title}::${author}::${fileUrl}::${iaId}`;
    if (contentCache.has(cacheKey)) {
      const cached = contentCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        source: 'cache',
        ...cached
      });
    }

    const cleanId = id.toLowerCase();
    const cleanTitle = title.toLowerCase();

    // 1. FAST-PATH: Exact ID Match in Authentic Books Registry (0ms instant response)
    if (cleanId) {
      for (const entry of AUTHENTIC_BOOK_REGISTRY) {
        if (entry.matchKeys.some(k => cleanId === k.toLowerCase().trim())) {
          if (entry.chapters && entry.chapters.length > 0) {
            const result = {
              chapters: entry.chapters,
              title: entry.title,
              author: entry.author,
              language: entry.language
            };
            contentCache.set(cacheKey, result);
            return NextResponse.json({
              success: true,
              source: 'authentic_registry_id',
              ...result
            });
          }
        }
      }
    }

    // 2. FAST-PATH: Title / Author Match in Authentic Books Registry
    for (const entry of AUTHENTIC_BOOK_REGISTRY) {
      const isMatched = entry.matchKeys.some(key => {
        const k = key.toLowerCase().trim();
        if (!k) return false;
        if (cleanTitle && (cleanTitle === k || cleanTitle.includes(k) || (k.length >= 4 && cleanTitle.includes(k)))) return true;
        if (k.length >= 4 && cleanId.includes(k) && !k.startsWith('classic-')) return true;
        return false;
      });

      if (isMatched && entry.chapters && entry.chapters.length > 0) {
        const result = {
          chapters: entry.chapters,
          title: entry.title,
          author: entry.author,
          language: entry.language
        };
        contentCache.set(cacheKey, result);
        return NextResponse.json({
          success: true,
          source: 'authentic_registry_title',
          ...result
        });
      }
    }

    // 3. Check if Gutenberg ID is provided or extractable
    let gutenId: string | null = null;
    if (id.startsWith('gutendex-')) {
      gutenId = id.replace('gutendex-', '');
    } else if (fileUrl.includes('gutenberg.org/ebooks/')) {
      const match = fileUrl.match(/ebooks\/(\d+)/);
      if (match) gutenId = match[1];
    } else if (fileUrl.includes('gutenberg.org/files/')) {
      const match = fileUrl.match(/files\/(\d+)/);
      if (match) gutenId = match[1];
    } else if (fileUrl.includes('gutenberg.org/cache/epub/')) {
      const match = fileUrl.match(/epub\/(\d+)/);
      if (match) gutenId = match[1];
    } else if (title && !isNonEnglishScript(title)) {
      gutenId = detectFamousGutenbergId(title);
    }

    // 4. Fetch Live Unabridged Project Gutenberg Content with fast parallel mirrors
    if (gutenId) {
      try {
        const parsedChapters = await fetchAndParseGutenberg(gutenId, title, author);
        if (parsedChapters && parsedChapters.length > 0) {
          const result = {
            chapters: parsedChapters,
            title: title || `Gutenberg Edition #${gutenId}`,
            author: author || 'Classic Literature',
            language: 'en'
          };
          contentCache.set(cacheKey, result);
          return NextResponse.json({
            success: true,
            source: 'gutenberg_live_unabridged',
            ...result
          });
        }
      } catch (err) {
        console.warn(`Failed to live-parse Gutenberg book #${gutenId}:`, err);
      }
    }

    // 5. Internet Archive Full-Text OCR Ingestion
    const resolvedIaId = iaId || (id.startsWith('ia-') ? id.replace('ia-', '') : null);
    if (resolvedIaId) {
      try {
        const iaChapters = await fetchAndParseInternetArchive(resolvedIaId, title, author);
        if (iaChapters && iaChapters.length > 0) {
          const result = {
            chapters: iaChapters,
            title: title || 'Archived Classic',
            author: author || 'Classic Author',
            language: 'en'
          };
          contentCache.set(cacheKey, result);
          return NextResponse.json({
            success: true,
            source: 'internet_archive_live',
            ...result
          });
        }
      } catch (err) {
        console.warn(`Failed to live-parse Internet Archive item #${resolvedIaId}:`, err);
      }
    }

    // 6. Universal Multi-Chapter Fallback Generator
    const fallbackChapters = getAuthenticBookChapters(id, title, author, description);
    const result = {
      chapters: fallbackChapters,
      title: title || 'Curated Edition',
      author: author || 'QuillHawk Universal Library',
      language: isNonEnglishScript(title) ? 'ur' : 'en'
    };
    contentCache.set(cacheKey, result);

    return NextResponse.json({
      success: true,
      source: 'authentic_generator',
      ...result
    });

  } catch (error: any) {
    console.error('Error in book content API:', error);
    // Even on error, return fallback generated chapters so the reader NEVER fails
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const title = searchParams.get('title') || '';
    const author = searchParams.get('author') || '';
    const description = searchParams.get('description') || '';
    const fallback = getAuthenticBookChapters(id, title, author, description);

    return NextResponse.json({
      success: true,
      source: 'error_fallback_generator',
      chapters: fallback,
      title: title || 'QuillHawk Edition',
      author: author || 'Classic Author'
    });
  }
}

function isNonEnglishScript(str?: string): boolean {
  if (!str) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u0400-\u04FF]/.test(str);
}

function detectFamousGutenbergId(title: string): string | null {
  const t = title.toLowerCase().trim();
  if (t.includes('hamlet')) return '1524';
  if (t.includes('romeo and juliet') || t.includes('romeo & juliet')) return '1513';
  if (t.includes('macbeth')) return '1533';
  if (t.includes('midsummer night')) return '1514';
  if (t.includes('great gatsby')) return '64317';
  if (t.includes('pride and prejudice')) return '1342';
  if (t.includes('frankenstein')) return '84';
  if (t.includes('moby dick')) return '2701';
  if (t.includes('dracula')) return '345';
  if (t.includes('sherlock holmes')) return '1661';
  if (t.includes('alice in wonderland')) return '11';
  if (t.includes('war and peace')) return '2600';
  if (t.includes('crime and punishment')) return '2554';
  if (t.includes('tale of two cities')) return '98';
  if (t.includes('christmas carol')) return '46';
  if (t.includes('around the world in 80 days')) return '103';
  if (t.includes('art of war')) return '132';
  return null;
}

/**
 * Fetches unabridged text from Project Gutenberg mirrors in parallel with tight timeouts
 */
async function fetchAndParseGutenberg(gutenId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const mirrors = [
    `https://www.gutenberg.org/cache/epub/${gutenId}/pg${gutenId}.txt.utf8`,
    `https://www.gutenberg.org/files/${gutenId}/${gutenId}-0.txt`,
    `https://archive.org/download/gutenberg-${gutenId}/${gutenId}.txt`
  ];

  let rawText = '';
  for (const url of mirrors) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        rawText = await res.text();
        if (rawText && rawText.length > 1000) break;
      }
    } catch {}
  }

  if (!rawText || rawText.length < 1000) return null;

  // Strip Gutenberg header & footer
  let startIndex = rawText.indexOf('*** START OF THE PROJECT GUTENBERG');
  if (startIndex !== -1) {
    startIndex = rawText.indexOf('\n', startIndex) + 1;
  } else {
    startIndex = 0;
  }

  let endIndex = rawText.indexOf('*** END OF THE PROJECT GUTENBERG');
  if (endIndex === -1) {
    endIndex = rawText.indexOf('*** END OF THIS PROJECT GUTENBERG');
  }
  if (endIndex === -1) endIndex = rawText.length;

  const bookBody = rawText.substring(startIndex, endIndex).trim();
  if (bookBody.length < 500) return null;

  // Parse chapters using literary division markers
  const chapterRegex = /(?:^|\n)\s*(?:CHAPTER|Chapter|ACT|Act|SCENE|Scene|BOOK|Book|PART|Part|LETTER|Letter|STAVE|Stave)\s+([IVXLCDM0-9]+|[A-Z][a-z]+)[\.\:\-\s]*([^\n]*)\n/g;
  
  const matches = [...bookBody.matchAll(chapterRegex)];
  const chapters: AuthenticBookChapter[] = [];

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchIndex = match.index!;
      const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index! : bookBody.length;
      const rawChapterTitle = match[0].trim();
      const chapterContent = bookBody.substring(matchIndex + match[0].length, nextMatchIndex).trim();

      if (chapterContent.length > 50) {
        chapters.push({
          chapter: rawChapterTitle.replace(/[\r\n]+/g, ' ').substring(0, 100),
          text: stripHtml(chapterContent)
        });
      }
    }
  }

  if (chapters.length < 2) {
    const paragraphs = bookBody.split(/\n\s*\n/);
    let currentChunk = '';
    let sectionIdx = 1;

    for (const para of paragraphs) {
      currentChunk += para.trim() + '\n\n';
      if (currentChunk.length > 8000) {
        chapters.push({
          chapter: `Section ${sectionIdx}: ${title || 'Unabridged Reading'}`,
          text: stripHtml(currentChunk)
        });
        currentChunk = '';
        sectionIdx++;
      }
    }

    if (currentChunk.trim().length > 100) {
      chapters.push({
        chapter: `Section ${sectionIdx}: Conclusion`,
        text: stripHtml(currentChunk)
      });
    }
  }

  return chapters.length > 0 ? chapters.slice(0, 120) : null;
}

/**
 * Fetches text from Internet Archive DjVu OCR / TXT and converts to structured chapters
 */
async function fetchAndParseInternetArchive(iaId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const urls = [
    `https://archive.org/download/${iaId}/${iaId}_djvu.txt`,
    `https://archive.org/download/${iaId}/${iaId}.txt`
  ];

  let rawText = '';
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        rawText = await res.text();
        if (rawText && rawText.length > 500) break;
      }
    } catch {}
  }

  if (!rawText || rawText.length < 500) return null;

  const paragraphs = rawText.split(/\n\s*\n/);
  const chapters: AuthenticBookChapter[] = [];
  let currentChunk = '';
  let sectionIdx = 1;

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (cleanPara.length < 20) continue;

    currentChunk += cleanPara + '\n\n';
    if (currentChunk.length > 8000) {
      chapters.push({
        chapter: `Chapter ${sectionIdx}: ${title || 'Archived Text'}`,
        text: stripHtml(currentChunk)
      });
      currentChunk = '';
      sectionIdx++;
    }
  }

  if (currentChunk.trim().length > 100) {
    chapters.push({
      chapter: `Chapter ${sectionIdx}: Conclusion`,
      text: stripHtml(currentChunk)
    });
  }

  return chapters.length > 0 ? chapters.slice(0, 100) : null;
}
