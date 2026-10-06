import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { AuthShell } from "@/components/auth-shell";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Sign in" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t.auth.signInTitle}
      subtitle={t.auth.signInSubtitle}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t.common.signUp}
          </Link>
        </>
      }
    >
      <LoginForm t={t} />
    </AuthShell>
  );
}
