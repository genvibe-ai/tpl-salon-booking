import { getService, getStylist, salon, services, type Stylist } from '../content';
import { addDays, dayNames, fmtTime, nowMinutes, parseHM, todayISO, weekday } from './time';
import type { Block, Booking } from './store';

export const money = (n: number) => `${salon.currency}${n}`;

export function hoursFor(date: string) {
  const h = salon.hours[weekday(date)];
  return h ? { open: parseHM(h.open), close: parseHM(h.close) } : null;
}

export function stylistWindow(st: Stylist, date: string) {
  const h = hoursFor(date);
  if (!h || !st.days.includes(weekday(date))) return null;
  return h;
}

export const canDo = (st: Stylist, ids: string[]) =>
  ids.every((id) => {
    const s = getService(id);
    return !!s && st.categories.includes(s.category);
  });

export const servicesFor = (st: Stylist) => services.filter((s) => st.categories.includes(s.category));

export function totals(ids: string[]) {
  let duration = 0;
  let price = 0;
  let from = false;
  for (const id of ids) {
    const s = getService(id);
    if (!s) continue;
    duration += s.duration;
    price += s.price;
    if (s.from) from = true;
  }
  return { duration, price, from };
}

export function isFree(bookings: Booking[], blocks: Block[], stylistId: string, date: string, start: number, end: number) {
  for (const b of bookings) {
    if (b.stylistId === stylistId && b.date === date && start < b.start + b.duration && end > b.start) return false;
  }
  for (const bl of blocks) {
    if ((bl.stylistId === 'all' || bl.stylistId === stylistId) && bl.date === date && start < bl.end && end > bl.start) return false;
  }
  return true;
}

export interface Slot {
  start: number;
  stylistIds: string[];
}

export function slotsFor(bookings: Booking[], blocks: Block[], date: string, stylistIds: string[], duration: number): Slot[] {
  const today = todayISO();
  if (date < today || date > addDays(today, salon.bookingWindowDays)) return [];
  const h = hoursFor(date);
  if (!h || duration <= 0) return [];
  const now = nowMinutes();
  const out: Slot[] = [];
  for (let t = h.open; t + duration <= h.close; t += salon.slotMinutes) {
    if (date === today && t < now + salon.leadMinutes) continue;
    const free = stylistIds.filter((id) => {
      const st = getStylist(id);
      return !!st && !!stylistWindow(st, date) && isFree(bookings, blocks, id, date, t, t + duration);
    });
    if (free.length) out.push({ start: t, stylistIds: free });
  }
  return out;
}

/** The next few days with free slots for a stylist. */
export function nextFree(bookings: Booking[], blocks: Block[], stylistId: string, duration: number, days = 5) {
  const out: { date: string; slots: Slot[] }[] = [];
  const today = todayISO();
  for (let i = 0; i <= salon.bookingWindowDays && out.length < days; i++) {
    const date = addDays(today, i);
    const slots = slotsFor(bookings, blocks, date, [stylistId], duration);
    if (slots.length) out.push({ date, slots });
  }
  return out;
}

export function openStatus() {
  const today = todayISO();
  const h = hoursFor(today);
  const now = nowMinutes();
  if (h && now < h.close) {
    return now >= h.open ? `Open today until ${fmtTime(h.close)}` : `Opens today at ${fmtTime(h.open)}`;
  }
  for (let i = 1; i <= 7; i++) {
    const d = addDays(today, i);
    const nh = hoursFor(d);
    if (nh) return `Closed · opens ${i === 1 ? 'tomorrow' : dayNames[weekday(d)]} at ${fmtTime(nh.open)}`;
  }
  return 'Closed';
}
