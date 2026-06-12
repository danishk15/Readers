'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Crown, Medal, Award, Sparkles, Clock, CheckCircle2, AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  region: string;
  month: string;
  total_reading_time: number;
  selected_books?: string;
  users?: {
    username: string;
    email: string;
  };
}

interface Profile {
  id: string;
  region?: string;
  premium_status?: boolean;
  username?: string;
  email?: string;
  created_at?: string;
}

interface ReadingLog {
  id: string;
  book_id: string;
  user_id: string;
  time_spent_seconds: number;
  created_at?: string;
}

export default function CompetitionPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  
  const [region, setRegion] = useState('South Asia');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  
  // Phase simulation
  const [simulateActiveWeek, setSimulateActiveWeek] = useState(true);

  const supabase = createClient();
  const currentMonth = '2026-06'; // Target month matches metadata logs

  // 1. Helper to determine if we are in the last week of the month
  const checkIsLastWeek = () => {
    if (simulateActiveWeek) return true;
    const date = new Date();
    const today = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return (lastDay - today) < 7; // Last 7 days
  };

  const isCompetitionWeek = checkIsLastWeek();

  // Load all user profile, library books, and reading logs
  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      // Load Profile
      const { data: currentProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (currentProfile) {
        setProfile(currentProfile);
        if (currentProfile.region) {
          setRegion(currentProfile.region);
        }
      }

      // Load local storage items to merge with initial books
      let localBooks: Book[] = [];
      try {
        const published = JSON.parse(localStorage.getItem('local-published-books') || '[]');
        const added = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
        localBooks = [...published, ...added];
      } catch (err) {}

      // Load DB Books
      const { data: dbBooks } = await supabase.from('books').select('*');
      
      const allBooks = [...localBooks, ...(dbBooks || [])];
      // Filter unique
      const uniqueBooks = allBooks.filter((book, idx, self) => 
        self.findIndex(b => b.title.toLowerCase() === book.title.toLowerCase()) === idx
      );
      setBooks(uniqueBooks);

      // Load Reading Logs
      const { data: logs } = await supabase
        .from('reading_logs')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (logs) {
        setReadingLogs(logs);
      }

      // Load current user's competition entry for this month
      const userRegion = currentProfile?.region || 'South Asia';
      const { data: entries } = await supabase
        .from('competition_entries')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('month', currentMonth);
      
      if (entries && entries.length > 0) {
        setUserEntry(entries[0]);
        try {
          const selected = typeof entries[0].selected_books === 'string' 
            ? JSON.parse(entries[0].selected_books) 
            : entries[0].selected_books || [];
          setSelectedBookIds(selected.map((b: any) => b.id || b));
        } catch {}
      }

      // Load Leaderboard for the region
      await loadLeaderboard(userRegion);

    } catch (error) {
      console.error('Error loading competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (regionName: string) => {
    const { data: leaderList } = await supabase
      .from('competition_entries')
      .select('*')
      .eq('region', regionName)
      .eq('month', currentMonth)
      .order('total_reading_time', { ascending: false });

    if (leaderList) {
      setLeaderboard(leaderList as LeaderboardEntry[]);
    }
  };

  useEffect(() => {
    loadData();
  }, [simulateActiveWeek]);

  // Update user's region
  const handleUpdateRegion = async (selectedRegion: string) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ region: selectedRegion })
      .eq('id', user.id);
    
    if (!error) {
      setRegion(selectedRegion);
      // Reload profile
      const { data: currentProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (currentProfile) setProfile(currentProfile);
      
      // Update leaderboard for new region
      await loadLeaderboard(selectedRegion);
    }
    setLoading(false);
  };

  // Submit books to competition
  const handleSubmitEntry = async () => {
    if (!user || selectedBookIds.length === 0) return;
    setSubmitting(true);
    
    // 1. Calculate score: Sum up minutes read for these books in the current month
    const totalSeconds = readingLogs
      .filter(log => selectedBookIds.includes(log.book_id))
      .reduce((sum, log) => sum + (log.time_spent_seconds || 0), 0);
    
    const minutes = Math.floor(totalSeconds / 60);

    const selectedBooksMeta = books
      .filter(b => selectedBookIds.includes(b.id))
      .map(b => ({ id: b.id, title: b.title, author: b.author }));

    const payload = {
      user_id: user.id,
      region: region,
      month: currentMonth,
      selected_books: JSON.stringify(selectedBooksMeta),
      total_reading_time: minutes
    };

    let response;
    if (userEntry) {
      // Update
      response = await supabase
        .from('competition_entries')
        .update(payload)
        .eq('id', userEntry.id)
        .select();
    } else {
      // Insert
      response = await supabase
        .from('competition_entries')
        .insert(payload)
        .select();
    }

    if (!response.error && response.data && response.data.length > 0) {
      setUserEntry(response.data[0]);
      alert('Congratulations! Your competition entry has been submitted successfully.');
      await loadLeaderboard(region);
    } else {
      alert('Error submitting entry: ' + response.error?.message);
    }
    setSubmitting(false);
  };

  // Claim Subscription
  const handleClaimSubscription = async () => {
    if (!user) return;
    setClaiming(true);
    setClaimMessage('');

    // Call update profile
    const { error } = await supabase
      .from('users')
      .update({ premium_status: true })
      .eq('id', user.id);

    if (!error) {
      setClaimMessage('Success! You claimed a 6-Month Premium VIP subscription! 👑');
      setProfile(prev => prev ? { ...prev, premium_status: true } : null);
    } else {
      setClaimMessage('Failed to claim subscription: ' + error.message);
    }
    setClaiming(false);
  };

  // Book Selection handler
  const handleToggleBook = (bookId: string) => {
    setSelectedBookIds(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      }
      if (prev.length >= 3) {
        alert('You can select a maximum of 3 books to submit!');
        return prev;
      }
      return [...prev, bookId];
    });
  };

  // Determine user's rank
  const getUserRank = () => {
    if (!user) return -1;
    return leaderboard.findIndex(entry => entry.user_id === user.id) + 1;
  };

  const userRank = getUserRank();
  const eligibleForReward = userRank > 0 && userRank <= 3;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
        <p className="text-xs text-slate-500 font-medium">Loading competition workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-warning/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="bg-slate-950/40 border border-slate-900/60 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[30vw] h-[30vw] bg-warning/5 rounded-full blur-[90px] pointer-events-none"></div>
        
        <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Regional Bookworm Showdown</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Monthly Region <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning via-amber-400 to-amber-500">Championship</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Organised automatically in the **last week of every month**. Select your 3 most-read books to submit. If you finish in the **Top 3 of your region**, win a **6-Month Free VIP Premium Subscription**!
          </p>
        </div>

        {/* Phase Info Box */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl z-10 text-center w-full md:w-64 shrink-0 flex flex-col items-center justify-center gap-2">
          {isCompetitionWeek ? (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active Phase</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Submissions open! Ends June 30, 2026.
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Sign-up Phase</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Prepare your books. Competition opens in the last week.
              </p>
            </>
          )}

          {/* Test Simulator button for guest sessions */}
          {user?.email === 'guest@readsphere.com' && (
            <button
              onClick={() => setSimulateActiveWeek(prev => !prev)}
              className="mt-3 px-3 py-1 rounded-lg text-[9px] font-bold border border-slate-850 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            >
              Simulate: {simulateActiveWeek ? 'OFF' : 'ON'}
            </button>
          )}
        </div>
      </div>

      {/* Region Selector Form if profile doesn't have it */}
      <Card className="bg-slate-950/20 border-slate-900/60 shadow-lg">
        <CardHeader className="border-b border-slate-900/60 pb-4">
          <h2 className="text-lg font-bold text-slate-200">Your Competitor Region</h2>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Region</p>
            <p className="text-xl font-extrabold text-white">{region ? `📍 ${region}` : 'Not Specified'}</p>
            <p className="text-xs text-slate-500">You will compete with readers in this geographical region.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={region}
              onChange={(e) => handleUpdateRegion(e.target.value)}
              className="bg-[#161b22] border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-primary cursor-pointer shrink-0"
            >
              <option value="South Asia">South Asia</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Middle East">Middle East</option>
              <option value="South America">South America</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Submissions & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Book selection & submission (lg: col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-950/30 border-slate-900/50 shadow-xl h-full flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-slate-900/60 pb-4">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>Select Your Champion Books</span>
                </h3>
                <p className="text-xs text-slate-500">Choose up to 3 books you have spent the most time reading this month.</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {books.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                    {books.map(book => {
                      const isSelected = selectedBookIds.includes(book.id);
                      
                      // Calculate monthly reading minutes for this specific book
                      const bookLogs = readingLogs.filter(log => log.book_id === book.id);
                      const totalSeconds = bookLogs.reduce((sum, log) => sum + (log.time_spent_seconds || 0), 0);
                      const minutes = Math.floor(totalSeconds / 60);

                      return (
                        <div 
                          key={book.id}
                          onClick={() => isCompetitionWeek && handleToggleBook(book.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center select-none ${
                            isSelected 
                              ? 'border-warning bg-warning/5 shadow-md shadow-warning/5' 
                              : 'border-slate-900 bg-slate-950/20 hover:border-slate-800'
                          } ${!isCompetitionWeek ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className="w-10 h-14 bg-slate-900 rounded overflow-hidden shrink-0 border border-slate-950">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-600 p-0.5 text-center">No Cover</div>
                            )}
                          </div>
                          
                          <div className="text-left flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-slate-200">{book.title}</h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{book.author}</p>
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-indigo-400">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              {minutes} min read
                            </span>
                          </div>

                          {isCompetitionWeek && (
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-warning bg-warning text-black' : 'border-slate-700'}`}>
                              {isSelected && <span className="text-xs font-black">✓</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-600 border border-dashed border-slate-850 rounded-2xl">
                    <p className="text-sm">No books found in bookshelf.</p>
                    <p className="text-xs mt-1">Start reading books to populate your library!</p>
                  </div>
                )}

                {/* score display */}
                {selectedBookIds.length > 0 && (
                  <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center justify-between mt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Score:</span>
                    <span className="text-lg font-black text-warning font-mono flex items-center gap-1">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                      {(() => {
                        const totalSeconds = readingLogs
                          .filter(log => selectedBookIds.includes(log.book_id))
                          .reduce((sum, log) => sum + (log.time_spent_seconds || 0), 0);
                        return Math.floor(totalSeconds / 60);
                      })()}{' '}
                      minutes
                    </span>
                  </div>
                )}
              </CardContent>
            </div>
            
            <div className="p-6 border-t border-slate-900/60 mt-auto bg-slate-950/20">
              <Button
                onClick={handleSubmitEntry}
                disabled={submitting || selectedBookIds.length === 0 || !isCompetitionWeek}
                className="w-full bg-gradient-to-r from-warning to-amber-500 text-slate-950 font-black py-4.5 shadow-lg shadow-warning/10 transition-all transform hover:scale-[1.01] active:scale-99 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? 'Submitting Entry...' : (userEntry ? '🔄 Update Competition Entry' : '🏆 Submit Entry to Region Leaderboard')}
              </Button>
              {!isCompetitionWeek && (
                <p className="text-[10px] text-slate-500 mt-2.5 text-center leading-normal">
                  ⚠️ Submissions are locked. Sign-up phase is currently active.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Leaderboard (lg: col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-950/30 border-slate-900/50 shadow-xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-900/60 pb-4">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                <span>Region Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-500">Live rankings for {region || 'South Asia'} (June 2026).</p>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
              <div className="space-y-3.5">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = entry.user_id === user?.id;
                    let badge = null;
                    if (rank === 1) badge = <Crown className="w-4 h-4 text-warning" />;
                    else if (rank === 2) badge = <Medal className="w-4 h-4 text-slate-300" />;
                    else if (rank === 3) badge = <Medal className="w-4 h-4 text-amber-600" />;

                    return (
                      <div 
                        key={entry.id}
                        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3.5 border transition-all ${
                          isCurrentUser 
                            ? 'border-primary bg-primary/10 shadow shadow-primary/5' 
                            : 'border-slate-900/60 bg-slate-950/15'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Rank badge */}
                          <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center font-bold text-xs ${
                            rank === 1 ? 'bg-warning/20 text-warning border border-warning/30' :
                            rank === 2 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                            rank === 3 ? 'bg-amber-600/15 text-amber-600 border border-amber-600/20' :
                            'bg-slate-950 text-slate-500 border border-slate-900'
                          }`}>
                            {rank}
                          </div>
                          
                          <div className="text-left min-w-0">
                            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5 truncate">
                              {entry.users?.username || entry.users?.email?.split('@')[0] || 'Guest Competitor'}
                              {badge}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                              Submitted: {entry.selected_books ? JSON.parse(entry.selected_books as any).length : 0} books
                            </span>
                          </div>
                        </div>

                        <span className="font-extrabold text-xs text-slate-200 font-mono shrink-0">
                          {entry.total_reading_time}m
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-650 border border-dashed border-slate-900 rounded-2xl">
                    <p className="text-sm">No entries submitted yet.</p>
                    <p className="text-xs mt-1">Be the first to submit from {region}!</p>
                  </div>
                )}
              </div>

              {/* Reward Claim Board */}
              {userEntry && (
                <div className="pt-6 border-t border-slate-900/60">
                  {profile?.premium_status ? (
                    <div className="p-4 bg-success/15 border border-success/35 rounded-2xl text-success font-bold text-center flex items-center justify-center gap-2 shadow-inner text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-5 h-5 text-success" />
                      <span>👑 Premium VIP Active</span>
                    </div>
                  ) : eligibleForReward ? (
                    <div className="space-y-3">
                      <div className="p-3.5 bg-warning/10 border border-warning/25 rounded-2xl text-warning font-semibold text-center text-xs flex items-center justify-center gap-2">
                        <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                        <span>Rank #{userRank}! Unlocked 6-Month Premium VIP Reward!</span>
                      </div>
                      <Button
                        onClick={handleClaimSubscription}
                        disabled={claiming}
                        className="w-full bg-gradient-to-r from-warning to-amber-500 hover:from-warning/95 hover:to-amber-500/95 text-slate-950 font-black py-4 rounded-xl text-xs transition transform hover:scale-[1.01] active:scale-99 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      >
                        {claiming ? 'Claiming Subscription...' : '🎁 Claim Free Half-Yearly VIP!'}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-400 font-semibold text-center text-xs leading-normal">
                      🛡️ Rank #{userRank > 0 ? userRank : 'N/A'}. Stand in the **Top 3** to claim the half-yearly subscription prize!
                    </div>
                  )}

                  {claimMessage && (
                    <div className="p-3.5 mt-3 text-center bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold animate-pulse">
                      {claimMessage}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
