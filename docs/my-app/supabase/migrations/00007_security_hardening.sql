-- ==============================================================================
-- MIGRATION 00007: SECURITY HARDENING & RLS ACCESS CONTROL POLICIES
-- ==============================================================================
-- 1. Prevent non-admin users from escalating their role or premium status
-- 2. Enforce strict ownership checks on comments, messages, channels, and books
-- 3. Secure SECURITY DEFINER functions with explicit search_path
-- ==============================================================================

-- 1. TRIGGER FUNCTION: PREVENT PRIVILEGE ESCALATION ON USERS TABLE
CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is updating their own record via client auth, prevent changing 'role' and 'premium_status'
  IF (auth.uid() = OLD.id) THEN
    -- Check if current user is admin in auth metadata or existing row
    IF (OLD.role <> 'admin') THEN
      NEW.role := OLD.role;
      NEW.premium_status := OLD.premium_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_user_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_user_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_privilege_escalation();

-- 2. HARDEN USER CREATION TRIGGER WITH EXPLICIT SEARCH_PATH
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. HARDEN ROW LEVEL SECURITY POLICIES

-- Comments: Ensure users can ONLY create comments under their genuine auth.uid()
DROP POLICY IF EXISTS "Authenticated users can post comments." ON public.comments;
DROP POLICY IF EXISTS "Users can only post comments as themselves." ON public.comments;
CREATE POLICY "Users can only post comments as themselves."
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Messages: Ensure users can ONLY insert messages matching their genuine auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert messages." ON public.messages;
DROP POLICY IF EXISTS "Users can only insert messages as themselves." ON public.messages;
CREATE POLICY "Users can only insert messages as themselves."
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Channels: Ensure only community owners or authenticated members can create channels
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Community owners can create channels" ON public.channels;
CREATE POLICY "Community owners can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_id AND owner_id = auth.uid()
    )
  );

-- Books: Restrict arbitrary updates to admins or authenticated owners
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;
CREATE POLICY "Admins can update books"
  ON public.books FOR UPDATE
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
