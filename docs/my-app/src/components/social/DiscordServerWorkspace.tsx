'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DiscordServer, 
  DiscordChannel, 
  ServerMessageItem, 
  DiscordUserProfile, 
  BookShareAttachment, 
  ChannelType,
  BannerTheme,
  FREE_CHANNEL_THEMES,
  VIP_CHANNEL_THEMES,
  ALL_CHANNEL_THEMES
} from '@/types/social';
import { 
  getDiscordServers, 
  getDiscordServer, 
  createDiscordServer, 
  joinDiscordServer, 
  leaveDiscordServer, 
  createServerChannel, 
  getServerMessages, 
  sendServerMessage, 
  addServerMessageReaction, 
  pinServerMessage, 
  getMyDiscordProfile,
  updateServerTheme,
  updateChannelTheme,
  DEFAULT_COMPANIONS 
} from '@/utils/socialStorage';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import { Modal } from '@/components/ui/Modal';
import { 
  Hash, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Megaphone, 
  Plus, 
  Compass, 
  Users, 
  Smile, 
  Send, 
  Pin, 
  Reply, 
  MoreVertical, 
  Search, 
  Sparkles, 
  X, 
  Check, 
  ExternalLink, 
  Globe, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare,
  Mic,
  MicOff,
  Headphones,
  Bell,
  Trash2,
  BookMarked,
  Palette,
  Crown,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DiscordServerWorkspaceProps {
  initialServerId?: string;
  initialChannelId?: string;
}

export function DiscordServerWorkspace({ initialServerId, initialChannelId }: DiscordServerWorkspaceProps) {
  const router = useRouter();
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [activeServerId, setActiveServerId] = useState<string>('');
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ServerMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Modals & Panels
  const [isCreateServerModalOpen, setIsCreateServerModalOpen] = useState(false);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);
  const [isBookShareModalOpen, setIsBookShareModalOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<DiscordUserProfile | null>(null);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showMembersSidebar, setShowMembersSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ServerMessageItem | null>(null);

  // Theme Customization States
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeScope, setThemeScope] = useState<'channel' | 'server'>('channel');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalReason, setVipModalReason] = useState({
    title: 'VIP Channel & Group Themes',
    description: 'Upgrade to QuillHawk VIP to unlock 12+ celestial frosted glass, cyberpunk, and cosmic channel themes!'
  });
  const [themeFeedback, setThemeFeedback] = useState<string | null>(null);
  
  // Voice Lounge Simulated State
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<DiscordChannel | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  
  // Forms
  const [newServerName, setNewServerName] = useState('');
  const [newServerDescription, setNewServerDescription] = useState('');
  const [newServerIcon, setNewServerIcon] = useState('🏰');
  const [newServerGenre, setNewServerGenre] = useState('Fiction');
  const [newServerTemplate, setNewServerTemplate] = useState<'default' | 'urdu' | 'book_club' | 'scifi' | 'fantasy'>('default');
  
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<ChannelType>('text');
  const [newChannelTopic, setNewChannelTopic] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState('');

  // Bookshelf / Book search for sharing
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myProfile = getMyDiscordProfile();

  // Load servers on mount
  useEffect(() => {
    const loadedServers = getDiscordServers();
    setServers(loadedServers);

    const targetServerId = initialServerId || (loadedServers.find(s => s.isJoined)?.id || loadedServers[0]?.id);
    if (targetServerId) {
      setActiveServerId(targetServerId);
      const server = loadedServers.find(s => s.id === targetServerId);
      if (server && server.channels.length > 0) {
        const targetChId = initialChannelId || server.channels[0].id;
        setActiveChannelId(targetChId);
      }
    }

    const handleServersUpdate = (e: CustomEvent<DiscordServer[]>) => {
      if (e.detail) setServers(e.detail);
    };

    const handleMessagesUpdate = (e: CustomEvent<{ serverId: string; channelId: string; messages: ServerMessageItem[] }>) => {
      if (e.detail && e.detail.channelId === activeChannelId) {
        setMessages(e.detail.messages);
      }
    };

    window.addEventListener('quillhawk:servers_updated' as any, handleServersUpdate);
    window.addEventListener('quillhawk:channel_messages_updated' as any, handleMessagesUpdate);

    return () => {
      window.removeEventListener('quillhawk:servers_updated' as any, handleServersUpdate);
      window.removeEventListener('quillhawk:channel_messages_updated' as any, handleMessagesUpdate);
    };
  }, [initialServerId, initialChannelId]);

  // Load books for sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const added = JSON.parse(localStorage.getItem('added-to-library-books') || '[]');
        const published = JSON.parse(localStorage.getItem('local-published-books') || '[]');
        
        const fallbackBooks = [
          { id: 'urdu-1', title: 'Dewan-e-Ghalib (دیوان غالب)', author: 'Mirza Ghalib', cover_url: 'https://covers.openlibrary.org/b/id/12818862-M.jpg', description: 'Classical Urdu Ghazals and poetry.' },
          { id: 'urdu-2', title: 'Kulliyat-e-Iqbal (کلیات اقبال)', author: 'Allama Iqbal', cover_url: 'https://covers.openlibrary.org/b/id/8235111-M.jpg', description: 'Philosophical and spiritual Urdu poetry.' },
          { id: 'gutendex-1342', title: 'Pride and Prejudice', author: 'Jane Austen', cover_url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg', description: 'Romantic social satire in 19th-century England.' },
          { id: 'gutendex-84', title: 'Frankenstein', author: 'Mary Shelley', cover_url: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg', description: 'Gothic masterpiece of science and humanity.' },
          { id: 'urdu-3', title: 'Peer-e-Kamil (پیر کامل)', author: 'Umera Ahmed', cover_url: 'https://covers.openlibrary.org/b/id/10524112-M.jpg', description: 'Acclaimed contemporary Urdu spiritual journey.' }
        ];

        setAvailableBooks([...added, ...published, ...fallbackBooks].filter((b, idx, self) => 
          self.findIndex(x => x.title.toLowerCase() === b.title.toLowerCase()) === idx
        ));
      } catch (e) {}
    }
  }, []);

  // Update messages when activeChannelId changes
  useEffect(() => {
    if (!activeServerId || !activeChannelId) return;

    const msgs = getServerMessages(activeServerId, activeChannelId);
    setMessages(msgs);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [activeServerId, activeChannelId]);

  const activeServer = servers.find(s => s.id === activeServerId) || servers[0];
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || activeServer?.channels[0];

  const activeChannelTheme = activeChannel?.themeColor || activeServer?.bannerColor || activeServer?.themeColor || FREE_CHANNEL_THEMES[1].value;
  const isGlassChannelTheme = VIP_CHANNEL_THEMES.some(t => t.isGlass && t.value === activeChannelTheme);
  const activeServerBanner = activeServer?.bannerColor || FREE_CHANNEL_THEMES[1].value;
  const isGlassServerBanner = VIP_CHANNEL_THEMES.some(t => t.isGlass && t.value === activeServerBanner);

  const handleSelectTheme = (theme: BannerTheme) => {
    if (theme.isPremium && !myProfile.premium_status) {
      setVipModalReason({
        title: `VIP Theme: ${theme.name}`,
        description: `The ${theme.name} atmospheric theme is reserved for QuillHawk VIP members. Upgrade to VIP to unlock all 12+ vibrant and frosted glass server & channel themes!`
      });
      setIsVipModalOpen(true);
      return;
    }

    if (themeScope === 'channel') {
      updateChannelTheme(activeServerId, activeChannelId, theme.value);
      setThemeFeedback(`Applied ${theme.name} to #${activeChannel?.name || 'channel'}!`);
    } else {
      updateServerTheme(activeServerId, theme.value);
      setThemeFeedback(`Applied ${theme.name} to ${activeServer?.name || 'server'}!`);
    }

    setTimeout(() => setThemeFeedback(null), 3000);
  };

  const handleResetTheme = () => {
    if (themeScope === 'channel') {
      updateChannelTheme(activeServerId, activeChannelId, '');
      setThemeFeedback(`Reset #${activeChannel?.name || 'channel'} theme to server default.`);
    } else {
      updateServerTheme(activeServerId, FREE_CHANNEL_THEMES[1].value);
      setThemeFeedback(`Reset ${activeServer?.name || 'server'} theme to Inkish Blue.`);
    }
    setTimeout(() => setThemeFeedback(null), 3000);
  };

  const handleSelectServer = (serverId: string) => {
    setActiveServerId(serverId);
    const s = servers.find(x => x.id === serverId);
    if (s && s.channels.length > 0) {
      setActiveChannelId(s.channels[0].id);
    }
    setIsServerMenuOpen(false);
  };

  const handleSelectChannel = (channel: DiscordChannel) => {
    if (channel.type === 'voice') {
      setActiveVoiceChannel(channel);
    } else {
      setActiveChannelId(channel.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeServerId || !activeChannelId) return;

    const content = messageInput.trim();
    setMessageInput('');

    const replyData = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.sender.displayName,
      content: replyingTo.content
    } : undefined;

    setReplyingTo(null);

    sendServerMessage(activeServerId, activeChannelId, content, null, replyData);
  };

  const handleShareBook = (book: any) => {
    if (!activeServerId || !activeChannelId) return;

    const bookAttachment: BookShareAttachment = {
      bookId: book.id || book.title,
      title: book.title,
      author: book.author || 'Unknown Author',
      coverUrl: book.cover_url || book.volumeInfo?.imageLinks?.thumbnail || '',
      description: book.description || 'A recommended literary masterpiece.',
      fileUrl: book.file_url
    };

    sendServerMessage(
      activeServerId, 
      activeChannelId, 
      `📚 Shared a book to **#${activeChannel?.name || 'chat'}**:`,
      bookAttachment
    );

    setIsBookShareModalOpen(false);
  };

  const handleCreateServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    const bannerColors: Record<string, string> = {
      default: 'from-blue-900 via-indigo-950 to-slate-900',
      urdu: 'from-emerald-950 via-teal-950 to-slate-950',
      book_club: 'from-rose-950 via-purple-950 to-slate-900',
      scifi: 'from-cyan-950 via-blue-950 to-slate-950',
      fantasy: 'from-purple-950 via-violet-950 to-slate-950'
    };

    const newServer = createDiscordServer(
      newServerName,
      newServerDescription || 'A welcoming literary community server.',
      newServerIcon,
      'Global',
      newServerGenre,
      newServerTemplate,
      bannerColors[newServerTemplate] || bannerColors.default
    );

    setNewServerName('');
    setNewServerDescription('');
    setIsCreateServerModalOpen(false);
    handleSelectServer(newServer.id);
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !activeServerId) return;

    const categoryId = newChannelCategory || activeServer?.categories[0]?.id || '';
    const newCh = createServerChannel(
      activeServerId,
      categoryId,
      newChannelName,
      newChannelType,
      newChannelTopic
    );

    setNewChannelName('');
    setNewChannelTopic('');
    setIsCreateChannelModalOpen(false);

    if (newCh && newCh.type !== 'voice') {
      setActiveChannelId(newCh.id);
    }
  };

  const displayedMessages = showPinnedOnly ? messages.filter(m => m.pinned) : messages;

  return (
    <div className="h-[calc(100vh-4.5rem)] w-full flex rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#090D16] text-slate-100 font-sans select-none relative animate-in fade-in duration-300">
      
      {/* 1. LEFT VERTICAL DISCORD SERVER RAIL */}
      <div className="w-[72px] bg-[#050811] border-r border-slate-900/80 flex flex-col items-center py-3 gap-2 shrink-0 z-20 overflow-y-auto no-scrollbar">
        
        {/* Direct Messages Home Pill */}
        <Link 
          href="/messages" 
          title="Direct Messages"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center transition-all duration-300 group relative hover:scale-105 shadow-lg shadow-blue-500/20"
        >
          <span className="text-xl">🪶</span>
          <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full -translate-x-3 group-hover:translate-x-0 transition-transform opacity-0 group-hover:opacity-100" />
        </Link>

        <div className="w-8 h-[2px] bg-slate-850 my-1 rounded-full" />

        {/* Server Icons List */}
        {servers.map((server) => {
          const isActive = server.id === activeServerId;

          return (
            <div key={server.id} className="relative group flex items-center justify-center w-full">
              {/* Discord Active Pill Indicator */}
              <div 
                className={`absolute left-0 w-1 rounded-r-full bg-white transition-all duration-300 ${
                  isActive 
                    ? 'h-10 opacity-100' 
                    : 'h-2 opacity-0 group-hover:opacity-100 group-hover:h-5'
                }`} 
              />

              <button
                onClick={() => handleSelectServer(server.id)}
                title={`${server.name} (${server.genre || 'General'})`}
                className={`w-12 h-12 flex items-center justify-center text-xl transition-all duration-300 relative shadow-md ${
                  isActive 
                    ? 'rounded-[16px] bg-indigo-600 text-white ring-2 ring-indigo-400/40 shadow-indigo-600/30' 
                    : 'rounded-[24px] hover:rounded-[16px] bg-slate-900/90 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-800'
                }`}
              >
                <span>{server.icon}</span>

                {/* Unread dot */}
                {server.unreadTotal && server.unreadTotal > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#050811]">
                    {server.unreadTotal}
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Add Server Button */}
        <button
          onClick={() => setIsCreateServerModalOpen(true)}
          title="Create a Community Server"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-slate-900/60 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-slate-800 hover:border-transparent group mt-1"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Discover Public Servers Button */}
        <button
          onClick={() => setIsDiscoverModalOpen(true)}
          title="Explore Public Guilds & Servers"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-slate-900/60 hover:bg-sky-600 text-sky-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-slate-800 hover:border-transparent group"
        >
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* 2. CHANNELS & CATEGORIES SIDEBAR */}
      <div className="w-64 bg-[#0A0F1E] border-r border-slate-855/80 flex flex-col shrink-0">
        
        {/* Server Header Dropdown */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${activeServerBanner} opacity-30 transition-all duration-500`} />
          {isGlassServerBanner && (
            <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-md pointer-events-none" />
          )}
          <button 
            onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
            className="w-full h-14 px-4 border-b border-slate-850/80 flex items-center justify-between font-extrabold text-sm hover:bg-slate-900/60 transition-colors shadow-sm text-left relative z-10"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{activeServer?.icon}</span>
              <span className="truncate text-slate-100 font-black">{activeServer?.name || 'Literary Guild'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isServerMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Server Settings Dropdown Menu */}
          {isServerMenuOpen && (
            <div className="absolute top-14 left-2 right-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in slide-from-top-2 duration-200">
              <button 
                onClick={() => { setIsThemeModalOpen(true); setIsServerMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Server & Channel Themes</span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button 
                onClick={() => { setIsCreateChannelModalOpen(true); setIsServerMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-600/15 transition-colors"
              >
                <span>Create Channel</span>
                <Plus className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => { setIsDiscoverModalOpen(true); setIsServerMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-900 transition-colors"
              >
                <span>Explore Guilds</span>
                <Compass className="w-4 h-4 text-slate-400" />
              </button>

              <div className="h-[1px] bg-slate-850 my-1" />

              {activeServer?.isJoined !== false ? (
                <button 
                  onClick={() => { leaveDiscordServer(activeServerId); setIsServerMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <span>Leave Server</span>
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => { joinDiscordServer(activeServerId); setIsServerMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <span>Join Server</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {activeServer?.categories?.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1">
                <span>{category.name}</span>
                <button 
                  onClick={() => {
                    setNewChannelCategory(category.id);
                    setIsCreateChannelModalOpen(true);
                  }}
                  title="Create Channel in Category"
                  className="hover:text-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {category.channelIds.map((chId) => {
                const channel = activeServer.channels.find(c => c.id === chId);
                if (!channel) return null;
                const isChActive = channel.id === activeChannelId;

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all group ${
                      isChActive 
                        ? 'bg-slate-800/80 text-white shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {channel.type === 'text' && <Hash className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />}
                      {channel.type === 'book_club' && <BookOpen className="w-4 h-4 text-emerald-400" />}
                      {channel.type === 'voice' && <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
                      {channel.type === 'announcement' && <Megaphone className="w-4 h-4 text-amber-400" />}
                      <span className="truncate">{channel.name}</span>
                    </div>

                    {channel.unreadCount && channel.unreadCount > 0 && !isChActive && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Active Voice Lounge Status Bar */}
        {activeVoiceChannel && (
          <div className="bg-emerald-950/40 border-t border-emerald-500/30 p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <div className="min-w-0">
                <p className="font-extrabold text-emerald-300 truncate text-[11px]">Voice Connected</p>
                <p className="text-[10px] text-emerald-400/70 truncate">{activeVoiceChannel.name}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveVoiceChannel(null)}
              className="text-emerald-400 hover:text-rose-400 transition-colors p-1"
              title="Disconnect"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom User Presence Bar */}
        <div className="h-14 bg-[#060913] border-t border-slate-850/80 px-3 flex items-center justify-between shrink-0">
          <div 
            onClick={() => setSelectedUserForModal(myProfile)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                {myProfile.avatar_url && ['📚', '🌌', '🕵️', '🧙', '💻', '🐉', '🪶'].includes(myProfile.avatar_url) ? (
                  <span>{myProfile.avatar_url}</span>
                ) : (
                  <span>{myProfile.displayName.charAt(0)}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#060913]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-200 truncate leading-none">{myProfile.displayName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">#{myProfile.discriminator}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-md hover:bg-slate-850 transition-colors ${isMuted ? 'text-rose-400' : ''}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-1.5 rounded-md hover:bg-slate-850 transition-colors ${isDeafened ? 'text-rose-400' : ''}`}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CHAT & CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-[#070B16] relative min-w-0 overflow-hidden">
        
        {/* Ambient Channel & Server Atmosphere Glow */}
        <div className={`absolute top-0 inset-x-0 h-64 bg-gradient-to-b ${activeChannelTheme} opacity-20 pointer-events-none transition-all duration-700 blur-3xl`} />
        {isGlassChannelTheme && (
          <div className="absolute inset-x-0 top-0 h-32 bg-white/[0.03] backdrop-blur-md pointer-events-none" />
        )}

        {/* Channel Header */}
        <div className="h-14 border-b border-slate-850/80 px-4 flex items-center justify-between bg-[#070B16]/85 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 font-black text-sm text-slate-100">
              {activeChannel?.type === 'text' && <Hash className="w-5 h-5 text-slate-500" />}
              {activeChannel?.type === 'book_club' && <BookOpen className="w-5 h-5 text-emerald-400" />}
              {activeChannel?.type === 'voice' && <Volume2 className="w-5 h-5 text-cyan-400" />}
              {activeChannel?.type === 'announcement' && <Megaphone className="w-5 h-5 text-amber-400" />}
              <span className="truncate">{activeChannel?.name || 'general'}</span>
              {activeChannel?.themeColor && (
                <span className="hidden sm:inline-flex text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Custom Theme
                </span>
              )}
            </div>

            {activeChannel?.topic && (
              <>
                <div className="w-[1px] h-4 bg-slate-800 hidden md:block" />
                <p className="text-xs text-slate-400 truncate hidden md:block max-w-md font-medium">
                  {activeChannel.topic}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {/* Theme Customizer Trigger Button */}
            <button 
              onClick={() => {
                setThemeScope('channel');
                setIsThemeModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 border border-transparent hover:border-slate-800"
              title="Customize Channel & Server Theme"
            >
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline text-xs font-bold">Theme</span>
            </button>

            <button 
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`p-2 rounded-lg hover:bg-slate-850 transition-colors ${showPinnedOnly ? 'bg-indigo-600/20 text-indigo-400' : ''}`}
              title="Pinned Messages"
            >
              <Pin className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setShowMembersSidebar(!showMembersSidebar)}
              className={`p-2 rounded-lg hover:bg-slate-850 transition-colors ${showMembersSidebar ? 'text-indigo-400' : ''}`}
              title="Toggle Member List"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {displayedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl shadow-xl">
                {activeChannel?.type === 'book_club' ? '📖' : '💬'}
              </div>
              <h3 className="font-extrabold text-base text-slate-200">Welcome to #{activeChannel?.name}!</h3>
              <p className="text-xs max-w-sm">This is the start of the #{activeChannel?.name} channel. Share your thoughts, debate chapters, or recommend books.</p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isMine = msg.sender.id === myProfile.id;
              const isBot = msg.sender.id.includes('bot');

              return (
                <div 
                  key={msg.id} 
                  className={`group flex gap-3.5 p-2 rounded-xl hover:bg-slate-900/40 transition-colors relative ${
                    msg.pinned ? 'border-l-2 border-indigo-500 bg-indigo-950/10' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  <div 
                    onClick={() => setSelectedUserForModal(msg.sender)}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow cursor-pointer hover:scale-105 transition-transform"
                  >
                    {msg.sender.avatar_url && ['📚', '🌌', '🕵️', '🧙', '💻', '🐉', '🪶', '🤖'].includes(msg.sender.avatar_url) ? (
                      <span className="text-lg">{msg.sender.avatar_url}</span>
                    ) : (
                      <span>{msg.sender.displayName.charAt(0)}</span>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        onClick={() => setSelectedUserForModal(msg.sender)}
                        className="font-extrabold text-sm text-slate-200 hover:underline cursor-pointer"
                      >
                        {msg.sender.displayName}
                      </span>

                      {/* Badges / Roles */}
                      {isBot && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                          BOT
                        </span>
                      )}
                      {activeServer?.ownerId === msg.sender.id && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          OWNER
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {msg.pinned && (
                        <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5 ml-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>

                    {/* Replying Context */}
                    {msg.replyTo && (
                      <div className="text-xs text-slate-400 bg-slate-900/60 border-l-2 border-slate-700 px-2 py-1 rounded my-1.5 flex items-center gap-1 truncate font-mono">
                        <Reply className="w-3 h-3 shrink-0 rotate-180" />
                        <span className="font-bold text-slate-300">@{msg.replyTo.senderName}:</span>
                        <span className="truncate">{msg.replyTo.content}</span>
                      </div>
                    )}

                    {/* Text content with Nastaliq font for Urdu characters */}
                    <div className="text-sm text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap font-normal selection:bg-indigo-600/40 font-['Noto_Nastaliq_Urdu',sans-serif]">
                      {msg.content}
                    </div>

                    {/* Book Share Embed */}
                    {msg.bookShare && (
                      <div className="mt-3 bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 max-w-lg shadow-xl flex gap-3.5 items-center">
                        <div className="w-16 h-24 bg-slate-800 rounded-xl overflow-hidden shadow shrink-0 flex items-center justify-center border border-slate-700">
                          {msg.bookShare.coverUrl ? (
                            <img src={msg.bookShare.coverUrl} alt={msg.bookShare.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            Book Recommendation
                          </span>
                          <h4 className="font-extrabold text-sm text-white truncate">{msg.bookShare.title}</h4>
                          <p className="text-xs text-slate-400 truncate">{msg.bookShare.author}</p>
                          
                          <div className="flex items-center gap-2 pt-1">
                            <Link href={`/reader/${encodeURIComponent(msg.bookShare.bookId)}`} passHref legacyBehavior>
                              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-1.5 h-auto rounded-lg px-3">
                                📖 Read Now
                              </Button>
                            </Link>
                            <Link href="/dashboard" passHref legacyBehavior>
                              <Button size="sm" variant="secondary" className="text-[10px] py-1.5 h-auto rounded-lg px-3 bg-slate-800 text-slate-300">
                                ➕ Library
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reactions Row */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                          const reactedByMe = userIds.includes(myProfile.id);
                          return (
                            <button
                              key={emoji}
                              onClick={() => addServerMessageReaction(activeServerId, activeChannelId, msg.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all border ${
                                reactedByMe 
                                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{userIds.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Action Floating Menu */}
                  <div className="absolute right-3 top-2 bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {['❤️', '🪶', '👏', '🔥', '⭐'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addServerMessageReaction(activeServerId, activeChannelId, msg.id, emoji)}
                        className="p-1 hover:bg-slate-850 rounded text-xs transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => pinServerMessage(activeServerId, activeChannelId, msg.id)}
                      className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                      title="Pin Message"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#070B16] border-t border-slate-850/80 shrink-0">
          {/* Replying Banner */}
          {replyingTo && (
            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-t-xl flex items-center justify-between text-xs text-slate-300 font-mono -mb-1">
              <div className="flex items-center gap-1.5 truncate">
                <Reply className="w-3.5 h-3.5 text-indigo-400 rotate-180" />
                <span>Replying to <b className="text-white">@{replyingTo.sender.displayName}</b>:</span>
                <span className="text-slate-400 truncate">{replyingTo.content}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            
            {/* Share Book Button */}
            <button
              type="button"
              onClick={() => setIsBookShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
              title="Share Book to Channel"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Main Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${activeChannel?.name || 'chat'} (Ask @quillbot for book summaries & quotes)`}
                className="w-full bg-[#101626] border border-slate-800 rounded-xl py-3 pl-4 pr-24 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {/* Emoji Picker Quick Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(showEmojiPicker ? null : 'input')}
                  className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Ask QuillBot Tag */}
            <button
              type="button"
              onClick={() => setMessageInput('/quillbot ')}
              className="hidden lg:flex items-center gap-1 px-3 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all shrink-0"
              title="Ask AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>/quillbot</span>
            </button>
          </form>

          {/* Emoji Tray Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-6 bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl z-50 grid grid-cols-6 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {['❤️', '🪶', '👏', '🔥', '⭐', '📖', '🤯', '😍', '☕', '🚀', '🌌', '🧙', '👑', '🎉', '💯', '🌸', '🇵🇰', '🕊️'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessageInput(prev => prev + emoji);
                    setShowEmojiPicker(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg flex items-center justify-center transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. MEMBERS DIRECTORY SIDEBAR */}
      {showMembersSidebar && (
        <div className="w-60 bg-[#090D1A] border-l border-slate-850/80 p-3 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            
            {/* Server Owner & Mods */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                👑 Founder & Mods — {activeServer?.members?.filter(m => m.role === 'owner' || m.role === 'moderator').length || 1}
              </p>
              {activeServer?.members?.filter(m => m.role === 'owner' || m.role === 'moderator').map(m => (
                <div
                  key={m.user.id}
                  onClick={() => setSelectedUserForModal(m.user)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      {m.user.avatar_url && ['📚', '🌌', '🕵️', '🧙', '💻', '🐉', '🪶'].includes(m.user.avatar_url) ? (
                        <span>{m.user.avatar_url}</span>
                      ) : (
                        <span>{m.user.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090D1A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-amber-300 group-hover:text-white truncate">{m.user.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{m.user.status_text || 'Active in guild'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Online Members */}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                🟢 Online Literati — {DEFAULT_COMPANIONS.length + 1}
              </p>
              
              {/* Current user */}
              <div 
                onClick={() => setSelectedUserForModal(myProfile)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-colors group"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
                    {myProfile.displayName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090D1A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-200 group-hover:text-white truncate">{myProfile.displayName} (You)</p>
                  <p className="text-[10px] text-emerald-400 font-medium">Online</p>
                </div>
              </div>

              {/* Companions */}
              {DEFAULT_COMPANIONS.map(companion => (
                <div
                  key={companion.id}
                  onClick={() => setSelectedUserForModal(companion)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow">
                      <span>{companion.avatar_url}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#090D1A] ${
                      companion.presence === 'online' ? 'bg-emerald-500' :
                      companion.presence === 'idle' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-300 group-hover:text-white truncate">{companion.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{companion.status_text || 'Reading'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE SERVER */}
      {isCreateServerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>🏰 Create Your Community Guild</span>
              </h3>
              <button onClick={() => setIsCreateServerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServerSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Server Icon & Name</label>
                <div className="flex gap-2">
                  <select
                    value={newServerIcon}
                    onChange={e => setNewServerIcon(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 text-lg"
                  >
                    <option value="🏰">🏰</option>
                    <option value="🇵🇰">🇵🇰</option>
                    <option value="📖">📖</option>
                    <option value="🌌">🌌</option>
                    <option value="🧙">🧙</option>
                    <option value="🏛️">🏛️</option>
                    <option value="☕">☕</option>
                    <option value="🐉">🐉</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victorian Classics & Poetry Guild"
                    value={newServerName}
                    onChange={e => setNewServerName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Template Layout</label>
                <select
                  value={newServerTemplate}
                  onChange={e => setNewServerTemplate(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                >
                  <option value="default">General Literature Guild (#general, #book-recs, 🔊 study-lounge)</option>
                  <option value="urdu">بزمِ اردو و شاعری (#غالب-اقبال, #بیت-بازی, #افسانے, 🔊 مطالعہ گاہ)</option>
                  <option value="book_club">Book Club Reading Sprint (#reading-schedule, #chapter-reactions)</option>
                  <option value="scifi">Sci-Fi & Cyberpunk Syndicate (#cyberpunk-ai, #space-operas)</option>
                  <option value="fantasy">High Fantasy Guild (#tavern-chat, #worldbuilding)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="What will readers discuss in your guild?"
                  value={newServerDescription}
                  onChange={e => setNewServerDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreateServerModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Create Guild
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CHANNEL */}
      {isCreateChannelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>➕ Create Channel</span>
              </h3>
              <button onClick={() => setIsCreateChannelModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Channel Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'text', label: '# Text Channel' },
                    { type: 'book_club', label: '📖 Book Club' },
                    { type: 'voice', label: '🔊 Reading Lounge' },
                    { type: 'announcement', label: '📢 Announcement' }
                  ].map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewChannelType(t.type as any)}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold text-left transition-all ${
                        newChannelType === t.type 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chapter-12-spoilers"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Topic / Description</label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={newChannelTopic}
                  onChange={e => setNewChannelTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreateChannelModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Create Channel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPLORE & DISCOVER SERVERS */}
      {isDiscoverModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-sky-400" />
                  <span>Discover Public Literary Guilds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Explore and join active reader communities across different genres and regions.</p>
              </div>
              <button onClick={() => setIsDiscoverModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
              {servers.map((s) => (
                <div 
                  key={s.id}
                  className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-2xl shrink-0 border border-indigo-500/20">
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">{s.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{s.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>📍 {s.region || 'Global'}</span>
                        <span>•</span>
                        <span>🏷️ {s.genre || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {s.isJoined !== false ? (
                      <Button 
                        size="sm"
                        variant="secondary" 
                        onClick={() => { handleSelectServer(s.id); setIsDiscoverModalOpen(false); }}
                        className="w-full sm:w-auto text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        ✓ Open Server
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => { joinDiscordServer(s.id); handleSelectServer(s.id); setIsDiscoverModalOpen(false); }}
                        className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        Join Guild
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SHARE BOOK ATTACHMENT */}
      {isBookShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Share a Book to #{activeChannel?.name}</span>
              </h3>
              <button onClick={() => setIsBookShareModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by book title or author..."
              value={bookSearchQuery}
              onChange={e => setBookSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {availableBooks
                .filter(b => b.title?.toLowerCase().includes(bookSearchQuery.toLowerCase()) || b.author?.toLowerCase().includes(bookSearchQuery.toLowerCase()))
                .map((b) => (
                  <div 
                    key={b.id || b.title} 
                    className="p-3 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    onClick={() => handleShareBook(b)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {b.cover_url ? (
                          <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors truncate">{b.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{b.author || 'Unknown'}</p>
                      </div>
                    </div>

                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-1.5 h-auto rounded-lg shrink-0">
                      Share 🪶
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CHANNEL & GROUP THEMES */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  <span>Channel & Group Theme Atmosphere</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select from 3 free themes or unlock 12+ VIP celestial, cyberpunk, and frosted glass atmospheres.
                </p>
              </div>
              <button onClick={() => setIsThemeModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Toast */}
            {themeFeedback && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{themeFeedback}</span>
              </div>
            )}

            {/* Scope Switcher: Active Channel vs Entire Server */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setThemeScope('channel')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  themeScope === 'channel'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Active Channel (#{activeChannel?.name})</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeScope('server')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  themeScope === 'server'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm">{activeServer?.icon || '🏰'}</span>
                <span>Entire Server ({activeServer?.name})</span>
              </button>
            </div>

            {/* Themes List Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 no-scrollbar">
              {/* Section 1: 3 Free Classic Themes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>✨ Free Classic Themes</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-md border border-emerald-500/20">3 Available</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FREE_CHANNEL_THEMES.map((theme) => {
                    const isCurrent = themeScope === 'channel' 
                      ? activeChannel?.themeColor === theme.value || (!activeChannel?.themeColor && activeServer?.bannerColor === theme.value)
                      : activeServer?.bannerColor === theme.value;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectTheme(theme)}
                        className={`group relative h-20 rounded-2xl bg-gradient-to-r ${theme.value} border p-3 flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.02] shadow-md overflow-hidden ${
                          isCurrent 
                            ? `${theme.border} ring-2 ring-primary shadow-primary/20 shadow-lg scale-[1.02]` 
                            : 'border-slate-800 hover:border-slate-600 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-sm text-slate-300 px-2 py-0.5 rounded border border-white/10">
                            Free
                          </span>
                          {isCurrent && (
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

              {/* Section 2: 12 VIP Atmospheric Themes */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>👑 VIP Atmospheric Themes</span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.2 rounded-md border border-amber-500/30">12 VIP Exclusive</span>
                  </h4>
                  {!myProfile.premium_status && (
                    <Link href="/premium" className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1">
                      <span>Unlock All VIP</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {VIP_CHANNEL_THEMES.map((theme) => {
                    const isCurrent = themeScope === 'channel'
                      ? activeChannel?.themeColor === theme.value || (!activeChannel?.themeColor && activeServer?.bannerColor === theme.value)
                      : activeServer?.bannerColor === theme.value;
                    const isLocked = !myProfile.premium_status;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectTheme(theme)}
                        className={`group relative h-22 rounded-2xl bg-gradient-to-r ${theme.previewBg} border p-3 flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.02] shadow-lg overflow-hidden backdrop-blur-md ${
                          isCurrent 
                            ? `${theme.border} ring-2 ring-amber-400 shadow-amber-500/20 shadow-xl scale-[1.02]` 
                            : isLocked
                            ? 'border-slate-800/90 hover:border-amber-500/40'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {/* Frosted glass shine overlay if glass theme */}
                        {theme.isGlass && (
                          <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-sm pointer-events-none" />
                        )}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

                        <div className="flex items-center justify-between z-10">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 backdrop-blur-sm text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> VIP
                          </span>
                          {isCurrent ? (
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
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-850">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTheme}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl"
              >
                Reset to Default
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsThemeModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP UPGRADE MODAL */}
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
              VIP Members Unlock:
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>12+ Celestial, Cyberpunk & Frosted Glass Channel Themes</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Custom atmospheric background glows for servers & channels</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Golden VIP Member badges across all community hubs</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Unlimited AI Translation & Offline EPUB Reading</span>
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

      {/* USER PROFILE MODAL */}
      {selectedUserForModal && (
        <UserProfileModal
          user={selectedUserForModal}
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onStartDM={(userId) => {
            setSelectedUserForModal(null);
            router.push(`/messages?recipientId=${userId}`);
          }}
        />
      )}
    </div>
  );
}
