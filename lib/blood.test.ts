import { describe, expect, it } from "vitest";
import {
  BLOOD_TYPES,
  MIN_DAYS_BETWEEN_DONATIONS,
  type BloodType,
  canDonate,
  compatibleDonors,
  compatibleRecipients,
  daysUntilEligible,
  isBloodType,
  isEligible,
  nextEligibleDate,
} from "./blood";

/**
 * The full 8x8 truth table, written out independently of the implementation so
 * that a wrong entry in the source table actually fails a test. Rows are the
 * DONOR, columns are the RECIPIENT, in BLOOD_TYPES order:
 *
 *            O-  O+  A-  A+  B-  B+ AB- AB+
 */
const MATRIX: Record<BloodType, string> = {
  "O-": "Y   Y   Y   Y   Y   Y   Y   Y", // universal donor
  "O+": ".   Y   .   Y   .   Y   .   Y",
  "A-": ".   .   Y   Y   .   .   Y   Y",
  "A+": ".   .   .   Y   .   .   .   Y",
  "B-": ".   .   .   .   Y   Y   Y   Y",
  "B+": ".   .   .   .   .   Y   .   Y",
  "AB-": ".   .   .   .   .   .   Y   Y",
  "AB+": ".   .   .   .   .   .   .   Y", // can only give to AB+
};

function expectedCanDonate(donor: BloodType, recipient: BloodType): boolean {
  const cells = MATRIX[donor].trim().split(/\s+/);
  return cells[BLOOD_TYPES.indexOf(recipient)] === "Y";
}

describe("BLOOD_TYPES", () => {
  it("lists all eight types exactly once", () => {
    expect(BLOOD_TYPES).toHaveLength(8);
    expect(new Set(BLOOD_TYPES).size).toBe(8);
  });
});

describe("canDonate — full 8x8 compatibility matrix", () => {
  for (const donor of BLOOD_TYPES) {
    for (const recipient of BLOOD_TYPES) {
      const expected = expectedCanDonate(donor, recipient);
      it(`${donor} -> ${recipient} is ${expected}`, () => {
        expect(canDonate(donor, recipient)).toBe(expected);
      });
    }
  }

  it("O- is the universal donor", () => {
    expect(compatibleRecipients("O-")).toEqual([...BLOOD_TYPES]);
  });

  it("AB+ is the universal recipient", () => {
    expect(compatibleDonors("AB+")).toEqual([...BLOOD_TYPES]);
  });

  it("every type can donate to itself", () => {
    for (const t of BLOOD_TYPES) expect(canDonate(t, t)).toBe(true);
  });

  it("a negative recipient never accepts a positive donor", () => {
    for (const donor of BLOOD_TYPES.filter((t) => t.endsWith("+"))) {
      for (const recipient of BLOOD_TYPES.filter((t) => t.endsWith("-"))) {
        expect(canDonate(donor, recipient)).toBe(false);
      }
    }
  });
});

describe("compatibleRecipients / compatibleDonors agree with canDonate", () => {
  it("are consistent in both directions", () => {
    for (const donor of BLOOD_TYPES) {
      for (const recipient of BLOOD_TYPES) {
        const ok = canDonate(donor, recipient);
        expect(compatibleRecipients(donor).includes(recipient)).toBe(ok);
        expect(compatibleDonors(recipient).includes(donor)).toBe(ok);
      }
    }
  });
});

describe("isBloodType", () => {
  it("accepts the eight valid types", () => {
    for (const t of BLOOD_TYPES) expect(isBloodType(t)).toBe(true);
  });

  it("rejects anything else", () => {
    for (const bad of ["", "o-", "C+", "A", "AB", null, undefined, 1, {}]) {
      expect(isBloodType(bad)).toBe(false);
    }
  });
});

describe("isEligible", () => {
  const TODAY = "2026-06-01";

  // Helper: the date N days before TODAY.
  function daysAgo(n: number): string {
    const d = new Date(`${TODAY}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  }

  it("is 90 days", () => {
    expect(MIN_DAYS_BETWEEN_DONATIONS).toBe(90);
  });

  it("is not eligible at 89 days", () => {
    expect(isEligible(daysAgo(89), TODAY)).toBe(false);
  });

  it("is eligible at exactly 90 days", () => {
    expect(isEligible(daysAgo(90), TODAY)).toBe(true);
  });

  it("is eligible at 91 days", () => {
    expect(isEligible(daysAgo(91), TODAY)).toBe(true);
  });

  it("is eligible when the donor has never donated (null)", () => {
    expect(isEligible(null, TODAY)).toBe(true);
    expect(isEligible(undefined, TODAY)).toBe(true);
  });

  it("is NOT eligible when the last donation is in the future", () => {
    expect(isEligible(daysAgo(-1), TODAY)).toBe(false);
    expect(isEligible(daysAgo(-365), TODAY)).toBe(false);
  });

  it("is not eligible on the day of donation", () => {
    expect(isEligible(TODAY, TODAY)).toBe(false);
  });

  it("ignores the time of day", () => {
    expect(
      isEligible(new Date("2026-03-03T23:59:00.000Z"), new Date("2026-06-01T00:01:00.000Z")),
    ).toBe(true);
  });
});

describe("nextEligibleDate", () => {
  it("returns null when the donor has never donated", () => {
    expect(nextEligibleDate(null)).toBeNull();
    expect(nextEligibleDate(undefined)).toBeNull();
  });

  it("returns exactly 90 days after the last donation", () => {
    expect(nextEligibleDate("2026-01-01")?.toISOString().slice(0, 10)).toBe(
      "2026-04-01",
    );
  });

  it("crosses a leap day correctly", () => {
    // 2028 is a leap year: 2028-01-01 + 90 days lands on 2028-03-31.
    expect(nextEligibleDate("2028-01-01")?.toISOString().slice(0, 10)).toBe(
      "2028-03-31",
    );
  });

  it("agrees with isEligible on the boundary", () => {
    const next = nextEligibleDate("2026-01-01")!;
    expect(isEligible("2026-01-01", next)).toBe(true);

    const dayBefore = new Date(next);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
    expect(isEligible("2026-01-01", dayBefore)).toBe(false);
  });
});

describe("daysUntilEligible", () => {
  it("is 0 for a donor who has never donated", () => {
    expect(daysUntilEligible(null, "2026-06-01")).toBe(0);
  });

  it("counts down to the next eligible date", () => {
    expect(daysUntilEligible("2026-01-01", "2026-03-31")).toBe(1);
    expect(daysUntilEligible("2026-01-01", "2026-04-01")).toBe(0);
  });

  it("never goes negative once the donor is eligible", () => {
    expect(daysUntilEligible("2020-01-01", "2026-06-01")).toBe(0);
  });
});
