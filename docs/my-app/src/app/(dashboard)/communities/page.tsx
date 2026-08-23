'use client';

import React, { Suspense } from 'react';
import { DiscordServerWorkspace } from '@/components/social/DiscordServerWorkspace';

export default function CommunitiesPage() {
  return (
    <div className="h-full w-full py-1">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }>
        <DiscordServerWorkspace />
      </Suspense>
    </div>
  );
}
