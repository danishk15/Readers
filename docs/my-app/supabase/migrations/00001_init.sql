-- Users extension table (links to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  premium_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Books
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Communities
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Channels
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reading Logs
CREATE TABLE public.reading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  time_spent_seconds INTEGER DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (can be expanded later)
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Books are viewable by everyone." ON public.books FOR SELECT USING (true);

CREATE POLICY "Communities are viewable by everyone." ON public.communities FOR SELECT USING (true);
CREATE POLICY "Messages are viewable by everyone in community." ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages." ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own reading logs." ON public.reading_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading logs." ON public.reading_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading logs." ON public.reading_logs FOR UPDATE USING (auth.uid() = user_id);

-- Server Upgrades (Region/Genre columns)
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS genre TEXT;

-- User Region column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT;

-- Competition Entries table
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

-- Enable RLS for competition_entries
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

-- Policies for competition_entries
CREATE POLICY "Competition entries are viewable by everyone" 
  ON public.competition_entries FOR SELECT USING (true);

CREATE POLICY "Users can insert own competition entry" 
  ON public.competition_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competition entry" 
  ON public.competition_entries FOR UPDATE 
  USING (auth.uid() = user_id);

-- Missing policies to allow server (community) & channel creation
CREATE POLICY "Authenticated users can create communities" 
  ON public.communities FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Channels are viewable by everyone" 
  ON public.channels FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create channels" 
  ON public.channels FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Enable user profile creation from clients (needed for existing users)
CREATE POLICY "Users can insert own profile." 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Trigger function to automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


