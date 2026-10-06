import { Button } from "./ui/button";

/**
 * Shown in place of the sign-in buttons until Supabase credentials exist in
 * .env.local, so the app degrades to a clear setup hint instead of crashing.
 */
export function EnvVarWarning() {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden rounded-pill border border-urgent/25 bg-urgent-tint px-3 py-1.5 text-xs font-medium text-urgent-ink sm:inline">
        Connect Supabase to enable sign-in
      </span>
      <Button size="sm" variant="outline" disabled>
        Sign in
      </Button>
    </div>
  );
}
