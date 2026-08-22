'use client';

import { useEffect } from 'react';
import { createClient, getAuthSessionCookie } from '@/utils/supabase/client';
import { useAppStore } from '@/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore((state) => state.setUser);
  const supabase = createClient();

  useEffect(() => {
    // Initial session sync
    const initialCookieSession = getAuthSessionCookie();
    if (initialCookieSession?.user) {
      setUser(initialCookieSession.user);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    const handleCustomAuthChange = (e: any) => {
      const session = e.detail?.session;
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('readsphere-auth-change', handleCustomAuthChange);
    }

    return () => {
      authListener?.subscription?.unsubscribe?.();
      if (typeof window !== 'undefined') {
        window.removeEventListener('readsphere-auth-change', handleCustomAuthChange);
      }
    };
  }, [supabase, setUser]);

  return <>{children}</>;
}
