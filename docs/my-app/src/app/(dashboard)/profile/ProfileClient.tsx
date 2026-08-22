'use client';

import React from 'react';
import { DiscordProfileView } from '@/components/social/DiscordProfileView';

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  email?: string;
  premium_status?: boolean;
}

interface ProfileClientProps {
  initialProfile: Profile | null;
  initialUser: any;
  logs: any[] | null;
}

export default function ProfileClient({ initialProfile, initialUser, logs }: ProfileClientProps) {
  return (
    <div className="py-6 px-4 md:px-8">
      <DiscordProfileView 
        initialUser={initialUser} 
        initialProfile={initialProfile} 
        logs={logs} 
      />
    </div>
  );
}
