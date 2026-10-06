"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Toast } from "@/components/toast";
import type { Dictionary } from "@/lib/i18n";

export function ForgotPasswordForm({ t }: { t: Dictionary }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) setError(error.message);
    else setSent(true);
    setIsLoading(false);
  };

  // Deliberately the same message whether or not the account exists, so this
  // page cannot be used to discover which emails are registered.
  if (sent) return <Toast tone="success">{t.auth.checkEmailBody}</Toast>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Toast tone="error">{error}</Toast> : null}

      <Field id="email" label={t.auth.email}>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t.auth.sending : t.auth.sendResetEmail}
      </Button>
    </form>
  );
}
