// RSVP settings. One reply covers the whole weekend.

export const RSVP_REPLY_BY = 'Jan 1';

/**
 * Google Form that receives replies (they land in its linked Google Sheet).
 * Leave as null until the form exists: the RSVP still opens and thanks the guest,
 * but shows a "preview" note because nothing is saved.
 *
 * To connect: in the Google Form use ⋮ → Get pre-filled link, fill sample answers,
 * and copy the `entry.NNN` numbers from that link into `fields`. The action URL is
 * the form's URL with `/viewform` replaced by `/formResponse`.
 */
export const RSVP_GOOGLE_FORM: null | {
  action: string;
  fields: { name: string; attending: string; guests: string; guestNames: string };
} = null;

export type Attending = 'Joyfully accepts' | 'Regretfully declines';

export interface RsvpReply {
  name: string;
  attending: Attending;
  /** Party size including the person replying (0 when declining) */
  guests: number;
  /** Names of the other guests, comma-separated */
  guestNames: string;
}

/** Sends a reply to the Google Form. Resolves `false` when no form is connected yet. */
export async function submitRsvp(reply: RsvpReply): Promise<boolean> {
  if (!RSVP_GOOGLE_FORM) return false;
  const body = new URLSearchParams({
    [RSVP_GOOGLE_FORM.fields.name]: reply.name,
    [RSVP_GOOGLE_FORM.fields.attending]: reply.attending,
    [RSVP_GOOGLE_FORM.fields.guests]: String(reply.guests),
    [RSVP_GOOGLE_FORM.fields.guestNames]: reply.guestNames,
  });
  // Google Forms doesn't send CORS headers, so the response can't be read; a network
  // error still rejects, which the form reports to the guest.
  await fetch(RSVP_GOOGLE_FORM.action, { method: 'POST', mode: 'no-cors', body });
  return true;
}
