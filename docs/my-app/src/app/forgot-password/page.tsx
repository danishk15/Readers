'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient, getURL } from '@/utils/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Password reset link has been sent to your email!");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#060913] to-[#060913]">
      <Card className="w-full max-w-md bg-[#0b0f19]/70 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_-12px_rgba(91,108,255,0.15)] rounded-2xl overflow-hidden p-2 animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 border border-primary/30 text-primary mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your email to receive a password reset link.</p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {success ? (
            <div className="space-y-4">
              <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs leading-relaxed font-medium">
                {success}
              </div>
              <Button onClick={() => window.location.href = '/login'} className="w-full bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    Sending link...
                  </span>
                ) : 'Send Reset Link'}
              </Button>

              <div className="text-center text-xs text-slate-500 mt-2">
                <a href="/login" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Log In
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
