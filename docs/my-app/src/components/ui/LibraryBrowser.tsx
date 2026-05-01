'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Reader from '@/components/ui/Reader';

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
  
  // For local device reading
  const [localDeviceBookUrl, setLocalDeviceBookUrl] = useState<string | null>(null);

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

  const searchOpenLibrary = async () => {
    setIsLoadingOnline(true);
    try {
      let url = 'https://openlibrary.org/search.json?';
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (category) params.append('subject', category.toLowerCase());
      if (language) params.append('language', language);
      
      // Default query if nothing is provided
      if (!searchQuery && !category) {
        params.append('q', 'bestseller');
      }

      url += params.toString();
      
      const res = await fetch(url);
      const data = await res.json();
      setOnlineBooks(data.docs?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error fetching from Open Library:', error);
    } finally {
      setIsLoadingOnline(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'online') {
      searchOpenLibrary();
    }
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalDeviceBookUrl(url);
    }
  };

  if (localDeviceBookUrl) {
    return (
      <div className="h-[calc(100vh-6rem)] w-full flex flex-col gap-4">
        <div>
          <Button onClick={() => setLocalDeviceBookUrl(null)} variant="secondary">
            Close Reader
          </Button>
        </div>
        <div className="flex-1">
          <Reader bookUrl={localDeviceBookUrl} bookId="device-local" userId={userId} />
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
            Open Library
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
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search books..." 
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
              {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
            </select>
            <Button onClick={searchOpenLibrary}>Search</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {activeTab === 'local' && (
          initialBooks.length > 0 ? (
            initialBooks.map((book) => (
              <Card key={book.id} className="group cursor-pointer hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800">
                <a href={`/reader/${book.id}`}>
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
            <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-800 rounded-xl">
              <p>No books available yet.</p>
            </div>
          )
        )}

        {activeTab === 'online' && (
          isLoadingOnline ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : onlineBooks.length > 0 ? (
            onlineBooks.map((book) => (
              <Card key={book.key} className="group cursor-pointer hover:border-primary/50 transition-colors bg-surface/50 backdrop-blur-sm border-gray-800">
                <a href={`https://openlibrary.org${book.key}`} target="_blank" rel="noreferrer">
                  <div className="aspect-[2/3] w-full bg-gray-800 relative rounded-t-lg overflow-hidden">
                    {book.cover_i ? (
                      <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-xs p-2 text-center">{book.title}</div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">{book.title}</h3>
                    <p className="text-xs text-muted truncate mt-1">{book.author_name?.[0] || 'Unknown Author'}</p>
                  </CardContent>
                </a>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-800 rounded-xl">
              <p>No results found.</p>
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
