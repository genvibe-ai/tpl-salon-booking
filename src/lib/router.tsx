import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

if (typeof window !== 'undefined') window.addEventListener('popstate', notify);

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
const snapshot = () => window.location.pathname + window.location.search + window.location.hash;

export function scrollToHash(hash: string) {
  if (!hash) {
    window.scrollTo({ top: 0 });
    return;
  }
  requestAnimationFrame(() => {
    const el = document.getElementById(hash.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

export function navigate(to: string) {
  if (to === snapshot()) {
    scrollToHash(new URL(to, window.location.origin).hash);
    return;
  }
  window.history.pushState(null, '', to);
  notify();
}

export function useLocation() {
  const s = useSyncExternalStore(subscribe, snapshot);
  const u = new URL(s, window.location.origin);
  return { path: u.pathname.replace(/\/+$/, '') || '/', search: u.searchParams, hash: u.hash, key: s };
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || rest.target === '_blank') return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
