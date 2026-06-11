'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, Shield, Clock, Zap, Star, Award, CheckCircle2, ChevronRight } from 'lucide-react';

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
  
  // Load progression stats
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
    
    const minutes = Math.floor(totalSeconds / 60) + 25; // Base offset to avoid showing zero
    setWeeklyMinutes(minutes);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpgrade = async (amount: number, planName: string) => {
    setLoading(true);
    setMessage('');

    const isDemo = typeof document !== 'undefined' && document.cookie.includes('demo-session=true');
    if (isDemo) {
      setTimeout(() => {
        if (planName === '500 Reading Minutes') {
          try {
            const localLogs = JSON.parse(localStorage.getItem('demo-reading_logs') || '[]');
            const mockLogs = Array.from({ length: 1000 }).map((_, i) => ({
              id: 'local-log-simulated-' + i + '-' + Date.now(),
              created_at: new Date().toISOString(),
              user_id: 'demo-guest-id-12345',
              book_id: 'classic-1',
              time_spent_seconds: 30,
              pages_read: 10
            }));
            localStorage.setItem('demo-reading_logs', JSON.stringify([...mockLogs, ...localLogs]));
            setWeeklyMinutes(500);
            setMessage('Success! Simulated 500 minutes of reading in guest cache! Click "Claim Free VIP Premium" below to unlock!');
          } catch (e) {
            console.error(e);
          }
        } else {
          setIsPremium(true);
          setMessage(`Success! [Demo Mode] Upgraded to ${planName} VIP membership! 👑`);
        }
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', planName })
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
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id,
              planName
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            if (planName === '500 Reading Minutes') {
              setMessage('Success! Payment verified. 500 Reading Minutes have been added to your milestone quest! 📚');
              loadStats();
            } else {
              setMessage('Success! Payment verified. You are now a Premium VIP member! 👑');
              setIsPremium(true);
            }
          } else {
            setMessage('Error: Payment verification failed.');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#5B6CFF'
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
      
      <div className="max-w-5xl mx-auto py-12 space-y-12 animate-in fade-in duration-500 relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-warning/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Pricing header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 text-indigo-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ReadSphere VIP Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Upgrade to Premium</h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Unlock exclusive cloud access to best-selling titles, read books on the go, and track metrics.
          </p>
        </div>

        {/* Pricing card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Weekly Tier */}
          <Card className="bg-slate-950/40 backdrop-blur-md border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="text-center pb-4 pt-6">
              <h2 className="text-lg font-bold text-slate-300">Weekly</h2>
              <p className="text-2xl font-black text-white font-mono mt-2">₹49 <span className="text-xs text-slate-500 font-semibold font-sans">/ wk</span></p>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3.5 text-xs text-slate-400">
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Full Bookshelf Catalog</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 7 Days Offline access</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> VIP lounge unlock</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-6 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white py-2 rounded-xl text-xs font-bold" 
                onClick={() => handleUpgrade(49, 'Weekly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Weekly'}
              </Button>
            </CardContent>
          </Card>
 
          {/* Monthly Tier */}
          <Card className="bg-slate-950/40 backdrop-blur-md border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="text-center pb-4 pt-6">
              <h2 className="text-lg font-bold text-slate-300">Monthly</h2>
              <p className="text-2xl font-black text-white font-mono mt-2">₹149 <span className="text-xs text-slate-500 font-semibold font-sans">/ mo</span></p>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3.5 text-xs text-slate-400">
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Full Bookshelf Catalog</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 30 Days Offline access</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> VIP lounge unlock</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-6 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white py-2 rounded-xl text-xs font-bold" 
                onClick={() => handleUpgrade(149, 'Monthly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Monthly'}
              </Button>
            </CardContent>
          </Card>
 
          {/* Quarterly Tier */}
          <Card className="bg-slate-950/40 backdrop-blur-md border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="text-center pb-4 pt-6">
              <h2 className="text-lg font-bold text-slate-300">Quarterly</h2>
              <p className="text-2xl font-black text-white font-mono mt-2">₹399 <span className="text-xs text-slate-500 font-semibold font-sans">/ qtr</span></p>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3.5 text-xs text-slate-400">
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Full Bookshelf Catalog</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 90 Days Offline access</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> VIP lounge unlock</li>
              </ul>
              <Button 
                variant="secondary"
                className="w-full mt-6 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white py-2 rounded-xl text-xs font-bold" 
                onClick={() => handleUpgrade(399, 'Quarterly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Get Quarterly'}
              </Button>
            </CardContent>
          </Card>
 
          {/* Premium Yearly Tier */}
          <Card className="bg-[#0b0c10]/80 border-warning/40 shadow-2xl relative overflow-hidden group hover:shadow-warning/15 hover:border-warning/60 transition-all transform scale-105 z-10 flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-warning to-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-bl-xl tracking-widest uppercase shadow">BEST VALUE</div>
            <CardHeader className="text-center pb-4 pt-8">
              <h2 className="text-xl font-black text-warning">Yearly Premium</h2>
              <p className="text-3xl font-black text-white font-mono mt-2">₹999 <span className="text-xs text-slate-500 font-semibold font-sans">/ yr</span></p>
            </CardHeader>
            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between bg-warning/5">
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-warning shrink-0" /> Full Bookshelf Catalog</li>
                <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-warning shrink-0" /> Full Offline DRM Access</li>
                <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-warning shrink-0" /> VIP lounge unlock</li>
                <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-warning shrink-0" /> Immersive Badge unlock</li>
              </ul>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-warning to-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs shadow-lg shadow-warning/20 transform hover:scale-[1.02] active:scale-95 transition-all" 
                onClick={() => handleUpgrade(999, 'Yearly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade Membership'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 500-Minute Weekly Premium Quest Dashboard */}
        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-3xl bg-gradient-to-tr from-amber-500/15 via-slate-950 to-amber-500/5 border border-warning/20 flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-warning via-amber-400 to-warning"></div>
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-warning text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
              ✨ Epic VIP Reading Milestone
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-2">
              The 500-Minute Weekly VIP Quest
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Want premium access without paying? Earn **1 Week of Free Premium VIP** automatically by reading **500 minutes** every week! Log your time reading any book in your library to power up your progression.
            </p>
          </div>

          {/* Progress Visualization */}
          <div className="w-full max-w-xl bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-inner">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-indigo-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Weekly Progress</span>
              <span className="text-warning font-semibold font-mono text-base">{weeklyMinutes} / 500 minutes</span>
            </div>
            
            <div className="w-full bg-slate-950 h-4 rounded-full p-0.5 overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-warning to-amber-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                style={{ width: `${Math.min((weeklyMinutes / 500) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-bold tracking-wider">
              <span>0m</span>
              <span>250m (Halfway Node)</span>
              <span>500m (Milestone Unlocked!)</span>
            </div>
          </div>

          {/* Action buttons based on status */}
          <div className="w-full max-w-sm pt-2">
            {isPremium ? (
              <div className="space-y-3">
                <div className="p-3 bg-warning/10 border border-warning/35 rounded-xl text-warning font-black flex items-center justify-center gap-2 shadow animate-pulse text-xs uppercase tracking-wider">
                  <span>👑</span> Active Premium VIP Membership Unlocked!
                </div>
                <Button variant="secondary" className="w-full py-3.5 font-bold rounded-xl text-sm border border-slate-850 hover:bg-slate-900" onClick={() => window.location.href = '/dashboard'}>
                  Go Read Books
                </Button>
              </div>
            ) : weeklyMinutes >= 500 ? (
              <Button 
                onClick={async () => {
                  setClaiming(true);
                  try {
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
                    setMessage('Success! You claimed your Free Weekly Premium! 👑 Enjoy unrestricted offline downloads and exclusive books!');
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setClaiming(false);
                  }
                }}
                disabled={claiming}
                className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/90 hover:to-amber-500/90 text-slate-950 font-black py-4.5 text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform hover:scale-[1.02] rounded-xl flex items-center justify-center gap-1.5"
              >
                {claiming ? 'Activating VIP...' : '🎁 Claim Free VIP Premium!'}
              </Button>
            ) : (
              <div className="space-y-4">
                <Button 
                  disabled 
                  className="w-full bg-slate-800 text-slate-500 cursor-not-allowed py-4 font-extrabold rounded-xl border border-slate-850"
                >
                  🔒 Locked ({500 - weeklyMinutes} mins remaining)
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 shadow-md shadow-indigo-900/10 rounded-xl"
                >
                  📚 Start Reading to Unlock
                </Button>
              </div>
            )}
          </div>
        </div>


        
        {message && (
          <div className={`p-4 text-center rounded-xl max-w-lg mx-auto font-bold shadow-md border ${
            message.includes('Success') 
              ? 'bg-success/15 text-success border-success/35 shadow-success/5 animate-pulse' 
              : 'bg-error/15 text-error border-error/35 shadow-error/5'
          }`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}
