import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limiting
  const clientIp = getClientIp(req);
  const limiter = rateLimit(`razorpay-verify:${clientIp}`, { windowMs: 60 * 1000, maxRequests: 10 });
  if (!limiter.success) {
    return NextResponse.json({ success: false, error: 'Too many verification attempts.' }, { status: 429 });
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret === 'dummy_key_secret') {
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error.' },
        { status: 500 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification parameters.' }, { status: 400 });
    }

    // Compute expected HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedDigest = hmac.digest('hex');

    // Constant-time timing-safe comparison to prevent timing attack side-channels
    const digestBuffer = Buffer.from(expectedDigest, 'utf-8');
    const signatureBuffer = Buffer.from(String(razorpay_signature), 'utf-8');

    if (digestBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature.' }, { status: 400 });
    }

    // Authenticate current session user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'User must be authenticated to confirm payment.' }, { status: 401 });
    }

    const userId = user.id;

    if (planName === '500 Reading Minutes' || planName === 'Reading Quest') {
      // Find or link a book to get a valid book_id for reading logs
      const { data: books } = await supabase.from('books').select('id').limit(1);
      let bookId = null;
      if (books && books.length > 0) {
        bookId = books[0].id;
      } else {
        const { data: newBook } = await supabase.from('books').insert({
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages',
          cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg',
        }).select('id').single();
        if (newBook) bookId = newBook.id;
      }

      if (bookId) {
        const { error: logError } = await supabase
          .from('reading_logs')
          .insert({
            user_id: userId,
            book_id: bookId,
            time_spent_seconds: 30000, // 500 minutes
            pages_read: 150,
          });

        if (logError) {
          console.error('Failed to insert reading log:', logError);
          return NextResponse.json({ success: false, error: 'Failed to insert reading logs.' }, { status: 500 });
        }
      }
    } else {
      // Upgrade user premium_status securely in database
      const { error } = await supabase
        .from('users')
        .update({ premium_status: true })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update premium status:', error);
        return NextResponse.json({ success: false, error: 'Database update failed.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during verification';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
