'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import Reader from '@/components/ui/Reader';
import BookComments from '@/components/ui/BookComments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setBook(data);
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

  if (error || !book) {
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
        <Reader bookUrl={book.file_url} bookId={book.id} userId={user.id} title={book.title} />
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <BookComments bookId={book.id} />
      </div>
    </div>
  );
}
