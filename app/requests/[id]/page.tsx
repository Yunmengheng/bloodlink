import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Send, MapPin, Droplets, CalendarClock, Hospital } from "lucide-react";
import { BloodDrop } from "@/components/brand/blood-drop";
import { UrgencyPill } from "@/components/urgency-pill";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/toast";
import { HelpButton, WithdrawButton } from "./help-button";
import { OwnerActions } from "./owner-actions";
import {
  getCurrentUserId,
  getDonorProfile,
  getRequest,
  getRequestContact,
  getResponses,
} from "@/lib/queries";
import { canDonate, isEligible, nextEligibleDate } from "@/lib/blood";
import { formatDate, relativeTime, telHref, telegramHref } from "@/lib/format";
import { districtLabel } from "@/lib/districts";
import { fill, getI18n, type Dictionary, type Lang } from "@/lib/i18n";
import type {
  BloodRequest,
  Donor,
  DonorResponse,
  RequestContact,
} from "@/lib/database.types";

export const metadata = { title: "Blood request" };

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string }>;
}) {
  const { id } = await params;
  const { posted } = await searchParams;
  const { lang, t } = await getI18n();

  // Each Supabase round trip costs ~250ms, so these run in waves rather than
  // one after another. Sequentially this page took five round trips; now two.
  const [request, userId] = await Promise.all([
    getRequest(id),
    getCurrentUserId(),
  ]);
  if (!request) notFound();

  const isOwner = userId === request.requester_id;

  const [responses, donor, contact] = userId
    ? await Promise.all([
        // RLS-gated: returns rows only for the owner or the donor themself.
        getResponses(id),
        isOwner ? Promise.resolve(null) : getDonorProfile(userId),
        // Also RLS-gated: returns null unless the viewer owns the request or
        // has responded to it. Fetched here so it is not a third wave; the
        // render below still checks before showing anything.
        getRequestContact(id),
      ])
    : [[], null, null];

  const myResponse = responses.find((r) => r.donor_id === userId);
  const canSeeContact = Boolean(userId && (isOwner || myResponse));

  const responded = Math.min(request.responses_count, request.units_needed);
  const pct = Math.round((responded / request.units_needed) * 100);

  const info = [
    { Icon: Hospital, label: t.request.hospital, value: request.hospital },
    { Icon: MapPin, label: t.request.district, value: districtLabel(request.district, lang) },
    { Icon: Droplets, label: t.request.unitsNeeded, value: String(request.units_needed) },
    {
      Icon: CalendarClock,
      label: t.request.neededBy,
      value: request.needed_by ? formatDate(request.needed_by, lang) : "—",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      {posted ? (
        <div className="mb-6">
          <Toast tone="success">{t.newRequest.posted}</Toast>
        </div>
      ) : null}

      {/* Header */}
      <div className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-4">
          <BloodDrop type={request.patient_blood_type} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyPill urgency={request.urgency} t={t} />
              {request.status !== "open" ? (
                <span className="rounded-pill border border-border bg-standard-tint px-2.5 py-1 text-xs font-semibold text-standard">
                  {request.status === "fulfilled"
                    ? t.request.statusFulfilled
                    : t.request.statusCancelled}
                </span>
              ) : null}
            </div>

            <h1 className="mt-2 text-lg font-bold tracking-tight text-foreground">
              {request.hospital}
            </h1>
            <p className="mt-1 text-sm text-subtle">
              {t.request.posted} {relativeTime(request.created_at, lang)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div
            className="h-2 w-full overflow-hidden rounded-pill bg-standard-tint"
            role="progressbar"
            aria-valuenow={responded}
            aria-valuemin={0}
            aria-valuemax={request.units_needed}
          >
            <span
              className="block h-full rounded-pill bg-success transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-subtle">
            {fill(t.request.unitsProgress, {
              responded,
              needed: request.units_needed,
            })}
          </p>
        </div>

        {/* Info grid */}
        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {info.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-2.5 rounded-button border border-border bg-background p-3"
            >
              <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-subtle" strokeWidth={1.75} />
              <div className="min-w-0">
                <dt className="text-xs font-medium text-subtle">{label}</dt>
                <dd className="truncate text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {request.note ? (
          <blockquote className="mt-5 border-l-2 border-primary/30 bg-primary-tint/50 py-2.5 pl-4 pr-3 text-sm text-foreground">
            {request.note}
          </blockquote>
        ) : null}
      </div>

      {/* Action area */}
      <div className="mt-6">
        {isOwner ? (
          <OwnerView
            requestId={id}
            isOpen={request.status === "open"}
            responses={responses}
            t={t}
            lang={lang}
          />
        ) : !userId ? (
          <SignedOutView t={t} />
        ) : (
          <DonorView
            request={request}
            donor={donor}
            myResponse={myResponse}
            contact={canSeeContact ? contact : null}
            t={t}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ContactLinks({
  name,
  phone,
  telegram,
  t,
}: {
  name: string;
  phone: string | null;
  telegram: string | null;
  t: Dictionary;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-primary-tint text-sm font-bold text-primary-hover"
        aria-hidden="true"
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {name}
      </span>

      <div className="flex gap-2">
        {phone ? (
          <Button asChild size="sm">
            <a href={telHref(phone)}>
              <Phone strokeWidth={1.75} />
              {t.request.call}
            </a>
          </Button>
        ) : null}
        {telegram ? (
          <Button
            asChild
            size="sm"
            // Telegram brand blue, used only here.
            className="bg-[#229ED9] text-white hover:bg-[#1c88ba]"
          >
            <a href={telegramHref(telegram)} target="_blank" rel="noreferrer">
              <Send strokeWidth={1.75} />
              {t.request.telegram}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function OwnerView({
  requestId,
  isOpen,
  responses,
  t,
  lang,
}: {
  requestId: string;
  isOpen: boolean;
  responses: DonorResponse[];
  t: Dictionary;
  lang: Lang;
}) {
  return (
    <div className="space-y-4">
      <Panel title={t.request.responders}>
        {responses.length === 0 ? (
          <div className="rounded-button border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              {t.request.noResponders}
            </p>
            <p className="mt-1 text-xs text-subtle">
              {t.request.noRespondersBody}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {responses.map((r) => (
              <li
                key={r.id}
                className="rounded-button border border-border bg-background p-4"
              >
                <ContactLinks
                  name={r.donor_name}
                  phone={r.donor_phone}
                  telegram={r.donor_telegram}
                  t={t}
                />
                <p className="mt-2 flex items-center gap-2 text-xs text-subtle">
                  <span className="font-semibold text-primary">
                    {r.donor_blood_type}
                  </span>
                  <span>·</span>
                  <span>{relativeTime(r.created_at, lang)}</span>
                </p>
                {r.message ? (
                  <p className="mt-2 text-sm text-foreground">{r.message}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {isOpen ? (
        <Panel title={t.request.status}>
          <OwnerActions requestId={requestId} t={t} />
        </Panel>
      ) : null}
    </div>
  );
}

function SignedOutView({ t }: { t: Dictionary }) {
  return (
    <Panel title={t.help.signInToHelp}>
      <p className="text-sm text-subtle">{t.help.signInToHelpBody}</p>
      <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
        <Link href="/auth/login">{t.common.signIn}</Link>
      </Button>
    </Panel>
  );
}

function DonorView({
  request,
  donor,
  myResponse,
  contact,
  t,
  lang,
}: {
  request: BloodRequest;
  donor: Donor | null;
  myResponse?: DonorResponse;
  contact: RequestContact | null;
  t: Dictionary;
  lang: Lang;
}) {
  // Already responded: show the contact that responding unlocked.
  if (myResponse) {
    return (
      <div className="space-y-4">
        <Panel title={t.request.requesterContact}>
          <p className="mb-4 text-sm text-subtle">{t.request.contactUnlocked}</p>
          {contact ? (
            <ContactLinks
              name={contact.contact_name}
              phone={contact.phone}
              telegram={contact.telegram_username}
              t={t}
            />
          ) : null}
        </Panel>

        <Panel title={t.help.alreadyResponded}>
          <WithdrawButton requestId={request.id} t={t} />
        </Panel>
      </div>
    );
  }

  if (request.status !== "open") {
    return (
      <Panel title={t.request.status}>
        <p className="text-sm text-subtle">{t.help.reasonClosed}</p>
      </Panel>
    );
  }

  if (!donor) {
    return (
      <Panel title={t.help.needProfile}>
        <p className="text-sm text-subtle">{t.help.needProfileBody}</p>
        <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
          <Link href="/donor">{t.donor.createProfile}</Link>
        </Button>
      </Panel>
    );
  }

  // Each blocked case gets its own explicit reason rather than a hidden button.
  if (!canDonate(donor.blood_type, request.patient_blood_type)) {
    return (
      <Panel title={t.help.iCanHelp}>
        <p className="text-sm text-subtle">
          {fill(t.help.reasonIncompatible, {
            donor: donor.blood_type,
            recipient: request.patient_blood_type,
          })}
        </p>
      </Panel>
    );
  }

  if (!isEligible(donor.last_donation_date)) {
    return (
      <Panel title={t.help.iCanHelp}>
        <p className="text-sm text-subtle">
          {fill(t.help.reasonNotEligible, {
            date: formatDate(nextEligibleDate(donor.last_donation_date), lang),
          })}
        </p>
      </Panel>
    );
  }

  if (!donor.is_available) {
    return (
      <Panel title={t.help.iCanHelp}>
        <p className="text-sm text-subtle">{t.help.reasonUnavailable}</p>
      </Panel>
    );
  }

  return (
    <Panel title={t.help.iCanHelp}>
      <HelpButton requestId={request.id} t={t} />
    </Panel>
  );
}
