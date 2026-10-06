"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Toast } from "@/components/toast";
import type { Dictionary } from "@/lib/i18n";

export function SignUpForm({ t }: { t: Dictionary }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError(t.auth.repeatPassword);
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/for-you` },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    router.push("/auth/sign-up-success");
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-5">
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
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field id="repeat-password" label={t.auth.repeatPassword}>
        <Input
          id="repeat-password"
          type="password"
          required
          autoComplete="new-password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t.auth.creatingAccount : t.common.signUp}
      </Button>
    </form>
  );
}
