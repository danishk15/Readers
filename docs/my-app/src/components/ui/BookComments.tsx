'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { MessageSquare, Send, Sparkles, User as UserIcon } from 'lucide-react';

interface CommentType {
  id: string;
  created_at: string;
  content: string;
  book_id?: string;
  user_id?: string;
  username?: string;
  users?: {
    email?: string;
    username?: string;
    avatar_url?: string;
  } | null;
}

export default function BookComments({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select('*, users(email, username, avatar_url)')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });
      
      if (data && Array.isArray(data)) {
        setComments(data as CommentType[]);
      }
    } catch (err) {
      console.warn('Error fetching book comments:', err);
    }
  }, [bookId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newComment.trim();
    if (!cleanText) return;
    
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      
      const authorName = currentUser?.user_metadata?.username || 
        currentUser?.user_metadata?.full_name || 
        currentUser?.email?.split('@')[0] || 
        'Reader';

      const commentPayload: CommentType = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cmt-${Date.now()}`,
        book_id: bookId,
        user_id: currentUser?.id || 'guest-reader',
        content: cleanText,
        username: authorName,
        created_at: new Date().toISOString(),
        users: {
          email: currentUser?.email || 'reader@quillhawk.app',
          username: authorName,
          avatar_url: currentUser?.user_metadata?.avatar_url || '📚'
        }
      };

      // Optimistic local update
      setComments(prev => [commentPayload, ...prev]);
      setNewComment('');

      await supabase.from('comments').insert({
        id: commentPayload.id,
        book_id: bookId,
        user_id: commentPayload.user_id,
        content: cleanText,
        created_at: commentPayload.created_at
      });

      await fetchComments();
    } catch (err) {
      console.warn('Failed to post comment online:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-slate-950/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Reader Discussion</h3>
            <p className="text-xs text-slate-400">Share your analysis, favorite quotes, and chapter thoughts</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-indigo-300">
          {comments.length} {comments.length === 1 ? 'Thought' : 'Thoughts'}
        </span>
      </div>
      
      <form onSubmit={handlePostComment} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What did you think of this book or chapter?"
          className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        <Button 
          type="submit" 
          disabled={loading || !newComment.trim()}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          {loading ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post</span>
            </>
          )}
        </Button>
      </form>

      <div className="space-y-3.5 pt-2">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const author = comment.username || comment.users?.username || comment.users?.email?.split('@')[0] || 'Passionate Reader';
            const avatar = comment.users?.avatar_url || '📖';

            return (
              <div 
                key={comment.id} 
                className="p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl border border-slate-800/60 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-sm">
                      {avatar.length <= 2 ? avatar : <UserIcon className="w-3.5 h-3.5 text-indigo-300" />}
                    </div>
                    <span className="font-semibold text-sm text-indigo-300">
                      {author}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed pl-9">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 space-y-2 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
            <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">No reader comments yet.</p>
            <p className="text-slate-600 text-xs">Be the first to share your thoughts on this authentic classic edition!</p>
          </div>
        )}
      </div>
    </div>
  );
}
