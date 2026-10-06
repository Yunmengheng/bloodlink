import { cn } from "@/lib/utils";

/**
 * The signature BloodLink mark: a drop shape with a blood type set inside it.
 * Used in request cards, on detail pages and (without a label) in the logo.
 */

const SIZES = {
  // `wide` is used for three-character labels (AB-, AB+), which overflow the
  // drop at the default size.
  sm: { box: "h-7 w-6", text: "text-[10px]", wide: "text-[8px]" },
  md: { box: "h-10 w-[34px]", text: "text-[13px]", wide: "text-[11px]" },
  lg: { box: "h-14 w-12", text: "text-[18px]", wide: "text-[15px]" },
} as const;

export type BloodDropSize = keyof typeof SIZES;

type BloodDropProps = {
  /** Blood type to render inside the drop, e.g. "O+". Omit for a plain mark. */
  type?: string;
  size?: BloodDropSize;
  /** `solid` fills the drop red; `soft` is a tinted outline for quieter contexts. */
  variant?: "solid" | "soft";
  className?: string;
};

export function BloodDrop({
  type,
  size = "md",
  variant = "solid",
  className,
}: BloodDropProps) {
  const s = SIZES[size];
  const solid = variant === "solid";

  return (
    <span
      className={cn("relative inline-flex shrink-0", s.box, className)}
      // The visible text would read as "O+" with no context, so the accessible
      // name spells it out. Decorative (no type) drops are hidden entirely.
      role={type ? "img" : undefined}
      aria-label={type ? `Blood type ${type}` : undefined}
      aria-hidden={type ? undefined : true}
    >
      <svg
        viewBox="0 0 40 48"
        className="h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 2C20 2 4 20 4 30a16 16 0 0 0 32 0C36 20 20 2 20 2Z"
          className={cn(
            solid ? "fill-primary" : "fill-primary-tint stroke-primary/35",
          )}
          strokeWidth={solid ? 0 : 2}
        />
      </svg>

      {type ? (
        <span
          className={cn(
            // Centred on the round part of the drop, not the whole box.
            "absolute inset-x-0 bottom-[6%] flex h-[66%] items-center justify-center font-semibold tabular-nums",
            type.length > 2 ? s.wide : s.text,
            solid ? "text-primary-foreground" : "text-primary",
          )}
          aria-hidden="true"
        >
          {type}
        </span>
      ) : null}
    </span>
  );
}
