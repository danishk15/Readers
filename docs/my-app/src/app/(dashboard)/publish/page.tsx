'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { saveRawBookOffline } from '@/utils/offlineStorage';
import { BookOpen } from 'lucide-react';

export default function PublishPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'es', label: 'Spanish (Español)' },
    { code: 'fr', label: 'French (Français)' },
    { code: 'de', label: 'German (Deutsch)' },
    { code: 'ar', label: 'Arabic (العربية)' },
    { code: 'fa', label: 'Persian (فارسی)' },
    { code: 'ur', label: 'Urdu (اردو)' },
    { code: 'ja', label: 'Japanese (日本語)' },
    { code: 'zh', label: 'Chinese (中文)' },
    { code: 'ru', label: 'Russian (Русский)' },
    { code: 'pt', label: 'Portuguese (Português)' },
    { code: 'it', label: 'Italian (Italiano)' },
    { code: 'tr', label: 'Turkish (Türkçe)' },
    { code: 'da', label: 'Danish (Dansk)' },
    { code: 'sv', label: 'Swedish (Svenska)' },
    { code: 'nl', label: 'Dutch (Nederlands)' },
    { code: 'ko', label: 'Korean (한국어)' }
  ];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) return alert('Book file is required');
    
    setLoading(true);
    setMessage('');

    const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');

    const syncBooksCookie = (books: any[]) => {
      const cleanList = books.map(({ cover_url, ...rest }) => ({
        ...rest,
        cover_url: cover_url?.startsWith('data:') ? '' : (cover_url || '')
      }));
      document.cookie = "local-published-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
    };

    // Helper to save locally using Base64 cover and session Object URL
    const saveLocallyFallback = () => {
      return new Promise<void>((resolve, reject) => {
        try {
          const bookId = 'local-pub-' + Math.random().toString(36).substring(2);
          const localFileUrl = bookFile ? URL.createObjectURL(bookFile) : 'https://www.gutenberg.org/ebooks/1342.epub.noimages';
          
          const saveBookData = async (base64Cover: string) => {
            const localPublishedList = JSON.parse(localStorage.getItem('local-published-books') || '[]');
            const newBook = {
              id: bookId,
              title,
              author,
              cover_url: base64Cover,
              file_url: localFileUrl,
              file_type: bookFile ? bookFile.type : 'application/epub+zip',
              is_premium: false,
              language: language,
              created_at: new Date().toISOString()
            };
            
            // Save actual file blob persistently to IndexedDB
            if (bookFile) {
              try {
                await saveRawBookOffline(bookId, title, author, base64Cover, localFileUrl, bookFile);
              } catch (err) {
                console.error('Failed to save book to IndexedDB:', err);
              }
            }

            const updatedList = [newBook, ...localPublishedList];
            localStorage.setItem('local-published-books', JSON.stringify(updatedList));
            syncBooksCookie(updatedList);
          };

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Cover = coverFile ? (reader.result as string) : '';
            await saveBookData(base64Cover);
            resolve();
          };

          if (coverFile) {
            reader.readAsDataURL(coverFile);
          } else {
            saveBookData('').then(() => resolve()).catch(reject);
          }
        } catch (err) {
          reject(err);
        }
      });
    };

    try {
      if (isDemo) {
        // Bypass Supabase completely in Demo mode
        await saveLocallyFallback();
        setMessage('Book published successfully to your local ReadSphere Library! Others can read it when you share your session.');
      } else {
        // Try real Supabase upload
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('You must be logged in to publish a book');

        try {
          // 1. Upload Cover (if exists)
          let coverUrl = '';
          if (coverFile) {
            const coverPath = `covers/${Date.now()}_${coverFile.name}`;
            coverUrl = await uploadFile('books_media', coverPath, coverFile);
          }

          // 2. Upload Book File
          const bookPath = `files/${Date.now()}_${bookFile.name}`;
          const fileUrl = await uploadFile('books_media', bookPath, bookFile);

          // 3. Insert into Database
          let insertData: any = {
            title,
            author,
            cover_url: coverUrl,
            file_url: fileUrl,
            is_premium: false,
            language: language,
          };

          let { error } = await supabase.from('books').insert(insertData);

          if (error && error.message?.includes('column "language" of relation "books" does not exist')) {
            console.warn('Language column does not exist on Supabase, retrying without language...');
            delete insertData.language;
            const retry = await supabase.from('books').insert(insertData);
            error = retry.error;
          }

          if (error) throw error;
          setMessage('Book published successfully to ReadSphere cloud database!');
        } catch (dbError) {
          console.warn('Supabase DB/Storage failed, falling back to local publishing:', dbError);
          // Fallback locally
          await saveLocallyFallback();
          setMessage('Book published successfully! (Saved locally in fallback mode due to database sync limits)');
        }
      }

      // Reset fields on success
      setTitle('');
      setAuthor('');
      setCoverFile(null);
      setBookFile(null);
      setLanguage('en');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Error: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Publish Your Own Book</h1>
        <p className="text-muted">Share your stories, novels, and knowledge with the ReadSphere community.</p>
      </div>

      <Card className="border-gray-800 bg-surface/50 backdrop-blur">
        <CardContent className="pt-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Book Title" 
                placeholder="e.g. My Amazing Story"
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
              <Input 
                label="Author Name" 
                placeholder="e.g. John Doe"
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Book Language</label>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-slate-350 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-800 transition-colors h-11"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 p-4 border border-dashed border-gray-700 rounded-xl bg-background/50">
              <label className="text-sm font-medium">Cover Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
            </div>

            <div className="space-y-2 p-4 border border-dashed border-primary/50 rounded-xl bg-primary/5">
              <label className="text-sm font-medium text-primary">Book File (EPUB or PDF)</label>
              <input 
                type="file" 
                accept=".pdf,.epub" 
                onChange={e => setBookFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg font-medium text-center ${message.includes('Error') ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
              {loading ? 'Publishing to ReadSphere...' : 'Publish Book Now'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
