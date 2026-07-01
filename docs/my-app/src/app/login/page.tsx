'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient, getURL } from '@/utils/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

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

  // Determine bulb filament & glass color depending on theme and switch state
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
      // Default / Sleek Dark
      filamentColor = 'border-amber-400 bg-amber-300/30';
      bulbGlowClass = 'bg-amber-50 shadow-[0_0_80px_20px_rgba(245,158,11,0.8),_inset_0_2px_4px_rgba(255,255,255,1)] border-amber-200';
    }
  }

  return (
    <div className="relative flex flex-col items-center select-none z-30 animate-sway">
      {/* Wire */}
      <div className="w-[1.5px] h-32 bg-slate-700/60 transition-colors duration-300" />
      
      {/* Cap */}
      <div className="w-10 h-3.5 bg-slate-800 border border-slate-900 rounded-t-sm" />
      
      {/* Bulb Socket */}
      <div className="w-6 h-3 bg-slate-750 border-x border-slate-800" />

      {/* Light Bulb */}
      <div 
        onClick={handlePull}
        className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-500 relative flex items-center justify-center ${bulbGlowClass} border-2 hover:scale-105 active:scale-95`}
      >
        {/* Filament */}
        <div className={`w-3.5 h-5 border-t border-x rounded-t transition-all duration-500 ${filamentColor}`} />
        {/* Soft glass reflection */}
        <div className="absolute top-1.5 left-3 w-2.5 h-1 bg-white/20 rounded-full rotate-[-15deg]" />
      </div>

      {/* Pull Cord */}
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

// Inner LoginForm with state transitions
function LoginForm({ theme }: { theme: string }) {
  const [loginMethod, setLoginMethod] = useState<'none' | 'email'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes('confirm') || signInError.message.toLowerCase().includes('verify')) {
          setError('email-not-verified');
        } else {
          setError(signInError.message);
        }
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setResendMessage(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) {
        setResendMessage(`Error: ${resendError.message}`);
      } else {
        setResendMessage("Verification email sent! Check your inbox.");
      }
    } catch (err: any) {
      setResendMessage("Failed to resend verification email.");
    }
    setResending(false);
  };

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

  // Styled button helper
  const getButtonStyles = (type: 'google' | 'discord' | 'email') => {
    if (theme === 'brutalist') {
      const base = 'w-full flex items-center justify-center gap-2 border-2 border-black font-black py-2.5 rounded-none transition-all active:translate-x-0 active:translate-y-0 text-sm shadow-[4px_4px_0px_#000000]';
      switch (type) {
        case 'google':
          return `${base} bg-white text-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000]`;
        case 'discord':
          return `${base} bg-[#5865F2] text-white hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000]`;
        case 'email':
          return `${base} bg-[#facc15] text-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000]`;
      }
    } else if (theme === 'neo') {
      const base = 'w-full flex items-center justify-center gap-2 bg-[#1e2022] shadow-[3px_3px_6px_#121314,_-3px_-3px_6px_#2a2d30] hover:shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] active:scale-98 transition-all py-2.5 rounded-2xl font-semibold text-sm';
      switch (type) {
        case 'google':
          return `${base} text-slate-300 hover:text-white`;
        case 'discord':
          return `${base} text-[#5865F2]`;
        case 'email':
          return `${base} text-[#5B6CFF]`;
      }
    } else {
      // Default & Glass
      switch (type) {
        case 'google':
          return 'w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 py-2.5 rounded-xl font-semibold text-sm';
        case 'discord':
          return 'w-full flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all duration-300 py-2.5 rounded-xl font-semibold text-sm';
        case 'email':
          return 'w-full flex items-center justify-center gap-2 bg-[#5B6CFF]/10 hover:bg-[#5B6CFF]/20 text-[#5B6CFF] border border-[#5B6CFF]/20 hover:border-[#5B6CFF]/40 transition-all duration-300 py-2.5 rounded-xl font-semibold text-sm';
      }
    }
  };

  // Submit button style
  const getSubmitButtonStyles = () => {
    if (theme === 'brutalist') {
      return 'w-full py-2.5 border-2 border-black bg-[#ec4899] text-white font-black hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0px_#000000] rounded-none transition-all text-sm uppercase tracking-wider';
    } else if (theme === 'neo') {
      return 'w-full py-2.5 bg-gradient-to-r from-primary to-[#8B5CF6] text-white font-bold rounded-2xl shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all text-sm';
    } else {
      return 'w-full py-2.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 text-sm';
    }
  };

  return (
    <div className="relative min-h-[300px] overflow-hidden">
      {message && (
        <div className="mb-4 text-xs font-semibold text-emerald-400 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-pulse">
          {message}
        </div>
      )}

      {/* Login Options Selector screen */}
      {loginMethod === 'none' ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="text-center pb-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Sign In Options</h2>
            <p className="text-[11px] text-slate-500 mt-1">Choose your preferred login pathway</p>
          </div>

          <button 
            onClick={() => handleOAuthLogin('google')} 
            type="button" 
            className={getButtonStyles('google')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => handleOAuthLogin('discord')} 
            type="button" 
            className={getButtonStyles('discord')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            Continue with Discord
          </button>

          <button 
            onClick={() => setLoginMethod('email')} 
            type="button" 
            className={getButtonStyles('email')}
          >
            <Mail className="w-4 h-4" />
            Continue with Email
          </button>

          <div className="text-center text-xs text-slate-500 mt-4 border-t border-slate-800/40 pt-4">
            Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline transition-colors font-semibold">Sign up</a>
          </div>
        </div>
      ) : (
        /* Email Login Form */
        <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
            <button 
              type="button" 
              onClick={() => setLoginMethod('none')} 
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to options
            </button>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Email Login</span>
          </div>

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

          <div className="space-y-1">
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

            <div className="flex justify-between items-center text-[11px] mt-2.5 px-0.5">
              <div className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="remember-me" 
                  className={`rounded cursor-pointer w-3.5 h-3.5 ${
                    theme === 'brutalist'
                      ? 'bg-white border-2 border-black rounded-none text-black focus:ring-0'
                      : theme === 'neo'
                        ? 'bg-[#1e2022] border-slate-800 text-[#5B6CFF] focus:ring-0'
                        : 'bg-slate-950 border-slate-800 text-primary focus:ring-primary/40'
                  }`} 
                />
                <label htmlFor="remember-me" className="text-slate-400 select-none cursor-pointer">Remember Me</label>
              </div>
              <a href="/forgot-password" className="text-primary hover:underline transition-colors font-semibold">Forgot Password?</a>
            </div>
          </div>
          
          {error === 'email-not-verified' ? (
            <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs leading-relaxed flex flex-col gap-2">
              <div>Your email is not verified yet. Please check your inbox for a verification link.</div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="text-left font-bold text-amber-300 hover:text-amber-200 underline disabled:opacity-50 text-[10px] uppercase tracking-wider w-max"
              >
                {resending ? 'Sending...' : '✉ Resend verification link'}
              </button>
              {resendMessage && (
                <div className="text-[10px] text-emerald-400 font-bold">{resendMessage}</div>
              )}
            </div>
          ) : (
            error && (
              <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs leading-relaxed">
                {error}
              </div>
            )
          )}
          
          <Button 
            type="submit" 
            disabled={loading} 
            className={getSubmitButtonStyles()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </span>
            ) : 'Log In'}
          </Button>
        </form>
      )}
    </div>
  );
}

// Master Login Page Component
export default function LoginPage() {
  const [isLightOn, setIsLightOn] = useState(false);
  const [theme, setTheme] = useState<'default' | 'glass' | 'neo' | 'brutalist'>('default');

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
      // Skip toggle if user is typing in form inputs
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

  // Dynamic Background classes depending on lamp state
  const bgStyles = isLightOn 
    ? 'bg-[#060814] bg-[radial-gradient(circle_at_top,_rgba(91,108,255,0.06),_transparent_60%)]' 
    : 'bg-[#020306]';

  // Dynamic Card class utility
  const getCardClasses = () => {
    switch (theme) {
      case 'glass':
        return 'bg-slate-900/30 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(91,108,255,0.15)] rounded-[24px]';
      case 'neo':
        return 'bg-[#1e2022] shadow-[8px_8px_20px_#121314,_-8px_-8px_20px_#2a2d30] border border-slate-800/30 rounded-[28px]';
      case 'brutalist':
        return 'bg-[#141414] border-4 border-white shadow-[8px_8px_0px_#facc15] rounded-none';
      default:
        return 'bg-[#0b0f19]/70 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_-12px_rgba(91,108,255,0.15)] rounded-2xl';
    }
  };

  // Header alignment classes for Neomorphism & Brutalism
  const headerTextClass = theme === 'brutalist' ? 'text-white' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent';

  return (
    <div className={`flex flex-col min-h-screen items-center justify-start p-4 transition-colors duration-500 overflow-hidden relative ${bgStyles}`}>
      
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
            Pull the switch knob or press <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono shadow">L</kbd> to illuminate the login card
          </p>
        </div>
      )}

      {/* Animated Card Container */}
      <div 
        className={`w-full max-w-md mt-12 z-20 transition-all duration-700 ease-out transform ${
          isLightOn 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <Card className={`overflow-hidden p-2 ${getCardClasses()}`}>
          <CardHeader className="text-center pb-2 pt-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
              theme === 'brutalist'
                ? 'bg-[#facc15] text-black border-2 border-black shadow-[3px_3px_0px_#000000]'
                : theme === 'neo'
                  ? 'bg-[#1e2022] shadow-[inset_2px_2px_5px_#121314,_inset_-2px_-2px_5px_#2a2d30] text-[#5B6CFF]'
                  : 'bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/30 text-primary'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${headerTextClass}`}>Welcome Back</h1>
            <p className="text-xs text-slate-500 mt-1">Log in to your ReadSphere account</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <div className="text-xs text-slate-500">Loading form...</div>
              </div>
            }>
              <LoginForm theme={theme} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Style selector for immediate verification */}
      <ThemeToggle />
    </div>
  );
}

