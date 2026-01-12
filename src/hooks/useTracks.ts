import { useState, useEffect } from 'react';
import type { TracksData, Track, Playlist } from '@/types/music';

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const basePath = import.meta.env.BASE_URL || './';
        const response = await fetch(`${basePath}data/tracks.json`);
        if (!response.ok) {
          throw new Error('Failed to load tracks');
        }
        const data: TracksData = await response.json();
        setTracks(data.tracks);
        setPlaylists(data.playlists);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  const getPlaylistTracks = (playlist: Playlist): Track[] => {
    return playlist.trackIds
      .map(id => tracks.find(t => t.id === id))
      .filter((t): t is Track => t !== undefined);
  };

  return { tracks, playlists, isLoading, error, getPlaylistTracks };
}
