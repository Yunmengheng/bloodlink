/**
 * Telegram username handling, shared by the forms (for live feedback) and by
 * the Zod schema (for the real check), so the two cannot disagree.
 */

/** Telegram's own rule: 5-32 characters, letters, digits and underscore. */
export const TELEGRAM_USERNAME_RE = /^[A-Za-z0-9_]{5,32}$/;

/**
 * Accepts what people paste — "@sokdara", "t.me/sokdara",
 * "https://t.me/sokdara/" — and returns the bare username, or null if the
 * field is effectively empty.
 */
export function normaliseTelegram(input: string | null): string | null {
  if (input === null) return null;

  const cleaned = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .trim();

  return cleaned.length === 0 ? null : cleaned;
}

/** True when the value is empty (allowed) or a valid username. */
export function isValidTelegram(input: string): boolean {
  const username = normaliseTelegram(input);
  return username === null || TELEGRAM_USERNAME_RE.test(username);
}
