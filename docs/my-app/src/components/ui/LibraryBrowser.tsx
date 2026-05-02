'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';
import GoogleBookViewer from '@/components/ui/GoogleBookViewer';

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

export default function LibraryBrowser({ initialBooks, userId }: LibraryBrowserProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'online' | 'device'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onlineBooks, setOnlineBooks] = useState<any[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [readingMinutes, setReadingMinutes] = useState(25); // Simulated minutes for MVP
  
  
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

  const searchOnlineLibrary = async () => {
    setIsLoadingOnline(true);
    try {
      let q = searchQuery || '';
      if (category) {
        q = q ? `${q} subject:${category.toLowerCase()}` : `subject:${category.toLowerCase()}`;
      }
      if (!q) {
        q = 'subject:fiction';
      }
      
      let items: any[] = [];
      
      // 1. Try Google Books API
      try {
        let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;
        if (language) url += `&langRestrict=${language.slice(0, 2)}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!data.error && data.items) {
            items = data.items;
          }
        }
      } catch (e) {
        console.error('Google Books error:', e);
      }

      // 2. Fetch from Open Library (massive database)
      try {
        let olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery || category || 'fiction')}&limit=30`;
        if (language) olUrl += `&language=${language}`;
        
        const olRes = await fetch(olUrl);
        if (olRes.ok) {
          const olData = await olRes.json();
          const olItems = (olData.docs || []).map((b: any, i: number) => ({
            id: b.key ? b.key.replace('/works/', '') : `ol-${i}`,
            isOpenLibrary: true,
            volumeInfo: {
              title: b.title || 'Unknown Title',
              authors: b.author_name || ['Unknown Author'],
              imageLinks: {
                thumbnail: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null
              },
              infoLink: b.key ? `https://openlibrary.org${b.key}` : '#',
              previewLink: b.key ? `https://openlibrary.org${b.key}` : '#',
              language: b.language?.[0] || 'eng'
            },
            accessInfo: {
              ia: b.ia?.[0]
            }
          }));
          items = [...items, ...olItems];
        } else {
          console.warn('Open Library returned status:', olRes.status);
        }
      } catch (e) {
        console.error('Open Library fetch error:', e);
      }
      
      // 3. Ultra-safe Fallback to Gutendex if both APIs failed (e.g. rate limit + 500 error)
      if (items.length === 0) {
        try {
          console.warn('Both GB and OL failed or returned 0, falling back to Gutendex...');
          let gutendexUrl = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery || category || 'fiction')}`;
          if (language) gutendexUrl += `&languages=${language.slice(0, 2)}`;
          
          const gRes = await fetch(gutendexUrl);
          if (gRes.ok) {
            const gData = await gRes.json();
            const gItems = (gData.results || []).map((b: any) => ({
              id: `gutendex-${b.id}`,
              volumeInfo: {
                title: b.title || 'Unknown Title',
                authors: Array.isArray(b.authors) ? b.authors.map((a: any) => a.name) : ['Unknown Author'],
                imageLinks: {
                  thumbnail: b.formats?.['image/jpeg'] || null
                },
                infoLink: `https://www.gutenberg.org/ebooks/${b.id}`,
                previewLink: `https://www.gutenberg.org/ebooks/${b.id}`,
                language: b.languages?.[0] || 'en'
              },
              accessInfo: {
                epub: { downloadLink: b.formats?.['application/epub+zip'] || null }
              }
            }));
            items = gItems;
          }
        } catch (e) {
          console.error('Gutendex error:', e);
        }
      }
      
      // Filter by language strictly if requested
      if (language && items.length > 0) {
        const langCode = language.slice(0, 2);
        items = items.filter((book: any) => book.volumeInfo?.language?.startsWith(langCode));
      }
      
      setOnlineBooks(items);
    } catch (error) {
      console.error('Fatal Error fetching books:', error);
    } finally {
      setIsLoadingOnline(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'online') {
      searchOnlineLibrary();
    }
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveReadingBook({ url, title: file.name });
    }
  };

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
            <span className="font-semibold text-primary">Weekly Perks</span>
            <span className="text-muted">{readingMinutes} / 500 mins</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
            <div className="bg-gradient-to-r from-primary to-cyan-400 h-2 rounded-full" style={{ width: `${(Math.min(readingMinutes, 500) / 500) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-muted text-center">Read 500 mins to unlock a free offline download!</p>
        </div>
        
        <div className="flex bg-surface p-1 rounded-lg border border-gray-800">
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
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'device' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('device')}
          >
            From Device
          </button>
        </div>
      </div>

      {activeTab === 'online' && (
        <div className="flex flex-col gap-4 bg-surface p-4 rounded-xl border border-gray-800">
          <form onSubmit={(e) => { e.preventDefault(); searchOnlineLibrary(); }} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search global library for free books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-background border border-gray-700 rounded-md px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-background border border-gray-700 rounded-md px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Any Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-gray-700 rounded-md px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Global Languages</option>
              {languages.filter(l => l.code !== '').map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            <Button type="submit">Search</Button>
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
                <a key={book.id} href={`/reader/${book.id}`} target="_blank" className="flex-shrink-0 w-32 group">
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded overflow-hidden">
                    {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="text-xs p-2 text-center text-muted">No Cover</div>}
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {activeTab === 'local' && (
          initialBooks.length > 0 ? (
            initialBooks.map((book) => (
              <Card key={book.id} className="group cursor-pointer hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800">
                <a href={`/reader/${book.id}`} target="_blank">
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-xs">No Cover</div>
                    )}
                    {book.is_premium && (
                      <div className="absolute top-2 right-2 bg-warning text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        PREMIUM
                      </div>
                    )}
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
                  <a href={`/reader/${book.id}`} target="_blank" onClick={(e) => { e.preventDefault(); setActiveReadingBook({ url: book.file_url, title: book.title }); }}>
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
                <p>Welcome! Above are some classic starter books. You can upload more in the Admin panel.</p>
              </div>
            </>
          )
        )}

        {activeTab === 'online' && (
          isLoadingOnline ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : onlineBooks.length > 0 ? (
            onlineBooks.map((book, index) => {
              const info = book.volumeInfo || {};
              const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:');
              const embedUrl = book.isOpenLibrary ? null : `https://books.google.com/books?id=${book.id}&lpg=PP1&pg=PP1&output=embed`;

              return (
                <Card 
                  key={`${book.id}-${index}`} 
                  className="group cursor-pointer hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800"
                  onClick={() => {
                    if (book.isOpenLibrary) {
                      if (book.accessInfo?.ia) {
                        setActiveReadingBook({ url: `https://archive.org/stream/${book.accessInfo.ia}?ui=embed`, title: info.title, isInternetArchive: true });
                      } else {
                        window.open(info.infoLink || `https://archive.org/details/${book.accessInfo?.ia}`, '_blank');
                      }
                    } else if (book.accessInfo?.epub?.downloadLink) {
                      setActiveReadingBook({ url: book.accessInfo.epub.downloadLink, title: info.title, isGoogleBook: false });
                    } else {
                      setActiveReadingBook({ url: '', title: info.title, googleId: book.id });
                    }
                  }}
                >
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt={info.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-xs p-2 text-center">{info.title}</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      READ PREVIEW
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">{info.title}</h3>
                    <p className="text-xs text-muted truncate mt-1">{info.authors?.[0] || 'Unknown Author'}</p>
                    
                    {readingMinutes >= 500 && (
                      <Button size="sm" variant="secondary" className="w-full mt-3 text-[10px] py-1 h-auto" onClick={(e) => { e.stopPropagation(); window.open(info.infoLink || info.previewLink, '_blank'); }}>
                        Google Books Page
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-xl bg-surface/30">
              <p className="text-muted text-lg font-medium mb-2">No free books found for this search.</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any free books matching "{searchQuery || category || 'your search'}". Try using broader terms, checking your spelling, or adjusting the language filter. Remember to hit the <strong>Search</strong> button!
              </p>
            </div>
          )
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
    </div>
  );
}
