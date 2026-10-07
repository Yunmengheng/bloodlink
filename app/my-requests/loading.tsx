import { Skeleton, RequestListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <RequestListSkeleton count={2} />
      </div>
    </div>
  );
}
