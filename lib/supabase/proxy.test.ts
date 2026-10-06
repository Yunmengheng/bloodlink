import { describe, expect, it } from "vitest";
import { isPublicPath } from "./proxy";

/**
 * This gate decides what a signed-out visitor can reach. Getting it wrong in
 * either direction is bad: too open exposes authenticated pages, too closed
 * breaks shared request links.
 */
describe("isPublicPath", () => {
  it("allows the public pages", () => {
    for (const path of ["/", "/learn"]) {
      expect(isPublicPath(path), path).toBe(true);
    }
  });

  it("allows every auth page", () => {
    for (const path of [
      "/auth/login",
      "/auth/sign-up",
      "/auth/forgot-password",
      "/auth/update-password",
      "/auth/confirm",
      "/auth/error",
    ]) {
      expect(isPublicPath(path), path).toBe(true);
    }
  });

  it("allows a shared request detail link", () => {
    expect(
      isPublicPath("/requests/3f1b7c9e-0000-4000-8000-000000000000"),
    ).toBe(true);
  });

  it("does NOT allow posting a request", () => {
    expect(isPublicPath("/requests/new")).toBe(false);
  });

  it("is not fooled by paths that merely start with 'new'", () => {
    // "/requests/new/anything" must stay private...
    expect(isPublicPath("/requests/new/preview")).toBe(false);
    // ...but an id that happens to begin with "new" is a real request.
    expect(isPublicPath("/requests/newton-id-123")).toBe(true);
  });

  it("requires sign-in everywhere else", () => {
    for (const path of [
      "/donor",
      "/for-you",
      "/my-requests",
      "/requests",
      "/anything-else",
    ]) {
      expect(isPublicPath(path), path).toBe(false);
    }
  });
});
