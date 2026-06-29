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
