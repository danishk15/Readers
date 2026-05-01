'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function BookComments({ bookId }: { bookId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, users(email)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    
    if (data) setComments(data);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('comments').insert({
        book_id: bookId,
        user_id: user.id,
        content: newComment.trim()
      });
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-surface/50 p-6 rounded-xl border border-gray-800">
      <h3 className="text-xl font-bold mb-6 text-foreground">Community Comments</h3>
      
      <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What do you think about this book?"
          className="flex-1 bg-background border border-gray-700 rounded-md px-4 py-2 text-foreground focus:outline-none focus:border-primary"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-background/50 rounded-lg border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-primary">
                  {comment.users?.email?.split('@')[0] || 'Anonymous Reader'}
                </span>
                <span className="text-xs text-muted">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-300">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-muted text-sm text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
