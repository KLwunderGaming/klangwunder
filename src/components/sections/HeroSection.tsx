import { motion } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useTracks } from '@/hooks/useTracks';
import heroVideo from '@/assets/hero-video.mp4';

export function HeroSection() {
  const { playTrack, addToQueue, setQueue } = useAudio();
  const { tracks } = useTracks();

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      playTrack(tracks[0]);
    }
  };

  const scrollToMusic = () => {
    const element = document.querySelector('#music');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      <div className="section-container relative z-10 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-gradient mb-6 glow-text">
            Klangwunder
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-body text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Erlebe Klänge, die Wunder wirken. Tauche ein in eine Welt aus 
          atmosphärischen Beats und melodischen Reisen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={handlePlayAll}
            className="group flex items-center gap-3 px-8 py-4 rounded-full btn-primary font-body text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} className="group-hover:scale-110 transition-transform" />
            Jetzt hören
          </motion.button>

          <motion.button
            onClick={scrollToMusic}
            className="flex items-center gap-2 px-8 py-4 rounded-full btn-ghost font-body text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Entdecken
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.button
            onClick={scrollToMusic}
            className="text-muted-foreground hover:text-foreground transition-colors"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={32} />
          </motion.button>
        </motion.div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none z-[5]" />
    </section>
  );
}
