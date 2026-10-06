import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Toast } from "@/components/toast";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Something went wrong" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { t } = await getI18n();
  const { error } = await searchParams;

  return (
    <AuthShell
      title={t.auth.errorTitle}
      footer={
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t.common.signIn}
        </Link>
      }
    >
      <Toast tone="error">{error ?? t.common.somethingWentWrong}</Toast>
    </AuthShell>
  );
}
