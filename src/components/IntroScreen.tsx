import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import klangwunderLogo from '@/assets/klangwunder-logo.png';

interface IntroScreenProps {
  onComplete: () => void;
}

// SVG path data for handwritten "Klangwunder" letters
const letterPaths = [
  // K
  "M0,0 L0,40 M0,20 L15,0 M0,20 L15,40",
  // l
  "M20,0 L20,40",
  // a
  "M35,15 C35,10 40,8 45,10 C50,12 50,20 50,25 L50,40 M50,25 C50,30 45,35 40,35 C35,35 35,30 35,25 C35,20 40,15 45,15",
  // n
  "M55,15 L55,40 M55,20 C55,15 60,12 65,12 C70,12 75,15 75,25 L75,40",
  // g
  "M80,15 C80,10 85,8 90,10 C95,12 100,18 100,25 C100,30 95,35 90,35 C85,35 80,30 80,25 L80,15 M100,25 L100,50 C100,55 95,58 90,58 C85,58 80,55 80,50",
  // w
  "M110,15 L115,40 L120,25 L125,40 L130,15",
  // u
  "M135,15 L135,30 C135,35 140,40 145,40 C150,40 155,35 155,30 L155,15",
  // n
  "M160,15 L160,40 M160,20 C160,15 165,12 170,12 C175,12 180,15 180,25 L180,40",
  // d
  "M185,0 L185,40 M185,25 C185,20 190,15 195,15 C200,15 205,20 205,25 C205,30 200,35 195,35 C190,35 185,30 185,25",
  // e
  "M210,25 L230,25 C230,20 225,15 220,15 C215,15 210,20 210,25 C210,30 215,35 220,35 C225,35 228,33 230,30",
  // r
  "M235,15 L235,40 M235,25 C235,20 240,15 245,15 C250,15 252,17 252,20"
];

// Character animation component
function AnimatedLetter({ 
  char, 
  index, 
  totalChars 
}: { 
  char: string; 
  index: number; 
  totalChars: number;
}) {
  const delay = index * 0.15;
  
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut"
      }}
      className="inline-block"
    >
      <motion.span
        initial={{ 
          clipPath: "inset(0 100% 0 0)",
          opacity: 0 
        }}
        animate={{ 
          clipPath: "inset(0 0% 0 0)",
          opacity: 1 
        }}
        transition={{
          duration: 0.5,
          delay: delay + 0.1,
          ease: [0.65, 0, 0.35, 1]
        }}
        className="inline-block"
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

// Handwritten text animation
function HandwrittenText({ 
  text, 
  isVisible,
  onComplete 
}: { 
  text: string; 
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, text.length * 150 + 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, text.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      className="relative"
    >
      {/* Pen cursor animation */}
      <motion.div
        className="absolute -top-2 w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"
        initial={{ x: 0, opacity: 0 }}
        animate={{
          x: [0, text.length * 45],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: text.length * 0.15,
          ease: "linear",
          times: [0, 0.05, 0.95, 1]
        }}
        style={{
          boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)/0.5)'
        }}
      />
      
      <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-gradient glow-text whitespace-nowrap">
        {text.split('').map((char, index) => (
          <AnimatedLetter
            key={index}
            char={char}
            index={index}
            totalChars={text.length}
          />
        ))}
      </h1>
      
      {/* Underline stroke animation */}
      <motion.div
        className="absolute -bottom-4 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isVisible ? "100%" : 0,
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
          duration: 1.2, 
          delay: text.length * 0.12,
          ease: [0.65, 0, 0.35, 1]
        }}
        style={{
          boxShadow: '0 0 15px hsl(var(--primary)/0.6)'
        }}
      />
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
  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
  const note = notes[Math.floor(Math.random() * notes.length)];
  const randomX = 10 + Math.random() * 80;
  const randomDuration = 5 + Math.random() * 3;
  
  return (
    <motion.div
      className="absolute text-primary/40 font-display pointer-events-none select-none"
      style={{
        left: `${randomX}%`,
        fontSize: `${1 + Math.random() * 1.5}rem`,
        textShadow: '0 0 10px hsl(var(--primary)/0.5)'
      }}
      initial={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: 0,
        rotate: -20,
        scale: 0
      }}
      animate={{
        y: -100,
        opacity: [0, 0.6, 0.6, 0],
        rotate: [0, 360],
        scale: [0.5, 1, 1, 0.3]
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
    // Phase timing
    const handwritingTimer = setTimeout(() => {
      setPhase('transform');
    }, 3000);

    const logoTimer = setTimeout(() => {
      setPhase('logo');
    }, 4200);

    const buttonTimer = setTimeout(() => {
      setShowEnterButton(true);
    }, 5000);

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
            {Array.from({ length: 30 }).map((_, i) => (
              <FloatingParticle key={`particle-${i}`} delay={i * 0.3} size={4 + Math.random() * 8} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <MusicalNote key={`note-${i}`} delay={i * 0.5 + 1} />
            ))}
          </div>

          {/* Radial glow behind content */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)/0.4), transparent 70%)'
            }}
          />

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Handwritten text phase */}
            <motion.div
              animate={{
                opacity: phase === 'handwriting' ? 1 : 0,
                scale: phase === 'transform' ? 0.8 : 1,
                y: phase === 'transform' ? -50 : 0,
                filter: phase === 'transform' ? 'blur(10px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute"
              style={{ display: phase === 'logo' ? 'none' : 'block' }}
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
                duration: 1,
                ease: [0.34, 1.56, 0.64, 1] // spring-like
              }}
              className="flex flex-col items-center"
            >
              {/* Logo image with glow effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 40px hsl(var(--primary)/0.3)',
                    '0 0 80px hsl(var(--primary)/0.5)',
                    '0 0 40px hsl(var(--primary)/0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-3xl overflow-hidden"
              >
                <motion.img
                  src={klangwunderLogo}
                  alt="Klangwunder Logo"
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 20px hsl(var(--primary)/0.5))',
                      'drop-shadow(0 0 40px hsl(var(--primary)/0.7))',
                      'drop-shadow(0 0 20px hsl(var(--primary)/0.5))'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Brand name under logo */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  y: phase === 'logo' ? 0 : 20 
                }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl text-gradient glow-text mt-6"
              >
                Klangwunder
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'logo' ? 0.6 : 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-body text-muted-foreground mt-2 text-lg"
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
            className="absolute bottom-32 z-10"
          >
            <motion.button
              onClick={handleEnter}
              className="group relative px-12 py-5 rounded-full glass border border-primary/30 hover:border-primary/60 transition-all duration-500 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative z-10 text-lg font-body tracking-wider text-foreground group-hover:text-primary-foreground transition-colors duration-300">
                ▶ Eintreten
              </span>
              <div className="absolute inset-0 rounded-full glow-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showEnterButton ? 0.5 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-16 text-sm text-muted-foreground font-body"
          >
            Klicke um die Musik zu erleben
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
