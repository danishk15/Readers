'use client';

import { Suspense } from 'react';
import AuthContainer from '@/components/ui/AuthContainer';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#020306] text-slate-400">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        Loading login interface...
      </div>
    }>
      <AuthContainer defaultMode="login" />
    </Suspense>
  );
}
