"use client";

import { useEffect } from "react";

export default function PanelError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="card mx-auto max-w-md p-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">
        We couldn&apos;t load this page. This is usually temporary, so please try again.
      </p>
      <button type="button" onClick={retry} className="btn btn-primary mt-4">
        Try again
      </button>
    </div>
  );
}
