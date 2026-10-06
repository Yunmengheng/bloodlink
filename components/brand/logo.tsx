import Link from "next/link";
import { BloodDrop } from "./blood-drop";
import { cn } from "@/lib/utils";

/** Wordmark with a small drop. Links home unless rendered as plain text. */
export function Logo({
  className,
  asLink = true,
}: {
  className?: string;
  asLink?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}>
      <BloodDrop size="sm" />
      <span className="text-lg font-bold tracking-tight text-foreground">
        BloodLink{" "}
        <span className="font-semibold text-primary">KH</span>
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      // inline-flex, not the anchor default of inline, so vertical spacing
      // utilities apply to it in the footer.
      className="inline-flex rounded-button transition-opacity duration-150 hover:opacity-80"
      aria-label="BloodLink KH, go to home page"
    >
      {content}
    </Link>
  );
}
