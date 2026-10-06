# Development log

A running record of what was built in each milestone, what broke, and how it was fixed.

## M1 — Scaffold and cleanup

**Built**

- Scaffolded the app with `npx create-next-app@latest bloodlink-kh -e with-supabase`
  (Next.js 16.3.8, React 19.3, Tailwind CSS 3.4, `@supabase/ssr` 0.12).
- Removed all template demo content: `components/tutorial/`, `hero.tsx`,
  `deploy-button.tsx`, `next-logo.tsx`, `supabase-logo.tsx`, `theme-switcher.tsx`,
  the `app/protected/` demo route, and the Supabase-branded `opengraph-image.png` /
  `twitter-image.png`.
- Rewrote `app/layout.tsx` with BloodLink KH title template, description, keywords,
  Open Graph metadata and a mobile-first viewport. Kept the template's Geist font.
- Replaced `app/page.tsx` with a minimal placeholder home page that still exercises
  auth, so the scaffold is runnable before the real hero lands in M6.
- Kept the template's email/password auth pages and forms untouched except for
  redirect targets (restyling happens in M4).
- README skeleton with every section the brief requires, plus an MIT `LICENSE`.
- Vitest set up: `vitest.config.ts` (node environment, `lib/**/*.test.ts` and
  `tests/**/*.test.ts`), scripts `test`, `test:watch`, `typecheck`, and a small
  `lib/utils.test.ts` so the runner is proven working.
- `.env.example` documents `SUPABASE_SECRET_KEY` as seed-script-only.

**Problems hit and how they were fixed**

1. **Deleting `app/protected/` left dangling redirects.** `login-form.tsx`,
   `update-password-form.tsx` and `sign-up-form.tsx` all pointed post-auth users at
   `/protected`. Repointed them at `/`, which is a real page at every milestone.
2. **`npm install -D vitest` failed with `ERESOLVE`.** Vitest 5 requires
   `@types/node@^22 || >=24`, but the template pins `^20`. Bumped `@types/node` to
   `^24` to match the Node 24.16 runtime actually in use, rather than forcing the
   install with `--legacy-peer-deps`.
3. **Floating `latest` version ranges.** The template ships `next`, `@supabase/ssr`
   and `@supabase/supabase-js` as `"latest"`, so a Vercel build could resolve
   different versions than were tested locally. Pinned all three to the installed
   versions with caret ranges.
4. **Dead dark-mode code.** The design brief specifies a single light "warm clinical"
   palette with no dark variants, so `next-themes` and the `.dark` CSS block were
   removed instead of inventing an unspecified dark theme. Noted as reversible.

**Deviations from the template, for the record**

- `eslint-config-next` is pinned to `15.3.1` by the template while Next is `16.3.8`.
  Left as-is because lint passes; revisit if rules start misfiring.
- The template uses a root `proxy.ts` (not `middleware.ts`) delegating to
  `lib/supabase/proxy.ts`. All route-protection work will follow that pattern.
- `next.config.ts` sets `cacheComponents: true`, so any component reading cookies or
  the database must sit inside a `<Suspense>` boundary.

### M1 follow-up — hydration warnings

Running `npm run dev` surfaced React hydration mismatches on `<body>` and on several
`<div>`s. The mismatched attributes (`bis_skin_checked`, `bis_register`,
`__processed_<uuid>__`) appear nowhere in the source and zero times in the
server-rendered HTML, so they are injected by a browser extension after the server
HTML arrives, not produced by our code.

Restored `suppressHydrationWarning` on `<html>` and added it to `<body>`. The template
carried it on `<html>` for `next-themes`, and it was dropped together with that
dependency in M1. React applies the flag only to the element it is set on, not to
descendants, so the remaining `<div bis_skin_checked>` warnings can only be silenced by
disabling the extension — they do not affect users who do not have it installed.

## Design tokens pulled forward from M4

The M1 placeholder home page looked unfinished, so the token layer of M4 was brought
forward to make every existing screen look intentional. M4 still owns the rest.

**Built**

- `app/globals.css` now defines the full "warm clinical" palette as HSL triplets
  (Tailwind v3 wraps them in `hsl(var(--token))`, which is what makes opacity
  modifiers like `bg-primary/10` work). Source hex values are kept in comments.
- `tailwind.config.ts` maps every token to a utility: colours, the 13/15/17/20/28/36
  type scale, radii (`card` 16px, `button`/`input` 12px, `pill`), the two subtle
  shadows, `max-w-content` (1120px), and a reduced-motion-safe pulse keyframe.
- The shadcn primitives are restyled purely by remapping their CSS variables, so
  Button, Card, Input and Badge now follow the design system with no per-component
  hex values. Buttons are 44px tall (48px at `lg`), inputs 48px.
- `BloodDrop` (inline SVG drop with the blood type inside, sizes sm/md/lg, solid and
  soft variants) and the `Logo` wordmark.
- Sticky blurred `SiteHeader` and a `SiteFooter` carrying the disclaimer, both wired
  into the root layout so every page gets them, plus a "Skip to content" link.
- A real home hero: headline, subtext, two CTAs, the soft red radial wash, a large
  decorative drop illustration with the eight blood-type chips, and a "How it works"
  section.
- `scripts/design-qa.mjs`, a dependency-free Design QA harness (see below).

**Problems hit and how they were fixed**

1. **Three WCAG AA failures in the specified palette.** Measured contrast showed
   `#A8A29E` muted text at 2.41:1 on the page background, `#DC2626` on `#FEF2F2` at
   4.41:1, `#D97706` on `#FFFBEB` at 3.07:1, and `#059669` on `#ECFDF5` at 3.58:1 —
   all below the 4.5:1 the brief also requires. Fixed by taking each colour one step
   darker **for text only**, keeping the specified colours for fills (bars, dots,
   buttons): `--critical-ink #B91C1C` (5.91:1), `--urgent-ink #B45309` (4.84:1),
   `--success-ink #047857` (5.21:1), and `--text-muted #78716C` (4.59:1). The spec's
   `#A8A29E` is retained as `--text-decorative` for non-text use only.
2. **Headless screenshots falsely showed horizontal overflow.** `chrome --headless
   --screenshot --window-size=375,1200` produced clipped text, because Chrome clamps
   its minimum window width on macOS and crops the capture. Replaced with a CDP
   harness using `Emulation.setDeviceMetricsOverride`; it also asserts
   `scrollWidth === clientWidth`. At a true 375px, all pages measured zero overflow.
3. **Auth pages used `min-h-svh`.** Now that the layout adds a header and footer,
   that overflowed the viewport. Swapped for vertical padding.

**Design QA result** — home and the auth pages at 375px and 1280px: no horizontal
scrolling, no text overflow, consistent spacing and radii, token colours only.
Auth page *copy* is still the template's and is restyled in M4 as planned.
