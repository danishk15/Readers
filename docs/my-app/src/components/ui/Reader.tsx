'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ePub, { Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, Globe, Languages, Volume2, VolumeX, Sparkles, Copy, Check, 
  ArrowRight, ArrowLeft, Search, List, AlignJustify, BookMarked, 
  Settings2, Eye, Compass, ChevronDown, ChevronRight, X, Play, Pause,
  Share2, Maximize2, Minimize2, Type, Palette, ArrowLeftRight,
  SkipBack, SkipForward, Music, Radio, Sliders, Volume1
} from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';
import { getAuthenticBookChapters, AuthenticBookChapter } from '@/utils/authenticBookContent';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { stripHtml } from '@/utils/textSanitizer';
import { 
  transliterateScript, 
  LANGUAGE_SCRIPT_STYLES, 
  ScriptStylePreset 
} from '@/utils/transliteration';
import { 
  AudioNarrationController, 
  NarrationState, 
  splitTextIntoSentences,
  getBestVoiceForLanguage
} from '@/utils/audioNarration';

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
];

export interface ReaderProps {
  bookUrl?: string;
  bookId: string;
  userId?: string;
  title?: string;
  author?: string;
  description?: string;
  source?: string;
  iaId?: string;
  previewLink?: string;
  infoLink?: string;
  readMode?: string;
  customChapters?: AuthenticBookChapter[];
}

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
  readMode, 
  customChapters 
}: ReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  // Audio Narration Engine Instance
  const narrationRef = useRef<AudioNarrationController | null>(null);
  if (!narrationRef.current) {
    narrationRef.current = new AudioNarrationController();
  }

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
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
  
  // View Modes: 'reader' (Authentic Text), 'transliterated' (Roman Script, No Translation), 'bilingual' (Dual Column), 'translated' (Single Translated), 'epub' (Raw EPUB), 'archive' (IA Embed), 'google' (Google Books Viewer)
  const [currentViewMode, setCurrentViewMode] = useState<'reader' | 'transliterated' | 'bilingual' | 'translated' | 'epub' | 'archive' | 'google'>(() => {
    if (iaId && (!bookUrl || readMode === 'archive')) return 'archive';
    return 'reader';
  });

  // Dual View Mode Type: 'transliteration' (Original Script vs Roman Script) or 'translation' (Original vs Translated words)
  const [bilingualModeType, setBilingualModeType] = useState<'transliteration' | 'translation'>('transliteration');

  // Reading Modes: 'paginated' (One chapter at a time) or 'continuous' (All chapters flowing)
  const [scrollMode, setScrollMode] = useState<'paginated' | 'continuous'>('paginated');

  // Table of Contents Drawer & Search States
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected Language Script & Typography Style Preset
  const [selectedScriptId, setSelectedScriptId] = useState<string>('auto');

  // Translation States
  const [targetLang, setTargetLang] = useState<string>('ur');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, { chapter: string; text: string; paragraphs: { original: string; translated: string }[] }>>({});
  const [copied, setCopied] = useState(false);

  // Audio Narration & TTS States
  const [isAudioBarOpen, setIsAudioBarOpen] = useState(false);
  const [narrationLang, setNarrationLang] = useState<string>('auto');
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);
  const [narrationState, setNarrationState] = useState<NarrationState>({
    isPlaying: false,
    isPaused: false,
    currentSentenceIdx: 0,
    totalSentences: 0,
    currentSentenceText: '',
    langCode: 'en',
    speed: 1.0
  });

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

  // Detect if book is Urdu, Hindi, or Arabic
  const isBookUrdu = Boolean(
    title?.match(/[\u0600-\u06FF\u0750-\u077F]/) || 
    description?.match(/[\u0600-\u06FF\u0750-\u077F]/) ||
    author?.match(/[\u0600-\u06FF\u0750-\u077F]/)
  );
  const isBookHindi = Boolean(
    title?.match(/[\u0900-\u097F]/) || 
    description?.match(/[\u0900-\u097F]/) ||
    author?.match(/[\u0900-\u097F]/)
  );

  const isBookRtl = isBookUrdu;
  const isTargetRtl = TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.isRtl ?? false;

  // Resolve effective active script style preset
  const activeScriptPreset = useMemo(() => {
    if (selectedScriptId !== 'auto') {
      return LANGUAGE_SCRIPT_STYLES.find(s => s.id === selectedScriptId) || null;
    }
    if (isBookUrdu) {
      return LANGUAGE_SCRIPT_STYLES.find(s => s.id === 'urdu-nastaliq') || null;
    }
    if (isBookHindi) {
      return LANGUAGE_SCRIPT_STYLES.find(s => s.id === 'hindi-devanagari') || null;
    }
    return null;
  }, [selectedScriptId, isBookUrdu, isBookHindi]);

  // Apply script preset typography
  const effectiveFontFamily = activeScriptPreset ? activeScriptPreset.fontFamily : fontFamily;
  const effectiveLineHeight = activeScriptPreset ? activeScriptPreset.lineHeight : (isBookRtl ? '2.4' : '1.85');
  const effectiveIsRtl = activeScriptPreset ? (activeScriptPreset.isRtl ?? false) : isBookRtl;

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
    narrationRef.current?.stop();
    setIsAudioBarOpen(false);
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
            'font-family': effectiveFontFamily,
            'font-size': `${fontSize}px`,
            'line-height': effectiveLineHeight
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
  }, [resolvedBookUrl, isPdf, currentViewMode, effectiveFontFamily, fontSize, styles, effectiveLineHeight]);

  // Real-time Translation Fetcher
  const translateCurrentChapter = useCallback(async (target: string) => {
    const chapterIdx = fallbackPage - 1;
    const ch = activeChapters[chapterIdx] || activeChapters[0];
    if (!ch || !ch.text) return;

    const cacheKey = `${chapterIdx}::${target}`;
    if (translationCache[cacheKey]) return;

    setIsTranslating(true);
    try {
      const transChapterPromise = fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.chapter, targetLang: target })
      }).then(r => r.ok ? r.json() : { translatedText: ch.chapter });

      const paragraphs = ch.text.split(/\n\s*\n/).filter(p => p.trim());
      const translatedParas: { original: string; translated: string }[] = [];

      for (const p of paragraphs.slice(0, 30)) {
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: p, targetLang: target })
          });
          if (res.ok) {
            const data = await res.json();
            translatedParas.push({ original: p, translated: data.translatedText || p });
          } else {
            translatedParas.push({ original: p, translated: p });
          }
        } catch {
          translatedParas.push({ original: p, translated: p });
        }
      }

      const chapterRes = await transChapterPromise;
      const fullTranslatedText = translatedParas.map(tp => tp.translated).join('\n\n');

      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: {
          chapter: chapterRes.translatedText || ch.chapter,
          text: fullTranslatedText,
          paragraphs: translatedParas
        }
      }));
    } catch (err) {
      console.warn('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [fallbackPage, activeChapters, translationCache]);

  // Trigger translation when in translation mode or audio translated mode
  useEffect(() => {
    if ((currentViewMode === 'translated' || (currentViewMode === 'bilingual' && bilingualModeType === 'translation') || (narrationLang !== 'auto' && narrationLang !== 'en')) && targetLang) {
      translateCurrentChapter(targetLang);
    }
  }, [currentViewMode, bilingualModeType, targetLang, narrationLang, fallbackPage, translateCurrentChapter]);

  // Dynamic Transliterated text (Same authentic words, converted into Roman script)
  const transliteratedChapter = useMemo(() => {
    return {
      chapter: transliterateScript(currentChapterObj.chapter),
      text: transliterateScript(currentChapterObj.text)
    };
  }, [currentChapterObj]);

  // Subscribe to Audio Narration Engine updates
  useEffect(() => {
    narrationRef.current?.subscribe((state) => {
      setNarrationState(state);
    });
    return () => {
      narrationRef.current?.stop();
    };
  }, []);

  // Stop audio on chapter change
  useEffect(() => {
    narrationRef.current?.stop();
  }, [fallbackPage]);

  // Start / Toggle Multi-Language Audio Narration
  const handleToggleNarration = useCallback((customTargetLang?: string) => {
    const controller = narrationRef.current;
    if (!controller) return;

    if (narrationState.isPlaying) {
      if (narrationState.isPaused) {
        controller.resume();
      } else {
        controller.pause();
      }
      return;
    }

    setIsAudioBarOpen(true);

    // Determine audio text and speaking language
    let textToSpeak = currentChapterObj.text;
    let speakLang = isBookUrdu ? 'ur' : (isBookHindi ? 'hi' : 'en');

    const effectiveLang = customTargetLang || (narrationLang !== 'auto' ? narrationLang : (currentViewMode === 'translated' ? targetLang : 'auto'));

    if (effectiveLang !== 'auto') {
      speakLang = effectiveLang;
      const transData = translationCache[`${fallbackPage - 1}::${speakLang}`];
      if (transData?.text) {
        textToSpeak = transData.text;
      }
    } else if (currentViewMode === 'transliterated') {
      textToSpeak = transliteratedChapter.text;
      speakLang = 'en';
    }

    controller.loadText(textToSpeak, speakLang, 0);
    controller.setSpeed(narrationSpeed);
    controller.play();
  }, [
    narrationState.isPlaying, 
    narrationState.isPaused, 
    currentChapterObj.text, 
    isBookUrdu, 
    isBookHindi, 
    narrationLang, 
    currentViewMode, 
    targetLang, 
    translationCache, 
    fallbackPage, 
    transliteratedChapter.text, 
    narrationSpeed
  ]);

  // Navigation handlers
  const prevPage = useCallback(() => {
    if (currentViewMode === 'epub' && renditionRef.current) {
      renditionRef.current.prev();
    } else {
      setFallbackPage(prev => Math.max(1, prev - 1));
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentViewMode]);

  const nextPage = useCallback(() => {
    if (currentViewMode === 'epub' && renditionRef.current) {
      renditionRef.current.next();
    } else {
      setFallbackPage(prev => Math.min(activeChapters.length, prev + 1));
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentViewMode, activeChapters.length]);

  // Time Tracker
  const [timeSpent, setTimeSpent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Copy text handler
  const handleCopyText = useCallback((text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // In-book Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const matches: { chapterIdx: number; chapterTitle: string; snippet: string }[] = [];

    activeChapters.forEach((ch, cIdx) => {
      const text = ch.text || '';
      const lower = text.toLowerCase();
      let pos = lower.indexOf(q);
      let count = 0;
      while (pos !== -1 && count < 3) {
        const start = Math.max(0, pos - 40);
        const end = Math.min(text.length, pos + q.length + 60);
        const snippet = (start > 0 ? '...' : '') + text.slice(start, end).replace(/\s+/g, ' ') + (end < text.length ? '...' : '');
        matches.push({
          chapterIdx: cIdx,
          chapterTitle: ch.chapter,
          snippet
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
          {/* 1. Authentic Original Text */}
          <button
            onClick={() => setCurrentViewMode('reader')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'reader' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="Read in original language and text"
          >
            <BookOpen className="w-3 h-3" />
            <span>Original Text</span>
          </button>

          {/* 2. Roman Script Transliteration (No Translation, pure authentic words in phonetic English letters) */}
          <button
            onClick={() => setCurrentViewMode('transliterated')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'transliterated' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="Transliterate into Roman script without translating words"
          >
            <Type className="w-3 h-3 text-amber-500" />
            <span>Roman Script</span>
          </button>

          {/* 3. Side-by-Side Dual View */}
          <button
            onClick={() => setCurrentViewMode('bilingual')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'bilingual' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="Side-by-Side Dual Column View"
          >
            <ArrowLeftRight className="w-3 h-3 text-sky-500" />
            <span>Dual View</span>
          </button>

          {/* 4. Translated */}
          <button
            onClick={() => setCurrentViewMode('translated')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'translated' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="AI Language Translation"
          >
            <Globe className="w-3 h-3 text-emerald-500" />
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
              📄 EPUB
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

        {/* Right: Controls (Language Script Style, Search, Neural Listen, Settings) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          
          {/* Quick Language Script & Typography Style Selector */}
          <div className={`flex items-center gap-1.5 ${styles.buttonBg} border ${styles.buttonBorder} px-2 py-1 rounded-xl shadow-sm`} title="Transform typography and language script style without translating words">
            <Palette className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={selectedScriptId}
              onChange={(e) => {
                const sId = e.target.value;
                setSelectedScriptId(sId);
                const found = LANGUAGE_SCRIPT_STYLES.find(s => s.id === sId);
                if (found) {
                  setFontFamily(found.fontFamily);
                }
              }}
              className={`bg-transparent ${styles.text} font-bold text-[11px] focus:outline-none cursor-pointer border-0 p-0 max-w-[130px] sm:max-w-[160px] truncate`}
            >
              <option value="auto" className={`${styles.cardBg} ${styles.text}`}>
                🎨 Auto Script Style
              </option>
              {LANGUAGE_SCRIPT_STYLES.map(s => (
                <option key={s.id} value={s.id} className={`${styles.cardBg} ${styles.text}`}>
                  {s.name} ({s.nativeLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Translation selector if in Translated Mode */}
          {currentViewMode === 'translated' && (
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
          {(currentViewMode === 'reader' || currentViewMode === 'transliterated') && (
            <button
              onClick={() => setScrollMode(scrollMode === 'paginated' ? 'continuous' : 'paginated')}
              className={`p-1.5 rounded-xl border text-[10px] font-bold hidden sm:flex items-center gap-1 ${scrollMode === 'continuous' ? 'bg-primary text-white border-primary' : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`}`}
              title={scrollMode === 'paginated' ? 'Switch to Continuous Scroll' : 'Switch to Paginated'}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>{scrollMode === 'paginated' ? 'Paginated' : 'Continuous'}</span>
            </button>
          )}

          {/* Multi-Language Neural Listen Button */}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleToggleNarration()}
            className={`text-xs font-bold px-3 py-1.5 gap-1.5 transition-all duration-300 ${
              narrationState.isPlaying && !narrationState.isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md ring-2 ring-emerald-400/40' 
                : `${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`
            }`}
            title="Listen to chapter with intelligent multi-language voice and translation"
          >
            {narrationState.isPlaying && !narrationState.isPaused ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce text-white" />
                <span className="font-extrabold">Listening...</span>
              </>
            ) : narrationState.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Volume1 className={`w-4 h-4 ${styles.accentText}`} />
                <span>Listen</span>
              </>
            )}
          </Button>

          {/* Font Size Adjuster */}
          <div className={`hidden sm:flex items-center gap-1 text-[11px] ${styles.buttonBg}/90 border ${styles.buttonBorder} px-2 py-1 rounded-xl shadow-inner`}>
            <button 
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))} 
              className={`px-1 font-bold ${styles.mutedText} hover:${styles.text}`}
              title="Decrease font size"
            >
              A-
            </button>
            <span className="font-mono text-[10px] font-bold opacity-60">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(36, prev + 2))} 
              className={`px-1 font-bold ${styles.mutedText} hover:${styles.text}`}
              title="Increase font size"
            >
              A+
            </button>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Interactive High-Fidelity Audio Narration Player Bar */}
      {isAudioBarOpen && (
        <div className={`h-16 ${styles.paperBg} border-b ${styles.border} flex items-center justify-between px-3 md:px-6 z-20 shrink-0 gap-3 shadow-md animate-in slide-in-from-top-2 duration-300`}>
          
          {/* Left: Soundwave Visualizer & Active Phrase Subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Animated Equalizer Wave */}
            <div className="flex items-end gap-0.5 h-6 w-7 shrink-0 p-1 rounded-lg bg-primary/10">
              <span className={`w-1 bg-primary rounded-full transition-all duration-150 ${narrationState.isPlaying && !narrationState.isPaused ? 'h-full animate-pulse' : 'h-1.5'}`} />
              <span className={`w-1 bg-primary rounded-full transition-all duration-200 delay-75 ${narrationState.isPlaying && !narrationState.isPaused ? 'h-3/4 animate-pulse' : 'h-2'}`} />
              <span className={`w-1 bg-primary rounded-full transition-all duration-300 delay-150 ${narrationState.isPlaying && !narrationState.isPaused ? 'h-5/6 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-1 bg-primary rounded-full transition-all duration-100 ${narrationState.isPlaying && !narrationState.isPaused ? 'h-full animate-pulse' : 'h-3'}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary font-mono shrink-0">
                  Sentence {narrationState.currentSentenceIdx + 1} / {Math.max(1, narrationState.totalSentences)}
                </span>
                <span className={`text-[10px] ${styles.mutedText} font-mono hidden sm:inline`}>
                  ({Math.round(((narrationState.currentSentenceIdx + 1) / Math.max(1, narrationState.totalSentences)) * 100)}%)
                </span>
              </div>
              <p className={`text-xs font-medium truncate ${styles.headingText} italic`}>
                "{narrationState.currentSentenceText || 'Preparing neural audio playback...'}"
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => narrationRef.current?.prevSentence()}
              disabled={narrationState.currentSentenceIdx <= 0}
              className={`p-1.5 rounded-lg border ${styles.buttonBg} ${styles.buttonBorder} ${styles.buttonHover} disabled:opacity-30`}
              title="Previous sentence"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (narrationState.isPlaying) {
                  if (narrationState.isPaused) narrationRef.current?.resume();
                  else narrationRef.current?.pause();
                } else {
                  handleToggleNarration();
                }
              }}
              className="p-2 rounded-xl bg-primary text-white hover:opacity-90 shadow-md transition"
              title={narrationState.isPlaying && !narrationState.isPaused ? 'Pause' : 'Play'}
            >
              {narrationState.isPlaying && !narrationState.isPaused ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => narrationRef.current?.nextSentence()}
              disabled={narrationState.currentSentenceIdx >= narrationState.totalSentences - 1}
              className={`p-1.5 rounded-lg border ${styles.buttonBg} ${styles.buttonBorder} ${styles.buttonHover} disabled:opacity-30`}
              title="Next sentence"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                narrationRef.current?.stop();
                setIsAudioBarOpen(false);
              }}
              className={`p-1.5 rounded-lg border ${styles.buttonBg} ${styles.buttonBorder} hover:text-rose-500`}
              title="Stop and Close Audio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Translate & Speak Language Selector + Speed */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Translate & Listen in Any Language */}
            <div className={`flex items-center gap-1.5 text-xs ${styles.buttonBg} border ${styles.buttonBorder} px-2.5 py-1 rounded-xl`} title="Translate and speak in any language with native pronunciation">
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Voice:</span>
              <select
                value={narrationLang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setNarrationLang(newLang);
                  narrationRef.current?.stop();
                  handleToggleNarration(newLang);
                }}
                className={`bg-transparent ${styles.text} font-bold text-xs focus:outline-none cursor-pointer border-0 p-0 max-w-[130px] truncate`}
              >
                <option value="auto" className={`${styles.cardBg} ${styles.text}`}>
                  🎙️ Auto Native Voice
                </option>
                {TRANSLATE_LANGUAGES.map(l => (
                  <option key={`narr-l-${l.code}`} value={l.code} className={`${styles.cardBg} ${styles.text}`}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Selector */}
            <div className={`flex items-center gap-1 ${styles.buttonBg} border ${styles.buttonBorder} px-2 py-1 rounded-xl`}>
              <span className={`text-[10px] font-bold ${styles.mutedText}`}>Speed:</span>
              <select
                value={narrationSpeed}
                onChange={(e) => {
                  const s = parseFloat(e.target.value);
                  setNarrationSpeed(s);
                  narrationRef.current?.setSpeed(s);
                }}
                className={`bg-transparent ${styles.text} font-mono font-bold text-xs focus:outline-none cursor-pointer border-0 p-0`}
              >
                <option value="0.75" className={`${styles.cardBg} ${styles.text}`}>0.75x</option>
                <option value="1.0" className={`${styles.cardBg} ${styles.text}`}>1.0x</option>
                <option value="1.25" className={`${styles.cardBg} ${styles.text}`}>1.25x</option>
                <option value="1.5" className={`${styles.cardBg} ${styles.text}`}>1.5x</option>
                <option value="2.0" className={`${styles.cardBg} ${styles.text}`}>2.0x</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* In-Book Search Drawer Overlay */}
      {isSearchOpen && (
        <div className={`absolute top-16 right-0 w-full sm:w-96 max-h-[500px] ${styles.cardBg} border-b sm:border-l ${styles.cardBorder} shadow-2xl z-30 flex flex-col p-4 space-y-3 animate-in slide-in-from-top-2 duration-200`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Search in Book</span>
            </span>
            <button onClick={() => setIsSearchOpen(false)} className={`p-1 rounded-lg hover:${styles.buttonBg} ${styles.mutedText}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search words, phrases, names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs p-2.5 pl-8 rounded-xl ${styles.inputBg} border ${styles.buttonBorder} ${styles.text} focus:outline-none focus:border-primary`}
              autoFocus
            />
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-3 ${styles.mutedText}`} />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-72 divide-y divide-border/20">
            {searchResults.length === 0 ? (
              <p className={`text-xs ${styles.mutedText} text-center py-6`}>
                {searchQuery.trim() ? 'No occurrences found.' : 'Type at least 2 characters to search across all chapters.'}
              </p>
            ) : (
              searchResults.map((res, idx) => (
                <button
                  key={`search-res-${idx}`}
                  onClick={() => {
                    setFallbackPage(res.chapterIdx + 1);
                    setIsSearchOpen(false);
                    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition hover:${styles.buttonBg} space-y-1 block`}
                >
                  <span className="text-[10px] text-primary font-bold block">{res.chapterTitle}</span>
                  <p className={`text-xs ${styles.text} line-clamp-2 leading-relaxed`}>{res.snippet}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div className={`absolute top-16 left-0 w-full sm:w-80 h-[calc(100%-4rem)] ${styles.cardBg} border-r ${styles.cardBorder} shadow-2xl z-30 flex flex-col p-4 space-y-4 animate-in slide-in-from-left duration-200`}>
          <div className="flex items-center justify-between border-b ${styles.divider} pb-3">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-primary" />
              <span className={`text-xs font-black uppercase tracking-wider ${styles.headingText}`}>Table of Contents</span>
            </div>
            <button onClick={() => setIsTocOpen(false)} className={`p-1 rounded-lg hover:${styles.buttonBg} ${styles.mutedText}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
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
            <p className={`text-xs ${styles.mutedText} animate-pulse font-medium`}>Opening authentic edition...</p>
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
        ) : currentViewMode === 'transliterated' ? (
          /* 2. Roman Script Transliterated View (Same authentic words, purely converted to Roman Latin letters) */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-10 px-4 md:px-12 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              
              {/* Informative Header Banner */}
              <div className={`p-3.5 rounded-2xl ${styles.paperBg} border ${styles.border} flex items-center justify-between gap-3 shadow-sm`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${styles.headingText}`}>Roman Script Transliteration</h4>
                    <p className={`text-[11px] ${styles.mutedText}`}>100% authentic words and poetic phrasing preserved in phonetic Latin letters — with 0 machine translations.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleToggleNarration()}
                    className={`text-xs font-bold gap-1 shrink-0 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Listen Roman</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleCopyText(transliteratedChapter.text)}
                    className={`text-xs font-bold gap-1 shrink-0 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              {/* Transliterated Chapter Content */}
              <div className="space-y-6">
                <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                  <h2 className={`text-xl md:text-2xl font-black tracking-tight ${styles.headingText}`} style={{ fontFamily: effectiveFontFamily }}>
                    {transliteratedChapter.chapter}
                  </h2>
                  <select
                    value={fallbackPage}
                    onChange={(e) => setFallbackPage(Number(e.target.value))}
                    className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[220px] truncate`}
                  >
                    {activeChapters.map((ch, idx) => (
                      <option key={`opt-translit-${idx}`} value={idx + 1} className={`${styles.cardBg} ${styles.text}`}>
                        {transliterateScript(ch.chapter) || `Chapter ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div 
                  className="leading-relaxed whitespace-pre-line pt-2 transition-all duration-300 space-y-4 text-justify"
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: effectiveFontFamily,
                    lineHeight: effectiveLineHeight 
                  }}
                >
                  {transliteratedChapter.text}
                </div>
              </div>

              {/* Navigation Footer */}
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
        ) : currentViewMode === 'bilingual' ? (
          /* 3. Side-by-Side Dual View (Supports both Dual Script and Dual Translation) */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-8 px-4 md:px-10 flex flex-col space-y-6`}>
            <div className={`flex flex-col md:flex-row items-center justify-between gap-4 border-b ${styles.divider} pb-4 max-w-6xl mx-auto w-full`}>
              
              {/* Dual View Mode Switcher */}
              <div className="flex items-center gap-2">
                <div className={`inline-flex p-1 rounded-xl ${styles.buttonBg} border ${styles.buttonBorder}`}>
                  <button
                    onClick={() => setBilingualModeType('transliteration')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bilingualModeType === 'transliteration'
                        ? 'bg-primary text-white shadow'
                        : `${styles.mutedText} hover:${styles.text}`
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Dual Script (Original + Roman Script)</span>
                  </button>
                  <button
                    onClick={() => setBilingualModeType('translation')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bilingualModeType === 'translation'
                        ? 'bg-primary text-white shadow'
                        : `${styles.mutedText} hover:${styles.text}`
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Dual Language (AI Translation)</span>
                  </button>
                </div>

                {bilingualModeType === 'translation' && isTranslating && (
                  <span className="text-[11px] text-primary font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full block animate-spin" />
                    Translating...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {bilingualModeType === 'translation' && (
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer`}
                  >
                    {TRANSLATE_LANGUAGES.map(l => (
                      <option key={`bi-lang-${l.code}`} value={l.code} className={`${styles.cardBg} ${styles.text}`}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-[180px] truncate`}
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
                  onClick={() => handleCopyText(bilingualModeType === 'transliteration' ? transliteratedChapter.text : (currentTransData?.text || currentChapterObj.text))}
                  className={`text-xs font-bold gap-1 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </div>

            {/* Bilingual Dual Column Grid */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Left Column: Original Text */}
              <div className={`p-6 rounded-2xl ${styles.paperBg} border ${styles.border} space-y-6 shadow-sm`}>
                <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                  <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span>📜 Original Text & Script</span>
                  </span>
                  <span className={`text-[10px] ${styles.mutedText} font-mono font-bold`}>Section {fallbackPage}</span>
                </div>

                <h3 className={`text-lg md:text-xl font-extrabold ${styles.headingText} tracking-tight`} style={{ fontFamily: effectiveFontFamily }}>
                  {currentChapterObj.chapter}
                </h3>

                <div 
                  className={`space-y-5 leading-relaxed whitespace-pre-line ${effectiveIsRtl ? 'text-right' : 'text-justify'}`}
                  dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: effectiveFontFamily,
                    lineHeight: effectiveLineHeight 
                  }}
                >
                  {currentChapterObj.text}
                </div>
              </div>

              {/* Right Column: Roman Script Transliteration OR AI Translation */}
              <div className={`p-6 rounded-2xl ${styles.cardBg} border ${styles.cardBorder} space-y-6 shadow-sm relative`}>
                {bilingualModeType === 'transliteration' ? (
                  <>
                    <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5" />
                        <span>Roman Script Transliteration (No Translation)</span>
                      </span>
                      <span className={`text-[10px] ${styles.mutedText} font-mono font-bold`}>Phonetic Latin</span>
                    </div>

                    <h3 className={`text-lg md:text-xl font-extrabold ${styles.headingText} tracking-tight`} style={{ fontFamily: effectiveFontFamily }}>
                      {transliteratedChapter.chapter}
                    </h3>

                    <div 
                      className="space-y-5 leading-relaxed whitespace-pre-line text-justify"
                      style={{ 
                        fontSize: `${fontSize}px`, 
                        fontFamily: effectiveFontFamily,
                        lineHeight: effectiveLineHeight 
                      }}
                    >
                      {transliteratedChapter.text}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
                      <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Translated: {TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
                      </span>
                      <span className={`text-[10px] ${styles.mutedText} font-mono font-bold`}>AI Translation</span>
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
                  </>
                )}
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
          /* 4. Full Translated Single Language Edition */
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
          /* 5. Original EPUB View */
          <div ref={viewerRef} className={`w-full h-full relative p-4 ${styles.bg}`} />
        ) : (
          /* 6. Default Reflowable Full Book View with Custom Language Script Styling */
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
                        dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                        style={{ fontFamily: effectiveFontFamily }}
                      >
                        {ch.chapter}
                      </h2>

                      <div 
                        className={`leading-relaxed whitespace-pre-line pt-2 space-y-4 ${effectiveIsRtl ? 'text-right' : 'text-justify'}`}
                        dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                        style={{ 
                          fontSize: `${fontSize}px`, 
                          fontFamily: effectiveFontFamily,
                          lineHeight: effectiveLineHeight 
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
                      dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                      style={{ fontFamily: effectiveFontFamily }}
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
                    className={`leading-relaxed whitespace-pre-line pt-2 transition-all duration-300 space-y-4 ${effectiveIsRtl ? 'text-right' : 'text-justify'}`}
                    dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fontFamily: effectiveFontFamily,
                      lineHeight: effectiveLineHeight 
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
