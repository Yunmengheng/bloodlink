import { cookies } from "next/headers";
import { en, type Dictionary } from "./en";
import { km } from "./km";

export type Lang = "en" | "km";

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "en";

const DICTIONARIES: Record<Lang, Dictionary> = { en, km };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "km";
}

export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

/** Reads the language cookie in a Server Component. Defaults to English. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

/** Convenience for Server Components: the active language and its dictionary. */
export async function getI18n(): Promise<{ lang: Lang; t: Dictionary }> {
  const lang = await getLang();
  return { lang, t: getDictionary(lang) };
}

/**
 * Fills {placeholders} in a dictionary string.
 *
 *   fill(t.donor.notEligible, { date: "1 Jan" })
 *
 * Unknown placeholders are left untouched so a typo is visible rather than
 * silently producing an empty gap.
 */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type { Dictionary };
export { en, km };
