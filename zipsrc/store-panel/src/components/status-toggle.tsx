"use client";

import type { ProductStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { changeStatusAction } from "@/app/(panel)/products/actions";

type Props = {
  id: string;
  status: ProductStatus;
  compact?: boolean;
};

export function StatusToggle({ id, status, compact = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next: ProductStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await changeStatusAction(id, next);
      if (result.error) setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`btn btn-secondary ${compact ? "px-2.5 py-1 text-xs" : ""}`}
      >
        {pending ? "Saving…" : next === "ACTIVE" ? "Activate" : "Deactivate"}
      </button>
      {error && (
        <span role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
