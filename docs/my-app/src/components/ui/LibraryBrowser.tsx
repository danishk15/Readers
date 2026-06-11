'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { Modal } from '@/components/ui/Modal';
import { Search, Globe, Award, Sparkles, FolderOpen, ArrowRight, Lock, BookOpen, Star, Sparkle } from 'lucide-react';

interface LocalBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  file_url: string;
  is_premium: boolean;
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

export default function LibraryBrowser({ initialBooks, userId }: LibraryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'device' | 'premium'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);

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
  
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [lockedBookToUnlock, setLockedBookToUnlock] = useState<{title: string, author: string, cover_url?: string} | null>(null);

  // Store purchase overlay state
  const [selectedStoreBook, setSelectedStoreBook] = useState<OnlineBook | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  // Check premium status and weekly reading time
  useEffect(() => {
    const checkPremiumAndStats = async () => {
      const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');
      
      // Load premium status
      if (isDemo) {
        setIsPremiumUser(true);
      } else if (userId) {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: profile } = await supabase.from('users').select('premium_status').eq('id', userId).single();
          if (profile?.premium_status) {
            setIsPremiumUser(true);
          }
        } catch (e) {
          console.error('Error checking premium status:', e);
        }
      }

      // Calculate weekly reading minutes
      let totalSeconds = 0;
      if (isDemo) {
        try {
          const localLogs = JSON.parse(localStorage.getItem('demo-reading_logs') || '[]');
          totalSeconds = localLogs.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0);
        } catch (e) {
          console.error('Error loading local logs:', e);
        }
      } else if (userId) {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: logs } = await supabase.from('reading_logs').select('time_spent_seconds').eq('user_id', userId);
          if (logs) {
            totalSeconds = logs.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0);
          }
        } catch (e) {
          console.error('Error fetching reading minutes:', e);
        }
      }

      const minutes = Math.floor(totalSeconds / 60) + 25; // Base offset to avoid showing zero
      setWeeklyMinutes(minutes);
    };

    checkPremiumAndStats();
  }, [userId, activeTab]);
  
  const [activeReadingBook, setActiveReadingBook] = useState<{url: string, title: string, isGoogleBook?: boolean, googleId?: string, isInternetArchive?: boolean} | null>(null);

  const categories = ["Fiction", "Science Fiction", "Fantasy", "History", "Romance", "Biography", "Mystery"];
  const languages = [
    { code: '', label: 'Any Language' },
    { code: 'eng', label: 'English' },
    { code: 'hin', label: 'Hindi' },
    { code: 'urd', label: 'Urdu' },
    { code: 'spa', label: 'Spanish' },
    { code: 'fre', label: 'French' },
    { code: 'ger', label: 'German' }
  ];

  const searchOnlineLibrary = useCallback(async (forcedQuery?: string) => {
    setIsLoadingOnline(true);
    setOnlineBooks([]); // Clear current results to give immediate feedback
    
    try {
      const queryVal = typeof forcedQuery === 'string' ? forcedQuery : debouncedSearchQuery;
      let q = queryVal || '';
      if (category) {
        q = q ? `${q} subject:${category.toLowerCase()}` : `subject:${category.toLowerCase()}`;
      }
      if (!q) {
        q = 'subject:fiction';
      }
      
      const updateBooks = (newBooks: OnlineBook[]) => {
        setOnlineBooks((prev) => {
          let merged = [...prev, ...newBooks];
          
          // Apply language filter if language code is specified
          if (language) {
            const langCode = language.slice(0, 2);
            merged = merged.filter((book) => book.volumeInfo?.language?.startsWith(langCode));
          }
          
          // Filter out duplicate titles for cleaner rendering
          return merged.filter((book, index, self) =>
            self.findIndex(b => b.volumeInfo?.title?.toLowerCase() === book.volumeInfo?.title?.toLowerCase()) === index
          );
        });
      };

      const fetchGoogle = async () => {
        try {
          let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=25`;
          if (language) url += `&langRestrict=${language.slice(0, 2)}`;
          
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (!data.error && data.items) {
              const books = data.items.map((b: any): OnlineBook => {
                const saleability = b.saleInfo?.saleability;
                const isFree = saleability === 'FREE_ON_GOOGLE_PLAY' || saleability === 'FREE';
                const hasPrice = b.saleInfo?.retailPrice;
                const priceStr = hasPrice 
                  ? `₹${Math.round(b.saleInfo.retailPrice.amount)}` 
                  : (isFree ? 'Free' : '₹149');
                
                return {
                  id: b.id,
                  source: 'Google Books',
                  isPremium: !isFree,
                  price: isFree ? undefined : priceStr,
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
                };
              });
              updateBooks(books);
            }
          }
        } catch (e) {
          console.error('Google Books error:', e);
        }
      };

      const fetchOpenLibrary = async () => {
        try {
          let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(queryVal || category || 'fiction')}&limit=25`;
          if (language) olUrl += `&language=${language}`;
          
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
          console.error('Open Library fetch error:', e);
        }
      };

      const fetchGutenberg = async () => {
        try {
          let gutendexUrl = `https://gutendex.com/books/?search=${encodeURIComponent(queryVal || category || 'fiction')}`;
          if (language) gutendexUrl += `&languages=${language.slice(0, 2)}`;
          
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
          console.error('Gutendex error:', e);
        }
      };

      // Run fetches in parallel, letting each stream results into the UI as soon as it resolves.
      // Google Books usually returns in <300ms, making the global catalog search feel instant.
      await Promise.allSettled([
        fetchGoogle(),
        fetchOpenLibrary(),
        fetchGutenberg()
      ]);
    } catch (error) {
      console.error('Fatal Error fetching books:', error);
    } finally {
      setIsLoadingOnline(false);
    }
  }, [debouncedSearchQuery, category, language]);

  // Execute search automatically when tab switches to online, or when query, category, or language changes
  useEffect(() => {
    if (activeTab === 'online') {
      searchOnlineLibrary();
    }
  }, [activeTab, debouncedSearchQuery, category, language, searchOnlineLibrary]);

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
      { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.images', is_premium: true },
      { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.images', is_premium: true }
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
  const filteredLocalBooks = allLocalBooks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeReadingBook) {
    return (
      <div className="h-[calc(100vh-7rem)] w-full flex flex-col gap-4 relative animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-bold text-foreground truncate max-w-sm">{activeReadingBook.title}</h2>
          </div>
          <Button onClick={() => setActiveReadingBook(null)} variant="secondary" size="sm" className="px-5">
            Exit Reader
          </Button>
        </div>
        <div className="flex-1 relative bg-[#090b11] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          {activeReadingBook.googleId ? (
            <GoogleBookViewer bookId={activeReadingBook.googleId} />
          ) : activeReadingBook.isGoogleBook || activeReadingBook.isInternetArchive ? (
            <iframe src={activeReadingBook.url} className="w-full h-full border-0 bg-white" allowFullScreen title={activeReadingBook.title}></iframe>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center bg-slate-950/80 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-muted text-xs animate-pulse">CORS-verified fallback decoding... Loading pages.</p>
                </div>
              </div>
              <Reader bookUrl={activeReadingBook.url} bookId="inline-book" userId={userId} title={activeReadingBook.title} />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Floating Glass Search & Overview Dashboard */}
      <div className="relative bg-slate-950/40 backdrop-blur-md border border-slate-800/60 p-6 md:p-8 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
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
          <div className="relative w-full md:w-80 max-w-full">
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
        )}
      </div>

      {/* Advanced filters on Online tab */}
      {activeTab === 'online' && (
        <div className="bg-slate-950/20 border border-slate-850 p-5 rounded-2xl flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2 duration-300">
          <div className="flex-1 min-w-[200px] space-y-1.5">
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

          <div className="flex-grow-0 min-w-[150px] space-y-1.5">
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

          <Button 
            onClick={() => {
              setDebouncedSearchQuery(searchQuery);
              searchOnlineLibrary(searchQuery);
            }}
            className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all transform shrink-0 h-10 flex items-center justify-center gap-1.5"
          >
            <span>Query Servers</span>
          </Button>
        </div>
      )}

      {/* Premium lounge banner card */}
      {activeTab === 'premium' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-600/5 to-amber-500/15 p-6 md:p-8 rounded-3xl border border-warning/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(245,158,11,0.02)] animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1 bg-warning text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              ✨ Premium Lounge
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Unlock Immersive Best-Sellers</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Get immediate, unrestricted cloud access to premium titles, deep milestones logs, customizable reader theme packages, and offline claimable VIP perks.
            </p>
          </div>
          {!isPremiumUser && (
            <Button 
              className="bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-slate-950 font-black px-8 py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-sm shrink-0"
              onClick={() => {
                setLockedBookToUnlock({ title: 'ReadSphere Premium Membership', author: 'All Access Upgrade' });
                setIsUpgradeModalOpen(true);
              }}
            >
              🚀 Upgrade for ₹49/wk
            </Button>
          )}
        </div>
      )}

      {/* Core Book List Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        
        {/* Render Bookshelf Books */}
        {activeTab === 'local' && (
          filteredLocalBooks.length > 0 ? (
            filteredLocalBooks.map((book) => (
              <Card key={book.id || book.title} className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-slate-950/40 backdrop-blur-sm border-slate-800 shadow-xl hover:translate-y-[-2px] flex flex-col justify-between overflow-hidden">
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveReadingBook({ url: book.file_url || '', title: book.title }); }}>
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
                    <div className="absolute bottom-2.5 right-2.5 bg-primary text-white text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10 flex items-center gap-1">
                      <span>READ NOW</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-slate-100">{book.title}</h3>
                    <p className="text-xs text-slate-500 truncate mt-1">{book.author}</p>
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
          isLoadingOnline ? (
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
                  const newBook = {
                    id: book.id,
                    title: info.title,
                    author: info.authors?.[0] || 'Unknown Author',
                    cover_url: thumbnail || '',
                    file_url: book.accessInfo?.epub?.downloadLink || `https://www.gutenberg.org/ebooks/1342.epub.images`,
                    is_premium: !!book.isPremium
                  };
                  
                  if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                    const updated = [newBook, ...addedList];
                    localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                    setLocalAddedBooks(updated);
                    alert(`"${info.title}" added to your bookshelf successfully!`);
                  }
                } catch (e) {
                  console.error('Error adding to library:', e);
                }
              };

              return (
                <Card 
                  key={`${book.id}-${index}`} 
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-slate-950/40 backdrop-blur-sm border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden"
                  onClick={() => {
                    if (book.isPremium) {
                      setSelectedStoreBook(book);
                      setIsStoreModalOpen(true);
                    } else {
                      if (book.isOpenLibrary) {
                        if (book.accessInfo?.ia) {
                          setActiveReadingBook({ url: `https://archive.org/stream/${book.accessInfo.ia}?ui=embed`, title: info.title, isInternetArchive: true });
                        } else {
                          window.open(info.infoLink || `https://archive.org/details/${book.accessInfo?.ia}`, '_blank');
                        }
                      } else if (book.accessInfo?.epub?.downloadLink) {
                        setActiveReadingBook({ url: book.accessInfo.epub.downloadLink, title: info.title, isGoogleBook: false });
                      } else {
                        // Standard Gutenberg fallback
                        setActiveReadingBook({ url: `https://www.gutenberg.org/ebooks/1342.epub.images`, title: info.title });
                      }
                    }
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
                    
                    {/* Catalog Source Tag */}
                    <div className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 shadow z-10 uppercase tracking-widest">
                      {book.source || 'Global'}
                    </div>

                    {/* Pricing lock tag */}
                    <div className={`absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded shadow z-10 uppercase tracking-widest ${
                      book.isPremium 
                        ? 'bg-gradient-to-r from-warning to-amber-500 text-slate-950' 
                        : 'bg-green-500/10 text-green-400 border border-green-500/25'
                    }`}>
                      {book.isPremium ? (book.price || 'VIP') : 'FREE'}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-primary text-white text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10">
                      {book.isPremium ? 'STORE DEAL' : 'READ NOW'}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3 bg-slate-950/10">
                    <div>
                      <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-slate-100">{info.title}</h3>
                      <p className="text-xs text-slate-500 truncate mt-1">{info.authors?.[0] || 'Unknown Author'}</p>
                    </div>

                    <Button 
                      size="sm" 
                      variant={isAdded ? 'secondary' : 'primary'} 
                      className={`w-full text-[10px] py-2 h-auto font-black flex items-center justify-center gap-1 rounded-xl transition-all ${
                        isAdded ? 'bg-slate-900/60 text-green-400 border border-green-500/20 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      onClick={handleAddToLibrary}
                      disabled={isAdded}
                    >
                      {isAdded ? '✓ Added' : '➕ Add to Bookshelf'}
                    </Button>
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
            const isClassic = book.id.startsWith('classic');
            return (
              <Card 
                key={book.id} 
                className="group cursor-pointer hover:border-warning/50 transition-all duration-300 bg-slate-950/40 backdrop-blur-sm border-slate-800 shadow-xl hover:translate-y-[-2px] flex flex-col justify-between overflow-hidden relative"
                onClick={() => {
                  if (isPremiumUser) {
                    if (isClassic) {
                      setActiveReadingBook({ url: (book as any).file_url, title: book.title });
                    } else {
                      window.open(`/reader/${book.id}`, '_blank');
                    }
                  } else {
                    setLockedBookToUnlock({ title: book.title, author: book.author, cover_url: book.cover_url });
                    setIsUpgradeModalOpen(true);
                  }
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

                  {/* Lock Screen Overlay if user lacks premium */}
                  {!isPremiumUser && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 group-hover:bg-slate-950/70 transition-all duration-300">
                      <div className="w-10 h-10 rounded-2xl bg-warning/15 flex items-center justify-center border border-warning/20 text-warning group-hover:scale-110 transition-transform">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold text-warning tracking-widest uppercase bg-warning/10 px-2 py-0.5 rounded border border-warning/20">LOCKED</span>
                    </div>
                  )}

                  {isPremiumUser && (
                    <div className="absolute bottom-2.5 right-2.5 bg-warning text-black text-[9px] font-black px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider z-10">
                      READ NOW
                    </div>
                  )}
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
            <p className="text-xs text-slate-500">
              Upgrade to ReadSphere Premium or hit 500 Weekly Reading Minutes to unlock the entire lounge instantly!
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

      {/* Premium Store Deal Purchase Modal */}
      <Modal 
        isOpen={isStoreModalOpen} 
        onClose={() => { if (!isPurchasing) setIsStoreModalOpen(false); }}
        title=""
      >
        {selectedStoreBook && (() => {
          const info = selectedStoreBook.volumeInfo || {};
          const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:');
          const price = selectedStoreBook.price || '₹149';
          
          const handlePurchaseBook = () => {
            setIsPurchasing(true);
            setTimeout(() => {
              try {
                const addedList = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
                const newBook = {
                  id: selectedStoreBook.id,
                  title: info.title,
                  author: info.authors?.[0] || 'Unknown Author',
                  cover_url: thumbnail || '',
                  file_url: selectedStoreBook.accessInfo?.epub?.downloadLink || `https://www.gutenberg.org/ebooks/84.epub.images`,
                  is_premium: false
                };
                
                if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                  const updated = [newBook, ...addedList];
                  localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                  setLocalAddedBooks(updated);
                }
                
                setIsPurchasing(false);
                setIsStoreModalOpen(false);
                alert(`Congratulations! You have successfully purchased "${info.title}" for ${price}! It is now unlocked in your bookshelves!`);
                setActiveReadingBook({ url: newBook.file_url, title: newBook.title });
              } catch (e) {
                console.error(e);
                setIsPurchasing(false);
              }
            }, 1800);
          };

          return (
            <div className="text-center space-y-6 py-4 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] pointer-events-none"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-warning uppercase tracking-widest bg-warning/10 px-3 py-1 rounded-full border border-warning/20">PREMIUM STORE DEAL</span>
                <h3 className="text-xl font-bold text-white mt-3 leading-tight">{info.title}</h3>
                <p className="text-xs text-indigo-300 font-medium">{info.authors?.[0] || 'Unknown Author'}</p>
              </div>

              <div className="flex gap-4 items-center bg-slate-950/60 p-4 border border-slate-850 rounded-2xl max-w-sm mx-auto shadow-inner">
                {thumbnail ? (
                  <img src={thumbnail} alt={info.title} className="w-16 h-24 object-cover rounded shadow shadow-black/60 shrink-0" />
                ) : (
                  <div className="w-16 h-24 bg-slate-900 flex items-center justify-center text-xs p-1 text-center font-bold text-slate-600 rounded shrink-0 border border-slate-800">No Cover</div>
                )}
                <div className="text-left flex-1 space-y-1.5 overflow-hidden">
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">{info.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Language: {info.language?.toUpperCase() || 'ENG'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-warning/10 to-amber-500/10 border border-warning/25 rounded-2xl p-4 flex justify-between items-center max-w-sm mx-auto">
                <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">Razorpay Price:</span>
                <span className="text-xl font-extrabold text-warning font-mono">{price}</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-2 max-w-sm mx-auto">
                <Button 
                  onClick={handlePurchaseBook}
                  disabled={isPurchasing}
                  className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-slate-950 font-black py-4 shadow-[0_0_15px_rgba(245,158,11,0.25)] rounded-xl relative text-sm"
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                      <span>Contacting Razorpay APIs...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>💳</span> Buy Instantly via Razorpay
                    </span>
                  )}
                </Button>
                <Button 
                  onClick={() => setIsStoreModalOpen(false)}
                  disabled={isPurchasing}
                  variant="ghost" 
                  className="w-full text-slate-500 hover:text-slate-300 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
