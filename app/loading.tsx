import { Skeleton, RequestListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-12">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-lg" />
      <div className="mt-8 flex gap-3">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <RequestListSkeleton count={4} />
      </div>
    </div>
  );
}
