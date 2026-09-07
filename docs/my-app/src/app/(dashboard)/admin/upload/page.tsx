'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminUploadPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role;
        if (role === 'admin') {
          setIsAdmin(true);
          return;
        }

        // Also check role in public.users table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert('Unauthorized: Admin access required.');
    if (!bookFile) return alert('Book file is required');
    
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      // 1. Upload Cover (if exists)
      let coverUrl = '';
      if (coverFile) {
        const coverPath = `covers/${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        coverUrl = await uploadFile('books_media', coverPath, coverFile);
      }

      // 2. Upload Book File
      const bookPath = `files/${Date.now()}_${bookFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fileUrl = await uploadFile('books_media', bookPath, bookFile);

      // 3. Insert into Database
      const { error } = await supabase.from('books').insert({
        title: title.trim(),
        author: author.trim(),
        cover_url: coverUrl,
        file_url: fileUrl,
        is_premium: isPremium,
      });

      if (error) throw error;

      setMessage('Book uploaded successfully!');
      setTitle('');
      setAuthor('');
      setCoverFile(null);
      setBookFile(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Error: An unknown error occurred during upload.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center p-12 text-muted">
        <span className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
        Verifying admin authorization...
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 text-center bg-rose-950/20 border border-rose-800/40 rounded-3xl space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-slate-400">
          This portal is reserved for administrators only. If you believe this is an error, please contact your workspace owner.
        </p>
        <Link href="/dashboard" className="inline-block">
          <Button variant="secondary" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admin: Upload Official Book</h1>
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Verified</span>
        </span>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <Input 
              label="Book Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <Input 
              label="Author Name" 
              value={author} 
              onChange={e => setAuthor(e.target.value)} 
              required 
            />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cover Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-surface file:text-foreground hover:file:bg-gray-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Book File (PDF/EPUB)</label>
              <input 
                type="file" 
                accept=".pdf,.epub" 
                onChange={e => setBookFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-surface file:text-foreground hover:file:bg-gray-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="premium" 
                checked={isPremium} 
                onChange={e => setIsPremium(e.target.checked)} 
                className="rounded border-gray-700 bg-surface text-primary focus:ring-primary"
              />
              <label htmlFor="premium" className="text-sm">Premium Book (Requires Subscription or Milestone)</label>
            </div>

            {message && (
              <div className={`p-3 rounded text-sm ${message.includes('Error') ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Uploading...' : 'Upload Book'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
