'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  content: string;
  created_at: string;
  users: { username: string; avatar_url: string; email: string };
}

export default function CommunityChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<{id: string, name: string}[]>([]);
  const [community, setCommunity] = useState<{name: string} | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch community info
      const { data: comm } = await supabase.from('communities').select('name').eq('id', params.id).single();
      if (comm) setCommunity(comm);

      // Fetch channels
      const { data: chs } = await supabase.from('channels').select('id, name').eq('community_id', params.id);
      if (chs && chs.length > 0) {
        setChannels(chs);
        setChannelId(chs[0].id); // default to first channel (usually general)
      }
    };
    init();
  }, [params.id]);

  useEffect(() => {
    if (!channelId) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select(`id, content, created_at, users(username, avatar_url, email)`)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data as any[]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`room:${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, payload => {
        // Fetch the user info for the new message
        supabase.from('users').select('username, avatar_url, email').eq('id', payload.new.user_id).single().then(({ data: user }) => {
          setMessages(prev => [...prev, { ...payload.new, users: user } as any]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId || !userId) return;

    const content = newMessage;
    setNewMessage('');

    await supabase.from('messages').insert({
      channel_id: channelId,
      user_id: userId,
      content,
    });
  };

  return (
    <div className="flex h-full border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      {/* Channels Sidebar */}
      <div className="w-60 bg-surface border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 shadow-sm z-10 font-bold flex items-center h-14">
          {community?.name || 'Loading...'}
        </div>
        <div className="flex-1 overflow-y-auto p-3 gap-1 flex flex-col">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 ml-2">Text Channels</p>
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setChannelId(ch.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${channelId === ch.id ? 'bg-gray-800 text-foreground' : 'text-muted hover:bg-gray-800/50 hover:text-foreground'}`}
            >
              <span className="text-gray-500 text-lg">#</span> {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        <div className="h-14 border-b border-gray-800 flex items-center px-4 shadow-sm z-10 flex-shrink-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-gray-500 text-xl">#</span> 
            {channels.find(c => c.id === channelId)?.name || 'general'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <span className="text-4xl mb-4">💬</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80">
                  {msg.users?.username?.charAt(0) || msg.users?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-foreground hover:underline cursor-pointer">{msg.users?.username || 'User'}</span>
                    <span className="text-xs text-muted">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-foreground mt-1 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 pt-2 bg-background flex-shrink-0">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message #${channels.find(c => c.id === channelId)?.name || 'general'}`}
              className="w-full bg-surface border border-gray-700 rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
