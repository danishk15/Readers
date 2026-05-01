import { createClient } from '@/utils/supabase/server';
import Reader from '@/components/ui/Reader';
import { redirect } from 'next/navigation';

export default async function ReaderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch book details
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) {
    return <div className="p-6 text-center text-error">Book not found or failed to load.</div>;
  }

  // Check premium access
  if (book.is_premium) {
    // Need to fetch user profile to check premium status
    const { data: profile } = await supabase.from('users').select('premium_status').eq('id', user.id).single();
    if (!profile?.premium_status) {
      return (
        <div className="p-12 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-warning">Premium Content Locked</h2>
          <p className="text-muted">You need a premium subscription or enough reading milestones to access this book.</p>
          <a href="/premium" className="px-6 py-2 bg-warning text-black font-semibold rounded-md hover:bg-warning/80 transition">Upgrade to Premium</a>
        </div>
      );
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] w-full">
      <Reader bookUrl={book.file_url} bookId={book.id} userId={user.id} />
    </div>
  );
}
