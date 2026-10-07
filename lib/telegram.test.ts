import { describe, expect, it } from "vitest";
import { isValidTelegram, normaliseTelegram } from "./telegram";

/**
 * The form uses isValidTelegram for live feedback and the Zod schema uses the
 * same helpers for the real check, so these tests guard both at once.
 */
describe("normaliseTelegram", () => {
  it.each([
    ["sokdara", "sokdara"],
    ["@sokdara", "sokdara"],
    ["t.me/sokdara", "sokdara"],
    ["T.ME/sokdara", "sokdara"],
    ["https://t.me/sokdara", "sokdara"],
    ["https://t.me/sokdara/", "sokdara"],
    ["  @sokdara  ", "sokdara"],
  ])("%s -> %s", (input, expected) => {
    expect(normaliseTelegram(input)).toBe(expected);
  });

  it.each(["", "   ", "@", "https://t.me/"])(
    "treats %p as empty",
    (input) => {
      expect(normaliseTelegram(input)).toBeNull();
    },
  );

  it("passes null through", () => {
    expect(normaliseTelegram(null)).toBeNull();
  });
});

describe("isValidTelegram", () => {
  it("allows an empty field — Telegram is optional", () => {
    expect(isValidTelegram("")).toBe(true);
    expect(isValidTelegram("   ")).toBe(true);
  });

  it.each(["sokdara", "@sokdara", "sok_dara_99", "a".repeat(32)])(
    "accepts %s",
    (input) => {
      expect(isValidTelegram(input)).toBe(true);
    },
  );

  it.each([
    ["abcd", "four characters, one short"],
    ["a".repeat(33), "one over the limit"],
    ["sok dara", "space"],
    ["sok.dara", "dot"],
    ["sok-dara", "dash"],
    // This is the case that was actually biting: Chrome autofilling an email.
    ["menghengyun@gmail.com", "an autofilled email address"],
  ])("rejects %s (%s)", (input) => {
    expect(isValidTelegram(input)).toBe(false);
  });
});
