import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // getClaims() reads the JWT without a round trip, unlike getUser().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const email = typeof user.email === "string" ? user.email : "";

  return (
    <div className="flex items-center gap-3">
      <span
        className="hidden max-w-[180px] truncate text-sm text-subtle sm:inline"
        title={email}
      >
        {email}
      </span>
      <LogoutButton />
    </div>
  );
}
