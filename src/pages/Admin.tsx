import { useMemo, useState, type FormEvent } from 'react';
import { CalendarOff, ChevronLeft, ChevronRight, Mail, Phone, Trash2 } from 'lucide-react';
import { getService, getStylist, salon, stylists } from '../content';
import { Link } from '../lib/router';
import { hoursFor, money, stylistWindow } from '../lib/availability';
import { addDays, fmtDateLong, fmtDateShort, fmtDuration, fmtHM, fmtTime, nowMinutes, parseHM, todayISO } from '../lib/time';
import { addBlock, clearAll, removeBlock, removeBooking, resetDemo, useStore, type Block, type Booking } from '../lib/store';
import { Modal } from '../components/ui';

const PX = 1.5; // pixels per minute on the timeline

const serviceNames = (b: Booking) => b.serviceIds.map((id) => getService(id)?.name).filter(Boolean).join(' + ');

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cream-300 bg-cream-100 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-taupe-700">{label}</p>
      <p className="mt-2 font-display text-4xl font-light tabular-nums">{value}</p>
    </div>
  );
}

function Timeline({ date, bookings, blocks, onSelect }: { date: string; bookings: Booking[]; blocks: Block[]; onSelect: (b: Booking) => void }) {
  const h = hoursFor(date);
  if (!h) {
    return <p className="border border-cream-300 bg-cream-100 p-8 text-taupe-700">The salon is closed on {fmtDateLong(date)}.</p>;
  }
  const open = Math.floor(h.open / 60) * 60;
  const close = Math.ceil(h.close / 60) * 60;
  const height = (close - open) * PX;
  const hours: number[] = [];
  for (let t = open; t < close; t += 60) hours.push(t);
  const cols = `3.5rem repeat(${stylists.length}, minmax(9.5rem, 1fr))`;
  const now = nowMinutes();
  const showNow = date === todayISO() && now >= open && now <= close;

  return (
    <div className="overflow-x-auto border border-cream-300 bg-cream-50">
      <div className="min-w-160">
        <div className="sticky top-0 grid border-b border-cream-300 bg-cream-100" style={{ gridTemplateColumns: cols }}>
          <div />
          {stylists.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border-l border-cream-300 px-3 py-3">
              <img src={s.photo} alt="" className="size-9 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.name.split(' ')[0]}</p>
                <p className="truncate text-xs text-taupe-600">{stylistWindow(s, date) ? s.role.split(' ')[0] : 'Off today'}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: cols, height }}>
          <div className="relative">
            {hours.map((t) => (
              <span key={t} className="absolute right-2 -translate-y-1/2 text-xs tabular-nums text-taupe-600" style={{ top: (t - open) * PX + (t === open ? 8 : 0) }}>
                {fmtTime(t)}
              </span>
            ))}
          </div>
          {stylists.map((s) => {
            const works = !!stylistWindow(s, date);
            return (
              <div
                key={s.id}
                className={`relative border-l border-cream-300 ${works ? '' : 'hatch'}`}
                style={works ? { backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${60 * PX - 1}px, var(--color-cream-200) ${60 * PX - 1}px, var(--color-cream-200) ${60 * PX}px)` } : undefined}
              >
                {works && h.open > open && <div className="hatch absolute inset-x-0 top-0 opacity-60" style={{ height: (h.open - open) * PX }} />}
                {works && h.close < close && <div className="hatch absolute inset-x-0 bottom-0 opacity-60" style={{ height: (close - h.close) * PX }} />}
                {blocks
                  .filter((b) => b.date === date && (b.stylistId === 'all' || b.stylistId === s.id))
                  .map((b) => (
                    <div key={b.id} className="hatch absolute inset-x-1 overflow-hidden border border-taupe-500/50 px-2 py-1 text-xs text-taupe-700" style={{ top: (b.start - open) * PX, height: (b.end - b.start) * PX }}>
                      <span className="font-medium">{b.reason || 'Blocked'}</span>
                      <span className="block tabular-nums">
                        {fmtTime(b.start)} – {fmtTime(b.end)}
                      </span>
                    </div>
                  ))}
                {bookings
                  .filter((b) => b.date === date && b.stylistId === s.id)
                  .map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onSelect(b)}
                      className="absolute inset-x-1 overflow-hidden border-l-2 border-clay-500 bg-clay-100 px-2 py-1 text-left text-xs text-espresso-900 transition hover:bg-clay-300 hover:shadow-md"
                      style={{ top: (b.start - open) * PX, height: b.duration * PX - 2 }}
                    >
                      <span className="block truncate font-medium">{b.name}</span>
                      <span className="block truncate text-taupe-700">{serviceNames(b)}</span>
                      <span className="block tabular-nums text-taupe-700">
                        {fmtTime(b.start)} – {fmtTime(b.start + b.duration)}
                      </span>
                    </button>
                  ))}
              </div>
            );
          })}
          {showNow && (
            <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: (now - open) * PX }}>
              <span className="ml-1 size-2 bg-clay-600" />
              <span className="h-px flex-1 bg-clay-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockForm({ date }: { date: string }) {
  const [sid, setSid] = useState('all');
  const [d, setD] = useState(date);
  const [allDay, setAllDay] = useState(false);
  const [from, setFrom] = useState('12:00');
  const [to, setTo] = useState('13:00');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const times = useMemo(() => {
    const out: string[] = [];
    for (let t = 6 * 60; t <= 22 * 60; t += 30) out.push(fmtHM(t));
    return out;
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const h = hoursFor(d);
    const start = allDay ? (h?.open ?? 0) : parseHM(from);
    const end = allDay ? (h?.close ?? 24 * 60) : parseHM(to);
    if (!d) return setMsg('Choose a date.');
    if (end <= start) return setMsg('The end time must be after the start time.');
    addBlock({ stylistId: sid, date: d, start, end, reason: reason.trim() || 'Time off' });
    setMsg('Time blocked. It no longer appears as bookable.');
    setReason('');
  };

  return (
    <form onSubmit={submit} className="space-y-5 border border-cream-300 bg-cream-100 p-6">
      <div>
        <label className="label" htmlFor="b-who">Who</label>
        <select id="b-who" className="input" value={sid} onChange={(e) => setSid(e.target.value)}>
          <option value="all">Whole salon</option>
          {stylists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="b-date">Date</label>
        <input id="b-date" type="date" min={todayISO()} className="input" value={d} onChange={(e) => setD(e.target.value)} />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="size-5 accent-clay-600" />
        Block the whole day
      </label>
      {!allDay && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="b-from">From</label>
            <select id="b-from" className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {times.map((t) => (
                <option key={t} value={t}>{fmtTime(parseHM(t))}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="b-to">To</label>
            <select id="b-to" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
              {times.map((t) => (
                <option key={t} value={t}>{fmtTime(parseHM(t))}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <label className="label" htmlFor="b-reason">Reason</label>
        <input id="b-reason" className="input" placeholder="Lunch, training, holiday…" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <button className="btn btn-primary w-full" type="submit">
        <CalendarOff size={16} /> Block time off
      </button>
      {msg && <p role="status" className="text-sm text-taupe-700">{msg}</p>}
    </form>
  );
}

export default function Admin() {
  const { bookings, blocks } = useStore();
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const todays = bookings.filter((b) => b.date === today);
  const upcoming = useMemo(
    () => bookings.filter((b) => b.date >= today).sort((a, b) => (a.date === b.date ? a.start - b.start : a.date < b.date ? -1 : 1)),
    [bookings, today],
  );
  const grouped = useMemo(() => {
    const m = new Map<string, Booking[]>();
    upcoming.forEach((b) => m.set(b.date, [...(m.get(b.date) ?? []), b]));
    return [...m.entries()];
  }, [upcoming]);
  const futureBlocks = blocks.filter((b) => b.date >= today).sort((a, b) => (a.date === b.date ? a.start - b.start : a.date < b.date ? -1 : 1));

  const close = () => {
    setSelected(null);
    setConfirmCancel(false);
  };
  const stylistOf = (b: Booking) => getStylist(b.stylistId)?.name ?? 'Unassigned';

  return (
    <section className="pb-24 pt-28 sm:pt-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">Owner view</p>
            <h1 className="text-4xl font-light sm:text-6xl">
              The diary at <em className="italic text-clay-600">{salon.name}.</em>
            </h1>
          </div>
          <p className="max-w-xs text-sm text-taupe-600">Bookings made on the site are stored in this browser and appear here instantly.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Today" value={String(todays.length)} />
          <Stat label="Upcoming" value={String(upcoming.length)} />
          <Stat label="Booked today" value={money(todays.reduce((n, b) => n + b.price, 0))} />
          <Stat label="Time blocks" value={String(futureBlocks.length)} />
        </div>

        {/* Timeline */}
        <div className="mt-16">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="font-display text-3xl font-light">{date === today ? 'Today' : 'Schedule'}, <span className="text-taupe-700">{fmtDateLong(date)}</span></h2>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline size-12 px-0" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
                <ChevronLeft size={18} />
              </button>
              <button className="btn btn-outline" onClick={() => setDate(today)} disabled={date === today}>
                Today
              </button>
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="input w-auto" aria-label="Choose a date" />
              <button className="btn btn-outline size-12 px-0" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <Timeline date={date} bookings={bookings} blocks={blocks} onSelect={setSelected} />
          <p className="mt-3 text-sm text-taupe-600">Tap an appointment for details. Hatched areas are time off or outside working hours.</p>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Upcoming */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl font-light">Upcoming bookings</h2>
            {grouped.length === 0 ? (
              <div className="mt-6 border border-cream-300 p-8 text-taupe-700">
                No upcoming bookings yet. <Link to="/book" className="underline underline-offset-4">Make a test booking</Link> and it will show up here.
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {grouped.map(([d, list]) => (
                  <div key={d}>
                    <h3 className="mb-2 border-b border-espresso-900/80 pb-2 text-xs font-medium uppercase tracking-widest">
                      {d === today ? 'Today' : fmtDateShort(d)} <span className="text-taupe-600">· {list.length}</span>
                    </h3>
                    <ul className="divide-y divide-cream-300">
                      {list.map((b) => (
                        <li key={b.id}>
                          <button onClick={() => setSelected(b)} className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4 text-left transition hover:bg-cream-100">
                            <span className="font-display text-lg tabular-nums">{fmtTime(b.start)}</span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{b.name}</span>
                              <span className="block truncate text-sm text-taupe-700">
                                {serviceNames(b)} · {stylistOf(b)}
                              </span>
                            </span>
                            <span className="text-right text-sm tabular-nums text-taupe-700">
                              {money(b.price)}
                              <span className="block text-taupe-600">{fmtDuration(b.duration)}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Block time */}
          <div className="lg:col-span-5">
            <h2 className="mb-6 font-display text-3xl font-light">Block time off</h2>
            <BlockForm date={today} />
            {futureBlocks.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-taupe-700">Scheduled time off</h3>
                <ul className="divide-y divide-cream-300 border-y border-cream-300">
                  {futureBlocks.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>
                        <span className="block font-medium">{b.reason} · {b.stylistId === 'all' ? 'Whole salon' : getStylist(b.stylistId)?.name}</span>
                        <span className="text-taupe-700">
                          {fmtDateShort(b.date)}, {fmtTime(b.start)} – {fmtTime(b.end)}
                        </span>
                      </span>
                      <button onClick={() => removeBlock(b.id)} aria-label="Remove time off" className="flex size-11 items-center justify-center text-taupe-600 hover:text-danger-600">
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-cream-300 pt-6 text-sm text-taupe-600">
          <button className="underline underline-offset-4 hover:text-clay-600" onClick={() => confirm('Reset to the demo bookings?') && resetDemo()}>
            Reset demo data
          </button>
          <button className="underline underline-offset-4 hover:text-danger-600" onClick={() => confirm('Delete every booking and time block?') && clearAll()}>
            Clear all bookings
          </button>
        </div>
      </div>

      <Modal open={!!selected} onClose={close} title={selected?.name ?? ''}>
        {selected && (
          <div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">When</dt>
                <dd className="text-right">
                  {fmtDateLong(selected.date)}
                  <br />
                  {fmtTime(selected.start)} – {fmtTime(selected.start + selected.duration)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Stylist</dt>
                <dd>
                  {stylistOf(selected)}
                  {selected.anyone && <span className="text-taupe-600"> (any available)</span>}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Services</dt>
                <dd className="text-right">{serviceNames(selected)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Total</dt>
                <dd className="tabular-nums">{money(selected.price)} · {fmtDuration(selected.duration)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Reference</dt>
                <dd>{selected.ref}</dd>
              </div>
              {selected.notes && (
                <div>
                  <dt className="text-taupe-600">Notes</dt>
                  <dd className="mt-1 bg-cream-100 p-3">{selected.notes}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="btn btn-outline flex-1">
                <Phone size={16} /> {selected.phone}
              </a>
              <a href={`mailto:${selected.email}`} className="btn btn-outline flex-1">
                <Mail size={16} /> Email
              </a>
            </div>
            <div className="mt-6 border-t border-cream-300 pt-5">
              {confirmCancel ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="flex-1 text-sm">Cancel this booking? The slot will become free.</p>
                  <button className="btn btn-quiet" onClick={() => setConfirmCancel(false)}>Keep</button>
                  <button
                    className="btn bg-danger-600 text-cream-50 hover:opacity-90"
                    onClick={() => {
                      removeBooking(selected.id);
                      close();
                    }}
                  >
                    Yes, cancel
                  </button>
                </div>
              ) : (
                <button className="inline-flex min-h-11 items-center gap-2 text-sm text-danger-600 underline underline-offset-4" onClick={() => setConfirmCancel(true)}>
                  <Trash2 size={16} /> Cancel booking
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
