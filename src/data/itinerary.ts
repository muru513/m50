export type SectionId = 'stay' | 'thu' | 'fri' | 'sat';

export interface CalendarEvent {
  title: string;
  start: string; // YYYYMMDDTHHMMSS
  end: string;   // YYYYMMDDTHHMMSS
  location: string;
  description: string;
}

export interface ScheduleStop {
  time: string;
  title: string;
  detail: string;
}

export interface ItinerarySection {
  id: SectionId;
  tabLabel: string;
  kicker: string;
  title: string;
  eventUrl?: string;
  venue: string;
  venueArea?: string;
  googleMapsUrl?: string;
  time: string;
  dressCode: string;
  note: string;
  /** Icon shown beside the note: a fork & knife for meals, a banknote for prices */
  noteIcon: 'meal' | 'price';
  description: string;
  /** Optional run-of-day timeline, shown under the details */
  schedule?: ScheduleStop[];
  image: string;
  video?: string;
  mood: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
    scrim: string;
    /** Optional shadow for pages whose video stays bright behind the text */
    textShadow?: string;
  };
  calendar: CalendarEvent;
}

export const ITINERARY_SECTIONS: ItinerarySection[] = [
  {
    id: 'stay',
    tabLabel: 'Stay',
    kicker: 'Home Base · May 20–23, 2027',
    title: 'THB Los Molinos',
    eventUrl: 'https://www.thbhotels.com/en/hotel-los-molinos-ibiza/',
    venue: 'THB Los Molinos',
    venueArea: 'Ibiza Town',
    googleMapsUrl:
      'https://www.google.com/maps/place/Hotel+THB+Los+Molinos/@38.9043001,1.4285682,17z/data=!3m1!4b1!4m6!3m5!1s0x129946a367af2bab:0x28aa11c74b949f42!8m2!3d38.9043001!4d1.4285682!16s%2Fg%2F1tkf2_hk',
    time: 'Check-in Thu 20 · 3:00 pm\nCheck-out Sun 23 · 11:00 am',
    dressCode: '',
    note: 'Double sea view room w/ breakfast\n280 EUR / night',
    noteIcon: 'price',
    description:
      'Right on Figueretas beach in the heart of Ibiza Town, a 10-minute walk from historic Dalt Vila, with a pool on a landscaped seafront terrace — THB Los Molinos is our home base for the weekend.',
    image: '/assets/aistudio/stay_seamless_poster.jpg',
    video: '/assets/aistudio/stay_seamless_loop.mp4',
    mood: {
      // Mediterranean olive & botanical sage, with a light veil so the sunny pool video shows through
      bg: '#16241B',
      surface: 'rgba(22, 36, 27, 0.72)',
      text: '#F7FAF5',
      muted: '#D2E0D6',
      accent: '#9FD8AE',
      border: 'rgba(247, 250, 245, 0.2)',
      scrim: 'linear-gradient(to top, rgba(14,28,19,0.88) 0%, rgba(14,28,19,0.5) 52%, rgba(14,28,19,0.06) 100%)',
      // The lighter veil leaves bright sky behind the heading, so lift the text off it
      textShadow: '0 1px 2px rgba(10, 22, 14, 0.45), 0 0 18px rgba(10, 22, 14, 0.35)',
    },
    calendar: {
      title: 'M 50 — Weekend Stay at THB Los Molinos',
      start: '20270520T150000',
      end: '20270523T110000',
      location: 'THB Los Molinos, Figueretas beach, Ibiza Town, Spain',
      description: 'Home base hotel for the M 50 weekend in Ibiza. Check-in Thu May 20 from 3:00 pm, check-out Sun May 23 by 11:00 am.',
    },
  },
  {
    id: 'thu',
    tabLabel: 'Thu 20',
    kicker: 'Thursday, May 20',
    title: 'BOHO Experience at Beachouse',
    eventUrl: 'https://www.beachouseibiza.com/boho-experience',
    venue: 'Beachouse',
    venueArea: "Playa d'en Bossa",
    googleMapsUrl: 'https://maps.google.com/?q=Beachouse+Ibiza',
    time: '7:00 pm – Midnight',
    dressCode: 'Effortless Mediterranean Luxe',
    note: 'Hosted welcome dinner',
    noteIcon: 'meal',
    description:
      'Curated by Camilo Franco, BOHO Experience is a boho-chic beach party with acoustic acts, downtempo house beats, sunset drinks, and starlit Mediterranean dining and dancing under the palms.',
    image: '/assets/aistudio/beachouse_seamless_poster.jpg',
    video: '/assets/aistudio/beachouse_seamless_loop.mp4',
    mood: {
      bg: '#23160E',
      surface: 'rgba(35, 22, 14, 0.86)',
      text: '#FAF0E1',
      muted: '#D5BFA3',
      accent: '#E2A44D',
      border: 'rgba(250, 240, 225, 0.16)',
      scrim: 'linear-gradient(to top, rgba(28,17,10,0.96) 0%, rgba(28,17,10,0.78) 52%, rgba(28,17,10,0.25) 100%)',
    },
    calendar: {
      title: 'M 50 — BOHO Experience at Beachouse',
      start: '20270520T190000',
      end: '20270521T000000',
      location: "Beachouse, Playa d'en Bossa, Ibiza",
      description: 'Curated by Camilo Franco, BOHO Experience is a boho-chic beach party with acoustic acts, downtempo house beats, sunset drinks, and starlit Mediterranean dining and dancing under the palms. Dress code: Effortless Mediterranean Luxe. Hosted welcome dinner.',
    },
  },
  {
    id: 'fri',
    tabLabel: 'Fri 21',
    kicker: 'Friday, May 21',
    title: 'Yacht Cruise & Beach Lunch',
    venue: 'Beso Beach',
    time: '10:30 am – 7:00 pm',
    dressCode: 'Riviera Chic',
    note: '$500 per person (Yacht $350, Lunch $150)',
    noteIcon: 'price',
    description:
      'Sun, sea, and sangria aboard our private yacht, cruising the turquoise waters of Formentera or Ibiza, dropping anchor at a barefoot-chic beach club for a Spanish-style siesta lunch.',
    image: '/assets/aistudio/yacht_seamless_poster.jpg',
    video: '/assets/aistudio/yacht_seamless_loop.mp4',
    mood: {
      bg: '#072A40',
      surface: 'rgba(7, 42, 64, 0.84)',
      text: '#F2FAFF',
      muted: '#B5DDF2',
      accent: '#38BDF8',
      border: 'rgba(242, 250, 255, 0.18)',
      scrim: 'linear-gradient(to top, rgba(6,34,52,0.96) 0%, rgba(6,34,52,0.74) 52%, rgba(6,34,52,0.22) 100%)',
    },
    calendar: {
      title: 'M 50 — Yacht Cruise & Beach Lunch',
      start: '20270521T103000',
      end: '20270521T190000',
      location: 'Beso Beach',
      description:
        'Private yacht cruise with lunch at Beso Beach, sailing back at golden hour. Dress code: Riviera Chic. $500 per person (Yacht $350, Lunch $150).',
    },
  },
  {
    id: 'sat',
    tabLabel: 'Sat 22',
    kicker: 'Saturday, May 22',
    title: "Dinner at Jul's",
    eventUrl: 'https://julsrestaurant.com/',
    venue: "Jul's",
    venueArea: 'Sant Josep, Ibiza',
    googleMapsUrl: 'https://maps.google.com/?q=Juls+Ibiza',
    time: '7:30 pm onwards',
    dressCode: 'Unapologetically Bold Elegance',
    note: '$250 per person',
    noteIcon: 'price',
    description:
      'Raw timber, a botanical garden terrace, open-air fire pits, and mixology cocktails.',
    image: '/assets/aistudio/juls_seamless_poster.jpg',
    video: '/assets/aistudio/juls_seamless_loop.mp4',
    mood: {
      bg: '#09090B',
      surface: 'rgba(12, 12, 15, 0.88)',
      text: '#F7F1E5',
      muted: '#C8B99B',
      accent: '#D4AF37',
      border: 'rgba(212, 175, 55, 0.24)',
      scrim: 'linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.8) 52%, rgba(9,9,11,0.28) 100%)',
    },
    calendar: {
      title: "M 50 — Dinner at Jul's",
      start: '20270522T193000',
      end: '20270523T010000',
      location: "Jul's, Sant Josep de sa Talaia, Ibiza",
      description: "Botanical garden terrace, open-air fire pits, and mixology cocktails. Dress code: Unapologetically Bold Elegance. $250 per person.",
    },
  },
];
