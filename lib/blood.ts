/**
 * Blood donation domain logic.
 *
 * Pure functions only — no database, no React, no I/O. Everything here is
 * unit-tested in blood.test.ts and re-checked on the server before any response
 * is written, so a tampered client cannot bypass it.
 */

export const BLOOD_TYPES = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

/**
 * Red cell compatibility, keyed by recipient: who may donate TO this patient.
 *
 * This is red-cell (packed cells) compatibility, which is what whole-blood
 * donation drives use. Plasma compatibility runs the other way and is out of
 * scope — hospitals cross-match before any transfusion regardless.
 */
const DONORS_BY_RECIPIENT: Record<BloodType, readonly BloodType[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

/** Can `donorType` give red cells to `recipientType`? */
export function canDonate(
  donorType: BloodType,
  recipientType: BloodType,
): boolean {
  return DONORS_BY_RECIPIENT[recipientType].includes(donorType);
}

/** Every patient type this donor can help. */
export function compatibleRecipients(
  donorType: BloodType,
): readonly BloodType[] {
  return BLOOD_TYPES.filter((recipient) => canDonate(donorType, recipient));
}

/** Every donor type that can help this patient. */
export function compatibleDonors(
  recipientType: BloodType,
): readonly BloodType[] {
  return DONORS_BY_RECIPIENT[recipientType];
}

/** Narrowing guard for untrusted input (form values, query strings, DB rows). */
export function isBloodType(value: unknown): value is BloodType {
  return (
    typeof value === "string" && (BLOOD_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Minimum gap between whole-blood donations, in days.
 *
 * TODO: verify against Cambodia's National Blood Transfusion Center (NBTC)
 * guidelines before relying on this clinically. 90 days (about 3 months) is a
 * common interval for whole blood, but the NBTC may differ, and intervals
 * commonly differ by donor sex. BloodLink KH only suggests who *might* be
 * eligible; the blood centre makes the final decision at screening.
 */
export const MIN_DAYS_BETWEEN_DONATIONS = 90;

/** Midnight UTC for a date, so comparisons ignore clock time and time zones. */
function startOfUtcDay(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

const MS_PER_DAY = 86_400_000;

/** Whole days from `from` to `to`. Negative when `to` is earlier. */
function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfUtcDay(to) - startOfUtcDay(from)) / MS_PER_DAY);
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
}

/**
 * Is a donor eligible to give today?
 *
 * - Never donated (null) -> eligible.
 * - Last donation in the future -> NOT eligible. The data is wrong, and the
 *   safe failure mode is to hold the donor back rather than send them to a
 *   hospital.
 * - Otherwise, eligible once MIN_DAYS_BETWEEN_DONATIONS whole days have passed.
 */
export function isEligible(
  lastDonationDate: Date | string | null | undefined,
  today: Date | string = new Date(),
): boolean {
  if (lastDonationDate === null || lastDonationDate === undefined) return true;

  const last = toDate(lastDonationDate);
  const now = toDate(today);
  if (Number.isNaN(last.getTime())) return true; // unparseable -> treat as unknown

  const elapsed = daysBetween(last, now);
  if (elapsed < 0) return false; // donation dated in the future
  return elapsed >= MIN_DAYS_BETWEEN_DONATIONS;
}

/**
 * The first day a donor may give again, or null if they have never donated
 * (and so may give today).
 */
export function nextEligibleDate(
  lastDonationDate: Date | string | null | undefined,
): Date | null {
  if (lastDonationDate === null || lastDonationDate === undefined) return null;

  const last = toDate(lastDonationDate);
  if (Number.isNaN(last.getTime())) return null;

  return new Date(
    startOfUtcDay(last) + MIN_DAYS_BETWEEN_DONATIONS * MS_PER_DAY,
  );
}

/** Whole days until the donor is eligible again; 0 when they already are. */
export function daysUntilEligible(
  lastDonationDate: Date | string | null | undefined,
  today: Date | string = new Date(),
): number {
  const next = nextEligibleDate(lastDonationDate);
  if (next === null) return 0;
  return Math.max(0, daysBetween(toDate(today), next));
}
