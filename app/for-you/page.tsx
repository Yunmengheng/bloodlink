import { redirect } from "next/navigation";
import { RequestCard } from "@/components/request-card";
import { EmptyState } from "@/components/empty-state";
import { EligibilityRing } from "@/components/eligibility-ring";
import {
  getCurrentUserId,
  getDonorProfile,
  getMatchedRequests,
  getMyResponseRequestIds,
} from "@/lib/queries";
import {
  daysUntilEligible,
  isEligible,
  nextEligibleDate,
  type BloodType,
} from "@/lib/blood";
import { formatDate } from "@/lib/format";
import { fill, getI18n } from "@/lib/i18n";

export const metadata = { title: "For you" };

export default async function ForYouPage() {
  const { lang, t } = await getI18n();

  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/login");

  const donor = await getDonorProfile(userId);

  // No profile yet: we cannot match anything without a blood type.
  if (!donor) {
    return (
      <Shell title={t.forYou.title} subtitle={t.forYou.subtitle}>
        <EmptyState
          title={t.forYou.noProfileTitle}
          body={t.forYou.noProfileBody}
          actionLabel={t.donor.createProfile}
          actionHref="/donor"
        />
      </Shell>
    );
  }

  const eligible = isEligible(donor.last_donation_date);

  // Not eligible yet: show the countdown instead of requests they cannot answer.
  if (!eligible) {
    return (
      <Shell title={t.forYou.title} subtitle={t.forYou.subtitle}>
        <div className="flex flex-col items-center gap-5 rounded-card border border-border bg-surface p-8 text-center shadow-soft">
          <EligibilityRing
            daysRemaining={daysUntilEligible(donor.last_donation_date)}
            eligible={false}
          />
          <div>
            <p className="text-base font-semibold text-foreground">
              {t.forYou.notEligibleTitle}
            </p>
            <p className="mt-1.5 text-sm text-subtle">
              {fill(t.help.reasonNotEligible, {
                date: formatDate(nextEligibleDate(donor.last_donation_date), lang),
              })}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  const [requests, respondedIds] = await Promise.all([
    getMatchedRequests(donor.blood_type as BloodType),
    getMyResponseRequestIds(userId),
  ]);

  return (
    <Shell title={t.forYou.title} subtitle={t.forYou.subtitle}>
      {requests.length === 0 ? (
        <EmptyState title={t.forYou.emptyTitle} body={t.forYou.emptyBody} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {requests.map((r) => (
            <li key={r.id} className="min-w-0">
              <RequestCard
                request={r}
                t={t}
                lang={lang}
                actionLabel={
                  respondedIds.has(r.id)
                    ? t.help.alreadyResponded
                    : t.help.iCanHelp
                }
              />
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-subtle">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
