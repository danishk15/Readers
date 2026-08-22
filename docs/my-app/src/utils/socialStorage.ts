import { 
  DiscordUserProfile, 
  FriendRelation, 
  DirectMessageItem, 
  DMThread, 
  UserPresenceStatus,
  BookShareAttachment 
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
    banner_color: 'from-blue-900 via-indigo-950 to-slate-900',
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
