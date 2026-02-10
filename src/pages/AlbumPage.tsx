import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, ArrowLeft, Disc3, Music2, Share2, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import { slugify } from '@/lib/slugify';
import { ShareButton } from '@/components/ShareButton';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { Scene3DBackground } from '@/components/3d/Scene3DBackground';
import { Footer } from '@/components/Footer';
import type { Track } from '@/types/music';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SITE_URL = 'https://music.klwunder.de';

function AlbumShareButton({ albumSlug, albumName, artist }: { albumSlug: string; albumName: string; artist: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${SITE_URL}/album/${albumSlug}`;
  const ogUrl = `${SUPABASE_URL}/functions/v1/og-share?album=${encodeURIComponent(albumSlug)}&site=${encodeURIComponent(SITE_URL)}`;
  const shareText = `💿 ${albumName} von ${artist} – Jetzt anhören!`;

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link kopiert!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + ogUrl)}` },
    { name: 'Discord', icon: '🎮', action: copyLink, label: 'Link kopieren (für Discord)' },
    { name: 'Telegram', icon: '✈️', url: `https://t.me/share/url?url=${encodeURIComponent(ogUrl)}&text=${encodeURIComponent(shareText)}` },
    { name: 'X / Twitter', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(ogUrl)}` },
    { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogUrl)}` },
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-3 rounded-full glass hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Album teilen"
      >
        <Share2 size={20} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute right-0 bottom-full mb-2 z-50 w-56 glass rounded-xl p-2 shadow-xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 mb-1">
                <span className="text-sm font-medium">Album teilen</span>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left text-sm">
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
              </button>
              <div className="h-px bg-primary/10 my-1" />
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.action) { e.preventDefault(); option.action(e); }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                >
                  <span className="text-base">{option.icon}</span>
                  <span>{option.label || option.name}</span>
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function AlbumHero({ albumName, albumSlug, artist, coverUrl, trackCount, totalDuration, onPlay }: {
  albumName: string;
  albumSlug: string;
  artist: string;
  coverUrl: string | null;
  trackCount: number;
  totalDuration: number;
  onPlay: () => void;

}) {
  return (
    <section className="relative min-h-[70vh] flex items-end pb-16">
      {/* Background blur from cover */}
      {coverUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
      )}

      <div className="relative z-10 section-container w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12"
        >
          {/* Album Cover */}
          <motion.div
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden flex-shrink-0 glow-primary"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, rotate: 1 }}
          >
            {coverUrl ? (
              <img src={coverUrl} alt={albumName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <Disc3 className="w-24 h-24 text-foreground/20" />
              </div>
            )}
          </motion.div>

          {/* Album Info */}
          <motion.div
            className="text-center md:text-left flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">
              Album
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-gradient mb-4 leading-tight">
              {albumName}
            </h1>
            <p className="text-xl text-foreground/80 mb-2">{artist}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start mb-8">
              <span className="flex items-center gap-1.5">
                <Music2 size={14} />
                {trackCount} Songs
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatDuration(totalDuration)}
              </span>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <motion.button
                onClick={onPlay}
                className="btn-primary px-10 py-4 rounded-full flex items-center gap-3 text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={24} className="ml-0.5" />
                Jetzt abspielen
              </motion.button>
              <AlbumShareButton albumSlug={albumSlug} albumName={albumName} artist={artist} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function TracklistSection({ tracks, currentTrack, isPlaying, onPlayTrack }: {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
}) {
  return (
    <section className="py-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl text-gradient mb-8">Tracklist</h2>

          {/* Header row */}
          <div className="flex items-center gap-4 px-4 pb-3 border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Titel</span>
            <span className="w-16 text-right">
              <Clock size={14} className="inline" />
            </span>
            <span className="w-10" />
          </div>

          {/* Track rows */}
          <div className="mt-2">
            {tracks.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/10 ${
                    isCurrent ? 'bg-primary/15' : ''
                  }`}
                  onClick={() => onPlayTrack(track)}
                >
                  {/* Track number / play icon */}
                  <span className="w-8 text-center text-sm text-muted-foreground">
                    <span className="group-hover:hidden">
                      {isCurrent && isPlaying ? (
                        <span className="flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" />
                          <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                          <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="hidden group-hover:block">
                      {isCurrent && isPlaying ? (
                        <Pause size={16} className="text-primary mx-auto" />
                      ) : (
                        <Play size={16} className="text-primary mx-auto" />
                      )}
                    </span>
                  </span>

                  {/* Cover thumbnail */}
                  {track.cover_url && (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Title & Artist */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/track/${slugify(track.title)}`}
                      className={`text-sm truncate block transition-colors hover:text-primary ${
                        isCurrent ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {track.title}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>

                  {/* Duration */}
                  <span className="w-16 text-right text-xs text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Share */}
                  <span className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareButton track={track} size={14} />
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AlbumInfoSection({ albumName, artist, trackCount, totalDuration }: {
  albumName: string;
  artist: string;
  trackCount: number;
  totalDuration: number;
}) {
  return (
    <section className="py-16 border-t border-border/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="glass rounded-2xl p-8 text-center">
            <Music2 className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">{trackCount}</p>
            <p className="text-sm text-muted-foreground">Songs</p>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">{formatDuration(totalDuration)}</p>
            <p className="text-sm text-muted-foreground">Gesamtlänge</p>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <Disc3 className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground mb-1">{artist}</p>
            <p className="text-sm text-muted-foreground">Künstler</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AlbumPageContent() {
  const { slug } = useParams<{ slug: string }>();
  const { tracks, isLoading } = useTracks();
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue, analyserData } = useAudio();

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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
          <div className="section-container flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors glass-strong rounded-full px-4 py-2"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Zurück</span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <AlbumHero
          albumName={albumName}
          albumSlug={slug || ''}
          artist={artist}
          coverUrl={coverUrl}
          trackCount={albumTracks.length}
          totalDuration={totalDuration}
          onPlay={handlePlayAlbum}
        />

        {/* Tracklist */}
        <TracklistSection
          tracks={albumTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlayTrack}
        />

        {/* Info Cards */}
        <AlbumInfoSection
          albumName={albumName}
          artist={artist}
          trackCount={albumTracks.length}
          totalDuration={totalDuration}
        />

        {/* Footer */}
        <div className="pb-32">
          <Footer />
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
