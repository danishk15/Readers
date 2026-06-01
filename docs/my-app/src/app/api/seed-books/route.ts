import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if books are already seeded to prevent duplication
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('id, title');

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Could not connect to database table "books". Make sure public.books table exists in your Supabase database.',
        error: fetchError.message
      }, { status: 500 });
    }

    const defaultBooks = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover_url: 'https://covers.openlibrary.org/b/id/8447146-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/64317.epub.images',
        is_premium: false
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/1342.epub.images',
        is_premium: false
      },
      {
        title: 'Frankenstein',
        author: 'Mary Shelley',
        cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/84.epub.images',
        is_premium: true
      },
      {
        title: 'Moby Dick',
        author: 'Herman Melville',
        cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2701.epub.images',
        is_premium: false
      },
      {
        title: 'Dracula',
        author: 'Bram Stoker',
        cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/345.epub.images',
        is_premium: true
      }
    ];

    // Filter out books that already exist by checking title matching
    const booksToInsert = defaultBooks.filter(dbBook => 
      !existingBooks?.some(eb => eb.title.toLowerCase() === dbBook.title.toLowerCase())
    );

    if (booksToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Database is already seeded with standard starter books!',
        total_books: existingBooks.length
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('books')
      .insert(booksToInsert)
      .select();

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to insert starter books into books table.',
        error: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with ${booksToInsert.length} new starter books!`,
      inserted_books: inserted
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Unknown error occurred while seeding database.',
      error: error.message 
    }, { status: 500 });
  }
}
