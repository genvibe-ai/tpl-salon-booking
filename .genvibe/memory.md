## What this app is
Hollis & Hue: a fictional hair and beauty salon's booking website (React 19, Vite, Tailwind CSS 4, TypeScript). No backend; bookings are saved in the browser.

## Built so far
Home (photo hero with Book now and open/closed line, signature services, stylists, review switcher, gallery, hours with today highlighted, map, footer), Services page with categories, a page per stylist (bio, specialties, portfolio, next free times), Booking at /book in four steps (services, stylist or anyone available, calendar with only free slots, client details) ending on a confirmation with a reference and an add-to-calendar file, and an owner view at /admin (per-stylist day timeline, upcoming bookings with cancel, time off).

## Design
Cream #FBF8F2 / #F5EFE4, taupe #96816A, deep espresso #251A14, clay accent. Fraunces for headings (italic accents), Inter for text. Editorial layout with lots of white space, square-edged buttons with letter-spaced labels, subtle reveals; works well on phones (sticky price and Continue bar while booking).

## Structure
- src/content.ts: salon (name, address, phone, hours), categories, services (price, minutes), stylists (photo, role, services, working days), reviews, gallery.
- src/lib/availability.ts (free slots), store.ts (bookings and blocks in localStorage, key hollis-hue:v1), router.tsx (small client router), time.ts.
- src/pages/: Home, Services, Stylist, Book, Admin. src/components/: Layout, ui.

## User preferences & rules
Edit src/content.ts first; keep the @theme tokens in src/index.css; never hard-code prices, names or hours in pages.

## Open issues & next ideas
Save bookings in Supabase so staff see them on every device; deposits with Stripe or PayPal at the last step; email or WhatsApp confirmations; staff sign-in for /admin. Photos are Unsplash URLs (swap for the salon's own).
