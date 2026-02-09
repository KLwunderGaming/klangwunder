import { motion } from 'framer-motion';
import { Play, Pause, Clock, Music2, Disc3, ChevronRight } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import { ShareButton } from '@/components/ShareButton';
import type { Track } from '@/types/music';
import { useState, useMemo } from 'react';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface Album {
  name: string;
  tracks: Track[];
  coverUrl: string | null;
}

interface TrackCardProps {
  track: Track;
  index: number;
  compact?: boolean;
}

function TrackCard({ track, index, compact = false }: TrackCardProps) {
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

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-primary/10 ${
          isCurrentTrack ? 'bg-primary/20' : ''
        }`}
        onClick={handlePlay}
      >
        <span className="w-6 text-center text-sm text-muted-foreground group-hover:hidden">
          {index + 1}
        </span>
        <span className="w-6 text-center hidden group-hover:block">
          {isCurrentTrack && isPlaying ? (
            <Pause size={16} className="text-primary mx-auto" />
          ) : (
            <Play size={16} className="text-primary mx-auto" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isCurrentTrack ? 'text-primary font-medium' : ''}`}>
            {track.title}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDuration(track.duration)}
        </span>
        <ShareButton track={track} size={14} />
      </motion.div>
    );
  }

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
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-foreground/50" />
            </div>
          )}
          
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
          {track.album && (
            <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
          )}
        </div>

        {/* Duration & Genre */}
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(track.duration)}
          </span>
          {track.genre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {track.genre}
            </span>
          )}
        </div>
        <ShareButton track={track} />
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

interface AlbumCardProps {
  album: Album;
  index: number;
  onSelect: () => void;
}

function AlbumCard({ album, index, onSelect }: AlbumCardProps) {
  const totalDuration = album.tracks.reduce((sum, t) => sum + t.duration, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group"
      onClick={onSelect}
    >
      {/* Cover */}
      <div className="aspect-square relative overflow-hidden">
        {album.coverUrl ? (
          <img 
            src={album.coverUrl} 
            alt={album.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Disc3 className="w-20 h-20 text-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div 
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
        </motion.div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-body font-semibold truncate group-hover:text-primary transition-colors">
          {album.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {album.tracks.length} Tracks • {formatDuration(totalDuration)}
        </p>
      </div>
    </motion.div>
  );
}

type ViewMode = 'all' | 'albums' | 'singles';

export function MusicSection() {
  const { tracks, isLoading } = useTracks();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const { setQueue, playTrack } = useAudio();

  // Group tracks by album
  const { albums, singles } = useMemo(() => {
    const albumMap = new Map<string, Track[]>();
    const singlesArr: Track[] = [];

    tracks.forEach(track => {
      if (track.album && track.album.trim() !== '') {
        const existing = albumMap.get(track.album) || [];
        existing.push(track);
        albumMap.set(track.album, existing);
      } else {
        singlesArr.push(track);
      }
    });

    const albumsArr: Album[] = Array.from(albumMap.entries()).map(([name, albumTracks]) => ({
      name,
      tracks: albumTracks,
      coverUrl: albumTracks[0]?.cover_url || null,
    }));

    return { albums: albumsArr, singles: singlesArr };
  }, [tracks]);

  const playAlbum = (album: Album) => {
    setQueue(album.tracks);
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0]);
    }
  };

  // Don't render if no tracks
  if (!isLoading && tracks.length === 0) {
    return null;
  }

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

        {/* View Mode Tabs */}
        {!selectedAlbum && (
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: 'all' as ViewMode, label: 'Alle Songs' },
              { id: 'albums' as ViewMode, label: 'Alben' },
              { id: 'singles' as ViewMode, label: 'Singles' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-body transition-all ${
                  viewMode === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        )}

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
        ) : selectedAlbum ? (
          /* Album Detail View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Back button & Album header */}
            <div className="flex items-start gap-6">
              <motion.button
                onClick={() => setSelectedAlbum(null)}
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                whileHover={{ x: -3 }}
              >
                <ChevronRight className="rotate-180" size={24} />
              </motion.button>
              
              <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                {selectedAlbum.coverUrl ? (
                  <img src={selectedAlbum.coverUrl} alt={selectedAlbum.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Disc3 className="w-12 h-12 text-foreground/30" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Album</p>
                <h3 className="font-display text-3xl text-gradient mb-2">{selectedAlbum.name}</h3>
                <p className="text-muted-foreground">
                  {selectedAlbum.tracks.length} Songs • {formatDuration(selectedAlbum.tracks.reduce((s, t) => s + t.duration, 0))}
                </p>
                <motion.button
                  onClick={() => playAlbum(selectedAlbum)}
                  className="mt-4 px-6 py-2 rounded-full btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play size={18} />
                  Album abspielen
                </motion.button>
              </div>
            </div>

            {/* Track list */}
            <div className="glass rounded-xl p-4">
              {selectedAlbum.tracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} compact />
              ))}
            </div>
          </motion.div>
        ) : viewMode === 'albums' ? (
          /* Albums Grid */
          albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {albums.map((album, index) => (
                <AlbumCard 
                  key={album.name} 
                  album={album} 
                  index={index}
                  onSelect={() => setSelectedAlbum(album)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Disc3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Alben vorhanden.</p>
            </div>
          )
        ) : viewMode === 'singles' ? (
          /* Singles List */
          singles.length > 0 ? (
            <div className="grid gap-4">
              {singles.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Singles vorhanden.</p>
            </div>
          )
        ) : (
          /* All Tracks */
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
