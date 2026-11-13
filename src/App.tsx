import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Banknote, CalendarPlus, Check, Clock, ExternalLink, MapPin, Shirt, Utensils } from 'lucide-react';
import { ITINERARY_SECTIONS, SectionId } from './data/itinerary';
import { downloadICS } from './utils/calendar';
import { OpeningScreen } from './components/OpeningScreen';

const VALID_SHORTCUT_DAYS: SectionId[] = ['stay', 'thu', 'fri', 'sat'];
const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getInitialUrlShortcut(): { entered: boolean; day: SectionId } {
  try {
    const params = new URLSearchParams(window.location.search);
    const day = params.get('day')?.toLowerCase() as SectionId | undefined;
    if (day && VALID_SHORTCUT_DAYS.includes(day)) {
      return { entered: true, day };
    }
  } catch {
    // Non-standard environments
  }
  return { entered: false, day: 'stay' };
}

export function App() {
  const initialShortcut = useRef(getInitialUrlShortcut()).current;
  const hasEnteredOnce = useRef(initialShortcut.entered);
  const shouldReduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(initialShortcut.entered);
  const [activeId, setActiveId] = useState<SectionId>(initialShortcut.day);
  const [layerOrder, setLayerOrder] = useState<SectionId[]>(() => [
    ...VALID_SHORTCUT_DAYS.filter((id) => id !== initialShortcut.day),
    initialShortcut.day,
  ]);
  const [lingeringIds, setLingeringIds] = useState<SectionId[]>([]);
  const [addedCalendarId, setAddedCalendarId] = useState<SectionId | null>(null);

  const touchStartX = useRef<number | null>(null);
  const videoRefs = useRef<Partial<Record<SectionId, HTMLVideoElement | null>>>({});
  const lingerTimers = useRef<Partial<Record<SectionId, number>>>({});
  const pauseTimers = useRef<Partial<Record<SectionId, number>>>({});
  const activeIdRef = useRef<SectionId>(activeId);
  activeIdRef.current = activeId;

  const activeIndex = ITINERARY_SECTIONS.findIndex((s) => s.id === activeId);
  const section = ITINERARY_SECTIONS[activeIndex] ?? ITINERARY_SECTIONS[0];

  const transitionDuration = shouldReduceMotion ? 0.2 : 0.6;

  // Keep the active chapter's video warm & playing immediately, and pause hidden videos once cross-dissolved
  useEffect(() => {
    ITINERARY_SECTIONS.forEach((item) => {
      const videoEl = videoRefs.current[item.id];
      if (!videoEl) return;

      if (item.id === activeId) {
        if (pauseTimers.current[item.id]) {
          window.clearTimeout(pauseTimers.current[item.id]);
          delete pauseTimers.current[item.id];
        }
        if (videoEl.paused) {
          videoEl.play().catch(() => {});
        }
      } else {
        if (pauseTimers.current[item.id]) {
          window.clearTimeout(pauseTimers.current[item.id]);
        }
        pauseTimers.current[item.id] = window.setTimeout(() => {
          if (activeIdRef.current !== item.id) {
            videoRefs.current[item.id]?.pause();
          }
          delete pauseTimers.current[item.id];
        }, 1250);
      }
    });
  }, [activeId, entered]);

  // Cleanup timers on unmount
  useEffect(() => {
    const lingerMap = lingerTimers.current;
    const pauseMap = pauseTimers.current;
    return () => {
      Object.values(lingerMap).forEach((t) => t && window.clearTimeout(t));
      Object.values(pauseMap).forEach((t) => t && window.clearTimeout(t));
    };
  }, []);

  const selectSection = useCallback(
    (nextId: SectionId) => {
      const currentId = activeIdRef.current;
      if (nextId === currentId) return;

      // Immediately start decoding/playing the incoming video before paint
      const incomingVideo = videoRefs.current[nextId];
      if (incomingVideo && incomingVideo.paused) {
        incomingVideo.play().catch(() => {});
      }

      if (lingerTimers.current[nextId]) {
        window.clearTimeout(lingerTimers.current[nextId]);
        delete lingerTimers.current[nextId];
      }

      setLingeringIds((prev) => {
        const isReversingMidFade = prev.includes(nextId);
        if (isReversingMidFade) {
          // nextId is already at opacity 1 directly underneath currentId;
          // let currentId fade smoothly back to 0 on top without z-order pop
          return prev.filter((id) => id !== nextId);
        }

        // Standard cross-dissolve: move nextId to top of stack and hold currentId
        // at opacity 1 underneath until nextId finishes fading to 100%
        setLayerOrder((order) => [...order.filter((id) => id !== nextId), nextId]);

        if (lingerTimers.current[currentId]) {
          window.clearTimeout(lingerTimers.current[currentId]);
        }
        lingerTimers.current[currentId] = window.setTimeout(() => {
          setLingeringIds((l) => l.filter((id) => id !== currentId));
          delete lingerTimers.current[currentId];
        }, 650);

        return prev.includes(currentId) ? prev : [...prev, currentId];
      });

      setActiveId(nextId);
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && entered) {
        hasEnteredOnce.current = true;
        setEntered(false);
      } else if (entered && e.key === 'ArrowRight' && activeIndex < ITINERARY_SECTIONS.length - 1) {
        selectSection(ITINERARY_SECTIONS[activeIndex + 1].id);
      } else if (entered && e.key === 'ArrowLeft' && activeIndex > 0) {
        selectSection(ITINERARY_SECTIONS[activeIndex - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entered, activeIndex, selectSection]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!entered) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!entered || touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 55) return;
    if (deltaX < 0 && activeIndex < ITINERARY_SECTIONS.length - 1) {
      selectSection(ITINERARY_SECTIONS[activeIndex + 1].id);
    } else if (deltaX > 0 && activeIndex > 0) {
      selectSection(ITINERARY_SECTIONS[activeIndex - 1].id);
    }
  };

  const handleAddToCalendar = (targetSection = section) => {
    downloadICS(targetSection.calendar);
    setAddedCalendarId(targetSection.id);
    window.setTimeout(() => {
      setAddedCalendarId((prev) => (prev === targetSection.id ? null : prev));
    }, 2200);
  };

  return (
    <div
      className="min-h-[100dvh] w-full transition-colors duration-600"
      style={{ backgroundColor: section.mood.bg, color: section.mood.text }}
    >
      {/* Overlapping Cover Overlay (0.6s zoom-dissolve) */}
      <AnimatePresence>
        {!entered && (
          <OpeningScreen
            key="opening"
            onEnter={() => {
              hasEnteredOnce.current = true;
              const currentVideo = videoRefs.current[activeIdRef.current];
              if (currentVideo && currentVideo.paused) {
                currentVideo.play().catch(() => {});
              }
              setEntered(true);
            }}
            alreadyRevealed={hasEnteredOnce.current}
          />
        )}
      </AnimatePresence>

      {/* Pre-warmed Main Itinerary Shell */}
      <div
        aria-hidden={!entered}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative min-h-[100dvh] w-full flex flex-col justify-between overflow-x-hidden ${
          !entered ? 'pointer-events-none select-none' : ''
        }`}
      >
        {/* Persistent Preloaded 4-Layer Background Video Stack */}
        <motion.div
          animate={{ scale: entered || shouldReduceMotion ? 1 : 1.03 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.65, ease: LUXURY_EASE }}
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-transform"
        >
          {ITINERARY_SECTIONS.map((item) => {
            const isLayerVisible = item.id === activeId || lingeringIds.includes(item.id);
            const zIndex = Math.max(0, layerOrder.indexOf(item.id)) + 1;

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{ opacity: isLayerVisible ? 1 : 0 }}
                transition={{ duration: transitionDuration, ease: LUXURY_EASE }}
                style={{ zIndex }}
                className="absolute inset-0 overflow-hidden will-change-opacity"
              >
                {item.video ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[item.id] = el;
                    }}
                    autoPlay={item.id === initialShortcut.day}
                    playsInline
                    muted
                    loop
                    preload="auto"
                    poster={item.image}
                    className={`h-full w-full object-cover ${
                      item.id === 'stay' ? 'object-[8%_center] sm:object-center' : 'object-center'
                    }`}
                  >
                    <source src={item.video} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item.image}
                    alt={`${item.title} at ${item.venue}`}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover ${
                      item.id === 'stay' ? 'object-[8%_center] sm:object-center' : 'object-center'
                    }`}
                  />
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: item.mood.scrim,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Minimal Top Bar */}
        <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-14 h-14 pt-safe max-w-6xl w-full mx-auto">
          <button
            type="button"
            onClick={() => {
              hasEnteredOnce.current = true;
              setEntered(false);
            }}
            className="font-display text-2xl font-medium tracking-tight min-h-[44px] flex items-center cursor-pointer hover:opacity-75 active:scale-95 transition-[color,transform,opacity] duration-500 origin-left whitespace-nowrap shrink-0"
            style={{ color: section.mood.text }}
            title="Return to Cover (Esc)"
          >
            M 50
          </button>
        </header>

        {/* Main Content — Overlapping Single-Cell Grid Cross-Dissolve */}
        <main className="relative z-10 flex-1 flex flex-col justify-start px-5 sm:px-8 lg:px-14 pb-24 pt-12 max-w-6xl w-full mx-auto">
          <div className="grid grid-cols-1 items-end w-full">
            <AnimatePresence initial={false}>
              <motion.article
                key={section.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : -6,
                  pointerEvents: 'none',
                  transition: {
                    duration: shouldReduceMotion ? 0.15 : 0.42,
                    ease: LUXURY_EASE,
                  },
                }}
                transition={{
                  duration: transitionDuration,
                  ease: LUXURY_EASE,
                }}
                style={{ color: section.mood.text }}
                className="col-start-1 row-start-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end w-full will-change-[opacity,transform]"
              >
                {/* Left: Editorial Headline & Description */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <p
                    className="text-xs tracking-[0.16em] uppercase font-medium"
                    style={{ color: section.mood.accent }}
                  >
                    {section.kicker}
                  </p>

                  <h1
                    className="font-display text-4xl sm:text-6xl font-normal leading-[1.05] tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {section.eventUrl ? (
                      <a
                        href={section.eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline underline-offset-8 decoration-1 cursor-pointer transition-opacity hover:opacity-80"
                        style={{ color: section.mood.text }}
                      >
                        {section.title}
                      </a>
                    ) : (
                      section.title
                    )}
                  </h1>

                  <p
                    className="text-sm sm:text-base leading-relaxed max-w-xl mt-1"
                    style={{ color: section.mood.muted }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Right: Unboxed Details & Calendar Action */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-3.5 text-sm">
                    {section.time && (
                      <div className="flex items-start gap-3">
                        <span
                          className="flex items-center mt-0.5"
                          style={{ color: section.mood.muted }}
                          aria-label="Time"
                          title="Time"
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                        </span>
                        <span className="font-medium text-left tabular-nums whitespace-pre-line leading-snug">
                          {section.time}
                        </span>
                      </div>
                    )}

                    {section.dressCode && (
                      <div className="flex items-start gap-3">
                        <span
                          className="flex items-center mt-0.5"
                          style={{ color: section.mood.muted }}
                          aria-label="Dress Code"
                          title="Dress Code"
                        >
                          <Shirt className="w-4 h-4 shrink-0" />
                        </span>
                        <span className="font-medium text-left leading-snug">
                          {section.dressCode}
                        </span>
                      </div>
                    )}

                    {section.note && (
                      <div className="flex items-start gap-3">
                        <span
                          className="flex items-center mt-0.5"
                          style={{ color: section.mood.muted }}
                          aria-label="Details"
                          title="Details"
                        >
                          {section.id === 'thu' ? (
                            <Utensils className="w-4 h-4 shrink-0" />
                          ) : (
                            <Banknote className="w-4 h-4 shrink-0" />
                          )}
                        </span>
                        <span className="font-medium text-left whitespace-pre-line leading-snug">
                          {section.note}
                        </span>
                      </div>
                    )}

                    {section.googleMapsUrl && (
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center"
                          style={{ color: section.mood.muted }}
                          aria-label="Location"
                          title="Location"
                        >
                          <MapPin className="w-4 h-4 shrink-0" />
                        </span>
                        <a
                          href={section.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-left hover:underline underline-offset-4 decoration-1 hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
                          style={{ color: section.mood.text }}
                        >
                          <span>
                            {section.venue} · {section.venueArea}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: section.mood.accent }} />
                        </a>
                      </div>
                    )}

                    {/* Add to Calendar as another line after maps */}
                    <button
                      type="button"
                      onClick={() => handleAddToCalendar(section)}
                      className="flex items-center gap-3 text-left cursor-pointer active:scale-95 transition-transform origin-left group py-0.5"
                    >
                      <span
                        className="flex items-center"
                        style={{ color: section.mood.muted }}
                        aria-label="Add to Calendar"
                        title="Add to Calendar"
                      >
                        {addedCalendarId === section.id ? (
                          <Check className="w-4 h-4 shrink-0" style={{ color: section.mood.accent }} />
                        ) : (
                          <CalendarPlus className="w-4 h-4 shrink-0" />
                        )}
                      </span>
                      <span
                        className="font-medium text-left hover:underline underline-offset-4 decoration-1 hover:opacity-80 transition-opacity"
                        style={{ color: section.mood.text }}
                      >
                        {addedCalendarId === section.id ? 'Calendar File Ready (.ics)' : 'Add to Calendar'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </main>

        {/* Fixed Bottom 4-Tab Navigation */}
        <nav
          aria-label="Weekend Itinerary"
          className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md pb-safe transition-[background-color,border-color] duration-500"
          style={{
            backgroundColor: section.mood.surface,
            borderTop: `1px solid ${section.mood.border}`,
          }}
        >
          <div className="max-w-xl mx-auto grid grid-cols-4 h-16">
            {ITINERARY_SECTIONS.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className="relative flex flex-col items-center justify-center min-h-[44px] text-xs font-medium tracking-wide transition-[color,transform] duration-500 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                  style={{
                    color: isActive ? section.mood.accent : section.mood.muted,
                  }}
                >
                  <span>{item.tabLabel}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute top-0 left-4 right-4 h-[2px]"
                      style={{ backgroundColor: section.mood.accent }}
                      transition={{ duration: shouldReduceMotion ? 0.15 : 0.55, ease: LUXURY_EASE }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
