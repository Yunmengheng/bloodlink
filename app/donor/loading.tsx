import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />

      <div className="mt-6 flex flex-col items-center gap-5 rounded-card border border-border bg-surface p-6 shadow-soft sm:flex-row">
        <Skeleton className="h-28 w-28 shrink-0 rounded-pill" />
        <div className="w-full space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
