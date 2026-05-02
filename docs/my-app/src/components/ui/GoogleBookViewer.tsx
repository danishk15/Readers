'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleBookViewer({ bookId }: { bookId: string }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let viewer: any = null;

    const initializeViewer = () => {
      if (!viewerRef.current || !window.google?.books) return;
      
      try {
        viewer = new window.google.books.DefaultViewer(viewerRef.current);
        viewer.load(
          bookId, 
          () => {
            // Success
            setError(false);
          },
          () => {
            // NotFound
            setError(true);
          }
        );
      } catch (e) {
        console.error("Google Books Viewer error:", e);
        setError(true);
      }
    };

    if (!window.google?.books?.DefaultViewer) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/jsapi';
      script.async = true;
      script.onload = () => {
        if (window.google?.load) {
          window.google.load('books', '0', {
            callback: initializeViewer
          });
        }
      };
      document.head.appendChild(script);
    } else {
      initializeViewer();
    }

    return () => {
      // Cleanup if needed
    };
  }, [bookId]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-surface">
          <p className="text-error font-semibold mb-2">Preview Not Available</p>
          <p className="text-muted text-sm max-w-md">
            This book's publisher has not made a preview available, or it is restricted in your region.
          </p>
          <a 
            href={`https://books.google.com/books?id=${bookId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View on Google Books
          </a>
        </div>
      )}
      <div ref={viewerRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
