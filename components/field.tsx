import { cn } from "@/lib/utils";

/** Labelled form field with helper text and an inline error. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  optionalLabel,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-sm font-semibold text-foreground"
      >
        {label}
        {optional ? (
          <span className="text-xs font-normal text-subtle">
            {optionalLabel}
          </span>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-critical-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Section heading inside a long form. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-subtle">{description}</p>
      ) : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
