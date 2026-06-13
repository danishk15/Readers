import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate URL to prevent arbitrary SSRF, but allow gutenberg, google books, etc.
    const parsedUrl = new URL(fileUrl);
    const allowedHosts = [
      'gutenberg.org',
      'www.gutenberg.org',
      'books.google.com',
      'books.googleusercontent.com',
      'archive.org',
      'openlibrary.org'
    ];
    
    const isAllowed = allowedHosts.some(host => 
      parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
    );

    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden domain' }, { status: 403 });
    }

    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch file: ${response.statusText}` }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return the file with CORS headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/epub+zip',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('Error in proxy route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
