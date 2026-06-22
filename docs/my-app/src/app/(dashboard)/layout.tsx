import React from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';
import { createClient } from '@/utils/supabase/server';
import { BookOpen, Globe, Users, BookMarked, Award, Sparkles, Trophy } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    try {
      const { data } = await supabase.from('users').select('premium_status, username, avatar_url').eq('id', user.id).single();
      profile = data;
    } catch {}
  }
  const isPremium = !!profile?.premium_status;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative font-sans transition-colors duration-500">
      {/* Immersive Dashboard Background and Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[45vw] h-[45vw] bg-primary/10 rounded-full blur-[120px] animate-drift-slow"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-secondary/10 rounded-full blur-[120px] animate-drift-mid"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-card-border bg-card/80 backdrop-blur-md flex flex-col z-10 relative transition-all duration-300">
        {/* App Title */}
        <div className="p-5 border-b border-card-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="text-white w-4.5 h-4.5" />
            </div>
            <span className="text-base font-extrabold tracking-wider text-slate-100 group-hover:text-white transition-colors font-display">ReadSphere</span>
          </Link>
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-900 text-slate-500 uppercase tracking-widest border border-slate-800">MVP</span>
        </div>

        {/* Dynamic Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 text-sm font-semibold transition-all">
            <BookMarked className="w-4 h-4 shrink-0" />
            <span>My Bookshelf</span>
          </Link>
          
          <Link href="/dashboard?tab=online" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary hover:text-primary/80 hover:bg-slate-900/50 text-sm font-semibold transition-all">
            <Globe className="w-4 h-4 shrink-0" />
            <span>Global Catalog</span>
          </Link>
          
          <Link href="/communities" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 text-sm font-semibold transition-all">
            <Users className="w-4 h-4 shrink-0" />
            <span>Communities</span>
          </Link>
          
          <Link href="/competition" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 text-sm font-semibold transition-all">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Monthly Competition</span>
          </Link>
          
          <Link href="/publish" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 text-sm font-semibold transition-all">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Publish Book</span>
          </Link>
          
          <Link href="/premium" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
            isPremium 
              ? 'text-warning hover:text-warning/80 hover:bg-warning/5 border border-warning/10' 
              : 'text-warning hover:text-warning/80 hover:bg-slate-900/50'
          }`}>
            <Award className="w-4 h-4 shrink-0" />
            <span>Premium Lounge</span>
          </Link>
        </div>

        {/* User Account / VIP details */}
        <div className="p-4 border-t border-card-border space-y-4">
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-black text-white shadow shadow-primary/10 overflow-hidden">
              {profile?.avatar_url ? (
                ['📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(profile.avatar_url) ? (
                  <span className="text-xl select-none">{profile.avatar_url}</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                )
              ) : (
                user?.email ? user.email.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-extrabold text-xs text-slate-200 group-hover:text-white truncate transition-colors">
                {profile?.username || user?.email?.split('@')[0] || 'User Profile'}
              </p>
              {isPremium ? (
                <span className="text-[9px] font-black text-warning flex items-center gap-0.5 tracking-wider uppercase">
                  👑 VIP Premium
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5 uppercase">
                  📖 Standard Member
                </span>
              )}
            </div>
          </Link>
          
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950/20 backdrop-blur-md">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-card-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0 transition-all duration-300">
          <div className="flex items-center gap-2">
            {isPremium && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-warning/15 to-amber-500/15 text-warning text-[10px] font-black border border-warning/25 rounded-full uppercase tracking-wider shadow">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Premium Member Enabled</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-450">
            <Link href="/dashboard?tab=online" className="hover:text-primary transition-colors">Catalog Search</Link>
            <span className="text-slate-800">|</span>
            <Link href="/profile" className="hover:text-primary transition-colors">Progression Stats</Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Theme selector widget */}
      <ThemeToggle />
    </div>
  );
}

