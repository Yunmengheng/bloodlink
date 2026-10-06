import Link from "next/link";
import { MapPin, Clock3 } from "lucide-react";
import { BloodDrop } from "@/components/brand/blood-drop";
import { UrgencyPill } from "@/components/urgency-pill";
import { districtLabel } from "@/lib/districts";
import { fill, type Dictionary, type Lang } from "@/lib/i18n";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest } from "@/lib/database.types";

const EDGE: Record<string, string> = {
  critical: "bg-critical",
  urgent: "bg-urgent",
  standard: "bg-standard/40",
};

/**
 * Feed card. The whole card is one link, with a hover lift on desktop and a
 * full-width action button on mobile.
 */
export function RequestCard({
  request,
  t,
  lang,
  actionLabel,
}: {
  request: BloodRequest;
  t: Dictionary;
  lang: Lang;
  actionLabel?: string;
}) {
  const responded = Math.min(request.responses_count, request.units_needed);
  const pct = Math.round((responded / request.units_needed) * 100);

  return (
    <Link
      href={`/requests/${request.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-card border border-border bg-surface p-4 pl-5 shadow-soft",
        "transition-all duration-150 ease-out hover:border-primary/25 hover:shadow-lift sm:hover:-translate-y-0.5",
      )}
    >
      {/* Urgency colour bar on the left edge. */}
      <span
        className={cn("absolute inset-y-0 left-0 w-1", EDGE[request.urgency])}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <BloodDrop type={request.patient_blood_type} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {request.hospital}
            </h3>
            <UrgencyPill urgency={request.urgency} t={t} />
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {districtLabel(request.district, lang)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
              {relativeTime(request.created_at, lang)}
            </span>
          </p>

          {/* Units-needed progress. */}
          <div className="mt-3">
            <div
              className="h-1.5 w-full overflow-hidden rounded-pill bg-standard-tint"
              role="progressbar"
              aria-valuenow={responded}
              aria-valuemin={0}
              aria-valuemax={request.units_needed}
              aria-label={fill(t.request.unitsProgress, {
                responded,
                needed: request.units_needed,
              })}
            >
              <span
                className="block h-full rounded-pill bg-success transition-[width] duration-200 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-subtle">
              {fill(t.request.unitsProgress, {
                responded,
                needed: request.units_needed,
              })}
            </p>
          </div>
        </div>
      </div>

      <span className="mt-4 flex h-11 w-full items-center justify-center rounded-button bg-primary-tint text-sm font-semibold text-primary-hover sm:hidden">
        {actionLabel ?? t.common.viewDetails}
      </span>
    </Link>
  );
}
