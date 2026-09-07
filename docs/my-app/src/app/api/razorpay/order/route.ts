import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Server-authoritative plan pricing (in paise: ₹1 = 100 paise)
const AUTHORITATIVE_PLANS: Record<string, { amountInPaise: number; name: string }> = {
  'monthly': { amountInPaise: 14900, name: 'Monthly VIP' },
  'quarterly': { amountInPaise: 39900, name: 'Quarterly VIP' },
  'yearly': { amountInPaise: 99900, name: 'Yearly VIP' },
  'lifetime': { amountInPaise: 499900, name: 'Lifetime VIP' },
  'vip pass - monthly': { amountInPaise: 14900, name: 'Monthly VIP' },
  'vip pass - quarterly': { amountInPaise: 39900, name: 'Quarterly VIP' },
  'vip pass - yearly': { amountInPaise: 99900, name: 'Yearly VIP' },
  'vip pass - lifetime': { amountInPaise: 499900, name: 'Lifetime VIP' },
  '500 reading minutes': { amountInPaise: 9900, name: '500 Reading Minutes Quest' },
  'reading quest': { amountInPaise: 9900, name: '500 Reading Minutes Quest' },
};

export async function POST(req: Request) {
  // Rate limiting to prevent order spam
  const clientIp = getClientIp(req);
  const limiter = rateLimit(`razorpay-order:${clientIp}`, { windowMs: 60 * 1000, maxRequests: 10 });
  if (!limiter.success) {
    return NextResponse.json({ error: 'Too many order requests. Please try again later.' }, { status: 429 });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret') {
      console.warn('Razorpay credentials not configured in environment variables');
      return NextResponse.json(
        { error: 'Payment gateway configuration is not set. Please contact administrator.' },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to purchase a plan.' }, { status: 401 });
    }

    const body = await req.json();
    const rawPlanName = String(body.planName || '').trim().toLowerCase();

    // Look up authoritative price from server-side catalog - NEVER trust client-submitted amount
    const planConfig = AUTHORITATIVE_PLANS[rawPlanName];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const orderOptions = {
      amount: planConfig.amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 6)}`,
      notes: {
        userId: user.id,
        planName: planConfig.name,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error('Razorpay order creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
