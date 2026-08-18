'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, BookOpen, Sparkles, Check, AlertCircle, ArrowRight, Lock, User, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient, getURL } from '@/utils/supabase/client';
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
      <div className="w-[1.5px] h-24 bg-slate-700/60 transition-colors duration-300" />
      <div className="w-10 h-3 bg-slate-800 border border-slate-900 rounded-t-sm" />
      <div className="w-6 h-2.5 bg-slate-750 border-x border-slate-800" />
      
      <div 
        onClick={handlePull}
        className={`w-11 h-11 rounded-full cursor-pointer transition-all duration-500 relative flex items-center justify-center ${bulbGlowClass} border-2 hover:scale-105 active:scale-95`}
        title="Toggle Ambient Lighting (Key: L)"
      >
        <div className={`w-3 h-4 border-t border-x rounded-t transition-all duration-500 ${filamentColor}`} />
        <div className="absolute top-1.5 left-2.5 w-2 h-1 bg-white/20 rounded-full rotate-[-15deg]" />
      </div>

      <div 
        onClick={handlePull}
        style={{
          transform: isPulling ? 'translateY(10px)' : 'translateY(0px)',
          transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="absolute top-[140px] -right-3 flex flex-col items-center cursor-pointer group"
      >
        <div className="w-[1px] h-16 bg-slate-500/80 group-hover:bg-slate-350 transition-colors" />
        <div className="w-2.5 h-3 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-sm border border-amber-900 shadow-md group-hover:from-amber-500 group-hover:to-amber-700" />
      </div>
    </div>
  );
}

// Stable precomputed dust particles inside the light spotlight
const STATIC_PARTICLES = [
  { left: 15, size: 2, duration: 16, delay: -2, opacity: 0.25 },
  { left: 32, size: 1.5, duration: 18, delay: -7, opacity: 0.3 },
  { left: 48, size: 2.5, duration: 14, delay: -12, opacity: 0.2 },
  { left: 65, size: 1.8, duration: 20, delay: -5, opacity: 0.35 },
  { left: 78, size: 2.2, duration: 15, delay: -15, opacity: 0.22 },
  { left: 24, size: 1.2, duration: 22, delay: -9, opacity: 0.18 },
  { left: 58, size: 2.8, duration: 17, delay: -3, opacity: 0.28 },
  { left: 82, size: 1.6, duration: 19, delay: -11, opacity: 0.32 },
  { left: 40, size: 2.1, duration: 21, delay: -8, opacity: 0.24 },
  { left: 70, size: 1.4, duration: 16, delay: -14, opacity: 0.26 },
  { left: 20, size: 2.4, duration: 18, delay: -6, opacity: 0.2 },
  { left: 85, size: 1.9, duration: 23, delay: -1, opacity: 0.3 },
  { left: 52, size: 1.7, duration: 15, delay: -10, opacity: 0.27 },
  { left: 35, size: 2.3, duration: 19, delay: -4, opacity: 0.22 },
  { left: 62, size: 1.5, duration: 17, delay: -13, opacity: 0.31 }
];

function DustParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STATIC_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute bg-white/70 rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `-20px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
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
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[160vw] max-w-[1250px] h-screen pointer-events-none z-10 transition-opacity duration-500 will-change-transform"
      style={{
        clipPath: 'polygon(50% 140px, 0% 100%, 100% 100%)',
      }}
    >
      <div className={`w-full h-full bg-gradient-to-b ${gradientClass}`} />
      <DustParticles />
    </div>
  );
}

interface AuthContainerProps {
  defaultMode: 'login' | 'signup';
}

export default function AuthContainer({ defaultMode }: AuthContainerProps) {
  const [isLightOn, setIsLightOn] = useState(true);
  const [theme, setTheme] = useState<'default' | 'glass' | 'neo' | 'brutalist'>('default');
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Signup Form States
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);

  // Social / Demo Auth States
  const [oauthLoading, setOauthLoading] = useState<'google' | 'discord' | 'demo' | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const redirectMessage = searchParams.get('message');

  // Sync redirect error/message if present
  useEffect(() => {
    if (redirectMessage) {
      setLoginError(redirectMessage);
    }
  }, [redirectMessage]);

  // Sync global theme
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

  // Keyboard shortcut 'L' to toggle lighting
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

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setResendMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('verify')) {
          setLoginError('email-not-verified');
        } else {
          setLoginError(error.message);
        }
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setLoginError(err?.message || "An unexpected error occurred during login.");
    }
    setLoginLoading(false);
  };

  // Resend verification
  const handleResendVerification = async () => {
    if (!loginEmail) return;
    setResending(true);
    setResendMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: loginEmail,
      });
      if (error) {
        setResendMessage(`Error: ${error.message}`);
      } else {
        setResendMessage("Verification email sent! Please check your inbox.");
      }
    } catch (err: any) {
      setResendMessage("Failed to resend verification email.");
    }
    setResending(false);
  };

  // Password Policy Calculation for Signup
  const isMinLength = signUpPassword.length >= 6;
  const hasNumber = /[0-9]/.test(signUpPassword);
  const hasUpper = /[A-Z]/.test(signUpPassword);
  const passwordsMatch = signUpPassword.length > 0 && signUpPassword === signUpConfirmPassword;

  const getPasswordStrength = () => {
    if (signUpPassword.length === 0) return null;
    if (signUpPassword.length < 6) return { label: 'Too short', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    let score = 1;
    if (hasNumber) score++;
    if (hasUpper) score++;
    if (signUpPassword.length >= 8) score++;

    if (score <= 2) return { label: 'Weak', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score === 3) return { label: 'Good', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    return { label: 'Strong', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  // Handle Signup
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpSuccessMessage(null);

    if (!signUpFullName.trim()) {
      setSignUpError("Please enter your full name.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      setSignUpError("Please enter a valid email address.");
      return;
    }

    if (!isMinLength) {
      setSignUpError("Password must be at least 6 characters long.");
      return;
    }

    if (!passwordsMatch) {
      setSignUpError("Passwords do not match.");
      return;
    }

    setSignUpLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${getURL()}auth/callback`,
          data: {
            full_name: signUpFullName,
            username: signUpFullName,
          }
        },
      });

      if (error) {
        setSignUpError(error.message);
      } else if (data?.session) {
        // Auto-confirmed or session active
        window.location.href = '/dashboard';
      } else {
        setSignUpSuccessMessage("Account created successfully! Please check your email inbox to verify your account before logging in.");
      }
    } catch (err: any) {
      setSignUpError(err?.message || "An unexpected error occurred during signup.");
    }
    setSignUpLoading(false);
  };

  // OAuth Login (Google / Discord)
  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setOauthLoading(provider);
    setLoginError(null);
    setSignUpError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getURL()}auth/callback`,
        },
      });
      if (error) {
        setLoginError(error.message);
        setOauthLoading(null);
      }
    } catch (err: any) {
      setLoginError(err?.message || `Failed to authenticate with ${provider}.`);
      setOauthLoading(null);
    }
  };

  // 1-Click Demo Reader Login
  const handleDemoLogin = async () => {
    setOauthLoading('demo');
    setLoginError(null);
    setSignUpError(null);

    const demoEmail = 'reader.demo@readsphere.app';
    const demoPassword = 'DemoReaderPass123!';

    try {
      // 1. Try signing in with existing demo account
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (!signInErr && signInData?.session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('readsphere-demo-mode', 'true');
        }
        window.location.href = '/dashboard';
        return;
      }

      // 2. If demo account doesn't exist, create it on the fly
      const { data: signUpData } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: 'Demo Reader',
            username: 'demoreader',
          }
        }
      });

      if (signUpData?.session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('readsphere-demo-mode', 'true');
        }
        window.location.href = '/dashboard';
        return;
      }

      // 3. Fallback: store demo session locally so reader can explore dashboard seamlessly
      if (typeof window !== 'undefined') {
        localStorage.setItem('readsphere-demo-mode', 'true');
        localStorage.setItem('readsphere-demo-user', JSON.stringify({
          id: 'demo-reader-id-101',
          email: demoEmail,
          user_metadata: { full_name: 'Demo Reader', username: 'demoreader' }
        }));
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      // Direct fallback to dashboard in demo mode
      if (typeof window !== 'undefined') {
        localStorage.setItem('readsphere-demo-mode', 'true');
      }
      window.location.href = '/dashboard';
    }
  };

  // Card theme styling rules
  let cardBoxClass = 'bg-[#0b0f19]/95 border border-slate-800/80 shadow-2xl rounded-3xl backdrop-blur-xl';
  let buttonPrimaryClass = 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-md shadow-primary/20 rounded-xl transition-colors duration-150';
  let inputClass = 'border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/40 focus:border-slate-700';

  if (theme === 'glass') {
    cardBoxClass = 'bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[28px]';
    buttonPrimaryClass = 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 rounded-2xl transition-colors duration-150';
  } else if (theme === 'neo') {
    cardBoxClass = 'bg-[#1e2022] border border-slate-800/40 shadow-2xl rounded-[28px]';
    buttonPrimaryClass = 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md rounded-2xl transition-colors duration-150';
    inputClass = 'border-transparent bg-[#17191b] shadow-inner text-slate-100 focus:ring-0';
  } else if (theme === 'brutalist') {
    cardBoxClass = 'bg-[#141414] border-4 border-white shadow-[8px_8px_0px_#000000] rounded-none';
    buttonPrimaryClass = 'bg-[#ec4899] text-white border-2 border-black font-black hover:bg-[#db2777] active:bg-[#be185d] rounded-none uppercase tracking-wider transition-colors duration-150';
    inputClass = 'border-2 border-black rounded-none bg-white text-black placeholder:text-slate-500 focus:ring-0 focus:border-black';
  }

  const bgStyles = isLightOn 
    ? 'bg-[#060814] bg-[radial-gradient(circle_at_top,_rgba(91,108,255,0.08),_transparent_60%)]' 
    : 'bg-[#020306]';

  return (
    <div className={`flex flex-col min-h-screen items-center justify-start p-4 transition-colors duration-500 overflow-x-hidden relative ${bgStyles}`}>
      
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); transform-origin: top center; }
          50% { transform: rotate(1.2deg); transform-origin: top center; }
        }
        .animate-sway {
          animation: sway 6s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-380px) translateX(25px); opacity: 0; }
        }
      ` }} />

      {/* Decorative Atmospheric Lighting */}
      <LampFixture 
        isLightOn={isLightOn} 
        onToggle={() => setIsLightOn(!isLightOn)} 
        theme={theme} 
      />

      <SpotlightCone isLightOn={isLightOn} theme={theme} />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto mt-6 mb-12 z-20">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-wide font-display text-white">ReadSphere</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            {mode === 'login' ? 'Welcome back! Sign in to access your digital library.' : 'Create your reader account to start tracking & reading books.'}
          </p>
        </div>

        <div className={`p-6 sm:p-8 ${cardBoxClass}`}>
          
          {/* Mode Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSignUpError(null);
              }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Instant Quick Auth Methods (Socials & Demo Reader) */}
          <div className="space-y-2.5 mb-6">
            
            {/* 1-Click Demo Reader Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={oauthLoading !== null}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 hover:border-amber-400/90 hover:bg-amber-500/25 text-amber-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-150 group shadow-sm cursor-pointer"
            >
              {oauthLoading === 'demo' ? (
                <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
              )}
              <span>⚡ Instant Demo Reader Login</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Auth */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-slate-850 cursor-pointer"
              >
                {oauthLoading === 'google' ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                )}
                <span>Google</span>
              </button>

              {/* Discord Auth */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('discord')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-slate-850 cursor-pointer"
              >
                {oauthLoading === 'discord' ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                )}
                <span>Discord</span>
              </button>
            </div>

          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0b0f19] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-widest absolute">
              or with email
            </span>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-300">
              
              <Input
                label="Email Address"
                type="email"
                placeholder="reader@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className={inputClass}
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className={inputClass}
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input 
                      type="checkbox" 
                      id="remember-me" 
                      className="rounded border-slate-800 bg-slate-950 text-primary focus:ring-0 cursor-pointer w-3.5 h-3.5" 
                    />
                    <span>Remember me</span>
                  </label>
                  <a 
                    href="/forgot-password" 
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Login Error handling */}
              {loginError === 'email-not-verified' ? (
                <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Your email address is not verified yet. Please check your inbox for the verification link.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-left font-bold text-amber-300 hover:text-amber-200 underline disabled:opacity-50 text-[11px] tracking-wide cursor-pointer"
                  >
                    {resending ? 'Sending link...' : '✉ Resend verification link'}
                  </button>
                  {resendMessage && (
                    <div className="text-[11px] text-emerald-400 font-bold">{resendMessage}</div>
                  )}
                </div>
              ) : (
                loginError && (
                  <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )
              )}

              <Button
                type="submit"
                disabled={loginLoading}
                className={`w-full py-3 text-xs font-bold ${buttonPrimaryClass}`}
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In to ReadSphere
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <div>
              {signUpSuccessMessage ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 space-y-2 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                      <Check className="w-5 h-5" /> Account Created!
                    </div>
                    <p>{signUpSuccessMessage}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSignUpSuccessMessage(null);
                      setMode('login');
                    }}
                    className={`w-full py-3 text-xs font-bold ${buttonPrimaryClass}`}
                  >
                    Proceed to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-4 animate-in fade-in duration-300">
                  
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Jane Doe"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    required
                    className={inputClass}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    className={inputClass}
                  />

                  <div className="space-y-1.5">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      className={inputClass}
                    />

                    {/* Password Strength meter */}
                    {signUpPassword.length > 0 && (
                      <div className="flex items-center justify-between text-[11px] pt-1 px-0.5">
                        <span className="text-slate-400">Password strength:</span>
                        {(() => {
                          const str = getPasswordStrength();
                          return str ? (
                            <span className={`px-2 py-0.5 rounded border font-semibold ${str.color}`}>
                              {str.label}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      required
                      className={inputClass}
                    />

                    {signUpConfirmPassword.length > 0 && (
                      <div className="text-[11px] px-0.5 pt-0.5">
                        {passwordsMatch ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold">✗ Passwords do not match</span>
                        )}
                      </div>
                    )}
                  </div>

                  {signUpError && (
                    <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signUpError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={signUpLoading}
                    className={`w-full py-3 text-xs font-bold ${buttonPrimaryClass}`}
                  >
                    {signUpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating your account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Create Reader Account
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                </form>
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <span>
                New to ReadSphere?{' '}
                <button 
                  type="button"
                  onClick={() => { setMode('signup'); setSignUpError(null); }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setLoginError(null); }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

      <ThemeToggle />
    </div>
  );
}
