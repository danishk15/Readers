-- ==============================================================================
-- QUILLHAWK / READERS: MASTER SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this complete query in the Supabase SQL Editor to initialize all tables,
-- relations, triggers, indexes, and Row Level Security policies.
-- ==============================================================================

-- 1. USERS TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  premium_status BOOLEAN DEFAULT false,
  bio TEXT,
  region TEXT,
  banner_color TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  chapters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. COMMUNITIES (GUILDS & BOOK CLUBS)
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  region TEXT,
  genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CHANNELS
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. COMMUNITY MEMBERS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(community_id, user_id)
);

-- 7. READING LOGS
CREATE TABLE IF NOT EXISTS public.reading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. COMPETITION ENTRIES
CREATE TABLE IF NOT EXISTS public.competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  month TEXT NOT NULL, -- Format YYYY-MM
  selected_books JSONB DEFAULT '[]'::jsonb,
  total_reading_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, month)
);

-- 9. BOOK COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile." ON public.users;
CREATE POLICY "Users can insert own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Books policies
DROP POLICY IF EXISTS "Books are viewable by everyone." ON public.books;
CREATE POLICY "Books are viewable by everyone." ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
CREATE POLICY "Authenticated users can update books" ON public.books FOR UPDATE WITH CHECK (auth.role() = 'authenticated');

-- Communities policies
DROP POLICY IF EXISTS "Communities are viewable by everyone." ON public.communities;
CREATE POLICY "Communities are viewable by everyone." ON public.communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Channels policies
DROP POLICY IF EXISTS "Channels are viewable by everyone" ON public.channels;
CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
CREATE POLICY "Authenticated users can create channels" ON public.channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages policies
DROP POLICY IF EXISTS "Messages are viewable by everyone in community." ON public.messages;
CREATE POLICY "Messages are viewable by everyone in community." ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages." ON public.messages;
CREATE POLICY "Authenticated users can insert messages." ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Community Members policies
DROP POLICY IF EXISTS "Community members are viewable by everyone." ON public.community_members;
CREATE POLICY "Community members are viewable by everyone." ON public.community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join communities." ON public.community_members;
CREATE POLICY "Authenticated users can join communities." ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave communities." ON public.community_members;
CREATE POLICY "Users can leave communities." ON public.community_members FOR DELETE USING (auth.uid() = user_id);

-- Reading Logs policies
DROP POLICY IF EXISTS "Users can view own reading logs." ON public.reading_logs;
CREATE POLICY "Users can view own reading logs." ON public.reading_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reading logs." ON public.reading_logs;
CREATE POLICY "Users can insert own reading logs." ON public.reading_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reading logs." ON public.reading_logs;
CREATE POLICY "Users can update own reading logs." ON public.reading_logs FOR UPDATE USING (auth.uid() = user_id);

-- Competition Entries policies
DROP POLICY IF EXISTS "Competition entries are viewable by everyone" ON public.competition_entries;
CREATE POLICY "Competition entries are viewable by everyone" ON public.competition_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own competition entry" ON public.competition_entries;
CREATE POLICY "Users can insert own competition entry" ON public.competition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own competition entry" ON public.competition_entries;
CREATE POLICY "Users can update own competition entry" ON public.competition_entries FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments." ON public.comments;
CREATE POLICY "Authenticated users can post comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own comments." ON public.comments;
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC USER CREATION TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Reader'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '📚'),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(public.users.username, EXCLUDED.username),
    avatar_url = COALESCE(public.users.avatar_url, EXCLUDED.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reading_logs_user_id ON public.reading_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_book_id ON public.reading_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_competition_entries_region_month ON public.competition_entries(region, month);
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON public.comments(book_id);
CREATE INDEX IF NOT EXISTS idx_channels_community_id ON public.channels(community_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
