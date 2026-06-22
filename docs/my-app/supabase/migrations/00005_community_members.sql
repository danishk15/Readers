-- Create community members join table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(community_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Community members are viewable by everyone." 
  ON public.community_members FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can join communities." 
  ON public.community_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities." 
  ON public.community_members FOR DELETE 
  USING (auth.uid() = user_id);
