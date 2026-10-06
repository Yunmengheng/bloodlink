"use client";

import { useTransition } from "react";
import { setLanguage } from "@/app/actions/language";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

/** EN | ខ្មែរ segmented control. */
export function LanguageToggle({ lang, label }: { lang: Lang; label: string }) {
  const [pending, startTransition] = useTransition();

  const options: { value: Lang; text: string }[] = [
    { value: "en", text: "EN" },
    { value: "km", text: "ខ្មែរ" },
  ];

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-pill border border-border bg-standard-tint p-0.5",
        pending && "opacity-60",
      )}
    >
      {options.map((option) => {
        const active = lang === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void setLanguage(option.value);
              })
            }
            className={cn(
              // Khmer subscript consonants (the ្ម in ខ្មែរ) sit below the
              // baseline and get clipped at a tight line-height.
              "flex min-h-[36px] items-center justify-center rounded-pill px-3 text-xs font-semibold leading-[1.9] transition-colors duration-150 ease-out",
              active
                ? "bg-surface text-foreground shadow-soft"
                : "text-subtle hover:text-foreground",
            )}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
