import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import klangwunderLogo from '@/assets/klangwunder-logo.png';

interface IntroScreenProps {
  onComplete: () => void;
}

// SVG Path für jeden Buchstaben in "Klangwunder" - handschriftliche Kurven
const letterSVGPaths: { [key: string]: string } = {
  K: "M 5 40 L 5 5 M 5 22 Q 15 22 25 5 M 5 22 Q 15 22 25 40",
  l: "M 5 5 L 5 40",
  a: "M 25 15 Q 5 15 5 27 Q 5 40 15 40 Q 25 40 25 27 L 25 15 L 25 40",
  n: "M 5 15 L 5 40 M 5 20 Q 5 15 15 15 Q 25 15 25 25 L 25 40",
  g: "M 25 15 Q 5 15 5 27 Q 5 40 15 40 Q 25 40 25 27 L 25 15 L 25 50 Q 25 55 15 55 Q 5 55 5 50",
  w: "M 5 15 L 10 40 L 17 25 L 24 40 L 30 15",
  u: "M 5 15 L 5 35 Q 5 40 15 40 Q 25 40 25 35 L 25 15",
  d: "M 25 5 L 25 40 M 25 27 Q 25 15 15 15 Q 5 15 5 27 Q 5 40 15 40 Q 25 40 25 27",
  e: "M 5 27 L 25 27 Q 25 15 15 15 Q 5 15 5 27 Q 5 40 15 40 Q 25 40 25 35",
  r: "M 5 15 L 5 40 M 5 25 Q 5 15 15 15 Q 20 15 22 18"
};

// Einzelner animierter SVG-Buchstabe
function HandwrittenLetter({ 
  letter, 
  index, 
  isActive 
}: { 
  letter: string; 
  index: number;
  isActive: boolean;
}) {
  const path = letterSVGPaths[letter];
  const delay = index * 0.25;
  const letterWidth = letter === 'w' ? 35 : letter === 'K' ? 30 : 30;
  
  if (!path) return null;

  return (
    <motion.svg
      width={letterWidth}
      height="60"
      viewBox="0 0 30 60"
      className="inline-block"
      style={{ overflow: 'visible' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ delay: delay * 0.5, duration: 0.1 }}
    >
      {/* Glow effect path */}
      <motion.path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: isActive ? 1 : 0,
          opacity: isActive ? 0.5 : 0
        }}
        transition={{ 
          duration: 0.8,
          delay,
          ease: "easeOut"
        }}
      />
      
      {/* Main visible path */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#textGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0 }}
        transition={{ 
          duration: 0.8,
          delay,
          ease: "easeOut"
        }}
      />
      
      {/* Gradient and glow definitions */}
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(280 90% 75%)" />
          <stop offset="50%" stopColor="hsl(270 85% 85%)" />
          <stop offset="100%" stopColor="hsl(260 90% 75%)" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </motion.svg>
  );
}

// Schreibfeder/Stift Animation
function WritingPen({ isActive, progress }: { isActive: boolean; progress: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${progress * 100}%`,
        top: '-20px',
        transform: 'translateX(-50%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0,
        rotate: [0, -5, 5, 0]
      }}
      transition={{ 
        opacity: { duration: 0.3 },
        rotate: { duration: 0.5, repeat: Infinity }
      }}
    >
      {/* Pen tip glow */}
      <div 
        className="w-3 h-3 rounded-full bg-primary"
        style={{
          boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary)/0.5)'
        }}
      />
      {/* Ink trail */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1 h-8 -translate-x-1/2 rounded-full"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--primary)), transparent)'
        }}
        animate={{ 
          scaleY: [1, 0.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
    </motion.div>
  );
}

// Haupt Handschrift-Animation
function HandwrittenText({ 
  text, 
  isVisible 
}: { 
  text: string; 
  isVisible: boolean;
}) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  
  useEffect(() => {
    if (!isVisible) {
      setCurrentLetterIndex(-1);
      return;
    }
    
    const timer = setInterval(() => {
      setCurrentLetterIndex(prev => {
        if (prev < text.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 250);
    
    return () => clearInterval(timer);
  }, [isVisible, text.length]);

  const progress = useMemo(() => {
    return Math.min((currentLetterIndex + 1) / text.length, 1);
  }, [currentLetterIndex, text.length]);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Writing pen */}
      <div className="relative">
        <WritingPen isActive={isVisible && currentLetterIndex < text.length - 1} progress={progress} />
        
        {/* Letters container */}
        <div className="flex items-end gap-1 sm:gap-2" style={{ height: '80px' }}>
          {text.split('').map((letter, index) => (
            <motion.div
              key={index}
              className="relative"
              style={{ 
                transform: 'scale(1.5) translateY(-10px)',
                transformOrigin: 'bottom center'
              }}
            >
              <HandwrittenLetter
                letter={letter}
                index={index}
                isActive={index <= currentLetterIndex}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Animated underline */}
        <motion.div
          className="absolute -bottom-2 left-0 h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
            boxShadow: '0 0 20px hsl(var(--primary)/0.6), 0 0 40px hsl(var(--primary)/0.3)'
          }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: currentLetterIndex >= text.length - 1 ? '100%' : `${progress * 100}%`,
            opacity: currentLetterIndex >= 0 ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Sparkle effects during writing */}
      <AnimatePresence>
        {isVisible && currentLetterIndex < text.length - 1 && currentLetterIndex >= 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`sparkle-${currentLetterIndex}-${i}`}
                className="absolute w-1 h-1 rounded-full bg-primary"
                style={{
                  left: `${progress * 100}%`,
                  top: '50%',
                  boxShadow: '0 0 10px hsl(var(--primary))'
                }}
                initial={{ 
                  opacity: 1, 
                  scale: 1,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 60,
                  y: (Math.random() - 0.5) * 60
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Floating particle component
function FloatingParticle({ delay, size }: { delay: number; size: number }) {
  const randomX = Math.random() * 100;
  const randomDuration = 4 + Math.random() * 4;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${randomX}%`,
        background: `radial-gradient(circle, hsl(var(--primary)/0.8), transparent)`,
        boxShadow: `0 0 ${size * 2}px hsl(var(--primary)/0.4)`
      }}
      initial={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: 0,
        scale: 0
      }}
      animate={{
        y: -50,
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5]
      }}
      transition={{
        duration: randomDuration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

// Musical note particle
function MusicalNote({ delay }: { delay: number }) {
  const notes = ['♪', '♫', '♬', '♩'];
  const note = notes[Math.floor(Math.random() * notes.length)];
  const randomX = 10 + Math.random() * 80;
  const randomDuration = 5 + Math.random() * 3;
  
  return (
    <motion.div
      className="absolute text-primary/50 pointer-events-none select-none"
      style={{
        left: `${randomX}%`,
        fontSize: `${1.5 + Math.random() * 1.5}rem`,
        textShadow: '0 0 15px hsl(var(--primary)/0.6)'
      }}
      initial={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: 0,
        rotate: -20,
        scale: 0
      }}
      animate={{
        y: -100,
        opacity: [0, 0.7, 0.7, 0],
        rotate: [0, 360],
        scale: [0.5, 1.2, 1.2, 0.3]
      }}
      transition={{
        duration: randomDuration,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    >
      {note}
    </motion.div>
  );
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'handwriting' | 'transform' | 'logo'>('handwriting');
  const [isVisible, setIsVisible] = useState(true);
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    // Phase timing - längere Zeit für Handschrift
    const handwritingTimer = setTimeout(() => {
      setPhase('transform');
    }, 4500);

    const logoTimer = setTimeout(() => {
      setPhase('logo');
    }, 5500);

    const buttonTimer = setTimeout(() => {
      setShowEnterButton(true);
    }, 6500);

    return () => {
      clearTimeout(handwritingTimer);
      clearTimeout(logoTimer);
      clearTimeout(buttonTimer);
    };
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, hsl(270 75% 4%) 0%, hsl(270 60% 8%) 50%, hsl(270 50% 12%) 100%)' 
          }}
        >
          {/* Animated particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <FloatingParticle key={`particle-${i}`} delay={i * 0.4} size={4 + Math.random() * 8} />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <MusicalNote key={`note-${i}`} delay={i * 0.6 + 0.5} />
            ))}
          </div>

          {/* Multiple radial glows */}
          <div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)/0.5), transparent 60%)'
            }}
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--accent)/0.4), transparent 70%)'
            }}
          />

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
            {/* Handwritten text phase */}
            <motion.div
              animate={{
                opacity: phase === 'handwriting' ? 1 : 0,
                scale: phase === 'transform' ? 0.7 : 1,
                y: phase === 'transform' ? -80 : 0,
                filter: phase === 'transform' ? 'blur(15px)' : 'blur(0px)'
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute"
              style={{ display: phase === 'logo' ? 'none' : 'flex' }}
            >
              <HandwrittenText 
                text="Klangwunder" 
                isVisible={phase === 'handwriting'}
              />
            </motion.div>

            {/* Logo phase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
              animate={{
                opacity: phase === 'logo' ? 1 : 0,
                scale: phase === 'logo' ? 1 : 0.3,
                rotate: phase === 'logo' ? 0 : -180
              }}
              transition={{ 
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="flex flex-col items-center"
            >
              {/* Logo image with glow effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 40px hsl(var(--primary)/0.3)',
                    '0 0 100px hsl(var(--primary)/0.5)',
                    '0 0 40px hsl(var(--primary)/0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-3xl overflow-hidden"
              >
                <motion.img
                  src={klangwunderLogo}
                  alt="Klangwunder Logo"
                  className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 20px hsl(var(--primary)/0.5))',
                      'drop-shadow(0 0 50px hsl(var(--primary)/0.8))',
                      'drop-shadow(0 0 20px hsl(var(--primary)/0.5))'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Brand name under logo */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  y: phase === 'logo' ? 0 : 30 
                }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl text-gradient glow-text mt-8"
              >
                Klangwunder
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'logo' ? 0.7 : 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="font-body text-muted-foreground mt-3 text-lg tracking-wide"
              >
                Klänge, die Wunder wirken
              </motion.p>
            </motion.div>
          </div>

          {/* Enter button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: showEnterButton ? 1 : 0, 
              y: showEnterButton ? 0 : 50 
            }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-28 z-10"
          >
            <motion.button
              onClick={handleEnter}
              className="group relative px-14 py-5 rounded-full glass border border-primary/40 hover:border-primary/80 transition-all duration-500 overflow-hidden"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative z-10 text-xl font-body tracking-widest text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                Eintreten
              </span>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 30px hsl(var(--primary)/0.5)' }}
              />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showEnterButton ? 0.5 : 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute bottom-14 text-sm text-muted-foreground font-body tracking-wide"
          >
            Klicke um die Musik zu erleben
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
