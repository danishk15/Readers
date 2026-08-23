'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { Camera, Sparkles, User, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  banner_color?: string;
  email?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileUpdated: (updatedProfile: Profile) => void;
}

// Predefined premium reading-themed avatars
const PRESET_AVATARS = [
  { name: 'Quill Scribe', value: '🪶', bg: 'bg-blue-600/25 text-blue-300 border-blue-400/40' },
  { name: 'Hawk Watcher', value: '🦅', bg: 'bg-slate-500/25 text-slate-200 border-slate-400/40' },
  { name: 'Classic Scholar', value: '📚', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { name: 'Cosmic Navigator', value: '🌌', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Mystery Sleuth', value: '🕵️', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Fantasy Wizard', value: '🧙', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { name: 'Tech Pioneer', value: '💻', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Dragon Rider', value: '🐉', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

export function ProfileEditModal({ isOpen, onClose, profile, onProfileUpdated }: ProfileEditModalProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
      
      // Check if current avatar is a preset
      const isPreset = PRESET_AVATARS.some(p => p.value === profile.avatar_url);
      if (isPreset) {
        setSelectedPreset(profile.avatar_url);
      } else {
        setSelectedPreset(null);
      }
    }
    setError(null);
    setSuccess(false);
  }, [profile, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Real mode: Upload to Supabase avatars bucket
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in.');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      let publicUrl = '';
      try {
        publicUrl = await uploadFile('avatars', filePath, file);
      } catch (uploadErr: any) {
        console.warn("Storage upload failed, falling back to local base64 preview:", uploadErr);
        // Fallback to local Data URL if bucket storage upload fails
        const dataUrlPromise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        publicUrl = await dataUrlPromise;
      }

      setAvatarUrl(publicUrl);
      setSelectedPreset(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setAvatarUrl(preset);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated.');

      // Update in public.users
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username.trim() || 'Reader',
          bio: bio.trim(),
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update auth metadata too
      await supabase.auth.updateUser({
        data: {
          username: username.trim(),
          avatar_url: avatarUrl,
        }
      });

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          id: user.id,
          username: username.trim() || 'Reader',
          bio: bio.trim(),
          avatar_url: avatarUrl,
          email: profile?.email || user.email,
        });
      }
      
      // Delay closing slightly to show the beautiful checkmark animation
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const isPresetAvatar = avatarUrl && PRESET_AVATARS.some(p => p.value === avatarUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Your Profile">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Success Animation */}
        {success && (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
            <span>Profile saved successfully! Updating details...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            {/* Avatar Preview */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-4xl text-white font-bold overflow-hidden shadow-lg shadow-primary/20 border-2 border-slate-700/80 group-hover:border-primary/80 transition-all duration-300">
              {avatarUrl ? (
                isPresetAvatar ? (
                  <span className="text-5xl select-none">{avatarUrl}</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <span className="select-none">{username ? username.charAt(0).toUpperCase() : 'R'}</span>
              )}
            </div>
            
            {/* Upload Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-slate-800 hover:bg-primary border border-slate-700 hover:border-primary/50 text-slate-200 hover:text-white p-2 rounded-xl transition-all duration-300 shadow-md shadow-black/40 group/btn"
              disabled={loading}
            >
              <Camera className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <span className="text-xs text-slate-500">Click camera to upload custom photo (max 2MB)</span>

          {/* Preset Avatars Carousel-like Selector */}
          <div className="w-full space-y-2.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              <span>Or Choose a Premium Reader Insignia</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  title={preset.name}
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`h-12 rounded-xl flex items-center justify-center text-2xl border transition-all duration-300 hover:scale-105 ${preset.bg} ${
                    selectedPreset === preset.value
                      ? 'ring-2 ring-primary border-transparent scale-110 shadow-lg shadow-primary/10'
                      : 'hover:border-slate-600'
                  }`}
                >
                  <span className="select-none">{preset.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Reader"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 focus:border-primary/30"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-350 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-450" />
              <span>Bio</span>
            </label>
            <textarea
              placeholder="Tell other readers about your journey, favorite genres, or goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              rows={4}
              className="flex w-full rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-300 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-850">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="border-slate-850 text-slate-300 hover:bg-slate-900 px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 px-5 py-2 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
