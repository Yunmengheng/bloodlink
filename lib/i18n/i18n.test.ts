import { describe, expect, it } from "vitest";
import { en } from "./en";
import { km } from "./km";
import { fill } from "./index";

/** Every leaf path in a nested object, as "section.key". */
function paths(obj: Record<string, Record<string, string>>): string[] {
  return Object.entries(obj)
    .flatMap(([section, entries]) =>
      Object.keys(entries).map((key) => `${section}.${key}`),
    )
    .sort();
}

describe("dictionaries", () => {
  it("en and km have identical key sets", () => {
    // TypeScript already enforces this, but a runtime check keeps the guarantee
    // if the Dictionary type is ever loosened.
    expect(paths(km)).toEqual(paths(en));
  });

  it("has no empty strings", () => {
    for (const [name, dict] of [
      ["en", en],
      ["km", km],
    ] as const) {
      for (const [section, entries] of Object.entries(dict)) {
        for (const [key, value] of Object.entries(entries)) {
          expect(
            (value as string).trim().length,
            `${name}.${section}.${key} is empty`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("uses the same placeholders in both languages", () => {
    const placeholders = (s: string) =>
      (s.match(/\{(\w+)\}/g) ?? []).sort().join(",");

    for (const [section, entries] of Object.entries(en)) {
      for (const [key, value] of Object.entries(entries)) {
        const kmValue = (km as Record<string, Record<string, string>>)[section][
          key
        ];
        expect(
          placeholders(kmValue),
          `placeholders differ at ${section}.${key}`,
        ).toBe(placeholders(value as string));
      }
    }
  });

  it("km actually contains Khmer script", () => {
    // Guards against a copy-paste that leaves English in the Khmer file.
    // Brand names and a few labels are intentionally Latin, so we check the
    // proportion rather than every string.
    const khmer = /[ក-៿]/;
    const values = Object.values(km).flatMap((s) => Object.values(s));
    const withKhmer = values.filter((v) => khmer.test(v)).length;
    expect(withKhmer / values.length).toBeGreaterThan(0.9);
  });
});

describe("fill", () => {
  it("substitutes placeholders", () => {
    expect(fill("You can donate on {date}.", { date: "1 Jan" })).toBe(
      "You can donate on 1 Jan.",
    );
  });

  it("substitutes repeated and numeric values", () => {
    expect(fill("{n} of {n}", { n: 3 })).toBe("3 of 3");
  });

  it("leaves unknown placeholders visible", () => {
    expect(fill("Hello {name}", {})).toBe("Hello {name}");
  });
});
