import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency, planName } = await req.json();

    const orderOptions = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: (currency as string) || 'INR',
      receipt: `receipt_${Date.now()}_${user.id.substring(0, 5)}`,
      notes: {
        userId: user.id,
        planName: planName || 'Premium Upgrade'
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json(order);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
