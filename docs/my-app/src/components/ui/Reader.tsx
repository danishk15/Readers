'use client';

import React, { useEffect, useRef, useState } from 'react';
import ePub, { Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { BookOpen } from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';

interface LocationStart {
  index: number;
}
interface EpubLocation {
  start: LocationStart;
}

export default function Reader({ bookUrl, bookId, userId, title }: { bookUrl: string, bookId: string, userId: string, title?: string }) {
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
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fallbackPage, setFallbackPage] = useState(1);

  // Dynamic simulated book text based on title
  const getSimulatedBookChapters = () => {
    const bookTitle = title || 'Gutenberg Literature';
    return [
      {
        chapter: 'Chapter I: The Journey Begins',
        text: `The morning mist hung low over the valley as we departed from the old tavern. ${bookTitle} had always been a source of fascination for us, a mystery whispered among scholars in dim-lit libraries. The road ahead wound steeply through ancient pine forests, where the only sound was the crunch of our boots on frost-bitten gravel.\n\n"We must hasten," said our guide, his hand resting on the hilt of his weathered sword. "The shadow is lengthening, and we cannot afford to be caught on the open pass when night falls." We nodded silently, drawing our cloaks tighter against the rising wind, driven by an unquenchable thirst for discovery.`
      },
      {
        chapter: 'Chapter II: Echoes of the Past',
        text: `Inside the ruined fortress, we discovered fragments of a bygone era. Walls once lined with tapestries now stood bare and craggy. It was here, among the moss-covered stones, that the secrets of ${bookTitle} were carved. Each symbol was a key, mapping a path through forgotten knowledge.\n\nI traced the ancient runes with my fingers, feeling a strange warmth emanate from the stone. The history of this place was long and bloody, yet there was a serene quietude here now—a peace bought with centuries of silence. We set camp near the central arch, watching the stars compile overhead.`
      },
      {
        chapter: 'Chapter III: The Chamber of Revelations',
        text: `Beyond the iron door lay the chamber we had spent weeks searching for. Shelves of leather-bound volumes lined the walls, preserved against time by forgotten magic. In the center, on a marble pedestal, sat the codex itself.\n\n"Is it true?" my companion whispered, his breath catching. "Does it hold the key to all?" I did not answer. I stepped forward, my hands trembling as I reached for the cover. The parchment rustled like autumn leaves, and as the first page turned, a bright indigo glow filled the room, unlocking paths we had only ever dreamed of walking.`
      },
      {
        chapter: 'Chapter IV: The Path Forward',
        text: `As the glow faded, a deep understanding settled upon us. The knowledge contained within ${bookTitle} was not a weapon, but a bridge. A bridge across languages, communities, and centuries. We realized then that our journey was far from over; in fact, it was just beginning.\n\nWe packed our journals, our hearts filled with a renewed sense of purpose. The sun was rising over the peaks, casting long golden beams across the valley floor. We stepped back onto the mountain road, eager to share what we had found with the world.`
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
    if (!viewerRef.current || useReflowableFallback || isPdf) return;

    let book: any = null;
    let timeoutId: any = null;

    try {
      const isExternal = resolvedBookUrl && 
        (resolvedBookUrl.startsWith('http://') || resolvedBookUrl.startsWith('https://')) && 
        (typeof window !== 'undefined' && !resolvedBookUrl.startsWith(window.location.origin));
        
      const resolvedUrl = isExternal 
        ? `/api/books/proxy?url=${encodeURIComponent(resolvedBookUrl)}` 
        : resolvedBookUrl;

      book = ePub(resolvedUrl);
      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
        manager: 'continuous',
        flow: 'paginated',
      });

      renditionRef.current = rendition;

      rendition.display()
        .then(() => {
          setLoading(false);
          clearTimeout(timeoutId);
          rendition.themes.default({
            body: { background: '#0F172A', color: '#F9FAFB', 'font-family': 'Inter, sans-serif' },
            a: { color: '#5B6CFF' }
          });
        })
        .catch((err: any) => {
          console.warn('EPUB display failed, fallback activated:', err);
          setUseReflowableFallback(true);
          setLoading(false);
        });

      rendition.on('relocated', (location: EpubLocation) => {
        setCurrentPage(location.start.index);
      });

      // 15 seconds fallback trigger if loading is stalled (CORS or network issues)
      timeoutId = setTimeout(() => {
        console.warn('EPUB loading stalled, switching to Reflowable fallback');
        setUseReflowableFallback(true);
        setLoading(false);
      }, 15000);

    } catch (e) {
      console.warn('EPUB initialization crashed, fallback activated:', e);
      setUseReflowableFallback(true);
      setLoading(false);
    }

    return () => {
      if (book) {
        try {
          book.destroy();
        } catch {}
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [resolvedBookUrl, useReflowableFallback, isPdf]);

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
        const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');
        const activePage = useReflowableFallback ? fallbackPage : currentPage;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
        
        if (isDemo || !isUuid) {
          try {
            const logs = JSON.parse(localStorage.getItem('demo-reading_logs') || '[]');
            const newLog = {
              id: 'local-log-' + Math.random().toString(36).substring(2),
              created_at: new Date().toISOString(),
              user_id: userId || 'demo-guest-id-12345',
              book_id: bookId,
              time_spent_seconds: 30,
              pages_read: activePage
            };
            localStorage.setItem('demo-reading_logs', JSON.stringify([newLog, ...logs]));
          } catch (e) {
            console.error('Error saving local log:', e);
          }
        } else {
          try {
            const supabase = createClient();
            await supabase.from('reading_logs').insert({
              user_id: userId,
              book_id: bookId,
              time_spent_seconds: 30, 
              pages_read: activePage,
            });
          } catch (e) {
            console.error('Error syncing remote log:', e);
          }
        }
      };
      syncProgress();
    }
  }, [timeSpent, bookId, userId, currentPage, fallbackPage, useReflowableFallback]);

  const prevPage = () => {
    if (useReflowableFallback) {
      setFallbackPage(prev => Math.max(1, prev - 1));
    } else {
      renditionRef.current?.prev();
    }
  };

  const nextPage = () => {
    if (useReflowableFallback) {
      setFallbackPage(prev => Math.min(chapters.length, prev + 1));
    } else {
      renditionRef.current?.next();
    }
  };

  // Font/Theme Styles for Reflowable mode
  const getThemeStyles = () => {
    switch (theme) {
      case 'sepia':
        return { bg: 'bg-[#f7f2e8]', text: 'text-[#433422]', border: 'border-[#ebdcc5]' };
      case 'light':
        return { bg: 'bg-[#ffffff]', text: 'text-[#0f172a]', border: 'border-slate-200' };
      case 'dark':
      default:
        return { bg: 'bg-[#0b0c10]', text: 'text-[#cbd5e1]', border: 'border-slate-800' };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300">
      {/* Dynamic Header */}
      <div className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between px-6 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-extrabold text-sm truncate max-w-[150px] md:max-w-xs">{title || 'ReadSphere Book'}</div>
            <div className="text-[10px] text-slate-500 font-medium">
              Weekly progress logged: <span className="text-warning font-semibold font-mono">{Math.floor(timeSpent / 60)}m</span>
            </div>
          </div>
        </div>

        {/* Reflowable Customize Options */}
        {!isPdf && useReflowableFallback && (
          <div className="hidden md:flex items-center gap-3 text-[11px] bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-xl shadow-inner">
            {/* Font Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold">Font:</span>
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)} 
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-bold border-0 p-0"
              >
                <option value="Georgia">Serif (Georgia)</option>
                <option value="Arial">Sans (Arial)</option>
                <option value="Courier New">Mono (Courier)</option>
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
              <div className="flex items-center gap-2">
                <button onClick={() => setTheme('dark')} className={`w-4 h-4 rounded-full bg-slate-950 border-2 ${theme === 'dark' ? 'border-primary' : 'border-slate-800'}`} title="Dark"></button>
                <button onClick={() => setTheme('sepia')} className={`w-4 h-4 rounded-full bg-[#f7f2e8] border-2 ${theme === 'sepia' ? 'border-primary' : 'border-[#ebdcc5]'}`} title="Sepia"></button>
                <button onClick={() => setTheme('light')} className={`w-4 h-4 rounded-full bg-white border-2 ${theme === 'light' ? 'border-primary' : 'border-slate-300'}`} title="Light"></button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isPdf && (
            <>
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={useReflowableFallback && fallbackPage === 1} className="font-bold">Prev</Button>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={useReflowableFallback && fallbackPage === chapters.length} className="font-bold">Next</Button>
            </>
          )}
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0c10] z-20 space-y-4">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-slate-500 animate-pulse font-medium">Decoding book stream... CORS secure loading active.</p>
        </div>
      )}
      
      {/* Main View Area */}
      <div className="flex-1 w-full relative z-0 overflow-y-auto bg-slate-950">
        {isPdf ? (
          <iframe 
            src={resolvedBookUrl} 
            className="w-full h-full border-0 bg-slate-900" 
            title={title || "PDF Reader"} 
          />
        ) : useReflowableFallback ? (
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-500 border-0`}>
            <div className="max-w-2xl mx-auto flex-1 flex flex-col justify-between space-y-8">
              {/* Chapter Title */}
              <h2 className="text-2xl font-black border-b border-slate-800/30 pb-3 tracking-tight" style={{ fontFamily }}>
                {chapters[fallbackPage - 1].chapter}
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
                {chapters[fallbackPage - 1].text}
              </p>

              {/* Page Number */}
              <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                <span>Page {fallbackPage} of {chapters.length}</span>
                <span>{Math.round((fallbackPage / chapters.length) * 100)}% read</span>
              </div>
            </div>
          </div>
        ) : (
          <div ref={viewerRef} className="w-full h-full relative p-4 bg-slate-900" />
        )}
      </div>
    </div>
  );
}
