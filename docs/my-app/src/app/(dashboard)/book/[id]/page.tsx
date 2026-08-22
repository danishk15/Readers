'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, Star, Languages, Award, BookMarked } from 'lucide-react';
import Link from 'next/link';

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        const supabase = createClient();
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
    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4 my-12 backdrop-blur-md flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        <p className="text-slate-400 text-sm">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-error/10 border border-error/20 rounded-2xl space-y-4 my-12 backdrop-blur-md">
        <h2 className="text-xl font-bold text-error">Book Unavailable</h2>
        <p className="text-slate-400 text-sm">
          We couldn't retrieve the details for this book. It may have been unpublished or removed.
        </p>
        <Link href="/dashboard" passHref legacyBehavior>
          <Button className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 bg-slate-950/40 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Book Cover */}
        <div className="w-full md:w-1/3 flex-shrink-0 flex justify-center">
          <div className="aspect-[2/3] w-64 md:w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800 relative group">
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={book.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-600 p-6 text-center">
                <BookOpen className="w-12 h-12 mb-3 text-slate-700" />
                <span className="font-bold text-sm tracking-wide uppercase">{book.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 flex flex-col justify-between space-y-6 z-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
                📖 Unrestricted Access (Free for All)
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">{book.title}</h1>
              <p className="text-lg md:text-xl text-indigo-300 font-medium mt-1">{book.author}</p>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl pt-2">
              Embark on an epic literary journey with QuillHawk&apos;s curated classic edition of &quot;{book.title}&quot;. Dive into customizable typographic layouts, track reading achievements, and discuss characters in global guild chat groups.
            </p>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-3 gap-4 border-y border-slate-800/80 py-6 my-2 bg-slate-900/20 rounded-xl px-4">
            <div className="text-center border-r border-slate-800/80 flex flex-col items-center justify-center">
              <span className="inline-flex text-warning gap-0.5 items-center text-xs font-semibold uppercase tracking-wider mb-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" /> Rating
              </span>
              <p className="font-extrabold text-base text-slate-100 font-mono">4.9 / 5</p>
            </div>
            <div className="text-center border-r border-slate-800/80 flex flex-col items-center justify-center">
              <span className="inline-flex text-indigo-400 gap-1 items-center text-xs font-semibold uppercase tracking-wider mb-1">
                <BookMarked className="w-3.5 h-3.5" /> Pages
              </span>
              <p className="font-extrabold text-base text-slate-100 font-mono">360 p.</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <span className="inline-flex text-cyan-400 gap-1 items-center text-xs font-semibold uppercase tracking-wider mb-1">
                <Languages className="w-3.5 h-3.5" /> Lang.
              </span>
              <p className="font-extrabold text-base text-slate-100 font-mono">
                {book.language ? book.language.toUpperCase() : 'EN'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Link href={`/reader/${book.id}`} passHref legacyBehavior>
              <Button size="lg" className="w-full md:w-auto px-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-95 py-6">
                Start Immersive Reading
              </Button>
            </Link>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 justify-center md:justify-start font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>This book is 100% free and open for everyone to read online.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
