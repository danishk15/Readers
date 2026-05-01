import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
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

  // Step 27: Milestone Engine Logic (Basic implementation)
  const totalSeconds = logs?.reduce((acc, log) => acc + (log.time_spent_seconds || 0), 0) || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalPages = logs?.reduce((acc, log) => acc + (log.pages_read || 0), 0) || 0;
  
  // Calculate level based on minutes read (10 mins = 1 level)
  const level = Math.floor(totalMinutes / 10) + 1;
  const xp = totalMinutes % 10;
  const xpProgress = (xp / 10) * 100;

  const badges = [];
  if (totalMinutes >= 60) badges.push({ name: 'Bookworm', icon: '🐛', color: 'bg-green-500/20 text-green-500' });
  if (totalPages >= 100) badges.push({ name: 'Speed Reader', icon: '⚡', color: 'bg-blue-500/20 text-blue-500' });
  if (profile?.premium_status) badges.push({ name: 'Premium', icon: '👑', color: 'bg-warning/20 text-warning' });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6 p-6 bg-surface border border-gray-800 rounded-2xl shadow-sm">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl text-white font-bold">
          {profile?.username?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{profile?.username || 'Reader'}</h1>
          <p className="text-muted">{user.email}</p>
          <div className="mt-2 flex gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-surface border border-gray-700 rounded-md">Level {level}</span>
            {profile?.premium_status && <span className="text-xs font-semibold px-2 py-1 bg-warning text-black rounded-md">Premium</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-muted">Reading Time</h3>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalMinutes} <span className="text-xl text-muted font-normal">mins</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-muted">Pages Read</h3>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">{totalPages}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-muted">Current XP</h3>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>{xp} XP</span>
              <span className="text-muted">10 XP to next level</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${xpProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Badges & Milestones</h2>
        <div className="flex flex-wrap gap-4">
          {badges.length > 0 ? (
            badges.map(badge => (
              <div key={badge.name} className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-800 ${badge.color}`}>
                <span className="text-xl">{badge.icon}</span>
                <span className="font-medium">{badge.name}</span>
              </div>
            ))
          ) : (
            <p className="text-muted text-sm border border-dashed border-gray-800 rounded-xl p-8 text-center w-full">Read more books to earn badges!</p>
          )}
        </div>
      </div>
    </div>
  );
}
