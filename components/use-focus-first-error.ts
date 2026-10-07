"use client";

import { useEffect } from "react";
import type { ActionResult } from "@/lib/action-result";

/**
 * When a Server Action returns field errors, move focus to the first bad field
 * and scroll it into view.
 *
 * Without this, a long form can reject with a banner at the top while the field
 * that actually failed is far below the fold, leaving no way to tell what is
 * wrong. aria handles the announcement; this handles the scroll position.
 */
export function useFocusFirstError(state: ActionResult | null) {
  useEffect(() => {
    if (!state || state.ok) return;

    const firstField = Object.keys(state.fieldErrors ?? {})[0];
    if (!firstField) return;

    const el = document.getElementById(firstField);
    if (!el) return;

    el.scrollIntoView({ block: "center", behavior: "smooth" });
    // Radio groups and selects focus fine; inputs get the caret too.
    (el as HTMLElement).focus({ preventScroll: true });
  }, [state]);
}
