import { motion } from 'framer-motion';
import { Play, ListMusic, Loader2 } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import type { Playlist, Track } from '@/types/music';
import { useState, useEffect } from 'react';

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  onPlay: (tracks: Track[]) => void;
}

function PlaylistCard({ playlist, index, onPlay }: PlaylistCardProps) {
  const { getPlaylistTracks } = useTracks();
  const [trackCount, setTrackCount] = useState(0);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  useEffect(() => {
    const loadTracks = async () => {
      const tracks = await getPlaylistTracks(playlist.id);
      setPlaylistTracks(tracks);
      setTrackCount(tracks.length);
    };
    loadTracks();
  }, [playlist.id, getPlaylistTracks]);

  const handlePlay = () => {
    if (playlistTracks.length > 0) {
      onPlay(playlistTracks);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative glass rounded-2xl overflow-hidden card-hover"
    >
      {/* Cover */}
      <div className="aspect-square relative overflow-hidden">
        {playlist.cover_url ? (
          <img 
            src={playlist.cover_url} 
            alt={playlist.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
            <ListMusic className="w-16 h-16 text-foreground/30" />
          </div>
        )}
        
        {/* Play button overlay */}
        <motion.button
          onClick={handlePlay}
          className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center glow-primary">
            <Play size={28} className="text-primary-foreground ml-1" />
          </div>
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-body font-semibold text-lg mb-1 truncate">{playlist.name}</h3>
        {playlist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-2">
          {trackCount} Tracks
        </p>
      </div>
    </motion.div>
  );
}

export function PlaylistsSection() {
  const { playlists, isLoading } = useTracks();
  const { playTrack, setQueue } = useAudio();

  const handlePlayPlaylist = (tracks: Track[]) => {
    if (tracks.length > 0) {
      setQueue(tracks);
      playTrack(tracks[0]);
    }
  };

  // Don't render if no playlists
  if (!isLoading && playlists.length === 0) {
    return null;
  }

  return (
    <section id="playlists" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl sm:text-6xl text-gradient mb-4">
            Playlists
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Kuratierte Sammlungen für jeden Moment und jede Stimmung.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist} 
                index={index}
                onPlay={handlePlayPlaylist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
