/**
 * ALL salon content lives here. To rebrand the site, edit this file only:
 * name, contact details, opening hours, services & prices, stylists, reviews and photos.
 */

export const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export interface DayHours {
  open: string; // "HH:MM"
  close: string;
}

export const salon = {
  name: 'Hollis & Hue',
  tagline: 'Hair, colour & beauty',
  est: 'Est. 2014',
  heroTitle: 'Considered hair, colour &',
  heroTitleAccent: 'beauty.',
  heroIntro:
    'An independent salon in Shoreditch where every appointment begins with a conversation, and ends with hair that simply feels like yours.',
  aboutTitle: 'A quieter kind of salon.',
  aboutBody: [
    'Hollis & Hue was founded on a simple idea: that good hair takes time, and that time should feel unhurried. We keep our team small and our diaries honest, so every client gets a proper consultation and a stylist who is fully present.',
    'We colour with low-ammonia formulas, finish with plant-based care, and pour a decent cup of tea. Come as you are; leave as a better edit of yourself.',
  ],
  phone: '020 7946 0321',
  email: 'hello@hollisandhue.com',
  instagram: '@hollisandhue',
  address: {
    line1: '14 Marlowe Yard',
    area: 'Shoreditch',
    city: 'London',
    postcode: 'E2 7DN',
  },
  map: { lat: 51.5326, lng: -0.0786 },
  currency: '£',
  slotMinutes: 30, // spacing of bookable start times
  bookingWindowDays: 60, // how far ahead clients can book
  leadMinutes: 60, // minimum notice for same-day bookings
  rating: { score: 4.9, count: 312 },
  /** Index 0 = Sunday … 6 = Saturday. null = closed. */
  hours: [
    { open: '10:00', close: '16:00' },
    null,
    { open: '09:00', close: '19:00' },
    { open: '09:00', close: '19:00' },
    { open: '09:00', close: '20:00' },
    { open: '09:00', close: '19:00' },
    { open: '09:00', close: '17:00' },
  ] as (DayHours | null)[],
  heroImage: img('1521590832167-7bcbfaa6381f', 2000),
  aboutImages: [img('1706629503634-2de20b65080e', 900), img('1634449862841-8c6e970117e5', 700)],
};

export interface Category {
  id: string;
  name: string;
  blurb: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: 'hair',
    name: 'Cutting',
    blurb: 'Precision cuts designed around your hair’s natural fall, finished with a proper blow-out.',
    image: img('1750263160585-241fa75dca79', 1000),
  },
  {
    id: 'colour',
    name: 'Colour',
    blurb: 'Soft, dimensional colour that grows out gracefully. Always with a patch test and a consultation.',
    image: img('1554519934-e32b1629d9ee', 1000),
  },
  {
    id: 'styling',
    name: 'Styling',
    blurb: 'Blow-dries, occasion hair and treatments that bring shine back to tired lengths.',
    image: img('1712481846916-8f73ffc2067a', 1000),
  },
  {
    id: 'nails',
    name: 'Nails',
    blurb: 'Meticulous manicures and pedicures in a calm, sunlit corner of the salon.',
    image: img('1610992015762-45dca7fa3a85', 1000),
  },
  {
    id: 'brows',
    name: 'Brows & Lashes',
    blurb: 'Shaping, tinting and lamination for brows that frame the face and need no fuss.',
    image: img('1516220362602-dba5272034e7', 1000),
  },
];

export interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  from?: boolean; // show "from" before the price
  featuredLabel?: string; // appears in the home page highlights
}

export const services: Service[] = [
  { id: 'womens-cut', category: 'hair', name: 'Women’s Cut & Finish', description: 'Consultation, wash, precision cut and blow-dry.', duration: 60, price: 68, featuredLabel: 'Haircut' },
  { id: 'mens-cut', category: 'hair', name: 'Men’s Cut', description: 'Clipper or scissor cut with wash and style.', duration: 40, price: 42 },
  { id: 'fringe-trim', category: 'hair', name: 'Fringe Trim', description: 'A quick tidy between cuts. Complimentary for regulars.', duration: 15, price: 12 },

  { id: 'root-tint', category: 'colour', name: 'Root Tint', description: 'Regrowth coverage in your existing shade, with gloss.', duration: 90, price: 75, from: true },
  { id: 'full-colour', category: 'colour', name: 'Full Colour', description: 'All-over permanent or semi-permanent colour, with a cut-free finish.', duration: 120, price: 110, from: true, featuredLabel: 'Colour' },
  { id: 'balayage', category: 'colour', name: 'Balayage', description: 'Hand-painted, sun-kissed highlights. Includes toner, treatment and blow-dry.', duration: 180, price: 185, from: true, featuredLabel: 'Balayage' },
  { id: 'gloss', category: 'colour', name: 'Gloss & Tone', description: 'A shine-boosting toner to refresh colour between appointments.', duration: 45, price: 45 },

  { id: 'blow-dry', category: 'styling', name: 'Blow-Dry', description: 'Wash, scalp massage and a bouncy, long-lasting blow-dry.', duration: 45, price: 38, featuredLabel: 'Blow-dry' },
  { id: 'updo', category: 'styling', name: 'Occasion Updo', description: 'Weddings, parties, photo days. Includes a trial chat by message.', duration: 60, price: 70, from: true },
  { id: 'treatment', category: 'styling', name: 'Repair Treatment', description: 'Bond-building treatment for chemically treated or heat-damaged hair.', duration: 30, price: 35 },

  { id: 'manicure', category: 'nails', name: 'Classic Manicure', description: 'Shape, cuticle care, hand massage and polish.', duration: 45, price: 32 },
  { id: 'gel-manicure', category: 'nails', name: 'Gel Manicure', description: 'Chip-free colour that lasts up to three weeks.', duration: 60, price: 42, featuredLabel: 'Nails' },
  { id: 'gel-pedicure', category: 'nails', name: 'Gel Pedicure', description: 'Soak, file, buff and gel colour for the feet.', duration: 60, price: 48 },

  { id: 'brow-shape', category: 'brows', name: 'Brow Shape & Tint', description: 'Mapped, waxed or threaded, and tinted to suit.', duration: 30, price: 28, featuredLabel: 'Brows' },
  { id: 'brow-lamination', category: 'brows', name: 'Brow Lamination', description: 'Brushed-up, fluffy brows that set for six weeks.', duration: 45, price: 48 },
  { id: 'lash-tint', category: 'brows', name: 'Lash Tint', description: 'Darker, fuller-looking lashes without mascara.', duration: 20, price: 22 },
];

export interface Stylist {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  specialties: string[];
  categories: string[]; // which service categories they perform
  days: number[]; // working weekdays, 0 = Sunday
  years: number;
  work: string[];
}

export const stylists: Stylist[] = [
  {
    id: 'eleanor',
    name: 'Eleanor Hollis',
    role: 'Founder & Creative Director',
    bio: 'Eleanor trained in London and Paris before opening Hollis & Hue. She is known for lived-in blondes, soft copper and colour that looks expensive at every stage of growth.',
    photo: img('1524504388940-b1c1722653e1', 900),
    specialties: ['Balayage', 'Blonding', 'Colour correction'],
    categories: ['hair', 'colour', 'styling'],
    days: [2, 3, 4, 5, 6],
    years: 14,
    work: [
      img('1554519934-e32b1629d9ee', 800),
      img('1605980766335-d3a41c7332a1', 800),
      img('1605980625600-88b46abafa8d', 800),
      img('1658322558683-2524c9b62d04', 800),
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Reyes',
    role: 'Senior Stylist',
    bio: 'Marcus is a cutter first: sharp lines, soft texture and a calm chair-side manner. He loves a restyle, and is the person to see for short hair, curls and men’s grooming.',
    photo: img('1553521041-d168abd31de3', 900),
    specialties: ['Precision cutting', 'Men’s grooming', 'Curls'],
    categories: ['hair', 'colour'],
    days: [2, 3, 4, 5],
    years: 9,
    work: [
      img('1750263160585-241fa75dca79', 800),
      img('1771594836586-837aa05be563', 800),
      img('1706629503634-2de20b65080e', 800),
      img('1773904215697-e6c21fc27ac2', 800),
    ],
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'Stylist & Bridal Lead',
    bio: 'Priya makes hair move. From glossy everyday blow-dries to wedding-day updos, she builds styles that hold from the first photo to the last dance.',
    photo: img('1636153279424-cb5d1e00f5a2', 900),
    specialties: ['Blow-dries', 'Bridal & occasion', 'Long hair'],
    categories: ['hair', 'styling'],
    days: [3, 4, 5, 6, 0],
    years: 7,
    work: [
      img('1712481846916-8f73ffc2067a', 800),
      img('1769521140376-14064ac7c27f', 800),
      img('1759396200634-2282cfe0f1e4', 800),
      img('1789835304841-61714c66a9cb', 800),
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Lindqvist',
    role: 'Nail & Brow Artist',
    bio: 'Sofia brings a Scandinavian eye for restraint: clean nail shapes, sheer neutrals and brows that look like yours, only better. Her gel manicures are famous for lasting.',
    photo: img('1560869713-7d0a29430803', 900),
    specialties: ['Gel manicures', 'Brow lamination', 'Nail art'],
    categories: ['nails', 'brows'],
    days: [2, 4, 5, 6],
    years: 6,
    work: [
      img('1610992015762-45dca7fa3a85', 800),
      img('1610992015836-7c249d75782d', 800),
      img('1690749138086-7422f71dc159', 800),
      img('1516220362602-dba5272034e7', 800),
    ],
  },
];

export interface Review {
  name: string;
  text: string;
  service: string;
  stylist: string;
}

export const reviews: Review[] = [
  {
    name: 'Amelia R.',
    text: 'I have had balayage in four cities and Eleanor’s is the only one that grew out beautifully. Three months on, no harsh line, just soft, golden light. Worth every minute.',
    service: 'Balayage',
    stylist: 'Eleanor',
  },
  {
    name: 'James T.',
    text: 'Marcus listened, looked at how my hair actually grows, and gave me the best cut of my adult life. I have been stopped twice this week to be asked where I go.',
    service: 'Men’s Cut',
    stylist: 'Marcus',
  },
  {
    name: 'Chloe M.',
    text: 'Priya did my hair for my wedding and it survived the ceremony, the rain and eight hours of dancing. She is calm, funny and unbelievably talented.',
    service: 'Occasion Updo',
    stylist: 'Priya',
  },
  {
    name: 'Nadia K.',
    text: 'Sofia’s gel manicure lasted a full three weeks without a chip, and my brows have never looked so natural. The whole salon feels like a deep breath.',
    service: 'Gel Manicure',
    stylist: 'Sofia',
  },
  {
    name: 'Harriet L.',
    text: 'Easy booking, tea on arrival, and nobody rushing me out of the chair. It is the little things, and Hollis & Hue gets all of them right.',
    service: 'Cut & Finish',
    stylist: 'Priya',
  },
];

export const gallery: { src: string; alt: string }[] = [
  { src: img('1634449862841-8c6e970117e5', 800), alt: 'Salon reception with a chandelier' },
  { src: img('1554519934-e32b1629d9ee', 800), alt: 'Soft balayage on long hair' },
  { src: img('1610992015762-45dca7fa3a85', 800), alt: 'Neutral gel manicure' },
  { src: img('1712481846916-8f73ffc2067a', 800), alt: 'Glossy blow-dry' },
  { src: img('1605980766335-d3a41c7332a1', 800), alt: 'Blonde hair colour' },
  { src: img('1706629503634-2de20b65080e', 800), alt: 'Styling chairs and mirrors' },
  { src: img('1516220362602-dba5272034e7', 800), alt: 'Defined, natural brows' },
  { src: img('1750263160585-241fa75dca79', 800), alt: 'A client in the chair' },
  { src: img('1769521140376-14064ac7c27f', 800), alt: 'Long curly blonde hair' },
];

export const getService = (id: string) => services.find((s) => s.id === id);
export const getStylist = (id: string) => stylists.find((s) => s.id === id);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
