import { AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";
import type { UrgencyEnum } from "@/lib/database.types";

/**
 * Urgency is never communicated by colour alone — each level has its own icon
 * and text label, so it still reads for colour-blind users and in grayscale.
 */
const STYLES: Record<
  UrgencyEnum,
  { wrap: string; dot: string; Icon: typeof AlertTriangle }
> = {
  critical: {
    wrap: "bg-critical-tint text-critical-ink border-critical/20",
    dot: "bg-critical",
    Icon: AlertTriangle,
  },
  urgent: {
    wrap: "bg-urgent-tint text-urgent-ink border-urgent/20",
    dot: "bg-urgent",
    Icon: Clock,
  },
  standard: {
    wrap: "bg-standard-tint text-standard border-border",
    dot: "bg-standard",
    Icon: CalendarDays,
  },
};

export function urgencyLabel(urgency: UrgencyEnum, t: Dictionary): string {
  return urgency === "critical"
    ? t.request.urgencyCritical
    : urgency === "urgent"
      ? t.request.urgencyUrgent
      : t.request.urgencyStandard;
}

export function UrgencyPill({
  urgency,
  t,
  className,
}: {
  urgency: UrgencyEnum;
  t: Dictionary;
  className?: string;
}) {
  const { wrap, dot, Icon } = STYLES[urgency];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold",
        wrap,
        className,
      )}
    >
      {urgency === "critical" ? (
        // The pulse is suppressed by the global prefers-reduced-motion rule.
        <span className={cn("h-1.5 w-1.5 rounded-pill animate-pulse-dot", dot)} />
      ) : (
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      )}
      {urgencyLabel(urgency, t)}
    </span>
  );
}
