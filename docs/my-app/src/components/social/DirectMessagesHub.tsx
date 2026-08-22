'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DMThread, DirectMessageItem, DiscordUserProfile, BookShareAttachment } from '@/types/social';
import { 
  getDMThreads, 
  getThreadMessages, 
  sendMessageToThread, 
  addMessageReaction, 
  markThreadAsRead, 
  triggerCompanionSimulatedReply, 
  getMyDiscordProfile 
} from '@/utils/socialStorage';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  BookOpen, 
  Phone, 
  Video, 
  Pin, 
  Users, 
  Search, 
  Sparkles, 
  X, 
  Heart, 
  Flame, 
  Check, 
  ExternalLink,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export function DirectMessagesHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get('threadId');

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<DiscordUserProfile | null>(null);
  const [isBookShareModalOpen, setIsBookShareModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myProfile = getMyDiscordProfile();

  // Load threads on mount
  useEffect(() => {
    const loadedThreads = getDMThreads();
    setThreads(loadedThreads);

    if (initialThreadId && loadedThreads.some(t => t.id === initialThreadId)) {
      setActiveThreadId(initialThreadId);
    } else if (loadedThreads.length > 0) {
      setActiveThreadId(loadedThreads[0].id);
    }

    const handleThreadsUpdate = (e: CustomEvent<DMThread[]>) => {
      if (e.detail) setThreads(e.detail);
    };
    const handleMessagesUpdate = (e: CustomEvent<{ threadId: string; messages: DirectMessageItem[] }>) => {
      if (e.detail && e.detail.threadId === activeThreadId) {
        setMessages(e.detail.messages);
      }
    };

    window.addEventListener('quillhawk:threads_updated' as any, handleThreadsUpdate);
    window.addEventListener('quillhawk:messages_updated' as any, handleMessagesUpdate);

    return () => {
      window.removeEventListener('quillhawk:threads_updated' as any, handleThreadsUpdate);
      window.removeEventListener('quillhawk:messages_updated' as any, handleMessagesUpdate);
    };
  }, [initialThreadId]);

  // Load messages when activeThreadId changes
  useEffect(() => {
    if (!activeThreadId) return;

    const msgs = getThreadMessages(activeThreadId);
    setMessages(msgs);
    markThreadAsRead(activeThreadId);

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeCompanion = activeThread?.participant;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThreadId || !activeCompanion) return;

    const text = messageInput.trim();
    setMessageInput('');

    const newMsg = sendMessageToThread(activeThreadId, 'current-user', text, null, activeCompanion);
    setMessages(prev => [...prev, newMsg]);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Trigger companion simulated reply
    setIsTyping(true);
    triggerCompanionSimulatedReply(activeThreadId, text, activeCompanion, (reply) => {
      setIsTyping(false);
      setMessages(prev => [...prev, reply]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
  };

  const handleShareBook = (book: BookShareAttachment) => {
    if (!activeThreadId || !activeCompanion) return;

    const newMsg = sendMessageToThread(
      activeThreadId, 
      'current-user', 
      `Check out this book from our QuillHawk library: "${book.title}"! 🪶✨`, 
      book, 
      activeCompanion
    );
    setMessages(prev => [...prev, newMsg]);
    setIsBookShareModalOpen(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Trigger companion reply to book share
    setIsTyping(true);
    triggerCompanionSimulatedReply(activeThreadId, `Book shared: ${book.title}`, activeCompanion, (reply) => {
      setIsTyping(false);
      setMessages(prev => [...prev, reply]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!activeThreadId) return;
    addMessageReaction(activeThreadId, msgId, emoji, 'current-user');
    setMessages(getThreadMessages(activeThreadId));
    setShowEmojiPicker(null);
  };

  const getPresenceColor = (presence?: string) => {
    switch (presence) {
      case 'online': return 'bg-emerald-500 ring-emerald-500/30';
      case 'idle': return 'bg-amber-500 ring-amber-500/30';
      case 'dnd': return 'bg-rose-500 ring-rose-500/30';
      default: return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const SAMPLE_BOOKS_TO_SHARE: BookShareAttachment[] = [
    {
      bookId: 'gutendex-1342',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
      description: 'A romantic clash of pride and prejudice in 19th-century England.',
      source: 'Project Gutenberg',
      fileUrl: 'https://www.gutenberg.org/ebooks/1342.epub.noimages'
    },
    {
      bookId: 'gutendex-84',
      title: 'Frankenstein',
      author: 'Mary Wollstonecraft Shelley',
      coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
      description: 'The gothic masterpiece of Victor Frankenstein and his tragic creation.',
      source: 'Project Gutenberg',
      fileUrl: 'https://www.gutenberg.org/ebooks/84.epub.noimages'
    },
    {
      bookId: 'gutendex-1661',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
      description: 'Iconic detective tales featuring Sherlock Holmes and Dr. John Watson.',
      source: 'Project Gutenberg',
      fileUrl: 'https://www.gutenberg.org/ebooks/1661.epub.noimages'
    },
    {
      bookId: 'gutendex-36',
      title: 'The War of the Worlds',
      author: 'H. G. Wells',
      coverUrl: 'https://www.gutenberg.org/cache/epub/36/pg36.cover.medium.jpg',
      description: 'Pioneering sci-fi invasion story in Victorian Britain.',
      source: 'Project Gutenberg',
      fileUrl: 'https://www.gutenberg.org/ebooks/36.epub.noimages'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex bg-[#070D1F]/90 backdrop-blur-md rounded-3xl border border-card-border shadow-2xl overflow-hidden animate-fade-in">
      {/* Discord Left DM Sidebar */}
      <div className="w-64 md:w-72 border-r border-card-border flex flex-col flex-shrink-0 bg-[#050917]/80">
        {/* Friends Hub Jump Button */}
        <div className="p-4 border-b border-card-border">
          <Link
            href="/friends"
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-800/80 shadow"
          >
            <Users className="w-4 h-4 text-primary" />
            <span>Friends Hub</span>
          </Link>
        </div>

        {/* Direct Messages List Header */}
        <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Direct Messages</span>
          <Link href="/friends" className="hover:text-white transition-colors" title="Add New DM">
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* DM Threads List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {threads.map((thread) => {
            const isSelected = thread.id === activeThreadId;
            const p = thread.participant;
            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-800/90 text-white shadow border border-slate-700/80' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                {/* Avatar with status */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl border border-slate-700 shadow overflow-hidden">
                    {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(p.avatar_url || '') ? (
                      <span>{p.avatar_url}</span>
                    ) : (
                      <span className="font-bold text-white text-sm">{p.displayName.charAt(0)}</span>
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#070D1F] ring-2 ${getPresenceColor(p.presence)}`} />
                </div>

                {/* Info & Last message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {p.displayName}
                    </h4>
                    {thread.unreadCount > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-white font-black animate-pulse">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {thread.lastMessage?.content || p.status_text || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discord Right Chat Screen */}
      <div className="flex-1 flex flex-col bg-[#070D1F]/60 overflow-hidden relative">
        {activeCompanion ? (
          <>
            {/* Top Chat Header */}
            <div className="h-16 border-b border-card-border px-6 flex items-center justify-between flex-shrink-0 bg-slate-950/40 backdrop-blur-sm">
              {/* User Info */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setSelectedUserForModal(activeCompanion)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl border border-slate-700 shadow overflow-hidden">
                    {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(activeCompanion.avatar_url || '') ? (
                      <span>{activeCompanion.avatar_url}</span>
                    ) : (
                      <span className="font-bold text-white text-sm">{activeCompanion.displayName.charAt(0)}</span>
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#070D1F] ring-2 ${getPresenceColor(activeCompanion.presence)}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white hover:text-primary transition-colors">{activeCompanion.displayName}</h3>
                    <span className="text-[10px] font-mono text-slate-500">#{activeCompanion.discriminator}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs">
                    {activeCompanion.currently_reading ? `Reading ${activeCompanion.currently_reading.title}` : (activeCompanion.status_text || 'Active')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCallActive(!isCallActive)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    isCallActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Voice Call Simulation"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsBookShareModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-blue-300 hover:text-white border border-primary/30 font-bold text-xs flex items-center gap-1.5 shadow"
                  title="Share a Book"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Book</span>
                </button>

                <button
                  onClick={() => setSelectedUserForModal(activeCompanion)}
                  className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold"
                  title="View Discord Profile"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice Call Active Banner (Discord Vibe) */}
            {isCallActive && (
              <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Voice Connected • QuillHawk Reading Room</div>
                    <div className="text-[9px] text-emerald-500 font-mono">24kHz Audio • Low Latency</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCallMuted(!callMuted)}
                    className={`p-1.5 rounded-lg text-xs font-bold ${callMuted ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-300'}`}
                  >
                    {callMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setIsCallActive(false)}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Thread Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Start of conversation hero banner */}
              <div className="text-center py-8 space-y-2 border-b border-slate-800/60 pb-8">
                <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-3xl border-2 border-slate-700 shadow-xl">
                  {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(activeCompanion.avatar_url || '') ? (
                    <span>{activeCompanion.avatar_url}</span>
                  ) : (
                    <span className="font-bold text-white">{activeCompanion.displayName.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white">{activeCompanion.displayName}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  This is the start of your direct message history with <strong className="text-slate-200">@{activeCompanion.username}#{activeCompanion.discriminator}</strong>.
                </p>
              </div>

              {/* Messages List */}
              {messages.map((msg) => {
                const isMe = msg.senderId === 'current-user';
                const senderName = isMe ? myProfile.displayName : activeCompanion.displayName;
                const senderAvatar = isMe ? myProfile.avatar_url : activeCompanion.avatar_url;
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={msg.id}
                    className={`group relative flex gap-4 p-2 rounded-2xl transition-colors hover:bg-slate-900/40`}
                  >
                    {/* Sender Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-slate-700 shadow overflow-hidden">
                      {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(senderAvatar || '') ? (
                        <span>{senderAvatar}</span>
                      ) : (
                        <span className="font-bold text-white text-sm">{senderName.charAt(0)}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{senderName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{timeStr}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed break-words">{msg.content}</p>

                      {/* Embedded Book Share Card */}
                      {msg.bookShare && (
                        <div className="mt-3 max-w-md bg-[#050917] border border-blue-500/30 rounded-2xl p-4 flex gap-4 items-center shadow-lg">
                          {msg.bookShare.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={msg.bookShare.coverUrl} 
                              alt={msg.bookShare.title} 
                              className="w-14 h-20 object-cover rounded shadow border border-slate-800 shrink-0" 
                            />
                          ) : (
                            <div className="w-14 h-20 bg-slate-900 rounded flex items-center justify-center text-slate-600 shrink-0">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                              Shared Literary Work
                            </span>
                            <h4 className="text-xs font-bold text-white truncate">{msg.bookShare.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{msg.bookShare.author}</p>
                            <p className="text-[9px] text-slate-500 line-clamp-2">{msg.bookShare.description}</p>
                            
                            <Link
                              href="/dashboard"
                              className="inline-flex items-center gap-1 text-[10px] font-black text-primary hover:text-sky-300 pt-1"
                            >
                              <span>Read on Bookshelf</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Reaction Badges */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-lg border text-xs flex items-center gap-1 font-bold transition-all ${
                                users.includes('current-user')
                                  ? 'bg-primary/20 border-primary text-blue-300'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px] font-mono">{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hover Reaction Toolbar */}
                    <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl px-2 py-1 shadow-lg backdrop-blur-sm">
                      {['❤️', '🪶', '🔥', '📚', '👏', '🚀'].map((em) => (
                        <button
                          key={em}
                          onClick={() => handleToggleReaction(msg.id, em)}
                          className="hover:scale-125 transition-transform text-sm p-1"
                          title={`React with ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Active typing animation */}
              {isTyping && (
                <div className="flex items-center gap-3 text-xs text-slate-400 italic px-2 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                  <span>{activeCompanion.displayName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Input Bar */}
            <div className="p-4 border-t border-card-border bg-slate-950/40">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="bg-slate-950/80 border border-slate-800 focus-within:border-primary/80 rounded-2xl p-2 flex items-center gap-2 shadow-inner">
                  {/* Share Book Button */}
                  <button
                    type="button"
                    onClick={() => setIsBookShareModalOpen(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-900 transition-colors"
                    title="Share a Book in Chat"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message @${activeCompanion.displayName}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-medium"
                  />

                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs p-2.5 rounded-xl transition-all shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-700" />
            <h3 className="text-base font-bold text-slate-400">Select a conversation</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Choose a friend from the left sidebar or visit the Friends Hub to start reading and chatting together!
            </p>
            <Link href="/friends">
              <Button size="sm" className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-xl mt-2">
                Open Friends Hub
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* User Profile Popout Modal */}
      {selectedUserForModal && (
        <UserProfileModal
          user={selectedUserForModal}
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          friendStatus="friend"
        />
      )}

      {/* Book Share Selection Modal */}
      {isBookShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070D1F] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Share a Book to Direct Message</span>
              </div>
              <button 
                onClick={() => setIsBookShareModalOpen(false)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {SAMPLE_BOOKS_TO_SHARE.map((book) => (
                <div 
                  key={book.bookId}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow border border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-10 h-14 bg-slate-950 rounded flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleShareBook(book)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0"
                  >
                    Share
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
