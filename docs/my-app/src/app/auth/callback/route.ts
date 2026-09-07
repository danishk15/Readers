import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Validates and sanitizes a relative redirect URL to prevent Open Redirect attacks.
 */
function sanitizeRedirectUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/dashboard';

  const decoded = decodeURIComponent(rawUrl).trim();

  // Reject protocol schemes (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) {
    return '/dashboard';
  }

  // Ensure it starts with exactly one leading slash, not double slashes (protocol-relative) or backslashes
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.startsWith('\\')) {
    return '/dashboard';
  }

  // Reject newlines / carriage returns to prevent HTTP header injection
  if (/[\r\n]/.test(decoded)) {
    return '/dashboard';
  }

  return decoded;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const safeNext = sanitizeRedirectUrl(rawNext);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
    console.error('Supabase OAuth code exchange error:', error);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?message=Could not login with provider', request.url));
}
