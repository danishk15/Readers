import React, { Suspense } from 'react';
import { DirectMessagesHub } from '@/components/social/DirectMessagesHub';

export const metadata = {
  title: 'Direct Messages | QuillHawk',
  description: 'Chat in real-time, share books, and discuss chapters with your QuillHawk friends.'
};

export default function MessagesPage() {
  return (
    <div className="py-6 px-4 md:px-8">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }>
        <DirectMessagesHub />
      </Suspense>
    </div>
  );
}
