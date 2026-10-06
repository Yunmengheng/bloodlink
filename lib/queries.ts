import { createClient } from "@/lib/supabase/server";
import { compatibleRecipients, type BloodType } from "@/lib/blood";
import type {
  BloodRequest,
  BloodTypeEnum,
  Donor,
  DonorResponse,
  PublicStats,
} from "@/lib/database.types";

/**
 * Read helpers shared by the pages. Every query runs through the user's own
 * Supabase client, so Row Level Security applies — these functions cannot see
 * more than the signed-in user is allowed to.
 */

/** Urgency ordering for the feed: critical first, then newest. */
const URGENCY_RANK = { critical: 0, urgent: 1, standard: 2 } as const;

export function sortForFeed(requests: BloodRequest[]): BloodRequest[] {
  return [...requests].sort((a, b) => {
    const rank = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
    if (rank !== 0) return rank;
    return b.created_at.localeCompare(a.created_at);
  });
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_stats");
  return (
    data?.[0] ?? {
      open_requests: 0,
      registered_donors: 0,
      fulfilled_requests: 0,
    }
  );
}

export async function getNeededBloodTypes() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_needed_blood_types");
  return data ?? [];
}

export async function getOpenRequests(filters?: {
  bloodType?: BloodTypeEnum;
  district?: string;
  limit?: number;
}): Promise<BloodRequest[]> {
  const supabase = await createClient();

  let query = supabase
    .from("blood_requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 50);

  if (filters?.bloodType) {
    query = query.eq("patient_blood_type", filters.bloodType);
  }
  if (filters?.district) {
    query = query.eq("district", filters.district);
  }

  const { data } = await query;
  // Urgency ordering is applied in TypeScript so the enum order is explicit
  // rather than depending on the Postgres enum's declaration order.
  return sortForFeed(data ?? []);
}

export async function getRequest(id: string): Promise<BloodRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/** Only visible to the request owner or a donor who responded (enforced by RLS). */
export async function getRequestContact(requestId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("request_contacts")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();
  return data;
}

export async function getResponses(requestId: string): Promise<DonorResponse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("responses")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getDonorProfile(userId: string): Promise<Donor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("donors")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function getMyRequests(userId: string): Promise<BloodRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Requests this donor's blood type can serve, that are still open. */
export async function getMatchedRequests(
  donorBloodType: BloodType,
): Promise<BloodRequest[]> {
  const supabase = await createClient();
  const recipients = compatibleRecipients(donorBloodType);

  const { data } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("status", "open")
    .in("patient_blood_type", [...recipients])
    .order("created_at", { ascending: false })
    .limit(50);

  return sortForFeed(data ?? []);
}

/** Request ids this donor has already offered to help with. */
export async function getMyResponseRequestIds(
  userId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("responses")
    .select("request_id")
    .eq("donor_id", userId);
  return new Set((data ?? []).map((r) => r.request_id));
}
