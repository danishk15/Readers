'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, MapPin, Tag, Filter } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  region?: string;
  genre?: string;
  created_at: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCommunities = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Fetch joined communities
      let joinedIds: string[] = [];
      try {
        const { data, error } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);
        if (data && !error) {
          joinedIds = data.map((d: any) => d.community_id);
        }
      } catch (e) {
        console.error('Error fetching memberships:', e);
      }
      setJoinedCommunityIds(joinedIds);

      let dbCommunities: Community[] = [];
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) {
          dbCommunities = data;
        }
      } catch (e) {
        console.error('Supabase fetch communities error:', e);
      }

      setCommunities(dbCommunities);
      setLoading(false);
    };

    fetchCommunities();
  }, [supabase, router]);

  const handleJoinLeave = async (communityId: string, isJoined: boolean) => {
    if (!userId) return;
    
    if (isJoined) {
      // Leave community
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      
      if (!error) {
        setJoinedCommunityIds(prev => prev.filter(id => id !== communityId));
      } else {
        alert('Failed to leave community: ' + error.message);
      }
    } else {
      // Join community
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId
        });
      
      if (!error) {
        setJoinedCommunityIds(prev => [...prev, communityId]);
      } else {
        alert('Failed to join community: ' + error.message);
      }
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchRegion = !filterRegion || c.region === filterRegion;
    const matchGenre = !filterGenre || c.genre === filterGenre;
    return matchRegion && matchGenre;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            <span>QuillHawk Literary Guilds</span>
          </h1>
          <p className="text-muted text-sm mt-1">Join a literary guild to discuss your favorite book genres and connect with readers globally.</p>
        </div>
        <Link href="/communities/create" passHref legacyBehavior>
          <Button className="bg-primary hover:bg-primary-hover shadow-md shadow-primary/20">Create Guild</Button>
        </Link>
      </div>

      {/* Interactive Filters */}
      <div className="bg-slate-950/40 backdrop-blur-md border border-slate-900/60 p-5 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters:</span>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-900/40 transition-colors"
          >
            <option value="">All Regions</option>
            <option value="South Asia">South Asia</option>
            <option value="Asia-Pacific">Asia-Pacific</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Middle East">Middle East</option>
            <option value="South America">South America</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-355 focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-900/40 transition-colors"
          >
            <option value="">All Genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Mystery">Mystery</option>
            <option value="History">History</option>
            <option value="Biography">Biography</option>
            <option value="Romance">Romance</option>
          </select>
        </div>

        {(filterRegion || filterGenre) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setFilterRegion(''); setFilterGenre(''); }} 
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Servers Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-slate-500 font-medium">Fetching servers...</p>
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="hover:border-secondary transition-all duration-300 bg-slate-950/20 border-slate-850 hover:translate-y-[-2px] group relative flex flex-col justify-between overflow-hidden">
              <CardContent className="p-6 flex flex-col justify-between h-full gap-5">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                      {community.name.substring(0, 2).toUpperCase()}
                    </div>
                    
                    {/* Status badge */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-primary transition-colors">{community.name}</h3>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">{community.description || 'A community server for readers.'}</p>
                </div>

                <div className="space-y-4">
                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900/60">
                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-950/65 text-indigo-400 border border-indigo-500/15 px-2.5 py-1 rounded-lg font-bold tracking-wide uppercase">
                      <MapPin className="w-3 h-3" />
                      {community.region || 'Global'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-950/65 text-cyan-400 border border-cyan-500/15 px-2.5 py-1 rounded-lg font-bold tracking-wide uppercase">
                      <Tag className="w-3 h-3" />
                      {community.genre || 'General'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {joinedCommunityIds.includes(community.id) ? (
                      <>
                        <Button 
                          onClick={() => handleJoinLeave(community.id, true)}
                          variant="ghost" 
                          className="flex-1 text-xs text-rose-450 hover:text-rose-350 hover:bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 py-2 h-9" 
                          size="sm"
                        >
                          Leave
                        </Button>
                        <Link href={`/communities/${community.id}`} passHref legacyBehavior>
                          <Button variant="secondary" className="flex-1 bg-secondary text-white border-transparent hover:bg-secondary/90 text-xs font-bold py-2 h-9" size="sm">
                            Chat
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Button 
                        onClick={() => handleJoinLeave(community.id, false)}
                        className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/95 hover:to-violet-600/95 text-white font-bold text-xs py-2 h-9" 
                        size="sm"
                      >
                        Join Server
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-slate-850 rounded-2xl bg-slate-950/20 backdrop-blur-sm space-y-3">
          <Users className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="font-bold text-slate-400">No servers found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {filterRegion || filterGenre 
              ? 'Try modifying your filters to find active channels.' 
              : 'Be the first to create a server and initiate discussions!'}
          </p>
        </div>
      )}
    </div>
  );
}
