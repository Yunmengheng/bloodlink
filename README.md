# BloodLink KH

**Every drop finds its match.** A bilingual (Khmer / English) web app that privately
matches urgent blood requests in Cambodia with compatible, eligible donors.

> **Disclaimer:** BloodLink KH only connects people. Hospitals perform screening and
> cross-matching before any transfusion.

Built for **WarriorHacks 2.0**.

---

## Problem

In Cambodia, hospitals rely heavily on family and friends to supply blood for a
patient. When a family cannot find donors themselves, they post on Facebook and
Telegram. That has three failure modes:

1. **Posts get buried.** A request competes with everything else in the feed, and
   the people who see it are whoever the algorithm happened to reach.
2. **It reaches the wrong people.** Most of an audience is the wrong blood type, or
   donated too recently to give again.
3. **It exposes private phone numbers.** A family in a medical emergency publishes a
   personal number to strangers, permanently.

## Solution

BloodLink KH turns a broadcast into a private match.

A requester posts what is needed. Every signed-in donor sees only the requests that
their blood type can actually serve and that they are currently eligible to answer.
When a donor offers to help, and only then, the two sides exchange contact details.

The privacy rule is enforced in the database, not just the interface: the public
requests table contains **no contact columns at all**.

## Features

- Public feed of open requests, critical first, filterable by blood type and district
- Donor profile with an eligibility countdown ring and an availability toggle
- **For you** — matching by red-cell compatibility and donation interval
- **I can help** — responding privately unlocks contact in both directions
- Requester view: responder names, blood types, messages, and Call / Telegram buttons
- Mark fulfilled or cancel; **My requests** with status and response counts
- Khmer / English toggle on every string, including errors and empty states
- Learn page with donation guidance and the compatibility table
- Mobile-first: bottom tab bar under 768px, 44px minimum tap targets, WCAG AA contrast

## Screenshots

_Add before submitting._

| Home | Request detail | For you | Donor profile |
| ---- | -------------- | ------- | ------------- |
| _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** — scaffolded from `create-next-app -e with-supabase`
- **Supabase** — Postgres, email/password Auth, Row Level Security
- **Tailwind CSS 3** with shadcn/ui primitives, restyled through design tokens
- **Zod** validation, **Server Actions** for every mutation (no API routes)
- **Vitest** — 103 unit tests
- Deployed on **Vercel**

## Architecture

```
app/
  actions/          Server Actions — the only way anything is written
  auth/             Sign in, sign up, reset, confirm
  requests/new      Post a request
  requests/[id]     Owner / donor / signed-out views of one request
  donor/            Donor profile and eligibility
  for-you/          Matched open requests
  my-requests/      Requests I posted
  learn/            Donation guidance and the compatibility table
lib/
  blood.ts          Compatibility + eligibility. Pure, fully tested
  queries.ts        Read helpers, all subject to RLS
  validation.ts     Zod schemas; error messages are dictionary keys
  i18n/             Typed en/km dictionaries with identical key sets
  database.types.ts Generated-shape types wired into both Supabase clients
supabase/
  migrations/       0001_init.sql — the whole schema
  tests/            23-check RLS suite against a throwaway Postgres
```

### Data model

| Table | Purpose | Readable by |
| ----- | ------- | ----------- |
| `donors` | Donor profile, blood type, contact, last donation | The donor only |
| `blood_requests` | The public request. **No contact columns** | Everyone |
| `request_contacts` | How to reach the requester | Owner + donors who responded |
| `responses` | A donor's offer, with a contact snapshot | That donor + the request owner |

`responses` carries a **snapshot** of the donor's details taken when they offered, so
editing a profile later cannot change what a family was already given.

## Privacy model

- Donor contact information is **never** public.
- Requester contact information is visible only to the requester and to donors who
  have responded to that specific request.
- Row Level Security is enabled on all four tables; with RLS on and no matching
  policy, Postgres denies by default, so a forgotten policy fails closed.
- Server Actions re-check everything independently — signed in, ownership,
  compatibility, eligibility, availability, request still open, no duplicate — because
  the UI is not a security boundary.

Full detail, policy by policy: **[docs/SECURITY.md](docs/SECURITY.md)**.

### Verifying it

The privacy claims are tested, not asserted. `supabase/tests/` runs 23 checks against
a throwaway local Postgres, each executing as `anon` or `authenticated` with a JWT
claim set — the same way PostgREST runs a real request. See
[supabase/tests/README.md](supabase/tests/README.md).

## Blood compatibility

Red cell compatibility. A row is the patient; the ticks are donors who can give.

| Patient ↓ / Donor → | O− | O+ | A− | A+ | B− | B+ | AB− | AB+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **O−**  | ✅ |    |    |    |    |    |    |    |
| **O+**  | ✅ | ✅ |    |    |    |    |    |    |
| **A−**  | ✅ |    | ✅ |    |    |    |    |    |
| **A+**  | ✅ | ✅ | ✅ | ✅ |    |    |    |    |
| **B−**  | ✅ |    |    |    | ✅ |    |    |    |
| **B+**  | ✅ | ✅ |    |    | ✅ | ✅ |    |    |
| **AB−** | ✅ |    | ✅ |    | ✅ |    | ✅ |    |
| **AB+** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

O− is the universal donor; AB+ is the universal recipient.

**Eligibility** uses `MIN_DAYS_BETWEEN_DONATIONS = 90`. This is a scheduling hint and
**must be confirmed against National Blood Transfusion Center guidance** — the blood
centre decides at screening.

## Local setup

```bash
npm install
cp .env.example .env.local     # fill in your Supabase values
```

Then create the schema: open the **Supabase SQL Editor**, paste the whole of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it.
It is safe to run more than once.

```bash
npm run dev
```

### Environment variables

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local`, Vercel | Public key, safe in the browser |
| `SUPABASE_SECRET_KEY` | `.env.local` **only** | Seed script only. Bypasses RLS. Never in app code, never on Vercel. |

`.env.local` is gitignored.

### Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route typegen + `tsc --noEmit` |
| `npm test` | Vitest (103 tests) |
| `npx tsx scripts/seed.ts` | Demo data |
| `node scripts/design-qa.mjs <outDir> <targets>` | Screenshot pages at emulated viewports and assert no horizontal overflow |

## Seeding demo data

Add `SUPABASE_SECRET_KEY` to `.env.local`, then:

```bash
npx tsx scripts/seed.ts
```

Creates three confirmed users, two donor profiles, eight open requests across Phnom
Penh hospitals with mixed urgency, two fulfilled requests, and one existing response.
Safe to re-run. It prints the demo logins when it finishes:

| Account | Email | Notes |
| ------- | ----- | ----- |
| Requester | `requester@bloodlink.demo` | Posted all the requests |
| Donor O− | `donor.o@bloodlink.demo` | Eligible, matches everything |
| Donor A+ | `donor.a@bloodlink.demo` | Not eligible yet — shows the countdown ring |

Password for all three: `BloodLink2026!`

## Deploying to Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Add **only** these two environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Do **not** add `SUPABASE_SECRET_KEY`. Nothing in the deployed app uses it.
3. Deploy, then copy the production URL.
4. In Supabase, go to **Authentication → URL Configuration** and:
   - set **Site URL** to your Vercel URL,
   - add `https://<your-app>.vercel.app/**` to **Redirect URLs**.

   Without this, confirmation and password-reset emails point back at `localhost`.
5. Confirm the schema has been applied to the same project.

## Future work

- Per-user daily response cap, so contacts cannot be harvested at scale
- Telegram bot notifications when a matching request appears
- Hospital verification badges
- Donation history and reminders when a donor becomes eligible again
- Provinces beyond Phnom Penh
- Confirm `MIN_DAYS_BETWEEN_DONATIONS` with the NBTC, including by donor sex

## License

MIT — see [LICENSE](LICENSE).
