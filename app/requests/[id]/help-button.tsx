"use client";

import { useActionState, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/toast";
import { respondToRequest, withdrawResponse } from "@/app/actions/responses";
import { translateKey, type ActionResult } from "@/lib/action-result";
import type { Dictionary } from "@/lib/i18n";

/** "I can help" with an optional message, shown only when the donor qualifies. */
export function HelpButton({
  requestId,
  t,
}: {
  requestId: string;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    respondToRequest,
    null,
  );
  const [open, setOpen] = useState(false);

  if (state?.ok) {
    return <Toast tone="success">{t.help.thanks}</Toast>;
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="request_id" value={requestId} />

      {state && !state.ok ? (
        <Toast tone="error">{translateKey(state.error, t)}</Toast>
      ) : null}

      {open ? (
        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-foreground"
          >
            {t.help.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={200}
            placeholder={t.help.messagePlaceholder}
            className="w-full rounded-input border border-border bg-surface px-3.5 py-3 text-base shadow-soft placeholder:text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" size="lg" className="flex-1" disabled={pending}>
          <HeartHandshake strokeWidth={1.75} />
          {pending ? t.help.sending : t.help.iCanHelp}
        </Button>
        {!open ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => setOpen(true)}
          >
            {t.help.messageLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/** Withdraw an offer already made. */
export function WithdrawButton({
  requestId,
  t,
}: {
  requestId: string;
  t: Dictionary;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  if (result?.ok) return <Toast tone="success">{t.help.withdrawn}</Toast>;

  return (
    <div className="space-y-3">
      {result && !result.ok ? (
        <Toast tone="error">{translateKey(result.error, t)}</Toast>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setResult(await withdrawResponse(requestId));
          setPending(false);
        }}
      >
        {pending ? t.common.loading : t.help.withdraw}
      </Button>
    </div>
  );
}
