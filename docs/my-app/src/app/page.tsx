import Link from "next/link";
import { BookOpen, Users, Sparkles, TrendingUp, BookMarked, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0c10] text-slate-50 overflow-hidden selection:bg-indigo-500/30 font-sans relative">
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-wide">ReadSphere</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#community" className="hover:text-white transition-colors">Community</a>
          <a href="#premium" className="hover:text-white transition-colors">Premium</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(91,108,255,0.4)]">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        {/* Catchy Multi-Color Background Elements with Generated Image */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/hero-bg.png)' }}
        ></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
          <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[55vw] h-[55vw] bg-emerald-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-rose-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 hover:bg-indigo-500/20 transition-colors cursor-default">
            <Sparkles className="w-4 h-4" />
            <span>The Next Generation Reading Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1]">
            Read. Track. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient bg-[length:200%_auto]">
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
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group"
              >
                Go to your Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                href="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group"
              >
                Start Reading Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full font-medium transition-all backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 flex items-center justify-center"
            >
              Explore Dashboard
            </Link>
          </div>
        </section>

        {/* Floating Mockups / Interactive Cards */}
        <section id="features" className="relative w-full max-w-6xl mx-auto px-6 pb-32 z-10" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform md:-rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
            
            {/* Card 1 */}
            <div className="group bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all">
                <BookMarked className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-white transition-colors">Immersive Reader</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Experience books like never before with our distraction-free, customizable reading interface.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-4 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative md:-top-8 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all">
                <TrendingUp className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-white transition-colors">Track Milestones</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Log your reading time, track pages read, and earn badges as you hit your personal reading goals.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-500/30 transition-all">
                <Users className="w-7 h-7 text-violet-400 group-hover:text-violet-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-white transition-colors">Join Communities</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Connect with fellow readers. Join discussion channels, share reviews, and debate plot twists.
              </p>
            </div>

          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-xl mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-300">ReadSphere MVP</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ReadSphere by Danish Khan ♥️. Designed for readers.
          </p>
        </div>
      </footer>
    </div>
  );
}
