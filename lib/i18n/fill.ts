/**
 * Placeholder interpolation, kept in its own module with no server imports.
 *
 * lib/i18n/index.ts reads cookies via next/headers, so a Client Component that
 * imports a runtime value from there drags `next/headers` into the browser
 * bundle and the build fails. Client Components import `fill` from here;
 * importing `type Dictionary` from the index is fine, because type-only imports
 * are erased at compile time.
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
