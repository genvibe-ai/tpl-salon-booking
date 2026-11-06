import { useSyncExternalStore } from 'react';
import { stylists } from '../content';
import { stylistWindow, totals } from './availability';
import { addDays, parseHM, todayISO } from './time';

export interface Booking {
  id: string;
  ref: string;
  serviceIds: string[];
  stylistId: string;
  anyone: boolean;
  date: string;
  start: number;
  duration: number;
  price: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: number;
}

export interface Block {
  id: string;
  stylistId: string; // stylist id or "all"
  date: string;
  start: number;
  end: number;
  reason: string;
}

interface State {
  bookings: Booking[];
  blocks: Block[];
}

const KEY = 'hollis-hue:v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const makeRef = () => 'HH-' + Math.random().toString(36).slice(2, 7).toUpperCase();

function seed(): State {
  const clients: [string, string][] = [
    ['Amelia Rowe', '07700 900101'],
    ['Tom Whitaker', '07700 900118'],
    ['Zara Ahmed', '07700 900142'],
    ['Lucy Brennan', '07700 900167'],
    ['Oliver Grant', '07700 900183'],
    ['Maya Patel', '07700 900199'],
    ['Hannah Cole', '07700 900214'],
    ['Daniel Frost', '07700 900236'],
  ];
  const plans: Record<string, { s: string[]; t: string }[]> = {
    eleanor: [
      { s: ['balayage'], t: '09:30' },
      { s: ['gloss'], t: '13:30' },
      { s: ['full-colour'], t: '15:00' },
    ],
    marcus: [
      { s: ['mens-cut'], t: '10:00' },
      { s: ['mens-cut', 'fringe-trim'], t: '11:00' },
      { s: ['root-tint'], t: '14:00' },
    ],
    priya: [
      { s: ['blow-dry'], t: '10:00' },
      { s: ['updo'], t: '11:30' },
      { s: ['blow-dry'], t: '14:00' },
      { s: ['womens-cut'], t: '15:00' },
    ],
    sofia: [
      { s: ['gel-manicure'], t: '10:00' },
      { s: ['brow-shape'], t: '11:30' },
      { s: ['manicure'], t: '13:00' },
      { s: ['brow-lamination'], t: '15:00' },
    ],
  };
  const bookings: Booking[] = [];
  const blocks: Block[] = [];
  const today = todayISO();
  let n = 0;
  for (let off = 0; off < 8; off++) {
    const date = addDays(today, off);
    stylists.forEach((st, si) => {
      const win = stylistWindow(st, date);
      if (!win) return;
      (plans[st.id] || []).forEach((p, k) => {
        if ((off + si + k) % 4 === 0) return;
        const start = parseHM(p.t);
        const t = totals(p.s);
        if (start < win.open || start + t.duration > win.close) return;
        const [name, phone] = clients[n % clients.length];
        n++;
        bookings.push({
          id: uid(),
          ref: makeRef(),
          serviceIds: p.s,
          stylistId: st.id,
          anyone: false,
          date,
          start,
          duration: t.duration,
          price: t.price,
          name,
          phone,
          email: name.toLowerCase().replace(/[^a-z]/g, '.') + '@example.com',
          notes: '',
          createdAt: Date.now() - n * 3600_000,
        });
      });
    });
  }
  blocks.push({ id: uid(), stylistId: 'eleanor', date: addDays(today, 2), start: parseHM('12:30'), end: parseHM('13:30'), reason: 'Lunch' });
  return { bookings, blocks };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.bookings) && Array.isArray(p.blocks)) return p;
    }
  } catch {
    /* fall through to seed */
  }
  const s = seed();
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
  return s;
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
  );
}

export function addBooking(b: Omit<Booking, 'id' | 'ref' | 'createdAt'>): Booking {
  const full: Booking = { ...b, id: uid(), ref: makeRef(), createdAt: Date.now() };
  commit({ ...state, bookings: [...state.bookings, full] });
  return full;
}
export const removeBooking = (id: string) => commit({ ...state, bookings: state.bookings.filter((b) => b.id !== id) });
export const addBlock = (b: Omit<Block, 'id'>) => commit({ ...state, blocks: [...state.blocks, { ...b, id: uid() }] });
export const removeBlock = (id: string) => commit({ ...state, blocks: state.blocks.filter((b) => b.id !== id) });
export const resetDemo = () => commit(seed());
export const clearAll = () => commit({ bookings: [], blocks: [] });
