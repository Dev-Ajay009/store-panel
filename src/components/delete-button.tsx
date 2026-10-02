"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProductAction } from "@/app/(panel)/products/actions";
import { ConfirmButton } from "./confirm-button";
import { useToast } from "./toast";

type Props = {
  id: string;
  name: string;
  redirectToList?: boolean;
  compact?: boolean;
};

export function DeleteButton({
  id,
  name,
  redirectToList = false,
  compact = false,
}: Props) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      showToast(`${name} was deleted`);
      if (redirectToList) router.push("/products");
    });
  }

  return (
    <ConfirmButton
      label={pending ? "Deleting…" : "Delete"}
      disabled={pending}
      className={`btn btn-danger-outline ${compact ? "btn-sm" : ""}`}
      title="Delete product?"
      message={`${name} will be removed permanently. This can't be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  );
}
