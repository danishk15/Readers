'use client';

import { Suspense } from 'react';
import AuthContainer from '@/components/ui/AuthContainer';

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#020306] text-slate-400">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        Loading registration interface...
      </div>
    }>
      <AuthContainer defaultMode="signup" />
    </Suspense>
  );
}
