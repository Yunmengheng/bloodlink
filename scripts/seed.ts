/**
 * Demo data for BloodLink KH.
 *
 *   npx tsx scripts/seed.ts
 *
 * Uses SUPABASE_SECRET_KEY from .env.local, which bypasses Row Level Security.
 * That key is only ever used here — never in app code, never on Vercel.
 *
 * Safe to re-run. Nothing is ever deleted: each planned row is inserted only if
 * an equivalent one is missing, so your own requests are never touched.
 *
 * Requesters are the accounts that already exist in the project, so the demo
 * data belongs to the people actually signing in. Only if there are none does
 * the script create a demo requester. Real email addresses are therefore never
 * hard-coded in this file.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canDonate, type BloodType } from "../lib/blood";
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
    /* fall through to the check below */
  }
}
loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

if (!URL || !SECRET) {
  console.error(
    `\nMissing environment variables.\n\n` +
      `  NEXT_PUBLIC_SUPABASE_URL  ${URL ? "ok" : "MISSING"}\n` +
      `  SUPABASE_SECRET_KEY       ${SECRET ? "ok" : "MISSING"}\n\n` +
      `Add them to .env.local. The secret key is at:\n` +
      `  Supabase dashboard > Project Settings > API keys > secret\n`,
  );
  process.exit(1);
}

const supabase = createClient<Database>(URL, SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ---- demo donors -------------------------------------------------------- */

const PASSWORD = "BloodLink2026!";
const DEMO_DOMAIN = "bloodlink.demo";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};
const inDays = (n: number) => daysAgo(-n);

const DEMO_DONORS = [
  {
    email: `donor.o@${DEMO_DOMAIN}`,
    full_name: "Chan Sophea",
    blood_type: "O-" as BloodType,
    district: "daun_penh",
    phone: "012 345 678",
    telegram_username: "sophea_kh",
    last_donation_date: daysAgo(120), // eligible
    is_available: true,
  },
  {
    email: `donor.a@${DEMO_DOMAIN}`,
    full_name: "Vann Pisey",
    blood_type: "A+" as BloodType,
    district: "tuol_kouk",
    phone: "011 222 333",
    telegram_username: null,
    last_donation_date: daysAgo(30), // NOT eligible — shows the countdown ring
    is_available: true,
  },
  {
    email: `donor.b@${DEMO_DOMAIN}`,
    full_name: "Sok Rathana",
    blood_type: "B+" as BloodType,
    district: "sen_sok",
    phone: "078 909 101",
    telegram_username: "rathana_kh",
    last_donation_date: null, // never donated — eligible
    is_available: true,
  },
];

/* ---- requests ----------------------------------------------------------- */

type PlannedRequest = {
  patient_blood_type: BloodType;
  units_needed: number;
  hospital: string;
  district: string;
  urgency: "critical" | "urgent" | "standard";
  needed_by: string | null;
  note: string | null;
  status?: "open" | "fulfilled";
};

const REQUESTS: PlannedRequest[] = [
  { patient_blood_type: "B+",  units_needed: 3, hospital: "Calmette Hospital",                        district: "daun_penh",     urgency: "critical", needed_by: inDays(1),  note: "Surgery tomorrow morning. Please ask for ward 3." },
  { patient_blood_type: "AB+", units_needed: 2, hospital: "Khmer-Soviet Friendship Hospital",         district: "chamkar_mon",   urgency: "critical", needed_by: inDays(1),  note: "Road accident. Patient is stable but needs blood today." },
  { patient_blood_type: "O-",  units_needed: 2, hospital: "National Pediatric Hospital",              district: "prampi_makara", urgency: "critical", needed_by: inDays(2),  note: "Child patient, 6 years old." },
  { patient_blood_type: "A+",  units_needed: 2, hospital: "Royal Phnom Penh Hospital",                district: "sen_sok",       urgency: "urgent",   needed_by: inDays(3),  note: null },
  { patient_blood_type: "O+",  units_needed: 4, hospital: "Preah Kossamak Hospital",                  district: "tuol_kouk",     urgency: "urgent",   needed_by: inDays(3),  note: "Visiting hours 8am to 5pm." },
  { patient_blood_type: "A-",  units_needed: 1, hospital: "Kantha Bopha Children's Hospital",         district: "daun_penh",     urgency: "urgent",   needed_by: inDays(4),  note: null },
  { patient_blood_type: "AB-", units_needed: 1, hospital: "Preah Ang Duong Hospital",                 district: "chbar_ampov",   urgency: "standard", needed_by: inDays(10), note: "Scheduled operation next week." },
  { patient_blood_type: "B-",  units_needed: 2, hospital: "Sen Sok International University Hospital", district: "sen_sok",      urgency: "standard", needed_by: inDays(14), note: null },
  // Fulfilled, so the stats strip is not all zeros.
  { patient_blood_type: "A+",  units_needed: 2, hospital: "Calmette Hospital",                        district: "daun_penh",     urgency: "urgent",   needed_by: daysAgo(5),  note: null, status: "fulfilled" },
  { patient_blood_type: "O-",  units_needed: 1, hospital: "National Blood Transfusion Center",        district: "daun_penh",     urgency: "standard", needed_by: daysAgo(12), note: null, status: "fulfilled" },
];

/* ---- helpers ------------------------------------------------------------ */

async function listAllUsers() {
  const all: { id: string; email: string }[] = [];
  for (let page = 1; page <= 10; page++) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (!data?.users.length) break;
    for (const u of data.users) {
      if (u.email) all.push({ id: u.id, email: u.email });
    }
    if (data.users.length < 200) break;
  }
  return all;
}

async function ensureUser(email: string): Promise<string> {
  const { data } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true, // demo accounts skip the confirmation email
  });
  if (data?.user) return data.user.id;

  const existing = (await listAllUsers()).find((u) => u.email === email);
  if (existing) return existing.id;
  throw new Error(`Could not create or find ${email}`);
}

/* ---- main --------------------------------------------------------------- */

async function main() {
  console.log("Seeding BloodLink KH demo data…\n");

  // 1. Demo donors.
  const donorIds: Record<string, string> = {};
  for (const d of DEMO_DONORS) {
    donorIds[d.email] = await ensureUser(d.email);
  }
  const { error: donorError } = await supabase.from("donors").upsert(
    DEMO_DONORS.map((d) => ({
      id: donorIds[d.email],
      full_name: d.full_name,
      blood_type: d.blood_type,
      district: d.district,
      phone: d.phone,
      telegram_username: d.telegram_username,
      last_donation_date: d.last_donation_date,
      is_available: d.is_available,
    })),
    { onConflict: "id" },
  );
  if (donorError) throw donorError;
  console.log(`  donors     ${DEMO_DONORS.length} demo profiles`);

  // 2. Requesters: the real accounts already in the project.
  const demoEmails = new Set(DEMO_DONORS.map((d) => d.email));
  let requesters = (await listAllUsers()).filter((u) => !demoEmails.has(u.email));

  if (requesters.length === 0) {
    const email = `requester@${DEMO_DOMAIN}`;
    requesters = [{ id: await ensureUser(email), email }];
    console.log(`  requester  none found, created ${email}`);
  } else {
    console.log(
      `  requesters ${requesters.length} existing account(s): ${requesters
        .map((r) => r.email)
        .join(", ")}`,
    );
  }

  // 3. Requests, spread across the requesters. Insert only what is missing, so
  //    re-running never duplicates and never deletes anything you created.
  const { data: existing } = await supabase
    .from("blood_requests")
    .select("id, requester_id, hospital, patient_blood_type, units_needed, status");

  const key = (r: {
    requester_id: string;
    hospital: string;
    patient_blood_type: string;
    units_needed: number;
  }) => `${r.requester_id}|${r.hospital}|${r.patient_blood_type}|${r.units_needed}`;
  const present = new Set((existing ?? []).map(key));

  const inserted: { id: string; patient_blood_type: BloodType; requester_id: string }[] = [];
  let skipped = 0;

  for (const [i, req] of REQUESTS.entries()) {
    const requester = requesters[i % requesters.length];
    const row = {
      requester_id: requester.id,
      patient_blood_type: req.patient_blood_type,
      units_needed: req.units_needed,
      hospital: req.hospital,
      district: req.district,
      urgency: req.urgency,
      needed_by: req.needed_by,
      note: req.note,
      status: req.status ?? ("open" as const),
    };

    if (present.has(key(row))) {
      skipped++;
      continue;
    }

    const { data, error } = await supabase
      .from("blood_requests")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;

    inserted.push({
      id: data.id,
      patient_blood_type: req.patient_blood_type,
      requester_id: requester.id,
    });

    // Private contact row. Demo numbers, never a real one.
    const { error: contactError } = await supabase.from("request_contacts").upsert(
      {
        request_id: data.id,
        contact_name: "Family contact",
        phone: "012 999 888",
        telegram_username: "bloodlink_demo",
      },
      { onConflict: "request_id" },
    );
    if (contactError) throw contactError;
  }

  console.log(`  requests   ${inserted.length} inserted, ${skipped} already present`);

  // 4. Responses from demo donors, only where the blood types are actually
  //    compatible — seeded data that contradicts the app's own rules would be
  //    worse than no data at all.
  let responses = 0;
  for (const req of inserted) {
    for (const donor of DEMO_DONORS) {
      if (responses >= 6) break;
      // Never let a donor respond to their own request, and respect eligibility.
      if (donorIds[donor.email] === req.requester_id) continue;
      if (!canDonate(donor.blood_type, req.patient_blood_type)) continue;
      if (donor.last_donation_date && donor.email.includes("donor.a")) continue; // not eligible

      const { error } = await supabase.from("responses").insert({
        request_id: req.id,
        donor_id: donorIds[donor.email],
        donor_name: donor.full_name,
        donor_phone: donor.phone,
        donor_telegram: donor.telegram_username,
        donor_blood_type: donor.blood_type,
        message: "I can come this evening after 6pm.",
      });
      // 23505 = already responded, which is fine on a re-run.
      if (error && error.code !== "23505") throw error;
      if (!error) responses++;
    }
  }
  console.log(`  responses  ${responses} offers from demo donors`);

  const { data: stats } = await supabase.rpc("get_public_stats");
  console.log(`\n  stats now  ${JSON.stringify(stats?.[0])}`);

  console.log(`
────────────────────────────────────────────────
  Demo donor logins — password for all three:

    ${PASSWORD}

    ${DEMO_DONORS[0].email}   O-, eligible, matches everything
    ${DEMO_DONORS[1].email}   A+, NOT eligible yet (countdown ring)
    ${DEMO_DONORS[2].email}   B+, never donated, eligible

  Requests are owned by your own accounts, so sign in as yourself
  to see the responder contacts and the fulfil / cancel buttons.
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
