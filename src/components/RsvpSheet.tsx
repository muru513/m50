import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Minus, Plus, X } from 'lucide-react';
import { ITINERARY_SECTIONS } from '../data/itinerary';
import { Attending, RSVP_PHONE_DISPLAY, RSVP_REPLY_BY, rsvpMessage, smsLink } from '../data/rsvp';

interface RsvpSheetProps {
  onClose: () => void;
}

const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GOLD = '#D4AF37';
const INK = '#F7F1E5';
const SAND = '#C8B99B';

type Stage = 'form' | 'sending' | 'thanks' | 'error';

const MAX_GUESTS = 4;


export const RsvpSheet: React.FC<RsvpSheetProps> = ({ onClose }) => {
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<Attending | null>(null);
  const [guestCount, setGuestCount] = useState(1); // including the person replying
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('form');
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, keep the page behind from scrolling, and move focus into the sheet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const accepted = attending === 'Joyfully accepts';
  // One name per extra guest; fields not yet typed in count as empty
  const extraNames = Array.from({ length: guestCount - 1 }, (_, i) => (guestNames[i] ?? '').trim());
  const guestsNamed = !accepted || extraNames.every((n) => n.length > 0);
  const canSend = name.trim().length > 0 && attending !== null && guestsNamed && stage !== 'sending';
  const firstName = name.trim().split(/\s+/)[0] ?? '';

  const changeGuestCount = (delta: number) => {
    setGuestCount((c) => Math.min(MAX_GUESTS, Math.max(1, c + delta)));
  };
  const setGuestName = (index: number, value: string) => {
    setGuestNames((names) => {
      const next = [...names];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || !attending) return;
    // Open Messages with the reply written out (must happen directly in the tap, so no awaiting first)
    window.location.href = smsLink(
      rsvpMessage({ name: name.trim(), attending, guestNames: accepted ? extraNames : [] })
    );
    setStage('thanks');
  };


  const labelClass = 'block text-[11px] tracking-[0.16em] uppercase';
  const inputClass =
    'w-full bg-transparent border-0 border-b border-[rgba(247,241,229,0.3)] focus:border-[#D4AF37] focus:outline-none py-2 text-base placeholder:text-[rgba(247,241,229,0.4)] transition-colors';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: LUXURY_EASE }}
    >
      {/* Backdrop: tap to close */}
      <div
        className="absolute inset-0 bg-[rgba(8,7,6,0.6)] backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-title"
        className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[22px] bg-[#14110E] border-t border-[rgba(212,175,55,0.35)] px-[22px] pt-3 pb-[max(22px,env(safe-area-inset-bottom))] font-sans"
        initial={{ y: shouldReduceMotion ? 0 : '100%' }}
        animate={{ y: 0 }}
        exit={{ y: shouldReduceMotion ? 0 : '100%' }}
        transition={{ duration: shouldReduceMotion ? 0.15 : 0.5, ease: LUXURY_EASE }}
      >
        <div className="relative flex justify-center mb-3.5">
          <span aria-hidden="true" className="w-[38px] h-1 rounded bg-[rgba(247,241,229,0.25)]" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute -right-2 -top-2 w-11 h-11 flex items-center justify-center text-[rgba(247,241,229,0.6)] hover:text-[#F7F1E5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {stage === 'thanks' ? (
          <div className="text-center pt-6 pb-8 px-1.5">
            <span aria-hidden="true" className="block w-12 h-px mx-auto mb-6" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
            <h2 id="rsvp-title" className="font-display font-normal text-[40px] leading-[1.1] mb-2.5" style={{ color: INK }}>
              {accepted ? `Gracias, ${firstName}` : `Thank you, ${firstName}`}
            </h2>
            <p className="font-display italic text-[22px] mb-4" style={{ color: '#E8DEC8' }}>
              {accepted ? 'See you in Ibiza' : "You'll be missed"}
            </p>
            <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: SAND }}>
              {accepted
                ? `Can't wait to celebrate with ${extraNames.length ? 'you all' : 'you'}, May\u00a020–23.`
                : 'Thank you for letting us know.'}
            </p>
            <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: '#E8DEC8' }}>
              Your reply is ready in Messages —<br />
              just tap <span style={{ color: '#E9C96A' }}>Send</span> to finish.
            </p>
            <p className="text-[12px] leading-relaxed mb-6" style={{ color: 'rgba(247,241,229,0.55)' }}>
              Messages didn't open? Text{' '}
              <a href={smsLink()} className="underline underline-offset-2" style={{ color: SAND }}>
                {RSVP_PHONE_DISPLAY}
              </a>
              <br />
              Plans change? Simply text again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="group min-h-11 inline-flex items-center gap-2 text-[13px] tracking-[0.2em] uppercase cursor-pointer"
              style={{ color: '#E9C96A' }}
            >
              <span>Back to the weekend</span>
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-[11px] tracking-[0.22em] uppercase mb-1" style={{ color: GOLD }}>
              M 50 · Ibiza · May 20–23, 2027
            </p>
            <h2 id="rsvp-title" className="font-display font-normal text-[32px] leading-[1.1] mb-1" style={{ color: INK }}>
              Celebrate with us
            </h2>
            <p className="text-[13px] leading-snug mb-3" style={{ color: SAND }}>
              RSVP by {RSVP_REPLY_BY}
            </p>

            {/* The weekend at a glance, so guests see every day and its cost before replying */}
            <ul className="mb-4 border-b border-[rgba(247,241,229,0.1)]">
              {ITINERARY_SECTIONS.map((s) => (
                <li
                  key={s.id}
                  className="grid grid-cols-[62px_1fr] gap-2.5 py-2 border-t border-[rgba(247,241,229,0.1)]"
                >
                  <span className="text-[11px] tracking-[0.18em] uppercase pt-[3px]" style={{ color: GOLD }}>
                    {s.tabLabel}
                  </span>
                  <span>
                    <span className="block font-display text-[19px] leading-[1.15]" style={{ color: INK }}>
                      {s.title}
                    </span>
                    <span className="block text-[12.5px] mt-0.5" style={{ color: SAND }}>
                      {s.rsvpSummary}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <label htmlFor="rsvp-name" className={labelClass} style={{ color: SAND }}>
              Your name
            </label>
            <input
              id="rsvp-name"
              type="text"
              autoComplete="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mb-4`}
              style={{ color: INK }}
              required
            />

            <div role="radiogroup" aria-label="Will you attend?" className="flex gap-2.5 mb-4">
              {(['Joyfully accepts', 'Regretfully declines'] as Attending[]).map((option) => {
                const selected = attending === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAttending(option)}
                    className="flex-1 min-h-11 rounded-full text-[14px] transition-colors cursor-pointer"
                    style={
                      selected
                        ? { backgroundColor: GOLD, color: '#14110E', fontWeight: 600 }
                        : { border: '1px solid rgba(247,241,229,0.3)', color: '#E8DEC8' }
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {accepted && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span id="rsvp-guests-label" className={labelClass} style={{ color: SAND }}>
                    Guests, including you
                  </span>
                  <div className="flex items-center" role="group" aria-labelledby="rsvp-guests-label">
                    <button
                      type="button"
                      onClick={() => changeGuestCount(-1)}
                      disabled={guestCount <= 1}
                      aria-label="Fewer guests"
                      className="w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
                      style={{ color: SAND }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span aria-live="polite" className="w-6 text-center text-base tabular-nums" style={{ color: INK }}>
                      {guestCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeGuestCount(1)}
                      disabled={guestCount >= MAX_GUESTS}
                      aria-label="More guests"
                      className="w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
                      style={{ color: SAND }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {Array.from({ length: guestCount - 1 }, (_, i) => (
                  <div key={i} className="mb-3">
                    <label htmlFor={`rsvp-guest-${i}`} className={labelClass} style={{ color: SAND }}>
                      {guestCount > 2 ? `Guest ${i + 1}'s name` : "Your guest's name"}
                    </label>
                    <input
                      id={`rsvp-guest-${i}`}
                      type="text"
                      placeholder="Full name"
                      value={guestNames[i] ?? ''}
                      onChange={(e) => setGuestName(i, e.target.value)}
                      className={inputClass}
                      style={{ color: INK }}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {stage === 'error' && (
              <p role="alert" className="text-[13px] mb-3" style={{ color: '#F2B8A0' }}>
                Your reply didn't send — please check your connection and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={!canSend}
              className="w-full min-h-12 rounded-full text-[12.5px] tracking-[0.24em] uppercase transition-opacity cursor-pointer disabled:cursor-default disabled:opacity-45"
              style={{ border: `1px solid ${GOLD}`, color: '#E9C96A' }}
            >
              Send reply
            </button>
            <p className="text-center text-[11.5px] mt-3" style={{ color: 'rgba(247,241,229,0.45)' }}>
              Opens Messages with your reply written out
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};
