import { UpdatePasswordForm } from "@/components/update-password-form";
import { AuthShell } from "@/components/auth-shell";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "New password" };

export default async function Page() {
  const { t } = await getI18n();
  return (
    <AuthShell title={t.auth.forgotTitle}>
      <UpdatePasswordForm t={t} />
    </AuthShell>
  );
}
