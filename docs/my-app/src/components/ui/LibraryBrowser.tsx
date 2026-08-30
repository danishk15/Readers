'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { Modal } from '@/components/ui/Modal';
import { 
  Search, Globe, Award, Sparkles, FolderOpen, ArrowRight, Lock, 
  BookOpen, Star, Sparkle, LayoutGrid, Library, Download, CheckCircle2,
  Languages, Type, Volume2, Bookmark, RefreshCw, Send, Check, X, Filter
} from 'lucide-react';
import { saveBookOffline, getCachedBook, isBookCached, deleteCachedBook, getAllCachedBooks } from '@/utils/offlineStorage';
import { stripHtml } from '@/utils/textSanitizer';
import { transliterateScript, lookupLiteraryWord } from '@/utils/transliteration';

function getOnlineBookReadParams(book: any) {
  const title = stripHtml(book.volumeInfo?.title || book.title || 'Unknown Title');
  const author = stripHtml(book.volumeInfo?.authors?.[0] || book.author || 'Unknown Author');
  const description = stripHtml(book.volumeInfo?.description || book.description || 'A curated literary work available in the QuillHawk catalog.');
  const id = book.id || book.title;
  const iaId = book.accessInfo?.ia || (String(book.id || '').startsWith('ia-') ? String(book.id).replace('ia-', '') : undefined);
  const previewLink = book.volumeInfo?.previewLink || book.previewLink;
  const infoLink = book.volumeInfo?.infoLink || book.infoLink;
  const readMode = book.readMode || (book.file_url ? 'epub' : (iaId ? 'archive' : (book.source === 'Google Books' ? 'google' : 'interactive')));

  let fileUrl = book.file_url || '';
  if (!fileUrl && book.accessInfo?.epub?.downloadLink) {
    fileUrl = book.accessInfo.epub.downloadLink;
  } else if (!fileUrl && String(book.id || '').startsWith('gutendex-')) {
    const gutenId = String(book.id).replace('gutendex-', '');
    fileUrl = `https://www.gutenberg.org/ebooks/${gutenId}.epub.noimages`;
  } else if (!fileUrl && iaId) {
    fileUrl = `https://archive.org/download/${iaId}/${iaId}.epub`;
  }

  return {
    url: fileUrl,
    title,
    author,
    description,
    id,
    source: book.source || 'QuillHawk',
    readMode,
    iaId,
    previewLink,
    infoLink
  };
}

interface LocalBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  file_url: string;
  is_premium: boolean;
  language?: string;
  is_original?: boolean;
  is_translation?: boolean;
  original_language?: string;
  translated_to?: string;
}

interface LibraryBrowserProps {
  initialBooks: LocalBook[];
  userId: string;
}

interface OnlineBook {
  id: string;
  isOpenLibrary?: boolean;
  source?: string;
  isPremium?: boolean;
  price?: string;
  is_original?: boolean;
  is_translation?: boolean;
  original_language?: string;
  translated_to?: string;
  language?: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string | null;
    } | null;
    infoLink?: string;
    previewLink?: string;
    language?: string;
  };
  accessInfo?: {
    ia?: string | null;
    epub?: {
      downloadLink: string | null;
    } | null;
  } | null;
}

export const WORLD_LANGUAGES_HUB = [
  { code: 'urd', name: 'Urdu', native: 'اردو', flag: '🇵🇰', authors: 'Mirza Ghalib, Allama Iqbal, Manto, Bano Qudsia', desc: 'Lyrical Ghazals, profound philosophy, and rich South Asian prose.', script: 'Nastaliq', gradient: 'from-emerald-600/25 via-teal-900/25 to-emerald-950/40', border: 'border-emerald-500/40', textAccent: 'text-emerald-400' },
  { code: 'ara', name: 'Arabic', native: 'العربية', flag: '🇸🇦', authors: '1001 Nights, Kahlil Gibran, Ibn Tufail, Al-Mutanabbi', desc: 'Majestic classical literature, wisdom parables, and celestial poetry.', script: 'Amiri Naskh', gradient: 'from-amber-600/25 via-orange-900/25 to-amber-950/40', border: 'border-amber-500/40', textAccent: 'text-amber-400' },
  { code: 'hin', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', authors: 'Munshi Premchand, Dinkar, Bachchan, Mohan Rakesh', desc: 'Timeless social realism, epic verse, and evocative storytelling.', script: 'Devanagari', gradient: 'from-orange-600/25 via-rose-900/25 to-orange-950/40', border: 'border-orange-500/40', textAccent: 'text-orange-400' },
  { code: 'per', name: 'Persian', native: 'فارسی', flag: '🇮🇷', authors: 'Mawlana Rumi, Hafez Shirazi, Saadi, Omar Khayyam', desc: 'Transcendent Sufi poetry, divine longing, and mystical epics.', script: 'Shekasteh', gradient: 'from-blue-600/25 via-indigo-900/25 to-blue-950/40', border: 'border-blue-500/40', textAccent: 'text-blue-400' },
  { code: 'spa', name: 'Spanish', native: 'Español', flag: '🇪🇸', authors: 'Miguel de Cervantes, García Márquez, Lorca', desc: 'Golden Age chivalry, romantic lyrical poems, and magical realism.', script: 'Latin Serif', gradient: 'from-red-600/25 via-rose-900/25 to-red-950/40', border: 'border-red-500/40', textAccent: 'text-red-400' },
  { code: 'fre', name: 'French', native: 'Français', flag: '🇫🇷', authors: 'Victor Hugo, Saint-Exupéry, Dumas, Jules Verne', desc: 'Philosophical wonder, high romanticism, and timeless adventure.', script: 'Garamond', gradient: 'from-indigo-600/25 via-blue-900/25 to-indigo-950/40', border: 'border-indigo-500/40', textAccent: 'text-indigo-400' },
  { code: 'ger', name: 'German', native: 'Deutsch', flag: '🇩🇪', authors: 'Goethe, Franz Kafka, Nietzsche, Rilke', desc: 'Existential dramas, Faustian striving, and philosophical depth.', script: 'Modern Serif', gradient: 'from-yellow-600/25 via-amber-900/25 to-yellow-950/40', border: 'border-yellow-500/40', textAccent: 'text-yellow-400' },
  { code: 'rus', name: 'Russian', native: 'Русский', flag: '🇷🇺', authors: 'Leo Tolstoy, Fyodor Dostoevsky, Chekhov, Pushkin', desc: 'Grand psychological epics, soul-searching moral dilemmas, and intense drama.', script: 'Cyrillic', gradient: 'from-sky-600/25 via-blue-900/25 to-sky-950/40', border: 'border-sky-500/40', textAccent: 'text-sky-400' },
  { code: 'eng', name: 'English', native: 'English', flag: '🇬🇧', authors: 'Shakespeare, Jane Austen, Fitzgerald, Shelley', desc: 'Global canon, gothic romances, and universal masterpieces.', script: 'Oxford Serif', gradient: 'from-purple-600/25 via-violet-900/25 to-purple-950/40', border: 'border-purple-500/40', textAccent: 'text-purple-400' },
  { code: 'chi', name: 'Chinese', native: '中文', flag: '🇨🇳', authors: 'Laozi, Confucius, Sun Tzu, Cao Xueqin', desc: 'Ancient Taoist wisdom, classical verses, and sweeping dynasty epics.', script: 'Hanzi', gradient: 'from-rose-600/25 via-red-900/25 to-rose-950/40', border: 'border-rose-500/40', textAccent: 'text-rose-400' },
  { code: 'jpn', name: 'Japanese', native: '日本語', flag: '🇯🇵', authors: 'Murasaki Shikibu, Akutagawa, Natsume Soseki', desc: 'Delicate aesthetic observations, psychological mastery, and poetic haiku.', script: 'Kanji / Kana', gradient: 'from-pink-600/25 via-rose-900/25 to-pink-950/40', border: 'border-pink-500/40', textAccent: 'text-pink-400' },
  { code: 'tur', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', authors: 'Yunus Emre, Nazım Hikmet, Orhan Pamuk', desc: 'Sufi folk verses, Anatolian narratives, and bridge of East-West literature.', script: 'Latin', gradient: 'from-cyan-600/25 via-teal-900/25 to-cyan-950/40', border: 'border-cyan-500/40', textAccent: 'text-cyan-400' },
  { code: 'ben', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', authors: 'Rabindranath Tagore, Kazi Nazrul Islam', desc: 'Nobel-laureate lyrical spirituality and progressive poetry.', script: 'Eastern Nagari', gradient: 'from-emerald-600/25 via-green-900/25 to-emerald-950/40', border: 'border-emerald-500/40', textAccent: 'text-emerald-400' },
  { code: 'pan', name: 'Punjabi', native: 'ਪੰਜਾਬੀ / پنجابی', flag: '🇵🇰', authors: 'Waris Shah, Bulleh Shah, Amrita Pritam', desc: 'Epic romantic Qissas, Sufi Kaafis, and heart-stirring folk lyrics.', script: 'Shahmukhi', gradient: 'from-amber-600/25 via-orange-900/25 to-amber-950/40', border: 'border-amber-500/40', textAccent: 'text-amber-400' },
  { code: 'ita', name: 'Italian', native: 'Italiano', flag: '🇮🇹', authors: 'Dante Alighieri, Boccaccio, Petrarca', desc: 'Renaissance sonnets, Divine Comedy, and humanist philosophy.', script: 'Italian Serif', gradient: 'from-green-600/25 via-emerald-900/25 to-green-950/40', border: 'border-green-500/40', textAccent: 'text-green-400' },
  { code: 'lat', name: 'Latin', native: 'Latina', flag: '🏛️', authors: 'Marcus Aurelius, Cicero, Seneca, Virgil', desc: 'Stoic resilience, timeless oratory, and foundation of world thought.', script: 'Classical Roman', gradient: 'from-amber-700/25 via-stone-900/25 to-stone-950/40', border: 'border-amber-600/40', textAccent: 'text-amber-300' }
];

export function getBookLanguageBadge(book: any) {
  const lang = (book.language || book.volumeInfo?.language || 'en').toLowerCase().slice(0, 2);
  const isOrig = book.is_original !== false && !book.is_translation;
  const transTo = book.translated_to;

  const map: Record<string, { flag: string; name: string }> = {
    ur: { flag: '🇵🇰', name: 'Urdu (اردو)' },
    hi: { flag: '🇮🇳', name: 'Hindi (हिन्दी)' },
    ar: { flag: '🇸🇦', name: 'Arabic (العربية)' },
    fa: { flag: '🇮🇷', name: 'Persian (فارسی)' },
    es: { flag: '🇪🇸', name: 'Spanish (Español)' },
    fr: { flag: '🇫🇷', name: 'French (Français)' },
    de: { flag: '🇩🇪', name: 'German (Deutsch)' },
    ru: { flag: '🇷🇺', name: 'Russian (Русский)' },
    en: { flag: '🇬🇧', name: 'English' },
    zh: { flag: '🇨🇳', name: 'Chinese (中文)' },
    ja: { flag: '🇯🇵', name: 'Japanese (日本語)' },
    tr: { flag: '🇹🇷', name: 'Turkish (Türkçe)' },
    bn: { flag: '🇧🇩', name: 'Bengali (বাংলা)' },
    pa: { flag: '🇵🇰', name: 'Punjabi (پنجابی)' },
    it: { flag: '🇮🇹', name: 'Italian (Italiano)' },
    pt: { flag: '🇧🇷', name: 'Portuguese (Português)' },
    la: { flag: '🏛️', name: 'Latin (Latina)' }
  };

  const meta = map[lang] || { flag: '🌐', name: lang.toUpperCase() };

  return {
    ...meta,
    isOriginal: isOrig,
    translatedTo: transTo
  };
}

export default function LibraryBrowser({ initialBooks, userId }: LibraryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'languages' | 'device' | 'premium'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [isBgLoading, setIsBgLoading] = useState(false);
  
  // Interactive Translation Studio Sandbox States
  const [sandboxText, setSandboxText] = useState('ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے');
  const [sandboxSourceLang, setSandboxSourceLang] = useState('auto');
  const [sandboxTargetLang, setSandboxTargetLang] = useState('en');
  const [sandboxResult, setSandboxResult] = useState<{ translatedText?: string; romanization?: string; dictionary?: any } | null>({
    translatedText: 'Thousands of desires, each desire worth dying for...',
    romanization: 'Hazaron khwahishein aisi ke har khwahish pe dam nikle'
  });
  const [isSandboxTranslating, setIsSandboxTranslating] = useState(false);
  const [selectedHubLang, setSelectedHubLang] = useState<string>('');

  const [layoutMode, setLayoutMode] = useState<'grid' | 'shelf' | 'dome'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('quillhawk-layout-mode') as 'grid' | 'shelf' | 'dome') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quillhawk-layout-mode', layoutMode);
    }
  }, [layoutMode]);

  const searchCache = useRef<Record<string, OnlineBook[]>>({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('quillhawk-search-cache');
      if (stored) {
        searchCache.current = JSON.parse(stored);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  const [weeklyMinutes, setWeeklyMinutes] = useState(25);
  const [localPublishedBooks, setLocalPublishedBooks] = useState<any[]>([]);
  const [localAddedBooks, setLocalAddedBooks] = useState<any[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState(true);

  // Offline storage states
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [downloadingBookIds, setDownloadingBookIds] = useState<string[]>([]);

  const updateOfflineStatus = useCallback(async () => {
    try {
      const cached = await getAllCachedBooks();
      setDownloadedBookIds(cached.map(b => b.id));
    } catch (err) {
      console.warn('Failed to retrieve offline books list:', err);
    }
  }, []);

  useEffect(() => {
    updateOfflineStatus();
  }, [updateOfflineStatus, activeTab, localAddedBooks]);

  const triggerOfflineDownload = async (
    id: string,
    title: string,
    author: string,
    cover: string,
    fileUrl: string
  ) => {
    if (!fileUrl || fileUrl.includes('googleId') || fileUrl.includes('google') || fileUrl.includes('archive.org/stream')) {
      return;
    }
    setDownloadingBookIds(prev => [...prev, id]);
    try {
      await saveBookOffline(id, title, author, cover, fileUrl);
      setDownloadedBookIds(prev => {
        if (!prev.includes(id)) return [...prev, id];
        return prev;
      });
      alert(`"${title}" is now downloaded and available offline!`);
    } catch (err: any) {
      console.error('Failed to download book:', err);
      alert(`Could not download "${title}" for offline reading: ${err.message}`);
    } finally {
      setDownloadingBookIds(prev => prev.filter(x => x !== id));
    }
  };

  const triggerRemoveDownload = async (id: string, title: string) => {
    try {
      await deleteCachedBook(id);
      setDownloadedBookIds(prev => prev.filter(x => x !== id));
      alert(`"${title}" offline cache removed.`);
    } catch (err) {
      console.error('Failed to remove cached book:', err);
    }
  };

  const handleStartReading = async (book: any) => {
    const isLocal = activeTab === 'local' || activeTab === 'languages' || book.file_url !== undefined;
    const title = stripHtml(isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title');
    const author = stripHtml(isLocal ? book.author : book.volumeInfo?.authors?.[0] || 'Unknown Author');
    const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
    const id = book.id || book.title;
    const description = stripHtml(isLocal ? book.description : book.volumeInfo?.description || 'No description available.');

    const cached = await getCachedBook(id);
    if (cached) {
      const blobUrl = URL.createObjectURL(cached.fileData);
      setActiveReadingBook({
        url: blobUrl,
        title,
        author,
        description,
        id,
        source: book.source || 'QuillHawk Offline Cache',
        readMode: 'epub',
        customChapters: book.chapters
      });
      return;
    }

    if (isLocal) {
      setActiveReadingBook({
        url: book.file_url,
        title,
        author,
        description,
        id,
        source: book.source || 'QuillHawk Collection',
        readMode: book.file_url ? 'epub' : 'interactive',
        customChapters: book.chapters
      });
    } else {
      const params = getOnlineBookReadParams(book);
      if (params.url && !isBookCached(id)) {
        saveBookOffline(id, title, author, cover, params.url)
          .then(() => setDownloadedBookIds(prev => [...prev, id]))
          .catch(err => console.warn('Background caching failed:', err));
      }
      setActiveReadingBook({ ...params, customChapters: book.chapters });
    }
  };

  // Detect query parameters (tab=online | tab=languages)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'online') setActiveTab('online');
      if (tab === 'languages') setActiveTab('languages');
    }
  }, []);

  // Fetch local storage published & added books
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const published = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      const added = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
      setLocalPublishedBooks(published);
      setLocalAddedBooks(added);
    }
  }, [activeTab]);

  const [activeReadingBook, setActiveReadingBook] = useState<{
    url: string;
    title: string;
    author?: string;
    description?: string;
    id?: string;
    source?: string;
    iaId?: string;
    previewLink?: string;
    infoLink?: string;
    readMode?: 'epub' | 'archive' | 'google' | 'interactive';
    customChapters?: { chapter: string; text: string }[];
  } | null>(null);

  const categories = ["Fiction", "Science Fiction", "Fantasy", "History", "Romance", "Biography", "Mystery", "Poetry", "Philosophy", "Classics"];
  const [versionType, setVersionType] = useState<'all' | 'original' | 'translation'>('all');

  const languages = [
    { code: '', label: '🌐 All Languages (تمام زبانیں)', iso6391: '', iso6392: '' },
    { code: 'urd', label: '🇵🇰 Urdu (اردو)', iso6391: 'ur', iso6392: 'urd' },
    { code: 'ara', label: '🇸🇦 Arabic (العربية)', iso6391: 'ar', iso6392: 'ara' },
    { code: 'hin', label: '🇮🇳 Hindi (हिन्दी)', iso6391: 'hi', iso6392: 'hin' },
    { code: 'per', label: '🇮🇷 Persian (فارسی)', iso6391: 'fa', iso6392: 'per' },
    { code: 'spa', label: '🇪🇸 Spanish (Español)', iso6391: 'es', iso6392: 'spa' },
    { code: 'fre', label: '🇫🇷 French (Français)', iso6391: 'fr', iso6392: 'fre' },
    { code: 'ger', label: '🇩🇪 German (Deutsch)', iso6391: 'de', iso6392: 'ger' },
    { code: 'rus', label: '🇷🇺 Russian (Русский)', iso6391: 'ru', iso6392: 'rus' },
    { code: 'eng', label: '🇬🇧 English', iso6391: 'en', iso6392: 'eng' },
    { code: 'chi', label: '🇨🇳 Chinese (中文)', iso6391: 'zh', iso6392: 'chi' },
    { code: 'jpn', label: '🇯🇵 Japanese (日本語)', iso6391: 'ja', iso6392: 'jpn' },
    { code: 'tur', label: '🇹🇷 Turkish (Türkçe)', iso6391: 'tr', iso6392: 'tur' },
    { code: 'ben', label: '🇧🇩 Bengali (বাংলা)', iso6391: 'bn', iso6392: 'ben' },
    { code: 'pan', label: '🇵🇰 Punjabi (پنجابی)', iso6391: 'pa', iso6392: 'pan' },
    { code: 'ita', label: '🇮🇹 Italian (Italiano)', iso6391: 'it', iso6392: 'ita' },
    { code: 'por', label: '🇧🇷 Portuguese (Português)', iso6391: 'pt', iso6392: 'por' },
    { code: 'lat', label: '🏛️ Latin (Latina)', iso6391: 'la', iso6392: 'lat' }
  ];

  const searchOnlineLibrary = useCallback(async (forcedQuery?: string) => {
    const queryVal = typeof forcedQuery === 'string' ? forcedQuery : debouncedSearchQuery;
    const cacheKey = `query:${queryVal || ''}|cat:${category}|lang:${language}|ver:${versionType}`;

    if (searchCache.current[cacheKey]) {
      setOnlineBooks(searchCache.current[cacheKey]);
      setIsLoadingOnline(false);
      setIsBgLoading(false);
      return;
    }

    setIsLoadingOnline(true);
    setIsBgLoading(true);
    setOnlineBooks([]);
    
    try {
      const apiUrl = `/api/books/search?q=${encodeURIComponent(queryVal || '')}&category=${encodeURIComponent(category || '')}&lang=${encodeURIComponent(language || '')}&version=${encodeURIComponent(versionType || 'all')}`;
      const apiRes = await fetch(apiUrl);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && Array.isArray(apiData.books) && apiData.books.length > 0) {
          const sanitizedBooks = apiData.books.map((b: any) => ({
            ...b,
            isPremium: false,
            price: undefined
          }));

          setOnlineBooks(sanitizedBooks);
          searchCache.current[cacheKey] = sanitizedBooks;
          try {
            sessionStorage.setItem('quillhawk-search-cache', JSON.stringify(searchCache.current));
          } catch (e) {}
          setIsLoadingOnline(false);
          setIsBgLoading(false);
          return;
        }
      }
    } catch (backendErr) {
      console.warn('Backend search API error:', backendErr);
    } finally {
      setIsLoadingOnline(false);
      setIsBgLoading(false);
    }
  }, [debouncedSearchQuery, category, language, versionType]);

  useEffect(() => {
    if (activeTab === 'online') {
      searchOnlineLibrary();
    }
  }, [activeTab, debouncedSearchQuery, category, language, versionType, searchOnlineLibrary]);

  // Live Sandbox Translation Trigger
  const handleRunSandboxTranslate = async () => {
    if (!sandboxText.trim()) return;
    setIsSandboxTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sandboxText,
          sourceLang: sandboxSourceLang,
          targetLang: sandboxTargetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxResult({
          translatedText: data.translatedText || sandboxText,
          romanization: data.romanization,
          dictionary: data.dictionary
        });
      }
    } catch (err) {
      console.error('Sandbox translate error:', err);
    } finally {
      setIsSandboxTranslating(false);
    }
  };

  const handleSpeakSandbox = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
  };

  // Merge custom published books, added global books, and default initial database books
  const allLocalBooks = [
    ...localPublishedBooks,
    ...localAddedBooks,
    ...initialBooks
  ].filter((book, idx, self) => 
    self.findIndex(b => b.title.toLowerCase() === book.title.toLowerCase() && b.author.toLowerCase() === book.author.toLowerCase()) === idx
  );

  // Client-side real-time filter of local library books
  const filteredLocalBooks = allLocalBooks.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (versionType === 'original' && (b as any).is_original === false) return false;
    if (versionType === 'translation' && (b as any).is_translation === false) return false;
    
    const activeFilterLang = activeTab === 'languages' && selectedHubLang ? selectedHubLang : language;

    if (activeFilterLang) {
      const selectedLangObj = languages.find(l => l.code === activeFilterLang);
      const lang1 = selectedLangObj?.iso6391 || '';
      const lang2 = selectedLangObj?.iso6392 || '';
      
      const bookLang = (b.language || 'en').toLowerCase();
      if (!(bookLang.startsWith(lang1.toLowerCase()) || bookLang.startsWith(lang2.toLowerCase()))) {
        return false;
      }
    }

    if (category) {
      const classicGenres: Record<string, string> = {
        'the great gatsby': 'fiction',
        'pride and prejudice': 'romance',
        'frankenstein': 'science fiction',
        'moby dick': 'fiction',
        'dracula': 'mystery',
        'bagh-o-bahar': 'romance fiction fantasy',
        'dewan-e-ghalib': 'romance poetry classic',
        'fasana-e-azad': 'fiction romance adventure',
        'qissa hatim tai': 'romance fantasy classic',
        'intikhab-e-kalam-e-mir': 'poetry romance classic'
      };
      const bookTitle = b.title.toLowerCase();
      const bookGenre = (b as any).genre || (b as any).category || classicGenres[bookTitle] || '';
      if (!bookGenre.toLowerCase().includes(category.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  if (activeReadingBook) {
    return (
      <div className="h-[calc(100vh-7rem)] w-full flex flex-col gap-4 relative animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-surface/95 backdrop-blur-md border border-card-border p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary/15 text-primary rounded-xl flex items-center justify-center font-bold shrink-0 border border-primary/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-foreground truncate max-w-sm text-sm md:text-base">{activeReadingBook.title}</h2>
              <p className="text-xs text-muted truncate">{activeReadingBook.author || 'QuillHawk Literary Edition'}</p>
            </div>
          </div>
          <Button onClick={() => setActiveReadingBook(null)} variant="secondary" size="sm" className="px-5 font-bold bg-surface border border-card-border text-foreground hover:bg-surface-hover">
            Exit Reader
          </Button>
        </div>
        <div className="flex-1 w-full relative min-h-[550px]">
          <Reader 
            bookUrl={activeReadingBook.url} 
            bookId={activeReadingBook.id || "inline-book"} 
            userId={userId} 
            title={activeReadingBook.title}
            author={activeReadingBook.author}
            description={activeReadingBook.description}
            source={activeReadingBook.source}
            iaId={activeReadingBook.iaId}
            previewLink={activeReadingBook.previewLink}
            infoLink={activeReadingBook.infoLink}
            readMode={activeReadingBook.readMode}
            customChapters={activeReadingBook.customChapters}
          />
        </div>
      </div>
    );
  }

  const chunkBooks = (booksList: any[], size: number = 5) => {
    const chunks = [];
    for (let i = 0; i < booksList.length; i += size) {
      chunks.push(booksList.slice(i, i + size));
    }
    return chunks;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style dangerouslySetInnerHTML={{__html: `
        .shelf-book-cover {
          perspective: 1000px;
          transform-style: preserve-3d;
          transform: rotateY(-14deg) translateZ(10px) skewY(1deg);
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease;
        }
        .shelf-book-container:hover .shelf-book-cover {
          transform: rotateY(0deg) translateZ(35px) skewY(0deg) scale(1.08);
        }
      `}} />
      
      {/* Floating Glass Overview Dashboard Banner */}
      <div className="relative theme-card p-6 md:p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-[-50%] right-[-10%] w-[35vw] h-[35vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[35vw] h-[35vw] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Language & Literary Hub Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400">Masterpiece.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Read authentic Urdu, Hindi, Arabic, Persian, French, German, Spanish, and World classics with instant AI translation, Roman transliteration, and audio narration.
          </p>
        </div>

        {/* Global VIP reading quest tracker */}
        <div className="w-full md:w-80 bg-slate-900/60 backdrop-blur border border-slate-800/80 p-5 rounded-2xl shadow-xl z-10">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-bold text-warning flex items-center gap-1">✨ VIP Milestone Quest</span>
            <span className="text-slate-400 font-semibold font-mono text-xs">{weeklyMinutes} / 500m</span>
          </div>
          <div className="w-full bg-slate-950/80 h-2.5 rounded-full p-0.5 border border-slate-800 overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-warning to-amber-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
              style={{ width: `${(Math.min(weeklyMinutes, 500) / 500) * 100}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal text-center">
            Log 500 minutes reading this week to claim **1 Week of Free Premium VIP!**
          </p>
        </div>
      </div>

      {/* Navigation Sub-tab Control */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 border border-slate-800/80 rounded-2xl flex-wrap">
          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'local' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('local'); setSearchQuery(''); setSelectedHubLang(''); }}
          >
            My Bookshelf
          </button>
          
          {/* Dedicated World Languages & Translation Lounge Tab */}
          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'languages' 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                : 'text-slate-400 hover:text-indigo-400'
            }`}
            onClick={() => { setActiveTab('languages'); setSearchQuery(''); }}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>World Languages (زبانیں)</span>
          </button>

          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'online' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('online'); setSearchQuery(''); setSelectedHubLang(''); }}
          >
            Global Catalog
          </button>

          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'premium' 
                ? 'bg-gradient-to-r from-warning to-amber-500 text-black shadow-lg shadow-warning/35 font-extrabold' 
                : 'text-slate-400 hover:text-warning'
            }`}
            onClick={() => { setActiveTab('premium'); setSearchQuery(''); }}
          >
            <span>👑</span>
            Premium Lounge
          </button>
        </div>

        {/* View Layout Toggle & Search Field */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          <div className="flex items-center bg-slate-950/60 p-1 border border-slate-800/80 rounded-2xl shrink-0 h-11">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${layoutMode === 'grid' ? 'bg-slate-900 text-primary shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setLayoutMode('shelf')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${layoutMode === 'shelf' ? 'bg-slate-900 text-amber-500 shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'}`}
              title="3D Bookshelf View"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </button>
          </div>

          <div className="relative w-full md:w-80 max-w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder={
                activeTab === 'online' 
                  ? 'Search millions of books, authors...' 
                  : activeTab === 'languages' 
                    ? 'Search by title, author, or script...' 
                    : 'Search bookshelf...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/80 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-200"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Category, Language, and Quick-Search Tags Filter Bar */}
      <div className="space-y-3 bg-slate-950/60 p-4 md:p-5 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setCategory('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === ''
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              All Genres
            </button>
            {categories.map((cat) => (
              <button
                key={`cat-pill-${cat}`}
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Language & Version Filters */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer hover:border-slate-700 transition shadow-inner"
            >
              {languages.map((l) => (
                <option key={`opt-filter-lang-${l.code}`} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.label}
                </option>
              ))}
            </select>

            {/* Version Type Selector */}
            <select
              value={versionType}
              onChange={(e) => setVersionType(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer hover:border-slate-700 transition shadow-inner"
            >
              <option value="all" className="bg-slate-900 text-slate-200">📚 All Editions</option>
              <option value="original" className="bg-slate-900 text-slate-200">📜 Original Text</option>
              <option value="translation" className="bg-slate-900 text-slate-200">🌐 Translations</option>
            </select>

            {(category || language || versionType !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setCategory('');
                  setLanguage('');
                  setVersionType('all');
                  setSearchQuery('');
                  setSelectedHubLang('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-950/20 transition flex items-center gap-1.5 shadow"
                title="Reset all search and genre filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick-Search Popular Book and Author Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400 pt-2 border-t border-slate-900">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Popular:</span>
          </span>
          {[
            { label: 'Mirza Ghalib', q: 'ghalib' },
            { label: 'Allama Iqbal', q: 'iqbal' },
            { label: 'Munshi Premchand', q: 'premchand' },
            { label: 'Saadat Hasan Manto', q: 'manto' },
            { label: 'Pride and Prejudice', q: 'pride and prejudice' },
            { label: 'The Great Gatsby', q: 'great gatsby' },
            { label: 'Mawlana Rumi', q: 'rumi' },
            { label: 'Dostoevsky', q: 'dostoevsky' },
            { label: '1001 Nights', q: 'arabian nights' },
            { label: 'Don Quixote', q: 'don quixote' },
            { label: 'Shakespeare', q: 'shakespeare' }
          ].map((tag) => (
            <button
              key={`tag-${tag.label}`}
              onClick={() => {
                setSearchQuery(tag.q);
                if (activeTab !== 'online' && activeTab !== 'languages') {
                  setActiveTab('online');
                }
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900/90 hover:bg-primary hover:text-white border border-slate-800/80 text-slate-300 transition shadow-sm"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* WORLD LANGUAGES & TRANSLATION SECTION */}
      {activeTab === 'languages' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Interactive World Languages Hub Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span>World Literary Traditions & Languages</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a language to browse authentic classic books, read bilingual translations, and test live AI translations.
                </p>
              </div>
              {selectedHubLang && (
                <button
                  onClick={() => setSelectedHubLang('')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-1 rounded-lg border border-indigo-500/30 bg-indigo-950/30 transition"
                >
                  ✕ Show All Languages
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {WORLD_LANGUAGES_HUB.map((hub) => {
                const isSelected = selectedHubLang === hub.code;
                const bookCount = allLocalBooks.filter(b => {
                  const bLang = (b.language || 'en').toLowerCase();
                  const targetIso = hub.code === 'urd' ? 'ur' : (hub.code === 'ara' ? 'ar' : (hub.code === 'hin' ? 'hi' : (hub.code === 'per' ? 'fa' : (hub.code === 'spa' ? 'es' : (hub.code === 'fre' ? 'fr' : (hub.code === 'ger' ? 'de' : (hub.code === 'rus' ? 'ru' : (hub.code === 'lat' ? 'la' : hub.code))))))));
                  return bLang.startsWith(targetIso);
                }).length;

                return (
                  <button
                    key={`hub-lang-${hub.code}`}
                    onClick={() => setSelectedHubLang(isSelected ? '' : hub.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between space-y-2 relative overflow-hidden group ${
                      isSelected 
                        ? `bg-gradient-to-br ${hub.gradient} ${hub.border} shadow-lg ring-2 ring-indigo-400/40 transform scale-105` 
                        : `bg-slate-950/60 border-slate-800/80 hover:${hub.border} hover:bg-slate-900/80`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{hub.flag}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                        {bookCount} {bookCount === 1 ? 'book' : 'books'}
                      </span>
                    </div>

                    <div>
                      <h4 className={`text-sm font-black text-slate-100 ${hub.textAccent}`}>{hub.name}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{hub.native}</p>
                    </div>

                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                      {hub.script}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Translation & Script Studio Sandbox */}
          <div className="bg-slate-950/80 border border-indigo-900/40 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-50%] right-[-10%] w-[30vw] h-[30vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Languages className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-Time Translation & Transliteration Sandbox</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Instant Multi-Language Translation Console
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Translate literary passages, convert to phonetic Roman script, and test pronunciations across 20+ languages.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Try Sample:</span>
                {[
                  { label: '🇵🇰 Ghalib', text: 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے', sLang: 'ur', tLang: 'en' },
                  { label: '🇮🇷 Rumi', text: 'بشنو این نی چون شکایت می‌کند از جدایی‌ها حکایت می‌کند', sLang: 'fa', tLang: 'en' },
                  { label: '🇮🇳 Premchand', text: 'यही बीस आने पैसे हैं, यही इनका गोदान है!', sLang: 'hi', tLang: 'en' },
                  { label: '🇫🇷 Saint-Exupéry', text: 'On ne voit bien qu’avec le cœur. L’essentiel est invisible pour les yeux.', sLang: 'fr', tLang: 'en' },
                  { label: '🇩🇪 Goethe', text: 'Gefühl ist alles; Name ist Schall und Rauch.', sLang: 'de', tLang: 'en' }
                ].map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => {
                      setSandboxText(sample.text);
                      setSandboxTargetLang(sample.tLang);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-300 transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation Input & Output Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Input Verse / Text:</span>
                  <button 
                    onClick={() => setSandboxText('')}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  placeholder="Type or paste any verse or literary phrase in Urdu, Arabic, Hindi, Persian, French, German, Spanish, etc..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-medium resize-none"
                />
                
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Target:</span>
                    <select
                      value={sandboxTargetLang}
                      onChange={(e) => setSandboxTargetLang(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                    >
                      {languages.filter(l => l.code).map(l => (
                        <option key={`sb-lang-${l.code}`} value={l.iso6391 || l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleRunSandboxTranslate}
                    disabled={isSandboxTranslating || !sandboxText.trim()}
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 gap-1.5"
                  >
                    {isSandboxTranslating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Translate & Analyze</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Output Result Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span>✓ Translation & Script Output</span>
                    </span>
                    {sandboxResult?.translatedText && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeakSandbox(sandboxResult.translatedText || '')}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 transition"
                          title="Pronounce Translation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {sandboxResult?.translatedText ? (
                    <div className="space-y-3">
                      <p className="text-sm md:text-base font-semibold text-slate-100 leading-relaxed">
                        "{sandboxResult.translatedText}"
                      </p>

                      {sandboxResult.romanization && (
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
                            Phonetic Roman Script Transliteration:
                          </span>
                          <p className="text-xs text-amber-300/90 font-mono italic">
                            {sandboxResult.romanization}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      Enter a verse and click "Translate & Analyze" to see real-time multilingual output!
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-850 pt-2">
                  <span>Powered by QuillHawk Neural Translation & Lexicon Engine</span>
                  <span className="font-mono">AI Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Language Context Banner if a Hub tile is selected */}
          {selectedHubLang && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {WORLD_LANGUAGES_HUB.find(h => h.code === selectedHubLang)?.flag}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Showing Books in {WORLD_LANGUAGES_HUB.find(h => h.code === selectedHubLang)?.name} ({WORLD_LANGUAGES_HUB.find(h => h.code === selectedHubLang)?.native})
                  </h4>
                  <p className="text-xs text-slate-400">
                    {WORLD_LANGUAGES_HUB.find(h => h.code === selectedHubLang)?.desc}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedHubLang('')}
                className="text-xs font-bold"
              >
                Reset Filter
              </Button>
            </div>
          )}

        </div>
      )}

      {/* Core Book List Layout (Grid vs Shelf Gallery) */}
      {layoutMode === 'shelf' ? (
        <div className="space-y-12 py-4 animate-in fade-in duration-500">
          {(() => {
            const booksToRender = activeTab === 'online' ? onlineBooks : filteredLocalBooks;
            
            if (booksToRender.length === 0) {
              return (
                <div className="py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/40 backdrop-blur-sm space-y-4 p-6">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200 text-base">
                      {searchQuery.trim() ? `No books found matching "${searchQuery}"` : 'No books found in this section'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {activeTab === 'local' && searchQuery.trim() 
                        ? 'This title is not in your personal bookshelf yet. Would you like to search millions of books in the Global Catalog?'
                        : 'Try adjusting your genre, language, or keyword filters.'}
                    </p>
                  </div>
                  {activeTab === 'local' && searchQuery.trim() ? (
                    <Button
                      onClick={() => setActiveTab('online')}
                      className="px-6 py-2.5 text-xs font-black bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 gap-2 mx-auto inline-flex"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Global Catalog for "{searchQuery}"</span>
                    </Button>
                  ) : (category || language || versionType !== 'all' || searchQuery) ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCategory('');
                        setLanguage('');
                        setVersionType('all');
                        setSearchQuery('');
                        setSelectedHubLang('');
                      }}
                      className="px-5 py-2 text-xs font-bold gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear All Filters</span>
                    </Button>
                  ) : null}
                </div>
              );
            }
            
            const shelves = chunkBooks(booksToRender, 5);
            return shelves.map((shelfBooks, shelfIndex) => (
              <div key={`shelf-${shelfIndex}`} className="relative pt-6 pb-2 px-4 md:px-8 bg-slate-950/15 rounded-3xl border border-slate-900/30 shadow-inner">
                <div className="flex flex-wrap items-end justify-start gap-x-8 md:gap-x-12 gap-y-6 pb-2 px-2 z-10 relative">
                  {shelfBooks.map((book, bookIndex) => {
                    const id = book.id || book.title;
                    const isLocal = activeTab !== 'online';
                    const title = isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title';
                    const author = isLocal ? book.author : book.volumeInfo?.authors?.[0] || 'Unknown Author';
                    const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
                    const isPremium = isLocal ? book.is_premium : !!book.isPremium;
                    const langBadge = getBookLanguageBadge(book);

                    return (
                      <div 
                        key={`${id}-${bookIndex}`}
                        className="shelf-book-container group w-20 md:w-24 flex flex-col justify-end relative hover:z-20 cursor-pointer"
                        onClick={(e) => { e.preventDefault(); handleStartReading(book); }}
                      >
                        <div 
                          className="shelf-book-cover relative aspect-[2/3] w-full rounded-md overflow-hidden bg-slate-900 border border-slate-950 shadow-[5px_10px_20px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                        >
                          {cover ? (
                            <img src={cover} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500 h-full">
                              <BookOpen className="w-6 h-6 mb-1 text-slate-700" />
                              <span className="font-bold text-[9px] uppercase line-clamp-2">{title}</span>
                            </div>
                          )}
                          
                          {/* Language Pill Badge */}
                          <div className="absolute top-1 left-1 bg-black/80 backdrop-blur text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-10 flex items-center gap-0.5">
                            <span>{langBadge.flag}</span>
                          </div>

                          {isPremium && (
                            <div className="absolute top-1 right-1 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[7px] font-black px-1.5 py-0.5 rounded shadow z-10 tracking-widest uppercase">
                              VIP
                            </div>
                          )}

                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-primary/95 text-white text-[8px] font-black px-2 py-1 rounded shadow tracking-widest uppercase scale-75 group-hover:scale-100 transition-transform">
                              READ NOW
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-2 h-2 bg-black/60 blur-[3px] rounded-full scale-y-50 group-hover:opacity-0 transition-opacity pointer-events-none" />

                        <div className="mt-3 text-center w-full">
                          <h4 className="font-bold text-[10px] md:text-xs truncate text-slate-200 group-hover:text-primary transition-colors">{title}</h4>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{author}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="w-full h-4 bg-gradient-to-r from-amber-950/90 via-[#452b1f] to-amber-950/90 border-t border-amber-800/40 rounded shadow-md mt-1 relative">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-amber-500/20 via-yellow-400/40 to-amber-500/20"></div>
                  <div className="absolute inset-x-0 bottom-[-12px] h-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {(() => {
            const booksToRender = activeTab === 'online' ? onlineBooks : filteredLocalBooks;

            if (activeTab === 'online' && isLoadingOnline && booksToRender.length === 0) {
              return (
                <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs text-slate-500 tracking-wide font-medium animate-pulse">Aggregating public servers... Gutenberg, Google, & Open Library</p>
                </div>
              );
            }

            if (booksToRender.length === 0) {
              return (
                <div className="col-span-full py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/40 backdrop-blur-sm space-y-4 p-6">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200 text-base">
                      {searchQuery.trim() ? `No books found matching "${searchQuery}"` : 'No books found in this section'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {activeTab === 'local' && searchQuery.trim() 
                        ? 'This title is not in your personal bookshelf yet. Would you like to search millions of books in the Global Catalog?'
                        : 'Try adjusting your genre, language, or keyword filters.'}
                    </p>
                  </div>
                  {activeTab === 'local' && searchQuery.trim() ? (
                    <Button
                      onClick={() => setActiveTab('online')}
                      className="px-6 py-2.5 text-xs font-black bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 gap-2 mx-auto inline-flex"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Global Catalog for "{searchQuery}"</span>
                    </Button>
                  ) : (category || language || versionType !== 'all' || searchQuery) ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCategory('');
                        setLanguage('');
                        setVersionType('all');
                        setSearchQuery('');
                        setSelectedHubLang('');
                      }}
                      className="px-5 py-2 text-xs font-bold gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear All Filters</span>
                    </Button>
                  ) : null}
                </div>
              );
            }

            return booksToRender.map((book, index) => {
              const isLocal = activeTab !== 'online';
              const title = isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title';
              const author = isLocal ? book.author : book.volumeInfo?.authors?.[0] || 'Unknown Author';
              const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
              const isPremium = isLocal ? book.is_premium : !!book.isPremium;
              const id = book.id || title;
              const langBadge = getBookLanguageBadge(book);

              return (
                <Card 
                  key={`${id}-${index}`} 
                  className="group cursor-pointer theme-card flex flex-col justify-between overflow-hidden"
                  onClick={() => handleStartReading(book)}
                >
                  <div>
                    <div className="aspect-[2/3] w-full bg-slate-900 relative rounded-t-lg overflow-hidden flex items-center justify-center border-b border-slate-900">
                      {cover ? (
                        <img src={cover} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
                          <span className="font-bold text-xs uppercase truncate max-w-xs">{title}</span>
                        </div>
                      )}

                      {/* Language & Script Flag Tag */}
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur border border-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10 flex items-center gap-1">
                        <span>{langBadge.flag}</span>
                        <span>{langBadge.name.split('(')[0].trim()}</span>
                      </div>

                      {isPremium && (
                        <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow z-10 tracking-widest uppercase">
                          VIP
                        </div>
                      )}

                      {downloadedBookIds.includes(String(id)) && (
                        <div className="absolute bottom-2.5 left-2.5 bg-emerald-500 text-white p-1 rounded-full z-10 shadow" title="Available Offline">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                        </div>
                      )}

                      <div className="absolute bottom-2.5 right-2.5 bg-primary text-white text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10 flex items-center gap-1">
                        <span>READ NOW</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${langBadge.isOriginal ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'}`}>
                          {langBadge.isOriginal ? '📜 Original Text' : '🌐 Translation'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-slate-100">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{author}</p>
                    </CardContent>
                  </div>
                </Card>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
