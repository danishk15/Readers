'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/client';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    description: string;
  };
}

interface RazorpayInstance {
  on(event: string, callback: (response: RazorpayErrorResponse) => void): void;
  open(): void;
}

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpgrade = async (amount: number, planName: string) => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Create order on backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' })
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
        name: `ReadSphere Premium - ${planName}`,
        description: 'Unlock exclusive books and offline downloads.',
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
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

      const windowWithRazorpay = window as unknown as { Razorpay: new (opts: typeof options) => RazorpayInstance };
      const rzp = new windowWithRazorpay.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
        setMessage(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred during upgrade.');
      }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Weekly Tier */}
          <Card className="border-gray-700 shadow-lg relative overflow-hidden group">
            <CardHeader className="text-center pb-2">
              <h2 className="text-xl font-bold">Weekly</h2>
              <p className="text-muted mt-1">₹49 / week</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ All Free features</li>
                <li className="flex items-center gap-2 text-primary">✓ 7 Days Offline DRM</li>
                <li className="flex items-center gap-2 text-primary">✓ Read exclusive books</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-4" 
                onClick={() => handleUpgrade(49, 'Weekly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Weekly'}
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Tier */}
          <Card className="border-gray-700 shadow-lg relative overflow-hidden group">
            <CardHeader className="text-center pb-2">
              <h2 className="text-xl font-bold">Monthly</h2>
              <p className="text-muted mt-1">₹149 / month</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ All Free features</li>
                <li className="flex items-center gap-2 text-primary">✓ 30 Days Offline DRM</li>
                <li className="flex items-center gap-2 text-primary">✓ Read exclusive books</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-4" 
                onClick={() => handleUpgrade(149, 'Monthly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Monthly'}
              </Button>
            </CardContent>
          </Card>

          {/* Quarterly Tier */}
          <Card className="border-gray-700 shadow-lg relative overflow-hidden group">
            <CardHeader className="text-center pb-2">
              <h2 className="text-xl font-bold">Quarterly</h2>
              <p className="text-muted mt-1">₹399 / quarter</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ All Free features</li>
                <li className="flex items-center gap-2 text-primary">✓ 90 Days Offline DRM</li>
                <li className="flex items-center gap-2 text-primary">✓ Read exclusive books</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-4" 
                onClick={() => handleUpgrade(399, 'Quarterly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Quarterly'}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Yearly Tier */}
          <Card className="border-warning shadow-lg relative overflow-hidden group hover:shadow-warning/20 transition-all transform scale-105 z-10">
            <div className="absolute top-0 right-0 bg-warning text-black text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
            <CardHeader className="text-center pb-2">
              <h2 className="text-2xl font-bold text-warning">Yearly Premium</h2>
              <p className="text-muted mt-1">₹999 / year</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2">✓ All Free features</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ Full Offline DRM</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ All exclusive books</li>
                <li className="flex items-center gap-2 font-medium text-warning">✓ Premium Badge</li>
                <li className="flex items-center gap-2">✓ Support creators</li>
              </ul>
              <Button 
                className="w-full bg-warning text-black hover:bg-warning/80 font-bold mt-4" 
                onClick={() => handleUpgrade(999, 'Yearly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-3 text-foreground">Earn Weekly Premium for Free!</h2>
          <p className="text-muted mb-6 max-w-2xl">
            Don&apos;t want to pay? No problem. Be an active reader in our community to earn your premium perks! Complete tasks like reading maximum books, engaging in comments, and interacting with the community. Hit the milestones and automatically unlock 1 week of Premium for free!
          </p>
          <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>Start Reading Now</Button>
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
