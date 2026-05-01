'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { BookOpen } from 'lucide-react';

export default function PublishPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFile) return alert('Book file is required');
    
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('You must be logged in to publish a book');

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
        is_premium: false, // user published books are free by default
      });

      if (error) throw error;

      setMessage('Book published successfully! Others can now read it.');
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
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Publish Your Own Book</h1>
        <p className="text-muted">Share your stories, novels, and knowledge with the ReadSphere community.</p>
      </div>

      <Card className="border-gray-800 bg-surface/50 backdrop-blur">
        <CardContent className="pt-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Book Title" 
                placeholder="e.g. My Amazing Story"
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
              <Input 
                label="Author Name" 
                placeholder="e.g. John Doe"
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2 p-4 border border-dashed border-gray-700 rounded-xl bg-background/50">
              <label className="text-sm font-medium">Cover Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
              />
            </div>

            <div className="space-y-2 p-4 border border-dashed border-primary/50 rounded-xl bg-primary/5">
              <label className="text-sm font-medium text-primary">Book File (EPUB or PDF)</label>
              <input 
                type="file" 
                accept=".pdf,.epub" 
                onChange={e => setBookFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg font-medium text-center ${message.includes('Error') ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
              {loading ? 'Publishing to ReadSphere...' : 'Publish Book Now'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
