export type UserPresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';

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
