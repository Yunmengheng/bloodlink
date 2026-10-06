/**
 * Display-order list of the eight blood types, for UI that renders a 4x2 grid.
 *
 * The authoritative BLOOD_TYPES constant and the compatibility rules live in
 * lib/blood.ts (M2); this file only exists so the home page can render the
 * drop chips before that logic lands.
 */
export const BLOOD_TYPES_DISPLAY = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;
