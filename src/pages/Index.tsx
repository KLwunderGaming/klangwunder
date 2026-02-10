import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { AudioProvider } from '@/contexts/AudioContext';
import { IntroScreen } from '@/components/IntroScreen';
import { Navigation } from '@/components/Navigation';
import { Scene3DBackground } from '@/components/3d/Scene3DBackground';
import { HeroSection } from '@/components/sections/HeroSection';
import { MusicSection } from '@/components/sections/MusicSection';
import { PlaylistsSection } from '@/components/sections/PlaylistsSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { EventsSection } from '@/components/sections/EventsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/Footer';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { LoginButton } from '@/components/LoginButton';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import { slugify } from '@/lib/slugify';
import { supabase } from '@/integrations/supabase/client';

function SlugResolver() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { playTrack, setQueue } = useAudio();
  const { tracks } = useTracks();
  const [resolved, setResolved] = useState(false);

  const isTrackRoute = location.pathname.startsWith('/track/');
  const isAlbumRoute = location.pathname.startsWith('/album/');

  useEffect(() => {
    if (!slug || resolved || tracks.length === 0) return;
    if (!isTrackRoute && !isAlbumRoute) return;

    let track: typeof tracks[0] | undefined;

    if (isTrackRoute) {
      track = tracks.find(t => slugify(t.title) === slug)
        || tracks.find(t => slug.includes(slugify(t.title)))
        || tracks.find(t => slugify(t.title).includes(slug));
    } else if (isAlbumRoute) {
      track = tracks.find(t => t.album && slugify(t.album) === slug)
        || tracks.find(t => t.album && slug.includes(slugify(t.album!)))
        || tracks.find(t => t.album && slugify(t.album!).includes(slug));
    }

    if (track) {
      document.title = isTrackRoute
        ? `${track.title} – ${track.artist} | Klangwunder`
        : `${track.album} – ${track.artist} | Klangwunder`;
      setQueue(tracks);
      playTrack(track);
      // Update URL to root without reload
      window.history.replaceState(null, '', '/');
      setTimeout(() => {
        document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      window.history.replaceState(null, '', '/');
    }

    setResolved(true);
  }, [slug, tracks, resolved, isTrackRoute, isAlbumRoute]);

  return null;
}

function AutoPlayHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack, setQueue } = useAudio();
  const { tracks } = useTracks();
  const playId = searchParams.get('play');

  useEffect(() => {
    if (playId && tracks.length > 0) {
      const track = tracks.find(t => t.id === playId);
      if (track) {
        setQueue(tracks);
        playTrack(track);
        setTimeout(() => {
          document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      searchParams.delete('play');
      setSearchParams(searchParams, { replace: true });
    }
  }, [playId, tracks]);

  return null;
}

function MainContent() {
  const { analyserData } = useAudio();

  return (
    <>
      <Scene3DBackground audioData={analyserData} />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <MusicSection />
        <PlaylistsSection />
        <AboutSection />
        <EventsSection />
        <ContactSection />
        <Footer />
      </main>
      <MusicPlayer />
      <LoginButton />
      <AutoPlayHandler />
      <SlugResolver />
    </>
  );
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const hasPlayParam = searchParams.has('play');
  const isShareLink = location.pathname.startsWith('/track/') || location.pathname.startsWith('/album/');
  const [showIntro, setShowIntro] = useState(!hasPlayParam && !isShareLink);

  return (
    <AudioProvider>
      <div className="min-h-screen bg-background">
        {showIntro ? (
          <IntroScreen onComplete={() => setShowIntro(false)} />
        ) : (
          <MainContent />
        )}
      </div>
    </AudioProvider>
  );
};

export default Index;
