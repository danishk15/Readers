import Link from "next/link";
import { BookOpen, Users, Sparkles, TrendingUp, BookMarked, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import ThemeToggle from "@/components/ui/ThemeToggle";
import InteractiveCard from "@/components/ui/InteractiveCard";
import HomeThemeSelector from "@/components/ui/HomeThemeSelector";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30 font-sans relative transition-colors duration-500">
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-wide font-display text-white">ReadSphere</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-350">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#community" className="hover:text-primary transition-colors">Community</a>
          <a href="#premium" className="hover:text-primary transition-colors">Premium</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/95 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(91,108,255,0.4)]">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        {/* Catchy Multi-Color Background Elements with Generated Image */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen"
          style={{ backgroundImage: 'url(/hero-bg.png)' }}
        ></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] animate-drift-slow"></div>
          <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/25 rounded-full mix-blend-screen filter blur-[120px] animate-drift-mid" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[55vw] h-[55vw] bg-emerald-600/15 rounded-full mix-blend-screen filter blur-[120px] animate-drift-slow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-cyan-600/15 rounded-full mix-blend-screen filter blur-[120px] animate-drift-mid" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-rose-600/15 rounded-full mix-blend-screen filter blur-[100px] animate-drift-slow" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 hover:bg-primary/20 transition-colors cursor-default tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Next Generation Reading Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1] font-display text-white">
            Read. Track. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-secondary animate-gradient bg-[length:200%_auto]">
              Discuss Together.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Immerse yourself in a premium reading experience. Track your progress, join vibrant community discussions, and build your ultimate digital library.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/95 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group"
              >
                Go to your Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/95 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group"
              >
                Start Reading Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/50 hover:bg-slate-900 text-white rounded-full font-medium transition-all backdrop-blur-sm border border-slate-800/80 flex items-center justify-center"
            >
              Explore Dashboard
            </Link>
          </div>
        </section>

        {/* Dynamic Vibe Switcher Showcase */}
        <HomeThemeSelector />

        {/* Floating Mockups / Interactive Cards */}
        <section id="features" className="relative w-full max-w-6xl mx-auto px-6 pb-32 z-10" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform md:-rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
            
            {/* Card 1 */}
            <InteractiveCard 
              className="p-8 group"
              glowColor="rgba(91, 108, 255, 0.18)"
              borderColor="rgba(91, 108, 255, 0.35)"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <BookMarked className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 font-display group-hover:text-white transition-colors">Immersive Reader</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-350 transition-colors text-sm">
                Experience books like never before with our distraction-free, customizable reading interface.
              </p>
            </InteractiveCard>

            {/* Card 2 */}
            <InteractiveCard 
              className="p-8 group relative md:-top-8"
              glowColor="rgba(139, 92, 246, 0.18)"
              borderColor="rgba(139, 92, 246, 0.35)"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/25 transition-all">
                <TrendingUp className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 font-display group-hover:text-white transition-colors">Track Milestones</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-350 transition-colors text-sm">
                Log your reading time, track pages read, and earn badges as you hit your personal reading goals.
              </p>
            </InteractiveCard>

            {/* Card 3 */}
            <InteractiveCard 
              className="p-8 group"
              glowColor="rgba(99, 102, 241, 0.18)"
              borderColor="rgba(99, 102, 241, 0.35)"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 font-display group-hover:text-white transition-colors">Join Communities</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-350 transition-colors text-sm">
                Connect with fellow readers. Join discussion channels, share reviews, and debate plot twists.
              </p>
            </InteractiveCard>

          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-slate-900/60 bg-slate-950/40 backdrop-blur-xl mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-slate-300 font-display">ReadSphere MVP</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ReadSphere by Danish Khan ♥️. Designed for readers.
          </p>
        </div>
      </footer>

      {/* Floating Theme Style Selector */}
      <ThemeToggle />
    </div>
  );
}

