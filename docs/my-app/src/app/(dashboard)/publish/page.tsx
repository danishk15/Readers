'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/utils/supabase/upload';
import { saveRawBookOffline } from '@/utils/offlineStorage';
import { BookOpen, Plus, Trash2, Edit3, Upload, FileText, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: string;
  chapter: string;
  text: string;
}

export default function PublishPage() {
  const [publishMode, setPublishMode] = useState<'write' | 'upload'>('write');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('ur');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Multi-Chapter State
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', chapter: 'باب اول: آغازِ داستان (Chapter 1: The Beginning)', text: '' }
  ]);

  // List of existing published books
  const [myPublishedBooks, setMyPublishedBooks] = useState<any[]>([]);

  const languages = [
    { code: 'ur', label: '🇵🇰 Urdu (اردو)' },
    { code: 'en', label: '🇬🇧 English' },
    { code: 'ar', label: '🇸🇦 Arabic (العربية)' },
    { code: 'fa', label: '🇮🇷 Persian (فارسی)' },
    { code: 'hi', label: '🇮🇳 Hindi (हिन्दी)' },
    { code: 'es', label: '🇪🇸 Spanish (Español)' },
    { code: 'fr', label: '🇫🇷 French (Français)' },
    { code: 'de', label: '🇩🇪 German (Deutsch)' },
    { code: 'ru', label: '🇷🇺 Russian (Русский)' },
    { code: 'zh', label: '🇨🇳 Chinese (中文)' },
    { code: 'ja', label: '🇯🇵 Japanese (日本語)' },
    { code: 'pt', label: '🇧🇷 Portuguese (Português)' },
    { code: 'it', label: '🇮🇹 Italian (Italiano)' },
    { code: 'tr', label: '🇹🇷 Turkish (Türkçe)' },
    { code: 'bn', label: '🇧🇩 Bengali (বাংলা)' },
    { code: 'pa', label: '🇵🇰 Punjabi (پنجابی / ਪੰਜਾਬੀ)' }
  ];

  // Load published books from localStorage
  const loadPublishedBooks = () => {
    try {
      const local = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      setMyPublishedBooks(local);
    } catch {}
  };

  useEffect(() => {
    loadPublishedBooks();
  }, []);

  // Handle Cover File Change
  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview('');
    }
  };

  // Auto-parse text/markdown file if uploaded
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBookFile(file);

    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      try {
        const text = await file.text();
        // Split by chapter markers or headings if found
        const chapterBlocks = text.split(/(?=^#{1,3}\s+|^Chapter\s+\d+|^باب\s+|^\d+\.\s+)/gmi).filter(b => b.trim().length > 0);
        
        if (chapterBlocks.length > 1) {
          const parsed = chapterBlocks.map((blk, idx) => {
            const lines = blk.trim().split('\n');
            const chTitle = lines[0].replace(/^#{1,3}\s+/, '').trim() || `Chapter ${idx + 1}`;
            const chText = lines.slice(1).join('\n').trim();
            return {
              id: String(idx + 1),
              chapter: chTitle,
              text: chText || blk.trim()
            };
          });
          setChapters(parsed);
          setPublishMode('write');
          setMessage(`Parsed ${parsed.length} chapters from ${file.name}!`);
        } else {
          setChapters([
            { id: '1', chapter: file.name.replace(/\.[^/.]+$/, ''), text: text }
          ]);
          setPublishMode('write');
          setMessage(`Loaded full text from ${file.name}!`);
        }
      } catch (err) {
        console.warn('Text parsing failed:', err);
      }
    }
  };

  const handleAddChapter = () => {
    const nextIdx = chapters.length + 1;
    setChapters(prev => [
      ...prev,
      {
        id: String(Date.now()),
        chapter: language === 'ur' ? `باب ${nextIdx}: نیا باب (Chapter ${nextIdx})` : `Chapter ${nextIdx}: New Chapter`,
        text: ''
      }
    ]);
  };

  const handleRemoveChapter = (id: string) => {
    if (chapters.length <= 1) return;
    setChapters(prev => prev.filter(ch => ch.id !== id));
  };

  const handleChapterTitleChange = (id: string, newTitle: string) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, chapter: newTitle } : ch));
  };

  const handleChapterTextChange = (id: string, newText: string) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, text: newText } : ch));
  };

  const handleEditBook = (book: any) => {
    setEditingBookId(book.id);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setDescription(book.description || '');
    setLanguage(book.language || 'ur');
    setCoverPreview(book.cover_url || '');
    
    if (book.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
      setChapters(book.chapters.map((c: any, i: number) => ({
        id: String(i + 1),
        chapter: c.chapter || `Chapter ${i + 1}`,
        text: c.text || ''
      })));
      setPublishMode('write');
    } else {
      setChapters([
        { id: '1', chapter: 'باب اول (Chapter 1)', text: book.description || '' }
      ]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBook = (id: string) => {
    if (!confirm('Are you sure you want to delete this published book?')) return;
    try {
      const current = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      const updated = current.filter((b: any) => b.id !== id);
      localStorage.setItem('local-published-books', JSON.stringify(updated));
      const cleanList = updated.map((b: any) => ({ ...b, cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '') }));
      document.cookie = "local-published-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";
      loadPublishedBooks();
      setMessage('Book deleted successfully.');
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return alert('Book title is required');
    if (!author.trim()) return alert('Author name is required');
    
    // Check if chapters have text in write mode
    if (publishMode === 'write') {
      const hasContent = chapters.some(c => c.text.trim().length > 0);
      if (!hasContent) {
        return alert('Please write some content or text in at least one chapter.');
      }
    } else if (!bookFile && !editingBookId) {
      return alert('Please upload a book file (EPUB, PDF, or TXT).');
    }

    setLoading(true);
    setMessage('');

    try {
      const bookId = editingBookId || `published-${Date.now()}`;
      
      const formattedChapters = chapters.map((c, i) => ({
        chapter: c.chapter.trim() || `Chapter ${i + 1}`,
        text: c.text.trim()
      }));

      let coverUrl = coverPreview;
      let fileUrl = '';

      // Try uploading to Supabase if client/user exists
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          if (coverFile) {
            const coverPath = `covers/${Date.now()}_${coverFile.name}`;
            coverUrl = await uploadFile('books_media', coverPath, coverFile);
          }
          if (bookFile) {
            const bookPath = `files/${Date.now()}_${bookFile.name}`;
            fileUrl = await uploadFile('books_media', bookPath, bookFile);
          }

          let insertData: any = {
            id: bookId,
            title: title.trim(),
            author: author.trim(),
            description: description.trim() || `Authentic literary work by ${author.trim()}.`,
            cover_url: coverUrl,
            file_url: fileUrl,
            is_premium: false,
            language: language,
            chapters: formattedChapters
          };

          const { error } = await supabase.from('books').upsert(insertData);
          if (error) console.warn('Supabase publish warning:', error);
        }
      } catch (cloudErr) {
        console.warn('Cloud database sync offline, saving to local shelf:', cloudErr);
      }

      // Save locally to localStorage, IndexedDB, and cookies
      const localBookData = {
        id: bookId,
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || `Authentic literary work by ${author.trim()}.`,
        cover_url: coverUrl,
        file_url: fileUrl,
        is_premium: false,
        language: language,
        chapters: formattedChapters,
        created_at: new Date().toISOString()
      };

      // Save to IndexedDB if file uploaded
      if (bookFile) {
        try {
          await saveRawBookOffline(bookId, title.trim(), author.trim(), coverUrl, '', bookFile);
        } catch {}
      }

      const currentLocal = JSON.parse(localStorage.getItem('local-published-books') || '[]');
      let updatedLocal = [];
      if (editingBookId) {
        updatedLocal = currentLocal.map((b: any) => b.id === editingBookId ? localBookData : b);
      } else {
        updatedLocal = [localBookData, ...currentLocal.filter((b: any) => b.id !== bookId)];
      }

      localStorage.setItem('local-published-books', JSON.stringify(updatedLocal));
      
      const cleanList = updatedLocal.map((b: any) => ({
        ...b,
        cover_url: b.cover_url?.startsWith('data:') ? '' : (b.cover_url || '')
      }));
      document.cookie = "local-published-books=" + encodeURIComponent(JSON.stringify(cleanList)) + "; path=/; max-age=31536000";

      setMessage(editingBookId ? 'Book chapters and content updated successfully! ✨' : '🎉 Book published successfully! All chapters are live and ready to read in the Reader!');
      
      // Reset form if new
      if (!editingBookId) {
        setTitle('');
        setAuthor('');
        setDescription('');
        setCoverFile(null);
        setCoverPreview('');
        setBookFile(null);
        setChapters([{ id: '1', chapter: 'باب اول: آغازِ داستان (Chapter 1)', text: '' }]);
      }
      setEditingBookId(null);
      loadPublishedBooks();
    } catch (err: any) {
      setMessage(`Error: ${err?.message || 'Failed to save book'}`);
    } finally {
      setLoading(false);
    }
  };

  const isRtl = language === 'ur' || language === 'ar' || language === 'fa';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <span>{editingBookId ? 'Edit Book & Chapters' : 'Publish a Masterpiece'}</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Write multi-chapter novels, stories, or upload manuscripts with instant full-text reader support.
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex bg-slate-900/80 p-1 border border-slate-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setPublishMode('write')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              publishMode === 'write' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write Chapters Directly</span>
          </button>
          <button
            type="button"
            onClick={() => setPublishMode('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              publishMode === 'upload' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (EPUB/PDF/TXT)</span>
          </button>
        </div>
      </div>

      {/* Main Publishing Form */}
      <Card className="border-slate-800/80 bg-surface/50 backdrop-blur-md shadow-2xl overflow-hidden relative">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Book Title (کتاب کا نام / عنوان)" 
                placeholder="e.g. داستانِ دل / My Amazing Journey"
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
              <Input 
                label="Author Name (مصنف کا نام)" 
                placeholder="e.g. عمیرہ احمد / Jane Austen"
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Book Language (زبان)</label>
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-800 transition-colors h-11"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description / Summary (خلاصہ)</label>
                <input 
                  type="text"
                  placeholder="e.g. A thrilling novel exploring courage, devotion, and destiny..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary transition-colors h-11"
                />
              </div>
            </div>

            {/* Cover Image Upload & Preview */}
            <div className="p-4 border border-dashed border-slate-700 rounded-2xl bg-slate-950/30 flex flex-col md:flex-row items-center gap-4">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-20 h-28 object-cover rounded-xl border border-slate-700 shadow-md shrink-0" />
              ) : (
                <div className="w-20 h-28 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 space-y-1.5 text-center md:text-left">
                <label className="text-sm font-bold text-slate-200">Cover Image (اختیاری سرورق)</label>
                <p className="text-xs text-slate-500">Upload a JPG, PNG, or WebP cover image for your book.</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => handleCoverChange(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer pt-1"
                />
              </div>
            </div>

            {/* MODE 1: DIRECT MULTI-CHAPTER AUTHORING */}
            {publishMode === 'write' ? (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Book Chapters ({chapters.length})</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Total Words: {chapters.reduce((acc, c) => acc + (c.text.trim().split(/\s+/).filter(Boolean).length), 0)}
                    </span>
                  </div>

                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAddChapter}
                    className="text-xs font-bold gap-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Chapter</span>
                  </Button>
                </div>

                {/* Chapter Cards List */}
                <div className="space-y-6">
                  {chapters.map((ch, idx) => (
                    <div 
                      key={ch.id} 
                      className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3 shadow-md relative group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs font-black text-slate-500 font-mono w-6 text-center">{idx + 1}</span>
                          <input 
                            type="text" 
                            value={ch.chapter}
                            onChange={e => handleChapterTitleChange(ch.id, e.target.value)}
                            placeholder={`Chapter ${idx + 1} Title`}
                            dir={isRtl ? 'rtl' : 'ltr'}
                            className={`flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-bold text-slate-100 focus:outline-none focus:border-primary ${isRtl ? 'font-serif text-right' : ''}`}
                          />
                        </div>

                        {chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(ch.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                            title="Remove Chapter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Chapter Body Textarea */}
                      <div className="space-y-1">
                        <textarea 
                          value={ch.text}
                          onChange={e => handleChapterTextChange(ch.id, e.target.value)}
                          placeholder={isRtl ? "یہاں اس باب کی مکمل کہانی، ناول کا متن یا کلام تحریر کریں..." : "Write or paste the full chapter narrative, dialogue, or story text here..."}
                          rows={8}
                          dir={isRtl ? 'rtl' : 'ltr'}
                          className={`w-full bg-slate-900/60 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-primary transition-all resize-y leading-relaxed ${isRtl ? 'font-serif text-right leading-loose text-base' : ''}`}
                        />
                        <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 font-mono">
                          <span>Characters: {ch.text.length}</span>
                          <span>Words: {ch.text.trim().split(/\s+/).filter(Boolean).length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAddChapter}
                    className="font-bold text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Chapter / باب شامل کریں</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* MODE 2: FILE UPLOAD (EPUB / PDF / TXT / MD) */
              <div className="space-y-4 pt-2">
                <div className="p-6 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 text-center space-y-3">
                  <Upload className="w-8 h-8 text-primary mx-auto" />
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-primary block">Select Book Manuscript (EPUB, PDF, TXT, MD)</label>
                    <p className="text-xs text-slate-400">If you upload a .txt or .md file, it will automatically parse your chapters!</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,.epub,.txt,.md" 
                    onChange={handleFileUpload}
                    className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer pt-2"
                  />
                  {bookFile && (
                    <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selected: {bookFile.name} ({(bookFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-xl font-medium text-center text-xs md:text-sm ${message.includes('Error') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full py-6 text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95"
            >
              {loading ? 'Publishing Book Content...' : (editingBookId ? 'Save & Update Book Chapters' : '🚀 Publish Book to QuillHawk Library')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List of User's Published Books */}
      {myPublishedBooks.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚 Your Published Bookshelf ({myPublishedBooks.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Available for Reading & Offline Study</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPublishedBooks.map((book: any) => {
              const chCount = book.chapters?.length || 0;
              return (
                <div 
                  key={book.id}
                  className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 flex gap-4 items-center justify-between shadow-lg group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-14 h-20 object-cover rounded-xl border border-slate-800 shadow shrink-0" />
                    ) : (
                      <div className="w-14 h-20 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-extrabold text-white truncate text-sm">{book.title}</h3>
                      <p className="text-xs text-slate-400 truncate">{book.author}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-md uppercase">
                          {book.language ? book.language.toUpperCase() : 'UR'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {chCount > 0 ? `${chCount} Chapters` : 'Standard Edition'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/reader/${book.id}`} passHref legacyBehavior>
                      <Button size="sm" className="text-xs font-bold gap-1 bg-primary hover:bg-primary/90 text-white">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition-colors text-xs flex items-center gap-1"
                        title="Edit chapters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors text-xs"
                        title="Delete book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
