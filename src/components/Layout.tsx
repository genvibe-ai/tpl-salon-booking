import { useEffect, useState, type ReactNode } from 'react';
import { Camera, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { salon } from '../content';
import { Link, useLocation } from '../lib/router';
import { Wordmark } from './ui';

const nav = [
  { label: 'Services', to: '/services' },
  { label: 'Stylists', to: '/#stylists' },
  { label: 'Reviews', to: '/#reviews' },
  { label: 'Gallery', to: '/#gallery' },
  { label: 'Visit', to: '/#visit' },
];

export function Header() {
  const { path, key } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [key]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const overHero = path === '/' && !scrolled && !open;
  const tone = overHero ? 'text-cream-50' : 'text-espresso-900';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        overHero ? 'bg-transparent' : open ? 'bg-cream-50' : 'bg-cream-50/95 shadow-sm'
      }`}
    >
      <div className={`container-x flex h-16 items-center justify-between sm:h-20 ${tone}`}>
        <Link to="/" aria-label={`${salon.name} home`}>
          <Wordmark name={salon.name} className="text-2xl tracking-tight" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-xs font-medium uppercase tracking-widest opacity-90 transition hover:text-clay-500 hover:opacity-100">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/book" className={`btn hidden sm:inline-flex ${overHero ? 'btn-light' : 'btn-primary'}`}>
            Book now
          </Link>
          <button className="flex size-12 items-center justify-center lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-x h-[calc(100svh-4rem)] animate-fade-in overflow-y-auto pb-12 pt-8 text-espresso-900 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {nav.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up border-b border-cream-300 py-5 font-display text-3xl font-light"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link to="/book" className="btn btn-primary mt-8 w-full">
            Book now
          </Link>
          <p className="mt-8 text-sm text-taupe-700">
            {salon.address.line1}, {salon.address.area}
            <br />
            {salon.phone}
          </p>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const a = salon.address;
  return (
    <footer className="bg-espresso-950 text-cream-200">
      <div className="container-x grid gap-12 py-16 sm:py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark name={salon.name} className="text-4xl font-light text-cream-50" />
          <p className="mt-4 max-w-sm text-taupe-400">{salon.tagline} in {a.area}, {a.city}. Small team, unhurried appointments, beautiful results.</p>
          <Link to="/book" className="btn btn-light mt-8">
            Book an appointment
          </Link>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-taupe-400">Explore</p>
          <ul className="space-y-3">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition hover:text-clay-300">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/book" className="transition hover:text-clay-300">
                Book online
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow mb-4 text-taupe-400">Find us</p>
          <ul className="space-y-3 text-cream-200">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-clay-300" />
              <span>
                {a.line1}, {a.area}
                <br />
                {a.city} {a.postcode}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-1 shrink-0 text-clay-300" />
              <a href={`tel:${salon.phone.replace(/\s/g, '')}`} className="hover:text-clay-300">
                {salon.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-1 shrink-0 text-clay-300" />
              <a href={`mailto:${salon.email}`} className="hover:text-clay-300">
                {salon.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Camera size={18} className="mt-1 shrink-0 text-clay-300" />
              <span>{salon.instagram}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso-800">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-taupe-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {salon.name}. All rights reserved.
          </p>
          <Link to="/admin" className="hover:text-cream-50">
            Owner view
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
