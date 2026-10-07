import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import type { Dictionary } from "@/lib/i18n";

/** Footer on every page, carrying the medical disclaimer. */
export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        {/* flex column, not space-y: the logo and link are both inline-level,
            so vertical margin alone would still leave them on one line. */}
        <div className="flex flex-col items-start gap-3">
          <Logo size="sm" />
          <Link
            href="/learn"
            className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.nav.learn}
          </Link>
        </div>
        <p className="max-w-xl text-xs text-subtle">{t.common.disclaimer}</p>
      </div>
    </footer>
  );
}
