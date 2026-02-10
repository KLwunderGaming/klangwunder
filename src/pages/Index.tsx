import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    </>
  );
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const hasPlayParam = searchParams.has('play');
  const [showIntro, setShowIntro] = useState(!hasPlayParam);

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
