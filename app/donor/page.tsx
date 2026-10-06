import { redirect } from "next/navigation";
import { EligibilityRing } from "@/components/eligibility-ring";
import { DonorForm } from "./donor-form";
import { getCurrentUserId, getDonorProfile } from "@/lib/queries";
import {
  MIN_DAYS_BETWEEN_DONATIONS,
  daysUntilEligible,
  isEligible,
  nextEligibleDate,
} from "@/lib/blood";
import { formatDate } from "@/lib/format";
import { fill, getI18n } from "@/lib/i18n";

export const metadata = { title: "Donor profile" };

export default async function DonorPage() {
  const { lang, t } = await getI18n();

  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/login");

  const donor = await getDonorProfile(userId);

  const eligible = isEligible(donor?.last_donation_date ?? null);
  const remaining = daysUntilEligible(donor?.last_donation_date ?? null);
  const next = nextEligibleDate(donor?.last_donation_date ?? null);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t.donor.title}
      </h1>
      <p className="mt-1.5 text-sm text-subtle">{t.donor.subtitle}</p>

      {/* Eligibility card — only meaningful once a profile exists. */}
      {donor ? (
        <section className="mt-6 flex flex-col items-center gap-5 rounded-card border border-border bg-surface p-6 shadow-soft sm:flex-row sm:items-center">
          <EligibilityRing daysRemaining={remaining} eligible={eligible} />

          <div className="min-w-0 text-center sm:text-left">
            <p className="text-base font-semibold text-foreground">
              {eligible
                ? t.donor.eligibleNow
                : fill(t.donor.notEligible, {
                    date: formatDate(next, lang),
                  })}
            </p>
            <p className="mt-1 text-sm text-subtle">
              {eligible
                ? t.donor.eligibleNowBody
                : fill(t.donor.daysRemaining, { days: remaining })}
            </p>
            <p className="mt-3 text-xs text-subtle">
              {fill(t.donor.eligibilityNote, {
                days: MIN_DAYS_BETWEEN_DONATIONS,
              })}
            </p>
          </div>
        </section>
      ) : null}

      <div className="mt-6">
        <DonorForm donor={donor} t={t} lang={lang} />
      </div>
    </div>
  );
}
