import { NextResponse } from 'next/server';
import { createClient, CLASSIC_BOOKS } from '@/utils/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request: Request) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const limiter = rateLimit(`seed-books:${clientIp}`, { windowMs: 60 * 1000, maxRequests: 5 });
  if (!limiter.success) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabase = await createClient();

    // Verify Admin Authorization
    const adminSecret = process.env.ADMIN_SEED_SECRET || process.env.ADMIN_SECRET_KEY;
    const authHeader = request.headers.get('authorization') || '';
    const secretHeader = request.headers.get('x-admin-secret') || '';
    const providedSecret = authHeader.replace(/^Bearer\s+/i, '').trim() || secretHeader.trim();

    let isAuthorized = false;

    if (adminSecret && providedSecret === adminSecret) {
      isAuthorized = true;
    } else {
      // Check authenticated session user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role;
        if (role === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authorization required to seed database.' },
        { status: 403 }
      );
    }

    // Check if books are already seeded to prevent duplication
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('id, title');

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Could not connect to database table "books". Make sure public.books table exists in your Supabase database.',
        error: fetchError.message
      }, { status: 500 });
    }

    const defaultBooks = CLASSIC_BOOKS.map(b => ({
      title: b.title,
      author: b.author,
      cover_url: b.cover_url,
      file_url: b.file_url,
      is_premium: b.is_premium,
      language: b.language || 'en'
    }));

    // Filter out books that already exist by checking title matching
    const booksToInsert = defaultBooks.filter(dbBook => 
      !existingBooks?.some(eb => eb.title.toLowerCase() === dbBook.title.toLowerCase())
    );

    if (booksToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Database is already seeded with standard starter books!',
        total_books: existingBooks.length
      });
    }

    let insertError: any = null;
    let inserted: any = null;

    try {
      const res = await supabase
        .from('books')
        .insert(booksToInsert)
        .select();
      inserted = res.data;
      insertError = res.error;
      
      if (insertError && insertError.message?.includes('column "language" of relation "books" does not exist')) {
        console.warn('Language column does not exist on Supabase, retrying insert without language field...');
        const cleanBooks = booksToInsert.map(({ language, ...rest }) => rest);
        const retry = await supabase
          .from('books')
          .insert(cleanBooks)
          .select();
        inserted = retry.data;
        insertError = retry.error;
      }
    } catch (e: any) {
      insertError = e;
    }

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to insert starter books into books table.',
        error: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with ${booksToInsert.length} new starter books!`,
      inserted_books: inserted
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Unknown error occurred while seeding database.',
      error: error.message 
    }, { status: 500 });
  }
}
