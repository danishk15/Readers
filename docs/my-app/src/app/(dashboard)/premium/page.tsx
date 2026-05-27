'use client';

import { useState, useEffect } from 'react';
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
  
  // Weekly Quest States (Quest: 500 minutes)
  const [weeklyMinutes, setWeeklyMinutes] = useState(25);
  const [isPremium, setIsPremium] = useState(false);
  const [claiming, setClaiming] = useState(false);
  
  // Fetch reading progression stats
  useEffect(() => {
    const loadStats = async () => {
      const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');
      
      // Load current premium status
      if (isDemo) {
        setIsPremium(true);
      } else {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('users').select('premium_status').eq('id', user.id).single();
            if (profile?.premium_status) {
              setIsPremium(true);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Compute total minutes read
      let totalSeconds = 0;
      if (isDemo) {
        try {
          const localLogs = JSON.parse(localStorage.getItem('demo-reading_logs') || '[]');
          totalSeconds = localLogs.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0);
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: logs } = await supabase.from('reading_logs').select('time_spent_seconds').eq('user_id', user.id);
            if (logs) {
              totalSeconds = logs.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      const minutes = Math.floor(totalSeconds / 60) + 25; // add 25 simulated base minutes
      setWeeklyMinutes(minutes);
    };

    loadStats();
  }, []);

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

        {/* 500-Minute Weekly Premium Quest Dashboard */}
        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-slate-900 to-amber-500/10 border border-warning/30 flex flex-col items-center text-center space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-warning via-yellow-400 to-warning"></div>
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-warning text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
              ✨ Epic Reading Milestone Quest
            </span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-2">
              The 500-Minute Weekly VIP Quest
            </h2>
            <p className="text-muted text-sm max-w-2xl mx-auto">
              Want premium access without paying? You can earn **1 Week of Free Premium VIP** automatically by reading **500 minutes** every week! Log your time reading any book in your library to power up your progression.
            </p>
          </div>

          {/* Progress Visualization */}
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-indigo-400">Weekly Progress</span>
              <span className="text-warning font-mono text-base">{weeklyMinutes} / 500 minutes</span>
            </div>
            
            <div className="w-full bg-slate-950 h-4 rounded-full p-0.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-warning to-amber-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                style={{ width: `${Math.min((weeklyMinutes / 500) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-muted">
              <span>0 mins</span>
              <span>250 mins (Halfway)</span>
              <span>500 mins (Milestone!)</span>
            </div>
          </div>

          {/* Action buttons based on status */}
          <div className="w-full max-w-sm pt-2">
            {isPremium ? (
              <div className="space-y-3">
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning font-extrabold flex items-center justify-center gap-2 shadow animate-pulse text-sm">
                  <span>👑</span> You currently have ACTIVE Premium VIP Status!
                </div>
                <Button variant="secondary" className="w-full py-4 font-bold" onClick={() => window.location.href = '/dashboard'}>
                  Go Read More Books
                </Button>
              </div>
            ) : weeklyMinutes >= 500 ? (
              <Button 
                onClick={async () => {
                  setClaiming(true);
                  try {
                    // Update user's premium status
                    const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');
                    if (isDemo) {
                      setIsPremium(true);
                    } else {
                      const supabase = createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from('users').update({ premium_status: true }).eq('id', user.id);
                      }
                      setIsPremium(true);
                    }
                    setMessage('Success! You have claimed your Free Weekly Premium! 👑 Enjoy unrestricted offline downloads and exclusive books!');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setClaiming(false);
                  }
                }}
                disabled={claiming}
                className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-black font-extrabold py-5 text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform hover:scale-[1.03] rounded-xl"
              >
                {claiming ? 'Activating VIP...' : '🎁 Claim Free VIP Premium!'}
              </Button>
            ) : (
              <div className="space-y-4">
                <Button 
                  disabled 
                  className="w-full bg-slate-800 text-slate-500 cursor-not-allowed py-5 font-bold rounded-xl"
                >
                  🔒 Locked ({500 - weeklyMinutes} mins remaining)
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-4 shadow shadow-indigo-600/20 rounded-xl"
                >
                  📚 Start Reading to Unlock
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {message && (
          <div className={`p-4 text-center rounded-xl max-w-lg mx-auto font-bold shadow-md ${
            message.includes('Success') ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'
          }`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}
