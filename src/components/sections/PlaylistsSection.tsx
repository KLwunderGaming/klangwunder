import { motion } from 'framer-motion';
import { Play, ListMusic } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import type { Playlist } from '@/types/music';

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
}

function PlaylistCard({ playlist, index }: PlaylistCardProps) {
  const { playTrack, setQueue } = useAudio();
  const { getPlaylistTracks } = useTracks();

  const handlePlay = () => {
    const playlistTracks = getPlaylistTracks(playlist);
    if (playlistTracks.length > 0) {
      setQueue(playlistTracks);
      playTrack(playlistTracks[0]);
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
      <div className="aspect-square relative bg-gradient-to-br from-primary/40 to-accent/40">
        <div className="absolute inset-0 flex items-center justify-center">
          <ListMusic className="w-16 h-16 text-foreground/30" />
        </div>
        
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
        <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          {playlist.trackIds.length} Tracks
        </p>
      </div>
    </motion.div>
  );
}

export function PlaylistsSection() {
  const { playlists, isLoading } = useTracks();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <div className="h-5 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-full bg-muted/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
