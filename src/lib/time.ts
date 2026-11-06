export const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const weekday = (iso: string) => fromISO(iso).getDay();
export const parseHM = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
export const nowMinutes = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

export const fmtTime = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 && h < 24 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return mm ? `${h12}:${pad(mm)}${ap}` : `${h12}${ap}`;
};
export const fmtHM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export const fmtDuration = (m: number) => {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

export const fmtDateLong = (iso: string) =>
  fromISO(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtDateShort = (iso: string) =>
  fromISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtMonth = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
