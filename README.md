# BloodLink KH

**Every drop finds its match.** A bilingual (Khmer / English) web app that privately
matches urgent blood requests in Cambodia with compatible, eligible donors.

> **Disclaimer:** BloodLink KH only connects people. Hospitals perform screening and
> cross-matching before any transfusion.

Built for **WarriorHacks 2.0**.

---

## Problem

In Cambodia, families who urgently need blood post requests on Facebook and Telegram.
Those posts get buried in feeds, reach people with the wrong blood type, and expose
private phone numbers to everyone who scrolls past.

## Solution

BloodLink KH turns that broadcast into a private match. A requester posts what is
needed; the app shows each signed-in donor only the requests their blood type is
compatible with and that they are currently eligible to answer. Contact details are
revealed to a donor only after they offer to help.

## Features

_Filled in as milestones land._

- [ ] Public feed of open blood requests, sorted by urgency
- [ ] Donor profile with eligibility tracking and availability toggle
- [ ] "For you" matching by red-cell compatibility and donation interval
- [ ] "I can help" responses with private contact exchange
- [ ] Requester view: responder contacts, mark fulfilled / cancelled
- [ ] Khmer / English language toggle
- [ ] Learn page with donation guidance

## Screenshots

_Placeholders — added in the polish milestone._

| Home | Request detail | For you | Donor profile |
| ---- | -------------- | ------- | ------------- |
| _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Supabase** — Postgres, email/password Auth, Row Level Security
- **Tailwind CSS 3** with shadcn/ui primitives
- **Zod** for validation, **Server Actions** for every mutation
- **Vitest** for unit tests
- Deployed on **Vercel**

Scaffolded from `create-next-app -e with-supabase`.

## Architecture and data model

_Documented in the database milestone. See [docs/SECURITY.md](docs/SECURITY.md)._

## Privacy model

_Documented in the database milestone._

- Donor contact information is never public.
- Requester contact information is visible only to the requester and to donors who
  have responded to that specific request.

## Blood compatibility table

_Added with the domain logic milestone._

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values
npm run dev
```

### Environment variables

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local`, Vercel | Public (anon) key, safe in the browser |
| `SUPABASE_SECRET_KEY` | `.env.local` only | Used **only** by the local seed script. Never referenced in app code, never committed, never added to Vercel. |

`.env.local` is gitignored. Never commit real keys.

### Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |

## Seeding demo data

_Added in the final milestone._

## Deploying to Vercel

_Added in the final milestone, including adding the Vercel URL under
Supabase → Authentication → URL Configuration._

## Future work

_TBD._

## License

MIT — see [LICENSE](LICENSE).
