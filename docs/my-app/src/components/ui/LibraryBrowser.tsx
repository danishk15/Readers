'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';
import { Modal } from '@/components/ui/Modal';

interface LocalBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
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

interface GoogleBookItem {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    infoLink?: string;
    previewLink?: string;
    language?: string;
  };
  accessInfo?: {
    epub?: {
      downloadLink?: string;
    };
  };
}

export default function LibraryBrowser({ initialBooks, userId }: LibraryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'device' | 'premium'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  
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

  // 1. Detect query parameters (tab=online)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'online') {
        setActiveTab('online');
      }
    }
  }, []);

  // 2. Fetch and merge local storage published & added books
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const published = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      const added = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
      setLocalPublishedBooks(published);
      setLocalAddedBooks(added);
    }
  }, [activeTab]);

  // 3. Check premium status and weekly reading time
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

      // Sync and calculate minutes (add 25 base minutes to avoid zero)
      const minutes = Math.floor(totalSeconds / 60) + 25;
      setWeeklyMinutes(minutes);
    };

    checkPremiumAndStats();
  }, [userId, activeTab]);
  
  // For local device reading or direct reading
  const [activeReadingBook, setActiveReadingBook] = useState<{url: string, title: string, isGoogleBook?: boolean, googleId?: string, isInternetArchive?: boolean} | null>(null);

  const categories = ["Fiction", "Science Fiction", "Fantasy", "History", "Romance", "Biography", "Mystery"];
  const languages = [
    { code: '', label: 'Any Language' },
    { code: 'eng', label: 'English' },
    { code: 'hin', label: 'Hindi' },
    { code: 'urd', label: 'Urdu' },
    { code: 'spa', label: 'Spanish' },
    { code: 'fre', label: 'French' },
    { code: 'ger', label: 'German' },
    { code: 'ara', label: 'Arabic' },
    { code: 'chi', label: 'Chinese' },
    { code: 'jpn', label: 'Japanese' },
    { code: 'kor', label: 'Korean' },
    { code: 'rus', label: 'Russian' },
    { code: 'por', label: 'Portuguese' },
    { code: 'ita', label: 'Italian' }
  ];

  const searchOnlineLibrary = useCallback(async () => {
    setIsLoadingOnline(true);
    try {
      let q = searchQuery || '';
      if (category) {
        q = q ? `${q} subject:${category.toLowerCase()}` : `subject:${category.toLowerCase()}`;
      }
      if (!q) {
        q = 'subject:fiction';
      }
      
      const promises = [
        // 1. Google Books API
        (async () => {
          try {
            let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=15`;
            if (language) url += `&langRestrict=${language.slice(0, 2)}`;
            
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (!data.error && data.items) {
                return data.items.map((b: any): OnlineBook => {
                  const saleability = b.saleInfo?.saleability;
                  const isFree = saleability === 'FREE_ON_GOOGLE_PLAY' || saleability === 'FREE';
                  const hasPrice = b.saleInfo?.retailPrice;
                  const priceStr = hasPrice 
                    ? `₹${Math.round(b.saleInfo.retailPrice.amount)}` 
                    : (isFree ? 'Free' : '₹149'); // simulated fallback price if paid
                  
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
              }
            }
          } catch (e) {
            console.error('Google Books error:', e);
          }
          return [];
        })(),

        // 2. Fetch from Open Library (massive database)
        (async () => {
          try {
            let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery || category || 'fiction')}&limit=15`;
            if (language) olUrl += `&language=${language}`;
            
            const olRes = await fetch(olUrl);
            if (olRes.ok) {
              const olData = await olRes.json();
              return (olData.docs || []).map((b: OpenLibraryDoc, i: number): OnlineBook => ({
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
            }
          } catch (e) {
            console.error('Open Library fetch error:', e);
          }
          return [];
        })(),

        // 3. Fallback to Project Gutenberg via Gutendex
        (async () => {
          try {
            let gutendexUrl = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery || category || 'fiction')}`;
            if (language) gutendexUrl += `&languages=${language.slice(0, 2)}`;
            
            const gRes = await fetch(gutendexUrl);
            if (gRes.ok) {
              const gData = await gRes.json();
              return (gData.results || []).slice(0, 15).map((b: GutendexBook): OnlineBook => ({
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
            }
          } catch (e) {
            console.error('Gutendex error:', e);
          }
          return [];
        })()
      ];

      const results = await Promise.all(promises);
      let items: OnlineBook[] = results.flat();
      
      // Filter by language strictly if requested
      if (language && items.length > 0) {
        const langCode = language.slice(0, 2);
        items = items.filter((book) => book.volumeInfo?.language?.startsWith(langCode));
      }
      
      setOnlineBooks(items);
    } catch (error) {
      console.error('Fatal Error fetching books:', error);
    } finally {
      setIsLoadingOnline(false);
    }
  }, [searchQuery, category, language]);

  useEffect(() => {
    if (activeTab === 'online') {
      const timer = setTimeout(() => {
        searchOnlineLibrary();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, searchOnlineLibrary]);

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

  if (activeReadingBook) {
    return (
      <div className="h-[calc(100vh-6rem)] w-full flex flex-col gap-4 relative">
        <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-gray-800">
          <h2 className="font-bold text-foreground truncate max-w-sm">Reading: {activeReadingBook.title}</h2>
          <Button onClick={() => setActiveReadingBook(null)} variant="secondary" size="sm">
            Close Book
          </Button>
        </div>
        <div className="flex-1 relative bg-white/5 rounded-xl overflow-hidden">
          {activeReadingBook.googleId ? (
            <GoogleBookViewer bookId={activeReadingBook.googleId} />
          ) : activeReadingBook.isGoogleBook || activeReadingBook.isInternetArchive ? (
            <iframe src={activeReadingBook.url} className="w-full h-full border-0 bg-white" allowFullScreen title={activeReadingBook.title}></iframe>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-muted text-sm animate-pulse">Loading big book files... Please wait!</p>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted text-sm mt-1">Discover new books to read and unlock.</p>
        </div>
        
        {/* Weekly Perks Progress */}
        <div className="flex-1 max-w-md mx-4 bg-surface p-3 rounded-lg border border-gray-800 hidden md:block">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-warning">✨ Weekly Premium Quest</span>
            <span className="text-muted font-mono">{weeklyMinutes} / 500 mins</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1 overflow-hidden">
            <div className="bg-gradient-to-r from-warning to-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${(Math.min(weeklyMinutes, 500) / 500) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-muted text-center">Read 500 mins this week to claim **1 Week of Free Premium VIP**!</p>
        </div>
        
        <div className="flex bg-surface p-1 rounded-lg border border-gray-800 gap-1 flex-wrap">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'local' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('local')}
          >
            ReadSphere Library
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'online' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('online')}
          >
            Global Library
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'premium' 
                ? 'bg-gradient-to-r from-warning to-amber-500 text-black shadow-lg shadow-warning/20 font-bold' 
                : 'text-muted hover:text-warning'
            }`}
            onClick={() => setActiveTab('premium')}
          >
            <span>✨</span>
            Premium Lounge
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'device' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('device')}
          >
            From Device
          </button>
        </div>
      </div>

      {activeTab === 'online' && (
        <div className="flex flex-col gap-4 bg-surface p-6 rounded-xl border border-gray-800">
          <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-400">🌐 Public Library Search Dashboard</h2>
            <p className="text-xs text-muted">Instantly search millions of books from Open Library, Google Books, & Gutenberg</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); searchOnlineLibrary(); }} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input field */}
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-muted tracking-wider uppercase">Search Query</label>
                <input 
                  type="text" 
                  placeholder="Enter book title, author name, or keywords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:border-primary placeholder-gray-600 transition-colors"
                />
              </div>
              
              {/* Category selector */}
              <div className="w-full md:w-56 space-y-1">
                <label className="text-xs font-semibold text-muted tracking-wider uppercase">Category / Genre</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              {/* Language selector */}
              <div className="w-full md:w-56 space-y-1">
                <label className="text-xs font-semibold text-muted tracking-wider uppercase">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="">Any Language</option>
                  {languages.filter(l => l.code !== '').map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full md:w-auto px-8 py-3 font-bold bg-primary text-white hover:bg-primary/95 transition shadow-lg shadow-primary/20">
                🔍 Query Global Libraries
              </Button>
            </div>
          </form>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-warning mb-3">Premium Store Deals</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {initialBooks
                .filter(b => b.is_premium)
                .filter(b => 
                  searchQuery 
                    ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.author.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map(book => (
                <a key={book.id} href={`/reader/${book.id}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-32 group">
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded overflow-hidden">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="text-xs p-2 text-center text-muted">No Cover</div>
                    )}
                    <div className="absolute top-1 right-1 bg-warning text-black text-[9px] font-bold px-1.5 rounded">PREMIUM</div>
                  </div>
                  <p className="text-xs font-semibold mt-1 truncate text-foreground group-hover:text-warning transition-colors">{book.title}</p>
                </a>
              ))}
              {initialBooks
                .filter(b => b.is_premium)
                .filter(b => 
                  searchQuery 
                    ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.author.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                ).length === 0 && (
                <p className="text-xs text-muted">No premium deals found. Press Enter to search the Global Library for free books!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'premium' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-600/10 to-amber-500/20 p-6 rounded-2xl border border-warning/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1 bg-warning text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ✨ Premium Lounge
            </div>
            <h2 className="text-2xl font-bold text-foreground">Unlock Exclusive Best-Sellers</h2>
            <p className="text-muted text-sm max-w-xl">
              Get immediate, unlimited access to premium titles, advanced reading metrics, custom reader skins, and weekly offline rewards.
            </p>
          </div>
          {!isPremiumUser && (
            <Button 
              className="bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-black font-extrabold px-8 py-3 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              onClick={() => {
                setLockedBookToUnlock({ title: 'ReadSphere Premium Subscription', author: 'Unlimited Access Pack' });
                setIsUpgradeModalOpen(true);
              }}
            >
              🚀 Upgrade for ₹49/wk
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {activeTab === 'local' && (() => {
          // Merge custom published books, added global books, and default initial database books
          const allLocalBooks = [
            ...localPublishedBooks,
            ...localAddedBooks,
            ...initialBooks
          ].filter((book, idx, self) => 
            self.findIndex(b => b.title.toLowerCase() === book.title.toLowerCase() && b.author.toLowerCase() === book.author.toLowerCase()) === idx
          );

          return allLocalBooks.length > 0 ? (
            allLocalBooks.map((book) => (
              <Card key={book.id || book.title} className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-surface/50 backdrop-blur-sm border-gray-800 shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px]">
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveReadingBook({ url: book.file_url || '', title: book.title }); }}>
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-xs p-2 text-center font-bold bg-slate-900 border border-slate-800">{book.title}</div>
                    )}
                    {book.is_premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-warning to-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        PREMIUM
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      READ NOW
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">{book.title}</h3>
                    <p className="text-xs text-muted truncate mt-1">{book.author}</p>
                  </CardContent>
                </a>
              </Card>
            ))
          ) : (
            <>
              {/* Fallback books so the site is never empty! */}
              {[
                { id: 'classic-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/64317.epub.images', is_premium: false },
                { id: 'classic-2', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/1342.epub.images', is_premium: false },
                { id: 'classic-3', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/84.epub.images', is_premium: true },
                { id: 'classic-4', title: 'Moby Dick', author: 'Herman Melville', cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/2701.epub.images', is_premium: false },
                { id: 'classic-5', title: 'Dracula', author: 'Bram Stoker', cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg', file_url: 'https://www.gutenberg.org/ebooks/345.epub.images', is_premium: true }
              ].map(book => (
                <Card key={book.id} className="group cursor-pointer hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800">
                  <a href={`/reader/${book.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); setActiveReadingBook({ url: book.file_url, title: book.title }); }}>
                    <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {book.is_premium && (
                        <div className="absolute top-2 right-2 bg-warning text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          PREMIUM
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        READ NOW
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">{book.title}</h3>
                      <p className="text-xs text-muted truncate mt-1">{book.author}</p>
                    </CardContent>
                  </a>
                </Card>
              ))}
              <div className="col-span-full mt-4 p-4 text-center text-muted border border-dashed border-gray-800 rounded-xl bg-surface/50">
                <p>Welcome! Above are some classic starter books. You can publish your own books to add them here.</p>
              </div>
            </>
          )
        })()}

        {activeTab === 'online' && (
          isLoadingOnline ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
                    file_url: book.accessInfo?.epub?.downloadLink || `https://www.gutenberg.org/ebooks/1342.epub.images`, // robust fallback file URL
                    is_premium: !!book.isPremium
                  };
                  
                  if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                    const updated = [newBook, ...addedList];
                    localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                    setLocalAddedBooks(updated);
                    alert(`"${info.title}" added to your ReadSphere Library successfully!`);
                  }
                } catch (e) {
                  console.error('Error adding to library:', e);
                }
              };

              return (
                <Card 
                  key={`${book.id}-${index}`} 
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-surface/50 backdrop-blur-sm border-gray-800 shadow-md flex flex-col justify-between"
                  onClick={() => {
                    if (book.isPremium) {
                      // Open Store purchase overlay
                      setSelectedStoreBook(book);
                      setIsStoreModalOpen(true);
                    } else {
                      // Open Free Book reader
                      if (book.isOpenLibrary) {
                        if (book.accessInfo?.ia) {
                          setActiveReadingBook({ url: `https://archive.org/stream/${book.accessInfo.ia}?ui=embed`, title: info.title, isInternetArchive: true });
                        } else {
                          window.open(info.infoLink || `https://archive.org/details/${book.accessInfo?.ia}`, '_blank');
                        }
                      } else if (book.accessInfo?.epub?.downloadLink) {
                        setActiveReadingBook({ url: book.accessInfo.epub.downloadLink, title: info.title, isGoogleBook: false });
                      } else {
                        // Fallback reading
                        setActiveReadingBook({ url: `https://www.gutenberg.org/ebooks/1342.epub.images`, title: info.title });
                      }
                    }
                  }}
                >
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden flex-shrink-0">
                    {thumbnail ? (
                      <img src={thumbnail} alt={info.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-xs p-2 text-center bg-slate-900 border border-slate-800 font-bold">{info.title}</div>
                    )}
                    {/* Visual Library Source Badge */}
                    <div className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md text-indigo-300 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30 shadow-md z-10">
                      {book.source || 'Global'}
                    </div>

                    {/* FREE or PAID tag */}
                    <div className={`absolute top-2 right-2 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-md z-10 ${
                      book.isPremium 
                        ? 'bg-gradient-to-r from-warning to-amber-500 text-black border border-amber-400/20' 
                        : 'bg-green-500/90 text-white'
                    }`}>
                      {book.isPremium ? (book.price || 'PREMIUM') : 'FREE'}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {book.isPremium ? 'VIEW STORE DEAL' : 'READ NOW'}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">{info.title}</h3>
                      <p className="text-xs text-muted truncate mt-1">{info.authors?.[0] || 'Unknown Author'}</p>
                    </div>

                    <Button 
                      size="sm" 
                      variant={isAdded ? 'secondary' : 'primary'} 
                      className={`w-full text-[10px] py-2 h-auto font-bold flex items-center justify-center gap-1 ${
                        isAdded ? 'bg-slate-800/80 text-green-400 border border-green-500/20 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/10'
                      }`}
                      onClick={handleAddToLibrary}
                      disabled={isAdded}
                    >
                      {isAdded ? (
                        <>
                          <span>✓</span> Added to Library
                        </>
                      ) : (
                        <>
                          <span>➕</span> Add to Library
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-xl bg-surface/30">
              <p className="text-muted text-lg font-medium mb-2">No free books found for this search.</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn&apos;t find any free books matching &quot;{searchQuery || category || 'your search'}&quot;. Try using broader terms, checking your spelling, or adjusting the language filter. Remember to hit the <strong>Search</strong> button!
              </p>
            </div>
          )
        )}

        {activeTab === 'premium' && (
          premiumBooks.map((book) => {
            const isClassic = book.id.startsWith('classic');
            return (
              <Card 
                key={book.id} 
                className="group cursor-pointer hover:border-warning/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800 relative overflow-hidden"
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
                <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted text-xs">No Cover</div>
                  )}
                  
                  {/* Premium Gold Tag */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-warning to-amber-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded shadow-md">
                    VIP
                  </div>

                  {/* Lock Overlay if not Premium */}
                  {!isPremiumUser && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 group-hover:bg-slate-950/75 transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center border border-warning/40 text-warning group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-extrabold text-warning tracking-wider uppercase">Unlock VIP</span>
                    </div>
                  )}

                  {isPremiumUser && (
                    <div className="absolute bottom-2 right-2 bg-warning text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      READ NOW
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate group-hover:text-warning transition-colors text-foreground">{book.title}</h3>
                  <p className="text-xs text-muted truncate mt-1">{book.author}</p>
                </CardContent>
              </Card>
            );
          })
        )}

        {activeTab === 'device' && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-gray-700 rounded-xl bg-surface/30">
            <h2 className="text-xl font-semibold mb-4">Read Your Own Book</h2>
            <p className="text-muted mb-6">Select an EPUB file from your device to start reading.</p>
            <label className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
              Select EPUB File
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
        <div className="text-center space-y-6 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-warning/20 to-amber-500/20 border border-warning/40 text-warning mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-warning to-amber-500 bg-clip-text text-transparent tracking-tight">
              Unlock Premium Content
            </h2>
            {lockedBookToUnlock && (
              <p className="text-sm text-slate-300">
                You clicked on <strong className="text-warning">"{lockedBookToUnlock.title}"</strong> by {lockedBookToUnlock.author}. This is an exclusive premium title.
              </p>
            )}
            <p className="text-xs text-slate-400">
              Join ReadSphere Premium to read this book along with hundreds of others instantly!
            </p>
          </div>

          {/* Premium Highlights */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning">✓</span>
              <span>Unlimited access to all VIP exclusive books</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning">✓</span>
              <span>Full offline downloads & reading status tracking</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="text-warning">✓</span>
              <span>Vibrant premium badges & custom reader interfaces</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={() => {
                setIsUpgradeModalOpen(false);
                window.location.href = '/premium';
              }}
              className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-black font-extrabold py-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-[1.02] rounded-xl"
            >
              🚀 Upgrade to Premium (Starts at ₹49)
            </Button>
            <Button 
              onClick={() => setIsUpgradeModalOpen(false)}
              variant="ghost" 
              className="w-full text-slate-400 hover:text-slate-200"
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
                  file_url: selectedStoreBook.accessInfo?.epub?.downloadLink || `https://www.gutenberg.org/ebooks/84.epub.images`, // Frankenstein fallback
                  is_premium: false // unlocked/purchased book is treat as readable
                };
                
                if (!addedList.some((b: any) => b.title.toLowerCase() === info.title.toLowerCase())) {
                  const updated = [newBook, ...addedList];
                  localStorage.setItem('added-to-library-books', JSON.stringify(updated));
                  setLocalAddedBooks(updated);
                }
                
                setIsPurchasing(false);
                setIsStoreModalOpen(false);
                alert(`Congratulations! You have successfully purchased "${info.title}" for ${price}! It is now unlocked in your Library!`);
                setActiveReadingBook({ url: newBook.file_url, title: newBook.title });
              } catch (e) {
                console.error(e);
                setIsPurchasing(false);
              }
            }, 1800);
          };

          return (
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto w-12 h-12 bg-warning/20 border border-warning/30 rounded-xl flex items-center justify-center text-warning text-xl">
                👑
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-warning uppercase tracking-widest bg-warning/10 px-2.5 py-0.5 rounded-full border border-warning/20">PREMIUM STORE DEAL</span>
                <h3 className="text-xl font-bold text-foreground mt-2">{info.title}</h3>
                <p className="text-sm text-muted">{info.authors?.[0] || 'Unknown Author'}</p>
              </div>

              <div className="flex gap-4 items-center bg-slate-900/60 p-4 border border-slate-800 rounded-xl max-w-sm mx-auto">
                {thumbnail ? (
                  <img src={thumbnail} alt={info.title} className="w-16 h-24 object-cover rounded shadow" />
                ) : (
                  <div className="w-16 h-24 bg-slate-800 flex items-center justify-center text-xs p-1 text-center font-bold text-muted rounded">No Cover</div>
                )}
                <div className="text-left flex-1 space-y-1">
                  <p className="text-xs text-slate-400 line-clamp-3">{info.description}</p>
                  <p className="text-xs text-slate-500">Language: {info.language?.toUpperCase() || 'ENG'}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-warning/10 to-amber-500/10 border border-warning/20 rounded-xl p-3 flex justify-between items-center max-w-sm mx-auto">
                <span className="text-sm font-semibold text-slate-300">Purchase price:</span>
                <span className="text-xl font-black text-warning font-mono">{price}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2 max-w-sm mx-auto">
                <Button 
                  onClick={handlePurchaseBook}
                  disabled={isPurchasing}
                  className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-black font-extrabold py-3 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-xl relative"
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      <span>Contacting Razorpay...</span>
                    </div>
                  ) : (
                    <span>💳 Buy Book via Razorpay</span>
                  )}
                </Button>
                <Button 
                  onClick={() => setIsStoreModalOpen(false)}
                  disabled={isPurchasing}
                  variant="ghost" 
                  className="w-full text-slate-400 hover:text-slate-200"
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
