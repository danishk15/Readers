import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { redirect } from 'next/navigation';

export default async function CommunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: communities } = await supabase.from('communities').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communities</h1>
          <p className="text-muted text-sm mt-1">Join a server to discuss your favorite books.</p>
        </div>
        <Button><a href="/communities/create">Create Server</a></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities && communities.length > 0 ? (
          communities.map((community) => (
            <Card key={community.id} className="hover:border-secondary transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                    {community.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-muted">12 Online</span>
                </div>
                <h3 className="font-semibold text-lg">{community.name}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{community.description || 'A community for readers.'}</p>
                <Button variant="secondary" className="w-full mt-6" size="sm">
                  <a href={`/communities/${community.id}`}>Join Server</a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-800 rounded-xl">
            <p>No communities found. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
