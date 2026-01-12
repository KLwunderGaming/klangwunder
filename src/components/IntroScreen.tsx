import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnterButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnter = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 800);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, hsl(270 75% 4%) 0%, hsl(270 60% 8%) 50%, hsl(270 50% 12%) 100%)' }}
    >
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/60"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="font-display text-6xl sm:text-8xl md:text-9xl text-gradient glow-text z-10 mb-8"
      >
        Klangwunder
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: showEnterButton ? 1 : 0, y: showEnterButton ? 0 : 50 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="z-10"
      >
        <button
          onClick={handleEnter}
          className="group relative px-10 py-4 rounded-full glass border-primary/30 hover:border-primary/60 transition-all duration-500"
        >
              <span className="relative z-10 text-lg font-body tracking-wider text-foreground group-hover:text-primary-foreground transition-colors duration-300">
                Eintreten
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-full glow-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showEnterButton ? 0.6 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-8 text-sm text-muted-foreground font-body"
          >
            Klicke um die Musik zu erleben
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
