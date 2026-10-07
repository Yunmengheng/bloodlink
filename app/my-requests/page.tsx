import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RequestCard } from "@/components/request-card";
import { EmptyState } from "@/components/empty-state";
import { getCurrentUserId, getMyRequests } from "@/lib/queries";
import { fill, getI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata = { title: "My requests" };

export default async function MyRequestsPage() {
  const { lang, t } = await getI18n();

  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/login");

  const requests = await getMyRequests(userId);

  const statusLabel = {
    open: t.request.statusOpen,
    fulfilled: t.request.statusFulfilled,
    cancelled: t.request.statusCancelled,
  } as const;

  const statusStyle = {
    open: "bg-primary-tint text-critical-ink border-critical/20",
    fulfilled: "bg-success-tint text-success-ink border-success/20",
    cancelled: "bg-standard-tint text-standard border-border",
  } as const;

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t.myRequests.title}
          </h1>
          <p className="mt-1.5 text-sm text-subtle">{t.myRequests.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/requests/new">{t.myRequests.postRequest}</Link>
        </Button>
      </div>

      <div className="mt-6">
        {requests.length === 0 ? (
          <EmptyState
            title={t.myRequests.emptyTitle}
            body={t.myRequests.emptyBody}
            actionLabel={t.myRequests.postRequest}
            actionHref="/requests/new"
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {requests.map((r) => (
              <li key={r.id} className="relative min-w-0">
                {/* Status and response count sit above the card link. */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-pill border px-2.5 py-1 text-xs font-semibold",
                      statusStyle[r.status],
                    )}
                  >
                    {statusLabel[r.status]}
                  </span>
                  <span className="text-xs text-subtle">
                    {fill(t.myRequests.responseCount, {
                      count: r.responses_count,
                    })}
                  </span>
                </div>
                <RequestCard request={r} t={t} lang={lang} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
