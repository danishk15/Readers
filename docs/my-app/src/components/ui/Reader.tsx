'use client';

import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function Reader({ bookUrl, bookId, userId, title }: { bookUrl: string, bookId: string, userId: string, title?: string }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!viewerRef.current) return;

    const book = ePub(bookUrl);
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
      manager: 'continuous',
      flow: 'paginated',
    });

    renditionRef.current = rendition;

    rendition.display().then(() => {
      setLoading(false);
      // Theme matching ReadSphere
      rendition.themes.default({
        body: { background: '#0F172A', color: '#F9FAFB', 'font-family': 'Inter, sans-serif' },
        a: { color: '#5B6CFF' }
      });
    });

    rendition.on('relocated', (location: any) => {
      // Very rough approximation for pages in EPUB
      setCurrentPage(location.start.index);
    });

    return () => {
      book.destroy();
    };
  }, [bookUrl]);

  // Step 25: Progress Hook (Time Tracking)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 10); // track every 10 seconds locally
    }, 10000);
    return () => clearInterval(interval);
  }, [loading]);

  // Step 26: Sync Reading Progress
  useEffect(() => {
    if (timeSpent > 0 && timeSpent % 30 === 0) { // Sync every 30 seconds of reading
      const syncProgress = async () => {
        const supabase = createClient();
        // Just upserting the log or incrementing. For MVP, we insert a new log chunk.
        await supabase.from('reading_logs').insert({
          user_id: userId,
          book_id: bookId,
          time_spent_seconds: 30, 
          pages_read: currentPage,
        });
      };
      syncProgress();
    }
  }, [timeSpent, bookId, userId, currentPage]);

  const prevPage = () => renditionRef.current?.prev();
  const nextPage = () => renditionRef.current?.next();

  return (
    <div className="flex flex-col h-full bg-background border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="h-14 bg-surface/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="text-primary font-bold text-lg">{title || 'ReadSphere Book'}</div>
          <div className="text-sm font-medium text-muted hidden sm:block px-3 py-1 bg-gray-800 rounded-md">Time read: {Math.floor(timeSpent / 60)}m</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={prevPage}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={nextPage}>Next</Button>
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-0">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      <div ref={viewerRef} className="flex-1 w-full relative z-0 p-4" />
    </div>
  );
}
