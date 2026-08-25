import { NextResponse } from 'next/server';
import { AUTHENTIC_BOOK_REGISTRY, getAuthenticBookChapters, AuthenticBookChapter } from '@/utils/authenticBookContent';

// In-memory LRU cache for fetched & parsed book chapters
const contentCache = new Map<string, { chapters: AuthenticBookChapter[]; title: string; author: string; language?: string }>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim() || '';
    const title = searchParams.get('title')?.trim() || '';
    const author = searchParams.get('author')?.trim() || '';
    const fileUrl = searchParams.get('file_url')?.trim() || '';
    const iaId = searchParams.get('iaId')?.trim() || '';
    const description = searchParams.get('description')?.trim() || '';

    const cacheKey = `${id}::${title}::${author}::${fileUrl}`;
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
    const cleanAuthor = author.toLowerCase();

    // 1. Direct match in Authentic Books Registry
    for (const entry of AUTHENTIC_BOOK_REGISTRY) {
      const isMatched = entry.matchKeys.some(key => {
        const k = key.toLowerCase().trim();
        if (!k) return false;
        if (cleanId === k) return true;
        if (cleanTitle && (cleanTitle === k || cleanTitle.includes(k) || (k.length >= 4 && cleanTitle.includes(k)))) return true;
        if (k.length >= 6 && cleanId.includes(k) && !k.startsWith('classic-')) return true;
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
          source: 'authentic_registry',
          ...result
        });
      }
    }

    // 2. Project Gutenberg Full-Text Dynamic Ingestion
    let gutenId: string | null = null;
    if (id.startsWith('gutendex-')) {
      gutenId = id.replace('gutendex-', '');
    } else if (fileUrl.includes('gutenberg.org/ebooks/')) {
      const match = fileUrl.match(/ebooks\/(\d+)/);
      if (match) gutenId = match[1];
    } else if (fileUrl.includes('gutenberg.org/files/')) {
      const match = fileUrl.match(/files\/(\d+)/);
      if (match) gutenId = match[1];
    }

    if (gutenId) {
      try {
        const parsedChapters = await fetchAndParseGutenberg(gutenId, title, author);
        if (parsedChapters && parsedChapters.length > 0) {
          const result = {
            chapters: parsedChapters,
            title: title || `Gutenberg #${gutenId}`,
            author: author || 'Classic Literature',
            language: 'en'
          };
          contentCache.set(cacheKey, result);
          return NextResponse.json({
            success: true,
            source: 'gutenberg_live',
            ...result
          });
        }
      } catch (err) {
        console.warn(`Failed to live-parse Gutenberg book #${gutenId}:`, err);
      }
    }

    // 3. Internet Archive Full-Text OCR Ingestion
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

    // 4. Fallback to High-Quality Multilingual Generator
    const fallbackChapters = getAuthenticBookChapters(id, title, author, description);
    const result = {
      chapters: fallbackChapters,
      title: title || 'Curated Edition',
      author: author || 'QuillHawk Library',
      language: 'en'
    };
    contentCache.set(cacheKey, result);

    return NextResponse.json({
      success: true,
      source: 'fallback_generator',
      ...result
    });

  } catch (error: any) {
    console.error('Error in book content API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve book chapters',
      chapters: []
    }, { status: 500 });
  }
}

/**
 * Fetches unabridged text from Project Gutenberg mirror and parses it into clean chapters
 */
async function fetchAndParseGutenberg(gutenId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const mirrors = [
    `https://www.gutenberg.org/cache/epub/${gutenId}/pg${gutenId}.txt`,
    `https://www.gutenberg.org/files/${gutenId}/${gutenId}-0.txt`,
    `https://www.gutenberg.org/files/${gutenId}/${gutenId}.txt`
  ];

  let rawText = '';
  for (const url of mirrors) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'QuillHawkReader/2.0 (Academic & Preservation)' },
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

  // 1. Strip Gutenberg header & footer
  let startIndex = rawText.indexOf('*** START OF THE PROJECT GUTENBERG');
  if (startIndex !== -1) {
    startIndex = rawText.indexOf('\n', startIndex) + 1;
  } else {
    startIndex = 0;
  }

  let endIndex = rawText.indexOf('*** END OF THE PROJECT GUTENBERG');
  if (endIndex === -1) {
    endIndex = rawText.indexOf('End of the Project Gutenberg');
    if (endIndex === -1) endIndex = rawText.length;
  }

  const bookBody = rawText.substring(startIndex, endIndex).trim();
  if (bookBody.length < 500) return null;

  // 2. Parse chapters using standard literary division markers
  const chapterRegex = /\n(?:CHAPTER|Chapter|ACT|Act|SCENE|Scene|BOOK|Book|PART|Part|LETTER|Letter|STAVE|Stave|CANTO|Canto)\s+([IVXLCDM0-9]+|[A-Z][a-z]+)[\.\:\-\s]*([^\n]*)\n/g;
  
  const matches = [...bookBody.matchAll(chapterRegex)];
  const chapters: AuthenticBookChapter[] = [];

  if (matches.length >= 2) {
    // If there is introductory material before Chapter 1, include it as Preface
    if (matches[0].index && matches[0].index > 800) {
      const introText = bookBody.substring(0, matches[0].index).trim();
      if (introText.length > 100) {
        chapters.push({
          chapter: `Preface / Introduction: ${title || 'Classic Edition'}`,
          text: cleanBookText(introText)
        });
      }
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchIndex = match.index!;
      const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index! : bookBody.length;

      const rawChapterTitle = match[0].trim();
      const chapterContent = bookBody.substring(matchIndex + match[0].length, nextMatchIndex).trim();

      if (chapterContent.length > 50) {
        chapters.push({
          chapter: rawChapterTitle.replace(/[\r\n]+/g, ' ').substring(0, 80),
          text: cleanBookText(chapterContent)
        });
      }
    }
  }

  // If regex found fewer than 2 markers, divide the unabridged text into proportional ~2500-word reading sections
  if (chapters.length < 2) {
    const paragraphs = bookBody.split(/\n\s*\n/);
    let currentChunk = '';
    let sectionIdx = 1;

    for (const para of paragraphs) {
      currentChunk += para.trim() + '\n\n';
      if (currentChunk.length > 8000) {
        chapters.push({
          chapter: `Section ${sectionIdx}: ${title || 'Unabridged Reading'}`,
          text: cleanBookText(currentChunk)
        });
        currentChunk = '';
        sectionIdx++;
      }
    }

    if (currentChunk.trim().length > 100) {
      chapters.push({
        chapter: `Section ${sectionIdx}: Conclusion`,
        text: cleanBookText(currentChunk)
      });
    }
  }

  return chapters.length > 0 ? chapters.slice(0, 100) : null;
}

/**
 * Fetches text from Internet Archive DjVu OCR and converts to structured chapters
 */
async function fetchAndParseInternetArchive(iaId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const url = `https://archive.org/stream/${iaId}/${iaId}_djvu.txt`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);

  if (!res.ok) return null;
  const rawText = await res.text();
  if (!rawText || rawText.length < 500) return null;

  // Divide into clean reading sections
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
        text: cleanBookText(currentChunk)
      });
      currentChunk = '';
      sectionIdx++;
    }
  }

  if (currentChunk.trim().length > 100) {
    chapters.push({
      chapter: `Chapter ${sectionIdx}: Conclusion`,
      text: cleanBookText(currentChunk)
    });
  }

  return chapters.length > 0 ? chapters.slice(0, 60) : null;
}

function cleanBookText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
