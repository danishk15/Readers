'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { Award, BookOpen, Edit3, ShieldCheck, Sparkles, Star, Clock, Laptop, Shield } from 'lucide-react';
import { getLoginHistory } from '@/utils/supabase/client';

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  email?: string;
  premium_status?: boolean;
}

interface ProfileClientProps {
  initialProfile: Profile | null;
  initialUser: any;
  logs: any[] | null;
}

export default function ProfileClient({ initialProfile, initialUser, logs }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const history = getLoginHistory();
      setLoginHistory(history);
    } catch {}
  }, []);

  // Milestone Engine Logic
  const totalSeconds = logs?.reduce((acc, log) => acc + (log.time_spent_seconds || 0), 0) || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalPages = logs?.reduce((acc, log) => acc + (log.pages_read || 0), 0) || 0;
  
  // Calculate level based on minutes read (10 mins = 1 level)
  const level = Math.floor(totalMinutes / 10) + 1;
  const xp = totalMinutes % 10;
  const xpProgress = (xp / 10) * 100;

  const badges = [];
  if (totalMinutes >= 60) badges.push({ name: 'Bookworm', icon: '🐛', color: 'bg-green-500/20 text-green-400 border-green-500/30' });
  if (totalPages >= 100) badges.push({ name: 'Speed Reader', icon: '⚡', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' });
  if (profile?.premium_status) badges.push({ name: 'Premium', icon: '👑', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' });
  if (profile?.bio && profile.bio.trim().length > 0) badges.push({ name: 'Storyteller', icon: '✍️', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' });

  // Predefined premium avatar backgrounds if they select an emoji preset
  const getAvatarStyle = (emoji: string) => {
    switch (emoji) {
      case '🪶': return 'bg-blue-600/25 text-blue-300 border-blue-400/40';
      case '🦅': return 'bg-slate-500/25 text-slate-200 border-slate-400/40';
      case '📚': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case '🌌': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '🕵️': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case '🧙': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case '💻': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case '🐉': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-gradient-to-tr from-primary to-secondary text-white';
    }
  };

  const isPresetAvatar = profile?.avatar_url && ['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(profile.avatar_url);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card/40 backdrop-blur-md p-6 md:p-8 shadow-xl">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Container */}
          <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-5xl shrink-0 shadow-lg select-none overflow-hidden ${
            profile?.avatar_url ? getAvatarStyle(profile.avatar_url) : 'bg-gradient-to-tr from-primary to-secondary text-white border-slate-700/60'
          }`}>
            {profile?.avatar_url ? (
              isPresetAvatar ? (
                <span>{profile.avatar_url}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              )
            ) : (
              <span className="font-bold text-3xl">
                {profile?.username?.charAt(0).toUpperCase() || initialUser?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* User Details & Bio */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {profile?.username || 'QuillHawk Reader'}
              </h1>
              <div className="flex justify-center md:justify-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                  Level {level}
                </span>
                {profile?.premium_status && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-warning/20 border border-warning/30 text-warning rounded-md flex items-center gap-0.5">
                    👑 VIP Soaring Pass
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-400 font-medium">{initialUser?.email}</p>
            
            {/* Bio Display */}
            <div className="pt-2">
              {profile?.bio ? (
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-primary/30 pl-3 py-0.5 max-w-2xl">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">No bio written yet. Click edit profile to add one!</p>
              )}
            </div>
          </div>

          {/* Edit Profile Action Trigger */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white transition-all shadow-md duration-300 hover:border-slate-700 self-center md:self-start shrink-0 group cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
            <span>Customize Profile</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/30 backdrop-blur-sm border-card-border overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reading Time</span>
              <BookOpen className="w-4.5 h-4.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-100">
              {totalMinutes} <span className="text-base text-slate-500 font-normal">mins</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-sm border-card-border overflow-hidden group hover:border-secondary/20 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pages Read</span>
              <Star className="w-4.5 h-4.5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-100">
              {totalPages} <span className="text-base text-slate-500 font-normal">pages</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-sm border-card-border overflow-hidden group hover:border-warning/20 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current XP</span>
              <Sparkles className="w-4.5 h-4.5 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">{xp} XP</span>
              <span className="text-slate-500">{10 - xp} XP to next level</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges & Milestones Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          <span>Badges & Milestones</span>
        </h2>
        <div className="flex flex-wrap gap-4">
          {badges.length > 0 ? (
            badges.map(badge => (
              <div 
                key={badge.name} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] shadow-sm ${badge.color}`}
              >
                <span className="text-2xl select-none">{badge.icon}</span>
                <span className="font-bold text-xs uppercase tracking-wider">{badge.name}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl p-10 text-center w-full bg-slate-950/20 backdrop-blur-sm">
              Read books and customized your profile to earn special badges!
            </p>
          )}
        </div>
      </div>

      {/* Account Security & Login Activity History */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <h2 className="text-xl font-bold tracking-tight text-slate-200 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Login Records & Active Session</span>
        </h2>
        
        <div className="rounded-2xl border border-card-border bg-card/30 backdrop-blur-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Device Session</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Signed in as: <strong className="text-slate-200">{initialUser?.email}</strong>
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Recent Login Records</span>
            {loginHistory.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {loginHistory.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{rec.username || rec.email}</p>
                        <p className="text-[10px] text-slate-500">{rec.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(rec.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Current login recorded just now.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        onProfileUpdated={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />
    </div>
  );
}
