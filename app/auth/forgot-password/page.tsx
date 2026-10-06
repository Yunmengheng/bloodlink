import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell } from "@/components/auth-shell";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Reset password" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t.auth.forgotTitle}
      subtitle={t.auth.forgotSubtitle}
      footer={
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t.common.signIn}
        </Link>
      }
    >
      <ForgotPasswordForm t={t} />
    </AuthShell>
  );
}
