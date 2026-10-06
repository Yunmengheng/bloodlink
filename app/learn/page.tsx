import { ExternalLink, HeartPulse, Users, CalendarClock, ShieldCheck } from "lucide-react";
import { BloodDrop } from "@/components/brand/blood-drop";
import { MIN_DAYS_BETWEEN_DONATIONS, BLOOD_TYPES, compatibleDonors } from "@/lib/blood";
import { fill, getI18n } from "@/lib/i18n";

export const metadata = { title: "Learn" };

// The NBTC is the national authority for blood in Cambodia.
const NBTC_URL = "https://www.nbtc.gov.kh/";

export default async function LearnPage() {
  const { t } = await getI18n();

  const sections = [
    { Icon: HeartPulse, title: t.learn.whyTitle, body: t.learn.whyBody },
    { Icon: Users, title: t.learn.whoTitle, body: t.learn.whoBody },
    {
      Icon: CalendarClock,
      title: t.learn.intervalTitle,
      body: fill(t.learn.intervalBody, { days: MIN_DAYS_BETWEEN_DONATIONS }),
    },
    { Icon: ShieldCheck, title: t.learn.privacyTitle, body: t.learn.privacyBody },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t.learn.title}
      </h1>

      <div className="mt-6 space-y-4">
        {sections.map(({ Icon, title, body }) => (
          <section
            key={title}
            className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6"
          >
            <h2 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-primary-tint text-primary">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              {title}
            </h2>
            <p className="mt-3 text-sm text-subtle">{body}</p>
          </section>
        ))}
      </div>

      {/* Who can give to whom */}
      <section className="mt-4 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <h2 className="text-base font-semibold text-foreground">
          {t.feed.filterBloodType}
        </h2>
        <ul className="mt-4 space-y-2">
          {BLOOD_TYPES.map((recipient) => (
            <li
              key={recipient}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-button border border-border bg-background p-3"
            >
              <BloodDrop type={recipient} size="sm" />
              <span className="text-xs text-subtle">←</span>
              <span className="flex flex-wrap gap-1.5">
                {compatibleDonors(recipient).map((donor) => (
                  <span
                    key={donor}
                    className="rounded-pill bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-hover"
                  >
                    {donor}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* National Blood Transfusion Center */}
      <section className="mt-4 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <h2 className="text-base font-semibold text-foreground">
          {t.learn.centerTitle}
        </h2>
        <p className="mt-2 text-sm text-subtle">{t.learn.centerBody}</p>
        <a
          href={NBTC_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-button bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-150 hover:bg-primary-hover"
        >
          {t.learn.centerLink}
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </a>
      </section>

      {/* Disclaimer, stated plainly rather than buried in the footer. */}
      <section className="mt-4 rounded-card border border-urgent/20 bg-urgent-tint p-5 sm:p-6">
        <h2 className="text-base font-semibold text-urgent-ink">
          {t.learn.safetyTitle}
        </h2>
        <p className="mt-2 text-sm text-urgent-ink">{t.common.disclaimer}</p>
      </section>
    </div>
  );
}
