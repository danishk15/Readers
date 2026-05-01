import { createClient } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch book details
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) {
    return (
      <div className="p-6 text-center text-error bg-error/10 rounded-xl">
        Book not found or failed to load.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Cover */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 relative">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted">No Cover</div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-6">
          <div>
            {book.is_premium && (
              <span className="inline-block px-2 py-1 mb-3 text-xs font-bold bg-warning text-black rounded uppercase tracking-wider">
                Premium Content
              </span>
            )}
            <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
            <p className="text-xl text-muted mt-2">{book.author}</p>
          </div>

          <div className="flex gap-4 border-y border-gray-800 py-6">
            <div className="flex-1 text-center border-r border-gray-800">
              <p className="text-muted text-sm">Rating</p>
              <p className="font-semibold mt-1">4.8 / 5</p>
            </div>
            <div className="flex-1 text-center border-r border-gray-800">
              <p className="text-muted text-sm">Pages</p>
              <p className="font-semibold mt-1">320</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-muted text-sm">Language</p>
              <p className="font-semibold mt-1">English</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button size="lg" className="w-full md:w-auto px-12 text-lg">
              <a href={`/reader/${book.id}`}>Start Reading</a>
            </Button>
            <p className="text-xs text-muted">
              {book.is_premium ? 'Requires premium subscription or 500 XP to read offline.' : 'Free to read online.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
