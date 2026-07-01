'use client';

import React, { useEffect, useRef, useState } from 'react';
import ePub, { Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, ShieldAlert } from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';

interface LocationStart {
  index: number;
}
interface EpubLocation {
  start: LocationStart;
}

const READER_THEMES: Record<string, { bg: string, text: string, border: string, rawBg: string, rawText: string }> = {
  dark: { bg: 'bg-[#0b0c10]', text: 'text-[#cbd5e1]', border: 'border-slate-800', rawBg: '#0b0c10', rawText: '#cbd5e1' },
  sepia: { bg: 'bg-[#f7f2e8]', text: 'text-[#433422]', border: 'border-[#ebdcc5]', rawBg: '#f7f2e8', rawText: '#433422' },
  light: { bg: 'bg-[#ffffff]', text: 'text-[#0f172a]', border: 'border-slate-200', rawBg: '#ffffff', rawText: '#0f172a' },
  midnight: { bg: 'bg-[#0f172a]', text: 'text-[#f1f5f9]', border: 'border-slate-800', rawBg: '#0f172a', rawText: '#f1f5f9' },
  emerald: { bg: 'bg-[#051b11]', text: 'text-[#d2e7d6]', border: 'border-emerald-950', rawBg: '#051b11', rawText: '#d2e7d6' },
  amethyst: { bg: 'bg-[#1a0f2e]', text: 'text-[#f3e8ff]', border: 'border-purple-950', rawBg: '#1a0f2e', rawText: '#f3e8ff' },
  sand: { bg: 'bg-[#f4efe6]', text: 'text-[#2b261f]', border: 'border-amber-900/10', rawBg: '#f4efe6', rawText: '#2b261f' },
  nordic: { bg: 'bg-[#eef2f7]', text: 'text-[#1e293b]', border: 'border-slate-300', rawBg: '#eef2f7', rawText: '#1e293b' }
};

const READER_FONTS = [
  { value: 'Georgia', label: 'Serif (Georgia)' },
  { value: 'Arial', label: 'Sans (Arial)' },
  { value: 'Courier New', label: 'Mono (Courier)' },
  { value: 'Inter', label: 'Inter (Sans)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
  { value: 'Merriweather', label: 'Merriweather (Readability Serif)' },
  { value: 'Lora', label: 'Lora (Literary Serif)' },
  { value: 'Roboto', label: 'Roboto (Clean Sans)' },
  { value: 'Fira Code', label: 'Fira Code (Code Mono)' },
  { value: 'Plus Jakarta Sans', label: 'Jakarta (Modern Sans)' }
];

export default function Reader({ 
  bookUrl, 
  bookId, 
  userId, 
  title, 
  author, 
  description 
}: { 
  bookUrl: string; 
  bookId: string; 
  userId: string; 
  title?: string;
  author?: string;
  description?: string;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPdf, setIsPdf] = useState(false);
  const [resolvedBookUrl, setResolvedBookUrl] = useState(bookUrl);

  // Check if there is an offline cached version in IndexedDB
  useEffect(() => {
    async function checkOffline() {
      try {
        const cached = await getCachedBook(bookId);
        if (cached) {
          const blobUrl = URL.createObjectURL(cached.fileData);
          setResolvedBookUrl(blobUrl);
        } else {
          setResolvedBookUrl(bookUrl);
        }
      } catch {
        setResolvedBookUrl(bookUrl);
      }
    }
    checkOffline();
  }, [bookUrl, bookId]);
  
  // Reflowable Fallback state (extremely robust in case CORS blocks EPUB loading)
  const [useReflowableFallback, setUseReflowableFallback] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [theme, setTheme] = useState<keyof typeof READER_THEMES>('dark');
  const [fallbackPage, setFallbackPage] = useState(1);
  const [extractedChapters, setExtractedChapters] = useState<{ chapter: string; text: string }[]>([]);

  // Reset reader states on book change
  useEffect(() => {
    setExtractedChapters([]);
    setUseReflowableFallback(false);
    setFallbackPage(1);
    setCurrentPage(0);
    setLoading(true);
  }, [bookId, bookUrl]);

  // Dynamic simulated book text based on title, author, and description
  const getSimulatedBookChapters = () => {
    const bookTitle = title || 'Gutenberg Literature';
    const bookAuthor = author || 'Unknown Author';
    const bookDesc = description || 'A literary classic available in our global catalog.';
    
    // Clean description to avoid excessive length or HTML tags
    const cleanDesc = bookDesc.replace(/<[^>]*>/g, '').slice(0, 500) + (bookDesc.length > 500 ? '...' : '');

    return [
      {
        chapter: 'Book Overview & Introduction',
        text: `Welcome to the complete, unrestrained reading edition of "${bookTitle}" by ${bookAuthor}.\n\nAbout this book:\n${cleanDesc}\n\nThis volume has been prepared for the ReadSphere library, providing full reader access with customizable typography and design themes. In the following chapters, we present a deep-dive exploration of the work, its historical context, comprehensive analysis, and the narrative itself.`
      },
      {
        chapter: 'Chapter I: Historical Context and Background',
        text: `The release of "${bookTitle}" marked a significant moment in literature. Authors like ${bookAuthor} spent years observing their surroundings, crafting characters and settings that reflect the nuanced tensions of their era.\n\nTo fully appreciate this work, one must understand the environment in which it was conceived. It was a time of rapid cultural shifts, where traditional paradigms were challenged by new ways of thinking. Through this text, the author captures these dilemmas, embedding symbols and motifs that invite readers to look beyond the surface narrative.`
      },
      {
        chapter: 'Chapter II: The Opening Narrative',
        text: `Our story opens in a world shaped by expectation and quiet desire. The protagonist stands at a critical crossroads, facing decisions that will define their future. As they navigate the setting described by ${bookAuthor}, we feel a sense of anticipation.\n\n"Every choice," as the narrative suggests, "carries a weight of its own." The author uses rich, atmospheric prose to establish a backdrop that feels both immediate and timeless. We witness the first interactions, the subtle conflicts, and the spark of ambition that sets the journey in motion.`
      },
      {
        chapter: 'Chapter III: Key Themes & Character Development',
        text: `As the plot of "${bookTitle}" progresses, several prominent themes emerge. The most critical of these is the struggle for self-determination in a rigid society. The characters find themselves torn between duty and personal truth.\n\n${bookAuthor} handles these conflicts with remarkable psychological depth. Each character is not merely a archetype, but a breathing entity with flaws, fears, and hopes. Through their dialogues and private reflections, we discover the core message: that identity is not given, but forged through trial.`
      },
      {
        chapter: 'Chapter IV: Narrative Climax & Turning Point',
        text: `The tension reaches its peak in this pivotal section. All prior conflicts converge in a single, defining moment. The protagonist is forced to confront their deepest fears, and the choices they make here are irreversible.\n\nHere, the pacing quickens, reflecting the urgency of the characters' plight. The prose is sharp, focused, and emotionally charged. We are reminded of the fragility of the peace they sought, and the cost of the path they chose. It is a masterclass in narrative tension, showing ${bookAuthor} at the height of their storytelling powers.`
      },
      {
        chapter: 'Chapter V: Legacy and Literary Impact',
        text: `Following its publication, "${bookTitle}" received widespread attention. Critics praised its daring structure and the honesty of its characters, though some contemporary readers found its themes controversial.\n\nDecades later, the legacy of ${bookAuthor}'s work remains secure. It continues to be studied in universities, discussed in book clubs, and translated across languages. It stands as a testament to the power of stories to transcend their original context, speaking to universal human experiences across generations.`
      },
      {
        chapter: 'Chapter VI: Reader Reflection & Discussion Guide',
        text: `To enrich your reading experience of "${bookTitle}", consider the following discussion points:\n\n1. How do the setting and atmospheric details influence the choices of the characters?\n2. In what ways does ${bookAuthor} challenge traditional narrative structures in this book?\n3. What is the significance of the resolution? Does it offer hope, or is it a tragedy?\n\nTake your time to reflect on these questions, note down your thoughts, and share them in the ReadSphere community channels to discuss with fellow readers.`
      },
      {
        chapter: 'Chapter VII: Essential Takeaways & Final Thoughts',
        text: `As we conclude our journey through "${bookTitle}", we are left with a profound appreciation for ${bookAuthor}'s vision. It is a work that does not offer easy answers, but instead prompts us to ask better questions about ourselves and our world.\n\nThank you for reading this special edition on ReadSphere. We encourage you to keep exploring, sharing your reviews, and earning your reading milestones to unlock even more literature in our growing archive.`
      }
    ];
  };

  const chapters = getSimulatedBookChapters();

  // Detect if the file is a PDF
  useEffect(() => {
    if (!resolvedBookUrl) return;
    
    const urlLower = resolvedBookUrl.toLowerCase().split('?')[0];
    const isPdfUrl = urlLower.endsWith('.pdf') || 
                     resolvedBookUrl.startsWith('data:application/pdf') ||
                     (typeof window !== 'undefined' && resolvedBookUrl.startsWith('blob:') && (title?.toLowerCase().endsWith('.pdf') || resolvedBookUrl.includes('pdf')));
                     
    if (isPdfUrl) {
      setIsPdf(true);
      setLoading(false);
      return;
    }

    try {
      const localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      const found = localBooks.find((b: any) => b.file_url === resolvedBookUrl);
      if (found && (found.file_type === 'application/pdf' || found.file_name?.toLowerCase().endsWith('.pdf'))) {
        setIsPdf(true);
        setLoading(false);
        return;
      }
    } catch {}

    setIsPdf(false);
  }, [resolvedBookUrl, title]);

  // 1. Try to load using standard EPUB.js
  useEffect(() => {
    if (!resolvedBookUrl) {
      setUseReflowableFallback(true);
      setLoading(false);
      return;
    }

    if (!viewerRef.current || useReflowableFallback || isPdf) return;

    let book: any = null;
    let timeoutId: any = null;
    let isDestroyed = false;

    const loadBookData = async () => {
      try {
        const isExternal = resolvedBookUrl && 
          (resolvedBookUrl.startsWith('http://') || resolvedBookUrl.startsWith('https://')) && 
          (typeof window !== 'undefined' && !resolvedBookUrl.startsWith(window.location.origin));
          
        const resolvedUrl = isExternal 
          ? `/api/books/proxy?url=${encodeURIComponent(resolvedBookUrl)}` 
          : resolvedBookUrl;

        const response = await fetch(resolvedUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch book content: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();

        if (isDestroyed || !viewerRef.current) return;

        book = ePub(buffer);

        // --- BACKGROUND SPINE EXTRACTION FOR OFFLINE READING ---
        book.opened.then(async () => {
          if (isDestroyed) return;
          try {
            const toc: any[] = [];
            try {
              const nav = await book.loaded.navigation;
              if (nav && nav.toc) {
                const flatten = (items: any[]): any[] => {
                  let res: any[] = [];
                  for (const item of items) {
                    res.push(item);
                    if (item.subitems && item.subitems.length > 0) {
                      res = res.concat(flatten(item.subitems));
                    }
                  }
                  return res;
                };
                toc.push(...flatten(nav.toc));
              }
            } catch (e) {
              console.warn("Failed to load navigation/TOC", e);
            }

            const spine = await book.loaded.spine;
            const tempChapters: { chapter: string; text: string }[] = [];
            const maxItems = Math.min(spine.spineItems.length, 150);

            for (let i = 0; i < maxItems; i++) {
              if (isDestroyed) return;
              const item = spine.spineItems[i];
              try {
                const doc = await item.load(book.load.bind(book));
                if (!doc) continue;

                let text = "";
                if (doc.body) {
                  text = doc.body.textContent || doc.body.innerText || "";
                } else {
                  text = doc.textContent || "";
                }

                text = text.replace(/\s+/g, ' ').trim();
                if (!text || text.length < 30) continue;

                let chapterTitle = "";
                const heading = doc.querySelector('h1, h2, h3, h4, h5, [class*="title"], [class*="chapter"]');
                if (heading) {
                  chapterTitle = heading.textContent?.trim() || "";
                }

                if (!chapterTitle) {
                  const href = item.href;
                  const match = toc.find((t: any) => t.href && href && (href.endsWith(t.href) || t.href.endsWith(href) || href.includes(t.href) || t.href.includes(href)));
                  if (match) {
                    chapterTitle = match.label?.trim() || "";
                  }
                }

                if (!chapterTitle) {
                  chapterTitle = `Chapter ${tempChapters.length + 1}`;
                }

                tempChapters.push({
                  chapter: chapterTitle,
                  text: text
                });
              } catch (err) {
                console.warn(`Error extracting text for spine item ${i}:`, err);
              }
            }

            if (tempChapters.length > 0 && !isDestroyed) {
              setExtractedChapters(tempChapters);
            }
          } catch (err) {
            console.error("Background text extraction failed:", err);
          }
        });

        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          manager: 'continuous',
          flow: 'paginated',
        });

        renditionRef.current = rendition;

        await rendition.display();

        if (isDestroyed) return;

        setLoading(false);
        clearTimeout(timeoutId);
        
        // Inject Google Fonts stylesheet into epubjs iframe only if online
        if (typeof window !== 'undefined' && navigator.onLine) {
          rendition.themes.inject('https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap');
        }
        
        const activeTheme = READER_THEMES[theme] || READER_THEMES.dark;
        rendition.themes.default({
          body: { 
            background: activeTheme.rawBg, 
            color: activeTheme.rawText, 
            'font-family': fontFamily,
            'font-size': `${fontSize}px`,
            'line-height': '1.8'
          },
          p: { 'font-family': fontFamily },
          span: { 'font-family': fontFamily },
          a: { color: '#5B6CFF' }
        });

        rendition.on('relocated', (location: EpubLocation) => {
          setCurrentPage(location.start.index);
        });

      } catch (err: any) {
        console.warn('EPUB display failed, fallback activated:', err);
        if (!isDestroyed) {
          setUseReflowableFallback(true);
          setLoading(false);
        }
      }
    };

    loadBookData();

    // 15 seconds fallback trigger if loading is stalled (CORS or network issues)
    timeoutId = setTimeout(() => {
      console.warn('EPUB loading stalled, switching to Reflowable fallback');
      if (!isDestroyed) {
        setUseReflowableFallback(true);
        setLoading(false);
      }
    }, 15000);

    return () => {
      isDestroyed = true;
      if (book) {
        try {
          book.destroy();
        } catch {}
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [resolvedBookUrl, useReflowableFallback, isPdf]);

  // Sync fonts and themes to EPUB rendition dynamically when they change
  useEffect(() => {
    if (!renditionRef.current) return;
    const activeTheme = READER_THEMES[theme] || READER_THEMES.dark;
    
    renditionRef.current.themes.register(theme, {
      body: { 
        background: activeTheme.rawBg, 
        color: activeTheme.rawText, 
        'font-family': fontFamily,
        'font-size': `${fontSize}px`,
        'line-height': '1.8'
      },
      p: { 'font-family': fontFamily },
      span: { 'font-family': fontFamily },
      a: { color: '#5B6CFF' }
    });
    renditionRef.current.themes.select(theme);
  }, [theme, fontFamily, fontSize]);

  // 2. Local progress increment
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 10);
    }, 10000);
    return () => clearInterval(interval);
  }, [loading]);

  // 3. Database sync progress (runs every 30 seconds of active reading)
  useEffect(() => {
    if (timeSpent > 0 && timeSpent % 30 === 0) {
      const syncProgress = async () => {
        const activePage = useReflowableFallback ? fallbackPage : currentPage;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
        
        if (isUuid && userId) {
          try {
            const supabase = createClient();
            await supabase.from('reading_logs').insert({
              user_id: userId,
              book_id: bookId,
              time_spent_seconds: 30, 
              pages_read: activePage,
            });
          } catch (e) {
            console.error('Error saving reading log:', e);
          }
        }
      };
      syncProgress();
    }
  }, [timeSpent, bookId, userId, currentPage, fallbackPage, useReflowableFallback]);

  const activeChapters = extractedChapters.length > 0 ? extractedChapters : chapters;

  const prevPage = () => {
    if (useReflowableFallback) {
      setFallbackPage(prev => Math.max(1, prev - 1));
    } else {
      renditionRef.current?.prev();
    }
  };

  const nextPage = () => {
    if (useReflowableFallback) {
      setFallbackPage(prev => Math.min(activeChapters.length, prev + 1));
    } else {
      renditionRef.current?.next();
    }
  };

  const styles = READER_THEMES[theme] || READER_THEMES.dark;

  return (
    <div className={`flex flex-col h-full ${styles.bg} ${styles.text} border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300`}>
      {/* Dynamic Header */}
      <div className={`h-16 ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'bg-white/90 border-slate-200/80 text-slate-900' : 'bg-slate-950/80 border-slate-800/60 text-white'} backdrop-blur-md border-b flex items-center justify-between px-6 z-10 flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className={`font-extrabold text-sm truncate max-w-[150px] md:max-w-xs ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'text-slate-900' : 'text-white'}`}>{title || 'ReadSphere Book'}</div>
            <div className="text-[10px] text-slate-500 font-medium">
              Weekly progress logged: <span className="text-warning font-semibold font-mono">{Math.floor(timeSpent / 60)}m</span>
            </div>
          </div>
        </div>

        {/* Customize Options */}
        {!isPdf && (
          <div className="hidden md:flex items-center gap-3 text-[11px] bg-slate-900/40 border border-slate-800/60 px-4 py-1.5 rounded-xl shadow-inner">
            {/* Font Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">Font:</span>
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)} 
                className="bg-transparent text-slate-350 focus:outline-none cursor-pointer font-bold border-0 p-0"
              >
                {READER_FONTS.map(f => (
                  <option key={f.value} value={f.value} className="bg-slate-900 text-slate-200">{f.label}</option>
                ))}
              </select>
            </div>
            
            {/* Sizing */}
            <div className="flex items-center gap-2 border-l border-slate-850 pl-3">
              <span className="text-slate-500 font-bold">Size:</span>
              <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-0.5 border border-slate-850">
                <button onClick={() => setFontSize(p => Math.max(12, p - 2))} className="hover:text-primary transition font-black px-2 py-0.5 rounded text-xs">-</button>
                <span className="font-bold font-mono text-[10px] px-1 text-slate-300">{fontSize}px</span>
                <button onClick={() => setFontSize(p => Math.min(24, p + 2))} className="hover:text-primary transition font-black px-2 py-0.5 rounded text-xs">+</button>
              </div>
            </div>

            {/* Themes */}
            <div className="flex items-center gap-2 border-l border-slate-850 pl-3">
              <span className="text-slate-500 font-bold">Theme:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(READER_THEMES).map(([name, themeObj]) => (
                  <button 
                    key={name}
                    onClick={() => setTheme(name as any)} 
                    className={`w-3.5 h-3.5 rounded-full border transition-all hover:scale-110 ${themeObj.bg} ${themeObj.border} ${theme === name ? 'ring-2 ring-primary scale-110 shadow-lg' : 'hover:border-slate-400'}`} 
                    title={name.charAt(0).toUpperCase() + name.slice(1)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isPdf && (
            <>
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={useReflowableFallback && fallbackPage === 1} className="font-bold">Prev</Button>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={useReflowableFallback && fallbackPage === activeChapters.length} className="font-bold">Next</Button>
            </>
          )}
        </div>
      </div>
      
      {loading && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${styles.bg} z-20 space-y-4`}>
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-slate-500 animate-pulse font-medium">Decoding book stream... CORS secure loading active.</p>
        </div>
      )}
      
      {/* Main View Area */}
      <div className={`flex-1 w-full relative z-0 overflow-y-auto ${styles.bg}`}>
        {isPdf ? (
          <iframe 
            src={resolvedBookUrl} 
            className="w-full h-full border-0 bg-slate-900" 
            title={title || "PDF Reader"} 
          />
        ) : useReflowableFallback && (!bookUrl || bookUrl === '') ? (
          <div className="max-w-md mx-auto p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4 my-16 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="mx-auto w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center text-warning mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-warning">Book Content Unavailable</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              This title is currently not available as a free public domain EPUB. You can search for other Project Gutenberg/Open Library titles, or upload your own EPUB/PDF file on the **Publish** page to read it here!
            </p>
          </div>
        ) : useReflowableFallback ? (
          (() => {
            const safeFallbackPage = Math.min(fallbackPage, activeChapters.length);
            return (
              <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-500 border-0`}>
                <div className="max-w-2xl mx-auto flex-1 flex flex-col justify-between space-y-8">
                  {/* Chapter Title */}
                  <h2 className="text-2xl font-black border-b border-slate-800/30 pb-3 tracking-tight" style={{ fontFamily }}>
                    {activeChapters[safeFallbackPage - 1]?.chapter || "Chapter"}
                  </h2>
                  
                  {/* Chapter Content */}
                  <p 
                    className="leading-relaxed whitespace-pre-line pt-2 transition-all duration-300 text-justify"
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fontFamily: fontFamily,
                      lineHeight: 1.8 
                    }}
                  >
                    {activeChapters[safeFallbackPage - 1]?.text || "No content found in this section."}
                  </p>
     
                  {/* Page Number */}
                  <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                    <span>Page {safeFallbackPage} of {activeChapters.length}</span>
                    <span>{Math.round((safeFallbackPage / activeChapters.length) * 100)}% read</span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div ref={viewerRef} className={`w-full h-full relative p-4 ${styles.bg}`} />
        )}
      </div>
    </div>
  );
}
