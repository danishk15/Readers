import { createClient } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function LibraryPage() {
  const supabase = await createClient();
  
  // Fetch books from Supabase (Step 22)
  const { data: books, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted text-sm mt-1">Discover new books to read and unlock.</p>
        </div>
        <Button variant="secondary" size="sm">Filter</Button>
      </div>

      {error ? (
        <div className="p-4 bg-error/10 text-error rounded-md text-sm">Failed to load books: {error.message}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books && books.length > 0 ? (
            books.map((book) => (
              <Card key={book.id} className="group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="aspect-[2/3] w-full bg-gray-800 relative">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted text-xs">No Cover</div>
                  )}
                  {book.is_premium && (
                    <div className="absolute top-2 right-2 bg-warning text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      PREMIUM
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{book.title}</h3>
                  <p className="text-xs text-muted truncate mt-1">{book.author}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-800 rounded-xl">
              <p>No books available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
