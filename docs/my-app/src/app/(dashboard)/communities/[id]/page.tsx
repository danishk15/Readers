'use client';

import React, { Suspense, use } from 'react';
import { DiscordServerWorkspace } from '@/components/social/DiscordServerWorkspace';

export default function CommunityServerDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Handle both Promise params (Next.js 15+) and synchronous params
  const resolvedParams = (params as any)?.id ? (params as { id: string }) : use(params as Promise<{ id: string }>);

  return (
    <div className="h-full w-full py-1">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      }>
        <DiscordServerWorkspace initialServerId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
