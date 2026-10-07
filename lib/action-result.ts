import type { Dictionary } from "@/lib/i18n";

/**
 * What every Server Action returns. Errors carry a dictionary KEY so the client
 * can render them in the active language, rather than a hard-coded English
 * string from the server.
 */
export type ActionResult =
  | { ok: true; message?: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      /**
       * What the user submitted. React resets a form after a Server Action, so
       * without echoing these back a rejected form loses everything they typed.
       */
      values?: Record<string, string>;
    };

export function failure(
  error: string,
  fieldErrors?: Record<string, string>,
  values?: Record<string, string>,
): ActionResult {
  return { ok: false, error, fieldErrors, values };
}

export function success(message?: string): ActionResult {
  return { ok: true, message };
}

/**
 * Resolves a dictionary key like "errors.unitsRange" to its translated string.
 * An unknown key falls back to the generic message rather than showing the key.
 */
export function translateKey(key: string, t: Dictionary): string {
  const [section, name] = key.split(".");
  const group = (t as unknown as Record<string, Record<string, string>>)[
    section
  ];
  return group?.[name] ?? t.common.somethingWentWrong;
}
