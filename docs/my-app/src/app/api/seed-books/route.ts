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
      // Urdu Classics - Originals & Translations
      { 
        title: 'Dewan-e-Ghalib (دیوان غالب)', 
        author: 'Mirza Asadullah Khan Ghalib', 
        cover_url: 'https://www.gutenberg.org/cache/epub/72237/pg72237.cover.medium.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/72237.epub.noimages', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Love Sonnets of Ghalib (English Translation)', 
        author: 'Mirza Ghalib (Trans. Dr. Sarfaraz K. Niazi)', 
        cover_url: 'https://archive.org/services/img/love-sonnets-of-ghalib-dr.-sarfaraz-k.-niazi', 
        file_url: 'https://archive.org/download/love-sonnets-of-ghalib-dr.-sarfaraz-k.-niazi/love-sonnets-of-ghalib-dr.-sarfaraz-k.-niazi.epub', 
        is_premium: false, 
        language: 'en'
      },
      { 
        title: 'Kulliyat-e-Iqbal: Bang-e-Dra & Shikwa (کلیات اقبال)', 
        author: 'Allama Dr. Muhammad Iqbal', 
        cover_url: 'https://archive.org/services/img/kulliyatiqbalurdu', 
        file_url: 'https://archive.org/download/kulliyatiqbalurdu/kulliyatiqbalurdu.epub', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'The Secrets of the Self (Asrar-e-Khudi Translation)', 
        author: 'Allama Muhammad Iqbal (Trans. Reynold A. Nicholson)', 
        cover_url: 'https://covers.openlibrary.org/b/id/8231456-M.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/43881.epub.noimages', 
        is_premium: false, 
        language: 'en'
      },
      { 
        title: 'Peer-e-Kamil (پیر کامل)', 
        author: 'Umera Ahmed', 
        cover_url: 'https://archive.org/services/img/PEEREKAMILP.B.U.HUmeraAhmedEbooks.i360.pk', 
        file_url: 'https://archive.org/download/PEEREKAMILP.B.U.HUmeraAhmedEbooks.i360.pk/PEEREKAMILP.B.U.HUmeraAhmedEbooks.i360.pk.epub', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Raja Gidh (راجہ گدھ)', 
        author: 'Bano Qudsia', 
        cover_url: 'https://archive.org/services/img/raja-gidh_202102', 
        file_url: 'https://archive.org/download/raja-gidh_202102/raja-gidh_202102.epub', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Thanda Gosht & Manto Afsanay (ٹھنڈا گوشت اور افسانے)', 
        author: 'Saadat Hasan Manto', 
        cover_url: 'https://archive.org/services/img/thandagoshtmuqaddamamanto', 
        file_url: 'https://archive.org/download/thandagoshtmuqaddamamanto/thandagoshtmuqaddamamanto.epub', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Bagh-o-Bahar (باغ و بہار)', 
        author: 'Mir Amman', 
        cover_url: 'https://www.gutenberg.org/cache/epub/70864/pg70864.cover.medium.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/70864.epub.noimages', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'The Tale of the Four Durwesh (Bagh-o-Bahar English)', 
        author: 'Mir Amman (Trans. Duncan Forbes)', 
        cover_url: 'https://covers.openlibrary.org/b/id/8314125-M.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/16084.epub.noimages', 
        is_premium: false, 
        language: 'en'
      },
      { 
        title: 'Fasana-e-Azad (فسانہ آزاد)', 
        author: 'Ratan Nath Dhar Sarshar', 
        cover_url: 'https://www.gutenberg.org/cache/epub/71708/pg71708.cover.medium.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/71708.epub.noimages', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Qissa Hatim Tai (قصہ حاتم طائی)', 
        author: 'Traditional Folklore', 
        cover_url: 'https://www.gutenberg.org/cache/epub/71434/pg71434.cover.medium.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/71434.epub.noimages', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Intikhab-e-Kalam-e-Mir (انتخاب کلام میر)', 
        author: 'Mir Taqi Mir', 
        cover_url: 'https://www.gutenberg.org/cache/epub/72111/pg72111.cover.medium.jpg', 
        file_url: 'https://www.gutenberg.org/ebooks/72111.epub.noimages', 
        is_premium: false, 
        language: 'ur'
      },
      { 
        title: 'Godan (گودان)', 
        author: 'Munshi Premchand', 
        cover_url: 'https://archive.org/services/img/Godan-Hindi', 
        file_url: 'https://archive.org/download/Godan-Hindi/Godan-Hindi.epub', 
        is_premium: false, 
        language: 'ur'
      },

      // World Classics - Originals & Translations
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
        title: 'Don Quijote de la Mancha (Original Español)',
        author: 'Miguel de Cervantes Saavedra',
        cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2000.epub.noimages',
        is_premium: false,
        language: 'es'
      },
      {
        title: 'Don Quixote (English Translation)',
        author: 'Miguel de Cervantes (Trans. John Ormsby)',
        cover_url: 'https://covers.openlibrary.org/b/id/8254881-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/996.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Le Tour du monde en 80 jours (Original Français)',
        author: 'Jules Verne',
        cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/800.epub.noimages',
        is_premium: false,
        language: 'fr'
      },
      {
        title: 'Around the World in 80 Days (English Translation)',
        author: 'Jules Verne (Trans. George Makepeace Towle)',
        cover_url: 'https://covers.openlibrary.org/b/id/8313431-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/103.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'Faust: Eine Tragödie (Original Deutsch)',
        author: 'Johann Wolfgang von Goethe',
        cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2229.epub.noimages',
        is_premium: false,
        language: 'de'
      },
      {
        title: 'Faust (English Verse Translation)',
        author: 'Johann Wolfgang von Goethe (Trans. Bayard Taylor)',
        cover_url: 'https://covers.openlibrary.org/b/id/8282121-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/14591.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'War and Peace (English Unabridged)',
        author: 'Leo Tolstoy (Trans. Louise & Aylmer Maude)',
        cover_url: 'https://covers.openlibrary.org/b/id/8231996-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/2600.epub.noimages',
        is_premium: false,
        language: 'en'
      },
      {
        title: 'The Arabian Nights Entertainments (1001 Nights)',
        author: 'Traditional Arabic (Trans. Andrew Lang)',
        cover_url: 'https://covers.openlibrary.org/b/id/8235123-M.jpg',
        file_url: 'https://www.gutenberg.org/ebooks/128.epub.noimages',
        is_premium: false,
        language: 'en'
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
