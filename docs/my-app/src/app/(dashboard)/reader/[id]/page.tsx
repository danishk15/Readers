'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import Reader from '@/components/ui/Reader';
import BookComments from '@/components/ui/BookComments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AUTHENTIC_BOOK_REGISTRY } from '@/utils/authenticBookContent';
import { stripHtml } from '@/utils/textSanitizer';

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user || { id: 'reader-guest', email: 'guest@quillhawk.app' });

        let loadedBook = null;

        try {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
          if (data && !error) {
            loadedBook = data;
          }
        } catch {}

        if (!loadedBook) {
          try {
            const localBooks = JSON.parse(localStorage.getItem('local-published-books') || '[]');
            const addedBooks = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
            loadedBook = [...localBooks, ...addedBooks].find((b: any) => b.id === id || b.title?.toLowerCase() === id.toLowerCase());
          } catch {}
        }

        if (!loadedBook) {
          const { CLASSIC_BOOKS } = await import('@/utils/supabase/client');
          const classicFound = CLASSIC_BOOKS.find(b => b.id === id || b.title.toLowerCase() === id.toLowerCase());
          if (classicFound) {
            loadedBook = classicFound;
          }
        }

        if (!loadedBook) {
          const cleanId = id.toLowerCase();
          const matched = AUTHENTIC_BOOK_REGISTRY.find(e => 
            e.matchKeys.some(k => cleanId.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanId))
          );
          if (matched) {
            loadedBook = {
              id,
              title: matched.title,
              author: matched.author,
              description: `Authentic reading edition of ${matched.title} by ${matched.author}.`,
              file_url: ''
            };
          }
        }

        if (!loadedBook && id.startsWith('gutendex-')) {
          const gutenId = id.replace('gutendex-', '');
          loadedBook = {
            id,
            title: `Gutenberg Edition #${gutenId}`,
            author: 'Classic Author',
            file_url: `https://www.gutenberg.org/ebooks/${gutenId}.epub.noimages`
          };
        }

        if (!loadedBook) {
          // Clean title from ID as universal fallback
          const formattedTitle = decodeURIComponent(id)
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          loadedBook = {
            id,
            title: formattedTitle,
            author: 'QuillHawk Library Edition',
            file_url: ''
          };
        }

        if (loadedBook) {
          loadedBook = {
            ...loadedBook,
            title: stripHtml(loadedBook.title),
            author: stripHtml(loadedBook.author),
            description: stripHtml(loadedBook.description)
          };
        }

        setBook(loadedBook);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 my-12 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-slate-400 text-sm">Loading book reader...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-error/10 border border-error/20 rounded-2xl space-y-4 my-16 backdrop-blur-md">
        <div className="mx-auto w-12 h-12 bg-error/20 rounded-full flex items-center justify-center text-error">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-error">Book Unavailable</h2>
        <p className="text-slate-400 text-sm">
          We couldn't retrieve the contents for this book. It may have been unpublished or removed.
        </p>
        <Link href="/dashboard" passHref legacyBehavior>
          <Button className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12 animate-in fade-in duration-500">
      {/* Header back link */}
      <div className="max-w-5xl mx-auto w-full">
        <Link href={`/book/${book.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Book Details</span>
        </Link>
      </div>

      <div className="h-[calc(100vh-8rem)] w-full relative">
        <Reader 
          bookUrl={book.file_url} 
          bookId={book.id} 
          userId={user.id} 
          title={book.title} 
          author={book.author} 
          description={book.description} 
          customChapters={book.chapters}
        />
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <BookComments bookId={book.id} />
      </div>
    </div>
  );
}
