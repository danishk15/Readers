import { createClient } from '@/utils/supabase/server';
import LibraryBrowser from '@/components/ui/LibraryBrowser';

export default async function LibraryPage() {
  const supabase = await createClient();
  
  // Get current user for progress tracking in reader
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch books from Supabase (Step 22)
  const { data: books, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4 bg-error/10 text-error rounded-md text-sm">Failed to load books: {error.message}</div>;
  }

  return (
    <LibraryBrowser initialBooks={books || []} userId={user?.id || ''} />
  );
}
