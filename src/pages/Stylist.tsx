import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getStylist, stylists } from '../content';
import { Link } from '../lib/router';
import { money, nextFree, servicesFor } from '../lib/availability';
import { dayNames, fmtDateShort, fmtDuration, fmtTime, fromISO } from '../lib/time';
import { useStore } from '../lib/store';
import { Reveal } from '../components/ui';

export default function StylistPage({ id }: { id: string }) {
  const st = getStylist(id);
  const { bookings, blocks } = useStore();
  const offered = useMemo(() => (st ? servicesFor(st) : []), [st]);
  const [svcId, setSvcId] = useState<string>('');
  const svc = offered.find((s) => s.id === svcId) ?? offered[0];

  const free = useMemo(
    () => (st && svc ? nextFree(bookings, blocks, st.id, svc.duration, 5) : []),
    [bookings, blocks, st, svc],
  );

  if (!st) {
    return (
      <section className="container-x pb-24 pt-40">
        <h1 className="font-display text-5xl font-light">Stylist not found</h1>
        <Link to="/#stylists" className="btn btn-primary mt-8">
          See the team
        </Link>
      </section>
    );
  }

  const first = st.name.split(' ')[0];
  const others = stylists.filter((s) => s.id !== st.id);

  return (
    <>
      <section className="pb-16 pt-24 sm:pt-32">
        <div className="container-x">
          <Link to="/#stylists" className="mb-8 inline-flex items-center gap-2 text-sm text-taupe-700 hover:text-clay-600">
            <ArrowLeft size={16} /> All stylists
          </Link>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <div className="aspect-4/5 animate-fade-in overflow-hidden bg-cream-200">
                <img src={st.photo} alt={`${st.name}, ${st.role}`} className="size-full object-cover" />
              </div>
            </div>
            <div className="animate-fade-up lg:col-span-7">
              <p className="eyebrow mb-4">{st.role}</p>
              <h1 className="text-5xl font-light leading-[1.05] sm:text-7xl">{st.name}</h1>
              <p className="mt-6 max-w-prose text-lg text-taupe-700">{st.bio}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {st.specialties.map((s) => (
                  <li key={s} className="border border-cream-300 bg-cream-100 px-4 py-2 text-sm text-taupe-700">
                    {s}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid max-w-sm grid-cols-2 gap-6 border-t border-cream-300 pt-6">
                <div>
                  <dt className="text-sm text-taupe-600">Experience</dt>
                  <dd className="font-display text-3xl font-light">{st.years} years</dd>
                </div>
                <div>
                  <dt className="text-sm text-taupe-600">In the salon</dt>
                  <dd className="text-taupe-700">{st.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => dayNames[d].slice(0, 3)).join(', ')}</dd>
                </div>
              </dl>
              <Link to={`/book?stylist=${st.id}`} className="btn btn-primary mt-10">
                Book with {first} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-100 py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Availability</p>
            <h2 className="font-display text-4xl font-light sm:text-5xl">
              {first}’s next <em className="italic text-clay-600">free times.</em>
            </h2>
            <label className="label mt-8" htmlFor="svc">
              For a
            </label>
            <select id="svc" value={svc?.id} onChange={(e) => setSvcId(e.target.value)} className="input">
              {offered.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {fmtDuration(s.duration)}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-7">
            {free.length === 0 ? (
              <p className="text-taupe-700">No free times in the next two months. Please call us on the number in the footer.</p>
            ) : (
              <ul className="divide-y divide-cream-300 border-y border-cream-300">
                {free.map(({ date, slots }) => (
                  <li key={date} className="grid gap-3 py-5 sm:grid-cols-[9rem_1fr] sm:items-start">
                    <p className="font-display text-xl">{fmtDateShort(date)}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.slice(0, 6).map((s) => (
                        <Link
                          key={s.start}
                          to={`/book?stylist=${st.id}&service=${svc.id}&date=${date}&time=${s.start}`}
                          className="min-w-20 border border-espresso-900/30 px-3 py-2.5 text-center text-sm tabular-nums transition hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50"
                          aria-label={`${fromISO(date).toDateString()} at ${fmtTime(s.start)}`}
                        >
                          {fmtTime(s.start)}
                        </Link>
                      ))}
                      {slots.length > 6 && (
                        <Link to={`/book?stylist=${st.id}&service=${svc.id}&date=${date}`} className="px-2 py-2.5 text-sm text-clay-600 underline underline-offset-4">
                          +{slots.length - 6} more
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x">
          <p className="eyebrow mb-4">Portfolio</p>
          <h2 className="font-display text-4xl font-light sm:text-5xl">
            Recent work by <em className="italic text-clay-600">{first}.</em>
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {st.work.map((w, i) => (
              <Reveal key={w} delay={i * 80}>
                <div className="aspect-3/4 overflow-hidden bg-cream-200">
                  <img src={w} alt={`${first}’s work, ${i + 1}`} loading="lazy" className="size-full object-cover transition duration-700 hover:scale-105" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-cream-300 py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4">Services with {first}</p>
            <ul className="divide-y divide-cream-300 border-y border-cream-300">
              {offered.map((s) => (
                <li key={s.id}>
                  <Link to={`/book?stylist=${st.id}&service=${s.id}`} className="flex items-center justify-between gap-4 py-4 transition hover:text-clay-600">
                    <span>
                      <span className="block">{s.name}</span>
                      <span className="text-sm text-taupe-600">{fmtDuration(s.duration)}</span>
                    </span>
                    <span className="tabular-nums">
                      {s.from && <span className="mr-1 text-sm text-taupe-600">from</span>}
                      {money(s.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow mb-4">Also at the salon</p>
            <ul className="space-y-4">
              {others.map((o) => (
                <li key={o.id}>
                  <Link to={`/stylists/${o.id}`} className="group flex items-center gap-4">
                    <img src={o.photo} alt="" className="size-16 object-cover" loading="lazy" />
                    <span>
                      <span className="block font-display text-xl transition group-hover:text-clay-600">{o.name}</span>
                      <span className="text-sm text-taupe-600">{o.role}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
