import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile (includes username, avatar_url, bio, etc.)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch reading logs
  const { data: logs } = await supabase
    .from('reading_logs')
    .select('time_spent_seconds, pages_read')
    .eq('user_id', user.id);

  return (
    <ProfileClient
      initialProfile={profile}
      initialUser={user}
      logs={logs}
    />
  );
}
