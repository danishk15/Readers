'use client';

import React, { useState, useEffect } from 'react';
import { FriendRelation, DiscordUserProfile, UserPresenceStatus } from '@/types/social';
import { 
  getFriendsList, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  blockUser, 
  unblockUser,
  DEFAULT_COMPANIONS 
} from '@/utils/socialStorage';
import { UserProfileModal } from '@/components/social/UserProfileModal';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageSquare, 
  MoreVertical, 
  Check, 
  X, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  BookOpen,
  UserX,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

type FriendsTab = 'online' | 'all' | 'pending' | 'blocked' | 'add';

export function FriendsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FriendsTab>('online');
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<DiscordUserProfile | null>(null);

  useEffect(() => {
    setFriends(getFriendsList());

    const handleFriendsUpdate = (e: CustomEvent<FriendRelation[]>) => {
      if (e.detail) setFriends(e.detail);
    };
    window.addEventListener('quillhawk:friends_updated' as any, handleFriendsUpdate);
    return () => window.removeEventListener('quillhawk:friends_updated' as any, handleFriendsUpdate);
  }, []);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendInput.trim()) return;

    const result = sendFriendRequest(addFriendInput);
    setAddFeedback(result);
    if (result.success) {
      setAddFriendInput('');
      setFriends(getFriendsList());
    }
  };

  const handleQuickAddCompanion = (companion: DiscordUserProfile) => {
    const fullTag = `${companion.username}#${companion.discriminator}`;
    const result = sendFriendRequest(fullTag);
    setAddFeedback(result);
    setFriends(getFriendsList());
  };

  const handleStartDM = (userId: string) => {
    const cleanId = userId.replace('companion-', '').replace('user-', '');
    router.push(`/messages?threadId=dm-thread-${cleanId}`);
  };

  // Filtered lists
  const onlineFriends = friends.filter(f => f.status === 'friend' && f.user.presence !== 'offline');
  const allFriends = friends.filter(f => f.status === 'friend');
  const pendingRequests = friends.filter(f => f.status === 'pending_incoming' || f.status === 'pending_outgoing');
  const blockedUsers = friends.filter(f => f.status === 'blocked');

  const getFilteredList = () => {
    let list: FriendRelation[] = [];
    if (activeTab === 'online') list = onlineFriends;
    else if (activeTab === 'all') list = allFriends;
    else if (activeTab === 'pending') list = pendingRequests;
    else if (activeTab === 'blocked') list = blockedUsers;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(f => 
      f.user.displayName.toLowerCase().includes(q) ||
      f.user.username.toLowerCase().includes(q) ||
      `${f.user.username}#${f.user.discriminator}`.toLowerCase().includes(q)
    );
  };

  const getPresenceColor = (presence: UserPresenceStatus) => {
    switch (presence) {
      case 'online': return 'bg-emerald-500 ring-emerald-500/30';
      case 'idle': return 'bg-amber-500 ring-amber-500/30';
      case 'dnd': return 'bg-rose-500 ring-rose-500/30';
      default: return 'bg-slate-500 ring-slate-500/30';
    }
  };

  const currentList = getFilteredList();

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#070D1F]/90 backdrop-blur-md rounded-3xl border border-card-border shadow-2xl overflow-hidden animate-fade-in">
      {/* Discord Top Navigation Bar */}
      <div className="h-16 border-b border-card-border px-6 flex items-center justify-between gap-4 flex-shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-800 text-white font-extrabold text-sm shrink-0">
            <Users className="w-5 h-5 text-primary" />
            <span>Friends</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setActiveTab('online'); setAddFeedback(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'online' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Online</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 rounded-full font-mono text-emerald-400 font-bold">{onlineFriends.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('all'); setAddFeedback(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 rounded-full font-mono text-slate-400">{allFriends.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('pending'); setAddFeedback(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pending</span>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-primary text-white rounded-full font-mono font-bold animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('blocked'); setAddFeedback(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'blocked' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Blocked</span>
            </button>

            <button
              onClick={() => { setActiveTab('add'); setAddFeedback(null); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                activeTab === 'add' 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                  : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* ADD FRIEND TAB */}
        {activeTab === 'add' ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">ADD FRIEND</h2>
              <p className="text-xs text-slate-400">
                You can add friends with their QuillHawk Tag. It&apos;s case-sensitive! (e.g. <span className="text-primary font-mono font-bold">aria#1001</span> or <span className="text-primary font-mono font-bold">@arthur_conan</span>)
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendRequest} className="relative">
              <div className="bg-slate-950/80 border-2 border-slate-800 focus-within:border-emerald-500 rounded-2xl p-2 flex items-center gap-3 transition-colors shadow-inner">
                <input
                  type="text"
                  placeholder="Enter a username#tag or @username"
                  value={addFriendInput}
                  onChange={(e) => setAddFriendInput(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none font-medium"
                />
                <Button
                  type="submit"
                  disabled={!addFriendInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Send Friend Request
                </Button>
              </div>

              {addFeedback && (
                <div className={`mt-3 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  addFeedback.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {addFeedback.success ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{addFeedback.message}</span>
                </div>
              )}
            </form>

            {/* Suggested Literary Companions Shelf */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Suggested QuillHawk Companions
                </h3>
                <span className="text-[10px] text-slate-500">Instant Connect</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEFAULT_COMPANIONS.map((comp) => {
                  const isAlreadyFriend = friends.some(f => f.user.username === comp.username && f.status === 'friend');
                  return (
                    <div 
                      key={comp.id}
                      className="bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-slate-700">
                          {comp.avatar_url}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{comp.displayName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">@{comp.username}#{comp.discriminator}</p>
                          <p className="text-[9px] text-emerald-400 truncate mt-0.5">{comp.status_text}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={isAlreadyFriend}
                        onClick={() => handleQuickAddCompanion(comp)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl shrink-0 ${
                          isAlreadyFriend 
                            ? 'bg-slate-800 text-slate-500 cursor-default' 
                            : 'bg-primary hover:bg-primary/90 text-white shadow'
                        }`}
                      >
                        {isAlreadyFriend ? '✓ Added' : '➕ Add'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ONLINE, ALL, PENDING, BLOCKED LIST VIEW */
          <div className="space-y-6">
            {/* Search Filter Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search friends by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* List Heading */}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeTab === 'online' && `ONLINE — ${currentList.length}`}
              {activeTab === 'all' && `ALL FRIENDS — ${currentList.length}`}
              {activeTab === 'pending' && `PENDING REQUESTS — ${currentList.length}`}
              {activeTab === 'blocked' && `BLOCKED USERS — ${currentList.length}`}
            </div>

            {/* Friends Cards */}
            {currentList.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-850 rounded-3xl bg-slate-950/30 space-y-3">
                <Users className="w-10 h-10 text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-slate-400">No one is around here yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {activeTab === 'online' ? "None of your friends are online right now." : "Connect with fellow readers to share books and discuss chapters!"}
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('add')}
                  className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-xl mt-2"
                >
                  Add a Friend
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentList.map((relation) => {
                  const friend = relation.user;
                  return (
                    <div
                      key={relation.id}
                      className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 p-3 md:p-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
                    >
                      {/* Left: Avatar, Name & Activity */}
                      <div 
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer"
                        onClick={() => setSelectedUserForModal(friend)}
                      >
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shadow overflow-hidden">
                            {['🪶', '🦅', '📚', '🌌', '🕵️', '🧙', '💻', '🐉'].includes(friend.avatar_url || '') ? (
                              <span>{friend.avatar_url}</span>
                            ) : friend.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={friend.avatar_url} alt={friend.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-white">{friend.displayName.charAt(0)}</span>
                            )}
                          </div>
                          {/* Presence Dot */}
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#070D1F] ring-2 ${getPresenceColor(friend.presence)}`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-primary transition-colors truncate">
                              {friend.displayName}
                            </h4>
                            <span className="text-xs font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              #{friend.discriminator}
                            </span>
                            {friend.premium_status && <span className="text-xs">👑</span>}
                          </div>

                          {/* Status / Currently Reading */}
                          {friend.currently_reading ? (
                            <p className="text-xs text-blue-400 font-medium truncate flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
                              <span>Reading <strong className="font-bold">{friend.currently_reading.title}</strong> ({friend.currently_reading.progressPercent}%)</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 truncate">
                              {friend.status_text || 'Active on QuillHawk'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {relation.status === 'friend' && (
                          <>
                            <button
                              onClick={() => handleStartDM(friend.id)}
                              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-primary text-slate-300 hover:text-white flex items-center justify-center transition-all shadow"
                              title="Send Direct Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedUserForModal(friend)}
                              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                              title="View Profile"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {relation.status === 'pending_incoming' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                acceptFriendRequest(relation.id);
                                setFriends(getFriendsList());
                              }}
                              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20"
                              title="Accept Friend Request"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                rejectFriendRequest(relation.id);
                                setFriends(getFriendsList());
                              }}
                              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                              title="Decline Friend Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {relation.status === 'pending_outgoing' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              Pending Request
                            </span>
                            <button
                              onClick={() => {
                                rejectFriendRequest(relation.id);
                                setFriends(getFriendsList());
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                              title="Cancel Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {relation.status === 'blocked' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              unblockUser(relation.id);
                              setFriends(getFriendsList());
                            }}
                            className="text-xs font-bold text-slate-300"
                          >
                            Unblock
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile Modal Popout */}
      {selectedUserForModal && (
        <UserProfileModal
          user={selectedUserForModal}
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onStartDM={(userId) => {
            setSelectedUserForModal(null);
            handleStartDM(userId);
          }}
          friendStatus="friend"
        />
      )}
    </div>
  );
}
