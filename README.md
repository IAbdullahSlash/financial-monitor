# Fin Twin — EMI & Loan Tracker

Track every EMI and loan in one place: what you've paid, what's left, how much of it is
interest, and the day you'll be debt-free — plus how to get there sooner.

Built for salaried people in India juggling a home loan, a car loan, a personal loan and a
phone on "no-cost" EMI. **No bank connection, ever.** You type in your loans; the app does the
maths.

## Features

- **My loans** — paid vs remaining for every loan, total still owed, monthly EMI load (and its
  share of take-home pay), interest still to pay, upcoming due dates, and your debt-free date.
- **Add a loan, two ways** — from the original loan (amount, rate, tenure, first EMI date) or,
  if you don't remember those, from just your current EMI and how many are left.
- **Loan detail** — principal vs interest by year, how much of what you've paid was interest,
  and a "match your bank" balance update to correct drift from rate changes or rounding.
- **What if I prepay?** — compares the two options banks offer after a prepayment: keep the EMI
  and finish sooner, or keep the end date and lower the EMI.
- **Get out faster** — a plan across all loans: extra monthly payment, a one-time lump sum,
  highest-interest-first vs smallest-loan-first, and rolling a closed loan's EMI into the next.
- **Add to calendar** — downloads an `.ics` file with every remaining EMI date and a reminder
  the day before.
- **Private by default** — works without an account; data stays in the browser. An optional
  account syncs across devices, and whatever was entered locally moves in on sign-in. Users
  can export their data as JSON or permanently delete it (and their account) from Settings.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR) on Vite
- Tailwind CSS v4, Recharts, lucide icons, sonner toasts
- Firebase Auth (email/password) and Cloud Firestore for optional sync
- Builds for Cloudflare Workers via Nitro

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

| Command          | What it does                          |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Start the dev server                  |
| `npm run build`  | Production build (Cloudflare Workers) |
| `npm test`       | Run the loan-maths unit tests         |
| `npm run lint`   | ESLint + Prettier checks              |
| `npm run format` | Format the codebase with Prettier     |

## Project structure

```
src/
  lib/loans.ts            Loan maths: EMI, schedules, prepayment, multi-loan payoff (pure, tested)
  lib/loans.test.ts       Unit tests, checked against standard bank EMI figures
  lib/format.ts           ₹ and date formatting (Indian number grouping)
  lib/calendar.ts         .ics export for EMI due dates
  hooks/use-loans.ts      Storage: localStorage when signed out, Firestore when signed in
  routes/                 Pages: / · /loans/new · /loans/$id · /loans/$id/edit · /plan · /settings
  components/fintwin/     App UI: shell, loan form, charts
  integrations/firebase/  Firebase client setup
firestore.rules           Each user can read and write only their own data
```

## Data model

Signed-out users: `localStorage` keys `fintwin.loans.v1` and `fintwin.settings.v1`.

Signed-in users (Firestore):

- `users/{uid}/loans/{loanId}` — one document per loan (`principal`, `annualRate`,
  `tenureMonths`, `firstEmiDate`, optional `emi` and `balanceCheck`)
- `profiles/{uid}` — `take_home` (optional monthly take-home pay)

## How the numbers work

EMIs use the standard reducing-balance formula, the same one banks use. Loans added from
"EMI and EMIs left" are converted into an outstanding balance using the interest rate. Results
can differ from a bank statement by a few rupees because of rounding, broken-period interest
and floating-rate changes — the "match your bank" balance update re-bases the schedule on the
real figure. Nothing in the app is financial advice.
