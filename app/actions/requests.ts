"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { newRequestSchema } from "@/lib/validation";
import { failure, type ActionResult } from "@/lib/action-result";

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Post a new blood request, plus its private contact row. */
export async function createRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return failure("errors.notSignedIn");

  const parsed = newRequestSchema.safeParse({
    patient_blood_type: formData.get("patient_blood_type") ?? "",
    units_needed: formData.get("units_needed") ?? "",
    hospital: formData.get("hospital") ?? "",
    district: formData.get("district") ?? "",
    urgency: formData.get("urgency") ?? "standard",
    needed_by: formData.get("needed_by") ?? "",
    note: formData.get("note") ?? "",
    contact_name: formData.get("contact_name") ?? "",
    phone: formData.get("phone") ?? "",
    telegram: formData.get("telegram") ?? "",
  });

  if (!parsed.success) {
    const fields = fieldErrors(parsed.error.issues);
    return failure(Object.values(fields)[0] ?? "errors.notFound", fields);
  }

  const r = parsed.data;

  const { data: inserted, error } = await supabase
    .from("blood_requests")
    .insert({
      requester_id: userId as string,
      patient_blood_type: r.patient_blood_type,
      units_needed: r.units_needed,
      hospital: r.hospital,
      district: r.district,
      urgency: r.urgency,
      needed_by: r.needed_by,
      note: r.note,
    })
    .select("id")
    .single();

  if (error || !inserted) return failure("common.somethingWentWrong");

  // Contact details go in the private table, never on the public request row.
  const { error: contactError } = await supabase
    .from("request_contacts")
    .insert({
      request_id: inserted.id,
      contact_name: r.contact_name,
      phone: r.phone,
      telegram_username: r.telegram,
    });

  if (contactError) {
    // Without a contact row nobody can reach the family, so the request would
    // be useless. Roll it back rather than leaving an unanswerable request up.
    await supabase.from("blood_requests").delete().eq("id", inserted.id);
    return failure("common.somethingWentWrong");
  }

  revalidatePath("/");
  revalidatePath("/my-requests");
  redirect(`/requests/${inserted.id}?posted=1`);
}

/** Owner-only status change: fulfilled or cancelled. */
async function setStatus(
  requestId: string,
  status: "fulfilled" | "cancelled",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return failure("errors.notSignedIn");

  // Ownership is re-checked here and again by RLS.
  const { data: request } = await supabase
    .from("blood_requests")
    .select("id, requester_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) return failure("errors.notFound");
  if (request.requester_id !== userId) return failure("errors.notAllowed");
  if (request.status !== "open") return failure("errors.requestClosed");

  const { error } = await supabase
    .from("blood_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) return failure("common.somethingWentWrong");

  revalidatePath("/");
  revalidatePath("/my-requests");
  revalidatePath(`/requests/${requestId}`);
  return { ok: true };
}

export async function markFulfilled(requestId: string) {
  return setStatus(requestId, "fulfilled");
}

export async function cancelRequest(requestId: string) {
  return setStatus(requestId, "cancelled");
}
