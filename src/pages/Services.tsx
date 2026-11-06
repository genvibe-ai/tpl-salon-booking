import { ArrowRight, Clock } from 'lucide-react';
import { categories, salon, services } from '../content';
import { Link } from '../lib/router';
import { money } from '../lib/availability';
import { fmtDuration } from '../lib/time';
import { Reveal } from '../components/ui';

export default function Services() {
  return (
    <>
      <section className="bg-cream-100 pb-12 pt-32 sm:pt-44">
        <div className="container-x">
          <p className="eyebrow mb-4 animate-fade-up">Services & prices</p>
          <h1 className="max-w-3xl animate-fade-up text-5xl font-light leading-[1.05] sm:text-7xl" style={{ animationDelay: '120ms' }}>
            Everything we do, <em className="italic text-clay-600">beautifully priced.</em>
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg text-taupe-700" style={{ animationDelay: '240ms' }}>
            Combine as many services as you like in one visit. Prices marked “from” depend on hair length and thickness, and are confirmed at your consultation.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-cream-300 bg-cream-50/95 sm:top-20">
        <nav className="container-x flex gap-6 overflow-x-auto py-3 text-xs font-medium uppercase tracking-widest" aria-label="Service categories">
          {categories.map((c) => (
            <Link key={c.id} to={`/services#${c.id}`} className="shrink-0 py-2 text-taupe-700 transition hover:text-clay-600">
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="container-x">
        {categories.map((c, ci) => {
          const list = services.filter((s) => s.category === c.id);
          return (
            <section key={c.id} id={c.id} className="grid gap-10 border-b border-cream-300 py-16 last:border-0 sm:py-24 lg:grid-cols-12 lg:gap-16">
              <Reveal className={`lg:col-span-4 ${ci % 2 ? 'lg:order-last' : ''}`}>
                <div className="lg:sticky lg:top-44">
                  <div className="aspect-4/3 overflow-hidden bg-cream-200 lg:aspect-4/5">
                    <img src={c.image} alt={`${c.name} at ${salon.name}`} loading="lazy" className="size-full object-cover" />
                  </div>
                </div>
              </Reveal>
              <div className="lg:col-span-8">
                <Reveal>
                  <p className="eyebrow mb-3">{String(ci + 1).padStart(2, '0')}</p>
                  <h2 className="font-display text-4xl font-light sm:text-5xl">{c.name}</h2>
                  <p className="mt-4 max-w-prose text-lg text-taupe-700">{c.blurb}</p>
                </Reveal>
                <ul className="mt-10 divide-y divide-cream-300 border-y border-cream-300">
                  {list.map((s) => (
                    <li key={s.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                      <div className="max-w-md">
                        <h3 className="font-display text-2xl font-light">{s.name}</h3>
                        <p className="mt-1 text-taupe-700">{s.description}</p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-taupe-600">
                          <Clock size={14} /> {fmtDuration(s.duration)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <p className="font-display text-2xl tabular-nums">
                          {s.from && <span className="mr-1 text-sm text-taupe-600">from</span>}
                          {money(s.price)}
                        </p>
                        <Link to={`/book?service=${s.id}`} className="btn btn-outline">
                          Book
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <section className="bg-espresso-900 py-16 text-center text-cream-100">
        <div className="container-x">
          <h2 className="font-display text-3xl font-light text-cream-50 sm:text-5xl">
            Not sure what you <em className="italic text-clay-300">need?</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-taupe-400">Book any service and tell us your hair goals in the notes. We’ll shape the appointment around them.</p>
          <Link to="/book" className="btn btn-light mt-8">
            Start booking <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
