import { createClient } from '@/utils/supabase/server';
import Reader from '@/components/ui/Reader';
import BookComments from '@/components/ui/BookComments';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function ReaderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch book details (will auto-resolve classic books through our Supabase interceptor)
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-error/10 border border-error/20 rounded-2xl space-y-4 my-16 backdrop-blur-md">
        <div className="mx-auto w-12 h-12 bg-error/20 rounded-full flex items-center justify-center text-error">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-error">Book Unavailable</h2>
        <p className="text-slate-400 text-sm">
          We couldn't retrieve the contents for this book. It may have been unpublished or removed.
        </p>
        <Link href="/dashboard" passHref legacyBehavior>
          <Button className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Check premium access
  if (book.is_premium) {
    // Need to fetch user profile to check premium status
    const { data: profile } = await supabase.from('users').select('premium_status').eq('id', user.id).single();
    if (!profile?.premium_status) {
      return (
        <div className="max-w-xl mx-auto p-12 text-center flex flex-col items-center gap-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-warning/30 rounded-3xl my-16 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)]">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-warning to-amber-500"></div>
          <div className="w-16 h-16 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shadow-lg border border-warning/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Premium Content Locked</h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              This high-end title is reserved for ReadSphere Premium members or readers who complete the 500-minute Weekly Quest.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
            <Link href="/premium" passHref legacyBehavior>
              <Button className="px-8 py-3 bg-gradient-to-r from-warning to-amber-500 text-black font-extrabold rounded-xl hover:from-warning/90 hover:to-amber-500/90 shadow-lg shadow-warning/20 transform hover:scale-[1.02] active:scale-95 transition-all">
                Unlock Instantly
              </Button>
            </Link>
            <Link href="/dashboard" passHref legacyBehavior>
              <Button variant="secondary" className="px-8 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white transition-colors">
                Back to Library
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12 animate-in fade-in duration-500">
      {/* Header back link */}
      <div className="max-w-5xl mx-auto w-full">
        <Link href={`/book/${book.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Book Details</span>
        </Link>
      </div>

      <div className="h-[calc(100vh-8rem)] w-full relative">
        <Reader bookUrl={book.file_url} bookId={book.id} userId={user.id} title={book.title} />
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <BookComments bookId={book.id} />
      </div>
    </div>
  );
}
