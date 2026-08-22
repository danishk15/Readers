'use client';

import React, { useState, useEffect } from 'react';
import { DiscordUserProfile, UserPresenceStatus } from '@/types/social';
import { getMyDiscordProfile, saveMyDiscordProfile } from '@/utils/socialStorage';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { 
  Award, 
  BookOpen, 
  Edit3, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Clock, 
  Copy, 
  Check, 
  Calendar,
  Smile,
  Palette,
  Flame,
  Zap,
  BookMarked,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DiscordProfileViewProps {
  initialUser: any;
  initialProfile: any;
  logs: any[] | null;
}

const BANNER_THEMES = [
  { name: 'Inkish Blue (Default)', value: 'from-blue-900 via-indigo-950 to-slate-900', border: 'border-blue-500/40' },
  { name: 'Metallic Silver', value: 'from-slate-700 via-slate-850 to-slate-950', border: 'border-slate-400/40' },
  { name: 'Midnight Nebula', value: 'from-purple-900 via-indigo-950 to-slate-950', border: 'border-purple-500/40' },
  { name: 'Emerald Dusk', value: 'from-emerald-900 via-teal-950 to-slate-950', border: 'border-emerald-500/40' },
  { name: 'Velvet Amber', value: 'from-amber-900 via-yellow-950 to-slate-950', border: 'border-amber-500/40' },
  { name: 'Crimson Dragon', value: 'from-rose-900 via-red-950 to-slate-950', border: 'border-rose-500/40' }
];

export function DiscordProfileView({ initialUser, initialProfile, logs }: DiscordProfileViewProps) {
  const [profile, setProfile] = useState<DiscordUserProfile>(() => 
    getMyDiscordProfile(initialUser, initialProfile, logs || [])
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSettingStatus, setIsSettingStatus] = useState(false);
  const [tempStatusText, setTempStatusText] = useState(profile.status_text || '');
  const [tempStatusEmoji, setTempStatusEmoji] = useState(profile.status_emoji || '📖');

  // Stats calculation
  const totalSeconds = logs?.reduce((acc, log) => acc + (log.time_spent_seconds || 0), 0) || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalPages = logs?.reduce((acc, log) => acc + (log.pages_read || 0), 0) || 0;

  useEffect(() => {
    const handleProfileUpdate = (e: CustomEvent<DiscordUserProfile>) => {
      if (e.detail) setProfile(e.detail);
    };
    window.addEventListener('quillhawk:profile_updated' as any, handleProfileUpdate);
    return () => window.removeEventListener('quillhawk:profile_updated' as any, handleProfileUpdate);
  }, []);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${profile.username}#${profile.discriminator}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresenceChange = (newPresence: UserPresenceStatus) => {
    const updated = { ...profile, presence: newPresence };
    setProfile(updated);
    saveMyDiscordProfile(updated);
  };

  const handleBannerChange = (newBanner: string) => {
    const updated = { ...profile, banner_color: newBanner };
    setProfile(updated);
    saveMyDiscordProfile(updated);
  };

  const handleSaveCustomStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { 
      ...profile, 
      status_text: tempStatusText, 
      status_emoji: tempStatusEmoji 
    };
    setProfile(updated);
    saveMyDiscordProfile(updated);
    setIsSettingStatus(false);
  };

  const getPresenceColor = (presence: UserPresenceStatus) => {
    switch (presence) {
      case 'online': return 'bg-emerald-500 ring-emerald-500/30';
      case 'idle': return 'bg-amber-500 ring-amber-500/30';
      case 'dnd': return 'bg-rose-500 ring-rose-500/30';
      default: return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const bannerBg = profile.banner_color || 'from-blue-900 via-indigo-950 to-slate-900';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner & Discord Profile Header Card */}
      <div className="rounded-3xl border border-card-border bg-[#070D1F]/90 backdrop-blur-md overflow-hidden shadow-2xl relative">
        {/* Customizable Banner */}
        <div className={`h-48 md:h-56 w-full bg-gradient-to-r ${bannerBg} relative overflow-hidden transition-all duration-500`}>
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Top Right Edit Banner Quick Action */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/10 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>

        {/* Profile Card Main Body */}
        <div className="px-6 md:px-10 pb-8 relative">
          {/* Avatar and Presence Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              {/* Avatar with Discord Presence Pip */}
              <div className="relative group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#070D1F] bg-slate-900 flex items-center justify-center text-5xl md:text-6xl shadow-2xl overflow-hidden select-none">
                  {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(profile.avatar_url || '') ? (
                    <span>{profile.avatar_url}</span>
                  ) : profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-white text-4xl">{profile.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Status Dot */}
                <div 
                  className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#070D1F] ring-4 ${getPresenceColor(profile.presence)}`}
                  title={`Status: ${profile.presence}`}
                />
              </div>

              {/* Names & Tag */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{profile.displayName}</h1>
                  {profile.premium_status && (
                    <span className="text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
                      👑 VIP Member
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-blue-950/60 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-md">
                    Level {profile.level}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-mono text-xs">
                  <span>@{profile.username}#{profile.discriminator}</span>
                  <button 
                    onClick={handleCopyTag}
                    className="p-1 hover:text-white rounded hover:bg-slate-800/60 transition-colors"
                    title="Copy Tag"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {copied && <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">Copied!</span>}
                </div>
              </div>
            </div>

            {/* Quick Presence Status Selector (Discord-Style) */}
            <div className="flex items-center justify-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              {[
                { status: 'online', label: 'Online', color: 'bg-emerald-500', emoji: '🟢' },
                { status: 'idle', label: 'Idle', color: 'bg-amber-500', emoji: '🟡' },
                { status: 'dnd', label: 'Do Not Disturb', color: 'bg-rose-500', emoji: '🔴' },
                { status: 'offline', label: 'Invisible', color: 'bg-slate-500', emoji: '⚫' },
              ].map((item) => (
                <button
                  key={item.status}
                  onClick={() => handlePresenceChange(item.status as UserPresenceStatus)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    profile.presence === item.status 
                      ? 'bg-slate-800 text-white shadow border border-slate-700' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Status Display & Quick Editor */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            {isSettingStatus ? (
              <form onSubmit={handleSaveCustomStatus} className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 animate-fade-in">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                  <span className="text-base">{tempStatusEmoji}</span>
                  <select
                    value={tempStatusEmoji}
                    onChange={(e) => setTempStatusEmoji(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {['📖', '✨', '☕', '🚀', '🔍', '🧙', '🐉', '🎧', '⚡', '🌙'].map(em => (
                      <option key={em} value={em} className="bg-slate-900 text-slate-200">{em}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="What's your current literary vibe? (e.g. Reading Chapter 5)"
                  value={tempStatusText}
                  onChange={(e) => setTempStatusText(e.target.value)}
                  className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary font-medium"
                />
                <Button size="sm" type="submit" className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-xl">
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsSettingStatus(false)} className="text-xs text-slate-400">
                  Cancel
                </Button>
              </form>
            ) : (
              <div 
                onClick={() => {
                  setTempStatusText(profile.status_text || '');
                  setTempStatusEmoji(profile.status_emoji || '📖');
                  setIsSettingStatus(true);
                }}
                className="group flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 px-4 py-3 rounded-2xl cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{profile.status_emoji || '✨'}</span>
                  <span className="text-sm font-medium text-slate-200">
                    {profile.status_text || 'Set a custom status...'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary transition-colors flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" />
                  <span>Edit Status</span>
                </span>
              </div>
            )}
          </div>

          {/* Grid Layout: Left Details / Right Activity & Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Left Column: About Me & Member Info */}
            <div className="space-y-6 md:col-span-2">
              {/* About Me Box */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>About Me</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-primary/30 pl-3.5 py-0.5">
                  &ldquo;{profile.bio || 'Avid reader and explorer in the QuillHawk digital universe.'}&rdquo;
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono pt-3 border-t border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Member Since {profile.member_since}</span>
                  </span>
                  <span>•</span>
                  <span>{initialUser?.email}</span>
                </div>
              </div>

              {/* Discord Banner Customizer */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Profile Banner Theme</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {BANNER_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handleBannerChange(theme.value)}
                      className={`h-16 rounded-xl bg-gradient-to-r ${theme.value} border p-2.5 flex flex-col justify-end text-left transition-all hover:scale-105 shadow ${
                        profile.banner_color === theme.value 
                          ? `${theme.border} ring-2 ring-primary shadow-lg` 
                          : 'border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-black text-white drop-shadow truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges Collection */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Badges & Accomplishments</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.badges.map((badge) => (
                    <div key={badge.id} className={`p-3 rounded-xl border flex items-center gap-3 ${badge.color}`}>
                      <span className="text-2xl select-none">{badge.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{badge.name}</h4>
                        <p className="text-[10px] opacity-80 truncate">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Currently Reading Activity & Reading Stats */}
            <div className="space-y-6">
              {/* Rich Presence: Currently Reading */}
              {profile.currently_reading && (
                <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/20 border border-blue-500/25 p-5 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      <span>Reading Activity</span>
                    </h3>
                    <span className="text-[9px] font-black text-blue-300 uppercase px-2 py-0.5 bg-blue-900/40 rounded-full border border-blue-500/30">
                      Live
                    </span>
                  </div>

                  <div className="flex gap-3 items-center pt-1">
                    {profile.currently_reading.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={profile.currently_reading.coverUrl} 
                        alt={profile.currently_reading.title} 
                        className="w-14 h-20 object-cover rounded shadow-md border border-slate-800 shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-20 bg-slate-900 rounded flex items-center justify-center text-slate-600 shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{profile.currently_reading.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{profile.currently_reading.author}</p>
                      <p className="text-[10px] text-blue-300 font-mono truncate mt-0.5">{profile.currently_reading.currentChapter}</p>
                      
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${profile.currently_reading.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                        {profile.currently_reading.progressPercent}% completed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reader Level & XP Progress Card */}
              <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Level Progress</h3>
                  <span className="text-xs font-black text-primary font-mono">Level {profile.level}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>XP {profile.xp * 100} / 1000</span>
                    <span>{profile.xp * 10}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profile.xp * 10}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-base font-black text-white font-mono">{totalMinutes}m</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Total Reading</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                    <BookMarked className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-base font-black text-white font-mono">{totalPages}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Pages Read</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={{
          id: profile.id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          email: profile.email
        }}
        onProfileUpdated={(updated) => {
          const newProfile: DiscordUserProfile = {
            ...profile,
            username: updated.username || profile.username,
            displayName: updated.username || profile.displayName,
            bio: updated.bio,
            avatar_url: updated.avatar_url
          };
          setProfile(newProfile);
          saveMyDiscordProfile(newProfile);
        }}
      />
    </div>
  );
}
