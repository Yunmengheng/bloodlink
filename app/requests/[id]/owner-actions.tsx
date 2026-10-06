"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/toast";
import { cancelRequest, markFulfilled } from "@/app/actions/requests";
import { translateKey, type ActionResult } from "@/lib/action-result";
import type { Dictionary } from "@/lib/i18n";

/** Mark fulfilled / cancel, with a confirm step because both are one-way. */
export function OwnerActions({
  requestId,
  t,
}: {
  requestId: string;
  t: Dictionary;
}) {
  const [pending, setPending] = useState<"fulfil" | "cancel" | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const run = async (
    kind: "fulfil" | "cancel",
    confirmText: string,
    fn: (id: string) => Promise<ActionResult>,
  ) => {
    if (!window.confirm(confirmText)) return;
    setPending(kind);
    setResult(await fn(requestId));
    setPending(null);
  };

  return (
    <div className="space-y-3">
      {result && !result.ok ? (
        <Toast tone="error">{translateKey(result.error, t)}</Toast>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          disabled={pending !== null}
          onClick={() =>
            run("fulfil", t.request.confirmFulfilled, markFulfilled)
          }
        >
          <CheckCircle2 strokeWidth={1.75} />
          {pending === "fulfil" ? t.common.saving : t.request.markFulfilled}
        </Button>

        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => run("cancel", t.request.confirmCancel, cancelRequest)}
        >
          <XCircle strokeWidth={1.75} />
          {pending === "cancel" ? t.common.saving : t.request.cancelRequest}
        </Button>
      </div>
    </div>
  );
}
