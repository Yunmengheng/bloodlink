import type { Lang } from "@/lib/i18n";

/**
 * Formatting helpers. Khmer uses the km-KH locale so dates and numbers render
 * in Khmer digits and month names where the runtime supports it.
 */

const LOCALE: Record<Lang, string> = { en: "en-GB", km: "km-KH" };

export function formatDate(
  value: string | Date | null | undefined,
  lang: Lang,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Full date and time, shown when a relative time is not precise enough. */
export function formatDateTime(
  value: string | Date | null | undefined,
  lang: Lang,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** "3 hours ago" style text, using Intl so both languages are handled. */
export function relativeTime(value: string | Date, lang: Lang): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(LOCALE[lang], { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  for (const [unit, secondsIn] of units) {
    if (Math.abs(seconds) >= secondsIn) {
      return rtf.format(Math.round(seconds / secondsIn), unit);
    }
  }
  return rtf.format(Math.round(seconds), "second");
}

/** Digits in the active locale, e.g. Khmer numerals when lang is km. */
export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang]).format(value);
}

/** Builds a tel: href, stripping spaces and dashes. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Builds a Telegram link from a username, with or without a leading @. */
export function telegramHref(username: string): string {
  return `https://t.me/${username.replace(/^@/, "")}`;
}
