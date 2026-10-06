import { cn } from "@/lib/utils";

/** Base shimmer block. Animation is suppressed under prefers-reduced-motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-button bg-standard-tint", className)}
    />
  );
}

/** Matches the shape of RequestCard so the page does not jump when data lands. */
export function RequestCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-surface p-4 pl-5 shadow-soft">
      <span className="absolute inset-y-0 left-0 w-1 bg-standard-tint" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-[34px] shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-1.5 w-full" />
        </div>
      </div>
      <Skeleton className="mt-4 h-11 w-full sm:hidden" />
    </div>
  );
}

export function RequestListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  );
}
