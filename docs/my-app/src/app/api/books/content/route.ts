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

    // 1. Check if Gutenberg ID is provided or extractable
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

    // 2. Fetch Live Unabridged Project Gutenberg Content if available
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

    // 4. Exact ID Match in Authentic Books Registry (Comprehensive Pre-bundled Collections)
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
              source: 'authentic_registry',
              ...result
            });
          }
        }
      }
    }

    // 5. Title / Author Match in Authentic Books Registry
    for (const entry of AUTHENTIC_BOOK_REGISTRY) {
      const isMatched = entry.matchKeys.some(key => {
        const k = key.toLowerCase().trim();
        if (!k) return false;
        if (cleanTitle && (cleanTitle === k || cleanTitle.includes(k) || (k.length >= 4 && cleanTitle.includes(k)))) return true;
        if (k.length >= 5 && cleanId.includes(k) && !k.startsWith('classic-')) return true;
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
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve book chapters',
      chapters: []
    }, { status: 500 });
  }
}

function isNonEnglishScript(str?: string): boolean {
  if (!str) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u0400-\u04FF]/.test(str);
}

function detectFamousGutenbergId(title: string): string | null {
  const t = title.toLowerCase().trim();
  // Shakespeare
  if (t.includes('hamlet')) return '1524';
  if (t.includes('romeo and juliet') || t.includes('romeo & juliet')) return '1513';
  if (t.includes('macbeth')) return '1533';
  if (t.includes('midsummer night') || t.includes('midsummer-night')) return '1514';
  if (t.includes('othello')) return '1531';
  if (t.includes('king lear')) return '1532';
  if (t.includes('the tempest') || (t.includes('tempest') && t.includes('shakespeare'))) return '1540';
  if (t.includes('julius caesar')) return '1522';
  if (t.includes('shakespeare') && (t.includes('sonnet') || t.includes('poem'))) return '1041';

  // Classics & Fiction
  if (t.includes('great gatsby') || t.includes('gatsby')) return '64317';
  if (t.includes('pride and prejudice') || t.includes('pride & prejudice')) return '1342';
  if (t.includes('frankenstein')) return '84';
  if (t.includes('moby dick') || t.includes('moby-dick')) return '2701';
  if (t.includes('dracula')) return '345';
  if (t.includes('sherlock holmes') || t.includes('adventures of sherlock')) return '1661';
  if (t.includes('study in scarlet')) return '244';
  if (t.includes('hound of the baskervilles')) return '2852';
  if (t.includes('alice in wonderland') || t.includes('alice\'s adventures')) return '11';
  if (t.includes('war and peace')) return '2600';
  if (t.includes('anna karenina')) return '1399';
  if (t.includes('death of ivan ilyich') || t.includes('ivan ilyich')) return '2825';
  if (t.includes('crime and punishment')) return '2554';
  if (t.includes('brothers karamazov')) return '28054';
  if (t.includes('notes from underground')) return '600';
  if (t.includes('the idiot') && (t.includes('dost') || !t.includes('guide'))) return '2638';
  if (t.includes('tale of two cities')) return '98';
  if (t.includes('great expectations')) return '1400';
  if (t.includes('oliver twist')) return '730';
  if (t.includes('david copperfield')) return '766';
  if (t.includes('christmas carol')) return '46';
  if (t.includes('count of monte cristo') || t.includes('monte cristo')) return '1184';
  if (t.includes('three musketeers')) return '1257';
  if (t.includes('picture of dorian gray') || t.includes('dorian gray')) return '174';
  if (t.includes('importance of being earnest')) return '844';
  if (t.includes('around the world in 80 days') || t.includes('around the world in eighty days')) return '103';
  if (t.includes('twenty thousand leagues') || t.includes('20,000 leagues')) return '164';
  if (t.includes('journey to the center of the earth')) return '18857';
  if (t.includes('don quixote') || t.includes('don quijote')) return '996';
  if (t.includes('metamorphosis') && (t.includes('kafka') || !t.includes('ovid'))) return '5200';
  if (t.includes('the trial') && t.includes('kafka')) return '7849';
  if (t.includes('art of war')) return '132';
  if (t.includes('the prince') && (t.includes('machiavelli') || !t.includes('frog'))) return '1232';
  if (t.includes('republic') && (t.includes('plato') || !t.includes('banana'))) return '1497';
  if (t.includes('symposium') && t.includes('plato')) return '1600';
  if (t.includes('meditations') && (t.includes('aurelius') || t.includes('marcus'))) return '2680';
  if (t.includes('thus spake zarathustra') || t.includes('thus spoke zarathustra')) return '1998';
  if (t.includes('beyond good and evil')) return '4363';
  if (t.includes('secret of the self') || t.includes('asrar-e-khudi') || t.includes('asrar e khudi')) return '43881';
  if (t.includes('tale of the four durwesh') || t.includes('four dervishes')) return '16084';
  if (t.includes('faust')) return '14591';
  if (t.includes('arabian nights') || t.includes('1001 nights') || t.includes('thousand and one nights')) return '128';
  if (t.includes('jane eyre')) return '1260';
  if (t.includes('wuthering heights')) return '768';
  if (t.includes('time machine')) return '35';
  if (t.includes('war of the worlds')) return '36';
  if (t.includes('invisible man') && !t.includes('ellison')) return '5230';
  if (t.includes('odyssey') && (t.includes('homer') || !t.includes('2001'))) return '1727';
  if (t.includes('iliad') && t.includes('homer')) return '6130';
  if (t.includes('les miserables') || t.includes('les misérables')) return '135';
  if (t.includes('hunchback of notre dame')) return '2610';
  if (t.includes('jungle book')) return '236';
  if (t.includes('treasure island')) return '120';
  if (t.includes('dr jekyll and mr hyde') || t.includes('jekyll')) return '43';
  if (t.includes('kidnapped') && t.includes('stevenson')) return '421';
  if (t.includes('emma') && (t.includes('austen') || !t.includes('watson'))) return '158';
  if (t.includes('sense and sensibility')) return '161';
  if (t.includes('persuasion') && t.includes('austen')) return '105';
  if (t.includes('heart of darkness')) return '219';
  if (t.includes('yellow wallpaper')) return '1952';
  if (t.includes('dubliners')) return '2814';
  if (t.includes('ulysses') && t.includes('joyce')) return '4300';
  if (t.includes('portrait of the artist')) return '4217';
  if (t.includes('siddhartha')) return '2500';
  if (t.includes('scarlet letter')) return '25344';
  if (t.includes('leaves of grass')) return '1322';
  if (t.includes('divine comedy') || t.includes('dante')) return '8800';
  if (t.includes('robinson crusoe')) return '521';
  if (t.includes('gulliver') || t.includes('gulliver\'s travels')) return '829';
  if (t.includes('huckleberry finn') || t.includes('huck finn')) return '76';
  if (t.includes('tom sawyer')) return '74';
  if (t.includes('call of the wild')) return '215';
  if (t.includes('white fang')) return '910';
  if (t.includes('the raven') || (t.includes('poe') && t.includes('edgar'))) return '2147';
  if (t.includes('origin of species') || (t.includes('darwin') && t.includes('species'))) return '1228';
  return null;
}

/**
 * Fetches unabridged text from Project Gutenberg mirrors and parses it into clean chapters
 */
async function fetchAndParseGutenberg(gutenId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const mirrors = [
    `https://www.gutenberg.org/cache/epub/${gutenId}/pg${gutenId}.txt.utf8`,
    `https://www.gutenberg.org/cache/epub/${gutenId}/pg${gutenId}.txt`,
    `https://www.gutenberg.org/files/${gutenId}/${gutenId}-0.txt`,
    `https://www.gutenberg.org/files/${gutenId}/${gutenId}.txt`,
    `https://www.gutenberg.org/ebooks/${gutenId}.txt.utf-8`,
    `https://gutenberg.pglaf.org/cache/epub/${gutenId}/pg${gutenId}.txt`,
    `https://archive.org/download/gutenberg-${gutenId}/${gutenId}.txt`
  ];

  let rawText = '';
  for (const url of mirrors) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 QuillHawkReader/3.0'
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

  // 1. Strip Gutenberg header & footer
  let startIndex = rawText.indexOf('*** START OF THE PROJECT GUTENBERG');
  if (startIndex !== -1) {
    startIndex = rawText.indexOf('\n', startIndex) + 1;
  } else {
    startIndex = rawText.indexOf('*** START OF THIS PROJECT GUTENBERG');
    if (startIndex !== -1) {
      startIndex = rawText.indexOf('\n', startIndex) + 1;
    } else {
      startIndex = 0;
    }
  }

  let endIndex = rawText.indexOf('*** END OF THE PROJECT GUTENBERG');
  if (endIndex === -1) {
    endIndex = rawText.indexOf('*** END OF THIS PROJECT GUTENBERG');
  }
  if (endIndex === -1) {
    endIndex = rawText.indexOf('End of the Project Gutenberg');
  }
  if (endIndex === -1) {
    endIndex = rawText.indexOf('End of Project Gutenberg');
  }
  if (endIndex === -1) endIndex = rawText.length;

  const bookBody = rawText.substring(startIndex, endIndex).trim();
  if (bookBody.length < 500) return null;

  // 2. Parse chapters using literary division markers
  const chapterRegex = /(?:^|\n)\s*(?:CHAPTER|Chapter|ACT|Act|SCENE|Scene|BOOK|Book|PART|Part|LETTER|Letter|STAVE|Stave|CANTO|Canto|SECTION|Section|VOLUME|Volume)\s+([IVXLCDM0-9]+|[A-Z][a-z]+)[\.\:\-\s]*([^\n]*)\n/g;
  
  const matches = [...bookBody.matchAll(chapterRegex)];
  const chapters: AuthenticBookChapter[] = [];

  if (matches.length >= 2) {
    // If there is introductory material before Chapter 1, include it as Preface
    if (matches[0].index && matches[0].index > 400) {
      const introText = bookBody.substring(0, matches[0].index).trim();
      if (introText.length > 80) {
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
          chapter: rawChapterTitle.replace(/[\r\n]+/g, ' ').substring(0, 100),
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

  return chapters.length > 0 ? chapters.slice(0, 120) : null;
}

/**
 * Fetches text from Internet Archive DjVu OCR / TXT and converts to structured chapters
 */
async function fetchAndParseInternetArchive(iaId: string, title?: string, author?: string): Promise<AuthenticBookChapter[] | null> {
  const urls = [
    `https://archive.org/download/${iaId}/${iaId}_djvu.txt`,
    `https://archive.org/stream/${iaId}/${iaId}_djvu.txt`,
    `https://archive.org/download/${iaId}/${iaId}.txt`
  ];

  let rawText = '';
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
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

  return chapters.length > 0 ? chapters.slice(0, 100) : null;
}

function cleanBookText(text: string): string {
  return stripHtml(text);
}
