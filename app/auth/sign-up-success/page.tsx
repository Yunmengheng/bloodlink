import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Confirm your email" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t.auth.signUpSuccessTitle}
      subtitle={t.auth.signUpSuccessBody}
      footer={
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t.common.signIn}
        </Link>
      }
    >
      <div />
    </AuthShell>
  );
}
