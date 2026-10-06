import { Logo } from "@/components/brand/logo";

/** Footer on every page, carrying the medical disclaimer. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-xl text-xs text-subtle">
          BloodLink KH only connects people. Hospitals perform screening and
          cross-matching before any transfusion.
        </p>
      </div>
    </footer>
  );
}
