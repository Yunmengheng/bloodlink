import { redirect } from "next/navigation";
import { RequestForm } from "./request-form";
import { getCurrentUserId } from "@/lib/queries";
import { getI18n } from "@/lib/i18n";

export const metadata = { title: "Post a blood request" };

export default async function NewRequestPage() {
  const { lang, t } = await getI18n();

  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t.newRequest.title}
      </h1>
      <p className="mt-1.5 text-sm text-subtle">{t.newRequest.subtitle}</p>

      <div className="mt-6">
        <RequestForm t={t} lang={lang} />
      </div>
    </div>
  );
}
