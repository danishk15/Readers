import Link from "next/link";
import { BookOpen, Users, Sparkles, TrendingUp, BookMarked, ArrowRight, Feather, Trophy, Compass } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import InteractiveCard from "@/components/ui/InteractiveCard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30 font-sans relative transition-colors duration-500">
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-300 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-300 group-hover:scale-105 border border-slate-300/30">
            <span className="text-xl">🪶</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wide font-display text-white">QuillHawk</span>
            <span className="text-[9px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">Literary Platform</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <Link href="/communities" className="hover:text-blue-400 transition-colors">Guilds</Link>
          <Link href="/competition" className="hover:text-blue-400 transition-colors">Tournament</Link>
          <Link href="/premium" className="hover:text-blue-400 transition-colors">VIP Pass</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm font-bold bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.45)] border border-slate-200/20 flex items-center gap-2">
              <span>Enter Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold hover:text-white text-slate-300 transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 text-slate-950 px-6 py-2.5 rounded-full hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.25)] border border-white/60">
                Join QuillHawk
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        {/* Dynamic Background Elements: Inkish Blue & Greyish Silver glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/18 rounded-full mix-blend-screen filter blur-[130px] animate-drift-slow"></div>
          <div className="absolute top-[15%] right-[-10%] w-[50vw] h-[50vw] bg-slate-400/12 rounded-full mix-blend-screen filter blur-[130px] animate-drift-mid" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] left-[15%] w-[55vw] h-[55vw] bg-sky-500/12 rounded-full mix-blend-screen filter blur-[130px] animate-drift-slow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[20%] right-[20%] w-[45vw] h-[45vw] bg-indigo-600/15 rounded-full mix-blend-screen filter blur-[130px] animate-drift-mid" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-bold mb-8 hover:border-blue-400/50 transition-all cursor-default tracking-wide uppercase shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Where Words Take Flight • Next-Gen Literary Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl leading-[1.08] font-display text-white">
            Read. Write. Soar. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-300 to-slate-400">
              In Deep Ink & Silver.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Step into an elevated digital reading sanctuary. Immerse yourself in customizable reader typography, track literary quests, publish your manuscripts, and connect across global literary guilds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-9 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(37,99,235,0.45)] flex items-center justify-center gap-2 group border border-blue-300/30"
              >
                Enter Your Bookshelf
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-9 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(37,99,235,0.45)] flex items-center justify-center gap-2 group border border-blue-300/30"
              >
                Begin Reading Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link 
              href="/dashboard?tab=online" 
              className="w-full sm:w-auto px-9 py-4 bg-[#0B132B]/80 hover:bg-[#0E1A3D] text-slate-200 hover:text-white rounded-full font-semibold transition-all backdrop-blur-md border border-slate-700/80 hover:border-slate-500 flex items-center justify-center gap-2 shadow-lg"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Explore Global Catalog</span>
            </Link>
          </div>
        </section>

        {/* Floating Interactive Cards */}
        <section id="features" className="relative w-full max-w-6xl mx-auto px-6 py-12 pb-32 z-10" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform md:-rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
            
            {/* Card 1 */}
            <InteractiveCard 
              className="p-8 group"
              glowColor="rgba(37, 99, 235, 0.25)"
              borderColor="rgba(203, 213, 225, 0.4)"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/25 transition-all">
                <BookMarked className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white font-display group-hover:text-sky-300 transition-colors">Immersive Ink Reader</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Enjoy distraction-free, customizable reading with rich serif and sans typography, night ink themes, and offline book saving.
              </p>
            </InteractiveCard>

            {/* Card 2 */}
            <InteractiveCard 
              className="p-8 group relative md:-top-8"
              glowColor="rgba(148, 163, 184, 0.25)"
              borderColor="rgba(226, 232, 240, 0.45)"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-400/15 border border-slate-400/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-400/25 transition-all">
                <Trophy className="w-7 h-7 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white font-display group-hover:text-slate-100 transition-colors">Soaring Tournaments</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Log reading minutes, climb regional leaderboards, and conquer the 500-Minute Weekly VIP Quest to earn free premium status.
              </p>
            </InteractiveCard>

            {/* Card 3 */}
            <InteractiveCard 
              className="p-8 group"
              glowColor="rgba(56, 189, 248, 0.25)"
              borderColor="rgba(203, 213, 225, 0.4)"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-500/25 transition-all">
                <Users className="w-7 h-7 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white font-display group-hover:text-sky-300 transition-colors">Literary Guilds</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Connect with passionate readers across genre communities. Discuss plot nuances, post reviews, and publish your own manuscripts.
              </p>
            </InteractiveCard>

          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-slate-800/80 bg-[#050814]/80 backdrop-blur-xl mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-lg">🪶</span>
            <span className="font-bold text-slate-200 font-display">QuillHawk</span>
            <span className="text-xs text-slate-500">| Where Words Take Flight</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} QuillHawk by Danish Khan ♥️. Designed for readers & authors.
          </p>
        </div>
      </footer>
    </div>
  );
}

