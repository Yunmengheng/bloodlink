import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/main-nav";
import { LanguageToggle } from "@/components/language-toggle";
import { hasEnvVars } from "@/lib/utils";
import type { Dictionary, Lang } from "@/lib/i18n";

/**
 * Sticky header: white with a slight blur and a hairline bottom border.
 *
 * Three zones — brand, navigation, account — with the nav given its own space
 * rather than crowding the wordmark.
 */
export function SiteHeader({ lang, t }: { lang: Lang; t: Dictionary }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center gap-3 px-4 sm:gap-5">
        <Logo />

        <div className="ml-2 hidden flex-1 md:block">
          <MainNav t={t} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:gap-3">
          <LanguageToggle lang={lang} label={t.nav.language} />

          {/* Hairline separator between the toggle and the account control. */}
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense
              fallback={<div className="h-11 w-11 rounded-pill bg-standard-tint" />}
            >
              <AuthButton t={t} />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}
