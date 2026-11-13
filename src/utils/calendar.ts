import { CalendarEvent } from '../data/itinerary';

// RFC 5545 §3.3.11: escape backslashes, semicolons, commas and newlines in TEXT values
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 §3.1: fold lines longer than 75 octets (continuation lines start with a space)
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines lose one octet to the leading space
    if (currentBytes + charBytes > limit) {
      parts.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += charBytes;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Europe/Madrid definition so clients can resolve TZID without guessing
const MADRID_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Madrid',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

export function buildICS(event: CalendarEvent): string {
  // Stable UID per event so re-importing updates rather than duplicates
  const uid = `${event.start}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@m50-ibiza`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//M50 Ibiza//Private Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...MADRID_VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART;TZID=Europe/Madrid:${event.start}`,
    `DTEND;TZID=Europe/Madrid:${event.end}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(foldLine)
    .join('\r\n') + '\r\n';
}

export function downloadICS(event: CalendarEvent): void {
  const blob = new Blob([buildICS(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after the click has been handled (immediate revoke can cancel the download in Safari)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
