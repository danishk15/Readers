'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ePub, { Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, Globe, Languages, Volume2, VolumeX, Sparkles, Copy, Check, 
  ArrowRight, ArrowLeft, Search, List, AlignJustify, BookMarked, 
  Settings2, Eye, Compass, ChevronDown, ChevronRight, X, Play, Pause,
  Share2, Maximize2, Minimize2
} from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';
import { getAuthenticBookChapters, AuthenticBookChapter } from '@/utils/authenticBookContent';

interface LocationStart {
  index: number;
}
interface EpubLocation {
  start: LocationStart;
}

const READER_THEMES: Record<string, { bg: string, text: string, cardBg: string, border: string, rawBg: string, rawText: string, accent: string }> = {
  dark: { bg: 'bg-[#060B18]', text: 'text-[#E2E8F0]', cardBg: 'bg-slate-900/60', border: 'border-slate-800/80', rawBg: '#060B18', rawText: '#E2E8F0', accent: '#5B6CFF' },
  ink: { bg: 'bg-[#050814]', text: 'text-[#F8FAFC]', cardBg: 'bg-[#0b1026]/70', border: 'border-slate-700/80', rawBg: '#050814', rawText: '#F8FAFC', accent: '#38BDF8' },
  midnight: { bg: 'bg-[#0B132B]', text: 'text-[#F1F5F9]', cardBg: 'bg-[#1C2541]/70', border: 'border-slate-700', rawBg: '#0B132B', rawText: '#F1F5F9', accent: '#60A5FA' },
  sepia: { bg: 'bg-[#f7f2e8]', text: 'text-[#433422]', cardBg: 'bg-[#ede5d5]/80', border: 'border-[#ebdcc5]', rawBg: '#f7f2e8', rawText: '#433422', accent: '#8C5E32' },
  light: { bg: 'bg-[#ffffff]', text: 'text-[#0f172a]', cardBg: 'bg-slate-50', border: 'border-slate-200', rawBg: '#ffffff', rawText: '#0f172a', accent: '#2563EB' },
  emerald: { bg: 'bg-[#051b11]', text: 'text-[#d2e7d6]', cardBg: 'bg-[#0a2e1e]/60', border: 'border-emerald-950', rawBg: '#051b11', rawText: '#d2e7d6', accent: '#34D399' },
  amethyst: { bg: 'bg-[#1a0f2e]', text: 'text-[#f3e8ff]', cardBg: 'bg-[#2a1b47]/60', border: 'border-purple-950', rawBg: '#1a0f2e', rawText: '#f3e8ff', accent: '#C084FC' },
  sand: { bg: 'bg-[#f4efe6]', text: 'text-[#2b261f]', cardBg: 'bg-[#e8dfcf]/70', border: 'border-amber-900/10', rawBg: '#f4efe6', rawText: '#2b261f', accent: '#D97706' },
  nordic: { bg: 'bg-[#eef2f7]', text: 'text-[#1e293b]', cardBg: 'bg-white/80', border: 'border-slate-300', rawBg: '#eef2f7', rawText: '#1e293b', accent: '#0284C7' }
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
  readMode = 'epub',
  customChapters
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
  customChapters?: AuthenticBookChapter[];
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPdf, setIsPdf] = useState(false);
  const [resolvedBookUrl, setResolvedBookUrl] = useState(bookUrl);
  
  // View Modes: 'reader' (Reflowable Full Text), 'bilingual' (Dual Column), 'translated' (Single Translated), 'epub' (Raw EPUB), 'archive' (IA Embed)
  const [currentViewMode, setCurrentViewMode] = useState<'reader' | 'bilingual' | 'translated' | 'epub' | 'archive'>(() => {
    if (iaId && (!bookUrl || readMode === 'archive')) return 'archive';
    return 'reader';
  });

  // Reading Modes: 'paginated' (One chapter at a time) or 'continuous' (All chapters flowing)
  const [scrollMode, setScrollMode] = useState<'paginated' | 'continuous'>('paginated');

  // Table of Contents Drawer & Search States
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Translation States
  const [targetLang, setTargetLang] = useState<string>('ur');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, { chapter: string; text: string; paragraphs: { original: string; translated: string }[] }>>({});
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  // Reflowable / Typography states
  const [fontSize, setFontSize] = useState(17);
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [theme, setTheme] = useState<keyof typeof READER_THEMES>('dark');
  
  // Persistent Chapter Page
  const [fallbackPage, setFallbackPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`quillhawk-progress-${bookId}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1) return parsed;
      }
    }
    return 1;
  });

  const [extractedChapters, setExtractedChapters] = useState<AuthenticBookChapter[]>([]);
  const [apiFetchedChapters, setApiFetchedChapters] = useState<AuthenticBookChapter[]>([]);

  // Detect if book or target language is RTL (Urdu, Arabic, Persian, Hebrew)
  const isBookRtl = Boolean(
    title?.match(/[\u0600-\u06FF\u0750-\u077F]/) || 
    description?.match(/[\u0600-\u06FF\u0750-\u077F]/) ||
    author?.match(/[\u0600-\u06FF\u0750-\u077F]/)
  );
  const isTargetRtl = TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.isRtl ?? false;

  // Auto-set Nastaliq font if book title/description is Urdu/Arabic
  useEffect(() => {
    if (isBookRtl && fontFamily.includes('Georgia')) {
      setFontFamily("'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif");
    }
  }, [isBookRtl, fontFamily]);

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

  // Fetch full content from /api/books/content
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicContent() {
      if (customChapters && customChapters.length > 0) {
        setLoading(false);
        return;
      }
      try {
        const query = new URLSearchParams({
          id: bookId || '',
          title: title || '',
          author: author || '',
          file_url: resolvedBookUrl || bookUrl || '',
          iaId: iaId || '',
          description: description || ''
        });
        const res = await fetch(`/api/books/content?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.chapters) && data.chapters.length > 0 && isMounted) {
            setApiFetchedChapters(data.chapters);
          }
        }
      } catch (err) {
        console.warn('API content fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDynamicContent();
    return () => { isMounted = false; };
  }, [bookId, title, author, resolvedBookUrl, bookUrl, iaId, description, customChapters]);

  // Save Reading Progress
  useEffect(() => {
    if (typeof window !== 'undefined' && bookId) {
      localStorage.setItem(`quillhawk-progress-${bookId}`, String(fallbackPage));
    }
  }, [bookId, fallbackPage]);

  // Reset reader states on book change
  useEffect(() => {
    setExtractedChapters([]);
    setApiFetchedChapters([]);
    if (iaId && (!bookUrl || readMode === 'archive')) {
      setCurrentViewMode('archive');
    } else {
      setCurrentViewMode('reader');
    }
    setTranslationCache({});
  }, [bookId, bookUrl, iaId, readMode]);

  // Unified chapters array
  const chapters: AuthenticBookChapter[] = useMemo(() => {
    if (customChapters && customChapters.length > 0) return customChapters;
    if (apiFetchedChapters && apiFetchedChapters.length > 0) return apiFetchedChapters;
    return getAuthenticBookChapters(bookId, title, author, description);
  }, [bookId, title, author, description, customChapters, apiFetchedChapters]);

  const activeChapters = extractedChapters.length > 0 ? extractedChapters : chapters;
  const currentChapterObj = activeChapters[Math.min(fallbackPage - 1, activeChapters.length - 1)] || activeChapters[0] || { chapter: 'Chapter 1', text: '' };

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
    } else {
      setIsPdf(false);
    }
  }, [resolvedBookUrl, title]);

  // EPUB.js background loader & spine extractor
  useEffect(() => {
    if (!resolvedBookUrl || isPdf || currentViewMode !== 'epub') return;
    if (!viewerRef.current) return;

    let book: any = null;
    let isDestroyed = false;

    const loadEpub = async () => {
      try {
        const isExternal = resolvedBookUrl && 
          (resolvedBookUrl.startsWith('http://') || resolvedBookUrl.startsWith('https://')) && 
          (typeof window !== 'undefined' && !resolvedBookUrl.startsWith(window.location.origin));
          
        const resolvedUrl = isExternal 
          ? `/api/books/proxy?url=${encodeURIComponent(resolvedBookUrl)}` 
          : resolvedBookUrl;

        const response = await fetch(resolvedUrl);
        if (!response.ok) throw new Error('EPUB fetch failed');
        const buffer = await response.arrayBuffer();
        if (isDestroyed || !viewerRef.current) return;

        book = ePub(buffer);

        book.opened.then(async () => {
          if (isDestroyed) return;
          try {
            const spine = await book.loaded.spine;
            const tempChapters: AuthenticBookChapter[] = [];
            const maxItems = Math.min(spine.spineItems.length, 120);

            for (let i = 0; i < maxItems; i++) {
              if (isDestroyed) return;
              const item = spine.spineItems[i];
              try {
                const doc = await item.load(book.load.bind(book));
                if (!doc) continue;
                const text = (doc.body?.textContent || doc.textContent || '').replace(/\s+/g, ' ').trim();
                if (text.length < 30) continue;

                let chapterTitle = '';
                const heading = doc.querySelector('h1, h2, h3, h4, [class*="title"], [class*="chapter"]');
                if (heading) chapterTitle = heading.textContent?.trim() || '';
                if (!chapterTitle) chapterTitle = `Chapter ${tempChapters.length + 1}`;

                tempChapters.push({ chapter: chapterTitle, text });
              } catch {}
            }

            if (tempChapters.length > 0 && !isDestroyed) {
              setExtractedChapters(tempChapters);
            }
          } catch {}
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
        
        const activeTheme = READER_THEMES[theme] || READER_THEMES.dark;
        rendition.themes.default({
          body: { 
            background: activeTheme.rawBg, 
            color: activeTheme.rawText, 
            'font-family': fontFamily,
            'font-size': `${fontSize}px`,
            'line-height': '1.8'
          }
        });

        rendition.on('relocated', (location: EpubLocation) => {
          setCurrentPage(location.start.index);
        });

      } catch (err) {
        console.warn('EPUB display failed, reflowable view active:', err);
      }
    };

    loadEpub();

    return () => {
      isDestroyed = true;
      if (book) {
        try { book.destroy(); } catch {}
      }
    };
  }, [resolvedBookUrl, isPdf, currentViewMode, theme, fontFamily, fontSize]);

  // Real-time Translation Fetcher
  const translateCurrentChapter = useCallback(async (target: string) => {
    const chapterIdx = fallbackPage - 1;
    const ch = activeChapters[chapterIdx] || activeChapters[0];
    if (!ch || !ch.text) return;

    const cacheKey = `${chapterIdx}::${target}`;
    if (translationCache[cacheKey]) return;

    setIsTranslating(true);
    try {
      const paras = ch.text.split(/\n+/).filter(p => p.trim().length > 0);
      
      const translatedTitleRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.chapter, targetLang: target })
      });
      const titleData = await translatedTitleRes.json();
      const translatedTitle = titleData.translatedText || ch.chapter;

      const fullTextRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.text, targetLang: target })
      });
      const fullData = await fullTextRes.json();
      const translatedFullText = fullData.translatedText || ch.text;

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

  useEffect(() => {
    if (currentViewMode === 'bilingual' || currentViewMode === 'translated') {
      translateCurrentChapter(targetLang);
    }
  }, [currentViewMode, targetLang, fallbackPage, translateCurrentChapter]);

  // Reading Timer & DB sync
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 10);
    }, 10000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (timeSpent > 0 && timeSpent % 30 === 0) {
      const syncProgress = async () => {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
        if (isUuid && userId) {
          try {
            const supabase = createClient();
            await supabase.from('reading_logs').insert({
              user_id: userId,
              book_id: bookId,
              time_spent_seconds: 30, 
              pages_read: fallbackPage,
            });
          } catch (e) {
            console.error('Error saving reading log:', e);
          }
        }
      };
      syncProgress();
    }
  }, [timeSpent, bookId, userId, fallbackPage]);

  // Text-to-Speech (TTS)
  const handleToggleSpeak = (textToRead: string, langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 3000));
    utterance.lang = langCode === 'ur' ? 'ur-PK' : (langCode === 'ar' ? 'ar-SA' : (langCode === 'hi' ? 'hi-IN' : 'en-US'));
    utterance.rate = speechRate;
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
    if (currentViewMode === 'epub') {
      renditionRef.current?.prev();
    } else {
      setFallbackPage(prev => Math.max(1, prev - 1));
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentViewMode === 'epub') {
      renditionRef.current?.next();
    } else {
      setFallbackPage(prev => Math.min(activeChapters.length, prev + 1));
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: { chapterIdx: number; chapterTitle: string; snippet: string }[] = [];

    activeChapters.forEach((ch, idx) => {
      const lower = ch.text.toLowerCase();
      let pos = lower.indexOf(q);
      let count = 0;
      while (pos !== -1 && count < 3) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(ch.text.length, pos + q.length + 40);
        matches.push({
          chapterIdx: idx + 1,
          chapterTitle: ch.chapter,
          snippet: (start > 0 ? '...' : '') + ch.text.substring(start, end) + (end < ch.text.length ? '...' : '')
        });
        pos = lower.indexOf(q, pos + q.length + 1);
        count++;
      }
    });
    return matches;
  }, [searchQuery, activeChapters]);

  const styles = READER_THEMES[theme] || READER_THEMES.dark;
  const currentTransData = translationCache[`${fallbackPage - 1}::${targetLang}`];
  const totalWords = useMemo(() => activeChapters.reduce((acc, c) => acc + (c.text?.split(/\s+/).length || 0), 0), [activeChapters]);
  const estimatedReadTimeMins = Math.max(1, Math.round(totalWords / 200));

  return (
    <div className={`flex flex-col h-full ${styles.bg} ${styles.text} border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300`}>
      {/* Global Fonts Inject */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Inter:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;700&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" />

      {/* Main Top Header Bar */}
      <div className={`h-16 ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'bg-white/95 border-slate-200/80 text-slate-900' : 'bg-slate-950/90 border-slate-800/60 text-white'} backdrop-blur-md border-b flex items-center justify-between px-3 md:px-6 z-20 flex-shrink-0 gap-2`}>
        
        {/* Left: Book Meta & Table of Contents Button */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Button 
            onClick={() => setIsTocOpen(!isTocOpen)} 
            variant="secondary" 
            size="sm" 
            className="px-2.5 py-1.5 text-xs font-bold gap-1.5 flex items-center shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            title="Table of Contents & Chapters"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chapters ({activeChapters.length})</span>
          </Button>

          <div className="min-w-0">
            <div className={`font-extrabold text-xs md:text-sm truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs ${theme === 'light' || theme === 'sand' || theme === 'nordic' ? 'text-slate-900' : 'text-white'}`}>
              {title || 'QuillHawk Book'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
              <span>Time:</span>
              <span className="text-warning font-semibold font-mono">{Math.floor(timeSpent / 60)}m</span>
              <span className="text-slate-600">|</span>
              <span>{estimatedReadTimeMins}m read</span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switching Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/70">
          <button
            onClick={() => setCurrentViewMode('reader')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              currentViewMode === 'reader' 
                ? 'bg-primary text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Full Book Text
          </button>

          <button
            onClick={() => setCurrentViewMode('bilingual')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
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
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              currentViewMode === 'translated' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Translated</span>
          </button>

          {resolvedBookUrl && !isPdf && (
            <button
              onClick={() => setCurrentViewMode('epub')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                currentViewMode === 'epub' 
                  ? 'bg-primary text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📄 Original EPUB
            </button>
          )}

          {iaId && (
            <button
              onClick={() => setCurrentViewMode('archive')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                currentViewMode === 'archive' 
                  ? 'bg-primary text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏛️ Archive
            </button>
          )}
        </div>

        {/* Right: Controls (Search, Typography, Audio, Pagination) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          
          {/* Translation selector */}
          {(currentViewMode === 'bilingual' || currentViewMode === 'translated') && (
            <div className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-500/30 px-2 py-1 rounded-xl">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
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

          {/* Search button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-xl border transition ${isSearchOpen ? 'bg-primary text-white border-primary' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
            title="Search inside book"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Continuous vs Paginated Toggle */}
          {currentViewMode === 'reader' && (
            <button
              onClick={() => setScrollMode(scrollMode === 'paginated' ? 'continuous' : 'paginated')}
              className={`p-1.5 rounded-xl border text-[10px] font-bold hidden sm:flex items-center gap-1 ${scrollMode === 'continuous' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
              title={scrollMode === 'paginated' ? 'Switch to Continuous Scroll' : 'Switch to Paginated'}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>{scrollMode === 'paginated' ? 'Paginated' : 'Continuous'}</span>
            </button>
          )}

          {/* Audio TTS */}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleToggleSpeak(currentTransData?.text || currentChapterObj.text, isTargetRtl ? targetLang : (isBookRtl ? 'ur' : 'en'))}
            className="text-xs font-bold px-2.5 py-1 gap-1"
            title="Listen to chapter"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden md:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </Button>

          {/* Font & Theme Selector */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] bg-slate-900/40 border border-slate-800/60 px-2.5 py-1 rounded-xl shadow-inner">
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)} 
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-bold border-0 p-0 max-w-[120px] truncate"
            >
              {READER_FONTS.map(f => (
                <option key={f.value} value={f.value} className="bg-slate-900 text-slate-200">{f.label}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              <button onClick={() => setFontSize(p => Math.max(12, p - 2))} className="hover:text-primary font-black px-1 text-xs">-</button>
              <span className="font-bold font-mono text-[10px] text-slate-300">{fontSize}px</span>
              <button onClick={() => setFontSize(p => Math.min(32, p + 2))} className="hover:text-primary font-black px-1 text-xs">+</button>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              {Object.entries(READER_THEMES).slice(0, 5).map(([name, themeObj]) => (
                <button 
                  key={name}
                  onClick={() => setTheme(name as any)} 
                  className={`w-3 h-3 rounded-full border transition-all ${themeObj.bg} ${themeObj.border} ${theme === name ? 'ring-2 ring-primary scale-110' : 'hover:border-slate-400'}`} 
                  title={name}
                />
              ))}
            </div>
          </div>

          {/* Previous / Next buttons */}
          {(currentViewMode === 'reader' || currentViewMode === 'bilingual' || currentViewMode === 'translated') && (
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className="font-bold text-xs px-2">←</Button>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className="font-bold text-xs px-2">→</Button>
            </div>
          )}

          {/* Fullscreen button */}
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Slide-out In-Book Search Bar */}
      {isSearchOpen && (
        <div className="bg-slate-950/95 border-b border-slate-800 p-4 z-20 space-y-3 animate-in slide-in-from-top-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words, names, or quotes across entire book..."
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {searchQuery && (
            <div className="max-w-2xl mx-auto max-h-48 overflow-y-auto space-y-2 pr-2">
              <p className="text-[11px] text-slate-400 font-mono">Found {searchResults.length} matches across chapters:</p>
              {searchResults.map((res, i) => (
                <div 
                  key={`res-${i}`}
                  onClick={() => {
                    setFallbackPage(res.chapterIdx);
                    setIsSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-primary/50 cursor-pointer transition text-left"
                >
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">{res.chapterTitle}</span>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{res.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide-out Table of Contents (TOC) Drawer */}
      {isTocOpen && (
        <div className="absolute inset-y-16 left-0 w-80 md:w-96 bg-slate-950/95 border-r border-slate-800 z-30 flex flex-col p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-left duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <List className="w-4 h-4 text-primary" />
                <span>Table of Contents</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">{activeChapters.length} Chapters | ~{estimatedReadTimeMins}m read</p>
            </div>
            <button onClick={() => setIsTocOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-1.5 pr-1">
            {activeChapters.map((ch, idx) => {
              const isSelected = fallbackPage === idx + 1;
              const wordCount = ch.text ? ch.text.split(/\s+/).length : 0;
              return (
                <button
                  key={`toc-ch-${idx}`}
                  onClick={() => {
                    setFallbackPage(idx + 1);
                    setIsTocOpen(false);
                    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-primary/20 text-white border border-primary/40 font-bold shadow' 
                      : 'hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-500 font-mono block">Section {idx + 1}</span>
                    <p className="text-xs truncate font-medium text-slate-200">{ch.chapter}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">~{Math.max(1, Math.round(wordCount / 200))}m</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Reading View Area */}
      <div 
        ref={containerRef}
        className={`flex-1 w-full relative z-0 overflow-y-auto ${styles.bg}`}
      >
        {loading && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${styles.bg} z-20 space-y-4`}>
            <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
            <p className="text-xs text-slate-400 animate-pulse font-medium">Opening authentic multi-chapter edition...</p>
          </div>
        )}

        {/* 1. Internet Archive Viewer */}
        {currentViewMode === 'archive' && iaId ? (
          <iframe 
            src={`https://archive.org/embed/${iaId}?js=1`} 
            className="w-full h-full border-0 bg-slate-950 min-h-[600px]" 
            title={title || "Internet Archive Reader"} 
            allowFullScreen
          />
        ) : isPdf ? (
          <iframe 
            src={resolvedBookUrl} 
            className="w-full h-full border-0 bg-slate-900" 
            title={title || "PDF Reader"} 
          />
        ) : currentViewMode === 'bilingual' ? (
          /* 2. Side-by-Side Bilingual Dual-Language Parallel Reading */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-8 px-4 md:px-10 flex flex-col space-y-6`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/40 pb-4 max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Parallel Dual-Language View</span>
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
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className="font-bold text-xs">
                ← Previous Section
              </Button>
              <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className="font-bold text-xs">
                Next Section →
              </Button>
            </div>
          </div>
        ) : currentViewMode === 'translated' ? (
          /* 3. Full Translated Single Language Edition */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-500 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
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
                    <p className="text-xs text-emerald-400 animate-pulse font-medium">Translating into {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}...</p>
                  </div>
                ) : (
                  currentTransData?.text || currentChapterObj.text
                )}
              </div>

              <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className="font-bold text-xs">
                  ← Previous Section
                </Button>
                <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className="font-bold text-xs">
                  Next Section →
                </Button>
              </div>
            </div>
          </div>
        ) : currentViewMode === 'epub' ? (
          /* 4. Original EPUB View */
          <div ref={viewerRef} className={`w-full h-full relative p-4 ${styles.bg}`} />
        ) : (
          /* 5. Default Reflowable Full Book View (Paginated & Continuous Scroll Modes) */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-10 px-4 md:px-12 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              
              {scrollMode === 'continuous' ? (
                /* Continuous Scroll View (All Chapters Sequentially) */
                <div className="space-y-16">
                  {activeChapters.map((ch, idx) => (
                    <div key={`cont-ch-${idx}`} className="space-y-6 border-b border-slate-800/40 pb-12">
                      <div className="flex items-center justify-between border-b border-slate-800/20 pb-3">
                        <span className="text-[10px] text-primary font-black uppercase tracking-widest font-mono">Chapter {idx + 1}</span>
                        <span className="text-[10px] text-slate-500 font-mono">~{Math.max(1, Math.round((ch.text?.split(/\s+/).length || 0) / 200))} min</span>
                      </div>

                      <h2 
                        className="text-2xl md:text-3xl font-black tracking-tight text-white"
                        dir={isBookRtl ? 'rtl' : 'ltr'}
                        style={{ fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily }}
                      >
                        {ch.chapter}
                      </h2>

                      <div 
                        className={`leading-relaxed whitespace-pre-line pt-2 space-y-4 ${isBookRtl ? 'text-right' : 'text-justify'}`}
                        dir={isBookRtl ? 'rtl' : 'ltr'}
                        style={{ 
                          fontSize: `${fontSize}px`, 
                          fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                          lineHeight: isBookRtl ? 2.2 : 1.85 
                        }}
                      >
                        {ch.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Paginated View (Single Chapter Focused) */
                <>
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

                  <div className="text-center text-xs text-slate-500 font-semibold font-mono border-t border-slate-800/30 pt-4 flex justify-between items-center">
                    <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className="font-bold text-xs">
                      ← Previous Section
                    </Button>
                    <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                    <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className="font-bold text-xs">
                      Next Section →
                    </Button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
