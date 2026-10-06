import Link from "next/link";
import { SignUpForm } from "@/components/sign-up-form";
import { AuthShell } from "@/components/auth-shell";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Sign up" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t.auth.signUpTitle}
      subtitle={t.auth.signUpSubtitle}
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t.common.signIn}
          </Link>
        </>
      }
    >
      <SignUpForm t={t} />
    </AuthShell>
  );
}
