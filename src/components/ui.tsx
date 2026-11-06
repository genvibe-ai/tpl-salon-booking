import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Star, X } from 'lucide-react';

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Renders the salon name with an italic ampersand. */
export function Wordmark({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`font-display ${className}`}>
      {name.split(/(&)/).map((p, i) =>
        p === '&' ? (
          <em key={i} className="font-light italic text-clay-500">
            &amp;
          </em>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export function Stars({ n = 5, className = '' }: { n?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-clay-500 ${className}`} aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function SectionHead({ eyebrow, title, accent, children, className = '' }: { eyebrow: string; title: string; accent?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="font-display text-4xl font-light leading-[1.1] sm:text-5xl">
        {title} {accent && <em className="italic text-clay-600">{accent}</em>}
      </h2>
      {children && <p className="mt-5 max-w-prose text-lg text-taupe-700">{children}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 animate-fade-in bg-espresso-950/60" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full animate-fade-up overflow-y-auto bg-cream-50 p-6 shadow-xl sm:max-w-lg sm:p-8">
        <button onClick={onClose} className="absolute right-3 top-3 flex size-10 items-center justify-center text-taupe-700 hover:text-espresso-900" aria-label="Close">
          <X size={20} />
        </button>
        <h3 className="mb-5 pr-8 font-display text-2xl font-light">{title}</h3>
        {children}
      </div>
    </div>
  );
}
