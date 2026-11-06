import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { categories, gallery, reviews, salon, services, stylists } from '../content';
import { Link } from '../lib/router';
import { money, openStatus } from '../lib/availability';
import { dayNames, fmtDuration, fmtTime, parseHM } from '../lib/time';
import { Reveal, SectionHead, Stars } from '../components/ui';

function Hero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-espresso-950 text-cream-50">
      <img src={salon.heroImage} alt="Inside the salon, warm light on styling chairs" className="absolute inset-0 size-full animate-drift object-cover" fetchPriority="high" />
      <div className="absolute inset-0 bg-linear-to-t from-espresso-950 via-espresso-950/50 to-espresso-950/30" />
      <div className="container-x relative pb-12 pt-40 sm:pb-20">
        <p className="eyebrow mb-6 animate-fade-up text-cream-200" style={{ animationDelay: '100ms' }}>
          {salon.address.area}, {salon.address.city} · {salon.est}
        </p>
        <h1 className="max-w-4xl animate-fade-up text-5xl font-light leading-[1.05] sm:text-7xl lg:text-8xl" style={{ animationDelay: '250ms' }}>
          {salon.heroTitle} <em className="italic text-clay-300">{salon.heroTitleAccent}</em>
        </h1>
        <p className="mt-6 max-w-xl animate-fade-up text-lg text-cream-200 sm:text-xl" style={{ animationDelay: '400ms' }}>
          {salon.heroIntro}
        </p>
        <div className="mt-10 flex animate-fade-up flex-col gap-3 sm:flex-row" style={{ animationDelay: '550ms' }}>
          <Link to="/book" className="btn btn-light">
            Book now <ArrowRight size={16} />
          </Link>
          <Link to="/services" className="btn btn-outline-light">
            View services
          </Link>
        </div>
        <div className="mt-14 flex animate-fade-in flex-wrap items-center gap-x-8 gap-y-3 border-t border-cream-50/20 pt-6 text-sm text-cream-200" style={{ animationDelay: '800ms' }}>
          <span className="inline-flex items-center gap-2">
            <Clock size={16} className="text-clay-300" /> {openStatus()}
          </span>
          <span className="inline-flex items-center gap-2">
            <Stars n={5} /> {salon.rating.score} from {salon.rating.count} reviews
          </span>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <Reveal className="lg:col-span-6">
          <p className="eyebrow mb-4">The salon</p>
          <h2 className="font-display text-4xl font-light leading-[1.1] sm:text-6xl">{salon.aboutTitle}</h2>
          <div className="mt-8 max-w-prose space-y-5 text-lg text-taupe-700">
            {salon.aboutBody.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-cream-300 pt-8">
            {[
              [String(stylists.length), 'Specialist stylists'],
              [String(new Date().getFullYear() - Number(salon.est.replace(/\D/g, ''))), 'Years in Shoreditch'],
              [String(salon.rating.score), 'Average rating'],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-4xl font-light tabular-nums">{n}</p>
                <p className="mt-1 text-sm text-taupe-600">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="relative lg:col-span-6">
          <img src={salon.aboutImages[0]} alt="Mirrors and chairs in the salon" className="aspect-4/5 w-5/6 object-cover" loading="lazy" />
          <img src={salon.aboutImages[1]} alt="Salon reception detail" className="absolute -bottom-8 right-0 aspect-3/4 w-2/5 border-8 border-cream-50 object-cover shadow-lg" loading="lazy" />
        </Reveal>
      </div>
    </section>
  );
}

function Signature() {
  const featured = services.filter((s) => s.featuredLabel);
  return (
    <section id="services" className="section bg-cream-100">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHead eyebrow="Services" title="The" accent="menu." className="max-w-xl">
            Our most-loved treatments. Prices are guides; your stylist will confirm after a short consultation.
          </SectionHead>
          <Link to="/services" className="btn btn-outline self-start sm:self-auto">
            Full menu <ArrowUpRight size={16} />
          </Link>
        </div>
        <ul className="mt-14 border-t border-espresso-900/80">
          {featured.map((s, i) => (
            <Reveal key={s.id} delay={i * 40}>
              <li>
                <Link
                  to={`/book?service=${s.id}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-cream-300 py-6 transition-colors hover:bg-cream-200/60 sm:grid-cols-[3rem_1.2fr_2fr_auto_auto] sm:gap-x-8 sm:px-4"
                >
                  <span className="font-display text-lg italic text-taupe-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-2xl font-light transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">{s.featuredLabel}</span>
                  <span className="order-last col-span-3 hidden text-taupe-700 sm:order-none sm:col-span-1 sm:block">{s.description}</span>
                  <span className="hidden text-sm text-taupe-600 sm:block">{fmtDuration(s.duration)}</span>
                  <span className="text-right">
                    <span className="block font-display text-xl tabular-nums sm:text-2xl">
                      {s.from && <span className="mr-1 text-sm text-taupe-600">from</span>}
                      {money(s.price)}
                    </span>
                    <span className="block text-sm text-taupe-600 sm:hidden">{fmtDuration(s.duration)}</span>
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-taupe-700">
          {categories.map((c) => (
            <Link key={c.id} to={`/services#${c.id}`} className="underline decoration-taupe-400 underline-offset-4 hover:text-clay-600">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section id="stylists" className="section">
      <div className="container-x">
        <SectionHead eyebrow="The team" title="Meet your" accent="stylists." className="max-w-xl">
          Four specialists, each with a craft they have spent years refining. Choose your favourite or let us match you.
        </SectionHead>
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {stylists.map((s, i) => (
            <Reveal key={s.id} delay={i * 90}>
              <Link to={`/stylists/${s.id}`} className="group block">
                <div className="aspect-3/4 overflow-hidden bg-cream-200">
                  <img src={s.photo} alt={`${s.name}, ${s.role}`} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-light">{s.name}</h3>
                <p className="text-sm text-taupe-600">{s.role}</p>
                <p className="mt-3 text-sm text-taupe-700">{s.specialties.join(' · ')}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-clay-600 transition-all group-hover:gap-2">
                  View profile <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const [i, setI] = useState(0);
  const r = reviews[i];
  return (
    <section id="reviews" className="section bg-espresso-900 text-cream-100">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-4 text-taupe-400">Kind words</p>
          <h2 className="font-display text-4xl font-light leading-[1.1] text-cream-50 sm:text-5xl">
            Loved by <em className="italic text-clay-300">regulars.</em>
          </h2>
          <div className="mt-8 flex items-center gap-3">
            <span className="font-display text-5xl font-light tabular-nums text-cream-50">{salon.rating.score}</span>
            <div>
              <Stars n={5} />
              <p className="mt-1 text-sm text-taupe-400">{salon.rating.count} verified reviews</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <figure key={i} className="min-h-72 animate-fade-in">
            <blockquote className="font-display text-2xl font-light leading-snug text-cream-50 sm:text-4xl">“{r.text}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="flex size-12 items-center justify-center bg-clay-600 font-display text-lg text-cream-50">{r.name[0]}</span>
              <span>
                <span className="block font-medium text-cream-50">{r.name}</span>
                <span className="text-sm text-taupe-400">
                  {r.service} with {r.stylist}
                </span>
              </span>
            </figcaption>
          </figure>
          <div className="mt-10 flex gap-2" role="tablist" aria-label="Choose a review">
            {reviews.map((rv, k) => (
              <button
                key={rv.name}
                role="tab"
                aria-selected={k === i}
                aria-label={`Review from ${rv.name}`}
                onClick={() => setI(k)}
                className="flex h-10 w-10 items-center justify-center"
              >
                <span className={`block h-0.5 w-full transition-all ${k === i ? 'bg-clay-300' : 'bg-taupe-600'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="section">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHead eyebrow="Gallery" title="Recent" accent="work." />
          <p className="text-taupe-600">{salon.instagram}</p>
        </div>
        <div className="mt-12 columns-2 gap-3 sm:columns-3 sm:gap-4">
          {gallery.map((g, i) => (
            <Reveal key={g.src} delay={(i % 3) * 80} className="mb-3 break-inside-avoid sm:mb-4">
              <div className="group overflow-hidden bg-cream-200">
                <img src={g.src} alt={g.alt} loading="lazy" className={`w-full object-cover transition duration-700 group-hover:scale-105 ${i % 3 === 0 ? 'aspect-3/4' : i % 3 === 1 ? 'aspect-square' : 'aspect-4/5'}`} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visit() {
  const { lat, lng } = salon.map;
  const a = salon.address;
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const query = encodeURIComponent(`${a.line1}, ${a.area}, ${a.city} ${a.postcode}`);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.007}%2C${lat - 0.0035}%2C${lng + 0.007}%2C${lat + 0.0035}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <section id="visit" className="section bg-cream-100">
      <div className="container-x">
        <SectionHead eyebrow="Visit" title="Come and" accent="see us." />
        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h3 className="mb-5 text-xs font-medium uppercase tracking-widest text-taupe-700">Opening hours</h3>
            <ul className="divide-y divide-cream-300 border-y border-cream-300">
              {order.map((d) => {
                const h = salon.hours[d];
                const isToday = d === today;
                return (
                  <li key={d} className={`flex items-center justify-between py-3.5 ${isToday ? 'font-medium text-espresso-900' : 'text-taupe-700'}`}>
                    <span className="flex items-center gap-3">
                      {dayNames[d]}
                      {isToday && <span className="bg-clay-100 px-2 py-0.5 text-xs uppercase tracking-widest text-clay-600">Today</span>}
                    </span>
                    <span className="tabular-nums">{h ? `${fmtTime(parseHM(h.open))} – ${fmtTime(parseHM(h.close))}` : 'Closed'}</span>
                  </li>
                );
              })}
            </ul>
            <address className="mt-10 space-y-3 not-italic text-taupe-700">
              <p className="flex gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-clay-600" />
                <span>
                  {a.line1}, {a.area}
                  <br />
                  {a.city} {a.postcode}
                </span>
              </p>
              <p className="flex gap-3">
                <Phone size={18} className="mt-1 shrink-0 text-clay-600" />
                <a href={`tel:${salon.phone.replace(/\s/g, '')}`} className="hover:text-clay-600">
                  {salon.phone}
                </a>
              </p>
              <p className="flex gap-3">
                <Mail size={18} className="mt-1 shrink-0 text-clay-600" />
                <a href={`mailto:${salon.email}`} className="hover:text-clay-600">
                  {salon.email}
                </a>
              </p>
            </address>
            <a href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer" className="btn btn-outline mt-8">
              Get directions <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="lg:col-span-7">
            <iframe title={`Map to ${salon.name}`} src={src} loading="lazy" className="map-frame h-96 w-full border-0 bg-cream-200 lg:h-full lg:min-h-136" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="bg-clay-600 py-20 text-center text-cream-50 sm:py-28">
      <div className="container-x">
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-[1.1] sm:text-6xl">
          Your chair is <em className="italic">waiting.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-clay-100">Choose your services, pick a stylist and see only the times that are genuinely free.</p>
        <Link to="/book" className="btn btn-light mt-10">
          Book now <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Signature />
      <Team />
      <Reviews />
      <Gallery />
      <Visit />
      <Cta />
    </>
  );
}
