'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient, getURL } from '@/utils/supabase/client';

function LoginForm() {
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
        // Use window.location.href to force a full reload and cookie sync, avoiding Next.js/Supabase redirect race conditions
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

  return (
    <>
      {message && (
        <div className="mb-4 text-xs font-medium text-emerald-400 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-pulse">
          {message}
        </div>
      )}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
        />
        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
          />
          <div className="flex justify-between items-center text-[11px] mt-2.5 px-0.5">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                id="remember-me" 
                className="rounded bg-slate-950 border-slate-800 text-primary focus:ring-primary/50 cursor-pointer w-3.5 h-3.5" 
              />
              <label htmlFor="remember-me" className="text-slate-400 select-none cursor-pointer">Remember Me</label>
            </div>
            <a href="/forgot-password" className="text-primary hover:underline hover:text-primary/95 transition-colors font-medium">Forgot Password?</a>
          </div>
        </div>
        
        {error === 'email-not-verified' ? (
          <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg text-xs leading-relaxed flex flex-col gap-2">
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
            <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs leading-relaxed">
              {error}
            </div>
          )
        )}
        
        <Button type="submit" disabled={loading} className="mt-2 w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-semibold py-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in...
            </span>
          ) : 'Log In'}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-850" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0b0f19] px-3 text-slate-500 tracking-wider">Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button onClick={() => handleOAuthLogin('google')} type="button" variant="secondary" className="w-full flex items-center justify-center gap-2 bg-[#ea4335]/10 hover:bg-[#ea4335]/20 text-[#ea4335] border border-[#ea4335]/20 hover:border-[#ea4335]/40 transition-all duration-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
            Google
          </Button>
          <Button onClick={() => handleOAuthLogin('discord')} type="button" variant="secondary" className="w-full flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all duration-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            Discord
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500 mt-3">
          Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline hover:text-primary/95 transition-colors font-medium">Sign up</a>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#060913] to-[#060913]">
      <Card className="w-full max-w-md bg-[#0b0f19]/70 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_-12px_rgba(91,108,255,0.15)] rounded-2xl overflow-hidden p-2">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/30 text-primary mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Log in to your ReadSphere account.</p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs text-slate-500">Loading form...</div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
