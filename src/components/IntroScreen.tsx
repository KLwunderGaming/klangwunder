import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import klangwunderLogo from '@/assets/klangwunder-logo.png';

interface IntroScreenProps {
  onComplete: () => void;
}

// Eleganter Buchstabe mit klarer Animation
function AnimatedLetter({ 
  letter, 
  index,
  isActive 
}: { 
  letter: string; 
  index: number;
  isActive: boolean;
}) {
  const delay = index * 0.18; // Langsamer: 180ms pro Buchstabe
  
  return (
    <motion.span
      className="inline-block font-display"
      style={{
        color: 'white',
        textShadow: `
          0 0 20px hsl(var(--primary)),
          0 0 40px hsl(var(--primary)/0.5),
          0 0 80px hsl(var(--primary)/0.3)
        `
      }}
      initial={{ 
        opacity: 0,
        y: 60,
        rotateX: -90,
        scale: 0.3
      }}
      animate={isActive ? { 
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1
      } : {
        opacity: 0,
        y: 60,
        rotateX: -90,
        scale: 0.3
      }}
      transition={{
        duration: 0.9, // Längere Animation
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {letter}
    </motion.span>
  );
}

// Animierter Titel
function AnimatedTitle({ 
  text, 
  isActive,
  onComplete
}: { 
  text: string; 
  isActive: boolean;
  onComplete?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(-1);
      setIsComplete(false);
      return;
    }
    
    // Initiale Verzögerung bevor die Animation startet
    const startDelay = setTimeout(() => {
      let idx = -1;
      const interval = setInterval(() => {
        idx++;
        if (idx < text.length) {
          setCurrentIndex(idx);
        } else {
          setIsComplete(true);
          clearInterval(interval);
          // Längere Pause bevor zur nächsten Phase gewechselt wird
          setTimeout(() => onComplete?.(), 1500);
        }
      }, 180); // 180ms pro Buchstabe - viel langsamer
      
      return () => clearInterval(interval);
    }, 800); // 800ms Startverzögerung
    
    return () => clearTimeout(startDelay);
  }, [isActive, text.length, onComplete]);

  return (
    <div className="relative text-center">
      {/* Haupttext */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-wider whitespace-nowrap">
        {text.split('').map((letter, index) => (
          <AnimatedLetter
            key={index}
            letter={letter}
            index={index}
            isActive={index <= currentIndex}
          />
        ))}
      </h1>
      
      {/* Leuchtende Unterstreichung */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-6 h-1.5 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(280 100% 70%), hsl(var(--primary)), transparent)',
          boxShadow: '0 0 40px hsl(var(--primary)), 0 0 80px hsl(var(--primary)/0.5)'
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isComplete ? '90%' : `${Math.max(0, ((currentIndex + 1) / text.length) * 85)}%`,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Funkeln bei Fertigstellung */}
      <AnimatePresence>
        {isComplete && (
          <>
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  background: i % 2 === 0 ? 'white' : 'hsl(var(--primary))',
                  boxShadow: `0 0 15px ${i % 2 === 0 ? 'white' : 'hsl(var(--primary))'}`
                }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.cos(i * (Math.PI * 2 / 16)) * (120 + Math.random() * 80),
                  y: Math.sin(i * (Math.PI * 2 / 16)) * (80 + Math.random() * 50)
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Schwebende Lichtpartikel
function LightOrb({ delay, index }: { delay: number; index: number }) {
  const size = 4 + Math.random() * 8;
  const startX = Math.random() * 100;
  const drift = (Math.random() - 0.5) * 40;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        background: index % 3 === 0 
          ? 'radial-gradient(circle, rgba(255,255,255,0.9), transparent)'
          : 'radial-gradient(circle, hsl(var(--primary)/0.9), transparent)',
        boxShadow: index % 3 === 0 
          ? '0 0 15px rgba(255,255,255,0.6)'
          : `0 0 ${size * 3}px hsl(var(--primary)/0.5)`
      }}
      initial={{
        y: '110vh',
        x: 0,
        opacity: 0
      }}
      animate={{
        y: '-10vh',
        x: drift,
        opacity: [0, 0.9, 0.9, 0]
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

// Pulsierender Ring
function PulseRing({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/20"
      initial={{ width: 0, height: 0, opacity: 0.7 }}
      animate={{ 
        width: [0, 800],
        height: [0, 800],
        opacity: [0.5, 0]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  );
}

// Schwebende Noten/Musik-Symbole
function FloatingNote({ delay, index }: { delay: number; index: number }) {
  const notes = ['♪', '♫', '♩', '♬'];
  const startX = 10 + Math.random() * 80;
  const size = 16 + Math.random() * 12;
  
  return (
    <motion.div
      className="absolute font-display text-primary/30"
      style={{
        left: `${startX}%`,
        fontSize: size,
        textShadow: '0 0 20px hsl(var(--primary)/0.3)'
      }}
      initial={{
        y: '110vh',
        rotate: -20,
        opacity: 0
      }}
      animate={{
        y: '-10vh',
        rotate: 20,
        opacity: [0, 0.6, 0.6, 0]
      }}
      transition={{
        duration: 15 + Math.random() * 5,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {notes[index % notes.length]}
    </motion.div>
  );
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'title' | 'transition' | 'logo'>('title');
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(false);

  const handleTitleComplete = useCallback(() => {
    // Längere Übergänge für professionelleres Gefühl
    setTimeout(() => setPhase('transition'), 500);
    setTimeout(() => setPhase('logo'), 1500);
    setTimeout(() => setShowButton(true), 2500);
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
            background: `
              radial-gradient(ellipse at 50% 0%, hsl(270 60% 12%/0.6) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, hsl(280 70% 15%/0.4) 0%, transparent 40%),
              radial-gradient(ellipse at 20% 90%, hsl(260 60% 12%/0.4) 0%, transparent 40%),
              linear-gradient(180deg, hsl(270 50% 3%) 0%, hsl(270 40% 6%) 100%)
            `
          }}
        >
          {/* Vignette-Effekt */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, hsl(270 50% 3%/0.8) 100%)'
            }}
          />

          {/* Licht-Partikel */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <LightOrb key={i} delay={i * 0.5} index={i} />
            ))}
          </div>

          {/* Schwebende Noten */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <FloatingNote key={i} delay={i * 2} index={i} />
            ))}
          </div>

          {/* Pulsierende Ringe */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1.5, 3].map((d, i) => (
              <PulseRing key={i} delay={d} />
            ))}
          </div>

          {/* Zentraler Glow */}
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)/0.12), transparent 60%)',
              filter: 'blur(80px)'
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Hauptinhalt */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4">
            
            {/* Titel-Phase */}
            <motion.div
              animate={{
                opacity: phase === 'title' ? 1 : 0,
                scale: phase === 'transition' ? 0.85 : 1,
                y: phase === 'transition' ? -80 : 0,
                filter: phase === 'transition' ? 'blur(15px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute"
              style={{ display: phase === 'logo' ? 'none' : 'block' }}
            >
              <AnimatedTitle 
                text="Klangwunder" 
                isActive={phase === 'title'}
                onComplete={handleTitleComplete}
              />
            </motion.div>

            {/* Logo-Phase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, y: 50 }}
              animate={{
                opacity: phase === 'logo' ? 1 : 0,
                scale: phase === 'logo' ? 1 : 0.4,
                y: phase === 'logo' ? 0 : 50
              }}
              transition={{ 
                duration: 1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex flex-col items-center"
            >
              {/* Logo mit Glanz-Effekt */}
              <motion.div
                className="relative"
                animate={{
                  filter: [
                    'drop-shadow(0 0 40px hsl(var(--primary)/0.4))',
                    'drop-shadow(0 0 70px hsl(var(--primary)/0.6))',
                    'drop-shadow(0 0 40px hsl(var(--primary)/0.4))'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <img
                  src={klangwunderLogo}
                  alt="Klangwunder Logo"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 object-contain"
                />
                
                {/* Glanz-Overlay */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, transparent 40%, hsl(var(--primary)/0.2) 50%, transparent 60%)'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 200%']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>

              {/* Markenname */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  y: phase === 'logo' ? 0 : 30 
                }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl mt-8 text-white tracking-wide"
                style={{
                  textShadow: '0 0 40px hsl(var(--primary)/0.5), 0 0 80px hsl(var(--primary)/0.3)'
                }}
              >
                Klangwunder
              </motion.h2>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'logo' ? 0.8 : 0,
                  y: phase === 'logo' ? 0 : 20
                }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="font-body text-muted-foreground mt-4 text-lg sm:text-xl tracking-[0.3em] uppercase"
              >
                Klänge, die Wunder wirken
              </motion.p>
            </motion.div>
          </div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: showButton ? 1 : 0, 
              y: showButton ? 0 : 50 
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute bottom-24 z-10"
          >
            <motion.button
              onClick={handleEnter}
              className="group relative px-14 py-6 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(280 60% 25%/0.25))',
                border: '1px solid hsl(var(--primary)/0.5)',
                backdropFilter: 'blur(15px)'
              }}
              whileHover={{ 
                scale: 1.08,
                boxShadow: '0 0 60px hsl(var(--primary)/0.5), inset 0 0 30px hsl(var(--primary)/0.1)'
              }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Animierter Rahmen */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid transparent',
                  background: 'linear-gradient(90deg, transparent, hsl(var(--primary)/0.5), transparent) border-box'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Shine-Effekt */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--primary)/0.3), transparent)'
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              <span className="relative z-10 text-xl font-body tracking-[0.3em] text-white/90 group-hover:text-white transition-colors flex items-center gap-4">
                <motion.span
                  animate={{ 
                    x: [0, 5, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-primary text-2xl"
                >
                  ▶
                </motion.span>
                EINTRETEN
              </span>
            </motion.button>
          </motion.div>

          {/* Hinweis */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showButton ? 0.5 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-12 text-sm text-muted-foreground/70 font-body tracking-widest"
          >
            Klicke um fortzufahren
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
