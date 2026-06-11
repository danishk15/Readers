import { createClient, CLASSIC_BOOKS } from '@/utils/supabase/server';
import LibraryBrowser from '@/components/ui/LibraryBrowser';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  let books: any[] = [];
  let userId = '';

  try {
    const supabase = await createClient();
    
    // Get current user for progress tracking in reader
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || '';

    // Fetch books from Supabase (Step 22)
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      books = data;
    } else {
      books = CLASSIC_BOOKS;
    }
  } catch (err) {
    console.error('Error in LibraryPage:', err);
    books = CLASSIC_BOOKS;
  }

  return (
    <LibraryBrowser initialBooks={books} userId={userId} />
  );
}
