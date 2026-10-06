import Link from "next/link";
import { HeartHandshake, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodDrop } from "@/components/brand/blood-drop";
import { BLOOD_TYPES_DISPLAY } from "@/lib/blood-types";

/**
 * Home page.
 *
 * The live stats strip, the "blood types needed now" row and the open-requests
 * feed arrive in M6, once the database exists — deliberately not stubbed with
 * invented numbers here.
 */

const STEPS = [
  {
    icon: Search,
    title: "Post what is needed",
    body: "Blood type, hospital, district and how urgent it is. Your phone number stays off the public page.",
  },
  {
    icon: HeartHandshake,
    title: "Reach the right donors",
    body: "Only donors whose blood type is compatible, and who are eligible to donate today, see your request.",
  },
  {
    icon: ShieldCheck,
    title: "Share contact privately",
    body: "A donor who offers to help unlocks your contact details. Nobody else ever sees them.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden">
        <div className="mx-auto w-full max-w-content px-4 pb-16 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-medium text-subtle shadow-soft">
                <span className="h-1.5 w-1.5 rounded-pill bg-primary" />
                Cambodia · Phnom Penh
              </span>

              <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-[44px] sm:leading-[1.08]">
                Every drop finds its match
              </h1>

              <p className="mt-4 max-w-xl text-base text-subtle">
                When a family needs blood, a Facebook post reaches everyone and
                helps almost no one. BloodLink KH sends the request only to
                donors who can actually give — and keeps phone numbers private.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:w-auto">
                  <Link href="/auth/sign-up">I need blood</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="sm:w-auto">
                  <Link href="/auth/sign-up">I want to donate</Link>
                </Button>
              </div>

              <p className="mt-5 text-xs text-faint">
                Free. No public phone numbers, ever.
              </p>
            </div>

            {/* Decorative drop illustration, hidden from assistive tech. */}
            <div className="relative hidden justify-center lg:flex" aria-hidden="true">
              <svg viewBox="0 0 320 384" className="h-[340px] w-auto" fill="none">
                <defs>
                  <linearGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
                  </linearGradient>
                </defs>
                <path
                  d="M160 16C160 16 32 160 32 240a128 128 0 0 0 256 0C288 160 160 16 160 16Z"
                  fill="url(#dropFill)"
                  stroke="hsl(var(--primary))"
                  strokeOpacity="0.22"
                  strokeWidth="2"
                />
                <circle cx="160" cy="240" r="86" fill="hsl(var(--surface))" opacity="0.65" />
              </svg>

              {/* Blood-type chips floating over the illustration. */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-3">
                  {BLOOD_TYPES_DISPLAY.map((t) => (
                    <BloodDrop key={t} type={t} size="md" variant="soft" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-content px-4 py-16">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            How it works
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="rounded-card border border-border bg-surface p-6 shadow-soft transition-shadow duration-150 ease-out hover:shadow-lift"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-button bg-primary-tint text-primary">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  <span className="mr-1.5 text-faint tabular-nums">{i + 1}.</span>
                  {title}
                </h3>
                <p className="mt-2 text-sm text-subtle">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
