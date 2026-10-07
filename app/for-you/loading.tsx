import { Skeleton, RequestListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <RequestListSkeleton count={4} />
      </div>
    </div>
  );
}
