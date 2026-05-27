'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient, getURL } from '@/utils/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      router.push('/login?message=Check your email to confirm your account.');
    }
    setLoading(false);
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

  const handleGuestBypass = () => {
    // Set a client cookie to bypass the middleware check for local development
    document.cookie = "demo-session=true; path=/; max-age=86400; SameSite=Lax";
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#060913] to-[#060913]">
      <Card className="w-full max-w-md bg-[#0b0f19]/70 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_-12px_rgba(91,108,255,0.15)] rounded-2xl overflow-hidden p-2">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/30 text-primary mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Join ReadSphere</h1>
          <p className="text-xs text-slate-500 mt-1">Create an account to start your reading journey.</p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
            />
            
            {error && (
              <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs leading-relaxed">
                {error}
              </div>
            )}
            
            <Button type="submit" disabled={loading} className="mt-2 w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-semibold py-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </Button>

            {/* Quick Guest Bypass on Signup page too */}
            <div className="relative my-1">
              <Button 
                onClick={handleGuestBypass} 
                type="button" 
                className="w-full bg-slate-800/80 hover:bg-slate-700/80 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 shadow-md shadow-emerald-950/20 transition-all duration-300 font-semibold py-2"
              >
                🚀 Quick Guest Sign-In (Skip Verification)
              </Button>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-850" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0b0f19] px-3 text-slate-500 tracking-wider">Or sign up with</span>
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
              Already have an account? <a href="/login" className="text-primary hover:underline hover:text-primary/95 transition-colors font-medium">Log in</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
