"use client";

import type { ProductStatus } from "@prisma/client";
import { useOptimistic, useTransition } from "react";
import { changeStatusAction } from "@/app/(panel)/products/actions";
import { StatusBadge } from "./status-badge";
import { useToast } from "./toast";

type Props = {
  id: string;
  status: ProductStatus;
  compact?: boolean;
};

export function StatusToggle({ id, status, compact = false }: Props) {
  const showToast = useToast();
  const [, startTransition] = useTransition();
  const [currentStatus, setOptimisticStatus] = useOptimistic(status);
  const nextStatus: ProductStatus =
    currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  function handleClick() {
    startTransition(async () => {
      setOptimisticStatus(nextStatus);
      const result = await changeStatusAction(id, nextStatus);
      if (result.error) showToast(result.error, "error");
      else showToast("Status updated");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={currentStatus} />
      <button
        type="button"
        onClick={handleClick}
        className={`btn btn-secondary ${compact ? "btn-sm" : ""}`}
      >
        {nextStatus === "ACTIVE" ? "Activate" : "Deactivate"}
      </button>
    </div>
  );
}
