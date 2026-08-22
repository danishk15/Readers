import React, { Suspense } from 'react';
import { FriendsView } from '@/components/social/FriendsView';

export const metadata = {
  title: 'Friends Hub | QuillHawk',
  description: 'Connect with fellow readers, add friends, and share your literary journey on QuillHawk.'
};

export default function FriendsPage() {
  return (
    <div className="py-6 px-4 md:px-8">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }>
        <FriendsView />
      </Suspense>
    </div>
  );
}
