import { DataSource, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../src/entities/user.entity';
import { OrganizerProfile } from '../src/entities/organizer-profile.entity';
import { Category } from '../src/entities/category.entity';
import { Event, EventStatus } from '../src/entities/event.entity';
import { EventLocation } from '../src/entities/event-location.entity';
import { EventImage } from '../src/entities/event-image.entity';
import { Ticket } from '../src/entities/ticket.entity';
import { Booking } from '../src/entities/booking.entity';
import { Review } from '../src/entities/review.entity';
import { SavedEvent } from '../src/entities/saved-event.entity';
import { UserPreference } from '../src/entities/user-preference.entity';

type CategoryName =
  | 'Music'
  | 'Technology'
  | 'Sports & Fitness'
  | 'Food & Drink'
  | 'Arts & Culture'
  | 'Business & Networking'
  | 'Comedy & Entertainment'
  | 'Travel & Outdoor'
  | 'Gaming & Esports'
  | 'Health & Wellness';

type VenueKey =
  | 'karachiArena'
  | 'maujResort'
  | 'frereHall'
  | 'lahoreFort'
  | 'packagesMall'
  | 'isbConvention'
  | 'damanEKoh'
  | 'peshawarMuseum'
  | 'nyRooftop'
  | 'brooklynWarehouse'
  | 'sfMoscone'
  | 'austinWarehouse'
  | 'chicagoPier'
  | 'laForum'
  | 'seattleHub'
  | 'miamiBeach'
  | 'denverTrail'
  | 'bostonTheatre';

interface VenueSeed {
  key: VenueKey;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

interface OrganizerSeed {
  key: string;
  name: string;
  email: string;
  organizationName: string;
  venueKey: VenueKey;
}

interface TicketSeed {
  name: string;
  price: number;
  salesStartOffset: number;
  salesEndOffset: number;
}

interface EventSeed {
  name: string;
  description: string;
  venueKey: VenueKey;
  organizerKey: string;
  categoryNames: CategoryName[];
  capacity: number;
  imageUrls: string[];
  durationHours: number;
  ticketSeeds: TicketSeed[];
  timing: {
    type: 'past' | 'ongoing' | 'future';
    startOffsetDays: number;
  };
}

const CATEGORIES: CategoryName[] = [
  'Music',
  'Technology',
  'Sports & Fitness',
  'Food & Drink',
  'Arts & Culture',
  'Business & Networking',
  'Comedy & Entertainment',
  'Travel & Outdoor',
  'Gaming & Esports',
  'Health & Wellness',
];

const VENUES: VenueSeed[] = [
  {
    key: 'karachiArena',
    address: 'National Stadium Road',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    postalCode: '74800',
    latitude: 24.8926,
    longitude: 67.0685,
  },
  {
    key: 'maujResort',
    address: 'Do Darya, Phase VIII',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    postalCode: '75500',
    latitude: 24.8006,
    longitude: 67.0305,
  },
  {
    key: 'frereHall',
    address: 'Fatima Jinnah Road',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    postalCode: '75530',
    latitude: 24.8475,
    longitude: 67.0316,
  },
  {
    key: 'lahoreFort',
    address: 'Fort Road, Walled City',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    postalCode: '54000',
    latitude: 31.5889,
    longitude: 74.3105,
  },
  {
    key: 'packagesMall',
    address: 'Walton Road',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    postalCode: '54792',
    latitude: 31.4697,
    longitude: 74.3566,
  },
  {
    key: 'isbConvention',
    address: 'Club Road, G-5/2',
    city: 'Islamabad',
    state: 'Islamabad Capital Territory',
    country: 'Pakistan',
    postalCode: '44000',
    latitude: 33.7294,
    longitude: 73.0931,
  },
  {
    key: 'damanEKoh',
    address: 'Pir Sohawa Road',
    city: 'Islamabad',
    state: 'Islamabad Capital Territory',
    country: 'Pakistan',
    postalCode: '44000',
    latitude: 33.7513,
    longitude: 73.0806,
  },
  {
    key: 'peshawarMuseum',
    address: 'Saddar Road',
    city: 'Peshawar',
    state: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    postalCode: '25000',
    latitude: 34.0085,
    longitude: 71.5785,
  },
  {
    key: 'nyRooftop',
    address: '1 World Trade Center',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10007',
    latitude: 40.7127,
    longitude: -74.0134,
  },
  {
    key: 'brooklynWarehouse',
    address: '99 Scott Avenue',
    city: 'Brooklyn',
    state: 'NY',
    country: 'USA',
    postalCode: '11237',
    latitude: 40.7059,
    longitude: -73.9338,
  },
  {
    key: 'sfMoscone',
    address: '747 Howard Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94103',
    latitude: 37.7845,
    longitude: -122.4014,
  },
  {
    key: 'austinWarehouse',
    address: '305 East 5th Street',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    postalCode: '78701',
    latitude: 30.2669,
    longitude: -97.7403,
  },
  {
    key: 'chicagoPier',
    address: '600 East Grand Avenue',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60611',
    latitude: 41.8917,
    longitude: -87.6078,
  },
  {
    key: 'laForum',
    address: '3900 West Manchester Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    postalCode: '90305',
    latitude: 33.9582,
    longitude: -118.3419,
  },
  {
    key: 'seattleHub',
    address: '800 Occidental Avenue South',
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    postalCode: '98134',
    latitude: 47.5984,
    longitude: -122.3331,
  },
  {
    key: 'miamiBeach',
    address: '1 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    country: 'USA',
    postalCode: '33139',
    latitude: 25.7713,
    longitude: -80.1341,
  },
  {
    key: 'denverTrail',
    address: '2001 Colorado Boulevard',
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    postalCode: '80205',
    latitude: 39.7487,
    longitude: -104.9423,
  },
  {
    key: 'bostonTheatre',
    address: '539 Washington Street',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    postalCode: '02111',
    latitude: 42.3523,
    longitude: -71.0621,
  },
];

const ORGANIZERS: OrganizerSeed[] = [
  { key: 'maya', name: 'Maya Chen', email: 'maya@eventide.dev', organizationName: 'Skyline Productions', venueKey: 'nyRooftop' },
  { key: 'james', name: 'James Rivera', email: 'james@eventide.dev', organizationName: 'Bass Drop Events', venueKey: 'laForum' },
  { key: 'priya', name: 'Priya Patel', email: 'priya@eventide.dev', organizationName: 'TechTalks Inc.', venueKey: 'sfMoscone' },
  { key: 'omar', name: 'Omar Hassan', email: 'omar@eventide.dev', organizationName: 'Global Gastronomy', venueKey: 'chicagoPier' },
  { key: 'sophie', name: 'Sophie Laurent', email: 'sophie@eventide.dev', organizationName: 'Artisan Collective', venueKey: 'austinWarehouse' },
  { key: 'david', name: 'David Kim', email: 'david@eventide.dev', organizationName: 'FinTech Forum', venueKey: 'seattleHub' },
  { key: 'fatima', name: 'Fatima Ali', email: 'fatima@eventide.dev', organizationName: 'Karachi Culture Lab', venueKey: 'frereHall' },
  { key: 'hassan', name: 'Hassan Raza', email: 'hassan@eventide.dev', organizationName: 'Lahore Live', venueKey: 'lahoreFort' },
  { key: 'zara', name: 'Zara Khan', email: 'zara@eventide.dev', organizationName: 'Capital Connect PK', venueKey: 'isbConvention' },
  { key: 'bilal', name: 'Bilal Shah', email: 'bilal@eventide.dev', organizationName: 'Summit Trails Pakistan', venueKey: 'damanEKoh' },
];

const FIRST_NAMES = [
  'Aarav', 'Aisha', 'Alex', 'Amina', 'Avery', 'Bilal', 'Casey', 'Daniyal', 'Dua', 'Emaan',
  'Farah', 'Hadia', 'Hamza', 'Hassan', 'Ibrahim', 'Inaya', 'Jordan', 'Khadija', 'Laila', 'Mikael',
  'Noah', 'Noor', 'Omar', 'Quinn', 'Raza', 'Riley', 'Sana', 'Saad', 'Taylor', 'Usman',
];

const LAST_NAMES = [
  'Ahmed', 'Ali', 'Brown', 'Butt', 'Chen', 'Davis', 'Garcia', 'Hassan', 'Iqbal', 'Jackson',
  'Johnson', 'Khan', 'Malik', 'Miller', 'Patel', 'Raza', 'Rivera', 'Shah', 'Smith', 'Williams',
];

const REVIEW_TEMPLATES = [
  'Amazing event! The organization was flawless and the atmosphere was incredible.',
  'Great experience overall. I would absolutely attend again next year.',
  'Well-organized, timely, and genuinely worth the ticket price.',
  'The venue felt perfect for this kind of event. Everything flowed smoothly.',
  'Excellent programming and great crowd energy from start to finish.',
  'Loved the lineup and the on-site experience. Food and logistics were solid.',
  'Very good event. A bit crowded at times, but still a memorable experience.',
  'Strong content and a friendly audience. Would recommend to friends.',
  'The speakers were sharp and the networking opportunities were excellent.',
  'Great production value. The organizers clearly cared about the details.',
  'A fun and polished event with just the right amount of structure.',
  'Really enjoyable overall. I left with useful ideas and good memories.',
  'The music, venue, and pacing all came together beautifully.',
  'A thoughtful event with a lot of heart behind it.',
  'Good event, though the start ran a little late. Still very worthwhile.',
  'Solid experience. The content was strong and the staff were helpful.',
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function randomDateBetween(start: Date, end: Date) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const diff = Math.max(endTime - startTime, 60 * 60 * 1000);
  return new Date(startTime + Math.random() * diff);
}

function weightedRandom(weights: number[]) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  let current = Math.random() * total;
  for (let index = 0; index < weights.length; index += 1) {
    current -= weights[index];
    if (current <= 0) return index + 1;
  }
  return weights.length;
}

function makeTicketSeeds(basePrice: number, startWindow: number, endWindow: number): TicketSeed[] {
  return [
    {
      name: 'General Admission',
      price: basePrice,
      salesStartOffset: startWindow,
      salesEndOffset: endWindow,
    },
  ];
}

function buildEventSeeds(): EventSeed[] {
  return [
    {
      name: 'Karachi Seaside Food Carnival',
      description: 'A multi-day waterfront food festival featuring Karachi chefs, live music, and regional street food pop-ups.',
      venueKey: 'maujResort',
      organizerKey: 'fatima',
      categoryNames: ['Food & Drink', 'Arts & Culture'],
      capacity: 450,
      imageUrls: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(18, -36, -4),
      timing: { type: 'future', startOffsetDays: 18 },
    },
    {
      name: 'Lahore Heritage Qawwali Night',
      description: 'An atmospheric evening of qawwali, storytelling, and old-city food stalls inside Lahore’s historic district.',
      venueKey: 'lahoreFort',
      organizerKey: 'hassan',
      categoryNames: ['Music', 'Arts & Culture'],
      capacity: 380,
      imageUrls: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'],
      durationHours: 5,
      ticketSeeds: [
        { name: 'Courtyard Pass', price: 16, salesStartOffset: -40, salesEndOffset: -2 },
        { name: 'Front Row Seating', price: 28, salesStartOffset: -35, salesEndOffset: -2 },
      ],
      timing: { type: 'future', startOffsetDays: 12 },
    },
    {
      name: 'Islamabad Product Leaders Summit',
      description: 'Founders, PMs, and growth teams gather for practical product strategy sessions and regional case studies.',
      venueKey: 'isbConvention',
      organizerKey: 'zara',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 520,
      imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'],
      durationHours: 8,
      ticketSeeds: [
        { name: 'Standard Pass', price: 45, salesStartOffset: -50, salesEndOffset: -1 },
        { name: 'Founder Circle', price: 80, salesStartOffset: -50, salesEndOffset: -3 },
      ],
      timing: { type: 'future', startOffsetDays: 22 },
    },
    {
      name: 'Margalla Sunrise Wellness Walk',
      description: 'A guided sunrise walk with breathwork, mobility drills, and healthy breakfast stations overlooking the city.',
      venueKey: 'damanEKoh',
      organizerKey: 'bilal',
      categoryNames: ['Health & Wellness', 'Travel & Outdoor'],
      capacity: 140,
      imageUrls: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(12, -20, -1),
      timing: { type: 'future', startOffsetDays: 7 },
    },
    {
      name: 'Karachi Indie Game Showcase',
      description: 'Local studios and university teams demo original games, host mini tournaments, and pitch to publisher scouts.',
      venueKey: 'karachiArena',
      organizerKey: 'fatima',
      categoryNames: ['Gaming & Esports', 'Technology'],
      capacity: 700,
      imageUrls: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'],
      durationHours: 9,
      ticketSeeds: [
        { name: 'Expo Pass', price: 14, salesStartOffset: -28, salesEndOffset: -1 },
        { name: 'Tournament Slot', price: 24, salesStartOffset: -28, salesEndOffset: -2 },
      ],
      timing: { type: 'future', startOffsetDays: 30 },
    },
    {
      name: 'Frere Hall Open-Air Design Market',
      description: 'An evening market with illustration pop-ups, handmade crafts, design talks, and acoustic sets in the gardens.',
      venueKey: 'frereHall',
      organizerKey: 'fatima',
      categoryNames: ['Arts & Culture', 'Business & Networking'],
      capacity: 260,
      imageUrls: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(10, -22, -1),
      timing: { type: 'future', startOffsetDays: 10 },
    },
    {
      name: 'Peshawar Storytelling & Craft Fair',
      description: 'A cultural gathering celebrating regional crafts, oral history, and food traditions from across Khyber Pakhtunkhwa.',
      venueKey: 'peshawarMuseum',
      organizerKey: 'bilal',
      categoryNames: ['Arts & Culture', 'Food & Drink'],
      capacity: 220,
      imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(9, -18, -1),
      timing: { type: 'future', startOffsetDays: 26 },
    },
    {
      name: 'Brooklyn Electronic Music Festival',
      description: 'Three stages, inventive visual art, and a deep lineup of electronic artists across a full weekend.',
      venueKey: 'brooklynWarehouse',
      organizerKey: 'james',
      categoryNames: ['Music', 'Arts & Culture'],
      capacity: 1100,
      imageUrls: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200'],
      durationHours: 10,
      ticketSeeds: [
        { name: 'Festival Pass', price: 75, salesStartOffset: -45, salesEndOffset: -1 },
        { name: 'VIP Terrace', price: 140, salesStartOffset: -45, salesEndOffset: -2 },
      ],
      timing: { type: 'future', startOffsetDays: 16 },
    },
    {
      name: 'React & Beyond Builders Conference',
      description: 'A one-day conference for frontend teams covering React architecture, DX, and performance at scale.',
      venueKey: 'sfMoscone',
      organizerKey: 'priya',
      categoryNames: ['Technology'],
      capacity: 620,
      imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200'],
      durationHours: 8,
      ticketSeeds: [
        { name: 'Early Bird', price: 95, salesStartOffset: -60, salesEndOffset: -20 },
        { name: 'Standard', price: 135, salesStartOffset: -19, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 35 },
    },
    {
      name: 'Austin Founder Mixer',
      description: 'An intentional networking night pairing startup founders, operators, and investors around curated conversation prompts.',
      venueKey: 'austinWarehouse',
      organizerKey: 'sophie',
      categoryNames: ['Business & Networking'],
      capacity: 180,
      imageUrls: ['https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(22, -25, -1),
      timing: { type: 'future', startOffsetDays: 9 },
    },
    {
      name: 'Chicago Lakefront Half Marathon',
      description: 'A polished half-marathon experience with timing chips, hydration stations, and a fast scenic route by the lake.',
      venueKey: 'chicagoPier',
      organizerKey: 'omar',
      categoryNames: ['Sports & Fitness', 'Health & Wellness'],
      capacity: 950,
      imageUrls: ['https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200'],
      durationHours: 5,
      ticketSeeds: [
        { name: 'Runner Registration', price: 55, salesStartOffset: -70, salesEndOffset: -3 },
      ],
      timing: { type: 'future', startOffsetDays: 40 },
    },
    {
      name: 'Los Angeles Stand-Up All Stars',
      description: 'A fast-paced comedy night bringing together touring headliners, sharp local comics, and surprise guests.',
      venueKey: 'laForum',
      organizerKey: 'james',
      categoryNames: ['Comedy & Entertainment'],
      capacity: 430,
      imageUrls: ['https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200'],
      durationHours: 3,
      ticketSeeds: [
        { name: 'Club Entry', price: 26, salesStartOffset: -30, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 14 },
    },
    {
      name: 'Seattle Cloud & AI Meetup',
      description: 'A practical meetup focused on deploying AI systems reliably, with demos from engineering teams in production.',
      venueKey: 'seattleHub',
      organizerKey: 'david',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 240,
      imageUrls: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(18, -21, -1),
      timing: { type: 'future', startOffsetDays: 11 },
    },
    {
      name: 'Miami Beach Wellness Weekend',
      description: 'Sunrise yoga, recovery sessions, nutrition panels, and a breezy coastal community wellness experience.',
      venueKey: 'miamiBeach',
      organizerKey: 'david',
      categoryNames: ['Health & Wellness'],
      capacity: 320,
      imageUrls: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200'],
      durationHours: 7,
      ticketSeeds: [
        { name: 'Weekend Pass', price: 68, salesStartOffset: -35, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 27 },
    },
    {
      name: 'Denver Alpine Trail Camp',
      description: 'A guided outdoor weekend with trail runs, campfire talks, and high-altitude recovery workshops.',
      venueKey: 'denverTrail',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Sports & Fitness'],
      capacity: 160,
      imageUrls: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'],
      durationHours: 9,
      ticketSeeds: [
        { name: 'Basecamp Pass', price: 48, salesStartOffset: -42, salesEndOffset: -2 },
      ],
      timing: { type: 'future', startOffsetDays: 33 },
    },
    {
      name: 'Boston Late Night Improv Jam',
      description: 'An audience-driven improv night with rotating troupes, musical bits, and a packed downtown crowd.',
      venueKey: 'bostonTheatre',
      organizerKey: 'sophie',
      categoryNames: ['Comedy & Entertainment', 'Arts & Culture'],
      capacity: 210,
      imageUrls: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(19, -20, -1),
      timing: { type: 'future', startOffsetDays: 5 },
    },
    {
      name: 'NYC Rooftop Jazz Sessions',
      description: 'An intimate live jazz evening with skyline views, craft cocktails, and a beautifully paced set list.',
      venueKey: 'nyRooftop',
      organizerKey: 'maya',
      categoryNames: ['Music'],
      capacity: 190,
      imageUrls: ['https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(38, -25, -1),
      timing: { type: 'future', startOffsetDays: 20 },
    },
    {
      name: 'Karachi Startup Demo Day',
      description: 'Seed-stage founders pitch to operators and investors while product teams demo what they have shipped recently.',
      venueKey: 'karachiArena',
      organizerKey: 'zara',
      categoryNames: ['Business & Networking', 'Technology'],
      capacity: 300,
      imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200'],
      durationHours: 6,
      ticketSeeds: [
        { name: 'Community Pass', price: 14, salesStartOffset: -24, salesEndOffset: -1 },
        { name: 'Investor Lounge', price: 32, salesStartOffset: -24, salesEndOffset: -2 },
      ],
      timing: { type: 'future', startOffsetDays: 24 },
    },
    {
      name: 'Lahore Winter Food Street Preview',
      description: 'Chefs, home bakers, and specialty coffee pop-ups preview a winter food season with live performances.',
      venueKey: 'packagesMall',
      organizerKey: 'hassan',
      categoryNames: ['Food & Drink', 'Music'],
      capacity: 340,
      imageUrls: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(11, -18, -1),
      timing: { type: 'future', startOffsetDays: 8 },
    },
    {
      name: 'Islamabad UX Writing Workshop',
      description: 'Hands-on exercises for product and design teams who want clearer microcopy and better in-app guidance.',
      venueKey: 'isbConvention',
      organizerKey: 'zara',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 120,
      imageUrls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(21, -16, -1),
      timing: { type: 'future', startOffsetDays: 13 },
    },
    {
      name: 'Seaside Fitness Bootcamp Karachi',
      description: 'A high-energy fitness bootcamp by the water with trainers, DJ sets, hydration lounges, and recovery pods.',
      venueKey: 'maujResort',
      organizerKey: 'fatima',
      categoryNames: ['Sports & Fitness', 'Health & Wellness'],
      capacity: 175,
      imageUrls: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(13, -14, -1),
      timing: { type: 'future', startOffsetDays: 6 },
    },
    {
      name: 'Peshawar Outdoor Film & Food Night',
      description: 'An evening screening under the stars paired with regional dishes, family seating, and local performers.',
      venueKey: 'peshawarMuseum',
      organizerKey: 'bilal',
      categoryNames: ['Comedy & Entertainment', 'Food & Drink'],
      capacity: 200,
      imageUrls: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(8, -12, -1),
      timing: { type: 'future', startOffsetDays: 15 },
    },
    {
      name: 'Austin Design & Makers Expo',
      description: 'Independent makers, product designers, and fabrication studios share installations, products, and talks.',
      venueKey: 'austinWarehouse',
      organizerKey: 'sophie',
      categoryNames: ['Arts & Culture', 'Business & Networking'],
      capacity: 250,
      imageUrls: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'],
      durationHours: 7,
      ticketSeeds: makeTicketSeeds(27, -26, -1),
      timing: { type: 'future', startOffsetDays: 31 },
    },
    {
      name: 'Chicago Chef Collaboration Series',
      description: 'A ticketed dinner event where guest chefs collaborate on one menu and walk guests through each course.',
      venueKey: 'chicagoPier',
      organizerKey: 'omar',
      categoryNames: ['Food & Drink'],
      capacity: 150,
      imageUrls: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'],
      durationHours: 4,
      ticketSeeds: [
        { name: 'Tasting Menu', price: 64, salesStartOffset: -34, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 19 },
    },
    {
      name: 'LA Pop Culture Comedy Roast',
      description: 'Sharp comics, crowd interaction, and a theme night built around TV, fandom, and entertainment nostalgia.',
      venueKey: 'laForum',
      organizerKey: 'james',
      categoryNames: ['Comedy & Entertainment'],
      capacity: 260,
      imageUrls: ['https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(24, -18, -1),
      timing: { type: 'future', startOffsetDays: 28 },
    },
    {
      name: 'Seattle Indie Esports Finals',
      description: 'Regional finals for indie esports circuits with streamer desks, crowd cams, and finals-day production.',
      venueKey: 'seattleHub',
      organizerKey: 'david',
      categoryNames: ['Gaming & Esports'],
      capacity: 420,
      imageUrls: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200'],
      durationHours: 8,
      ticketSeeds: [
        { name: 'Arena Pass', price: 35, salesStartOffset: -25, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 17 },
    },
    {
      name: 'Miami Beach Sunset Soundbath',
      description: 'A low-key oceanfront wellness session blending restorative movement, soundbath work, and sunset views.',
      venueKey: 'miamiBeach',
      organizerKey: 'david',
      categoryNames: ['Health & Wellness', 'Arts & Culture'],
      capacity: 100,
      imageUrls: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(20, -14, -1),
      timing: { type: 'future', startOffsetDays: 4 },
    },
    {
      name: 'Denver Adventure Creator Camp',
      description: 'Outdoor brands and creators meet for workshops on expedition storytelling, sponsorships, and trail content.',
      venueKey: 'denverTrail',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Business & Networking'],
      capacity: 130,
      imageUrls: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(44, -24, -1),
      timing: { type: 'future', startOffsetDays: 42 },
    },
    {
      name: 'Boston Storytelling Showcase',
      description: 'Writers and performers share personal stories, crafted monologues, and intimate live sets in a cozy theatre room.',
      venueKey: 'bostonTheatre',
      organizerKey: 'sophie',
      categoryNames: ['Arts & Culture', 'Comedy & Entertainment'],
      capacity: 145,
      imageUrls: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(17, -16, -1),
      timing: { type: 'future', startOffsetDays: 23 },
    },
    {
      name: 'Karachi Live Sessions Weekender',
      description: 'A city music weekender with indie pop, electronic acts, and collaborative sets from emerging Pakistani artists.',
      venueKey: 'karachiArena',
      organizerKey: 'fatima',
      categoryNames: ['Music'],
      capacity: 850,
      imageUrls: ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'],
      durationHours: 9,
      ticketSeeds: [
        { name: 'Weekend Pass', price: 29, salesStartOffset: -32, salesEndOffset: -1 },
      ],
      timing: { type: 'future', startOffsetDays: 37 },
    },
    {
      name: 'Islamabad Civic Tech Hackday',
      description: 'Developers and civic operators build lightweight tools for transport, public services, and community coordination.',
      venueKey: 'isbConvention',
      organizerKey: 'zara',
      categoryNames: ['Technology', 'Gaming & Esports'],
      capacity: 210,
      imageUrls: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200'],
      durationHours: 10,
      ticketSeeds: makeTicketSeeds(15, -20, -1),
      timing: { type: 'future', startOffsetDays: 29 },
    },
    {
      name: 'Lahore Rooftop Startup Social',
      description: 'An evening of founder intros, operator lightning talks, and rooftop networking in central Lahore.',
      venueKey: 'packagesMall',
      organizerKey: 'hassan',
      categoryNames: ['Business & Networking'],
      capacity: 170,
      imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(12, -16, -1),
      timing: { type: 'future', startOffsetDays: 21 },
    },
    {
      name: 'Karachi Beach Cleanup & Run Club',
      description: 'A community cleanup followed by a social run, recovery drinks, and outdoor brand activations.',
      venueKey: 'maujResort',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Sports & Fitness'],
      capacity: 120,
      imageUrls: ['https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(6, -10, -1),
      timing: { type: 'ongoing', startOffsetDays: -1 },
    },
    {
      name: 'Lahore Ramble Street Food Rally',
      description: 'A guided tasting rally across old Lahore with live music pockets and chef-curated tasting stops.',
      venueKey: 'lahoreFort',
      organizerKey: 'hassan',
      categoryNames: ['Food & Drink', 'Travel & Outdoor'],
      capacity: 180,
      imageUrls: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(14, -12, -1),
      timing: { type: 'ongoing', startOffsetDays: -2 },
    },
    {
      name: 'Islamabad Wellness Reset Retreat',
      description: 'An active-city reset with guided mobility, nutrition coaching, and reflective sessions for busy professionals.',
      venueKey: 'damanEKoh',
      organizerKey: 'zara',
      categoryNames: ['Health & Wellness'],
      capacity: 90,
      imageUrls: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(24, -18, -1),
      timing: { type: 'ongoing', startOffsetDays: 0 },
    },
    {
      name: 'Seattle Shipping AI Roundtables',
      description: 'A series of tightly curated roundtables on AI product adoption, ops integration, and internal enablement.',
      venueKey: 'seattleHub',
      organizerKey: 'david',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 110,
      imageUrls: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(31, -15, -1),
      timing: { type: 'ongoing', startOffsetDays: -1 },
    },
    {
      name: 'Chicago Spring Laugh Riot',
      description: 'A packed comedy showcase with touring comics, local favorites, and a late-night audience energy.',
      venueKey: 'chicagoPier',
      organizerKey: 'omar',
      categoryNames: ['Comedy & Entertainment'],
      capacity: 280,
      imageUrls: ['https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(22, -14, -1),
      timing: { type: 'ongoing', startOffsetDays: 0 },
    },
    {
      name: 'Karachi Monsoon Arts Residency Showcase',
      description: 'Residency artists present installations, live sketches, short films, and collaborative works from a month-long program.',
      venueKey: 'frereHall',
      organizerKey: 'fatima',
      categoryNames: ['Arts & Culture'],
      capacity: 170,
      imageUrls: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(11, -16, -1),
      timing: { type: 'past', startOffsetDays: -18 },
    },
    {
      name: 'Lahore Ecom Growth Forum',
      description: 'Operators and founders unpack e-commerce growth playbooks, retention experiments, and logistics realities.',
      venueKey: 'packagesMall',
      organizerKey: 'hassan',
      categoryNames: ['Business & Networking', 'Technology'],
      capacity: 240,
      imageUrls: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'],
      durationHours: 7,
      ticketSeeds: makeTicketSeeds(22, -40, -2),
      timing: { type: 'past', startOffsetDays: -28 },
    },
    {
      name: 'Islamabad Civic Dialogue Sessions',
      description: 'A city-focused policy and design forum featuring civic technologists, planners, and founders.',
      venueKey: 'isbConvention',
      organizerKey: 'zara',
      categoryNames: ['Business & Networking', 'Arts & Culture'],
      capacity: 200,
      imageUrls: ['https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(18, -35, -3),
      timing: { type: 'past', startOffsetDays: -35 },
    },
    {
      name: 'Peshawar Heritage Walk Weekend',
      description: 'A guided cultural walk through historic quarters with storytellers, local guides, and photography stops.',
      venueKey: 'peshawarMuseum',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Arts & Culture'],
      capacity: 115,
      imageUrls: ['https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(9, -24, -2),
      timing: { type: 'past', startOffsetDays: -22 },
    },
    {
      name: 'NYC Rooftop Soul Sessions',
      description: 'A polished rooftop concert with soul, funk, and late-summer skyline views across downtown Manhattan.',
      venueKey: 'nyRooftop',
      organizerKey: 'maya',
      categoryNames: ['Music'],
      capacity: 220,
      imageUrls: ['https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(34, -28, -2),
      timing: { type: 'past', startOffsetDays: -41 },
    },
    {
      name: 'Brooklyn Night Market Live',
      description: 'An arts-forward night market with DJs, food pop-ups, and small-batch retail makers in one warehouse block.',
      venueKey: 'brooklynWarehouse',
      organizerKey: 'james',
      categoryNames: ['Food & Drink', 'Music'],
      capacity: 540,
      imageUrls: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(20, -32, -2),
      timing: { type: 'past', startOffsetDays: -16 },
    },
    {
      name: 'San Francisco Data & Design Day',
      description: 'A practical conference on product analytics, experimentation, and design systems for software teams.',
      venueKey: 'sfMoscone',
      organizerKey: 'priya',
      categoryNames: ['Technology'],
      capacity: 490,
      imageUrls: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'],
      durationHours: 8,
      ticketSeeds: [
        { name: 'Conference Pass', price: 118, salesStartOffset: -75, salesEndOffset: -2 },
      ],
      timing: { type: 'past', startOffsetDays: -52 },
    },
    {
      name: 'Austin Brand Builder Circle',
      description: 'Founders, community builders, and marketers swap launch stories and growth ideas in a warm small-format evening.',
      venueKey: 'austinWarehouse',
      organizerKey: 'sophie',
      categoryNames: ['Business & Networking'],
      capacity: 155,
      imageUrls: ['https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(19, -25, -2),
      timing: { type: 'past', startOffsetDays: -26 },
    },
    {
      name: 'Chicago Chef Table Exchange',
      description: 'A chef-led tasting series pairing tasting plates with stories about sourcing, kitchens, and menu development.',
      venueKey: 'chicagoPier',
      organizerKey: 'omar',
      categoryNames: ['Food & Drink'],
      capacity: 125,
      imageUrls: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(58, -40, -2),
      timing: { type: 'past', startOffsetDays: -33 },
    },
    {
      name: 'LA Stand-Up Spotlight Series',
      description: 'A tightly produced club-style comedy show spotlighting a rotating cast of fast-rising comics.',
      venueKey: 'laForum',
      organizerKey: 'james',
      categoryNames: ['Comedy & Entertainment'],
      capacity: 260,
      imageUrls: ['https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(21, -24, -2),
      timing: { type: 'past', startOffsetDays: -30 },
    },
    {
      name: 'Seattle Cloud Operators Forum',
      description: 'Engineering leaders and operators discuss scaling teams, infra, observability, and responsible AI rollout.',
      venueKey: 'seattleHub',
      organizerKey: 'david',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 240,
      imageUrls: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200'],
      durationHours: 6,
      ticketSeeds: makeTicketSeeds(29, -45, -2),
      timing: { type: 'past', startOffsetDays: -20 },
    },
    {
      name: 'Miami Beach Recovery & Reset Day',
      description: 'Movement, mobility, and wellness sessions designed for high-performing teams and stressed city professionals.',
      venueKey: 'miamiBeach',
      organizerKey: 'david',
      categoryNames: ['Health & Wellness'],
      capacity: 180,
      imageUrls: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200'],
      durationHours: 5,
      ticketSeeds: makeTicketSeeds(24, -22, -2),
      timing: { type: 'past', startOffsetDays: -44 },
    },
    {
      name: 'Denver Trails & Camp Skills Weekend',
      description: 'An outdoor basics weekend covering trail etiquette, camp setup, route planning, and backcountry confidence.',
      venueKey: 'denverTrail',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Sports & Fitness'],
      capacity: 135,
      imageUrls: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200'],
      durationHours: 8,
      ticketSeeds: makeTicketSeeds(42, -36, -3),
      timing: { type: 'past', startOffsetDays: -39 },
    },
    {
      name: 'Boston Storytelling & Song Night',
      description: 'A theatre-room blend of songwriting, spoken word, and carefully curated live performance.',
      venueKey: 'bostonTheatre',
      organizerKey: 'sophie',
      categoryNames: ['Arts & Culture', 'Music'],
      capacity: 165,
      imageUrls: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(18, -24, -2),
      timing: { type: 'past', startOffsetDays: -24 },
    },
    {
      name: 'Karachi Community Tech Meetup',
      description: 'Builders, students, and product teams swap demos and case studies in an open community meetup format.',
      venueKey: 'karachiArena',
      organizerKey: 'zara',
      categoryNames: ['Technology'],
      capacity: 220,
      imageUrls: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(8, -18, -2),
      timing: { type: 'past', startOffsetDays: -12 },
    },
    {
      name: 'Lahore Courtyard Comedy Social',
      description: 'A local-comedy social with short sets, relaxed hosting, and post-show crowd hangs in a heritage venue.',
      venueKey: 'lahoreFort',
      organizerKey: 'hassan',
      categoryNames: ['Comedy & Entertainment'],
      capacity: 150,
      imageUrls: ['https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200'],
      durationHours: 3,
      ticketSeeds: makeTicketSeeds(9, -16, -2),
      timing: { type: 'past', startOffsetDays: -14 },
    },
    {
      name: 'Islamabad Women in Product Circle',
      description: 'An evening of mentorship, product case studies, and operator-level conversations for women in tech.',
      venueKey: 'isbConvention',
      organizerKey: 'zara',
      categoryNames: ['Technology', 'Business & Networking'],
      capacity: 130,
      imageUrls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(12, -20, -2),
      timing: { type: 'past', startOffsetDays: -31 },
    },
    {
      name: 'Peshawar Mountain Stories Forum',
      description: 'Travel photographers, hikers, and local historians share stories from the north in an intimate setting.',
      venueKey: 'peshawarMuseum',
      organizerKey: 'bilal',
      categoryNames: ['Travel & Outdoor', 'Arts & Culture'],
      capacity: 95,
      imageUrls: ['https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200'],
      durationHours: 4,
      ticketSeeds: makeTicketSeeds(7, -18, -2),
      timing: { type: 'past', startOffsetDays: -19 },
    },
  ];
}

function ensureEventCount(eventSeeds: EventSeed[]) {
  if (eventSeeds.length !== 55) {
    throw new Error(`Expected 55 event seeds but found ${eventSeeds.length}`);
  }
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url:
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_ez7Y4xFSvZgR@ep-flat-shape-ah5yib9s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    entities: [
      User,
      OrganizerProfile,
      Category,
      Event,
      EventLocation,
      EventImage,
      Ticket,
      Booking,
      Review,
      SavedEvent,
      UserPreference,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  await dataSource.query('TRUNCATE TABLE "review" CASCADE');
  await dataSource.query('TRUNCATE TABLE "booking" CASCADE');
  await dataSource.query('TRUNCATE TABLE "saved_event" CASCADE');
  await dataSource.query('TRUNCATE TABLE "user_preference" CASCADE');
  await dataSource.query('TRUNCATE TABLE "ticket" CASCADE');
  await dataSource.query('TRUNCATE TABLE "event_image" CASCADE');
  await dataSource.query('TRUNCATE TABLE "event_categories_category" CASCADE');
  await dataSource.query('TRUNCATE TABLE "event" CASCADE');
  await dataSource.query('TRUNCATE TABLE "event_location" CASCADE');
  await dataSource.query('TRUNCATE TABLE "category" CASCADE');
  await dataSource.query('TRUNCATE TABLE "organizer_profile" CASCADE');
  await dataSource.query('TRUNCATE TABLE "user" CASCADE');
  console.log('Database cleared');

  const userRepo = dataSource.getRepository(User);
  const organizerProfileRepo = dataSource.getRepository(OrganizerProfile);
  const categoryRepo = dataSource.getRepository(Category);
  const eventRepo = dataSource.getRepository(Event);
  const locationRepo = dataSource.getRepository(EventLocation);
  const imageRepo = dataSource.getRepository(EventImage);
  const ticketRepo = dataSource.getRepository(Ticket);
  const bookingRepo = dataSource.getRepository(Booking);
  const reviewRepo = dataSource.getRepository(Review);
  const savedEventRepo = dataSource.getRepository(SavedEvent);
  const preferenceRepo = dataSource.getRepository(UserPreference);

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  console.log('Creating categories...');
  const categoryEntities = await categoryRepo.save(CATEGORIES.map((name) => ({ name })));
  const categoryByName = new Map(categoryEntities.map((category) => [category.name as CategoryName, category]));

  console.log('Creating organizer accounts...');
  const organizers = new Map<string, User>();
  for (const organizerSeed of ORGANIZERS) {
    const venue = VENUES.find((item) => item.key === organizerSeed.venueKey)!;
    const organizer = await userRepo.save(
      userRepo.create({
        name: organizerSeed.name,
        email: organizerSeed.email,
        password: hashedPassword,
        role: UserRole.ORGANIZER,
      }),
    );
    organizers.set(organizerSeed.key, organizer);

    await organizerProfileRepo.save(
      organizerProfileRepo.create({
        user: organizer,
        organizationName: organizerSeed.organizationName,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        zipCode: venue.postalCode,
      }),
    );
  }

  console.log('Creating attendee accounts...');
  const attendees: User[] = [];
  for (let index = 0; index < 100; index += 1) {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    const attendee = await userRepo.save(
      userRepo.create({
        name: `${firstName} ${lastName}`,
        email: `user${index + 1}@eventide.dev`,
        password: hashedPassword,
        role: UserRole.USER,
      }),
    );
    attendees.push(attendee);
  }

  console.log('Creating events, locations, images, and tickets...');
  const now = new Date();
  const eventSeeds = buildEventSeeds();
  ensureEventCount(eventSeeds);

  const createdEvents: Array<{
    event: Event;
    tickets: Ticket[];
    timing: EventSeed['timing']['type'];
  }> = [];

  for (const seedEvent of eventSeeds) {
    const venue = VENUES.find((item) => item.key === seedEvent.venueKey)!;
    const organizer = organizers.get(seedEvent.organizerKey)!;

    let startDate: Date;
    if (seedEvent.timing.type === 'ongoing') {
      startDate = addDays(now, seedEvent.timing.startOffsetDays);
    } else {
      startDate = addDays(now, seedEvent.timing.startOffsetDays);
    }
    const endDate = addHours(startDate, seedEvent.durationHours);

    const location = await locationRepo.save(
      locationRepo.create({
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: venue.country,
        postalCode: venue.postalCode,
        latitude: venue.latitude,
        longitude: venue.longitude,
        googleMapsLink: `https://maps.google.com/?q=${encodeURIComponent(`${venue.address}, ${venue.city}`)}`,
      }),
    );

    const categorySelection = seedEvent.categoryNames.map((name) => categoryByName.get(name)!);
    const event = await eventRepo.save(
      eventRepo.create({
        name: seedEvent.name,
        description: seedEvent.description,
        status: seedEvent.timing.type === 'past' ? EventStatus.COMPLETED : EventStatus.PUBLISHED,
        startDate,
        endDate,
        capacity: seedEvent.capacity,
        organizer,
        location,
        categories: categorySelection,
      }),
    );

    await imageRepo.save(
      seedEvent.imageUrls.map((imageUrl) => imageRepo.create({ imageUrl, event })),
    );

    const tickets = await ticketRepo.save(
      seedEvent.ticketSeeds.map((ticketSeed) => {
        const salesStartDate = addDays(startDate, ticketSeed.salesStartOffset);
        const salesEndDate = addDays(startDate, ticketSeed.salesEndOffset);
        return ticketRepo.create({
          name: ticketSeed.name,
          price: ticketSeed.price,
          salesStartDate,
          salesEndDate,
          event,
        });
      }),
    );

    createdEvents.push({
      event,
      tickets,
      timing: seedEvent.timing.type,
    });
  }

  const pastEvents = createdEvents.filter((item) => item.timing === 'past');
  const ongoingEvents = createdEvents.filter((item) => item.timing === 'ongoing');
  const futureEvents = createdEvents.filter((item) => item.timing === 'future');

  console.log('Creating bookings...');
  const confirmedBookingMap = new Map<number, Booking[]>();
  const allBookings: Booking[] = [];

  for (const item of pastEvents) {
    const attendeePool = shuffle(attendees).slice(0, 60 + Math.floor(Math.random() * 25));
    const bookingsToSave = attendeePool.map((attendee) => {
      const ticket = item.tickets[Math.floor(Math.random() * item.tickets.length)];
      const ticketSalesStart = new Date(ticket.salesStartDate);
      const bookingDate = randomDateBetween(ticketSalesStart, addDays(item.event.startDate, -1));
      const status = Math.random() > 0.08 ? 'CONFIRMED' : 'CANCELLED';
      return bookingRepo.create({
        user: attendee,
        event: item.event,
        ticket,
        status,
        bookingDate,
      });
    });

    const savedBookings = await bookingRepo.save(bookingsToSave);
    allBookings.push(...savedBookings);
    confirmedBookingMap.set(
      item.event.id,
      savedBookings.filter((booking) => booking.status === 'CONFIRMED'),
    );
  }

  for (const item of [...ongoingEvents, ...futureEvents]) {
    const attendeePool = shuffle(attendees).slice(0, 18 + Math.floor(Math.random() * 22));
    const bookingsToSave = attendeePool.map((attendee) => {
      const ticket = item.tickets[Math.floor(Math.random() * item.tickets.length)];
      const ticketSalesStart = new Date(ticket.salesStartDate);
      const bookingDate = randomDateBetween(ticketSalesStart, addDays(item.event.startDate, -1));
      const status = Math.random() > 0.12 ? 'CONFIRMED' : 'CANCELLED';
      return bookingRepo.create({
        user: attendee,
        event: item.event,
        ticket,
        status,
        bookingDate,
      });
    });

    const savedBookings = await bookingRepo.save(bookingsToSave);
    allBookings.push(...savedBookings);
    confirmedBookingMap.set(
      item.event.id,
      savedBookings.filter((booking) => booking.status === 'CONFIRMED'),
    );
  }

  console.log(`Created ${allBookings.length} bookings`);

  console.log('Creating reviews...');
  const reviewsToSave: Review[] = [];
  for (const item of pastEvents) {
    const confirmedBookings = confirmedBookingMap.get(item.event.id) || [];
    const reviewers = shuffle(confirmedBookings).slice(0, Math.min(confirmedBookings.length, 4 + Math.floor(Math.random() * 4)));
    reviewers.forEach((booking, index) => {
      reviewsToSave.push(
        reviewRepo.create({
          user: booking.user,
          event: item.event,
          rating: weightedRandom([1, 2, 7, 25, 65]),
          comment: REVIEW_TEMPLATES[(item.event.id + index) % REVIEW_TEMPLATES.length],
        }),
      );
    });
  }
  await reviewRepo.save(reviewsToSave);
  console.log(`Created ${reviewsToSave.length} reviews`);

  console.log('Creating saved events...');
  const futureLikeEvents = [...ongoingEvents, ...futureEvents].map((item) => item.event);
  const savedEventsToSave: SavedEvent[] = [];
  for (const attendee of attendees) {
    const picks = shuffle(futureLikeEvents).slice(0, 2 + Math.floor(Math.random() * 4));
    picks.forEach((event) => {
      savedEventsToSave.push(
        savedEventRepo.create({
          user: attendee,
          event,
        }),
      );
    });
  }
  await savedEventRepo.save(savedEventsToSave);
  console.log(`Created ${savedEventsToSave.length} saved events`);

  console.log('Creating user preferences...');
  const preferencesToSave: UserPreference[] = [];
  for (const attendee of attendees) {
    const picks = shuffle(categoryEntities).slice(0, 2 + Math.floor(Math.random() * 3));
    picks.forEach((category) => {
      preferencesToSave.push(
        preferenceRepo.create({
          user: attendee,
          category,
        }),
      );
    });
  }
  await preferenceRepo.save(preferencesToSave);
  console.log(`Created ${preferencesToSave.length} user preferences`);

  await dataSource.destroy();
  console.log('Seeding completed successfully');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
