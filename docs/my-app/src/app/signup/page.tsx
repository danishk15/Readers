'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient, getURL } from '@/utils/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import InteractiveCard from '@/components/ui/InteractiveCard';

// Custom Swaying Lamp Fixture with Pull Cord
function LampFixture({ 
  isLightOn, 
  onToggle, 
  theme 
}: { 
  isLightOn: boolean; 
  onToggle: () => void; 
  theme: string 
}) {
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = () => {
    setIsPulling(true);
    onToggle();
    setTimeout(() => setIsPulling(false), 200);
  };

  let filamentColor = 'border-slate-800 bg-transparent';
  let bulbGlowClass = 'bg-slate-900 border-slate-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]';
  
  if (isLightOn) {
    if (theme === 'glass') {
      filamentColor = 'border-cyan-300 bg-cyan-200/40';
      bulbGlowClass = 'bg-cyan-50 shadow-[0_0_80px_20px_rgba(6,182,212,0.85),_inset_0_2px_4px_rgba(255,255,255,1)] border-cyan-200';
    } else if (theme === 'neo') {
      filamentColor = 'border-teal-300 bg-teal-200/40';
      bulbGlowClass = 'bg-teal-50 shadow-[0_0_80px_20px_rgba(20,184,166,0.8),_inset_0_2px_4px_rgba(255,255,255,1)] border-teal-200';
    } else if (theme === 'brutalist') {
      filamentColor = 'border-yellow-400 bg-yellow-300/40';
      bulbGlowClass = 'bg-yellow-100 shadow-[0_0_90px_25px_rgba(234,179,8,0.9),_inset_0_2px_4px_rgba(255,255,255,1)] border-yellow-300 scale-105';
    } else {
      filamentColor = 'border-amber-400 bg-amber-300/30';
      bulbGlowClass = 'bg-amber-50 shadow-[0_0_80px_20px_rgba(245,158,11,0.8),_inset_0_2px_4px_rgba(255,255,255,1)] border-amber-200';
    }
  }

  return (
    <div className="relative flex flex-col items-center select-none z-30 animate-sway">
      <div className="w-[1.5px] h-32 bg-slate-700/60 transition-colors duration-300" />
      <div className="w-10 h-3.5 bg-slate-800 border border-slate-900 rounded-t-sm" />
      <div className="w-6 h-3 bg-slate-750 border-x border-slate-800" />
      
      <div 
        onClick={handlePull}
        className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-500 relative flex items-center justify-center ${bulbGlowClass} border-2 hover:scale-105 active:scale-95`}
      >
        <div className={`w-3.5 h-5 border-t border-x rounded-t transition-all duration-500 ${filamentColor}`} />
        <div className="absolute top-1.5 left-3 w-2.5 h-1 bg-white/20 rounded-full rotate-[-15deg]" />
      </div>

      <div 
        onClick={handlePull}
        style={{
          transform: isPulling ? 'translateY(12px)' : 'translateY(0px)',
          transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="absolute top-[170px] -right-3.5 flex flex-col items-center cursor-pointer group"
      >
        <div className="w-[1px] h-20 bg-slate-500/80 group-hover:bg-slate-350 transition-colors" />
        <div className="w-2.5 h-3.5 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-sm border border-amber-900 shadow-md group-hover:from-amber-500 group-hover:to-amber-700" />
      </div>
    </div>
  );
}

// Floating dust particles inside the light spotlight
function DustParticles({ count = 15 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 80 + 10;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 10 + 12;
        const delay = Math.random() * -20;
        const opacity = Math.random() * 0.35 + 0.1;
        
        return (
          <div
            key={i}
            className="absolute bg-white/70 rounded-full"
            style={{
              left: `${left}%`,
              bottom: `-20px`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animation: `float ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// Spotlight Cone Revealer
function SpotlightCone({ isLightOn, theme }: { isLightOn: boolean; theme: string }) {
  if (!isLightOn) return null;

  let gradientClass = 'from-amber-400/20 via-amber-500/3 to-transparent';
  if (theme === 'glass') {
    gradientClass = 'from-cyan-400/25 via-indigo-500/5 to-transparent';
  } else if (theme === 'neo') {
    gradientClass = 'from-teal-400/18 via-emerald-500/3 to-transparent';
  } else if (theme === 'brutalist') {
    gradientClass = 'from-yellow-400/35 via-pink-500/5 to-transparent';
  }

  return (
    <div 
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[160vw] max-w-[1250px] h-screen pointer-events-none z-10 transition-opacity duration-500"
      style={{
        clipPath: 'polygon(50% 180px, 0% 100%, 100% 100%)',
      }}
    >
      <div className={`w-full h-full bg-gradient-to-b ${gradientClass}`} />
      <DustParticles count={25} />
    </div>
  );
}

// SignUp Form Card Component
function SignUpForm({ theme, onBack }: { theme: string; onBack: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  
  const passwordsMatch = password === confirmPassword;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all strength requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getURL()}auth/callback`,
          data: {
            full_name: fullName,
            username: fullName,
          }
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.push('/login?message=Check your email to confirm your account.');
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during signup.");
    }
    setLoading(false);
  };

  const getSubmitButtonStyles = () => {
    if (theme === 'brutalist') {
      return 'w-full py-2.5 border-2 border-black bg-[#ec4899] text-white font-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0px_#000000] rounded-none transition-all text-sm uppercase tracking-wider cursor-pointer';
    } else if (theme === 'neo') {
      return 'w-full py-2.5 bg-gradient-to-r from-primary to-[#8B5CF6] text-white font-bold rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all text-sm cursor-pointer';
    } else {
      return 'w-full py-2.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 text-sm cursor-pointer';
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
        <button 
          type="button" 
          onClick={onBack} 
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to options
        </button>
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Email Registration</span>
      </div>

      <Input
        label="Full Name"
        type="text"
        placeholder="Your Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        className={`${
          theme === 'brutalist' 
            ? 'border-2 border-black rounded-none bg-white text-black placeholder:text-slate-500 focus:ring-0 focus:border-black' 
            : theme === 'neo'
              ? 'border-transparent bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-slate-200 focus:ring-0'
              : 'border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/40 focus:border-slate-700'
        } transition-all duration-300`}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`${
          theme === 'brutalist' 
            ? 'border-2 border-black rounded-none bg-white text-black placeholder:text-slate-500 focus:ring-0 focus:border-black' 
            : theme === 'neo'
              ? 'border-transparent bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-slate-200 focus:ring-0'
              : 'border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/40 focus:border-slate-700'
        } transition-all duration-300`}
      />

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`${
            theme === 'brutalist' 
              ? 'border-2 border-black rounded-none bg-white text-black placeholder:text-slate-500 focus:ring-0 focus:border-black' 
              : theme === 'neo'
                ? 'border-transparent bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-slate-200 focus:ring-0'
                : 'border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/40 focus:border-slate-700'
          } transition-all duration-300`}
        />
        {password.length > 0 && (
          <div className={`text-[11px] space-y-1 p-3 rounded-lg border mt-2 ${
            theme === 'brutalist' 
              ? 'bg-[#141414] border-2 border-black text-white' 
              : theme === 'neo'
                ? 'bg-[#1e2022] border-slate-850 shadow-[inset_2px_2px_5px_#121314] text-slate-300'
                : 'bg-slate-950/60 border-slate-850 text-slate-400'
          }`}>
            <div className="font-semibold text-slate-400 mb-1">Password Requirements:</div>
            <div className="flex items-center gap-1.5">
              <span className={hasMinLength ? "text-emerald-400 font-bold" : "text-slate-600 font-bold"}>
                {hasMinLength ? "✓" : "○"}
              </span>
              <span className={hasMinLength ? "text-emerald-400/90" : "text-slate-500"}>8–12+ characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={hasUpperCase ? "text-emerald-400 font-bold" : "text-slate-600 font-bold"}>
                {hasUpperCase ? "✓" : "○"}
              </span>
              <span className={hasUpperCase ? "text-emerald-400/90" : "text-slate-500"}>One uppercase letter (A-Z)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={hasLowerCase ? "text-emerald-400 font-bold" : "text-slate-600 font-bold"}>
                {hasLowerCase ? "✓" : "○"}
              </span>
              <span className={hasLowerCase ? "text-emerald-400/90" : "text-slate-500"}>One lowercase letter (a-z)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={hasNumber ? "text-emerald-400 font-bold" : "text-slate-600 font-bold"}>
                {hasNumber ? "✓" : "○"}
              </span>
              <span className={hasNumber ? "text-emerald-400/90" : "text-slate-500"}>One number (0-9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={hasSpecialChar ? "text-emerald-400 font-bold" : "text-slate-600 font-bold"}>
                {hasSpecialChar ? "✓" : "○"}
              </span>
              <span className={hasSpecialChar ? "text-emerald-400/90" : "text-slate-500"}>One special character (@, #, $, etc.)</span>
            </div>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className={`${
          theme === 'brutalist' 
            ? 'border-2 border-black rounded-none bg-white text-black placeholder:text-slate-500 focus:ring-0 focus:border-black' 
            : theme === 'neo'
              ? 'border-transparent bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-slate-200 focus:ring-0'
              : 'border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/40 focus:border-slate-700'
        } transition-all duration-300`}
      />
      {confirmPassword.length > 0 && (
        <div className="text-[11px] px-1">
          {passwordsMatch ? (
            <span className="text-emerald-400 font-semibold">✓ Passwords match</span>
          ) : (
            <span className="text-rose-400 font-semibold">✗ Passwords do not match</span>
          )}
        </div>
      )}

      {error && (
        <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs leading-relaxed">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={loading} 
        className={getSubmitButtonStyles()}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating account...
          </span>
        ) : 'Sign Up'}
      </Button>
    </form>
  );
}

// Master SignUp Page Component
export default function SignUpPage() {
  const [isLightOn, setIsLightOn] = useState(false);
  const [theme, setTheme] = useState<'default' | 'glass' | 'neo' | 'brutalist'>('default');
  const [activeCard, setActiveCard] = useState<'none' | 'email'>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Sync with global UI Switcher theme
  useEffect(() => {
    const updateTheme = () => {
      try {
        const saved = localStorage.getItem('readsphere-theme-style') as any;
        if (saved && ['default', 'glass', 'neo', 'brutalist'].includes(saved)) {
          setTheme(saved);
        } else {
          setTheme('default');
        }
      } catch (e) {}
    };
    updateTheme();
    window.addEventListener('theme-style-change', updateTheme);
    return () => window.removeEventListener('theme-style-change', updateTheme);
  }, []);

  // Listen for the "L" key keyboard toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        setIsLightOn((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Dynamic Background classes depending on lamp state
  const bgStyles = isLightOn 
    ? 'bg-[#060814] bg-[radial-gradient(circle_at_top,_rgba(91,108,255,0.06),_transparent_60%)]' 
    : 'bg-[#020306]';

  // Header text color style helper
  const headerTextClass = theme === 'brutalist' ? 'text-white' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent';

  return (
    <div className={`flex flex-col min-h-screen items-center justify-start p-4 transition-colors duration-500 overflow-x-hidden relative ${bgStyles}`}>
      
      {/* Dynamic Sway & Drift Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); transform-origin: top center; }
          50% { transform: rotate(1deg); transform-origin: top center; }
        }
        .animate-sway {
          animation: sway 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-380px) translateX(25px); opacity: 0; }
        }
      ` }} />

      {/* Hanging Interactive Lamp */}
      <LampFixture 
        isLightOn={isLightOn} 
        onToggle={() => setIsLightOn(!isLightOn)} 
        theme={theme} 
      />

      {/* Spotlight Cone and Particles */}
      <SpotlightCone isLightOn={isLightOn} theme={theme} />

      {/* Visual tutorial indicator if light is off */}
      {!isLightOn && (
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-20 animate-pulse transition-opacity duration-300 px-6">
          <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase">
            The room is dark
          </p>
          <p className="text-slate-500 text-xs mt-1.5 max-w-sm leading-relaxed">
            Pull the switch knob or press <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono shadow">L</kbd> to illuminate the signup cards
          </p>
        </div>
      )}

      {/* Animated Cards Container */}
      <div 
        className={`w-full transition-all duration-700 ease-out transform mt-12 z-20 ${
          isLightOn 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        } ${activeCard === 'email' ? 'max-w-md' : 'max-w-5xl'}`}
      >
        {activeCard === 'none' ? (
          /* Grid of 3 Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {/* Google Card */}
            <InteractiveCard 
              theme={theme}
              onClick={() => handleOAuthLogin('google')}
              glowColor="rgba(234, 67, 53, 0.12)"
              borderColor="rgba(234, 67, 53, 0.35)"
            >
              <div className="p-8 flex flex-col items-center text-center h-full justify-between min-h-[250px]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  theme === 'brutalist' ? 'bg-white text-black border-2 border-black shadow-[3px_3px_0px_#000000]' : 'bg-white/5 border border-white/10'
                }`}>
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Google</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Register quickly using your Google Account profile.
                  </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-4">
                  Click to Register →
                </div>
              </div>
            </InteractiveCard>

            {/* Discord Card */}
            <InteractiveCard 
              theme={theme}
              onClick={() => handleOAuthLogin('discord')}
              glowColor="rgba(88, 101, 242, 0.15)"
              borderColor="rgba(88, 101, 242, 0.35)"
            >
              <div className="p-8 flex flex-col items-center text-center h-full justify-between min-h-[250px]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  theme === 'brutalist' ? 'bg-[#5865F2] text-white border-2 border-black shadow-[3px_3px_0px_#000000]' : 'bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2]'
                }`}>
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Discord</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Create an account and sync instantly with your Discord credentials.
                  </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#5865F2] mt-4">
                  Click to Register →
                </div>
              </div>
            </InteractiveCard>

            {/* Email Card */}
            <InteractiveCard 
              theme={theme}
              onClick={() => setActiveCard('email')}
              glowColor="rgba(91, 108, 255, 0.15)"
              borderColor="rgba(91, 108, 255, 0.35)"
            >
              <div className="p-8 flex flex-col items-center text-center h-full justify-between min-h-[250px]">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  theme === 'brutalist' ? 'bg-[#facc15] text-black border-2 border-black shadow-[3px_3px_0px_#000000]' : 'bg-[#5B6CFF]/10 border border-[#5B6CFF]/20 text-[#5B6CFF]'
                }`}>
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Email & Password</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Sign up with your custom name, email address and standard password.
                  </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#5B6CFF] mt-4">
                  Click to Expand →
                </div>
              </div>
            </InteractiveCard>
          </div>
        ) : (
          /* Expanded Email signup Form Card */
          <InteractiveCard 
            theme={theme}
            glowColor="rgba(91, 108, 255, 0.1)"
            borderColor="rgba(91, 108, 255, 0.3)"
            className="w-full"
          >
            <div className="p-8">
              <CardHeader className="text-center pb-2 pt-0 border-b-0 px-0">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                  theme === 'brutalist'
                    ? 'bg-[#facc15] text-black border-2 border-black shadow-[3px_3px_0px_#000000]'
                    : theme === 'neo'
                      ? 'bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-[#5B6CFF]'
                      : 'bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/30 text-primary'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <h1 className={`text-xl font-bold tracking-tight ${headerTextClass}`}>Join ReadSphere</h1>
                <p className="text-xs text-slate-500 mt-1">Create an account to start your reading journey</p>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <SignUpForm theme={theme} onBack={() => setActiveCard('none')} />
              </CardContent>
            </div>
          </InteractiveCard>
        )}
        
        {error && (
          <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs leading-relaxed mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Style selector */}
      <ThemeToggle />
    </div>
  );
}
