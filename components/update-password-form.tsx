"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Toast } from "@/components/toast";
import type { Dictionary } from "@/lib/i18n";

export function UpdatePasswordForm({ t }: { t: Dictionary }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    router.push("/for-you");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Toast tone="error">{error}</Toast> : null}

      <Field id="password" label={t.auth.newPassword}>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t.common.saving : t.auth.saveNewPassword}
      </Button>
    </form>
  );
}
