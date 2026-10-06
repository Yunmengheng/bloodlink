/**
 * Demo data for BloodLink KH.
 *
 *   npx tsx scripts/seed.ts
 *
 * Uses SUPABASE_SECRET_KEY from .env.local, which bypasses Row Level Security.
 * That key is only ever used here — never in app code, never on Vercel.
 *
 * Safe to re-run: users are reused if they already exist, and the script clears
 * its own previously seeded requests before inserting fresh ones.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "../lib/database.types";

/* ---- env ---------------------------------------------------------------- */

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Fall through to the check below.
  }
}
loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

if (!URL || !SECRET) {
  console.error(
    "\nMissing environment variables.\n\n" +
      "  NEXT_PUBLIC_SUPABASE_URL  " + (URL ? "ok" : "MISSING") + "\n" +
      "  SUPABASE_SECRET_KEY       " + (SECRET ? "ok" : "MISSING") + "\n\n" +
      "Add them to .env.local. The secret key is at:\n" +
      "  Supabase dashboard > Project Settings > API keys > secret\n",
  );
  process.exit(1);
}

const supabase = createClient<Database>(URL, SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ---- demo accounts ------------------------------------------------------ */

const PASSWORD = "BloodLink2026!";

const USERS = [
  { key: "requester", email: "requester@bloodlink.demo", name: "Sok Dara" },
  { key: "donorO", email: "donor.o@bloodlink.demo", name: "Chan Sophea" },
  { key: "donorA", email: "donor.a@bloodlink.demo", name: "Vann Pisey" },
] as const;

/** Creates the user, or finds them if a previous run already did. */
async function ensureUser(email: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true, // skip the confirmation email for demo accounts
  });

  if (data?.user) return data.user.id;

  // Already exists: page through users to find the id.
  if (error) {
    for (let page = 1; page <= 10; page++) {
      const { data: list } = await supabase.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      const found = list?.users.find((u) => u.email === email);
      if (found) return found.id;
      if (!list?.users.length) break;
    }
  }
  throw new Error(`Could not create or find user ${email}: ${error?.message}`);
}

/* ---- helpers ------------------------------------------------------------ */

const daysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

const inDays = (n: number) => daysAgo(-n);

async function main() {
  console.log("Seeding BloodLink KH demo data…\n");

  /* users */
  const ids: Record<string, string> = {};
  for (const u of USERS) {
    ids[u.key] = await ensureUser(u.email);
    console.log(`  user   ${u.email}`);
  }

  /* donor profiles */
  const donors = [
    {
      id: ids.donorO,
      full_name: "Chan Sophea",
      blood_type: "O-" as const,
      district: "daun_penh",
      phone: "012 345 678",
      telegram_username: "sophea_kh",
      // Eligible: well past the 90-day interval.
      last_donation_date: daysAgo(120),
      is_available: true,
    },
    {
      id: ids.donorA,
      full_name: "Vann Pisey",
      blood_type: "A+" as const,
      district: "tuol_kouk",
      phone: "011 222 333",
      telegram_username: null,
      // NOT eligible yet — shows the countdown ring in the demo.
      last_donation_date: daysAgo(30),
      is_available: true,
    },
  ];

  const { error: donorError } = await supabase
    .from("donors")
    .upsert(donors, { onConflict: "id" });
  if (donorError) throw donorError;
  console.log(`  donors ${donors.length} profiles`);

  /* clear previously seeded requests so re-runs stay tidy */
  await supabase
    .from("blood_requests")
    .delete()
    .eq("requester_id", ids.requester);

  /* requests */
  const requests = [
    { patient_blood_type: "O-", units_needed: 3, hospital: "Calmette Hospital", district: "daun_penh", urgency: "critical", needed_by: inDays(1), note: "Surgery tomorrow morning. Please ask for ward 3." },
    { patient_blood_type: "A+", units_needed: 2, hospital: "Khmer-Soviet Friendship Hospital", district: "chamkar_mon", urgency: "critical", needed_by: inDays(1), note: "Road accident, patient is stable but needs blood today." },
    { patient_blood_type: "B+", units_needed: 2, hospital: "Preah Kossamak Hospital", district: "tuol_kouk", urgency: "urgent", needed_by: inDays(3), note: null },
    { patient_blood_type: "O+", units_needed: 4, hospital: "National Pediatric Hospital", district: "prampi_makara", urgency: "urgent", needed_by: inDays(2), note: "Child patient, 6 years old." },
    { patient_blood_type: "AB-", units_needed: 1, hospital: "Royal Phnom Penh Hospital", district: "sen_sok", urgency: "urgent", needed_by: inDays(4), note: null },
    { patient_blood_type: "A-", units_needed: 2, hospital: "Kantha Bopha Children's Hospital", district: "daun_penh", urgency: "standard", needed_by: inDays(10), note: "Scheduled operation next week." },
    { patient_blood_type: "B-", units_needed: 1, hospital: "Preah Ang Duong Hospital", district: "chbar_ampov", urgency: "standard", needed_by: inDays(14), note: null },
    { patient_blood_type: "O+", units_needed: 2, hospital: "Sen Sok International University Hospital", district: "sen_sok", urgency: "standard", needed_by: inDays(12), note: "Planned transfusion." },
    // Two fulfilled ones so the stats strip looks realistic.
    { patient_blood_type: "A+", units_needed: 2, hospital: "Calmette Hospital", district: "daun_penh", urgency: "urgent", needed_by: daysAgo(5), note: null, status: "fulfilled" as const },
    { patient_blood_type: "O-", units_needed: 1, hospital: "National Blood Transfusion Center", district: "daun_penh", urgency: "standard", needed_by: daysAgo(12), note: null, status: "fulfilled" as const },
  ];

  const { data: inserted, error: requestError } = await supabase
    .from("blood_requests")
    .insert(
      requests.map((r) => ({
        ...r,
        requester_id: ids.requester,
        patient_blood_type: r.patient_blood_type as "O-",
        urgency: r.urgency as "critical",
      })),
    )
    .select("id");
  if (requestError) throw requestError;
  console.log(`  requests ${inserted?.length ?? 0} (2 fulfilled)`);

  /* private contact rows */
  const { error: contactError } = await supabase
    .from("request_contacts")
    .upsert(
      (inserted ?? []).map((r) => ({
        request_id: r.id,
        contact_name: "Sok Dara",
        phone: "012 999 888",
        telegram_username: "sokdara_kh",
      })),
      { onConflict: "request_id" },
    );
  if (contactError) throw contactError;
  console.log(`  contacts ${inserted?.length ?? 0} private rows`);

  /* one existing response, so the requester view has something to show */
  const firstOpen = inserted?.[0];
  if (firstOpen) {
    await supabase.from("responses").upsert(
      [
        {
          request_id: firstOpen.id,
          donor_id: ids.donorO,
          donor_name: "Chan Sophea",
          donor_phone: "012 345 678",
          donor_telegram: "sophea_kh",
          donor_blood_type: "O-" as const,
          message: "I can come this evening after 6pm.",
        },
      ],
      { onConflict: "request_id,donor_id" },
    );
    console.log("  responses 1 offer on the first request");
  }

  console.log(`
────────────────────────────────────────────────
  Demo accounts — password for all three:

    ${PASSWORD}

    Requester  requester@bloodlink.demo   (Sok Dara, posted the requests)
    Donor O-   donor.o@bloodlink.demo     (eligible, matches everything)
    Donor A+   donor.a@bloodlink.demo     (NOT eligible — shows the countdown)
────────────────────────────────────────────────
`);
}

main().catch((error) => {
  console.error("\nSeed failed:", error.message ?? error);
  console.error(
    "\nIf this is a 'relation does not exist' error, run " +
      "supabase/migrations/0001_init.sql in the Supabase SQL Editor first.\n",
  );
  process.exit(1);
});
