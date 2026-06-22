'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear client-side cookies including demo-session bypass and profile cookies
      const demoCookies = [
        'demo-session',
        'demo-user-region',
        'demo-premium_status',
        'demo-username',
        'demo-user-bio',
        'demo-user-avatar-url',
        'demo-communities',
        'demo-channels',
        'demo-comments',
        'demo-messages',
        'demo-reading_logs',
        'demo-competition_entries'
      ];
      
      demoCookies.forEach(name => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        demoCookies.forEach(name => {
          localStorage.removeItem(name);
        });
      }
      
      // Perform Supabase logout
      await supabase.auth.signOut();
      
      // Redirect to login page and trigger routing refresh
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-sm font-medium transition-all duration-300 mt-4 border border-rose-500/10 hover:border-rose-500/20 active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  );
}
