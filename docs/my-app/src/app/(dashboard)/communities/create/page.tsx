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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return router.push('/login');

    // 1. Create Community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .insert({ name, description, owner_id: user.id })
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
