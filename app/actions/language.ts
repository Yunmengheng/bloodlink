"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANG_COOKIE, isLang, type Lang } from "@/lib/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Stores the chosen language in a cookie and re-renders the current page. */
export async function setLanguage(lang: Lang) {
  if (!isLang(lang)) return;

  const store = await cookies();
  store.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: false, // contains no personal data
  });

  revalidatePath("/", "layout");
}
