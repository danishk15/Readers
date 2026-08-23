'use client';

import React, { useState } from 'react';
import { DiscordUserProfile, UserPresenceStatus } from '@/types/social';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  Copy, 
  Check, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  Award, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface UserProfileModalProps {
  user: DiscordUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDM?: (userId: string) => void;
  onAddFriend?: (userTag: string) => void;
  friendStatus?: 'friend' | 'pending_incoming' | 'pending_outgoing' | 'none' | 'self';
}

export function UserProfileModal({
  user,
  isOpen,
  onClose,
  onStartDM,
  onAddFriend,
  friendStatus = 'none'
}: UserProfileModalProps) {
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyTag = () => {
    const fullTag = `${user.username}#${user.discriminator}`;
    navigator.clipboard.writeText(fullTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPresenceColor = (presence: UserPresenceStatus) => {
    switch (presence) {
      case 'online': return 'bg-emerald-500 ring-emerald-500/30';
      case 'idle': return 'bg-amber-500 ring-amber-500/30';
      case 'dnd': return 'bg-rose-500 ring-rose-500/30';
      default: return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const getPresenceLabel = (presence: UserPresenceStatus) => {
    switch (presence) {
      case 'online': return 'Online';
      case 'idle': return 'Idle / Away';
      case 'dnd': return 'Do Not Disturb';
      default: return 'Offline';
    }
  };

  const bannerBg = user.banner_color || 'from-blue-900 via-indigo-950 to-slate-900';
  const isGlassBanner = user.banner_color?.includes('/80') || user.banner_color?.includes('/75') || user.banner_color?.includes('glass');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-md p-0 overflow-hidden border border-slate-800 bg-[#070D1F] rounded-3xl shadow-2xl">
      <div className="relative">
        {/* Discord Profile Banner */}
        {user.banner_url ? (
          <div className="h-32 w-full relative overflow-hidden bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.banner_url} alt={user.displayName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D1F] via-black/25 to-black/10" />
            
            {/* Top-right Badges Pill */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow">
              {user.badges.slice(0, 3).map((badge) => (
                <span key={badge.id} className="text-sm cursor-help" title={`${badge.name}: ${badge.description}`}>
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={`h-32 w-full bg-gradient-to-r ${bannerBg} relative overflow-hidden border-b border-white/10`}>
            <div className="absolute inset-0 bg-black/20" />
            {isGlassBanner && (
              <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-md pointer-events-none" />
            )}
            <div className="absolute top-[-40%] right-[-20%] w-44 h-44 bg-primary/20 rounded-full blur-2xl" />
            
            {/* Top-right Badges Pill */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow">
              {user.badges.slice(0, 3).map((badge) => (
                <span key={badge.id} className="text-sm cursor-help" title={`${badge.name}: ${badge.description}`}>
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avatar & Presence */}
        <div className="px-6 relative -mt-12 flex justify-between items-end">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#070D1F] bg-slate-900 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
              {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(user.avatar_url || '') ? (
                <span>{user.avatar_url}</span>
              ) : user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-white text-3xl">{user.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {/* Status indicator ring */}
            <div 
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#070D1F] ring-4 ${getPresenceColor(user.presence)}`}
              title={getPresenceLabel(user.presence)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-1">
            {friendStatus !== 'self' && (
              <>
                {onStartDM && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      onStartDM(user.id);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Button>
                )}

                {friendStatus === 'none' && onAddFriend && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAddFriend(`${user.username}#${user.discriminator}`)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Friend</span>
                  </Button>
                )}

                {friendStatus === 'friend' && (
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Friends</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Identifiers */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{user.displayName}</h3>
              {user.premium_status && (
                <span className="text-[9px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  👑 VIP
                </span>
              )}
            </div>

            {/* Tag with 1-click Copy */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-400">@{user.username}#{user.discriminator}</span>
              <button 
                onClick={handleCopyTag} 
                className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800/60"
                title="Copy User Tag"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              {copied && <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">Copied!</span>}
            </div>

            {/* Custom Status */}
            {(user.status_text || user.status_emoji) && (
              <div className="mt-3 flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200">
                {user.status_emoji && <span className="text-base">{user.status_emoji}</span>}
                <span className="font-medium truncate">{user.status_text}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800/80 w-full" />

          {/* About Me */}
          {user.bio && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">About Me</h4>
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                &ldquo;{user.bio}&rdquo;
              </p>
            </div>
          )}

          {/* Rich Presence: Currently Reading */}
          {user.currently_reading && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Currently Reading
              </h4>
              <div className="flex gap-3 items-center bg-blue-950/20 border border-blue-500/25 p-3 rounded-2xl">
                {user.currently_reading.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.currently_reading.coverUrl} 
                    alt={user.currently_reading.title} 
                    className="w-10 h-14 object-cover rounded shadow border border-slate-800 shrink-0" 
                  />
                ) : (
                  <div className="w-10 h-14 bg-slate-900 rounded flex items-center justify-center shrink-0 text-slate-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{user.currently_reading.title}</h5>
                  <p className="text-[10px] text-slate-400 truncate">{user.currently_reading.author}</p>
                  {user.currently_reading.currentChapter && (
                    <p className="text-[9px] text-blue-300 font-mono truncate mt-0.5">{user.currently_reading.currentChapter}</p>
                  )}
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all" 
                      style={{ width: `${user.currently_reading.progressPercent}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discord Badges Shelf */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Badges & Achievements</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${badge.color}`}
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Metadata Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-850">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>Joined {user.member_since}</span>
            </span>
            <span>Level {user.level} Reader</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
