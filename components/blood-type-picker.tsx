"use client";

import { BLOOD_TYPES, type BloodType } from "@/lib/blood";
import { cn } from "@/lib/utils";

/**
 * Eight large tappable tiles in a 4x2 grid rather than a dropdown — picking a
 * blood type is the single most important choice in the app and deserves to be
 * one tap, not three.
 *
 * Rendered as real radio inputs so it is keyboard navigable (arrow keys) and
 * announced as a group by screen readers.
 */
export function BloodTypePicker({
  name,
  value,
  onChange,
  legend,
  error,
  required = true,
}: {
  name: string;
  value: BloodType | null;
  onChange: (value: BloodType) => void;
  legend: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-foreground">
        {legend}
      </legend>

      <div className="grid grid-cols-4 gap-2">
        {BLOOD_TYPES.map((type) => {
          const selected = value === type;
          return (
            <label
              key={type}
              className={cn(
                "relative flex h-14 cursor-pointer items-center justify-center rounded-button border text-base font-bold transition-all duration-150 ease-out active:scale-[0.97]",
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-primary-tint",
              )}
            >
              <input
                type="radio"
                name={name}
                value={type}
                checked={selected}
                required={required}
                onChange={() => onChange(type)}
                className="sr-only"
              />
              {type}
            </label>
          );
        })}
      </div>

      {error ? (
        <p className="mt-2 text-xs font-medium text-critical-ink">{error}</p>
      ) : null}
    </fieldset>
  );
}
