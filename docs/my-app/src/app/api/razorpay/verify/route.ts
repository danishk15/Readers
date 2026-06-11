import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planName } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Payment is verified. Handle action based on planName.
    if (userId) {
      const supabase = await createClient();

      if (planName === '500 Reading Minutes') {
        // Find or seed a book to get a valid book_id for reading logs
        const { data: books } = await supabase.from('books').select('id').limit(1);
        let bookId = null;
        if (books && books.length > 0) {
          bookId = books[0].id;
        } else {
          // Fallback to inserting a dummy book if books table is empty
          const { data: newBook } = await supabase.from('books').insert({
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            file_url: 'https://www.gutenberg.org/ebooks/64317.epub.images',
            cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg'
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
              pages_read: 150
            });
          if (logError) {
            console.error('Failed to insert reading log:', logError);
            return NextResponse.json({ success: false, error: 'Failed to insert reading logs' }, { status: 500 });
          }
        } else {
          return NextResponse.json({ success: false, error: 'No book available to link reading log' }, { status: 500 });
        }
      } else {
        // Upgrade user premium_status
        const { error } = await supabase
          .from('users')
          .update({ premium_status: true })
          .eq('id', userId);

        if (error) {
          console.error('Failed to update premium status:', error);
          return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
