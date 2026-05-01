'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/client';

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Create order on backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999, currency: 'INR' }) // ₹999 Premium Tier
      });
      const order = await res.json();

      if (order.error) throw new Error(order.error);

      // 2. Open Razorpay Checkout
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key_id',
        amount: order.amount,
        currency: order.currency,
        name: 'ReadSphere Premium',
        description: 'Unlock exclusive books and offline downloads.',
        order_id: order.id,
        handler: async function (response: any) {
          // Send verification to webhook/backend
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setMessage('Payment successful! You are now Premium.');
          } else {
            setMessage('Payment verification failed.');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#5B6CFF' // primary color
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setMessage(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Upgrade to Premium</h1>
          <p className="text-xl text-muted">Unlock the full power of ReadSphere and read without limits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <Card className="opacity-80">
            <CardHeader className="text-center pb-2">
              <h2 className="text-2xl font-bold">Reader</h2>
              <p className="text-muted mt-1">Free</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ Access to public domain books</li>
                <li className="flex items-center gap-2">✓ Join community servers</li>
                <li className="flex items-center gap-2">✓ Track reading milestones</li>
                <li className="flex items-center gap-2 text-muted">✗ No offline downloads</li>
                <li className="flex items-center gap-2 text-muted">✗ No premium exclusives</li>
              </ul>
              <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="border-warning shadow-lg relative overflow-hidden group hover:shadow-warning/20 transition-all">
            <div className="absolute top-0 right-0 bg-warning text-black text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
            <CardHeader className="text-center pb-2">
              <h2 className="text-2xl font-bold text-warning">Premium</h2>
              <p className="text-muted mt-1">₹999 / year</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ul className="space-y-4 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ All Free features</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ Offline DRM downloads</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ Access exclusive books</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ Premium Profile Badge</li>
                <li className="flex items-center gap-2">✓ Support the creators</li>
              </ul>
              <Button 
                className="w-full bg-warning text-black hover:bg-warning/80 font-bold" 
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {message && (
          <div className={`p-4 text-center rounded-xl max-w-lg mx-auto font-medium ${message.includes('success') ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}
