import { useState } from 'react';
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
import { useAudio } from '@/contexts/AudioContext';

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
    </>
  );
}

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);

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
