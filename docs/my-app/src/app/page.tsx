import Link from "next/link";
import { BookOpen, Users, Sparkles, TrendingUp, BookMarked, ArrowRight, Feather, Trophy, Compass } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import InteractiveCard from "@/components/ui/InteractiveCard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#ECE7E1] text-[#1C1E24] overflow-hidden selection:bg-blue-500/20 font-sans relative transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300 border border-slate-300/40 text-white">
            <span className="text-xl">🪶</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wide font-display text-[#1C1E24]">QuillHawk</span>
            <span className="text-[9px] font-bold text-[#6C665F] -mt-1 tracking-widest uppercase">Literary Platform</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5C5852]">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <Link href="/communities" className="hover:text-blue-600 transition-colors">Guilds</Link>
          <Link href="/competition" className="hover:text-blue-600 transition-colors">Tournament</Link>
          <Link href="/premium" className="hover:text-blue-600 transition-colors">VIP Pass</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2">
              <span>Enter Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold hover:text-[#1C1E24] text-[#5C5852] transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md">
                Join QuillHawk
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        {/* Silver Greyish Nude Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#DBD4CA]/70 rounded-full mix-blend-multiply filter blur-[130px] animate-drift-slow"></div>
          <div className="absolute top-[15%] right-[-10%] w-[50vw] h-[50vw] bg-[#D5CDC2]/60 rounded-full mix-blend-multiply filter blur-[130px] animate-drift-mid" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] left-[15%] w-[55vw] h-[55vw] bg-[#DDD6CC]/60 rounded-full mix-blend-multiply filter blur-[130px] animate-drift-slow" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2DDD5] border border-[#CEC7BD] text-[#2563EB] text-xs font-bold mb-8 transition-all cursor-default tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Where Words Take Flight • Next-Gen Literary Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl leading-[1.08] font-display text-[#1C1E24]">
            Read. Write. Soar. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C1E24] via-blue-600 to-[#475569]">
              In Silver & Greyish Ink.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed mb-10">
            Step into an elevated digital reading sanctuary. Immerse yourself in customizable reader typography, track literary quests, publish your manuscripts, and connect across global literary guilds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-9 py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 group"
              >
                Enter Your Bookshelf
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-9 py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 group"
              >
                Begin Reading Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link 
              href="/dashboard?tab=online" 
              className="w-full sm:w-auto px-9 py-4 bg-[#F5F1EB] hover:bg-[#EAE5DE] text-[#1C1E24] rounded-full font-semibold transition-all border border-[#CEC7BD] flex items-center justify-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#6C665F]" />
              <span>Explore Global Catalog</span>
            </Link>
          </div>
        </section>

        {/* Floating Interactive Cards */}
        <section id="features" className="relative w-full max-w-6xl mx-auto px-6 py-12 pb-32 z-10" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform md:-rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
            
            {/* Card 1 */}
            <InteractiveCard 
              className="p-8 group bg-[#F6F2EC] border-[#CEC7BD] shadow-md"
              glowColor="rgba(37, 99, 235, 0.15)"
              borderColor="#CEC7BD"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 border border-blue-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <BookMarked className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1C1E24] font-display group-hover:text-blue-600 transition-colors">Immersive Nude Reader</h3>
              <p className="text-[#5C5852] leading-relaxed text-sm">
                Enjoy distraction-free, customizable reading with rich serif and Urdu typography, eye-friendly silver nude tones, and offline saving.
              </p>
            </InteractiveCard>

            {/* Card 2 */}
            <InteractiveCard 
              className="p-8 group relative md:-top-8 bg-[#F6F2EC] border-[#CEC7BD] shadow-md"
              glowColor="rgba(120, 113, 108, 0.15)"
              borderColor="#CEC7BD"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E2DDD5] border border-[#CDC5B9] flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Trophy className="w-7 h-7 text-[#78716C]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1C1E24] font-display group-hover:text-blue-600 transition-colors">Soaring Tournaments</h3>
              <p className="text-[#5C5852] leading-relaxed text-sm">
                Log reading minutes, climb regional leaderboards, and conquer the 500-Minute Weekly VIP Quest to earn free premium status.
              </p>
            </InteractiveCard>

            {/* Card 3 */}
            <InteractiveCard 
              className="p-8 group bg-[#F6F2EC] border-[#CEC7BD] shadow-md"
              glowColor="rgba(37, 99, 235, 0.15)"
              borderColor="#CEC7BD"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 border border-blue-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1C1E24] font-display group-hover:text-blue-600 transition-colors">Literary Guilds</h3>
              <p className="text-[#5C5852] leading-relaxed text-sm">
                Connect with passionate readers across genre communities. Discuss plot nuances, post reviews, and publish your own manuscripts.
              </p>
            </InteractiveCard>

          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-[#CEC7BD] bg-[#E2DDD5]/90 backdrop-blur-xl mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-lg">🪶</span>
            <span className="font-bold text-[#1C1E24] font-display">QuillHawk</span>
            <span className="text-xs text-[#78716C]">| Where Words Take Flight</span>
          </div>
          <p className="text-[#6C665F] text-sm">
            © {new Date().getFullYear()} QuillHawk by Danish Khan ♥️. Designed for readers & authors.
          </p>
        </div>
      </footer>
    </div>
  );
}
