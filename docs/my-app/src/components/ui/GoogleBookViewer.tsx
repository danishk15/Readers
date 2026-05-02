'use client';

import React, { useState } from 'react';

export default function GoogleBookViewer({ bookId }: { bookId: string }) {
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white rounded-lg overflow-hidden flex flex-col">
      {iframeError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-surface z-10">
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
      <iframe 
        src={`https://books.google.com/books?id=${bookId}&lpg=PP1&pg=PP1&output=embed`}
        className="w-full h-full flex-1 border-0 min-h-[600px]"
        allowFullScreen
        title="Google Book Viewer"
        onError={() => setIframeError(true)}
      />
    </div>
  );
}
