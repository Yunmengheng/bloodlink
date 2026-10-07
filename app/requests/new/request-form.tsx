"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormSection } from "@/components/field";
import { BloodTypePicker } from "@/components/blood-type-picker";
import { Toast } from "@/components/toast";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { createRequest } from "@/app/actions/requests";
import { translateKey, type ActionResult } from "@/lib/action-result";
import { DISTRICTS } from "@/lib/districts";
import { PHNOM_PENH_HOSPITALS } from "@/lib/hospitals";
import { cn } from "@/lib/utils";
import type { BloodType } from "@/lib/blood";
import type { Dictionary, Lang } from "@/lib/i18n";

const SELECT_CLASS =
  "h-12 w-full rounded-input border border-border bg-surface px-3.5 text-base text-foreground shadow-soft transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";

export function RequestForm({ t, lang }: { t: Dictionary; lang: Lang }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createRequest,
    null,
  );
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [urgency, setUrgency] = useState<"critical" | "urgent" | "standard">(
    "urgent",
  );

  useFocusFirstError(state);

  const fieldError = (name: string) =>
    state && !state.ok && state.fieldErrors?.[name]
      ? translateKey(state.fieldErrors[name], t)
      : undefined;

  const urgencyOptions = [
    {
      value: "critical" as const,
      label: t.request.urgencyCritical,
      hint: t.newRequest.urgencyCriticalHint,
      Icon: AlertTriangle,
      active: "border-critical bg-critical-tint text-critical-ink",
    },
    {
      value: "urgent" as const,
      label: t.request.urgencyUrgent,
      hint: t.newRequest.urgencyUrgentHint,
      Icon: Clock,
      active: "border-urgent bg-urgent-tint text-urgent-ink",
    },
    {
      value: "standard" as const,
      label: t.request.urgencyStandard,
      hint: t.newRequest.urgencyStandardHint,
      Icon: CalendarDays,
      active: "border-standard bg-standard-tint text-standard",
    },
  ];

  return (
    <form action={action} className="space-y-4">
      {state && !state.ok ? (
        <Toast tone="error">
          {translateKey(state.error, t)}
          {state.fieldErrors ? ` ${t.errors.checkFields}` : ""}
        </Toast>
      ) : null}

      <FormSection title={t.newRequest.sectionPatient}>
        <BloodTypePicker
          name="patient_blood_type"
          value={bloodType}
          onChange={setBloodType}
          legend={t.request.patientBloodType}
          error={fieldError("patient_blood_type")}
        />

        <Field
          id="units_needed"
          label={t.newRequest.units}
          error={fieldError("units_needed")}
        >
          <Input
            id="units_needed"
            name="units_needed"
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            defaultValue={1}
            required
          />
        </Field>

        {/* Urgency as a segmented control, never colour alone. */}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-foreground">
            {t.newRequest.urgency}
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {urgencyOptions.map(({ value, label, hint, Icon, active }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-button border p-3 transition-all duration-150 ease-out",
                  "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
                  urgency === value
                    ? active
                    : "border-border bg-surface text-subtle hover:border-faint",
                )}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={value}
                  checked={urgency === value}
                  onChange={() => setUrgency(value)}
                  className="sr-only"
                />
                <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-0.5 block text-xs opacity-80">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </FormSection>

      <FormSection title={t.newRequest.sectionWhere}>
        <Field id="hospital" label={t.request.hospital} error={fieldError("hospital")}>
          <Input
            id="hospital"
            name="hospital"
            required
            maxLength={120}
            list="hospital-suggestions"
            placeholder={PHNOM_PENH_HOSPITALS[0][lang]}
          />
          {/* Free text with suggestions, so hospitals outside the list still work. */}
          <datalist id="hospital-suggestions">
            {PHNOM_PENH_HOSPITALS.map((h) => (
              <option key={h.en} value={h[lang]} />
            ))}
          </datalist>
        </Field>

        <Field id="district" label={t.request.district} error={fieldError("district")}>
          <select id="district" name="district" required defaultValue="" className={SELECT_CLASS}>
            <option value="" disabled>
              —
            </option>
            {DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d[lang]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="needed_by"
          label={t.newRequest.neededBy}
          optional
          optionalLabel={t.common.optional}
          error={fieldError("needed_by")}
        >
          <Input
            id="needed_by"
            name="needed_by"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
          />
        </Field>

        <Field
          id="note"
          label={t.newRequest.note}
          optional
          optionalLabel={t.common.optional}
          error={fieldError("note")}
        >
          <textarea
            id="note"
            name="note"
            maxLength={300}
            rows={3}
            placeholder={t.newRequest.notePlaceholder}
            className="w-full rounded-input border border-border bg-surface px-3.5 py-3 text-base text-foreground shadow-soft transition-colors placeholder:text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
        </Field>
      </FormSection>

      <FormSection
        title={t.newRequest.sectionContact}
        description={t.newRequest.contactPrivacy}
      >
        <Field
          id="contact_name"
          label={t.request.contactName}
          error={fieldError("contact_name")}
        >
          <Input id="contact_name" name="contact_name" required maxLength={100} />
        </Field>

        <Field
          id="phone"
          label={t.donor.phone}
          error={fieldError("phone")}
          optional
          optionalLabel={t.common.optional}
        >
          <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="012 345 678" />
        </Field>

        <Field
          id="telegram"
          label={t.donor.telegram}
          hint={t.donor.telegramHint}
          error={fieldError("telegram")}
          optional
          optionalLabel={t.common.optional}
        >
          <Input id="telegram" name="telegram" placeholder="sokdara" />
        </Field>
      </FormSection>

      <div className="sticky bottom-20 z-10 md:static">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t.newRequest.submitting : t.newRequest.submit}
        </Button>
      </div>
    </form>
  );
}
