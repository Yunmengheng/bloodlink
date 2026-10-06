import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";

/**
 * Placeholder home page.
 * The real hero, stats strip and public request feed arrive in later milestones;
 * this version exists so the scaffold is runnable and auth can be tested.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <span className="font-semibold">BloodLink KH</span>
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Every drop finds its match
        </h1>
        <p className="mt-3 max-w-prose text-muted-foreground">
          BloodLink KH privately matches urgent blood requests in Cambodia with
          compatible, eligible donors.
        </p>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 text-xs text-muted-foreground">
          BloodLink KH only connects people. Hospitals perform screening and
          cross-matching before any transfusion.
        </div>
      </footer>
    </div>
  );
}
