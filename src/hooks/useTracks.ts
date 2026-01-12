import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Track, Playlist } from '@/types/music';

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load tracks from database
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tracksError) throw tracksError;

      // Load playlists from database
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      setTracks(tracksData || []);
      setPlaylists(playlistsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
    const { data, error } = await supabase
      .from('playlist_tracks')
      .select('track_id, position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (error || !data) return [];

    const trackIds = data.map(pt => pt.track_id);
    const playlistTracks = tracks.filter(t => trackIds.includes(t.id));
    
    // Sort by position
    return playlistTracks.sort((a, b) => {
      const posA = data.find(pt => pt.track_id === a.id)?.position || 0;
      const posB = data.find(pt => pt.track_id === b.id)?.position || 0;
      return posA - posB;
    });
  };

  const refetch = () => {
    loadData();
  };

  return { tracks, playlists, isLoading, error, getPlaylistTracks, refetch };
}
