import { Suspense } from "react";
import Link from "next/link";
import { HeartHandshake, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodDrop } from "@/components/brand/blood-drop";
import { RequestCard } from "@/components/request-card";
import { FeedFilters } from "@/components/feed-filters";
import { EmptyState } from "@/components/empty-state";
import { RequestListSkeleton } from "@/components/skeleton";
import {
  getNeededBloodTypes,
  getOpenRequests,
  getPublicStats,
} from "@/lib/queries";
import { isBloodType, BLOOD_TYPES } from "@/lib/blood";
import { isDistrict } from "@/lib/districts";
import { formatNumber } from "@/lib/format";
import { getI18n, type Dictionary, type Lang } from "@/lib/i18n";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; district?: string }>;
}) {
  const { lang, t } = await getI18n();
  const filters = await searchParams;

  const steps = [
    { Icon: Search, title: t.home.step1Title, body: t.home.step1Body },
    { Icon: HeartHandshake, title: t.home.step2Title, body: t.home.step2Body },
    { Icon: ShieldCheck, title: t.home.step3Title, body: t.home.step3Body },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden">
        <div className="mx-auto w-full max-w-content px-4 pb-14 pt-12 sm:pb-16 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-medium text-subtle shadow-soft">
                <span className="h-1.5 w-1.5 rounded-pill bg-primary" />
                {t.home.heroBadge}
              </span>

              <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-[44px] sm:leading-[1.08]">
                {t.common.tagline}
              </h1>

              <p className="mt-4 max-w-xl text-base text-subtle">
                {t.home.heroLead}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/requests/new">{t.home.iNeedBlood}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/donor">{t.home.iWantToDonate}</Link>
                </Button>
              </div>

              <p className="mt-5 text-xs text-subtle">
                {t.home.noPublicNumbers}
              </p>
            </div>

            <div className="relative hidden justify-center lg:flex" aria-hidden="true">
              <svg viewBox="0 0 320 384" className="h-[320px] w-auto" fill="none">
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
                <circle cx="160" cy="240" r="90" fill="hsl(var(--surface))" opacity="0.7" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-3">
                  {BLOOD_TYPES.map((bt) => (
                    <BloodDrop key={bt} type={bt} size="md" variant="soft" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats + needed now */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsStrip t={t} lang={lang} />
      </Suspense>

      {/* Feed */}
      <section className="mx-auto w-full max-w-content px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t.home.openRequests}
          </h2>
          <Suspense fallback={<div className="h-11" />}>
            <FeedFilters t={t} lang={lang} />
          </Suspense>
        </div>

        <div className="mt-6">
          <Suspense fallback={<RequestListSkeleton />}>
            <Feed filters={filters} t={t} lang={lang} />
          </Suspense>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto w-full max-w-content px-4 py-14">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t.home.howItWorks}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map(({ Icon, title, body }, i) => (
              <li
                key={title}
                className="rounded-card border border-border bg-surface p-6 shadow-soft transition-shadow duration-150 ease-out hover:shadow-lift"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-button bg-primary-tint text-primary">
                  <Icon strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  <span className="mr-1.5 text-subtle tabular-nums">{i + 1}.</span>
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

/* ------------------------------------------------------------------ */

async function StatsStrip({ t, lang }: { t: Dictionary; lang: Lang }) {
  const [stats, needed] = await Promise.all([
    getPublicStats(),
    getNeededBloodTypes(),
  ]);

  const items = [
    { label: t.home.statsOpen, value: stats.open_requests },
    { label: t.home.statsDonors, value: stats.registered_donors },
    { label: t.home.statsFulfilled, value: stats.fulfilled_requests },
  ];

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto w-full max-w-content px-4 py-8">
        <dl className="grid grid-cols-3 gap-4">
          {items.map(({ label, value }) => (
            <div key={label} className="text-center sm:text-left">
              <dd className="text-xl font-bold tabular-nums text-foreground">
                {formatNumber(value, lang)}
              </dd>
              <dt className="mt-0.5 text-xs text-subtle">{label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {t.home.neededNow}
          </h2>
          {needed.length === 0 ? (
            <p className="mt-2 text-sm text-subtle">{t.home.neededNowEmpty}</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {needed.map((n) => (
                <li key={n.blood_type}>
                  <Link
                    href={`/?type=${encodeURIComponent(n.blood_type)}`}
                    className="flex items-center gap-2 rounded-pill border border-border bg-background py-1.5 pl-1.5 pr-3 transition-colors duration-150 hover:border-primary/30 hover:bg-primary-tint"
                  >
                    <BloodDrop type={n.blood_type} size="sm" />
                    <span className="text-xs font-semibold tabular-nums text-subtle">
                      {formatNumber(n.request_count, lang)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto h-[196px] w-full max-w-content animate-pulse px-4 py-8" />
    </section>
  );
}

async function Feed({
  filters,
  t,
  lang,
}: {
  filters: { type?: string; district?: string };
  t: Dictionary;
  lang: Lang;
}) {
  const requests = await getOpenRequests({
    // Ignore junk in the query string rather than passing it to the database.
    bloodType: isBloodType(filters.type) ? filters.type : undefined,
    district: isDistrict(filters.district) ? filters.district : undefined,
  });

  if (requests.length === 0) {
    return (
      <EmptyState
        title={t.feed.emptyTitle}
        body={t.feed.emptyBody}
        actionLabel={t.myRequests.postRequest}
        actionHref="/requests/new"
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {requests.map((r) => (
        <li key={r.id}>
          <RequestCard request={r} t={t} lang={lang} />
        </li>
      ))}
    </ul>
  );
}
