import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { categories, getService, getStylist, salon, services, stylists } from '../content';
import { Link } from '../lib/router';
import { canDo, money, slotsFor, totals } from '../lib/availability';
import { addDays, fmtDateLong, fmtDuration, fmtMonth, fmtTime, fromISO, pad, todayISO, toISO } from '../lib/time';
import { addBooking, useStore, type Booking } from '../lib/store';

const STEPS = ['Services', 'Stylist', 'Date & time', 'Your details'];
const ANY = 'any';

/* ---------- helpers ---------- */

function downloadIcs(b: Booking) {
  const d = b.date.replace(/-/g, '');
  const t = (m: number) => `${pad(Math.floor(m / 60))}${pad(m % 60)}00`;
  const names = b.serviceIds.map((id) => getService(id)?.name).filter(Boolean).join(', ');
  const a = salon.address;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${salon.name}//Booking//EN`,
    'BEGIN:VEVENT',
    `UID:${b.id}@booking`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${d}T${t(b.start)}`,
    `DTEND:${d}T${t(b.start + b.duration)}`,
    `SUMMARY:${names} at ${salon.name}`,
    `LOCATION:${a.line1}\\, ${a.area}\\, ${a.city} ${a.postcode}`,
    `DESCRIPTION:Booking ref ${b.ref}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${salon.name.replace(/\W+/g, '-')}-${b.ref}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ---------- pieces ---------- */

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto sm:gap-4" aria-label="Booking progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex shrink-0 items-center gap-2 sm:gap-4" aria-current={i === step ? 'step' : undefined}>
          <span
            className={`flex size-7 items-center justify-center text-xs tabular-nums transition-colors ${
              i < step ? 'bg-espresso-900 text-cream-50' : i === step ? 'border border-espresso-900 text-espresso-900' : 'border border-cream-300 text-taupe-600'
            }`}
          >
            {i < step ? <Check size={14} /> : i + 1}
          </span>
          <span className={`text-xs font-medium uppercase tracking-widest ${i === step ? 'text-espresso-900' : 'text-taupe-600'} ${i === step ? '' : 'hidden sm:inline'}`}>{s}</span>
          {i < STEPS.length - 1 && <span className="hidden h-px w-6 bg-cream-300 sm:block" />}
        </li>
      ))}
    </ol>
  );
}

interface SummaryProps {
  serviceIds: string[];
  stylistLabel: string | null;
  date: string | null;
  time: number | null;
}

function Summary({ serviceIds, stylistLabel, date, time }: SummaryProps) {
  const t = totals(serviceIds);
  return (
    <div className="border border-cream-300 bg-cream-100 p-6">
      <h2 className="font-display text-2xl font-light">Your appointment</h2>
      {serviceIds.length === 0 ? (
        <p className="mt-4 text-sm text-taupe-600">Choose a service to begin.</p>
      ) : (
        <ul className="mt-5 space-y-3 border-b border-cream-300 pb-5">
          {serviceIds.map((id) => {
            const s = getService(id);
            return (
              s && (
                <li key={id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {s.name}
                    <span className="block text-taupe-600">{fmtDuration(s.duration)}</span>
                  </span>
                  <span className="tabular-nums">
                    {s.from && <span className="mr-1 text-taupe-600">from</span>}
                    {money(s.price)}
                  </span>
                </li>
              )
            );
          })}
        </ul>
      )}
      <dl className="mt-5 space-y-3 text-sm">
        {stylistLabel && (
          <div className="flex justify-between gap-4">
            <dt className="text-taupe-600">Stylist</dt>
            <dd>{stylistLabel}</dd>
          </div>
        )}
        {date && (
          <div className="flex justify-between gap-4">
            <dt className="text-taupe-600">When</dt>
            <dd className="text-right">
              {fmtDateLong(date)}
              {time !== null && <span className="block">{fmtTime(time)}</span>}
            </dd>
          </div>
        )}
        {serviceIds.length > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-taupe-600">Duration</dt>
            <dd>{fmtDuration(t.duration)}</dd>
          </div>
        )}
      </dl>
      {serviceIds.length > 0 && (
        <div className="mt-5 flex items-baseline justify-between border-t border-cream-300 pt-5">
          <span className="text-xs font-medium uppercase tracking-widest text-taupe-700">Total</span>
          <span className="font-display text-3xl tabular-nums">
            {t.from && <span className="mr-1 text-base text-taupe-600">from</span>}
            {money(t.price)}
          </span>
        </div>
      )}
    </div>
  );
}

function Calendar({ month, setMonth, selected, onSelect, hasSlots }: { month: { y: number; m: number }; setMonth: (m: { y: number; m: number }) => void; selected: string | null; onSelect: (iso: string) => void; hasSlots: (iso: string) => boolean }) {
  const now = new Date();
  const cur = now.getFullYear() * 12 + now.getMonth();
  const maxD = fromISO(addDays(todayISO(), salon.bookingWindowDays));
  const max = maxD.getFullYear() * 12 + maxD.getMonth();
  const idx = month.y * 12 + month.m;
  const lead = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const go = (n: number) => {
    const d = new Date(month.y, month.m + n, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl font-light">{fmtMonth(month.y, month.m)}</h3>
        <div className="flex">
          <button type="button" onClick={() => go(-1)} disabled={idx <= cur} aria-label="Previous month" className="flex size-11 items-center justify-center hover:text-clay-600 disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => go(1)} disabled={idx >= max} aria-label="Next month" className="flex size-11 items-center justify-center hover:text-clay-600 disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d} className="pb-2 text-xs font-medium uppercase tracking-widest text-taupe-600">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const iso = toISO(new Date(month.y, month.m, i + 1));
          const ok = hasSlots(iso);
          const sel = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!ok}
              onClick={() => onSelect(iso)}
              aria-pressed={sel}
              aria-label={`${fmtDateLong(iso)}${ok ? '' : ', unavailable'}`}
              className={`relative flex aspect-square min-h-11 items-center justify-center text-base tabular-nums transition ${
                sel ? 'bg-espresso-900 text-cream-50' : ok ? 'border border-cream-300 bg-cream-50 hover:border-espresso-900' : 'text-taupe-400/70 line-through decoration-taupe-400/40'
              } ${iso === todayISO() && !sel ? 'font-semibold text-clay-600' : ''}`}
            >
              {i + 1}
              {ok && !sel && <span className="absolute bottom-1.5 size-1 bg-clay-500" />}
            </button>
          );
        })}
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-taupe-600">
        <span className="size-1.5 bg-clay-500" /> Days with free appointments are shown. Struck-through days are unavailable.
      </p>
    </div>
  );
}

/* ---------- page ---------- */

export default function Book() {
  const { bookings, blocks } = useStore();

  const init = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const svc = (q.get('service') ?? '').split(',').filter((id) => getService(id));
    const sty = q.get('stylist');
    const stylist = sty && getStylist(sty) && canDo(getStylist(sty)!, svc) ? sty : null;
    const date = q.get('date');
    const time = q.get('time');
    return {
      svc,
      stylist,
      date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      time: time && !Number.isNaN(Number(time)) ? Number(time) : null,
    };
  }, []);

  const [step, setStep] = useState(init.svc.length ? (init.stylist ? 2 : 1) : 0);
  const [serviceIds, setServiceIds] = useState<string[]>(init.svc);
  const [stylistId, setStylistId] = useState<string | null>(init.stylist);
  const [date, setDate] = useState<string | null>(init.date);
  const [time, setTime] = useState<number | null>(init.time);
  const [month, setMonth] = useState(() => {
    const d = init.date ? fromISO(init.date) : new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [done, setDone] = useState<Booking | null>(null);

  const eligible = useMemo(() => stylists.filter((s) => canDo(s, serviceIds)), [serviceIds]);
  const { duration } = totals(serviceIds);
  const pool = stylistId === ANY ? eligible.map((s) => s.id) : stylistId ? [stylistId] : [];

  const hasSlots = (iso: string) => slotsFor(bookings, blocks, iso, pool, duration).length > 0;
  const slots = date ? slotsFor(bookings, blocks, date, pool, duration) : [];
  const timeValid = time !== null && slots.some((s) => s.start === time);

  const stylistLabel = stylistId === ANY ? 'Anyone available' : stylistId ? (getStylist(stylistId)?.name ?? null) : null;

  const toggleService = (id: string) => {
    const next = serviceIds.includes(id) ? serviceIds.filter((x) => x !== id) : [...serviceIds, id];
    setServiceIds(next);
    setTime(null);
    if (stylistId && stylistId !== ANY) {
      const st = getStylist(stylistId);
      if (!st || !canDo(st, next)) setStylistId(null);
    }
  };

  const canContinue =
    step === 0 ? serviceIds.length > 0 && eligible.length > 0 : step === 1 ? !!stylistId : step === 2 ? !!date && timeValid : true;

  const next = () => {
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((s) => s + 1);
  };
  const back = () => {
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = 'Please enter your name.';
    if (form.phone.replace(/\D/g, '').length < 7) err.phone = 'Please enter a phone number we can reach you on.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Please enter a valid email address.';
    setErrors(err);
    if (Object.keys(err).length || !date || time === null) return;

    const slot = slotsFor(bookings, blocks, date, pool, duration).find((s) => s.start === time);
    if (!slot) {
      setNotice('Sorry, that time has just been taken. Please choose another.');
      setTime(null);
      setStep(2);
      return;
    }
    const load = (id: string) => bookings.filter((b) => b.stylistId === id && b.date === date).length;
    const chosen = slot.stylistIds.slice().sort((a, b) => load(a) - load(b))[0];
    const t = totals(serviceIds);
    const booking = addBooking({
      serviceIds,
      stylistId: chosen,
      anyone: stylistId === ANY,
      date,
      start: time,
      duration: t.duration,
      price: t.price,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    });
    setDone(booking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const upd = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ----- confirmation ----- */
  if (done) {
    const st = getStylist(done.stylistId);
    return (
      <section className="pb-24 pt-28 sm:pt-40">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="animate-fade-up lg:col-span-7">
            <span className="flex size-14 items-center justify-center bg-success-100 text-success-600">
              <Check size={28} />
            </span>
            <p className="eyebrow mb-3 mt-8">Booking confirmed · Ref {done.ref}</p>
            <h1 className="text-5xl font-light leading-[1.05] sm:text-6xl">
              See you soon, <em className="italic text-clay-600">{done.name.split(' ')[0]}.</em>
            </h1>
            <p className="mt-6 max-w-prose text-lg text-taupe-700">
              Your appointment with {st?.name} is booked for {fmtDateLong(done.date)} at {fmtTime(done.start)}. A confirmation will be sent to {done.email}. Need to change anything? Call us on{' '}
              <a href={`tel:${salon.phone.replace(/\s/g, '')}`} className="underline underline-offset-4">
                {salon.phone}
              </a>
              .
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button className="btn btn-primary" onClick={() => downloadIcs(done)}>
                <CalendarPlus size={16} /> Add to calendar
              </button>
              <Link to="/" className="btn btn-outline">
                Back to home
              </Link>
            </div>
            <div className="mt-12 border-t border-cream-300 pt-6 text-sm text-taupe-700">
              <p className="font-medium text-espresso-900">Before you arrive</p>
              <p className="mt-2 max-w-prose">
                We’re at {salon.address.line1}, {salon.address.area}, {salon.address.city} {salon.address.postcode}. Please arrive five minutes early for tea and a quick chat. If you are colouring, we’ll patch test first if it’s your first visit.
              </p>
            </div>
          </div>
          <div className="animate-fade-up lg:col-span-5" style={{ animationDelay: '150ms' }}>
            <Summary serviceIds={done.serviceIds} stylistLabel={st?.name ?? null} date={done.date} time={done.start} />
            <dl className="mt-4 space-y-1 border border-cream-300 p-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Name</dt>
                <dd>{done.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-taupe-600">Phone</dt>
                <dd>{done.phone}</dd>
              </div>
              {done.notes && (
                <div className="flex justify-between gap-4">
                  <dt className="text-taupe-600">Notes</dt>
                  <dd className="text-right">{done.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>
    );
  }

  const continueBtn = (
    <button
      type={step === 3 ? 'submit' : 'button'}
      form={step === 3 ? 'details-form' : undefined}
      onClick={step === 3 ? undefined : next}
      disabled={!canContinue}
      className="btn btn-primary flex-1"
    >
      {step === 3 ? 'Confirm booking' : 'Continue'} <ArrowRight size={16} />
    </button>
  );

  /* ----- steps ----- */
  return (
    <section className="pb-32 pt-24 sm:pt-32 lg:pb-24">
      <div className="container-x">
        <div className="mb-10 mt-6 sm:mt-10">
          <p className="eyebrow mb-3">Book online</p>
          <h1 className="text-4xl font-light sm:text-6xl">
            {['Choose your', 'Choose your', 'Pick a', 'Almost'][step]}{' '}
            <em className="italic text-clay-600">{['services.', 'stylist.', 'time.', 'there.'][step]}</em>
          </h1>
        </div>
        <Stepper step={step} />

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div key={step} className="animate-fade-up lg:col-span-8">
            {notice && <p role="alert" className="mb-6 border border-danger-600/30 bg-danger-100 px-4 py-3 text-sm text-danger-600">{notice}</p>}

            {/* Step 1 */}
            {step === 0 && (
              <div className="space-y-12">
                {categories.map((c) => (
                  <div key={c.id}>
                    <h2 className="mb-4 border-b border-espresso-900/80 pb-3 font-display text-2xl font-light">{c.name}</h2>
                    <ul className="divide-y divide-cream-300">
                      {services
                        .filter((s) => s.category === c.id)
                        .map((s) => {
                          const on = serviceIds.includes(s.id);
                          return (
                            <li key={s.id}>
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={on}
                                onClick={() => toggleService(s.id)}
                                className={`flex w-full items-center gap-4 px-2 py-5 text-left transition-colors sm:px-4 ${on ? 'bg-cream-100' : 'hover:bg-cream-100/60'}`}
                              >
                                <span className={`flex size-6 shrink-0 items-center justify-center border transition ${on ? 'border-espresso-900 bg-espresso-900 text-cream-50' : 'border-taupe-400'}`}>
                                  {on && <Check size={14} />}
                                </span>
                                <span className="flex-1">
                                  <span className="block text-lg">{s.name}</span>
                                  <span className="block text-sm text-taupe-700">{s.description}</span>
                                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-taupe-600">
                                    <Clock size={13} /> {fmtDuration(s.duration)}
                                  </span>
                                </span>
                                <span className="font-display text-xl tabular-nums">
                                  {s.from && <span className="mr-1 text-sm text-taupe-600">from</span>}
                                  {money(s.price)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
                {serviceIds.length > 0 && eligible.length === 0 && (
                  <p role="alert" className="border border-danger-600/30 bg-danger-100 px-4 py-3 text-sm text-danger-600">
                    These services are with different specialists, so they can’t share one appointment. Please book them separately, or remove one.
                  </p>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setStylistId(ANY);
                    setTime(null);
                  }}
                  aria-pressed={stylistId === ANY}
                  className={`flex min-h-48 flex-col justify-between border p-6 text-left transition ${stylistId === ANY ? 'border-espresso-900 bg-cream-100' : 'border-cream-300 hover:border-taupe-500'}`}
                >
                  <Sparkles size={24} className="text-clay-600" />
                  <span>
                    <span className="block font-display text-2xl font-light">Anyone available</span>
                    <span className="mt-1 block text-sm text-taupe-700">We’ll match you with the first free specialist. More times to choose from.</span>
                  </span>
                </button>
                {eligible.map((s) => {
                  const on = stylistId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setStylistId(s.id);
                        setTime(null);
                      }}
                      aria-pressed={on}
                      className={`flex gap-4 border p-4 text-left transition ${on ? 'border-espresso-900 bg-cream-100' : 'border-cream-300 hover:border-taupe-500'}`}
                    >
                      <img src={s.photo} alt="" className="size-24 shrink-0 object-cover sm:size-28" />
                      <span className="flex flex-col justify-center">
                        <span className="font-display text-xl font-light">{s.name}</span>
                        <span className="text-sm text-taupe-600">{s.role}</span>
                        <span className="mt-2 text-sm text-taupe-700">{s.specialties.slice(0, 2).join(' · ')}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div className="grid gap-12 md:grid-cols-2">
                <Calendar
                  month={month}
                  setMonth={setMonth}
                  selected={date}
                  hasSlots={hasSlots}
                  onSelect={(iso) => {
                    setDate(iso);
                    setTime(null);
                  }}
                />
                <div>
                  <h3 className="mb-4 font-display text-2xl font-light">{date ? fmtDateLong(date) : 'Available times'}</h3>
                  {!date ? (
                    <p className="text-taupe-600">Select a day to see free times.</p>
                  ) : slots.length === 0 ? (
                    <p className="text-taupe-600">No free times on this day. Please choose another.</p>
                  ) : (
                    <div className="space-y-6">
                      {[
                        ['Morning', 0, 12 * 60],
                        ['Afternoon', 12 * 60, 17 * 60],
                        ['Evening', 17 * 60, 24 * 60],
                      ].map(([label, from, to]) => {
                        const list = slots.filter((s) => s.start >= (from as number) && s.start < (to as number));
                        if (!list.length) return null;
                        return (
                          <div key={label as string}>
                            <p className="eyebrow mb-3">{label}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {list.map((s) => (
                                <button
                                  key={s.start}
                                  type="button"
                                  onClick={() => setTime(s.start)}
                                  aria-pressed={time === s.start}
                                  className={`min-h-11 border px-2 py-2.5 text-sm tabular-nums transition ${time === s.start ? 'border-espresso-900 bg-espresso-900 text-cream-50' : 'border-cream-300 hover:border-espresso-900'}`}
                                >
                                  {fmtTime(s.start)}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 3 && (
              <form id="details-form" onSubmit={submit} noValidate className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="name">
                    Full name
                  </label>
                  <input id="name" className="input" autoComplete="name" value={form.name} onChange={upd('name')} aria-invalid={!!errors.name} placeholder="Jane Smith" />
                  {errors.name && <p className="mt-2 text-sm text-danger-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="phone">
                    Phone
                  </label>
                  <input id="phone" type="tel" className="input" autoComplete="tel" value={form.phone} onChange={upd('phone')} aria-invalid={!!errors.phone} placeholder="07700 900000" />
                  {errors.phone && <p className="mt-2 text-sm text-danger-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={upd('email')} aria-invalid={!!errors.email} placeholder="jane@example.com" />
                  {errors.email && <p className="mt-2 text-sm text-danger-600">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="notes">
                    Notes <span className="normal-case tracking-normal text-taupe-600">(optional)</span>
                  </label>
                  <textarea id="notes" rows={4} className="input resize-none" value={form.notes} onChange={upd('notes')} placeholder="Hair goals, allergies, inspiration, anything we should know." />
                </div>
                <p className="text-sm text-taupe-600 sm:col-span-2">
                  Your details are only used to manage this booking. Payment is taken in the salon after your appointment.
                </p>
              </form>
            )}

            {/* Desktop controls */}
            <div className="mt-12 hidden gap-3 lg:flex">
              {step > 0 && (
                <button type="button" onClick={back} className="btn btn-outline">
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {continueBtn}
            </div>
          </div>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28">
              <Summary serviceIds={serviceIds} stylistLabel={stylistLabel} date={date} time={timeValid ? time : null} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-50 px-4 pb-4 pt-3 shadow-lg lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={back} aria-label="Back" className="btn btn-outline px-4">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0 text-sm leading-tight">
            <p className="font-display text-xl tabular-nums">
              {serviceIds.length ? `${totals(serviceIds).from ? 'from ' : ''}${money(totals(serviceIds).price)}` : 'No services'}
            </p>
            <p className="truncate text-taupe-600">{serviceIds.length ? fmtDuration(duration) : 'Select to begin'}</p>
          </div>
          {continueBtn}
        </div>
      </div>
    </section>
  );
}
