import { useEffect } from 'react';
import { Shell } from './components/Layout';
import { Link, scrollToHash, useLocation } from './lib/router';
import Home from './pages/Home';
import Services from './pages/Services';
import StylistPage from './pages/Stylist';
import Book from './pages/Book';
import Admin from './pages/Admin';

function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-start justify-center pt-24">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-display text-5xl font-light">This page has gone <em className="italic text-clay-600">missing.</em></h1>
      <Link to="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </section>
  );
}

function App() {
  const { path, hash } = useLocation();

  useEffect(() => {
    scrollToHash(hash);
  }, [path, hash]);

  let page;
  if (path === '/') page = <Home />;
  else if (path === '/services') page = <Services />;
  else if (path === '/book') page = <Book />;
  else if (path === '/admin') page = <Admin />;
  else if (path.startsWith('/stylists/')) page = <StylistPage id={path.split('/')[2]} />;
  else page = <NotFound />;

  return <Shell>{page}</Shell>;
}

export default App;
