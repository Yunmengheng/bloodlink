import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { cn } from "@/lib/utils";

/**
 * Wordmark: the drop mark, "BloodLink" set tight, and KH as a small badge
 * rather than loose coloured text, so the country tag reads as part of the
 * brand instead of a stray word.
 */
export function Logo({
  className,
  asLink = true,
  size = "md",
}: {
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md";
}) {
  const small = size === "sm";

  const content = (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap",
        small ? "gap-1.5" : "gap-2",
        className,
      )}
    >
      <BrandMark
        className={small ? "h-6 w-5" : "h-7 w-[22px] sm:h-8 sm:w-[26px]"}
      />
      <span
        className={cn(
          "font-bold tracking-[-0.025em] text-foreground",
          small ? "text-[15px]" : "text-[17px] sm:text-[19px]",
        )}
      >
        BloodLink
      </span>
      <span
        className={cn(
          // Dropped below 360px, where the header cannot fit it.
          // A squarer badge than rounded-md, which reads as a lozenge at this size.
          "hidden rounded-[5px] bg-primary-tint font-bold uppercase tracking-[0.04em] text-primary-hover xs:inline",
          small ? "px-1 py-px text-[9px]" : "px-1.5 py-[3px] text-[10px]",
        )}
      >
        KH
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      // inline-flex, not the anchor default of inline, so vertical spacing
      // utilities apply to it in the footer.
      className="inline-flex rounded-button transition-opacity duration-150 ease-out hover:opacity-80"
      aria-label="BloodLink KH, go to home page"
    >
      {content}
    </Link>
  );
}
