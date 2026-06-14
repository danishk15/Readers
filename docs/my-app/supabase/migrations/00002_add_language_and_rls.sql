-- Add language column to books table if missing
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Enable INSERT policy for authenticated users on books table
CREATE POLICY "Authenticated users can insert books" 
  ON public.books FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
