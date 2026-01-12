import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import klangwunderLogo from '@/assets/klangwunder-logo.png';

interface IntroScreenProps {
  onComplete: () => void;
}

// Einzelner Buchstabe mit dramatischer Schreibanimation
function WrittenLetter({ 
  letter, 
  index,
  isActive 
}: { 
  letter: string; 
  index: number;
  isActive: boolean;
}) {
  const delay = index * 0.35; // Viel langsamer - 350ms pro Buchstabe
  
  return (
    <motion.span
      className="inline-block font-display relative"
      style={{
        textShadow: `
          0 0 40px hsl(var(--primary)),
          0 0 80px hsl(var(--primary)/0.8),
          0 0 120px hsl(var(--primary)/0.6),
          0 0 160px hsl(var(--primary)/0.4)
        `,
        color: 'transparent',
        background: 'linear-gradient(180deg, hsl(280 100% 85%) 0%, hsl(var(--primary)) 50%, hsl(260 100% 70%) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 30px hsl(var(--primary)))'
      }}
      initial={{ 
        opacity: 0,
        y: 80,
        scale: 0,
        rotateX: -180,
        rotateY: -90
      }}
      animate={isActive ? { 
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0
      } : {
        opacity: 0,
        y: 80,
        scale: 0,
        rotateX: -180,
        rotateY: -90
      }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1.2, 0.36, 1]
      }}
    >
      {letter}
      {/* Glow-Effekt hinter dem Buchstaben */}
      {isActive && (
        <motion.span
          className="absolute inset-0 blur-xl"
          style={{
            background: 'hsl(var(--primary))',
            opacity: 0.5
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.3 }}
        />
      )}
    </motion.span>
  );
}

// Schreibender Stift
function WritingPen({ 
  isWriting, 
  letterIndex, 
  totalLetters 
}: { 
  isWriting: boolean; 
  letterIndex: number;
  totalLetters: number;
}) {
  const progress = (letterIndex / totalLetters) * 100;
  
  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      style={{
        top: '50%',
        left: `calc(${progress}% + 10px)`,
        transform: 'translate(-50%, -100%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isWriting ? 1 : 0,
        scale: isWriting ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Stift-Spitze mit Glow */}
      <motion.div
        className="relative"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        {/* Leuchtender Punkt */}
        <div 
          className="w-4 h-4 rounded-full bg-primary"
          style={{
            boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary)/0.5)'
          }}
        />
        {/* Tinten-Tropfen Effekt */}
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 w-1 rounded-full bg-gradient-to-b from-primary to-transparent"
          animate={{ 
            height: [0, 20, 0],
            opacity: [1, 0.5, 0]
          }}
          transition={{ 
            duration: 0.4, 
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Haupttext-Animation
function AnimatedTitle({ 
  text, 
  isActive 
}: { 
  text: string; 
  isActive: boolean;
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
      }
    }, 350); // Viel langsamer - 350ms pro Buchstabe
    
    return () => clearInterval(interval);
  }, [isActive, text.length]);

  return (
    <div className="relative inline-block">
      {/* Schreibender Stift */}
      <WritingPen 
        isWriting={isActive && !isComplete} 
        letterIndex={currentIndex + 1}
        totalLetters={text.length}
      />
      
      {/* Buchstaben - VIEL GRÖSSER */}
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] whitespace-nowrap font-black tracking-tight">
        {text.split('').map((letter, index) => (
          <WrittenLetter
            key={index}
            letter={letter}
            index={index}
            isActive={index <= currentIndex}
          />
        ))}
      </h1>
      
      {/* Animierte Unterstreichung */}
      <motion.div
        className="absolute -bottom-2 sm:-bottom-4 left-0 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
          boxShadow: '0 0 20px hsl(var(--primary)/0.8)'
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isComplete ? '100%' : `${((currentIndex + 1) / text.length) * 100}%`,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Sparkles bei Fertigstellung */}
      <AnimatePresence>
        {isComplete && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  left: '50%',
                  top: '50%',
                  boxShadow: '0 0 10px hsl(var(--primary))'
                }}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.cos(i * Math.PI / 4) * 150,
                  y: Math.sin(i * Math.PI / 4) * 100
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Schwebende Partikel
function FloatingParticle({ delay, size }: { delay: number; size: number }) {
  const randomX = Math.random() * 100;
  const randomDuration = 5 + Math.random() * 5;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${randomX}%`,
        background: `radial-gradient(circle, hsl(var(--primary)/0.7), transparent)`,
        boxShadow: `0 0 ${size * 2}px hsl(var(--primary)/0.5)`
      }}
      initial={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: 0,
        scale: 0
      }}
      animate={{
        y: -50,
        opacity: [0, 0.8, 0.8, 0],
        scale: [0, 1.2, 1.2, 0.5]
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

// Musik-Noten
function MusicalNote({ delay }: { delay: number }) {
  const notes = ['♪', '♫', '♬', '♩'];
  const note = notes[Math.floor(Math.random() * notes.length)];
  const randomX = 10 + Math.random() * 80;
  const randomDuration = 6 + Math.random() * 4;
  
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${randomX}%`,
        fontSize: `${1.5 + Math.random() * 2}rem`,
        color: 'hsl(var(--primary)/0.5)',
        textShadow: '0 0 15px hsl(var(--primary)/0.6)'
      }}
      initial={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
        opacity: 0,
        rotate: -30,
        scale: 0
      }}
      animate={{
        y: -100,
        opacity: [0, 0.7, 0.7, 0],
        rotate: [0, 180],
        scale: [0.3, 1.2, 1.2, 0.2]
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
  const [phase, setPhase] = useState<'writing' | 'transform' | 'logo'>('writing');
  const [isVisible, setIsVisible] = useState(true);
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    // Phase timing - länger wegen langsamerer Animation
    const writingTimer = setTimeout(() => {
      setPhase('transform');
    }, 6500); // 11 Buchstaben * 350ms + Puffer

    const logoTimer = setTimeout(() => {
      setPhase('logo');
    }, 7500);

    const buttonTimer = setTimeout(() => {
      setShowEnterButton(true);
    }, 8500);

    return () => {
      clearTimeout(writingTimer);
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
            background: 'linear-gradient(135deg, hsl(270 75% 3%) 0%, hsl(270 60% 7%) 50%, hsl(270 50% 10%) 100%)' 
          }}
        >
          {/* Partikel Hintergrund */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <FloatingParticle key={`p-${i}`} delay={i * 0.5} size={4 + Math.random() * 10} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <MusicalNote key={`n-${i}`} delay={i * 0.7 + 1} />
            ))}
          </div>

          {/* Zentrale Glows */}
          <div 
            className="absolute w-[900px] h-[900px] rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary)/0.6), transparent 60%)'
            }}
          />

          {/* Hauptinhalt */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[350px] px-4">
            {/* Schreibphase */}
            <motion.div
              animate={{
                opacity: phase === 'writing' ? 1 : 0,
                scale: phase === 'transform' ? 0.6 : 1,
                y: phase === 'transform' ? -100 : 0,
                filter: phase === 'transform' ? 'blur(20px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute"
              style={{ display: phase === 'logo' ? 'none' : 'flex' }}
            >
              <AnimatedTitle 
                text="Klangwunder" 
                isActive={phase === 'writing'}
              />
            </motion.div>

            {/* Logo-Phase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2, rotate: -180 }}
              animate={{
                opacity: phase === 'logo' ? 1 : 0,
                scale: phase === 'logo' ? 1 : 0.2,
                rotate: phase === 'logo' ? 0 : -180
              }}
              transition={{ 
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="flex flex-col items-center"
            >
              {/* Logo mit Glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 50px hsl(var(--primary)/0.3)',
                    '0 0 120px hsl(var(--primary)/0.6)',
                    '0 0 50px hsl(var(--primary)/0.3)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="rounded-3xl overflow-hidden"
              >
                <motion.img
                  src={klangwunderLogo}
                  alt="Klangwunder Logo"
                  className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 25px hsl(var(--primary)/0.6))',
                      'drop-shadow(0 0 60px hsl(var(--primary)/0.9))',
                      'drop-shadow(0 0 25px hsl(var(--primary)/0.6))'
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>

              {/* Markenname */}
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  y: phase === 'logo' ? 0 : 40 
                }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl mt-8"
                style={{
                  background: 'linear-gradient(135deg, hsl(280 90% 75%), hsl(var(--primary-foreground)), hsl(260 90% 75%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 20px hsl(var(--primary)/0.5))'
                }}
              >
                Klangwunder
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'logo' ? 0.8 : 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="font-body text-muted-foreground mt-4 text-lg tracking-widest uppercase"
              >
                Klänge, die Wunder wirken
              </motion.p>
            </motion.div>
          </div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ 
              opacity: showEnterButton ? 1 : 0, 
              y: showEnterButton ? 0 : 60 
            }}
            transition={{ duration: 0.7 }}
            className="absolute bottom-24 z-10"
          >
            <motion.button
              onClick={handleEnter}
              className="group relative px-16 py-6 rounded-full glass border border-primary/50 hover:border-primary transition-all duration-500 overflow-hidden"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animierter Hintergrund */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <span className="relative z-10 text-xl font-body tracking-[0.3em] text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-4">
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                EINTRETEN
              </span>
              
              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 40px hsl(var(--primary)/0.6), inset 0 0 20px hsl(var(--primary)/0.1)' }}
              />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showEnterButton ? 0.5 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-12 text-sm text-muted-foreground font-body tracking-widest"
          >
            Klicke um die Musik zu erleben
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
