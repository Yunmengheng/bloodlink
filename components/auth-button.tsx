import Link from "next/link";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import { createClient } from "@/lib/supabase/server";
import type { Dictionary } from "@/lib/i18n";

export async function AuthButton({ t }: { t: Dictionary }) {
  const supabase = await createClient();

  // getClaims() reads the JWT without a round trip, unlike getUser().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
          <Link href="/auth/login">{t.common.signIn}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">{t.common.signUp}</Link>
        </Button>
      </div>
    );
  }

  const email = typeof user.email === "string" ? user.email : "";
  return <UserMenu email={email} t={t} />;
}
