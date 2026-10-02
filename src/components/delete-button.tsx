"use client";

import { useRef, useState, useTransition } from "react";
import { deleteProductAction } from "@/app/(panel)/products/actions";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const titleId = `delete-title-${id}`;

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function confirm() {
    startTransition(async () => {
      const result = await deleteProductAction(id, redirectToList);
      if (result?.error) {
        setError(result.error);
        return;
      }
      dialogRef.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`btn border border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:outline-red-600 ${
          compact ? "px-2.5 py-1 text-xs" : ""
        }`}
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="p-5">
          <h2 id={titleId} className="text-base font-semibold">
            Delete product?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            <strong className="font-medium text-gray-900">{name}</strong> will
            be removed permanently. This can&apos;t be undone.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirm}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
