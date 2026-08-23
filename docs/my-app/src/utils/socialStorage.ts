import { 
  DiscordUserProfile, 
  FriendRelation, 
  DirectMessageItem, 
  DMThread, 
  UserPresenceStatus,
  BookShareAttachment,
  DiscordServer,
  DiscordCategory,
  DiscordChannel,
  ServerMember,
  ServerMessageItem,
  ServerRole,
  ChannelType
} from '@/types/social';

// Pre-seeded demo companion friends for immediate social interaction
export const DEFAULT_COMPANIONS: DiscordUserProfile[] = [
  {
    id: 'companion-aria',
    username: 'aria',
    discriminator: '1001',
    displayName: 'Aria Stark',
    avatar_url: '🪶',
    banner_color: 'from-blue-900 via-indigo-950 to-slate-900',
    bio: 'Avid fantasy & mystery reader. Exploring every hidden corner of the QuillHawk universe!',
    status_emoji: '📖',
    status_text: 'Reading A Song of Ice and Fire',
    presence: 'online',
    member_since: 'Nov 2024',
    premium_status: true,
    level: 14,
    xp: 6,
    currently_reading: {
      bookId: 'gutendex-1342',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
      progressPercent: 68,
      currentChapter: 'Chapter 18: The Netherfield Ball'
    },
    badges: [
      { id: 'founder', name: 'QuillHawk Founder', icon: '🪶', description: 'Early access pioneer of QuillHawk', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      { id: 'vip', name: 'VIP Soaring Member', icon: '👑', description: 'Active VIP tier subscriber', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      { id: 'speed', name: 'Speed Reader', icon: '⚡', description: 'Read over 1,000 pages in record time', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' }
    ]
  },
  {
    id: 'companion-arthur',
    username: 'arthur_conan',
    discriminator: '1887',
    displayName: 'Arthur Conan',
    avatar_url: '🕵️',
    banner_color: 'from-emerald-950 via-slate-900 to-slate-950',
    bio: 'Detective fiction writer & Sherlockian archivist. Elementary, my dear readers.',
    status_emoji: '🔍',
    status_text: 'Analyzing 221B Baker Street clues',
    presence: 'online',
    member_since: 'Dec 2024',
    premium_status: false,
    level: 22,
    xp: 4,
    currently_reading: {
      bookId: 'gutendex-1661',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
      progressPercent: 92,
      currentChapter: 'A Scandal in Bohemia'
    },
    badges: [
      { id: 'bookworm', name: 'Master Sleuth', icon: '🕵️', description: 'Solved over 50 literary riddles', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      { id: 'author', name: 'Author Studio', icon: '✍️', description: 'Published verified manuscripts', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
    ]
  },
  {
    id: 'companion-jane',
    username: 'jane_austen',
    discriminator: '1775',
    displayName: 'Jane Austen',
    avatar_url: '📚',
    banner_color: 'from-rose-950 via-purple-950 to-slate-900',
    bio: 'It is a truth universally acknowledged that a reader in possession of good books must be in want of friends.',
    status_emoji: '☕',
    status_text: 'Writing letters by candlelight',
    presence: 'idle',
    member_since: 'Jan 2025',
    premium_status: true,
    level: 19,
    xp: 8,
    currently_reading: {
      bookId: 'gutendex-84',
      title: 'Frankenstein',
      author: 'Mary Wollstonecraft Shelley',
      coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
      progressPercent: 45,
      currentChapter: 'Chapter 5: The Spark of Life'
    },
    badges: [
      { id: 'vip', name: 'VIP Member', icon: '👑', description: 'QuillHawk patron', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      { id: 'story', name: 'Master Storyteller', icon: '🌸', description: 'Beloved literary author', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' }
    ]
  },
  {
    id: 'companion-cyber',
    username: 'cyberscribe',
    discriminator: '2049',
    displayName: 'CyberScribe',
    avatar_url: '💻',
    banner_color: 'from-cyan-950 via-blue-950 to-slate-950',
    bio: 'Building futuristic hyper-text editions and neural reading companions on QuillHawk.',
    status_emoji: '🚀',
    status_text: 'Do Not Disturb • Deep Reading',
    presence: 'dnd',
    member_since: 'Feb 2025',
    premium_status: true,
    level: 30,
    xp: 2,
    currently_reading: {
      bookId: 'gutendex-36',
      title: 'The War of the Worlds',
      author: 'H. G. Wells',
      coverUrl: 'https://www.gutenberg.org/cache/epub/36/pg36.cover.medium.jpg',
      progressPercent: 78,
      currentChapter: 'Book II: The Earth under the Martians'
    },
    badges: [
      { id: 'ai', name: 'Neural Literati', icon: '🤖', description: 'AI Reading Assistant Pioneer', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
      { id: 'champ', name: 'Tournament Champion', icon: '🏆', description: 'Top 1% in weekly reading sprint', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' }
    ]
  }
];

const DEFAULT_INITIAL_MESSAGES: Record<string, DirectMessageItem[]> = {
  'dm-thread-aria': [
    {
      id: 'msg-aria-1',
      threadId: 'dm-thread-aria',
      senderId: 'companion-aria',
      recipientId: 'current-user',
      content: 'Hey there! Welcome to the new QuillHawk Social Hub! 🪶✨ Have you checked out the new 100% Free Global Catalog yet?',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reactions: { '🪶': ['current-user'] },
      read: true
    },
    {
      id: 'msg-aria-2',
      threadId: 'dm-thread-aria',
      senderId: 'companion-aria',
      recipientId: 'current-user',
      content: 'I was just reading Pride & Prejudice and loved the chapter discussion guide. You can even share books directly into our chat here!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      bookShare: {
        bookId: 'gutendex-1342',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
        description: 'A romantic masterpiece following Elizabeth Bennet and Mr. Darcy.',
        source: 'Project Gutenberg',
        fileUrl: 'https://www.gutenberg.org/ebooks/1342.epub.noimages'
      },
      reactions: { '❤️': ['current-user'], '🔥': ['companion-aria'] },
      read: false
    }
  ],
  'dm-thread-arthur': [
    {
      id: 'msg-arthur-1',
      threadId: 'dm-thread-arthur',
      senderId: 'companion-arthur',
      recipientId: 'current-user',
      content: 'Greetings, fellow investigator. I am reviewing the original digitized archives of Sherlock Holmes. Let me know if you need any rare volume recommendations!',
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      reactions: { '🕵️': ['current-user'] },
      read: true
    }
  ],
  'dm-thread-jane': [
    {
      id: 'msg-jane-1',
      threadId: 'dm-thread-jane',
      senderId: 'companion-jane',
      recipientId: 'current-user',
      content: 'Delighted to connect on QuillHawk! May your reading hours be peaceful and inspiring. 🌸',
      createdAt: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
      reactions: { '☕': ['current-user'] },
      read: true
    }
  ]
};

const STORAGE_KEYS = {
  PROFILE: 'quillhawk_discord_profile',
  FRIENDS: 'quillhawk_friends_list',
  MESSAGES: 'quillhawk_dm_messages',
  THREADS: 'quillhawk_dm_threads'
};

export function getMyDiscordProfile(authUser?: any, dbProfile?: any, logs?: any[]): DiscordUserProfile {
  if (typeof window === 'undefined') {
    return createDefaultProfile(authUser, dbProfile, logs);
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Update with live user values if present
      if (authUser?.email && !parsed.email) parsed.email = authUser.email;
      if (dbProfile?.premium_status !== undefined) parsed.premium_status = dbProfile.premium_status;
      if (dbProfile?.banner_url !== undefined && !parsed.banner_url) parsed.banner_url = dbProfile.banner_url;
      if (dbProfile?.banner_color !== undefined && !parsed.banner_color) parsed.banner_color = dbProfile.banner_color;
      return parsed;
    }
  } catch (e) {
    console.error('Error loading discord profile:', e);
  }

  const initial = createDefaultProfile(authUser, dbProfile, logs);
  saveMyDiscordProfile(initial);
  return initial;
}

function createDefaultProfile(authUser?: any, dbProfile?: any, logs?: any[]): DiscordUserProfile {
  const username = dbProfile?.username || authUser?.email?.split('@')[0] || 'QuillHawkReader';
  const totalSeconds = logs?.reduce((acc: number, log: any) => acc + (log.time_spent_seconds || 0), 0) || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const level = Math.floor(totalMinutes / 10) + 1;
  const xp = totalMinutes % 10;

  return {
    id: authUser?.id || 'current-user',
    username: username.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'reader',
    discriminator: String(Math.floor(1000 + Math.random() * 9000)),
    displayName: dbProfile?.username || authUser?.email?.split('@')[0] || 'QuillHawk Reader',
    email: authUser?.email || 'reader@quillhawk.app',
    avatar_url: dbProfile?.avatar_url || '🪶',
    banner_url: dbProfile?.banner_url || null,
    banner_color: dbProfile?.banner_color || 'from-blue-900 via-indigo-950 to-slate-900',
    bio: dbProfile?.bio || 'Passionate book enthusiast soaring through literature with QuillHawk.',
    status_emoji: '✨',
    status_text: 'Soaring with QuillHawk',
    presence: 'online',
    member_since: 'Aug 2026',
    premium_status: !!dbProfile?.premium_status,
    level: Math.max(1, level),
    xp: xp,
    badges: [
      { id: 'founder', name: 'QuillHawk Pioneer', icon: '🪶', description: 'Early access member of QuillHawk', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
      ...(dbProfile?.premium_status ? [{ id: 'vip', name: 'VIP Soaring Member', icon: '👑', description: 'VIP Pass Tier Patron', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }] : []),
      { id: 'bookworm', name: 'Verified Reader', icon: '📚', description: 'Active literary community reader', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
    ],
    currently_reading: {
      bookId: 'gutendex-84',
      title: 'Frankenstein',
      author: 'Mary Wollstonecraft Shelley',
      coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
      progressPercent: 35,
      currentChapter: 'Chapter 4: The Creation'
    }
  };
}

export function saveMyDiscordProfile(profile: DiscordUserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('quillhawk:profile_updated', { detail: profile }));
  } catch (e) {
    console.error('Error saving discord profile:', e);
  }
}

export function getFriendsList(): FriendRelation[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading friends:', e);
  }

  // Initialize with companion relations
  const initialFriends: FriendRelation[] = DEFAULT_COMPANIONS.map((companion, idx) => ({
    id: `friend-${companion.id}`,
    user: companion,
    status: idx === 3 ? 'pending_incoming' : 'friend',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (idx + 1)).toISOString(),
    mutualGuildsCount: 3 - idx
  }));

  saveFriendsList(initialFriends);
  return initialFriends;
}

export function saveFriendsList(friends: FriendRelation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    window.dispatchEvent(new CustomEvent('quillhawk:friends_updated', { detail: friends }));
  } catch (e) {
    console.error('Error saving friends list:', e);
  }
}

export function sendFriendRequest(targetTagOrUsername: string): { success: boolean; message: string; friend?: FriendRelation } {
  const query = targetTagOrUsername.trim().toLowerCase();
  if (!query) return { success: false, message: 'Please enter a username#tag or @username.' };

  const currentFriends = getFriendsList();
  
  // Check if already in friend list
  const existing = currentFriends.find(f => 
    `${f.user.username}#${f.user.discriminator}`.toLowerCase() === query ||
    f.user.username.toLowerCase() === query.replace('@', '') ||
    f.user.displayName.toLowerCase() === query
  );

  if (existing) {
    if (existing.status === 'friend') return { success: false, message: `${existing.user.displayName} is already your friend!` };
    if (existing.status === 'pending_outgoing') return { success: false, message: `Friend request to ${existing.user.displayName} is already pending.` };
    if (existing.status === 'pending_incoming') {
      // Auto accept!
      existing.status = 'friend';
      saveFriendsList(currentFriends);
      return { success: true, message: `Accepted friend request from ${existing.user.displayName}!`, friend: existing };
    }
  }

  // Create or match a new user
  const parts = query.split('#');
  const uName = parts[0].replace('@', '');
  const disc = parts[1] || String(Math.floor(1000 + Math.random() * 9000));

  const newCompanion: DiscordUserProfile = {
    id: `user-${Date.now()}`,
    username: uName,
    discriminator: disc,
    displayName: uName.charAt(0).toUpperCase() + uName.slice(1),
    avatar_url: ['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'][Math.floor(Math.random() * 8)],
    banner_color: 'from-blue-900 via-indigo-950 to-slate-900',
    bio: 'Fellow book enthusiast on QuillHawk.',
    presence: 'online',
    status_emoji: '📖',
    status_text: 'Browsing QuillHawk Catalog',
    member_since: 'Aug 2026',
    premium_status: false,
    level: 5,
    xp: 0,
    badges: [{ id: 'bookworm', name: 'Reader', icon: '📖', description: 'QuillHawk member', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' }]
  };

  const newRelation: FriendRelation = {
    id: `friend-${newCompanion.id}`,
    user: newCompanion,
    status: 'pending_outgoing',
    createdAt: new Date().toISOString(),
    mutualGuildsCount: 1
  };

  const updated = [newRelation, ...currentFriends];
  saveFriendsList(updated);
  return { success: true, message: `Friend request sent to ${newCompanion.username}#${newCompanion.discriminator}!`, friend: newRelation };
}

export function acceptFriendRequest(relationId: string): void {
  const list = getFriendsList();
  const found = list.find(f => f.id === relationId);
  if (found) {
    found.status = 'friend';
    saveFriendsList(list);
  }
}

export function rejectFriendRequest(relationId: string): void {
  const list = getFriendsList().filter(f => f.id !== relationId);
  saveFriendsList(list);
}

export function removeFriend(relationId: string): void {
  const list = getFriendsList().filter(f => f.id !== relationId);
  saveFriendsList(list);
}

export function blockUser(relationId: string): void {
  const list = getFriendsList();
  const found = list.find(f => f.id === relationId);
  if (found) {
    found.status = 'blocked';
    saveFriendsList(list);
  }
}

export function unblockUser(relationId: string): void {
  const list = getFriendsList().filter(f => f.id !== relationId);
  saveFriendsList(list);
}

export function getDMThreads(): DMThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THREADS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading threads:', e);
  }

  // Generate initial threads matching default companions
  const threads: DMThread[] = DEFAULT_COMPANIONS.slice(0, 3).map((companion) => {
    const threadId = `dm-thread-${companion.id.replace('companion-', '')}`;
    const msgs = DEFAULT_INITIAL_MESSAGES[threadId] || [];
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter(m => !m.read && m.senderId !== 'current-user').length;

    return {
      id: threadId,
      participant: companion,
      lastMessage: lastMsg,
      unreadCount: unread,
      updatedAt: lastMsg?.createdAt || new Date().toISOString()
    };
  });

  saveDMThreads(threads);
  return threads;
}

export function saveDMThreads(threads: DMThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent('quillhawk:threads_updated', { detail: threads }));
  } catch (e) {
    console.error('Error saving threads:', e);
  }
}

export function getThreadMessages(threadId: string): DirectMessageItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const allMsgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    if (allMsgs[threadId]) return allMsgs[threadId];
  } catch (e) {
    console.error('Error loading thread messages:', e);
  }

  const initial = DEFAULT_INITIAL_MESSAGES[threadId] || [];
  saveThreadMessages(threadId, initial);
  return initial;
}

export function saveThreadMessages(threadId: string, messages: DirectMessageItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const allMsgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    allMsgs[threadId] = messages;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMsgs));
    window.dispatchEvent(new CustomEvent('quillhawk:messages_updated', { detail: { threadId, messages } }));
  } catch (e) {
    console.error('Error saving thread messages:', e);
  }
}

export function sendMessageToThread(
  threadId: string, 
  senderId: string, 
  content: string, 
  bookShare?: BookShareAttachment | null,
  recipientProfile?: DiscordUserProfile
): DirectMessageItem {
  const currentMessages = getThreadMessages(threadId);
  const newMsg: DirectMessageItem = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    threadId,
    senderId,
    recipientId: recipientProfile?.id || 'companion-user',
    content,
    createdAt: new Date().toISOString(),
    bookShare: bookShare || null,
    reactions: {},
    read: true
  };

  const updatedMessages = [...currentMessages, newMsg];
  saveThreadMessages(threadId, updatedMessages);

  // Update thread list metadata
  const threads = getDMThreads();
  let thread = threads.find(t => t.id === threadId);
  if (thread) {
    thread.lastMessage = newMsg;
    thread.updatedAt = newMsg.createdAt;
  } else if (recipientProfile) {
    thread = {
      id: threadId,
      participant: recipientProfile,
      lastMessage: newMsg,
      unreadCount: 0,
      updatedAt: newMsg.createdAt
    };
    threads.unshift(thread);
  }
  saveDMThreads(threads);

  return newMsg;
}

export function addMessageReaction(threadId: string, messageId: string, emoji: string, userId: string): void {
  const messages = getThreadMessages(threadId);
  const msg = messages.find(m => m.id === messageId);
  if (!msg) return;

  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

  const existingIdx = msg.reactions[emoji].indexOf(userId);
  if (existingIdx >= 0) {
    msg.reactions[emoji].splice(existingIdx, 1);
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
  } else {
    msg.reactions[emoji].push(userId);
  }

  saveThreadMessages(threadId, messages);
}

export function markThreadAsRead(threadId: string): void {
  const messages = getThreadMessages(threadId);
  let changed = false;
  messages.forEach(m => {
    if (!m.read && m.senderId !== 'current-user') {
      m.read = true;
      changed = true;
    }
  });
  if (changed) saveThreadMessages(threadId, messages);

  const threads = getDMThreads();
  const thread = threads.find(t => t.id === threadId);
  if (thread && thread.unreadCount > 0) {
    thread.unreadCount = 0;
    saveDMThreads(threads);
  }
}

// Interactive companion AI simulator that creates rich context-aware replies
export function triggerCompanionSimulatedReply(
  threadId: string, 
  userText: string, 
  companion: DiscordUserProfile,
  onReplyGenerated?: (reply: DirectMessageItem) => void
): void {
  const repliesMap: Record<string, string[]> = {
    'companion-aria': [
      "That is so intriguing! 🪶 I love how QuillHawk lets us read these classics together.",
      "Totally agree! Have you added it to your Bookshelf for offline reading?",
      "That quote gave me chills! The pacing in this book is truly top-tier.",
      "I was actually just discussing this exact chapter in our Literary Guild!",
      "Awesome recommendation! Adding this right to my reading list now. 📚✨"
    ],
    'companion-arthur': [
      "Elementary observations! The plot structure here is wonderfully constructed.",
      "A classic deductive riddle. Notice how the author places subtle clues throughout.",
      "Fascinating perspective! One must always observe what is hidden in plain sight.",
      "I shall archive this discussion in our study dossiers. Excellent taste!"
    ],
    'companion-jane': [
      "How delightful! Good literature is indeed the greatest pleasure of the mind.",
      "Such eloquent thoughts! The wit and character depth here never cease to charm.",
      "I shall reflect upon your words as I sip my evening tea. 🌸"
    ],
    'companion-cyber': [
      "Neural reading index updated. 🤖 High semantic score for this analysis!",
      "Optimizing chapter digest... The narrative structure aligns with peak cyberpunk aesthetics.",
      "Data stream synchronized. Let's conquer the next tournament reading milestone together!"
    ]
  };

  const pool = repliesMap[companion.id] || [
    "Thanks for sharing! Really enjoying reading on QuillHawk with you! 🪶",
    "Great thought! Let's keep the reading streak going.",
    "Awesome! Check out the Tournament leaderboard too!"
  ];

  const randomReply = pool[Math.floor(Math.random() * pool.length)];

  // Delay simulation (1.5 - 3.5s) to feel organic with typing indicator
  setTimeout(() => {
    const replyMsg = sendMessageToThread(threadId, companion.id, randomReply, null, companion);
    if (onReplyGenerated) onReplyGenerated(replyMsg);
  }, 2200);
}

// ==========================================
// DISCORD-STYLE SERVERS & CHANNELS STORAGE ENGINE
// ==========================================

export const DEFAULT_DISCORD_SERVERS: DiscordServer[] = [
  {
    id: 'server-quillhawk-central',
    name: 'QuillHawk Central Literati',
    icon: '🏰',
    description: 'The official global community server for QuillHawk readers, writers, and book clubs.',
    ownerId: 'companion-aria',
    region: 'Global',
    genre: 'General Literature',
    bannerColor: 'from-blue-900 via-indigo-950 to-slate-900',
    createdAt: '2024-11-01T00:00:00.000Z',
    isJoined: true,
    unreadTotal: 2,
    categories: [
      {
        id: 'cat-central-info',
        serverId: 'server-quillhawk-central',
        name: '📢 Announcements & Rules',
        channelIds: ['ch-central-announcements', 'ch-central-rules']
      },
      {
        id: 'cat-central-chat',
        serverId: 'server-quillhawk-central',
        name: '💬 Main Hall',
        channelIds: ['ch-central-general', 'ch-central-recs', 'ch-central-debates']
      },
      {
        id: 'cat-central-clubs',
        serverId: 'server-quillhawk-central',
        name: '📖 Book Clubs',
        channelIds: ['ch-central-buddy-reads', 'ch-central-bot-lounge']
      },
      {
        id: 'cat-central-voice',
        serverId: 'server-quillhawk-central',
        name: '🎙️ Reading Lounges',
        channelIds: ['ch-central-quiet-room', 'ch-central-cafe-ambience']
      }
    ],
    channels: [
      {
        id: 'ch-central-announcements',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-info',
        name: 'announcements',
        type: 'announcement',
        topic: 'Official QuillHawk feature updates and global library releases'
      },
      {
        id: 'ch-central-rules',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-info',
        name: 'rules-and-guidelines',
        type: 'text',
        topic: 'Community etiquette and respectful discussion guidelines'
      },
      {
        id: 'ch-central-general',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-chat',
        name: 'general-chat',
        type: 'text',
        topic: 'Hang out and talk about books, stories, and ideas',
        unreadCount: 1
      },
      {
        id: 'ch-central-recs',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-chat',
        name: 'book-recommendations',
        type: 'text',
        topic: 'Share your favorite reads and discover new masterpieces'
      },
      {
        id: 'ch-central-debates',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-chat',
        name: 'chapter-debates',
        type: 'text',
        topic: 'In-depth plot analysis and character discussions'
      },
      {
        id: 'ch-central-buddy-reads',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-clubs',
        name: 'buddy-reads',
        type: 'book_club',
        topic: 'Group reading sprints with chapter milestones'
      },
      {
        id: 'ch-central-bot-lounge',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-clubs',
        name: 'quillbot-commands',
        type: 'text',
        topic: 'Ask /quillbot for book trivia, plot summaries, and suggestions'
      },
      {
        id: 'ch-central-quiet-room',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-voice',
        name: 'Quiet Reading Room',
        type: 'voice',
        topic: 'Muted focused reading lounge'
      },
      {
        id: 'ch-central-cafe-ambience',
        serverId: 'server-quillhawk-central',
        categoryId: 'cat-central-voice',
        name: 'Coffee Shop & Rain',
        type: 'voice',
        topic: 'Lo-Fi library ambience and study room'
      }
    ],
    members: [
      { user: DEFAULT_COMPANIONS[0], role: 'owner', joinedAt: '2024-11-01T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[1], role: 'moderator', joinedAt: '2024-11-05T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[2], role: 'vip', joinedAt: '2024-11-10T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[3], role: 'member', joinedAt: '2024-11-15T00:00:00.000Z' }
    ]
  },
  {
    id: 'server-urdu-adab',
    name: 'Bazm-e-Urdu & Adab (بزمِ اردو و ادب)',
    icon: '🇵🇰',
    description: 'اردو کلاسیکی و جدید ادب، شاعری، افسانے، اور کتب خوانی کی سب سے بڑی محفل۔',
    ownerId: 'companion-aria',
    region: 'South Asia',
    genre: 'Urdu Literature',
    bannerColor: 'from-emerald-950 via-teal-950 to-slate-950',
    createdAt: '2024-11-12T00:00:00.000Z',
    isJoined: true,
    unreadTotal: 1,
    categories: [
      {
        id: 'cat-urdu-poetry',
        serverId: 'server-urdu-adab',
        name: '📜 اردو شاعری و کلام',
        channelIds: ['ch-urdu-ghalib-iqbal', 'ch-urdu-bait-bazi', 'ch-urdu-sher-o-shayari']
      },
      {
        id: 'cat-urdu-prose',
        serverId: 'server-urdu-adab',
        name: '📚 افسانہ و ناول',
        channelIds: ['ch-urdu-manto', 'ch-urdu-novels', 'ch-urdu-peer-e-kamil']
      },
      {
        id: 'cat-urdu-audio',
        serverId: 'server-urdu-adab',
        name: '🎙️ آڈیو و مطالعہ گاہ',
        channelIds: ['ch-urdu-mushaira-hall', 'ch-urdu-study-lounge']
      }
    ],
    channels: [
      {
        id: 'ch-urdu-ghalib-iqbal',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-poetry',
        name: 'ghalib-o-iqbal-دیوان',
        type: 'text',
        topic: 'مرزا غالب، علامہ اقبال اور میر تقی میر کی شاعری پر فکری گفتگو'
      },
      {
        id: 'ch-urdu-bait-bazi',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-poetry',
        name: 'bait-bazi-بیت-بازی',
        type: 'text',
        topic: 'شعر و شاعری کی محفل اور بیت بازی کا مقابلہ'
      },
      {
        id: 'ch-urdu-sher-o-shayari',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-poetry',
        name: 'sher-o-shayari',
        type: 'text',
        topic: 'منتخب اشعار اور پسندیدہ غزلیں'
      },
      {
        id: 'ch-urdu-manto',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-prose',
        name: 'manto-afsanay-افسانے',
        type: 'text',
        topic: 'سعادت حسن منٹو، عصمت چغتائی، اور پریم چند کے شاہکار افسانے'
      },
      {
        id: 'ch-urdu-novels',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-prose',
        name: 'urdu-novels-ناولز',
        type: 'text',
        topic: 'راجہ گدھ، آگ کا دریا، بانو قدسیہ اور عبداللہ حسین کے ناولز'
      },
      {
        id: 'ch-urdu-peer-e-kamil',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-prose',
        name: 'peer-e-kamil-study',
        type: 'book_club',
        topic: 'پیرِ کامل اور عمیرہ احمد کی کتب کا مطالعہ اور تجزیہ'
      },
      {
        id: 'ch-urdu-mushaira-hall',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-audio',
        name: 'مشاعرہ ہال (Live Voice)',
        type: 'voice',
        topic: 'لائیو مشاعرہ اور تحت اللفظ کلام خوانی'
      },
      {
        id: 'ch-urdu-study-lounge',
        serverId: 'server-urdu-adab',
        categoryId: 'cat-urdu-audio',
        name: 'اردو مطالعہ گاہ',
        type: 'voice',
        topic: 'خاموش اور پرسکون مطالعہ کا کمرہ'
      }
    ],
    members: [
      { user: DEFAULT_COMPANIONS[0], role: 'owner', joinedAt: '2024-11-12T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[2], role: 'moderator', joinedAt: '2024-11-14T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[1], role: 'vip', joinedAt: '2024-11-20T00:00:00.000Z' }
    ]
  },
  {
    id: 'server-scifi',
    name: 'Speculative & Sci-Fi Syndicate',
    icon: '🌌',
    description: 'Cyberpunk, space operas, time travel, hard sci-fi, and speculative futuristic literature.',
    ownerId: 'companion-cyber',
    region: 'Global',
    genre: 'Sci-Fi',
    bannerColor: 'from-cyan-950 via-blue-950 to-slate-950',
    createdAt: '2024-12-01T00:00:00.000Z',
    isJoined: true,
    categories: [
      {
        id: 'cat-scifi-main',
        serverId: 'server-scifi',
        name: '🚀 SECTOR CHANNELS',
        channelIds: ['ch-scifi-cyberpunk', 'ch-scifi-space-operas', 'ch-scifi-dune-asimov']
      },
      {
        id: 'cat-scifi-labs',
        serverId: 'server-scifi',
        name: '🧪 WRITING LABS',
        channelIds: ['ch-scifi-worldbuilding', 'ch-scifi-ai-fiction']
      },
      {
        id: 'cat-scifi-voice',
        serverId: 'server-scifi',
        name: '🎙️ NEURAL LOUNGES',
        channelIds: ['ch-scifi-holodeck', 'ch-scifi-orbital-station']
      }
    ],
    channels: [
      {
        id: 'ch-scifi-cyberpunk',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-main',
        name: 'cyberpunk-and-ai',
        type: 'text',
        topic: 'Neuromancer, Blade Runner, and AI-driven narratives'
      },
      {
        id: 'ch-scifi-space-operas',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-main',
        name: 'space-operas-and-fleets',
        type: 'text',
        topic: 'Galactic empires, interstellar travel, and alien contact'
      },
      {
        id: 'ch-scifi-dune-asimov',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-main',
        name: 'dune-and-foundation',
        type: 'book_club',
        topic: 'Frank Herbert & Isaac Asimov masterclass analysis'
      },
      {
        id: 'ch-scifi-worldbuilding',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-labs',
        name: 'scifi-worldbuilding',
        type: 'text',
        topic: 'Tech trees, propulsion physics, and future politics'
      },
      {
        id: 'ch-scifi-ai-fiction',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-labs',
        name: 'neural-fiction',
        type: 'text',
        topic: 'Interactive narratives and algorithmic storytelling'
      },
      {
        id: 'ch-scifi-holodeck',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-voice',
        name: 'Holodeck Reading Pod',
        type: 'voice',
        topic: 'Synthesized cyber audio stream'
      },
      {
        id: 'ch-scifi-orbital-station',
        serverId: 'server-scifi',
        categoryId: 'cat-scifi-voice',
        name: 'Orbital Reading Station',
        type: 'voice',
        topic: 'Deep space ambient white noise'
      }
    ],
    members: [
      { user: DEFAULT_COMPANIONS[3], role: 'owner', joinedAt: '2024-12-01T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[0], role: 'moderator', joinedAt: '2024-12-02T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[1], role: 'vip', joinedAt: '2024-12-05T00:00:00.000Z' }
    ]
  },
  {
    id: 'server-fantasy',
    name: 'High Fantasy & Mythos Guild',
    icon: '🧙',
    description: 'Tavern tales, epic high fantasy, magic systems, dragons, and legendary sagas.',
    ownerId: 'companion-jane',
    region: 'Europe',
    genre: 'Fantasy',
    bannerColor: 'from-purple-950 via-violet-950 to-slate-950',
    createdAt: '2024-12-05T00:00:00.000Z',
    isJoined: false,
    categories: [
      {
        id: 'cat-fantasy-halls',
        serverId: 'server-fantasy',
        name: '⚔️ GUILD HALLS',
        channelIds: ['ch-fantasy-general', 'ch-fantasy-worldbuilding', 'ch-fantasy-magic-systems']
      },
      {
        id: 'cat-fantasy-voice',
        serverId: 'server-fantasy',
        name: '🎙️ TAVERN AUDIO',
        channelIds: ['ch-fantasy-tavern-fire', 'ch-fantasy-enchanted-forest']
      }
    ],
    channels: [
      {
        id: 'ch-fantasy-general',
        serverId: 'server-fantasy',
        categoryId: 'cat-fantasy-halls',
        name: 'tavern-chat',
        type: 'text',
        topic: 'Gather around the hearth and recount your favorite tales'
      },
      {
        id: 'ch-fantasy-worldbuilding',
        serverId: 'server-fantasy',
        categoryId: 'cat-fantasy-halls',
        name: 'maps-and-lore',
        type: 'text',
        topic: 'Cartography, mythical pantheons, and ancient lineages'
      },
      {
        id: 'ch-fantasy-magic-systems',
        serverId: 'server-fantasy',
        categoryId: 'cat-fantasy-halls',
        name: 'magic-systems-and-spells',
        type: 'text',
        topic: 'Hard vs soft magic systems and rune mechanics'
      },
      {
        id: 'ch-fantasy-tavern-fire',
        serverId: 'server-fantasy',
        categoryId: 'cat-fantasy-voice',
        name: 'Tavern Fireplace',
        type: 'voice',
        topic: 'Crackling fire and lute music'
      },
      {
        id: 'ch-fantasy-enchanted-forest',
        serverId: 'server-fantasy',
        categoryId: 'cat-fantasy-voice',
        name: 'Enchanted Library',
        type: 'voice',
        topic: 'Whispering tomes and calming birdsong'
      }
    ],
    members: [
      { user: DEFAULT_COMPANIONS[2], role: 'owner', joinedAt: '2024-12-05T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[0], role: 'moderator', joinedAt: '2024-12-06T00:00:00.000Z' }
    ]
  },
  {
    id: 'server-philosophy',
    name: 'Philosophy & Deep Thinkers',
    icon: '🏛️',
    description: 'Stoicism, existentialism, Eastern wisdom, ethics, and timeless intellectual classics.',
    ownerId: 'companion-arthur',
    region: 'Global',
    genre: 'Philosophy',
    bannerColor: 'from-amber-950 via-yellow-950 to-slate-950',
    createdAt: '2024-12-10T00:00:00.000Z',
    isJoined: false,
    categories: [
      {
        id: 'cat-philo-debates',
        serverId: 'server-philosophy',
        name: '🧠 THE ACADEMY',
        channelIds: ['ch-philo-stoicism', 'ch-philo-existentialism', 'ch-philo-eastern']
      },
      {
        id: 'cat-philo-voice',
        serverId: 'server-philosophy',
        name: '🎙️ SYMPOSIUMS',
        channelIds: ['ch-philo-symposium', 'ch-philo-meditation']
      }
    ],
    channels: [
      {
        id: 'ch-philo-stoicism',
        serverId: 'server-philosophy',
        categoryId: 'cat-philo-debates',
        name: 'stoicism-and-ethics',
        type: 'text',
        topic: 'Marcus Aurelius, Seneca, Epictetus, and virtue ethics'
      },
      {
        id: 'ch-philo-existentialism',
        serverId: 'server-philosophy',
        categoryId: 'cat-philo-debates',
        name: 'existentialism-and-mind',
        type: 'text',
        topic: 'Nietzsche, Camus, Sartre, and consciousness debates'
      },
      {
        id: 'ch-philo-eastern',
        serverId: 'server-philosophy',
        categoryId: 'cat-philo-debates',
        name: 'eastern-wisdom-and-tao',
        type: 'text',
        topic: 'Tao Te Ching, Upanishads, Rumi, and Zen poetry'
      },
      {
        id: 'ch-philo-symposium',
        serverId: 'server-philosophy',
        categoryId: 'cat-philo-voice',
        name: 'Plato’s Symposium',
        type: 'voice',
        topic: 'Live dialectic debates and discussions'
      },
      {
        id: 'ch-philo-meditation',
        serverId: 'server-philosophy',
        categoryId: 'cat-philo-voice',
        name: 'Zen Meditation Hall',
        type: 'voice',
        topic: 'Singing bowls and contemplative quiet'
      }
    ],
    members: [
      { user: DEFAULT_COMPANIONS[1], role: 'owner', joinedAt: '2024-12-10T00:00:00.000Z' },
      { user: DEFAULT_COMPANIONS[3], role: 'vip', joinedAt: '2024-12-11T00:00:00.000Z' }
    ]
  }
];

const DEFAULT_SERVER_MESSAGES: Record<string, ServerMessageItem[]> = {
  'ch-central-general': [
    {
      id: 'smsg-c1',
      serverId: 'server-quillhawk-central',
      channelId: 'ch-central-general',
      sender: DEFAULT_COMPANIONS[0],
      content: 'Welcome everyone to the official QuillHawk Central server! 🏰✨ You can share books, create buddy-read channels, and debate literature in real time.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      reactions: { '🪶': ['companion-aria', 'companion-arthur'], '❤️': ['companion-jane'] },
      pinned: true
    },
    {
      id: 'smsg-c2',
      serverId: 'server-quillhawk-central',
      channelId: 'ch-central-general',
      sender: DEFAULT_COMPANIONS[1],
      content: 'The new multilingual library archives are spectacular. We now have access to classical world literature and original manuscripts in one click.',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reactions: { '👏': ['companion-aria'] }
    },
    {
      id: 'smsg-c3',
      serverId: 'server-quillhawk-central',
      channelId: 'ch-central-general',
      sender: DEFAULT_COMPANIONS[2],
      content: 'I highly recommend checking out this edition of Pride and Prejudice! The AI bilingual translation engine works seamlessly in the reader.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      bookShare: {
        bookId: 'gutendex-1342',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
        description: 'A masterpiece of wit and social romance in 19th-century England.',
        fileUrl: 'https://www.gutenberg.org/ebooks/1342.epub.noimages'
      },
      reactions: { '❤️': ['companion-aria', 'companion-arthur', 'companion-cyber'] }
    }
  ],
  'ch-urdu-ghalib-iqbal': [
    {
      id: 'smsg-u1',
      serverId: 'server-urdu-adab',
      channelId: 'ch-urdu-ghalib-iqbal',
      sender: DEFAULT_COMPANIONS[0],
      content: 'خوش آمدید بزمِ اردو و ادب کے تمام احباب کو! 🇵🇰📖\nمرزا غالب فرماتے ہیں:\n\nہیں اور بھی دنیا میں سخن ور بہت اچھے\nکہتے ہیں کہ غالب کا ہے اندازِ بیاں اور',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      reactions: { '❤️': ['companion-aria', 'companion-jane'], '🪶': ['companion-arthur'] },
      pinned: true
    },
    {
      id: 'smsg-u2',
      serverId: 'server-urdu-adab',
      channelId: 'ch-urdu-ghalib-iqbal',
      sender: DEFAULT_COMPANIONS[2],
      content: 'دیوانِ غالب کا نسخہ یہاں شیئر کر رہی ہوں تاکہ سب احباب آسانی سے مطالعہ کر سکیں:',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      bookShare: {
        bookId: 'urdu-1',
        title: 'Dewan-e-Ghalib (دیوان غالب)',
        author: 'Mirza Asadullah Khan Ghalib (مرزا اسد اللہ خان غالب)',
        coverUrl: 'https://covers.openlibrary.org/b/id/12818862-M.jpg',
        description: 'The monumental masterwork of Urdu and Persian poetry by Mirza Ghalib.'
      },
      reactions: { '⭐': ['companion-aria', 'companion-cyber'] }
    }
  ],
  'ch-scifi-cyberpunk': [
    {
      id: 'smsg-s1',
      serverId: 'server-scifi',
      channelId: 'ch-scifi-cyberpunk',
      sender: DEFAULT_COMPANIONS[3],
      content: 'System boot sequence complete. 🌌 Uploading Frankenstein & speculative fiction analysis nodes. Who wants to join our weekly Cyber reading sprint?',
      createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      reactions: { '🚀': ['companion-aria'], '🤖': ['companion-cyber'] }
    }
  ]
};

// Local storage keys
const SERVERS_KEY = 'quillhawk-discord-servers';
const SERVER_MESSAGES_KEY_PREFIX = 'quillhawk-server-msgs-';

export function getDiscordServers(): DiscordServer[] {
  if (typeof window === 'undefined') return DEFAULT_DISCORD_SERVERS;
  try {
    const raw = localStorage.getItem(SERVERS_KEY);
    if (!raw) {
      localStorage.setItem(SERVERS_KEY, JSON.stringify(DEFAULT_DISCORD_SERVERS));
      return DEFAULT_DISCORD_SERVERS;
    }
    const servers: DiscordServer[] = JSON.parse(raw);
    return servers;
  } catch (e) {
    return DEFAULT_DISCORD_SERVERS;
  }
}

export function saveDiscordServers(servers: DiscordServer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
    window.dispatchEvent(new CustomEvent('quillhawk:servers_updated', { detail: servers }));
  } catch (e) {
    console.error('Error saving discord servers:', e);
  }
}

export function getDiscordServer(serverId: string): DiscordServer | undefined {
  const servers = getDiscordServers();
  return servers.find(s => s.id === serverId);
}

export function createDiscordServer(
  name: string,
  description: string,
  icon: string = '🏰',
  region: string = 'Global',
  genre: string = 'Literature',
  template: 'default' | 'book_club' | 'urdu' | 'scifi' | 'fantasy' | 'custom' = 'default',
  bannerColor: string = 'from-blue-900 via-indigo-950 to-slate-900'
): DiscordServer {
  const myProfile = getMyDiscordProfile();
  const serverId = `server-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  let categories: DiscordCategory[] = [];
  let channels: DiscordChannel[] = [];

  if (template === 'urdu') {
    const cat1Id = `cat-urdu-p-${Date.now()}`;
    const cat2Id = `cat-urdu-n-${Date.now()}`;
    const cat3Id = `cat-urdu-v-${Date.now()}`;
    const ch1Id = `ch-urdu-g-${Date.now()}`;
    const ch2Id = `ch-urdu-b-${Date.now()}`;
    const ch3Id = `ch-urdu-m-${Date.now()}`;
    const ch4Id = `ch-urdu-v1-${Date.now()}`;

    categories = [
      { id: cat1Id, serverId, name: '📜 اردو شاعری و کلام', channelIds: [ch1Id, ch2Id] },
      { id: cat2Id, serverId, name: '📚 افسانہ و ناول', channelIds: [ch3Id] },
      { id: cat3Id, serverId, name: '🎙️ آڈیو و مطالعہ گاہ', channelIds: [ch4Id] }
    ];
    channels = [
      { id: ch1Id, serverId, categoryId: cat1Id, name: 'ghalib-o-iqbal', type: 'text', topic: 'غالب و اقبال پر گفتگو' },
      { id: ch2Id, serverId, categoryId: cat1Id, name: 'bait-bazi-بیت-بازی', type: 'text', topic: 'بیت بازی' },
      { id: ch3Id, serverId, categoryId: cat2Id, name: 'manto-afsanay', type: 'text', topic: 'افسانے' },
      { id: ch4Id, serverId, categoryId: cat3Id, name: 'اردو مطالعہ گاہ', type: 'voice', topic: 'مطالعہ روم' }
    ];
  } else if (template === 'book_club') {
    const cat1Id = `cat-bc-info-${Date.now()}`;
    const cat2Id = `cat-bc-chat-${Date.now()}`;
    const cat3Id = `cat-bc-voice-${Date.now()}`;
    const ch1Id = `ch-bc-ann-${Date.now()}`;
    const ch2Id = `ch-bc-gen-${Date.now()}`;
    const ch3Id = `ch-bc-chaps-${Date.now()}`;
    const ch4Id = `ch-bc-v-${Date.now()}`;

    categories = [
      { id: cat1Id, serverId, name: '📢 CLUB INFO', channelIds: [ch1Id] },
      { id: cat2Id, serverId, name: '💬 DISCUSSIONS', channelIds: [ch2Id, ch3Id] },
      { id: cat3Id, serverId, name: '🎙️ LIVE SESSIONS', channelIds: [ch4Id] }
    ];
    channels = [
      { id: ch1Id, serverId, categoryId: cat1Id, name: 'reading-schedule', type: 'announcement', topic: 'Weekly chapters to read' },
      { id: ch2Id, serverId, categoryId: cat2Id, name: 'general-chat', type: 'text', topic: 'Book club general hangout' },
      { id: ch3Id, serverId, categoryId: cat2Id, name: 'chapter-reactions', type: 'book_club', topic: 'Post your spoiler-tagged thoughts' },
      { id: ch4Id, serverId, categoryId: cat3Id, name: 'Live Book Club Call', type: 'voice', topic: 'Sunday discussion audio room' }
    ];
  } else {
    const cat1Id = `cat-gen-info-${Date.now()}`;
    const cat2Id = `cat-gen-chat-${Date.now()}`;
    const cat3Id = `cat-gen-voice-${Date.now()}`;
    const ch1Id = `ch-gen-ann-${Date.now()}`;
    const ch2Id = `ch-gen-chat-${Date.now()}`;
    const ch3Id = `ch-gen-recs-${Date.now()}`;
    const ch4Id = `ch-gen-voice-${Date.now()}`;

    categories = [
      { id: cat1Id, serverId, name: '📢 INFORMATION', channelIds: [ch1Id] },
      { id: cat2Id, serverId, name: '💬 TEXT CHANNELS', channelIds: [ch2Id, ch3Id] },
      { id: cat3Id, serverId, name: '🎙️ VOICE & READING', channelIds: [ch4Id] }
    ];
    channels = [
      { id: ch1Id, serverId, categoryId: cat1Id, name: 'announcements', type: 'announcement', topic: 'Server updates' },
      { id: ch2Id, serverId, categoryId: cat2Id, name: 'general', type: 'text', topic: 'General conversation' },
      { id: ch3Id, serverId, categoryId: cat2Id, name: 'book-recommendations', type: 'text', topic: 'Share what you are reading' },
      { id: ch4Id, serverId, categoryId: cat3Id, name: 'Study & Reading Lounge', type: 'voice', topic: 'Ambient reading space' }
    ];
  }

  const newServer: DiscordServer = {
    id: serverId,
    name,
    icon,
    description,
    ownerId: myProfile.id,
    region,
    genre,
    bannerColor,
    createdAt: new Date().toISOString(),
    categories,
    channels,
    members: [
      { user: myProfile, role: 'owner', joinedAt: new Date().toISOString() },
      { user: DEFAULT_COMPANIONS[0], role: 'moderator', joinedAt: new Date().toISOString() }
    ],
    isJoined: true
  };

  const servers = getDiscordServers();
  const updated = [newServer, ...servers];
  saveDiscordServers(updated);

  // Send a welcome message in the first text channel
  const firstTextChannel = channels.find(c => c.type === 'text' || c.type === 'announcement') || channels[0];
  if (firstTextChannel) {
    sendServerMessage(
      serverId,
      firstTextChannel.id,
      `🎉 Welcome to **${name}**! This server has been created for ${genre} discussions. Start chatting and invite fellow readers!`
    );
  }

  return newServer;
}

export function joinDiscordServer(serverId: string): void {
  const servers = getDiscordServers();
  const myProfile = getMyDiscordProfile();
  const server = servers.find(s => s.id === serverId);

  if (server) {
    server.isJoined = true;
    if (!server.members.some(m => m.user.id === myProfile.id)) {
      server.members.push({
        user: myProfile,
        role: 'member',
        joinedAt: new Date().toISOString()
      });
    }
    saveDiscordServers(servers);
  }
}

export function leaveDiscordServer(serverId: string): void {
  const servers = getDiscordServers();
  const myProfile = getMyDiscordProfile();
  const server = servers.find(s => s.id === serverId);

  if (server) {
    server.isJoined = false;
    server.members = server.members.filter(m => m.user.id !== myProfile.id);
    saveDiscordServers(servers);
  }
}

export function createServerChannel(
  serverId: string,
  categoryId: string,
  name: string,
  type: ChannelType = 'text',
  topic: string = ''
): DiscordChannel | null {
  const servers = getDiscordServers();
  const server = servers.find(s => s.id === serverId);
  if (!server) return null;

  const cleanName = name.toLowerCase().trim().replace(/\s+/g, '-');
  const channelId = `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newChannel: DiscordChannel = {
    id: channelId,
    serverId,
    categoryId,
    name: cleanName,
    type,
    topic
  };

  server.channels.push(newChannel);
  
  const category = server.categories.find(c => c.id === categoryId);
  if (category) {
    category.channelIds.push(channelId);
  }

  saveDiscordServers(servers);
  return newChannel;
}

export function deleteServerChannel(serverId: string, channelId: string): void {
  const servers = getDiscordServers();
  const server = servers.find(s => s.id === serverId);
  if (!server) return;

  server.channels = server.channels.filter(c => c.id !== channelId);
  server.categories.forEach(cat => {
    cat.channelIds = cat.channelIds.filter(id => id !== channelId);
  });

  saveDiscordServers(servers);
}

export function getServerMessages(serverId: string, channelId: string): ServerMessageItem[] {
  if (typeof window === 'undefined') return DEFAULT_SERVER_MESSAGES[channelId] || [];
  try {
    const raw = localStorage.getItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`);
    if (!raw) {
      const defaultMsgs = DEFAULT_SERVER_MESSAGES[channelId] || [];
      if (defaultMsgs.length > 0) {
        localStorage.setItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`, JSON.stringify(defaultMsgs));
      }
      return defaultMsgs;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SERVER_MESSAGES[channelId] || [];
  }
}

export function sendServerMessage(
  serverId: string,
  channelId: string,
  content: string,
  bookShare?: BookShareAttachment | null,
  replyTo?: { id: string; senderName: string; content: string }
): ServerMessageItem {
  const myProfile = getMyDiscordProfile();
  const msgId = `smsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newMsg: ServerMessageItem = {
    id: msgId,
    serverId,
    channelId,
    sender: myProfile,
    content,
    createdAt: new Date().toISOString(),
    bookShare: bookShare || null,
    reactions: {},
    replyTo
  };

  const msgs = getServerMessages(serverId, channelId);
  const updated = [...msgs, newMsg];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('quillhawk:channel_messages_updated', {
        detail: { serverId, channelId, messages: updated }
      }));
    } catch (e) {
      console.error('Error saving channel message:', e);
    }
  }

  // Check if message mentions /quillbot or bot
  if (content.toLowerCase().includes('/quillbot') || content.toLowerCase().includes('@quillbot') || content.toLowerCase().includes('quillbot')) {
    triggerQuillBotChannelReply(serverId, channelId, content);
  }

  return newMsg;
}

export function addServerMessageReaction(
  serverId: string,
  channelId: string,
  messageId: string,
  emoji: string
): void {
  const msgs = getServerMessages(serverId, channelId);
  const msg = msgs.find(m => m.id === messageId);
  if (!msg) return;

  const myId = getMyDiscordProfile().id;
  if (!msg.reactions) msg.reactions = {};

  const currentUsers = msg.reactions[emoji] || [];
  if (currentUsers.includes(myId)) {
    // toggle off
    msg.reactions[emoji] = currentUsers.filter(id => id !== myId);
    if (msg.reactions[emoji].length === 0) {
      delete msg.reactions[emoji];
    }
  } else {
    // add
    msg.reactions[emoji] = [...currentUsers, myId];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`, JSON.stringify(msgs));
      window.dispatchEvent(new CustomEvent('quillhawk:channel_messages_updated', {
        detail: { serverId, channelId, messages: msgs }
      }));
    } catch (e) {}
  }
}

export function pinServerMessage(serverId: string, channelId: string, messageId: string): void {
  const msgs = getServerMessages(serverId, channelId);
  const msg = msgs.find(m => m.id === messageId);
  if (!msg) return;

  msg.pinned = !msg.pinned;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`, JSON.stringify(msgs));
      window.dispatchEvent(new CustomEvent('quillhawk:channel_messages_updated', {
        detail: { serverId, channelId, messages: msgs }
      }));
    } catch (e) {}
  }
}

export function triggerQuillBotChannelReply(
  serverId: string,
  channelId: string,
  userPrompt: string
): void {
  const botProfile: DiscordUserProfile = {
    id: 'quillbot-ai',
    username: 'quillbot',
    discriminator: '0001',
    displayName: 'QuillBot AI',
    avatar_url: '🤖',
    banner_color: 'from-blue-600 via-indigo-700 to-purple-800',
    bio: 'QuillHawk Official AI Literary Companion. Ask me about any author, plot synopsis, or book analysis!',
    presence: 'online',
    member_since: 'Nov 2024',
    premium_status: true,
    level: 99,
    xp: 9999,
    badges: [
      { id: 'bot', name: 'Verified Bot', icon: '🤖', description: 'Official QuillHawk Automated Intelligence', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' }
    ]
  };

  const lower = userPrompt.toLowerCase();
  let botReply = "Hello! I am **QuillBot** 🤖, your AI reading companion on QuillHawk. You can search over millions of free books in the Global Catalog or ask me about literary classics!";

  if (lower.includes('ghalib') || lower.includes('غالب')) {
    botReply = "🪶 **Mirza Asadullah Khan Ghalib (1797–1869)** is one of the most celebrated Urdu and Persian poets. His *Dewan-e-Ghalib* explores philosophical depth, existential longing, and profound wordplay. You can read the original Urdu text directly in the QuillHawk Reader!";
  } else if (lower.includes('iqbal') || lower.includes('اقبال')) {
    botReply = "🦅 **Allama Muhammad Iqbal (1877–1938)**, the *Shair-e-Mashriq* (Poet of the East), infused Urdu and Persian literature with themes of selfhood (*Khudi*), perseverance, and spiritual revival in works like *Bang-e-Dra* and *Zarb-e-Kaleem*.";
  } else if (lower.includes('recommend') || lower.includes('book')) {
    botReply = "📚 Here are top recommendations available right now:\n1. **Pride and Prejudice** by Jane Austen (Classic Romance)\n2. **Frankenstein** by Mary Shelley (Gothic Sci-Fi)\n3. **Peer-e-Kamil** by Umera Ahmed (Urdu Contemporary Masterpiece)\n4. **Don Quijote** by Miguel de Cervantes (Epic Adventure)";
  }

  setTimeout(() => {
    const msgs = getServerMessages(serverId, channelId);
    const botMsg: ServerMessageItem = {
      id: `smsg-bot-${Date.now()}`,
      serverId,
      channelId,
      sender: botProfile,
      content: botReply,
      createdAt: new Date().toISOString(),
      reactions: { '🤖': ['quillbot-ai'] }
    };
    const updated = [...msgs, botMsg];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${SERVER_MESSAGES_KEY_PREFIX}${channelId}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('quillhawk:channel_messages_updated', {
          detail: { serverId, channelId, messages: updated }
        }));
      } catch (e) {}
    }
  }, 1600);
}

export function updateServerTheme(serverId: string, bannerColor: string): DiscordServer | null {
  const servers = getDiscordServers();
  const index = servers.findIndex(s => s.id === serverId);
  if (index === -1) return null;
  servers[index].bannerColor = bannerColor;
  servers[index].themeColor = bannerColor;
  saveDiscordServers(servers);
  return servers[index];
}

export function updateChannelTheme(serverId: string, channelId: string, themeColor: string): DiscordChannel | null {
  const servers = getDiscordServers();
  const serverIndex = servers.findIndex(s => s.id === serverId);
  if (serverIndex === -1) return null;
  const chIndex = servers[serverIndex].channels.findIndex(c => c.id === channelId);
  if (chIndex === -1) return null;
  servers[serverIndex].channels[chIndex].themeColor = themeColor;
  saveDiscordServers(servers);
  return servers[serverIndex].channels[chIndex];
}


