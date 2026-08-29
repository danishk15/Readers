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
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { stripHtml } from '@/utils/textSanitizer';

interface LocationStart {
  index: number;
}
interface EpubLocation {
  start: LocationStart;
}

// 1. Warm Parchment Light Reader Theme (Maximum Contrast & Clean Aesthetics)
const WARM_PARCHMENT_THEME = {
  bg: 'bg-[#F8F6F0]',
  headerBg: 'bg-[#EFECE6]/95',
  cardBg: 'bg-[#FFFFFF]',
  cardBorder: 'border-[#E4E0D8]',
  paperBg: 'bg-[#FFFFFF]',
  text: 'text-[#18181B]',
  headingText: 'text-[#09090B]',
  mutedText: 'text-[#52525B]',
  accentText: 'text-[#2563EB]',
  buttonBg: 'bg-[#E8E4DC]',
  buttonHover: 'hover:bg-[#DCD6CA]',
  buttonText: 'text-[#18181B]',
  buttonBorder: 'border-[#D4CEBF]',
  inputBg: 'bg-[#FFFFFF]',
  border: 'border-[#E4E0D8]',
  divider: 'border-[#E4E0D8]',
  rawBg: '#F8F6F0',
  rawText: '#18181B',
  rawPaperBg: '#FFFFFF'
};

// 2. Midnight Obsidian Dark Reader Theme (Zero-Fatigue OLED Deep Ink Contrast)
const MIDNIGHT_INK_THEME = {
  bg: 'bg-[#0B1120]',
  headerBg: 'bg-[#0B1120]/95',
  cardBg: 'bg-[#131C31]',
  cardBorder: 'border-[#1E293B]',
  paperBg: 'bg-[#0F172A]',
  text: 'text-[#F8FAFC]',
  headingText: 'text-white',
  mutedText: 'text-[#94A3B8]',
  accentText: 'text-[#60A5FA]',
  buttonBg: 'bg-[#1E293B]',
  buttonHover: 'hover:bg-[#334155]',
  buttonText: 'text-[#F1F5F9]',
  buttonBorder: 'border-[#334155]',
  inputBg: 'bg-[#0F172A]',
  border: 'border-[#1E293B]',
  divider: 'border-[#1E293B]',
  rawBg: '#0B1120',
  rawText: '#F8FAFC',
  rawPaperBg: '#0F172A'
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

  const resolvedGoogleId = useMemo(() => {
    if (bookId && !bookId.startsWith('gutendex-') && !bookId.startsWith('ia-') && !bookId.startsWith('classic-') && !bookId.startsWith('ol-')) {
      return bookId.replace('google-', '');
    }
    if (previewLink && previewLink.includes('id=')) {
      const match = previewLink.match(/id=([^&]+)/);
      if (match) return match[1];
    }
    if (source === 'Google Books' && bookId) {
      return bookId.replace('google-', '');
    }
    return null;
  }, [bookId, previewLink, source]);
  
  // View Modes: 'reader' (Reflowable Full Text), 'bilingual' (Dual Column), 'translated' (Single Translated), 'epub' (Raw EPUB), 'archive' (IA Embed), 'google' (Google Books Viewer)
  const [currentViewMode, setCurrentViewMode] = useState<'reader' | 'bilingual' | 'translated' | 'epub' | 'archive' | 'google'>(() => {
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
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  
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
    let raw: AuthenticBookChapter[] = [];
    if (customChapters && customChapters.length > 0) {
      raw = customChapters;
    } else if (apiFetchedChapters && apiFetchedChapters.length > 0) {
      raw = apiFetchedChapters;
    } else {
      raw = getAuthenticBookChapters(bookId, title, author, description);
    }
    return raw.map(ch => ({
      chapter: stripHtml(ch.chapter),
      text: stripHtml(ch.text)
    }));
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

  // Active theme resolution
  const { resolvedTheme } = useTheme();
  const styles = resolvedTheme === 'dark' ? MIDNIGHT_INK_THEME : WARM_PARCHMENT_THEME;

  // Background EPUB Spine Extractor (extracts all authentic chapters for Reflowable/Bilingual/Translated modes)
  useEffect(() => {
    if (!resolvedBookUrl || isPdf) return;

    let book: any = null;
    let isDestroyed = false;

    const extractEpubChapters = async () => {
      try {
        const isExternal = resolvedBookUrl && 
          (resolvedBookUrl.startsWith('http://') || resolvedBookUrl.startsWith('https://')) && 
          (typeof window !== 'undefined' && !resolvedBookUrl.startsWith(window.location.origin));
          
        const resolvedUrl = isExternal 
          ? `/api/books/proxy?url=${encodeURIComponent(resolvedBookUrl)}` 
          : resolvedBookUrl;

        const response = await fetch(resolvedUrl);
        if (!response.ok) return;
        const buffer = await response.arrayBuffer();
        if (isDestroyed) return;

        book = ePub(buffer);

        book.opened.then(async () => {
          if (isDestroyed) return;
          try {
            const spine = await book.loaded.spine;
            if (!spine || !spine.spineItems) return;
            const tempChapters: AuthenticBookChapter[] = [];
            const maxItems = Math.min(spine.spineItems.length, 150);

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
      } catch (err) {
        console.warn('EPUB chapter extraction skipped:', err);
      }
    };

    extractEpubChapters();

    return () => {
      isDestroyed = true;
      if (book && currentViewMode !== 'epub') {
        try { book.destroy(); } catch {}
      }
    };
  }, [resolvedBookUrl, isPdf, currentViewMode]);

  // EPUB.js Rendition Loader for Raw EPUB View
  useEffect(() => {
    if (!resolvedBookUrl || isPdf || currentViewMode !== 'epub') return;
    if (!viewerRef.current) return;

    let book: any = null;
    let isDestroyed = false;

    const loadEpubRendition = async () => {
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

        const rendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          manager: 'continuous',
          flow: 'paginated',
        });

        renditionRef.current = rendition;
        await rendition.display();
        
        rendition.themes.default({
          body: { 
            background: styles.rawBg, 
            color: styles.rawText, 
            'font-family': fontFamily,
            'font-size': `${fontSize}px`,
            'line-height': isBookRtl ? '2.4' : '1.85'
          }
        });

        rendition.on('relocated', (location: EpubLocation) => {
          setCurrentPage(location.start.index);
        });

      } catch (err) {
        console.warn('EPUB display failed, reflowable view active:', err);
      }
    };

    loadEpubRendition();

    return () => {
      isDestroyed = true;
      if (book) {
        try { book.destroy(); } catch {}
      }
    };
  }, [resolvedBookUrl, isPdf, currentViewMode, fontFamily, fontSize, styles, isBookRtl]);

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

  const currentTransData = translationCache[`${fallbackPage - 1}::${targetLang}`];
  const totalWords = useMemo(() => activeChapters.reduce((acc, c) => acc + (c.text?.split(/\s+/).length || 0), 0), [activeChapters]);
  const estimatedReadTimeMins = Math.max(1, Math.round(totalWords / 200));

  return (
    <div className={`flex flex-col h-full ${styles.bg} ${styles.text} border ${styles.border} rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300`}>
      {/* Global Fonts Inject */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap" />

      {/* Reader Header Bar */}
      <div className={`h-16 ${styles.headerBg} backdrop-blur-md border-b ${styles.border} flex items-center justify-between px-3 md:px-6 z-20 flex-shrink-0 gap-2 ${styles.text}`}>
        
        {/* Left: Book Meta & Table of Contents Button */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Button 
            onClick={() => setIsTocOpen(!isTocOpen)} 
            variant="secondary" 
            size="sm" 
            className={`px-2.5 py-1.5 text-xs font-bold gap-1.5 flex items-center shrink-0 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
            title="Table of Contents & Chapters"
          >
            <List className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Chapters ({activeChapters.length})</span>
          </Button>

          <div className="min-w-0">
            <div className={`font-extrabold text-xs md:text-sm truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs ${styles.headingText}`}>
              {title || 'QuillHawk Book'}
            </div>
            <div className={`text-[10px] ${styles.mutedText} font-medium flex items-center gap-1.5 truncate`}>
              <span>Time:</span>
              <span className={`${styles.accentText} font-semibold font-mono`}>{Math.floor(timeSpent / 60)}m</span>
              <span className="opacity-40">|</span>
              <span>{estimatedReadTimeMins}m read</span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switching Pills */}
        <div className={`hidden lg:flex items-center gap-1 ${styles.buttonBg}/60 p-1 rounded-xl border ${styles.buttonBorder}`}>
          <button
            onClick={() => setCurrentViewMode('reader')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              currentViewMode === 'reader' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
          >
            📖 Full Book Text
          </button>

          <button
            onClick={() => setCurrentViewMode('bilingual')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              currentViewMode === 'bilingual' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
          >
            <Languages className="w-3 h-3" />
            <span>Side-by-Side Bilingual</span>
          </button>

          <button
            onClick={() => setCurrentViewMode('translated')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              currentViewMode === 'translated' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
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
                  : `${styles.mutedText} hover:${styles.text}`
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
                  : `${styles.mutedText} hover:${styles.text}`
              }`}
            >
              🏛️ Archive
            </button>
          )}

          {resolvedGoogleId && (
            <button
              onClick={() => setCurrentViewMode('google')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                currentViewMode === 'google' 
                  ? 'bg-primary text-white shadow' 
                  : `${styles.mutedText} hover:${styles.text}`
              }`}
            >
              🌐 Google Preview
            </button>
          )}
        </div>

        {/* Right: Controls (Search, Typography, Audio, Pagination) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          
          {/* Translation selector */}
          {(currentViewMode === 'bilingual' || currentViewMode === 'translated') && (
            <div className={`flex items-center gap-1 ${styles.buttonBg} border ${styles.buttonBorder} px-2 py-1 rounded-xl`}>
              <Globe className={`w-3 h-3 ${styles.accentText} shrink-0`} />
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className={`bg-transparent ${styles.text} font-bold text-xs focus:outline-none cursor-pointer border-0 p-0`}
              >
                {TRANSLATE_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className={`${styles.cardBg} ${styles.text}`}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-xl border transition ${isSearchOpen ? 'bg-primary text-white border-primary' : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`}`}
            title="Search inside book"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Continuous vs Paginated Toggle */}
          {currentViewMode === 'reader' && (
            <button
              onClick={() => setScrollMode(scrollMode === 'paginated' ? 'continuous' : 'paginated')}
              className={`p-1.5 rounded-xl border text-[10px] font-bold hidden sm:flex items-center gap-1 ${scrollMode === 'continuous' ? 'bg-primary text-white border-primary' : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`}`}
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
            className={`text-xs font-bold px-2.5 py-1 gap-1 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
            title="Listen to chapter"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> : <Volume2 className={`w-3.5 h-3.5 ${styles.accentText}`} />}
            <span className="hidden md:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </Button>

          {/* Font Selector & Size Adjuster */}
          <div className={`hidden xl:flex items-center gap-2 text-[11px] ${styles.buttonBg}/90 border ${styles.buttonBorder} px-2.5 py-1 rounded-xl shadow-inner`}>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)} 
              className={`bg-transparent ${styles.text} focus:outline-none cursor-pointer font-bold border-0 p-0 max-w-[130px] truncate`}
            >
              {READER_FONTS.map(f => (
                <option key={f.value} value={f.value} className={`${styles.cardBg} ${styles.text}`}>{f.label}</option>
              ))}
            </select>
            
            <div className={`flex items-center gap-1 border-l ${styles.buttonBorder} pl-1.5`}>
              <button onClick={() => setFontSize(p => Math.max(12, p - 2))} className={`hover:${styles.accentText} font-black px-1 text-xs`}>-</button>
              <span className={`font-bold font-mono text-[10px] ${styles.text}`}>{fontSize}px</span>
              <button onClick={() => setFontSize(p => Math.min(36, p + 2))} className={`hover:${styles.accentText} font-black px-1 text-xs`}>+</button>
            </div>
          </div>

          {/* Previous / Next buttons */}
          {(currentViewMode === 'reader' || currentViewMode === 'bilingual' || currentViewMode === 'translated') && (
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className={`font-bold text-xs px-2.5 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>←</Button>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className={`font-bold text-xs px-2.5 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>→</Button>
            </div>
          )}

          {/* Theme Switcher */}
          <ThemeToggle variant="dropdown" size="sm" showLabel={false} className="shrink-0" />

          {/* Fullscreen button */}
          <button 
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-xl ${styles.buttonBg} border ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text} hidden sm:block`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Slide-out In-Book Search Bar */}
      {isSearchOpen && (
        <div className={`${styles.headerBg} border-b ${styles.border} p-4 z-20 space-y-3 animate-in slide-in-from-top-2`}>
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${styles.mutedText}`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words, names, or quotes across entire book..."
                className={`w-full ${styles.inputBg} border ${styles.border} ${styles.text} rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary`}
                autoFocus
              />
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className={`p-2 rounded-xl ${styles.mutedText} hover:${styles.text} hover:${styles.buttonBg}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {searchQuery && (
            <div className="max-w-2xl mx-auto max-h-48 overflow-y-auto space-y-2 pr-2">
              <p className={`text-[11px] ${styles.mutedText} font-mono`}>Found {searchResults.length} matches across chapters:</p>
              {searchResults.map((res, i) => (
                <div 
                  key={`res-${i}`}
                  onClick={() => {
                    setFallbackPage(res.chapterIdx);
                    setIsSearchOpen(false);
                  }}
                  className={`p-2.5 rounded-xl ${styles.cardBg} border ${styles.cardBorder} hover:border-primary/60 cursor-pointer transition text-left`}
                >
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">{res.chapterTitle}</span>
                  <p className={`text-xs ${styles.text} line-clamp-1 mt-0.5`}>{res.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide-out Table of Contents (TOC) Drawer */}
      {isTocOpen && (
        <div className={`absolute inset-y-16 left-0 w-80 md:w-96 ${styles.headerBg} border-r ${styles.border} z-30 flex flex-col p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-left duration-200 ${styles.text}`}>
          <div className={`flex items-center justify-between pb-3 border-b ${styles.border}`}>
            <div>
              <h3 className={`font-extrabold text-sm ${styles.headingText} flex items-center gap-1.5`}>
                <List className="w-4 h-4 text-primary" />
                <span>Table of Contents</span>
              </h3>
              <p className={`text-[10px] ${styles.mutedText} font-mono`}>{activeChapters.length} Chapters | ~{estimatedReadTimeMins}m read</p>
            </div>
            <button onClick={() => setIsTocOpen(false)} className={`p-1 rounded-lg ${styles.mutedText} hover:${styles.text} hover:${styles.buttonBg}`}>
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
                      ? 'bg-primary/20 border border-primary/60 font-bold shadow-sm text-primary' 
                      : `hover:${styles.buttonBg}/80 ${styles.mutedText} hover:${styles.text} border border-transparent`
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className={`text-[10px] ${styles.mutedText} font-mono block`}>Section {idx + 1}</span>
                    <p className={`text-xs truncate font-medium ${isSelected ? 'text-primary font-bold' : styles.text}`}>{ch.chapter}</p>
                  </div>
                  <span className={`text-[10px] ${styles.mutedText} font-mono shrink-0`}>~{Math.max(1, Math.round(wordCount / 200))}m</span>
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
            <p className={`text-xs ${styles.mutedText} animate-pulse font-medium`}>Opening authentic multi-chapter edition...</p>
          </div>
        )}

        {/* 1. Google Book Preview Viewer */}
        {currentViewMode === 'google' && resolvedGoogleId ? (
          <div className="w-full h-full min-h-[600px] p-2 md:p-4">
            <GoogleBookViewer bookId={resolvedGoogleId} />
          </div>
        ) : currentViewMode === 'archive' && iaId ? (
          <iframe 
            src={`https://archive.org/embed/${iaId}?js=1`} 
            className={`w-full h-full border-0 ${styles.bg} min-h-[600px]`} 
            title={title || "Internet Archive Reader"} 
            allowFullScreen
          />
        ) : isPdf ? (
          <iframe 
            src={resolvedBookUrl} 
            className={`w-full h-full border-0 ${styles.bg}`} 
            title={title || "PDF Reader"} 
          />
        ) : currentViewMode === 'bilingual' ? (
          /* 2. Side-by-Side Bilingual Dual-Language Parallel Reading */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-8 px-4 md:px-10 flex flex-col space-y-6`}>
            <div className={`flex flex-col md:flex-row items-center justify-between gap-4 border-b ${styles.divider} pb-4 max-w-6xl mx-auto w-full`}>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${styles.buttonBg} border ${styles.buttonBorder} ${styles.text} text-xs font-bold`}>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>AI Parallel Dual-Language View</span>
                </span>
                {isTranslating && (
                  <span className="text-[11px] text-primary font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full block animate-spin" />
                    Translating section...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-[200px] truncate`}
                >
                  {activeChapters.map((ch, idx) => (
                    <option key={`ch-bilingual-${idx}`} value={idx + 1} className={`${styles.cardBg} ${styles.text}`}>
                      {ch.chapter || `Chapter ${idx + 1}`}
                    </option>
                  ))}
                </select>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleCopyText(currentTransData?.text || currentChapterObj.text)}
                  className={`text-xs font-bold gap-1 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Bilingual Dual Column Grid */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Left: Original Text */}
              <div className={`p-6 rounded-2xl ${styles.paperBg} border ${styles.border} space-y-6 shadow-sm`}>
                <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                  <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span>📜 Original Text</span>
                  </span>
                  <span className={`text-[10px] ${styles.mutedText} font-mono font-bold`}>Section {fallbackPage}</span>
                </div>

                <h3 className={`text-lg md:text-xl font-extrabold ${styles.headingText} tracking-tight`} style={{ fontFamily }}>
                  {currentChapterObj.chapter}
                </h3>

                <div 
                  className={`space-y-5 leading-relaxed whitespace-pre-line ${isBookRtl ? 'text-right' : 'text-justify'}`}
                  dir={isBookRtl ? 'rtl' : 'ltr'}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily,
                    lineHeight: isBookRtl ? 2.4 : 1.85 
                  }}
                >
                  {currentTransData?.paragraphs?.length ? (
                    currentTransData.paragraphs.map((p, idx) => (
                      <p key={`orig-p-${idx}`} className={`p-2 rounded-lg hover:${styles.buttonBg} transition-colors`}>
                        {p.original}
                      </p>
                    ))
                  ) : (
                    currentChapterObj.text
                  )}
                </div>
              </div>

              {/* Right: Translated Text */}
              <div className={`p-6 rounded-2xl ${styles.cardBg} border ${styles.cardBorder} space-y-6 shadow-sm relative`}>
                <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                  <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Translated: {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
                  </span>
                  <span className={`text-[10px] ${styles.mutedText} font-mono font-bold`}>Live AI Translation</span>
                </div>

                <h3 
                  className={`text-lg md:text-xl font-extrabold ${styles.headingText} tracking-tight ${isTargetRtl ? 'text-right' : 'text-left'}`}
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
                    lineHeight: isTargetRtl ? 2.4 : 1.85 
                  }}
                >
                  {isTranslating && !currentTransData ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                      <p className="text-xs text-primary animate-pulse font-medium">Translating into {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}...</p>
                    </div>
                  ) : currentTransData?.paragraphs?.length ? (
                    currentTransData.paragraphs.map((p, idx) => (
                      <p key={`trans-p-${idx}`} className={`p-2 rounded-lg ${styles.buttonBg}/60 hover:${styles.buttonBg} transition-colors border ${styles.buttonBorder}`}>
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
            <div className={`max-w-6xl mx-auto w-full text-center text-xs ${styles.mutedText} font-semibold font-mono border-t ${styles.divider} pt-6 flex justify-between items-center`}>
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
                ← Previous Section
              </Button>
              <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
              <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
                Next Section →
              </Button>
            </div>
          </div>
        ) : currentViewMode === 'translated' ? (
          /* 3. Full Translated Single Language Edition */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-12 px-6 md:px-16 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3" />
                    <span>{TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name} Translation</span>
                  </span>
                  <h2 
                    className={`text-xl md:text-2xl font-black tracking-tight ${styles.headingText}`}
                    dir={isTargetRtl ? 'rtl' : 'ltr'}
                    style={{ fontFamily: isTargetRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily }}
                  >
                    {currentTransData?.chapter || currentChapterObj.chapter}
                  </h2>
                </div>

                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[200px] truncate`}
                >
                  {activeChapters.map((ch, idx) => (
                    <option key={`opt-trans-${idx}`} value={idx + 1} className={`${styles.cardBg} ${styles.text}`}>
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
                  lineHeight: isTargetRtl ? 2.4 : 1.85 
                }}
              >
                {isTranslating && !currentTransData ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                    <p className="text-xs text-primary animate-pulse font-medium">Translating into {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}...</p>
                  </div>
                ) : (
                  currentTransData?.text || currentChapterObj.text
                )}
              </div>

              <div className={`text-center text-xs ${styles.mutedText} font-semibold font-mono border-t ${styles.divider} pt-4 flex justify-between items-center`}>
                <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
                  ← Previous Section
                </Button>
                <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
                  Next Section →
                </Button>
              </div>
            </div>
          </div>
        ) : currentViewMode === 'epub' ? (
          /* 4. Original EPUB View */
          <div ref={viewerRef} className={`w-full h-full relative p-4 ${styles.bg}`} />
        ) : (
          /* 5. Default Reflowable Full Book View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-10 px-4 md:px-12 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              
              {scrollMode === 'continuous' ? (
                /* Continuous Scroll View (All Chapters Sequentially) */
                <div className="space-y-16">
                  {activeChapters.map((ch, idx) => (
                    <div key={`cont-ch-${idx}`} className={`space-y-6 border-b ${styles.divider} pb-12`}>
                      <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                        <span className="text-[10px] text-primary font-black uppercase tracking-widest font-mono">Chapter {idx + 1}</span>
                        <span className={`text-[10px] ${styles.mutedText} font-mono`}>~{Math.max(1, Math.round((ch.text?.split(/\s+/).length || 0) / 200))} min</span>
                      </div>

                      <h2 
                        className={`text-2xl md:text-3xl font-black tracking-tight ${styles.headingText}`}
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
                          lineHeight: isBookRtl ? 2.4 : 1.85 
                        }}
                      >
                        {ch.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Paginated View (Single Chapter Focused Canvas) */
                <>
                  <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                    <h2 
                      className={`text-xl md:text-2xl font-black tracking-tight ${styles.headingText}`}
                      dir={isBookRtl ? 'rtl' : 'ltr'}
                      style={{ fontFamily: isBookRtl ? "'Noto Nastaliq Urdu', 'Amiri', serif" : fontFamily }}
                    >
                      {currentChapterObj.chapter}
                    </h2>
                    <select
                      value={fallbackPage}
                      onChange={(e) => setFallbackPage(Number(e.target.value))}
                      className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[220px] truncate`}
                    >
                      {activeChapters.map((ch, idx) => (
                        <option key={`opt-${idx}`} value={idx + 1} className={`${styles.cardBg} ${styles.text}`}>
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
                      lineHeight: isBookRtl ? 2.4 : 1.85 
                    }}
                  >
                    {currentChapterObj.text || "No content found in this section."}
                  </div>

                  <div className={`text-center text-xs ${styles.mutedText} font-semibold font-mono border-t ${styles.divider} pt-4 flex justify-between items-center`}>
                    <Button variant="secondary" size="sm" onClick={prevPage} disabled={fallbackPage === 1} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
                      ← Previous Section
                    </Button>
                    <span>Section {fallbackPage} of {activeChapters.length} ({Math.round((fallbackPage / activeChapters.length) * 100)}%)</span>
                    <Button variant="secondary" size="sm" onClick={nextPage} disabled={fallbackPage === activeChapters.length} className={`font-bold text-xs ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}>
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
