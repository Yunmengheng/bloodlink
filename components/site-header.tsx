import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Logo } from "@/components/brand/logo";
import { hasEnvVars } from "@/lib/utils";

/**
 * Sticky header: white with a slight blur and a bottom border.
 * The language toggle and avatar menu land here in M4.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-4">
        <Logo />
        <div className="flex items-center gap-2">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense fallback={<div className="h-11 w-32" />}>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}
