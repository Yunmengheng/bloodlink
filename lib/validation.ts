import { z } from "zod";
import { BLOOD_TYPES } from "@/lib/blood";
import { DISTRICTS } from "@/lib/districts";

/**
 * Zod schemas for every mutation. Server Actions parse with these before
 * touching the database, so a tampered form is rejected with a friendly message
 * rather than a Postgres constraint error.
 *
 * Messages are dictionary KEYS (e.g. "errors.unitsRange"), not English text, so
 * the UI can show them in the user's language.
 */

const bloodType = z.enum(BLOOD_TYPES, { message: "errors.invalidBloodType" });

const district = z.enum(
  DISTRICTS.map((d) => d.value) as [string, ...string[]],
  { message: "errors.invalidDistrict" },
);

/** Optional text field: "" from an empty input becomes null. */
const optionalText = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? null : v));

const phone = optionalText.refine(
  (v) => v === null || /^[\d\s+\-()]{6,20}$/.test(v),
  { message: "errors.phoneInvalid" },
);

const telegram = optionalText
  // Accept what people actually paste — "@sokdara", "t.me/sokdara",
  // "https://t.me/sokdara/" — and store the bare username.
  .transform((v) => {
    if (v === null) return null;
    const cleaned = v
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^t\.me\//i, "")
      .replace(/^@/, "")
      .replace(/\/+$/, "")
      .trim();
    // "@" on its own is the same as leaving the field empty.
    return cleaned.length === 0 ? null : cleaned;
  })
  // Telegram's own rule: 5-32 characters, letters, digits and underscore.
  .refine((v) => v === null || /^[A-Za-z0-9_]{5,32}$/.test(v), {
    message: "errors.telegramInvalid",
  });

/** At least one contact channel must be present. */
const hasContact = <T extends { phone: string | null; telegram: string | null }>(
  data: T,
  ctx: z.RefinementCtx,
) => {
  if (!data.phone && !data.telegram) {
    ctx.addIssue({
      code: "custom",
      message: "errors.contactRequired",
      path: ["phone"],
    });
  }
};

const isoDate = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "errors.notFound",
  });

export const donorProfileSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "errors.nameRequired")
      .max(100, "errors.nameRequired"),
    blood_type: bloodType,
    district,
    phone,
    telegram,
    last_donation_date: isoDate.refine(
      (v) => v === null || new Date(`${v}T00:00:00Z`) <= new Date(),
      { message: "errors.dateInFuture" },
    ),
    is_available: z.boolean(),
  })
  .superRefine(hasContact);

export const newRequestSchema = z
  .object({
    patient_blood_type: bloodType,
    units_needed: z.coerce
      .number()
      .int("errors.unitsRange")
      .min(1, "errors.unitsRange")
      .max(10, "errors.unitsRange"),
    hospital: z
      .string()
      .trim()
      .min(1, "errors.hospitalRequired")
      .max(120, "errors.hospitalRequired"),
    district,
    urgency: z.enum(["critical", "urgent", "standard"]),
    needed_by: isoDate,
    note: optionalText.refine((v) => v === null || v.length <= 300, {
      message: "errors.noteTooLong",
    }),
    contact_name: z
      .string()
      .trim()
      .min(1, "errors.nameRequired")
      .max(100, "errors.nameRequired"),
    phone,
    telegram,
  })
  .superRefine(hasContact);

export const respondSchema = z.object({
  request_id: z.uuid("errors.notFound"),
  message: optionalText.refine((v) => v === null || v.length <= 200, {
    message: "errors.messageTooLong",
  }),
});

export type DonorProfileInput = z.infer<typeof donorProfileSchema>;
export type NewRequestInput = z.infer<typeof newRequestSchema>;
