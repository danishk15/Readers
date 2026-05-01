import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Payment is verified. Update user premium_status in Supabase.
    if (userId) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        .update({ premium_status: true })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update premium status:', error);
        return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
