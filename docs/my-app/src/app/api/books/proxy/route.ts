import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Checks whether an IP or hostname is private, loopback, link-local, or cloud metadata.
 */
function isPrivateOrRestrictedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

  // 1. Hostname strings
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost') ||
    host.endsWith('.localdomain') ||
    host.endsWith('.arpa') ||
    host === 'metadata.google.internal' ||
    host === 'instance-data'
  ) {
    return true;
  }

  // 2. IPv6 Loopback, Link-Local, and Unique Local
  if (
    host === '::1' ||
    host === '::' ||
    host.startsWith('fe80:') ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    host.startsWith('ff') ||
    host.startsWith('::ffff:')
  ) {
    return true;
  }

  // 3. Decimal, Hex, or Octal IP representations
  if (/^\d+$/.test(host) || /^0x[0-9a-fA-F]+$/.test(host)) {
    return true;
  }

  // 4. IPv4 Pattern
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some(o => o < 0 || o > 255)) return true;

    const [o1, o2] = octets;

    // 0.0.0.0/8 (Current network)
    if (o1 === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;

    // 10.0.0.0/8 (Private network)
    if (o1 === 10) return true;

    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;

    // 192.168.0.0/16 (Private network)
    if (o1 === 192 && o2 === 168) return true;

    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure/DigitalOcean Cloud Metadata 169.254.169.254)
    if (o1 === 169 && o2 === 254) return true;

    // 100.64.0.0/10 (Carrier-Grade NAT & Alibaba Cloud Metadata 100.100.100.100)
    if (o1 === 100 && (o2 >= 64 && o2 <= 127)) return true;
    if (host === '100.100.100.100') return true;

    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation)
    if (o1 === 192 && o2 === 0 && octets[2] === 2) return true;
    if (o1 === 198 && o2 === 51 && octets[2] === 100) return true;
    if (o1 === 203 && o2 === 0 && octets[2] === 113) return true;

    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (o1 >= 224) return true;
  }

  return false;
}

export async function GET(request: Request) {
  // 1. Rate Limiting Protection
  const clientIp = getClientIp(request);
  const limiter = rateLimit(`proxy:${clientIp}`, { windowMs: 60 * 1000, maxRequests: 40 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Too many proxy requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(limiter.reset) } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // 2. Validate URL structure and protocol
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTP and HTTPS protocols are allowed' }, { status: 400 });
    }

    // 3. Strict SSRF check on hostname and IP
    if (isPrivateOrRestrictedHost(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'Forbidden destination: restricted network address' }, { status: 403 });
    }

    // 4. Fetch destination safely without automatic redirects to prevent redirect-based SSRF
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        method: 'GET',
        redirect: 'manual', // Do not automatically follow redirects to avoid SSRF escape
        signal: controller.signal,
        headers: {
          'User-Agent': 'QuillHawk-Reader-SecureProxy/2.0',
          'Accept': 'application/epub+zip, application/pdf, text/plain, */*',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    // Handle manual redirect verification if response is a redirect
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        return NextResponse.json({ error: 'Redirect without location header' }, { status: 400 });
      }

      let redirectUrl: URL;
      try {
        redirectUrl = new URL(location, parsedUrl.toString());
      } catch {
        return NextResponse.json({ error: 'Invalid redirect location' }, { status: 400 });
      }

      if (redirectUrl.protocol !== 'http:' && redirectUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Invalid redirect protocol' }, { status: 403 });
      }

      if (isPrivateOrRestrictedHost(redirectUrl.hostname)) {
        return NextResponse.json({ error: 'Forbidden redirect destination' }, { status: 403 });
      }

      // Fetch verified redirect target
      const redirectController = new AbortController();
      const redirectTimeout = setTimeout(() => redirectController.abort(), FETCH_TIMEOUT_MS);
      try {
        response = await fetch(redirectUrl.toString(), {
          method: 'GET',
          redirect: 'error',
          signal: redirectController.signal,
          headers: {
            'User-Agent': 'QuillHawk-Reader-SecureProxy/2.0',
          },
        });
      } finally {
        clearTimeout(redirectTimeout);
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream source responded with status ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 5. Enforce Max Size Restriction
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds allowed limit (25 MB)' },
        { status: 413 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds allowed limit (25 MB)' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(arrayBuffer);

    let contentType = response.headers.get('Content-Type') || '';
    if (!contentType || contentType === 'application/octet-stream' || contentType === 'text/plain') {
      if (fileUrl.includes('.epub')) {
        contentType = 'application/epub+zip';
      } else if (fileUrl.includes('.pdf')) {
        contentType = 'application/pdf';
      } else {
        contentType = 'application/epub+zip';
      }
    }

    // Return the file with security headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout fetching remote resource' }, { status: 504 });
    }
    console.error('Error in secure proxy route:', error);
    return NextResponse.json({ error: 'Failed to proxy requested file' }, { status: 500 });
  }
}
