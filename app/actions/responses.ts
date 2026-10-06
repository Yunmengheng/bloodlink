"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { respondSchema } from "@/lib/validation";
import { canDonate, isEligible } from "@/lib/blood";
import { failure, success, type ActionResult } from "@/lib/action-result";

/**
 * "I can help".
 *
 * Every rule the UI uses to show or hide the button is re-checked here, because
 * the UI is not a security boundary. A client that posts this form directly
 * still cannot respond to an incompatible request, respond while ineligible, or
 * respond twice.
 */
export async function respondToRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub as string | undefined;
  if (!userId) return failure("errors.notSignedIn");

  const parsed = respondSchema.safeParse({
    request_id: formData.get("request_id") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "errors.notFound");
  }
  const { request_id, message } = parsed.data;

  // 1. The donor must have a profile (we need their blood type and contact).
  const { data: donor } = await supabase
    .from("donors")
    .select(
      "id, full_name, blood_type, phone, telegram_username, last_donation_date, is_available",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!donor) return failure("errors.noDonorProfile");

  // 2. The donor must currently be available.
  if (!donor.is_available) return failure("errors.unavailable");

  // 3. The donor must be eligible by the donation interval.
  if (!isEligible(donor.last_donation_date)) {
    return failure("errors.notEligibleYet");
  }

  // 4. The request must exist and still be open.
  const { data: request } = await supabase
    .from("blood_requests")
    .select("id, patient_blood_type, status, requester_id")
    .eq("id", request_id)
    .maybeSingle();

  if (!request) return failure("errors.notFound");
  if (request.status !== "open") return failure("errors.requestClosed");

  // 5. Blood types must actually be compatible.
  if (!canDonate(donor.blood_type, request.patient_blood_type)) {
    return failure("errors.incompatible");
  }

  // 6. No duplicate offers. The unique index is the real guarantee; this check
  //    exists to return a friendly message instead of a constraint violation.
  const { data: existing } = await supabase
    .from("responses")
    .select("id")
    .eq("request_id", request_id)
    .eq("donor_id", userId)
    .maybeSingle();

  if (existing) return failure("errors.alreadyResponded");

  // Contact details are snapshot here, so a later profile edit cannot change
  // what the family was already given.
  const { error } = await supabase.from("responses").insert({
    request_id,
    donor_id: userId,
    donor_name: donor.full_name,
    donor_phone: donor.phone,
    donor_telegram: donor.telegram_username,
    donor_blood_type: donor.blood_type,
    message,
  });

  if (error) {
    // Covers the race where two submissions arrive at once.
    if (error.code === "23505") return failure("errors.alreadyResponded");
    return failure("common.somethingWentWrong");
  }

  revalidatePath(`/requests/${request_id}`);
  revalidatePath("/for-you");
  return success("help.thanks");
}

/** Withdraw an offer. RLS allows only the donor who made it. */
export async function withdrawResponse(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub as string | undefined;
  if (!userId) return failure("errors.notSignedIn");

  const { error } = await supabase
    .from("responses")
    .delete()
    .eq("request_id", requestId)
    .eq("donor_id", userId);

  if (error) return failure("common.somethingWentWrong");

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/for-you");
  return success("help.withdrawn");
}
