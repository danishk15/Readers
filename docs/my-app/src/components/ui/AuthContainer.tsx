'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Check, AlertCircle, ArrowRight, History, UserCheck, LogIn, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { createClient, getStoredAccounts, getLoginHistory } from '@/utils/supabase/client';

interface AuthContainerProps {
  defaultMode: 'login' | 'signup';
}

export default function AuthContainer({ defaultMode }: AuthContainerProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup Form States
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Social Auth States
  const [oauthLoading, setOauthLoading] = useState<'google' | 'discord' | null>(null);

  // Saved accounts & login records
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [loginRecords, setLoginRecords] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const supabase = createClient();
  const searchParams = useSearchParams();
  const redirectMessage = searchParams.get('message');

  // Load saved accounts and login history
  useEffect(() => {
    try {
      const accounts = getStoredAccounts();
      setSavedAccounts(accounts);
      const history = getLoginHistory();
      setLoginRecords(history);
    } catch {}
  }, [mode]);

  useEffect(() => {
    if (redirectMessage) {
      setLoginError(redirectMessage);
    }
  }, [redirectMessage]);

  // 1-Click Direct Login for saved account from history
  const handleDirectLogin = async (account: any) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { error } = await (supabase.auth as any).signInWithPassword({
        email: account.email,
        password: account.password || '',
        quickLogin: true,
      });

      if (!error) {
        window.location.href = '/dashboard';
      } else {
        setLoginEmail(account.email);
        setLoginError(error.message);
      }
    } catch (err: any) {
      setLoginEmail(account.email);
      setLoginError(err?.message || 'Failed to sign in.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Login Form Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setLoginError(err?.message || "An unexpected error occurred during login.");
    }
    setLoginLoading(false);
  };

  // Password Policy Calculation
  const isMinLength = signUpPassword.length >= 6;
  const passwordsMatch = signUpPassword.length > 0 && signUpPassword === signUpConfirmPassword;

  // Handle Signup Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

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
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpFullName,
          },
        },
      });

      if (error) {
        setSignUpError(error.message);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setSignUpError(err?.message || "An unexpected error occurred during registration.");
    }
    setSignUpLoading(false);
  };

  // OAuth Sign In
  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setOauthLoading(provider);
    setLoginError(null);
    setSignUpError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (mode === 'login') setLoginError(error.message);
        else setSignUpError(error.message);
      }
    } catch (err: any) {
      const msg = err?.message || `Failed to sign in with ${provider}.`;
      if (mode === 'login') setLoginError(msg);
      else setSignUpError(msg);
    } finally {
      setOauthLoading(null);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background relative select-none font-sans text-foreground transition-colors duration-300">
      {/* Theme Switcher in Auth Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="dropdown" size="sm" showLabel={false} />
      </div>

      {/* Ambient background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--glow-1)] rounded-full blur-[130px] animate-drift-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--glow-2)] rounded-full blur-[130px] animate-drift-mid" />
      </div>

      <div className="w-full max-w-md mx-auto my-8 [perspective:1200px] z-10">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-slate-400 flex items-center justify-center shadow-md border border-slate-300/40 text-white">
              <span className="text-xl">🪶</span>
            </div>
            <span className="text-2xl font-black tracking-wide font-display text-foreground">QuillHawk</span>
          </div>
          <p className="text-xs text-muted max-w-xs">
            {mode === 'login' ? 'Welcome back! Sign in to access your digital library.' : 'Create your QuillHawk account to start reading & tracking books.'}
          </p>
        </div>

        <div 
          className="w-full relative transition-transform duration-500 ease-out [transform-style:preserve-3d]"
          style={{ transform: isSignup ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* ================= FRONT: LOGIN ================= */}
          <div 
            className="w-full p-6 sm:p-8 bg-card border border-card-border shadow-xl rounded-3xl [backface-visibility:hidden] [transform:rotateY(0deg)]"
            style={{ display: isSignup ? 'none' : 'block' }}
          >
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 mb-5 rounded-xl bg-surface border border-card-border">
              <button
                type="button"
                onClick={() => { setMode('login'); setLoginError(null); }}
                className="py-2.5 text-xs font-bold rounded-lg bg-primary text-white shadow-md cursor-pointer transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setSignUpError(null); }}
                className="py-2.5 text-xs font-bold rounded-lg text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </div>

            {/* Saved Accounts & 1-Click Login */}
            {savedAccounts.length > 0 && (
              <div className="mb-5 p-3 rounded-2xl bg-surface border border-card-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Saved Accounts ({savedAccounts.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-[10px] text-primary hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    <span>{showHistory ? 'Hide Records' : 'Login Records'}</span>
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  {savedAccounts.slice(0, 3).map((acc, idx) => (
                    <div 
                      key={`acc-${idx}`}
                      onClick={() => handleDirectLogin(acc)}
                      className="flex items-center justify-between p-2 rounded-xl bg-card hover:bg-surface-hover border border-card-border transition-colors cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {acc.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="truncate block font-bold text-xs text-foreground">{acc.username || acc.full_name || acc.email.split('@')[0]}</span>
                          <span className="text-[9px] text-muted truncate block">{acc.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Log In <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>

                {/* Login History Logs Drawer */}
                {showHistory && (
                  <div className="mt-3 pt-3 border-t border-card-border/60">
                    <span className="text-[10px] font-black uppercase text-muted tracking-wider block mb-1.5">Recent Device Logins</span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {loginRecords.length === 0 ? (
                        <p className="text-[10px] text-muted italic">No local login records found.</p>
                      ) : (
                        loginRecords.slice(0, 5).map((rec, rIdx) => (
                          <div key={`rec-${rIdx}`} className="text-[9px] flex items-center justify-between text-muted py-0.5">
                            <span className="truncate max-w-[140px] font-medium">{rec.email}</span>
                            <span className="font-mono text-muted/80">{new Date(rec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Logins: Google & Discord */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-surface border border-card-border hover:bg-surface-hover text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-sm"
              >
                {oauthLoading === 'google' ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('discord')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-surface border border-card-border hover:bg-surface-hover text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-sm"
              >
                {oauthLoading === 'discord' ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                )}
                <span>Discord</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-card-border w-full" />
              <span className="bg-card px-3 text-[11px] font-medium text-muted uppercase tracking-widest absolute">
                or email login
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="reader@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-muted hover:text-foreground">
                    <input 
                      type="checkbox" 
                      id="remember-me" 
                      defaultChecked
                      className="rounded border-card-border bg-surface text-primary focus:ring-0 cursor-pointer w-3.5 h-3.5" 
                    />
                    <span>Save session</span>
                  </label>
                  <a href="/forgot-password" className="text-primary hover:underline font-medium">
                    Forgot Password?
                  </a>
                </div>
              </div>

              {loginError && (
                <div className="text-rose-700 bg-rose-100 border border-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-md"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In to QuillHawk
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-xs text-[#6C665F]">
              <span>
                New to QuillHawk?{' '}
                <button 
                  type="button"
                  onClick={() => { setMode('signup'); setSignUpError(null); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            </div>
          </div>

          {/* ================= BACK: SIGNUP ================= */}
          <div 
            className="w-full p-6 sm:p-8 bg-card border border-card-border shadow-xl rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ display: isSignup ? 'block' : 'none' }}
          >
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 mb-5 rounded-xl bg-surface border border-card-border">
              <button
                type="button"
                onClick={() => { setMode('login'); setLoginError(null); }}
                className="py-2.5 text-xs font-bold rounded-lg text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setSignUpError(null); }}
                className="py-2.5 text-xs font-bold rounded-lg bg-primary text-white shadow-md cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </div>

            {/* Social Logins: Google & Discord */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-surface border border-card-border hover:bg-surface-hover text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-sm"
              >
                {oauthLoading === 'google' ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('discord')}
                disabled={oauthLoading !== null}
                className="py-2.5 px-3 bg-surface border border-card-border hover:bg-surface-hover text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-sm"
              >
                {oauthLoading === 'discord' ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                )}
                <span>Discord</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-card-border w-full" />
              <span className="bg-card px-3 text-[11px] font-medium text-muted uppercase tracking-widest absolute">
                or email registration
              </span>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Danish Khan"
                value={signUpFullName}
                onChange={(e) => setSignUpFullName(e.target.value)}
                required
                className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="reader@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
              />

              <Input
                label="Create Password"
                type="password"
                placeholder="At least 6 characters"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                required
                className="bg-surface border-card-border text-foreground placeholder:text-muted/70"
              />

              {signUpError && (
                <div className="text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={signUpLoading}
                className="w-full py-3 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-md mt-2"
              >
                {signUpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Create QuillHawk Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-xs text-[#6C665F]">
              <span>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setLoginError(null); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
