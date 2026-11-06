# Hollis & Hue

A booking website for a hair and beauty salon, built with React 19, Vite and Tailwind CSS 4. Clients see
services with prices and durations, the stylists, reviews, a gallery, opening hours and the location, and
book in four steps: services, a stylist (or anyone available), a date and time from the free slots only,
and their details. The owner view at `/admin` shows each stylist's day as a timeline, upcoming bookings,
and time off.

```bash
yarn install
yarn dev        # http://localhost:5173
yarn build      # static site in dist/
```

## Make it yours

Everything about the salon lives in `src/content.ts`: name, address, phone, hours, service categories and
services (price, duration), stylists (photo, role, specialties, which services they do, working days),
reviews and the gallery. Colours and fonts are in the `@theme` block of `src/index.css`.

## How it works

- No backend: free times are worked out from opening hours, each stylist's days and existing bookings
  (`src/lib/availability.ts`). Bookings and time off are saved in the browser (localStorage, key
  `hollis-hue:v1`), so a booking made on the site appears in `/admin` straight away.
- Photos are loaded from Unsplash; the map is OpenStreetMap.

Made with [GenVibe](https://genvibe.pro/templates/salon-booking). MIT licensed.
