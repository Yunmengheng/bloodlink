import { cn } from "@/lib/utils";

/**
 * The BloodLink KH logo mark: a drop with a heart cut out of it.
 *
 * Separate from BloodDrop, which carries a blood-type label and is used in
 * cards. This one is the brand, so it can carry detail BloodDrop should not:
 * a vertical gradient for depth and a negative-space heart for "donate".
 *
 * The heart is punched out with a mask rather than drawn in white, so the mark
 * works on any background, including the tinted header.
 */
export function BrandMark({
  className = "h-8 w-[26px]",
}: {
  /** Sized with classes rather than props, so it can be responsive. */
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={cn("shrink-0", className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bl-drop" x1="16" y1="2" x2="16" y2="38">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-hover))" />
        </linearGradient>

        <mask id="bl-heart-cut">
          {/* White keeps the drop, black punches the heart out of it. */}
          <path
            d="M16 1.5C16 1.5 2.5 17 2.5 25.5a13.5 13.5 0 0 0 27 0C29.5 17 16 1.5 16 1.5Z"
            fill="white"
          />
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="black"
            transform="translate(8.56 18.25) scale(0.62)"
          />
        </mask>
      </defs>

      <path
        d="M16 1.5C16 1.5 2.5 17 2.5 25.5a13.5 13.5 0 0 0 27 0C29.5 17 16 1.5 16 1.5Z"
        fill="url(#bl-drop)"
        mask="url(#bl-heart-cut)"
      />
    </svg>
  );
}
