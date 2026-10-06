"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { donorProfileSchema } from "@/lib/validation";
import { failure, success, type ActionResult } from "@/lib/action-result";

/** Turns Zod issues into { fieldName: "errors.key" }. */
function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Create or update the signed-in user's donor profile. */
export async function saveDonorProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return failure("errors.notSignedIn");

  const parsed = donorProfileSchema.safeParse({
    full_name: formData.get("full_name") ?? "",
    blood_type: formData.get("blood_type") ?? "",
    district: formData.get("district") ?? "",
    phone: formData.get("phone") ?? "",
    telegram: formData.get("telegram") ?? "",
    last_donation_date: formData.get("last_donation_date") ?? "",
    is_available: formData.get("is_available") === "on",
  });

  if (!parsed.success) {
    const fields = fieldErrors(parsed.error.issues);
    return failure(Object.values(fields)[0] ?? "errors.notFound", fields);
  }

  const d = parsed.data;
  // upsert so the same action handles both "create" and "edit".
  const { error } = await supabase.from("donors").upsert(
    {
      id: userId as string,
      full_name: d.full_name,
      blood_type: d.blood_type,
      district: d.district,
      phone: d.phone,
      telegram_username: d.telegram,
      last_donation_date: d.last_donation_date,
      is_available: d.is_available,
    },
    { onConflict: "id" },
  );

  if (error) return failure("common.somethingWentWrong");

  revalidatePath("/donor");
  revalidatePath("/for-you");
  return success("donor.saved");
}

/** Availability toggle on the donor page. */
export async function setAvailability(isAvailable: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return failure("errors.notSignedIn");

  // RLS also restricts this to the caller's own row; the filter keeps it explicit.
  const { error } = await supabase
    .from("donors")
    .update({ is_available: isAvailable })
    .eq("id", userId as string);

  if (error) return failure("common.somethingWentWrong");

  revalidatePath("/donor");
  revalidatePath("/for-you");
  return success();
}
