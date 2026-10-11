# Fin Twin — test money decisions first

Fin Twin builds a simple **financial twin** of you from a few numbers, shows where your money is
heading over the next 10 years, and lets you try a decision on the twin before you make it for
real: a car on EMI, a job switch, a career break, a prepayment, a new SIP.

Built for salaried people in India. **No bank connection, ever.** You type in a few numbers;
the twin does the maths.

## Features

1. **Build your twin** (about 2 minutes) — take-home pay, monthly spending, savings,
   investments, monthly SIP, loans/EMIs and up to three goals. Assumptions for pay rise,
   inflation and investment return have sensible defaults and can be changed.
2. **Your future** — projected net worth over 10 years, what's left each month, and the moments
   that matter: loans ending (and the EMI that frees up), goals reached on time or late, the cash
   cushion running thin, crossing ₹1 crore.
3. **What if…** — apply one or more changes to a copy of the twin and compare the two futures:
   money left each month, net worth in 5 and 10 years, goal dates, debt-free date and lowest cash
   cushion. One-tap starters (car on EMI, phone on no-cost EMI, 6-month break, job switch, moving
   city, SIP, prepaying a loan) make it usable immediately.
4. **Saved scenarios** — keep a few what-ifs and see each one's 10-year impact at a glance.

Each loan also has a detail page: interest vs principal by year, a "match your bank" balance
update, a prepayment comparison (shorter loan vs lower EMI) and EMI dates as a calendar file.

**Private by default:** works without an account; data stays in the browser. An optional
account syncs across devices, and anything entered locally moves in on sign-in. Users can export
their data as JSON or permanently delete it (and their account) from Settings.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR) on Vite
- Tailwind CSS v4 with [shadcn/ui](https://ui.shadcn.com) components from the
  [neobrutalism](https://neobrutalism.dev) registry (built on Base UI), Recharts, lucide icons,
  sonner toasts
- Firebase Auth (email/password) and Cloud Firestore for optional sync
- Builds for Cloudflare Workers via Nitro

## Design system

The UI uses the **neobrutalism** theme for shadcn/ui ("Yellow" palette): flat colours, 2px black
borders, hard 4px offset shadows, 5px corners, Archivo for text and Archivo Black for display
headings.

- **Tokens** live in `src/styles.css`, taken from the registry preset. Use them, not raw colours:
  `bg-background`, `bg-secondary-background` (white surfaces), `bg-main` (yellow accent),
  `text-foreground`, `border-border`, `shadow-shadow`, `rounded-base`, `font-base` /
  `font-heading` (weights) and `font-display` (headline font). Status colours are `bg-good`,
  `bg-warn`, `bg-bad` and `bg-info`, always with black text.
- **Components** live in `src/components/ui` and come from the registry. Add new ones the same
  way so they match:

  ```bash
  npx shadcn@latest add @neobrutalism/dialog
  ```

  For a link that looks like a button, put `buttonVariants()` on the router `<Link>` instead of
  wrapping it in `<Button>`.

- **App building blocks** in `src/components/fintwin/ui.tsx` (`PageShell`, `PageHeading`,
  `StatTile`, `ToneBadge`, `Marker`, `SectionLabel`) are compositions of those components. Don't
  add one-off CSS utilities; compose components and tokens instead.

## Getting started

Requires Node.js 22.18 or newer (the tests run TypeScript directly with Node).

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web app config
npm run dev                  # http://localhost:8080
```

The Firebase values come from Firebase console → Project settings → Your apps → Web app.
`VITE_FIREBASE_MEASUREMENT_ID` is optional (only needed for Google Analytics). These are public
browser config values; access control is enforced by Firestore security rules.

Deploy the security rules before using accounts, or every save will fail:

```bash
firebase deploy --only firestore:rules
```

## Scripts

| Command          | What it does                                 |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start the dev server                         |
| `npm run build`  | Production build (Cloudflare Workers)        |
| `npm test`       | Run the projection and loan-maths unit tests |
| `npm run lint`   | ESLint + Prettier checks                     |
| `npm run format` | Format the codebase with Prettier            |

## Project structure

```
src/
  lib/twin.ts               The twin: month-by-month projection and what-if comparison (pure, tested)
  lib/loans.ts              Loan maths: EMI, schedules, prepayment (pure, tested)
  lib/*.test.ts             Unit tests
  lib/format.ts             ₹ and date formatting (Indian number grouping)
  lib/calendar.ts           .ics export for EMI due dates
  hooks/use-store.ts        Storage: localStorage when signed out, Firestore when signed in
  components/fintwin/       App UI: shell, loan form, charts, "moments"
  routes/                   / · /setup · /what-if · /loans/new · /loans/$id · /loans/$id/edit · /settings
  integrations/firebase/    Firebase client setup
firestore.rules             Each user can read and write only their own data
```

## Data model

Signed-out users: `localStorage` keys `fintwin.twin.v1`, `fintwin.loans.v1` and
`fintwin.scenarios.v1`.

Signed-in users (Firestore):

- `profiles/{uid}` — `twin`: pay, spending, savings, investments, SIP, goals, assumptions
- `users/{uid}/loans/{loanId}` — one document per loan
- `users/{uid}/scenarios/{scenarioId}` — saved what-ifs (a name and a list of changes)

## How the projection works

Each month the twin earns its take-home pay (rising yearly by the pay-rise assumption), spends
its spending (rising with inflation), pays EMIs on reducing-balance loans and invests its SIP.
Whatever is left goes to savings, which earn 3% a year; investments grow at the return
assumption. Goals are paid for in date order as soon as there's enough money — on their date if
affordable, later if not. If cash runs short, investments cover it; if both run out, the twin
flags it. The projection runs for 30 years; the charts show the first 10.

It's a projection from your own numbers and assumptions, not a prediction and not financial
advice.
