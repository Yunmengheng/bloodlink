/**
 * Phnom Penh's 14 khans (districts), plus a catch-all for the provinces.
 *
 * TODO(khmer): I am not a native Khmer speaker — please check every km label
 * below. "7 Makara" in particular is sometimes written ៧មករា and sometimes
 * ប្រាំពីរមករា.
 */

export type DistrictValue = (typeof DISTRICTS)[number]["value"];

export const DISTRICTS = [
  { value: "chamkar_mon", en: "Chamkar Mon", km: "ចំការមន" },
  { value: "daun_penh", en: "Daun Penh", km: "ដូនពេញ" },
  { value: "prampi_makara", en: "7 Makara", km: "៧ មករា" },
  { value: "tuol_kouk", en: "Tuol Kouk", km: "ទួលគោក" },
  { value: "dangkao", en: "Dangkao", km: "ដង្កោ" },
  { value: "mean_chey", en: "Mean Chey", km: "មានជ័យ" },
  { value: "russey_keo", en: "Russey Keo", km: "ឫស្សីកែវ" },
  { value: "sen_sok", en: "Sen Sok", km: "សែនសុខ" },
  { value: "pou_senchey", en: "Pou Senchey", km: "ពោធិ៍សែនជ័យ" },
  { value: "chroy_changvar", en: "Chroy Changvar", km: "ជ្រោយចង្វារ" },
  { value: "prek_pnov", en: "Prek Pnov", km: "ព្រែកព្នៅ" },
  { value: "chbar_ampov", en: "Chbar Ampov", km: "ច្បារអំពៅ" },
  { value: "boeng_keng_kang", en: "Boeng Keng Kang", km: "បឹងកេងកង" },
  { value: "kamboul", en: "Kamboul", km: "កំបូល" },
  { value: "other_province", en: "Other province", km: "ខេត្តផ្សេងទៀត" },
] as const;

const BY_VALUE = new Map(DISTRICTS.map((d) => [d.value, d]));

export function isDistrict(value: unknown): value is DistrictValue {
  return typeof value === "string" && BY_VALUE.has(value as DistrictValue);
}

/** Label for a district in the active language, falling back to the raw value. */
export function districtLabel(value: string, lang: "en" | "km"): string {
  return BY_VALUE.get(value as DistrictValue)?.[lang] ?? value;
}
