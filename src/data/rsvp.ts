// RSVP settings. One reply covers the whole weekend; replies arrive as a pre-written text message.

export const RSVP_REPLY_BY = 'Jan 1';

/** Where replies are texted (E.164 format) and how the number is shown to guests */
export const RSVP_PHONE = '+14125516177';
export const RSVP_PHONE_DISPLAY = '(412) 551-6177';

export type Attending = 'Joyfully accepts' | 'Regretfully declines';

export interface RsvpReply {
  name: string;
  attending: Attending;
  /** Names of the other guests in the party */
  guestNames: string[];
}

function joinNames(names: string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** The pre-written text the guest sends */
export function rsvpMessage(reply: RsvpReply): string {
  if (reply.attending === 'Regretfully declines') {
    return `Hi! It's ${reply.name} — sadly I can't make M 50, May 20–23. Wishing you an amazing celebration ❤️`;
  }
  const party = [reply.name, ...reply.guestNames];
  const partyLine = party.length > 1 ? ` Party of ${party.length}: ${joinNames(party)}.` : '';
  return `Hi! It's ${reply.name} — joyfully accepting for M 50, May 20–23 🎉${partyLine}`;
}

/**
 * Link that opens the Messages app with the text filled in. Apple devices expect `&body=`,
 * Android expects `?body=`.
 */
export function smsLink(body?: string): string {
  if (!body) return `sms:${RSVP_PHONE}`;
  const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  return `sms:${RSVP_PHONE}${apple ? '&' : '?'}body=${encodeURIComponent(body)}`;
}
