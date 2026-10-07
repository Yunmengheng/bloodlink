import { Suspense } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { hasEnvVars } from "@/lib/utils";
import type { Dictionary, Lang } from "@/lib/i18n";

/** Sticky header: white with a slight blur and a bottom border. */
export function SiteHeader({ lang, t }: { lang: Lang; t: Dictionary }) {
  const links = [
    { href: "/for-you", label: t.nav.forYou },
    { href: "/my-requests", label: t.nav.myRequests },
    { href: "/donor", label: t.nav.profile },
    { href: "/learn", label: t.nav.learn },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center gap-2 px-4 sm:gap-4">
        <Logo />

        {/* Desktop nav; the same destinations live in the bottom tab bar on mobile. */}
        <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-button px-3 py-2 text-sm font-medium text-subtle transition-colors duration-150 hover:bg-standard-tint hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:ml-0">
          <LanguageToggle lang={lang} label={t.nav.language} />
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense fallback={<div className="h-11 w-11 rounded-pill bg-standard-tint" />}>
              <AuthButton t={t} />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}
