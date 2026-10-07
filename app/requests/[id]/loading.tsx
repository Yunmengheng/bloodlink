import { Skeleton } from "@/components/skeleton";

/**
 * Shown immediately on navigation, while the page's data loads. Without this,
 * clicking through to a request leaves the previous screen frozen — which looks
 * like the app has hung, especially right after submitting the form.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <div className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-28 rounded-pill" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <Skeleton className="mt-6 h-2 w-full rounded-pill" />
        <Skeleton className="mt-2 h-4 w-48" />

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    </div>
  );
}
