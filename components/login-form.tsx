"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Toast } from "@/components/toast";
import type { Dictionary } from "@/lib/i18n";

export function LoginForm({ t }: { t: Dictionary }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    // Land on the donor-matching page: the most useful place after signing in.
    router.push("/for-you");
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
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

      <Field id="password" label={t.auth.password}>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Link
        href="/auth/forgot-password"
        className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {t.auth.forgotPassword}
      </Link>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t.auth.signingIn : t.common.signIn}
      </Button>
    </form>
  );
}
