'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function CreateCommunityPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('South Asia');
  const [genre, setGenre] = useState('Fiction');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      router.push('/login');
      return;
    }

    // Ensure user profile exists in public.users to satisfy the foreign key constraint
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          username: user.email ? user.email.split('@')[0] : 'Reader',
          role: 'user',
          premium_status: false
        });

      if (profileError) {
        alert('Failed to initialize user profile in database: ' + profileError.message);
        setLoading(false);
        return;
      }
    }

    // 1. Create Community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .insert({ name, description, owner_id: user.id, region, genre })
      .select()
      .single();

    if (communityError || !community) {
      alert('Failed to create community: ' + communityError?.message);
      setLoading(false);
      return;
    }

    // 2. Create default #general channel
    await supabase.from('channels').insert({
      community_id: community.id,
      name: 'general',
      type: 'text'
    });

    router.push(`/communities/${community.id}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 space-y-6">
      <h1 className="text-2xl font-bold">Create a Server</h1>
      <p className="text-muted text-sm">Your server is where your community hangs out. Make yours and start talking.</p>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input 
              label="Server Name" 
              placeholder="e.g. Fantasy Book Club"
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <Input 
              label="Description" 
              placeholder="What is this community about?"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Region</label>
              <select 
                value={region} 
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-[#161b22] border border-gray-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-205 cursor-pointer"
              >
                <option value="South Asia">South Asia</option>
                <option value="Asia-Pacific">Asia-Pacific</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Middle East">Middle East</option>
                <option value="South America">South America</option>
              </select>
            </div>
            
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Genre Focus</label>
              <select 
                value={genre} 
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-[#161b22] border border-gray-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-205 cursor-pointer"
              >
                <option value="Fiction">Fiction</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Romance">Romance</option>
              </select>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Server'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
