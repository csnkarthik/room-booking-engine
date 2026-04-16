# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build (uses --webpack flag, not Turbopack)
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # unit tests (Vitest, single run)
npm run test:watch   # unit tests in watch mode
npm run test:e2e     # Playwright e2e tests (auto-starts dev server)
```

Run a single unit test file:

```bash
npx vitest run tests/unit/path/to/file.test.ts
```

Unit tests live in `tests/unit/`, e2e tests in `tests/e2e/`. Vitest uses jsdom and a setup file at `tests/setup.ts`. The `@` alias maps to the project root.

## Architecture

**Next.js 16 App Router** with two route groups:

- `app/(marketing)/` — public browsing pages (rooms listing, room detail)
- `app/(booking)/` — booking flow pages (checkout, confirmation)
- `app/page.tsx` — home page (server component, reads data directly)
- `app/api/` — REST endpoints: `rooms/`, `rooms/[id]/`, `bookings/`, `bookings/[id]/`, `payments/`

**Data layer** (`lib/`):

- `lib/data/*.json` — flat-file "database" (rooms, bookings, availability, pricing). Writes go directly to these files via `lib/utils/data.ts`.
- `lib/adapters/` — `DataAdapter` interface + `JsonAdapter`. Switch backends via `DATA_SOURCE` env var (currently only `json` is implemented). Route handlers use `getDataAdapter()`.
- `lib/utils/data.ts` — low-level read/write helpers used by both server components and API routes.
- `lib/types/index.ts` — canonical TypeScript types (`Room`, `Booking`, `Availability`, etc.)
- `lib/types/schemas.ts` — Zod schemas and `CreateBookingInput` type for API validation.

**Client state** (`lib/store/bookingStore.ts`):

- Zustand store with `persist` middleware (key: `booking-session` in localStorage).
- Holds in-progress booking: room, check-in/out dates, guests, extras, computed `totalPrice`.
- Checkout page reads from this store; `clearBooking()` is called after successful payment.

**Component structure** (`components/`):

- `ui/` — shadcn/ui primitives
- `booking-bar/` — date/guest search bar used on listings
- `calendar/` — availability calendar
- `checkout/` — `CheckoutForm` (Stripe Elements) + `BookingSummary`
- `room-card/` — room listing cards

**Payment flow**: checkout page POSTs to `/api/payments` → creates Stripe PaymentIntent → returns `clientSecret` → Stripe Elements collects card → on success, POST to `/api/bookings` creates booking record in `bookings.json`.

**Styling**: Tailwind CSS v4 (PostCSS plugin, no `tailwind.config`). `prettier-plugin-tailwindcss` sorts classes on format. `class-variance-authority` + `clsx`/`tailwind-merge` used for conditional classes.

**Forms**: `react-hook-form` + `@hookform/resolvers` with Zod schemas for validation.

**Data fetching** (client): `@tanstack/react-query` wrapped in `lib/providers/QueryProvider.tsx`. Server components fetch directly via `lib/utils/data.ts`.

**Env vars required**:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `DATA_SOURCE` (optional, defaults to `"json"`)
