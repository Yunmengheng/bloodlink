import { describe, expect, it } from "vitest";
import { donorProfileSchema, newRequestSchema } from "./validation";

/**
 * These schemas decide whether a real person can post a request at all, so the
 * forgiving cases matter as much as the rejecting ones.
 */

const request = {
  patient_blood_type: "AB-",
  units_needed: "2",
  hospital: "Calmette Hospital",
  district: "daun_penh",
  urgency: "urgent",
  needed_by: "",
  note: "",
  contact_name: "Sok Dara",
};

const firstError = (result: ReturnType<typeof newRequestSchema.safeParse>) =>
  result.success ? null : result.error.issues[0].message;

describe("newRequestSchema — contact details", () => {
  it("accepts a phone number with no Telegram", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "012 345 678",
      telegram: "",
    });
    expect(firstError(r)).toBeNull();
    if (r.success) expect(r.data.telegram).toBeNull();
  });

  it("accepts a Telegram username with no phone", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "",
      telegram: "sokdara",
    });
    expect(firstError(r)).toBeNull();
  });

  it("requires at least one way to be contacted", () => {
    const r = newRequestSchema.safeParse({ ...request, phone: "", telegram: "" });
    expect(firstError(r)).toBe("errors.contactRequired");
  });

  // The formats people actually paste.
  it.each([
    ["@sokdara", "sokdara"],
    ["sokdara", "sokdara"],
    ["t.me/sokdara", "sokdara"],
    ["https://t.me/sokdara", "sokdara"],
    ["https://t.me/sokdara/", "sokdara"],
    ["  @sokdara  ", "sokdara"],
  ])("normalises %s to %s", (input, expected) => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "",
      telegram: input,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.telegram).toBe(expected);
  });

  it("treats a lone @ as empty rather than invalid", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "012 345 678",
      telegram: "@",
    });
    expect(firstError(r)).toBeNull();
    if (r.success) expect(r.data.telegram).toBeNull();
  });

  // Telegram's own rule: 5-32 chars, letters/digits/underscore.
  it.each([
    ["abc", "too short"],
    ["sok dara", "contains a space"],
    ["sok.dara", "contains a dot"],
    ["sok-dara", "contains a dash"],
    ["ឈ្មោះខ្ញុំ", "not Latin characters"],
  ])("rejects %s (%s)", (input) => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "",
      telegram: input,
    });
    expect(firstError(r)).toBe("errors.telegramInvalid");
  });

  it("rejects a phone number that is not a phone number", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "call me maybe",
      telegram: "",
    });
    expect(firstError(r)).toBe("errors.phoneInvalid");
  });

  it("accepts common Cambodian phone formats", () => {
    for (const phone of ["012345678", "012 345 678", "+855 12 345 678", "(012) 345-678"]) {
      const r = newRequestSchema.safeParse({ ...request, phone, telegram: "" });
      expect(firstError(r), phone).toBeNull();
    }
  });
});

describe("newRequestSchema — the rest of the form", () => {
  it("rejects units outside 1 to 10", () => {
    for (const units of ["0", "11", "-1"]) {
      const r = newRequestSchema.safeParse({
        ...request,
        units_needed: units,
        phone: "012 345 678",
        telegram: "",
      });
      expect(firstError(r), units).toBe("errors.unitsRange");
    }
  });

  it("rejects an unknown blood type", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      patient_blood_type: "C+",
      phone: "012 345 678",
      telegram: "",
    });
    expect(firstError(r)).toBe("errors.invalidBloodType");
  });

  it("rejects an unknown district", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      district: "atlantis",
      phone: "012 345 678",
      telegram: "",
    });
    expect(firstError(r)).toBe("errors.invalidDistrict");
  });

  it("rejects a note over 300 characters", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      note: "x".repeat(301),
      phone: "012 345 678",
      telegram: "",
    });
    expect(firstError(r)).toBe("errors.noteTooLong");
  });

  it("turns an empty optional date into null", () => {
    const r = newRequestSchema.safeParse({
      ...request,
      phone: "012 345 678",
      telegram: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.needed_by).toBeNull();
  });
});

describe("donorProfileSchema", () => {
  const donor = {
    full_name: "Chan Sophea",
    blood_type: "O-",
    district: "daun_penh",
    phone: "012 345 678",
    telegram: "",
    last_donation_date: "",
    is_available: true,
  };

  it("accepts a donor who has never donated", () => {
    const r = donorProfileSchema.safeParse(donor);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.last_donation_date).toBeNull();
  });

  it("rejects a last donation date in the future", () => {
    const future = new Date();
    future.setUTCFullYear(future.getUTCFullYear() + 1);
    const r = donorProfileSchema.safeParse({
      ...donor,
      last_donation_date: future.toISOString().slice(0, 10),
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("errors.dateInFuture");
    }
  });

  it("requires a name", () => {
    const r = donorProfileSchema.safeParse({ ...donor, full_name: "   " });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("errors.nameRequired");
  });
});
