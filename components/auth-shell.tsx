import { BloodDrop } from "@/components/brand/blood-drop";

/** Shared frame for every auth page: centred card with the drop mark on top. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-card border border-border bg-surface p-6 shadow-soft sm:p-8">
        <BloodDrop size="md" />
        <h1 className="mt-4 text-lg font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-subtle">{subtitle}</p>
        ) : null}

        <div className="mt-6">{children}</div>
      </div>

      {footer ? (
        <p className="mt-5 text-center text-sm text-subtle">{footer}</p>
      ) : null}
    </div>
  );
}
