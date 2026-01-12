import { motion } from 'framer-motion';
import { Play, Pause, Clock, Music2 } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import type { Track } from '@/types/music';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface TrackCardProps {
  track: Track;
  index: number;
}

function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudio();
  const { tracks } = useTracks();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setQueue(tracks);
      playTrack(track);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative glass rounded-xl p-4 card-hover cursor-pointer ${
        isCurrentTrack ? 'border-primary/50 glow-primary' : 'border-transparent'
      }`}
      onClick={handlePlay}
    >
      <div className="flex items-center gap-4">
        {/* Cover Art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-foreground/50" />
          </div>
          
          {/* Play overlay */}
          <div className={`absolute inset-0 bg-background/60 flex items-center justify-center transition-opacity duration-300 ${
            isCurrentTrack && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-8 h-8 text-primary" />
            ) : (
              <Play className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-body font-semibold truncate ${
            isCurrentTrack ? 'text-primary' : 'text-foreground'
          }`}>
            {track.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
        </div>

        {/* Duration & Genre */}
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(track.duration)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {track.genre}
          </span>
        </div>
      </div>

      {/* Playing indicator */}
      {isCurrentTrack && isPlaying && (
        <div className="absolute bottom-2 right-2 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-primary rounded-full"
              animate={{
                height: [4, 12, 4],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function MusicSection() {
  const { tracks, isLoading } = useTracks();

  return (
    <section id="music" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl sm:text-6xl text-gradient mb-4">
            Meine Musik
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Entdecke meine neuesten Produktionen und lass dich von den Klängen verzaubern.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded mb-2" />
                    <div className="h-3 w-24 bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {tracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
