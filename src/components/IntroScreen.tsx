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
  const delay = index * 0.12;
  
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
        y: 50,
        rotateX: -90,
        scale: 0.5
      }}
      animate={isActive ? { 
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1
      } : {
        opacity: 0,
        y: 50,
        rotateX: -90,
        scale: 0.5
      }}
      transition={{
        duration: 0.6,
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
    
    let idx = -1;
    const interval = setInterval(() => {
      idx++;
      if (idx < text.length) {
        setCurrentIndex(idx);
      } else {
        setIsComplete(true);
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 500);
      }
    }, 120);
    
    return () => clearInterval(interval);
  }, [isActive, text.length, onComplete]);

  return (
    <div className="relative text-center">
      {/* Haupttext */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight whitespace-nowrap">
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
        className="absolute left-1/2 -translate-x-1/2 -bottom-4 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(280 100% 70%), hsl(var(--primary)), transparent)',
          boxShadow: '0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary)/0.5)'
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isComplete ? '80%' : `${Math.max(0, ((currentIndex + 1) / text.length) * 80)}%`,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Funkeln bei Fertigstellung */}
      <AnimatePresence>
        {isComplete && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  background: i % 2 === 0 ? 'white' : 'hsl(var(--primary))',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? 'white' : 'hsl(var(--primary))'}`
                }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.cos(i * (Math.PI * 2 / 12)) * (100 + Math.random() * 50),
                  y: Math.sin(i * (Math.PI * 2 / 12)) * (60 + Math.random() * 30)
                }}
                transition={{ duration: 1, ease: "easeOut" }}
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
  const size = 3 + Math.random() * 6;
  const startX = Math.random() * 100;
  const drift = (Math.random() - 0.5) * 30;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        background: index % 3 === 0 
          ? 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)'
          : 'radial-gradient(circle, hsl(var(--primary)/0.8), transparent)',
        boxShadow: index % 3 === 0 
          ? '0 0 10px rgba(255,255,255,0.5)'
          : `0 0 ${size * 2}px hsl(var(--primary)/0.4)`
      }}
      initial={{
        y: '110vh',
        x: 0,
        opacity: 0
      }}
      animate={{
        y: '-10vh',
        x: drift,
        opacity: [0, 0.8, 0.8, 0]
      }}
      transition={{
        duration: 8 + Math.random() * 4,
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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
      initial={{ width: 0, height: 0, opacity: 0.8 }}
      animate={{ 
        width: [0, 600],
        height: [0, 600],
        opacity: [0.6, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  );
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'title' | 'transition' | 'logo'>('title');
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(false);

  const handleTitleComplete = useCallback(() => {
    setTimeout(() => setPhase('transition'), 300);
    setTimeout(() => setPhase('logo'), 1000);
    setTimeout(() => setShowButton(true), 1800);
  }, []);

  const handleEnter = useCallback(() => {
    setIsVisible(false);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ 
            background: `
              radial-gradient(ellipse at 50% 0%, hsl(270 60% 15%/0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, hsl(280 70% 20%/0.3) 0%, transparent 40%),
              radial-gradient(ellipse at 20% 90%, hsl(260 60% 15%/0.3) 0%, transparent 40%),
              linear-gradient(180deg, hsl(270 50% 5%) 0%, hsl(270 40% 8%) 100%)
            `
          }}
        >
          {/* Licht-Partikel */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <LightOrb key={i} delay={i * 0.4} index={i} />
            ))}
          </div>

          {/* Pulsierende Ringe */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1, 2].map((i) => (
              <PulseRing key={i} delay={i * 1} />
            ))}
          </div>

          {/* Zentraler Glow */}
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)/0.15), transparent 70%)',
              filter: 'blur(60px)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Hauptinhalt */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4">
            
            {/* Titel-Phase */}
            <motion.div
              animate={{
                opacity: phase === 'title' ? 1 : 0,
                scale: phase === 'transition' ? 0.8 : 1,
                y: phase === 'transition' ? -50 : 0,
                filter: phase === 'transition' ? 'blur(10px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
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
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{
                opacity: phase === 'logo' ? 1 : 0,
                scale: phase === 'logo' ? 1 : 0.5,
                y: phase === 'logo' ? 0 : 30
              }}
              transition={{ 
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex flex-col items-center"
            >
              {/* Logo */}
              <motion.div
                className="relative"
                animate={{
                  filter: [
                    'drop-shadow(0 0 30px hsl(var(--primary)/0.4))',
                    'drop-shadow(0 0 50px hsl(var(--primary)/0.6))',
                    'drop-shadow(0 0 30px hsl(var(--primary)/0.4))'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <img
                  src={klangwunderLogo}
                  alt="Klangwunder Logo"
                  className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 object-contain"
                />
              </motion.div>

              {/* Markenname */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  y: phase === 'logo' ? 0 : 20 
                }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl mt-6 text-white"
                style={{
                  textShadow: '0 0 30px hsl(var(--primary)/0.5), 0 0 60px hsl(var(--primary)/0.3)'
                }}
              >
                Klangwunder
              </motion.h2>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'logo' ? 0.7 : 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="font-body text-muted-foreground mt-3 text-base sm:text-lg tracking-[0.2em] uppercase"
              >
                Klänge, die Wunder wirken
              </motion.p>
            </motion.div>
          </div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: showButton ? 1 : 0, 
              y: showButton ? 0 : 40 
            }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-20 z-10"
          >
            <motion.button
              onClick={handleEnter}
              className="group relative px-12 py-5 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(280 60% 30%/0.3))',
                border: '1px solid hsl(var(--primary)/0.4)',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 40px hsl(var(--primary)/0.4)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shine-Effekt */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--primary)/0.2), transparent)'
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              
              <span className="relative z-10 text-lg font-body tracking-[0.25em] text-white/90 group-hover:text-white transition-colors flex items-center gap-3">
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="text-primary"
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
            animate={{ opacity: showButton ? 0.4 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-10 text-xs text-muted-foreground/60 font-body tracking-wider"
          >
            Klicke um fortzufahren
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}