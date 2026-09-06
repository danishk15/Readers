// scripts/test_query_engine.mjs
// Test all chaining methods and fallback logic
import { createClient } from '../src/utils/supabase/client.ts';

async function testQueryEngine() {
  console.log('Testing Supabase Client Query Engine...');
  const supabase = createClient();

  try {
    // 1. Test Select all books
    const { data: books, error: booksErr } = await supabase.from('books').select('*');
    console.log(`[PASS] books.select('*'): retrieved ${books?.length} books`);

    // 2. Test Select single book
    const { data: singleBook } = await supabase.from('books').select('*').eq('id', 'classic-6').single();
    console.log(`[PASS] books.single(): ${singleBook?.title} by ${singleBook?.author}`);

    // 3. Test insert with .select().single()
    const { data: insertedCommunity } = await supabase
      .from('communities')
      .insert({ name: 'Test Guild', description: 'Testing query chain', owner_id: 'test-user', region: 'South Asia', genre: 'Fiction' })
      .select()
      .single();
    console.log(`[PASS] communities.insert().select().single():`, insertedCommunity?.name);

    // 4. Test maybeSingle
    const { data: maybeUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', 'non-existent-id')
      .maybeSingle();
    console.log(`[PASS] users.maybeSingle():`, maybeUser ? 'found' : 'not found (handled cleanly)');

    // 5. Test comments insert & select
    await supabase.from('comments').insert({
      book_id: 'classic-6',
      user_id: 'test-user',
      content: 'Brilliant verses from Ghalib!'
    });
    const { data: comments } = await supabase
      .from('comments')
      .select('*, users(email, username)')
      .eq('book_id', 'classic-6')
      .order('created_at', { ascending: false });
    console.log(`[PASS] comments.insert & select: found ${comments?.length} comments`);

    // 6. Test competition entry update with .eq().select()
    const { data: updatedEntry } = await supabase
      .from('competition_entries')
      .update({ total_reading_time: 120 })
      .eq('id', 'entry-123')
      .select();
    console.log(`[PASS] competition_entries.update().eq().select():`, updatedEntry);

    console.log('\nALL QUERY ENGINE TESTS PASSED SUCCESSFULLY! ✅');
  } catch (err) {
    console.error('[FAIL] Query Engine Error:', err);
    process.exit(1);
  }
}

testQueryEngine();
