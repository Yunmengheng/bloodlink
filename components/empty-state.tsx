import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Friendly empty state: a small drop illustration, one sentence, one action. */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center">
      <svg
        viewBox="0 0 40 48"
        className="h-12 w-10 opacity-50"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 2C20 2 4 20 4 30a16 16 0 0 0 32 0C36 20 20 2 20 2Z"
          className="fill-primary-tint stroke-primary/30"
          strokeWidth={2}
        />
      </svg>

      <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-subtle">{body}</p> : null}

      {actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
