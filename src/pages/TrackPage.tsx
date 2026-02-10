import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, ArrowLeft, Music2, Share2 } from 'lucide-react';
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

function TrackPageContent() {
  const { slug } = useParams<{ slug: string }>();
  const { tracks, isLoading } = useTracks();
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue, analyserData } = useAudio();

  const track = tracks.find(t => slugify(t.title) === slug)
    || tracks.find(t => slug?.includes(slugify(t.title)) ?? false)
    || tracks.find(t => slugify(t.title).includes(slug ?? ''));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Scene3DBackground audioData={analyserData} />
        <div className="relative z-10 text-center glass rounded-2xl p-12 max-w-md mx-4">
          <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-2">Track nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">Dieser Song existiert leider nicht.</p>
          <Link to="/" className="btn-primary px-6 py-3 rounded-full inline-block">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setQueue(tracks);
      playTrack(track);
    }
  };

  // Set document title
  document.title = `${track.title} – ${track.artist} | Klangwunder`;

  // Find related tracks (same album or artist)
  const relatedTracks = tracks.filter(t =>
    t.id !== track.id && (t.album === track.album || t.artist === track.artist)
  ).slice(0, 5);

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

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <div className="glass rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Cover Art */}
                <motion.div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <Music2 className="w-20 h-20 text-foreground/30" />
                    </div>
                  )}
                </motion.div>

                {/* Track Info */}
                <div className="text-center sm:text-left flex-1">
                  <p className="text-xs uppercase tracking-widest text-primary mb-2">Song</p>
                  <h1 className="font-display text-3xl sm:text-4xl text-gradient mb-2 leading-tight">
                    {track.title}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-1">{track.artist}</p>
                  {track.album && (
                    <Link
                      to={`/album/${slugify(track.album)}`}
                      className="text-sm text-primary/80 hover:text-primary transition-colors"
                    >
                      {track.album}
                    </Link>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(track.duration)}
                    </span>
                    {track.genre && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                        {track.genre}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-6">
                    <motion.button
                      onClick={handlePlay}
                      className="btn-primary px-8 py-3 rounded-full flex items-center gap-2 text-lg"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isCurrentTrack && isPlaying ? (
                        <><Pause size={22} /> Pause</>
                      ) : (
                        <><Play size={22} className="ml-0.5" /> Abspielen</>
                      )}
                    </motion.button>
                    <ShareButton track={track} />
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tracks */}
            {relatedTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 glass rounded-2xl p-6"
              >
                <h2 className="font-body text-lg font-semibold mb-4 text-foreground/80">
                  Ähnliche Songs
                </h2>
                <div className="space-y-2">
                  {relatedTracks.map((rt) => {
                    const isRelatedCurrent = currentTrack?.id === rt.id;
                    return (
                      <Link
                        key={rt.id}
                        to={`/track/${slugify(rt.title)}`}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors ${
                          isRelatedCurrent ? 'bg-primary/20' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          {rt.cover_url ? (
                            <img src={rt.cover_url} alt={rt.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <Music2 size={16} className="text-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isRelatedCurrent ? 'text-primary font-medium' : ''}`}>{rt.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{rt.artist}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDuration(rt.duration)}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}

export default function TrackPage() {
  return (
    <AudioProvider>
      <TrackPageContent />
    </AudioProvider>
  );
}
