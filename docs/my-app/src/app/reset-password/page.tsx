'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/client';
import { ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Password Policy Checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  
  const passwordsMatch = password === confirmPassword;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        router.push('/login?message=Password updated successfully! Please log in with your new password.');
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your new secure password below.</p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
              />
              {password.length > 0 && (
                <div className="text-[11px] space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-850 mt-2">
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
              className="border-slate-800 bg-slate-950/80 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all duration-300"
            />
            {confirmPassword.length > 0 && (
              <div className="text-[11px] px-1">
                {passwordsMatch ? (
                  <span className="text-emerald-400 font-semibold">✓ Passwords match</span>
                ) : (
                  <span className="text-rose-450 font-semibold text-rose-400">✗ Passwords do not match</span>
                )}
              </div>
            )}

            {error && (
              <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs leading-relaxed">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-semibold py-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating password...
                </span>
              ) : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
