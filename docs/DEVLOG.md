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
