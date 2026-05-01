'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';

export default function AdminUploadPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) return alert('Book file is required');
    
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      // 1. Upload Cover (if exists)
      let coverUrl = '';
      if (coverFile) {
        const coverPath = `covers/${Date.now()}_${coverFile.name}`;
        coverUrl = await uploadFile('books_media', coverPath, coverFile);
      }

      // 2. Upload Book File
      const bookPath = `files/${Date.now()}_${bookFile.name}`;
      const fileUrl = await uploadFile('books_media', bookPath, bookFile);

      // 3. Insert into Database
      const { error } = await supabase.from('books').insert({
        title,
        author,
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
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin: Upload Book</h1>
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
