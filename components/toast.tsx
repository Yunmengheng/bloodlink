"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline status message. aria-live so screen readers announce it when a form
 * result arrives without the focus moving.
 */
export function Toast({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2.5 rounded-button border px-3.5 py-3 text-sm font-medium",
        tone === "success"
          ? "border-success/20 bg-success-tint text-success-ink"
          : "border-critical/20 bg-critical-tint text-critical-ink",
      )}
    >
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}
