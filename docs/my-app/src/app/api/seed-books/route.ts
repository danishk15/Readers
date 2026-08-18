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
        file_url: 'https://www.gutenberg.org/ebooks/64317.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        cover_url: 'https://covers.openlibrary.org/b/id/8259441-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Frankenstein',
        author: 'Mary Shelley',
        cover_url: 'https://covers.openlibrary.org/b/id/8302146-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/84.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Moby Dick',
        author: 'Herman Melville',
        cover_url: 'https://covers.openlibrary.org/b/id/8258641-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Dracula',
        author: 'Bram Stoker',
        cover_url: 'https://covers.openlibrary.org/b/id/8261341-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/345.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Don Quijote',
        author: 'Miguel de Cervantes Saavedra',
        cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2000.epub.noimages',
        is_premium: false,
        language: 'es'
      },
      {
        title: 'Le Tour du monde en quatre-vingts jours',
        author: 'Jules Verne',
        cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/800.epub.noimages',
        is_premium: false,
        language: 'fr'
      },
      {
        title: 'Faust: Eine Tragödie',
        author: 'Johann Wolfgang von Goethe',
        cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2229.epub.noimages',
        is_premium: false,
        language: 'de'
      },
      {
        title: 'Bagh-o-Bahar',
        author: 'Mir Amman',
        cover_url: 'https://www.gutenberg.org/cache/epub/70864/pg70864.cover.medium.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/70864.epub.noimages',
        is_premium: false,
        language: 'ur'
      },
      {
        title: 'Dewan-e-Ghalib',
        author: 'Mirza Asadullah Khan Ghalib',
        cover_url: 'https://www.gutenberg.org/cache/epub/72237/pg72237.cover.medium.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/72237.epub.noimages',
        is_premium: false,
        language: 'ur'
      },
      {
        title: 'Fasana-e-Azad',
        author: 'Ratan Nath Dhar Sarshar',
        cover_url: 'https://www.gutenberg.org/cache/epub/71708/pg71708.cover.medium.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/71708.epub.noimages',
        is_premium: false,
        language: 'ur'
      },
      {
        title: 'Qissa Hatim Tai',
        author: 'Traditional',
        cover_url: 'https://www.gutenberg.org/cache/epub/71434/pg71434.cover.medium.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/71434.epub.noimages',
        is_premium: false,
        language: 'ur'
      },
      {
        title: 'Intikhab-e-Kalam-e-Mir',
        author: 'Mir Taqi Mir',
        cover_url: 'https://www.gutenberg.org/cache/epub/72111/pg72111.cover.medium.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/72111.epub.noimages',
        is_premium: false,
        language: 'ur'
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

    let insertError: any = null;
    let inserted: any = null;

    try {
      const res = await supabase
        .from('books')
        .insert(booksToInsert)
        .select();
      inserted = res.data;
      insertError = res.error;
      
      if (insertError && insertError.message?.includes('column "language" of relation "books" does not exist')) {
        console.warn('Language column does not exist on Supabase, retrying insert without language field...');
        const cleanBooks = booksToInsert.map(({ language, ...rest }) => rest);
        const retry = await supabase
          .from('books')
          .insert(cleanBooks)
          .select();
        inserted = retry.data;
        insertError = retry.error;
      }
    } catch (e: any) {
      insertError = e;
    }

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
