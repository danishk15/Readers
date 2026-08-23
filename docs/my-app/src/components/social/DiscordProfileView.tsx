'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DiscordUserProfile, 
  UserPresenceStatus, 
  BannerTheme,
  FREE_BANNER_THEMES,
  GLASS_BANNER_THEMES,
  ALL_BANNER_THEMES
} from '@/types/social';
import { getMyDiscordProfile, saveMyDiscordProfile } from '@/utils/socialStorage';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
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
  Activity,
  Lock,
  Crown,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DiscordProfileViewProps {
  initialUser: any;
  initialProfile: any;
  logs: any[] | null;
}

export function DiscordProfileView({ initialUser, initialProfile, logs }: DiscordProfileViewProps) {
  const [profile, setProfile] = useState<DiscordUserProfile>(() => 
    getMyDiscordProfile(initialUser, initialProfile, logs || [])
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSettingStatus, setIsSettingStatus] = useState(false);
  const [tempStatusText, setTempStatusText] = useState(profile.status_text || '');
  const [tempStatusEmoji, setTempStatusEmoji] = useState(profile.status_emoji || '📖');

  // Banner Customization States
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalReason, setVipModalReason] = useState({
    title: 'Unlock VIP Banner Studio',
    description: 'Upgrade to QuillHawk VIP to unlock ultra-premium frosted glass themes and custom banner uploads.'
  });
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectBannerTheme = async (theme: BannerTheme) => {
    if (theme.isPremium && !profile.premium_status) {
      setVipModalReason({
        title: `VIP Frosted Glass: ${theme.name}`,
        description: `The ${theme.name} theme is reserved for QuillHawk VIP members. Upgrade now to unlock all luminous frosted glass themes and custom artwork!`
      });
      setIsVipModalOpen(true);
      return;
    }

    const updated: DiscordUserProfile = { 
      ...profile, 
      banner_color: theme.value,
      banner_url: null 
    };

    setProfile(updated);
    saveMyDiscordProfile(updated);

    // Sync to Supabase if available
    try {
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ banner_color: theme.value, banner_url: null })
        .eq('id', profile.id);
    } catch {}

    setBannerFeedback(`Applied ${theme.name}!`);
    setTimeout(() => setBannerFeedback(null), 3000);
  };

  const handleBannerUploadClick = () => {
    if (!profile.premium_status) {
      setVipModalReason({
        title: 'Custom Banner Artwork Upload',
        description: 'Uploading your own high-resolution banner photo or digital artwork is an exclusive QuillHawk VIP perk. Upgrade today to customize your banner freely!'
      });
      setIsVipModalOpen(true);
      return;
    }
    bannerFileInputRef.current?.click();
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Banner image must be under 5MB.');
      return;
    }

    setIsUploadingBanner(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${profile.id}/banner-${Date.now()}.${fileExt}`;

      let publicUrl = '';
      try {
        publicUrl = await uploadFile('avatars', filePath, file);
      } catch (uploadErr) {
        // Fallback to base64 Data URL
        const dataUrlPromise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        publicUrl = await dataUrlPromise;
      }

      const updated: DiscordUserProfile = {
        ...profile,
        banner_url: publicUrl
      };

      setProfile(updated);
      saveMyDiscordProfile(updated);

      try {
        await supabase
          .from('users')
          .update({ banner_url: publicUrl })
          .eq('id', profile.id);
      } catch {}

      setBannerFeedback('Custom banner image uploaded successfully!');
      setTimeout(() => setBannerFeedback(null), 3500);
    } catch (err: any) {
      console.error('Failed to upload banner:', err);
      alert(err.message || 'Failed to upload custom banner.');
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomBanner = async () => {
    const defaultColor = FREE_BANNER_THEMES[1].value;
    const updated: DiscordUserProfile = {
      ...profile,
      banner_url: null,
      banner_color: defaultColor
    };

    setProfile(updated);
    saveMyDiscordProfile(updated);

    try {
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ banner_url: null, banner_color: defaultColor })
        .eq('id', profile.id);
    } catch {}

    setBannerFeedback('Custom banner reset to Inkish Blue preset.');
    setTimeout(() => setBannerFeedback(null), 3000);
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

  const currentBannerColor = profile.banner_color || FREE_BANNER_THEMES[1].value;
  const isGlassActive = !profile.banner_url && GLASS_BANNER_THEMES.some(t => t.value === profile.banner_color);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner & Discord Profile Header Card */}
      <div className="rounded-3xl border border-card-border bg-[#070D1F]/90 backdrop-blur-md overflow-hidden shadow-2xl relative">
        {/* Customizable Banner */}
        <div className="relative h-48 md:h-60 w-full overflow-hidden transition-all duration-500">
          {profile.banner_url ? (
            <div className="absolute inset-0 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={profile.banner_url} 
                alt="Profile Banner" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D1F] via-black/25 to-black/10" />
              <div className="absolute inset-0 bg-black/10 backdrop-contrast-105" />
            </div>
          ) : isGlassActive ? (
            <div className={`absolute inset-0 bg-gradient-to-r ${currentBannerColor} border-b border-white/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.25)]`}>
              <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-xl pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#070D1F] to-transparent" />
            </div>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${currentBannerColor}`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#070D1F] to-transparent" />
            </div>
          )}

          {/* Top-Left Banner Type Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {profile.banner_url ? (
              <span className="bg-black/60 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow">
                <ImageIcon className="w-3 h-3 text-indigo-400" /> Custom Banner
              </span>
            ) : isGlassActive ? (
              <span className="bg-white/15 backdrop-blur-md border border-white/30 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> VIP Glass Theme
              </span>
            ) : (
              <span className="bg-black/50 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow">
                <Palette className="w-3 h-3 text-blue-400" /> Free Theme
              </span>
            )}
          </div>

          {/* Top Right Edit Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('banner-customizer-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/15 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-all hover:scale-105"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Change Banner</span>
            </button>

            <Button
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/15 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-all hover:scale-105"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-300" />
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
                { status: 'online', label: 'Online', color: 'bg-emerald-500' },
                { status: 'idle', label: 'Idle', color: 'bg-amber-500' },
                { status: 'dnd', label: 'Do Not Disturb', color: 'bg-rose-500' },
                { status: 'offline', label: 'Invisible', color: 'bg-slate-500' },
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

              {/* Profile Banner Theme Customizer (Free & VIP Glass Studio) */}
              <div id="banner-customizer-section" className="bg-slate-950/50 border border-slate-850 p-6 md:p-7 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      <span>Profile Banner Theme</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Personalize your banner with 3 free classic styles, or unlock premium frosted glass & custom art.
                    </p>
                  </div>
                  {profile.premium_status ? (
                    <span className="self-start sm:self-auto text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow shrink-0">
                      👑 VIP Studio Unlocked
                    </span>
                  ) : (
                    <Link
                      href="/premium"
                      className="self-start sm:self-auto text-[10px] font-black bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow transition-all shrink-0"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Unlock Glass & Custom</span>
                    </Link>
                  )}
                </div>

                {/* Banner Feedback Toast */}
                {bannerFeedback && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{bannerFeedback}</span>
                  </div>
                )}

                {/* Section 1: 3 Free Classic Themes */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <span>Free Classic Themes</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-md border border-emerald-500/20">3 Available</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FREE_BANNER_THEMES.map((theme) => {
                      const isActive = !profile.banner_url && profile.banner_color === theme.value;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleSelectBannerTheme(theme)}
                          className={`group relative h-20 rounded-2xl bg-gradient-to-r ${theme.value} border p-3 flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.02] shadow-md overflow-hidden ${
                            isActive 
                              ? `${theme.border} ring-2 ring-primary shadow-primary/20 shadow-lg scale-[1.02]` 
                              : 'border-slate-800 hover:border-slate-600 opacity-90 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-sm text-slate-300 px-2 py-0.5 rounded border border-white/10">
                              Free
                            </span>
                            {isActive && (
                              <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                              </span>
                            )}
                          </div>
                          <div className="z-10">
                            <span className="text-xs font-black text-white drop-shadow block truncate">{theme.name}</span>
                            <span className="text-[9px] text-slate-300/80 drop-shadow block truncate">{theme.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: 3 Premium Glass Themes (VIP Only) */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>VIP Frosted Glass Themes</span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-md border border-amber-500/30">VIP Only</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {GLASS_BANNER_THEMES.map((theme) => {
                      const isActive = !profile.banner_url && profile.banner_color === theme.value;
                      const isLocked = !profile.premium_status;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleSelectBannerTheme(theme)}
                          className={`group relative h-22 rounded-2xl bg-gradient-to-r ${theme.previewBg} border p-3 flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.02] shadow-lg overflow-hidden backdrop-blur-md ${
                            isActive 
                              ? `${theme.border} ring-2 ring-amber-400 shadow-amber-500/20 shadow-xl scale-[1.02]` 
                              : isLocked
                              ? 'border-slate-800/90 hover:border-amber-500/40'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {/* Frosted glass shine overlay */}
                          <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-sm pointer-events-none" />
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

                          <div className="flex items-center justify-between z-10">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 backdrop-blur-sm text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Glass
                            </span>
                            {isActive ? (
                              <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                              </span>
                            ) : isLocked ? (
                              <span className="bg-black/70 backdrop-blur-sm text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                                <Lock className="w-2.5 h-2.5" /> VIP
                              </span>
                            ) : null}
                          </div>

                          <div className="z-10">
                            <span className="text-xs font-black text-white drop-shadow block truncate flex items-center gap-1">
                              <span>{theme.name}</span>
                            </span>
                            <span className="text-[9px] text-slate-300/80 drop-shadow block truncate">{theme.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Custom Banner Artwork Upload (VIP Only) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-850/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Custom Banner Artwork Upload</span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-md border border-amber-500/30">VIP Only</span>
                    </h4>
                  </div>

                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    onChange={handleBannerFileChange}
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                  />

                  {profile.banner_url ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded-xl overflow-hidden border border-slate-700 shrink-0 relative bg-black shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={profile.banner_url} alt="Custom Banner Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                            <span>Active Custom Banner</span>
                            <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">Active</span>
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">Your uploaded custom background is displayed on your profile header.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button
                          size="sm"
                          type="button"
                          disabled={isUploadingBanner}
                          onClick={handleBannerUploadClick}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                        >
                          {isUploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Change Image</span>
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={handleRemoveCustomBanner}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={handleBannerUploadClick}
                      className={`group flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 rounded-2xl border border-dashed transition-all cursor-pointer ${
                        profile.premium_status 
                          ? 'border-indigo-500/40 hover:border-indigo-500/80 bg-indigo-950/20 hover:bg-indigo-950/30'
                          : 'border-slate-800 hover:border-amber-500/40 bg-slate-900/40 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 text-center sm:text-left">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          profile.premium_status
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 group-hover:scale-110'
                            : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-amber-500/30 group-hover:text-amber-300'
                        } transition-all`}>
                          {isUploadingBanner ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : profile.premium_status ? (
                            <Upload className="w-5 h-5" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-white flex items-center gap-1.5 justify-center sm:justify-start">
                            <span>Upload Custom Banner Image</span>
                            {!profile.premium_status && (
                              <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded uppercase">
                                VIP
                              </span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Supports PNG, JPG, WebP, GIF (up to 5MB). High definition 1200x300 recommended.
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        type="button"
                        disabled={isUploadingBanner}
                        className={`text-xs font-bold px-4 py-2 rounded-xl shrink-0 flex items-center gap-1.5 shadow ${
                          profile.premium_status
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 border border-slate-700 group-hover:border-amber-500/30'
                        }`}
                      >
                        {isUploadingBanner ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : profile.premium_status ? (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                          </>
                        ) : (
                          <>
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Unlock Custom Banner</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
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

      {/* VIP Upgrade Studio Modal */}
      <Modal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        title=""
        className="max-w-md p-0 overflow-hidden border border-amber-500/30 bg-[#070D1F] rounded-3xl shadow-2xl"
      >
        <div className="relative p-6 sm:p-7 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/30 to-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
              👑 QuillHawk VIP Studio
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">{vipModalReason.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {vipModalReason.description}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-300">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              VIP Members Also Enjoy:
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>3 Luminous Frosted Glassmorphism Banner Themes</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Upload Custom Banner Art & Photography (up to 5MB)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Golden VIP Crown insignia on your Profile & Servers</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Unlimited AI Translation & Offline EPUB reading</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsVipModalOpen(false)}
              className="flex-1 border border-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl text-xs font-bold"
            >
              Maybe Later
            </Button>
            <Link href="/premium" className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to VIP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={{
          id: profile.id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url,
          banner_color: profile.banner_color,
          email: profile.email
        }}
        onProfileUpdated={(updated) => {
          const newProfile: DiscordUserProfile = {
            ...profile,
            username: updated.username || profile.username,
            displayName: updated.username || profile.displayName,
            bio: updated.bio,
            avatar_url: updated.avatar_url,
            banner_url: updated.banner_url !== undefined ? updated.banner_url : profile.banner_url,
            banner_color: updated.banner_color !== undefined ? updated.banner_color : profile.banner_color,
          };
          setProfile(newProfile);
          saveMyDiscordProfile(newProfile);
        }}
      />
    </div>
  );
}

