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
  SkipBack, SkipForward, Music, Radio, Sliders, Volume1, Bookmark,
  BookA, Trash2, HelpCircle, Download, FileText, CheckCheck, Lightbulb
} from 'lucide-react';
import { getCachedBook } from '@/utils/offlineStorage';
import { getAuthenticBookChapters, AuthenticBookChapter } from '@/utils/authenticBookContent';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { stripHtml } from '@/utils/textSanitizer';
import { 
  transliterateScript, 
  lookupLiteraryWord,
  WordDefinition,
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

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  romanization?: string;
  partOfSpeech?: string;
  sourceBook?: string;
  language?: string;
  dateAdded: string;
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
  { code: 'ur', name: 'Urdu (اردو)', isRtl: true, font: "'Noto Nastaliq Urdu', serif", flag: '🇵🇰' },
  { code: 'en', name: 'English', isRtl: false, font: 'Georgia, serif', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic (العربية)', isRtl: true, font: "'Amiri', serif", flag: '🇸🇦' },
  { code: 'fa', name: 'Persian (فارسی)', isRtl: true, font: "'Amiri', serif", flag: '🇮🇷' },
  { code: 'hi', name: 'Hindi (हिन्दी)', isRtl: false, font: "'Inter', sans-serif", flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (Español)', isRtl: false, font: 'Georgia, serif', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', isRtl: false, font: 'Georgia, serif', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', isRtl: false, font: 'Georgia, serif', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian (Русский)', isRtl: false, font: "'Lora', serif", flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese (中文)', isRtl: false, font: "'Inter', sans-serif", flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese (日本語)', isRtl: false, font: "'Inter', sans-serif", flag: '🇯🇵' },
  { code: 'tr', name: 'Turkish (Türkçe)', isRtl: false, font: 'Georgia, serif', flag: '🇹🇷' },
  { code: 'pt', name: 'Portuguese (Português)', isRtl: false, font: 'Georgia, serif', flag: '🇧🇷' },
  { code: 'it', name: 'Italian (Italiano)', isRtl: false, font: 'Georgia, serif', flag: '🇮🇹' },
  { code: 'bn', name: 'Bengali (বাংলা)', isRtl: false, font: "'Inter', sans-serif", flag: '🇧🇩' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ / پنجابی)', isRtl: false, font: "'Inter', sans-serif", flag: '🇵🇰' },
  { code: 'ko', name: 'Korean (한국어)', isRtl: false, font: "'Inter', sans-serif", flag: '🇰🇷' },
  { code: 'nl', name: 'Dutch (Nederlands)', isRtl: false, font: 'Georgia, serif', flag: '🇳🇱' },
  { code: 'la', name: 'Latin (Latina)', isRtl: false, font: "Georgia, serif", flag: '🏛️' }
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
  
  // View Modes: 'reader' (Authentic Text), 'transliterated' (Roman Script), 'bilingual' (Dual View), 'translated' (Single Translated), 'epub' (Raw EPUB), 'archive' (IA Embed), 'google' (Google Books Viewer)
  const [currentViewMode, setCurrentViewMode] = useState<'reader' | 'transliterated' | 'bilingual' | 'translated' | 'epub' | 'archive' | 'google'>(() => {
    if (iaId && (!bookUrl || readMode === 'archive')) return 'archive';
    return 'reader';
  });

  // Dual View Mode Type & Layout Style
  const [bilingualModeType, setBilingualModeType] = useState<'transliteration' | 'translation'>('translation');
  const [bilingualLayout, setBilingualLayout] = useState<'columns' | 'interlinear'>('columns');

  // Reading Modes: 'paginated' (One chapter at a time) or 'continuous' (All chapters flowing)
  const [scrollMode, setScrollMode] = useState<'paginated' | 'continuous'>('paginated');

  // Drawer and Modal States
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangStudioOpen, setIsLangStudioOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected Language Script & Typography Style Preset
  const [selectedScriptId, setSelectedScriptId] = useState<string>('auto');

  // Translation States
  const [targetLang, setTargetLang] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, { chapter: string; text: string; paragraphs: { original: string; translated: string }[] }>>({});
  const [copied, setCopied] = useState(false);

  // Instant Floating Word Selection Popover State
  const [selectionPopover, setSelectionPopover] = useState<{
    word: string;
    x: number;
    y: number;
    translation?: string;
    romanization?: string;
    dictionary?: WordDefinition | null;
    isTranslating?: boolean;
    isSaved?: boolean;
  } | null>(null);

  // Vocabulary Notebook State
  const [savedVocabulary, setSavedVocabulary] = useState<VocabularyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('quillhawk-vocabulary-notebook') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  const [vocabSearchFilter, setVocabSearchFilter] = useState('');
  const [vocabLangFilter, setVocabLangFilter] = useState('');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Audio Narration & TTS States
  const [isAudioBarOpen, setIsAudioBarOpen] = useState(false);
  const [narrationLang, setNarrationLang] = useState<string>('auto');
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);
  const [narrationPitch, setNarrationPitch] = useState<number>(1.0);
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
  const isBookArabic = Boolean(
    title?.match(/[\u0600-\u06FF]/) && (title?.includes('أ') || title?.includes('ة') || title?.includes('ي') || title?.includes('ك'))
  );

  const isBookRtl = isBookUrdu || isBookArabic;
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
    if (isBookArabic) {
      return LANGUAGE_SCRIPT_STYLES.find(s => s.id === 'arabic-amiri') || null;
    }
    return null;
  }, [selectedScriptId, isBookUrdu, isBookHindi, isBookArabic]);

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

  // Save Vocabulary Notebook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quillhawk-vocabulary-notebook', JSON.stringify(savedVocabulary));
      } catch (e) {}
    }
  }, [savedVocabulary]);

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
    setSelectionPopover(null);
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

  // Real-time Chapter Translation Fetcher
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

  // Handle Text Selection for Floating Word Translator Popover
  const handleTextSelection = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length > 250) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - (containerRect?.left || 0);
    const y = rect.top - (containerRect?.top || 0) - 10;

    // Check built-in literary dictionary first
    const dictEntry = lookupLiteraryWord(selectedText);
    const roman = transliterateScript(selectedText);
    const isAlreadySaved = savedVocabulary.some(v => v.word.toLowerCase() === selectedText.toLowerCase());

    setSelectionPopover({
      word: selectedText,
      x: Math.max(140, Math.min(x, (containerRect?.width || window.innerWidth) - 160)),
      y: Math.max(60, y),
      romanization: roman !== selectedText ? roman : undefined,
      dictionary: dictEntry,
      translation: dictEntry?.translation || undefined,
      isTranslating: !dictEntry,
      isSaved: isAlreadySaved
    });

    if (!dictEntry) {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: selectedText, targetLang: targetLang || 'en' })
        });
        if (res.ok) {
          const data = await res.json();
          setSelectionPopover(prev => prev ? {
            ...prev,
            translation: data.translatedText || selectedText,
            romanization: data.romanization || prev.romanization,
            dictionary: data.dictionary || prev.dictionary,
            isTranslating: false
          } : null);
        }
      } catch {
        setSelectionPopover(prev => prev ? { ...prev, isTranslating: false } : null);
      }
    }
  }, [savedVocabulary, targetLang]);

  // Save Word to Vocabulary Notebook
  const handleSaveToVocabulary = (word: string, translation?: string, roman?: string, partOfSpeech?: string) => {
    if (!word) return;
    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      word: word.trim(),
      translation: translation || 'Saved term',
      romanization: roman,
      partOfSpeech: partOfSpeech,
      sourceBook: title || 'Literary Catalog',
      language: isBookUrdu ? 'Urdu' : (isBookHindi ? 'Hindi' : (isBookArabic ? 'Arabic' : 'Literary')),
      dateAdded: new Date().toLocaleDateString()
    };

    setSavedVocabulary(prev => [newItem, ...prev.filter(v => v.word.toLowerCase() !== word.toLowerCase())]);
    if (selectionPopover) {
      setSelectionPopover(prev => prev ? { ...prev, isSaved: true } : null);
    }
  };

  // Speak single word in native pronunciation
  const handleSpeakWord = (word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const langCode = isBookUrdu ? 'ur' : (isBookHindi ? 'hi' : (isBookArabic ? 'ar' : 'en'));
    const bestVoice = getBestVoiceForLanguage(langCode, voices);
    if (bestVoice) utterance.voice = bestVoice;
    window.speechSynthesis.speak(utterance);
  };

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

    let textToSpeak = currentChapterObj.text;
    let speakLang = isBookUrdu ? 'ur' : (isBookHindi ? 'hi' : (isBookArabic ? 'ar' : 'en'));

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
    isBookArabic, 
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

  // Filtered Vocabulary items
  const filteredVocabulary = useMemo(() => {
    return savedVocabulary.filter(v => {
      const matchesSearch = !vocabSearchFilter || 
        v.word.toLowerCase().includes(vocabSearchFilter.toLowerCase()) || 
        v.translation.toLowerCase().includes(vocabSearchFilter.toLowerCase());
      const matchesLang = !vocabLangFilter || v.language === vocabLangFilter;
      return matchesSearch && matchesLang;
    });
  }, [savedVocabulary, vocabSearchFilter, vocabLangFilter]);

  const currentTransData = translationCache[`${fallbackPage - 1}::${targetLang}`];
  const totalWords = useMemo(() => activeChapters.reduce((acc, c) => acc + (c.text?.split(/\s+/).length || 0), 0), [activeChapters]);
  const estimatedReadTimeMins = Math.max(1, Math.round(totalWords / 200));

  return (
    <div className={`flex flex-col h-full ${styles.bg} ${styles.text} border ${styles.border} rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in duration-300`}>
      {/* Global Fonts Inject */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fira+Code&family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap" />

      {/* Reader Header Bar */}
      <div className={`h-16 ${styles.headerBg} backdrop-blur-md border-b ${styles.border} flex items-center justify-between px-3 md:px-6 z-20 flex-shrink-0 gap-2 ${styles.text}`}>
        
        {/* Left: Book Meta & Chapters Button */}
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

        {/* Center: Reading & Translation Mode Pills */}
        <div className={`hidden lg:flex items-center gap-1 ${styles.buttonBg}/60 p-1 rounded-xl border ${styles.buttonBorder}`}>
          {/* 1. Authentic Original Text */}
          <button
            onClick={() => setCurrentViewMode('reader')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'reader' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="Read in original language and authentic text"
          >
            <BookOpen className="w-3 h-3" />
            <span>Original</span>
          </button>

          {/* 2. Roman Script Transliteration */}
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

          {/* 3. Dual Bilingual View */}
          <button
            onClick={() => setCurrentViewMode('bilingual')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              currentViewMode === 'bilingual' 
                ? 'bg-primary text-white shadow' 
                : `${styles.mutedText} hover:${styles.text}`
            }`}
            title="Side-by-Side or Interlinear Dual View"
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
        </div>

        {/* Right: Translation Studio, Vocab Notebook, Narration, and Typography */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          
          {/* Translation & Script Studio Drawer Trigger */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setIsLangStudioOpen(!isLangStudioOpen)}
            className={`text-xs font-bold px-2.5 py-1.5 gap-1.5 border transition-all ${
              isLangStudioOpen 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30' 
                : `${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`
            }`}
            title="Open Multi-Language & Translation Studio"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Translation Studio</span>
          </Button>

          {/* Personal Vocabulary Notebook Trigger */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setIsVocabModalOpen(true)}
            className={`text-xs font-bold px-2.5 py-1.5 gap-1.5 border relative ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
            title="Open Vocabulary Notebook (ذخیرہ الفاظ)"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Vocab ({savedVocabulary.length})</span>
            {savedVocabulary.length > 0 && (
              <span className="md:hidden w-2 h-2 bg-amber-500 rounded-full absolute top-1 right-1" />
            )}
          </Button>

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
            title="Listen to chapter with intelligent multi-language voice"
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

          {/* Search button */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className={`p-1.5 rounded-xl border transition ${isSearchOpen ? 'bg-primary text-white border-primary' : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`}`}
            title="Search inside book"
          >
            <Search className="w-4 h-4" />
          </button>

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

      {/* Floating Interactive Word Translation Popover (On Text Selection) */}
      {selectionPopover && (
        <div 
          className="absolute z-40 bg-slate-950/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl p-4 w-72 md:w-80 backdrop-blur-xl animate-in zoom-in-95 duration-150 transform -translate-x-1/2"
          style={{ left: `${selectionPopover.x}px`, top: `${selectionPopover.y}px` }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/60">
                  Instant Translator
                </span>
                {selectionPopover.dictionary?.partOfSpeech && (
                  <span className="text-[10px] text-slate-400 italic">({selectionPopover.dictionary.partOfSpeech})</span>
                )}
              </div>
              <h4 className="font-bold text-base text-white mt-1 truncate">{selectionPopover.word}</h4>
              {selectionPopover.romanization && (
                <p className="text-xs text-amber-400 font-mono italic">[{selectionPopover.romanization}]</p>
              )}
            </div>
            <button 
              onClick={() => setSelectionPopover(null)} 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Translation Result */}
          <div className="space-y-2 mb-3">
            {selectionPopover.isTranslating ? (
              <div className="flex items-center gap-2 py-2 text-xs text-indigo-300">
                <div className="animate-spin w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full" />
                <span>Translating via AI engine...</span>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Meaning / Translation:</span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
                  {selectionPopover.translation || 'No translation available.'}
                </p>
              </div>
            )}

            {selectionPopover.dictionary?.culturalNote && (
              <div className="bg-amber-950/30 border border-amber-800/40 p-2 rounded-lg text-[11px] text-amber-200/90 leading-tight flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectionPopover.dictionary.culturalNote}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => handleSpeakWord(selectionPopover.word)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition"
              title="Pronounce Word"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pronounce</span>
            </button>

            <button
              onClick={() => handleSaveToVocabulary(
                selectionPopover.word, 
                selectionPopover.translation, 
                selectionPopover.romanization, 
                selectionPopover.dictionary?.partOfSpeech
              )}
              disabled={selectionPopover.isSaved}
              className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition ${
                selectionPopover.isSaved 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 cursor-default' 
                  : 'bg-primary text-white hover:bg-primary/90 shadow'
              }`}
            >
              {selectionPopover.isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved in Notebook</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>+ Save to Vocab</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Language & Translation Studio Drawer */}
      {isLangStudioOpen && (
        <div className={`absolute top-16 right-0 w-full sm:w-96 h-[calc(100%-4rem)] ${styles.cardBg} border-l ${styles.cardBorder} shadow-2xl z-30 flex flex-col p-5 space-y-5 animate-in slide-in-from-right duration-200 overflow-y-auto`}>
          <div className={`flex items-center justify-between border-b ${styles.divider} pb-3`}>
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-500" />
              <h3 className={`text-sm font-black uppercase tracking-wider ${styles.headingText}`}>Translation & Script Studio</h3>
            </div>
            <button onClick={() => setIsLangStudioOpen(false)} className={`p-1 rounded-lg hover:${styles.buttonBg} ${styles.mutedText}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Target Translation Language */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Active Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className={`w-full text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl p-2.5 focus:outline-none cursor-pointer font-bold`}
            >
              {TRANSLATE_LANGUAGES.map(l => (
                <option key={`studio-lang-${l.code}`} value={l.code} className={`${styles.cardBg} ${styles.text}`}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Dual View Layout Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Dual View Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setCurrentViewMode('bilingual'); setBilingualLayout('columns'); }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  currentViewMode === 'bilingual' && bilingualLayout === 'columns'
                    ? 'bg-primary text-white border-primary shadow'
                    : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`
                }`}
              >
                <span className="block font-black">Side-by-Side</span>
                <span className="text-[10px] opacity-80">Dual column split view</span>
              </button>
              <button
                onClick={() => { setCurrentViewMode('bilingual'); setBilingualLayout('interlinear'); }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                  currentViewMode === 'bilingual' && bilingualLayout === 'interlinear'
                    ? 'bg-primary text-white border-primary shadow'
                    : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`
                }`}
              >
                <span className="block font-black">Interlinear</span>
                <span className="text-[10px] opacity-80">Paragraph-by-paragraph</span>
              </button>
            </div>
          </div>

          {/* 3. Typography & Script Style Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Calligraphy & Script Style
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedScriptId('auto')}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                  selectedScriptId === 'auto'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-black'
                    : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`
                }`}
              >
                <span>🎨 Auto-Detect Book Script</span>
                {selectedScriptId === 'auto' && <Check className="w-3.5 h-3.5" />}
              </button>
              {LANGUAGE_SCRIPT_STYLES.map(s => (
                <button
                  key={`studio-script-${s.id}`}
                  onClick={() => {
                    setSelectedScriptId(s.id);
                    setFontFamily(s.fontFamily);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between ${
                    selectedScriptId === s.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-black'
                      : `${styles.buttonBg} ${styles.buttonBorder} ${styles.mutedText} hover:${styles.text}`
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <span className="text-[10px] opacity-70 block">{s.nativeLabel}</span>
                  </div>
                  {selectedScriptId === s.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Neural Speech Synthesis Controls */}
          <div className={`p-4 rounded-2xl ${styles.paperBg} border ${styles.border} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> Voice & Narration
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">{narrationSpeed}x speed</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.75x</span>
                <span>1.0x Normal</span>
                <span>1.5x Fast</span>
              </div>
              <input 
                type="range" 
                min="0.7" 
                max="1.6" 
                step="0.1" 
                value={narrationSpeed}
                onChange={(e) => {
                  const spd = parseFloat(e.target.value);
                  setNarrationSpeed(spd);
                  narrationRef.current?.setSpeed(spd);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <Button 
              size="sm" 
              onClick={() => handleToggleNarration()}
              className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow"
            >
              {narrationState.isPlaying && !narrationState.isPaused ? 'Pause Narration' : 'Start Multi-Language Audio'}
            </Button>
          </div>

          {/* 5. Vocabulary Notebook Shortcut */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => { setIsLangStudioOpen(false); setIsVocabModalOpen(true); }}
            className={`w-full py-2.5 text-xs font-bold gap-2 ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder} ${styles.buttonHover}`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Open Vocabulary Notebook ({savedVocabulary.length} saved)</span>
          </Button>
        </div>
      )}

      {/* Vocabulary Notebook Modal (ذخیرہ الفاظ / शब्दावली) */}
      {isVocabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`max-w-2xl w-full max-h-[85vh] ${styles.cardBg} border ${styles.cardBorder} rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b ${styles.divider} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${styles.headingText}`}>Personal Vocabulary Notebook</h3>
                  <p className={`text-xs ${styles.mutedText}`}>Review terms, translations, and pronunciations saved across your readings.</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsVocabModalOpen(false); setIsFlashcardMode(false); }} 
                className={`p-2 rounded-xl hover:${styles.buttonBg} ${styles.mutedText}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Study Toggle Bar */}
            <div className={`p-4 border-b ${styles.divider} flex flex-wrap items-center justify-between gap-3 ${styles.paperBg}`}>
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className={`w-3.5 h-3.5 ${styles.mutedText}`} />
                <input 
                  type="text" 
                  placeholder="Search saved vocabulary..." 
                  value={vocabSearchFilter}
                  onChange={(e) => setVocabSearchFilter(e.target.value)}
                  className={`w-full text-xs p-1.5 rounded-lg bg-transparent border-0 focus:outline-none ${styles.text}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => {
                    setIsFlashcardMode(!isFlashcardMode);
                    setActiveFlashcardIndex(0);
                    setIsFlashcardFlipped(false);
                  }}
                  className={`text-xs font-bold gap-1.5 ${
                    isFlashcardMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                      : `${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}`
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFlashcardMode ? 'List Mode' : 'Flashcard Study Mode'}</span>
                </Button>
              </div>
            </div>

            {/* Modal Body: Flashcard or List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {filteredVocabulary.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Bookmark className="w-10 h-10 text-slate-400 mx-auto opacity-40" />
                  <h4 className={`text-sm font-bold ${styles.headingText}`}>No saved words yet</h4>
                  <p className={`text-xs ${styles.mutedText} max-w-sm mx-auto`}>
                    Highlight or click any word in the book reader and click "+ Save to Vocab" to build your multi-language vocabulary list!
                  </p>
                </div>
              ) : isFlashcardMode ? (
                /* Flashcard Study Mode */
                <div className="py-6 flex flex-col items-center justify-center space-y-6">
                  {(() => {
                    const currentCard = filteredVocabulary[activeFlashcardIndex] || filteredVocabulary[0];
                    return (
                      <div className="w-full max-w-md space-y-6">
                        <div 
                          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                          className={`aspect-[4/3] w-full rounded-3xl p-8 cursor-pointer border shadow-xl flex flex-col justify-between text-center transition-all duration-300 transform hover:scale-[1.02] ${
                            isFlashcardFlipped 
                              ? 'bg-gradient-to-tr from-indigo-950 to-slate-900 border-indigo-700 text-white' 
                              : `${styles.paperBg} border-${styles.cardBorder}`
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs opacity-70">
                            <span>Card {activeFlashcardIndex + 1} of {filteredVocabulary.length}</span>
                            <span>Click to Flip 🔄</span>
                          </div>

                          <div className="space-y-3">
                            {!isFlashcardFlipped ? (
                              <>
                                <span className="text-xs uppercase tracking-widest text-primary font-black">Word</span>
                                <h3 className="text-3xl font-black">{currentCard.word}</h3>
                                {currentCard.romanization && (
                                  <p className="text-sm text-amber-500 font-mono italic">[{currentCard.romanization}]</p>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs uppercase tracking-widest text-emerald-400 font-black">Meaning</span>
                                <h3 className="text-2xl font-bold text-slate-100">{currentCard.translation}</h3>
                                <p className="text-xs text-slate-400 italic">From: {currentCard.sourceBook}</p>
                              </>
                            )}
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSpeakWord(currentCard.word); }}
                              className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                              title="Listen Pronunciation"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Flashcard Navigation */}
                        <div className="flex items-center justify-between gap-3">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            disabled={activeFlashcardIndex === 0}
                            onClick={() => { setActiveFlashcardIndex(prev => Math.max(0, prev - 1)); setIsFlashcardFlipped(false); }}
                            className={`text-xs font-bold ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}`}
                          >
                            ← Previous
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            disabled={activeFlashcardIndex === filteredVocabulary.length - 1}
                            onClick={() => { setActiveFlashcardIndex(prev => Math.min(filteredVocabulary.length - 1, prev + 1)); setIsFlashcardFlipped(false); }}
                            className={`text-xs font-bold ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}`}
                          >
                            Next Card →
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Vocabulary List View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredVocabulary.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-2xl ${styles.paperBg} border ${styles.border} space-y-2 flex flex-col justify-between shadow-sm hover:border-primary/40 transition`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`text-base font-black ${styles.headingText}`}>{item.word}</h4>
                          {item.romanization && (
                            <p className="text-xs text-amber-500 font-mono italic">[{item.romanization}]</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleSpeakWord(item.word)}
                            className={`p-1.5 rounded-lg hover:${styles.buttonBg} text-emerald-500`}
                            title="Pronounce"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setSavedVocabulary(prev => prev.filter(v => v.id !== item.id))}
                            className={`p-1.5 rounded-lg hover:${styles.buttonBg} text-rose-400`}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl ${styles.buttonBg}/60 text-xs font-semibold ${styles.text}`}>
                        {item.translation}
                      </div>

                      <div className={`flex justify-between items-center text-[10px] ${styles.mutedText} pt-1`}>
                        <span className="truncate max-w-[140px]">📖 {item.sourceBook}</span>
                        <span>{item.dateAdded}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t ${styles.divider} flex justify-between items-center text-xs ${styles.mutedText}`}>
              <span>{savedVocabulary.length} words saved in your literary notebook</span>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => { setIsVocabModalOpen(false); setIsFlashcardMode(false); }}
                className={`text-xs font-bold ${styles.buttonBg} ${styles.buttonText} ${styles.buttonBorder}`}
              >
                Close Notebook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading View Area */}
      <div 
        ref={containerRef}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
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
          /* 2. Roman Script Transliterated View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-10 px-4 md:px-12 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              
              <div className={`p-3.5 rounded-2xl ${styles.paperBg} border ${styles.border} flex items-center justify-between gap-3 shadow-sm`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${styles.headingText}`}>Roman Script Transliteration</h4>
                    <p className={`text-[11px] ${styles.mutedText}`}>100% authentic words and poetic phrasing preserved in phonetic Latin letters — 0 machine translations.</p>
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
          /* 3. Side-by-Side OR Interlinear Dual View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-8 px-4 md:px-10 flex flex-col space-y-6`}>
            <div className={`flex flex-col md:flex-row items-center justify-between gap-4 border-b ${styles.divider} pb-4 max-w-6xl mx-auto w-full`}>
              
              {/* Dual View Mode Switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex p-1 rounded-xl ${styles.buttonBg} border ${styles.buttonBorder}`}>
                  <button
                    onClick={() => setBilingualModeType('translation')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bilingualModeType === 'translation'
                        ? 'bg-primary text-white shadow'
                        : `${styles.mutedText} hover:${styles.text}`
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Translation</span>
                  </button>
                  <button
                    onClick={() => setBilingualModeType('transliteration')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      bilingualModeType === 'transliteration'
                        ? 'bg-primary text-white shadow'
                        : `${styles.mutedText} hover:${styles.text}`
                    }`}
                  >
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    <span>Roman Script</span>
                  </button>
                </div>

                <div className={`inline-flex p-1 rounded-xl ${styles.buttonBg} border ${styles.buttonBorder}`}>
                  <button
                    onClick={() => setBilingualLayout('columns')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${bilingualLayout === 'columns' ? 'bg-primary text-white' : styles.mutedText}`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setBilingualLayout('interlinear')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${bilingualLayout === 'interlinear' ? 'bg-primary text-white' : styles.mutedText}`}
                  >
                    Interlinear
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
                    className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-bold`}
                  >
                    {TRANSLATE_LANGUAGES.map(l => (
                      <option key={`bi-lang-${l.code}`} value={l.code} className={`${styles.cardBg} ${styles.text}`}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={fallbackPage}
                  onChange={(e) => setFallbackPage(Number(e.target.value))}
                  className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-[180px] truncate font-bold`}
                >
                  {activeChapters.map((ch, idx) => (
                    <option key={`ch-bilingual-${idx}`} value={idx + 1} className={`${styles.cardBg} ${styles.text}`}>
                      {ch.chapter || `Chapter ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interlinear Layout */}
            {bilingualLayout === 'interlinear' ? (
              <div className="max-w-4xl mx-auto w-full space-y-8 pt-4">
                <div className={`p-5 rounded-2xl ${styles.paperBg} border ${styles.border} text-center`}>
                  <h3 className={`text-xl md:text-2xl font-black ${styles.headingText}`} style={{ fontFamily: effectiveFontFamily }}>
                    {currentChapterObj.chapter}
                  </h3>
                  {bilingualModeType === 'translation' && currentTransData?.chapter && (
                    <p className="text-sm font-bold text-primary mt-1">
                      {currentTransData.chapter}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {currentChapterObj.text.split(/\n\s*\n/).filter(p => p.trim()).map((para, pIdx) => {
                    const translatedPara = currentTransData?.paragraphs?.[pIdx]?.translated;
                    const translitPara = transliterateScript(para);

                    return (
                      <div key={`interlinear-${pIdx}`} className={`p-6 rounded-2xl ${styles.paperBg} border ${styles.border} shadow-sm space-y-4`}>
                        {/* Original paragraph */}
                        <div 
                          className={`leading-relaxed ${effectiveIsRtl ? 'text-right' : 'text-justify'}`}
                          dir={effectiveIsRtl ? 'rtl' : 'ltr'}
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            fontFamily: effectiveFontFamily,
                            lineHeight: effectiveLineHeight 
                          }}
                        >
                          {para}
                        </div>

                        {/* Interlinear translated or transliterated subtitle */}
                        <div className={`p-4 rounded-xl ${styles.cardBg} border ${styles.cardBorder} space-y-1`}>
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                            {bilingualModeType === 'translation' ? `Translation (${TRANSLATE_LANGUAGES.find(l => l.code === targetLang)?.name})` : 'Roman Script Transliteration'}
                          </span>
                          <p className="text-sm font-medium text-slate-300 leading-relaxed">
                            {bilingualModeType === 'translation' ? (translatedPara || (isTranslating ? 'Translating paragraph...' : para)) : translitPara}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Side-by-Side Dual Column Grid */
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
                          <span>Roman Script (Phonetic Letters)</span>
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
            )}

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
          /* 6. Default Reflowable Full Book View */
          <div className={`w-full min-h-full ${styles.bg} ${styles.text} py-10 px-4 md:px-12 flex flex-col transition-colors duration-300 border-0`}>
            <div className="max-w-3xl mx-auto flex-1 flex flex-col justify-between space-y-8 w-full">
              
              {scrollMode === 'continuous' ? (
                /* Continuous Scroll View */
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
                /* Paginated View */
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
                      className={`text-xs ${styles.buttonBg} border ${styles.buttonBorder} ${styles.buttonText} rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[150px] md:max-w-[220px] truncate font-bold`}
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
