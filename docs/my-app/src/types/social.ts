export type UserPresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface BannerTheme {
  id: string;
  name: string;
  category: 'free' | 'glass';
  isPremium: boolean;
  value: string;
  border: string;
  previewBg: string;
  description: string;
  isGlass?: boolean;
}

export const FREE_BANNER_THEMES: BannerTheme[] = [
  {
    id: 'obsidian-black',
    name: 'Obsidian Black',
    category: 'free',
    isPremium: false,
    value: 'from-zinc-950 via-neutral-900 to-black',
    border: 'border-zinc-700/60',
    previewBg: 'from-zinc-950 via-neutral-900 to-black',
    description: 'Deep midnight obsidian dark'
  },
  {
    id: 'inkish-blue',
    name: 'Inkish Blue',
    category: 'free',
    isPremium: false,
    value: 'from-blue-900 via-indigo-950 to-slate-900',
    border: 'border-blue-500/50',
    previewBg: 'from-blue-900 via-indigo-950 to-slate-900',
    description: 'Signature QuillHawk inkish navy'
  },
  {
    id: 'greyish-slate',
    name: 'Greyish Slate',
    category: 'free',
    isPremium: false,
    value: 'from-slate-800 via-slate-700 to-zinc-900',
    border: 'border-slate-400/50',
    previewBg: 'from-slate-800 via-slate-700 to-zinc-900',
    description: 'Metallic graphite & polished silver'
  }
];

export const GLASS_BANNER_THEMES: BannerTheme[] = [
  {
    id: 'glass-obsidian',
    name: 'Frosted Obsidian Glass',
    category: 'glass',
    isPremium: true,
    isGlass: true,
    value: 'from-slate-950/80 via-indigo-950/50 to-neutral-950/80',
    border: 'border-white/30',
    previewBg: 'from-slate-900/80 via-indigo-950/60 to-slate-950/80',
    description: 'Smoky frosted glass with prismatic reflection'
  },
  {
    id: 'glass-aurora',
    name: 'Aurora Prism Glass',
    category: 'glass',
    isPremium: true,
    isGlass: true,
    value: 'from-cyan-950/75 via-purple-950/60 to-blue-950/75',
    border: 'border-cyan-400/40',
    previewBg: 'from-cyan-900/70 via-purple-900/60 to-blue-900/70',
    description: 'Iridescent cyan and amethyst crystal glow'
  },
  {
    id: 'glass-amber',
    name: 'Champagne Amber Glass',
    category: 'glass',
    isPremium: true,
    isGlass: true,
    value: 'from-amber-950/80 via-yellow-950/60 to-stone-950/80',
    border: 'border-amber-400/40',
    previewBg: 'from-amber-950/80 via-yellow-900/60 to-stone-900/80',
    description: 'Radiant champagne gold with warm crystal luster'
  }
];

export const ALL_BANNER_THEMES: BannerTheme[] = [
  ...FREE_BANNER_THEMES,
  ...GLASS_BANNER_THEMES
];


export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface CurrentlyReadingActivity {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string;
  progressPercent: number;
  currentChapter?: string;
  startedAt?: string;
}

export interface DiscordUserProfile {
  id: string;
  username: string;
  discriminator: string; // e.g. "1337" -> username#1337
  displayName: string;
  email?: string;
  avatar_url: string | null;
  banner_url?: string | null;
  banner_color?: string; // e.g. "from-blue-900 via-indigo-950 to-slate-900"
  bio: string | null;
  status_text?: string; // e.g. "Reading Crime & Punishment"
  status_emoji?: string; // e.g. "📖"
  presence: UserPresenceStatus;
  badges: UserBadge[];
  currently_reading?: CurrentlyReadingActivity | null;
  member_since: string;
  premium_status: boolean;
  level: number;
  xp: number;
}

export type FriendshipStatus = 'friend' | 'pending_incoming' | 'pending_outgoing' | 'blocked';

export interface FriendRelation {
  id: string;
  user: DiscordUserProfile;
  status: FriendshipStatus;
  createdAt: string;
  mutualGuildsCount?: number;
}

export interface BookShareAttachment {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  source?: string;
  fileUrl?: string;
}

export interface DirectMessageItem {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  bookShare?: BookShareAttachment | null;
  attachments?: string[];
  reactions: Record<string, string[]>; // e.g. { "❤️": ["user-1"], "🪶": ["user-1", "user-2"] }
  read: boolean;
}

export interface DMThread {
  id: string;
  participant: DiscordUserProfile;
  lastMessage?: DirectMessageItem;
  unreadCount: number;
  updatedAt: string;
}

export type ServerRole = 'owner' | 'admin' | 'moderator' | 'vip' | 'member';

export type ChannelType = 'text' | 'voice' | 'book_club' | 'announcement';

export interface DiscordChannel {
  id: string;
  serverId: string;
  categoryId?: string;
  name: string;
  type: ChannelType;
  topic?: string;
  unreadCount?: number;
  isLocked?: boolean;
}

export interface DiscordCategory {
  id: string;
  serverId: string;
  name: string;
  channelIds: string[];
}

export interface ServerMember {
  user: DiscordUserProfile;
  role: ServerRole;
  nickname?: string;
  joinedAt: string;
}

export interface ServerMessageItem {
  id: string;
  serverId: string;
  channelId: string;
  sender: DiscordUserProfile;
  content: string;
  createdAt: string;
  bookShare?: BookShareAttachment | null;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  pinned?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export interface DiscordServer {
  id: string;
  name: string;
  icon: string; // emoji or image URL
  description: string;
  ownerId: string;
  region?: string;
  genre?: string;
  bannerColor?: string;
  bannerUrl?: string;
  createdAt: string;
  categories: DiscordCategory[];
  channels: DiscordChannel[];
  members: ServerMember[];
  isJoined?: boolean;
  unreadTotal?: number;
}
