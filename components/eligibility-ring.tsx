import { Check } from "lucide-react";
import { MIN_DAYS_BETWEEN_DONATIONS } from "@/lib/blood";
import { cn } from "@/lib/utils";

/**
 * Circular countdown to the next eligible date, or a green check when the donor
 * can give today. The number is always written out as text too — the ring alone
 * would not be readable to a screen reader.
 */
export function EligibilityRing({
  daysRemaining,
  eligible,
  className,
}: {
  daysRemaining: number;
  eligible: boolean;
  className?: string;
}) {
  const RADIUS = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Fraction of the interval already served.
  const progress = eligible
    ? 1
    : Math.max(
        0,
        Math.min(
          1,
          (MIN_DAYS_BETWEEN_DONATIONS - daysRemaining) /
            MIN_DAYS_BETWEEN_DONATIONS,
        ),
      );

  return (
    <div className={cn("relative h-28 w-28 shrink-0", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-standard-tint"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className={cn(
            "transition-[stroke-dashoffset] duration-500 ease-out",
            eligible ? "stroke-success" : "stroke-primary",
          )}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {eligible ? (
          <Check className="h-9 w-9 text-success" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {daysRemaining}
            </span>
            <span className="text-[11px] font-medium text-subtle">days</span>
          </>
        )}
      </div>
    </div>
  );
}
