import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, ArrowLeft, Disc3, Music2 } from 'lucide-react';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import { slugify } from '@/lib/slugify';
import { ShareButton } from '@/components/ShareButton';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { Scene3DBackground } from '@/components/3d/Scene3DBackground';
import type { Track } from '@/types/music';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function AlbumPageContent() {
  const { slug } = useParams<{ slug: string }>();
  const { tracks, isLoading } = useTracks();
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue, analyserData } = useAudio();

  // Find all tracks belonging to this album
  const albumTracks = tracks.filter(t =>
    t.album && (
      slugify(t.album) === slug
      || (slug?.includes(slugify(t.album)) ?? false)
      || slugify(t.album).includes(slug ?? '')
    )
  );

  const albumName = albumTracks[0]?.album ?? slug ?? '';
  const artist = albumTracks[0]?.artist ?? 'Klangwunder';
  const coverUrl = albumTracks[0]?.cover_url ?? null;
  const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (albumTracks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Scene3DBackground audioData={analyserData} />
        <div className="relative z-10 text-center glass rounded-2xl p-12 max-w-md mx-4">
          <Disc3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-2">Album nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">Dieses Album existiert leider nicht.</p>
          <Link to="/" className="btn-primary px-6 py-3 rounded-full inline-block">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  document.title = `${albumName} – ${artist} | Klangwunder`;

  const handlePlayAlbum = () => {
    setQueue(albumTracks);
    if (albumTracks.length > 0) {
      playTrack(albumTracks[0]);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setQueue(albumTracks);
      playTrack(track);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Scene3DBackground audioData={analyserData} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="p-4 sm:p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Zurück</span>
          </Link>
        </div>

        {/* Album Header */}
        <div className="px-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Cover */}
                <motion.div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  {coverUrl ? (
                    <img src={coverUrl} alt={albumName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <Disc3 className="w-20 h-20 text-foreground/30" />
                    </div>
                  )}
                </motion.div>

                {/* Album Info */}
                <div className="text-center sm:text-left flex-1">
                  <p className="text-xs uppercase tracking-widest text-primary mb-2">Album</p>
                  <h1 className="font-display text-3xl sm:text-4xl text-gradient mb-2 leading-tight">
                    {albumName}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-1">{artist}</p>
                  <p className="text-sm text-muted-foreground">
                    {albumTracks.length} Songs • {formatDuration(totalDuration)}
                  </p>

                  <motion.button
                    onClick={handlePlayAlbum}
                    className="mt-6 btn-primary px-8 py-3 rounded-full flex items-center gap-2 text-lg mx-auto sm:mx-0"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Play size={22} className="ml-0.5" />
                    Album abspielen
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Tracklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 glass rounded-2xl p-4 sm:p-6"
            >
              {albumTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-primary/10 ${
                      isCurrent ? 'bg-primary/20' : ''
                    }`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <span className="w-6 text-center text-sm text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>
                    <span className="w-6 text-center hidden group-hover:block">
                      {isCurrent && isPlaying ? (
                        <Pause size={16} className="text-primary mx-auto" />
                      ) : (
                        <Play size={16} className="text-primary mx-auto" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/track/${slugify(track.title)}`}
                        className={`text-sm truncate block hover:text-primary transition-colors ${
                          isCurrent ? 'text-primary font-medium' : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {track.title}
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(track.duration)}
                    </span>
                    <ShareButton track={track} size={14} />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}

export default function AlbumPage() {
  return (
    <AudioProvider>
      <AlbumPageContent />
    </AudioProvider>
  );
}
