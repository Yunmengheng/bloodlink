import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BLOOD_TYPES, canDonate, type BloodType } from "./blood";

/**
 * The README prints the compatibility matrix for judges and readers. If it ever
 * drifts from lib/blood.ts, the documentation becomes medically wrong, so it is
 * checked rather than trusted.
 */
describe("README compatibility table", () => {
  it("matches canDonate() exactly", () => {
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8");

    for (const patient of BLOOD_TYPES) {
      const row = readme
        .split("\n")
        .find((line) => line.startsWith(`| **${patient}`.replace("-", "−")));

      expect(row, `no README row for ${patient}`).toBeDefined();

      // Cells after the label: one per donor type, "✅" means allowed.
      const cells = row!
        .split("|")
        .slice(2, 2 + BLOOD_TYPES.length)
        .map((c) => c.trim());

      BLOOD_TYPES.forEach((donor: BloodType, i) => {
        const documented = cells[i] === "✅";
        expect(
          documented,
          `README says ${donor} -> ${patient} is ${documented}, code says ${canDonate(donor, patient)}`,
        ).toBe(canDonate(donor, patient));
      });
    }
  });
});
