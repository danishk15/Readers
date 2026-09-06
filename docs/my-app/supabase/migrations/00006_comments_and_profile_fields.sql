-- 00006_comments_and_profile_fields.sql
-- Add missing banner artwork & color columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_color TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add description and chapters columns to books table if missing
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb;

-- Alter reading_logs book_id to TEXT if needed so all book identifiers (Gutenberg, custom slugs) work
DO $$ 
BEGIN
  -- Check if foreign key constraint exists on book_id and alter to text if necessary
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'reading_logs' AND column_name = 'book_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.reading_logs ALTER COLUMN book_id TYPE TEXT;
  END IF;
END $$;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Comments are viewable by everyone." 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can post comments." 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own comments." 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON public.comments(book_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
