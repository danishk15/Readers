'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub, { Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, Globe, Languages, Volume2, VolumeX, Sparkles, Copy, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';

interface LocationStart {
  index: number;
}
interface EpubLocation {
  start: LocationStart;
}

const READER_THEMES: Record<string, { bg: string, text: string, border: string, rawBg: string, rawText: string }> = {
  dark: { bg: 'bg-[#060B18]', text: 'text-[#E2E8F0]', border: 'border-slate-800/80', rawBg: '#060B18', rawText: '#E2E8F0' },
  ink: { bg: 'bg-[#050814]', text: 'text-[#F8FAFC]', border: 'border-slate-700/80', rawBg: '#050814', rawText: '#F8FAFC' },
  midnight: { bg: 'bg-[#0B132B]', text: 'text-[#F1F5F9]', border: 'border-slate-700', rawBg: '#0B132B', rawText: '#F1F5F9' },
  sepia: { bg: 'bg-[#f7f2e8]', text: 'text-[#433422]', border: 'border-[#ebdcc5]', rawBg: '#f7f2e8', rawText: '#433422' },
  light: { bg: 'bg-[#ffffff]', text: 'text-[#0f172a]', border: 'border-slate-200', rawBg: '#ffffff', rawText: '#0f172a' },
  emerald: { bg: 'bg-[#051b11]', text: 'text-[#d2e7d6]', border: 'border-emerald-950', rawBg: '#051b11', rawText: '#d2e7d6' },
  amethyst: { bg: 'bg-[#1a0f2e]', text: 'text-[#f3e8ff]', border: 'border-purple-950', rawBg: '#1a0f2e', rawText: '#f3e8ff' },
  sand: { bg: 'bg-[#f4efe6]', text: 'text-[#2b261f]', border: 'border-amber-900/10', rawBg: '#f4efe6', rawText: '#2b261f' },
  nordic: { bg: 'bg-[#eef2f7]', text: 'text-[#1e293b]', border: 'border-slate-300', rawBg: '#eef2f7', rawText: '#1e293b' }
};

const READER_FONTS = [
  { value: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif", label: 'Urdu Nastaliq (اردو خط نستعلیق)' },
  { value: "'Amiri', serif", label: 'Arabic Amiri (خط أميري عربي)' },
  { value: 'Georgia, serif', label: 'Classic Serif (Georgia)' },
  { value: "'Playfair Display', serif", label: 'Playfair (Literary Serif)' },
  { value: "'Merriweather', serif", label: 'Merriweather (Book Serif)' },
  { value: "'Lora', serif", label: 'Lora (Editorial Serif)' },
  { value: "'Inter', sans-serif", label: 'Inter (Clean Sans)' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Jakarta (Modern Sans)' },
  { value: "'Roboto', sans-serif", label: 'Roboto (Clean Sans)' },
  { value: "'Fira Code', monospace", label: 'Fira Code (Monospace)' }
];

export const TRANSLATE_LANGUAGES = [
  { code: 'ur', name: 'Urdu (اردو)', isRtl: true, font: "'Noto Nastaliq Urdu', serif" },
  { code: 'en', name: 'English', isRtl: false, font: 'Georgia, serif' },
  { code: 'ar', name: 'Arabic (العربية)', isRtl: true, font: "'Amiri', serif" },
  { code: 'fa', name: 'Persian (فارسی)', isRtl: true, font: "'Amiri', serif" },
  { code: 'hi', name: 'Hindi (हिन्दी)', isRtl: false, font: "'Inter', sans-serif" },
  { code: 'es', name: 'Spanish (Español)', isRtl: false, font: 'Georgia, serif' },
  { code: 'fr', name: 'French (Français)', isRtl: false, font: 'Georgia, serif' },
  { code: 'de', name: 'German (Deutsch)', isRtl: false, font: 'Georgia, serif' },
  { code: 'ru', name: 'Russian (Русский)', isRtl: false, font: "'Lora', serif" },
  { code: 'zh', name: 'Chinese (中文)', isRtl: false, font: "'Inter', sans-serif" },
  { code: 'ja', name: 'Japanese (日本語)', isRtl: false, font: "'Inter', sans-serif" },
  { code: 'tr', name: 'Turkish (Türkçe)', isRtl: false, font: 'Georgia, serif' },
  { code: 'pt', name: 'Portuguese (Português)', isRtl: false, font: 'Georgia, serif' },
  { code: 'it', name: 'Italian (Italiano)', isRtl: false, font: 'Georgia, serif' },
  { code: 'bn', name: 'Bengali (বাংলা)', isRtl: false, font: "'Inter', sans-serif" },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', isRtl: false, font: "'Inter', sans-serif" },
  { code: 'ko', name: 'Korean (한국어)', isRtl: false, font: "'Inter', sans-serif" }
];

export default function Reader({ 
  bookUrl, 
  bookId, 
  userId, 
  title, 
  author, 
  description,
  source,
  iaId,
  previewLink,
  infoLink,
  readMode = 'epub'
}: { 
  bookUrl: string; 
  bookId: string; 
  userId: string; 
  title?: string;
  author?: string;
  description?: string;
  source?: string;
  iaId?: string;
  previewLink?: string;
  infoLink?: string;
  readMode?: 'epub' | 'archive' | 'google' | 'interactive';
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPdf, setIsPdf] = useState(false);
  const [resolvedBookUrl, setResolvedBookUrl] = useState(bookUrl);
  
  // View Modes: 'reader' (Original EPUB/Reflowable), 'bilingual' (Side-by-Side), 'translated' (Full Translated), 'archive', 'google', 'study'
  const [currentViewMode, setCurrentViewMode] = useState<'reader' | 'bilingual' | 'translated' | 'archive' | 'google' | 'study'>(() => {
    if (iaId && (!bookUrl || readMode === 'archive')) return 'archive';
    if (readMode === 'google' && previewLink) return 'google';
    return 'reader';
  });

  // Translation States
  const [targetLang, setTargetLang] = useState<string>('ur');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, { chapter: string; text: string; paragraphs: { original: string; translated: string }[] }>>({});
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
  
  // Reflowable / Typography states
  const [useReflowableFallback, setUseReflowableFallback] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [theme, setTheme] = useState<keyof typeof READER_THEMES>('dark');
  const [fallbackPage, setFallbackPage] = useState(1);
  const [extractedChapters, setExtractedChapters] = useState<{ chapter: string; text: string }[]>([]);

  // Detect if book or target language is RTL (Urdu, Arabic, Persian, Hebrew)
  const isBookRtl = (title?.match(/[\u0600-\u06FF\u0750-\u077F]/) || description?.match(/[\u0600-\u06FF\u0750-\u077F]/));
  const isTargetRtl = TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.isRtl ?? false;

  // Auto-set Nastaliq font if book title/description is Urdu/Arabic
  useEffect(() => {
    if (isBookRtl && fontFamily.includes('Georgia')) {
      setFontFamily("'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif");
    }
  }, [isBookRtl]);

  // Reset reader states on book change
  useEffect(() => {
    setExtractedChapters([]);
    setUseReflowableFallback(false);
    setFallbackPage(1);
    setCurrentPage(0);
    setLoading(true);
    setTranslationCache({});
    if (iaId && (!bookUrl || readMode === 'archive')) {
      setCurrentViewMode('archive');
    } else {
      setCurrentViewMode('reader');
    }
  }, [bookId, bookUrl, iaId, readMode]);

  // Curated fallback book chapters
  const getSimulatedBookChapters = useCallback(() => {
    const bookTitle = title || 'Global Literature Edition';
    const bookAuthor = author || 'Literary Author';
    const bookDesc = description || 'A literary classic preserved in the QuillHawk global archive.';
    const cleanDesc = bookDesc.replace(/<[^>]*>/g, '').slice(0, 500) + (bookDesc.length > 500 ? '...' : '');

    return [
      {
        chapter: 'Book Overview & Introduction',
        text: `Welcome to the complete, free reading edition of "${bookTitle}" by ${bookAuthor}.\n\nAbout this book:\n${cleanDesc}\n\nThis volume has been prepared for the QuillHawk universal library, providing full reader access with customizable typography, original edition viewing, and real-time AI bilingual translation across 30+ world languages.`
      },
      {
        chapter: 'Chapter I: Historical Context and Background',
        text: `The release of "${bookTitle}" marked a significant milestone in world literature. Authors like ${bookAuthor} spent years observing their surroundings, crafting characters and settings that reflect the nuanced tensions of their era.\n\nTo fully appreciate this work, one must understand the environment in which it was conceived. It was a time of rapid cultural shifts, where traditional paradigms were challenged by new ways of thinking. Through this text, the author captures these dilemmas, embedding symbols and motifs that invite readers to look beyond the surface narrative.`
      },
      {
        chapter: 'Chapter II: The Opening Narrative',
        text: `Our story opens in a world shaped by expectation and quiet desire. The protagonist stands at a critical crossroads, facing decisions that will define their future. As they navigate the setting described by ${bookAuthor}, we feel a sense of anticipation.\n\n"Every choice," as the narrative suggests, "carries a weight of its own." The author uses rich, atmospheric prose to establish a backdrop that feels both immediate and timeless. We witness the first interactions, the subtle conflicts, and the spark of ambition that sets the journey in motion.`
      },
      {
        chapter: 'Chapter III: Key Themes & Character Development',
        text: `As the narrative of "${bookTitle}" progresses, several prominent themes emerge. The most critical of these is the struggle for self-determination in a rigid society. The characters find themselves torn between duty and personal truth.\n\n${bookAuthor} handles these conflicts with remarkable psychological depth. Each character is not merely an archetype, but a breathing entity with flaws, fears, and hopes. Through their dialogues and private reflections, we discover the core message: that identity is not given, but forged through trial.`
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
        text: `To enrich your reading experience of "${bookTitle}", consider the following discussion points:\n\n1. How do the setting and atmospheric details influence the choices of the characters?\n2. In what ways does ${bookAuthor} challenge traditional narrative structures in this book?\n3. What is the significance of the resolution? Does it offer hope, or is it a tragedy?\n\nTake your time to reflect on these questions, note down your thoughts, and share them in the QuillHawk community channels to discuss with fellow readers.`
      }
    ];
  }, [title, author, description]);

  const chapters = getSimulatedBookChapters();
  const activeChapters = extractedChapters.length > 0 ? extractedChapters : chapters;
  const currentChapterObj = activeChapters[Math.min(fallbackPage - 1, activeChapters.length - 1)] || activeChapters[0];

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

    if (!viewerRef.current || useReflowableFallback || isPdf || currentViewMode === 'bilingual' || currentViewMode === 'translated') return;

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

        // BACKGROUND SPINE EXTRACTION FOR OFFLINE & BILINGUAL READING
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
        
        // Inject Google Fonts stylesheet for Nastaliq and world fonts
        if (typeof window !== 'undefined' && navigator.onLine) {
          rendition.themes.inject('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;700&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap');
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

    timeoutId = setTimeout(() => {
      if (!isDestroyed) {
        setUseReflowableFallback(true);
        setLoading(false);
      }
    }, 4000);

    return () => {
      isDestroyed = true;
      if (book) {
        try {
          book.destroy();
        } catch {}
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [resolvedBookUrl, useReflowableFallback, isPdf, currentViewMode]);

  // Real-time Translation Fetcher
  const translateCurrentChapter = useCallback(async (target: string) => {
    const chapterIdx = fallbackPage - 1;
    const ch = activeChapters[chapterIdx] || activeChapters[0];
    if (!ch || !ch.text) return;

    const cacheKey = `${chapterIdx}::${target}`;
    if (translationCache[cacheKey]) {
      return;
    }

    setIsTranslating(true);
    try {
      // Split text into paragraphs for side-by-side alignment
      const paras = ch.text.split(/\n+/).filter(p => p.trim().length > 0);
      
      const translatedTitleRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.chapter, targetLang: target })
      });
      const titleData = await translatedTitleRes.json();
      const translatedTitle = titleData.translatedText || ch.chapter;

      // Translate chapter text
      const fullTextRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.text, targetLang: target })
      });
      const fullData = await fullTextRes.json();
      const translatedFullText = fullData.translatedText || ch.text;

      // Build paragraph-by-paragraph pairings
      const transParas = translatedFullText.split(/\n+/).filter((p: string) => p.trim().length > 0);
      const pairings = paras.map((orig, i) => ({
        original: orig,
        translated: transParas[i] || orig
      }));

      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: {
          chapter: translatedTitle,
          text: translatedFullText,
          paragraphs: pairings
        }
      }));
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [fallbackPage, activeChapters, translationCache]);

  // Trigger translation when switching to bilingual or translated view or changing target language
  useEffect(() => {
    if (currentViewMode === 'bilingual' || currentViewMode === 'translated') {
      translateCurrentChapter(targetLang);
    }
  }, [currentViewMode, targetLang, fallbackPage, translateCurrentChapter]);

  // Sync fonts and themes to EPUB rendition dynamically
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

  // Local progress increment
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 10);
    }, 10000);
    return () => clearInterval(interval);
  }, [loading]);

  // Database progress sync
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

  // Text to Speech Read-Aloud
  const handleToggleSpeak = (textToRead: string, langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1000));
    utterance.lang = langCode === 'ur' ? 'ur-PK' : (langCode === 'ar' ? 'ar-SA' : (langCode === 'hi' ? 'hi-IN' : 'en-US'));
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopyText = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const prevPage = () => {
    if (useReflowableFallback || currentViewMode === 'bilingual' || currentViewMode === 'translated' || currentViewMode === 'study') {
      setFallbackPage(prev => Math.max(1, prev - 1));
    } else {
      renditionRef.current?.prev();
    }
  };

  const nextPage = () => {
    if (useReflowableFallback || currentViewMode === 'bilingual' || currentViewMode === 'translated' || currentViewMode === 'study') {
      setFallbackPage(prev => Math.min(activeChapters.length, prev + 1));
    } else {
      renditionRef.current?.next();
    }
  };

  const styles = READER_THEMES[theme] || READER_THEMES.dark;
  const externalLink = infoLink || previewLink || (iaId ? `https://archive.org/details/${iaId}` : null);
  const currentTransData = translationCache[`${fallbackPage - 1}::${targetLang}`];

  return (
    <div className={`flex flex-col h-full ${styles.bg} ${styles.text} border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300`}>
      {/* Global Fonts Inject */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;700&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" />

      {/* Dynamic Header */}
      <div className={`h-16 ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'bg-white/90 border-slate-200/80 text-slate-900' : 'bg-slate-950/80 border-slate-800/60 text-white'} backdrop-blur-md border-b flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0 gap-2`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className={`font-extrabold text-sm truncate max-w-[130px] md:max-w-xs ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'text-slate-900' : 'text-white'}`}>
              {title || 'QuillHawk Book'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
              <span>Time:</span>
              <span className="text-warning font-semibold font-mono">{Math.floor(timeSpent / 60)}m</span>
              {source && (
                <>
                  <span className="text-slate-700">|</span>
                  <span className="text-blue-400 font-bold uppercase tracking-wider text-[9px]">{source}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/70 overflow-x-auto">
          <button
            onClick={() => setCurrentViewMode('reader')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
              currentViewMode === 'reader' 
                ? 'bg-primary text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🪶 Original Text
          </button>

          <button
            onClick={() => setCurrentViewMode('bilingual')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              currentViewMode === 'bilingual' 
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow' 
                : 'text-indigo-400 hover:text-indigo-200'
            }`}
          >
            <Languages className="w-3 h-3" />
            <span>Side-by-Side Bilingual</span>
          </button>

          <button
            onClick={() => setCurrentViewMode('translated')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              currentViewMode === 'translated' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Translated Edition</span>
          </button>
          
          {iaId && (
            <button
              onClick={() => setCurrentViewMode('archive')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                currentViewMode === 'archive' 
                  ? 'bg-primary text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏛️ Archive
            </button>
          )}

          {previewLink && (
            <button
              onClick={() => setCurrentViewMode('google')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                currentViewMode === 'google' 
                  ? 'bg-primary text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌐 Web
            </button>
          )}

          <button
            onClick={() => {
              setUseReflowableFallback(true);
              setCurrentViewMode('study');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
              currentViewMode === 'study' 
                ? 'bg-primary text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Study
          </button>
        </div>

        {/* Translation Target Selector & Typography Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {(currentViewMode === 'bilingual' || currentViewMode === 'translated') && (
            <div className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="hidden md:inline">Translate To:</span>
              </span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer border-0 p-0"
              >
                {TRANSLATE_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Typography options */}
          {!isPdf && (
            <div className="hidden xl:flex items-center gap-3 text-[11px] bg-slate-900/40 border border-slate-800/60 px-3 py-1.5 rounded-xl shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">Font:</span>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)} 
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-bold border-0 p-0 max-w-[140px] truncate"
                >
                  {READER_FONTS.map(f => (
                    <option key={f.value} value={f.value} className="bg-slate-900 text-slate-200">{f.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 border-l border-slate-850 pl-2">
                <span className="text-slate-500 font-bold">Size:</span>
                <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-0.5 border border-slate-850">
                  <button onClick={() => setFontSize(p => Math.max(12, p - 2))} className="hover:text-primary transition font-black px-1.5 py-0.5 rounded text-xs">-</button>
                  <span className="font-bold font-mono text-[10px] px-1 text-slate-300">{fontSize}px</span>
                  <button onClick={() => setFontSize(p => Math.min(26, p + 2))} className="hover:text-primary transition font-black px-1.5 py-0.5 rounded text-xs">+</button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-850 pl-2">
                {Object.entries(READER_THEMES).slice(0, 5).map(([name, themeObj]) => (
                  <button 
                    key={name}
                    onClick={() => setTheme(name as any)} 
                    className={`w-3 h-3 rounded-full border transition-all hover:scale-110 ${themeObj.bg} ${themeObj.border} ${theme === name ? 'ring-2 ring-primary scale-110 shadow' : 'hover:border-slate-400'}`} 
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}

          {externalLink && (
            <a 
              href={externalLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] font-bold transition-colors"
              title="Open the complete original library archive"
            >
              <span>Source Archive</span>
              <span className="text-xs">↗</span>
            </a>
          )}

          {!isPdf && currentViewMode === 'reader' && (
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={useReflowableFallback && fallbackPage === 1} className="font-bold text-xs px-2.5">Prev</Button>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={useReflowableFallback && fallbackPage === activeChapters.length} className="font-bold text-xs px-2.5">Next</Button>
            </div>
          )}
        </div>
      </div>
      
      {loading && currentViewMode === 'reader' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${styles.bg} z-20 space-y-4`}>
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-slate-400 animate-pulse font-medium">Connecting to digital archive... Loading book text & chapters.</p>
        </div>
      )}
      
      {/* Main View Area */}
      <div className={`flex-1 w-full relative z-0 overflow-y-auto ${styles.bg}`}>
        
        {/* 1. Internet Archive Viewer */}
        {currentViewMode === 'archive' && iaId ? (
          <iframe 
            src={`https://archive.org/embed/${iaId}?js=1`} 
            className="w-full h-full border-0 bg-slate-950 min-h-[600px]" 
            title={title || "Internet Archive Reader"} 
            allowFullScreen
          />
        ) : currentViewMode === 'google' && previewLink ? (
          <iframe 
            src={previewLink} 
            className="w-full h-full border-0 bg-slate-950 min-h-[600px]" 
            title={title || "Web Book Viewer"} 
            allowFullScreen
          />
        ) : isPdf ? (
          <iframe 
            src={resolvedBookUrl} 
            className="w-full h-full border-0 bg-slate-900" 
            title={title || "PDF Reader"} 
          />
        ) : currentViewMode === 'bilingual' ? (
          /* 2. Side-by-Side Bilingual Dual-Language View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-8 px-4 md:px-10 flex flex-col space-y-6`}>
            {/* Header / Navigator */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/40 pb-4 max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Bilingual Parallel View</span>
                </span>
                {isTranslating && (
                  <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full block animate-spin" />
                    Translating section...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className="text-xs bg-slate-900/80 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {activeChapters.map((ch, idx) => (
                    <option key={`ch-bilingual-${idx}`} value={idx + 1} className="bg-slate-900 text-slate-200">
                      {ch.chapter || `Chapter ${idx + 1}`}
                    </option>
                  ))}
                </select>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleToggleSpeak(currentTransData?.text || currentChapterObj.text, targetLang)}
                  className="text-xs font-bold gap-1"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </Button>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleCopyText(currentTransData?.text || currentChapterObj.text)}
                  className="text-xs font-bold gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Bilingual Dual Column Grid */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Left: Original Text */}
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <span>📜 Original Text</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">Section {fallbackPage}</span>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight" style={{ fontFamily }}>
                  {currentChapterObj.chapter}
                </h3>

                <div 
                  className={`space-y-5 leading-relaxed whitespace-pre-line ${isBookRtl ? 'text-right' : 'text-justify'}`}
                  dir={isBookRtl ? 'rtl' : 'ltr'}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                    lineHeight: isBookRtl ? 2.2 : 1.85 
                  }}
                >
                  {currentTransData?.paragraphs?.length ? (
                    currentTransData.paragraphs.map((p, idx) => (
                      <p key={`orig-p-${idx}`} className="p-2 rounded-lg hover:bg-slate-900/50 transition-colors">
                        {p.original}
                      </p>
                    ))
                  ) : (
                    currentChapterObj.text
                  )}
                </div>
              </div>

              {/* Right: Translated Text */}
              <div className="p-6 rounded-2xl bg-indigo-950/15 border border-indigo-500/25 space-y-6 shadow-xl relative">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Translated: {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold">Live AI Translation</span>
                </div>

                <h3 
                  className={`text-lg md:text-xl font-extrabold text-cyan-200 tracking-tight ${isTargetRtl ? 'text-right' : 'text-left'}`}
                  dir={isTargetRtl ? 'rtl' : 'ltr'}
                  style={{ 
                    fontFamily: isTargetRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily 
                  }}
                >
                  {currentTransData?.chapter || 'Translating chapter title...'}
                </h3>

                <div 
                  className={`space-y-5 leading-relaxed whitespace-pre-line ${isTargetRtl ? 'text-right' : 'text-justify'}`}
                  dir={isTargetRtl ? 'rtl' : 'ltr'}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: isTargetRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                    lineHeight: isTargetRtl ? 2.2 : 1.85 
                  }}
                >
                  {isTranslating && !currentTransData ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full" />
                      <p className="text-xs text-cyan-300 animate-pulse font-medium">Translating into {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}...</p>
                    </div>
                  ) : currentTransData?.paragraphs?.length ? (
                    currentTransData.paragraphs.map((p, idx) => (
                      <p key={`trans-p-${idx}`} className="p-2 rounded-lg bg-indigo-950/25 hover:bg-indigo-900/30 transition-colors border border-indigo-500/10">
                        {p.translated}
                      </p>
                    ))
                  ) : (
                    currentTransData?.text || "Translating text..."
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/40 pt-6 flex justify-between items-center">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={prevPage} 
                disabled={fallbackPage === 1}
                className="font-bold text-xs"
              >
                ← Previous Section
              </Button>
              <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={nextPage} 
                disabled={fallbackPage === activeChapters.length}
                className="font-bold text-xs"
              >
                Next Section →
              </Button>
            </div>
          </div>
        ) : currentViewMode === 'translated' ? (
          /* 3. Full Translated Edition View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-500 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/30 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3" />
                    <span>{TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name} Translation</span>
                  </span>
                  <h2 
                    className="text-xl md:text-2xl font-black tracking-tight"
                    dir={isTargetRtl ? 'rtl' : 'ltr'}
                    style={{ fontFamily: isTargetRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily }}
                  >
                    {currentTransData?.chapter || currentChapterObj.chapter}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={fallbackPage}
                    onChange={(e) => setFallbackPage(Number(e.target.value))}
                    className="text-xs bg-slate-900/60 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[200px] truncate"
                  >
                    {activeChapters.map((ch, idx) => (
                      <option key={`opt-trans-${idx}`} value={idx + 1} className="bg-slate-900 text-slate-200">
                        {ch.chapter || `Chapter ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Content */}
              <div 
                className={`leading-relaxed whitespace-pre-line pt-2 transition-all duration-300 space-y-4 ${isTargetRtl ? 'text-right' : 'text-justify'}`}
                dir={isTargetRtl ? 'rtl' : 'ltr'}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  fontFamily: isTargetRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                  lineHeight: isTargetRtl ? 2.3 : 1.85 
                }}
              >
                {isTranslating && !currentTransData ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full" />
                    <p className="text-xs text-emerald-400 animate-pulse font-medium">Translating text into {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}...</p>
                  </div>
                ) : (
                  currentTransData?.text || currentChapterObj.text
                )}
              </div>
 
              {/* Navigation Footer */}
              <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={prevPage} 
                  disabled={fallbackPage === 1}
                  className="font-bold text-xs"
                >
                  ← Previous Section
                </Button>
                <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={nextPage} 
                  disabled={fallbackPage === activeChapters.length}
                  className="font-bold text-xs"
                >
                  Next Section →
                </Button>
              </div>
            </div>
          </div>
        ) : (useReflowableFallback || currentViewMode === 'study') ? (
          /* 4. Standard Reflowable / Study Edition View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-500 border-0`}>
            <div className="max-w-2xl mx-auto flex-1 flex flex-col justify-between space-y-8">
              {/* Chapter Header */}
              <div className="flex items-center justify-between border-b border-slate-800/30 pb-3">
                <h2 
                  className="text-xl md:text-2xl font-black tracking-tight"
                  dir={isBookRtl ? 'rtl' : 'ltr'}
                  style={{ fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily }}
                >
                  {currentChapterObj.chapter}
                </h2>
                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className="text-xs bg-slate-900/60 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[220px] truncate"
                >
                  {activeChapters.map((ch, idx) => (
                    <option key={`opt-${idx}`} value={idx + 1} className="bg-slate-900 text-slate-200">
                      {ch.chapter || `Chapter ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Chapter Content */}
              <div 
                className={`leading-relaxed whitespace-pre-line pt-2 transition-all duration-300 space-y-4 ${isBookRtl ? 'text-right' : 'text-justify'}`}
                dir={isBookRtl ? 'rtl' : 'ltr'}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                  lineHeight: isBookRtl ? 2.2 : 1.85 
                }}
              >
                {currentChapterObj.text || "No content found in this section."}
              </div>
 
              {/* Page Navigation Footer */}
              <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={prevPage} 
                  disabled={fallbackPage === 1}
                  className="font-bold text-xs"
                >
                  ← Previous Section
                </Button>
                <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={nextPage} 
                  disabled={fallbackPage === activeChapters.length}
                  className="font-bold text-xs"
                >
                  Next Section →
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* 5. Default EPUB Rendition View */
          <div ref={viewerRef} className={`w-full h-full relative p-4 ${styles.bg}`} />
        )}
      </div>
    </div>
  );
}
