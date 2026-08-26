'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { Modal } from '@/components/ui/Modal';
import { Search, Globe, Award, Sparkles, FolderOpen, ArrowRight, Lock, BookOpen, Star, Sparkle, LayoutGrid, Library, Download, CheckCircle2 } from 'lucide-react';
import { saveBookOffline, getCachedBook, isBookCached, deleteCachedBook, getAllCachedBooks } from '@/utils/offlineStorage';

function getOnlineBookReadParams(book: any) {
  const title = book.volumeInfo?.title || book.title || 'Unknown Title';
  const author = book.volumeInfo?.authors?.[0] || book.author || 'Unknown Author';
  const description = book.volumeInfo?.description || book.description || 'A curated literary work available in the QuillHawk catalog.';
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

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  language?: string[];
  ia?: string[];
}

interface GutendexBook {
  id: number;
  title: string;
  authors?: { name: string }[];
  formats?: Record<string, string>;
  languages?: string[];
}

interface DomeGalleryProps {
  books: any[];
  activeTab: 'local' | 'online' | 'device' | 'premium';
  isPremiumUser: boolean;
  localAddedBooks: any[];
  setLocalAddedBooks: (books: any[]) => void;
  handleStartReading: (book: any) => void;
  triggerOfflineDownload: (id: string, title: string, author: string, cover: string, fileUrl: string) => void;
  setSelectedStoreBook: (book: any) => void;
  setIsStoreModalOpen: (open: boolean) => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
  setLockedBookToUnlock: (book: any) => void;
}

function DomeGallery({
  books,
  activeTab,
  isPremiumUser,
  localAddedBooks,
  setLocalAddedBooks,
  handleStartReading,
  triggerOfflineDownload,
  setSelectedStoreBook,
  setIsStoreModalOpen,
  setIsUpgradeModalOpen,
  setLockedBookToUnlock
}: DomeGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [books.length]);

  if (books.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/20 backdrop-blur-sm space-y-3 w-full">
        <BookOpen className="w-10 h-10 text-slate-700 mx-auto" />
        <h3 className="font-bold text-slate-400">No books found</h3>
      </div>
    );
  }

  const activeBook = books[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? books.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === books.length - 1 ? 0 : prev + 1));
  };

  const isLocal = activeTab === 'local';
  const angleStep = 25;
  const radius = 280;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10 relative overflow-hidden bg-slate-950/10 rounded-3xl border border-slate-900/40 p-6 md:p-10 shadow-2xl w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .dome-scene {
          perspective: 1200px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 360px;
          width: 100%;
          position: relative;
        }
        .dome-carousel {
          position: absolute;
          width: 150px;
          height: 225px;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .dome-item {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.7s, filter 0.7s;
          backface-visibility: hidden;
        }
        .dome-platform {
          width: 600px;
          height: 80px;
          background: radial-gradient(ellipse at center, rgba(91,108,255,0.18) 0%, rgba(91,108,255,0.03) 50%, transparent 100%);
          border-radius: 50%;
          transform: rotateX(85deg) translateY(120px) translateZ(-80px);
          box-shadow: 0 0 60px rgba(91,108,255,0.2), inset 0 0 30px rgba(91,108,255,0.3);
          pointer-events: none;
          z-index: 0;
        }
        .dome-glow-ring {
          position: absolute;
          bottom: 35px;
          width: 180px;
          height: 15px;
          background: radial-gradient(ellipse at center, rgba(6,182,212,0.4) 0%, transparent 70%);
          filter: blur(4px);
          pointer-events: none;
          z-index: 1;
          animation: pulse-ring 3s infinite ease-in-out;
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}} />

      <div className="dome-scene">
        <div 
          className="dome-carousel"
          style={{
            transform: `rotateY(${-activeIndex * angleStep}deg) translateY(-20px)`
          }}
        >
          {books.map((book, idx) => {
            const id = book.id || book.title;
            const title = isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title';
            const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
            const isPremium = isLocal ? book.is_premium : !!book.isPremium;
            
            const offset = idx - activeIndex;
            const isCenter = idx === activeIndex;
            const isVisible = Math.abs(offset) <= 4 || (idx === 0 && activeIndex >= books.length - 4) || (idx === books.length - 1 && activeIndex <= 3);
            const opacity = isCenter ? 1 : (isVisible ? Math.max(0.25, 0.9 - Math.abs(offset) * 0.18) : 0);
            const blur = isCenter ? 'blur(0)' : `blur(${Math.min(3, Math.abs(offset) * 0.8)}px)`;

            const handleBookClick = (e: React.MouseEvent) => {
              e.preventDefault();
              if (!isCenter) {
                setActiveIndex(idx);
              } else {
                handleStartReading(book);
              }
            };

            return (
              <div 
                key={`${id}-${idx}`}
                className="dome-item"
                style={{
                  transform: `rotateY(${idx * angleStep}deg) translateZ(${radius}px) scale(${isCenter ? 1.15 : 0.85})`,
                  opacity: opacity,
                  filter: blur,
                  zIndex: isCenter ? 50 : 10 - Math.abs(offset),
                  pointerEvents: isVisible ? 'auto' : 'none'
                }}
                onClick={handleBookClick}
              >
                <div 
                  className={`w-full h-full rounded-xl overflow-hidden bg-slate-900 border ${isCenter ? 'border-primary shadow-[0_0_25px_rgba(91,108,255,0.45)]' : 'border-slate-800 shadow-[5px_10px_20px_rgba(0,0,0,0.5)]'} relative transition-all duration-300`}
                >
                  {cover ? (
                    <img src={cover} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500 h-full">
                      <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
                      <span className="font-bold text-[10px] uppercase line-clamp-3">{title}</span>
                    </div>
                  )}

                  {isPremium && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded shadow z-10 tracking-widest uppercase">
                      VIP
                    </div>
                  )}

                  <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/50 via-black/15 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-[2px] bg-white/10 pointer-events-none" />

                  {isCenter && (
                    <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center animate-in fade-in duration-300">
                      <span className="bg-primary hover:bg-primary/90 text-white text-[9px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                        <span>📖 READ NOW</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dome-platform absolute" />
        <div className="dome-glow-ring absolute" />
      </div>

      <div className="z-10 flex flex-col items-center space-y-4 w-full max-w-lg">
        <div className="flex items-center gap-6">
          <Button 
            onClick={handlePrev}
            variant="secondary"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:text-white"
          >
            ←
          </Button>
          <div className="text-center w-48 md:w-64">
            <h3 className="text-sm md:text-base font-extrabold text-white line-clamp-1">{activeBook ? (isLocal ? activeBook.title : activeBook.volumeInfo?.title) : ''}</h3>
            <p className="text-[11px] md:text-xs text-indigo-400 font-semibold line-clamp-1 mt-0.5">{activeBook ? (isLocal ? activeBook.author : (activeBook.volumeInfo?.authors?.[0] || 'Unknown Author')) : ''}</p>
          </div>
          <Button 
            onClick={handleNext}
            variant="secondary"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:text-white"
          >
            →
          </Button>
        </div>

        {!isLocal && activeBook && (() => {
          const title = activeBook.volumeInfo?.title || '';
          const author = activeBook.volumeInfo?.authors?.[0] || 'Unknown Author';
          const cover = activeBook.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '';
          const isAdded = localAddedBooks.some(b => b.title.toLowerCase() === title.toLowerCase());

          const handleAddBtn = (e: React.MouseEvent) => {
            e.stopPropagation();
            try {
              const addedList = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
              const file_url = activeBook.accessInfo?.epub?.downloadLink || 
                (activeBook.id?.startsWith('gutendex-') 
                  ? `https://www.gutenberg.org/ebooks/${activeBook.id.replace('gutendex-', '')}.epub.noimages` 
                  : `https://www.gutenberg.org/ebooks/1342.epub.noimages`);
              const newBook = {
                id: activeBook.id,
                title: title,
                author: author,
                cover_url: cover,
                file_url: file_url,
                is_premium: !!activeBook.isPremium,
                googleId: activeBook.source === 'Google Books' ? activeBook.id : undefined,
                iaId: activeBook.isOpenLibrary && activeBook.accessInfo?.ia ? activeBook.accessInfo.ia : undefined,
                language: activeBook.volumeInfo?.language || 'en'
              };
              
              if (!addedList.some((b: any) => b.title.toLowerCase() === title.toLowerCase())) {
                const updated = [newBook, ...addedList];
                localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                const cleanList = updated.map((b: any) => ({
                  ...b,
                  cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '')
                }));
                document.cookie = "added-to-library-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
                setLocalAddedBooks(updated);
                // Trigger background download automatically!
                triggerOfflineDownload(newBook.id, newBook.title, newBook.author, newBook.cover_url, newBook.file_url);
                alert(`"${title}" added to bookshelf!`);
              }
            } catch (err) {}
          };

          return (
            <Button
              onClick={handleAddBtn}
              disabled={isAdded}
              size="sm"
              variant={isAdded ? 'secondary' : 'primary'}
              className={`px-5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                isAdded 
                  ? 'bg-slate-900/80 text-green-400 border border-green-500/20 cursor-default shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
              }`}
            >
              {isAdded ? '✓ Added to Bookshelf' : '➕ Add to Bookshelf'}
            </Button>
          );
        })()}

        <div className="flex gap-1.5 max-w-xs overflow-x-auto py-1 justify-center">
          {books.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeIndex ? 'bg-primary w-4' : 'bg-slate-800 hover:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LibraryBrowser({ initialBooks, userId }: LibraryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'device' | 'premium'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [isBgLoading, setIsBgLoading] = useState(false);
  
  const [layoutMode, setLayoutMode] = useState<'grid' | 'shelf' | 'dome'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('quillhawk-layout-mode') as 'grid' | 'shelf' | 'dome') || (localStorage.getItem('readsphere-layout-mode') as 'grid' | 'shelf' | 'dome') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quillhawk-layout-mode', layoutMode);
      localStorage.setItem('readsphere-layout-mode', layoutMode);
    }
  }, [layoutMode]);

  const searchCache = useRef<Record<string, OnlineBook[]>>({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('quillhawk-search-cache') || sessionStorage.getItem('readsphere-search-cache');
      if (stored) {
        searchCache.current = JSON.parse(stored);
      }
    } catch (e) {}
  }, []);

  // Debounce search query changes to make search responsive and automatic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  // Weekly Progression state (Quest: 500 mins)
  const [weeklyMinutes, setWeeklyMinutes] = useState(25);
  
  // Local storage lists for published & added-to-library books
  const [localPublishedBooks, setLocalPublishedBooks] = useState<any[]>([]);
  const [localAddedBooks, setLocalAddedBooks] = useState<any[]>([]);
  
  const [isPremiumUser, setIsPremiumUser] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [lockedBookToUnlock, setLockedBookToUnlock] = useState<{title: string, author: string, cover_url?: string} | null>(null);

  // Store purchase overlay state
  const [selectedStoreBook, setSelectedStoreBook] = useState<OnlineBook | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Offline storage states
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [downloadingBookIds, setDownloadingBookIds] = useState<string[]>([]);

  // Function to scan IndexedDB and update the cached status of all books
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
      return; // Skip non-downloadable titles
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
    const isLocal = activeTab === 'local' || book.file_url !== undefined;
    const title = isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title';
    const author = isLocal ? book.author : book.volumeInfo?.authors?.[0] || 'Unknown Author';
    const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
    const id = book.id || book.title;
    const description = isLocal ? book.description : book.volumeInfo?.description || 'No description available.';

    try {
      const cached = await getCachedBook(id);
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.fileData);
        setActiveReadingBook({ url: blobUrl, title: cached.title, author, description, id, customChapters: book.chapters });
        return;
      }
    } catch (err) {
      console.warn('IndexedDB read failed, falling back to network:', err);
    }

    if (isLocal) {
      let currentUrl = book.file_url || '';
      let resolvedId = id;
      let resolvedSource = book.source;

      if (currentUrl && !currentUrl.startsWith('blob:')) {
        saveBookOffline(resolvedId, title, author, cover, currentUrl)
          .then(() => setDownloadedBookIds(prev => {
            if (!prev.includes(String(resolvedId))) return [...prev, String(resolvedId)];
            return prev;
          }))
          .catch(err => console.warn('Background caching failed:', err));
      }
      setActiveReadingBook({ url: currentUrl, title: book.title, author, description, id: resolvedId, source: resolvedSource, customChapters: book.chapters });
    } else {
      let params = getOnlineBookReadParams(book);
      
      if (params.url && !params.url.startsWith('blob:')) {
        saveBookOffline(id, title, author, cover, params.url)
          .then(() => setDownloadedBookIds(prev => [...prev, id]))
          .catch(err => console.warn('Background caching failed:', err));
      }
      setActiveReadingBook({ ...params, customChapters: book.chapters });
    }
  };

  // Detect query parameters (tab=online)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'online') {
        setActiveTab('online');
      }
    }
  }, []);

  // Fetch and merge local storage published & added books
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const published = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      const added = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
      setLocalPublishedBooks(published);
      setLocalAddedBooks(added);
    }
  }, [activeTab]);

  useEffect(() => {
    const checkPremiumAndStats = async () => {
      if (!userId) return;
      
      let isPremium = false;
      let totalSeconds = 0;

      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        // Load premium status
        const { data: profile } = await supabase.from('users').select('premium_status').eq('id', userId).single();
        if (profile?.premium_status) {
          isPremium = true;
        }

        // Calculate weekly reading minutes
        const { data: logs } = await supabase.from('reading_logs').select('time_spent_seconds').eq('user_id', userId);
        if (logs) {
          totalSeconds = logs.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0);
        }
      } catch (e) {
        console.error('Error fetching premium status and reading stats:', e);
      }

      setIsPremiumUser(isPremium);
      const minutes = Math.floor(totalSeconds / 60) + 25; // Base offset to avoid showing zero
      setWeeklyMinutes(minutes);
    };

    checkPremiumAndStats();
  }, [userId, activeTab]);
  
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
    { code: 'eng', label: '🇬🇧 English', iso6391: 'en', iso6392: 'eng' },
    { code: 'ara', label: '🇸🇦 Arabic (العربية)', iso6391: 'ar', iso6392: 'ara' },
    { code: 'per', label: '🇮🇷 Persian (فارسی)', iso6391: 'fa', iso6392: 'per' },
    { code: 'hin', label: '🇮🇳 Hindi (हिन्दी)', iso6391: 'hi', iso6392: 'hin' },
    { code: 'spa', label: '🇪🇸 Spanish (Español)', iso6391: 'es', iso6392: 'spa' },
    { code: 'fre', label: '🇫🇷 French (Français)', iso6391: 'fr', iso6392: 'fre' },
    { code: 'ger', label: '🇩🇪 German (Deutsch)', iso6391: 'de', iso6392: 'ger' },
    { code: 'rus', label: '🇷🇺 Russian (Русский)', iso6391: 'ru', iso6392: 'rus' },
    { code: 'chi', label: '🇨🇳 Chinese (中文)', iso6391: 'zh', iso6392: 'chi' },
    { code: 'jpn', label: '🇯🇵 Japanese (日本語)', iso6391: 'ja', iso6392: 'jpn' },
    { code: 'tur', label: '🇹🇷 Turkish (Türkçe)', iso6391: 'tr', iso6392: 'tur' },
    { code: 'por', label: '🇧🇷 Portuguese (Português)', iso6391: 'pt', iso6392: 'por' },
    { code: 'ita', label: '🇮🇹 Italian (Italiano)', iso6391: 'it', iso6392: 'ita' },
    { code: 'ben', label: '🇧🇩 Bengali (বাংলা)', iso6391: 'bn', iso6392: 'ben' },
    { code: 'pan', label: '🇵🇰 Punjabi (پنجابی / ਪੰਜਾਬੀ)', iso6391: 'pa', iso6392: 'pan' },
    { code: 'tam', label: '🇮🇳 Tamil (தமிழ்)', iso6391: 'ta', iso6392: 'tam' },
    { code: 'tel', label: '🇮🇳 Telugu (తెలుగు)', iso6391: 'te', iso6392: 'tel' },
    { code: 'mar', label: '🇮🇳 Marathi (मराठी)', iso6391: 'mr', iso6392: 'mar' },
    { code: 'kor', label: '🇰🇷 Korean (한국어)', iso6391: 'ko', iso6392: 'kor' },
    { code: 'nld', label: '🇳🇱 Dutch (Nederlands)', iso6391: 'nl', iso6392: 'dut' },
    { code: 'swe', label: '🇸🇪 Swedish (Svenska)', iso6391: 'sv', iso6392: 'swe' },
    { code: 'dan', label: '🇩🇰 Danish (Dansk)', iso6391: 'da', iso6392: 'dan' },
    { code: 'pol', label: '🇵🇱 Polish (Polski)', iso6391: 'pl', iso6392: 'pol' },
    { code: 'ind', label: '🇮🇩 Indonesian (Bahasa)', iso6391: 'id', iso6392: 'ind' },
    { code: 'vie', label: '🇻🇳 Vietnamese (Tiếng Việt)', iso6391: 'vi', iso6392: 'vie' },
    { code: 'gre', label: '🇬🇷 Greek (Ελληνικά)', iso6391: 'el', iso6392: 'gre' },
    { code: 'heb', label: '🇮🇱 Hebrew (עבריت)', iso6391: 'he', iso6392: 'heb' },
    { code: 'lat', label: '🏛️ Latin (Latina)', iso6391: 'la', iso6392: 'lat' }
  ];

  const searchOnlineLibrary = useCallback(async (forcedQuery?: string) => {
    const queryVal = typeof forcedQuery === 'string' ? forcedQuery : debouncedSearchQuery;
    const cacheKey = `query:${queryVal || ''}|cat:${category}|lang:${language}|ver:${versionType}`;

    // Try cache hit first
    if (searchCache.current[cacheKey]) {
      setOnlineBooks(searchCache.current[cacheKey]);
      setIsLoadingOnline(false);
      setIsBgLoading(false);
      return;
    }

    setIsLoadingOnline(true);
    setIsBgLoading(true);
    setOnlineBooks([]); // Clear current results to give immediate feedback
    
    try {
      // 1. First attempt: Query our unified high-performance multi-engine backend API
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
        console.warn('Backend search API failed, trying direct client fallback:', backendErr);
      }

      // 2. Client-side Fallback fetchers across Google, Open Library, and Gutenberg
      let q = queryVal || '';
      const selectedLangObj = languages.find(l => l.code === language);
      const langLabel = selectedLangObj ? selectedLangObj.label.split('(')[0].trim() : '';

      if (language && language !== 'eng') {
        if (category) {
          q = q ? `${q} ${langLabel} ${category}` : `${langLabel} ${category}`;
        } else {
          q = q ? `${q} ${langLabel}` : langLabel;
        }
      } else {
        if (category) {
          q = q ? `${q} subject:${category.toLowerCase()}` : `subject:${category.toLowerCase()}`;
        }
        if (!q) {
          q = 'subject:fiction';
        }
      }
      
      const lang1 = selectedLangObj?.iso6391 || '';
      const lang2 = selectedLangObj?.iso6392 || '';

      const updateBooks = (newBooks: OnlineBook[]) => {
        setOnlineBooks((prev) => {
          let merged = [...prev, ...newBooks];
          
          if (language) {
            merged = merged.filter((book) => 
              book.volumeInfo?.language?.startsWith(lang1) || 
              book.volumeInfo?.language?.startsWith(lang2) ||
              !book.volumeInfo?.language
            );
          }
          
          const filtered = merged.filter((book, index, self) =>
            self.findIndex(b => b.volumeInfo?.title?.toLowerCase() === book.volumeInfo?.title?.toLowerCase()) === index
          );

          searchCache.current[cacheKey] = filtered;
          try {
            sessionStorage.setItem('quillhawk-search-cache', JSON.stringify(searchCache.current));
          } catch (e) {}
          return filtered;
        });
      };

      const fetchGoogle = async () => {
        try {
          let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=30`;
          if (lang1) url += `&langRestrict=${lang1}`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (!data.error && data.items) {
              const books = data.items.map((b: any): OnlineBook => ({
                id: b.id,
                source: 'Google Books',
                isPremium: false,
                volumeInfo: {
                  title: b.volumeInfo?.title || 'Unknown Title',
                  authors: b.volumeInfo?.authors || ['Unknown Author'],
                  description: b.volumeInfo?.description || 'No description available for this title.',
                  imageLinks: b.volumeInfo?.imageLinks ? {
                    thumbnail: b.volumeInfo.imageLinks.thumbnail || null
                  } : null,
                  infoLink: b.volumeInfo?.infoLink || '#',
                  previewLink: b.volumeInfo?.previewLink || '#',
                  language: b.volumeInfo?.language || 'eng'
                },
                accessInfo: b.accessInfo ? {
                  ia: null,
                  epub: b.accessInfo.epub ? {
                    downloadLink: b.accessInfo.epub.downloadLink || null
                  } : null
                } : null
              }));
              updateBooks(books);
            }
          }
        } catch (e) {
          console.error('Google Books fallback error:', e);
        }
      };

      const fetchOpenLibrary = async () => {
        try {
          let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(queryVal || category || 'fiction')}&limit=30`;
          if (lang2) olUrl += `&language=${lang2}`;
          
          const olRes = await fetch(olUrl);
          if (olRes.ok) {
            const olData = await olRes.json();
            const books = (olData.docs || []).map((b: OpenLibraryDoc, i: number): OnlineBook => ({
              id: b.key ? b.key.replace('/works/', '') : `ol-${i}`,
              isOpenLibrary: true,
              source: 'Open Library',
              isPremium: false,
              volumeInfo: {
                title: b.title || 'Unknown Title',
                authors: b.author_name || ['Unknown Author'],
                description: 'A classic work available in the Open Library public archive.',
                imageLinks: b.cover_i ? {
                  thumbnail: `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
                } : null,
                infoLink: b.key ? `https://openlibrary.org${b.key}` : '#',
                previewLink: b.key ? `https://openlibrary.org${b.key}` : '#',
                language: b.language?.[0] || 'eng'
              },
              accessInfo: {
                ia: b.ia?.[0] || null,
                epub: null
              }
            }));
            updateBooks(books);
          }
        } catch (e) {
          console.error('Open Library fallback error:', e);
        }
      };

      const fetchGutenberg = async () => {
        try {
          let gutendexUrl = `https://gutendex.com/books/?search=${encodeURIComponent(queryVal || category || 'fiction')}`;
          if (lang1) gutendexUrl += `&languages=${lang1}`;
          
          const gRes = await fetch(gutendexUrl);
          if (gRes.ok) {
            const gData = await gRes.json();
            const books = (gData.results || []).slice(0, 25).map((b: GutendexBook): OnlineBook => ({
              id: `gutendex-${b.id}`,
              source: 'Gutenberg',
              isPremium: false,
              volumeInfo: {
                title: b.title || 'Unknown Title',
                authors: Array.isArray(b.authors) ? b.authors.map((a) => a.name) : ['Unknown Author'],
                description: 'Public domain literature hosted by Project Gutenberg.',
                imageLinks: b.formats?.['image/jpeg'] ? {
                  thumbnail: b.formats['image/jpeg']
                } : null,
                infoLink: `https://www.gutenberg.org/ebooks/${b.id}`,
                previewLink: `https://www.gutenberg.org/ebooks/${b.id}`,
                language: b.languages?.[0] || 'en'
              },
              accessInfo: {
                ia: null,
                epub: b.formats?.['application/epub+zip'] ? {
                  downloadLink: b.formats['application/epub+zip']
                } : null
              }
            }));
            updateBooks(books);
          }
        } catch (e) {
          console.error('Gutendex fallback error:', e);
        }
      };

      await Promise.allSettled([
        fetchGoogle(),
        fetchOpenLibrary(),
        fetchGutenberg()
      ]);
    } catch (error) {
      console.error('Fatal Error fetching books:', error);
    } finally {
      setIsLoadingOnline(false);
      setIsBgLoading(false);
    }
  }, [debouncedSearchQuery, category, language, versionType]);

  // Execute search automatically when tab switches to online, or when query, category, language, or version changes
  useEffect(() => {
    if (activeTab === 'online') {
      searchOnlineLibrary();
    }
  }, [activeTab, debouncedSearchQuery, category, language, versionType, searchOnlineLibrary]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveReadingBook({ url, title: file.name });
    }
  };

  const premiumBooks = [
    ...initialBooks.filter(b => b.is_premium),
    ...[
      { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages', is_premium: true, language: 'en' },
      { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages', is_premium: true, language: 'en' }
    ].filter(b => !initialBooks.some(ib => ib.title.toLowerCase() === b.title.toLowerCase()))
  ];

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
    
    if (language) {
      const selectedLangObj = languages.find(l => l.code === language);
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
      const bookGenre = b.genre || b.category || classicGenres[bookTitle] || '';
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
      
      {/* Floating Glass Search & Overview Dashboard */}
      <div className="relative theme-card p-6 md:p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-[-50%] right-[-10%] w-[35vw] h-[35vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[35vw] h-[35vw] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart Catalog Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400">Masterpiece.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Search your uploaded books, read local classics, or query millions of titles from global servers seamlessly.
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
            onClick={() => { setActiveTab('local'); setSearchQuery(''); }}
          >
            My Bookshelf
          </button>
          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'online' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('online'); setSearchQuery(''); }}
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
          <button 
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'device' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setActiveTab('device'); setSearchQuery(''); }}
          >
            Device EPUBs
          </button>
        </div>

        {/* Real-time search/query field dynamically adapted to active tab */}
        {activeTab !== 'device' && activeTab !== 'premium' && (
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
            {/* View Toggle */}
            {(activeTab === 'local' || activeTab === 'online') && (
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
                <button
                  onClick={() => setLayoutMode('dome')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${layoutMode === 'dome' ? 'bg-slate-900 text-indigo-400 shadow border border-slate-800' : 'text-slate-500 hover:text-slate-350'}`}
                  title="3D Dome Gallery View"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dome</span>
                </button>
              </div>
            )}

            <div className="relative w-full md:w-85 max-w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder={activeTab === 'local' ? 'Search bookshelf...' : 'Search title, author or keyword...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeTab === 'online') {
                    setDebouncedSearchQuery(searchQuery);
                    searchOnlineLibrary(searchQuery);
                  }
                }}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/80 transition-all font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Discovery Genre Chips for Global Catalog */}
      {activeTab === 'online' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Quick Discovery:
          </span>
          {[
            { label: '🇵🇰 Urdu Adab & Poetry (اردو ادب)', q: 'دیوان غالب اقبال منٹو', cat: '', lang: 'urd', ver: 'all' },
            { label: '📜 Original Editions (اصل کتابیں)', q: '', cat: '', lang: '', ver: 'original' },
            { label: '🌐 Translated Editions (ترجمہ شدہ)', q: '', cat: '', lang: '', ver: 'translation' },
            { label: '🔥 All Bestsellers', q: 'bestseller fiction', cat: '', lang: '', ver: 'all' },
            { label: '🚀 Sci-Fi & Cyberpunk', q: 'science fiction', cat: 'Science Fiction', lang: '', ver: 'all' },
            { label: '🧙 Fantasy & Magic', q: 'fantasy adventure', cat: 'Fantasy', lang: '', ver: 'all' },
            { label: '🧠 Mind & Growth', q: 'psychology habits self-help', cat: 'Psychology', lang: '', ver: 'all' },
            { label: '🏛️ Philosophy & Classics', q: 'philosophy classics', cat: 'Philosophy', lang: '', ver: 'all' },
            { label: '📚 World Literature', q: 'classic literature novel', cat: 'Fiction', lang: '', ver: 'all' }
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                if (chip.q !== undefined) setSearchQuery(chip.q);
                if (chip.cat !== undefined) setCategory(chip.cat);
                if (chip.lang !== undefined) setLanguage(chip.lang);
                if (chip.ver !== undefined) setVersionType(chip.ver as any);
                setDebouncedSearchQuery(chip.q || '');
                searchOnlineLibrary(chip.q || '');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-slate-900/80 hover:bg-primary/20 text-slate-300 hover:text-white border border-slate-800 hover:border-primary/40 transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced filters on Online and Local tabs */}
      {(activeTab === 'online' || activeTab === 'local') && (
        <div className="bg-slate-950/20 border border-slate-850 p-5 rounded-2xl flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2 duration-300">
          {activeTab === 'online' && (
            <div className="flex-1 min-w-[180px] space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Genre subject
              </label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-900/60 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}

          <div className="flex-grow-0 min-w-[160px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-900/60 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-grow-0 min-w-[160px] space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edition Version</label>
            <select 
              value={versionType} 
              onChange={(e) => setVersionType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-900/60 transition-colors"
            >
              <option value="all">All Editions (Originals & Translations)</option>
              <option value="original">📜 Original Texts Only</option>
              <option value="translation">🌐 Translated Editions Only</option>
            </select>
          </div>

          {activeTab === 'online' && (
            <Button 
              onClick={() => {
                setDebouncedSearchQuery(searchQuery);
                searchOnlineLibrary(searchQuery);
              }}
              className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all transform shrink-0 h-10 flex items-center justify-center gap-1.5"
            >
              <span>Query Servers</span>
            </Button>
          )}
        </div>
      )}

      {activeTab === 'online' && isBgLoading && !isLoadingOnline && (
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold px-4 py-2.5 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl w-full max-w-max animate-pulse">
          <div className="animate-spin w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full" />
          <span>Syncing Open Library & Project Gutenberg archives in the background...</span>
        </div>
      )}

      {/* Premium lounge banner card */}
      {activeTab === 'premium' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-600/5 to-amber-500/15 p-6 md:p-8 rounded-3xl border border-warning/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(245,158,11,0.02)] animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1 bg-warning text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              ✨ Free & Unrestricted Access
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Curated Masterpiece Collection</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Every book in the QuillHawk library is completely free and available to everyone. Enjoy uninterrupted immersive reading, rich typographic layouts, and offline book saving!
            </p>
          </div>
        </div>
      )}

      {/* Core Book List Layout (Grid vs Shelf Gallery vs Dome Gallery) */}
      {layoutMode === 'dome' && (activeTab === 'local' || activeTab === 'online') ? (
        <DomeGallery 
          books={activeTab === 'local' ? filteredLocalBooks : onlineBooks}
          activeTab={activeTab}
          isPremiumUser={isPremiumUser}
          localAddedBooks={localAddedBooks}
          setLocalAddedBooks={setLocalAddedBooks}
          handleStartReading={handleStartReading}
          triggerOfflineDownload={triggerOfflineDownload}
          setSelectedStoreBook={setSelectedStoreBook}
          setIsStoreModalOpen={setIsStoreModalOpen}
          setIsUpgradeModalOpen={setIsUpgradeModalOpen}
          setLockedBookToUnlock={setLockedBookToUnlock}
        />
      ) : layoutMode === 'shelf' && (activeTab === 'local' || activeTab === 'online') ? (
        <div className="space-y-12 py-4 animate-in fade-in duration-500">
          {(() => {
            const booksToRender = activeTab === 'local' ? filteredLocalBooks : onlineBooks;
            
            if (activeTab === 'online' && isLoadingOnline && booksToRender.length === 0) {
              return (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs text-slate-500 tracking-wide font-medium animate-pulse">Aggregating public servers... Gutenberg, Google, & Open Library</p>
                </div>
              );
            }
            
            if (booksToRender.length === 0) {
              return (
                <div className="py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/20 backdrop-blur-sm space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-700 mx-auto" />
                  <h3 className="font-bold text-slate-400">No books found in bookshelf</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {activeTab === 'local' 
                      ? (searchQuery ? `We couldn't find any books matching "${searchQuery}".` : 'Try seeding database via /api/seed-books or publishing your own books!')
                      : `No titles matching "${searchQuery}" found. Try adjusting keywords.`}
                  </p>
                </div>
              );
            }
            
            const shelves = chunkBooks(booksToRender, 5);
            return shelves.map((shelfBooks, shelfIndex) => (
              <div key={`shelf-${shelfIndex}`} className="relative pt-6 pb-2 px-4 md:px-8 bg-slate-950/15 rounded-3xl border border-slate-900/30 shadow-inner">
                {/* Horizontal row of standing books */}
                <div className="flex flex-wrap items-end justify-start gap-x-8 md:gap-x-12 gap-y-6 pb-2 px-2 z-10 relative">
                  {shelfBooks.map((book, bookIndex) => {
                    const id = book.id || book.title;
                    
                    // Unified book fields
                    const isLocal = activeTab === 'local';
                    const title = isLocal ? book.title : book.volumeInfo?.title || 'Unknown Title';
                    const author = isLocal ? book.author : book.volumeInfo?.authors?.[0] || 'Unknown Author';
                    const cover = isLocal ? book.cover_url : (book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '');
                    const isPremium = isLocal ? book.is_premium : !!book.isPremium;
                    const price = isLocal ? undefined : book.price;
                    const isAdded = !isLocal && localAddedBooks.some(b => b.title.toLowerCase() === title.toLowerCase());
                    
                    const handleCoverClick = (e: React.MouseEvent) => {
                      e.preventDefault();
                      handleStartReading(book);
                    };

                    const handleAddBtn = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      e.preventDefault();
                      try {
                        const addedList = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
                        const file_url = book.accessInfo?.epub?.downloadLink || 
                          (book.id?.startsWith('gutendex-') 
                            ? `https://www.gutenberg.org/ebooks/${book.id.replace('gutendex-', '')}.epub.noimages` 
                            : `https://www.gutenberg.org/ebooks/1342.epub.noimages`);
                        const newBook = {
                          id: book.id,
                          title: title,
                          author: author,
                          cover_url: cover || '',
                          file_url: file_url,
                          is_premium: !!book.isPremium,
                          googleId: book.source === 'Google Books' ? book.id : undefined,
                          iaId: book.isOpenLibrary && book.accessInfo?.ia ? book.accessInfo.ia : undefined,
                          language: book.volumeInfo?.language || 'en'
                        };
                        
                        if (!addedList.some((b: any) => b.title.toLowerCase() === title.toLowerCase())) {
                          const updated = [newBook, ...addedList];
                          localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                          const cleanList = updated.map((b: any) => ({
                            ...b,
                            cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '')
                          }));
                          document.cookie = "added-to-library-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
                          setLocalAddedBooks(updated);
                          // Trigger background download automatically!
                          triggerOfflineDownload(newBook.id, newBook.title, newBook.author, newBook.cover_url, newBook.file_url);
                          alert(`"${title}" added to bookshelf!`);
                        }
                      } catch (err) {}
                    };

                    return (
                      <div 
                        key={`${id}-${bookIndex}`}
                        className="shelf-book-container group w-20 md:w-24 flex flex-col justify-end relative hover:z-20 cursor-pointer"
                        onClick={handleCoverClick}
                      >
                        {/* 3D Book object */}
                        <div 
                          className="shelf-book-cover relative aspect-[2/3] w-full rounded-md overflow-hidden bg-slate-900 border border-slate-950 shadow-[5px_10px_20px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
                        >
                          {/* Cover Image */}
                          {cover ? (
                            <img src={cover} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500 h-full">
                              <BookOpen className="w-6 h-6 mb-1 text-slate-700" />
                              <span className="font-bold text-[9px] uppercase line-clamp-2">{title}</span>
                            </div>
                          )}
                          
                          {/* VIP Tag */}
                          {isPremium && (
                            <div className="absolute top-1 right-1 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[7px] font-black px-1.5 py-0.5 rounded shadow z-10 tracking-widest uppercase scale-75 md:scale-100">
                              VIP
                            </div>
                          )}

                          {/* Offline Download Status Badges */}
                          {downloadedBookIds.includes(String(id)) && (
                            <div className="absolute top-1 left-1.5 bg-emerald-500 text-white p-0.5 rounded-full z-10 shadow" title="Available Offline">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                            </div>
                          )}
                          {downloadingBookIds.includes(String(id)) && (
                            <div className="absolute top-1 left-1.5 bg-primary text-white p-0.5 rounded-full z-10 shadow" title="Downloading...">
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full block animate-spin" />
                            </div>
                          )}

                          {/* 3D Spine Curve shadow overlay */}
                          <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/55 via-black/10 to-transparent pointer-events-none" />
                          
                          {/* Inner page edge shine */}
                          <div className="absolute inset-y-0 right-0 w-[2px] bg-white/20 pointer-events-none" />

                          {/* Read now Hover overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-primary/95 text-white text-[8px] font-black px-2 py-1 rounded shadow tracking-widest uppercase scale-75 group-hover:scale-100 transition-transform">
                              READ NOW
                            </span>
                          </div>
                        </div>

                        {/* Stand book shadow on the shelf */}
                        <div className="absolute bottom-0 inset-x-2 h-2 bg-black/60 blur-[3px] rounded-full scale-y-50 group-hover:opacity-0 transition-opacity pointer-events-none" />

                        {/* Title & Author tooltip-style beneath */}
                        <div className="mt-3 text-center w-full">
                          <h4 className="font-bold text-[10px] md:text-xs truncate text-slate-200 group-hover:text-primary transition-colors">{title}</h4>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{author}</p>
                          
                          {/* Inline Add button on online bookshelf view */}
                          {!isLocal && (
                            <button
                              onClick={handleAddBtn}
                              disabled={isAdded}
                              className={`mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-black w-full border ${
                                isAdded 
                                  ? 'text-green-400 border-green-500/20 bg-green-500/5 cursor-default' 
                                  : 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500 hover:text-white transition-colors'
                              }`}
                            >
                              {isAdded ? '✓ Added' : '➕ Bookshelf'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 3D Shelf Platform */}
                <div className="w-full h-4 bg-gradient-to-r from-amber-950/90 via-[#452b1f] to-amber-950/90 border-t border-amber-800/40 rounded shadow-md mt-1 relative">
                  {/* golden highlights */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-amber-500/20 via-yellow-400/40 to-amber-500/20"></div>
                  {/* Under shelf shadow drop */}
                  <div className="absolute inset-x-0 bottom-[-12px] h-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          
          {/* Render Bookshelf Books */}
          {activeTab === 'local' && (
            filteredLocalBooks.length > 0 ? (
              filteredLocalBooks.map((book) => (
                <Card key={book.id || book.title} className="group cursor-pointer theme-card flex flex-col justify-between overflow-hidden">
                  <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    handleStartReading(book);
                  }}>
                    <div className="aspect-[2/3] w-full bg-slate-900 relative rounded-t-lg overflow-hidden flex items-center justify-center border-b border-slate-900">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
                          <span className="font-bold text-xs uppercase truncate max-w-xs">{book.title}</span>
                        </div>
                      )}
                      {book.is_premium && (
                        <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow z-10 tracking-widest uppercase">
                          VIP
                        </div>
                      )}
                      
                      {/* Offline Download Status Badges */}
                      {downloadedBookIds.includes(String(book.id)) && (
                        <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white p-0.5 rounded-full z-10 shadow" title="Available Offline">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                        </div>
                      )}
                      {downloadingBookIds.includes(String(book.id)) && (
                        <div className="absolute top-2.5 left-2.5 bg-primary text-white p-0.5 rounded-full z-10 shadow" title="Downloading...">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block animate-spin" />
                        </div>
                      )}

                      <div className="absolute bottom-2.5 right-2.5 bg-primary text-white text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10 flex items-center gap-1">
                        <span>READ NOW</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-slate-100">{book.title}</h3>
                        <p className="text-xs text-slate-500 truncate mt-1">{book.author}</p>
                      </div>
                      
                      {/* Download Actions */}
                      {book.file_url && !book.file_url.startsWith('blob:') && (
                        <div className="mt-3 pt-2 border-t border-slate-900/35 flex justify-between items-center">
                          {downloadedBookIds.includes(String(book.id)) ? (
                            <>
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">✓ Offline</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); triggerRemoveDownload(book.id, book.title); }}
                                className="text-[9px] text-slate-500 hover:text-rose-450 font-bold transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          ) : downloadingBookIds.includes(String(book.id)) ? (
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1.5 animate-pulse">
                              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full block animate-spin" />
                              Downloading...
                            </span>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); triggerOfflineDownload(book.id, book.title, book.author, book.cover_url, book.file_url); }}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Offline
                            </button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </a>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/20 backdrop-blur-sm space-y-3">
                <BookOpen className="w-10 h-10 text-slate-700 mx-auto" />
                <h3 className="font-bold text-slate-400">No books found in bookshelf</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {searchQuery ? `We couldn't find any books matching "${searchQuery}". Adjust your spelling or keywords.` : 'Try seeding database via /api/seed-books or publishing your own books!'}
                </p>
              </div>
            )
          )}

          {/* Render Global Catalog Search Results */}
          {activeTab === 'online' && (
            (isLoadingOnline && onlineBooks.length === 0) ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                <p className="text-xs text-slate-500 tracking-wide font-medium animate-pulse">Aggregating public servers... Gutenberg, Google, & Open Library</p>
              </div>
            ) : onlineBooks.length > 0 ? (
              onlineBooks.map((book, index) => {
                const info = book.volumeInfo || {};
                const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:');
                const isAdded = localAddedBooks.some(b => b.title.toLowerCase() === info.title.toLowerCase());

                 const handleAddToLibrary = (e: React.MouseEvent) => {
                   e.stopPropagation();
                   try {
                     const addedList = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
                     const file_url = book.accessInfo?.epub?.downloadLink || 
                       (book.id?.startsWith('gutendex-') 
                         ? `https://www.gutenberg.org/ebooks/${book.id.replace('gutendex-', '')}.epub.noimages` 
                         : `https://www.gutenberg.org/ebooks/1342.epub.noimages`);
                     const newBook = {
                       id: book.id,
                       title: info.title,
                       author: info.authors?.[0] || 'Unknown Author',
                       cover_url: thumbnail || '',
                       file_url: file_url,
                       is_premium: !!book.isPremium,
                       googleId: book.source === 'Google Books' ? book.id : undefined,
                       iaId: book.isOpenLibrary && book.accessInfo?.ia ? book.accessInfo.ia : undefined,
                       language: book.volumeInfo?.language || 'en'
                     };
                     
                     if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                       const updated = [newBook, ...addedList];
                       localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                       const cleanList = updated.map((b: any) => ({
                         ...b,
                         cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '')
                       }));
                       document.cookie = "added-to-library-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
                              setLocalAddedBooks(updated);
                       triggerOfflineDownload(newBook.id, newBook.title, newBook.author, newBook.cover_url, newBook.file_url);
                       alert(`"${info.title}" added to your bookshelf successfully!`);
                     }
                   } catch (e) {
                     console.error('Error adding to library:', e);
                   }
                 };
 
                 return (
                   <Card 
                     key={`${book.id}-${index}`} 
                     className="group cursor-pointer theme-card flex flex-col justify-between overflow-hidden"
                     onClick={() => {
                       handleStartReading(book);
                     }}
                   >
                    <div className="aspect-[2/3] w-full bg-slate-900 relative rounded-t-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {thumbnail ? (
                        <img src={thumbnail} alt={info.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
                          <span className="font-bold text-xs uppercase truncate max-w-xs">{info.title}</span>
                        </div>
                      )}
                      
                      {/* Edition Badge */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {book.source && (
                          <div className="bg-slate-950/90 backdrop-blur-md text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 shadow uppercase tracking-widest">
                            {book.source}
                          </div>
                        )}
                        {book.is_translation ? (
                          <div className="bg-cyan-950/90 backdrop-blur-md text-cyan-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30 shadow tracking-wider">
                            🌐 Translated ({book.translated_to || 'EN'})
                          </div>
                        ) : (
                          <div className="bg-amber-950/90 backdrop-blur-md text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-500/30 shadow tracking-wider">
                            📜 Original ({book.original_language || book.language?.toUpperCase() || book.volumeInfo?.language?.toUpperCase() || 'Text'})
                          </div>
                        )}
                      </div>

                      {/* Offline Download Status Badges */}
                      {downloadedBookIds.includes(String(book.id)) && (
                        <div className="absolute bottom-2.5 left-2.5 bg-emerald-500 text-white p-0.5 rounded-full z-10 shadow" title="Available Offline">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                        </div>
                      )}
                      {downloadingBookIds.includes(String(book.id)) && (
                        <div className="absolute bottom-2.5 left-2.5 bg-primary text-white p-0.5 rounded-full z-10 shadow" title="Downloading...">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block animate-spin" />
                        </div>
                      )}

                      {/* Pricing lock tag */}
                      <div className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded shadow z-10 uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/25">
                        FREE
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 bg-primary text-white text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10">
                        READ NOW
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3 bg-slate-950/10">
                      <div>
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-slate-100">{info.title}</h3>
                        <p className="text-xs text-slate-500 truncate mt-1">{info.authors?.[0] || 'Unknown Author'}</p>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant={isAdded ? 'secondary' : 'primary'} 
                          className={`w-full text-[10px] py-2 h-auto font-black flex items-center justify-center gap-1 rounded-xl transition-all ${
                            isAdded ? 'bg-slate-900/60 text-green-400 border border-green-500/20 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                          onClick={handleAddToLibrary}
                          disabled={isAdded}
                        >
                          {isAdded ? '✓ In Bookshelf' : '➕ Add to Bookshelf'}
                        </Button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanQuery = (info.title || '').replace(/\(.*?\)/g, '').trim();
                            setSearchQuery(cleanQuery);
                            setDebouncedSearchQuery(cleanQuery);
                            setVersionType(book.is_translation ? 'original' : 'translation');
                            searchOnlineLibrary(cleanQuery);
                          }}
                          className="w-full text-[9px] py-1 text-slate-400 hover:text-cyan-300 font-bold transition-colors text-center border-t border-slate-900/40 pt-1.5 flex items-center justify-center gap-1"
                        >
                          {book.is_translation ? '📜 Find Original Root Work' : '🌐 Find Other Language Translations'}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/20 backdrop-blur-sm space-y-3">
                <Globe className="w-10 h-10 text-slate-700 mx-auto" />
                <h3 className="font-bold text-slate-400">No matching search query</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No titles matching "{searchQuery}" on Gutenberg or Open Library. Adjust your keywords or category, and click **Query Servers**.
                </p>
              </div>
            )
          )}

          {/* Render Premium Lounge Exclusive Titles */}
          {activeTab === 'premium' && (
            premiumBooks.map((book) => {
              return (
                <Card 
                  key={book.id} 
                  className="group cursor-pointer theme-card flex flex-col justify-between overflow-hidden relative"
                  onClick={() => {
                    handleStartReading(book);
                  }}
                >
                  <div className="aspect-[2/3] w-full bg-slate-900 relative rounded-t-lg overflow-hidden flex items-center justify-center">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                        <BookOpen className="w-8 h-8 mb-2 text-slate-700" />
                        <span className="font-bold text-xs uppercase truncate max-w-xs">{book.title}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow z-10 tracking-widest uppercase">
                      VIP
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-warning text-black text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10">
                      READ NOW
                    </div>
                  </div>
                  <CardContent className="p-4 bg-slate-950/10">
                    <h3 className="font-bold text-sm truncate group-hover:text-warning transition-colors text-slate-100">{book.title}</h3>
                    <p className="text-xs text-slate-500 truncate mt-1">{book.author}</p>
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Local Device EPUB Upload Section */}
          {activeTab === 'device' && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20 backdrop-blur-sm space-y-4 max-w-2xl mx-auto px-6 text-center animate-in slide-in-from-top-2 duration-300">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Read From Local Device</h2>
                <p className="text-slate-500 text-sm max-w-sm">
                  Upload any standard EPUB book directly from your hard drive to read it securely in your browser cache.
                </p>
              </div>
              <label className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
                <span>Choose EPUB File</span>
                <input type="file" accept=".epub" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Premium Upgrade Modal */}
      <Modal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)}
        title=""
      >
        <div className="text-center space-y-6 py-4 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-warning/20 to-amber-500/20 border border-warning/30 text-warning mb-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-bounce duration-1000">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black bg-gradient-to-r from-warning to-amber-500 bg-clip-text text-transparent tracking-tight">
              Unlock VIP Premium Lounge
            </h2>
            {lockedBookToUnlock && (
              <p className="text-sm text-slate-300">
                You selected <strong className="text-warning">"{lockedBookToUnlock.title}"</strong> by {lockedBookToUnlock.author}. This is an exclusive premium book.
              </p>
            )}
            <p className="text-xs text-slate-400">
              Upgrade to QuillHawk VIP Pass or hit 500 Weekly Reading Minutes to unlock the entire lounge instantly!
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto shadow-inner">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning font-bold">✓</span>
              <span>Unlimited cloud access to best-selling titles</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning font-bold">✓</span>
              <span>Advanced reading analytics & milestone history</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning font-bold">✓</span>
              <span>Custom reader interface layouts, spacing & margins</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 max-w-sm mx-auto">
            <Button 
              onClick={() => {
                setIsUpgradeModalOpen(false);
                window.location.href = '/premium';
              }}
              className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-slate-950 font-black py-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 rounded-xl text-sm"
            >
              🚀 Upgrade Membership (Starts at ₹49)
            </Button>
            <Button 
              onClick={() => setIsUpgradeModalOpen(false)}
              variant="ghost" 
              className="w-full text-slate-500 hover:text-slate-300 font-bold"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Book Details & Instant Free Read Modal */}
      <Modal 
        isOpen={isStoreModalOpen} 
        onClose={() => setIsStoreModalOpen(false)} 
        title=""
      >
        {selectedStoreBook && (() => {
          const info = selectedStoreBook.volumeInfo || {};
          const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:');
          
          const handleUnlockAndRead = () => {
            try {
              const addedList = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
              const file_url = selectedStoreBook.accessInfo?.epub?.downloadLink || 
                (selectedStoreBook.id?.startsWith('gutendex-') 
                  ? `https://www.gutenberg.org/ebooks/${selectedStoreBook.id.replace('gutendex-', '')}.epub.noimages` 
                  : (selectedStoreBook.accessInfo?.ia 
                    ? `https://archive.org/download/${selectedStoreBook.accessInfo.ia}/${selectedStoreBook.accessInfo.ia}.epub`
                    : `https://www.gutenberg.org/ebooks/1342.epub.noimages`));
              
              const newBook = {
                id: selectedStoreBook.id,
                title: info.title,
                author: info.authors?.[0] || 'Unknown Author',
                cover_url: thumbnail || '',
                file_url: file_url,
                is_premium: false,
                googleId: selectedStoreBook.source === 'Google Books' ? selectedStoreBook.id : undefined,
                iaId: selectedStoreBook.accessInfo?.ia || undefined,
                language: selectedStoreBook.volumeInfo?.language || 'en'
              };
              
              if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                const updated = [newBook, ...addedList];
                localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                const cleanList = updated.map((b: any) => ({
                  ...b,
                  cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '')
                }));
                document.cookie = "added-to-library-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
                setLocalAddedBooks(updated);
                triggerOfflineDownload(newBook.id, newBook.title, newBook.author, newBook.cover_url, newBook.file_url);
              }
              
              setIsStoreModalOpen(false);
              handleStartReading(selectedStoreBook);
            } catch (e) {
              console.error(e);
            }
          };

          return (
            <div className="text-center space-y-6 py-4 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">✨ 100% FREE LITERARY ACCESS</span>
                <h3 className="text-xl font-bold text-white mt-3 leading-tight">{info.title}</h3>
                <p className="text-xs text-blue-300 font-medium">{info.authors?.[0] || 'Unknown Author'}</p>
              </div>

              <div className="flex gap-4 items-center bg-surface/90 p-4 border border-card-border rounded-2xl max-w-sm mx-auto shadow-sm">
                {thumbnail ? (
                  <img src={thumbnail} alt={info.title} className="w-16 h-24 object-cover rounded shadow shadow-black/10 shrink-0" />
                ) : (
                  <div className="w-16 h-24 bg-card flex items-center justify-center text-xs p-1 text-center font-bold text-muted rounded shrink-0 border border-card-border">No Cover</div>
                )}
                <div className="text-left flex-1 space-y-1.5 overflow-hidden">
                  <p className="text-[11px] text-muted line-clamp-3 leading-relaxed">{info.description || 'Public archive literary work accessible for all QuillHawk readers.'}</p>
                  <p className="text-[10px] text-muted/80 font-mono">Archive: {selectedStoreBook.source || 'Global Catalog'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/25 rounded-2xl p-4 flex justify-between items-center max-w-sm mx-auto">
                <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">Access Tier:</span>
                <span className="text-sm font-black text-emerald-400 font-mono uppercase tracking-wider">Free Unrestricted</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-2 max-w-sm mx-auto">
                <Button 
                  onClick={handleUnlockAndRead}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-xl relative text-sm flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Reading Now</span>
                </Button>
                <Button 
                  onClick={() => setIsStoreModalOpen(false)}
                  variant="ghost" 
                  className="w-full text-slate-500 hover:text-slate-300 font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
