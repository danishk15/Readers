import React from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';
import { createClient } from '@/utils/supabase/server';
import { BookOpen, Globe, Users, BookMarked, Award, Sparkles, Trophy, Feather, MessageSquare, Compass } from 'lucide-react';

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
        <div className="absolute top-[-20%] left-[-15%] w-[45vw] h-[45vw] bg-blue-600/12 rounded-full blur-[130px] animate-drift-slow"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] bg-slate-400/10 rounded-full blur-[130px] animate-drift-mid"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-card-border bg-[#070D1F]/90 backdrop-blur-md flex flex-col z-10 relative transition-all duration-300">
        {/* App Title */}
        <div className="p-5 border-b border-card-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-300 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300 border border-slate-300/30">
              <span className="text-lg">🪶</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white group-hover:text-sky-300 transition-colors font-display">QuillHawk</span>
              <span className="text-[8px] font-bold text-slate-400 -mt-0.5 tracking-widest uppercase">Literary Hub</span>
            </div>
          </Link>
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 uppercase tracking-widest border border-blue-500/30 shadow-sm">HQ</span>
        </div>

        {/* Dynamic Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          <div className="px-3 pb-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Library</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all">
            <BookMarked className="w-4 h-4 shrink-0 text-blue-400" />
            <span>My Bookshelf</span>
          </Link>
          
          <Link href="/dashboard?tab=online" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-blue-300 hover:text-white hover:bg-blue-950/50 text-sm font-semibold transition-all">
            <Globe className="w-4 h-4 shrink-0 text-sky-400" />
            <span>Global Catalog</span>
          </Link>

          <div className="px-3 pt-3 pb-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Social & DMs</div>
          <Link href="/messages" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all group">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Direct Messages</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-mono shadow">
              DMs
            </span>
          </Link>

          <Link href="/communities" className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all group">
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 shrink-0 text-sky-400 group-hover:rotate-45 transition-transform" />
              <span>Guilds & Servers</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono shadow">
              Discord
            </span>
          </Link>

          <Link href="/friends" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all">
            <Users className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Friends Hub</span>
          </Link>
          
          <div className="px-3 pt-3 pb-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Compete & Create</div>
          <Link href="/competition" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all">
            <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Reading Tournament</span>
          </Link>
          
          <Link href="/publish" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm font-semibold transition-all">
            <BookOpen className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Author Studio</span>
          </Link>
          
          <Link href="/premium" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isPremium 
              ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20 bg-amber-950/20' 
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/40'
          }`}>
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span>VIP Soaring Pass</span>
          </Link>
        </div>

        {/* User Account / VIP details */}
        <div className="p-4 border-t border-card-border space-y-4">
          <Link href="/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group border border-slate-700/40 bg-slate-950/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-300 flex items-center justify-center text-sm font-black text-white shadow shadow-blue-500/20 overflow-hidden border border-slate-300/30">
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
              <p className="font-extrabold text-xs text-slate-100 group-hover:text-white truncate transition-colors">
                {profile?.username || user?.email?.split('@')[0] || 'QuillHawk Reader'}
              </p>
              {isPremium ? (
                <span className="text-[9px] font-black text-amber-400 flex items-center gap-0.5 tracking-wider uppercase">
                  👑 VIP Soaring Member
                </span>
              ) : (
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 uppercase">
                  🪶 QuillHawk Reader
                </span>
              )}
            </div>
          </Link>
          
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050917]/50 backdrop-blur-md">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-card-border bg-[#070D1F]/70 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0 transition-all duration-300">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-[10px] font-black border border-amber-500/35 rounded-full uppercase tracking-wider shadow">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>QuillHawk VIP Enabled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 text-blue-300 text-[10px] font-bold border border-blue-500/30 rounded-full uppercase tracking-wider">
                <span>🪶</span>
                <span>QuillHawk Literary Suite</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link href="/dashboard?tab=online" className="hover:text-blue-400 transition-colors">Catalog Search</Link>
            <span className="text-slate-700">|</span>
            <Link href="/profile" className="hover:text-blue-400 transition-colors">Progression Stats</Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

