import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface OpeningScreenProps {
  onEnter: () => void;
  alreadyRevealed?: boolean;
}

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onEnter, alreadyRevealed = false }) => {
  const [revealed, setRevealed] = useState(alreadyRevealed);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (revealed) return;
    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, 10000);
    // Any key press completes the reveal, matching tap-anywhere for keyboard users
    const handleKeyDown = () => setRevealed(true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [revealed]);

  // Tap anywhere during the reveal to immediately complete
  const handleScreenTap = () => {
    if (!revealed) {
      setRevealed(true);
    }
  };

  const instant = alreadyRevealed || revealed;
  const coverDuration = shouldReduceMotion ? 0.2 : 0.6;

  return (
    <motion.div
      initial={
        alreadyRevealed
          ? { opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }
          : { opacity: 0, scale: 1 }
      }
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: shouldReduceMotion ? 1 : 1.04,
        pointerEvents: 'none',
        transition: { duration: coverDuration, ease: LUXURY_EASE },
      }}
      transition={{ duration: coverDuration, ease: LUXURY_EASE }}
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-[#120F0C] text-[#F7F1E5] flex flex-col justify-between p-6 sm:p-10 select-none cursor-pointer will-change-[opacity,transform]"
    >
      {/* Live Video Background Loop */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
        <video
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          poster="/assets/opening_poster.jpg"
          className="h-full w-full object-cover object-center"
        >
          <source src="/assets/aistudio/download__1__b345d7cb.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(28, 19, 12, 0.38) 0%, rgba(14, 11, 9, 0.8) 75%, rgba(10, 9, 8, 0.94) 100%)',
          }}
        />
      </div>

      {/* Top: PRIVATE INVITATION only (glides in at 9.0s) */}
      <motion.div
        initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: instant ? 0 : 0.85, delay: instant ? 0 : 9.0, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-start text-xs tracking-[0.2em] uppercase text-[#C8B99B] pt-safe pointer-events-none"
      >
        <span>Private Invitation</span>
      </motion.div>

      {/* Centerpiece Container with Gold Border Drawn From Top-Left */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-lg mx-auto w-full">
        <div className="relative px-8 py-10 sm:px-14 sm:py-14 w-full backdrop-blur-[1px]">
          {/* Animated Gold Box drawn starting from top-left corner */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <motion.rect
              x="0.5"
              y="0.5"
              width="calc(100% - 1px)"
              height="calc(100% - 1px)"
              fill="rgba(0, 0, 0, 0.10)"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeOpacity="0.4"
              pathLength="1"
              initial={instant ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: instant ? 0 : 1.5,
                delay: instant ? 0 : 7.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </svg>

          {/* Heading: "M" zooms slowly at 1.2s, "50" settles alongside at 2.4s */}
          <h1 className="relative z-10 font-display text-7xl sm:text-8xl font-normal tracking-tight text-[#FAF4E8] leading-none mb-3 flex items-center justify-center gap-4">
            <motion.span
              initial={instant ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: instant ? 0 : 1.0, delay: instant ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block origin-center"
            >
              M
            </motion.span>
            <motion.span
              initial={instant ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: instant ? 0 : 1.0, delay: instant ? 0 : 2.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block origin-center"
            >
              50
            </motion.span>
          </h1>

          {/* est. 1977 nested directly below M 50 (at 3.6s) */}
          <motion.p
            initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : 0.85, delay: instant ? 0 : 3.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-xs tracking-[0.26em] uppercase text-[#D4AF37] mb-5 font-medium"
          >
            est. 1977
          </motion.p>

          {/* Hairline Divider (at 4.5s) */}
          <motion.div
            initial={instant ? { scaleX: 1, opacity: 0.5 } : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.5 }}
            transition={{ duration: instant ? 0 : 0.85, delay: instant ? 0 : 4.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-12 h-px bg-[#D4AF37] mx-auto mb-6 origin-center"
          />

          {/* May 20–22, 2027 and IBIZA, SPAIN (in the same slow speed as M 50) */}
          <div className="relative z-10">
            <motion.p
              initial={instant ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: instant ? 0 : 1.2, delay: instant ? 0 : 5.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-display italic text-xl sm:text-2xl text-[#E8DEC8] mb-2"
            >
              May 20–22, 2027
            </motion.p>
            <motion.p
              initial={instant ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: instant ? 0 : 1.2, delay: instant ? 0 : 6.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm tracking-[0.16em] uppercase text-[#D4AF37]"
            >
              Ibiza, Spain
            </motion.p>
          </div>
        </div>
      </div>

      {/* Resolving Finale: "Take me to Ibiza" right-aligned symmetrically to "Private Invitation" (at 9.0s) */}
      <motion.div
        initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: instant ? 0 : 0.85, delay: instant ? 0 : 9.0, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 flex items-center justify-end pb-safe w-full ${instant ? '' : 'pointer-events-none'}`}
      >
        {/* Not clickable or focusable until it has faded in; a tap anywhere first completes the reveal */}
        <button
          type="button"
          tabIndex={instant ? 0 : -1}
          aria-hidden={!instant}
          onClick={(e) => {
            e.stopPropagation();
            onEnter();
          }}
          className="group min-h-[44px] inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C8B99B] hover:text-[#FAF4E8] active:scale-95 transition-all origin-right cursor-pointer text-right"
        >
          <span>Take me to Ibiza</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </motion.div>
  );
};
