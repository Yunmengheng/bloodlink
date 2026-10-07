"use client";

import { useState } from "react";
import { ChevronDown, Phone, Send, Clock3, MessageSquare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodDrop } from "@/components/brand/blood-drop";
import { formatDateTime, relativeTime, telHref, telegramHref } from "@/lib/format";
import { fill } from "@/lib/i18n/fill";
import type { Dictionary, Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { BloodTypeEnum, DonorResponse } from "@/lib/database.types";

/**
 * A donor who offered to help, shown to the request owner.
 *
 * Everything here comes from the snapshot stored on the response row at the
 * moment the donor offered. The requester deliberately cannot read the donors
 * table, so there is no district, donation history or availability to show —
 * that data stays private to the donor. See docs/SECURITY.md.
 */
export function ResponderCard({
  response,
  patientBloodType,
  t,
  lang,
}: {
  response: DonorResponse;
  patientBloodType: BloodTypeEnum;
  t: Dictionary;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);

  const initials = response.donor_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <li className="overflow-hidden rounded-button border border-border bg-background">
      <div className="flex flex-wrap items-center gap-3 p-4">
        {/* Toggle. The Call/Telegram links sit outside it, because interactive
            elements cannot legally nest inside a button. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-button text-left"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-primary-tint text-sm font-bold text-primary-hover"
            aria-hidden="true"
          >
            {initials}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {response.donor_name}
            </span>
            <span className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
              <span className="font-semibold text-primary">
                {response.donor_blood_type}
              </span>
              <span aria-hidden="true">·</span>
              <span>{relativeTime(response.created_at, lang)}</span>
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-subtle">
            <span className="hidden sm:inline">
              {open ? t.request.hideDetails : t.request.showDetails}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-150 ease-out",
                open && "rotate-180",
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
        </button>

        <div className="flex gap-2">
          {response.donor_phone ? (
            <Button asChild size="sm">
              <a href={telHref(response.donor_phone)}>
                <Phone strokeWidth={1.75} />
                {t.request.call}
              </a>
            </Button>
          ) : null}
          {response.donor_telegram ? (
            <Button
              asChild
              size="sm"
              // Telegram brand blue, used only for this button.
              className="bg-[#229ED9] text-white hover:bg-[#1c88ba]"
            >
              <a
                href={telegramHref(response.donor_telegram)}
                target="_blank"
                rel="noreferrer"
              >
                <Send strokeWidth={1.75} />
                {t.request.telegram}
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface p-4">
          <div className="flex items-start gap-4">
            <BloodDrop type={response.donor_blood_type} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {response.donor_blood_type}
              </p>
              <p className="mt-0.5 text-xs font-medium text-success-ink">
                {fill(t.request.canDonateTo, { recipient: patientBloodType })}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2.5 text-sm">
            {response.donor_phone ? (
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={1.75} />
                <div className="min-w-0">
                  <dt className="text-xs text-subtle">{t.donor.phone}</dt>
                  <dd className="break-all font-medium text-foreground">
                    <a href={telHref(response.donor_phone)} className="hover:underline">
                      {response.donor_phone}
                    </a>
                  </dd>
                </div>
              </div>
            ) : null}

            {response.donor_telegram ? (
              <div className="flex items-start gap-2.5">
                <Send className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={1.75} />
                <div className="min-w-0">
                  <dt className="text-xs text-subtle">{t.donor.telegram}</dt>
                  <dd className="break-all font-medium text-foreground">
                    <a
                      href={telegramHref(response.donor_telegram)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      @{response.donor_telegram}
                    </a>
                  </dd>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={1.75} />
              <div className="min-w-0">
                <dt className="text-xs text-subtle">{t.request.offered}</dt>
                <dd className="font-medium text-foreground">
                  {formatDateTime(response.created_at, lang)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={1.75} />
              <div className="min-w-0">
                <dt className="text-xs text-subtle">{t.help.messageLabel}</dt>
                <dd
                  className={cn(
                    "font-medium",
                    response.message ? "text-foreground" : "text-subtle",
                  )}
                >
                  {response.message || t.request.noMessage}
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-button bg-standard-tint px-3 py-2.5 text-xs text-subtle">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {t.request.contactPrivate}
          </p>
        </div>
      ) : null}
    </li>
  );
}
