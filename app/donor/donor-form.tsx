"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormSection } from "@/components/field";
import { BloodTypePicker } from "@/components/blood-type-picker";
import { Toast } from "@/components/toast";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { saveDonorProfile } from "@/app/actions/donor";
import { translateKey, type ActionResult } from "@/lib/action-result";
import { DISTRICTS } from "@/lib/districts";
import type { BloodType } from "@/lib/blood";
import type { Dictionary, Lang } from "@/lib/i18n";
import type { Donor } from "@/lib/database.types";

export function DonorForm({
  donor,
  t,
  lang,
}: {
  donor: Donor | null;
  t: Dictionary;
  lang: Lang;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveDonorProfile,
    null,
  );
  const [bloodType, setBloodType] = useState<BloodType | null>(
    (donor?.blood_type as BloodType) ?? null,
  );

  useFocusFirstError(state);

  const fieldError = (name: string) =>
    state && !state.ok && state.fieldErrors?.[name]
      ? translateKey(state.fieldErrors[name], t)
      : undefined;

  return (
    <form action={action} className="space-y-4">
      {state ? (
        <Toast tone={state.ok ? "success" : "error"}>
          {state.ok
            ? t.donor.saved
            : translateKey(state.error, t)}
        </Toast>
      ) : null}

      <FormSection title={t.donor.title} description={t.donor.subtitle}>
        <Field id="full_name" label={t.donor.fullName} error={fieldError("full_name")}>
          <Input
            id="full_name"
            name="full_name"
            required
            maxLength={100}
            defaultValue={donor?.full_name ?? ""}
            autoComplete="name"
          />
        </Field>

        <BloodTypePicker
          name="blood_type"
          value={bloodType}
          onChange={setBloodType}
          legend={t.donor.bloodType}
          error={fieldError("blood_type")}
        />

        <Field id="district" label={t.donor.district} error={fieldError("district")}>
          <select
            id="district"
            name="district"
            required
            defaultValue={donor?.district ?? ""}
            className="h-12 w-full rounded-input border border-border bg-surface px-3.5 text-base text-foreground shadow-soft transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
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
      </FormSection>

      <FormSection title={t.newRequest.sectionContact} description={t.donor.contactHint}>
        <Field
          id="phone"
          label={t.donor.phone}
          error={fieldError("phone")}
          optional
          optionalLabel={t.common.optional}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={donor?.phone ?? ""}
            autoComplete="tel"
            placeholder="012 345 678"
          />
        </Field>

        <Field
          id="telegram"
          label={t.donor.telegram}
          hint={t.donor.telegramHint}
          error={fieldError("telegram")}
          optional
          optionalLabel={t.common.optional}
        >
          <Input
            id="telegram"
            name="telegram"
            defaultValue={donor?.telegram_username ?? ""}
            // Browsers autofill an email address into a bare text field named
            // like this, which can never be a valid Telegram username.
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="sokdara"
          />
        </Field>
      </FormSection>

      <FormSection title={t.donor.lastDonation}>
        <Field
          id="last_donation_date"
          label={t.donor.lastDonation}
          hint={t.donor.lastDonationHint}
          error={fieldError("last_donation_date")}
          optional
          optionalLabel={t.common.optional}
        >
          <Input
            id="last_donation_date"
            name="last_donation_date"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            defaultValue={donor?.last_donation_date ?? ""}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-button border border-border bg-background p-4">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={donor?.is_available ?? true}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
          />
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {t.donor.available}
            </span>
            <span className="mt-0.5 block text-xs text-subtle">
              {t.donor.availableHint}
            </span>
          </span>
        </label>
      </FormSection>

      {/* Sticky on mobile so the action is always reachable in a long form. */}
      <div className="sticky bottom-20 z-10 md:static">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending
            ? t.common.saving
            : donor
              ? t.donor.saveProfile
              : t.donor.createProfile}
        </Button>
      </div>
    </form>
  );
}
